import {LitElement, html} from "lit";

export const tagName = "listo-new-list";

export class ListoNewList extends LitElement {
  static properties = {
    _open: {state: true},
  };

  constructor() {
    super();
    this._form = /** @type {HTMLFormElement} */ (this.querySelector("form"));
    this._listOfListsRoot = /** @type {HTMLUListElement} */ (document.querySelector("ul#list-of-lists"));
    this._loading = false;
    this._open = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this._form.addEventListener("submit", this.handleSubmit);
    this._form.addEventListener("blur", () => (this._open = false));
  }

  render() {
    return html` <link rel="stylesheet" href="/assets/css/listo-new-list.css" />
      ${this._open
        ? html`<slot name="form"></slot>`
        : html`<div id="open-add-list" slot="open-button" @click=${() => (this._open = !this._open)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0, 0, 48, 48">
              <path d="M22.5 38V25.5H10V22.5H22.5V10H25.5V22.5H38V25.5H25.5V38Z" />
            </svg>
          </div>`}`;
  }

  /**
   * @param {Event} event
   */
  handleSubmit = event => {
    event.preventDefault();

    if (this._loading) {
      return;
    }

    const formData = new FormData(this._form);
    const name = String(formData.get("list-name"));
    const family_id = Number(formData.get("family-id"));

    this._loading = true;
    fetch("/api/v1/lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({name, family_id}),
    })
      .then(res => res.json())
      .then(listId =>
        fetch(`/lists/${listId}`)
          .then(res => res.text())
          .then(listHtml => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(listHtml, "text/html");
            const li = doc.querySelector("li");

            if (!li) throw ReferenceError("No list item in HTML from server");

            const shadowTemplate = /** @type {HTMLTemplateElement} */ (
              li.querySelector('template[shadowrootmode="open"]')
            );

            const wc = /** @type {HTMLElement} */ (li.querySelector("listo-list"));
            const sr = wc.attachShadow({mode: "open"});

            sr.innerHTML = shadowTemplate.innerHTML;

            this._listOfListsRoot.append(li);
          })
      )
      .then(() => {
        this._form.reset();
        this._open = false;
      })
      .finally(() => (this._loading = false));
  };

  createRenderRoot() {
    const root = /** @type {ShadowRoot} */ (this.shadowRoot);
    // Clear SSR
    root.innerHTML = "";

    return root;
  }
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoNewList);
}
