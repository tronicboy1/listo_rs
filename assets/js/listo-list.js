//@ts-check
import {LitElement, css, html} from "lit";
import {Subject, mergeMap, take, takeUntil, tap} from "rxjs";
import {filterForDoubleClick} from "@tronicboy/rxjs-operators";

export const tagName = "listo-list";

export class ListoList extends LitElement {
  static properties = {
    //@ts-ignore
    _items: {type: Array, attribute: "list-items", converter: text => JSON.parse(text)},
    listId: {type: Number, attribute: "list-id"},
    _loading: {state: true},
    _deletingIds: {state: true},
  };

  constructor() {
    super();
    /** @type {any[]} */
    this._items = [];
    this.listId = 0;
    this.form = /** @type {HTMLFormElement} */ (this.shadowRoot?.querySelector("form"));
    this._loading = false;
    this._deletingIds = new Set();
    this._first_render = true;
    /** @type {Subject<number>} */
    this._deleteClick = new Subject();
    /** @type {Subject<void>} */
    this._deleteListClick = new Subject();
    /** @type {Subject<void>} */
    this._teardown = new Subject();
  }

  connectedCallback() {
    super.connectedCallback();

    this.form.addEventListener("submit", this.handleFormSubmit);
    document.addEventListener("visibilitychange", this.handleVisibility);

    this._deleteClick
      .pipe(
        filterForDoubleClick(200),
        takeUntil(this._teardown),
        tap(id => {
          this._loading = true;
          this._deletingIds.add(id);
        }),
        mergeMap(itemId =>
          fetch(`/api/v1/lists/${this.listId}/items/${itemId}`, {method: "DELETE"}).finally(() => {
            this._deletingIds.delete(itemId);
          })
        ),
        mergeMap(() => this.refreshList()),
        tap(() => {
          this._loading = false;
        })
      )
      .subscribe();

    this._deleteListClick
      .pipe(
        filterForDoubleClick(200),
        take(1),
        takeUntil(this._teardown),
        mergeMap(() =>
          fetch(`/api/v1/lists/${this.listId}`, {
            method: "DELETE",
          })
        )
      )
      .subscribe(res => {
        if (res.ok) {
          this.remove();
        }
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._teardown.next();
    document.removeEventListener("visibilitychange", this.handleVisibility);
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

  handleVisibility = () => {
    if (document.visibilityState === "visible") {
      this.refreshList();
    }
  };

  refreshList() {
    return fetch(`/api/v1/lists/${this.listId}/items`)
      .then(res => res.json())
      .catch(() => this.remove())
      .then(items => {
        this._items = items;
      });
  }

  render() {
    if (this._first_render && this.renderRoot instanceof HTMLElement) {
      this.renderRoot.innerHTML = "";
      this._first_render = false;
    }

    return html`${this._items.length !== 0
      ? this._items.map(
          item => html` ${this._loading ? html`` : ""}
            <li
              class=${`item ${this._deletingIds.has(item.item_id) ? "deleting" : ""}`}
              @click=${() => this._deleteClick.next(item.item_id)}
            >
              ${item.name}
            </li>`
        )
      : html`<button type="button" class="delete" @click=${() => this._deleteListClick.next()}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path
              d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
            />
          </svg>
        </button>`}`;
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoList);
}
