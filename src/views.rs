use std::sync::Arc;

use axum::{
    extract::{Path, State},
    response::{Html, IntoResponse, Redirect},
    routing::get,
    Extension, Router,
};
use http::StatusCode;
use mysql_async::Pool;
use tera::{Context, Tera};

mod i18n;

use crate::{
    auth::{Claims, JwTokenReaderLayer},
    families::Family,
    lists::model::{Item, List},
};

use self::i18n::{LanguageIdentifierExtractorLayer, Localizer, TeraLanguageIdentifier};

macro_rules! return_if_not_logged_in {
    ($claim: expr) => {{
        if $claim.is_none() {
            return Redirect::temporary("/login").into_response();
        }

        $claim.unwrap()
    }};
}

pub struct ViewRouter(Router);

#[derive(Debug, Clone)]
struct ViewRouterState {
    pool: Pool,
    tera: Arc<Tera>,
}

impl ViewRouterState {
    fn new(pool: Pool) -> Self {
        let mut tera = Tera::new("src/views/templates/**/*").expect("tera parsing error");
        let localizer = Localizer::new();
        tera.register_function("fluent", localizer);

        Self {
            pool,
            tera: Arc::new(tera),
        }
    }
}

impl ViewRouter {
    pub fn new(pool: Pool) -> Self {
        Self(
            Router::new()
                // Left for reference, not in use 20231101
                // .route(
                //     "/:lang/upload",
                //     get(|State(state): State<ViewRouterState>| async move {
                //         let mut context = Context::new();
                //         context.insert("name", "austin");
                //         let html = state
                //             .tera
                //             .render("upload.html", &context)
                //             .expect("render error");
                //         Html(html)
                //     }),
                // )
                .route("/:lang", get(|| async { Redirect::to("/lists") }))
                .route("/:lang/", get(|| async { Redirect::to("/lists") }))
                .route("/:lang/lists", get(lists_view))
                .route(
                    "/:lang/lists/:list_id",
                    get(
                        |State(state): State<ViewRouterState>,
                         claim: Option<Extension<Claims>>,
                         Extension(lang): Extension<TeraLanguageIdentifier>,
                         Path((_, list_id)): Path<(String, u64)>| async move {
                            let claim = return_if_not_logged_in!(claim);

                            let mut conn = state.pool.get_conn().await.expect("Sql Error");
                            let list = List::get(&mut conn, list_id).await.expect("Sql Error");

                            if let Some(mut list) = list {
                                let list_items = Item::get_by_list(&mut conn, list_id)
                                    .await
                                    .expect("Sql error");
                                list.items = Some(list_items);

                                Html(render_list(&state.tera, &list, claim.sub, &lang))
                                    .into_response()
                            } else {
                                StatusCode::NOT_FOUND.into_response()
                            }
                        },
                    ),
                )
                .route(
                    "/:lang/login",
                    get(|State(state): State<ViewRouterState>,
                    Extension(lang): Extension<TeraLanguageIdentifier>,| async move {
                        let mut ctx = Context::new();
                        ctx.insert("lang", &lang);

                        let html = state
                            .tera
                            .render("login.html", &ctx)
                            .expect("Template failed");

                        Html(html)
                    }),
                )
                .route("/:lang/families", get(view_families))
                .layer(
                    tower::ServiceBuilder::new()
                        .layer(LanguageIdentifierExtractorLayer)
                        .layer(JwTokenReaderLayer),
                )
                .with_state(ViewRouterState::new(pool)),
        )
    }
}

impl Into<Router> for ViewRouter {
    fn into(self) -> Router {
        self.0
    }
}

async fn lists_view(
    State(state): State<ViewRouterState>,
    claim: Option<Extension<Claims>>,
    Extension(lang): Extension<TeraLanguageIdentifier>,
) -> axum::response::Response {
    let claim = return_if_not_logged_in!(claim);

    // TODO join futures
    let lists: Vec<String> = List::paginate(&state.pool, claim.sub)
        .await
        .expect("Pagination failed")
        .iter()
        .map(|list| render_list(&state.tera, list, claim.sub, &lang))
        .collect();

    let families = Family::paginate(&state.pool, claim.sub, false)
        .await
        .expect("Sql error");

    let mut ctx = Context::new();
    ctx.insert("lists", &lists);
    ctx.insert("families", &families);
    ctx.insert("lang", &lang);

    let html = state.tera.render("lists.html", &ctx).expect("render error");

    Html(html).into_response()
}

async fn view_families(
    State(state): State<ViewRouterState>,
    claim: Option<Extension<Claims>>,
    Extension(lang): Extension<TeraLanguageIdentifier>,
) -> axum::response::Response {
    let claim = return_if_not_logged_in!(claim);

    let families = Family::paginate(&state.pool, claim.sub, true)
        .await
        .expect("Sql Error");

    let mut ctx = Context::new();
    ctx.insert("families", &families);
    ctx.insert("lang", &lang);

    let html = state
        .tera
        .render("families.html", &ctx)
        .expect("Tera template error");

    Html(html).into_response()
}

/// Renders a list into a listo-list web component HTML template
fn render_list(tera: &Tera, list: &List, user_id: u64, lang: &TeraLanguageIdentifier) -> String {
    let mut ctx = Context::new();
    ctx.insert("list", list);
    ctx.insert("user_id", &user_id);
    ctx.insert("lang", lang);

    tera.render("components/listo-list.html", &ctx)
        .expect("List template error")
}
