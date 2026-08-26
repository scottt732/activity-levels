const fe = globalThis, Ge = fe.ShadowRoot && (fe.ShadyCSS === void 0 || fe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Be = /* @__PURE__ */ Symbol(), tt = /* @__PURE__ */ new WeakMap();
let wt = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== Be) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (Ge && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = tt.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && tt.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Nt = (t) => new wt(typeof t == "string" ? t : t + "", void 0, Be), _ = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[n + 1], t[0]);
  return new wt(s, t, Be);
}, It = (t, e) => {
  if (Ge) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), r = fe.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, t.appendChild(i);
  }
}, st = Ge ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return Nt(s);
})(t) : t;
const { is: Ut, defineProperty: Ht, getOwnPropertyDescriptor: Ft, getOwnPropertyNames: jt, getOwnPropertySymbols: zt, getPrototypeOf: Gt } = Object, Se = globalThis, it = Se.trustedTypes, Bt = it ? it.emptyScript : "", Vt = Se.reactiveElementPolyfillSupport, ie = (t, e) => t, $e = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Bt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let s = t;
  switch (e) {
    case Boolean:
      s = t !== null;
      break;
    case Number:
      s = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(t);
      } catch {
        s = null;
      }
  }
  return s;
} }, Ve = (t, e) => !Ut(t, e), rt = { attribute: !0, type: String, converter: $e, reflect: !1, useDefault: !1, hasChanged: Ve };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), Se.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let K = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = rt) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, i, s);
      r !== void 0 && Ht(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: r, set: n } = Ft(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: r, set(o) {
      const l = r?.call(this);
      n?.call(this, o), this.requestUpdate(e, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? rt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ie("elementProperties"))) return;
    const e = Gt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ie("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ie("properties"))) {
      const s = this.properties, i = [...jt(s), ...zt(s)];
      for (const r of i) this.createProperty(r, s[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [i, r] of s) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const r = this._$Eu(s, i);
      r !== void 0 && this._$Eh.set(r, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const r of i) s.unshift(st(r));
    } else e !== void 0 && s.push(st(e));
    return s;
  }
  static _$Eu(e, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return It(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, i) {
    this._$AK(e, i);
  }
  _$ET(e, s) {
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : $e).toAttribute(s, i.type);
      this._$Em = e, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : $e;
      this._$Em = r;
      const l = o.fromAttribute(s, n.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, r = !1, n) {
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? Ve)(n, s) || i.useDefault && i.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: r, wrapped: n }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? s ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, n] of i) {
        const { wrapped: o } = n, l = this[r];
        o !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, n, l);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(s);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
