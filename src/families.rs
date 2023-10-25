use axum::{
    extract::{Path, State},
    response::IntoResponse,
    routing::{delete, get, post},
    Extension, Json, Router,
};
use http::StatusCode;
use mysql_async::Pool;
use serde::Deserialize;
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
                .route("/:family_id/members", get(show_family_members))
                .route("/:family_id/members", post(add_member))
                .route("/:family_id/members/:user_id", delete(remove_member))
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

async fn show_family_members(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Path(family_id): Path<u64>,
) -> Result<impl IntoResponse, StatusCode> {
    let conn = pool
        .get_conn()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let members = Family::members(conn, family_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(members))
}

#[derive(Debug, Deserialize)]
struct AddMemberBody {
    user_id: u64,
}

async fn add_member(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Path(family_id): Path<u64>,
    Json(AddMemberBody { user_id }): Json<AddMemberBody>,
) -> Result<impl IntoResponse, StatusCode> {
    let conn = pool
        .get_conn()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Family::add_member(conn, family_id, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn remove_member(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Path((family_id, user_id)): Path<(u64, u64)>,
) -> Result<axum::response::Response, StatusCode> {
    let conn = pool
        .get_conn()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let user_exists = User::get_by_id(pool, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .is_some();

    if !user_exists {
        return Ok(StatusCode::BAD_REQUEST.into_response());
    }

    Family::remove_member(conn, family_id, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
        .map(|res| res.into_response())
}
