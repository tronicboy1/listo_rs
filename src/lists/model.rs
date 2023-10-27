use mysql_async::{
    prelude::{FromRow, Queryable},
    Conn, Params, Pool, Value,
};
use serde::Serialize;

use crate::find_col_or_err;

#[derive(Debug, Serialize)]
pub struct List {
    pub list_id: u64,
    pub name: String,
    pub family_id: u64,
    pub items: Option<Vec<Item>>,
}

impl List {
    pub fn new(name: String, family_id: u64) -> Self {
        Self {
            list_id: 0,
            name,
            items: None,
            family_id,
        }
    }

    pub async fn insert(self, conn: &mut Conn) -> Result<u64, mysql_async::Error> {
        let stmt = conn
            .prep("INSERT INTO lists (`name`, family_id) VALUES (?, ?);")
            .await?;

        let params = Params::Positional(vec![self.name.into(), self.family_id.into()]);
        conn.exec_drop(stmt, params).await?;

        Ok(conn
            .exec_first("SELECT LAST_INSERT_ID();", ())
            .await?
            .expect("mysql guarantees id returned"))
    }

    pub async fn paginate(pool: Pool, user_id: u64) -> Result<Vec<List>, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let stmt = conn
            .prep(
                "SELECT * FROM lists
        INNER JOIN users_families ON lists.family_id = users_families.family_id
        WHERE users_families.user_id = ?
        LIMIT 10;",
            )
            .await?;

        let lists: Vec<Self> = conn.exec(stmt, vec![user_id]).await?;
        let len = lists.len();

        let list_handles: Vec<_> = lists
            .into_iter()
            .map(move |list| tokio::spawn(list.load_items(pool.clone())))
            .collect();

        let mut lists = Vec::with_capacity(len);

        for handle in list_handles {
            let list = handle.await.unwrap()?;
            lists.push(list);
        }

        Ok(lists)
    }

    pub async fn get(conn: &mut Conn, list_id: u64) -> Result<Option<Self>, mysql_async::Error> {
        let stmt = conn.prep("SELECT * FROM lists WHERE list_id = ?").await?;

        conn.exec_first(stmt, vec![list_id]).await
    }

    async fn load_items(mut self, pool: Pool) -> Result<Self, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;
        let items: Vec<Item> = Item::get_by_list(&mut conn, self.list_id).await?;

        self.items = Some(items);

        Ok(self)
    }

    /// Checks the ownership of a list to ensure that the user provided has access priveleges
    pub async fn check_ownership(
        mut conn: Conn,
        list_id: u64,
        user_id: u64,
    ) -> Result<bool, mysql_async::Error> {
        let stmt = conn
            .prep(
                "SELECT * FROM lists
                INNER JOIN users_families ON lists.family_id = users_families.family_id
                WHERE list_id = ? AND user_id = ?;",
            )
            .await?;

        let params = mysql_async::Params::Positional(vec![list_id.into(), user_id.into()]);
        let res: Option<List> = conn.exec_first(stmt, params).await?;

        Ok(res.is_some())
    }
}

impl FromRow for List {
    fn from_row_opt(mut row: mysql_async::Row) -> Result<Self, mysql_async::FromRowError>
    where
        Self: Sized,
    {
        let list = Self {
            list_id: find_col_or_err!(row, "list_id")?,
            name: find_col_or_err!(row, "name")?,
            family_id: find_col_or_err!(row, "family_id")?,
            items: None,
        };

        Ok(list)
    }
}

#[derive(Debug, Serialize)]
pub struct Item {
    item_id: u64,
    list_id: u64,
    pub name: String,
    pub amount: u64,
}

impl FromRow for Item {
    fn from_row_opt(mut row: mysql_async::Row) -> Result<Self, mysql_async::FromRowError>
    where
        Self: Sized,
    {
        Ok(Self {
            item_id: find_col_or_err!(row, "item_id")?,
            list_id: find_col_or_err!(row, "list_id")?,
            name: find_col_or_err!(row, "name")?,
            amount: find_col_or_err!(row, "amount")?,
        })
    }
}

impl Item {
    pub fn new(list_id: u64, name: String) -> Self {
        Self {
            item_id: 0,
            list_id,
            name,
            amount: 1,
        }
    }

    pub async fn get(conn: &mut Conn, item_id: u64) -> Result<Option<Item>, mysql_async::Error> {
        let stmt = conn
            .prep("SELECT * FROM list_items WHERE item_id = ?;")
            .await?;

        conn.exec_first(stmt, vec![item_id]).await
    }

    pub async fn get_by_list(
        conn: &mut Conn,
        list_id: u64,
    ) -> Result<Vec<Item>, mysql_async::Error> {
        let stmt = conn
            .prep("SELECT * FROM list_items WHERE list_id = ?;")
            .await?;

        conn.exec(stmt, vec![list_id]).await
    }

    pub async fn insert(self, conn: &mut Conn) -> Result<(), mysql_async::Error> {
        let stmt = conn
            .prep(
                "INSERT INTO list_items (
            list_id, name, amount
        ) VALUES (?, ?, ?);",
            )
            .await?;

        let params: Params = self.into();
        conn.exec_drop(stmt, params).await
    }

    pub async fn delete(conn: &mut Conn, item_id: u64) -> Result<(), mysql_async::Error> {
        let stmt = conn
            .prep("DELETE FROM list_items WHERE item_id = ?;")
            .await?;

        conn.exec_drop(stmt, vec![item_id]).await
    }
}

impl Into<mysql_async::Params> for Item {
    fn into(self) -> mysql_async::Params {
        let Self {
            list_id,
            name,
            amount,
            ..
        } = self;

        Params::Positional(vec![
            Value::from(list_id),
            Value::from(name),
            Value::from(amount),
        ])
    }
}

#[cfg(test)]
mod tests {

    use std::time::{SystemTime, UNIX_EPOCH};

    use crate::{families::Family, test_utils::create_family};

    use super::*;

    #[tokio::test]
    async fn can_create_list() {
        let (state, family_id) = create_family().await;

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis()
            .to_string();
        let list_name = String::from("My new test list: ") + &now;
        let list = List::new(list_name.clone(), family_id);

        let mut conn = state.pool.get_conn().await.unwrap();
        let list_id = list.insert(&mut conn).await.unwrap();

        let list = List::get(&mut conn, list_id).await.unwrap().unwrap();

        assert_eq!(list.name, list_name);

        Family::destroy(&mut conn, family_id).await.unwrap();
    }
}
