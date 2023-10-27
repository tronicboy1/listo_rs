//@ts-check
import {LitElement, html} from "lit";

export const tagName = "listo-list";

export class ListoList extends LitElement {
  static properties = {
    _items: {state: true},
    listId: {type: Number, attribute: "list-id"},
  };

  // _first_render;

  // _items;
  // listId;
  // form;
  // _loading;

  constructor() {
    super();
    /** @type {any[]} */
    this._items = [];
    this.listId = 0;
    this.form = /** @type {HTMLFormElement} */ (this.shadowRoot?.querySelector("form"));
    this._loading = false;
    this._first_render = true;
  }

  connectedCallback() {
    super.connectedCallback();

    this.form.addEventListener("submit", this.handleFormSubmit);
  }

  createRenderRoot() {
    const renderRoot = /** @type {HTMLUListElement} */ (this.querySelector("ul"));

    return renderRoot;
  }

  /**
   *
   * @param {Event} event
   */
  handleFormSubmit = event => {
    event.preventDefault();

    if (this._loading) {
      return;
    }

    const formData = new FormData(this.form);
    let name = String(formData.get("name"));
    console.log(name);

    this._loading = true;
    fetch(`/api/v1/lists/${this.listId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({name}),
    })
      .then(() => {
        this.form.reset();
        return this.refreshList();
      })
      .finally(() => (this._loading = false));
  };

  refreshList() {
    return fetch(`/api/v1/lists/${this.listId}/items`)
      .then(res => res.json())
      .then(items => {
        this._items = items;
      });
  }

  render() {
    if (this._items.length === 0) {
      return html``;
    }

    if (this._first_render && this.renderRoot instanceof HTMLElement) {
      this.renderRoot.innerHTML = "";
      super.connectedCallback();
      this._first_render = false;
    }

    return html`${this._items.map(item => html`<li>${item.name}</li>`)}`;
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoList);
}
