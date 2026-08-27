const Fe = globalThis, _t = Fe.ShadowRoot && (Fe.ShadyCSS === void 0 || Fe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, St = /* @__PURE__ */ Symbol(), Dt = /* @__PURE__ */ new WeakMap();
let gs = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== St) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (_t && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = Dt.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Dt.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const hi = (e) => new gs(typeof e == "string" ? e : e + "", void 0, St), S = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + e[r + 1], e[0]);
  return new gs(s, e, St);
}, di = (e, t) => {
  if (_t) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), n = Fe.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, e.appendChild(i);
  }
}, Ut = _t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return hi(s);
})(e) : e;
const { is: ui, defineProperty: pi, getOwnPropertyDescriptor: mi, getOwnPropertyNames: fi, getOwnPropertySymbols: gi, getPrototypeOf: vi } = Object, Xe = globalThis, Ft = Xe.trustedTypes, $i = Ft ? Ft.emptyScript : "", bi = Xe.reactiveElementPolyfillSupport, we = (e, t) => e, ze = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? $i : null;
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
} }, Et = (e, t) => !ui(e, t), jt = { attribute: !0, type: String, converter: ze, reflect: !1, useDefault: !1, hasChanged: Et };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), Xe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ue = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = jt) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(t, i, s);
      n !== void 0 && pi(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: n, set: r } = mi(this.prototype, t) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: n, set(o) {
      const a = n?.call(this);
      r?.call(this, o), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? jt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(we("elementProperties"))) return;
    const t = vi(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(we("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(we("properties"))) {
      const s = this.properties, i = [...fi(s), ...gi(s)];
      for (const n of i) this.createProperty(n, s[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, n] of s) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const n = this._$Eu(s, i);
      n !== void 0 && this._$Eh.set(n, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const n of i) s.unshift(Ut(n));
    } else t !== void 0 && s.push(Ut(t));
    return s;
  }
  static _$Eu(t, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const i of s.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return di(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, i) {
    this._$AK(t, i);
  }
  _$ET(t, s) {
    const i = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : ze).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : ze;
      this._$Em = n;
      const a = o.fromAttribute(s, r.type);
      this[n] = a ?? this._$Ej?.get(n) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, n = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? Et)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: n, wrapped: r }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? s ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), n === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [n, r] of this._$Ep) this[n] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, r] of i) {
        const { wrapped: o } = r, a = this[n];
        o !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, r, a);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
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
ue.elementStyles = [], ue.shadowRootOptions = { mode: "open" }, ue[we("elementProperties")] = /* @__PURE__ */ new Map(), ue[we("finalized")] = /* @__PURE__ */ new Map(), bi?.({ ReactiveElement: ue }), (Xe.reactiveElementVersions ??= []).push("2.1.2");
const kt = globalThis, Ht = (e) => e, Ge = kt.trustedTypes, zt = Ge ? Ge.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, vs = "$lit$", W = `lit$${Math.random().toFixed(9).slice(2)}$`, $s = "?" + W, yi = `<${$s}>`, ie = document, Se = () => ie.createComment(""), Ee = (e) => e === null || typeof e != "object" && typeof e != "function", At = Array.isArray, xi = (e) => At(e) || typeof e?.[Symbol.iterator] == "function", nt = `[ 	
\f\r]`, xe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Gt = /-->/g, Vt = />/g, J = RegExp(`>|${nt}(?:([^\\s"'>=/]+)(${nt}*=${nt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Bt = /'/g, Wt = /"/g, bs = /^(?:script|style|textarea|title)$/i, ys = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), c = ys(1), A = ys(2), ne = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), qt = /* @__PURE__ */ new WeakMap(), Z = ie.createTreeWalker(ie, 129);
function xs(e, t) {
  if (!At(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return zt !== void 0 ? zt.createHTML(t) : t;
}
const wi = (e, t) => {
  const s = e.length - 1, i = [];
  let n, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = xe;
  for (let a = 0; a < s; a++) {
    const l = e[a];
    let d, p, m = -1, P = 0;
    for (; P < l.length && (o.lastIndex = P, p = o.exec(l), p !== null); ) P = o.lastIndex, o === xe ? p[1] === "!--" ? o = Gt : p[1] !== void 0 ? o = Vt : p[2] !== void 0 ? (bs.test(p[2]) && (n = RegExp("</" + p[2], "g")), o = J) : p[3] !== void 0 && (o = J) : o === J ? p[0] === ">" ? (o = n ?? xe, m = -1) : p[1] === void 0 ? m = -2 : (m = o.lastIndex - p[2].length, d = p[1], o = p[3] === void 0 ? J : p[3] === '"' ? Wt : Bt) : o === Wt || o === Bt ? o = J : o === Gt || o === Vt ? o = xe : (o = J, n = void 0);
    const U = o === J && e[a + 1].startsWith("/>") ? " " : "";
    r += o === xe ? l + yi : m >= 0 ? (i.push(d), l.slice(0, m) + vs + l.slice(m) + W + U) : l + W + (m === -2 ? a : U);
  }
  return [xs(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class ke {
  constructor({ strings: t, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, l = this.parts, [d, p] = wi(t, s);
    if (this.el = ke.createElement(d, i), Z.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (n = Z.nextNode()) !== null && l.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const m of n.getAttributeNames()) if (m.endsWith(vs)) {
          const P = p[o++], U = n.getAttribute(m).split(W), ce = /([.?@])?(.*)/.exec(P);
          l.push({ type: 1, index: r, name: ce[2], strings: U, ctor: ce[1] === "." ? Si : ce[1] === "?" ? Ei : ce[1] === "@" ? ki : Ye }), n.removeAttribute(m);
        } else m.startsWith(W) && (l.push({ type: 6, index: r }), n.removeAttribute(m));
        if (bs.test(n.tagName)) {
          const m = n.textContent.split(W), P = m.length - 1;
          if (P > 0) {
            n.textContent = Ge ? Ge.emptyScript : "";
            for (let U = 0; U < P; U++) n.append(m[U], Se()), Z.nextNode(), l.push({ type: 2, index: ++r });
            n.append(m[P], Se());
          }
        }
      } else if (n.nodeType === 8) if (n.data === $s) l.push({ type: 2, index: r });
      else {
        let m = -1;
        for (; (m = n.data.indexOf(W, m + 1)) !== -1; ) l.push({ type: 7, index: r }), m += W.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const i = ie.createElement("template");
    return i.innerHTML = t, i;
  }
}
function ge(e, t, s = e, i) {
  if (t === ne) return t;
  let n = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = Ee(t) ? void 0 : t._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(e), n._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = n : s._$Cl = n), n !== void 0 && (t = ge(e, n._$AS(e, t.values), n, i)), t;
}
class _i {
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
    const { el: { content: s }, parts: i } = this._$AD, n = (t?.creationScope ?? ie).importNode(s, !0);
    Z.currentNode = n;
    let r = Z.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let d;
        l.type === 2 ? d = new Le(r, r.nextSibling, this, t) : l.type === 1 ? d = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (d = new Ai(r, this, t)), this._$AV.push(d), l = i[++a];
      }
      o !== l?.index && (r = Z.nextNode(), o++);
    }
    return Z.currentNode = ie, n;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class Le {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, i, n) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = n, this._$Cv = n?.isConnected ?? !0;
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
    t = ge(this, t, s), Ee(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== ne && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : xi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && Ee(this._$AH) ? this._$AA.nextSibling.data = t : this.T(ie.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = ke.createElement(xs(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(s);
    else {
      const r = new _i(n, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = qt.get(t.strings);
    return s === void 0 && qt.set(t.strings, s = new ke(t)), s;
  }
  k(t) {
    At(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const r of t) n === s.length ? s.push(i = new Le(this.O(Se()), this.O(Se()), this, this.options)) : i = s[n], i._$AI(r), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = Ht(t).nextSibling;
      Ht(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Ye {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, n, r) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = s, this._$AM = n, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = u;
  }
  _$AI(t, s = this, i, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = ge(this, t, s, 0), o = !Ee(t) || t !== this._$AH && t !== ne, o && (this._$AH = t);
    else {
      const a = t;
      let l, d;
      for (t = r[0], l = 0; l < r.length - 1; l++) d = ge(this, a[i + l], s, l), d === ne && (d = this._$AH[l]), o ||= !Ee(d) || d !== this._$AH[l], d === u ? t = u : t !== u && (t += (d ?? "") + r[l + 1]), this._$AH[l] = d;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Si extends Ye {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Ei extends Ye {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class ki extends Ye {
  constructor(t, s, i, n, r) {
    super(t, s, i, n, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = ge(this, t, s, 0) ?? u) === ne) return;
    const i = this._$AH, n = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== u && (i === u || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ai {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ge(this, t);
  }
}
const Ci = kt.litHtmlPolyfillSupport;
Ci?.(ke, Le), (kt.litHtmlVersions ??= []).push("3.3.3");
const Ti = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = n = new Le(t.insertBefore(Se(), r), r, void 0, s ?? {});
  }
  return n._$AI(e), n;
};
const Ct = globalThis;
let $ = class extends ue {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ti(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ne;
  }
};
$._$litElement$ = !0, $.finalized = !0, Ct.litElementHydrateSupport?.({ LitElement: $ });
const Pi = Ct.litElementPolyfillSupport;
Pi?.({ LitElement: $ });
(Ct.litElementVersions ??= []).push("4.2.2");
const E = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
const Li = { attribute: !0, type: String, converter: ze, reflect: !1, hasChanged: Et }, Oi = (e = Li, t, s) => {
  const { kind: i, metadata: n } = s;
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(s.name, e), i === "accessor") {
    const { name: o } = s;
    return { set(a) {
      const l = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, l, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, e, a), a;
    } };
  }
  if (i === "setter") {
    const { name: o } = s;
    return function(a) {
      const l = this[o];
      t.call(this, a), this.requestUpdate(o, l, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function h(e) {
  return (t, s) => typeof s == "object" ? Oi(e, t, s) : ((i, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(e, t, s);
}
function g(e) {
  return h({ ...e, state: !0, attribute: !1 });
}
const ws = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Mi = (e) => e.callWS({ type: "activity_levels/config/get" }).then((t) => t.config), Ri = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(ws);
async function Ii(e, t) {
  try {
    return ws(await e.callWS({ type: "activity_levels/config/save", config: t }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const Ni = (e) => e.callWS({ type: "activity_levels/state" }), Di = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), Ui = (e) => e.callWS({ type: "activity_levels/profile/get" }), Fi = (e, t = !1) => e.callWS({ type: "activity_levels/profile/rebuild", force: t }), ji = (e, t, s = 50) => e.callWS({
  type: "activity_levels/simulation/log",
  limit: s
}), Hi = (e, t, s) => e.callWS({ type: "activity_levels/level/set", group_id: t, value: s }).then((i) => i.value), zi = (e, t, s) => e.callWS({ type: "activity_levels/mute", group_id: t, muted: s }).then((i) => i.muted), Gi = (e, t) => e.callWS({ type: "activity_levels/reset", group_id: t }).then(() => {
}), Vi = (e, t, s, i) => e.callService(t, s, i), Je = 14, Tt = (e) => `switch.${e}_presence_simulation`, _s = (e) => `sensor.${e}_expected_activity`, Bi = (e) => `sensor.${e}_activity_anomaly`, rt = [
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
], Wi = 2500, qi = 8e3;
function Ki(e) {
  let t;
  return { promise: new Promise((i) => {
    t = setTimeout(i, e);
  }), cancel: () => clearTimeout(t) };
}
async function Kt(e, t, s) {
  const i = Ki(t);
  try {
    return await Promise.race([e, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function Xi() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function Yi(e = qi, t = Wi) {
  if (rt.every((n) => customElements.get(n))) return { ok: !0, missing: [] };
  await Kt(Xi(), t, void 0);
  const s = await Promise.all(
    rt.map(
      (n) => Kt(
        customElements.whenDefined(n).then(() => !0),
        e,
        !1
      )
    )
  ), i = rt.filter((n, r) => !s[r]);
  return { ok: i.length === 0, missing: [...i] };
}
function Ze(e, t) {
  let s = e;
  for (const i of t) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function Xt(e) {
  return Array.isArray(e) ? [...e] : { ...e };
}
function Qe(e, t, s) {
  if (t.length === 0) throw new Error("empty path");
  const i = Xt(e);
  let n = i;
  for (let r = 0; r < t.length - 1; r++) {
    const o = t[r], a = Xt(n[o]);
    n[o] = a, n = a;
  }
  return s(n, t[t.length - 1]), i;
}
function C(e, t, s) {
  return Qe(e, t, (i, n) => {
    i[n] = s;
  });
}
function Pt(e, t) {
  return Qe(e, t, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function gt(e, t, s, i) {
  return Qe(e, [...t, s], (n) => {
    n.splice(s, 0, i);
  });
}
function Ji(e, t, s, i) {
  return Qe(e, [...t, s], (n) => {
    const r = n, [o] = r.splice(s, 1);
    r.splice(i, 0, o);
  });
}
const Zi = 1e3;
class Qi {
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
    const i = Date.now();
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < Zi || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const en = (e) => ({
  id: e,
  name: null,
  area: null,
  mix: "sum",
  null_handling: "zero",
  max_value: null,
  precision: null,
  gain: 1,
  adjacent: [],
  exit: !1,
  presence: vt(),
  stimuli: [],
  children: []
}), tn = "presence", vt = () => ({
  gain: 1,
  envelope: null,
  attack: null,
  decay: null,
  sustain: null,
  release: null,
  impulse: null,
  retrigger: null,
  unavailable: null,
  debounce: null
}), Ae = (e) => typeof e == "string" ? e : e.id, sn = {
  enabled: !1,
  devices: [],
  envelope: null,
  threshold: 0.6,
  stay: 0.9,
  escape: 1e-3,
  scale: 3,
  floor: 0.05,
  stuck_after: 60,
  scanner_areas: {}
}, ot = (e) => ({
  ...sn,
  ...e.presence ?? {}
}), nn = (e) => ({
  id: e,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), rn = (e) => ({
  entity: e,
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
}), Ve = (e, t) => t.precision ?? e.defaults.precision;
function et(e, t) {
  return e.toFixed(Math.min(100, Math.max(0, Math.trunc(t))));
}
function Oe(e) {
  const t = /* @__PURE__ */ new Set(), s = (i) => {
    t.add(i.id), i.children.forEach(s);
  };
  return e.groups.forEach(s), t;
}
function on(e) {
  const t = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), n = Oe(e), r = (o) => {
    for (const a of o.adjacent ?? []) {
      const l = Ae(a);
      l === o.id || !n.has(l) || (t.add(o.id), s.add(l));
    }
    o.exit && i.add(o.id), o.children.forEach(r);
  };
  return e.groups.forEach(r), /* @__PURE__ */ new Set([...t, ...s, ...i]);
}
function an(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const ln = (e) => new Set(e.envelopes.map((t) => t.id));
function Ss(e, t) {
  const s = an(t);
  if (!e.has(s)) return s;
  let i = 2;
  for (; e.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const cn = (e, t) => Ss(Oe(e), t), hn = (e, t) => Ss(ln(e), t);
function dn(e, t) {
  const s = [], i = (n) => {
    n.stimuli.some((r) => r.envelope === t) && s.push(n.id), n.children.forEach(i);
  };
  return e.groups.forEach(i), { defaults: e.defaults.envelope === t, groups: s };
}
function un(e, t, s) {
  const i = e.envelopes[t];
  if (!i || i.id === s) return e;
  const n = i.id, r = e.envelopes.map((a, l) => l === t ? { ...a, id: s } : a);
  if (e.envelopes.some((a, l) => l !== t && a.id === n)) return { ...e, envelopes: r };
  const o = (a) => ({
    ...a,
    stimuli: a.stimuli.map((l) => l.envelope === n ? { ...l, envelope: s } : l),
    children: a.children.map(o)
  });
  return {
    ...e,
    defaults: e.defaults.envelope === n ? { ...e.defaults, envelope: s } : e.defaults,
    envelopes: r,
    groups: e.groups.map(o)
  };
}
const M = (e, t) => Ze(e, t), fe = (e, t) => Ze(e, t), pn = (e) => e.slice(0, -1), Me = (e) => e.slice(0, -2), Es = (e) => e[e.length - 2] === "stimuli" ? Me(e) : e, ks = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function $t(e, t) {
  const s = ks(e, t.envelope), i = e.defaults, n = (r, o, a) => r ?? o ?? a;
  return {
    attack: n(t.attack, s?.attack, 0),
    decay: n(t.decay, s?.decay, 0),
    sustain: n(t.sustain, s?.sustain, 1),
    release: n(t.release, s?.release, 1800),
    impulse: n(t.impulse, s?.impulse, !1),
    retrigger: n(t.retrigger, s?.retrigger, i.retrigger),
    unavailable: n(t.unavailable, s?.unavailable, i.unavailable),
    debounce: n(t.debounce, s?.debounce, i.debounce)
  };
}
const As = "activity_levels.mixer.expanded", mn = (e, t) => e.length === t.length && e.every((s, i) => s === t[i]), Cs = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function fn(e) {
  return { expanded: new Set(e.groups.map((t) => t.id)), selection: Cs(e) };
}
function bt(e, t) {
  const s = [], i = (n, r, o) => {
    n.forEach((a, l) => {
      const d = [...r, l], p = a.children.length > 0, m = p && t.expanded.has(a.id);
      s.push({ path: d, id: a.id, depth: o, hasChildren: p, expanded: m }), m && i(a.children, [...d, "children"], o + 1);
    });
  };
  return i(e.groups, ["groups"], 0), s;
}
function Yt(e, t) {
  switch (t.type) {
    case "toggle": {
      const s = new Set(e.expanded);
      return s.delete(t.id) || s.add(t.id), { ...e, expanded: s };
    }
    case "select":
      return { ...e, selection: t.path };
    case "arrow": {
      const s = bt(t.config, e);
      if (s.length === 0) return e;
      const i = e.selection, n = i === null ? -1 : s.findIndex((a) => mn(a.path, i)), o = (((n === -1 && t.delta < 0 ? s.length : n) + t.delta) % s.length + s.length) % s.length;
      return { ...e, selection: s[o].path };
    }
    case "home":
    case "end": {
      const s = bt(t.config, e);
      return s.length === 0 ? e : { ...e, selection: (t.type === "home" ? s[0] : s[s.length - 1]).path };
    }
    case "sync": {
      const { config: s } = t, i = Oe(s), n = [...e.expanded].filter((a) => i.has(a)), r = n.length === e.expanded.size ? e.expanded : new Set(n), o = e.selection !== null && Ze(s, e.selection) !== void 0 ? e.selection : Cs(s);
      return { expanded: r, selection: o };
    }
  }
}
function gn(e, t, s) {
  if (s === null) return t;
  const i = s[s.length - 2] === "stimuli" ? s.slice(0, -2) : s, n = new Set(t);
  let r = !1;
  for (let o = 2; o + 2 <= i.length; o += 2) {
    const a = Ze(e, i.slice(0, o));
    if (a === void 0 || typeof a.id != "string") break;
    n.has(a.id) || (n.add(a.id), r = !0);
  }
  return r ? n : t;
}
function vn(e) {
  let t;
  try {
    t = localStorage.getItem(As);
  } catch {
    return null;
  }
  if (t === null) return null;
  try {
    const s = JSON.parse(t);
    if (!Array.isArray(s)) return null;
    const i = Oe(e);
    return new Set(s.filter((n) => typeof n == "string" && i.has(n)));
  } catch {
    return null;
  }
}
function Jt(e) {
  try {
    localStorage.setItem(As, JSON.stringify([...e]));
  } catch {
  }
}
function $n(e) {
  const t = fn(e), s = vn(e);
  return s === null ? t : { ...t, expanded: s };
}
async function bn(e, t) {
  try {
    const s = await t.validate(e);
    if (!s.ok)
      return {
        errors: s.errors,
        banner: { kind: "error", text: `${s.errors.length} problem(s) to fix before saving.` },
        reload: !1
      };
    const i = await t.save(e);
    return i.ok ? { errors: [], banner: { kind: "info", text: "Saved. Activity Levels is reloading." }, reload: !0 } : {
      errors: i.errors,
      banner: { kind: "error", text: i.errors[0]?.message ?? "Save failed" },
      reload: !1
    };
  } catch (s) {
    return { errors: null, banner: { kind: "error", text: `Save failed: ${s instanceof Error ? s.message : String(s)}` }, reload: !1 };
  }
}
const O = S`
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
var yn = Object.defineProperty, xn = Object.getOwnPropertyDescriptor, _ = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? xn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && yn(t, s, n), n;
};
const de = ["mixer", "groups", "envelopes", "defaults", "patterns"], wn = 2e3, _n = 1e4, Sn = 5 * 6e4, En = 1500, Zt = "activity_levels.timeline", kn = ["24h", "7d", "30d"], An = ["off", "24h", "7d"], Qt = { range: "7d", horizon: "24h", showChannels: !0, showLights: !0 };
function Cn(e) {
  if (e === null) return null;
  const t = JSON.parse(e);
  return !kn.includes(t.range) || !An.includes(t.horizon) ? null : {
    range: t.range,
    horizon: t.horizon,
    showChannels: t.showChannels !== !1,
    showLights: t.showLights !== !1
  };
}
let y = class extends $ {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "mixer", this.selection = null, this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = Qt, this.tabFocus = 0, this.liveSeq = 0, this.profileAt = 0, this.simStatesMemo = null, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
      e.structural && (this.errors = []), this.setConfig(e.detail, e.coalesceKey);
    }, this.onNav = (e) => {
      const t = Yt(this.nav, e.detail);
      t.expanded !== this.nav.expanded && Jt(t.expanded), this.nav = t, this.selection = t.selection;
    }, this.onLiveRefresh = () => {
      this.pollLive();
    }, this.onRebuild = async (e) => {
      try {
        const { rebuilt: t } = await Fi(this.hass, e.detail?.force === !0);
        this.banner = t ? { kind: "info", text: "Profile rebuilt." } : { kind: "warning", text: "Rebuild skipped (external profile)." }, await this.refreshProfile(!0);
      } catch (t) {
        this.banner = { kind: "error", text: `Could not rebuild the profile: ${t.message}` };
      }
    }, this.onSimToggle = async (e) => {
      const { gid: t, on: s } = e.detail;
      try {
        await Vi(this.hass, "switch", s ? "turn_on" : "turn_off", { entity_id: Tt(t) });
      } catch (i) {
        this.banner = {
          kind: "error",
          text: `Could not ${s ? "start" : "stop"} the simulation for ${t}: ${i.message}`
        };
      }
    }, this.onTimelineRange = (e) => {
      this.timeline = e.detail;
      try {
        localStorage.setItem(Zt, JSON.stringify(e.detail));
      } catch {
      }
    }, this.onTabsKeydown = (e) => {
      const t = de.length - 1;
      switch (e.key) {
        case "ArrowRight":
          this.focusTab((this.tabFocus + 1) % de.length);
          break;
        case "ArrowLeft":
          this.focusTab((this.tabFocus + t) % de.length);
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
  async connectedCallback() {
    super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
    const { ok: e, missing: t } = await Yi();
    this.missing = e ? [] : t, await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer();
  }
  async load() {
    try {
      const e = await Mi(this.hass);
      this.draft = new Qi(e), this.nav = $n(e), this.selection = this.nav.selection, this.errors = [], this.banner = null;
    } catch (e) {
      this.banner = { kind: "error", text: `Could not load configuration: ${e.message}` };
    }
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
    const e = this.draft?.config;
    if (!e) return;
    const t = this.selection, s = Yt({ ...this.nav, selection: t }, { type: "sync", config: e });
    this.nav = t === null ? { ...s, selection: null } : s, this.selection = this.nav.selection !== null && this.nav.selection.length > 0 ? this.nav.selection : null;
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
    const s = gn(t, this.nav.expanded, e);
    s !== this.nav.expanded && Jt(s), this.nav = { expanded: s, selection: e };
  }
  async save() {
    const e = this.draft;
    if (e) {
      this.busy = !0, this.updatePolling();
      try {
        const t = await bn(e.config, {
          validate: (s) => Ri(this.hass, s),
          save: (s) => Ii(this.hass, s)
        });
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, En)), await this.load());
      } finally {
        this.busy = !1, this.updatePolling();
      }
    }
  }
  discard() {
    this.draft && (this.draft.reset(this.draft.original), this.syncNav(), this.errors = [], this.banner = null, this.requestUpdate());
  }
  undo() {
    this.draft?.undo(), this.syncNav(), this.requestUpdate();
  }
  redo() {
    this.draft?.redo(), this.syncNav(), this.requestUpdate();
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
    }, wn));
  }
  /** The simulation log moves at the pace of light switches, so it gets its own slower timer. */
  updateSimPolling(e) {
    if (!(this.patternsVisible && e)) {
      this.clearSimTimer();
      return;
    }
    this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => {
      this.pollSim();
    }, _n));
  }
  async pollLive() {
    const e = ++this.liveSeq;
    try {
      const t = await Ni(this.hass);
      e === this.liveSeq && (this.live = t);
    } catch {
    }
  }
  async pollSim() {
    try {
      this.simLog = await ji(this.hass);
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
    if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < Sn))
      try {
        this.profileState = await Ui(this.hass), this.profileAt = Date.now();
      } catch {
      }
  }
  /**
   * What the mixer needs beyond the live frame. Whether the simulation is running is not
   * in here: the strips read that off the switch entity they are given.
   */
  simStates(e) {
    const t = [e, this.simLog, this.hass.states], s = this.simStatesMemo;
    if (s && s.key.every((r, o) => r === t[o])) return s.value;
    const i = {}, n = (r) => {
      i[r.id] = { blocked: this.simLog?.blocked[r.id] ?? null }, r.children.forEach(n);
    };
    return e.groups.forEach(n), this.simStatesMemo = { key: t, value: i }, i;
  }
  restoreTimeline() {
    try {
      this.timeline = Cn(localStorage.getItem(Zt)) ?? Qt;
    } catch {
    }
  }
  selectTab(e) {
    const t = de[e];
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
    return c`
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
          <ha-button .disabled=${!e?.dirty || this.busy} @click=${this.save}
            >${e?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${de.map(
      (t, s) => c`<button
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
          ${e ? this.renderTab(e) : c`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
  }
  /** The Mixer polls regardless, so offering a switch that changes nothing would be a lie. */
  renderLiveToggle() {
    return this.tab === "mixer" ? u : c`
      <span class="muted">Live</span>
      <ha-switch
        .checked=${this.liveOn}
        @change=${(e) => this.toggleLive(e.target.checked)}
      ></ha-switch>
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
    const e = this.banner;
    return e ? c`<ha-alert
      alert-type=${e.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
      this.banner = null;
    }}
      >${e.text}</ha-alert
    >` : u;
  }
  renderTab(e) {
    switch (this.tab) {
      case "mixer":
        return this.renderMixer(e);
      case "groups":
        return c`<div class="layout ${this.narrow ? "narrow" : ""}">
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
        return c`<al-envelopes
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
      case "defaults":
        return c`<al-defaults
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
      case "patterns":
        return c`<al-patterns
          .hass=${this.hass}
          .config=${e.config}
          .profileState=${this.profileState}
          .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild}
        ></al-patterns>`;
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
    const s = this.nav.selection, i = s === null ? void 0 : M(t, Es(s));
    return c`<div class="rows">
      <al-timeline
        .hass=${this.hass}
        .groupId=${i?.id ?? null}
        .heading=${i ? i.name ?? i.id : ""}
        .range=${this.timeline.range}
        .horizon=${this.timeline.horizon}
        .showChannels=${this.timeline.showChannels}
        .showLights=${this.timeline.showLights}
        .live=${this.live}
        .maxValue=${i?.max_value ?? t.defaults.max_value}
        .profileState=${this.profileState}
        .minDays=${t.defaults.patterns?.min_days ?? Je}
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
        .simState=${this.simStates(t)}
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
    return c`<div class="rows">
      <ha-card class="mixer-empty">
        <p class="muted">Add your first group in Groups.</p>
        <ha-button @click=${() => this.selectTab(de.indexOf("groups"))}>Go to Groups</ha-button>
      </ha-card>
    </div>`;
  }
  renderEditor(e) {
    const t = this.selection;
    return t ? t[t.length - 2] === "stimuli" ? c`<al-stimulus-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>` : c`<al-group-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          @al-change=${this.onChange}
          @al-select=${(i) => this.select(i.detail)}
        ></al-group-editor>` : c`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
  }
};
y.styles = [O];
_([
  h({ attribute: !1 })
], y.prototype, "hass", 2);
_([
  h({ type: Boolean })
], y.prototype, "narrow", 2);
_([
  g()
], y.prototype, "draft", 2);
_([
  g()
], y.prototype, "tab", 2);
_([
  g()
], y.prototype, "selection", 2);
_([
  g()
], y.prototype, "nav", 2);
_([
  g()
], y.prototype, "errors", 2);
_([
  g()
], y.prototype, "banner", 2);
_([
  g()
], y.prototype, "live", 2);
_([
  g()
], y.prototype, "liveOn", 2);
_([
  g()
], y.prototype, "busy", 2);
_([
  g()
], y.prototype, "missing", 2);
_([
  g()
], y.prototype, "profileState", 2);
_([
  g()
], y.prototype, "simLog", 2);
_([
  g()
], y.prototype, "timeline", 2);
_([
  g()
], y.prototype, "tabFocus", 2);
y = _([
  E("activity-levels-panel")
], y);
function ee(e) {
  const t = Math.floor(e / 3600), s = Math.floor((e - t * 3600) / 60), i = Math.round((e - t * 3600 - s * 60) * 1e3) / 1e3, n = Math.floor(i), r = Math.round((i - n) * 1e3);
  return r === 0 ? { hours: t, minutes: s, seconds: n } : { hours: t, minutes: s, seconds: n, milliseconds: r };
}
function te(e) {
  if (!e) return null;
  const t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
  return Math.round(t * 1e3) / 1e3;
}
function Q(e) {
  if (e === 0) return "0s";
  const t = [];
  let s = e;
  const i = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [n, r] of i) {
    const o = Math.floor(s / r);
    o > 0 && (t.push(`${o}${n}`), s -= o * r);
  }
  return s = Math.round(s * 1e3) / 1e3, s > 0 && t.push(`${s}s`), t.join(" ");
}
const f = (e) => e.join("/");
function se(e, t) {
  const s = f(t), i = {};
  for (const n of e) {
    if (!n.path.startsWith(s + "/")) continue;
    const r = n.path.slice(s.length + 1);
    r.includes("/") || (i[r] = n.message);
  }
  return i;
}
function Ce(e, t) {
  const s = f(t);
  return e.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function Tn(e, t, s) {
  const i = `${f(t)}/${s}/`;
  return e.find((n) => n.path.startsWith(i))?.message;
}
function oe(e, t, s) {
  const i = new CustomEvent("al-change", {
    detail: e,
    bubbles: !0,
    composed: !0
  });
  return t !== void 0 && (i.coalesceKey = t), s && (i.structural = !0), i;
}
const Ts = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), X = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), Pn = () => X("al-select-strip", null), Ln = () => X("al-toggle-strip", null), es = (e) => X("al-level-override", { value: e }), On = (e) => X("al-mute-toggle", { muted: e }), Mn = () => X("al-reset", null), Rn = (e) => X("al-mix-changed", { mix: e }), In = (e) => X("al-limiter-changed", { value: e }), Nn = (e) => X("al-sim-toggled", { on: e }), at = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), Dn = () => new CustomEvent("al-live-refresh", { detail: null, bubbles: !0, composed: !0 }), Un = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), Ps = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), Ls = (e = !1) => new CustomEvent("al-rebuild", { detail: { force: e }, bubbles: !0, composed: !0 });
var Fn = Object.defineProperty, jn = Object.getOwnPropertyDescriptor, be = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? jn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Fn(t, s, n), n;
};
const ts = (e) => e.stopPropagation(), Hn = (e) => {
  (e.key === "Enter" || e.key === " ") && e.stopPropagation();
};
let q = class extends $ {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(e) {
    this.dispatchEvent(oe(e, void 0, !0));
  }
  emitSelect(e) {
    this.dispatchEvent(Ts(e));
  }
  isSelected(e) {
    return this.selection !== null && f(this.selection) === f(e);
  }
  select(e, t) {
    e.stopPropagation(), this.emitSelect(t);
  }
  selectOnKey(e, t) {
    e.key !== "Enter" && e.key !== " " || (e.preventDefault(), e.stopPropagation(), this.emitSelect(t));
  }
  addGroup(e, t) {
    const s = this.config;
    s && (this.emitChange(gt(s, e, t, en(cn(s, "new_group")))), this.emitSelect([...e, t]));
  }
  addStimulus(e, t) {
    const s = this.config;
    if (!s) return;
    const i = [...e, "stimuli"];
    this.emitChange(gt(s, i, t, rn(""))), this.emitSelect([...i, t]);
  }
  move(e, t) {
    const s = this.config;
    if (!s) return;
    const i = pn(e), n = e[e.length - 1], r = n + t;
    this.emitChange(Ji(s, i, n, r));
    const o = this.selectionAfterSwap(i, n, r);
    o !== null && this.emitSelect(o);
  }
  /**
   * Where the selection lands after two adjacent siblings swap places, or `null` when it
   * is untouched. Reordering is always a swap of neighbours, so only paths running through
   * one of the two slots move - the moved node itself, or anything inside the sibling it
   * displaced. Everything else keeps naming the same node and is left alone, rather than
   * having the editor pane jump to whatever was just reordered.
   */
  selectionAfterSwap(e, t, s) {
    const i = this.selection;
    if (i === null || i.length <= e.length || f(i.slice(0, e.length)) !== f(e)) return null;
    const n = i[e.length], r = n === t ? s : n === s ? t : null;
    if (r === null) return null;
    const o = [...i];
    return o[e.length] = r, o;
  }
  removeNode(e, t) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
    this.emitChange(Pt(s, e));
    const i = Me(e);
    this.emitSelect(i.length ? i : null);
  }
  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  countdown(e) {
    const t = this.live?.now;
    return e === null || t === void 0 ? null : Q(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
  }
  /** Tooltip for a voice's phase chip: what it is doing, and how long that lasts. */
  voiceTitle(e) {
    const t = this.countdown(e.phase_ends);
    return t === null ? `Phase: ${e.phase}` : `Phase: ${e.phase}, ends in ${t}`;
  }
  /** Tooltip for a group's meter: the displayed value, the unrounded mix, and the next wake. */
  meterTitle(e, t, s) {
    const i = [`${e.value} of ${t}`, `raw ${e.raw_value.toFixed(3)}`], n = s ? this.countdown(e.next_wake) : null;
    return n !== null && i.push(`next wake in ${n}`), i.join(" · ");
  }
  render() {
    const e = this.config;
    return e ? e.groups.length === 0 ? this.renderEmpty() : c`
      <ha-card>
        ${e.groups.map((t, s) => this.renderGroup(e, t, ["groups", s], 0, s, e.groups.length))}
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], e.groups.length)}>Add group</ha-button>
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
  renderGroup(e, t, s, i, n, r) {
    const o = Ce(this.errors, s), a = this.live?.groups[t.id], l = a?.max_value ?? t.max_value ?? e.defaults.max_value, d = a ? Math.max(0, Math.min(100, a.value / (l || 1) * 100)) : 0;
    return c`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(p) => this.select(p, s)}
            @keydown=${Hn}
          >
            ${t.name || t.id || "(unnamed group)"}
          </button>
          ${o ? c`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : u}
          ${a ? c`<div class="meter" title=${this.meterTitle(a, l, i === 0)}>
                  <div style="width: ${d}%"></div>
                </div>
                <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : u}
        </div>
        <div slot="icons" class="row" @click=${ts}>
          <ha-icon-button label="Add stimulus" title="Add stimulus" @click=${() => this.addStimulus(s, t.stimuli.length)}>
            <ha-icon icon="mdi:plus"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Add child group"
            title="Add child group"
            @click=${() => this.addGroup([...s, "children"], t.children.length)}
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
            @click=${() => this.removeNode(s, `group "${t.name || t.id}" and everything in it`)}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="body">
          ${t.stimuli.map(
      (p, m) => this.renderStimulus(p, [...s, "stimuli", m], m, t.stimuli.length, t.id)
    )}
          ${t.stimuli.length === 0 ? c`<div class="muted empty">
                No stimuli yet — use the + button above to point this group at an entity.
              </div>` : u}
          <div class="children">
            ${t.children.map(
      (p, m) => this.renderGroup(e, p, [...s, "children", m], i + 1, m, t.children.length)
    )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(e, t, s, i, n) {
    const r = this.hass?.states[e.entity], o = r?.attributes.friendly_name ?? (e.entity || "(no entity)"), a = Ce(this.errors, t), l = this.live?.voices[n]?.find((d) => d.label === (e.key ?? e.entity));
    return c`
      <div
        class="row stimulus ${this.isSelected(t) ? "selected" : ""}"
        role="button"
        tabindex="0"
        @click=${(d) => this.select(d, t)}
        @keydown=${(d) => this.selectOnKey(d, t)}
      >
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="name grow" title=${e.entity}>${o}</span>
        ${a ? c`<span class="badge" title="${a} problem(s)">${a}</span>` : u}
        ${r ? c`<span class="muted chip">${r.state}</span>` : u}
        ${l ? c`<span class="chip phase ${l.phase}" title=${this.voiceTitle(l)}>${l.phase}</span>
              <span class="muted chip">${l.value.toFixed(2)}</span>` : u}
        <div class="row" @click=${ts}>
          <ha-icon-button label="Move up" title="Move up" .disabled=${s === 0} @click=${() => this.move(t, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Move down"
            title="Move down"
            .disabled=${s === i - 1}
            @click=${() => this.move(t, 1)}
          >
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </ha-icon-button>
          <ha-icon-button label="Delete stimulus" title="Delete stimulus" @click=${() => this.removeNode(t, `stimulus "${o}"`)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
  }
};
q.styles = [
  O,
  S`
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
be([
  h({ attribute: !1 })
], q.prototype, "hass", 2);
be([
  h({ attribute: !1 })
], q.prototype, "config", 2);
be([
  h({ attribute: !1 })
], q.prototype, "selection", 2);
be([
  h({ attribute: !1 })
], q.prototype, "errors", 2);
be([
  h({ attribute: !1 })
], q.prototype, "live", 2);
q = be([
  E("al-tree")
], q);
const Os = (e) => e.split(",").map((t) => t.trim()).filter((t) => t.length > 0), Te = (e) => (e ?? []).join(", "), Be = (e) => e == null || e === "" ? null : e;
function zn(e, t) {
  if (t != null)
    switch (e) {
      case "duration":
        return ee(t);
      case "boolean":
        return t ? "true" : "false";
      default:
        return t;
    }
}
function Gn(e, t) {
  if (t == null || t === "") return null;
  switch (e) {
    case "duration":
      return te(t);
    case "boolean":
      return t === !0 || t === "true";
    case "number": {
      const s = typeof t == "number" ? t : Number(t);
      return Number.isNaN(s) ? null : s;
    }
    default:
      return String(t);
  }
}
function Vn(e, t) {
  if (t == null) return "unset";
  switch (e) {
    case "duration":
      return Q(t);
    case "boolean":
      return t ? "Yes" : "No";
    default:
      return String(t);
  }
}
const Bn = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain",
  adjacent: "Adjacent rooms",
  exit: "Way out of the house"
}, Wn = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent.",
  adjacent: "Rooms you can walk to from here. Symmetric: naming one from either side is enough. One-way connections are shown with an arrow and edited in YAML.",
  exit: "People can leave the house from this room, so presence can move from here to Away."
}, Ms = (e) => Bn[e.name] ?? e.name, Rs = (e) => Wn[e.name] ?? "", qn = [
  "id",
  "name",
  "area",
  "mix",
  "null_handling",
  "gain",
  "adjacent",
  "exit"
], Kn = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], Xn = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], Is = { number: { min: 0.1, step: 0.1, mode: "box" } }, Ns = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, Yn = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, Jn = { boolean: {} };
function Zn(e, t) {
  const s = [], i = (n) => {
    n.id !== t.id && s.push({ value: n.id, label: n.name ?? n.id }), n.children.forEach(i);
  };
  return e.groups.forEach(i), { select: { multiple: !0, mode: "dropdown", sort: !1, options: s } };
}
const Ds = (e, t, s) => e === "null_handling" ? t.mix === "mean" : e === "gain" ? !s : !0;
function Us(e, t, s, i) {
  const n = {
    id: { text: {} },
    name: { text: {} },
    area: { area: {} },
    mix: { select: { mode: "dropdown", options: Kn } },
    null_handling: { select: { mode: "dropdown", options: Xn } },
    gain: Yn,
    adjacent: i ? Zn(i, e) : { select: { multiple: !0, options: [] } },
    exit: Jn
  };
  return s.filter((r) => Ds(r, e, t)).map((r) => ({ name: r, selector: n[r] }));
}
function Fs(e, t, s, i) {
  const n = i ? Oe(i) : null, r = (e.adjacent ?? []).map(Ae).filter((a) => n === null || n.has(a)), o = {
    id: e.id,
    name: e.name ?? "",
    area: e.area,
    mix: e.mix,
    null_handling: e.null_handling,
    gain: e.gain,
    adjacent: r,
    exit: e.exit === !0
  };
  return Object.fromEntries(
    s.filter((a) => Ds(a, e, t) && !(a === "area" && e.area === null)).map((a) => [a, o[a]])
  );
}
function js(e, t) {
  const s = { ...e };
  if ("id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = Be(t.name)), "area" in t && (s.area = Be(t.area)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "adjacent" in t) {
    const i = Array.isArray(t.adjacent) ? t.adjacent.map(String) : [], n = new Map((e.adjacent ?? []).map((r) => [Ae(r), r]));
    s.adjacent = i.map((r) => n.get(r) ?? r);
  }
  return "exit" in t && (s.exit = t.exit === !0), s;
}
const Hs = (e, t) => {
  const s = (t.adjacent ?? []).map(Ae).join(","), i = (e.adjacent ?? []).map(Ae).join(",");
  return s !== i ? "adjacent" : qn.filter((n) => n !== "adjacent").find((n) => e[n] !== t[n]);
};
var Qn = Object.defineProperty, er = Object.getOwnPropertyDescriptor, z = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? er(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Qn(t, s, n), n;
};
const Lt = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
function tr(e, t) {
  return e.select?.options?.find((i) => i.value === t)?.label;
}
let R = class extends $ {
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
  emit(e) {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
  }
  onValueChanged(e) {
    e.stopPropagation(), this.emit(Gn(this.kind, e.detail?.value));
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
      const t = tr(this.selector, String(e));
      if (t !== void 0) return t;
    }
    return Vn(this.kind, e);
  }
  /**
   * `ha-selector` defaults `required` to true, which makes a duration selector spell an
   * inherited (null) value as `00:00:00` and hides the clear affordance, so it is passed
   * explicitly: an override that is not set must read as empty.
   */
  render() {
    const e = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`;
    return c`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? Lt : this.selector}
          .label=${this.label}
          .required=${!1}
          .value=${zn(this.kind, this.value)}
          .helper=${e}
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
      ${this.error ? c`<div class="muted error msg">${this.error}</div>` : u}
    `;
  }
};
R.styles = [
  O,
  S`
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
z([
  h({ attribute: !1 })
], R.prototype, "hass", 2);
z([
  h()
], R.prototype, "label", 2);
z([
  h({ attribute: !1 })
], R.prototype, "selector", 2);
z([
  h({ attribute: !1 })
], R.prototype, "value", 2);
z([
  h({ attribute: !1 })
], R.prototype, "inherited", 2);
z([
  h({ attribute: "inherited-from" })
], R.prototype, "inheritedFrom", 2);
z([
  h()
], R.prototype, "kind", 2);
z([
  h()
], R.prototype, "error", 2);
R = z([
  E("al-override-field")
], R);
var sr = Object.defineProperty, ir = Object.getOwnPropertyDescriptor, Re = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ir(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && sr(t, s, n), n;
};
const ss = ["id", "name", "area", "mix", "null_handling", "gain", "adjacent", "exit"];
let re = class extends $ {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  emitChange(e, t) {
    this.dispatchEvent(oe(e, t));
  }
  emitSelect(e) {
    this.dispatchEvent(Ts(e));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = M(t, s);
    if (!i) return;
    const n = js(i, e.detail?.value ?? {}), r = Hs(n, i);
    r !== void 0 && this.emitChange(C(t, s, n), `${f(s)}:${r}`);
  }
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(C(s, [...i, e], t), `${f(i)}:${e}`);
  }
  onDelete() {
    const { config: e, path: t } = this;
    if (!e || !t) return;
    const s = M(e, t);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(Pt(e, t));
    const i = Me(t);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length === 0)
      return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = M(e, t);
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = t.length === 2, n = this.errors.filter((a) => a.path === f(t)), r = { ...se(this.errors, t) }, o = Tn(this.errors, t, "adjacent");
    return o !== void 0 && (r.adjacent = o), c`
      <ha-card header="Group">
        ${n.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${Fs(s, i, ss, e)}
          .schema=${Us(s, i, ss, e)}
          .error=${r}
          .computeLabel=${Ms}
          .computeHelper=${Rs}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="muted note">Changing the id re-creates this group's entities.</div>

        <h3>Output</h3>
        <al-override-field
          .hass=${this.hass}
          label="Max value"
          kind="number"
          .selector=${Is}
          .value=${s.max_value}
          .inherited=${e.defaults.max_value}
          .inheritedFrom=${"defaults"}
          .error=${r.max_value}
          @value-changed=${(a) => this.setField("max_value", a.detail.value)}
        ></al-override-field>
        <al-override-field
          .hass=${this.hass}
          label="Precision"
          kind="select"
          .selector=${Ns}
          .value=${s.precision === null ? null : String(s.precision)}
          .inherited=${String(e.defaults.precision)}
          .inheritedFrom=${"defaults"}
          .error=${r.precision}
          @value-changed=${(a) => this.setField("precision", a.detail.value === null ? null : Number(a.detail.value))}
        ></al-override-field>

        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
};
re.styles = [
  O,
  S`
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
Re([
  h({ attribute: !1 })
], re.prototype, "hass", 2);
Re([
  h({ attribute: !1 })
], re.prototype, "config", 2);
Re([
  h({ attribute: !1 })
], re.prototype, "path", 2);
Re([
  h({ attribute: !1 })
], re.prototype, "errors", 2);
re = Re([
  E("al-group-editor")
], re);
const nr = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, rr = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, zs = (e) => nr[e.name] ?? e.name, Gs = (e) => rr[e.name] ?? "", or = ["entity", "gain", "key", "envelope"], De = { duration: { enable_millisecond: !0 } }, ar = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Vs = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, lr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, cr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, hr = "(unknown preset — using built-in defaults)", yt = [
  { name: "attack", label: "Attack", kind: "duration", selector: De },
  { name: "decay", label: "Decay", kind: "duration", selector: De },
  { name: "sustain", label: "Sustain", kind: "number", selector: ar },
  { name: "release", label: "Release", kind: "duration", selector: De },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: Lt },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: lr },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: cr },
  { name: "debounce", label: "Debounce", kind: "duration", selector: De }
], Bs = (e) => [
  { value: "", label: "(default preset)" },
  ...e.envelopes.map((t) => ({ value: t.id, label: t.id }))
];
function Ws(e, t) {
  const s = {
    entity: { entity: {} },
    to: { text: {} },
    gain: Vs,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: Bs(e) } }
  };
  return t.map((i) => ({ name: i, selector: s[i] }));
}
function qs(e, t, s) {
  const i = {
    entity: e.entity,
    to: t ?? Te(e.to),
    gain: e.gain,
    key: e.key ?? "",
    envelope: e.envelope ?? ""
  };
  return Object.fromEntries(s.map((n) => [n, i[n]]));
}
function Ks(e, t) {
  const s = { ...e };
  return "entity" in t && (s.entity = String(t.entity ?? "")), "to" in t && (s.to = Os(String(t.to ?? ""))), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = Be(t.key)), "envelope" in t && (s.envelope = Be(t.envelope)), s;
}
function Xs(e, t) {
  return Te(e.to) !== Te(t.to) ? "to" : or.find((s) => e[s] !== t[s]);
}
const Ys = (e, t) => Te(e) === Te(Os(t));
function Js(e, t, s) {
  const i = ks(e, t.envelope);
  return i ? i[s] === null || i[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : hr;
}
function Zs(e, t) {
  return t == null || e === void 0 ? null : Q(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
const Qs = (e) => e.release * e.sustain;
function ei(e, t = 0.25) {
  if (e.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
  const s = Qs(e), i = e.attack + e.decay + s, n = i > 0 ? i * t / (1 - t) : 1, r = i + n;
  let o = 0;
  const a = [{ x: 0, y: 0 }];
  return o += e.attack, a.push({ x: o / r, y: 1 }), o += e.decay, a.push({ x: o / r, y: e.sustain }), o += n, a.push({ x: o / r, y: e.sustain }), o += s, a.push({ x: o / r, y: 0 }), a;
}
const dr = (e) => Math.round(e * 100) / 100;
function ur(e, t = 0.25) {
  const s = ei(e, t), i = (r) => ((s[r]?.x ?? 0) + (s[r + 1]?.x ?? 0)) / 2;
  if (e.impulse) {
    const r = [{ text: "impulse", x: 0 }];
    return e.release > 0 && r.push({ text: `R ${Q(e.release)}`, x: i(1) }), r;
  }
  const n = [];
  return e.attack > 0 && n.push({ text: `A ${Q(e.attack)}`, x: i(0) }), e.decay > 0 && n.push({ text: `D ${Q(e.decay)}`, x: i(1) }), n.push({ text: `S ${dr(e.sustain)}`, x: i(2) }), Qs(e) > 0 && n.push({ text: `R ${Q(e.release)}`, x: i(3) }), n;
}
var pr = Object.defineProperty, mr = Object.getOwnPropertyDescriptor, ti = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? mr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && pr(t, s, n), n;
};
const Pe = 10, We = 190, fr = 10, me = 58, gr = 72, je = (e) => Pe + e * (We - Pe), lt = (e) => me - e * (me - fr), _e = (e) => String(Math.round(e * 10) / 10), ct = (e, t) => `${_e(e)},${_e(t)}`, vr = (e) => Math.min(We - 6, Math.max(Pe + 6, je(e)));
let qe = class extends $ {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const e = this.envelope;
    if (!e) return u;
    const t = ei(e), s = t[0], i = t[t.length - 1], n = t.map((l) => ct(je(l.x), lt(l.y))).join(" "), r = `${ct(je(s.x), me)} ${n} ${ct(je(i.x), me)}`, o = ur(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${Pe} y1=${me} x2=${We} y2=${me}></line>
        ${e.impulse ? u : A`<line
              class="grid"
              x1=${Pe}
              y1=${_e(lt(e.sustain))}
              x2=${We}
              y2=${_e(lt(e.sustain))}
            ></line>`}
        <polygon class="area" points=${r}></polygon>
        <polyline class="curve" points=${n}></polyline>
        ${o.map(
      (l) => A`<text class="caption" x=${_e(vr(l.x))} y=${gr} text-anchor="middle">${l.text}</text>`
    )}
      </svg>
    `;
  }
};
qe.styles = [
  O,
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
ti([
  h({ attribute: !1 })
], qe.prototype, "envelope", 2);
qe = ti([
  E("al-envelope-sketch")
], qe);
var $r = Object.defineProperty, br = Object.getOwnPropertyDescriptor, ae = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? br(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && $r(t, s, n), n;
};
const is = ["entity", "to", "gain", "key", "envelope"];
let j = class extends $ {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.toText = null;
  }
  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  willUpdate(e) {
    if (e.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !e.has("config")) return;
    const { config: t, path: s } = this, i = t && s ? fe(t, s) : void 0;
    i && (Ys(i.to, this.toText) || (this.toText = null));
  }
  emitChange(e, t) {
    this.dispatchEvent(oe(e, t));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = fe(t, s);
    if (!i) return;
    const n = e.detail?.value ?? {};
    this.toText = String(n.to ?? "");
    const r = Ks(i, n), o = Xs(r, i);
    o !== void 0 && this.emitChange(C(t, s, r), `${f(s)}:${o}`);
  }
  setOverride(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(C(s, [...i, e], t), `${f(i)}:${e}`);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length < 3)
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = fe(e, t);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = M(e, Me(t)), n = se(this.errors, t), r = this.errors.filter((d) => d.path === f(t)), o = $t(e, s), a = this.live?.voices[i?.id ?? ""]?.find(
      (d) => d.label === (s.key ?? s.entity)
    ), l = Zs(this.live?.now, a?.phase_ends);
    return c`
      <ha-card header="Stimulus">
        ${r.map((d) => c`<ha-alert alert-type="error">${d.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${qs(s, this.toText, is)}
          .schema=${Ws(e, is)}
          .error=${n}
          .computeLabel=${zs}
          .computeHelper=${Gs}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${a ? c`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip phase ${a.phase}">${a.phase}</span>
              <span class="chip">${a.value.toFixed(2)}</span>
              ${l !== null ? c`<span class="muted chip">ends in ${l}</span>` : u}
              <span class="dot ${a.gate ? "gated" : ""}" title=${a.gate ? "Gate open" : "Gate closed"}></span>
            </div>` : u}

        <h3>Envelope overrides</h3>
        ${yt.map(
      (d) => c`<al-override-field
            .hass=${this.hass}
            .label=${d.label}
            .kind=${d.kind}
            .selector=${d.selector}
            .value=${s[d.name]}
            .inherited=${o[d.name]}
            .inheritedFrom=${Js(e, s, d.name)}
            .error=${n[d.name]}
            @value-changed=${(p) => this.setOverride(d.name, p.detail.value)}
          ></al-override-field>`
    )}
        <h3>Envelope shape</h3>
        <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
      </ha-card>
    `;
  }
};
j.styles = [
  O,
  S`
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
ae([
  h({ attribute: !1 })
], j.prototype, "hass", 2);
ae([
  h({ attribute: !1 })
], j.prototype, "config", 2);
ae([
  h({ attribute: !1 })
], j.prototype, "path", 2);
ae([
  h({ attribute: !1 })
], j.prototype, "errors", 2);
ae([
  h({ attribute: !1 })
], j.prototype, "live", 2);
ae([
  g()
], j.prototype, "toText", 2);
j = ae([
  E("al-stimulus-editor")
], j);
var yr = Object.defineProperty, xr = Object.getOwnPropertyDescriptor, le = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? xr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && yr(t, s, n), n;
};
const wr = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, _r = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, Sr = ["id", "attack", "decay", "sustain", "release", "impulse"], He = { duration: { enable_millisecond: !0 } }, Er = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, kr = { boolean: {} }, Ar = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Cr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Tr = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: He },
  { name: "decay", selector: He },
  { name: "sustain", selector: Er },
  { name: "release", selector: He },
  { name: "impulse", selector: kr }
], Pr = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Ar },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Cr },
  { name: "debounce", label: "Debounce", kind: "duration", selector: He }
];
let H = class extends $ {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (e) => wr[e.name] ?? e.name, this.computeHelper = (e) => _r[e.name] ?? "";
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
    this.dispatchEvent(oe(e, t));
  }
  selectPreset(e) {
    this.selected = e, this.blocked = null;
  }
  addPreset() {
    const e = this.config;
    if (!e) return;
    this.blocked = null;
    const t = e.envelopes.length;
    this.emitChange(gt(e, ["envelopes"], t, nn(hn(e, "preset")))), this.selected = t;
  }
  removePreset(e) {
    const t = this.config;
    if (!t) return;
    const s = t.envelopes[e];
    if (!s) return;
    const i = dn(t, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(Pt(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config, s = this.selected, i = t?.envelopes[s];
    if (!t || !i) return;
    const n = e.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      attack: te(n.attack) ?? i.attack,
      decay: te(n.decay) ?? i.decay,
      sustain: typeof n.sustain == "number" ? n.sustain : i.sustain,
      release: te(n.release) ?? i.release,
      impulse: typeof n.impulse == "boolean" ? n.impulse : i.impulse
    }, o = Sr.find((d) => r[d] !== i[d]);
    if (o === void 0) return;
    const a = ["envelopes", s], l = C(un(t, s, r.id), a, r);
    this.emitChange(l, `${f(a)}:${o}`);
  }
  setOverride(e, t) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const n = ["envelopes", i, e];
    this.emitChange(C(s, n, t), f(n));
  }
  render() {
    const e = this.config;
    return e ? c`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(e)}</div>
        <div>${this.renderEditor(e)}</div>
      </div>
    ` : c`<ha-card><span class="muted">Loading…</span></ha-card>`;
  }
  renderList(e) {
    const t = this.blocked;
    return c`
      <ha-card>
        <h3>Presets</h3>
        ${e.envelopes.map((s, i) => {
      const n = Ce(this.errors, ["envelopes", i]);
      return c`<div class="row preset ${this.selected === i ? "selected" : ""}">
            <button type="button" class="link grow" title="Edit this preset" @click=${() => this.selectPreset(i)}>
              ${s.id || "(unnamed preset)"}
            </button>
            ${n ? c`<span class="badge" title="${n} problem(s)">${n}</span>` : u}
            <ha-icon-button label="Delete preset" title="Delete preset" @click=${() => this.removePreset(i)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>`;
    })}
        ${e.envelopes.length === 0 ? c`<p class="muted">No presets yet.</p>` : u}
        ${t ? c`<ha-alert alert-type="warning">${Or(t)}</ha-alert>` : u}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(e) {
    const t = this.selected, s = e.envelopes[t];
    if (!s) return c`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", t], n = se(this.errors, i), r = this.errors.filter((l) => l.path === f(i)), o = {
      id: s.id,
      attack: ee(s.attack),
      decay: ee(s.decay),
      sustain: s.sustain,
      release: ee(s.release),
      impulse: s.impulse
    }, a = Lr(e, t, s);
    return c`
      <ha-card header="Envelope preset">
        ${r.map((l) => c`<ha-alert alert-type="error">${l.message}</ha-alert>`)}
        ${a ? c`<ha-alert alert-type="warning">${a}</ha-alert>` : u}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Tr}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Pr.map(
      (l) => c`<al-override-field
            .hass=${this.hass}
            .label=${l.label}
            .kind=${l.kind}
            .selector=${l.kind === "boolean" ? Lt : l.selector}
            .value=${s[l.name]}
            .inherited=${e.defaults[l.name]}
            .inheritedFrom=${"defaults"}
            .error=${n[l.name]}
            @value-changed=${(d) => this.setOverride(l.name, d.detail.value)}
          ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
H.styles = [
  O,
  S`
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
le([
  h({ attribute: !1 })
], H.prototype, "hass", 2);
le([
  h({ attribute: !1 })
], H.prototype, "config", 2);
le([
  h({ attribute: !1 })
], H.prototype, "errors", 2);
le([
  h({ type: Boolean })
], H.prototype, "narrow", 2);
le([
  g()
], H.prototype, "selected", 2);
le([
  g()
], H.prototype, "blocked", 2);
H = le([
  E("al-envelopes")
], H);
function Lr(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((i, n) => n !== t && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Or(e) {
  const t = [];
  return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
var Mr = Object.defineProperty, Rr = Object.getOwnPropertyDescriptor, tt = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Rr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Mr(t, s, n), n;
};
const Ir = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, Nr = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Stack: each trigger adds its gain on top of the current level, up to the group's limiter. Only while releasing: a trigger only restarts a fading note. Always: a trigger restarts the note even while it is held.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, Dr = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], ht = { duration: { enable_millisecond: !0 } }, Ur = { number: { min: 0.1, step: 0.1, mode: "box" } }, Fr = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, jr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Hr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
};
let ve = class extends $ {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (e) => Ir[e.name] ?? e.name, this.computeHelper = (e) => Nr[e.name] ?? "";
  }
  schemaFor(e) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: e.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: Ur },
      { name: "precision", selector: Fr },
      { name: "unavailable", selector: Hr },
      { name: "retrigger", selector: jr },
      { name: "debounce", selector: ht },
      { name: "safety_refresh", selector: ht },
      { name: "min_wake_interval", selector: ht }
    ];
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config;
    if (!t) return;
    const s = t.defaults, i = e.detail?.value ?? {}, n = Number(i.precision), r = {
      envelope: typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : s.envelope,
      max_value: typeof i.max_value == "number" ? i.max_value : s.max_value,
      precision: Number.isFinite(n) ? n : s.precision,
      unavailable: i.unavailable ?? s.unavailable,
      retrigger: i.retrigger ?? s.retrigger,
      debounce: te(i.debounce) ?? s.debounce,
      safety_refresh: te(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: te(i.min_wake_interval) ?? s.min_wake_interval
    }, o = Dr.find((a) => r[a] !== s[a]);
    o !== void 0 && this.emitChange(C(t, ["defaults"], r), `defaults:${o}`);
  }
  emitChange(e, t) {
    this.dispatchEvent(oe(e, t));
  }
  render() {
    const e = this.config;
    if (!e) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const t = e.defaults, s = se(this.errors, ["defaults"]), i = this.errors.filter((r) => r.path === "defaults"), n = {
      envelope: t.envelope,
      max_value: t.max_value,
      precision: String(t.precision),
      unavailable: t.unavailable,
      retrigger: t.retrigger,
      debounce: ee(t.debounce),
      safety_refresh: ee(t.safety_refresh),
      min_wake_interval: ee(t.min_wake_interval)
    };
    return c`
      <div class="pad">
        <ha-card header="Defaults">
          ${i.map((r) => c`<ha-alert alert-type="error">${r.message}</ha-alert>`)}
          <ha-form
            .hass=${this.hass}
            .data=${n}
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
ve.styles = [
  O,
  S`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
tt([
  h({ attribute: !1 })
], ve.prototype, "hass", 2);
tt([
  h({ attribute: !1 })
], ve.prototype, "config", 2);
tt([
  h({ attribute: !1 })
], ve.prototype, "errors", 2);
ve = tt([
  E("al-defaults")
], ve);
const Ot = 0.1, Mt = 10, Rt = Math.log10(Ot), zr = Math.log10(Mt), si = zr - Rt, st = (e) => Math.min(Mt, Math.max(Ot, e)), It = (e) => Math.round(e * 100) / 100, ns = (e) => It(st(e));
function Gr(e) {
  return (Math.log10(st(e)) - Rt) / si;
}
function Vr(e) {
  const t = Math.min(1, Math.max(0, e));
  return It(st(Math.pow(10, Rt + t * si)));
}
function Br(e, t, s = !1) {
  const i = s ? 1.05 : 1.25;
  return It(st(t === 1 ? e * i : e / i));
}
function Wr(e) {
  let t = e.toFixed(2).replace(/0+$/, "");
  return t.endsWith(".") && (t += "0"), t;
}
const qr = {
  min: Ot,
  max: Mt,
  toPosition: Gr,
  fromPosition: Vr,
  clamp: ns,
  step: (e, t, s = !1) => Br(e, t, s),
  page: (e, t) => ns(t === 1 ? e * 2 : e / 2),
  format: Wr,
  reset: 1
}, Kr = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function Xr(e, t) {
  const s = e > 0 ? e : 1, i = Kr(t), n = 10 ** -i, r = (a) => Number(Math.min(s, Math.max(0, a)).toFixed(i)), o = Math.max(n, Number((s / 10).toFixed(i)));
  return {
    min: 0,
    max: s,
    toPosition: (a) => Math.min(1, Math.max(0, a / s)),
    fromPosition: (a) => r(Math.min(1, Math.max(0, a)) * s),
    clamp: r,
    step: (a, l, d = !1) => r(a + l * (d ? n : o)),
    page: (a, l) => r(a + l * s / 4),
    format: (a) => et(r(a), i),
    reset: null
  };
}
var Yr = Object.defineProperty, Jr = Object.getOwnPropertyDescriptor, F = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Jr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Yr(t, s, n), n;
};
const xt = 12, dt = (e) => `${Math.round(e * 1e3) / 10}%`;
let L = class extends $ {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.focusable = !0, this.label = "Gain", this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1, this.onWheel = (e) => {
      this.disabled || e.deltaY === 0 || (e.preventDefault(), this.commit(this.scale.step(this.current, e.deltaY < 0 ? 1 : -1, e.shiftKey)));
    };
  }
  get scale() {
    return this.mode === "level" ? Xr(this.max, this.precision) : qr;
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
    let i;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        i = t.step(s, 1, e.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        i = t.step(s, -1, e.shiftKey);
        break;
      case "Home":
        i = t.min;
        break;
      case "End":
        i = t.max;
        break;
      case "PageUp":
        i = t.page(s, 1);
        break;
      case "PageDown":
        i = t.page(s, -1);
        break;
      default:
        return;
    }
    e.preventDefault(), e.stopPropagation(), this.commit(i);
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
    const i = this.scale.fromPosition(1 - (e.clientY - s.top) / s.height);
    i !== this.dragValue && (this.dragValue = i, this.emit(i, !0));
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
    const e = this.scale, t = e.clamp(this.current), s = e.toPosition(t), i = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick);
    return c`
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
          ${this.mode === "gain" ? c`<div class="unity"></div>` : u}
          <div class="fill" style="height: ${dt(s)}"></div>
          ${i === null ? u : c`<div class="tick" style="bottom: ${dt(e.toPosition(i))}" title=${e.format(i)}></div>`}
          <div class="knob" style="bottom: calc(${dt(s)} - ${Math.round((s - 0.5) * xt * 10) / 10}px - ${xt / 2}px)"></div>
        </div>
        <div class="value">${e.format(t)}</div>
      </div>
    `;
  }
};
L.styles = S`
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
      height: ${xt}px;
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
  `;
F([
  h({ type: Number })
], L.prototype, "value", 2);
F([
  h({ type: Boolean, reflect: !0 })
], L.prototype, "disabled", 2);
F([
  h({ type: Boolean })
], L.prototype, "focusable", 2);
F([
  h({ type: String })
], L.prototype, "label", 2);
F([
  h({ type: String })
], L.prototype, "mode", 2);
F([
  h({ type: Number })
], L.prototype, "max", 2);
F([
  h({ type: Number })
], L.prototype, "precision", 2);
F([
  h({ type: Number })
], L.prototype, "tick", 2);
F([
  g()
], L.prototype, "dragValue", 2);
L = F([
  E("al-fader")
], L);
const Zr = { ATTRIBUTE: 1 }, Qr = (e) => (...t) => ({ _$litDirective$: e, values: t });
class eo {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, s, i) {
    this._$Ct = t, this._$AM = s, this._$Ci = i;
  }
  _$AS(t, s) {
    return this.update(t, s);
  }
  update(t, s) {
    return this.render(...s);
  }
}
const rs = Qr(class extends eo {
  constructor(e) {
    if (super(e), e.type !== Zr.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(e) {
    return " " + Object.keys(e).filter((t) => e[t]).join(" ") + " ";
  }
  update(e, [t]) {
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), e.strings !== void 0 && (this.nt = new Set(e.strings.join(" ").split(/\s/).filter((i) => i !== "")));
      for (const i in t) t[i] && !this.nt?.has(i) && this.st.add(i);
      return this.render(t);
    }
    const s = e.element.classList;
    for (const i of this.st) i in t || (s.remove(i), this.st.delete(i));
    for (const i in t) {
      const n = !!t[i];
      n === this.st.has(i) || this.nt?.has(i) || (n ? (s.add(i), this.st.add(i)) : (s.remove(i), this.st.delete(i)));
    }
    return ne;
  }
});
var to = Object.defineProperty, so = Object.getOwnPropertyDescriptor, it = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? so(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && to(t, s, n), n;
};
const io = (e) => `${Math.round(e * 1e3) / 10}%`;
let $e = class extends $ {
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
    return c`
      <div class="meter">
        <div class=${rs({ fill: !0, hot: e > 0.9 })} style="width: ${io(e)}"></div>
      </div>
      <div class=${rs({ dot: !0, gated: this.gated })}></div>
    `;
  }
};
$e.styles = S`
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
it([
  h({ type: Number })
], $e.prototype, "value", 2);
it([
  h({ type: Number })
], $e.prototype, "max", 2);
it([
  h({ type: Boolean })
], $e.prototype, "gated", 2);
$e = it([
  E("al-meter")
], $e);
var no = Object.defineProperty, ro = Object.getOwnPropertyDescriptor, k = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ro(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && no(t, s, n), n;
};
const oo = 250;
let x = class extends $ {
  constructor() {
    super(...arguments), this.label = "", this.depth = 0, this.hasChildren = !1, this.expanded = !1, this.childCount = 0, this.value = 0, this.realValue = 0, this.maxValue = 5, this.precision = 1, this.liveNow = 0, this.muted = !1, this.selected = !1, this.narrow = !1, this.errors = 0, this.pending = null, this.dragging = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.hasAttribute("tabindex") || (this.tabIndex = -1);
  }
  disconnectedCallback() {
    this.clearStepTimer(), super.disconnectedCallback();
  }
  willUpdate(e) {
    (e.has("liveNow") || e.has("value")) && !this.dragging && (this.pending = null), (!this.hasUpdated || e.has("depth")) && this.style.setProperty("--al-depth", String(this.depth));
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
    this.dispatchEvent(Pn());
  }
  /** Opening a track's children is its own intent: it must not also read as selecting it. */
  onChevron(e) {
    e.stopPropagation(), this.dispatchEvent(Ln());
  }
  /**
   * Enter and Space on the chevron are the button's own; the mixer listens for them on the
   * whole row and would toggle the same track a second time.
   */
  onChevronKey(e) {
    (e.key === "Enter" || e.key === " ") && e.stopPropagation();
  }
  clearStepTimer() {
    this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
  }
  sendOverride(e) {
    this.clearStepTimer(), this.dispatchEvent(es(e));
  }
  /**
   * A fader move. A drag reports its steps live and settles on pointer-up, which is the
   * user saying "there" - that goes out at once. A keyboard or wheel step settles
   * immediately with no live moves before it, so a run of them is coalesced instead.
   */
  onFader(e) {
    e.stopPropagation();
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
      this.stepTimer = void 0, this.dispatchEvent(es(t));
    }, oo);
  }
  onMute() {
    this.dispatchEvent(On(!this.muted));
  }
  onReset() {
    this.dispatchEvent(Mn());
  }
  render() {
    const e = this.pending ?? this.value;
    return c`
      <div class="strip" @click=${this.select}>
        <div class="depth"></div>
        <div class="head">
          <span class="name" title=${this.label}>${this.label}</span>
        </div>
        ${this.hasChildren ? c`<button
              class="chevron"
              type="button"
              tabindex=${this.stop}
              aria-expanded=${this.expanded ? "true" : "false"}
              title=${`${this.expanded ? "Collapse" : "Expand"} ${this.label}`}
              @click=${this.onChevron}
              @keydown=${this.onChevronKey}
            >
              ${this.expanded ? "▾" : "▸"} ${this.childCount}
            </button>` : u}
        <al-fader
          mode="level"
          .value=${e}
          .max=${this.maxValue}
          .precision=${this.precision}
          .tick=${this.realValue}
          .focusable=${this.selected}
          label=${`${this.label} level`}
          @value-changed=${this.onFader}
        ></al-fader>
        <div class="readout">${et(e, this.precision)}</div>
        <div class="buttons">
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
        </div>
        <div class="foot">
          ${this.errors > 0 ? c`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : u}
        </div>
      </div>
    `;
  }
};
x.styles = S`
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
    :host([selected]),
    :host(:focus-visible) {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    :host([muted]) .name,
    :host([muted]) .readout {
      opacity: 0.55;
    }
    .strip {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      min-width: 0;
      /* Each level of nesting steps the content right, past its parent's marker. */
      padding-left: calc(var(--al-depth, 0) * 5px + 6px);
    }
    /* The depth marker: a bar down the left, inset and faded one step per level, so a
       child reads as sitting under the parent it follows in the row. */
    .depth {
      position: absolute;
      left: calc(var(--al-depth, 0) * 5px);
      top: 0;
      bottom: 0;
      width: 3px;
      border-radius: 2px;
      background: var(--primary-color);
      opacity: calc(1 - var(--al-depth, 0) * 0.22);
    }
    .head {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
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
    .chevron {
      color: var(--secondary-text-color);
      white-space: nowrap;
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
  `;
k([
  h({ type: String })
], x.prototype, "label", 2);
k([
  h({ type: Number })
], x.prototype, "depth", 2);
k([
  h({ type: Boolean })
], x.prototype, "hasChildren", 2);
k([
  h({ type: Boolean })
], x.prototype, "expanded", 2);
k([
  h({ type: Number })
], x.prototype, "childCount", 2);
k([
  h({ type: Number })
], x.prototype, "value", 2);
k([
  h({ type: Number })
], x.prototype, "realValue", 2);
k([
  h({ type: Number })
], x.prototype, "maxValue", 2);
k([
  h({ type: Number })
], x.prototype, "precision", 2);
k([
  h({ type: Number })
], x.prototype, "liveNow", 2);
k([
  h({ type: Boolean, reflect: !0 })
], x.prototype, "muted", 2);
k([
  h({ type: Boolean, reflect: !0 })
], x.prototype, "selected", 2);
k([
  h({ type: Boolean, reflect: !0 })
], x.prototype, "narrow", 2);
k([
  h({ type: Number })
], x.prototype, "errors", 2);
k([
  g()
], x.prototype, "pending", 2);
x = k([
  E("al-strip")
], x);
var ao = Object.defineProperty, lo = Object.getOwnPropertyDescriptor, D = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? lo(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && ao(t, s, n), n;
};
const co = ["sum", "max", "mean"], os = (e) => e.stopPropagation(), as = 0.1;
let T = class extends $ {
  constructor() {
    super(...arguments), this.label = "", this.mix = "sum", this.maxValue = 5, this.precision = 1, this.live = null, this.lights = 0, this.simEntityId = null, this.simOn = !1, this.blockedReason = null, this.selected = !1;
  }
  /** `0` on the selected strip, `-1` on every other one. */
  get stop() {
    return this.selected ? 0 : -1;
  }
  onMix(e) {
    this.dispatchEvent(Rn(e.target.value));
  }
  /**
   * `min` on a number input is advice to the browser, not a guarantee to us: it does not stop
   * a typed or pasted `0`, and `.value` reads back whatever is in the box. So the floor is
   * enforced here, and a rejected entry — empty, unreadable, or below the floor — puts the
   * committed ceiling back in the box rather than leaving a value we refused on screen.
   */
  onLimiter(e) {
    const t = e.target, s = t.value.trim(), i = Number(s);
    if (s === "" || !Number.isFinite(i) || i < as) {
      t.value = String(this.maxValue);
      return;
    }
    this.dispatchEvent(In(i));
  }
  onSim(e) {
    this.dispatchEvent(Nn(e.target.checked === !0));
  }
  render() {
    const e = this.blockedReason;
    return c`
      <div class="strip">
        <div class="name" title=${this.label}>${this.label}</div>
        <div class="muted">master</div>
        <div>
          <label for="mix">mix</label>
          <select
            id="mix"
            class="mix"
            tabindex=${this.stop}
            .value=${this.mix}
            @change=${this.onMix}
            @keydown=${os}
          >
            ${co.map((t) => c`<option value=${t} ?selected=${t === this.mix}>${t}</option>`)}
          </select>
        </div>
        <div>
          <label for="limiter">limiter</label>
          <input
            id="limiter"
            class="limiter"
            type="number"
            tabindex=${this.stop}
            min=${as}
            step="0.1"
            .value=${String(this.maxValue)}
            @change=${this.onLimiter}
            @keydown=${os}
          />
        </div>
        <div class="muted">${this.precision} dp · ${this.lights} light${this.lights === 1 ? "" : "s"}</div>
        ${this.lights > 0 ? c`<div class="sim">
              <ha-switch
                tabindex=${this.stop}
                .checked=${this.simOn}
                .disabled=${this.simEntityId === null}
                title=${e ?? (this.simEntityId === null ? "No simulation switch for this group" : "Presence simulation")}
                @change=${this.onSim}
              ></ha-switch>
              <span class="muted">⏻</span>
            </div>` : u}
        ${this.live ? c`<al-meter .value=${this.live.value} .max=${this.live.max} .gated=${this.live.gated}></al-meter>` : u}
      </div>
    `;
  }
};
T.styles = S`
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
D([
  h({ type: String })
], T.prototype, "label", 2);
D([
  h({ type: String })
], T.prototype, "mix", 2);
D([
  h({ type: Number })
], T.prototype, "maxValue", 2);
D([
  h({ type: Number })
], T.prototype, "precision", 2);
D([
  h({ attribute: !1 })
], T.prototype, "live", 2);
D([
  h({ type: Number })
], T.prototype, "lights", 2);
D([
  h({ type: String })
], T.prototype, "simEntityId", 2);
D([
  h({ type: Boolean })
], T.prototype, "simOn", 2);
D([
  h({ type: String })
], T.prototype, "blockedReason", 2);
D([
  h({ type: Boolean })
], T.prototype, "selected", 2);
T = D([
  E("al-master-strip")
], T);
var ho = Object.defineProperty, uo = Object.getOwnPropertyDescriptor, G = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? uo(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && ho(t, s, n), n;
};
const po = 8e3, mo = (e) => {
  const t = e.composedPath()[0];
  return t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t instanceof HTMLTextAreaElement || t instanceof HTMLElement && t.isContentEditable;
}, fo = (e) => e instanceof Error ? e.message : String(e);
let I = class extends $ {
  constructor() {
    super(...arguments), this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.live = null, this.simState = {}, this.narrow = !1, this.commandError = null, this.pendingFocus = !1;
  }
  disconnectedCallback() {
    this.clearErrorTimer(), super.disconnectedCallback();
  }
  get tracks() {
    return this.config ? bt(this.config, this.nav) : [];
  }
  /** The group the master strip follows: whatever is selected, or the group that owns it. */
  get selected() {
    const { config: e, nav: t } = this;
    if (!e || t.selection === null) return null;
    const s = Es(t.selection), i = M(e, s);
    return i === void 0 ? null : { path: s, group: i };
  }
  isSelected(e) {
    return this.nav.selection !== null && f(this.nav.selection) === f(e);
  }
  navigate(e) {
    this.pendingFocus = !0, this.dispatchEvent(at(e));
  }
  emitChange(e, t) {
    this.dispatchEvent(oe(e, t));
  }
  clearErrorTimer() {
    this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
  }
  fail(e) {
    this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
      this.errorTimer = void 0, this.commandError = null;
    }, po);
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
    const i = this.hass;
    if (i)
      try {
        await t(i), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(Dn());
      } catch (n) {
        s?.settle(null), this.fail(`Could not ${e}: ${fo(n)}`);
      }
  }
  /** Which track an event came from: strips are identical, so the row index is the key. */
  trackOf(e) {
    const t = e.target?.dataset?.index;
    return t === void 0 ? null : this.tracks[Number(t)] ?? null;
  }
  onStripSelect(e) {
    const t = this.trackOf(e);
    t && this.dispatchEvent(at({ type: "select", path: t.path }));
  }
  onStripToggle(e) {
    const t = this.trackOf(e);
    t && this.navigate({ type: "toggle", id: t.id });
  }
  onLevelOverride(e) {
    const t = this.trackOf(e);
    if (!t) return;
    const s = e.target, { value: i } = e.detail;
    this.command(
      `set the level of ${t.id}`,
      async (n) => s.settle(await Hi(n, t.id, i)),
      s
    );
  }
  onMuteToggle(e) {
    const t = this.trackOf(e);
    if (!t) return;
    const { muted: s } = e.detail;
    this.command(`${s ? "mute" : "unmute"} ${t.id}`, (i) => zi(i, t.id, s));
  }
  onReset(e) {
    const t = this.trackOf(e);
    t && this.command(`reset ${t.id}`, (s) => Gi(s, t.id));
  }
  onMasterSelect() {
    const e = this.selected;
    e && this.dispatchEvent(at({ type: "select", path: e.path }));
  }
  onMix(e) {
    const { config: t } = this, s = this.selected;
    if (!t || !s) return;
    const { mix: i } = e.detail;
    this.emitChange(C(t, [...s.path, "mix"], i));
  }
  onLimiter(e) {
    const { config: t } = this, s = this.selected;
    if (!t || !s) return;
    const { value: i } = e.detail;
    this.emitChange(
      C(t, [...s.path, "max_value"], i),
      `${f(s.path)}:limiter`
    );
  }
  onSim(e) {
    const t = this.selected;
    if (!t) return;
    const { on: s } = e.detail;
    this.dispatchEvent(Ps(t.group.id, s));
  }
  /** Console keys: ←/→ walk the row, Enter or Space opens and closes, Home/End jump. */
  onKeyDown(e) {
    const t = this.config;
    if (!(!t || mo(e)))
      switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft":
          e.preventDefault(), this.navigate({ type: "arrow", delta: e.key === "ArrowRight" ? 1 : -1, config: t });
          break;
        case "Enter":
        case " ": {
          const s = this.nav.selection, i = s === null ? void 0 : this.tracks.find((n) => f(n.path) === f(s));
          if (!i?.hasChildren) return;
          e.preventDefault(), this.navigate({ type: "toggle", id: i.id });
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
    const t = this.shadowRoot?.querySelector('.strips > [tabindex="0"]');
    if (t) {
      e && t.focus();
      try {
        t.scrollIntoView?.({ inline: "nearest", block: "nearest" });
      } catch {
      }
    }
  }
  renderTrack(e, t, s) {
    const i = M(e, t.path);
    if (!i) return c``;
    const n = this.live?.groups[i.id], r = this.isSelected(t.path);
    return c`
      <al-strip
        data-index=${s}
        tabindex=${r ? 0 : -1}
        ?narrow=${this.narrow}
        .label=${i.name ?? i.id}
        .depth=${t.depth}
        .hasChildren=${t.hasChildren}
        .expanded=${t.expanded}
        .childCount=${i.children.length}
        .value=${n?.value ?? 0}
        .liveNow=${this.live?.now ?? 0}
        .realValue=${n?.real_value ?? 0}
        .maxValue=${n?.max_value ?? i.max_value ?? e.defaults.max_value}
        .precision=${n?.precision ?? Ve(e, i)}
        .muted=${n?.muted ?? !1}
        .selected=${r}
        .errors=${Ce(this.errors, t.path)}
      ></al-strip>
    `;
  }
  renderMaster(e) {
    const t = this.selected;
    if (!t) return u;
    const { group: s, path: i } = t, n = this.live?.groups[s.id], r = n ? { value: n.value, max: n.max_value, gated: n.gated } : null, o = Tt(s.id), a = this.isSelected(i);
    return c`
      <al-master-strip
        tabindex="-1"
        .selected=${a}
        ?narrow=${this.narrow}
        .label=${(s.name ?? s.id).toUpperCase()}
        .mix=${s.mix}
        .maxValue=${s.max_value ?? e.defaults.max_value}
        .precision=${n?.precision ?? Ve(e, s)}
        .live=${r}
        .lights=${n?.lights ?? 0}
        .simEntityId=${o}
        .simOn=${this.hass?.states[o]?.state === "on"}
        .blockedReason=${this.simState[s.id]?.blocked ?? null}
        @click=${this.onMasterSelect}
      ></al-master-strip>
    `;
  }
  render() {
    const e = this.config;
    return !e || e.groups.length === 0 ? c`<div class="empty muted">Nothing to mix: add a group first.</div>` : c`
      ${this.commandError === null ? u : c`<ha-alert
            class="command-error"
            alert-type="error"
            dismissable
            @alert-dismissed-clicked=${() => {
      this.clearErrorTimer(), this.commandError = null;
    }}
            >${this.commandError}</ha-alert
          >`}
      <div
        class="strips"
        role="group"
        aria-label="Mixer"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-toggle-strip=${this.onStripToggle}
        @al-level-override=${this.onLevelOverride}
        @al-mute-toggle=${this.onMuteToggle}
        @al-reset=${this.onReset}
        @al-mix-changed=${this.onMix}
        @al-limiter-changed=${this.onLimiter}
        @al-sim-toggled=${this.onSim}
      >
        ${this.tracks.map((t, s) => this.renderTrack(e, t, s))}${this.renderMaster(e)}
      </div>
    `;
  }
};
I.styles = [
  O,
  S`
      :host {
        display: block;
        background: none;
      }
      .strips {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        overflow-x: auto;
        padding: 4px;
        outline: none;
      }
      /* The master sits at the right of the row, past every track, like a console. */
      al-master-strip {
        margin-left: auto;
        position: sticky;
        right: 0;
      }
      .empty {
        padding: 8px 4px;
      }
    `
];
G([
  h({ attribute: !1 })
], I.prototype, "hass", 2);
G([
  h({ attribute: !1 })
], I.prototype, "config", 2);
G([
  h({ attribute: !1 })
], I.prototype, "nav", 2);
G([
  h({ attribute: !1 })
], I.prototype, "errors", 2);
G([
  h({ attribute: !1 })
], I.prototype, "live", 2);
G([
  h({ attribute: !1 })
], I.prototype, "simState", 2);
G([
  h({ type: Boolean, reflect: !0 })
], I.prototype, "narrow", 2);
G([
  g()
], I.prototype, "commandError", 2);
I = G([
  E("al-mixer")
], I);
const go = {
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
}, vo = {
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400
};
function $o(e, t, s) {
  return {
    start: e - go[t],
    end: e,
    resolution: t === "24h" ? "5m" : "1h",
    forecastUntil: s === "off" ? void 0 : e + vo[s]
  };
}
function bo(e, t, s) {
  const i = t - e || 1;
  return (n) => (n - e) / i * s;
}
function yo(e, t, s = 4) {
  const i = e || 1, n = t - 2 * s;
  return (r) => t - s - r / i * n;
}
function Ke(e, t) {
  t = Math.max(4, t);
  const s = e.length;
  if (s <= t) return e;
  const i = Math.max(1, Math.floor(t / 2)), n = Math.ceil(s / i), r = [];
  for (let o = 0; o < s; o += n) {
    const a = Math.min(o + n, s);
    let l = e[o], d = e[o];
    for (let p = o + 1; p < a; p++) {
      const m = e[p];
      m[1] < l[1] && (l = m), m[1] > d[1] && (d = m);
    }
    l === d ? r.push(l) : l[0] <= d[0] ? r.push(l, d) : r.push(d, l);
  }
  return r[0] !== e[0] && (r[0] = e[0]), r[r.length - 1] !== e[s - 1] && (r[r.length - 1] = e[s - 1]), r;
}
function wt(e, t, s) {
  return e.length === 0 ? "" : e.map(([i, n], r) => `${r === 0 ? "M" : "L"}${t(i)},${s(n)}`).join(" ");
}
function xo(e, t, s, i = 1 / 0) {
  if (e.p75.length === 0) return "";
  const n = (l) => l.map((d, p) => [e.t0 + p * e.step, d]), r = Ke(n(e.p75), i), o = Ke(n(e.p25), i).reverse();
  return `${[...r, ...o].map(([l, d], p) => `${p === 0 ? "M" : "L"}${t(l)},${s(d)}`).join(" ")} Z`;
}
function wo(e, t) {
  return e[t].map((s, i) => [e.t0 + i * e.step, s]);
}
function _o(e, t, s, i, n) {
  const r = e[e.length - 1];
  return !r || t <= r[0] || t < i || t > n ? [] : [r, [t, s]];
}
function ut(e, t, s) {
  return e.map(([i, n, r]) => ({ x0: t(i), x1: t(n ?? s), tag: r }));
}
function ls(e, t) {
  if (e.length === 0) return -1;
  let s = 0, i = e.length - 1;
  for (; s < i; ) {
    const n = s + i >> 1;
    e[n][0] < t ? s = n + 1 : i = n;
  }
  return s > 0 && Math.abs(e[s - 1][0] - t) <= Math.abs(e[s][0] - t) ? s - 1 : s;
}
function So(e) {
  return [e.group_id, e.start, e.end, e.resolution, e.include_children ?? !1, e.forecast_until ?? ""].join("|");
}
var Eo = Object.defineProperty, ko = Object.getOwnPropertyDescriptor, w = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ko(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Eo(t, s, n), n;
};
const pe = 32, Ao = 28, Co = 4, cs = 8, To = 800, Po = 220, Lo = 160, pt = 2e3, Oo = 6e4, Mo = 1e4, ii = 6e4, Ro = 32, Io = ["24h", "7d", "30d"], No = ["off", "24h", "7d"], hs = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], Do = (e) => `hsl(${e * 67 % 360} 55% 62%)`, B = /* @__PURE__ */ new Map(), Ue = /* @__PURE__ */ new Map();
function ds(e, t) {
  const s = Date.now();
  for (const [i, n] of B) s - n.at >= ii && B.delete(i);
  B.delete(e), B.set(e, { at: s, data: t });
  for (const i of B.keys()) {
    if (B.size <= Ro) break;
    B.delete(i);
  }
}
const Uo = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", Fo = (e, t) => {
  const s = new Date(e * 1e3);
  return t <= 2 * 86400 ? s.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : s.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}, mt = (e) => String(Math.round(e * 100) / 100), ft = (e, t, s) => Math.min(s, Math.max(t, e));
function jo(e, t, s, i) {
  const n = Math.max(1, i.width - pe), r = Math.max(1, i.height - Ao), o = s.start, a = Math.max(s.until, s.end), l = bo(o, a, n), d = yo(i.maxValue, r), p = Object.keys(e.series), m = p.includes(t) ? t : p[0] ?? t, P = (v, Y) => {
    const he = Ke(e.series[v] ?? [], pt);
    return { id: v, points: he, d: wt(he, l, d), color: Y };
  }, U = P(m, "var(--primary-color)"), ce = i.showChannels ? p.filter((v) => v !== m).map((v, Y) => P(v, Do(Y))) : [], Ie = e.forecast, ni = Ie ? Uo(xo(Ie, l, d, pt)) : "", ri = Ie ? wt(Ke(wo(Ie, "p50"), pt), l, d) : "", Ne = [];
  for (const [, , v] of e.day_types) Ne.includes(v) || Ne.push(v);
  const Nt = (v) => hs[Ne.indexOf(v) % hs.length], oi = ut(
    e.day_types.map(([v, Y, he]) => [v, Y, he]),
    l,
    a
  ).map((v) => ({ ...v, fill: Nt(v.tag) })), ai = ut(
    Object.entries(e.lights).flatMap(
      ([v, Y]) => Y.map(([he, ci]) => [he, ci, v])
    ),
    l,
    a
  ), li = ut(e.plan, l, a);
  return {
    busId: m,
    bus: U,
    children: ce,
    band: ni,
    p50: ri,
    dayTypes: oi,
    legend: Ne.map((v) => ({ tag: v, fill: Nt(v) })),
    lights: ai,
    plan: li,
    x: l,
    y: d,
    t0: o,
    t1: a,
    plotW: n,
    plotH: r
  };
}
let b = class extends $ {
  constructor() {
    super(...arguments), this.groupId = null, this.heading = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = Je, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = To, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
  }
  get height() {
    return this.narrow ? Lo : Po;
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
    }, Oo), this.load();
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
    }, Mo)));
  }
  willUpdate(e) {
    const t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), s = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
    (t || s) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
  }
  query(e) {
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = $o(t, this.range, this.horizon);
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
    const i = this.query(s), n = So(i), r = e ? void 0 : B.get(n);
    if (r && Date.now() - r.at < ii) {
      this.seq++, this.loaded = { q: i, data: r.data }, this.error = null, ds(n, r.data);
      return;
    }
    let o = e ? void 0 : Ue.get(n);
    if (!o) {
      const l = Di(t, i);
      o = l, Ue.set(n, l), l.then(
        (d) => ds(n, d),
        () => {
        }
      ).finally(() => {
        Ue.get(n) === l && Ue.delete(n);
      });
    }
    const a = ++this.seq;
    try {
      const l = await o;
      if (a !== this.seq) return;
      this.loaded = { q: i, data: l }, this.error = null;
    } catch (l) {
      if (a !== this.seq) return;
      this.error = l.message || String(l);
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
    if (s && s.key.length === t.length && s.key.every((n, r) => n === t[r])) return s.value;
    const i = jo(
      e.data,
      e.q.group_id,
      { start: e.q.start, end: e.q.end, until: e.q.forecast_until ?? e.q.end },
      { width: this.width, height: this.height, maxValue: this.maxValue, showChannels: this.showChannels }
    );
    return this.memo = { key: t, value: i }, i;
  }
  /**
   * "now" follows the live poll when there is one and the real clock otherwise, so the
   * line keeps moving between refetches even though the window itself is quantized.
   */
  nowAt(e) {
    return ft(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
  }
  /**
   * The live tail, in plot-local pixels: the recorded line's last sample joined to the
   * reading this live frame carries. It costs no round trip, so it moves on every frame
   * while the recorded history behind it catches up on its own schedule.
   */
  tailPath(e) {
    const t = this.groupId, s = this.live;
    if (t === null || s === null) return "";
    const i = s.groups[t];
    return !i || e.bus.id !== t ? "" : wt(_o(e.bus.points, s.now, i.value, e.t0, e.t1), e.x, e.y);
  }
  emitSettings() {
    this.dispatchEvent(
      Un({
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
    const i = e.currentTarget.getBoundingClientRect(), n = i.width > 0 ? this.width / i.width : 1, r = (e.clientX - i.left) * n - pe, o = ft(r / t.plotW, 0, 1);
    return t.t0 + o * (t.t1 - t.t0);
  }
  onMove(e) {
    const t = this.paths;
    !t || t.bus.points.length === 0 || (this.cursorIndex = ls(t.bus.points, this.timeAt(e, t)));
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
    const i = (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1);
    this.cursorIndex = this.cursorIndex === null ? i > 0 ? 0 : s : ft(this.cursorIndex + i, 0, s);
  }
  renderChips() {
    const e = this.learningHint;
    return c`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${Io.map(
      (t) => c`
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
          ${No.map((t) => {
      const s = t !== "off" && !this.forecastReady;
      return c`
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
        ${e ? c`<span class="muted hint" title=${e}>${e}</span>` : u}
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
    const t = this.width, s = this.height, i = e.x(this.nowAt(e)), n = this.tailPath(e), r = e.plotH + Co, o = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), a = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
    return c`
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
      (l) => A`
            <line class="grid" x1=${pe} y1=${e.y(this.maxValue * l)} x2=${t} y2=${e.y(this.maxValue * l)}></line>
            <text class="ytick" x=${pe - 4} y=${e.y(this.maxValue * l) + 3} text-anchor="end">
              ${mt(this.maxValue * l)}
            </text>
          `
    )}
        <g transform="translate(${pe},0)">
          ${e.dayTypes.map(
      (l) => A`<rect
              class="daytype"
              x=${l.x0}
              y="0"
              width=${Math.max(0, l.x1 - l.x0)}
              height=${e.plotH}
              fill=${l.fill}
            ></rect>`
    )}
          ${e.band ? A`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? A`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((l) => A`<path class="child" d=${l.d} stroke=${l.color}></path>`)}
          ${e.bus.d ? A`<path class="bus" d=${e.bus.d}></path>` : u}
          ${n ? A`<path class="tail" d=${n}></path>` : u}
          ${this.showLights ? e.lights.map(
      (l) => A`<rect
                  class="light"
                  x=${l.x0}
                  y=${r}
                  width=${Math.max(1, l.x1 - l.x0)}
                  height=${cs}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`
    ) : u}
          ${this.showLights ? e.plan.map(
      (l) => A`<rect
                  class="plan"
                  x=${l.x0}
                  y=${r}
                  width=${Math.max(1, l.x1 - l.x0)}
                  height=${cs}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`
    ) : u}
          <line class="now" x1=${i} y1="0" x2=${i} y2=${e.plotH}></line>
          <text class="now-label" x=${i + 3} y="10">now</text>
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
      ([i, n]) => A`<text class="xlabel" x=${i * e.plotW} y=${t} text-anchor=${n}>
        ${Fo(e.t0 + i * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`
    );
  }
  renderTooltip(e) {
    const t = this.cursorIndex;
    if (t === null) return u;
    const s = e.bus.points[t];
    if (!s) return u;
    const [i, n] = s, o = (pe + e.x(i)) / this.width * 100, a = this.loaded?.data.day_types.find(([l, d]) => i >= l && i < d)?.[2];
    return c`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${new Date(i * 1e3).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${mt(n)}</span>
        </div>
        ${e.children.map((l) => {
      const d = ls(l.points, i), p = l.points[d];
      return p ? c`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${l.color}"></span>
                  <span class="tt-name">${l.id}</span>
                  <span class="tt-value">${mt(p[1])}</span>
                </div>
              ` : u;
    })}
        ${a ? c`<div class="tt-daytype muted">${a}</div>` : u}
      </div>
    `;
  }
  render() {
    if (this.groupId === null)
      return c`<div class="placeholder muted">Select a strip to see its timeline.</div>`;
    const e = this.paths;
    return c`
      ${this.renderChips()}
      ${e ? this.renderChart(e) : c`<div class="placeholder muted">Loading…</div>`}
      ${e && e.legend.length > 0 ? c`
            <div class="legend">
              ${e.legend.map(
      (t) => c`
                  <span class="legend-item">
                    <span class="swatch" style="background: ${t.fill}"></span>${t.tag}
                  </span>
                `
    )}
            </div>
          ` : u}
      ${this.error ? c`<div class="error">Timeline: ${this.error}</div>` : u}
      ${e ? this.renderTooltip(e) : u}
    `;
  }
};
b.styles = [
  O,
  S`
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
w([
  h({ attribute: !1 })
], b.prototype, "hass", 2);
w([
  h({ attribute: !1 })
], b.prototype, "groupId", 2);
w([
  h({ attribute: !1 })
], b.prototype, "heading", 2);
w([
  h({ attribute: !1 })
], b.prototype, "range", 2);
w([
  h({ attribute: !1 })
], b.prototype, "horizon", 2);
w([
  h({ type: Boolean })
], b.prototype, "showChannels", 2);
w([
  h({ type: Boolean })
], b.prototype, "showLights", 2);
w([
  h({ attribute: !1 })
], b.prototype, "live", 2);
w([
  h({ type: Number })
], b.prototype, "maxValue", 2);
w([
  h({ attribute: !1 })
], b.prototype, "profileState", 2);
w([
  h({ type: Number })
], b.prototype, "minDays", 2);
w([
  h({ type: Boolean, reflect: !0 })
], b.prototype, "narrow", 2);
w([
  h({ type: Boolean })
], b.prototype, "paused", 2);
w([
  g()
], b.prototype, "cursorIndex", 2);
w([
  g()
], b.prototype, "width", 2);
w([
  g()
], b.prototype, "loaded", 2);
w([
  g()
], b.prototype, "error", 2);
b = w([
  E("al-timeline")
], b);
var Ho = Object.defineProperty, zo = Object.getOwnPropertyDescriptor, V = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? zo(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Ho(t, s, n), n;
};
const us = ["envelope", "gain", "to", "key"], ps = ["name", "mix", "null_handling", "gain"], Go = 5, Vo = (e) => e[e.length - 2] === "stimuli";
let N = class extends $ {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.simLog = null, this.toText = null;
  }
  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  willUpdate(e) {
    if (e.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !e.has("config")) return;
    const { config: t, path: s } = this, i = t && s ? fe(t, s) : void 0;
    i && (Ys(i.to, this.toText) || (this.toText = null));
  }
  emitChange(e, t) {
    this.dispatchEvent(oe(e, t));
  }
  /** Writes one nullable field of the selected node, e.g. an envelope or output override. */
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(C(s, [...i, e], t), `${f(i)}:${e}`);
  }
  onChannelForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = fe(t, s);
    if (!i) return;
    const n = e.detail?.value ?? {};
    this.toText = String(n.to ?? "");
    const r = Ks(i, n), o = Xs(r, i);
    o !== void 0 && this.emitChange(C(t, s, r), `${f(s)}:${o}`);
  }
  onBusForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = M(t, s);
    if (!i) return;
    const n = js(i, e.detail?.value ?? {}), r = Hs(n, i);
    r !== void 0 && this.emitChange(C(t, s, n), `${f(s)}:${r}`);
  }
  /** The switch is Home Assistant's, so this reports the wanted state and lets the shell call it. */
  onSim(e, t) {
    this.dispatchEvent(Ps(e, t.target.checked === !0));
  }
  onRebuild() {
    this.dispatchEvent(Ls());
  }
  renderChannel(e, t) {
    const s = fe(e, t);
    if (!s) return c`<ha-card><span class="muted">This channel no longer exists.</span></ha-card>`;
    const i = se(this.errors, t), n = this.errors.filter((o) => o.path === f(t)), r = $t(e, s);
    return c`
      <ha-card header=${s.key ?? s.entity}>
        ${n.map((o) => c`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${qs(s, this.toText, us)}
              .schema=${Ws(e, us)}
              .error=${i}
              .computeLabel=${zs}
              .computeHelper=${Gs}
              @value-changed=${this.onChannelForm}
            ></ha-form>
            ${this.renderVoice(e, t, s)}
          </div>
          <div class="col">
            ${yt.map(
      (o) => c`<al-override-field
                .hass=${this.hass}
                .label=${o.label}
                .kind=${o.kind}
                .selector=${o.selector}
                .value=${s[o.name]}
                .inherited=${r[o.name]}
                .inheritedFrom=${Js(e, s, o.name)}
                .error=${i[o.name]}
                @value-changed=${(a) => this.setField(o.name, a.detail.value)}
              ></al-override-field>`
    )}
            <al-envelope-sketch .envelope=${r}></al-envelope-sketch>
          </div>
        </div>
      </ha-card>
    `;
  }
  /** The voice this channel is driving right now, matched the way the engine labels it. */
  renderVoice(e, t, s) {
    const i = M(e, Me(t)), n = this.live?.voices[i?.id ?? ""]?.find((o) => o.label === (s.key ?? s.entity));
    if (!n) return u;
    const r = Zs(this.live?.now, n.phase_ends);
    return c`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${n.phase}">${n.phase}</span>
      <span class="chip value">${n.value.toFixed(2)}</span>
      ${r !== null ? c`<span class="muted chip">ends in ${r}</span>` : u}
      <span class="dot ${n.gate ? "gated" : ""}" title=${n.gate ? "Gate open" : "Gate closed"}></span>
    </div>`;
  }
  renderBus(e, t) {
    const s = M(e, t);
    if (!s) return c`<ha-card><span class="muted">This bus no longer exists.</span></ha-card>`;
    const i = t.length === 2, n = se(this.errors, t), r = this.errors.filter((o) => o.path === f(t));
    return c`
      <ha-card header=${s.name ?? s.id}>
        ${r.map((o) => c`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${Fs(s, i, ps)}
              .schema=${Us(s, i, ps)}
              .error=${n}
              .computeLabel=${Ms}
              .computeHelper=${Rs}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${Is}
              .value=${s.max_value}
              .inherited=${e.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${n.max_value}
              @value-changed=${(o) => this.setField("max_value", o.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              label="Precision"
              kind="select"
              .selector=${Ns}
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
    const i = ot(e).enabled && on(e).has(t.id);
    return c`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${i ? this.renderPresence(e, t, s) : u}
        ${t.stimuli.length === 0 && !i ? c`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((n, r) => this.renderStimulus(e, [...s, "stimuli", r], n))}
      </div>
    `;
  }
  /**
   * The room's presence channel: a stimulus with no entity. It is fed by the room
   * estimate rather than by a sensor, so there is nothing to point at - but its gain
   * and its envelope are tuned here like any other channel's.
   */
  renderPresence(e, t, s) {
    const i = t.presence ?? vt(), n = $t(e, {
      ...i,
      envelope: i.envelope ?? ot(e).envelope
    }), r = this.live?.voices[t.id]?.find((a) => a.label === tn), o = se(this.errors, [...s, "presence"]);
    return c`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${r ? c`<span class="chip phase ${r.phase}">${r.phase}</span>` : u}
        </div>
        <ha-selector
          class="presence-envelope"
          .hass=${this.hass}
          .selector=${{ select: { mode: "dropdown", options: Bs(e) } }}
          .label=${"Envelope preset"}
          .required=${!1}
          .value=${i.envelope ?? ""}
          @value-changed=${(a) => this.setPresence(s, "envelope", a.detail.value === "" ? null : a.detail.value)}
        ></ha-selector>
        <al-override-field
          class="presence-gain"
          .hass=${this.hass}
          label="Gain"
          kind="number"
          .selector=${Vs}
          .value=${i.gain}
          .inherited=${1}
          .inheritedFrom=${"presence"}
          .error=${o.gain}
          @value-changed=${(a) => this.setPresence(s, "gain", a.detail.value ?? 1)}
        ></al-override-field>
        ${yt.map(
      (a) => c`<al-override-field
            class="presence-${a.name}"
            .hass=${this.hass}
            .label=${a.label}
            .kind=${a.kind}
            .selector=${a.selector}
            .value=${i[a.name]}
            .inherited=${n[a.name]}
            .inheritedFrom=${i.envelope ?? ot(e).envelope ?? "defaults"}
            .error=${o[a.name]}
            @value-changed=${(l) => this.setPresence(s, a.name, l.detail.value)}
          ></al-override-field>`
    )}
        <al-envelope-sketch .envelope=${n}></al-envelope-sketch>
      </ha-expansion-panel>
    `;
  }
  setPresence(e, t, s) {
    const i = this.config;
    if (!i) return;
    const n = M(i, e);
    if (!n) return;
    const r = C(i, [...e, "presence"], {
      ...n.presence ?? vt(),
      [t]: s
    });
    this.emitChange(r, `${f(e)}:presence:${t}`);
  }
  renderStimulus(e, t, s) {
    const i = this.hass?.states[s.entity], n = i?.attributes.friendly_name ?? (s.entity || "(no entity)"), r = Ce(this.errors, t);
    return c`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:flash"></ha-icon>
          <span class="name">${s.key ?? n}</span>
          ${r ? c`<span class="badge" title="${r} problem(s)">${r}</span>` : u}
          ${i ? c`<span class="muted chip">${i.state}</span>` : u}
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
    const s = t.id, i = this.live?.groups[s]?.precision ?? Ve(e, t), n = this.live?.groups[s]?.lights ?? 0, r = this.hass?.states[Tt(s)], o = this.simLog?.blocked[s] ?? null, a = (this.simLog?.entries ?? []).filter((l) => l.group_id === s).sort((l, d) => d.t - l.t).slice(0, Go);
    return c`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${n} light${n === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${n > 0 ? c`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${r?.state === "on"}
                .disabled=${r === void 0}
                title=${r === void 0 ? "No simulation switch for this bus" : "Presence simulation"}
                @change=${(l) => this.onSim(s, l)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : u}
        ${o !== null ? c`<div class="muted blocked">Blocked: ${o}</div>` : u}
        ${this.renderSensor("expected", "Expected", _s(s), i)}
        ${this.renderSensor("anomaly", "Anomaly", Bi(s), i)}
        <div class="muted readiness">${this.readiness(e, s)}</div>
        ${a.length > 0 ? c`<ol class="log">
              ${a.map((l) => this.renderLogEntry(l))}
            </ol>` : c`<div class="muted">No simulated light changes yet.</div>`}
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
  renderSensor(e, t, s, i) {
    const n = this.hass?.states[s], r = n?.attributes.day_type, o = n?.state, a = o === void 0 ? NaN : Number(o), l = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(a) ? et(a, i) : o;
    return c`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${l}</span>
      ${typeof r == "string" ? c`<span class="muted">${r}</span>` : u}
    </div>`;
  }
  renderLogEntry(e) {
    return c`<li>
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
    const i = s.profile.groups[t]?.days ?? 0, n = e.defaults.patterns?.min_days ?? Je;
    return s.ready[t] === !0 ? `Profile ready · ${i} days learned` : `Learning… ${i}/${n} days`;
  }
  render() {
    const { config: e, path: t } = this;
    return !e || !t || t.length === 0 ? c`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Vo(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
  }
};
N.styles = [
  O,
  S`
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
      .live {
        margin-top: 8px;
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
V([
  h({ attribute: !1 })
], N.prototype, "hass", 2);
V([
  h({ attribute: !1 })
], N.prototype, "config", 2);
V([
  h({ attribute: !1 })
], N.prototype, "path", 2);
V([
  h({ attribute: !1 })
], N.prototype, "errors", 2);
V([
  h({ attribute: !1 })
], N.prototype, "live", 2);
V([
  h({ attribute: !1 })
], N.prototype, "profileState", 2);
V([
  h({ attribute: !1 })
], N.prototype, "simLog", 2);
V([
  g()
], N.prototype, "toText", 2);
N = V([
  E("al-strip-controls")
], N);
var Bo = Object.defineProperty, Wo = Object.getOwnPropertyDescriptor, ye = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Wo(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Bo(t, s, n), n;
};
const qo = 50;
function ms(e) {
  const t = [], s = (i) => {
    t.push({ id: i.id, label: i.name ?? i.id, precision: e ? Ve(e, i) : 0 }), i.children.forEach(s);
  };
  return e?.groups.forEach(s), t;
}
function Ko(e, t) {
  if (e === void 0) return "—";
  const s = Number(e);
  return e.trim() !== "" && Number.isFinite(s) ? et(s, t) : e;
}
const fs = (e) => new Date(e * 1e3).toLocaleDateString();
let K = class extends $ {
  constructor() {
    super(...arguments), this.profileState = null, this.simLog = null, this.force = !1;
  }
  onRebuild() {
    this.dispatchEvent(Ls(this.force));
  }
  renderStatus() {
    const e = this.profileState;
    if (!e) return c`<div class="status muted">Profile not loaded yet.</div>`;
    const { producer: t, generated_at: s, training_window: i, day_types: n, slot_minutes: r } = e.profile;
    return c`
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
          <span class="window">${fs(i[0])} – ${fs(i[1])}</span>
        </div>
        <div class="muted">${n.join(", ")} · ${r}-minute slots</div>
      </div>
    `;
  }
  renderReadiness() {
    const e = this.profileState, t = ms(this.config);
    if (!e || t.length === 0)
      return c`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
    const s = this.config?.defaults.patterns?.min_days ?? Je;
    return c`
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
          ${t.map((i) => this.renderRow(i, e, s))}
        </tbody>
      </table>
    `;
  }
  renderRow(e, t, s) {
    const i = t.ready[e.id] === !0, n = t.profile.groups[e.id]?.days ?? 0, r = this.hass?.states[_s(e.id)]?.state;
    return c`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${i ? "yes" : "no"}" title=${i ? "Ready" : `Needs ${s} days`}>
        ${i ? "✓" : "✗"}
      </td>
      <td class="days">${n}</td>
      <td class="expected">${Ko(r, e.precision)}</td>
    </tr>`;
  }
  /** Why a group cannot be simulated right now; the first failing precondition, per group. */
  renderBlocked() {
    const e = Object.entries(this.simLog?.blocked ?? {}).filter(
      (i) => typeof i[1] == "string"
    );
    if (e.length === 0) return u;
    const t = ms(this.config), s = (i) => t.find((n) => n.id === i)?.label ?? i;
    return c`<ul class="blocked">
      ${e.map(([i, n]) => c`<li><span class="group">${s(i)}:</span> <span>${n}</span></li>`)}
    </ul>`;
  }
  renderLog() {
    const e = [...this.simLog?.entries ?? []].sort((t, s) => s.t - t.t).slice(0, qo);
    return e.length === 0 ? c`<div class="muted log-empty">No simulated light changes yet.</div>` : c`<ol class="log">
      ${e.map((t) => this.renderEntry(t))}
    </ol>`;
  }
  renderEntry(e) {
    return c`<li>
      <span class="muted">${new Date(e.t * 1e3).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
      ${e.brightness !== null ? c`<span class="muted">${e.brightness}</span>` : u}
    </li>`;
  }
  render() {
    return c`
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
K.styles = [
  O,
  S`
      .page {
        display: grid;
        gap: 16px;
        padding: 16px;
      }
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
ye([
  h({ attribute: !1 })
], K.prototype, "hass", 2);
ye([
  h({ attribute: !1 })
], K.prototype, "config", 2);
ye([
  h({ attribute: !1 })
], K.prototype, "profileState", 2);
ye([
  h({ attribute: !1 })
], K.prototype, "simLog", 2);
ye([
  g()
], K.prototype, "force", 2);
K = ye([
  E("al-patterns")
], K);
