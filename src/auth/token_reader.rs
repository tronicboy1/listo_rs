use std::pin::Pin;

use axum::{http::Request, response::IntoResponse};
use cookie::Cookie;
use futures::Future;
use http::StatusCode;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

use tower::{Layer, Service};

use super::{Claims, SECRET_KEY};

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
    S: Service<Request<B>, Response = axum::response::Response> + Send + 'static,
    S::Future: Send + 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future =
        Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send + 'static>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        // Jw Token is not concerned with backpressure
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, mut req: Request<B>) -> Self::Future {
        let validation = Validation::new(Algorithm::HS256);

        let token = req
            .headers()
            .get("Cookie")
            .and_then(|token_header| token_header.to_str().ok())
            .and_then(|cookies| {
                Cookie::split_parse(cookies)
                    .filter_map(|cookie| cookie.ok())
                    .find(|cookie| cookie.name() == "jwt")
            })
            .and_then(|encoded_token| {
                decode::<Claims>(
                    encoded_token.value(),
                    &DecodingKey::from_secret(SECRET_KEY),
                    &validation,
                )
                .ok()
            });

        match token {
            Some(token) => {
                req.extensions_mut().insert(token.claims);

                Box::pin(self.inner.call(req))
            }
            None => Box::pin(async { Ok(StatusCode::UNAUTHORIZED.into_response()) }),
        }
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
