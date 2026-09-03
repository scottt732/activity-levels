const rt = globalThis, ts = rt.ShadowRoot && (rt.ShadyCSS === void 0 || rt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ss = /* @__PURE__ */ Symbol(), ks = /* @__PURE__ */ new WeakMap();
let Er = class {
  constructor(t, s, r) {
    if (this._$cssResult$ = !0, r !== ss) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (ts && t === void 0) {
      const r = s !== void 0 && s.length === 1;
      r && (t = ks.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && ks.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Si = (e) => new Er(typeof e == "string" ? e : e + "", void 0, ss), S = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((r, i, n) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[n + 1], e[0]);
  return new Er(s, e, ss);
}, Ai = (e, t) => {
  if (ts) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const r = document.createElement("style"), i = rt.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = s.cssText, e.appendChild(r);
  }
}, Es = ts ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const r of t.cssRules) s += r.cssText;
  return Si(s);
})(e) : e;
const { is: Oi, defineProperty: Pi, getOwnPropertyDescriptor: Ci, getOwnPropertyNames: Ti, getOwnPropertySymbols: Li, getPrototypeOf: Di } = Object, vt = globalThis, Ss = vt.trustedTypes, Ni = Ss ? Ss.emptyScript : "", Ri = vt.reactiveElementPolyfillSupport, Ue = (e, t) => e, nt = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Ni : null;
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
} }, rs = (e, t) => !Oi(e, t), As = { attribute: !0, type: String, converter: nt, reflect: !1, useDefault: !1, hasChanged: rs };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), vt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Ae = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = As) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const r = /* @__PURE__ */ Symbol(), i = this.getPropertyDescriptor(t, r, s);
      i !== void 0 && Pi(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, s, r) {
    const { get: i, set: n } = Ci(this.prototype, t) ?? { get() {
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
    if (this.hasOwnProperty(Ue("elementProperties"))) return;
    const t = Di(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Ue("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ue("properties"))) {
      const s = this.properties, r = [...Ti(s), ...Li(s)];
      for (const i of r) this.createProperty(i, s[i]);
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
    return Ai(t, this.constructor.elementStyles), t;
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
      if (i === !1 && (n = this[t]), r ??= o.getPropertyOptions(t), !((r.hasChanged ?? rs)(n, s) || r.useDefault && r.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, r)))) return;
      this.C(t, s, r);
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
Ae.elementStyles = [], Ae.shadowRootOptions = { mode: "open" }, Ae[Ue("elementProperties")] = /* @__PURE__ */ new Map(), Ae[Ue("finalized")] = /* @__PURE__ */ new Map(), Ri?.({ ReactiveElement: Ae }), (vt.reactiveElementVersions ??= []).push("2.1.2");
const is = globalThis, Os = (e) => e, ot = is.trustedTypes, Ps = ot ? ot.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Sr = "$lit$", ae = `lit$${Math.random().toFixed(9).slice(2)}$`, Ar = "?" + ae, Mi = `<${Ar}>`, ye = document, We = () => ye.createComment(""), Ge = (e) => e === null || typeof e != "object" && typeof e != "function", ns = Array.isArray, Ii = (e) => ns(e) || typeof e?.[Symbol.iterator] == "function", Pt = `[ 	
\f\r]`, Fe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Cs = /-->/g, Ts = />/g, fe = RegExp(`>|${Pt}(?:([^\\s"'>=/]+)(${Pt}*=${Pt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ls = /'/g, Ds = /"/g, Or = /^(?:script|style|textarea|title)$/i, Pr = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), l = Pr(1), A = Pr(2), xe = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), Ns = /* @__PURE__ */ new WeakMap(), me = ye.createTreeWalker(ye, 129);
function Cr(e, t) {
  if (!ns(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ps !== void 0 ? Ps.createHTML(t) : t;
}
const ji = (e, t) => {
  const s = e.length - 1, r = [];
  let i, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Fe;
  for (let a = 0; a < s; a++) {
    const c = e[a];
    let h, f, p = -1, v = 0;
    for (; v < c.length && (o.lastIndex = v, f = o.exec(c), f !== null); ) v = o.lastIndex, o === Fe ? f[1] === "!--" ? o = Cs : f[1] !== void 0 ? o = Ts : f[2] !== void 0 ? (Or.test(f[2]) && (i = RegExp("</" + f[2], "g")), o = fe) : f[3] !== void 0 && (o = fe) : o === fe ? f[0] === ">" ? (o = i ?? Fe, p = -1) : f[1] === void 0 ? p = -2 : (p = o.lastIndex - f[2].length, h = f[1], o = f[3] === void 0 ? fe : f[3] === '"' ? Ds : Ls) : o === Ds || o === Ls ? o = fe : o === Cs || o === Ts ? o = Fe : (o = fe, i = void 0);
    const y = o === fe && e[a + 1].startsWith("/>") ? " " : "";
    n += o === Fe ? c + Mi : p >= 0 ? (r.push(h), c.slice(0, p) + Sr + c.slice(p) + ae + y) : c + ae + (p === -2 ? a : y);
  }
  return [Cr(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class Ve {
  constructor({ strings: t, _$litType$: s }, r) {
    let i;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, c = this.parts, [h, f] = ji(t, s);
    if (this.el = Ve.createElement(h, r), me.currentNode = this.el.content, s === 2 || s === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = me.nextNode()) !== null && c.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(Sr)) {
          const v = f[o++], y = i.getAttribute(p).split(ae), x = /([.?@])?(.*)/.exec(v);
          c.push({ type: 1, index: n, name: x[2], strings: y, ctor: x[1] === "." ? Hi : x[1] === "?" ? Ui : x[1] === "@" ? zi : bt }), i.removeAttribute(p);
        } else p.startsWith(ae) && (c.push({ type: 6, index: n }), i.removeAttribute(p));
        if (Or.test(i.tagName)) {
          const p = i.textContent.split(ae), v = p.length - 1;
          if (v > 0) {
            i.textContent = ot ? ot.emptyScript : "";
            for (let y = 0; y < v; y++) i.append(p[y], We()), me.nextNode(), c.push({ type: 2, index: ++n });
            i.append(p[v], We());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ar) c.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(ae, p + 1)) !== -1; ) c.push({ type: 7, index: n }), p += ae.length - 1;
      }
      n++;
    }
  }
  static createElement(t, s) {
    const r = ye.createElement("template");
    return r.innerHTML = t, r;
  }
}
function Ce(e, t, s = e, r) {
  if (t === xe) return t;
  let i = r !== void 0 ? s._$Co?.[r] : s._$Cl;
  const n = Ge(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== n && (i?._$AO?.(!1), n === void 0 ? i = void 0 : (i = new n(e), i._$AT(e, s, r)), r !== void 0 ? (s._$Co ??= [])[r] = i : s._$Cl = i), i !== void 0 && (t = Ce(e, i._$AS(e, t.values), i, r)), t;
}
class Fi {
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
    const { el: { content: s }, parts: r } = this._$AD, i = (t?.creationScope ?? ye).importNode(s, !0);
    me.currentNode = i;
    let n = me.nextNode(), o = 0, a = 0, c = r[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let h;
        c.type === 2 ? h = new Xe(n, n.nextSibling, this, t) : c.type === 1 ? h = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (h = new Bi(n, this, t)), this._$AV.push(h), c = r[++a];
      }
      o !== c?.index && (n = me.nextNode(), o++);
    }
    return me.currentNode = ye, i;
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
    t = Ce(this, t, s), Ge(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== xe && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ii(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && Ge(this._$AH) ? this._$AA.nextSibling.data = t : this.T(ye.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: r } = t, i = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = Ve.createElement(Cr(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const n = new Fi(i, this), o = n.u(this.options);
      n.p(s), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let s = Ns.get(t.strings);
    return s === void 0 && Ns.set(t.strings, s = new Ve(t)), s;
  }
  k(t) {
    ns(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let r, i = 0;
    for (const n of t) i === s.length ? s.push(r = new Xe(this.O(We()), this.O(We()), this, this.options)) : r = s[i], r._$AI(n), i++;
    i < s.length && (this._$AR(r && r._$AB.nextSibling, i), s.length = i);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const r = Os(t).nextSibling;
      Os(t).remove(), t = r;
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
    if (n === void 0) t = Ce(this, t, s, 0), o = !Ge(t) || t !== this._$AH && t !== xe, o && (this._$AH = t);
    else {
      const a = t;
      let c, h;
      for (t = n[0], c = 0; c < n.length - 1; c++) h = Ce(this, a[r + c], s, c), h === xe && (h = this._$AH[c]), o ||= !Ge(h) || h !== this._$AH[c], h === u ? t = u : t !== u && (t += (h ?? "") + n[c + 1]), this._$AH[c] = h;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Hi extends bt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Ui extends bt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class zi extends bt {
  constructor(t, s, r, i, n) {
    super(t, s, r, i, n), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = Ce(this, t, s, 0) ?? u) === xe) return;
    const r = this._$AH, i = t === u && r !== u || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, n = t !== u && (r === u || i);
    i && this.element.removeEventListener(this.name, this, r), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Bi {
  constructor(t, s, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ce(this, t);
  }
}
const Wi = is.litHtmlPolyfillSupport;
Wi?.(Ve, Xe), (is.litHtmlVersions ??= []).push("3.3.3");
const Gi = (e, t, s) => {
  const r = s?.renderBefore ?? t;
  let i = r._$litPart$;
  if (i === void 0) {
    const n = s?.renderBefore ?? null;
    r._$litPart$ = i = new Xe(t.insertBefore(We(), n), n, void 0, s ?? {});
  }
  return i._$AI(e), i;
};
const os = globalThis;
let b = class extends Ae {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Gi(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return xe;
  }
};
b._$litElement$ = !0, b.finalized = !0, os.litElementHydrateSupport?.({ LitElement: b });
const Vi = os.litElementPolyfillSupport;
Vi?.({ LitElement: b });
(os.litElementVersions ??= []).push("4.2.2");
const _ = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
const qi = { attribute: !0, type: String, converter: nt, reflect: !1, hasChanged: rs }, Ki = (e = qi, t, s) => {
  const { kind: r, metadata: i } = s;
  let n = globalThis.litPropertyMetadata.get(i);
  if (n === void 0 && globalThis.litPropertyMetadata.set(i, n = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), r === "accessor") {
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
  return (t, s) => typeof s == "object" ? Ki(e, t, s) : ((r, i, n) => {
    const o = i.hasOwnProperty(n);
    return i.constructor.createProperty(n, r), o ? Object.getOwnPropertyDescriptor(i, n) : void 0;
  })(e, t, s);
}
function m(e) {
  return d({ ...e, state: !0, attribute: !1 });
}
const Tr = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Yi = (e) => e.callWS({
  type: "activity_levels/config/get"
}).then((t) => ({ config: t.config, inferred: t.inferred ?? [], warnings: t.warnings ?? [] })), Lr = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(Tr);
async function Xi(e, t) {
  try {
    return Tr(await e.callWS({ type: "activity_levels/config/save", config: t }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const Ji = (e) => e.callWS({ type: "activity_levels/state" }), Zi = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), Qi = (e) => e.callWS({ type: "activity_levels/profile/get" }), en = (e, t = !1) => e.callWS({ type: "activity_levels/profile/rebuild", force: t }), tn = (e, t, s = 50) => e.callWS({
  type: "activity_levels/simulation/log",
  limit: s
}), sn = (e, t, s) => e.callWS({ type: "activity_levels/level/set", group_id: t, value: s }).then((r) => r.value), rn = (e, t, s) => e.callWS({ type: "activity_levels/mute", group_id: t, muted: s }).then((r) => r.muted), nn = (e, t) => e.callWS({ type: "activity_levels/reset", group_id: t }).then(() => {
}), on = (e) => e.callWS({ type: "activity_levels/topology" }), an = (e, t, s) => e.callWS({ type: "activity_levels/topology/paths", from: t, to: s }).then((r) => r.paths), ln = (e) => e.callWS({ type: "activity_levels/presence/state" }), cn = (e, t, s, r) => e.callService(t, s, r), $t = 14, Dr = (e) => `switch.${e}_presence_simulation`, Nr = (e) => `sensor.${e}_expected_activity`, dn = (e) => `sensor.${e}_activity_anomaly`, hn = [
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
], Rs = ["ha-yaml-editor", "ha-state-icon"], un = 2500, pn = 8e3;
function fn(e) {
  let t;
  return { promise: new Promise((r) => {
    t = setTimeout(r, e);
  }), cancel: () => clearTimeout(t) };
}
async function Ms(e, t, s) {
  const r = fn(t);
  try {
    return await Promise.race([e, r.promise.then(() => s)]);
  } finally {
    r.cancel();
  }
}
async function mn() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function gn() {
  if (customElements.get("ha-yaml-editor")) return;
  let e;
  try {
    await customElements.whenDefined("ha-selector"), e = document.createElement("ha-selector"), e.selector = { object: {} }, e.style.display = "none", document.body.appendChild(e), await customElements.whenDefined("ha-yaml-editor");
  } catch {
  } finally {
    e?.remove();
  }
}
async function vn(e = pn, t = un) {
  const s = [...hn, ...Rs];
  if (s.every((a) => customElements.get(a))) return { ok: !0, missing: [], optionalMissing: [] };
  await Ms(
    Promise.all([mn(), gn()]).then(() => {
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
  ), i = s.filter((a, c) => !r[c]), n = Rs, o = i.filter((a) => !n.includes(a));
  return {
    ok: o.length === 0,
    missing: o,
    optionalMissing: i.filter((a) => n.includes(a))
  };
}
const bn = ["open", "door", "stairs", "exterior_door"], Rr = "door", ge = {
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
}, $n = {
  property: ["property", "structure", "outside"],
  structure: ["floor", "area"],
  floor: ["area"],
  area: ["area"],
  outside: ["outside"]
}, yn = ["property"], qe = /* @__PURE__ */ new Set(["area", "outside"]), at = (e) => e === null ? yn : $n[e];
function xn(e, t) {
  return t.length <= e.length ? !1 : e.every((s, r) => t[r] === s);
}
function K(e, t) {
  let s = e;
  for (const r of t) {
    if (s == null) return;
    s = s[r];
  }
  return s;
}
function js(e) {
  return Array.isArray(e) ? [...e] : { ...e };
}
function yt(e, t, s) {
  if (t.length === 0) throw new Error("empty path");
  const r = js(e);
  let i = r;
  for (let n = 0; n < t.length - 1; n++) {
    const o = t[n], a = js(i[o]);
    i[o] = a, i = a;
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
function wn(e, t, s, r) {
  return yt(e, [...t, s], (i) => {
    const n = i, [o] = n.splice(s, 1);
    n.splice(r, 0, o);
  });
}
function _n(e, t, s, r) {
  return r === s || r === s + 1 ? e : wn(e, t, s, r > s ? r - 1 : r);
}
const kn = 1e3;
class En {
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
    const r = Date.now();
    s !== void 0 && s === this.coalesceKey && r - this.coalesceAt < kn || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = r;
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
}), Fs = (e) => e[e.length - 1] === "stimuli";
function Hs(e, t, s, r) {
  const i = K(e, t);
  if (i === void 0) return ne("that node is gone");
  const n = K(e, s);
  if (!Array.isArray(n)) return ne("there is nothing to drop into there");
  if (r < 0 || r > n.length) return ne("that is not a slot in this list");
  const o = Fs(ct(t).list);
  if (o !== Fs(s))
    return ne(o ? "a stimulus belongs to a group, not beside one" : "that is not a stimulus");
  if (o) return { ok: !0 };
  const a = i;
  if (xn(t, s) || dt(t, s.slice(0, -1)))
    return ne("a group cannot go into itself");
  const c = s.slice(0, -1);
  let h;
  if (s.length === 1)
    h = null;
  else {
    const p = K(e, c);
    if (p === void 0) return ne("that group is gone");
    h = p.kind;
  }
  return at(h).includes(a.kind) ? { ok: !0 } : ne(
    h === null ? "every root group is a property" : `a ${h} cannot contain a ${a.kind}`
  );
}
const dt = (e, t) => e.length === t.length && e.every((s, r) => t[r] === s);
function Mr(e, t, s) {
  const { list: r, index: i } = ct(e), n = [...t], o = n[r.length];
  return r.length < n.length && dt(r, n.slice(0, r.length)) && typeof o == "number" && o > i && (n[r.length] = o - 1), { parent: n, index: dt(r, t) && s > i ? s - 1 : s };
}
function Sn(e, t, s, r) {
  const { index: i } = ct(t);
  if (dt(ct(t).list, s) && (r === i || r === i + 1)) return e;
  const n = K(e, t), o = xt(e, t), { parent: a, index: c } = Mr(t, s, r);
  return lt(o, a, c, n);
}
const An = (e, t) => ({
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
  presence: Wt(),
  stimuli: [],
  children: []
}), On = "presence", Wt = () => ({
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
}), Ir = (e) => typeof e == "string" ? e : e.id, jr = (e) => typeof e != "string" && e.one_way, Fr = (e) => typeof e == "string" ? Rr : e.connection;
function ht(e) {
  const t = [], s = (r, i, n) => {
    t.push({ group: r, path: i, parent: n }), r.children.forEach((o, a) => s(o, [...i, "children", a], r));
  };
  return e.groups.forEach((r, i) => s(r, ["groups", i], null)), t;
}
function Us(e, t) {
  const s = [];
  for (const { group: r } of ht(e))
    if (r.id !== t)
      for (const i of r.adjacent ?? [])
        Ir(i) === t && s.push({
          group: r,
          edge: {
            id: t,
            connection: Fr(i),
            one_way: jr(i)
          }
        });
  return s;
}
const Pn = {
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
}, Hr = (e) => ({
  tracker: e,
  name: null,
  kind: "other",
  companion: null,
  signals: { activity: null, steps: null, battery_state: null }
}), Ur = () => ({ name: null, person: null, devices: [] }), j = (e) => ({
  ...Pn,
  ...e.presence ?? {}
}), Cn = (e) => ({
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
}), Tn = (e) => e.label !== null && e.label.trim() !== "" ? e.label : e.id, Ln = (e) => ({
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
}), as = (e, t) => t.precision ?? e.defaults.precision;
function wt(e, t) {
  return e.toFixed(Math.min(100, Math.max(0, Math.trunc(t))));
}
function ls(e) {
  const t = /* @__PURE__ */ new Set(), s = (r) => {
    t.add(r.id), r.children.forEach(s);
  };
  return e.groups.forEach(s), t;
}
function Dn(e) {
  return new Set(
    ht(e).filter(({ group: t }) => qe.has(t.kind)).map(({ group: t }) => t.id)
  );
}
function zr(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const Nn = (e) => new Set(e.envelopes.map((t) => t.id));
function Br(e, t) {
  const s = zr(t);
  if (!e.has(s)) return s;
  let r = 2;
  for (; e.has(`${s}_${r}`); ) r++;
  return `${s}_${r}`;
}
const Wr = (e, t) => Br(ls(e), t), Rn = (e, t) => Br(Nn(e), t);
function Mn(e, t) {
  const s = [], r = (i) => {
    i.stimuli.some((n) => n.envelope === t) && s.push(i.id), i.children.forEach(r);
  };
  return e.groups.forEach(r), { defaults: e.defaults.envelope === t, groups: s };
}
function In(e, t, s) {
  const r = e.envelopes[t];
  if (!r || r.id === s) return e;
  const i = r.id, n = e.envelopes.map((a, c) => c === t ? { ...a, id: s } : a);
  if (e.envelopes.some((a, c) => c !== t && a.id === i)) return { ...e, envelopes: n };
  const o = (a) => ({
    ...a,
    stimuli: a.stimuli.map((c) => c.envelope === i ? { ...c, envelope: s } : c),
    children: a.children.map(o)
  });
  return {
    ...e,
    defaults: e.defaults.envelope === i ? { ...e.defaults, envelope: s } : e.defaults,
    envelopes: n,
    groups: e.groups.map(o)
  };
}
const L = (e, t) => K(e, t), zs = (e, t) => K(e, t), $e = (e) => e.slice(0, -2), Gr = (e) => e[e.length - 2] === "stimuli" ? $e(e) : e, Vr = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function qr(e, t) {
  const s = Vr(e, t.envelope), r = e.defaults, i = (n, o, a) => n ?? o ?? a;
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
const Kr = "activity_levels.mixer.expanded", jn = (e, t) => e.length === t.length && e.every((s, r) => s === t[r]), Yr = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function Fn(e) {
  return { expanded: new Set(e.groups.map((t) => t.id)), selection: Yr(e) };
}
function ut(e, t) {
  const s = [], r = (i, n, o) => {
    i.forEach((a, c) => {
      const h = [...n, c], f = a.children.length > 0, p = f && t.expanded.has(a.id);
      s.push({ path: h, id: a.id, depth: o, hasChildren: f, expanded: p }), p && r(a.children, [...h, "children"], o + 1);
    });
  };
  return r(e.groups, ["groups"], 0), s;
}
function Hn(e, t) {
  const s = ut(e, t), r = [], i = [], n = [], o = [];
  let a = 0;
  const c = (h) => {
    for (; o.length > 0 && o[o.length - 1].depth >= h; )
      o.pop().band.colEnd = i.length + 1;
  };
  for (const h of s) {
    if (c(h.depth), i.push("strip"), r.push(i.length), !h.hasChildren) continue;
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
  return c(0), { columns: r, kinds: i, bands: n, rows: a };
}
function Bs(e, t) {
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
      const r = e.selection, i = r === null ? -1 : s.findIndex((a) => jn(a.path, r)), o = (((i === -1 && t.delta < 0 ? s.length : i) + t.delta) % s.length + s.length) % s.length;
      return { ...e, selection: s[o].path };
    }
    case "home":
    case "end": {
      const s = ut(t.config, e);
      return s.length === 0 ? e : { ...e, selection: (t.type === "home" ? s[0] : s[s.length - 1]).path };
    }
    case "sync": {
      const { config: s } = t, r = ls(s), i = [...e.expanded].filter((a) => r.has(a)), n = i.length === e.expanded.size ? e.expanded : new Set(i), o = e.selection !== null && K(s, e.selection) !== void 0 ? e.selection : Yr(s);
      return { expanded: n, selection: o };
    }
  }
}
function Un(e, t, s) {
  if (s === null) return t;
  const r = s[s.length - 2] === "stimuli" ? s.slice(0, -2) : s, i = new Set(t);
  let n = !1;
  for (let o = 2; o + 2 <= r.length; o += 2) {
    const a = K(e, r.slice(0, o));
    if (a === void 0 || typeof a.id != "string") break;
    i.has(a.id) || (i.add(a.id), n = !0);
  }
  return n ? i : t;
}
function zn(e) {
  let t;
  try {
    t = localStorage.getItem(Kr);
  } catch {
    return null;
  }
  if (t === null) return null;
  try {
    const s = JSON.parse(t);
    if (!Array.isArray(s)) return null;
    const r = ls(e);
    return new Set(s.filter((i) => typeof i == "string" && r.has(i)));
  } catch {
    return null;
  }
}
function Ws(e) {
  try {
    localStorage.setItem(Kr, JSON.stringify([...e]));
  } catch {
  }
}
function Bn(e) {
  const t = Fn(e), s = zn(e);
  return s === null ? t : { ...t, expanded: s };
}
const Xr = "activity_levels.mixer.edit";
function Wn() {
  try {
    return localStorage.getItem(Xr) === "true";
  } catch {
    return !1;
  }
}
function Gn(e) {
  try {
    localStorage.setItem(Xr, e ? "true" : "false");
  } catch {
  }
}
async function Vn(e, t) {
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
var qn = Object.defineProperty, Kn = Object.getOwnPropertyDescriptor, k = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Kn(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && qn(t, s, i), i;
};
const Yn = ["mixer", "groups", "envelopes", "defaults", "patterns", "presence", "code"], Xn = 2e3, Jn = 1e4, Zn = 5 * 6e4, Qn = 1500, Gs = "activity_levels.timeline", eo = ["24h", "7d", "30d"], to = ["off", "24h", "7d"], Vs = { range: "7d", horizon: "24h", showChannels: !0, showLights: !0 };
function so(e) {
  if (e === null) return null;
  const t = JSON.parse(e);
  return !eo.includes(t.range) || !to.includes(t.horizon) ? null : {
    range: t.range,
    horizon: t.horizon,
    showChannels: t.showChannels !== !1,
    showLights: t.showLights !== !1
  };
}
let $ = class extends b {
  constructor() {
    super(...arguments), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = Vs, this.codeStatus = null, this.yamlEditor = !0, this.tabFocus = 0, this.liveSeq = 0, this.profileAt = 0, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
      e.structural && (this.errors = []), this.tab !== "code" && (this.codeStatus = null), this.setConfig(e.detail, e.coalesceKey);
    }, this.onCodeStatus = (e) => {
      this.codeStatus = e.detail, this.errors = e.detail.errors;
    }, this.onNav = (e) => {
      const t = Bs(this.nav, e.detail);
      t.expanded !== this.nav.expanded && Ws(t.expanded), this.nav = t, this.selection = t.selection;
    }, this.onLiveRefresh = () => {
      this.pollLive();
    }, this.onRebuild = async (e) => {
      try {
        const { rebuilt: t } = await en(this.hass, e.detail?.force === !0);
        this.banner = t ? { kind: "info", text: "Profile rebuilt." } : { kind: "warning", text: "Rebuild skipped (external profile)." }, await this.refreshProfile(!0);
      } catch (t) {
        this.banner = { kind: "error", text: `Could not rebuild the profile: ${t.message}` };
      }
    }, this.onSimToggle = async (e) => {
      const { gid: t, on: s } = e.detail;
      try {
        await cn(this.hass, "switch", s ? "turn_on" : "turn_off", { entity_id: Dr(t) });
      } catch (r) {
        this.banner = {
          kind: "error",
          text: `Could not ${s ? "start" : "stop"} the simulation for ${t}: ${r.message}`
        };
      }
    }, this.onTimelineRange = (e) => {
      this.timeline = e.detail;
      try {
        localStorage.setItem(Gs, JSON.stringify(e.detail));
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
    return Yn;
  }
  async connectedCallback() {
    super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
    const { ok: e, missing: t, optionalMissing: s } = await vn();
    this.missing = e ? [] : t, this.yamlEditor = !s.includes("ha-yaml-editor"), await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer();
  }
  async load() {
    try {
      const { config: e, inferred: t, warnings: s } = await Yi(this.hass);
      this.draft = new En(e), this.inferred = t, this.warnings = s, this.syncTabs(), this.nav = Bn(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
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
    const t = this.selection, s = Bs({ ...this.nav, selection: t }, { type: "sync", config: e });
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
    const s = Un(t, this.nav.expanded, e);
    s !== this.nav.expanded && Ws(s), this.nav = { expanded: s, selection: e };
  }
  async save() {
    const e = this.draft;
    if (e) {
      this.busy = !0, this.updatePolling();
      try {
        const t = await Vn(e.config, {
          validate: (s) => Lr(this.hass, s),
          save: (s) => Xi(this.hass, s)
        });
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, Qn)), await this.load());
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
    }, Xn));
  }
  /** The simulation log moves at the pace of light switches, so it gets its own slower timer. */
  updateSimPolling(e) {
    if (!(this.patternsVisible && e)) {
      this.clearSimTimer();
      return;
    }
    this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => {
      this.pollSim();
    }, Jn));
  }
  async pollLive() {
    const e = ++this.liveSeq;
    try {
      const t = await Ji(this.hass);
      e === this.liveSeq && (this.live = t);
    } catch {
    }
  }
  async pollSim() {
    try {
      this.simLog = await tn(this.hass);
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
    if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < Zn))
      try {
        this.profileState = await Qi(this.hass), this.profileAt = Date.now();
      } catch {
      }
  }
  restoreTimeline() {
    try {
      this.timeline = so(localStorage.getItem(Gs)) ?? Vs;
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
    const s = this.nav.selection, r = s === null ? void 0 : L(t, Gr(s));
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
          @al-select=${(r) => this.select(r.detail)}
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
$ = k([
  _("activity-levels-panel")
], $);
function Y(e) {
  const t = Math.floor(e / 3600), s = Math.floor((e - t * 3600) / 60), r = Math.round((e - t * 3600 - s * 60) * 1e3) / 1e3, i = Math.floor(r), n = Math.round((r - i) * 1e3);
  return n === 0 ? { hours: t, minutes: s, seconds: i } : { hours: t, minutes: s, seconds: i, milliseconds: n };
}
function X(e) {
  if (!e) return null;
  const t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
  return Math.round(t * 1e3) / 1e3;
}
function ve(e) {
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
const q = ["on", "off"], ro = {
  automation: q,
  binary_sensor: q,
  fan: q,
  humidifier: q,
  input_boolean: q,
  light: q,
  remote: q,
  siren: q,
  switch: q,
  update: q,
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
}, Jr = (e) => e.split(".")[0] ?? "", io = (e) => {
  const t = e.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};
function cs(e, t, s) {
  const r = Jr(t), i = e?.states[t]?.attributes.device_class, n = [
    typeof i == "string" ? `component.${r}.entity_component.${i}.state.${s}` : null,
    `component.${r}.entity_component._.state.${s}`
  ];
  if (typeof e?.localize == "function")
    for (const o of n) {
      if (o === null) continue;
      const a = e.localize(o);
      if (typeof a == "string" && a !== "") return a;
    }
  return io(s);
}
function no(e, t, s) {
  const r = [...ro[Jr(t)] ?? []];
  for (const i of [e?.states[t]?.state, ...s])
    typeof i == "string" && i !== "" && !r.includes(i) && r.push(i);
  return r.map((i) => ({ value: i, label: cs(e, t, i) }));
}
function Zr(e, t) {
  const s = e?.states[t];
  if (!s) return null;
  const r = e?.formatEntityState?.(s);
  return typeof r == "string" && r !== "" ? r : cs(e, t, s.state);
}
function oo(e, t, s) {
  const r = s.length === 1 ? s[0] : void 0;
  if (r === void 0)
    return { enter: "When it enters the active states", leave: "When it leaves them" };
  const i = cs(e, t, r);
  return { enter: `When it becomes ${i}`, leave: `When it stops being ${i}` };
}
const g = (e) => e.join("/");
function J(e, t) {
  const s = g(t), r = {};
  for (const i of e) {
    if (!i.path.startsWith(s + "/")) continue;
    const n = i.path.slice(s.length + 1);
    n.includes("/") || (r[n] = i.message);
  }
  return r;
}
function _t(e, t) {
  const s = g(t);
  return e.filter((r) => r.path === s || r.path.startsWith(s + "/")).length;
}
function D(e, t, s) {
  const r = new CustomEvent("al-change", {
    detail: e,
    bubbles: !0,
    composed: !0
  });
  return t !== void 0 && (r.coalesceKey = t), s && (r.structural = !0), r;
}
const qs = (e, t) => new CustomEvent("al-code-status", { detail: { valid: e, errors: t }, bubbles: !0, composed: !0 }), Qr = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), kt = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), ao = () => kt("al-select-strip", null), Ks = (e) => kt("al-level-override", { value: e }), lo = (e) => kt("al-mute-toggle", { muted: e }), co = () => kt("al-reset", null), Ys = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), ho = () => new CustomEvent("al-live-refresh", { detail: null, bubbles: !0, composed: !0 }), uo = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), po = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), ei = (e = !1) => new CustomEvent("al-rebuild", { detail: { force: e }, bubbles: !0, composed: !0 }), fo = (e) => new CustomEvent("al-map-select", { detail: { id: e }, bubbles: !0, composed: !0 });
function mo(e, t) {
  const s = [], r = (i, n, o, a, c) => {
    const h = g(n), f = i.children.length > 0 || i.stimuli.length > 0, p = f && t.has(h);
    if (s.push({ path: n, depth: o, kind: "group", group: i, expandable: f, expanded: p, posinset: a, setsize: c }), !t.has(h)) return;
    const v = i.children.length + i.stimuli.length;
    i.children.forEach((y, x) => r(y, [...n, "children", x], o + 1, x + 1, v)), i.stimuli.forEach(
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
const ti = "activity_levels.groups_expanded";
function go() {
  try {
    const e = localStorage.getItem(ti), t = e === null ? null : JSON.parse(e);
    return Array.isArray(t) ? new Set(t.filter((s) => typeof s == "string")) : /* @__PURE__ */ new Set();
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function Xs(e) {
  try {
    localStorage.setItem(ti, JSON.stringify([...e]));
  } catch {
  }
}
var vo = Object.defineProperty, bo = Object.getOwnPropertyDescriptor, Q = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? bo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && vo(t, s, i), i;
};
const et = (e) => e.stopPropagation(), He = (e) => {
  (e.key === "Enter" || e.key === " ") && e.stopPropagation();
}, $o = "mdi:flash", Ct = "text/plain", yo = 36;
let F = class extends b {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null, this.expanded = go(), this.dragging = null, this.target = null, this.menu = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(e) {
    this.dispatchEvent(D(e, void 0, !0));
  }
  emitSelect(e) {
    this.dispatchEvent(Qr(e));
  }
  isSelected(e) {
    return this.selection !== null && g(this.selection) === g(e);
  }
  select(e, t) {
    e.stopPropagation(), this.menu = null, this.emitSelect(t);
  }
  toggle(e) {
    const t = g(e), s = new Set(this.expanded);
    s.delete(t) || s.add(t), this.expanded = s, Xs(s);
  }
  /** Opens a group so a node just added inside it is visible rather than hidden. */
  open(e) {
    if (e.length === 0) return;
    const t = new Set(this.expanded).add(g(e));
    this.expanded = t, Xs(t);
  }
  /** The list a node lives in, and the slot after it: the two arguments a move needs. */
  listOf(e) {
    return { list: e.slice(0, -1), index: e[e.length - 1] };
  }
  addGroup(e, t, s) {
    const r = this.config;
    r && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(lt(r, e, t, An(Wr(r, s), s))), this.emitSelect([...e, t]));
  }
  addStimulus(e, t) {
    const s = this.config;
    if (!s) return;
    this.menu = null, this.open(e);
    const r = [...e, "stimuli"];
    this.emitChange(lt(s, r, t, Ln(""))), this.emitSelect([...r, t]);
  }
  removeNode(e, t) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
    this.emitChange(xt(s, e));
    const r = $e(e);
    this.emitSelect(r.length ? r : null);
  }
  /**
   * Applies a move if the rules allow it. Every way of moving a node — a drop, an
   * Alt+arrow — funnels through here, so a rule can only be enforced in one place.
   */
  tryMove(e, t, s) {
    const r = this.config;
    if (!r || !Hs(r, e, t, s).ok) return !1;
    const i = Sn(r, e, t, s);
    if (i === r) return !1;
    const { parent: n, index: o } = Mr(e, t, s);
    return this.open(n.slice(0, -1)), this.emitChange(i), this.emitSelect([...n, o]), !0;
  }
  onDragStart(e, t) {
    e.dataTransfer?.setData(Ct, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = { key: g(t), path: t };
  }
  onDragEnd() {
    this.dragging = null, this.target = null;
  }
  /**
   * Turns a pointer position into "before this row", "after it" or "inside it". The middle
   * third is *into*, and only for a group: a stimulus has nothing to be inside of.
   */
  whereIn(e, t) {
    const s = e.currentTarget.getBoundingClientRect(), r = s.height || yo, i = r / 3, n = e.clientY - s.top;
    return n < i ? "before" : n > r - i ? "after" : t.kind === "group" ? "into" : "after";
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
      const t = e.dataTransfer?.getData(Ct) ?? "", s = JSON.parse(t);
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
    return this.dragging === null ? null : e.dataTransfer?.types.includes(Ct) === !0 ? this.dragging.path : null;
  }
  onDragOver(e, t) {
    const s = this.config, r = this.draggedPath(e);
    if (!s || r === null) return;
    e.preventDefault();
    const i = this.whereIn(e, t), { toParent: n, index: o } = this.destination(t, i, r), a = Hs(s, r, n, o);
    e.dataTransfer && (e.dataTransfer.dropEffect = a.ok ? "move" : "none"), this.target = { key: g(t.path), where: i, verdict: a };
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
        t.expanded ? this.toggle(t.path) : this.focusPath($e(t.path));
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
        const o = t.kind === "group" ? K(s, [...r, i - 1]) : void 0;
        o !== void 0 && (n = this.tryMove(t.path, [...r, i - 1, "children"], o.children.length));
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
    return e === null || t === void 0 ? null : ve(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
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
    const t = mo(e, this.expanded), s = this.tabbableKey(t);
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
            @keydown=${He}
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
        @keydown=${He}
        @click=${(a) => this.select(a, t.path)}
      >
        ${this.labelFor(t)}
      </button>
      ${i !== null && !i.verdict.ok ? l`<span class="hint">${i.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === r ? this.renderAddMenu(t) : u}
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
      return l`<ha-icon icon=${ge[e.group.kind].icon}></ha-icon>`;
    const t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
    return t ? l`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : l`<ha-icon icon=${$o}></ha-icon>`;
  }
  /** The live and validation read-out a row carries: a badge, and whatever the frame knows. */
  renderRowStatus(e, t) {
    const s = _t(this.errors, t.path), r = s ? l`<span class="badge" title="${s} problem(s) in this group">${s}</span>` : u;
    if (t.kind === "stimulus") {
      const c = t.stimulus, h = c === void 0 ? null : Zr(this.hass, c.entity), f = K(e, $e(t.path)), p = f === void 0 ? void 0 : this.live?.voices[f.id]?.find((v) => v.label === (c?.key ?? c?.entity));
      return l`${r}${h === null ? u : l`<span class="muted chip">${h}</span>`}
      ${p ? l`<span class="chip phase ${p.phase}" title=${this.voiceTitle(p)}>${p.phase}</span>
            <span class="muted chip">${p.value.toFixed(2)}</span>` : u}`;
    }
    const i = t.group, n = i === void 0 ? void 0 : this.live?.groups[i.id], o = n?.max_value ?? i?.max_value ?? e.defaults.max_value, a = n ? Math.max(0, Math.min(100, n.value / (o || 1) * 100)) : 0;
    return l`${r}
    ${n ? l`<div class="meter" title=${this.meterTitle(n, o, t.depth === 0)}>
            <div style="width: ${a}%"></div>
          </div>
          <span class="dot ${n.gated ? "gated" : ""}" title=${n.gated ? "Gate open" : "Gate closed"}></span>` : u}`;
  }
  renderActions(e) {
    const t = e.path;
    if (e.kind === "stimulus")
      return l`<div class="actions" @click=${et} @keydown=${He}>
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
    return s === void 0 ? l`<div class="actions"></div>` : l`<div class="actions" @click=${et} @keydown=${He}>
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
      @click=${et}
      @keydown=${He}
      @dragstart=${et}
    >
      ${at(t.kind).map(
      (s) => l`<button
          type="button"
          role="menuitem"
          data-kind=${s}
          @click=${() => this.addGroup([...e.path, "children"], t.children.length, s)}
        >
          <ha-icon icon=${ge[s].icon}></ha-icon>
          <span>
            <strong>${ge[s].label}</strong>
            <div class="muted">${ge[s].definition}</div>
          </span>
        </button>`
    )}
    </div>`;
  }
};
F.styles = [
  C,
  S`
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
Q([
  d({ attribute: !1 })
], F.prototype, "hass", 2);
Q([
  d({ attribute: !1 })
], F.prototype, "config", 2);
Q([
  d({ attribute: !1 })
], F.prototype, "selection", 2);
Q([
  d({ attribute: !1 })
], F.prototype, "errors", 2);
Q([
  d({ attribute: !1 })
], F.prototype, "live", 2);
Q([
  m()
], F.prototype, "expanded", 2);
Q([
  m()
], F.prototype, "dragging", 2);
Q([
  m()
], F.prototype, "target", 2);
Q([
  m()
], F.prototype, "menu", 2);
F = Q([
  _("al-tree")
], F);
const ze = (e) => e == null || e === "" ? null : e;
function xo(e, t) {
  if (t != null)
    switch (e) {
      case "duration":
        return Y(t);
      case "boolean":
        return t ? "true" : "false";
      default:
        return t;
    }
}
function wo(e, t) {
  if (t == null || t === "") return null;
  switch (e) {
    case "duration":
      return X(t);
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
function _o(e, t) {
  if (t == null) return "unset";
  switch (e) {
    case "duration":
      return ve(t);
    case "boolean":
      return t ? "Yes" : "No";
    case "multiplier":
      return si(t);
    default:
      return String(t);
  }
}
const si = (e) => `${e.toFixed(1)}×`, Js = ["kind", "floor_id", "area_id", "id", "name"], Zs = ["mix", "null_handling", "gain"], pt = {
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
}, ko = {
  id: "Identifies the group and its entities. Changing it re-creates them.",
  name: "Friendly name; falls back to the area's name, then to the id.",
  kind: "What this is on the property. It decides what can go inside it.",
  floor_id: "Bind this to a Home Assistant floor to reuse its name.",
  area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, Gt = (e) => pt[e.name] ?? e.name, Vt = (e) => ko[e.name] ?? "", Eo = [
  "id",
  "name",
  "kind",
  "floor_id",
  "area_id",
  "mix",
  "null_handling",
  "gain"
], So = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], Ao = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], Oo = "How this group's stimuli and children combine into one level.", Po = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", Co = "How loudly 'somebody is here' plays in this group's mix.", ri = { number: { min: 0.1, step: 0.1, mode: "box" } }, ii = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, To = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, ni = (e, t, s) => {
  switch (e) {
    case "null_handling":
      return t.mix === "mean";
    case "gain":
      return !s;
    case "floor_id":
      return t.kind === "floor";
    case "area_id":
      return qe.has(t.kind);
    default:
      return !0;
  }
}, Lo = (e, t) => {
  const s = [...at(t)];
  return s.includes(e.kind) || s.push(e.kind), {
    select: {
      mode: "dropdown",
      options: s.map((r) => ({ value: r, label: ge[r].label }))
    }
  };
};
function qt(e, t, s, r, i = null) {
  const n = {
    id: { text: {} },
    name: { text: {} },
    kind: Lo(e, i),
    floor_id: { floor: {} },
    area_id: { area: {} },
    mix: { select: { mode: "dropdown", options: So } },
    null_handling: { select: { mode: "dropdown", options: Ao } },
    gain: To
  };
  return s.filter((o) => ni(o, e, t)).map((o) => ({ name: o, selector: n[o] }));
}
function Kt(e, t, s, r) {
  const i = {
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
      (n) => ni(n, e, t) && !(n === "area_id" && e.area_id === null) && !(n === "floor_id" && e.floor_id === null)
    ).map((n) => [n, i[n]])
  );
}
function Yt(e, t) {
  const s = { ...e };
  return "id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = ze(t.name)), "kind" in t && typeof t.kind == "string" && (s.kind = t.kind), "floor_id" in t && (s.floor_id = ze(t.floor_id)), "area_id" in t && (s.area_id = ze(t.area_id)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), s;
}
const Xt = (e, t) => Eo.find((s) => e[s] !== t[s]), Do = (e) => e.id === "" || new RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function oi(e, t, s, r, i) {
  const n = { ...e, [t]: s };
  return s === null || (Do(e) && (n.id = i ? Wr(i, s) : zr(s)), e.name === null && r !== null && (n.name = r)), n;
}
const No = (e, t, s, r) => oi(e, "area_id", t, s, r), Ro = (e, t, s, r) => oi(e, "floor_id", t, s, r), ai = "activity_levels.panels";
function li() {
  try {
    const e = localStorage.getItem(ai), t = e === null ? null : JSON.parse(e);
    return t === null || typeof t != "object" || Array.isArray(t) ? {} : t;
  } catch {
    return {};
  }
}
function Mo(e, t) {
  const s = li()[e];
  return typeof s == "boolean" ? s : t;
}
function Io(e, t) {
  try {
    localStorage.setItem(ai, JSON.stringify({ ...li(), [e]: t }));
  } catch {
  }
}
function be(e, t, s, r, i, n, o = u) {
  const a = `${e}:${t}`;
  return l`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${t}
    ?expanded=${Mo(a, i)}
    @expanded-changed=${(c) => {
    Io(a, c.detail.expanded);
  }}
  >
    <div slot="header" class="panel-header">
      <span>${s} ${o}</span>
      <div class="muted">${r}</div>
    </div>
    <div class="panel-body">${n}</div>
  </ha-expansion-panel>`;
}
var jo = Object.defineProperty, Fo = Object.getOwnPropertyDescriptor, Et = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Fo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && jo(t, s, i), i;
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
      id: Ir(e),
      connection: Fr(e),
      one_way: jr(e)
    }));
  }
  emit(e) {
    const { config: t, path: s } = this;
    !t || !s || this.dispatchEvent(D(O(t, [...s, "adjacent"], e), void 0, !0));
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
    return ht(this.config).map(({ group: s }) => s).filter((s) => qe.has(s.kind) && !t.has(s.id));
  }
  errorFor(e) {
    const t = `${(this.path ?? []).join("/")}/adjacent/${e}`;
    return this.errors.find((s) => s.path === t || s.path.startsWith(`${t}/`))?.message;
  }
  render() {
    const e = this.group;
    if (!this.config || !e) return u;
    const t = Us(this.config, e.id), s = this.candidates();
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
          ${this.edges.map((r, i) => this.renderOwn(r, i))}
          ${t.map(({ group: r, edge: i }) => this.renderDeclared(r, i))}
          ${this.edges.length === 0 && t.length === 0 ? l`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>` : u}
        </tbody>
      </table>
      ${s.length === 0 ? u : l`<select
            class="add-edge"
            aria-label="Add an adjacent group"
            .value=${""}
            @change=${(r) => {
      const i = r.target;
      i.value !== "" && (this.emit([...this.edges, { id: i.value, connection: Rr, one_way: !1 }]), i.value = "");
    }}
          >
            <option value="">Add an adjacent group…</option>
            ${s.map((r) => l`<option value=${r.id}>${r.name ?? r.id}</option>`)}
          </select>`}
    `;
  }
  renderOwn(e, t) {
    const s = this.errorFor(t), r = this.nameOf(e.id);
    return l`<tr class="own" data-id=${e.id}>
      <td>${r} ${s ? l`<div class="muted error">${s}</div>` : u}</td>
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${r}"
          .value=${e.connection}
          @change=${(i) => this.edit(t, { connection: i.target.value })}
        >
          ${bn.map(
      (i) => l`<option value=${i} ?selected=${i === e.connection}>${Is[i]}</option>`
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
], Te.prototype, "errors", 2);
Te = Et([
  _("al-adjacency-table")
], Te);
var Ho = Object.defineProperty, Uo = Object.getOwnPropertyDescriptor, W = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Uo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Ho(t, s, i), i;
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
function zo(e, t) {
  return e.select?.options?.find((r) => r.value === t)?.label;
}
let R = class extends b {
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
    e.stopPropagation(), this.emit(wo(this.kind, e.detail?.value));
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
      const t = zo(this.selector, String(e));
      if (t !== void 0) return t;
    }
    return _o(this.kind, e);
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
          .value=${xo(this.kind, this.value)}
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
R.styles = [
  C,
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
W([
  d({ attribute: !1 })
], R.prototype, "hass", 2);
W([
  d()
], R.prototype, "label", 2);
W([
  d({ attribute: !1 })
], R.prototype, "selector", 2);
W([
  d({ attribute: !1 })
], R.prototype, "value", 2);
W([
  d({ attribute: !1 })
], R.prototype, "inherited", 2);
W([
  d({ attribute: "inherited-from" })
], R.prototype, "inheritedFrom", 2);
W([
  d()
], R.prototype, "hint", 2);
W([
  d()
], R.prototype, "kind", 2);
W([
  d()
], R.prototype, "error", 2);
W([
  d({ type: Boolean })
], R.prototype, "disabled", 2);
R = W([
  _("al-override-field")
], R);
const Bo = {
  entity: "Entity",
  mode: "Mode",
  to: "Active states",
  edges: "Fire on",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, Wo = {
  entity: "The entity whose state drives this stimulus.",
  mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
  to: "Which states of this entity count as active.",
  edges: "Which crossings fire a trigger. At least one.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this trigger; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, Qs = (e) => Bo[e.name] ?? e.name, er = (e) => Wo[e.name] ?? "", Go = ["entity", "mode", "gain", "key", "envelope"], le = { duration: { enable_millisecond: !0 } }, ci = {
  number: { min: 0, step: 0.1, mode: "box", unit_of_measurement: "×" }
}, di = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, ds = "Allow retrigger", hs = "When a new trigger is honoured while the envelope is still active.", us = "Stacks", ps = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", fs = {
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
}, Vo = {
  select: {
    mode: "list",
    options: [
      { value: "sustained", label: "Sustained — hold while it is active" },
      { value: "momentary", label: "Momentary — fire on each change" }
    ]
  }
}, qo = ["attack", "decay", "impulse"], Ko = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", Yo = (e, t) => e.mode === "momentary" && qo.includes(t), hi = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "End the trigger" }
    ]
  }
}, Xo = "(unknown preset — using built-in defaults)", ms = [
  { name: "attack", label: "Attack", kind: "duration", selector: le },
  { name: "decay", label: "Decay", kind: "duration", selector: le },
  { name: "sustain", label: "Sustain", kind: "multiplier", selector: ci },
  { name: "release", label: "Release", kind: "duration", selector: le },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: Ke },
  {
    name: "retrigger",
    label: ds,
    kind: "select",
    selector: fs,
    hint: hs
  },
  { name: "stack", label: us, kind: "boolean", selector: Ke, hint: ps },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: hi },
  { name: "debounce", label: "Debounce", kind: "duration", selector: le }
], Jo = ["entity", "mode", "to", "edges", "key"], tr = (e) => Jo.filter((t) => t !== "edges" || e.mode === "momentary"), sr = ["envelope", "gain"], Zo = "How a single trigger rises and falls over time.", Qo = "What makes this stimulus fire, and what it is called in the mix.", ea = "Change part of the preset for this stimulus only.", ta = (e) => ms.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, gs = (e) => [
  { value: "", label: "(default preset)" },
  ...e.envelopes.map((t) => ({ value: t.id, label: t.id }))
];
function rr(e, t, s, r) {
  const i = oo(s, t.entity, t.to), n = {
    entity: { entity: {} },
    mode: Vo,
    to: {
      select: {
        mode: "dropdown",
        multiple: !0,
        // The table behind `stateOptions` cannot know every domain, so an exotic entity
        // can still be typed at. The field just stops *asking* to be typed at.
        custom_value: !0,
        options: no(s, t.entity, t.to)
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
    gain: di,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: gs(e) } }
  };
  return r.map((o) => ({ name: o, selector: n[o] }));
}
function ir(e, t) {
  const s = {
    entity: e.entity,
    mode: e.mode,
    to: e.to,
    edges: e.edges,
    gain: e.gain,
    key: e.key ?? "",
    envelope: e.envelope ?? ""
  };
  return Object.fromEntries(t.map((r) => [r, s[r]]));
}
const nr = (e) => Array.isArray(e) ? e.filter((t) => typeof t == "string" && t !== "") : [];
function sa(e, t) {
  const s = { ...e };
  if ("entity" in t && (s.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (s.mode = t.mode), "to" in t && (s.to = nr(t.to)), "edges" in t) {
    const r = nr(t.edges).filter((i) => i === "enter" || i === "leave");
    r.length > 0 && (s.edges = r);
  }
  return "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = ze(t.key)), "envelope" in t && (s.envelope = ze(t.envelope)), s;
}
const or = (e, t) => e.length === t.length && e.every((s, r) => s === t[r]);
function ra(e, t) {
  return or(e.to, t.to) ? or(e.edges, t.edges) ? Go.find((s) => e[s] !== t[s]) : "edges" : "to";
}
function ia(e, t, s) {
  const r = Vr(e, t.envelope);
  return r ? r[s] === null || r[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : Xo;
}
function na(e, t) {
  return t == null || e === void 0 ? null : ve(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
const ui = (e) => e.release * e.sustain, pi = (e) => Math.max(1, e.sustain), Jt = (e) => e.sustain / pi(e);
function fi(e, t = 0.25) {
  if (e.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
  const s = ui(e), r = e.attack + e.decay + s, i = r > 0 ? r * t / (1 - t) : 1, n = r + i, o = 1 / pi(e), a = Jt(e);
  let c = 0;
  const h = [{ x: 0, y: 0 }];
  return c += e.attack, h.push({ x: c / n, y: o }), c += e.decay, h.push({ x: c / n, y: a }), c += i, h.push({ x: c / n, y: a }), c += s, h.push({ x: c / n, y: 0 }), h;
}
function oa(e, t = 0.25) {
  const s = fi(e, t), r = (n) => ((s[n]?.x ?? 0) + (s[n + 1]?.x ?? 0)) / 2;
  if (e.impulse) {
    const n = [{ text: "impulse", x: 0 }];
    return e.release > 0 && n.push({ text: `R ${ve(e.release)}`, x: r(1) }), n;
  }
  const i = [];
  return e.attack > 0 && i.push({ text: `A ${ve(e.attack)}`, x: r(0) }), e.decay > 0 && i.push({ text: `D ${ve(e.decay)}`, x: r(1) }), i.push({ text: `S ${si(e.sustain)}`, x: r(2) }), ui(e) > 0 && i.push({ text: `R ${ve(e.release)}`, x: r(3) }), i;
}
var aa = Object.defineProperty, la = Object.getOwnPropertyDescriptor, mi = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? la(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && aa(t, s, i), i;
};
const Ye = 10, ft = 190, ca = 10, Pe = 58, da = 72, it = (e) => Ye + e * (ft - Ye), Tt = (e) => Pe - e * (Pe - ca), Be = (e) => String(Math.round(e * 10) / 10), Lt = (e, t) => `${Be(e)},${Be(t)}`, ha = (e) => Math.min(ft - 6, Math.max(Ye + 6, it(e)));
let mt = class extends b {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const e = this.envelope;
    if (!e) return u;
    const t = fi(e), s = t[0], r = t[t.length - 1], i = t.map((c) => Lt(it(c.x), Tt(c.y))).join(" "), n = `${Lt(it(s.x), Pe)} ${i} ${Lt(it(r.x), Pe)}`, o = oa(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return l`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${Ye} y1=${Pe} x2=${ft} y2=${Pe}></line>
        ${e.impulse ? u : A`<line
              class="grid"
              x1=${Ye}
              y1=${Be(Tt(Jt(e)))}
              x2=${ft}
              y2=${Be(Tt(Jt(e)))}
            ></line>`}
        <polygon class="area" points=${n}></polygon>
        <polyline class="curve" points=${i}></polyline>
        ${o.map(
      (c) => A`<text class="caption" x=${Be(ha(c.x))} y=${da} text-anchor="middle">${c.text}</text>`
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
mi([
  d({ attribute: !1 })
], mt.prototype, "envelope", 2);
mt = mi([
  _("al-envelope-sketch")
], mt);
var ua = Object.defineProperty, pa = Object.getOwnPropertyDescriptor, Je = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? pa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && ua(t, s, i), i;
};
const fa = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } };
let we = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  /** One override, written as a whole block so a config that predates presence fills in. */
  setPresence(e, t) {
    const { config: s, path: r } = this;
    if (!s || !r) return;
    const i = L(s, r);
    if (!i) return;
    const n = O(s, [...r, "presence"], {
      ...i.presence ?? Wt(),
      [e]: t
    });
    this.dispatchEvent(D(n, `${g(r)}:presence:${e}`));
  }
  render() {
    const { config: e, path: t } = this, s = e && t ? L(e, t) : void 0;
    if (!e || !t || !s) return u;
    const r = s.presence ?? Wt(), i = r.envelope ?? j(e).envelope, n = qr(e, { ...r, envelope: i }), o = J(this.errors, [...t, "presence"]);
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
        .selector=${di}
        .value=${r.gain}
        .inherited=${1}
        .inheritedFrom=${"presence"}
        .error=${o.gain}
        @value-changed=${(a) => this.setPresence("gain", a.detail.value ?? 1)}
      ></al-override-field>
      <al-override-field
        class="presence-activity_floor"
        .hass=${this.hass}
        label="Empty-room floor"
        hint="Likelihood of this room at an activity level of 0.0. Set 1 for a room people sleep in: a still sleeper trips no motion, and the estimator must not read that as an empty room."
        kind="number"
        .selector=${fa}
        .value=${r.activity_floor}
        .inherited=${j(e).activity.floor}
        .inheritedFrom=${"presence"}
        .error=${o.activity_floor}
        @value-changed=${(a) => this.setPresence("activity_floor", a.detail.value ?? null)}
      ></al-override-field>
      ${ms.map(
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
we.styles = [C];
Je([
  d({ attribute: !1 })
], we.prototype, "hass", 2);
Je([
  d({ attribute: !1 })
], we.prototype, "config", 2);
Je([
  d({ attribute: !1 })
], we.prototype, "path", 2);
Je([
  d({ attribute: !1 })
], we.prototype, "errors", 2);
we = Je([
  _("al-presence-overrides")
], we);
var ma = Object.defineProperty, ga = Object.getOwnPropertyDescriptor, Ze = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ga(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && ma(t, s, i), i;
};
const va = "People can leave the property from here, so presence can move from here to Away.";
let _e = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  emitChange(e, t) {
    this.dispatchEvent(D(e, t));
  }
  emitSelect(e) {
    this.dispatchEvent(Qr(e));
  }
  /**
   * An identity edit. The two registry pickers route through the binding helpers, because
   * the prefill needs the registry *name* and only this element can see `hass`.
   */
  onIdentityChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const r = L(t, s);
    if (!r) return;
    const i = e.detail?.value ?? {};
    let n = Yt(r, i);
    "area_id" in i && n.area_id !== r.area_id && (n = No(
      n,
      n.area_id,
      n.area_id === null ? null : this.areaName(n.area_id),
      t
    )), "floor_id" in i && n.floor_id !== r.floor_id && (n = Ro(
      n,
      n.floor_id,
      n.floor_id === null ? null : this.floorName(n.floor_id),
      t
    ));
    const o = Xt(n, r);
    o !== void 0 && this.emitChange(O(t, s, n), `${g(s)}:${o}`);
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
    const r = L(t, s);
    if (!r) return;
    const i = Yt(r, e.detail?.value ?? {}), n = Xt(i, r);
    n !== void 0 && this.emitChange(O(t, s, i), `${g(s)}:${n}`);
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
    this.emitChange(xt(e, t));
    const r = $e(t);
    this.emitSelect(r.length ? r : null);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length === 0)
      return l`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = L(e, t);
    if (!s) return l`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const r = t.length === 2, i = this.errors.filter((a) => a.path === g(t)), n = J(this.errors, t), o = t.length > 2 ? L(e, $e(t)) : void 0;
    return l`
      <ha-card header="Group">
        ${i.map((a) => l`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        ${be(
      "group",
      "identity",
      "Identity",
      ge[s.kind].definition,
      !0,
      l`
            <ha-form
              .hass=${this.hass}
              .data=${Kt(s, r, Js)}
              .schema=${qt(s, r, Js, e, o?.kind ?? null)}
              .error=${n}
              .computeLabel=${Gt}
              .computeHelper=${Vt}
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(e, s, n)}
          `
    )}
        ${be("group", "mix", "Mix", Oo, !0, this.renderMix(e, s, r, n))}
        ${this.renderAdjacency(e, s, n)} ${this.renderPresence(e, s, t)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
  }
  /** Mix, gain, limiter and precision: everything about how this group sums up. */
  renderMix(e, t, s, r) {
    return l`
      <ha-form
        .hass=${this.hass}
        .data=${Kt(t, s, Zs)}
        .schema=${qt(t, s, Zs)}
        .error=${r}
        .computeLabel=${Gt}
        .computeHelper=${Vt}
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${pt.max_value}
        kind="number"
        .selector=${ri}
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
        .selector=${ii}
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
    return qe.has(t.kind) ? be(
      "group",
      "adjacent",
      "Adjacent groups",
      Po,
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
        <div class="muted">${va}</div>
        ${t.exit ? l`<div class="error">${t.exit}</div>` : u}
      </div>
    </div>`;
  }
  /** The group's own presence channel, tuned like any other: only when presence is on. */
  renderPresence(e, t, s) {
    return j(e).enabled ? be(
      "group",
      "presence",
      "Presence",
      Co,
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
    if (qe.has(t.kind)) return u;
    const r = [
      t.adjacent.length > 0 ? "adjacent groups" : null,
      t.exit === !0 ? "a way off the property" : null
    ].filter((n) => n !== null);
    if (r.length === 0) return u;
    const i = s.adjacent ?? s.exit ?? `${ge[t.kind].label} groups have no ${r.join(" and no ")}.`;
    return l`<div class="stale row">
      <div class="grow error">${i}</div>
      <ha-button appearance="plain" @click=${() => this.clearStale(e)}>Remove</ha-button>
    </div>`;
  }
  /** Drops both in one edit, so the document goes from refused to valid in a single undo step. */
  clearStale(e) {
    const t = this.path;
    if (!t) return;
    const s = O(O(e, [...t, "adjacent"], []), [...t, "exit"], !1);
    this.dispatchEvent(D(s, void 0, !0));
  }
};
_e.styles = [
  C,
  S`
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
], _e.prototype, "hass", 2);
Ze([
  d({ attribute: !1 })
], _e.prototype, "config", 2);
Ze([
  d({ attribute: !1 })
], _e.prototype, "path", 2);
Ze([
  d({ attribute: !1 })
], _e.prototype, "errors", 2);
_e = Ze([
  _("al-group-editor")
], _e);
var ba = Object.defineProperty, $a = Object.getOwnPropertyDescriptor, Ne = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? $a(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && ba(t, s, i), i;
};
let ce = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null;
  }
  emitChange(e, t) {
    this.dispatchEvent(D(e, t));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const r = zs(t, s);
    if (!r) return;
    const i = e.detail?.value ?? {}, n = sa(r, i), o = ra(n, r);
    o !== void 0 && this.emitChange(O(t, s, n), `${g(s)}:${o}`);
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
  renderOverride(e, t, s, r) {
    const { config: i } = this, n = Yo(t, e.name);
    return l`<al-override-field
      .hass=${this.hass}
      .label=${e.label}
      .disabled=${n}
      .hint=${n ? Ko : e.hint ?? ""}
      .kind=${e.kind}
      .selector=${e.selector}
      .value=${t[e.name]}
      .inherited=${s[e.name]}
      .inheritedFrom=${i ? ia(i, t, e.name) : "defaults"}
      .error=${r[e.name]}
      @value-changed=${(o) => this.setOverride(e.name, o.detail.value)}
    ></al-override-field>`;
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length < 3)
      return l`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = zs(e, t);
    if (!s) return l`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const r = L(e, $e(t)), i = J(this.errors, t), n = this.errors.filter((f) => f.path === g(t)), o = qr(e, s), a = this.live?.voices[r?.id ?? ""]?.find(
      (f) => f.label === (s.key ?? s.entity)
    ), c = na(this.live?.now, a?.phase_ends), h = ta(s);
    return l`
      <ha-card header="Stimulus">
        ${n.map((f) => l`<ha-alert alert-type="error">${f.message}</ha-alert>`)}
        ${be(
      "stimulus",
      "source",
      "Source",
      Qo,
      !0,
      l`
            <ha-form
              .hass=${this.hass}
              .data=${ir(s, tr(s))}
              .schema=${rr(e, s, this.hass, tr(s))}
              .error=${i}
              .computeLabel=${Qs}
              .computeHelper=${er}
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `
    )}
        ${be(
      "stimulus",
      "envelope",
      "Envelope",
      Zo,
      !0,
      l`
            <ha-form
              .hass=${this.hass}
              .data=${ir(s, sr)}
              .schema=${rr(e, s, this.hass, sr)}
              .error=${i}
              .computeLabel=${Qs}
              .computeHelper=${er}
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(a, c)}
            <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
          `
    )}
        ${be(
      "stimulus",
      "overrides",
      "Override preset",
      ea,
      !1,
      ms.map((f) => this.renderOverride(f, s, o, i)),
      h === 0 ? u : l`<span class="badge">${h} overridden</span>`
    )}
      </ha-card>
    `;
  }
};
ce.styles = [
  C,
  S`
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
Ne([
  d({ attribute: !1 })
], ce.prototype, "hass", 2);
Ne([
  d({ attribute: !1 })
], ce.prototype, "config", 2);
Ne([
  d({ attribute: !1 })
], ce.prototype, "path", 2);
Ne([
  d({ attribute: !1 })
], ce.prototype, "errors", 2);
Ne([
  d({ attribute: !1 })
], ce.prototype, "live", 2);
ce = Ne([
  _("al-stimulus-editor")
], ce);
var ya = Object.defineProperty, xa = Object.getOwnPropertyDescriptor, re = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? xa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && ya(t, s, i), i;
};
const wa = {
  label: "Name",
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, _a = {
  label: "What this preset is called in the panel. Blank shows the id instead.",
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to travel from the peak to the sustain level.",
  sustain: "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
  release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
  impulse: "Fire and forget: the trigger ends the moment it starts, leaving only the release."
}, ka = [
  "label",
  "id",
  "attack",
  "decay",
  "sustain",
  "release",
  "impulse"
], Ea = { boolean: {} }, Sa = [
  { name: "label", selector: { text: {} } },
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: le },
  { name: "decay", selector: le },
  { name: "sustain", selector: ci },
  { name: "release", selector: le },
  { name: "impulse", selector: Ea }
], Aa = [
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
    selector: hi
  },
  {
    name: "debounce",
    label: "Debounce",
    kind: "duration",
    selector: le
  }
], ar = "text/plain", Oa = 36, Dt = (e) => e.stopPropagation();
let z = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => wa[e.name] ?? e.name, this.computeHelper = (e) => _a[e.name] ?? "";
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
    this.dispatchEvent(D(e, t));
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
    const r = _n(s, ["envelopes"], e, t);
    if (r === s) return;
    const i = s.envelopes[this.selected]?.id, n = r.envelopes.findIndex((o) => o.id === i);
    this.selected = n === -1 ? 0 : n, this.blocked = null, this.emitChange(r);
  }
  onDragStart(e, t) {
    e.dataTransfer?.setData(ar, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
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
    const s = e.currentTarget.getBoundingClientRect(), r = s.height || Oa;
    return e.clientY - s.top < r / 2 ? t : t + 1;
  }
  /**
   * Whether this drag is ours. `getData` is unreadable during `dragover` -- the browser
   * holds the store in protected mode -- so the index comes from the state set at
   * `dragstart` and the type list is what says the thing over the row is one of our rows.
   */
  isOurs(e) {
    return this.dragging !== null && e.dataTransfer?.types.includes(ar) === !0;
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
        Cn(Rn(e, "preset"))
      )
    ), this.selected = t;
  }
  removePreset(e) {
    const t = this.config;
    if (!t) return;
    const s = t.envelopes[e];
    if (!s) return;
    const r = Mn(t, s.id);
    if (r.defaults || r.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...r };
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
      id: String(i.id ?? ""),
      attack: X(i.attack) ?? r.attack,
      decay: X(i.decay) ?? r.decay,
      sustain: typeof i.sustain == "number" ? i.sustain : r.sustain,
      release: X(i.release) ?? r.release,
      impulse: typeof i.impulse == "boolean" ? i.impulse : r.impulse
    }, a = ka.find((f) => o[f] !== r[f]);
    if (a === void 0) return;
    const c = ["envelopes", s], h = O(In(t, s, o.id), c, o);
    this.emitChange(h, `${g(c)}:${a}`);
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
        ${e.envelopes.map((s, r) => this.renderPresetRow(e, s, r))}
        ${e.envelopes.length === 0 ? l`<p class="muted">No presets yet.</p>` : u}
        ${t ? l`<ha-alert alert-type="warning">${Ca(t)}</ha-alert>` : u}
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
          >${t.id === "" && t.label === null ? "(unnamed preset)" : Tn(t)}</span
        >
        ${t.label !== null && t.label.trim() !== "" ? l`<span class="muted id">${t.id}</span>` : u}
      </button>
      ${r ? l`<span class="badge" title="${r} problem(s)">${r}</span>` : u}
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
          @dragstart=${Dt}
          @click=${Dt}
          @change=${() => this.setDefault(s)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
        @dragstart=${Dt}
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
    const r = ["envelopes", t], i = J(this.errors, r), n = this.errors.filter((c) => c.path === g(r)), o = {
      label: s.label ?? "",
      id: s.id,
      attack: Y(s.attack),
      decay: Y(s.decay),
      sustain: s.sustain,
      release: Y(s.release),
      impulse: s.impulse
    }, a = Pa(e, t, s);
    return l`
      <ha-card header="Envelope preset">
        ${n.map((c) => l`<ha-alert alert-type="error">${c.message}</ha-alert>`)}
        ${a ? l`<ha-alert alert-type="warning">${a}</ha-alert>` : u}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Sa}
          .error=${i}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Aa.map(
      (c) => l`<al-override-field
              .hass=${this.hass}
              .label=${c.label}
              .hint=${c.hint ?? ""}
              .kind=${c.kind}
              .selector=${c.kind === "boolean" ? Ke : c.selector}
              .value=${s[c.name]}
              .inherited=${e.defaults[c.name]}
              .inheritedFrom=${"defaults"}
              .error=${i[c.name]}
              @value-changed=${(h) => this.setOverride(c.name, h.detail.value)}
            ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
z.styles = [
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
], z.prototype, "hass", 2);
re([
  d({ attribute: !1 })
], z.prototype, "config", 2);
re([
  d({ attribute: !1 })
], z.prototype, "errors", 2);
re([
  d({ type: Boolean })
], z.prototype, "narrow", 2);
re([
  m()
], z.prototype, "selected", 2);
re([
  m()
], z.prototype, "blocked", 2);
re([
  m()
], z.prototype, "dragging", 2);
re([
  m()
], z.prototype, "dropAt", 2);
z = re([
  _("al-envelopes")
], z);
function Pa(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((r, i) => i !== t && r.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Ca(e) {
  const t = [];
  return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(
    `group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`
  ), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
var Ta = Object.defineProperty, La = Object.getOwnPropertyDescriptor, St = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? La(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Ta(t, s, i), i;
};
const Da = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: ds,
  stack: us,
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, Na = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its trigger.",
  retrigger: hs,
  stack: ps,
  debounce: "Minimum time between triggers per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, Ra = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "stack",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], Nt = { duration: { enable_millisecond: !0 } }, Ma = { number: { min: 0.1, step: 0.1, mode: "box" } }, Ia = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, ja = { boolean: {} }, Fa = {
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
    super(...arguments), this.errors = [], this.computeLabel = (e) => Da[e.name] ?? e.name, this.computeHelper = (e) => Na[e.name] ?? "";
  }
  schemaFor(e) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: e.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: Ma },
      { name: "precision", selector: Ia },
      { name: "unavailable", selector: Fa },
      { name: "retrigger", selector: fs },
      { name: "stack", selector: ja },
      { name: "debounce", selector: Nt },
      { name: "safety_refresh", selector: Nt },
      { name: "min_wake_interval", selector: Nt }
    ];
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config;
    if (!t) return;
    const s = t.defaults, r = e.detail?.value ?? {}, i = Number(r.precision), n = {
      envelope: typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : s.envelope,
      max_value: typeof r.max_value == "number" ? r.max_value : s.max_value,
      precision: Number.isFinite(i) ? i : s.precision,
      unavailable: r.unavailable ?? s.unavailable,
      retrigger: r.retrigger ?? s.retrigger,
      stack: typeof r.stack == "boolean" ? r.stack : s.stack,
      debounce: X(r.debounce) ?? s.debounce,
      safety_refresh: X(r.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: X(r.min_wake_interval) ?? s.min_wake_interval
    }, o = Ra.find((a) => n[a] !== s[a]);
    o !== void 0 && this.emitChange(O(t, ["defaults"], n), `defaults:${o}`);
  }
  emitChange(e, t) {
    this.dispatchEvent(D(e, t));
  }
  render() {
    const e = this.config;
    if (!e) return l`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const t = e.defaults, s = J(this.errors, ["defaults"]), r = this.errors.filter((n) => n.path === "defaults"), i = {
      envelope: t.envelope,
      max_value: t.max_value,
      precision: String(t.precision),
      unavailable: t.unavailable,
      retrigger: t.retrigger,
      stack: t.stack,
      debounce: Y(t.debounce),
      safety_refresh: Y(t.safety_refresh),
      min_wake_interval: Y(t.min_wake_interval)
    };
    return l`
      <div class="pad">
        <ha-card header="Defaults">
          ${r.map((n) => l`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
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
St([
  d({ attribute: !1 })
], Le.prototype, "hass", 2);
St([
  d({ attribute: !1 })
], Le.prototype, "config", 2);
St([
  d({ attribute: !1 })
], Le.prototype, "errors", 2);
Le = St([
  _("al-defaults")
], Le);
const vs = 0.1, bs = 10, $s = Math.log10(vs), Ha = Math.log10(bs), gi = Ha - $s, At = (e) => Math.min(bs, Math.max(vs, e)), ys = (e) => Math.round(e * 100) / 100, lr = (e) => ys(At(e));
function Ua(e) {
  return (Math.log10(At(e)) - $s) / gi;
}
function za(e) {
  const t = Math.min(1, Math.max(0, e));
  return ys(At(Math.pow(10, $s + t * gi)));
}
function Ba(e, t, s = !1) {
  const r = s ? 1.05 : 1.25;
  return ys(At(t === 1 ? e * r : e / r));
}
function Wa(e) {
  let t = e.toFixed(2).replace(/0+$/, "");
  return t.endsWith(".") && (t += "0"), t;
}
const Ga = {
  min: vs,
  max: bs,
  toPosition: Ua,
  fromPosition: za,
  clamp: lr,
  step: (e, t, s = !1) => Ba(e, t, s),
  page: (e, t) => lr(t === 1 ? e * 2 : e / 2),
  format: Wa,
  reset: 1
}, Va = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function qa(e, t) {
  const s = e > 0 ? e : 1, r = Va(t), i = 10 ** -r, n = (a) => Number(Math.min(s, Math.max(0, a)).toFixed(r)), o = Math.max(i, Number((s / 10).toFixed(r)));
  return {
    min: 0,
    max: s,
    toPosition: (a) => Math.min(1, Math.max(0, a / s)),
    fromPosition: (a) => n(Math.min(1, Math.max(0, a)) * s),
    clamp: n,
    step: (a, c, h = !1) => n(a + c * (h ? i : o)),
    page: (a, c) => n(a + c * s / 4),
    format: (a) => wt(n(a), r),
    reset: null
  };
}
var Ka = Object.defineProperty, Ya = Object.getOwnPropertyDescriptor, G = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ya(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Ka(t, s, i), i;
};
const Zt = 12, Rt = (e) => `${Math.round(e * 1e3) / 10}%`;
let M = class extends b {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.focusable = !0, this.readOnly = !1, this.label = "Gain", this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1, this.onWheel = (e) => {
      this.disabled || e.deltaY === 0 || (e.preventDefault(), this.commit(this.scale.step(this.current, e.deltaY < 0 ? 1 : -1, e.shiftKey)));
    };
  }
  get scale() {
    return this.mode === "level" ? qa(this.max, this.precision) : Ga;
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
    const e = this.scale, t = e.clamp(this.current), s = e.toPosition(t), r = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), i = l`
      ${this.mode === "gain" ? l`<div class="unity"></div>` : u}
      <div class="fill" style="height: ${Rt(s)}"></div>
      ${r === null ? u : l`<div class="tick" style="bottom: ${Rt(e.toPosition(r))}" title=${e.format(r)}></div>`}
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
          ${i}
          <div class="knob" style="bottom: calc(${Rt(s)} - ${Math.round((s - 0.5) * Zt * 10) / 10}px - ${Zt / 2}px)"></div>
        </div>
        <div class="value">${e.format(t)}</div>
      </div>
    `;
  }
};
M.styles = S`
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
      height: ${Zt}px;
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
G([
  d({ type: Number })
], M.prototype, "value", 2);
G([
  d({ type: Boolean, reflect: !0 })
], M.prototype, "disabled", 2);
G([
  d({ type: Boolean })
], M.prototype, "focusable", 2);
G([
  d({ type: Boolean, reflect: !0, attribute: "readonly" })
], M.prototype, "readOnly", 2);
G([
  d({ type: String })
], M.prototype, "label", 2);
G([
  d({ type: String })
], M.prototype, "mode", 2);
G([
  d({ type: Number })
], M.prototype, "max", 2);
G([
  d({ type: Number })
], M.prototype, "precision", 2);
G([
  d({ type: Number })
], M.prototype, "tick", 2);
G([
  m()
], M.prototype, "dragValue", 2);
M = G([
  _("al-fader")
], M);
const Xa = { ATTRIBUTE: 1 }, Ja = (e) => (...t) => ({ _$litDirective$: e, values: t });
class Za {
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
const cr = Ja(class extends Za {
  constructor(e) {
    if (super(e), e.type !== Xa.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
    return xe;
  }
});
var Qa = Object.defineProperty, el = Object.getOwnPropertyDescriptor, Ot = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? el(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Qa(t, s, i), i;
};
const tl = (e) => `${Math.round(e * 1e3) / 10}%`;
let De = class extends b {
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
        <div class=${cr({ fill: !0, hot: e > 0.9 })} style="width: ${tl(e)}"></div>
      </div>
      <div class=${cr({ dot: !0, gated: this.gated })}></div>
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
], De.prototype, "gated", 2);
De = Ot([
  _("al-meter")
], De);
var sl = Object.defineProperty, rl = Object.getOwnPropertyDescriptor, U = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? rl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && sl(t, s, i), i;
};
const il = 250;
let N = class extends b {
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
    this.dispatchEvent(ao());
  }
  clearStepTimer() {
    this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
  }
  sendOverride(e) {
    this.clearStepTimer(), this.dispatchEvent(Ks(e));
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
      this.stepTimer = void 0, this.dispatchEvent(Ks(t));
    }, il);
  }
  onMute() {
    this.dispatchEvent(lo(!this.muted));
  }
  onReset() {
    this.dispatchEvent(co());
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
        <div class="readout">${wt(e, this.precision)}</div>
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
], N.prototype, "errors", 2);
U([
  m()
], N.prototype, "pending", 2);
N = U([
  _("al-strip")
], N);
var nl = Object.defineProperty, ol = Object.getOwnPropertyDescriptor, ie = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ol(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && nl(t, s, i), i;
};
const al = 8e3, ll = (e) => e instanceof Error ? e.message : String(e);
let B = class extends b {
  constructor() {
    super(...arguments), this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.live = null, this.narrow = !1, this.editing = Wn(), this.commandError = null, this.pendingFocus = !1;
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
    const s = Gr(t.selection), r = L(e, s);
    return r === void 0 ? null : { path: s, group: r };
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
    }, al);
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
        await t(r), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(ho());
      } catch (i) {
        s?.settle(null), this.fail(`Could not ${e}: ${ll(i)}`);
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
      async (i) => s.settle(await sn(i, t.id, r)),
      s
    );
  }
  onMuteToggle(e) {
    const t = this.trackOf(e);
    if (!t) return;
    const { muted: s } = e.detail;
    this.command(`${s ? "mute" : "unmute"} ${t.id}`, (r) => rn(r, t.id, s));
  }
  onReset(e) {
    const t = this.trackOf(e);
    t && this.command(`reset ${t.id}`, (s) => nn(s, t.id));
  }
  onEditToggle(e) {
    this.editing = e.target.checked === !0, Gn(this.editing);
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
  renderTrack(e, t, s, r) {
    const i = L(e, t.path);
    if (!i) return l``;
    const n = this.live?.groups[i.id], o = this.isSelected(t.path);
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
        .maxValue=${n?.max_value ?? i.max_value ?? e.defaults.max_value}
        .precision=${n?.precision ?? as(e, i)}
        .muted=${n?.muted ?? !1}
        .selected=${o}
        .errors=${_t(this.errors, t.path)}
      ></al-strip>
    `;
  }
  renderBand(e, t) {
    const s = e.expanded ? e.depth + 1 : t.rows + 1, r = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${s};`, i = e.id === this.selectedId ? 0 : -1;
    return e.expanded ? l`
          <div class="band" role="group" aria-label=${e.label} style=${r}>
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
    const t = Hn(e, this.nav), s = t.kinds.map((i) => i === "tab" ? "var(--al-tab-w)" : "var(--al-strip-w)").join(" "), r = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
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
B.styles = [
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
], B.prototype, "hass", 2);
ie([
  d({ attribute: !1 })
], B.prototype, "config", 2);
ie([
  d({ attribute: !1 })
], B.prototype, "nav", 2);
ie([
  d({ attribute: !1 })
], B.prototype, "errors", 2);
ie([
  d({ attribute: !1 })
], B.prototype, "live", 2);
ie([
  d({ type: Boolean, reflect: !0 })
], B.prototype, "narrow", 2);
ie([
  m()
], B.prototype, "editing", 2);
ie([
  m()
], B.prototype, "commandError", 2);
B = ie([
  _("al-mixer")
], B);
const cl = {
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
}, dl = {
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400
};
function hl(e, t, s) {
  return {
    start: e - cl[t],
    end: e,
    resolution: t === "24h" ? "5m" : "1h",
    forecastUntil: s === "off" ? void 0 : e + dl[s]
  };
}
function ul(e, t, s) {
  const r = t - e || 1;
  return (i) => (i - e) / r * s;
}
function pl(e, t, s = 4) {
  const r = e || 1, i = t - 2 * s;
  return (n) => t - s - n / r * i;
}
function gt(e, t) {
  t = Math.max(4, t);
  const s = e.length;
  if (s <= t) return e;
  const r = Math.max(1, Math.floor(t / 2)), i = Math.ceil(s / r), n = [];
  for (let o = 0; o < s; o += i) {
    const a = Math.min(o + i, s);
    let c = e[o], h = e[o];
    for (let f = o + 1; f < a; f++) {
      const p = e[f];
      p[1] < c[1] && (c = p), p[1] > h[1] && (h = p);
    }
    c === h ? n.push(c) : c[0] <= h[0] ? n.push(c, h) : n.push(h, c);
  }
  return n[0] !== e[0] && (n[0] = e[0]), n[n.length - 1] !== e[s - 1] && (n[n.length - 1] = e[s - 1]), n;
}
function Qt(e, t, s) {
  return e.length === 0 ? "" : e.map(([r, i], n) => `${n === 0 ? "M" : "L"}${t(r)},${s(i)}`).join(" ");
}
function fl(e, t, s, r = 1 / 0) {
  if (e.p75.length === 0) return "";
  const i = (c) => c.map((h, f) => [e.t0 + f * e.step, h]), n = gt(i(e.p75), r), o = gt(i(e.p25), r).reverse();
  return `${[...n, ...o].map(([c, h], f) => `${f === 0 ? "M" : "L"}${t(c)},${s(h)}`).join(" ")} Z`;
}
function ml(e, t) {
  return e[t].map((s, r) => [e.t0 + r * e.step, s]);
}
function gl(e, t, s, r, i) {
  const n = e[e.length - 1];
  return !n || t <= n[0] || t < r || t > i ? [] : [n, [t, s]];
}
function Mt(e, t, s) {
  return e.map(([r, i, n]) => ({ x0: t(r), x1: t(i ?? s), tag: n }));
}
function dr(e, t) {
  if (e.length === 0) return -1;
  let s = 0, r = e.length - 1;
  for (; s < r; ) {
    const i = s + r >> 1;
    e[i][0] < t ? s = i + 1 : r = i;
  }
  return s > 0 && Math.abs(e[s - 1][0] - t) <= Math.abs(e[s][0] - t) ? s - 1 : s;
}
function vl(e) {
  return [e.group_id, e.start, e.end, e.resolution, e.include_children ?? !1, e.forecast_until ?? ""].join("|");
}
var bl = Object.defineProperty, $l = Object.getOwnPropertyDescriptor, T = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? $l(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && bl(t, s, i), i;
};
const Oe = 32, yl = 28, xl = 4, hr = 8, wl = 800, _l = 220, kl = 160, It = 2e3, El = 6e4, Sl = 1e4, vi = 6e4, Al = 32, Ol = ["24h", "7d", "30d"], Pl = ["off", "24h", "7d"], ur = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], Cl = (e) => `hsl(${e * 67 % 360} 55% 62%)`, oe = /* @__PURE__ */ new Map(), tt = /* @__PURE__ */ new Map();
function pr(e, t) {
  const s = Date.now();
  for (const [r, i] of oe) s - i.at >= vi && oe.delete(r);
  oe.delete(e), oe.set(e, { at: s, data: t });
  for (const r of oe.keys()) {
    if (oe.size <= Al) break;
    oe.delete(r);
  }
}
const Tl = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", Ll = (e, t) => {
  const s = new Date(e * 1e3);
  return t <= 2 * 86400 ? s.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : s.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}, jt = (e) => String(Math.round(e * 100) / 100), Ft = (e, t, s) => Math.min(s, Math.max(t, e));
function Dl(e, t, s, r) {
  const i = Math.max(1, r.width - Oe), n = Math.max(1, r.height - yl), o = s.start, a = Math.max(s.until, s.end), c = ul(o, a, i), h = pl(r.maxValue, n), f = Object.keys(e.series), p = f.includes(t) ? t : f[0] ?? t, v = (w, pe) => {
    const Se = gt(e.series[w] ?? [], It);
    return { id: w, points: Se, d: Qt(Se, c, h), color: pe };
  }, y = v(p, "var(--primary-color)"), x = r.showChannels ? f.filter((w) => w !== p).map((w, pe) => v(w, Cl(pe))) : [], V = e.forecast, Ie = V ? Tl(fl(V, c, h, It)) : "", je = V ? Qt(gt(ml(V, "p50"), It), c, h) : "", te = [];
  for (const [, , w] of e.day_types) te.includes(w) || te.push(w);
  const _s = (w) => ur[te.indexOf(w) % ur.length], wi = Mt(
    e.day_types.map(([w, pe, Se]) => [w, pe, Se]),
    c,
    a
  ).map((w) => ({ ...w, fill: _s(w.tag) })), _i = Mt(
    Object.entries(e.lights).flatMap(
      ([w, pe]) => pe.map(([Se, Ei]) => [Se, Ei, w])
    ),
    c,
    a
  ), ki = Mt(e.plan, c, a);
  return {
    busId: p,
    bus: y,
    children: x,
    band: Ie,
    p50: je,
    dayTypes: wi,
    legend: te.map((w) => ({ tag: w, fill: _s(w) })),
    lights: _i,
    plan: ki,
    x: c,
    y: h,
    t0: o,
    t1: a,
    plotW: i,
    plotH: n
  };
}
let E = class extends b {
  constructor() {
    super(...arguments), this.groupId = null, this.heading = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = $t, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = wl, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
  }
  get height() {
    return this.narrow ? kl : _l;
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
    }, El), this.load();
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
    }, Sl)));
  }
  willUpdate(e) {
    const t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), s = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
    (t || s) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
  }
  query(e) {
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = hl(t, this.range, this.horizon);
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
    const r = this.query(s), i = vl(r), n = e ? void 0 : oe.get(i);
    if (n && Date.now() - n.at < vi) {
      this.seq++, this.loaded = { q: r, data: n.data }, this.error = null, pr(i, n.data);
      return;
    }
    let o = e ? void 0 : tt.get(i);
    if (!o) {
      const c = Zi(t, r);
      o = c, tt.set(i, c), c.then(
        (h) => pr(i, h),
        () => {
        }
      ).finally(() => {
        tt.get(i) === c && tt.delete(i);
      });
    }
    const a = ++this.seq;
    try {
      const c = await o;
      if (a !== this.seq) return;
      this.loaded = { q: r, data: c }, this.error = null;
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
    if (s && s.key.length === t.length && s.key.every((i, n) => i === t[n])) return s.value;
    const r = Dl(
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
    return Ft(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
  }
  /**
   * The live tail, in plot-local pixels: the recorded line's last sample joined to the
   * reading this live frame carries. It costs no round trip, so it moves on every frame
   * while the recorded history behind it catches up on its own schedule.
   */
  tailPath(e) {
    const t = this.groupId, s = this.live;
    if (t === null || s === null) return "";
    const r = s.groups[t];
    return !r || e.bus.id !== t ? "" : Qt(gl(e.bus.points, s.now, r.value, e.t0, e.t1), e.x, e.y);
  }
  emitSettings() {
    this.dispatchEvent(
      uo({
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
    const r = e.currentTarget.getBoundingClientRect(), i = r.width > 0 ? this.width / r.width : 1, n = (e.clientX - r.left) * i - Oe, o = Ft(n / t.plotW, 0, 1);
    return t.t0 + o * (t.t1 - t.t0);
  }
  onMove(e) {
    const t = this.paths;
    !t || t.bus.points.length === 0 || (this.cursorIndex = dr(t.bus.points, this.timeAt(e, t)));
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
    const r = (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1);
    this.cursorIndex = this.cursorIndex === null ? r > 0 ? 0 : s : Ft(this.cursorIndex + r, 0, s);
  }
  renderChips() {
    const e = this.learningHint;
    return l`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${Ol.map(
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
          ${Pl.map((t) => {
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
    const t = this.width, s = this.height, r = e.x(this.nowAt(e)), i = this.tailPath(e), n = e.plotH + xl, o = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), a = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
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
      (c) => A`
            <line class="grid" x1=${Oe} y1=${e.y(this.maxValue * c)} x2=${t} y2=${e.y(this.maxValue * c)}></line>
            <text class="ytick" x=${Oe - 4} y=${e.y(this.maxValue * c) + 3} text-anchor="end">
              ${jt(this.maxValue * c)}
            </text>
          `
    )}
        <g transform="translate(${Oe},0)">
          ${e.dayTypes.map(
      (c) => A`<rect
              class="daytype"
              x=${c.x0}
              y="0"
              width=${Math.max(0, c.x1 - c.x0)}
              height=${e.plotH}
              fill=${c.fill}
            ></rect>`
    )}
          ${e.band ? A`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? A`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((c) => A`<path class="child" d=${c.d} stroke=${c.color}></path>`)}
          ${e.bus.d ? A`<path class="bus" d=${e.bus.d}></path>` : u}
          ${i ? A`<path class="tail" d=${i}></path>` : u}
          ${this.showLights ? e.lights.map(
      (c) => A`<rect
                  class="light"
                  x=${c.x0}
                  y=${n}
                  width=${Math.max(1, c.x1 - c.x0)}
                  height=${hr}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`
    ) : u}
          ${this.showLights ? e.plan.map(
      (c) => A`<rect
                  class="plan"
                  x=${c.x0}
                  y=${n}
                  width=${Math.max(1, c.x1 - c.x0)}
                  height=${hr}
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
      ([r, i]) => A`<text class="xlabel" x=${r * e.plotW} y=${t} text-anchor=${i}>
        ${Ll(e.t0 + r * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`
    );
  }
  renderTooltip(e) {
    const t = this.cursorIndex;
    if (t === null) return u;
    const s = e.bus.points[t];
    if (!s) return u;
    const [r, i] = s, o = (Oe + e.x(r)) / this.width * 100, a = this.loaded?.data.day_types.find(([c, h]) => r >= c && r < h)?.[2];
    return l`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${new Date(r * 1e3).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${jt(i)}</span>
        </div>
        ${e.children.map((c) => {
      const h = dr(c.points, r), f = c.points[h];
      return f ? l`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${c.color}"></span>
                  <span class="tt-name">${c.id}</span>
                  <span class="tt-value">${jt(f[1])}</span>
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
E.styles = [
  C,
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
T([
  d({ attribute: !1 })
], E.prototype, "hass", 2);
T([
  d({ attribute: !1 })
], E.prototype, "groupId", 2);
T([
  d({ attribute: !1 })
], E.prototype, "heading", 2);
T([
  d({ attribute: !1 })
], E.prototype, "range", 2);
T([
  d({ attribute: !1 })
], E.prototype, "horizon", 2);
T([
  d({ type: Boolean })
], E.prototype, "showChannels", 2);
T([
  d({ type: Boolean })
], E.prototype, "showLights", 2);
T([
  d({ attribute: !1 })
], E.prototype, "live", 2);
T([
  d({ type: Number })
], E.prototype, "maxValue", 2);
T([
  d({ attribute: !1 })
], E.prototype, "profileState", 2);
T([
  d({ type: Number })
], E.prototype, "minDays", 2);
T([
  d({ type: Boolean, reflect: !0 })
], E.prototype, "narrow", 2);
T([
  d({ type: Boolean })
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
var Nl = Object.defineProperty, Rl = Object.getOwnPropertyDescriptor, ue = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Rl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Nl(t, s, i), i;
};
const fr = ["name", "mix", "null_handling", "gain"], Ml = 5, Il = (e) => e[e.length - 2] === "stimuli";
let Z = class extends b {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.simLog = null;
  }
  emitChange(e, t) {
    this.dispatchEvent(D(e, t));
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
    const r = L(t, s);
    if (!r) return;
    const i = Yt(r, e.detail?.value ?? {}), n = Xt(i, r);
    n !== void 0 && this.emitChange(O(t, s, i), `${g(s)}:${n}`);
  }
  /** The switch is Home Assistant's, so this reports the wanted state and lets the shell call it. */
  onSim(e, t) {
    this.dispatchEvent(po(e, t.target.checked === !0));
  }
  onRebuild() {
    this.dispatchEvent(ei());
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
    const r = t.length === 2, i = this.errors.filter((o) => o.path === g(t)), n = J(this.errors, t);
    return l`
      <ha-card header=${s.name ?? s.id}>
        ${i.map((o) => l`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${Kt(s, r, fr)}
              .schema=${qt(s, r, fr)}
              .error=${n}
              .computeLabel=${Gt}
              .computeHelper=${Vt}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${ri}
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
              .selector=${ii}
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
    const r = j(e).enabled && Dn(e).has(t.id);
    return l`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${r ? this.renderPresence(e, t, s) : u}
        ${t.stimuli.length === 0 && !r ? l`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((i, n) => this.renderStimulus(e, [...s, "stimuli", n], i))}
      </div>
    `;
  }
  /**
   * The room's presence channel: a stimulus with no entity. The fields themselves are
   * `al-presence-overrides`, which the Groups editor's Presence panel shows too - only the
   * head, with the live phase on it, belongs to the mixer.
   */
  renderPresence(e, t, s) {
    const r = this.live?.voices[t.id]?.find((i) => i.label === On);
    return l`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${r ? l`<span class="chip phase ${r.phase}">${r.phase}</span>` : u}
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
    const r = this.hass?.states[s.entity], i = r?.attributes.friendly_name ?? (s.entity || "(no entity)"), n = _t(this.errors, t);
    return l`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          ${r ? l`<ha-state-icon .hass=${this.hass} .stateObj=${r}></ha-state-icon>` : l`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${s.key ?? i}</span>
          ${n ? l`<span class="badge" title="${n} problem(s)">${n}</span>` : u}
          ${r ? l`<span class="muted chip">${Zr(this.hass, s.entity)}</span>` : u}
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
    const s = t.id, r = this.live?.groups[s]?.precision ?? as(e, t), i = this.live?.groups[s]?.lights ?? 0, n = this.hass?.states[Dr(s)], o = this.simLog?.blocked[s] ?? null, a = (this.simLog?.entries ?? []).filter((c) => c.group_id === s).sort((c, h) => h.t - c.t).slice(0, Ml);
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
                title=${n === void 0 ? "No simulation switch for this group" : "Presence simulation"}
                @change=${(c) => this.onSim(s, c)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : u}
        ${o !== null ? l`<div class="muted blocked">Blocked: ${o}</div>` : u}
        ${this.renderSensor("expected", "Expected", Nr(s), r)}
        ${this.renderSensor("anomaly", "Anomaly", dn(s), r)}
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
  renderSensor(e, t, s, r) {
    const i = this.hass?.states[s], n = i?.attributes.day_type, o = i?.state, a = o === void 0 ? NaN : Number(o), c = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(a) ? wt(a, r) : o;
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
    return !e || !t || t.length === 0 ? l`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Il(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
  }
};
Z.styles = [
  C,
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
ue([
  d({ attribute: !1 })
], Z.prototype, "hass", 2);
ue([
  d({ attribute: !1 })
], Z.prototype, "config", 2);
ue([
  d({ attribute: !1 })
], Z.prototype, "path", 2);
ue([
  d({ attribute: !1 })
], Z.prototype, "errors", 2);
ue([
  d({ attribute: !1 })
], Z.prototype, "live", 2);
ue([
  d({ attribute: !1 })
], Z.prototype, "profileState", 2);
ue([
  d({ attribute: !1 })
], Z.prototype, "simLog", 2);
Z = ue([
  _("al-strip-controls")
], Z);
var jl = Object.defineProperty, Fl = Object.getOwnPropertyDescriptor, Re = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Fl(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && jl(t, s, i), i;
};
const Hl = 50;
function mr(e) {
  const t = [], s = (r) => {
    t.push({ id: r.id, label: r.name ?? r.id, precision: e ? as(e, r) : 0 }), r.children.forEach(s);
  };
  return e?.groups.forEach(s), t;
}
function Ul(e, t) {
  if (e === void 0) return "—";
  const s = Number(e);
  return e.trim() !== "" && Number.isFinite(s) ? wt(s, t) : e;
}
const gr = (e) => new Date(e * 1e3).toLocaleDateString();
let de = class extends b {
  constructor() {
    super(...arguments), this.profileState = null, this.simLog = null, this.force = !1;
  }
  onRebuild() {
    this.dispatchEvent(ei(this.force));
  }
  renderStatus() {
    const e = this.profileState;
    if (!e) return l`<div class="status muted">Profile not loaded yet.</div>`;
    const { producer: t, generated_at: s, training_window: r, day_types: i, slot_minutes: n } = e.profile;
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
          <span class="window">${gr(r[0])} – ${gr(r[1])}</span>
        </div>
        <div class="muted">${i.join(", ")} · ${n}-minute slots</div>
      </div>
    `;
  }
  renderReadiness() {
    const e = this.profileState, t = mr(this.config);
    if (!e || t.length === 0)
      return l`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
    const s = this.config?.defaults.patterns?.min_days ?? $t;
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
    const r = t.ready[e.id] === !0, i = t.profile.groups[e.id]?.days ?? 0, n = this.hass?.states[Nr(e.id)]?.state;
    return l`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${r ? "yes" : "no"}" title=${r ? "Ready" : `Needs ${s} days`}>
        ${r ? "✓" : "✗"}
      </td>
      <td class="days">${i}</td>
      <td class="expected">${Ul(n, e.precision)}</td>
    </tr>`;
  }
  /** Why a group cannot be simulated right now; the first failing precondition, per group. */
  renderBlocked() {
    const e = Object.entries(this.simLog?.blocked ?? {}).filter(
      (r) => typeof r[1] == "string"
    );
    if (e.length === 0) return u;
    const t = mr(this.config), s = (r) => t.find((i) => i.id === r)?.label ?? r;
    return l`<ul class="blocked">
      ${e.map(([r, i]) => l`<li><span class="group">${s(r)}:</span> <span>${i}</span></li>`)}
    </ul>`;
  }
  renderLog() {
    const e = [...this.simLog?.entries ?? []].sort((t, s) => s.t - t.t).slice(0, Hl);
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
de.styles = [
  C,
  S`
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
Re([
  d({ attribute: !1 })
], de.prototype, "hass", 2);
Re([
  d({ attribute: !1 })
], de.prototype, "config", 2);
Re([
  d({ attribute: !1 })
], de.prototype, "profileState", 2);
Re([
  d({ attribute: !1 })
], de.prototype, "simLog", 2);
Re([
  m()
], de.prototype, "force", 2);
de = Re([
  _("al-patterns")
], de);
const vr = 160, br = 110, st = 60, xs = 120, ws = 54;
function bi(e) {
  const t = [], s = (r, i, n) => {
    const o = i <= 1 ? r.id : n;
    t.push({ id: r.id, label: r.name ?? r.id, branch: o }), r.children.forEach((a) => s(a, i + 1, o));
  };
  return e.groups.forEach((r) => s(r, 0, r.id)), t;
}
function zl(e, t) {
  if (e === 0 && t === 0) return 0;
  const s = e === 0 ? 1 / 0 : xs / 2 / Math.abs(e), r = t === 0 ? 1 / 0 : ws / 2 / Math.abs(t);
  return Math.min(s, r, 0.5);
}
function Bl(e, t) {
  const s = new Set(t.nodes), r = new Set(t.exits), i = [], n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const p of bi(e)) {
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
        x: st + x * vr,
        y: st + v * br,
        exit: r.has(y)
      })
    )
  );
  const c = new Map(a.map((p) => [p.id, p])), h = [];
  for (const [p, v, y] of t.edges) {
    const x = c.get(p), V = c.get(v);
    if (!x || !V) continue;
    const Ie = V.x - x.x, je = V.y - x.y, te = zl(Ie, je);
    h.push({
      a: p,
      b: v,
      oneWay: y,
      x1: x.x + Ie * te,
      y1: x.y + je * te,
      x2: V.x - Ie * te,
      y2: V.y - je * te
    });
  }
  const f = i.reduce((p, v) => Math.max(p, v.length), 1);
  return {
    nodes: a,
    edges: h,
    width: st * 2 + (f - 1) * vr,
    height: st * 2 + (Math.max(i.length, 1) - 1) * br
  };
}
const Wl = (e, t) => ({
  x: e.x1 + (e.x2 - e.x1) * t,
  y: e.y1 + (e.y2 - e.y1) * t
}), $i = (e, t, s) => e.edges.find((r) => r.a === t && r.b === s || r.a === s && r.b === t);
function Gl(e, t) {
  const s = [];
  for (let r = 1; r < t.length; r++) {
    const i = $i(e, t[r - 1], t[r]);
    i && s.push(i);
  }
  return s;
}
var Vl = Object.defineProperty, ql = Object.getOwnPropertyDescriptor, Ee = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ql(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Vl(t, s, i), i;
};
const Ht = xs / 2, Ut = ws / 2, Kl = 2, zt = 9, Yl = 7, P = (e) => String(Math.round(e * 10) / 10);
let se = class extends b {
  constructor() {
    super(...arguments), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
  }
  occupantsOf(e) {
    return this.presence?.occupants[e] ?? [];
  }
  select(e) {
    this.dispatchEvent(fo(e));
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
      const c = $i(e, o, a);
      c && t.push({ name: r, ...Wl(c, 0.5) });
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
    const t = this.occupantsOf(e.id), s = t.slice(0, Kl), r = t.length - s.length, i = this.selected.includes(e.id), n = [...s, ...r > 0 ? [`+${r}`] : []].join(", "), o = [
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
        x=${P(e.x - Ht)}
        y=${P(e.y - Ut)}
        width=${xs}
        height=${ws}
        rx="8"
      ></rect>
      <text class="label" x=${P(e.x)} y=${P(e.y - 4)} text-anchor="middle">${e.label}</text>
      ${n === "" ? u : A`<text class="names" x=${P(e.x)} y=${P(e.y + 13)} text-anchor="middle">${n}</text>`}
      ${t.length === 0 ? u : this.renderBadge(e, t.length)}
      ${e.exit ? this.renderDoor(e) : u}
    </g>`;
  }
  renderBadge(e, t) {
    const s = e.x + Ht - zt - 3, r = e.y - Ut + zt + 3;
    return A`<circle class="badge" cx=${P(s)} cy=${P(r)} r=${zt}></circle>
      <text class="count" x=${P(s)} y=${P(r + 3.5)} text-anchor="middle">${t}</text>`;
  }
  /** A door leaf in the corner: this room is a way out of the house. */
  renderDoor(e) {
    const t = e.x - Ht + 7, s = e.y + Ut - 7;
    return A`<path class="door" d=${`M ${P(t)} ${P(s)} v -14 h 10 v 14 z`}></path>`;
  }
  renderPerson(e) {
    return A`<circle class="person" data-name=${e.name} cx=${P(e.x)} cy=${P(e.y)} r=${Yl}>
      <title>${e.name} is on the move</title>
    </circle>`;
  }
  render() {
    const e = this.config, t = this.topology;
    if (!e || !t || t.nodes.length === 0)
      return l`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
    const s = Bl(e, t), r = new Set(this.paths.flatMap((n) => Gl(s, n))), i = this.summary(s);
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
], se.prototype, "paths", 2);
se = Ee([
  _("al-graph-map")
], se);
const Xl = ["phone", "watch", "tag", "laptop", "other"], Jl = ["activity", "steps", "battery_state"];
var Zl = Object.defineProperty, Ql = Object.getOwnPropertyDescriptor, Qe = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Ql(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Zl(t, s, i), i;
};
const es = {
  phone: "mdi:cellphone",
  watch: "mdi:watch",
  tag: "mdi:tag",
  laptop: "mdi:laptop",
  other: "mdi:bluetooth"
}, yi = {
  phone: "Phone",
  watch: "Watch",
  tag: "Tag",
  laptop: "Laptop",
  other: "Other"
}, ec = {
  activity: "Activity",
  steps: "Steps",
  battery_state: "Battery state"
}, tc = {
  entity: { filter: { domain: "device_tracker", integration: "bermuda" } }
}, sc = { entity: { filter: { domain: "person" } } }, rc = {
  entity: { filter: { domain: "device_tracker", integration: "mobile_app" } }
}, ic = { entity: { filter: { domain: "sensor" } } }, nc = {
  select: { mode: "dropdown", options: Xl.map((e) => ({ value: e, label: yi[e] })) }
};
let ke = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.presence = null;
  }
  get people() {
    return this.config ? j(this.config).people : [];
  }
  emit(e, t, s = !1) {
    const r = this.config;
    if (!r) return;
    const i = { ...j(r), people: e }, n = O(r, ["presence"], i);
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
    this.emit([...this.people, Ur()], "add", !0);
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
    t && this.editPerson(e, { devices: [...t.devices, Hr("")] }, "add-device");
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
        .selector=${ic}
        .label=${ec[r]}
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
    const i = J(this.errors, ["presence", "people", e, "devices", t]), n = J(this.errors, ["presence", "people", e, "devices", t, "signals"]), o = this.found(s, r);
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
          .selector=${tc}
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
          .selector=${nc}
          .label=${"Kind"}
          .required=${!0}
          .value=${r.kind}
          @value-changed=${(a) => this.editDevice(e, t, { kind: a.detail.value ?? "other" }, "kind")}
        ></ha-selector>
        <ha-selector
          class="companion"
          .hass=${this.hass}
          .selector=${rc}
          .label=${"Companion app tracker"}
          .helper=${"The mobile_app device_tracker of the same phone; its sensors say whether it is carried."}
          .required=${!1}
          .value=${this.text(r.companion)}
          @value-changed=${(a) => this.editDevice(e, t, { companion: a.detail.value ? a.detail.value : null }, "companion")}
        ></ha-selector>
        ${Jl.map((a) => this.renderSignal(e, t, r, a, o, n))}
      </div>
    </div>`;
  }
  renderPerson(e, t) {
    const s = J(this.errors, ["presence", "people", e]);
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
          .selector=${sc}
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
var oc = Object.defineProperty, ac = Object.getOwnPropertyDescriptor, ee = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? ac(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && oc(t, s, i), i;
};
const lc = 2e3, $r = {
  enabled: "Estimate room presence",
  devices: "Tracked devices",
  envelope: "Presence envelope",
  threshold: "Confidence threshold",
  stay: "Stay probability",
  escape: "Escape probability",
  scale: "Distance scale",
  floor: "Room floor",
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
}, yr = {
  enabled: "Estimate which room each tracked device is in. Needs Bermuda.",
  devices: "Bermuda device_trackers to follow — one per person.",
  envelope: "Preset the presence channel of every room starts from.",
  threshold: "How sure the estimate has to be before somebody counts as in the room.",
  stay: "Chance of staying put between two updates. Higher is steadier and slower.",
  escape: "Chance of turning up in a room with no path to this one. The way back from a wrong guess.",
  scale: "Distance, in metres, at which a scanner stops telling you anything.",
  floor: "Likelihood given to a room with no scanner of its own.",
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
}, cc = [
  "enabled",
  "envelope",
  "threshold",
  "stay",
  "escape",
  "scale",
  "floor",
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
], xr = ["charging", "moving", "still_room_empty", "jitter"], dc = {
  entity: { multiple: !0, filter: { domain: "device_tracker", integration: "bermuda" } }
}, hc = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }, uc = { number: { min: 0.01, max: 1, step: 0.01, mode: "slider" } }, pc = { number: { min: 0, max: 0.1, step: 1e-3, mode: "box" } }, fc = { number: { min: 0.1, step: 0.1, mode: "box" } }, wr = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } }, Bt = { duration: {} }, _r = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }, mc = { number: { min: -10, max: 10, step: 0.5, mode: "box" } }, kr = " → ", gc = "Give it an area that matches a room, or map it in Settings below.", vc = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", I = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let H = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [], this.pathsPending = !1, this.pathSeq = 0, this.onMapSelect = (e) => {
      e.stopPropagation();
      const t = e.detail.id, s = this.selected.filter((i) => i !== null), r = s.includes(t) ? s.filter((i) => i !== t) : [...s, t].slice(-2);
      this.selected = [r[0] ?? null, r[1] ?? null], this.paths = [], this.refreshPaths();
    }, this.computeLabel = (e) => $r[e.name] ?? e.name, this.computeHelper = (e) => yr[e.name] ?? "", this.onDevicesChanged = (e) => {
      e.stopPropagation();
      const t = this.config;
      if (!t) return;
      const s = j(t), r = { ...s, people: this.mergePeople(e.detail?.value, s.people) };
      this.dispatchEvent(D(O(t, ["presence"], r), "presence:people"));
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.refreshTopology(), this.refreshPresence(), this.timer = setInterval(() => {
      document.visibilityState !== "hidden" && this.refreshPresence();
    }, lc);
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
        this.topology = await on(e);
      } catch {
      }
  }
  async refreshPresence() {
    const e = this.hass;
    if (e)
      try {
        this.presence = await ln(e);
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
      const i = await an(s, e, t);
      r === this.pathSeq && (this.paths = i);
    } catch {
    } finally {
      r === this.pathSeq && (this.pathsPending = !1);
    }
  }
  /** Friendly names for every group, so a room id never reaches the page. */
  get labels() {
    const e = this.config;
    return new Map(e ? bi(e).map((t) => [t.id, t.label]) : []);
  }
  roomName(e) {
    return e == null || e === "" ? "—" : this.labels.get(e) ?? e;
  }
  areaName(e) {
    return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
  }
  trail(e) {
    return e.map((t) => this.roomName(t)).join(kr);
  }
  schemaFor(e) {
    return [
      { name: "enabled", selector: { boolean: {} } },
      { name: "envelope", selector: { select: { mode: "dropdown", options: gs(e) } } },
      { name: "threshold", selector: uc },
      { name: "stay", selector: hc },
      { name: "escape", selector: pc },
      { name: "scale", selector: fc },
      { name: "floor", selector: wr },
      { name: "stuck_after", selector: Bt },
      { name: "activity_floor", selector: wr },
      { name: "carried_prior", selector: _r },
      { name: "carried_flip", selector: Bt },
      { name: "carried_recent", selector: Bt },
      { name: "carried_nearby", selector: _r },
      ...xr.map((t) => ({ name: `carried_${t}`, selector: mc }))
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
    const s = e.filter((o) => typeof o == "string"), r = t.filter((o) => o.devices.some((a) => s.includes(a.tracker))), i = new Set(r.flatMap((o) => o.devices.map((a) => a.tracker))), n = s.filter((o) => !i.has(o)).map((o) => ({ ...Ur(), devices: [Hr(o)] }));
    return [...r, ...n];
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config;
    if (!t) return;
    const s = j(t), r = e.detail?.value ?? {}, i = {
      charging: I(r.carried_charging) ?? s.carried.weights.charging,
      moving: I(r.carried_moving) ?? s.carried.weights.moving,
      still_room_empty: I(r.carried_still_room_empty) ?? s.carried.weights.still_room_empty,
      jitter: I(r.carried_jitter) ?? s.carried.weights.jitter
    }, n = {
      ...s,
      enabled: typeof r.enabled == "boolean" ? r.enabled : s.enabled,
      envelope: r.envelope === void 0 ? s.envelope : typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : null,
      threshold: I(r.threshold) ?? s.threshold,
      stay: I(r.stay) ?? s.stay,
      escape: I(r.escape) ?? s.escape,
      scale: I(r.scale) ?? s.scale,
      floor: I(r.floor) ?? s.floor,
      stuck_after: X(r.stuck_after) ?? s.stuck_after,
      activity: { floor: I(r.activity_floor) ?? s.activity.floor },
      carried: {
        prior: I(r.carried_prior) ?? s.carried.prior,
        flip: X(r.carried_flip) ?? s.carried.flip,
        recent: X(r.carried_recent) ?? s.carried.recent,
        nearby: I(r.carried_nearby) ?? s.carried.nearby,
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
    }, a = cc.find((c) => !o(c));
    a !== void 0 && this.dispatchEvent(D(O(t, ["presence"], n), `presence:${a}`));
  }
  /**
   * Writes one field of the presence block into the draft, exactly as `onFormChanged` does
   * for the full settings form. The setup card only ever touches `enabled`, but the helper
   * is generic so it stays the one place that builds the block.
   */
  setSetting(e, t) {
    const s = this.config;
    if (!s) return;
    const i = { ...j(s), [e]: t };
    this.dispatchEvent(D(O(s, ["presence"], i), `presence:${e}`));
  }
  /**
   * What the tab is before presence exists. The tab is always listed, because a feature you
   * cannot find is a feature nobody turns on — and everything here is the Settings form
   * afterwards, reduced to the two fields that start it.
   */
  renderSetup(e) {
    const t = this.presence?.bermuda === !0, s = j(e);
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
        .selector=${dc}
        .label=${$r.devices}
        .helper=${yr.devices}
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
    const s = `${this.roomName(e)}${kr}${this.roomName(t)}`;
    return this.pathsPending ? l`<div class="paths muted">Finding routes from ${s}…</div>` : this.paths.length === 0 ? l`<div class="paths">
        <div class="muted">no route from ${s}</div>
      </div>` : l`<div class="paths">
      <div class="muted">
        ${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${s}
      </div>
      <ol>
        ${this.paths.map((r) => l`<li class="path">${this.trail(r)}</li>`)}
      </ol>
    </div>`;
  }
  renderPeople() {
    const e = Object.entries(this.presence?.people ?? {}).filter(([, t]) => typeof t.room == "string").sort(([t], [s]) => t.localeCompare(s));
    return e.length === 0 ? l`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >` : l`<ha-card header="People">
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
          ${e.map(([t, s]) => this.renderPerson(t, s))}
        </tbody>
      </table>
    </ha-card>`;
  }
  renderPerson(e, t) {
    const s = Math.round(t.confidence * 100), r = Object.entries(t.devices ?? {}).sort(([i], [n]) => i.localeCompare(n));
    return l`<tr class="device person">
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
    const s = t.carried, r = s !== null && s < 0.5, i = s === null ? "—" : `${Math.round(s * 100)}%`, n = `${t.name} (${yi[t.kind]}): carried ${i}${r && t.room ? `, in ${this.roomName(t.room)}` : ""}`;
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
      <td class="room">${t ? gc : this.roomName(e.group_id)}</td>
    </tr>`;
  }
  renderDisabled() {
    const e = this.presence?.disabled ?? [];
    return e.length === 0 ? u : l`<div class="disabled-sensors">
      ${vc}
      <ul>
        ${e.map((t) => l`<li>${t}</li>`)}
      </ul>
    </div>`;
  }
  renderSettings(e) {
    const t = j(e), s = J(this.errors, ["presence"]), r = this.errors.filter((n) => n.path === "presence"), i = {
      enabled: t.enabled,
      envelope: t.envelope ?? "",
      threshold: t.threshold,
      stay: t.stay,
      escape: t.escape,
      scale: t.scale,
      floor: t.floor,
      stuck_after: Y(t.stuck_after),
      activity_floor: t.activity.floor,
      carried_prior: t.carried.prior,
      carried_flip: Y(t.carried.flip),
      carried_recent: Y(t.carried.recent),
      carried_nearby: t.carried.nearby,
      ...Object.fromEntries(xr.map((n) => [`carried_${n}`, t.carried.weights[n]]))
    };
    return l`<ha-card header="Settings">
      ${r.map((n) => l`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
      <h3>People</h3>
      <al-people-editor
        .hass=${this.hass}
        .config=${e}
        .errors=${this.errors}
        .presence=${this.presence}
      ></al-people-editor>
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
    return e ? j(e).enabled ? l`<div class="page">
      ${this.renderMap(e)} ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : l`<div class="page">${this.renderSetup(e)}</div>` : l`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
  }
};
H.styles = [
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
ee([
  d({ attribute: !1 })
], H.prototype, "hass", 2);
ee([
  d({ attribute: !1 })
], H.prototype, "config", 2);
ee([
  d({ attribute: !1 })
], H.prototype, "errors", 2);
ee([
  d({ type: Boolean })
], H.prototype, "narrow", 2);
ee([
  m()
], H.prototype, "topology", 2);
ee([
  m()
], H.prototype, "presence", 2);
ee([
  m()
], H.prototype, "selected", 2);
ee([
  m()
], H.prototype, "paths", 2);
ee([
  m()
], H.prototype, "pathsPending", 2);
H = ee([
  _("al-presence")
], H);
const bc = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, xi = (e) => e.dash >= 0 ? e.dash : e.indent;
function $c(e) {
  const t = bc.exec(e);
  return t ? t[1] ?? t[2] ?? t[3] ?? null : null;
}
function yc(e) {
  const t = [];
  return e.split(`
`).forEach((s, r) => {
    const i = s.replace(/\s+$/, ""), n = i.trimStart();
    if (n === "" || n.startsWith("#")) return;
    const o = i.length - n.length, a = /^-(?:\s+|$)/.exec(n);
    a ? t.push({ indent: o + a[0].length, dash: o, text: n.slice(a[0].length), line: r + 1 }) : t.push({ indent: o, dash: -1, text: n, line: r + 1 });
  }), t;
}
function xc(e, t, s, r) {
  for (let i = t + 1; i < s; i++) if (xi(e[i]) <= r) return i;
  return s;
}
function wc(e, t, s, r) {
  if (t >= s) return -1;
  const i = e[t].indent;
  for (let n = t; n < s; n++) {
    const o = e[n];
    if (o.indent === i && $c(o.text) === r) return n;
  }
  return -1;
}
function _c(e, t, s, r) {
  if (t >= s || e[t].dash < 0) return -1;
  const i = e[t].dash;
  let n = -1;
  for (let o = t; o < s; o++)
    if (e[o].dash === i && ++n === r)
      return o;
  return -1;
}
function kc(e, t) {
  const s = t.split("/").filter((a) => a !== "");
  if (s.length === 0) return null;
  const r = yc(e);
  let i = 0, n = r.length, o = null;
  for (const a of s) {
    const c = /^\d+$/.test(a) ? _c(r, i, n, Number(a)) : wc(r, i, n, a);
    if (c < 0) return o;
    const h = r[c];
    o = h.line, n = xc(r, c, n, xi(h)), i = h.dash >= 0 ? c : c + 1;
  }
  return o;
}
var Ec = Object.defineProperty, Sc = Object.getOwnPropertyDescriptor, Me = (e, t, s, r) => {
  for (var i = r > 1 ? void 0 : r ? Sc(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (i = (r ? o(t, s, i) : o(i)) || i);
  return r && i && Ec(t, s, i), i;
};
const Ac = 400;
let he = class extends b {
  constructor() {
    super(...arguments), this.errors = [], this.available = !0, this.parseError = null, this.seq = 0, this.onYaml = (e) => {
      e.stopPropagation(), window.clearTimeout(this.timer);
      const t = e.detail;
      this.timer = window.setTimeout(() => {
        this.settle(t);
      }, Ac);
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
      this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(qs(!1, []));
      return;
    }
    this.parseError = null;
    const t = e.value;
    this.mine = t, this.dispatchEvent(D(t, "code")), await this.validate(t);
  }
  async validate(e) {
    const t = this.hass;
    if (!t || !e) return;
    const s = ++this.seq;
    try {
      const { errors: r } = await Lr(t, e);
      s === this.seq && this.dispatchEvent(qs(!0, r));
    } catch {
    }
  }
  /** Puts the cursor on the line `path` names, when the text is one this can walk. */
  jump(e) {
    const t = this.editor, s = t?.codemirror, r = t?.yaml;
    if (!s || typeof r != "string") return;
    const i = kc(r, e);
    if (i === null || i > s.state.doc.lines) return;
    const n = s.state.doc.line(i).from;
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
he.styles = [
  C,
  S`
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
], he.prototype, "hass", 2);
Me([
  d({ attribute: !1 })
], he.prototype, "config", 2);
Me([
  d({ attribute: !1 })
], he.prototype, "errors", 2);
Me([
  d({ type: Boolean })
], he.prototype, "available", 2);
Me([
  m()
], he.prototype, "parseError", 2);
he = Me([
  _("al-code")
], he);
