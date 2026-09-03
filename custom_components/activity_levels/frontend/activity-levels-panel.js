const tt = globalThis, Jt = tt.ShadowRoot && (tt.ShadyCSS === void 0 || tt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Zt = /* @__PURE__ */ Symbol(), $s = /* @__PURE__ */ new WeakMap();
let $i = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Zt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Jt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = $s.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && $s.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const br = (e) => new $i(typeof e == "string" ? e : e + "", void 0, Zt), A = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[n + 1], e[0]);
  return new $i(s, e, Zt);
}, yr = (e, t) => {
  if (Jt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), r = tt.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, e.appendChild(i);
  }
}, xs = Jt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return br(s);
})(e) : e;
const { is: $r, defineProperty: xr, getOwnPropertyDescriptor: wr, getOwnPropertyNames: _r, getOwnPropertySymbols: kr, getPrototypeOf: Er } = Object, gt = globalThis, ws = gt.trustedTypes, Sr = ws ? ws.emptyScript : "", Ar = gt.reactiveElementPolyfillSupport, He = (e, t) => e, it = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Sr : null;
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
} }, Qt = (e, t) => !$r(e, t), _s = { attribute: !0, type: String, converter: it, reflect: !1, useDefault: !1, hasChanged: Qt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), gt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Se = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = _s) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(t, i, s);
      r !== void 0 && xr(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: r, set: n } = wr(this.prototype, t) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: r, set(o) {
      const a = r?.call(this);
      n?.call(this, o), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? _s;
  }
  static _$Ei() {
    if (this.hasOwnProperty(He("elementProperties"))) return;
    const t = Er(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(He("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(He("properties"))) {
      const s = this.properties, i = [..._r(s), ...kr(s)];
      for (const r of i) this.createProperty(r, s[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, r] of s) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const r = this._$Eu(s, i);
      r !== void 0 && this._$Eh.set(r, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) s.unshift(xs(r));
    } else t !== void 0 && s.push(xs(t));
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
    return yr(t, this.constructor.elementStyles), t;
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
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : it).toAttribute(s, i.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : it;
      this._$Em = r;
      const a = o.fromAttribute(s, n.type);
      this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, r = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? Qt)(n, s) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: r, wrapped: n }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? s ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, n] of i) {
        const { wrapped: o } = n, a = this[r];
        o !== !0 || this._$AL.has(r) || a === void 0 || this.C(r, void 0, n, a);
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
Se.elementStyles = [], Se.shadowRootOptions = { mode: "open" }, Se[He("elementProperties")] = /* @__PURE__ */ new Map(), Se[He("finalized")] = /* @__PURE__ */ new Map(), Ar?.({ ReactiveElement: Se }), (gt.reactiveElementVersions ??= []).push("2.1.2");
const es = globalThis, ks = (e) => e, rt = es.trustedTypes, Es = rt ? rt.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, xi = "$lit$", ie = `lit$${Math.random().toFixed(9).slice(2)}$`, wi = "?" + ie, Or = `<${wi}>`, be = document, Be = () => be.createComment(""), We = (e) => e === null || typeof e != "object" && typeof e != "function", ts = Array.isArray, Pr = (e) => ts(e) || typeof e?.[Symbol.iterator] == "function", At = `[ 	
\f\r]`, je = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ss = /-->/g, As = />/g, ue = RegExp(`>|${At}(?:([^\\s"'>=/]+)(${At}*=${At}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Os = /'/g, Ps = /"/g, _i = /^(?:script|style|textarea|title)$/i, ki = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), l = ki(1), S = ki(2), ye = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), Cs = /* @__PURE__ */ new WeakMap(), pe = be.createTreeWalker(be, 129);
function Ei(e, t) {
  if (!ts(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Es !== void 0 ? Es.createHTML(t) : t;
}
const Cr = (e, t) => {
  const s = e.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = je;
  for (let a = 0; a < s; a++) {
    const c = e[a];
    let h, f, p = -1, v = 0;
    for (; v < c.length && (o.lastIndex = v, f = o.exec(c), f !== null); ) v = o.lastIndex, o === je ? f[1] === "!--" ? o = Ss : f[1] !== void 0 ? o = As : f[2] !== void 0 ? (_i.test(f[2]) && (r = RegExp("</" + f[2], "g")), o = ue) : f[3] !== void 0 && (o = ue) : o === ue ? f[0] === ">" ? (o = r ?? je, p = -1) : f[1] === void 0 ? p = -2 : (p = o.lastIndex - f[2].length, h = f[1], o = f[3] === void 0 ? ue : f[3] === '"' ? Ps : Os) : o === Ps || o === Os ? o = ue : o === Ss || o === As ? o = je : (o = ue, r = void 0);
    const $ = o === ue && e[a + 1].startsWith("/>") ? " " : "";
    n += o === je ? c + Or : p >= 0 ? (i.push(h), c.slice(0, p) + xi + c.slice(p) + ie + $) : c + ie + (p === -2 ? a : $);
  }
  return [Ei(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Ge {
  constructor({ strings: t, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, c = this.parts, [h, f] = Cr(t, s);
    if (this.el = Ge.createElement(h, i), pe.currentNode = this.el.content, s === 2 || s === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = pe.nextNode()) !== null && c.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(xi)) {
          const v = f[o++], $ = r.getAttribute(p).split(ie), x = /([.?@])?(.*)/.exec(v);
          c.push({ type: 1, index: n, name: x[2], strings: $, ctor: x[1] === "." ? Lr : x[1] === "?" ? Dr : x[1] === "@" ? Mr : mt }), r.removeAttribute(p);
        } else p.startsWith(ie) && (c.push({ type: 6, index: n }), r.removeAttribute(p));
        if (_i.test(r.tagName)) {
          const p = r.textContent.split(ie), v = p.length - 1;
          if (v > 0) {
            r.textContent = rt ? rt.emptyScript : "";
            for (let $ = 0; $ < v; $++) r.append(p[$], Be()), pe.nextNode(), c.push({ type: 2, index: ++n });
            r.append(p[v], Be());
          }
        }
      } else if (r.nodeType === 8) if (r.data === wi) c.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(ie, p + 1)) !== -1; ) c.push({ type: 7, index: n }), p += ie.length - 1;
      }
      n++;
    }
  }
  static createElement(t, s) {
    const i = be.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Pe(e, t, s = e, i) {
  if (t === ye) return t;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const n = We(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(e), r._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (t = Pe(e, r._$AS(e, t.values), r, i)), t;
}
class Tr {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (t?.creationScope ?? be).importNode(s, !0);
    pe.currentNode = r;
    let n = pe.nextNode(), o = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let h;
        c.type === 2 ? h = new Ye(n, n.nextSibling, this, t) : c.type === 1 ? h = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (h = new Nr(n, this, t)), this._$AV.push(h), c = i[++a];
      }
      o !== c?.index && (n = pe.nextNode(), o++);
    }
    return pe.currentNode = be, r;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class Ye {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, i, r) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    t = Pe(this, t, s), We(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== ye && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Pr(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && We(this._$AH) ? this._$AA.nextSibling.data = t : this.T(be.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Ge.createElement(Ei(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const n = new Tr(r, this), o = n.u(this.options);
      n.p(s), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let s = Cs.get(t.strings);
    return s === void 0 && Cs.set(t.strings, s = new Ge(t)), s;
  }
  k(t) {
    ts(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const n of t) r === s.length ? s.push(i = new Ye(this.O(Be()), this.O(Be()), this, this.options)) : i = s[r], i._$AI(n), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = ks(t).nextSibling;
      ks(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class mt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, r, n) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = s, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = u;
  }
  _$AI(t, s = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = Pe(this, t, s, 0), o = !We(t) || t !== this._$AH && t !== ye, o && (this._$AH = t);
    else {
      const a = t;
      let c, h;
      for (t = n[0], c = 0; c < n.length - 1; c++) h = Pe(this, a[i + c], s, c), h === ye && (h = this._$AH[c]), o ||= !We(h) || h !== this._$AH[c], h === u ? t = u : t !== u && (t += (h ?? "") + n[c + 1]), this._$AH[c] = h;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Lr extends mt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Dr extends mt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Mr extends mt {
  constructor(t, s, i, r, n) {
    super(t, s, i, r, n), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = Pe(this, t, s, 0) ?? u) === ye) return;
    const i = this._$AH, r = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== u && (i === u || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Nr {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Pe(this, t);
  }
}
const Rr = es.litHtmlPolyfillSupport;
Rr?.(Ge, Ye), (es.litHtmlVersions ??= []).push("3.3.3");
const Ir = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = s?.renderBefore ?? null;
    i._$litPart$ = r = new Ye(t.insertBefore(Be(), n), n, void 0, s ?? {});
  }
  return r._$AI(e), r;
};
const ss = globalThis;
let b = class extends Se {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ir(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ye;
  }
};
b._$litElement$ = !0, b.finalized = !0, ss.litElementHydrateSupport?.({ LitElement: b });
const jr = ss.litElementPolyfillSupport;
jr?.({ LitElement: b });
(ss.litElementVersions ??= []).push("4.2.2");
const E = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
const Fr = { attribute: !0, type: String, converter: it, reflect: !1, hasChanged: Qt }, Hr = (e = Fr, t, s) => {
  const { kind: i, metadata: r } = s;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), i === "accessor") {
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
function d(e) {
  return (t, s) => typeof s == "object" ? Hr(e, t, s) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(e, t, s);
}
function g(e) {
  return d({ ...e, state: !0, attribute: !1 });
}
const Si = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Ur = (e) => e.callWS({
  type: "activity_levels/config/get"
}).then((t) => ({ config: t.config, inferred: t.inferred ?? [], warnings: t.warnings ?? [] })), Ai = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(Si);
async function zr(e, t) {
  try {
    return Si(await e.callWS({ type: "activity_levels/config/save", config: t }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const Br = (e) => e.callWS({ type: "activity_levels/state" }), Wr = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), Gr = (e) => e.callWS({ type: "activity_levels/profile/get" }), Vr = (e, t = !1) => e.callWS({ type: "activity_levels/profile/rebuild", force: t }), qr = (e, t, s = 50) => e.callWS({
  type: "activity_levels/simulation/log",
  limit: s
}), Kr = (e, t, s) => e.callWS({ type: "activity_levels/level/set", group_id: t, value: s }).then((i) => i.value), Yr = (e, t, s) => e.callWS({ type: "activity_levels/mute", group_id: t, muted: s }).then((i) => i.muted), Xr = (e, t) => e.callWS({ type: "activity_levels/reset", group_id: t }).then(() => {
}), Jr = (e) => e.callWS({ type: "activity_levels/topology" }), Zr = (e, t, s) => e.callWS({ type: "activity_levels/topology/paths", from: t, to: s }).then((i) => i.paths), Qr = (e) => e.callWS({ type: "activity_levels/presence/state" }), en = (e, t, s, i) => e.callService(t, s, i), vt = 14, Oi = (e) => `switch.${e}_presence_simulation`, Pi = (e) => `sensor.${e}_expected_activity`, tn = (e) => `sensor.${e}_activity_anomaly`, sn = [
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
], Ts = ["ha-yaml-editor", "ha-state-icon"], rn = 2500, nn = 8e3;
function on(e) {
  let t;
  return { promise: new Promise((i) => {
    t = setTimeout(i, e);
  }), cancel: () => clearTimeout(t) };
}
async function Ls(e, t, s) {
  const i = on(t);
  try {
    return await Promise.race([e, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function an() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function ln() {
  if (customElements.get("ha-yaml-editor")) return;
  let e;
  try {
    await customElements.whenDefined("ha-selector"), e = document.createElement("ha-selector"), e.selector = { object: {} }, e.style.display = "none", document.body.appendChild(e), await customElements.whenDefined("ha-yaml-editor");
  } catch {
  } finally {
    e?.remove();
  }
}
async function cn(e = nn, t = rn) {
  const s = [...sn, ...Ts];
  if (s.every((a) => customElements.get(a))) return { ok: !0, missing: [], optionalMissing: [] };
  await Ls(
    Promise.all([an(), ln()]).then(() => {
    }),
    t,
    void 0
  );
  const i = await Promise.all(
    s.map(
      (a) => Ls(
        customElements.whenDefined(a).then(() => !0),
        e,
        !1
      )
    )
  ), r = s.filter((a, c) => !i[c]), n = Ts, o = r.filter((a) => !n.includes(a));
  return {
    ok: o.length === 0,
    missing: o,
    optionalMissing: r.filter((a) => n.includes(a))
  };
}
const dn = ["open", "door", "stairs", "exterior_door"], Ci = "door", fe = {
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
}, Ds = {
  open: "Open (no door)",
  door: "Door",
  stairs: "Stairs",
  exterior_door: "Exterior door"
}, hn = {
  property: ["property", "structure", "outside"],
  structure: ["floor", "area"],
  floor: ["area"],
  area: ["area"],
  outside: ["outside"]
}, un = ["property"], Ve = /* @__PURE__ */ new Set(["area", "outside"]), nt = (e) => e === null ? un : hn[e];
function pn(e, t) {
  return t.length <= e.length ? !1 : e.every((s, i) => t[i] === s);
}
function V(e, t) {
  let s = e;
  for (const i of t) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function Ms(e) {
  return Array.isArray(e) ? [...e] : { ...e };
}
function bt(e, t, s) {
  if (t.length === 0) throw new Error("empty path");
  const i = Ms(e);
  let r = i;
  for (let n = 0; n < t.length - 1; n++) {
    const o = t[n], a = Ms(r[o]);
    r[o] = a, r = a;
  }
  return s(r, t[t.length - 1]), i;
}
function P(e, t, s) {
  return bt(e, t, (i, r) => {
    i[r] = s;
  });
}
function yt(e, t) {
  return bt(e, t, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function ot(e, t, s, i) {
  return bt(e, [...t, s], (r) => {
    r.splice(s, 0, i);
  });
}
function fn(e, t, s, i) {
  return bt(e, [...t, s], (r) => {
    const n = r, [o] = n.splice(s, 1);
    n.splice(i, 0, o);
  });
}
function gn(e, t, s, i) {
  return i === s || i === s + 1 ? e : fn(e, t, s, i > s ? i - 1 : i);
}
const mn = 1e3;
class vn {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < mn || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const te = (e) => ({ ok: !1, reason: e }), at = (e) => ({
  list: e.slice(0, -1),
  index: e[e.length - 1]
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
  if (o) return { ok: !0 };
  const a = r;
  if (pn(t, s) || lt(t, s.slice(0, -1)))
    return te("a group cannot go into itself");
  const c = s.slice(0, -1);
  let h;
  if (s.length === 1)
    h = null;
  else {
    const p = V(e, c);
    if (p === void 0) return te("that group is gone");
    h = p.kind;
  }
  return nt(h).includes(a.kind) ? { ok: !0 } : te(
    h === null ? "every root group is a property" : `a ${h} cannot contain a ${a.kind}`
  );
}
const lt = (e, t) => e.length === t.length && e.every((s, i) => t[i] === s);
function Ti(e, t, s) {
  const { list: i, index: r } = at(e), n = [...t], o = n[i.length];
  return i.length < n.length && lt(i, n.slice(0, i.length)) && typeof o == "number" && o > r && (n[i.length] = o - 1), { parent: n, index: lt(i, t) && s > r ? s - 1 : s };
}
function bn(e, t, s, i) {
  const { index: r } = at(t);
  if (lt(at(t).list, s) && (i === r || i === r + 1)) return e;
  const n = V(e, t), o = yt(e, t), { parent: a, index: c } = Ti(t, s, i);
  return ot(o, a, c, n);
}
const yn = (e, t) => ({
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
  presence: Ut(),
  stimuli: [],
  children: []
}), $n = "presence", Ut = () => ({
  gain: 1,
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
}), Li = (e) => typeof e == "string" ? e : e.id, Di = (e) => typeof e != "string" && e.one_way, Mi = (e) => typeof e == "string" ? Ci : e.connection;
function ct(e) {
  const t = [], s = (i, r, n) => {
    t.push({ group: i, path: r, parent: n }), i.children.forEach((o, a) => s(o, [...r, "children", a], i));
  };
  return e.groups.forEach((i, r) => s(i, ["groups", r], null)), t;
}
function Is(e, t) {
  const s = [];
  for (const { group: i } of ct(e))
    if (i.id !== t)
      for (const r of i.adjacent ?? [])
        Li(r) === t && s.push({
          group: i,
          edge: {
            id: t,
            connection: Mi(r),
            one_way: Di(r)
          }
        });
  return s;
}
const xn = {
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
  scanner_areas: {}
}, J = (e) => ({
  ...xn,
  ...e.presence ?? {}
}), wn = (e) => ({
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
}), _n = (e) => e.label !== null && e.label.trim() !== "" ? e.label : e.id, kn = (e) => ({
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
}), is = (e, t) => t.precision ?? e.defaults.precision;
function $t(e, t) {
  return e.toFixed(Math.min(100, Math.max(0, Math.trunc(t))));
}
function rs(e) {
  const t = /* @__PURE__ */ new Set(), s = (i) => {
    t.add(i.id), i.children.forEach(s);
  };
  return e.groups.forEach(s), t;
}
function En(e) {
  return new Set(
    ct(e).filter(({ group: t }) => Ve.has(t.kind)).map(({ group: t }) => t.id)
  );
}
function Ni(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const Sn = (e) => new Set(e.envelopes.map((t) => t.id));
function Ri(e, t) {
  const s = Ni(t);
  if (!e.has(s)) return s;
  let i = 2;
  for (; e.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const Ii = (e, t) => Ri(rs(e), t), An = (e, t) => Ri(Sn(e), t);
function On(e, t) {
  const s = [], i = (r) => {
    r.stimuli.some((n) => n.envelope === t) && s.push(r.id), r.children.forEach(i);
  };
  return e.groups.forEach(i), { defaults: e.defaults.envelope === t, groups: s };
}
function Pn(e, t, s) {
  const i = e.envelopes[t];
  if (!i || i.id === s) return e;
  const r = i.id, n = e.envelopes.map((a, c) => c === t ? { ...a, id: s } : a);
  if (e.envelopes.some((a, c) => c !== t && a.id === r)) return { ...e, envelopes: n };
  const o = (a) => ({
    ...a,
    stimuli: a.stimuli.map((c) => c.envelope === r ? { ...c, envelope: s } : c),
    children: a.children.map(o)
  });
  return {
    ...e,
    defaults: e.defaults.envelope === r ? { ...e.defaults, envelope: s } : e.defaults,
    envelopes: n,
    groups: e.groups.map(o)
  };
}
const L = (e, t) => V(e, t), js = (e, t) => V(e, t), ve = (e) => e.slice(0, -2), ji = (e) => e[e.length - 2] === "stimuli" ? ve(e) : e, Fi = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function Hi(e, t) {
  const s = Fi(e, t.envelope), i = e.defaults, r = (n, o, a) => n ?? o ?? a;
  return {
    attack: r(t.attack, s?.attack, 0),
    decay: r(t.decay, s?.decay, 0),
    sustain: r(t.sustain, s?.sustain, 1),
    release: r(t.release, s?.release, 1800),
    impulse: r(t.impulse, s?.impulse, !1),
    retrigger: r(t.retrigger, s?.retrigger, i.retrigger),
    stack: r(t.stack, s?.stack, i.stack),
    unavailable: r(t.unavailable, s?.unavailable, i.unavailable),
    debounce: r(t.debounce, s?.debounce, i.debounce)
  };
}
const Ui = "activity_levels.mixer.expanded", Cn = (e, t) => e.length === t.length && e.every((s, i) => s === t[i]), zi = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function Tn(e) {
  return { expanded: new Set(e.groups.map((t) => t.id)), selection: zi(e) };
}
function dt(e, t) {
  const s = [], i = (r, n, o) => {
    r.forEach((a, c) => {
      const h = [...n, c], f = a.children.length > 0, p = f && t.expanded.has(a.id);
      s.push({ path: h, id: a.id, depth: o, hasChildren: f, expanded: p }), p && i(a.children, [...h, "children"], o + 1);
    });
  };
  return i(e.groups, ["groups"], 0), s;
}
function Ln(e, t) {
  const s = dt(e, t), i = [], r = [], n = [], o = [];
  let a = 0;
  const c = (h) => {
    for (; o.length > 0 && o[o.length - 1].depth >= h; )
      o.pop().band.colEnd = r.length + 1;
  };
  for (const h of s) {
    if (c(h.depth), r.push("strip"), i.push(r.length), !h.hasChildren) continue;
    const f = L(e, h.path)?.name ?? h.id;
    if (h.expanded) {
      const p = { id: h.id, label: f, depth: h.depth, colStart: r.length, colEnd: 0, expanded: !0 };
      n.push(p), o.push({ band: p, depth: h.depth }), a = Math.max(a, h.depth + 1);
    } else
      r.push("tab"), n.push({
        id: h.id,
        label: f,
        depth: h.depth,
        colStart: r.length,
        colEnd: r.length + 1,
        expanded: !1
      });
  }
  return c(0), { columns: i, kinds: r, bands: n, rows: a };
}
function Fs(e, t) {
  switch (t.type) {
    case "toggle": {
      const s = new Set(e.expanded);
      return s.delete(t.id) || s.add(t.id), { ...e, expanded: s };
    }
    case "select":
      return { ...e, selection: t.path };
    case "arrow": {
      const s = dt(t.config, e);
      if (s.length === 0) return e;
      const i = e.selection, r = i === null ? -1 : s.findIndex((a) => Cn(a.path, i)), o = (((r === -1 && t.delta < 0 ? s.length : r) + t.delta) % s.length + s.length) % s.length;
      return { ...e, selection: s[o].path };
    }
    case "home":
    case "end": {
      const s = dt(t.config, e);
      return s.length === 0 ? e : { ...e, selection: (t.type === "home" ? s[0] : s[s.length - 1]).path };
    }
    case "sync": {
      const { config: s } = t, i = rs(s), r = [...e.expanded].filter((a) => i.has(a)), n = r.length === e.expanded.size ? e.expanded : new Set(r), o = e.selection !== null && V(s, e.selection) !== void 0 ? e.selection : zi(s);
      return { expanded: n, selection: o };
    }
  }
}
function Dn(e, t, s) {
  if (s === null) return t;
  const i = s[s.length - 2] === "stimuli" ? s.slice(0, -2) : s, r = new Set(t);
  let n = !1;
  for (let o = 2; o + 2 <= i.length; o += 2) {
    const a = V(e, i.slice(0, o));
    if (a === void 0 || typeof a.id != "string") break;
    r.has(a.id) || (r.add(a.id), n = !0);
  }
  return n ? r : t;
}
function Mn(e) {
  let t;
  try {
    t = localStorage.getItem(Ui);
  } catch {
    return null;
  }
  if (t === null) return null;
  try {
    const s = JSON.parse(t);
    if (!Array.isArray(s)) return null;
    const i = rs(e);
    return new Set(s.filter((r) => typeof r == "string" && i.has(r)));
  } catch {
    return null;
  }
}
function Hs(e) {
  try {
    localStorage.setItem(Ui, JSON.stringify([...e]));
  } catch {
  }
}
function Nn(e) {
  const t = Tn(e), s = Mn(e);
  return s === null ? t : { ...t, expanded: s };
}
const Bi = "activity_levels.mixer.edit";
function Rn() {
  try {
    return localStorage.getItem(Bi) === "true";
  } catch {
    return !1;
  }
}
function In(e) {
  try {
    localStorage.setItem(Bi, e ? "true" : "false");
  } catch {
  }
}
async function jn(e, t) {
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
const T = A`
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
var Fn = Object.defineProperty, Hn = Object.getOwnPropertyDescriptor, _ = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Hn(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Fn(t, s, r), r;
};
const Un = ["mixer", "groups", "envelopes", "defaults", "patterns", "presence", "code"], zn = 2e3, Bn = 1e4, Wn = 5 * 6e4, Gn = 1500, Us = "activity_levels.timeline", Vn = ["24h", "7d", "30d"], qn = ["off", "24h", "7d"], zs = { range: "7d", horizon: "24h", showChannels: !0, showLights: !0 };
function Kn(e) {
  if (e === null) return null;
  const t = JSON.parse(e);
  return !Vn.includes(t.range) || !qn.includes(t.horizon) ? null : {
    range: t.range,
    horizon: t.horizon,
    showChannels: t.showChannels !== !1,
    showLights: t.showLights !== !1
  };
}
let y = class extends b {
  constructor() {
    super(...arguments), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = zs, this.codeStatus = null, this.yamlEditor = !0, this.tabFocus = 0, this.liveSeq = 0, this.profileAt = 0, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
      e.structural && (this.errors = []), this.tab !== "code" && (this.codeStatus = null), this.setConfig(e.detail, e.coalesceKey);
    }, this.onCodeStatus = (e) => {
      this.codeStatus = e.detail, this.errors = e.detail.errors;
    }, this.onNav = (e) => {
      const t = Fs(this.nav, e.detail);
      t.expanded !== this.nav.expanded && Hs(t.expanded), this.nav = t, this.selection = t.selection;
    }, this.onLiveRefresh = () => {
      this.pollLive();
    }, this.onRebuild = async (e) => {
      try {
        const { rebuilt: t } = await Vr(this.hass, e.detail?.force === !0);
        this.banner = t ? { kind: "info", text: "Profile rebuilt." } : { kind: "warning", text: "Rebuild skipped (external profile)." }, await this.refreshProfile(!0);
      } catch (t) {
        this.banner = { kind: "error", text: `Could not rebuild the profile: ${t.message}` };
      }
    }, this.onSimToggle = async (e) => {
      const { gid: t, on: s } = e.detail;
      try {
        await en(this.hass, "switch", s ? "turn_on" : "turn_off", { entity_id: Oi(t) });
      } catch (i) {
        this.banner = {
          kind: "error",
          text: `Could not ${s ? "start" : "stop"} the simulation for ${t}: ${i.message}`
        };
      }
    }, this.onTimelineRange = (e) => {
      this.timeline = e.detail;
      try {
        localStorage.setItem(Us, JSON.stringify(e.detail));
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
    return Un;
  }
  async connectedCallback() {
    super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
    const { ok: e, missing: t, optionalMissing: s } = await cn();
    this.missing = e ? [] : t, this.yamlEditor = !s.includes("ha-yaml-editor"), await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer();
  }
  async load() {
    try {
      const { config: e, inferred: t, warnings: s } = await Ur(this.hass);
      this.draft = new vn(e), this.inferred = t, this.warnings = s, this.syncTabs(), this.nav = Nn(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
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
    const t = this.selection, s = Fs({ ...this.nav, selection: t }, { type: "sync", config: e });
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
    const s = Dn(t, this.nav.expanded, e);
    s !== this.nav.expanded && Hs(s), this.nav = { expanded: s, selection: e };
  }
  async save() {
    const e = this.draft;
    if (e) {
      this.busy = !0, this.updatePolling();
      try {
        const t = await jn(e.config, {
          validate: (s) => Ai(this.hass, s),
          save: (s) => zr(this.hass, s)
        });
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, Gn)), await this.load());
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
    }, zn));
  }
  /** The simulation log moves at the pace of light switches, so it gets its own slower timer. */
  updateSimPolling(e) {
    if (!(this.patternsVisible && e)) {
      this.clearSimTimer();
      return;
    }
    this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => {
      this.pollSim();
    }, Bn));
  }
  async pollLive() {
    const e = ++this.liveSeq;
    try {
      const t = await Br(this.hass);
      e === this.liveSeq && (this.live = t);
    } catch {
    }
  }
  async pollSim() {
    try {
      this.simLog = await qr(this.hass);
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
    if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < Wn))
      try {
        this.profileState = await Gr(this.hass), this.profileAt = Date.now();
      } catch {
      }
  }
  restoreTimeline() {
    try {
      this.timeline = Kn(localStorage.getItem(Us)) ?? zs;
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
    const s = this.nav.selection, i = s === null ? void 0 : L(t, ji(s));
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
        .minDays=${t.defaults.patterns?.min_days ?? vt}
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
          @al-select=${(i) => this.select(i.detail)}
        ></al-group-editor>` : l`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
  }
};
y.styles = [T];
_([
  d({ attribute: !1 })
], y.prototype, "hass", 2);
_([
  d({ type: Boolean })
], y.prototype, "narrow", 2);
_([
  g()
], y.prototype, "draft", 2);
_([
  g()
], y.prototype, "inferred", 2);
_([
  g()
], y.prototype, "warnings", 2);
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
], y.prototype, "codeStatus", 2);
_([
  g()
], y.prototype, "yamlEditor", 2);
_([
  g()
], y.prototype, "tabFocus", 2);
y = _([
  E("activity-levels-panel")
], y);
function ne(e) {
  const t = Math.floor(e / 3600), s = Math.floor((e - t * 3600) / 60), i = Math.round((e - t * 3600 - s * 60) * 1e3) / 1e3, r = Math.floor(i), n = Math.round((i - r) * 1e3);
  return n === 0 ? { hours: t, minutes: s, seconds: r } : { hours: t, minutes: s, seconds: r, milliseconds: n };
}
function oe(e) {
  if (!e) return null;
  const t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
  return Math.round(t * 1e3) / 1e3;
}
function ge(e) {
  if (e === 0) return "0s";
  const t = [];
  let s = e;
  const i = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [r, n] of i) {
    const o = Math.floor(s / n);
    o > 0 && (t.push(`${o}${r}`), s -= o * n);
  }
  return s = Math.round(s * 1e3) / 1e3, s > 0 && t.push(`${s}s`), t.join(" ");
}
const G = ["on", "off"], Yn = {
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
}, Wi = (e) => e.split(".")[0] ?? "", Xn = (e) => {
  const t = e.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};
