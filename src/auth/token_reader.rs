use axum::http::Request;
use tower::{Layer, Service};

use crate::cookie_tools::FromCookie;

use super::Claims;

/// Adds Jw Token claims data into request if the user is authenticated and has
/// the JWT in it's request.
#[derive(Debug, Clone)]
pub struct JwTokenReaderService<S> {
    inner: S,
}

impl<S> JwTokenReaderService<S> {
    pub fn new(inner: S) -> Self {
        Self { inner }
    }
}

impl<S, B> Service<Request<B>> for JwTokenReaderService<S>
where
    S: Service<Request<B>>,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = S::Future;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        // Jw Token is not concerned with backpressure
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, mut req: Request<B>) -> Self::Future {
        let token = Claims::from_headers(req.headers());

        if let Some(token) = token {
            match token {
                Ok(claims) => {
                    req.extensions_mut().insert(claims);
                }
                Err(err) => {
                    dbg!(err);
                }
            }
        }

        self.inner.call(req)
    }
}

#[derive(Debug, Clone)]
pub struct JwTokenReaderLayer;

impl<S> Layer<S> for JwTokenReaderLayer {
    type Service = JwTokenReaderService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        JwTokenReaderService { inner }
    }
}
