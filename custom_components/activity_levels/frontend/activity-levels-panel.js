const Me = globalThis, pt = Me.ShadowRoot && (Me.ShadyCSS === void 0 || Me.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ft = /* @__PURE__ */ Symbol(), St = /* @__PURE__ */ new WeakMap();
let es = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== ft) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (pt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = St.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && St.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const zs = (e) => new es(typeof e == "string" ? e : e + "", void 0, ft), x = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, n, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + e[r + 1], e[0]);
  return new es(s, e, ft);
}, js = (e, t) => {
  if (pt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), n = Me.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = s.cssText, e.appendChild(i);
  }
}, Et = pt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return zs(s);
})(e) : e;
const { is: Gs, defineProperty: Bs, getOwnPropertyDescriptor: Vs, getOwnPropertyNames: qs, getOwnPropertySymbols: Ws, getPrototypeOf: Ks } = Object, qe = globalThis, kt = qe.trustedTypes, Xs = kt ? kt.emptyScript : "", Ys = qe.reactiveElementPolyfillSupport, $e = (e, t) => e, De = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Xs : null;
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
} }, mt = (e, t) => !Gs(e, t), At = { attribute: !0, type: String, converter: De, reflect: !1, useDefault: !1, hasChanged: mt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), qe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let le = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = At) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(t, i, s);
      n !== void 0 && Bs(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: n, set: r } = Vs(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? At;
  }
  static _$Ei() {
    if (this.hasOwnProperty($e("elementProperties"))) return;
    const t = Ks(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty($e("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty($e("properties"))) {
      const s = this.properties, i = [...qs(s), ...Ws(s)];
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
      for (const n of i) s.unshift(Et(n));
    } else t !== void 0 && s.push(Et(t));
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
    return js(t, this.constructor.elementStyles), t;
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
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : De).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : De;
      this._$Em = n;
      const a = o.fromAttribute(s, r.type);
      this[n] = a ?? this._$Ej?.get(n) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, n = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (n === !1 && (r = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? mt)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
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
le.elementStyles = [], le.shadowRootOptions = { mode: "open" }, le[$e("elementProperties")] = /* @__PURE__ */ new Map(), le[$e("finalized")] = /* @__PURE__ */ new Map(), Ys?.({ ReactiveElement: le }), (qe.reactiveElementVersions ??= []).push("2.1.2");
const gt = globalThis, Ct = (e) => e, Ne = gt.trustedTypes, Pt = Ne ? Ne.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ts = "$lit$", B = `lit$${Math.random().toFixed(9).slice(2)}$`, ss = "?" + B, Zs = `<${ss}>`, Q = document, xe = () => Q.createComment(""), we = (e) => e === null || typeof e != "object" && typeof e != "function", vt = Array.isArray, Js = (e) => vt(e) || typeof e?.[Symbol.iterator] == "function", Qe = `[ 	
\f\r]`, ve = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ot = /-->/g, Lt = />/g, K = RegExp(`>|${Qe}(?:([^\\s"'>=/]+)(${Qe}*=${Qe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Tt = /'/g, Mt = /"/g, is = /^(?:script|style|textarea|title)$/i, ns = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), c = ns(1), A = ns(2), ee = /* @__PURE__ */ Symbol.for("lit-noChange"), u = /* @__PURE__ */ Symbol.for("lit-nothing"), Rt = /* @__PURE__ */ new WeakMap(), X = Q.createTreeWalker(Q, 129);
function rs(e, t) {
  if (!vt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Pt !== void 0 ? Pt.createHTML(t) : t;
}
const Qs = (e, t) => {
  const s = e.length - 1, i = [];
  let n, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ve;
  for (let a = 0; a < s; a++) {
    const l = e[a];
    let d, p, f = -1, k = 0;
    for (; k < l.length && (o.lastIndex = k, p = o.exec(l), p !== null); ) k = o.lastIndex, o === ve ? p[1] === "!--" ? o = Ot : p[1] !== void 0 ? o = Lt : p[2] !== void 0 ? (is.test(p[2]) && (n = RegExp("</" + p[2], "g")), o = K) : p[3] !== void 0 && (o = K) : o === K ? p[0] === ">" ? (o = n ?? ve, f = -1) : p[1] === void 0 ? f = -2 : (f = o.lastIndex - p[2].length, d = p[1], o = p[3] === void 0 ? K : p[3] === '"' ? Mt : Tt) : o === Mt || o === Tt ? o = K : o === Ot || o === Lt ? o = ve : (o = K, n = void 0);
    const R = o === K && e[a + 1].startsWith("/>") ? " " : "";
    r += o === ve ? l + Zs : f >= 0 ? (i.push(d), l.slice(0, f) + ts + l.slice(f) + B + R) : l + B + (f === -2 ? a : R);
  }
  return [rs(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class _e {
  constructor({ strings: t, _$litType$: s }, i) {
    let n;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, l = this.parts, [d, p] = Qs(t, s);
    if (this.el = _e.createElement(d, i), X.currentNode = this.el.content, s === 2 || s === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (n = X.nextNode()) !== null && l.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const f of n.getAttributeNames()) if (f.endsWith(ts)) {
          const k = p[o++], R = n.getAttribute(f).split(B), oe = /([.?@])?(.*)/.exec(k);
          l.push({ type: 1, index: r, name: oe[2], strings: R, ctor: oe[1] === "." ? ti : oe[1] === "?" ? si : oe[1] === "@" ? ii : We }), n.removeAttribute(f);
        } else f.startsWith(B) && (l.push({ type: 6, index: r }), n.removeAttribute(f));
        if (is.test(n.tagName)) {
          const f = n.textContent.split(B), k = f.length - 1;
          if (k > 0) {
            n.textContent = Ne ? Ne.emptyScript : "";
            for (let R = 0; R < k; R++) n.append(f[R], xe()), X.nextNode(), l.push({ type: 2, index: ++r });
            n.append(f[k], xe());
          }
        }
      } else if (n.nodeType === 8) if (n.data === ss) l.push({ type: 2, index: r });
      else {
        let f = -1;
        for (; (f = n.data.indexOf(B, f + 1)) !== -1; ) l.push({ type: 7, index: r }), f += B.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const i = Q.createElement("template");
    return i.innerHTML = t, i;
  }
}
function de(e, t, s = e, i) {
  if (t === ee) return t;
  let n = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = we(t) ? void 0 : t._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(e), n._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = n : s._$Cl = n), n !== void 0 && (t = de(e, n._$AS(e, t.values), n, i)), t;
}
class ei {
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
    const { el: { content: s }, parts: i } = this._$AD, n = (t?.creationScope ?? Q).importNode(s, !0);
    X.currentNode = n;
    let r = X.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let d;
        l.type === 2 ? d = new ke(r, r.nextSibling, this, t) : l.type === 1 ? d = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (d = new ni(r, this, t)), this._$AV.push(d), l = i[++a];
      }
      o !== l?.index && (r = X.nextNode(), o++);
    }
    return X.currentNode = Q, n;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class ke {
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
    t = de(this, t, s), we(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== ee && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Js(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && we(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Q.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = _e.createElement(rs(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(s);
    else {
      const r = new ei(n, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = Rt.get(t.strings);
    return s === void 0 && Rt.set(t.strings, s = new _e(t)), s;
  }
  k(t) {
    vt(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, n = 0;
    for (const r of t) n === s.length ? s.push(i = new ke(this.O(xe()), this.O(xe()), this, this.options)) : i = s[n], i._$AI(r), n++;
    n < s.length && (this._$AR(i && i._$AB.nextSibling, n), s.length = n);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = Ct(t).nextSibling;
      Ct(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class We {
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
    if (r === void 0) t = de(this, t, s, 0), o = !we(t) || t !== this._$AH && t !== ee, o && (this._$AH = t);
    else {
      const a = t;
      let l, d;
      for (t = r[0], l = 0; l < r.length - 1; l++) d = de(this, a[i + l], s, l), d === ee && (d = this._$AH[l]), o ||= !we(d) || d !== this._$AH[l], d === u ? t = u : t !== u && (t += (d ?? "") + r[l + 1]), this._$AH[l] = d;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ti extends We {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class si extends We {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class ii extends We {
  constructor(t, s, i, n, r) {
    super(t, s, i, n, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = de(this, t, s, 0) ?? u) === ee) return;
    const i = this._$AH, n = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== u && (i === u || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class ni {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    de(this, t);
  }
}
const ri = gt.litHtmlPolyfillSupport;
ri?.(_e, ke), (gt.litHtmlVersions ??= []).push("3.3.3");
const oi = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = n = new ke(t.insertBefore(xe(), r), r, void 0, s ?? {});
  }
  return n._$AI(e), n;
};
const bt = globalThis;
let v = class extends le {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = oi(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return ee;
  }
};
v._$litElement$ = !0, v.finalized = !0, bt.litElementHydrateSupport?.({ LitElement: v });
const ai = bt.litElementPolyfillSupport;
ai?.({ LitElement: v });
(bt.litElementVersions ??= []).push("4.2.2");
const w = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
const li = { attribute: !0, type: String, converter: De, reflect: !1, hasChanged: mt }, ci = (e = li, t, s) => {
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
  return (t, s) => typeof s == "object" ? ci(e, t, s) : ((i, n, r) => {
    const o = n.hasOwnProperty(r);
    return n.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(n, r) : void 0;
  })(e, t, s);
}
function b(e) {
  return h({ ...e, state: !0, attribute: !1 });
}
const os = (e) => ({ ok: e.ok, errors: e.errors ?? [] }), hi = (e) => e.callWS({ type: "activity_levels/config/get" }).then((t) => t.config), di = (e, t) => e.callWS({ type: "activity_levels/config/validate", config: t }).then(os);
async function ui(e, t) {
  try {
    return os(await e.callWS({ type: "activity_levels/config/save", config: t }));
  } catch (s) {
    return { ok: !1, errors: [{ path: "", message: s.message ?? String(s) }] };
  }
}
const pi = (e) => e.callWS({ type: "activity_levels/state" }), fi = (e, t) => e.callWS({ type: "activity_levels/timeseries", ...t }), et = [
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
], mi = 2500, gi = 8e3;
function vi(e) {
  let t;
  return { promise: new Promise((i) => {
    t = setTimeout(i, e);
  }), cancel: () => clearTimeout(t) };
}
async function It(e, t, s) {
  const i = vi(t);
  try {
    return await Promise.race([e, i.promise.then(() => s)]);
  } finally {
    i.cancel();
  }
}
async function bi() {
  try {
    await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor?.getConfigElement?.();
  } catch {
  }
}
async function $i(e = gi, t = mi) {
  if (et.every((n) => customElements.get(n))) return { ok: !0, missing: [] };
  await It(bi(), t, void 0);
  const s = await Promise.all(
    et.map(
      (n) => It(
        customElements.whenDefined(n).then(() => !0),
        e,
        !1
      )
    )
  ), i = et.filter((n, r) => !s[r]);
  return { ok: i.length === 0, missing: [...i] };
}
async function yi(e, t) {
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
function Ae(e, t) {
  let s = e;
  for (const i of t) {
    if (s == null) return;
    s = s[i];
  }
  return s;
}
function Dt(e) {
  return Array.isArray(e) ? [...e] : { ...e };
}
function Ke(e, t, s) {
  if (t.length === 0) throw new Error("empty path");
  const i = Dt(e);
  let n = i;
  for (let r = 0; r < t.length - 1; r++) {
    const o = t[r], a = Dt(n[o]);
    n[o] = a, n = a;
  }
  return s(n, t[t.length - 1]), i;
}
function S(e, t, s) {
  return Ke(e, t, (i, n) => {
    i[n] = s;
  });
}
function $t(e, t) {
  return Ke(e, t, (s, i) => {
    Array.isArray(s) ? s.splice(i, 1) : delete s[i];
  });
}
function dt(e, t, s, i) {
  return Ke(e, [...t, s], (n) => {
    n.splice(s, 0, i);
  });
}
function xi(e, t, s, i) {
  return Ke(e, [...t, s], (n) => {
    const r = n, [o] = r.splice(s, 1);
    r.splice(i, 0, o);
  });
}
const wi = 1e3;
class _i {
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
    s !== void 0 && s === this.coalesceKey && i - this.coalesceAt < wi || this.past.push(this.config), this.future = [], this.config = t, this.coalesceKey = s ?? null, this.coalesceAt = i;
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
const M = x`
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
var Si = Object.defineProperty, Ei = Object.getOwnPropertyDescriptor, E = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ei(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Si(t, s, n), n;
};
const be = ["groups", "envelopes", "defaults"], ki = 2e3, Ai = 1500;
let y = class extends v {
  constructor() {
    super(...arguments), this.narrow = !1, this.tab = "groups", this.selection = null, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.tabFocus = 0, this.onVisibilityChange = () => this.updateLivePolling(), this.onChange = (e) => {
      e.structural && (this.errors = []), this.setConfig(e.detail, e.coalesceKey);
    }, this.onTabsKeydown = (e) => {
      const t = be.length - 1;
      switch (e.key) {
        case "ArrowRight":
          this.focusTab((this.tabFocus + 1) % be.length);
          break;
        case "ArrowLeft":
          this.focusTab((this.tabFocus + t) % be.length);
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
    const { ok: e, missing: t } = await $i();
    this.missing = e ? [] : t, await this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.stopLive();
  }
  async load() {
    try {
      const e = await hi(this.hass);
      this.draft = new _i(e), this.syncSelection(), this.errors = [], this.banner = null;
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
    !e || !this.selection || Ae(e, this.selection) === void 0 && (this.selection = null);
  }
  async save() {
    const e = this.draft;
    if (e) {
      this.busy = !0, this.updateLivePolling();
      try {
        const t = await yi(e.config, {
          validate: (s) => di(this.hass, s),
          save: (s) => ui(this.hass, s)
        });
        t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((s) => setTimeout(s, Ai)), await this.load());
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
    }, ki));
  }
  async pollLive() {
    try {
      this.live = await pi(this.hass);
    } catch {
    }
  }
  clearLiveTimer() {
    this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
  }
  selectTab(e) {
    const t = be[e];
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
          ${be.map(
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
y.styles = [M];
E([
  h({ attribute: !1 })
], y.prototype, "hass", 2);
E([
  h({ type: Boolean })
], y.prototype, "narrow", 2);
E([
  b()
], y.prototype, "draft", 2);
E([
  b()
], y.prototype, "tab", 2);
E([
  b()
], y.prototype, "selection", 2);
E([
  b()
], y.prototype, "errors", 2);
E([
  b()
], y.prototype, "banner", 2);
E([
  b()
], y.prototype, "live", 2);
E([
  b()
], y.prototype, "liveOn", 2);
E([
  b()
], y.prototype, "busy", 2);
E([
  b()
], y.prototype, "missing", 2);
E([
  b()
], y.prototype, "tabFocus", 2);
y = E([
  w("activity-levels-panel")
], y);
function Y(e) {
  const t = Math.floor(e / 3600), s = Math.floor((e - t * 3600) / 60), i = Math.round((e - t * 3600 - s * 60) * 1e3) / 1e3, n = Math.floor(i), r = Math.round((i - n) * 1e3);
  return r === 0 ? { hours: t, minutes: s, seconds: n } : { hours: t, minutes: s, seconds: n, milliseconds: r };
}
function Z(e) {
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
function ue(e, t) {
  const s = m(t), i = {};
  for (const n of e) {
    if (!n.path.startsWith(s + "/")) continue;
    const r = n.path.slice(s.length + 1);
    r.includes("/") || (i[r] = n.message);
  }
  return i;
}
function Ue(e, t) {
  const s = m(t);
  return e.filter((i) => i.path === s || i.path.startsWith(s + "/")).length;
}
function ie(e, t, s) {
  const i = new CustomEvent("al-change", {
    detail: e,
    bubbles: !0,
    composed: !0
  });
  return t !== void 0 && (i.coalesceKey = t), s && (i.structural = !0), i;
}
const as = (e) => new CustomEvent("al-select", { detail: e, bubbles: !0, composed: !0 }), me = (e, t) => new CustomEvent(e, { detail: t, bubbles: !0, composed: !0 }), Ci = () => me("al-select-strip", null), Pi = () => me("al-open-strip", null), Oi = (e) => me("al-gain-changed", e), Li = (e) => me("al-mix-changed", { mix: e }), Ti = (e) => me("al-limiter-changed", { value: e }), Mi = (e) => me("al-sim-toggled", { on: e }), tt = (e) => new CustomEvent("al-nav", { detail: e, bubbles: !0, composed: !0 }), Ri = (e) => new CustomEvent("al-timeline-range", { detail: e, bubbles: !0, composed: !0 }), ls = (e, t) => new CustomEvent("al-sim-toggle", { detail: { gid: e, on: t }, bubbles: !0, composed: !0 }), Ii = () => new CustomEvent("al-rebuild", { detail: null, bubbles: !0, composed: !0 }), Di = (e) => ({
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
}), Ni = (e) => ({
  id: e,
  attack: 0,
  decay: 0,
  sustain: 1,
  release: 1800,
  impulse: !1,
  retrigger: null,
  unavailable: null,
  debounce: null
}), Ui = (e) => ({
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
function Hi(e) {
  const t = /* @__PURE__ */ new Set(), s = (i) => {
    t.add(i.id), i.children.forEach(s);
  };
  return e.groups.forEach(s), t;
}
function Fi(e) {
  return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
const zi = (e) => new Set(e.envelopes.map((t) => t.id));
function cs(e, t) {
  const s = Fi(t);
  if (!e.has(s)) return s;
  let i = 2;
  for (; e.has(`${s}_${i}`); ) i++;
  return `${s}_${i}`;
}
const ji = (e, t) => cs(Hi(e), t), Gi = (e, t) => cs(zi(e), t);
function Bi(e, t) {
  const s = [], i = (n) => {
    n.stimuli.some((r) => r.envelope === t) && s.push(n.id), n.children.forEach(i);
  };
  return e.groups.forEach(i), { defaults: e.defaults.envelope === t, groups: s };
}
function Vi(e, t, s) {
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
const U = (e, t) => Ae(e, t), J = (e, t) => Ae(e, t), qi = (e) => e.slice(0, -1), Xe = (e) => e.slice(0, -2), hs = (e, t) => e.envelopes.find((s) => s.id === (t ?? e.defaults.envelope));
function He(e, t) {
  const s = hs(e, t.envelope), i = e.defaults, n = (r, o, a) => r ?? o ?? a;
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
var Wi = Object.defineProperty, Ki = Object.getOwnPropertyDescriptor, ge = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Ki(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Wi(t, s, n), n;
};
const Nt = (e) => e.stopPropagation(), Xi = (e) => {
  (e.key === "Enter" || e.key === " ") && e.stopPropagation();
};
let V = class extends v {
  constructor() {
    super(...arguments), this.selection = null, this.errors = [], this.live = null;
  }
  /** Every edit the tree makes is structural: it adds, removes or reorders a node. */
  emitChange(e) {
    this.dispatchEvent(ie(e, void 0, !0));
  }
  emitSelect(e) {
    this.dispatchEvent(as(e));
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
    s && (this.emitChange(dt(s, e, t, Di(ji(s, "new_group")))), this.emitSelect([...e, t]));
  }
  addStimulus(e, t) {
    const s = this.config;
    if (!s) return;
    const i = [...e, "stimuli"];
    this.emitChange(dt(s, i, t, Ui(""))), this.emitSelect([...i, t]);
  }
  move(e, t) {
    const s = this.config;
    if (!s) return;
    const i = qi(e), n = e[e.length - 1], r = n + t;
    this.emitChange(xi(s, i, n, r));
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
    this.emitChange($t(s, e));
    const i = Xe(e);
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
    const o = Ue(this.errors, s), a = this.live?.groups[t.id], l = a?.max_value ?? t.max_value ?? e.defaults.max_value, d = a ? Math.max(0, Math.min(100, a.value / (l || 1) * 100)) : 0;
    return c`
      <ha-expansion-panel outlined left-chevron ?expanded=${i < 2}>
        <div slot="header" class="header ${this.isSelected(s) ? "selected" : ""}">
          <button
            type="button"
            class="link name grow"
            title="Edit this group"
            @click=${(p) => this.select(p, s)}
            @keydown=${Xi}
          >
            ${t.name || t.id || "(unnamed group)"}
          </button>
          ${o ? c`<span class="badge" title="${o} problem(s) in this group">${o}</span>` : u}
          ${a ? c`<div class="meter" title=${this.meterTitle(a, l, i === 0)}>
                  <div style="width: ${d}%"></div>
                </div>
                <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : u}
        </div>
        <div slot="icons" class="row" @click=${Nt}>
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
          ${t.stimuli.length === 0 ? c`<div class="muted empty">
                No stimuli yet — use the + button above to point this group at an entity.
              </div>` : u}
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
    const r = this.hass?.states[e.entity], o = r?.attributes.friendly_name ?? (e.entity || "(no entity)"), a = Ue(this.errors, t), l = this.live?.voices[n]?.find((d) => d.label === (e.key ?? e.entity));
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
        <div class="row" @click=${Nt}>
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
  M,
  x`
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
ge([
  h({ attribute: !1 })
], V.prototype, "hass", 2);
ge([
  h({ attribute: !1 })
], V.prototype, "config", 2);
ge([
  h({ attribute: !1 })
], V.prototype, "selection", 2);
ge([
  h({ attribute: !1 })
], V.prototype, "errors", 2);
ge([
  h({ attribute: !1 })
], V.prototype, "live", 2);
V = ge([
  w("al-tree")
], V);
const ds = (e) => e.split(",").map((t) => t.trim()).filter((t) => t.length > 0), Se = (e) => (e ?? []).join(", "), Fe = (e) => e == null || e === "" ? null : e;
function Yi(e, t) {
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
function Zi(e, t) {
  if (t == null || t === "") return null;
  switch (e) {
    case "duration":
      return Z(t);
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
function Ji(e, t) {
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
const Qi = {
  id: "ID",
  name: "Name",
  area: "Area",
  mix: "Mix",
  null_handling: "Idle contributors",
  gain: "Gain"
}, en = {
  id: "Identifies the group and its entities.",
  name: "Friendly name; falls back to the id.",
  area: "Area the group's entities are assigned to.",
  mix: "How stimuli and child groups combine into this group's value.",
  null_handling: "Whether idle contributors count as zero or drop out of the mean.",
  gain: "Scales this group's contribution to its parent."
}, us = (e) => Qi[e.name] ?? e.name, ps = (e) => en[e.name] ?? "", tn = ["id", "name", "area", "mix", "null_handling", "gain"], sn = [
  { value: "sum", label: "Sum (mixer)" },
  { value: "max", label: "Max (loudest)" },
  { value: "mean", label: "Mean" }
], nn = [
  { value: "zero", label: "Idle counts as 0" },
  { value: "ignore", label: "Ignore idle" }
], fs = { number: { min: 0.1, step: 0.1, mode: "box" } }, ms = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, rn = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, gs = (e, t, s) => e === "null_handling" ? t.mix === "mean" : e === "gain" ? !s : !0;
function vs(e, t, s) {
  const i = {
    id: { text: {} },
    name: { text: {} },
    area: { area: {} },
    mix: { select: { mode: "dropdown", options: sn } },
    null_handling: { select: { mode: "dropdown", options: nn } },
    gain: rn
  };
  return s.filter((n) => gs(n, e, t)).map((n) => ({ name: n, selector: i[n] }));
}
function bs(e, t, s) {
  const i = {
    id: e.id,
    name: e.name ?? "",
    area: e.area,
    mix: e.mix,
    null_handling: e.null_handling,
    gain: e.gain
  };
  return Object.fromEntries(
    s.filter((n) => gs(n, e, t) && !(n === "area" && e.area === null)).map((n) => [n, i[n]])
  );
}
function $s(e, t) {
  const s = { ...e };
  return "id" in t && (s.id = String(t.id ?? "")), "name" in t && (s.name = Fe(t.name)), "area" in t && (s.area = Fe(t.area)), "mix" in t && (s.mix = t.mix ?? e.mix), "null_handling" in t && (s.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), s;
}
const ys = (e, t) => tn.find((s) => e[s] !== t[s]);
var on = Object.defineProperty, an = Object.getOwnPropertyDescriptor, z = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? an(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && on(t, s, n), n;
};
const yt = {
  select: {
    mode: "dropdown",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  }
};
function ln(e, t) {
  return e.select?.options?.find((i) => i.value === t)?.label;
}
let L = class extends v {
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
    e.stopPropagation(), this.emit(Zi(this.kind, e.detail?.value));
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
      const t = ln(this.selector, String(e));
      if (t !== void 0) return t;
    }
    return Ji(this.kind, e);
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
          .selector=${this.kind === "boolean" ? yt : this.selector}
          .label=${this.label}
          .required=${!1}
          .value=${Yi(this.kind, this.value)}
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
L.styles = [
  M,
  x`
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
], L.prototype, "hass", 2);
z([
  h()
], L.prototype, "label", 2);
z([
  h({ attribute: !1 })
], L.prototype, "selector", 2);
z([
  h({ attribute: !1 })
], L.prototype, "value", 2);
z([
  h({ attribute: !1 })
], L.prototype, "inherited", 2);
z([
  h({ attribute: "inherited-from" })
], L.prototype, "inheritedFrom", 2);
z([
  h()
], L.prototype, "kind", 2);
z([
  h()
], L.prototype, "error", 2);
L = z([
  w("al-override-field")
], L);
var cn = Object.defineProperty, hn = Object.getOwnPropertyDescriptor, Ce = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? hn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && cn(t, s, n), n;
};
const Ut = ["id", "name", "area", "mix", "null_handling", "gain"];
let te = class extends v {
  constructor() {
    super(...arguments), this.path = null, this.errors = [];
  }
  emitChange(e, t) {
    this.dispatchEvent(ie(e, t));
  }
  emitSelect(e) {
    this.dispatchEvent(as(e));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = U(t, s);
    if (!i) return;
    const n = $s(i, e.detail?.value ?? {}), r = ys(n, i);
    r !== void 0 && this.emitChange(S(t, s, n), `${m(s)}:${r}`);
  }
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(S(s, [...i, e], t), `${m(i)}:${e}`);
  }
  onDelete() {
    const { config: e, path: t } = this;
    if (!e || !t) return;
    const s = U(e, t);
    if (!s || !window.confirm(`Delete group "${s.name || s.id}" and everything in it?`)) return;
    this.emitChange($t(e, t));
    const i = Xe(t);
    this.emitSelect(i.length ? i : null);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length === 0)
      return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
    const s = U(e, t);
    if (!s) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
    const i = t.length === 2, n = ue(this.errors, t), r = this.errors.filter((o) => o.path === m(t));
    return c`
      <ha-card header="Group">
        ${r.map((o) => c`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${bs(s, i, Ut)}
          .schema=${vs(s, i, Ut)}
          .error=${n}
          .computeLabel=${us}
          .computeHelper=${ps}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="muted note">Changing the id re-creates this group's entities.</div>

        <h3>Output</h3>
        <al-override-field
          .hass=${this.hass}
          label="Max value"
          kind="number"
          .selector=${fs}
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
          .selector=${ms}
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
te.styles = [
  M,
  x`
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
Ce([
  h({ attribute: !1 })
], te.prototype, "hass", 2);
Ce([
  h({ attribute: !1 })
], te.prototype, "config", 2);
Ce([
  h({ attribute: !1 })
], te.prototype, "path", 2);
Ce([
  h({ attribute: !1 })
], te.prototype, "errors", 2);
te = Ce([
  w("al-group-editor")
], te);
const dn = {
  entity: "Entity",
  to: "Active states",
  gain: "Gain",
  key: "Label",
  envelope: "Envelope preset"
}, un = {
  entity: "The entity whose state drives this stimulus.",
  to: "Comma-separated states that trigger the envelope, e.g. on, playing.",
  gain: "How loudly this stimulus contributes to its group.",
  key: "Optional name for this voice; defaults to the entity id.",
  envelope: "Preset the overrides below start from."
}, xs = (e) => dn[e.name] ?? e.name, ws = (e) => un[e.name] ?? "", pn = ["entity", "gain", "key", "envelope"], Te = { duration: { enable_millisecond: !0 } }, fn = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, mn = { number: { min: 0.1, max: 10, step: 0.1, mode: "slider" } }, gn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, vn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, bn = "(unknown preset — using built-in defaults)", _s = [
  { name: "attack", label: "Attack", kind: "duration", selector: Te },
  { name: "decay", label: "Decay", kind: "duration", selector: Te },
  { name: "sustain", label: "Sustain", kind: "number", selector: fn },
  { name: "release", label: "Release", kind: "duration", selector: Te },
  { name: "impulse", label: "Impulse", kind: "boolean", selector: yt },
  { name: "retrigger", label: "Retrigger", kind: "select", selector: gn },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: vn },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Te }
], $n = (e) => [
  { value: "", label: "(default preset)" },
  ...e.envelopes.map((t) => ({ value: t.id, label: t.id }))
];
function Ss(e, t) {
  const s = {
    entity: { entity: {} },
    to: { text: {} },
    gain: mn,
    key: { text: {} },
    envelope: { select: { mode: "dropdown", options: $n(e) } }
  };
  return t.map((i) => ({ name: i, selector: s[i] }));
}
function Es(e, t, s) {
  const i = {
    entity: e.entity,
    to: t ?? Se(e.to),
    gain: e.gain,
    key: e.key ?? "",
    envelope: e.envelope ?? ""
  };
  return Object.fromEntries(s.map((n) => [n, i[n]]));
}
function ks(e, t) {
  const s = { ...e };
  return "entity" in t && (s.entity = String(t.entity ?? "")), "to" in t && (s.to = ds(String(t.to ?? ""))), "gain" in t && (s.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (s.key = Fe(t.key)), "envelope" in t && (s.envelope = Fe(t.envelope)), s;
}
function As(e, t) {
  return Se(e.to) !== Se(t.to) ? "to" : pn.find((s) => e[s] !== t[s]);
}
const Cs = (e, t) => Se(e) === Se(ds(t));
function Ps(e, t, s) {
  const i = hs(e, t.envelope);
  return i ? i[s] === null || i[s] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : bn;
}
function Os(e, t) {
  return t == null || e === void 0 ? null : O(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
function Ls(e, t = 0.25) {
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
const yn = (e) => Math.round(e * 100) / 100;
function xn(e, t = 0.25) {
  const s = Ls(e, t), i = (r) => ((s[r]?.x ?? 0) + (s[r + 1]?.x ?? 0)) / 2;
  if (e.impulse) {
    const r = [{ text: "impulse", x: 0 }];
    return e.release > 0 && r.push({ text: `R ${O(e.release)}`, x: i(1) }), r;
  }
  const n = [];
  return e.attack > 0 && n.push({ text: `A ${O(e.attack)}`, x: i(0) }), e.decay > 0 && n.push({ text: `D ${O(e.decay)}`, x: i(1) }), n.push({ text: `S ${yn(e.sustain)}`, x: i(2) }), e.release > 0 && n.push({ text: `R ${O(e.release)}`, x: i(3) }), n;
}
var wn = Object.defineProperty, _n = Object.getOwnPropertyDescriptor, Ts = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? _n(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && wn(t, s, n), n;
};
const Ee = 10, ze = 190, Sn = 10, he = 58, En = 72, Re = (e) => Ee + e * (ze - Ee), st = (e) => he - e * (he - Sn), ye = (e) => String(Math.round(e * 10) / 10), it = (e, t) => `${ye(e)},${ye(t)}`, kn = (e) => Math.min(ze - 6, Math.max(Ee + 6, Re(e)));
let je = class extends v {
  constructor() {
    super(...arguments), this.envelope = null;
  }
  render() {
    const e = this.envelope;
    if (!e) return u;
    const t = Ls(e), s = t[0], i = t[t.length - 1], n = t.map((l) => it(Re(l.x), st(l.y))).join(" "), r = `${it(Re(s.x), he)} ${n} ${it(Re(i.x), he)}`, o = xn(e), a = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
    return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${a}>
        <title>${a}</title>
        <line class="grid" x1=${Ee} y1=${he} x2=${ze} y2=${he}></line>
        ${e.impulse ? u : A`<line
              class="grid"
              x1=${Ee}
              y1=${ye(st(e.sustain))}
              x2=${ze}
              y2=${ye(st(e.sustain))}
            ></line>`}
        <polygon class="area" points=${r}></polygon>
        <polyline class="curve" points=${n}></polyline>
        ${o.map(
      (l) => A`<text class="caption" x=${ye(kn(l.x))} y=${En} text-anchor="middle">${l.text}</text>`
    )}
      </svg>
    `;
  }
};
je.styles = [
  M,
  x`
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
Ts([
  h({ attribute: !1 })
], je.prototype, "envelope", 2);
je = Ts([
  w("al-envelope-sketch")
], je);
var An = Object.defineProperty, Cn = Object.getOwnPropertyDescriptor, ne = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Cn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && An(t, s, n), n;
};
const Ht = ["entity", "to", "gain", "key", "envelope"];
let H = class extends v {
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
    i && (Cs(i.to, this.toText) || (this.toText = null));
  }
  emitChange(e, t) {
    this.dispatchEvent(ie(e, t));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = J(t, s);
    if (!i) return;
    const n = e.detail?.value ?? {};
    this.toText = String(n.to ?? "");
    const r = ks(i, n), o = As(r, i);
    o !== void 0 && this.emitChange(S(t, s, r), `${m(s)}:${o}`);
  }
  setOverride(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(S(s, [...i, e], t), `${m(i)}:${e}`);
  }
  render() {
    const { config: e, path: t } = this;
    if (!e || !t || t.length < 3)
      return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
    const s = J(e, t);
    if (!s) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
    const i = U(e, Xe(t)), n = ue(this.errors, t), r = this.errors.filter((d) => d.path === m(t)), o = He(e, s), a = this.live?.voices[i?.id ?? ""]?.find(
      (d) => d.label === (s.key ?? s.entity)
    ), l = Os(this.live?.now, a?.phase_ends);
    return c`
      <ha-card header="Stimulus">
        ${r.map((d) => c`<ha-alert alert-type="error">${d.message}</ha-alert>`)}
        <ha-form
          .hass=${this.hass}
          .data=${Es(s, this.toText, Ht)}
          .schema=${Ss(e, Ht)}
          .error=${n}
          .computeLabel=${xs}
          .computeHelper=${ws}
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
        ${_s.map(
      (d) => c`<al-override-field
            .hass=${this.hass}
            .label=${d.label}
            .kind=${d.kind}
            .selector=${d.selector}
            .value=${s[d.name]}
            .inherited=${o[d.name]}
            .inheritedFrom=${Ps(e, s, d.name)}
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
H.styles = [
  M,
  x`
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
ne([
  h({ attribute: !1 })
], H.prototype, "hass", 2);
ne([
  h({ attribute: !1 })
], H.prototype, "config", 2);
ne([
  h({ attribute: !1 })
], H.prototype, "path", 2);
ne([
  h({ attribute: !1 })
], H.prototype, "errors", 2);
ne([
  h({ attribute: !1 })
], H.prototype, "live", 2);
ne([
  b()
], H.prototype, "toText", 2);
H = ne([
  w("al-stimulus-editor")
], H);
var Pn = Object.defineProperty, On = Object.getOwnPropertyDescriptor, re = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? On(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Pn(t, s, n), n;
};
const Ln = {
  id: "ID",
  attack: "Attack",
  decay: "Decay",
  sustain: "Sustain",
  release: "Release",
  impulse: "Impulse"
}, Tn = {
  id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
  attack: "Time to rise from zero to the stimulus gain.",
  decay: "Time to fall from the peak to the sustain level.",
  sustain: "Fraction of peak held while the note is on.",
  release: "Time to fall from the sustain level back to zero.",
  impulse: "Fire and forget: the note ends the moment it starts, leaving only the release."
}, Mn = ["id", "attack", "decay", "sustain", "release", "impulse"], Ie = { duration: { enable_millisecond: !0 } }, Rn = { number: { min: 0, max: 1, step: 0.05, mode: "slider" } }, In = { boolean: {} }, Dn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "only_in_release", label: "Only while releasing" },
      { value: "always", label: "Always" }
    ]
  }
}, Nn = {
  select: {
    mode: "dropdown",
    options: [
      { value: "hold", label: "Hold the last value" },
      { value: "note_off", label: "Release the note" }
    ]
  }
}, Un = [
  { name: "id", selector: { text: {} } },
  { name: "attack", selector: Ie },
  { name: "decay", selector: Ie },
  { name: "sustain", selector: Rn },
  { name: "release", selector: Ie },
  { name: "impulse", selector: In }
], Hn = [
  { name: "retrigger", label: "Retrigger", kind: "select", selector: Dn },
  { name: "unavailable", label: "When unavailable", kind: "select", selector: Nn },
  { name: "debounce", label: "Debounce", kind: "duration", selector: Ie }
];
let F = class extends v {
  constructor() {
    super(...arguments), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.computeLabel = (e) => Ln[e.name] ?? e.name, this.computeHelper = (e) => Tn[e.name] ?? "";
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
    this.dispatchEvent(ie(e, t));
  }
  selectPreset(e) {
    this.selected = e, this.blocked = null;
  }
  addPreset() {
    const e = this.config;
    if (!e) return;
    this.blocked = null;
    const t = e.envelopes.length;
    this.emitChange(dt(e, ["envelopes"], t, Ni(Gi(e, "preset")))), this.selected = t;
  }
  removePreset(e) {
    const t = this.config;
    if (!t) return;
    const s = t.envelopes[e];
    if (!s) return;
    const i = Bi(t, s.id);
    if (i.defaults || i.groups.length > 0) {
      this.selected = e, this.blocked = { id: s.id, ...i };
      return;
    }
    window.confirm(`Delete envelope preset "${s.id}"?`) && (this.blocked = null, this.emitChange($t(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && (this.selected -= 1));
  }
  onFormChanged(e) {
    e.stopPropagation();
    const t = this.config, s = this.selected, i = t?.envelopes[s];
    if (!t || !i) return;
    const n = e.detail?.value ?? {}, r = {
      ...i,
      id: String(n.id ?? ""),
      attack: Z(n.attack) ?? i.attack,
      decay: Z(n.decay) ?? i.decay,
      sustain: typeof n.sustain == "number" ? n.sustain : i.sustain,
      release: Z(n.release) ?? i.release,
      impulse: typeof n.impulse == "boolean" ? n.impulse : i.impulse
    }, o = Mn.find((d) => r[d] !== i[d]);
    if (o === void 0) return;
    const a = ["envelopes", s], l = S(Vi(t, s, r.id), a, r);
    this.emitChange(l, `${m(a)}:${o}`);
  }
  setOverride(e, t) {
    const s = this.config, i = this.selected;
    if (!s || !s.envelopes[i]) return;
    const n = ["envelopes", i, e];
    this.emitChange(S(s, n, t), m(n));
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
      const n = Ue(this.errors, ["envelopes", i]);
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
        ${t ? c`<ha-alert alert-type="warning">${zn(t)}</ha-alert>` : u}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
  }
  renderEditor(e) {
    const t = this.selected, s = e.envelopes[t];
    if (!s) return c`<ha-card><span class="muted">Select a preset.</span></ha-card>`;
    const i = ["envelopes", t], n = ue(this.errors, i), r = this.errors.filter((l) => l.path === m(i)), o = {
      id: s.id,
      attack: Y(s.attack),
      decay: Y(s.decay),
      sustain: s.sustain,
      release: Y(s.release),
      impulse: s.impulse
    }, a = Fn(e, t, s);
    return c`
      <ha-card header="Envelope preset">
        ${r.map((l) => c`<ha-alert alert-type="error">${l.message}</ha-alert>`)}
        ${a ? c`<ha-alert alert-type="warning">${a}</ha-alert>` : u}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Un}
          .error=${n}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Hn.map(
      (l) => c`<al-override-field
            .hass=${this.hass}
            .label=${l.label}
            .kind=${l.kind}
            .selector=${l.kind === "boolean" ? yt : l.selector}
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
F.styles = [
  M,
  x`
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
re([
  h({ attribute: !1 })
], F.prototype, "hass", 2);
re([
  h({ attribute: !1 })
], F.prototype, "config", 2);
re([
  h({ attribute: !1 })
], F.prototype, "errors", 2);
re([
  h({ type: Boolean })
], F.prototype, "narrow", 2);
re([
  b()
], F.prototype, "selected", 2);
re([
  b()
], F.prototype, "blocked", 2);
F = re([
  w("al-envelopes")
], F);
function Fn(e, t, s) {
  return s.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((i, n) => n !== t && i.id === s.id) ? `Another preset already uses the id "${s.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function zn(e) {
  const t = [];
  return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
var jn = Object.defineProperty, Gn = Object.getOwnPropertyDescriptor, Ye = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Gn(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && jn(t, s, n), n;
};
const Bn = {
  envelope: "Default envelope",
  max_value: "Max value",
  precision: "Precision",
  unavailable: "When unavailable",
  retrigger: "Retrigger",
  debounce: "Debounce",
  safety_refresh: "Safety refresh",
  min_wake_interval: "Minimum wake interval"
}, Vn = {
  envelope: "Preset used when a stimulus names none.",
  max_value: "Limiter for groups that don't set their own.",
  precision: "Display decimals.",
  unavailable: "What an entity going unavailable does to its note.",
  retrigger: "Whether a note already sounding can be retriggered, or only one in its release.",
  debounce: "Minimum time between note-ons per stimulus.",
  safety_refresh: "Periodic recompute as a self-heal.",
  min_wake_interval: "Floor for the scheduler's timer delay."
}, qn = [
  "envelope",
  "max_value",
  "precision",
  "unavailable",
  "retrigger",
  "debounce",
  "safety_refresh",
  "min_wake_interval"
], nt = { duration: { enable_millisecond: !0 } }, Wn = { number: { min: 0.1, step: 0.1, mode: "box" } }, Kn = {
  select: {
    mode: "dropdown",
    options: [0, 1, 2, 3].map((e) => ({ value: String(e), label: String(e) }))
  }
}, Xn = {
  select: {
    mode: "dropdown",
    options: [
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
};
let pe = class extends v {
  constructor() {
    super(...arguments), this.errors = [], this.computeLabel = (e) => Bn[e.name] ?? e.name, this.computeHelper = (e) => Vn[e.name] ?? "";
  }
  schemaFor(e) {
    return [
      { name: "envelope", selector: { select: { mode: "dropdown", options: e.envelopes.map((s) => ({ value: s.id, label: s.id })) } } },
      { name: "max_value", selector: Wn },
      { name: "precision", selector: Kn },
      { name: "unavailable", selector: Yn },
      { name: "retrigger", selector: Xn },
      { name: "debounce", selector: nt },
      { name: "safety_refresh", selector: nt },
      { name: "min_wake_interval", selector: nt }
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
      debounce: Z(i.debounce) ?? s.debounce,
      safety_refresh: Z(i.safety_refresh) ?? s.safety_refresh,
      min_wake_interval: Z(i.min_wake_interval) ?? s.min_wake_interval
    }, o = qn.find((a) => r[a] !== s[a]);
    o !== void 0 && this.emitChange(S(t, ["defaults"], r), `defaults:${o}`);
  }
  emitChange(e, t) {
    this.dispatchEvent(ie(e, t));
  }
  render() {
    const e = this.config;
    if (!e) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
    const t = e.defaults, s = ue(this.errors, ["defaults"]), i = this.errors.filter((r) => r.path === "defaults"), n = {
      envelope: t.envelope,
      max_value: t.max_value,
      precision: String(t.precision),
      unavailable: t.unavailable,
      retrigger: t.retrigger,
      debounce: Y(t.debounce),
      safety_refresh: Y(t.safety_refresh),
      min_wake_interval: Y(t.min_wake_interval)
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
pe.styles = [
  M,
  x`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `
];
Ye([
  h({ attribute: !1 })
], pe.prototype, "hass", 2);
Ye([
  h({ attribute: !1 })
], pe.prototype, "config", 2);
Ye([
  h({ attribute: !1 })
], pe.prototype, "errors", 2);
pe = Ye([
  w("al-defaults")
], pe);
const Ge = 0.1, Be = 10, xt = Math.log10(Ge), Zn = Math.log10(Be), Ms = Zn - xt, Ze = (e) => Math.min(Be, Math.max(Ge, e)), wt = (e) => Math.round(e * 100) / 100, Ft = (e) => wt(Ze(e));
function Jn(e) {
  return (Math.log10(Ze(e)) - xt) / Ms;
}
function Qn(e) {
  const t = Math.min(1, Math.max(0, e));
  return wt(Ze(Math.pow(10, xt + t * Ms)));
}
function rt(e, t, s = !1) {
  const i = s ? 1.05 : 1.25;
  return wt(Ze(t === 1 ? e * i : e / i));
}
function zt(e) {
  let t = e.toFixed(2).replace(/0+$/, "");
  return t.endsWith(".") && (t += "0"), t;
}
var er = Object.defineProperty, tr = Object.getOwnPropertyDescriptor, Pe = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? tr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && er(t, s, n), n;
};
const ut = 12, jt = (e) => `${Math.round(e * 1e3) / 10}%`;
let se = class extends v {
  constructor() {
    super(...arguments), this.value = 1, this.disabled = !1, this.label = "Gain", this.dragValue = null, this.dragging = !1, this.onWheel = (e) => {
      this.disabled || e.deltaY === 0 || (e.preventDefault(), this.commit(rt(this.current, e.deltaY < 0 ? 1 : -1, e.shiftKey)));
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
        s = rt(t, 1, e.shiftKey);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        s = rt(t, -1, e.shiftKey);
        break;
      case "Home":
        s = Ge;
        break;
      case "End":
        s = Be;
        break;
      case "PageUp":
        s = Ft(t * 2);
        break;
      case "PageDown":
        s = Ft(t / 2);
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
    const i = Qn(1 - (e.clientY - s.top) / s.height);
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
    const e = this.current, t = Jn(e);
    return c`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${Ge}
        aria-valuemax=${Be}
        aria-valuenow=${e}
        aria-valuetext=${zt(e)}
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
          <div class="fill" style="height: ${jt(t)}"></div>
          <div class="knob" style="bottom: calc(${jt(t)} - ${Math.round((t - 0.5) * ut * 10) / 10}px - ${ut / 2}px)"></div>
        </div>
        <div class="value">${zt(e)}</div>
      </div>
    `;
  }
};
se.styles = x`
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
      height: ${ut}px;
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
Pe([
  h({ type: Number })
], se.prototype, "value", 2);
Pe([
  h({ type: Boolean, reflect: !0 })
], se.prototype, "disabled", 2);
Pe([
  h({ type: String })
], se.prototype, "label", 2);
Pe([
  b()
], se.prototype, "dragValue", 2);
se = Pe([
  w("al-fader")
], se);
const sr = { ATTRIBUTE: 1 }, ir = (e) => (...t) => ({ _$litDirective$: e, values: t });
class nr {
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
const Gt = ir(class extends nr {
  constructor(e) {
    if (super(e), e.type !== sr.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
    return ee;
  }
});
var rr = Object.defineProperty, or = Object.getOwnPropertyDescriptor, Je = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? or(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && rr(t, s, n), n;
};
const ar = (e) => `${Math.round(e * 1e3) / 10}%`;
let fe = class extends v {
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
        <div class=${Gt({ fill: !0, hot: e > 0.9 })} style="width: ${ar(e)}"></div>
      </div>
      <div class=${Gt({ dot: !0, gated: this.gated })}></div>
    `;
  }
};
fe.styles = x`
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
Je([
  h({ type: Number })
], fe.prototype, "value", 2);
Je([
  h({ type: Number })
], fe.prototype, "max", 2);
Je([
  h({ type: Boolean })
], fe.prototype, "gated", 2);
fe = Je([
  w("al-meter")
], fe);
var lr = Object.defineProperty, cr = Object.getOwnPropertyDescriptor, D = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? cr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && lr(t, s, n), n;
};
const hr = (e) => String(Math.round(e * 100) / 100);
function Bt(e) {
  return e.impulse ? `impulse · R ${O(e.release)}` : `A ${O(e.attack)} · D ${O(e.decay)} · S ${hr(e.sustain)} · R ${O(e.release)}`;
}
let C = class extends v {
  constructor() {
    super(...arguments), this.kind = "channel", this.label = "", this.sublabel = null, this.envelope = null, this.gain = 1, this.live = null, this.selected = !1, this.errors = 0, this.entityIcon = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.hasAttribute("tabindex") || (this.tabIndex = -1);
  }
  select() {
    this.dispatchEvent(Ci());
  }
  /** Drilling into a bus is its own intent: it must not also read as selecting the strip. */
  open(e) {
    e.stopPropagation(), this.dispatchEvent(Pi());
  }
  onGain(e) {
    e.stopPropagation(), this.dispatchEvent(Oi(e.detail));
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
        <div class="adsr" title=${e ? Bt(e) : ""}>${e ? Bt(e) : ""}</div>
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
C.styles = x`
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
D([
  h({ type: String, reflect: !0 })
], C.prototype, "kind", 2);
D([
  h({ type: String })
], C.prototype, "label", 2);
D([
  h({ type: String })
], C.prototype, "sublabel", 2);
D([
  h({ attribute: !1 })
], C.prototype, "envelope", 2);
D([
  h({ type: Number })
], C.prototype, "gain", 2);
D([
  h({ attribute: !1 })
], C.prototype, "live", 2);
D([
  h({ type: Boolean, reflect: !0 })
], C.prototype, "selected", 2);
D([
  h({ type: Number })
], C.prototype, "errors", 2);
D([
  h({ type: String })
], C.prototype, "entityIcon", 2);
C = D([
  w("al-strip")
], C);
var dr = Object.defineProperty, ur = Object.getOwnPropertyDescriptor, N = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? ur(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && dr(t, s, n), n;
};
const pr = ["sum", "max", "mean"], Vt = (e) => e.stopPropagation(), qt = 0.1;
let P = class extends v {
  constructor() {
    super(...arguments), this.label = "", this.mix = "sum", this.maxValue = 5, this.precision = 1, this.live = null, this.lights = 0, this.simEntityId = null, this.simOn = !1, this.blockedReason = null;
  }
  onMix(e) {
    this.dispatchEvent(Li(e.target.value));
  }
  /**
   * `min` on a number input is advice to the browser, not a guarantee to us: it does not stop
   * a typed or pasted `0`, and `.value` reads back whatever is in the box. So the floor is
   * enforced here, and a rejected entry — empty, unreadable, or below the floor — puts the
   * committed ceiling back in the box rather than leaving a value we refused on screen.
   */
  onLimiter(e) {
    const t = e.target, s = t.value.trim(), i = Number(s);
    if (s === "" || !Number.isFinite(i) || i < qt) {
      t.value = String(this.maxValue);
      return;
    }
    this.dispatchEvent(Ti(i));
  }
  onSim(e) {
    this.dispatchEvent(Mi(e.target.checked === !0));
  }
  render() {
    const e = this.blockedReason;
    return c`
      <div class="strip">
        <div class="name" title=${this.label}>${this.label}</div>
        <div class="muted">master</div>
        <div>
          <label for="mix">mix</label>
          <select id="mix" class="mix" .value=${this.mix} @change=${this.onMix} @keydown=${Vt}>
            ${pr.map((t) => c`<option value=${t} ?selected=${t === this.mix}>${t}</option>`)}
          </select>
        </div>
        <div>
          <label for="limiter">limiter</label>
          <input
            id="limiter"
            class="limiter"
            type="number"
            min=${qt}
            step="0.1"
            .value=${String(this.maxValue)}
            @change=${this.onLimiter}
            @keydown=${Vt}
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
P.styles = x`
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
N([
  h({ type: String })
], P.prototype, "label", 2);
N([
  h({ type: String })
], P.prototype, "mix", 2);
N([
  h({ type: Number })
], P.prototype, "maxValue", 2);
N([
  h({ type: Number })
], P.prototype, "precision", 2);
N([
  h({ attribute: !1 })
], P.prototype, "live", 2);
N([
  h({ type: Number })
], P.prototype, "lights", 2);
N([
  h({ type: String })
], P.prototype, "simEntityId", 2);
N([
  h({ type: Boolean })
], P.prototype, "simOn", 2);
N([
  h({ type: String })
], P.prototype, "blockedReason", 2);
P = N([
  w("al-master-strip")
], P);
function fr(e, t) {
  const s = Ae(e, t);
  if (!s) return [];
  const i = [];
  return s.stimuli.forEach((n, r) => i.push([...t, "stimuli", r])), s.children.forEach((n, r) => i.push([...t, "children", r])), i;
}
function mr(e, t) {
  const s = [];
  for (let i = 2; i <= t.length; i += 2) {
    const n = t.slice(0, i), r = Ae(e, n);
    if (!r) break;
    s.push({ path: n, label: r.name ?? r.id });
  }
  return s;
}
var gr = Object.defineProperty, vr = Object.getOwnPropertyDescriptor, q = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? vr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && gr(t, s, n), n;
};
const br = (e) => `switch.${e}_presence_simulation`, $r = (e) => {
  const t = e.composedPath()[0];
  return t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t instanceof HTMLTextAreaElement || t instanceof HTMLElement && t.isContentEditable;
}, Wt = (e) => e[e.length - 2] === "children";
let I = class extends v {
  constructor() {
    super(...arguments), this.nav = { busPath: [], selection: null }, this.errors = [], this.live = null, this.simState = {}, this.narrow = !1, this.pendingFocus = !1;
  }
  get bus() {
    return this.config ? U(this.config, this.nav.busPath) : void 0;
  }
  get channels() {
    return this.config ? fr(this.config, this.nav.busPath) : [];
  }
  isSelected(e) {
    return this.nav.selection !== null && m(this.nav.selection) === m(e);
  }
  /** The ceiling a channel's meter is drawn against: the bus it mixes into, not its own. */
  busCeiling(e) {
    return this.live?.groups[e.id]?.max_value ?? e.max_value ?? this.config?.defaults.max_value ?? 5;
  }
  navigate(e) {
    this.pendingFocus = !0, this.dispatchEvent(tt(e));
  }
  emitChange(e, t) {
    this.dispatchEvent(ie(e, t));
  }
  /** Which strip an event came from: strips are identical, so the row index is the key. */
  pathOf(e) {
    const t = e.target?.dataset?.index;
    return t === void 0 ? null : this.channels[Number(t)] ?? null;
  }
  onStripSelect(e) {
    const t = this.pathOf(e);
    t && this.dispatchEvent(tt({ type: "select", path: t }));
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
    this.emitChange(S(s, [...t, "gain"], i), `${m(t)}:gain`);
  }
  onMasterSelect() {
    this.dispatchEvent(tt({ type: "select", path: this.nav.busPath }));
  }
  onMix(e) {
    const t = this.config;
    if (!t) return;
    const { mix: s } = e.detail;
    this.emitChange(S(t, [...this.nav.busPath, "mix"], s));
  }
  onLimiter(e) {
    const t = this.config;
    if (!t) return;
    const { value: s } = e.detail;
    this.emitChange(S(t, [...this.nav.busPath, "max_value"], s), `${m(this.nav.busPath)}:limiter`);
  }
  onSim(e) {
    const t = this.bus;
    if (!t) return;
    const { on: s } = e.detail;
    this.dispatchEvent(ls(t.id, s));
  }
  /** Console keys: ←/→ walk the row, Enter drills into a bus, Backspace comes back up. */
  onKeyDown(e) {
    const t = this.config;
    if (!(!t || $r(e)))
      switch (e.key) {
        case "ArrowRight":
        case "ArrowLeft":
          e.preventDefault(), this.navigate({ type: "arrow", delta: e.key === "ArrowRight" ? 1 : -1, config: t });
          break;
        case "Enter": {
          const s = this.nav.selection;
          if (!s || !Wt(s) || !this.channels.some((i) => m(i) === m(s)))
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
    const t = mr(e, this.nav.busPath);
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
      errors: Ue(this.errors, s),
      tabindex: n ? 0 : -1
    };
    return Wt(s) ? this.renderBusChannel(e, t, s, r) : this.renderStimulusChannel(e, t, s, r);
  }
  renderBusChannel(e, t, s, i) {
    const n = U(e, s);
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
        .envelope=${He(e, {})}
        .gain=${n.gain}
        .live=${o}
        .selected=${i.selected}
        .errors=${i.errors}
      ></al-strip>
    `;
  }
  renderStimulusChannel(e, t, s, i) {
    const n = J(e, s);
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
        .envelope=${He(e, n)}
        .gain=${n.gain}
        .live=${a}
        .selected=${i.selected}
        .errors=${i.errors}
        .entityIcon=${r?.attributes.icon ?? null}
      ></al-strip>
    `;
  }
  renderMaster(e, t) {
    const s = this.live?.groups[t.id], i = s ? { value: s.value, max: s.max_value, gated: s.gated } : null, n = br(t.id), r = this.isSelected(this.nav.busPath);
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
I.styles = [
  M,
  x`
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
q([
  h({ attribute: !1 })
], I.prototype, "hass", 2);
q([
  h({ attribute: !1 })
], I.prototype, "config", 2);
q([
  h({ attribute: !1 })
], I.prototype, "nav", 2);
q([
  h({ attribute: !1 })
], I.prototype, "errors", 2);
q([
  h({ attribute: !1 })
], I.prototype, "live", 2);
q([
  h({ attribute: !1 })
], I.prototype, "simState", 2);
q([
  h({ type: Boolean, reflect: !0 })
], I.prototype, "narrow", 2);
I = q([
  w("al-mixer")
], I);
const yr = {
  "24h": 86400,
  "7d": 7 * 86400,
  "30d": 30 * 86400
}, xr = {
  off: 0,
  "24h": 86400,
  "7d": 7 * 86400
};
function wr(e, t, s) {
  return {
    start: e - yr[t],
    end: e,
    resolution: t === "24h" ? "5m" : "1h",
    forecastUntil: s === "off" ? void 0 : e + xr[s]
  };
}
function _r(e, t, s) {
  const i = t - e || 1;
  return (n) => (n - e) / i * s;
}
function Sr(e, t, s = 4) {
  const i = e || 1, n = t - 2 * s;
  return (r) => t - s - r / i * n;
}
function Ve(e, t) {
  const s = e.length;
  if (s <= t) return e;
  const i = Math.max(1, Math.floor(t / 2)), n = Math.ceil(s / i), r = [];
  for (let o = 0; o < s; o += n) {
    const a = Math.min(o + n, s);
    let l = e[o], d = e[o];
    for (let p = o + 1; p < a; p++) {
      const f = e[p];
      f[1] < l[1] && (l = f), f[1] > d[1] && (d = f);
    }
    l === d ? r.push(l) : l[0] <= d[0] ? r.push(l, d) : r.push(d, l);
  }
  return r[0] !== e[0] && (r[0] = e[0]), r[r.length - 1] !== e[s - 1] && (r[r.length - 1] = e[s - 1]), r;
}
function Kt(e, t, s) {
  return e.length === 0 ? "" : e.map(([i, n], r) => `${r === 0 ? "M" : "L"}${t(i)},${s(n)}`).join(" ");
}
function Er(e, t, s, i = 1 / 0) {
  if (e.p75.length === 0) return "";
  const n = (l) => l.map((d, p) => [e.t0 + p * e.step, d]), r = Ve(n(e.p75), i), o = Ve(n(e.p25), i).reverse();
  return `${[...r, ...o].map(([l, d], p) => `${p === 0 ? "M" : "L"}${t(l)},${s(d)}`).join(" ")} Z`;
}
function kr(e, t) {
  return e[t].map((s, i) => [e.t0 + i * e.step, s]);
}
function ot(e, t, s) {
  return e.map(([i, n, r]) => ({ x0: t(i), x1: t(n ?? s), tag: r }));
}
function Xt(e, t) {
  if (e.length === 0) return -1;
  let s = 0, i = e.length - 1;
  for (; s < i; ) {
    const n = s + i >> 1;
    e[n][0] < t ? s = n + 1 : i = n;
  }
  return s > 0 && Math.abs(e[s - 1][0] - t) <= Math.abs(e[s][0] - t) ? s - 1 : s;
}
function Ar(e) {
  return [e.group_id, e.start, e.end, e.resolution, e.include_children ?? !1, e.forecast_until ?? ""].join("|");
}
var Cr = Object.defineProperty, Pr = Object.getOwnPropertyDescriptor, _ = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Pr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Cr(t, s, n), n;
};
const ce = 32, Or = 28, Lr = 4, Yt = 8, Tr = 800, Mr = 220, Rr = 160, at = 2e3, Ir = 6e4, Rs = 6e4, Dr = 32, Nr = ["24h", "7d", "30d"], Ur = ["off", "24h", "7d"], Zt = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], Hr = (e) => `hsl(${e * 67 % 360} 55% 62%)`, G = /* @__PURE__ */ new Map(), lt = /* @__PURE__ */ new Map();
function Fr(e, t) {
  const s = Date.now();
  for (const [i, n] of G) s - n.at >= Rs && G.delete(i);
  G.delete(e), G.set(e, { at: s, data: t });
  for (const i of G.keys()) {
    if (G.size <= Dr) break;
    G.delete(i);
  }
}
const zr = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", jr = (e, t) => {
  const s = new Date(e * 1e3);
  return t <= 2 * 86400 ? s.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit" }) : s.toLocaleDateString(void 0, { month: "short", day: "numeric" });
}, ct = (e) => String(Math.round(e * 100) / 100), ht = (e, t, s) => Math.min(s, Math.max(t, e));
function Gr(e, t, s, i) {
  const n = Math.max(1, i.width - ce), r = Math.max(1, i.height - Or), o = s.start, a = Math.max(s.until, s.end), l = _r(o, a, n), d = Sr(i.maxValue, r), p = Object.keys(e.series), f = p.includes(t) ? t : p[0] ?? t, k = (g, W) => {
    const ae = Ve(e.series[g] ?? [], at);
    return { id: g, points: ae, d: Kt(ae, l, d), color: W };
  }, R = k(f, "var(--primary-color)"), oe = i.showChannels ? p.filter((g) => g !== f).map((g, W) => k(g, Hr(W))) : [], Oe = e.forecast, Is = Oe ? zr(Er(Oe, l, d, at)) : "", Ds = Oe ? Kt(Ve(kr(Oe, "p50"), at), l, d) : "", Le = [];
  for (const [, , g] of e.day_types) Le.includes(g) || Le.push(g);
  const _t = (g) => Zt[Le.indexOf(g) % Zt.length], Ns = ot(
    e.day_types.map(([g, W, ae]) => [g, W, ae]),
    l,
    a
  ).map((g) => ({ ...g, fill: _t(g.tag) })), Us = ot(
    Object.entries(e.lights).flatMap(
      ([g, W]) => W.map(([ae, Fs]) => [ae, Fs, g])
    ),
    l,
    a
  ), Hs = ot(e.plan, l, a);
  return {
    busId: f,
    bus: R,
    children: oe,
    band: Is,
    p50: Ds,
    dayTypes: Ns,
    legend: Le.map((g) => ({ tag: g, fill: _t(g) })),
    lights: Us,
    plan: Hs,
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
    super(...arguments), this.groupId = null, this.title = "", this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.narrow = !1, this.cursorIndex = null, this.width = Tr, this.loaded = null, this.error = null, this.seq = 0, this.memo = null;
  }
  get height() {
    return this.narrow ? Rr : Mr;
  }
  connectedCallback() {
    super.connectedCallback(), typeof ResizeObserver < "u" && (this.observer = new ResizeObserver((e) => {
      const t = e[0]?.contentRect.width ?? 0;
      t > 0 && (this.width = t);
    }), this.observer.observe(this)), this.timer = setInterval(() => {
      this.load();
    }, Ir), this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.observer?.disconnect(), this.observer = void 0, this.timer !== void 0 && clearInterval(this.timer), this.timer = void 0;
  }
  willUpdate(e) {
    const t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), s = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
    (t || s) && (e.has("groupId") && (this.cursorIndex = null), this.load());
  }
  query(e) {
    const t = Math.floor(Date.now() / 1e3 / 60) * 60, s = wr(t, this.range, this.horizon);
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
    const s = this.query(t), i = Ar(s), n = G.get(i);
    if (n && Date.now() - n.at < Rs) {
      this.seq++, this.loaded = { q: s, data: n.data }, this.error = null;
      return;
    }
    let r = lt.get(i);
    r || (r = fi(e, s), lt.set(i, r), r.then(
      (a) => Fr(i, a),
      () => {
      }
    ).finally(() => lt.delete(i)));
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
    const i = Gr(
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
    return ht(this.live?.now ?? Math.floor(Date.now() / 1e3), e.t0, e.t1);
  }
  emitSettings() {
    this.dispatchEvent(
      Ri({
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
    const i = e.currentTarget.getBoundingClientRect(), n = i.width > 0 ? this.width / i.width : 1, r = (e.clientX - i.left) * n - ce, o = ht(r / t.plotW, 0, 1);
    return t.t0 + o * (t.t1 - t.t0);
  }
  onMove(e) {
    const t = this.paths;
    !t || t.bus.points.length === 0 || (this.cursorIndex = Xt(t.bus.points, this.timeAt(e, t)));
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
    this.cursorIndex = this.cursorIndex === null ? i > 0 ? 0 : s : ht(this.cursorIndex + i, 0, s);
  }
  renderChips() {
    return c`
      <div class="toolbar">
        <span class="title">${this.title}</span>
        <div class="chips" role="group" aria-label="History range">
          ${Nr.map(
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
          ${Ur.map(
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
    const t = this.width, s = this.height, i = e.x(this.nowAt(e)), n = e.plotH + Lr, r = this.cursorIndex === null ? null : e.x(e.bus.points[this.cursorIndex]?.[0] ?? e.t0), o = `${this.title} activity, ${this.range} history, ${this.horizon} forecast`;
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
      (a) => A`
            <line class="grid" x1=${ce} y1=${e.y(this.maxValue * a)} x2=${t} y2=${e.y(this.maxValue * a)}></line>
            <text class="ytick" x=${ce - 4} y=${e.y(this.maxValue * a) + 3} text-anchor="end">
              ${ct(this.maxValue * a)}
            </text>
          `
    )}
        <g transform="translate(${ce},0)">
          ${e.dayTypes.map(
      (a) => A`<rect
              class="daytype"
              x=${a.x0}
              y="0"
              width=${Math.max(0, a.x1 - a.x0)}
              height=${e.plotH}
              fill=${a.fill}
            ></rect>`
    )}
          ${e.band ? A`<polygon class="band" points=${e.band}></polygon>` : u}
          ${e.p50 ? A`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : u}
          ${e.children.map((a) => A`<path class="child" d=${a.d} stroke=${a.color}></path>`)}
          ${e.bus.d ? A`<path class="bus" d=${e.bus.d}></path>` : u}
          ${this.showLights ? e.lights.map(
      (a) => A`<rect
                  class="light"
                  x=${a.x0}
                  y=${n}
                  width=${Math.max(1, a.x1 - a.x0)}
                  height=${Yt}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`
    ) : u}
          ${this.showLights ? e.plan.map(
      (a) => A`<rect
                  class="plan"
                  x=${a.x0}
                  y=${n}
                  width=${Math.max(1, a.x1 - a.x0)}
                  height=${Yt}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`
    ) : u}
          <line class="now" x1=${i} y1="0" x2=${i} y2=${e.plotH}></line>
          <text class="now-label" x=${i + 3} y="10">now</text>
          ${r === null ? u : A`<line class="cursor" x1=${r} y1="0" x2=${r} y2=${e.plotH}></line>`}
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
        ${jr(e.t0 + i * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`
    );
  }
  renderTooltip(e) {
    const t = this.cursorIndex;
    if (t === null) return u;
    const s = e.bus.points[t];
    if (!s) return u;
    const [i, n] = s, o = (ce + e.x(i)) / this.width * 100, a = this.loaded?.data.day_types.find(([l, d]) => i >= l && i < d)?.[2];
    return c`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${new Date(i * 1e3).toLocaleString()}</div>
        <div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.title || e.busId}</span>
          <span class="tt-value">${ct(n)}</span>
        </div>
        ${e.children.map((l) => {
      const d = Xt(l.points, i), p = l.points[d];
      return p ? c`
                <div class="tt-row">
                  <span class="tt-swatch" style="background: ${l.color}"></span>
                  <span class="tt-name">${l.id}</span>
                  <span class="tt-value">${ct(p[1])}</span>
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
  M,
  x`
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
_([
  h({ attribute: !1 })
], $.prototype, "hass", 2);
_([
  h({ attribute: !1 })
], $.prototype, "groupId", 2);
_([
  h({ attribute: !1 })
], $.prototype, "title", 2);
_([
  h({ attribute: !1 })
], $.prototype, "range", 2);
_([
  h({ attribute: !1 })
], $.prototype, "horizon", 2);
_([
  h({ type: Boolean })
], $.prototype, "showChannels", 2);
_([
  h({ type: Boolean })
], $.prototype, "showLights", 2);
_([
  h({ attribute: !1 })
], $.prototype, "live", 2);
_([
  h({ type: Number })
], $.prototype, "maxValue", 2);
_([
  h({ type: Boolean, reflect: !0 })
], $.prototype, "narrow", 2);
_([
  b()
], $.prototype, "cursorIndex", 2);
_([
  b()
], $.prototype, "width", 2);
_([
  b()
], $.prototype, "loaded", 2);
_([
  b()
], $.prototype, "error", 2);
$ = _([
  w("al-timeline")
], $);
var Br = Object.defineProperty, Vr = Object.getOwnPropertyDescriptor, j = (e, t, s, i) => {
  for (var n = i > 1 ? void 0 : i ? Vr(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (n = (i ? o(t, s, n) : o(n)) || n);
  return i && n && Br(t, s, n), n;
};
const Jt = ["envelope", "gain", "to", "key"], Qt = ["name", "mix", "null_handling", "gain"], qr = 5, Wr = 14, Kr = (e) => `switch.${e}_presence_simulation`, Xr = (e) => e[e.length - 2] === "stimuli";
let T = class extends v {
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
    i && (Cs(i.to, this.toText) || (this.toText = null));
  }
  emitChange(e, t) {
    this.dispatchEvent(ie(e, t));
  }
  /** Writes one nullable field of the selected node, e.g. an envelope or output override. */
  setField(e, t) {
    const { config: s, path: i } = this;
    !s || !i || this.emitChange(S(s, [...i, e], t), `${m(i)}:${e}`);
  }
  onChannelForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = J(t, s);
    if (!i) return;
    const n = e.detail?.value ?? {};
    this.toText = String(n.to ?? "");
    const r = ks(i, n), o = As(r, i);
    o !== void 0 && this.emitChange(S(t, s, r), `${m(s)}:${o}`);
  }
  onBusForm(e) {
    e.stopPropagation();
    const { config: t, path: s } = this;
    if (!t || !s) return;
    const i = U(t, s);
    if (!i) return;
    const n = $s(i, e.detail?.value ?? {}), r = ys(n, i);
    r !== void 0 && this.emitChange(S(t, s, n), `${m(s)}:${r}`);
  }
  /** The switch is Home Assistant's, so this reports the wanted state and lets the shell call it. */
  onSim(e, t) {
    this.dispatchEvent(ls(e, t.target.checked === !0));
  }
  onRebuild() {
    this.dispatchEvent(Ii());
  }
  renderChannel(e, t) {
    const s = J(e, t);
    if (!s) return c`<ha-card><span class="muted">This channel no longer exists.</span></ha-card>`;
    const i = ue(this.errors, t), n = this.errors.filter((o) => o.path === m(t)), r = He(e, s);
    return c`
      <ha-card header=${s.key ?? s.entity}>
        ${n.map((o) => c`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${Es(s, this.toText, Jt)}
              .schema=${Ss(e, Jt)}
              .error=${i}
              .computeLabel=${xs}
              .computeHelper=${ws}
              @value-changed=${this.onChannelForm}
            ></ha-form>
            ${this.renderVoice(e, t, s)}
          </div>
          <div class="col">
            ${_s.map(
      (o) => c`<al-override-field
                .hass=${this.hass}
                .label=${o.label}
                .kind=${o.kind}
                .selector=${o.selector}
                .value=${s[o.name]}
                .inherited=${r[o.name]}
                .inheritedFrom=${Ps(e, s, o.name)}
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
    const i = U(e, Xe(t)), n = this.live?.voices[i?.id ?? ""]?.find((o) => o.label === (s.key ?? s.entity));
    if (!n) return u;
    const r = Os(this.live?.now, n.phase_ends);
    return c`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${n.phase}">${n.phase}</span>
      <span class="chip value">${n.value.toFixed(2)}</span>
      ${r !== null ? c`<span class="muted chip">ends in ${r}</span>` : u}
      <span class="dot ${n.gate ? "gated" : ""}" title=${n.gate ? "Gate open" : "Gate closed"}></span>
    </div>`;
  }
  renderBus(e, t) {
    const s = U(e, t);
    if (!s) return c`<ha-card><span class="muted">This bus no longer exists.</span></ha-card>`;
    const i = t.length === 2, n = ue(this.errors, t), r = this.errors.filter((o) => o.path === m(t));
    return c`
      <ha-card header=${s.name ?? s.id}>
        ${r.map((o) => c`<ha-alert alert-type="error">${o.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${bs(s, i, Qt)}
              .schema=${vs(s, i, Qt)}
              .error=${n}
              .computeLabel=${us}
              .computeHelper=${ps}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${fs}
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
              .selector=${ms}
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
    const s = t.id, i = this.live?.groups[s]?.lights ?? 0, n = this.hass?.states[Kr(s)], r = this.simLog?.blocked[s] ?? null, o = (this.simLog?.entries ?? []).filter((a) => a.group_id === s).sort((a, l) => l.t - a.t).slice(0, qr);
    return c`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${i} light${i === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${i > 0 ? c`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${n?.state === "on"}
                .disabled=${n === void 0}
                title=${n === void 0 ? "No simulation switch for this bus" : "Presence simulation"}
                @change=${(a) => this.onSim(s, a)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : u}
        ${r !== null ? c`<div class="muted blocked">Blocked: ${r}</div>` : u}
        ${this.renderSensor("expected", "Expected", `sensor.${s}_expected_activity`)}
        ${this.renderSensor("anomaly", "Anomaly", `sensor.${s}_activity_anomaly`)}
        <div class="muted readiness">${this.readiness(e, s)}</div>
        ${o.length > 0 ? c`<ol class="log">
              ${o.map((a) => this.renderLogEntry(a))}
            </ol>` : c`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
  }
  /** One of the pattern sensors, with the day type it was measured against. */
  renderSensor(e, t, s) {
    const i = this.hass?.states[s], n = i?.attributes.day_type;
    return c`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${i?.state ?? "—"}</span>
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
    const i = s.profile.groups[t]?.days ?? 0, n = e.defaults.patterns?.min_days ?? Wr;
    return s.ready[t] === !0 ? `Profile ready · ${i} days learned` : `Learning… ${i}/${n} days`;
  }
  render() {
    const { config: e, path: t } = this;
    return !e || !t || t.length === 0 ? c`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Xr(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
  }
};
T.styles = [
  M,
  x`
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
], T.prototype, "hass", 2);
j([
  h({ attribute: !1 })
], T.prototype, "config", 2);
j([
  h({ attribute: !1 })
], T.prototype, "path", 2);
j([
  h({ attribute: !1 })
], T.prototype, "errors", 2);
j([
  h({ attribute: !1 })
], T.prototype, "live", 2);
j([
  h({ attribute: !1 })
], T.prototype, "profileState", 2);
j([
  h({ attribute: !1 })
], T.prototype, "simLog", 2);
j([
  b()
], T.prototype, "toText", 2);
T = j([
  w("al-strip-controls")
], T);