function ns(e, t, s) {
  const i = Wi(t), r = e?.states[t]?.attributes.device_class, n = [
    typeof r == "string" ? `component.${i}.entity_component.${r}.state.${s}` : null,
    `component.${i}.entity_component._.state.${s}`
  ];
  if (typeof e?.localize == "function")
    for (const o of n) {
      if (o === null) continue;
      const a = e.localize(o);
      if (typeof a == "string" && a !== "") return a;
    }
  return Xn(s);
}
function Jn(e, t, s) {
  const i = [...Yn[Wi(t)] ?? []];
  for (const r of [e?.states[t]?.state, ...s])
    typeof r == "string" && r !== "" && !i.includes(r) && i.push(r);
  return i.map((r) => ({ value: r, label: ns(e, t, r) }));
}
function Gi(e, t) {
  const s = e?.states[t];
  if (!s) return null;
  const i = e?.formatEntityState?.(s);
  return typeof i == "string" && i !== "" ? i : ns(e, t, s.state);
}
function Zn(e, t, s) {
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
  }
  return i;
}
function xt(e, t) {
  const s = m(t);
  return e.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function M(e, t, s) {
  const i = new CustomEvent("al-change", {
    detail: e,
    bubbles: !0,
    composed: !0
  });
  return t !== void 0 && (i.coalesceKey = t), s && (i.structural = !0), i;
}
const Bs = (e, t) => new CustomEvent("al-code-status", { detail: { valid: e, errors: t }, bubbles: !0, composed: !0 }), Vi = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), wt = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), Qn = () => wt("al-select-strip", null), Ws = (e) => wt("al-level-override", { value: e }), eo = (e) => wt("al-mute-toggle", { muted: e }), to = () => wt("al-reset", null), Gs = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), so = () => new CustomEvent("al-live-refresh", { detail: null, bubbles: !0, composed: !0 }), io = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), ro = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), qi = (e = !1) => new CustomEvent("al-rebuild", { detail: { force: e }, bubbles: !0, composed: !0 }), no = (e) => new CustomEvent("al-map-select", { detail: { id: e }, bubbles: !0, composed: !0 });
function oo(e, t) {
  const s = [], i = (r, n, o, a, c) => {
    const h = m(n), f = r.children.length > 0 || r.stimuli.length > 0, p = f && t.has(h);
    if (s.push({ path: n, depth: o, kind: "group", group: r, expandable: f, expanded: p, posinset: a, setsize: c }), !t.has(h)) return;
    const v = r.children.length + r.stimuli.length;
    r.children.forEach(($, x) => i($, [...n, "children", x], o + 1, x + 1, v)), r.stimuli.forEach(
      ($, x) => s.push({
        path: [...n, "stimuli", x],
        depth: o + 1,
        kind: "stimulus",
        stimulus: $,
        expandable: !1,
        expanded: !1,
        posinset: r.children.length + x + 1,
        setsize: v
      })
    ), f || s.push({
      path: n,
      depth: o + 1,
      kind: "placeholder",
      group: r,
      expandable: !1,
      expanded: !1,
      posinset: 1,
      setsize: 1
    });
  };
  return e.groups.forEach((r, n) => i(r, ["groups", n], 0, n + 1, e.groups.length)), s;
}
const Ki = "activity_levels.groups_expanded";
function ao() {
  try {
    const e = localStorage.getItem(Ki), t = e === null ? null : JSON.parse(e);
    return Array.isArray(t) ? new Set(t.filter((s) => typeof s == "string")) : /* @__PURE__ */ new Set();
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function Vs(e) {
  try {
    localStorage.setItem(Ki, JSON.stringify([...e]));
  } catch {
  }
}
var lo = Object.defineProperty, co = Object.getOwnPropertyDescriptor, K = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? co(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && lo(t, s, r), r;
};
const Ze = (e) => e.stopPropagation(), Fe = (e) => {
  (e.key === "Enter" || e.key === " ") && e.stopPropagation();
}, ho = "mdi:flash", Ot = "text/plain", uo = 36;
let I = class extends b {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null, this.expanded = ao(), this.dragging = null, this.target = null, this.menu = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(e) {
    this.dispatchEvent(M(e, void 0, !0));
  }
  emitSelect(e) {
    this.dispatchEvent(Vi(e));
  }
  isSelected(e) {
    return this.selection !== null && m(this.selection) === m(e);
  }
  select(e, t) {
    e.stopPropagation(), this.menu = null, this.emitSelect(t);
  }
  toggle(e) {
    const t = m(e), s = new Set(this.expanded);
    s.delete(t) || s.add(t), this.expanded = s, Vs(s);
  }
  /** Opens a group so a node just added inside it is visible rather than hidden. */
  open(e) {
    if (e.length === 0) return;
    const t = new Set(this.expanded).add(m(e));
    this.expanded = t, Vs(t);
  }
  /** The list a node lives in, and the slot after it: the two arguments a move needs. */
  listOf(e) {
    return { list: e.slice(0, -1), index: e[e.length - 1] };
  }
  addGroup(e, t, s) {
    const i = this.config;
    i && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(ot(i, e, t, yn(Ii(i, s), s))), this.emitSelect([...e, t]));
  }
  addStimulus(e, t) {
    const s = this.config;
    if (!s) return;
    this.menu = null, this.open(e);
    const i = [...e, "stimuli"];
    this.emitChange(ot(s, i, t, kn(""))), this.emitSelect([...i, t]);
  }
  removeNode(e, t) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
    this.emitChange(yt(s, e));
    const i = ve(e);
    this.emitSelect(i.length ? i : null);
  }
  /**
   * Applies a move if the rules allow it. Every way of moving a node — a drop, an
   * Alt+arrow — funnels through here, so a rule can only be enforced in one place.
   */
  tryMove(e, t, s) {
    const i = this.config;
    if (!i || !Rs(i, e, t, s).ok) return !1;
    const r = bn(i, e, t, s);
    if (r === i) return !1;
    const { parent: n, index: o } = Ti(e, t, s);
    return this.open(n.slice(0, -1)), this.emitChange(r), this.emitSelect([...n, o]), !0;
  }
  onDragStart(e, t) {
    e.dataTransfer?.setData(Ot, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = { key: m(t), path: t };
  }
  onDragEnd() {
    this.dragging = null, this.target = null;
  }
  /**
   * Turns a pointer position into "before this row", "after it" or "inside it". The middle
   * third is *into*, and only for a group: a stimulus has nothing to be inside of.
   */
  whereIn(e, t) {
    const s = e.currentTarget.getBoundingClientRect(), i = s.height || uo, r = i / 3, n = e.clientY - s.top;
    return n < r ? "before" : n > i - r ? "after" : t.kind === "group" ? "into" : "after";
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
    const { list: i, index: r } = this.listOf(e.path);
    return { toParent: i, index: t === "before" ? r : r + 1 };
  }
  readPath(e) {
    try {
      const t = e.dataTransfer?.getData(Ot) ?? "", s = JSON.parse(t);
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
    return this.dragging === null ? null : e.dataTransfer?.types.includes(Ot) === !0 ? this.dragging.path : null;
  }
  onDragOver(e, t) {
    const s = this.config, i = this.draggedPath(e);
    if (!s || i === null) return;
    e.preventDefault();
    const r = this.whereIn(e, t), { toParent: n, index: o } = this.destination(t, r, i), a = Rs(s, i, n, o);
    e.dataTransfer && (e.dataTransfer.dropEffect = a.ok ? "move" : "none"), this.target = { key: m(t.path), where: r, verdict: a };
  }
  onDrop(e, t) {
    const s = this.dragging === null ? null : this.readPath(e) ?? this.dragging.path;
    if (s === null) return;
    e.preventDefault();
    const i = this.whereIn(e, t), { toParent: r, index: n } = this.destination(t, i, s);
    this.tryMove(s, r, n), this.onDragEnd();
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
    this.shadowRoot?.querySelector(`.row[data-path="${m(e)}"]`)?.focus();
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
        t.expanded ? this.toggle(t.path) : this.focusPath(ve(t.path));
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
    const { list: i, index: r } = this.listOf(t.path);
    let n = !1;
    switch (e.key) {
      case "ArrowUp":
        n = this.tryMove(t.path, i, r - 1);
        break;
      case "ArrowDown":
        n = this.tryMove(t.path, i, r + 2);
        break;
      case "ArrowRight": {
        const o = t.kind === "group" ? V(s, [...i, r - 1]) : void 0;
        o !== void 0 && (n = this.tryMove(t.path, [...i, r - 1, "children"], o.children.length));
        break;
      }
      case "ArrowLeft": {
        if (t.kind !== "group") break;
        const o = i.slice(0, -2), a = i[i.length - 2];
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
    return e === null || t === void 0 ? null : ge(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
  }
  /** Tooltip for a voice's phase chip: what it is doing, and how long that lasts. */
  voiceTitle(e) {
    const t = this.countdown(e.phase_ends);
    return t === null ? `Phase: ${e.phase}` : `Phase: ${e.phase}, ends in ${t}`;
  }
  /** Tooltip for a group's meter: the displayed value, the unrounded mix, and the next wake. */
  meterTitle(e, t, s) {
    const i = [`${e.value} of ${t}`, `raw ${e.raw_value.toFixed(3)}`], r = s ? this.countdown(e.next_wake) : null;
    return r !== null && i.push(`next wake in ${r}`), i.join(" · ");
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
    const t = oo(e, this.expanded), s = this.tabbableKey(t);
    return l`
      <ha-card>
        <div class="tree" role="tree">
          ${t.map((i) => this.renderRow(e, i, s))}
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
    const t = e.filter((i) => i.kind !== "placeholder"), s = this.selection === null ? null : m(this.selection);
    return s !== null && t.some((i) => m(i.path) === s) ? s : t.length === 0 ? "" : m(t[0].path);
  }
  renderRow(e, t, s) {
    if (t.kind === "placeholder")
      return l`<div class="tree-row placeholder" role="none" style="--al-indent: ${t.depth}">
        <span class="guides"></span>
        Nothing in here yet — add a stimulus or a group with the buttons on the row above.
      </div>`;
    const i = m(t.path), r = this.target?.key === i ? this.target : null, n = this.isSelected(t.path), o = [
      "row",
      "tree-row",
      n ? "selected" : "",
      this.dragging?.key === i ? "dragging" : "",
      r === null ? "" : r.verdict.ok ? `drop-${r.where}` : "illegal"
    ].filter(Boolean).join(" ");
    return l`<div
      class=${o}
      style="--al-indent: ${t.depth}"
      data-path=${i}
      role="treeitem"
      tabindex=${i === s ? "0" : "-1"}
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
            @keydown=${Fe}
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
        @keydown=${Fe}
        @click=${(a) => this.select(a, t.path)}
      >
        ${this.labelFor(t)}
      </button>
      ${r !== null && !r.verdict.ok ? l`<span class="hint">${r.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === i ? this.renderAddMenu(t) : u}
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
      return l`<ha-icon icon=${fe[e.group.kind].icon}></ha-icon>`;
    const t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
    return t ? l`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : l`<ha-icon icon=${ho}></ha-icon>`;
  }
  /** The live and validation read-out a row carries: a badge, and whatever the frame knows. */
  renderRowStatus(e, t) {
    const s = xt(this.errors, t.path), i = s ? l`<span class="badge" title="${s} problem(s) in this group">${s}</span>` : u;
    if (t.kind === "stimulus") {
      const c = t.stimulus, h = c === void 0 ? null : Gi(this.hass, c.entity), f = V(e, ve(t.path)), p = f === void 0 ? void 0 : this.live?.voices[f.id]?.find((v) => v.label === (c?.key ?? c?.entity));
      return l`${i}${h === null ? u : l`<span class="muted chip">${h}</span>`}
      ${p ? l`<span class="chip phase ${p.phase}" title=${this.voiceTitle(p)}>${p.phase}</span>
            <span class="muted chip">${p.value.toFixed(2)}</span>` : u}`;
    }
    const r = t.group, n = r === void 0 ? void 0 : this.live?.groups[r.id], o = n?.max_value ?? r?.max_value ?? e.defaults.max_value, a = n ? Math.max(0, Math.min(100, n.value / (o || 1) * 100)) : 0;
    return l`${i}
    ${n ? l`<div class="meter" title=${this.meterTitle(n, o, t.depth === 0)}>
            <div style="width: ${a}%"></div>
          </div>
          <span class="dot ${n.gated ? "gated" : ""}" title=${n.gated ? "Gate open" : "Gate closed"}></span>` : u}`;
  }
  renderActions(e) {
    const t = e.path;
    if (e.kind === "stimulus")
      return l`<div class="actions" @click=${Ze} @keydown=${Fe}>
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
    return s === void 0 ? l`<div class="actions"></div>` : l`<div class="actions" @click=${Ze} @keydown=${Fe}>
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
        aria-expanded=${this.menu === m(t) ? "true" : "false"}
        .disabled=${nt(s.kind).length === 0}
        @click=${() => {
      this.menu = this.menu === m(t) ? null : m(t);
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
      @click=${Ze}
      @keydown=${Fe}
      @dragstart=${Ze}
    >
      ${nt(t.kind).map(
      (s) => l`<button
          type="button"
          role="menuitem"
          data-kind=${s}
          @click=${() => this.addGroup([...e.path, "children"], t.children.length, s)}
        >
          <ha-icon icon=${fe[s].icon}></ha-icon>
          <span>
            <strong>${fe[s].label}</strong>
            <div class="muted">${fe[s].definition}</div>
          </span>
        </button>`
    )}
    </div>`;
  }
};
I.styles = [
  T,
  A`
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
K([
  d({ attribute: !1 })
], I.prototype, "hass", 2);
K([
  d({ attribute: !1 })
], I.prototype, "config", 2);
K([
  d({ attribute: !1 })
], I.prototype, "selection", 2);
K([
  d({ attribute: !1 })
], I.prototype, "errors", 2);
K([
  d({ attribute: !1 })
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
  E("al-tree")
], I);
const Ue = (e) => e == null || e === "" ? null : e;
function po(e, t) {
  if (t != null)
    switch (e) {
      case "duration":
        return ne(t);
      case "boolean":
        return t ? "true" : "false";
      default:
        return t;
    }
}
function fo(e, t) {
  if (t == null || t === "") return null;
  switch (e) {
    case "duration":
      return oe(t);
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
function go(e, t) {
  if (t == null) return "unset";
  switch (e) {
    case "duration":
      return ge(t);
    case "boolean":
      return t ? "Yes" : "No";
    case "multiplier":
      return Yi(t);
    default:
      return String(t);
  }
}
const Yi = (e) => `${e.toFixed(1)}×`, qs = ["kind", "floor_id", "area_id", "id", "name"], Ks = ["mix", "null_handling", "gain"], ht = {
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
}, mo = {
  id: "Identifies the group and its entities. Changing it re-creates them.",
  name: "Friendly name; falls back to the area's name, then to the id.",
  kind: "What this is on the property. It decides what can go inside it.",
  floor_id: "Bind this to a Home Assistant floor to reuse its name.",
  area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, zt = (e) => ht[e.name] ?? e.name, Bt = (e) => mo[e.name] ?? "", vo = [
  "id",
  "name",
  "kind",
  "floor_id",
  "area_id",
  "mix",
  "null_handling",
  "gain"
], bo = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], yo = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], $o = "How this group's stimuli and children combine into one level.", xo = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", wo = "How loudly 'somebody is here' plays in this group's mix.", Xi = { number: { min: 0.1, step: 0.1, mode: "box" } }, Ji = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, _o = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, Zi = (e, t, s) => {
  switch (e) {
    case "null_handling":
      return t.mix === "mean";
    case "gain":
      return !s;
    case "floor_id":
      return t.kind === "floor";
    case "area_id":
      return Ve.has(t.kind);
    default:
      return !0;
  }
}, ko = (e, t) => {
  const s = [...nt(t)];
  return s.includes(e.kind) || s.push(e.kind), {
    select: {
      mode: "dropdown",
      options: s.map((i) => ({ value: i, label: fe[i].label }))
    }
  };
};
function Wt(e, t, s, i, r = null) {
  const n = {
    id: { text: {} },
    name: { text: {} },
    kind: ko(e, r),
    floor_id: { floor: {} },
    area_id: { area: {} },
    mix: { select: { mode: "dropdown", options: bo } },
    null_handling: { select: { mode: "dropdown", options: yo } },
    gain: _o
  };
  return s.filter((o) => Zi(o, e, t)).map((o) => ({ name: o, selector: n[o] }));
}
function Gt(e, t, s, i) {
  const r = {
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
      (n) => Zi(n, e, t) && !(n === "area_id" && e.area_id === null) && !(n === "floor_id" && e.floor_id === null)
    ).map((n) => [n, r[n]])
  );
}
function Vt(e, t) {
  const s = { ...e };
  return "id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = Ue(t.name)), "kind" in t && typeof t.kind == "string" && (s.kind = t.kind), "floor_id" in t && (s.floor_id = Ue(t.floor_id)), "area_id" in t && (s.area_id = Ue(t.area_id)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), s;
}
const qt = (e, t) => vo.find((s) => e[s] !== t[s]), Eo = (e) => e.id === "" || new RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function Qi(e, t, s, i, r) {
  const n = { ...e, [t]: s };
  return s === null || (Eo(e) && (n.id = r ? Ii(r, s) : Ni(s)), e.name === null && i !== null && (n.name = i)), n;
}
const So = (e, t, s, i) => Qi(e, "area_id", t, s, i), Ao = (e, t, s, i) => Qi(e, "floor_id", t, s, i), er = "activity_levels.panels";
function tr() {
  try {
    const e = localStorage.getItem(er), t = e === null ? null : JSON.parse(e);
    return t === null || typeof t != "object" || Array.isArray(t) ? {} : t;
  } catch {
    return {};
  }
}
function Oo(e, t) {
  const s = tr()[e];
  return typeof s == "boolean" ? s : t;
}
function Po(e, t) {
  try {
    localStorage.setItem(er, JSON.stringify({ ...tr(), [e]: t }));
  } catch {
  }
}
function me(e, t, s, i, r, n, o = u) {
  const a = `${e}:${t}`;
  return l`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${t}
    ?expanded=${Oo(a, r)}
    @expanded-changed=${(c) => {
    Po(a, c.detail.expanded);
  }}
  >
    <div slot="header" class="panel-header">
      <span>${s} ${o}</span>
      <div class="muted">${i}</div>
    </div>
    <div class="panel-body">${n}</div>
  </ha-expansion-panel>`;
}
var Co = Object.defineProperty, To = Object.getOwnPropertyDescriptor, _t = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? To(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Co(t, s, r), r;
};
let Ce = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  get group() {
    return this.config && this.path ? L(this.config, this.path) : void 0;
  }
  /** Normalized, so the table never has to care which spelling the document used. */
  get edges() {
    return (this.group?.adjacent ?? []).map((e) => ({
      id: Li(e),
      connection: Mi(e),
      one_way: Di(e)
    }));
  }
  emit(e) {
    const { config: t, path: s } = this;
    !t || !s || this.dispatchEvent(M(P(t, [...s, "adjacent"], e), void 0, !0));
  }
  edit(e, t) {
    this.emit(this.edges.map((s, i) => i === e ? { ...s, ...t } : s));
  }
  nameOf(e) {
    return (this.config ? ct(this.config).find(({ group: s }) => s.id === e) : void 0)?.group.name ?? e;
  }
  /** Areas and outside areas, minus this one and minus every group already on the table. */
  candidates() {
    const e = this.group;
    if (!this.config || !e) return [];
    const t = /* @__PURE__ */ new Set([
      e.id,
      ...this.edges.map((s) => s.id),
      ...Is(this.config, e.id).map((s) => s.group.id)
    ]);
    return ct(this.config).map(({ group: s }) => s).filter((s) => Ve.has(s.kind) && !t.has(s.id));
  }
  errorFor(e) {
    const t = `${(this.path ?? []).join("/")}/adjacent/${e}`;
    return this.errors.find((s) => s.path === t || s.path.startsWith(`${t}/`))?.message;
  }
  render() {
    const e = this.group;
    if (!this.config || !e) return u;
    const t = Is(this.config, e.id), s = this.candidates();
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
          ${this.edges.map((i, r) => this.renderOwn(i, r))}
          ${t.map(({ group: i, edge: r }) => this.renderDeclared(i, r))}
          ${this.edges.length === 0 && t.length === 0 ? l`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>` : u}
        </tbody>
      </table>
      ${s.length === 0 ? u : l`<select
            class="add-edge"
            aria-label="Add an adjacent group"
            .value=${""}
            @change=${(i) => {
      const r = i.target;
      r.value !== "" && (this.emit([...this.edges, { id: r.value, connection: Ci, one_way: !1 }]), r.value = "");
    }}
          >
            <option value="">Add an adjacent group…</option>
            ${s.map((i) => l`<option value=${i.id}>${i.name ?? i.id}</option>`)}
          </select>`}
    `;
  }
  renderOwn(e, t) {
    const s = this.errorFor(t), i = this.nameOf(e.id);
    return l`<tr class="own" data-id=${e.id}>
      <td>${i} ${s ? l`<div class="muted error">${s}</div>` : u}</td>
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${i}"
          .value=${e.connection}
          @change=${(r) => this.edit(t, { connection: r.target.value })}
        >
          ${dn.map(
      (r) => l`<option value=${r} ?selected=${r === e.connection}>${Ds[r]}</option>`
    )}
        </select>
      </td>
      <td>
        <input
          class="both-ways"
          type="checkbox"
          aria-label="You can walk both ways between here and ${i}"
          title="Unchecked means you can only go this way"
          .checked=${!e.one_way}
          @change=${(r) => this.edit(t, { one_way: !r.target.checked })}
        />
      </td>
      <td>
        <ha-icon-button
          label="Remove ${i}"
          data-action="remove"
          @click=${() => this.emit(this.edges.filter((r, n) => n !== t))}
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
      <td>${Ds[t.connection]}</td>
      <td>${t.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
  }
};
Ce.styles = [
  T,
  A`
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
_t([
  d({ attribute: !1 })
], Ce.prototype, "config", 2);
_t([
  d({ attribute: !1 })
], Ce.prototype, "path", 2);
_t([
  d({ attribute: !1 })
], Ce.prototype, "errors", 2);
Ce = _t([
  E("al-adjacency-table")
], Ce);
var Lo = Object.defineProperty, Do = Object.getOwnPropertyDescriptor, z = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Do(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Lo(t, s, r), r;
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
function Mo(e, t) {
  return e.select?.options?.find((i) => i.value === t)?.label;
}
let N = class extends b {
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
    e.stopPropagation(), this.emit(fo(this.kind, e.detail?.value));
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
      const t = Mo(this.selector, String(e));
      if (t !== void 0) return t;
    }
    return go(this.kind, e);
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
          .selector=${this.kind === "boolean" ? qe : this.selector}
          .label=${this.label}
          .required=${!1}
          .disabled=${this.disabled}
          .value=${po(this.kind, this.value)}
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
N.styles = [
  T,
  A`
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
  d({ attribute: !1 })
], N.prototype, "hass", 2);
z([
  d()
], N.prototype, "label", 2);
z([
  d({ attribute: !1 })
], N.prototype, "selector", 2);
z([
  d({ attribute: !1 })
], N.prototype, "value", 2);
z([
  d({ attribute: !1 })
], N.prototype, "inherited", 2);
z([
  d({ attribute: "inherited-from" })
], N.prototype, "inheritedFrom", 2);
z([
  d()
], N.prototype, "hint", 2);
z([
  d()
], N.prototype, "kind", 2);
z([
  d()
], N.prototype, "error", 2);
z([
  d({ type: Boolean })
], N.prototype, "disabled", 2);
N = z([
  E("al-override-field")
], N);
const No = {
  entity: "Entity",
  mode: "Mode",
  to: "Active states",
  edges: "Fire on",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, Ro = {
  entity: "The entity whose state drives this stimulus.",
  mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
  to: "Which states of this entity count as active.",
  edges: "Which crossings fire a trigger. At least one.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this trigger; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, Ys = (e) => No[e.name] ?? e.name, Xs = (e) => Ro[e.name] ?? "", Io = ["entity", "mode", "gain", "key", "envelope"], re = { duration: { enable_millisecond: !0 } }, sr = {
  number: { min: 0, step: 0.1, mode: "box", unit_of_measurement: "×" }
}, ir = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, os = "Allow retrigger", as = "When a new trigger is honoured while the envelope is still active.", ls = "Stacks", cs = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", ds = {
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
}, jo = {
  select: {
    mode: "list",
    options: [
      { value: "sustained", label: "Sustained — hold while it is active" },
      { value: "momentary", label: "Momentary — fire on each change" }
    ]
  }
}, Fo = ["attack", "decay", "impulse"], Ho = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", Uo = (e, t) => e.mode === "momentary" && Fo.includes(t), rr = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "End the trigger" }
    ]
  }
}, zo = "(unknown preset — using built-in defaults)", hs = [
  { name: "attack", label: "Attack", kind: "duration", selector: re },
  { name: "decay", label: "Decay", kind: "duration", selector: re },
  { name: "sustain", label: "Sustain", kind: "multiplier", selector: sr },
  { name: "release", label: "Release", kind: "duration", selector: re },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: qe },
  {
    name: "retrigger",
    label: os,
    kind: "select",
    selector: ds,
    hint: as
  },
  { name: "stack", label: ls, kind: "boolean", selector: qe, hint: cs },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: rr },
  { name: "debounce", label: "Debounce", kind: "duration", selector: re }
], Bo = ["entity", "mode", "to", "edges", "key"], Js = (e) => Bo.filter((t) => t !== "edges" || e.mode === "momentary"), Zs = ["envelope", "gain"], Wo = "How a single trigger rises and falls over time.", Go = "What makes this stimulus fire, and what it is called in the mix.", Vo = "Change part of the preset for this stimulus only.", qo = (e) => hs.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, us = (e) => [
  { value: "", label: "(default preset)" },
  ...e.envelopes.map((t) => ({ value: t.id, label: t.id }))
];
function Qs(e, t, s, i) {
  const r = Zn(s, t.entity, t.to), n = {
    entity: { entity: {} },
    mode: jo,
    to: {
      select: {
        mode: "dropdown",
        multiple: !0,
        // The table behind `stateOptions` cannot know every domain, so an exotic entity
        // can still be typed at. The field just stops *asking* to be typed at.
        custom_value: !0,
        options: Jn(s, t.entity, t.to)
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
    gain: ir,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: us(e) } }
  };
  return i.map((o) => ({ name: o, selector: n[o] }));
}
function ei(e, t) {
  const s = {
    entity: e.entity,
    mode: e.mode,
    to: e.to,
    edges: e.edges,
    gain: e.gain,
    key: e.key ?? "",
    envelope: e.envelope ?? ""
  };
  return Object.fromEntries(t.map((i) => [i, s[i]]));
}
const ti = (e) => Array.isArray(e) ? e.filter((t) => typeof t == "string" && t !== "") : [];
function Ko(e, t) {
  const s = { ...e };
  if ("entity" in t && (s.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (s.mode = t.mode), "to" in t && (s.to = ti(t.to)), "edges" in t) {
    const i = ti(t.edges).filter((r) => r === "enter" || r === "leave");
    i.length > 0 && (s.edges = i);
  }
  return "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = Ue(t.key)), "envelope" in t && (s.envelope = Ue(t.envelope)), s;
}
const si = (e, t) => e.length === t.length && e.every((s, i) => s === t[i]);
function Yo(e, t) {
  return si(e.to, t.to) ? si(e.edges, t.edges) ? Io.find((s) => e[s] !== t[s]) : "edges" : "to";
}
function Xo(e, t, s) {
  const i = Fi(e, t.envelope);
  return i ? i[s] === null || i[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : zo;
}
function Jo(e, t) {
  return t == null || e === void 0 ? null : ge(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
const nr = (e) => e.release * e.sustain, or = (e) => Math.max(1, e.sustain), Kt = (e) => e.sustain / or(e);
function ar(e, t = 0.25) {
  if (e.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
  const s = nr(e), i = e.attack + e.decay + s, r = i > 0 ? i * t / (1 - t) : 1, n = i + r, o = 1 / or(e), a = Kt(e);
  let c = 0;
  const h = [{ x: 0, y: 0 }];
  return c += e.attack, h.push({ x: c / n, y: o }), c += e.decay, h.push({ x: c / n, y: a }), c += r, h.push({ x: c / n, y: a }), c += s, h.push({ x: c / n, y: 0 }), h;
}
function Zo(e, t = 0.25) {
  const s = ar(e, t), i = (n) => ((s[n]?.x ?? 0) + (s[n + 1]?.x ?? 0)) / 2;
  if (e.impulse) {
    const n = [{ text: "impulse", x: 0 }];
    return e.release > 0 && n.push({ text: `R ${ge(e.release)}`, x: i(1) }), n;
  }
  const r = [];
  return e.attack > 0 && r.push({ text: `A ${ge(e.attack)}`, x: i(0) }), e.decay > 0 && r.push({ text: `D ${ge(e.decay)}`, x: i(1) }), r.push({ text: `S ${Yi(e.sustain)}`, x: i(2) }), nr(e) > 0 && r.push({ text: `R ${ge(e.release)}`, x: i(3) }), r;
}
var Qo = Object.defineProperty, ea = Object.getOwnPropertyDescriptor, lr = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ea(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Qo(t, s, r), r;
};
const Ke = 10, ut = 190, ta = 10, Oe = 58, sa = 72, st = (e) => Ke + e * (ut - Ke), Pt = (e) => Oe - e * (Oe - ta), ze = (e) => String(Math.round(e * 10) / 10), Ct = (e, t) => `${ze(e)},${ze(t)}`, ia = (e) => Math.min(ut - 6, Math.max(Ke + 6, st(e)));
let pt = class extends b {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const e = this.envelope;
    if (!e) return u;
    const t = ar(e), s = t[0], i = t[t.length - 1], r = t.map((c) => Ct(st(c.x), Pt(c.y))).join(" "), n = `${Ct(st(s.x), Oe)} ${r} ${Ct(st(i.x), Oe)}`, o = Zo(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return l`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${Ke} y1=${Oe} x2=${ut} y2=${Oe}></line>
        ${e.impulse ? u : S`<line
              class="grid"
              x1=${Ke}
              y1=${ze(Pt(Kt(e)))}
              x2=${ut}
              y2=${ze(Pt(Kt(e)))}
            ></line>`}
        <polygon class="area" points=${n}></polygon>
        <polyline class="curve" points=${r}></polyline>
        ${o.map(
      (c) => S`<text class="caption" x=${ze(ia(c.x))} y=${sa} text-anchor="middle">${c.text}</text>`
    )}
      </svg>
    `;
  }
};
pt.styles = [
  T,
  A`
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
lr([
  d({ attribute: !1 })
], pt.prototype, "envelope", 2);
pt = lr([
  E("al-envelope-sketch")
], pt);
var ra = Object.defineProperty, na = Object.getOwnPropertyDescriptor, Xe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? na(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ra(t, s, r), r;
};
let $e = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  /** One override, written as a whole block so a config that predates presence fills in. */
  setPresence(e, t) {
    const { config: s, path: i } = this;
    if (!s || !i) return;
    const r = L(s, i);
    if (!r) return;
    const n = P(s, [...i, "presence"], {
      ...r.presence ?? Ut(),
      [e]: t
    });
    this.dispatchEvent(M(n, `${m(i)}:presence:${e}`));
  }
  render() {
    const { config: e, path: t } = this, s = e && t ? L(e, t) : void 0;
    if (!e || !t || !s) return u;
    const i = s.presence ?? Ut(), r = i.envelope ?? J(e).envelope, n = Hi(e, { ...i, envelope: r }), o = we(this.errors, [...t, "presence"]);
    return l`
      <ha-selector
        class="presence-envelope"
        .hass=${this.hass}
        .selector=${{ select: { mode: "dropdown", options: us(e) } }}
        .label=${"Envelope preset"}
        .required=${!1}
        .value=${i.envelope ?? ""}
        @value-changed=${(a) => this.setPresence("envelope", a.detail.value === "" ? null : a.detail.value)}
      ></ha-selector>
      <al-override-field
        class="presence-gain"
        .hass=${this.hass}
        label="Gain"
        kind="number"
        .selector=${ir}
        .value=${i.gain}
        .inherited=${1}
        .inheritedFrom=${"presence"}
        .error=${o.gain}
        @value-changed=${(a) => this.setPresence("gain", a.detail.value ?? 1)}
      ></al-override-field>
      ${hs.map(
      (a) => l`<al-override-field
          class="presence-${a.name}"
          .hass=${this.hass}
          .label=${a.label}
          .hint=${a.hint ?? ""}
          .kind=${a.kind}
          .selector=${a.selector}
          .value=${i[a.name]}
          .inherited=${n[a.name]}
          .inheritedFrom=${r ?? "defaults"}
          .error=${o[a.name]}
          @value-changed=${(c) => this.setPresence(a.name, c.detail.value)}
        ></al-override-field>`
    )}
      <al-envelope-sketch .envelope=${n}></al-envelope-sketch>
    `;
  }
};
$e.styles = [T];
Xe([
  d({ attribute: !1 })
], $e.prototype, "hass", 2);
Xe([
  d({ attribute: !1 })
], $e.prototype, "config", 2);
Xe([
  d({ attribute: !1 })
], $e.prototype, "path", 2);
Xe([
  d({ attribute: !1 })
], $e.prototype, "errors", 2);
$e = Xe([
  E("al-presence-overrides")
], $e);
var oa = Object.defineProperty, aa = Object.getOwnPropertyDescriptor, Je = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? aa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && oa(t, s, r), r;
};
const la = "People can leave the property from here, so presence can move from here to Away.";
let xe = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  emitChange(e, t) {
    this.dispatchEvent(M(e, t));
  }
  emitSelect(e) {
    this.dispatchEvent(Vi(e));
  }
  /**
   * An identity edit. The two registry pickers route through the binding helpers, because
   * the prefill needs the registry *name* and only this element can see `hass`.
   */
  onIdentityChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = L(t, s);
    if (!i) return;
    const r = e.detail?.value ?? {};
    let n = Vt(i, r);
    "area_id" in r && n.area_id !== i.area_id && (n = So(
      n,
      n.area_id,
      n.area_id === null ? null : this.areaName(n.area_id),
      t
    )), "floor_id" in r && n.floor_id !== i.floor_id && (n = Ao(
      n,
      n.floor_id,
      n.floor_id === null ? null : this.floorName(n.floor_id),
      t
    ));
    const o = qt(n, i);
    o !== void 0 && this.emitChange(P(t, s, n), `${m(s)}:${o}`);
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
    const i = L(t, s);
    if (!i) return;
    const r = Vt(i, e.detail?.value ?? {}), n = qt(r, i);
    n !== void 0 && this.emitChange(P(t, s, r), `${m(s)}:${n}`);
  }
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(P(s, [...i, e], t), `${m(i)}:${e}`);
  }
  onDelete() {
    const { config: e, path: t } = this;
    if (!e || !t) return;
    const s = L(e, t);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(yt(e, t));
    const i = ve(t);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length === 0)
      return l`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = L(e, t);
    if (!s) return l`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = t.length === 2, r = this.errors.filter((a) => a.path === m(t)), n = we(this.errors, t), o = t.length > 2 ? L(e, ve(t)) : void 0;
    return l`
      <ha-card header="Group">
        ${r.map((a) => l`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        ${me(
      "group",
      "identity",
      "Identity",
      fe[s.kind].definition,
      !0,
      l`
            <ha-form
              .hass=${this.hass}
              .data=${Gt(s, i, qs)}
              .schema=${Wt(s, i, qs, e, o?.kind ?? null)}
              .error=${n}
              .computeLabel=${zt}
              .computeHelper=${Bt}
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(e, s, n)}
          `
    )}
        ${me("group", "mix", "Mix", $o, !0, this.renderMix(e, s, i, n))}
        ${this.renderAdjacency(e, s, n)} ${this.renderPresence(e, s, t)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
  /** Mix, gain, limiter and precision: everything about how this group sums up. */
  renderMix(e, t, s, i) {
    return l`
      <ha-form
        .hass=${this.hass}
        .data=${Gt(t, s, Ks)}
        .schema=${Wt(t, s, Ks)}
        .error=${i}
        .computeLabel=${zt}
        .computeHelper=${Bt}
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${ht.max_value}
        kind="number"
        .selector=${Xi}
        .value=${t.max_value}
        .inherited=${e.defaults.max_value}
        .inheritedFrom=${"defaults"}
        .error=${i.max_value}
        @value-changed=${(r) => this.setField("max_value", r.detail.value)}
      ></al-override-field>
      <al-override-field
        .hass=${this.hass}
        .label=${ht.precision}
        kind="select"
        .selector=${Ji}
        .value=${t.precision === null ? null : String(t.precision)}
        .inherited=${String(e.defaults.precision)}
        .inheritedFrom=${"defaults"}
        .error=${i.precision}
        @value-changed=${(r) => this.setField("precision", r.detail.value === null ? null : Number(r.detail.value))}
      ></al-override-field>
    `;
  }
  /**
   * The Adjacent groups panel, for the kinds a person can be in. "Leads off the property"
   * sits under the table rather than in it, because an exit is a property of the group,
   * not of an edge - it is the one way out that leads nowhere this document models.
   */
  renderAdjacency(e, t, s) {
    return Ve.has(t.kind) ? me(
      "group",
      "adjacent",
      "Adjacent groups",
      xo,
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
        <div class="muted">${la}</div>
        ${t.exit ? l`<div class="error">${t.exit}</div>` : u}
      </div>
    </div>`;
  }
  /** The group's own presence channel, tuned like any other: only when presence is on. */
  renderPresence(e, t, s) {
    return J(e).enabled ? me(
      "group",
      "presence",
      "Presence",
      wo,
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
    if (Ve.has(t.kind)) return u;
    const i = [
      t.adjacent.length > 0 ? "adjacent groups" : null,
      t.exit === !0 ? "a way off the property" : null
    ].filter((n) => n !== null);
    if (i.length === 0) return u;
    const r = s.adjacent ?? s.exit ?? `${fe[t.kind].label} groups have no ${i.join(" and no ")}.`;
    return l`<div class="stale row">
      <div class="grow error">${r}</div>
      <ha-button appearance="plain" @click=${() => this.clearStale(e)}>Remove</ha-button>
    </div>`;
  }
  /** Drops both in one edit, so the document goes from refused to valid in a single undo step. */
  clearStale(e) {
    const t = this.path;
    if (!t) return;
    const s = P(P(e, [...t, "adjacent"], []), [...t, "exit"], !1);
    this.dispatchEvent(M(s, void 0, !0));
  }
};
xe.styles = [
  T,
  A`
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
Je([
  d({ attribute: !1 })
], xe.prototype, "hass", 2);
Je([
  d({ attribute: !1 })
], xe.prototype, "config", 2);
Je([
  d({ attribute: !1 })
], xe.prototype, "path", 2);
Je([
  d({ attribute: !1 })
], xe.prototype, "errors", 2);
xe = Je([
  E("al-group-editor")
], xe);
var ca = Object.defineProperty, da = Object.getOwnPropertyDescriptor, De = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? da(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ca(t, s, r), r;
};
let ae = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null;
  }
  emitChange(e, t) {
    this.dispatchEvent(M(e, t));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = js(t, s);
    if (!i) return;
    const r = e.detail?.value ?? {}, n = Ko(i, r), o = Yo(n, i);
    o !== void 0 && this.emitChange(P(t, s, n), `${m(s)}:${o}`);
  }
  setOverride(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(P(s, [...i, e], t), `${m(i)}:${e}`);
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
  renderOverride(e, t, s, i) {
    const { config: r } = this, n = Uo(t, e.name);
    return l`<al-override-field
      .hass=${this.hass}
      .label=${e.label}
      .disabled=${n}
      .hint=${n ? Ho : e.hint ?? ""}
      .kind=${e.kind}
      .selector=${e.selector}
      .value=${t[e.name]}
      .inherited=${s[e.name]}
      .inheritedFrom=${r ? Xo(r, t, e.name) : "defaults"}
      .error=${i[e.name]}
      @value-changed=${(o) => this.setOverride(e.name, o.detail.value)}
    ></al-override-field>`;
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length < 3)
      return l`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = js(e, t);
    if (!s) return l`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = L(e, ve(t)), r = we(this.errors, t), n = this.errors.filter((f) => f.path === m(t)), o = Hi(e, s), a = this.live?.voices[i?.id ?? ""]?.find(
      (f) => f.label === (s.key ?? s.entity)
    ), c = Jo(this.live?.now, a?.phase_ends), h = qo(s);
    return l`
      <ha-card header="Stimulus">
        ${n.map((f) => l`<ha-alert alert-type="error">${f.message}</ha-alert>`)}
        ${me(
      "stimulus",
      "source",
      "Source",
      Go,
      !0,
      l`
            <ha-form
              .hass=${this.hass}
              .data=${ei(s, Js(s))}
              .schema=${Qs(e, s, this.hass, Js(s))}
              .error=${r}
              .computeLabel=${Ys}
              .computeHelper=${Xs}
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `
    )}
        ${me(
      "stimulus",
      "envelope",
      "Envelope",
      Wo,
      !0,
      l`
            <ha-form
              .hass=${this.hass}
              .data=${ei(s, Zs)}
              .schema=${Qs(e, s, this.hass, Zs)}
              .error=${r}
              .computeLabel=${Ys}
              .computeHelper=${Xs}
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(a, c)}
            <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
          `
    )}
        ${me(
      "stimulus",
      "overrides",
      "Override preset",
      Vo,
      !1,
      hs.map((f) => this.renderOverride(f, s, o, r)),
      h === 0 ? u : l`<span class="badge">${h} overridden</span>`
    )}
      </ha-card>
    `;
  }
};
ae.styles = [
  T,
  A`
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
De([
  d({ attribute: !1 })
], ae.prototype, "hass", 2);
De([
  d({ attribute: !1 })
], ae.prototype, "config", 2);
De([
  d({ attribute: !1 })
], ae.prototype, "path", 2);
De([
  d({ attribute: !1 })
], ae.prototype, "errors", 2);
De([
  d({ attribute: !1 })
], ae.prototype, "live", 2);
ae = De([
  E("al-stimulus-editor")
], ae);
var ha = Object.defineProperty, ua = Object.getOwnPropertyDescriptor, Q = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ua(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ha(t, s, r), r;
};
const pa = {
  label: "Name",
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, fa = {
  label: "What this preset is called in the panel. Blank shows the id instead.",
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to travel from the peak to the sustain level.",
  sustain: "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
  release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
  impulse: "Fire and forget: the trigger ends the moment it starts, leaving only the release."
}, ga = [
  "label",
  "id",
  "attack",
  "decay",
  "sustain",
  "release",
  "impulse"
], ma = { boolean: {} }, va = [
  { name: "label", selector: { text: {} } },
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: re },
  { name: "decay", selector: re },
  { name: "sustain", selector: sr },
  { name: "release", selector: re },
  { name: "impulse", selector: ma }
], ba = [
  {
    name: "retrigger",
    label: os,
    kind: "select",
    selector: ds,
    hint: as
  },
  {
    name: "stack",
    label: ls,
    kind: "boolean",
    selector: qe,
    hint: cs
  },
  {
    name: "unavailable",
    label: "When unavailable",
    kind: "select",
    selector: rr
  },
  {
    name: "debounce",
    label: "Debounce",
    kind: "duration",
    selector: re
  }
], ii = "text/plain", ya = 36, Tt = (e) => e.stopPropagation();
let H = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => pa[e.name] ?? e.name, this.computeHelper = (e) => fa[e.name] ?? "";
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
    this.dispatchEvent(M(e, t));
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
      P(t, ["defaults", "envelope"], s.id),
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
    const i = gn(s, ["envelopes"], e, t);
    if (i === s) return;
    const r = s.envelopes[this.selected]?.id, n = i.envelopes.findIndex((o) => o.id === r);
    this.selected = n === -1 ? 0 : n, this.blocked = null, this.emitChange(i);
  }
  onDragStart(e, t) {
    e.dataTransfer?.setData(ii, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
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
    const s = e.currentTarget.getBoundingClientRect(), i = s.height || ya;
    return e.clientY - s.top < i / 2 ? t : t + 1;
  }
  /**
   * Whether this drag is ours. `getData` is unreadable during `dragover` -- the browser
   * holds the store in protected mode -- so the index comes from the state set at
   * `dragstart` and the type list is what says the thing over the row is one of our rows.
   */
  isOurs(e) {
    return this.dragging !== null && e.dataTransfer?.types.includes(ii) === !0;
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
      ot(
        e,
        ["envelopes"],
        t,
        wn(An(e, "preset"))
      )
    ), this.selected = t;
  }
  removePreset(e) {
    const t = this.config;
    if (!t) return;
    const s = t.envelopes[e];
    if (!s) return;
    const i = On(t, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(yt(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config, s = this.selected, i = t?.envelopes[s];
    if (!t || !i) return;
    const r = e.detail?.value ?? {}, n = typeof r.label == "string" ? r.label : i.label ?? "", o = {
      ...i,
      // Blank is "no label": the list falls back to the id, and the document carries a
      // null rather than an empty string nobody can tell apart from an unset one.
      label: n.trim() === "" ? null : n,
      id: String(r.id ?? ""),
      attack: oe(r.attack) ?? i.attack,
      decay: oe(r.decay) ?? i.decay,
      sustain: typeof r.sustain == "number" ? r.sustain : i.sustain,
      release: oe(r.release) ?? i.release,
      impulse: typeof r.impulse == "boolean" ? r.impulse : i.impulse
    }, a = ga.find((f) => o[f] !== i[f]);
    if (a === void 0) return;
    const c = ["envelopes", s], h = P(Pn(t, s, o.id), c, o);
    this.emitChange(h, `${m(c)}:${a}`);
  }
  setOverride(e, t) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const r = ["envelopes", i, e];
    this.emitChange(P(s, r, t), m(r));
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
        ${e.envelopes.map((s, i) => this.renderPresetRow(e, s, i))}
        ${e.envelopes.length === 0 ? l`<p class="muted">No presets yet.</p>` : u}
        ${t ? l`<ha-alert alert-type="warning">${xa(t)}</ha-alert>` : u}
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
    const i = xt(this.errors, ["envelopes", s]), r = e.defaults.envelope === t.id, n = this.dragging === null || this.dropAt === null ? "" : this.dropClass(s), o = [
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
          >${t.id === "" && t.label === null ? "(unnamed preset)" : _n(t)}</span
        >
        ${t.label !== null && t.label.trim() !== "" ? l`<span class="muted id">${t.id}</span>` : u}
      </button>
      ${i ? l`<span class="badge" title="${i} problem(s)">${i}</span>` : u}
      <label
        class="default"
        title=${r ? "This is the default preset" : "Set as default"}
      >
        <input
          type="checkbox"
          aria-label="Set as default"
          .checked=${r}
          .disabled=${r}
          draggable="false"
          @dragstart=${Tt}
          @click=${Tt}
          @change=${() => this.setDefault(s)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
        @dragstart=${Tt}
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
    const i = ["envelopes", t], r = we(this.errors, i), n = this.errors.filter((c) => c.path === m(i)), o = {
      label: s.label ?? "",
      id: s.id,
      attack: ne(s.attack),
      decay: ne(s.decay),
      sustain: s.sustain,
      release: ne(s.release),
      impulse: s.impulse
    }, a = $a(e, t, s);
    return l`
      <ha-card header="Envelope preset">
        ${n.map((c) => l`<ha-alert alert-type="error">${c.message}</ha-alert>`)}
        ${a ? l`<ha-alert alert-type="warning">${a}</ha-alert>` : u}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${va}
          .error=${r}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${ba.map(
      (c) => l`<al-override-field
              .hass=${this.hass}
              .label=${c.label}
              .hint=${c.hint ?? ""}
              .kind=${c.kind}
              .selector=${c.kind === "boolean" ? qe : c.selector}
              .value=${s[c.name]}
              .inherited=${e.defaults[c.name]}
              .inheritedFrom=${"defaults"}
              .error=${r[c.name]}
              @value-changed=${(h) => this.setOverride(c.name, h.detail.value)}
            ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
H.styles = [
  T,
  A`
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
Q([
  d({ attribute: !1 })
], H.prototype, "hass", 2);
Q([
  d({ attribute: !1 })
], H.prototype, "config", 2);
Q([
  d({ attribute: !1 })
], H.prototype, "errors", 2);
Q([
  d({ type: Boolean })
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
  E("al-envelopes")
], H);
function $a(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((i, r) => r !== t && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function xa(e) {
  const t = [];
  return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(
    `group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`
  ), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
var wa = Object.defineProperty, _a = Object.getOwnPropertyDescriptor, kt = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? _a(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && wa(t, s, r), r;
};
const ka = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: os,
  stack: ls,
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, Ea = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its trigger.",
  retrigger: as,
  stack: cs,
  debounce: "Minimum time between triggers per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, Sa = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "stack",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], Lt = { duration: { enable_millisecond: !0 } }, Aa = { number: { min: 0.1, step: 0.1, mode: "box" } }, Oa = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, Pa = { boolean: {} }, Ca = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "End the trigger" }
    ]
  }
};
let Te = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (e) => ka[e.name] ?? e.name, this.computeHelper = (e) => Ea[e.name] ?? "";
  }
  schemaFor(e) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: e.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: Aa },
      { name: "precision", selector: Oa },
      { name: "unavailable", selector: Ca },
      { name: "retrigger", selector: ds },
      { name: "stack", selector: Pa },
      { name: "debounce", selector: Lt },
      { name: "safety_refresh", selector: Lt },
      { name: "min_wake_interval", selector: Lt }
    ];
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config;
    if (!t) return;
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
  }
  emitChange(e, t) {
    this.dispatchEvent(M(e, t));
  }
  render() {
    const e = this.config;
    if (!e) return l`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const t = e.defaults, s = we(this.errors, ["defaults"]), i = this.errors.filter((n) => n.path === "defaults"), r = {
      envelope: t.envelope,
      max_value: t.max_value,
      precision: String(t.precision),
      unavailable: t.unavailable,
      retrigger: t.retrigger,
      stack: t.stack,
      debounce: ne(t.debounce),
      safety_refresh: ne(t.safety_refresh),
      min_wake_interval: ne(t.min_wake_interval)
    };
    return l`
      <div class="pad">
        <ha-card header="Defaults">
          ${i.map((n) => l`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
          <ha-form
            .hass=${this.hass}
            .data=${r}
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
Te.styles = [
  T,
  A`
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
], Te.prototype, "hass", 2);
kt([
  d({ attribute: !1 })
], Te.prototype, "config", 2);
kt([
  d({ attribute: !1 })
], Te.prototype, "errors", 2);
Te = kt([
  E("al-defaults")
], Te);
const ps = 0.1, fs = 10, gs = Math.log10(ps), Ta = Math.log10(fs), cr = Ta - gs, Et = (e) => Math.min(fs, Math.max(ps, e)), ms = (e) => Math.round(e * 100) / 100, ri = (e) => ms(Et(e));
function La(e) {
  return (Math.log10(Et(e)) - gs) / cr;
}
function Da(e) {
  const t = Math.min(1, Math.max(0, e));
  return ms(Et(Math.pow(10, gs + t * cr)));
}
function Ma(e, t, s = !1) {
  const i = s ? 1.05 : 1.25;
  return ms(Et(t === 1 ? e * i : e / i));
}
function Na(e) {
  let t = e.toFixed(2).replace(/0+$/, "");
  return t.endsWith(".") && (t += "0"), t;
}
const Ra = {
  min: ps,
  max: fs,
  toPosition: La,
  fromPosition: Da,
  clamp: ri,
  step: (e, t, s = !1) => Ma(e, t, s),
  page: (e, t) => ri(t === 1 ? e * 2 : e / 2),
  format: Na,
  reset: 1
}, Ia = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function ja(e, t) {
  const s = e > 0 ? e : 1, i = Ia(t), r = 10 ** -i, n = (a) => Number(Math.min(s, Math.max(0, a)).toFixed(i)), o = Math.max(r, Number((s / 10).toFixed(i)));
  return {
    min: 0,
    max: s,
    toPosition: (a) => Math.min(1, Math.max(0, a / s)),
    fromPosition: (a) => n(Math.min(1, Math.max(0, a)) * s),
    clamp: n,
    step: (a, c, h = !1) => n(a + c * (h ? r : o)),
    page: (a, c) => n(a + c * s / 4),
    format: (a) => $t(n(a), i),
    reset: null
  };
}
var Fa = Object.defineProperty, Ha = Object.getOwnPropertyDescriptor, B = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ha(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Fa(t, s, r), r;
};
const Yt = 12, Dt = (e) => `${Math.round(e * 1e3) / 10}%`;
let R = class extends b {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.focusable = !0, this.readOnly = !1, this.label = "Gain", this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1, this.onWheel = (e) => {
      this.disabled || e.deltaY === 0 || (e.preventDefault(), this.commit(this.scale.step(this.current, e.deltaY < 0 ? 1 : -1, e.shiftKey)));
    };
  }
  get scale() {
    return this.mode === "level" ? ja(this.max, this.precision) : Ra;
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
    const e = this.scale, t = e.clamp(this.current), s = e.toPosition(t), i = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), r = l`
      ${this.mode === "gain" ? l`<div class="unity"></div>` : u}
      <div class="fill" style="height: ${Dt(s)}"></div>
      ${i === null ? u : l`<div class="tick" style="bottom: ${Dt(e.toPosition(i))}" title=${e.format(i)}></div>`}
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
          <div class="track">${r}</div>
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
          ${r}
          <div class="knob" style="bottom: calc(${Dt(s)} - ${Math.round((s - 0.5) * Yt * 10) / 10}px - ${Yt / 2}px)"></div>
        </div>
        <div class="value">${e.format(t)}</div>
      </div>
    `;
  }
};
R.styles = A`
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
      height: ${Yt}px;
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
B([
  d({ type: Number })
], R.prototype, "value", 2);
B([
  d({ type: Boolean, reflect: !0 })
], R.prototype, "disabled", 2);
B([
  d({ type: Boolean })
], R.prototype, "focusable", 2);
B([
  d({ type: Boolean, reflect: !0, attribute: "readonly" })
], R.prototype, "readOnly", 2);
B([
  d({ type: String })
], R.prototype, "label", 2);
B([
  d({ type: String })
], R.prototype, "mode", 2);
B([
  d({ type: Number })
], R.prototype, "max", 2);
B([
  d({ type: Number })
], R.prototype, "precision", 2);
B([
  d({ type: Number })
], R.prototype, "tick", 2);
B([
  g()
], R.prototype, "dragValue", 2);
R = B([
  E("al-fader")
], R);
const Ua = { ATTRIBUTE: 1 }, za = (e) => (...t) => ({ _$litDirective$: e, values: t });
class Ba {
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
const ni = za(class extends Ba {
  constructor(e) {
    if (super(e), e.type !== Ua.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
      const r = !!t[i];
      r === this.st.has(i) || this.nt?.has(i) || (r ? (s.add(i), this.st.add(i)) : (s.remove(i), this.st.delete(i)));
    }
    return ye;
  }
});
var Wa = Object.defineProperty, Ga = Object.getOwnPropertyDescriptor, St = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ga(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Wa(t, s, r), r;
};
const Va = (e) => `${Math.round(e * 1e3) / 10}%`;
let Le = class extends b {
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
        <div class=${ni({ fill: !0, hot: e > 0.9 })} style="width: ${Va(e)}"></div>
      </div>
      <div class=${ni({ dot: !0, gated: this.gated })}></div>
    `;
  }
};
Le.styles = A`
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
St([
  d({ type: Number })
], Le.prototype, "value", 2);
St([
  d({ type: Number })
], Le.prototype, "max", 2);
St([
  d({ type: Boolean })
], Le.prototype, "gated", 2);
Le = St([
  E("al-meter")
], Le);
var qa = Object.defineProperty, Ka = Object.getOwnPropertyDescriptor, F = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ka(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && qa(t, s, r), r;
};
const Ya = 250;
let D = class extends b {
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
    this.dispatchEvent(Qn());
  }
  clearStepTimer() {
    this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
  }
  sendOverride(e) {
    this.clearStepTimer(), this.dispatchEvent(Ws(e));
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
      this.stepTimer = void 0, this.dispatchEvent(Ws(t));
    }, Ya);
  }
  onMute() {
    this.dispatchEvent(eo(!this.muted));
  }
  onReset() {
    this.dispatchEvent(to());
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
        <div class="readout">${$t(e, this.precision)}</div>
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
D.styles = A`
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
F([
  d({ type: String })
], D.prototype, "label", 2);
F([
  d({ type: Boolean, reflect: !0 })
], D.prototype, "editable", 2);
F([
  d({ type: Number })
], D.prototype, "value", 2);
F([
  d({ type: Number })
], D.prototype, "realValue", 2);
F([
  d({ type: Number })
], D.prototype, "maxValue", 2);
F([
  d({ type: Number })
], D.prototype, "precision", 2);
F([
  d({ type: Number })
], D.prototype, "liveNow", 2);
F([
  d({ type: Boolean, reflect: !0 })
], D.prototype, "muted", 2);
F([
  d({ type: Boolean, reflect: !0 })
], D.prototype, "selected", 2);
F([
  d({ type: Number })
], D.prototype, "errors", 2);
F([
  g()
], D.prototype, "pending", 2);
D = F([
  E("al-strip")
], D);
var Xa = Object.defineProperty, Ja = Object.getOwnPropertyDescriptor, ee = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ja(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Xa(t, s, r), r;
};
const Za = 8e3, Qa = (e) => e instanceof Error ? e.message : String(e);
let U = class extends b {
  constructor() {
    super(...arguments), this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.live = null, this.narrow = !1, this.editing = Rn(), this.commandError = null, this.pendingFocus = !1;
  }
  disconnectedCallback() {
    this.clearErrorTimer(), super.disconnectedCallback();
  }
  get tracks() {
    return this.config ? dt(this.config, this.nav) : [];
  }
  /** The group the selection names, or the one that owns the selected stimulus. */
  get selected() {
    const { config: e, nav: t } = this;
    if (!e || t.selection === null) return null;
    const s = ji(t.selection), i = L(e, s);
    return i === void 0 ? null : { path: s, group: i };
  }
  /**
   * Which group's band owns the row's one tab stop, so a caret or a closed tab joins the
   * tab order behind the strip it belongs to rather than adding stops of its own.
   */
  get selectedId() {
    return this.selected?.group.id ?? null;
  }
  isSelected(e) {
    return this.nav.selection !== null && m(this.nav.selection) === m(e);
  }
  navigate(e) {
    this.pendingFocus = !0, this.dispatchEvent(Gs(e));
  }
  clearErrorTimer() {
    this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
  }
  fail(e) {
    this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
      this.errorTimer = void 0, this.commandError = null;
    }, Za);
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
        await t(i), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(so());
      } catch (r) {
        s?.settle(null), this.fail(`Could not ${e}: ${Qa(r)}`);
      }
  }
  /** Which track an event came from: strips are identical, so the row index is the key. */
  trackOf(e) {
    const t = e.target?.dataset?.index;
    return t === void 0 ? null : this.tracks[Number(t)] ?? null;
  }
  onStripSelect(e) {
    const t = this.trackOf(e);
    t && this.dispatchEvent(Gs({ type: "select", path: t.path }));
  }
  onLevelOverride(e) {
    const t = this.trackOf(e);
    if (!t) return;
    const s = e.target, { value: i } = e.detail;
    this.command(
      `set the level of ${t.id}`,
      async (r) => s.settle(await Kr(r, t.id, i)),
      s
    );
  }
  onMuteToggle(e) {
    const t = this.trackOf(e);
    if (!t) return;
    const { muted: s } = e.detail;
    this.command(`${s ? "mute" : "unmute"} ${t.id}`, (i) => Yr(i, t.id, s));
  }
  onReset(e) {
    const t = this.trackOf(e);
    t && this.command(`reset ${t.id}`, (s) => Xr(s, t.id));
  }
  onEditToggle(e) {
    this.editing = e.target.checked === !0, In(this.editing);
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
          const s = this.nav.selection, i = s === null ? void 0 : this.tracks.find((r) => m(r.path) === m(s));
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
    const t = this.shadowRoot?.querySelector('al-strip[tabindex="0"]');
    if (t) {
      e && t.focus();
      try {
        t.scrollIntoView?.({ inline: "nearest", block: "nearest" });
      } catch {
      }
    }
  }
  renderTrack(e, t, s, i) {
    const r = L(e, t.path);
    if (!r) return l``;
    const n = this.live?.groups[r.id], o = this.isSelected(t.path);
    return l`
      <al-strip
        data-index=${s}
        style="grid-column: ${i.columns[s]}; grid-row: ${i.rows + 1};"
        tabindex=${o ? 0 : -1}
        ?editable=${this.editing}
        .label=${r.name ?? r.id}
        .value=${n?.value ?? 0}
        .liveNow=${this.live?.now ?? 0}
        .realValue=${n?.real_value ?? 0}
        .maxValue=${n?.max_value ?? r.max_value ?? e.defaults.max_value}
        .precision=${n?.precision ?? is(e, r)}
        .muted=${n?.muted ?? !1}
        .selected=${o}
        .errors=${xt(this.errors, t.path)}
      ></al-strip>
    `;
  }
  renderBand(e, t) {
    const s = e.expanded ? e.depth + 1 : t.rows + 1, i = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${s};`, r = e.id === this.selectedId ? 0 : -1;
    return e.expanded ? l`
          <div class="band" role="group" aria-label=${e.label} style=${i}>
            <button
              class="caret"
              type="button"
              data-band=${e.id}
              tabindex=${r}
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
            tabindex=${r}
            aria-expanded="false"
            aria-label=${`Expand ${e.label}`}
            title=${`Expand ${e.label}`}
            style=${i}
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
    const t = Ln(e, this.nav), s = t.kinds.map((r) => r === "tab" ? "var(--al-tab-w)" : "var(--al-strip-w)").join(" "), i = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
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
        style="grid-template-columns: ${s}; grid-template-rows: ${i};"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-level-override=${this.onLevelOverride}
        @al-mute-toggle=${this.onMuteToggle}
        @al-reset=${this.onReset}
      >
        ${t.bands.map((r) => this.renderBand(r, t))}
        ${this.tracks.map((r, n) => this.renderTrack(e, r, n, t))}
      </div>
    `;
  }
};
U.styles = [
  T,
  A`
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
ee([
  d({ attribute: !1 })
], U.prototype, "hass", 2);
ee([
  d({ attribute: !1 })
], U.prototype, "config", 2);
ee([
  d({ attribute: !1 })
], U.prototype, "nav", 2);
ee([
  d({ attribute: !1 })
], U.prototype, "errors", 2);
ee([
  d({ attribute: !1 })
], U.prototype, "live", 2);
ee([
  d({ type: Boolean, reflect: !0 })
], U.prototype, "narrow", 2);
ee([
  g()
], U.prototype, "editing", 2);
ee([
  g()
], U.prototype, "commandError", 2);
U = ee([
  E("al-mixer")
], U);
const el = {
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
}, tl = {
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400
};
function sl(e, t, s) {
  return {
    start: e - el[t],
    end: e,
    resolution: t === "24h" ? "5m" : "1h",
    forecastUntil: s === "off" ? void 0 : e + tl[s]
  };
}
function il(e, t, s) {
  const i = t - e || 1;
  return (r) => (r - e) / i * s;
}
function rl(e, t, s = 4) {
  const i = e || 1, r = t - 2 * s;
  return (n) => t - s - n / i * r;
}
function ft(e, t) {
  t = Math.max(4, t);
  const s = e.length;
  if (s <= t) return e;
  const i = Math.max(1, Math.floor(t / 2)), r = Math.ceil(s / i), n = [];
  for (let o = 0; o < s; o += r) {
    const a = Math.min(o + r, s);
    let c = e[o], h = e[o];
    for (let f = o + 1; f < a; f++) {
      const p = e[f];
      p[1] < c[1] && (c = p), p[1] > h[1] && (h = p);
    }
    c === h ? n.push(c) : c[0] <= h[0] ? n.push(c, h) : n.push(h, c);
  }
  return n[0] !== e[0] && (n[0] = e[0]), n[n.length - 1] !== e[s - 1] && (n[n.length - 1] = e[s - 1]), n;
}
function Xt(e, t, s) {
  return e.length === 0 ? "" : e.map(([i, r], n) => `${n === 0 ? "M" : "L"}${t(i)},${s(r)}`).join(" ");
}
function nl(e, t, s, i = 1 / 0) {
  if (e.p75.length === 0) return "";
  const r = (c) => c.map((h, f) => [e.t0 + f * e.step, h]), n = ft(r(e.p75), i), o = ft(r(e.p25), i).reverse();
  return `${[...n, ...o].map(([c, h], f) => `${f === 0 ? "M" : "L"}${t(c)},${s(h)}`).join(" ")} Z`;
}
function ol(e, t) {
  return e[t].map((s, i) => [e.t0 + i * e.step, s]);
}
function al(e, t, s, i, r) {
  const n = e[e.length - 1];
  return !n || t <= n[0] || t < i || t > r ? [] : [n, [t, s]];
}
function Mt(e, t, s) {
  return e.map(([i, r, n]) => ({ x0: t(i), x1: t(r ?? s), tag: n }));
}
function oi(e, t) {
  if (e.length === 0) return -1;
  let s = 0, i = e.length - 1;
  for (; s < i; ) {
    const r = s + i >> 1;
    e[r][0] < t ? s = r + 1 : i = r;
  }
  return s > 0 && Math.abs(e[s - 1][0] - t) <= Math.abs(e[s][0] - t) ? s - 1 : s;
}
function ll(e) {
  return [e.group_id, e.start, e.end, e.resolution, e.include_children ?? !1, e.forecast_until ?? ""].join("|");
}
var cl = Object.defineProperty, dl = Object.getOwnPropertyDescriptor, C = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? dl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && cl(t, s, r), r;
};
const Ae = 32, hl = 28, ul = 4, ai = 8, pl = 800, fl = 220, gl = 160, Nt = 2e3, ml = 6e4, vl = 1e4, dr = 6e4, bl = 32, yl = ["24h", "7d", "30d"], $l = ["off", "24h", "7d"], li = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], xl = (e) => `hsl(${e * 67 % 360} 55% 62%)`, se = /* @__PURE__ */ new Map(), Qe = /* @__PURE__ */ new Map();
function ci(e, t) {
  const s = Date.now();
  for (const [i, r] of se) s - r.at >= dr && se.delete(i);
  se.delete(e), se.set(e, { at: s, data: t });
  for (const i of se.keys()) {
    if (se.size <= bl) break;
    se.delete(i);
  }
}
const wl = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", _l = (e, t) => {
  const s = new Date(e * 1e3);
  return t <= 2 * 86400 ? s.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : s.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}, Rt = (e) => String(Math.round(e * 100) / 100), It = (e, t, s) => Math.min(s, Math.max(t, e));
function kl(e, t, s, i) {
  const r = Math.max(1, i.width - Ae), n = Math.max(1, i.height - hl), o = s.start, a = Math.max(s.until, s.end), c = il(o, a, r), h = rl(i.maxValue, n), f = Object.keys(e.series), p = f.includes(t) ? t : f[0] ?? t, v = (w, he) => {
    const ke = ft(e.series[w] ?? [], Nt);
    return { id: w, points: ke, d: Xt(ke, c, h), color: he };
  }, $ = v(p, "var(--primary-color)"), x = i.showChannels ? f.filter((w) => w !== p).map((w, he) => v(w, xl(he))) : [], W = e.forecast, Re = W ? wl(nl(W, c, h, Nt)) : "", Ie = W ? Xt(ft(ol(W, "p50"), Nt), c, h) : "", X = [];
  for (const [, , w] of e.day_types) X.includes(w) || X.push(w);
  const ys = (w) => li[X.indexOf(w) % li.length], fr = Mt(
    e.day_types.map(([w, he, ke]) => [w, he, ke]),
    c,
    a
  ).map((w) => ({ ...w, fill: ys(w.tag) })), gr = Mt(
    Object.entries(e.lights).flatMap(
      ([w, he]) => he.map(([ke, vr]) => [ke, vr, w])
    ),
    c,
    a
  ), mr = Mt(e.plan, c, a);
  return {
    busId: p,
    bus: $,
    children: x,
    band: Re,
    p50: Ie,
    dayTypes: fr,
    legend: X.map((w) => ({ tag: w, fill: ys(w) })),
    lights: gr,
    plan: mr,
    x: c,
    y: h,
    t0: o,
    t1: a,
    plotW: r,
    plotH: n
  };
}
let k = class extends b {
  constructor() {
    super(...arguments), this.groupId = null, this.heading = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = vt, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = pl, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
  }
  get height() {
    return this.narrow ? gl : fl;
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
    }, ml), this.load();
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
    }, vl)));
  }
  willUpdate(e) {
    const t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), s = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
    (t || s) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
  }
  query(e) {
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = sl(t, this.range, this.horizon);
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
    const i = this.query(s), r = ll(i), n = e ? void 0 : se.get(r);
    if (n && Date.now() - n.at < dr) {
      this.seq++, this.loaded = { q: i, data: n.data }, this.error = null, ci(r, n.data);
      return;
    }
    let o = e ? void 0 : Qe.get(r);
    if (!o) {
      const c = Wr(t, i);
      o = c, Qe.set(r, c), c.then(
        (h) => ci(r, h),
        () => {
        }
      ).finally(() => {
        Qe.get(r) === c && Qe.delete(r);
      });
    }
    const a = ++this.seq;
    try {
      const c = await o;
      if (a !== this.seq) return;
      this.loaded = { q: i, data: c }, this.error = null;
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
    if (s && s.key.length === t.length && s.key.every((r, n) => r === t[n])) return s.value;
    const i = kl(
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
    return It(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
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
    return !i || e.bus.id !== t ? "" : Xt(al(e.bus.points, s.now, i.value, e.t0, e.t1), e.x, e.y);
  }
  emitSettings() {
    this.dispatchEvent(
      io({
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
    const i = e.currentTarget.getBoundingClientRect(), r = i.width > 0 ? this.width / i.width : 1, n = (e.clientX - i.left) * r - Ae, o = It(n / t.plotW, 0, 1);
    return t.t0 + o * (t.t1 - t.t0);
  }
  onMove(e) {
    const t = this.paths;
    !t || t.bus.points.length === 0 || (this.cursorIndex = oi(t.bus.points, this.timeAt(e, t)));
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
    this.cursorIndex = this.cursorIndex === null ? i > 0 ? 0 : s : It(this.cursorIndex + i, 0, s);
  }
  renderChips() {
    const e = this.learningHint;
    return l`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${yl.map(
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
          ${$l.map((t) => {
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
    const t = this.width, s = this.height, i = e.x(this.nowAt(e)), r = this.tailPath(e), n = e.plotH + ul, o = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), a = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
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
      (c) => S`
            <line class="grid" x1=${Ae} y1=${e.y(this.maxValue * c)} x2=${t} y2=${e.y(this.maxValue * c)}></line>
            <text class="ytick" x=${Ae - 4} y=${e.y(this.maxValue * c) + 3} text-anchor="end">
              ${Rt(this.maxValue * c)}
            </text>
          `
    )}
        <g transform="translate(${Ae},0)">
          ${e.dayTypes.map(
      (c) => S`<rect
              class="daytype"
              x=${c.x0}
              y="0"
              width=${Math.max(0, c.x1 - c.x0)}
              height=${e.plotH}
              fill=${c.fill}
            ></rect>`
    )}
          ${e.band ? S`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? S`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((c) => S`<path class="child" d=${c.d} stroke=${c.color}></path>`)}
          ${e.bus.d ? S`<path class="bus" d=${e.bus.d}></path>` : u}
          ${r ? S`<path class="tail" d=${r}></path>` : u}
          ${this.showLights ? e.lights.map(
      (c) => S`<rect
                  class="light"
                  x=${c.x0}
                  y=${n}
                  width=${Math.max(1, c.x1 - c.x0)}
                  height=${ai}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`
    ) : u}
          ${this.showLights ? e.plan.map(
      (c) => S`<rect
                  class="plan"
                  x=${c.x0}
                  y=${n}
                  width=${Math.max(1, c.x1 - c.x0)}
                  height=${ai}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`
    ) : u}
          <line class="now" x1=${i} y1="0" x2=${i} y2=${e.plotH}></line>
          <text class="now-label" x=${i + 3} y="10">now</text>
          ${o === null ? u : S`<line class="cursor" x1=${o} y1="0" x2=${o} y2=${e.plotH}></line>`}
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
      ([i, r]) => S`<text class="xlabel" x=${i * e.plotW} y=${t} text-anchor=${r}>
        ${_l(e.t0 + i * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`
    );
  }
  renderTooltip(e) {
    const t = this.cursorIndex;
    if (t === null) return u;
    const s = e.bus.points[t];
    if (!s) return u;
    const [i, r] = s, o = (Ae + e.x(i)) / this.width * 100, a = this.loaded?.data.day_types.find(([c, h]) => i >= c && i < h)?.[2];
    return l`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${new Date(i * 1e3).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${Rt(r)}</span>
        </div>
        ${e.children.map((c) => {
      const h = oi(c.points, i), f = c.points[h];
      return f ? l`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${c.color}"></span>
                  <span class="tt-name">${c.id}</span>
                  <span class="tt-value">${Rt(f[1])}</span>
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
k.styles = [
  T,
  A`
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
C([
  d({ attribute: !1 })
], k.prototype, "hass", 2);
C([
  d({ attribute: !1 })
], k.prototype, "groupId", 2);
C([
  d({ attribute: !1 })
], k.prototype, "heading", 2);
C([
  d({ attribute: !1 })
], k.prototype, "range", 2);
C([
  d({ attribute: !1 })
], k.prototype, "horizon", 2);
C([
  d({ type: Boolean })
], k.prototype, "showChannels", 2);
C([
  d({ type: Boolean })
], k.prototype, "showLights", 2);
C([
  d({ attribute: !1 })
], k.prototype, "live", 2);
C([
  d({ type: Number })
], k.prototype, "maxValue", 2);
C([
  d({ attribute: !1 })
], k.prototype, "profileState", 2);
C([
  d({ type: Number })
], k.prototype, "minDays", 2);
C([
  d({ type: Boolean, reflect: !0 })
], k.prototype, "narrow", 2);
C([
  d({ type: Boolean })
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
  E("al-timeline")
], k);
var El = Object.defineProperty, Sl = Object.getOwnPropertyDescriptor, de = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Sl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && El(t, s, r), r;
};
const di = ["name", "mix", "null_handling", "gain"], Al = 5, Ol = (e) => e[e.length - 2] === "stimuli";
let q = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.simLog = null;
  }
  emitChange(e, t) {
    this.dispatchEvent(M(e, t));
  }
  /** Writes one nullable field of the selected node, e.g. an envelope or output override. */
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(P(s, [...i, e], t), `${m(i)}:${e}`);
  }
  onBusForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = L(t, s);
    if (!i) return;
    const r = Vt(i, e.detail?.value ?? {}), n = qt(r, i);
    n !== void 0 && this.emitChange(P(t, s, r), `${m(s)}:${n}`);
  }
  /** The switch is Home Assistant's, so this reports the wanted state and lets the shell call it. */
  onSim(e, t) {
    this.dispatchEvent(ro(e, t.target.checked === !0));
  }
  onRebuild() {
    this.dispatchEvent(qi());
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
    const i = t.length === 2, r = this.errors.filter((o) => o.path === m(t)), n = we(this.errors, t);
    return l`
      <ha-card header=${s.name ?? s.id}>
        ${r.map((o) => l`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${Gt(s, i, di)}
              .schema=${Wt(s, i, di)}
              .error=${n}
              .computeLabel=${zt}
              .computeHelper=${Bt}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${Xi}
              .value=${s.max_value}
              .inherited=${e.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${n.max_value}
              @value-changed=${(o) => this.setField("max_value", o.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              .label=${ht.precision}
              kind="select"
              .selector=${Ji}
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
    const i = J(e).enabled && En(e).has(t.id);
    return l`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${i ? this.renderPresence(e, t, s) : u}
        ${t.stimuli.length === 0 && !i ? l`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((r, n) => this.renderStimulus(e, [...s, "stimuli", n], r))}
      </div>
    `;
  }
  /**
   * The room's presence channel: a stimulus with no entity. The fields themselves are
   * `al-presence-overrides`, which the Groups editor's Presence panel shows too - only the
   * head, with the live phase on it, belongs to the mixer.
   */
  renderPresence(e, t, s) {
    const i = this.live?.voices[t.id]?.find((r) => r.label === $n);
    return l`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${i ? l`<span class="chip phase ${i.phase}">${i.phase}</span>` : u}
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
    const i = this.hass?.states[s.entity], r = i?.attributes.friendly_name ?? (s.entity || "(no entity)"), n = xt(this.errors, t);
    return l`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          ${i ? l`<ha-state-icon .hass=${this.hass} .stateObj=${i}></ha-state-icon>` : l`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${s.key ?? r}</span>
          ${n ? l`<span class="badge" title="${n} problem(s)">${n}</span>` : u}
          ${i ? l`<span class="muted chip">${Gi(this.hass, s.entity)}</span>` : u}
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
    const s = t.id, i = this.live?.groups[s]?.precision ?? is(e, t), r = this.live?.groups[s]?.lights ?? 0, n = this.hass?.states[Oi(s)], o = this.simLog?.blocked[s] ?? null, a = (this.simLog?.entries ?? []).filter((c) => c.group_id === s).sort((c, h) => h.t - c.t).slice(0, Al);
    return l`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${r} light${r === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${r > 0 ? l`<div class="row sim">
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
        ${this.renderSensor("expected", "Expected", Pi(s), i)}
        ${this.renderSensor("anomaly", "Anomaly", tn(s), i)}
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
  renderSensor(e, t, s, i) {
    const r = this.hass?.states[s], n = r?.attributes.day_type, o = r?.state, a = o === void 0 ? NaN : Number(o), c = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(a) ? $t(a, i) : o;
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
    const i = s.profile.groups[t]?.days ?? 0, r = e.defaults.patterns?.min_days ?? vt;
    return s.ready[t] === !0 ? `Profile ready · ${i} days learned` : `Learning… ${i}/${r} days`;
  }
  render() {
    const { config: e, path: t } = this;
    return !e || !t || t.length === 0 ? l`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Ol(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
  }
};
q.styles = [
  T,
  A`
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
de([
  d({ attribute: !1 })
], q.prototype, "hass", 2);
de([
  d({ attribute: !1 })
], q.prototype, "config", 2);
de([
  d({ attribute: !1 })
], q.prototype, "path", 2);
de([
  d({ attribute: !1 })
], q.prototype, "errors", 2);
de([
  d({ attribute: !1 })
], q.prototype, "live", 2);
de([
  d({ attribute: !1 })
], q.prototype, "profileState", 2);
de([
  d({ attribute: !1 })
], q.prototype, "simLog", 2);
q = de([
  E("al-strip-controls")
], q);
var Pl = Object.defineProperty, Cl = Object.getOwnPropertyDescriptor, Me = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Cl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Pl(t, s, r), r;
};
const Tl = 50;
function hi(e) {
  const t = [], s = (i) => {
    t.push({ id: i.id, label: i.name ?? i.id, precision: e ? is(e, i) : 0 }), i.children.forEach(s);
  };
  return e?.groups.forEach(s), t;
}
function Ll(e, t) {
  if (e === void 0) return "—";
  const s = Number(e);
  return e.trim() !== "" && Number.isFinite(s) ? $t(s, t) : e;
}
const ui = (e) => new Date(e * 1e3).toLocaleDateString();
let le = class extends b {
  constructor() {
    super(...arguments), this.profileState = null, this.simLog = null, this.force = !1;
  }
  onRebuild() {
    this.dispatchEvent(qi(this.force));
  }
  renderStatus() {
    const e = this.profileState;
    if (!e) return l`<div class="status muted">Profile not loaded yet.</div>`;
    const { producer: t, generated_at: s, training_window: i, day_types: r, slot_minutes: n } = e.profile;
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
          <span class="window">${ui(i[0])} – ${ui(i[1])}</span>
        </div>
        <div class="muted">${r.join(", ")} · ${n}-minute slots</div>
      </div>
    `;
  }
  renderReadiness() {
    const e = this.profileState, t = hi(this.config);
    if (!e || t.length === 0)
      return l`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
    const s = this.config?.defaults.patterns?.min_days ?? vt;
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
    const i = t.ready[e.id] === !0, r = t.profile.groups[e.id]?.days ?? 0, n = this.hass?.states[Pi(e.id)]?.state;
    return l`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${i ? "yes" : "no"}" title=${i ? "Ready" : `Needs ${s} days`}>
        ${i ? "✓" : "✗"}
      </td>
      <td class="days">${r}</td>
      <td class="expected">${Ll(n, e.precision)}</td>
    </tr>`;
  }
  /** Why a group cannot be simulated right now; the first failing precondition, per group. */
  renderBlocked() {
    const e = Object.entries(this.simLog?.blocked ?? {}).filter(
      (i) => typeof i[1] == "string"
    );
    if (e.length === 0) return u;
    const t = hi(this.config), s = (i) => t.find((r) => r.id === i)?.label ?? i;
    return l`<ul class="blocked">
      ${e.map(([i, r]) => l`<li><span class="group">${s(i)}:</span> <span>${r}</span></li>`)}
    </ul>`;
  }
  renderLog() {
    const e = [...this.simLog?.entries ?? []].sort((t, s) => s.t - t.t).slice(0, Tl);
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
le.styles = [
  T,
  A`
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
Me([
  d({ attribute: !1 })
], le.prototype, "hass", 2);
Me([
  d({ attribute: !1 })
], le.prototype, "config", 2);
Me([
  d({ attribute: !1 })
], le.prototype, "profileState", 2);
Me([
  d({ attribute: !1 })
], le.prototype, "simLog", 2);
Me([
  g()
], le.prototype, "force", 2);
le = Me([
  E("al-patterns")
], le);
const pi = 160, fi = 110, et = 60, vs = 120, bs = 54;
function hr(e) {
  const t = [], s = (i, r, n) => {
    const o = r <= 1 ? i.id : n;
    t.push({ id: i.id, label: i.name ?? i.id, branch: o }), i.children.forEach((a) => s(a, r + 1, o));
  };
  return e.groups.forEach((i) => s(i, 0, i.id)), t;
}
function Dl(e, t) {
  if (e === 0 && t === 0) return 0;
  const s = e === 0 ? 1 / 0 : vs / 2 / Math.abs(e), i = t === 0 ? 1 / 0 : bs / 2 / Math.abs(t);
  return Math.min(s, i, 0.5);
}
function Ml(e, t) {
  const s = new Set(t.nodes), i = new Set(t.exits), r = [], n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const p of hr(e)) {
    if (o.set(p.id, p.label), !s.has(p.id)) continue;
    let v = n.get(p.branch);
    v === void 0 && (v = r.length, n.set(p.branch, v), r.push([])), r[v].push(p.id);
  }
  const a = [];
  r.forEach(
    (p, v) => p.forEach(
      ($, x) => a.push({
        id: $,
        label: o.get($) ?? $,
        row: v,
        col: x,
        x: et + x * pi,
        y: et + v * fi,
        exit: i.has($)
      })
    )
  );
  const c = new Map(a.map((p) => [p.id, p])), h = [];
  for (const [p, v, $] of t.edges) {
    const x = c.get(p), W = c.get(v);
    if (!x || !W) continue;
    const Re = W.x - x.x, Ie = W.y - x.y, X = Dl(Re, Ie);
    h.push({
      a: p,
      b: v,
      oneWay: $,
      x1: x.x + Re * X,
      y1: x.y + Ie * X,
      x2: W.x - Re * X,
      y2: W.y - Ie * X
    });
  }
  const f = r.reduce((p, v) => Math.max(p, v.length), 1);
  return {
    nodes: a,
    edges: h,
    width: et * 2 + (f - 1) * pi,
    height: et * 2 + (Math.max(r.length, 1) - 1) * fi
  };
}
const Nl = (e, t) => ({
  x: e.x1 + (e.x2 - e.x1) * t,
  y: e.y1 + (e.y2 - e.y1) * t
}), ur = (e, t, s) => e.edges.find((i) => i.a === t && i.b === s || i.a === s && i.b === t);
function Rl(e, t) {
  const s = [];
  for (let i = 1; i < t.length; i++) {
    const r = ur(e, t[i - 1], t[i]);
    r && s.push(r);
  }
  return s;
}
var Il = Object.defineProperty, jl = Object.getOwnPropertyDescriptor, _e = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? jl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Il(t, s, r), r;
};
const jt = vs / 2, Ft = bs / 2, Fl = 2, Ht = 9, Hl = 7, O = (e) => String(Math.round(e * 10) / 10);
let Z = class extends b {
  constructor() {
    super(...arguments), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
  }
  occupantsOf(e) {
    return this.presence?.occupants[e] ?? [];
  }
  select(e) {
    this.dispatchEvent(no(e));
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
    const t = [], s = Object.entries(this.presence?.devices ?? {}).sort(([i], [r]) => i.localeCompare(r));
    for (const [i, r] of s) {
      if (!r.moving) continue;
      const n = Object.entries(r.candidates).sort((h, f) => f[1] - h[1] || h[0].localeCompare(f[0])), o = n[0]?.[0], a = n[1]?.[0];
      if (o === void 0 || a === void 0) continue;
      const c = ur(e, o, a);
      c && t.push({ name: i, ...Nl(c, 0.5) });
    }
    return t;
  }
  /**
   * What the whole picture says, for somebody who cannot see it. It labels a `group`, not
   * an `img`: `role="img"` prunes the tree below it, which would take the focusable room
   * buttons with it.
   */
  summary(e) {
    const t = `${e.nodes.length} room${e.nodes.length === 1 ? "" : "s"}`, s = `${e.edges.length} door${e.edges.length === 1 ? "" : "s"}`, i = e.nodes.filter((n) => this.occupantsOf(n.id).length > 0).map((n) => `${n.label}: ${this.occupantsOf(n.id).join(", ")}`), r = i.length === 0 ? "Nobody is in a room right now." : `${i.join("; ")}.`;
    return `Room map, ${t} and ${s}. ${r}`;
  }
  renderEdge(e, t) {
    const s = t.has(e);
    return S`<line
      class="edge ${s ? "on-path" : ""}"
      data-one-way=${e.oneWay}
      x1=${O(e.x1)}
      y1=${O(e.y1)}
      x2=${O(e.x2)}
      y2=${O(e.y2)}
      marker-end=${e.oneWay ? "url(#al-arrow)" : u}
    ></line>`;
  }
  renderNode(e) {
    const t = this.occupantsOf(e.id), s = t.slice(0, Fl), i = t.length - s.length, r = this.selected.includes(e.id), n = [...s, ...i > 0 ? [`+${i}`] : []].join(", "), o = [
      e.label,
      e.exit ? "an exit" : "",
      t.length > 0 ? `${t.length} here: ${t.join(", ")}` : "empty"
    ].filter((a) => a !== "").join(", ");
    return S`<g
      class="node ${r ? "selected" : ""}"
      data-id=${e.id}
      role="button"
      tabindex="0"
      aria-pressed=${r ? "true" : "false"}
      aria-label=${o}
      @click=${() => this.select(e.id)}
      @keydown=${(a) => this.onKeydown(a, e.id)}
    >
      <rect
        class="box"
        x=${O(e.x - jt)}
        y=${O(e.y - Ft)}
        width=${vs}
        height=${bs}
        rx="8"
      ></rect>
      <text class="label" x=${O(e.x)} y=${O(e.y - 4)} text-anchor="middle">${e.label}</text>
      ${n === "" ? u : S`<text class="names" x=${O(e.x)} y=${O(e.y + 13)} text-anchor="middle">${n}</text>`}
      ${t.length === 0 ? u : this.renderBadge(e, t.length)}
      ${e.exit ? this.renderDoor(e) : u}
    </g>`;
  }
  renderBadge(e, t) {
    const s = e.x + jt - Ht - 3, i = e.y - Ft + Ht + 3;
    return S`<circle class="badge" cx=${O(s)} cy=${O(i)} r=${Ht}></circle>
      <text class="count" x=${O(s)} y=${O(i + 3.5)} text-anchor="middle">${t}</text>`;
  }
  /** A door leaf in the corner: this room is a way out of the house. */
  renderDoor(e) {
    const t = e.x - jt + 7, s = e.y + Ft - 7;
    return S`<path class="door" d=${`M ${O(t)} ${O(s)} v -14 h 10 v 14 z`}></path>`;
  }
  renderPerson(e) {
    return S`<circle class="person" data-name=${e.name} cx=${O(e.x)} cy=${O(e.y)} r=${Hl}>
      <title>${e.name} is on the move</title>
    </circle>`;
  }
  render() {
    const e = this.config, t = this.topology;
    if (!e || !t || t.nodes.length === 0)
      return l`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
    const s = Ml(e, t), i = new Set(this.paths.flatMap((n) => Rl(s, n))), r = this.summary(s);
    return l`
      <svg
        viewBox="0 0 ${s.width} ${s.height}"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label=${r}
      >
        <title>${r}</title>
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
        ${s.edges.map((n) => this.renderEdge(n, i))}
        ${s.nodes.map((n) => this.renderNode(n))}
        ${this.movers(s).map((n) => this.renderPerson(n))}
      </svg>
    `;
  }
};
Z.styles = [
  T,
  A`
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
_e([
  d({ attribute: !1 })
], Z.prototype, "hass", 2);
_e([
  d({ attribute: !1 })
], Z.prototype, "config", 2);
_e([
  d({ attribute: !1 })
], Z.prototype, "topology", 2);
_e([
  d({ attribute: !1 })
], Z.prototype, "presence", 2);
_e([
  d({ attribute: !1 })
], Z.prototype, "selected", 2);
_e([
  d({ attribute: !1 })
], Z.prototype, "paths", 2);
Z = _e([
  E("al-graph-map")
], Z);
var Ul = Object.defineProperty, zl = Object.getOwnPropertyDescriptor, Y = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? zl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ul(t, s, r), r;
};
const Bl = 2e3, gi = {
  enabled: "Estimate room presence",
  devices: "Tracked devices",
  envelope: "Presence envelope",
  threshold: "Confidence threshold",
  stay: "Stay probability",
  escape: "Escape probability",
  scale: "Distance scale",
  floor: "Room floor",
  stuck_after: "Reset when stuck for",
  activity_floor: "Empty-room floor"
}, mi = {
  enabled: "Estimate which room each tracked device is in. Needs Bermuda.",
  devices: "Bermuda device_trackers to follow — one per person.",
  envelope: "Preset the presence channel of every room starts from.",
  threshold: "How sure the estimate has to be before somebody counts as in the room.",
  stay: "Chance of staying put between two updates. Higher is steadier and slower.",
  escape: "Chance of turning up in a room with no path to this one. The way back from a wrong guess.",
  scale: "Distance, in metres, at which a scanner stops telling you anything.",
  floor: "Likelihood given to a room with no scanner of its own.",
  stuck_after: "How long the readings have to stay implausible before the estimate is reset.",
  activity_floor: "Likelihood given to a room whose activity level is 0.0 while another room is busy. Lower makes an empty room a stronger 'not here'."
}, Wl = [
  "enabled",
  "devices",
  "envelope",
  "threshold",
  "stay",
  "escape",
  "scale",
  "floor",
  "stuck_after",
  "activity_floor"
], vi = {
  entity: { multiple: !0, filter: { domain: "device_tracker", integration: "bermuda" } }
}, Gl = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }, Vl = { number: { min: 0.01, max: 1, step: 0.01, mode: "slider" } }, ql = { number: { min: 0, max: 0.1, step: 1e-3, mode: "box" } }, Kl = { number: { min: 0.1, step: 0.1, mode: "box" } }, bi = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } }, Yl = { duration: {} }, yi = " → ", Xl = "Give it an area that matches a room, or map it in Settings below.", Jl = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", Ee = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let j = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [], this.pathsPending = !1, this.pathSeq = 0, this.onMapSelect = (e) => {
      e.stopPropagation();
      const t = e.detail.id, s = this.selected.filter((r) => r !== null), i = s.includes(t) ? s.filter((r) => r !== t) : [...s, t].slice(-2);
      this.selected = [i[0] ?? null, i[1] ?? null], this.paths = [], this.refreshPaths();
    }, this.computeLabel = (e) => gi[e.name] ?? e.name, this.computeHelper = (e) => mi[e.name] ?? "", this.onDevicesChanged = (e) => {
      e.stopPropagation();
      const t = this.config;
      if (!t) return;
      const s = J(t), i = { ...s, devices: this.mergeDevices(e.detail?.value, s.devices) };
      this.dispatchEvent(M(P(t, ["presence"], i), "presence:devices"));
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.refreshTopology(), this.refreshPresence(), this.timer = setInterval(() => {
      document.visibilityState !== "hidden" && this.refreshPresence();
    }, Bl);
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
        this.topology = await Jr(e);
      } catch {
      }
  }
  async refreshPresence() {
    const e = this.hass;
    if (e)
      try {
        this.presence = await Qr(e);
      } catch {
      }
  }
  async refreshPaths() {
    const [e, t] = this.selected, s = this.hass, i = ++this.pathSeq;
    if (!s || e === null || t === null || e === t) {
      this.pathsPending = !1;
      return;
    }
    this.pathsPending = !0;
    try {
      const r = await Zr(s, e, t);
      i === this.pathSeq && (this.paths = r);
    } catch {
    } finally {
      i === this.pathSeq && (this.pathsPending = !1);
    }
  }
  /** Friendly names for every group, so a room id never reaches the page. */
  get labels() {
    const e = this.config;
    return new Map(e ? hr(e).map((t) => [t.id, t.label]) : []);
  }
  roomName(e) {
    return e == null || e === "" ? "—" : this.labels.get(e) ?? e;
  }
  areaName(e) {
    return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
  }
  trail(e) {
    return e.map((t) => this.roomName(t)).join(yi);
  }
  schemaFor(e) {
    return [
      { name: "enabled", selector: { boolean: {} } },
      { name: "devices", selector: vi },
      { name: "envelope", selector: { select: { mode: "dropdown", options: us(e) } } },
      { name: "threshold", selector: Vl },
      { name: "stay", selector: Gl },
      { name: "escape", selector: ql },
      { name: "scale", selector: Kl },
      { name: "floor", selector: bi },
      { name: "stuck_after", selector: Yl },
      { name: "activity_floor", selector: bi }
    ];
  }
  /**
   * The picker speaks entity ids; the config keeps a name beside each one. A device that
   * survives the edit keeps the name it was given - re-picking the same phone must not
   * quietly rename the person standing behind it.
   */
  mergeDevices(e, t) {
    return Array.isArray(e) ? e.filter((s) => typeof s == "string").map((s) => ({ device: s, name: t.find((i) => i.device === s)?.name ?? null })) : [...t];
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config;
    if (!t) return;
    const s = J(t), i = e.detail?.value ?? {}, r = {
      ...s,
      enabled: typeof i.enabled == "boolean" ? i.enabled : s.enabled,
      devices: i.devices === void 0 ? s.devices : this.mergeDevices(i.devices, s.devices),
      envelope: i.envelope === void 0 ? s.envelope : typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : null,
      threshold: Ee(i.threshold) ?? s.threshold,
      stay: Ee(i.stay) ?? s.stay,
      escape: Ee(i.escape) ?? s.escape,
      scale: Ee(i.scale) ?? s.scale,
      floor: Ee(i.floor) ?? s.floor,
      stuck_after: oe(i.stuck_after) ?? s.stuck_after,
      activity: { floor: Ee(i.activity_floor) ?? s.activity.floor }
    }, n = (a) => a === "devices" ? JSON.stringify(r.devices) === JSON.stringify(s.devices) : a === "activity_floor" ? r.activity.floor === s.activity.floor : r[a] === s[a], o = Wl.find((a) => !n(a));
    o !== void 0 && this.dispatchEvent(M(P(t, ["presence"], r), `presence:${o}`));
  }
  /**
   * Writes one field of the presence block into the draft, exactly as `onFormChanged` does
   * for the full settings form. The setup card only ever touches `enabled`, but the helper
   * is generic so it stays the one place that builds the block.
   */
  setSetting(e, t) {
    const s = this.config;
    if (!s) return;
    const r = { ...J(s), [e]: t };
    this.dispatchEvent(M(P(s, ["presence"], r), `presence:${e}`));
  }
  /**
   * What the tab is before presence exists. The tab is always listed, because a feature you
   * cannot find is a feature nobody turns on — and everything here is the Settings form
   * afterwards, reduced to the two fields that start it.
   */
  renderSetup(e) {
    const t = this.presence?.bermuda === !0, s = J(e);
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
        .selector=${vi}
        .label=${gi.devices}
        .helper=${mi.devices}
        .required=${!1}
        .value=${s.devices.map((i) => i.device)}
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
    const s = `${this.roomName(e)}${yi}${this.roomName(t)}`;
    return this.pathsPending ? l`<div class="paths muted">Finding routes from ${s}…</div>` : this.paths.length === 0 ? l`<div class="paths">
        <div class="muted">no route from ${s}</div>
      </div>` : l`<div class="paths">
      <div class="muted">
        ${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${s}
      </div>
      <ol>
        ${this.paths.map((i) => l`<li class="path">${this.trail(i)}</li>`)}
      </ol>
    </div>`;
  }
  renderPeople() {
    const e = Object.entries(this.presence?.devices ?? {}).sort(([t], [s]) => t.localeCompare(s));
    return e.length === 0 ? l`<ha-card header="People"
        ><div class="empty">No tracked device has reported a room yet.</div></ha-card
      >` : l`<ha-card header="People">
      <table>
        <thead>
          <tr>
            <th>Person</th>
            <th>Room</th>
            <th>Confidence</th>
            <th>Came from</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(([t, s]) => this.renderDevice(t, s))}
        </tbody>
      </table>
    </ha-card>`;
  }
  renderDevice(e, t) {
    const s = Math.round(t.confidence * 100);
    return l`<tr class="device">
      <td class="who">${e}</td>
      <td class="room">
        ${this.roomName(t.room)}
        ${t.moving ? l`<span class="chip moving">moving</span>` : u}
      </td>
      <td>
        <div class="meter" title=${`${s}%`}>
          <div class="confidence" style=${`width: ${s}%`}></div>
        </div>
      </td>
      <td class="breadcrumb">${t.path.length === 0 ? "—" : this.trail(t.path)}</td>
      <td class="when">${new Date(t.t * 1e3).toLocaleTimeString()}</td>
    </tr>`;
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
      <td class="room">${t ? Xl : this.roomName(e.group_id)}</td>
    </tr>`;
  }
  renderDisabled() {
    const e = this.presence?.disabled ?? [];
    return e.length === 0 ? u : l`<div class="disabled-sensors">
      ${Jl}
      <ul>
        ${e.map((t) => l`<li>${t}</li>`)}
      </ul>
    </div>`;
  }
  renderSettings(e) {
    const t = J(e), s = we(this.errors, ["presence"]), i = this.errors.filter((n) => n.path === "presence"), r = {
      enabled: t.enabled,
      devices: t.devices.map((n) => n.device),
      envelope: t.envelope ?? "",
      threshold: t.threshold,
      stay: t.stay,
      escape: t.escape,
      scale: t.scale,
      floor: t.floor,
      stuck_after: ne(t.stuck_after),
      activity_floor: t.activity.floor
    };
    return l`<ha-card header="Settings">
      ${i.map((n) => l`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
      <ha-form
        class="presence-settings"
        .hass=${this.hass}
        .data=${r}
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
    return e ? J(e).enabled ? l`<div class="page">
      ${this.renderMap(e)} ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : l`<div class="page">${this.renderSetup(e)}</div>` : l`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
  }
};
j.styles = [
  T,
  A`
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
Y([
  d({ attribute: !1 })
], j.prototype, "hass", 2);
Y([
  d({ attribute: !1 })
], j.prototype, "config", 2);
Y([
  d({ attribute: !1 })
], j.prototype, "errors", 2);
Y([
  d({ type: Boolean })
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
  E("al-presence")
], j);
const Zl = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, pr = (e) => e.dash >= 0 ? e.dash : e.indent;
function Ql(e) {
  const t = Zl.exec(e);
  return t ? t[1] ?? t[2] ?? t[3] ?? null : null;
}
function ec(e) {
  const t = [];
  return e.split(`
`).forEach((s, i) => {
    const r = s.replace(/\s+$/, ""), n = r.trimStart();
    if (n === "" || n.startsWith("#")) return;
    const o = r.length - n.length, a = /^-(?:\s+|$)/.exec(n);
    a ? t.push({ indent: o + a[0].length, dash: o, text: n.slice(a[0].length), line: i + 1 }) : t.push({ indent: o, dash: -1, text: n, line: i + 1 });
  }), t;
}
function tc(e, t, s, i) {
  for (let r = t + 1; r < s; r++) if (pr(e[r]) <= i) return r;
  return s;
}
function sc(e, t, s, i) {
  if (t >= s) return -1;
  const r = e[t].indent;
  for (let n = t; n < s; n++) {
    const o = e[n];
    if (o.indent === r && Ql(o.text) === i) return n;
  }
  return -1;
}
function ic(e, t, s, i) {
  if (t >= s || e[t].dash < 0) return -1;
  const r = e[t].dash;
  let n = -1;
  for (let o = t; o < s; o++)
    if (e[o].dash === r && ++n === i)
      return o;
  return -1;
}
function rc(e, t) {
  const s = t.split("/").filter((a) => a !== "");
  if (s.length === 0) return null;
  const i = ec(e);
  let r = 0, n = i.length, o = null;
  for (const a of s) {
    const c = /^\d+$/.test(a) ? ic(i, r, n, Number(a)) : sc(i, r, n, a);
    if (c < 0) return o;
    const h = i[c];
    o = h.line, n = tc(i, c, n, pr(h)), r = h.dash >= 0 ? c : c + 1;
  }
  return o;
}
var nc = Object.defineProperty, oc = Object.getOwnPropertyDescriptor, Ne = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? oc(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && nc(t, s, r), r;
};
const ac = 400;
let ce = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.available = !0, this.parseError = null, this.seq = 0, this.onYaml = (e) => {
      e.stopPropagation(), window.clearTimeout(this.timer);
      const t = e.detail;
      this.timer = window.setTimeout(() => {
        this.settle(t);
      }, ac);
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
      this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(Bs(!1, []));
      return;
    }
    this.parseError = null;
    const t = e.value;
    this.mine = t, this.dispatchEvent(M(t, "code")), await this.validate(t);
  }
  async validate(e) {
    const t = this.hass;
    if (!t || !e) return;
    const s = ++this.seq;
    try {
      const { errors: i } = await Ai(t, e);
      s === this.seq && this.dispatchEvent(Bs(!0, i));
    } catch {
    }
  }
  /** Puts the cursor on the line `path` names, when the text is one this can walk. */
  jump(e) {
    const t = this.editor, s = t?.codemirror, i = t?.yaml;
    if (!s || typeof i != "string") return;
    const r = rc(i, e);
    if (r === null || r > s.state.doc.lines) return;
    const n = s.state.doc.line(r).from;
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
ce.styles = [
  T,
  A`
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
Ne([
  d({ attribute: !1 })
], ce.prototype, "hass", 2);
Ne([
  d({ attribute: !1 })
], ce.prototype, "config", 2);
Ne([
  d({ attribute: !1 })
], ce.prototype, "errors", 2);
Ne([
  d({ type: Boolean })
], ce.prototype, "available", 2);
Ne([
  g()
], ce.prototype, "parseError", 2);
ce = Ne([
  E("al-code")
], ce);
