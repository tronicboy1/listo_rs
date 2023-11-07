import {LitElement} from "lit";

export const tagName = "listo-registration";

export class ListoRegistration extends LitElement {
  static properties = {
    _mode: {type: String, attribute: "mode"},
  };

  get mode() {
    return this._mode;
  }

  /**
   * @param {"LOGIN" | "REGISTER" | "WEBAUTHN"} val
   */
  set mode(val) {
    this._mode = val;

    if (val === "WEBAUTHN") {
      this._passwordInput.toggleAttribute("disabled", true);
    } else {
      this._passwordInput.toggleAttribute("disabled", false);
    }
  }

  constructor() {
    super();
    this._form = /** @type {HTMLFormElement} */ (this.querySelector("form"));
    this._loginButton = /** @type {HTMLButtonElement} */ (this.querySelector("#login-button"));
    this._registerButton = /** @type {HTMLButtonElement} */ (this.querySelector("#register-button"));
    this._webauthnButton = /** @type {HTMLButtonElement} */ (this.querySelector("#webauthn-button"));
    this._passwordInput = /** @type {HTMLInputElement} */ (this.querySelector("input#password"));
    /** @type {"LOGIN" | "REGISTER" | "WEBAUTHN"} */
    this._mode = "LOGIN";
    this._loading = false;
  }

  connectedCallback() {
    this._form.addEventListener("submit", this.handleSubmit);
    this._loginButton.addEventListener("click", () => {
      this._loginButton.classList.add("inactive");
      this._registerButton.classList.remove("inactive");
      this._webauthnButton.classList.remove("inactive");
      this.mode = "LOGIN";
    });

    this._registerButton.addEventListener("click", () => {
      this._registerButton.classList.add("inactive");
      this._loginButton.classList.remove("inactive");
      this._webauthnButton.classList.remove("inactive");
      this.mode = "REGISTER";
    });

    this._webauthnButton.addEventListener("click", () => {
      this._webauthnButton.classList.add("inactive");
      this._loginButton.classList.remove("inactive");
      this._registerButton.classList.remove("inactive");
      this.mode = "WEBAUTHN";
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

    this._loading = true;
    switch (this.mode) {
      case "WEBAUTHN":
        fetch("/api/v1/auth/webauthn/registration/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({email}),
        })
          .then(res => res.json())
          .then(ccr => {
            console.log(decodeB64(ccr.publicKey.challenge));
            ccr.publicKey.challenge = decodeB64(ccr.publicKey.challenge);
            ccr.publicKey.user.id = decodeB64(ccr.publicKey.user.id);

            return navigator.credentials.create(ccr);
          })
          .then(cred => {
            if (!cred) {
              throw ReferenceError("Credentials not provided from browser");
            }

            const rawId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));

            console.log(encodeB64(cred.response.clientDataJSON));

            const credParsable = {
              authenticatorAttachment: cred.authenticatorAttachment,
              rawId,
              id: cred.id,
              response: {
                attestationObject: encodeB64(cred.response.attestationObject),
                clientDataJSON: encodeB64(cred.response.clientDataJSON),
              },
              type: cred.type,
            };

            const body = JSON.stringify(credParsable);
            console.log(cred, body);

            return fetch("/api/v1/auth/webauthn/registration/finish", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "same-origin",
              body,
            });
          })
          .then(console.log);
        break;

      default:
        let uri = this._mode.toUpperCase() === "LOGIN" ? "/api/v1/auth/login" : "/api/v1/auth/register";
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
        break;
    }
  };
}

if (!customElements.get(tagName)) {
  customElements.define(tagName, ListoRegistration);
}


// Source: https://github.com/google/webauthndemo/blob/main/src/public/scripts/base64url.ts
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const lookup = new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}


function encodeB64(arraybuffer) {
  const bytes = new Uint8Array(arraybuffer);
  const len = bytes.length;
  let base64 = "";

  for (let i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += chars[bytes[i + 2] & 63];
  }

  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1);
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2);
  }

  return base64;
}

function decodeB64(base64) {
  const len = base64.length;
  const bufferLength = base64.length * 0.75;
  const arraybuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arraybuffer);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return arraybuffer;
}
