import {webSocket} from "rxjs/webSocket";

export const tagName = "listo-lists-manager";

export class ListoListManager extends HTMLElement {
  connectedCallback() {
    console.log("hello");
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoListManager);
}
