use mysql_async::{
    prelude::{FromRow, Queryable},
    Params, Pool, Value,
};
use serde::Serialize;

use crate::{find_col, find_col_or_err};

#[derive(Serialize)]
pub struct List {
    pub list_id: u64,
    pub name: String,
    pub items: Option<Vec<Item>>,
}

impl List {
    pub async fn paginate(pool: Pool) -> Result<Vec<List>, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let stmt = conn.prep("SELECT * FROM lists LIMIT 10;").await?;

        let lists: Vec<Self> = conn.exec(stmt, ()).await?;
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

    pub async fn get(pool: Pool, list_id: u64) -> Result<Option<Self>, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let stmt = conn.prep("SELECT * FROM lists WHERE list_id = ?").await?;

        conn.exec_first(stmt, vec![list_id]).await
    }

    async fn load_items(mut self, pool: Pool) -> Result<Self, mysql_async::Error> {
        let items: Vec<Item> = Item::get_by_list(pool, self.list_id).await?;

        self.items = Some(items);

        Ok(self)
    }
}

impl FromRow for List {
    fn from_row_opt(mut row: mysql_async::Row) -> Result<Self, mysql_async::FromRowError>
    where
        Self: Sized,
    {
        let list = Self {
            list_id: find_col(&mut row, "list_id")
                .expect("list id not included in query")
                .map_err(|_| mysql_async::FromRowError(row.clone()))?,
            name: find_col(&mut row, "name")
                .expect("name not included in query")
                .map_err(|_| mysql_async::FromRowError(row.clone()))?,
            items: None,
        };

        Ok(list)
    }
}

#[derive(Serialize)]
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
            item_id: find_col(&mut row, "item_id")
                .expect("item id not included in query")
                .map_err(|_| mysql_async::FromRowError(row.clone()))?,
            list_id: find_col(&mut row, "list_id")
                .expect("list id not included in query")
                .map_err(|_| mysql_async::FromRowError(row.clone()))?,
            name: find_col(&mut row, "name")
                .expect("name not included in query")
                .map_err(|_| mysql_async::FromRowError(row.clone()))?,
            amount: find_col(&mut row, "amount")
                .expect("amount not included in query")
                .map_err(|_| mysql_async::FromRowError(row.clone()))?,
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

    pub async fn get(pool: Pool, item_id: u64) -> Result<Option<Item>, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let stmt = conn
            .prep("SELECT * FROM list_items WHERE item_id = ?;")
            .await?;

        conn.exec_first(stmt, vec![item_id]).await
    }

    pub async fn get_by_list(pool: Pool, list_id: u64) -> Result<Vec<Item>, mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

        let stmt = conn
            .prep("SELECT * FROM list_items WHERE list_id = ?;")
            .await?;

        conn.exec(stmt, vec![list_id]).await
    }

    pub async fn insert(self, pool: Pool) -> Result<(), mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

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

    pub async fn delete(pool: Pool, item_id: u64) -> Result<(), mysql_async::Error> {
        let mut conn = pool.get_conn().await?;

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

/// A group (family) of users that have access to lists
/// A family object owns lists, and multiple users belong to a family.
struct Family {
    family_id: u64,
    name: String,
}

impl FromRow for Family {
    fn from_row_opt(mut row: mysql_async::Row) -> Result<Self, mysql_async::FromRowError>
    where
        Self: Sized,
    {
        let family = Family {
            family_id: find_col_or_err!(row, "family_id")?,
            name: find_col_or_err!(row, "name")?,
        };

        Ok(family)
    }
}
