use std::pin::Pin;

use axum::response::IntoResponse;
use std::future::Future;
use http::StatusCode;
use tower::{Layer, Service};

use super::Claims;

#[derive(Debug, Clone)]
pub struct AuthGuardService<S> {
    inner: S,
}

impl<S, B> Service<axum::http::Request<B>> for AuthGuardService<S>
where
    S: Service<axum::http::Request<B>, Response = axum::response::Response> + Send + 'static,
    S::Future: Send + 'static,
{
    type Error = S::Error;
    type Response = S::Response;
    type Future =
        Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send + 'static>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        // This service does not care about backpressure
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: axum::http::Request<B>) -> Self::Future {
        let claims = req.extensions().get::<Claims>();

        match claims {
            Some(_) => Box::pin(self.inner.call(req)),
            None => Box::pin(async { Ok(StatusCode::UNAUTHORIZED.into_response()) }),
        }
    }
}

#[derive(Debug, Clone)]
pub struct AuthGuardLayer;

impl<S> Layer<S> for AuthGuardLayer {
    type Service = AuthGuardService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service { inner }
    }
}
