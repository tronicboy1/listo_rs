import { LitElement as $t, html as S } from "lit";
import { buffer as Rt, debounceTime as At, filter as Ot, map as Tt, Subject as $, takeUntil as M, tap as Pt, mergeMap as G, take as Ct, switchMap as It } from "rxjs";
function H(n = 250) {
  return (t) => t.pipe(Rt(t.pipe(At(n))), Ot((e) => e.length > 1), Tt(([e]) => e));
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A = globalThis, j = A.ShadowRoot && (A.ShadyCSS === void 0 || A.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, pt = Symbol(), J = /* @__PURE__ */ new WeakMap();
let xt = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== pt)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (j && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = J.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && J.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Lt = (n) => new xt(typeof n == "string" ? n : n + "", void 0, pt), Nt = (n, t) => {
  if (j)
    n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else
    for (const e of t) {
      const r = document.createElement("style"), i = A.litNonce;
      i !== void 0 && r.setAttribute("nonce", i), r.textContent = e.cssText, n.appendChild(r);
    }
}, X = j ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules)
    e += r.cssText;
  return Lt(e);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ut, defineProperty: Mt, getOwnPropertyDescriptor: Dt, getOwnPropertyNames: kt, getOwnPropertySymbols: Ft, getPrototypeOf: jt } = Object, P = globalThis, Q = P.trustedTypes, zt = Q ? Q.emptyScript : "", Bt = P.reactiveElementPolyfillSupport, w = (n, t) => n, O = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? zt : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, z = (n, t) => !Ut(n, t), Y = { attribute: !0, type: String, converter: O, reflect: !1, hasChanged: z };
