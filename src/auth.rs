use std::sync::Arc;

use axum::{http::StatusCode, routing::post, Json, Router};
use serde::Deserialize;
pub struct AuthRouter(Router);

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

async fn create_user(Json(NewUser { username }): Json<NewUser>) -> (StatusCode, Json<u64>) {
    println!("{}", username);

    (StatusCode::CREATED, Json(42))
}
