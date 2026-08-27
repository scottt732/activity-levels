const Ie = globalThis, mt = Ie.ShadowRoot && (Ie.ShadyCSS === void 0 || Ie.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, gt = /* @__PURE__ */ Symbol(), Pt = /* @__PURE__ */ new WeakMap();
let ds = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== gt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (mt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = Pt.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Pt.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ni = (e) => new ds(typeof e == "string" ? e : e + "", void 0, gt), _ = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + e[r + 1], e[0]);
  return new ds(s, e, gt);
}, ri = (e, t) => {
  if (mt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), n = Ie.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, e.appendChild(i);
  }
}, Ct = mt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return ni(s);
})(e) : e;
const { is: oi, defineProperty: ai, getOwnPropertyDescriptor: li, getOwnPropertyNames: ci, getOwnPropertySymbols: hi, getPrototypeOf: di } = Object, qe = globalThis, Lt = qe.trustedTypes, ui = Lt ? Lt.emptyScript : "", pi = qe.reactiveElementPolyfillSupport, _e = (e, t) => e, Ue = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? ui : null;
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
} }, vt = (e, t) => !oi(e, t), Ot = { attribute: !0, type: String, converter: Ue, reflect: !1, useDefault: !1, hasChanged: vt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), qe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let de = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = Ot) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(t, i, s);
      n !== void 0 && ai(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: n, set: r } = li(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Ot;
  }
  static _$Ei() {
    if (this.hasOwnProperty(_e("elementProperties"))) return;
    const t = di(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(_e("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(_e("properties"))) {
      const s = this.properties, i = [...ci(s), ...hi(s)];
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
      for (const n of i) s.unshift(Ct(n));
    } else t !== void 0 && s.push(Ct(t));
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
    return ri(t, this.constructor.elementStyles), t;
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
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : Ue).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Ue;
      this._$Em = n;
      const a = o.fromAttribute(s, r.type);
      this[n] = a ?? this._$Ej?.get(n) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, n = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? vt)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
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
de.elementStyles = [], de.shadowRootOptions = { mode: "open" }, de[_e("elementProperties")] = /* @__PURE__ */ new Map(), de[_e("finalized")] = /* @__PURE__ */ new Map(), pi?.({ ReactiveElement: de }), (qe.reactiveElementVersions ??= []).push("2.1.2");
const bt = globalThis, Tt = (e) => e, He = bt.trustedTypes, Mt = He ? He.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, us = "$lit$", B = `lit$${Math.random().toFixed(9).slice(2)}$`, ps = "?" + B, fi = `<${ps}>`, te = document, ke = () => te.createComment(""), Ee = (e) => e === null || typeof e != "object" && typeof e != "function", $t = Array.isArray, mi = (e) => $t(e) || typeof e?.[Symbol.iterator] == "function", tt = `[ 	
\f\r]`, we = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Rt = /-->/g, It = />/g, Y = RegExp(`>|${tt}(?:([^\\s"'>=/]+)(${tt}*=${tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Dt = /'/g, Nt = /"/g, fs = /^(?:script|style|textarea|title)$/i, ms = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), l = ms(1), P = ms(2), se = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), Ut = /* @__PURE__ */ new WeakMap(), Z = te.createTreeWalker(te, 129);
function gs(e, t) {
  if (!$t(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Mt !== void 0 ? Mt.createHTML(t) : t;
}
const gi = (e, t) => {
  const s = e.length - 1, i = [];
  let n, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = we;
  for (let a = 0; a < s; a++) {
    const c = e[a];
    let u, p, f = -1, A = 0;
    for (; A < c.length && (o.lastIndex = A, p = o.exec(c), p !== null); ) A = o.lastIndex, o === we ? p[1] === "!--" ? o = Rt : p[1] !== void 0 ? o = It : p[2] !== void 0 ? (fs.test(p[2]) && (n = RegExp("</" + p[2], "g")), o = Y) : p[3] !== void 0 && (o = Y) : o === Y ? p[0] === ">" ? (o = n ?? we, f = -1) : p[1] === void 0 ? f = -2 : (f = o.lastIndex - p[2].length, u = p[1], o = p[3] === void 0 ? Y : p[3] === '"' ? Nt : Dt) : o === Nt || o === Dt ? o = Y : o === Rt || o === It ? o = we : (o = Y, n = void 0);
    const I = o === Y && e[a + 1].startsWith("/>") ? " " : "";
    r += o === we ? c + fi : f >= 0 ? (i.push(u), c.slice(0, f) + us + c.slice(f) + B + I) : c + B + (f === -2 ? a : I);
  }
  return [gs(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Ae {
  constructor({ strings: t, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, c = this.parts, [u, p] = gi(t, s);
    if (this.el = Ae.createElement(u, i), Z.currentNode = this.el.content, s === 2 || s === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (n = Z.nextNode()) !== null && c.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const f of n.getAttributeNames()) if (f.endsWith(us)) {
          const A = p[o++], I = n.getAttribute(f).split(B), le = /([.?@])?(.*)/.exec(A);
          c.push({ type: 1, index: r, name: le[2], strings: I, ctor: le[1] === "." ? bi : le[1] === "?" ? $i : le[1] === "@" ? yi : Ke }), n.removeAttribute(f);
        } else f.startsWith(B) && (c.push({ type: 6, index: r }), n.removeAttribute(f));
        if (fs.test(n.tagName)) {
          const f = n.textContent.split(B), A = f.length - 1;
          if (A > 0) {
            n.textContent = He ? He.emptyScript : "";
            for (let I = 0; I < A; I++) n.append(f[I], ke()), Z.nextNode(), c.push({ type: 2, index: ++r });
            n.append(f[A], ke());
          }
        }
      } else if (n.nodeType === 8) if (n.data === ps) c.push({ type: 2, index: r });
      else {
        let f = -1;
        for (; (f = n.data.indexOf(B, f + 1)) !== -1; ) c.push({ type: 7, index: r }), f += B.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const i = te.createElement("template");
    return i.innerHTML = t, i;
  }
}
function fe(e, t, s = e, i) {
  if (t === se) return t;
  let n = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = Ee(t) ? void 0 : t._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(e), n._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = n : s._$Cl = n), n !== void 0 && (t = fe(e, n._$AS(e, t.values), n, i)), t;
}
class vi {
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
    const { el: { content: s }, parts: i } = this._$AD, n = (t?.creationScope ?? te).importNode(s, !0);
    Z.currentNode = n;
    let r = Z.nextNode(), o = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let u;
        c.type === 2 ? u = new Le(r, r.nextSibling, this, t) : c.type === 1 ? u = new c.ctor(r, c.name, c.strings, this, t) : c.type === 6 && (u = new xi(r, this, t)), this._$AV.push(u), c = i[++a];
      }
      o !== c?.index && (r = Z.nextNode(), o++);
    }
    return Z.currentNode = te, n;
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
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = n, this._$Cv = n?.isConnected ?? !0;
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
    t = fe(this, t, s), Ee(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== se && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : mi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && Ee(this._$AH) ? this._$AA.nextSibling.data = t : this.T(te.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Ae.createElement(gs(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(s);
    else {
      const r = new vi(n, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = Ut.get(t.strings);
    return s === void 0 && Ut.set(t.strings, s = new Ae(t)), s;
  }
  k(t) {
    $t(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const r of t) n === s.length ? s.push(i = new Le(this.O(ke()), this.O(ke()), this, this.options)) : i = s[n], i._$AI(r), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = Tt(t).nextSibling;
      Tt(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Ke {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, n, r) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = s, this._$AM = n, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(t, s = this, i, n) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = fe(this, t, s, 0), o = !Ee(t) || t !== this._$AH && t !== se, o && (this._$AH = t);
    else {
      const a = t;
      let c, u;
      for (t = r[0], c = 0; c < r.length - 1; c++) u = fe(this, a[i + c], s, c), u === se && (u = this._$AH[c]), o ||= !Ee(u) || u !== this._$AH[c], u === d ? t = d : t !== d && (t += (u ?? "") + r[c + 1]), this._$AH[c] = u;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class bi extends Ke {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class $i extends Ke {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class yi extends Ke {
  constructor(t, s, i, n, r) {
    super(t, s, i, n, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = fe(this, t, s, 0) ?? d) === se) return;
    const i = this._$AH, n = t === d && i !== d || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== d && (i === d || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class xi {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    fe(this, t);
  }
}
const wi = bt.litHtmlPolyfillSupport;
wi?.(Ae, Le), (bt.litHtmlVersions ??= []).push("3.3.3");
const _i = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = n = new Le(t.insertBefore(ke(), r), r, void 0, s ?? {});
  }
  return n._$AI(e), n;
};
const yt = globalThis;
let b = class extends de {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = _i(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return se;
  }
};
b._$litElement$ = !0, b.finalized = !0, yt.litElementHydrateSupport?.({ LitElement: b });
const Si = yt.litElementPolyfillSupport;
Si?.({ LitElement: b });
(yt.litElementVersions ??= []).push("4.2.2");
const S = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
const ki = { attribute: !0, type: String, converter: Ue, reflect: !1, hasChanged: vt }, Ei = (e = ki, t, s) => {
  const { kind: i, metadata: n } = s;
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(s.name, e), i === "accessor") {
    const { name: o } = s;
    return { set(a) {
      const c = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, c, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, e, a), a;
    } };
  }
  if (i === "setter") {
    const { name: o } = s;
    return function(a) {
      const c = this[o];
      t.call(this, a), this.requestUpdate(o, c, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function h(e) {
  return (t, s) => typeof s == "object" ? Ei(e, t, s) : ((i, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(e, t, s);
}
function g(e) {
  return h({ ...e, state: !0, attribute: !1 });
}
const vs = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Ai = (e) => e.callWS({ type: "activity_levels/config/get" }).then((t) => t.config), Pi = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(vs);
async function Ci(e, t) {
  try {
    return vs(await e.callWS({ type: "activity_levels/config/save", config: t }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const Li = (e) => e.callWS({ type: "activity_levels/state" }), Oi = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), Ti = (e) => e.callWS({ type: "activity_levels/profile/get" }), Mi = (e, t = !1) => e.callWS({ type: "activity_levels/profile/rebuild", force: t }), Ri = (e, t, s = 50) => e.callWS({
  type: "activity_levels/simulation/log",
  limit: s
}), Ii = (e, t, s, i) => e.callService(t, s, i), Xe = 14, xt = (e) => `switch.${e}_presence_simulation`, bs = (e) => `sensor.${e}_expected_activity`, Di = (e) => `sensor.${e}_activity_anomaly`, st = [
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
], Ni = 2500, Ui = 8e3;
function Hi(e) {
  let t;
  return { promise: new Promise((i) => {
    t = setTimeout(i, e);
  }), cancel: () => clearTimeout(t) };
}
async function Ht(e, t, s) {
  const i = Hi(t);
  try {
    return await Promise.race([e, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function Fi() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function zi(e = Ui, t = Ni) {
  if (st.every((n) => customElements.get(n))) return { ok: !0, missing: [] };
  await Ht(Fi(), t, void 0);
  const s = await Promise.all(
    st.map(
      (n) => Ht(
        customElements.whenDefined(n).then(() => !0),
        e,
        !1
      )
    )
  ), i = st.filter((n, r) => !s[r]);
  return { ok: i.length === 0, missing: [...i] };
}
function ie(e, t) {
  let s = e;
  for (const i of t) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function Ft(e) {
  return Array.isArray(e) ? [...e] : { ...e };
}
function Ye(e, t, s) {
  if (t.length === 0) throw new Error("empty path");
  const i = Ft(e);
  let n = i;
  for (let r = 0; r < t.length - 1; r++) {
    const o = t[r], a = Ft(n[o]);
    n[o] = a, n = a;
  }
  return s(n, t[t.length - 1]), i;
}
function k(e, t, s) {
  return Ye(e, t, (i, n) => {
    i[n] = s;
  });
}
function wt(e, t) {
  return Ye(e, t, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function pt(e, t, s, i) {
  return Ye(e, [...t, s], (n) => {
    n.splice(s, 0, i);
  });
}
function ji(e, t, s, i) {
  return Ye(e, [...t, s], (n) => {
    const r = n, [o] = r.splice(s, 1);
    r.splice(i, 0, o);
  });
}
const Gi = 1e3;
class Bi {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < Gi || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const Vi = (e) => ({
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
}), Wi = (e) => ({
  id: e,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), qi = (e) => ({
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
function Ki(e) {
  const t = /* @__PURE__ */ new Set(), s = (i) => {
    t.add(i.id), i.children.forEach(s);
  };
  return e.groups.forEach(s), t;
}
function Xi(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const Yi = (e) => new Set(e.envelopes.map((t) => t.id));
function $s(e, t) {
  const s = Xi(t);
  if (!e.has(s)) return s;
  let i = 2;
  for (; e.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const Zi = (e, t) => $s(Ki(e), t), Ji = (e, t) => $s(Yi(e), t);
function Qi(e, t) {
  const s = [], i = (n) => {
    n.stimuli.some((r) => r.envelope === t) && s.push(n.id), n.children.forEach(i);
  };
  return e.groups.forEach(i), { defaults: e.defaults.envelope === t, groups: s };
}
function en(e, t, s) {
  const i = e.envelopes[t];
  if (!i || i.id === s) return e;
  const n = i.id, r = e.envelopes.map((a, c) => c === t ? { ...a, id: s } : a);
  if (e.envelopes.some((a, c) => c !== t && a.id === n)) return { ...e, envelopes: r };
  const o = (a) => ({
    ...a,
    stimuli: a.stimuli.map((c) => c.envelope === n ? { ...c, envelope: s } : c),
    children: a.children.map(o)
  });
  return {
    ...e,
    defaults: e.defaults.envelope === n ? { ...e.defaults, envelope: s } : e.defaults,
    envelopes: r,
    groups: e.groups.map(o)
  };
}
const D = (e, t) => ie(e, t), J = (e, t) => ie(e, t), tn = (e) => e.slice(0, -1), Ze = (e) => e.slice(0, -2), ys = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function _t(e, t) {
  const s = ys(e, t.envelope), i = e.defaults, n = (r, o, a) => r ?? o ?? a;
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
const sn = (e, t) => e.length === t.length && e.every((s, i) => s === t[i]), xs = (e) => e.length >= 4 ? e.slice(0, -2) : null, zt = (e) => e[e.length - 2] === "stimuli" ? e.slice(0, -2) : e;
function ws(e) {
  const t = e.groups.length > 0 ? ["groups", 0] : [];
  return { busPath: t, selection: t.length > 0 ? t : null };
}
function _s(e, t) {
  if (t.length === 0) return [];
  const s = ie(e, t);
  if (!s) return [];
  const i = [];
  return s.stimuli.forEach((n, r) => i.push([...t, "stimuli", r])), s.children.forEach((n, r) => i.push([...t, "children", r])), i;
}
function nn(e, t) {
  let s = t;
  for (; s.length > 0; ) {
    if (ie(e, s) !== void 0) return s;
    const i = xs(s);
    if (i === null) break;
    s = i;
  }
  return ws(e).busPath;
}
function jt(e, t) {
  switch (t.type) {
    case "open":
      return { busPath: t.path, selection: t.path };
    case "up": {
      const s = xs(e.busPath);
      return s === null ? e : { busPath: s, selection: s };
    }
    case "select":
      return { ...e, selection: t.path };
    case "arrow": {
      const s = [..._s(t.config, e.busPath), e.busPath];
      if (s.length === 0) return e;
      const i = e.selection ? s.findIndex((o) => sn(o, e.selection)) : -1, r = (((i === -1 && t.delta < 0 ? s.length : i) + t.delta) % s.length + s.length) % s.length;
      return { ...e, selection: s[r] };
    }
    case "sync": {
      const { config: s } = t, i = e.busPath.length > 0 && ie(s, e.busPath) !== void 0 ? e.busPath : nn(s, e.busPath), n = e.selection !== null && ie(s, e.selection) !== void 0 ? e.selection : i;
      return { busPath: i, selection: n };
    }
  }
}
function rn(e, t) {
  const s = [];
  for (let i = 2; i <= t.length; i += 2) {
    const n = t.slice(0, i), r = ie(e, n);
    if (!r) break;
    s.push({ path: n, label: r.name ?? r.id });
  }
  return s;
}
async function on(e, t) {
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
const L = _`
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
var an = Object.defineProperty, ln = Object.getOwnPropertyDescriptor, w = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ln(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && an(t, s, n), n;
};
const he = ["mixer", "groups", "envelopes", "defaults", "patterns"], cn = 2e3, hn = 1e4, dn = 5 * 6e4, un = 1500, Gt = "activity_levels.timeline", pn = ["24h", "7d", "30d"], fn = ["off", "24h", "7d"], Bt = { range: "7d", horizon: "24h", showChannels: !0, showLights: !0 };
function mn(e) {
  if (e === null) return null;
  const t = JSON.parse(e);
  return !pn.includes(t.range) || !fn.includes(t.horizon) ? null : {
    range: t.range,
    horizon: t.horizon,
    showChannels: t.showChannels !== !1,
    showLights: t.showLights !== !1
  };
}
let y = class extends b {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "mixer", this.selection = null, this.nav = { busPath: [], selection: null }, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = Bt, this.tabFocus = 0, this.profileAt = 0, this.simStatesMemo = null, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
      e.structural && (this.errors = []), this.setConfig(e.detail, e.coalesceKey);
    }, this.onNav = (e) => {
      const t = jt(this.nav, e.detail);
      this.nav = t, this.selection = t.selection;
    }, this.onRebuild = async (e) => {
      try {
        const { rebuilt: t } = await Mi(this.hass, e.detail?.force === !0);
        this.banner = t ? { kind: "info", text: "Profile rebuilt." } : { kind: "warning", text: "Rebuild skipped (external profile)." }, await this.refreshProfile(!0);
      } catch (t) {
        this.banner = { kind: "error", text: `Could not rebuild the profile: ${t.message}` };
      }
    }, this.onSimToggle = async (e) => {
      const { gid: t, on: s } = e.detail;
      try {
        await Ii(this.hass, "switch", s ? "turn_on" : "turn_off", { entity_id: xt(t) });
      } catch (i) {
        this.banner = {
          kind: "error",
          text: `Could not ${s ? "start" : "stop"} the simulation for ${t}: ${i.message}`
        };
      }
    }, this.onTimelineRange = (e) => {
      this.timeline = e.detail;
      try {
        localStorage.setItem(Gt, JSON.stringify(e.detail));
      } catch {
      }
    }, this.onTabsKeydown = (e) => {
      const t = he.length - 1;
      switch (e.key) {
        case "ArrowRight":
          this.focusTab((this.tabFocus + 1) % he.length);
          break;
        case "ArrowLeft":
          this.focusTab((this.tabFocus + t) % he.length);
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
    const { ok: e, missing: t } = await zi();
    this.missing = e ? [] : t, await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer();
  }
  async load() {
    try {
      const e = await Ai(this.hass);
      this.draft = new Bi(e), this.nav = ws(e), this.selection = this.nav.selection, this.errors = [], this.banner = null;
    } catch (e) {
      this.banner = { kind: "error", text: `Could not load configuration: ${e.message}` };
    }
  }
  setConfig(e, t) {
    this.draft?.set(e, t), this.syncNav(), this.requestUpdate();
  }
  /**
   * Re-points the navigation at the current config after an edit, and keeps the shared
   * selection with it: a node that is gone can neither be the current bus nor be shown in
   * the editor pane, so the reducer walks up to something that still exists. Nothing
   * selected stays nothing selected, though - the reducer falls back to the bus, which
   * is right after a deletion but would make the Groups tab's editor pane open itself
   * on the first edit the user makes with no row selected.
   */
  syncNav() {
    const e = this.draft?.config;
    if (!e) return;
    const t = this.selection, s = jt({ busPath: this.nav.busPath, selection: t }, { type: "sync", config: e });
    this.nav = t === null ? { busPath: s.busPath, selection: null } : s, this.selection = this.nav.selection !== null && this.nav.selection.length > 0 ? this.nav.selection : null;
  }
  /** One selection for both views: the mixer's bus follows what the tree picked, and back. */
  select(e) {
    this.selection = e, this.nav = e === null ? { ...this.nav, selection: null } : { busPath: zt(e), selection: e };
  }
  async save() {
    const e = this.draft;
    if (e) {
      this.busy = !0, this.updatePolling();
      try {
        const t = await on(e.config, {
          validate: (s) => Pi(this.hass, s),
          save: (s) => Ci(this.hass, s)
        });
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, un)), await this.load());
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
    }, cn));
  }
  /** The simulation log moves at the pace of light switches, so it gets its own slower timer. */
  updateSimPolling(e) {
    if (!(this.patternsVisible && e)) {
      this.clearSimTimer();
      return;
    }
    this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => {
      this.pollSim();
    }, hn));
  }
  async pollLive() {
    try {
      this.live = await Li(this.hass);
    } catch {
    }
  }
  async pollSim() {
    try {
      this.simLog = await Ri(this.hass);
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
    if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < dn))
      try {
        this.profileState = await Ti(this.hass), this.profileAt = Date.now();
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
      this.timeline = mn(localStorage.getItem(Gt)) ?? Bt;
    } catch {
    }
  }
  selectTab(e) {
    const t = he[e];
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
          <ha-button .disabled=${!e?.dirty || this.busy} @click=${this.save}
            >${e?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${he.map(
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
    return this.tab === "mixer" ? d : l`
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
    >` : d;
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
    }
  }
  /**
   * The mixer page, three rows deep: the selected strip's history and forecast on top, the
   * bus it lives on in the middle, and everything that does not fit on a strip below it.
   * A channel is charted as its bus - a stimulus has no series of its own.
   */
  renderMixer(e) {
    const t = e.config;
    if (t.groups.length === 0) return this.renderMixerEmpty();
    const s = zt(this.selection ?? this.nav.busPath), i = D(t, s);
    return l`<div class="rows">
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
        .minDays=${t.defaults.patterns?.min_days ?? Xe}
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
        <ha-button @click=${() => this.selectTab(he.indexOf("groups"))}>Go to Groups</ha-button>
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
          @al-select=${(i) => this.select(i.detail)}
        ></al-group-editor>` : l`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
  }
};
y.styles = [L];
w([
  h({ attribute: !1 })
], y.prototype, "hass", 2);
w([
  h({ type: Boolean })
], y.prototype, "narrow", 2);
w([
  g()
], y.prototype, "draft", 2);
w([
  g()
], y.prototype, "tab", 2);
w([
  g()
], y.prototype, "selection", 2);
w([
  g()
], y.prototype, "nav", 2);
w([
  g()
], y.prototype, "errors", 2);
w([
  g()
], y.prototype, "banner", 2);
w([
  g()
], y.prototype, "live", 2);
w([
  g()
], y.prototype, "liveOn", 2);
w([
  g()
], y.prototype, "busy", 2);
w([
  g()
], y.prototype, "missing", 2);
w([
  g()
], y.prototype, "profileState", 2);
w([
  g()
], y.prototype, "simLog", 2);
w([
  g()
], y.prototype, "timeline", 2);
w([
  g()
], y.prototype, "tabFocus", 2);
y = w([
  S("activity-levels-panel")
], y);
function Q(e) {
  const t = Math.floor(e / 3600), s = Math.floor((e - t * 3600) / 60), i = Math.round((e - t * 3600 - s * 60) * 1e3) / 1e3, n = Math.floor(i), r = Math.round((i - n) * 1e3);
  return r === 0 ? { hours: t, minutes: s, seconds: n } : { hours: t, minutes: s, seconds: n, milliseconds: r };
}
function ee(e) {
  if (!e) return null;
  const t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
  return Math.round(t * 1e3) / 1e3;
}
function O(e) {
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
const m = (e) => e.join("/");
function me(e, t) {
  const s = m(t), i = {};
  for (const n of e) {
    if (!n.path.startsWith(s + "/")) continue;
    const r = n.path.slice(s.length + 1);
    r.includes("/") || (i[r] = n.message);
  }
  return i;
}
function Fe(e, t) {
  const s = m(t);
  return e.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function re(e, t, s) {
  const i = new CustomEvent("al-change", {
    detail: e,
    bubbles: !0,
    composed: !0
  });
  return t !== void 0 && (i.coalesceKey = t), s && (i.structural = !0), i;
}
const Ss = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), be = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), gn = () => be("al-select-strip", null), vn = () => be("al-open-strip", null), bn = (e) => be("al-gain-changed", e), $n = (e) => be("al-mix-changed", { mix: e }), yn = (e) => be("al-limiter-changed", { value: e }), xn = (e) => be("al-sim-toggled", { on: e }), it = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), wn = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), ks = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), Es = (e = !1) => new CustomEvent("al-rebuild", { detail: { force: e }, bubbles: !0, composed: !0 });
var _n = Object.defineProperty, Sn = Object.getOwnPropertyDescriptor, $e = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Sn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && _n(t, s, n), n;
};
const Vt = (e) => e.stopPropagation(), kn = (e) => {
  (e.key === "Enter" || e.key === " ") && e.stopPropagation();
};
let V = class extends b {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(e) {
    this.dispatchEvent(re(e, void 0, !0));
  }
  emitSelect(e) {
    this.dispatchEvent(Ss(e));
  }
  isSelected(e) {
    return this.selection !== null && m(this.selection) === m(e);
  }
  select(e, t) {
    e.stopPropagation(), this.emitSelect(t);
  }
  selectOnKey(e, t) {
    e.key !== "Enter" && e.key !== " " || (e.preventDefault(), e.stopPropagation(), this.emitSelect(t));
  }
  addGroup(e, t) {
    const s = this.config;
    s && (this.emitChange(pt(s, e, t, Vi(Zi(s, "new_group")))), this.emitSelect([...e, t]));
  }
  addStimulus(e, t) {
    const s = this.config;
    if (!s) return;
    const i = [...e, "stimuli"];
    this.emitChange(pt(s, i, t, qi(""))), this.emitSelect([...i, t]);
  }
  move(e, t) {
    const s = this.config;
    if (!s) return;
    const i = tn(e), n = e[e.length - 1], r = n + t;
    this.emitChange(ji(s, i, n, r));
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
    if (i === null || i.length <= e.length || m(i.slice(0, e.length)) !== m(e)) return null;
    const n = i[e.length], r = n === t ? s : n === s ? t : null;
    if (r === null) return null;
    const o = [...i];
    return o[e.length] = r, o;
  }
  removeNode(e, t) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
    this.emitChange(wt(s, e));
    const i = Ze(e);
    this.emitSelect(i.length ? i : null);
  }
  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  countdown(e) {
    const t = this.live?.now;
    return e === null || t === void 0 ? null : O(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
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
    return e ? e.groups.length === 0 ? this.renderEmpty() : l`
      <ha-card>
        ${e.groups.map((t, s) => this.renderGroup(e, t, ["groups", s], 0, s, e.groups.length))}
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], e.groups.length)}>Add group</ha-button>
        </div>
      </ha-card>
    ` : l`<ha-card><span class="muted">Loading…</span></ha-card>`;
  }
  renderEmpty() {
    return l`
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
    const o = Fe(this.errors, s), a = this.live?.groups[t.id], c = a?.max_value ?? t.max_value ?? e.defaults.max_value, u = a ? Math.max(0, Math.min(100, a.value / (c || 1) * 100)) : 0;
    return l`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(p) => this.select(p, s)}
            @keydown=${kn}
          >
            ${t.name || t.id || "(unnamed group)"}
          </button>
          ${o ? l`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : d}
          ${a ? l`<div class="meter" title=${this.meterTitle(a, c, i === 0)}>
                  <div style="width: ${u}%"></div>
                </div>
                <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : d}
        </div>
        <div slot="icons" class="row" @click=${Vt}>
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
      (p, f) => this.renderStimulus(p, [...s, "stimuli", f], f, t.stimuli.length, t.id)
    )}
          ${t.stimuli.length === 0 ? l`<div class="muted empty">
                No stimuli yet — use the + button above to point this group at an entity.
              </div>` : d}
          <div class="children">
            ${t.children.map(
      (p, f) => this.renderGroup(e, p, [...s, "children", f], i + 1, f, t.children.length)
    )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(e, t, s, i, n) {
    const r = this.hass?.states[e.entity], o = r?.attributes.friendly_name ?? (e.entity || "(no entity)"), a = Fe(this.errors, t), c = this.live?.voices[n]?.find((u) => u.label === (e.key ?? e.entity));
    return l`
      <div
        class="row stimulus ${this.isSelected(t) ? "selected" : ""}"
        role="button"
        tabindex="0"
        @click=${(u) => this.select(u, t)}
        @keydown=${(u) => this.selectOnKey(u, t)}
      >
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="name grow" title=${e.entity}>${o}</span>
        ${a ? l`<span class="badge" title="${a} problem(s)">${a}</span>` : d}
        ${r ? l`<span class="muted chip">${r.state}</span>` : d}
        ${c ? l`<span class="chip phase ${c.phase}" title=${this.voiceTitle(c)}>${c.phase}</span>
              <span class="muted chip">${c.value.toFixed(2)}</span>` : d}
        <div class="row" @click=${Vt}>
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
V.styles = [
  L,
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
$e([
  h({ attribute: !1 })
], V.prototype, "hass", 2);
$e([
  h({ attribute: !1 })
], V.prototype, "config", 2);
$e([
  h({ attribute: !1 })
], V.prototype, "selection", 2);
$e([
  h({ attribute: !1 })
], V.prototype, "errors", 2);
$e([
  h({ attribute: !1 })
], V.prototype, "live", 2);
V = $e([
  S("al-tree")
], V);
const As = (e) => e.split(",").map((t) => t.trim()).filter((t) => t.length > 0), Pe = (e) => (e ?? []).join(", "), ze = (e) => e == null || e === "" ? null : e;
function En(e, t) {
  if (t != null)
    switch (e) {
      case "duration":
        return Q(t);
      case "boolean":
        return t ? "true" : "false";
      default:
        return t;
    }
}
function An(e, t) {
  if (t == null || t === "") return null;
  switch (e) {
    case "duration":
      return ee(t);
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
function Pn(e, t) {
  if (t == null) return "unset";
  switch (e) {
    case "duration":
      return O(t);
    case "boolean":
      return t ? "Yes" : "No";
    default:
      return String(t);
  }
}
const Cn = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, Ln = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, Ps = (e) => Cn[e.name] ?? e.name, Cs = (e) => Ln[e.name] ?? "", On = ["id", "name", "area", "mix", "null_handling", "gain"], Tn = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], Mn = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], Ls = { number: { min: 0.1, step: 0.1, mode: "box" } }, Os = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, Rn = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, Ts = (e, t, s) => e === "null_handling" ? t.mix === "mean" : e === "gain" ? !s : !0;
function Ms(e, t, s) {
  const i = {
    id: { text: {} },
    name: { text: {} },
    area: { area: {} },
    mix: { select: { mode: "dropdown", options: Tn } },
    null_handling: { select: { mode: "dropdown", options: Mn } },
    gain: Rn
  };
  return s.filter((n) => Ts(n, e, t)).map((n) => ({ name: n, selector: i[n] }));
}
function Rs(e, t, s) {
  const i = {
    id: e.id,
    name: e.name ?? "",
    area: e.area,
    mix: e.mix,
    null_handling: e.null_handling,
    gain: e.gain
  };
  return Object.fromEntries(
    s.filter((n) => Ts(n, e, t) && !(n === "area" && e.area === null)).map((n) => [n, i[n]])
  );
}
function Is(e, t) {
  const s = { ...e };
  return "id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = ze(t.name)), "area" in t && (s.area = ze(t.area)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), s;
}
const Ds = (e, t) => On.find((s) => e[s] !== t[s]);
var In = Object.defineProperty, Dn = Object.getOwnPropertyDescriptor, z = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Dn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && In(t, s, n), n;
};
const St = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
function Nn(e, t) {
  return e.select?.options?.find((i) => i.value === t)?.label;
}
let T = class extends b {
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
    e.stopPropagation(), this.emit(An(this.kind, e.detail?.value));
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
      const t = Nn(this.selector, String(e));
      if (t !== void 0) return t;
    }
    return Pn(this.kind, e);
  }
  /**
   * `ha-selector` defaults `required` to true, which makes a duration selector spell an
   * inherited (null) value as `00:00:00` and hides the clear affordance, so it is passed
   * explicitly: an override that is not set must read as empty.
   */
  render() {
    const e = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`;
    return l`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? St : this.selector}
          .label=${this.label}
          .required=${!1}
          .value=${En(this.kind, this.value)}
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
      ${this.error ? l`<div class="muted error msg">${this.error}</div>` : d}
    `;
  }
};
T.styles = [
  L,
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
z([
  h({ attribute: !1 })
], T.prototype, "hass", 2);
z([
  h()
], T.prototype, "label", 2);
z([
  h({ attribute: !1 })
], T.prototype, "selector", 2);
z([
  h({ attribute: !1 })
], T.prototype, "value", 2);
z([
  h({ attribute: !1 })
], T.prototype, "inherited", 2);
z([
  h({ attribute: "inherited-from" })
], T.prototype, "inheritedFrom", 2);
z([
  h()
], T.prototype, "kind", 2);
z([
  h()
], T.prototype, "error", 2);
T = z([
  S("al-override-field")
], T);
var Un = Object.defineProperty, Hn = Object.getOwnPropertyDescriptor, Oe = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Hn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Un(t, s, n), n;
};
const Wt = ["id", "name", "area", "mix", "null_handling", "gain"];
let ne = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  emitChange(e, t) {
    this.dispatchEvent(re(e, t));
  }
  emitSelect(e) {
    this.dispatchEvent(Ss(e));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = D(t, s);
    if (!i) return;
    const n = Is(i, e.detail?.value ?? {}), r = Ds(n, i);
    r !== void 0 && this.emitChange(k(t, s, n), `${m(s)}:${r}`);
  }
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(k(s, [...i, e], t), `${m(i)}:${e}`);
  }
  onDelete() {
    const { config: e, path: t } = this;
    if (!e || !t) return;
    const s = D(e, t);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(wt(e, t));
    const i = Ze(t);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length === 0)
      return l`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = D(e, t);
    if (!s) return l`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = t.length === 2, n = me(this.errors, t), r = this.errors.filter((o) => o.path === m(t));
    return l`
      <ha-card header="Group">
        ${r.map((o) => l`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${Rs(s, i, Wt)}
          .schema=${Ms(s, i, Wt)}
          .error=${n}
          .computeLabel=${Ps}
          .computeHelper=${Cs}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="muted note">Changing the id re-creates this group's entities.</div>

        <h3>Output</h3>
        <al-override-field
          .hass=${this.hass}
          label="Max value"
          kind="number"
          .selector=${Ls}
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
          .selector=${Os}
          .value=${s.precision === null ? null : String(s.precision)}
          .inherited=${String(e.defaults.precision)}
          .inheritedFrom=${"defaults"}
          .error=${n.precision}
          @value-changed=${(o) => this.setField("precision", o.detail.value === null ? null : Number(o.detail.value))}
        ></al-override-field>

        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
};
ne.styles = [
  L,
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
Oe([
  h({ attribute: !1 })
], ne.prototype, "hass", 2);
Oe([
  h({ attribute: !1 })
], ne.prototype, "config", 2);
Oe([
  h({ attribute: !1 })
], ne.prototype, "path", 2);
Oe([
  h({ attribute: !1 })
], ne.prototype, "errors", 2);
ne = Oe([
  S("al-group-editor")
], ne);
const Fn = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, zn = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, Ns = (e) => Fn[e.name] ?? e.name, Us = (e) => zn[e.name] ?? "", jn = ["entity", "gain", "key", "envelope"], Re = { duration: { enable_millisecond: !0 } }, Gn = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Bn = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, Vn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Wn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, qn = "(unknown preset — using built-in defaults)", Hs = [
  { name: "attack", label: "Attack", kind: "duration", selector: Re },
  { name: "decay", label: "Decay", kind: "duration", selector: Re },
  { name: "sustain", label: "Sustain", kind: "number", selector: Gn },
  { name: "release", label: "Release", kind: "duration", selector: Re },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: St },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Vn },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Wn },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Re }
], Kn = (e) => [
  { value: "", label: "(default preset)" },
  ...e.envelopes.map((t) => ({ value: t.id, label: t.id }))
];
function Fs(e, t) {
  const s = {
    entity: { entity: {} },
    to: { text: {} },
    gain: Bn,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: Kn(e) } }
  };
  return t.map((i) => ({ name: i, selector: s[i] }));
}
function zs(e, t, s) {
  const i = {
    entity: e.entity,
    to: t ?? Pe(e.to),
    gain: e.gain,
    key: e.key ?? "",
    envelope: e.envelope ?? ""
  };
  return Object.fromEntries(s.map((n) => [n, i[n]]));
}
function js(e, t) {
  const s = { ...e };
  return "entity" in t && (s.entity = String(t.entity ?? "")), "to" in t && (s.to = As(String(t.to ?? ""))), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = ze(t.key)), "envelope" in t && (s.envelope = ze(t.envelope)), s;
}
function Gs(e, t) {
  return Pe(e.to) !== Pe(t.to) ? "to" : jn.find((s) => e[s] !== t[s]);
}
const Bs = (e, t) => Pe(e) === Pe(As(t));
function Vs(e, t, s) {
  const i = ys(e, t.envelope);
  return i ? i[s] === null || i[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : qn;
}
function Ws(e, t) {
  return t == null || e === void 0 ? null : O(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
const qs = (e) => e.release * e.sustain;
function Ks(e, t = 0.25) {
  if (e.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
  const s = qs(e), i = e.attack + e.decay + s, n = i > 0 ? i * t / (1 - t) : 1, r = i + n;
  let o = 0;
  const a = [{ x: 0, y: 0 }];
  return o += e.attack, a.push({ x: o / r, y: 1 }), o += e.decay, a.push({ x: o / r, y: e.sustain }), o += n, a.push({ x: o / r, y: e.sustain }), o += s, a.push({ x: o / r, y: 0 }), a;
}
const Xn = (e) => Math.round(e * 100) / 100;
function Yn(e, t = 0.25) {
  const s = Ks(e, t), i = (r) => ((s[r]?.x ?? 0) + (s[r + 1]?.x ?? 0)) / 2;
  if (e.impulse) {
    const r = [{ text: "impulse", x: 0 }];
    return e.release > 0 && r.push({ text: `R ${O(e.release)}`, x: i(1) }), r;
  }
  const n = [];
  return e.attack > 0 && n.push({ text: `A ${O(e.attack)}`, x: i(0) }), e.decay > 0 && n.push({ text: `D ${O(e.decay)}`, x: i(1) }), n.push({ text: `S ${Xn(e.sustain)}`, x: i(2) }), qs(e) > 0 && n.push({ text: `R ${O(e.release)}`, x: i(3) }), n;
}
var Zn = Object.defineProperty, Jn = Object.getOwnPropertyDescriptor, Xs = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Jn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Zn(t, s, n), n;
};
const Ce = 10, je = 190, Qn = 10, pe = 58, er = 72, De = (e) => Ce + e * (je - Ce), nt = (e) => pe - e * (pe - Qn), Se = (e) => String(Math.round(e * 10) / 10), rt = (e, t) => `${Se(e)},${Se(t)}`, tr = (e) => Math.min(je - 6, Math.max(Ce + 6, De(e)));
let Ge = class extends b {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const e = this.envelope;
    if (!e) return d;
    const t = Ks(e), s = t[0], i = t[t.length - 1], n = t.map((c) => rt(De(c.x), nt(c.y))).join(" "), r = `${rt(De(s.x), pe)} ${n} ${rt(De(i.x), pe)}`, o = Yn(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return l`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${Ce} y1=${pe} x2=${je} y2=${pe}></line>
        ${e.impulse ? d : P`<line
              class="grid"
              x1=${Ce}
              y1=${Se(nt(e.sustain))}
              x2=${je}
              y2=${Se(nt(e.sustain))}
            ></line>`}
        <polygon class="area" points=${r}></polygon>
        <polyline class="curve" points=${n}></polyline>
        ${o.map(
      (c) => P`<text class="caption" x=${Se(tr(c.x))} y=${er} text-anchor="middle">${c.text}</text>`
    )}
      </svg>
    `;
  }
};
Ge.styles = [
  L,
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
Xs([
  h({ attribute: !1 })
], Ge.prototype, "envelope", 2);
Ge = Xs([
  S("al-envelope-sketch")
], Ge);
var sr = Object.defineProperty, ir = Object.getOwnPropertyDescriptor, oe = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ir(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && sr(t, s, n), n;
};
const qt = ["entity", "to", "gain", "key", "envelope"];
let H = class extends b {
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
    const { config: t, path: s } = this, i = t && s ? J(t, s) : void 0;
    i && (Bs(i.to, this.toText) || (this.toText = null));
  }
  emitChange(e, t) {
    this.dispatchEvent(re(e, t));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = J(t, s);
    if (!i) return;
    const n = e.detail?.value ?? {};
    this.toText = String(n.to ?? "");
    const r = js(i, n), o = Gs(r, i);
    o !== void 0 && this.emitChange(k(t, s, r), `${m(s)}:${o}`);
  }
  setOverride(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(k(s, [...i, e], t), `${m(i)}:${e}`);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length < 3)
      return l`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = J(e, t);
    if (!s) return l`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = D(e, Ze(t)), n = me(this.errors, t), r = this.errors.filter((u) => u.path === m(t)), o = _t(e, s), a = this.live?.voices[i?.id ?? ""]?.find(
      (u) => u.label === (s.key ?? s.entity)
    ), c = Ws(this.live?.now, a?.phase_ends);
    return l`
      <ha-card header="Stimulus">
        ${r.map((u) => l`<ha-alert alert-type="error">${u.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${zs(s, this.toText, qt)}
          .schema=${Fs(e, qt)}
          .error=${n}
          .computeLabel=${Ns}
          .computeHelper=${Us}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${a ? l`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip phase ${a.phase}">${a.phase}</span>
              <span class="chip">${a.value.toFixed(2)}</span>
              ${c !== null ? l`<span class="muted chip">ends in ${c}</span>` : d}
              <span class="dot ${a.gate ? "gated" : ""}" title=${a.gate ? "Gate open" : "Gate closed"}></span>
            </div>` : d}

        <h3>Envelope overrides</h3>
        ${Hs.map(
      (u) => l`<al-override-field
            .hass=${this.hass}
            .label=${u.label}
            .kind=${u.kind}
            .selector=${u.selector}
            .value=${s[u.name]}
            .inherited=${o[u.name]}
            .inheritedFrom=${Vs(e, s, u.name)}
            .error=${n[u.name]}
            @value-changed=${(p) => this.setOverride(u.name, p.detail.value)}
          ></al-override-field>`
    )}
        <h3>Envelope shape</h3>
        <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
      </ha-card>
    `;
  }
};
H.styles = [
  L,
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
oe([
  h({ attribute: !1 })
], H.prototype, "hass", 2);
oe([
  h({ attribute: !1 })
], H.prototype, "config", 2);
oe([
  h({ attribute: !1 })
], H.prototype, "path", 2);
oe([
  h({ attribute: !1 })
], H.prototype, "errors", 2);
oe([
  h({ attribute: !1 })
], H.prototype, "live", 2);
oe([
  g()
], H.prototype, "toText", 2);
H = oe([
  S("al-stimulus-editor")
], H);
var nr = Object.defineProperty, rr = Object.getOwnPropertyDescriptor, ae = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? rr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && nr(t, s, n), n;
};
const or = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, ar = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, lr = ["id", "attack", "decay", "sustain", "release", "impulse"], Ne = { duration: { enable_millisecond: !0 } }, cr = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, hr = { boolean: {} }, dr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, ur = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, pr = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: Ne },
  { name: "decay", selector: Ne },
  { name: "sustain", selector: cr },
  { name: "release", selector: Ne },
  { name: "impulse", selector: hr }
], fr = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: dr },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: ur },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Ne }
];
let F = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (e) => or[e.name] ?? e.name, this.computeHelper = (e) => ar[e.name] ?? "";
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
    this.dispatchEvent(re(e, t));
  }
  selectPreset(e) {
    this.selected = e, this.blocked = null;
  }
  addPreset() {
    const e = this.config;
    if (!e) return;
    this.blocked = null;
    const t = e.envelopes.length;
    this.emitChange(pt(e, ["envelopes"], t, Wi(Ji(e, "preset")))), this.selected = t;
  }
  removePreset(e) {
    const t = this.config;
    if (!t) return;
    const s = t.envelopes[e];
    if (!s) return;
    const i = Qi(t, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(wt(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config, s = this.selected, i = t?.envelopes[s];
    if (!t || !i) return;
    const n = e.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      attack: ee(n.attack) ?? i.attack,
      decay: ee(n.decay) ?? i.decay,
      sustain: typeof n.sustain == "number" ? n.sustain : i.sustain,
      release: ee(n.release) ?? i.release,
      impulse: typeof n.impulse == "boolean" ? n.impulse : i.impulse
    }, o = lr.find((u) => r[u] !== i[u]);
    if (o === void 0) return;
    const a = ["envelopes", s], c = k(en(t, s, r.id), a, r);
    this.emitChange(c, `${m(a)}:${o}`);
  }
  setOverride(e, t) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const n = ["envelopes", i, e];
    this.emitChange(k(s, n, t), m(n));
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
        ${e.envelopes.map((s, i) => {
      const n = Fe(this.errors, ["envelopes", i]);
      return l`<div class="row preset ${this.selected === i ? "selected" : ""}">
            <button type="button" class="link grow" title="Edit this preset" @click=${() => this.selectPreset(i)}>
              ${s.id || "(unnamed preset)"}
            </button>
            ${n ? l`<span class="badge" title="${n} problem(s)">${n}</span>` : d}
            <ha-icon-button label="Delete preset" title="Delete preset" @click=${() => this.removePreset(i)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>`;
    })}
        ${e.envelopes.length === 0 ? l`<p class="muted">No presets yet.</p>` : d}
        ${t ? l`<ha-alert alert-type="warning">${gr(t)}</ha-alert>` : d}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(e) {
    const t = this.selected, s = e.envelopes[t];
    if (!s) return l`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", t], n = me(this.errors, i), r = this.errors.filter((c) => c.path === m(i)), o = {
      id: s.id,
      attack: Q(s.attack),
      decay: Q(s.decay),
      sustain: s.sustain,
      release: Q(s.release),
      impulse: s.impulse
    }, a = mr(e, t, s);
    return l`
      <ha-card header="Envelope preset">
        ${r.map((c) => l`<ha-alert alert-type="error">${c.message}</ha-alert>`)}
        ${a ? l`<ha-alert alert-type="warning">${a}</ha-alert>` : d}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${pr}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${fr.map(
      (c) => l`<al-override-field
            .hass=${this.hass}
            .label=${c.label}
            .kind=${c.kind}
            .selector=${c.kind === "boolean" ? St : c.selector}
            .value=${s[c.name]}
            .inherited=${e.defaults[c.name]}
            .inheritedFrom=${"defaults"}
            .error=${n[c.name]}
            @value-changed=${(u) => this.setOverride(c.name, u.detail.value)}
          ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
F.styles = [
  L,
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
ae([
  h({ attribute: !1 })
], F.prototype, "hass", 2);
ae([
  h({ attribute: !1 })
], F.prototype, "config", 2);
ae([
  h({ attribute: !1 })
], F.prototype, "errors", 2);
ae([
  h({ type: Boolean })
], F.prototype, "narrow", 2);
ae([
  g()
], F.prototype, "selected", 2);
ae([
  g()
], F.prototype, "blocked", 2);
F = ae([
  S("al-envelopes")
], F);
function mr(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((i, n) => n !== t && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function gr(e) {
  const t = [];
  return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
var vr = Object.defineProperty, br = Object.getOwnPropertyDescriptor, Je = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? br(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && vr(t, s, n), n;
};
const $r = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, yr = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Stack: each trigger adds its gain on top of the current level, up to the group's limiter. Only while releasing: a trigger only restarts a fading note. Always: a trigger restarts the note even while it is held.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, xr = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], ot = { duration: { enable_millisecond: !0 } }, wr = { number: { min: 0.1, step: 0.1, mode: "box" } }, _r = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, Sr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, kr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
};
let ge = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (e) => $r[e.name] ?? e.name, this.computeHelper = (e) => yr[e.name] ?? "";
  }
  schemaFor(e) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: e.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: wr },
      { name: "precision", selector: _r },
      { name: "unavailable", selector: kr },
      { name: "retrigger", selector: Sr },
      { name: "debounce", selector: ot },
      { name: "safety_refresh", selector: ot },
      { name: "min_wake_interval", selector: ot }
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
      debounce: ee(i.debounce) ?? s.debounce,
      safety_refresh: ee(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: ee(i.min_wake_interval) ?? s.min_wake_interval
    }, o = xr.find((a) => r[a] !== s[a]);
    o !== void 0 && this.emitChange(k(t, ["defaults"], r), `defaults:${o}`);
  }
  emitChange(e, t) {
    this.dispatchEvent(re(e, t));
  }
  render() {
    const e = this.config;
    if (!e) return l`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const t = e.defaults, s = me(this.errors, ["defaults"]), i = this.errors.filter((r) => r.path === "defaults"), n = {
      envelope: t.envelope,
      max_value: t.max_value,
      precision: String(t.precision),
      unavailable: t.unavailable,
      retrigger: t.retrigger,
      debounce: Q(t.debounce),
      safety_refresh: Q(t.safety_refresh),
      min_wake_interval: Q(t.min_wake_interval)
    };
    return l`
      <div class="pad">
        <ha-card header="Defaults">
          ${i.map((r) => l`<ha-alert alert-type="error">${r.message}</ha-alert>`)}
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
ge.styles = [
  L,
  _`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
Je([
  h({ attribute: !1 })
], ge.prototype, "hass", 2);
Je([
  h({ attribute: !1 })
], ge.prototype, "config", 2);
Je([
  h({ attribute: !1 })
], ge.prototype, "errors", 2);
ge = Je([
  S("al-defaults")
], ge);
const Be = 0.1, Ve = 10, kt = Math.log10(Be), Er = Math.log10(Ve), Ys = Er - kt, Qe = (e) => Math.min(Ve, Math.max(Be, e)), Et = (e) => Math.round(e * 100) / 100, Kt = (e) => Et(Qe(e));
function Ar(e) {
  return (Math.log10(Qe(e)) - kt) / Ys;
}
function Pr(e) {
  const t = Math.min(1, Math.max(0, e));
  return Et(Qe(Math.pow(10, kt + t * Ys)));
}
function at(e, t, s = !1) {
  const i = s ? 1.05 : 1.25;
  return Et(Qe(t === 1 ? e * i : e / i));
}
function Xt(e) {
  let t = e.toFixed(2).replace(/0+$/, "");
  return t.endsWith(".") && (t += "0"), t;
}
var Cr = Object.defineProperty, Lr = Object.getOwnPropertyDescriptor, ye = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Lr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Cr(t, s, n), n;
};
const ft = 12, Yt = (e) => `${Math.round(e * 1e3) / 10}%`;
let W = class extends b {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.focusable = !0, this.label = "Gain", this.dragValue = null, this.dragging = !1, this.onWheel = (e) => {
      this.disabled || e.deltaY === 0 || (e.preventDefault(), this.commit(at(this.current, e.deltaY < 0 ? 1 : -1, e.shiftKey)));
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
        s = at(t, 1, e.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        s = at(t, -1, e.shiftKey);
        break;
      case "Home":
        s = Be;
        break;
      case "End":
        s = Ve;
        break;
      case "PageUp":
        s = Kt(t * 2);
        break;
      case "PageDown":
        s = Kt(t / 2);
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
    const i = Pr(1 - (e.clientY - s.top) / s.height);
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
    const e = this.current, t = Ar(e);
    return l`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled || !this.focusable ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${Be}
        aria-valuemax=${Ve}
        aria-valuenow=${e}
        aria-valuetext=${Xt(e)}
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
          <div class="fill" style="height: ${Yt(t)}"></div>
          <div class="knob" style="bottom: calc(${Yt(t)} - ${Math.round((t - 0.5) * ft * 10) / 10}px - ${ft / 2}px)"></div>
        </div>
        <div class="value">${Xt(e)}</div>
      </div>
    `;
  }
};
W.styles = _`
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
      height: ${ft}px;
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
ye([
  h({ type: Number })
], W.prototype, "value", 2);
ye([
  h({ type: Boolean, reflect: !0 })
], W.prototype, "disabled", 2);
ye([
  h({ type: Boolean })
], W.prototype, "focusable", 2);
ye([
  h({ type: String })
], W.prototype, "label", 2);
ye([
  g()
], W.prototype, "dragValue", 2);
W = ye([
  S("al-fader")
], W);
const Or = { ATTRIBUTE: 1 }, Tr = (e) => (...t) => ({ _$litDirective$: e, values: t });
class Mr {
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
const Zt = Tr(class extends Mr {
  constructor(e) {
    if (super(e), e.type !== Or.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
    return se;
  }
});
var Rr = Object.defineProperty, Ir = Object.getOwnPropertyDescriptor, et = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ir(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Rr(t, s, n), n;
};
const Dr = (e) => `${Math.round(e * 1e3) / 10}%`;
let ve = class extends b {
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
        <div class=${Zt({ fill: !0, hot: e > 0.9 })} style="width: ${Dr(e)}"></div>
      </div>
      <div class=${Zt({ dot: !0, gated: this.gated })}></div>
    `;
  }
};
ve.styles = _`
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
et([
  h({ type: Number })
], ve.prototype, "value", 2);
et([
  h({ type: Number })
], ve.prototype, "max", 2);
et([
  h({ type: Boolean })
], ve.prototype, "gated", 2);
ve = et([
  S("al-meter")
], ve);
var Nr = Object.defineProperty, Ur = Object.getOwnPropertyDescriptor, U = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ur(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Nr(t, s, n), n;
};
const Hr = (e) => String(Math.round(e * 100) / 100);
function Jt(e) {
  return e.impulse ? `impulse · R ${O(e.release)}` : `A ${O(e.attack)} · D ${O(e.decay)} · S ${Hr(e.sustain)} · R ${O(e.release)}`;
}
let C = class extends b {
  constructor() {
    super(...arguments), this.kind = "channel", this.label = "", this.sublabel = null, this.envelope = null, this.gain = 1, this.live = null, this.selected = !1, this.errors = 0, this.entityIcon = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.hasAttribute("tabindex") || (this.tabIndex = -1);
  }
  select() {
    this.dispatchEvent(gn());
  }
  /** Drilling into a bus is its own intent: it must not also read as selecting the strip. */
  open(e) {
    e.stopPropagation(), this.dispatchEvent(vn());
  }
  onGain(e) {
    e.stopPropagation(), this.dispatchEvent(bn(e.detail));
  }
  render() {
    const e = this.kind === "bus" ? null : this.envelope;
    return l`
      <div class="strip" @click=${this.select}>
        <div class="head">
          ${this.entityIcon ? l`<ha-icon class="icon" .icon=${this.entityIcon}></ha-icon>` : l`<span class="icon">${this.kind === "bus" ? "▤" : "⚡"}</span>`}
          <span class="name" title=${this.label}>${this.label}</span>
        </div>
        <div class="sub" title=${this.sublabel ?? ""}>${this.sublabel ?? ""}</div>
        ${e ? l`<al-envelope-sketch .envelope=${e}></al-envelope-sketch>` : d}
        <div class="adsr" title=${e ? Jt(e) : ""}>${e ? Jt(e) : ""}</div>
        <al-fader
          .value=${this.gain}
          .focusable=${this.selected}
          label=${`${this.label} gain`}
          @value-changed=${this.onGain}
        ></al-fader>
        ${this.live ? l`<al-meter .value=${this.live.value} .max=${this.live.max} .gated=${this.live.gated}></al-meter>` : d}
        <div class="foot">
          ${this.errors > 0 ? l`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : d}
          ${this.kind === "bus" ? l`<button class="link open" tabindex=${this.selected ? 0 : -1} @click=${this.open}>
                open ▸
              </button>` : d}
        </div>
      </div>
    `;
  }
};
C.styles = _`
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
U([
  h({ type: String, reflect: !0 })
], C.prototype, "kind", 2);
U([
  h({ type: String })
], C.prototype, "label", 2);
U([
  h({ type: String })
], C.prototype, "sublabel", 2);
U([
  h({ attribute: !1 })
], C.prototype, "envelope", 2);
U([
  h({ type: Number })
], C.prototype, "gain", 2);
U([
  h({ attribute: !1 })
], C.prototype, "live", 2);
U([
  h({ type: Boolean, reflect: !0 })
], C.prototype, "selected", 2);
U([
  h({ type: Number })
], C.prototype, "errors", 2);
U([
  h({ type: String })
], C.prototype, "entityIcon", 2);
C = U([
  S("al-strip")
], C);
var Fr = Object.defineProperty, zr = Object.getOwnPropertyDescriptor, R = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? zr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Fr(t, s, n), n;
};
const jr = ["sum", "max", "mean"], Qt = (e) => e.stopPropagation(), es = 0.1;
let E = class extends b {
  constructor() {
    super(...arguments), this.label = "", this.mix = "sum", this.maxValue = 5, this.precision = 1, this.live = null, this.lights = 0, this.simEntityId = null, this.simOn = !1, this.blockedReason = null, this.selected = !1;
  }
  /** `0` on the selected strip, `-1` on every other one. */
  get stop() {
    return this.selected ? 0 : -1;
  }
  onMix(e) {
    this.dispatchEvent($n(e.target.value));
  }
  /**
   * `min` on a number input is advice to the browser, not a guarantee to us: it does not stop
   * a typed or pasted `0`, and `.value` reads back whatever is in the box. So the floor is
   * enforced here, and a rejected entry — empty, unreadable, or below the floor — puts the
   * committed ceiling back in the box rather than leaving a value we refused on screen.
   */
  onLimiter(e) {
    const t = e.target, s = t.value.trim(), i = Number(s);
    if (s === "" || !Number.isFinite(i) || i < es) {
      t.value = String(this.maxValue);
      return;
    }
    this.dispatchEvent(yn(i));
  }
  onSim(e) {
    this.dispatchEvent(xn(e.target.checked === !0));
  }
  render() {
    const e = this.blockedReason;
    return l`
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
            @keydown=${Qt}
          >
            ${jr.map((t) => l`<option value=${t} ?selected=${t === this.mix}>${t}</option>`)}
          </select>
        </div>
        <div>
          <label for="limiter">limiter</label>
          <input
            id="limiter"
            class="limiter"
            type="number"
            tabindex=${this.stop}
            min=${es}
            step="0.1"
            .value=${String(this.maxValue)}
            @change=${this.onLimiter}
            @keydown=${Qt}
          />
        </div>
        <div class="muted">${this.precision} dp · ${this.lights} light${this.lights === 1 ? "" : "s"}</div>
        ${this.lights > 0 ? l`<div class="sim">
              <ha-switch
                tabindex=${this.stop}
                .checked=${this.simOn}
                .disabled=${this.simEntityId === null}
                title=${e ?? (this.simEntityId === null ? "No simulation switch for this group" : "Presence simulation")}
                @change=${this.onSim}
              ></ha-switch>
              <span class="muted">⏻</span>
            </div>` : d}
        ${this.live ? l`<al-meter .value=${this.live.value} .max=${this.live.max} .gated=${this.live.gated}></al-meter>` : d}
      </div>
    `;
  }
};
E.styles = _`
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
R([
  h({ type: String })
], E.prototype, "label", 2);
R([
  h({ type: String })
], E.prototype, "mix", 2);
R([
  h({ type: Number })
], E.prototype, "maxValue", 2);
R([
  h({ type: Number })
], E.prototype, "precision", 2);
R([
  h({ attribute: !1 })
], E.prototype, "live", 2);
R([
  h({ type: Number })
], E.prototype, "lights", 2);
R([
  h({ type: String })
], E.prototype, "simEntityId", 2);
R([
  h({ type: Boolean })
], E.prototype, "simOn", 2);
R([
  h({ type: String })
], E.prototype, "blockedReason", 2);
R([
  h({ type: Boolean, reflect: !0 })
], E.prototype, "selected", 2);
E = R([
  S("al-master-strip")
], E);
var Gr = Object.defineProperty, Br = Object.getOwnPropertyDescriptor, K = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Br(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Gr(t, s, n), n;
};
const Vr = (e) => {
  const t = e.composedPath()[0];
  return t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t instanceof HTMLTextAreaElement || t instanceof HTMLElement && t.isContentEditable;
}, ts = (e) => e[e.length - 2] === "children";
let N = class extends b {
  constructor() {
    super(...arguments), this.nav = { busPath: [], selection: null }, this.errors = [], this.live = null, this.simState = {}, this.narrow = !1, this.pendingFocus = !1;
  }
  get bus() {
    return this.config && this.nav.busPath.length > 0 ? D(this.config, this.nav.busPath) : void 0;
  }
  get channels() {
    return this.config ? _s(this.config, this.nav.busPath) : [];
  }
  isSelected(e) {
    return this.nav.selection !== null && m(this.nav.selection) === m(e);
  }
  /** The ceiling a channel's meter is drawn against: the bus it mixes into, not its own. */
  busCeiling(e) {
    return this.live?.groups[e.id]?.max_value ?? e.max_value ?? this.config?.defaults.max_value ?? 5;
  }
  navigate(e) {
    this.pendingFocus = !0, this.dispatchEvent(it(e));
  }
  emitChange(e, t) {
    this.dispatchEvent(re(e, t));
  }
  /** Which strip an event came from: strips are identical, so the row index is the key. */
  pathOf(e) {
    const t = e.target?.dataset?.index;
    return t === void 0 ? null : this.channels[Number(t)] ?? null;
  }
  onStripSelect(e) {
    const t = this.pathOf(e);
    t && this.dispatchEvent(it({ type: "select", path: t }));
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
    this.emitChange(k(s, [...t, "gain"], i), `${m(t)}:gain`);
  }
  onMasterSelect() {
    this.dispatchEvent(it({ type: "select", path: this.nav.busPath }));
  }
  onMix(e) {
    const t = this.config;
    if (!t) return;
    const { mix: s } = e.detail;
    this.emitChange(k(t, [...this.nav.busPath, "mix"], s));
  }
  onLimiter(e) {
    const t = this.config;
    if (!t) return;
    const { value: s } = e.detail;
    this.emitChange(k(t, [...this.nav.busPath, "max_value"], s), `${m(this.nav.busPath)}:limiter`);
  }
  onSim(e) {
    const t = this.bus;
    if (!t) return;
    const { on: s } = e.detail;
    this.dispatchEvent(ks(t.id, s));
  }
  /** Console keys: ←/→ walk the row, Enter drills into a bus, Backspace comes back up. */
  onKeyDown(e) {
    const t = this.config;
    if (!(!t || Vr(e)))
      switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft":
          e.preventDefault(), this.navigate({ type: "arrow", delta: e.key === "ArrowRight" ? 1 : -1, config: t });
          break;
        case "Enter": {
          const s = this.nav.selection;
          if (!s || !ts(s) || !this.channels.some((i) => m(i) === m(s)))
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
  /**
   * With more than one root group there is no single top of the tree to walk up to, so
   * the trail starts with a selector over the roots instead of a crumb for one of them.
   */
  renderRootSelector(e) {
    if (e.groups.length < 2) return d;
    const t = typeof this.nav.busPath[1] == "number" ? this.nav.busPath[1] : 0;
    return l`
      <select
        class="link crumb root"
        aria-label="Root bus"
        aria-current=${this.nav.busPath.length <= 2 ? "location" : d}
        .value=${String(t)}
        @change=${(s) => this.navigate({ type: "open", path: ["groups", Number(s.target.value)] })}
      >
        ${e.groups.map(
      (s, i) => l`<option value=${i} ?selected=${i === t}>${s.name ?? s.id}</option>`
    )}
      </select>
    `;
  }
  renderCrumbs(e) {
    const t = this.renderRootSelector(e), s = rn(e, this.nav.busPath), i = t === d ? s : s.slice(1);
    return l`
      <div class="crumbs">
        <button
          class="link up"
          title="Up one bus"
          ?disabled=${this.nav.busPath.length < 4}
          @click=${() => this.navigate({ type: "up" })}
        >
          ⌃ up
        </button>
        ${t}
        ${i.map(
      (n, r) => l`
            ${r > 0 || t !== d ? l`<span class="sep">›</span>` : d}
            <button
              class="link crumb"
              aria-current=${r === i.length - 1 ? "location" : d}
              @click=${() => this.navigate({ type: "open", path: n.path })}
            >
              ${n.label}
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
      errors: Fe(this.errors, s),
      tabindex: n ? 0 : -1
    };
    return ts(s) ? this.renderBusChannel(e, t, s, r) : this.renderStimulusChannel(e, t, s, r);
  }
  renderBusChannel(e, t, s, i) {
    const n = D(e, s);
    if (!n) return l``;
    const r = this.live?.groups[n.id], o = r ? { value: r.value, max: this.busCeiling(t), gated: r.gated } : null;
    return l`
      <al-strip
        kind="bus"
        data-index=${i.index}
        tabindex=${i.tabindex}
        ?narrow=${this.narrow}
        .label=${n.name ?? n.id}
        .sublabel=${`bus · ${n.stimuli.length + n.children.length}`}
        .gain=${n.gain}
        .live=${o}
        .selected=${i.selected}
        .errors=${i.errors}
      ></al-strip>
    `;
  }
  renderStimulusChannel(e, t, s, i) {
    const n = J(e, s);
    if (!n) return l``;
    const r = this.hass?.states[n.entity], o = this.live?.voices[t.id]?.find((c) => c.label === (n.key ?? n.entity)), a = o ? { value: o.value, max: this.busCeiling(t), gated: o.gate } : null;
    return l`
      <al-strip
        kind="channel"
        data-index=${i.index}
        tabindex=${i.tabindex}
        ?narrow=${this.narrow}
        .label=${r?.attributes.friendly_name ?? n.entity}
        .sublabel=${r?.state ?? "unknown"}
        .envelope=${_t(e, n)}
        .gain=${n.gain}
        .live=${a}
        .selected=${i.selected}
        .errors=${i.errors}
        .entityIcon=${r?.attributes.icon ?? null}
      ></al-strip>
    `;
  }
  renderMaster(e, t) {
    const s = this.live?.groups[t.id], i = s ? { value: s.value, max: s.max_value, gated: s.gated } : null, n = xt(t.id), r = this.isSelected(this.nav.busPath);
    return l`
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
    return !e || !t ? l`<div class="empty muted">No bus to mix: add a group first.</div>` : l`
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
N.styles = [
  L,
  _`
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
      /* The root selector is a crumb that happens to be a control, so it is styled to
         sit in the trail rather than to look like a form field. */
      select.crumb {
        -webkit-appearance: none;
        appearance: none;
        max-width: 12em;
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
K([
  h({ attribute: !1 })
], N.prototype, "hass", 2);
K([
  h({ attribute: !1 })
], N.prototype, "config", 2);
K([
  h({ attribute: !1 })
], N.prototype, "nav", 2);
K([
  h({ attribute: !1 })
], N.prototype, "errors", 2);
K([
  h({ attribute: !1 })
], N.prototype, "live", 2);
K([
  h({ attribute: !1 })
], N.prototype, "simState", 2);
K([
  h({ type: Boolean, reflect: !0 })
], N.prototype, "narrow", 2);
N = K([
  S("al-mixer")
], N);
const Wr = {
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
}, qr = {
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400
};
function Kr(e, t, s) {
  return {
    start: e - Wr[t],
    end: e,
    resolution: t === "24h" ? "5m" : "1h",
    forecastUntil: s === "off" ? void 0 : e + qr[s]
  };
}
function Xr(e, t, s) {
  const i = t - e || 1;
  return (n) => (n - e) / i * s;
}
function Yr(e, t, s = 4) {
  const i = e || 1, n = t - 2 * s;
  return (r) => t - s - r / i * n;
}
function We(e, t) {
  t = Math.max(4, t);
  const s = e.length;
  if (s <= t) return e;
  const i = Math.max(1, Math.floor(t / 2)), n = Math.ceil(s / i), r = [];
  for (let o = 0; o < s; o += n) {
    const a = Math.min(o + n, s);
    let c = e[o], u = e[o];
    for (let p = o + 1; p < a; p++) {
      const f = e[p];
      f[1] < c[1] && (c = f), f[1] > u[1] && (u = f);
    }
    c === u ? r.push(c) : c[0] <= u[0] ? r.push(c, u) : r.push(u, c);
  }
  return r[0] !== e[0] && (r[0] = e[0]), r[r.length - 1] !== e[s - 1] && (r[r.length - 1] = e[s - 1]), r;
}
function ss(e, t, s) {
  return e.length === 0 ? "" : e.map(([i, n], r) => `${r === 0 ? "M" : "L"}${t(i)},${s(n)}`).join(" ");
}
function Zr(e, t, s, i = 1 / 0) {
  if (e.p75.length === 0) return "";
  const n = (c) => c.map((u, p) => [e.t0 + p * e.step, u]), r = We(n(e.p75), i), o = We(n(e.p25), i).reverse();
  return `${[...r, ...o].map(([c, u], p) => `${p === 0 ? "M" : "L"}${t(c)},${s(u)}`).join(" ")} Z`;
}
function Jr(e, t) {
  return e[t].map((s, i) => [e.t0 + i * e.step, s]);
}
function lt(e, t, s) {
  return e.map(([i, n, r]) => ({ x0: t(i), x1: t(n ?? s), tag: r }));
}
function is(e, t) {
  if (e.length === 0) return -1;
  let s = 0, i = e.length - 1;
  for (; s < i; ) {
    const n = s + i >> 1;
    e[n][0] < t ? s = n + 1 : i = n;
  }
  return s > 0 && Math.abs(e[s - 1][0] - t) <= Math.abs(e[s][0] - t) ? s - 1 : s;
}
function Qr(e) {
  return [e.group_id, e.start, e.end, e.resolution, e.include_children ?? !1, e.forecast_until ?? ""].join("|");
}
var eo = Object.defineProperty, to = Object.getOwnPropertyDescriptor, x = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? to(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && eo(t, s, n), n;
};
const ue = 32, so = 28, io = 4, ns = 8, no = 800, ro = 220, oo = 160, ct = 2e3, ao = 6e4, Zs = 6e4, lo = 32, co = ["24h", "7d", "30d"], ho = ["off", "24h", "7d"], rs = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], uo = (e) => `hsl(${e * 67 % 360} 55% 62%)`, G = /* @__PURE__ */ new Map(), ht = /* @__PURE__ */ new Map();
function os(e, t) {
  const s = Date.now();
  for (const [i, n] of G) s - n.at >= Zs && G.delete(i);
  G.delete(e), G.set(e, { at: s, data: t });
  for (const i of G.keys()) {
    if (G.size <= lo) break;
    G.delete(i);
  }
}
const po = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", fo = (e, t) => {
  const s = new Date(e * 1e3);
  return t <= 2 * 86400 ? s.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : s.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}, dt = (e) => String(Math.round(e * 100) / 100), ut = (e, t, s) => Math.min(s, Math.max(t, e));
function mo(e, t, s, i) {
  const n = Math.max(1, i.width - ue), r = Math.max(1, i.height - so), o = s.start, a = Math.max(s.until, s.end), c = Xr(o, a, n), u = Yr(i.maxValue, r), p = Object.keys(e.series), f = p.includes(t) ? t : p[0] ?? t, A = (v, X) => {
    const ce = We(e.series[v] ?? [], ct);
    return { id: v, points: ce, d: ss(ce, c, u), color: X };
  }, I = A(f, "var(--primary-color)"), le = i.showChannels ? p.filter((v) => v !== f).map((v, X) => A(v, uo(X))) : [], Te = e.forecast, Js = Te ? po(Zr(Te, c, u, ct)) : "", Qs = Te ? ss(We(Jr(Te, "p50"), ct), c, u) : "", Me = [];
  for (const [, , v] of e.day_types) Me.includes(v) || Me.push(v);
  const At = (v) => rs[Me.indexOf(v) % rs.length], ei = lt(
    e.day_types.map(([v, X, ce]) => [v, X, ce]),
    c,
    a
  ).map((v) => ({ ...v, fill: At(v.tag) })), ti = lt(
    Object.entries(e.lights).flatMap(
      ([v, X]) => X.map(([ce, ii]) => [ce, ii, v])
    ),
    c,
    a
  ), si = lt(e.plan, c, a);
  return {
    busId: f,
    bus: I,
    children: le,
    band: Js,
    p50: Qs,
    dayTypes: ei,
    legend: Me.map((v) => ({ tag: v, fill: At(v) })),
    lights: ti,
    plan: si,
    x: c,
    y: u,
    t0: o,
    t1: a,
    plotW: n,
    plotH: r
  };
}
let $ = class extends b {
  constructor() {
    super(...arguments), this.groupId = null, this.heading = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = Xe, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = no, this.loaded = null, this.error = null, this.seq = 0, this.memo = null;
  }
  get height() {
    return this.narrow ? oo : ro;
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
      this.paused || document.visibilityState !== "visible" || this.load();
    }, ao), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.observer?.disconnect(), this.observer = void 0, this.timer !== void 0 && clearInterval(this.timer), this.timer = void 0;
  }
  willUpdate(e) {
    const t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), s = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
    (t || s) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load());
  }
  query(e) {
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = Kr(t, this.range, this.horizon);
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
    const s = this.query(t), i = Qr(s), n = G.get(i);
    if (n && Date.now() - n.at < Zs) {
      this.seq++, this.loaded = { q: s, data: n.data }, this.error = null, os(i, n.data);
      return;
    }
    let r = ht.get(i);
    r || (r = Oi(e, s), ht.set(i, r), r.then(
      (a) => os(i, a),
      () => {
      }
    ).finally(() => ht.delete(i)));
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
    const i = mo(
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
    return ut(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
  }
  emitSettings() {
    this.dispatchEvent(
      wn({
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
    const i = e.currentTarget.getBoundingClientRect(), n = i.width > 0 ? this.width / i.width : 1, r = (e.clientX - i.left) * n - ue, o = ut(r / t.plotW, 0, 1);
    return t.t0 + o * (t.t1 - t.t0);
  }
  onMove(e) {
    const t = this.paths;
    !t || t.bus.points.length === 0 || (this.cursorIndex = is(t.bus.points, this.timeAt(e, t)));
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
    this.cursorIndex = this.cursorIndex === null ? i > 0 ? 0 : s : ut(this.cursorIndex + i, 0, s);
  }
  renderChips() {
    const e = this.learningHint;
    return l`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${co.map(
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
          ${ho.map((t) => {
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
        ${e ? l`<span class="muted hint" title=${e}>${e}</span>` : d}
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
    const t = this.width, s = this.height, i = e.x(this.nowAt(e)), n = e.plotH + io, r = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), o = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
    return l`
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
      (a) => P`
            <line class="grid" x1=${ue} y1=${e.y(this.maxValue * a)} x2=${t} y2=${e.y(this.maxValue * a)}></line>
            <text class="ytick" x=${ue - 4} y=${e.y(this.maxValue * a) + 3} text-anchor="end">
              ${dt(this.maxValue * a)}
            </text>
          `
    )}
        <g transform="translate(${ue},0)">
          ${e.dayTypes.map(
      (a) => P`<rect
              class="daytype"
              x=${a.x0}
              y="0"
              width=${Math.max(0, a.x1 - a.x0)}
              height=${e.plotH}
              fill=${a.fill}
            ></rect>`
    )}
          ${e.band ? P`<polygon class="band" points=${e.band}></polygon>` : d}
          ${e.p50 ? P`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : d}
          ${e.children.map((a) => P`<path class="child" d=${a.d} stroke=${a.color}></path>`)}
          ${e.bus.d ? P`<path class="bus" d=${e.bus.d}></path>` : d}
          ${this.showLights ? e.lights.map(
      (a) => P`<rect
                  class="light"
                  x=${a.x0}
                  y=${n}
                  width=${Math.max(1, a.x1 - a.x0)}
                  height=${ns}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`
    ) : d}
          ${this.showLights ? e.plan.map(
      (a) => P`<rect
                  class="plan"
                  x=${a.x0}
                  y=${n}
                  width=${Math.max(1, a.x1 - a.x0)}
                  height=${ns}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`
    ) : d}
          <line class="now" x1=${i} y1="0" x2=${i} y2=${e.plotH}></line>
          <text class="now-label" x=${i + 3} y="10">now</text>
          ${r === null ? d : P`<line class="cursor" x1=${r} y1="0" x2=${r} y2=${e.plotH}></line>`}
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
      ([i, n]) => P`<text class="xlabel" x=${i * e.plotW} y=${t} text-anchor=${n}>
        ${fo(e.t0 + i * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`
    );
  }
  renderTooltip(e) {
    const t = this.cursorIndex;
    if (t === null) return d;
    const s = e.bus.points[t];
    if (!s) return d;
    const [i, n] = s, o = (ue + e.x(i)) / this.width * 100, a = this.loaded?.data.day_types.find(([c, u]) => i >= c && i < u)?.[2];
    return l`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${new Date(i * 1e3).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${dt(n)}</span>
        </div>
        ${e.children.map((c) => {
      const u = is(c.points, i), p = c.points[u];
      return p ? l`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${c.color}"></span>
                  <span class="tt-name">${c.id}</span>
                  <span class="tt-value">${dt(p[1])}</span>
                </div>
              ` : d;
    })}
        ${a ? l`<div class="tt-daytype muted">${a}</div>` : d}
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
          ` : d}
      ${this.error ? l`<div class="error">Timeline: ${this.error}</div>` : d}
      ${e ? this.renderTooltip(e) : d}
    `;
  }
};
$.styles = [
  L,
  _`
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
], $.prototype, "heading", 2);
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
  h({ attribute: !1 })
], $.prototype, "profileState", 2);
x([
  h({ type: Number })
], $.prototype, "minDays", 2);
x([
  h({ type: Boolean, reflect: !0 })
], $.prototype, "narrow", 2);
x([
  h({ type: Boolean })
], $.prototype, "paused", 2);
x([
  g()
], $.prototype, "cursorIndex", 2);
x([
  g()
], $.prototype, "width", 2);
x([
  g()
], $.prototype, "loaded", 2);
x([
  g()
], $.prototype, "error", 2);
$ = x([
  S("al-timeline")
], $);
var go = Object.defineProperty, vo = Object.getOwnPropertyDescriptor, j = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? vo(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && go(t, s, n), n;
};
const as = ["envelope", "gain", "to", "key"], ls = ["name", "mix", "null_handling", "gain"], bo = 5, $o = (e) => e[e.length - 2] === "stimuli";
let M = class extends b {
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
    const { config: t, path: s } = this, i = t && s ? J(t, s) : void 0;
    i && (Bs(i.to, this.toText) || (this.toText = null));
  }
  emitChange(e, t) {
    this.dispatchEvent(re(e, t));
  }
  /** Writes one nullable field of the selected node, e.g. an envelope or output override. */
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(k(s, [...i, e], t), `${m(i)}:${e}`);
  }
  onChannelForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = J(t, s);
    if (!i) return;
    const n = e.detail?.value ?? {};
    this.toText = String(n.to ?? "");
    const r = js(i, n), o = Gs(r, i);
    o !== void 0 && this.emitChange(k(t, s, r), `${m(s)}:${o}`);
  }
  onBusForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = D(t, s);
    if (!i) return;
    const n = Is(i, e.detail?.value ?? {}), r = Ds(n, i);
    r !== void 0 && this.emitChange(k(t, s, n), `${m(s)}:${r}`);
  }
  /** The switch is Home Assistant's, so this reports the wanted state and lets the shell call it. */
  onSim(e, t) {
    this.dispatchEvent(ks(e, t.target.checked === !0));
  }
  onRebuild() {
    this.dispatchEvent(Es());
  }
  renderChannel(e, t) {
    const s = J(e, t);
    if (!s) return l`<ha-card><span class="muted">This channel no longer exists.</span></ha-card>`;
    const i = me(this.errors, t), n = this.errors.filter((o) => o.path === m(t)), r = _t(e, s);
    return l`
      <ha-card header=${s.key ?? s.entity}>
        ${n.map((o) => l`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${zs(s, this.toText, as)}
              .schema=${Fs(e, as)}
              .error=${i}
              .computeLabel=${Ns}
              .computeHelper=${Us}
              @value-changed=${this.onChannelForm}
            ></ha-form>
            ${this.renderVoice(e, t, s)}
          </div>
          <div class="col">
            ${Hs.map(
      (o) => l`<al-override-field
                .hass=${this.hass}
                .label=${o.label}
                .kind=${o.kind}
                .selector=${o.selector}
                .value=${s[o.name]}
                .inherited=${r[o.name]}
                .inheritedFrom=${Vs(e, s, o.name)}
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
    const i = D(e, Ze(t)), n = this.live?.voices[i?.id ?? ""]?.find((o) => o.label === (s.key ?? s.entity));
    if (!n) return d;
    const r = Ws(this.live?.now, n.phase_ends);
    return l`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${n.phase}">${n.phase}</span>
      <span class="chip value">${n.value.toFixed(2)}</span>
      ${r !== null ? l`<span class="muted chip">ends in ${r}</span>` : d}
      <span class="dot ${n.gate ? "gated" : ""}" title=${n.gate ? "Gate open" : "Gate closed"}></span>
    </div>`;
  }
  renderBus(e, t) {
    const s = D(e, t);
    if (!s) return l`<ha-card><span class="muted">This bus no longer exists.</span></ha-card>`;
    const i = t.length === 2, n = me(this.errors, t), r = this.errors.filter((o) => o.path === m(t));
    return l`
      <ha-card header=${s.name ?? s.id}>
        ${r.map((o) => l`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${Rs(s, i, ls)}
              .schema=${Ms(s, i, ls)}
              .error=${n}
              .computeLabel=${Ps}
              .computeHelper=${Cs}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${Ls}
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
              .selector=${Os}
              .value=${s.precision === null ? null : String(s.precision)}
              .inherited=${String(e.defaults.precision)}
              .inheritedFrom=${"defaults"}
              .error=${n.precision}
              @value-changed=${(o) => this.setField("precision", o.detail.value === null ? null : Number(o.detail.value))}
            ></al-override-field>
          </div>
          ${this.renderStatus(e, s)}
        </div>
      </ha-card>
    `;
  }
  renderStatus(e, t) {
    const s = t.id, i = this.live?.groups[s]?.lights ?? 0, n = this.hass?.states[xt(s)], r = this.simLog?.blocked[s] ?? null, o = (this.simLog?.entries ?? []).filter((a) => a.group_id === s).sort((a, c) => c.t - a.t).slice(0, bo);
    return l`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${i} light${i === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${i > 0 ? l`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${n?.state === "on"}
                .disabled=${n === void 0}
                title=${n === void 0 ? "No simulation switch for this bus" : "Presence simulation"}
                @change=${(a) => this.onSim(s, a)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : d}
        ${r !== null ? l`<div class="muted blocked">Blocked: ${r}</div>` : d}
        ${this.renderSensor("expected", "Expected", bs(s))}
        ${this.renderSensor("anomaly", "Anomaly", Di(s))}
        <div class="muted readiness">${this.readiness(e, s)}</div>
        ${o.length > 0 ? l`<ol class="log">
              ${o.map((a) => this.renderLogEntry(a))}
            </ol>` : l`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
  }
  /** One of the pattern sensors, with the day type it was measured against. */
  renderSensor(e, t, s) {
    const i = this.hass?.states[s], n = i?.attributes.day_type;
    return l`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${i?.state ?? "—"}</span>
      ${typeof n == "string" ? l`<span class="muted">${n}</span>` : d}
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
    const i = s.profile.groups[t]?.days ?? 0, n = e.defaults.patterns?.min_days ?? Xe;
    return s.ready[t] === !0 ? `Profile ready · ${i} days learned` : `Learning… ${i}/${n} days`;
  }
  render() {
    const { config: e, path: t } = this;
    return !e || !t || t.length === 0 ? l`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : $o(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
  }
};
M.styles = [
  L,
  _`
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
    `
];
j([
  h({ attribute: !1 })
], M.prototype, "hass", 2);
j([
  h({ attribute: !1 })
], M.prototype, "config", 2);
j([
  h({ attribute: !1 })
], M.prototype, "path", 2);
j([
  h({ attribute: !1 })
], M.prototype, "errors", 2);
j([
  h({ attribute: !1 })
], M.prototype, "live", 2);
j([
  h({ attribute: !1 })
], M.prototype, "profileState", 2);
j([
  h({ attribute: !1 })
], M.prototype, "simLog", 2);
j([
  g()
], M.prototype, "toText", 2);
M = j([
  S("al-strip-controls")
], M);
var yo = Object.defineProperty, xo = Object.getOwnPropertyDescriptor, xe = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? xo(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && yo(t, s, n), n;
};
const wo = 50;
function cs(e) {
  const t = [], s = (i) => {
    t.push({ id: i.id, label: i.name ?? i.id }), i.children.forEach(s);
  };
  return e?.groups.forEach(s), t;
}
const hs = (e) => new Date(e * 1e3).toLocaleDateString();
let q = class extends b {
  constructor() {
    super(...arguments), this.profileState = null, this.simLog = null, this.force = !1;
  }
  onRebuild() {
    this.dispatchEvent(Es(this.force));
  }
  renderStatus() {
    const e = this.profileState;
    if (!e) return l`<div class="status muted">Profile not loaded yet.</div>`;
    const { producer: t, generated_at: s, training_window: i, day_types: n, slot_minutes: r } = e.profile;
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
          <span class="window">${hs(i[0])} – ${hs(i[1])}</span>
        </div>
        <div class="muted">${n.join(", ")} · ${r}-minute slots</div>
      </div>
    `;
  }
  renderReadiness() {
    const e = this.profileState, t = cs(this.config);
    if (!e || t.length === 0)
      return l`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
    const s = this.config?.defaults.patterns?.min_days ?? Xe;
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
          ${t.map((i) => this.renderRow(i, e, s))}
        </tbody>
      </table>
    `;
  }
  renderRow(e, t, s) {
    const i = t.ready[e.id] === !0, n = t.profile.groups[e.id]?.days ?? 0, r = this.hass?.states[bs(e.id)]?.state;
    return l`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${i ? "yes" : "no"}" title=${i ? "Ready" : `Needs ${s} days`}>
        ${i ? "✓" : "✗"}
      </td>
      <td class="days">${n}</td>
      <td class="expected">${r ?? "—"}</td>
    </tr>`;
  }
  /** Why a group cannot be simulated right now; the first failing precondition, per group. */
  renderBlocked() {
    const e = Object.entries(this.simLog?.blocked ?? {}).filter(
      (i) => typeof i[1] == "string"
    );
    if (e.length === 0) return d;
    const t = cs(this.config), s = (i) => t.find((n) => n.id === i)?.label ?? i;
    return l`<ul class="blocked">
      ${e.map(([i, n]) => l`<li><span class="group">${s(i)}:</span> <span>${n}</span></li>`)}
    </ul>`;
  }
  renderLog() {
    const e = [...this.simLog?.entries ?? []].sort((t, s) => s.t - t.t).slice(0, wo);
    return e.length === 0 ? l`<div class="muted log-empty">No simulated light changes yet.</div>` : l`<ol class="log">
      ${e.map((t) => this.renderEntry(t))}
    </ol>`;
  }
  renderEntry(e) {
    return l`<li>
      <span class="muted">${new Date(e.t * 1e3).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
      ${e.brightness !== null ? l`<span class="muted">${e.brightness}</span>` : d}
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
q.styles = [
  L,
  _`
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
xe([
  h({ attribute: !1 })
], q.prototype, "hass", 2);
xe([
  h({ attribute: !1 })
], q.prototype, "config", 2);
xe([
  h({ attribute: !1 })
], q.prototype, "profileState", 2);
xe([
  h({ attribute: !1 })
], q.prototype, "simLog", 2);
xe([
  g()
], q.prototype, "force", 2);
q = xe([
  S("al-patterns")
], q);
