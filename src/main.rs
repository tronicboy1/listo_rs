use std::net::SocketAddr;

use axum::{routing::get, Router};
use axum_server::tls_rustls::RustlsConfig;
use listo_rs::{
    auth::{AuthRouter, JwTokenReaderLayer},
    families::FamilyRouter,
    // For reference, not in use
    // images::ImagesRouter,
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
        // .nest("/images", ImagesRouter::new().into())
        .nest(
            "/api/v1/lists",
            ListRouter::new(state.pool.clone(), state.new_item_tx).into(),
        )
        .nest("/api/v1/families", FamilyRouter::new(state.pool).into())
        .nest_service("/assets", serve_dir)
        .nest_service("/.well-known/pki-validation", serve_cname)
        .layer(CompressionLayer::new());

    let port: u16 = std::env::var("PORT")
        .unwrap_or(String::from("3000"))
        .parse()
        .expect("invalid port");

    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    // Can use oneshot to gracefully shutdown
    let (_shutdown_tx, rx) = tokio::sync::oneshot::channel::<()>();

    if std::env::var("USE_TLS").is_ok() {
        let config = RustlsConfig::from_pem_file("certs/certificate.crt", "certs/private.key")
            .await
            .expect("could not read certs");

        axum_server::bind_rustls(addr, config)
            .serve(app.into_make_service())
            // .with_graceful_shutdown(async move { rx.await.unwrap() })
            .await
            .unwrap();
    } else {
        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        axum::serve(listener, app)
            .with_graceful_shutdown(async move { rx.await.unwrap() })
            .await
            .unwrap();
    }
}
