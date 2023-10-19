use std::{net::SocketAddr, path};

use axum::{
    extract::{Multipart, Path},
    response::{AppendHeaders, IntoResponse, Redirect, Response},
    routing::{get, post},
    Router,
};
use http::StatusCode;
use listo_rs::{auth::AuthRouter, AppState};

#[tokio::main]
async fn main() {
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
        .route("/upload", post(handle_upload))
        .route("/images/:file_name", get(handle_download))
        .with_state(AppState::new())
        .nest("/auth", AuthRouter::new().into());

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

async fn handle_upload(mut multipart: Multipart) -> Response {
    let mut uploaded_file_name: Option<String> = None;

    while let Ok(Some(field)) = multipart.next_field().await {
        let content_type = field.content_type();
        if content_type == Some("image/jpeg")
            || content_type == Some("image/png")
            || content_type == Some("image/jpg")
        {
            let file_name = field.file_name().unwrap().to_string();
            let data = field.bytes().await.unwrap();

            tokio::fs::create_dir_all("src/images").await.unwrap();
            let result =
                tokio::fs::write(path::Path::new("src/images").join(&file_name), data).await;

            if result.is_ok() {
                uploaded_file_name = Some(file_name);
            }
        }
    }

    match uploaded_file_name {
        None => StatusCode::BAD_REQUEST.into_response(),
        Some(name) => Redirect::to(format!("images/{}", name).as_str()).into_response(),
    }
}

async fn handle_download(Path(file_name): Path<String>) -> Response {
    let path = path::Path::new("src/images").join(&file_name);
    let file = tokio::fs::read(path).await;

    match file {
        Ok(bytes) => {
            let ext = file_name.split('.').last().unwrap();
            (
                AppendHeaders([
                    ("Content-Type", format!("image/{}", ext).as_str()),
                    ("Content-Length", bytes.len().to_string().as_str()),
                    (
                        "Content-Disposition",
                        &format!("inline; filename=\"{}\"", &file_name),
                    ),
                ]),
                bytes,
            )
                .into_response()
        }
        Err(_) => (StatusCode::NOT_FOUND, "file not found").into_response(),
    }
}
