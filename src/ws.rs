use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::{IntoResponse, Response},
    Extension,
};
use http::StatusCode;

use crate::{auth::Claims, AppState};

pub async fn handle_ws_req(
    ws: WebSocketUpgrade,
    claim: Option<Extension<Claims>>,
    State(state): State<AppState>,
) -> Response {
    if let Some(Extension(Claims { sub, .. })) = claim {
        ws.on_upgrade(move |socket| handle_socket(socket, sub, state))
    } else {
        StatusCode::UNAUTHORIZED.into_response()
    }
}

async fn handle_socket(mut socket: WebSocket, user_id: u64, state: AppState) {
    let mut rx = state.new_item_tx.subscribe();

    while let Ok(item) = rx.recv().await {
        let json = serde_json::to_string(&item).expect("Invalid JSON");

        match socket.send(Message::Text(json)).await {
            Err(err) => {
                dbg!(err);
                break;
            }
            _ => {}
        };
    }
}
