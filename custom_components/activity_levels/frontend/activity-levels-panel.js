const X = globalThis, de = X.ShadowRoot && (X.ShadyCSS === void 0 || X.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ue = /* @__PURE__ */ Symbol(), ye = /* @__PURE__ */ new WeakMap();
let Ue = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== ue) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (de && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = ye.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ye.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ke = (t) => new Ue(typeof t == "string" ? t : t + "", void 0, ue), W = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + t[r + 1], t[0]);
  return new Ue(s, t, ue);
}, Je = (t, e) => {
  if (de) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), n = X.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, t.appendChild(i);
  }
}, _e = de ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return Ke(s);
})(t) : t;
const { is: Ze, defineProperty: Xe, getOwnPropertyDescriptor: Ye, getOwnPropertyNames: Qe, getOwnPropertySymbols: et, getPrototypeOf: tt } = Object, ie = globalThis, Ae = ie.trustedTypes, st = Ae ? Ae.emptyScript : "", it = ie.reactiveElementPolyfillSupport, F = (t, e) => t, Q = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? st : null;
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
} }, pe = (t, e) => !Ze(t, e), we = { attribute: !0, type: String, converter: Q, reflect: !1, useDefault: !1, hasChanged: pe };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), ie.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let R = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = we) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(e, i, s);
      n !== void 0 && Xe(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: n, set: r } = Ye(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: n, set(o) {
      const a = n?.call(this);
      r?.call(this, o), this.requestUpdate(e, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? we;
  }
  static _$Ei() {
    if (this.hasOwnProperty(F("elementProperties"))) return;
    const e = tt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(F("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(F("properties"))) {
      const s = this.properties, i = [...Qe(s), ...et(s)];
      for (const n of i) this.createProperty(n, s[n]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [i, n] of s) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const n = this._$Eu(s, i);
      n !== void 0 && this._$Eh.set(n, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const n of i) s.unshift(_e(n));
    } else e !== void 0 && s.push(_e(e));
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
    return Je(e, this.constructor.elementStyles), e;
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
    const i = this.constructor.elementProperties.get(e), n = this.constructor._$Eu(e, i);
    if (n !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : Q).toAttribute(s, i.type);
      this._$Em = e, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, n = i._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Q;
      this._$Em = n;
      const a = o.fromAttribute(s, r.type);
      this[n] = a ?? this._$Ej?.get(n) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, n = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? pe)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: n, wrapped: r }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? s ?? this[e]), r !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), n === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [n, r] of this._$Ep) this[n] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, r] of i) {
        const { wrapped: o } = r, a = this[n];
        o !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, r, a);
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
R.elementStyles = [], R.shadowRootOptions = { mode: "open" }, R[F("elementProperties")] = /* @__PURE__ */ new Map(), R[F("finalized")] = /* @__PURE__ */ new Map(), it?.({ ReactiveElement: R }), (ie.reactiveElementVersions ??= []).push("2.1.2");
const fe = globalThis, xe = (t) => t, ee = fe.trustedTypes, Se = ee ? ee.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, He = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, Ie = "?" + S, nt = `<${Ie}>`, P = document, B = () => P.createComment(""), G = (t) => t === null || typeof t != "object" && typeof t != "function", me = Array.isArray, rt = (t) => me(t) || typeof t?.[Symbol.iterator] == "function", le = `[ 	
\f\r]`, j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ee = /-->/g, Ce = />/g, C = RegExp(`>|${le}(?:([^\\s"'>=/]+)(${le}*=${le}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Oe = /'/g, Pe = /"/g, je = /^(?:script|style|textarea|title)$/i, ot = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), h = ot(1), D = /* @__PURE__ */ Symbol.for("lit-noChange"), p = /* @__PURE__ */ Symbol.for("lit-nothing"), ke = /* @__PURE__ */ new WeakMap(), O = P.createTreeWalker(P, 129);
function ze(t, e) {
  if (!me(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Se !== void 0 ? Se.createHTML(e) : e;
}
const at = (t, e) => {
  const s = t.length - 1, i = [];
  let n, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = j;
  for (let a = 0; a < s; a++) {
    const l = t[a];
    let c, f, u = -1, _ = 0;
    for (; _ < l.length && (o.lastIndex = _, f = o.exec(l), f !== null); ) _ = o.lastIndex, o === j ? f[1] === "!--" ? o = Ee : f[1] !== void 0 ? o = Ce : f[2] !== void 0 ? (je.test(f[2]) && (n = RegExp("</" + f[2], "g")), o = C) : f[3] !== void 0 && (o = C) : o === C ? f[0] === ">" ? (o = n ?? j, u = -1) : f[1] === void 0 ? u = -2 : (u = o.lastIndex - f[2].length, c = f[1], o = f[3] === void 0 ? C : f[3] === '"' ? Pe : Oe) : o === Pe || o === Oe ? o = C : o === Ee || o === Ce ? o = j : (o = C, n = void 0);
    const x = o === C && t[a + 1].startsWith("/>") ? " " : "";
    r += o === j ? l + nt : u >= 0 ? (i.push(c), l.slice(0, u) + He + l.slice(u) + S + x) : l + S + (u === -2 ? a : x);
  }
  return [ze(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class V {
  constructor({ strings: e, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const a = e.length - 1, l = this.parts, [c, f] = at(e, s);
    if (this.el = V.createElement(c, i), O.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (n = O.nextNode()) !== null && l.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const u of n.getAttributeNames()) if (u.endsWith(He)) {
          const _ = f[o++], x = n.getAttribute(u).split(S), J = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: r, name: J[2], strings: x, ctor: J[1] === "." ? ct : J[1] === "?" ? ht : J[1] === "@" ? dt : ne }), n.removeAttribute(u);
        } else u.startsWith(S) && (l.push({ type: 6, index: r }), n.removeAttribute(u));
        if (je.test(n.tagName)) {
          const u = n.textContent.split(S), _ = u.length - 1;
          if (_ > 0) {
            n.textContent = ee ? ee.emptyScript : "";
            for (let x = 0; x < _; x++) n.append(u[x], B()), O.nextNode(), l.push({ type: 2, index: ++r });
            n.append(u[_], B());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Ie) l.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = n.data.indexOf(S, u + 1)) !== -1; ) l.push({ type: 7, index: r }), u += S.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const i = P.createElement("template");
    return i.innerHTML = e, i;
  }
}
function N(t, e, s = t, i) {
  if (e === D) return e;
  let n = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = G(e) ? void 0 : e._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(t), n._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = n : s._$Cl = n), n !== void 0 && (e = N(t, n._$AS(t, e.values), n, i)), e;
}
class lt {
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
    const { el: { content: s }, parts: i } = this._$AD, n = (e?.creationScope ?? P).importNode(s, !0);
    O.currentNode = n;
    let r = O.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new q(r, r.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (c = new ut(r, this, e)), this._$AV.push(c), l = i[++a];
      }
      o !== l?.index && (r = O.nextNode(), o++);
    }
    return O.currentNode = P, n;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class q {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, n) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = n, this._$Cv = n?.isConnected ?? !0;
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
    e = N(this, e, s), G(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== D && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : rt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && G(this._$AH) ? this._$AA.nextSibling.data = e : this.T(P.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, n = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = V.createElement(ze(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(s);
    else {
      const r = new lt(n, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = ke.get(e.strings);
    return s === void 0 && ke.set(e.strings, s = new V(e)), s;
  }
  k(e) {
    me(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const r of e) n === s.length ? s.push(i = new q(this.O(B()), this.O(B()), this, this.options)) : i = s[n], i._$AI(r), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = xe(e).nextSibling;
      xe(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ne {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, n, r) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = s, this._$AM = n, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(e, s = this, i, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = N(this, e, s, 0), o = !G(e) || e !== this._$AH && e !== D, o && (this._$AH = e);
    else {
      const a = e;
      let l, c;
      for (e = r[0], l = 0; l < r.length - 1; l++) c = N(this, a[i + l], s, l), c === D && (c = this._$AH[l]), o ||= !G(c) || c !== this._$AH[l], c === p ? e = p : e !== p && (e += (c ?? "") + r[l + 1]), this._$AH[l] = c;
    }
    o && !n && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class ct extends ne {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class ht extends ne {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class dt extends ne {
  constructor(e, s, i, n, r) {
    super(e, s, i, n, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = N(this, e, s, 0) ?? p) === D) return;
    const i = this._$AH, n = e === p && i !== p || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== p && (i === p || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ut {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    N(this, e);
  }
}
const pt = fe.litHtmlPolyfillSupport;
pt?.(V, q), (fe.litHtmlVersions ??= []).push("3.3.3");
const ft = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = n = new q(e.insertBefore(B(), r), r, void 0, s ?? {});
  }
  return n._$AI(t), n;
};
const ge = globalThis;
class v extends R {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ft(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return D;
  }
}
v._$litElement$ = !0, v.finalized = !0, ge.litElementHydrateSupport?.({ LitElement: v });
const mt = ge.litElementPolyfillSupport;
mt?.({ LitElement: v });
(ge.litElementVersions ??= []).push("4.2.2");
const T = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
const gt = { attribute: !0, type: String, converter: Q, reflect: !1, hasChanged: pe }, vt = (t = gt, e, s) => {
  const { kind: i, metadata: n } = s;
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(s.name, t), i === "accessor") {
    const { name: o } = s;
    return { set(a) {
      const l = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(o, l, t, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, t, a), a;
    } };
  }
  if (i === "setter") {
    const { name: o } = s;
    return function(a) {
      const l = this[o];
      e.call(this, a), this.requestUpdate(o, l, t, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function d(t) {
  return (e, s) => typeof s == "object" ? vt(t, e, s) : ((i, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(t, e, s);
}
function y(t) {
  return d({ ...t, state: !0, attribute: !1 });
}
const Fe = (t) => ({ ok: t.ok, errors: t.errors ?? [] }), $t = (t) => t.callWS({ type: "activity_levels/config/get" }).then((e) => e.config), bt = (t, e) => t.callWS({ type: "activity_levels/config/validate", config: e }).then(Fe);
async function yt(t, e) {
  try {
    return Fe(await t.callWS({ type: "activity_levels/config/save", config: e }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const _t = (t) => t.callWS({ type: "activity_levels/state" }), ce = [
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
], Te = (t) => new Promise((e) => setTimeout(e, t));
async function At() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function wt(t = 8e3) {
  if (ce.every((i) => customElements.get(i))) return { ok: !0, missing: [] };
  await Promise.race([At(), Te(t)]);
  const e = await Promise.all(
    ce.map(
      (i) => Promise.race([customElements.whenDefined(i).then(() => !0), Te(t).then(() => !1)])
    )
  ), s = ce.filter((i, n) => !e[n]);
  return { ok: s.length === 0, missing: [...s] };
}
async function xt(t, e) {
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
function ve(t, e) {
  let s = t;
  for (const i of e) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function Le(t) {
  return Array.isArray(t) ? [...t] : { ...t };
}
function re(t, e, s) {
  if (e.length === 0) throw new Error("empty path");
  const i = Le(t);
  let n = i;
  for (let r = 0; r < e.length - 1; r++) {
    const o = e[r], a = Le(n[o]);
    n[o] = a, n = a;
  }
  return s(n, e[e.length - 1]), i;
}
function te(t, e, s) {
  return re(t, e, (i, n) => {
    i[n] = s;
  });
}
function Be(t, e) {
  return re(t, e, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function Me(t, e, s, i) {
  return re(t, [...e, s], (n) => {
    n.splice(s, 0, i);
  });
}
function St(t, e, s, i) {
  return re(t, [...e, s], (n) => {
    const r = n, [o] = r.splice(s, 1);
    r.splice(i, 0, o);
  });
}
const Et = 1e3;
class Ct {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < Et || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const L = W`
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
    border-bottom: 2px solid transparent;
    color: var(--secondary-text-color);
  }
  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
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
  }
  .dot.gated {
    background: var(--primary-color);
  }
