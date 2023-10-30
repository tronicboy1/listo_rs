use mysql_async::prelude::FromValue;
use std::{
    future::Future,
    sync::{atomic::AtomicUsize, Arc},
    task::Poll,
};
use tower::Service;

pub mod auth;
pub mod families;
pub mod images;
pub mod lists;
#[cfg(test)]
pub(crate) mod test_utils;
pub mod users;
pub mod views;

pub struct AppState {
    pub origin: String,
    pub pool: mysql_async::Pool,
}

impl AppState {
    pub fn new() -> Arc<Self> {
        let db_password = std::env::var("DB_PASSWORD").expect("Must define DB_PASSWORD env var");

        let opts = mysql_async::OptsBuilder::default()
            .ip_or_hostname("localhost")
            .prefer_socket(true)
            .db_name(Some("listo"))
            .user(Some("root"))
            .pass(Some(db_password))
            .tcp_port(3306);

        Arc::new(Self {
            origin: String::from("My Buthole 🙂"),
            pool: mysql_async::Pool::new(opts),
        })
    }
}

#[derive(Clone)]
pub struct AddCookieService<T> {
    inner: T,
    pending: Arc<std::sync::atomic::AtomicUsize>,
}

impl<T> AddCookieService<T> {
    pub fn new(inner: T) -> Self {
        Self {
            inner,
            pending: Arc::new(AtomicUsize::new(0)),
        }
    }
}

impl<T, U> Service<http::Request<U>> for AddCookieService<T>
where
    T: Service<http::Request<U>, Response = http::Response<U>> + Clone + 'static,
    U: 'static,
{
    type Response = http::Response<U>;
    type Error = T::Error;
    type Future = std::pin::Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        let pending_count = self.pending.load(std::sync::atomic::Ordering::Relaxed);

        println!("pending: {}", pending_count);

        if pending_count < 1000 {
            Poll::Ready(Ok(()))
        } else {
            Poll::Pending
        }
    }

    fn call(&mut self, req: http::Request<U>) -> Self::Future {
        self.pending
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let mut this = self.clone();

        Box::pin(async move {
            let response = this.inner.call(req).await?;

            this.pending
                .fetch_min(1, std::sync::atomic::Ordering::Relaxed);
            Ok(response)
        })
    }
}

/// Finds a value T in a row by it's column name
///
/// # Example
/// ```rust,ignore
/// let id: u64 = find_col(&mut value, "ID").unwrap_or(0);
/// ```
pub fn find_col<T>(
    row: &mut mysql_async::Row,
    col_name: &str,
) -> Option<Result<T, mysql_async::FromValueError>>
where
    T: FromValue,
{
    let (i, ..) = row
        .columns_ref()
        .iter()
        .enumerate()
        .find(|(_, col)| col.name_str() == col_name)?;

    row.take_opt(i)
}

#[macro_export]
macro_rules! find_col_or_err {
    ($row: ident, $col_name: expr) => {{
        crate::find_col(&mut $row, $col_name)
            .expect(&format!("{} must be included in SELECT", $col_name))
            .map_err(|_| mysql_async::FromRowError($row.clone()))
    }};
}

/// Gets a connection from a pool and maps the error to internal server error status code
/// # Example
/// ```rust,ignore
/// let conn = get_conn!(pool)?;
/// ````
#[macro_export]
macro_rules! get_conn {
    ($pool: expr) => {{
        $pool
            .get_conn()
            .await
            .map_err(|_| http::StatusCode::INTERNAL_SERVER_ERROR)
    }};
}
