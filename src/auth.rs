const SECRET_KEY: &'static [u8] = b"my-secret";

use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    response::{AppendHeaders, IntoResponse, Redirect, Response},
    routing::{get, post},
    Json, Router,
};
use cookie::{
    time::{Duration, OffsetDateTime},
    Cookie,
};
use http::{header::SET_COOKIE, HeaderMap};
use jsonwebtoken::{encode, EncodingKey};
use mysql_async::Pool;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;
pub struct AuthRouter(Router);

mod token_guard;
mod token_reader;

pub use token_guard::AuthGuardLayer;
pub use token_reader::JwTokenReaderLayer;
use url::Url;
use webauthn_rs::{
    prelude::{PublicKeyCredential, RegisterPublicKeyCredential},
    Webauthn, WebauthnBuilder,
};

use crate::{get_conn, users::User};

#[derive(Clone)]
struct AuthState {
    pool: Pool,
    webauthn: Arc<Webauthn>,
    encoding_key: EncodingKey,
}

impl AuthState {
    fn new(pool: Pool) -> Self {
        let domain = std::env::var("DOMAIN");
        let domain = domain.as_ref().map(|s| s.as_str()).unwrap_or("localhost");

        let origin: Url = std::env::var("ORIGIN")
            .as_ref()
            .map(|s| s.as_str())
            .unwrap_or("http://localhost:3000")
            .parse()
            .expect("invalid ORIGIN provided");

        let webauthn_builder = WebauthnBuilder::new(domain, &origin)
            .expect("invalid config webauthn")
            .rp_name("Listor RS");

        let webauthn = Arc::new(webauthn_builder.build().expect("Invalid webauthn config"));

        let secret_key = match std::env::var("JWT_SECRET_KEY") {
            Ok(key) => key.as_bytes().to_owned(),
            Err(_) => SECRET_KEY.to_owned(),
        };
        let encoding_key = EncodingKey::from_secret(&secret_key);

        Self {
            pool,
            webauthn,
            encoding_key,
        }
    }
}

impl AuthRouter {
    pub fn new(pool: Pool) -> Self {
        Self(
            Router::new()
                .route("/register", post(create_user))
                .route("/login", post(login))
                .route(
                    "/logout",
                    get(|| async {
                        let clear_cookie = Cookie::build(("jwt", "logout"))
                            .expires(OffsetDateTime::now_utc())
                            .path("/")
                            .to_string();
                        (
                            AppendHeaders([(SET_COOKIE, clear_cookie)]),
                            Redirect::to("/login"),
                        )
                    }),
                )
                .route("/webauthn/registration/start", post(webauthn_start_reg))
                .route("/webauthn/registration/finish", post(webauthn_finish_reg))
                .route("/webauthn/start", post(webauthn_start_auth))
                .route("/webauthn/finish", post(webauthn_finish_auth))
                .with_state(AuthState::new(pool)),
        )
    }
}

impl Into<Router> for AuthRouter {
    fn into(self) -> Router {
        self.0
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: u64,
    exp: usize,
    iss: String,
}

impl Claims {
    fn new(user_id: u64) -> Self {
        Self {
            sub: user_id,
            exp: 1000000000000,
            iss: String::from("listo_rs"),
        }
    }

    pub fn to_cookie<'a>(&self, encoding_key: &EncodingKey) -> anyhow::Result<Cookie<'a>> {
        let token = encode(&jsonwebtoken::Header::default(), &self, encoding_key)?;

        let mut week_from_now = time::OffsetDateTime::now_utc();
        week_from_now += time::Duration::days(7);

        let c = Cookie::build(("jwt", token))
            .path("/")
            .http_only(true)
            .same_site(cookie::SameSite::Strict)
            .expires(week_from_now)
            .build();

        Ok(c)
    }
}

#[derive(Deserialize, Validate)]
struct UserBody {
    password: String,
    #[validate(email)]
    email: String,
    token: String,
}

impl TryFrom<UserBody> for User {
    type Error = argon2::password_hash::Error;

