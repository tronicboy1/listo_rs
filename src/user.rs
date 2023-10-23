use mysql_async::{prelude::{FromRow, Queryable}, Pool};
use serde::Serialize;

use crate::find_col_or_err;

#[derive(Debug, Serialize)]
pub struct User {
   pub user_id: u64,
   pub email: String,
}

impl FromRow for User {
    fn from_row_opt(mut row: mysql_async::Row) -> Result<Self, mysql_async::FromRowError>
    where
        Self: Sized,
    {
        let user = User {
            user_id: find_col_or_err!(row, "user_id")?,
            email: find_col_or_err!(row, "email")?,
        };

        Ok(user)
    }
}

impl User {
    pub async fn get_by_id(pool: Pool, user_id: u64) -> Result<Option<User>, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let stmt = conn.prep("SELECT * FROM users WHERE user_id = ?").await?;

        conn.exec_first(stmt, vec![user_id]).await
    }

    pub async fn get_by_email(pool: Pool, email: &str) -> Result<Option<User>, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let stmt = conn.prep("SELECT * FROM users WHERE email = ?").await?;

        let email: mysql_async::Value = email.into();
        conn.exec_first(stmt, vec![email]).await
    }
}
