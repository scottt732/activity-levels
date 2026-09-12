//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: ee, getPrototypeOf: te } = Object, p = globalThis, ne = p.trustedTypes, re = ne ? ne.emptyScript : "", ie = p.reactiveElementPolyfillSupport, m = (e, t) => e, h = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? re : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, ae = (e, t) => !l(e, t), oe = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: ae
};
Symbol.metadata ??= Symbol("metadata"), p.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var g = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? oe;
	}
	static _$Ei() {
		if (this.hasOwnProperty(m("elementProperties"))) return;
		let e = te(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(m("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(m("properties"))) {
			let e = this.properties, t = [...f(e), ...ee(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
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
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? h : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? h : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ae)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[m("elementProperties")] = /* @__PURE__ */ new Map(), g[m("finalized")] = /* @__PURE__ */ new Map(), ie?.({ ReactiveElement: g }), (p.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/lit-html.js
var _ = globalThis, se = (e) => e, v = _.trustedTypes, ce = v ? v.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, le = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ue = "?" + y, de = `<${ue}>`, b = document, x = () => b.createComment(""), S = (e) => e === null || typeof e != "object" && typeof e != "function", C = Array.isArray, fe = (e) => C(e) || typeof e?.[Symbol.iterator] == "function", pe = "[ 	\n\f\r]", w = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, me = /-->/g, he = />/g, T = RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ge = /'/g, _e = /"/g, ve = /^(?:script|style|textarea|title)$/i, ye = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), E = ye(1), be = ye(2), D = Symbol.for("lit-noChange"), O = Symbol.for("lit-nothing"), xe = /* @__PURE__ */ new WeakMap(), k = b.createTreeWalker(b, 129);
function Se(e, t) {
	if (!C(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ce === void 0 ? t : ce.createHTML(t);
}
var Ce = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = w;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === w ? c[1] === "!--" ? o = me : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = T) : (ve.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = T) : o = he : o === T ? c[0] === ">" ? (o = i ?? w, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? T : c[3] === "\"" ? _e : ge) : o === _e || o === ge ? o = T : o === me || o === he ? o = w : (o = T, i = void 0);
		let d = o === T && e[t + 1].startsWith("/>") ? " " : "";
		a += o === w ? n + de : l >= 0 ? (r.push(s), n.slice(0, l) + le + n.slice(l) + y + d) : n + y + (l === -2 ? t : d);
	}
	return [Se(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, A = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Ce(t, n);
		if (this.el = e.createElement(l, r), k.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = k.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(le)) {
					let t = u[o++], n = i.getAttribute(e).split(y), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Te : r[1] === "?" ? Ee : r[1] === "@" ? De : N
					}), i.removeAttribute(e);
				} else e.startsWith(y) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ve.test(i.tagName)) {
					let e = i.textContent.split(y), t = e.length - 1;
					if (t > 0) {
						i.textContent = v ? v.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], x()), k.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], x());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ue) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(y, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += y.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = b.createElement("template");
		return n.innerHTML = e, n;
	}
};
function j(e, t, n = e, r) {
	if (t === D) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = S(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = j(e, i._$AS(e, t.values), i, r)), t;
}
var we = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? b).importNode(t, !0);
		k.currentNode = r;
		let i = k.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new M(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Oe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = k.nextNode(), a++);
		}
		return k.currentNode = b, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, M = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = O, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = j(this, e, t), S(e) ? e === O || e == null || e === "" ? (this._$AH !== O && this._$AR(), this._$AH = O) : e !== this._$AH && e !== D && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? fe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== O && S(this._$AH) ? this._$AA.nextSibling.data = e : this.T(b.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = A.createElement(Se(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new we(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = xe.get(e.strings);
		return t === void 0 && xe.set(e.strings, t = new A(e)), t;
	}
	k(t) {
		C(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(x()), this.O(x()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = se(e).nextSibling;
			se(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, N = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = O, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = O;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = j(this, e, t, 0), a = !S(e) || e !== this._$AH && e !== D, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = j(this, r[n + o], t, o), s === D && (s = this._$AH[o]), a ||= !S(s) || s !== this._$AH[o], s === O ? e = O : e !== O && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === O ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Te = class extends N {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === O ? void 0 : e;
	}
}, Ee = class extends N {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== O);
	}
}, De = class extends N {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = j(this, e, t, 0) ?? O) === D) return;
		let n = this._$AH, r = e === O && n !== O || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== O && (n === O || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Oe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		j(this, e);
	}
}, ke = _.litHtmlPolyfillSupport;
ke?.(A, M), (_.litHtmlVersions ??= []).push("3.3.3");
var Ae = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new M(t.insertBefore(x(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, P = globalThis, F = class extends g {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ae(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return D;
	}
};
F._$litElement$ = !0, F.finalized = !0, P.litElementHydrateSupport?.({ LitElement: F });
var je = P.litElementPolyfillSupport;
je?.({ LitElement: F }), (P.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/custom-element.js
var I = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Me = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	hasChanged: ae
}, Ne = (e = Me, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function L(e) {
	return (t, n) => typeof n == "object" ? Ne(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
//#endregion
//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/state.js
function R(e) {
	return L({
		...e,
		state: !0,
		attribute: !1
	});
}
//#endregion
//#region src/api.ts
var Pe = (e, t) => e.callWS({
	type: "activity_levels/floorplan/parse",
	text: t
}), Fe = (e) => ({
	ok: e.ok,
	errors: e.errors ?? []
}), Ie = (e) => e.callWS({ type: "activity_levels/config/get" }).then((e) => ({
	config: e.config,
	inferred: e.inferred ?? [],
	warnings: e.warnings ?? []
})), Le = (e, t) => e.callWS({
	type: "activity_levels/config/validate",
	config: t
}).then(Fe);
async function Re(e, t) {
	try {
		return Fe(await e.callWS({
			type: "activity_levels/config/save",
			config: t
		}));
	} catch (e) {
		return {
			ok: !1,
			errors: [{
				path: "",
				message: e.message ?? String(e)
			}]
		};
	}
}
var ze = (e) => e.callWS({ type: "activity_levels/state" }), Be = (e, t) => e.callWS({
	type: "activity_levels/timeseries",
	...t
}), Ve = (e) => e.callWS({ type: "activity_levels/profile/get" }), He = (e, t = !1) => e.callWS({
	type: "activity_levels/profile/rebuild",
	force: t
}), Ue = (e, t, n = 50) => e.callWS({
	type: "activity_levels/simulation/log",
	...t === void 0 ? {} : { group_id: t },
	limit: n
}), We = (e, t, n) => e.callWS({
	type: "activity_levels/level/set",
	group_id: t,
	value: n
}).then((e) => e.value), Ge = (e, t, n) => e.callWS({
	type: "activity_levels/mute",
	group_id: t,
	muted: n
}).then((e) => e.muted), Ke = (e, t) => e.callWS({
	type: "activity_levels/reset",
	group_id: t
}).then(() => void 0), qe = (e) => e.callWS({ type: "activity_levels/topology" }), Je = (e, t, n) => e.callWS({
	type: "activity_levels/topology/paths",
	from: t,
	to: n
}).then((e) => e.paths), Ye = (e) => e.callWS({ type: "activity_levels/presence/state" }), Xe = (e, t, n) => e.callWS({
	type: "activity_levels/presence/correct",
	person: t,
	...typeof n == "string" ? { room: n } : n
}), Ze = (e, t, n, r) => e.callService(t, n, r), Qe = [
	"property",
	"structure",
	"floor",
	"area",
	"outside"
], $e = [
	"open",
	"door",
	"stairs",
	"exterior_door"
], et = "door", z = {
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
}, tt = {
	open: "Open (no door)",
	door: "Door",
	stairs: "Stairs",
	exterior_door: "Exterior door"
}, nt = {
	property: [
		"property",
		"structure",
		"outside"
	],
	structure: ["floor", "area"],
	floor: ["area"],
	area: ["area"],
	outside: ["outside"]
}, rt = ["property"], it = /* @__PURE__ */ new Set(["area", "outside"]), at = (e) => e === null ? rt : nt[e];
function ot(e, t) {
	return t.length <= e.length ? !1 : e.every((e, n) => t[n] === e);
}
//#endregion
//#region src/store.ts
function B(e, t) {
	let n = e;
	for (let e of t) {
		if (n == null) return;
		n = n[e];
	}
	return n;
}
function st(e) {
	return Array.isArray(e) ? [...e] : { ...e };
}
function V(e, t, n) {
	if (t.length === 0) throw Error("empty path");
	let r = st(e), i = r;
	for (let e = 0; e < t.length - 1; e++) {
		let n = t[e], r = st(i[n]);
		i[n] = r, i = r;
	}
	return n(i, t[t.length - 1]), r;
}
function ct(e, t, n) {
	return V(e, t, (e, t) => {
		e[t] = n;
	});
}
function lt(e, t) {
	return V(e, t, (e, t) => {
		Array.isArray(e) ? e.splice(t, 1) : delete e[t];
	});
}
function ut(e, t, n, r) {
	return V(e, [...t, n], (e) => {
		e.splice(n, 0, r);
	});
}
function dt(e, t, n, r) {
	return V(e, [...t, n], (e) => {
		let t = e, [i] = t.splice(n, 1);
		t.splice(r, 0, i);
	});
}
function ft(e, t, n, r) {
	return r === n || r === n + 1 ? e : dt(e, t, n, r > n ? r - 1 : r);
}
var pt = 1e3, mt = class {
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
	set(e, t) {
		let n = Date.now();
		t !== void 0 && t === this.coalesceKey && n - this.coalesceAt < pt || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = t ?? null, this.coalesceAt = n;
	}
	undo() {
		this.coalesceKey = null;
		let e = this.past.pop();
		e && (this.future.push(this.config), this.config = e);
	}
	redo() {
		this.coalesceKey = null;
		let e = this.future.pop();
		e && (this.past.push(this.config), this.config = e);
	}
	reset(e) {
		this.original = e, this.config = e, this.past = [], this.future = [], this.coalesceKey = null;
	}
}, H = (e) => ({
	ok: !1,
	reason: e
}), U = (e) => ({
	list: e.slice(0, -1),
	index: e[e.length - 1]
}), ht = (e) => e[e.length - 1] === "stimuli";
function gt(e, t, n, r) {
	let i = B(e, t);
	if (i === void 0) return H("that node is gone");
	let a = B(e, n);
	if (!Array.isArray(a)) return H("there is nothing to drop into there");
	if (r < 0 || r > a.length) return H("that is not a slot in this list");
	let o = ht(U(t).list);
	if (o !== ht(n)) return H(o ? "a stimulus belongs to a group, not beside one" : "that is not a stimulus");
	if (o) return { ok: !0 };
	let s = i;
	if (ot(t, n) || W(t, n.slice(0, -1))) return H("a group cannot go into itself");
	let c = n.slice(0, -1), l;
	if (n.length === 1) l = null;
	else {
		let t = B(e, c);
		if (t === void 0) return H("that group is gone");
		l = t.kind;
	}
	return at(l).includes(s.kind) ? { ok: !0 } : H(l === null ? "every root group is a property" : `a ${l} cannot contain a ${s.kind}`);
}
var W = (e, t) => e.length === t.length && e.every((e, n) => t[n] === e);
function _t(e, t, n) {
	let { list: r, index: i } = U(e), a = [...t], o = a[r.length];
	return r.length < a.length && W(r, a.slice(0, r.length)) && typeof o == "number" && o > i && (a[r.length] = o - 1), {
		parent: a,
		index: W(r, t) && n > i ? n - 1 : n
	};
}
function vt(e, t, n, r) {
	let { index: i } = U(t);
	if (W(U(t).list, n) && (r === i || r === i + 1)) return e;
	let a = B(e, t), o = lt(e, t), { parent: s, index: c } = _t(t, n, r);
	return ut(o, s, c, a);
}
//#endregion
//#region src/model.ts
var yt = (e, t) => ({
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
	presence: xt(),
	stimuli: [],
	children: []
}), bt = "presence", xt = () => ({
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
}), St = (e) => typeof e == "string" ? e : e.id, Ct = (e) => typeof e != "string" && e.one_way, wt = (e) => typeof e == "string" ? et : e.connection;
function G(e) {
	let t = [], n = (e, r, i) => {
		t.push({
			group: e,
			path: r,
			parent: i
		}), e.children.forEach((t, i) => n(t, [
			...r,
			"children",
			i
		], e));
	};
	return e.groups.forEach((e, t) => n(e, ["groups", t], null)), t;
}
function Tt(e, t) {
	let n = [];
	for (let { group: r } of G(e)) if (r.id !== t) for (let e of r.adjacent ?? []) St(e) === t && n.push({
		group: r,
		edge: {
			id: t,
			connection: wt(e),
			one_way: Ct(e)
		}
	});
	return n;
}
var Et = {
	enabled: !1,
	devices: [],
	envelope: null,
	threshold: .6,
	stay: .9,
	escape: .001,
	scale: 3,
	floor: .05,
	stuck_after: 60,
	activity: { floor: .05 },
	people: [],
	carried: {
		prior: .7,
		flip: 300,
		recent: 120,
		nearby: .3,
		weights: {
			charging: -3,
			moving: 2,
			still_room_empty: -2,
			jitter: 1
		}
	},
	scanner_areas: {}
}, Dt = (e) => ({
	tracker: e,
	name: null,
	kind: "other",
	companion: null,
	signals: {
		activity: null,
		steps: null,
		battery_state: null
	}
}), Ot = () => ({
	name: null,
	person: null,
	devices: []
}), kt = (e) => ({
	...Et,
	...e.presence ?? {}
}), At = (e) => ({
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
}), jt = (e) => e.label !== null && e.label.trim() !== "" ? e.label : e.id, Mt = (e) => ({
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
}), Nt = (e, t) => t.precision ?? e.defaults.precision;
function Pt(e, t) {
	return e.toFixed(Math.min(100, Math.max(0, Math.trunc(t))));
}
function Ft(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		t.add(e.id), e.children.forEach(n);
	};
	return e.groups.forEach(n), t;
}
function It(e) {
	return new Set(G(e).filter(({ group: e }) => it.has(e.kind)).map(({ group: e }) => e.id));
}
function Lt(e) {
	return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
var Rt = (e) => new Set(e.envelopes.map((e) => e.id));
function zt(e, t) {
	let n = Lt(t);
	if (!e.has(n)) return n;
	let r = 2;
	for (; e.has(`${n}_${r}`);) r++;
	return `${n}_${r}`;
}
var Bt = (e, t) => zt(Ft(e), t), Vt = (e, t) => zt(Rt(e), t);
function Ht(e, t) {
	let n = [], r = (e) => {
		e.stimuli.some((e) => e.envelope === t) && n.push(e.id), e.children.forEach(r);
	};
	return e.groups.forEach(r), {
		defaults: e.defaults.envelope === t,
		groups: n
	};
}
function Ut(e, t, n) {
	let r = e.envelopes[t];
	if (!r || r.id === n) return e;
	let i = r.id, a = e.envelopes.map((e, r) => r === t ? {
		...e,
		id: n
	} : e);
	if (e.envelopes.some((e, n) => n !== t && e.id === i)) return {
		...e,
		envelopes: a
	};
	let o = (e) => ({
		...e,
		stimuli: e.stimuli.map((e) => e.envelope === i ? {
			...e,
			envelope: n
		} : e),
		children: e.children.map(o)
	});
	return {
		...e,
		defaults: e.defaults.envelope === i ? {
			...e.defaults,
			envelope: n
		} : e.defaults,
		envelopes: a,
		groups: e.groups.map(o)
	};
}
var Wt = (e, t) => B(e, t), Gt = (e, t) => B(e, t), Kt = (e) => e.slice(0, -2), qt = (e) => e[e.length - 2] === "stimuli" ? Kt(e) : e, Jt = (e, t) => e.envelopes.find((n) => n.id === (t ?? e.defaults.envelope));
function Yt(e, t) {
	let n = Jt(e, t.envelope), r = e.defaults, i = (e, t, n) => e ?? t ?? n;
	return {
		attack: i(t.attack, n?.attack, 0),
		decay: i(t.decay, n?.decay, 0),
		sustain: i(t.sustain, n?.sustain, 1),
		release: i(t.release, n?.release, 1800),
		impulse: i(t.impulse, n?.impulse, !1),
		retrigger: i(t.retrigger, n?.retrigger, r.retrigger),
		stack: i(t.stack, n?.stack, r.stack),
		unavailable: i(t.unavailable, n?.unavailable, r.unavailable),
		debounce: i(t.debounce, n?.debounce, r.debounce)
	};
}
//#endregion
//#region src/styles.ts
var Xt = o`
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
  /* The mixer page: timeline and mixer stacked, each as wide as the panel. */
  .rows {
    display: grid;
    grid-template-rows: auto auto;
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
//#endregion
//#region \0@oxc-project+runtime@0.147.0/helpers/esm/decorate.js
function K(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
//#endregion
//#region src/presence-styles.ts
var Zt = o`
  :host {
    --al-control-border: color-mix(in srgb, var(--primary-text-color) 55%, var(--card-background-color));
  }
  button, select, .resource-links a {
    box-sizing: border-box;
    min-height: 36px;
    padding: 8px 12px;
    border: 1px solid var(--al-control-border);
    border-radius: 4px;
    background: var(--card-background-color, var(--primary-background-color));
    color: var(--primary-text-color);
    font: inherit;
    line-height: 1.3;
  }
  button, .resource-links a { cursor: pointer; }
  button:hover, .resource-links a:hover {
    background: var(--secondary-background-color);
    border-color: var(--primary-color);
  }
  button:focus-visible, select:focus-visible, a:focus-visible, summary:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  button:disabled, select:disabled { opacity: 0.6; cursor: default; }
  button[aria-expanded="true"], button[aria-pressed="true"] {
    border-color: var(--primary-color);
    box-shadow: inset 3px 0 var(--primary-color);
    background: var(--secondary-background-color);
  }
  a { color: var(--primary-text-color); text-underline-offset: 3px; }
  a:hover { color: var(--primary-color); }
  .resource-links, .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .resource-links a { display: inline-flex; align-items: center; text-decoration: none; }
  .resource-links a::after { content: "↗"; margin-left: 6px; }
  .page > * { min-width: 0; }
  .table-scroll { overflow-x: auto; }
  h2 { margin: 0 0 16px; font-size: 1.25em; font-weight: 500; }
`;
//#endregion
//#region src/room-fixtures.ts
function Qt(e = "", t = "motion") {
	return {
		entity: e,
		kind: t,
		name: "",
		position: [
			0,
			0,
			0
		],
		yaw: 0,
		pitch: 0,
		fov: 60,
		vertical_fov: 45,
		range: 0,
		mount: "",
		technology: ""
	};
}
function $t(e) {
	let t = e.yaw * Math.PI / 180, n = e.pitch * Math.PI / 180;
	return [
		Math.cos(t) * Math.cos(n),
		Math.sin(n),
		-Math.sin(t) * Math.cos(n)
	];
}
function en(e, t, n, r) {
	let i = structuredClone(e), a = G(i).find((e) => e.group.id === t)?.group;
	if (!a?.bounds) throw Error("Choose a placed room.");
	if (!/^(binary_sensor|light)\.[a-z0-9_]+$/.test(n.entity) || n.entity.startsWith("light.") !== (n.kind === "light")) throw Error("Choose a binary sensor for motion/occupancy or a light entity for a light.");
	if (![
		...n.position,
		n.yaw,
		n.pitch,
		n.fov,
		n.vertical_fov,
		n.range
	].every(Number.isFinite) || Math.abs(n.yaw) > 360 || Math.abs(n.pitch) > 90 || n.range < 0 || n.range > 100 || n.fov < 1 || n.fov > 170 || n.vertical_fov < 1 || n.vertical_fov > 170) throw Error("Check position, angles, field of view (1–170°), and range (0–100 m).");
	if (!tn(a, n.position)) throw Error("Place the device inside this room, including its floor-to-ceiling height.");
	let o = a.fixtures ?? [];
	if (o.some((e) => e.entity === n.entity && e.entity !== r)) throw Error("This entity already has a placement in the room.");
	let s = o.findIndex((e) => e.entity === r);
	if (s < 0 && o.length >= 128) throw Error("Maximum 128 placements per room.");
	return a.fixtures = s < 0 ? [...o, structuredClone(n)] : o.map((e, t) => t === s ? structuredClone(n) : e), i;
}
function tn(e, [t, n, r]) {
	let i = e.bounds;
	if (!i || r < i[0][2] - 1e-6 || r > i[1][2] + 1e-6) return !1;
	let a = e.points ?? [
		[i[0][0], i[0][1]],
		[i[1][0], i[0][1]],
		[i[1][0], i[1][1]],
		[i[0][0], i[1][1]]
	], o = !1;
	for (let e = 0, r = a.length - 1; e < a.length; r = e++) {
		let i = a[r], s = a[e], c = (t - i[0]) * (s[1] - i[1]) - (n - i[1]) * (s[0] - i[0]);
		if (Math.abs(c) < 1e-6 && t >= Math.min(i[0], s[0]) - 1e-6 && t <= Math.max(i[0], s[0]) + 1e-6 && n >= Math.min(i[1], s[1]) - 1e-6 && n <= Math.max(i[1], s[1]) + 1e-6) return !0;
		i[1] > n != s[1] > n && t < (s[0] - i[0]) * (n - i[1]) / (s[1] - i[1]) + i[0] && (o = !o);
	}
	return o;
}
function nn(e) {
	if (!e || typeof e != "object") return null;
	let t = {
		...Qt(),
		...e
	};
	return typeof t.entity != "string" || !/^(binary_sensor|light)\.[a-z0-9_]+$/.test(t.entity) || ![
		"motion",
		"occupancy",
		"light"
	].includes(t.kind) || t.entity.startsWith("light.") !== (t.kind === "light") || !Array.isArray(t.position) || t.position.length !== 3 || ![
		...t.position,
		t.yaw,
		t.pitch,
		t.fov,
		t.vertical_fov,
		t.range
	].every((e) => typeof e == "number" && Number.isFinite(e)) || Math.abs(t.yaw) > 360 || Math.abs(t.pitch) > 90 || t.fov < 1 || t.fov > 170 || t.vertical_fov < 1 || t.vertical_fov > 170 || t.range < 0 || t.range > 100 || typeof t.name != "string" || typeof t.mount != "string" || typeof t.technology != "string" ? null : t;
}
function rn(e, t, n) {
	let r = e?.groups[t], i = {
		value: null,
		max: null,
		ratio: null
	};
	return !e || !r || !Number.isFinite(e.now) || !Number.isFinite(r.value) || !Number.isFinite(r.max_value) || r.max_value <= 0 ? {
		status: "missing",
		...i
	} : n - e.now > 10 ? {
		status: "stale",
		...i
	} : {
		status: "live",
		value: r.value,
		max: r.max_value,
		ratio: Math.min(1, Math.max(0, r.value / r.max_value))
	};
}
var an = (e, t) => Array.isArray(e) && e.length === t && e.every((e) => typeof e == "number" && Number.isFinite(e));
function on(e) {
	if (!Array.isArray(e) || e.length < 3 || e.length > 4096) return null;
	let t = [];
	for (let n of e) {
		if (!an(n, 2)) return null;
		let e = t.at(-1);
		(!e || e[0] !== n[0] || e[1] !== n[1]) && t.push([n[0], n[1]]);
	}
	if (t.length > 1 && t[0][0] === t.at(-1)[0] && t[0][1] === t.at(-1)[1] && t.pop(), t.length < 3) return null;
	let [n, r] = t[0], i = t.reduce((e, i, a) => {
		let o = t[(a + 1) % t.length];
		return e + (i[0] - n) * (o[1] - r) - (o[0] - n) * (i[1] - r);
	}, 0);
	return Number.isFinite(i) && i !== 0 ? t : null;
}
function sn(e) {
	let t = [], n = [], r = [], i = (e, t, n) => {
		e.forEach((e, a) => {
			let o = [...t, a];
			r.push({
				group: e,
				path: o,
				parent: n
			}), i(e.children, [...o, "children"], e);
		});
	};
	i(e.groups, ["groups"], null);
	let a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
	for (let { group: e, path: i, parent: s } of r) {
		let r = s ? [...a.get(s.id).ancestors, s.id] : [], c = {
			id: e.id,
			label: e.name ?? e.id,
			kind: e.kind,
			path: i,
			ancestors: r
		};
		if (a.set(e.id, c), e.bounds === void 0 && e.points === void 0) continue;
		[e.id, ...r].forEach((e) => o.add(e));
		let l = (t) => n.push({
			id: e.id,
			label: c.label,
			reason: t
		}), u = e.bounds;
		if (u === void 0) {
			l("Footprint has no vertical bounds. Add bounds in Code to place it in 3D.");
			continue;
		}
		if (!Array.isArray(u) || u.length !== 2 || !an(u[0], 3) || !an(u[1], 3) || u[0].some((e, t) => e >= u[1][t])) {
			l("Invalid bounds in the draft.");
			continue;
		}
		let d = e.points === void 0 ? [
			[u[0][0], u[0][1]],
			[u[1][0], u[0][1]],
			[u[1][0], u[1][1]],
			[u[0][0], u[1][1]]
		] : on(e.points);
		if (!d) {
			l("Invalid footprint in the draft.");
			continue;
		}
		let f = Array.isArray(e.fixtures) ? e.fixtures.slice(0, 128).map(nn).filter((e) => e !== null) : [];
		e.fixtures !== void 0 && (!Array.isArray(e.fixtures) || f.length !== e.fixtures.length) && l("Some device placements are invalid and could not be displayed."), t.push({
			...c,
			fixtures: f,
			footprint: d,
			low: u[0][2],
			high: u[1][2],
			container: [
				"property",
				"structure",
				"floor"
			].includes(e.kind)
		});
	}
	let s = [...a.values()].filter((e) => o.has(e.id));
	return {
		parts: t,
		groups: s,
		issues: n,
		scopes: s.filter((e) => [
			"property",
			"structure",
			"floor"
		].includes(e.kind))
	};
}
var q = (e, t) => t ? e.filter((e) => e.id === t || e.ancestors.includes(t)) : e, cn = [
	{
		value: 0,
		color: "#2189EF"
	},
	{
		value: 1.25,
		color: "#35cddd"
	},
	{
		value: 2.5,
		color: "#f5df62"
	},
	{
		value: 3.75,
		color: "#f39c12"
	},
	{
		value: 5,
		color: "#ef493e"
	}
], ln = [
	"standard",
	"night",
	"security"
], un = (e) => typeof e == "string" && /^#[0-9a-f]{6}$/i.test(e);
function J(e = {}) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw Error("Viewer settings must be an object.");
	let t = e.scheme ?? "standard";
	if (!ln.includes(t)) throw Error("Unknown color scheme.");
	let n = e.color_thresholds ?? (t === "security" ? [{
		value: 0,
		color: "#697780"
	}, {
		value: 3,
		color: "#d31400"
	}] : cn);
	if (!Array.isArray(n) || !n.length || n.length > 32 || n.some((e) => !e || !Number.isFinite(e.value) || !un(e.color)) || new Set(n.map((e) => e.value)).size !== n.length) throw Error("color_thresholds needs unique finite values and #RRGGBB colors (1–32 entries).");
	if (e.ground_z !== void 0 && !Number.isFinite(e.ground_z)) throw Error("ground_z must be finite.");
	let r = e.fill_brightness ?? (t === "standard" ? .3 : .12);
	if (!Number.isFinite(r) || r < 0 || r > 1) throw Error("fill_brightness must be between 0 and 1.");
	for (let t of [
		"light_fill",
		"ambient",
		"auto_rotate",
		"focus_activity"
	]) if (e[t] !== void 0 && typeof e[t] != "boolean") throw Error(`${t} must be true or false.`);
	let i = e.rotation_period ?? 180;
	if (!Number.isFinite(i) || i < 1) throw Error("rotation_period must be at least 1 second per revolution.");
	let a = e.rules ?? [];
	if (!Array.isArray(a) || a.length > 64 || a.some((e) => !e || !/^binary_sensor\.[a-z0-9_]+$/.test(e.entity) || !["on", "off"].includes(e.state) || e.priority !== void 0 && !Number.isFinite(e.priority) || e.scheme !== void 0 && !ln.includes(e.scheme) || e.color !== void 0 && !un(e.color) || e.group !== void 0 && typeof e.group != "string" || e.label !== void 0 && typeof e.label != "string")) throw Error("Invalid binary sensor rule (maximum 64).");
	return {
		...e,
		scheme: t,
		color_thresholds: [...n].sort((e, t) => e.value - t.value),
		light_fill: e.light_fill ?? !0,
		fill_brightness: r,
		ambient: e.ambient ?? !1,
		auto_rotate: e.auto_rotate ?? !1,
		rotation_period: i,
		focus_activity: e.focus_activity ?? !1,
		rules: a
	};
}
function dn(e, t) {
	let n = t.color_thresholds, r = n.findIndex((t) => t.value > e);
	if (r === 0) return n[0].color;
	if (r === -1) return n.at(-1).color;
	let i = n[r - 1], a = n[r], o = (e - i.value) / (a.value - i.value);
	return "#" + [
		1,
		3,
		5
	].map((e) => {
		let t = parseInt(i.color.slice(e, e + 2), 16), n = parseInt(a.color.slice(e, e + 2), 16);
		return Math.round(t + (n - t) * o).toString(16).padStart(2, "0");
	}).join("");
}
function Y(e, t) {
	return e.filter((e) => t[e.entity]?.state === e.state).sort((e, t) => (t.priority ?? 0) - (e.priority ?? 0))[0];
}
var X = (e) => Math.min(1, Math.max(0, e)), fn = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, pn = (e, t) => Array.isArray(e) && e.length >= t && e.every((e) => typeof e == "number" && Number.isFinite(e));
function mn(e) {
	let t = [
		1,
		1,
		1
	];
	if (pn(e.rgb_color, 3)) t = e.rgb_color.slice(0, 3).map((e) => X(e / 255));
	else if (pn(e.hs_color, 2)) {
		let n = (e.hs_color[0] % 360 + 360) % 360 / 60, r = X(e.hs_color[1] / 100);
		t = [
			5,
			3,
			1
		].map((e) => 1 - r * Math.max(0, Math.min((e + n) % 6, 4 - (e + n) % 6, 1)));
	} else if (pn(e.xy_color, 2) && e.xy_color[1] > 0) {
		let [t, n] = e.xy_color, r = t / n, i = (1 - t - n) / n, a = [
			3.2406 * r - 1.5372 - .4986 * i,
			-.9689 * r + 1.8758 + .0415 * i,
			.0557 * r - .204 + 1.057 * i
		], o = Math.max(1, ...a);
		return a.map((e) => X(e / o));
	} else {
		let n = typeof e.color_temp_kelvin == "number" ? e.color_temp_kelvin : typeof e.color_temp == "number" && e.color_temp > 0 ? 1e6 / e.color_temp : NaN;
		if (Number.isFinite(n)) {
			let e = Math.max(1e3, Math.min(4e4, n)) / 100;
			t = [
				e <= 66 ? 255 : 329.698727446 * (e - 60) ** -.1332047592,
				e <= 66 ? 99.4708025861 * Math.log(e) - 161.1195681661 : 288.1221695283 * (e - 60) ** -.0755148492,
				e >= 66 ? 255 : e <= 19 ? 0 : 138.5177312231 * Math.log(e - 10) - 305.0447927307
			].map((e) => X(e / 255));
		}
	}
	return t.map(fn);
}
function Z(e, t) {
	let n = [
		0,
		0,
		0
	], r = 0, i = 0, a = e === void 0;
	for (let o of new Set(e ?? [])) {
		let e = t[o];
		if (!e || !["on", "off"].includes(e.state)) {
			a = !0;
			continue;
		}
		if (e.state === "off") continue;
		let s = e.attributes.brightness, c = typeof s == "number" && Number.isFinite(s) ? X(s / 255) : 1;
		mn(e.attributes).forEach((e, t) => {
			n[t] += e * c;
		}), r += c, i = Math.max(i, c);
	}
	return {
		rgb: n.map((e) => r ? e / r : 0),
		brightness: i,
		unknown: a
	};
}
//#endregion
//#region src/al-room-hud.ts
var hn = (e) => e < 60 ? `${Math.ceil(e)}s` : e < 3600 ? `${Math.ceil(e / 60)}m` : `${Math.ceil(e / 3600)}h`, Q = class extends F {
	constructor(...e) {
		super(...e), this.live = null, this.now = 0;
	}
	static {
		this.styles = o`
    :host { display:block; color:#dbf7ff; font:12px/1.5 var(--paper-font-body1_-_font-family,system-ui); }
    button { float:right; color:#c8eff6; background:transparent; border:1px solid #61cbe555; border-radius:4px; width:32px; height:32px; cursor:pointer; }
    section { background:linear-gradient(120deg,#0a1c2ef2,#102838dc); border:1px solid #61cbe577;
      border-left:3px solid #7ee3ef; border-radius:2px 14px 2px 14px; padding:14px; box-shadow:0 0 24px #26c7ef18; }
    .eyebrow { color:#8ad8e4; letter-spacing:.18em; font-size:10px; text-transform:uppercase; }
    h3 { margin:2px 0 8px; font-size:19px; font-weight:500; overflow-wrap:anywhere; }
    .value { font-size:26px; font-variant-numeric:tabular-nums; } .muted { color:#a4bdc9; }
    .meter { height:3px; background:#436775; margin:6px 0 10px; }
    .meter span { display:block; height:100%; background:#8be8f7; }
    p { margin:6px 0; } .people { display:flex; flex-wrap:wrap; gap:12px; margin:10px 0; }
    .person { display:flex; align-items:center; gap:7px; } img,.initial { width:32px; height:32px; border-radius:50%; border:1px solid #77cddb; object-fit:cover; }
    .initial { display:grid; place-items:center; background:#274557; }
    ul { margin:6px 0 0; padding:0; list-style:none; } li { overflow-wrap:anywhere; }
  `;
	}
	render() {
		let e = this.room;
		if (!e) return O;
		let t = rn(this.live, e.id, this.now), n = this.telemetry && Number.isFinite(this.telemetry.now) && Math.abs(this.now - this.telemetry.now) <= 10 ? this.telemetry?.rooms[e.id] : void 0, r = this.live?.groups[e.id]?.last_activity, i = n?.people.filter((e) => e.t !== null && Number.isFinite(e.t) && this.now - e.t <= 120) ?? [];
		return E`<section aria-label="Room telemetry">
      <button type="button" aria-label="Dismiss room details" @click=${() => this.dispatchEvent(new CustomEvent("al-dismiss-hud", {
			bubbles: !0,
			composed: !0
		}))}>×</button>
      <div class="eyebrow">Room telemetry · ${t.status === "live" ? "live" : "awaiting update"}</div>
      <h3>${e.label}</h3>
      <span class="value">${t.value === null ? "—" : t.value.toFixed(1)}</span><span class="muted"> / ${t.max ?? 5} activity</span>
      <div class="meter"><span style=${`width:${(t.ratio ?? 0) * 100}%`}></span></div>
      <p>Last active <strong>${r != null && Number.isFinite(r) ? `${hn(Math.max(0, this.now - r))} ago` : "unknown"}</strong></p>
      <p>${n ? n.idle_by === null ? "Held by ongoing input" : n.idle_by <= this.now ? "Idle" : `Idle within ${hn(n.idle_by - this.now)}` : "Idle forecast unavailable"}</p>
      ${n && n.idle_by !== null && n.idle_by > this.now ? E`<p class="muted">Assuming no further activity</p>` : O}
      <div class="people">${i.map((e) => {
			let t = (e.entity ? this.hass?.states[e.entity] : void 0)?.attributes.entity_picture, n = typeof t == "string" && (t.startsWith("/") || /^https?:\/\//.test(t)) ? t : void 0;
			return E`<div class="person">${n ? E`<img src=${n} alt="" @error=${(e) => {
				e.target.hidden = !0;
			}}>` : E`<span class="initial">${e.name.slice(0, 1)}</span>`}
          <span>${e.name}<br><span class="muted">Estimated${e.confidence === null ? "" : ` · ${Math.round(e.confidence * 100)}%`}</span></span></div>`;
		})}</div>
      ${i.length ? O : E`<p class="muted">No current person estimate</p>`}
      ${n?.devices.length ? E`<p class="eyebrow">Estimated devices</p><ul>${n.devices.map((e) => E`<li>${e.name ?? e.entity}${e.confidence === null ? "" : ` · ${Math.round(e.confidence * 100)}%`}</li>`)}</ul>` : O}
      ${e.fixtures?.length ? E`<p class="eyebrow">Placed devices</p><ul>${e.fixtures.map((e) => E`<li>${e.name || this.hass?.states[e.entity]?.attributes.friendly_name || e.entity} · ${this.hass?.states[e.entity]?.state ?? "unavailable"}</li>`)}</ul>` : O}
    </section>`;
	}
};
K([L({ attribute: !1 })], Q.prototype, "room", void 0), K([L({ attribute: !1 })], Q.prototype, "live", void 0), K([L({ attribute: !1 })], Q.prototype, "telemetry", void 0), K([L({ attribute: !1 })], Q.prototype, "hass", void 0), K([L({ type: Number })], Q.prototype, "now", void 0), Q = K([I("al-room-hud")], Q);
//#endregion
//#region src/al-floorplan-viewer.ts
var gn = [
	["reset", "Reset view"],
	["top", "Top view"],
	["left", "Rotate left"],
	["right", "Rotate right"],
	["up", "Tilt up"],
	["down", "Tilt down"],
	["in", "Zoom in"],
	["out", "Zoom out"]
], _n = (e) => Number(e.toFixed(2)).toLocaleString(), $ = class extends F {
	constructor(...e) {
		super(...e), this.room = "", this.hovered = "", this.lights = {}, this.settings = {}, this.dashboard = !1, this.controlsVisible = !1, this.fullscreen = !1, this.settingsError = "", this.options = J(), this.live = null, this.scope = "", this.selected = "", this.now = Date.now() / 1e3, this.loading = !1, this.error = "", this.model = {
			parts: [],
			groups: [],
			scopes: [],
			issues: []
		}, this.sequence = 0, this.fullscreenChanged = () => {
			let e = this.fullscreen;
			this.fullscreen = this.ownsFullscreen(), e && !this.fullscreen && this.settings.ambient && this.leaveAmbient();
		}, this.escapeView = (e) => {
			e.key === "Escape" && (this.settings.ambient || this.ownsFullscreen()) && (e.preventDefault(), this.exitView());
		};
	}
	static {
		this.styles = [Xt, o`
    :host { display: block; padding: 16px; }
    h2 { margin: 0 0 6px; }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 12px 0; }
    label { display: flex; align-items: center; gap: 8px; }
    button, select { font: inherit; color: var(--primary-text-color); background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #aaa); border-radius: 6px; padding: 8px 10px; }
    button { cursor: pointer; } button:disabled { cursor: default; opacity: .5; }
    :host([room]:not([room=""])) .viewer { display:block; }
    :host([room]:not([room=""])) aside, :host([room]:not([room=""])) .settings, :host([room]:not([room=""])) .toolbar label, :host([room]:not([room=""])) .live-status { display:none; }
    .viewer { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 16px; }
    .viewport { position: relative; min-width: 0; height: clamp(320px, 58vh, 680px); border-radius: 12px; overflow: hidden;
      background: radial-gradient(ellipse at 50% 35%, #263a49, #101c27 80%); border: 1px solid #425461; }
    al-room-hud { position:absolute; top:64px; left:14px; width:min(280px,calc(100% - 28px)); max-height:calc(100% - 130px); overflow:auto; pointer-events:auto; }
    #scene { position: absolute; inset: 0; }
    .overlay { position: absolute; inset: 0; display: grid; place-content: center; padding: 28px; text-align: center;
      color: #e2edf3; background: #14212bc9; }
    .overlay button { color: #eef6fa; background: #304a5b; }
    .legend { color: #d0e0e9; position: absolute; left: 16px; bottom: 12px; pointer-events: none; font-size: 12px; }
    .gradient { display: inline-block; width: 72px; height: 8px; border-radius: 8px; margin: 0 6px;
      background: linear-gradient(to right, #5fbad2, #ffbc66); }
    .groups { max-height: 440px; overflow: auto; }
    .group { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;
      margin: 4px 0; text-align: left; border-color: transparent; }
    .group[aria-pressed="true"] { border-color: var(--primary-color, #03a9f4); background: var(--secondary-background-color, #eee); }
    .group-name { overflow-wrap: anywhere; } .reading { white-space: nowrap; font-size: 12px; }
    .selection { padding-top: 12px; border-top: 1px solid var(--divider-color, #aaa); }
    .selection h3 { margin-bottom: 6px; } .selection p { margin: 8px 0; }
    .issues { margin-top: 12px; } .help { font-size: 13px; }
    .settings { margin-top:16px; } .settings label { margin:10px 0; } textarea { width:100%; box-sizing:border-box; font:inherit; }
    .ambient-toggle { display:none; }
    .view-actions { position:absolute; z-index:3; right:12px; top:12px; display:flex; gap:8px; flex-wrap:wrap; max-width:calc(100% - 24px); }
    #exit-view { min-height:44px; }
    :host(:fullscreen) { overflow:auto; background:var(--card-background-color,#020304); } .alert { color:#ff7365; font-weight:600; }
    :host([ambient]) .stale {position:absolute; z-index:2; bottom:60px; left:20px; color:#bec8ce;}
    :host([ambient]) .sensor-status { position:absolute; z-index:2; bottom:32px; left:20px; color:#a7b2b9; }
    :host([scheme="night"]) .viewport, :host([scheme="security"]) .viewport { background:#020304; }
    :host([ambient]) { position:relative; padding:0; background:#020304; min-height:100%; }
    :host([ambient]) .viewer { display:block; }
    :host([ambient]) .viewport { height:100dvh; border:0; border-radius:0; }
    :host([ambient]) .ambient-toggle { display:block; }
    :host([ambient]) .alert { position:absolute; z-index:2; top:12px; left:20px; }
    :host([ambient]:not([show-controls])) h2, :host([ambient]:not([show-controls])) > p:not(.alert):not(.sensor-status):not(.stale),
    :host([ambient]:not([show-controls])) .toolbar, :host([ambient]:not([show-controls])) aside,
    :host([ambient]:not([show-controls])) .settings, :host([ambient]:not([show-controls])) .issues { display:none; }
    :host([ambient]:not([show-controls])) .legend { opacity:.6; }
    @media (max-width: 760px) { .viewer { grid-template-columns: minmax(0, 1fr); } .groups { max-height: 220px; } }
  `];
	}
	connectedCallback() {
		super.connectedCallback(), document.addEventListener("fullscreenchange", this.fullscreenChanged), this.addEventListener("keydown", this.escapeView), this.now = Date.now() / 1e3, this.timer = setInterval(() => {
			document.visibilityState === "visible" && (this.now = Date.now() / 1e3);
		}, 1e3), this.requestUpdate();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), document.removeEventListener("fullscreenchange", this.fullscreenChanged), this.removeEventListener("keydown", this.escapeView), clearInterval(this.timer), this.stopRenderer();
	}
	ownsFullscreen() {
		return this.getRootNode().fullscreenElement === this;
	}
	leaveAmbient() {
		this.controlsVisible = !1, this.removeAttribute("show-controls"), this.changeSettings({
			...this.settings,
			ambient: !1
		});
	}
	async exitView() {
		if (this.leaveAmbient(), this.ownsFullscreen()) try {
			await document.exitFullscreen();
		} catch {
			this.settingsError = "Could not exit browser fullscreen. Try Escape or your device's Back control.";
		}
		await this.updateComplete, this.renderRoot.querySelector("[data-camera=\"reset\"]")?.focus({ preventScroll: !0 });
	}
	willUpdate(e) {
		this.options = J(this.settings);
		let t = Y(this.options.rules, this.hass?.states ?? {});
		t?.scheme && (this.options = J({
			...this.settings,
			scheme: t.scheme
		})), this.toggleAttribute("ambient", this.options.ambient), this.setAttribute("scheme", this.options.scheme), e.has("config") && (this.model = this.config ? sn(this.config) : {
			parts: [],
			groups: [],
			scopes: [],
			issues: []
		}, this.model.scopes.some((e) => e.id === this.scope) || (this.scope = ""), this.model.groups.some((e) => e.id === this.selected) || (this.selected = ""));
	}
	updated(e) {
		if (!this.isConnected) return;
		e.has("settings") && this.options.ambient && !e.get("settings")?.ambient && this.renderRoot.querySelector("#exit-view")?.focus({ preventScroll: !0 });
		let t = q(this.model.parts, this.room || this.scope);
		if (!t.length && !this.config?.site?.features.length) {
			this.stopRenderer();
			return;
		}
		if (!this.renderer && !this.loading && !this.error) {
			queueMicrotask(() => {
				this.startRenderer();
			});
			return;
		}
		(e.has("config") || e.has("scope") || e.has("room") || this.groundZ !== this.options.ground_z) && (this.renderer?.setParts(t, this.options.ground_z, this.config?.site), this.groundZ = this.options.ground_z), this.updateAppearance();
	}
	stopRenderer() {
		this.sequence++, this.renderer?.dispose(), this.renderer = void 0, this.loading = !1;
	}
	async startRenderer() {
		if (!this.isConnected || this.renderer || this.loading || this.error || !q(this.model.parts, this.room || this.scope).length && !this.config?.site?.features.length) return;
		let e = ++this.sequence;
		this.loading = !0;
		try {
			let { FloorplanRenderer: t } = await import("./shared-GDOeghPX.js");
			if (e !== this.sequence || !this.isConnected) return;
			let n = this.renderRoot.querySelector("#scene");
			this.renderer = new t(n, (e) => {
				this.selected = e;
			}, (e) => {
				this.stopRenderer(), this.error = e;
			}, (e) => {
				this.hovered = e;
			}, (e) => {
				this.dispatchEvent(new CustomEvent("al-fixture-position", {
					detail: e,
					bubbles: !0,
					composed: !0
				}));
			}), this.renderer.setParts(q(this.model.parts, this.room || this.scope), this.options.ground_z, this.config?.site), this.groundZ = this.options.ground_z, this.updateAppearance();
		} catch {
			e === this.sequence && (this.renderer?.dispose(), this.renderer = void 0, this.renderRoot.querySelector("#scene")?.replaceChildren(), this.error = "The 3D view could not start. WebGL may be unavailable. Use the group list or retry.");
		} finally {
			e === this.sequence && (this.loading = !1);
		}
	}
	updateAppearance() {
		let e = this.hass?.states ?? {}, t = Object.fromEntries(this.model.groups.map((t) => [t.id, Z(this.lights[t.id], e)]));
		this.renderer?.setPlacement(this.placementHeight), this.renderer?.setActivity(this.live, this.now, this.room || this.selected, this.options, t, Y(this.options.rules, e), e);
	}
	changeSettings(e) {
		try {
			J(e), this.settings = e, this.settingsError = "", this.dispatchEvent(new CustomEvent("al-viewer-settings", {
				detail: e,
				bubbles: !0,
				composed: !0
			}));
		} catch (e) {
			this.settingsError = String(e.message);
		}
	}
	settingsControl() {
		return E`<details class="settings"><summary>Viewer settings</summary>
      <p class="muted">Settings apply to this display. Ground Z uses your floorplan's coordinates.</p>
      <button type="button" @click=${async () => {
			try {
				await this.requestFullscreen();
			} catch {
				this.settingsError = "Fullscreen is unavailable here. Use your dashboard's kiosk layout.";
			}
		}}>Enter fullscreen</button>
      <label>Scheme <select .value=${this.settings.scheme ?? "standard"} @change=${(e) => this.changeSettings({
			...this.settings,
			scheme: e.target.value
		})}>
        ${[
			"standard",
			"night",
			"security"
		].map((e) => E`<option value=${e} .selected=${e === (this.settings.scheme ?? "standard")}>${e}</option>`)}
      </select></label>
      <label>Ground Z <input type="number" step="any" .value=${this.settings.ground_z?.toString() ?? ""} placeholder="Not specified"
        @change=${(e) => {
			let t = e.target.value;
			this.changeSettings({
				...this.settings,
				ground_z: t === "" ? void 0 : Number(t)
			});
		}}></label>
      <button type="button" @click=${() => {
			let e = [...q(this.model.parts, this.scope)].sort((e, t) => e.low - t.low)[0];
			e && this.changeSettings({
				...this.settings,
				ground_z: Number((e.high - .9144).toFixed(3))
			});
		}}>Basement top 3 ft above ground</button>
      ${[
			"light_fill",
			"ambient",
			"auto_rotate",
			"focus_activity"
		].map((e) => E`<label><input type="checkbox" .checked=${this.options[e]}
        @change=${(t) => this.changeSettings({
			...this.settings,
			[e]: t.target.checked
		})}>${{
			light_fill: "Ceiling glow from lights",
			ambient: "Ambient fullscreen layout",
			auto_rotate: "Slow orbit",
			focus_activity: "Focus on new activity"
		}[e]}</label>`)}
      <label>Seconds per rotation <input id="rotation-period" type="number" min="1" step="any" .value=${String(this.options.rotation_period)}
        @change=${(e) => this.changeSettings({
			...this.settings,
			rotation_period: Number(e.target.value)
		})}></label>
      <p class="help muted">Larger values rotate more slowly. Default: 180 seconds per revolution.</p>
      <label>Maximum ceiling brightness <input type="range" min="0" max="1" step="0.01" .value=${String(this.options.fill_brightness)} @input=${(e) => this.changeSettings({
			...this.settings,
			fill_brightness: Number(e.target.value)
		})}></label>
      <details><summary>Advanced settings (JSON)</summary><p>Configure color_thresholds and binary-sensor rules here.</p>
        <textarea aria-label="Viewer settings JSON" rows="12" .value=${JSON.stringify(this.settings, null, 2)}></textarea>
        <button type="button" @click=${() => {
			try {
				this.changeSettings(JSON.parse(this.renderRoot.querySelector("textarea").value));
			} catch (e) {
				this.settingsError = String(e);
			}
		}}>Apply viewer settings</button>
      </details>${this.settingsError ? E`<p role="alert">${this.settingsError}</p>` : O}
    </details>`;
	}
	reading(e) {
		let t = rn(this.live, e.id, this.now);
		return t.status === "live" ? `${_n(t.value)} / ${_n(t.max)}` : t.status === "stale" ? "Stale" : "No reading";
	}
	openGroup(e) {
		this.dispatchEvent(new CustomEvent("al-open-group", {
			detail: e.path,
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		let e = q(this.model.parts, this.room || this.scope), t = q(this.model.groups, this.scope), n = this.model.groups.find((e) => e.id === this.selected), r = Y(this.options.rules, this.hass?.states ?? {}), i = this.live && this.now - this.live.now > 10;
		return E`
      <div class="view-actions">
      ${this.options.ambient || this.fullscreen ? E`<button id="exit-view" type="button" @click=${() => void this.exitView()}>${this.options.ambient ? "Exit ambient" : "Exit fullscreen"}</button>` : O}
      <button class="ambient-toggle" type="button" @click=${() => {
			this.controlsVisible = !this.controlsVisible, this.toggleAttribute("show-controls", this.controlsVisible);
		}}> ${this.controlsVisible ? "Hide controls" : "Show controls"}</button>
      </div>
      <h2>${this.room ? this.model.groups.find((e) => e.id === this.room)?.label ?? "Room preview" : "Your home, live"}</h2>
      <p class="muted">Room color shows activity from blue (0) to red (5). Ceiling glow shows your lights.</p>
      <div class="toolbar">
        <label>Floor or building <select id="scope" .value=${this.scope} @change=${(e) => {
			this.scope = e.target.value, this.selected = "";
		}}>
          <option value="" .selected=${this.scope === ""}>Whole home</option>
          ${this.model.scopes.map((e) => E`<option value=${e.id} .selected=${this.scope === e.id}>
            ${e.label} (${z[e.kind]?.label ?? "Group"})
          </option>`)}
        </select></label>
        ${gn.map(([e, t]) => E`<button type="button" data-camera=${e}
          ?disabled=${!this.renderer || !!this.error} @click=${() => this.renderer?.cameraAction(e)}>${t}</button>`)}
      </div>
      <p role="status" class=${`muted live-status ${i || !this.live ? "stale" : ""}`}>${i ? "Activity readings are stale. Waiting for a fresh update…" : this.live ? "Live activity · updates every 2 seconds" : "Waiting for live activity readings…"}</p>
      ${r ? E`<p class="alert" role="status">${r.label ?? r.entity}</p>` : O}
      ${this.options.rules.some((e) => !["on", "off"].includes(this.hass?.states[e.entity]?.state ?? "")) ? E`<p class="sensor-status" role="status">Some alert sensors are unavailable</p>` : O}
      <div class="viewer">
        <div class="viewport" aria-describedby="floorplan-help">
          <div id="scene"></div>
          ${!this.room && (this.hovered || this.selected) ? E`<al-room-hud .room=${this.model.parts.find((e) => e.id === (this.hovered || this.selected))} .live=${this.live} .telemetry=${this.telemetry} .hass=${this.hass} .now=${this.now} @al-dismiss-hud=${() => {
			this.selected = "", this.hovered = "";
		}}></al-room-hud>` : O}
          ${!e.length && !this.config?.site?.features.length ? E`<div class="overlay"><p>${this.model.groups.length ? "No placed geometry in this view. See the geometry notes below." : "Import a floorplan below to see your home in 3D."}</p></div>` : this.error ? E`<div class="overlay"><p role="alert">${this.error}</p>
              <button id="retry" type="button" @click=${() => {
			this.error = "";
		}}>Retry 3D view</button></div>` : this.loading ? E`<div class="overlay"><p role="status">Loading 3D view…</p></div>` : O}
          ${e.length && !this.error ? E`<div class="legend">${this.options.color_thresholds.map((e) => E`<span style=${`color:${e.color};margin-right:12px`}>● ${e.value}</span>`)} · no fill = unknown
            <br>${(this.options.ground_z ?? this.config?.site?.ground_z) === void 0 ? "Reference grid · outdoor ground unspecified" : `Ground Z: ${this.options.ground_z ?? this.config?.site?.ground_z} m`}</div>` : O}
        </div>
        <aside aria-label="Floorplan groups">
          <div class="groups" aria-label="Select a group">
            ${t.map((e) => E`<button type="button" class="group" data-group=${e.id}
              aria-pressed=${e.id === this.selected ? "true" : "false"}
              @click=${() => {
			this.selected = e.id;
		}}>
              <span class="group-name" style=${`padding-inline-start:${Math.min(e.ancestors.length, 5) * 8}px`}>${e.label}</span>
              <span class="reading">${this.reading(e)}</span>
            </button>`)}
          </div>
          ${n ? E`<section class="selection" aria-label="Selected group">
            <h3>${n.label}</h3><p>${z[n.kind]?.label ?? "Group"} · ${n.id}</p>
            <p>Activity: <strong>${this.reading(n)}</strong></p>
            <p>${Z(this.lights[n.id], this.hass?.states ?? {}).unknown ? "Some light readings unavailable" : `Lights: ${Math.round(Z(this.lights[n.id], this.hass?.states ?? {}).brightness * 100)}%`}</p>
            ${this.dashboard ? O : E`<button id="open-group" type="button" @click=${() => this.openGroup(n)}>Open group settings</button>`}
          </section>` : E`<p class="muted">Select a room in the scene or a group in this list.</p>`}
        </aside>
      </div>
      ${this.settingsControl()}
      <p id="floorplan-help" class="help muted">Drag to rotate · Right-drag to pan · Scroll or pinch to zoom.
        Camera buttons and the group list also work with a keyboard. Each group shows its own activity level.</p>
      ${this.model.issues.length ? E`<details class="issues" open><summary>Geometry notes (${this.model.issues.length})</summary>
        <ul>${this.model.issues.map((e) => E`<li>${e.label}: ${e.reason}</li>`)}</ul>
      </details>` : O}
    `;
	}
};
K([L({ attribute: !1 })], $.prototype, "telemetry", void 0), K([L({
	type: String,
	reflect: !0
})], $.prototype, "room", void 0), K([L({ attribute: !1 })], $.prototype, "placementHeight", void 0), K([R()], $.prototype, "hovered", void 0), K([L({ attribute: !1 })], $.prototype, "config", void 0), K([L({ attribute: !1 })], $.prototype, "hass", void 0), K([L({ attribute: !1 })], $.prototype, "lights", void 0), K([L({ attribute: !1 })], $.prototype, "settings", void 0), K([L({ type: Boolean })], $.prototype, "dashboard", void 0), K([R()], $.prototype, "controlsVisible", void 0), K([R()], $.prototype, "fullscreen", void 0), K([R()], $.prototype, "settingsError", void 0), K([L({ attribute: !1 })], $.prototype, "live", void 0), K([R()], $.prototype, "scope", void 0), K([R()], $.prototype, "selected", void 0), K([R()], $.prototype, "now", void 0), K([R()], $.prototype, "loading", void 0), K([R()], $.prototype, "error", void 0), $ = K([I("al-floorplan-viewer")], $);
//#endregion
//#region src/floorplan-store.ts
var vn = /* @__PURE__ */ new WeakMap(), yn = class {
	constructor(e) {
		this.hass = e, this.listeners = /* @__PURE__ */ new Set(), this.generation = 0, this.pending = !1, this.snapshot = {}, this.visibility = () => {
			document.visibilityState === "visible" ? this.refresh() : clearTimeout(this.timer);
		};
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot), this.listeners.size === 1 && (document.addEventListener("visibilitychange", this.visibility), this.refresh()), () => {
			this.listeners.delete(e), this.listeners.size || (clearTimeout(this.timer), this.generation++, this.pending = !1, document.removeEventListener("visibilitychange", this.visibility));
		};
	}
	async refresh() {
		if (this.pending || !this.listeners.size || document.visibilityState !== "visible") return;
		clearTimeout(this.timer), this.pending = !0;
		let e = this.generation;
		try {
			let t = await this.hass.callWS({ type: "activity_levels/floorplan/dashboard" });
			if (e !== this.generation) return;
			JSON.stringify(t.config) === JSON.stringify(this.snapshot.data?.config) && (t.config = this.snapshot.data.config), this.snapshot = { data: t };
		} catch (t) {
			e === this.generation && (this.snapshot = {
				...this.snapshot,
				error: String(t?.message ?? t)
			});
		} finally {
			if (e === this.generation) {
				this.pending = !1;
				for (let e of this.listeners) e(this.snapshot);
				this.listeners.size && document.visibilityState === "visible" && (this.timer = setTimeout(() => void this.refresh(), 2e3));
			}
		}
	}
};
function bn(e) {
	let t = e.connection ?? e.callWS, n = vn.get(t);
	return n || (n = new yn(e), vn.set(t, n)), n.hass = e, n;
}
//#endregion
export { Qe as $, Jt as A, G as B, Dt as C, F as Ct, Mt as D, be as Dt, At as E, E as Et, It as F, vt as G, B as H, Lt as I, ft as J, _t as K, Gt as L, Ht as M, Ut as N, Kt as O, o as Ot, Yt as P, et as Q, Bt as R, yt as S, I as St, Ot as T, D as Tt, ut as U, mt as V, gt as W, $e as X, ct as Y, tt as Z, Nt as _, We as _t, rn as a, Ie as at, qt as b, R as bt, en as c, Ue as ct, Xt as d, qe as dt, z as et, bt as f, Je as ft, Tt as g, Re as gt, Ft as h, Ke as ht, J as i, Xe as it, jt as j, kt as k, Zt as l, ze as lt, St as m, He as mt, Z as n, at as nt, $t as o, Ye as ot, wt as p, Pe as pt, lt as q, dn as r, Ze as rt, Qt as s, Ve as st, bn as t, it as tt, K as u, Be as ut, Pt as v, Ge as vt, xt as w, O as wt, Ct as x, L as xt, Wt as y, Le as yt, Vt as z };
