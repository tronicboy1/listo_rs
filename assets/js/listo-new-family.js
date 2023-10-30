export const tagName = "listo-new-family";

export class ListoNewFamily extends HTMLElement {
  form = /** @type {HTMLFormElement} */ (this.querySelector("form"));
  _loading = false;

  connectedCallback() {
    this.form.addEventListener("submit", this.handleSubmit);
  }

  /**
   *
   * @param {Event} event
   */
  handleSubmit = event => {
    event.preventDefault();

    if (this._loading) {
      return;
    }

    const formData = new FormData(this.form);

    const family_name = String(formData.get("family-name"));

    this._loading = true;
    fetch("/api/v1/families", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({family_name}),
    })
      .then(res => {
        if (res.ok) {
          location.reload();
        }
      })
      .finally(() => (this._loading = false));
  };
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoNewFamily);
}
