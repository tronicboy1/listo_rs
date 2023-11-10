use std::net::SocketAddr;

use axum::{routing::get, Router};
use listo_rs::{
    auth::{AuthRouter, JwTokenReaderLayer},
    families::FamilyRouter,
    images::ImagesRouter,
    lists::ListRouter,
    views::ViewRouter,
    ws::handle_ws_req,
    AppState,
};
use tower_http::{compression::CompressionLayer, services::ServeDir};

#[tokio::main]
async fn main() {
    let state = AppState::new();

    let serve_dir = ServeDir::new("assets");
    let serve_cname = ServeDir::new("pki-validation");

    // build our application with a single route
    let app = Router::new()
        .route("/ws", get(handle_ws_req))
        .route_layer(JwTokenReaderLayer)
        .with_state(state.clone())
        .merge(ViewRouter::new(state.pool.clone()))
        .nest("/api/v1/auth", AuthRouter::new(state.pool.clone()).into())
        .nest("/images", ImagesRouter::new().into())
        .nest(
            "/api/v1/lists",
            ListRouter::new(state.pool.clone(), state.new_item_tx.clone()).into(),
        )
        .nest(
            "/api/v1/families",
            FamilyRouter::new(state.pool.clone()).into(),
        )
        .nest_service("/assets", serve_dir)
        .nest_service("/.well-known/pki-validation", serve_cname)
        .layer(CompressionLayer::new());

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
