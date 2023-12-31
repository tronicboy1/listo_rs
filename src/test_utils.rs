use std::{
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};

use crate::{families::Family, Insert};

pub struct TestState {
    pub pool: mysql_async::Pool,
}

impl TestState {
    pub fn new() -> Arc<Self> {
        let opts = mysql_async::OptsBuilder::default()
            .ip_or_hostname("localhost")
            .prefer_socket(true)
            .db_name(Some("listo"))
            .user(Some("root"))
            .pass(Some("password"))
            .tcp_port(3307);

        Arc::new(Self {
            pool: mysql_async::Pool::new(opts),
        })
    }
}

pub async fn create_family() -> (Arc<TestState>, u64) {
    let state = TestState::new();

    let now = now_string();
    let f = Family::new(format!("New Test Family: {}", now));

    let mut conn = state.pool.get_conn().await.unwrap();
    let id = f.insert(&mut conn).await.unwrap();

    (state, id)
}

pub fn now_string() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
        .to_string()
}
