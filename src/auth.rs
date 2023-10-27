const SECRET_KEY: &'static [u8] = b"my-secret";

use axum::{
    extract::State,
    http::StatusCode,
    response::{AppendHeaders, IntoResponse},
    routing::post,
    Json, Router,
};
use cookie::Cookie;
use http::header::SET_COOKIE;
use jsonwebtoken::{encode, EncodingKey};
use mysql_async::Pool;
use serde::{Deserialize, Serialize};
pub struct AuthRouter(Router);

mod token_guard;
mod token_reader;

pub use token_guard::AuthGuardLayer;
pub use token_reader::JwTokenReaderLayer;

use crate::{get_conn, users::User};

#[derive(Debug, Clone)]
struct AuthState {
    pool: Pool,
}

impl AuthState {
    fn new(pool: Pool) -> Self {
        Self { pool }
    }
}

impl AuthRouter {
    pub fn new(pool: Pool) -> Self {
        Self(
            Router::new()
                .route("/register", post(create_user))
                .route("/login", post(login))
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

    fn token(&self) -> Result<String, jsonwebtoken::errors::Error> {
        encode(
            &jsonwebtoken::Header::default(),
            &self,
            &EncodingKey::from_secret(SECRET_KEY),
        )
    }
}

#[derive(Deserialize)]
struct UserBody {
    password: String,
    email: String,
}

async fn create_user(
    State(AuthState { pool }): State<AuthState>,
    Json(UserBody { email, password }): Json<UserBody>,
) -> Result<impl IntoResponse, StatusCode> {
    let user = User::new(email, password).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut conn = get_conn!(pool)?;
    let user_id = user
        .insert(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let claim = Claims::new(user_id);

    let token = claim
        .token()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let cookie: Cookie = Cookie::build(("jwt", token)).path("/").into();

    Ok((
        StatusCode::CREATED,
        AppendHeaders([(SET_COOKIE, cookie.to_string())]),
    ))
}

async fn login(
    State(AuthState { pool }): State<AuthState>,
    Json(UserBody { email, password }): Json<UserBody>,
) -> Result<axum::response::Response, StatusCode> {
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

            let token = claim
                .token()
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let cookie: Cookie = Cookie::build(("jwt", token)).path("/").into();

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

#[cfg(test)]
mod tests {}
