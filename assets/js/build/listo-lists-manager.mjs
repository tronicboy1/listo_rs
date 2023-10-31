import { Subject as q, retry as G, takeUntil as $ } from "rxjs";
var P = function(n, e) {
  return P = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, r) {
    t.__proto__ = r;
  } || function(t, r) {
    for (var i in r)
      Object.prototype.hasOwnProperty.call(r, i) && (t[i] = r[i]);
  }, P(n, e);
};
function b(n, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  P(n, e);
  function t() {
    this.constructor = n;
  }
  n.prototype = e === null ? Object.create(e) : (t.prototype = e.prototype, new t());
}
var W = function() {
  return W = Object.assign || function(e) {
    for (var t, r = 1, i = arguments.length; r < i; r++) {
      t = arguments[r];
      for (var o in t)
        Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
    }
    return e;
  }, W.apply(this, arguments);
};
function A(n) {
  var e = typeof Symbol == "function" && Symbol.iterator, t = e && n[e], r = 0;
  if (t)
    return t.call(n);
  if (n && typeof n.length == "number")
    return {
      next: function() {
        return n && r >= n.length && (n = void 0), { value: n && n[r++], done: !n };
      }
    };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function g(n, e) {
  var t = typeof Symbol == "function" && n[Symbol.iterator];
  if (!t)
    return n;
  var r = t.call(n), i, o = [], s;
  try {
    for (; (e === void 0 || e-- > 0) && !(i = r.next()).done; )
      o.push(i.value);
  } catch (u) {
    s = { error: u };
  } finally {
    try {
      i && !i.done && (t = r.return) && t.call(r);
    } finally {
      if (s)
        throw s.error;
    }
  }
  return o;
}
function E(n, e, t) {
  if (t || arguments.length === 2)
    for (var r = 0, i = e.length, o; r < i; r++)
      (o || !(r in e)) && (o || (o = Array.prototype.slice.call(e, 0, r)), o[r] = e[r]);
  return n.concat(o || Array.prototype.slice.call(e));
}
function v(n) {
  return typeof n == "function";
}
function J(n) {
  var e = function(r) {
    Error.call(r), r.stack = new Error().stack;
  }, t = n(e);
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t;
}
var T = J(function(n) {
  return function(t) {
    n(this), this.message = t ? t.length + ` errors occurred during unsubscription:
` + t.map(function(r, i) {
      return i + 1 + ") " + r.toString();
    }).join(`
  `) : "", this.name = "UnsubscriptionError", this.errors = t;
  };
});
function C(n, e) {
  if (n) {
    var t = n.indexOf(e);
    0 <= t && n.splice(t, 1);
  }
}
var _ = function() {
  function n(e) {
    this.initialTeardown = e, this.closed = !1, this._parentage = null, this._finalizers = null;
  }
  return n.prototype.unsubscribe = function() {
    var e, t, r, i, o;
    if (!this.closed) {
      this.closed = !0;
      var s = this._parentage;
      if (s)
        if (this._parentage = null, Array.isArray(s))
          try {
            for (var u = A(s), c = u.next(); !c.done; c = u.next()) {
              var a = c.value;
              a.remove(this);
            }
          } catch (f) {
            e = { error: f };
          } finally {
            try {
              c && !c.done && (t = u.return) && t.call(u);
            } finally {
              if (e)
                throw e.error;
            }
          }
        else
          s.remove(this);
      var d = this.initialTeardown;
      if (v(d))
        try {
          d();
        } catch (f) {
          o = f instanceof T ? f.errors : [f];
        }
      var l = this._finalizers;
      if (l) {
        this._finalizers = null;
        try {
          for (var p = A(l), h = p.next(); !h.done; h = p.next()) {
            var y = h.value;
            try {
              R(y);
            } catch (f) {
              o = o ?? [], f instanceof T ? o = E(E([], g(o)), g(f.errors)) : o.push(f);
            }
          }
        } catch (f) {
          r = { error: f };
        } finally {
          try {
            h && !h.done && (i = p.return) && i.call(p);
          } finally {
            if (r)
              throw r.error;
          }
        }
      }
      if (o)
        throw new T(o);
    }
  }, n.prototype.add = function(e) {
    var t;
    if (e && e !== this)
      if (this.closed)
        R(e);
      else {
        if (e instanceof n) {
          if (e.closed || e._hasParent(this))
            return;
          e._addParent(this);
        }
        (this._finalizers = (t = this._finalizers) !== null && t !== void 0 ? t : []).push(e);
      }
  }, n.prototype._hasParent = function(e) {
    var t = this._parentage;
    return t === e || Array.isArray(t) && t.includes(e);
  }, n.prototype._addParent = function(e) {
    var t = this._parentage;
    this._parentage = Array.isArray(t) ? (t.push(e), t) : t ? [t, e] : e;
  }, n.prototype._removeParent = function(e) {
    var t = this._parentage;
    t === e ? this._parentage = null : Array.isArray(t) && C(t, e);
  }, n.prototype.remove = function(e) {
    var t = this._finalizers;
    t && C(t, e), e instanceof n && e._removeParent(this);
  }, n.EMPTY = function() {
    var e = new n();
    return e.closed = !0, e;
  }(), n;
}(), L = _.EMPTY;
function Y(n) {
  return n instanceof _ || n && "closed" in n && v(n.remove) && v(n.add) && v(n.unsubscribe);
}
function R(n) {
  v(n) ? n() : n.unsubscribe();
}
var H = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1
}, I = {
  setTimeout: function(n, e) {
    for (var t = [], r = 2; r < arguments.length; r++)
      t[r - 2] = arguments[r];
    var i = I.delegate;
    return i?.setTimeout ? i.setTimeout.apply(i, E([n, e], g(t))) : setTimeout.apply(void 0, E([n, e], g(t)));
  },
  clearTimeout: function(n) {
    var e = I.delegate;
    return (e?.clearTimeout || clearTimeout)(n);
  },
  delegate: void 0
};
function Q(n) {
  I.setTimeout(function() {
    throw n;
  });
}
function M() {
}
function w(n) {
  n();
}
var F = function(n) {
  b(e, n);
  function e(t) {
    var r = n.call(this) || this;
    return r.isStopped = !1, t ? (r.destination = t, Y(t) && t.add(r)) : r.destination = tt, r;
  }
  return e.create = function(t, r, i) {
    return new U(t, r, i);
  }, e.prototype.next = function(t) {
    this.isStopped || this._next(t);
  }, e.prototype.error = function(t) {
    this.isStopped || (this.isStopped = !0, this._error(t));
  }, e.prototype.complete = function() {
    this.isStopped || (this.isStopped = !0, this._complete());
  }, e.prototype.unsubscribe = function() {
    this.closed || (this.isStopped = !0, n.prototype.unsubscribe.call(this), this.destination = null);
  }, e.prototype._next = function(t) {
    this.destination.next(t);
  }, e.prototype._error = function(t) {
    try {
      this.destination.error(t);
    } finally {
      this.unsubscribe();
    }
  }, e.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }, e;
}(_), X = Function.prototype.bind;
function x(n, e) {
  return X.call(n, e);
}
var Z = function() {
  function n(e) {
    this.partialObserver = e;
  }
  return n.prototype.next = function(e) {
    var t = this.partialObserver;
    if (t.next)
      try {
        t.next(e);
      } catch (r) {
        S(r);
      }
  }, n.prototype.error = function(e) {
    var t = this.partialObserver;
    if (t.error)
      try {
        t.error(e);
      } catch (r) {
        S(r);
      }
    else
      S(e);
  }, n.prototype.complete = function() {
    var e = this.partialObserver;
    if (e.complete)
      try {
        e.complete();
      } catch (t) {
        S(t);
      }
  }, n;
}(), U = function(n) {
  b(e, n);
  function e(t, r, i) {
    var o = n.call(this) || this, s;
    if (v(t) || !t)
      s = {
        next: t ?? void 0,
        error: r ?? void 0,
        complete: i ?? void 0
      };
    else {
      var u;
      o && H.useDeprecatedNextContext ? (u = Object.create(t), u.unsubscribe = function() {
        return o.unsubscribe();
      }, s = {
        next: t.next && x(t.next, u),
        error: t.error && x(t.error, u),
        complete: t.complete && x(t.complete, u)
      }) : s = t;
    }
    return o.destination = new Z(s), o;
  }
  return e;
}(F);
function S(n) {
  Q(n);
}
function N(n) {
  throw n;
}
var tt = {
  closed: !0,
  next: M,
  error: N,
  complete: M
}, et = function() {
  return typeof Symbol == "function" && Symbol.observable || "@@observable";
}();
function rt(n) {
  return n;
}
function nt(n) {
  return n.length === 0 ? rt : n.length === 1 ? n[0] : function(t) {
    return n.reduce(function(r, i) {
      return i(r);
    }, t);
  };
}
var k = function() {
  function n(e) {
    e && (this._subscribe = e);
  }
  return n.prototype.lift = function(e) {
    var t = new n();
    return t.source = this, t.operator = e, t;
  }, n.prototype.subscribe = function(e, t, r) {
    var i = this, o = ot(e) ? e : new U(e, t, r);
    return w(function() {
      var s = i, u = s.operator, c = s.source;
      o.add(u ? u.call(o, c) : c ? i._subscribe(o) : i._trySubscribe(o));
    }), o;
  }, n.prototype._trySubscribe = function(e) {
    try {
      return this._subscribe(e);
    } catch (t) {
      e.error(t);
    }
  }, n.prototype.forEach = function(e, t) {
    var r = this;
    return t = z(t), new t(function(i, o) {
      var s = new U({
        next: function(u) {
          try {
            e(u);
          } catch (c) {
            o(c), s.unsubscribe();
          }
        },
        error: o,
        complete: i
      });
      r.subscribe(s);
    });
  }, n.prototype._subscribe = function(e) {
    var t;
    return (t = this.source) === null || t === void 0 ? void 0 : t.subscribe(e);
  }, n.prototype[et] = function() {
    return this;
  }, n.prototype.pipe = function() {
    for (var e = [], t = 0; t < arguments.length; t++)
      e[t] = arguments[t];
    return nt(e)(this);
  }, n.prototype.toPromise = function(e) {
    var t = this;
    return e = z(e), new e(function(r, i) {
      var o;
      t.subscribe(function(s) {
        return o = s;
      }, function(s) {
        return i(s);
      }, function() {
        return r(o);
      });
    });
  }, n.create = function(e) {
    return new n(e);
  }, n;
}();
function z(n) {
  var e;
  return (e = n ?? H.Promise) !== null && e !== void 0 ? e : Promise;
}
function it(n) {
  return n && v(n.next) && v(n.error) && v(n.complete);
}
function ot(n) {
  return n && n instanceof F || it(n) && Y(n);
}
var st = J(function(n) {
  return function() {
    n(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed";
  };
}), O = function(n) {
  b(e, n);
  function e() {
    var t = n.call(this) || this;
    return t.closed = !1, t.currentObservers = null, t.observers = [], t.isStopped = !1, t.hasError = !1, t.thrownError = null, t;
  }
  return e.prototype.lift = function(t) {
    var r = new B(this, this);
    return r.operator = t, r;
  }, e.prototype._throwIfClosed = function() {
    if (this.closed)
      throw new st();
  }, e.prototype.next = function(t) {
    var r = this;
    w(function() {
      var i, o;
      if (r._throwIfClosed(), !r.isStopped) {
        r.currentObservers || (r.currentObservers = Array.from(r.observers));
        try {
          for (var s = A(r.currentObservers), u = s.next(); !u.done; u = s.next()) {
            var c = u.value;
            c.next(t);
          }
        } catch (a) {
          i = { error: a };
        } finally {
          try {
            u && !u.done && (o = s.return) && o.call(s);
          } finally {
            if (i)
              throw i.error;
          }
        }
      }
    });
  }, e.prototype.error = function(t) {
    var r = this;
    w(function() {
      if (r._throwIfClosed(), !r.isStopped) {
        r.hasError = r.isStopped = !0, r.thrownError = t;
        for (var i = r.observers; i.length; )
          i.shift().error(t);
      }
    });
  }, e.prototype.complete = function() {
    var t = this;
    w(function() {
      if (t._throwIfClosed(), !t.isStopped) {
        t.isStopped = !0;
        for (var r = t.observers; r.length; )
          r.shift().complete();
      }
    });
  }, e.prototype.unsubscribe = function() {
    this.isStopped = this.closed = !0, this.observers = this.currentObservers = null;
  }, Object.defineProperty(e.prototype, "observed", {
    get: function() {
      var t;
      return ((t = this.observers) === null || t === void 0 ? void 0 : t.length) > 0;
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype._trySubscribe = function(t) {
    return this._throwIfClosed(), n.prototype._trySubscribe.call(this, t);
  }, e.prototype._subscribe = function(t) {
    return this._throwIfClosed(), this._checkFinalizedStatuses(t), this._innerSubscribe(t);
  }, e.prototype._innerSubscribe = function(t) {
    var r = this, i = this, o = i.hasError, s = i.isStopped, u = i.observers;
    return o || s ? L : (this.currentObservers = null, u.push(t), new _(function() {
      r.currentObservers = null, C(u, t);
    }));
  }, e.prototype._checkFinalizedStatuses = function(t) {
    var r = this, i = r.hasError, o = r.thrownError, s = r.isStopped;
    i ? t.error(o) : s && t.complete();
  }, e.prototype.asObservable = function() {
    var t = new k();
    return t.source = this, t;
  }, e.create = function(t, r) {
    return new B(t, r);
  }, e;
}(k), B = function(n) {
  b(e, n);
  function e(t, r) {
    var i = n.call(this) || this;
    return i.destination = t, i.source = r, i;
  }
  return e.prototype.next = function(t) {
    var r, i;
    (i = (r = this.destination) === null || r === void 0 ? void 0 : r.next) === null || i === void 0 || i.call(r, t);
  }, e.prototype.error = function(t) {
    var r, i;
    (i = (r = this.destination) === null || r === void 0 ? void 0 : r.error) === null || i === void 0 || i.call(r, t);
  }, e.prototype.complete = function() {
    var t, r;
    (r = (t = this.destination) === null || t === void 0 ? void 0 : t.complete) === null || r === void 0 || r.call(t);
  }, e.prototype._subscribe = function(t) {
    var r, i;
    return (i = (r = this.source) === null || r === void 0 ? void 0 : r.subscribe(t)) !== null && i !== void 0 ? i : L;
  }, e;
}(O), K = {
  now: function() {
    return (K.delegate || Date).now();
  },
  delegate: void 0
}, j = function(n) {
  b(e, n);
  function e(t, r, i) {
    t === void 0 && (t = 1 / 0), r === void 0 && (r = 1 / 0), i === void 0 && (i = K);
    var o = n.call(this) || this;
    return o._bufferSize = t, o._windowTime = r, o._timestampProvider = i, o._buffer = [], o._infiniteTimeWindow = !0, o._infiniteTimeWindow = r === 1 / 0, o._bufferSize = Math.max(1, t), o._windowTime = Math.max(1, r), o;
  }
  return e.prototype.next = function(t) {
    var r = this, i = r.isStopped, o = r._buffer, s = r._infiniteTimeWindow, u = r._timestampProvider, c = r._windowTime;
    i || (o.push(t), !s && o.push(u.now() + c)), this._trimBuffer(), n.prototype.next.call(this, t);
  }, e.prototype._subscribe = function(t) {
    this._throwIfClosed(), this._trimBuffer();
    for (var r = this._innerSubscribe(t), i = this, o = i._infiniteTimeWindow, s = i._buffer, u = s.slice(), c = 0; c < u.length && !t.closed; c += o ? 1 : 2)
      t.next(u[c]);
    return this._checkFinalizedStatuses(t), r;
  }, e.prototype._trimBuffer = function() {
    var t = this, r = t._bufferSize, i = t._timestampProvider, o = t._buffer, s = t._infiniteTimeWindow, u = (s ? 1 : 2) * r;
    if (r < 1 / 0 && u < o.length && o.splice(0, o.length - u), !s) {
      for (var c = i.now(), a = 0, d = 1; d < o.length && o[d] <= c; d += 2)
        a = d;
      a && o.splice(0, a + 1);
    }
  }, e;
}(O), ut = {
  url: "",
  deserializer: function(n) {
    return JSON.parse(n.data);
  },
  serializer: function(n) {
    return JSON.stringify(n);
  }
}, ct = "WebSocketSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }", at = function(n) {
  b(e, n);
  function e(t, r) {
    var i = n.call(this) || this;
    if (i._socket = null, t instanceof k)
      i.destination = r, i.source = t;
    else {
      var o = i._config = W({}, ut);
      if (i._output = new O(), typeof t == "string")
        o.url = t;
      else
        for (var s in t)
          t.hasOwnProperty(s) && (o[s] = t[s]);
      if (!o.WebSocketCtor && WebSocket)
        o.WebSocketCtor = WebSocket;
      else if (!o.WebSocketCtor)
        throw new Error("no WebSocket constructor can be found");
      i.destination = new j();
    }
    return i;
  }
  return e.prototype.lift = function(t) {
    var r = new e(this._config, this.destination);
    return r.operator = t, r.source = this, r;
  }, e.prototype._resetState = function() {
    this._socket = null, this.source || (this.destination = new j()), this._output = new O();
  }, e.prototype.multiplex = function(t, r, i) {
    var o = this;
    return new k(function(s) {
      try {
        o.next(t());
      } catch (c) {
        s.error(c);
      }
      var u = o.subscribe({
        next: function(c) {
          try {
            i(c) && s.next(c);
          } catch (a) {
            s.error(a);
          }
        },
        error: function(c) {
          return s.error(c);
        },
        complete: function() {
          return s.complete();
        }
      });
      return function() {
        try {
          o.next(r());
        } catch (c) {
          s.error(c);
        }
        u.unsubscribe();
      };
    });
  }, e.prototype._connectSocket = function() {
    var t = this, r = this._config, i = r.WebSocketCtor, o = r.protocol, s = r.url, u = r.binaryType, c = this._output, a = null;
    try {
      a = o ? new i(s, o) : new i(s), this._socket = a, u && (this._socket.binaryType = u);
    } catch (l) {
      c.error(l);
      return;
    }
    var d = new _(function() {
      t._socket = null, a && a.readyState === 1 && a.close();
    });
    a.onopen = function(l) {
      var p = t._socket;
      if (!p) {
        a.close(), t._resetState();
        return;
      }
      var h = t._config.openObserver;
      h && h.next(l);
      var y = t.destination;
      t.destination = F.create(function(f) {
        if (a.readyState === 1)
          try {
            var m = t._config.serializer;
            a.send(m(f));
          } catch (V) {
            t.destination.error(V);
          }
      }, function(f) {
        var m = t._config.closingObserver;
        m && m.next(void 0), f && f.code ? a.close(f.code, f.reason) : c.error(new TypeError(ct)), t._resetState();
      }, function() {
        var f = t._config.closingObserver;
        f && f.next(void 0), a.close(), t._resetState();
      }), y && y instanceof j && d.add(y.subscribe(t.destination));
    }, a.onerror = function(l) {
      t._resetState(), c.error(l);
    }, a.onclose = function(l) {
      a === t._socket && t._resetState();
      var p = t._config.closeObserver;
      p && p.next(l), l.wasClean ? c.complete() : c.error(l);
    }, a.onmessage = function(l) {
      try {
        var p = t._config.deserializer;
        c.next(p(l));
      } catch (h) {
        c.error(h);
      }
    };
  }, e.prototype._subscribe = function(t) {
    var r = this, i = this.source;
    return i ? i.subscribe(t) : (this._socket || this._connectSocket(), this._output.subscribe(t), t.add(function() {
      var o = r._socket;
      r._output.observers.length === 0 && (o && (o.readyState === 1 || o.readyState === 0) && o.close(), r._resetState());
    }), t);
  }, e.prototype.unsubscribe = function() {
    var t = this._socket;
    t && (t.readyState === 1 || t.readyState === 0) && t.close(), this._resetState(), n.prototype.unsubscribe.call(this);
  }, e;
}(B);
function ft(n) {
  return new at(n);
}
const D = "listo-lists-manager";
class lt extends HTMLElement {
  constructor() {
    super(...arguments), this.socket = ft({
      url: "ws://" + location.host + "/ws",
      deserializer(e) {
        return JSON.parse(e.data);
      }
    }), this._teardown = new q();
  }
  connectedCallback() {
    this.socket.pipe(G({ count: 5, delay: 2e3 }), $(this._teardown)).subscribe((e) => {
      window.dispatchEvent(new CustomEvent("update-list", { detail: e }));
    });
  }
  disconnectedCallback() {
    this._teardown.next();
  }
}
customElements.get(D) || customElements.define(D, lt);
export {
  lt as ListoListManager,
  D as tagName
};