`;
var Ot = Object.defineProperty, Pt = Object.getOwnPropertyDescriptor, g = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Pt(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Ot(e, s, n), n;
};
const kt = ["groups", "envelopes", "defaults"], Tt = 2e3, Lt = 1500;
let m = class extends v {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [];
  }
  async connectedCallback() {
    super.connectedCallback();
    const { ok: t, missing: e } = await wt();
    this.missing = t ? [] : e, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.stopLive();
  }
  async load() {
    try {
      const t = await $t(this.hass);
      this.draft = new Ct(t), this.syncSelection(), this.errors = [], this.banner = null;
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
    !t || !this.selection || ve(t, this.selection) === void 0 && (this.selection = null);
  }
  async save() {
    const t = this.draft;
    if (t) {
      this.busy = !0;
      try {
        const e = await xt(t.config, {
          validate: (s) => bt(this.hass, s),
          save: (s) => yt(this.hass, s)
        });
        e.errors !== null && (this.errors = e.errors), this.banner = e.banner, e.reload && (await new Promise((s) => setTimeout(s, Lt)), await this.load());
      } finally {
        this.busy = !1;
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
    this.liveOn = t, t ? this.startLive() : this.stopLive();
  }
  startLive() {
    this.stopLive();
    const t = async () => {
      try {
        this.live = await _t(this.hass);
      } catch {
      }
    };
    t(), this.liveTimer = window.setInterval(() => {
      t();
    }, Tt);
  }
  stopLive() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0), this.live = null;
  }
  render() {
    if (this.missing.length) return this.renderMissing();
    const t = this.draft;
    return h`
      <ha-top-app-bar-fixed>
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
          <ha-button .disabled=${!t?.dirty || this.busy} @click=${this.save}>${t?.dirty ? "Save" : "Saved"}</ha-button>
        </div>
        ${this.renderBanner()}
        <div class="tabs">
          ${kt.map(
      (e) => h`<div
              class="tab ${this.tab === e ? "active" : ""}"
              role="tab"
              @click=${() => {
        this.tab = e;
      }}
            >
              ${e[0].toUpperCase() + e.slice(1)}
            </div>`
    )}
        </div>
        ${t ? this.renderTab(t) : h`<p style="padding:16px">Loading…</p>`}
      </ha-top-app-bar-fixed>
    `;
  }
  renderMissing() {
    return h`
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
    return t ? h`<ha-alert
      alert-type=${t.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
      this.banner = null;
    }}
      >${t.text}</ha-alert
    >` : p;
  }
  renderTab(t) {
    const e = (s) => this.setConfig(s.detail, s.coalesceKey);
    switch (this.tab) {
      case "groups":
        return h`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree
            .hass=${this.hass}
            .config=${t.config}
            .selection=${this.selection}
            .errors=${this.errors}
            .live=${this.live}
            @al-select=${(s) => {
          this.selection = s.detail;
        }}
            @al-change=${e}
          ></al-tree>
          <div>${this.renderEditor(t)}</div>
        </div>`;
      case "envelopes":
        return h`<al-envelopes
          .hass=${this.hass}
          .config=${t.config}
          .errors=${this.errors}
          @al-change=${e}
        ></al-envelopes>`;
      case "defaults":
        return h`<al-defaults
          .hass=${this.hass}
          .config=${t.config}
          .errors=${this.errors}
          @al-change=${e}
        ></al-defaults>`;
    }
  }
  renderEditor(t) {
    const e = this.selection;
    if (!e) return h`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
    const s = (n) => this.setConfig(n.detail, n.coalesceKey);
    return e[e.length - 2] === "stimuli" ? h`<al-stimulus-editor
          .hass=${this.hass}
          .config=${t.config}
          .path=${e}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${s}
        ></al-stimulus-editor>` : h`<al-group-editor
          .hass=${this.hass}
          .config=${t.config}
          .path=${e}
          .errors=${this.errors}
          @al-change=${s}
          @al-select=${(n) => {
      this.selection = n.detail;
    }}
        ></al-group-editor>`;
  }
};
m.styles = [L];
g([
  d({ attribute: !1 })
], m.prototype, "hass", 2);
g([
  d({ type: Boolean })
], m.prototype, "narrow", 2);
g([
  y()
], m.prototype, "draft", 2);
g([
  y()
], m.prototype, "tab", 2);
g([
  y()
], m.prototype, "selection", 2);
g([
  y()
], m.prototype, "errors", 2);
g([
  y()
], m.prototype, "banner", 2);
g([
  y()
], m.prototype, "live", 2);
g([
  y()
], m.prototype, "liveOn", 2);
g([
  y()
], m.prototype, "busy", 2);
g([
  y()
], m.prototype, "missing", 2);
m = g([
  T("activity-levels-panel")
], m);
const b = (t) => t.join("/");
function Ge(t, e) {
  const s = b(e), i = {};
  for (const n of t) {
    if (!n.path.startsWith(s + "/")) continue;
    const r = n.path.slice(s.length + 1);
    r.includes("/") || (i[r] = n.message);
  }
  return i;
}
function Re(t, e) {
  const s = b(e);
  return t.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function $e(t, e) {
  const s = new CustomEvent("al-change", {
    detail: t,
    bubbles: !0,
    composed: !0
  });
  return e !== void 0 && (s.coalesceKey = e), s;
}
const Ve = (t) => new CustomEvent("al-select", { detail: t, bubbles: !0, composed: !0 }), Mt = (t) => ({
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
}), Rt = (t) => ({
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
function Dt(t) {
  const e = /* @__PURE__ */ new Set(), s = (i) => {
    e.add(i.id), i.children.forEach(s);
  };
  return t.groups.forEach(s), e;
}
function Nt(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
function Ut(t, e) {
  const s = Dt(t), i = Nt(e);
  if (!s.has(i)) return i;
  let n = 2;
  for (; s.has(`${i}_${n}`); ) n++;
  return `${i}_${n}`;
}
const Y = (t, e) => ve(t, e), he = (t, e) => ve(t, e), Ht = (t) => t.slice(0, -1), be = (t) => t.slice(0, -2), We = (t, e) => t.envelopes.find((s) => s.id === (e ?? t.defaults.envelope));
function It(t, e) {
  const s = We(t, e.envelope), i = t.defaults, n = (r, o, a) => r ?? o ?? a;
  return {
    attack: n(e.attack, s?.attack, 0),
    decay: n(e.decay, s?.decay, 0),
    sustain: n(e.sustain, s?.sustain, 1),
    release: n(e.release, s?.release, 1800),
    impulse: n(e.impulse, s?.impulse, !1),
    retrigger: n(e.retrigger, s?.retrigger, i.retrigger),
    unavailable: n(e.unavailable, s?.unavailable, i.unavailable),
    debounce: n(e.debounce, s?.debounce, i.debounce)
  };
}
var jt = Object.defineProperty, zt = Object.getOwnPropertyDescriptor, I = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? zt(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && jt(e, s, n), n;
};
const De = (t) => t.stopPropagation(), Ft = (t) => {
  (t.key === "Enter" || t.key === " ") && t.stopPropagation();
};
let E = class extends v {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  emitChange(t) {
    this.dispatchEvent($e(t));
  }
  emitSelect(t) {
    this.dispatchEvent(Ve(t));
  }
  isSelected(t) {
    return this.selection !== null && b(this.selection) === b(t);
  }
  select(t, e) {
    t.stopPropagation(), this.emitSelect(e);
  }
  selectOnKey(t, e) {
    t.key !== "Enter" && t.key !== " " || (t.preventDefault(), t.stopPropagation(), this.emitSelect(e));
  }
  addGroup(t, e) {
    const s = this.config;
    s && (this.emitChange(Me(s, t, e, Mt(Ut(s, "new_group")))), this.emitSelect([...t, e]));
  }
  addStimulus(t, e) {
    const s = this.config;
    if (!s) return;
    const i = [...t, "stimuli"];
    this.emitChange(Me(s, i, e, Rt(""))), this.emitSelect([...i, e]);
  }
  move(t, e) {
    const s = this.config;
    if (!s) return;
    const i = Ht(t), n = t[t.length - 1], r = n + e;
    this.emitChange(St(s, i, n, r)), this.emitSelect([...i, r]);
  }
  removeNode(t, e) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${e}? This cannot be undone after saving.`)) return;
    this.emitChange(Be(s, t));
    const i = be(t);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const t = this.config;
    return t ? h`
      <ha-card>
        ${t.groups.map((e, s) => this.renderGroup(t, e, ["groups", s], 0, s, t.groups.length))}
        ${t.groups.length === 0 ? h`<p class="muted">No groups yet. Add one to get started.</p>` : p}
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], t.groups.length)}>Add group</ha-button>
        </div>
      </ha-card>
    ` : h`<ha-card><span class="muted">Loading…</span></ha-card>`;
  }
  renderGroup(t, e, s, i, n, r) {
    const o = Re(this.errors, s), a = this.live?.groups[e.id], l = a?.max_value ?? e.max_value ?? t.defaults.max_value, c = a ? Math.max(0, Math.min(100, a.value / (l || 1) * 100)) : 0;
    return h`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(f) => this.select(f, s)}
            @keydown=${Ft}
          >
            ${e.name || e.id || "(unnamed group)"}
          </button>
          ${o ? h`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : p}
          ${a ? h`<div class="meter" title="${a.value} of ${l}">
                  <div style="width: ${c}%"></div>
                </div>
                <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : p}
        </div>
        <div slot="icons" class="row" @click=${De}>
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
          <ha-icon-button label="Move up" title="Move up" .disabled=${n === 0} @click=${() => this.move(s, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Move down"
            title="Move down"
            .disabled=${n === r - 1}
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
      (f, u) => this.renderStimulus(f, [...s, "stimuli", u], u, e.stimuli.length, e.id)
    )}
          ${e.stimuli.length === 0 ? h`<div class="muted empty">No stimuli yet.</div>` : p}
          <div class="children">
            ${e.children.map(
      (f, u) => this.renderGroup(t, f, [...s, "children", u], i + 1, u, e.children.length)
    )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(t, e, s, i, n) {
    const r = this.hass?.states[t.entity], o = r?.attributes.friendly_name ?? (t.entity || "(no entity)"), a = Re(this.errors, e), l = this.live?.voices[n]?.find((c) => c.label === (t.key ?? t.entity));
    return h`
      <div
        class="row stimulus ${this.isSelected(e) ? "selected" : ""}"
        role="button"
        tabindex="0"
        @click=${(c) => this.select(c, e)}
        @keydown=${(c) => this.selectOnKey(c, e)}
      >
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="name grow" title=${t.entity}>${o}</span>
        ${a ? h`<span class="badge" title="${a} problem(s)">${a}</span>` : p}
        ${r ? h`<span class="muted chip">${r.state}</span>` : p}
        ${l ? h`<span class="muted chip">${l.phase}</span>
              <span class="muted chip">${l.value.toFixed(2)}</span>` : p}
        <div class="row" @click=${De}>
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
E.styles = [
  L,
  W`
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
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
      }
      .empty {
        padding: 4px;
      }
    `
];
I([
  d({ attribute: !1 })
], E.prototype, "hass", 2);
I([
  d({ attribute: !1 })
], E.prototype, "config", 2);
I([
  d({ attribute: !1 })
], E.prototype, "selection", 2);
I([
  d({ attribute: !1 })
], E.prototype, "errors", 2);
I([
  d({ attribute: !1 })
], E.prototype, "live", 2);
E = I([
  T("al-tree")
], E);
function Bt(t) {
  const e = Math.floor(t / 3600), s = Math.floor((t - e * 3600) / 60), i = Math.round((t - e * 3600 - s * 60) * 1e3) / 1e3;
  return { hours: e, minutes: s, seconds: i };
}
function Gt(t) {
  if (!t) return null;
  const e = (t.days ?? 0) * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds + (t.milliseconds ?? 0) / 1e3;
  return Math.round(e * 1e3) / 1e3;
}
function Vt(t) {
  if (t === 0) return "0s";
  const e = [];
  let s = t;
  const i = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [n, r] of i) {
    const o = Math.floor(s / r);
    o > 0 && (e.push(`${o}${n}`), s -= o * r);
  }
  return s = Math.round(s * 1e3) / 1e3, s > 0 && e.push(`${s}s`), e.join(" ");
}
const Ne = (t) => t.split(",").map((e) => e.trim()).filter((e) => e.length > 0), z = (t) => (t ?? []).join(", "), se = (t) => t == null || t === "" ? null : t;
function Wt(t, e) {
  if (e != null)
    switch (t) {
      case "duration":
        return Bt(e);
      case "boolean":
        return e ? "true" : "false";
      default:
        return e;
    }
}
function qt(t, e) {
  if (e == null || e === "") return null;
  switch (t) {
    case "duration":
      return Gt(e);
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
function Kt(t, e) {
  if (e == null) return "unset";
  switch (t) {
    case "duration":
      return Vt(e);
    case "boolean":
      return e ? "Yes" : "No";
    default:
      return String(e);
  }
}
var Jt = Object.defineProperty, Zt = Object.getOwnPropertyDescriptor, w = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Zt(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Jt(e, s, n), n;
};
const qe = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
let $ = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.selector = { text: {} }, this.value = null, this.inherited = null, this.inheritedFrom = "defaults", this.kind = "number";
  }
  get overridden() {
    return this.value !== null && this.value !== void 0;
  }
  emit(t) {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: t }, bubbles: !0, composed: !0 }));
  }
  onValueChanged(t) {
    t.stopPropagation(), this.emit(qt(this.kind, t.detail?.value));
  }
  onReset() {
    this.emit(null);
  }
  render() {
    const t = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${Kt(this.kind, this.inherited)}`;
    return h`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? qe : this.selector}
          .label=${this.label}
          .value=${Wt(this.kind, this.value)}
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
      ${this.error ? h`<div class="muted error msg">${this.error}</div>` : p}
    `;
  }
};
$.styles = [
  L,
  W`
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
w([
  d({ attribute: !1 })
], $.prototype, "hass", 2);
w([
  d()
], $.prototype, "label", 2);
w([
  d({ attribute: !1 })
], $.prototype, "selector", 2);
w([
  d({ attribute: !1 })
], $.prototype, "value", 2);
w([
  d({ attribute: !1 })
], $.prototype, "inherited", 2);
w([
  d({ attribute: "inherited-from" })
], $.prototype, "inheritedFrom", 2);
w([
  d()
], $.prototype, "kind", 2);
w([
  d()
], $.prototype, "error", 2);
$ = w([
  T("al-override-field")
], $);
var Xt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, K = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Yt(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Xt(e, s, n), n;
};
const Qt = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, es = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, ts = ["id", "name", "area", "mix", "null_handling", "gain"], ss = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], is = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], ns = { number: { min: 0.1, step: 0.1, mode: "box" } }, rs = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, os = (t, e) => [
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: ss } } },
  ...t.mix === "mean" ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: is } } }] : [],
  ...e ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]
];
let k = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.computeLabel = (t) => Qt[t.name] ?? t.name, this.computeHelper = (t) => es[t.name] ?? "";
  }
  emitChange(t, e) {
    this.dispatchEvent($e(t, e));
  }
  emitSelect(t) {
    this.dispatchEvent(Ve(t));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const { config: e, path: s } = this;
    if (!e || !s) return;
    const i = Y(e, s);
    if (!i) return;
    const n = t.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      name: se(n.name),
      area: se(n.area),
      mix: n.mix ?? i.mix,
      null_handling: n.null_handling ?? i.null_handling,
      gain: typeof n.gain == "number" ? n.gain : i.gain
    }, o = ts.find((a) => r[a] !== i[a]);
    o !== void 0 && this.emitChange(te(e, s, r), `${b(s)}:${o}`);
  }
  setField(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(te(s, [...i, t], e), `${b(i)}:${t}`);
  }
  onDelete() {
    const { config: t, path: e } = this;
    if (!t || !e) return;
    const s = Y(t, e);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(Be(t, e));
    const i = be(e);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length === 0)
      return h`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = Y(t, e);
    if (!s) return h`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = e.length === 2, n = Ge(this.errors, e), r = this.errors.filter((a) => a.path === b(e)), o = {
      id: s.id,
      name: s.name ?? "",
      mix: s.mix
    };
    return s.mix === "mean" && (o.null_handling = s.null_handling), s.area !== null && (o.area = s.area), i || (o.gain = s.gain), h`
      <ha-card header="Group">
        ${r.map((a) => h`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${os(s, i)}
          .error=${n}
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
          .selector=${ns}
          .value=${s.max_value}
          .inherited=${t.defaults.max_value}
          .inheritedFrom=${"defaults"}
          .error=${n.max_value}
          @value-changed=${(a) => this.setField("max_value", a.detail.value)}
        ></al-override-field>
        <al-override-field
          .hass=${this.hass}
          label="Precision"
          kind="select"
          .selector=${rs}
          .value=${s.precision === null ? null : String(s.precision)}
          .inherited=${String(t.defaults.precision)}
          .inheritedFrom=${"defaults"}
          .error=${n.precision}
          @value-changed=${(a) => this.setField("precision", a.detail.value === null ? null : Number(a.detail.value))}
        ></al-override-field>

        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
};
k.styles = [
  L,
  W`
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
K([
  d({ attribute: !1 })
], k.prototype, "hass", 2);
K([
  d({ attribute: !1 })
], k.prototype, "config", 2);
K([
  d({ attribute: !1 })
], k.prototype, "path", 2);
K([
  d({ attribute: !1 })
], k.prototype, "errors", 2);
k = K([
  T("al-group-editor")
], k);
var as = Object.defineProperty, ls = Object.getOwnPropertyDescriptor, M = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ls(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && as(e, s, n), n;
};
const cs = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, hs = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, ds = ["entity", "gain", "key", "envelope"], Z = { duration: {} }, us = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, ps = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, fs = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, ms = [
  { name: "attack", label: "Attack", kind: "duration", selector: Z },
  { name: "decay", label: "Decay", kind: "duration", selector: Z },
  { name: "sustain", label: "Sustain", kind: "number", selector: us },
  { name: "release", label: "Release", kind: "duration", selector: Z },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: qe },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: ps },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: fs },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Z }
];
let A = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.toText = null, this.computeLabel = (t) => cs[t.name] ?? t.name, this.computeHelper = (t) => hs[t.name] ?? "";
  }
  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  willUpdate(t) {
    if (t.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !t.has("config")) return;
    const { config: e, path: s } = this, i = e && s ? he(e, s) : void 0;
    i && z(i.to) !== z(Ne(this.toText)) && (this.toText = null);
  }
  emitChange(t, e) {
    this.dispatchEvent($e(t, e));
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
    const i = he(e, s);
    if (!i) return;
    const n = t.detail?.value ?? {}, r = String(n.to ?? "");
    this.toText = r;
    const o = {
      ...i,
      entity: String(n.entity ?? ""),
      to: Ne(r),
      gain: typeof n.gain == "number" ? n.gain : i.gain,
      key: se(n.key),
      envelope: se(n.envelope)
    }, a = z(o.to) !== z(i.to) ? "to" : ds.find((l) => o[l] !== i[l]);
    a !== void 0 && this.emitChange(te(e, s, o), `${b(s)}:${a}`);
  }
  setOverride(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(te(s, [...i, t], e), `${b(i)}:${t}`);
  }
  /** Where the effective value comes from when the stimulus does not override it. */
  sourceOf(t, e, s) {
    const i = We(t, e.envelope);
    return i ? i[s] === null || i[s] === void 0 ? "defaults" : e.envelope ?? t.defaults.envelope : "defaults";
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length < 3)
      return h`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = he(t, e);
    if (!s) return h`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = Y(t, be(e)), n = Ge(this.errors, e), r = this.errors.filter((c) => c.path === b(e)), o = It(t, s), a = {
      entity: s.entity,
      to: this.toText ?? z(s.to),
      gain: s.gain,
      key: s.key ?? "",
      envelope: s.envelope ?? ""
    }, l = this.live?.voices[i?.id ?? ""]?.find(
      (c) => c.label === (s.key ?? s.entity)
    );
    return h`
      <ha-card header="Stimulus">
        ${r.map((c) => h`<ha-alert alert-type="error">${c.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${a}
          .schema=${this.schemaFor(t)}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${l ? h`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip">${l.phase}</span>
              <span class="chip">${l.value.toFixed(2)}</span>
              <span class="dot ${l.gate ? "gated" : ""}" title=${l.gate ? "Gate open" : "Gate closed"}></span>
            </div>` : p}

        <h3>Envelope overrides</h3>
        ${ms.map(
      (c) => h`<al-override-field
            .hass=${this.hass}
            .label=${c.label}
            .kind=${c.kind}
            .selector=${c.selector}
            .value=${s[c.name]}
            .inherited=${o[c.name]}
            .inheritedFrom=${this.sourceOf(t, s, c.name)}
            .error=${n[c.name]}
            @value-changed=${(f) => this.setOverride(c.name, f.detail.value)}
          ></al-override-field>`
    )}
        <!-- TODO(task 6): render <al-envelope-sketch> for the resolved envelope here. -->
      </ha-card>
    `;
  }
};
A.styles = [
  L,
  W`
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
M([
  d({ attribute: !1 })
], A.prototype, "hass", 2);
M([
  d({ attribute: !1 })
], A.prototype, "config", 2);
M([
  d({ attribute: !1 })
], A.prototype, "path", 2);
M([
  d({ attribute: !1 })
], A.prototype, "errors", 2);
M([
  d({ attribute: !1 })
], A.prototype, "live", 2);
M([
  y()
], A.prototype, "toText", 2);
A = M([
  T("al-stimulus-editor")
], A);
var gs = Object.defineProperty, vs = Object.getOwnPropertyDescriptor, oe = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? vs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && gs(e, s, n), n;
};
let U = class extends v {
  constructor() {
    super(...arguments), this.errors = [];
  }
  render() {
    return h`<ha-card>Coming soon</ha-card>`;
  }
};
U.styles = [L];
oe([
  d({ attribute: !1 })
], U.prototype, "hass", 2);
oe([
  d({ attribute: !1 })
], U.prototype, "config", 2);
oe([
  d({ attribute: !1 })
], U.prototype, "errors", 2);
U = oe([
  T("al-envelopes")
], U);
var $s = Object.defineProperty, bs = Object.getOwnPropertyDescriptor, ae = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? bs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && $s(e, s, n), n;
};
let H = class extends v {
  constructor() {
    super(...arguments), this.errors = [];
  }
  render() {
    return h`<ha-card>Coming soon</ha-card>`;
  }
};
H.styles = [L];
ae([
  d({ attribute: !1 })
], H.prototype, "hass", 2);
ae([
  d({ attribute: !1 })
], H.prototype, "config", 2);
ae([
  d({ attribute: !1 })
], H.prototype, "errors", 2);
H = ae([
  T("al-defaults")
], H);
