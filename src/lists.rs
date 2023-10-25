use std::sync::Arc;

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

use crate::auth::{AuthGuardLayer, Claims, JwTokenReaderLayer};

use self::{
    guard::ListGuardLayer,
    model::{Item, List},
};

mod guard;
mod model;

pub struct ListRouter(Router);

struct ListState {
    pool: Pool,
}

impl Into<Router> for ListRouter {
    fn into(self) -> Router {
        self.0
    }
}

impl ListRouter {
    pub fn new(pool: Pool) -> Self {
        let state = ListState::new(pool);
        Self(
            Router::new()
                .route("/", get(get_lists))
                .route("/:list_id", get(get_list))
                .route("/:list_id/items", get(get_list_items))
                .route("/:list_id/items", post(add_item))
                .route("/:list_id/items/:item_id", delete(delete_item))
                .route_layer(ListGuardLayer::new(state.pool.clone()))
                .layer(
                    ServiceBuilder::new()
                        .layer(JwTokenReaderLayer)
                        .layer(AuthGuardLayer),
                )
                .with_state(state),
        )
    }
}

impl ListState {
    fn new(pool: Pool) -> Arc<Self> {
        Arc::new(Self { pool: pool.clone() })
    }
}

async fn get_lists(
    State(state): State<Arc<ListState>>,
    Extension(user): Extension<Claims>,
) -> Result<impl IntoResponse, StatusCode> {
    let lists = List::paginate(state.pool.clone(), user.sub)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(lists))
}

async fn get_list(
    State(state): State<Arc<ListState>>,
    Path(list_id): Path<u64>,
) -> Result<axum::response::Response, StatusCode> {
    let conn = state
        .pool
        .get_conn()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let result = List::get(conn, list_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(match result {
        Some(list) => Json(list).into_response(),
        None => StatusCode::NOT_FOUND.into_response(),
    })
}

async fn get_list_items(
    State(state): State<Arc<ListState>>,
    Path(list_id): Path<u64>,
) -> Result<axum::response::Response, StatusCode> {
    let conn = state
        .pool
        .get_conn()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let result = List::get(conn, list_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.is_none() {
        return Ok(StatusCode::NOT_FOUND.into_response());
    }

    let items = Item::get_by_list(state.pool.clone(), list_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(items).into_response())
}

#[derive(Deserialize)]
struct ItemParams {
    name: String,
}

async fn add_item(
    State(state): State<Arc<ListState>>,
    Path(list_id): Path<u64>,
    Json(ItemParams { name }): Json<ItemParams>,
) -> impl IntoResponse {
    let item = Item::new(list_id, name);

    item.insert(state.pool.clone())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn delete_item(
    State(state): State<Arc<ListState>>,
    Path((_, item_id)): Path<(u64, u64)>,
) -> impl IntoResponse {
    let item = Item::get(state.pool.clone(), item_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if item.is_none() {
        return Ok(StatusCode::NOT_FOUND);
    }

    match Item::delete(state.pool.clone(), item_id).await {
        Ok(_) => Ok(StatusCode::OK),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
