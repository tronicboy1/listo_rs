use std::{
    future::Future,
    sync::{atomic::AtomicUsize, Arc},
    task::Poll,
};
use tower::Service;

pub mod auth;

pub struct AppState {
    pub origin: String,
}

impl AppState {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            origin: String::from("My Buthole 🙂"),
        })
    }
}

#[derive(Clone)]
pub struct AddCookieService<T> {
    inner: T,
    pending: Arc<std::sync::atomic::AtomicUsize>,
}

impl<T> AddCookieService<T> {
    pub fn new(inner: T) -> Self {
        Self {
            inner,
            pending: Arc::new(AtomicUsize::new(0)),
        }
    }
}

impl<T, U> Service<http::Request<U>> for AddCookieService<T>
where
    T: Service<http::Request<U>, Response = http::Response<U>> + Clone + 'static,
    U: 'static,
{
    type Response = http::Response<U>;
    type Error = T::Error;
    type Future = std::pin::Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        let pending_count = self.pending.load(std::sync::atomic::Ordering::Relaxed);

        println!("pending: {}", pending_count);

        if pending_count < 1000 {
            Poll::Ready(Ok(()))
        } else {
            Poll::Pending
        }
    }

    fn call(&mut self, req: http::Request<U>) -> Self::Future {
        self.pending
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let mut this = self.clone();

        Box::pin(async move {
            let response = this.inner.call(req).await?;

            this.pending
                .fetch_min(1, std::sync::atomic::Ordering::Relaxed);
            Ok(response)
        })
    }
}
