const V = globalThis, tt = V.ShadowRoot && (V.ShadyCSS === void 0 || V.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, et = /* @__PURE__ */ Symbol(), nt = /* @__PURE__ */ new WeakMap();
let yt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== et) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (tt && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = nt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && nt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Et = (r) => new yt(typeof r == "string" ? r : r + "", void 0, et), St = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((s, i, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + r[o + 1], r[0]);
  return new yt(e, r, et);
}, xt = (r, t) => {
  if (tt) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = V.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, r.appendChild(s);
  }
}, at = tt ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Et(e);
})(r) : r;
const { is: Ct, defineProperty: Pt, getOwnPropertyDescriptor: Ot, getOwnPropertyNames: Ut, getOwnPropertySymbols: Tt, getPrototypeOf: Mt } = Object, G = globalThis, lt = G.trustedTypes, Ht = lt ? lt.emptyScript : "", Dt = G.reactiveElementPolyfillSupport, j = (r, t) => r, J = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? Ht : null;
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
} }, st = (r, t) => !Ct(r, t), ht = { attribute: !0, type: String, converter: J, reflect: !1, useDefault: !1, hasChanged: st };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), G.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let P = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = ht) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Pt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: o } = Ot(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: i, set(n) {
      const l = i?.call(this);
      o?.call(this, n), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ht;
  }
  static _$Ei() {
    if (this.hasOwnProperty(j("elementProperties"))) return;
    const t = Mt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(j("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(j("properties"))) {
      const e = this.properties, s = [...Ut(e), ...Tt(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
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
      for (const i of s) e.unshift(at(i));
    } else t !== void 0 && e.push(at(t));
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
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return xt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : J).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = s.getPropertyOptions(i), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : J;
      this._$Em = i;
      const l = n.fromAttribute(e, o.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (i === !1 && (o = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? st)(o, e) || s.useDefault && s.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: o }, n) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
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
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, o] of this._$Ep) this[i] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, o] of s) {
        const { wrapped: n } = o, l = this[i];
        n !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, o, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
P.elementStyles = [], P.shadowRootOptions = { mode: "open" }, P[j("elementProperties")] = /* @__PURE__ */ new Map(), P[j("finalized")] = /* @__PURE__ */ new Map(), Dt?.({ ReactiveElement: P }), (G.reactiveElementVersions ??= []).push("2.1.2");
const rt = globalThis, ct = (r) => r, Z = rt.trustedTypes, dt = Z ? Z.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, _t = "$lit$", b = `lit$${Math.random().toFixed(9).slice(2)}$`, mt = "?" + b, Lt = `<${mt}>`, x = document, k = () => x.createComment(""), I = (r) => r === null || typeof r != "object" && typeof r != "function", it = Array.isArray, Nt = (r) => it(r) || typeof r?.[Symbol.iterator] == "function", X = `[ 	
\f\r]`, R = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pt = /-->/g, ut = />/g, E = RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ft = /'/g, $t = /"/g, bt = /^(?:script|style|textarea|title)$/i, Rt = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), f = Rt(1), O = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), gt = /* @__PURE__ */ new WeakMap(), S = x.createTreeWalker(x, 129);
function At(r, t) {
  if (!it(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return dt !== void 0 ? dt.createHTML(t) : t;
}
const jt = (r, t) => {
  const e = r.length - 1, s = [];
  let i, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = R;
  for (let l = 0; l < e; l++) {
    const a = r[l];
    let p, u, h = -1, y = 0;
    for (; y < a.length && (n.lastIndex = y, u = n.exec(a), u !== null); ) y = n.lastIndex, n === R ? u[1] === "!--" ? n = pt : u[1] !== void 0 ? n = ut : u[2] !== void 0 ? (bt.test(u[2]) && (i = RegExp("</" + u[2], "g")), n = E) : u[3] !== void 0 && (n = E) : n === E ? u[0] === ">" ? (n = i ?? R, h = -1) : u[1] === void 0 ? h = -2 : (h = n.lastIndex - u[2].length, p = u[1], n = u[3] === void 0 ? E : u[3] === '"' ? $t : ft) : n === $t || n === ft ? n = E : n === pt || n === ut ? n = R : (n = E, i = void 0);
    const m = n === E && r[l + 1].startsWith("/>") ? " " : "";
    o += n === R ? a + Lt : h >= 0 ? (s.push(p), a.slice(0, h) + _t + a.slice(h) + b + m) : a + b + (h === -2 ? l : m);
  }
  return [At(r, o + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class z {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let o = 0, n = 0;
    const l = t.length - 1, a = this.parts, [p, u] = jt(t, e);
    if (this.el = z.createElement(p, s), S.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = S.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(_t)) {
          const y = u[n++], m = i.getAttribute(h).split(b), W = /([.?@])?(.*)/.exec(y);
          a.push({ type: 1, index: o, name: W[2], strings: m, ctor: W[1] === "." ? It : W[1] === "?" ? zt : W[1] === "@" ? Bt : K }), i.removeAttribute(h);
        } else h.startsWith(b) && (a.push({ type: 6, index: o }), i.removeAttribute(h));
        if (bt.test(i.tagName)) {
          const h = i.textContent.split(b), y = h.length - 1;
          if (y > 0) {
            i.textContent = Z ? Z.emptyScript : "";
            for (let m = 0; m < y; m++) i.append(h[m], k()), S.nextNode(), a.push({ type: 2, index: ++o });
            i.append(h[y], k());
          }
        }
      } else if (i.nodeType === 8) if (i.data === mt) a.push({ type: 2, index: o });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(b, h + 1)) !== -1; ) a.push({ type: 7, index: o }), h += b.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = x.createElement("template");
    return s.innerHTML = t, s;
  }
}
function U(r, t, e = r, s) {
  if (t === O) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const o = I(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(r), i._$AT(r, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = U(r, i._$AS(r, t.values), i, s)), t;
}
class kt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? x).importNode(e, !0);
    S.currentNode = i;
    let o = S.nextNode(), n = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let p;
        a.type === 2 ? p = new B(o, o.nextSibling, this, t) : a.type === 1 ? p = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (p = new qt(o, this, t)), this._$AV.push(p), a = s[++l];
      }
      n !== a?.index && (o = S.nextNode(), n++);
    }
    return S.currentNode = x, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class B {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = U(this, t, e), I(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== O && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Nt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && I(this._$AH) ? this._$AA.nextSibling.data = t : this.T(x.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = z.createElement(At(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const o = new kt(i, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = gt.get(t.strings);
    return e === void 0 && gt.set(t.strings, e = new z(t)), e;
  }
  k(t) {
    it(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const o of t) i === e.length ? e.push(s = new B(this.O(k()), this.O(k()), this, this.options)) : s = e[i], s._$AI(o), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = ct(t).nextSibling;
      ct(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class K {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, o) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = d;
  }
  _$AI(t, e = this, s, i) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = U(this, t, e, 0), n = !I(t) || t !== this._$AH && t !== O, n && (this._$AH = t);
    else {
      const l = t;
      let a, p;
      for (t = o[0], a = 0; a < o.length - 1; a++) p = U(this, l[s + a], e, a), p === O && (p = this._$AH[a]), n ||= !I(p) || p !== this._$AH[a], p === d ? t = d : t !== d && (t += (p ?? "") + o[a + 1]), this._$AH[a] = p;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class It extends K {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class zt extends K {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class Bt extends K {
  constructor(t, e, s, i, o) {
    super(t, e, s, i, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = U(this, t, e, 0) ?? d) === O) return;
    const s = this._$AH, i = t === d && s !== d || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== d && (s === d || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class qt {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    U(this, t);
  }
}
const Wt = rt.litHtmlPolyfillSupport;
Wt?.(z, B), (rt.litHtmlVersions ??= []).push("3.3.3");
const Vt = (r, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const o = e?.renderBefore ?? null;
    s._$litPart$ = i = new B(t.insertBefore(k(), o), o, void 0, e ?? {});
  }
  return i._$AI(r), i;
};
const ot = globalThis;
class v extends P {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Vt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return O;
  }
}
v._$litElement$ = !0, v.finalized = !0, ot.litElementHydrateSupport?.({ LitElement: v });
const Jt = ot.litElementPolyfillSupport;
Jt?.({ LitElement: v });
(ot.litElementVersions ??= []).push("4.2.2");
const H = (r) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(r, t);
  }) : customElements.define(r, t);
};
const Zt = { attribute: !0, type: String, converter: J, reflect: !1, hasChanged: st }, Gt = (r = Zt, t, e) => {
  const { kind: s, metadata: i } = e;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), s === "setter" && ((r = Object.create(r)).wrapped = !0), o.set(e.name, r), s === "accessor") {
    const { name: n } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(n, a, r, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(n, void 0, r, l), l;
    } };
  }
  if (s === "setter") {
    const { name: n } = e;
    return function(l) {
      const a = this[n];
      t.call(this, l), this.requestUpdate(n, a, r, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function c(r) {
  return (t, e) => typeof e == "object" ? Gt(r, t, e) : ((s, i, o) => {
    const n = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, s), n ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(r, t, e);
}
function _(r) {
  return c({ ...r, state: !0, attribute: !1 });
}
const wt = (r) => ({ ok: r.ok, errors: r.errors ?? [] }), Kt = (r) => r.callWS({ type: "activity_levels/config/get" }).then((t) => t.config), Ft = (r, t) => r.callWS({ type: "activity_levels/config/validate", config: t }).then(wt);
async function Qt(r, t) {
  try {
    return wt(await r.callWS({ type: "activity_levels/config/save", config: t }));
  } catch (e) {
    return { ok: !1, errors: [{ path: "", message: e.message ?? String(e) }] };
  }
}
const Xt = (r) => r.callWS({ type: "activity_levels/state" }), Y = [
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
], vt = (r) => new Promise((t) => setTimeout(t, r));
async function Yt() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function te(r = 8e3) {
  if (Y.every((s) => customElements.get(s))) return { ok: !0, missing: [] };
  await Promise.race([Yt(), vt(r)]);
  const t = await Promise.all(
    Y.map(
      (s) => Promise.race([customElements.whenDefined(s).then(() => !0), vt(r).then(() => !1)])
    )
  ), e = Y.filter((s, i) => !t[i]);
  return { ok: e.length === 0, missing: [...e] };
}
async function ee(r, t) {
  try {
    const e = await t.validate(r);
    if (!e.ok)
      return {
        errors: e.errors,
        banner: { kind: "error", text: `${e.errors.length} problem(s) to fix before saving.` },
        reload: !1
      };
    const s = await t.save(r);
    return s.ok ? { errors: [], banner: { kind: "info", text: "Saved. Activity Levels is reloading." }, reload: !0 } : {
      errors: s.errors,
      banner: { kind: "error", text: s.errors[0]?.message ?? "Save failed" },
      reload: !1
    };
  } catch (e) {
    return { errors: null, banner: { kind: "error", text: `Save failed: ${e instanceof Error ? e.message : String(e)}` }, reload: !1 };
  }
}
class se {
  constructor(t) {
    this.past = [], this.future = [], this.original = t, this.config = t;
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
  set(t) {
    this.past.push(this.config), this.future = [], this.config = t;
  }
  undo() {
    const t = this.past.pop();
    t && (this.future.push(this.config), this.config = t);
  }
  redo() {
    const t = this.future.pop();
    t && (this.past.push(this.config), this.config = t);
  }
  reset(t) {
    this.original = t, this.config = t, this.past = [], this.future = [];
  }
}
const D = St`
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
var re = Object.defineProperty, ie = Object.getOwnPropertyDescriptor, g = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? ie(t, e) : t, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && re(t, e, i), i;
};
const oe = ["groups", "envelopes", "defaults"], ne = 2e3, ae = 1500;
let $ = class extends v {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [];
  }
  async connectedCallback() {
    super.connectedCallback();
    const { ok: r, missing: t } = await te();
    this.missing = r ? [] : t, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.stopLive();
  }
  async load() {
    try {
      const r = await Kt(this.hass);
      this.draft = new se(r), this.errors = [], this.banner = null;
    } catch (r) {
      this.banner = { kind: "error", text: `Could not load configuration: ${r.message}` };
    }
  }
  setConfig(r) {
    this.draft?.set(r), this.requestUpdate();
  }
  async save() {
    const r = this.draft;
    if (r) {
      this.busy = !0;
      try {
        const t = await ee(r.config, {
          validate: (e) => Ft(this.hass, e),
          save: (e) => Qt(this.hass, e)
        });
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((e) => setTimeout(e, ae)), await this.load());
      } finally {
        this.busy = !1;
      }
    }
  }
  discard() {
    this.draft && (this.draft.reset(this.draft.original), this.errors = [], this.banner = null, this.requestUpdate());
  }
  undo() {
    this.draft?.undo(), this.requestUpdate();
  }
  redo() {
    this.draft?.redo(), this.requestUpdate();
  }
  toggleLive(r) {
    this.liveOn = r, r ? this.startLive() : this.stopLive();
  }
  startLive() {
    this.stopLive();
    const r = async () => {
      try {
        this.live = await Xt(this.hass);
      } catch {
      }
    };
    r(), this.liveTimer = window.setInterval(() => {
      r();
    }, ne);
  }
  stopLive() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0), this.live = null;
  }
  render() {
    if (this.missing.length) return this.renderMissing();
    const r = this.draft;
    return f`
      <ha-top-app-bar-fixed>
        <ha-menu-button slot="navigationIcon"></ha-menu-button>
        <div slot="title">Activity Levels</div>
        <div slot="actionItems" class="row">
          <span class="muted">Live</span>
          <ha-switch
            .checked=${this.liveOn}
            @change=${(t) => this.toggleLive(t.target.checked)}
          ></ha-switch>
          <ha-icon-button .disabled=${!r?.canUndo} @click=${this.undo} title="Undo">
            <ha-icon icon="mdi:undo"></ha-icon>
          </ha-icon-button>
          <ha-icon-button .disabled=${!r?.canRedo} @click=${this.redo} title="Redo">
            <ha-icon icon="mdi:redo"></ha-icon>
          </ha-icon-button>
          <ha-button appearance="plain" .disabled=${!r?.dirty || this.busy} @click=${this.discard}>Discard</ha-button>
          <ha-button .disabled=${!r?.dirty || this.busy} @click=${this.save}>${r?.dirty ? "Save" : "Saved"}</ha-button>
        </div>
        ${this.renderBanner()}
        <div class="tabs">
          ${oe.map(
      (t) => f`<div
              class="tab ${this.tab === t ? "active" : ""}"
              role="tab"
              @click=${() => {
        this.tab = t;
      }}
            >
              ${t[0].toUpperCase() + t.slice(1)}
            </div>`
    )}
        </div>
        ${r ? this.renderTab(r) : f`<p style="padding:16px">Loading…</p>`}
      </ha-top-app-bar-fixed>
    `;
  }
  renderMissing() {
    return f`
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
    const r = this.banner;
    return r ? f`<ha-alert
      alert-type=${r.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
      this.banner = null;
    }}
      >${r.text}</ha-alert
    >` : d;
  }
  renderTab(r) {
    const t = (e) => this.setConfig(e.detail);
    switch (this.tab) {
      case "groups":
        return f`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree
            .hass=${this.hass}
            .config=${r.config}
            .selection=${this.selection}
            .errors=${this.errors}
            .live=${this.live}
            @al-select=${(e) => {
          this.selection = e.detail;
        }}
            @al-change=${t}
          ></al-tree>
          <div>${this.renderEditor(r)}</div>
        </div>`;
      case "envelopes":
        return f`<al-envelopes
          .hass=${this.hass}
          .config=${r.config}
          .errors=${this.errors}
          @al-change=${t}
        ></al-envelopes>`;
      case "defaults":
        return f`<al-defaults
          .hass=${this.hass}
          .config=${r.config}
          .errors=${this.errors}
          @al-change=${t}
        ></al-defaults>`;
    }
  }
  renderEditor(r) {
    const t = this.selection;
    if (!t) return f`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
    const e = (i) => this.setConfig(i.detail);
    return t[t.length - 2] === "stimuli" ? f`<al-stimulus-editor
          .hass=${this.hass}
          .config=${r.config}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${e}
        ></al-stimulus-editor>` : f`<al-group-editor
          .hass=${this.hass}
          .config=${r.config}
          .path=${t}
          .errors=${this.errors}
          @al-change=${e}
        ></al-group-editor>`;
  }
};
$.styles = [D];
g([
  c({ attribute: !1 })
], $.prototype, "hass", 2);
g([
  c({ type: Boolean })
], $.prototype, "narrow", 2);
g([
  _()
], $.prototype, "draft", 2);
g([
  _()
], $.prototype, "tab", 2);
g([
  _()
], $.prototype, "selection", 2);
g([
  _()
], $.prototype, "errors", 2);
g([
  _()
], $.prototype, "banner", 2);
g([
  _()
], $.prototype, "live", 2);
g([
  _()
], $.prototype, "liveOn", 2);
g([
  _()
], $.prototype, "busy", 2);
g([
  _()
], $.prototype, "missing", 2);
$ = g([
  H("activity-levels-panel")
], $);
var le = Object.defineProperty, he = Object.getOwnPropertyDescriptor, L = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? he(t, e) : t, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && le(t, e, i), i;
};
let A = class extends v {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  render() {
    return f`<ha-card>Coming soon</ha-card>`;
  }
};
A.styles = [D];
L([
  c({ attribute: !1 })
], A.prototype, "hass", 2);
L([
  c({ attribute: !1 })
], A.prototype, "config", 2);
L([
  c({ attribute: !1 })
], A.prototype, "selection", 2);
L([
  c({ attribute: !1 })
], A.prototype, "errors", 2);
L([
  c({ attribute: !1 })
], A.prototype, "live", 2);
A = L([
  H("al-tree")
], A);
var ce = Object.defineProperty, de = Object.getOwnPropertyDescriptor, q = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? de(t, e) : t, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && ce(t, e, i), i;
};
let C = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  render() {
    return f`<ha-card>Coming soon</ha-card>`;
  }
};
C.styles = [D];
q([
  c({ attribute: !1 })
], C.prototype, "hass", 2);
q([
  c({ attribute: !1 })
], C.prototype, "config", 2);
q([
  c({ attribute: !1 })
], C.prototype, "path", 2);
q([
  c({ attribute: !1 })
], C.prototype, "errors", 2);
C = q([
  H("al-group-editor")
], C);
var pe = Object.defineProperty, ue = Object.getOwnPropertyDescriptor, N = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? ue(t, e) : t, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && pe(t, e, i), i;
};
let w = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null;
  }
  render() {
    return f`<ha-card>Coming soon</ha-card>`;
  }
};
w.styles = [D];
N([
  c({ attribute: !1 })
], w.prototype, "hass", 2);
N([
  c({ attribute: !1 })
], w.prototype, "config", 2);
N([
  c({ attribute: !1 })
], w.prototype, "path", 2);
N([
  c({ attribute: !1 })
], w.prototype, "errors", 2);
N([
  c({ attribute: !1 })
], w.prototype, "live", 2);
w = N([
  H("al-stimulus-editor")
], w);
var fe = Object.defineProperty, $e = Object.getOwnPropertyDescriptor, F = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? $e(t, e) : t, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && fe(t, e, i), i;
};
let T = class extends v {
  constructor() {
    super(...arguments), this.errors = [];
  }
  render() {
    return f`<ha-card>Coming soon</ha-card>`;
  }
};
T.styles = [D];
F([
  c({ attribute: !1 })
], T.prototype, "hass", 2);
F([
  c({ attribute: !1 })
], T.prototype, "config", 2);
F([
  c({ attribute: !1 })
], T.prototype, "errors", 2);
T = F([
  H("al-envelopes")
], T);
var ge = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, Q = (r, t, e, s) => {
  for (var i = s > 1 ? void 0 : s ? ve(t, e) : t, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = (s ? n(t, e, i) : n(i)) || i);
  return s && i && ge(t, e, i), i;
};
let M = class extends v {
  constructor() {
    super(...arguments), this.errors = [];
  }
  render() {
    return f`<ha-card>Coming soon</ha-card>`;
  }
};
M.styles = [D];
Q([
  c({ attribute: !1 })
], M.prototype, "hass", 2);
Q([
  c({ attribute: !1 })
], M.prototype, "config", 2);
Q([
  c({ attribute: !1 })
], M.prototype, "errors", 2);
M = Q([
  H("al-defaults")
], M);
