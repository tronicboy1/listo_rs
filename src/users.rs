use mysql_async::{
    prelude::{FromRow, Queryable},
    Conn, Params, Pool,
};
use serde::Serialize;

use crate::{families::Family, find_col_or_err};

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
    pub fn new(email: &str) -> Self {
        Self {
            user_id: 0,
            email: email.to_string(),
        }
    }

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

    pub async fn insert(self, conn: &mut Conn) -> Result<(), mysql_async::Error> {
        let stmt = conn.prep("INSERT INTO users (email) VALUES (?);").await?;

        let params: mysql_async::Params = self.into();
        conn.exec_drop(stmt, params).await
    }

    pub async fn families(mut conn: Conn, user_id: u64) -> Result<Vec<Family>, mysql_async::Error> {
        let stmt = conn.prep("SELECT * FROM families INNER JOIN users_families ON families.family_id = users_families.family_id WHERE user_id = ?;").await?;

        let params = Params::Positional(vec![user_id.into()]);
        conn.exec(stmt, params).await
    }
}

impl Into<mysql_async::Params> for User {
    fn into(self) -> mysql_async::Params {
        mysql_async::Params::Positional(vec![self.email.into()])
    }
}

#[cfg(test)]
mod tests {
    use crate::test_utils::create_family;

    use super::*;

    #[tokio::test]
    async fn can_show_families() {
        let (state, family_id) = create_family().await;

        let conn = state.pool.get_conn().await.unwrap();
        Family::add_member(conn, family_id, 1).await.unwrap();

        let conn = state.pool.get_conn().await.unwrap();
        let families = User::families(conn, 1).await.unwrap();
        assert!(families
            .iter()
            .find(|fam| fam.family_id == family_id)
            .is_some());

        let conn = state.pool.get_conn().await.unwrap();
        Family::destroy(conn, family_id).await.unwrap();
    }
}
