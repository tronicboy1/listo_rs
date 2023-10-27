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
        Self(Router::new().route(
            "/register",
            post(create_user).with_state(AuthState::new(pool)),
        ))
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

#[derive(Deserialize)]
struct NewUser {
    password: String,
    email: String,
}

async fn create_user(
    State(AuthState { pool }): State<AuthState>,
    Json(NewUser { email, password }): Json<NewUser>,
) -> Result<impl IntoResponse, StatusCode> {
    let user = User::new(email, password).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut conn = get_conn!(pool)?;
    let user_id = user
        .insert(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let claim = Claims {
        sub: user_id,
        exp: 1000000000000,
        iss: String::from("listo_rs"),
    };

    let token = encode(
        &jsonwebtoken::Header::default(),
        &claim,
        &EncodingKey::from_secret(SECRET_KEY),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let cookie: Cookie = Cookie::build(("jwt", token)).path("/").into();

    Ok((
        StatusCode::CREATED,
        AppendHeaders([(SET_COOKIE, cookie.to_string())]),
        Json(42),
    ))
}

#[cfg(test)]
mod tests {}
