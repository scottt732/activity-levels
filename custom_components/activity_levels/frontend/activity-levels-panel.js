const $e = globalThis, qe = $e.ShadowRoot && ($e.ShadyCSS === void 0 || $e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Xe = /* @__PURE__ */ Symbol(), rt = /* @__PURE__ */ new WeakMap();
let Ct = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== Xe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (qe && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = rt.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && rt.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const jt = (t) => new Ct(typeof t == "string" ? t : t + "", void 0, Xe), $ = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + t[r + 1], t[0]);
  return new Ct(s, t, Xe);
}, zt = (t, e) => {
  if (qe) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), n = $e.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, t.appendChild(i);
  }
}, ot = qe ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return jt(s);
})(t) : t;
const { is: Bt, defineProperty: Gt, getOwnPropertyDescriptor: Vt, getOwnPropertyNames: Wt, getOwnPropertySymbols: Kt, getPrototypeOf: qt } = Object, Le = globalThis, at = Le.trustedTypes, Xt = at ? at.emptyScript : "", Yt = Le.reactiveElementPolyfillSupport, ae = (t, e) => t, we = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Xt : null;
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
} }, Ye = (t, e) => !Bt(t, e), lt = { attribute: !0, type: String, converter: we, reflect: !1, useDefault: !1, hasChanged: Ye };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), Le.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let X = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = lt) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(e, i, s);
      n !== void 0 && Gt(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: n, set: r } = Vt(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? lt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ae("elementProperties"))) return;
    const e = qt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ae("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ae("properties"))) {
      const s = this.properties, i = [...Wt(s), ...Kt(s)];
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
      for (const n of i) s.unshift(ot(n));
    } else e !== void 0 && s.push(ot(e));
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
    return zt(e, this.constructor.elementStyles), e;
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
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : we).toAttribute(s, i.type);
      this._$Em = e, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, n = i._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : we;
      this._$Em = n;
      const l = o.fromAttribute(s, r.type);
      this[n] = l ?? this._$Ej?.get(n) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, n = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? Ye)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