Symbol.metadata ??= Symbol("metadata"), P.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
class E extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Y) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(t, r, e);
      i !== void 0 && Mt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: i, set: o } = Dt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(l) {
      this[e] = l;
    } };
    return { get() {
      return i?.call(this);
    }, set(l) {
      const h = i?.call(this);
      o.call(this, l), this.requestUpdate(t, h, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Y;
  }
  static _$Ei() {
    if (this.hasOwnProperty(w("elementProperties")))
      return;
    const t = jt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(w("finalized")))
      return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(w("properties"))) {
      const e = this.properties, r = [...kt(e), ...Ft(e)];
      for (const i of r)
        this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0)
        for (const [r, i] of e)
          this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, r] of this.elementProperties) {
      const i = this._$Eu(e, r);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r)
        e.unshift(X(i));
    } else
      t !== void 0 && e.push(X(t));
    return e;
  }
  static _$Eu(t, e) {
    const r = e.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const r of e.keys())
      this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Nt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$ES?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$ES?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, r) {
    this._$AK(t, r);
  }
  _$EO(t, e) {
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const o = (r.converter?.toAttribute !== void 0 ? r.converter : O).toAttribute(e, r.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = r.getPropertyOptions(i), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : O;
      this._$Em = i, this[i] = l.fromAttribute(e, o.type), this._$Em = null;
    }
  }
  requestUpdate(t, e, r, i = !1, o) {
    if (t !== void 0) {
      if (r ??= this.constructor.getPropertyOptions(t), !(r.hasChanged ?? z)(i ? o : this[t], e))
        return;
      this.C(t, e, r);
    }
    this.isUpdatePending === !1 && (this._$Eg = this._$EP());
  }
  C(t, e, r) {
    this._$AL.has(t) || this._$AL.set(t, e), r.reflect === !0 && this._$Em !== t && (this._$Ej ??= /* @__PURE__ */ new Set()).add(t);
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
      const r = this.constructor.elementProperties;
      if (r.size > 0)
        for (const [i, o] of r)
          o.wrapped !== !0 || this._$AL.has(i) || this[i] === void 0 || this.C(i, this[i], o);
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$ES?.forEach((r) => r.hostUpdate?.()), this.update(e)) : this._$ET();
    } catch (r) {
      throw t = !1, this._$ET(), r;
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
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[w("elementProperties")] = /* @__PURE__ */ new Map(), E[w("finalized")] = /* @__PURE__ */ new Map(), Bt?.({ ReactiveElement: E }), (P.reactiveElementVersions ??= []).push("2.0.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = { attribute: !0, type: String, converter: O, reflect: !1, hasChanged: z }, Wt = (n = Kt, t, e) => {
  const { kind: r, metadata: i } = e;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), o.set(e.name, n), r === "accessor") {
    const { name: l } = e;
    return { set(h) {
      const m = t.get.call(this);
      t.set.call(this, h), this.requestUpdate(l, m, n);
    }, init(h) {
      return h !== void 0 && this.C(l, void 0, n), h;
    } };
  }
  if (r === "setter") {
    const { name: l } = e;
    return function(h) {
      const m = this[l];
      t.call(this, h), this.requestUpdate(l, m, n);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function C(n) {
  return (t, e) => typeof e == "object" ? Wt(n, t, e) : ((r, i, o) => {
    const l = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, l ? { ...r, wrapped: !0 } : r), l ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(n, t, e);
}
class I {
  /**
   * Create a `FluentType` instance.
   *
   * @param value The JavaScript value to wrap.
   */
  constructor(t) {
    this.value = t;
  }
  /**
   * Unwrap the raw value stored by this `FluentType`.
   */
  valueOf() {
    return this.value;
  }
}
class c extends I {
  /**
   * Create an instance of `FluentNone` with an optional fallback value.
   * @param value The fallback value of this `FluentNone`.
   */
  constructor(t = "???") {
    super(t);
  }
  /**
   * Format this `FluentNone` to the fallback string.
   */
  toString(t) {
    return `{${this.value}}`;
  }
}
class d extends I {
  /**
   * Create an instance of `FluentNumber` with options to the
   * `Intl.NumberFormat` constructor.
   *
   * @param value The number value of this `FluentNumber`.
   * @param opts Options which will be passed to `Intl.NumberFormat`.
   */
  constructor(t, e = {}) {
    super(t), this.opts = e;
  }
  /**
   * Format this `FluentNumber` to a string.
   */
  toString(t) {
    try {
      return t.memoizeIntlObject(Intl.NumberFormat, this.opts).format(this.value);
    } catch (e) {
      return t.reportError(e), this.value.toString(10);
    }
  }
}
class b extends I {
  /**
   * Create an instance of `FluentDateTime` with options to the
   * `Intl.DateTimeFormat` constructor.
   *
   * @param value The number value of this `FluentDateTime`, in milliseconds.
   * @param opts Options which will be passed to `Intl.DateTimeFormat`.
   */
  constructor(t, e = {}) {
    super(t), this.opts = e;
  }
  /**
   * Format this `FluentDateTime` to a string.
   */
  toString(t) {
    try {
      return t.memoizeIntlObject(Intl.DateTimeFormat, this.opts).format(this.value);
    } catch (e) {
      return t.reportError(e), new Date(this.value).toISOString();
    }
  }
}
const tt = 100, Zt = "⁨", qt = "⁩";
function Vt(n, t, e) {
  if (e === t || e instanceof d && t instanceof d && e.value === t.value)
    return !0;
  if (t instanceof d && typeof e == "string") {
    let r = n.memoizeIntlObject(Intl.PluralRules, t.opts).select(t.value);
    if (e === r)
      return !0;
  }
  return !1;
}
function et(n, t, e) {
  return t[e] ? g(n, t[e].value) : (n.reportError(new RangeError("No default")), new c());
}
function F(n, t) {
  const e = [], r = /* @__PURE__ */ Object.create(null);
  for (const i of t)
    i.type === "narg" ? r[i.name] = _(n, i.value) : e.push(_(n, i));
  return { positional: e, named: r };
}
function _(n, t) {
  switch (t.type) {
    case "str":
      return t.value;
    case "num":
      return new d(t.value, {
        minimumFractionDigits: t.precision
      });
    case "var":
      return Gt(n, t);
    case "mesg":
      return Ht(n, t);
    case "term":
      return Jt(n, t);
    case "func":
      return Xt(n, t);
    case "select":
      return Qt(n, t);
    default:
      return new c();
  }
}
function Gt(n, { name: t }) {
  let e;
  if (n.params)
    if (Object.prototype.hasOwnProperty.call(n.params, t))
      e = n.params[t];
    else
      return new c(`$${t}`);
  else if (n.args && Object.prototype.hasOwnProperty.call(n.args, t))
    e = n.args[t];
  else
    return n.reportError(new ReferenceError(`Unknown variable: $${t}`)), new c(`$${t}`);
  if (e instanceof I)
    return e;
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return new d(e);
    case "object":
      if (e instanceof Date)
        return new b(e.getTime());
    default:
      return n.reportError(new TypeError(`Variable type not supported: $${t}, ${typeof e}`)), new c(`$${t}`);
  }
}
function Ht(n, { name: t, attr: e }) {
  const r = n.bundle._messages.get(t);
  if (!r)
    return n.reportError(new ReferenceError(`Unknown message: ${t}`)), new c(t);
  if (e) {
    const i = r.attributes[e];
    return i ? g(n, i) : (n.reportError(new ReferenceError(`Unknown attribute: ${e}`)), new c(`${t}.${e}`));
  }
  return r.value ? g(n, r.value) : (n.reportError(new ReferenceError(`No value: ${t}`)), new c(t));
}
function Jt(n, { name: t, attr: e, args: r }) {
  const i = `-${t}`, o = n.bundle._terms.get(i);
  if (!o)
    return n.reportError(new ReferenceError(`Unknown term: ${i}`)), new c(i);
  if (e) {
    const h = o.attributes[e];
    if (h) {
      n.params = F(n, r).named;
      const m = g(n, h);
      return n.params = null, m;
    }
    return n.reportError(new ReferenceError(`Unknown attribute: ${e}`)), new c(`${i}.${e}`);
  }
  n.params = F(n, r).named;
  const l = g(n, o.value);
  return n.params = null, l;
}
function Xt(n, { name: t, args: e }) {
  let r = n.bundle._functions[t];
  if (!r)
    return n.reportError(new ReferenceError(`Unknown function: ${t}()`)), new c(`${t}()`);
  if (typeof r != "function")
    return n.reportError(new TypeError(`Function ${t}() is not callable`)), new c(`${t}()`);
  try {
    let i = F(n, e);
    return r(i.positional, i.named);
  } catch (i) {
    return n.reportError(i), new c(`${t}()`);
  }
}
function Qt(n, { selector: t, variants: e, star: r }) {
  let i = _(n, t);
  if (i instanceof c)
    return et(n, e, r);
  for (const o of e) {
    const l = _(n, o.key);
    if (Vt(n, i, l))
      return g(n, o.value);
  }
  return et(n, e, r);
}
function gt(n, t) {
  if (n.dirty.has(t))
    return n.reportError(new RangeError("Cyclic reference")), new c();
  n.dirty.add(t);
  const e = [], r = n.bundle._useIsolating && t.length > 1;
  for (const i of t) {
    if (typeof i == "string") {
      e.push(n.bundle._transform(i));
      continue;
    }
    if (n.placeables++, n.placeables > tt)
      throw n.dirty.delete(t), new RangeError(`Too many placeables expanded: ${n.placeables}, max allowed is ${tt}`);
    r && e.push(Zt), e.push(_(n, i).toString(n)), r && e.push(qt);
  }
  return n.dirty.delete(t), e.join("");
}
function g(n, t) {
  return typeof t == "string" ? n.bundle._transform(t) : gt(n, t);
}
class Yt {
  constructor(t, e, r) {
    this.dirty = /* @__PURE__ */ new WeakSet(), this.params = null, this.placeables = 0, this.bundle = t, this.errors = e, this.args = r;
  }
  reportError(t) {
    if (!this.errors || !(t instanceof Error))
      throw t;
    this.errors.push(t);
  }
  memoizeIntlObject(t, e) {
    let r = this.bundle._intls.get(t);
    r || (r = {}, this.bundle._intls.set(t, r));
    let i = JSON.stringify(e);
    return r[i] || (r[i] = new t(this.bundle.locales, e)), r[i];
  }
}
function T(n, t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const [r, i] of Object.entries(n))
    t.includes(r) && (e[r] = i.valueOf());
  return e;
}
const nt = [
  "unitDisplay",
  "currencyDisplay",
  "useGrouping",
  "minimumIntegerDigits",
  "minimumFractionDigits",
  "maximumFractionDigits",
  "minimumSignificantDigits",
  "maximumSignificantDigits"
];
function te(n, t) {
  let e = n[0];
  if (e instanceof c)
    return new c(`NUMBER(${e.valueOf()})`);
  if (e instanceof d)
    return new d(e.valueOf(), {
      ...e.opts,
      ...T(t, nt)
    });
  if (e instanceof b)
    return new d(e.valueOf(), {
      ...T(t, nt)
    });
  throw new TypeError("Invalid argument to NUMBER");
}
const rt = [
  "dateStyle",
  "timeStyle",
  "fractionalSecondDigits",
  "dayPeriod",
  "hour12",
  "weekday",
  "era",
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "timeZoneName"
];
function ee(n, t) {
  let e = n[0];
  if (e instanceof c)
    return new c(`DATETIME(${e.valueOf()})`);
  if (e instanceof b)
    return new b(e.valueOf(), {
      ...e.opts,
      ...T(t, rt)
    });
  if (e instanceof d)
    return new b(e.valueOf(), {
      ...T(t, rt)
    });
  throw new TypeError("Invalid argument to DATETIME");
}
const it = /* @__PURE__ */ new Map();
function ne(n) {
  const t = Array.isArray(n) ? n.join(" ") : n;
  let e = it.get(t);
  return e === void 0 && (e = /* @__PURE__ */ new Map(), it.set(t, e)), e;
}
class st {
  /**
   * Create an instance of `FluentBundle`.
   *
   * @example
   * ```js
   * let bundle = new FluentBundle(["en-US", "en"]);
   *
   * let bundle = new FluentBundle(locales, {useIsolating: false});
   *
   * let bundle = new FluentBundle(locales, {
   *   useIsolating: true,
   *   functions: {
   *     NODE_ENV: () => process.env.NODE_ENV
   *   }
   * });
   * ```
   *
   * @param locales - Used to instantiate `Intl` formatters used by translations.
   * @param options - Optional configuration for the bundle.
   */
  constructor(t, { functions: e, useIsolating: r = !0, transform: i = (o) => o } = {}) {
    this._terms = /* @__PURE__ */ new Map(), this._messages = /* @__PURE__ */ new Map(), this.locales = Array.isArray(t) ? t : [t], this._functions = {
      NUMBER: te,
      DATETIME: ee,
      ...e
    }, this._useIsolating = r, this._transform = i, this._intls = ne(t);
  }
  /**
   * Check if a message is present in the bundle.
   *
   * @param id - The identifier of the message to check.
   */
  hasMessage(t) {
    return this._messages.has(t);
  }
  /**
   * Return a raw unformatted message object from the bundle.
   *
   * Raw messages are `{value, attributes}` shapes containing translation units
   * called `Patterns`. `Patterns` are implementation-specific; they should be
   * treated as black boxes and formatted with `FluentBundle.formatPattern`.
   *
   * @param id - The identifier of the message to check.
   */
  getMessage(t) {
    return this._messages.get(t);
  }
  /**
   * Add a translation resource to the bundle.
   *
   * @example
   * ```js
   * let res = new FluentResource("foo = Foo");
   * bundle.addResource(res);
   * bundle.getMessage("foo");
   * // → {value: .., attributes: {..}}
   * ```
   *
   * @param res
   * @param options
   */
  addResource(t, { allowOverrides: e = !1 } = {}) {
    const r = [];
    for (let i = 0; i < t.body.length; i++) {
      let o = t.body[i];
      if (o.id.startsWith("-")) {
        if (e === !1 && this._terms.has(o.id)) {
          r.push(new Error(`Attempt to override an existing term: "${o.id}"`));
          continue;
        }
        this._terms.set(o.id, o);
      } else {
        if (e === !1 && this._messages.has(o.id)) {
          r.push(new Error(`Attempt to override an existing message: "${o.id}"`));
          continue;
        }
        this._messages.set(o.id, o);
      }
    }
    return r;
  }
  /**
   * Format a `Pattern` to a string.
   *
   * Format a raw `Pattern` into a string. `args` will be used to resolve
   * references to variables passed as arguments to the translation.
   *
   * In case of errors `formatPattern` will try to salvage as much of the
   * translation as possible and will still return a string. For performance
   * reasons, the encountered errors are not returned but instead are appended
   * to the `errors` array passed as the third argument.
   *
   * If `errors` is omitted, the first encountered error will be thrown.
   *
   * @example
   * ```js
   * let errors = [];
   * bundle.addResource(
   *     new FluentResource("hello = Hello, {$name}!"));
   *
   * let hello = bundle.getMessage("hello");
   * if (hello.value) {
   *     bundle.formatPattern(hello.value, {name: "Jane"}, errors);
   *     // Returns "Hello, Jane!" and `errors` is empty.
   *
   *     bundle.formatPattern(hello.value, undefined, errors);
   *     // Returns "Hello, {$name}!" and `errors` is now:
   *     // [<ReferenceError: Unknown variable: name>]
   * }
   * ```
   */
  formatPattern(t, e = null, r = null) {
    if (typeof t == "string")
      return this._transform(t);
    let i = new Yt(this, r, e);
    try {
      return gt(i, t).toString(i);
    } catch (o) {
      if (i.errors && o instanceof Error)
        return i.errors.push(o), new c().toString(i);
      throw o;
    }
  }
}
const D = /^(-?[a-zA-Z][\w-]*) *= */gm, ot = /\.([a-zA-Z][\w-]*) *= */y, re = /\*?\[/y, k = /(-?[0-9]+(?:\.([0-9]+))?)/y, ie = /([a-zA-Z][\w-]*)/y, at = /([$-])?([a-zA-Z][\w-]*)(?:\.([a-zA-Z][\w-]*))?/y, se = /^[A-Z][A-Z0-9_-]*$/, R = /([^{}\n\r]+)/y, oe = /([^\\"\n\r]*)/y, lt = /\\([\\"])/y, ut = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{6})/y, ae = /^\n+/, ct = / +$/, le = / *\r?\n/g, ue = /( *)$/, ce = /{\s*/y, ht = /\s*}/y, he = /\[\s*/y, fe = /\s*] */y, de = /\s*\(\s*/y, me = /\s*->\s*/y, pe = /\s*:\s*/y, ge = /\s*,?\s*/y, ye = /\s+/y;
class ft {
  constructor(t) {
    this.body = [], D.lastIndex = 0;
    let e = 0;
    for (; ; ) {
      let s = D.exec(t);
      if (s === null)
        break;
      e = D.lastIndex;
      try {
        this.body.push(m(s[1]));
      } catch (a) {
        if (a instanceof SyntaxError)
          continue;
        throw a;
      }
    }
    function r(s) {
      return s.lastIndex = e, s.test(t);
    }
    function i(s, a) {
      if (t[e] === s)
        return e++, !0;
      if (a)
        throw new a(`Expected ${s}`);
      return !1;
    }
    function o(s, a) {
      if (r(s))
        return e = s.lastIndex, !0;
      if (a)
        throw new a(`Expected ${s.toString()}`);
      return !1;
    }
    function l(s) {
      s.lastIndex = e;
      let a = s.exec(t);
      if (a === null)
        throw new SyntaxError(`Expected ${s.toString()}`);
      return e = s.lastIndex, a;
    }
    function h(s) {
      return l(s)[1];
    }
    function m(s) {
      let a = L(), u = yt();
      if (a === null && Object.keys(u).length === 0)
        throw new SyntaxError("Expected message value or attributes");
      return { id: s, value: a, attributes: u };
    }
    function yt() {
      let s = /* @__PURE__ */ Object.create(null);
      for (; r(ot); ) {
        let a = h(ot), u = L();
        if (u === null)
          throw new SyntaxError("Expected attribute value");
        s[a] = u;
      }
      return s;
    }
    function L() {
      let s;
      if (r(R) && (s = h(R)), t[e] === "{" || t[e] === "}")
        return N(s ? [s] : [], 1 / 0);
      let a = q();
      return a ? s ? N([s, a], a.length) : (a.value = U(a.value, ae), N([a], a.length)) : s ? U(s, ct) : null;
    }
    function N(s = [], a) {
      for (; ; ) {
        if (r(R)) {
          s.push(h(R));
          continue;
        }
        if (t[e] === "{") {
          s.push(B());
          continue;
        }
        if (t[e] === "}")
          throw new SyntaxError("Unbalanced closing brace");
        let f = q();
        if (f) {
          s.push(f), a = Math.min(a, f.length);
          continue;
        }
        break;
      }
      let u = s.length - 1, p = s[u];
      typeof p == "string" && (s[u] = U(p, ct));
      let y = [];
      for (let f of s)
        f instanceof dt && (f = f.value.slice(0, f.value.length - a)), f && y.push(f);
      return y;
    }
    function B() {
      o(ce, SyntaxError);
      let s = K();
      if (o(ht))
        return s;
      if (o(me)) {
        let a = bt();
        return o(ht, SyntaxError), {
          type: "select",
          selector: s,
          ...a
        };
      }
      throw new SyntaxError("Unclosed placeable");
    }
    function K() {
      if (t[e] === "{")
        return B();
      if (r(at)) {
        let [, s, a, u = null] = l(at);
        if (s === "$")
          return { type: "var", name: a };
        if (o(de)) {
          let p = Et();
          if (s === "-")
            return { type: "term", name: a, attr: u, args: p };
          if (se.test(a))
            return { type: "func", name: a, args: p };
          throw new SyntaxError("Function names must be all upper-case");
        }
        return s === "-" ? {
          type: "term",
          name: a,
          attr: u,
          args: []
        } : { type: "mesg", name: a, attr: u };
      }
      return W();
    }
    function Et() {
      let s = [];
      for (; ; ) {
        switch (t[e]) {
          case ")":
            return e++, s;
          case void 0:
            throw new SyntaxError("Unclosed argument list");
        }
        s.push(wt()), o(ge);
      }
    }
    function wt() {
      let s = K();
      return s.type !== "mesg" ? s : o(pe) ? {
        type: "narg",
        name: s.name,
        value: W()
      } : s;
    }
    function bt() {
      let s = [], a = 0, u;
      for (; r(re); ) {
        i("*") && (u = a);
        let p = _t(), y = L();
        if (y === null)
          throw new SyntaxError("Expected variant value");
        s[a++] = { key: p, value: y };
      }
      if (a === 0)
        return null;
      if (u === void 0)
        throw new SyntaxError("Expected default variant");
      return { variants: s, star: u };
    }
    function _t() {
      o(he, SyntaxError);
      let s;
      return r(k) ? s = Z() : s = {
        type: "str",
        value: h(ie)
      }, o(fe, SyntaxError), s;
    }
    function W() {
      if (r(k))
        return Z();
      if (t[e] === '"')
        return vt();
      throw new SyntaxError("Invalid expression");
    }
    function Z() {
      let [, s, a = ""] = l(k), u = a.length;
      return {
        type: "num",
        value: parseFloat(s),
        precision: u
      };
    }
    function vt() {
      i('"', SyntaxError);
      let s = "";
      for (; ; ) {
        if (s += h(oe), t[e] === "\\") {
          s += St();
          continue;
        }
        if (i('"'))
          return { type: "str", value: s };
        throw new SyntaxError("Unclosed string literal");
      }
    }
    function St() {
      if (r(lt))
        return h(lt);
      if (r(ut)) {
        let [, s, a] = l(ut), u = parseInt(s || a, 16);
        return u <= 55295 || 57344 <= u ? (
          // It's a Unicode scalar value.
          String.fromCodePoint(u)
        ) : (
          // Lonely surrogates can cause trouble when the parsing result is
          // saved using UTF-8. Use U+FFFD REPLACEMENT CHARACTER instead.
          "�"
        );
      }
      throw new SyntaxError("Unknown escape sequence");
    }
    function q() {
      let s = e;
      switch (o(ye), t[e]) {
        case ".":
        case "[":
        case "*":
        case "}":
        case void 0:
          return !1;
        case "{":
          return V(t.slice(s, e));
      }
      return t[e - 1] === " " ? V(t.slice(s, e)) : !1;
    }
    function U(s, a) {
      return s.replace(a, "");
    }
    function V(s) {
      let a = s.replace(le, `
`), u = ue.exec(s)[1].length;
      return new dt(a, u);
    }
  }
}
class dt {
  constructor(t, e) {
    this.value = t, this.length = e;
  }
}
const Ee = `hello-world = Hello

list-family = List Family

list-name = List Name

## listo-list

listo-list-delete-button = delete this list

listo-list-form-item-name-label = Name of item to add to list

# Families

families-header = Family/Group Management

## listo-family WC

listo-family-li-label = Double click to remove this member

listo-family-new-member-email-label = Enter the email address of the member you would like to add.
  If incorrect or unregistered, addition will fail.

listo-family-new-member-submit-label = Click to attempt to add new member

listo-family-delete-family-label = Double click to delete this group/family

## listo-new-family WC

listo-new-family-family-name-label = Family Name

# Login

login-header = Listo

login-header-subtext = An elegant List Manager

## listo-registration WC

listo-registration-login-button = Login

listo-registration-register-button = Register

listo-registration-login-form-email-label = Email

listo-registration-login-form-password-label = Password

listo-registration-login-form-submit-label = Submit
`, we = `# Lists

list-family = リストの所属グループ

list-name = リスト名

## listo-list

listo-list-delete-button = このリストを削除する

listo-list-form-item-name-label = リストに追加するアイテムの名前

# Families

families-header = グループ管理

## listo-family WC

listo-family-li-label = ダブルクリックをしてこのメンバーを削除する

listo-family-new-member-email-label = 新規メンバーのメールアドレスを入力する。合わない場合は追加ができない。

listo-family-new-member-submit-label = 新規メンバーの追加を試みる

listo-family-delete-family-label = ダブルクリックでこのグループを削除する

## listo-new-family WC

listo-new-family-family-name-label = グループ名

# Login

login-header = Listo

login-header-subtext = 優雅にリスト管理を

## listo-registration WC

listo-registration-login-button = ログイン

listo-registration-register-button = 登録

listo-registration-login-form-email-label = メールアドレス

listo-registration-login-form-password-label = パスワード

listo-registration-login-form-submit-label = 送信
`;
class be {
  static get bundles() {
    return this._bundles ??= this.initBundles();
  }
  static initBundles() {
    const t = /* @__PURE__ */ new Map(), e = new st("en");
    e.addResource(new ft(Ee)), t.set("en", e);
    const r = new st("ja");
    return r.addResource(new ft(we)), t.set("ja", r), t;
  }
  static getLocale(t) {
    const e = this.bundles.get(t);
    if (!e)
      throw ReferenceError("unsupported locale");
    return e;
  }
  static formatMessage(t, e, r) {
    const i = this.bundles.get(t), o = i?.getMessage(e);
    return o?.value ? i.formatPattern(o.value, r) : void 0;
  }
}
var _e = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, x = (n, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? ve(t, e) : t, o = n.length - 1, l; o >= 0; o--)
    (l = n[o]) && (i = (r ? l(t, e, i) : l(i)) || i);
  return r && i && _e(t, e, i), i;
};
const mt = "listo-list";
class v extends $t {
  constructor() {
    super(...arguments), this._items = [], this.listId = 0, this.userId = 0, this.localIdent = "en", this._deleteClick = new $(), this._deleteListClick = new $(), this._teardown = new $(), this._refresh = new $(), this._first_render = !0, this._deletingIds = /* @__PURE__ */ new Set(), this._loading = !1, this.form = this.shadowRoot.querySelector("form"), this.handleUpdateList = ({ detail: t }) => {
      t.list_id !== this.listId || this.userId === t.user_id || this._refresh.next();
    }, this.handleFormSubmit = (t) => {
      if (t.preventDefault(), this._loading)
        return;
      const e = new FormData(this.form);
      let r = String(e.get("name"));
      this._loading = !0, fetch(`/api/v1/lists/${this.listId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: r })
      }).then(() => {
        this.form.reset(), this._refresh.next();
      }).finally(() => this._loading = !1);
    }, this.handleVisibility = () => {
      document.visibilityState === "visible" && this.refreshList();
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.form.addEventListener("submit", this.handleFormSubmit), document.addEventListener("visibilitychange", this.handleVisibility), window.addEventListener("update-list", this.handleUpdateList), this._deleteClick.pipe(
      H(200),
      M(this._teardown),
      Pt((t) => {
        this._loading = !0, this._deletingIds.add(t);
      }),
      G(
        (t) => fetch(`/api/v1/lists/${this.listId}/items/${t}`, { method: "DELETE" }).finally(() => {
          this._deletingIds.delete(t);
        })
      )
    ).subscribe(() => {
      this._refresh.next(), this._loading = !1;
    }), this._deleteListClick.pipe(
      H(200),
      Ct(1),
      M(this._teardown),
      G(
        () => fetch(`/api/v1/lists/${this.listId}`, {
          method: "DELETE"
        })
      )
    ).subscribe((t) => {
      t.ok && this.remove();
    }), this._refresh.pipe(
      M(this._teardown),
      It(() => this.refreshList())
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
    return this._first_render && this.renderRoot instanceof HTMLElement && (this.renderRoot.innerHTML = "", this._first_render = !1), S`${this._items.length !== 0 ? this._items.map(
      (t) => S` ${this._loading ? S`` : ""}
            <li
              class=${`item ${this._deletingIds.has(t.item_id) ? "deleting" : ""}`}
              @click=${() => this._deleteClick.next(t.item_id)}
            >
              ${t.name}
            </li>`
    ) : S`<button
          type="button"
          class="delete"
          aria-label=${be.formatMessage(this.localIdent, "listo-list-delete-button") ?? ""}
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
x([
  C({
    attribute: "list-items",
    type: Array,
    converter(n, t) {
      return JSON.parse(n ?? "[]");
    }
  })
], v.prototype, "_items", 2);
x([
  C({ attribute: "list-id", type: Number })
], v.prototype, "listId", 2);
x([
  C({ attribute: "user-id", type: Number })
], v.prototype, "userId", 2);
x([
  C({ attribute: "locale-ident" })
], v.prototype, "localIdent", 2);
customElements.get(mt) || customElements.define(mt, v);
export {
  v as ListoList,
  mt as tagName
};
