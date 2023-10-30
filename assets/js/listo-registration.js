import {LitElement} from "lit";

export const tagName = "listo-registration";

export class ListoRegistration extends LitElement {
  static properties = {
    _mode: {type: String, attribute: "mode"},
  };

  constructor() {
    super();
    this._form = /** @type {HTMLFormElement} */ (this.querySelector("form"));
    this._loginButton = /** @type {HTMLButtonElement} */ (this.querySelector("#login-button"));
    this._registerButton = /** @type {HTMLButtonElement} */ (this.querySelector("#register-button"));
    /** @type {"LOGIN" | "REGISTER"} */
    this._mode = "LOGIN";
    this._loading = false;
  }

  connectedCallback() {
    this._form.addEventListener("submit", this.handleSubmit);
    this._loginButton.addEventListener("click", () => {
      this._loginButton.classList.add("active");
      this._registerButton.classList.remove("active");
      this._mode = "LOGIN";
    });
    this._registerButton.addEventListener("click", () => {
      this._registerButton.classList.add("active");
      this._loginButton.classList.remove("active");
      this._mode = "REGISTER";
    });
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
    const email = formData.get("email");
    const password = formData.get("password");

    let uri = this._mode.toUpperCase() === "LOGIN" ? "/api/v1/auth/login" : "/api/v1/auth/register";
    this._loading = true;

    grecaptcha.ready(() => {
      grecaptcha.execute("6LcuLlsgAAAAADL_n_1hS7zeQMKX6xbi10jQYIYR", {action: "submit"}).then(token =>
        fetch(uri, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({email, password, token}),
        })
          .then(res => {
            if (res.ok) {
              location.href = "/";
            }
          })
          .finally(() => (this._loading = false))
      );
    });
  };
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoRegistration);
}
