use std::sync::Arc;

use axum::{
    extract::State,
    response::{Html, IntoResponse, Redirect},
    routing::get,
    Extension, Router,
};
use mysql_async::Pool;
use tera::{Context, Tera};

use crate::{
    auth::{Claims, JwTokenReaderLayer},
    lists::model::List,
};

pub struct ViewRouter(Router);

type ArcedState = Arc<ViewRouterState>;

#[derive(Debug)]
struct ViewRouterState {
    pool: Pool,
    tera: Tera,
}

impl ViewRouterState {
    fn new(pool: Pool) -> Arc<Self> {
        let tera = Tera::new("src/views/templates/**/*").expect("tera parsing error");

        Arc::new(Self { pool, tera })
    }
}

impl ViewRouter {
    pub fn new(pool: Pool) -> Self {
        Self(
            Router::new()
                .route(
                    "/upload",
                    get(|State(state): State<ArcedState>| async move {
                        let mut context = Context::new();
                        context.insert("name", "austin");

                        let html = state
                            .tera
                            .render("upload.html", &context)
                            .expect("render error");

                        Html(html)
                    }),
                )
                .route("/", get(list_view))
                .route(
                    "/login",
                    get(|State(state): State<ArcedState>| async move {
                        let ctx = Context::new();
                        let html = state
                            .tera
                            .render("login.html", &ctx)
                            .expect("Template failed");

                        Html(html)
                    }),
                )
                .layer(JwTokenReaderLayer)
                .with_state(ViewRouterState::new(pool)),
        )
    }
}

impl Into<Router> for ViewRouter {
    fn into(self) -> Router {
        self.0
    }
}

async fn list_view(
    State(state): State<ArcedState>,
    claim: Option<Extension<Claims>>,
) -> axum::response::Response {
    // Redirect if not logged in
    if claim.is_none() {
        return Redirect::temporary("/login").into_response();
    }

    let claim = claim.unwrap();

    let lists = List::paginate(state.pool.clone(), claim.sub)
        .await
        .expect("Pagination failed");

    let mut ctx = Context::new();
    ctx.insert("lists", &lists);

    let html = state.tera.render("lists.html", &ctx).expect("render error");

    Html(html).into_response()
}
