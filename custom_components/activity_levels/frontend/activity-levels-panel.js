const qe = globalThis, Rt = qe.ShadowRoot && (qe.ShadyCSS === void 0 || qe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Nt = /* @__PURE__ */ Symbol(), Jt = /* @__PURE__ */ new WeakMap();
let Rs = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== Nt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Rt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = Jt.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Jt.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ci = (e) => new Rs(typeof e == "string" ? e : e + "", void 0, Nt), E = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[n + 1], e[0]);
  return new Rs(s, e, Nt);
}, Pi = (e, t) => {
  if (Rt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), r = qe.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, e.appendChild(i);
  }
}, Zt = Rt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return Ci(s);
})(e) : e;
const { is: Ti, defineProperty: Oi, getOwnPropertyDescriptor: Li, getOwnPropertyNames: Mi, getOwnPropertySymbols: Ri, getPrototypeOf: Ni } = Object, it = globalThis, Qt = it.trustedTypes, Di = Qt ? Qt.emptyScript : "", Ii = it.reactiveElementPolyfillSupport, Me = (e, t) => e, Ye = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Di : null;
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
} }, Dt = (e, t) => !Ti(e, t), es = { attribute: !0, type: String, converter: Ye, reflect: !1, useDefault: !1, hasChanged: Dt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), it.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let $e = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = es) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(t, i, s);
      r !== void 0 && Oi(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: r, set: n } = Li(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? es;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Me("elementProperties"))) return;
    const t = Ni(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Me("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Me("properties"))) {
      const s = this.properties, i = [...Mi(s), ...Ri(s)];
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
      for (const r of i) s.unshift(Zt(r));
    } else t !== void 0 && s.push(Zt(t));
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
    return Pi(t, this.constructor.elementStyles), t;
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
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : Ye).toAttribute(s, i.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : Ye;
      this._$Em = r;
      const a = o.fromAttribute(s, n.type);
      this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, r = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? Dt)(n, s) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
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
$e.elementStyles = [], $e.shadowRootOptions = { mode: "open" }, $e[Me("elementProperties")] = /* @__PURE__ */ new Map(), $e[Me("finalized")] = /* @__PURE__ */ new Map(), Ii?.({ ReactiveElement: $e }), (it.reactiveElementVersions ??= []).push("2.1.2");
const It = globalThis, ts = (e) => e, Je = It.trustedTypes, ss = Je ? Je.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ns = "$lit$", Q = `lit$${Math.random().toFixed(9).slice(2)}$`, Ds = "?" + Q, ji = `<${Ds}>`, de = document, Ne = () => de.createComment(""), De = (e) => e === null || typeof e != "object" && typeof e != "function", jt = Array.isArray, Fi = (e) => jt(e) || typeof e?.[Symbol.iterator] == "function", pt = `[ 	
\f\r]`, Oe = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, is = /-->/g, rs = />/g, le = RegExp(`>|${pt}(?:([^\\s"'>=/]+)(${pt}*=${pt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ns = /'/g, os = /"/g, Is = /^(?:script|style|textarea|title)$/i, js = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), c = js(1), x = js(2), ue = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), as = /* @__PURE__ */ new WeakMap(), ce = de.createTreeWalker(de, 129);
function Fs(e, t) {
  if (!jt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ss !== void 0 ? ss.createHTML(t) : t;
}
const Hi = (e, t) => {
  const s = e.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Oe;
  for (let a = 0; a < s; a++) {
    const l = e[a];
    let d, m, p = -1, v = 0;
    for (; v < l.length && (o.lastIndex = v, m = o.exec(l), m !== null); ) v = o.lastIndex, o === Oe ? m[1] === "!--" ? o = is : m[1] !== void 0 ? o = rs : m[2] !== void 0 ? (Is.test(m[2]) && (r = RegExp("</" + m[2], "g")), o = le) : m[3] !== void 0 && (o = le) : o === le ? m[0] === ">" ? (o = r ?? Oe, p = -1) : m[1] === void 0 ? p = -2 : (p = o.lastIndex - m[2].length, d = m[1], o = m[3] === void 0 ? le : m[3] === '"' ? os : ns) : o === os || o === ns ? o = le : o === is || o === rs ? o = Oe : (o = le, r = void 0);
    const C = o === le && e[a + 1].startsWith("/>") ? " " : "";
    n += o === Oe ? l + ji : p >= 0 ? (i.push(d), l.slice(0, p) + Ns + l.slice(p) + Q + C) : l + Q + (p === -2 ? a : C);
  }
  return [Fs(e, n + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Ie {
  constructor({ strings: t, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, l = this.parts, [d, m] = Hi(t, s);
    if (this.el = Ie.createElement(d, i), ce.currentNode = this.el.content, s === 2 || s === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = ce.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(Ns)) {
          const v = m[o++], C = r.getAttribute(p).split(Q), O = /([.?@])?(.*)/.exec(v);
          l.push({ type: 1, index: n, name: O[2], strings: C, ctor: O[1] === "." ? zi : O[1] === "?" ? Bi : O[1] === "@" ? Gi : rt }), r.removeAttribute(p);
        } else p.startsWith(Q) && (l.push({ type: 6, index: n }), r.removeAttribute(p));
        if (Is.test(r.tagName)) {
          const p = r.textContent.split(Q), v = p.length - 1;
          if (v > 0) {
            r.textContent = Je ? Je.emptyScript : "";
            for (let C = 0; C < v; C++) r.append(p[C], Ne()), ce.nextNode(), l.push({ type: 2, index: ++n });
            r.append(p[v], Ne());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Ds) l.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(Q, p + 1)) !== -1; ) l.push({ type: 7, index: n }), p += Q.length - 1;
      }
      n++;
    }
  }
  static createElement(t, s) {
    const i = de.createElement("template");
    return i.innerHTML = t, i;
  }
}
function _e(e, t, s = e, i) {
  if (t === ue) return t;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const n = De(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(e), r._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (t = _e(e, r._$AS(e, t.values), r, i)), t;
}
class Ui {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (t?.creationScope ?? de).importNode(s, !0);
    ce.currentNode = r;
    let n = ce.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let d;
        l.type === 2 ? d = new Ue(n, n.nextSibling, this, t) : l.type === 1 ? d = new l.ctor(n, l.name, l.strings, this, t) : l.type === 6 && (d = new Vi(n, this, t)), this._$AV.push(d), l = i[++a];
      }
      o !== l?.index && (n = ce.nextNode(), o++);
    }
    return ce.currentNode = de, r;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class Ue {
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
    t = _e(this, t, s), De(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== ue && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Fi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && De(this._$AH) ? this._$AA.nextSibling.data = t : this.T(de.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Ie.createElement(Fs(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const n = new Ui(r, this), o = n.u(this.options);
      n.p(s), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let s = as.get(t.strings);
    return s === void 0 && as.set(t.strings, s = new Ie(t)), s;
  }
  k(t) {
    jt(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const n of t) r === s.length ? s.push(i = new Ue(this.O(Ne()), this.O(Ne()), this, this.options)) : i = s[r], i._$AI(n), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = ts(t).nextSibling;
      ts(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class rt {
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
    if (n === void 0) t = _e(this, t, s, 0), o = !De(t) || t !== this._$AH && t !== ue, o && (this._$AH = t);
    else {
      const a = t;
      let l, d;
      for (t = n[0], l = 0; l < n.length - 1; l++) d = _e(this, a[i + l], s, l), d === ue && (d = this._$AH[l]), o ||= !De(d) || d !== this._$AH[l], d === u ? t = u : t !== u && (t += (d ?? "") + n[l + 1]), this._$AH[l] = d;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class zi extends rt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Bi extends rt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Gi extends rt {
  constructor(t, s, i, r, n) {
    super(t, s, i, r, n), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = _e(this, t, s, 0) ?? u) === ue) return;
    const i = this._$AH, r = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== u && (i === u || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Vi {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    _e(this, t);
  }
}
const Wi = It.litHtmlPolyfillSupport;
Wi?.(Ie, Ue), (It.litHtmlVersions ??= []).push("3.3.3");
const qi = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = s?.renderBefore ?? null;
    i._$litPart$ = r = new Ue(t.insertBefore(Ne(), n), n, void 0, s ?? {});
  }
  return r._$AI(e), r;
};
const Ft = globalThis;
let $ = class extends $e {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = qi(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ue;
  }
};
$._$litElement$ = !0, $.finalized = !0, Ft.litElementHydrateSupport?.({ LitElement: $ });
const Ki = Ft.litElementPolyfillSupport;
Ki?.({ LitElement: $ });
(Ft.litElementVersions ??= []).push("4.2.2");
const k = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
const Xi = { attribute: !0, type: String, converter: Ye, reflect: !1, hasChanged: Dt }, Yi = (e = Xi, t, s) => {
  const { kind: i, metadata: r } = s;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(s.name, e), i === "accessor") {
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
  return (t, s) => typeof s == "object" ? Yi(e, t, s) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(e, t, s);
}
function f(e) {
  return h({ ...e, state: !0, attribute: !1 });
}
const Hs = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), Ji = (e) => e.callWS({ type: "activity_levels/config/get" }).then((t) => t.config), Zi = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(Hs);
async function Qi(e, t) {
  try {
    return Hs(await e.callWS({ type: "activity_levels/config/save", config: t }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const er = (e) => e.callWS({ type: "activity_levels/state" }), tr = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), sr = (e) => e.callWS({ type: "activity_levels/profile/get" }), ir = (e, t = !1) => e.callWS({ type: "activity_levels/profile/rebuild", force: t }), rr = (e, t, s = 50) => e.callWS({
  type: "activity_levels/simulation/log",
  limit: s
}), nr = (e, t, s) => e.callWS({ type: "activity_levels/level/set", group_id: t, value: s }).then((i) => i.value), or = (e, t, s) => e.callWS({ type: "activity_levels/mute", group_id: t, muted: s }).then((i) => i.muted), ar = (e, t) => e.callWS({ type: "activity_levels/reset", group_id: t }).then(() => {
}), lr = (e) => e.callWS({ type: "activity_levels/topology" }), cr = (e, t, s) => e.callWS({ type: "activity_levels/topology/paths", from: t, to: s }).then((i) => i.paths), hr = (e) => e.callWS({ type: "activity_levels/presence/state" }), dr = (e, t, s, i) => e.callService(t, s, i), nt = 14, Ht = (e) => `switch.${e}_presence_simulation`, Us = (e) => `sensor.${e}_expected_activity`, ur = (e) => `sensor.${e}_activity_anomaly`, mt = [
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
], pr = 2500, mr = 8e3;
function fr(e) {
  let t;
  return { promise: new Promise((i) => {
    t = setTimeout(i, e);
  }), cancel: () => clearTimeout(t) };
}
async function ls(e, t, s) {
  const i = fr(t);
  try {
    return await Promise.race([e, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function gr() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function vr(e = mr, t = pr) {
  if (mt.every((r) => customElements.get(r))) return { ok: !0, missing: [] };
  await ls(gr(), t, void 0);
  const s = await Promise.all(
    mt.map(
      (r) => ls(
        customElements.whenDefined(r).then(() => !0),
        e,
        !1
      )
    )
  ), i = mt.filter((r, n) => !s[n]);
  return { ok: i.length === 0, missing: [...i] };
}
function ot(e, t) {
  let s = e;
  for (const i of t) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function cs(e) {
  return Array.isArray(e) ? [...e] : { ...e };
}
function at(e, t, s) {
  if (t.length === 0) throw new Error("empty path");
  const i = cs(e);
  let r = i;
  for (let n = 0; n < t.length - 1; n++) {
    const o = t[n], a = cs(r[o]);
    r[o] = a, r = a;
  }
  return s(r, t[t.length - 1]), i;
}
function L(e, t, s) {
  return at(e, t, (i, r) => {
    i[r] = s;
  });
}
function Ut(e, t) {
  return at(e, t, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function At(e, t, s, i) {
  return at(e, [...t, s], (r) => {
    r.splice(s, 0, i);
  });
}
function $r(e, t, s, i) {
  return at(e, [...t, s], (r) => {
    const n = r, [o] = n.splice(s, 1);
    n.splice(i, 0, o);
  });
}
const br = 1e3;
class yr {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < br || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const xr = (e) => ({
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
  presence: Ct(),
  stimuli: [],
  children: []
}), wr = "presence", Ct = () => ({
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
}), Se = (e) => typeof e == "string" ? e : e.id, _r = (e) => typeof e != "string" && e.one_way, Sr = {
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
}, xe = (e) => ({
  ...Sr,
  ...e.presence ?? {}
}), Er = (e) => ({
  id: e,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), kr = (e) => ({
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
}), Ze = (e, t) => t.precision ?? e.defaults.precision;
function lt(e, t) {
  return e.toFixed(Math.min(100, Math.max(0, Math.trunc(t))));
}
function ct(e) {
  const t = /* @__PURE__ */ new Set(), s = (i) => {
    t.add(i.id), i.children.forEach(s);
  };
  return e.groups.forEach(s), t;
}
function Ar(e) {
  const t = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), r = ct(e), n = (o) => {
    for (const a of o.adjacent ?? []) {
      const l = Se(a);
      l === o.id || !r.has(l) || (t.add(o.id), s.add(l));
    }
    o.exit && i.add(o.id), o.children.forEach(n);
  };
  return e.groups.forEach(n), /* @__PURE__ */ new Set([...t, ...s, ...i]);
}
function Cr(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const Pr = (e) => new Set(e.envelopes.map((t) => t.id));
function zs(e, t) {
  const s = Cr(t);
  if (!e.has(s)) return s;
  let i = 2;
  for (; e.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const Tr = (e, t) => zs(ct(e), t), Or = (e, t) => zs(Pr(e), t);
function Lr(e, t) {
  const s = [], i = (r) => {
    r.stimuli.some((n) => n.envelope === t) && s.push(r.id), r.children.forEach(i);
  };
  return e.groups.forEach(i), { defaults: e.defaults.envelope === t, groups: s };
}
function Mr(e, t, s) {
  const i = e.envelopes[t];
  if (!i || i.id === s) return e;
  const r = i.id, n = e.envelopes.map((a, l) => l === t ? { ...a, id: s } : a);
  if (e.envelopes.some((a, l) => l !== t && a.id === r)) return { ...e, envelopes: n };
  const o = (a) => ({
    ...a,
    stimuli: a.stimuli.map((l) => l.envelope === r ? { ...l, envelope: s } : l),
    children: a.children.map(o)
  });
  return {
    ...e,
    defaults: e.defaults.envelope === r ? { ...e.defaults, envelope: s } : e.defaults,
    envelopes: n,
    groups: e.groups.map(o)
  };
}
const I = (e, t) => ot(e, t), we = (e, t) => ot(e, t), Rr = (e) => e.slice(0, -1), ze = (e) => e.slice(0, -2), Bs = (e) => e[e.length - 2] === "stimuli" ? ze(e) : e, Gs = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function Pt(e, t) {
  const s = Gs(e, t.envelope), i = e.defaults, r = (n, o, a) => n ?? o ?? a;
  return {
    attack: r(t.attack, s?.attack, 0),
    decay: r(t.decay, s?.decay, 0),
    sustain: r(t.sustain, s?.sustain, 1),
    release: r(t.release, s?.release, 1800),
    impulse: r(t.impulse, s?.impulse, !1),
    retrigger: r(t.retrigger, s?.retrigger, i.retrigger),
    unavailable: r(t.unavailable, s?.unavailable, i.unavailable),
    debounce: r(t.debounce, s?.debounce, i.debounce)
  };
}
const Vs = "activity_levels.mixer.expanded", Nr = (e, t) => e.length === t.length && e.every((s, i) => s === t[i]), Ws = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function Dr(e) {
  return { expanded: new Set(e.groups.map((t) => t.id)), selection: Ws(e) };
}
function Tt(e, t) {
  const s = [], i = (r, n, o) => {
    r.forEach((a, l) => {
      const d = [...n, l], m = a.children.length > 0, p = m && t.expanded.has(a.id);
      s.push({ path: d, id: a.id, depth: o, hasChildren: m, expanded: p }), p && i(a.children, [...d, "children"], o + 1);
    });
  };
  return i(e.groups, ["groups"], 0), s;
}
function hs(e, t) {
  switch (t.type) {
    case "toggle": {
      const s = new Set(e.expanded);
      return s.delete(t.id) || s.add(t.id), { ...e, expanded: s };
    }
    case "select":
      return { ...e, selection: t.path };
    case "arrow": {
      const s = Tt(t.config, e);
      if (s.length === 0) return e;
      const i = e.selection, r = i === null ? -1 : s.findIndex((a) => Nr(a.path, i)), o = (((r === -1 && t.delta < 0 ? s.length : r) + t.delta) % s.length + s.length) % s.length;
      return { ...e, selection: s[o].path };
    }
    case "home":
    case "end": {
      const s = Tt(t.config, e);
      return s.length === 0 ? e : { ...e, selection: (t.type === "home" ? s[0] : s[s.length - 1]).path };
    }
    case "sync": {
      const { config: s } = t, i = ct(s), r = [...e.expanded].filter((a) => i.has(a)), n = r.length === e.expanded.size ? e.expanded : new Set(r), o = e.selection !== null && ot(s, e.selection) !== void 0 ? e.selection : Ws(s);
      return { expanded: n, selection: o };
    }
  }
}
function Ir(e, t, s) {
  if (s === null) return t;
  const i = s[s.length - 2] === "stimuli" ? s.slice(0, -2) : s, r = new Set(t);
  let n = !1;
  for (let o = 2; o + 2 <= i.length; o += 2) {
    const a = ot(e, i.slice(0, o));
    if (a === void 0 || typeof a.id != "string") break;
    r.has(a.id) || (r.add(a.id), n = !0);
  }
  return n ? r : t;
}
function jr(e) {
  let t;
  try {
    t = localStorage.getItem(Vs);
  } catch {
    return null;
  }
  if (t === null) return null;
  try {
    const s = JSON.parse(t);
    if (!Array.isArray(s)) return null;
    const i = ct(e);
    return new Set(s.filter((r) => typeof r == "string" && i.has(r)));
  } catch {
    return null;
  }
}
function ds(e) {
  try {
    localStorage.setItem(Vs, JSON.stringify([...e]));
  } catch {
  }
}
function Fr(e) {
  const t = Dr(e), s = jr(e);
  return s === null ? t : { ...t, expanded: s };
}
async function Hr(e, t) {
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
const M = E`
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
`;
var Ur = Object.defineProperty, zr = Object.getOwnPropertyDescriptor, P = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? zr(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ur(t, s, r), r;
};
const us = ["mixer", "groups", "envelopes", "defaults", "patterns"], Br = 2e3, Gr = 1e4, Vr = 5 * 6e4, Wr = 1500, ps = "activity_levels.timeline", qr = ["24h", "7d", "30d"], Kr = ["off", "24h", "7d"], ms = { range: "7d", horizon: "24h", showChannels: !0, showLights: !0 };
function Xr(e) {
  if (e === null) return null;
  const t = JSON.parse(e);
  return !qr.includes(t.range) || !Kr.includes(t.horizon) ? null : {
    range: t.range,
    horizon: t.horizon,
    showChannels: t.showChannels !== !1,
    showLights: t.showLights !== !1
  };
}
let w = class extends $ {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "mixer", this.selection = null, this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = ms, this.tabFocus = 0, this.liveSeq = 0, this.profileAt = 0, this.simStatesMemo = null, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
      e.structural && (this.errors = []), this.setConfig(e.detail, e.coalesceKey);
    }, this.onNav = (e) => {
      const t = hs(this.nav, e.detail);
      t.expanded !== this.nav.expanded && ds(t.expanded), this.nav = t, this.selection = t.selection;
    }, this.onLiveRefresh = () => {
      this.pollLive();
    }, this.onRebuild = async (e) => {
      try {
        const { rebuilt: t } = await ir(this.hass, e.detail?.force === !0);
        this.banner = t ? { kind: "info", text: "Profile rebuilt." } : { kind: "warning", text: "Rebuild skipped (external profile)." }, await this.refreshProfile(!0);
      } catch (t) {
        this.banner = { kind: "error", text: `Could not rebuild the profile: ${t.message}` };
      }
    }, this.onSimToggle = async (e) => {
      const { gid: t, on: s } = e.detail;
      try {
        await dr(this.hass, "switch", s ? "turn_on" : "turn_off", { entity_id: Ht(t) });
      } catch (i) {
        this.banner = {
          kind: "error",
          text: `Could not ${s ? "start" : "stop"} the simulation for ${t}: ${i.message}`
        };
      }
    }, this.onTimelineRange = (e) => {
      this.timeline = e.detail;
      try {
        localStorage.setItem(ps, JSON.stringify(e.detail));
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
  /** Presence is opt-in, so its tab only exists while the draft asks for it. */
  get tabs() {
    const e = this.draft?.config;
    return e && xe(e).enabled ? [...us, "presence"] : us;
  }
  async connectedCallback() {
    super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
    const { ok: e, missing: t } = await vr();
    this.missing = e ? [] : t, await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer();
  }
  async load() {
    try {
      const e = await Ji(this.hass);
      this.draft = new yr(e), this.syncTabs(), this.nav = Fr(e), this.selection = this.nav.selection, this.errors = [], this.banner = null;
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
    this.syncTabs();
    const e = this.draft?.config;
    if (!e) return;
    const t = this.selection, s = hs({ ...this.nav, selection: t }, { type: "sync", config: e });
    this.nav = t === null ? { ...s, selection: null } : s, this.selection = this.nav.selection !== null && this.nav.selection.length > 0 ? this.nav.selection : null;
  }
  /**
   * Keeps the shown tab in the list. An edit, a discard, an undo, a redo and a reload can
   * all switch presence off underneath the Presence tab; leaving `tab` naming a tab that
   * is no longer there would keep `al-presence` mounted and polling, and would leave the
   * roving tabindex past the end of the list - which takes the whole tablist out of the
   * keyboard order.
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
    const s = Ir(t, this.nav.expanded, e);
    s !== this.nav.expanded && ds(s), this.nav = { expanded: s, selection: e };
  }
  async save() {
    const e = this.draft;
    if (e) {
      this.busy = !0, this.updatePolling();
      try {
        const t = await Hr(e.config, {
          validate: (s) => Zi(this.hass, s),
          save: (s) => Qi(this.hass, s)
        });
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, Wr)), await this.load());
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
    }, Br));
  }
  /** The simulation log moves at the pace of light switches, so it gets its own slower timer. */
  updateSimPolling(e) {
    if (!(this.patternsVisible && e)) {
      this.clearSimTimer();
      return;
    }
    this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => {
      this.pollSim();
    }, Gr));
  }
  async pollLive() {
    const e = ++this.liveSeq;
    try {
      const t = await er(this.hass);
      e === this.liveSeq && (this.live = t);
    } catch {
    }
  }
  async pollSim() {
    try {
      this.simLog = await rr(this.hass);
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
    if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < Vr))
      try {
        this.profileState = await sr(this.hass), this.profileAt = Date.now();
      } catch {
      }
  }
  /**
   * What the mixer needs beyond the live frame. Whether the simulation is running is not
   * in here: the strips read that off the switch entity they are given.
   */
  simStates(e) {
    const t = [e, this.simLog, this.hass.states], s = this.simStatesMemo;
    if (s && s.key.every((n, o) => n === t[o])) return s.value;
    const i = {}, r = (n) => {
      i[n.id] = { blocked: this.simLog?.blocked[n.id] ?? null }, n.children.forEach(r);
    };
    return e.groups.forEach(r), this.simStatesMemo = { key: t, value: i }, i;
  }
  restoreTimeline() {
    try {
      this.timeline = Xr(localStorage.getItem(ps)) ?? ms;
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
          ${this.tabs.map(
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
      case "presence":
        return c`<al-presence
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
    const s = this.nav.selection, i = s === null ? void 0 : I(t, Bs(s));
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
        .minDays=${t.defaults.patterns?.min_days ?? nt}
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
        <ha-button @click=${() => this.selectTab(this.tabs.indexOf("groups"))}>Go to Groups</ha-button>
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
w.styles = [M];
P([
  h({ attribute: !1 })
], w.prototype, "hass", 2);
P([
  h({ type: Boolean })
], w.prototype, "narrow", 2);
P([
  f()
], w.prototype, "draft", 2);
P([
  f()
], w.prototype, "tab", 2);
P([
  f()
], w.prototype, "selection", 2);
P([
  f()
], w.prototype, "nav", 2);
P([
  f()
], w.prototype, "errors", 2);
P([
  f()
], w.prototype, "banner", 2);
P([
  f()
], w.prototype, "live", 2);
P([
  f()
], w.prototype, "liveOn", 2);
P([
  f()
], w.prototype, "busy", 2);
P([
  f()
], w.prototype, "missing", 2);
P([
  f()
], w.prototype, "profileState", 2);
P([
  f()
], w.prototype, "simLog", 2);
P([
  f()
], w.prototype, "timeline", 2);
P([
  f()
], w.prototype, "tabFocus", 2);
w = P([
  k("activity-levels-panel")
], w);
function ee(e) {
  const t = Math.floor(e / 3600), s = Math.floor((e - t * 3600) / 60), i = Math.round((e - t * 3600 - s * 60) * 1e3) / 1e3, r = Math.floor(i), n = Math.round((i - r) * 1e3);
  return n === 0 ? { hours: t, minutes: s, seconds: r } : { hours: t, minutes: s, seconds: r, milliseconds: n };
}
function te(e) {
  if (!e) return null;
  const t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
  return Math.round(t * 1e3) / 1e3;
}
function he(e) {
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
const g = (e) => e.join("/");
function se(e, t) {
  const s = g(t), i = {};
  for (const r of e) {
    if (!r.path.startsWith(s + "/")) continue;
    const n = r.path.slice(s.length + 1);
    n.includes("/") || (i[n] = r.message);
  }
  return i;
}
function je(e, t) {
  const s = g(t);
  return e.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function qs(e, t, s) {
  const i = `${g(t)}/${s}/`;
  return e.find((r) => r.path.startsWith(i))?.message;
}
function ne(e, t, s) {
  const i = new CustomEvent("al-change", {
    detail: e,
    bubbles: !0,
    composed: !0
  });
  return t !== void 0 && (i.coalesceKey = t), s && (i.structural = !0), i;
}
const Ks = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), oe = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), Yr = () => oe("al-select-strip", null), Jr = () => oe("al-toggle-strip", null), fs = (e) => oe("al-level-override", { value: e }), Zr = (e) => oe("al-mute-toggle", { muted: e }), Qr = () => oe("al-reset", null), en = (e) => oe("al-mix-changed", { mix: e }), tn = (e) => oe("al-limiter-changed", { value: e }), sn = (e) => oe("al-sim-toggled", { on: e }), ft = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), rn = () => new CustomEvent("al-live-refresh", { detail: null, bubbles: !0, composed: !0 }), nn = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), Xs = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), Ys = (e = !1) => new CustomEvent("al-rebuild", { detail: { force: e }, bubbles: !0, composed: !0 }), on = (e) => new CustomEvent("al-map-select", { detail: { id: e }, bubbles: !0, composed: !0 });
var an = Object.defineProperty, ln = Object.getOwnPropertyDescriptor, Ae = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ln(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && an(t, s, r), r;
};
const gs = (e) => e.stopPropagation(), cn = (e) => {
  (e.key === "Enter" || e.key === " ") && e.stopPropagation();
};
let ie = class extends $ {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(e) {
    this.dispatchEvent(ne(e, void 0, !0));
  }
  emitSelect(e) {
    this.dispatchEvent(Ks(e));
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
    s && (this.emitChange(At(s, e, t, xr(Tr(s, "new_group")))), this.emitSelect([...e, t]));
  }
  addStimulus(e, t) {
    const s = this.config;
    if (!s) return;
    const i = [...e, "stimuli"];
    this.emitChange(At(s, i, t, kr(""))), this.emitSelect([...i, t]);
  }
  move(e, t) {
    const s = this.config;
    if (!s) return;
    const i = Rr(e), r = e[e.length - 1], n = r + t;
    this.emitChange($r(s, i, r, n));
    const o = this.selectionAfterSwap(i, r, n);
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
    const r = i[e.length], n = r === t ? s : r === s ? t : null;
    if (n === null) return null;
    const o = [...i];
    return o[e.length] = n, o;
  }
  removeNode(e, t) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
    this.emitChange(Ut(s, e));
    const i = ze(e);
    this.emitSelect(i.length ? i : null);
  }
  /**
   * Countdown to a live timestamp, measured against the payload's own `now` so a browser
   * clock that disagrees with the server does not show a negative or inflated wait.
   */
  countdown(e) {
    const t = this.live?.now;
    return e === null || t === void 0 ? null : he(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
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
  renderGroup(e, t, s, i, r, n) {
    const o = je(this.errors, s), a = this.live?.groups[t.id], l = a?.max_value ?? t.max_value ?? e.defaults.max_value, d = a ? Math.max(0, Math.min(100, a.value / (l || 1) * 100)) : 0;
    return c`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(m) => this.select(m, s)}
            @keydown=${cn}
          >
            ${t.name || t.id || "(unnamed group)"}
          </button>
          ${o ? c`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : u}
          ${a ? c`<div class="meter" title=${this.meterTitle(a, l, i === 0)}>
                  <div style="width: ${d}%"></div>
                </div>
                <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : u}
        </div>
        <div slot="icons" class="row" @click=${gs}>
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
          <ha-icon-button label="Move up" title="Move up" .disabled=${r === 0} @click=${() => this.move(s, -1)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            label="Move down"
            title="Move down"
            .disabled=${r === n - 1}
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
      (m, p) => this.renderStimulus(m, [...s, "stimuli", p], p, t.stimuli.length, t.id)
    )}
          ${t.stimuli.length === 0 ? c`<div class="muted empty">
                No stimuli yet — use the + button above to point this group at an entity.
              </div>` : u}
          <div class="children">
            ${t.children.map(
      (m, p) => this.renderGroup(e, m, [...s, "children", p], i + 1, p, t.children.length)
    )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(e, t, s, i, r) {
    const n = this.hass?.states[e.entity], o = n?.attributes.friendly_name ?? (e.entity || "(no entity)"), a = je(this.errors, t), l = this.live?.voices[r]?.find((d) => d.label === (e.key ?? e.entity));
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
        ${n ? c`<span class="muted chip">${n.state}</span>` : u}
        ${l ? c`<span class="chip phase ${l.phase}" title=${this.voiceTitle(l)}>${l.phase}</span>
              <span class="muted chip">${l.value.toFixed(2)}</span>` : u}
        <div class="row" @click=${gs}>
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
ie.styles = [
  M,
  E`
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
Ae([
  h({ attribute: !1 })
], ie.prototype, "hass", 2);
Ae([
  h({ attribute: !1 })
], ie.prototype, "config", 2);
Ae([
  h({ attribute: !1 })
], ie.prototype, "selection", 2);
Ae([
  h({ attribute: !1 })
], ie.prototype, "errors", 2);
Ae([
  h({ attribute: !1 })
], ie.prototype, "live", 2);
ie = Ae([
  k("al-tree")
], ie);
const Js = (e) => e.split(",").map((t) => t.trim()).filter((t) => t.length > 0), Fe = (e) => (e ?? []).join(", "), Qe = (e) => e == null || e === "" ? null : e;
function hn(e, t) {
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
function dn(e, t) {
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
function un(e, t) {
  if (t == null) return "unset";
  switch (e) {
    case "duration":
      return he(t);
    case "boolean":
      return t ? "Yes" : "No";
    default:
      return String(t);
  }
}
const pn = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain",
  adjacent: "Adjacent rooms",
  exit: "Way out of the house"
}, mn = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent.",
  adjacent: "Rooms you can walk to from here. Symmetric: naming one from either side is enough. One-way connections are shown with an arrow and edited in YAML.",
  exit: "People can leave the house from this room, so presence can move from here to Away."
}, Zs = (e) => pn[e.name] ?? e.name, Qs = (e) => mn[e.name] ?? "", fn = [
  "id",
  "name",
  "area",
  "mix",
  "null_handling",
  "gain",
  "adjacent",
  "exit"
], gn = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], vn = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], ei = { number: { min: 0.1, step: 0.1, mode: "box" } }, ti = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, $n = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, bn = { boolean: {} };
function yn(e, t) {
  const s = new Set((t.adjacent ?? []).filter(_r).map(Se)), i = [], r = (n) => {
    if (n.id !== t.id) {
      const o = n.name ?? n.id;
      i.push({ value: n.id, label: s.has(n.id) ? `${o} →` : o });
    }
    n.children.forEach(r);
  };
  return e.groups.forEach(r), { select: { multiple: !0, mode: "dropdown", sort: !1, options: i } };
}
const si = (e, t, s) => e === "null_handling" ? t.mix === "mean" : e === "gain" ? !s : !0;
function ii(e, t, s, i) {
  const r = {
    id: { text: {} },
    name: { text: {} },
    area: { area: {} },
    mix: { select: { mode: "dropdown", options: gn } },
    null_handling: { select: { mode: "dropdown", options: vn } },
    gain: $n,
    adjacent: i ? yn(i, e) : { select: { multiple: !0, options: [] } },
    exit: bn
  };
  return s.filter((n) => si(n, e, t)).map((n) => ({ name: n, selector: r[n] }));
}
function ri(e, t, s, i) {
  const r = (e.adjacent ?? []).map(Se), n = {
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
    s.filter((o) => si(o, e, t) && !(o === "area" && e.area === null)).map((o) => [o, n[o]])
  );
}
function ni(e, t) {
  const s = { ...e };
  if ("id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = Qe(t.name)), "area" in t && (s.area = Qe(t.area)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "adjacent" in t) {
    const i = Array.isArray(t.adjacent) ? t.adjacent.map(String) : [], r = new Map((e.adjacent ?? []).map((n) => [Se(n), n]));
    s.adjacent = i.map((n) => r.get(n) ?? n);
  }
  return "exit" in t && (s.exit = t.exit === !0), s;
}
const oi = (e, t) => {
  const s = (t.adjacent ?? []).map(Se).join(","), i = (e.adjacent ?? []).map(Se).join(",");
  return s !== i ? "adjacent" : fn.filter((r) => r !== "adjacent").find((r) => e[r] !== t[r]);
};
var xn = Object.defineProperty, wn = Object.getOwnPropertyDescriptor, X = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? wn(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && xn(t, s, r), r;
};
const zt = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
function _n(e, t) {
  return e.select?.options?.find((i) => i.value === t)?.label;
}
let j = class extends $ {
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
    e.stopPropagation(), this.emit(dn(this.kind, e.detail?.value));
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
      const t = _n(this.selector, String(e));
      if (t !== void 0) return t;
    }
    return un(this.kind, e);
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
          .selector=${this.kind === "boolean" ? zt : this.selector}
          .label=${this.label}
          .required=${!1}
          .value=${hn(this.kind, this.value)}
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
j.styles = [
  M,
  E`
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
X([
  h({ attribute: !1 })
], j.prototype, "hass", 2);
X([
  h()
], j.prototype, "label", 2);
X([
  h({ attribute: !1 })
], j.prototype, "selector", 2);
X([
  h({ attribute: !1 })
], j.prototype, "value", 2);
X([
  h({ attribute: !1 })
], j.prototype, "inherited", 2);
X([
  h({ attribute: "inherited-from" })
], j.prototype, "inheritedFrom", 2);
X([
  h()
], j.prototype, "kind", 2);
X([
  h()
], j.prototype, "error", 2);
j = X([
  k("al-override-field")
], j);
var Sn = Object.defineProperty, En = Object.getOwnPropertyDescriptor, Be = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? En(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Sn(t, s, r), r;
};
const vs = ["id", "name", "area", "mix", "null_handling", "gain", "adjacent", "exit"];
let pe = class extends $ {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  emitChange(e, t) {
    this.dispatchEvent(ne(e, t));
  }
  emitSelect(e) {
    this.dispatchEvent(Ks(e));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = I(t, s);
    if (!i) return;
    const r = ni(i, e.detail?.value ?? {}), n = oi(r, i);
    n !== void 0 && this.emitChange(L(t, s, r), `${g(s)}:${n}`);
  }
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(L(s, [...i, e], t), `${g(i)}:${e}`);
  }
  onDelete() {
    const { config: e, path: t } = this;
    if (!e || !t) return;
    const s = I(e, t);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(Ut(e, t));
    const i = ze(t);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length === 0)
      return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = I(e, t);
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = t.length === 2, r = this.errors.filter((a) => a.path === g(t)), n = { ...se(this.errors, t) }, o = qs(this.errors, t, "adjacent");
    return o !== void 0 && (n.adjacent = o), c`
      <ha-card header="Group">
        ${r.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${ri(s, i, vs)}
          .schema=${ii(s, i, vs, e)}
          .error=${n}
          .computeLabel=${Zs}
          .computeHelper=${Qs}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="muted note">Changing the id re-creates this group's entities.</div>

        <h3>Output</h3>
        <al-override-field
          .hass=${this.hass}
          label="Max value"
          kind="number"
          .selector=${ei}
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
          .selector=${ti}
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
pe.styles = [
  M,
  E`
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
Be([
  h({ attribute: !1 })
], pe.prototype, "hass", 2);
Be([
  h({ attribute: !1 })
], pe.prototype, "config", 2);
Be([
  h({ attribute: !1 })
], pe.prototype, "path", 2);
Be([
  h({ attribute: !1 })
], pe.prototype, "errors", 2);
pe = Be([
  k("al-group-editor")
], pe);
const kn = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, An = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, ai = (e) => kn[e.name] ?? e.name, li = (e) => An[e.name] ?? "", Cn = ["entity", "gain", "key", "envelope"], Ge = { duration: { enable_millisecond: !0 } }, Pn = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, ci = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, Tn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, On = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Ln = "(unknown preset — using built-in defaults)", Ot = [
  { name: "attack", label: "Attack", kind: "duration", selector: Ge },
  { name: "decay", label: "Decay", kind: "duration", selector: Ge },
  { name: "sustain", label: "Sustain", kind: "number", selector: Pn },
  { name: "release", label: "Release", kind: "duration", selector: Ge },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: zt },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Tn },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: On },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Ge }
], Bt = (e) => [
  { value: "", label: "(default preset)" },
  ...e.envelopes.map((t) => ({ value: t.id, label: t.id }))
];
function hi(e, t) {
  const s = {
    entity: { entity: {} },
    to: { text: {} },
    gain: ci,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: Bt(e) } }
  };
  return t.map((i) => ({ name: i, selector: s[i] }));
}
function di(e, t, s) {
  const i = {
    entity: e.entity,
    to: t ?? Fe(e.to),
    gain: e.gain,
    key: e.key ?? "",
    envelope: e.envelope ?? ""
  };
  return Object.fromEntries(s.map((r) => [r, i[r]]));
}
function ui(e, t) {
  const s = { ...e };
  return "entity" in t && (s.entity = String(t.entity ?? "")), "to" in t && (s.to = Js(String(t.to ?? ""))), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = Qe(t.key)), "envelope" in t && (s.envelope = Qe(t.envelope)), s;
}
function pi(e, t) {
  return Fe(e.to) !== Fe(t.to) ? "to" : Cn.find((s) => e[s] !== t[s]);
}
const mi = (e, t) => Fe(e) === Fe(Js(t));
function fi(e, t, s) {
  const i = Gs(e, t.envelope);
  return i ? i[s] === null || i[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : Ln;
}
function gi(e, t) {
  return t == null || e === void 0 ? null : he(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
const vi = (e) => e.release * e.sustain;
function $i(e, t = 0.25) {
  if (e.impulse)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ];
  const s = vi(e), i = e.attack + e.decay + s, r = i > 0 ? i * t / (1 - t) : 1, n = i + r;
  let o = 0;
  const a = [{ x: 0, y: 0 }];
  return o += e.attack, a.push({ x: o / n, y: 1 }), o += e.decay, a.push({ x: o / n, y: e.sustain }), o += r, a.push({ x: o / n, y: e.sustain }), o += s, a.push({ x: o / n, y: 0 }), a;
}
const Mn = (e) => Math.round(e * 100) / 100;
function Rn(e, t = 0.25) {
  const s = $i(e, t), i = (n) => ((s[n]?.x ?? 0) + (s[n + 1]?.x ?? 0)) / 2;
  if (e.impulse) {
    const n = [{ text: "impulse", x: 0 }];
    return e.release > 0 && n.push({ text: `R ${he(e.release)}`, x: i(1) }), n;
  }
  const r = [];
  return e.attack > 0 && r.push({ text: `A ${he(e.attack)}`, x: i(0) }), e.decay > 0 && r.push({ text: `D ${he(e.decay)}`, x: i(1) }), r.push({ text: `S ${Mn(e.sustain)}`, x: i(2) }), vi(e) > 0 && r.push({ text: `R ${he(e.release)}`, x: i(3) }), r;
}
var Nn = Object.defineProperty, Dn = Object.getOwnPropertyDescriptor, bi = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Dn(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Nn(t, s, r), r;
};
const He = 10, et = 190, In = 10, ye = 58, jn = 72, Ke = (e) => He + e * (et - He), gt = (e) => ye - e * (ye - In), Re = (e) => String(Math.round(e * 10) / 10), vt = (e, t) => `${Re(e)},${Re(t)}`, Fn = (e) => Math.min(et - 6, Math.max(He + 6, Ke(e)));
let tt = class extends $ {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const e = this.envelope;
    if (!e) return u;
    const t = $i(e), s = t[0], i = t[t.length - 1], r = t.map((l) => vt(Ke(l.x), gt(l.y))).join(" "), n = `${vt(Ke(s.x), ye)} ${r} ${vt(Ke(i.x), ye)}`, o = Rn(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${He} y1=${ye} x2=${et} y2=${ye}></line>
        ${e.impulse ? u : x`<line
              class="grid"
              x1=${He}
              y1=${Re(gt(e.sustain))}
              x2=${et}
              y2=${Re(gt(e.sustain))}
            ></line>`}
        <polygon class="area" points=${n}></polygon>
        <polyline class="curve" points=${r}></polyline>
        ${o.map(
      (l) => x`<text class="caption" x=${Re(Fn(l.x))} y=${jn} text-anchor="middle">${l.text}</text>`
    )}
      </svg>
    `;
  }
};
tt.styles = [
  M,
  E`
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
bi([
  h({ attribute: !1 })
], tt.prototype, "envelope", 2);
tt = bi([
  k("al-envelope-sketch")
], tt);
var Hn = Object.defineProperty, Un = Object.getOwnPropertyDescriptor, me = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Un(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Hn(t, s, r), r;
};
const $s = ["entity", "to", "gain", "key", "envelope"];
let W = class extends $ {
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
    const { config: t, path: s } = this, i = t && s ? we(t, s) : void 0;
    i && (mi(i.to, this.toText) || (this.toText = null));
  }
  emitChange(e, t) {
    this.dispatchEvent(ne(e, t));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = we(t, s);
    if (!i) return;
    const r = e.detail?.value ?? {};
    this.toText = String(r.to ?? "");
    const n = ui(i, r), o = pi(n, i);
    o !== void 0 && this.emitChange(L(t, s, n), `${g(s)}:${o}`);
  }
  setOverride(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(L(s, [...i, e], t), `${g(i)}:${e}`);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length < 3)
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = we(e, t);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = I(e, ze(t)), r = se(this.errors, t), n = this.errors.filter((d) => d.path === g(t)), o = Pt(e, s), a = this.live?.voices[i?.id ?? ""]?.find(
      (d) => d.label === (s.key ?? s.entity)
    ), l = gi(this.live?.now, a?.phase_ends);
    return c`
      <ha-card header="Stimulus">
        ${n.map((d) => c`<ha-alert alert-type="error">${d.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${di(s, this.toText, $s)}
          .schema=${hi(e, $s)}
          .error=${r}
          .computeLabel=${ai}
          .computeHelper=${li}
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
        ${Ot.map(
      (d) => c`<al-override-field
            .hass=${this.hass}
            .label=${d.label}
            .kind=${d.kind}
            .selector=${d.selector}
            .value=${s[d.name]}
            .inherited=${o[d.name]}
            .inheritedFrom=${fi(e, s, d.name)}
            .error=${r[d.name]}
            @value-changed=${(m) => this.setOverride(d.name, m.detail.value)}
          ></al-override-field>`
    )}
        <h3>Envelope shape</h3>
        <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
      </ha-card>
    `;
  }
};
W.styles = [
  M,
  E`
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
me([
  h({ attribute: !1 })
], W.prototype, "hass", 2);
me([
  h({ attribute: !1 })
], W.prototype, "config", 2);
me([
  h({ attribute: !1 })
], W.prototype, "path", 2);
me([
  h({ attribute: !1 })
], W.prototype, "errors", 2);
me([
  h({ attribute: !1 })
], W.prototype, "live", 2);
me([
  f()
], W.prototype, "toText", 2);
W = me([
  k("al-stimulus-editor")
], W);
var zn = Object.defineProperty, Bn = Object.getOwnPropertyDescriptor, fe = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Bn(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && zn(t, s, r), r;
};
const Gn = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, Vn = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, Wn = ["id", "attack", "decay", "sustain", "release", "impulse"], Xe = { duration: { enable_millisecond: !0 } }, qn = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Kn = { boolean: {} }, Xn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Yn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Jn = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: Xe },
  { name: "decay", selector: Xe },
  { name: "sustain", selector: qn },
  { name: "release", selector: Xe },
  { name: "impulse", selector: Kn }
], Zn = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Xn },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Yn },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Xe }
];
let q = class extends $ {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (e) => Gn[e.name] ?? e.name, this.computeHelper = (e) => Vn[e.name] ?? "";
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
    this.dispatchEvent(ne(e, t));
  }
  selectPreset(e) {
    this.selected = e, this.blocked = null;
  }
  addPreset() {
    const e = this.config;
    if (!e) return;
    this.blocked = null;
    const t = e.envelopes.length;
    this.emitChange(At(e, ["envelopes"], t, Er(Or(e, "preset")))), this.selected = t;
  }
  removePreset(e) {
    const t = this.config;
    if (!t) return;
    const s = t.envelopes[e];
    if (!s) return;
    const i = Lr(t, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(Ut(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config, s = this.selected, i = t?.envelopes[s];
    if (!t || !i) return;
    const r = e.detail?.value ?? {}, n = {
      ...i,
      id: String(r.id ?? ""),
      attack: te(r.attack) ?? i.attack,
      decay: te(r.decay) ?? i.decay,
      sustain: typeof r.sustain == "number" ? r.sustain : i.sustain,
      release: te(r.release) ?? i.release,
      impulse: typeof r.impulse == "boolean" ? r.impulse : i.impulse
    }, o = Wn.find((d) => n[d] !== i[d]);
    if (o === void 0) return;
    const a = ["envelopes", s], l = L(Mr(t, s, n.id), a, n);
    this.emitChange(l, `${g(a)}:${o}`);
  }
  setOverride(e, t) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const r = ["envelopes", i, e];
    this.emitChange(L(s, r, t), g(r));
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
      const r = je(this.errors, ["envelopes", i]);
      return c`<div class="row preset ${this.selected === i ? "selected" : ""}">
            <button type="button" class="link grow" title="Edit this preset" @click=${() => this.selectPreset(i)}>
              ${s.id || "(unnamed preset)"}
            </button>
            ${r ? c`<span class="badge" title="${r} problem(s)">${r}</span>` : u}
            <ha-icon-button label="Delete preset" title="Delete preset" @click=${() => this.removePreset(i)}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>`;
    })}
        ${e.envelopes.length === 0 ? c`<p class="muted">No presets yet.</p>` : u}
        ${t ? c`<ha-alert alert-type="warning">${eo(t)}</ha-alert>` : u}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(e) {
    const t = this.selected, s = e.envelopes[t];
    if (!s) return c`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", t], r = se(this.errors, i), n = this.errors.filter((l) => l.path === g(i)), o = {
      id: s.id,
      attack: ee(s.attack),
      decay: ee(s.decay),
      sustain: s.sustain,
      release: ee(s.release),
      impulse: s.impulse
    }, a = Qn(e, t, s);
    return c`
      <ha-card header="Envelope preset">
        ${n.map((l) => c`<ha-alert alert-type="error">${l.message}</ha-alert>`)}
        ${a ? c`<ha-alert alert-type="warning">${a}</ha-alert>` : u}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Jn}
          .error=${r}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Zn.map(
      (l) => c`<al-override-field
            .hass=${this.hass}
            .label=${l.label}
            .kind=${l.kind}
            .selector=${l.kind === "boolean" ? zt : l.selector}
            .value=${s[l.name]}
            .inherited=${e.defaults[l.name]}
            .inheritedFrom=${"defaults"}
            .error=${r[l.name]}
            @value-changed=${(d) => this.setOverride(l.name, d.detail.value)}
          ></al-override-field>`
    )}
      </ha-card>
    `;
  }
};
q.styles = [
  M,
  E`
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
fe([
  h({ attribute: !1 })
], q.prototype, "hass", 2);
fe([
  h({ attribute: !1 })
], q.prototype, "config", 2);
fe([
  h({ attribute: !1 })
], q.prototype, "errors", 2);
fe([
  h({ type: Boolean })
], q.prototype, "narrow", 2);
fe([
  f()
], q.prototype, "selected", 2);
fe([
  f()
], q.prototype, "blocked", 2);
q = fe([
  k("al-envelopes")
], q);
function Qn(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((i, r) => r !== t && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function eo(e) {
  const t = [];
  return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
var to = Object.defineProperty, so = Object.getOwnPropertyDescriptor, ht = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? so(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && to(t, s, r), r;
};
const io = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, ro = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Stack: each trigger adds its gain on top of the current level, up to the group's limiter. Only while releasing: a trigger only restarts a fading note. Always: a trigger restarts the note even while it is held.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, no = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], $t = { duration: { enable_millisecond: !0 } }, oo = { number: { min: 0.1, step: 0.1, mode: "box" } }, ao = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, lo = {
  select: {
    mode: "dropdown",
    options: [
      { value: "stack", label: "Stack (add on top)" },
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, co = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
};
let Ee = class extends $ {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (e) => io[e.name] ?? e.name, this.computeHelper = (e) => ro[e.name] ?? "";
  }
  schemaFor(e) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: e.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: oo },
      { name: "precision", selector: ao },
      { name: "unavailable", selector: co },
      { name: "retrigger", selector: lo },
      { name: "debounce", selector: $t },
      { name: "safety_refresh", selector: $t },
      { name: "min_wake_interval", selector: $t }
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
      debounce: te(i.debounce) ?? s.debounce,
      safety_refresh: te(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: te(i.min_wake_interval) ?? s.min_wake_interval
    }, o = no.find((a) => n[a] !== s[a]);
    o !== void 0 && this.emitChange(L(t, ["defaults"], n), `defaults:${o}`);
  }
  emitChange(e, t) {
    this.dispatchEvent(ne(e, t));
  }
  render() {
    const e = this.config;
    if (!e) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const t = e.defaults, s = se(this.errors, ["defaults"]), i = this.errors.filter((n) => n.path === "defaults"), r = {
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
          ${i.map((n) => c`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
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
Ee.styles = [
  M,
  E`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
ht([
  h({ attribute: !1 })
], Ee.prototype, "hass", 2);
ht([
  h({ attribute: !1 })
], Ee.prototype, "config", 2);
ht([
  h({ attribute: !1 })
], Ee.prototype, "errors", 2);
Ee = ht([
  k("al-defaults")
], Ee);
const Gt = 0.1, Vt = 10, Wt = Math.log10(Gt), ho = Math.log10(Vt), yi = ho - Wt, dt = (e) => Math.min(Vt, Math.max(Gt, e)), qt = (e) => Math.round(e * 100) / 100, bs = (e) => qt(dt(e));
function uo(e) {
  return (Math.log10(dt(e)) - Wt) / yi;
}
function po(e) {
  const t = Math.min(1, Math.max(0, e));
  return qt(dt(Math.pow(10, Wt + t * yi)));
}
function mo(e, t, s = !1) {
  const i = s ? 1.05 : 1.25;
  return qt(dt(t === 1 ? e * i : e / i));
}
function fo(e) {
  let t = e.toFixed(2).replace(/0+$/, "");
  return t.endsWith(".") && (t += "0"), t;
}
const go = {
  min: Gt,
  max: Vt,
  toPosition: uo,
  fromPosition: po,
  clamp: bs,
  step: (e, t, s = !1) => mo(e, t, s),
  page: (e, t) => bs(t === 1 ? e * 2 : e / 2),
  format: fo,
  reset: 1
}, vo = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function $o(e, t) {
  const s = e > 0 ? e : 1, i = vo(t), r = 10 ** -i, n = (a) => Number(Math.min(s, Math.max(0, a)).toFixed(i)), o = Math.max(r, Number((s / 10).toFixed(i)));
  return {
    min: 0,
    max: s,
    toPosition: (a) => Math.min(1, Math.max(0, a / s)),
    fromPosition: (a) => n(Math.min(1, Math.max(0, a)) * s),
    clamp: n,
    step: (a, l, d = !1) => n(a + l * (d ? r : o)),
    page: (a, l) => n(a + l * s / 4),
    format: (a) => lt(n(a), i),
    reset: null
  };
}
var bo = Object.defineProperty, yo = Object.getOwnPropertyDescriptor, B = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? yo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && bo(t, s, r), r;
};
const Lt = 12, bt = (e) => `${Math.round(e * 1e3) / 10}%`;
let N = class extends $ {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.focusable = !0, this.label = "Gain", this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1, this.onWheel = (e) => {
      this.disabled || e.deltaY === 0 || (e.preventDefault(), this.commit(this.scale.step(this.current, e.deltaY < 0 ? 1 : -1, e.shiftKey)));
    };
  }
  get scale() {
    return this.mode === "level" ? $o(this.max, this.precision) : go;
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
          <div class="fill" style="height: ${bt(s)}"></div>
          ${i === null ? u : c`<div class="tick" style="bottom: ${bt(e.toPosition(i))}" title=${e.format(i)}></div>`}
          <div class="knob" style="bottom: calc(${bt(s)} - ${Math.round((s - 0.5) * Lt * 10) / 10}px - ${Lt / 2}px)"></div>
        </div>
        <div class="value">${e.format(t)}</div>
      </div>
    `;
  }
};
N.styles = E`
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
      height: ${Lt}px;
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
B([
  h({ type: Number })
], N.prototype, "value", 2);
B([
  h({ type: Boolean, reflect: !0 })
], N.prototype, "disabled", 2);
B([
  h({ type: Boolean })
], N.prototype, "focusable", 2);
B([
  h({ type: String })
], N.prototype, "label", 2);
B([
  h({ type: String })
], N.prototype, "mode", 2);
B([
  h({ type: Number })
], N.prototype, "max", 2);
B([
  h({ type: Number })
], N.prototype, "precision", 2);
B([
  h({ type: Number })
], N.prototype, "tick", 2);
B([
  f()
], N.prototype, "dragValue", 2);
N = B([
  k("al-fader")
], N);
const xo = { ATTRIBUTE: 1 }, wo = (e) => (...t) => ({ _$litDirective$: e, values: t });
class _o {
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
const ys = wo(class extends _o {
  constructor(e) {
    if (super(e), e.type !== xo.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
    return ue;
  }
});
var So = Object.defineProperty, Eo = Object.getOwnPropertyDescriptor, ut = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Eo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && So(t, s, r), r;
};
const ko = (e) => `${Math.round(e * 1e3) / 10}%`;
let ke = class extends $ {
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
        <div class=${ys({ fill: !0, hot: e > 0.9 })} style="width: ${ko(e)}"></div>
      </div>
      <div class=${ys({ dot: !0, gated: this.gated })}></div>
    `;
  }
};
ke.styles = E`
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
ut([
  h({ type: Number })
], ke.prototype, "value", 2);
ut([
  h({ type: Number })
], ke.prototype, "max", 2);
ut([
  h({ type: Boolean })
], ke.prototype, "gated", 2);
ke = ut([
  k("al-meter")
], ke);
var Ao = Object.defineProperty, Co = Object.getOwnPropertyDescriptor, T = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Co(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ao(t, s, r), r;
};
const Po = 250;
let S = class extends $ {
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
    this.dispatchEvent(Yr());
  }
  /** Opening a track's children is its own intent: it must not also read as selecting it. */
  onChevron(e) {
    e.stopPropagation(), this.dispatchEvent(Jr());
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
    this.clearStepTimer(), this.dispatchEvent(fs(e));
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
      this.stepTimer = void 0, this.dispatchEvent(fs(t));
    }, Po);
  }
  onMute() {
    this.dispatchEvent(Zr(!this.muted));
  }
  onReset() {
    this.dispatchEvent(Qr());
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
        <div class="readout">${lt(e, this.precision)}</div>
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
S.styles = E`
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
T([
  h({ type: String })
], S.prototype, "label", 2);
T([
  h({ type: Number })
], S.prototype, "depth", 2);
T([
  h({ type: Boolean })
], S.prototype, "hasChildren", 2);
T([
  h({ type: Boolean })
], S.prototype, "expanded", 2);
T([
  h({ type: Number })
], S.prototype, "childCount", 2);
T([
  h({ type: Number })
], S.prototype, "value", 2);
T([
  h({ type: Number })
], S.prototype, "realValue", 2);
T([
  h({ type: Number })
], S.prototype, "maxValue", 2);
T([
  h({ type: Number })
], S.prototype, "precision", 2);
T([
  h({ type: Number })
], S.prototype, "liveNow", 2);
T([
  h({ type: Boolean, reflect: !0 })
], S.prototype, "muted", 2);
T([
  h({ type: Boolean, reflect: !0 })
], S.prototype, "selected", 2);
T([
  h({ type: Boolean, reflect: !0 })
], S.prototype, "narrow", 2);
T([
  h({ type: Number })
], S.prototype, "errors", 2);
T([
  f()
], S.prototype, "pending", 2);
S = T([
  k("al-strip")
], S);
var To = Object.defineProperty, Oo = Object.getOwnPropertyDescriptor, U = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Oo(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && To(t, s, r), r;
};
const Lo = ["sum", "max", "mean"], xs = (e) => e.stopPropagation(), ws = 0.1;
let R = class extends $ {
  constructor() {
    super(...arguments), this.label = "", this.mix = "sum", this.maxValue = 5, this.precision = 1, this.live = null, this.lights = 0, this.simEntityId = null, this.simOn = !1, this.blockedReason = null, this.selected = !1;
  }
  /** `0` on the selected strip, `-1` on every other one. */
  get stop() {
    return this.selected ? 0 : -1;
  }
  onMix(e) {
    this.dispatchEvent(en(e.target.value));
  }
  /**
   * `min` on a number input is advice to the browser, not a guarantee to us: it does not stop
   * a typed or pasted `0`, and `.value` reads back whatever is in the box. So the floor is
   * enforced here, and a rejected entry — empty, unreadable, or below the floor — puts the
   * committed ceiling back in the box rather than leaving a value we refused on screen.
   */
  onLimiter(e) {
    const t = e.target, s = t.value.trim(), i = Number(s);
    if (s === "" || !Number.isFinite(i) || i < ws) {
      t.value = String(this.maxValue);
      return;
    }
    this.dispatchEvent(tn(i));
  }
  onSim(e) {
    this.dispatchEvent(sn(e.target.checked === !0));
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
            @keydown=${xs}
          >
            ${Lo.map((t) => c`<option value=${t} ?selected=${t === this.mix}>${t}</option>`)}
          </select>
        </div>
        <div>
          <label for="limiter">limiter</label>
          <input
            id="limiter"
            class="limiter"
            type="number"
            tabindex=${this.stop}
            min=${ws}
            step="0.1"
            .value=${String(this.maxValue)}
            @change=${this.onLimiter}
            @keydown=${xs}
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
R.styles = E`
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
U([
  h({ type: String })
], R.prototype, "label", 2);
U([
  h({ type: String })
], R.prototype, "mix", 2);
U([
  h({ type: Number })
], R.prototype, "maxValue", 2);
U([
  h({ type: Number })
], R.prototype, "precision", 2);
U([
  h({ attribute: !1 })
], R.prototype, "live", 2);
U([
  h({ type: Number })
], R.prototype, "lights", 2);
U([
  h({ type: String })
], R.prototype, "simEntityId", 2);
U([
  h({ type: Boolean })
], R.prototype, "simOn", 2);
U([
  h({ type: String })
], R.prototype, "blockedReason", 2);
U([
  h({ type: Boolean })
], R.prototype, "selected", 2);
R = U([
  k("al-master-strip")
], R);
var Mo = Object.defineProperty, Ro = Object.getOwnPropertyDescriptor, Y = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ro(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Mo(t, s, r), r;
};
const No = 8e3, Do = (e) => {
  const t = e.composedPath()[0];
  return t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t instanceof HTMLTextAreaElement || t instanceof HTMLElement && t.isContentEditable;
}, Io = (e) => e instanceof Error ? e.message : String(e);
let F = class extends $ {
  constructor() {
    super(...arguments), this.nav = { expanded: /* @__PURE__ */ new Set(), selection: null }, this.errors = [], this.live = null, this.simState = {}, this.narrow = !1, this.commandError = null, this.pendingFocus = !1;
  }
  disconnectedCallback() {
    this.clearErrorTimer(), super.disconnectedCallback();
  }
  get tracks() {
    return this.config ? Tt(this.config, this.nav) : [];
  }
  /** The group the master strip follows: whatever is selected, or the group that owns it. */
  get selected() {
    const { config: e, nav: t } = this;
    if (!e || t.selection === null) return null;
    const s = Bs(t.selection), i = I(e, s);
    return i === void 0 ? null : { path: s, group: i };
  }
  isSelected(e) {
    return this.nav.selection !== null && g(this.nav.selection) === g(e);
  }
  navigate(e) {
    this.pendingFocus = !0, this.dispatchEvent(ft(e));
  }
  emitChange(e, t) {
    this.dispatchEvent(ne(e, t));
  }
  clearErrorTimer() {
    this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
  }
  fail(e) {
    this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
      this.errorTimer = void 0, this.commandError = null;
    }, No);
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
        await t(i), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(rn());
      } catch (r) {
        s?.settle(null), this.fail(`Could not ${e}: ${Io(r)}`);
      }
  }
  /** Which track an event came from: strips are identical, so the row index is the key. */
  trackOf(e) {
    const t = e.target?.dataset?.index;
    return t === void 0 ? null : this.tracks[Number(t)] ?? null;
  }
  onStripSelect(e) {
    const t = this.trackOf(e);
    t && this.dispatchEvent(ft({ type: "select", path: t.path }));
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
      async (r) => s.settle(await nr(r, t.id, i)),
      s
    );
  }
  onMuteToggle(e) {
    const t = this.trackOf(e);
    if (!t) return;
    const { muted: s } = e.detail;
    this.command(`${s ? "mute" : "unmute"} ${t.id}`, (i) => or(i, t.id, s));
  }
  onReset(e) {
    const t = this.trackOf(e);
    t && this.command(`reset ${t.id}`, (s) => ar(s, t.id));
  }
  onMasterSelect() {
    const e = this.selected;
    e && this.dispatchEvent(ft({ type: "select", path: e.path }));
  }
  onMix(e) {
    const { config: t } = this, s = this.selected;
    if (!t || !s) return;
    const { mix: i } = e.detail;
    this.emitChange(L(t, [...s.path, "mix"], i));
  }
  onLimiter(e) {
    const { config: t } = this, s = this.selected;
    if (!t || !s) return;
    const { value: i } = e.detail;
    this.emitChange(
      L(t, [...s.path, "max_value"], i),
      `${g(s.path)}:limiter`
    );
  }
  onSim(e) {
    const t = this.selected;
    if (!t) return;
    const { on: s } = e.detail;
    this.dispatchEvent(Xs(t.group.id, s));
  }
  /** Console keys: ←/→ walk the row, Enter or Space opens and closes, Home/End jump. */
  onKeyDown(e) {
    const t = this.config;
    if (!(!t || Do(e)))
      switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft":
          e.preventDefault(), this.navigate({ type: "arrow", delta: e.key === "ArrowRight" ? 1 : -1, config: t });
          break;
        case "Enter":
        case " ": {
          const s = this.nav.selection, i = s === null ? void 0 : this.tracks.find((r) => g(r.path) === g(s));
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
    const i = I(e, t.path);
    if (!i) return c``;
    const r = this.live?.groups[i.id], n = this.isSelected(t.path);
    return c`
      <al-strip
        data-index=${s}
        tabindex=${n ? 0 : -1}
        ?narrow=${this.narrow}
        .label=${i.name ?? i.id}
        .depth=${t.depth}
        .hasChildren=${t.hasChildren}
        .expanded=${t.expanded}
        .childCount=${i.children.length}
        .value=${r?.value ?? 0}
        .liveNow=${this.live?.now ?? 0}
        .realValue=${r?.real_value ?? 0}
        .maxValue=${r?.max_value ?? i.max_value ?? e.defaults.max_value}
        .precision=${r?.precision ?? Ze(e, i)}
        .muted=${r?.muted ?? !1}
        .selected=${n}
        .errors=${je(this.errors, t.path)}
      ></al-strip>
    `;
  }
  renderMaster(e) {
    const t = this.selected;
    if (!t) return u;
    const { group: s, path: i } = t, r = this.live?.groups[s.id], n = r ? { value: r.value, max: r.max_value, gated: r.gated } : null, o = Ht(s.id), a = this.isSelected(i);
    return c`
      <al-master-strip
        tabindex="-1"
        .selected=${a}
        ?narrow=${this.narrow}
        .label=${(s.name ?? s.id).toUpperCase()}
        .mix=${s.mix}
        .maxValue=${s.max_value ?? e.defaults.max_value}
        .precision=${r?.precision ?? Ze(e, s)}
        .live=${n}
        .lights=${r?.lights ?? 0}
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
F.styles = [
  M,
  E`
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
Y([
  h({ attribute: !1 })
], F.prototype, "hass", 2);
Y([
  h({ attribute: !1 })
], F.prototype, "config", 2);
Y([
  h({ attribute: !1 })
], F.prototype, "nav", 2);
Y([
  h({ attribute: !1 })
], F.prototype, "errors", 2);
Y([
  h({ attribute: !1 })
], F.prototype, "live", 2);
Y([
  h({ attribute: !1 })
], F.prototype, "simState", 2);
Y([
  h({ type: Boolean, reflect: !0 })
], F.prototype, "narrow", 2);
Y([
  f()
], F.prototype, "commandError", 2);
F = Y([
  k("al-mixer")
], F);
const jo = {
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
}, Fo = {
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400
};
function Ho(e, t, s) {
  return {
    start: e - jo[t],
    end: e,
    resolution: t === "24h" ? "5m" : "1h",
    forecastUntil: s === "off" ? void 0 : e + Fo[s]
  };
}
function Uo(e, t, s) {
  const i = t - e || 1;
  return (r) => (r - e) / i * s;
}
function zo(e, t, s = 4) {
  const i = e || 1, r = t - 2 * s;
  return (n) => t - s - n / i * r;
}
function st(e, t) {
  t = Math.max(4, t);
  const s = e.length;
  if (s <= t) return e;
  const i = Math.max(1, Math.floor(t / 2)), r = Math.ceil(s / i), n = [];
  for (let o = 0; o < s; o += r) {
    const a = Math.min(o + r, s);
    let l = e[o], d = e[o];
    for (let m = o + 1; m < a; m++) {
      const p = e[m];
      p[1] < l[1] && (l = p), p[1] > d[1] && (d = p);
    }
    l === d ? n.push(l) : l[0] <= d[0] ? n.push(l, d) : n.push(d, l);
  }
  return n[0] !== e[0] && (n[0] = e[0]), n[n.length - 1] !== e[s - 1] && (n[n.length - 1] = e[s - 1]), n;
}
function Mt(e, t, s) {
  return e.length === 0 ? "" : e.map(([i, r], n) => `${n === 0 ? "M" : "L"}${t(i)},${s(r)}`).join(" ");
}
function Bo(e, t, s, i = 1 / 0) {
  if (e.p75.length === 0) return "";
  const r = (l) => l.map((d, m) => [e.t0 + m * e.step, d]), n = st(r(e.p75), i), o = st(r(e.p25), i).reverse();
  return `${[...n, ...o].map(([l, d], m) => `${m === 0 ? "M" : "L"}${t(l)},${s(d)}`).join(" ")} Z`;
}
function Go(e, t) {
  return e[t].map((s, i) => [e.t0 + i * e.step, s]);
}
function Vo(e, t, s, i, r) {
  const n = e[e.length - 1];
  return !n || t <= n[0] || t < i || t > r ? [] : [n, [t, s]];
}
function yt(e, t, s) {
  return e.map(([i, r, n]) => ({ x0: t(i), x1: t(r ?? s), tag: n }));
}
function _s(e, t) {
  if (e.length === 0) return -1;
  let s = 0, i = e.length - 1;
  for (; s < i; ) {
    const r = s + i >> 1;
    e[r][0] < t ? s = r + 1 : i = r;
  }
  return s > 0 && Math.abs(e[s - 1][0] - t) <= Math.abs(e[s][0] - t) ? s - 1 : s;
}
function Wo(e) {
  return [e.group_id, e.start, e.end, e.resolution, e.include_children ?? !1, e.forecast_until ?? ""].join("|");
}
var qo = Object.defineProperty, Ko = Object.getOwnPropertyDescriptor, A = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ko(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && qo(t, s, r), r;
};
const be = 32, Xo = 28, Yo = 4, Ss = 8, Jo = 800, Zo = 220, Qo = 160, xt = 2e3, ea = 6e4, ta = 1e4, xi = 6e4, sa = 32, ia = ["24h", "7d", "30d"], ra = ["off", "24h", "7d"], Es = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], na = (e) => `hsl(${e * 67 % 360} 55% 62%)`, Z = /* @__PURE__ */ new Map(), Ve = /* @__PURE__ */ new Map();
function ks(e, t) {
  const s = Date.now();
  for (const [i, r] of Z) s - r.at >= xi && Z.delete(i);
  Z.delete(e), Z.set(e, { at: s, data: t });
  for (const i of Z.keys()) {
    if (Z.size <= sa) break;
    Z.delete(i);
  }
}
const oa = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", aa = (e, t) => {
  const s = new Date(e * 1e3);
  return t <= 2 * 86400 ? s.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : s.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}, wt = (e) => String(Math.round(e * 100) / 100), _t = (e, t, s) => Math.min(s, Math.max(t, e));
function la(e, t, s, i) {
  const r = Math.max(1, i.width - be), n = Math.max(1, i.height - Xo), o = s.start, a = Math.max(s.until, s.end), l = Uo(o, a, r), d = zo(i.maxValue, n), m = Object.keys(e.series), p = m.includes(t) ? t : m[0] ?? t, v = (b, ae) => {
    const ve = st(e.series[b] ?? [], xt);
    return { id: b, points: ve, d: Mt(ve, l, d), color: ae };
  }, C = v(p, "var(--primary-color)"), O = i.showChannels ? m.filter((b) => b !== p).map((b, ae) => v(b, na(ae))) : [], z = e.forecast, Pe = z ? oa(Bo(z, l, d, xt)) : "", Te = z ? Mt(st(Go(z, "p50"), xt), l, d) : "", V = [];
  for (const [, , b] of e.day_types) V.includes(b) || V.push(b);
  const Yt = (b) => Es[V.indexOf(b) % Es.length], Si = yt(
    e.day_types.map(([b, ae, ve]) => [b, ae, ve]),
    l,
    a
  ).map((b) => ({ ...b, fill: Yt(b.tag) })), Ei = yt(
    Object.entries(e.lights).flatMap(
      ([b, ae]) => ae.map(([ve, Ai]) => [ve, Ai, b])
    ),
    l,
    a
  ), ki = yt(e.plan, l, a);
  return {
    busId: p,
    bus: C,
    children: O,
    band: Pe,
    p50: Te,
    dayTypes: Si,
    legend: V.map((b) => ({ tag: b, fill: Yt(b) })),
    lights: Ei,
    plan: ki,
    x: l,
    y: d,
    t0: o,
    t1: a,
    plotW: r,
    plotH: n
  };
}
let y = class extends $ {
  constructor() {
    super(...arguments), this.groupId = null, this.heading = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = nt, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = Jo, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
  }
  get height() {
    return this.narrow ? Qo : Zo;
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
    }, ea), this.load();
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
    }, ta)));
  }
  willUpdate(e) {
    const t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), s = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
    (t || s) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
  }
  query(e) {
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = Ho(t, this.range, this.horizon);
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
    const i = this.query(s), r = Wo(i), n = e ? void 0 : Z.get(r);
    if (n && Date.now() - n.at < xi) {
      this.seq++, this.loaded = { q: i, data: n.data }, this.error = null, ks(r, n.data);
      return;
    }
    let o = e ? void 0 : Ve.get(r);
    if (!o) {
      const l = tr(t, i);
      o = l, Ve.set(r, l), l.then(
        (d) => ks(r, d),
        () => {
        }
      ).finally(() => {
        Ve.get(r) === l && Ve.delete(r);
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
    if (s && s.key.length === t.length && s.key.every((r, n) => r === t[n])) return s.value;
    const i = la(
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
    return _t(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
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
    return !i || e.bus.id !== t ? "" : Mt(Vo(e.bus.points, s.now, i.value, e.t0, e.t1), e.x, e.y);
  }
  emitSettings() {
    this.dispatchEvent(
      nn({
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
    const i = e.currentTarget.getBoundingClientRect(), r = i.width > 0 ? this.width / i.width : 1, n = (e.clientX - i.left) * r - be, o = _t(n / t.plotW, 0, 1);
    return t.t0 + o * (t.t1 - t.t0);
  }
  onMove(e) {
    const t = this.paths;
    !t || t.bus.points.length === 0 || (this.cursorIndex = _s(t.bus.points, this.timeAt(e, t)));
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
    this.cursorIndex = this.cursorIndex === null ? i > 0 ? 0 : s : _t(this.cursorIndex + i, 0, s);
  }
  renderChips() {
    const e = this.learningHint;
    return c`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${ia.map(
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
          ${ra.map((t) => {
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
    const t = this.width, s = this.height, i = e.x(this.nowAt(e)), r = this.tailPath(e), n = e.plotH + Yo, o = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), a = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
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
      (l) => x`
            <line class="grid" x1=${be} y1=${e.y(this.maxValue * l)} x2=${t} y2=${e.y(this.maxValue * l)}></line>
            <text class="ytick" x=${be - 4} y=${e.y(this.maxValue * l) + 3} text-anchor="end">
              ${wt(this.maxValue * l)}
            </text>
          `
    )}
        <g transform="translate(${be},0)">
          ${e.dayTypes.map(
      (l) => x`<rect
              class="daytype"
              x=${l.x0}
              y="0"
              width=${Math.max(0, l.x1 - l.x0)}
              height=${e.plotH}
              fill=${l.fill}
            ></rect>`
    )}
          ${e.band ? x`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? x`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((l) => x`<path class="child" d=${l.d} stroke=${l.color}></path>`)}
          ${e.bus.d ? x`<path class="bus" d=${e.bus.d}></path>` : u}
          ${r ? x`<path class="tail" d=${r}></path>` : u}
          ${this.showLights ? e.lights.map(
      (l) => x`<rect
                  class="light"
                  x=${l.x0}
                  y=${n}
                  width=${Math.max(1, l.x1 - l.x0)}
                  height=${Ss}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`
    ) : u}
          ${this.showLights ? e.plan.map(
      (l) => x`<rect
                  class="plan"
                  x=${l.x0}
                  y=${n}
                  width=${Math.max(1, l.x1 - l.x0)}
                  height=${Ss}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`
    ) : u}
          <line class="now" x1=${i} y1="0" x2=${i} y2=${e.plotH}></line>
          <text class="now-label" x=${i + 3} y="10">now</text>
          ${o === null ? u : x`<line class="cursor" x1=${o} y1="0" x2=${o} y2=${e.plotH}></line>`}
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
      ([i, r]) => x`<text class="xlabel" x=${i * e.plotW} y=${t} text-anchor=${r}>
        ${aa(e.t0 + i * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`
    );
  }
  renderTooltip(e) {
    const t = this.cursorIndex;
    if (t === null) return u;
    const s = e.bus.points[t];
    if (!s) return u;
    const [i, r] = s, o = (be + e.x(i)) / this.width * 100, a = this.loaded?.data.day_types.find(([l, d]) => i >= l && i < d)?.[2];
    return c`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${new Date(i * 1e3).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${wt(r)}</span>
        </div>
        ${e.children.map((l) => {
      const d = _s(l.points, i), m = l.points[d];
      return m ? c`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${l.color}"></span>
                  <span class="tt-name">${l.id}</span>
                  <span class="tt-value">${wt(m[1])}</span>
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
y.styles = [
  M,
  E`
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
A([
  h({ attribute: !1 })
], y.prototype, "hass", 2);
A([
  h({ attribute: !1 })
], y.prototype, "groupId", 2);
A([
  h({ attribute: !1 })
], y.prototype, "heading", 2);
A([
  h({ attribute: !1 })
], y.prototype, "range", 2);
A([
  h({ attribute: !1 })
], y.prototype, "horizon", 2);
A([
  h({ type: Boolean })
], y.prototype, "showChannels", 2);
A([
  h({ type: Boolean })
], y.prototype, "showLights", 2);
A([
  h({ attribute: !1 })
], y.prototype, "live", 2);
A([
  h({ type: Number })
], y.prototype, "maxValue", 2);
A([
  h({ attribute: !1 })
], y.prototype, "profileState", 2);
A([
  h({ type: Number })
], y.prototype, "minDays", 2);
A([
  h({ type: Boolean, reflect: !0 })
], y.prototype, "narrow", 2);
A([
  h({ type: Boolean })
], y.prototype, "paused", 2);
A([
  f()
], y.prototype, "cursorIndex", 2);
A([
  f()
], y.prototype, "width", 2);
A([
  f()
], y.prototype, "loaded", 2);
A([
  f()
], y.prototype, "error", 2);
y = A([
  k("al-timeline")
], y);
var ca = Object.defineProperty, ha = Object.getOwnPropertyDescriptor, J = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ha(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && ca(t, s, r), r;
};
const As = ["envelope", "gain", "to", "key"], Cs = ["name", "mix", "null_handling", "gain", "adjacent", "exit"], da = 5, ua = (e) => e[e.length - 2] === "stimuli";
let H = class extends $ {
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
    const { config: t, path: s } = this, i = t && s ? we(t, s) : void 0;
    i && (mi(i.to, this.toText) || (this.toText = null));
  }
  emitChange(e, t) {
    this.dispatchEvent(ne(e, t));
  }
  /** Writes one nullable field of the selected node, e.g. an envelope or output override. */
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(L(s, [...i, e], t), `${g(i)}:${e}`);
  }
  onChannelForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = we(t, s);
    if (!i) return;
    const r = e.detail?.value ?? {};
    this.toText = String(r.to ?? "");
    const n = ui(i, r), o = pi(n, i);
    o !== void 0 && this.emitChange(L(t, s, n), `${g(s)}:${o}`);
  }
  onBusForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = I(t, s);
    if (!i) return;
    const r = ni(i, e.detail?.value ?? {}), n = oi(r, i);
    n !== void 0 && this.emitChange(L(t, s, r), `${g(s)}:${n}`);
  }
  /** The switch is Home Assistant's, so this reports the wanted state and lets the shell call it. */
  onSim(e, t) {
    this.dispatchEvent(Xs(e, t.target.checked === !0));
  }
  onRebuild() {
    this.dispatchEvent(Ys());
  }
  renderChannel(e, t) {
    const s = we(e, t);
    if (!s) return c`<ha-card><span class="muted">This channel no longer exists.</span></ha-card>`;
    const i = se(this.errors, t), r = this.errors.filter((o) => o.path === g(t)), n = Pt(e, s);
    return c`
      <ha-card header=${s.key ?? s.entity}>
        ${r.map((o) => c`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${di(s, this.toText, As)}
              .schema=${hi(e, As)}
              .error=${i}
              .computeLabel=${ai}
              .computeHelper=${li}
              @value-changed=${this.onChannelForm}
            ></ha-form>
            ${this.renderVoice(e, t, s)}
          </div>
          <div class="col">
            ${Ot.map(
      (o) => c`<al-override-field
                .hass=${this.hass}
                .label=${o.label}
                .kind=${o.kind}
                .selector=${o.selector}
                .value=${s[o.name]}
                .inherited=${n[o.name]}
                .inheritedFrom=${fi(e, s, o.name)}
                .error=${i[o.name]}
                @value-changed=${(a) => this.setField(o.name, a.detail.value)}
              ></al-override-field>`
    )}
            <al-envelope-sketch .envelope=${n}></al-envelope-sketch>
          </div>
        </div>
      </ha-card>
    `;
  }
  /** The voice this channel is driving right now, matched the way the engine labels it. */
  renderVoice(e, t, s) {
    const i = I(e, ze(t)), r = this.live?.voices[i?.id ?? ""]?.find((o) => o.label === (s.key ?? s.entity));
    if (!r) return u;
    const n = gi(this.live?.now, r.phase_ends);
    return c`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${r.phase}">${r.phase}</span>
      <span class="chip value">${r.value.toFixed(2)}</span>
      ${n !== null ? c`<span class="muted chip">ends in ${n}</span>` : u}
      <span class="dot ${r.gate ? "gated" : ""}" title=${r.gate ? "Gate open" : "Gate closed"}></span>
    </div>`;
  }
  renderBus(e, t) {
    const s = I(e, t);
    if (!s) return c`<ha-card><span class="muted">This bus no longer exists.</span></ha-card>`;
    const i = t.length === 2, r = this.errors.filter((a) => a.path === g(t)), n = { ...se(this.errors, t) }, o = qs(this.errors, t, "adjacent");
    return o !== void 0 && (n.adjacent = o), c`
      <ha-card header=${s.name ?? s.id}>
        ${r.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${ri(s, i, Cs)}
              .schema=${ii(s, i, Cs, e)}
              .error=${n}
              .computeLabel=${Zs}
              .computeHelper=${Qs}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${ei}
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
              .selector=${ti}
              .value=${s.precision === null ? null : String(s.precision)}
              .inherited=${String(e.defaults.precision)}
              .inheritedFrom=${"defaults"}
              .error=${n.precision}
              @value-changed=${(a) => this.setField("precision", a.detail.value === null ? null : Number(a.detail.value))}
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
    const i = xe(e).enabled && Ar(e).has(t.id);
    return c`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${i ? this.renderPresence(e, t, s) : u}
        ${t.stimuli.length === 0 && !i ? c`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((r, n) => this.renderStimulus(e, [...s, "stimuli", n], r))}
      </div>
    `;
  }
  /**
   * The room's presence channel: a stimulus with no entity. It is fed by the room
   * estimate rather than by a sensor, so there is nothing to point at - but its gain
   * and its envelope are tuned here like any other channel's.
   */
  renderPresence(e, t, s) {
    const i = t.presence ?? Ct(), r = Pt(e, {
      ...i,
      envelope: i.envelope ?? xe(e).envelope
    }), n = this.live?.voices[t.id]?.find((a) => a.label === wr), o = se(this.errors, [...s, "presence"]);
    return c`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${n ? c`<span class="chip phase ${n.phase}">${n.phase}</span>` : u}
        </div>
        <ha-selector
          class="presence-envelope"
          .hass=${this.hass}
          .selector=${{ select: { mode: "dropdown", options: Bt(e) } }}
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
          .selector=${ci}
          .value=${i.gain}
          .inherited=${1}
          .inheritedFrom=${"presence"}
          .error=${o.gain}
          @value-changed=${(a) => this.setPresence(s, "gain", a.detail.value ?? 1)}
        ></al-override-field>
        ${Ot.map(
      (a) => c`<al-override-field
            class="presence-${a.name}"
            .hass=${this.hass}
            .label=${a.label}
            .kind=${a.kind}
            .selector=${a.selector}
            .value=${i[a.name]}
            .inherited=${r[a.name]}
            .inheritedFrom=${i.envelope ?? xe(e).envelope ?? "defaults"}
            .error=${o[a.name]}
            @value-changed=${(l) => this.setPresence(s, a.name, l.detail.value)}
          ></al-override-field>`
    )}
        <al-envelope-sketch .envelope=${r}></al-envelope-sketch>
      </ha-expansion-panel>
    `;
  }
  setPresence(e, t, s) {
    const i = this.config;
    if (!i) return;
    const r = I(i, e);
    if (!r) return;
    const n = L(i, [...e, "presence"], {
      ...r.presence ?? Ct(),
      [t]: s
    });
    this.emitChange(n, `${g(e)}:presence:${t}`);
  }
  renderStimulus(e, t, s) {
    const i = this.hass?.states[s.entity], r = i?.attributes.friendly_name ?? (s.entity || "(no entity)"), n = je(this.errors, t);
    return c`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:flash"></ha-icon>
          <span class="name">${s.key ?? r}</span>
          ${n ? c`<span class="badge" title="${n} problem(s)">${n}</span>` : u}
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
    const s = t.id, i = this.live?.groups[s]?.precision ?? Ze(e, t), r = this.live?.groups[s]?.lights ?? 0, n = this.hass?.states[Ht(s)], o = this.simLog?.blocked[s] ?? null, a = (this.simLog?.entries ?? []).filter((l) => l.group_id === s).sort((l, d) => d.t - l.t).slice(0, da);
    return c`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${r} light${r === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${r > 0 ? c`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${n?.state === "on"}
                .disabled=${n === void 0}
                title=${n === void 0 ? "No simulation switch for this bus" : "Presence simulation"}
                @change=${(l) => this.onSim(s, l)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : u}
        ${o !== null ? c`<div class="muted blocked">Blocked: ${o}</div>` : u}
        ${this.renderSensor("expected", "Expected", Us(s), i)}
        ${this.renderSensor("anomaly", "Anomaly", ur(s), i)}
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
    const r = this.hass?.states[s], n = r?.attributes.day_type, o = r?.state, a = o === void 0 ? NaN : Number(o), l = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(a) ? lt(a, i) : o;
    return c`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${l}</span>
      ${typeof n == "string" ? c`<span class="muted">${n}</span>` : u}
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
    const i = s.profile.groups[t]?.days ?? 0, r = e.defaults.patterns?.min_days ?? nt;
    return s.ready[t] === !0 ? `Profile ready · ${i} days learned` : `Learning… ${i}/${r} days`;
  }
  render() {
    const { config: e, path: t } = this;
    return !e || !t || t.length === 0 ? c`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : ua(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
  }
};
H.styles = [
  M,
  E`
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
J([
  h({ attribute: !1 })
], H.prototype, "hass", 2);
J([
  h({ attribute: !1 })
], H.prototype, "config", 2);
J([
  h({ attribute: !1 })
], H.prototype, "path", 2);
J([
  h({ attribute: !1 })
], H.prototype, "errors", 2);
J([
  h({ attribute: !1 })
], H.prototype, "live", 2);
J([
  h({ attribute: !1 })
], H.prototype, "profileState", 2);
J([
  h({ attribute: !1 })
], H.prototype, "simLog", 2);
J([
  f()
], H.prototype, "toText", 2);
H = J([
  k("al-strip-controls")
], H);
var pa = Object.defineProperty, ma = Object.getOwnPropertyDescriptor, Ce = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ma(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && pa(t, s, r), r;
};
const fa = 50;
function Ps(e) {
  const t = [], s = (i) => {
    t.push({ id: i.id, label: i.name ?? i.id, precision: e ? Ze(e, i) : 0 }), i.children.forEach(s);
  };
  return e?.groups.forEach(s), t;
}
function ga(e, t) {
  if (e === void 0) return "—";
  const s = Number(e);
  return e.trim() !== "" && Number.isFinite(s) ? lt(s, t) : e;
}
const Ts = (e) => new Date(e * 1e3).toLocaleDateString();
let re = class extends $ {
  constructor() {
    super(...arguments), this.profileState = null, this.simLog = null, this.force = !1;
  }
  onRebuild() {
    this.dispatchEvent(Ys(this.force));
  }
  renderStatus() {
    const e = this.profileState;
    if (!e) return c`<div class="status muted">Profile not loaded yet.</div>`;
    const { producer: t, generated_at: s, training_window: i, day_types: r, slot_minutes: n } = e.profile;
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
          <span class="window">${Ts(i[0])} – ${Ts(i[1])}</span>
        </div>
        <div class="muted">${r.join(", ")} · ${n}-minute slots</div>
      </div>
    `;
  }
  renderReadiness() {
    const e = this.profileState, t = Ps(this.config);
    if (!e || t.length === 0)
      return c`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
    const s = this.config?.defaults.patterns?.min_days ?? nt;
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
    const i = t.ready[e.id] === !0, r = t.profile.groups[e.id]?.days ?? 0, n = this.hass?.states[Us(e.id)]?.state;
    return c`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${i ? "yes" : "no"}" title=${i ? "Ready" : `Needs ${s} days`}>
        ${i ? "✓" : "✗"}
      </td>
      <td class="days">${r}</td>
      <td class="expected">${ga(n, e.precision)}</td>
    </tr>`;
  }
  /** Why a group cannot be simulated right now; the first failing precondition, per group. */
  renderBlocked() {
    const e = Object.entries(this.simLog?.blocked ?? {}).filter(
      (i) => typeof i[1] == "string"
    );
    if (e.length === 0) return u;
    const t = Ps(this.config), s = (i) => t.find((r) => r.id === i)?.label ?? i;
    return c`<ul class="blocked">
      ${e.map(([i, r]) => c`<li><span class="group">${s(i)}:</span> <span>${r}</span></li>`)}
    </ul>`;
  }
  renderLog() {
    const e = [...this.simLog?.entries ?? []].sort((t, s) => s.t - t.t).slice(0, fa);
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
re.styles = [
  M,
  E`
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
Ce([
  h({ attribute: !1 })
], re.prototype, "hass", 2);
Ce([
  h({ attribute: !1 })
], re.prototype, "config", 2);
Ce([
  h({ attribute: !1 })
], re.prototype, "profileState", 2);
Ce([
  h({ attribute: !1 })
], re.prototype, "simLog", 2);
Ce([
  f()
], re.prototype, "force", 2);
re = Ce([
  k("al-patterns")
], re);
const Os = 160, Ls = 110, We = 60, Kt = 120, Xt = 54;
function wi(e) {
  const t = [], s = (i, r, n) => {
    const o = r <= 1 ? i.id : n;
    t.push({ id: i.id, label: i.name ?? i.id, branch: o }), i.children.forEach((a) => s(a, r + 1, o));
  };
  return e.groups.forEach((i) => s(i, 0, i.id)), t;
}
function va(e, t) {
  if (e === 0 && t === 0) return 0;
  const s = e === 0 ? 1 / 0 : Kt / 2 / Math.abs(e), i = t === 0 ? 1 / 0 : Xt / 2 / Math.abs(t);
  return Math.min(s, i, 0.5);
}
function $a(e, t) {
  const s = new Set(t.nodes), i = new Set(t.exits), r = [], n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const p of wi(e)) {
    if (o.set(p.id, p.label), !s.has(p.id)) continue;
    let v = n.get(p.branch);
    v === void 0 && (v = r.length, n.set(p.branch, v), r.push([])), r[v].push(p.id);
  }
  const a = [];
  r.forEach(
    (p, v) => p.forEach(
      (C, O) => a.push({
        id: C,
        label: o.get(C) ?? C,
        row: v,
        col: O,
        x: We + O * Os,
        y: We + v * Ls,
        exit: i.has(C)
      })
    )
  );
  const l = new Map(a.map((p) => [p.id, p])), d = [];
  for (const [p, v, C] of t.edges) {
    const O = l.get(p), z = l.get(v);
    if (!O || !z) continue;
    const Pe = z.x - O.x, Te = z.y - O.y, V = va(Pe, Te);
    d.push({
      a: p,
      b: v,
      oneWay: C,
      x1: O.x + Pe * V,
      y1: O.y + Te * V,
      x2: z.x - Pe * V,
      y2: z.y - Te * V
    });
  }
  const m = r.reduce((p, v) => Math.max(p, v.length), 1);
  return {
    nodes: a,
    edges: d,
    width: We * 2 + (m - 1) * Os,
    height: We * 2 + (Math.max(r.length, 1) - 1) * Ls
  };
}
const ba = (e, t) => ({
  x: e.x1 + (e.x2 - e.x1) * t,
  y: e.y1 + (e.y2 - e.y1) * t
}), _i = (e, t, s) => e.edges.find((i) => i.a === t && i.b === s || i.a === s && i.b === t);
function ya(e, t) {
  const s = [];
  for (let i = 1; i < t.length; i++) {
    const r = _i(e, t[i - 1], t[i]);
    r && s.push(r);
  }
  return s;
}
var xa = Object.defineProperty, wa = Object.getOwnPropertyDescriptor, ge = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? wa(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && xa(t, s, r), r;
};
const St = Kt / 2, Et = Xt / 2, _a = 2, kt = 9, Sa = 7, _ = (e) => String(Math.round(e * 10) / 10);
let K = class extends $ {
  constructor() {
    super(...arguments), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
  }
  occupantsOf(e) {
    return this.presence?.occupants[e] ?? [];
  }
  select(e) {
    this.dispatchEvent(on(e));
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
      const n = Object.entries(r.candidates).sort((d, m) => m[1] - d[1] || d[0].localeCompare(m[0])), o = n[0]?.[0], a = n[1]?.[0];
      if (o === void 0 || a === void 0) continue;
      const l = _i(e, o, a);
      l && t.push({ name: i, ...ba(l, 0.5) });
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
    return x`<line
      class="edge ${s ? "on-path" : ""}"
      data-one-way=${e.oneWay}
      x1=${_(e.x1)}
      y1=${_(e.y1)}
      x2=${_(e.x2)}
      y2=${_(e.y2)}
      marker-end=${e.oneWay ? "url(#al-arrow)" : u}
    ></line>`;
  }
  renderNode(e) {
    const t = this.occupantsOf(e.id), s = t.slice(0, _a), i = t.length - s.length, r = this.selected.includes(e.id), n = [...s, ...i > 0 ? [`+${i}`] : []].join(", "), o = [
      e.label,
      e.exit ? "an exit" : "",
      t.length > 0 ? `${t.length} here: ${t.join(", ")}` : "empty"
    ].filter((a) => a !== "").join(", ");
    return x`<g
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
        x=${_(e.x - St)}
        y=${_(e.y - Et)}
        width=${Kt}
        height=${Xt}
        rx="8"
      ></rect>
      <text class="label" x=${_(e.x)} y=${_(e.y - 4)} text-anchor="middle">${e.label}</text>
      ${n === "" ? u : x`<text class="names" x=${_(e.x)} y=${_(e.y + 13)} text-anchor="middle">${n}</text>`}
      ${t.length === 0 ? u : this.renderBadge(e, t.length)}
      ${e.exit ? this.renderDoor(e) : u}
    </g>`;
  }
  renderBadge(e, t) {
    const s = e.x + St - kt - 3, i = e.y - Et + kt + 3;
    return x`<circle class="badge" cx=${_(s)} cy=${_(i)} r=${kt}></circle>
      <text class="count" x=${_(s)} y=${_(i + 3.5)} text-anchor="middle">${t}</text>`;
  }
  /** A door leaf in the corner: this room is a way out of the house. */
  renderDoor(e) {
    const t = e.x - St + 7, s = e.y + Et - 7;
    return x`<path class="door" d=${`M ${_(t)} ${_(s)} v -14 h 10 v 14 z`}></path>`;
  }
  renderPerson(e) {
    return x`<circle class="person" data-name=${e.name} cx=${_(e.x)} cy=${_(e.y)} r=${Sa}>
      <title>${e.name} is on the move</title>
    </circle>`;
  }
  render() {
    const e = this.config, t = this.topology;
    if (!e || !t || t.nodes.length === 0)
      return c`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
    const s = $a(e, t), i = new Set(this.paths.flatMap((n) => ya(s, n))), r = this.summary(s);
    return c`
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
K.styles = [
  M,
  E`
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
ge([
  h({ attribute: !1 })
], K.prototype, "hass", 2);
ge([
  h({ attribute: !1 })
], K.prototype, "config", 2);
ge([
  h({ attribute: !1 })
], K.prototype, "topology", 2);
ge([
  h({ attribute: !1 })
], K.prototype, "presence", 2);
ge([
  h({ attribute: !1 })
], K.prototype, "selected", 2);
ge([
  h({ attribute: !1 })
], K.prototype, "paths", 2);
K = ge([
  k("al-graph-map")
], K);
var Ea = Object.defineProperty, ka = Object.getOwnPropertyDescriptor, G = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ka(t, s) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (i ? o(t, s, r) : o(r)) || r);
  return i && r && Ea(t, s, r), r;
};
const Aa = 2e3, Ca = {
  enabled: "Estimate room presence",
  devices: "Tracked devices",
  envelope: "Presence envelope",
  threshold: "Confidence threshold",
  stay: "Stay probability",
  escape: "Escape probability",
  scale: "Distance scale",
  floor: "Room floor",
  stuck_after: "Reset when stuck for"
}, Pa = {
  enabled: "Estimate which room each tracked device is in. Needs Bermuda.",
  devices: "Bermuda device_trackers to follow — one per person.",
  envelope: "Preset the presence channel of every room starts from.",
  threshold: "How sure the estimate has to be before somebody counts as in the room.",
  stay: "Chance of staying put between two updates. Higher is steadier and slower.",
  escape: "Chance of turning up in a room with no path to this one. The way back from a wrong guess.",
  scale: "Distance, in metres, at which a scanner stops telling you anything.",
  floor: "Likelihood given to a room with no scanner of its own.",
  stuck_after: "How long the readings have to stay implausible before the estimate is reset."
}, Ta = [
  "enabled",
  "devices",
  "envelope",
  "threshold",
  "stay",
  "escape",
  "scale",
  "floor",
  "stuck_after"
], Oa = {
  entity: { multiple: !0, filter: { domain: "device_tracker", integration: "bermuda" } }
}, La = { number: { min: 0.01, max: 0.99, step: 0.01, mode: "slider" } }, Ma = { number: { min: 0.01, max: 1, step: 0.01, mode: "slider" } }, Ra = { number: { min: 0, max: 0.1, step: 1e-3, mode: "box" } }, Na = { number: { min: 0.1, step: 0.1, mode: "box" } }, Da = { number: { min: 0.01, max: 1, step: 0.01, mode: "box" } }, Ia = { duration: {} }, Ms = " → ", ja = "Give it an area that matches a room, or map it in Settings below.", Fa = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", Le = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
let D = class extends $ {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [], this.pathsPending = !1, this.pathSeq = 0, this.onMapSelect = (e) => {
      e.stopPropagation();
      const t = e.detail.id, s = this.selected.filter((r) => r !== null), i = s.includes(t) ? s.filter((r) => r !== t) : [...s, t].slice(-2);
      this.selected = [i[0] ?? null, i[1] ?? null], this.paths = [], this.refreshPaths();
    }, this.computeLabel = (e) => Ca[e.name] ?? e.name, this.computeHelper = (e) => Pa[e.name] ?? "";
  }
  connectedCallback() {
    super.connectedCallback(), this.refreshTopology(), this.refreshPresence(), this.timer = setInterval(() => {
      document.visibilityState !== "hidden" && this.refreshPresence();
    }, Aa);
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
        this.topology = await lr(e);
      } catch {
      }
  }
  async refreshPresence() {
    const e = this.hass;
    if (e)
      try {
        this.presence = await hr(e);
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
      const r = await cr(s, e, t);
      i === this.pathSeq && (this.paths = r);
    } catch {
    } finally {
      i === this.pathSeq && (this.pathsPending = !1);
    }
  }
  /** Friendly names for every group, so a room id never reaches the page. */
  get labels() {
    const e = this.config;
    return new Map(e ? wi(e).map((t) => [t.id, t.label]) : []);
  }
  roomName(e) {
    return e == null || e === "" ? "—" : this.labels.get(e) ?? e;
  }
  areaName(e) {
    return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
  }
  trail(e) {
    return e.map((t) => this.roomName(t)).join(Ms);
  }
  schemaFor(e) {
    return [
      { name: "enabled", selector: { boolean: {} } },
      { name: "devices", selector: Oa },
      { name: "envelope", selector: { select: { mode: "dropdown", options: Bt(e) } } },
      { name: "threshold", selector: Ma },
      { name: "stay", selector: La },
      { name: "escape", selector: Ra },
      { name: "scale", selector: Na },
      { name: "floor", selector: Da },
      { name: "stuck_after", selector: Ia }
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
    const s = xe(t), i = e.detail?.value ?? {}, r = {
      ...s,
      enabled: typeof i.enabled == "boolean" ? i.enabled : s.enabled,
      devices: i.devices === void 0 ? s.devices : this.mergeDevices(i.devices, s.devices),
      envelope: i.envelope === void 0 ? s.envelope : typeof i.envelope == "string" && i.envelope !== "" ? i.envelope : null,
      threshold: Le(i.threshold) ?? s.threshold,
      stay: Le(i.stay) ?? s.stay,
      escape: Le(i.escape) ?? s.escape,
      scale: Le(i.scale) ?? s.scale,
      floor: Le(i.floor) ?? s.floor,
      stuck_after: te(i.stuck_after) ?? s.stuck_after
    }, n = (a) => a === "devices" ? JSON.stringify(r.devices) === JSON.stringify(s.devices) : r[a] === s[a], o = Ta.find((a) => !n(a));
    o !== void 0 && this.dispatchEvent(ne(L(t, ["presence"], r), `presence:${o}`));
  }
  renderMap(e) {
    return c`<ha-card header="Rooms">
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
      return c`<div class="paths empty">Pick two rooms on the map to see the routes between them.</div>`;
    const s = `${this.roomName(e)}${Ms}${this.roomName(t)}`;
    return this.pathsPending ? c`<div class="paths muted">Finding routes from ${s}…</div>` : this.paths.length === 0 ? c`<div class="paths">
        <div class="muted">no route from ${s}</div>
      </div>` : c`<div class="paths">
      <div class="muted">
        ${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${s}
      </div>
      <ol>
        ${this.paths.map((i) => c`<li class="path">${this.trail(i)}</li>`)}
      </ol>
    </div>`;
  }
  renderPeople() {
    const e = Object.entries(this.presence?.devices ?? {}).sort(([t], [s]) => t.localeCompare(s));
    return e.length === 0 ? c`<ha-card header="People"
        ><div class="empty">No tracked device has reported a room yet.</div></ha-card
      >` : c`<ha-card header="People">
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
    return c`<tr class="device">
      <td class="who">${e}</td>
      <td class="room">
        ${this.roomName(t.room)}
        ${t.moving ? c`<span class="chip moving">moving</span>` : u}
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
    return c`<ha-card header="Scanners">
      ${e.length === 0 ? c`<div class="empty">No Bermuda scanners have been discovered.</div>` : c`<table>
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
    return c`<tr class="scanner ${t ? "unmapped" : ""}">
      <td class="name">${e.name}</td>
      <td class="area">${this.areaName(e.area_id)}</td>
      <td class="room">${t ? ja : this.roomName(e.group_id)}</td>
    </tr>`;
  }
  renderDisabled() {
    const e = this.presence?.disabled ?? [];
    return e.length === 0 ? u : c`<div class="disabled-sensors">
      ${Fa}
      <ul>
        ${e.map((t) => c`<li>${t}</li>`)}
      </ul>
    </div>`;
  }
  renderSettings(e) {
    const t = xe(e), s = se(this.errors, ["presence"]), i = this.errors.filter((n) => n.path === "presence"), r = {
      enabled: t.enabled,
      devices: t.devices.map((n) => n.device),
      envelope: t.envelope ?? "",
      threshold: t.threshold,
      stay: t.stay,
      escape: t.escape,
      scale: t.scale,
      floor: t.floor,
      stuck_after: ee(t.stuck_after)
    };
    return c`<ha-card header="Settings">
      ${i.map((n) => c`<ha-alert alert-type="error">${n.message}</ha-alert>`)}
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
    return e ? c`<div class="page">
      ${this.renderMap(e)} ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : c`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
  }
};
D.styles = [
  M,
  E`
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
    `
];
G([
  h({ attribute: !1 })
], D.prototype, "hass", 2);
G([
  h({ attribute: !1 })
], D.prototype, "config", 2);
G([
  h({ attribute: !1 })
], D.prototype, "errors", 2);
G([
  h({ type: Boolean })
], D.prototype, "narrow", 2);
G([
  f()
], D.prototype, "topology", 2);
G([
  f()
], D.prototype, "presence", 2);
G([
  f()
], D.prototype, "selected", 2);
G([
  f()
], D.prototype, "paths", 2);
G([
  f()
], D.prototype, "pathsPending", 2);
D = G([
  k("al-presence")
], D);
