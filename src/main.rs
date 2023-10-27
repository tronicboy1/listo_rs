use std::net::SocketAddr;

use axum::Router;
use listo_rs::{
    auth::AuthRouter, families::FamilyRouter, images::ImagesRouter, lists::ListRouter,
    views::ViewRouter, AppState,
};
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    let state = AppState::new();

    let serve_dir = ServeDir::new("assets");

    // build our application with a single route
    let app = Router::new()
        .merge(ViewRouter::new(state.pool.clone()))
        .nest("/api/v1/auth", AuthRouter::new(state.pool.clone()).into())
        .nest("/images", ImagesRouter::new().into())
        .nest("/api/v1/lists", ListRouter::new(state.pool.clone()).into())
        .nest(
            "/api/v1/families",
            FamilyRouter::new(state.pool.clone()).into(),
        )
        .nest_service("/assets", serve_dir);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));

    // Can use oneshot to gracefully shutdown
    let (_shutdown_tx, rx) = tokio::sync::oneshot::channel::<()>();

    // run it with hyper on localhost:3000
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(async move { rx.await.unwrap() })
        .await
        .unwrap();
}
