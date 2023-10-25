use axum::{extract::State, response::IntoResponse, routing::get, Extension, Json, Router};
use http::StatusCode;
use mysql_async::Pool;
use tower::ServiceBuilder;

use crate::{
    auth::{AuthGuardLayer, Claims, JwTokenReaderLayer},
    users::User,
};

pub use self::model::Family;

mod model;
pub struct FamilyRouter(Router);

#[derive(Debug, Clone)]
struct FamilyRouterState {
    pool: Pool,
}

impl FamilyRouter {
    pub fn new(pool: Pool) -> Self {
        Self(
            Router::new()
                .route("/", get(show_users_families))
                .layer(
                    ServiceBuilder::new()
                        .layer(JwTokenReaderLayer)
                        .layer(AuthGuardLayer),
                )
                .with_state(FamilyRouterState { pool }),
        )
    }
}

impl Into<Router> for FamilyRouter {
    fn into(self) -> Router {
        self.0
    }
}

async fn show_users_families(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Extension(user): Extension<Claims>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = user.sub;

    let conn = pool
        .get_conn()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let families = User::families(conn, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(families))
}
