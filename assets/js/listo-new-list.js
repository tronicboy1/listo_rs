import {LitElement} from "lit";

export const tagName = "listo-new-list";

export class ListoNewList extends LitElement {
  constructor() {
    super();
    this._form = /** @type {HTMLFormElement} */ (this.querySelector("form"));
    this._listOfListsRoot = /** @type {HTMLUListElement} */ (document.querySelector("ul#list-of-lists"));
    this._loading = false;
  }

  connectedCallback() {
    this._form.addEventListener("submit", this.handleSubmit);
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
      .then(() => this._form.reset())
      .finally(() => (this._loading = false));
  };
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoNewList);
}