    fn try_from(value: UserBody) -> Result<Self, Self::Error> {
        User::new(value.email, value.password)
    }
}

macro_rules! return_400_if_bad_recaptcha {
    ($token: expr) => {
        let valid = verify_recaptcha_token($token)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        if !valid {
            return Ok(StatusCode::BAD_REQUEST.into_response());
        }
    };
}

async fn create_user(
    State(AuthState {
        pool, encoding_key, ..
    }): State<AuthState>,
    Json(user_body): Json<UserBody>,
) -> Result<axum::response::Response, StatusCode> {
    return_400_if_bad_recaptcha!(&user_body.token);

    let is_valid = user_body.validate().is_ok();
    let password_valid = user_body.password.bytes().count() > 7;

    if !(is_valid && password_valid) {
        return Ok(StatusCode::BAD_REQUEST.into_response());
    }

    let mut conn = get_conn!(pool)?;
    let user_exists = User::get_by_email(&mut conn, &user_body.email)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if user_exists.is_some() {
        return Ok(StatusCode::BAD_REQUEST.into_response());
    }

    let user = User::try_from(user_body).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let user_id = user
        .insert(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let claim = Claims::new(user_id);

    let cookie = claim.to_cookie(&encoding_key).unwrap();

    Ok((
        StatusCode::CREATED,
        AppendHeaders([(SET_COOKIE, cookie.to_string())]),
    )
        .into_response())
}

async fn login(
    State(AuthState {
        pool, encoding_key, ..
    }): State<AuthState>,
    Json(UserBody {
        email,
        password,
        token,
    }): Json<UserBody>,
) -> Result<axum::response::Response, StatusCode> {
    return_400_if_bad_recaptcha!(&token);

    let mut conn = get_conn!(pool)?;
    let user = User::get_by_email(&mut conn, &email)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if let Some(user) = user {
        let password_valid = user
            .confirm_password(&password)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        if password_valid {
            let claim = Claims::new(user.user_id);

            let cookie = claim.to_cookie(&encoding_key).unwrap();

            Ok((
                StatusCode::OK,
                AppendHeaders([(SET_COOKIE, cookie.to_string())]),
            )
                .into_response())
        } else {
            Ok(StatusCode::BAD_REQUEST.into_response())
        }
    } else {
        Ok(StatusCode::BAD_REQUEST.into_response())
    }
}

#[derive(Deserialize)]
struct RecaptchaResponse {
    success: bool,
}

async fn verify_recaptcha_token(token: &str) -> Result<bool, Box<dyn std::error::Error>> {
    let recapthca_secret = std::env::var("RECAPTCHA_SECRET_KEY")?;

    let params = [("secret", recapthca_secret.as_str()), ("response", token)];

    let client = reqwest::Client::new();
    let res = client
        .post("https://www.google.com/recaptcha/api/siteverify")
        .form(&params)
        .send()
        .await?;

    let RecaptchaResponse { success } = res.json::<RecaptchaResponse>().await?;

    Ok(success)
}

#[derive(Debug, Deserialize)]
struct WebauthnOptionsBody {
    email: String,
}
async fn webauthn_start_reg(
    State(AuthState {
        pool,
        webauthn,
        encoding_key,
    }): State<AuthState>,
    Json(UserBody {
        email,
        password,
        token,
    }): Json<UserBody>,
) -> Result<axum::response::Response, StatusCode> {
    return_400_if_bad_recaptcha!(&token);

    let mut conn = pool.get_conn().await.expect("sql error");
    let user_exists = User::get_by_email(&mut conn, &email)
        .await
        .expect("sql error");

    // if account already exists
    let (user_id, uuid) = if let Some(mut user) = user_exists {
        // If user exists, must check that passwords match
        let password_valid = user
            .confirm_password(&password)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        if !password_valid {
            return Ok((StatusCode::UNAUTHORIZED, "invalid password").into_response());
        }

        let user_id = user.user_id;

        // add uuid if upgrading to webauthn and Uuid not available
        let uuid = if let Some(uuid) = user.uuid {
            uuid
        } else {
            let uuid = Uuid::new_v4();
            user.uuid = Some(uuid);

            user.update(&mut conn).await.expect("Sql error on update");

            uuid
        };

        (user_id, uuid)
    } else {
        let uuid = Uuid::new_v4();
        let user = User::new_webauthn(&email, password, &uuid);
        let user_id = user.insert(&mut conn).await.expect("could not create user");

        (user_id, uuid)
    };

    let res = match webauthn.start_passkey_registration(uuid, &email, &email, None) {
        Ok((ccr, state)) => {
            User::set_reg_passkey(&mut conn, user_id, &state)
                .await
                .expect("Sql error");

            (
                AppendHeaders([(SET_COOKIE, create_temp_user_id_cookie(user_id))]),
                Json(ccr),
            )
        }
        Err(error) => {
            dbg!(error);
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    Ok(res.into_response())
}

async fn webauthn_finish_reg(
    State(AuthState {
        pool,
        webauthn,
        encoding_key,
    }): State<AuthState>,
    headers: HeaderMap,
    Json(reg): Json<RegisterPublicKeyCredential>,
) -> Response {
    let user_id = get_user_id_from_cookies(&headers);

    if let Some(user_id) = user_id {
        let mut conn = pool.get_conn().await.expect("Sql Error");

        let passkey = User::get_reg_passkey(&mut conn, user_id)
            .await
            .expect("Sql Error");

        if let Some(passkey) = passkey {
            return match webauthn.finish_passkey_registration(&reg, &passkey) {
                Ok(sk) => {
                    User::set_passkey(&mut conn, user_id, &sk)
                        .await
                        .expect("Sql Error");
                    let mut user = User::get_by_id(&mut conn, user_id)
                        .await
                        .expect("sql error")
                        .expect("user must was deleted");

                    user.is_temp = false;

                    user.update(&mut conn).await.expect("sql error");

                    let claim = Claims::new(user_id);
                    let cookie = claim.to_cookie(&encoding_key).unwrap();

                    (
                        StatusCode::OK,
                        AppendHeaders([(SET_COOKIE, cookie.to_string())]),
                    )
                        .into_response()
                }
                Err(error) => {
                    dbg!(error);
                    StatusCode::BAD_REQUEST.into_response()
                }
            };
        }
    }

    StatusCode::BAD_REQUEST.into_response()
}

async fn webauthn_start_auth(
    State(AuthState { pool, webauthn, .. }): State<AuthState>,
    Json(WebauthnOptionsBody { email }): Json<WebauthnOptionsBody>,
) -> axum::response::Response {
    let mut conn = pool.get_conn().await.expect("sql error");

    let user_exists = User::get_by_email(&mut conn, &email)
        .await
        .expect("sql error");

    if user_exists.is_none() {
        return StatusCode::BAD_REQUEST.into_response();
    }

    let user = user_exists.unwrap();

    let passkey = User::get_passkey(&mut conn, user.user_id)
        .await
        .expect("Sql Error")
        .expect("Registration Failed");
    let passkey = vec![passkey];

    let res = webauthn.start_passkey_authentication(&passkey);

    match res {
        Ok((rcr, passkey)) => {
            User::set_auth_passkey(&mut conn, user.user_id, &passkey)
                .await
                .expect("sql failed to set passkey");

            (
                AppendHeaders([(SET_COOKIE, create_temp_user_id_cookie(user.user_id))]),
                Json(rcr),
            )
                .into_response()
        }
        Err(err) => {
            dbg!(err);
            StatusCode::UNAUTHORIZED.into_response()
        }
    }
}

async fn webauthn_finish_auth(
    State(AuthState {
        pool,
        webauthn,
        encoding_key,
    }): State<AuthState>,
    headers: HeaderMap,
    Json(auth): Json<PublicKeyCredential>,
) -> axum::response::Response {
    let user_id = get_user_id_from_cookies(&headers);
    if let Some(user_id) = user_id {
        let mut conn = pool.get_conn().await.expect("Sql Error");

        let passkey = User::get_auth_passkey(&mut conn, user_id)
            .await
            .expect("Sql Error");

        if let Some(passkey) = passkey {
            return match webauthn.finish_passkey_authentication(&auth, &passkey) {
                Ok(_result) => {
                    // TODO check login count
                    // TODO increment counter

                    let claim = Claims::new(user_id);
                    let cookie = claim.to_cookie(&encoding_key).unwrap().to_string();

                    (StatusCode::OK, AppendHeaders([(SET_COOKIE, cookie)])).into_response()
                }
                Err(err) => {
                    dbg!(err);
                    StatusCode::UNAUTHORIZED.into_response()
                }
            };
        }
    }

    StatusCode::UNAUTHORIZED.into_response()
}

/// Creates a cookie that stores the user id for access between webauthn requests
/// so the server can check that challenges are the same
fn create_temp_user_id_cookie(user_id: u64) -> String {
    Cookie::build(("temp_user_id", user_id.to_string()))
        .path("/api/v1/auth/")
        .max_age(Duration::minutes(5))
        .to_string()
}

fn get_user_id_from_cookies(headers: &HeaderMap) -> Option<u64> {
    headers
        .get("Cookie")
        .and_then(|cookie| cookie.to_str().ok())
        .and_then(|cookies| {
            Cookie::split_parse(cookies)
                .filter_map(|cookie| cookie.ok())
                .find(|cookie| cookie.name() == "temp_user_id")
        })
        .and_then(|cookie| cookie.value().parse::<u64>().ok())
}

#[cfg(test)]
mod tests {
    use validator::Validate;

    use super::UserBody;

    #[test]
    fn invalid_email() {
        let email = String::from("not-email");
        let password = String::from("password");

        let body = UserBody {
            password,
            email,
            token: String::new(),
        };

        assert!(body.validate().is_err());
    }

    #[test]
    fn invalid_password() {
        let email = String::from("email@mail.co");
        let password = String::from("pass");

        let body = UserBody {
            password,
            email,
            token: String::new(),
        };

        assert!(body.validate().is_err());
    }

    #[test]
    fn valid_body() {
        let email = String::from("email@mail.co");
        let password = String::from("password123");

        let body = UserBody {
            password,
            email,
            token: String::new(),
        };

        assert!(body.validate().is_ok());
    }
}
