import {LitElement, html} from "lit";
import {Subject, mergeMap, switchMap, take, takeUntil, tap} from "rxjs";
import {filterForDoubleClick} from "@tronicboy/rxjs-operators";
import {property} from "lit/decorators.js";
import {ItemChangeMessage} from "./listo-lists-manager";
import {Localization} from "./fluent";

export const tagName = "listo-list";

export class ListoList extends LitElement {
  @property({
    attribute: "list-items",
    type: Array,
    converter(value, _type) {
      return JSON.parse(value ?? "[]");
    },
  })
  _items: any[] = [];
  @property({attribute: "list-id", type: Number}) listId = 0;
  @property({attribute: "user-id", type: Number}) userId = 0;
  @property({attribute: "locale-ident"}) localIdent = "en";

  private _deleteClick = new Subject<number>();
  private _deleteListClick = new Subject<void>();
  private _teardown = new Subject<void>();
  private _refresh = new Subject<void>();

  private _first_render = true;
  private _deletingIds = new Set();
  private _loading = false;
  form = this.shadowRoot!.querySelector("form")!;

  connectedCallback() {
    super.connectedCallback();

    this.form.addEventListener("submit", this.handleFormSubmit);
    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("update-list", this.handleUpdateList);

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
        )
      )
      .subscribe(() => {
        this._refresh.next();
        this._loading = false;
      });

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

    this._refresh
      .pipe(
        takeUntil(this._teardown),
        switchMap(() => this.refreshList())
      )
      .subscribe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._teardown.next();
    document.removeEventListener("visibilitychange", this.handleVisibility);
    window.removeEventListener("update-list", this.handleUpdateList);
  }

  handleUpdateList = ({detail}: CustomEvent<ItemChangeMessage>) => {
    if (detail.list_id !== this.listId || this.userId === detail.user_id) {
      return;
    }

    this._refresh.next();
  };

  protected createRenderRoot() {
    const renderRoot = this.querySelector("ul")!;

    return renderRoot;
  }

  handleFormSubmit = (event: Event) => {
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
        this._refresh.next();
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
      : html`<button
          type="button"
          class="delete"
          aria-label=${Localization.formatMessage(this.localIdent, "listo-list-delete-button") ?? ""}
          @click=${() => this._deleteListClick.next()}
        >
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
