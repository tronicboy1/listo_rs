use axum::response::IntoResponse;
use std::future::Future;
use http::StatusCode;
use mysql_async::Pool;
use std::pin::Pin;
use tower::{Layer, Service};

use crate::auth::Claims;

use super::Family;

#[derive(Debug, Clone)]
pub struct FamiliesGuard<S> {
    inner: S,
    pool: Pool,
}

impl<S> FamiliesGuard<S> {
    pub fn new(inner: S, pool: Pool) -> Self {
        Self { inner, pool }
    }
}

impl<S, B> Service<axum::http::Request<B>> for FamiliesGuard<S>
where
    S: Service<axum::http::Request<B>, Response = axum::response::Response>
        + Send
        + Clone
        + 'static,
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
        // No back pressure necessary
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: axum::http::Request<B>) -> Self::Future {
        let user = req.extensions().get::<Claims>().map(|user| user.sub);
        let mut path_parts = req.uri().path().split('/');
        path_parts.next();
        let family_id: Option<u64> = path_parts.next().and_then(|path| path.parse().ok());

        if let Some(user_id) = user {
            let inner_call = self.inner.call(req);

            match family_id {
                // Check ownership
                Some(family_id) => {
                    let pool = self.pool.clone();

                    Box::pin(async move {
                        let is_member: Result<bool, mysql_async::Error> = async move {
                            let mut conn = pool.get_conn().await?;
                            Family::is_member(&mut conn, family_id, user_id).await
                        }
                        .await;

                        match is_member {
                            Ok(is_member) => {
                                if is_member {
                                    inner_call.await
                                } else {
                                    Ok(StatusCode::FORBIDDEN.into_response())
                                }
                            }
                            Err(_) => Ok(StatusCode::INTERNAL_SERVER_ERROR.into_response()),
                        }
                    })
                }
                None => Box::pin(inner_call),
            }
        } else {
            Box::pin(async { Ok(StatusCode::FORBIDDEN.into_response()) })
        }
    }
}

#[derive(Debug, Clone)]
pub struct FamiliesGuardLayer {
    pool: Pool,
}

impl FamiliesGuardLayer {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }
}

impl<S> Layer<S> for FamiliesGuardLayer {
    type Service = FamiliesGuard<S>;

    fn layer(&self, inner: S) -> Self::Service {
        Self::Service::new(inner, self.pool.clone())
    }
}
