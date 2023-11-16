use lists::ItemChangeMessage;
use mysql_async::prelude::FromValue;
use tokio::sync::broadcast::{channel, Sender};

pub mod auth;
pub mod families;
pub mod images;
pub mod lists;
#[cfg(test)]
pub(crate) mod test_utils;
pub mod users;
pub mod views;
pub mod ws;

#[derive(Debug, Clone)]
pub struct AppState {
    pub origin: String,
    pub pool: mysql_async::Pool,
    pub new_item_tx: Sender<ItemChangeMessage>,
}

impl AppState {
    pub fn new() -> Self {
        let db_password = std::env::var("DB_PASSWORD").expect("Must define DB_PASSWORD env var");
        let db_port: u16 = std::env::var("DB_PORT")
            .unwrap_or(String::from("3306"))
            .parse()
            .expect("Invalid DB port");

        let opts = mysql_async::OptsBuilder::default()
            .ip_or_hostname("localhost")
            .prefer_socket(true)
            .db_name(Some("listo"))
            .user(Some("root"))
            .pass(Some(db_password))
            .tcp_port(db_port);

        let (tx, _rx) = channel::<ItemChangeMessage>(100);

        Self {
            origin: String::from("My Buthole 🙂"),
            pool: mysql_async::Pool::new(opts),
            new_item_tx: tx,
        }
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

#[macro_export]
macro_rules! map_internal_error {
    ($code: expr) => {
        $code.map_err(|err| {
            dbg!(err);
            StatusCode::INTERNAL_SERVER_ERROR
        })
    };
}
