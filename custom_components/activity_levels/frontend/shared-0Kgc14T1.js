//#region src/kinds.ts
var e = [
	"property",
	"structure",
	"floor",
	"area",
	"outside"
], t = [
	"open",
	"door",
	"stairs",
	"exterior_door"
], n = "door", r = {
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
}, i = {
	open: "Open (no door)",
	door: "Door",
	stairs: "Stairs",
	exterior_door: "Exterior door"
}, a = {
	property: [
		"property",
		"structure",
		"outside"
	],
	structure: ["floor", "area"],
	floor: ["area"],
	area: ["area"],
	outside: ["outside"]
}, o = ["property"], s = /* @__PURE__ */ new Set(["area", "outside"]), c = (e) => e === null ? o : a[e];
function l(e, t) {
	return t.length <= e.length ? !1 : e.every((e, n) => t[n] === e);
}
//#endregion
//#region src/store.ts
function u(e, t) {
	let n = e;
	for (let e of t) {
		if (n == null) return;
		n = n[e];
	}
	return n;
}
function d(e) {
	return Array.isArray(e) ? [...e] : { ...e };
}
function f(e, t, n) {
	if (t.length === 0) throw Error("empty path");
	let r = d(e), i = r;
	for (let e = 0; e < t.length - 1; e++) {
		let n = t[e], r = d(i[n]);
		i[n] = r, i = r;
	}
	return n(i, t[t.length - 1]), r;
}
function ee(e, t, n) {
	return f(e, t, (e, t) => {
		e[t] = n;
	});
}
function p(e, t) {
	return f(e, t, (e, t) => {
		Array.isArray(e) ? e.splice(t, 1) : delete e[t];
	});
}
function m(e, t, n, r) {
	return f(e, [...t, n], (e) => {
		e.splice(n, 0, r);
	});
}
function te(e, t, n, r) {
	return f(e, [...t, n], (e) => {
		let t = e, [i] = t.splice(n, 1);
		t.splice(r, 0, i);
	});
}
function ne(e, t, n, r) {
	return r === n || r === n + 1 ? e : te(e, t, n, r > n ? r - 1 : r);
}
var h = 1e3, g = class {
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
		t !== void 0 && t === this.coalesceKey && n - this.coalesceAt < h || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = t ?? null, this.coalesceAt = n;
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
}, _ = (e) => ({
	ok: !1,
	reason: e
}), v = (e) => ({
	list: e.slice(0, -1),
	index: e[e.length - 1]
}), y = (e) => e[e.length - 1] === "stimuli";
function b(e, t, n, r) {
	let i = u(e, t);
	if (i === void 0) return _("that node is gone");
	let a = u(e, n);
	if (!Array.isArray(a)) return _("there is nothing to drop into there");
	if (r < 0 || r > a.length) return _("that is not a slot in this list");
	let o = y(v(t).list);
	if (o !== y(n)) return _(o ? "a stimulus belongs to a group, not beside one" : "that is not a stimulus");
	if (o) return { ok: !0 };
	let s = i;
	if (l(t, n) || x(t, n.slice(0, -1))) return _("a group cannot go into itself");
	let d = n.slice(0, -1), f;
	if (n.length === 1) f = null;
	else {
		let t = u(e, d);
		if (t === void 0) return _("that group is gone");
		f = t.kind;
	}
	return c(f).includes(s.kind) ? { ok: !0 } : _(f === null ? "every root group is a property" : `a ${f} cannot contain a ${s.kind}`);
}
var x = (e, t) => e.length === t.length && e.every((e, n) => t[n] === e);
function S(e, t, n) {
	let { list: r, index: i } = v(e), a = [...t], o = a[r.length];
	return r.length < a.length && x(r, a.slice(0, r.length)) && typeof o == "number" && o > i && (a[r.length] = o - 1), {
		parent: a,
		index: x(r, t) && n > i ? n - 1 : n
	};
}
function C(e, t, n, r) {
	let { index: i } = v(t);
	if (x(v(t).list, n) && (r === i || r === i + 1)) return e;
	let a = u(e, t), o = p(e, t), { parent: s, index: c } = S(t, n, r);
	return m(o, s, c, a);
}
//#endregion
//#region src/model.ts
var w = (e, t) => ({
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
	presence: T(),
	stimuli: [],
	children: []
}), re = "presence", T = () => ({
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
}), E = (e) => typeof e == "string" ? e : e.id, D = (e) => typeof e != "string" && e.one_way, O = (e) => typeof e == "string" ? n : e.connection;
function k(e) {
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
function A(e, t) {
	let n = [];
	for (let { group: r } of k(e)) if (r.id !== t) for (let e of r.adjacent ?? []) E(e) === t && n.push({
		group: r,
		edge: {
			id: t,
			connection: O(e),
			one_way: D(e)
		}
	});
	return n;
}
var j = {
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
}, M = (e) => ({
	tracker: e,
	name: null,
	kind: "other",
	companion: null,
	signals: {
		activity: null,
		steps: null,
		battery_state: null
	}
}), N = () => ({
	name: null,
	person: null,
	devices: []
}), P = (e) => ({
	...j,
	...e.presence ?? {}
}), F = (e) => ({
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
}), I = (e) => e.label !== null && e.label.trim() !== "" ? e.label : e.id, L = (e) => ({
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
}), R = (e, t) => t.precision ?? e.defaults.precision;
function z(e, t) {
	return e.toFixed(Math.min(100, Math.max(0, Math.trunc(t))));
}
function B(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		t.add(e.id), e.children.forEach(n);
	};
	return e.groups.forEach(n), t;
}
function V(e) {
	return new Set(k(e).filter(({ group: e }) => s.has(e.kind)).map(({ group: e }) => e.id));
}
function H(e) {
	return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
var U = (e) => new Set(e.envelopes.map((e) => e.id));
function W(e, t) {
	let n = H(t);
	if (!e.has(n)) return n;
	let r = 2;
	for (; e.has(`${n}_${r}`);) r++;
	return `${n}_${r}`;
}
var G = (e, t) => W(B(e), t), K = (e, t) => W(U(e), t);
function q(e, t) {
	let n = [], r = (e) => {
		e.stimuli.some((e) => e.envelope === t) && n.push(e.id), e.children.forEach(r);
	};
	return e.groups.forEach(r), {
		defaults: e.defaults.envelope === t,
		groups: n
	};
}
function J(e, t, n) {
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
var Y = (e, t) => u(e, t), ie = (e, t) => u(e, t), X = (e) => e.slice(0, -2), ae = (e) => e[e.length - 2] === "stimuli" ? X(e) : e, Z = (e, t) => e.envelopes.find((n) => n.id === (t ?? e.defaults.envelope));
function oe(e, t) {
	let n = Z(e, t.envelope), r = e.defaults, i = (e, t, n) => e ?? t ?? n;
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
function se(e, t, n) {
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
var Q = (e, t) => Array.isArray(e) && e.length === t && e.every((e) => typeof e == "number" && Number.isFinite(e));
function ce(e) {
	if (!Array.isArray(e) || e.length < 3 || e.length > 4096) return null;
	let t = [];
	for (let n of e) {
		if (!Q(n, 2)) return null;
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
function le(e) {
	let t = [], n = [], r = k(e), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
	for (let { group: e, path: o, parent: s } of r) {
		let r = s ? [...i.get(s.id).ancestors, s.id] : [], c = {
			id: e.id,
			label: e.name ?? e.id,
			kind: e.kind,
			path: o,
			ancestors: r
		};
		if (i.set(e.id, c), e.bounds === void 0 && e.points === void 0) continue;
		[e.id, ...r].forEach((e) => a.add(e));
		let l = (t) => n.push({
			id: e.id,
			label: c.label,
			reason: t
		}), u = e.bounds;
		if (u === void 0) {
			l("Footprint has no vertical bounds. Add bounds in Code to place it in 3D.");
			continue;
		}
		if (!Array.isArray(u) || u.length !== 2 || !Q(u[0], 3) || !Q(u[1], 3) || u[0].some((e, t) => e >= u[1][t])) {
			l("Invalid bounds in the draft.");
			continue;
		}
		let d = e.points === void 0 ? [
			[u[0][0], u[0][1]],
			[u[1][0], u[0][1]],
			[u[1][0], u[1][1]],
			[u[0][0], u[1][1]]
		] : ce(e.points);
		if (!d) {
			l("Invalid footprint in the draft.");
			continue;
		}
		t.push({
			...c,
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
	let o = [...i.values()].filter((e) => a.has(e.id));
	return {
		parts: t,
		groups: o,
		issues: n,
		scopes: o.filter((e) => [
			"property",
			"structure",
			"floor"
		].includes(e.kind))
	};
}
var $ = (e, t) => t ? e.filter((e) => e.id === t || e.ancestors.includes(t)) : e;
//#endregion
export { G as A, ne as B, I as C, V as D, oe as E, m as F, e as G, t as H, b as I, c as J, r as K, C as L, k as M, g as N, H as O, u as P, S as R, Z as S, J as T, i as U, ee as V, n as W, N as _, O as a, X as b, A as c, Y as d, ae as f, T as g, M as h, re as i, K as j, ie as k, R as l, w as m, le as n, E as o, D as p, s as q, $ as r, B as s, se as t, z as u, F as v, q as w, P as x, L as y, p as z };
