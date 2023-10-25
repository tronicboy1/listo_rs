use std::sync::Arc;

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