X.elementStyles = [], X.shadowRootOptions = { mode: "open" }, X[ae("elementProperties")] = /* @__PURE__ */ new Map(), X[ae("finalized")] = /* @__PURE__ */ new Map(), Yt?.({ ReactiveElement: X }), (Le.reactiveElementVersions ??= []).push("2.1.2");
const Je = globalThis, ct = (t) => t, Ee = Je.trustedTypes, ht = Ee ? Ee.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Pt = "$lit$", N = `lit$${Math.random().toFixed(9).slice(2)}$`, Ot = "?" + N, Jt = `<${Ot}>`, B = document, ce = () => B.createComment(""), he = (t) => t === null || typeof t != "object" && typeof t != "function", Ze = Array.isArray, Zt = (t) => Ze(t) || typeof t?.[Symbol.iterator] == "function", Ue = `[ 	
\f\r]`, ne = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, dt = /-->/g, ut = />/g, H = RegExp(`>|${Ue}(?:([^\\s"'>=/]+)(${Ue}*=${Ue}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), pt = /'/g, mt = /"/g, Lt = /^(?:script|style|textarea|title)$/i, Tt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), c = Tt(1), ft = Tt(2), G = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), vt = /* @__PURE__ */ new WeakMap(), F = B.createTreeWalker(B, 129);
function Mt(t, e) {
  if (!Ze(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ht !== void 0 ? ht.createHTML(e) : e;
}
const Qt = (t, e) => {
  const s = t.length - 1, i = [];
  let n, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ne;
  for (let l = 0; l < s; l++) {
    const a = t[l];
    let p, u, m = -1, O = 0;
    for (; O < a.length && (o.lastIndex = O, u = o.exec(a), u !== null); ) O = o.lastIndex, o === ne ? u[1] === "!--" ? o = dt : u[1] !== void 0 ? o = ut : u[2] !== void 0 ? (Lt.test(u[2]) && (n = RegExp("</" + u[2], "g")), o = H) : u[3] !== void 0 && (o = H) : o === H ? u[0] === ">" ? (o = n ?? ne, m = -1) : u[1] === void 0 ? m = -2 : (m = o.lastIndex - u[2].length, p = u[1], o = u[3] === void 0 ? H : u[3] === '"' ? mt : pt) : o === mt || o === pt ? o = H : o === dt || o === ut ? o = ne : (o = H, n = void 0);
    const D = o === H && t[l + 1].startsWith("/>") ? " " : "";
    r += o === ne ? a + Jt : m >= 0 ? (i.push(p), a.slice(0, m) + Pt + a.slice(m) + N + D) : a + N + (m === -2 ? l : D);
  }
  return [Mt(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class de {
  constructor({ strings: e, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const l = e.length - 1, a = this.parts, [p, u] = Qt(e, s);
    if (this.el = de.createElement(p, i), F.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (n = F.nextNode()) !== null && a.length < l; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const m of n.getAttributeNames()) if (m.endsWith(Pt)) {
          const O = u[o++], D = n.getAttribute(m).split(N), ge = /([.?@])?(.*)/.exec(O);
          a.push({ type: 1, index: r, name: ge[2], strings: D, ctor: ge[1] === "." ? ts : ge[1] === "?" ? ss : ge[1] === "@" ? is : Te }), n.removeAttribute(m);
        } else m.startsWith(N) && (a.push({ type: 6, index: r }), n.removeAttribute(m));
        if (Lt.test(n.tagName)) {
          const m = n.textContent.split(N), O = m.length - 1;
          if (O > 0) {
            n.textContent = Ee ? Ee.emptyScript : "";
            for (let D = 0; D < O; D++) n.append(m[D], ce()), F.nextNode(), a.push({ type: 2, index: ++r });
            n.append(m[O], ce());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Ot) a.push({ type: 2, index: r });
      else {
        let m = -1;
        for (; (m = n.data.indexOf(N, m + 1)) !== -1; ) a.push({ type: 7, index: r }), m += N.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const i = B.createElement("template");
    return i.innerHTML = e, i;
  }
}
function Z(t, e, s = t, i) {
  if (e === G) return e;
  let n = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = he(e) ? void 0 : e._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(t), n._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = n : s._$Cl = n), n !== void 0 && (e = Z(t, n._$AS(t, e.values), n, i)), e;
}
class es {
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
    const { el: { content: s }, parts: i } = this._$AD, n = (e?.creationScope ?? B).importNode(s, !0);
    F.currentNode = n;
    let r = F.nextNode(), o = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let p;
        a.type === 2 ? p = new pe(r, r.nextSibling, this, e) : a.type === 1 ? p = new a.ctor(r, a.name, a.strings, this, e) : a.type === 6 && (p = new ns(r, this, e)), this._$AV.push(p), a = i[++l];
      }
      o !== a?.index && (r = F.nextNode(), o++);
    }
    return F.currentNode = B, n;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class pe {
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
    e = Z(this, e, s), he(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== G && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Zt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && he(this._$AH) ? this._$AA.nextSibling.data = e : this.T(B.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, n = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = de.createElement(Mt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(s);
    else {
      const r = new es(n, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = vt.get(e.strings);
    return s === void 0 && vt.set(e.strings, s = new de(e)), s;
  }
  k(e) {
    Ze(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const r of e) n === s.length ? s.push(i = new pe(this.O(ce()), this.O(ce()), this, this.options)) : i = s[n], i._$AI(r), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = ct(e).nextSibling;
      ct(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class Te {
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
    if (r === void 0) e = Z(this, e, s, 0), o = !he(e) || e !== this._$AH && e !== G, o && (this._$AH = e);
    else {
      const l = e;
      let a, p;
      for (e = r[0], a = 0; a < r.length - 1; a++) p = Z(this, l[i + a], s, a), p === G && (p = this._$AH[a]), o ||= !he(p) || p !== this._$AH[a], p === d ? e = d : e !== d && (e += (p ?? "") + r[a + 1]), this._$AH[a] = p;
    }
    o && !n && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class ts extends Te {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class ss extends Te {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class is extends Te {
  constructor(e, s, i, n, r) {
    super(e, s, i, n, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = Z(this, e, s, 0) ?? d) === G) return;
    const i = this._$AH, n = e === d && i !== d || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== d && (i === d || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ns {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Z(this, e);
  }
}
const rs = Je.litHtmlPolyfillSupport;
rs?.(de, pe), (Je.litHtmlVersions ??= []).push("3.3.3");
const os = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = n = new pe(e.insertBefore(ce(), r), r, void 0, s ?? {});
  }
  return n._$AI(t), n;
};
const Qe = globalThis;
let v = class extends X {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = os(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return G;
  }
};
v._$litElement$ = !0, v.finalized = !0, Qe.litElementHydrateSupport?.({ LitElement: v });
const as = Qe.litElementPolyfillSupport;
as?.({ LitElement: v });
(Qe.litElementVersions ??= []).push("4.2.2");
const y = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
const ls = { attribute: !0, type: String, converter: we, reflect: !1, hasChanged: Ye }, cs = (t = ls, e, s) => {
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
function h(t) {
  return (e, s) => typeof s == "object" ? cs(t, e, s) : ((i, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(t, e, s);
}
function b(t) {
  return h({ ...t, state: !0, attribute: !1 });
}
const Rt = (t) => ({ ok: t.ok, errors: t.errors ?? [] }), hs = (t) => t.callWS({ type: "activity_levels/config/get" }).then((e) => e.config), ds = (t, e) => t.callWS({ type: "activity_levels/config/validate", config: e }).then(Rt);
async function us(t, e) {
  try {
    return Rt(await t.callWS({ type: "activity_levels/config/save", config: e }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const ps = (t) => t.callWS({ type: "activity_levels/state" }), He = [
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
], ms = 2500, fs = 8e3;
function vs(t) {
  let e;
  return { promise: new Promise((i) => {
    e = setTimeout(i, t);
  }), cancel: () => clearTimeout(e) };
}
async function gt(t, e, s) {
  const i = vs(e);
  try {
    return await Promise.race([t, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function gs() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function bs(t = fs, e = ms) {
  if (He.every((n) => customElements.get(n))) return { ok: !0, missing: [] };
  await gt(gs(), e, void 0);
  const s = await Promise.all(
    He.map(
      (n) => gt(
        customElements.whenDefined(n).then(() => !0),
        t,
        !1
      )
    )
  ), i = He.filter((n, r) => !s[r]);
  return { ok: i.length === 0, missing: [...i] };
}
async function $s(t, e) {
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
function me(t, e) {
  let s = t;
  for (const i of e) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function bt(t) {
  return Array.isArray(t) ? [...t] : { ...t };
}
function Me(t, e, s) {
  if (e.length === 0) throw new Error("empty path");
  const i = bt(t);
  let n = i;
  for (let r = 0; r < e.length - 1; r++) {
    const o = e[r], l = bt(n[o]);
    n[o] = l, n = l;
  }
  return s(n, e[e.length - 1]), i;
}
function A(t, e, s) {
  return Me(t, e, (i, n) => {
    i[n] = s;
  });
}
function et(t, e) {
  return Me(t, e, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function Ve(t, e, s, i) {
  return Me(t, [...e, s], (n) => {
    n.splice(s, 0, i);
  });
}
function ys(t, e, s, i) {
  return Me(t, [...e, s], (n) => {
    const r = n, [o] = r.splice(s, 1);
    r.splice(i, 0, o);
  });
}
const xs = 1e3;
class _s {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < xs || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const M = $`
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
var ws = Object.defineProperty, Es = Object.getOwnPropertyDescriptor, x = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Es(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ws(e, s, n), n;
};
const re = ["groups", "envelopes", "defaults"], Ss = 2e3, As = 1500;
let g = class extends v {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.tabFocus = 0, this.onVisibilityChange = () => this.updateLivePolling(), this.onChange = (t) => {
      t.structural && (this.errors = []), this.setConfig(t.detail, t.coalesceKey);
    }, this.onTabsKeydown = (t) => {
      const e = re.length - 1;
      switch (t.key) {
        case "ArrowRight":
          this.focusTab((this.tabFocus + 1) % re.length);
          break;
        case "ArrowLeft":
          this.focusTab((this.tabFocus + e) % re.length);
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
    const { ok: t, missing: e } = await bs();
    this.missing = t ? [] : e, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.stopLive();
  }
  async load() {
    try {
      const t = await hs(this.hass);
      this.draft = new _s(t), this.syncSelection(), this.errors = [], this.banner = null;
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
    !t || !this.selection || me(t, this.selection) === void 0 && (this.selection = null);
  }
  async save() {
    const t = this.draft;
    if (t) {
      this.busy = !0, this.updateLivePolling();
      try {
        const e = await $s(t.config, {
          validate: (s) => ds(this.hass, s),
          save: (s) => us(this.hass, s)
        });
        e.errors !== null && (this.errors = e.errors), this.banner = e.banner, e.reload && (await new Promise((s) => setTimeout(s, As)), await this.load());
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
    }, Ss));
  }
  async pollLive() {
    try {
      this.live = await ps(this.hass);
    } catch {
    }
  }
  clearLiveTimer() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
  }
  selectTab(t) {
    const e = re[t];
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
          ${re.map(
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
g.styles = [M];
x([
  h({ attribute: !1 })
], g.prototype, "hass", 2);
x([
  h({ type: Boolean })
], g.prototype, "narrow", 2);
x([
  b()
], g.prototype, "draft", 2);
x([
  b()
], g.prototype, "tab", 2);
x([
  b()
], g.prototype, "selection", 2);
x([
  b()
], g.prototype, "errors", 2);
x([
  b()
], g.prototype, "banner", 2);
x([
  b()
], g.prototype, "live", 2);
x([
  b()
], g.prototype, "liveOn", 2);
x([
  b()
], g.prototype, "busy", 2);
x([
  b()
], g.prototype, "missing", 2);
x([
  b()
], g.prototype, "tabFocus", 2);
g = x([
  y("activity-levels-panel")
], g);
function j(t) {
  const e = Math.floor(t / 3600), s = Math.floor((t - e * 3600) / 60), i = Math.round((t - e * 3600 - s * 60) * 1e3) / 1e3, n = Math.floor(i), r = Math.round((i - n) * 1e3);
  return r === 0 ? { hours: e, minutes: s, seconds: n } : { hours: e, minutes: s, seconds: n, milliseconds: r };
}
function z(t) {
  if (!t) return null;
  const e = (t.days ?? 0) * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds + (t.milliseconds ?? 0) / 1e3;
  return Math.round(e * 1e3) / 1e3;
}
function E(t) {
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
const f = (t) => t.join("/");
function Re(t, e) {
  const s = f(e), i = {};
  for (const n of t) {
    if (!n.path.startsWith(s + "/")) continue;
    const r = n.path.slice(s.length + 1);
    r.includes("/") || (i[r] = n.message);
  }
  return i;
}
function Se(t, e) {
  const s = f(e);
  return t.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function te(t, e, s) {
  const i = new CustomEvent("al-change", {
    detail: t,
    bubbles: !0,
    composed: !0
  });
  return e !== void 0 && (i.coalesceKey = e), s && (i.structural = !0), i;
}
const Dt = (t) => new CustomEvent("al-select", { detail: t, bubbles: !0, composed: !0 }), se = (t, e) => new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 }), ks = () => se("al-select-strip", null), Cs = () => se("al-open-strip", null), Ps = (t) => se("al-gain-changed", t), Os = (t) => se("al-mix-changed", { mix: t }), Ls = (t) => se("al-limiter-changed", { value: t }), Ts = (t) => se("al-sim-toggled", { on: t }), Fe = (t) => new CustomEvent("al-nav", { detail: t, bubbles: !0, composed: !0 }), Ms = (t, e) => new CustomEvent("al-sim-toggle", { detail: { gid: t, on: e }, bubbles: !0, composed: !0 }), Rs = (t) => ({
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
}), Ds = (t) => ({
  id: t,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), Ns = (t) => ({
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
function Is(t) {
  const e = /* @__PURE__ */ new Set(), s = (i) => {
    e.add(i.id), i.children.forEach(s);
  };
  return t.groups.forEach(s), e;
}
function Us(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const Hs = (t) => new Set(t.envelopes.map((e) => e.id));
function Nt(t, e) {
  const s = Us(e);
  if (!t.has(s)) return s;
  let i = 2;
  for (; t.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const Fs = (t, e) => Nt(Is(t), e), js = (t, e) => Nt(Hs(t), e);
function zs(t, e) {
  const s = [], i = (n) => {
    n.stimuli.some((r) => r.envelope === e) && s.push(n.id), n.children.forEach(i);
  };
  return t.groups.forEach(i), { defaults: t.defaults.envelope === e, groups: s };
}
function Bs(t, e, s) {
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
const J = (t, e) => me(t, e), ye = (t, e) => me(t, e), Gs = (t) => t.slice(0, -1), tt = (t) => t.slice(0, -2), It = (t, e) => t.envelopes.find((s) => s.id === (e ?? t.defaults.envelope));
function We(t, e) {
  const s = It(t, e.envelope), i = t.defaults, n = (r, o, l) => r ?? o ?? l;
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
var Vs = Object.defineProperty, Ws = Object.getOwnPropertyDescriptor, ie = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ws(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Vs(e, s, n), n;
};
const $t = (t) => t.stopPropagation(), Ks = (t) => {
  (t.key === "Enter" || t.key === " ") && t.stopPropagation();
};
let I = class extends v {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(t) {
    this.dispatchEvent(te(t, void 0, !0));
  }
  emitSelect(t) {
    this.dispatchEvent(Dt(t));
  }
  isSelected(t) {
    return this.selection !== null && f(this.selection) === f(t);
  }
  select(t, e) {
    t.stopPropagation(), this.emitSelect(e);
  }
  selectOnKey(t, e) {
    t.key !== "Enter" && t.key !== " " || (t.preventDefault(), t.stopPropagation(), this.emitSelect(e));
  }
  addGroup(t, e) {
    const s = this.config;
    s && (this.emitChange(Ve(s, t, e, Rs(Fs(s, "new_group")))), this.emitSelect([...t, e]));
  }
  addStimulus(t, e) {
    const s = this.config;
    if (!s) return;
    const i = [...t, "stimuli"];
    this.emitChange(Ve(s, i, e, Ns(""))), this.emitSelect([...i, e]);
  }
  move(t, e) {
    const s = this.config;
    if (!s) return;
    const i = Gs(t), n = t[t.length - 1], r = n + e;
    this.emitChange(ys(s, i, n, r));
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
  selectionAfterSwap(t, e, s) {
    const i = this.selection;
    if (i === null || i.length <= t.length || f(i.slice(0, t.length)) !== f(t)) return null;
    const n = i[t.length], r = n === e ? s : n === s ? e : null;
    if (r === null) return null;
    const o = [...i];
    return o[t.length] = r, o;
  }
  removeNode(t, e) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${e}? This cannot be undone after saving.`)) return;
    this.emitChange(et(s, t));
    const i = tt(t);
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
    const o = Se(this.errors, s), l = this.live?.groups[e.id], a = l?.max_value ?? e.max_value ?? t.defaults.max_value, p = l ? Math.max(0, Math.min(100, l.value / (a || 1) * 100)) : 0;
    return c`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(u) => this.select(u, s)}
            @keydown=${Ks}
          >
            ${e.name || e.id || "(unnamed group)"}
          </button>
          ${o ? c`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : d}
          ${l ? c`<div class="meter" title=${this.meterTitle(l, a, i === 0)}>
                  <div style="width: ${p}%"></div>
                </div>
                <span class="dot ${l.gated ? "gated" : ""}" title=${l.gated ? "Gate open" : "Gate closed"}></span>` : d}
        </div>
        <div slot="icons" class="row" @click=${$t}>
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
  renderStimulus(t, e, s, i, n) {
    const r = this.hass?.states[t.entity], o = r?.attributes.friendly_name ?? (t.entity || "(no entity)"), l = Se(this.errors, e), a = this.live?.voices[n]?.find((p) => p.label === (t.key ?? t.entity));
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
        ${r ? c`<span class="muted chip">${r.state}</span>` : d}
        ${a ? c`<span class="chip phase ${a.phase}" title=${this.voiceTitle(a)}>${a.phase}</span>
              <span class="muted chip">${a.value.toFixed(2)}</span>` : d}
        <div class="row" @click=${$t}>
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
I.styles = [
  M,
  $`
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
ie([
  h({ attribute: !1 })
], I.prototype, "hass", 2);
ie([
  h({ attribute: !1 })
], I.prototype, "config", 2);
ie([
  h({ attribute: !1 })
], I.prototype, "selection", 2);
ie([
  h({ attribute: !1 })
], I.prototype, "errors", 2);
ie([
  h({ attribute: !1 })
], I.prototype, "live", 2);
I = ie([
  y("al-tree")
], I);
const yt = (t) => t.split(",").map((e) => e.trim()).filter((e) => e.length > 0), oe = (t) => (t ?? []).join(", "), Ae = (t) => t == null || t === "" ? null : t;
function qs(t, e) {
  if (e != null)
    switch (t) {
      case "duration":
        return j(e);
      case "boolean":
        return e ? "true" : "false";
      default:
        return e;
    }
}
function Xs(t, e) {
  if (e == null || e === "") return null;
  switch (t) {
    case "duration":
      return z(e);
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
function Ys(t, e) {
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
var Js = Object.defineProperty, Zs = Object.getOwnPropertyDescriptor, R = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Zs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Js(e, s, n), n;
};
const st = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
function Qs(t, e) {
  return t.select?.options?.find((i) => i.value === e)?.label;
}
let S = class extends v {
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
    t.stopPropagation(), this.emit(Xs(this.kind, t.detail?.value));
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
      const e = Qs(this.selector, String(t));
      if (e !== void 0) return e;
    }
    return Ys(this.kind, t);
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
          .selector=${this.kind === "boolean" ? st : this.selector}
          .label=${this.label}
          .required=${!1}
          .value=${qs(this.kind, this.value)}
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
S.styles = [
  M,
  $`
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
R([
  h({ attribute: !1 })
], S.prototype, "hass", 2);
R([
  h()
], S.prototype, "label", 2);
R([
  h({ attribute: !1 })
], S.prototype, "selector", 2);
R([
  h({ attribute: !1 })
], S.prototype, "value", 2);
R([
  h({ attribute: !1 })
], S.prototype, "inherited", 2);
R([
  h({ attribute: "inherited-from" })
], S.prototype, "inheritedFrom", 2);
R([
  h()
], S.prototype, "kind", 2);
R([
  h()
], S.prototype, "error", 2);
S = R([
  y("al-override-field")
], S);
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, fe = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ti(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ei(e, s, n), n;
};
const si = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, ii = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, ni = ["id", "name", "area", "mix", "null_handling", "gain"], ri = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], oi = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], ai = { number: { min: 0.1, step: 0.1, mode: "box" } }, li = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, ci = (t, e) => [
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: ri } } },
  ...t.mix === "mean" ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: oi } } }] : [],
  ...e ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]
];
let V = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.computeLabel = (t) => si[t.name] ?? t.name, this.computeHelper = (t) => ii[t.name] ?? "";
  }
  emitChange(t, e) {
    this.dispatchEvent(te(t, e));
  }
  emitSelect(t) {
    this.dispatchEvent(Dt(t));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const { config: e, path: s } = this;
    if (!e || !s) return;
    const i = J(e, s);
    if (!i) return;
    const n = t.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      name: Ae(n.name),
      area: Ae(n.area),
      mix: n.mix ?? i.mix,
      null_handling: n.null_handling ?? i.null_handling,
      gain: typeof n.gain == "number" ? n.gain : i.gain
    }, o = ni.find((l) => r[l] !== i[l]);
    o !== void 0 && this.emitChange(A(e, s, r), `${f(s)}:${o}`);
  }
  setField(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(A(s, [...i, t], e), `${f(i)}:${t}`);
  }
  onDelete() {
    const { config: t, path: e } = this;
    if (!t || !e) return;
    const s = J(t, e);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(et(t, e));
    const i = tt(e);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length === 0)
      return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = J(t, e);
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = e.length === 2, n = Re(this.errors, e), r = this.errors.filter((l) => l.path === f(e)), o = {
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
          .schema=${ci(s, i)}
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
          .selector=${ai}
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
          .selector=${li}
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
V.styles = [
  M,
  $`
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
fe([
  h({ attribute: !1 })
], V.prototype, "hass", 2);
fe([
  h({ attribute: !1 })
], V.prototype, "config", 2);
fe([
  h({ attribute: !1 })
], V.prototype, "path", 2);
fe([
  h({ attribute: !1 })
], V.prototype, "errors", 2);
V = fe([
  y("al-group-editor")
], V);
function Ut(t, e = 0.25) {
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
const hi = (t) => Math.round(t * 100) / 100;
function di(t, e = 0.25) {
  const s = Ut(t, e), i = (r) => ((s[r]?.x ?? 0) + (s[r + 1]?.x ?? 0)) / 2;
  if (t.impulse) {
    const r = [{ text: "impulse", x: 0 }];
    return t.release > 0 && r.push({ text: `R ${E(t.release)}`, x: i(1) }), r;
  }
  const n = [];
  return t.attack > 0 && n.push({ text: `A ${E(t.attack)}`, x: i(0) }), t.decay > 0 && n.push({ text: `D ${E(t.decay)}`, x: i(1) }), n.push({ text: `S ${hi(t.sustain)}`, x: i(2) }), t.release > 0 && n.push({ text: `R ${E(t.release)}`, x: i(3) }), n;
}
var ui = Object.defineProperty, pi = Object.getOwnPropertyDescriptor, Ht = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? pi(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ui(e, s, n), n;
};
const ue = 10, ke = 190, mi = 10, Y = 58, fi = 72, xe = (t) => ue + t * (ke - ue), je = (t) => Y - t * (Y - mi), le = (t) => String(Math.round(t * 10) / 10), ze = (t, e) => `${le(t)},${le(e)}`, vi = (t) => Math.min(ke - 6, Math.max(ue + 6, xe(t)));
let Ce = class extends v {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const t = this.envelope;
    if (!t) return d;
    const e = Ut(t), s = e[0], i = e[e.length - 1], n = e.map((a) => ze(xe(a.x), je(a.y))).join(" "), r = `${ze(xe(s.x), Y)} ${n} ${ze(xe(i.x), Y)}`, o = di(t), l = t.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${l}>
        <title>${l}</title>
        <line class="grid" x1=${ue} y1=${Y} x2=${ke} y2=${Y}></line>
        ${t.impulse ? d : ft`<line
              class="grid"
              x1=${ue}
              y1=${le(je(t.sustain))}
              x2=${ke}
              y2=${le(je(t.sustain))}
            ></line>`}
        <polygon class="area" points=${r}></polygon>
        <polyline class="curve" points=${n}></polyline>
        ${o.map(
      (a) => ft`<text class="caption" x=${le(vi(a.x))} y=${fi} text-anchor="middle">${a.text}</text>`
    )}
      </svg>
    `;
  }
};
Ce.styles = [
  M,
  $`
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
Ht([
  h({ attribute: !1 })
], Ce.prototype, "envelope", 2);
Ce = Ht([
  y("al-envelope-sketch")
], Ce);
var gi = Object.defineProperty, bi = Object.getOwnPropertyDescriptor, K = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? bi(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && gi(e, s, n), n;
};
const $i = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, yi = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, xi = ["entity", "gain", "key", "envelope"], be = { duration: { enable_millisecond: !0 } }, _i = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, wi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Ei = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Si = "(unknown preset — using built-in defaults)", Ai = [
  { name: "attack", label: "Attack", kind: "duration", selector: be },
  { name: "decay", label: "Decay", kind: "duration", selector: be },
  { name: "sustain", label: "Sustain", kind: "number", selector: _i },
  { name: "release", label: "Release", kind: "duration", selector: be },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: st },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: wi },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Ei },
  { name: "debounce", label: "Debounce", kind: "duration", selector: be }
];
let L = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.toText = null, this.computeLabel = (t) => $i[t.name] ?? t.name, this.computeHelper = (t) => yi[t.name] ?? "";
  }
  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  willUpdate(t) {
    if (t.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !t.has("config")) return;
    const { config: e, path: s } = this, i = e && s ? ye(e, s) : void 0;
    i && oe(i.to) !== oe(yt(this.toText)) && (this.toText = null);
  }
  emitChange(t, e) {
    this.dispatchEvent(te(t, e));
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
    const i = ye(e, s);
    if (!i) return;
    const n = t.detail?.value ?? {}, r = String(n.to ?? "");
    this.toText = r;
    const o = {
      ...i,
      entity: String(n.entity ?? ""),
      to: yt(r),
      gain: typeof n.gain == "number" ? n.gain : i.gain,
      key: Ae(n.key),
      envelope: Ae(n.envelope)
    }, l = oe(o.to) !== oe(i.to) ? "to" : xi.find((a) => o[a] !== i[a]);
    l !== void 0 && this.emitChange(A(e, s, o), `${f(s)}:${l}`);
  }
  setOverride(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(A(s, [...i, t], e), `${f(i)}:${t}`);
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
    const i = It(t, e.envelope);
    return i ? i[s] === null || i[s] === void 0 ? "defaults" : e.envelope ?? t.defaults.envelope : Si;
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length < 3)
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = ye(t, e);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = J(t, tt(e)), n = Re(this.errors, e), r = this.errors.filter((u) => u.path === f(e)), o = We(t, s), l = {
      entity: s.entity,
      to: this.toText ?? oe(s.to),
      gain: s.gain,
      key: s.key ?? "",
      envelope: s.envelope ?? ""
    }, a = this.live?.voices[i?.id ?? ""]?.find(
      (u) => u.label === (s.key ?? s.entity)
    ), p = this.countdown(a?.phase_ends ?? null);
    return c`
      <ha-card header="Stimulus">
        ${r.map((u) => c`<ha-alert alert-type="error">${u.message}</ha-alert>`)}
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
              ${p !== null ? c`<span class="muted chip">ends in ${p}</span>` : d}
              <span class="dot ${a.gate ? "gated" : ""}" title=${a.gate ? "Gate open" : "Gate closed"}></span>
            </div>` : d}

        <h3>Envelope overrides</h3>
        ${Ai.map(
      (u) => c`<al-override-field
            .hass=${this.hass}
            .label=${u.label}
            .kind=${u.kind}
            .selector=${u.selector}
            .value=${s[u.name]}
            .inherited=${o[u.name]}
            .inheritedFrom=${this.sourceOf(t, s, u.name)}
            .error=${n[u.name]}
            @value-changed=${(m) => this.setOverride(u.name, m.detail.value)}
          ></al-override-field>`
    )}
        <h3>Envelope shape</h3>
        <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
      </ha-card>
    `;
  }
};
L.styles = [
  M,
  $`
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
K([
  h({ attribute: !1 })
], L.prototype, "hass", 2);
K([
  h({ attribute: !1 })
], L.prototype, "config", 2);
K([
  h({ attribute: !1 })
], L.prototype, "path", 2);
K([
  h({ attribute: !1 })
], L.prototype, "errors", 2);
K([
  h({ attribute: !1 })
], L.prototype, "live", 2);
K([
  b()
], L.prototype, "toText", 2);
L = K([
  y("al-stimulus-editor")
], L);
var ki = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, q = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ci(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ki(e, s, n), n;
};
const Pi = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, Oi = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the sustain level back to zero.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, Li = ["id", "attack", "decay", "sustain", "release", "impulse"], _e = { duration: { enable_millisecond: !0 } }, Ti = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Mi = { boolean: {} }, Ri = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Di = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Ni = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: _e },
  { name: "decay", selector: _e },
  { name: "sustain", selector: Ti },
  { name: "release", selector: _e },
  { name: "impulse", selector: Mi }
], Ii = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Ri },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Di },
  { name: "debounce", label: "Debounce", kind: "duration", selector: _e }
];
let T = class extends v {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (t) => Pi[t.name] ?? t.name, this.computeHelper = (t) => Oi[t.name] ?? "";
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
    this.dispatchEvent(te(t, e));
  }
  selectPreset(t) {
    this.selected = t, this.blocked = null;
  }
  addPreset() {
    const t = this.config;
    if (!t) return;
    this.blocked = null;
    const e = t.envelopes.length;
    this.emitChange(Ve(t, ["envelopes"], e, Ds(js(t, "preset")))), this.selected = e;
  }
  removePreset(t) {
    const e = this.config;
    if (!e) return;
    const s = e.envelopes[t];
    if (!s) return;
    const i = zs(e, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = t, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(et(e, ["envelopes", t])), this.selected >= t && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const e = this.config, s = this.selected, i = e?.envelopes[s];
    if (!e || !i) return;
    const n = t.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      attack: z(n.attack) ?? i.attack,
      decay: z(n.decay) ?? i.decay,
      sustain: typeof n.sustain == "number" ? n.sustain : i.sustain,
      release: z(n.release) ?? i.release,
      impulse: typeof n.impulse == "boolean" ? n.impulse : i.impulse
    }, o = Li.find((p) => r[p] !== i[p]);
    if (o === void 0) return;
    const l = ["envelopes", s], a = A(Bs(e, s, r.id), l, r);
    this.emitChange(a, `${f(l)}:${o}`);
  }
  setOverride(t, e) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const n = ["envelopes", i, t];
    this.emitChange(A(s, n, e), f(n));
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
      const n = Se(this.errors, ["envelopes", i]);
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
        ${e ? c`<ha-alert alert-type="warning">${Hi(e)}</ha-alert>` : d}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(t) {
    const e = this.selected, s = t.envelopes[e];
    if (!s) return c`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", e], n = Re(this.errors, i), r = this.errors.filter((a) => a.path === f(i)), o = {
      id: s.id,
      attack: j(s.attack),
      decay: j(s.decay),
      sustain: s.sustain,
      release: j(s.release),
      impulse: s.impulse
    }, l = Ui(t, e, s);
    return c`
      <ha-card header="Envelope preset">
        ${r.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        ${l ? c`<ha-alert alert-type="warning">${l}</ha-alert>` : d}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Ni}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Ii.map(
      (a) => c`<al-override-field
            .hass=${this.hass}
            .label=${a.label}
            .kind=${a.kind}
            .selector=${a.kind === "boolean" ? st : a.selector}
            .value=${s[a.name]}
            .inherited=${t.defaults[a.name]}
            .inheritedFrom=${"defaults"}
            .error=${n[a.name]}
            @value-changed=${(p) => this.setOverride(a.name, p.detail.value)}
          ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
T.styles = [
  M,
  $`
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
q([
  h({ attribute: !1 })
], T.prototype, "hass", 2);
q([
  h({ attribute: !1 })
], T.prototype, "config", 2);
q([
  h({ attribute: !1 })
], T.prototype, "errors", 2);
q([
  h({ type: Boolean })
], T.prototype, "narrow", 2);
q([
  b()
], T.prototype, "selected", 2);
q([
  b()
], T.prototype, "blocked", 2);
T = q([
  y("al-envelopes")
], T);
function Ui(t, e, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : t.envelopes.some((i, n) => n !== e && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Hi(t) {
  const e = [];
  return t.defaults && e.push("the defaults"), t.groups.length > 0 && e.push(`group${t.groups.length > 1 ? "s" : ""} ${t.groups.join(", ")}`), `"${t.id}" is still used by ${e.join(" and ")}. Point those at another preset first.`;
}
var Fi = Object.defineProperty, ji = Object.getOwnPropertyDescriptor, De = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ji(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Fi(e, s, n), n;
};
const zi = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, Bi = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Whether a note already sounding can be retriggered, or only one in its release.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, Gi = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], Be = { duration: { enable_millisecond: !0 } }, Vi = { number: { min: 0.1, step: 0.1, mode: "box" } }, Wi = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, Ki = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, qi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
};
let Q = class extends v {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (t) => zi[t.name] ?? t.name, this.computeHelper = (t) => Bi[t.name] ?? "";
  }
  schemaFor(t) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: t.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: Vi },
      { name: "precision", selector: Wi },
      { name: "unavailable", selector: qi },
      { name: "retrigger", selector: Ki },
      { name: "debounce", selector: Be },
      { name: "safety_refresh", selector: Be },
      { name: "min_wake_interval", selector: Be }
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
      debounce: z(i.debounce) ?? s.debounce,
      safety_refresh: z(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: z(i.min_wake_interval) ?? s.min_wake_interval
    }, o = Gi.find((l) => r[l] !== s[l]);
    o !== void 0 && this.emitChange(A(e, ["defaults"], r), `defaults:${o}`);
  }
  emitChange(t, e) {
    this.dispatchEvent(te(t, e));
  }
  render() {
    const t = this.config;
    if (!t) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const e = t.defaults, s = Re(this.errors, ["defaults"]), i = this.errors.filter((r) => r.path === "defaults"), n = {
      envelope: e.envelope,
      max_value: e.max_value,
      precision: String(e.precision),
      unavailable: e.unavailable,
      retrigger: e.retrigger,
      debounce: j(e.debounce),
      safety_refresh: j(e.safety_refresh),
      min_wake_interval: j(e.min_wake_interval)
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
Q.styles = [
  M,
  $`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
De([
  h({ attribute: !1 })
], Q.prototype, "hass", 2);
De([
  h({ attribute: !1 })
], Q.prototype, "config", 2);
De([
  h({ attribute: !1 })
], Q.prototype, "errors", 2);
Q = De([
  y("al-defaults")
], Q);
const Pe = 0.1, Oe = 10, it = Math.log10(Pe), Xi = Math.log10(Oe), Ft = Xi - it, Ne = (t) => Math.min(Oe, Math.max(Pe, t)), nt = (t) => Math.round(t * 100) / 100, xt = (t) => nt(Ne(t));
function Yi(t) {
  return (Math.log10(Ne(t)) - it) / Ft;
}
function Ji(t) {
  const e = Math.min(1, Math.max(0, t));
  return nt(Ne(Math.pow(10, it + e * Ft)));
}
function Ge(t, e, s = !1) {
  const i = s ? 1.05 : 1.25;
  return nt(Ne(e === 1 ? t * i : t / i));
}
function _t(t) {
  let e = t.toFixed(2).replace(/0+$/, "");
  return e.endsWith(".") && (e += "0"), e;
}
var Zi = Object.defineProperty, Qi = Object.getOwnPropertyDescriptor, ve = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Qi(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Zi(e, s, n), n;
};
const Ke = 12, wt = (t) => `${Math.round(t * 1e3) / 10}%`;
let W = class extends v {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.label = "Gain", this.dragValue = null, this.dragging = !1, this.onWheel = (t) => {
      this.disabled || t.deltaY === 0 || (t.preventDefault(), this.commit(Ge(this.current, t.deltaY < 0 ? 1 : -1, t.shiftKey)));
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
        s = Ge(e, 1, t.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        s = Ge(e, -1, t.shiftKey);
        break;
      case "Home":
        s = Pe;
        break;
      case "End":
        s = Oe;
        break;
      case "PageUp":
        s = xt(e * 2);
        break;
      case "PageDown":
        s = xt(e / 2);
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
    const i = Ji(1 - (t.clientY - s.top) / s.height);
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
    const t = this.current, e = Yi(t);
    return c`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${Pe}
        aria-valuemax=${Oe}
        aria-valuenow=${t}
        aria-valuetext=${_t(t)}
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
          <div class="fill" style="height: ${wt(e)}"></div>
          <div class="knob" style="bottom: calc(${wt(e)} - ${Math.round((e - 0.5) * Ke * 10) / 10}px - ${Ke / 2}px)"></div>
        </div>
        <div class="value">${_t(t)}</div>
      </div>
    `;
  }
};
W.styles = $`
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
      height: ${Ke}px;
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
ve([
  h({ type: Number })
], W.prototype, "value", 2);
ve([
  h({ type: Boolean, reflect: !0 })
], W.prototype, "disabled", 2);
ve([
  h({ type: String })
], W.prototype, "label", 2);
ve([
  b()
], W.prototype, "dragValue", 2);
W = ve([
  y("al-fader")
], W);
const en = { ATTRIBUTE: 1 }, tn = (t) => (...e) => ({ _$litDirective$: t, values: e });
class sn {
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
const Et = tn(class extends sn {
  constructor(t) {
    if (super(t), t.type !== en.ATTRIBUTE || t.name !== "class" || t.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
      const n = !!e[i];
      n === this.st.has(i) || this.nt?.has(i) || (n ? (s.add(i), this.st.add(i)) : (s.remove(i), this.st.delete(i)));
    }
    return G;
  }
});
var nn = Object.defineProperty, rn = Object.getOwnPropertyDescriptor, Ie = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? rn(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && nn(e, s, n), n;
};
const on = (t) => `${Math.round(t * 1e3) / 10}%`;
let ee = class extends v {
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
        <div class=${Et({ fill: !0, hot: t > 0.9 })} style="width: ${on(t)}"></div>
      </div>
      <div class=${Et({ dot: !0, gated: this.gated })}></div>
    `;
  }
};
ee.styles = $`
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
Ie([
  h({ type: Number })
], ee.prototype, "value", 2);
Ie([
  h({ type: Number })
], ee.prototype, "max", 2);
Ie([
  h({ type: Boolean })
], ee.prototype, "gated", 2);
ee = Ie([
  y("al-meter")
], ee);
var an = Object.defineProperty, ln = Object.getOwnPropertyDescriptor, C = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ln(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && an(e, s, n), n;
};
const cn = (t) => String(Math.round(t * 100) / 100);
function St(t) {
  return t.impulse ? `impulse · R ${E(t.release)}` : `A ${E(t.attack)} · D ${E(t.decay)} · S ${cn(t.sustain)} · R ${E(t.release)}`;
}
let _ = class extends v {
  constructor() {
    super(...arguments), this.kind = "channel", this.label = "", this.sublabel = null, this.envelope = null, this.gain = 1, this.live = null, this.selected = !1, this.errors = 0, this.entityIcon = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.hasAttribute("tabindex") || (this.tabIndex = -1);
  }
  select() {
    this.dispatchEvent(ks());
  }
  /** Drilling into a bus is its own intent: it must not also read as selecting the strip. */
  open(t) {
    t.stopPropagation(), this.dispatchEvent(Cs());
  }
  onGain(t) {
    t.stopPropagation(), this.dispatchEvent(Ps(t.detail));
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
        <div class="adsr" title=${t ? St(t) : ""}>${t ? St(t) : ""}</div>
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
_.styles = $`
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
C([
  h({ type: String, reflect: !0 })
], _.prototype, "kind", 2);
C([
  h({ type: String })
], _.prototype, "label", 2);
C([
  h({ type: String })
], _.prototype, "sublabel", 2);
C([
  h({ attribute: !1 })
], _.prototype, "envelope", 2);
C([
  h({ type: Number })
], _.prototype, "gain", 2);
C([
  h({ attribute: !1 })
], _.prototype, "live", 2);
C([
  h({ type: Boolean, reflect: !0 })
], _.prototype, "selected", 2);
C([
  h({ type: Number })
], _.prototype, "errors", 2);
C([
  h({ type: String })
], _.prototype, "entityIcon", 2);
_ = C([
  y("al-strip")
], _);
var hn = Object.defineProperty, dn = Object.getOwnPropertyDescriptor, P = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? dn(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && hn(e, s, n), n;
};
const un = ["sum", "max", "mean"], At = 0.1;
let w = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.mix = "sum", this.maxValue = 5, this.precision = 1, this.live = null, this.lights = 0, this.simEntityId = null, this.simOn = !1, this.blockedReason = null;
  }
  onMix(t) {
    this.dispatchEvent(Os(t.target.value));
  }
  /**
   * `min` on a number input is advice to the browser, not a guarantee to us: it does not stop
   * a typed or pasted `0`, and `.value` reads back whatever is in the box. So the floor is
   * enforced here, and a rejected entry — empty, unreadable, or below the floor — puts the
   * committed ceiling back in the box rather than leaving a value we refused on screen.
   */
  onLimiter(t) {
    const e = t.target, s = e.value.trim(), i = Number(s);
    if (s === "" || !Number.isFinite(i) || i < At) {
      e.value = String(this.maxValue);
      return;
    }
    this.dispatchEvent(Ls(i));
  }
  onSim(t) {
    this.dispatchEvent(Ts(t.target.checked === !0));
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
            ${un.map((e) => c`<option value=${e} ?selected=${e === this.mix}>${e}</option>`)}
          </select>
        </div>
        <div>
          <label for="limiter">limiter</label>
          <input
            id="limiter"
            class="limiter"
            type="number"
            min=${At}
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
w.styles = $`
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
P([
  h({ type: String })
], w.prototype, "label", 2);
P([
  h({ type: String })
], w.prototype, "mix", 2);
P([
  h({ type: Number })
], w.prototype, "maxValue", 2);
P([
  h({ type: Number })
], w.prototype, "precision", 2);
P([
  h({ attribute: !1 })
], w.prototype, "live", 2);
P([
  h({ type: Number })
], w.prototype, "lights", 2);
P([
  h({ type: String })
], w.prototype, "simEntityId", 2);
P([
  h({ type: Boolean })
], w.prototype, "simOn", 2);
P([
  h({ type: String })
], w.prototype, "blockedReason", 2);
w = P([
  y("al-master-strip")
], w);
function pn(t, e) {
  const s = me(t, e);
  if (!s) return [];
  const i = [];
  return s.stimuli.forEach((n, r) => i.push([...e, "stimuli", r])), s.children.forEach((n, r) => i.push([...e, "children", r])), i;
}
function mn(t, e) {
  const s = [];
  for (let i = 2; i <= e.length; i += 2) {
    const n = e.slice(0, i), r = me(t, n);
    if (!r) break;
    s.push({ path: n, label: r.name ?? r.id });
  }
  return s;
}
var fn = Object.defineProperty, vn = Object.getOwnPropertyDescriptor, U = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? vn(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && fn(e, s, n), n;
};
const gn = (t) => `switch.${t}_presence_simulation`, kt = (t) => t[t.length - 2] === "children";
let k = class extends v {
  constructor() {
    super(...arguments), this.nav = { busPath: [], selection: null }, this.errors = [], this.live = null, this.simState = {}, this.narrow = !1, this.pendingFocus = !1;
  }
  get bus() {
    return this.config ? J(this.config, this.nav.busPath) : void 0;
  }
  get channels() {
    return this.config ? pn(this.config, this.nav.busPath) : [];
  }
  isSelected(t) {
    return this.nav.selection !== null && f(this.nav.selection) === f(t);
  }
  /** The ceiling a channel's meter is drawn against: the bus it mixes into, not its own. */
  busCeiling(t) {
    return this.live?.groups[t.id]?.max_value ?? t.max_value ?? this.config?.defaults.max_value ?? 5;
  }
  navigate(t) {
    this.pendingFocus = !0, this.dispatchEvent(Fe(t));
  }
  emitChange(t, e) {
    this.dispatchEvent(te(t, e));
  }
  /** Which strip an event came from: strips are identical, so the row index is the key. */
  pathOf(t) {
    const e = t.target?.dataset?.index;
    return e === void 0 ? null : this.channels[Number(e)] ?? null;
  }
  onStripSelect(t) {
    const e = this.pathOf(t);
    e && this.dispatchEvent(Fe({ type: "select", path: e }));
  }
  onStripOpen(t) {
    const e = this.pathOf(t);
    e && this.navigate({ type: "open", path: e });
  }
  /**
   * Both the live moves of a drag and the value it settles on are reported: the coalesce
   * key folds the flood into one undo step, and reporting the moves is what lets the
   * meters and the timeline follow the fader while it is still under the pointer.
   */
  onStripGain(t) {
    const e = this.pathOf(t), s = this.config;
    if (!e || !s) return;
    const { value: i } = t.detail;
    this.emitChange(A(s, [...e, "gain"], i), `${f(e)}:gain`);
  }
  onMasterSelect() {
    this.dispatchEvent(Fe({ type: "select", path: this.nav.busPath }));
  }
  onMix(t) {
    const e = this.config;
    if (!e) return;
    const { mix: s } = t.detail;
    this.emitChange(A(e, [...this.nav.busPath, "mix"], s));
  }
  onLimiter(t) {
    const e = this.config;
    if (!e) return;
    const { value: s } = t.detail;
    this.emitChange(A(e, [...this.nav.busPath, "max_value"], s), `${f(this.nav.busPath)}:limiter`);
  }
  onSim(t) {
    const e = this.bus;
    if (!e) return;
    const { on: s } = t.detail;
    this.dispatchEvent(Ms(e.id, s));
  }
  /** Console keys: ←/→ walk the row, Enter drills into a bus, Backspace comes back up. */
  onKeyDown(t) {
    const e = this.config;
    if (e)
      switch (t.key) {
        case "ArrowRight":
        case "ArrowLeft":
          t.preventDefault(), this.navigate({ type: "arrow", delta: t.key === "ArrowRight" ? 1 : -1, config: e });
          break;
        case "Enter": {
          const s = this.nav.selection;
          if (!s || !kt(s) || !this.channels.some((i) => f(i) === f(s)))
            return;
          t.preventDefault(), this.navigate({ type: "open", path: s });
          break;
        }
        case "Backspace":
          t.preventDefault(), this.nav.busPath.length >= 4 && this.navigate({ type: "up" });
          break;
        case "Home":
        case "End": {
          t.preventDefault();
          const s = this.channels[0] ?? this.nav.busPath;
          this.navigate({ type: "select", path: t.key === "Home" ? s : this.nav.busPath });
          break;
        }
      }
  }
  updated(t) {
    !this.pendingFocus || !t.has("nav") || (this.pendingFocus = !1, this.focusSelected());
  }
  /** Keeps focus on the one strip in the tab order after the row has been re-rendered. */
  async focusSelected() {
    await this.updateComplete, this.shadowRoot?.querySelector('.strips > [tabindex="0"]')?.focus();
  }
  renderCrumbs(t) {
    const e = mn(t, this.nav.busPath);
    return c`
      <div class="crumbs">
        <button
          class="link up"
          title="Up one bus"
          ?disabled=${this.nav.busPath.length < 4}
          @click=${() => this.navigate({ type: "up" })}
        >
          ⌃ up
        </button>
        ${e.map(
      (s, i) => c`
            ${i > 0 ? c`<span class="sep">›</span>` : d}
            <button class="link crumb" @click=${() => this.navigate({ type: "open", path: s.path })}>
              ${s.label}
            </button>
          `
    )}
      </div>
    `;
  }
  renderChannel(t, e, s, i) {
    const n = this.isSelected(s), r = {
      index: i,
      selected: n,
      errors: Se(this.errors, s),
      tabindex: n ? 0 : -1
    };
    return kt(s) ? this.renderBusChannel(t, e, s, r) : this.renderStimulusChannel(t, e, s, r);
  }
  renderBusChannel(t, e, s, i) {
    const n = J(t, s);
    if (!n) return c``;
    const r = this.live?.groups[n.id], o = r ? { value: r.value, max: this.busCeiling(e), gated: r.gated } : null;
    return c`
      <al-strip
        kind="bus"
        data-index=${i.index}
        tabindex=${i.tabindex}
        ?narrow=${this.narrow}
        .label=${n.name ?? n.id}
        .sublabel=${`bus · ${n.stimuli.length + n.children.length}`}
        .envelope=${We(t, {})}
        .gain=${n.gain}
        .live=${o}
        .selected=${i.selected}
        .errors=${i.errors}
      ></al-strip>
    `;
  }
  renderStimulusChannel(t, e, s, i) {
    const n = ye(t, s);
    if (!n) return c``;
    const r = this.hass?.states[n.entity], o = this.live?.voices[e.id]?.find((a) => a.label === (n.key ?? n.entity)), l = o ? { value: o.value, max: this.busCeiling(e), gated: o.gate } : null;
    return c`
      <al-strip
        kind="channel"
        data-index=${i.index}
        tabindex=${i.tabindex}
        ?narrow=${this.narrow}
        .label=${r?.attributes.friendly_name ?? n.entity}
        .sublabel=${r?.state ?? "unknown"}
        .envelope=${We(t, n)}
        .gain=${n.gain}
        .live=${l}
        .selected=${i.selected}
        .errors=${i.errors}
        .entityIcon=${r?.attributes.icon ?? null}
      ></al-strip>
    `;
  }
  renderMaster(t, e) {
    const s = this.live?.groups[e.id], i = s ? { value: s.value, max: s.max_value, gated: s.gated } : null, n = gn(e.id), r = this.isSelected(this.nav.busPath);
    return c`
      <al-master-strip
        tabindex=${r ? 0 : -1}
        ?selected=${r}
        ?narrow=${this.narrow}
        .label=${(e.name ?? e.id).toUpperCase()}
        .mix=${e.mix}
        .maxValue=${e.max_value ?? t.defaults.max_value}
        .precision=${e.precision ?? t.defaults.precision}
        .live=${i}
        .lights=${s?.lights ?? 0}
        .simEntityId=${n}
        .simOn=${this.hass?.states[n]?.state === "on"}
        .blockedReason=${this.simState[e.id]?.blocked ?? null}
        @click=${this.onMasterSelect}
      ></al-master-strip>
    `;
  }
  render() {
    const t = this.config, e = this.bus;
    return !t || !e ? c`<div class="empty muted">No bus to mix: add a group first.</div>` : c`
      ${this.renderCrumbs(t)}
      <div
        class="strips"
        role="group"
        aria-label="Mixer"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-open-strip=${this.onStripOpen}
        @al-gain-changed=${this.onStripGain}
        @al-mix-changed=${this.onMix}
        @al-limiter-changed=${this.onLimiter}
        @al-sim-toggled=${this.onSim}
      >
        ${this.channels.map((s, i) => this.renderChannel(t, e, s, i))}${this.renderMaster(t, e)}
      </div>
    `;
  }
};
k.styles = [
  M,
  $`
      :host {
        display: block;
        background: none;
      }
      .crumbs {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        min-height: 28px;
        margin-bottom: 8px;
      }
      .link {
        background: none;
        border: none;
        margin: 0;
        padding: 2px 4px;
        font: inherit;
        color: inherit;
        border-radius: 4px;
        cursor: pointer;
      }
      .link:disabled {
        color: var(--disabled-text-color, #9e9e9e);
        cursor: default;
      }
      .link:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      .crumb:last-of-type {
        font-weight: 600;
      }
      .sep {
        color: var(--secondary-text-color);
      }
      .strips {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        overflow-x: auto;
        padding: 4px;
        outline: none;
      }
      /* The master sits at the right of the row, past any channels, like a console. */
      al-master-strip {
        margin-left: auto;
      }
      al-master-strip[selected] {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      .empty {
        padding: 8px 4px;
      }
    `
];
U([
  h({ attribute: !1 })
], k.prototype, "hass", 2);
U([
  h({ attribute: !1 })
], k.prototype, "config", 2);
U([
  h({ attribute: !1 })
], k.prototype, "nav", 2);
U([
  h({ attribute: !1 })
], k.prototype, "errors", 2);
U([
  h({ attribute: !1 })
], k.prototype, "live", 2);
U([
  h({ attribute: !1 })
], k.prototype, "simState", 2);
U([
  h({ type: Boolean, reflect: !0 })
], k.prototype, "narrow", 2);
k = U([
  y("al-mixer")
], k);
