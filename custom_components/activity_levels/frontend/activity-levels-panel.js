const ae = globalThis, Pe = ae.ShadowRoot && (ae.ShadyCSS === void 0 || ae.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Oe = /* @__PURE__ */ Symbol(), He = /* @__PURE__ */ new WeakMap();
let tt = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== Oe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (Pe && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = He.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && He.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const pt = (t) => new tt(typeof t == "string" ? t : t + "", void 0, Oe), C = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + t[r + 1], t[0]);
  return new tt(s, t, Oe);
}, mt = (t, e) => {
  if (Pe) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), n = ae.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, t.appendChild(i);
  }
}, Fe = Pe ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return pt(s);
})(t) : t;
const { is: ft, defineProperty: vt, getOwnPropertyDescriptor: gt, getOwnPropertyNames: $t, getOwnPropertySymbols: bt, getPrototypeOf: yt } = Object, ve = globalThis, je = ve.trustedTypes, _t = je ? je.emptyScript : "", wt = ve.reactiveElementPolyfillSupport, Y = (t, e) => t, de = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? _t : null;
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
} }, Le = (t, e) => !ft(t, e), ze = { attribute: !0, type: String, converter: de, reflect: !1, useDefault: !1, hasChanged: Le };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), ve.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let j = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = ze) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(e, i, s);
      n !== void 0 && vt(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: n, set: r } = gt(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: n, set(o) {
      const l = n?.call(this);
      r?.call(this, o), this.requestUpdate(e, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ze;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Y("elementProperties"))) return;
    const e = yt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Y("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Y("properties"))) {
      const s = this.properties, i = [...$t(s), ...bt(s)];
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
      for (const n of i) s.unshift(Fe(n));
    } else e !== void 0 && s.push(Fe(e));
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
    return mt(e, this.constructor.elementStyles), e;
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
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : de).toAttribute(s, i.type);
      this._$Em = e, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, n = i._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : de;
      this._$Em = n;
      const l = o.fromAttribute(s, r.type);
      this[n] = l ?? this._$Ej?.get(n) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, n = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? Le)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
        const { wrapped: o } = r, l = this[n];
        o !== !0 || this._$AL.has(n) || l === void 0 || this.C(n, void 0, r, l);
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
j.elementStyles = [], j.shadowRootOptions = { mode: "open" }, j[Y("elementProperties")] = /* @__PURE__ */ new Map(), j[Y("finalized")] = /* @__PURE__ */ new Map(), wt?.({ ReactiveElement: j }), (ve.reactiveElementVersions ??= []).push("2.1.2");
const Te = globalThis, Be = (t) => t, ue = Te.trustedTypes, Ge = ue ? ue.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, st = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, it = "?" + S, xt = `<${it}>`, N = document, Z = () => N.createComment(""), Q = (t) => t === null || typeof t != "object" && typeof t != "function", Re = Array.isArray, Et = (t) => Re(t) || typeof t?.[Symbol.iterator] == "function", _e = `[ 	
\f\r]`, q = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ve = /-->/g, We = />/g, L = RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), qe = /'/g, Ke = /"/g, nt = /^(?:script|style|textarea|title)$/i, rt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), c = rt(1), Je = rt(2), B = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), Ye = /* @__PURE__ */ new WeakMap(), T = N.createTreeWalker(N, 129);
function ot(t, e) {
  if (!Re(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ge !== void 0 ? Ge.createHTML(e) : e;
}
const At = (t, e) => {
  const s = t.length - 1, i = [];
  let n, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = q;
  for (let l = 0; l < s; l++) {
    const a = t[l];
    let u, h, m = -1, _ = 0;
    for (; _ < a.length && (o.lastIndex = _, h = o.exec(a), h !== null); ) _ = o.lastIndex, o === q ? h[1] === "!--" ? o = Ve : h[1] !== void 0 ? o = We : h[2] !== void 0 ? (nt.test(h[2]) && (n = RegExp("</" + h[2], "g")), o = L) : h[3] !== void 0 && (o = L) : o === L ? h[0] === ">" ? (o = n ?? q, m = -1) : h[1] === void 0 ? m = -2 : (m = o.lastIndex - h[2].length, u = h[1], o = h[3] === void 0 ? L : h[3] === '"' ? Ke : qe) : o === Ke || o === qe ? o = L : o === Ve || o === We ? o = q : (o = L, n = void 0);
    const A = o === L && t[l + 1].startsWith("/>") ? " " : "";
    r += o === q ? a + xt : m >= 0 ? (i.push(u), a.slice(0, m) + st + a.slice(m) + S + A) : a + S + (m === -2 ? l : A);
  }
  return [ot(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class ee {
  constructor({ strings: e, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const l = e.length - 1, a = this.parts, [u, h] = At(e, s);
    if (this.el = ee.createElement(u, i), T.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (n = T.nextNode()) !== null && a.length < l; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const m of n.getAttributeNames()) if (m.endsWith(st)) {
          const _ = h[o++], A = n.getAttribute(m).split(S), re = /([.?@])?(.*)/.exec(_);
          a.push({ type: 1, index: r, name: re[2], strings: A, ctor: re[1] === "." ? kt : re[1] === "?" ? Ct : re[1] === "@" ? Pt : ge }), n.removeAttribute(m);
        } else m.startsWith(S) && (a.push({ type: 6, index: r }), n.removeAttribute(m));
        if (nt.test(n.tagName)) {
          const m = n.textContent.split(S), _ = m.length - 1;
          if (_ > 0) {
            n.textContent = ue ? ue.emptyScript : "";
            for (let A = 0; A < _; A++) n.append(m[A], Z()), T.nextNode(), a.push({ type: 2, index: ++r });
            n.append(m[_], Z());
          }
        }
      } else if (n.nodeType === 8) if (n.data === it) a.push({ type: 2, index: r });
      else {
        let m = -1;
        for (; (m = n.data.indexOf(S, m + 1)) !== -1; ) a.push({ type: 7, index: r }), m += S.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const i = N.createElement("template");
    return i.innerHTML = e, i;
  }
}
function G(t, e, s = t, i) {
  if (e === B) return e;
  let n = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = Q(e) ? void 0 : e._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(t), n._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = n : s._$Cl = n), n !== void 0 && (e = G(t, n._$AS(t, e.values), n, i)), e;
}
class St {
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
    const { el: { content: s }, parts: i } = this._$AD, n = (e?.creationScope ?? N).importNode(s, !0);
    T.currentNode = n;
    let r = T.nextNode(), o = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let u;
        a.type === 2 ? u = new se(r, r.nextSibling, this, e) : a.type === 1 ? u = new a.ctor(r, a.name, a.strings, this, e) : a.type === 6 && (u = new Ot(r, this, e)), this._$AV.push(u), a = i[++l];
      }
      o !== a?.index && (r = T.nextNode(), o++);
    }
    return T.currentNode = N, n;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class se {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, n) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = n, this._$Cv = n?.isConnected ?? !0;
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
    e = G(this, e, s), Q(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== B && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Et(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && Q(this._$AH) ? this._$AA.nextSibling.data = e : this.T(N.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, n = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = ee.createElement(ot(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(s);
    else {
      const r = new St(n, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = Ye.get(e.strings);
    return s === void 0 && Ye.set(e.strings, s = new ee(e)), s;
  }
  k(e) {
    Re(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const r of e) n === s.length ? s.push(i = new se(this.O(Z()), this.O(Z()), this, this.options)) : i = s[n], i._$AI(r), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = Be(e).nextSibling;
      Be(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ge {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, n, r) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = s, this._$AM = n, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(e, s = this, i, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = G(this, e, s, 0), o = !Q(e) || e !== this._$AH && e !== B, o && (this._$AH = e);
    else {
      const l = e;
      let a, u;
      for (e = r[0], a = 0; a < r.length - 1; a++) u = G(this, l[i + a], s, a), u === B && (u = this._$AH[a]), o ||= !Q(u) || u !== this._$AH[a], u === d ? e = d : e !== d && (e += (u ?? "") + r[a + 1]), this._$AH[a] = u;
    }
    o && !n && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class kt extends ge {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class Ct extends ge {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class Pt extends ge {
  constructor(e, s, i, n, r) {
    super(e, s, i, n, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = G(this, e, s, 0) ?? d) === B) return;
    const i = this._$AH, n = e === d && i !== d || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== d && (i === d || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ot {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    G(this, e);
  }
}
const Lt = Te.litHtmlPolyfillSupport;
Lt?.(ee, se), (Te.litHtmlVersions ??= []).push("3.3.3");
const Tt = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = n = new se(e.insertBefore(Z(), r), r, void 0, s ?? {});
  }
  return n._$AI(t), n;
};
const Me = globalThis;
class b extends j {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Tt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return B;
  }
}
b._$litElement$ = !0, b.finalized = !0, Me.litElementHydrateSupport?.({ LitElement: b });
const Rt = Me.litElementPolyfillSupport;
Rt?.({ LitElement: b });
(Me.litElementVersions ??= []).push("4.2.2");
const P = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
const Mt = { attribute: !0, type: String, converter: de, reflect: !1, hasChanged: Le }, Dt = (t = Mt, e, s) => {
  const { kind: i, metadata: n } = s;
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(s.name, t), i === "accessor") {
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
function p(t) {
  return (e, s) => typeof s == "object" ? Dt(t, e, s) : ((i, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(t, e, s);
}
function g(t) {
  return p({ ...t, state: !0, attribute: !1 });
}
const at = (t) => ({ ok: t.ok, errors: t.errors ?? [] }), Nt = (t) => t.callWS({ type: "activity_levels/config/get" }).then((e) => e.config), Ut = (t, e) => t.callWS({ type: "activity_levels/config/validate", config: e }).then(at);
async function It(t, e) {
  try {
    return at(await t.callWS({ type: "activity_levels/config/save", config: e }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const Ht = (t) => t.callWS({ type: "activity_levels/state" }), we = [
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
], Ft = 2500, jt = 8e3;
function zt(t) {
  let e;
  return { promise: new Promise((i) => {
    e = setTimeout(i, t);
  }), cancel: () => clearTimeout(e) };
}
async function Xe(t, e, s) {
  const i = zt(e);
  try {
    return await Promise.race([t, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function Bt() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function Gt(t = jt, e = Ft) {
  if (we.every((n) => customElements.get(n))) return { ok: !0, missing: [] };
  await Xe(Bt(), e, void 0);
  const s = await Promise.all(
    we.map(
      (n) => Xe(
        customElements.whenDefined(n).then(() => !0),
        t,
        !1
      )
    )
  ), i = we.filter((n, r) => !s[r]);
  return { ok: i.length === 0, missing: [...i] };
}
async function Vt(t, e) {
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
function De(t, e) {
  let s = t;
  for (const i of e) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function Ze(t) {
  return Array.isArray(t) ? [...t] : { ...t };
}
function $e(t, e, s) {
  if (e.length === 0) throw new Error("empty path");
  const i = Ze(t);
  let n = i;
  for (let r = 0; r < e.length - 1; r++) {
    const o = e[r], l = Ze(n[o]);
    n[o] = l, n = l;
  }
  return s(n, e[e.length - 1]), i;
}
function U(t, e, s) {
  return $e(t, e, (i, n) => {
    i[n] = s;
  });
}
function Ne(t, e) {
  return $e(t, e, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function ke(t, e, s, i) {
  return $e(t, [...e, s], (n) => {
    n.splice(s, 0, i);
  });
}
function Wt(t, e, s, i) {
  return $e(t, [...e, s], (n) => {
    const r = n, [o] = r.splice(s, 1);
    r.splice(i, 0, o);
  });
}
const qt = 1e3;
class Kt {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < qt || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const O = C`
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
var Jt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, $ = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Yt(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Jt(e, s, n), n;
};
const K = ["groups", "envelopes", "defaults"], Xt = 2e3, Zt = 1500;
let f = class extends b {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.tabFocus = 0, this.onVisibilityChange = () => this.updateLivePolling(), this.onTabsKeydown = (t) => {
      const e = K.length - 1;
      switch (t.key) {
        case "ArrowRight":
          this.focusTab((this.tabFocus + 1) % K.length);
          break;
        case "ArrowLeft":
          this.focusTab((this.tabFocus + e) % K.length);
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
    const { ok: t, missing: e } = await Gt();
    this.missing = t ? [] : e, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.stopLive();
  }
  /** Non-admins can look, but every write command is rejected by the backend. */
  get readOnly() {
    return this.hass?.user?.is_admin === !1;
  }
  async load() {
    try {
      const t = await Nt(this.hass);
      this.draft = new Kt(t), this.syncSelection(), this.errors = [], this.banner = null;
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
    !t || !this.selection || De(t, this.selection) === void 0 && (this.selection = null);
  }
  async save() {
    const t = this.draft;
    if (t) {
      this.busy = !0, this.updateLivePolling();
      try {
        const e = await Vt(t.config, {
          validate: (s) => Ut(this.hass, s),
          save: (s) => It(this.hass, s)
        });
        e.errors !== null && (this.errors = e.errors), this.banner = e.banner, e.reload && (await new Promise((s) => setTimeout(s, Zt)), await this.load());
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
    }, Xt));
  }
  async pollLive() {
    try {
      this.live = await Ht(this.hass);
    } catch {
    }
  }
  clearLiveTimer() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
  }
  selectTab(t) {
    const e = K[t];
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
          <ha-button .disabled=${!t?.dirty || this.busy || this.readOnly} @click=${this.save}
            >${t?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()} ${this.renderReadOnly()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${K.map(
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
  renderReadOnly() {
    return this.readOnly ? c`<ha-alert alert-type="info"
      >You are signed in as a non-administrator, so this panel is read-only: saving is rejected by Home
      Assistant. Ask an administrator to make configuration changes.</ha-alert
    >` : d;
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
    const e = (s) => this.setConfig(s.detail, s.coalesceKey);
    switch (this.tab) {
      case "groups":
        return c`<div class="layout ${this.narrow ? "narrow" : ""}">
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
        return c`<al-envelopes
          .hass=${this.hass}
          .config=${t.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${e}
        ></al-envelopes>`;
      case "defaults":
        return c`<al-defaults
          .hass=${this.hass}
          .config=${t.config}
          .errors=${this.errors}
          @al-change=${e}
        ></al-defaults>`;
    }
  }
  renderEditor(t) {
    const e = this.selection;
    if (!e) return c`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
    const s = (n) => this.setConfig(n.detail, n.coalesceKey);
    return e[e.length - 2] === "stimuli" ? c`<al-stimulus-editor
          .hass=${this.hass}
          .config=${t.config}
          .path=${e}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${s}
        ></al-stimulus-editor>` : c`<al-group-editor
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
f.styles = [O];
$([
  p({ attribute: !1 })
], f.prototype, "hass", 2);
$([
  p({ type: Boolean })
], f.prototype, "narrow", 2);
$([
  g()
], f.prototype, "draft", 2);
$([
  g()
], f.prototype, "tab", 2);
$([
  g()
], f.prototype, "selection", 2);
$([
  g()
], f.prototype, "errors", 2);
$([
  g()
], f.prototype, "banner", 2);
$([
  g()
], f.prototype, "live", 2);
$([
  g()
], f.prototype, "liveOn", 2);
$([
  g()
], f.prototype, "busy", 2);
$([
  g()
], f.prototype, "missing", 2);
$([
  g()
], f.prototype, "tabFocus", 2);
f = $([
  P("activity-levels-panel")
], f);
function M(t) {
  const e = Math.floor(t / 3600), s = Math.floor((t - e * 3600) / 60), i = Math.round((t - e * 3600 - s * 60) * 1e3) / 1e3, n = Math.floor(i), r = Math.round((i - n) * 1e3);
  return r === 0 ? { hours: e, minutes: s, seconds: n } : { hours: e, minutes: s, seconds: n, milliseconds: r };
}
function D(t) {
  if (!t) return null;
  const e = (t.days ?? 0) * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds + (t.milliseconds ?? 0) / 1e3;
  return Math.round(e * 1e3) / 1e3;
}
function R(t) {
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
const v = (t) => t.join("/");
function be(t, e) {
  const s = v(e), i = {};
  for (const n of t) {
    if (!n.path.startsWith(s + "/")) continue;
    const r = n.path.slice(s.length + 1);
    r.includes("/") || (i[r] = n.message);
  }
  return i;
}
function Ce(t, e) {
  const s = v(e);
  return t.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function ie(t, e) {
  const s = new CustomEvent("al-change", {
    detail: t,
    bubbles: !0,
    composed: !0
  });
  return e !== void 0 && (s.coalesceKey = e), s;
}
const lt = (t) => new CustomEvent("al-select", { detail: t, bubbles: !0, composed: !0 }), Qt = (t) => ({
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
}), es = (t) => ({
  id: t,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), ts = (t) => ({
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
function ss(t) {
  const e = /* @__PURE__ */ new Set(), s = (i) => {
    e.add(i.id), i.children.forEach(s);
  };
  return t.groups.forEach(s), e;
}
function is(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const ns = (t) => new Set(t.envelopes.map((e) => e.id));
function ct(t, e) {
  const s = is(e);
  if (!t.has(s)) return s;
  let i = 2;
  for (; t.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const rs = (t, e) => ct(ss(t), e), os = (t, e) => ct(ns(t), e);
function as(t, e) {
  const s = [], i = (n) => {
    n.stimuli.some((r) => r.envelope === e) && s.push(n.id), n.children.forEach(i);
  };
  return t.groups.forEach(i), { defaults: t.defaults.envelope === e, groups: s };
}
function ls(t, e, s) {
  const i = t.envelopes[e];
  if (!i || i.id === s) return t;
  const n = i.id, r = t.envelopes.map((l, a) => a === e ? { ...l, id: s } : l);
  if (t.envelopes.some((l, a) => a !== e && l.id === n)) return { ...t, envelopes: r };
  const o = (l) => ({
    ...l,
    stimuli: l.stimuli.map((a) => a.envelope === n ? { ...a, envelope: s } : a),
    children: l.children.map(o)
  });
  return {
    ...t,
    defaults: t.defaults.envelope === n ? { ...t.defaults, envelope: s } : t.defaults,
    envelopes: r,
    groups: t.groups.map(o)
  };
}
const le = (t, e) => De(t, e), xe = (t, e) => De(t, e), cs = (t) => t.slice(0, -1), Ue = (t) => t.slice(0, -2), ht = (t, e) => t.envelopes.find((s) => s.id === (e ?? t.defaults.envelope));
function hs(t, e) {
  const s = ht(t, e.envelope), i = t.defaults, n = (r, o, l) => r ?? o ?? l;
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
var ds = Object.defineProperty, us = Object.getOwnPropertyDescriptor, W = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? us(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ds(e, s, n), n;
};
const Qe = (t) => t.stopPropagation(), ps = (t) => {
  (t.key === "Enter" || t.key === " ") && t.stopPropagation();
};
let k = class extends b {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  emitChange(t) {
    this.dispatchEvent(ie(t));
  }
  emitSelect(t) {
    this.dispatchEvent(lt(t));
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
    s && (this.emitChange(ke(s, t, e, Qt(rs(s, "new_group")))), this.emitSelect([...t, e]));
  }
  addStimulus(t, e) {
    const s = this.config;
    if (!s) return;
    const i = [...t, "stimuli"];
    this.emitChange(ke(s, i, e, ts(""))), this.emitSelect([...i, e]);
  }
  move(t, e) {
    const s = this.config;
    if (!s) return;
    const i = cs(t), n = t[t.length - 1], r = n + e;
    this.emitChange(Wt(s, i, n, r)), this.emitSelect([...i, r]);
  }
  removeNode(t, e) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${e}? This cannot be undone after saving.`)) return;
    this.emitChange(Ne(s, t));
    const i = Ue(t);
    this.emitSelect(i.length ? i : null);
  }
  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  countdown(t) {
    const e = this.live?.now;
    return t === null || e === void 0 ? null : R(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
  }
  /** Tooltip for a voice's phase chip: what it is doing, and how long that lasts. */
  voiceTitle(t) {
    const e = this.countdown(t.phase_ends);
    return e === null ? `Phase: ${t.phase}` : `Phase: ${t.phase}, ends in ${e}`;
  }
  /** Tooltip for a group's meter: the displayed value, the unrounded mix, and the next wake. */
  meterTitle(t, e, s) {
    const i = [`${t.value} of ${e}`, `raw ${t.raw_value.toFixed(3)}`], n = s ? this.countdown(t.next_wake) : null;
    return n !== null && i.push(`next wake in ${n}`), i.join(" · ");
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
  renderGroup(t, e, s, i, n, r) {
    const o = Ce(this.errors, s), l = this.live?.groups[e.id], a = l?.max_value ?? e.max_value ?? t.defaults.max_value, u = l ? Math.max(0, Math.min(100, l.value / (a || 1) * 100)) : 0;
    return c`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(h) => this.select(h, s)}
            @keydown=${ps}
          >
            ${e.name || e.id || "(unnamed group)"}
          </button>
          ${o ? c`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : d}
          ${l ? c`<div class="meter" title=${this.meterTitle(l, a, i === 0)}>
                  <div style="width: ${u}%"></div>
                </div>
                <span class="dot ${l.gated ? "gated" : ""}" title=${l.gated ? "Gate open" : "Gate closed"}></span>` : d}
        </div>
        <div slot="icons" class="row" @click=${Qe}>
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
      (h, m) => this.renderStimulus(h, [...s, "stimuli", m], m, e.stimuli.length, e.id)
    )}
          ${e.stimuli.length === 0 ? c`<div class="muted empty">
                No stimuli yet — use the + button above to point this group at an entity.
              </div>` : d}
          <div class="children">
            ${e.children.map(
      (h, m) => this.renderGroup(t, h, [...s, "children", m], i + 1, m, e.children.length)
    )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(t, e, s, i, n) {
    const r = this.hass?.states[t.entity], o = r?.attributes.friendly_name ?? (t.entity || "(no entity)"), l = Ce(this.errors, e), a = this.live?.voices[n]?.find((u) => u.label === (t.key ?? t.entity));
    return c`
      <div
        class="row stimulus ${this.isSelected(e) ? "selected" : ""}"
        role="button"
        tabindex="0"
        @click=${(u) => this.select(u, e)}
        @keydown=${(u) => this.selectOnKey(u, e)}
      >
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="name grow" title=${t.entity}>${o}</span>
        ${l ? c`<span class="badge" title="${l} problem(s)">${l}</span>` : d}
        ${r ? c`<span class="muted chip">${r.state}</span>` : d}
        ${a ? c`<span class="chip phase ${a.phase}" title=${this.voiceTitle(a)}>${a.phase}</span>
              <span class="muted chip">${a.value.toFixed(2)}</span>` : d}
        <div class="row" @click=${Qe}>
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
k.styles = [
  O,
  C`
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
      .blurb {
        margin: 0 0 12px;
      }
    `
];
W([
  p({ attribute: !1 })
], k.prototype, "hass", 2);
W([
  p({ attribute: !1 })
], k.prototype, "config", 2);
W([
  p({ attribute: !1 })
], k.prototype, "selection", 2);
W([
  p({ attribute: !1 })
], k.prototype, "errors", 2);
W([
  p({ attribute: !1 })
], k.prototype, "live", 2);
k = W([
  P("al-tree")
], k);
const et = (t) => t.split(",").map((e) => e.trim()).filter((e) => e.length > 0), J = (t) => (t ?? []).join(", "), pe = (t) => t == null || t === "" ? null : t;
function ms(t, e) {
  if (e != null)
    switch (t) {
      case "duration":
        return M(e);
      case "boolean":
        return e ? "true" : "false";
      default:
        return e;
    }
}
function fs(t, e) {
  if (e == null || e === "") return null;
  switch (t) {
    case "duration":
      return D(e);
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
function vs(t, e) {
  if (e == null) return "unset";
  switch (t) {
    case "duration":
      return R(e);
    case "boolean":
      return e ? "Yes" : "No";
    default:
      return String(e);
  }
}
var gs = Object.defineProperty, $s = Object.getOwnPropertyDescriptor, E = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? $s(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && gs(e, s, n), n;
};
const Ie = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
function bs(t, e) {
  return t.select?.options?.find((i) => i.value === e)?.label;
}
let y = class extends b {
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
    t.stopPropagation(), this.emit(fs(this.kind, t.detail?.value));
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
      const e = bs(this.selector, String(t));
      if (e !== void 0) return e;
    }
    return vs(this.kind, t);
  }
  render() {
    const t = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`;
    return c`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? Ie : this.selector}
          .label=${this.label}
          .value=${ms(this.kind, this.value)}
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
y.styles = [
  O,
  C`
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
E([
  p({ attribute: !1 })
], y.prototype, "hass", 2);
E([
  p()
], y.prototype, "label", 2);
E([
  p({ attribute: !1 })
], y.prototype, "selector", 2);
E([
  p({ attribute: !1 })
], y.prototype, "value", 2);
E([
  p({ attribute: !1 })
], y.prototype, "inherited", 2);
E([
  p({ attribute: "inherited-from" })
], y.prototype, "inheritedFrom", 2);
E([
  p()
], y.prototype, "kind", 2);
E([
  p()
], y.prototype, "error", 2);
y = E([
  P("al-override-field")
], y);
var ys = Object.defineProperty, _s = Object.getOwnPropertyDescriptor, ne = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? _s(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ys(e, s, n), n;
};
const ws = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, xs = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, Es = ["id", "name", "area", "mix", "null_handling", "gain"], As = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], Ss = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], ks = { number: { min: 0.1, step: 0.1, mode: "box" } }, Cs = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, Ps = (t, e) => [
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: As } } },
  ...t.mix === "mean" ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: Ss } } }] : [],
  ...e ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]
];
let I = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.computeLabel = (t) => ws[t.name] ?? t.name, this.computeHelper = (t) => xs[t.name] ?? "";
  }
  emitChange(t, e) {
    this.dispatchEvent(ie(t, e));
  }
  emitSelect(t) {
    this.dispatchEvent(lt(t));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const { config: e, path: s } = this;
    if (!e || !s) return;
    const i = le(e, s);
    if (!i) return;
    const n = t.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      name: pe(n.name),
      area: pe(n.area),
      mix: n.mix ?? i.mix,
      null_handling: n.null_handling ?? i.null_handling,
      gain: typeof n.gain == "number" ? n.gain : i.gain
    }, o = Es.find((l) => r[l] !== i[l]);
    o !== void 0 && this.emitChange(U(e, s, r), `${v(s)}:${o}`);
  }
  setField(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(U(s, [...i, t], e), `${v(i)}:${t}`);
  }
  onDelete() {
    const { config: t, path: e } = this;
    if (!t || !e) return;
    const s = le(t, e);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(Ne(t, e));
    const i = Ue(e);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length === 0)
      return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = le(t, e);
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = e.length === 2, n = be(this.errors, e), r = this.errors.filter((l) => l.path === v(e)), o = {
      id: s.id,
      name: s.name ?? "",
      mix: s.mix
    };
    return s.mix === "mean" && (o.null_handling = s.null_handling), s.area !== null && (o.area = s.area), i || (o.gain = s.gain), c`
      <ha-card header="Group">
        ${r.map((l) => c`<ha-alert alert-type="error">${l.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Ps(s, i)}
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
          .selector=${ks}
          .value=${s.max_value}
          .inherited=${t.defaults.max_value}
          .inheritedFrom=${"defaults"}
          .error=${n.max_value}
          @value-changed=${(l) => this.setField("max_value", l.detail.value)}
        ></al-override-field>
        <al-override-field
          .hass=${this.hass}
          label="Precision"
          kind="select"
          .selector=${Cs}
          .value=${s.precision === null ? null : String(s.precision)}
          .inherited=${String(t.defaults.precision)}
          .inheritedFrom=${"defaults"}
          .error=${n.precision}
          @value-changed=${(l) => this.setField("precision", l.detail.value === null ? null : Number(l.detail.value))}
        ></al-override-field>

        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
};
I.styles = [
  O,
  C`
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
ne([
  p({ attribute: !1 })
], I.prototype, "hass", 2);
ne([
  p({ attribute: !1 })
], I.prototype, "config", 2);
ne([
  p({ attribute: !1 })
], I.prototype, "path", 2);
ne([
  p({ attribute: !1 })
], I.prototype, "errors", 2);
I = ne([
  P("al-group-editor")
], I);
function dt(t, e = 0.25) {
  if (t.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
  const s = t.attack + t.decay + t.release, i = s > 0 ? s * e / (1 - e) : 1, n = s + i;
  let r = 0;
  const o = [{ x: 0, y: 0 }];
  return r += t.attack, o.push({ x: r / n, y: 1 }), r += t.decay, o.push({ x: r / n, y: t.sustain }), r += i, o.push({ x: r / n, y: t.sustain }), r += t.release, o.push({ x: r / n, y: 0 }), o;
}
const Os = (t) => Math.round(t * 100) / 100;
function Ls(t, e = 0.25) {
  const s = dt(t, e), i = (r) => ((s[r]?.x ?? 0) + (s[r + 1]?.x ?? 0)) / 2;
  if (t.impulse) {
    const r = [{ text: "impulse", x: 0 }];
    return t.release > 0 && r.push({ text: `R ${R(t.release)}`, x: i(1) }), r;
  }
  const n = [];
  return t.attack > 0 && n.push({ text: `A ${R(t.attack)}`, x: i(0) }), t.decay > 0 && n.push({ text: `D ${R(t.decay)}`, x: i(1) }), n.push({ text: `S ${Os(t.sustain)}`, x: i(2) }), t.release > 0 && n.push({ text: `R ${R(t.release)}`, x: i(3) }), n;
}
var Ts = Object.defineProperty, Rs = Object.getOwnPropertyDescriptor, ut = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Rs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Ts(e, s, n), n;
};
const te = 10, me = 190, Ms = 10, z = 58, Ds = 72, ce = (t) => te + t * (me - te), Ee = (t) => z - t * (z - Ms), X = (t) => String(Math.round(t * 10) / 10), Ae = (t, e) => `${X(t)},${X(e)}`, Ns = (t) => Math.min(me - 6, Math.max(te + 6, ce(t)));
let fe = class extends b {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const t = this.envelope;
    if (!t) return d;
    const e = dt(t), s = e[0], i = e[e.length - 1], n = e.map((a) => Ae(ce(a.x), Ee(a.y))).join(" "), r = `${Ae(ce(s.x), z)} ${n} ${Ae(ce(i.x), z)}`, o = Ls(t), l = t.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${l}>
        <title>${l}</title>
        <line class="grid" x1=${te} y1=${z} x2=${me} y2=${z}></line>
        ${t.impulse ? d : Je`<line
              class="grid"
              x1=${te}
              y1=${X(Ee(t.sustain))}
              x2=${me}
              y2=${X(Ee(t.sustain))}
            ></line>`}
        <polygon class="area" points=${r}></polygon>
        <polyline class="curve" points=${n}></polyline>
        ${o.map(
      (a) => Je`<text class="caption" x=${X(Ns(a.x))} y=${Ds} text-anchor="middle">${a.text}</text>`
    )}
      </svg>
    `;
  }
};
fe.styles = [
  O,
  C`
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
ut([
  p({ attribute: !1 })
], fe.prototype, "envelope", 2);
fe = ut([
  P("al-envelope-sketch")
], fe);
var Us = Object.defineProperty, Is = Object.getOwnPropertyDescriptor, H = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Is(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Us(e, s, n), n;
};
const Hs = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, Fs = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, js = ["entity", "gain", "key", "envelope"], oe = { duration: { enable_millisecond: !0 } }, zs = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Bs = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Gs = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Vs = "(unknown preset — using built-in defaults)", Ws = [
  { name: "attack", label: "Attack", kind: "duration", selector: oe },
  { name: "decay", label: "Decay", kind: "duration", selector: oe },
  { name: "sustain", label: "Sustain", kind: "number", selector: zs },
  { name: "release", label: "Release", kind: "duration", selector: oe },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: Ie },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Bs },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Gs },
  { name: "debounce", label: "Debounce", kind: "duration", selector: oe }
];
let w = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.toText = null, this.computeLabel = (t) => Hs[t.name] ?? t.name, this.computeHelper = (t) => Fs[t.name] ?? "";
  }
  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  willUpdate(t) {
    if (t.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !t.has("config")) return;
    const { config: e, path: s } = this, i = e && s ? xe(e, s) : void 0;
    i && J(i.to) !== J(et(this.toText)) && (this.toText = null);
  }
  emitChange(t, e) {
    this.dispatchEvent(ie(t, e));
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
    const i = xe(e, s);
    if (!i) return;
    const n = t.detail?.value ?? {}, r = String(n.to ?? "");
    this.toText = r;
    const o = {
      ...i,
      entity: String(n.entity ?? ""),
      to: et(r),
      gain: typeof n.gain == "number" ? n.gain : i.gain,
      key: pe(n.key),
      envelope: pe(n.envelope)
    }, l = J(o.to) !== J(i.to) ? "to" : js.find((a) => o[a] !== i[a]);
    l !== void 0 && this.emitChange(U(e, s, o), `${v(s)}:${l}`);
  }
  setOverride(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(U(s, [...i, t], e), `${v(i)}:${t}`);
  }
  /**
   * How long this voice stays in its current phase, measured against the payload's own
   * `now` so a browser clock that disagrees with the server does not skew the countdown.
   */
  countdown(t) {
    const e = this.live?.now;
    return t === null || e === void 0 ? null : R(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
  }
  /** Where the effective value comes from when the stimulus does not override it. */
  sourceOf(t, e, s) {
    const i = ht(t, e.envelope);
    return i ? i[s] === null || i[s] === void 0 ? "defaults" : e.envelope ?? t.defaults.envelope : Vs;
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length < 3)
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = xe(t, e);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = le(t, Ue(e)), n = be(this.errors, e), r = this.errors.filter((h) => h.path === v(e)), o = hs(t, s), l = {
      entity: s.entity,
      to: this.toText ?? J(s.to),
      gain: s.gain,
      key: s.key ?? "",
      envelope: s.envelope ?? ""
    }, a = this.live?.voices[i?.id ?? ""]?.find(
      (h) => h.label === (s.key ?? s.entity)
    ), u = this.countdown(a?.phase_ends ?? null);
    return c`
      <ha-card header="Stimulus">
        ${r.map((h) => c`<ha-alert alert-type="error">${h.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${l}
          .schema=${this.schemaFor(t)}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${a ? c`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip phase ${a.phase}">${a.phase}</span>
              <span class="chip">${a.value.toFixed(2)}</span>
              ${u !== null ? c`<span class="muted chip">ends in ${u}</span>` : d}
              <span class="dot ${a.gate ? "gated" : ""}" title=${a.gate ? "Gate open" : "Gate closed"}></span>
            </div>` : d}

        <h3>Envelope overrides</h3>
        ${Ws.map(
      (h) => c`<al-override-field
            .hass=${this.hass}
            .label=${h.label}
            .kind=${h.kind}
            .selector=${h.selector}
            .value=${s[h.name]}
            .inherited=${o[h.name]}
            .inheritedFrom=${this.sourceOf(t, s, h.name)}
            .error=${n[h.name]}
            @value-changed=${(m) => this.setOverride(h.name, m.detail.value)}
          ></al-override-field>`
    )}
        <h3>Envelope shape</h3>
        <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
      </ha-card>
    `;
  }
};
w.styles = [
  O,
  C`
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
H([
  p({ attribute: !1 })
], w.prototype, "hass", 2);
H([
  p({ attribute: !1 })
], w.prototype, "config", 2);
H([
  p({ attribute: !1 })
], w.prototype, "path", 2);
H([
  p({ attribute: !1 })
], w.prototype, "errors", 2);
H([
  p({ attribute: !1 })
], w.prototype, "live", 2);
H([
  g()
], w.prototype, "toText", 2);
w = H([
  P("al-stimulus-editor")
], w);
var qs = Object.defineProperty, Ks = Object.getOwnPropertyDescriptor, F = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ks(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && qs(e, s, n), n;
};
const Js = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, Ys = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the sustain level back to zero.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, Xs = ["id", "attack", "decay", "sustain", "release", "impulse"], he = { duration: { enable_millisecond: !0 } }, Zs = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Qs = { boolean: {} }, ei = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, ti = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, si = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: he },
  { name: "decay", selector: he },
  { name: "sustain", selector: Zs },
  { name: "release", selector: he },
  { name: "impulse", selector: Qs }
], ii = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: ei },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: ti },
  { name: "debounce", label: "Debounce", kind: "duration", selector: he }
];
let x = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (t) => Js[t.name] ?? t.name, this.computeHelper = (t) => Ys[t.name] ?? "";
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
    this.dispatchEvent(ie(t, e));
  }
  selectPreset(t) {
    this.selected = t, this.blocked = null;
  }
  addPreset() {
    const t = this.config;
    if (!t) return;
    this.blocked = null;
    const e = t.envelopes.length;
    this.emitChange(ke(t, ["envelopes"], e, es(os(t, "preset")))), this.selected = e;
  }
  removePreset(t) {
    const e = this.config;
    if (!e) return;
    const s = e.envelopes[t];
    if (!s) return;
    const i = as(e, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = t, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(Ne(e, ["envelopes", t])), this.selected >= t && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const e = this.config, s = this.selected, i = e?.envelopes[s];
    if (!e || !i) return;
    const n = t.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      attack: D(n.attack) ?? i.attack,
      decay: D(n.decay) ?? i.decay,
      sustain: typeof n.sustain == "number" ? n.sustain : i.sustain,
      release: D(n.release) ?? i.release,
      impulse: typeof n.impulse == "boolean" ? n.impulse : i.impulse
    }, o = Xs.find((u) => r[u] !== i[u]);
    if (o === void 0) return;
    const l = ["envelopes", s], a = U(ls(e, s, r.id), l, r);
    this.emitChange(a, `${v(l)}:${o}`);
  }
  setOverride(t, e) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const n = ["envelopes", i, t];
    this.emitChange(U(s, n, e), v(n));
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
      const n = Ce(this.errors, ["envelopes", i]);
      return c`<div class="row preset ${this.selected === i ? "selected" : ""}">
            <button type="button" class="link grow" title="Edit this preset" @click=${() => this.selectPreset(i)}>
              ${s.id || "(unnamed preset)"}
            </button>
            ${n ? c`<span class="badge" title="${n} problem(s)">${n}</span>` : d}
            <ha-icon-button label="Delete preset" title="Delete preset" @click=${() => this.removePreset(i)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>`;
    })}
        ${t.envelopes.length === 0 ? c`<p class="muted">No presets yet.</p>` : d}
        ${e ? c`<ha-alert alert-type="warning">${ri(e)}</ha-alert>` : d}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(t) {
    const e = this.selected, s = t.envelopes[e];
    if (!s) return c`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", e], n = be(this.errors, i), r = this.errors.filter((a) => a.path === v(i)), o = {
      id: s.id,
      attack: M(s.attack),
      decay: M(s.decay),
      sustain: s.sustain,
      release: M(s.release),
      impulse: s.impulse
    }, l = ni(t, e, s);
    return c`
      <ha-card header="Envelope preset">
        ${r.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        ${l ? c`<ha-alert alert-type="warning">${l}</ha-alert>` : d}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${si}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${ii.map(
      (a) => c`<al-override-field
            .hass=${this.hass}
            .label=${a.label}
            .kind=${a.kind}
            .selector=${a.kind === "boolean" ? Ie : a.selector}
            .value=${s[a.name]}
            .inherited=${t.defaults[a.name]}
            .inheritedFrom=${"defaults"}
            .error=${n[a.name]}
            @value-changed=${(u) => this.setOverride(a.name, u.detail.value)}
          ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
x.styles = [
  O,
  C`
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
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 18px;
      }
      .sketch {
        margin-top: 8px;
      }
    `
];
F([
  p({ attribute: !1 })
], x.prototype, "hass", 2);
F([
  p({ attribute: !1 })
], x.prototype, "config", 2);
F([
  p({ attribute: !1 })
], x.prototype, "errors", 2);
F([
  p({ type: Boolean })
], x.prototype, "narrow", 2);
F([
  g()
], x.prototype, "selected", 2);
F([
  g()
], x.prototype, "blocked", 2);
x = F([
  P("al-envelopes")
], x);
function ni(t, e, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : t.envelopes.some((i, n) => n !== e && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function ri(t) {
  const e = [];
  return t.defaults && e.push("the defaults"), t.groups.length > 0 && e.push(`group${t.groups.length > 1 ? "s" : ""} ${t.groups.join(", ")}`), `"${t.id}" is still used by ${e.join(" and ")}. Point those at another preset first.`;
}
var oi = Object.defineProperty, ai = Object.getOwnPropertyDescriptor, ye = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ai(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && oi(e, s, n), n;
};
const li = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, ci = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Whether a note already sounding can be retriggered, or only one in its release.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, hi = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], Se = { duration: { enable_millisecond: !0 } }, di = { number: { min: 0.1, step: 0.1, mode: "box" } }, ui = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, pi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, mi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
};
let V = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (t) => li[t.name] ?? t.name, this.computeHelper = (t) => ci[t.name] ?? "";
  }
  schemaFor(t) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: t.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: di },
      { name: "precision", selector: ui },
      { name: "unavailable", selector: mi },
      { name: "retrigger", selector: pi },
      { name: "debounce", selector: Se },
      { name: "safety_refresh", selector: Se },
      { name: "min_wake_interval", selector: Se }
    ];
  }
  onFormChanged(t) {
    t.stopPropagation();
    const e = this.config;
    if (!e) return;
    const s = e.defaults, i = t.detail?.value ?? {}, n = Number(i.precision), r = {
      envelope: typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : s.envelope,
      max_value: typeof i.max_value == "number" ? i.max_value : s.max_value,
      precision: Number.isFinite(n) ? n : s.precision,
      unavailable: i.unavailable ?? s.unavailable,
      retrigger: i.retrigger ?? s.retrigger,
      debounce: D(i.debounce) ?? s.debounce,
      safety_refresh: D(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: D(i.min_wake_interval) ?? s.min_wake_interval
    }, o = hi.find((l) => r[l] !== s[l]);
    o !== void 0 && this.emitChange(U(e, ["defaults"], r), `defaults:${o}`);
  }
  emitChange(t, e) {
    this.dispatchEvent(ie(t, e));
  }
  render() {
    const t = this.config;
    if (!t) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const e = t.defaults, s = be(this.errors, ["defaults"]), i = this.errors.filter((r) => r.path === "defaults"), n = {
      envelope: e.envelope,
      max_value: e.max_value,
      precision: String(e.precision),
      unavailable: e.unavailable,
      retrigger: e.retrigger,
      debounce: M(e.debounce),
      safety_refresh: M(e.safety_refresh),
      min_wake_interval: M(e.min_wake_interval)
    };
    return c`
      <div class="pad">
        <ha-card header="Defaults">
          ${i.map((r) => c`<ha-alert alert-type="error">${r.message}</ha-alert>`)}
          <ha-form
            .hass=${this.hass}
            .data=${n}
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
V.styles = [
  O,
  C`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
ye([
  p({ attribute: !1 })
], V.prototype, "hass", 2);
ye([
  p({ attribute: !1 })
], V.prototype, "config", 2);
ye([
  p({ attribute: !1 })
], V.prototype, "errors", 2);
V = ye([
  P("al-defaults")
], V);
