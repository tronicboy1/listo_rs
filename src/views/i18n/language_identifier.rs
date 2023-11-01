use axum::response::Response;
use http::{Request, Uri};
use serde::ser::Serialize;
use std::future::Future;
use std::pin::Pin;
use tower::{Layer, Service};
use unic_langid::LanguageIdentifier;

use super::supported;

/// Newtype of unic_langid::LanguageIdentifier to allow serialization in use with Tera
#[derive(Debug, Clone)]
pub struct TeraLanguageIdentifier(LanguageIdentifier);

impl Serialize for TeraLanguageIdentifier {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.0.to_string().as_str())
    }
}

impl std::ops::Deref for TeraLanguageIdentifier {
    type Target = LanguageIdentifier;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Debug, Clone)]
pub struct LanguageIdentifierExtractor<S> {
    inner: S,
}

impl<S, B> Service<Request<B>> for LanguageIdentifierExtractor<S>
where
    S: Service<Request<B>, Response = Response> + Send + 'static,
    S::Future: Send + 'static,
    B: Send + 'static,
{
    type Error = S::Error;
    type Future =
        Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send + 'static>>;
    type Response = Response;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, mut req: Request<B>) -> Self::Future {
        let lang_ident = lang_code_from_uri(req.uri());

        if let Some(lang_ident) = lang_ident {
            // Add language ident for processing in handler
            let ext = req.extensions_mut();
            ext.insert(lang_ident);

            Box::pin(self.inner.call(req))
        } else {
            todo!("Try to redirect using language header")
        }
    }
}

#[derive(Debug, Clone)]
pub struct LanguageIdentifierExtractorLayer;

impl<S> Layer<S> for LanguageIdentifierExtractorLayer {
    type Service = LanguageIdentifierExtractor<S>;

    fn layer(&self, inner: S) -> Self::Service {
        LanguageIdentifierExtractor { inner }
    }
}

/// Unwraps the path and extracts language identifier if available.
/// Returns None if the LanguageIdentifier is not supported
fn lang_code_from_uri(uri: &Uri) -> Option<TeraLanguageIdentifier> {
    let mut path_parts = uri.path().split('/');
    path_parts.next();

    path_parts
        .next()
        .and_then(|code| code.parse::<LanguageIdentifier>().ok())
        .and_then(|ident| if supported(&ident) { Some(ident) } else { None })
        .map(|ident| TeraLanguageIdentifier(ident))
}
