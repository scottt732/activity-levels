<<<<<<< HEAD
const rt = globalThis, ts = rt.ShadowRoot && (rt.ShadyCSS === void 0 || rt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ss = /* @__PURE__ */ Symbol(), ks = /* @__PURE__ */ new WeakMap();
let Sr = class {
  constructor(t, s, r) {
    if (this._$cssResult$ = !0, r !== ss) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
||||||| 8cdb3c5
const tt = globalThis, Zt = tt.ShadowRoot && (tt.ShadyCSS === void 0 || tt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Qt = /* @__PURE__ */ Symbol(), ys = /* @__PURE__ */ new WeakMap();
let mi = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Qt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
=======
const tt = globalThis, Jt = tt.ShadowRoot && (tt.ShadyCSS === void 0 || tt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Zt = /* @__PURE__ */ Symbol(), ys = /* @__PURE__ */ new WeakMap();
let $i = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Zt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
>>>>>>> origin/main
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
<<<<<<< HEAD
    if (ts && t === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (t = ks.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && ks.set(s, t));
||||||| 8cdb3c5
    if (Zt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = ys.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && ys.set(s, t));
=======
    if (Jt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = ys.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && ys.set(s, t));
>>>>>>> origin/main
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
<<<<<<< HEAD
const Oi = (e) => new Sr(typeof e == "string" ? e : e + "", void 0, ss), S = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((r, i, n) => r + ((o) => {
||||||| 8cdb3c5
const pr = (e) => new mi(typeof e == "string" ? e : e + "", void 0, Qt), A = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, r, n) => i + ((o) => {
=======
const vr = (e) => new $i(typeof e == "string" ? e : e + "", void 0, Zt), A = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, r, n) => i + ((o) => {
>>>>>>> origin/main
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
<<<<<<< HEAD
  })(i) + e[n + 1], e[0]);
  return new Sr(s, e, ss);
}, Pi = (e, t) => {
  if (ts) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
||||||| 8cdb3c5
  })(r) + e[n + 1], e[0]);
  return new mi(s, e, Qt);
}, fr = (e, t) => {
  if (Zt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
=======
  })(r) + e[n + 1], e[0]);
  return new $i(s, e, Zt);
}, br = (e, t) => {
  if (Jt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
>>>>>>> origin/main
  else for (const s of t) {
    const r = document.createElement("style"), i = rt.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, e.appendChild(r);
  }
<<<<<<< HEAD
}, Es = ts ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
||||||| 8cdb3c5
}, xs = Zt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
=======
}, xs = Jt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
>>>>>>> origin/main
  let s = "";
<<<<<<< HEAD
  for (const r of t.cssRules) s += r.cssText;
  return Oi(s);
||||||| 8cdb3c5
  for (const i of t.cssRules) s += i.cssText;
  return pr(s);
=======
  for (const i of t.cssRules) s += i.cssText;
  return vr(s);
>>>>>>> origin/main
})(e) : e;
<<<<<<< HEAD
const { is: Ci, defineProperty: Ti, getOwnPropertyDescriptor: Li, getOwnPropertyNames: Di, getOwnPropertySymbols: Ni, getPrototypeOf: Ri } = Object, vt = globalThis, Ss = vt.trustedTypes, Mi = Ss ? Ss.emptyScript : "", Ii = vt.reactiveElementPolyfillSupport, Ue = (e, t) => e, nt = { toAttribute(e, t) {
||||||| 8cdb3c5
const { is: gr, defineProperty: mr, getOwnPropertyDescriptor: vr, getOwnPropertyNames: br, getOwnPropertySymbols: $r, getPrototypeOf: yr } = Object, gt = globalThis, ws = gt.trustedTypes, xr = ws ? ws.emptyScript : "", wr = gt.reactiveElementPolyfillSupport, Fe = (e, t) => e, it = { toAttribute(e, t) {
=======
const { is: $r, defineProperty: yr, getOwnPropertyDescriptor: xr, getOwnPropertyNames: wr, getOwnPropertySymbols: _r, getPrototypeOf: kr } = Object, gt = globalThis, ws = gt.trustedTypes, Sr = ws ? ws.emptyScript : "", Er = gt.reactiveElementPolyfillSupport, He = (e, t) => e, it = { toAttribute(e, t) {
>>>>>>> origin/main
  switch (t) {
    case Boolean:
<<<<<<< HEAD
      e = e ? Mi : null;
||||||| 8cdb3c5
      e = e ? xr : null;
=======
      e = e ? Sr : null;
>>>>>>> origin/main
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
<<<<<<< HEAD
} }, rs = (e, t) => !Ci(e, t), As = { attribute: !0, type: String, converter: nt, reflect: !1, useDefault: !1, hasChanged: rs };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), vt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Ae = class extends HTMLElement {
||||||| 8cdb3c5
} }, es = (e, t) => !gr(e, t), _s = { attribute: !0, type: String, converter: it, reflect: !1, useDefault: !1, hasChanged: es };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), gt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ke = class extends HTMLElement {
=======
} }, Qt = (e, t) => !$r(e, t), _s = { attribute: !0, type: String, converter: it, reflect: !1, useDefault: !1, hasChanged: Qt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), gt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Se = class extends HTMLElement {
>>>>>>> origin/main
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = As) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
<<<<<<< HEAD
      const r = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, r, s);
      i !== void 0 && Ti(this.prototype, t, i);
||||||| 8cdb3c5
      const i = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(t, i, s);
      r !== void 0 && mr(this.prototype, t, r);
=======
      const i = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(t, i, s);
      r !== void 0 && yr(this.prototype, t, r);
>>>>>>> origin/main
    }
  }
<<<<<<< HEAD
  static getPropertyDescriptor(t, s, r) {
    const { get: i, set: n } = Li(this.prototype, t) ?? { get() {
||||||| 8cdb3c5
  static getPropertyDescriptor(t, s, i) {
    const { get: r, set: n } = vr(this.prototype, t) ?? { get() {
=======
  static getPropertyDescriptor(t, s, i) {
    const { get: r, set: n } = xr(this.prototype, t) ?? { get() {
>>>>>>> origin/main
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: i, set(o) {
      const a = i?.call(this);
      n?.call(this, o), this.requestUpdate(t, a, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? As;
  }
  static _$Ei() {
<<<<<<< HEAD
    if (this.hasOwnProperty(Ue("elementProperties"))) return;
    const t = Ri(this);
||||||| 8cdb3c5
    if (this.hasOwnProperty(Fe("elementProperties"))) return;
    const t = yr(this);
=======
    if (this.hasOwnProperty(He("elementProperties"))) return;
    const t = kr(this);
>>>>>>> origin/main
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
<<<<<<< HEAD
    if (this.hasOwnProperty(Ue("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ue("properties"))) {
      const s = this.properties, r = [...Di(s), ...Ni(s)];
      for (const i of r) this.createProperty(i, s[i]);
||||||| 8cdb3c5
    if (this.hasOwnProperty(Fe("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Fe("properties"))) {
      const s = this.properties, i = [...br(s), ...$r(s)];
      for (const r of i) this.createProperty(r, s[r]);
=======
    if (this.hasOwnProperty(He("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(He("properties"))) {
      const s = this.properties, i = [...wr(s), ..._r(s)];
      for (const r of i) this.createProperty(r, s[r]);
>>>>>>> origin/main
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [r, i] of s) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, r] of this.elementProperties) {
      const i = this._$Eu(s, r);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) s.unshift(Es(i));
    } else t !== void 0 && s.push(Es(t));
    return s;
  }
  static _$Eu(t, s) {
    const r = s.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const r of s.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
<<<<<<< HEAD
    return Pi(t, this.constructor.elementStyles), t;
||||||| 8cdb3c5
    return fr(t, this.constructor.elementStyles), t;
=======
    return br(t, this.constructor.elementStyles), t;
>>>>>>> origin/main
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, r) {
    this._$AK(t, r);
  }
  _$ET(t, s) {
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const n = (r.converter?.toAttribute !== void 0 ? r.converter : nt).toAttribute(s, r.type);
      this._$Em = t, n == null ? this.removeAttribute(i) : this.setAttribute(i, n), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const n = r.getPropertyOptions(i), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : nt;
      this._$Em = i;
      const a = o.fromAttribute(s, n.type);
      this[i] = a ?? this._$Ej?.get(i) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, s, r, i = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
<<<<<<< HEAD
      if (i === !1 && (n = this[t]), r ??= o.getPropertyOptions(t), !((r.hasChanged ?? rs)(n, s) || r.useDefault && r.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, r)))) return;
      this.C(t, s, r);
||||||| 8cdb3c5
      if (r === !1 && (n = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? es)(n, s) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, s, i);
=======
      if (r === !1 && (n = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? Qt)(n, s) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, s, i);
>>>>>>> origin/main
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: r, reflect: i, wrapped: n }, o) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? s ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (s = void 0), this._$AL.set(t, s)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, n] of this._$Ep) this[i] = n;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, n] of r) {
        const { wrapped: o } = n, a = this[i];
        o !== !0 || this._$AL.has(i) || a === void 0 || this.C(i, void 0, n, a);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
<<<<<<< HEAD
Ae.elementStyles = [], Ae.shadowRootOptions = { mode: "open" }, Ae[Ue("elementProperties")] = /* @__PURE__ */ new Map(), Ae[Ue("finalized")] = /* @__PURE__ */ new Map(), Ii?.({ ReactiveElement: Ae }), (vt.reactiveElementVersions ??= []).push("2.1.2");
const is = globalThis, Os = (e) => e, ot = is.trustedTypes, Ps = ot ? ot.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ar = "$lit$", ae = `lit$${Math.random().toFixed(9).slice(2)}$`, Or = "?" + ae, ji = `<${Or}>`, ye = document, We = () => ye.createComment(""), Ge = (e) => e === null || typeof e != "object" && typeof e != "function", ns = Array.isArray, Fi = (e) => ns(e) || typeof e?.[Symbol.iterator] == "function", Pt = `[ 	
\f\r]`, Fe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Cs = /-->/g, Ts = />/g, fe = RegExp(`>|${Pt}(?:([^\\s"'>=/]+)(${Pt}*=${Pt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ls = /'/g, Ds = /"/g, Pr = /^(?:script|style|textarea|title)$/i, Cr = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), l = Cr(1), A = Cr(2), xe = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), Ns = /* @__PURE__ */ new WeakMap(), me = ye.createTreeWalker(ye, 129);
function Tr(e, t) {
  if (!ns(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ps !== void 0 ? Ps.createHTML(t) : t;
||||||| 8cdb3c5
ke.elementStyles = [], ke.shadowRootOptions = { mode: "open" }, ke[Fe("elementProperties")] = /* @__PURE__ */ new Map(), ke[Fe("finalized")] = /* @__PURE__ */ new Map(), wr?.({ ReactiveElement: ke }), (gt.reactiveElementVersions ??= []).push("2.1.2");
const ts = globalThis, Ss = (e) => e, rt = ts.trustedTypes, ks = rt ? rt.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, vi = "$lit$", ie = `lit$${Math.random().toFixed(9).slice(2)}$`, bi = "?" + ie, _r = `<${bi}>`, ve = document, ze = () => ve.createComment(""), Be = (e) => e === null || typeof e != "object" && typeof e != "function", ss = Array.isArray, Sr = (e) => ss(e) || typeof e?.[Symbol.iterator] == "function", At = `[ 	
\f\r]`, Ne = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Es = /-->/g, As = />/g, he = RegExp(`>|${At}(?:([^\\s"'>=/]+)(${At}*=${At}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Os = /'/g, Ps = /"/g, $i = /^(?:script|style|textarea|title)$/i, yi = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), c = yi(1), E = yi(2), be = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), Cs = /* @__PURE__ */ new WeakMap(), ue = ve.createTreeWalker(ve, 129);
function xi(e, t) {
  if (!ss(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ks !== void 0 ? ks.createHTML(t) : t;
=======
Se.elementStyles = [], Se.shadowRootOptions = { mode: "open" }, Se[He("elementProperties")] = /* @__PURE__ */ new Map(), Se[He("finalized")] = /* @__PURE__ */ new Map(), Er?.({ ReactiveElement: Se }), (gt.reactiveElementVersions ??= []).push("2.1.2");
const es = globalThis, ks = (e) => e, rt = es.trustedTypes, Ss = rt ? rt.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, yi = "$lit$", ie = `lit$${Math.random().toFixed(9).slice(2)}$`, xi = "?" + ie, Ar = `<${xi}>`, be = document, Be = () => be.createComment(""), We = (e) => e === null || typeof e != "object" && typeof e != "function", ts = Array.isArray, Or = (e) => ts(e) || typeof e?.[Symbol.iterator] == "function", At = `[ 	
\f\r]`, Ie = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Es = /-->/g, As = />/g, ue = RegExp(`>|${At}(?:([^\\s"'>=/]+)(${At}*=${At}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Os = /'/g, Ps = /"/g, wi = /^(?:script|style|textarea|title)$/i, _i = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), l = _i(1), E = _i(2), $e = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), Cs = /* @__PURE__ */ new WeakMap(), pe = be.createTreeWalker(be, 129);
function ki(e, t) {
  if (!ts(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ss !== void 0 ? Ss.createHTML(t) : t;
>>>>>>> origin/main
}
<<<<<<< HEAD
const Hi = (e, t) => {
  const s = e.length - 1, r = [];
  let i, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Fe;
||||||| 8cdb3c5
const kr = (e, t) => {
  const s = e.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Ne;
=======
const Pr = (e, t) => {
  const s = e.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Ie;
>>>>>>> origin/main
  for (let a = 0; a < s; a++) {
    const c = e[a];
    let h, f, p = -1, v = 0;
<<<<<<< HEAD
    for (; v < c.length && (o.lastIndex = v, f = o.exec(c), f !== null); ) v = o.lastIndex, o === Fe ? f[1] === "!--" ? o = Cs : f[1] !== void 0 ? o = Ts : f[2] !== void 0 ? (Pr.test(f[2]) && (i = RegExp("</" + f[2], "g")), o = fe) : f[3] !== void 0 && (o = fe) : o === fe ? f[0] === ">" ? (o = i ?? Fe, p = -1) : f[1] === void 0 ? p = -2 : (p = o.lastIndex - f[2].length, h = f[1], o = f[3] === void 0 ? fe : f[3] === '"' ? Ds : Ls) : o === Ds || o === Ls ? o = fe : o === Cs || o === Ts ? o = Fe : (o = fe, i = void 0);
    const y = o === fe && e[a + 1].startsWith("/>") ? " " : "";
    n += o === Fe ? c + ji : p >= 0 ? (r.push(h), c.slice(0, p) + Ar + c.slice(p) + ae + y) : c + ae + (p === -2 ? a : y);
||||||| 8cdb3c5
    for (; v < l.length && (o.lastIndex = v, f = o.exec(l), f !== null); ) v = o.lastIndex, o === Ne ? f[1] === "!--" ? o = Es : f[1] !== void 0 ? o = As : f[2] !== void 0 ? ($i.test(f[2]) && (r = RegExp("</" + f[2], "g")), o = he) : f[3] !== void 0 && (o = he) : o === he ? f[0] === ">" ? (o = r ?? Ne, p = -1) : f[1] === void 0 ? p = -2 : (p = o.lastIndex - f[2].length, h = f[1], o = f[3] === void 0 ? he : f[3] === '"' ? Ps : Os) : o === Ps || o === Os ? o = he : o === Es || o === As ? o = Ne : (o = he, r = void 0);
    const y = o === he && e[a + 1].startsWith("/>") ? " " : "";
    n += o === Ne ? l + _r : p >= 0 ? (i.push(h), l.slice(0, p) + vi + l.slice(p) + ie + y) : l + ie + (p === -2 ? a : y);
=======
    for (; v < c.length && (o.lastIndex = v, f = o.exec(c), f !== null); ) v = o.lastIndex, o === Ie ? f[1] === "!--" ? o = Es : f[1] !== void 0 ? o = As : f[2] !== void 0 ? (wi.test(f[2]) && (r = RegExp("</" + f[2], "g")), o = ue) : f[3] !== void 0 && (o = ue) : o === ue ? f[0] === ">" ? (o = r ?? Ie, p = -1) : f[1] === void 0 ? p = -2 : (p = o.lastIndex - f[2].length, h = f[1], o = f[3] === void 0 ? ue : f[3] === '"' ? Ps : Os) : o === Ps || o === Os ? o = ue : o === Es || o === As ? o = Ie : (o = ue, r = void 0);
    const y = o === ue && e[a + 1].startsWith("/>") ? " " : "";
    n += o === Ie ? c + Ar : p >= 0 ? (i.push(h), c.slice(0, p) + yi + c.slice(p) + ie + y) : c + ie + (p === -2 ? a : y);
>>>>>>> origin/main
  }
<<<<<<< HEAD
  return [Tr(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
||||||| 8cdb3c5
  return [xi(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
=======
  return [ki(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
>>>>>>> origin/main
};
class Ve {
  constructor({ strings: t, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let n = 0, o = 0;
<<<<<<< HEAD
    const a = t.length - 1, c = this.parts, [h, f] = Hi(t, s);
    if (this.el = Ve.createElement(h, r), me.currentNode = this.el.content, s === 2 || s === 3) {
||||||| 8cdb3c5
    const a = t.length - 1, l = this.parts, [h, f] = kr(t, s);
    if (this.el = Ge.createElement(h, i), ue.currentNode = this.el.content, s === 2 || s === 3) {
=======
    const a = t.length - 1, c = this.parts, [h, f] = Pr(t, s);
    if (this.el = Ge.createElement(h, i), pe.currentNode = this.el.content, s === 2 || s === 3) {
>>>>>>> origin/main
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
<<<<<<< HEAD
    for (; (i = me.nextNode()) !== null && c.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(Ar)) {
          const v = f[o++], y = i.getAttribute(p).split(ae), x = /([.?@])?(.*)/.exec(v);
          c.push({ type: 1, index: n, name: x[2], strings: y, ctor: x[1] === "." ? zi : x[1] === "?" ? Bi : x[1] === "@" ? Wi : bt }), i.removeAttribute(p);
        } else p.startsWith(ae) && (c.push({ type: 6, index: n }), i.removeAttribute(p));
        if (Pr.test(i.tagName)) {
          const p = i.textContent.split(ae), v = p.length - 1;
||||||| 8cdb3c5
    for (; (r = ue.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(vi)) {
          const v = f[o++], y = r.getAttribute(p).split(ie), x = /([.?@])?(.*)/.exec(v);
          l.push({ type: 1, index: n, name: x[2], strings: y, ctor: x[1] === "." ? Ar : x[1] === "?" ? Or : x[1] === "@" ? Pr : mt }), r.removeAttribute(p);
        } else p.startsWith(ie) && (l.push({ type: 6, index: n }), r.removeAttribute(p));
        if ($i.test(r.tagName)) {
          const p = r.textContent.split(ie), v = p.length - 1;
=======
    for (; (r = pe.nextNode()) !== null && c.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(yi)) {
          const v = f[o++], y = r.getAttribute(p).split(ie), x = /([.?@])?(.*)/.exec(v);
          c.push({ type: 1, index: n, name: x[2], strings: y, ctor: x[1] === "." ? Tr : x[1] === "?" ? Lr : x[1] === "@" ? Dr : mt }), r.removeAttribute(p);
        } else p.startsWith(ie) && (c.push({ type: 6, index: n }), r.removeAttribute(p));
        if (wi.test(r.tagName)) {
          const p = r.textContent.split(ie), v = p.length - 1;
>>>>>>> origin/main
          if (v > 0) {
<<<<<<< HEAD
            i.textContent = ot ? ot.emptyScript : "";
            for (let y = 0; y < v; y++) i.append(p[y], We()), me.nextNode(), c.push({ type: 2, index: ++n });
            i.append(p[v], We());
||||||| 8cdb3c5
            r.textContent = rt ? rt.emptyScript : "";
            for (let y = 0; y < v; y++) r.append(p[y], ze()), ue.nextNode(), l.push({ type: 2, index: ++n });
            r.append(p[v], ze());
=======
            r.textContent = rt ? rt.emptyScript : "";
            for (let y = 0; y < v; y++) r.append(p[y], Be()), pe.nextNode(), c.push({ type: 2, index: ++n });
            r.append(p[v], Be());
>>>>>>> origin/main
          }
        }
<<<<<<< HEAD
      } else if (i.nodeType === 8) if (i.data === Or) c.push({ type: 2, index: n });
||||||| 8cdb3c5
      } else if (r.nodeType === 8) if (r.data === bi) l.push({ type: 2, index: n });
=======
      } else if (r.nodeType === 8) if (r.data === xi) c.push({ type: 2, index: n });
>>>>>>> origin/main
      else {
        let p = -1;
<<<<<<< HEAD
        for (; (p = i.data.indexOf(ae, p + 1)) !== -1; ) c.push({ type: 7, index: n }), p += ae.length - 1;
||||||| 8cdb3c5
        for (; (p = r.data.indexOf(ie, p + 1)) !== -1; ) l.push({ type: 7, index: n }), p += ie.length - 1;
=======
        for (; (p = r.data.indexOf(ie, p + 1)) !== -1; ) c.push({ type: 7, index: n }), p += ie.length - 1;
>>>>>>> origin/main
      }
      n++;
    }
  }
  static createElement(t, s) {
<<<<<<< HEAD
    const r = ye.createElement("template");
    return r.innerHTML = t, r;
||||||| 8cdb3c5
    const i = ve.createElement("template");
    return i.innerHTML = t, i;
=======
    const i = be.createElement("template");
    return i.innerHTML = t, i;
>>>>>>> origin/main
  }
}
<<<<<<< HEAD
function Ce(e, t, s = e, r) {
  if (t === xe) return t;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const n = Ge(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== n && (i?._$AO?.(!1), n === void 0 ? i = void 0 : (i = new n(e), i._$AT(e, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (t = Ce(e, i._$AS(e, t.values), i, r)), t;
||||||| 8cdb3c5
function Oe(e, t, s = e, i) {
  if (t === be) return t;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const n = Be(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(e), r._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (t = Oe(e, r._$AS(e, t.values), r, i)), t;
=======
function Oe(e, t, s = e, i) {
  if (t === $e) return t;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const n = We(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(e), r._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (t = Oe(e, r._$AS(e, t.values), r, i)), t;
>>>>>>> origin/main
}
<<<<<<< HEAD
class Ui {
||||||| 8cdb3c5
class Er {
=======
class Cr {
>>>>>>> origin/main
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
<<<<<<< HEAD
    const { el: { content: s }, parts: r } = this._$AD, i = (t?.creationScope ?? ye).importNode(s, !0);
    me.currentNode = i;
    let n = me.nextNode(), o = 0, a = 0, c = r[0];
||||||| 8cdb3c5
    const { el: { content: s }, parts: i } = this._$AD, r = (t?.creationScope ?? ve).importNode(s, !0);
    ue.currentNode = r;
    let n = ue.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
=======
    const { el: { content: s }, parts: i } = this._$AD, r = (t?.creationScope ?? be).importNode(s, !0);
    pe.currentNode = r;
    let n = pe.nextNode(), o = 0, a = 0, c = i[0];
>>>>>>> origin/main
    for (; c !== void 0; ) {
      if (o === c.index) {
        let h;
<<<<<<< HEAD
        c.type === 2 ? h = new Xe(n, n.nextSibling, this, t) : c.type === 1 ? h = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (h = new Gi(n, this, t)), this._$AV.push(h), c = r[++a];
||||||| 8cdb3c5
        l.type === 2 ? h = new Ye(n, n.nextSibling, this, t) : l.type === 1 ? h = new l.ctor(n, l.name, l.strings, this, t) : l.type === 6 && (h = new Cr(n, this, t)), this._$AV.push(h), l = i[++a];
=======
        c.type === 2 ? h = new Ye(n, n.nextSibling, this, t) : c.type === 1 ? h = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (h = new Mr(n, this, t)), this._$AV.push(h), c = i[++a];
>>>>>>> origin/main
      }
<<<<<<< HEAD
      o !== c?.index && (n = me.nextNode(), o++);
||||||| 8cdb3c5
      o !== l?.index && (n = ue.nextNode(), o++);
=======
      o !== c?.index && (n = pe.nextNode(), o++);
>>>>>>> origin/main
    }
<<<<<<< HEAD
    return me.currentNode = ye, i;
||||||| 8cdb3c5
    return ue.currentNode = ve, r;
=======
    return pe.currentNode = be, r;
>>>>>>> origin/main
  }
  p(t) {
    let s = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, s), s += r.strings.length - 2) : r._$AI(t[s])), s++;
  }
}
class Xe {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, r, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
<<<<<<< HEAD
    t = Ce(this, t, s), Ge(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== xe && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Fi(t) ? this.k(t) : this._(t);
||||||| 8cdb3c5
    t = Oe(this, t, s), Be(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== be && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Sr(t) ? this.k(t) : this._(t);
=======
    t = Oe(this, t, s), We(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== $e && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Or(t) ? this.k(t) : this._(t);
>>>>>>> origin/main
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
<<<<<<< HEAD
    this._$AH !== u && Ge(this._$AH) ? this._$AA.nextSibling.data = t : this.T(ye.createTextNode(t)), this._$AH = t;
||||||| 8cdb3c5
    this._$AH !== u && Be(this._$AH) ? this._$AA.nextSibling.data = t : this.T(ve.createTextNode(t)), this._$AH = t;
=======
    this._$AH !== u && We(this._$AH) ? this._$AA.nextSibling.data = t : this.T(be.createTextNode(t)), this._$AH = t;
>>>>>>> origin/main
  }
  $(t) {
<<<<<<< HEAD
    const { values: s, _$litType$: r } = t, i = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = Ve.createElement(Tr(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
||||||| 8cdb3c5
    const { values: s, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Ge.createElement(xi(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
=======
    const { values: s, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Ge.createElement(ki(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
>>>>>>> origin/main
    else {
<<<<<<< HEAD
      const n = new Ui(i, this), o = n.u(this.options);
||||||| 8cdb3c5
      const n = new Er(r, this), o = n.u(this.options);
=======
      const n = new Cr(r, this), o = n.u(this.options);
>>>>>>> origin/main
      n.p(s), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let s = Ns.get(t.strings);
    return s === void 0 && Ns.set(t.strings, s = new Ve(t)), s;
  }
  k(t) {
<<<<<<< HEAD
    ns(this._$AH) || (this._$AH = [], this._$AR());
||||||| 8cdb3c5
    ss(this._$AH) || (this._$AH = [], this._$AR());
=======
    ts(this._$AH) || (this._$AH = [], this._$AR());
>>>>>>> origin/main
    const s = this._$AH;
<<<<<<< HEAD
    let r, i = 0;
    for (const n of t) i === s.length ? s.push(r = new Xe(this.O(We()), this.O(We()), this, this.options)) : r = s[i], r._$AI(n), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
||||||| 8cdb3c5
    let i, r = 0;
    for (const n of t) r === s.length ? s.push(i = new Ye(this.O(ze()), this.O(ze()), this, this.options)) : i = s[r], i._$AI(n), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
=======
    let i, r = 0;
    for (const n of t) r === s.length ? s.push(i = new Ye(this.O(Be()), this.O(Be()), this, this.options)) : i = s[r], i._$AI(n), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
>>>>>>> origin/main
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
<<<<<<< HEAD
      const r = Os(t).nextSibling;
      Os(t).remove(), t = r;
||||||| 8cdb3c5
      const i = Ss(t).nextSibling;
      Ss(t).remove(), t = i;
=======
      const i = ks(t).nextSibling;
      ks(t).remove(), t = i;
>>>>>>> origin/main
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class bt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, r, i, n) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = s, this._$AM = i, this.options = n, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = u;
  }
  _$AI(t, s = this, r, i) {
    const n = this.strings;
    let o = !1;
<<<<<<< HEAD
    if (n === void 0) t = Ce(this, t, s, 0), o = !Ge(t) || t !== this._$AH && t !== xe, o && (this._$AH = t);
||||||| 8cdb3c5
    if (n === void 0) t = Oe(this, t, s, 0), o = !Be(t) || t !== this._$AH && t !== be, o && (this._$AH = t);
=======
    if (n === void 0) t = Oe(this, t, s, 0), o = !We(t) || t !== this._$AH && t !== $e, o && (this._$AH = t);
>>>>>>> origin/main
    else {
      const a = t;
      let c, h;
<<<<<<< HEAD
      for (t = n[0], c = 0; c < n.length - 1; c++) h = Ce(this, a[r + c], s, c), h === xe && (h = this._$AH[c]), o ||= !Ge(h) || h !== this._$AH[c], h === u ? t = u : t !== u && (t += (h ?? "") + n[c + 1]), this._$AH[c] = h;
||||||| 8cdb3c5
      let l, h;
      for (t = n[0], l = 0; l < n.length - 1; l++) h = Oe(this, a[i + l], s, l), h === be && (h = this._$AH[l]), o ||= !Be(h) || h !== this._$AH[l], h === u ? t = u : t !== u && (t += (h ?? "") + n[l + 1]), this._$AH[l] = h;
=======
      for (t = n[0], c = 0; c < n.length - 1; c++) h = Oe(this, a[i + c], s, c), h === $e && (h = this._$AH[c]), o ||= !We(h) || h !== this._$AH[c], h === u ? t = u : t !== u && (t += (h ?? "") + n[c + 1]), this._$AH[c] = h;
>>>>>>> origin/main
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
<<<<<<< HEAD
class zi extends bt {
||||||| 8cdb3c5
class Ar extends mt {
=======
class Tr extends mt {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
<<<<<<< HEAD
class Bi extends bt {
||||||| 8cdb3c5
class Or extends mt {
=======
class Lr extends mt {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
<<<<<<< HEAD
class Wi extends bt {
  constructor(t, s, r, i, n) {
    super(t, s, r, i, n), this.type = 5;
||||||| 8cdb3c5
class Pr extends mt {
  constructor(t, s, i, r, n) {
    super(t, s, i, r, n), this.type = 5;
=======
class Dr extends mt {
  constructor(t, s, i, r, n) {
    super(t, s, i, r, n), this.type = 5;
>>>>>>> origin/main
  }
  _$AI(t, s = this) {
<<<<<<< HEAD
    if ((t = Ce(this, t, s, 0) ?? u) === xe) return;
    const r = this._$AH, i = t === u && r !== u || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, n = t !== u && (r === u || i);
    i && this.element.removeEventListener(this.name, this, r), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
||||||| 8cdb3c5
    if ((t = Oe(this, t, s, 0) ?? u) === be) return;
    const i = this._$AH, r = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== u && (i === u || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
=======
    if ((t = Oe(this, t, s, 0) ?? u) === $e) return;
    const i = this._$AH, r = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== u && (i === u || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
>>>>>>> origin/main
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
<<<<<<< HEAD
class Gi {
  constructor(t, s, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = r;
||||||| 8cdb3c5
class Cr {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
=======
class Mr {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
>>>>>>> origin/main
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ce(this, t);
  }
}
<<<<<<< HEAD
const Vi = is.litHtmlPolyfillSupport;
Vi?.(Ve, Xe), (is.litHtmlVersions ??= []).push("3.3.3");
const qi = (e, t, s) => {
  const r = s?.renderBefore ?? t;
  let i = r._$litPart$;
  if (i === void 0) {
||||||| 8cdb3c5
const Tr = ts.litHtmlPolyfillSupport;
Tr?.(Ge, Ye), (ts.litHtmlVersions ??= []).push("3.3.3");
const Lr = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
=======
const Nr = es.litHtmlPolyfillSupport;
Nr?.(Ge, Ye), (es.litHtmlVersions ??= []).push("3.3.3");
const Rr = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
>>>>>>> origin/main
    const n = s?.renderBefore ?? null;
<<<<<<< HEAD
    r._$litPart$ = i = new Xe(t.insertBefore(We(), n), n, void 0, s ?? {});
||||||| 8cdb3c5
    i._$litPart$ = r = new Ye(t.insertBefore(ze(), n), n, void 0, s ?? {});
=======
    i._$litPart$ = r = new Ye(t.insertBefore(Be(), n), n, void 0, s ?? {});
>>>>>>> origin/main
  }
  return i._$AI(e), i;
};
<<<<<<< HEAD
const os = globalThis;
let b = class extends Ae {
||||||| 8cdb3c5
const is = globalThis;
let b = class extends ke {
=======
const ss = globalThis;
let b = class extends Se {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
<<<<<<< HEAD
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = qi(s, this.renderRoot, this.renderOptions);
||||||| 8cdb3c5
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Lr(s, this.renderRoot, this.renderOptions);
=======
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Rr(s, this.renderRoot, this.renderOptions);
>>>>>>> origin/main
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
<<<<<<< HEAD
    return xe;
||||||| 8cdb3c5
    return be;
=======
    return $e;
>>>>>>> origin/main
  }
};
<<<<<<< HEAD
b._$litElement$ = !0, b.finalized = !0, os.litElementHydrateSupport?.({ LitElement: b });
const Ki = os.litElementPolyfillSupport;
Ki?.({ LitElement: b });
(os.litElementVersions ??= []).push("4.2.2");
const _ = (e) => (t, s) => {
||||||| 8cdb3c5
b._$litElement$ = !0, b.finalized = !0, is.litElementHydrateSupport?.({ LitElement: b });
const Dr = is.litElementPolyfillSupport;
Dr?.({ LitElement: b });
(is.litElementVersions ??= []).push("4.2.2");
const k = (e) => (t, s) => {
=======
b._$litElement$ = !0, b.finalized = !0, ss.litElementHydrateSupport?.({ LitElement: b });
const Ir = ss.litElementPolyfillSupport;
Ir?.({ LitElement: b });
(ss.litElementVersions ??= []).push("4.2.2");
const S = (e) => (t, s) => {
>>>>>>> origin/main
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
<<<<<<< HEAD
const Yi = { attribute: !0, type: String, converter: nt, reflect: !1, hasChanged: rs }, Xi = (e = Yi, t, s) => {
  const { kind: r, metadata: i } = s;
  let n = globalThis.litPropertyMetadata.get(i);
  if (n === void 0 && globalThis.litPropertyMetadata.set(i, n = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), r === "accessor") {
||||||| 8cdb3c5
const Rr = { attribute: !0, type: String, converter: it, reflect: !1, hasChanged: es }, Mr = (e = Rr, t, s) => {
  const { kind: i, metadata: r } = s;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), i === "accessor") {
=======
const jr = { attribute: !0, type: String, converter: it, reflect: !1, hasChanged: Qt }, Fr = (e = jr, t, s) => {
  const { kind: i, metadata: r } = s;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), i === "accessor") {
>>>>>>> origin/main
    const { name: o } = s;
    return { set(a) {
      const c = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, c, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, e, a), a;
    } };
  }
  if (r === "setter") {
    const { name: o } = s;
    return function(a) {
      const c = this[o];
      t.call(this, a), this.requestUpdate(o, c, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function d(e) {
<<<<<<< HEAD
  return (t, s) => typeof s == "object" ? Xi(e, t, s) : ((r, i, n) => {
    const o = i.hasOwnProperty(n);
    return i.constructor.createProperty(n, r), o ? Object.getOwnPropertyDescriptor(i, n) : void 0;
||||||| 8cdb3c5
  return (t, s) => typeof s == "object" ? Mr(e, t, s) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
=======
  return (t, s) => typeof s == "object" ? Fr(e, t, s) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
>>>>>>> origin/main
  })(e, t, s);
}
function m(e) {
  return d({ ...e, state: !0, attribute: !1 });
}
<<<<<<< HEAD
const Lr = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Ji = (e) => e.callWS({
||||||| 8cdb3c5
const wi = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Nr = (e) => e.callWS({
=======
const Si = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Hr = (e) => e.callWS({
>>>>>>> origin/main
  type: "activity_levels/config/get"
<<<<<<< HEAD
}).then((t) => ({ config: t.config, inferred: t.inferred ?? [], warnings: t.warnings ?? [] })), Dr = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(Lr);
async function Zi(e, t) {
||||||| 8cdb3c5
}).then((t) => ({ config: t.config, inferred: t.inferred ?? [], warnings: t.warnings ?? [] })), _i = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(wi);
async function Ir(e, t) {
=======
}).then((t) => ({ config: t.config, inferred: t.inferred ?? [], warnings: t.warnings ?? [] })), Ei = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(Si);
async function Ur(e, t) {
>>>>>>> origin/main
  try {
<<<<<<< HEAD
    return Lr(await e.callWS({ type: "activity_levels/config/save", config: t }));
||||||| 8cdb3c5
    return wi(await e.callWS({ type: "activity_levels/config/save", config: t }));
=======
    return Si(await e.callWS({ type: "activity_levels/config/save", config: t }));
>>>>>>> origin/main
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
<<<<<<< HEAD
const Qi = (e) => e.callWS({ type: "activity_levels/state" }), en = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), tn = (e) => e.callWS({ type: "activity_levels/profile/get" }), sn = (e, t = !1) => e.callWS({ type: "activity_levels/profile/rebuild", force: t }), rn = (e, t, s = 50) => e.callWS({
||||||| 8cdb3c5
const jr = (e) => e.callWS({ type: "activity_levels/state" }), Fr = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), Hr = (e) => e.callWS({ type: "activity_levels/profile/get" }), Ur = (e, t = !1) => e.callWS({ type: "activity_levels/profile/rebuild", force: t }), zr = (e, t, s = 50) => e.callWS({
=======
const zr = (e) => e.callWS({ type: "activity_levels/state" }), Br = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), Wr = (e) => e.callWS({ type: "activity_levels/profile/get" }), Gr = (e, t = !1) => e.callWS({ type: "activity_levels/profile/rebuild", force: t }), Vr = (e, t, s = 50) => e.callWS({
>>>>>>> origin/main
  type: "activity_levels/simulation/log",
  limit: s
<<<<<<< HEAD
}), nn = (e, t, s) => e.callWS({ type: "activity_levels/level/set", group_id: t, value: s }).then((r) => r.value), on = (e, t, s) => e.callWS({ type: "activity_levels/mute", group_id: t, muted: s }).then((r) => r.muted), an = (e, t) => e.callWS({ type: "activity_levels/reset", group_id: t }).then(() => {
}), ln = (e) => e.callWS({ type: "activity_levels/topology" }), cn = (e, t, s) => e.callWS({ type: "activity_levels/topology/paths", from: t, to: s }).then((r) => r.paths), dn = (e) => e.callWS({ type: "activity_levels/presence/state" }), hn = (e, t, s) => e.callWS({ type: "activity_levels/presence/correct", person: t, room: s }), un = (e, t, s, r) => e.callService(t, s, r), $t = 14, Nr = (e) => `switch.${e}_presence_simulation`, Rr = (e) => `sensor.${e}_expected_activity`, pn = (e) => `sensor.${e}_activity_anomaly`, fn = [
||||||| 8cdb3c5
}), Br = (e, t, s) => e.callWS({ type: "activity_levels/level/set", group_id: t, value: s }).then((i) => i.value), Gr = (e, t, s) => e.callWS({ type: "activity_levels/mute", group_id: t, muted: s }).then((i) => i.muted), Wr = (e, t) => e.callWS({ type: "activity_levels/reset", group_id: t }).then(() => {
}), Vr = (e) => e.callWS({ type: "activity_levels/topology" }), qr = (e, t, s) => e.callWS({ type: "activity_levels/topology/paths", from: t, to: s }).then((i) => i.paths), Kr = (e) => e.callWS({ type: "activity_levels/presence/state" }), Yr = (e, t, s, i) => e.callService(t, s, i), vt = 14, Si = (e) => `switch.${e}_presence_simulation`, ki = (e) => `sensor.${e}_expected_activity`, Xr = (e) => `sensor.${e}_activity_anomaly`, Jr = [
=======
}), qr = (e, t, s) => e.callWS({ type: "activity_levels/level/set", group_id: t, value: s }).then((i) => i.value), Kr = (e, t, s) => e.callWS({ type: "activity_levels/mute", group_id: t, muted: s }).then((i) => i.muted), Yr = (e, t) => e.callWS({ type: "activity_levels/reset", group_id: t }).then(() => {
}), Xr = (e) => e.callWS({ type: "activity_levels/topology" }), Jr = (e, t, s) => e.callWS({ type: "activity_levels/topology/paths", from: t, to: s }).then((i) => i.paths), Zr = (e) => e.callWS({ type: "activity_levels/presence/state" }), Qr = (e, t, s, i) => e.callService(t, s, i), vt = 14, Ai = (e) => `switch.${e}_presence_simulation`, Oi = (e) => `sensor.${e}_expected_activity`, en = (e) => `sensor.${e}_activity_anomaly`, tn = [
>>>>>>> origin/main
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
<<<<<<< HEAD
], Rs = ["ha-yaml-editor", "ha-state-icon"], mn = 2500, gn = 8e3;
function vn(e) {
||||||| 8cdb3c5
], Ts = ["ha-yaml-editor"], Zr = 2500, Qr = 8e3;
function en(e) {
=======
], Ts = ["ha-yaml-editor", "ha-state-icon"], sn = 2500, rn = 8e3;
function nn(e) {
>>>>>>> origin/main
  let t;
  return { promise: new Promise((r) => {
    t = setTimeout(r, e);
  }), cancel: () => clearTimeout(t) };
}
<<<<<<< HEAD
async function Ms(e, t, s) {
  const r = vn(t);
||||||| 8cdb3c5
async function Ls(e, t, s) {
  const i = en(t);
=======
async function Ls(e, t, s) {
  const i = nn(t);
>>>>>>> origin/main
  try {
    return await Promise.race([e, r.promise.then(() => s)]);
  } finally {
    r.cancel();
  }
}
<<<<<<< HEAD
async function bn() {
||||||| 8cdb3c5
async function tn() {
=======
async function on() {
>>>>>>> origin/main
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
<<<<<<< HEAD
async function $n() {
||||||| 8cdb3c5
async function sn() {
=======
async function an() {
>>>>>>> origin/main
  if (customElements.get("ha-yaml-editor")) return;
  let e;
  try {
    await customElements.whenDefined("ha-selector"), e = document.createElement("ha-selector"), e.selector = { object: {} }, e.style.display = "none", document.body.appendChild(e), await customElements.whenDefined("ha-yaml-editor");
  } catch {
  } finally {
    e?.remove();
  }
}
<<<<<<< HEAD
async function yn(e = gn, t = mn) {
  const s = [...fn, ...Rs];
||||||| 8cdb3c5
async function rn(e = Qr, t = Zr) {
  const s = [...Jr, ...Ts];
=======
async function ln(e = rn, t = sn) {
  const s = [...tn, ...Ts];
>>>>>>> origin/main
  if (s.every((a) => customElements.get(a))) return { ok: !0, missing: [], optionalMissing: [] };
<<<<<<< HEAD
  await Ms(
    Promise.all([bn(), $n()]).then(() => {
||||||| 8cdb3c5
  await Ls(
    Promise.all([tn(), sn()]).then(() => {
=======
  await Ls(
    Promise.all([on(), an()]).then(() => {
>>>>>>> origin/main
    }),
    t,
    void 0
  );
  const r = await Promise.all(
    s.map(
      (a) => Ms(
        customElements.whenDefined(a).then(() => !0),
        e,
        !1
      )
    )
<<<<<<< HEAD
  ), i = s.filter((a, c) => !r[c]), n = Rs, o = i.filter((a) => !n.includes(a));
||||||| 8cdb3c5
  ), r = s.filter((a, l) => !i[l]), n = Ts, o = r.filter((a) => !n.includes(a));
=======
  ), r = s.filter((a, c) => !i[c]), n = Ts, o = r.filter((a) => !n.includes(a));
>>>>>>> origin/main
  return {
    ok: o.length === 0,
    missing: o,
    optionalMissing: i.filter((a) => n.includes(a))
  };
}
<<<<<<< HEAD
const xn = ["open", "door", "stairs", "exterior_door"], Mr = "door", ge = {
||||||| 8cdb3c5
const nn = ["open", "door", "stairs", "exterior_door"], Ei = "door", pe = {
=======
const cn = ["open", "door", "stairs", "exterior_door"], Pi = "door", fe = {
>>>>>>> origin/main
  property: {
    label: "Property",
    icon: "mdi:home-city",
    definition: "The whole lot: everything you own, inside and out. Every configuration starts with one."
  },
  structure: {
    label: "Structure",
    icon: "mdi:home",
    definition: "A building on the property — the house, a garage, a shed."
  },
  floor: {
    label: "Floor",
    icon: "mdi:layers",
    definition: "One level of a structure. Bind it to a Home Assistant floor to reuse its name."
  },
  area: {
    label: "Area",
    icon: "mdi:door",
    definition: "A room or zone people occupy. Bind it to a Home Assistant area to reuse its name and put its entities in the right place."
  },
  outside: {
    label: "Outside",
    icon: "mdi:tree",
    definition: "An outdoor area — a yard, a patio, the driveway. Outside areas can lead off the property."
  }
}, Is = {
  open: "Open (no door)",
  door: "Door",
  stairs: "Stairs",
  exterior_door: "Exterior door"
<<<<<<< HEAD
}, wn = {
||||||| 8cdb3c5
}, on = {
=======
}, dn = {
>>>>>>> origin/main
  property: ["property", "structure", "outside"],
  structure: ["floor", "area"],
  floor: ["area"],
  area: ["area"],
  outside: ["outside"]
<<<<<<< HEAD
}, _n = ["property"], qe = /* @__PURE__ */ new Set(["area", "outside"]), at = (e) => e === null ? _n : wn[e];
function kn(e, t) {
  return t.length <= e.length ? !1 : e.every((s, r) => t[r] === s);
||||||| 8cdb3c5
}, an = ["property"], We = /* @__PURE__ */ new Set(["area", "outside"]), nt = (e) => e === null ? an : on[e];
function ln(e, t) {
  return t.length <= e.length ? !1 : e.every((s, i) => t[i] === s);
=======
}, hn = ["property"], Ve = /* @__PURE__ */ new Set(["area", "outside"]), nt = (e) => e === null ? hn : dn[e];
function un(e, t) {
  return t.length <= e.length ? !1 : e.every((s, i) => t[i] === s);
>>>>>>> origin/main
}
<<<<<<< HEAD
function Y(e, t) {
||||||| 8cdb3c5
function G(e, t) {
=======
function V(e, t) {
>>>>>>> origin/main
  let s = e;
  for (const r of t) {
    if (s == null) return;
    s = s[r];
  }
  return s;
}
<<<<<<< HEAD
function js(e) {
||||||| 8cdb3c5
function Rs(e) {
=======
function Ms(e) {
>>>>>>> origin/main
  return Array.isArray(e) ? [...e] : { ...e };
}
function yt(e, t, s) {
  if (t.length === 0) throw new Error("empty path");
<<<<<<< HEAD
  const r = js(e);
  let i = r;
||||||| 8cdb3c5
  const i = Rs(e);
  let r = i;
=======
  const i = Ms(e);
  let r = i;
>>>>>>> origin/main
  for (let n = 0; n < t.length - 1; n++) {
<<<<<<< HEAD
    const o = t[n], a = js(i[o]);
    i[o] = a, i = a;
||||||| 8cdb3c5
    const o = t[n], a = Rs(r[o]);
    r[o] = a, r = a;
=======
    const o = t[n], a = Ms(r[o]);
    r[o] = a, r = a;
>>>>>>> origin/main
  }
  return s(i, t[t.length - 1]), r;
}
function O(e, t, s) {
  return yt(e, t, (r, i) => {
    r[i] = s;
  });
}
function xt(e, t) {
  return yt(e, t, (s, r) => {
    Array.isArray(s) ? s.splice(r, 1) : delete s[r];
  });
}
function lt(e, t, s, r) {
  return yt(e, [...t, s], (i) => {
    i.splice(s, 0, r);
  });
}
<<<<<<< HEAD
function En(e, t, s, r) {
  return yt(e, [...t, s], (i) => {
    const n = i, [o] = n.splice(s, 1);
    n.splice(r, 0, o);
||||||| 8cdb3c5
function cn(e, t, s, i) {
  return bt(e, [...t, s], (r) => {
    const n = r, [o] = n.splice(s, 1);
    n.splice(i, 0, o);
=======
function pn(e, t, s, i) {
  return bt(e, [...t, s], (r) => {
    const n = r, [o] = n.splice(s, 1);
    n.splice(i, 0, o);
>>>>>>> origin/main
  });
}
<<<<<<< HEAD
function Sn(e, t, s, r) {
  return r === s || r === s + 1 ? e : En(e, t, s, r > s ? r - 1 : r);
||||||| 8cdb3c5
function dn(e, t, s, i) {
  return i === s || i === s + 1 ? e : cn(e, t, s, i > s ? i - 1 : i);
=======
function fn(e, t, s, i) {
  return i === s || i === s + 1 ? e : pn(e, t, s, i > s ? i - 1 : i);
>>>>>>> origin/main
}
<<<<<<< HEAD
const An = 1e3;
class On {
||||||| 8cdb3c5
const hn = 1e3;
class un {
=======
const gn = 1e3;
class mn {
>>>>>>> origin/main
  constructor(t) {
    this.past = [], this.future = [], this.coalesceKey = null, this.coalesceAt = 0, this.original = t, this.config = t;
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
  set(t, s) {
<<<<<<< HEAD
    const r = Date.now();
    s !== void 0 && s === this.coalesceKey && r - this.coalesceAt < An || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = r;
||||||| 8cdb3c5
    const i = Date.now();
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < hn || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = i;
=======
    const i = Date.now();
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < gn || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = i;
>>>>>>> origin/main
  }
  undo() {
    this.coalesceKey = null;
    const t = this.past.pop();
    t && (this.future.push(this.config), this.config = t);
  }
  redo() {
    this.coalesceKey = null;
    const t = this.future.pop();
    t && (this.past.push(this.config), this.config = t);
  }
  reset(t) {
    this.original = t, this.config = t, this.past = [], this.future = [], this.coalesceKey = null;
  }
}
const ne = (e) => ({ ok: !1, reason: e }), ct = (e) => ({
  list: e.slice(0, -1),
  index: e[e.length - 1]
<<<<<<< HEAD
}), Fs = (e) => e[e.length - 1] === "stimuli";
function Hs(e, t, s, r) {
  const i = Y(e, t);
  if (i === void 0) return ne("that node is gone");
  const n = Y(e, s);
  if (!Array.isArray(n)) return ne("there is nothing to drop into there");
  if (r < 0 || r > n.length) return ne("that is not a slot in this list");
  const o = Fs(ct(t).list);
  if (o !== Fs(s))
    return ne(o ? "a stimulus belongs to a group, not beside one" : "that is not a stimulus");
||||||| 8cdb3c5
}), Ms = (e) => e[e.length - 1] === "stimuli";
function Ns(e, t, s, i) {
  const r = G(e, t);
  if (r === void 0) return te("that node is gone");
  const n = G(e, s);
  if (!Array.isArray(n)) return te("there is nothing to drop into there");
  if (i < 0 || i > n.length) return te("that is not a slot in this list");
  const o = Ms(at(t).list);
  if (o !== Ms(s))
    return te(o ? "a stimulus belongs to a group, not beside one" : "that is not a stimulus");
=======
}), Ns = (e) => e[e.length - 1] === "stimuli";
function Rs(e, t, s, i) {
  const r = V(e, t);
  if (r === void 0) return te("that node is gone");
  const n = V(e, s);
  if (!Array.isArray(n)) return te("there is nothing to drop into there");
  if (i < 0 || i > n.length) return te("that is not a slot in this list");
  const o = Ns(at(t).list);
  if (o !== Ns(s))
    return te(o ? "a stimulus belongs to a group, not beside one" : "that is not a stimulus");
>>>>>>> origin/main
  if (o) return { ok: !0 };
<<<<<<< HEAD
  const a = i;
  if (kn(t, s) || dt(t, s.slice(0, -1)))
    return ne("a group cannot go into itself");
||||||| 8cdb3c5
  const a = r;
  if (ln(t, s) || lt(t, s.slice(0, -1)))
    return te("a group cannot go into itself");
  const l = s.slice(0, -1);
=======
  const a = r;
  if (un(t, s) || lt(t, s.slice(0, -1)))
    return te("a group cannot go into itself");
>>>>>>> origin/main
  const c = s.slice(0, -1);
  let h;
  if (s.length === 1)
    h = null;
  else {
<<<<<<< HEAD
    const p = Y(e, c);
    if (p === void 0) return ne("that group is gone");
||||||| 8cdb3c5
    const p = G(e, l);
    if (p === void 0) return te("that group is gone");
=======
    const p = V(e, c);
    if (p === void 0) return te("that group is gone");
>>>>>>> origin/main
    h = p.kind;
  }
  return at(h).includes(a.kind) ? { ok: !0 } : ne(
    h === null ? "every root group is a property" : `a ${h} cannot contain a ${a.kind}`
  );
}
<<<<<<< HEAD
const dt = (e, t) => e.length === t.length && e.every((s, r) => t[r] === s);
function Ir(e, t, s) {
  const { list: r, index: i } = ct(e), n = [...t], o = n[r.length];
  return r.length < n.length && dt(r, n.slice(0, r.length)) && typeof o == "number" && o > i && (n[r.length] = o - 1), { parent: n, index: dt(r, t) && s > i ? s - 1 : s };
||||||| 8cdb3c5
const lt = (e, t) => e.length === t.length && e.every((s, i) => t[i] === s);
function Ai(e, t, s) {
  const { list: i, index: r } = at(e), n = [...t], o = n[i.length];
  return i.length < n.length && lt(i, n.slice(0, i.length)) && typeof o == "number" && o > r && (n[i.length] = o - 1), { parent: n, index: lt(i, t) && s > r ? s - 1 : s };
=======
const lt = (e, t) => e.length === t.length && e.every((s, i) => t[i] === s);
function Ci(e, t, s) {
  const { list: i, index: r } = at(e), n = [...t], o = n[i.length];
  return i.length < n.length && lt(i, n.slice(0, i.length)) && typeof o == "number" && o > r && (n[i.length] = o - 1), { parent: n, index: lt(i, t) && s > r ? s - 1 : s };
>>>>>>> origin/main
}
<<<<<<< HEAD
function Pn(e, t, s, r) {
  const { index: i } = ct(t);
  if (dt(ct(t).list, s) && (r === i || r === i + 1)) return e;
  const n = Y(e, t), o = xt(e, t), { parent: a, index: c } = Ir(t, s, r);
  return lt(o, a, c, n);
||||||| 8cdb3c5
function pn(e, t, s, i) {
  const { index: r } = at(t);
  if (lt(at(t).list, s) && (i === r || i === r + 1)) return e;
  const n = G(e, t), o = $t(e, t), { parent: a, index: l } = Ai(t, s, i);
  return ot(o, a, l, n);
=======
function vn(e, t, s, i) {
  const { index: r } = at(t);
  if (lt(at(t).list, s) && (i === r || i === r + 1)) return e;
  const n = V(e, t), o = $t(e, t), { parent: a, index: c } = Ci(t, s, i);
  return ot(o, a, c, n);
>>>>>>> origin/main
}
<<<<<<< HEAD
const Cn = (e, t) => ({
||||||| 8cdb3c5
const fn = (e, t) => ({
=======
const bn = (e, t) => ({
>>>>>>> origin/main
  id: e,
  name: null,
  kind: t,
  floor_id: null,
  area_id: null,
  mix: "sum",
  null_handling: "zero",
  max_value: null,
  precision: null,
  gain: 1,
  adjacent: [],
  exit: !1,
<<<<<<< HEAD
  presence: Wt(),
||||||| 8cdb3c5
  presence: zt(),
=======
  presence: Ut(),
>>>>>>> origin/main
  stimuli: [],
  children: []
<<<<<<< HEAD
}), Tn = "presence", Wt = () => ({
||||||| 8cdb3c5
}), gn = "presence", zt = () => ({
=======
}), $n = "presence", Ut = () => ({
>>>>>>> origin/main
  gain: 1,
  envelope: null,
  activity_floor: null,
  attack: null,
  decay: null,
  sustain: null,
  release: null,
  impulse: null,
  retrigger: null,
  stack: null,
  unavailable: null,
  debounce: null
<<<<<<< HEAD
}), jr = (e) => typeof e == "string" ? e : e.id, Fr = (e) => typeof e != "string" && e.one_way, Hr = (e) => typeof e == "string" ? Mr : e.connection;
function ht(e) {
  const t = [], s = (r, i, n) => {
    t.push({ group: r, path: i, parent: n }), r.children.forEach((o, a) => s(o, [...i, "children", a], r));
||||||| 8cdb3c5
}), Oi = (e) => typeof e == "string" ? e : e.id, Pi = (e) => typeof e != "string" && e.one_way, Ci = (e) => typeof e == "string" ? Ei : e.connection;
function ct(e) {
  const t = [], s = (i, r, n) => {
    t.push({ group: i, path: r, parent: n }), i.children.forEach((o, a) => s(o, [...r, "children", a], i));
=======
}), Ti = (e) => typeof e == "string" ? e : e.id, Li = (e) => typeof e != "string" && e.one_way, Di = (e) => typeof e == "string" ? Pi : e.connection;
function ct(e) {
  const t = [], s = (i, r, n) => {
    t.push({ group: i, path: r, parent: n }), i.children.forEach((o, a) => s(o, [...r, "children", a], i));
>>>>>>> origin/main
  };
  return e.groups.forEach((r, i) => s(r, ["groups", i], null)), t;
}
function Us(e, t) {
  const s = [];
<<<<<<< HEAD
  for (const { group: r } of ht(e))
    if (r.id !== t)
      for (const i of r.adjacent ?? [])
        jr(i) === t && s.push({
          group: r,
||||||| 8cdb3c5
  for (const { group: i } of ct(e))
    if (i.id !== t)
      for (const r of i.adjacent ?? [])
        Oi(r) === t && s.push({
          group: i,
=======
  for (const { group: i } of ct(e))
    if (i.id !== t)
      for (const r of i.adjacent ?? [])
        Ti(r) === t && s.push({
          group: i,
>>>>>>> origin/main
          edge: {
            id: t,
<<<<<<< HEAD
            connection: Hr(i),
            one_way: Fr(i)
||||||| 8cdb3c5
            connection: Ci(r),
            one_way: Pi(r)
=======
            connection: Di(r),
            one_way: Li(r)
>>>>>>> origin/main
          }
        });
  return s;
}
<<<<<<< HEAD
const Ln = {
||||||| 8cdb3c5
const mn = {
=======
const yn = {
>>>>>>> origin/main
  enabled: !1,
  devices: [],
  envelope: null,
  threshold: 0.6,
  stay: 0.9,
  escape: 1e-3,
  scale: 3,
  floor: 0.05,
  stuck_after: 60,
  activity: { floor: 0.05 },
  people: [],
  carried: {
    prior: 0.7,
    flip: 300,
    recent: 120,
    nearby: 0.3,
    weights: { charging: -3, moving: 2, still_room_empty: -2, jitter: 1 }
  },
  scanner_areas: {}
<<<<<<< HEAD
}, Ur = (e) => ({
  tracker: e,
  name: null,
  kind: "other",
  companion: null,
  signals: { activity: null, steps: null, battery_state: null }
}), zr = () => ({ name: null, person: null, devices: [] }), F = (e) => ({
  ...Ln,
||||||| 8cdb3c5
}, X = (e) => ({
  ...mn,
=======
}, J = (e) => ({
  ...yn,
>>>>>>> origin/main
  ...e.presence ?? {}
<<<<<<< HEAD
}), Dn = (e) => ({
||||||| 8cdb3c5
}), vn = (e) => ({
=======
}), xn = (e) => ({
>>>>>>> origin/main
  id: e,
  label: null,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  stack: null,
  unavailable: null,
  debounce: null
<<<<<<< HEAD
}), Nn = (e) => e.label !== null && e.label.trim() !== "" ? e.label : e.id, Rn = (e) => ({
||||||| 8cdb3c5
}), bn = (e) => e.label !== null && e.label.trim() !== "" ? e.label : e.id, $n = (e) => ({
=======
}), wn = (e) => e.label !== null && e.label.trim() !== "" ? e.label : e.id, _n = (e) => ({
>>>>>>> origin/main
  entity: e,
  to: ["on"],
  mode: "sustained",
  edges: ["enter", "leave"],
  gain: 1,
  key: null,
  envelope: null,
  attack: null,
  decay: null,
  sustain: null,
  release: null,
  impulse: null,
  retrigger: null,
  stack: null,
  unavailable: null,
  debounce: null
<<<<<<< HEAD
}), as = (e, t) => t.precision ?? e.defaults.precision;
function wt(e, t) {
||||||| 8cdb3c5
}), rs = (e, t) => t.precision ?? e.defaults.precision;
function yt(e, t) {
=======
}), is = (e, t) => t.precision ?? e.defaults.precision;
function yt(e, t) {
>>>>>>> origin/main
  return e.toFixed(Math.min(100, Math.max(0, Math.trunc(t))));
}
<<<<<<< HEAD
function ls(e) {
  const t = /* @__PURE__ */ new Set(), s = (r) => {
    t.add(r.id), r.children.forEach(s);
||||||| 8cdb3c5
function ns(e) {
  const t = /* @__PURE__ */ new Set(), s = (i) => {
    t.add(i.id), i.children.forEach(s);
=======
function rs(e) {
  const t = /* @__PURE__ */ new Set(), s = (i) => {
    t.add(i.id), i.children.forEach(s);
>>>>>>> origin/main
  };
  return e.groups.forEach(s), t;
}
<<<<<<< HEAD
function Br(e) {
||||||| 8cdb3c5
function yn(e) {
=======
function kn(e) {
>>>>>>> origin/main
  return new Set(
<<<<<<< HEAD
    ht(e).filter(({ group: t }) => qe.has(t.kind)).map(({ group: t }) => t.id)
||||||| 8cdb3c5
    ct(e).filter(({ group: t }) => We.has(t.kind)).map(({ group: t }) => t.id)
=======
    ct(e).filter(({ group: t }) => Ve.has(t.kind)).map(({ group: t }) => t.id)
>>>>>>> origin/main
  );
}
<<<<<<< HEAD
function Wr(e) {
||||||| 8cdb3c5
function Ti(e) {
=======
function Mi(e) {
>>>>>>> origin/main
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
<<<<<<< HEAD
const Mn = (e) => new Set(e.envelopes.map((t) => t.id));
function Gr(e, t) {
  const s = Wr(t);
||||||| 8cdb3c5
const xn = (e) => new Set(e.envelopes.map((t) => t.id));
function Li(e, t) {
  const s = Ti(t);
=======
const Sn = (e) => new Set(e.envelopes.map((t) => t.id));
function Ni(e, t) {
  const s = Mi(t);
>>>>>>> origin/main
  if (!e.has(s)) return s;
  let r = 2;
  for (; e.has(`${s}_${r}`); ) r++;
  return `${s}_${r}`;
}
<<<<<<< HEAD
const Vr = (e, t) => Gr(ls(e), t), In = (e, t) => Gr(Mn(e), t);
function jn(e, t) {
  const s = [], r = (i) => {
    i.stimuli.some((n) => n.envelope === t) && s.push(i.id), i.children.forEach(r);
||||||| 8cdb3c5
const Di = (e, t) => Li(ns(e), t), wn = (e, t) => Li(xn(e), t);
function _n(e, t) {
  const s = [], i = (r) => {
    r.stimuli.some((n) => n.envelope === t) && s.push(r.id), r.children.forEach(i);
=======
const Ri = (e, t) => Ni(rs(e), t), En = (e, t) => Ni(Sn(e), t);
function An(e, t) {
  const s = [], i = (r) => {
    r.stimuli.some((n) => n.envelope === t) && s.push(r.id), r.children.forEach(i);
>>>>>>> origin/main
  };
  return e.groups.forEach(r), { defaults: e.defaults.envelope === t, groups: s };
}
<<<<<<< HEAD
function Fn(e, t, s) {
  const r = e.envelopes[t];
  if (!r || r.id === s) return e;
  const i = r.id, n = e.envelopes.map((a, c) => c === t ? { ...a, id: s } : a);
  if (e.envelopes.some((a, c) => c !== t && a.id === i)) return { ...e, envelopes: n };
||||||| 8cdb3c5
function Sn(e, t, s) {
  const i = e.envelopes[t];
  if (!i || i.id === s) return e;
  const r = i.id, n = e.envelopes.map((a, l) => l === t ? { ...a, id: s } : a);
  if (e.envelopes.some((a, l) => l !== t && a.id === r)) return { ...e, envelopes: n };
=======
function On(e, t, s) {
  const i = e.envelopes[t];
  if (!i || i.id === s) return e;
  const r = i.id, n = e.envelopes.map((a, c) => c === t ? { ...a, id: s } : a);
  if (e.envelopes.some((a, c) => c !== t && a.id === r)) return { ...e, envelopes: n };
>>>>>>> origin/main
  const o = (a) => ({
    ...a,
<<<<<<< HEAD
    stimuli: a.stimuli.map((c) => c.envelope === i ? { ...c, envelope: s } : c),
||||||| 8cdb3c5
    stimuli: a.stimuli.map((l) => l.envelope === r ? { ...l, envelope: s } : l),
=======
    stimuli: a.stimuli.map((c) => c.envelope === r ? { ...c, envelope: s } : c),
>>>>>>> origin/main
    children: a.children.map(o)
  });
  return {
    ...e,
    defaults: e.defaults.envelope === i ? { ...e.defaults, envelope: s } : e.defaults,
    envelopes: n,
    groups: e.groups.map(o)
  };
}
<<<<<<< HEAD
const L = (e, t) => Y(e, t), zs = (e, t) => Y(e, t), $e = (e) => e.slice(0, -2), qr = (e) => e[e.length - 2] === "stimuli" ? $e(e) : e, Kr = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function Yr(e, t) {
  const s = Kr(e, t.envelope), r = e.defaults, i = (n, o, a) => n ?? o ?? a;
||||||| 8cdb3c5
const L = (e, t) => G(e, t), Ot = (e, t) => G(e, t), me = (e) => e.slice(0, -2), Ri = (e) => e[e.length - 2] === "stimuli" ? me(e) : e, Mi = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function Ni(e, t) {
  const s = Mi(e, t.envelope), i = e.defaults, r = (n, o, a) => n ?? o ?? a;
=======
const L = (e, t) => V(e, t), js = (e, t) => V(e, t), ve = (e) => e.slice(0, -2), Ii = (e) => e[e.length - 2] === "stimuli" ? ve(e) : e, ji = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function Fi(e, t) {
  const s = ji(e, t.envelope), i = e.defaults, r = (n, o, a) => n ?? o ?? a;
>>>>>>> origin/main
  return {
    attack: i(t.attack, s?.attack, 0),
    decay: i(t.decay, s?.decay, 0),
    sustain: i(t.sustain, s?.sustain, 1),
    release: i(t.release, s?.release, 1800),
    impulse: i(t.impulse, s?.impulse, !1),
    retrigger: i(t.retrigger, s?.retrigger, r.retrigger),
    stack: i(t.stack, s?.stack, r.stack),
    unavailable: i(t.unavailable, s?.unavailable, r.unavailable),
    debounce: i(t.debounce, s?.debounce, r.debounce)
  };
}
<<<<<<< HEAD
const Xr = "activity_levels.mixer.expanded", Hn = (e, t) => e.length === t.length && e.every((s, r) => s === t[r]), Jr = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function Un(e) {
  return { expanded: new Set(e.groups.map((t) => t.id)), selection: Jr(e) };
||||||| 8cdb3c5
const Ii = "activity_levels.mixer.expanded", kn = (e, t) => e.length === t.length && e.every((s, i) => s === t[i]), ji = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function En(e) {
  return { expanded: new Set(e.groups.map((t) => t.id)), selection: ji(e) };
=======
const Hi = "activity_levels.mixer.expanded", Pn = (e, t) => e.length === t.length && e.every((s, i) => s === t[i]), Ui = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function Cn(e) {
  return { expanded: new Set(e.groups.map((t) => t.id)), selection: Ui(e) };
>>>>>>> origin/main
}
<<<<<<< HEAD
function ut(e, t) {
  const s = [], r = (i, n, o) => {
    i.forEach((a, c) => {
      const h = [...n, c], f = a.children.length > 0, p = f && t.expanded.has(a.id);
      s.push({ path: h, id: a.id, depth: o, hasChildren: f, expanded: p }), p && r(a.children, [...h, "children"], o + 1);
||||||| 8cdb3c5
function dt(e, t) {
  const s = [], i = (r, n, o) => {
    r.forEach((a, l) => {
      const h = [...n, l], f = a.children.length > 0, p = f && t.expanded.has(a.id);
      s.push({ path: h, id: a.id, depth: o, hasChildren: f, expanded: p }), p && i(a.children, [...h, "children"], o + 1);
=======
function dt(e, t) {
  const s = [], i = (r, n, o) => {
    r.forEach((a, c) => {
      const h = [...n, c], f = a.children.length > 0, p = f && t.expanded.has(a.id);
      s.push({ path: h, id: a.id, depth: o, hasChildren: f, expanded: p }), p && i(a.children, [...h, "children"], o + 1);
>>>>>>> origin/main
    });
  };
  return r(e.groups, ["groups"], 0), s;
}
<<<<<<< HEAD
function zn(e, t) {
  const s = ut(e, t), r = [], i = [], n = [], o = [];
||||||| 8cdb3c5
function An(e, t) {
  const s = dt(e, t), i = [], r = [], n = [], o = [];
=======
function Tn(e, t) {
  const s = dt(e, t), i = [], r = [], n = [], o = [];
>>>>>>> origin/main
  let a = 0;
  const c = (h) => {
    for (; o.length > 0 && o[o.length - 1].depth >= h; )
      o.pop().band.colEnd = i.length + 1;
  };
  for (const h of s) {
<<<<<<< HEAD
    if (c(h.depth), i.push("strip"), r.push(i.length), !h.hasChildren) continue;
||||||| 8cdb3c5
    if (l(h.depth), r.push("strip"), i.push(r.length), !h.hasChildren) continue;
=======
    if (c(h.depth), r.push("strip"), i.push(r.length), !h.hasChildren) continue;
>>>>>>> origin/main
    const f = L(e, h.path)?.name ?? h.id;
    if (h.expanded) {
      const p = { id: h.id, label: f, depth: h.depth, colStart: i.length, colEnd: 0, expanded: !0 };
      n.push(p), o.push({ band: p, depth: h.depth }), a = Math.max(a, h.depth + 1);
    } else
      i.push("tab"), n.push({
        id: h.id,
        label: f,
        depth: h.depth,
        colStart: i.length,
        colEnd: i.length + 1,
        expanded: !1
      });
  }
<<<<<<< HEAD
  return c(0), { columns: r, kinds: i, bands: n, rows: a };
||||||| 8cdb3c5
  return l(0), { columns: i, kinds: r, bands: n, rows: a };
=======
  return c(0), { columns: i, kinds: r, bands: n, rows: a };
>>>>>>> origin/main
}
<<<<<<< HEAD
function Bs(e, t) {
||||||| 8cdb3c5
function js(e, t) {
=======
function Fs(e, t) {
>>>>>>> origin/main
  switch (t.type) {
    case "toggle": {
      const s = new Set(e.expanded);
      return s.delete(t.id) || s.add(t.id), { ...e, expanded: s };
    }
    case "select":
      return { ...e, selection: t.path };
    case "arrow": {
      const s = ut(t.config, e);
      if (s.length === 0) return e;
<<<<<<< HEAD
      const r = e.selection, i = r === null ? -1 : s.findIndex((a) => Hn(a.path, r)), o = (((i === -1 && t.delta < 0 ? s.length : i) + t.delta) % s.length + s.length) % s.length;
||||||| 8cdb3c5
      const i = e.selection, r = i === null ? -1 : s.findIndex((a) => kn(a.path, i)), o = (((r === -1 && t.delta < 0 ? s.length : r) + t.delta) % s.length + s.length) % s.length;
=======
      const i = e.selection, r = i === null ? -1 : s.findIndex((a) => Pn(a.path, i)), o = (((r === -1 && t.delta < 0 ? s.length : r) + t.delta) % s.length + s.length) % s.length;
>>>>>>> origin/main
      return { ...e, selection: s[o].path };
    }
    case "home":
    case "end": {
      const s = ut(t.config, e);
      return s.length === 0 ? e : { ...e, selection: (t.type === "home" ? s[0] : s[s.length - 1]).path };
    }
    case "sync": {
<<<<<<< HEAD
      const { config: s } = t, r = ls(s), i = [...e.expanded].filter((a) => r.has(a)), n = i.length === e.expanded.size ? e.expanded : new Set(i), o = e.selection !== null && Y(s, e.selection) !== void 0 ? e.selection : Jr(s);
||||||| 8cdb3c5
      const { config: s } = t, i = ns(s), r = [...e.expanded].filter((a) => i.has(a)), n = r.length === e.expanded.size ? e.expanded : new Set(r), o = e.selection !== null && G(s, e.selection) !== void 0 ? e.selection : ji(s);
=======
      const { config: s } = t, i = rs(s), r = [...e.expanded].filter((a) => i.has(a)), n = r.length === e.expanded.size ? e.expanded : new Set(r), o = e.selection !== null && V(s, e.selection) !== void 0 ? e.selection : Ui(s);
>>>>>>> origin/main
      return { expanded: n, selection: o };
    }
  }
}
<<<<<<< HEAD
function Bn(e, t, s) {
||||||| 8cdb3c5
function On(e, t, s) {
=======
function Ln(e, t, s) {
>>>>>>> origin/main
  if (s === null) return t;
  const r = s[s.length - 2] === "stimuli" ? s.slice(0, -2) : s, i = new Set(t);
  let n = !1;
<<<<<<< HEAD
  for (let o = 2; o + 2 <= r.length; o += 2) {
    const a = Y(e, r.slice(0, o));
||||||| 8cdb3c5
  for (let o = 2; o + 2 <= i.length; o += 2) {
    const a = G(e, i.slice(0, o));
=======
  for (let o = 2; o + 2 <= i.length; o += 2) {
    const a = V(e, i.slice(0, o));
>>>>>>> origin/main
    if (a === void 0 || typeof a.id != "string") break;
    i.has(a.id) || (i.add(a.id), n = !0);
  }
  return n ? i : t;
}
<<<<<<< HEAD
function Wn(e) {
||||||| 8cdb3c5
function Pn(e) {
=======
function Dn(e) {
>>>>>>> origin/main
  let t;
  try {
<<<<<<< HEAD
    t = localStorage.getItem(Xr);
||||||| 8cdb3c5
    t = localStorage.getItem(Ii);
=======
    t = localStorage.getItem(Hi);
>>>>>>> origin/main
  } catch {
    return null;
  }
  if (t === null) return null;
  try {
    const s = JSON.parse(t);
    if (!Array.isArray(s)) return null;
<<<<<<< HEAD
    const r = ls(e);
    return new Set(s.filter((i) => typeof i == "string" && r.has(i)));
||||||| 8cdb3c5
    const i = ns(e);
    return new Set(s.filter((r) => typeof r == "string" && i.has(r)));
=======
    const i = rs(e);
    return new Set(s.filter((r) => typeof r == "string" && i.has(r)));
>>>>>>> origin/main
  } catch {
    return null;
  }
}
<<<<<<< HEAD
function Ws(e) {
||||||| 8cdb3c5
function Fs(e) {
=======
function Hs(e) {
>>>>>>> origin/main
  try {
<<<<<<< HEAD
    localStorage.setItem(Xr, JSON.stringify([...e]));
||||||| 8cdb3c5
    localStorage.setItem(Ii, JSON.stringify([...e]));
=======
    localStorage.setItem(Hi, JSON.stringify([...e]));
>>>>>>> origin/main
  } catch {
  }
}
<<<<<<< HEAD
function Gn(e) {
  const t = Un(e), s = Wn(e);
||||||| 8cdb3c5
function Cn(e) {
  const t = En(e), s = Pn(e);
=======
function Mn(e) {
  const t = Cn(e), s = Dn(e);
>>>>>>> origin/main
  return s === null ? t : { ...t, expanded: s };
}
<<<<<<< HEAD
const Zr = "activity_levels.mixer.edit";
function Vn() {
||||||| 8cdb3c5
const Fi = "activity_levels.mixer.edit";
function Tn() {
=======
const zi = "activity_levels.mixer.edit";
function Nn() {
>>>>>>> origin/main
  try {
<<<<<<< HEAD
    return localStorage.getItem(Zr) === "true";
||||||| 8cdb3c5
    return localStorage.getItem(Fi) === "true";
=======
    return localStorage.getItem(zi) === "true";
>>>>>>> origin/main
  } catch {
    return !1;
  }
}
<<<<<<< HEAD
function qn(e) {
||||||| 8cdb3c5
function Ln(e) {
=======
function Rn(e) {
>>>>>>> origin/main
  try {
<<<<<<< HEAD
    localStorage.setItem(Zr, e ? "true" : "false");
||||||| 8cdb3c5
    localStorage.setItem(Fi, e ? "true" : "false");
=======
    localStorage.setItem(zi, e ? "true" : "false");
>>>>>>> origin/main
  } catch {
  }
}
<<<<<<< HEAD
async function Kn(e, t) {
||||||| 8cdb3c5
async function Dn(e, t) {
=======
async function In(e, t) {
>>>>>>> origin/main
  try {
    const s = await t.validate(e);
    if (!s.ok)
      return {
        errors: s.errors,
        banner: { kind: "error", text: `${s.errors.length} problem(s) to fix before saving.` },
        reload: !1
      };
    const r = await t.save(e);
    return r.ok ? { errors: [], banner: { kind: "info", text: "Saved. Activity Levels is reloading." }, reload: !0 } : {
      errors: r.errors,
      banner: { kind: "error", text: r.errors[0]?.message ?? "Save failed" },
      reload: !1
    };
  } catch (s) {
    return { errors: null, banner: { kind: "error", text: `Save failed: ${s instanceof Error ? s.message : String(s)}` }, reload: !1 };
  }
}
const C = S`
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
  /* The mixer page: timeline, mixer and controls stacked, each as wide as the panel. */
  .rows {
    display: grid;
    grid-template-rows: auto auto auto;
    gap: 16px;
    padding: 16px;
    min-width: 0;
  }
  .rows > * {
    min-width: 0;
  }
  .layout.narrow {
    grid-template-columns: 1fr;
  }
  /* A tab that reads as a column of cards, each as wide as the panel. */
  .page {
    display: grid;
    gap: 16px;
    padding: 16px;
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
  /* The groups tree: flat rows, no borders, indent drawn as guides rather than padding. */
  .tree-row {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 36px;
    padding: 0 4px;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
  }
  .tree-row:hover {
    background: var(--secondary-background-color);
  }
  .tree-row.selected {
    background: color-mix(in srgb, var(--primary-color) 16%, transparent);
    color: var(--primary-color);
  }
  .tree-row:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .tree-row.dragging {
    opacity: 0.4;
  }
  .tree-row .guides {
    flex: 0 0 auto;
    width: calc(var(--al-indent, 0) * 16px);
    align-self: stretch;
    background-image: repeating-linear-gradient(
      to right,
      var(--divider-color) 0 1px,
      transparent 1px 16px
    );
  }
  .tree-row .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
    text-align: left;
    padding: 0;
    cursor: pointer;
  }
  .tree-row .actions {
    display: flex;
    flex: 0 0 auto;
    width: 108px;
    justify-content: flex-end;
    visibility: hidden;
  }
  .tree-row:hover .actions,
  .tree-row:focus-within .actions,
  .tree-row.selected .actions {
    visibility: visible;
  }
  .tree-row .caret {
    flex: 0 0 auto;
    width: 32px;
  }
  /* Where the node would land: a line above or below, a ring for "inside this group". */
  .tree-row.drop-before::before,
  .tree-row.drop-after::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary-color);
  }
  .tree-row.drop-before::before {
    top: -1px;
  }
  .tree-row.drop-after::after {
    bottom: -1px;
  }
  .tree-row.drop-into {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .tree-row.illegal {
    cursor: not-allowed;
    outline: 2px dashed var(--error-color, #db4437);
    outline-offset: -2px;
  }
  .tree-row .hint {
    color: var(--error-color, #db4437);
    font-size: 0.85em;
    white-space: nowrap;
  }
  .tree-row.placeholder {
    cursor: default;
    color: var(--secondary-text-color);
    font-size: 0.9em;
    min-height: 28px;
  }
  /* An editor panel: the header carries the section's name over its one-line definition. */
  ha-expansion-panel {
    margin-bottom: 8px;
  }
  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 0;
  }
  .panel-body {
    padding: 0 8px 8px;
  }
  /* The overrides panel's "N overridden" badge: same shape as a problem count, but neutral -
     this is not something wrong, just something changed from the preset. */
  .panel-header .badge {
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    margin-left: 8px;
  }
  /* Reachable by a screen reader, invisible to everyone else. */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  /* Anchored under the row's action column, which is where the button that opens it is. */
  .add-menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 2;
    background: var(--card-background-color, var(--primary-background-color));
    border: 1px solid var(--divider-color);
    border-radius: 6px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    min-width: 180px;
  }
  .add-menu button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
    text-align: left;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  .add-menu button:hover,
  .add-menu button:focus-visible {
    background: var(--secondary-background-color);
  }
`;
<<<<<<< HEAD
var Yn = Object.defineProperty, Xn = Object.getOwnPropertyDescriptor, k = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Xn(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Yn(t, s, i), i;
||||||| 8cdb3c5
var Rn = Object.defineProperty, Mn = Object.getOwnPropertyDescriptor, _ = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Mn(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Rn(t, s, r), r;
=======
var jn = Object.defineProperty, Fn = Object.getOwnPropertyDescriptor, _ = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Fn(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && jn(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const Jn = ["mixer", "groups", "envelopes", "defaults", "patterns", "presence", "code"], Zn = 2e3, Qn = 1e4, eo = 5 * 6e4, to = 1500, Gs = "activity_levels.timeline", so = ["24h", "7d", "30d"], ro = ["off", "24h", "7d"], Vs = { range: "7d", horizon: "24h", showChannels: !0, showLights: !0 };
function io(e) {
||||||| 8cdb3c5
const Nn = ["mixer", "groups", "envelopes", "defaults", "patterns", "presence", "code"], In = 2e3, jn = 1e4, Fn = 5 * 6e4, Hn = 1500, Hs = "activity_levels.timeline", Un = ["24h", "7d", "30d"], zn = ["off", "24h", "7d"], Us = { range: "7d", horizon: "24h", showChannels: !0, showLights: !0 };
function Bn(e) {
=======
const Hn = ["mixer", "groups", "envelopes", "defaults", "patterns", "presence", "code"], Un = 2e3, zn = 1e4, Bn = 5 * 6e4, Wn = 1500, Us = "activity_levels.timeline", Gn = ["24h", "7d", "30d"], Vn = ["off", "24h", "7d"], zs = { range: "7d", horizon: "24h", showChannels: !0, showLights: !0 };
function qn(e) {
>>>>>>> origin/main
  if (e === null) return null;
  const t = JSON.parse(e);
<<<<<<< HEAD
  return !so.includes(t.range) || !ro.includes(t.horizon) ? null : {
||||||| 8cdb3c5
  return !Un.includes(t.range) || !zn.includes(t.horizon) ? null : {
=======
  return !Gn.includes(t.range) || !Vn.includes(t.horizon) ? null : {
>>>>>>> origin/main
    range: t.range,
    horizon: t.horizon,
    showChannels: t.showChannels !== !1,
    showLights: t.showLights !== !1
  };
}
let $ = class extends b {
  constructor() {
<<<<<<< HEAD
    super(...arguments), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = Vs, this.codeStatus = null, this.yamlEditor = !0, this.tabFocus = 0, this.liveSeq = 0, this.profileAt = 0, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
||||||| 8cdb3c5
    super(...arguments), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = Us, this.codeStatus = null, this.yamlEditor = !0, this.tabFocus = 0, this.liveSeq = 0, this.profileAt = 0, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
=======
    super(...arguments), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = zs, this.codeStatus = null, this.yamlEditor = !0, this.tabFocus = 0, this.liveSeq = 0, this.profileAt = 0, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
>>>>>>> origin/main
      e.structural && (this.errors = []), this.tab !== "code" && (this.codeStatus = null), this.setConfig(e.detail, e.coalesceKey);
    }, this.onCodeStatus = (e) => {
      this.codeStatus = e.detail, this.errors = e.detail.errors;
    }, this.onNav = (e) => {
<<<<<<< HEAD
      const t = Bs(this.nav, e.detail);
      t.expanded !== this.nav.expanded && Ws(t.expanded), this.nav = t, this.selection = t.selection;
||||||| 8cdb3c5
      const t = js(this.nav, e.detail);
      t.expanded !== this.nav.expanded && Fs(t.expanded), this.nav = t, this.selection = t.selection;
=======
      const t = Fs(this.nav, e.detail);
      t.expanded !== this.nav.expanded && Hs(t.expanded), this.nav = t, this.selection = t.selection;
>>>>>>> origin/main
    }, this.onLiveRefresh = () => {
      this.pollLive();
    }, this.onRebuild = async (e) => {
      try {
<<<<<<< HEAD
        const { rebuilt: t } = await sn(this.hass, e.detail?.force === !0);
||||||| 8cdb3c5
        const { rebuilt: t } = await Ur(this.hass, e.detail?.force === !0);
=======
        const { rebuilt: t } = await Gr(this.hass, e.detail?.force === !0);
>>>>>>> origin/main
        this.banner = t ? { kind: "info", text: "Profile rebuilt." } : { kind: "warning", text: "Rebuild skipped (external profile)." }, await this.refreshProfile(!0);
      } catch (t) {
        this.banner = { kind: "error", text: `Could not rebuild the profile: ${t.message}` };
      }
    }, this.onSimToggle = async (e) => {
      const { gid: t, on: s } = e.detail;
      try {
<<<<<<< HEAD
        await un(this.hass, "switch", s ? "turn_on" : "turn_off", { entity_id: Nr(t) });
      } catch (r) {
||||||| 8cdb3c5
        await Yr(this.hass, "switch", s ? "turn_on" : "turn_off", { entity_id: Si(t) });
      } catch (i) {
=======
        await Qr(this.hass, "switch", s ? "turn_on" : "turn_off", { entity_id: Ai(t) });
      } catch (i) {
>>>>>>> origin/main
        this.banner = {
          kind: "error",
          text: `Could not ${s ? "start" : "stop"} the simulation for ${t}: ${r.message}`
        };
      }
    }, this.onTimelineRange = (e) => {
      this.timeline = e.detail;
      try {
<<<<<<< HEAD
        localStorage.setItem(Gs, JSON.stringify(e.detail));
||||||| 8cdb3c5
        localStorage.setItem(Hs, JSON.stringify(e.detail));
=======
        localStorage.setItem(Us, JSON.stringify(e.detail));
>>>>>>> origin/main
      } catch {
      }
    }, this.onTabsKeydown = (e) => {
      const t = this.tabs.length - 1;
      switch (e.key) {
        case "ArrowRight":
          this.focusTab((this.tabFocus + 1) % this.tabs.length);
          break;
        case "ArrowLeft":
          this.focusTab((this.tabFocus + t) % this.tabs.length);
          break;
        case "Home":
          this.focusTab(0);
          break;
        case "End":
          this.focusTab(t);
          break;
        case "Enter":
        case " ":
          this.selectTab(this.tabFocus);
          break;
        default:
          return;
      }
      e.preventDefault();
    };
  }
  get tabs() {
<<<<<<< HEAD
    return Jn;
||||||| 8cdb3c5
    return Nn;
=======
    return Hn;
>>>>>>> origin/main
  }
  async connectedCallback() {
    super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
<<<<<<< HEAD
    const { ok: e, missing: t, optionalMissing: s } = await yn();
||||||| 8cdb3c5
    const { ok: e, missing: t, optionalMissing: s } = await rn();
=======
    const { ok: e, missing: t, optionalMissing: s } = await ln();
>>>>>>> origin/main
    this.missing = e ? [] : t, this.yamlEditor = !s.includes("ha-yaml-editor"), await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer();
  }
  async load() {
    try {
<<<<<<< HEAD
      const { config: e, inferred: t, warnings: s } = await Ji(this.hass);
      this.draft = new On(e), this.inferred = t, this.warnings = s, this.syncTabs(), this.nav = Gn(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
||||||| 8cdb3c5
      const { config: e, inferred: t, warnings: s } = await Nr(this.hass);
      this.draft = new un(e), this.inferred = t, this.warnings = s, this.syncTabs(), this.nav = Cn(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
=======
      const { config: e, inferred: t, warnings: s } = await Hr(this.hass);
      this.draft = new mn(e), this.inferred = t, this.warnings = s, this.syncTabs(), this.nav = Mn(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
>>>>>>> origin/main
    } catch (e) {
      this.banner = { kind: "error", text: `Could not load configuration: ${e.message}` };
    }
  }
  /** Whether the Code tab is holding Save shut: unparseable text, or a live validation error. */
  get blocked() {
    const e = this.codeStatus;
    return e !== null && (!e.valid || e.errors.length > 0);
  }
  setConfig(e, t) {
    this.draft?.set(e, t), this.syncNav(), this.requestUpdate();
  }
  /**
   * Re-points the navigation at the current config after an edit, and keeps the shared
   * selection with it: a node that is gone can neither be a track nor be shown in the
   * editor pane, so the reducer falls back to the first root, and expanded ids that name
   * nothing are dropped. Nothing selected stays nothing selected, though - the reducer
   * falls back to a group, which is right after a deletion but would make the Groups tab's
   * editor pane open itself on the first edit the user makes with no row selected.
   */
  syncNav() {
    this.syncTabs();
    const e = this.draft?.config;
    if (!e) return;
<<<<<<< HEAD
    const t = this.selection, s = Bs({ ...this.nav, selection: t }, { type: "sync", config: e });
||||||| 8cdb3c5
    const t = this.selection, s = js({ ...this.nav, selection: t }, { type: "sync", config: e });
=======
    const t = this.selection, s = Fs({ ...this.nav, selection: t }, { type: "sync", config: e });
>>>>>>> origin/main
    this.nav = t === null ? { ...s, selection: null } : s, this.selection = this.nav.selection !== null && this.nav.selection.length > 0 ? this.nav.selection : null;
  }
  /**
   * Keeps the shown tab in the list. Every tab is listed all the time now, so `this.tab`
   * can no longer fall outside `this.tabs` in practice - but the type only promises `Tab`,
   * not membership in whatever `tabs` happens to be, so this stays the one place that
   * would notice if that ever stopped being true and send the tablist back to Mixer
   * instead of leaving the roving tabindex past the end of the list.
   */
  syncTabs() {
    this.tabs.includes(this.tab) || this.selectTab(0);
  }
  /**
   * One selection for both views. Picking a node in the tree also opens whatever the mixer
   * row needs open for it to be a visible track - a selected strip nobody can see is not a
   * shared selection.
   */
  select(e) {
    const t = this.draft?.config;
    if (this.selection = e, e === null || !t) {
      this.nav = { ...this.nav, selection: e };
      return;
    }
<<<<<<< HEAD
    const s = Bn(t, this.nav.expanded, e);
    s !== this.nav.expanded && Ws(s), this.nav = { expanded: s, selection: e };
||||||| 8cdb3c5
    const s = On(t, this.nav.expanded, e);
    s !== this.nav.expanded && Fs(s), this.nav = { expanded: s, selection: e };
=======
    const s = Ln(t, this.nav.expanded, e);
    s !== this.nav.expanded && Hs(s), this.nav = { expanded: s, selection: e };
>>>>>>> origin/main
  }
  async save() {
    const e = this.draft;
    if (e) {
      this.busy = !0, this.updatePolling();
      try {
<<<<<<< HEAD
        const t = await Kn(e.config, {
          validate: (s) => Dr(this.hass, s),
          save: (s) => Zi(this.hass, s)
||||||| 8cdb3c5
        const t = await Dn(e.config, {
          validate: (s) => _i(this.hass, s),
          save: (s) => Ir(this.hass, s)
=======
        const t = await In(e.config, {
          validate: (s) => Ei(this.hass, s),
          save: (s) => Ur(this.hass, s)
>>>>>>> origin/main
        });
<<<<<<< HEAD
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, to)), await this.load());
||||||| 8cdb3c5
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, Hn)), await this.load());
=======
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, Wn)), await this.load());
>>>>>>> origin/main
      } finally {
        this.busy = !1, this.updatePolling();
      }
    }
  }
  discard() {
    this.draft && (this.draft.reset(this.draft.original), this.syncNav(), this.errors = [], this.codeStatus = null, this.banner = null, this.requestUpdate());
  }
  undo() {
    this.draft?.undo(), this.codeStatus = null, this.syncNav(), this.requestUpdate();
  }
  redo() {
    this.draft?.redo(), this.codeStatus = null, this.syncNav(), this.requestUpdate();
  }
  toggleLive(e) {
    this.liveOn = e, !e && this.tab !== "mixer" && (this.live = null), this.updatePolling();
  }
  /** The Mixer and Patterns tabs both read the profile and the simulation log. */
  get patternsVisible() {
    return this.tab === "mixer" || this.tab === "patterns";
  }
  updatePolling() {
    const e = !this.busy && document.visibilityState === "visible";
    this.updateLivePolling(e), this.updateSimPolling(e);
  }
  /**
   * Starts or pauses the live poll to match the current conditions. It runs while the
   * toggle is on - or unconditionally on the Mixer tab, whose meters are the point of the
   * page - as long as no save is in flight (a reload is about to replace the config the
   * frame describes) and the tab is actually on screen. Pausing keeps the last frame, so
   * resuming redraws immediately rather than blanking the meters.
   */
  updateLivePolling(e) {
    if (!((this.liveOn || this.tab === "mixer") && e)) {
      this.clearLiveTimer();
      return;
    }
    this.liveTimer === void 0 && (this.pollLive(), this.liveTimer = window.setInterval(() => {
      this.pollLive();
<<<<<<< HEAD
    }, Zn));
||||||| 8cdb3c5
    }, In));
=======
    }, Un));
>>>>>>> origin/main
  }
  /** The simulation log moves at the pace of light switches, so it gets its own slower timer. */
  updateSimPolling(e) {
    if (!(this.patternsVisible && e)) {
      this.clearSimTimer();
      return;
    }
    this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => {
      this.pollSim();
<<<<<<< HEAD
    }, Qn));
||||||| 8cdb3c5
    }, jn));
=======
    }, zn));
>>>>>>> origin/main
  }
  async pollLive() {
    const e = ++this.liveSeq;
    try {
<<<<<<< HEAD
      const t = await Qi(this.hass);
||||||| 8cdb3c5
      const t = await jr(this.hass);
=======
      const t = await zr(this.hass);
>>>>>>> origin/main
      e === this.liveSeq && (this.live = t);
    } catch {
    }
  }
  async pollSim() {
    try {
<<<<<<< HEAD
      this.simLog = await rn(this.hass);
||||||| 8cdb3c5
      this.simLog = await zr(this.hass);
=======
      this.simLog = await Vr(this.hass);
>>>>>>> origin/main
    } catch {
    }
  }
  clearLiveTimer() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
  }
  clearSimTimer() {
    this.simTimer !== void 0 && (clearInterval(this.simTimer), this.simTimer = void 0);
  }
  /** Reads the profile at most every `PROFILE_TTL_MS`, or right now after a rebuild. */
  async refreshProfile(e = !1) {
<<<<<<< HEAD
    if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < eo))
||||||| 8cdb3c5
    if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < Fn))
=======
    if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < Bn))
>>>>>>> origin/main
      try {
<<<<<<< HEAD
        this.profileState = await tn(this.hass), this.profileAt = Date.now();
||||||| 8cdb3c5
        this.profileState = await Hr(this.hass), this.profileAt = Date.now();
=======
        this.profileState = await Wr(this.hass), this.profileAt = Date.now();
>>>>>>> origin/main
      } catch {
      }
  }
  restoreTimeline() {
    try {
<<<<<<< HEAD
      this.timeline = io(localStorage.getItem(Gs)) ?? Vs;
||||||| 8cdb3c5
      this.timeline = Bn(localStorage.getItem(Hs)) ?? Us;
=======
      this.timeline = qn(localStorage.getItem(Us)) ?? zs;
>>>>>>> origin/main
    } catch {
    }
  }
  selectTab(e) {
    const t = this.tabs[e];
    t !== void 0 && (t !== "mixer" && !this.liveOn && (this.live = null), this.tab = t, this.tabFocus = e, this.updatePolling(), this.refreshProfile());
  }
  /** Moves the roving tabindex, and the focus with it, without changing the shown tab. */
  focusTab(e) {
    this.tabFocus = e, this.updateComplete.then(() => {
      this.renderRoot.querySelectorAll('[role="tab"]')[e]?.focus();
    });
  }
  render() {
    if (this.missing.length) return this.renderMissing();
    const e = this.draft;
    return l`
      <ha-top-app-bar-fixed .narrow=${this.narrow}>
        <ha-menu-button slot="navigationIcon"></ha-menu-button>
        <div slot="title">Activity Levels</div>
        <div slot="actionItems" class="row">
          ${this.renderLiveToggle()}
          <ha-icon-button .disabled=${!e?.canUndo} @click=${this.undo} title="Undo">
            <ha-icon icon="mdi:undo"></ha-icon>
          </ha-icon-button>
          <ha-icon-button .disabled=${!e?.canRedo} @click=${this.redo} title="Redo">
            <ha-icon icon="mdi:redo"></ha-icon>
          </ha-icon-button>
          <ha-button appearance="plain" .disabled=${!e?.dirty || this.busy} @click=${this.discard}>Discard</ha-button>
          <ha-button .disabled=${!e?.dirty || this.busy || this.blocked} @click=${this.save}
            >${e?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()} ${this.renderInferred()} ${this.renderWarnings()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${this.tabs.map(
      (t, s) => l`<button
              type="button"
              id="tab-${t}"
              class="tab ${this.tab === t ? "active" : ""}"
              role="tab"
              aria-selected=${this.tab === t ? "true" : "false"}
              aria-controls="tabpanel"
              tabindex=${s === this.tabFocus ? 0 : -1}
              @click=${() => this.selectTab(s)}
            >
              ${t[0].toUpperCase() + t.slice(1)}
            </button>`
    )}
        </div>
        <div id="tabpanel" role="tabpanel" aria-labelledby="tab-${this.tab}">
          ${e ? this.renderTab(e) : l`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
  }
  /** The Mixer polls regardless, so offering a switch that changes nothing would be a lie. */
  renderLiveToggle() {
    return this.tab === "mixer" ? u : l`
      <span class="muted">Live</span>
      <ha-switch
        .checked=${this.liveOn}
        @change=${(e) => this.toggleLive(e.target.checked)}
      ></ha-switch>
    `;
  }
  renderMissing() {
    return l`
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
    const e = this.banner;
    return e ? l`<ha-alert
      alert-type=${e.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
      this.banner = null;
    }}
      >${e.text}</ha-alert
    >` : u;
  }
  /**
   * The one-time migration notice. A document written before kinds existed loads with them
   * guessed; nothing is written back until a human agrees, so this stays up until the next
   * Save — which is the moment the guesses become the document.
   */
  renderInferred() {
    const e = this.inferred.length;
    return e === 0 ? u : l`<ha-alert class="inferred-notice" alert-type="warning">
      ${e} ${e === 1 ? "group has" : "groups have"} an inferred kind — check them and save. Until you
      do, the kinds above are a guess and nothing has been written.
      <ha-button
        class="inferred-fix"
        slot="action"
        @click=${() => {
      this.selectTab(this.tabs.indexOf("groups")), this.select(this.inferred[0].split("/").map((t) => /^\d+$/.test(t) ? Number(t) : t));
    }}
        >Show me</ha-button
      >
    </ha-alert>`;
  }
  /**
   * What the document said that this schema cannot honour. Separate from the migration
   * notice above it on purpose: that one counts guesses somebody has to confirm, this one
   * quotes back a thing the file asked for and did not get, which no amount of confirming
   * will fix. Both can be up at once, and usually are.
   */
  renderWarnings() {
    return this.warnings.length === 0 ? u : l`<ha-alert class="config-warnings" alert-type="warning">
      <ul>
        ${this.warnings.map((e) => l`<li>${e}</li>`)}
      </ul>
    </ha-alert>`;
  }
  renderTab(e) {
    switch (this.tab) {
      case "mixer":
        return this.renderMixer(e);
      case "groups":
        return l`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree
            .hass=${this.hass}
            .config=${e.config}
            .selection=${this.selection}
            .errors=${this.errors}
            .live=${this.live}
            @al-select=${(t) => this.select(t.detail)}
            @al-change=${this.onChange}
          ></al-tree>
          <div>${this.renderEditor(e)}</div>
        </div>`;
      case "envelopes":
        return l`<al-envelopes
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
      case "defaults":
        return l`<al-defaults
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
      case "patterns":
        return l`<al-patterns
          .hass=${this.hass}
          .config=${e.config}
          .profileState=${this.profileState}
          .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild}
        ></al-patterns>`;
      case "code":
        return l`<al-code
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .available=${this.yamlEditor}
          @al-change=${this.onChange}
          @al-code-status=${this.onCodeStatus}
        ></al-code>`;
      case "presence":
        return l`<al-presence
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-presence>`;
    }
  }
  /**
   * The mixer page, three rows deep: the selected group's history and forecast on top, the
   * whole tree as one row of track strips in the middle, and everything that does not fit
   * on a strip below it. A stimulus is charted as its group - it has no series of its own.
   */
  renderMixer(e) {
    const t = e.config;
    if (t.groups.length === 0) return this.renderMixerEmpty();
<<<<<<< HEAD
    const s = this.nav.selection, r = s === null ? void 0 : L(t, qr(s));
||||||| 8cdb3c5
    const s = this.nav.selection, i = s === null ? void 0 : L(t, Ri(s));
    return c`<div class="rows">
=======
    const s = this.nav.selection, i = s === null ? void 0 : L(t, Ii(s));
>>>>>>> origin/main
    return l`<div class="rows">
      <al-timeline
        .hass=${this.hass}
        .groupId=${r?.id ?? null}
        .heading=${r ? r.name ?? r.id : ""}
        .range=${this.timeline.range}
        .horizon=${this.timeline.horizon}
        .showChannels=${this.timeline.showChannels}
        .showLights=${this.timeline.showLights}
        .live=${this.live}
        .maxValue=${r?.max_value ?? t.defaults.max_value}
        .profileState=${this.profileState}
        .minDays=${t.defaults.patterns?.min_days ?? $t}
        .paused=${this.busy}
        .narrow=${this.narrow}
        @al-timeline-range=${this.onTimelineRange}
      ></al-timeline>
      <al-mixer
        .hass=${this.hass}
        .config=${t}
        .nav=${this.nav}
        .errors=${this.errors}
        .live=${this.live}
        .narrow=${this.narrow}
        @al-nav=${this.onNav}
        @al-change=${this.onChange}
        @al-sim-toggle=${this.onSimToggle}
        @al-live-refresh=${this.onLiveRefresh}
      ></al-mixer>
      <al-strip-controls
        .hass=${this.hass}
        .config=${t}
        .path=${this.nav.selection}
        .errors=${this.errors}
        .live=${this.live}
        .profileState=${this.profileState}
        .simLog=${this.simLog}
        @al-change=${this.onChange}
        @al-rebuild=${this.onRebuild}
        @al-sim-toggle=${this.onSimToggle}
      ></al-strip-controls>
    </div>`;
  }
  /** Nothing to mix until there is at least one group: Groups is where that starts. */
  renderMixerEmpty() {
    return l`<div class="rows">
      <ha-card class="mixer-empty">
        <p class="muted">Add your first group in Groups.</p>
        <ha-button @click=${() => this.selectTab(this.tabs.indexOf("groups"))}>Go to Groups</ha-button>
      </ha-card>
    </div>`;
  }
  renderEditor(e) {
    const t = this.selection;
    return t ? t[t.length - 2] === "stimuli" ? l`<al-stimulus-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>` : l`<al-group-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          @al-change=${this.onChange}
<<<<<<< HEAD
          @al-select=${(r) => this.select(r.detail)}
||||||| 8cdb3c5
          @al-select=${(i) => this.select(i.detail)}
        ></al-group-editor>` : c`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
=======
          @al-select=${(i) => this.select(i.detail)}
>>>>>>> origin/main
        ></al-group-editor>` : l`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
  }
};
$.styles = [C];
k([
  d({ attribute: !1 })
], $.prototype, "hass", 2);
k([
  d({ type: Boolean })
], $.prototype, "narrow", 2);
k([
  m()
], $.prototype, "draft", 2);
k([
  m()
], $.prototype, "inferred", 2);
k([
  m()
], $.prototype, "warnings", 2);
k([
  m()
], $.prototype, "tab", 2);
k([
  m()
], $.prototype, "selection", 2);
k([
  m()
], $.prototype, "nav", 2);
k([
  m()
], $.prototype, "errors", 2);
k([
  m()
], $.prototype, "banner", 2);
k([
  m()
], $.prototype, "live", 2);
k([
  m()
], $.prototype, "liveOn", 2);
k([
  m()
], $.prototype, "busy", 2);
k([
  m()
], $.prototype, "missing", 2);
k([
  m()
], $.prototype, "profileState", 2);
k([
  m()
], $.prototype, "simLog", 2);
k([
  m()
], $.prototype, "timeline", 2);
k([
  m()
], $.prototype, "codeStatus", 2);
k([
  m()
], $.prototype, "yamlEditor", 2);
k([
  m()
], $.prototype, "tabFocus", 2);
<<<<<<< HEAD
$ = k([
  _("activity-levels-panel")
||||||| 8cdb3c5
$ = _([
  k("activity-levels-panel")
=======
$ = _([
  S("activity-levels-panel")
>>>>>>> origin/main
], $);
function X(e) {
  const t = Math.floor(e / 3600), s = Math.floor((e - t * 3600) / 60), r = Math.round((e - t * 3600 - s * 60) * 1e3) / 1e3, i = Math.floor(r), n = Math.round((r - i) * 1e3);
  return n === 0 ? { hours: t, minutes: s, seconds: i } : { hours: t, minutes: s, seconds: i, milliseconds: n };
}
function J(e) {
  if (!e) return null;
  const t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
  return Math.round(t * 1e3) / 1e3;
}
<<<<<<< HEAD
function ve(e) {
||||||| 8cdb3c5
function fe(e) {
=======
function ge(e) {
>>>>>>> origin/main
  if (e === 0) return "0s";
  const t = [];
  let s = e;
  const r = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [i, n] of r) {
    const o = Math.floor(s / n);
    o > 0 && (t.push(`${o}${i}`), s -= o * n);
  }
  return s = Math.round(s * 1e3) / 1e3, s > 0 && t.push(`${s}s`), t.join(" ");
}
<<<<<<< HEAD
const K = ["on", "off"], no = {
  automation: K,
  binary_sensor: K,
  fan: K,
  humidifier: K,
  input_boolean: K,
  light: K,
  remote: K,
  siren: K,
  switch: K,
  update: K,
  alarm_control_panel: [
    "disarmed",
    "armed_home",
    "armed_away",
    "armed_night",
    "armed_vacation",
    "arming",
    "pending",
    "triggered"
  ],
  climate: ["heat", "cool", "heat_cool", "auto", "dry", "fan_only", "off"],
  cover: ["open", "opening", "closing", "closed"],
  device_tracker: ["home", "not_home"],
  lock: ["locked", "unlocked", "locking", "unlocking", "open", "opening", "jammed"],
  media_player: ["playing", "paused", "buffering", "idle", "standby", "on", "off"],
  person: ["home", "not_home"],
  timer: ["active", "paused", "idle"],
  vacuum: ["cleaning", "returning", "docked", "idle", "paused", "error"],
  water_heater: ["eco", "electric", "performance", "high_demand", "heat_pump", "gas", "off"]
}, Qr = (e) => e.split(".")[0] ?? "", oo = (e) => {
  const t = e.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};
function cs(e, t, s) {
  const r = Qr(t), i = e?.states[t]?.attributes.device_class, n = [
    typeof i == "string" ? `component.${r}.entity_component.${i}.state.${s}` : null,
    `component.${r}.entity_component._.state.${s}`
  ];
  if (typeof e?.localize == "function")
    for (const o of n) {
      if (o === null) continue;
      const a = e.localize(o);
      if (typeof a == "string" && a !== "") return a;
    }
  return oo(s);
}
function ao(e, t, s) {
  const r = [...no[Qr(t)] ?? []];
  for (const i of [e?.states[t]?.state, ...s])
    typeof i == "string" && i !== "" && !r.includes(i) && r.push(i);
  return r.map((i) => ({ value: i, label: cs(e, t, i) }));
}
function ei(e, t) {
  const s = e?.states[t];
  if (!s) return null;
  const r = e?.formatEntityState?.(s);
  return typeof r == "string" && r !== "" ? r : cs(e, t, s.state);
}
function lo(e, t, s) {
  const r = s.length === 1 ? s[0] : void 0;
  if (r === void 0)
    return { enter: "When it enters the active states", leave: "When it leaves them" };
  const i = cs(e, t, r);
  return { enter: `When it becomes ${i}`, leave: `When it stops being ${i}` };
}
const g = (e) => e.join("/");
function Z(e, t) {
  const s = g(t), r = {};
  for (const i of e) {
    if (!i.path.startsWith(s + "/")) continue;
    const n = i.path.slice(s.length + 1);
    n.includes("/") || (r[n] = i.message);
||||||| 8cdb3c5
const m = (e) => e.join("/");
function xe(e, t) {
  const s = m(t), i = {};
  for (const r of e) {
    if (!r.path.startsWith(s + "/")) continue;
    const n = r.path.slice(s.length + 1);
    n.includes("/") || (i[n] = r.message);
=======
const G = ["on", "off"], Kn = {
  automation: G,
  binary_sensor: G,
  fan: G,
  humidifier: G,
  input_boolean: G,
  light: G,
  remote: G,
  siren: G,
  switch: G,
  update: G,
  alarm_control_panel: [
    "disarmed",
    "armed_home",
    "armed_away",
    "armed_night",
    "armed_vacation",
    "arming",
    "pending",
    "triggered"
  ],
  climate: ["heat", "cool", "heat_cool", "auto", "dry", "fan_only", "off"],
  cover: ["open", "opening", "closing", "closed"],
  device_tracker: ["home", "not_home"],
  lock: ["locked", "unlocked", "locking", "unlocking", "open", "opening", "jammed"],
  media_player: ["playing", "paused", "buffering", "idle", "standby", "on", "off"],
  person: ["home", "not_home"],
  timer: ["active", "paused", "idle"],
  vacuum: ["cleaning", "returning", "docked", "idle", "paused", "error"],
  water_heater: ["eco", "electric", "performance", "high_demand", "heat_pump", "gas", "off"]
}, Bi = (e) => e.split(".")[0] ?? "", Yn = (e) => {
  const t = e.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};
function ns(e, t, s) {
  const i = Bi(t), r = e?.states[t]?.attributes.device_class, n = [
    typeof r == "string" ? `component.${i}.entity_component.${r}.state.${s}` : null,
    `component.${i}.entity_component._.state.${s}`
  ];
  if (typeof e?.localize == "function")
    for (const o of n) {
      if (o === null) continue;
      const a = e.localize(o);
      if (typeof a == "string" && a !== "") return a;
    }
  return Yn(s);
}
function Xn(e, t, s) {
  const i = [...Kn[Bi(t)] ?? []];
  for (const r of [e?.states[t]?.state, ...s])
    typeof r == "string" && r !== "" && !i.includes(r) && i.push(r);
  return i.map((r) => ({ value: r, label: ns(e, t, r) }));
}
function Wi(e, t) {
  const s = e?.states[t];
  if (!s) return null;
  const i = e?.formatEntityState?.(s);
  return typeof i == "string" && i !== "" ? i : ns(e, t, s.state);
}
function Jn(e, t, s) {
  const i = s.length === 1 ? s[0] : void 0;
  if (i === void 0)
    return { enter: "When it enters the active states", leave: "When it leaves them" };
  const r = ns(e, t, i);
  return { enter: `When it becomes ${r}`, leave: `When it stops being ${r}` };
}
const m = (e) => e.join("/");
function we(e, t) {
  const s = m(t), i = {};
  for (const r of e) {
    if (!r.path.startsWith(s + "/")) continue;
    const n = r.path.slice(s.length + 1);
    n.includes("/") || (i[n] = r.message);
>>>>>>> origin/main
  }
  return r;
}
function _t(e, t) {
  const s = g(t);
  return e.filter((r) => r.path === s || r.path.startsWith(s + "/")).length;
}
<<<<<<< HEAD
function D(e, t, s) {
  const r = new CustomEvent("al-change", {
||||||| 8cdb3c5
function R(e, t, s) {
  const i = new CustomEvent("al-change", {
=======
function M(e, t, s) {
  const i = new CustomEvent("al-change", {
>>>>>>> origin/main
    detail: e,
    bubbles: !0,
    composed: !0
  });
  return t !== void 0 && (r.coalesceKey = t), s && (r.structural = !0), r;
}
<<<<<<< HEAD
const qs = (e, t) => new CustomEvent("al-code-status", { detail: { valid: e, errors: t }, bubbles: !0, composed: !0 }), ti = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), kt = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), co = () => kt("al-select-strip", null), Ks = (e) => kt("al-level-override", { value: e }), ho = (e) => kt("al-mute-toggle", { muted: e }), uo = () => kt("al-reset", null), Ys = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), po = () => new CustomEvent("al-live-refresh", { detail: null, bubbles: !0, composed: !0 }), fo = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), mo = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), si = (e = !1) => new CustomEvent("al-rebuild", { detail: { force: e }, bubbles: !0, composed: !0 }), go = (e) => new CustomEvent("al-map-select", { detail: { id: e }, bubbles: !0, composed: !0 });
function vo(e, t) {
  const s = [], r = (i, n, o, a, c) => {
    const h = g(n), f = i.children.length > 0 || i.stimuli.length > 0, p = f && t.has(h);
    if (s.push({ path: n, depth: o, kind: "group", group: i, expandable: f, expanded: p, posinset: a, setsize: c }), !t.has(h)) return;
    const v = i.children.length + i.stimuli.length;
    i.children.forEach((y, x) => r(y, [...n, "children", x], o + 1, x + 1, v)), i.stimuli.forEach(
||||||| 8cdb3c5
const zs = (e, t) => new CustomEvent("al-code-status", { detail: { valid: e, errors: t }, bubbles: !0, composed: !0 }), Hi = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), wt = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), Gn = () => wt("al-select-strip", null), Bs = (e) => wt("al-level-override", { value: e }), Wn = (e) => wt("al-mute-toggle", { muted: e }), Vn = () => wt("al-reset", null), Gs = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), qn = () => new CustomEvent("al-live-refresh", { detail: null, bubbles: !0, composed: !0 }), Kn = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), Yn = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), Ui = (e = !1) => new CustomEvent("al-rebuild", { detail: { force: e }, bubbles: !0, composed: !0 }), Xn = (e) => new CustomEvent("al-map-select", { detail: { id: e }, bubbles: !0, composed: !0 });
function Jn(e, t) {
  const s = [], i = (r, n, o, a, l) => {
    const h = m(n), f = r.children.length > 0 || r.stimuli.length > 0, p = f && t.has(h);
    if (s.push({ path: n, depth: o, kind: "group", group: r, expandable: f, expanded: p, posinset: a, setsize: l }), !t.has(h)) return;
    const v = r.children.length + r.stimuli.length;
    r.children.forEach((y, x) => i(y, [...n, "children", x], o + 1, x + 1, v)), r.stimuli.forEach(
=======
const Bs = (e, t) => new CustomEvent("al-code-status", { detail: { valid: e, errors: t }, bubbles: !0, composed: !0 }), Gi = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), wt = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), Zn = () => wt("al-select-strip", null), Ws = (e) => wt("al-level-override", { value: e }), Qn = (e) => wt("al-mute-toggle", { muted: e }), eo = () => wt("al-reset", null), Gs = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), to = () => new CustomEvent("al-live-refresh", { detail: null, bubbles: !0, composed: !0 }), so = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), io = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), Vi = (e = !1) => new CustomEvent("al-rebuild", { detail: { force: e }, bubbles: !0, composed: !0 }), ro = (e) => new CustomEvent("al-map-select", { detail: { id: e }, bubbles: !0, composed: !0 });
function no(e, t) {
  const s = [], i = (r, n, o, a, c) => {
    const h = m(n), f = r.children.length > 0 || r.stimuli.length > 0, p = f && t.has(h);
    if (s.push({ path: n, depth: o, kind: "group", group: r, expandable: f, expanded: p, posinset: a, setsize: c }), !t.has(h)) return;
    const v = r.children.length + r.stimuli.length;
    r.children.forEach((y, x) => i(y, [...n, "children", x], o + 1, x + 1, v)), r.stimuli.forEach(
>>>>>>> origin/main
      (y, x) => s.push({
        path: [...n, "stimuli", x],
        depth: o + 1,
        kind: "stimulus",
        stimulus: y,
        expandable: !1,
        expanded: !1,
        posinset: i.children.length + x + 1,
        setsize: v
      })
    ), f || s.push({
      path: n,
      depth: o + 1,
      kind: "placeholder",
      group: i,
      expandable: !1,
      expanded: !1,
      posinset: 1,
      setsize: 1
    });
  };
  return e.groups.forEach((i, n) => r(i, ["groups", n], 0, n + 1, e.groups.length)), s;
}
<<<<<<< HEAD
const ri = "activity_levels.groups_expanded";
function bo() {
||||||| 8cdb3c5
const zi = "activity_levels.groups_expanded";
function Zn() {
=======
const qi = "activity_levels.groups_expanded";
function oo() {
>>>>>>> origin/main
  try {
<<<<<<< HEAD
    const e = localStorage.getItem(ri), t = e === null ? null : JSON.parse(e);
||||||| 8cdb3c5
    const e = localStorage.getItem(zi), t = e === null ? null : JSON.parse(e);
=======
    const e = localStorage.getItem(qi), t = e === null ? null : JSON.parse(e);
>>>>>>> origin/main
    return Array.isArray(t) ? new Set(t.filter((s) => typeof s == "string")) : /* @__PURE__ */ new Set();
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
<<<<<<< HEAD
function Xs(e) {
||||||| 8cdb3c5
function Ws(e) {
=======
function Vs(e) {
>>>>>>> origin/main
  try {
<<<<<<< HEAD
    localStorage.setItem(ri, JSON.stringify([...e]));
||||||| 8cdb3c5
    localStorage.setItem(zi, JSON.stringify([...e]));
=======
    localStorage.setItem(qi, JSON.stringify([...e]));
>>>>>>> origin/main
  } catch {
  }
}
<<<<<<< HEAD
var $o = Object.defineProperty, yo = Object.getOwnPropertyDescriptor, ee = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? yo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && $o(t, s, i), i;
||||||| 8cdb3c5
var Qn = Object.defineProperty, eo = Object.getOwnPropertyDescriptor, V = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? eo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Qn(t, s, r), r;
=======
var ao = Object.defineProperty, lo = Object.getOwnPropertyDescriptor, K = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? lo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ao(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const et = (e) => e.stopPropagation(), He = (e) => {
||||||| 8cdb3c5
const Ze = (e) => e.stopPropagation(), Ie = (e) => {
=======
const Ze = (e) => e.stopPropagation(), je = (e) => {
>>>>>>> origin/main
  (e.key === "Enter" || e.key === " ") && e.stopPropagation();
<<<<<<< HEAD
}, xo = "mdi:flash", Ct = "text/plain", wo = 36;
let H = class extends b {
||||||| 8cdb3c5
}, to = "mdi:flash", Pt = "text/plain", so = 36;
let N = class extends b {
=======
}, co = "mdi:flash", Ot = "text/plain", ho = 36;
let I = class extends b {
>>>>>>> origin/main
  constructor() {
<<<<<<< HEAD
    super(...arguments), this.selection = null, this.errors = [], this.live = null, this.expanded = bo(), this.dragging = null, this.target = null, this.menu = null;
||||||| 8cdb3c5
    super(...arguments), this.selection = null, this.errors = [], this.live = null, this.expanded = Zn(), this.dragging = null, this.target = null, this.menu = null;
=======
    super(...arguments), this.selection = null, this.errors = [], this.live = null, this.expanded = oo(), this.dragging = null, this.target = null, this.menu = null;
>>>>>>> origin/main
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(e) {
<<<<<<< HEAD
    this.dispatchEvent(D(e, void 0, !0));
||||||| 8cdb3c5
    this.dispatchEvent(R(e, void 0, !0));
=======
    this.dispatchEvent(M(e, void 0, !0));
>>>>>>> origin/main
  }
  emitSelect(e) {
<<<<<<< HEAD
    this.dispatchEvent(ti(e));
||||||| 8cdb3c5
    this.dispatchEvent(Hi(e));
=======
    this.dispatchEvent(Gi(e));
>>>>>>> origin/main
  }
  isSelected(e) {
    return this.selection !== null && g(this.selection) === g(e);
  }
  select(e, t) {
    e.stopPropagation(), this.menu = null, this.emitSelect(t);
  }
  toggle(e) {
<<<<<<< HEAD
    const t = g(e), s = new Set(this.expanded);
    s.delete(t) || s.add(t), this.expanded = s, Xs(s);
||||||| 8cdb3c5
    const t = m(e), s = new Set(this.expanded);
    s.delete(t) || s.add(t), this.expanded = s, Ws(s);
=======
    const t = m(e), s = new Set(this.expanded);
    s.delete(t) || s.add(t), this.expanded = s, Vs(s);
>>>>>>> origin/main
  }
  /** Opens a group so a node just added inside it is visible rather than hidden. */
  open(e) {
    if (e.length === 0) return;
<<<<<<< HEAD
    const t = new Set(this.expanded).add(g(e));
    this.expanded = t, Xs(t);
||||||| 8cdb3c5
    const t = new Set(this.expanded).add(m(e));
    this.expanded = t, Ws(t);
=======
    const t = new Set(this.expanded).add(m(e));
    this.expanded = t, Vs(t);
>>>>>>> origin/main
  }
  /** The list a node lives in, and the slot after it: the two arguments a move needs. */
  listOf(e) {
    return { list: e.slice(0, -1), index: e[e.length - 1] };
  }
  addGroup(e, t, s) {
<<<<<<< HEAD
    const r = this.config;
    r && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(lt(r, e, t, Cn(Vr(r, s), s))), this.emitSelect([...e, t]));
||||||| 8cdb3c5
    const i = this.config;
    i && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(ot(i, e, t, fn(Di(i, s), s))), this.emitSelect([...e, t]));
=======
    const i = this.config;
    i && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(ot(i, e, t, bn(Ri(i, s), s))), this.emitSelect([...e, t]));
>>>>>>> origin/main
  }
  addStimulus(e, t) {
    const s = this.config;
    if (!s) return;
    this.menu = null, this.open(e);
<<<<<<< HEAD
    const r = [...e, "stimuli"];
    this.emitChange(lt(s, r, t, Rn(""))), this.emitSelect([...r, t]);
||||||| 8cdb3c5
    const i = [...e, "stimuli"];
    this.emitChange(ot(s, i, t, $n(""))), this.emitSelect([...i, t]);
=======
    const i = [...e, "stimuli"];
    this.emitChange(ot(s, i, t, _n(""))), this.emitSelect([...i, t]);
>>>>>>> origin/main
  }
  removeNode(e, t) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
<<<<<<< HEAD
    this.emitChange(xt(s, e));
    const r = $e(e);
    this.emitSelect(r.length ? r : null);
||||||| 8cdb3c5
    this.emitChange($t(s, e));
    const i = me(e);
    this.emitSelect(i.length ? i : null);
=======
    this.emitChange($t(s, e));
    const i = ve(e);
    this.emitSelect(i.length ? i : null);
>>>>>>> origin/main
  }
  /**
   * Applies a move if the rules allow it. Every way of moving a node — a drop, an
   * Alt+arrow — funnels through here, so a rule can only be enforced in one place.
   */
  tryMove(e, t, s) {
<<<<<<< HEAD
    const r = this.config;
    if (!r || !Hs(r, e, t, s).ok) return !1;
    const i = Pn(r, e, t, s);
    if (i === r) return !1;
    const { parent: n, index: o } = Ir(e, t, s);
    return this.open(n.slice(0, -1)), this.emitChange(i), this.emitSelect([...n, o]), !0;
||||||| 8cdb3c5
    const i = this.config;
    if (!i || !Ns(i, e, t, s).ok) return !1;
    const r = pn(i, e, t, s);
    if (r === i) return !1;
    const { parent: n, index: o } = Ai(e, t, s);
    return this.open(n.slice(0, -1)), this.emitChange(r), this.emitSelect([...n, o]), !0;
=======
    const i = this.config;
    if (!i || !Rs(i, e, t, s).ok) return !1;
    const r = vn(i, e, t, s);
    if (r === i) return !1;
    const { parent: n, index: o } = Ci(e, t, s);
    return this.open(n.slice(0, -1)), this.emitChange(r), this.emitSelect([...n, o]), !0;
>>>>>>> origin/main
  }
  onDragStart(e, t) {
<<<<<<< HEAD
    e.dataTransfer?.setData(Ct, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = { key: g(t), path: t };
||||||| 8cdb3c5
    e.dataTransfer?.setData(Pt, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = { key: m(t), path: t };
=======
    e.dataTransfer?.setData(Ot, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = { key: m(t), path: t };
>>>>>>> origin/main
  }
  onDragEnd() {
    this.dragging = null, this.target = null;
  }
  /**
   * Turns a pointer position into "before this row", "after it" or "inside it". The middle
   * third is *into*, and only for a group: a stimulus has nothing to be inside of.
   */
  whereIn(e, t) {
<<<<<<< HEAD
    const s = e.currentTarget.getBoundingClientRect(), r = s.height || wo, i = r / 3, n = e.clientY - s.top;
    return n < i ? "before" : n > r - i ? "after" : t.kind === "group" ? "into" : "after";
||||||| 8cdb3c5
    const s = e.currentTarget.getBoundingClientRect(), i = s.height || so, r = i / 3, n = e.clientY - s.top;
    return n < r ? "before" : n > i - r ? "after" : t.kind === "group" ? "into" : "after";
=======
    const s = e.currentTarget.getBoundingClientRect(), i = s.height || ho, r = i / 3, n = e.clientY - s.top;
    return n < r ? "before" : n > i - r ? "after" : t.kind === "group" ? "into" : "after";
>>>>>>> origin/main
  }
  /**
   * The destination list and slot a (row, where) pair names. *Into* means the end of the
   * list the dragged node itself belongs in — a group's `children`, a stimulus's `stimuli`
   * — so a stimulus can be dropped into a group that has none yet.
   */
  destination(e, t, s) {
    if (t === "into") {
      const n = s[s.length - 2] === "stimuli", o = n ? e.group?.stimuli : e.group?.children;
      return { toParent: [...e.path, n ? "stimuli" : "children"], index: o?.length ?? 0 };
    }
    const { list: r, index: i } = this.listOf(e.path);
    return { toParent: r, index: t === "before" ? i : i + 1 };
  }
  readPath(e) {
    try {
<<<<<<< HEAD
      const t = e.dataTransfer?.getData(Ct) ?? "", s = JSON.parse(t);
||||||| 8cdb3c5
      const t = e.dataTransfer?.getData(Pt) ?? "", s = JSON.parse(t);
=======
      const t = e.dataTransfer?.getData(Ot) ?? "", s = JSON.parse(t);
>>>>>>> origin/main
      return Array.isArray(s) ? s : null;
    } catch {
      return null;
    }
  }
  /**
   * What is being dragged, if it is ours. During `dragover` the browser holds the drag data
   * store in protected mode and `getData` returns "", so the path has to come from the state
   * set at `dragstart`; the *type list* stays readable, and that is what says whether the
   * thing being dragged over the tree is one of our rows rather than a file or a selection.
   */
  draggedPath(e) {
<<<<<<< HEAD
    return this.dragging === null ? null : e.dataTransfer?.types.includes(Ct) === !0 ? this.dragging.path : null;
||||||| 8cdb3c5
    return this.dragging === null ? null : e.dataTransfer?.types.includes(Pt) === !0 ? this.dragging.path : null;
=======
    return this.dragging === null ? null : e.dataTransfer?.types.includes(Ot) === !0 ? this.dragging.path : null;
>>>>>>> origin/main
  }
  onDragOver(e, t) {
    const s = this.config, r = this.draggedPath(e);
    if (!s || r === null) return;
    e.preventDefault();
<<<<<<< HEAD
    const i = this.whereIn(e, t), { toParent: n, index: o } = this.destination(t, i, r), a = Hs(s, r, n, o);
    e.dataTransfer && (e.dataTransfer.dropEffect = a.ok ? "move" : "none"), this.target = { key: g(t.path), where: i, verdict: a };
||||||| 8cdb3c5
    const r = this.whereIn(e, t), { toParent: n, index: o } = this.destination(t, r, i), a = Ns(s, i, n, o);
    e.dataTransfer && (e.dataTransfer.dropEffect = a.ok ? "move" : "none"), this.target = { key: m(t.path), where: r, verdict: a };
=======
    const r = this.whereIn(e, t), { toParent: n, index: o } = this.destination(t, r, i), a = Rs(s, i, n, o);
    e.dataTransfer && (e.dataTransfer.dropEffect = a.ok ? "move" : "none"), this.target = { key: m(t.path), where: r, verdict: a };
>>>>>>> origin/main
  }
  onDrop(e, t) {
    const s = this.dragging === null ? null : this.readPath(e) ?? this.dragging.path;
    if (s === null) return;
    e.preventDefault();
    const r = this.whereIn(e, t), { toParent: i, index: n } = this.destination(t, r, s);
    this.tryMove(s, i, n), this.onDragEnd();
  }
  /** Every node row in view order. The placeholder is not one, so it is not a stop. */
  rowElements() {
    return [...this.shadowRoot?.querySelectorAll(".row") ?? []];
  }
  /** Focuses a row by position, clamped: the ends of the tree hold rather than wrap. */
  focusAt(e) {
    const t = this.rowElements();
    t.length !== 0 && t[Math.max(0, Math.min(t.length - 1, e))]?.focus();
  }
  focusFrom(e, t) {
    const s = this.rowElements().indexOf(e);
    s >= 0 && this.focusAt(s + t);
  }
  focusPath(e) {
    this.shadowRoot?.querySelector(`.row[data-path="${g(e)}"]`)?.focus();
  }
  /**
   * The tree's own keyboard, which is what `role="tree"` promises: up and down walk the
   * rows in view, right opens a closed group and then steps into it, left closes an open
   * one and otherwise steps out to the parent, Home and End jump to the ends.
   */
  onNavigate(e, t) {
    switch (e.key) {
      case "Enter":
      case " ":
        this.emitSelect(t.path);
        break;
      case "ArrowDown":
        this.focusFrom(e.currentTarget, 1);
        break;
      case "ArrowUp":
        this.focusFrom(e.currentTarget, -1);
        break;
      case "ArrowRight":
        t.expandable && !t.expanded ? this.toggle(t.path) : t.expanded && this.focusFrom(e.currentTarget, 1);
        break;
      case "ArrowLeft":
<<<<<<< HEAD
        t.expanded ? this.toggle(t.path) : this.focusPath($e(t.path));
||||||| 8cdb3c5
        t.expanded ? this.toggle(t.path) : this.focusPath(me(t.path));
=======
        t.expanded ? this.toggle(t.path) : this.focusPath(ve(t.path));
>>>>>>> origin/main
        break;
      case "Home":
        this.focusAt(0);
        break;
      case "End":
        this.focusAt(this.rowElements().length - 1);
        break;
      case "Escape":
        if (this.menu === null) return;
        this.menu = null;
        break;
      default:
        return;
    }
    e.preventDefault();
  }
  /**
   * Alt+arrows do exactly what a drag does, with the arithmetic written out: up and down
   * reorder inside the list, right makes the node the last child of the sibling above it,
   * left makes it the next sibling of its parent. Anything the rules refuse simply does
   * not happen — the same verdict the drop would have given, without the cursor to show it.
   */
  onRowKeydown(e, t) {
    if (!e.altKey) {
      this.onNavigate(e, t);
      return;
    }
    const s = this.config;
    if (!s) return;
    const { list: r, index: i } = this.listOf(t.path);
    let n = !1;
    switch (e.key) {
      case "ArrowUp":
        n = this.tryMove(t.path, r, i - 1);
        break;
      case "ArrowDown":
        n = this.tryMove(t.path, r, i + 2);
        break;
      case "ArrowRight": {
<<<<<<< HEAD
        const o = t.kind === "group" ? Y(s, [...r, i - 1]) : void 0;
        o !== void 0 && (n = this.tryMove(t.path, [...r, i - 1, "children"], o.children.length));
||||||| 8cdb3c5
        const o = t.kind === "group" ? G(s, [...i, r - 1]) : void 0;
        o !== void 0 && (n = this.tryMove(t.path, [...i, r - 1, "children"], o.children.length));
=======
        const o = t.kind === "group" ? V(s, [...i, r - 1]) : void 0;
        o !== void 0 && (n = this.tryMove(t.path, [...i, r - 1, "children"], o.children.length));
>>>>>>> origin/main
        break;
      }
      case "ArrowLeft": {
        if (t.kind !== "group") break;
        const o = r.slice(0, -2), a = r[r.length - 2];
        typeof a == "number" && (n = this.tryMove(t.path, o, a + 1));
        break;
      }
      default:
        return;
    }
    e.preventDefault(), n && e.stopPropagation();
  }
  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  countdown(e) {
    const t = this.live?.now;
<<<<<<< HEAD
    return e === null || t === void 0 ? null : ve(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
||||||| 8cdb3c5
    return e === null || t === void 0 ? null : fe(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
=======
    return e === null || t === void 0 ? null : ge(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
>>>>>>> origin/main
  }
  /** Tooltip for a voice's phase chip: what it is doing, and how long that lasts. */
  voiceTitle(e) {
    const t = this.countdown(e.phase_ends);
    return t === null ? `Phase: ${e.phase}` : `Phase: ${e.phase}, ends in ${t}`;
  }
  /** Tooltip for a group's meter: the displayed value, the unrounded mix, and the next wake. */
  meterTitle(e, t, s) {
    const r = [`${e.value} of ${t}`, `raw ${e.raw_value.toFixed(3)}`], i = s ? this.countdown(e.next_wake) : null;
    return i !== null && r.push(`next wake in ${i}`), r.join(" · ");
  }
  /** What the row is called: the group's own name, or the entity's friendly name. */
  labelFor(e) {
    if (e.kind === "stimulus") {
      const t = e.stimulus;
      return (t === void 0 ? void 0 : this.hass?.states[t.entity])?.attributes.friendly_name ?? (t?.entity || "(no entity)");
    }
    return e.group?.name || e.group?.id || "(unnamed group)";
  }
  render() {
    const e = this.config;
    if (!e) return l`<ha-card><span class="muted">Loading…</span></ha-card>`;
    if (e.groups.length === 0) return this.renderEmpty();
<<<<<<< HEAD
    const t = vo(e, this.expanded), s = this.tabbableKey(t);
||||||| 8cdb3c5
    const t = Jn(e, this.expanded), s = this.tabbableKey(t);
    return c`
=======
    const t = no(e, this.expanded), s = this.tabbableKey(t);
>>>>>>> origin/main
    return l`
      <ha-card>
        <div class="tree" role="tree">
          ${t.map((r) => this.renderRow(e, r, s))}
        </div>
        <div class="footer">
          <ha-button @click=${() => this.addGroup(["groups"], e.groups.length, "property")}>
            Add property
          </ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEmpty() {
    return l`
      <ha-card>
        <p class="muted blurb">
          Nothing is configured yet. Everything starts with a property — the whole lot, inside and out —
          and inside it go the structures, floors, rooms and outdoor areas that make up your home.
        </p>
        <div class="footer">
          <ha-button @click=${() => this.addGroup(["groups"], 0, "property")}>Add your first property</ha-button>
        </div>
      </ha-card>
    `;
  }
  /**
   * The tree holds one tab stop, not one per row: the selected row, or the first row when
   * the selection is elsewhere or hidden inside something closed. Arrows do the rest.
   */
  tabbableKey(e) {
    const t = e.filter((r) => r.kind !== "placeholder"), s = this.selection === null ? null : g(this.selection);
    return s !== null && t.some((r) => g(r.path) === s) ? s : t.length === 0 ? "" : g(t[0].path);
  }
  renderRow(e, t, s) {
    if (t.kind === "placeholder")
      return l`<div class="tree-row placeholder" role="none" style="--al-indent: ${t.depth}">
        <span class="guides"></span>
        Nothing in here yet — add a stimulus or a group with the buttons on the row above.
      </div>`;
    const r = g(t.path), i = this.target?.key === r ? this.target : null, n = this.isSelected(t.path), o = [
      "row",
      "tree-row",
      n ? "selected" : "",
      this.dragging?.key === r ? "dragging" : "",
      i === null ? "" : i.verdict.ok ? `drop-${i.where}` : "illegal"
    ].filter(Boolean).join(" ");
    return l`<div
      class=${o}
      style="--al-indent: ${t.depth}"
      data-path=${r}
      role="treeitem"
      tabindex=${r === s ? "0" : "-1"}
      draggable="true"
      aria-level=${t.depth + 1}
      aria-setsize=${t.setsize}
      aria-posinset=${t.posinset}
      aria-selected=${n ? "true" : "false"}
      aria-expanded=${t.expandable ? t.expanded ? "true" : "false" : u}
      @click=${(a) => this.select(a, t.path)}
      @keydown=${(a) => this.onRowKeydown(a, t)}
      @dragstart=${(a) => this.onDragStart(a, t.path)}
      @dragend=${this.onDragEnd}
      @dragover=${(a) => this.onDragOver(a, t)}
      @drop=${(a) => this.onDrop(a, t)}
    >
      <span class="guides"></span>
      ${t.expandable ? l`<ha-icon-button
            class="caret"
            label=${t.expanded ? "Collapse" : "Expand"}
            title=${t.expanded ? "Collapse" : "Expand"}
<<<<<<< HEAD
            @keydown=${He}
||||||| 8cdb3c5
            @keydown=${Ie}
=======
            @keydown=${je}
>>>>>>> origin/main
            @click=${(a) => {
      a.stopPropagation(), this.toggle(t.path);
    }}
          >
            <ha-icon icon=${t.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </ha-icon-button>` : l`<span class="caret"></span>`}
      ${this.renderIcon(t)}
      <button
        type="button"
        class="label"
        title=${t.kind === "stimulus" ? t.stimulus?.entity ?? "" : "Edit this group"}
<<<<<<< HEAD
        @keydown=${He}
||||||| 8cdb3c5
        @keydown=${Ie}
=======
        @keydown=${je}
>>>>>>> origin/main
        @click=${(a) => this.select(a, t.path)}
      >
        ${this.labelFor(t)}
      </button>
<<<<<<< HEAD
      ${i !== null && !i.verdict.ok ? l`<span class="hint">${i.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === r ? this.renderAddMenu(t) : u}
||||||| 8cdb3c5
      ${r !== null && !r.verdict.ok ? c`<span class="hint">${r.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === i ? this.renderAddMenu(t) : u}
=======
      ${r !== null && !r.verdict.ok ? l`<span class="hint">${r.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === i ? this.renderAddMenu(t) : u}
>>>>>>> origin/main
    </div>`;
  }
  /**
   * The row's icon. A stimulus wears its entity's own, the way the more-info dialog
   * draws it -- device class and current state included, so an open door and a shut one
   * are different glyphs. `ha-state-icon` is optional, so a frontend that never
   * registered it falls back to the generic bolt rather than to nothing.
   */
  renderIcon(e) {
    if (e.kind === "group" && e.group)
<<<<<<< HEAD
      return l`<ha-icon icon=${ge[e.group.kind].icon}></ha-icon>`;
    const t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
    return t ? l`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : l`<ha-icon icon=${xo}></ha-icon>`;
||||||| 8cdb3c5
=======
      return l`<ha-icon icon=${fe[e.group.kind].icon}></ha-icon>`;
    const t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
    return t ? l`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : l`<ha-icon icon=${co}></ha-icon>`;
>>>>>>> origin/main
  }
  /** The live and validation read-out a row carries: a badge, and whatever the frame knows. */
  renderRowStatus(e, t) {
<<<<<<< HEAD
    const s = _t(this.errors, t.path), r = s ? l`<span class="badge" title="${s} problem(s) in this group">${s}</span>` : u;
||||||| 8cdb3c5
    const s = xt(this.errors, t.path), i = s ? c`<span class="badge" title="${s} problem(s) in this group">${s}</span>` : u;
=======
    const s = xt(this.errors, t.path), i = s ? l`<span class="badge" title="${s} problem(s) in this group">${s}</span>` : u;
>>>>>>> origin/main
    if (t.kind === "stimulus") {
<<<<<<< HEAD
      const c = t.stimulus, h = c === void 0 ? null : ei(this.hass, c.entity), f = Y(e, $e(t.path)), p = f === void 0 ? void 0 : this.live?.voices[f.id]?.find((v) => v.label === (c?.key ?? c?.entity));
      return l`${r}${h === null ? u : l`<span class="muted chip">${h}</span>`}
||||||| 8cdb3c5
      const l = t.stimulus, h = l === void 0 ? void 0 : this.hass?.states[l.entity], f = G(e, me(t.path)), p = f === void 0 ? void 0 : this.live?.voices[f.id]?.find((v) => v.label === (l?.key ?? l?.entity));
      return c`${i}${h ? c`<span class="muted chip">${h.state}</span>` : u}
      ${p ? c`<span class="chip phase ${p.phase}" title=${this.voiceTitle(p)}>${p.phase}</span>
=======
      const c = t.stimulus, h = c === void 0 ? null : Wi(this.hass, c.entity), f = V(e, ve(t.path)), p = f === void 0 ? void 0 : this.live?.voices[f.id]?.find((v) => v.label === (c?.key ?? c?.entity));
      return l`${i}${h === null ? u : l`<span class="muted chip">${h}</span>`}
>>>>>>> origin/main
      ${p ? l`<span class="chip phase ${p.phase}" title=${this.voiceTitle(p)}>${p.phase}</span>
            <span class="muted chip">${p.value.toFixed(2)}</span>` : u}`;
    }
<<<<<<< HEAD
    const i = t.group, n = i === void 0 ? void 0 : this.live?.groups[i.id], o = n?.max_value ?? i?.max_value ?? e.defaults.max_value, a = n ? Math.max(0, Math.min(100, n.value / (o || 1) * 100)) : 0;
    return l`${r}
||||||| 8cdb3c5
    const r = t.group, n = r === void 0 ? void 0 : this.live?.groups[r.id], o = n?.max_value ?? r?.max_value ?? e.defaults.max_value, a = n ? Math.max(0, Math.min(100, n.value / (o || 1) * 100)) : 0;
    return c`${i}
    ${n ? c`<div class="meter" title=${this.meterTitle(n, o, t.depth === 0)}>
=======
    const r = t.group, n = r === void 0 ? void 0 : this.live?.groups[r.id], o = n?.max_value ?? r?.max_value ?? e.defaults.max_value, a = n ? Math.max(0, Math.min(100, n.value / (o || 1) * 100)) : 0;
    return l`${i}
>>>>>>> origin/main
    ${n ? l`<div class="meter" title=${this.meterTitle(n, o, t.depth === 0)}>
            <div style="width: ${a}%"></div>
          </div>
          <span class="dot ${n.gated ? "gated" : ""}" title=${n.gated ? "Gate open" : "Gate closed"}></span>` : u}`;
  }
  renderActions(e) {
    const t = e.path;
    if (e.kind === "stimulus")
<<<<<<< HEAD
      return l`<div class="actions" @click=${et} @keydown=${He}>
||||||| 8cdb3c5
      return c`<div class="actions" @click=${Ze} @keydown=${Ie}>
=======
      return l`<div class="actions" @click=${Ze} @keydown=${je}>
>>>>>>> origin/main
        <ha-icon-button
          label="Delete stimulus"
          title="Delete stimulus"
          data-action="delete"
          @click=${() => this.removeNode(t, `stimulus "${this.labelFor(e)}"`)}
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </ha-icon-button>
      </div>`;
    const s = e.group;
<<<<<<< HEAD
    return s === void 0 ? l`<div class="actions"></div>` : l`<div class="actions" @click=${et} @keydown=${He}>
||||||| 8cdb3c5
    return s === void 0 ? c`<div class="actions"></div>` : c`<div class="actions" @click=${Ze} @keydown=${Ie}>
=======
    return s === void 0 ? l`<div class="actions"></div>` : l`<div class="actions" @click=${Ze} @keydown=${je}>
>>>>>>> origin/main
      <ha-icon-button
        label="Add stimulus"
        title="Add stimulus"
        data-action="add-stimulus"
        @click=${() => this.addStimulus(t, s.stimuli.length)}
      >
        <ha-icon icon="mdi:flash-outline"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        label="Add group"
        title="Add group"
        data-action="add-group"
        aria-haspopup="menu"
        aria-expanded=${this.menu === g(t) ? "true" : "false"}
        .disabled=${at(s.kind).length === 0}
        @click=${() => {
      this.menu = this.menu === g(t) ? null : g(t);
    }}
      >
        <ha-icon icon="mdi:folder-plus"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        label="Delete group"
        title="Delete group"
        data-action="delete"
        @click=${() => this.removeNode(t, `group "${s.name || s.id}" and everything in it`)}
      >
        <ha-icon icon="mdi:delete"></ha-icon>
      </ha-icon-button>
    </div>`;
  }
  /** The kinds this parent may contain, each with its own definition under the label. */
  renderAddMenu(e) {
    const t = e.group;
    return t === void 0 ? l`${u}` : l`<div
      class="add-menu"
      role="menu"
      draggable="false"
<<<<<<< HEAD
      @click=${et}
      @keydown=${He}
      @dragstart=${et}
||||||| 8cdb3c5
      @click=${Ze}
      @keydown=${Ie}
      @dragstart=${Ze}
=======
      @click=${Ze}
      @keydown=${je}
      @dragstart=${Ze}
>>>>>>> origin/main
    >
<<<<<<< HEAD
      ${at(t.kind).map(
||||||| 8cdb3c5
      ${nt(t.kind).map(
      (s) => c`<button
=======
      ${nt(t.kind).map(
>>>>>>> origin/main
      (s) => l`<button
          type="button"
          role="menuitem"
          data-kind=${s}
          @click=${() => this.addGroup([...e.path, "children"], t.children.length, s)}
        >
<<<<<<< HEAD
          <ha-icon icon=${ge[s].icon}></ha-icon>
||||||| 8cdb3c5
          <ha-icon icon=${pe[s].icon}></ha-icon>
=======
          <ha-icon icon=${fe[s].icon}></ha-icon>
>>>>>>> origin/main
          <span>
<<<<<<< HEAD
            <strong>${ge[s].label}</strong>
            <div class="muted">${ge[s].definition}</div>
||||||| 8cdb3c5
            <strong>${pe[s].label}</strong>
            <div class="muted">${pe[s].definition}</div>
=======
            <strong>${fe[s].label}</strong>
            <div class="muted">${fe[s].definition}</div>
>>>>>>> origin/main
          </span>
        </button>`
    )}
    </div>`;
  }
};
<<<<<<< HEAD
H.styles = [
  C,
  S`
||||||| 8cdb3c5
N.styles = [
  T,
  A`
=======
I.styles = [
  T,
  A`
>>>>>>> origin/main
      .tree {
        display: flex;
        flex-direction: column;
      }
      .footer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      ha-icon-button {
        --ha-icon-button-size: 32px;
        --mdc-icon-size: 18px;
      }
      .blurb {
        margin: 0 0 12px;
      }
      .add-menu .muted {
        font-size: 0.8em;
        white-space: normal;
      }
    `
];
<<<<<<< HEAD
ee([
||||||| 8cdb3c5
V([
=======
K([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], H.prototype, "hass", 2);
ee([
||||||| 8cdb3c5
], N.prototype, "hass", 2);
V([
=======
], I.prototype, "hass", 2);
K([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], H.prototype, "config", 2);
ee([
||||||| 8cdb3c5
], N.prototype, "config", 2);
V([
=======
], I.prototype, "config", 2);
K([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], H.prototype, "selection", 2);
ee([
||||||| 8cdb3c5
], N.prototype, "selection", 2);
V([
=======
], I.prototype, "selection", 2);
K([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], H.prototype, "errors", 2);
ee([
||||||| 8cdb3c5
], N.prototype, "errors", 2);
V([
=======
], I.prototype, "errors", 2);
K([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], H.prototype, "live", 2);
ee([
  m()
], H.prototype, "expanded", 2);
ee([
  m()
], H.prototype, "dragging", 2);
ee([
  m()
], H.prototype, "target", 2);
ee([
  m()
], H.prototype, "menu", 2);
H = ee([
  _("al-tree")
], H);
const ze = (e) => e == null || e === "" ? null : e;
function _o(e, t) {
||||||| 8cdb3c5
], N.prototype, "live", 2);
V([
  g()
], N.prototype, "expanded", 2);
V([
  g()
], N.prototype, "dragging", 2);
V([
  g()
], N.prototype, "target", 2);
V([
  g()
], N.prototype, "menu", 2);
N = V([
  k("al-tree")
], N);
const Bi = (e) => e.split(",").map((t) => t.trim()).filter((t) => t.length > 0), Ve = (e) => (e ?? []).join(", "), He = (e) => e == null || e === "" ? null : e;
function io(e, t) {
=======
], I.prototype, "live", 2);
K([
  g()
], I.prototype, "expanded", 2);
K([
  g()
], I.prototype, "dragging", 2);
K([
  g()
], I.prototype, "target", 2);
K([
  g()
], I.prototype, "menu", 2);
I = K([
  S("al-tree")
], I);
const Ue = (e) => e == null || e === "" ? null : e;
function uo(e, t) {
>>>>>>> origin/main
  if (t != null)
    switch (e) {
      case "duration":
        return X(t);
      case "boolean":
        return t ? "true" : "false";
      default:
        return t;
    }
}
<<<<<<< HEAD
function ko(e, t) {
||||||| 8cdb3c5
function ro(e, t) {
=======
function po(e, t) {
>>>>>>> origin/main
  if (t == null || t === "") return null;
  switch (e) {
    case "duration":
      return J(t);
    case "boolean":
      return t === !0 || t === "true";
    case "number":
    case "multiplier": {
      const s = typeof t == "number" ? t : Number(t);
      return Number.isNaN(s) ? null : s;
    }
    default:
      return String(t);
  }
}
<<<<<<< HEAD
function Eo(e, t) {
||||||| 8cdb3c5
function no(e, t) {
=======
function fo(e, t) {
>>>>>>> origin/main
  if (t == null) return "unset";
  switch (e) {
    case "duration":
<<<<<<< HEAD
      return ve(t);
||||||| 8cdb3c5
      return fe(t);
=======
      return ge(t);
>>>>>>> origin/main
    case "boolean":
      return t ? "Yes" : "No";
    case "multiplier":
<<<<<<< HEAD
      return ii(t);
||||||| 8cdb3c5
      return Gi(t);
=======
      return Ki(t);
>>>>>>> origin/main
    default:
      return String(t);
  }
}
<<<<<<< HEAD
const ii = (e) => `${e.toFixed(1)}×`, Js = ["kind", "floor_id", "area_id", "id", "name"], Zs = ["mix", "null_handling", "gain"], pt = {
||||||| 8cdb3c5
const Gi = (e) => `${e.toFixed(1)}×`, Vs = ["kind", "floor_id", "area_id", "id", "name"], qs = ["mix", "null_handling", "gain"], ht = {
=======
const Ki = (e) => `${e.toFixed(1)}×`, qs = ["kind", "floor_id", "area_id", "id", "name"], Ks = ["mix", "null_handling", "gain"], ht = {
>>>>>>> origin/main
  id: "ID",
  name: "Name",
  kind: "Kind",
  floor_id: "Home Assistant floor",
  area_id: "Home Assistant area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain",
  max_value: "Max value",
  precision: "Precision"
<<<<<<< HEAD
}, So = {
||||||| 8cdb3c5
}, oo = {
=======
}, go = {
>>>>>>> origin/main
  id: "Identifies the group and its entities. Changing it re-creates them.",
  name: "Friendly name; falls back to the area's name, then to the id.",
  kind: "What this is on the property. It decides what can go inside it.",
  floor_id: "Bind this to a Home Assistant floor to reuse its name.",
  area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
<<<<<<< HEAD
}, Gt = (e) => pt[e.name] ?? e.name, Vt = (e) => So[e.name] ?? "", Ao = [
||||||| 8cdb3c5
}, Bt = (e) => ht[e.name] ?? e.name, Gt = (e) => oo[e.name] ?? "", ao = [
=======
}, zt = (e) => ht[e.name] ?? e.name, Bt = (e) => go[e.name] ?? "", mo = [
>>>>>>> origin/main
  "id",
  "name",
  "kind",
  "floor_id",
  "area_id",
  "mix",
  "null_handling",
  "gain"
<<<<<<< HEAD
], Oo = [
||||||| 8cdb3c5
], lo = [
=======
], vo = [
>>>>>>> origin/main
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
<<<<<<< HEAD
], Po = [
||||||| 8cdb3c5
], co = [
=======
], bo = [
>>>>>>> origin/main
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
<<<<<<< HEAD
], Co = "How this group's stimuli and children combine into one level.", To = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", Lo = "How loudly 'somebody is here' plays in this group's mix.", ni = { number: { min: 0.1, step: 0.1, mode: "box" } }, oi = {
||||||| 8cdb3c5
], ho = "How this group's stimuli and children combine into one level.", uo = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", po = "How loudly 'somebody is here' plays in this group's mix.", Wi = { number: { min: 0.1, step: 0.1, mode: "box" } }, Vi = {
=======
], $o = "How this group's stimuli and children combine into one level.", yo = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", xo = "How loudly 'somebody is here' plays in this group's mix.", Yi = { number: { min: 0.1, step: 0.1, mode: "box" } }, Xi = {
>>>>>>> origin/main
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
<<<<<<< HEAD
}, Do = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, ai = (e, t, s) => {
||||||| 8cdb3c5
}, fo = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, qi = (e, t, s) => {
=======
}, wo = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, Ji = (e, t, s) => {
>>>>>>> origin/main
  switch (e) {
    case "null_handling":
      return t.mix === "mean";
    case "gain":
      return !s;
    case "floor_id":
      return t.kind === "floor";
    case "area_id":
<<<<<<< HEAD
      return qe.has(t.kind);
||||||| 8cdb3c5
      return We.has(t.kind);
=======
      return Ve.has(t.kind);
>>>>>>> origin/main
    default:
      return !0;
  }
<<<<<<< HEAD
}, No = (e, t) => {
  const s = [...at(t)];
||||||| 8cdb3c5
}, go = (e, t) => {
  const s = [...nt(t)];
=======
}, _o = (e, t) => {
  const s = [...nt(t)];
>>>>>>> origin/main
  return s.includes(e.kind) || s.push(e.kind), {
    select: {
      mode: "dropdown",
<<<<<<< HEAD
      options: s.map((r) => ({ value: r, label: ge[r].label }))
||||||| 8cdb3c5
      options: s.map((i) => ({ value: i, label: pe[i].label }))
=======
      options: s.map((i) => ({ value: i, label: fe[i].label }))
>>>>>>> origin/main
    }
  };
};
function qt(e, t, s, r, i = null) {
  const n = {
    id: { text: {} },
    name: { text: {} },
<<<<<<< HEAD
    kind: No(e, i),
||||||| 8cdb3c5
    kind: go(e, r),
=======
    kind: _o(e, r),
>>>>>>> origin/main
    floor_id: { floor: {} },
    area_id: { area: {} },
<<<<<<< HEAD
    mix: { select: { mode: "dropdown", options: Oo } },
    null_handling: { select: { mode: "dropdown", options: Po } },
    gain: Do
||||||| 8cdb3c5
    mix: { select: { mode: "dropdown", options: lo } },
    null_handling: { select: { mode: "dropdown", options: co } },
    gain: fo
=======
    mix: { select: { mode: "dropdown", options: vo } },
    null_handling: { select: { mode: "dropdown", options: bo } },
    gain: wo
>>>>>>> origin/main
  };
<<<<<<< HEAD
  return s.filter((o) => ai(o, e, t)).map((o) => ({ name: o, selector: n[o] }));
||||||| 8cdb3c5
  return s.filter((o) => qi(o, e, t)).map((o) => ({ name: o, selector: n[o] }));
=======
  return s.filter((o) => Ji(o, e, t)).map((o) => ({ name: o, selector: n[o] }));
>>>>>>> origin/main
}
<<<<<<< HEAD
function Kt(e, t, s, r) {
  const i = {
||||||| 8cdb3c5
function Vt(e, t, s, i) {
  const r = {
=======
function Gt(e, t, s, i) {
  const r = {
>>>>>>> origin/main
    id: e.id,
    name: e.name ?? "",
    kind: e.kind,
    floor_id: e.floor_id,
    area_id: e.area_id,
    mix: e.mix,
    null_handling: e.null_handling,
    gain: e.gain
  };
  return Object.fromEntries(
    s.filter(
<<<<<<< HEAD
      (n) => ai(n, e, t) && !(n === "area_id" && e.area_id === null) && !(n === "floor_id" && e.floor_id === null)
    ).map((n) => [n, i[n]])
||||||| 8cdb3c5
      (n) => qi(n, e, t) && !(n === "area_id" && e.area_id === null) && !(n === "floor_id" && e.floor_id === null)
    ).map((n) => [n, r[n]])
=======
      (n) => Ji(n, e, t) && !(n === "area_id" && e.area_id === null) && !(n === "floor_id" && e.floor_id === null)
    ).map((n) => [n, r[n]])
>>>>>>> origin/main
  );
}
<<<<<<< HEAD
function Yt(e, t) {
||||||| 8cdb3c5
function qt(e, t) {
=======
function Vt(e, t) {
>>>>>>> origin/main
  const s = { ...e };
<<<<<<< HEAD
  return "id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = ze(t.name)), "kind" in t && typeof t.kind == "string" && (s.kind = t.kind), "floor_id" in t && (s.floor_id = ze(t.floor_id)), "area_id" in t && (s.area_id = ze(t.area_id)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), s;
||||||| 8cdb3c5
  return "id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = He(t.name)), "kind" in t && typeof t.kind == "string" && (s.kind = t.kind), "floor_id" in t && (s.floor_id = He(t.floor_id)), "area_id" in t && (s.area_id = He(t.area_id)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), s;
=======
  return "id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = Ue(t.name)), "kind" in t && typeof t.kind == "string" && (s.kind = t.kind), "floor_id" in t && (s.floor_id = Ue(t.floor_id)), "area_id" in t && (s.area_id = Ue(t.area_id)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), s;
>>>>>>> origin/main
}
<<<<<<< HEAD
const Xt = (e, t) => Ao.find((s) => e[s] !== t[s]), Ro = (e) => e.id === "" || new RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function li(e, t, s, r, i) {
||||||| 8cdb3c5
const Kt = (e, t) => ao.find((s) => e[s] !== t[s]), mo = (e) => e.id === "" || new RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function Ki(e, t, s, i, r) {
=======
const qt = (e, t) => mo.find((s) => e[s] !== t[s]), ko = (e) => e.id === "" || new RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function Zi(e, t, s, i, r) {
>>>>>>> origin/main
  const n = { ...e, [t]: s };
<<<<<<< HEAD
  return s === null || (Ro(e) && (n.id = i ? Vr(i, s) : Wr(s)), e.name === null && r !== null && (n.name = r)), n;
||||||| 8cdb3c5
  return s === null || (mo(e) && (n.id = r ? Di(r, s) : Ti(s)), e.name === null && i !== null && (n.name = i)), n;
=======
  return s === null || (ko(e) && (n.id = r ? Ri(r, s) : Mi(s)), e.name === null && i !== null && (n.name = i)), n;
>>>>>>> origin/main
}
<<<<<<< HEAD
const Mo = (e, t, s, r) => li(e, "area_id", t, s, r), Io = (e, t, s, r) => li(e, "floor_id", t, s, r), ci = "activity_levels.panels";
function di() {
||||||| 8cdb3c5
const vo = (e, t, s, i) => Ki(e, "area_id", t, s, i), bo = (e, t, s, i) => Ki(e, "floor_id", t, s, i), Yi = "activity_levels.panels";
function Xi() {
=======
const So = (e, t, s, i) => Zi(e, "area_id", t, s, i), Eo = (e, t, s, i) => Zi(e, "floor_id", t, s, i), Qi = "activity_levels.panels";
function er() {
>>>>>>> origin/main
  try {
<<<<<<< HEAD
    const e = localStorage.getItem(ci), t = e === null ? null : JSON.parse(e);
||||||| 8cdb3c5
    const e = localStorage.getItem(Yi), t = e === null ? null : JSON.parse(e);
=======
    const e = localStorage.getItem(Qi), t = e === null ? null : JSON.parse(e);
>>>>>>> origin/main
    return t === null || typeof t != "object" || Array.isArray(t) ? {} : t;
  } catch {
    return {};
  }
}
<<<<<<< HEAD
function jo(e, t) {
  const s = di()[e];
||||||| 8cdb3c5
function $o(e, t) {
  const s = Xi()[e];
=======
function Ao(e, t) {
  const s = er()[e];
>>>>>>> origin/main
  return typeof s == "boolean" ? s : t;
}
<<<<<<< HEAD
function Fo(e, t) {
||||||| 8cdb3c5
function yo(e, t) {
=======
function Oo(e, t) {
>>>>>>> origin/main
  try {
<<<<<<< HEAD
    localStorage.setItem(ci, JSON.stringify({ ...di(), [e]: t }));
||||||| 8cdb3c5
    localStorage.setItem(Yi, JSON.stringify({ ...Xi(), [e]: t }));
=======
    localStorage.setItem(Qi, JSON.stringify({ ...er(), [e]: t }));
>>>>>>> origin/main
  } catch {
  }
}
<<<<<<< HEAD
function be(e, t, s, r, i, n, o = u) {
||||||| 8cdb3c5
function ge(e, t, s, i, r, n, o = u) {
=======
function me(e, t, s, i, r, n, o = u) {
>>>>>>> origin/main
  const a = `${e}:${t}`;
  return l`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${t}
<<<<<<< HEAD
    ?expanded=${jo(a, i)}
    @expanded-changed=${(c) => {
    Fo(a, c.detail.expanded);
||||||| 8cdb3c5
    ?expanded=${$o(a, r)}
    @expanded-changed=${(l) => {
    yo(a, l.detail.expanded);
=======
    ?expanded=${Ao(a, r)}
    @expanded-changed=${(c) => {
    Oo(a, c.detail.expanded);
>>>>>>> origin/main
  }}
  >
    <div slot="header" class="panel-header">
      <span>${s} ${o}</span>
      <div class="muted">${r}</div>
    </div>
    <div class="panel-body">${n}</div>
  </ha-expansion-panel>`;
}
<<<<<<< HEAD
var Ho = Object.defineProperty, Uo = Object.getOwnPropertyDescriptor, Et = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Uo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Ho(t, s, i), i;
||||||| 8cdb3c5
var xo = Object.defineProperty, wo = Object.getOwnPropertyDescriptor, _t = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? wo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && xo(t, s, r), r;
=======
var Po = Object.defineProperty, Co = Object.getOwnPropertyDescriptor, _t = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Co(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Po(t, s, r), r;
>>>>>>> origin/main
};
let Te = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  get group() {
    return this.config && this.path ? L(this.config, this.path) : void 0;
  }
  /** Normalized, so the table never has to care which spelling the document used. */
  get edges() {
    return (this.group?.adjacent ?? []).map((e) => ({
<<<<<<< HEAD
      id: jr(e),
      connection: Hr(e),
      one_way: Fr(e)
||||||| 8cdb3c5
      id: Oi(e),
      connection: Ci(e),
      one_way: Pi(e)
=======
      id: Ti(e),
      connection: Di(e),
      one_way: Li(e)
>>>>>>> origin/main
    }));
  }
  emit(e) {
    const { config: t, path: s } = this;
<<<<<<< HEAD
    !t || !s || this.dispatchEvent(D(O(t, [...s, "adjacent"], e), void 0, !0));
||||||| 8cdb3c5
    !t || !s || this.dispatchEvent(R(P(t, [...s, "adjacent"], e), void 0, !0));
=======
    !t || !s || this.dispatchEvent(M(P(t, [...s, "adjacent"], e), void 0, !0));
>>>>>>> origin/main
  }
  edit(e, t) {
    this.emit(this.edges.map((s, r) => r === e ? { ...s, ...t } : s));
  }
  nameOf(e) {
    return (this.config ? ht(this.config).find(({ group: s }) => s.id === e) : void 0)?.group.name ?? e;
  }
  /** Areas and outside areas, minus this one and minus every group already on the table. */
  candidates() {
    const e = this.group;
    if (!this.config || !e) return [];
    const t = /* @__PURE__ */ new Set([
      e.id,
      ...this.edges.map((s) => s.id),
      ...Us(this.config, e.id).map((s) => s.group.id)
    ]);
<<<<<<< HEAD
    return ht(this.config).map(({ group: s }) => s).filter((s) => qe.has(s.kind) && !t.has(s.id));
||||||| 8cdb3c5
    return ct(this.config).map(({ group: s }) => s).filter((s) => We.has(s.kind) && !t.has(s.id));
=======
    return ct(this.config).map(({ group: s }) => s).filter((s) => Ve.has(s.kind) && !t.has(s.id));
>>>>>>> origin/main
  }
  errorFor(e) {
    const t = `${(this.path ?? []).join("/")}/adjacent/${e}`;
    return this.errors.find((s) => s.path === t || s.path.startsWith(`${t}/`))?.message;
  }
  render() {
    const e = this.group;
    if (!this.config || !e) return u;
<<<<<<< HEAD
    const t = Us(this.config, e.id), s = this.candidates();
||||||| 8cdb3c5
    const t = Is(this.config, e.id), s = this.candidates();
    return c`
=======
    const t = Is(this.config, e.id), s = this.candidates();
>>>>>>> origin/main
    return l`
      <table>
        <thead>
          <tr>
            <th scope="col">Group</th>
            <th scope="col">Connection</th>
            <th scope="col">Both ways</th>
            <th scope="col"><span class="visually-hidden">Remove</span></th>
          </tr>
        </thead>
        <tbody>
<<<<<<< HEAD
          ${this.edges.map((r, i) => this.renderOwn(r, i))}
          ${t.map(({ group: r, edge: i }) => this.renderDeclared(r, i))}
||||||| 8cdb3c5
          ${this.edges.map((i, r) => this.renderOwn(i, r))}
          ${t.map(({ group: i, edge: r }) => this.renderDeclared(i, r))}
          ${this.edges.length === 0 && t.length === 0 ? c`<tr class="empty">
=======
          ${this.edges.map((i, r) => this.renderOwn(i, r))}
          ${t.map(({ group: i, edge: r }) => this.renderDeclared(i, r))}
>>>>>>> origin/main
          ${this.edges.length === 0 && t.length === 0 ? l`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>` : u}
        </tbody>
      </table>
      ${s.length === 0 ? u : l`<select
            class="add-edge"
            aria-label="Add an adjacent group"
            .value=${""}
<<<<<<< HEAD
            @change=${(r) => {
      const i = r.target;
      i.value !== "" && (this.emit([...this.edges, { id: i.value, connection: Mr, one_way: !1 }]), i.value = "");
||||||| 8cdb3c5
            @change=${(i) => {
      const r = i.target;
      r.value !== "" && (this.emit([...this.edges, { id: r.value, connection: Ei, one_way: !1 }]), r.value = "");
=======
            @change=${(i) => {
      const r = i.target;
      r.value !== "" && (this.emit([...this.edges, { id: r.value, connection: Pi, one_way: !1 }]), r.value = "");
>>>>>>> origin/main
    }}
          >
            <option value="">Add an adjacent group…</option>
<<<<<<< HEAD
            ${s.map((r) => l`<option value=${r.id}>${r.name ?? r.id}</option>`)}
||||||| 8cdb3c5
            ${s.map((i) => c`<option value=${i.id}>${i.name ?? i.id}</option>`)}
=======
            ${s.map((i) => l`<option value=${i.id}>${i.name ?? i.id}</option>`)}
>>>>>>> origin/main
          </select>`}
    `;
  }
  renderOwn(e, t) {
<<<<<<< HEAD
    const s = this.errorFor(t), r = this.nameOf(e.id);
    return l`<tr class="own" data-id=${e.id}>
      <td>${r} ${s ? l`<div class="muted error">${s}</div>` : u}</td>
||||||| 8cdb3c5
    const s = this.errorFor(t), i = this.nameOf(e.id);
    return c`<tr class="own" data-id=${e.id}>
      <td>${i} ${s ? c`<div class="muted error">${s}</div>` : u}</td>
=======
    const s = this.errorFor(t), i = this.nameOf(e.id);
    return l`<tr class="own" data-id=${e.id}>
      <td>${i} ${s ? l`<div class="muted error">${s}</div>` : u}</td>
>>>>>>> origin/main
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${r}"
          .value=${e.connection}
          @change=${(i) => this.edit(t, { connection: i.target.value })}
        >
<<<<<<< HEAD
          ${xn.map(
      (i) => l`<option value=${i} ?selected=${i === e.connection}>${Is[i]}</option>`
||||||| 8cdb3c5
          ${nn.map(
      (r) => c`<option value=${r} ?selected=${r === e.connection}>${Ds[r]}</option>`
=======
          ${cn.map(
      (r) => l`<option value=${r} ?selected=${r === e.connection}>${Ds[r]}</option>`
>>>>>>> origin/main
    )}
        </select>
      </td>
      <td>
        <input
          class="both-ways"
          type="checkbox"
          aria-label="You can walk both ways between here and ${r}"
          title="Unchecked means you can only go this way"
          .checked=${!e.one_way}
          @change=${(i) => this.edit(t, { one_way: !i.target.checked })}
        />
      </td>
      <td>
        <ha-icon-button
          label="Remove ${r}"
          data-action="remove"
          @click=${() => this.emit(this.edges.filter((i, n) => n !== t))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
      </td>
    </tr>`;
  }
  renderDeclared(e, t) {
    const s = e.name ?? e.id;
    return l`<tr class="declared" data-id=${e.id}>
      <td><span class="muted">declared on</span> ${s}</td>
      <td>${Is[t.connection]}</td>
      <td>${t.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
  }
};
Te.styles = [
  C,
  S`
      :host {
        background: none;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        font-weight: 600;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      th,
      td {
        padding: 4px 8px 4px 0;
        vertical-align: middle;
      }
      tr.declared td {
        color: var(--secondary-text-color);
      }
      select,
      .add-edge {
        font: inherit;
        color: inherit;
        background: var(--card-background-color, transparent);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 4px;
        max-width: 100%;
      }
      .error {
        font-size: 0.85em;
      }
    `
];
Et([
  d({ attribute: !1 })
], Te.prototype, "config", 2);
Et([
  d({ attribute: !1 })
], Te.prototype, "path", 2);
Et([
  d({ attribute: !1 })
<<<<<<< HEAD
], Te.prototype, "errors", 2);
Te = Et([
  _("al-adjacency-table")
], Te);
var zo = Object.defineProperty, Bo = Object.getOwnPropertyDescriptor, G = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Bo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && zo(t, s, i), i;
||||||| 8cdb3c5
], Pe.prototype, "errors", 2);
Pe = _t([
  k("al-adjacency-table")
], Pe);
var _o = Object.defineProperty, So = Object.getOwnPropertyDescriptor, q = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? So(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && _o(t, s, r), r;
=======
], Pe.prototype, "errors", 2);
Pe = _t([
  S("al-adjacency-table")
], Pe);
var To = Object.defineProperty, Lo = Object.getOwnPropertyDescriptor, z = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Lo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && To(t, s, r), r;
>>>>>>> origin/main
};
const Ke = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
<<<<<<< HEAD
function Wo(e, t) {
  return e.select?.options?.find((r) => r.value === t)?.label;
||||||| 8cdb3c5
function ko(e, t) {
  return e.select?.options?.find((i) => i.value === t)?.label;
=======
function Do(e, t) {
  return e.select?.options?.find((i) => i.value === t)?.label;
>>>>>>> origin/main
}
<<<<<<< HEAD
let M = class extends b {
||||||| 8cdb3c5
let I = class extends b {
=======
let N = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.label = "", this.selector = { text: {} }, this.value = null, this.inherited = null, this.inheritedFrom = "defaults", this.hint = "", this.kind = "number", this.disabled = !1;
  }
  get overridden() {
    return this.value !== null && this.value !== void 0;
  }
  /**
   * Fired on this element only. Every parent binds `@value-changed` directly on the field,
   * and a bubbling copy would also reach the `ha-form` above it, which reads the payload as
   * one of its own fields changing.
   */
  emit(e) {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
  }
  onValueChanged(e) {
<<<<<<< HEAD
    e.stopPropagation(), this.emit(ko(this.kind, e.detail?.value));
||||||| 8cdb3c5
    e.stopPropagation(), this.emit(ro(this.kind, e.detail?.value));
=======
    e.stopPropagation(), this.emit(po(this.kind, e.detail?.value));
>>>>>>> origin/main
  }
  onReset() {
    this.emit(null);
  }
  /**
   * The inherited value as the dropdown would spell it: a `select` stores enum ids like
   * `stack`, and the helper should read the way the options do -- "Stack (add on top)",
   * not the raw id.
   */
  describeInherited() {
    const e = this.inherited;
    if (this.kind === "select" && e !== null && e !== void 0) {
<<<<<<< HEAD
      const t = Wo(this.selector, String(e));
||||||| 8cdb3c5
      const t = ko(this.selector, String(e));
=======
      const t = Do(this.selector, String(e));
>>>>>>> origin/main
      if (t !== void 0) return t;
    }
<<<<<<< HEAD
    return Eo(this.kind, e);
||||||| 8cdb3c5
    return no(this.kind, e);
=======
    return fo(this.kind, e);
>>>>>>> origin/main
  }
  /**
   * `ha-selector` defaults `required` to true, which makes a duration selector spell an
   * inherited (null) value as `00:00:00` and hides the clear affordance, so it is passed
   * explicitly: an override that is not set must read as empty.
   */
  render() {
    const e = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`, t = this.hint === "" ? e : `${this.hint} ${e}`;
    return l`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? Ke : this.selector}
          .label=${this.label}
          .required=${!1}
          .disabled=${this.disabled}
<<<<<<< HEAD
          .value=${_o(this.kind, this.value)}
||||||| 8cdb3c5
          .value=${io(this.kind, this.value)}
=======
          .value=${uo(this.kind, this.value)}
>>>>>>> origin/main
          .helper=${t}
          @value-changed=${this.onValueChanged}
        ></ha-selector>
        <ha-icon-button
          label="Reset to inherited"
          title="Reset to inherited"
          .disabled=${this.disabled || !this.overridden}
          @click=${this.onReset}
        >
          <ha-icon icon="mdi:backup-restore"></ha-icon>
        </ha-icon-button>
      </div>
      ${this.error ? l`<div class="muted error msg">${this.error}</div>` : u}
    `;
  }
};
<<<<<<< HEAD
M.styles = [
  C,
  S`
||||||| 8cdb3c5
I.styles = [
  T,
  A`
=======
N.styles = [
  T,
  A`
>>>>>>> origin/main
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
<<<<<<< HEAD
G([
||||||| 8cdb3c5
q([
=======
z([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], M.prototype, "hass", 2);
G([
||||||| 8cdb3c5
], I.prototype, "hass", 2);
q([
=======
], N.prototype, "hass", 2);
z([
>>>>>>> origin/main
  d()
<<<<<<< HEAD
], M.prototype, "label", 2);
G([
||||||| 8cdb3c5
], I.prototype, "label", 2);
q([
=======
], N.prototype, "label", 2);
z([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], M.prototype, "selector", 2);
G([
||||||| 8cdb3c5
], I.prototype, "selector", 2);
q([
=======
], N.prototype, "selector", 2);
z([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], M.prototype, "value", 2);
G([
||||||| 8cdb3c5
], I.prototype, "value", 2);
q([
=======
], N.prototype, "value", 2);
z([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], M.prototype, "inherited", 2);
G([
||||||| 8cdb3c5
], I.prototype, "inherited", 2);
q([
=======
], N.prototype, "inherited", 2);
z([
>>>>>>> origin/main
  d({ attribute: "inherited-from" })
<<<<<<< HEAD
], M.prototype, "inheritedFrom", 2);
G([
||||||| 8cdb3c5
], I.prototype, "inheritedFrom", 2);
q([
=======
], N.prototype, "inheritedFrom", 2);
z([
>>>>>>> origin/main
  d()
<<<<<<< HEAD
], M.prototype, "hint", 2);
G([
||||||| 8cdb3c5
], I.prototype, "hint", 2);
q([
=======
], N.prototype, "hint", 2);
z([
>>>>>>> origin/main
  d()
<<<<<<< HEAD
], M.prototype, "kind", 2);
G([
||||||| 8cdb3c5
], I.prototype, "kind", 2);
q([
=======
], N.prototype, "kind", 2);
z([
>>>>>>> origin/main
  d()
<<<<<<< HEAD
], M.prototype, "error", 2);
G([
  d({ type: Boolean })
], M.prototype, "disabled", 2);
M = G([
  _("al-override-field")
], M);
const Go = {
||||||| 8cdb3c5
], I.prototype, "error", 2);
I = q([
  k("al-override-field")
], I);
const Eo = {
=======
], N.prototype, "error", 2);
z([
  d({ type: Boolean })
], N.prototype, "disabled", 2);
N = z([
  S("al-override-field")
], N);
const Mo = {
>>>>>>> origin/main
  entity: "Entity",
  mode: "Mode",
  to: "Active states",
  edges: "Fire on",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
<<<<<<< HEAD
}, Vo = {
||||||| 8cdb3c5
}, Ao = {
=======
}, No = {
>>>>>>> origin/main
  entity: "The entity whose state drives this stimulus.",
  mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
  to: "Which states of this entity count as active.",
  edges: "Which crossings fire a trigger. At least one.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this trigger; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
<<<<<<< HEAD
}, Qs = (e) => Go[e.name] ?? e.name, er = (e) => Vo[e.name] ?? "", qo = ["entity", "mode", "gain", "key", "envelope"], le = { duration: { enable_millisecond: !0 } }, hi = {
||||||| 8cdb3c5
}, Ks = (e) => Eo[e.name] ?? e.name, Ys = (e) => Ao[e.name] ?? "", Oo = ["entity", "gain", "key", "envelope"], re = { duration: { enable_millisecond: !0 } }, Ji = {
=======
}, Ys = (e) => Mo[e.name] ?? e.name, Xs = (e) => No[e.name] ?? "", Ro = ["entity", "mode", "gain", "key", "envelope"], re = { duration: { enable_millisecond: !0 } }, tr = {
>>>>>>> origin/main
  number: { min: 0, step: 0.1, mode: "box", unit_of_measurement: "×" }
<<<<<<< HEAD
}, ui = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, ds = "Allow retrigger", hs = "When a new trigger is honoured while the envelope is still active.", us = "Stacks", ps = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", fs = {
||||||| 8cdb3c5
}, Zi = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, os = "Allow retrigger", as = "When a new trigger is honoured while the envelope is still active.", ls = "Stacks", cs = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", ds = {
=======
}, sr = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, os = "Allow retrigger", as = "When a new trigger is honoured while the envelope is still active.", ls = "Stacks", cs = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", ds = {
>>>>>>> origin/main
  select: {
    mode: "dropdown",
    options: [
      { value: "always", label: "Always" },
      { value: "after_attack", label: "After the attack" },
      { value: "after_decay", label: "After the decay" },
      { value: "release", label: "Only while releasing" },
      { value: "idle", label: "Only once fully released" }
    ]
  }
<<<<<<< HEAD
}, Ko = {
  select: {
    mode: "list",
    options: [
      { value: "sustained", label: "Sustained — hold while it is active" },
      { value: "momentary", label: "Momentary — fire on each change" }
    ]
  }
}, Yo = ["attack", "decay", "impulse"], Xo = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", Jo = (e, t) => e.mode === "momentary" && Yo.includes(t), pi = {
||||||| 8cdb3c5
}, Qi = {
=======
}, Io = {
  select: {
    mode: "list",
    options: [
      { value: "sustained", label: "Sustained — hold while it is active" },
      { value: "momentary", label: "Momentary — fire on each change" }
    ]
  }
}, jo = ["attack", "decay", "impulse"], Fo = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", Ho = (e, t) => e.mode === "momentary" && jo.includes(t), ir = {
>>>>>>> origin/main
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "End the trigger" }
    ]
  }
<<<<<<< HEAD
}, Zo = "(unknown preset — using built-in defaults)", ms = [
  { name: "attack", label: "Attack", kind: "duration", selector: le },
  { name: "decay", label: "Decay", kind: "duration", selector: le },
  { name: "sustain", label: "Sustain", kind: "multiplier", selector: hi },
  { name: "release", label: "Release", kind: "duration", selector: le },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: Ke },
||||||| 8cdb3c5
}, Po = "(unknown preset — using built-in defaults)", hs = [
  { name: "attack", label: "Attack", kind: "duration", selector: re },
  { name: "decay", label: "Decay", kind: "duration", selector: re },
  { name: "sustain", label: "Sustain", kind: "multiplier", selector: Ji },
  { name: "release", label: "Release", kind: "duration", selector: re },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: qe },
=======
}, Uo = "(unknown preset — using built-in defaults)", hs = [
  { name: "attack", label: "Attack", kind: "duration", selector: re },
  { name: "decay", label: "Decay", kind: "duration", selector: re },
  { name: "sustain", label: "Sustain", kind: "multiplier", selector: tr },
  { name: "release", label: "Release", kind: "duration", selector: re },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: qe },
>>>>>>> origin/main
  {
    name: "retrigger",
    label: ds,
    kind: "select",
    selector: fs,
    hint: hs
  },
<<<<<<< HEAD
  { name: "stack", label: us, kind: "boolean", selector: Ke, hint: ps },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: pi },
  { name: "debounce", label: "Debounce", kind: "duration", selector: le }
], Qo = ["entity", "mode", "to", "edges", "key"], tr = (e) => Qo.filter((t) => t !== "edges" || e.mode === "momentary"), sr = ["envelope", "gain"], ea = "How a single trigger rises and falls over time.", ta = "What makes this stimulus fire, and what it is called in the mix.", sa = "Change part of the preset for this stimulus only.", ra = (e) => ms.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, gs = (e) => [
||||||| 8cdb3c5
  { name: "stack", label: ls, kind: "boolean", selector: qe, hint: cs },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Qi },
  { name: "debounce", label: "Debounce", kind: "duration", selector: re }
], Xs = ["entity", "to", "key"], Js = ["envelope", "gain"], Co = "How a single trigger rises and falls over time.", To = "What makes this stimulus fire, and what it is called in the mix.", Lo = "Change part of the preset for this stimulus only.", Do = (e) => hs.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, us = (e) => [
=======
  { name: "stack", label: ls, kind: "boolean", selector: qe, hint: cs },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: ir },
  { name: "debounce", label: "Debounce", kind: "duration", selector: re }
], zo = ["entity", "mode", "to", "edges", "key"], Js = (e) => zo.filter((t) => t !== "edges" || e.mode === "momentary"), Zs = ["envelope", "gain"], Bo = "How a single trigger rises and falls over time.", Wo = "What makes this stimulus fire, and what it is called in the mix.", Go = "Change part of the preset for this stimulus only.", Vo = (e) => hs.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, us = (e) => [
>>>>>>> origin/main
  { value: "", label: "(default preset)" },
  ...e.envelopes.map((t) => ({ value: t.id, label: t.id }))
];
<<<<<<< HEAD
function rr(e, t, s, r) {
  const i = lo(s, t.entity, t.to), n = {
||||||| 8cdb3c5
function Zs(e, t) {
  const s = {
=======
function Qs(e, t, s, i) {
  const r = Jn(s, t.entity, t.to), n = {
>>>>>>> origin/main
    entity: { entity: {} },
<<<<<<< HEAD
    mode: Ko,
    to: {
      select: {
        mode: "dropdown",
        multiple: !0,
        // The table behind `stateOptions` cannot know every domain, so an exotic entity
        // can still be typed at. The field just stops *asking* to be typed at.
        custom_value: !0,
        options: ao(s, t.entity, t.to)
      }
    },
    edges: {
      select: {
        mode: "list",
        multiple: !0,
        options: [
          { value: "enter", label: i.enter },
          { value: "leave", label: i.leave }
        ]
      }
    },
    gain: ui,
||||||| 8cdb3c5
    to: { text: {} },
    gain: Zi,
=======
    mode: Io,
    to: {
      select: {
        mode: "dropdown",
        multiple: !0,
        // The table behind `stateOptions` cannot know every domain, so an exotic entity
        // can still be typed at. The field just stops *asking* to be typed at.
        custom_value: !0,
        options: Xn(s, t.entity, t.to)
      }
    },
    edges: {
      select: {
        mode: "list",
        multiple: !0,
        options: [
          { value: "enter", label: r.enter },
          { value: "leave", label: r.leave }
        ]
      }
    },
    gain: sr,
>>>>>>> origin/main
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: gs(e) } }
  };
<<<<<<< HEAD
  return r.map((o) => ({ name: o, selector: n[o] }));
||||||| 8cdb3c5
  return t.map((i) => ({ name: i, selector: s[i] }));
=======
  return i.map((o) => ({ name: o, selector: n[o] }));
>>>>>>> origin/main
}
<<<<<<< HEAD
function ir(e, t) {
||||||| 8cdb3c5
function Qs(e, t, s) {
  const i = {
=======
function ei(e, t) {
>>>>>>> origin/main
  const s = {
    entity: e.entity,
    mode: e.mode,
    to: e.to,
    edges: e.edges,
    gain: e.gain,
    key: e.key ?? "",
    envelope: e.envelope ?? ""
  };
<<<<<<< HEAD
  return Object.fromEntries(t.map((r) => [r, s[r]]));
||||||| 8cdb3c5
  return Object.fromEntries(s.map((r) => [r, i[r]]));
=======
  return Object.fromEntries(t.map((i) => [i, s[i]]));
>>>>>>> origin/main
}
<<<<<<< HEAD
const nr = (e) => Array.isArray(e) ? e.filter((t) => typeof t == "string" && t !== "") : [];
function ia(e, t) {
||||||| 8cdb3c5
function Ro(e, t) {
=======
const ti = (e) => Array.isArray(e) ? e.filter((t) => typeof t == "string" && t !== "") : [];
function qo(e, t) {
>>>>>>> origin/main
  const s = { ...e };
<<<<<<< HEAD
  if ("entity" in t && (s.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (s.mode = t.mode), "to" in t && (s.to = nr(t.to)), "edges" in t) {
    const r = nr(t.edges).filter((i) => i === "enter" || i === "leave");
    r.length > 0 && (s.edges = r);
  }
  return "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = ze(t.key)), "envelope" in t && (s.envelope = ze(t.envelope)), s;
||||||| 8cdb3c5
  return "entity" in t && (s.entity = String(t.entity ?? "")), "to" in t && (s.to = Bi(String(t.to ?? ""))), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = He(t.key)), "envelope" in t && (s.envelope = He(t.envelope)), s;
=======
  if ("entity" in t && (s.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (s.mode = t.mode), "to" in t && (s.to = ti(t.to)), "edges" in t) {
    const i = ti(t.edges).filter((r) => r === "enter" || r === "leave");
    i.length > 0 && (s.edges = i);
  }
  return "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = Ue(t.key)), "envelope" in t && (s.envelope = Ue(t.envelope)), s;
>>>>>>> origin/main
}
<<<<<<< HEAD
const or = (e, t) => e.length === t.length && e.every((s, r) => s === t[r]);
function na(e, t) {
  return or(e.to, t.to) ? or(e.edges, t.edges) ? qo.find((s) => e[s] !== t[s]) : "edges" : "to";
||||||| 8cdb3c5
function Mo(e, t) {
  return Ve(e.to) !== Ve(t.to) ? "to" : Oo.find((s) => e[s] !== t[s]);
=======
const si = (e, t) => e.length === t.length && e.every((s, i) => s === t[i]);
function Ko(e, t) {
  return si(e.to, t.to) ? si(e.edges, t.edges) ? Ro.find((s) => e[s] !== t[s]) : "edges" : "to";
>>>>>>> origin/main
}
<<<<<<< HEAD
function oa(e, t, s) {
  const r = Kr(e, t.envelope);
  return r ? r[s] === null || r[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : Zo;
||||||| 8cdb3c5
const No = (e, t) => Ve(e) === Ve(Bi(t));
function Io(e, t, s) {
  const i = Mi(e, t.envelope);
  return i ? i[s] === null || i[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : Po;
=======
function Yo(e, t, s) {
  const i = ji(e, t.envelope);
  return i ? i[s] === null || i[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : Uo;
>>>>>>> origin/main
}
<<<<<<< HEAD
function aa(e, t) {
  return t == null || e === void 0 ? null : ve(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
||||||| 8cdb3c5
function jo(e, t) {
  return t == null || e === void 0 ? null : fe(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
=======
function Xo(e, t) {
  return t == null || e === void 0 ? null : ge(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
>>>>>>> origin/main
}
<<<<<<< HEAD
const fi = (e) => e.release * e.sustain, mi = (e) => Math.max(1, e.sustain), Jt = (e) => e.sustain / mi(e);
function gi(e, t = 0.25) {
||||||| 8cdb3c5
const er = (e) => e.release * e.sustain, tr = (e) => Math.max(1, e.sustain), Yt = (e) => e.sustain / tr(e);
function sr(e, t = 0.25) {
=======
const rr = (e) => e.release * e.sustain, nr = (e) => Math.max(1, e.sustain), Kt = (e) => e.sustain / nr(e);
function or(e, t = 0.25) {
>>>>>>> origin/main
  if (e.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
<<<<<<< HEAD
  const s = fi(e), r = e.attack + e.decay + s, i = r > 0 ? r * t / (1 - t) : 1, n = r + i, o = 1 / mi(e), a = Jt(e);
||||||| 8cdb3c5
  const s = er(e), i = e.attack + e.decay + s, r = i > 0 ? i * t / (1 - t) : 1, n = i + r, o = 1 / tr(e), a = Yt(e);
  let l = 0;
=======
  const s = rr(e), i = e.attack + e.decay + s, r = i > 0 ? i * t / (1 - t) : 1, n = i + r, o = 1 / nr(e), a = Kt(e);
>>>>>>> origin/main
  let c = 0;
  const h = [{ x: 0, y: 0 }];
<<<<<<< HEAD
  return c += e.attack, h.push({ x: c / n, y: o }), c += e.decay, h.push({ x: c / n, y: a }), c += i, h.push({ x: c / n, y: a }), c += s, h.push({ x: c / n, y: 0 }), h;
||||||| 8cdb3c5
  return l += e.attack, h.push({ x: l / n, y: o }), l += e.decay, h.push({ x: l / n, y: a }), l += r, h.push({ x: l / n, y: a }), l += s, h.push({ x: l / n, y: 0 }), h;
=======
  return c += e.attack, h.push({ x: c / n, y: o }), c += e.decay, h.push({ x: c / n, y: a }), c += r, h.push({ x: c / n, y: a }), c += s, h.push({ x: c / n, y: 0 }), h;
>>>>>>> origin/main
}
<<<<<<< HEAD
function la(e, t = 0.25) {
  const s = gi(e, t), r = (n) => ((s[n]?.x ?? 0) + (s[n + 1]?.x ?? 0)) / 2;
||||||| 8cdb3c5
function Fo(e, t = 0.25) {
  const s = sr(e, t), i = (n) => ((s[n]?.x ?? 0) + (s[n + 1]?.x ?? 0)) / 2;
=======
function Jo(e, t = 0.25) {
  const s = or(e, t), i = (n) => ((s[n]?.x ?? 0) + (s[n + 1]?.x ?? 0)) / 2;
>>>>>>> origin/main
  if (e.impulse) {
    const n = [{ text: "impulse", x: 0 }];
<<<<<<< HEAD
    return e.release > 0 && n.push({ text: `R ${ve(e.release)}`, x: r(1) }), n;
||||||| 8cdb3c5
    return e.release > 0 && n.push({ text: `R ${fe(e.release)}`, x: i(1) }), n;
=======
    return e.release > 0 && n.push({ text: `R ${ge(e.release)}`, x: i(1) }), n;
>>>>>>> origin/main
  }
<<<<<<< HEAD
  const i = [];
  return e.attack > 0 && i.push({ text: `A ${ve(e.attack)}`, x: r(0) }), e.decay > 0 && i.push({ text: `D ${ve(e.decay)}`, x: r(1) }), i.push({ text: `S ${ii(e.sustain)}`, x: r(2) }), fi(e) > 0 && i.push({ text: `R ${ve(e.release)}`, x: r(3) }), i;
||||||| 8cdb3c5
  const r = [];
  return e.attack > 0 && r.push({ text: `A ${fe(e.attack)}`, x: i(0) }), e.decay > 0 && r.push({ text: `D ${fe(e.decay)}`, x: i(1) }), r.push({ text: `S ${Gi(e.sustain)}`, x: i(2) }), er(e) > 0 && r.push({ text: `R ${fe(e.release)}`, x: i(3) }), r;
=======
  const r = [];
  return e.attack > 0 && r.push({ text: `A ${ge(e.attack)}`, x: i(0) }), e.decay > 0 && r.push({ text: `D ${ge(e.decay)}`, x: i(1) }), r.push({ text: `S ${Ki(e.sustain)}`, x: i(2) }), rr(e) > 0 && r.push({ text: `R ${ge(e.release)}`, x: i(3) }), r;
>>>>>>> origin/main
}
<<<<<<< HEAD
var ca = Object.defineProperty, da = Object.getOwnPropertyDescriptor, vi = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? da(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && ca(t, s, i), i;
||||||| 8cdb3c5
var Ho = Object.defineProperty, Uo = Object.getOwnPropertyDescriptor, ir = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Uo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ho(t, s, r), r;
=======
var Zo = Object.defineProperty, Qo = Object.getOwnPropertyDescriptor, ar = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Qo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Zo(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const Ye = 10, ft = 190, ha = 10, Pe = 58, ua = 72, it = (e) => Ye + e * (ft - Ye), Tt = (e) => Pe - e * (Pe - ha), Be = (e) => String(Math.round(e * 10) / 10), Lt = (e, t) => `${Be(e)},${Be(t)}`, pa = (e) => Math.min(ft - 6, Math.max(Ye + 6, it(e)));
let mt = class extends b {
||||||| 8cdb3c5
const Ke = 10, ut = 190, zo = 10, Ae = 58, Bo = 72, st = (e) => Ke + e * (ut - Ke), Ct = (e) => Ae - e * (Ae - zo), Ue = (e) => String(Math.round(e * 10) / 10), Tt = (e, t) => `${Ue(e)},${Ue(t)}`, Go = (e) => Math.min(ut - 6, Math.max(Ke + 6, st(e)));
let pt = class extends b {
=======
const Ke = 10, ut = 190, ea = 10, Ae = 58, ta = 72, st = (e) => Ke + e * (ut - Ke), Pt = (e) => Ae - e * (Ae - ea), ze = (e) => String(Math.round(e * 10) / 10), Ct = (e, t) => `${ze(e)},${ze(t)}`, sa = (e) => Math.min(ut - 6, Math.max(Ke + 6, st(e)));
let pt = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const e = this.envelope;
    if (!e) return u;
<<<<<<< HEAD
    const t = gi(e), s = t[0], r = t[t.length - 1], i = t.map((c) => Lt(it(c.x), Tt(c.y))).join(" "), n = `${Lt(it(s.x), Pe)} ${i} ${Lt(it(r.x), Pe)}`, o = la(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
||||||| 8cdb3c5
    const t = sr(e), s = t[0], i = t[t.length - 1], r = t.map((l) => Tt(st(l.x), Ct(l.y))).join(" "), n = `${Tt(st(s.x), Ae)} ${r} ${Tt(st(i.x), Ae)}`, o = Fo(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
=======
    const t = or(e), s = t[0], i = t[t.length - 1], r = t.map((c) => Ct(st(c.x), Pt(c.y))).join(" "), n = `${Ct(st(s.x), Ae)} ${r} ${Ct(st(i.x), Ae)}`, o = Jo(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
>>>>>>> origin/main
    return l`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${Ye} y1=${Pe} x2=${ft} y2=${Pe}></line>
        ${e.impulse ? u : A`<line
              class="grid"
<<<<<<< HEAD
              x1=${Ye}
              y1=${Be(Tt(Jt(e)))}
              x2=${ft}
              y2=${Be(Tt(Jt(e)))}
||||||| 8cdb3c5
              x1=${Ke}
              y1=${Ue(Ct(Yt(e)))}
              x2=${ut}
              y2=${Ue(Ct(Yt(e)))}
=======
              x1=${Ke}
              y1=${ze(Pt(Kt(e)))}
              x2=${ut}
              y2=${ze(Pt(Kt(e)))}
>>>>>>> origin/main
            ></line>`}
        <polygon class="area" points=${n}></polygon>
        <polyline class="curve" points=${i}></polyline>
        ${o.map(
<<<<<<< HEAD
      (c) => A`<text class="caption" x=${Be(pa(c.x))} y=${ua} text-anchor="middle">${c.text}</text>`
||||||| 8cdb3c5
      (l) => E`<text class="caption" x=${Ue(Go(l.x))} y=${Bo} text-anchor="middle">${l.text}</text>`
=======
      (c) => E`<text class="caption" x=${ze(sa(c.x))} y=${ta} text-anchor="middle">${c.text}</text>`
>>>>>>> origin/main
    )}
      </svg>
    `;
  }
};
mt.styles = [
  C,
  S`
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
<<<<<<< HEAD
vi([
||||||| 8cdb3c5
ir([
=======
ar([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], mt.prototype, "envelope", 2);
mt = vi([
  _("al-envelope-sketch")
], mt);
var fa = Object.defineProperty, ma = Object.getOwnPropertyDescriptor, Je = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ma(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && fa(t, s, i), i;
||||||| 8cdb3c5
], pt.prototype, "envelope", 2);
pt = ir([
  k("al-envelope-sketch")
], pt);
var Wo = Object.defineProperty, Vo = Object.getOwnPropertyDescriptor, Xe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Vo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Wo(t, s, r), r;
=======
], pt.prototype, "envelope", 2);
pt = ar([
  S("al-envelope-sketch")
], pt);
var ia = Object.defineProperty, ra = Object.getOwnPropertyDescriptor, Xe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ra(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ia(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const ga = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } };
let we = class extends b {
||||||| 8cdb3c5
let $e = class extends b {
=======
let ye = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  /** One override, written as a whole block so a config that predates presence fills in. */
  setPresence(e, t) {
<<<<<<< HEAD
    const { config: s, path: r } = this;
    if (!s || !r) return;
    const i = L(s, r);
    if (!i) return;
    const n = O(s, [...r, "presence"], {
      ...i.presence ?? Wt(),
||||||| 8cdb3c5
    const { config: s, path: i } = this;
    if (!s || !i) return;
    const r = L(s, i);
    if (!r) return;
    const n = P(s, [...i, "presence"], {
      ...r.presence ?? zt(),
=======
    const { config: s, path: i } = this;
    if (!s || !i) return;
    const r = L(s, i);
    if (!r) return;
    const n = P(s, [...i, "presence"], {
      ...r.presence ?? Ut(),
>>>>>>> origin/main
      [e]: t
    });
<<<<<<< HEAD
    this.dispatchEvent(D(n, `${g(r)}:presence:${e}`));
||||||| 8cdb3c5
    this.dispatchEvent(R(n, `${m(i)}:presence:${e}`));
=======
    this.dispatchEvent(M(n, `${m(i)}:presence:${e}`));
>>>>>>> origin/main
  }
  render() {
    const { config: e, path: t } = this, s = e && t ? L(e, t) : void 0;
    if (!e || !t || !s) return u;
<<<<<<< HEAD
    const r = s.presence ?? Wt(), i = r.envelope ?? F(e).envelope, n = Yr(e, { ...r, envelope: i }), o = Z(this.errors, [...t, "presence"]);
||||||| 8cdb3c5
    const i = s.presence ?? zt(), r = i.envelope ?? X(e).envelope, n = Ni(e, { ...i, envelope: r }), o = xe(this.errors, [...t, "presence"]);
    return c`
=======
    const i = s.presence ?? Ut(), r = i.envelope ?? J(e).envelope, n = Fi(e, { ...i, envelope: r }), o = we(this.errors, [...t, "presence"]);
>>>>>>> origin/main
    return l`
      <ha-selector
        class="presence-envelope"
        .hass=${this.hass}
        .selector=${{ select: { mode: "dropdown", options: gs(e) } }}
        .label=${"Envelope preset"}
        .required=${!1}
        .value=${r.envelope ?? ""}
        @value-changed=${(a) => this.setPresence("envelope", a.detail.value === "" ? null : a.detail.value)}
      ></ha-selector>
      <al-override-field
        class="presence-gain"
        .hass=${this.hass}
        label="Gain"
        kind="number"
<<<<<<< HEAD
        .selector=${ui}
        .value=${r.gain}
||||||| 8cdb3c5
        .selector=${Zi}
        .value=${i.gain}
=======
        .selector=${sr}
        .value=${i.gain}
>>>>>>> origin/main
        .inherited=${1}
        .inheritedFrom=${"presence"}
        .error=${o.gain}
        @value-changed=${(a) => this.setPresence("gain", a.detail.value ?? 1)}
      ></al-override-field>
<<<<<<< HEAD
      <al-override-field
        class="presence-activity_floor"
        .hass=${this.hass}
        label="Empty-room floor"
        hint="Likelihood of this room at an activity level of 0.0. Set 1 for a room people sleep in: a still sleeper trips no motion, and the estimator must not read that as an empty room."
        kind="number"
        .selector=${ga}
        .value=${r.activity_floor}
        .inherited=${F(e).activity.floor}
        .inheritedFrom=${"presence"}
        .error=${o.activity_floor}
        @value-changed=${(a) => this.setPresence("activity_floor", a.detail.value ?? null)}
      ></al-override-field>
      ${ms.map(
||||||| 8cdb3c5
      ${hs.map(
      (a) => c`<al-override-field
=======
      ${hs.map(
>>>>>>> origin/main
      (a) => l`<al-override-field
          class="presence-${a.name}"
          .hass=${this.hass}
          .label=${a.label}
          .hint=${a.hint ?? ""}
          .kind=${a.kind}
          .selector=${a.selector}
          .value=${r[a.name]}
          .inherited=${n[a.name]}
          .inheritedFrom=${i ?? "defaults"}
          .error=${o[a.name]}
          @value-changed=${(c) => this.setPresence(a.name, c.detail.value)}
        ></al-override-field>`
    )}
      <al-envelope-sketch .envelope=${n}></al-envelope-sketch>
    `;
  }
};
<<<<<<< HEAD
we.styles = [C];
Je([
||||||| 8cdb3c5
$e.styles = [T];
Xe([
=======
ye.styles = [T];
Xe([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], we.prototype, "hass", 2);
Je([
||||||| 8cdb3c5
], $e.prototype, "hass", 2);
Xe([
=======
], ye.prototype, "hass", 2);
Xe([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], we.prototype, "config", 2);
Je([
||||||| 8cdb3c5
], $e.prototype, "config", 2);
Xe([
=======
], ye.prototype, "config", 2);
Xe([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], we.prototype, "path", 2);
Je([
||||||| 8cdb3c5
], $e.prototype, "path", 2);
Xe([
=======
], ye.prototype, "path", 2);
Xe([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], we.prototype, "errors", 2);
we = Je([
  _("al-presence-overrides")
], we);
var va = Object.defineProperty, ba = Object.getOwnPropertyDescriptor, Ze = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ba(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && va(t, s, i), i;
||||||| 8cdb3c5
], $e.prototype, "errors", 2);
$e = Xe([
  k("al-presence-overrides")
], $e);
var qo = Object.defineProperty, Ko = Object.getOwnPropertyDescriptor, Je = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ko(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && qo(t, s, r), r;
=======
], ye.prototype, "errors", 2);
ye = Xe([
  S("al-presence-overrides")
], ye);
var na = Object.defineProperty, oa = Object.getOwnPropertyDescriptor, Je = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? oa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && na(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const $a = "People can leave the property from here, so presence can move from here to Away.";
let _e = class extends b {
||||||| 8cdb3c5
const Yo = "People can leave the property from here, so presence can move from here to Away.";
let ye = class extends b {
=======
const aa = "People can leave the property from here, so presence can move from here to Away.";
let xe = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  emitChange(e, t) {
<<<<<<< HEAD
    this.dispatchEvent(D(e, t));
||||||| 8cdb3c5
    this.dispatchEvent(R(e, t));
=======
    this.dispatchEvent(M(e, t));
>>>>>>> origin/main
  }
  emitSelect(e) {
<<<<<<< HEAD
    this.dispatchEvent(ti(e));
||||||| 8cdb3c5
    this.dispatchEvent(Hi(e));
=======
    this.dispatchEvent(Gi(e));
>>>>>>> origin/main
  }
  /**
   * An identity edit. The two registry pickers route through the binding helpers, because
   * the prefill needs the registry *name* and only this element can see `hass`.
   */
  onIdentityChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
<<<<<<< HEAD
    const r = L(t, s);
    if (!r) return;
    const i = e.detail?.value ?? {};
    let n = Yt(r, i);
    "area_id" in i && n.area_id !== r.area_id && (n = Mo(
||||||| 8cdb3c5
    const i = L(t, s);
    if (!i) return;
    const r = e.detail?.value ?? {};
    let n = qt(i, r);
    "area_id" in r && n.area_id !== i.area_id && (n = vo(
=======
    const i = L(t, s);
    if (!i) return;
    const r = e.detail?.value ?? {};
    let n = Vt(i, r);
    "area_id" in r && n.area_id !== i.area_id && (n = So(
>>>>>>> origin/main
      n,
      n.area_id,
      n.area_id === null ? null : this.areaName(n.area_id),
      t
<<<<<<< HEAD
    )), "floor_id" in i && n.floor_id !== r.floor_id && (n = Io(
||||||| 8cdb3c5
    )), "floor_id" in r && n.floor_id !== i.floor_id && (n = bo(
=======
    )), "floor_id" in r && n.floor_id !== i.floor_id && (n = Eo(
>>>>>>> origin/main
      n,
      n.floor_id,
      n.floor_id === null ? null : this.floorName(n.floor_id),
      t
    ));
<<<<<<< HEAD
    const o = Xt(n, r);
    o !== void 0 && this.emitChange(O(t, s, n), `${g(s)}:${o}`);
||||||| 8cdb3c5
    const o = Kt(n, i);
    o !== void 0 && this.emitChange(P(t, s, n), `${m(s)}:${o}`);
=======
    const o = qt(n, i);
    o !== void 0 && this.emitChange(P(t, s, n), `${m(s)}:${o}`);
>>>>>>> origin/main
  }
  areaName(e) {
    return this.hass?.areas[e]?.name ?? null;
  }
  floorName(e) {
    return this.hass?.floors?.[e]?.name ?? null;
  }
  onMixChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
<<<<<<< HEAD
    const r = L(t, s);
    if (!r) return;
    const i = Yt(r, e.detail?.value ?? {}), n = Xt(i, r);
    n !== void 0 && this.emitChange(O(t, s, i), `${g(s)}:${n}`);
||||||| 8cdb3c5
    const i = L(t, s);
    if (!i) return;
    const r = qt(i, e.detail?.value ?? {}), n = Kt(r, i);
    n !== void 0 && this.emitChange(P(t, s, r), `${m(s)}:${n}`);
=======
    const i = L(t, s);
    if (!i) return;
    const r = Vt(i, e.detail?.value ?? {}), n = qt(r, i);
    n !== void 0 && this.emitChange(P(t, s, r), `${m(s)}:${n}`);
>>>>>>> origin/main
  }
  setField(e, t) {
    const { config: s, path: r } = this;
    !s || !r || this.emitChange(O(s, [...r, e], t), `${g(r)}:${e}`);
  }
  onDelete() {
    const { config: e, path: t } = this;
    if (!e || !t) return;
    const s = L(e, t);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
<<<<<<< HEAD
    this.emitChange(xt(e, t));
    const r = $e(t);
    this.emitSelect(r.length ? r : null);
||||||| 8cdb3c5
    this.emitChange($t(e, t));
    const i = me(t);
    this.emitSelect(i.length ? i : null);
=======
    this.emitChange($t(e, t));
    const i = ve(t);
    this.emitSelect(i.length ? i : null);
>>>>>>> origin/main
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length === 0)
      return l`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = L(e, t);
    if (!s) return l`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
<<<<<<< HEAD
    const r = t.length === 2, i = this.errors.filter((a) => a.path === g(t)), n = Z(this.errors, t), o = t.length > 2 ? L(e, $e(t)) : void 0;
||||||| 8cdb3c5
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = t.length === 2, r = this.errors.filter((a) => a.path === m(t)), n = xe(this.errors, t), o = t.length > 2 ? L(e, me(t)) : void 0;
    return c`
=======
    const i = t.length === 2, r = this.errors.filter((a) => a.path === m(t)), n = we(this.errors, t), o = t.length > 2 ? L(e, ve(t)) : void 0;
>>>>>>> origin/main
    return l`
      <ha-card header="Group">
<<<<<<< HEAD
        ${i.map((a) => l`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        ${be(
||||||| 8cdb3c5
        ${r.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        ${ge(
=======
        ${r.map((a) => l`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        ${me(
>>>>>>> origin/main
      "group",
      "identity",
      "Identity",
<<<<<<< HEAD
      ge[s.kind].definition,
||||||| 8cdb3c5
      pe[s.kind].definition,
=======
      fe[s.kind].definition,
>>>>>>> origin/main
      !0,
      l`
            <ha-form
              .hass=${this.hass}
<<<<<<< HEAD
              .data=${Kt(s, r, Js)}
              .schema=${qt(s, r, Js, e, o?.kind ?? null)}
||||||| 8cdb3c5
              .data=${Vt(s, i, Vs)}
              .schema=${Wt(s, i, Vs, e, o?.kind ?? null)}
=======
              .data=${Gt(s, i, qs)}
              .schema=${Wt(s, i, qs, e, o?.kind ?? null)}
>>>>>>> origin/main
              .error=${n}
<<<<<<< HEAD
              .computeLabel=${Gt}
              .computeHelper=${Vt}
||||||| 8cdb3c5
              .computeLabel=${Bt}
              .computeHelper=${Gt}
=======
              .computeLabel=${zt}
              .computeHelper=${Bt}
>>>>>>> origin/main
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(e, s, n)}
          `
    )}
<<<<<<< HEAD
        ${be("group", "mix", "Mix", Co, !0, this.renderMix(e, s, r, n))}
||||||| 8cdb3c5
        ${ge("group", "mix", "Mix", ho, !0, this.renderMix(e, s, i, n))}
=======
        ${me("group", "mix", "Mix", $o, !0, this.renderMix(e, s, i, n))}
>>>>>>> origin/main
        ${this.renderAdjacency(e, s, n)} ${this.renderPresence(e, s, t)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
  /** Mix, gain, limiter and precision: everything about how this group sums up. */
<<<<<<< HEAD
  renderMix(e, t, s, r) {
||||||| 8cdb3c5
  renderMix(e, t, s, i) {
    return c`
=======
  renderMix(e, t, s, i) {
>>>>>>> origin/main
    return l`
      <ha-form
        .hass=${this.hass}
<<<<<<< HEAD
        .data=${Kt(t, s, Zs)}
        .schema=${qt(t, s, Zs)}
        .error=${r}
        .computeLabel=${Gt}
        .computeHelper=${Vt}
||||||| 8cdb3c5
        .data=${Vt(t, s, qs)}
        .schema=${Wt(t, s, qs)}
        .error=${i}
        .computeLabel=${Bt}
        .computeHelper=${Gt}
=======
        .data=${Gt(t, s, Ks)}
        .schema=${Wt(t, s, Ks)}
        .error=${i}
        .computeLabel=${zt}
        .computeHelper=${Bt}
>>>>>>> origin/main
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${pt.max_value}
        kind="number"
<<<<<<< HEAD
        .selector=${ni}
||||||| 8cdb3c5
        .selector=${Wi}
=======
        .selector=${Yi}
>>>>>>> origin/main
        .value=${t.max_value}
        .inherited=${e.defaults.max_value}
        .inheritedFrom=${"defaults"}
        .error=${r.max_value}
        @value-changed=${(i) => this.setField("max_value", i.detail.value)}
      ></al-override-field>
      <al-override-field
        .hass=${this.hass}
        .label=${pt.precision}
        kind="select"
<<<<<<< HEAD
        .selector=${oi}
||||||| 8cdb3c5
        .selector=${Vi}
=======
        .selector=${Xi}
>>>>>>> origin/main
        .value=${t.precision === null ? null : String(t.precision)}
        .inherited=${String(e.defaults.precision)}
        .inheritedFrom=${"defaults"}
        .error=${r.precision}
        @value-changed=${(i) => this.setField("precision", i.detail.value === null ? null : Number(i.detail.value))}
      ></al-override-field>
    `;
  }
  /**
   * The Adjacent groups panel, for the kinds a person can be in. "Leads off the property"
   * sits under the table rather than in it, because an exit is a property of the group,
   * not of an edge - it is the one way out that leads nowhere this document models.
   */
  renderAdjacency(e, t, s) {
<<<<<<< HEAD
    return qe.has(t.kind) ? be(
||||||| 8cdb3c5
    return We.has(t.kind) ? ge(
=======
    return Ve.has(t.kind) ? me(
>>>>>>> origin/main
      "group",
      "adjacent",
      "Adjacent groups",
<<<<<<< HEAD
      To,
||||||| 8cdb3c5
      uo,
=======
      yo,
>>>>>>> origin/main
      !0,
      l`
        <al-adjacency-table
          .config=${e}
          .path=${this.path}
          .errors=${this.errors}
        ></al-adjacency-table>
        ${this.renderExit(t, s)}
      `
    ) : u;
  }
  /**
   * Every room may lead off the property, indoors or out: a front door in the hall and a
   * gate on the driveway are both exits. Only the kinds nobody stands in refuse one, and
   * this is only ever reached from the adjacency panel, which those kinds do not get.
   */
  renderExit(e, t) {
    return l`<div class="exit row">
      <ha-switch
        .checked=${e.exit === !0}
        @change=${(s) => this.setField("exit", s.target.checked === !0)}
      ></ha-switch>
      <div>
        <div>Leads off the property</div>
<<<<<<< HEAD
        <div class="muted">${$a}</div>
||||||| 8cdb3c5
        <div class="muted">${Yo}</div>
        ${t.exit ? c`<div class="error">${t.exit}</div>` : u}
=======
        <div class="muted">${aa}</div>
>>>>>>> origin/main
        ${t.exit ? l`<div class="error">${t.exit}</div>` : u}
      </div>
    </div>`;
  }
  /** The group's own presence channel, tuned like any other: only when presence is on. */
  renderPresence(e, t, s) {
<<<<<<< HEAD
    return F(e).enabled ? be(
||||||| 8cdb3c5
    return X(e).enabled ? ge(
=======
    return J(e).enabled ? me(
>>>>>>> origin/main
      "group",
      "presence",
      "Presence",
<<<<<<< HEAD
      Lo,
||||||| 8cdb3c5
      po,
=======
      xo,
>>>>>>> origin/main
      !1,
      l`<al-presence-overrides
        .hass=${this.hass}
        .config=${e}
        .path=${s}
        .errors=${this.errors}
      ></al-presence-overrides>`
    ) : u;
  }
  /**
   * A group whose kind cannot walk anywhere, still carrying adjacency or a way out from
   * before it was one. The backend refuses the document, so the panel that names the kind
   * is where the way out of that has to be - an error with nothing to click is a dead end.
   */
  renderStale(e, t, s) {
<<<<<<< HEAD
    if (qe.has(t.kind)) return u;
    const r = [
||||||| 8cdb3c5
    if (We.has(t.kind)) return u;
    const i = [
=======
    if (Ve.has(t.kind)) return u;
    const i = [
>>>>>>> origin/main
      t.adjacent.length > 0 ? "adjacent groups" : null,
      t.exit === !0 ? "a way off the property" : null
    ].filter((n) => n !== null);
<<<<<<< HEAD
    if (r.length === 0) return u;
    const i = s.adjacent ?? s.exit ?? `${ge[t.kind].label} groups have no ${r.join(" and no ")}.`;
    return l`<div class="stale row">
      <div class="grow error">${i}</div>
||||||| 8cdb3c5
    if (i.length === 0) return u;
    const r = s.adjacent ?? s.exit ?? `${pe[t.kind].label} groups have no ${i.join(" and no ")}.`;
    return c`<div class="stale row">
      <div class="grow error">${r}</div>
=======
    if (i.length === 0) return u;
    const r = s.adjacent ?? s.exit ?? `${fe[t.kind].label} groups have no ${i.join(" and no ")}.`;
    return l`<div class="stale row">
      <div class="grow error">${r}</div>
>>>>>>> origin/main
      <ha-button appearance="plain" @click=${() => this.clearStale(e)}>Remove</ha-button>
    </div>`;
  }
  /** Drops both in one edit, so the document goes from refused to valid in a single undo step. */
  clearStale(e) {
    const t = this.path;
    if (!t) return;
<<<<<<< HEAD
    const s = O(O(e, [...t, "adjacent"], []), [...t, "exit"], !1);
    this.dispatchEvent(D(s, void 0, !0));
||||||| 8cdb3c5
    const s = P(P(e, [...t, "adjacent"], []), [...t, "exit"], !1);
    this.dispatchEvent(R(s, void 0, !0));
=======
    const s = P(P(e, [...t, "adjacent"], []), [...t, "exit"], !1);
    this.dispatchEvent(M(s, void 0, !0));
>>>>>>> origin/main
  }
};
<<<<<<< HEAD
_e.styles = [
  C,
  S`
||||||| 8cdb3c5
ye.styles = [
  T,
  A`
=======
xe.styles = [
  T,
  A`
>>>>>>> origin/main
      .note {
        margin: 4px 0 12px;
      }
      .exit {
        align-items: flex-start;
        margin-top: 16px;
      }
      .danger {
        margin-top: 24px;
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
      }
    `
];
Ze([
  d({ attribute: !1 })
<<<<<<< HEAD
], _e.prototype, "hass", 2);
Ze([
||||||| 8cdb3c5
], ye.prototype, "hass", 2);
Je([
=======
], xe.prototype, "hass", 2);
Je([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], _e.prototype, "config", 2);
Ze([
||||||| 8cdb3c5
], ye.prototype, "config", 2);
Je([
=======
], xe.prototype, "config", 2);
Je([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], _e.prototype, "path", 2);
Ze([
||||||| 8cdb3c5
], ye.prototype, "path", 2);
Je([
=======
], xe.prototype, "path", 2);
Je([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], _e.prototype, "errors", 2);
_e = Ze([
  _("al-group-editor")
], _e);
var ya = Object.defineProperty, xa = Object.getOwnPropertyDescriptor, Ne = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? xa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && ya(t, s, i), i;
||||||| 8cdb3c5
], ye.prototype, "errors", 2);
ye = Je([
  k("al-group-editor")
], ye);
var Xo = Object.defineProperty, Jo = Object.getOwnPropertyDescriptor, we = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Jo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Xo(t, s, r), r;
=======
], xe.prototype, "errors", 2);
xe = Je([
  S("al-group-editor")
], xe);
var la = Object.defineProperty, ca = Object.getOwnPropertyDescriptor, Le = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ca(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && la(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
let ce = class extends b {
||||||| 8cdb3c5
let J = class extends b {
=======
let ae = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null;
  }
  emitChange(e, t) {
<<<<<<< HEAD
    this.dispatchEvent(D(e, t));
||||||| 8cdb3c5
    this.dispatchEvent(R(e, t));
=======
    this.dispatchEvent(M(e, t));
>>>>>>> origin/main
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
<<<<<<< HEAD
    const r = zs(t, s);
    if (!r) return;
    const i = e.detail?.value ?? {}, n = ia(r, i), o = na(n, r);
    o !== void 0 && this.emitChange(O(t, s, n), `${g(s)}:${o}`);
||||||| 8cdb3c5
    const i = Ot(t, s);
    if (!i) return;
    const r = e.detail?.value ?? {};
    "to" in r && (this.toText = String(r.to ?? ""));
    const n = Ro(i, r), o = Mo(n, i);
    o !== void 0 && this.emitChange(P(t, s, n), `${m(s)}:${o}`);
=======
    const i = js(t, s);
    if (!i) return;
    const r = e.detail?.value ?? {}, n = qo(i, r), o = Ko(n, i);
    o !== void 0 && this.emitChange(P(t, s, n), `${m(s)}:${o}`);
>>>>>>> origin/main
  }
  setOverride(e, t) {
    const { config: s, path: r } = this;
    !s || !r || this.emitChange(O(s, [...r, e], t), `${g(r)}:${e}`);
  }
  /** The live-voice chips: phase, value, time left in the phase and the gate dot. */
  renderLive(e, t) {
    return e ? l`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${e.phase}">${e.phase}</span>
      <span class="chip">${e.value.toFixed(2)}</span>
      ${t !== null ? l`<span class="muted chip">ends in ${t}</span>` : u}
      <span class="dot ${e.gate ? "gated" : ""}" title=${e.gate ? "Gate open" : "Gate closed"}></span>
    </div>` : u;
  }
  /** One override field, bound to the stimulus, the resolved preset and its errors. */
<<<<<<< HEAD
  renderOverride(e, t, s, r) {
    const { config: i } = this, n = Jo(t, e.name);
||||||| 8cdb3c5
  renderOverride(e, t, s, i) {
    const { config: r } = this;
    return c`<al-override-field
=======
  renderOverride(e, t, s, i) {
    const { config: r } = this, n = Ho(t, e.name);
>>>>>>> origin/main
    return l`<al-override-field
      .hass=${this.hass}
      .label=${e.label}
      .disabled=${n}
<<<<<<< HEAD
      .hint=${n ? Xo : e.hint ?? ""}
||||||| 8cdb3c5
      .hint=${e.hint ?? ""}
=======
      .hint=${n ? Fo : e.hint ?? ""}
>>>>>>> origin/main
      .kind=${e.kind}
      .selector=${e.selector}
      .value=${t[e.name]}
      .inherited=${s[e.name]}
<<<<<<< HEAD
      .inheritedFrom=${i ? oa(i, t, e.name) : "defaults"}
      .error=${r[e.name]}
||||||| 8cdb3c5
      .inheritedFrom=${r ? Io(r, t, e.name) : "defaults"}
      .error=${i[e.name]}
      @value-changed=${(n) => this.setOverride(e.name, n.detail.value)}
=======
      .inheritedFrom=${r ? Yo(r, t, e.name) : "defaults"}
      .error=${i[e.name]}
>>>>>>> origin/main
      @value-changed=${(o) => this.setOverride(e.name, o.detail.value)}
    ></al-override-field>`;
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length < 3)
      return l`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
<<<<<<< HEAD
    const s = zs(e, t);
    if (!s) return l`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const r = L(e, $e(t)), i = Z(this.errors, t), n = this.errors.filter((f) => f.path === g(t)), o = Yr(e, s), a = this.live?.voices[r?.id ?? ""]?.find(
||||||| 8cdb3c5
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = Ot(e, t);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = L(e, me(t)), r = xe(this.errors, t), n = this.errors.filter((f) => f.path === m(t)), o = Ni(e, s), a = this.live?.voices[i?.id ?? ""]?.find(
=======
    const s = js(e, t);
    if (!s) return l`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = L(e, ve(t)), r = we(this.errors, t), n = this.errors.filter((f) => f.path === m(t)), o = Fi(e, s), a = this.live?.voices[i?.id ?? ""]?.find(
>>>>>>> origin/main
      (f) => f.label === (s.key ?? s.entity)
<<<<<<< HEAD
    ), c = aa(this.live?.now, a?.phase_ends), h = ra(s);
||||||| 8cdb3c5
    ), l = jo(this.live?.now, a?.phase_ends), h = Do(s);
    return c`
=======
    ), c = Xo(this.live?.now, a?.phase_ends), h = Vo(s);
>>>>>>> origin/main
    return l`
      <ha-card header="Stimulus">
        ${n.map((f) => l`<ha-alert alert-type="error">${f.message}</ha-alert>`)}
<<<<<<< HEAD
        ${be(
||||||| 8cdb3c5
        ${n.map((f) => c`<ha-alert alert-type="error">${f.message}</ha-alert>`)}
        ${ge(
=======
        ${me(
>>>>>>> origin/main
      "stimulus",
      "source",
      "Source",
<<<<<<< HEAD
      ta,
||||||| 8cdb3c5
      To,
=======
      Wo,
>>>>>>> origin/main
      !0,
      l`
            <ha-form
              .hass=${this.hass}
<<<<<<< HEAD
              .data=${ir(s, tr(s))}
              .schema=${rr(e, s, this.hass, tr(s))}
              .error=${i}
              .computeLabel=${Qs}
              .computeHelper=${er}
||||||| 8cdb3c5
              .data=${Qs(s, this.toText, Xs)}
              .schema=${Zs(e, Xs)}
              .error=${r}
              .computeLabel=${Ks}
              .computeHelper=${Ys}
=======
              .data=${ei(s, Js(s))}
              .schema=${Qs(e, s, this.hass, Js(s))}
              .error=${r}
              .computeLabel=${Ys}
              .computeHelper=${Xs}
>>>>>>> origin/main
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `
    )}
<<<<<<< HEAD
        ${be(
||||||| 8cdb3c5
        ${ge(
=======
        ${me(
>>>>>>> origin/main
      "stimulus",
      "envelope",
      "Envelope",
<<<<<<< HEAD
      ea,
||||||| 8cdb3c5
      Co,
=======
      Bo,
>>>>>>> origin/main
      !0,
      l`
            <ha-form
              .hass=${this.hass}
<<<<<<< HEAD
              .data=${ir(s, sr)}
              .schema=${rr(e, s, this.hass, sr)}
              .error=${i}
              .computeLabel=${Qs}
              .computeHelper=${er}
||||||| 8cdb3c5
              .data=${Qs(s, this.toText, Js)}
              .schema=${Zs(e, Js)}
              .error=${r}
              .computeLabel=${Ks}
              .computeHelper=${Ys}
=======
              .data=${ei(s, Zs)}
              .schema=${Qs(e, s, this.hass, Zs)}
              .error=${r}
              .computeLabel=${Ys}
              .computeHelper=${Xs}
>>>>>>> origin/main
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(a, c)}
            <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
          `
    )}
<<<<<<< HEAD
        ${be(
||||||| 8cdb3c5
        ${ge(
=======
        ${me(
>>>>>>> origin/main
      "stimulus",
      "overrides",
      "Override preset",
<<<<<<< HEAD
      sa,
||||||| 8cdb3c5
      Lo,
=======
      Go,
>>>>>>> origin/main
      !1,
<<<<<<< HEAD
      ms.map((f) => this.renderOverride(f, s, o, i)),
||||||| 8cdb3c5
      hs.map((f) => this.renderOverride(f, s, o, r)),
      h === 0 ? u : c`<span class="badge">${h} overridden</span>`
=======
      hs.map((f) => this.renderOverride(f, s, o, r)),
>>>>>>> origin/main
      h === 0 ? u : l`<span class="badge">${h} overridden</span>`
    )}
      </ha-card>
    `;
  }
};
<<<<<<< HEAD
ce.styles = [
  C,
  S`
||||||| 8cdb3c5
J.styles = [
  T,
  A`
=======
ae.styles = [
  T,
  A`
>>>>>>> origin/main
      .live {
        margin-top: 8px;
      }
      .chip {
        white-space: nowrap;
      }
      /* Base shape of a badge; the .panel-header .badge rule in the shared styles gives it
         the neutral colour a count of overrides deserves, as opposed to a count of problems. */
      .badge {
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.75em;
        line-height: 1.6;
      }
    `
];
<<<<<<< HEAD
Ne([
||||||| 8cdb3c5
we([
=======
Le([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], ce.prototype, "hass", 2);
Ne([
||||||| 8cdb3c5
], J.prototype, "hass", 2);
we([
=======
], ae.prototype, "hass", 2);
Le([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], ce.prototype, "config", 2);
Ne([
||||||| 8cdb3c5
], J.prototype, "config", 2);
we([
=======
], ae.prototype, "config", 2);
Le([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], ce.prototype, "path", 2);
Ne([
||||||| 8cdb3c5
], J.prototype, "path", 2);
we([
=======
], ae.prototype, "path", 2);
Le([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], ce.prototype, "errors", 2);
Ne([
||||||| 8cdb3c5
], J.prototype, "errors", 2);
we([
=======
], ae.prototype, "errors", 2);
Le([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], ce.prototype, "live", 2);
ce = Ne([
  _("al-stimulus-editor")
], ce);
var wa = Object.defineProperty, _a = Object.getOwnPropertyDescriptor, re = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? _a(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && wa(t, s, i), i;
||||||| 8cdb3c5
], J.prototype, "live", 2);
we([
  g()
], J.prototype, "toText", 2);
J = we([
  k("al-stimulus-editor")
], J);
var Zo = Object.defineProperty, Qo = Object.getOwnPropertyDescriptor, Q = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Qo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Zo(t, s, r), r;
=======
], ae.prototype, "live", 2);
ae = Le([
  S("al-stimulus-editor")
], ae);
var da = Object.defineProperty, ha = Object.getOwnPropertyDescriptor, Q = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ha(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && da(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const ka = {
||||||| 8cdb3c5
const ea = {
=======
const ua = {
>>>>>>> origin/main
  label: "Name",
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
<<<<<<< HEAD
}, Ea = {
||||||| 8cdb3c5
}, ta = {
=======
}, pa = {
>>>>>>> origin/main
  label: "What this preset is called in the panel. Blank shows the id instead.",
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to travel from the peak to the sustain level.",
  sustain: "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
  release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
  impulse: "Fire and forget: the trigger ends the moment it starts, leaving only the release."
<<<<<<< HEAD
}, Sa = [
||||||| 8cdb3c5
}, sa = [
=======
}, fa = [
>>>>>>> origin/main
  "label",
  "id",
  "attack",
  "decay",
  "sustain",
  "release",
  "impulse"
<<<<<<< HEAD
], Aa = { boolean: {} }, Oa = [
||||||| 8cdb3c5
], ia = { boolean: {} }, ra = [
=======
], ga = { boolean: {} }, ma = [
>>>>>>> origin/main
  { name: "label", selector: { text: {} } },
  { name: "id", selector: { text: {} } },
<<<<<<< HEAD
  { name: "attack", selector: le },
  { name: "decay", selector: le },
  { name: "sustain", selector: hi },
  { name: "release", selector: le },
  { name: "impulse", selector: Aa }
], Pa = [
||||||| 8cdb3c5
  { name: "attack", selector: re },
  { name: "decay", selector: re },
  { name: "sustain", selector: Ji },
  { name: "release", selector: re },
  { name: "impulse", selector: ia }
], na = [
=======
  { name: "attack", selector: re },
  { name: "decay", selector: re },
  { name: "sustain", selector: tr },
  { name: "release", selector: re },
  { name: "impulse", selector: ga }
], va = [
>>>>>>> origin/main
  {
    name: "retrigger",
    label: ds,
    kind: "select",
    selector: fs,
    hint: hs
  },
  {
    name: "stack",
    label: us,
    kind: "boolean",
    selector: Ke,
    hint: ps
  },
  {
    name: "unavailable",
    label: "When unavailable",
    kind: "select",
<<<<<<< HEAD
    selector: pi
||||||| 8cdb3c5
    selector: Qi
=======
    selector: ir
>>>>>>> origin/main
  },
  {
    name: "debounce",
    label: "Debounce",
    kind: "duration",
    selector: le
  }
<<<<<<< HEAD
], ar = "text/plain", Ca = 36, Dt = (e) => e.stopPropagation();
let B = class extends b {
||||||| 8cdb3c5
], ei = "text/plain", oa = 36, Lt = (e) => e.stopPropagation();
let H = class extends b {
=======
], ii = "text/plain", ba = 36, Tt = (e) => e.stopPropagation();
let H = class extends b {
>>>>>>> origin/main
  constructor() {
<<<<<<< HEAD
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => ka[e.name] ?? e.name, this.computeHelper = (e) => Ea[e.name] ?? "";
||||||| 8cdb3c5
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => ea[e.name] ?? e.name, this.computeHelper = (e) => ta[e.name] ?? "";
=======
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => ua[e.name] ?? e.name, this.computeHelper = (e) => pa[e.name] ?? "";
>>>>>>> origin/main
  }
  /**
   * Keeps the selection pointing at a preset that still exists after an edit elsewhere, and
   * drops the delete warning: the references it names were counted against the old config.
   */
  willUpdate(e) {
    if (!e.has("config")) return;
    this.blocked = null;
    const t = this.config?.envelopes.length ?? 0;
    this.selected >= t && (this.selected = Math.max(0, t - 1));
  }
  emitChange(e, t) {
<<<<<<< HEAD
    this.dispatchEvent(D(e, t));
||||||| 8cdb3c5
    this.dispatchEvent(R(e, t));
=======
    this.dispatchEvent(M(e, t));
>>>>>>> origin/main
  }
  selectPreset(e) {
    this.selected = e, this.blocked = null;
  }
  /**
   * Points `defaults.envelope` at this preset. There is always exactly one default, so
   * the checkbox reads as a radio: the one already checked is disabled rather than
   * clearing to a document with no default preset at all, which the backend refuses.
   */
  setDefault(e) {
    const t = this.config, s = t?.envelopes[e];
    !t || !s || t.defaults.envelope === s.id || this.emitChange(
      O(t, ["defaults", "envelope"], s.id),
      "defaults:envelope"
    );
  }
  /**
   * Moves the preset at `from` into the slot `before` names in the list as it reads now.
   * Order is meaningful -- it is the order the panel lists presets in, and it round-trips
   * through the document -- so this is a real edit, one undo step per drop.
   *
   * The selection follows the preset it was on rather than its index, which is the only
   * reading that survives a drag that steps over it.
   */
  reorder(e, t) {
    const s = this.config;
    if (!s) return;
<<<<<<< HEAD
    const r = Sn(s, ["envelopes"], e, t);
    if (r === s) return;
    const i = s.envelopes[this.selected]?.id, n = r.envelopes.findIndex((o) => o.id === i);
    this.selected = n === -1 ? 0 : n, this.blocked = null, this.emitChange(r);
||||||| 8cdb3c5
    const i = dn(s, ["envelopes"], e, t);
    if (i === s) return;
    const r = s.envelopes[this.selected]?.id, n = i.envelopes.findIndex((o) => o.id === r);
    this.selected = n === -1 ? 0 : n, this.blocked = null, this.emitChange(i);
=======
    const i = fn(s, ["envelopes"], e, t);
    if (i === s) return;
    const r = s.envelopes[this.selected]?.id, n = i.envelopes.findIndex((o) => o.id === r);
    this.selected = n === -1 ? 0 : n, this.blocked = null, this.emitChange(i);
>>>>>>> origin/main
  }
  onDragStart(e, t) {
<<<<<<< HEAD
    e.dataTransfer?.setData(ar, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
||||||| 8cdb3c5
    e.dataTransfer?.setData(ei, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
=======
    e.dataTransfer?.setData(ii, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
>>>>>>> origin/main
  }
  onDragEnd() {
    this.dragging = null, this.dropAt = null;
  }
  /**
   * Which slot the pointer is naming: the top half of a row means "above it", the bottom
   * half "below it". A row the browser has not laid out yet reports a zero height, so the
   * stylesheet's `min-height` stands in and the answer is still one of the two.
   */
  slotFor(e, t) {
<<<<<<< HEAD
    const s = e.currentTarget.getBoundingClientRect(), r = s.height || Ca;
    return e.clientY - s.top < r / 2 ? t : t + 1;
||||||| 8cdb3c5
    const s = e.currentTarget.getBoundingClientRect(), i = s.height || oa;
    return e.clientY - s.top < i / 2 ? t : t + 1;
=======
    const s = e.currentTarget.getBoundingClientRect(), i = s.height || ba;
    return e.clientY - s.top < i / 2 ? t : t + 1;
>>>>>>> origin/main
  }
  /**
   * Whether this drag is ours. `getData` is unreadable during `dragover` -- the browser
   * holds the store in protected mode -- so the index comes from the state set at
   * `dragstart` and the type list is what says the thing over the row is one of our rows.
   */
  isOurs(e) {
<<<<<<< HEAD
    return this.dragging !== null && e.dataTransfer?.types.includes(ar) === !0;
||||||| 8cdb3c5
    return this.dragging !== null && e.dataTransfer?.types.includes(ei) === !0;
=======
    return this.dragging !== null && e.dataTransfer?.types.includes(ii) === !0;
>>>>>>> origin/main
  }
  onDragOver(e, t) {
    this.isOurs(e) && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move"), this.dropAt = this.slotFor(e, t));
  }
  onDrop(e, t) {
    const s = this.dragging;
    s !== null && (e.preventDefault(), this.reorder(s, this.slotFor(e, t)), this.onDragEnd());
  }
  /** Alt+Up/Down does what a drag does, for anyone not holding a mouse. */
  onRowKeydown(e, t) {
    !e.altKey || e.key !== "ArrowUp" && e.key !== "ArrowDown" || (e.preventDefault(), this.reorder(t, e.key === "ArrowUp" ? t - 1 : t + 2));
  }
  addPreset() {
    const e = this.config;
    if (!e) return;
    this.blocked = null;
    const t = e.envelopes.length;
    this.emitChange(
      lt(
        e,
        ["envelopes"],
        t,
<<<<<<< HEAD
        Dn(In(e, "preset"))
||||||| 8cdb3c5
        vn(wn(e, "preset"))
=======
        xn(En(e, "preset"))
>>>>>>> origin/main
      )
    ), this.selected = t;
  }
  removePreset(e) {
    const t = this.config;
    if (!t) return;
    const s = t.envelopes[e];
    if (!s) return;
<<<<<<< HEAD
    const r = jn(t, s.id);
    if (r.defaults || r.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...r };
||||||| 8cdb3c5
    const i = _n(t, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...i };
=======
    const i = An(t, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...i };
>>>>>>> origin/main
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(xt(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config, s = this.selected, r = t?.envelopes[s];
    if (!t || !r) return;
    const i = e.detail?.value ?? {}, n = typeof i.label == "string" ? i.label : r.label ?? "", o = {
      ...r,
      // Blank is "no label": the list falls back to the id, and the document carries a
      // null rather than an empty string nobody can tell apart from an unset one.
      label: n.trim() === "" ? null : n,
<<<<<<< HEAD
      id: String(i.id ?? ""),
      attack: J(i.attack) ?? r.attack,
      decay: J(i.decay) ?? r.decay,
      sustain: typeof i.sustain == "number" ? i.sustain : r.sustain,
      release: J(i.release) ?? r.release,
      impulse: typeof i.impulse == "boolean" ? i.impulse : r.impulse
    }, a = Sa.find((f) => o[f] !== r[f]);
||||||| 8cdb3c5
      id: String(r.id ?? ""),
      attack: oe(r.attack) ?? i.attack,
      decay: oe(r.decay) ?? i.decay,
      sustain: typeof r.sustain == "number" ? r.sustain : i.sustain,
      release: oe(r.release) ?? i.release,
      impulse: typeof r.impulse == "boolean" ? r.impulse : i.impulse
    }, a = sa.find((f) => o[f] !== i[f]);
=======
      id: String(r.id ?? ""),
      attack: oe(r.attack) ?? i.attack,
      decay: oe(r.decay) ?? i.decay,
      sustain: typeof r.sustain == "number" ? r.sustain : i.sustain,
      release: oe(r.release) ?? i.release,
      impulse: typeof r.impulse == "boolean" ? r.impulse : i.impulse
    }, a = fa.find((f) => o[f] !== i[f]);
>>>>>>> origin/main
    if (a === void 0) return;
<<<<<<< HEAD
    const c = ["envelopes", s], h = O(Fn(t, s, o.id), c, o);
    this.emitChange(h, `${g(c)}:${a}`);
||||||| 8cdb3c5
    const l = ["envelopes", s], h = P(Sn(t, s, o.id), l, o);
    this.emitChange(h, `${m(l)}:${a}`);
=======
    const c = ["envelopes", s], h = P(On(t, s, o.id), c, o);
    this.emitChange(h, `${m(c)}:${a}`);
>>>>>>> origin/main
  }
  setOverride(e, t) {
    const s = this.config, r = this.selected;
    if (!s || !s.envelopes[r]) return;
    const i = ["envelopes", r, e];
    this.emitChange(O(s, i, t), g(i));
  }
  render() {
    const e = this.config;
    return e ? l`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(e)}</div>
        <div>${this.renderEditor(e)}</div>
      </div>
    ` : l`<ha-card><span class="muted">Loading…</span></ha-card>`;
  }
  renderList(e) {
    const t = this.blocked;
    return l`
      <ha-card>
        <h3>Presets</h3>
<<<<<<< HEAD
        ${e.envelopes.map((s, r) => this.renderPresetRow(e, s, r))}
        ${e.envelopes.length === 0 ? l`<p class="muted">No presets yet.</p>` : u}
        ${t ? l`<ha-alert alert-type="warning">${La(t)}</ha-alert>` : u}
||||||| 8cdb3c5
        ${e.envelopes.map((s, i) => this.renderPresetRow(e, s, i))}
        ${e.envelopes.length === 0 ? c`<p class="muted">No presets yet.</p>` : u}
        ${t ? c`<ha-alert alert-type="warning">${la(t)}</ha-alert>` : u}
=======
        ${e.envelopes.map((s, i) => this.renderPresetRow(e, s, i))}
        ${e.envelopes.length === 0 ? l`<p class="muted">No presets yet.</p>` : u}
        ${t ? l`<ha-alert alert-type="warning">${ya(t)}</ha-alert>` : u}
>>>>>>> origin/main
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  /**
   * One row of the preset list: a drag handle, the display name over the id it is filed
   * under, its error count, the "is this the default" checkbox and delete.
   */
  renderPresetRow(e, t, s) {
    const r = _t(this.errors, ["envelopes", s]), i = e.defaults.envelope === t.id, n = this.dragging === null || this.dropAt === null ? "" : this.dropClass(s), o = [
      "row",
      "preset",
      this.selected === s ? "selected" : "",
      this.dragging === s ? "dragging" : "",
      n
    ].filter(Boolean).join(" ");
    return l`<div
      class=${o}
      data-index=${s}
      draggable="true"
      @dragstart=${(a) => this.onDragStart(a, s)}
      @dragend=${this.onDragEnd}
      @dragover=${(a) => this.onDragOver(a, s)}
      @drop=${(a) => this.onDrop(a, s)}
    >
      <ha-icon class="handle" icon="mdi:drag-horizontal-variant"></ha-icon>
      <button
        type="button"
        class="link grow names"
        title="Edit this preset"
        @click=${() => this.selectPreset(s)}
        @keydown=${(a) => this.onRowKeydown(a, s)}
      >
        <span class="name"
<<<<<<< HEAD
          >${t.id === "" && t.label === null ? "(unnamed preset)" : Nn(t)}</span
||||||| 8cdb3c5
          >${t.id === "" && t.label === null ? "(unnamed preset)" : bn(t)}</span
=======
          >${t.id === "" && t.label === null ? "(unnamed preset)" : wn(t)}</span
>>>>>>> origin/main
        >
        ${t.label !== null && t.label.trim() !== "" ? l`<span class="muted id">${t.id}</span>` : u}
      </button>
<<<<<<< HEAD
      ${r ? l`<span class="badge" title="${r} problem(s)">${r}</span>` : u}
||||||| 8cdb3c5
      ${i ? c`<span class="badge" title="${i} problem(s)">${i}</span>` : u}
=======
      ${i ? l`<span class="badge" title="${i} problem(s)">${i}</span>` : u}
>>>>>>> origin/main
      <label
        class="default"
        title=${i ? "This is the default preset" : "Set as default"}
      >
        <input
          type="checkbox"
          aria-label="Set as default"
          .checked=${i}
          .disabled=${i}
          draggable="false"
<<<<<<< HEAD
          @dragstart=${Dt}
          @click=${Dt}
||||||| 8cdb3c5
          @dragstart=${Lt}
          @click=${Lt}
=======
          @dragstart=${Tt}
          @click=${Tt}
>>>>>>> origin/main
          @change=${() => this.setDefault(s)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
<<<<<<< HEAD
        @dragstart=${Dt}
||||||| 8cdb3c5
        @dragstart=${Lt}
=======
        @dragstart=${Tt}
>>>>>>> origin/main
        @click=${() => this.removePreset(s)}
      >
        <ha-icon icon="mdi:delete"></ha-icon>
      </ha-icon-button>
    </div>`;
  }
  /**
   * Which edge of row `i` wears the insertion line. A slot sits between two rows, so it
   * is drawn on the row above it unless it is past the end of the list.
   */
  dropClass(e) {
    const t = this.dropAt, s = this.config?.envelopes.length ?? 0;
    return t === null ? "" : t === e ? "drop-before" : t === e + 1 && t === s ? "drop-after" : "";
  }
  renderEditor(e) {
    const t = this.selected, s = e.envelopes[t];
    if (!s)
      return l`<ha-card
        ><span class="muted">Select a preset.</span></ha-card
      >`;
<<<<<<< HEAD
    const r = ["envelopes", t], i = Z(this.errors, r), n = this.errors.filter((c) => c.path === g(r)), o = {
||||||| 8cdb3c5
    const i = ["envelopes", t], r = xe(this.errors, i), n = this.errors.filter((l) => l.path === m(i)), o = {
=======
    const i = ["envelopes", t], r = we(this.errors, i), n = this.errors.filter((c) => c.path === m(i)), o = {
>>>>>>> origin/main
      label: s.label ?? "",
      id: s.id,
      attack: X(s.attack),
      decay: X(s.decay),
      sustain: s.sustain,
      release: X(s.release),
      impulse: s.impulse
<<<<<<< HEAD
    }, a = Ta(e, t, s);
||||||| 8cdb3c5
    }, a = aa(e, t, s);
    return c`
=======
    }, a = $a(e, t, s);
>>>>>>> origin/main
    return l`
      <ha-card header="Envelope preset">
        ${n.map((c) => l`<ha-alert alert-type="error">${c.message}</ha-alert>`)}
        ${a ? l`<ha-alert alert-type="warning">${a}</ha-alert>` : u}
        <ha-form
          .hass=${this.hass}
          .data=${o}
<<<<<<< HEAD
          .schema=${Oa}
          .error=${i}
||||||| 8cdb3c5
          .schema=${ra}
          .error=${r}
=======
          .schema=${ma}
          .error=${r}
>>>>>>> origin/main
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
<<<<<<< HEAD
        ${Pa.map(
||||||| 8cdb3c5
        ${na.map(
      (l) => c`<al-override-field
=======
        ${va.map(
>>>>>>> origin/main
      (c) => l`<al-override-field
              .hass=${this.hass}
              .label=${c.label}
              .hint=${c.hint ?? ""}
              .kind=${c.kind}
<<<<<<< HEAD
              .selector=${c.kind === "boolean" ? Ke : c.selector}
||||||| 8cdb3c5
              .label=${l.label}
              .hint=${l.hint ?? ""}
              .kind=${l.kind}
              .selector=${l.kind === "boolean" ? qe : l.selector}
              .value=${s[l.name]}
              .inherited=${e.defaults[l.name]}
=======
              .selector=${c.kind === "boolean" ? qe : c.selector}
>>>>>>> origin/main
              .value=${s[c.name]}
              .inherited=${e.defaults[c.name]}
              .inheritedFrom=${"defaults"}
<<<<<<< HEAD
              .error=${i[c.name]}
||||||| 8cdb3c5
              .error=${r[l.name]}
              @value-changed=${(h) => this.setOverride(l.name, h.detail.value)}
=======
              .error=${r[c.name]}
>>>>>>> origin/main
              @value-changed=${(h) => this.setOverride(c.name, h.detail.value)}
            ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
B.styles = [
  C,
  S`
      h3 {
        margin: 16px 0 8px;
        font-size: 1em;
      }
      .preset {
        padding: 4px;
        border-radius: 4px;
        min-height: 36px;
        cursor: grab;
      }
      .preset.selected {
        background: var(--secondary-background-color);
      }
      .preset.dragging {
        opacity: 0.5;
      }
      /* The insertion point, drawn on the row the pointer is over rather than as a
         separate element, so the list never reflows mid-drag. */
      .preset.drop-before {
        box-shadow: inset 0 2px 0 0 var(--primary-color);
      }
      .preset.drop-after {
        box-shadow: inset 0 -2px 0 0 var(--primary-color);
      }
      .handle {
        color: var(--secondary-text-color);
        --mdc-icon-size: 18px;
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .names .id {
        font-size: 0.8em;
      }
      .default {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
      }
      .default input {
        accent-color: var(--primary-color);
        margin: 0;
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
re([
  d({ attribute: !1 })
], B.prototype, "hass", 2);
re([
  d({ attribute: !1 })
], B.prototype, "config", 2);
re([
  d({ attribute: !1 })
], B.prototype, "errors", 2);
re([
  d({ type: Boolean })
<<<<<<< HEAD
], B.prototype, "narrow", 2);
re([
  m()
], B.prototype, "selected", 2);
re([
  m()
], B.prototype, "blocked", 2);
re([
  m()
], B.prototype, "dragging", 2);
re([
  m()
], B.prototype, "dropAt", 2);
B = re([
  _("al-envelopes")
], B);
function Ta(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((r, i) => i !== t && r.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
||||||| 8cdb3c5
], H.prototype, "narrow", 2);
Q([
  g()
], H.prototype, "selected", 2);
Q([
  g()
], H.prototype, "blocked", 2);
Q([
  g()
], H.prototype, "dragging", 2);
Q([
  g()
], H.prototype, "dropAt", 2);
H = Q([
  k("al-envelopes")
], H);
function aa(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((i, r) => r !== t && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
=======
], H.prototype, "narrow", 2);
Q([
  g()
], H.prototype, "selected", 2);
Q([
  g()
], H.prototype, "blocked", 2);
Q([
  g()
], H.prototype, "dragging", 2);
Q([
  g()
], H.prototype, "dropAt", 2);
H = Q([
  S("al-envelopes")
], H);
function $a(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((i, r) => r !== t && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
>>>>>>> origin/main
}
<<<<<<< HEAD
function La(e) {
||||||| 8cdb3c5
function la(e) {
=======
function ya(e) {
>>>>>>> origin/main
  const t = [];
  return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(
    `group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`
  ), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
<<<<<<< HEAD
var Da = Object.defineProperty, Na = Object.getOwnPropertyDescriptor, St = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Na(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Da(t, s, i), i;
||||||| 8cdb3c5
var ca = Object.defineProperty, da = Object.getOwnPropertyDescriptor, St = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? da(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ca(t, s, r), r;
=======
var xa = Object.defineProperty, wa = Object.getOwnPropertyDescriptor, kt = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? wa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && xa(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const Ra = {
||||||| 8cdb3c5
const ha = {
=======
const _a = {
>>>>>>> origin/main
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: ds,
  stack: us,
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
<<<<<<< HEAD
}, Ma = {
||||||| 8cdb3c5
}, ua = {
=======
}, ka = {
>>>>>>> origin/main
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its trigger.",
  retrigger: hs,
  stack: ps,
  debounce: "Minimum time between triggers per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
<<<<<<< HEAD
}, Ia = [
||||||| 8cdb3c5
}, pa = [
=======
}, Sa = [
>>>>>>> origin/main
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "stack",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
<<<<<<< HEAD
], Nt = { duration: { enable_millisecond: !0 } }, ja = { number: { min: 0.1, step: 0.1, mode: "box" } }, Fa = {
||||||| 8cdb3c5
], Dt = { duration: { enable_millisecond: !0 } }, fa = { number: { min: 0.1, step: 0.1, mode: "box" } }, ga = {
=======
], Lt = { duration: { enable_millisecond: !0 } }, Ea = { number: { min: 0.1, step: 0.1, mode: "box" } }, Aa = {
>>>>>>> origin/main
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
<<<<<<< HEAD
}, Ha = { boolean: {} }, Ua = {
||||||| 8cdb3c5
}, ma = { boolean: {} }, va = {
=======
}, Oa = { boolean: {} }, Pa = {
>>>>>>> origin/main
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "End the trigger" }
    ]
  }
};
let Le = class extends b {
  constructor() {
<<<<<<< HEAD
    super(...arguments), this.errors = [], this.computeLabel = (e) => Ra[e.name] ?? e.name, this.computeHelper = (e) => Ma[e.name] ?? "";
||||||| 8cdb3c5
    super(...arguments), this.errors = [], this.computeLabel = (e) => ha[e.name] ?? e.name, this.computeHelper = (e) => ua[e.name] ?? "";
=======
    super(...arguments), this.errors = [], this.computeLabel = (e) => _a[e.name] ?? e.name, this.computeHelper = (e) => ka[e.name] ?? "";
>>>>>>> origin/main
  }
  schemaFor(e) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: e.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
<<<<<<< HEAD
      { name: "max_value", selector: ja },
      { name: "precision", selector: Fa },
      { name: "unavailable", selector: Ua },
      { name: "retrigger", selector: fs },
      { name: "stack", selector: Ha },
      { name: "debounce", selector: Nt },
      { name: "safety_refresh", selector: Nt },
      { name: "min_wake_interval", selector: Nt }
||||||| 8cdb3c5
      { name: "max_value", selector: fa },
      { name: "precision", selector: ga },
      { name: "unavailable", selector: va },
      { name: "retrigger", selector: ds },
      { name: "stack", selector: ma },
      { name: "debounce", selector: Dt },
      { name: "safety_refresh", selector: Dt },
      { name: "min_wake_interval", selector: Dt }
=======
      { name: "max_value", selector: Ea },
      { name: "precision", selector: Aa },
      { name: "unavailable", selector: Pa },
      { name: "retrigger", selector: ds },
      { name: "stack", selector: Oa },
      { name: "debounce", selector: Lt },
      { name: "safety_refresh", selector: Lt },
      { name: "min_wake_interval", selector: Lt }
>>>>>>> origin/main
    ];
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config;
    if (!t) return;
<<<<<<< HEAD
    const s = t.defaults, r = e.detail?.value ?? {}, i = Number(r.precision), n = {
      envelope: typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : s.envelope,
      max_value: typeof r.max_value == "number" ? r.max_value : s.max_value,
      precision: Number.isFinite(i) ? i : s.precision,
      unavailable: r.unavailable ?? s.unavailable,
      retrigger: r.retrigger ?? s.retrigger,
      stack: typeof r.stack == "boolean" ? r.stack : s.stack,
      debounce: J(r.debounce) ?? s.debounce,
      safety_refresh: J(r.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: J(r.min_wake_interval) ?? s.min_wake_interval
    }, o = Ia.find((a) => n[a] !== s[a]);
    o !== void 0 && this.emitChange(O(t, ["defaults"], n), `defaults:${o}`);
||||||| 8cdb3c5
    const s = t.defaults, i = e.detail?.value ?? {}, r = Number(i.precision), n = {
      envelope: typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : s.envelope,
      max_value: typeof i.max_value == "number" ? i.max_value : s.max_value,
      precision: Number.isFinite(r) ? r : s.precision,
      unavailable: i.unavailable ?? s.unavailable,
      retrigger: i.retrigger ?? s.retrigger,
      stack: typeof i.stack == "boolean" ? i.stack : s.stack,
      debounce: oe(i.debounce) ?? s.debounce,
      safety_refresh: oe(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: oe(i.min_wake_interval) ?? s.min_wake_interval
    }, o = pa.find((a) => n[a] !== s[a]);
    o !== void 0 && this.emitChange(P(t, ["defaults"], n), `defaults:${o}`);
=======
    const s = t.defaults, i = e.detail?.value ?? {}, r = Number(i.precision), n = {
      envelope: typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : s.envelope,
      max_value: typeof i.max_value == "number" ? i.max_value : s.max_value,
      precision: Number.isFinite(r) ? r : s.precision,
      unavailable: i.unavailable ?? s.unavailable,
      retrigger: i.retrigger ?? s.retrigger,
      stack: typeof i.stack == "boolean" ? i.stack : s.stack,
      debounce: oe(i.debounce) ?? s.debounce,
      safety_refresh: oe(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: oe(i.min_wake_interval) ?? s.min_wake_interval
    }, o = Sa.find((a) => n[a] !== s[a]);
    o !== void 0 && this.emitChange(P(t, ["defaults"], n), `defaults:${o}`);
>>>>>>> origin/main
  }
  emitChange(e, t) {
<<<<<<< HEAD
    this.dispatchEvent(D(e, t));
||||||| 8cdb3c5
    this.dispatchEvent(R(e, t));
=======
    this.dispatchEvent(M(e, t));
>>>>>>> origin/main
  }
  render() {
    const e = this.config;
    if (!e) return l`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
<<<<<<< HEAD
    const t = e.defaults, s = Z(this.errors, ["defaults"]), r = this.errors.filter((n) => n.path === "defaults"), i = {
||||||| 8cdb3c5
    if (!e) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const t = e.defaults, s = xe(this.errors, ["defaults"]), i = this.errors.filter((n) => n.path === "defaults"), r = {
=======
    const t = e.defaults, s = we(this.errors, ["defaults"]), i = this.errors.filter((n) => n.path === "defaults"), r = {
>>>>>>> origin/main
      envelope: t.envelope,
      max_value: t.max_value,
      precision: String(t.precision),
      unavailable: t.unavailable,
      retrigger: t.retrigger,
      stack: t.stack,
      debounce: X(t.debounce),
      safety_refresh: X(t.safety_refresh),
      min_wake_interval: X(t.min_wake_interval)
    };
    return l`
      <div class="pad">
        <ha-card header="Defaults">
<<<<<<< HEAD
          ${r.map((n) => l`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
||||||| 8cdb3c5
          ${i.map((n) => c`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
=======
          ${i.map((n) => l`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
>>>>>>> origin/main
          <ha-form
            .hass=${this.hass}
            .data=${i}
            .schema=${this.schemaFor(e)}
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
Le.styles = [
  C,
  S`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
kt([
  d({ attribute: !1 })
<<<<<<< HEAD
], Le.prototype, "hass", 2);
St([
||||||| 8cdb3c5
], Ce.prototype, "hass", 2);
St([
=======
], Ce.prototype, "hass", 2);
kt([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Le.prototype, "config", 2);
St([
||||||| 8cdb3c5
], Ce.prototype, "config", 2);
St([
=======
], Ce.prototype, "config", 2);
kt([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Le.prototype, "errors", 2);
Le = St([
  _("al-defaults")
], Le);
const vs = 0.1, bs = 10, $s = Math.log10(vs), za = Math.log10(bs), bi = za - $s, At = (e) => Math.min(bs, Math.max(vs, e)), ys = (e) => Math.round(e * 100) / 100, lr = (e) => ys(At(e));
function Ba(e) {
  return (Math.log10(At(e)) - $s) / bi;
||||||| 8cdb3c5
], Ce.prototype, "errors", 2);
Ce = St([
  k("al-defaults")
], Ce);
const ps = 0.1, fs = 10, gs = Math.log10(ps), ba = Math.log10(fs), rr = ba - gs, kt = (e) => Math.min(fs, Math.max(ps, e)), ms = (e) => Math.round(e * 100) / 100, ti = (e) => ms(kt(e));
function $a(e) {
  return (Math.log10(kt(e)) - gs) / rr;
=======
], Ce.prototype, "errors", 2);
Ce = kt([
  S("al-defaults")
], Ce);
const ps = 0.1, fs = 10, gs = Math.log10(ps), Ca = Math.log10(fs), lr = Ca - gs, St = (e) => Math.min(fs, Math.max(ps, e)), ms = (e) => Math.round(e * 100) / 100, ri = (e) => ms(St(e));
function Ta(e) {
  return (Math.log10(St(e)) - gs) / lr;
>>>>>>> origin/main
}
<<<<<<< HEAD
function Wa(e) {
||||||| 8cdb3c5
function ya(e) {
=======
function La(e) {
>>>>>>> origin/main
  const t = Math.min(1, Math.max(0, e));
<<<<<<< HEAD
  return ys(At(Math.pow(10, $s + t * bi)));
||||||| 8cdb3c5
  return ms(kt(Math.pow(10, gs + t * rr)));
=======
  return ms(St(Math.pow(10, gs + t * lr)));
>>>>>>> origin/main
}
<<<<<<< HEAD
function Ga(e, t, s = !1) {
  const r = s ? 1.05 : 1.25;
  return ys(At(t === 1 ? e * r : e / r));
||||||| 8cdb3c5
function xa(e, t, s = !1) {
  const i = s ? 1.05 : 1.25;
  return ms(kt(t === 1 ? e * i : e / i));
=======
function Da(e, t, s = !1) {
  const i = s ? 1.05 : 1.25;
  return ms(St(t === 1 ? e * i : e / i));
>>>>>>> origin/main
}
<<<<<<< HEAD
function Va(e) {
||||||| 8cdb3c5
function wa(e) {
=======
function Ma(e) {
>>>>>>> origin/main
  let t = e.toFixed(2).replace(/0+$/, "");
  return t.endsWith(".") && (t += "0"), t;
}
<<<<<<< HEAD
const qa = {
  min: vs,
  max: bs,
  toPosition: Ba,
  fromPosition: Wa,
  clamp: lr,
  step: (e, t, s = !1) => Ga(e, t, s),
  page: (e, t) => lr(t === 1 ? e * 2 : e / 2),
  format: Va,
||||||| 8cdb3c5
const _a = {
  min: ps,
  max: fs,
  toPosition: $a,
  fromPosition: ya,
  clamp: ti,
  step: (e, t, s = !1) => xa(e, t, s),
  page: (e, t) => ti(t === 1 ? e * 2 : e / 2),
  format: wa,
=======
const Na = {
  min: ps,
  max: fs,
  toPosition: Ta,
  fromPosition: La,
  clamp: ri,
  step: (e, t, s = !1) => Da(e, t, s),
  page: (e, t) => ri(t === 1 ? e * 2 : e / 2),
  format: Ma,
>>>>>>> origin/main
  reset: 1
<<<<<<< HEAD
}, Ka = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function Ya(e, t) {
  const s = e > 0 ? e : 1, r = Ka(t), i = 10 ** -r, n = (a) => Number(Math.min(s, Math.max(0, a)).toFixed(r)), o = Math.max(i, Number((s / 10).toFixed(r)));
||||||| 8cdb3c5
}, Sa = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function ka(e, t) {
  const s = e > 0 ? e : 1, i = Sa(t), r = 10 ** -i, n = (a) => Number(Math.min(s, Math.max(0, a)).toFixed(i)), o = Math.max(r, Number((s / 10).toFixed(i)));
=======
}, Ra = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function Ia(e, t) {
  const s = e > 0 ? e : 1, i = Ra(t), r = 10 ** -i, n = (a) => Number(Math.min(s, Math.max(0, a)).toFixed(i)), o = Math.max(r, Number((s / 10).toFixed(i)));
>>>>>>> origin/main
  return {
    min: 0,
    max: s,
    toPosition: (a) => Math.min(1, Math.max(0, a / s)),
    fromPosition: (a) => n(Math.min(1, Math.max(0, a)) * s),
    clamp: n,
<<<<<<< HEAD
    step: (a, c, h = !1) => n(a + c * (h ? i : o)),
    page: (a, c) => n(a + c * s / 4),
    format: (a) => wt(n(a), r),
||||||| 8cdb3c5
    step: (a, l, h = !1) => n(a + l * (h ? r : o)),
    page: (a, l) => n(a + l * s / 4),
    format: (a) => yt(n(a), i),
=======
    step: (a, c, h = !1) => n(a + c * (h ? r : o)),
    page: (a, c) => n(a + c * s / 4),
    format: (a) => yt(n(a), i),
>>>>>>> origin/main
    reset: null
  };
}
<<<<<<< HEAD
var Xa = Object.defineProperty, Ja = Object.getOwnPropertyDescriptor, V = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ja(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Xa(t, s, i), i;
||||||| 8cdb3c5
var Ea = Object.defineProperty, Aa = Object.getOwnPropertyDescriptor, z = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Aa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ea(t, s, r), r;
=======
var ja = Object.defineProperty, Fa = Object.getOwnPropertyDescriptor, B = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Fa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ja(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const Zt = 12, Rt = (e) => `${Math.round(e * 1e3) / 10}%`;
let I = class extends b {
||||||| 8cdb3c5
const Xt = 12, Rt = (e) => `${Math.round(e * 1e3) / 10}%`;
let M = class extends b {
=======
const Yt = 12, Dt = (e) => `${Math.round(e * 1e3) / 10}%`;
let R = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.focusable = !0, this.readOnly = !1, this.label = "Gain", this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1, this.onWheel = (e) => {
      this.disabled || e.deltaY === 0 || (e.preventDefault(), this.commit(this.scale.step(this.current, e.deltaY < 0 ? 1 : -1, e.shiftKey)));
    };
  }
  get scale() {
<<<<<<< HEAD
    return this.mode === "level" ? Ya(this.max, this.precision) : qa;
||||||| 8cdb3c5
    return this.mode === "level" ? ka(this.max, this.precision) : _a;
=======
    return this.mode === "level" ? Ia(this.max, this.precision) : Na;
>>>>>>> origin/main
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
  emit(e, t) {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e, live: t } }));
  }
  /** A value the host should keep: ends any drag and reports it as settled. */
  commit(e) {
    this.dragging = !1, this.dragValue = null, this.emit(e, !1);
  }
  onKeyDown(e) {
    if (this.disabled) return;
    const t = this.scale, s = this.current;
    let r;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        r = t.step(s, 1, e.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        r = t.step(s, -1, e.shiftKey);
        break;
      case "Home":
        r = t.min;
        break;
      case "End":
        r = t.max;
        break;
      case "PageUp":
        r = t.page(s, 1);
        break;
      case "PageDown":
        r = t.page(s, -1);
        break;
      default:
        return;
    }
    e.preventDefault(), e.stopPropagation(), this.commit(r);
  }
  /** Only a scale with a home to go back to answers a double-click; a level has none. */
  onDoubleClick() {
    const e = this.scale.reset;
    this.disabled || e === null || this.commit(e);
  }
  /** Maps a pointer's y onto the track: its top is the top of the scale, its bottom the floor. */
  moveTo(e, t) {
    const s = t.getBoundingClientRect();
    if (s.height <= 0) return;
    const r = this.scale.fromPosition(1 - (e.clientY - s.top) / s.height);
    r !== this.dragValue && (this.dragValue = r, this.emit(r, !0));
  }
  onPointerDown(e) {
    if (this.disabled) return;
    const t = e.currentTarget;
    e.preventDefault(), this.dragging = !0;
    try {
      t.setPointerCapture(e.pointerId);
    } catch {
    }
    this.moveTo(e, t);
  }
  onPointerMove(e) {
    this.dragging && this.moveTo(e, e.currentTarget);
  }
  onPointerUp(e) {
    if (this.dragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
      }
      this.commit(this.current);
    }
  }
  render() {
<<<<<<< HEAD
    const e = this.scale, t = e.clamp(this.current), s = e.toPosition(t), r = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), i = l`
      ${this.mode === "gain" ? l`<div class="unity"></div>` : u}
      <div class="fill" style="height: ${Rt(s)}"></div>
      ${r === null ? u : l`<div class="tick" style="bottom: ${Rt(e.toPosition(r))}" title=${e.format(r)}></div>`}
||||||| 8cdb3c5
    const e = this.scale, t = e.clamp(this.current), s = e.toPosition(t), i = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), r = c`
      ${this.mode === "gain" ? c`<div class="unity"></div>` : u}
      <div class="fill" style="height: ${Rt(s)}"></div>
      ${i === null ? u : c`<div class="tick" style="bottom: ${Rt(e.toPosition(i))}" title=${e.format(i)}></div>`}
=======
    const e = this.scale, t = e.clamp(this.current), s = e.toPosition(t), i = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), r = l`
      ${this.mode === "gain" ? l`<div class="unity"></div>` : u}
      <div class="fill" style="height: ${Dt(s)}"></div>
      ${i === null ? u : l`<div class="tick" style="bottom: ${Dt(e.toPosition(i))}" title=${e.format(i)}></div>`}
>>>>>>> origin/main
    `;
    return this.readOnly ? l`
        <div
          class="fader"
          role="meter"
          aria-label=${this.label}
          aria-valuemin=${e.min}
          aria-valuemax=${e.max}
          aria-valuenow=${t}
          aria-valuetext=${e.format(t)}
        >
          <div class="track">${i}</div>
          <div class="value">${e.format(t)}</div>
        </div>
      ` : l`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled || !this.focusable ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${e.min}
        aria-valuemax=${e.max}
        aria-valuenow=${t}
        aria-valuetext=${e.format(t)}
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
<<<<<<< HEAD
          ${i}
          <div class="knob" style="bottom: calc(${Rt(s)} - ${Math.round((s - 0.5) * Zt * 10) / 10}px - ${Zt / 2}px)"></div>
||||||| 8cdb3c5
          ${r}
          <div class="knob" style="bottom: calc(${Rt(s)} - ${Math.round((s - 0.5) * Xt * 10) / 10}px - ${Xt / 2}px)"></div>
=======
          ${r}
          <div class="knob" style="bottom: calc(${Dt(s)} - ${Math.round((s - 0.5) * Yt * 10) / 10}px - ${Yt / 2}px)"></div>
>>>>>>> origin/main
        </div>
        <div class="value">${e.format(t)}</div>
      </div>
    `;
  }
};
<<<<<<< HEAD
I.styles = S`
||||||| 8cdb3c5
M.styles = A`
=======
R.styles = A`
>>>>>>> origin/main
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
<<<<<<< HEAD
      height: ${Zt}px;
||||||| 8cdb3c5
      height: ${Xt}px;
=======
      height: ${Yt}px;
>>>>>>> origin/main
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
    /* Where the group would sit without the simulated stimulus holding it up. */
    .tick {
      position: absolute;
      left: -4px;
      right: -4px;
      border-top: 2px solid var(--warning-color, #ffa600);
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
    /* Nothing to take hold of, so nothing that invites it. */
    :host([readonly]) .track {
      cursor: default;
    }
  `;
<<<<<<< HEAD
V([
||||||| 8cdb3c5
z([
=======
B([
>>>>>>> origin/main
  d({ type: Number })
<<<<<<< HEAD
], I.prototype, "value", 2);
V([
||||||| 8cdb3c5
], M.prototype, "value", 2);
z([
=======
], R.prototype, "value", 2);
B([
>>>>>>> origin/main
  d({ type: Boolean, reflect: !0 })
<<<<<<< HEAD
], I.prototype, "disabled", 2);
V([
||||||| 8cdb3c5
], M.prototype, "disabled", 2);
z([
=======
], R.prototype, "disabled", 2);
B([
>>>>>>> origin/main
  d({ type: Boolean })
<<<<<<< HEAD
], I.prototype, "focusable", 2);
V([
||||||| 8cdb3c5
], M.prototype, "focusable", 2);
z([
=======
], R.prototype, "focusable", 2);
B([
>>>>>>> origin/main
  d({ type: Boolean, reflect: !0, attribute: "readonly" })
<<<<<<< HEAD
], I.prototype, "readOnly", 2);
V([
||||||| 8cdb3c5
], M.prototype, "readOnly", 2);
z([
=======
], R.prototype, "readOnly", 2);
B([
>>>>>>> origin/main
  d({ type: String })
<<<<<<< HEAD
], I.prototype, "label", 2);
V([
||||||| 8cdb3c5
], M.prototype, "label", 2);
z([
=======
], R.prototype, "label", 2);
B([
>>>>>>> origin/main
  d({ type: String })
<<<<<<< HEAD
], I.prototype, "mode", 2);
V([
||||||| 8cdb3c5
], M.prototype, "mode", 2);
z([
=======
], R.prototype, "mode", 2);
B([
>>>>>>> origin/main
  d({ type: Number })
<<<<<<< HEAD
], I.prototype, "max", 2);
V([
||||||| 8cdb3c5
], M.prototype, "max", 2);
z([
=======
], R.prototype, "max", 2);
B([
>>>>>>> origin/main
  d({ type: Number })
<<<<<<< HEAD
], I.prototype, "precision", 2);
V([
||||||| 8cdb3c5
], M.prototype, "precision", 2);
z([
=======
], R.prototype, "precision", 2);
B([
>>>>>>> origin/main
  d({ type: Number })
<<<<<<< HEAD
], I.prototype, "tick", 2);
V([
  m()
], I.prototype, "dragValue", 2);
I = V([
  _("al-fader")
], I);
const Za = { ATTRIBUTE: 1 }, Qa = (e) => (...t) => ({ _$litDirective$: e, values: t });
class el {
||||||| 8cdb3c5
], M.prototype, "tick", 2);
z([
  g()
], M.prototype, "dragValue", 2);
M = z([
  k("al-fader")
], M);
const Oa = { ATTRIBUTE: 1 }, Pa = (e) => (...t) => ({ _$litDirective$: e, values: t });
class Ca {
=======
], R.prototype, "tick", 2);
B([
  g()
], R.prototype, "dragValue", 2);
R = B([
  S("al-fader")
], R);
const Ha = { ATTRIBUTE: 1 }, Ua = (e) => (...t) => ({ _$litDirective$: e, values: t });
class za {
>>>>>>> origin/main
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, s, r) {
    this._$Ct = t, this._$AM = s, this._$Ci = r;
  }
  _$AS(t, s) {
    return this.update(t, s);
  }
  update(t, s) {
    return this.render(...s);
  }
}
<<<<<<< HEAD
const cr = Qa(class extends el {
||||||| 8cdb3c5
const si = Pa(class extends Ca {
=======
const ni = Ua(class extends za {
>>>>>>> origin/main
  constructor(e) {
<<<<<<< HEAD
    if (super(e), e.type !== Za.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
||||||| 8cdb3c5
    if (super(e), e.type !== Oa.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
=======
    if (super(e), e.type !== Ha.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
>>>>>>> origin/main
  }
  render(e) {
    return " " + Object.keys(e).filter((t) => e[t]).join(" ") + " ";
  }
  update(e, [t]) {
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), e.strings !== void 0 && (this.nt = new Set(e.strings.join(" ").split(/\s/).filter((r) => r !== "")));
      for (const r in t) t[r] && !this.nt?.has(r) && this.st.add(r);
      return this.render(t);
    }
    const s = e.element.classList;
    for (const r of this.st) r in t || (s.remove(r), this.st.delete(r));
    for (const r in t) {
      const i = !!t[r];
      i === this.st.has(r) || this.nt?.has(r) || (i ? (s.add(r), this.st.add(r)) : (s.remove(r), this.st.delete(r)));
    }
<<<<<<< HEAD
    return xe;
||||||| 8cdb3c5
    return be;
=======
    return $e;
>>>>>>> origin/main
  }
});
<<<<<<< HEAD
var tl = Object.defineProperty, sl = Object.getOwnPropertyDescriptor, Ot = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? sl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && tl(t, s, i), i;
||||||| 8cdb3c5
var Ta = Object.defineProperty, La = Object.getOwnPropertyDescriptor, Et = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? La(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ta(t, s, r), r;
=======
var Ba = Object.defineProperty, Wa = Object.getOwnPropertyDescriptor, Et = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Wa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ba(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const rl = (e) => `${Math.round(e * 1e3) / 10}%`;
let De = class extends b {
||||||| 8cdb3c5
const Da = (e) => `${Math.round(e * 1e3) / 10}%`;
let Te = class extends b {
=======
const Ga = (e) => `${Math.round(e * 1e3) / 10}%`;
let Te = class extends b {
>>>>>>> origin/main
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
    const e = this.ratio;
    return l`
      <div class="meter">
<<<<<<< HEAD
        <div class=${cr({ fill: !0, hot: e > 0.9 })} style="width: ${rl(e)}"></div>
||||||| 8cdb3c5
        <div class=${si({ fill: !0, hot: e > 0.9 })} style="width: ${Da(e)}"></div>
=======
        <div class=${ni({ fill: !0, hot: e > 0.9 })} style="width: ${Ga(e)}"></div>
>>>>>>> origin/main
      </div>
<<<<<<< HEAD
      <div class=${cr({ dot: !0, gated: this.gated })}></div>
||||||| 8cdb3c5
      <div class=${si({ dot: !0, gated: this.gated })}></div>
=======
      <div class=${ni({ dot: !0, gated: this.gated })}></div>
>>>>>>> origin/main
    `;
  }
};
De.styles = S`
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
Ot([
  d({ type: Number })
], De.prototype, "value", 2);
Ot([
  d({ type: Number })
], De.prototype, "max", 2);
Ot([
  d({ type: Boolean })
<<<<<<< HEAD
], De.prototype, "gated", 2);
De = Ot([
  _("al-meter")
], De);
var il = Object.defineProperty, nl = Object.getOwnPropertyDescriptor, U = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? nl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && il(t, s, i), i;
||||||| 8cdb3c5
], Te.prototype, "gated", 2);
Te = Et([
  k("al-meter")
], Te);
var Ra = Object.defineProperty, Ma = Object.getOwnPropertyDescriptor, F = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ma(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ra(t, s, r), r;
=======
], Te.prototype, "gated", 2);
Te = Et([
  S("al-meter")
], Te);
var Va = Object.defineProperty, qa = Object.getOwnPropertyDescriptor, F = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? qa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Va(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const ol = 250;
let N = class extends b {
||||||| 8cdb3c5
const Na = 250;
let D = class extends b {
=======
const Ka = 250;
let D = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.label = "", this.editable = !1, this.value = 0, this.realValue = 0, this.maxValue = 5, this.precision = 1, this.liveNow = 0, this.muted = !1, this.selected = !1, this.errors = 0, this.pending = null, this.dragging = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.hasAttribute("tabindex") || (this.tabIndex = -1);
  }
  disconnectedCallback() {
    this.clearStepTimer(), super.disconnectedCallback();
  }
  willUpdate(e) {
    (e.has("liveNow") || e.has("value")) && !this.dragging && (this.pending = null), e.has("editable") && !this.editable && (this.dragging = !1, this.pending = null, this.clearStepTimer());
  }
  /**
   * The engine's own answer to the last override, ahead of the live frame that will carry
   * it: the level actually reached, or `null` for "the ask never landed". Either way the
   * fader stops showing what was asked for. A drag that has already taken the fader back
   * over outranks it - the pointer is the newer intent.
   */
  settle(e) {
    this.dragging || (this.pending = e);
  }
  /** `0` on the selected strip, `-1` on every other one: the row is a single tab stop. */
  get stop() {
    return this.selected ? 0 : -1;
  }
  select() {
<<<<<<< HEAD
    this.dispatchEvent(co());
||||||| 8cdb3c5
    this.dispatchEvent(Gn());
=======
    this.dispatchEvent(Zn());
>>>>>>> origin/main
  }
  clearStepTimer() {
    this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
  }
  sendOverride(e) {
<<<<<<< HEAD
    this.clearStepTimer(), this.dispatchEvent(Ks(e));
||||||| 8cdb3c5
    this.clearStepTimer(), this.dispatchEvent(Bs(e));
=======
    this.clearStepTimer(), this.dispatchEvent(Ws(e));
>>>>>>> origin/main
  }
  /**
   * A fader move. A drag reports its steps live and settles on pointer-up, which is the
   * user saying "there" - that goes out at once. A keyboard or wheel step settles
   * immediately with no live moves before it, so a run of them is coalesced instead.
   *
   * A read-only fader reports nothing, but the guard is here as well: the level is the
   * engine's, and Edit mode is the only thing that says it may be written to.
   */
  onFader(e) {
    if (e.stopPropagation(), !this.editable) return;
    const { value: t, live: s } = e.detail;
    if (this.pending = t, s) {
      this.dragging = !0;
      return;
    }
    if (this.dragging) {
      this.dragging = !1, this.sendOverride(t);
      return;
    }
    this.clearStepTimer(), this.stepTimer = window.setTimeout(() => {
<<<<<<< HEAD
      this.stepTimer = void 0, this.dispatchEvent(Ks(t));
    }, ol);
||||||| 8cdb3c5
      this.stepTimer = void 0, this.dispatchEvent(Bs(t));
    }, Na);
=======
      this.stepTimer = void 0, this.dispatchEvent(Ws(t));
    }, Ka);
>>>>>>> origin/main
  }
  onMute() {
<<<<<<< HEAD
    this.dispatchEvent(ho(!this.muted));
||||||| 8cdb3c5
    this.dispatchEvent(Wn(!this.muted));
=======
    this.dispatchEvent(Qn(!this.muted));
>>>>>>> origin/main
  }
  onReset() {
<<<<<<< HEAD
    this.dispatchEvent(uo());
||||||| 8cdb3c5
    this.dispatchEvent(Vn());
=======
    this.dispatchEvent(eo());
>>>>>>> origin/main
  }
  render() {
    const e = this.pending ?? this.value;
    return l`
      <div class="strip" @click=${this.select}>
        <div class="head">
          <span class="name" title=${this.label}>${this.label}</span>
        </div>
        <al-fader
          mode="level"
          ?readonly=${!this.editable}
          .value=${e}
          .max=${this.maxValue}
          .precision=${this.precision}
          .tick=${this.realValue}
          .focusable=${this.selected}
          label=${`${this.label} level`}
          @value-changed=${this.onFader}
        ></al-fader>
<<<<<<< HEAD
        <div class="readout">${wt(e, this.precision)}</div>
||||||| 8cdb3c5
        <div class="readout">${yt(e, this.precision)}</div>
        ${this.editable ? c`<div class="buttons">
=======
        <div class="readout">${yt(e, this.precision)}</div>
>>>>>>> origin/main
        ${this.editable ? l`<div class="buttons">
              <button
                class="mute"
                type="button"
                tabindex=${this.stop}
                aria-pressed=${this.muted ? "true" : "false"}
                title=${this.muted ? `Unmute ${this.label}` : `Mute ${this.label}`}
                @click=${this.onMute}
              >
                M
              </button>
              <button
                class="reset"
                type="button"
                tabindex=${this.stop}
                title=${`Reset ${this.label}`}
                @click=${this.onReset}
              >
                R
              </button>
            </div>` : u}
        <div class="foot">
          ${this.errors > 0 ? l`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : u}
        </div>
      </div>
    `;
  }
};
N.styles = S`
    :host {
      display: block;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 6px;
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
      cursor: pointer;
      outline: none;
    }
    :host([selected]),
    :host(:focus-visible) {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    :host([muted]) .name,
    :host([muted]) .readout {
      opacity: 0.55;
    }
    /* One column, one baseline: the name is a fixed line and the fader a fixed height, so
       the meter and the readout land at the same place on every strip in the row. */
    .strip {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      min-width: 0;
      height: 100%;
    }
    .head {
      display: flex;
      align-items: center;
      min-width: 0;
      height: 1.4em;
    }
    .name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }
    button {
      background: none;
      border: 1px solid transparent;
      margin: 0;
      padding: 0 4px;
      font: inherit;
      font-size: 0.75em;
      color: inherit;
      border-radius: 4px;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    al-fader {
      align-self: center;
    }
    .readout {
      text-align: center;
      font-size: 0.85em;
      font-variant-numeric: tabular-nums;
    }
    .buttons {
      display: flex;
      justify-content: center;
      gap: 4px;
    }
    .buttons button {
      border-color: var(--divider-color, #e0e0e0);
      min-width: 22px;
      line-height: 1.6;
    }
    .mute[aria-pressed="true"] {
      background: var(--warning-color, #ffa600);
      color: var(--text-primary-color, #fff);
      border-color: var(--warning-color, #ffa600);
    }
    /* Pushed to the bottom, so a badge on one strip does not shorten the others. */
    .foot {
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 20px;
      margin-top: auto;
    }
    .badge {
      background: var(--error-color, #db4437);
      color: var(--text-primary-color, #fff);
      border-radius: 10px;
      padding: 0 6px;
      font-size: 0.7em;
      line-height: 1.6;
    }
  `;
U([
  d({ type: String })
], N.prototype, "label", 2);
U([
  d({ type: Boolean, reflect: !0 })
], N.prototype, "editable", 2);
U([
  d({ type: Number })
], N.prototype, "value", 2);
U([
  d({ type: Number })
], N.prototype, "realValue", 2);
U([
  d({ type: Number })
], N.prototype, "maxValue", 2);
U([
  d({ type: Number })
], N.prototype, "precision", 2);
U([
  d({ type: Number })
], N.prototype, "liveNow", 2);
U([
  d({ type: Boolean, reflect: !0 })
], N.prototype, "muted", 2);
U([
  d({ type: Boolean, reflect: !0 })
], N.prototype, "selected", 2);
U([
  d({ type: Number })
<<<<<<< HEAD
], N.prototype, "errors", 2);
U([
  m()
], N.prototype, "pending", 2);
N = U([
  _("al-strip")
], N);
var al = Object.defineProperty, ll = Object.getOwnPropertyDescriptor, ie = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ll(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && al(t, s, i), i;
||||||| 8cdb3c5
], D.prototype, "errors", 2);
F([
  g()
], D.prototype, "pending", 2);
D = F([
  k("al-strip")
], D);
var Ia = Object.defineProperty, ja = Object.getOwnPropertyDescriptor, ee = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ja(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ia(t, s, r), r;
=======
], D.prototype, "errors", 2);
F([
  g()
], D.prototype, "pending", 2);
D = F([
  S("al-strip")
], D);
var Ya = Object.defineProperty, Xa = Object.getOwnPropertyDescriptor, ee = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Xa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ya(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const cl = 8e3, dl = (e) => e instanceof Error ? e.message : String(e);
let W = class extends b {
||||||| 8cdb3c5
const Fa = 8e3, Ha = (e) => e instanceof Error ? e.message : String(e);
let U = class extends b {
=======
const Ja = 8e3, Za = (e) => e instanceof Error ? e.message : String(e);
let U = class extends b {
>>>>>>> origin/main
  constructor() {
<<<<<<< HEAD
    super(...arguments), this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.live = null, this.narrow = !1, this.editing = Vn(), this.commandError = null, this.pendingFocus = !1;
||||||| 8cdb3c5
    super(...arguments), this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.live = null, this.narrow = !1, this.editing = Tn(), this.commandError = null, this.pendingFocus = !1;
=======
    super(...arguments), this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.live = null, this.narrow = !1, this.editing = Nn(), this.commandError = null, this.pendingFocus = !1;
>>>>>>> origin/main
  }
  disconnectedCallback() {
    this.clearErrorTimer(), super.disconnectedCallback();
  }
  get tracks() {
    return this.config ? ut(this.config, this.nav) : [];
  }
  /** The group the selection names, or the one that owns the selected stimulus. */
  get selected() {
    const { config: e, nav: t } = this;
    if (!e || t.selection === null) return null;
<<<<<<< HEAD
    const s = qr(t.selection), r = L(e, s);
    return r === void 0 ? null : { path: s, group: r };
||||||| 8cdb3c5
    const s = Ri(t.selection), i = L(e, s);
    return i === void 0 ? null : { path: s, group: i };
=======
    const s = Ii(t.selection), i = L(e, s);
    return i === void 0 ? null : { path: s, group: i };
>>>>>>> origin/main
  }
  /**
   * Which group's band owns the row's one tab stop, so a caret or a closed tab joins the
   * tab order behind the strip it belongs to rather than adding stops of its own.
   */
  get selectedId() {
    return this.selected?.group.id ?? null;
  }
  isSelected(e) {
    return this.nav.selection !== null && g(this.nav.selection) === g(e);
  }
  navigate(e) {
    this.pendingFocus = !0, this.dispatchEvent(Ys(e));
  }
  clearErrorTimer() {
    this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
  }
  fail(e) {
    this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
      this.errorTimer = void 0, this.commandError = null;
<<<<<<< HEAD
    }, cl);
||||||| 8cdb3c5
    }, Fa);
=======
    }, Ja);
>>>>>>> origin/main
  }
  /**
   * Runs one engine command. A command that lands is followed by a request for a live
   * frame rather than a wait for the next poll: two seconds of a mute button that looks
   * like it did nothing is two seconds of pressing it again.
   *
   * `strip` is the track the command came from, when it was one that holds the fader
   * against its answer: a refused command has no answer coming, so the fader is let go
   * here rather than left at a level the engine never took.
   */
  async command(e, t, s) {
    const r = this.hass;
    if (r)
      try {
<<<<<<< HEAD
        await t(r), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(po());
      } catch (i) {
        s?.settle(null), this.fail(`Could not ${e}: ${dl(i)}`);
||||||| 8cdb3c5
        await t(i), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(qn());
      } catch (r) {
        s?.settle(null), this.fail(`Could not ${e}: ${Ha(r)}`);
=======
        await t(i), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(to());
      } catch (r) {
        s?.settle(null), this.fail(`Could not ${e}: ${Za(r)}`);
>>>>>>> origin/main
      }
  }
  /** Which track an event came from: strips are identical, so the row index is the key. */
  trackOf(e) {
    const t = e.target?.dataset?.index;
    return t === void 0 ? null : this.tracks[Number(t)] ?? null;
  }
  onStripSelect(e) {
    const t = this.trackOf(e);
    t && this.dispatchEvent(Ys({ type: "select", path: t.path }));
  }
  onLevelOverride(e) {
    const t = this.trackOf(e);
    if (!t) return;
    const s = e.target, { value: r } = e.detail;
    this.command(
      `set the level of ${t.id}`,
<<<<<<< HEAD
      async (i) => s.settle(await nn(i, t.id, r)),
||||||| 8cdb3c5
      async (r) => s.settle(await Br(r, t.id, i)),
=======
      async (r) => s.settle(await qr(r, t.id, i)),
>>>>>>> origin/main
      s
    );
  }
  onMuteToggle(e) {
    const t = this.trackOf(e);
    if (!t) return;
    const { muted: s } = e.detail;
<<<<<<< HEAD
    this.command(`${s ? "mute" : "unmute"} ${t.id}`, (r) => on(r, t.id, s));
||||||| 8cdb3c5
    this.command(`${s ? "mute" : "unmute"} ${t.id}`, (i) => Gr(i, t.id, s));
=======
    this.command(`${s ? "mute" : "unmute"} ${t.id}`, (i) => Kr(i, t.id, s));
>>>>>>> origin/main
  }
  onReset(e) {
    const t = this.trackOf(e);
<<<<<<< HEAD
    t && this.command(`reset ${t.id}`, (s) => an(s, t.id));
||||||| 8cdb3c5
    t && this.command(`reset ${t.id}`, (s) => Wr(s, t.id));
=======
    t && this.command(`reset ${t.id}`, (s) => Yr(s, t.id));
>>>>>>> origin/main
  }
  onEditToggle(e) {
<<<<<<< HEAD
    this.editing = e.target.checked === !0, qn(this.editing);
||||||| 8cdb3c5
    this.editing = e.target.checked === !0, Ln(this.editing);
=======
    this.editing = e.target.checked === !0, Rn(this.editing);
>>>>>>> origin/main
  }
  /** Opening or closing a band is its own intent: it must not also read as a selection. */
  onBandToggle(e) {
    e.stopPropagation();
    const t = e.currentTarget.dataset.band;
    t !== void 0 && this.navigate({ type: "toggle", id: t });
  }
  /**
   * Enter and Space on a band belong to the band. The row listens for them too and would
   * toggle the same group a second time; and the closed tab is a `div`, so on that one the
   * key has to do the work a button would have done for it.
   */
  onBandKey(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.stopPropagation();
    const t = e.currentTarget;
    if (t.tagName === "BUTTON") return;
    e.preventDefault();
    const s = t.dataset.band;
    s !== void 0 && this.navigate({ type: "toggle", id: s });
  }
  /** Console keys: ←/→ walk the row, Enter or Space opens and closes, Home/End jump. */
  onKeyDown(e) {
    const t = this.config;
    if (t)
      switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft":
          e.preventDefault(), this.navigate({ type: "arrow", delta: e.key === "ArrowRight" ? 1 : -1, config: t });
          break;
        case "Enter":
        case " ": {
          const s = this.nav.selection, r = s === null ? void 0 : this.tracks.find((i) => g(i.path) === g(s));
          if (!r?.hasChildren) return;
          e.preventDefault(), this.navigate({ type: "toggle", id: r.id });
          break;
        }
        case "Home":
        case "End":
          e.preventDefault(), this.navigate({ type: e.key === "Home" ? "home" : "end", config: t });
          break;
      }
  }
  updated(e) {
    if (!e.has("nav")) return;
    const t = this.pendingFocus;
    this.pendingFocus = !1, this.revealSelected(t);
  }
  /**
   * Keeps the one strip in the tab order on screen after the row has been re-rendered, and
   * on the keyboard when the move was the user's.
   */
  async revealSelected(e) {
    await this.updateComplete;
    const t = this.shadowRoot?.querySelector('al-strip[tabindex="0"]');
    if (t) {
      e && t.focus();
      try {
        t.scrollIntoView?.({ inline: "nearest", block: "nearest" });
      } catch {
      }
    }
  }
<<<<<<< HEAD
  renderTrack(e, t, s, r) {
    const i = L(e, t.path);
    if (!i) return l``;
    const n = this.live?.groups[i.id], o = this.isSelected(t.path);
||||||| 8cdb3c5
  renderTrack(e, t, s, i) {
    const r = L(e, t.path);
    if (!r) return c``;
    const n = this.live?.groups[r.id], o = this.isSelected(t.path);
    return c`
=======
  renderTrack(e, t, s, i) {
    const r = L(e, t.path);
    if (!r) return l``;
    const n = this.live?.groups[r.id], o = this.isSelected(t.path);
>>>>>>> origin/main
    return l`
      <al-strip
        data-index=${s}
        style="grid-column: ${r.columns[s]}; grid-row: ${r.rows + 1};"
        tabindex=${o ? 0 : -1}
        ?editable=${this.editing}
        .label=${i.name ?? i.id}
        .value=${n?.value ?? 0}
        .liveNow=${this.live?.now ?? 0}
        .realValue=${n?.real_value ?? 0}
<<<<<<< HEAD
        .maxValue=${n?.max_value ?? i.max_value ?? e.defaults.max_value}
        .precision=${n?.precision ?? as(e, i)}
||||||| 8cdb3c5
        .maxValue=${n?.max_value ?? r.max_value ?? e.defaults.max_value}
        .precision=${n?.precision ?? rs(e, r)}
=======
        .maxValue=${n?.max_value ?? r.max_value ?? e.defaults.max_value}
        .precision=${n?.precision ?? is(e, r)}
>>>>>>> origin/main
        .muted=${n?.muted ?? !1}
        .selected=${o}
        .errors=${_t(this.errors, t.path)}
      ></al-strip>
    `;
  }
  renderBand(e, t) {
<<<<<<< HEAD
    const s = e.expanded ? e.depth + 1 : t.rows + 1, r = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${s};`, i = e.id === this.selectedId ? 0 : -1;
    return e.expanded ? l`
          <div class="band" role="group" aria-label=${e.label} style=${r}>
||||||| 8cdb3c5
    const s = e.expanded ? e.depth + 1 : t.rows + 1, i = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${s};`, r = e.id === this.selectedId ? 0 : -1;
    return e.expanded ? c`
          <div class="band" role="group" aria-label=${e.label} style=${i}>
=======
    const s = e.expanded ? e.depth + 1 : t.rows + 1, i = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${s};`, r = e.id === this.selectedId ? 0 : -1;
    return e.expanded ? l`
          <div class="band" role="group" aria-label=${e.label} style=${i}>
>>>>>>> origin/main
            <button
              class="caret"
              type="button"
              data-band=${e.id}
              tabindex=${i}
              aria-expanded="true"
              aria-label=${`Collapse ${e.label}`}
              title=${`Collapse ${e.label}`}
              @click=${this.onBandToggle}
              @keydown=${this.onBandKey}
            >
              ▾
            </button>
            <span class="label" title=${e.label}>${e.label}</span>
          </div>
        ` : l`
          <div
            class="tab"
            role="button"
            data-band=${e.id}
            tabindex=${i}
            aria-expanded="false"
            aria-label=${`Expand ${e.label}`}
            title=${`Expand ${e.label}`}
            style=${r}
            @click=${this.onBandToggle}
            @keydown=${this.onBandKey}
          >
            <span class="label">${e.label}</span>
          </div>
        `;
  }
  render() {
    const e = this.config;
    if (!e || e.groups.length === 0)
      return l`<div class="empty muted">Nothing to mix: add a group first.</div>`;
<<<<<<< HEAD
    const t = zn(e, this.nav), s = t.kinds.map((i) => i === "tab" ? "var(--al-tab-w)" : "var(--al-strip-w)").join(" "), r = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
||||||| 8cdb3c5
      return c`<div class="empty muted">Nothing to mix: add a group first.</div>`;
    const t = An(e, this.nav), s = t.kinds.map((r) => r === "tab" ? "var(--al-tab-w)" : "var(--al-strip-w)").join(" "), i = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
    return c`
      ${this.commandError === null ? u : c`<ha-alert
=======
    const t = Tn(e, this.nav), s = t.kinds.map((r) => r === "tab" ? "var(--al-tab-w)" : "var(--al-strip-w)").join(" "), i = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
>>>>>>> origin/main
    return l`
      ${this.commandError === null ? u : l`<ha-alert
            class="command-error"
            alert-type="error"
            dismissable
            @alert-dismissed-clicked=${() => {
      this.clearErrorTimer(), this.commandError = null;
    }}
            >${this.commandError}</ha-alert
          >`}
      <div class="toolbar">
        <label class="edit">
          <ha-switch class="edit-switch" .checked=${this.editing} @change=${this.onEditToggle}></ha-switch>
          <span>Edit</span>
        </label>
      </div>
      <div
        class="grid"
        role="group"
        aria-label="Mixer"
        style="grid-template-columns: ${s}; grid-template-rows: ${r};"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-level-override=${this.onLevelOverride}
        @al-mute-toggle=${this.onMuteToggle}
        @al-reset=${this.onReset}
      >
        ${t.bands.map((i) => this.renderBand(i, t))}
        ${this.tracks.map((i, n) => this.renderTrack(e, i, n, t))}
      </div>
    `;
  }
};
W.styles = [
  C,
  S`
      :host {
        display: block;
        background: none;
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 4px;
      }
      .edit {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }
      /* A column per strip, plus a narrow one after each closed group; a row per level of
         nesting that has a band, and the strips themselves on the last one. */
      .grid {
        display: grid;
        gap: 8px;
        align-items: stretch;
        justify-content: start;
        overflow-x: auto;
        padding: 4px;
        outline: none;
        --al-strip-w: 96px;
        --al-tab-w: 26px;
      }
      :host([narrow]) .grid {
        --al-strip-w: 72px;
      }
      /* A bracket over the run of strips it owns: open at the bottom, into them. */
      .band {
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
        box-sizing: border-box;
        padding: 2px 6px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-bottom: none;
        border-radius: 6px 6px 0 0;
        background: var(--secondary-background-color);
      }
      .band .label,
      .tab .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.8em;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .caret {
        flex: 0 0 auto;
        background: none;
        border: 1px solid transparent;
        margin: 0;
        padding: 0 2px;
        font: inherit;
        font-size: 0.8em;
        color: var(--secondary-text-color);
        border-radius: 4px;
        cursor: pointer;
      }
      .caret:focus-visible,
      .tab:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      /* A closed band, stood on end beside the strip it belongs to: the whole subtree,
         folded into one column that opens it again. */
      .tab {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        min-width: 0;
        padding: 4px 0;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        outline: none;
      }
      .tab .label {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        max-height: 100%;
      }
      .empty {
        padding: 8px 4px;
      }
    `
];
ie([
  d({ attribute: !1 })
], W.prototype, "hass", 2);
ie([
  d({ attribute: !1 })
], W.prototype, "config", 2);
ie([
  d({ attribute: !1 })
], W.prototype, "nav", 2);
ie([
  d({ attribute: !1 })
], W.prototype, "errors", 2);
ie([
  d({ attribute: !1 })
], W.prototype, "live", 2);
ie([
  d({ type: Boolean, reflect: !0 })
<<<<<<< HEAD
], W.prototype, "narrow", 2);
ie([
  m()
], W.prototype, "editing", 2);
ie([
  m()
], W.prototype, "commandError", 2);
W = ie([
  _("al-mixer")
], W);
const hl = {
||||||| 8cdb3c5
], U.prototype, "narrow", 2);
ee([
  g()
], U.prototype, "editing", 2);
ee([
  g()
], U.prototype, "commandError", 2);
U = ee([
  k("al-mixer")
], U);
const Ua = {
=======
], U.prototype, "narrow", 2);
ee([
  g()
], U.prototype, "editing", 2);
ee([
  g()
], U.prototype, "commandError", 2);
U = ee([
  S("al-mixer")
], U);
const Qa = {
>>>>>>> origin/main
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
<<<<<<< HEAD
}, ul = {
||||||| 8cdb3c5
}, za = {
=======
}, el = {
>>>>>>> origin/main
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400
};
<<<<<<< HEAD
function pl(e, t, s) {
||||||| 8cdb3c5
function Ba(e, t, s) {
=======
function tl(e, t, s) {
>>>>>>> origin/main
  return {
<<<<<<< HEAD
    start: e - hl[t],
||||||| 8cdb3c5
    start: e - Ua[t],
=======
    start: e - Qa[t],
>>>>>>> origin/main
    end: e,
    resolution: t === "24h" ? "5m" : "1h",
<<<<<<< HEAD
    forecastUntil: s === "off" ? void 0 : e + ul[s]
||||||| 8cdb3c5
    forecastUntil: s === "off" ? void 0 : e + za[s]
=======
    forecastUntil: s === "off" ? void 0 : e + el[s]
>>>>>>> origin/main
  };
}
<<<<<<< HEAD
function fl(e, t, s) {
  const r = t - e || 1;
  return (i) => (i - e) / r * s;
||||||| 8cdb3c5
function Ga(e, t, s) {
  const i = t - e || 1;
  return (r) => (r - e) / i * s;
=======
function sl(e, t, s) {
  const i = t - e || 1;
  return (r) => (r - e) / i * s;
>>>>>>> origin/main
}
<<<<<<< HEAD
function ml(e, t, s = 4) {
  const r = e || 1, i = t - 2 * s;
  return (n) => t - s - n / r * i;
||||||| 8cdb3c5
function Wa(e, t, s = 4) {
  const i = e || 1, r = t - 2 * s;
  return (n) => t - s - n / i * r;
=======
function il(e, t, s = 4) {
  const i = e || 1, r = t - 2 * s;
  return (n) => t - s - n / i * r;
>>>>>>> origin/main
}
function gt(e, t) {
  t = Math.max(4, t);
  const s = e.length;
  if (s <= t) return e;
<<<<<<< HEAD
  const r = Math.max(1, Math.floor(t / 2)), i = Math.ceil(s / r), n = [];
  for (let o = 0; o < s; o += i) {
    const a = Math.min(o + i, s);
||||||| 8cdb3c5
  const i = Math.max(1, Math.floor(t / 2)), r = Math.ceil(s / i), n = [];
  for (let o = 0; o < s; o += r) {
    const a = Math.min(o + r, s);
    let l = e[o], h = e[o];
=======
  const i = Math.max(1, Math.floor(t / 2)), r = Math.ceil(s / i), n = [];
  for (let o = 0; o < s; o += r) {
    const a = Math.min(o + r, s);
>>>>>>> origin/main
    let c = e[o], h = e[o];
    for (let f = o + 1; f < a; f++) {
      const p = e[f];
      p[1] < c[1] && (c = p), p[1] > h[1] && (h = p);
    }
    c === h ? n.push(c) : c[0] <= h[0] ? n.push(c, h) : n.push(h, c);
  }
  return n[0] !== e[0] && (n[0] = e[0]), n[n.length - 1] !== e[s - 1] && (n[n.length - 1] = e[s - 1]), n;
}
<<<<<<< HEAD
function Qt(e, t, s) {
  return e.length === 0 ? "" : e.map(([r, i], n) => `${n === 0 ? "M" : "L"}${t(r)},${s(i)}`).join(" ");
||||||| 8cdb3c5
function Jt(e, t, s) {
  return e.length === 0 ? "" : e.map(([i, r], n) => `${n === 0 ? "M" : "L"}${t(i)},${s(r)}`).join(" ");
=======
function Xt(e, t, s) {
  return e.length === 0 ? "" : e.map(([i, r], n) => `${n === 0 ? "M" : "L"}${t(i)},${s(r)}`).join(" ");
>>>>>>> origin/main
}
<<<<<<< HEAD
function gl(e, t, s, r = 1 / 0) {
||||||| 8cdb3c5
function Va(e, t, s, i = 1 / 0) {
=======
function rl(e, t, s, i = 1 / 0) {
>>>>>>> origin/main
  if (e.p75.length === 0) return "";
<<<<<<< HEAD
  const i = (c) => c.map((h, f) => [e.t0 + f * e.step, h]), n = gt(i(e.p75), r), o = gt(i(e.p25), r).reverse();
||||||| 8cdb3c5
  const r = (l) => l.map((h, f) => [e.t0 + f * e.step, h]), n = ft(r(e.p75), i), o = ft(r(e.p25), i).reverse();
  return `${[...n, ...o].map(([l, h], f) => `${f === 0 ? "M" : "L"}${t(l)},${s(h)}`).join(" ")} Z`;
=======
  const r = (c) => c.map((h, f) => [e.t0 + f * e.step, h]), n = ft(r(e.p75), i), o = ft(r(e.p25), i).reverse();
>>>>>>> origin/main
  return `${[...n, ...o].map(([c, h], f) => `${f === 0 ? "M" : "L"}${t(c)},${s(h)}`).join(" ")} Z`;
}
<<<<<<< HEAD
function vl(e, t) {
  return e[t].map((s, r) => [e.t0 + r * e.step, s]);
||||||| 8cdb3c5
function qa(e, t) {
  return e[t].map((s, i) => [e.t0 + i * e.step, s]);
=======
function nl(e, t) {
  return e[t].map((s, i) => [e.t0 + i * e.step, s]);
>>>>>>> origin/main
}
<<<<<<< HEAD
function bl(e, t, s, r, i) {
||||||| 8cdb3c5
function Ka(e, t, s, i, r) {
=======
function ol(e, t, s, i, r) {
>>>>>>> origin/main
  const n = e[e.length - 1];
  return !n || t <= n[0] || t < r || t > i ? [] : [n, [t, s]];
}
function Mt(e, t, s) {
  return e.map(([r, i, n]) => ({ x0: t(r), x1: t(i ?? s), tag: n }));
}
<<<<<<< HEAD
function dr(e, t) {
||||||| 8cdb3c5
function ii(e, t) {
=======
function oi(e, t) {
>>>>>>> origin/main
  if (e.length === 0) return -1;
  let s = 0, r = e.length - 1;
  for (; s < r; ) {
    const i = s + r >> 1;
    e[i][0] < t ? s = i + 1 : r = i;
  }
  return s > 0 && Math.abs(e[s - 1][0] - t) <= Math.abs(e[s][0] - t) ? s - 1 : s;
}
<<<<<<< HEAD
function $l(e) {
||||||| 8cdb3c5
function Ya(e) {
=======
function al(e) {
>>>>>>> origin/main
  return [e.group_id, e.start, e.end, e.resolution, e.include_children ?? !1, e.forecast_until ?? ""].join("|");
}
<<<<<<< HEAD
var yl = Object.defineProperty, xl = Object.getOwnPropertyDescriptor, T = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? xl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && yl(t, s, i), i;
||||||| 8cdb3c5
var Xa = Object.defineProperty, Ja = Object.getOwnPropertyDescriptor, C = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ja(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Xa(t, s, r), r;
=======
var ll = Object.defineProperty, cl = Object.getOwnPropertyDescriptor, C = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? cl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ll(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const Oe = 32, wl = 28, _l = 4, hr = 8, kl = 800, El = 220, Sl = 160, It = 2e3, Al = 6e4, Ol = 1e4, $i = 6e4, Pl = 32, Cl = ["24h", "7d", "30d"], Tl = ["off", "24h", "7d"], ur = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], Ll = (e) => `hsl(${e * 67 % 360} 55% 62%)`, oe = /* @__PURE__ */ new Map(), tt = /* @__PURE__ */ new Map();
function pr(e, t) {
||||||| 8cdb3c5
const Ee = 32, Za = 28, Qa = 4, ri = 8, el = 800, tl = 220, sl = 160, Nt = 2e3, il = 6e4, rl = 1e4, nr = 6e4, nl = 32, ol = ["24h", "7d", "30d"], al = ["off", "24h", "7d"], ni = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], ll = (e) => `hsl(${e * 67 % 360} 55% 62%)`, se = /* @__PURE__ */ new Map(), Qe = /* @__PURE__ */ new Map();
function oi(e, t) {
=======
const Ee = 32, dl = 28, hl = 4, ai = 8, ul = 800, pl = 220, fl = 160, Nt = 2e3, gl = 6e4, ml = 1e4, cr = 6e4, vl = 32, bl = ["24h", "7d", "30d"], $l = ["off", "24h", "7d"], li = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], yl = (e) => `hsl(${e * 67 % 360} 55% 62%)`, se = /* @__PURE__ */ new Map(), Qe = /* @__PURE__ */ new Map();
function ci(e, t) {
>>>>>>> origin/main
  const s = Date.now();
<<<<<<< HEAD
  for (const [r, i] of oe) s - i.at >= $i && oe.delete(r);
  oe.delete(e), oe.set(e, { at: s, data: t });
  for (const r of oe.keys()) {
    if (oe.size <= Pl) break;
    oe.delete(r);
||||||| 8cdb3c5
  for (const [i, r] of se) s - r.at >= nr && se.delete(i);
  se.delete(e), se.set(e, { at: s, data: t });
  for (const i of se.keys()) {
    if (se.size <= nl) break;
    se.delete(i);
=======
  for (const [i, r] of se) s - r.at >= cr && se.delete(i);
  se.delete(e), se.set(e, { at: s, data: t });
  for (const i of se.keys()) {
    if (se.size <= vl) break;
    se.delete(i);
>>>>>>> origin/main
  }
}
<<<<<<< HEAD
const Dl = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", Nl = (e, t) => {
||||||| 8cdb3c5
const cl = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", dl = (e, t) => {
=======
const xl = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", wl = (e, t) => {
>>>>>>> origin/main
  const s = new Date(e * 1e3);
  return t <= 2 * 86400 ? s.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : s.toLocaleDateString(void 0, { month: "short", day: "numeric" });
<<<<<<< HEAD
}, jt = (e) => String(Math.round(e * 100) / 100), Ft = (e, t, s) => Math.min(s, Math.max(t, e));
function Rl(e, t, s, r) {
  const i = Math.max(1, r.width - Oe), n = Math.max(1, r.height - wl), o = s.start, a = Math.max(s.until, s.end), c = fl(o, a, i), h = ml(r.maxValue, n), f = Object.keys(e.series), p = f.includes(t) ? t : f[0] ?? t, v = (w, pe) => {
    const Se = gt(e.series[w] ?? [], It);
    return { id: w, points: Se, d: Qt(Se, c, h), color: pe };
  }, y = v(p, "var(--primary-color)"), x = r.showChannels ? f.filter((w) => w !== p).map((w, pe) => v(w, Ll(pe))) : [], q = e.forecast, Ie = q ? Dl(gl(q, c, h, It)) : "", je = q ? Qt(gt(vl(q, "p50"), It), c, h) : "", te = [];
  for (const [, , w] of e.day_types) te.includes(w) || te.push(w);
  const _s = (w) => ur[te.indexOf(w) % ur.length], ki = Mt(
    e.day_types.map(([w, pe, Se]) => [w, pe, Se]),
||||||| 8cdb3c5
}, It = (e) => String(Math.round(e * 100) / 100), jt = (e, t, s) => Math.min(s, Math.max(t, e));
function hl(e, t, s, i) {
  const r = Math.max(1, i.width - Ee), n = Math.max(1, i.height - Za), o = s.start, a = Math.max(s.until, s.end), l = Ga(o, a, r), h = Wa(i.maxValue, n), f = Object.keys(e.series), p = f.includes(t) ? t : f[0] ?? t, v = (w, de) => {
    const Se = ft(e.series[w] ?? [], Nt);
    return { id: w, points: Se, d: Jt(Se, l, h), color: de };
  }, y = v(p, "var(--primary-color)"), x = i.showChannels ? f.filter((w) => w !== p).map((w, de) => v(w, ll(de))) : [], B = e.forecast, Re = B ? cl(Va(B, l, h, Nt)) : "", Me = B ? Jt(ft(qa(B, "p50"), Nt), l, h) : "", Y = [];
  for (const [, , w] of e.day_types) Y.includes(w) || Y.push(w);
  const $s = (w) => ni[Y.indexOf(w) % ni.length], cr = Mt(
    e.day_types.map(([w, de, Se]) => [w, de, Se]),
    l,
=======
}, Rt = (e) => String(Math.round(e * 100) / 100), It = (e, t, s) => Math.min(s, Math.max(t, e));
function _l(e, t, s, i) {
  const r = Math.max(1, i.width - Ee), n = Math.max(1, i.height - dl), o = s.start, a = Math.max(s.until, s.end), c = sl(o, a, r), h = il(i.maxValue, n), f = Object.keys(e.series), p = f.includes(t) ? t : f[0] ?? t, v = (w, he) => {
    const ke = ft(e.series[w] ?? [], Nt);
    return { id: w, points: ke, d: Xt(ke, c, h), color: he };
  }, y = v(p, "var(--primary-color)"), x = i.showChannels ? f.filter((w) => w !== p).map((w, he) => v(w, yl(he))) : [], W = e.forecast, Ne = W ? xl(rl(W, c, h, Nt)) : "", Re = W ? Xt(ft(nl(W, "p50"), Nt), c, h) : "", X = [];
  for (const [, , w] of e.day_types) X.includes(w) || X.push(w);
  const $s = (w) => li[X.indexOf(w) % li.length], pr = Mt(
    e.day_types.map(([w, he, ke]) => [w, he, ke]),
>>>>>>> origin/main
    c,
    a
<<<<<<< HEAD
  ).map((w) => ({ ...w, fill: _s(w.tag) })), Ei = Mt(
||||||| 8cdb3c5
  ).map((w) => ({ ...w, fill: $s(w.tag) })), dr = Mt(
=======
  ).map((w) => ({ ...w, fill: $s(w.tag) })), fr = Mt(
>>>>>>> origin/main
    Object.entries(e.lights).flatMap(
<<<<<<< HEAD
      ([w, pe]) => pe.map(([Se, Ai]) => [Se, Ai, w])
||||||| 8cdb3c5
      ([w, de]) => de.map(([Se, ur]) => [Se, ur, w])
=======
      ([w, he]) => he.map(([ke, mr]) => [ke, mr, w])
>>>>>>> origin/main
    ),
    c,
    a
<<<<<<< HEAD
  ), Si = Mt(e.plan, c, a);
||||||| 8cdb3c5
  ), hr = Mt(e.plan, l, a);
=======
  ), gr = Mt(e.plan, c, a);
>>>>>>> origin/main
  return {
    busId: p,
    bus: y,
    children: x,
<<<<<<< HEAD
    band: Ie,
    p50: je,
    dayTypes: ki,
    legend: te.map((w) => ({ tag: w, fill: _s(w) })),
    lights: Ei,
    plan: Si,
||||||| 8cdb3c5
    band: Re,
    p50: Me,
    dayTypes: cr,
    legend: Y.map((w) => ({ tag: w, fill: $s(w) })),
    lights: dr,
    plan: hr,
    x: l,
=======
    band: Ne,
    p50: Re,
    dayTypes: pr,
    legend: X.map((w) => ({ tag: w, fill: $s(w) })),
    lights: fr,
    plan: gr,
>>>>>>> origin/main
    x: c,
    y: h,
    t0: o,
    t1: a,
    plotW: i,
    plotH: n
  };
}
<<<<<<< HEAD
let E = class extends b {
||||||| 8cdb3c5
let S = class extends b {
=======
let k = class extends b {
>>>>>>> origin/main
  constructor() {
<<<<<<< HEAD
    super(...arguments), this.groupId = null, this.heading = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = $t, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = kl, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
||||||| 8cdb3c5
    super(...arguments), this.groupId = null, this.heading = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = vt, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = el, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
=======
    super(...arguments), this.groupId = null, this.heading = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = vt, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = ul, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
>>>>>>> origin/main
  }
  get height() {
<<<<<<< HEAD
    return this.narrow ? Sl : El;
||||||| 8cdb3c5
    return this.narrow ? sl : tl;
=======
    return this.narrow ? fl : pl;
>>>>>>> origin/main
  }
  /**
   * Whether a fetch is worth making right now. A background tab has nobody watching the
   * chart, and a save is about to replace the config this window describes: either way the
   * round trip buys nothing. Both the periodic tick and the live refetch ask this.
   */
  get refetchable() {
    return !this.paused && document.visibilityState === "visible";
  }
  /**
   * A forecast is only worth showing once the profile has actually seen this group: a
   * document that has never been trained, or one that has been trained but has nothing
   * for this particular group yet (it was just added, say), both read the same way here.
   * History is unaffected either way - it comes straight from the recorder, not the profile.
   */
  get forecastReady() {
    const e = this.groupId, t = this.profileState;
    return e === null || !t || !t.trained ? !1 : t.profile.groups[e] !== void 0;
  }
  /** "learning… n/min_days days", or null once the forecast is worth asking for. */
  get learningHint() {
    if (this.forecastReady) return null;
    const e = this.groupId;
    return `learning… ${(e !== null ? this.profileState?.profile.groups[e]?.days : void 0) ?? 0}/${this.minDays} days`;
  }
  connectedCallback() {
    super.connectedCallback(), typeof ResizeObserver < "u" && (this.observer = new ResizeObserver((e) => {
      const t = e[0]?.contentRect.width ?? 0;
      t > 0 && (this.width = t);
    }), this.observer.observe(this)), this.timer = setInterval(() => {
      this.refetchable && this.load();
<<<<<<< HEAD
    }, Al), this.load();
||||||| 8cdb3c5
    }, il), this.load();
=======
    }, gl), this.load();
>>>>>>> origin/main
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.observer?.disconnect(), this.observer = void 0, this.timer !== void 0 && clearInterval(this.timer), this.timer = void 0, this.resetLiveWatch();
  }
  /** Forgets the pending refetch and the value it was measured against. */
  resetLiveWatch() {
    this.liveTimer !== void 0 && clearTimeout(this.liveTimer), this.liveTimer = void 0, this.liveValue = null;
  }
  /**
   * Schedules the catch-up refetch when the selected group's live value has moved by more
   * than half a display step - less than that rounds to the same readout, so the recorded
   * history is not visibly behind the tail. Everything that moves inside the 10 s rides on
   * the timer the first move started, so a busy group still costs one round trip.
   */
  watchLive() {
    const e = this.groupId, t = e === null ? void 0 : this.live?.groups[e];
    if (!t) return;
    const s = this.liveValue;
    if (s === null) {
      this.liveValue = t.value;
      return;
    }
    Math.abs(t.value - s) <= Math.pow(10, -t.precision) / 2 || (this.liveValue = t.value, this.liveTimer === void 0 && (this.liveTimer = setTimeout(() => {
      this.liveTimer = void 0, this.refetchable && this.load(!0);
<<<<<<< HEAD
    }, Ol)));
||||||| 8cdb3c5
    }, rl)));
=======
    }, ml)));
>>>>>>> origin/main
  }
  willUpdate(e) {
    const t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), s = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
    (t || s) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
  }
  query(e) {
<<<<<<< HEAD
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = pl(t, this.range, this.horizon);
||||||| 8cdb3c5
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = Ba(t, this.range, this.horizon);
=======
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = tl(t, this.range, this.horizon);
>>>>>>> origin/main
    return {
      group_id: e,
      start: s.start,
      end: s.end,
      resolution: s.resolution,
      include_children: this.showChannels,
      ...s.forecastUntil !== void 0 ? { forecast_until: s.forecastUntil } : {}
    };
  }
  /**
   * Loads the current window. `force` is the catch-up refetch's path: the point of it is
   * that the recorder has something newer than the answer already in hand, and the shared
   * cache would serve that same answer straight back for the rest of its minute.
   */
  async load(e = !1) {
    const t = this.hass, s = this.groupId;
    if (!t || s === null) return;
<<<<<<< HEAD
    const r = this.query(s), i = $l(r), n = e ? void 0 : oe.get(i);
    if (n && Date.now() - n.at < $i) {
      this.seq++, this.loaded = { q: r, data: n.data }, this.error = null, pr(i, n.data);
||||||| 8cdb3c5
    const i = this.query(s), r = Ya(i), n = e ? void 0 : se.get(r);
    if (n && Date.now() - n.at < nr) {
      this.seq++, this.loaded = { q: i, data: n.data }, this.error = null, oi(r, n.data);
=======
    const i = this.query(s), r = al(i), n = e ? void 0 : se.get(r);
    if (n && Date.now() - n.at < cr) {
      this.seq++, this.loaded = { q: i, data: n.data }, this.error = null, ci(r, n.data);
>>>>>>> origin/main
      return;
    }
    let o = e ? void 0 : tt.get(i);
    if (!o) {
<<<<<<< HEAD
      const c = en(t, r);
      o = c, tt.set(i, c), c.then(
        (h) => pr(i, h),
||||||| 8cdb3c5
      const l = Fr(t, i);
      o = l, Qe.set(r, l), l.then(
        (h) => oi(r, h),
=======
      const c = Br(t, i);
      o = c, Qe.set(r, c), c.then(
        (h) => ci(r, h),
>>>>>>> origin/main
        () => {
        }
      ).finally(() => {
<<<<<<< HEAD
        tt.get(i) === c && tt.delete(i);
||||||| 8cdb3c5
        Qe.get(r) === l && Qe.delete(r);
=======
        Qe.get(r) === c && Qe.delete(r);
>>>>>>> origin/main
      });
    }
    const a = ++this.seq;
    try {
      const c = await o;
      if (a !== this.seq) return;
<<<<<<< HEAD
      this.loaded = { q: r, data: c }, this.error = null;
||||||| 8cdb3c5
      this.loaded = { q: i, data: l }, this.error = null;
    } catch (l) {
=======
      this.loaded = { q: i, data: c }, this.error = null;
>>>>>>> origin/main
    } catch (c) {
      if (a !== this.seq) return;
      this.error = c.message || String(c);
    }
  }
  /** Recomputed only when something it depends on actually changed. */
  get paths() {
    const e = this.loaded;
    if (!e) return null;
    const t = [
      e.data,
      e.q.group_id,
      e.q.start,
      e.q.end,
      e.q.forecast_until,
      this.width,
      this.height,
      this.maxValue,
      this.showChannels
    ], s = this.memo;
<<<<<<< HEAD
    if (s && s.key.length === t.length && s.key.every((i, n) => i === t[n])) return s.value;
    const r = Rl(
||||||| 8cdb3c5
    if (s && s.key.length === t.length && s.key.every((r, n) => r === t[n])) return s.value;
    const i = hl(
=======
    if (s && s.key.length === t.length && s.key.every((r, n) => r === t[n])) return s.value;
    const i = _l(
>>>>>>> origin/main
      e.data,
      e.q.group_id,
      { start: e.q.start, end: e.q.end, until: e.q.forecast_until ?? e.q.end },
      { width: this.width, height: this.height, maxValue: this.maxValue, showChannels: this.showChannels }
    );
    return this.memo = { key: t, value: r }, r;
  }
  /**
   * "now" follows the live poll when there is one and the real clock otherwise, so the
   * line keeps moving between refetches even though the window itself is quantized.
   */
  nowAt(e) {
<<<<<<< HEAD
    return Ft(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
||||||| 8cdb3c5
    return jt(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
=======
    return It(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
>>>>>>> origin/main
  }
  /**
   * The live tail, in plot-local pixels: the recorded line's last sample joined to the
   * reading this live frame carries. It costs no round trip, so it moves on every frame
   * while the recorded history behind it catches up on its own schedule.
   */
  tailPath(e) {
    const t = this.groupId, s = this.live;
    if (t === null || s === null) return "";
<<<<<<< HEAD
    const r = s.groups[t];
    return !r || e.bus.id !== t ? "" : Qt(bl(e.bus.points, s.now, r.value, e.t0, e.t1), e.x, e.y);
||||||| 8cdb3c5
    const i = s.groups[t];
    return !i || e.bus.id !== t ? "" : Jt(Ka(e.bus.points, s.now, i.value, e.t0, e.t1), e.x, e.y);
=======
    const i = s.groups[t];
    return !i || e.bus.id !== t ? "" : Xt(ol(e.bus.points, s.now, i.value, e.t0, e.t1), e.x, e.y);
>>>>>>> origin/main
  }
  emitSettings() {
    this.dispatchEvent(
<<<<<<< HEAD
      fo({
||||||| 8cdb3c5
      Kn({
=======
      so({
>>>>>>> origin/main
        range: this.range,
        horizon: this.horizon,
        showChannels: this.showChannels,
        showLights: this.showLights
      })
    );
  }
  setRange(e) {
    this.range !== e && (this.range = e, this.cursorIndex = null, this.emitSettings());
  }
  setHorizon(e) {
    this.horizon !== e && (this.horizon = e, this.cursorIndex = null, this.emitSettings());
  }
  toggleChannels() {
    this.showChannels = !this.showChannels, this.emitSettings();
  }
  toggleLights() {
    this.showLights = !this.showLights, this.emitSettings();
  }
  /**
   * The instant under the pointer. The SVG scales to its box, so pixels are converted
   * back through the `viewBox` ratio; a zero-width box (jsdom, a hidden card) reads
   * `clientX` as viewBox units rather than dividing by zero.
   */
  timeAt(e, t) {
<<<<<<< HEAD
    const r = e.currentTarget.getBoundingClientRect(), i = r.width > 0 ? this.width / r.width : 1, n = (e.clientX - r.left) * i - Oe, o = Ft(n / t.plotW, 0, 1);
||||||| 8cdb3c5
    const i = e.currentTarget.getBoundingClientRect(), r = i.width > 0 ? this.width / i.width : 1, n = (e.clientX - i.left) * r - Ee, o = jt(n / t.plotW, 0, 1);
=======
    const i = e.currentTarget.getBoundingClientRect(), r = i.width > 0 ? this.width / i.width : 1, n = (e.clientX - i.left) * r - Ee, o = It(n / t.plotW, 0, 1);
>>>>>>> origin/main
    return t.t0 + o * (t.t1 - t.t0);
  }
  onMove(e) {
    const t = this.paths;
<<<<<<< HEAD
    !t || t.bus.points.length === 0 || (this.cursorIndex = dr(t.bus.points, this.timeAt(e, t)));
||||||| 8cdb3c5
    !t || t.bus.points.length === 0 || (this.cursorIndex = ii(t.bus.points, this.timeAt(e, t)));
=======
    !t || t.bus.points.length === 0 || (this.cursorIndex = oi(t.bus.points, this.timeAt(e, t)));
>>>>>>> origin/main
  }
  onLeave() {
    this.cursorIndex = null;
  }
  /** ←/→ walk the samples (×10 with Shift) so the tooltip is reachable without a mouse. */
  onKeyDown(e) {
    const t = this.paths;
    if (!t) return;
    const s = t.bus.points.length - 1;
    if (s < 0) return;
    if (e.key === "Escape") {
      if (this.cursorIndex === null) return;
      e.preventDefault(), this.cursorIndex = null;
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
<<<<<<< HEAD
    const r = (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1);
    this.cursorIndex = this.cursorIndex === null ? r > 0 ? 0 : s : Ft(this.cursorIndex + r, 0, s);
||||||| 8cdb3c5
    const i = (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1);
    this.cursorIndex = this.cursorIndex === null ? i > 0 ? 0 : s : jt(this.cursorIndex + i, 0, s);
=======
    const i = (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1);
    this.cursorIndex = this.cursorIndex === null ? i > 0 ? 0 : s : It(this.cursorIndex + i, 0, s);
>>>>>>> origin/main
  }
  renderChips() {
    const e = this.learningHint;
    return l`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
<<<<<<< HEAD
          ${Cl.map(
||||||| 8cdb3c5
          ${ol.map(
      (t) => c`
=======
          ${bl.map(
>>>>>>> origin/main
      (t) => l`
              <button
                class="chip range"
                data-range=${t}
                aria-pressed=${this.range === t ? "true" : "false"}
                @click=${() => this.setRange(t)}
              >
                ${t}
              </button>
            `
    )}
        </div>
        <div class="chips horizons" role="group" aria-label="Forecast horizon">
<<<<<<< HEAD
          ${Tl.map((t) => {
||||||| 8cdb3c5
          ${al.map((t) => {
=======
          ${$l.map((t) => {
>>>>>>> origin/main
      const s = t !== "off" && !this.forecastReady;
      return l`
              <button
                class="chip horizon"
                data-horizon=${t}
                aria-pressed=${this.horizon === t ? "true" : "false"}
                ?disabled=${s}
                aria-disabled=${s ? "true" : "false"}
                title=${s ? e ?? "" : ""}
                @click=${() => this.setHorizon(t)}
              >
                ${t}
              </button>
            `;
    })}
        </div>
        ${e ? l`<span class="muted hint" title=${e}>${e}</span>` : u}
        <button
          class="chip channels"
          aria-pressed=${this.showChannels ? "true" : "false"}
          @click=${this.toggleChannels}
        >
          channels
        </button>
        <button class="chip lights" aria-pressed=${this.showLights ? "true" : "false"} @click=${this.toggleLights}>
          lights
        </button>
      </div>
    `;
  }
  renderChart(e) {
<<<<<<< HEAD
    const t = this.width, s = this.height, r = e.x(this.nowAt(e)), i = this.tailPath(e), n = e.plotH + _l, o = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), a = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
||||||| 8cdb3c5
    const t = this.width, s = this.height, i = e.x(this.nowAt(e)), r = this.tailPath(e), n = e.plotH + Qa, o = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), a = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
    return c`
=======
    const t = this.width, s = this.height, i = e.x(this.nowAt(e)), r = this.tailPath(e), n = e.plotH + hl, o = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), a = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
>>>>>>> origin/main
    return l`
      <svg
        class="chart"
        viewBox="0 0 ${t} ${s}"
        role="img"
        tabindex="0"
        aria-label=${a}
        @mousemove=${this.onMove}
        @mouseleave=${this.onLeave}
        @keydown=${this.onKeyDown}
      >
        ${[1, 0.5, 0].map(
<<<<<<< HEAD
      (c) => A`
            <line class="grid" x1=${Oe} y1=${e.y(this.maxValue * c)} x2=${t} y2=${e.y(this.maxValue * c)}></line>
            <text class="ytick" x=${Oe - 4} y=${e.y(this.maxValue * c) + 3} text-anchor="end">
              ${jt(this.maxValue * c)}
||||||| 8cdb3c5
      (l) => E`
            <line class="grid" x1=${Ee} y1=${e.y(this.maxValue * l)} x2=${t} y2=${e.y(this.maxValue * l)}></line>
            <text class="ytick" x=${Ee - 4} y=${e.y(this.maxValue * l) + 3} text-anchor="end">
              ${It(this.maxValue * l)}
=======
      (c) => E`
            <line class="grid" x1=${Ee} y1=${e.y(this.maxValue * c)} x2=${t} y2=${e.y(this.maxValue * c)}></line>
            <text class="ytick" x=${Ee - 4} y=${e.y(this.maxValue * c) + 3} text-anchor="end">
              ${Rt(this.maxValue * c)}
>>>>>>> origin/main
            </text>
          `
    )}
        <g transform="translate(${Oe},0)">
          ${e.dayTypes.map(
<<<<<<< HEAD
      (c) => A`<rect
||||||| 8cdb3c5
      (l) => E`<rect
=======
      (c) => E`<rect
>>>>>>> origin/main
              class="daytype"
              x=${c.x0}
              y="0"
              width=${Math.max(0, c.x1 - c.x0)}
              height=${e.plotH}
              fill=${c.fill}
            ></rect>`
    )}
<<<<<<< HEAD
          ${e.band ? A`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? A`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((c) => A`<path class="child" d=${c.d} stroke=${c.color}></path>`)}
          ${e.bus.d ? A`<path class="bus" d=${e.bus.d}></path>` : u}
          ${i ? A`<path class="tail" d=${i}></path>` : u}
||||||| 8cdb3c5
          ${e.band ? E`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? E`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((l) => E`<path class="child" d=${l.d} stroke=${l.color}></path>`)}
          ${e.bus.d ? E`<path class="bus" d=${e.bus.d}></path>` : u}
          ${r ? E`<path class="tail" d=${r}></path>` : u}
=======
          ${e.band ? E`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? E`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((c) => E`<path class="child" d=${c.d} stroke=${c.color}></path>`)}
          ${e.bus.d ? E`<path class="bus" d=${e.bus.d}></path>` : u}
          ${r ? E`<path class="tail" d=${r}></path>` : u}
>>>>>>> origin/main
          ${this.showLights ? e.lights.map(
<<<<<<< HEAD
      (c) => A`<rect
||||||| 8cdb3c5
      (l) => E`<rect
=======
      (c) => E`<rect
>>>>>>> origin/main
                  class="light"
                  x=${c.x0}
                  y=${n}
                  width=${Math.max(1, c.x1 - c.x0)}
<<<<<<< HEAD
                  height=${hr}
||||||| 8cdb3c5
                  width=${Math.max(1, l.x1 - l.x0)}
                  height=${ri}
=======
                  height=${ai}
>>>>>>> origin/main
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`
    ) : u}
          ${this.showLights ? e.plan.map(
<<<<<<< HEAD
      (c) => A`<rect
||||||| 8cdb3c5
      (l) => E`<rect
=======
      (c) => E`<rect
>>>>>>> origin/main
                  class="plan"
                  x=${c.x0}
                  y=${n}
                  width=${Math.max(1, c.x1 - c.x0)}
<<<<<<< HEAD
                  height=${hr}
||||||| 8cdb3c5
                  width=${Math.max(1, l.x1 - l.x0)}
                  height=${ri}
=======
                  height=${ai}
>>>>>>> origin/main
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`
    ) : u}
          <line class="now" x1=${r} y1="0" x2=${r} y2=${e.plotH}></line>
          <text class="now-label" x=${r + 3} y="10">now</text>
          ${o === null ? u : A`<line class="cursor" x1=${o} y1="0" x2=${o} y2=${e.plotH}></line>`}
          ${this.renderXLabels(e)}
        </g>
      </svg>
    `;
  }
  renderXLabels(e) {
    const t = this.height - 6;
    return [
      [0, "start"],
      [0.5, "middle"],
      [1, "end"]
    ].map(
<<<<<<< HEAD
      ([r, i]) => A`<text class="xlabel" x=${r * e.plotW} y=${t} text-anchor=${i}>
        ${Nl(e.t0 + r * (e.t1 - e.t0), e.t1 - e.t0)}
||||||| 8cdb3c5
      ([i, r]) => E`<text class="xlabel" x=${i * e.plotW} y=${t} text-anchor=${r}>
        ${dl(e.t0 + i * (e.t1 - e.t0), e.t1 - e.t0)}
=======
      ([i, r]) => E`<text class="xlabel" x=${i * e.plotW} y=${t} text-anchor=${r}>
        ${wl(e.t0 + i * (e.t1 - e.t0), e.t1 - e.t0)}
>>>>>>> origin/main
      </text>`
    );
  }
  renderTooltip(e) {
    const t = this.cursorIndex;
    if (t === null) return u;
    const s = e.bus.points[t];
    if (!s) return u;
<<<<<<< HEAD
    const [r, i] = s, o = (Oe + e.x(r)) / this.width * 100, a = this.loaded?.data.day_types.find(([c, h]) => r >= c && r < h)?.[2];
||||||| 8cdb3c5
    const [i, r] = s, o = (Ee + e.x(i)) / this.width * 100, a = this.loaded?.data.day_types.find(([l, h]) => i >= l && i < h)?.[2];
    return c`
=======
    const [i, r] = s, o = (Ee + e.x(i)) / this.width * 100, a = this.loaded?.data.day_types.find(([c, h]) => i >= c && i < h)?.[2];
>>>>>>> origin/main
    return l`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${new Date(r * 1e3).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
<<<<<<< HEAD
          <span class="tt-value">${jt(i)}</span>
||||||| 8cdb3c5
          <span class="tt-value">${It(r)}</span>
=======
          <span class="tt-value">${Rt(r)}</span>
>>>>>>> origin/main
        </div>
        ${e.children.map((c) => {
<<<<<<< HEAD
      const h = dr(c.points, r), f = c.points[h];
||||||| 8cdb3c5
        ${e.children.map((l) => {
      const h = ii(l.points, i), f = l.points[h];
      return f ? c`
=======
      const h = oi(c.points, i), f = c.points[h];
>>>>>>> origin/main
      return f ? l`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${c.color}"></span>
                  <span class="tt-name">${c.id}</span>
<<<<<<< HEAD
                  <span class="tt-value">${jt(f[1])}</span>
||||||| 8cdb3c5
                  <span class="tt-swatch" style="background: ${l.color}"></span>
                  <span class="tt-name">${l.id}</span>
                  <span class="tt-value">${It(f[1])}</span>
=======
                  <span class="tt-value">${Rt(f[1])}</span>
>>>>>>> origin/main
                </div>
              ` : u;
    })}
        ${a ? l`<div class="tt-daytype muted">${a}</div>` : u}
      </div>
    `;
  }
  render() {
    if (this.groupId === null)
      return l`<div class="placeholder muted">Select a strip to see its timeline.</div>`;
    const e = this.paths;
    return l`
      ${this.renderChips()}
      ${e ? this.renderChart(e) : l`<div class="placeholder muted">Loading…</div>`}
      ${e && e.legend.length > 0 ? l`
            <div class="legend">
              ${e.legend.map(
      (t) => l`
                  <span class="legend-item">
                    <span class="swatch" style="background: ${t.fill}"></span>${t.tag}
                  </span>
                `
    )}
            </div>
          ` : u}
      ${this.error ? l`<div class="error">Timeline: ${this.error}</div>` : u}
      ${e ? this.renderTooltip(e) : u}
    `;
  }
};
<<<<<<< HEAD
E.styles = [
  C,
  S`
||||||| 8cdb3c5
S.styles = [
  T,
  A`
=======
k.styles = [
  T,
  A`
>>>>>>> origin/main
      :host {
        display: block;
        position: relative;
        background: none;
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }
      .title {
        font-weight: 600;
        margin-right: auto;
      }
      .chips {
        display: flex;
        gap: 2px;
      }
      .chip {
        border: 1px solid var(--divider-color, #4444);
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 0.85em;
        padding: 2px 8px;
        border-radius: 12px;
        cursor: pointer;
      }
      .chip[aria-pressed="true"] {
        color: var(--primary-color);
        border-color: var(--primary-color);
      }
      .chip:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      .chip:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .hint {
        white-space: nowrap;
      }
      /* Too narrow for one row of chips: the forecast controls (and everything after
         them) break onto a second row rather than the toolbar scrolling sideways. */
      :host([narrow]) .chips.horizons {
        flex-basis: 100%;
      }
      svg.chart {
        display: block;
        width: 100%;
        height: auto;
        touch-action: none;
      }
      svg.chart:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      /* The tail is the bus line continued, so it is the same line to look at. */
      path.bus,
      path.tail {
        fill: none;
        stroke: var(--primary-color);
        stroke-width: 2;
        stroke-linejoin: round;
      }
      path.child {
        fill: none;
        stroke-width: 1;
        opacity: 0.35;
      }
      polygon.band {
        fill: rgba(255, 190, 80, 0.18);
        stroke: none;
      }
      path.p50 {
        fill: none;
        stroke: rgba(255, 190, 80, 0.8);
        stroke-width: 1.5;
      }
      line.now {
        stroke: var(--primary-text-color, currentColor);
        stroke-width: 1;
        opacity: 0.5;
      }
      line.cursor {
        stroke: var(--primary-color);
        stroke-width: 1;
        pointer-events: none;
      }
      line.grid {
        stroke: var(--divider-color, currentColor);
        stroke-width: 1;
        opacity: 0.4;
      }
      text.ytick,
      text.xlabel,
      text.now-label {
        fill: var(--secondary-text-color);
        font-size: 10px;
      }
      .legend {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        border: 1px solid var(--divider-color, #4444);
      }
      .tooltip {
        position: absolute;
        top: 34px;
        z-index: 1;
        pointer-events: none;
        background: var(--card-background-color, #222);
        border: 1px solid var(--divider-color, #4444);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 0.8em;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }
      .tooltip.flip {
        transform: translateX(-100%);
      }
      .tt-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .tt-swatch {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .placeholder {
        padding: 24px 8px;
        text-align: center;
      }
      .error {
        font-size: 0.8em;
      }
    `
];
T([
  d({ attribute: !1 })
<<<<<<< HEAD
], E.prototype, "hass", 2);
T([
||||||| 8cdb3c5
], S.prototype, "hass", 2);
C([
=======
], k.prototype, "hass", 2);
C([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], E.prototype, "groupId", 2);
T([
||||||| 8cdb3c5
], S.prototype, "groupId", 2);
C([
=======
], k.prototype, "groupId", 2);
C([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], E.prototype, "heading", 2);
T([
||||||| 8cdb3c5
], S.prototype, "heading", 2);
C([
=======
], k.prototype, "heading", 2);
C([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], E.prototype, "range", 2);
T([
||||||| 8cdb3c5
], S.prototype, "range", 2);
C([
=======
], k.prototype, "range", 2);
C([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], E.prototype, "horizon", 2);
T([
||||||| 8cdb3c5
], S.prototype, "horizon", 2);
C([
=======
], k.prototype, "horizon", 2);
C([
>>>>>>> origin/main
  d({ type: Boolean })
<<<<<<< HEAD
], E.prototype, "showChannels", 2);
T([
||||||| 8cdb3c5
], S.prototype, "showChannels", 2);
C([
=======
], k.prototype, "showChannels", 2);
C([
>>>>>>> origin/main
  d({ type: Boolean })
<<<<<<< HEAD
], E.prototype, "showLights", 2);
T([
||||||| 8cdb3c5
], S.prototype, "showLights", 2);
C([
=======
], k.prototype, "showLights", 2);
C([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], E.prototype, "live", 2);
T([
||||||| 8cdb3c5
], S.prototype, "live", 2);
C([
=======
], k.prototype, "live", 2);
C([
>>>>>>> origin/main
  d({ type: Number })
<<<<<<< HEAD
], E.prototype, "maxValue", 2);
T([
||||||| 8cdb3c5
], S.prototype, "maxValue", 2);
C([
=======
], k.prototype, "maxValue", 2);
C([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], E.prototype, "profileState", 2);
T([
||||||| 8cdb3c5
], S.prototype, "profileState", 2);
C([
=======
], k.prototype, "profileState", 2);
C([
>>>>>>> origin/main
  d({ type: Number })
<<<<<<< HEAD
], E.prototype, "minDays", 2);
T([
||||||| 8cdb3c5
], S.prototype, "minDays", 2);
C([
=======
], k.prototype, "minDays", 2);
C([
>>>>>>> origin/main
  d({ type: Boolean, reflect: !0 })
<<<<<<< HEAD
], E.prototype, "narrow", 2);
T([
||||||| 8cdb3c5
], S.prototype, "narrow", 2);
C([
=======
], k.prototype, "narrow", 2);
C([
>>>>>>> origin/main
  d({ type: Boolean })
<<<<<<< HEAD
], E.prototype, "paused", 2);
T([
  m()
], E.prototype, "cursorIndex", 2);
T([
  m()
], E.prototype, "width", 2);
T([
  m()
], E.prototype, "loaded", 2);
T([
  m()
], E.prototype, "error", 2);
E = T([
  _("al-timeline")
], E);
var Ml = Object.defineProperty, Il = Object.getOwnPropertyDescriptor, ue = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Il(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Ml(t, s, i), i;
||||||| 8cdb3c5
], S.prototype, "paused", 2);
C([
  g()
], S.prototype, "cursorIndex", 2);
C([
  g()
], S.prototype, "width", 2);
C([
  g()
], S.prototype, "loaded", 2);
C([
  g()
], S.prototype, "error", 2);
S = C([
  k("al-timeline")
], S);
var ul = Object.defineProperty, pl = Object.getOwnPropertyDescriptor, ce = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? pl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ul(t, s, r), r;
=======
], k.prototype, "paused", 2);
C([
  g()
], k.prototype, "cursorIndex", 2);
C([
  g()
], k.prototype, "width", 2);
C([
  g()
], k.prototype, "loaded", 2);
C([
  g()
], k.prototype, "error", 2);
k = C([
  S("al-timeline")
], k);
var kl = Object.defineProperty, Sl = Object.getOwnPropertyDescriptor, de = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Sl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && kl(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const fr = ["name", "mix", "null_handling", "gain"], jl = 5, Fl = (e) => e[e.length - 2] === "stimuli";
let Q = class extends b {
||||||| 8cdb3c5
const ai = ["name", "mix", "null_handling", "gain"], fl = 5, gl = (e) => e[e.length - 2] === "stimuli";
let W = class extends b {
=======
const di = ["name", "mix", "null_handling", "gain"], El = 5, Al = (e) => e[e.length - 2] === "stimuli";
let q = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.simLog = null;
  }
  emitChange(e, t) {
<<<<<<< HEAD
    this.dispatchEvent(D(e, t));
||||||| 8cdb3c5
    this.dispatchEvent(R(e, t));
=======
    this.dispatchEvent(M(e, t));
>>>>>>> origin/main
  }
  /** Writes one nullable field of the selected node, e.g. an envelope or output override. */
  setField(e, t) {
    const { config: s, path: r } = this;
    !s || !r || this.emitChange(O(s, [...r, e], t), `${g(r)}:${e}`);
  }
  onBusForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
<<<<<<< HEAD
    const r = L(t, s);
    if (!r) return;
    const i = Yt(r, e.detail?.value ?? {}), n = Xt(i, r);
    n !== void 0 && this.emitChange(O(t, s, i), `${g(s)}:${n}`);
||||||| 8cdb3c5
    const i = L(t, s);
    if (!i) return;
    const r = qt(i, e.detail?.value ?? {}), n = Kt(r, i);
    n !== void 0 && this.emitChange(P(t, s, r), `${m(s)}:${n}`);
=======
    const i = L(t, s);
    if (!i) return;
    const r = Vt(i, e.detail?.value ?? {}), n = qt(r, i);
    n !== void 0 && this.emitChange(P(t, s, r), `${m(s)}:${n}`);
>>>>>>> origin/main
  }
  /** The switch is Home Assistant's, so this reports the wanted state and lets the shell call it. */
  onSim(e, t) {
<<<<<<< HEAD
    this.dispatchEvent(mo(e, t.target.checked === !0));
||||||| 8cdb3c5
    this.dispatchEvent(Yn(e, t.target.checked === !0));
=======
    this.dispatchEvent(io(e, t.target.checked === !0));
>>>>>>> origin/main
  }
  onRebuild() {
<<<<<<< HEAD
    this.dispatchEvent(si());
||||||| 8cdb3c5
    this.dispatchEvent(Ui());
=======
    this.dispatchEvent(Vi());
>>>>>>> origin/main
  }
  /**
   * A channel is a stimulus, so it gets the same editor the Groups tab uses: Source,
   * Envelope and a collapsed Override preset, not a flat form of its own that would drift
   * from that one's fields, its badge and its panel state the moment either changed.
   */
  renderChannel(e, t) {
    return l`<al-stimulus-editor
      .hass=${this.hass}
      .config=${e}
      .path=${t}
      .errors=${this.errors}
      .live=${this.live}
    ></al-stimulus-editor>`;
  }
  renderBus(e, t) {
    const s = L(e, t);
    if (!s) return l`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
<<<<<<< HEAD
    const r = t.length === 2, i = this.errors.filter((o) => o.path === g(t)), n = Z(this.errors, t);
||||||| 8cdb3c5
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = t.length === 2, r = this.errors.filter((o) => o.path === m(t)), n = xe(this.errors, t);
    return c`
=======
    const i = t.length === 2, r = this.errors.filter((o) => o.path === m(t)), n = we(this.errors, t);
>>>>>>> origin/main
    return l`
      <ha-card header=${s.name ?? s.id}>
<<<<<<< HEAD
        ${i.map((o) => l`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
||||||| 8cdb3c5
        ${r.map((o) => c`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
=======
        ${r.map((o) => l`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
>>>>>>> origin/main
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
<<<<<<< HEAD
              .data=${Kt(s, r, fr)}
              .schema=${qt(s, r, fr)}
||||||| 8cdb3c5
              .data=${Vt(s, i, ai)}
              .schema=${Wt(s, i, ai)}
=======
              .data=${Gt(s, i, di)}
              .schema=${Wt(s, i, di)}
>>>>>>> origin/main
              .error=${n}
<<<<<<< HEAD
              .computeLabel=${Gt}
              .computeHelper=${Vt}
||||||| 8cdb3c5
              .computeLabel=${Bt}
              .computeHelper=${Gt}
=======
              .computeLabel=${zt}
              .computeHelper=${Bt}
>>>>>>> origin/main
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
<<<<<<< HEAD
              .selector=${ni}
||||||| 8cdb3c5
              .selector=${Wi}
=======
              .selector=${Yi}
>>>>>>> origin/main
              .value=${s.max_value}
              .inherited=${e.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${n.max_value}
              @value-changed=${(o) => this.setField("max_value", o.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              .label=${pt.precision}
              kind="select"
<<<<<<< HEAD
              .selector=${oi}
||||||| 8cdb3c5
              .selector=${Vi}
=======
              .selector=${Xi}
>>>>>>> origin/main
              .value=${s.precision === null ? null : String(s.precision)}
              .inherited=${String(e.defaults.precision)}
              .inheritedFrom=${"defaults"}
              .error=${n.precision}
              @value-changed=${(o) => this.setField("precision", o.detail.value === null ? null : Number(o.detail.value))}
            ></al-override-field>
          </div>
          ${this.renderStatus(e, s)}
        </div>
        ${this.renderStimuli(e, s, t)}
      </ha-card>
    `;
  }
  /**
   * The group's stimuli, edited right here rather than on strips of their own: only groups
   * are tracks in the row above. Each one is the Groups tab's stimulus editor, collapsed -
   * a group with a dozen sensors would otherwise bury everything else on the page.
   */
  renderStimuli(e, t, s) {
<<<<<<< HEAD
    const r = F(e).enabled && Br(e).has(t.id);
||||||| 8cdb3c5
    const i = X(e).enabled && yn(e).has(t.id);
    return c`
=======
    const i = J(e).enabled && kn(e).has(t.id);
>>>>>>> origin/main
    return l`
      <div class="stimuli">
        <h3>Stimuli</h3>
<<<<<<< HEAD
        ${r ? this.renderPresence(e, t, s) : u}
        ${t.stimuli.length === 0 && !r ? l`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((i, n) => this.renderStimulus(e, [...s, "stimuli", n], i))}
||||||| 8cdb3c5
        ${i ? this.renderPresence(e, t, s) : u}
        ${t.stimuli.length === 0 && !i ? c`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((r, n) => this.renderStimulus(e, [...s, "stimuli", n], r))}
=======
        ${i ? this.renderPresence(e, t, s) : u}
        ${t.stimuli.length === 0 && !i ? l`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((r, n) => this.renderStimulus(e, [...s, "stimuli", n], r))}
>>>>>>> origin/main
      </div>
    `;
  }
  /**
   * The room's presence channel: a stimulus with no entity. The fields themselves are
   * `al-presence-overrides`, which the Groups editor's Presence panel shows too - only the
   * head, with the live phase on it, belongs to the mixer.
   */
  renderPresence(e, t, s) {
<<<<<<< HEAD
    const r = this.live?.voices[t.id]?.find((i) => i.label === Tn);
||||||| 8cdb3c5
    const i = this.live?.voices[t.id]?.find((r) => r.label === gn);
    return c`
=======
    const i = this.live?.voices[t.id]?.find((r) => r.label === $n);
>>>>>>> origin/main
    return l`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
<<<<<<< HEAD
          ${r ? l`<span class="chip phase ${r.phase}">${r.phase}</span>` : u}
||||||| 8cdb3c5
          ${i ? c`<span class="chip phase ${i.phase}">${i.phase}</span>` : u}
=======
          ${i ? l`<span class="chip phase ${i.phase}">${i.phase}</span>` : u}
>>>>>>> origin/main
        </div>
        <al-presence-overrides
          .hass=${this.hass}
          .config=${e}
          .path=${s}
          .errors=${this.errors}
        ></al-presence-overrides>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(e, t, s) {
<<<<<<< HEAD
    const r = this.hass?.states[s.entity], i = r?.attributes.friendly_name ?? (s.entity || "(no entity)"), n = _t(this.errors, t);
||||||| 8cdb3c5
    const i = this.hass?.states[s.entity], r = i?.attributes.friendly_name ?? (s.entity || "(no entity)"), n = xt(this.errors, t);
    return c`
=======
    const i = this.hass?.states[s.entity], r = i?.attributes.friendly_name ?? (s.entity || "(no entity)"), n = xt(this.errors, t);
>>>>>>> origin/main
    return l`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
<<<<<<< HEAD
          ${r ? l`<ha-state-icon .hass=${this.hass} .stateObj=${r}></ha-state-icon>` : l`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${s.key ?? i}</span>
          ${n ? l`<span class="badge" title="${n} problem(s)">${n}</span>` : u}
          ${r ? l`<span class="muted chip">${ei(this.hass, s.entity)}</span>` : u}
||||||| 8cdb3c5
          <ha-icon icon="mdi:flash"></ha-icon>
          <span class="name">${s.key ?? r}</span>
          ${n ? c`<span class="badge" title="${n} problem(s)">${n}</span>` : u}
          ${i ? c`<span class="muted chip">${i.state}</span>` : u}
=======
          ${i ? l`<ha-state-icon .hass=${this.hass} .stateObj=${i}></ha-state-icon>` : l`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${s.key ?? r}</span>
          ${n ? l`<span class="badge" title="${n} problem(s)">${n}</span>` : u}
          ${i ? l`<span class="muted chip">${Wi(this.hass, s.entity)}</span>` : u}
>>>>>>> origin/main
        </div>
        <al-stimulus-editor
          .hass=${this.hass}
          .config=${e}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
        ></al-stimulus-editor>
      </ha-expansion-panel>
    `;
  }
  renderStatus(e, t) {
<<<<<<< HEAD
    const s = t.id, r = this.live?.groups[s]?.precision ?? as(e, t), i = this.live?.groups[s]?.lights ?? 0, n = this.hass?.states[Nr(s)], o = this.simLog?.blocked[s] ?? null, a = (this.simLog?.entries ?? []).filter((c) => c.group_id === s).sort((c, h) => h.t - c.t).slice(0, jl);
||||||| 8cdb3c5
    const s = t.id, i = this.live?.groups[s]?.precision ?? rs(e, t), r = this.live?.groups[s]?.lights ?? 0, n = this.hass?.states[Si(s)], o = this.simLog?.blocked[s] ?? null, a = (this.simLog?.entries ?? []).filter((l) => l.group_id === s).sort((l, h) => h.t - l.t).slice(0, fl);
    return c`
=======
    const s = t.id, i = this.live?.groups[s]?.precision ?? is(e, t), r = this.live?.groups[s]?.lights ?? 0, n = this.hass?.states[Ai(s)], o = this.simLog?.blocked[s] ?? null, a = (this.simLog?.entries ?? []).filter((c) => c.group_id === s).sort((c, h) => h.t - c.t).slice(0, El);
>>>>>>> origin/main
    return l`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${i} light${i === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
<<<<<<< HEAD
        ${i > 0 ? l`<div class="row sim">
||||||| 8cdb3c5
        ${r > 0 ? c`<div class="row sim">
=======
        ${r > 0 ? l`<div class="row sim">
>>>>>>> origin/main
              <ha-switch
                class="sim-switch"
                .checked=${n?.state === "on"}
                .disabled=${n === void 0}
                title=${n === void 0 ? "No simulation switch for this group" : "Presence simulation"}
                @change=${(c) => this.onSim(s, c)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : u}
        ${o !== null ? l`<div class="muted blocked">Blocked: ${o}</div>` : u}
<<<<<<< HEAD
        ${this.renderSensor("expected", "Expected", Rr(s), r)}
        ${this.renderSensor("anomaly", "Anomaly", pn(s), r)}
||||||| 8cdb3c5
        ${o !== null ? c`<div class="muted blocked">Blocked: ${o}</div>` : u}
        ${this.renderSensor("expected", "Expected", ki(s), i)}
        ${this.renderSensor("anomaly", "Anomaly", Xr(s), i)}
=======
        ${this.renderSensor("expected", "Expected", Oi(s), i)}
        ${this.renderSensor("anomaly", "Anomaly", en(s), i)}
>>>>>>> origin/main
        <div class="muted readiness">${this.readiness(e, s)}</div>
        ${a.length > 0 ? l`<ol class="log">
              ${a.map((c) => this.renderLogEntry(c))}
            </ol>` : l`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
  }
  /**
   * One of the pattern sensors, with the day type it was measured against. The state is a
   * level, so it is printed at the group's precision rather than at whatever the sensor
   * happens to carry; anything that is not a number ("unknown", "unavailable") is a state,
   * not a level, and goes through untouched.
   */
<<<<<<< HEAD
  renderSensor(e, t, s, r) {
    const i = this.hass?.states[s], n = i?.attributes.day_type, o = i?.state, a = o === void 0 ? NaN : Number(o), c = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(a) ? wt(a, r) : o;
||||||| 8cdb3c5
  renderSensor(e, t, s, i) {
    const r = this.hass?.states[s], n = r?.attributes.day_type, o = r?.state, a = o === void 0 ? NaN : Number(o), l = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(a) ? yt(a, i) : o;
    return c`<div class="row ${e}">
=======
  renderSensor(e, t, s, i) {
    const r = this.hass?.states[s], n = r?.attributes.day_type, o = r?.state, a = o === void 0 ? NaN : Number(o), c = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(a) ? yt(a, i) : o;
>>>>>>> origin/main
    return l`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${c}</span>
      ${typeof n == "string" ? l`<span class="muted">${n}</span>` : u}
    </div>`;
  }
  renderLogEntry(e) {
    return l`<li>
      <span class="muted">${new Date(e.t * 1e3).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
    </li>`;
  }
  /**
   * How far the profile is from being usable. Days come from the profile document rather
   * than the readiness map, so a group that is still learning can say how much is left.
   */
  readiness(e, t) {
    const s = this.profileState;
    if (!s) return "Profile not loaded.";
    const r = s.profile.groups[t]?.days ?? 0, i = e.defaults.patterns?.min_days ?? $t;
    return s.ready[t] === !0 ? `Profile ready · ${r} days learned` : `Learning… ${r}/${i} days`;
  }
  render() {
    const { config: e, path: t } = this;
<<<<<<< HEAD
    return !e || !t || t.length === 0 ? l`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Fl(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
||||||| 8cdb3c5
    return !e || !t || t.length === 0 ? c`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : gl(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
=======
    return !e || !t || t.length === 0 ? l`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Al(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
>>>>>>> origin/main
  }
};
<<<<<<< HEAD
Q.styles = [
  C,
  S`
||||||| 8cdb3c5
W.styles = [
  T,
  A`
=======
q.styles = [
  T,
  A`
>>>>>>> origin/main
      :host {
        display: block;
        background: none;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 1em;
      }
      .cols {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px 24px;
        align-items: start;
      }
      .chip {
        white-space: nowrap;
      }
      .status > * {
        margin-bottom: 8px;
      }
      .value {
        font-variant-numeric: tabular-nums;
      }
      .log {
        list-style: none;
        margin: 0;
        padding: 0;
        font-size: 0.9em;
      }
      .log li {
        display: flex;
        gap: 8px;
        align-items: baseline;
      }
      .log .entity {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .log .state {
        color: var(--secondary-text-color);
      }
      .stimuli {
        margin-top: 16px;
      }
      ha-expansion-panel {
        margin-bottom: 4px;
      }
      .stimulus-head {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 1;
      }
      .stimulus-head .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .badge {
        background: var(--error-color, #db4437);
        color: var(--text-primary-color, #fff);
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.75em;
        line-height: 1.6;
      }
    `
];
<<<<<<< HEAD
ue([
||||||| 8cdb3c5
ce([
=======
de([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Q.prototype, "hass", 2);
ue([
||||||| 8cdb3c5
], W.prototype, "hass", 2);
ce([
=======
], q.prototype, "hass", 2);
de([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Q.prototype, "config", 2);
ue([
||||||| 8cdb3c5
], W.prototype, "config", 2);
ce([
=======
], q.prototype, "config", 2);
de([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Q.prototype, "path", 2);
ue([
||||||| 8cdb3c5
], W.prototype, "path", 2);
ce([
=======
], q.prototype, "path", 2);
de([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Q.prototype, "errors", 2);
ue([
||||||| 8cdb3c5
], W.prototype, "errors", 2);
ce([
=======
], q.prototype, "errors", 2);
de([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Q.prototype, "live", 2);
ue([
||||||| 8cdb3c5
], W.prototype, "live", 2);
ce([
=======
], q.prototype, "live", 2);
de([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Q.prototype, "profileState", 2);
ue([
||||||| 8cdb3c5
], W.prototype, "profileState", 2);
ce([
=======
], q.prototype, "profileState", 2);
de([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], Q.prototype, "simLog", 2);
Q = ue([
  _("al-strip-controls")
], Q);
var Hl = Object.defineProperty, Ul = Object.getOwnPropertyDescriptor, Re = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ul(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Hl(t, s, i), i;
||||||| 8cdb3c5
], W.prototype, "simLog", 2);
W = ce([
  k("al-strip-controls")
], W);
var ml = Object.defineProperty, vl = Object.getOwnPropertyDescriptor, Le = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? vl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ml(t, s, r), r;
=======
], q.prototype, "simLog", 2);
q = de([
  S("al-strip-controls")
], q);
var Ol = Object.defineProperty, Pl = Object.getOwnPropertyDescriptor, De = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Pl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ol(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const zl = 50;
function mr(e) {
  const t = [], s = (r) => {
    t.push({ id: r.id, label: r.name ?? r.id, precision: e ? as(e, r) : 0 }), r.children.forEach(s);
||||||| 8cdb3c5
const bl = 50;
function li(e) {
  const t = [], s = (i) => {
    t.push({ id: i.id, label: i.name ?? i.id, precision: e ? rs(e, i) : 0 }), i.children.forEach(s);
=======
const Cl = 50;
function hi(e) {
  const t = [], s = (i) => {
    t.push({ id: i.id, label: i.name ?? i.id, precision: e ? is(e, i) : 0 }), i.children.forEach(s);
>>>>>>> origin/main
  };
  return e?.groups.forEach(s), t;
}
<<<<<<< HEAD
function Bl(e, t) {
||||||| 8cdb3c5
function $l(e, t) {
=======
function Tl(e, t) {
>>>>>>> origin/main
  if (e === void 0) return "—";
  const s = Number(e);
  return e.trim() !== "" && Number.isFinite(s) ? wt(s, t) : e;
}
<<<<<<< HEAD
const gr = (e) => new Date(e * 1e3).toLocaleDateString();
let de = class extends b {
||||||| 8cdb3c5
const ci = (e) => new Date(e * 1e3).toLocaleDateString();
let ae = class extends b {
=======
const ui = (e) => new Date(e * 1e3).toLocaleDateString();
let le = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.profileState = null, this.simLog = null, this.force = !1;
  }
  onRebuild() {
<<<<<<< HEAD
    this.dispatchEvent(si(this.force));
||||||| 8cdb3c5
    this.dispatchEvent(Ui(this.force));
=======
    this.dispatchEvent(Vi(this.force));
>>>>>>> origin/main
  }
  renderStatus() {
    const e = this.profileState;
    if (!e) return l`<div class="status muted">Profile not loaded yet.</div>`;
<<<<<<< HEAD
    const { producer: t, generated_at: s, training_window: r, day_types: i, slot_minutes: n } = e.profile;
||||||| 8cdb3c5
    if (!e) return c`<div class="status muted">Profile not loaded yet.</div>`;
    const { producer: t, generated_at: s, training_window: i, day_types: r, slot_minutes: n } = e.profile;
    return c`
=======
    const { producer: t, generated_at: s, training_window: i, day_types: r, slot_minutes: n } = e.profile;
>>>>>>> origin/main
    return l`
      <div class="status">
        <div class="trained ${e.trained ? "yes" : "no"}">
          ${e.trained ? "Trained" : "Not trained yet — learning from history."}
        </div>
        <div><span class="muted">Producer</span> <span class="producer">${t.name} ${t.version}</span></div>
        <div>
          <span class="muted">Generated</span>
          <span class="generated">${new Date(s * 1e3).toLocaleString()}</span>
        </div>
        <div>
          <span class="muted">Learned from</span>
<<<<<<< HEAD
          <span class="window">${gr(r[0])} – ${gr(r[1])}</span>
||||||| 8cdb3c5
          <span class="window">${ci(i[0])} – ${ci(i[1])}</span>
=======
          <span class="window">${ui(i[0])} – ${ui(i[1])}</span>
>>>>>>> origin/main
        </div>
        <div class="muted">${i.join(", ")} · ${n}-minute slots</div>
      </div>
    `;
  }
  renderReadiness() {
<<<<<<< HEAD
    const e = this.profileState, t = mr(this.config);
||||||| 8cdb3c5
    const e = this.profileState, t = li(this.config);
=======
    const e = this.profileState, t = hi(this.config);
>>>>>>> origin/main
    if (!e || t.length === 0)
      return l`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
<<<<<<< HEAD
    const s = this.config?.defaults.patterns?.min_days ?? $t;
||||||| 8cdb3c5
      return c`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
    const s = this.config?.defaults.patterns?.min_days ?? vt;
    return c`
=======
    const s = this.config?.defaults.patterns?.min_days ?? vt;
>>>>>>> origin/main
    return l`
      <table class="readiness">
        <thead>
          <tr>
            <th>Group</th>
            <th>Ready</th>
            <th>Days</th>
            <th>Expected now</th>
          </tr>
        </thead>
        <tbody>
          ${t.map((r) => this.renderRow(r, e, s))}
        </tbody>
      </table>
    `;
  }
  renderRow(e, t, s) {
<<<<<<< HEAD
    const r = t.ready[e.id] === !0, i = t.profile.groups[e.id]?.days ?? 0, n = this.hass?.states[Rr(e.id)]?.state;
||||||| 8cdb3c5
    const i = t.ready[e.id] === !0, r = t.profile.groups[e.id]?.days ?? 0, n = this.hass?.states[ki(e.id)]?.state;
    return c`<tr>
=======
    const i = t.ready[e.id] === !0, r = t.profile.groups[e.id]?.days ?? 0, n = this.hass?.states[Oi(e.id)]?.state;
>>>>>>> origin/main
    return l`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${r ? "yes" : "no"}" title=${r ? "Ready" : `Needs ${s} days`}>
        ${r ? "✓" : "✗"}
      </td>
<<<<<<< HEAD
      <td class="days">${i}</td>
      <td class="expected">${Bl(n, e.precision)}</td>
||||||| 8cdb3c5
      <td class="days">${r}</td>
      <td class="expected">${$l(n, e.precision)}</td>
=======
      <td class="days">${r}</td>
      <td class="expected">${Tl(n, e.precision)}</td>
>>>>>>> origin/main
    </tr>`;
  }
  /** Why a group cannot be simulated right now; the first failing precondition, per group. */
  renderBlocked() {
    const e = Object.entries(this.simLog?.blocked ?? {}).filter(
      (r) => typeof r[1] == "string"
    );
    if (e.length === 0) return u;
<<<<<<< HEAD
    const t = mr(this.config), s = (r) => t.find((i) => i.id === r)?.label ?? r;
    return l`<ul class="blocked">
      ${e.map(([r, i]) => l`<li><span class="group">${s(r)}:</span> <span>${i}</span></li>`)}
||||||| 8cdb3c5
    const t = li(this.config), s = (i) => t.find((r) => r.id === i)?.label ?? i;
    return c`<ul class="blocked">
      ${e.map(([i, r]) => c`<li><span class="group">${s(i)}:</span> <span>${r}</span></li>`)}
=======
    const t = hi(this.config), s = (i) => t.find((r) => r.id === i)?.label ?? i;
    return l`<ul class="blocked">
      ${e.map(([i, r]) => l`<li><span class="group">${s(i)}:</span> <span>${r}</span></li>`)}
>>>>>>> origin/main
    </ul>`;
  }
  renderLog() {
<<<<<<< HEAD
    const e = [...this.simLog?.entries ?? []].sort((t, s) => s.t - t.t).slice(0, zl);
||||||| 8cdb3c5
    const e = [...this.simLog?.entries ?? []].sort((t, s) => s.t - t.t).slice(0, bl);
    return e.length === 0 ? c`<div class="muted log-empty">No simulated light changes yet.</div>` : c`<ol class="log">
=======
    const e = [...this.simLog?.entries ?? []].sort((t, s) => s.t - t.t).slice(0, Cl);
>>>>>>> origin/main
    return e.length === 0 ? l`<div class="muted log-empty">No simulated light changes yet.</div>` : l`<ol class="log">
      ${e.map((t) => this.renderEntry(t))}
    </ol>`;
  }
  renderEntry(e) {
    return l`<li>
      <span class="muted">${new Date(e.t * 1e3).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
      ${e.brightness !== null ? l`<span class="muted">${e.brightness}</span>` : u}
    </li>`;
  }
  render() {
    return l`
      <div class="page">
        <ha-card header="Pattern profile">
          ${this.renderStatus()}
          <div class="row rebuild-row">
            <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
            <ha-switch
              class="force"
              .checked=${this.force}
              @change=${(e) => {
      this.force = e.target.checked === !0;
    }}
            ></ha-switch>
            <span class="muted">force</span>
          </div>
        </ha-card>
        <ha-card header="Readiness">${this.renderReadiness()}</ha-card>
        <ha-card header="Simulation">${this.renderBlocked()} ${this.renderLog()}</ha-card>
      </div>
    `;
  }
};
<<<<<<< HEAD
de.styles = [
  C,
  S`
||||||| 8cdb3c5
ae.styles = [
  T,
  A`
=======
le.styles = [
  T,
  A`
>>>>>>> origin/main
      h3 {
        margin: 0 0 8px;
        font-size: 1em;
      }
      .status > div {
        margin-bottom: 4px;
      }
      .trained.no {
        color: var(--warning-color, #ffa600);
      }
      table.readiness {
        width: 100%;
        border-collapse: collapse;
      }
      table.readiness th {
        text-align: left;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      table.readiness th,
      table.readiness td {
        padding: 4px 8px 4px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      td.ready.no {
        color: var(--warning-color, #ffa600);
      }
      td.days,
      td.expected {
        font-variant-numeric: tabular-nums;
      }
      .rebuild-row {
        margin-top: 16px;
      }
      ol.log,
      ul.blocked {
        list-style: none;
        margin: 0;
        padding: 0;
        font-size: 0.9em;
      }
      ol.log li,
      ul.blocked li {
        display: flex;
        gap: 8px;
        align-items: baseline;
        padding: 2px 0;
      }
      ol.log {
        max-height: 320px;
        overflow-y: auto;
      }
    `
];
<<<<<<< HEAD
Re([
||||||| 8cdb3c5
Le([
=======
De([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], de.prototype, "hass", 2);
Re([
||||||| 8cdb3c5
], ae.prototype, "hass", 2);
Le([
=======
], le.prototype, "hass", 2);
De([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], de.prototype, "config", 2);
Re([
||||||| 8cdb3c5
], ae.prototype, "config", 2);
Le([
=======
], le.prototype, "config", 2);
De([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], de.prototype, "profileState", 2);
Re([
||||||| 8cdb3c5
], ae.prototype, "profileState", 2);
Le([
=======
], le.prototype, "profileState", 2);
De([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], de.prototype, "simLog", 2);
Re([
  m()
], de.prototype, "force", 2);
de = Re([
  _("al-patterns")
], de);
const vr = 160, br = 110, st = 60, xs = 120, ws = 54;
function yi(e) {
  const t = [], s = (r, i, n) => {
    const o = i <= 1 ? r.id : n;
    t.push({ id: r.id, label: r.name ?? r.id, branch: o }), r.children.forEach((a) => s(a, i + 1, o));
||||||| 8cdb3c5
], ae.prototype, "simLog", 2);
Le([
  g()
], ae.prototype, "force", 2);
ae = Le([
  k("al-patterns")
], ae);
const di = 160, hi = 110, et = 60, vs = 120, bs = 54;
function or(e) {
  const t = [], s = (i, r, n) => {
    const o = r <= 1 ? i.id : n;
    t.push({ id: i.id, label: i.name ?? i.id, branch: o }), i.children.forEach((a) => s(a, r + 1, o));
=======
], le.prototype, "simLog", 2);
De([
  g()
], le.prototype, "force", 2);
le = De([
  S("al-patterns")
], le);
const pi = 160, fi = 110, et = 60, vs = 120, bs = 54;
function dr(e) {
  const t = [], s = (i, r, n) => {
    const o = r <= 1 ? i.id : n;
    t.push({ id: i.id, label: i.name ?? i.id, branch: o }), i.children.forEach((a) => s(a, r + 1, o));
>>>>>>> origin/main
  };
  return e.groups.forEach((r) => s(r, 0, r.id)), t;
}
<<<<<<< HEAD
function Wl(e, t) {
||||||| 8cdb3c5
function yl(e, t) {
=======
function Ll(e, t) {
>>>>>>> origin/main
  if (e === 0 && t === 0) return 0;
  const s = e === 0 ? 1 / 0 : xs / 2 / Math.abs(e), r = t === 0 ? 1 / 0 : ws / 2 / Math.abs(t);
  return Math.min(s, r, 0.5);
}
<<<<<<< HEAD
function Gl(e, t) {
  const s = new Set(t.nodes), r = new Set(t.exits), i = [], n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const p of yi(e)) {
||||||| 8cdb3c5
function xl(e, t) {
  const s = new Set(t.nodes), i = new Set(t.exits), r = [], n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const p of or(e)) {
=======
function Dl(e, t) {
  const s = new Set(t.nodes), i = new Set(t.exits), r = [], n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const p of dr(e)) {
>>>>>>> origin/main
    if (o.set(p.id, p.label), !s.has(p.id)) continue;
    let v = n.get(p.branch);
    v === void 0 && (v = i.length, n.set(p.branch, v), i.push([])), i[v].push(p.id);
  }
  const a = [];
  i.forEach(
    (p, v) => p.forEach(
      (y, x) => a.push({
        id: y,
        label: o.get(y) ?? y,
        row: v,
        col: x,
<<<<<<< HEAD
        x: st + x * vr,
        y: st + v * br,
        exit: r.has(y)
||||||| 8cdb3c5
        x: et + x * di,
        y: et + v * hi,
        exit: i.has(y)
=======
        x: et + x * pi,
        y: et + v * fi,
        exit: i.has(y)
>>>>>>> origin/main
      })
    )
  );
  const c = new Map(a.map((p) => [p.id, p])), h = [];
  for (const [p, v, y] of t.edges) {
<<<<<<< HEAD
    const x = c.get(p), q = c.get(v);
    if (!x || !q) continue;
    const Ie = q.x - x.x, je = q.y - x.y, te = Wl(Ie, je);
||||||| 8cdb3c5
    const x = l.get(p), B = l.get(v);
    if (!x || !B) continue;
    const Re = B.x - x.x, Me = B.y - x.y, Y = yl(Re, Me);
=======
    const x = c.get(p), W = c.get(v);
    if (!x || !W) continue;
    const Ne = W.x - x.x, Re = W.y - x.y, X = Ll(Ne, Re);
>>>>>>> origin/main
    h.push({
      a: p,
      b: v,
      oneWay: y,
<<<<<<< HEAD
      x1: x.x + Ie * te,
      y1: x.y + je * te,
      x2: q.x - Ie * te,
      y2: q.y - je * te
||||||| 8cdb3c5
      x1: x.x + Re * Y,
      y1: x.y + Me * Y,
      x2: B.x - Re * Y,
      y2: B.y - Me * Y
=======
      x1: x.x + Ne * X,
      y1: x.y + Re * X,
      x2: W.x - Ne * X,
      y2: W.y - Re * X
>>>>>>> origin/main
    });
  }
  const f = i.reduce((p, v) => Math.max(p, v.length), 1);
  return {
    nodes: a,
    edges: h,
<<<<<<< HEAD
    width: st * 2 + (f - 1) * vr,
    height: st * 2 + (Math.max(i.length, 1) - 1) * br
||||||| 8cdb3c5
    width: et * 2 + (f - 1) * di,
    height: et * 2 + (Math.max(r.length, 1) - 1) * hi
=======
    width: et * 2 + (f - 1) * pi,
    height: et * 2 + (Math.max(r.length, 1) - 1) * fi
>>>>>>> origin/main
  };
}
<<<<<<< HEAD
const Vl = (e, t) => ({
||||||| 8cdb3c5
const wl = (e, t) => ({
=======
const Ml = (e, t) => ({
>>>>>>> origin/main
  x: e.x1 + (e.x2 - e.x1) * t,
  y: e.y1 + (e.y2 - e.y1) * t
<<<<<<< HEAD
}), xi = (e, t, s) => e.edges.find((r) => r.a === t && r.b === s || r.a === s && r.b === t);
function ql(e, t) {
||||||| 8cdb3c5
}), ar = (e, t, s) => e.edges.find((i) => i.a === t && i.b === s || i.a === s && i.b === t);
function _l(e, t) {
=======
}), hr = (e, t, s) => e.edges.find((i) => i.a === t && i.b === s || i.a === s && i.b === t);
function Nl(e, t) {
>>>>>>> origin/main
  const s = [];
<<<<<<< HEAD
  for (let r = 1; r < t.length; r++) {
    const i = xi(e, t[r - 1], t[r]);
    i && s.push(i);
||||||| 8cdb3c5
  for (let i = 1; i < t.length; i++) {
    const r = ar(e, t[i - 1], t[i]);
    r && s.push(r);
=======
  for (let i = 1; i < t.length; i++) {
    const r = hr(e, t[i - 1], t[i]);
    r && s.push(r);
>>>>>>> origin/main
  }
  return s;
}
<<<<<<< HEAD
var Kl = Object.defineProperty, Yl = Object.getOwnPropertyDescriptor, Ee = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Yl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Kl(t, s, i), i;
||||||| 8cdb3c5
var Sl = Object.defineProperty, kl = Object.getOwnPropertyDescriptor, _e = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? kl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Sl(t, s, r), r;
=======
var Rl = Object.defineProperty, Il = Object.getOwnPropertyDescriptor, _e = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Il(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Rl(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const Ht = xs / 2, Ut = ws / 2, Xl = 2, zt = 9, Jl = 7, P = (e) => String(Math.round(e * 10) / 10);
let se = class extends b {
||||||| 8cdb3c5
const Ft = vs / 2, Ht = bs / 2, El = 2, Ut = 9, Al = 7, O = (e) => String(Math.round(e * 10) / 10);
let Z = class extends b {
=======
const jt = vs / 2, Ft = bs / 2, jl = 2, Ht = 9, Fl = 7, O = (e) => String(Math.round(e * 10) / 10);
let Z = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
  }
  occupantsOf(e) {
    return this.presence?.occupants[e] ?? [];
  }
  select(e) {
<<<<<<< HEAD
    this.dispatchEvent(go(e));
||||||| 8cdb3c5
    this.dispatchEvent(Xn(e));
=======
    this.dispatchEvent(ro(e));
>>>>>>> origin/main
  }
  onKeydown(e, t) {
    e.key !== "Enter" && e.key !== " " || (e.preventDefault(), this.select(t));
  }
  /**
   * Where each moving person is drawn: half way along the door between their two most
   * likely rooms. A person "between" two rooms with no door is a wrong reading rather
   * than a place, so they are left off the map instead of being put somewhere untrue.
   */
  movers(e) {
    const t = [], s = Object.entries(this.presence?.devices ?? {}).sort(([r], [i]) => r.localeCompare(i));
    for (const [r, i] of s) {
      if (!i.moving) continue;
      const n = Object.entries(i.candidates).sort((h, f) => f[1] - h[1] || h[0].localeCompare(f[0])), o = n[0]?.[0], a = n[1]?.[0];
      if (o === void 0 || a === void 0) continue;
<<<<<<< HEAD
      const c = xi(e, o, a);
      c && t.push({ name: r, ...Vl(c, 0.5) });
||||||| 8cdb3c5
      const l = ar(e, o, a);
      l && t.push({ name: i, ...wl(l, 0.5) });
=======
      const c = hr(e, o, a);
      c && t.push({ name: i, ...Ml(c, 0.5) });
>>>>>>> origin/main
    }
    return t;
  }
  /**
   * What the whole picture says, for somebody who cannot see it. It labels a `group`, not
   * an `img`: `role="img"` prunes the tree below it, which would take the focusable room
   * buttons with it.
   */
  summary(e) {
    const t = `${e.nodes.length} room${e.nodes.length === 1 ? "" : "s"}`, s = `${e.edges.length} door${e.edges.length === 1 ? "" : "s"}`, r = e.nodes.filter((n) => this.occupantsOf(n.id).length > 0).map((n) => `${n.label}: ${this.occupantsOf(n.id).join(", ")}`), i = r.length === 0 ? "Nobody is in a room right now." : `${r.join("; ")}.`;
    return `Room map, ${t} and ${s}. ${i}`;
  }
  renderEdge(e, t) {
    const s = t.has(e);
    return A`<line
      class="edge ${s ? "on-path" : ""}"
      data-one-way=${e.oneWay}
      x1=${P(e.x1)}
      y1=${P(e.y1)}
      x2=${P(e.x2)}
      y2=${P(e.y2)}
      marker-end=${e.oneWay ? "url(#al-arrow)" : u}
    ></line>`;
  }
  renderNode(e) {
<<<<<<< HEAD
    const t = this.occupantsOf(e.id), s = t.slice(0, Xl), r = t.length - s.length, i = this.selected.includes(e.id), n = [...s, ...r > 0 ? [`+${r}`] : []].join(", "), o = [
||||||| 8cdb3c5
    const t = this.occupantsOf(e.id), s = t.slice(0, El), i = t.length - s.length, r = this.selected.includes(e.id), n = [...s, ...i > 0 ? [`+${i}`] : []].join(", "), o = [
=======
    const t = this.occupantsOf(e.id), s = t.slice(0, jl), i = t.length - s.length, r = this.selected.includes(e.id), n = [...s, ...i > 0 ? [`+${i}`] : []].join(", "), o = [
>>>>>>> origin/main
      e.label,
      e.exit ? "an exit" : "",
      t.length > 0 ? `${t.length} here: ${t.join(", ")}` : "empty"
    ].filter((a) => a !== "").join(", ");
    return A`<g
      class="node ${i ? "selected" : ""}"
      data-id=${e.id}
      role="button"
      tabindex="0"
      aria-pressed=${i ? "true" : "false"}
      aria-label=${o}
      @click=${() => this.select(e.id)}
      @keydown=${(a) => this.onKeydown(a, e.id)}
    >
      <rect
        class="box"
<<<<<<< HEAD
        x=${P(e.x - Ht)}
        y=${P(e.y - Ut)}
        width=${xs}
        height=${ws}
||||||| 8cdb3c5
        x=${O(e.x - Ft)}
        y=${O(e.y - Ht)}
        width=${vs}
        height=${bs}
=======
        x=${O(e.x - jt)}
        y=${O(e.y - Ft)}
        width=${vs}
        height=${bs}
>>>>>>> origin/main
        rx="8"
      ></rect>
      <text class="label" x=${P(e.x)} y=${P(e.y - 4)} text-anchor="middle">${e.label}</text>
      ${n === "" ? u : A`<text class="names" x=${P(e.x)} y=${P(e.y + 13)} text-anchor="middle">${n}</text>`}
      ${t.length === 0 ? u : this.renderBadge(e, t.length)}
      ${e.exit ? this.renderDoor(e) : u}
    </g>`;
  }
  renderBadge(e, t) {
<<<<<<< HEAD
    const s = e.x + Ht - zt - 3, r = e.y - Ut + zt + 3;
    return A`<circle class="badge" cx=${P(s)} cy=${P(r)} r=${zt}></circle>
      <text class="count" x=${P(s)} y=${P(r + 3.5)} text-anchor="middle">${t}</text>`;
||||||| 8cdb3c5
    const s = e.x + Ft - Ut - 3, i = e.y - Ht + Ut + 3;
    return E`<circle class="badge" cx=${O(s)} cy=${O(i)} r=${Ut}></circle>
      <text class="count" x=${O(s)} y=${O(i + 3.5)} text-anchor="middle">${t}</text>`;
=======
    const s = e.x + jt - Ht - 3, i = e.y - Ft + Ht + 3;
    return E`<circle class="badge" cx=${O(s)} cy=${O(i)} r=${Ht}></circle>
      <text class="count" x=${O(s)} y=${O(i + 3.5)} text-anchor="middle">${t}</text>`;
>>>>>>> origin/main
  }
  /** A door leaf in the corner: this room is a way out of the house. */
  renderDoor(e) {
<<<<<<< HEAD
    const t = e.x - Ht + 7, s = e.y + Ut - 7;
    return A`<path class="door" d=${`M ${P(t)} ${P(s)} v -14 h 10 v 14 z`}></path>`;
||||||| 8cdb3c5
    const t = e.x - Ft + 7, s = e.y + Ht - 7;
    return E`<path class="door" d=${`M ${O(t)} ${O(s)} v -14 h 10 v 14 z`}></path>`;
=======
    const t = e.x - jt + 7, s = e.y + Ft - 7;
    return E`<path class="door" d=${`M ${O(t)} ${O(s)} v -14 h 10 v 14 z`}></path>`;
>>>>>>> origin/main
  }
  renderPerson(e) {
<<<<<<< HEAD
    return A`<circle class="person" data-name=${e.name} cx=${P(e.x)} cy=${P(e.y)} r=${Jl}>
||||||| 8cdb3c5
    return E`<circle class="person" data-name=${e.name} cx=${O(e.x)} cy=${O(e.y)} r=${Al}>
=======
    return E`<circle class="person" data-name=${e.name} cx=${O(e.x)} cy=${O(e.y)} r=${Fl}>
>>>>>>> origin/main
      <title>${e.name} is on the move</title>
    </circle>`;
  }
  render() {
    const e = this.config, t = this.topology;
    if (!e || !t || t.nodes.length === 0)
      return l`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
<<<<<<< HEAD
    const s = Gl(e, t), r = new Set(this.paths.flatMap((n) => ql(s, n))), i = this.summary(s);
||||||| 8cdb3c5
    const s = xl(e, t), i = new Set(this.paths.flatMap((n) => _l(s, n))), r = this.summary(s);
    return c`
=======
    const s = Dl(e, t), i = new Set(this.paths.flatMap((n) => Nl(s, n))), r = this.summary(s);
>>>>>>> origin/main
    return l`
      <svg
        viewBox="0 0 ${s.width} ${s.height}"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label=${i}
      >
        <title>${i}</title>
        <defs>
          <marker
            id="al-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path class="arrow" d="M 0 0 L 10 5 L 0 10 z"></path>
          </marker>
        </defs>
        ${s.edges.map((n) => this.renderEdge(n, r))}
        ${s.nodes.map((n) => this.renderNode(n))}
        ${this.movers(s).map((n) => this.renderPerson(n))}
      </svg>
    `;
  }
};
se.styles = [
  C,
  S`
      :host {
        display: block;
        background: none;
        overflow-x: auto;
      }
      svg {
        min-width: 100%;
        height: auto;
      }
      .edge {
        stroke: var(--divider-color);
        stroke-width: 2;
      }
      .edge.on-path {
        stroke: var(--primary-color);
        stroke-width: 3;
      }
      .arrow {
        fill: currentColor;
        color: var(--divider-color);
      }
      .node {
        cursor: pointer;
        color: var(--divider-color);
      }
      .node .box {
        fill: var(--card-background-color, transparent);
        stroke: currentColor;
        stroke-width: 2;
      }
      .node.selected {
        color: var(--primary-color);
      }
      .node:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .label {
        fill: var(--primary-text-color);
        font-size: 12px;
        font-weight: 500;
      }
      .names {
        fill: var(--secondary-text-color);
        font-size: 10px;
      }
      .badge {
        fill: var(--primary-color);
      }
      .count {
        fill: var(--text-primary-color, #fff);
        font-size: 10px;
        font-weight: 600;
      }
      .door {
        fill: none;
        stroke: var(--secondary-text-color);
        stroke-width: 1.5;
      }
      .person {
        fill: var(--primary-color);
        stroke: var(--card-background-color, #fff);
        stroke-width: 2;
      }
      .empty {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        padding: 8px 0;
      }
    `
];
Ee([
  d({ attribute: !1 })
], se.prototype, "hass", 2);
Ee([
  d({ attribute: !1 })
], se.prototype, "config", 2);
Ee([
  d({ attribute: !1 })
], se.prototype, "topology", 2);
Ee([
  d({ attribute: !1 })
], se.prototype, "presence", 2);
Ee([
  d({ attribute: !1 })
], se.prototype, "selected", 2);
Ee([
  d({ attribute: !1 })
<<<<<<< HEAD
], se.prototype, "paths", 2);
se = Ee([
  _("al-graph-map")
], se);
const Zl = ["phone", "watch", "tag", "laptop", "other"], Ql = ["activity", "steps", "battery_state"];
var ec = Object.defineProperty, tc = Object.getOwnPropertyDescriptor, Qe = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? tc(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && ec(t, s, i), i;
||||||| 8cdb3c5
], Z.prototype, "paths", 2);
Z = _e([
  k("al-graph-map")
], Z);
var Ol = Object.defineProperty, Pl = Object.getOwnPropertyDescriptor, K = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Pl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ol(t, s, r), r;
=======
], Z.prototype, "paths", 2);
Z = _e([
  S("al-graph-map")
], Z);
var Hl = Object.defineProperty, Ul = Object.getOwnPropertyDescriptor, Y = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ul(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Hl(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const es = {
  phone: "mdi:cellphone",
  watch: "mdi:watch",
  tag: "mdi:tag",
  laptop: "mdi:laptop",
  other: "mdi:bluetooth"
}, wi = {
  phone: "Phone",
  watch: "Watch",
  tag: "Tag",
  laptop: "Laptop",
  other: "Other"
}, sc = {
  activity: "Activity",
  steps: "Steps",
  battery_state: "Battery state"
}, rc = {
  entity: { filter: { domain: "device_tracker", integration: "bermuda" } }
}, ic = { entity: { filter: { domain: "person" } } }, nc = {
  entity: { filter: { domain: "device_tracker", integration: "mobile_app" } }
}, oc = { entity: { filter: { domain: "sensor" } } }, ac = {
  select: { mode: "dropdown", options: Zl.map((e) => ({ value: e, label: wi[e] })) }
};
let ke = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.presence = null;
  }
  get people() {
    return this.config ? F(this.config).people : [];
  }
  emit(e, t, s = !1) {
    const r = this.config;
    if (!r) return;
    const i = { ...F(r), people: e }, n = O(r, ["presence"], i);
    this.dispatchEvent(s ? D(n, void 0, !0) : D(n, `presence:people:${t}`));
  }
  editPerson(e, t, s) {
    this.emit(
      this.people.map((r, i) => i === e ? { ...r, ...t } : r),
      `${e}:${s}`
    );
  }
  editDevice(e, t, s, r) {
    const i = this.people[e];
    if (!i) return;
    const n = i.devices.map((o, a) => a === t ? { ...o, ...s } : o);
    this.emit(
      this.people.map((o, a) => a === e ? { ...o, devices: n } : o),
      `${e}:${t}:${r}`
    );
  }
  addPerson() {
    this.emit([...this.people, zr()], "add", !0);
  }
  removePerson(e) {
    this.emit(
      this.people.filter((t, s) => s !== e),
      "remove",
      !0
    );
  }
  addDevice(e) {
    const t = this.people[e];
    t && this.editPerson(e, { devices: [...t.devices, Ur("")] }, "add-device");
  }
  removeDevice(e, t) {
    this.people[e] && this.emit(
      this.people.map((r, i) => i === e ? { ...r, devices: r.devices.filter((n, o) => o !== t) } : r),
      `${e}:remove-device`,
      !0
    );
  }
  /** What the coordinator found for this device, if it reported on it at all. */
  found(e, t) {
    const r = (e.name === null ? [] : Object.values(this.presence?.people?.[e.name]?.devices ?? {})).find((i) => i.tracker === t.tracker);
    return r ? r.found : null;
  }
  text(e) {
    return e ?? "";
  }
  renderSignal(e, t, s, r, i, n) {
    const o = i === null ? u : i[r] ? l`<ha-icon class="found" icon="mdi:check-circle-outline" title="Found"></ha-icon>` : l`<ha-icon class="missing" icon="mdi:alert-circle-outline" title="Not found"></ha-icon>`;
    return l`<div class="signal signal-${r}">
      <ha-selector
        .hass=${this.hass}
        .selector=${oc}
        .label=${sc[r]}
        .helper=${s.companion ? "Blank: found on the companion device." : ""}
        .required=${!1}
        .value=${this.text(s.signals[r])}
        @value-changed=${(a) => this.editDevice(
      e,
      t,
      { signals: { ...s.signals, [r]: a.detail.value ? a.detail.value : null } },
      r
    )}
      ></ha-selector>
      ${o}
      ${n[r] ? l`<div class="error">${n[r]}</div>` : u}
    </div>`;
  }
  renderDevice(e, t, s, r) {
    const i = Z(this.errors, ["presence", "people", e, "devices", t]), n = Z(this.errors, ["presence", "people", e, "devices", t, "signals"]), o = this.found(s, r);
    return l`<div class="device">
      <div class="device-head">
        <ha-icon icon=${es[r.kind]}></ha-icon>
        <h5>${r.name ?? (r.tracker || "New device")}</h5>
        <ha-icon-button
          class="remove-device"
          label="Remove device"
          @click=${() => this.removeDevice(e, t)}
          ><ha-icon icon="mdi:close"></ha-icon
        ></ha-icon-button>
      </div>
      <div class="fields">
        <ha-selector
          class="tracker"
          .hass=${this.hass}
          .selector=${rc}
          .label=${"Bermuda tracker"}
          .required=${!0}
          .value=${r.tracker}
          @value-changed=${(a) => this.editDevice(e, t, { tracker: a.detail.value ?? "" }, "tracker")}
        ></ha-selector>
        ${i.tracker ? l`<div class="error">${i.tracker}</div>` : u}
        <ha-selector
          class="device-name"
          .hass=${this.hass}
          .selector=${{ text: {} }}
          .label=${"Name"}
          .helper=${"Blank: the Bermuda device's name."}
          .required=${!1}
          .value=${this.text(r.name)}
          @value-changed=${(a) => this.editDevice(e, t, { name: a.detail.value ? a.detail.value : null }, "name")}
        ></ha-selector>
        <ha-selector
          class="kind"
          .hass=${this.hass}
          .selector=${ac}
          .label=${"Kind"}
          .required=${!0}
          .value=${r.kind}
          @value-changed=${(a) => this.editDevice(e, t, { kind: a.detail.value ?? "other" }, "kind")}
        ></ha-selector>
        <ha-selector
          class="companion"
          .hass=${this.hass}
          .selector=${nc}
          .label=${"Companion app tracker"}
          .helper=${"The mobile_app device_tracker of the same phone; its sensors say whether it is carried."}
          .required=${!1}
          .value=${this.text(r.companion)}
          @value-changed=${(a) => this.editDevice(e, t, { companion: a.detail.value ? a.detail.value : null }, "companion")}
        ></ha-selector>
        ${Ql.map((a) => this.renderSignal(e, t, r, a, o, n))}
      </div>
    </div>`;
  }
  renderPerson(e, t) {
    const s = Z(this.errors, ["presence", "people", e]);
    return l`<div class="person">
      <div class="person-head">
        <ha-icon icon="mdi:account"></ha-icon>
        <h4>${t.name ?? t.devices[0]?.name ?? t.person ?? "New person"}</h4>
        <ha-icon-button class="remove-person" label="Remove person" @click=${() => this.removePerson(e)}
          ><ha-icon icon="mdi:close"></ha-icon
        ></ha-icon-button>
      </div>
      <div class="fields">
        <ha-selector
          class="person-name"
          .hass=${this.hass}
          .selector=${{ text: {} }}
          .label=${"Name"}
          .helper=${"Blank: the first device's name. Entities are keyed off it."}
          .required=${!1}
          .value=${this.text(t.name)}
          @value-changed=${(r) => this.editPerson(e, { name: r.detail.value ? r.detail.value : null }, "name")}
        ></ha-selector>
        ${s.name ? l`<div class="error">${s.name}</div>` : u}
        <ha-selector
          class="person-entity"
          .hass=${this.hass}
          .selector=${ic}
          .label=${"Person"}
          .helper=${"Its device_trackers seed the devices below: Bermuda ones to follow, a mobile_app one as the companion."}
          .required=${!1}
          .value=${this.text(t.person)}
          @value-changed=${(r) => this.editPerson(e, { person: r.detail.value ? r.detail.value : null }, "person")}
        ></ha-selector>
        ${s.person ? l`<div class="error">${s.person}</div>` : u}
      </div>
      ${t.devices.map((r, i) => this.renderDevice(e, i, t, r))}
      <ha-button class="add-device" @click=${() => this.addDevice(e)}>Add device</ha-button>
    </div>`;
  }
  render() {
    if (!this.config) return u;
    const e = this.people;
    return l`
      ${e.length === 0 ? l`<div class="empty">Nobody is followed yet. Add a person and pick their person entity.</div>` : u}
      ${e.map((t, s) => this.renderPerson(s, t))}
      <ha-button class="add-person" @click=${() => this.addPerson()}>Add person</ha-button>
    `;
  }
};
ke.styles = [
  C,
  S`
      :host {
        display: block;
      }
      .person {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      }
      .person-head,
      .device-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .person-head h4,
      .device-head h5 {
        margin: 0;
        flex: 1;
        font-weight: 600;
      }
      .device {
        border-top: 1px solid var(--divider-color);
        padding-top: 8px;
        margin-top: 8px;
      }
      .fields {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 8px;
      }
      .signal {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .signal ha-selector {
        flex: 1;
      }
      .found {
        color: var(--success-color, #4caf50);
      }
      .missing {
        color: var(--warning-color, #ffa600);
      }
      .error {
        color: var(--error-color);
        font-size: 0.85em;
      }
      .empty {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-bottom: 8px;
      }
    `
];
Qe([
  d({ attribute: !1 })
], ke.prototype, "hass", 2);
Qe([
  d({ attribute: !1 })
], ke.prototype, "config", 2);
Qe([
  d({ attribute: !1 })
], ke.prototype, "errors", 2);
Qe([
  d({ attribute: !1 })
], ke.prototype, "presence", 2);
ke = Qe([
  _("al-people-editor")
], ke);
var lc = Object.defineProperty, cc = Object.getOwnPropertyDescriptor, z = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? cc(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && lc(t, s, i), i;
};
const dc = 2e3, $r = "away", yr = {
||||||| 8cdb3c5
const Cl = 2e3, ui = {
=======
const zl = 2e3, gi = {
>>>>>>> origin/main
  enabled: "Estimate room presence",
  devices: "Tracked devices",
  envelope: "Presence envelope",
  threshold: "Confidence threshold",
  stay: "Stay probability",
  escape: "Escape probability",
  scale: "Distance scale",
  floor: "Room floor",
<<<<<<< HEAD
  stuck_after: "Reset when stuck for",
  activity_floor: "Empty-room floor",
  carried_prior: "Carried prior",
  carried_flip: "Carried flip time",
  carried_recent: "Recent window",
  carried_nearby: "Parked nearby",
  carried_charging: "Charging weight",
  carried_moving: "Moving weight",
  carried_still_room_empty: "Still in an empty room weight",
  carried_jitter: "Jitter weight"
}, xr = {
||||||| 8cdb3c5
  stuck_after: "Reset when stuck for"
}, pi = {
=======
  stuck_after: "Reset when stuck for"
}, mi = {
>>>>>>> origin/main
  enabled: "Estimate which room each tracked device is in. Needs Bermuda.",
  devices: "Bermuda device_trackers to follow — one per person.",
  envelope: "Preset the presence channel of every room starts from.",
  threshold: "How sure the estimate has to be before somebody counts as in the room.",
  stay: "Chance of staying put between two updates. Higher is steadier and slower.",
  escape: "Chance of turning up in a room with no path to this one. The way back from a wrong guess.",
  scale: "Distance, in metres, at which a scanner stops telling you anything.",
  floor: "Likelihood given to a room with no scanner of its own.",
<<<<<<< HEAD
  stuck_after: "How long the readings have to stay implausible before the estimate is reset.",
  activity_floor: "Likelihood given to a room whose activity level is 0.0 while another room is busy. Lower makes an empty room a stronger 'not here'.",
  carried_prior: "How likely a device is on its person before any signal says otherwise.",
  carried_flip: "Mean time between a device being picked up or put down. Longer is steadier.",
  carried_recent: "How far back 'moved lately' looks. A signal held this long is worth its whole weight.",
  carried_nearby: "Chance a parked device is in the same room as its person. A phone on the kitchen counter still says something about the kitchen.",
  carried_charging: "Log-odds added while the battery is charging or full. Negative: on a cable means on a table.",
  carried_moving: "Log-odds added while the companion app reports walking, or the step count rose lately.",
  carried_still_room_empty: "Log-odds added while the device sits still in a room whose level is 0.0.",
  carried_jitter: "Log-odds added while the device's closest distance wanders. A pocket moves; a shelf does not."
}, hc = [
||||||| 8cdb3c5
  stuck_after: "How long the readings have to stay implausible before the estimate is reset."
}, Tl = [
=======
  stuck_after: "How long the readings have to stay implausible before the estimate is reset."
}, Bl = [
>>>>>>> origin/main
  "enabled",
  "envelope",
  "threshold",
  "stay",
  "escape",
  "scale",
  "floor",
<<<<<<< HEAD
  "stuck_after",
  "activity_floor",
  "carried_prior",
  "carried_flip",
  "carried_recent",
  "carried_nearby",
  "carried_charging",
  "carried_moving",
  "carried_still_room_empty",
  "carried_jitter"
], wr = ["charging", "moving", "still_room_empty", "jitter"], uc = {
||||||| 8cdb3c5
  "stuck_after"
], fi = {
=======
  "stuck_after"
], vi = {
>>>>>>> origin/main
  entity: { multiple: !0, filter: { domain: "device_tracker", integration: "bermuda" } }
<<<<<<< HEAD
}, pc = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }, fc = { number: { min: 0.01, max: 1, step: 0.01, mode: "slider" } }, mc = { number: { min: 0, max: 0.1, step: 1e-3, mode: "box" } }, gc = { number: { min: 0.1, step: 0.1, mode: "box" } }, _r = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } }, Bt = { duration: {} }, kr = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }, vc = { number: { min: -10, max: 10, step: 0.5, mode: "box" } }, Er = " → ", bc = "Give it an area that matches a room, or map it in Settings below.", $c = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", j = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let R = class extends b {
||||||| 8cdb3c5
}, Ll = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }, Dl = { number: { min: 0.01, max: 1, step: 0.01, mode: "slider" } }, Rl = { number: { min: 0, max: 0.1, step: 1e-3, mode: "box" } }, Ml = { number: { min: 0.1, step: 0.1, mode: "box" } }, Nl = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } }, Il = { duration: {} }, gi = " → ", jl = "Give it an area that matches a room, or map it in Settings below.", Fl = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", je = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let j = class extends b {
=======
}, Wl = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }, Gl = { number: { min: 0.01, max: 1, step: 0.01, mode: "slider" } }, Vl = { number: { min: 0, max: 0.1, step: 1e-3, mode: "box" } }, ql = { number: { min: 0.1, step: 0.1, mode: "box" } }, Kl = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } }, Yl = { duration: {} }, bi = " → ", Xl = "Give it an area that matches a room, or map it in Settings below.", Jl = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", Fe = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let j = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [], this.pathsPending = !1, this.correcting = null, this.notice = null, this.pathSeq = 0, this.onMapSelect = (e) => {
      e.stopPropagation();
<<<<<<< HEAD
      const t = e.detail.id, s = this.selected.filter((i) => i !== null), r = s.includes(t) ? s.filter((i) => i !== t) : [...s, t].slice(-2);
      this.selected = [r[0] ?? null, r[1] ?? null], this.paths = [], this.refreshPaths();
    }, this.computeLabel = (e) => yr[e.name] ?? e.name, this.computeHelper = (e) => xr[e.name] ?? "", this.onDevicesChanged = (e) => {
||||||| 8cdb3c5
      const t = e.detail.id, s = this.selected.filter((r) => r !== null), i = s.includes(t) ? s.filter((r) => r !== t) : [...s, t].slice(-2);
      this.selected = [i[0] ?? null, i[1] ?? null], this.paths = [], this.refreshPaths();
    }, this.computeLabel = (e) => ui[e.name] ?? e.name, this.computeHelper = (e) => pi[e.name] ?? "", this.onDevicesChanged = (e) => {
=======
      const t = e.detail.id, s = this.selected.filter((r) => r !== null), i = s.includes(t) ? s.filter((r) => r !== t) : [...s, t].slice(-2);
      this.selected = [i[0] ?? null, i[1] ?? null], this.paths = [], this.refreshPaths();
    }, this.computeLabel = (e) => gi[e.name] ?? e.name, this.computeHelper = (e) => mi[e.name] ?? "", this.onDevicesChanged = (e) => {
>>>>>>> origin/main
      e.stopPropagation();
      const t = this.config;
      if (!t) return;
<<<<<<< HEAD
      const s = F(t), r = { ...s, people: this.mergePeople(e.detail?.value, s.people) };
      this.dispatchEvent(D(O(t, ["presence"], r), "presence:people"));
||||||| 8cdb3c5
      const s = X(t), i = { ...s, devices: this.mergeDevices(e.detail?.value, s.devices) };
      this.dispatchEvent(R(P(t, ["presence"], i), "presence:devices"));
=======
      const s = J(t), i = { ...s, devices: this.mergeDevices(e.detail?.value, s.devices) };
      this.dispatchEvent(M(P(t, ["presence"], i), "presence:devices"));
>>>>>>> origin/main
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.refreshTopology(), this.refreshPresence(), this.timer = setInterval(() => {
      document.visibilityState !== "hidden" && this.refreshPresence();
<<<<<<< HEAD
    }, dc);
||||||| 8cdb3c5
    }, Cl);
=======
    }, zl);
>>>>>>> origin/main
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.timer !== void 0 && clearInterval(this.timer), this.timer = void 0;
  }
  willUpdate(e) {
    e.has("config") && e.get("config") !== void 0 && this.refreshTopology();
  }
  async refreshTopology() {
    const e = this.hass;
    if (e)
      try {
<<<<<<< HEAD
        this.topology = await ln(e);
||||||| 8cdb3c5
        this.topology = await Vr(e);
=======
        this.topology = await Xr(e);
>>>>>>> origin/main
      } catch {
      }
  }
  async refreshPresence() {
    const e = this.hass;
    if (e)
      try {
<<<<<<< HEAD
        this.presence = await dn(e);
||||||| 8cdb3c5
        this.presence = await Kr(e);
=======
        this.presence = await Zr(e);
>>>>>>> origin/main
      } catch {
      }
  }
  async refreshPaths() {
    const [e, t] = this.selected, s = this.hass, r = ++this.pathSeq;
    if (!s || e === null || t === null || e === t) {
      this.pathsPending = !1;
      return;
    }
    this.pathsPending = !0;
    try {
<<<<<<< HEAD
      const i = await cn(s, e, t);
      r === this.pathSeq && (this.paths = i);
||||||| 8cdb3c5
      const r = await qr(s, e, t);
      i === this.pathSeq && (this.paths = r);
=======
      const r = await Jr(s, e, t);
      i === this.pathSeq && (this.paths = r);
>>>>>>> origin/main
    } catch {
    } finally {
      r === this.pathSeq && (this.pathsPending = !1);
    }
  }
  /**
   * "No, I'm in the studio." The estimate moves at once and the moment is kept as a
   * label; the state is re-read straight after so the row shows the answer rather than
   * waiting a poll for it.
   */
  async correct(e, t) {
    const s = this.hass;
    if (s) {
      this.correcting = null;
      try {
        await hn(s, e, t), this.notice = `Moved ${e} to ${this.roomName(t)}.`;
      } catch (r) {
        this.notice = `Could not move ${e}: ${r instanceof Error ? r.message : String(r)}`;
      }
      await this.refreshPresence();
    }
  }
  /** Every room a person can be said to be in: the graph's nodes, then Away. */
  get correctionRooms() {
    const e = this.config;
    return [...this.topology?.nodes ?? (e ? [...Br(e)] : []), $r];
  }
  /** Friendly names for every group, so a room id never reaches the page. */
  get labels() {
    const e = this.config;
<<<<<<< HEAD
    return new Map(e ? yi(e).map((t) => [t.id, t.label]) : []);
||||||| 8cdb3c5
    return new Map(e ? or(e).map((t) => [t.id, t.label]) : []);
=======
    return new Map(e ? dr(e).map((t) => [t.id, t.label]) : []);
>>>>>>> origin/main
  }
  roomName(e) {
    return e == null || e === "" ? "—" : e === $r ? "Away" : this.labels.get(e) ?? e;
  }
  areaName(e) {
    return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
  }
  trail(e) {
<<<<<<< HEAD
    return e.map((t) => this.roomName(t)).join(Er);
||||||| 8cdb3c5
    return e.map((t) => this.roomName(t)).join(gi);
=======
    return e.map((t) => this.roomName(t)).join(bi);
>>>>>>> origin/main
  }
  schemaFor(e) {
    return [
      { name: "enabled", selector: { boolean: {} } },
<<<<<<< HEAD
      { name: "envelope", selector: { select: { mode: "dropdown", options: gs(e) } } },
      { name: "threshold", selector: fc },
      { name: "stay", selector: pc },
      { name: "escape", selector: mc },
      { name: "scale", selector: gc },
      { name: "floor", selector: _r },
      { name: "stuck_after", selector: Bt },
      { name: "activity_floor", selector: _r },
      { name: "carried_prior", selector: kr },
      { name: "carried_flip", selector: Bt },
      { name: "carried_recent", selector: Bt },
      { name: "carried_nearby", selector: kr },
      ...wr.map((t) => ({ name: `carried_${t}`, selector: vc }))
||||||| 8cdb3c5
      { name: "devices", selector: fi },
      { name: "envelope", selector: { select: { mode: "dropdown", options: us(e) } } },
      { name: "threshold", selector: Dl },
      { name: "stay", selector: Ll },
      { name: "escape", selector: Rl },
      { name: "scale", selector: Ml },
      { name: "floor", selector: Nl },
      { name: "stuck_after", selector: Il }
=======
      { name: "devices", selector: vi },
      { name: "envelope", selector: { select: { mode: "dropdown", options: us(e) } } },
      { name: "threshold", selector: Gl },
      { name: "stay", selector: Wl },
      { name: "escape", selector: Vl },
      { name: "scale", selector: ql },
      { name: "floor", selector: Kl },
      { name: "stuck_after", selector: Yl }
>>>>>>> origin/main
    ];
  }
  /**
   * The setup picker speaks Bermuda tracker ids; the config keeps a person around each.
   * A person whose tracker is still picked survives untouched — re-picking the same phone
   * must not quietly rename the person standing behind it — and a new tracker becomes a
   * one-device person to be named later.
   */
  mergePeople(e, t) {
    if (!Array.isArray(e)) return [...t];
    const s = e.filter((o) => typeof o == "string"), r = t.filter((o) => o.devices.some((a) => s.includes(a.tracker))), i = new Set(r.flatMap((o) => o.devices.map((a) => a.tracker))), n = s.filter((o) => !i.has(o)).map((o) => ({ ...zr(), devices: [Ur(o)] }));
    return [...r, ...n];
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config;
    if (!t) return;
<<<<<<< HEAD
    const s = F(t), r = e.detail?.value ?? {}, i = {
      charging: j(r.carried_charging) ?? s.carried.weights.charging,
      moving: j(r.carried_moving) ?? s.carried.weights.moving,
      still_room_empty: j(r.carried_still_room_empty) ?? s.carried.weights.still_room_empty,
      jitter: j(r.carried_jitter) ?? s.carried.weights.jitter
    }, n = {
||||||| 8cdb3c5
    const s = X(t), i = e.detail?.value ?? {}, r = {
=======
    const s = J(t), i = e.detail?.value ?? {}, r = {
>>>>>>> origin/main
      ...s,
<<<<<<< HEAD
      enabled: typeof r.enabled == "boolean" ? r.enabled : s.enabled,
      envelope: r.envelope === void 0 ? s.envelope : typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : null,
      threshold: j(r.threshold) ?? s.threshold,
      stay: j(r.stay) ?? s.stay,
      escape: j(r.escape) ?? s.escape,
      scale: j(r.scale) ?? s.scale,
      floor: j(r.floor) ?? s.floor,
      stuck_after: J(r.stuck_after) ?? s.stuck_after,
      activity: { floor: j(r.activity_floor) ?? s.activity.floor },
      carried: {
        prior: j(r.carried_prior) ?? s.carried.prior,
        flip: J(r.carried_flip) ?? s.carried.flip,
        recent: J(r.carried_recent) ?? s.carried.recent,
        nearby: j(r.carried_nearby) ?? s.carried.nearby,
        weights: i
      }
    }, o = (c) => {
      switch (c) {
        case "activity_floor":
          return n.activity.floor === s.activity.floor;
        case "carried_prior":
        case "carried_flip":
        case "carried_recent":
        case "carried_nearby": {
          const h = c.slice(8);
          return n.carried[h] === s.carried[h];
        }
        case "carried_charging":
        case "carried_moving":
        case "carried_still_room_empty":
        case "carried_jitter": {
          const h = c.slice(8);
          return n.carried.weights[h] === s.carried.weights[h];
        }
        default:
          return n[c] === s[c];
      }
    }, a = hc.find((c) => !o(c));
    a !== void 0 && this.dispatchEvent(D(O(t, ["presence"], n), `presence:${a}`));
||||||| 8cdb3c5
      enabled: typeof i.enabled == "boolean" ? i.enabled : s.enabled,
      devices: i.devices === void 0 ? s.devices : this.mergeDevices(i.devices, s.devices),
      envelope: i.envelope === void 0 ? s.envelope : typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : null,
      threshold: je(i.threshold) ?? s.threshold,
      stay: je(i.stay) ?? s.stay,
      escape: je(i.escape) ?? s.escape,
      scale: je(i.scale) ?? s.scale,
      floor: je(i.floor) ?? s.floor,
      stuck_after: oe(i.stuck_after) ?? s.stuck_after
    }, n = (a) => a === "devices" ? JSON.stringify(r.devices) === JSON.stringify(s.devices) : r[a] === s[a], o = Tl.find((a) => !n(a));
    o !== void 0 && this.dispatchEvent(R(P(t, ["presence"], r), `presence:${o}`));
=======
      enabled: typeof i.enabled == "boolean" ? i.enabled : s.enabled,
      devices: i.devices === void 0 ? s.devices : this.mergeDevices(i.devices, s.devices),
      envelope: i.envelope === void 0 ? s.envelope : typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : null,
      threshold: Fe(i.threshold) ?? s.threshold,
      stay: Fe(i.stay) ?? s.stay,
      escape: Fe(i.escape) ?? s.escape,
      scale: Fe(i.scale) ?? s.scale,
      floor: Fe(i.floor) ?? s.floor,
      stuck_after: oe(i.stuck_after) ?? s.stuck_after
    }, n = (a) => a === "devices" ? JSON.stringify(r.devices) === JSON.stringify(s.devices) : r[a] === s[a], o = Bl.find((a) => !n(a));
    o !== void 0 && this.dispatchEvent(M(P(t, ["presence"], r), `presence:${o}`));
>>>>>>> origin/main
  }
  /**
   * Writes one field of the presence block into the draft, exactly as `onFormChanged` does
   * for the full settings form. The setup card only ever touches `enabled`, but the helper
   * is generic so it stays the one place that builds the block.
   */
  setSetting(e, t) {
    const s = this.config;
    if (!s) return;
<<<<<<< HEAD
    const i = { ...F(s), [e]: t };
    this.dispatchEvent(D(O(s, ["presence"], i), `presence:${e}`));
||||||| 8cdb3c5
    const r = { ...X(s), [e]: t };
    this.dispatchEvent(R(P(s, ["presence"], r), `presence:${e}`));
=======
    const r = { ...J(s), [e]: t };
    this.dispatchEvent(M(P(s, ["presence"], r), `presence:${e}`));
>>>>>>> origin/main
  }
  /**
   * What the tab is before presence exists. The tab is always listed, because a feature you
   * cannot find is a feature nobody turns on — and everything here is the Settings form
   * afterwards, reduced to the two fields that start it.
   */
  renderSetup(e) {
<<<<<<< HEAD
    const t = this.presence?.bermuda === !0, s = F(e);
||||||| 8cdb3c5
    const t = this.presence?.bermuda === !0, s = X(e);
    return c`<ha-card class="setup" header="Room presence">
=======
    const t = this.presence?.bermuda === !0, s = J(e);
>>>>>>> origin/main
    return l`<ha-card class="setup" header="Room presence">
      <p>
        Activity Levels can work out which room each tracked device is in, from the Bluetooth
        distances <a href="https://github.com/agittins/bermuda">Bermuda</a> reports to every
        scanner in the house.
      </p>
      <p class="muted">
        Turning it on gives each area a <em>presence</em> channel in its mix, a
        <code>sensor.&lt;area&gt;_occupants</code>, and one <code>sensor.&lt;name&gt;_room</code>
        per person — and it uses the adjacency you have already drawn, because the estimate
        walks that graph rather than jumping across it.
      </p>
      <div class="bermuda row">
        <ha-icon icon=${t ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}></ha-icon>
        <span>
          ${t ? "Bermuda is installed." : "Bermuda was not found. Install it first, or this will have nothing to read."}
        </span>
      </div>
      <div class="enable row">
        <ha-switch .checked=${!1} @change=${() => this.setSetting("enabled", !0)}></ha-switch>
        <span>Estimate room presence</span>
      </div>
      <ha-selector
        class="setup-devices"
        .hass=${this.hass}
<<<<<<< HEAD
        .selector=${uc}
        .label=${yr.devices}
        .helper=${xr.devices}
||||||| 8cdb3c5
        .selector=${fi}
        .label=${ui.devices}
        .helper=${pi.devices}
=======
        .selector=${vi}
        .label=${gi.devices}
        .helper=${mi.devices}
>>>>>>> origin/main
        .required=${!1}
        .value=${s.people.flatMap((r) => r.devices.map((i) => i.tracker))}
        @value-changed=${this.onDevicesChanged}
      ></ha-selector>
      <p class="muted">
        Bermuda ships its per-scanner distance sensors disabled. Enable them under
        <em>Settings → Devices &amp; services → Bermuda</em> before expecting a room out of
        this, and give each scanner device the area of the room it sits in.
      </p>
    </ha-card>`;
  }
  renderMap(e) {
    return l`<ha-card header="Rooms">
      <al-graph-map
        .hass=${this.hass}
        .config=${e}
        .topology=${this.topology}
        .presence=${this.presence}
        .selected=${this.selected}
        .paths=${this.paths}
        @al-map-select=${this.onMapSelect}
      ></al-graph-map>
      ${this.renderPaths()}
    </ha-card>`;
  }
  renderPaths() {
    const [e, t] = this.selected;
    if (e === null || t === null)
      return l`<div class="paths empty">Pick two rooms on the map to see the routes between them.</div>`;
<<<<<<< HEAD
    const s = `${this.roomName(e)}${Er}${this.roomName(t)}`;
||||||| 8cdb3c5
      return c`<div class="paths empty">Pick two rooms on the map to see the routes between them.</div>`;
    const s = `${this.roomName(e)}${gi}${this.roomName(t)}`;
    return this.pathsPending ? c`<div class="paths muted">Finding routes from ${s}…</div>` : this.paths.length === 0 ? c`<div class="paths">
=======
    const s = `${this.roomName(e)}${bi}${this.roomName(t)}`;
>>>>>>> origin/main
    return this.pathsPending ? l`<div class="paths muted">Finding routes from ${s}…</div>` : this.paths.length === 0 ? l`<div class="paths">
        <div class="muted">no route from ${s}</div>
      </div>` : l`<div class="paths">
      <div class="muted">
        ${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${s}
      </div>
      <ol>
<<<<<<< HEAD
        ${this.paths.map((r) => l`<li class="path">${this.trail(r)}</li>`)}
||||||| 8cdb3c5
        ${this.paths.map((i) => c`<li class="path">${this.trail(i)}</li>`)}
=======
        ${this.paths.map((i) => l`<li class="path">${this.trail(i)}</li>`)}
>>>>>>> origin/main
      </ol>
    </div>`;
  }
  renderPeople() {
<<<<<<< HEAD
    const e = Object.entries(this.presence?.people ?? {}).filter(([, t]) => typeof t.room == "string").sort(([t], [s]) => t.localeCompare(s));
    return e.length === 0 ? l`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >` : l`<ha-card header="People">
      <div class="muted hint">Tap a person to say where they really are; the estimate learns from it.</div>
||||||| 8cdb3c5
    const e = Object.entries(this.presence?.devices ?? {}).sort(([t], [s]) => t.localeCompare(s));
    return e.length === 0 ? c`<ha-card header="People"
        ><div class="empty">No tracked device has reported a room yet.</div></ha-card
      >` : c`<ha-card header="People">
=======
    const e = Object.entries(this.presence?.devices ?? {}).sort(([t], [s]) => t.localeCompare(s));
    return e.length === 0 ? l`<ha-card header="People"
        ><div class="empty">No tracked device has reported a room yet.</div></ha-card
      >` : l`<ha-card header="People">
>>>>>>> origin/main
      <table>
        <thead>
          <tr>
            <th>Person</th>
            <th>Room</th>
            <th>Confidence</th>
            <th>Devices</th>
            <th>Came from</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          ${e.flatMap(([t, s]) => [
      this.renderPerson(t, s),
      this.correcting === t ? this.renderCorrection(t, s) : u
    ])}
        </tbody>
      </table>
      ${this.notice === null ? u : l`<div class="notice">${this.notice}</div>`}
    </ha-card>`;
  }
<<<<<<< HEAD
  /**
   * "Where is Scott?" -- the rooms the estimate was weighing first, because one of them
   * is usually right, then every room for when none of them is.
   */
  renderCorrection(e, t) {
    const s = Object.entries(t.candidates).sort(([, r], [, i]) => i - r).map(([r]) => r);
    return l`<tr class="correct">
      <td colspan="6">
        <span class="question">Where is ${e}?</span>
        ${s.map(
      (r) => l`<ha-button class="candidate" @click=${() => {
        this.correct(e, r);
      }}
              >${this.roomName(r)}</ha-button
            >`
    )}
        <select
          class="every-room"
          @change=${(r) => {
      const i = r.target.value;
      i !== "" && this.correct(e, i);
    }}
        >
          <option value="">Somewhere else…</option>
          ${this.correctionRooms.map((r) => l`<option value=${r}>${this.roomName(r)}</option>`)}
        </select>
        <ha-button class="cancel" @click=${() => this.correcting = null}>That's right</ha-button>
      </td>
    </tr>`;
  }
  renderPerson(e, t) {
    const s = Math.round(t.confidence * 100), r = Object.entries(t.devices ?? {}).sort(([i], [n]) => i.localeCompare(n));
    return l`<tr class="device person">
      <td class="who">
        <button
          class="link"
          title="Say where ${e} really is"
          @click=${() => this.correcting = this.correcting === e ? null : e}
        >
          ${e}
        </button>
      </td>
||||||| 8cdb3c5
  renderDevice(e, t) {
    const s = Math.round(t.confidence * 100);
    return c`<tr class="device">
      <td class="who">${e}</td>
=======
  renderDevice(e, t) {
    const s = Math.round(t.confidence * 100);
    return l`<tr class="device">
      <td class="who">${e}</td>
>>>>>>> origin/main
      <td class="room">
        ${this.roomName(t.room)}
        ${t.moving ? l`<span class="chip moving">moving</span>` : u}
      </td>
      <td>
        <div class="meter" title=${`${s}%`}>
          <div class="confidence" style=${`width: ${s}%`}></div>
        </div>
      </td>
      <td class="devices">${r.map(([i, n]) => this.renderDeviceChip(i, n))}</td>
      <td class="breadcrumb">${t.path.length === 0 ? "—" : this.trail(t.path)}</td>
      <td class="when">${new Date(t.t * 1e3).toLocaleTimeString()}</td>
    </tr>`;
  }
  /**
   * One device: what it is, how likely it is on the person, and — when it probably is
   * not — where it was left. A parked phone's room is the answer to "where did I put it".
   */
  renderDeviceChip(e, t) {
    const s = t.carried, r = s !== null && s < 0.5, i = s === null ? "—" : `${Math.round(s * 100)}%`, n = `${t.name} (${wi[t.kind]}): carried ${i}${r && t.room ? `, in ${this.roomName(t.room)}` : ""}`;
    return l`<span class="chip device-chip ${r ? "parked" : "carried"}" data-device=${e} title=${n}>
      <ha-icon icon=${es[t.kind] ?? es.other}></ha-icon>
      <span class="carried-pct">${i}</span>
      ${r && t.room ? l`<span class="parked-room">${this.roomName(t.room)}</span>` : u}
    </span>`;
  }
  renderScanners() {
    const e = this.presence?.scanners ?? [], t = new Set(this.presence?.unmapped ?? []);
    return l`<ha-card header="Scanners">
      ${e.length === 0 ? l`<div class="empty">No Bermuda scanners have been discovered.</div>` : l`<table>
            <thead>
              <tr>
                <th>Scanner</th>
                <th>Area</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              ${e.map((s) => this.renderScanner(s, t.has(s.key)))}
            </tbody>
          </table>`}
      ${this.renderDisabled()}
    </ha-card>`;
  }
  renderScanner(e, t) {
    return l`<tr class="scanner ${t ? "unmapped" : ""}">
      <td class="name">${e.name}</td>
      <td class="area">${this.areaName(e.area_id)}</td>
<<<<<<< HEAD
      <td class="room">${t ? bc : this.roomName(e.group_id)}</td>
||||||| 8cdb3c5
      <td class="room">${t ? jl : this.roomName(e.group_id)}</td>
=======
      <td class="room">${t ? Xl : this.roomName(e.group_id)}</td>
>>>>>>> origin/main
    </tr>`;
  }
  renderDisabled() {
    const e = this.presence?.disabled ?? [];
    return e.length === 0 ? u : l`<div class="disabled-sensors">
<<<<<<< HEAD
      ${$c}
||||||| 8cdb3c5
    return e.length === 0 ? u : c`<div class="disabled-sensors">
      ${Fl}
=======
      ${Jl}
>>>>>>> origin/main
      <ul>
        ${e.map((t) => l`<li>${t}</li>`)}
      </ul>
    </div>`;
  }
  renderSettings(e) {
<<<<<<< HEAD
    const t = F(e), s = Z(this.errors, ["presence"]), r = this.errors.filter((n) => n.path === "presence"), i = {
||||||| 8cdb3c5
    const t = X(e), s = xe(this.errors, ["presence"]), i = this.errors.filter((n) => n.path === "presence"), r = {
=======
    const t = J(e), s = we(this.errors, ["presence"]), i = this.errors.filter((n) => n.path === "presence"), r = {
>>>>>>> origin/main
      enabled: t.enabled,
      envelope: t.envelope ?? "",
      threshold: t.threshold,
      stay: t.stay,
      escape: t.escape,
      scale: t.scale,
      floor: t.floor,
      stuck_after: X(t.stuck_after),
      activity_floor: t.activity.floor,
      carried_prior: t.carried.prior,
      carried_flip: X(t.carried.flip),
      carried_recent: X(t.carried.recent),
      carried_nearby: t.carried.nearby,
      ...Object.fromEntries(wr.map((n) => [`carried_${n}`, t.carried.weights[n]]))
    };
    return l`<ha-card header="Settings">
<<<<<<< HEAD
      ${r.map((n) => l`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
      <h3>People</h3>
      <al-people-editor
        .hass=${this.hass}
        .config=${e}
        .errors=${this.errors}
        .presence=${this.presence}
      ></al-people-editor>
||||||| 8cdb3c5
    return c`<ha-card header="Settings">
      ${i.map((n) => c`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
=======
      ${i.map((n) => l`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
>>>>>>> origin/main
      <ha-form
        class="presence-settings"
        .hass=${this.hass}
        .data=${i}
        .schema=${this.schemaFor(e)}
        .error=${s}
        .computeLabel=${this.computeLabel}
        .computeHelper=${this.computeHelper}
        @value-changed=${this.onFormChanged}
      ></ha-form>
    </ha-card>`;
  }
  render() {
    const e = this.config;
<<<<<<< HEAD
    return e ? F(e).enabled ? l`<div class="page">
||||||| 8cdb3c5
    return e ? X(e).enabled ? c`<div class="page">
=======
    return e ? J(e).enabled ? l`<div class="page">
>>>>>>> origin/main
      ${this.renderMap(e)} ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : l`<div class="page">${this.renderSetup(e)}</div>` : l`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
  }
};
R.styles = [
  C,
  S`
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      th,
      td {
        padding: 4px 8px 4px 0;
        border-bottom: 1px solid var(--divider-color);
        vertical-align: top;
      }
      td.when,
      td.room {
        font-variant-numeric: tabular-nums;
      }
      .meter {
        width: 100%;
        min-width: 60px;
      }
      .chip {
        border-radius: 10px;
        padding: 1px 8px;
        font-size: 0.8em;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .device-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin: 0 4px 2px 0;
        --mdc-icon-size: 16px;
      }
      .who button.link {
        font: inherit;
        color: var(--primary-color);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-decoration: underline dotted;
      }
      tr.correct td {
        background: var(--secondary-background-color);
      }
      tr.correct .question {
        font-weight: 600;
        margin-right: 8px;
      }
      tr.correct select {
        font: inherit;
        color: inherit;
        background: var(--card-background-color, transparent);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 4px;
        margin: 0 8px;
      }
      .notice,
      .hint {
        margin-top: 8px;
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }
      .device-chip.parked {
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color);
      }
      h3 {
        margin: 12px 0 8px;
        font-size: 1em;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .breadcrumb {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      tr.scanner.unmapped td.room {
        color: var(--warning-color, #ffa600);
      }
      .disabled-sensors {
        margin-top: 12px;
        color: var(--warning-color, #ffa600);
        font-size: 0.9em;
      }
      .disabled-sensors ul {
        margin: 4px 0 0;
        padding-left: 20px;
      }
      .paths {
        margin-top: 12px;
      }
      .paths ol {
        margin: 4px 0 0;
        padding-left: 20px;
      }
      .empty {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .setup p {
        margin: 0 0 12px;
      }
      .setup .row {
        margin-bottom: 12px;
      }
      .setup ha-selector {
        display: block;
        margin-bottom: 12px;
      }
    `
];
<<<<<<< HEAD
z([
||||||| 8cdb3c5
K([
=======
Y([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], R.prototype, "hass", 2);
z([
||||||| 8cdb3c5
], j.prototype, "hass", 2);
K([
=======
], j.prototype, "hass", 2);
Y([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], R.prototype, "config", 2);
z([
||||||| 8cdb3c5
], j.prototype, "config", 2);
K([
=======
], j.prototype, "config", 2);
Y([
>>>>>>> origin/main
  d({ attribute: !1 })
<<<<<<< HEAD
], R.prototype, "errors", 2);
z([
||||||| 8cdb3c5
], j.prototype, "errors", 2);
K([
=======
], j.prototype, "errors", 2);
Y([
>>>>>>> origin/main
  d({ type: Boolean })
<<<<<<< HEAD
], R.prototype, "narrow", 2);
z([
  m()
], R.prototype, "topology", 2);
z([
  m()
], R.prototype, "presence", 2);
z([
  m()
], R.prototype, "selected", 2);
z([
  m()
], R.prototype, "paths", 2);
z([
  m()
], R.prototype, "pathsPending", 2);
z([
  m()
], R.prototype, "correcting", 2);
z([
  m()
], R.prototype, "notice", 2);
R = z([
  _("al-presence")
], R);
const yc = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, _i = (e) => e.dash >= 0 ? e.dash : e.indent;
function xc(e) {
  const t = yc.exec(e);
||||||| 8cdb3c5
], j.prototype, "narrow", 2);
K([
  g()
], j.prototype, "topology", 2);
K([
  g()
], j.prototype, "presence", 2);
K([
  g()
], j.prototype, "selected", 2);
K([
  g()
], j.prototype, "paths", 2);
K([
  g()
], j.prototype, "pathsPending", 2);
j = K([
  k("al-presence")
], j);
const Hl = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, lr = (e) => e.dash >= 0 ? e.dash : e.indent;
function Ul(e) {
  const t = Hl.exec(e);
=======
], j.prototype, "narrow", 2);
Y([
  g()
], j.prototype, "topology", 2);
Y([
  g()
], j.prototype, "presence", 2);
Y([
  g()
], j.prototype, "selected", 2);
Y([
  g()
], j.prototype, "paths", 2);
Y([
  g()
], j.prototype, "pathsPending", 2);
j = Y([
  S("al-presence")
], j);
const Zl = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, ur = (e) => e.dash >= 0 ? e.dash : e.indent;
function Ql(e) {
  const t = Zl.exec(e);
>>>>>>> origin/main
  return t ? t[1] ?? t[2] ?? t[3] ?? null : null;
}
<<<<<<< HEAD
function wc(e) {
||||||| 8cdb3c5
function zl(e) {
=======
function ec(e) {
>>>>>>> origin/main
  const t = [];
  return e.split(`
`).forEach((s, r) => {
    const i = s.replace(/\s+$/, ""), n = i.trimStart();
    if (n === "" || n.startsWith("#")) return;
    const o = i.length - n.length, a = /^-(?:\s+|$)/.exec(n);
    a ? t.push({ indent: o + a[0].length, dash: o, text: n.slice(a[0].length), line: r + 1 }) : t.push({ indent: o, dash: -1, text: n, line: r + 1 });
  }), t;
}
<<<<<<< HEAD
function _c(e, t, s, r) {
  for (let i = t + 1; i < s; i++) if (_i(e[i]) <= r) return i;
||||||| 8cdb3c5
function Bl(e, t, s, i) {
  for (let r = t + 1; r < s; r++) if (lr(e[r]) <= i) return r;
=======
function tc(e, t, s, i) {
  for (let r = t + 1; r < s; r++) if (ur(e[r]) <= i) return r;
>>>>>>> origin/main
  return s;
}
<<<<<<< HEAD
function kc(e, t, s, r) {
||||||| 8cdb3c5
function Gl(e, t, s, i) {
=======
function sc(e, t, s, i) {
>>>>>>> origin/main
  if (t >= s) return -1;
  const i = e[t].indent;
  for (let n = t; n < s; n++) {
    const o = e[n];
<<<<<<< HEAD
    if (o.indent === i && xc(o.text) === r) return n;
||||||| 8cdb3c5
    if (o.indent === r && Ul(o.text) === i) return n;
=======
    if (o.indent === r && Ql(o.text) === i) return n;
>>>>>>> origin/main
  }
  return -1;
}
<<<<<<< HEAD
function Ec(e, t, s, r) {
||||||| 8cdb3c5
function Wl(e, t, s, i) {
=======
function ic(e, t, s, i) {
>>>>>>> origin/main
  if (t >= s || e[t].dash < 0) return -1;
  const i = e[t].dash;
  let n = -1;
  for (let o = t; o < s; o++)
    if (e[o].dash === i && ++n === r)
      return o;
  return -1;
}
<<<<<<< HEAD
function Sc(e, t) {
||||||| 8cdb3c5
function Vl(e, t) {
=======
function rc(e, t) {
>>>>>>> origin/main
  const s = t.split("/").filter((a) => a !== "");
  if (s.length === 0) return null;
<<<<<<< HEAD
  const r = wc(e);
  let i = 0, n = r.length, o = null;
||||||| 8cdb3c5
  const i = zl(e);
  let r = 0, n = i.length, o = null;
=======
  const i = ec(e);
  let r = 0, n = i.length, o = null;
>>>>>>> origin/main
  for (const a of s) {
<<<<<<< HEAD
    const c = /^\d+$/.test(a) ? Ec(r, i, n, Number(a)) : kc(r, i, n, a);
    if (c < 0) return o;
    const h = r[c];
    o = h.line, n = _c(r, c, n, _i(h)), i = h.dash >= 0 ? c : c + 1;
||||||| 8cdb3c5
    const l = /^\d+$/.test(a) ? Wl(i, r, n, Number(a)) : Gl(i, r, n, a);
    if (l < 0) return o;
    const h = i[l];
    o = h.line, n = Bl(i, l, n, lr(h)), r = h.dash >= 0 ? l : l + 1;
=======
    const c = /^\d+$/.test(a) ? ic(i, r, n, Number(a)) : sc(i, r, n, a);
    if (c < 0) return o;
    const h = i[c];
    o = h.line, n = tc(i, c, n, ur(h)), r = h.dash >= 0 ? c : c + 1;
>>>>>>> origin/main
  }
  return o;
}
<<<<<<< HEAD
var Ac = Object.defineProperty, Oc = Object.getOwnPropertyDescriptor, Me = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Oc(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Ac(t, s, i), i;
||||||| 8cdb3c5
var ql = Object.defineProperty, Kl = Object.getOwnPropertyDescriptor, De = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Kl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ql(t, s, r), r;
=======
var nc = Object.defineProperty, oc = Object.getOwnPropertyDescriptor, Me = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? oc(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && nc(t, s, r), r;
>>>>>>> origin/main
};
<<<<<<< HEAD
const Pc = 400;
let he = class extends b {
||||||| 8cdb3c5
const Yl = 400;
let le = class extends b {
=======
const ac = 400;
let ce = class extends b {
>>>>>>> origin/main
  constructor() {
    super(...arguments), this.errors = [], this.available = !0, this.parseError = null, this.seq = 0, this.onYaml = (e) => {
      e.stopPropagation(), window.clearTimeout(this.timer);
      const t = e.detail;
      this.timer = window.setTimeout(() => {
        this.settle(t);
<<<<<<< HEAD
      }, Pc);
||||||| 8cdb3c5
      }, Yl);
=======
      }, ac);
>>>>>>> origin/main
    };
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.clearTimeout(this.timer);
  }
  firstUpdated() {
    this.seed(), this.validate(this.config);
  }
  updated(e) {
    e.has("config") && this.config !== this.mine && this.seed();
  }
  get editor() {
    return this.renderRoot.querySelector("ha-yaml-editor");
  }
  /** Writes the draft into the editor as YAML. Home Assistant's dumper does the formatting. */
  seed() {
    this.mine = this.config, this.editor?.setValue?.(this.config ?? {});
  }
  /**
   * One edit, once typing has stopped. Unparseable text produces no document at all, so
   * the draft is left where it was and only the verdict changes — which is what keeps a
   * half-typed key from wiping the configuration the other tabs are showing.
   */
  async settle(e) {
    if (!e.isValid) {
<<<<<<< HEAD
      this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(qs(!1, []));
||||||| 8cdb3c5
      this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(zs(!1, []));
=======
      this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(Bs(!1, []));
>>>>>>> origin/main
      return;
    }
    this.parseError = null;
    const t = e.value;
<<<<<<< HEAD
    this.mine = t, this.dispatchEvent(D(t, "code")), await this.validate(t);
||||||| 8cdb3c5
    this.mine = t, this.dispatchEvent(R(t, "code")), await this.validate(t);
=======
    this.mine = t, this.dispatchEvent(M(t, "code")), await this.validate(t);
>>>>>>> origin/main
  }
  async validate(e) {
    const t = this.hass;
    if (!t || !e) return;
    const s = ++this.seq;
    try {
<<<<<<< HEAD
      const { errors: r } = await Dr(t, e);
      s === this.seq && this.dispatchEvent(qs(!0, r));
||||||| 8cdb3c5
      const { errors: i } = await _i(t, e);
      s === this.seq && this.dispatchEvent(zs(!0, i));
=======
      const { errors: i } = await Ei(t, e);
      s === this.seq && this.dispatchEvent(Bs(!0, i));
>>>>>>> origin/main
    } catch {
    }
  }
  /** Puts the cursor on the line `path` names, when the text is one this can walk. */
  jump(e) {
<<<<<<< HEAD
    const t = this.editor, s = t?.codemirror, r = t?.yaml;
    if (!s || typeof r != "string") return;
    const i = Sc(r, e);
    if (i === null || i > s.state.doc.lines) return;
    const n = s.state.doc.line(i).from;
||||||| 8cdb3c5
    const t = this.editor, s = t?.codemirror, i = t?.yaml;
    if (!s || typeof i != "string") return;
    const r = Vl(i, e);
    if (r === null || r > s.state.doc.lines) return;
    const n = s.state.doc.line(r).from;
=======
    const t = this.editor, s = t?.codemirror, i = t?.yaml;
    if (!s || typeof i != "string") return;
    const r = rc(i, e);
    if (r === null || r > s.state.doc.lines) return;
    const n = s.state.doc.line(r).from;
>>>>>>> origin/main
    s.dispatch({ selection: { anchor: n, head: n }, scrollIntoView: !0 }), s.focus();
  }
  renderProblems() {
    return this.parseError !== null ? l`<ha-alert class="parse-error" alert-type="error">${this.parseError}</ha-alert>` : this.errors.length === 0 ? l`<p class="muted no-problems">No problems. Save applies this document.</p>` : l`
      <p class="count muted">
        ${this.errors.length} ${this.errors.length === 1 ? "problem" : "problems"} — Save is
        disabled until they are fixed.
      </p>
      <ul class="errors">
        ${this.errors.map(
      (e) => l`<li>
            <button type="button" class="jump" @click=${() => this.jump(e.path)}>
              <span class="path">${e.path === "" ? "(document)" : e.path}</span> —
              <span class="message">${e.message}</span>
            </button>
          </li>`
    )}
      </ul>
    `;
  }
  renderUnavailable() {
    return l`<ha-card header="Code">
      <ha-alert class="editor-missing" alert-type="warning">
        Home Assistant's YAML editor did not load, so this tab cannot open. Visit
        <em>Settings → Devices &amp; services</em> once and reload the page; the other tabs edit the
        same configuration in the meantime.
      </ha-alert>
    </ha-card>`;
  }
  render() {
    return this.available ? l`
      <div class="page">
        <ha-card header="Configuration">
          <ha-yaml-editor @value-changed=${this.onYaml}></ha-yaml-editor>
          ${this.config === void 0 ? u : this.renderProblems()}
        </ha-card>
      </div>
    ` : l`<div class="page">${this.renderUnavailable()}</div>`;
  }
};
<<<<<<< HEAD
he.styles = [
  C,
  S`
||||||| 8cdb3c5
le.styles = [
  T,
  A`
=======
ce.styles = [
  T,
  A`
>>>>>>> origin/main
      ha-yaml-editor {
        display: block;
        margin-bottom: 12px;
      }
      ul.errors {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      ul.errors li {
        border-top: 1px solid var(--divider-color);
      }
      button.jump {
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        font: inherit;
        color: inherit;
        padding: 8px 4px;
        cursor: pointer;
        border-radius: 4px;
      }
      button.jump:hover,
      button.jump:focus-visible {
        background: var(--secondary-background-color);
      }
      button.jump .path {
        font-family: var(--ha-font-family-code, monospace);
        color: var(--error-color, #db4437);
      }
      .count {
        margin: 0 0 4px;
      }
    `
];
Me([
  d({ attribute: !1 })
<<<<<<< HEAD
], he.prototype, "hass", 2);
||||||| 8cdb3c5
], le.prototype, "hass", 2);
De([
=======
], ce.prototype, "hass", 2);
>>>>>>> origin/main
Me([
  d({ attribute: !1 })
<<<<<<< HEAD
], he.prototype, "config", 2);
||||||| 8cdb3c5
], le.prototype, "config", 2);
De([
=======
], ce.prototype, "config", 2);
>>>>>>> origin/main
Me([
  d({ attribute: !1 })
<<<<<<< HEAD
], he.prototype, "errors", 2);
||||||| 8cdb3c5
], le.prototype, "errors", 2);
De([
=======
], ce.prototype, "errors", 2);
>>>>>>> origin/main
Me([
  d({ type: Boolean })
<<<<<<< HEAD
], he.prototype, "available", 2);
Me([
  m()
], he.prototype, "parseError", 2);
he = Me([
  _("al-code")
], he);
||||||| 8cdb3c5
], le.prototype, "available", 2);
De([
  g()
], le.prototype, "parseError", 2);
le = De([
  k("al-code")
], le);
=======
], ce.prototype, "available", 2);
Me([
  g()
], ce.prototype, "parseError", 2);
ce = Me([
  S("al-code")
], ce);
>>>>>>> origin/main
