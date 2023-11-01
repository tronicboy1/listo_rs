import { LitElement as $t, html as S } from "lit";
import { buffer as Rt, debounceTime as At, filter as Ot, map as Tt, Subject as $, takeUntil as M, tap as Pt, mergeMap as G, take as It, switchMap as Ct } from "rxjs";
function H(r = 250) {
  return (t) => t.pipe(Rt(t.pipe(At(r))), Ot((e) => e.length > 1), Tt(([e]) => e));
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A = globalThis, j = A.ShadowRoot && (A.ShadyCSS === void 0 || A.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, mt = Symbol(), J = /* @__PURE__ */ new WeakMap();
let xt = class {
  constructor(t, e, n) {
    if (this._$cssResult$ = !0, n !== mt)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (j && t === void 0) {
      const n = e !== void 0 && e.length === 1;
      n && (t = J.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), n && J.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Nt = (r) => new xt(typeof r == "string" ? r : r + "", void 0, mt), Ut = (r, t) => {
  if (j)
    r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else
    for (const e of t) {
      const n = document.createElement("style"), i = A.litNonce;
      i !== void 0 && n.setAttribute("nonce", i), n.textContent = e.cssText, r.appendChild(n);
    }
}, X = j ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const n of t.cssRules)
    e += n.cssText;
  return Nt(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Lt, defineProperty: Mt, getOwnPropertyDescriptor: Dt, getOwnPropertyNames: kt, getOwnPropertySymbols: Ft, getPrototypeOf: jt } = Object, P = globalThis, Q = P.trustedTypes, zt = Q ? Q.emptyScript : "", Bt = P.reactiveElementPolyfillSupport, w = (r, t) => r, O = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? zt : null;
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
} }, z = (r, t) => !Lt(r, t), Y = { attribute: !0, type: String, converter: O, reflect: !1, hasChanged: z };
Symbol.metadata ??= Symbol("metadata"), P.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
class g extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Y) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.elementProperties.set(t, e), !e.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(t, n, e);
      i !== void 0 && Mt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, n) {
    const { get: i, set: o } = Dt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(l) {
      this[e] = l;
    } };
    return { get() {
      return i?.call(this);
    }, set(l) {
      const h = i?.call(this);
      o.call(this, l), this.requestUpdate(t, h, n);
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
      const e = this.properties, n = [...kt(e), ...Ft(e)];
      for (const i of n)
        this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0)
        for (const [n, i] of e)
          this.elementProperties.set(n, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, n] of this.elementProperties) {
      const i = this._$Eu(e, n);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const n = new Set(t.flat(1 / 0).reverse());
      for (const i of n)
        e.unshift(X(i));
    } else
      t !== void 0 && e.push(X(t));
    return e;
  }
  static _$Eu(t, e) {
    const n = e.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const n of e.keys())
      this.hasOwnProperty(n) && (t.set(n, this[n]), delete this[n]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ut(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$ES?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$ES?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, n) {
    this._$AK(t, n);
  }
  _$EO(t, e) {
    const n = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, n);
    if (i !== void 0 && n.reflect === !0) {
      const o = (n.converter?.toAttribute !== void 0 ? n.converter : O).toAttribute(e, n.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const n = this.constructor, i = n._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = n.getPropertyOptions(i), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : O;
      this._$Em = i, this[i] = l.fromAttribute(e, o.type), this._$Em = null;
    }
  }
  requestUpdate(t, e, n, i = !1, o) {
    if (t !== void 0) {
      if (n ??= this.constructor.getPropertyOptions(t), !(n.hasChanged ?? z)(i ? o : this[t], e))
        return;
      this.C(t, e, n);
    }
    this.isUpdatePending === !1 && (this._$Eg = this._$EP());
  }
  C(t, e, n) {
    this._$AL.has(t) || this._$AL.set(t, e), n.reflect === !0 && this._$Em !== t && (this._$Ej ??= /* @__PURE__ */ new Set()).add(t);
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
      const n = this.constructor.elementProperties;
      if (n.size > 0)
        for (const [i, o] of n)
          o.wrapped !== !0 || this._$AL.has(i) || this[i] === void 0 || this.C(i, this[i], o);
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$ES?.forEach((n) => n.hostUpdate?.()), this.update(e)) : this._$ET();
    } catch (n) {
      throw t = !1, this._$ET(), n;
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
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[w("elementProperties")] = /* @__PURE__ */ new Map(), g[w("finalized")] = /* @__PURE__ */ new Map(), Bt?.({ ReactiveElement: g }), (P.reactiveElementVersions ??= []).push("2.0.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = { attribute: !0, type: String, converter: O, reflect: !1, hasChanged: z }, Zt = (r = Kt, t, e) => {
  const { kind: n, metadata: i } = e;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), o.set(e.name, r), n === "accessor") {
    const { name: l } = e;
    return { set(h) {
      const p = t.get.call(this);
      t.set.call(this, h), this.requestUpdate(l, p, r);
    }, init(h) {
      return h !== void 0 && this.C(l, void 0, r), h;
    } };
  }
  if (n === "setter") {
    const { name: l } = e;
    return function(h) {
      const p = this[l];
      t.call(this, h), this.requestUpdate(l, p, r);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function I(r) {
  return (t, e) => typeof e == "object" ? Zt(r, t, e) : ((n, i, o) => {
    const l = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, l ? { ...n, wrapped: !0 } : n), l ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(r, t, e);
}
class C {
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
class c extends C {
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
class d extends C {
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
class _ extends C {
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
const tt = 100, Wt = "⁨", qt = "⁩";
function Vt(r, t, e) {
  if (e === t || e instanceof d && t instanceof d && e.value === t.value)
    return !0;
  if (t instanceof d && typeof e == "string") {
    let n = r.memoizeIntlObject(Intl.PluralRules, t.opts).select(t.value);
    if (e === n)
      return !0;
  }
  return !1;
}
function et(r, t, e) {
  return t[e] ? y(r, t[e].value) : (r.reportError(new RangeError("No default")), new c());
}
function F(r, t) {
  const e = [], n = /* @__PURE__ */ Object.create(null);
  for (const i of t)
    i.type === "narg" ? n[i.name] = b(r, i.value) : e.push(b(r, i));
  return { positional: e, named: n };
}
function b(r, t) {
  switch (t.type) {
    case "str":
      return t.value;
    case "num":
      return new d(t.value, {
        minimumFractionDigits: t.precision
      });
    case "var":
      return Gt(r, t);
    case "mesg":
      return Ht(r, t);
    case "term":
      return Jt(r, t);
    case "func":
      return Xt(r, t);
    case "select":
      return Qt(r, t);
    default:
      return new c();
  }
}
function Gt(r, { name: t }) {
  let e;
  if (r.params)
    if (Object.prototype.hasOwnProperty.call(r.params, t))
      e = r.params[t];
    else
      return new c(`$${t}`);
  else if (r.args && Object.prototype.hasOwnProperty.call(r.args, t))
    e = r.args[t];
  else
    return r.reportError(new ReferenceError(`Unknown variable: $${t}`)), new c(`$${t}`);
  if (e instanceof C)
    return e;
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return new d(e);
    case "object":
      if (e instanceof Date)
        return new _(e.getTime());
    default:
      return r.reportError(new TypeError(`Variable type not supported: $${t}, ${typeof e}`)), new c(`$${t}`);
  }
}
function Ht(r, { name: t, attr: e }) {
  const n = r.bundle._messages.get(t);
  if (!n)
    return r.reportError(new ReferenceError(`Unknown message: ${t}`)), new c(t);
  if (e) {
    const i = n.attributes[e];
    return i ? y(r, i) : (r.reportError(new ReferenceError(`Unknown attribute: ${e}`)), new c(`${t}.${e}`));
  }
  return n.value ? y(r, n.value) : (r.reportError(new ReferenceError(`No value: ${t}`)), new c(t));
}
function Jt(r, { name: t, attr: e, args: n }) {
  const i = `-${t}`, o = r.bundle._terms.get(i);
  if (!o)
    return r.reportError(new ReferenceError(`Unknown term: ${i}`)), new c(i);
  if (e) {
    const h = o.attributes[e];
    if (h) {
      r.params = F(r, n).named;
      const p = y(r, h);
      return r.params = null, p;
    }
    return r.reportError(new ReferenceError(`Unknown attribute: ${e}`)), new c(`${i}.${e}`);
  }
  r.params = F(r, n).named;
  const l = y(r, o.value);
  return r.params = null, l;
}
function Xt(r, { name: t, args: e }) {
  let n = r.bundle._functions[t];
  if (!n)
    return r.reportError(new ReferenceError(`Unknown function: ${t}()`)), new c(`${t}()`);
  if (typeof n != "function")
    return r.reportError(new TypeError(`Function ${t}() is not callable`)), new c(`${t}()`);
  try {
    let i = F(r, e);
    return n(i.positional, i.named);
  } catch (i) {
    return r.reportError(i), new c(`${t}()`);
  }
}
function Qt(r, { selector: t, variants: e, star: n }) {
  let i = b(r, t);
  if (i instanceof c)
    return et(r, e, n);
  for (const o of e) {
    const l = b(r, o.key);
    if (Vt(r, i, l))
      return y(r, o.value);
  }
  return et(r, e, n);
}
function yt(r, t) {
  if (r.dirty.has(t))
    return r.reportError(new RangeError("Cyclic reference")), new c();
  r.dirty.add(t);
  const e = [], n = r.bundle._useIsolating && t.length > 1;
  for (const i of t) {
    if (typeof i == "string") {
      e.push(r.bundle._transform(i));
      continue;
    }
    if (r.placeables++, r.placeables > tt)
      throw r.dirty.delete(t), new RangeError(`Too many placeables expanded: ${r.placeables}, max allowed is ${tt}`);
    n && e.push(Wt), e.push(b(r, i).toString(r)), n && e.push(qt);
  }
  return r.dirty.delete(t), e.join("");
}
function y(r, t) {
  return typeof t == "string" ? r.bundle._transform(t) : yt(r, t);
}
class Yt {
  constructor(t, e, n) {
    this.dirty = /* @__PURE__ */ new WeakSet(), this.params = null, this.placeables = 0, this.bundle = t, this.errors = e, this.args = n;
  }
  reportError(t) {
    if (!this.errors || !(t instanceof Error))
      throw t;
    this.errors.push(t);
  }
  memoizeIntlObject(t, e) {
    let n = this.bundle._intls.get(t);
    n || (n = {}, this.bundle._intls.set(t, n));
    let i = JSON.stringify(e);
    return n[i] || (n[i] = new t(this.bundle.locales, e)), n[i];
  }
}
function T(r, t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const [n, i] of Object.entries(r))
    t.includes(n) && (e[n] = i.valueOf());
  return e;
}
const rt = [
  "unitDisplay",
  "currencyDisplay",
  "useGrouping",
  "minimumIntegerDigits",
  "minimumFractionDigits",
  "maximumFractionDigits",
  "minimumSignificantDigits",
  "maximumSignificantDigits"
];
function te(r, t) {
  let e = r[0];
  if (e instanceof c)
    return new c(`NUMBER(${e.valueOf()})`);
  if (e instanceof d)
    return new d(e.valueOf(), {
      ...e.opts,
      ...T(t, rt)
    });
  if (e instanceof _)
    return new d(e.valueOf(), {
      ...T(t, rt)
    });
  throw new TypeError("Invalid argument to NUMBER");
}
const nt = [
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
function ee(r, t) {
  let e = r[0];
  if (e instanceof c)
    return new c(`DATETIME(${e.valueOf()})`);
  if (e instanceof _)
    return new _(e.valueOf(), {
      ...e.opts,
      ...T(t, nt)
    });
  if (e instanceof d)
    return new _(e.valueOf(), {
      ...T(t, nt)
    });
  throw new TypeError("Invalid argument to DATETIME");
}
const it = /* @__PURE__ */ new Map();
function re(r) {
  const t = Array.isArray(r) ? r.join(" ") : r;
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
  constructor(t, { functions: e, useIsolating: n = !0, transform: i = (o) => o } = {}) {
    this._terms = /* @__PURE__ */ new Map(), this._messages = /* @__PURE__ */ new Map(), this.locales = Array.isArray(t) ? t : [t], this._functions = {
      NUMBER: te,
      DATETIME: ee,
      ...e
    }, this._useIsolating = n, this._transform = i, this._intls = re(t);
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
    const n = [];
    for (let i = 0; i < t.body.length; i++) {
      let o = t.body[i];
      if (o.id.startsWith("-")) {
        if (e === !1 && this._terms.has(o.id)) {
          n.push(new Error(`Attempt to override an existing term: "${o.id}"`));
          continue;
        }
        this._terms.set(o.id, o);
      } else {
        if (e === !1 && this._messages.has(o.id)) {
          n.push(new Error(`Attempt to override an existing message: "${o.id}"`));
          continue;
        }
        this._messages.set(o.id, o);
      }
    }
    return n;
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
  formatPattern(t, e = null, n = null) {
    if (typeof t == "string")
      return this._transform(t);
    let i = new Yt(this, n, e);
    try {
      return yt(i, t).toString(i);
    } catch (o) {
      if (i.errors && o instanceof Error)
        return i.errors.push(o), new c().toString(i);
      throw o;
    }
  }
}
const D = /^(-?[a-zA-Z][\w-]*) *= */gm, ot = /\.([a-zA-Z][\w-]*) *= */y, ne = /\*?\[/y, k = /(-?[0-9]+(?:\.([0-9]+))?)/y, ie = /([a-zA-Z][\w-]*)/y, at = /([$-])?([a-zA-Z][\w-]*)(?:\.([a-zA-Z][\w-]*))?/y, se = /^[A-Z][A-Z0-9_-]*$/, R = /([^{}\n\r]+)/y, oe = /([^\\"\n\r]*)/y, lt = /\\([\\"])/y, ut = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{6})/y, ae = /^\n+/, ct = / +$/, le = / *\r?\n/g, ue = /( *)$/, ce = /{\s*/y, ht = /\s*}/y, he = /\[\s*/y, fe = /\s*] */y, de = /\s*\(\s*/y, pe = /\s*->\s*/y, me = /\s*:\s*/y, ye = /\s*,?\s*/y, Ee = /\s+/y;
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
        this.body.push(p(s[1]));
      } catch (a) {
        if (a instanceof SyntaxError)
          continue;
        throw a;
      }
    }
    function n(s) {
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
      if (n(s))
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
    function p(s) {
      let a = N(), u = Et();
      if (a === null && Object.keys(u).length === 0)
        throw new SyntaxError("Expected message value or attributes");
      return { id: s, value: a, attributes: u };
    }
    function Et() {
      let s = /* @__PURE__ */ Object.create(null);
      for (; n(ot); ) {
        let a = h(ot), u = N();
        if (u === null)
          throw new SyntaxError("Expected attribute value");
        s[a] = u;
      }
      return s;
    }
    function N() {
      let s;
      if (n(R) && (s = h(R)), t[e] === "{" || t[e] === "}")
        return U(s ? [s] : [], 1 / 0);
      let a = q();
      return a ? s ? U([s, a], a.length) : (a.value = L(a.value, ae), U([a], a.length)) : s ? L(s, ct) : null;
    }
    function U(s = [], a) {
      for (; ; ) {
        if (n(R)) {
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
      let u = s.length - 1, m = s[u];
      typeof m == "string" && (s[u] = L(m, ct));
      let E = [];
      for (let f of s)
        f instanceof dt && (f = f.value.slice(0, f.value.length - a)), f && E.push(f);
      return E;
    }
    function B() {
      o(ce, SyntaxError);
      let s = K();
      if (o(ht))
        return s;
      if (o(pe)) {
        let a = _t();
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
      if (n(at)) {
        let [, s, a, u = null] = l(at);
        if (s === "$")
          return { type: "var", name: a };
        if (o(de)) {
          let m = gt();
          if (s === "-")
            return { type: "term", name: a, attr: u, args: m };
          if (se.test(a))
            return { type: "func", name: a, args: m };
          throw new SyntaxError("Function names must be all upper-case");
        }
        return s === "-" ? {
          type: "term",
          name: a,
          attr: u,
          args: []
        } : { type: "mesg", name: a, attr: u };
      }
      return Z();
    }
    function gt() {
      let s = [];
      for (; ; ) {
        switch (t[e]) {
          case ")":
            return e++, s;
          case void 0:
            throw new SyntaxError("Unclosed argument list");
        }
        s.push(wt()), o(ye);
      }
    }
    function wt() {
      let s = K();
      return s.type !== "mesg" ? s : o(me) ? {
        type: "narg",
        name: s.name,
        value: Z()
      } : s;
    }
    function _t() {
      let s = [], a = 0, u;
      for (; n(ne); ) {
        i("*") && (u = a);
        let m = bt(), E = N();
        if (E === null)
          throw new SyntaxError("Expected variant value");
        s[a++] = { key: m, value: E };
      }
      if (a === 0)
        return null;
      if (u === void 0)
        throw new SyntaxError("Expected default variant");
      return { variants: s, star: u };
    }
    function bt() {
      o(he, SyntaxError);
      let s;
      return n(k) ? s = W() : s = {
        type: "str",
        value: h(ie)
      }, o(fe, SyntaxError), s;
    }
    function Z() {
      if (n(k))
        return W();
      if (t[e] === '"')
        return vt();
      throw new SyntaxError("Invalid expression");
    }
    function W() {
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
      if (n(lt))
        return h(lt);
      if (n(ut)) {
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
      switch (o(Ee), t[e]) {
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
    function L(s, a) {
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
const ge = `hello-world = Hello

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
`, we = `# Lists

list-family = リストの所属

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
`;
class _e {
  static get bundles() {
    return this._bundles ??= this.initBundles();
  }
  static initBundles() {
    const t = /* @__PURE__ */ new Map(), e = new st("en");
    e.addResource(new ft(ge)), t.set("en", e);
    const n = new st("ja");
    return n.addResource(new ft(we)), t.set("ja", n), t;
  }
  static getLocale(t) {
    const e = this.bundles.get(t);
    if (!e)
      throw ReferenceError("unsupported locale");
    return e;
  }
  static formatMessage(t, e, n) {
    const i = this.bundles.get(t), o = i?.getMessage(e);
    return o?.value ? i.formatPattern(o.value, n) : void 0;
  }
}
var be = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, x = (r, t, e, n) => {
  for (var i = n > 1 ? void 0 : n ? ve(t, e) : t, o = r.length - 1, l; o >= 0; o--)
    (l = r[o]) && (i = (n ? l(t, e, i) : l(i)) || i);
  return n && i && be(t, e, i), i;
};
const pt = "listo-list";
class v extends $t {
  constructor() {
    super(...arguments), this._items = [], this.listId = 0, this.userId = 0, this.localIdent = "en", this._deleteClick = new $(), this._deleteListClick = new $(), this._teardown = new $(), this._refresh = new $(), this._first_render = !0, this._deletingIds = /* @__PURE__ */ new Set(), this._loading = !1, this.form = this.shadowRoot.querySelector("form"), this.handleUpdateList = ({ detail: t }) => {
      t.list_id !== this.listId || this.userId === t.user_id || this._refresh.next();
    }, this.handleFormSubmit = (t) => {
      if (t.preventDefault(), this._loading)
        return;
      const e = new FormData(this.form);
      let n = String(e.get("name"));
      this._loading = !0, fetch(`/api/v1/lists/${this.listId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: n })
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
      It(1),
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
      Ct(() => this.refreshList())
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
          aria-label=${_e.formatMessage(this.localIdent, "listo-list-delete-button") ?? ""}
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
  I({
    attribute: "list-items",
    type: Array,
    converter(r, t) {
      return JSON.parse(r ?? "[]");
    }
  })
], v.prototype, "_items", 2);
x([
  I({ attribute: "list-id", type: Number })
], v.prototype, "listId", 2);
x([
  I({ attribute: "user-id", type: Number })
], v.prototype, "userId", 2);
x([
  I({ attribute: "locale-ident" })
], v.prototype, "localIdent", 2);
customElements.get(pt) || customElements.define(pt, v);
export {
  v as ListoList,
  pt as tagName
};
