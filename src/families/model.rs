use mysql_async::{prelude::*, Conn, Params, Pool};
use serde::ser::{Serialize, SerializeStruct};

use crate::{find_col_or_err, users::User, Insert};

/// A group (family) of users that have access to lists
/// A family object owns lists, and multiple users belong to a family.
#[derive(Debug)]
pub struct Family {
    pub family_id: u64,
    pub family_name: String,
    pub members: Option<Vec<User>>,
}

impl Into<Params> for Family {
    fn into(self) -> Params {
        Params::Positional(vec![self.family_name.into(), self.family_id.into()])
    }
}

impl Serialize for Family {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let size = if self.members.is_some() { 3 } else { 2 };
        let mut state = serializer.serialize_struct("Family", size)?;

        state.serialize_field("family_id", &self.family_id)?;
        state.serialize_field("family_name", &self.family_name)?;
        if let Some(ref members) = self.members {
            state.serialize_field("members", members)?;
        }

        state.end()
    }
}

impl Insert for Family {
    fn insert_stmt() -> &'static str
    where
        Self: Sized,
    {
        "INSERT INTO families (family_name, family_id) VALUES (?, ?);"
    }
}

impl Family {
    pub fn new(family_name: String) -> Self {
        Self {
            family_id: 0,
            family_name,
            members: None,
        }
    }

    pub async fn destroy(conn: &mut Conn, family_id: u64) -> Result<(), mysql_async::Error> {
        let stmt = conn
            .prep("DELETE FROM families WHERE family_id = ?;")
            .await?;

        let params = Params::Positional(vec![family_id.into()]);
        conn.exec_drop(stmt, params).await
    }

    pub async fn paginate(
        pool: &Pool,
        user_id: u64,
        load_members: bool,
    ) -> Result<Vec<Self>, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let stmt = conn
            .prep(
                "SELECT * FROM families
                INNER JOIN users_families ON families.family_id = users_families.family_id
                WHERE user_id = ?;",
            )
            .await?;

        let params = Params::Positional(vec![user_id.into()]);
        let families: Vec<Family> = conn.exec(stmt, params).await?;

        if load_members {
            let len = families.len();
            let family_members: Vec<_> = families
                .into_iter()
                .map(move |family| tokio::spawn(family.load_members(pool.clone())))
                .collect();

            let mut families = Vec::with_capacity(len);
            for handle in family_members {
                let fam = handle.await.unwrap()?;
                families.push(fam);
            }

            Ok(families)
        } else {
            Ok(families)
        }
    }

    pub async fn add_member(
        conn: &mut Conn,
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
        conn: &mut Conn,
        family_id: u64,
        user_id: u64,
    ) -> Result<(), mysql_async::Error> {
        let stmt = conn
            .prep("DELETE FROM users_families WHERE family_id = ? AND user_id = ?;")
            .await?;

        let params = Params::Positional(vec![family_id.into(), user_id.into()]);
        conn.exec_drop(stmt, params).await
    }

    pub async fn members(conn: &mut Conn, family_id: u64) -> Result<Vec<User>, mysql_async::Error> {
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

    async fn load_members(mut self, pool: Pool) -> Result<Self, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let members = Self::members(&mut conn, self.family_id).await?;

        self.members = Some(members);

        Ok(self)
    }

    pub async fn is_member(
        conn: &mut Conn,
        family_id: u64,
        user_id: u64,
    ) -> Result<bool, mysql_async::Error> {
        let stmt = conn
            .prep(
                "SELECT * FROM families
            INNER JOIN users_families ON families.family_id = users_families.family_id
            WHERE families.family_id = ? AND user_id = ?;",
            )
            .await?;

        let params = Params::Positional(vec![family_id.into(), user_id.into()]);
        let res: Option<Family> = conn.exec_first(stmt, params).await?;

        Ok(res.is_some())
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
            members: None,
        };

        Ok(family)
    }
}

#[cfg(test)]
mod tests {
    use crate::test_utils::create_family;

    use super::*;

    #[tokio::test]
    async fn can_create_family() {
        let (state, family_id) = create_family().await;

        let mut conn = state.pool.get_conn().await.unwrap();
        Family::destroy(&mut conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_add_member() {
        let (state, family_id) = create_family().await;
        let mut conn = state.pool.get_conn().await.unwrap();

        Family::add_member(&mut conn, family_id, 1).await.unwrap();
        Family::destroy(&mut conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_paginate_for_user() {
        let (state, family_id) = create_family().await;
        let mut conn = state.pool.get_conn().await.unwrap();

        Family::add_member(&mut conn, family_id, 1).await.unwrap();

        let families = Family::paginate(&state.pool, 1, false).await.unwrap();
        assert!(families
            .iter()
            .find(|fam| fam.family_id == family_id)
            .is_some());

        Family::destroy(&mut conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_paginate_for_user_with_members() {
        let (state, family_id) = create_family().await;
        let mut conn = state.pool.get_conn().await.unwrap();

        Family::add_member(&mut conn, family_id, 1).await.unwrap();

        let families = Family::paginate(&state.pool, 1, true).await.unwrap();
        assert!(families
            .iter()
            .find(|fam| fam.family_id == family_id)
            .is_some());
        assert!(families.iter().all(|fam| fam.members.is_some()));

        Family::destroy(&mut conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_remove_member() {
        let (state, family_id) = create_family().await;

        let mut conn = state.pool.get_conn().await.unwrap();
        Family::add_member(&mut conn, family_id, 1).await.unwrap();

        Family::remove_member(&mut conn, family_id, 1)
            .await
            .unwrap();

        let users = Family::members(&mut conn, family_id).await.unwrap();

        assert!(users.iter().find(|user| user.user_id == 1).is_none());

        Family::destroy(&mut conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_show_members() {
        let (state, family_id) = create_family().await;

        let mut conn = state.pool.get_conn().await.unwrap();
        Family::add_member(&mut conn, family_id, 1).await.unwrap();

        let users = Family::members(&mut conn, family_id).await.unwrap();

        assert!(users.iter().find(|user| user.user_id == 1).is_some());

        Family::destroy(&mut conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn confirm_user_is_member() {
        let (state, family_id) = create_family().await;

        let mut conn = state.pool.get_conn().await.unwrap();
        Family::add_member(&mut conn, family_id, 1).await.unwrap();

        let is_member = Family::is_member(&mut conn, family_id, 1).await.unwrap();

        assert!(is_member);

        Family::destroy(&mut conn, family_id).await.unwrap();
    }
}
