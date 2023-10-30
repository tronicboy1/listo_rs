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

    let port: u16 = std::env::var("PORT")
        .unwrap_or(String::from("3000"))
        .parse()
        .expect("invalid port");

    let addr = std::env::var("ADDRESS")
        .ok()
        .and_then(|add| add.parse::<SocketAddr>().ok())
        .unwrap_or(SocketAddr::from(([0, 0, 0, 0], port)));

    // Can use oneshot to gracefully shutdown
    let (_shutdown_tx, rx) = tokio::sync::oneshot::channel::<()>();

    // run it with hyper on localhost:3000
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(async move { rx.await.unwrap() })
        .await
        .unwrap();
}
