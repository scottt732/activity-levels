const Z = globalThis, ce = Z.ShadowRoot && (Z.ShadyCSS === void 0 || Z.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, he = /* @__PURE__ */ Symbol(), ge = /* @__PURE__ */ new WeakMap();
let Me = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== he) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (ce && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = ge.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ge.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Fe = (t) => new Me(typeof t == "string" ? t : t + "", void 0, he), V = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[n + 1], t[0]);
  return new Me(s, t, he);
}, Ve = (t, e) => {
  if (ce) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), r = Z.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = s.cssText, t.appendChild(i);
  }
}, ve = ce ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return Fe(s);
})(t) : t;
const { is: We, defineProperty: qe, getOwnPropertyDescriptor: Ke, getOwnPropertyNames: Je, getOwnPropertySymbols: Ze, getPrototypeOf: Xe } = Object, se = globalThis, $e = se.trustedTypes, Ye = $e ? $e.emptyScript : "", Qe = se.reactiveElementPolyfillSupport, z = (t, e) => t, Y = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Ye : null;
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
} }, de = (t, e) => !We(t, e), be = { attribute: !0, type: String, converter: Y, reflect: !1, useDefault: !1, hasChanged: de };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), se.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let T = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = be) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, i, s);
      r !== void 0 && qe(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: r, set: n } = Ke(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: r, set(o) {
      const a = r?.call(this);
      n?.call(this, o), this.requestUpdate(e, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? be;
  }
  static _$Ei() {
    if (this.hasOwnProperty(z("elementProperties"))) return;
    const e = Xe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(z("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(z("properties"))) {
      const s = this.properties, i = [...Je(s), ...Ze(s)];
      for (const r of i) this.createProperty(r, s[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [i, r] of s) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const r = this._$Eu(s, i);
      r !== void 0 && this._$Eh.set(r, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const r of i) s.unshift(ve(r));
    } else e !== void 0 && s.push(ve(e));
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
    return Ve(e, this.constructor.elementStyles), e;
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
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : Y).toAttribute(s, i.type);
      this._$Em = e, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : Y;
      this._$Em = r;
      const a = o.fromAttribute(s, n.type);
      this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, r = !1, n) {
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? de)(n, s) || i.useDefault && i.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: r, wrapped: n }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? s ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, n] of i) {
        const { wrapped: o } = n, a = this[r];
        o !== !0 || this._$AL.has(r) || a === void 0 || this.C(r, void 0, n, a);
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
T.elementStyles = [], T.shadowRootOptions = { mode: "open" }, T[z("elementProperties")] = /* @__PURE__ */ new Map(), T[z("finalized")] = /* @__PURE__ */ new Map(), Qe?.({ ReactiveElement: T }), (se.reactiveElementVersions ??= []).push("2.1.2");
const ue = globalThis, ye = (t) => t, Q = ue.trustedTypes, _e = Q ? Q.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Ne = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, Re = "?" + w, et = `<${Re}>`, O = document, B = () => O.createComment(""), G = (t) => t === null || typeof t != "object" && typeof t != "function", pe = Array.isArray, tt = (t) => pe(t) || typeof t?.[Symbol.iterator] == "function", ae = `[ 	
\f\r]`, j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ae = /-->/g, we = />/g, S = RegExp(`>|${ae}(?:([^\\s"'>=/]+)(${ae}*=${ae}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), xe = /'/g, Ee = /"/g, Ue = /^(?:script|style|textarea|title)$/i, st = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), h = st(1), M = /* @__PURE__ */ Symbol.for("lit-noChange"), p = /* @__PURE__ */ Symbol.for("lit-nothing"), Se = /* @__PURE__ */ new WeakMap(), C = O.createTreeWalker(O, 129);
function De(t, e) {
  if (!pe(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _e !== void 0 ? _e.createHTML(e) : e;
}
const it = (t, e) => {
  const s = t.length - 1, i = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = j;
  for (let a = 0; a < s; a++) {
    const l = t[a];
    let c, m, u = -1, b = 0;
    for (; b < l.length && (o.lastIndex = b, m = o.exec(l), m !== null); ) b = o.lastIndex, o === j ? m[1] === "!--" ? o = Ae : m[1] !== void 0 ? o = we : m[2] !== void 0 ? (Ue.test(m[2]) && (r = RegExp("</" + m[2], "g")), o = S) : m[3] !== void 0 && (o = S) : o === S ? m[0] === ">" ? (o = r ?? j, u = -1) : m[1] === void 0 ? u = -2 : (u = o.lastIndex - m[2].length, c = m[1], o = m[3] === void 0 ? S : m[3] === '"' ? Ee : xe) : o === Ee || o === xe ? o = S : o === Ae || o === we ? o = j : (o = S, r = void 0);
    const A = o === S && t[a + 1].startsWith("/>") ? " " : "";
    n += o === j ? l + et : u >= 0 ? (i.push(c), l.slice(0, u) + Ne + l.slice(u) + w + A) : l + w + (u === -2 ? a : A);
  }
  return [De(t, n + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class F {
  constructor({ strings: e, _$litType$: s }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = e.length - 1, l = this.parts, [c, m] = it(e, s);
    if (this.el = F.createElement(c, i), C.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = C.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(Ne)) {
          const b = m[o++], A = r.getAttribute(u).split(w), K = /([.?@])?(.*)/.exec(b);
          l.push({ type: 1, index: n, name: K[2], strings: A, ctor: K[1] === "." ? nt : K[1] === "?" ? ot : K[1] === "@" ? at : ie }), r.removeAttribute(u);
        } else u.startsWith(w) && (l.push({ type: 6, index: n }), r.removeAttribute(u));
        if (Ue.test(r.tagName)) {
          const u = r.textContent.split(w), b = u.length - 1;
          if (b > 0) {
            r.textContent = Q ? Q.emptyScript : "";
            for (let A = 0; A < b; A++) r.append(u[A], B()), C.nextNode(), l.push({ type: 2, index: ++n });
            r.append(u[b], B());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Re) l.push({ type: 2, index: n });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(w, u + 1)) !== -1; ) l.push({ type: 7, index: n }), u += w.length - 1;
      }
      n++;
    }
  }
  static createElement(e, s) {
    const i = O.createElement("template");
    return i.innerHTML = e, i;
  }
}
function N(t, e, s = t, i) {
  if (e === M) return e;
  let r = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const n = G(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(t), r._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = r : s._$Cl = r), r !== void 0 && (e = N(t, r._$AS(t, e.values), r, i)), e;
}
class rt {
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
    const { el: { content: s }, parts: i } = this._$AD, r = (e?.creationScope ?? O).importNode(s, !0);
    C.currentNode = r;
    let n = C.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new W(n, n.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (c = new lt(n, this, e)), this._$AV.push(c), l = i[++a];
      }
      o !== l?.index && (n = C.nextNode(), o++);
    }
    return C.currentNode = O, r;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class W {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, r) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = N(this, e, s), G(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== M && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : tt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && G(this._$AH) ? this._$AA.nextSibling.data = e : this.T(O.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = F.createElement(De(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(s);
    else {
      const n = new rt(r, this), o = n.u(this.options);
      n.p(s), this.T(o), this._$AH = n;
    }
  }
  _$AC(e) {
    let s = Se.get(e.strings);
    return s === void 0 && Se.set(e.strings, s = new F(e)), s;
  }
  k(e) {
    pe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, r = 0;
    for (const n of e) r === s.length ? s.push(i = new W(this.O(B()), this.O(B()), this, this.options)) : i = s[r], i._$AI(n), r++;
    r < s.length && (this._$AR(i && i._$AB.nextSibling, r), s.length = r);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = ye(e).nextSibling;
      ye(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ie {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, r, n) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = s, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(e, s = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = N(this, e, s, 0), o = !G(e) || e !== this._$AH && e !== M, o && (this._$AH = e);
    else {
      const a = e;
      let l, c;
      for (e = n[0], l = 0; l < n.length - 1; l++) c = N(this, a[i + l], s, l), c === M && (c = this._$AH[l]), o ||= !G(c) || c !== this._$AH[l], c === p ? e = p : e !== p && (e += (c ?? "") + n[l + 1]), this._$AH[l] = c;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class nt extends ie {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class ot extends ie {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class at extends ie {
  constructor(e, s, i, r, n) {
    super(e, s, i, r, n), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = N(this, e, s, 0) ?? p) === M) return;
    const i = this._$AH, r = e === p && i !== p || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== p && (i === p || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class lt {
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
const ct = ue.litHtmlPolyfillSupport;
ct?.(F, W), (ue.litHtmlVersions ??= []).push("3.3.3");
const ht = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = s?.renderBefore ?? null;
    i._$litPart$ = r = new W(e.insertBefore(B(), n), n, void 0, s ?? {});
  }
  return r._$AI(t), r;
};
const me = globalThis;
class v extends T {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ht(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return M;
  }
}
v._$litElement$ = !0, v.finalized = !0, me.litElementHydrateSupport?.({ LitElement: v });
const dt = me.litElementPolyfillSupport;
dt?.({ LitElement: v });
(me.litElementVersions ??= []).push("4.2.2");
const k = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
const ut = { attribute: !0, type: String, converter: Y, reflect: !1, hasChanged: de }, pt = (t = ut, e, s) => {
  const { kind: i, metadata: r } = s;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), n.set(s.name, t), i === "accessor") {
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
  return (e, s) => typeof s == "object" ? pt(t, e, s) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(t, e, s);
}
function y(t) {
  return d({ ...t, state: !0, attribute: !1 });
}
const He = (t) => ({ ok: t.ok, errors: t.errors ?? [] }), mt = (t) => t.callWS({ type: "activity_levels/config/get" }).then((e) => e.config), ft = (t, e) => t.callWS({ type: "activity_levels/config/validate", config: e }).then(He);
async function gt(t, e) {
  try {
    return He(await t.callWS({ type: "activity_levels/config/save", config: e }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const vt = (t) => t.callWS({ type: "activity_levels/state" }), le = [
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
], Ce = (t) => new Promise((e) => setTimeout(e, t));
async function $t() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function bt(t = 8e3) {
  if (le.every((i) => customElements.get(i))) return { ok: !0, missing: [] };
  await Promise.race([$t(), Ce(t)]);
  const e = await Promise.all(
    le.map(
      (i) => Promise.race([customElements.whenDefined(i).then(() => !0), Ce(t).then(() => !1)])
    )
  ), s = le.filter((i, r) => !e[r]);
  return { ok: s.length === 0, missing: [...s] };
}
async function yt(t, e) {
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
function Ie(t, e) {
  let s = t;
  for (const i of e) s = s[i];
  return s;
}
function Oe(t) {
  return Array.isArray(t) ? [...t] : { ...t };
}
function re(t, e, s) {
  if (e.length === 0) throw new Error("empty path");
  const i = Oe(t);
  let r = i;
  for (let n = 0; n < e.length - 1; n++) {
    const o = e[n], a = Oe(r[o]);
    r[o] = a, r = a;
  }
  return s(r, e[e.length - 1]), i;
}
function ee(t, e, s) {
  return re(t, e, (i, r) => {
    i[r] = s;
  });
}
function je(t, e) {
  return re(t, e, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function Pe(t, e, s, i) {
  return re(t, [...e, s], (r) => {
    r.splice(s, 0, i);
  });
}
function _t(t, e, s, i) {
  return re(t, [...e, s], (r) => {
    const n = r, [o] = n.splice(s, 1);
    n.splice(i, 0, o);
  });
}
class At {
  constructor(e) {
    this.past = [], this.future = [], this.original = e, this.config = e;
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
  set(e) {
    this.past.push(this.config), this.future = [], this.config = e;
  }
  undo() {
    const e = this.past.pop();
    e && (this.future.push(this.config), this.config = e);
  }
  redo() {
    const e = this.future.pop();
    e && (this.past.push(this.config), this.config = e);
  }
  reset(e) {
    this.original = e, this.config = e, this.past = [], this.future = [];
  }
}
const L = V`
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
var wt = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, g = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? xt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && wt(e, s, r), r;
};
const Et = ["groups", "envelopes", "defaults"], St = 2e3, Ct = 1500;
let f = class extends v {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [];
  }
  async connectedCallback() {
    super.connectedCallback();
    const { ok: t, missing: e } = await bt();
    this.missing = t ? [] : e, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.stopLive();
  }
  async load() {
    try {
      const t = await mt(this.hass);
      this.draft = new At(t), this.errors = [], this.banner = null;
    } catch (t) {
      this.banner = { kind: "error", text: `Could not load configuration: ${t.message}` };
    }
  }
  setConfig(t) {
    this.draft?.set(t), this.requestUpdate();
  }
  async save() {
    const t = this.draft;
    if (t) {
      this.busy = !0;
      try {
        const e = await yt(t.config, {
          validate: (s) => ft(this.hass, s),
          save: (s) => gt(this.hass, s)
        });
        e.errors !== null && (this.errors = e.errors), this.banner = e.banner, e.reload && (await new Promise((s) => setTimeout(s, Ct)), await this.load());
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
  toggleLive(t) {
    this.liveOn = t, t ? this.startLive() : this.stopLive();
  }
  startLive() {
    this.stopLive();
    const t = async () => {
      try {
        this.live = await vt(this.hass);
      } catch {
      }
    };
    t(), this.liveTimer = window.setInterval(() => {
      t();
    }, St);
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
          ${Et.map(
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
    const e = (s) => this.setConfig(s.detail);
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
    const s = (r) => this.setConfig(r.detail);
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
          @al-select=${(r) => {
      this.selection = r.detail;
    }}
        ></al-group-editor>`;
  }
};
f.styles = [L];
g([
  d({ attribute: !1 })
], f.prototype, "hass", 2);
g([
  d({ type: Boolean })
], f.prototype, "narrow", 2);
g([
  y()
], f.prototype, "draft", 2);
g([
  y()
], f.prototype, "tab", 2);
g([
  y()
], f.prototype, "selection", 2);
g([
  y()
], f.prototype, "errors", 2);
g([
  y()
], f.prototype, "banner", 2);
g([
  y()
], f.prototype, "live", 2);
g([
  y()
], f.prototype, "liveOn", 2);
g([
  y()
], f.prototype, "busy", 2);
g([
  y()
], f.prototype, "missing", 2);
f = g([
  k("activity-levels-panel")
], f);
const R = (t) => t.join("/");
function ze(t, e) {
  const s = R(e), i = {};
  for (const r of t) {
    if (!r.path.startsWith(s + "/")) continue;
    const n = r.path.slice(s.length + 1);
    n.includes("/") || (i[n] = r.message);
  }
  return i;
}
function ke(t, e) {
  const s = R(e);
  return t.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
const Ot = (t) => ({
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
}), Pt = (t) => ({
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
function kt(t) {
  const e = /* @__PURE__ */ new Set(), s = (i) => {
    e.add(i.id), i.children.forEach(s);
  };
  return t.groups.forEach(s), e;
}
function Lt(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
function Tt(t, e) {
  const s = kt(t), i = Lt(e);
  if (!s.has(i)) return i;
  let r = 2;
  for (; s.has(`${i}_${r}`); ) r++;
  return `${i}_${r}`;
}
const X = (t, e) => Ie(t, e), Le = (t, e) => Ie(t, e), Mt = (t) => t.slice(0, -1), fe = (t) => t.slice(0, -2), Be = (t, e) => t.envelopes.find((s) => s.id === (e ?? t.defaults.envelope));
function Nt(t, e) {
  const s = Be(t, e.envelope), i = t.defaults, r = (n, o, a) => n ?? o ?? a;
  return {
    attack: r(e.attack, s?.attack, 0),
    decay: r(e.decay, s?.decay, 0),
    sustain: r(e.sustain, s?.sustain, 1),
    release: r(e.release, s?.release, 1800),
    impulse: r(e.impulse, s?.impulse, !1),
    retrigger: r(e.retrigger, s?.retrigger, i.retrigger),
    unavailable: r(e.unavailable, s?.unavailable, i.unavailable),
    debounce: r(e.debounce, s?.debounce, i.debounce)
  };
}
var Rt = Object.defineProperty, Ut = Object.getOwnPropertyDescriptor, H = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Ut(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Rt(e, s, r), r;
};
const Te = (t) => t.stopPropagation();
let x = class extends v {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  emitChange(t) {
    this.dispatchEvent(new CustomEvent("al-change", { detail: t, bubbles: !0, composed: !0 }));
  }
  emitSelect(t) {
    this.dispatchEvent(new CustomEvent("al-select", { detail: t, bubbles: !0, composed: !0 }));
  }
  isSelected(t) {
    return this.selection !== null && R(this.selection) === R(t);
  }
  select(t, e) {
    t.stopPropagation(), this.emitSelect(e);
  }
  selectOnKey(t, e) {
    t.key !== "Enter" && t.key !== " " || (t.preventDefault(), t.stopPropagation(), this.emitSelect(e));
  }
  addGroup(t, e) {
    const s = this.config;
    s && (this.emitChange(Pe(s, t, e, Ot(Tt(s, "new_group")))), this.emitSelect([...t, e]));
  }
  addStimulus(t, e) {
    const s = this.config;
    if (!s) return;
    const i = [...t, "stimuli"];
    this.emitChange(Pe(s, i, e, Pt(""))), this.emitSelect([...i, e]);
  }
  move(t, e) {
    const s = this.config;
    if (!s) return;
    const i = Mt(t), r = t[t.length - 1], n = r + e;
    this.emitChange(_t(s, i, r, n)), this.emitSelect([...i, n]);
  }
  removeNode(t, e) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${e}? This cannot be undone after saving.`)) return;
    this.emitChange(je(s, t));
    const i = fe(t);
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
  renderGroup(t, e, s, i, r, n) {
    const o = ke(this.errors, s), a = this.live?.groups[e.id], l = a?.max_value ?? e.max_value ?? t.defaults.max_value, c = a ? Math.max(0, Math.min(100, a.value / (l || 1) * 100)) : 0;
    return h`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div
          slot="header"
          class="header ${this.isSelected(s) ? "selected" : ""}"
          role="button"
          tabindex="0"
          @click=${(m) => this.select(m, s)}
          @keydown=${(m) => this.selectOnKey(m, s)}
        >
          <span class="name grow">${e.name || e.id || "(unnamed group)"}</span>
          ${o ? h`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : p}
          ${a ? h`<div class="meter" title="${a.value} of ${l}">
                  <div style="width: ${c}%"></div>
                </div>
                <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : p}
        </div>
        <div slot="icons" class="row" @click=${Te}>
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
            @click=${() => this.removeNode(s, `group "${e.name || e.id}" and everything in it`)}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="body">
          ${e.stimuli.map(
      (m, u) => this.renderStimulus(m, [...s, "stimuli", u], u, e.stimuli.length, e.id)
    )}
          ${e.stimuli.length === 0 ? h`<div class="muted empty">No stimuli yet.</div>` : p}
          <div class="children">
            ${e.children.map(
      (m, u) => this.renderGroup(t, m, [...s, "children", u], i + 1, u, e.children.length)
    )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(t, e, s, i, r) {
    const n = this.hass?.states[t.entity], o = n?.attributes.friendly_name ?? (t.entity || "(no entity)"), a = ke(this.errors, e), l = this.live?.voices[r]?.find((c) => c.label === (t.key ?? t.entity));
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
        ${n ? h`<span class="muted chip">${n.state}</span>` : p}
        ${l ? h`<span class="muted chip">${l.phase}</span>
              <span class="muted chip">${l.value.toFixed(2)}</span>` : p}
        <div class="row" @click=${Te}>
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
x.styles = [
  L,
  V`
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
      .header:focus-visible,
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
H([
  d({ attribute: !1 })
], x.prototype, "hass", 2);
H([
  d({ attribute: !1 })
], x.prototype, "config", 2);
H([
  d({ attribute: !1 })
], x.prototype, "selection", 2);
H([
  d({ attribute: !1 })
], x.prototype, "errors", 2);
H([
  d({ attribute: !1 })
], x.prototype, "live", 2);
x = H([
  k("al-tree")
], x);
function Dt(t) {
  const e = Math.floor(t / 3600), s = Math.floor((t - e * 3600) / 60), i = Math.round((t - e * 3600 - s * 60) * 1e3) / 1e3;
  return { hours: e, minutes: s, seconds: i };
}
function Ht(t) {
  if (!t) return null;
  const e = (t.days ?? 0) * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds + (t.milliseconds ?? 0) / 1e3;
  return Math.round(e * 1e3) / 1e3;
}
function It(t) {
  if (t === 0) return "0s";
  const e = [];
  let s = t;
  const i = [["d", 86400], ["h", 3600], ["m", 60]];
  for (const [r, n] of i) {
    const o = Math.floor(s / n);
    o > 0 && (e.push(`${o}${r}`), s -= o * n);
  }
  return s = Math.round(s * 1e3) / 1e3, s > 0 && e.push(`${s}s`), e.join(" ");
}
const jt = (t) => t.split(",").map((e) => e.trim()).filter((e) => e.length > 0), zt = (t) => (t ?? []).join(", "), te = (t) => t == null || t === "" ? null : t;
function Bt(t, e) {
  if (e != null)
    switch (t) {
      case "duration":
        return Dt(e);
      case "boolean":
        return e ? "true" : "false";
      default:
        return e;
    }
}
function Gt(t, e) {
  if (e == null || e === "") return null;
  switch (t) {
    case "duration":
      return Ht(e);
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
function Ft(t, e) {
  if (e == null) return "unset";
  switch (t) {
    case "duration":
      return It(e);
    case "boolean":
      return e ? "Yes" : "No";
    default:
      return String(e);
  }
}
var Vt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, _ = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Wt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && Vt(e, s, r), r;
};
const Ge = {
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
    t.stopPropagation(), this.emit(Gt(this.kind, t.detail?.value));
  }
  onReset() {
    this.emit(null);
  }
  render() {
    const t = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${Ft(this.kind, this.inherited)}`;
    return h`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? Ge : this.selector}
          .label=${this.label}
          .value=${Bt(this.kind, this.value)}
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
  V`
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
_([
  d({ attribute: !1 })
], $.prototype, "hass", 2);
_([
  d()
], $.prototype, "label", 2);
_([
  d({ attribute: !1 })
], $.prototype, "selector", 2);
_([
  d({ attribute: !1 })
], $.prototype, "value", 2);
_([
  d({ attribute: !1 })
], $.prototype, "inherited", 2);
_([
  d({ attribute: "inherited-from" })
], $.prototype, "inheritedFrom", 2);
_([
  d()
], $.prototype, "kind", 2);
_([
  d()
], $.prototype, "error", 2);
$ = _([
  k("al-override-field")
], $);
var qt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, q = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Kt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && qt(e, s, r), r;
};
const Jt = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, Zt = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, Xt = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], Yt = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], Qt = { number: { min: 0.1, step: 0.1, mode: "box" } }, es = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, ts = (t, e) => [
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: Xt } } },
  ...t.mix === "mean" ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: Yt } } }] : [],
  ...e ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]
];
let P = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.computeLabel = (t) => Jt[t.name] ?? t.name, this.computeHelper = (t) => Zt[t.name] ?? "";
  }
  emitChange(t) {
    this.dispatchEvent(new CustomEvent("al-change", { detail: t, bubbles: !0, composed: !0 }));
  }
  emitSelect(t) {
    this.dispatchEvent(new CustomEvent("al-select", { detail: t, bubbles: !0, composed: !0 }));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const { config: e, path: s } = this;
    if (!e || !s) return;
    const i = X(e, s), r = t.detail?.value ?? {}, n = {
      ...i,
      id: String(r.id ?? ""),
      name: te(r.name),
      area: te(r.area),
      mix: r.mix ?? i.mix,
      null_handling: r.null_handling ?? i.null_handling,
      gain: typeof r.gain == "number" ? r.gain : i.gain
    };
    this.emitChange(ee(e, s, n));
  }
  setField(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(ee(s, [...i, t], e));
  }
  onDelete() {
    const { config: t, path: e } = this;
    if (!t || !e) return;
    const s = X(t, e);
    if (!window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(je(t, e));
    const i = fe(e);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length === 0)
      return h`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = X(t, e);
    if (!s) return h`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = e.length === 2, r = ze(this.errors, e), n = this.errors.filter((a) => a.path === R(e)), o = {
      id: s.id,
      name: s.name ?? "",
      mix: s.mix
    };
    return s.mix === "mean" && (o.null_handling = s.null_handling), s.area !== null && (o.area = s.area), i || (o.gain = s.gain), h`
      <ha-card header="Group">
        ${n.map((a) => h`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${ts(s, i)}
          .error=${r}
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
          .selector=${Qt}
          .value=${s.max_value}
          .inherited=${t.defaults.max_value}
          .inheritedFrom=${"defaults"}
          .error=${r.max_value}
          @value-changed=${(a) => this.setField("max_value", a.detail.value)}
        ></al-override-field>
        <al-override-field
          .hass=${this.hass}
          label="Precision"
          kind="select"
          .selector=${es}
          .value=${s.precision === null ? null : String(s.precision)}
          .inherited=${String(t.defaults.precision)}
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
P.styles = [
  L,
  V`
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
q([
  d({ attribute: !1 })
], P.prototype, "hass", 2);
q([
  d({ attribute: !1 })
], P.prototype, "config", 2);
q([
  d({ attribute: !1 })
], P.prototype, "path", 2);
q([
  d({ attribute: !1 })
], P.prototype, "errors", 2);
P = q([
  k("al-group-editor")
], P);
var ss = Object.defineProperty, is = Object.getOwnPropertyDescriptor, I = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? is(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && ss(e, s, r), r;
};
const rs = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, ns = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, J = { duration: {} }, os = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, as = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, ls = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, cs = [
  { name: "attack", label: "Attack", kind: "duration", selector: J },
  { name: "decay", label: "Decay", kind: "duration", selector: J },
  { name: "sustain", label: "Sustain", kind: "number", selector: os },
  { name: "release", label: "Release", kind: "duration", selector: J },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: Ge },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: as },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: ls },
  { name: "debounce", label: "Debounce", kind: "duration", selector: J }
];
let E = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.computeLabel = (t) => rs[t.name] ?? t.name, this.computeHelper = (t) => ns[t.name] ?? "";
  }
  emitChange(t) {
    this.dispatchEvent(new CustomEvent("al-change", { detail: t, bubbles: !0, composed: !0 }));
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
    const i = Le(e, s), r = t.detail?.value ?? {}, n = {
      ...i,
      entity: String(r.entity ?? ""),
      to: jt(String(r.to ?? "")),
      gain: typeof r.gain == "number" ? r.gain : i.gain,
      key: te(r.key),
      envelope: te(r.envelope)
    };
    this.emitChange(ee(e, s, n));
  }
  setOverride(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(ee(s, [...i, t], e));
  }
  /** Where the effective value comes from when the stimulus does not override it. */
  sourceOf(t, e, s) {
    const i = Be(t, e.envelope);
    return i ? i[s] === null || i[s] === void 0 ? "defaults" : e.envelope ?? t.defaults.envelope : "defaults";
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length < 3)
      return h`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = Le(t, e);
    if (!s) return h`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = X(t, fe(e)), r = ze(this.errors, e), n = this.errors.filter((c) => c.path === R(e)), o = Nt(t, s), a = {
      entity: s.entity,
      to: zt(s.to),
      gain: s.gain,
      key: s.key ?? "",
      envelope: s.envelope ?? ""
    }, l = this.live?.voices[i?.id ?? ""]?.find(
      (c) => c.label === (s.key ?? s.entity)
    );
    return h`
      <ha-card header="Stimulus">
        ${n.map((c) => h`<ha-alert alert-type="error">${c.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${a}
          .schema=${this.schemaFor(t)}
          .error=${r}
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
        ${cs.map(
      (c) => h`<al-override-field
            .hass=${this.hass}
            .label=${c.label}
            .kind=${c.kind}
            .selector=${c.selector}
            .value=${s[c.name]}
            .inherited=${o[c.name]}
            .inheritedFrom=${this.sourceOf(t, s, c.name)}
            .error=${r[c.name]}
            @value-changed=${(m) => this.setOverride(c.name, m.detail.value)}
          ></al-override-field>`
    )}
        <!-- TODO(task 6): render <al-envelope-sketch> for the resolved envelope here. -->
      </ha-card>
    `;
  }
};
E.styles = [
  L,
  V`
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
I([
  d({ attribute: !1 })
], E.prototype, "hass", 2);
I([
  d({ attribute: !1 })
], E.prototype, "config", 2);
I([
  d({ attribute: !1 })
], E.prototype, "path", 2);
I([
  d({ attribute: !1 })
], E.prototype, "errors", 2);
I([
  d({ attribute: !1 })
], E.prototype, "live", 2);
E = I([
  k("al-stimulus-editor")
], E);
var hs = Object.defineProperty, ds = Object.getOwnPropertyDescriptor, ne = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ds(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && hs(e, s, r), r;
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
ne([
  d({ attribute: !1 })
], U.prototype, "hass", 2);
ne([
  d({ attribute: !1 })
], U.prototype, "config", 2);
ne([
  d({ attribute: !1 })
], U.prototype, "errors", 2);
U = ne([
  k("al-envelopes")
], U);
var us = Object.defineProperty, ps = Object.getOwnPropertyDescriptor, oe = (t, e, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ps(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (r = (i ? o(e, s, r) : o(r)) || r);
  return i && r && us(e, s, r), r;
};
let D = class extends v {
  constructor() {
    super(...arguments), this.errors = [];
  }
  render() {
    return h`<ha-card>Coming soon</ha-card>`;
  }
};
D.styles = [L];
oe([
  d({ attribute: !1 })
], D.prototype, "hass", 2);
oe([
  d({ attribute: !1 })
], D.prototype, "config", 2);
oe([
  d({ attribute: !1 })
], D.prototype, "errors", 2);
D = oe([
  k("al-defaults")
], D);
