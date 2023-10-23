use std::pin::Pin;

use axum::{extract::Path, response::IntoResponse};
use futures::Future;
use http::StatusCode;
use tower::{Layer, Service};

use crate::auth::Claims;

#[derive(Debug, Clone)]
pub struct ListGuard<S> {
    inner: S,
}

impl<S, B> Service<axum::http::Request<B>> for ListGuard<S>
where
    S: Service<axum::http::Request<B>, Response = axum::response::Response> + Send + 'static,
    S::Future: Send + 'static,
{
    type Error = S::Error;
    type Response = axum::response::Response;
    type Future =
        Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send + 'static>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        // No backpressure
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: axum::http::Request<B>) -> Self::Future {
        let claim = req.extensions().get::<Claims>();

        if claim.is_none() {
            return Box::pin(async { Ok(StatusCode::UNAUTHORIZED.into_response()) });
        }

        let Claims { sub, .. } = claim.unwrap();

        let mut path_parts = req.uri().path().split('/');
        path_parts.next();

        let list_id: Option<u64> = path_parts.next().and_then(|list_id| list_id.parse().ok());

        if let Some(list_id) = list_id {
            todo!("Only allow list members")
        }

        Box::pin(self.inner.call(req))
    }
}

#[derive(Debug, Clone)]
pub struct ListGuardLayer;

impl<S> Layer<S> for ListGuardLayer {
    type Service = ListGuard<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service { inner }
    }
}
