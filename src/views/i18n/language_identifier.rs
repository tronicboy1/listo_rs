use axum::response::{IntoResponse, Redirect, Response};
use http::{HeaderMap, Request, Uri};
use serde::ser::Serialize;
use std::future::Future;
use std::pin::Pin;
use tower::{Layer, Service};
use unic_langid::LanguageIdentifier;

use super::{supported, ENGLISH};

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

        // Redirect to supported language if current is not supported
        if let Some(lang_ident) = lang_ident {
            // Add language ident for processing in handler
            let ext = req.extensions_mut();
            ext.insert(lang_ident);

            Box::pin(self.inner.call(req))
        } else {
            let headers = req.headers();

            let ident = lang_code_from_headers(headers);

            let target_lang = ident.unwrap_or(TeraLanguageIdentifier(ENGLISH));

            let redirect_uri = String::from("/") + target_lang.language.as_str() + req.uri().path();

            Box::pin(async move { Ok(Redirect::permanent(&redirect_uri).into_response()) })
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

/// Extracts language code from Accept-Language header if available and asks for at least one supported language
///
/// # Details
/// All modern browsers send the Accept-Language header to tell a server what content it should send
///
/// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
fn lang_code_from_headers(headers: &HeaderMap) -> Option<TeraLanguageIdentifier> {
    let accept_lang = headers
        .get("Accept-Language")
        .and_then(|val| val.to_str().ok())?;

    let lang_ident = accept_lang
        .parse::<LanguageIdentifier>()
        .ok()
        .and_then(|ident| if supported(&ident) { Some(ident) } else { None })
        .or_else(|| {
            accept_lang
                .split(',')
                .filter(|part| !part.is_empty())
                // Strip the quality value
                .map(|part| part.find(|c| c == ';').map(|i| &part[..i]).unwrap_or(part))
                .filter_map(|ident_str| ident_str.parse::<LanguageIdentifier>().ok())
                .find(|ident| supported(ident))
        });

    lang_ident.map(|ident| TeraLanguageIdentifier(ident))
}

#[cfg(test)]
mod tests {
    use std::ops::Deref;

    use http::HeaderValue;

    use crate::views::i18n::JAPANESE;

    use super::*;

    #[test]
    fn can_get_supported_lang_code_from_uri() {
        let uri = "http://localhost:3000/ja/lists".parse::<Uri>().unwrap();

        let ident = lang_code_from_uri(&uri);

        assert!(ident.is_some());
        assert_eq!(ident.unwrap().deref(), &JAPANESE)
    }

    #[test]
    fn unsupported_lang_code_from_uri() {
        let uri = "http://localhost:3000/de/lists".parse::<Uri>().unwrap();

        let ident = lang_code_from_uri(&uri);

        assert!(ident.is_none());
    }

    #[test]
    fn can_extract_lang_header_single() {
        let mut headers = HeaderMap::new();
        headers.insert("Accept-Language", HeaderValue::from_static("en"));

        let ident = lang_code_from_headers(&headers).unwrap();

        let target = "en".parse::<LanguageIdentifier>().unwrap();
        assert_eq!(ident.deref(), &target)
    }

    #[test]
    fn can_extract_lang_header_compound() {
        let mut headers = HeaderMap::new();
        headers.insert("Accept-Language", HeaderValue::from_static("en-US"));

        let ident = lang_code_from_headers(&headers).unwrap();

        let target = "en-US".parse::<LanguageIdentifier>().unwrap();
        assert_eq!(ident.deref(), &target)
    }

    #[test]
    fn can_extract_lang_header_compound_with_quality_val() {
        let mut headers = HeaderMap::new();
        headers.insert(
            "Accept-Language",
            HeaderValue::from_static("en-US,en;q=0.5"),
        );

        let ident = lang_code_from_headers(&headers).unwrap();

        let target = "en-US".parse::<LanguageIdentifier>().unwrap();
        assert_eq!(ident.deref(), &target)
    }

    #[test]
    fn can_extract_lang_header_wildcard() {
        let mut headers = HeaderMap::new();
        headers.insert("Accept-Language", HeaderValue::from_static("*"));
    }
}
