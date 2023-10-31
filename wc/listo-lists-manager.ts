import {Subject, retry, takeUntil} from "rxjs";
import {webSocket} from "rxjs/webSocket";

export const tagName = "listo-lists-manager";

export interface ItemChangeMessage {
  user_id: number;
  list_id: number;
}

export class ListoListManager extends HTMLElement {
  socket = webSocket<ItemChangeMessage>({
    url: "ws://" + location.host + "/ws",
    deserializer(e) {
      return JSON.parse(e.data);
    },
  });
  private _teardown = new Subject<void>();

  connectedCallback() {
    this.socket.pipe(retry({count: 5, delay: 2000}), takeUntil(this._teardown)).subscribe(message => {
      window.dispatchEvent(new CustomEvent("update-list", {detail: message}));
    });
  }

  disconnectedCallback() {
    this._teardown.next();
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoListManager);
}

declare global {
  interface WindowEventMap {
    "update-list": CustomEvent<ItemChangeMessage>;
  }
}
