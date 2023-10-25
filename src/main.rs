use std::net::SocketAddr;

use axum::{response::AppendHeaders, routing::get, Router};
use listo_rs::{
    auth::AuthRouter, families::FamilyRouter, images::ImagesRouter, lists::ListRouter, AppState,
};

#[tokio::main]
async fn main() {
    let state = AppState::new();

    // build our application with a single route
    let app = Router::new()
        .route(
            "/",
            get(|| async {
                let template = tokio::fs::read_to_string("src/assets/home.html")
                    .await
                    .unwrap();

                (
                    AppendHeaders([("Content-Type", "text/html; charset=utf-8")]),
                    template,
                )
            }),
        )
        .with_state(state.clone())
        .nest("/auth", AuthRouter::new().into())
        .nest("/images", ImagesRouter::new().into())
        .nest("/lists", ListRouter::new(state.pool.clone()).into())
        .nest("/families", FamilyRouter::new(state.pool.clone()).into());

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
