use axum::Router;

use crate::auth::JwTokenReaderLayer;

mod model;

pub struct FamilyRouter(Router);

impl FamilyRouter {
    pub fn new() -> Self {
        Self(Router::new().layer(JwTokenReaderLayer))
    }
}

impl Into<Router> for FamilyRouter {
    fn into(self) -> Router {
        self.0
    }
}
