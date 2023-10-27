use std::net::SocketAddr;

use axum::{response::Html, routing::get, Router};
use listo_rs::{
    auth::AuthRouter,
    families::FamilyRouter,
    images::ImagesRouter,
    lists::ListRouter,
    views::{get_templates, ViewRouter},
    AppState,
};
use tera::Context;

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

                let mut context = Context::new();
                context.insert("name", "austin");

                let tera = get_templates();
                let html = tera.render("upload.html", &context).expect("render error");

                Html(html)
            }),
        )
        .with_state(state.clone())
        .merge(ViewRouter::new(state.pool.clone()))
        .nest("/api/v1/auth", AuthRouter::new(state.pool.clone()).into())
        .nest("/images", ImagesRouter::new().into())
        .nest("/api/v1/lists", ListRouter::new(state.pool.clone()).into())
        .nest(
            "/api/v1/families",
            FamilyRouter::new(state.pool.clone()).into(),
        );

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