K.elementStyles = [], K.shadowRootOptions = { mode: "open" }, K[ie("elementProperties")] = /* @__PURE__ */ new Map(), K[ie("finalized")] = /* @__PURE__ */ new Map(), Vt?.({ ReactiveElement: K }), (Se.reactiveElementVersions ??= []).push("2.1.2");
const We = globalThis, nt = (t) => t, ye = We.trustedTypes, ot = ye ? ye.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Et = "$lit$", M = `lit$${Math.random().toFixed(9).slice(2)}$`, At = "?" + M, Wt = `<${At}>`, F = document, ne = () => F.createComment(""), oe = (t) => t === null || typeof t != "object" && typeof t != "function", Ke = Array.isArray, Kt = (t) => Ke(t) || typeof t?.[Symbol.iterator] == "function", Me = `[ 	
\f\r]`, ee = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, at = /-->/g, lt = />/g, N = RegExp(`>|${Me}(?:([^\\s"'>=/]+)(${Me}*=${Me}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ct = /'/g, ht = /"/g, St = /^(?:script|style|textarea|title)$/i, kt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), c = kt(1), dt = kt(2), j = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), ut = /* @__PURE__ */ new WeakMap(), I = F.createTreeWalker(F, 129);
function Ct(t, e) {
  if (!Ke(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ot !== void 0 ? ot.createHTML(e) : e;
}
const qt = (t, e) => {
  const s = t.length - 1, i = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ee;
  for (let l = 0; l < s; l++) {
    const a = t[l];
    let p, u, m = -1, C = 0;
    for (; C < a.length && (o.lastIndex = C, u = o.exec(a), u !== null); ) C = o.lastIndex, o === ee ? u[1] === "!--" ? o = at : u[1] !== void 0 ? o = lt : u[2] !== void 0 ? (St.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = N) : u[3] !== void 0 && (o = N) : o === N ? u[0] === ">" ? (o = r ?? ee, m = -1) : u[1] === void 0 ? m = -2 : (m = o.lastIndex - u[2].length, p = u[1], o = u[3] === void 0 ? N : u[3] === '"' ? ht : ct) : o === ht || o === ct ? o = N : o === at || o === lt ? o = ee : (o = N, r = void 0);
    const T = o === N && t[l + 1].startsWith("/>") ? " " : "";
    n += o === ee ? a + Wt : m >= 0 ? (i.push(p), a.slice(0, m) + Et + a.slice(m) + M + T) : a + M + (m === -2 ? l : T);
  }
  return [Ct(t, n + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class ae {
  constructor({ strings: e, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = e.length - 1, a = this.parts, [p, u] = qt(e, s);
    if (this.el = ae.createElement(p, i), I.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (r = I.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const m of r.getAttributeNames()) if (m.endsWith(Et)) {
          const C = u[o++], T = r.getAttribute(m).split(M), pe = /([.?@])?(.*)/.exec(C);
          a.push({ type: 1, index: n, name: pe[2], strings: T, ctor: pe[1] === "." ? Yt : pe[1] === "?" ? Jt : pe[1] === "@" ? Zt : ke }), r.removeAttribute(m);
        } else m.startsWith(M) && (a.push({ type: 6, index: n }), r.removeAttribute(m));
        if (St.test(r.tagName)) {
          const m = r.textContent.split(M), C = m.length - 1;
          if (C > 0) {
            r.textContent = ye ? ye.emptyScript : "";
            for (let T = 0; T < C; T++) r.append(m[T], ne()), I.nextNode(), a.push({ type: 2, index: ++n });
            r.append(m[C], ne());
          }
        }
      } else if (r.nodeType === 8) if (r.data === At) a.push({ type: 2, index: n });
      else {
        let m = -1;
        for (; (m = r.data.indexOf(M, m + 1)) !== -1; ) a.push({ type: 7, index: n }), m += M.length - 1;
      }
      n++;
    }
  }
  static createElement(e, s) {
    const i = F.createElement("template");
    return i.innerHTML = e, i;
  }
}
function X(t, e, s = t, i) {
  if (e === j) return e;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const n = oe(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(t), r._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (e = X(t, r._$AS(t, e.values), r, i)), e;
}
class Xt {
  constructor(e, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: s }, parts: i } = this._$AD, r = (e?.creationScope ?? F).importNode(s, !0);
    I.currentNode = r;
    let n = I.nextNode(), o = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let p;
        a.type === 2 ? p = new ce(n, n.nextSibling, this, e) : a.type === 1 ? p = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (p = new Qt(n, this, e)), this._$AV.push(p), a = i[++l];
      }
      o !== a?.index && (n = I.nextNode(), o++);
    }
    return I.currentNode = F, r;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class ce {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, r) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && e?.nodeType === 11 && (e = s.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, s = this) {
    e = X(this, e, s), oe(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== j && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Kt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && oe(this._$AH) ? this._$AA.nextSibling.data = e : this.T(F.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = ae.createElement(Ct(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const n = new Xt(r, this), o = n.u(this.options);
      n.p(s), this.T(o), this._$AH = n;
    }
  }
  _$AC(e) {
    let s = ut.get(e.strings);
    return s === void 0 && ut.set(e.strings, s = new ae(e)), s;
  }
  k(e) {
    Ke(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const n of e) r === s.length ? s.push(i = new ce(this.O(ne()), this.O(ne()), this, this.options)) : i = s[r], i._$AI(n), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = nt(e).nextSibling;
      nt(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ke {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, r, n) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = s, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(e, s = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = X(this, e, s, 0), o = !oe(e) || e !== this._$AH && e !== j, o && (this._$AH = e);
    else {
      const l = e;
      let a, p;
      for (e = n[0], a = 0; a < n.length - 1; a++) p = X(this, l[i + a], s, a), p === j && (p = this._$AH[a]), o ||= !oe(p) || p !== this._$AH[a], p === d ? e = d : e !== d && (e += (p ?? "") + n[a + 1]), this._$AH[a] = p;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Yt extends ke {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class Jt extends ke {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class Zt extends ke {
  constructor(e, s, i, r, n) {
    super(e, s, i, r, n), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = X(this, e, s, 0) ?? d) === j) return;
    const i = this._$AH, r = e === d && i !== d || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== d && (i === d || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Qt {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    X(this, e);
  }
}
const es = We.litHtmlPolyfillSupport;
es?.(ae, ce), (We.litHtmlVersions ??= []).push("3.3.3");
const ts = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = s?.renderBefore ?? null;
    i._$litPart$ = r = new ce(e.insertBefore(ne(), n), n, void 0, s ?? {});
  }
  return r._$AI(t), r;
};
const qe = globalThis;
let f = class extends K {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ts(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return j;
  }
};
f._$litElement$ = !0, f.finalized = !0, qe.litElementHydrateSupport?.({ LitElement: f });
const ss = qe.litElementPolyfillSupport;
ss?.({ LitElement: f });
(qe.litElementVersions ??= []).push("4.2.2");
const w = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
const is = { attribute: !0, type: String, converter: $e, reflect: !1, hasChanged: Ve }, rs = (t = is, e, s) => {
  const { kind: i, metadata: r } = s;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), n.set(s.name, t), i === "accessor") {
    const { name: o } = s;
    return { set(l) {
      const a = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(o, a, t, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, t, l), l;
    } };
  }
  if (i === "setter") {
    const { name: o } = s;
    return function(l) {
      const a = this[o];
      e.call(this, l), this.requestUpdate(o, a, t, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function h(t) {
  return (e, s) => typeof s == "object" ? rs(t, e, s) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(t, e, s);
}
function b(t) {
  return h({ ...t, state: !0, attribute: !1 });
}
const Pt = (t) => ({ ok: t.ok, errors: t.errors ?? [] }), ns = (t) => t.callWS({ type: "activity_levels/config/get" }).then((e) => e.config), os = (t, e) => t.callWS({ type: "activity_levels/config/validate", config: e }).then(Pt);
async function as(t, e) {
  try {
    return Pt(await t.callWS({ type: "activity_levels/config/save", config: e }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const ls = (t) => t.callWS({ type: "activity_levels/state" }), Re = [
  "ha-card",
  "ha-icon",
  "ha-icon-button",
  "ha-alert",
  "ha-button",
  "ha-switch",
  "ha-expansion-panel",
  "ha-top-app-bar-fixed",
  "ha-form",
  "ha-selector"
], cs = 2500, hs = 8e3;
function ds(t) {
  let e;
  return { promise: new Promise((i) => {
    e = setTimeout(i, t);
  }), cancel: () => clearTimeout(e) };
}
async function pt(t, e, s) {
  const i = ds(e);
  try {
    return await Promise.race([t, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function us() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function ps(t = hs, e = cs) {
  if (Re.every((r) => customElements.get(r))) return { ok: !0, missing: [] };
  await pt(us(), e, void 0);
  const s = await Promise.all(
    Re.map(
      (r) => pt(
        customElements.whenDefined(r).then(() => !0),
        t,
        !1
      )
    )
  ), i = Re.filter((r, n) => !s[n]);
  return { ok: i.length === 0, missing: [...i] };
}
async function ms(t, e) {
  try {
    const s = await e.validate(t);
    if (!s.ok)
      return {
        errors: s.errors,
        banner: { kind: "error", text: `${s.errors.length} problem(s) to fix before saving.` },
        reload: !1
      };
    const i = await e.save(t);
    return i.ok ? { errors: [], banner: { kind: "info", text: "Saved. Activity Levels is reloading." }, reload: !0 } : {
      errors: i.errors,
      banner: { kind: "error", text: i.errors[0]?.message ?? "Save failed" },
      reload: !1
    };
  } catch (s) {
    return { errors: null, banner: { kind: "error", text: `Save failed: ${s instanceof Error ? s.message : String(s)}` }, reload: !1 };
  }
}
function Xe(t, e) {
  let s = t;
  for (const i of e) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function mt(t) {
  return Array.isArray(t) ? [...t] : { ...t };
}
function Ce(t, e, s) {
  if (e.length === 0) throw new Error("empty path");
  const i = mt(t);
  let r = i;
  for (let n = 0; n < e.length - 1; n++) {
    const o = e[n], l = mt(r[o]);
    r[o] = l, r = l;
  }
  return s(r, e[e.length - 1]), i;
}
function z(t, e, s) {
  return Ce(t, e, (i, r) => {
    i[r] = s;
  });
}
function Ye(t, e) {
  return Ce(t, e, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function Fe(t, e, s, i) {
  return Ce(t, [...e, s], (r) => {
    r.splice(s, 0, i);
  });
}
function fs(t, e, s, i) {
  return Ce(t, [...e, s], (r) => {
    const n = r, [o] = n.splice(s, 1);
    n.splice(i, 0, o);
  });
}
const vs = 1e3;
class gs {
  constructor(e) {
    this.past = [], this.future = [], this.coalesceKey = null, this.coalesceAt = 0, this.original = e, this.config = e;
  }
  get dirty() {
    return this.config !== this.original && JSON.stringify(this.config) !== JSON.stringify(this.original);
  }
  get canUndo() {
    return this.past.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }
  /**
   * Records a new config. Passing the same `coalesceKey` again within
   * {@link COALESCE_MS} keeps those edits in one undo step, so typing in a field
   * does not fill the history with a step per keystroke.
   */
  set(e, s) {
    const i = Date.now();
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < vs || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = s ?? null, this.coalesceAt = i;
  }
  undo() {
    this.coalesceKey = null;
    const e = this.past.pop();
    e && (this.future.push(this.config), this.config = e);
  }
  redo() {
    this.coalesceKey = null;
    const e = this.future.pop();
    e && (this.past.push(this.config), this.config = e);
  }
  reset(e) {
    this.original = e, this.config = e, this.past = [], this.future = [], this.coalesceKey = null;
  }
}
const D = _`
  :host {
    display: block;
    color: var(--primary-text-color);
    background: var(--primary-background-color);
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) 2fr;
    gap: 16px;
    padding: 16px;
  }
  .layout.narrow {
    grid-template-columns: 1fr;
  }
  ha-card {
    padding: 16px;
  }
  .muted {
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .grow {
    flex: 1;
  }
  .tabs {
    display: flex;
    gap: 4px;
    padding: 0 16px;
    border-bottom: 1px solid var(--divider-color);
  }
  .tab {
    padding: 12px 16px;
    cursor: pointer;
    border: none;
    border-bottom: 2px solid transparent;
    background: none;
    font: inherit;
    color: var(--secondary-text-color);
  }
  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
  .tab:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .error {
    color: var(--error-color, #db4437);
  }
  .meter {
    height: 6px;
    border-radius: 3px;
    background: var(--divider-color);
    overflow: hidden;
    width: 80px;
    flex-shrink: 0;
  }
  .meter > div {
    height: 100%;
    background: var(--primary-color);
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--secondary-text-color);
    flex-shrink: 0;
  }
  .dot.gated {
    background: var(--primary-color);
  }
  /* Envelope phase, coloured the way the live view reads it: rising is the accent,
     holding is healthy, releasing is winding down, idle is quiet. */
  .phase {
    text-transform: capitalize;
    color: var(--secondary-text-color);
  }
  .phase.attack,
  .phase.decay {
    color: var(--primary-color);
  }
  .phase.sustain {
    color: var(--success-color, #43a047);
  }
  .phase.release {
    color: var(--warning-color, #ffa600);
  }
`;
var bs = Object.defineProperty, $s = Object.getOwnPropertyDescriptor, $ = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? $s(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && bs(e, s, r), r;
};
const te = ["groups", "envelopes", "defaults"], ys = 2e3, xs = 1500;
let g = class extends f {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.tabFocus = 0, this.onVisibilityChange = () => this.updateLivePolling(), this.onChange = (t) => {
      t.structural && (this.errors = []), this.setConfig(t.detail, t.coalesceKey);
    }, this.onTabsKeydown = (t) => {
      const e = te.length - 1;
      switch (t.key) {
        case "ArrowRight":
          this.focusTab((this.tabFocus + 1) % te.length);
          break;
        case "ArrowLeft":
          this.focusTab((this.tabFocus + e) % te.length);
          break;
        case "Home":
          this.focusTab(0);
          break;
        case "End":
          this.focusTab(e);
          break;
        case "Enter":
        case " ":
          this.selectTab(this.tabFocus);
          break;
        default:
          return;
      }
      t.preventDefault();
    };
  }
  async connectedCallback() {
    super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange);
    const { ok: t, missing: e } = await ps();
    this.missing = t ? [] : e, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.stopLive();
  }
  async load() {
    try {
      const t = await ns(this.hass);
      this.draft = new gs(t), this.syncSelection(), this.errors = [], this.banner = null;
    } catch (t) {
      this.banner = { kind: "error", text: `Could not load configuration: ${t.message}` };
    }
  }
  setConfig(t, e) {
    this.draft?.set(t, e), this.syncSelection(), this.requestUpdate();
  }
  /** Drops a selection whose node is gone, so the editor pane never renders a dangling path. */
  syncSelection() {
    const t = this.draft?.config;
    !t || !this.selection || Xe(t, this.selection) === void 0 && (this.selection = null);
  }
  async save() {
    const t = this.draft;
    if (t) {
      this.busy = !0, this.updateLivePolling();
      try {
        const e = await ms(t.config, {
          validate: (s) => os(this.hass, s),
          save: (s) => as(this.hass, s)
        });
        e.errors !== null && (this.errors = e.errors), this.banner = e.banner, e.reload && (await new Promise((s) => setTimeout(s, xs)), await this.load());
      } finally {
        this.busy = !1, this.updateLivePolling();
      }
    }
  }
  discard() {
    this.draft && (this.draft.reset(this.draft.original), this.syncSelection(), this.errors = [], this.banner = null, this.requestUpdate());
  }
  undo() {
    this.draft?.undo(), this.syncSelection(), this.requestUpdate();
  }
  redo() {
    this.draft?.redo(), this.syncSelection(), this.requestUpdate();
  }
  toggleLive(t) {
    t ? this.startLive() : this.stopLive();
  }
  startLive() {
    this.liveOn = !0, this.updateLivePolling();
  }
  stopLive() {
    this.liveOn = !1, this.clearLiveTimer(), this.live = null;
  }
  /**
   * Starts or pauses the poll to match the current conditions. It runs only while the
   * toggle is on, no save is in flight - a reload is about to replace the config the
   * frame describes - and the tab is actually on screen. Pausing keeps the last frame,
   * so resuming redraws immediately rather than blanking the meters.
   */
  updateLivePolling() {
    if (!(this.liveOn && !this.busy && document.visibilityState === "visible")) {
      this.clearLiveTimer();
      return;
    }
    this.liveTimer === void 0 && (this.pollLive(), this.liveTimer = window.setInterval(() => {
      this.pollLive();
    }, ys));
  }
  async pollLive() {
    try {
      this.live = await ls(this.hass);
    } catch {
    }
  }
  clearLiveTimer() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
  }
  selectTab(t) {
    const e = te[t];
    e !== void 0 && (this.tab = e, this.tabFocus = t);
  }
  /** Moves the roving tabindex, and the focus with it, without changing the shown tab. */
  focusTab(t) {
    this.tabFocus = t, this.updateComplete.then(() => {
      this.renderRoot.querySelectorAll('[role="tab"]')[t]?.focus();
    });
  }
  render() {
    if (this.missing.length) return this.renderMissing();
    const t = this.draft;
    return c`
      <ha-top-app-bar-fixed .narrow=${this.narrow}>
        <ha-menu-button slot="navigationIcon"></ha-menu-button>
        <div slot="title">Activity Levels</div>
        <div slot="actionItems" class="row">
          <span class="muted">Live</span>
          <ha-switch
            .checked=${this.liveOn}
            @change=${(e) => this.toggleLive(e.target.checked)}
          ></ha-switch>
          <ha-icon-button .disabled=${!t?.canUndo} @click=${this.undo} title="Undo">
            <ha-icon icon="mdi:undo"></ha-icon>
          </ha-icon-button>
          <ha-icon-button .disabled=${!t?.canRedo} @click=${this.redo} title="Redo">
            <ha-icon icon="mdi:redo"></ha-icon>
          </ha-icon-button>
          <ha-button appearance="plain" .disabled=${!t?.dirty || this.busy} @click=${this.discard}>Discard</ha-button>
          <ha-button .disabled=${!t?.dirty || this.busy} @click=${this.save}
            >${t?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${te.map(
      (e, s) => c`<button
              type="button"
              id="tab-${e}"
              class="tab ${this.tab === e ? "active" : ""}"
              role="tab"
              aria-selected=${this.tab === e ? "true" : "false"}
              aria-controls="tabpanel"
              tabindex=${s === this.tabFocus ? 0 : -1}
              @click=${() => this.selectTab(s)}
            >
              ${e[0].toUpperCase() + e.slice(1)}
            </button>`
    )}
        </div>
        <div id="tabpanel" role="tabpanel" aria-labelledby="tab-${this.tab}">
          ${t ? this.renderTab(t) : c`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
  }
  renderMissing() {
    return c`
      <div style="padding:16px">
        <p>
          <strong>Activity Levels</strong>: some Home Assistant UI components did not load
          (${this.missing.join(", ")}). Open <em>Settings → Devices &amp; services</em> once, then return here and
          reload the page.
        </p>
      </div>
    `;
  }
  renderBanner() {
    const t = this.banner;
    return t ? c`<ha-alert
      alert-type=${t.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
      this.banner = null;
    }}
      >${t.text}</ha-alert
    >` : d;
  }
  renderTab(t) {
    switch (this.tab) {
      case "groups":
        return c`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree
            .hass=${this.hass}
            .config=${t.config}
            .selection=${this.selection}
            .errors=${this.errors}
            .live=${this.live}
            @al-select=${(e) => {
          this.selection = e.detail;
        }}
            @al-change=${this.onChange}
          ></al-tree>
          <div>${this.renderEditor(t)}</div>
        </div>`;
      case "envelopes":
        return c`<al-envelopes
          .hass=${this.hass}
          .config=${t.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
      case "defaults":
        return c`<al-defaults
          .hass=${this.hass}
          .config=${t.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
    }
  }
  renderEditor(t) {
    const e = this.selection;
    return e ? e[e.length - 2] === "stimuli" ? c`<al-stimulus-editor
          .hass=${this.hass}
          .config=${t.config}
          .path=${e}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>` : c`<al-group-editor
          .hass=${this.hass}
          .config=${t.config}
          .path=${e}
          .errors=${this.errors}
          @al-change=${this.onChange}
          @al-select=${(i) => {
      this.selection = i.detail;
    }}
        ></al-group-editor>` : c`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
  }
};
g.styles = [D];
$([
  h({ attribute: !1 })
], g.prototype, "hass", 2);
$([
  h({ type: Boolean })
], g.prototype, "narrow", 2);
$([
  b()
], g.prototype, "draft", 2);
$([
  b()
], g.prototype, "tab", 2);
$([
  b()
], g.prototype, "selection", 2);
$([
  b()
], g.prototype, "errors", 2);
$([
  b()
], g.prototype, "banner", 2);
$([
  b()
], g.prototype, "live", 2);
$([
  b()
], g.prototype, "liveOn", 2);
$([
  b()
], g.prototype, "busy", 2);
$([
  b()
], g.prototype, "missing", 2);
$([
  b()
], g.prototype, "tabFocus", 2);
g = $([
  w("activity-levels-panel")
], g);
function U(t) {
  const e = Math.floor(t / 3600), s = Math.floor((t - e * 3600) / 60), i = Math.round((t - e * 3600 - s * 60) * 1e3) / 1e3, r = Math.floor(i), n = Math.round((i - r) * 1e3);
  return n === 0 ? { hours: e, minutes: s, seconds: r } : { hours: e, minutes: s, seconds: r, milliseconds: n };
}
function H(t) {
  if (!t) return null;
  const e = (t.days ?? 0) * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds + (t.milliseconds ?? 0) / 1e3;
  return Math.round(e * 1e3) / 1e3;
}
function E(t) {
  if (t === 0) return "0s";
  const e = [];
  let s = t;
  const i = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [r, n] of i) {
    const o = Math.floor(s / n);
    o > 0 && (e.push(`${o}${r}`), s -= o * n);
  }
  return s = Math.round(s * 1e3) / 1e3, s > 0 && e.push(`${s}s`), e.join(" ");
}
const v = (t) => t.join("/");
function Pe(t, e) {
  const s = v(e), i = {};
  for (const r of t) {
    if (!r.path.startsWith(s + "/")) continue;
    const n = r.path.slice(s.length + 1);
    n.includes("/") || (i[n] = r.message);
  }
  return i;
}
function je(t, e) {
  const s = v(e);
  return t.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function he(t, e, s) {
  const i = new CustomEvent("al-change", {
    detail: t,
    bubbles: !0,
    composed: !0
  });
  return e !== void 0 && (i.coalesceKey = e), s && (i.structural = !0), i;
}
const Ot = (t) => new CustomEvent("al-select", { detail: t, bubbles: !0, composed: !0 }), Z = (t, e) => new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 }), _s = () => Z("al-select-strip", null), ws = () => Z("al-open-strip", null), Es = (t) => Z("al-gain-changed", t), As = (t) => Z("al-mix-changed", { mix: t }), Ss = (t) => Z("al-limiter-changed", { value: t }), ks = (t) => Z("al-sim-toggled", { on: t }), Cs = (t) => ({
  id: t,
  name: null,
  area: null,
  mix: "sum",
  null_handling: "zero",
  max_value: null,
  precision: null,
  gain: 1,
  stimuli: [],
  children: []
}), Ps = (t) => ({
  id: t,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), Os = (t) => ({
  entity: t,
  to: ["on"],
  gain: 1,
  key: null,
  envelope: null,
  attack: null,
  decay: null,
  sustain: null,
  release: null,
  impulse: null,
  retrigger: null,
  unavailable: null,
  debounce: null
});
function Ls(t) {
  const e = /* @__PURE__ */ new Set(), s = (i) => {
    e.add(i.id), i.children.forEach(s);
  };
  return t.groups.forEach(s), e;
}
function Ts(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const Ms = (t) => new Set(t.envelopes.map((e) => e.id));
function Lt(t, e) {
  const s = Ts(e);
  if (!t.has(s)) return s;
  let i = 2;
  for (; t.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const Rs = (t, e) => Lt(Ls(t), e), Ds = (t, e) => Lt(Ms(t), e);
function Ns(t, e) {
  const s = [], i = (r) => {
    r.stimuli.some((n) => n.envelope === e) && s.push(r.id), r.children.forEach(i);
  };
  return t.groups.forEach(i), { defaults: t.defaults.envelope === e, groups: s };
}
function Is(t, e, s) {
  const i = t.envelopes[e];
  if (!i || i.id === s) return t;
  const r = i.id, n = t.envelopes.map((l, a) => a === e ? { ...l, id: s } : l);
  if (t.envelopes.some((l, a) => a !== e && l.id === r)) return { ...t, envelopes: n };
  const o = (l) => ({
    ...l,
    stimuli: l.stimuli.map((a) => a.envelope === r ? { ...a, envelope: s } : a),
    children: l.children.map(o)
  });
  return {
    ...t,
    defaults: t.defaults.envelope === r ? { ...t.defaults, envelope: s } : t.defaults,
    envelopes: n,
    groups: t.groups.map(o)
  };
}
const ve = (t, e) => Xe(t, e), De = (t, e) => Xe(t, e), Us = (t) => t.slice(0, -1), Je = (t) => t.slice(0, -2), Tt = (t, e) => t.envelopes.find((s) => s.id === (e ?? t.defaults.envelope));
function Hs(t, e) {
  const s = Tt(t, e.envelope), i = t.defaults, r = (n, o, l) => n ?? o ?? l;
  return {
    attack: r(e.attack, s?.attack, 0),
    decay: r(e.decay, s?.decay, 0),
    sustain: r(e.sustain, s?.sustain, 1),
    release: r(e.release, s?.release, 1800),
    impulse: r(e.impulse, s?.impulse, !1),
    retrigger: r(e.retrigger, s?.retrigger, i.retrigger),
    unavailable: r(e.unavailable, s?.unavailable, i.unavailable),
    debounce: r(e.debounce, s?.debounce, i.debounce)
  };
}
var Fs = Object.defineProperty, js = Object.getOwnPropertyDescriptor, Q = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? js(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Fs(e, s, r), r;
};
const ft = (t) => t.stopPropagation(), zs = (t) => {
  (t.key === "Enter" || t.key === " ") && t.stopPropagation();
};
let R = class extends f {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(t) {
    this.dispatchEvent(he(t, void 0, !0));
  }
  emitSelect(t) {
    this.dispatchEvent(Ot(t));
  }
  isSelected(t) {
    return this.selection !== null && v(this.selection) === v(t);
  }
  select(t, e) {
    t.stopPropagation(), this.emitSelect(e);
  }
  selectOnKey(t, e) {
    t.key !== "Enter" && t.key !== " " || (t.preventDefault(), t.stopPropagation(), this.emitSelect(e));
  }
  addGroup(t, e) {
    const s = this.config;
    s && (this.emitChange(Fe(s, t, e, Cs(Rs(s, "new_group")))), this.emitSelect([...t, e]));
  }
  addStimulus(t, e) {
    const s = this.config;
    if (!s) return;
    const i = [...t, "stimuli"];
    this.emitChange(Fe(s, i, e, Os(""))), this.emitSelect([...i, e]);
  }
  move(t, e) {
    const s = this.config;
    if (!s) return;
    const i = Us(t), r = t[t.length - 1], n = r + e;
    this.emitChange(fs(s, i, r, n));
    const o = this.selectionAfterSwap(i, r, n);
    o !== null && this.emitSelect(o);
  }
  /**
   * Where the selection lands after two adjacent siblings swap places, or `null` when it
   * is untouched. Reordering is always a swap of neighbours, so only paths running through
   * one of the two slots move - the moved node itself, or anything inside the sibling it
   * displaced. Everything else keeps naming the same node and is left alone, rather than
   * having the editor pane jump to whatever was just reordered.
   */
  selectionAfterSwap(t, e, s) {
    const i = this.selection;
    if (i === null || i.length <= t.length || v(i.slice(0, t.length)) !== v(t)) return null;
    const r = i[t.length], n = r === e ? s : r === s ? e : null;
    if (n === null) return null;
    const o = [...i];
    return o[t.length] = n, o;
  }
  removeNode(t, e) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${e}? This cannot be undone after saving.`)) return;
    this.emitChange(Ye(s, t));
    const i = Je(t);
    this.emitSelect(i.length ? i : null);
  }
  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  countdown(t) {
    const e = this.live?.now;
    return t === null || e === void 0 ? null : E(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
  }
  /** Tooltip for a voice's phase chip: what it is doing, and how long that lasts. */
  voiceTitle(t) {
    const e = this.countdown(t.phase_ends);
    return e === null ? `Phase: ${t.phase}` : `Phase: ${t.phase}, ends in ${e}`;
  }
  /** Tooltip for a group's meter: the displayed value, the unrounded mix, and the next wake. */
  meterTitle(t, e, s) {
    const i = [`${t.value} of ${e}`, `raw ${t.raw_value.toFixed(3)}`], r = s ? this.countdown(t.next_wake) : null;
    return r !== null && i.push(`next wake in ${r}`), i.join(" · ");
  }
  render() {
    const t = this.config;
    return t ? t.groups.length === 0 ? this.renderEmpty() : c`
      <ha-card>
        ${t.groups.map((e, s) => this.renderGroup(t, e, ["groups", s], 0, s, t.groups.length))}
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], t.groups.length)}>Add group</ha-button>
        </div>
      </ha-card>
    ` : c`<ha-card><span class="muted">Loading…</span></ha-card>`;
  }
  renderEmpty() {
    return c`
      <ha-card>
        <p class="muted blurb">
          Nothing is configured yet. A group is a room, a floor, or the whole house: it mixes the stimuli you
          give it into one activity level, and groups can nest inside each other.
        </p>
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], 0)}>Add your first group</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderGroup(t, e, s, i, r, n) {
    const o = je(this.errors, s), l = this.live?.groups[e.id], a = l?.max_value ?? e.max_value ?? t.defaults.max_value, p = l ? Math.max(0, Math.min(100, l.value / (a || 1) * 100)) : 0;
    return c`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(u) => this.select(u, s)}
            @keydown=${zs}
          >
            ${e.name || e.id || "(unnamed group)"}
          </button>
          ${o ? c`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : d}
          ${l ? c`<div class="meter" title=${this.meterTitle(l, a, i === 0)}>
                  <div style="width: ${p}%"></div>
                </div>
                <span class="dot ${l.gated ? "gated" : ""}" title=${l.gated ? "Gate open" : "Gate closed"}></span>` : d}
        </div>
        <div slot="icons" class="row" @click=${ft}>
          <ha-icon-button label="Add stimulus" title="Add stimulus" @click=${() => this.addStimulus(s, e.stimuli.length)}>
            <ha-icon icon="mdi:plus"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Add child group"
            title="Add child group"
            @click=${() => this.addGroup([...s, "children"], e.children.length)}
          >
            <ha-icon icon="mdi:folder-plus"></ha-icon>
          </ha-icon-button>
          <ha-icon-button label="Move up" title="Move up" .disabled=${r === 0} @click=${() => this.move(s, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Move down"
            title="Move down"
            .disabled=${r === n - 1}
            @click=${() => this.move(s, 1)}
          >
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Delete group"
            title="Delete group"
            @click=${() => this.removeNode(s, `group "${e.name || e.id}" and everything in it`)}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="body">
          ${e.stimuli.map(
      (u, m) => this.renderStimulus(u, [...s, "stimuli", m], m, e.stimuli.length, e.id)
    )}
          ${e.stimuli.length === 0 ? c`<div class="muted empty">
                No stimuli yet — use the + button above to point this group at an entity.
              </div>` : d}
          <div class="children">
            ${e.children.map(
      (u, m) => this.renderGroup(t, u, [...s, "children", m], i + 1, m, e.children.length)
    )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(t, e, s, i, r) {
    const n = this.hass?.states[t.entity], o = n?.attributes.friendly_name ?? (t.entity || "(no entity)"), l = je(this.errors, e), a = this.live?.voices[r]?.find((p) => p.label === (t.key ?? t.entity));
    return c`
      <div
        class="row stimulus ${this.isSelected(e) ? "selected" : ""}"
        role="button"
        tabindex="0"
        @click=${(p) => this.select(p, e)}
        @keydown=${(p) => this.selectOnKey(p, e)}
      >
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="name grow" title=${t.entity}>${o}</span>
        ${l ? c`<span class="badge" title="${l} problem(s)">${l}</span>` : d}
        ${n ? c`<span class="muted chip">${n.state}</span>` : d}
        ${a ? c`<span class="chip phase ${a.phase}" title=${this.voiceTitle(a)}>${a.phase}</span>
              <span class="muted chip">${a.value.toFixed(2)}</span>` : d}
        <div class="row" @click=${ft}>
          <ha-icon-button label="Move up" title="Move up" .disabled=${s === 0} @click=${() => this.move(e, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Move down"
            title="Move down"
            .disabled=${s === i - 1}
            @click=${() => this.move(e, 1)}
          >
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </ha-icon-button>
          <ha-icon-button label="Delete stimulus" title="Delete stimulus" @click=${() => this.removeNode(e, `stimulus "${o}"`)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
  }
};
R.styles = [
  D,
  _`
      ha-expansion-panel {
        margin-bottom: 4px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
      }
      .stimulus {
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .selected {
        background: var(--secondary-background-color);
      }
      .link {
        background: none;
        border: none;
        margin: 0;
        padding: 0;
        font: inherit;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }
      .link:focus-visible,
      .stimulus:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .badge {
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.75em;
        line-height: 1.6;
      }
      .chip {
        white-space: nowrap;
      }
      .children {
        padding-left: 8px;
      }
      .body {
        padding: 0 8px 8px 8px;
      }
      ha-icon-button {
        --ha-icon-button-size: 32px;
        --mdc-icon-size: 18px;
      }
      .empty {
        padding: 4px;
      }
      .blurb {
        margin: 0 0 12px;
      }
    `
];
Q([
  h({ attribute: !1 })
], R.prototype, "hass", 2);
Q([
  h({ attribute: !1 })
], R.prototype, "config", 2);
Q([
  h({ attribute: !1 })
], R.prototype, "selection", 2);
Q([
  h({ attribute: !1 })
], R.prototype, "errors", 2);
Q([
  h({ attribute: !1 })
], R.prototype, "live", 2);
R = Q([
  w("al-tree")
], R);
const vt = (t) => t.split(",").map((e) => e.trim()).filter((e) => e.length > 0), se = (t) => (t ?? []).join(", "), xe = (t) => t == null || t === "" ? null : t;
function Gs(t, e) {
  if (e != null)
    switch (t) {
      case "duration":
        return U(e);
      case "boolean":
        return e ? "true" : "false";
      default:
        return e;
    }
}
function Bs(t, e) {
  if (e == null || e === "") return null;
  switch (t) {
    case "duration":
      return H(e);
    case "boolean":
      return e === !0 || e === "true";
    case "number": {
      const s = typeof e == "number" ? e : Number(e);
      return Number.isNaN(s) ? null : s;
    }
    default:
      return String(e);
  }
}
function Vs(t, e) {
  if (e == null) return "unset";
  switch (t) {
    case "duration":
      return E(e);
    case "boolean":
      return e ? "Yes" : "No";
    default:
      return String(e);
  }
}
var Ws = Object.defineProperty, Ks = Object.getOwnPropertyDescriptor, L = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ks(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ws(e, s, r), r;
};
const Ze = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
function qs(t, e) {
  return t.select?.options?.find((i) => i.value === e)?.label;
}
let A = class extends f {
  constructor() {
    super(...arguments), this.label = "", this.selector = { text: {} }, this.value = null, this.inherited = null, this.inheritedFrom = "defaults", this.kind = "number";
  }
  get overridden() {
    return this.value !== null && this.value !== void 0;
  }
  /**
   * Fired on this element only. Every parent binds `@value-changed` directly on the field,
   * and a bubbling copy would also reach the `ha-form` above it, which reads the payload as
   * one of its own fields changing.
   */
  emit(t) {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: t } }));
  }
  onValueChanged(t) {
    t.stopPropagation(), this.emit(Bs(this.kind, t.detail?.value));
  }
  onReset() {
    this.emit(null);
  }
  /**
   * The inherited value as the dropdown would spell it: a `select` stores enum ids like
   * `only_in_release`, and the helper should read the way the options do.
   */
  describeInherited() {
    const t = this.inherited;
    if (this.kind === "select" && t !== null && t !== void 0) {
      const e = qs(this.selector, String(t));
      if (e !== void 0) return e;
    }
    return Vs(this.kind, t);
  }
  /**
   * `ha-selector` defaults `required` to true, which makes a duration selector spell an
   * inherited (null) value as `00:00:00` and hides the clear affordance, so it is passed
   * explicitly: an override that is not set must read as empty.
   */
  render() {
    const t = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`;
    return c`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? Ze : this.selector}
          .label=${this.label}
          .required=${!1}
          .value=${Gs(this.kind, this.value)}
          .helper=${t}
          @value-changed=${this.onValueChanged}
        ></ha-selector>
        <ha-icon-button
          label="Reset to inherited"
          title="Reset to inherited"
          .disabled=${!this.overridden}
          @click=${this.onReset}
        >
          <ha-icon icon="mdi:backup-restore"></ha-icon>
        </ha-icon-button>
      </div>
      ${this.error ? c`<div class="muted error msg">${this.error}</div>` : d}
    `;
  }
};
A.styles = [
  D,
  _`
      :host {
        display: block;
        background: none;
        margin-bottom: 8px;
      }
      .field {
        flex: 1;
        min-width: 0;
      }
      .msg {
        margin-left: 4px;
      }
    `
];
L([
  h({ attribute: !1 })
], A.prototype, "hass", 2);
L([
  h()
], A.prototype, "label", 2);
L([
  h({ attribute: !1 })
], A.prototype, "selector", 2);
L([
  h({ attribute: !1 })
], A.prototype, "value", 2);
L([
  h({ attribute: !1 })
], A.prototype, "inherited", 2);
L([
  h({ attribute: "inherited-from" })
], A.prototype, "inheritedFrom", 2);
L([
  h()
], A.prototype, "kind", 2);
L([
  h()
], A.prototype, "error", 2);
A = L([
  w("al-override-field")
], A);
var Xs = Object.defineProperty, Ys = Object.getOwnPropertyDescriptor, de = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ys(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Xs(e, s, r), r;
};
const Js = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, Zs = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, Qs = ["id", "name", "area", "mix", "null_handling", "gain"], ei = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], ti = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], si = { number: { min: 0.1, step: 0.1, mode: "box" } }, ii = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, ri = (t, e) => [
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: ei } } },
  ...t.mix === "mean" ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: ti } } }] : [],
  ...e ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]
];
let G = class extends f {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.computeLabel = (t) => Js[t.name] ?? t.name, this.computeHelper = (t) => Zs[t.name] ?? "";
  }
  emitChange(t, e) {
    this.dispatchEvent(he(t, e));
  }
  emitSelect(t) {
    this.dispatchEvent(Ot(t));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const { config: e, path: s } = this;
    if (!e || !s) return;
    const i = ve(e, s);
    if (!i) return;
    const r = t.detail?.value ?? {}, n = {
      ...i,
      id: String(r.id ?? ""),
      name: xe(r.name),
      area: xe(r.area),
      mix: r.mix ?? i.mix,
      null_handling: r.null_handling ?? i.null_handling,
      gain: typeof r.gain == "number" ? r.gain : i.gain
    }, o = Qs.find((l) => n[l] !== i[l]);
    o !== void 0 && this.emitChange(z(e, s, n), `${v(s)}:${o}`);
  }
  setField(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(z(s, [...i, t], e), `${v(i)}:${t}`);
  }
  onDelete() {
    const { config: t, path: e } = this;
    if (!t || !e) return;
    const s = ve(t, e);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(Ye(t, e));
    const i = Je(e);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length === 0)
      return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = ve(t, e);
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = e.length === 2, r = Pe(this.errors, e), n = this.errors.filter((l) => l.path === v(e)), o = {
      id: s.id,
      name: s.name ?? "",
      mix: s.mix
    };
    return s.mix === "mean" && (o.null_handling = s.null_handling), s.area !== null && (o.area = s.area), i || (o.gain = s.gain), c`
      <ha-card header="Group">
        ${n.map((l) => c`<ha-alert alert-type="error">${l.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${ri(s, i)}
          .error=${r}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="muted note">Changing the id re-creates this group's entities.</div>

        <h3>Output</h3>
        <al-override-field
          .hass=${this.hass}
          label="Max value"
          kind="number"
          .selector=${si}
          .value=${s.max_value}
          .inherited=${t.defaults.max_value}
          .inheritedFrom=${"defaults"}
          .error=${r.max_value}
          @value-changed=${(l) => this.setField("max_value", l.detail.value)}
        ></al-override-field>
        <al-override-field
          .hass=${this.hass}
          label="Precision"
          kind="select"
          .selector=${ii}
          .value=${s.precision === null ? null : String(s.precision)}
          .inherited=${String(t.defaults.precision)}
          .inheritedFrom=${"defaults"}
          .error=${r.precision}
          @value-changed=${(l) => this.setField("precision", l.detail.value === null ? null : Number(l.detail.value))}
        ></al-override-field>

        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
};
G.styles = [
  D,
  _`
      h3 {
        margin: 16px 0 8px;
        font-size: 1em;
      }
      .note {
        margin: 4px 0 12px;
      }
      .danger {
        margin-top: 24px;
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
      }
    `
];
de([
  h({ attribute: !1 })
], G.prototype, "hass", 2);
de([
  h({ attribute: !1 })
], G.prototype, "config", 2);
de([
  h({ attribute: !1 })
], G.prototype, "path", 2);
de([
  h({ attribute: !1 })
], G.prototype, "errors", 2);
G = de([
  w("al-group-editor")
], G);
function Mt(t, e = 0.25) {
  if (t.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
  const s = t.attack + t.decay + t.release, i = s > 0 ? s * e / (1 - e) : 1, r = s + i;
  let n = 0;
  const o = [{ x: 0, y: 0 }];
  return n += t.attack, o.push({ x: n / r, y: 1 }), n += t.decay, o.push({ x: n / r, y: t.sustain }), n += i, o.push({ x: n / r, y: t.sustain }), n += t.release, o.push({ x: n / r, y: 0 }), o;
}
const ni = (t) => Math.round(t * 100) / 100;
function oi(t, e = 0.25) {
  const s = Mt(t, e), i = (n) => ((s[n]?.x ?? 0) + (s[n + 1]?.x ?? 0)) / 2;
  if (t.impulse) {
    const n = [{ text: "impulse", x: 0 }];
    return t.release > 0 && n.push({ text: `R ${E(t.release)}`, x: i(1) }), n;
  }
  const r = [];
  return t.attack > 0 && r.push({ text: `A ${E(t.attack)}`, x: i(0) }), t.decay > 0 && r.push({ text: `D ${E(t.decay)}`, x: i(1) }), r.push({ text: `S ${ni(t.sustain)}`, x: i(2) }), t.release > 0 && r.push({ text: `R ${E(t.release)}`, x: i(3) }), r;
}
var ai = Object.defineProperty, li = Object.getOwnPropertyDescriptor, Rt = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? li(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ai(e, s, r), r;
};
const le = 10, _e = 190, ci = 10, q = 58, hi = 72, ge = (t) => le + t * (_e - le), Ne = (t) => q - t * (q - ci), re = (t) => String(Math.round(t * 10) / 10), Ie = (t, e) => `${re(t)},${re(e)}`, di = (t) => Math.min(_e - 6, Math.max(le + 6, ge(t)));
let we = class extends f {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const t = this.envelope;
    if (!t) return d;
    const e = Mt(t), s = e[0], i = e[e.length - 1], r = e.map((a) => Ie(ge(a.x), Ne(a.y))).join(" "), n = `${Ie(ge(s.x), q)} ${r} ${Ie(ge(i.x), q)}`, o = oi(t), l = t.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${l}>
        <title>${l}</title>
        <line class="grid" x1=${le} y1=${q} x2=${_e} y2=${q}></line>
        ${t.impulse ? d : dt`<line
              class="grid"
              x1=${le}
              y1=${re(Ne(t.sustain))}
              x2=${_e}
              y2=${re(Ne(t.sustain))}
            ></line>`}
        <polygon class="area" points=${n}></polygon>
        <polyline class="curve" points=${r}></polyline>
        ${o.map(
      (a) => dt`<text class="caption" x=${re(di(a.x))} y=${hi} text-anchor="middle">${a.text}</text>`
    )}
      </svg>
    `;
  }
};
we.styles = [
  D,
  _`
      :host {
        display: block;
        background: none;
      }
      svg {
        width: 100%;
        max-width: 320px;
        height: auto;
        overflow: visible;
      }
      .curve {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 2;
        stroke-linejoin: round;
      }
      .area {
        fill: var(--primary-color);
        fill-opacity: 0.15;
        stroke: none;
      }
      .grid {
        stroke: var(--divider-color, currentColor);
        stroke-width: 1;
        stroke-dasharray: 3 3;
      }
      .caption {
        fill: var(--secondary-text-color);
        font-size: 9px;
      }
    `
];
Rt([
  h({ attribute: !1 })
], we.prototype, "envelope", 2);
we = Rt([
  w("al-envelope-sketch")
], we);
var ui = Object.defineProperty, pi = Object.getOwnPropertyDescriptor, V = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? pi(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ui(e, s, r), r;
};
const mi = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, fi = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, vi = ["entity", "gain", "key", "envelope"], me = { duration: { enable_millisecond: !0 } }, gi = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, bi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, $i = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, yi = "(unknown preset — using built-in defaults)", xi = [
  { name: "attack", label: "Attack", kind: "duration", selector: me },
  { name: "decay", label: "Decay", kind: "duration", selector: me },
  { name: "sustain", label: "Sustain", kind: "number", selector: gi },
  { name: "release", label: "Release", kind: "duration", selector: me },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: Ze },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: bi },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: $i },
  { name: "debounce", label: "Debounce", kind: "duration", selector: me }
];
let P = class extends f {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.toText = null, this.computeLabel = (t) => mi[t.name] ?? t.name, this.computeHelper = (t) => fi[t.name] ?? "";
  }
  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  willUpdate(t) {
    if (t.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !t.has("config")) return;
    const { config: e, path: s } = this, i = e && s ? De(e, s) : void 0;
    i && se(i.to) !== se(vt(this.toText)) && (this.toText = null);
  }
  emitChange(t, e) {
    this.dispatchEvent(he(t, e));
  }
  schemaFor(t) {
    const e = [
      { value: "", label: "(default preset)" },
      ...t.envelopes.map((s) => ({ value: s.id, label: s.id }))
    ];
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "to", selector: { text: {} } },
      { name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } },
      { name: "key", selector: { text: {} } },
      { name: "envelope", selector: { select: { mode: "dropdown", options: e } } }
    ];
  }
  onFormChanged(t) {
    t.stopPropagation();
    const { config: e, path: s } = this;
    if (!e || !s) return;
    const i = De(e, s);
    if (!i) return;
    const r = t.detail?.value ?? {}, n = String(r.to ?? "");
    this.toText = n;
    const o = {
      ...i,
      entity: String(r.entity ?? ""),
      to: vt(n),
      gain: typeof r.gain == "number" ? r.gain : i.gain,
      key: xe(r.key),
      envelope: xe(r.envelope)
    }, l = se(o.to) !== se(i.to) ? "to" : vi.find((a) => o[a] !== i[a]);
    l !== void 0 && this.emitChange(z(e, s, o), `${v(s)}:${l}`);
  }
  setOverride(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(z(s, [...i, t], e), `${v(i)}:${t}`);
  }
  /**
   * How long this voice stays in its current phase, measured against the payload's own
   * `now` so a browser clock that disagrees with the server does not skew the countdown.
   */
  countdown(t) {
    const e = this.live?.now;
    return t === null || e === void 0 ? null : E(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
  }
  /** Where the effective value comes from when the stimulus does not override it. */
  sourceOf(t, e, s) {
    const i = Tt(t, e.envelope);
    return i ? i[s] === null || i[s] === void 0 ? "defaults" : e.envelope ?? t.defaults.envelope : yi;
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length < 3)
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = De(t, e);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = ve(t, Je(e)), r = Pe(this.errors, e), n = this.errors.filter((u) => u.path === v(e)), o = Hs(t, s), l = {
      entity: s.entity,
      to: this.toText ?? se(s.to),
      gain: s.gain,
      key: s.key ?? "",
      envelope: s.envelope ?? ""
    }, a = this.live?.voices[i?.id ?? ""]?.find(
      (u) => u.label === (s.key ?? s.entity)
    ), p = this.countdown(a?.phase_ends ?? null);
    return c`
      <ha-card header="Stimulus">
        ${n.map((u) => c`<ha-alert alert-type="error">${u.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${l}
          .schema=${this.schemaFor(t)}
          .error=${r}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${a ? c`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip phase ${a.phase}">${a.phase}</span>
              <span class="chip">${a.value.toFixed(2)}</span>
              ${p !== null ? c`<span class="muted chip">ends in ${p}</span>` : d}
              <span class="dot ${a.gate ? "gated" : ""}" title=${a.gate ? "Gate open" : "Gate closed"}></span>
            </div>` : d}

        <h3>Envelope overrides</h3>
        ${xi.map(
      (u) => c`<al-override-field
            .hass=${this.hass}
            .label=${u.label}
            .kind=${u.kind}
            .selector=${u.selector}
            .value=${s[u.name]}
            .inherited=${o[u.name]}
            .inheritedFrom=${this.sourceOf(t, s, u.name)}
            .error=${r[u.name]}
            @value-changed=${(m) => this.setOverride(u.name, m.detail.value)}
          ></al-override-field>`
    )}
        <h3>Envelope shape</h3>
        <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
      </ha-card>
    `;
  }
};
P.styles = [
  D,
  _`
      h3 {
        margin: 16px 0 8px;
        font-size: 1em;
      }
      .live {
        margin-top: 8px;
      }
      .chip {
        white-space: nowrap;
      }
    `
];
V([
  h({ attribute: !1 })
], P.prototype, "hass", 2);
V([
  h({ attribute: !1 })
], P.prototype, "config", 2);
V([
  h({ attribute: !1 })
], P.prototype, "path", 2);
V([
  h({ attribute: !1 })
], P.prototype, "errors", 2);
V([
  h({ attribute: !1 })
], P.prototype, "live", 2);
V([
  b()
], P.prototype, "toText", 2);
P = V([
  w("al-stimulus-editor")
], P);
var _i = Object.defineProperty, wi = Object.getOwnPropertyDescriptor, W = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? wi(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && _i(e, s, r), r;
};
const Ei = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, Ai = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the sustain level back to zero.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, Si = ["id", "attack", "decay", "sustain", "release", "impulse"], be = { duration: { enable_millisecond: !0 } }, ki = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Ci = { boolean: {} }, Pi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Oi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Li = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: be },
  { name: "decay", selector: be },
  { name: "sustain", selector: ki },
  { name: "release", selector: be },
  { name: "impulse", selector: Ci }
], Ti = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Pi },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Oi },
  { name: "debounce", label: "Debounce", kind: "duration", selector: be }
];
let O = class extends f {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (t) => Ei[t.name] ?? t.name, this.computeHelper = (t) => Ai[t.name] ?? "";
  }
  /**
   * Keeps the selection pointing at a preset that still exists after an edit elsewhere, and
   * drops the delete warning: the references it names were counted against the old config.
   */
  willUpdate(t) {
    if (!t.has("config")) return;
    this.blocked = null;
    const e = this.config?.envelopes.length ?? 0;
    this.selected >= e && (this.selected = Math.max(0, e - 1));
  }
  emitChange(t, e) {
    this.dispatchEvent(he(t, e));
  }
  selectPreset(t) {
    this.selected = t, this.blocked = null;
  }
  addPreset() {
    const t = this.config;
    if (!t) return;
    this.blocked = null;
    const e = t.envelopes.length;
    this.emitChange(Fe(t, ["envelopes"], e, Ps(Ds(t, "preset")))), this.selected = e;
  }
  removePreset(t) {
    const e = this.config;
    if (!e) return;
    const s = e.envelopes[t];
    if (!s) return;
    const i = Ns(e, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = t, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(Ye(e, ["envelopes", t])), this.selected >= t && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const e = this.config, s = this.selected, i = e?.envelopes[s];
    if (!e || !i) return;
    const r = t.detail?.value ?? {}, n = {
      ...i,
      id: String(r.id ?? ""),
      attack: H(r.attack) ?? i.attack,
      decay: H(r.decay) ?? i.decay,
      sustain: typeof r.sustain == "number" ? r.sustain : i.sustain,
      release: H(r.release) ?? i.release,
      impulse: typeof r.impulse == "boolean" ? r.impulse : i.impulse
    }, o = Si.find((p) => n[p] !== i[p]);
    if (o === void 0) return;
    const l = ["envelopes", s], a = z(Is(e, s, n.id), l, n);
    this.emitChange(a, `${v(l)}:${o}`);
  }
  setOverride(t, e) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const r = ["envelopes", i, t];
    this.emitChange(z(s, r, e), v(r));
  }
  render() {
    const t = this.config;
    return t ? c`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(t)}</div>
        <div>${this.renderEditor(t)}</div>
      </div>
    ` : c`<ha-card><span class="muted">Loading…</span></ha-card>`;
  }
  renderList(t) {
    const e = this.blocked;
    return c`
      <ha-card>
        <h3>Presets</h3>
        ${t.envelopes.map((s, i) => {
      const r = je(this.errors, ["envelopes", i]);
      return c`<div class="row preset ${this.selected === i ? "selected" : ""}">
            <button type="button" class="link grow" title="Edit this preset" @click=${() => this.selectPreset(i)}>
              ${s.id || "(unnamed preset)"}
            </button>
            ${r ? c`<span class="badge" title="${r} problem(s)">${r}</span>` : d}
            <ha-icon-button label="Delete preset" title="Delete preset" @click=${() => this.removePreset(i)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>`;
    })}
        ${t.envelopes.length === 0 ? c`<p class="muted">No presets yet.</p>` : d}
        ${e ? c`<ha-alert alert-type="warning">${Ri(e)}</ha-alert>` : d}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(t) {
    const e = this.selected, s = t.envelopes[e];
    if (!s) return c`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", e], r = Pe(this.errors, i), n = this.errors.filter((a) => a.path === v(i)), o = {
      id: s.id,
      attack: U(s.attack),
      decay: U(s.decay),
      sustain: s.sustain,
      release: U(s.release),
      impulse: s.impulse
    }, l = Mi(t, e, s);
    return c`
      <ha-card header="Envelope preset">
        ${n.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        ${l ? c`<ha-alert alert-type="warning">${l}</ha-alert>` : d}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Li}
          .error=${r}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Ti.map(
      (a) => c`<al-override-field
            .hass=${this.hass}
            .label=${a.label}
            .kind=${a.kind}
            .selector=${a.kind === "boolean" ? Ze : a.selector}
            .value=${s[a.name]}
            .inherited=${t.defaults[a.name]}
            .inheritedFrom=${"defaults"}
            .error=${r[a.name]}
            @value-changed=${(p) => this.setOverride(a.name, p.detail.value)}
          ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
O.styles = [
  D,
  _`
      h3 {
        margin: 16px 0 8px;
        font-size: 1em;
      }
      .preset {
        padding: 4px;
        border-radius: 4px;
      }
      .preset.selected {
        background: var(--secondary-background-color);
      }
      .link {
        background: none;
        border: none;
        margin: 0;
        padding: 0;
        font: inherit;
        color: inherit;
        text-align: left;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .link:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .badge {
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.75em;
        line-height: 1.6;
      }
      ha-icon-button {
        --ha-icon-button-size: 32px;
        --mdc-icon-size: 18px;
      }
      .sketch {
        margin-top: 8px;
      }
    `
];
W([
  h({ attribute: !1 })
], O.prototype, "hass", 2);
W([
  h({ attribute: !1 })
], O.prototype, "config", 2);
W([
  h({ attribute: !1 })
], O.prototype, "errors", 2);
W([
  h({ type: Boolean })
], O.prototype, "narrow", 2);
W([
  b()
], O.prototype, "selected", 2);
W([
  b()
], O.prototype, "blocked", 2);
O = W([
  w("al-envelopes")
], O);
function Mi(t, e, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : t.envelopes.some((i, r) => r !== e && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Ri(t) {
  const e = [];
  return t.defaults && e.push("the defaults"), t.groups.length > 0 && e.push(`group${t.groups.length > 1 ? "s" : ""} ${t.groups.join(", ")}`), `"${t.id}" is still used by ${e.join(" and ")}. Point those at another preset first.`;
}
var Di = Object.defineProperty, Ni = Object.getOwnPropertyDescriptor, Oe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ni(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Di(e, s, r), r;
};
const Ii = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, Ui = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Whether a note already sounding can be retriggered, or only one in its release.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, Hi = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], Ue = { duration: { enable_millisecond: !0 } }, Fi = { number: { min: 0.1, step: 0.1, mode: "box" } }, ji = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, zi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Gi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
};
let Y = class extends f {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (t) => Ii[t.name] ?? t.name, this.computeHelper = (t) => Ui[t.name] ?? "";
  }
  schemaFor(t) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: t.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: Fi },
      { name: "precision", selector: ji },
      { name: "unavailable", selector: Gi },
      { name: "retrigger", selector: zi },
      { name: "debounce", selector: Ue },
      { name: "safety_refresh", selector: Ue },
      { name: "min_wake_interval", selector: Ue }
    ];
  }
  onFormChanged(t) {
    t.stopPropagation();
    const e = this.config;
    if (!e) return;
    const s = e.defaults, i = t.detail?.value ?? {}, r = Number(i.precision), n = {
      envelope: typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : s.envelope,
      max_value: typeof i.max_value == "number" ? i.max_value : s.max_value,
      precision: Number.isFinite(r) ? r : s.precision,
      unavailable: i.unavailable ?? s.unavailable,
      retrigger: i.retrigger ?? s.retrigger,
      debounce: H(i.debounce) ?? s.debounce,
      safety_refresh: H(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: H(i.min_wake_interval) ?? s.min_wake_interval
    }, o = Hi.find((l) => n[l] !== s[l]);
    o !== void 0 && this.emitChange(z(e, ["defaults"], n), `defaults:${o}`);
  }
  emitChange(t, e) {
    this.dispatchEvent(he(t, e));
  }
  render() {
    const t = this.config;
    if (!t) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const e = t.defaults, s = Pe(this.errors, ["defaults"]), i = this.errors.filter((n) => n.path === "defaults"), r = {
      envelope: e.envelope,
      max_value: e.max_value,
      precision: String(e.precision),
      unavailable: e.unavailable,
      retrigger: e.retrigger,
      debounce: U(e.debounce),
      safety_refresh: U(e.safety_refresh),
      min_wake_interval: U(e.min_wake_interval)
    };
    return c`
      <div class="pad">
        <ha-card header="Defaults">
          ${i.map((n) => c`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
          <ha-form
            .hass=${this.hass}
            .data=${r}
            .schema=${this.schemaFor(t)}
            .error=${s}
            .computeLabel=${this.computeLabel}
            .computeHelper=${this.computeHelper}
            @value-changed=${this.onFormChanged}
          ></ha-form>
          <div class="muted note">
            Groups, presets and stimuli inherit these unless they set their own value.
          </div>
        </ha-card>
      </div>
    `;
  }
};
Y.styles = [
  D,
  _`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
Oe([
  h({ attribute: !1 })
], Y.prototype, "hass", 2);
Oe([
  h({ attribute: !1 })
], Y.prototype, "config", 2);
Oe([
  h({ attribute: !1 })
], Y.prototype, "errors", 2);
Y = Oe([
  w("al-defaults")
], Y);
const Ee = 0.1, Ae = 10, Qe = Math.log10(Ee), Bi = Math.log10(Ae), Dt = Bi - Qe, Le = (t) => Math.min(Ae, Math.max(Ee, t)), et = (t) => Math.round(t * 100) / 100, gt = (t) => et(Le(t));
function Vi(t) {
  return (Math.log10(Le(t)) - Qe) / Dt;
}
function Wi(t) {
  const e = Math.min(1, Math.max(0, t));
  return et(Le(Math.pow(10, Qe + e * Dt)));
}
function He(t, e, s = !1) {
  const i = s ? 1.05 : 1.25;
  return et(Le(e === 1 ? t * i : t / i));
}
function bt(t) {
  let e = t.toFixed(2).replace(/0+$/, "");
  return e.endsWith(".") && (e += "0"), e;
}
var Ki = Object.defineProperty, qi = Object.getOwnPropertyDescriptor, ue = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? qi(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Ki(e, s, r), r;
};
const ze = 12, $t = (t) => `${Math.round(t * 1e3) / 10}%`;
let B = class extends f {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.label = "Gain", this.dragValue = null, this.dragging = !1, this.onWheel = (t) => {
      this.disabled || t.deltaY === 0 || (t.preventDefault(), this.commit(He(this.current, t.deltaY < 0 ? 1 : -1, t.shiftKey)));
    };
  }
  /** What the fader is showing: the drag if there is one, otherwise what the host gave it. */
  get current() {
    return this.dragValue ?? this.value;
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("wheel", this.onWheel, { passive: !1 });
  }
  disconnectedCallback() {
    this.removeEventListener("wheel", this.onWheel), super.disconnectedCallback();
  }
  emit(t, e) {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: t, live: e } }));
  }
  /** A value the host should keep: ends any drag and reports it as settled. */
  commit(t) {
    this.dragging = !1, this.dragValue = null, this.emit(t, !1);
  }
  onKeyDown(t) {
    if (this.disabled) return;
    const e = this.current;
    let s;
    switch (t.key) {
      case "ArrowUp":
      case "ArrowRight":
        s = He(e, 1, t.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        s = He(e, -1, t.shiftKey);
        break;
      case "Home":
        s = Ee;
        break;
      case "End":
        s = Ae;
        break;
      case "PageUp":
        s = gt(e * 2);
        break;
      case "PageDown":
        s = gt(e / 2);
        break;
      default:
        return;
    }
    t.preventDefault(), t.stopPropagation(), this.commit(s);
  }
  onDoubleClick() {
    this.disabled || this.commit(1);
  }
  /** Maps a pointer's y onto the track: its top is full gain, its bottom is silence. */
  moveTo(t, e) {
    const s = e.getBoundingClientRect();
    if (s.height <= 0) return;
    const i = Wi(1 - (t.clientY - s.top) / s.height);
    i !== this.dragValue && (this.dragValue = i, this.emit(i, !0));
  }
  onPointerDown(t) {
    if (this.disabled) return;
    const e = t.currentTarget;
    t.preventDefault(), this.dragging = !0;
    try {
      e.setPointerCapture(t.pointerId);
    } catch {
    }
    this.moveTo(t, e);
  }
  onPointerMove(t) {
    this.dragging && this.moveTo(t, t.currentTarget);
  }
  onPointerUp(t) {
    if (this.dragging) {
      try {
        t.currentTarget.releasePointerCapture(t.pointerId);
      } catch {
      }
      this.commit(this.current);
    }
  }
  render() {
    const t = this.current, e = Vi(t);
    return c`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${Ee}
        aria-valuemax=${Ae}
        aria-valuenow=${t}
        aria-valuetext=${bt(t)}
        aria-disabled=${this.disabled ? "true" : "false"}
        @keydown=${this.onKeyDown}
        @dblclick=${this.onDoubleClick}
      >
        <div
          class="track"
          @pointerdown=${this.onPointerDown}
          @pointermove=${this.onPointerMove}
          @pointerup=${this.onPointerUp}
          @pointercancel=${this.onPointerUp}
        >
          <div class="unity"></div>
          <div class="fill" style="height: ${$t(e)}"></div>
          <div class="knob" style="bottom: calc(${$t(e)} - ${Math.round((e - 0.5) * ze * 10) / 10}px - ${ze / 2}px)"></div>
        </div>
        <div class="value">${bt(t)}</div>
      </div>
    `;
  }
};
B.styles = _`
    :host {
      display: block;
    }
    .fader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      outline: none;
    }
    .fader:focus-visible .track {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
    .track {
      position: relative;
      width: 18px;
      height: 120px;
      border-radius: 9px;
      background: var(--divider-color, #e0e0e0);
      cursor: ns-resize;
      touch-action: none;
    }
    .fill {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 9px;
      background: var(--primary-color);
      opacity: 0.35;
    }
    .knob {
      position: absolute;
      left: -3px;
      right: -3px;
      height: ${ze}px;
      border-radius: 3px;
      background: var(--primary-color);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    .unity {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 50%;
      border-top: 1px dashed var(--secondary-text-color);
      opacity: 0.5;
    }
    .value {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }
    :host([disabled]) .track {
      cursor: default;
      opacity: 0.5;
    }
  `;
