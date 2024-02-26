/// Provides an interface for implementing structs that can be
/// written to and read from cookies
pub(crate) trait FromCookie: Sized {
    type Error;
    const COOKIE_NAME: &'static str;

    fn cookie_body(&self) -> Result<String, Self::Error>;

    fn expires(&self) -> time::OffsetDateTime {
        let mut time = cookie::time::OffsetDateTime::now_utc();
        time += cookie::time::Duration::days(1);

        time
    }

    /// Creates a cookie from the struct with a lifetime up to 'static
    fn to_cookie<'a>(&self) -> Result<cookie::Cookie<'a>, Self::Error> {
        let cookie_body = self.cookie_body()?;

        let domain = std::env::var("DOMAIN").unwrap_or(String::from("localhost"));

        let cookie = cookie::Cookie::build((Self::COOKIE_NAME, cookie_body.as_str()))
            .path("/")
            .http_only(true)
            .domain(domain)
            .same_site(cookie::SameSite::Lax)
            .expires(self.expires());

        Ok(cookie.build().into_owned())
    }

    /// Extracts a cookie of `Self::COOKIE_NAME` if available from headers
    fn cookie_from_headers<'a>(headers: &'a http::HeaderMap) -> Option<cookie::Cookie<'a>> {
        headers
            .get_all("Cookie")
            .into_iter()
            .flat_map(|cookie_header| cookie_header.to_str().ok())
            .map(|cookies_str| {
                cookie::Cookie::split_parse(cookies_str)
                    .into_iter()
                    .filter_map(|c| c.ok())
            })
            .flatten()
            .find(|cookie| cookie.name() == Self::COOKIE_NAME)
    }

    /// Extracts a cookie of `Self::COOKIE_NAME` if available from headers
    /// and converts to Self
    ///
    /// # Errors
    /// If the cookie value cannot be converted into Self from Cookie
    fn from_headers<'a>(
        headers: &'a http::HeaderMap,
    ) -> Option<Result<Self, <Self as FromCookie>::Error>> {
        Self::cookie_from_headers(headers).map(|cookie| Self::from_cookie(&cookie))
    }

    fn from_cookie<'a>(cookie: &'a cookie::Cookie<'a>)
        -> Result<Self, <Self as FromCookie>::Error>;
}
