import { fromEvent as $, startWith as q, map as G, switchMap as Q, of as X, Subject as Z, retry as N, takeUntil as tt } from "rxjs";
var P = function(r, e) {
  return P = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, n) {
    t.__proto__ = n;
  } || function(t, n) {
    for (var i in n)
      Object.prototype.hasOwnProperty.call(n, i) && (t[i] = n[i]);
  }, P(r, e);
};
function b(r, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  P(r, e);
  function t() {
    this.constructor = r;
  }
  r.prototype = e === null ? Object.create(e) : (t.prototype = e.prototype, new t());
}
var W = function() {
  return W = Object.assign || function(e) {
    for (var t, n = 1, i = arguments.length; n < i; n++) {
      t = arguments[n];
      for (var o in t)
        Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
    }
    return e;
  }, W.apply(this, arguments);
};
function A(r) {
  var e = typeof Symbol == "function" && Symbol.iterator, t = e && r[e], n = 0;
  if (t)
    return t.call(r);
  if (r && typeof r.length == "number")
    return {
      next: function() {
        return r && n >= r.length && (r = void 0), { value: r && r[n++], done: !r };
      }
    };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function g(r, e) {
  var t = typeof Symbol == "function" && r[Symbol.iterator];
  if (!t)
    return r;
  var n = t.call(r), i, o = [], s;
  try {
    for (; (e === void 0 || e-- > 0) && !(i = n.next()).done; )
      o.push(i.value);
  } catch (u) {
    s = { error: u };
  } finally {
    try {
      i && !i.done && (t = n.return) && t.call(n);
    } finally {
      if (s)
        throw s.error;
    }
  }
  return o;
}
function E(r, e, t) {
  if (t || arguments.length === 2)
    for (var n = 0, i = e.length, o; n < i; n++)
      (o || !(n in e)) && (o || (o = Array.prototype.slice.call(e, 0, n)), o[n] = e[n]);
  return r.concat(o || Array.prototype.slice.call(e));
}
function v(r) {
  return typeof r == "function";
}
function J(r) {
  var e = function(n) {
    Error.call(n), n.stack = new Error().stack;
  }, t = r(e);
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t;
}
var T = J(function(r) {
  return function(t) {
    r(this), this.message = t ? t.length + ` errors occurred during unsubscription:
` + t.map(function(n, i) {
      return i + 1 + ") " + n.toString();
    }).join(`
  `) : "", this.name = "UnsubscriptionError", this.errors = t;
  };
});
function C(r, e) {
  if (r) {
    var t = r.indexOf(e);
    0 <= t && r.splice(t, 1);
  }
}
var _ = function() {
  function r(e) {
    this.initialTeardown = e, this.closed = !1, this._parentage = null, this._finalizers = null;
  }
  return r.prototype.unsubscribe = function() {
    var e, t, n, i, o;
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
              M(y);
            } catch (f) {
              o = o ?? [], f instanceof T ? o = E(E([], g(o)), g(f.errors)) : o.push(f);
            }
          }
        } catch (f) {
          n = { error: f };
        } finally {
          try {
            h && !h.done && (i = p.return) && i.call(p);
          } finally {
            if (n)
              throw n.error;
          }
        }
      }
      if (o)
        throw new T(o);
    }
  }, r.prototype.add = function(e) {
    var t;
    if (e && e !== this)
      if (this.closed)
        M(e);
      else {
        if (e instanceof r) {
          if (e.closed || e._hasParent(this))
            return;
          e._addParent(this);
        }
        (this._finalizers = (t = this._finalizers) !== null && t !== void 0 ? t : []).push(e);
      }
  }, r.prototype._hasParent = function(e) {
    var t = this._parentage;
    return t === e || Array.isArray(t) && t.includes(e);
  }, r.prototype._addParent = function(e) {
    var t = this._parentage;
    this._parentage = Array.isArray(t) ? (t.push(e), t) : t ? [t, e] : e;
  }, r.prototype._removeParent = function(e) {
    var t = this._parentage;
    t === e ? this._parentage = null : Array.isArray(t) && C(t, e);
  }, r.prototype.remove = function(e) {
    var t = this._finalizers;
    t && C(t, e), e instanceof r && e._removeParent(this);
  }, r.EMPTY = function() {
    var e = new r();
    return e.closed = !0, e;
  }(), r;
}(), L = _.EMPTY;
function H(r) {
  return r instanceof _ || r && "closed" in r && v(r.remove) && v(r.add) && v(r.unsubscribe);
}
function M(r) {
  v(r) ? r() : r.unsubscribe();
}
var Y = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1
}, I = {
  setTimeout: function(r, e) {
    for (var t = [], n = 2; n < arguments.length; n++)
      t[n - 2] = arguments[n];
    var i = I.delegate;
    return i?.setTimeout ? i.setTimeout.apply(i, E([r, e], g(t))) : setTimeout.apply(void 0, E([r, e], g(t)));
  },
  clearTimeout: function(r) {
    var e = I.delegate;
    return (e?.clearTimeout || clearTimeout)(r);
  },
  delegate: void 0
};
function et(r) {
  I.setTimeout(function() {
    throw r;
  });
}
function R() {
}
function w(r) {
  r();
}
var F = function(r) {
  b(e, r);
  function e(t) {
    var n = r.call(this) || this;
    return n.isStopped = !1, t ? (n.destination = t, H(t) && t.add(n)) : n.destination = ot, n;
  }
  return e.create = function(t, n, i) {
    return new U(t, n, i);
  }, e.prototype.next = function(t) {
    this.isStopped || this._next(t);
  }, e.prototype.error = function(t) {
    this.isStopped || (this.isStopped = !0, this._error(t));
  }, e.prototype.complete = function() {
    this.isStopped || (this.isStopped = !0, this._complete());
  }, e.prototype.unsubscribe = function() {
    this.closed || (this.isStopped = !0, r.prototype.unsubscribe.call(this), this.destination = null);
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
}(_), rt = Function.prototype.bind;
function x(r, e) {
  return rt.call(r, e);
}
var nt = function() {
  function r(e) {
    this.partialObserver = e;
  }
  return r.prototype.next = function(e) {
    var t = this.partialObserver;
    if (t.next)
      try {
        t.next(e);
      } catch (n) {
        S(n);
      }
  }, r.prototype.error = function(e) {
    var t = this.partialObserver;
    if (t.error)
      try {
        t.error(e);
      } catch (n) {
        S(n);
      }
    else
      S(e);
  }, r.prototype.complete = function() {
    var e = this.partialObserver;
    if (e.complete)
      try {
        e.complete();
      } catch (t) {
        S(t);
      }
  }, r;
}(), U = function(r) {
  b(e, r);
  function e(t, n, i) {
    var o = r.call(this) || this, s;
    if (v(t) || !t)
      s = {
        next: t ?? void 0,
        error: n ?? void 0,
        complete: i ?? void 0
      };
    else {
      var u;
      o && Y.useDeprecatedNextContext ? (u = Object.create(t), u.unsubscribe = function() {
        return o.unsubscribe();
      }, s = {
        next: t.next && x(t.next, u),
        error: t.error && x(t.error, u),
        complete: t.complete && x(t.complete, u)
      }) : s = t;
    }
    return o.destination = new nt(s), o;
  }
  return e;
}(F);
function S(r) {
  et(r);
}
function it(r) {
  throw r;
}
var ot = {
  closed: !0,
  next: R,
  error: it,
  complete: R
}, st = function() {
  return typeof Symbol == "function" && Symbol.observable || "@@observable";
}();
function ut(r) {
  return r;
}
function ct(r) {
  return r.length === 0 ? ut : r.length === 1 ? r[0] : function(t) {
    return r.reduce(function(n, i) {
      return i(n);
    }, t);
  };
}
var k = function() {
  function r(e) {
    e && (this._subscribe = e);
  }
  return r.prototype.lift = function(e) {
    var t = new r();
    return t.source = this, t.operator = e, t;
  }, r.prototype.subscribe = function(e, t, n) {
    var i = this, o = ft(e) ? e : new U(e, t, n);
    return w(function() {
      var s = i, u = s.operator, c = s.source;
      o.add(u ? u.call(o, c) : c ? i._subscribe(o) : i._trySubscribe(o));
    }), o;
  }, r.prototype._trySubscribe = function(e) {
    try {
      return this._subscribe(e);
    } catch (t) {
      e.error(t);
    }
  }, r.prototype.forEach = function(e, t) {
    var n = this;
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
      n.subscribe(s);
    });
  }, r.prototype._subscribe = function(e) {
    var t;
    return (t = this.source) === null || t === void 0 ? void 0 : t.subscribe(e);
  }, r.prototype[st] = function() {
    return this;
  }, r.prototype.pipe = function() {
    for (var e = [], t = 0; t < arguments.length; t++)
      e[t] = arguments[t];
    return ct(e)(this);
  }, r.prototype.toPromise = function(e) {
    var t = this;
    return e = z(e), new e(function(n, i) {
      var o;
      t.subscribe(function(s) {
        return o = s;
      }, function(s) {
        return i(s);
      }, function() {
        return n(o);
      });
    });
  }, r.create = function(e) {
    return new r(e);
  }, r;
}();
function z(r) {
  var e;
  return (e = r ?? Y.Promise) !== null && e !== void 0 ? e : Promise;
}
function at(r) {
  return r && v(r.next) && v(r.error) && v(r.complete);
}
function ft(r) {
  return r && r instanceof F || at(r) && H(r);
}
var lt = J(function(r) {
  return function() {
    r(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed";
  };
}), O = function(r) {
  b(e, r);
  function e() {
    var t = r.call(this) || this;
    return t.closed = !1, t.currentObservers = null, t.observers = [], t.isStopped = !1, t.hasError = !1, t.thrownError = null, t;
  }
  return e.prototype.lift = function(t) {
    var n = new B(this, this);
    return n.operator = t, n;
  }, e.prototype._throwIfClosed = function() {
    if (this.closed)
      throw new lt();
  }, e.prototype.next = function(t) {
    var n = this;
    w(function() {
      var i, o;
      if (n._throwIfClosed(), !n.isStopped) {
        n.currentObservers || (n.currentObservers = Array.from(n.observers));
        try {
          for (var s = A(n.currentObservers), u = s.next(); !u.done; u = s.next()) {
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
    var n = this;
    w(function() {
      if (n._throwIfClosed(), !n.isStopped) {
        n.hasError = n.isStopped = !0, n.thrownError = t;
        for (var i = n.observers; i.length; )
          i.shift().error(t);
      }
    });
  }, e.prototype.complete = function() {
    var t = this;
    w(function() {
      if (t._throwIfClosed(), !t.isStopped) {
        t.isStopped = !0;
        for (var n = t.observers; n.length; )
          n.shift().complete();
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
    return this._throwIfClosed(), r.prototype._trySubscribe.call(this, t);
  }, e.prototype._subscribe = function(t) {
    return this._throwIfClosed(), this._checkFinalizedStatuses(t), this._innerSubscribe(t);
  }, e.prototype._innerSubscribe = function(t) {
    var n = this, i = this, o = i.hasError, s = i.isStopped, u = i.observers;
    return o || s ? L : (this.currentObservers = null, u.push(t), new _(function() {
      n.currentObservers = null, C(u, t);
    }));
  }, e.prototype._checkFinalizedStatuses = function(t) {
    var n = this, i = n.hasError, o = n.thrownError, s = n.isStopped;
    i ? t.error(o) : s && t.complete();
  }, e.prototype.asObservable = function() {
    var t = new k();
    return t.source = this, t;
  }, e.create = function(t, n) {
    return new B(t, n);
  }, e;
}(k), B = function(r) {
  b(e, r);
  function e(t, n) {
    var i = r.call(this) || this;
    return i.destination = t, i.source = n, i;
  }
  return e.prototype.next = function(t) {
    var n, i;
    (i = (n = this.destination) === null || n === void 0 ? void 0 : n.next) === null || i === void 0 || i.call(n, t);
  }, e.prototype.error = function(t) {
    var n, i;
    (i = (n = this.destination) === null || n === void 0 ? void 0 : n.error) === null || i === void 0 || i.call(n, t);
  }, e.prototype.complete = function() {
    var t, n;
    (n = (t = this.destination) === null || t === void 0 ? void 0 : t.complete) === null || n === void 0 || n.call(t);
  }, e.prototype._subscribe = function(t) {
    var n, i;
    return (i = (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(t)) !== null && i !== void 0 ? i : L;
  }, e;
}(O), K = {
  now: function() {
    return (K.delegate || Date).now();
  },
  delegate: void 0
}, j = function(r) {
  b(e, r);
  function e(t, n, i) {
    t === void 0 && (t = 1 / 0), n === void 0 && (n = 1 / 0), i === void 0 && (i = K);
    var o = r.call(this) || this;
    return o._bufferSize = t, o._windowTime = n, o._timestampProvider = i, o._buffer = [], o._infiniteTimeWindow = !0, o._infiniteTimeWindow = n === 1 / 0, o._bufferSize = Math.max(1, t), o._windowTime = Math.max(1, n), o;
  }
  return e.prototype.next = function(t) {
    var n = this, i = n.isStopped, o = n._buffer, s = n._infiniteTimeWindow, u = n._timestampProvider, c = n._windowTime;
    i || (o.push(t), !s && o.push(u.now() + c)), this._trimBuffer(), r.prototype.next.call(this, t);
  }, e.prototype._subscribe = function(t) {
    this._throwIfClosed(), this._trimBuffer();
    for (var n = this._innerSubscribe(t), i = this, o = i._infiniteTimeWindow, s = i._buffer, u = s.slice(), c = 0; c < u.length && !t.closed; c += o ? 1 : 2)
      t.next(u[c]);
    return this._checkFinalizedStatuses(t), n;
  }, e.prototype._trimBuffer = function() {
    var t = this, n = t._bufferSize, i = t._timestampProvider, o = t._buffer, s = t._infiniteTimeWindow, u = (s ? 1 : 2) * n;
    if (n < 1 / 0 && u < o.length && o.splice(0, o.length - u), !s) {
      for (var c = i.now(), a = 0, d = 1; d < o.length && o[d] <= c; d += 2)
        a = d;
      a && o.splice(0, a + 1);
    }
  }, e;
}(O), pt = {
  url: "",
  deserializer: function(r) {
    return JSON.parse(r.data);
  },
  serializer: function(r) {
    return JSON.stringify(r);
  }
}, ht = "WebSocketSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }", dt = function(r) {
  b(e, r);
  function e(t, n) {
    var i = r.call(this) || this;
    if (i._socket = null, t instanceof k)
      i.destination = n, i.source = t;
    else {
      var o = i._config = W({}, pt);
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
    var n = new e(this._config, this.destination);
    return n.operator = t, n.source = this, n;
  }, e.prototype._resetState = function() {
    this._socket = null, this.source || (this.destination = new j()), this._output = new O();
  }, e.prototype.multiplex = function(t, n, i) {
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
          o.next(n());
        } catch (c) {
          s.error(c);
        }
        u.unsubscribe();
      };
    });
  }, e.prototype._connectSocket = function() {
    var t = this, n = this._config, i = n.WebSocketCtor, o = n.protocol, s = n.url, u = n.binaryType, c = this._output, a = null;
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
        m && m.next(void 0), f && f.code ? a.close(f.code, f.reason) : c.error(new TypeError(ht)), t._resetState();
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
    var n = this, i = this.source;
    return i ? i.subscribe(t) : (this._socket || this._connectSocket(), this._output.subscribe(t), t.add(function() {
      var o = n._socket;
      n._output.observers.length === 0 && (o && (o.readyState === 1 || o.readyState === 0) && o.close(), n._resetState());
    }), t);
  }, e.prototype.unsubscribe = function() {
    var t = this._socket;
    t && (t.readyState === 1 || t.readyState === 0) && t.close(), this._resetState(), r.prototype.unsubscribe.call(this);
  }, e;
}(B);
function vt(r) {
  return new dt(r);
}
function bt() {
  const r = $(document, "visibilitychange").pipe(q(void 0));
  return (e) => r.pipe(G(() => document.visibilityState === "visible"), Q((t) => t ? e : X()));
}
const D = "listo-lists-manager";
class yt extends HTMLElement {
  constructor() {
    super(...arguments), this.socket = vt({
      url: "ws://" + location.host + "/ws",
      deserializer(e) {
        return JSON.parse(e.data);
      }
    }), this._teardown = new Z();
  }
  connectedCallback() {
    this.socket.pipe(bt(), N({ count: 5, delay: 2e3 }), tt(this._teardown)).subscribe((e) => {
      window.dispatchEvent(new CustomEvent("update-list", { detail: e }));
    });
  }
  disconnectedCallback() {
    this._teardown.next();
  }
}
customElements.get(D) || customElements.define(D, yt);
export {
  yt as ListoListManager,
  D as tagName
};