ue([
  h({ type: Number })
], B.prototype, "value", 2);
ue([
  h({ type: Boolean, reflect: !0 })
], B.prototype, "disabled", 2);
ue([
  h({ type: String })
], B.prototype, "label", 2);
ue([
  b()
], B.prototype, "dragValue", 2);
B = ue([
  w("al-fader")
], B);
const Xi = { ATTRIBUTE: 1 }, Yi = (t) => (...e) => ({ _$litDirective$: t, values: e });
class Ji {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, s, i) {
    this._$Ct = e, this._$AM = s, this._$Ci = i;
  }
  _$AS(e, s) {
    return this.update(e, s);
  }
  update(e, s) {
    return this.render(...s);
  }
}
const yt = Yi(class extends Ji {
  constructor(t) {
    if (super(t), t.type !== Xi.ATTRIBUTE || t.name !== "class" || t.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t) {
    return " " + Object.keys(t).filter((e) => t[e]).join(" ") + " ";
  }
  update(t, [e]) {
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), t.strings !== void 0 && (this.nt = new Set(t.strings.join(" ").split(/\s/).filter((i) => i !== "")));
      for (const i in e) e[i] && !this.nt?.has(i) && this.st.add(i);
      return this.render(e);
    }
    const s = t.element.classList;
    for (const i of this.st) i in e || (s.remove(i), this.st.delete(i));
    for (const i in e) {
      const r = !!e[i];
      r === this.st.has(i) || this.nt?.has(i) || (r ? (s.add(i), this.st.add(i)) : (s.remove(i), this.st.delete(i)));
    }
    return j;
  }
});
var Zi = Object.defineProperty, Qi = Object.getOwnPropertyDescriptor, Te = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Qi(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Zi(e, s, r), r;
};
const er = (t) => `${Math.round(t * 1e3) / 10}%`;
let J = class extends f {
  constructor() {
    super(...arguments), this.value = 0, this.max = 1, this.gated = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("aria-hidden", "true");
  }
  /** 0..1. A ceiling of zero reads as empty rather than as a division by it. */
  get ratio() {
    return this.max > 0 ? Math.min(1, Math.max(0, this.value / this.max)) : 0;
  }
  render() {
    const t = this.ratio;
    return c`
      <div class="meter">
        <div class=${yt({ fill: !0, hot: t > 0.9 })} style="width: ${er(t)}"></div>
      </div>
      <div class=${yt({ dot: !0, gated: this.gated })}></div>
    `;
  }
};
J.styles = _`
    :host {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .meter {
      flex: 1;
      height: 6px;
      min-width: 0;
      border-radius: 3px;
      background: var(--divider-color, #e0e0e0);
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 120ms linear;
    }
    .fill.hot {
      background: var(--warning-color, #ffbe50);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--disabled-text-color, #9e9e9e);
      flex-shrink: 0;
    }
    .dot.gated {
      background: var(--primary-color);
    }
  `;
