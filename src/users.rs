use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
use mysql_async::{
    prelude::{FromRow, Queryable},
    Conn, Params,
};
use serde::ser::{Serialize, SerializeStruct};

use crate::{families::Family, find_col_or_err};

#[derive(Debug)]
pub struct User {
    pub user_id: u64,
    pub email: String,
    password: String,
}

impl Serialize for User {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("User", 2)?;
        state.serialize_field("user_id", &self.user_id)?;
        state.serialize_field("email", &self.email)?;

        state.end()
    }
}

impl FromRow for User {
    fn from_row_opt(mut row: mysql_async::Row) -> Result<Self, mysql_async::FromRowError>
    where
        Self: Sized,
    {
        let user = User {
            user_id: find_col_or_err!(row, "user_id")?,
            email: find_col_or_err!(row, "email")?,
            password: find_col_or_err!(row, "password")?,
        };

        Ok(user)
    }
}

impl User {
    /// Creates a new user and hashes password with unique salt.
    pub fn new(email: String, password: String) -> Result<Self, argon2::password_hash::Error> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)?
            .to_string();
        Ok(Self {
            user_id: 0,
            email: email,
            password: password_hash,
        })
    }

    pub async fn get_by_id(
        conn: &mut Conn,
        user_id: u64,
    ) -> Result<Option<User>, mysql_async::Error> {
        let stmt = conn.prep("SELECT * FROM users WHERE user_id = ?").await?;

        conn.exec_first(stmt, vec![user_id]).await
    }

    pub async fn get_by_email(
        conn: &mut Conn,
        email: &str,
    ) -> Result<Option<User>, mysql_async::Error> {
        let stmt = conn.prep("SELECT * FROM users WHERE email = ?").await?;

        let email: mysql_async::Value = email.into();
        conn.exec_first(stmt, vec![email]).await
    }

    pub async fn insert(self, conn: &mut Conn) -> Result<u64, mysql_async::Error> {
        let stmt = conn
            .prep("INSERT INTO users (email, `password`) VALUES (?, ?);")
            .await?;

        let params: mysql_async::Params = self.into();
        conn.exec_drop(stmt, params).await?;

        let id = conn
            .exec_first("SELECT LAST_INSERT_ID();", ())
            .await?
            .expect("Mysql guarantees ID comes back");

        Ok(id)
    }

    async fn destroy(conn: &mut Conn, user_id: u64) -> Result<(), mysql_async::Error> {
        let stmt = conn.prep("DELETE FROM users WHERE user_id = ?;").await?;

        let params = Params::Positional(vec![user_id.into()]);
        conn.exec_drop(stmt, params).await
    }

    pub async fn families(
        conn: &mut Conn,
        user_id: u64,
    ) -> Result<Vec<Family>, mysql_async::Error> {
        let stmt = conn.prep("SELECT * FROM families INNER JOIN users_families ON families.family_id = users_families.family_id WHERE user_id = ?;").await?;

        let params = Params::Positional(vec![user_id.into()]);
        conn.exec(stmt, params).await
    }

    pub fn confirm_password(&self, password: &str) -> Result<bool, argon2::password_hash::Error> {
        let parsed_hash = PasswordHash::new(&self.password)?;
        let argon2 = Argon2::default();

        Ok(argon2
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    }
}

impl Into<mysql_async::Params> for User {
    fn into(self) -> mysql_async::Params {
        mysql_async::Params::Positional(vec![self.email.into(), self.password.into()])
    }
}

#[cfg(test)]
mod tests {
    use crate::test_utils::{create_family, now_string, TestState};

    use super::*;

    #[tokio::test]
    async fn can_show_families() {
        let (state, family_id) = create_family().await;

        let mut conn = state.pool.get_conn().await.unwrap();
        Family::add_member(&mut conn, family_id, 1).await.unwrap();

        let families = User::families(&mut conn, 1).await.unwrap();
        assert!(families
            .iter()
            .find(|fam| fam.family_id == family_id)
            .is_some());

        Family::destroy(&mut conn, family_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_create_user() {
        let state = TestState::new();

        let mut conn = state.pool.get_conn().await.unwrap();

        let now = now_string();
        let user = User::new(
            String::from("can_create_usertestuser") + &now,
            String::from("password"),
        )
        .unwrap();

        let user_id = user.insert(&mut conn).await.unwrap();

        assert!(user_id > 0);

        User::destroy(&mut conn, user_id).await.unwrap();
    }

    #[tokio::test]
    async fn can_dehash_password() {
        let state = TestState::new();

        let mut conn = state.pool.get_conn().await.unwrap();

        let now = now_string();
        let password = String::from("SomePassword");
        let user = User::new(
            String::from("can_dehash_passwordtestuser") + &now,
            password.clone(),
        )
        .unwrap();

        let user_id = user.insert(&mut conn).await.unwrap();
        let user = User::get_by_id(&mut conn, user_id).await.unwrap().unwrap();
        let is_valid = user.confirm_password(&password).unwrap();

        assert!(is_valid);

        User::destroy(&mut conn, user_id).await.unwrap();
    }

    #[tokio::test]
    async fn incorrect_password_fails() {
        let state = TestState::new();

        let mut conn = state.pool.get_conn().await.unwrap();

        let now = now_string();
        let password = String::from("SomePassword");
        let user = User::new(
            String::from("incorrect_password_fails-testuser") + &now,
            password.clone(),
        )
        .unwrap();

        let user_id = user.insert(&mut conn).await.unwrap();
        let user = User::get_by_id(&mut conn, user_id).await.unwrap().unwrap();
        let is_valid = user.confirm_password("wrongpassword").unwrap();

        assert!(!is_valid);

        User::destroy(&mut conn, user_id).await.unwrap();
    }
}
