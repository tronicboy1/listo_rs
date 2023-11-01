import { LitElement as A, html as c } from "lit";
import { buffer as T, debounceTime as k, filter as M, map as R, Subject as d, takeUntil as y, tap as x, mergeMap as E, take as j, switchMap as D } from "rxjs";
function S(r = 250) {
  return (t) => t.pipe(T(t.pipe(k(r))), M((e) => e.length > 1), R(([e]) => e));
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const p = globalThis, v = p.ShadowRoot && (p.ShadyCSS === void 0 || p.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, L = Symbol(), w = /* @__PURE__ */ new WeakMap();
let I = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== L)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (v && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = w.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && w.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const z = (r) => new I(typeof r == "string" ? r : r + "", void 0, L), N = (r, t) => {
  if (v)
    r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else
    for (const e of t) {
      const s = document.createElement("style"), i = p.litNonce;
      i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, r.appendChild(s);
    }
}, P = v ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules)
    e += s.cssText;
  return z(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: q, defineProperty: H, getOwnPropertyDescriptor: Z, getOwnPropertyNames: F, getOwnPropertySymbols: J, getPrototypeOf: V } = Object, f = globalThis, C = f.trustedTypes, B = C ? C.emptyScript : "", K = f.reactiveElementPolyfillSupport, l = (r, t) => r, u = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? B : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, t) {
  let e = r;
  switch (t) {
    case Boolean:
      e = r !== null;
      break;
    case Number:
      e = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(r);
      } catch {
        e = null;
      }
  }
  return e;
} }, b = (r, t) => !q(r, t), U = { attribute: !0, type: String, converter: u, reflect: !1, hasChanged: b };
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
class a extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = U) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && H(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: o } = Z(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get() {
      return i?.call(this);
    }, set(n) {
      const h = i?.call(this);
      o.call(this, n), this.requestUpdate(t, h, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? U;
  }
  static _$Ei() {
    if (this.hasOwnProperty(l("elementProperties")))
      return;
    const t = V(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(l("finalized")))
      return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(l("properties"))) {
      const e = this.properties, s = [...F(e), ...J(e)];
      for (const i of s)
        this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0)
        for (const [s, i] of e)
          this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s)
        e.unshift(P(i));
    } else
      t !== void 0 && e.push(P(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$Eg = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$ES ??= []).push(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$ES?.splice(this._$ES.indexOf(t) >>> 0, 1);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys())
      this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return N(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$ES?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$ES?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$EO(t, e) {
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : u).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = s.getPropertyOptions(i), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : u;
      this._$Em = i, this[i] = n.fromAttribute(e, o.type), this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, o) {
    if (t !== void 0) {
      if (s ??= this.constructor.getPropertyOptions(t), !(s.hasChanged ?? b)(i ? o : this[t], e))
        return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$Eg = this._$EP());
  }
  C(t, e, s) {
    this._$AL.has(t) || this._$AL.set(t, e), s.reflect === !0 && this._$Em !== t && (this._$Ej ??= /* @__PURE__ */ new Set()).add(t);
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$Eg;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending)
      return;
    if (!this.hasUpdated) {
      if (this._$Ep) {
        for (const [i, o] of this._$Ep)
          this[i] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0)
        for (const [i, o] of s)
          o.wrapped !== !0 || this._$AL.has(i) || this[i] === void 0 || this.C(i, this[i], o);
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$ES?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$ET();
    } catch (s) {
      throw t = !1, this._$ET(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$ES?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$ET() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$Eg;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Ej &&= this._$Ej.forEach((e) => this._$EO(e, this[e])), this._$ET();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
a.elementStyles = [], a.shadowRootOptions = { mode: "open" }, a[l("elementProperties")] = /* @__PURE__ */ new Map(), a[l("finalized")] = /* @__PURE__ */ new Map(), K?.({ ReactiveElement: a }), (f.reactiveElementVersions ??= []).push("2.0.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const W = { attribute: !0, type: String, converter: u, reflect: !1, hasChanged: b }, G = (r = W, t, e) => {
  const { kind: s, metadata: i } = e;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), o.set(e.name, r), s === "accessor") {
    const { name: n } = e;
    return { set(h) {
      const _ = t.get.call(this);
      t.set.call(this, h), this.requestUpdate(n, _, r);
    }, init(h) {
      return h !== void 0 && this.C(n, void 0, r), h;
    } };
  }
  if (s === "setter") {
    const { name: n } = e;
    return function(h) {
      const _ = this[n];
      t.call(this, h), this.requestUpdate(n, _, r);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function g(r) {
  return (t, e) => typeof e == "object" ? G(r, t, e) : ((s, i, o) => {
    const n = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, n ? { ...s, wrapped: !0 } : s), n ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(r, t, e);
}
var Q = Object.defineProperty, X = Object.getOwnPropertyDescriptor, $ = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? X(t, e) : t, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && Q(t, e, i), i;
};
const O = "listo-list";
class m extends A {
  constructor() {
    super(...arguments), this._items = [], this.listId = 0, this.userId = 0, this._deleteClick = new d(), this._deleteListClick = new d(), this._teardown = new d(), this._refresh = new d(), this._first_render = !0, this._deletingIds = /* @__PURE__ */ new Set(), this._loading = !1, this.form = this.shadowRoot.querySelector("form"), this.handleUpdateList = ({ detail: t }) => {
      t.list_id !== this.listId || this.userId === t.user_id || this._refresh.next();
    }, this.handleFormSubmit = (t) => {
      if (t.preventDefault(), this._loading)
        return;
      const e = new FormData(this.form);
      let s = String(e.get("name"));
      this._loading = !0, fetch(`/api/v1/lists/${this.listId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: s })
      }).then(() => {
        this.form.reset(), this._refresh.next();
      }).finally(() => this._loading = !1);
    }, this.handleVisibility = () => {
      document.visibilityState === "visible" && this.refreshList();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.form.addEventListener("submit", this.handleFormSubmit), document.addEventListener("visibilitychange", this.handleVisibility), window.addEventListener("update-list", this.handleUpdateList), this._deleteClick.pipe(
      S(200),
      y(this._teardown),
      x((t) => {
        this._loading = !0, this._deletingIds.add(t);
      }),
      E(
        (t) => fetch(`/api/v1/lists/${this.listId}/items/${t}`, { method: "DELETE" }).finally(() => {
          this._deletingIds.delete(t);
        })
      )
    ).subscribe(() => {
      this._refresh.next(), this._loading = !1;
    }), this._deleteListClick.pipe(
      S(200),
      j(1),
      y(this._teardown),
      E(
        () => fetch(`/api/v1/lists/${this.listId}`, {
          method: "DELETE"
        })
      )
    ).subscribe((t) => {
      t.ok && this.remove();
    }), this._refresh.pipe(
      y(this._teardown),
      D(() => this.refreshList())
    ).subscribe();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._teardown.next(), document.removeEventListener("visibilitychange", this.handleVisibility), window.removeEventListener("update-list", this.handleUpdateList);
  }
  createRenderRoot() {
    return this.querySelector("ul");
  }
  refreshList() {
    return fetch(`/api/v1/lists/${this.listId}/items`).then((t) => t.json()).catch(() => this.remove()).then((t) => {
      this._items = t;
    });
  }
  render() {
    return this._first_render && this.renderRoot instanceof HTMLElement && (this.renderRoot.innerHTML = "", this._first_render = !1), c`${this._items.length !== 0 ? this._items.map(
      (t) => c` ${this._loading ? c`` : ""}
            <li
              class=${`item ${this._deletingIds.has(t.item_id) ? "deleting" : ""}`}
              @click=${() => this._deleteClick.next(t.item_id)}
            >
              ${t.name}
            </li>`
    ) : c`<button
          type="button"
          class="delete"
          aria-label="delete this list"
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
$([
  g({
    attribute: "list-items",
    type: Array,
    converter(r, t) {
      return JSON.parse(r ?? "[]");
    }
  })
], m.prototype, "_items", 2);
$([
  g({ attribute: "list-id", type: Number })
], m.prototype, "listId", 2);
$([
  g({ attribute: "user-id", type: Number })
], m.prototype, "userId", 2);
customElements.get(O) || customElements.define(O, m);
export {
  m as ListoList,
  O as tagName
};
