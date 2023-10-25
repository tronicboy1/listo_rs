use mysql_async::{prelude::*, Conn, Params};

use crate::{find_col_or_err, users::User};

/// A group (family) of users that have access to lists
/// A family object owns lists, and multiple users belong to a family.
pub struct Family {
    pub family_id: u64,
    pub family_name: String,
}

impl Family {
    pub fn new(family_name: String) -> Self {
        Self {
            family_id: 0,
            family_name,
        }
    }

    pub async fn insert(self, mut conn: Conn) -> Result<u64, mysql_async::Error> {
        let stmt = conn
            .prep("INSERT INTO families (family_name) VALUES (?);")
            .await?;

        let params = Params::Positional(vec![self.family_name.into()]);
        conn.exec_drop(stmt, params).await?;

        Ok(conn
            .exec_first("SELECT LAST_INSERT_ID();", ())
            .await?
            .expect("mysql guarantees id returned"))
    }

    pub async fn destroy(mut conn: Conn, family_id: u64) -> Result<(), mysql_async::Error> {
        let stmt = conn
            .prep("DELETE FROM families WHERE family_id = ?;")
            .await?;

        let params = Params::Positional(vec![family_id.into()]);
        conn.exec_drop(stmt, params).await
    }

    pub async fn add_member(
        mut conn: Conn,
        family_id: u64,
        user_id: u64,
    ) -> Result<(), mysql_async::Error> {
        let stmt = conn
            .prep("INSERT INTO users_families (family_id, user_id) VALUES (?, ?);")
            .await?;

        let params = Params::Positional(vec![family_id.into(), user_id.into()]);
        conn.exec_drop(stmt, params).await
    }

    pub async fn remove_member(
        mut conn: Conn,
        family_id: u64,
        user_id: u64,
    ) -> Result<(), mysql_async::Error> {
        let stmt = conn
            .prep("DELETE FROM users_families WHERE user_id = ? AND family_id = ?;")
            .await?;

        let params = Params::Positional(vec![family_id.into(), user_id.into()]);
        conn.exec_drop(stmt, params).await
    }

    pub async fn members(mut conn: Conn, family_id: u64) -> Result<Vec<User>, mysql_async::Error> {
        let stmt = conn
            .prep(
                "SELECT * FROM users
            INNER JOIN users_families ON users.user_id = users_families.user_id
            WHERE family_id = ?",
            )
            .await?;

        let params = Params::Positional(vec![family_id.into()]);
        conn.exec(stmt, params).await
    }
}

impl FromRow for Family {
    fn from_row_opt(mut row: mysql_async::Row) -> Result<Self, mysql_async::FromRowError>
    where
        Self: Sized,
    {
        let family = Family {
            family_id: find_col_or_err!(row, "family_id")?,
            family_name: find_col_or_err!(row, "family_name")?,
        };

        Ok(family)
    }
}

#[cfg(test)]
mod tests {
    use std::{
        sync::Arc,
        time::{SystemTime, UNIX_EPOCH},
    };

    use crate::test_utils::TestState;

    use super::*;

    async fn create_family() -> (Arc<TestState>, u64) {
        let state = TestState::new();

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis()
            .to_string();
        let f = Family::new(format!("New Test Family: {}", now));

        let conn = state.pool.get_conn().await.unwrap();
        let id = f.insert(conn).await.unwrap();

        (state, id)
    }

    #[tokio::test]
    async fn can_create_family() {
        let (state, family_id) = create_family().await;

        let conn = state.pool.get_conn().await.unwrap();
        Family::destroy(conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_add_member() {
        let (state, family_id) = create_family().await;
        let conn = state.pool.get_conn().await.unwrap();

        Family::add_member(conn, family_id, 1).await.unwrap();

        let conn = state.pool.get_conn().await.unwrap();
        Family::destroy(conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_remove_member() {
        let (state, family_id) = create_family().await;

        let conn = state.pool.get_conn().await.unwrap();
        Family::add_member(conn, family_id, 1).await.unwrap();

        let conn = state.pool.get_conn().await.unwrap();
        Family::remove_member(conn, family_id, 1).await.unwrap();

        let conn = state.pool.get_conn().await.unwrap();
        Family::destroy(conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_show_members() {
        let (state, family_id) = create_family().await;

        let conn = state.pool.get_conn().await.unwrap();
        Family::add_member(conn, family_id, 1).await.unwrap();

        let conn = state.pool.get_conn().await.unwrap();
        let users = Family::members(conn, family_id).await.unwrap();

        assert!(users.iter().find(|user| user.user_id == 1).is_some());

        let conn = state.pool.get_conn().await.unwrap();
        Family::destroy(conn, family_id).await.unwrap();
    }
}
