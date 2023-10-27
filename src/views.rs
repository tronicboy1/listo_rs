use std::sync::OnceLock;

use axum::{extract::State, response::Html, routing::get, Extension, Router};
use mysql_async::Pool;
use tera::{Context, Tera};

use crate::{
    auth::{Claims, JwTokenReaderLayer},
    lists::model::List,
};

static TEMPLATES: OnceLock<Tera> = OnceLock::new();

pub fn get_templates() -> &'static Tera {
    TEMPLATES.get_or_init(|| {
        let reg = Tera::new("src/views/**/*").expect("tera parsing error");

        reg
    })
}

pub struct ViewRouter(Router);

#[derive(Debug, Clone)]
struct ViewRouterState {
    pool: Pool,
}

impl ViewRouter {
    pub fn new(pool: Pool) -> Self {
        Self(
            Router::new()
                .route(
                    "/lists",
                    get(
                        |State(state): State<ViewRouterState>,
                         Extension(claim): Extension<Claims>| async move {
                            let lists = List::paginate(state.pool.clone(), claim.sub)
                                .await
                                .expect("Pagination failed");
                            let mut ctx = Context::new();
                            ctx.insert("lists", &lists);

                            let tera = get_templates();
                            let html = tera.render("lists.html", &ctx).expect("render error");

                            Html(html)
                        },
                    ),
                )
                .layer(JwTokenReaderLayer)
                .with_state(ViewRouterState { pool }),
        )
    }
}

impl Into<Router> for ViewRouter {
    fn into(self) -> Router {
        self.0
    }
}
