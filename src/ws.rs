use axum::{
    extract::{ws::WebSocket, WebSocketUpgrade},
    response::Response,
};

pub async fn handle_ws_req(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        println!("Message: {:?}", msg);
    }
}
