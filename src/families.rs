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
    auth::{Claims, JwTokenReaderLayer},
    get_conn, map_internal_error,
    users::User,
    Insert,
};

use self::guard::FamiliesGuardLayer;
pub use self::model::Family;

mod guard;
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
                .route("/", post(new_family))
                .route("/:family_id", delete(delete_family))
                .route("/:family_id/members", get(show_family_members))
                .route("/:family_id/members", post(add_member))
                .route("/:family_id/members/:user_id", delete(remove_member))
                .layer(
                    ServiceBuilder::new()
                        .layer(JwTokenReaderLayer)
                        .layer(FamiliesGuardLayer::new(pool.clone())),
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

    let mut conn = get_conn!(pool)?;

    let families = User::families(&mut conn, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(families))
}

async fn show_family_members(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Path(family_id): Path<u64>,
) -> Result<impl IntoResponse, StatusCode> {
    let mut conn = get_conn!(pool)?;

    let members = Family::members(&mut conn, family_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(members))
}

#[derive(Debug, Deserialize)]
struct NewFamilyBody {
    family_name: String,
}

async fn new_family(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Extension(user): Extension<Claims>,
    Json(NewFamilyBody { family_name }): Json<NewFamilyBody>,
) -> Result<impl IntoResponse, StatusCode> {
    let mut conn = get_conn!(pool)?;

    let f = Family::new(family_name);
    let family_id = map_internal_error!(f.insert(&mut conn).await)?;

    map_internal_error!(Family::add_member(&mut conn, family_id, user.sub).await)?;

    Ok(())
}

async fn delete_family(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Path(family_id): Path<u64>,
) -> Result<impl IntoResponse, StatusCode> {
    let mut conn = get_conn!(pool)?;

    Family::destroy(&mut conn, family_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

#[derive(Debug, Deserialize)]
struct AddMemberBody {
    email: String,
}

async fn add_member(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Path(family_id): Path<u64>,
    Json(AddMemberBody { email }): Json<AddMemberBody>,
) -> Result<axum::response::Response, StatusCode> {
    let mut conn = get_conn!(pool)?;
    let user = User::get_by_email(&mut conn, &email)
        .await
        .expect("Sql Error");

    if user.is_none() {
        return Ok(StatusCode::BAD_REQUEST.into_response());
    }

    let User { user_id, .. } = user.unwrap();

    let is_member = Family::is_member(&mut conn, family_id, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if is_member {
        return Ok(StatusCode::BAD_REQUEST.into_response());
    }

    Family::add_member(&mut conn, family_id, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
        .map(|res| res.into_response())
}

async fn remove_member(
    State(FamilyRouterState { pool }): State<FamilyRouterState>,
    Path((family_id, user_id)): Path<(u64, u64)>,
) -> Result<axum::response::Response, StatusCode> {
    let mut conn = get_conn!(pool)?;
    let user_exists = User::get_by_id(&mut conn, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .is_some();

    if !user_exists {
        return Ok(StatusCode::BAD_REQUEST.into_response());
    }

    let is_member = Family::is_member(&mut conn, family_id, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !is_member {
        return Ok(StatusCode::BAD_REQUEST.into_response());
    }

    let members = Family::members(&mut conn, family_id)
        .await
        .expect("Sql Error");
    if members.iter().count() == 1 {
        return Ok(StatusCode::BAD_REQUEST.into_response());
    }

    Family::remove_member(&mut conn, family_id, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
        .map(|res| res.into_response())
}
