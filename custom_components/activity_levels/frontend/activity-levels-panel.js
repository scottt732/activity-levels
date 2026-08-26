const Pe = globalThis, ht = Pe.ShadowRoot && (Pe.ShadyCSS === void 0 || Pe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, dt = /* @__PURE__ */ Symbol(), wt = /* @__PURE__ */ new WeakMap();
let Xt = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== dt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (ht && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = wt.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && wt.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const fs = (e) => new Xt(typeof e == "string" ? e : e + "", void 0, dt), w = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + e[r + 1], e[0]);
  return new Xt(s, e, dt);
}, gs = (e, t) => {
  if (ht) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), n = Pe.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, e.appendChild(i);
  }
}, _t = ht ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return fs(s);
})(e) : e;
const { is: vs, defineProperty: bs, getOwnPropertyDescriptor: $s, getOwnPropertyNames: ys, getOwnPropertySymbols: xs, getPrototypeOf: ws } = Object, je = globalThis, St = je.trustedTypes, _s = St ? St.emptyScript : "", Ss = je.reactiveElementPolyfillSupport, ge = (e, t) => e, Me = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? _s : null;
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
} }, ut = (e, t) => !vs(e, t), Et = { attribute: !0, type: String, converter: Me, reflect: !1, useDefault: !1, hasChanged: ut };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), je.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ie = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = Et) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(t, i, s);
      n !== void 0 && bs(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: n, set: r } = $s(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Et;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ge("elementProperties"))) return;
    const t = ws(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ge("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ge("properties"))) {
      const s = this.properties, i = [...ys(s), ...xs(s)];
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
      for (const n of i) s.unshift(_t(n));
    } else t !== void 0 && s.push(_t(t));
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
    return gs(t, this.constructor.elementStyles), t;
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
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : Me).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Me;
      this._$Em = n;
      const a = o.fromAttribute(s, r.type);
      this[n] = a ?? this._$Ej?.get(n) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, n = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? ut)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
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
ie.elementStyles = [], ie.shadowRootOptions = { mode: "open" }, ie[ge("elementProperties")] = /* @__PURE__ */ new Map(), ie[ge("finalized")] = /* @__PURE__ */ new Map(), Ss?.({ ReactiveElement: ie }), (je.reactiveElementVersions ??= []).push("2.1.2");
const pt = globalThis, kt = (e) => e, Re = pt.trustedTypes, At = Re ? Re.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Yt = "$lit$", F = `lit$${Math.random().toFixed(9).slice(2)}$`, Zt = "?" + F, Es = `<${Zt}>`, X = document, be = () => X.createComment(""), $e = (e) => e === null || typeof e != "object" && typeof e != "function", mt = Array.isArray, ks = (e) => mt(e) || typeof e?.[Symbol.iterator] == "function", Xe = `[ 	
\f\r]`, pe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ct = /-->/g, Pt = />/g, V = RegExp(`>|${Xe}(?:([^\\s"'>=/]+)(${Xe}*=${Xe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ot = /'/g, Lt = /"/g, Jt = /^(?:script|style|textarea|title)$/i, Qt = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), c = Qt(1), k = Qt(2), Y = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), Tt = /* @__PURE__ */ new WeakMap(), q = X.createTreeWalker(X, 129);
function es(e, t) {
  if (!mt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return At !== void 0 ? At.createHTML(t) : t;
}
const As = (e, t) => {
  const s = e.length - 1, i = [];
  let n, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = pe;
  for (let a = 0; a < s; a++) {
    const l = e[a];
    let d, p, m = -1, E = 0;
    for (; E < l.length && (o.lastIndex = E, p = o.exec(l), p !== null); ) E = o.lastIndex, o === pe ? p[1] === "!--" ? o = Ct : p[1] !== void 0 ? o = Pt : p[2] !== void 0 ? (Jt.test(p[2]) && (n = RegExp("</" + p[2], "g")), o = V) : p[3] !== void 0 && (o = V) : o === V ? p[0] === ">" ? (o = n ?? pe, m = -1) : p[1] === void 0 ? m = -2 : (m = o.lastIndex - p[2].length, d = p[1], o = p[3] === void 0 ? V : p[3] === '"' ? Lt : Ot) : o === Lt || o === Ot ? o = V : o === Ct || o === Pt ? o = pe : (o = V, n = void 0);
    const L = o === V && e[a + 1].startsWith("/>") ? " " : "";
    r += o === pe ? l + Es : m >= 0 ? (i.push(d), l.slice(0, m) + Yt + l.slice(m) + F + L) : l + F + (m === -2 ? a : L);
  }
  return [es(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class ye {
  constructor({ strings: t, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, l = this.parts, [d, p] = As(t, s);
    if (this.el = ye.createElement(d, i), q.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (n = q.nextNode()) !== null && l.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const m of n.getAttributeNames()) if (m.endsWith(Yt)) {
          const E = p[o++], L = n.getAttribute(m).split(F), te = /([.?@])?(.*)/.exec(E);
          l.push({ type: 1, index: r, name: te[2], strings: L, ctor: te[1] === "." ? Ps : te[1] === "?" ? Os : te[1] === "@" ? Ls : Be }), n.removeAttribute(m);
        } else m.startsWith(F) && (l.push({ type: 6, index: r }), n.removeAttribute(m));
        if (Jt.test(n.tagName)) {
          const m = n.textContent.split(F), E = m.length - 1;
          if (E > 0) {
            n.textContent = Re ? Re.emptyScript : "";
            for (let L = 0; L < E; L++) n.append(m[L], be()), q.nextNode(), l.push({ type: 2, index: ++r });
            n.append(m[E], be());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Zt) l.push({ type: 2, index: r });
      else {
        let m = -1;
        for (; (m = n.data.indexOf(F, m + 1)) !== -1; ) l.push({ type: 7, index: r }), m += F.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const i = X.createElement("template");
    return i.innerHTML = t, i;
  }
}
function ae(e, t, s = e, i) {
  if (t === Y) return t;
  let n = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = $e(t) ? void 0 : t._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(e), n._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = n : s._$Cl = n), n !== void 0 && (t = ae(e, n._$AS(e, t.values), n, i)), t;
}
class Cs {
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
    const { el: { content: s }, parts: i } = this._$AD, n = (t?.creationScope ?? X).importNode(s, !0);
    q.currentNode = n;
    let r = q.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let d;
        l.type === 2 ? d = new we(r, r.nextSibling, this, t) : l.type === 1 ? d = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (d = new Ts(r, this, t)), this._$AV.push(d), l = i[++a];
      }
      o !== l?.index && (r = q.nextNode(), o++);
    }
    return q.currentNode = X, n;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class we {
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
    t = ae(this, t, s), $e(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== Y && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ks(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && $e(this._$AH) ? this._$AA.nextSibling.data = t : this.T(X.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = ye.createElement(es(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(s);
    else {
      const r = new Cs(n, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = Tt.get(t.strings);
    return s === void 0 && Tt.set(t.strings, s = new ye(t)), s;
  }
  k(t) {
    mt(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const r of t) n === s.length ? s.push(i = new we(this.O(be()), this.O(be()), this, this.options)) : i = s[n], i._$AI(r), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = kt(t).nextSibling;
      kt(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Be {
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
    if (r === void 0) t = ae(this, t, s, 0), o = !$e(t) || t !== this._$AH && t !== Y, o && (this._$AH = t);
    else {
      const a = t;
      let l, d;
      for (t = r[0], l = 0; l < r.length - 1; l++) d = ae(this, a[i + l], s, l), d === Y && (d = this._$AH[l]), o ||= !$e(d) || d !== this._$AH[l], d === u ? t = u : t !== u && (t += (d ?? "") + r[l + 1]), this._$AH[l] = d;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ps extends Be {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Os extends Be {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Ls extends Be {
  constructor(t, s, i, n, r) {
    super(t, s, i, n, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = ae(this, t, s, 0) ?? u) === Y) return;
    const i = this._$AH, n = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== u && (i === u || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ts {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ae(this, t);
  }
}
const Ms = pt.litHtmlPolyfillSupport;
Ms?.(ye, we), (pt.litHtmlVersions ??= []).push("3.3.3");
const Rs = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = n = new we(t.insertBefore(be(), r), r, void 0, s ?? {});
  }
  return n._$AI(e), n;
};
const ft = globalThis;
let v = class extends ie {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Rs(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Y;
  }
};
v._$litElement$ = !0, v.finalized = !0, ft.litElementHydrateSupport?.({ LitElement: v });
const Is = ft.litElementPolyfillSupport;
Is?.({ LitElement: v });
(ft.litElementVersions ??= []).push("4.2.2");
const _ = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
const Ds = { attribute: !0, type: String, converter: Me, reflect: !1, hasChanged: ut }, Ns = (e = Ds, t, s) => {
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
  return (t, s) => typeof s == "object" ? Ns(e, t, s) : ((i, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(e, t, s);
}
function b(e) {
  return h({ ...e, state: !0, attribute: !1 });
}
const ts = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Hs = (e) => e.callWS({ type: "activity_levels/config/get" }).then((t) => t.config), Us = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(ts);
async function zs(e, t) {
  try {
    return ts(await e.callWS({ type: "activity_levels/config/save", config: t }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const Fs = (e) => e.callWS({ type: "activity_levels/state" }), js = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), Ye = [
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
], Bs = 2500, Gs = 8e3;
function Vs(e) {
  let t;
  return { promise: new Promise((i) => {
    t = setTimeout(i, e);
  }), cancel: () => clearTimeout(t) };
}
async function Mt(e, t, s) {
  const i = Vs(t);
  try {
    return await Promise.race([e, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function qs() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function Ws(e = Gs, t = Bs) {
  if (Ye.every((n) => customElements.get(n))) return { ok: !0, missing: [] };
  await Mt(qs(), t, void 0);
  const s = await Promise.all(
    Ye.map(
      (n) => Mt(
        customElements.whenDefined(n).then(() => !0),
        e,
        !1
      )
    )
  ), i = Ye.filter((n, r) => !s[r]);
  return { ok: i.length === 0, missing: [...i] };
}
async function Ks(e, t) {
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
function _e(e, t) {
  let s = e;
  for (const i of t) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function Rt(e) {
  return Array.isArray(e) ? [...e] : { ...e };
}
function Ge(e, t, s) {
  if (t.length === 0) throw new Error("empty path");
  const i = Rt(e);
  let n = i;
  for (let r = 0; r < t.length - 1; r++) {
    const o = t[r], a = Rt(n[o]);
    n[o] = a, n = a;
  }
  return s(n, t[t.length - 1]), i;
}
function T(e, t, s) {
  return Ge(e, t, (i, n) => {
    i[n] = s;
  });
}
function gt(e, t) {
  return Ge(e, t, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function at(e, t, s, i) {
  return Ge(e, [...t, s], (n) => {
    n.splice(s, 0, i);
  });
}
function Xs(e, t, s, i) {
  return Ge(e, [...t, s], (n) => {
    const r = n, [o] = r.splice(s, 1);
    r.splice(i, 0, o);
  });
}
const Ys = 1e3;
class Zs {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < Ys || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const R = w`
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
var Js = Object.defineProperty, Qs = Object.getOwnPropertyDescriptor, S = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Qs(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Js(t, s, n), n;
};
const me = ["groups", "envelopes", "defaults"], ei = 2e3, ti = 1500;
let y = class extends v {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.tabFocus = 0, this.onVisibilityChange = () => this.updateLivePolling(), this.onChange = (e) => {
      e.structural && (this.errors = []), this.setConfig(e.detail, e.coalesceKey);
    }, this.onTabsKeydown = (e) => {
      const t = me.length - 1;
      switch (e.key) {
        case "ArrowRight":
          this.focusTab((this.tabFocus + 1) % me.length);
          break;
        case "ArrowLeft":
          this.focusTab((this.tabFocus + t) % me.length);
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
    super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange);
    const { ok: e, missing: t } = await Ws();
    this.missing = e ? [] : t, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.stopLive();
  }
  async load() {
    try {
      const e = await Hs(this.hass);
      this.draft = new Zs(e), this.syncSelection(), this.errors = [], this.banner = null;
    } catch (e) {
      this.banner = { kind: "error", text: `Could not load configuration: ${e.message}` };
    }
  }
  setConfig(e, t) {
    this.draft?.set(e, t), this.syncSelection(), this.requestUpdate();
  }
  /** Drops a selection whose node is gone, so the editor pane never renders a dangling path. */
  syncSelection() {
    const e = this.draft?.config;
    !e || !this.selection || _e(e, this.selection) === void 0 && (this.selection = null);
  }
  async save() {
    const e = this.draft;
    if (e) {
      this.busy = !0, this.updateLivePolling();
      try {
        const t = await Ks(e.config, {
          validate: (s) => Us(this.hass, s),
          save: (s) => zs(this.hass, s)
        });
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, ti)), await this.load());
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
  toggleLive(e) {
    e ? this.startLive() : this.stopLive();
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
    }, ei));
  }
  async pollLive() {
    try {
      this.live = await Fs(this.hass);
    } catch {
    }
  }
  clearLiveTimer() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
  }
  selectTab(e) {
    const t = me[e];
    t !== void 0 && (this.tab = t, this.tabFocus = e);
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
          <span class="muted">Live</span>
          <ha-switch
            .checked=${this.liveOn}
            @change=${(t) => this.toggleLive(t.target.checked)}
          ></ha-switch>
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
          ${me.map(
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
      case "groups":
        return c`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree
            .hass=${this.hass}
            .config=${e.config}
            .selection=${this.selection}
            .errors=${this.errors}
            .live=${this.live}
            @al-select=${(t) => {
          this.selection = t.detail;
        }}
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
    }
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
          @al-select=${(i) => {
      this.selection = i.detail;
    }}
        ></al-group-editor>` : c`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
  }
};
y.styles = [R];
S([
  h({ attribute: !1 })
], y.prototype, "hass", 2);
S([
  h({ type: Boolean })
], y.prototype, "narrow", 2);
S([
  b()
], y.prototype, "draft", 2);
S([
  b()
], y.prototype, "tab", 2);
S([
  b()
], y.prototype, "selection", 2);
S([
  b()
], y.prototype, "errors", 2);
S([
  b()
], y.prototype, "banner", 2);
S([
  b()
], y.prototype, "live", 2);
S([
  b()
], y.prototype, "liveOn", 2);
S([
  b()
], y.prototype, "busy", 2);
S([
  b()
], y.prototype, "missing", 2);
S([
  b()
], y.prototype, "tabFocus", 2);
y = S([
  _("activity-levels-panel")
], y);
function W(e) {
  const t = Math.floor(e / 3600), s = Math.floor((e - t * 3600) / 60), i = Math.round((e - t * 3600 - s * 60) * 1e3) / 1e3, n = Math.floor(i), r = Math.round((i - n) * 1e3);
  return r === 0 ? { hours: t, minutes: s, seconds: n } : { hours: t, minutes: s, seconds: n, milliseconds: r };
}
function K(e) {
  if (!e) return null;
  const t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
  return Math.round(t * 1e3) / 1e3;
}
function P(e) {
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
const g = (e) => e.join("/");
function Ve(e, t) {
  const s = g(t), i = {};
  for (const n of e) {
    if (!n.path.startsWith(s + "/")) continue;
    const r = n.path.slice(s.length + 1);
    r.includes("/") || (i[r] = n.message);
  }
  return i;
}
function Ie(e, t) {
  const s = g(t);
  return e.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function he(e, t, s) {
  const i = new CustomEvent("al-change", {
    detail: e,
    bubbles: !0,
    composed: !0
  });
  return t !== void 0 && (i.coalesceKey = t), s && (i.structural = !0), i;
}
const ss = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), de = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), si = () => de("al-select-strip", null), ii = () => de("al-open-strip", null), ni = (e) => de("al-gain-changed", e), ri = (e) => de("al-mix-changed", { mix: e }), oi = (e) => de("al-limiter-changed", { value: e }), ai = (e) => de("al-sim-toggled", { on: e }), Ze = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), li = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), ci = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), hi = (e) => ({
  id: e,
  name: null,
  area: null,
  mix: "sum",
  null_handling: "zero",
  max_value: null,
  precision: null,
  gain: 1,
  stimuli: [],
  children: []
}), di = (e) => ({
  id: e,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), ui = (e) => ({
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
});
function pi(e) {
  const t = /* @__PURE__ */ new Set(), s = (i) => {
    t.add(i.id), i.children.forEach(s);
  };
  return e.groups.forEach(s), t;
}
function mi(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const fi = (e) => new Set(e.envelopes.map((t) => t.id));
function is(e, t) {
  const s = mi(t);
  if (!e.has(s)) return s;
  let i = 2;
  for (; e.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const gi = (e, t) => is(pi(e), t), vi = (e, t) => is(fi(e), t);
function bi(e, t) {
  const s = [], i = (n) => {
    n.stimuli.some((r) => r.envelope === t) && s.push(n.id), n.children.forEach(i);
  };
  return e.groups.forEach(i), { defaults: e.defaults.envelope === t, groups: s };
}
function $i(e, t, s) {
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
const oe = (e, t) => _e(e, t), Oe = (e, t) => _e(e, t), yi = (e) => e.slice(0, -1), vt = (e) => e.slice(0, -2), ns = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function lt(e, t) {
  const s = ns(e, t.envelope), i = e.defaults, n = (r, o, a) => r ?? o ?? a;
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
var xi = Object.defineProperty, wi = Object.getOwnPropertyDescriptor, ue = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? wi(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && xi(t, s, n), n;
};
const It = (e) => e.stopPropagation(), _i = (e) => {
  (e.key === "Enter" || e.key === " ") && e.stopPropagation();
};
let j = class extends v {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(e) {
    this.dispatchEvent(he(e, void 0, !0));
  }
  emitSelect(e) {
    this.dispatchEvent(ss(e));
  }
  isSelected(e) {
    return this.selection !== null && g(this.selection) === g(e);
  }
  select(e, t) {
    e.stopPropagation(), this.emitSelect(t);
  }
  selectOnKey(e, t) {
    e.key !== "Enter" && e.key !== " " || (e.preventDefault(), e.stopPropagation(), this.emitSelect(t));
  }
  addGroup(e, t) {
    const s = this.config;
    s && (this.emitChange(at(s, e, t, hi(gi(s, "new_group")))), this.emitSelect([...e, t]));
  }
  addStimulus(e, t) {
    const s = this.config;
    if (!s) return;
    const i = [...e, "stimuli"];
    this.emitChange(at(s, i, t, ui(""))), this.emitSelect([...i, t]);
  }
  move(e, t) {
    const s = this.config;
    if (!s) return;
    const i = yi(e), n = e[e.length - 1], r = n + t;
    this.emitChange(Xs(s, i, n, r));
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
    if (i === null || i.length <= e.length || g(i.slice(0, e.length)) !== g(e)) return null;
    const n = i[e.length], r = n === t ? s : n === s ? t : null;
    if (r === null) return null;
    const o = [...i];
    return o[e.length] = r, o;
  }
  removeNode(e, t) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
    this.emitChange(gt(s, e));
    const i = vt(e);
    this.emitSelect(i.length ? i : null);
  }
  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  countdown(e) {
    const t = this.live?.now;
    return e === null || t === void 0 ? null : P(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
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
    const o = Ie(this.errors, s), a = this.live?.groups[t.id], l = a?.max_value ?? t.max_value ?? e.defaults.max_value, d = a ? Math.max(0, Math.min(100, a.value / (l || 1) * 100)) : 0;
    return c`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(p) => this.select(p, s)}
            @keydown=${_i}
          >
            ${t.name || t.id || "(unnamed group)"}
          </button>
          ${o ? c`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : u}
          ${a ? c`<div class="meter" title=${this.meterTitle(a, l, i === 0)}>
                  <div style="width: ${d}%"></div>
                </div>
                <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : u}
        </div>
        <div slot="icons" class="row" @click=${It}>
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
    const r = this.hass?.states[e.entity], o = r?.attributes.friendly_name ?? (e.entity || "(no entity)"), a = Ie(this.errors, t), l = this.live?.voices[n]?.find((d) => d.label === (e.key ?? e.entity));
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
        <div class="row" @click=${It}>
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
j.styles = [
  R,
  w`
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
ue([
  h({ attribute: !1 })
], j.prototype, "hass", 2);
ue([
  h({ attribute: !1 })
], j.prototype, "config", 2);
ue([
  h({ attribute: !1 })
], j.prototype, "selection", 2);
ue([
  h({ attribute: !1 })
], j.prototype, "errors", 2);
ue([
  h({ attribute: !1 })
], j.prototype, "live", 2);
j = ue([
  _("al-tree")
], j);
const Dt = (e) => e.split(",").map((t) => t.trim()).filter((t) => t.length > 0), fe = (e) => (e ?? []).join(", "), De = (e) => e == null || e === "" ? null : e;
function Si(e, t) {
  if (t != null)
    switch (e) {
      case "duration":
        return W(t);
      case "boolean":
        return t ? "true" : "false";
      default:
        return t;
    }
}
function Ei(e, t) {
  if (t == null || t === "") return null;
  switch (e) {
    case "duration":
      return K(t);
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
function ki(e, t) {
  if (t == null) return "unset";
  switch (e) {
    case "duration":
      return P(t);
    case "boolean":
      return t ? "Yes" : "No";
    default:
      return String(t);
  }
}
var Ai = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, U = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ci(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Ai(t, s, n), n;
};
const bt = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
function Pi(e, t) {
  return e.select?.options?.find((i) => i.value === t)?.label;
}
let O = class extends v {
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
    e.stopPropagation(), this.emit(Ei(this.kind, e.detail?.value));
  }
  onReset() {
    this.emit(null);
  }
  /**
   * The inherited value as the dropdown would spell it: a `select` stores enum ids like
   * `only_in_release`, and the helper should read the way the options do.
   */
  describeInherited() {
    const e = this.inherited;
    if (this.kind === "select" && e !== null && e !== void 0) {
      const t = Pi(this.selector, String(e));
      if (t !== void 0) return t;
    }
    return ki(this.kind, e);
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
          .selector=${this.kind === "boolean" ? bt : this.selector}
          .label=${this.label}
          .required=${!1}
          .value=${Si(this.kind, this.value)}
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
O.styles = [
  R,
  w`
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
U([
  h({ attribute: !1 })
], O.prototype, "hass", 2);
U([
  h()
], O.prototype, "label", 2);
U([
  h({ attribute: !1 })
], O.prototype, "selector", 2);
U([
  h({ attribute: !1 })
], O.prototype, "value", 2);
U([
  h({ attribute: !1 })
], O.prototype, "inherited", 2);
U([
  h({ attribute: "inherited-from" })
], O.prototype, "inheritedFrom", 2);
U([
  h()
], O.prototype, "kind", 2);
U([
  h()
], O.prototype, "error", 2);
O = U([
  _("al-override-field")
], O);
var Oi = Object.defineProperty, Li = Object.getOwnPropertyDescriptor, Se = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Li(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Oi(t, s, n), n;
};
const Ti = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, Mi = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, Ri = ["id", "name", "area", "mix", "null_handling", "gain"], Ii = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], Di = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], Ni = { number: { min: 0.1, step: 0.1, mode: "box" } }, Hi = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, Ui = (e, t) => [
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: Ii } } },
  ...e.mix === "mean" ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: Di } } }] : [],
  ...t ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]
];
let Z = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.computeLabel = (e) => Ti[e.name] ?? e.name, this.computeHelper = (e) => Mi[e.name] ?? "";
  }
  emitChange(e, t) {
    this.dispatchEvent(he(e, t));
  }
  emitSelect(e) {
    this.dispatchEvent(ss(e));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = oe(t, s);
    if (!i) return;
    const n = e.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      name: De(n.name),
      area: De(n.area),
      mix: n.mix ?? i.mix,
      null_handling: n.null_handling ?? i.null_handling,
      gain: typeof n.gain == "number" ? n.gain : i.gain
    }, o = Ri.find((a) => r[a] !== i[a]);
    o !== void 0 && this.emitChange(T(t, s, r), `${g(s)}:${o}`);
  }
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(T(s, [...i, e], t), `${g(i)}:${e}`);
  }
  onDelete() {
    const { config: e, path: t } = this;
    if (!e || !t) return;
    const s = oe(e, t);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(gt(e, t));
    const i = vt(t);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length === 0)
      return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = oe(e, t);
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = t.length === 2, n = Ve(this.errors, t), r = this.errors.filter((a) => a.path === g(t)), o = {
      id: s.id,
      name: s.name ?? "",
      mix: s.mix
    };
    return s.mix === "mean" && (o.null_handling = s.null_handling), s.area !== null && (o.area = s.area), i || (o.gain = s.gain), c`
      <ha-card header="Group">
        ${r.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Ui(s, i)}
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
          .selector=${Ni}
          .value=${s.max_value}
          .inherited=${e.defaults.max_value}
          .inheritedFrom=${"defaults"}
          .error=${n.max_value}
          @value-changed=${(a) => this.setField("max_value", a.detail.value)}
        ></al-override-field>
        <al-override-field
          .hass=${this.hass}
          label="Precision"
          kind="select"
          .selector=${Hi}
          .value=${s.precision === null ? null : String(s.precision)}
          .inherited=${String(e.defaults.precision)}
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
Z.styles = [
  R,
  w`
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
Se([
  h({ attribute: !1 })
], Z.prototype, "hass", 2);
Se([
  h({ attribute: !1 })
], Z.prototype, "config", 2);
Se([
  h({ attribute: !1 })
], Z.prototype, "path", 2);
Se([
  h({ attribute: !1 })
], Z.prototype, "errors", 2);
Z = Se([
  _("al-group-editor")
], Z);
function rs(e, t = 0.25) {
  if (e.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
  const s = e.attack + e.decay + e.release, i = s > 0 ? s * t / (1 - t) : 1, n = s + i;
  let r = 0;
  const o = [{ x: 0, y: 0 }];
  return r += e.attack, o.push({ x: r / n, y: 1 }), r += e.decay, o.push({ x: r / n, y: e.sustain }), r += i, o.push({ x: r / n, y: e.sustain }), r += e.release, o.push({ x: r / n, y: 0 }), o;
}
const zi = (e) => Math.round(e * 100) / 100;
function Fi(e, t = 0.25) {
  const s = rs(e, t), i = (r) => ((s[r]?.x ?? 0) + (s[r + 1]?.x ?? 0)) / 2;
  if (e.impulse) {
    const r = [{ text: "impulse", x: 0 }];
    return e.release > 0 && r.push({ text: `R ${P(e.release)}`, x: i(1) }), r;
  }
  const n = [];
  return e.attack > 0 && n.push({ text: `A ${P(e.attack)}`, x: i(0) }), e.decay > 0 && n.push({ text: `D ${P(e.decay)}`, x: i(1) }), n.push({ text: `S ${zi(e.sustain)}`, x: i(2) }), e.release > 0 && n.push({ text: `R ${P(e.release)}`, x: i(3) }), n;
}
var ji = Object.defineProperty, Bi = Object.getOwnPropertyDescriptor, os = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Bi(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && ji(t, s, n), n;
};
const xe = 10, Ne = 190, Gi = 10, re = 58, Vi = 72, Le = (e) => xe + e * (Ne - xe), Je = (e) => re - e * (re - Gi), ve = (e) => String(Math.round(e * 10) / 10), Qe = (e, t) => `${ve(e)},${ve(t)}`, qi = (e) => Math.min(Ne - 6, Math.max(xe + 6, Le(e)));
let He = class extends v {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const e = this.envelope;
    if (!e) return u;
    const t = rs(e), s = t[0], i = t[t.length - 1], n = t.map((l) => Qe(Le(l.x), Je(l.y))).join(" "), r = `${Qe(Le(s.x), re)} ${n} ${Qe(Le(i.x), re)}`, o = Fi(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${xe} y1=${re} x2=${Ne} y2=${re}></line>
        ${e.impulse ? u : k`<line
              class="grid"
              x1=${xe}
              y1=${ve(Je(e.sustain))}
              x2=${Ne}
              y2=${ve(Je(e.sustain))}
            ></line>`}
        <polygon class="area" points=${r}></polygon>
        <polyline class="curve" points=${n}></polyline>
        ${o.map(
      (l) => k`<text class="caption" x=${ve(qi(l.x))} y=${Vi} text-anchor="middle">${l.text}</text>`
    )}
      </svg>
    `;
  }
};
He.styles = [
  R,
  w`
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
os([
  h({ attribute: !1 })
], He.prototype, "envelope", 2);
He = os([
  _("al-envelope-sketch")
], He);
var Wi = Object.defineProperty, Ki = Object.getOwnPropertyDescriptor, Q = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ki(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Wi(t, s, n), n;
};
const Xi = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, Yi = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, Zi = ["entity", "gain", "key", "envelope"], Ce = { duration: { enable_millisecond: !0 } }, Ji = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Qi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, en = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, tn = "(unknown preset — using built-in defaults)", sn = [
  { name: "attack", label: "Attack", kind: "duration", selector: Ce },
  { name: "decay", label: "Decay", kind: "duration", selector: Ce },
  { name: "sustain", label: "Sustain", kind: "number", selector: Ji },
  { name: "release", label: "Release", kind: "duration", selector: Ce },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: bt },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Qi },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: en },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Ce }
];
let N = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.toText = null, this.computeLabel = (e) => Xi[e.name] ?? e.name, this.computeHelper = (e) => Yi[e.name] ?? "";
  }
  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  willUpdate(e) {
    if (e.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !e.has("config")) return;
    const { config: t, path: s } = this, i = t && s ? Oe(t, s) : void 0;
    i && fe(i.to) !== fe(Dt(this.toText)) && (this.toText = null);
  }
  emitChange(e, t) {
    this.dispatchEvent(he(e, t));
  }
  schemaFor(e) {
    const t = [
      { value: "", label: "(default preset)" },
      ...e.envelopes.map((s) => ({ value: s.id, label: s.id }))
    ];
    return [
      { name: "entity", selector: { entity: {} } },
      { name: "to", selector: { text: {} } },
      { name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } },
      { name: "key", selector: { text: {} } },
      { name: "envelope", selector: { select: { mode: "dropdown", options: t } } }
    ];
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = Oe(t, s);
    if (!i) return;
    const n = e.detail?.value ?? {}, r = String(n.to ?? "");
    this.toText = r;
    const o = {
      ...i,
      entity: String(n.entity ?? ""),
      to: Dt(r),
      gain: typeof n.gain == "number" ? n.gain : i.gain,
      key: De(n.key),
      envelope: De(n.envelope)
    }, a = fe(o.to) !== fe(i.to) ? "to" : Zi.find((l) => o[l] !== i[l]);
    a !== void 0 && this.emitChange(T(t, s, o), `${g(s)}:${a}`);
  }
  setOverride(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(T(s, [...i, e], t), `${g(i)}:${e}`);
  }
  /**
   * How long this voice stays in its current phase, measured against the payload's own
   * `now` so a browser clock that disagrees with the server does not skew the countdown.
   */
  countdown(e) {
    const t = this.live?.now;
    return e === null || t === void 0 ? null : P(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
  }
  /** Where the effective value comes from when the stimulus does not override it. */
  sourceOf(e, t, s) {
    const i = ns(e, t.envelope);
    return i ? i[s] === null || i[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : tn;
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length < 3)
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = Oe(e, t);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = oe(e, vt(t)), n = Ve(this.errors, t), r = this.errors.filter((p) => p.path === g(t)), o = lt(e, s), a = {
      entity: s.entity,
      to: this.toText ?? fe(s.to),
      gain: s.gain,
      key: s.key ?? "",
      envelope: s.envelope ?? ""
    }, l = this.live?.voices[i?.id ?? ""]?.find(
      (p) => p.label === (s.key ?? s.entity)
    ), d = this.countdown(l?.phase_ends ?? null);
    return c`
      <ha-card header="Stimulus">
        ${r.map((p) => c`<ha-alert alert-type="error">${p.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${a}
          .schema=${this.schemaFor(e)}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${l ? c`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip phase ${l.phase}">${l.phase}</span>
              <span class="chip">${l.value.toFixed(2)}</span>
              ${d !== null ? c`<span class="muted chip">ends in ${d}</span>` : u}
              <span class="dot ${l.gate ? "gated" : ""}" title=${l.gate ? "Gate open" : "Gate closed"}></span>
            </div>` : u}

        <h3>Envelope overrides</h3>
        ${sn.map(
      (p) => c`<al-override-field
            .hass=${this.hass}
            .label=${p.label}
            .kind=${p.kind}
            .selector=${p.selector}
            .value=${s[p.name]}
            .inherited=${o[p.name]}
            .inheritedFrom=${this.sourceOf(e, s, p.name)}
            .error=${n[p.name]}
            @value-changed=${(m) => this.setOverride(p.name, m.detail.value)}
          ></al-override-field>`
    )}
        <h3>Envelope shape</h3>
        <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
      </ha-card>
    `;
  }
};
N.styles = [
  R,
  w`
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
Q([
  h({ attribute: !1 })
], N.prototype, "hass", 2);
Q([
  h({ attribute: !1 })
], N.prototype, "config", 2);
Q([
  h({ attribute: !1 })
], N.prototype, "path", 2);
Q([
  h({ attribute: !1 })
], N.prototype, "errors", 2);
Q([
  h({ attribute: !1 })
], N.prototype, "live", 2);
Q([
  b()
], N.prototype, "toText", 2);
N = Q([
  _("al-stimulus-editor")
], N);
var nn = Object.defineProperty, rn = Object.getOwnPropertyDescriptor, ee = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? rn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && nn(t, s, n), n;
};
const on = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, an = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the sustain level back to zero.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, ln = ["id", "attack", "decay", "sustain", "release", "impulse"], Te = { duration: { enable_millisecond: !0 } }, cn = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, hn = { boolean: {} }, dn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, un = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, pn = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: Te },
  { name: "decay", selector: Te },
  { name: "sustain", selector: cn },
  { name: "release", selector: Te },
  { name: "impulse", selector: hn }
], mn = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: dn },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: un },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Te }
];
let H = class extends v {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (e) => on[e.name] ?? e.name, this.computeHelper = (e) => an[e.name] ?? "";
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
    this.dispatchEvent(he(e, t));
  }
  selectPreset(e) {
    this.selected = e, this.blocked = null;
  }
  addPreset() {
    const e = this.config;
    if (!e) return;
    this.blocked = null;
    const t = e.envelopes.length;
    this.emitChange(at(e, ["envelopes"], t, di(vi(e, "preset")))), this.selected = t;
  }
  removePreset(e) {
    const t = this.config;
    if (!t) return;
    const s = t.envelopes[e];
    if (!s) return;
    const i = bi(t, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(gt(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config, s = this.selected, i = t?.envelopes[s];
    if (!t || !i) return;
    const n = e.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      attack: K(n.attack) ?? i.attack,
      decay: K(n.decay) ?? i.decay,
      sustain: typeof n.sustain == "number" ? n.sustain : i.sustain,
      release: K(n.release) ?? i.release,
      impulse: typeof n.impulse == "boolean" ? n.impulse : i.impulse
    }, o = ln.find((d) => r[d] !== i[d]);
    if (o === void 0) return;
    const a = ["envelopes", s], l = T($i(t, s, r.id), a, r);
    this.emitChange(l, `${g(a)}:${o}`);
  }
  setOverride(e, t) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const n = ["envelopes", i, e];
    this.emitChange(T(s, n, t), g(n));
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
      const n = Ie(this.errors, ["envelopes", i]);
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
        ${t ? c`<ha-alert alert-type="warning">${gn(t)}</ha-alert>` : u}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(e) {
    const t = this.selected, s = e.envelopes[t];
    if (!s) return c`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", t], n = Ve(this.errors, i), r = this.errors.filter((l) => l.path === g(i)), o = {
      id: s.id,
      attack: W(s.attack),
      decay: W(s.decay),
      sustain: s.sustain,
      release: W(s.release),
      impulse: s.impulse
    }, a = fn(e, t, s);
    return c`
      <ha-card header="Envelope preset">
        ${r.map((l) => c`<ha-alert alert-type="error">${l.message}</ha-alert>`)}
        ${a ? c`<ha-alert alert-type="warning">${a}</ha-alert>` : u}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${pn}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${mn.map(
      (l) => c`<al-override-field
            .hass=${this.hass}
            .label=${l.label}
            .kind=${l.kind}
            .selector=${l.kind === "boolean" ? bt : l.selector}
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
  R,
  w`
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
ee([
  h({ attribute: !1 })
], H.prototype, "hass", 2);
ee([
  h({ attribute: !1 })
], H.prototype, "config", 2);
ee([
  h({ attribute: !1 })
], H.prototype, "errors", 2);
ee([
  h({ type: Boolean })
], H.prototype, "narrow", 2);
ee([
  b()
], H.prototype, "selected", 2);
ee([
  b()
], H.prototype, "blocked", 2);
H = ee([
  _("al-envelopes")
], H);
function fn(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((i, n) => n !== t && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function gn(e) {
  const t = [];
  return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
var vn = Object.defineProperty, bn = Object.getOwnPropertyDescriptor, qe = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? bn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && vn(t, s, n), n;
};
const $n = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, yn = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Whether a note already sounding can be retriggered, or only one in its release.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, xn = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], et = { duration: { enable_millisecond: !0 } }, wn = { number: { min: 0.1, step: 0.1, mode: "box" } }, _n = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, Sn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, En = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
};
let le = class extends v {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (e) => $n[e.name] ?? e.name, this.computeHelper = (e) => yn[e.name] ?? "";
  }
  schemaFor(e) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: e.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: wn },
      { name: "precision", selector: _n },
      { name: "unavailable", selector: En },
      { name: "retrigger", selector: Sn },
      { name: "debounce", selector: et },
      { name: "safety_refresh", selector: et },
      { name: "min_wake_interval", selector: et }
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
      debounce: K(i.debounce) ?? s.debounce,
      safety_refresh: K(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: K(i.min_wake_interval) ?? s.min_wake_interval
    }, o = xn.find((a) => r[a] !== s[a]);
    o !== void 0 && this.emitChange(T(t, ["defaults"], r), `defaults:${o}`);
  }
  emitChange(e, t) {
    this.dispatchEvent(he(e, t));
  }
  render() {
    const e = this.config;
    if (!e) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const t = e.defaults, s = Ve(this.errors, ["defaults"]), i = this.errors.filter((r) => r.path === "defaults"), n = {
      envelope: t.envelope,
      max_value: t.max_value,
      precision: String(t.precision),
      unavailable: t.unavailable,
      retrigger: t.retrigger,
      debounce: W(t.debounce),
      safety_refresh: W(t.safety_refresh),
      min_wake_interval: W(t.min_wake_interval)
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
le.styles = [
  R,
  w`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
qe([
  h({ attribute: !1 })
], le.prototype, "hass", 2);
qe([
  h({ attribute: !1 })
], le.prototype, "config", 2);
qe([
  h({ attribute: !1 })
], le.prototype, "errors", 2);
le = qe([
  _("al-defaults")
], le);
const Ue = 0.1, ze = 10, $t = Math.log10(Ue), kn = Math.log10(ze), as = kn - $t, We = (e) => Math.min(ze, Math.max(Ue, e)), yt = (e) => Math.round(e * 100) / 100, Nt = (e) => yt(We(e));
function An(e) {
  return (Math.log10(We(e)) - $t) / as;
}
function Cn(e) {
  const t = Math.min(1, Math.max(0, e));
  return yt(We(Math.pow(10, $t + t * as)));
}
function tt(e, t, s = !1) {
  const i = s ? 1.05 : 1.25;
  return yt(We(t === 1 ? e * i : e / i));
}
function Ht(e) {
  let t = e.toFixed(2).replace(/0+$/, "");
  return t.endsWith(".") && (t += "0"), t;
}
var Pn = Object.defineProperty, On = Object.getOwnPropertyDescriptor, Ee = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? On(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Pn(t, s, n), n;
};
const ct = 12, Ut = (e) => `${Math.round(e * 1e3) / 10}%`;
let J = class extends v {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.label = "Gain", this.dragValue = null, this.dragging = !1, this.onWheel = (e) => {
      this.disabled || e.deltaY === 0 || (e.preventDefault(), this.commit(tt(this.current, e.deltaY < 0 ? 1 : -1, e.shiftKey)));
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
  emit(e, t) {
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e, live: t } }));
  }
  /** A value the host should keep: ends any drag and reports it as settled. */
  commit(e) {
    this.dragging = !1, this.dragValue = null, this.emit(e, !1);
  }
  onKeyDown(e) {
    if (this.disabled) return;
    const t = this.current;
    let s;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        s = tt(t, 1, e.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        s = tt(t, -1, e.shiftKey);
        break;
      case "Home":
        s = Ue;
        break;
      case "End":
        s = ze;
        break;
      case "PageUp":
        s = Nt(t * 2);
        break;
      case "PageDown":
        s = Nt(t / 2);
        break;
      default:
        return;
    }
    e.preventDefault(), e.stopPropagation(), this.commit(s);
  }
  onDoubleClick() {
    this.disabled || this.commit(1);
  }
  /** Maps a pointer's y onto the track: its top is full gain, its bottom is silence. */
  moveTo(e, t) {
    const s = t.getBoundingClientRect();
    if (s.height <= 0) return;
    const i = Cn(1 - (e.clientY - s.top) / s.height);
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
    const e = this.current, t = An(e);
    return c`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${Ue}
        aria-valuemax=${ze}
        aria-valuenow=${e}
        aria-valuetext=${Ht(e)}
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
          <div class="fill" style="height: ${Ut(t)}"></div>
          <div class="knob" style="bottom: calc(${Ut(t)} - ${Math.round((t - 0.5) * ct * 10) / 10}px - ${ct / 2}px)"></div>
        </div>
        <div class="value">${Ht(e)}</div>
      </div>
    `;
  }
};
J.styles = w`
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
      height: ${ct}px;
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
Ee([
  h({ type: Number })
], J.prototype, "value", 2);
Ee([
  h({ type: Boolean, reflect: !0 })
], J.prototype, "disabled", 2);
Ee([
  h({ type: String })
], J.prototype, "label", 2);
Ee([
  b()
], J.prototype, "dragValue", 2);
J = Ee([
  _("al-fader")
], J);
const Ln = { ATTRIBUTE: 1 }, Tn = (e) => (...t) => ({ _$litDirective$: e, values: t });
class Mn {
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
const zt = Tn(class extends Mn {
  constructor(e) {
    if (super(e), e.type !== Ln.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
    return Y;
  }
});
var Rn = Object.defineProperty, In = Object.getOwnPropertyDescriptor, Ke = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? In(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Rn(t, s, n), n;
};
const Dn = (e) => `${Math.round(e * 1e3) / 10}%`;
let ce = class extends v {
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
        <div class=${zt({ fill: !0, hot: e > 0.9 })} style="width: ${Dn(e)}"></div>
      </div>
      <div class=${zt({ dot: !0, gated: this.gated })}></div>
    `;
  }
};
ce.styles = w`
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
Ke([
  h({ type: Number })
], ce.prototype, "value", 2);
Ke([
  h({ type: Number })
], ce.prototype, "max", 2);
Ke([
  h({ type: Boolean })
], ce.prototype, "gated", 2);
ce = Ke([
  _("al-meter")
], ce);
var Nn = Object.defineProperty, Hn = Object.getOwnPropertyDescriptor, I = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Hn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Nn(t, s, n), n;
};
const Un = (e) => String(Math.round(e * 100) / 100);
function Ft(e) {
  return e.impulse ? `impulse · R ${P(e.release)}` : `A ${P(e.attack)} · D ${P(e.decay)} · S ${Un(e.sustain)} · R ${P(e.release)}`;
}
let A = class extends v {
  constructor() {
    super(...arguments), this.kind = "channel", this.label = "", this.sublabel = null, this.envelope = null, this.gain = 1, this.live = null, this.selected = !1, this.errors = 0, this.entityIcon = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.hasAttribute("tabindex") || (this.tabIndex = -1);
  }
  select() {
    this.dispatchEvent(si());
  }
  /** Drilling into a bus is its own intent: it must not also read as selecting the strip. */
  open(e) {
    e.stopPropagation(), this.dispatchEvent(ii());
  }
  onGain(e) {
    e.stopPropagation(), this.dispatchEvent(ni(e.detail));
  }
  render() {
    const e = this.envelope;
    return c`
      <div class="strip" @click=${this.select}>
        <div class="head">
          ${this.entityIcon ? c`<ha-icon class="icon" .icon=${this.entityIcon}></ha-icon>` : c`<span class="icon">${this.kind === "bus" ? "▤" : "⚡"}</span>`}
          <button class="link name" title=${this.label}>${this.label}</button>
        </div>
        <div class="sub" title=${this.sublabel ?? ""}>${this.sublabel ?? ""}</div>
        ${e ? c`<al-envelope-sketch .envelope=${e}></al-envelope-sketch>` : u}
        <div class="adsr" title=${e ? Ft(e) : ""}>${e ? Ft(e) : ""}</div>
        <al-fader .value=${this.gain} label=${`${this.label} gain`} @value-changed=${this.onGain}></al-fader>
        ${this.live ? c`<al-meter .value=${this.live.value} .max=${this.live.max} .gated=${this.live.gated}></al-meter>` : u}
        <div class="foot">
          ${this.errors > 0 ? c`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : u}
          ${this.kind === "bus" ? c`<button class="link open" @click=${this.open}>open ▸</button>` : u}
        </div>
      </div>
    `;
  }
};
A.styles = w`
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
I([
  h({ type: String, reflect: !0 })
], A.prototype, "kind", 2);
I([
  h({ type: String })
], A.prototype, "label", 2);
I([
  h({ type: String })
], A.prototype, "sublabel", 2);
I([
  h({ attribute: !1 })
], A.prototype, "envelope", 2);
I([
  h({ type: Number })
], A.prototype, "gain", 2);
I([
  h({ attribute: !1 })
], A.prototype, "live", 2);
I([
  h({ type: Boolean, reflect: !0 })
], A.prototype, "selected", 2);
I([
  h({ type: Number })
], A.prototype, "errors", 2);
I([
  h({ type: String })
], A.prototype, "entityIcon", 2);
A = I([
  _("al-strip")
], A);
var zn = Object.defineProperty, Fn = Object.getOwnPropertyDescriptor, D = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Fn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && zn(t, s, n), n;
};
const jn = ["sum", "max", "mean"], jt = (e) => e.stopPropagation(), Bt = 0.1;
let C = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.mix = "sum", this.maxValue = 5, this.precision = 1, this.live = null, this.lights = 0, this.simEntityId = null, this.simOn = !1, this.blockedReason = null;
  }
  onMix(e) {
    this.dispatchEvent(ri(e.target.value));
  }
  /**
   * `min` on a number input is advice to the browser, not a guarantee to us: it does not stop
   * a typed or pasted `0`, and `.value` reads back whatever is in the box. So the floor is
   * enforced here, and a rejected entry — empty, unreadable, or below the floor — puts the
   * committed ceiling back in the box rather than leaving a value we refused on screen.
   */
  onLimiter(e) {
    const t = e.target, s = t.value.trim(), i = Number(s);
    if (s === "" || !Number.isFinite(i) || i < Bt) {
      t.value = String(this.maxValue);
      return;
    }
    this.dispatchEvent(oi(i));
  }
  onSim(e) {
    this.dispatchEvent(ai(e.target.checked === !0));
  }
  render() {
    const e = this.blockedReason;
    return c`
      <div class="strip">
        <div class="name" title=${this.label}>${this.label}</div>
        <div class="muted">master</div>
        <div>
          <label for="mix">mix</label>
          <select id="mix" class="mix" .value=${this.mix} @change=${this.onMix} @keydown=${jt}>
            ${jn.map((t) => c`<option value=${t} ?selected=${t === this.mix}>${t}</option>`)}
          </select>
        </div>
        <div>
          <label for="limiter">limiter</label>
          <input
            id="limiter"
            class="limiter"
            type="number"
            min=${Bt}
            step="0.1"
            .value=${String(this.maxValue)}
            @change=${this.onLimiter}
            @keydown=${jt}
          />
        </div>
        <div class="muted">${this.precision} dp · ${this.lights} light${this.lights === 1 ? "" : "s"}</div>
        ${this.lights > 0 ? c`<div class="sim">
              <ha-switch
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
C.styles = w`
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
], C.prototype, "label", 2);
D([
  h({ type: String })
], C.prototype, "mix", 2);
D([
  h({ type: Number })
], C.prototype, "maxValue", 2);
D([
  h({ type: Number })
], C.prototype, "precision", 2);
D([
  h({ attribute: !1 })
], C.prototype, "live", 2);
D([
  h({ type: Number })
], C.prototype, "lights", 2);
D([
  h({ type: String })
], C.prototype, "simEntityId", 2);
D([
  h({ type: Boolean })
], C.prototype, "simOn", 2);
D([
  h({ type: String })
], C.prototype, "blockedReason", 2);
C = D([
  _("al-master-strip")
], C);
function Bn(e, t) {
  const s = _e(e, t);
  if (!s) return [];
  const i = [];
  return s.stimuli.forEach((n, r) => i.push([...t, "stimuli", r])), s.children.forEach((n, r) => i.push([...t, "children", r])), i;
}
function Gn(e, t) {
  const s = [];
  for (let i = 2; i <= t.length; i += 2) {
    const n = t.slice(0, i), r = _e(e, n);
    if (!r) break;
    s.push({ path: n, label: r.name ?? r.id });
  }
  return s;
}
var Vn = Object.defineProperty, qn = Object.getOwnPropertyDescriptor, B = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? qn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Vn(t, s, n), n;
};
const Wn = (e) => `switch.${e}_presence_simulation`, Kn = (e) => {
  const t = e.composedPath()[0];
  return t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t instanceof HTMLTextAreaElement || t instanceof HTMLElement && t.isContentEditable;
}, Gt = (e) => e[e.length - 2] === "children";
let M = class extends v {
  constructor() {
    super(...arguments), this.nav = { busPath: [], selection: null }, this.errors = [], this.live = null, this.simState = {}, this.narrow = !1, this.pendingFocus = !1;
  }
  get bus() {
    return this.config ? oe(this.config, this.nav.busPath) : void 0;
  }
  get channels() {
    return this.config ? Bn(this.config, this.nav.busPath) : [];
  }
  isSelected(e) {
    return this.nav.selection !== null && g(this.nav.selection) === g(e);
  }
  /** The ceiling a channel's meter is drawn against: the bus it mixes into, not its own. */
  busCeiling(e) {
    return this.live?.groups[e.id]?.max_value ?? e.max_value ?? this.config?.defaults.max_value ?? 5;
  }
  navigate(e) {
    this.pendingFocus = !0, this.dispatchEvent(Ze(e));
  }
  emitChange(e, t) {
    this.dispatchEvent(he(e, t));
  }
  /** Which strip an event came from: strips are identical, so the row index is the key. */
  pathOf(e) {
    const t = e.target?.dataset?.index;
    return t === void 0 ? null : this.channels[Number(t)] ?? null;
  }
  onStripSelect(e) {
    const t = this.pathOf(e);
    t && this.dispatchEvent(Ze({ type: "select", path: t }));
  }
  onStripOpen(e) {
    const t = this.pathOf(e);
    t && this.navigate({ type: "open", path: t });
  }
  /**
   * Both the live moves of a drag and the value it settles on are reported: the coalesce
   * key folds the flood into one undo step, and reporting the moves is what lets the
   * meters and the timeline follow the fader while it is still under the pointer.
   */
  onStripGain(e) {
    const t = this.pathOf(e), s = this.config;
    if (!t || !s) return;
    const { value: i } = e.detail;
    this.emitChange(T(s, [...t, "gain"], i), `${g(t)}:gain`);
  }
  onMasterSelect() {
    this.dispatchEvent(Ze({ type: "select", path: this.nav.busPath }));
  }
  onMix(e) {
    const t = this.config;
    if (!t) return;
    const { mix: s } = e.detail;
    this.emitChange(T(t, [...this.nav.busPath, "mix"], s));
  }
  onLimiter(e) {
    const t = this.config;
    if (!t) return;
    const { value: s } = e.detail;
    this.emitChange(T(t, [...this.nav.busPath, "max_value"], s), `${g(this.nav.busPath)}:limiter`);
  }
  onSim(e) {
    const t = this.bus;
    if (!t) return;
    const { on: s } = e.detail;
    this.dispatchEvent(ci(t.id, s));
  }
  /** Console keys: ←/→ walk the row, Enter drills into a bus, Backspace comes back up. */
  onKeyDown(e) {
    const t = this.config;
    if (!(!t || Kn(e)))
      switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft":
          e.preventDefault(), this.navigate({ type: "arrow", delta: e.key === "ArrowRight" ? 1 : -1, config: t });
          break;
        case "Enter": {
          const s = this.nav.selection;
          if (!s || !Gt(s) || !this.channels.some((i) => g(i) === g(s)))
            return;
          e.preventDefault(), this.navigate({ type: "open", path: s });
          break;
        }
        case "Backspace":
          e.preventDefault(), this.nav.busPath.length >= 4 && this.navigate({ type: "up" });
          break;
        case "Home":
        case "End": {
          e.preventDefault();
          const s = this.channels[0] ?? this.nav.busPath;
          this.navigate({ type: "select", path: e.key === "Home" ? s : this.nav.busPath });
          break;
        }
      }
  }
  updated(e) {
    !this.pendingFocus || !e.has("nav") || (this.pendingFocus = !1, this.focusSelected());
  }
  /** Keeps focus on the one strip in the tab order after the row has been re-rendered. */
  async focusSelected() {
    await this.updateComplete, this.shadowRoot?.querySelector('.strips > [tabindex="0"]')?.focus();
  }
  renderCrumbs(e) {
    const t = Gn(e, this.nav.busPath);
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
        ${t.map(
      (s, i) => c`
            ${i > 0 ? c`<span class="sep">›</span>` : u}
            <button class="link crumb" @click=${() => this.navigate({ type: "open", path: s.path })}>
              ${s.label}
            </button>
          `
    )}
      </div>
    `;
  }
  renderChannel(e, t, s, i) {
    const n = this.isSelected(s), r = {
      index: i,
      selected: n,
      errors: Ie(this.errors, s),
      tabindex: n ? 0 : -1
    };
    return Gt(s) ? this.renderBusChannel(e, t, s, r) : this.renderStimulusChannel(e, t, s, r);
  }
  renderBusChannel(e, t, s, i) {
    const n = oe(e, s);
    if (!n) return c``;
    const r = this.live?.groups[n.id], o = r ? { value: r.value, max: this.busCeiling(t), gated: r.gated } : null;
    return c`
      <al-strip
        kind="bus"
        data-index=${i.index}
        tabindex=${i.tabindex}
        ?narrow=${this.narrow}
        .label=${n.name ?? n.id}
        .sublabel=${`bus · ${n.stimuli.length + n.children.length}`}
        .envelope=${lt(e, {})}
        .gain=${n.gain}
        .live=${o}
        .selected=${i.selected}
        .errors=${i.errors}
      ></al-strip>
    `;
  }
  renderStimulusChannel(e, t, s, i) {
    const n = Oe(e, s);
    if (!n) return c``;
    const r = this.hass?.states[n.entity], o = this.live?.voices[t.id]?.find((l) => l.label === (n.key ?? n.entity)), a = o ? { value: o.value, max: this.busCeiling(t), gated: o.gate } : null;
    return c`
      <al-strip
        kind="channel"
        data-index=${i.index}
        tabindex=${i.tabindex}
        ?narrow=${this.narrow}
        .label=${r?.attributes.friendly_name ?? n.entity}
        .sublabel=${r?.state ?? "unknown"}
        .envelope=${lt(e, n)}
        .gain=${n.gain}
        .live=${a}
        .selected=${i.selected}
        .errors=${i.errors}
        .entityIcon=${r?.attributes.icon ?? null}
      ></al-strip>
    `;
  }
  renderMaster(e, t) {
    const s = this.live?.groups[t.id], i = s ? { value: s.value, max: s.max_value, gated: s.gated } : null, n = Wn(t.id), r = this.isSelected(this.nav.busPath);
    return c`
      <al-master-strip
        tabindex=${r ? 0 : -1}
        ?selected=${r}
        ?narrow=${this.narrow}
        .label=${(t.name ?? t.id).toUpperCase()}
        .mix=${t.mix}
        .maxValue=${t.max_value ?? e.defaults.max_value}
        .precision=${t.precision ?? e.defaults.precision}
        .live=${i}
        .lights=${s?.lights ?? 0}
        .simEntityId=${n}
        .simOn=${this.hass?.states[n]?.state === "on"}
        .blockedReason=${this.simState[t.id]?.blocked ?? null}
        @click=${this.onMasterSelect}
      ></al-master-strip>
    `;
  }
  render() {
    const e = this.config, t = this.bus;
    return !e || !t ? c`<div class="empty muted">No bus to mix: add a group first.</div>` : c`
      ${this.renderCrumbs(e)}
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
        ${this.channels.map((s, i) => this.renderChannel(e, t, s, i))}${this.renderMaster(e, t)}
      </div>
    `;
  }
};
M.styles = [
  R,
  w`
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
B([
  h({ attribute: !1 })
], M.prototype, "hass", 2);
B([
  h({ attribute: !1 })
], M.prototype, "config", 2);
B([
  h({ attribute: !1 })
], M.prototype, "nav", 2);
B([
  h({ attribute: !1 })
], M.prototype, "errors", 2);
B([
  h({ attribute: !1 })
], M.prototype, "live", 2);
B([
  h({ attribute: !1 })
], M.prototype, "simState", 2);
B([
  h({ type: Boolean, reflect: !0 })
], M.prototype, "narrow", 2);
M = B([
  _("al-mixer")
], M);
const Xn = {
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
}, Yn = {
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400
};
function Zn(e, t, s) {
  return {
    start: e - Xn[t],
    end: e,
    resolution: t === "24h" ? "5m" : "1h",
    forecastUntil: s === "off" ? void 0 : e + Yn[s]
  };
}
function Jn(e, t, s) {
  const i = t - e || 1;
  return (n) => (n - e) / i * s;
}
function Qn(e, t, s = 4) {
  const i = e || 1, n = t - 2 * s;
  return (r) => t - s - r / i * n;
}
function Fe(e, t) {
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
function Vt(e, t, s) {
  return e.length === 0 ? "" : e.map(([i, n], r) => `${r === 0 ? "M" : "L"}${t(i)},${s(n)}`).join(" ");
}
function er(e, t, s, i = 1 / 0) {
  if (e.p75.length === 0) return "";
  const n = (l) => l.map((d, p) => [e.t0 + p * e.step, d]), r = Fe(n(e.p75), i), o = Fe(n(e.p25), i).reverse();
  return `${[...r, ...o].map(([l, d], p) => `${p === 0 ? "M" : "L"}${t(l)},${s(d)}`).join(" ")} Z`;
}
function tr(e, t) {
  return e[t].map((s, i) => [e.t0 + i * e.step, s]);
}
function st(e, t, s) {
  return e.map(([i, n, r]) => ({ x0: t(i), x1: t(n ?? s), tag: r }));
}
function qt(e, t) {
  if (e.length === 0) return -1;
  let s = 0, i = e.length - 1;
  for (; s < i; ) {
    const n = s + i >> 1;
    e[n][0] < t ? s = n + 1 : i = n;
  }
  return s > 0 && Math.abs(e[s - 1][0] - t) <= Math.abs(e[s][0] - t) ? s - 1 : s;
}
function sr(e) {
  return [e.group_id, e.start, e.end, e.resolution, e.include_children ?? !1, e.forecast_until ?? ""].join("|");
}
var ir = Object.defineProperty, nr = Object.getOwnPropertyDescriptor, x = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? nr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && ir(t, s, n), n;
};
const ne = 32, rr = 28, or = 4, Wt = 8, ar = 800, lr = 220, cr = 160, it = 2e3, hr = 6e4, ls = 6e4, dr = 32, ur = ["24h", "7d", "30d"], pr = ["off", "24h", "7d"], Kt = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], mr = (e) => `hsl(${e * 67 % 360} 55% 62%)`, z = /* @__PURE__ */ new Map(), nt = /* @__PURE__ */ new Map();
function fr(e, t) {
  const s = Date.now();
  for (const [i, n] of z) s - n.at >= ls && z.delete(i);
  z.delete(e), z.set(e, { at: s, data: t });
  for (const i of z.keys()) {
    if (z.size <= dr) break;
    z.delete(i);
  }
}
const gr = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", vr = (e, t) => {
  const s = new Date(e * 1e3);
  return t <= 2 * 86400 ? s.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : s.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}, rt = (e) => String(Math.round(e * 100) / 100), ot = (e, t, s) => Math.min(s, Math.max(t, e));
function br(e, t, s, i) {
  const n = Math.max(1, i.width - ne), r = Math.max(1, i.height - rr), o = s.start, a = Math.max(s.until, s.end), l = Jn(o, a, n), d = Qn(i.maxValue, r), p = Object.keys(e.series), m = p.includes(t) ? t : p[0] ?? t, E = (f, G) => {
    const se = Fe(e.series[f] ?? [], it);
    return { id: f, points: se, d: Vt(se, l, d), color: G };
  }, L = E(m, "var(--primary-color)"), te = i.showChannels ? p.filter((f) => f !== m).map((f, G) => E(f, mr(G))) : [], ke = e.forecast, cs = ke ? gr(er(ke, l, d, it)) : "", hs = ke ? Vt(Fe(tr(ke, "p50"), it), l, d) : "", Ae = [];
  for (const [, , f] of e.day_types) Ae.includes(f) || Ae.push(f);
  const xt = (f) => Kt[Ae.indexOf(f) % Kt.length], ds = st(
    e.day_types.map(([f, G, se]) => [f, G, se]),
    l,
    a
  ).map((f) => ({ ...f, fill: xt(f.tag) })), us = st(
    Object.entries(e.lights).flatMap(
      ([f, G]) => G.map(([se, ms]) => [se, ms, f])
    ),
    l,
    a
  ), ps = st(e.plan, l, a);
  return {
    busId: m,
    bus: L,
    children: te,
    band: cs,
    p50: hs,
    dayTypes: ds,
    legend: Ae.map((f) => ({ tag: f, fill: xt(f) })),
    lights: us,
    plan: ps,
    x: l,
    y: d,
    t0: o,
    t1: a,
    plotW: n,
    plotH: r
  };
}
let $ = class extends v {
  constructor() {
    super(...arguments), this.groupId = null, this.title = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.narrow = !1, this.cursorIndex = null, this.width = ar, this.loaded = null, this.error = null, this.seq = 0, this.memo = null;
  }
  get height() {
    return this.narrow ? cr : lr;
  }
  connectedCallback() {
    super.connectedCallback(), typeof ResizeObserver < "u" && (this.observer = new ResizeObserver((e) => {
      const t = e[0]?.contentRect.width ?? 0;
      t > 0 && (this.width = t);
    }), this.observer.observe(this)), this.timer = setInterval(() => {
      this.load();
    }, hr), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.observer?.disconnect(), this.observer = void 0, this.timer !== void 0 && clearInterval(this.timer), this.timer = void 0;
  }
  willUpdate(e) {
    const t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), s = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
    (t || s) && (e.has("groupId") && (this.cursorIndex = null), this.load());
  }
  query(e) {
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = Zn(t, this.range, this.horizon);
    return {
      group_id: e,
      start: s.start,
      end: s.end,
      resolution: s.resolution,
      include_children: this.showChannels,
      ...s.forecastUntil !== void 0 ? { forecast_until: s.forecastUntil } : {}
    };
  }
  async load() {
    const e = this.hass, t = this.groupId;
    if (!e || t === null) return;
    const s = this.query(t), i = sr(s), n = z.get(i);
    if (n && Date.now() - n.at < ls) {
      this.seq++, this.loaded = { q: s, data: n.data }, this.error = null;
      return;
    }
    let r = nt.get(i);
    r || (r = js(e, s), nt.set(i, r), r.then(
      (a) => fr(i, a),
      () => {
      }
    ).finally(() => nt.delete(i)));
    const o = ++this.seq;
    try {
      const a = await r;
      if (o !== this.seq) return;
      this.loaded = { q: s, data: a }, this.error = null;
    } catch (a) {
      if (o !== this.seq) return;
      this.error = a.message || String(a);
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
    const i = br(
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
    return ot(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
  }
  emitSettings() {
    this.dispatchEvent(
      li({
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
    const i = e.currentTarget.getBoundingClientRect(), n = i.width > 0 ? this.width / i.width : 1, r = (e.clientX - i.left) * n - ne, o = ot(r / t.plotW, 0, 1);
    return t.t0 + o * (t.t1 - t.t0);
  }
  onMove(e) {
    const t = this.paths;
    !t || t.bus.points.length === 0 || (this.cursorIndex = qt(t.bus.points, this.timeAt(e, t)));
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
    this.cursorIndex = this.cursorIndex === null ? i > 0 ? 0 : s : ot(this.cursorIndex + i, 0, s);
  }
  renderChips() {
    return c`
      <div class="toolbar">
        <span class="title">${this.title}</span>
        <div class="chips" role="group" aria-label="History range">
          ${ur.map(
      (e) => c`
              <button
                class="chip range"
                data-range=${e}
                aria-pressed=${this.range === e ? "true" : "false"}
                @click=${() => this.setRange(e)}
              >
                ${e}
              </button>
            `
    )}
        </div>
        <div class="chips" role="group" aria-label="Forecast horizon">
          ${pr.map(
      (e) => c`
              <button
                class="chip horizon"
                data-horizon=${e}
                aria-pressed=${this.horizon === e ? "true" : "false"}
                @click=${() => this.setHorizon(e)}
              >
                ${e}
              </button>
            `
    )}
        </div>
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
    const t = this.width, s = this.height, i = e.x(this.nowAt(e)), n = e.plotH + or, r = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), o = `${this.title} activity, ${this.range} history, ${this.horizon} forecast`;
    return c`
      <svg
        class="chart"
        viewBox="0 0 ${t} ${s}"
        role="img"
        tabindex="0"
        aria-label=${o}
        @mousemove=${this.onMove}
        @mouseleave=${this.onLeave}
        @keydown=${this.onKeyDown}
      >
        ${[1, 0.5, 0].map(
      (a) => k`
            <line class="grid" x1=${ne} y1=${e.y(this.maxValue * a)} x2=${t} y2=${e.y(this.maxValue * a)}></line>
            <text class="ytick" x=${ne - 4} y=${e.y(this.maxValue * a) + 3} text-anchor="end">
              ${rt(this.maxValue * a)}
            </text>
          `
    )}
        <g transform="translate(${ne},0)">
          ${e.dayTypes.map(
      (a) => k`<rect
              class="daytype"
              x=${a.x0}
              y="0"
              width=${Math.max(0, a.x1 - a.x0)}
              height=${e.plotH}
              fill=${a.fill}
            ></rect>`
    )}
          ${e.band ? k`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? k`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((a) => k`<path class="child" d=${a.d} stroke=${a.color}></path>`)}
          ${e.bus.d ? k`<path class="bus" d=${e.bus.d}></path>` : u}
          ${this.showLights ? e.lights.map(
      (a) => k`<rect
                  class="light"
                  x=${a.x0}
                  y=${n}
                  width=${Math.max(1, a.x1 - a.x0)}
                  height=${Wt}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`
    ) : u}
          ${this.showLights ? e.plan.map(
      (a) => k`<rect
                  class="plan"
                  x=${a.x0}
                  y=${n}
                  width=${Math.max(1, a.x1 - a.x0)}
                  height=${Wt}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`
    ) : u}
          <line class="now" x1=${i} y1="0" x2=${i} y2=${e.plotH}></line>
          <text class="now-label" x=${i + 3} y="10">now</text>
          ${r === null ? u : k`<line class="cursor" x1=${r} y1="0" x2=${r} y2=${e.plotH}></line>`}
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
      ([i, n]) => k`<text class="xlabel" x=${i * e.plotW} y=${t} text-anchor=${n}>
        ${vr(e.t0 + i * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`
    );
  }
  renderTooltip(e) {
    const t = this.cursorIndex;
    if (t === null) return u;
    const s = e.bus.points[t];
    if (!s) return u;
    const [i, n] = s, o = (ne + e.x(i)) / this.width * 100, a = this.loaded?.data.day_types.find(([l, d]) => i >= l && i < d)?.[2];
    return c`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${new Date(i * 1e3).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.title || e.busId}</span>
          <span class="tt-value">${rt(n)}</span>
        </div>
        ${e.children.map((l) => {
      const d = qt(l.points, i), p = l.points[d];
      return p ? c`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${l.color}"></span>
                  <span class="tt-name">${l.id}</span>
                  <span class="tt-value">${rt(p[1])}</span>
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
$.styles = [
  R,
  w`
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
      path.bus {
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
x([
  h({ attribute: !1 })
], $.prototype, "hass", 2);
x([
  h({ attribute: !1 })
], $.prototype, "groupId", 2);
x([
  h({ attribute: !1 })
], $.prototype, "title", 2);
x([
  h({ attribute: !1 })
], $.prototype, "range", 2);
x([
  h({ attribute: !1 })
], $.prototype, "horizon", 2);
x([
  h({ type: Boolean })
], $.prototype, "showChannels", 2);
x([
  h({ type: Boolean })
], $.prototype, "showLights", 2);
x([
  h({ attribute: !1 })
], $.prototype, "live", 2);
x([
  h({ type: Number })
], $.prototype, "maxValue", 2);
x([
  h({ type: Boolean, reflect: !0 })
], $.prototype, "narrow", 2);
x([
  b()
], $.prototype, "cursorIndex", 2);
x([
  b()
], $.prototype, "width", 2);
x([
  b()
], $.prototype, "loaded", 2);
x([
  b()
], $.prototype, "error", 2);
$ = x([
  _("al-timeline")
], $);
