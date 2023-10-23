const SECRET_KEY: &'static [u8] = b"my-secret";

use std::sync::Arc;

use axum::{
    http::StatusCode,
    response::{AppendHeaders, IntoResponse},
    routing::post,
    Json, Router,
};
use cookie::Cookie;
use http::header::SET_COOKIE;
use jsonwebtoken::{encode, EncodingKey};
use serde::{Deserialize, Serialize};
pub struct AuthRouter(Router);

mod auth_service;

pub use auth_service::JwTokenLayer;

struct AuthState {}

impl AuthState {
    fn new() -> Arc<Self> {
        Arc::new(Self {})
    }
}

impl AuthRouter {
    pub fn new() -> Self {
        Self(Router::new().route("/register", post(create_user).with_state(AuthState::new())))
    }
}

impl Into<Router> for AuthRouter {
    fn into(self) -> Router {
        self.0
    }
}

#[derive(Deserialize)]
struct NewUser {
    username: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    sub: String,
    exp: usize,
    iss: String,
}

async fn create_user(
    Json(NewUser { username }): Json<NewUser>,
) -> Result<impl IntoResponse, StatusCode> {
    println!("{}", username);

    let claim = Claims {
        sub: username,
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
