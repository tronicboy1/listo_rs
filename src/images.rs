use std::path;

use axum::{
    extract::Multipart,
    response::{AppendHeaders, IntoResponse},
    routing::{get, post},
    Router,
};
use http::StatusCode;

pub struct ImagesRouter(Router);

impl ImagesRouter {
    pub fn new() -> Self {
        Self(
            Router::new()
                .route("/upload", post(handle_upload))
                .route("/:file_name", get(handle_download)),
        )
    }
}

impl Into<Router> for ImagesRouter {
    fn into(self) -> Router {
        self.0
    }
}

async fn handle_upload(mut multipart: Multipart) -> axum::response::Response {
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
        Some(name) => {
            axum::response::Redirect::to(format!("/images/{}", name).as_str()).into_response()
        }
    }
}

async fn handle_download(
    axum::extract::Path(file_name): axum::extract::Path<String>,
) -> axum::response::Response {
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
