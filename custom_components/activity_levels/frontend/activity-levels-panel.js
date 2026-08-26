const oe = globalThis, Ce = oe.ShadowRoot && (oe.ShadyCSS === void 0 || oe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Pe = /* @__PURE__ */ Symbol(), He = /* @__PURE__ */ new WeakMap();
let et = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== Pe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (Ce && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = He.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && He.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ut = (t) => new et(typeof t == "string" ? t : t + "", void 0, Pe), C = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + t[r + 1], t[0]);
  return new et(s, t, Pe);
}, pt = (t, e) => {
  if (Ce) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), n = oe.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, t.appendChild(i);
  }
}, Ie = Ce ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return ut(s);
})(t) : t;
const { is: mt, defineProperty: ft, getOwnPropertyDescriptor: vt, getOwnPropertyNames: gt, getOwnPropertySymbols: $t, getPrototypeOf: bt } = Object, fe = globalThis, je = fe.trustedTypes, yt = je ? je.emptyScript : "", _t = fe.reactiveElementPolyfillSupport, J = (t, e) => t, he = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? yt : null;
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
} }, Oe = (t, e) => !mt(t, e), Fe = { attribute: !0, type: String, converter: he, reflect: !1, useDefault: !1, hasChanged: Oe };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), fe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let j = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Fe) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(e, i, s);
      n !== void 0 && ft(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: n, set: r } = vt(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: n, set(o) {
      const a = n?.call(this);
      r?.call(this, o), this.requestUpdate(e, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Fe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(J("elementProperties"))) return;
    const e = bt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(J("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(J("properties"))) {
      const s = this.properties, i = [...gt(s), ...$t(s)];
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
      for (const n of i) s.unshift(Ie(n));
    } else e !== void 0 && s.push(Ie(e));
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
    return pt(e, this.constructor.elementStyles), e;
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
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : he).toAttribute(s, i.type);
      this._$Em = e, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, n = i._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : he;
      this._$Em = n;
      const a = o.fromAttribute(s, r.type);
      this[n] = a ?? this._$Ej?.get(n) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, n = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[e]), i ??= o.getPropertyOptions(e), !((i.hasChanged ?? Oe)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
        const { wrapped: o } = r, a = this[n];
        o !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, r, a);
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
j.elementStyles = [], j.shadowRootOptions = { mode: "open" }, j[J("elementProperties")] = /* @__PURE__ */ new Map(), j[J("finalized")] = /* @__PURE__ */ new Map(), _t?.({ ReactiveElement: j }), (fe.reactiveElementVersions ??= []).push("2.1.2");
const Le = globalThis, ze = (t) => t, de = Le.trustedTypes, Be = de ? de.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, tt = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, st = "?" + S, xt = `<${st}>`, D = document, Y = () => D.createComment(""), Z = (t) => t === null || typeof t != "object" && typeof t != "function", Re = Array.isArray, wt = (t) => Re(t) || typeof t?.[Symbol.iterator] == "function", ye = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ge = /-->/g, Ve = />/g, L = RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), We = /'/g, qe = /"/g, it = /^(?:script|style|textarea|title)$/i, nt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), c = nt(1), Ke = nt(2), z = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), Je = /* @__PURE__ */ new WeakMap(), R = D.createTreeWalker(D, 129);
function rt(t, e) {
  if (!Re(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Be !== void 0 ? Be.createHTML(e) : e;
}
const Et = (t, e) => {
  const s = t.length - 1, i = [];
  let n, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = W;
  for (let a = 0; a < s; a++) {
    const l = t[a];
    let h, m, p = -1, _ = 0;
    for (; _ < l.length && (o.lastIndex = _, m = o.exec(l), m !== null); ) _ = o.lastIndex, o === W ? m[1] === "!--" ? o = Ge : m[1] !== void 0 ? o = Ve : m[2] !== void 0 ? (it.test(m[2]) && (n = RegExp("</" + m[2], "g")), o = L) : m[3] !== void 0 && (o = L) : o === L ? m[0] === ">" ? (o = n ?? W, p = -1) : m[1] === void 0 ? p = -2 : (p = o.lastIndex - m[2].length, h = m[1], o = m[3] === void 0 ? L : m[3] === '"' ? qe : We) : o === qe || o === We ? o = L : o === Ge || o === Ve ? o = W : (o = L, n = void 0);
    const A = o === L && t[a + 1].startsWith("/>") ? " " : "";
    r += o === W ? l + xt : p >= 0 ? (i.push(h), l.slice(0, p) + tt + l.slice(p) + S + A) : l + S + (p === -2 ? a : A);
  }
  return [rt(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Q {
  constructor({ strings: e, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const a = e.length - 1, l = this.parts, [h, m] = Et(e, s);
    if (this.el = Q.createElement(h, i), R.currentNode = this.el.content, s === 2 || s === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (n = R.nextNode()) !== null && l.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const p of n.getAttributeNames()) if (p.endsWith(tt)) {
          const _ = m[o++], A = n.getAttribute(p).split(S), ne = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: r, name: ne[2], strings: A, ctor: ne[1] === "." ? St : ne[1] === "?" ? kt : ne[1] === "@" ? Ct : ve }), n.removeAttribute(p);
        } else p.startsWith(S) && (l.push({ type: 6, index: r }), n.removeAttribute(p));
        if (it.test(n.tagName)) {
          const p = n.textContent.split(S), _ = p.length - 1;
          if (_ > 0) {
            n.textContent = de ? de.emptyScript : "";
            for (let A = 0; A < _; A++) n.append(p[A], Y()), R.nextNode(), l.push({ type: 2, index: ++r });
            n.append(p[_], Y());
          }
        }
      } else if (n.nodeType === 8) if (n.data === st) l.push({ type: 2, index: r });
      else {
        let p = -1;
        for (; (p = n.data.indexOf(S, p + 1)) !== -1; ) l.push({ type: 7, index: r }), p += S.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const i = D.createElement("template");
    return i.innerHTML = e, i;
  }
}
function B(t, e, s = t, i) {
  if (e === z) return e;
  let n = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = Z(e) ? void 0 : e._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(t), n._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = n : s._$Cl = n), n !== void 0 && (e = B(t, n._$AS(t, e.values), n, i)), e;
}
class At {
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
    const { el: { content: s }, parts: i } = this._$AD, n = (e?.creationScope ?? D).importNode(s, !0);
    R.currentNode = n;
    let r = R.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let h;
        l.type === 2 ? h = new te(r, r.nextSibling, this, e) : l.type === 1 ? h = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (h = new Pt(r, this, e)), this._$AV.push(h), l = i[++a];
      }
      o !== l?.index && (r = R.nextNode(), o++);
    }
    return R.currentNode = D, n;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class te {
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
    e = B(this, e, s), Z(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== z && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : wt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && Z(this._$AH) ? this._$AA.nextSibling.data = e : this.T(D.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, n = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Q.createElement(rt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(s);
    else {
      const r = new At(n, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = Je.get(e.strings);
    return s === void 0 && Je.set(e.strings, s = new Q(e)), s;
  }
  k(e) {
    Re(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const r of e) n === s.length ? s.push(i = new te(this.O(Y()), this.O(Y()), this, this.options)) : i = s[n], i._$AI(r), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = ze(e).nextSibling;
      ze(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ve {
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
    if (r === void 0) e = B(this, e, s, 0), o = !Z(e) || e !== this._$AH && e !== z, o && (this._$AH = e);
    else {
      const a = e;
      let l, h;
      for (e = r[0], l = 0; l < r.length - 1; l++) h = B(this, a[i + l], s, l), h === z && (h = this._$AH[l]), o ||= !Z(h) || h !== this._$AH[l], h === d ? e = d : e !== d && (e += (h ?? "") + r[l + 1]), this._$AH[l] = h;
    }
    o && !n && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class St extends ve {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class kt extends ve {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class Ct extends ve {
  constructor(e, s, i, n, r) {
    super(e, s, i, n, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = B(this, e, s, 0) ?? d) === z) return;
    const i = this._$AH, n = e === d && i !== d || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== d && (i === d || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Pt {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    B(this, e);
  }
}
const Ot = Le.litHtmlPolyfillSupport;
Ot?.(Q, te), (Le.litHtmlVersions ??= []).push("3.3.3");
const Lt = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = n = new te(e.insertBefore(Y(), r), r, void 0, s ?? {});
  }
  return n._$AI(t), n;
};
const Te = globalThis;
class g extends j {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Lt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return z;
  }
}
g._$litElement$ = !0, g.finalized = !0, Te.litElementHydrateSupport?.({ LitElement: g });
const Rt = Te.litElementPolyfillSupport;
Rt?.({ LitElement: g });
(Te.litElementVersions ??= []).push("4.2.2");
const P = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
const Tt = { attribute: !0, type: String, converter: he, reflect: !1, hasChanged: Oe }, Mt = (t = Tt, e, s) => {
  const { kind: i, metadata: n } = s;
  let r = globalThis.litPropertyMetadata.get(n);
  if (r === void 0 && globalThis.litPropertyMetadata.set(n, r = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(s.name, t), i === "accessor") {
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
function u(t) {
  return (e, s) => typeof s == "object" ? Mt(t, e, s) : ((i, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(t, e, s);
}
function $(t) {
  return u({ ...t, state: !0, attribute: !1 });
}
const ot = (t) => ({ ok: t.ok, errors: t.errors ?? [] }), Dt = (t) => t.callWS({ type: "activity_levels/config/get" }).then((e) => e.config), Nt = (t, e) => t.callWS({ type: "activity_levels/config/validate", config: e }).then(ot);
async function Ut(t, e) {
  try {
    return ot(await t.callWS({ type: "activity_levels/config/save", config: e }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const Ht = (t) => t.callWS({ type: "activity_levels/state" }), _e = [
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
], Xe = (t) => new Promise((e) => setTimeout(e, t));
async function It() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function jt(t = 8e3) {
  if (_e.every((i) => customElements.get(i))) return { ok: !0, missing: [] };
  await Promise.race([It(), Xe(t)]);
  const e = await Promise.all(
    _e.map(
      (i) => Promise.race([customElements.whenDefined(i).then(() => !0), Xe(t).then(() => !1)])
    )
  ), s = _e.filter((i, n) => !e[n]);
  return { ok: s.length === 0, missing: [...s] };
}
async function Ft(t, e) {
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
function Me(t, e) {
  let s = t;
  for (const i of e) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function Ye(t) {
  return Array.isArray(t) ? [...t] : { ...t };
}
function ge(t, e, s) {
  if (e.length === 0) throw new Error("empty path");
  const i = Ye(t);
  let n = i;
  for (let r = 0; r < e.length - 1; r++) {
    const o = e[r], a = Ye(n[o]);
    n[o] = a, n = a;
  }
  return s(n, e[e.length - 1]), i;
}
function N(t, e, s) {
  return ge(t, e, (i, n) => {
    i[n] = s;
  });
}
function De(t, e) {
  return ge(t, e, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function Se(t, e, s, i) {
  return ge(t, [...e, s], (n) => {
    n.splice(s, 0, i);
  });
}
function zt(t, e, s, i) {
  return ge(t, [...e, s], (n) => {
    const r = n, [o] = r.splice(s, 1);
    r.splice(i, 0, o);
  });
}
const Bt = 1e3;
class Gt {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < Bt || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
var Vt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, b = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Wt(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Vt(e, s, n), n;
};
const qt = ["groups", "envelopes", "defaults"], Kt = 2e3, Jt = 1500;
let f = class extends g {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [];
  }
  async connectedCallback() {
    super.connectedCallback();
    const { ok: t, missing: e } = await jt();
    this.missing = t ? [] : e, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.stopLive();
  }
  async load() {
    try {
      const t = await Dt(this.hass);
      this.draft = new Gt(t), this.syncSelection(), this.errors = [], this.banner = null;
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
    !t || !this.selection || Me(t, this.selection) === void 0 && (this.selection = null);
  }
  async save() {
    const t = this.draft;
    if (t) {
      this.busy = !0;
      try {
        const e = await Ft(t.config, {
          validate: (s) => Nt(this.hass, s),
          save: (s) => Ut(this.hass, s)
        });
        e.errors !== null && (this.errors = e.errors), this.banner = e.banner, e.reload && (await new Promise((s) => setTimeout(s, Jt)), await this.load());
      } finally {
        this.busy = !1;
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
    this.liveOn = t, t ? this.startLive() : this.stopLive();
  }
  startLive() {
    this.stopLive();
    const t = async () => {
      try {
        this.live = await Ht(this.hass);
      } catch {
      }
    };
    t(), this.liveTimer = window.setInterval(() => {
      t();
    }, Kt);
  }
  stopLive() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0), this.live = null;
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
          <ha-button .disabled=${!t?.dirty || this.busy} @click=${this.save}>${t?.dirty ? "Save" : "Saved"}</ha-button>
        </div>
        ${this.renderBanner()}
        <div class="tabs">
          ${qt.map(
      (e) => c`<div
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
        ${t ? this.renderTab(t) : c`<p style="padding:16px">Loading…</p>`}
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
b([
  u({ attribute: !1 })
], f.prototype, "hass", 2);
b([
  u({ type: Boolean })
], f.prototype, "narrow", 2);
b([
  $()
], f.prototype, "draft", 2);
b([
  $()
], f.prototype, "tab", 2);
b([
  $()
], f.prototype, "selection", 2);
b([
  $()
], f.prototype, "errors", 2);
b([
  $()
], f.prototype, "banner", 2);
b([
  $()
], f.prototype, "live", 2);
b([
  $()
], f.prototype, "liveOn", 2);
b([
  $()
], f.prototype, "busy", 2);
b([
  $()
], f.prototype, "missing", 2);
f = b([
  P("activity-levels-panel")
], f);
const v = (t) => t.join("/");
function $e(t, e) {
  const s = v(e), i = {};
  for (const n of t) {
    if (!n.path.startsWith(s + "/")) continue;
    const r = n.path.slice(s.length + 1);
    r.includes("/") || (i[r] = n.message);
  }
  return i;
}
function ke(t, e) {
  const s = v(e);
  return t.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function se(t, e) {
  const s = new CustomEvent("al-change", {
    detail: t,
    bubbles: !0,
    composed: !0
  });
  return e !== void 0 && (s.coalesceKey = e), s;
}
const at = (t) => new CustomEvent("al-select", { detail: t, bubbles: !0, composed: !0 }), Xt = (t) => ({
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
}), Yt = (t) => ({
  id: t,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), Zt = (t) => ({
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
function Qt(t) {
  const e = /* @__PURE__ */ new Set(), s = (i) => {
    e.add(i.id), i.children.forEach(s);
  };
  return t.groups.forEach(s), e;
}
function es(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const ts = (t) => new Set(t.envelopes.map((e) => e.id));
function lt(t, e) {
  const s = es(e);
  if (!t.has(s)) return s;
  let i = 2;
  for (; t.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const ss = (t, e) => lt(Qt(t), e), is = (t, e) => lt(ts(t), e);
function ns(t, e) {
  const s = [], i = (n) => {
    n.stimuli.some((r) => r.envelope === e) && s.push(n.id), n.children.forEach(i);
  };
  return t.groups.forEach(i), { defaults: t.defaults.envelope === e, groups: s };
}
function rs(t, e, s) {
  const i = t.envelopes[e];
  if (!i || i.id === s) return t;
  const n = i.id, r = t.envelopes.map((a, l) => l === e ? { ...a, id: s } : a);
  if (t.envelopes.some((a, l) => l !== e && a.id === n)) return { ...t, envelopes: r };
  const o = (a) => ({
    ...a,
    stimuli: a.stimuli.map((l) => l.envelope === n ? { ...l, envelope: s } : l),
    children: a.children.map(o)
  });
  return {
    ...t,
    defaults: t.defaults.envelope === n ? { ...t.defaults, envelope: s } : t.defaults,
    envelopes: r,
    groups: t.groups.map(o)
  };
}
const ae = (t, e) => Me(t, e), xe = (t, e) => Me(t, e), os = (t) => t.slice(0, -1), Ne = (t) => t.slice(0, -2), ct = (t, e) => t.envelopes.find((s) => s.id === (e ?? t.defaults.envelope));
function as(t, e) {
  const s = ct(t, e.envelope), i = t.defaults, n = (r, o, a) => r ?? o ?? a;
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
var ls = Object.defineProperty, cs = Object.getOwnPropertyDescriptor, V = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? cs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ls(e, s, n), n;
};
const Ze = (t) => t.stopPropagation(), hs = (t) => {
  (t.key === "Enter" || t.key === " ") && t.stopPropagation();
};
let k = class extends g {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  emitChange(t) {
    this.dispatchEvent(se(t));
  }
  emitSelect(t) {
    this.dispatchEvent(at(t));
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
    s && (this.emitChange(Se(s, t, e, Xt(ss(s, "new_group")))), this.emitSelect([...t, e]));
  }
  addStimulus(t, e) {
    const s = this.config;
    if (!s) return;
    const i = [...t, "stimuli"];
    this.emitChange(Se(s, i, e, Zt(""))), this.emitSelect([...i, e]);
  }
  move(t, e) {
    const s = this.config;
    if (!s) return;
    const i = os(t), n = t[t.length - 1], r = n + e;
    this.emitChange(zt(s, i, n, r)), this.emitSelect([...i, r]);
  }
  removeNode(t, e) {
    const s = this.config;
    if (!s || !window.confirm(`Delete ${e}? This cannot be undone after saving.`)) return;
    this.emitChange(De(s, t));
    const i = Ne(t);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const t = this.config;
    return t ? c`
      <ha-card>
        ${t.groups.map((e, s) => this.renderGroup(t, e, ["groups", s], 0, s, t.groups.length))}
        ${t.groups.length === 0 ? c`<p class="muted">No groups yet. Add one to get started.</p>` : d}
        <div class="row">
          <ha-button @click=${() => this.addGroup(["groups"], t.groups.length)}>Add group</ha-button>
        </div>
      </ha-card>
    ` : c`<ha-card><span class="muted">Loading…</span></ha-card>`;
  }
  renderGroup(t, e, s, i, n, r) {
    const o = ke(this.errors, s), a = this.live?.groups[e.id], l = a?.max_value ?? e.max_value ?? t.defaults.max_value, h = a ? Math.max(0, Math.min(100, a.value / (l || 1) * 100)) : 0;
    return c`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(m) => this.select(m, s)}
            @keydown=${hs}
          >
            ${e.name || e.id || "(unnamed group)"}
          </button>
          ${o ? c`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : d}
          ${a ? c`<div class="meter" title="${a.value} of ${l}">
                  <div style="width: ${h}%"></div>
                </div>
                <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : d}
        </div>
        <div slot="icons" class="row" @click=${Ze}>
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
      (m, p) => this.renderStimulus(m, [...s, "stimuli", p], p, e.stimuli.length, e.id)
    )}
          ${e.stimuli.length === 0 ? c`<div class="muted empty">No stimuli yet.</div>` : d}
          <div class="children">
            ${e.children.map(
      (m, p) => this.renderGroup(t, m, [...s, "children", p], i + 1, p, e.children.length)
    )}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }
  renderStimulus(t, e, s, i, n) {
    const r = this.hass?.states[t.entity], o = r?.attributes.friendly_name ?? (t.entity || "(no entity)"), a = ke(this.errors, e), l = this.live?.voices[n]?.find((h) => h.label === (t.key ?? t.entity));
    return c`
      <div
        class="row stimulus ${this.isSelected(e) ? "selected" : ""}"
        role="button"
        tabindex="0"
        @click=${(h) => this.select(h, e)}
        @keydown=${(h) => this.selectOnKey(h, e)}
      >
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="name grow" title=${t.entity}>${o}</span>
        ${a ? c`<span class="badge" title="${a} problem(s)">${a}</span>` : d}
        ${r ? c`<span class="muted chip">${r.state}</span>` : d}
        ${l ? c`<span class="muted chip">${l.phase}</span>
              <span class="muted chip">${l.value.toFixed(2)}</span>` : d}
        <div class="row" @click=${Ze}>
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
    `
];
V([
  u({ attribute: !1 })
], k.prototype, "hass", 2);
V([
  u({ attribute: !1 })
], k.prototype, "config", 2);
V([
  u({ attribute: !1 })
], k.prototype, "selection", 2);
V([
  u({ attribute: !1 })
], k.prototype, "errors", 2);
V([
  u({ attribute: !1 })
], k.prototype, "live", 2);
k = V([
  P("al-tree")
], k);
function T(t) {
  const e = Math.floor(t / 3600), s = Math.floor((t - e * 3600) / 60), i = Math.round((t - e * 3600 - s * 60) * 1e3) / 1e3, n = Math.floor(i), r = Math.round((i - n) * 1e3);
  return r === 0 ? { hours: e, minutes: s, seconds: n } : { hours: e, minutes: s, seconds: n, milliseconds: r };
}
function M(t) {
  if (!t) return null;
  const e = (t.days ?? 0) * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds + (t.milliseconds ?? 0) / 1e3;
  return Math.round(e * 1e3) / 1e3;
}
function K(t) {
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
const Qe = (t) => t.split(",").map((e) => e.trim()).filter((e) => e.length > 0), q = (t) => (t ?? []).join(", "), ue = (t) => t == null || t === "" ? null : t;
function ds(t, e) {
  if (e != null)
    switch (t) {
      case "duration":
        return T(e);
      case "boolean":
        return e ? "true" : "false";
      default:
        return e;
    }
}
function us(t, e) {
  if (e == null || e === "") return null;
  switch (t) {
    case "duration":
      return M(e);
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
function ps(t, e) {
  if (e == null) return "unset";
  switch (t) {
    case "duration":
      return K(e);
    case "boolean":
      return e ? "Yes" : "No";
    default:
      return String(e);
  }
}
var ms = Object.defineProperty, fs = Object.getOwnPropertyDescriptor, E = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? fs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ms(e, s, n), n;
};
const Ue = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
let y = class extends g {
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
    t.stopPropagation(), this.emit(us(this.kind, t.detail?.value));
  }
  onReset() {
    this.emit(null);
  }
  render() {
    const t = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${ps(this.kind, this.inherited)}`;
    return c`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? Ue : this.selector}
          .label=${this.label}
          .value=${ds(this.kind, this.value)}
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
  u({ attribute: !1 })
], y.prototype, "hass", 2);
E([
  u()
], y.prototype, "label", 2);
E([
  u({ attribute: !1 })
], y.prototype, "selector", 2);
E([
  u({ attribute: !1 })
], y.prototype, "value", 2);
E([
  u({ attribute: !1 })
], y.prototype, "inherited", 2);
E([
  u({ attribute: "inherited-from" })
], y.prototype, "inheritedFrom", 2);
E([
  u()
], y.prototype, "kind", 2);
E([
  u()
], y.prototype, "error", 2);
y = E([
  P("al-override-field")
], y);
var vs = Object.defineProperty, gs = Object.getOwnPropertyDescriptor, ie = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? gs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && vs(e, s, n), n;
};
const $s = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, bs = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, ys = ["id", "name", "area", "mix", "null_handling", "gain"], _s = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], xs = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], ws = { number: { min: 0.1, step: 0.1, mode: "box" } }, Es = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, As = (t, e) => [
  { name: "id", selector: { text: {} } },
  { name: "name", selector: { text: {} } },
  { name: "area", selector: { area: {} } },
  { name: "mix", selector: { select: { mode: "dropdown", options: _s } } },
  ...t.mix === "mean" ? [{ name: "null_handling", selector: { select: { mode: "dropdown", options: xs } } }] : [],
  ...e ? [] : [{ name: "gain", selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } } }]
];
let U = class extends g {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.computeLabel = (t) => $s[t.name] ?? t.name, this.computeHelper = (t) => bs[t.name] ?? "";
  }
  emitChange(t, e) {
    this.dispatchEvent(se(t, e));
  }
  emitSelect(t) {
    this.dispatchEvent(at(t));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const { config: e, path: s } = this;
    if (!e || !s) return;
    const i = ae(e, s);
    if (!i) return;
    const n = t.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      name: ue(n.name),
      area: ue(n.area),
      mix: n.mix ?? i.mix,
      null_handling: n.null_handling ?? i.null_handling,
      gain: typeof n.gain == "number" ? n.gain : i.gain
    }, o = ys.find((a) => r[a] !== i[a]);
    o !== void 0 && this.emitChange(N(e, s, r), `${v(s)}:${o}`);
  }
  setField(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(N(s, [...i, t], e), `${v(i)}:${t}`);
  }
  onDelete() {
    const { config: t, path: e } = this;
    if (!t || !e) return;
    const s = ae(t, e);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange(De(t, e));
    const i = Ne(e);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length === 0)
      return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = ae(t, e);
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = e.length === 2, n = $e(this.errors, e), r = this.errors.filter((a) => a.path === v(e)), o = {
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
          .schema=${As(s, i)}
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
          .selector=${ws}
          .value=${s.max_value}
          .inherited=${t.defaults.max_value}
          .inheritedFrom=${"defaults"}
          .error=${n.max_value}
          @value-changed=${(a) => this.setField("max_value", a.detail.value)}
        ></al-override-field>
        <al-override-field
          .hass=${this.hass}
          label="Precision"
          kind="select"
          .selector=${Es}
          .value=${s.precision === null ? null : String(s.precision)}
          .inherited=${String(t.defaults.precision)}
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
U.styles = [
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
ie([
  u({ attribute: !1 })
], U.prototype, "hass", 2);
ie([
  u({ attribute: !1 })
], U.prototype, "config", 2);
ie([
  u({ attribute: !1 })
], U.prototype, "path", 2);
ie([
  u({ attribute: !1 })
], U.prototype, "errors", 2);
U = ie([
  P("al-group-editor")
], U);
function ht(t, e = 0.25) {
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
const Ss = (t) => Math.round(t * 100) / 100;
function ks(t, e = 0.25) {
  const s = ht(t, e), i = (r) => ((s[r]?.x ?? 0) + (s[r + 1]?.x ?? 0)) / 2;
  if (t.impulse) {
    const r = [{ text: "impulse", x: 0 }];
    return t.release > 0 && r.push({ text: `R ${K(t.release)}`, x: i(1) }), r;
  }
  const n = [];
  return t.attack > 0 && n.push({ text: `A ${K(t.attack)}`, x: i(0) }), t.decay > 0 && n.push({ text: `D ${K(t.decay)}`, x: i(1) }), n.push({ text: `S ${Ss(t.sustain)}`, x: i(2) }), t.release > 0 && n.push({ text: `R ${K(t.release)}`, x: i(3) }), n;
}
var Cs = Object.defineProperty, Ps = Object.getOwnPropertyDescriptor, dt = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ps(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Cs(e, s, n), n;
};
const ee = 10, pe = 190, Os = 10, F = 58, Ls = 72, le = (t) => ee + t * (pe - ee), we = (t) => F - t * (F - Os), X = (t) => String(Math.round(t * 10) / 10), Ee = (t, e) => `${X(t)},${X(e)}`, Rs = (t) => Math.min(pe - 6, Math.max(ee + 6, le(t)));
let me = class extends g {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const t = this.envelope;
    if (!t) return d;
    const e = ht(t), s = e[0], i = e[e.length - 1], n = e.map((l) => Ee(le(l.x), we(l.y))).join(" "), r = `${Ee(le(s.x), F)} ${n} ${Ee(le(i.x), F)}`, o = ks(t), a = t.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${ee} y1=${F} x2=${pe} y2=${F}></line>
        ${t.impulse ? d : Ke`<line
              class="grid"
              x1=${ee}
              y1=${X(we(t.sustain))}
              x2=${pe}
              y2=${X(we(t.sustain))}
            ></line>`}
        <polygon class="area" points=${r}></polygon>
        <polyline class="curve" points=${n}></polyline>
        ${o.map(
      (l) => Ke`<text class="caption" x=${X(Rs(l.x))} y=${Ls} text-anchor="middle">${l.text}</text>`
    )}
      </svg>
    `;
  }
};
me.styles = [
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
dt([
  u({ attribute: !1 })
], me.prototype, "envelope", 2);
me = dt([
  P("al-envelope-sketch")
], me);
var Ts = Object.defineProperty, Ms = Object.getOwnPropertyDescriptor, H = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ms(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && Ts(e, s, n), n;
};
const Ds = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, Ns = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, Us = ["entity", "gain", "key", "envelope"], re = { duration: { enable_millisecond: !0 } }, Hs = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Is = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, js = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Fs = [
  { name: "attack", label: "Attack", kind: "duration", selector: re },
  { name: "decay", label: "Decay", kind: "duration", selector: re },
  { name: "sustain", label: "Sustain", kind: "number", selector: Hs },
  { name: "release", label: "Release", kind: "duration", selector: re },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: Ue },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Is },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: js },
  { name: "debounce", label: "Debounce", kind: "duration", selector: re }
];
let x = class extends g {
  constructor() {
    super(...arguments), this.path = null, this.errors = [], this.live = null, this.toText = null, this.computeLabel = (t) => Ds[t.name] ?? t.name, this.computeHelper = (t) => Ns[t.name] ?? "";
  }
  /** Drop the raw text when the selection moves, or when the config changed from elsewhere. */
  willUpdate(t) {
    if (t.has("path")) {
      this.toText = null;
      return;
    }
    if (this.toText === null || !t.has("config")) return;
    const { config: e, path: s } = this, i = e && s ? xe(e, s) : void 0;
    i && q(i.to) !== q(Qe(this.toText)) && (this.toText = null);
  }
  emitChange(t, e) {
    this.dispatchEvent(se(t, e));
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
      to: Qe(r),
      gain: typeof n.gain == "number" ? n.gain : i.gain,
      key: ue(n.key),
      envelope: ue(n.envelope)
    }, a = q(o.to) !== q(i.to) ? "to" : Us.find((l) => o[l] !== i[l]);
    a !== void 0 && this.emitChange(N(e, s, o), `${v(s)}:${a}`);
  }
  setOverride(t, e) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(N(s, [...i, t], e), `${v(i)}:${t}`);
  }
  /** Where the effective value comes from when the stimulus does not override it. */
  sourceOf(t, e, s) {
    const i = ct(t, e.envelope);
    return i ? i[s] === null || i[s] === void 0 ? "defaults" : e.envelope ?? t.defaults.envelope : "defaults";
  }
  render() {
    const { config: t, path: e } = this;
    if (!t || !e || e.length < 3)
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = xe(t, e);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = ae(t, Ne(e)), n = $e(this.errors, e), r = this.errors.filter((h) => h.path === v(e)), o = as(t, s), a = {
      entity: s.entity,
      to: this.toText ?? q(s.to),
      gain: s.gain,
      key: s.key ?? "",
      envelope: s.envelope ?? ""
    }, l = this.live?.voices[i?.id ?? ""]?.find(
      (h) => h.label === (s.key ?? s.entity)
    );
    return c`
      <ha-card header="Stimulus">
        ${r.map((h) => c`<ha-alert alert-type="error">${h.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${a}
          .schema=${this.schemaFor(t)}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        ${l ? c`<div class="row live">
              <span class="muted">Live</span>
              <span class="chip">${l.phase}</span>
              <span class="chip">${l.value.toFixed(2)}</span>
              <span class="dot ${l.gate ? "gated" : ""}" title=${l.gate ? "Gate open" : "Gate closed"}></span>
            </div>` : d}

        <h3>Envelope overrides</h3>
        ${Fs.map(
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
x.styles = [
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
  u({ attribute: !1 })
], x.prototype, "hass", 2);
H([
  u({ attribute: !1 })
], x.prototype, "config", 2);
H([
  u({ attribute: !1 })
], x.prototype, "path", 2);
H([
  u({ attribute: !1 })
], x.prototype, "errors", 2);
H([
  u({ attribute: !1 })
], x.prototype, "live", 2);
H([
  $()
], x.prototype, "toText", 2);
x = H([
  P("al-stimulus-editor")
], x);
var zs = Object.defineProperty, Bs = Object.getOwnPropertyDescriptor, I = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Bs(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && zs(e, s, n), n;
};
const Gs = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, Vs = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the sustain level back to zero.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, Ws = ["id", "attack", "decay", "sustain", "release", "impulse"], ce = { duration: { enable_millisecond: !0 } }, qs = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, Ks = { boolean: {} }, Js = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Xs = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Ys = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: ce },
  { name: "decay", selector: ce },
  { name: "sustain", selector: qs },
  { name: "release", selector: ce },
  { name: "impulse", selector: Ks }
], Zs = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Js },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Xs },
  { name: "debounce", label: "Debounce", kind: "duration", selector: ce }
];
let w = class extends g {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (t) => Gs[t.name] ?? t.name, this.computeHelper = (t) => Vs[t.name] ?? "";
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
    this.dispatchEvent(se(t, e));
  }
  selectPreset(t) {
    this.selected = t, this.blocked = null;
  }
  addPreset() {
    const t = this.config;
    if (!t) return;
    this.blocked = null;
    const e = t.envelopes.length;
    this.emitChange(Se(t, ["envelopes"], e, Yt(is(t, "preset")))), this.selected = e;
  }
  removePreset(t) {
    const e = this.config;
    if (!e) return;
    const s = e.envelopes[t];
    if (!s) return;
    const i = ns(e, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = t, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange(De(e, ["envelopes", t])), this.selected >= t && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(t) {
    t.stopPropagation();
    const e = this.config, s = this.selected, i = e?.envelopes[s];
    if (!e || !i) return;
    const n = t.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      attack: M(n.attack) ?? i.attack,
      decay: M(n.decay) ?? i.decay,
      sustain: typeof n.sustain == "number" ? n.sustain : i.sustain,
      release: M(n.release) ?? i.release,
      impulse: typeof n.impulse == "boolean" ? n.impulse : i.impulse
    }, o = Ws.find((h) => r[h] !== i[h]);
    if (o === void 0) return;
    const a = ["envelopes", s], l = N(rs(e, s, r.id), a, r);
    this.emitChange(l, `${v(a)}:${o}`);
  }
  setOverride(t, e) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const n = ["envelopes", i, t];
    this.emitChange(N(s, n, e), v(n));
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
      const n = ke(this.errors, ["envelopes", i]);
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
        ${e ? c`<ha-alert alert-type="warning">${Qs(e)}</ha-alert>` : d}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(t) {
    const e = this.selected, s = t.envelopes[e];
    if (!s) return c`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", e], n = $e(this.errors, i), r = this.errors.filter((a) => a.path === v(i)), o = {
      id: s.id,
      attack: T(s.attack),
      decay: T(s.decay),
      sustain: s.sustain,
      release: T(s.release),
      impulse: s.impulse
    };
    return c`
      <ha-card header="Envelope preset">
        ${r.map((a) => c`<ha-alert alert-type="error">${a.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Ys}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Zs.map(
      (a) => c`<al-override-field
            .hass=${this.hass}
            .label=${a.label}
            .kind=${a.kind}
            .selector=${a.kind === "boolean" ? Ue : a.selector}
            .value=${s[a.name]}
            .inherited=${t.defaults[a.name]}
            .inheritedFrom=${"defaults"}
            .error=${n[a.name]}
            @value-changed=${(l) => this.setOverride(a.name, l.detail.value)}
          ></al-override-field>`
    )}
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
I([
  u({ attribute: !1 })
], w.prototype, "hass", 2);
I([
  u({ attribute: !1 })
], w.prototype, "config", 2);
I([
  u({ attribute: !1 })
], w.prototype, "errors", 2);
I([
  u({ type: Boolean })
], w.prototype, "narrow", 2);
I([
  $()
], w.prototype, "selected", 2);
I([
  $()
], w.prototype, "blocked", 2);
w = I([
  P("al-envelopes")
], w);
function Qs(t) {
  const e = [];
  return t.defaults && e.push("the defaults"), t.groups.length > 0 && e.push(`group${t.groups.length > 1 ? "s" : ""} ${t.groups.join(", ")}`), `"${t.id}" is still used by ${e.join(" and ")}. Point those at another preset first.`;
}
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, be = (t, e, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ti(e, s) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (n = (i ? o(e, s, n) : o(n)) || n);
  return i && n && ei(e, s, n), n;
};
const si = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, ii = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Whether a note already sounding can be retriggered, or only one in its release.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, ni = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], Ae = { duration: { enable_millisecond: !0 } }, ri = { number: { min: 0.1, step: 0.1, mode: "box" } }, oi = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((t) => ({ value: String(t), label: String(t) }))
  }
}, ai = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, li = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
};
let G = class extends g {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (t) => si[t.name] ?? t.name, this.computeHelper = (t) => ii[t.name] ?? "";
  }
  schemaFor(t) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: t.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: ri },
      { name: "precision", selector: oi },
      { name: "unavailable", selector: li },
      { name: "retrigger", selector: ai },
      { name: "debounce", selector: Ae },
      { name: "safety_refresh", selector: Ae },
      { name: "min_wake_interval", selector: Ae }
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
      debounce: M(i.debounce) ?? s.debounce,
      safety_refresh: M(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: M(i.min_wake_interval) ?? s.min_wake_interval
    }, o = ni.find((a) => r[a] !== s[a]);
    o !== void 0 && this.emitChange(N(e, ["defaults"], r), `defaults:${o}`);
  }
  emitChange(t, e) {
    this.dispatchEvent(se(t, e));
  }
  render() {
    const t = this.config;
    if (!t) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const e = t.defaults, s = $e(this.errors, ["defaults"]), i = this.errors.filter((r) => r.path === "defaults"), n = {
      envelope: e.envelope,
      max_value: e.max_value,
      precision: String(e.precision),
      unavailable: e.unavailable,
      retrigger: e.retrigger,
      debounce: T(e.debounce),
      safety_refresh: T(e.safety_refresh),
      min_wake_interval: T(e.min_wake_interval)
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
G.styles = [
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
be([
  u({ attribute: !1 })
], G.prototype, "hass", 2);
be([
  u({ attribute: !1 })
], G.prototype, "config", 2);
be([
  u({ attribute: !1 })
], G.prototype, "errors", 2);
G = be([
  P("al-defaults")
], G);
