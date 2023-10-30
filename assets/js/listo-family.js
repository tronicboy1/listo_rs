import {filterForDoubleClick} from "@tronicboy/rxjs-operators";
import {LitElement, html} from "lit";
import {Subject, fromEvent, mergeMap, take, takeUntil} from "rxjs";

export const tagName = "listo-family";

export class ListoFamily extends LitElement {
  static properties = {
    familyId: {type: Number, attribute: "family-id"},
    //@ts-ignore
    _members: {type: Array, attribute: "family-members", converter: value => JSON.parse(value)},
  };

  constructor() {
    super();

    this.familyId = 0;
    /** @type {any[]} */
    this._members = [];

    /** @type {Subject<number>} */
    this._deleteClick = new Subject();
    /** @type {Subject<void>} */
    this._teardown = new Subject();

    this._form = /** @type {HTMLFormElement} */ (this.shadowRoot?.querySelector("form"));
    this._loading = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this._form.addEventListener("submit", this.handleNewMember);

    const deleteButton = /** @type {HTMLButtonElement} */ (this.shadowRoot?.querySelector("button.delete"));
    fromEvent(deleteButton, "click")
      .pipe(
        filterForDoubleClick(200),
        take(1),
        takeUntil(this._teardown),
        mergeMap(() => fetch(`/api/v1/families/${this.familyId}`, {method: "DELETE"}))
      )
      .subscribe(() => this.remove());
    this._deleteClick
      .pipe(
        filterForDoubleClick(200),
        take(1),
        takeUntil(this._teardown),
        mergeMap(user_id =>
          fetch(`/api/v1/families/${this.familyId}/members/${user_id}`, {
            method: "DELETE",
          })
        ),
        mergeMap(res => (res.ok ? this.refreshMembers() : Promise.resolve(this._members)))
      )
      .subscribe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._teardown.next();
  }

  refreshMembers() {
    return fetch(`/api/v1/families/${this.familyId}/members`)
      .then(res => (res.ok ? res.json() : Promise.resolve([])))
      .then(members => {
        this._members = members;
      });
  }

  /**
   *
   * @param {Event} event
   */
  handleNewMember = async event => {
    event.preventDefault();

    if (this._loading) {
      return;
    }

    const formData = new FormData(this._form);
    const email = String(formData.get("email"));

    this._loading = true;
    fetch(`/api/v1/families/${this.familyId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email}),
    })
      .then(res => {
        if (res.ok) {
          this._form.reset();
          return this.refreshMembers();
        } else {
          return Promise.resolve();
        }
      })
      .finally(() => {
        this._loading = false;
      });
  };

  render() {
    return this._members.map(
      member => html`<li @click=${() => this._deleteClick.next(member.user_id)}>
        <span>${member.email}</span
        ><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
          <path
            d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
          />
        </svg>
      </li>`
    );
  }

  createRenderRoot() {
    const root = /** @type {HTMLElement} */ (this.shadowRoot?.querySelector("ul"));

    root.innerHTML = "";

    return root;
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoFamily);
}
