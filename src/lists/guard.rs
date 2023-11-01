use std::pin::Pin;

use axum::response::IntoResponse;
use std::future::Future;
use http::StatusCode;
use mysql_async::Pool;
use tower::{Layer, Service};

use crate::auth::Claims;

use super::model::List;

#[derive(Debug, Clone)]
pub struct ListGuard<S> {
    inner: S,
    pool: Pool,
}

impl<S, B> Service<axum::http::Request<B>> for ListGuard<S>
where
    S: Service<axum::http::Request<B>, Response = axum::response::Response>
        + Send
        + 'static
        + Clone,
    S::Future: Send + 'static,
    B: Send + 'static,
{
    type Error = S::Error;
    type Response = axum::response::Response;
    type Future =
        Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send + 'static>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        // No backpressure
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: axum::http::Request<B>) -> Self::Future {
        let claim = req.extensions().get::<Claims>();

        if claim.is_none() {
            return Box::pin(async { Ok(StatusCode::UNAUTHORIZED.into_response()) });
        }

        let Claims { sub, .. } = claim.unwrap();
        let user_id = *sub;

        let mut path_parts = req.uri().path().split('/');
        path_parts.next();

        let list_id: Option<u64> = path_parts.next().and_then(|list_id| list_id.parse().ok());

        let response_fut = self.inner.call(req);
        if let Some(list_id) = list_id {
            let this = self.clone();
            let fut = async move {
                let conn = this.pool.get_conn();
                let is_owner: Result<bool, mysql_async::Error> = async move {
                    let conn = conn.await?;

                    List::check_ownership(conn, list_id, user_id).await
                }
                .await;

                match is_owner {
                    Ok(is_owner) => {
                        if is_owner {
                            response_fut.await
                        } else {
                            Ok(StatusCode::FORBIDDEN.into_response())
                        }
                    }
                    Err(_) => Ok(StatusCode::INTERNAL_SERVER_ERROR.into_response()),
                }
            };

            return Box::pin(fut);
        }

        Box::pin(response_fut)
    }
}

#[derive(Debug, Clone)]
pub struct ListGuardLayer {
    pool: Pool,
}

impl ListGuardLayer {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }
}

impl<S> Layer<S> for ListGuardLayer {
    type Service = ListGuard<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service {
            inner,
            pool: self.pool.clone(),
        }
    }
}