Te([
  h({ type: Number })
], J.prototype, "value", 2);
Te([
  h({ type: Number })
], J.prototype, "max", 2);
Te([
  h({ type: Boolean })
], J.prototype, "gated", 2);
J = Te([
  w("al-meter")
], J);
var tr = Object.defineProperty, sr = Object.getOwnPropertyDescriptor, S = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? sr(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && tr(e, s, r), r;
};
const ir = (t) => String(Math.round(t * 100) / 100);
function xt(t) {
  return t.impulse ? `impulse · R ${E(t.release)}` : `A ${E(t.attack)} · D ${E(t.decay)} · S ${ir(t.sustain)} · R ${E(t.release)}`;
}
let y = class extends f {
  constructor() {
    super(...arguments), this.kind = "channel", this.label = "", this.sublabel = null, this.envelope = null, this.gain = 1, this.live = null, this.selected = !1, this.errors = 0, this.entityIcon = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.hasAttribute("tabindex") || (this.tabIndex = -1);
  }
  select() {
    this.dispatchEvent(_s());
  }
  /** Drilling into a bus is its own intent: it must not also read as selecting the strip. */
  open(t) {
    t.stopPropagation(), this.dispatchEvent(ws());
  }
  onGain(t) {
    t.stopPropagation(), this.dispatchEvent(Es(t.detail));
  }
  render() {
    const t = this.envelope;
    return c`
      <div class="strip" @click=${this.select}>
        <div class="head">
          ${this.entityIcon ? c`<ha-icon class="icon" .icon=${this.entityIcon}></ha-icon>` : c`<span class="icon">${this.kind === "bus" ? "▤" : "⚡"}</span>`}
          <button class="link name" title=${this.label}>${this.label}</button>
        </div>
        <div class="sub" title=${this.sublabel ?? ""}>${this.sublabel ?? ""}</div>
        ${t ? c`<al-envelope-sketch .envelope=${t}></al-envelope-sketch>` : d}
        <div class="adsr" title=${t ? xt(t) : ""}>${t ? xt(t) : ""}</div>
        <al-fader .value=${this.gain} label=${`${this.label} gain`} @value-changed=${this.onGain}></al-fader>
        ${this.live ? c`<al-meter .value=${this.live.value} .max=${this.live.max} .gated=${this.live.gated}></al-meter>` : d}
        <div class="foot">
          ${this.errors > 0 ? c`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : d}
          ${this.kind === "bus" ? c`<button class="link open" @click=${this.open}>open ▸</button>` : d}
        </div>
      </div>
    `;
  }
};
y.styles = _`
    :host {
      display: block;
      width: 96px;
      flex: 0 0 auto;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 6px;
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
      cursor: pointer;
      outline: none;
    }
    :host([narrow]) {
      width: 72px;
    }
    :host([kind="bus"]) {
      border-style: double;
      border-width: 4px;
    }
    :host([selected]),
    :host(:focus-visible) {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    .strip {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      min-width: 0;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .link {
      background: none;
      border: none;
      margin: 0;
      padding: 0;
      font: inherit;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }
    .link:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    .name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }
    .sub,
    .adsr {
      color: var(--secondary-text-color);
      font-size: 0.7em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    al-fader {
      align-self: center;
    }
    .foot {
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 20px;
    }
    .badge {
      background: var(--error-color, #db4437);
      color: var(--text-primary-color, #fff);
      border-radius: 10px;
      padding: 0 6px;
      font-size: 0.7em;
      line-height: 1.6;
    }
    .open {
      margin-left: auto;
      color: var(--primary-color);
      font-size: 0.75em;
    }
    .icon {
      font-size: 0.8em;
    }
  `;
S([
  h({ type: String, reflect: !0 })
], y.prototype, "kind", 2);
S([
  h({ type: String })
], y.prototype, "label", 2);
S([
  h({ type: String })
], y.prototype, "sublabel", 2);
S([
  h({ attribute: !1 })
], y.prototype, "envelope", 2);
S([
  h({ type: Number })
], y.prototype, "gain", 2);
S([
  h({ attribute: !1 })
], y.prototype, "live", 2);
S([
  h({ type: Boolean, reflect: !0 })
], y.prototype, "selected", 2);
S([
  h({ type: Number })
], y.prototype, "errors", 2);
S([
  h({ type: String })
], y.prototype, "entityIcon", 2);
y = S([
  w("al-strip")
], y);
var rr = Object.defineProperty, nr = Object.getOwnPropertyDescriptor, k = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? nr(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && rr(e, s, r), r;
};
const or = ["sum", "max", "mean"], _t = 0.1;
let x = class extends f {
  constructor() {
    super(...arguments), this.label = "", this.mix = "sum", this.maxValue = 5, this.precision = 1, this.live = null, this.lights = 0, this.simEntityId = null, this.simOn = !1, this.blockedReason = null;
  }
  onMix(t) {
    this.dispatchEvent(As(t.target.value));
  }
  /**
   * `min` on a number input is advice to the browser, not a guarantee to us: it does not stop
   * a typed or pasted `0`, and `.value` reads back whatever is in the box. So the floor is
   * enforced here, and a rejected entry — empty, unreadable, or below the floor — puts the
   * committed ceiling back in the box rather than leaving a value we refused on screen.
   */
  onLimiter(t) {
    const e = t.target, s = e.value.trim(), i = Number(s);
    if (s === "" || !Number.isFinite(i) || i < _t) {
      e.value = String(this.maxValue);
      return;
    }
    this.dispatchEvent(Ss(i));
  }
  onSim(t) {
    this.dispatchEvent(ks(t.target.checked === !0));
  }
  render() {
    const t = this.blockedReason;
    return c`
      <div class="strip">
        <div class="name" title=${this.label}>${this.label}</div>
        <div class="muted">master</div>
        <div>
          <label for="mix">mix</label>
          <select id="mix" class="mix" .value=${this.mix} @change=${this.onMix}>
            ${or.map((e) => c`<option value=${e} ?selected=${e === this.mix}>${e}</option>`)}
          </select>
        </div>
        <div>
          <label for="limiter">limiter</label>
          <input
            id="limiter"
            class="limiter"
            type="number"
            min=${_t}
            step="0.1"
            .value=${String(this.maxValue)}
            @change=${this.onLimiter}
          />
        </div>
        <div class="muted">${this.precision} dp · ${this.lights} light${this.lights === 1 ? "" : "s"}</div>
        ${this.lights > 0 ? c`<div class="sim">
              <ha-switch
                .checked=${this.simOn}
                .disabled=${this.simEntityId === null}
                title=${t ?? (this.simEntityId === null ? "No simulation switch for this group" : "Presence simulation")}
                @change=${this.onSim}
              ></ha-switch>
              <span class="muted">⏻</span>
            </div>` : d}
        ${this.live ? c`<al-meter .value=${this.live.value} .max=${this.live.max} .gated=${this.live.gated}></al-meter>` : d}
      </div>
    `;
  }
};
x.styles = _`
    :host {
      display: block;
      width: 96px;
      flex: 0 0 auto;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 6px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    :host([narrow]) {
      width: 72px;
    }
    .strip {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    .name {
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 600;
      font-size: 0.8em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    label {
      display: block;
      color: var(--secondary-text-color);
      font-size: 0.7em;
    }
    select,
    input {
      width: 100%;
      box-sizing: border-box;
      font: inherit;
      font-size: 0.8em;
      color: var(--primary-text-color);
      background: var(--card-background-color, var(--primary-background-color));
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      padding: 2px 4px;
    }
    select:focus-visible,
    input:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -1px;
    }
    .sim {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .muted {
      color: var(--secondary-text-color);
      font-size: 0.7em;
    }
  `;
k([
  h({ type: String })
], x.prototype, "label", 2);
k([
  h({ type: String })
], x.prototype, "mix", 2);
k([
  h({ type: Number })
], x.prototype, "maxValue", 2);
k([
  h({ type: Number })
], x.prototype, "precision", 2);
k([
  h({ attribute: !1 })
], x.prototype, "live", 2);
k([
  h({ type: Number })
], x.prototype, "lights", 2);
k([
  h({ type: String })
], x.prototype, "simEntityId", 2);
k([
  h({ type: Boolean })
], x.prototype, "simOn", 2);
k([
  h({ type: String })
], x.prototype, "blockedReason", 2);
x = k([
  w("al-master-strip")
], x);
