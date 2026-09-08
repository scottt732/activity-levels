import { A as e, B as t, C as n, D as r, E as i, F as a, I as o, L as s, M as c, N as l, O as u, P as d, R as f, S as p, T as ee, V as m, _ as te, a as ne, b as re, c as ie, d as ae, f as h, g as oe, h as se, j as ce, k as le, l as ue, m as g, o as _, p as de, r as fe, s as v, t as pe, u as me, v as he, w as ge, x as _e, y as ve, z as y } from "./shared-nLqZnEmT.js";
//#region src/entities.ts
var ye = (e) => `switch.${e}_presence_simulation`, be = (e) => `sensor.${e}_expected_activity`, xe = (e) => `sensor.${e}_activity_anomaly`, Se = [
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
], Ce = ["ha-yaml-editor", "ha-state-icon"], we = 2500, Te = 8e3;
function Ee(e) {
	let t;
	return {
		promise: new Promise((n) => {
			t = setTimeout(n, e);
		}),
		cancel: () => clearTimeout(t)
	};
}
async function De(e, t, n) {
	let r = Ee(t);
	try {
		return await Promise.race([e, r.promise.then(() => n)]);
	} finally {
		r.cancel();
	}
}
async function Oe() {
	try {
		await ((await window.loadCardHelpers?.())?.createCardElement({
			type: "entities",
			entities: []
		}))?.constructor?.getConfigElement?.();
	} catch {}
}
async function ke() {
	if (customElements.get("ha-yaml-editor")) return;
	let e;
	try {
		await customElements.whenDefined("ha-selector"), e = document.createElement("ha-selector"), e.selector = { object: {} }, e.style.display = "none", document.body.appendChild(e), await customElements.whenDefined("ha-yaml-editor");
	} catch {} finally {
		e?.remove();
	}
}
async function Ae(e = Te, t = we) {
	let n = [...Se, ...Ce];
	if (n.every((e) => customElements.get(e))) return {
		ok: !0,
		missing: [],
		optionalMissing: []
	};
	await De(Promise.all([Oe(), ke()]).then(() => void 0), t, void 0);
	let r = await Promise.all(n.map((t) => De(customElements.whenDefined(t).then(() => !0), e, !1))), i = n.filter((e, t) => !r[t]), a = Ce, o = i.filter((e) => !a.includes(e));
	return {
		ok: o.length === 0,
		missing: o,
		optionalMissing: i.filter((e) => a.includes(e))
	};
}
//#endregion
//#region src/store.ts
function b(e, t) {
	let n = e;
	for (let e of t) {
		if (n == null) return;
		n = n[e];
	}
	return n;
}
function je(e) {
	return Array.isArray(e) ? [...e] : { ...e };
}
function Me(e, t, n) {
	if (t.length === 0) throw Error("empty path");
	let r = je(e), i = r;
	for (let e = 0; e < t.length - 1; e++) {
		let n = t[e], r = je(i[n]);
		i[n] = r, i = r;
	}
	return n(i, t[t.length - 1]), r;
}
function x(e, t, n) {
	return Me(e, t, (e, t) => {
		e[t] = n;
	});
}
function Ne(e, t) {
	return Me(e, t, (e, t) => {
		Array.isArray(e) ? e.splice(t, 1) : delete e[t];
	});
}
function Pe(e, t, n, r) {
	return Me(e, [...t, n], (e) => {
		e.splice(n, 0, r);
	});
}
function Fe(e, t, n, r) {
	return Me(e, [...t, n], (e) => {
		let t = e, [i] = t.splice(n, 1);
		t.splice(r, 0, i);
	});
}
function Ie(e, t, n, r) {
	return r === n || r === n + 1 ? e : Fe(e, t, n, r > n ? r - 1 : r);
}
var Le = 1e3, Re = class {
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
		t !== void 0 && t === this.coalesceKey && n - this.coalesceAt < Le || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = t ?? null, this.coalesceAt = n;
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
}, S = (e) => ({
	ok: !1,
	reason: e
}), ze = (e) => ({
	list: e.slice(0, -1),
	index: e[e.length - 1]
}), Be = (e) => e[e.length - 1] === "stimuli";
function Ve(e, t, n, r) {
	let i = b(e, t);
	if (i === void 0) return S("that node is gone");
	let a = b(e, n);
	if (!Array.isArray(a)) return S("there is nothing to drop into there");
	if (r < 0 || r > a.length) return S("that is not a slot in this list");
	let o = Be(ze(t).list);
	if (o !== Be(n)) return S(o ? "a stimulus belongs to a group, not beside one" : "that is not a stimulus");
	if (o) return { ok: !0 };
	let s = i;
	if (se(t, n) || He(t, n.slice(0, -1))) return S("a group cannot go into itself");
	let c = n.slice(0, -1), l;
	if (n.length === 1) l = null;
	else {
		let t = b(e, c);
		if (t === void 0) return S("that group is gone");
		l = t.kind;
	}
	return g(l).includes(s.kind) ? { ok: !0 } : S(l === null ? "every root group is a property" : `a ${l} cannot contain a ${s.kind}`);
}
var He = (e, t) => e.length === t.length && e.every((e, n) => t[n] === e);
function Ue(e, t, n) {
	let { list: r, index: i } = ze(e), a = [...t], o = a[r.length];
	return r.length < a.length && He(r, a.slice(0, r.length)) && typeof o == "number" && o > i && (a[r.length] = o - 1), {
		parent: a,
		index: He(r, t) && n > i ? n - 1 : n
	};
}
function We(e, t, n, r) {
	let { index: i } = ze(t);
	if (He(ze(t).list, n) && (r === i || r === i + 1)) return e;
	let a = b(e, t), o = Ne(e, t), { parent: s, index: c } = Ue(t, n, r);
	return Pe(o, s, c, a);
}
//#endregion
//#region src/model.ts
var Ge = (e, t) => ({
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
	presence: qe(),
	stimuli: [],
	children: []
}), Ke = "presence", qe = () => ({
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
}), Je = (e) => typeof e == "string" ? e : e.id, Ye = (e) => typeof e != "string" && e.one_way, Xe = (e) => typeof e == "string" ? me : e.connection;
function C(e) {
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
function Ze(e, t) {
	let n = [];
	for (let { group: r } of C(e)) if (r.id !== t) for (let e of r.adjacent ?? []) Je(e) === t && n.push({
		group: r,
		edge: {
			id: t,
			connection: Xe(e),
			one_way: Ye(e)
		}
	});
	return n;
}
var Qe = {
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
}, $e = (e) => ({
	tracker: e,
	name: null,
	kind: "other",
	companion: null,
	signals: {
		activity: null,
		steps: null,
		battery_state: null
	}
}), et = () => ({
	name: null,
	person: null,
	devices: []
}), w = (e) => ({
	...Qe,
	...e.presence ?? {}
}), tt = (e) => ({
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
}), nt = (e) => e.label !== null && e.label.trim() !== "" ? e.label : e.id, rt = (e) => ({
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
}), it = (e, t) => t.precision ?? e.defaults.precision;
function at(e, t) {
	return e.toFixed(Math.min(100, Math.max(0, Math.trunc(t))));
}
function ot(e) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		t.add(e.id), e.children.forEach(n);
	};
	return e.groups.forEach(n), t;
}
function st(e) {
	return new Set(C(e).filter(({ group: e }) => de.has(e.kind)).map(({ group: e }) => e.id));
}
function ct(e) {
	return e.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^[^a-z]+/, "") || "group";
}
var lt = (e) => new Set(e.envelopes.map((e) => e.id));
function ut(e, t) {
	let n = ct(t);
	if (!e.has(n)) return n;
	let r = 2;
	for (; e.has(`${n}_${r}`);) r++;
	return `${n}_${r}`;
}
var dt = (e, t) => ut(ot(e), t), ft = (e, t) => ut(lt(e), t);
function pt(e, t) {
	let n = [], r = (e) => {
		e.stimuli.some((e) => e.envelope === t) && n.push(e.id), e.children.forEach(r);
	};
	return e.groups.forEach(r), {
		defaults: e.defaults.envelope === t,
		groups: n
	};
}
function mt(e, t, n) {
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
var T = (e, t) => b(e, t), ht = (e, t) => b(e, t), gt = (e) => e.slice(0, -2), _t = (e) => e[e.length - 2] === "stimuli" ? gt(e) : e, vt = (e, t) => e.envelopes.find((n) => n.id === (t ?? e.defaults.envelope));
function yt(e, t) {
	let n = vt(e, t.envelope), r = e.defaults, i = (e, t, n) => e ?? t ?? n;
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
//#region src/navigation.ts
var bt = "activity_levels.mixer.expanded", xt = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]), St = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function Ct(e) {
	return {
		expanded: new Set(e.groups.map((e) => e.id)),
		selection: St(e)
	};
}
function wt(e, t) {
	let n = [], r = (e, i, a) => {
		e.forEach((e, o) => {
			let s = [...i, o], c = e.children.length > 0, l = c && t.expanded.has(e.id);
			n.push({
				path: s,
				id: e.id,
				depth: a,
				hasChildren: c,
				expanded: l
			}), l && r(e.children, [...s, "children"], a + 1);
		});
	};
	return r(e.groups, ["groups"], 0), n;
}
function Tt(e, t) {
	let n = wt(e, t), r = [], i = [], a = [], o = [], s = 0, c = (e) => {
		for (; o.length > 0 && o[o.length - 1].depth >= e;) o.pop().band.colEnd = i.length + 1;
	};
	for (let t of n) {
		if (c(t.depth), i.push("strip"), r.push(i.length), !t.hasChildren) continue;
		let n = T(e, t.path)?.name ?? t.id, l = {
			id: t.id,
			label: n,
			depth: t.depth,
			colStart: i.length,
			colEnd: i.length + 1,
			expanded: t.expanded
		};
		a.push(l), t.expanded && o.push({
			band: l,
			depth: t.depth
		}), s = Math.max(s, t.depth + 1);
	}
	return c(0), {
		columns: r,
		kinds: i,
		bands: a,
		rows: s
	};
}
function Et(e, t) {
	switch (t.type) {
		case "toggle": {
			let n = new Set(e.expanded);
			return n.delete(t.id) || n.add(t.id), {
				...e,
				expanded: n
			};
		}
		case "select": return {
			...e,
			selection: t.path
		};
		case "arrow": {
			let n = wt(t.config, e);
			if (n.length === 0) return e;
			let r = e.selection, i = r === null ? -1 : n.findIndex((e) => xt(e.path, r)), a = (((i === -1 && t.delta < 0 ? n.length : i) + t.delta) % n.length + n.length) % n.length;
			return {
				...e,
				selection: n[a].path
			};
		}
		case "home":
		case "end": {
			let n = wt(t.config, e);
			return n.length === 0 ? e : {
				...e,
				selection: (t.type === "home" ? n[0] : n[n.length - 1]).path
			};
		}
		case "sync": {
			let { config: n } = t, r = ot(n), i = [...e.expanded].filter((e) => r.has(e));
			return {
				expanded: i.length === e.expanded.size ? e.expanded : new Set(i),
				selection: e.selection !== null && b(n, e.selection) !== void 0 ? e.selection : St(n)
			};
		}
	}
}
function Dt(e, t, n) {
	if (n === null) return t;
	let r = n[n.length - 2] === "stimuli" ? n.slice(0, -2) : n, i = new Set(t), a = !1;
	for (let t = 2; t + 2 <= r.length; t += 2) {
		let n = b(e, r.slice(0, t));
		if (n === void 0 || typeof n.id != "string") break;
		i.has(n.id) || (i.add(n.id), a = !0);
	}
	return a ? i : t;
}
function Ot(e) {
	let t;
	try {
		t = localStorage.getItem(bt);
	} catch {
		return null;
	}
	if (t === null) return null;
	try {
		let n = JSON.parse(t);
		if (!Array.isArray(n)) return null;
		let r = ot(e);
		return new Set(n.filter((e) => typeof e == "string" && r.has(e)));
	} catch {
		return null;
	}
}
function kt(e) {
	try {
		localStorage.setItem(bt, JSON.stringify([...e]));
	} catch {}
}
function At(e) {
	let t = Ct(e), n = Ot(e);
	return n === null ? t : {
		...t,
		expanded: n
	};
}
var jt = "activity_levels.mixer.edit";
function Mt() {
	try {
		return localStorage.getItem(jt) === "true";
	} catch {
		return !1;
	}
}
function Nt(e) {
	try {
		localStorage.setItem(jt, e ? "true" : "false");
	} catch {}
}
//#endregion
//#region src/save-flow.ts
async function Pt(e, t) {
	try {
		let n = await t.validate(e);
		if (!n.ok) return {
			errors: n.errors,
			banner: {
				kind: "error",
				text: `${n.errors.length} problem(s) to fix before saving.`
			},
			reload: !1
		};
		let r = await t.save(e);
		return r.ok ? {
			errors: [],
			banner: {
				kind: "info",
				text: "Saved. Activity Levels is reloading."
			},
			reload: !0
		} : {
			errors: r.errors,
			banner: {
				kind: "error",
				text: r.errors[0]?.message ?? "Save failed"
			},
			reload: !1
		};
	} catch (e) {
		return {
			errors: null,
			banner: {
				kind: "error",
				text: `Save failed: ${e instanceof Error ? e.message : String(e)}`
			},
			reload: !1
		};
	}
}
//#endregion
//#region src/timeseries.ts
var Ft = {
	"24h": 86400,
	"7d": 604800,
	"30d": 2592e3
}, It = {
	off: 0,
	"24h": 86400,
	"7d": 604800
};
function Lt(e, t, n) {
	return {
		start: e - Ft[t],
		end: e,
		resolution: t === "24h" ? "5m" : "1h",
		forecastUntil: n === "off" ? void 0 : e + It[n]
	};
}
function Rt(e, t, n) {
	let r = t - e || 1;
	return (t) => (t - e) / r * n;
}
function zt(e, t, n = 4) {
	let r = e || 1, i = t - 2 * n;
	return (e) => t - n - e / r * i;
}
function Bt(e, t) {
	t = Math.max(4, t);
	let n = e.length;
	if (n <= t) return e;
	let r = Math.max(1, Math.floor(t / 2)), i = Math.ceil(n / r), a = [];
	for (let t = 0; t < n; t += i) {
		let r = Math.min(t + i, n), o = e[t], s = e[t];
		for (let n = t + 1; n < r; n++) {
			let t = e[n];
			t[1] < o[1] && (o = t), t[1] > s[1] && (s = t);
		}
		o === s ? a.push(o) : o[0] <= s[0] ? a.push(o, s) : a.push(s, o);
	}
	return a[0] !== e[0] && (a[0] = e[0]), a[a.length - 1] !== e[n - 1] && (a[a.length - 1] = e[n - 1]), a;
}
function Vt(e, t, n) {
	return e.length === 0 ? "" : e.map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ");
}
function Ht(e, t, n, r = Infinity) {
	if (e.p75.length === 0) return "";
	let i = (t) => t.map((t, n) => [e.t0 + n * e.step, t]), a = Bt(i(e.p75), r), o = Bt(i(e.p25), r).reverse();
	return `${[...a, ...o].map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ")} Z`;
}
function Ut(e, t) {
	return e[t].map((t, n) => [e.t0 + n * e.step, t]);
}
function Wt(e, t, n, r, i) {
	let a = e[e.length - 1];
	return !a || t <= a[0] || t < r || t > i ? [] : [a, [t, n]];
}
function Gt(e, t, n) {
	return e.map(([e, r, i]) => ({
		x0: t(e),
		x1: t(r ?? n),
		tag: i
	}));
}
function Kt(e, t) {
	if (e.length === 0) return -1;
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i][0] < t ? n = i + 1 : r = i;
	}
	return n > 0 && Math.abs(e[n - 1][0] - t) <= Math.abs(e[n][0] - t) ? n - 1 : n;
}
function qt(e) {
	return [
		e.group_id,
		e.start,
		e.end,
		e.resolution,
		e.include_children ?? !1,
		e.forecast_until ?? ""
	].join("|");
}
//#endregion
//#region src/transport.ts
function Jt(e, t) {
	let n = Math.min(2592e3, Math.max(3600, e.end - e.start)), r = Math.min(t + 604800, e.start + n);
	return {
		start: r - n,
		end: r
	};
}
function Yt(e, t, n, r) {
	let i = e.end - e.start, a = Math.min(2592e3, Math.max(3600, i * n)), o = t - (t - e.start) / i * a;
	return Jt({
		start: o,
		end: o + a
	}, r);
}
function Xt(e, t, n = Infinity) {
	if (!e.length || t < e[0][0] || t > e[e.length - 1][0]) return null;
	let r = 0, i = e.length - 1;
	for (; r < i;) {
		let n = Math.floor((r + i) / 2);
		e[n][0] < t ? r = n + 1 : i = n;
	}
	let a = e[r];
	if (a[0] === t || r === 0) return a[1];
	let o = e[r - 1];
	return a[0] - o[0] > n ? null : o[1] + (t - o[0]) / (a[0] - o[0]) * (a[1] - o[1]);
}
//#endregion
//#region src/mixer-preview.ts
function Zt(e, t, n, r, i = 450) {
	if (n > r) {
		let t = e.forecast;
		if (!t || t.step <= 0) return null;
		let r = Xt(Ut(t, "p50"), n);
		return r !== null && Number.isFinite(r) ? r : null;
	}
	let a = e.series[t] ?? [], o = 0, s = a.length;
	for (; o < s;) {
		let e = o + s >>> 1;
		a[e][0] < n ? o = e + 1 : s = e;
	}
	let c = a[o], l = a[o - 1];
	if (c?.[0] === n) return Number.isFinite(c[1]) ? c[1] : null;
	if (!l || !c || c[0] - l[0] > i) return null;
	let u = l[1] + (c[1] - l[1]) * (n - l[0]) / (c[0] - l[0]);
	return Number.isFinite(u) ? u : null;
}
var Qt = class {
	constructor() {
		this.cache = /* @__PURE__ */ new Map(), this.generation = 0, this.active = 0, this.waiting = [];
	}
	cancel() {
		this.generation++;
	}
	async slot() {
		this.active >= 4 ? await new Promise((e) => this.waiting.push(e)) : this.active++;
	}
	release() {
		let e = this.waiting.shift();
		e ? e() : this.active--;
	}
	peek(e, t, n, r = "5m") {
		let { start: i, end: a, until: o } = $t(t, n, r), s = {}, c = !0;
		for (let l of e) {
			let e = this.cache.get(JSON.stringify([
				l,
				i,
				a,
				o,
				r
			]));
			!e || Date.now() - e.at > 6e4 ? (c = !1, s[l] = null) : s[l] = Zt(e.data, l, t, n, r === "5m" ? 450 : 5400);
		}
		return {
			values: s,
			complete: c
		};
	}
	async load(e, t, r, i, a = "5m") {
		let o = ++this.generation, s = {}, c = !1, { start: l, end: u, until: d } = $t(r, i, a), f = 0;
		return await Promise.all(Array.from({ length: Math.min(4, t.length) }, async () => {
			for (; f < t.length && o === this.generation;) {
				let p = t[f++], ee = JSON.stringify([
					p,
					l,
					u,
					d,
					a
				]), m = this.cache.get(ee);
				if (!m || Date.now() - m.at > 6e4) {
					await this.slot();
					try {
						if (o !== this.generation) return;
						for (m = {
							at: Date.now(),
							data: await n(e, {
								group_id: p,
								start: l,
								end: u,
								resolution: a,
								include_children: !1,
								...d === void 0 ? {} : { forecast_until: d }
							})
						}, this.cache.set(ee, m); this.cache.size > 128;) this.cache.delete(this.cache.keys().next().value);
					} catch {
						c = !0, s[p] = null;
						continue;
					} finally {
						this.release();
					}
				}
				s[p] = Zt(m.data, p, r, i, a === "5m" ? 450 : 5400);
			}
		})), {
			values: s,
			failed: c
		};
	}
};
function $t(e, t, n) {
	let r = e > t, i = Math.floor(e / 3600) * 3600, a = Math.floor(t / 60) * 60, o = n === "5m" ? 300 : 3600, s = r ? a : Math.min(i + 3600 + o, a);
	return {
		start: r ? s - o : i - o,
		end: s,
		...r ? { until: Math.min(i + 3900, s + 604800) } : {}
	};
}
//#endregion
//#region src/activity-levels-panel.ts
var en = [
	"mixer",
	"groups",
	"envelopes",
	"defaults",
	"patterns",
	"presence",
	"paths",
	"floorplans",
	"code"
], tn = 2e3, nn = 1e4, rn = 3e5, an = 1500, on = "activity_levels.timeline", sn = [
	"24h",
	"7d",
	"30d"
], cn = [
	"off",
	"24h",
	"7d"
], ln = {
	range: "7d",
	horizon: "24h",
	showChannels: !0,
	showLights: !0
};
function un(e) {
	if (e === null) return null;
	let t = JSON.parse(e);
	return !sn.includes(t.range) || !cn.includes(t.horizon) ? null : {
		range: t.range,
		horizon: t.horizon,
		showChannels: t.showChannels !== !1,
		showLights: t.showLights !== !1
	};
}
var E = class extends o {
	constructor(...e) {
		super(...e), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = ln, this.preview = null, this.previewError = !1, this.previewData = new Qt(), this.previewSeq = 0, this.transportWindow = null, this.onTransport = (e) => {
			let t = e.detail.time;
			if (this.transportWindow = e.detail.window, this.previewSeq++, this.previewError = !1, t === null || !Number.isFinite(t)) {
				this.previewData.cancel(), clearTimeout(this.previewTimer), this.previewTimer = void 0, this.preview = null;
				return;
			}
			let n = this.live?.now ?? Date.now() / 1e3, r = this.previewIds(t, n), i = this.previewData.peek(r, t, n, this.previewResolution);
			this.preview = {
				time: t,
				values: i.values,
				mode: t > n ? "forecast" : "history"
			}, !i.complete && this.previewTimer === void 0 && (this.previewTimer = setTimeout(() => {
				this.previewTimer = void 0, this.preview && this.loadPreview(this.preview.time, this.live?.now ?? Date.now() / 1e3, this.previewSeq);
			}, 100));
		}, this.openMixerGroup = (e) => {
			this.select(e.detail), this.selectTab(this.tabs.indexOf("groups"));
		}, this.codeStatus = null, this.yamlEditor = !0, this.tabFocus = 0, this.liveSeq = 0, this.profileAt = 0, this.onVisibilityChange = () => this.updatePolling(), this.onChange = (e) => {
			e.structural && (this.errors = []), this.tab !== "code" && (this.codeStatus = null), this.setConfig(e.detail, e.coalesceKey);
		}, this.onCodeStatus = (e) => {
			this.codeStatus = e.detail, this.errors = e.detail.errors;
		}, this.onNav = (e) => {
			let t = Et(this.nav, e.detail);
			t.expanded !== this.nav.expanded && kt(t.expanded), this.nav = t, this.selection = t.selection, this.preview && this.onTransport(new CustomEvent("al-transport", { detail: {
				time: this.preview.time,
				window: this.transportWindow
			} }));
		}, this.onLiveRefresh = () => {
			this.pollLive();
		}, this.onRebuild = async (e) => {
			try {
				let { rebuilt: t } = await r(this.hass, e.detail?.force === !0);
				this.banner = t ? {
					kind: "info",
					text: "Profile rebuilt."
				} : {
					kind: "warning",
					text: "Rebuild skipped (external profile)."
				}, await this.refreshProfile(!0);
			} catch (e) {
				this.banner = {
					kind: "error",
					text: `Could not rebuild the profile: ${e.message}`
				};
			}
		}, this.onSimToggle = async (e) => {
			let { gid: t, on: n } = e.detail;
			try {
				await oe(this.hass, "switch", n ? "turn_on" : "turn_off", { entity_id: ye(t) });
			} catch (e) {
				this.banner = {
					kind: "error",
					text: `Could not ${n ? "start" : "stop"} the simulation for ${t}: ${e.message}`
				};
			}
		}, this.onTimelineRange = (e) => {
			this.timeline = e.detail;
			try {
				localStorage.setItem(on, JSON.stringify(e.detail));
			} catch {}
		}, this.onTabsKeydown = (e) => {
			let t = this.tabs.length - 1;
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
				default: return;
			}
			e.preventDefault();
		};
	}
	static {
		this.styles = [v];
	}
	get previewResolution() {
		let e = Math.min(this.live?.now ?? Date.now() / 1e3, this.transportWindow?.end ?? Infinity);
		return (this.transportWindow ? e - Math.min(this.transportWindow.start, e - 3600) : this.timeline.range === "24h" ? 86400 : 604800) <= 86400 ? "5m" : "1h";
	}
	previewIds(e, t) {
		let n = this.draft?.config;
		if (!n) return [];
		let r = wt(n, this.nav).map((e) => e.id);
		return e > t ? r.filter((e) => this.profileState?.trained && Object.keys(this.profileState.profile.groups[e]?.expected ?? {}).length > 0) : r;
	}
	async loadPreview(e, t, n) {
		if (!this.draft?.config || n !== this.previewSeq || !this.isConnected) return;
		let r = this.previewIds(e, t), i = await this.previewData.load(this.hass, r, e, t, this.previewResolution);
		n !== this.previewSeq || !this.isConnected || (this.preview = {
			time: e,
			values: i.values,
			mode: e > t ? "forecast" : "history"
		}, this.previewError = i.failed);
	}
	get timelinePrecisions() {
		let e = this.draft?.config, t = {};
		if (!e) return t;
		let n = (r) => {
			for (let i of r) t[i.id] = this.live?.groups[i.id]?.precision ?? it(e, i), n(i.children);
		};
		return n(e.groups), t;
	}
	get timelineLabels() {
		let e = {}, t = (n) => {
			for (let r of n) e[r.id] = r.name ?? r.id, t(r.children);
		};
		return t(this.draft?.config.groups ?? []), e;
	}
	get tabs() {
		return en;
	}
	async connectedCallback() {
		super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
		let { ok: e, missing: t, optionalMissing: n } = await Ae();
		this.missing = e ? [] : t, this.yamlEditor = !n.includes("ha-yaml-editor"), await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer(), clearTimeout(this.previewTimer), this.previewTimer = void 0, this.previewSeq++, this.previewData.cancel();
	}
	async load() {
		try {
			let { config: e, inferred: t, warnings: n } = await he(this.hass);
			this.draft = new Re(e), this.inferred = t, this.warnings = n, this.syncTabs(), this.nav = At(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
		} catch (e) {
			this.banner = {
				kind: "error",
				text: `Could not load configuration: ${e.message}`
			};
		}
	}
	get blocked() {
		let e = this.codeStatus;
		return e !== null && (!e.valid || e.errors.length > 0);
	}
	setConfig(e, t) {
		this.draft?.set(e, t), this.syncNav(), this.requestUpdate();
	}
	syncNav() {
		this.syncTabs();
		let e = this.draft?.config;
		if (!e) return;
		let t = this.selection, n = Et({
			...this.nav,
			selection: t
		}, {
			type: "sync",
			config: e
		});
		this.nav = t === null ? {
			...n,
			selection: null
		} : n, this.selection = this.nav.selection !== null && this.nav.selection.length > 0 ? this.nav.selection : null;
	}
	syncTabs() {
		this.tabs.includes(this.tab) || this.selectTab(0);
	}
	select(e) {
		let t = this.draft?.config;
		if (this.selection = e, e === null || !t) {
			this.nav = {
				...this.nav,
				selection: e
			};
			return;
		}
		let n = Dt(t, this.nav.expanded, e);
		n !== this.nav.expanded && kt(n), this.nav = {
			expanded: n,
			selection: e
		};
	}
	async save() {
		let e = this.draft;
		if (e) {
			this.busy = !0, this.updatePolling();
			try {
				let t = await Pt(e.config, {
					validate: (e) => c(this.hass, e),
					save: (e) => le(this.hass, e)
				});
				t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((e) => setTimeout(e, an)), await this.load());
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
		this.liveOn = e, !e && !this.liveRequired && (this.live = null), this.updatePolling();
	}
	get liveRequired() {
		return this.tab === "mixer" || this.tab === "floorplans";
	}
	get patternsVisible() {
		return this.tab === "mixer" || this.tab === "patterns" || this.tab === "groups";
	}
	updatePolling() {
		let e = !this.busy && document.visibilityState === "visible";
		this.updateLivePolling(e), this.updateSimPolling(e);
	}
	updateLivePolling(e) {
		if (!((this.liveOn || this.liveRequired) && e)) {
			this.clearLiveTimer();
			return;
		}
		this.liveTimer === void 0 && (this.pollLive(), this.liveTimer = window.setInterval(() => void this.pollLive(), tn));
	}
	updateSimPolling(e) {
		if (!(this.patternsVisible && e)) {
			this.clearSimTimer();
			return;
		}
		this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => void this.pollSim(), nn));
	}
	async pollLive() {
		let e = ++this.liveSeq;
		try {
			let t = await p(this.hass);
			e === this.liveSeq && (this.live = t);
		} catch {}
	}
	async pollSim() {
		try {
			this.simLog = await _e(this.hass);
		} catch {}
	}
	clearLiveTimer() {
		this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
	}
	clearSimTimer() {
		this.simTimer !== void 0 && (clearInterval(this.simTimer), this.simTimer = void 0);
	}
	async refreshProfile(e = !1) {
		if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < rn)) try {
			this.profileState = await re(this.hass), this.profileAt = Date.now();
		} catch {}
	}
	restoreTimeline() {
		try {
			this.timeline = un(localStorage.getItem(on)) ?? ln;
		} catch {}
	}
	selectTab(e) {
		let t = this.tabs[e];
		t !== void 0 && (t !== "mixer" && t !== "floorplans" && !this.liveOn && (this.live = null), t !== "mixer" && (clearTimeout(this.previewTimer), this.previewTimer = void 0, this.previewSeq++, this.previewData.cancel(), this.preview = null), this.tab = t, this.tabFocus = e, this.updatePolling(), this.refreshProfile());
	}
	focusTab(e) {
		this.tabFocus = e, this.updateComplete.then(() => {
			this.renderRoot.querySelectorAll("[role=\"tab\"]")[e]?.focus();
		});
	}
	render() {
		if (this.missing.length) return this.renderMissing();
		let e = this.draft;
		return y`
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
          ${this.tabs.map((e, t) => y`<button
              type="button"
              id="tab-${e}"
              class="tab ${this.tab === e ? "active" : ""}"
              role="tab"
              aria-selected=${this.tab === e ? "true" : "false"}
              aria-controls="tabpanel"
              tabindex=${t === this.tabFocus ? 0 : -1}
              @click=${() => this.selectTab(t)}
            >
              ${e[0].toUpperCase() + e.slice(1)}
            </button>`)}
        </div>
        <div id="tabpanel" role="tabpanel" aria-labelledby="tab-${this.tab}">
          ${e ? this.renderTab(e) : y`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
	}
	renderLiveToggle() {
		return this.liveRequired ? s : y`
      <span class="muted">Live</span>
      <ha-switch
        .checked=${this.liveOn}
        @change=${(e) => this.toggleLive(e.target.checked)}
      ></ha-switch>
    `;
	}
	renderMissing() {
		return y`
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
		let e = this.banner;
		return e ? y`<ha-alert
      alert-type=${e.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
			this.banner = null;
		}}
      >${e.text}</ha-alert
    >` : s;
	}
	renderInferred() {
		let e = this.inferred.length;
		return e === 0 ? s : y`<ha-alert class="inferred-notice" alert-type="warning">
      ${e} ${e === 1 ? "group has" : "groups have"} an inferred kind — check them and save. Until you
      do, the kinds above are a guess and nothing has been written.
      <ha-button
        class="inferred-fix"
        slot="action"
        @click=${() => {
			this.selectTab(this.tabs.indexOf("groups")), this.select(this.inferred[0].split("/").map((e) => /^\d+$/.test(e) ? Number(e) : e));
		}}
        >Show me</ha-button
      >
    </ha-alert>`;
	}
	renderWarnings() {
		return this.warnings.length === 0 ? s : y`<ha-alert class="config-warnings" alert-type="warning">
      <ul>
        ${this.warnings.map((e) => y`<li>${e}</li>`)}
      </ul>
    </ha-alert>`;
	}
	renderTab(e) {
		switch (this.tab) {
			case "mixer": return this.renderMixer(e);
			case "groups": return y`<div class="layout ${this.narrow ? "narrow" : ""}">
          <al-tree
            .hass=${this.hass}
            .config=${e.config}
            .selection=${this.selection}
            .errors=${this.errors}
            .live=${this.live}
            @al-select=${(e) => this.select(e.detail)}
            @al-change=${this.onChange}
          ></al-tree>
          <div>${this.renderEditor(e)}</div>
        </div>`;
			case "envelopes": return y`<al-envelopes
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
			case "defaults": return y`<al-defaults
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
			case "patterns": return y`<al-patterns
          .hass=${this.hass}
          .config=${e.config}
          .profileState=${this.profileState}
          .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild}
        ></al-patterns>`;
			case "code": return y`<al-code
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .available=${this.yamlEditor}
          @al-change=${this.onChange}
          @al-code-status=${this.onCodeStatus}
        ></al-code>`;
			case "floorplans": return y`<al-floorplans .hass=${this.hass} .config=${e.config} .live=${this.live}
          .disabled=${this.busy} @al-change=${this.onChange} @al-open-group=${this.openMixerGroup}></al-floorplans>`;
			case "paths": return y`<al-paths .hass=${this.hass} .config=${e.config} .narrow=${this.narrow}></al-paths>`;
			case "presence": return y`<al-presence
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-presence>`;
		}
	}
	renderMixer(e) {
		let t = e.config;
		if (t.groups.length === 0) return this.renderMixerEmpty();
		let n = this.nav.selection, r = n === null ? void 0 : T(t, _t(n));
		return y`<div class="rows">
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
        .minDays=${t.defaults.patterns?.min_days ?? 14}
        .paused=${this.busy}
        .narrow=${this.narrow}
        .labels=${this.timelineLabels}
        .precisions=${this.timelinePrecisions}
        @al-transport=${this.onTransport}
        @al-timeline-range=${this.onTimelineRange}
      ></al-timeline>
      ${this.previewError ? y`<ha-alert alert-type="warning">Some preview data could not be loaded. Missing values are shown as —.</ha-alert>` : s}
      <al-mixer
        .preview=${this.preview}
        @al-open-group=${this.openMixerGroup}
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

    </div>`;
	}
	renderMixerEmpty() {
		return y`<div class="rows">
      <ha-card class="mixer-empty">
        <p class="muted">Add your first group in Groups.</p>
        <ha-button @click=${() => this.selectTab(this.tabs.indexOf("groups"))}>Go to Groups</ha-button>
      </ha-card>
    </div>`;
	}
	renderEditor(e) {
		let t = this.selection;
		return t ? t[t.length - 2] === "stimuli" ? y`<al-stimulus-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>` : y`<div><al-group-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          @al-change=${this.onChange}
          @al-select=${(e) => this.select(e.detail)}
        ></al-group-editor>
        <al-strip-controls .statusOnly=${!0} .hass=${this.hass} .config=${e.config}
          .path=${t} .live=${this.live} .profileState=${this.profileState} .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild} @al-sim-toggle=${this.onSimToggle}></al-strip-controls>
        </div>` : y`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
	}
};
_([d({ attribute: !1 })], E.prototype, "hass", void 0), _([d({ type: Boolean })], E.prototype, "narrow", void 0), _([l()], E.prototype, "draft", void 0), _([l()], E.prototype, "inferred", void 0), _([l()], E.prototype, "warnings", void 0), _([l()], E.prototype, "tab", void 0), _([l()], E.prototype, "selection", void 0), _([l()], E.prototype, "nav", void 0), _([l()], E.prototype, "errors", void 0), _([l()], E.prototype, "banner", void 0), _([l()], E.prototype, "live", void 0), _([l()], E.prototype, "liveOn", void 0), _([l()], E.prototype, "busy", void 0), _([l()], E.prototype, "missing", void 0), _([l()], E.prototype, "profileState", void 0), _([l()], E.prototype, "simLog", void 0), _([l()], E.prototype, "timeline", void 0), _([l()], E.prototype, "preview", void 0), _([l()], E.prototype, "previewError", void 0), _([l()], E.prototype, "codeStatus", void 0), _([l()], E.prototype, "yamlEditor", void 0), _([l()], E.prototype, "tabFocus", void 0), E = _([a("activity-levels-panel")], E);
//#endregion
//#region src/duration.ts
function D(e) {
	let t = Math.floor(e / 3600), n = Math.floor((e - t * 3600) / 60), r = Math.round((e - t * 3600 - n * 60) * 1e3) / 1e3, i = Math.floor(r), a = Math.round((r - i) * 1e3);
	return a === 0 ? {
		hours: t,
		minutes: n,
		seconds: i
	} : {
		hours: t,
		minutes: n,
		seconds: i,
		milliseconds: a
	};
}
function O(e) {
	if (!e) return null;
	let t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
	return Math.round(t * 1e3) / 1e3;
}
function k(e) {
	if (e === 0) return "0s";
	let t = [], n = e;
	for (let [e, r] of [
		["d", 86400],
		["h", 3600],
		["m", 60]
	]) {
		let i = Math.floor(n / r);
		i > 0 && (t.push(`${i}${e}`), n -= i * r);
	}
	return n = Math.round(n * 1e3) / 1e3, n > 0 && t.push(`${n}s`), t.join(" ");
}
//#endregion
//#region src/entity-states.ts
var A = ["on", "off"], dn = {
	automation: A,
	binary_sensor: A,
	fan: A,
	humidifier: A,
	input_boolean: A,
	light: A,
	remote: A,
	siren: A,
	switch: A,
	update: A,
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
	climate: [
		"heat",
		"cool",
		"heat_cool",
		"auto",
		"dry",
		"fan_only",
		"off"
	],
	cover: [
		"open",
		"opening",
		"closing",
		"closed"
	],
	device_tracker: ["home", "not_home"],
	lock: [
		"locked",
		"unlocked",
		"locking",
		"unlocking",
		"open",
		"opening",
		"jammed"
	],
	media_player: [
		"playing",
		"paused",
		"buffering",
		"idle",
		"standby",
		"on",
		"off"
	],
	person: ["home", "not_home"],
	timer: [
		"active",
		"paused",
		"idle"
	],
	vacuum: [
		"cleaning",
		"returning",
		"docked",
		"idle",
		"paused",
		"error"
	],
	water_heater: [
		"eco",
		"electric",
		"performance",
		"high_demand",
		"heat_pump",
		"gas",
		"off"
	]
}, fn = (e) => e.split(".")[0] ?? "", pn = (e) => {
	let t = e.replace(/_/g, " ");
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function mn(e, t, n) {
	let r = fn(t), i = e?.states[t]?.attributes.device_class, a = [typeof i == "string" ? `component.${r}.entity_component.${i}.state.${n}` : null, `component.${r}.entity_component._.state.${n}`];
	if (typeof e?.localize == "function") for (let t of a) {
		if (t === null) continue;
		let n = e.localize(t);
		if (typeof n == "string" && n !== "") return n;
	}
	return pn(n);
}
function hn(e, t, n) {
	let r = [...dn[fn(t)] ?? []];
	for (let i of [e?.states[t]?.state, ...n]) typeof i == "string" && i !== "" && !r.includes(i) && r.push(i);
	return r.map((n) => ({
		value: n,
		label: mn(e, t, n)
	}));
}
function gn(e, t) {
	let n = e?.states[t];
	if (!n) return null;
	let r = e?.formatEntityState?.(n);
	return typeof r == "string" && r !== "" ? r : mn(e, t, n.state);
}
function _n(e, t, n) {
	let r = n.length === 1 ? n[0] : void 0;
	if (r === void 0) return {
		enter: "When it enters the active states",
		leave: "When it leaves them"
	};
	let i = mn(e, t, r);
	return {
		enter: `When it becomes ${i}`,
		leave: `When it stops being ${i}`
	};
}
//#endregion
//#region src/errors.ts
var j = (e) => e.join("/");
function M(e, t) {
	let n = j(t), r = {};
	for (let t of e) {
		if (!t.path.startsWith(n + "/")) continue;
		let e = t.path.slice(n.length + 1);
		e.includes("/") || (r[e] = t.message);
	}
	return r;
}
function vn(e, t) {
	let n = j(t);
	return e.filter((e) => e.path === n || e.path.startsWith(n + "/")).length;
}
//#endregion
//#region src/events.ts
function N(e, t, n) {
	let r = new CustomEvent("al-change", {
		detail: e,
		bubbles: !0,
		composed: !0
	});
	return t !== void 0 && (r.coalesceKey = t), n && (r.structural = !0), r;
}
var yn = (e, t) => new CustomEvent("al-code-status", {
	detail: {
		valid: e,
		errors: t
	},
	bubbles: !0,
	composed: !0
}), bn = (e) => new CustomEvent("al-select", {
	detail: e,
	bubbles: !0,
	composed: !0
}), xn = (e, t) => new CustomEvent(e, {
	detail: t,
	bubbles: !0,
	composed: !0
}), Sn = () => xn("al-select-strip", null), Cn = (e) => xn("al-level-override", { value: e }), wn = (e) => xn("al-mute-toggle", { muted: e }), Tn = () => xn("al-reset", null), En = (e) => new CustomEvent("al-nav", {
	detail: e,
	bubbles: !0,
	composed: !0
}), Dn = () => new CustomEvent("al-live-refresh", {
	detail: null,
	bubbles: !0,
	composed: !0
}), On = (e) => new CustomEvent("al-timeline-range", {
	detail: e,
	bubbles: !0,
	composed: !0
}), kn = (e, t) => new CustomEvent("al-sim-toggle", {
	detail: {
		gid: e,
		on: t
	},
	bubbles: !0,
	composed: !0
}), An = (e = !1) => new CustomEvent("al-rebuild", {
	detail: { force: e },
	bubbles: !0,
	composed: !0
}), jn = (e) => new CustomEvent("al-map-select", {
	detail: { id: e },
	bubbles: !0,
	composed: !0
});
//#endregion
//#region src/tree-rows.ts
function Mn(e, t) {
	let n = [], r = (e, i, a, o, s) => {
		let c = j(i), l = e.children.length > 0 || e.stimuli.length > 0, u = l && t.has(c);
		if (n.push({
			path: i,
			depth: a,
			kind: "group",
			group: e,
			expandable: l,
			expanded: u,
			posinset: o,
			setsize: s
		}), !t.has(c)) return;
		let d = e.children.length + e.stimuli.length;
		e.children.forEach((e, t) => r(e, [
			...i,
			"children",
			t
		], a + 1, t + 1, d)), e.stimuli.forEach((t, r) => n.push({
			path: [
				...i,
				"stimuli",
				r
			],
			depth: a + 1,
			kind: "stimulus",
			stimulus: t,
			expandable: !1,
			expanded: !1,
			posinset: e.children.length + r + 1,
			setsize: d
		})), l || n.push({
			path: i,
			depth: a + 1,
			kind: "placeholder",
			group: e,
			expandable: !1,
			expanded: !1,
			posinset: 1,
			setsize: 1
		});
	};
	return e.groups.forEach((t, n) => r(t, ["groups", n], 0, n + 1, e.groups.length)), n;
}
var Nn = "activity_levels.groups_expanded";
function Pn() {
	try {
		let e = localStorage.getItem(Nn), t = e === null ? null : JSON.parse(e);
		return Array.isArray(t) ? new Set(t.filter((e) => typeof e == "string")) : /* @__PURE__ */ new Set();
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function Fn(e) {
	try {
		localStorage.setItem(Nn, JSON.stringify([...e]));
	} catch {}
}
//#endregion
//#region src/al-tree.ts
var In = (e) => e.stopPropagation(), Ln = (e) => {
	(e.key === "Enter" || e.key === " ") && e.stopPropagation();
}, Rn = "mdi:flash", zn = "text/plain", Bn = 36, P = class extends o {
	constructor(...e) {
		super(...e), this.selection = null, this.errors = [], this.live = null, this.expanded = Pn(), this.dragging = null, this.target = null, this.menu = null;
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	emitChange(e) {
		this.dispatchEvent(N(e, void 0, !0));
	}
	emitSelect(e) {
		this.dispatchEvent(bn(e));
	}
	isSelected(e) {
		return this.selection !== null && j(this.selection) === j(e);
	}
	select(e, t) {
		e.stopPropagation(), this.menu = null, this.emitSelect(t);
	}
	toggle(e) {
		let t = j(e), n = new Set(this.expanded);
		n.delete(t) || n.add(t), this.expanded = n, Fn(n);
	}
	open(e) {
		if (e.length === 0) return;
		let t = new Set(this.expanded).add(j(e));
		this.expanded = t, Fn(t);
	}
	listOf(e) {
		return {
			list: e.slice(0, -1),
			index: e[e.length - 1]
		};
	}
	addGroup(e, t, n) {
		let r = this.config;
		r && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(Pe(r, e, t, Ge(dt(r, n), n))), this.emitSelect([...e, t]));
	}
	addStimulus(e, t) {
		let n = this.config;
		if (!n) return;
		this.menu = null, this.open(e);
		let r = [...e, "stimuli"];
		this.emitChange(Pe(n, r, t, rt(""))), this.emitSelect([...r, t]);
	}
	removeNode(e, t) {
		let n = this.config;
		if (!n || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
		this.emitChange(Ne(n, e));
		let r = gt(e);
		this.emitSelect(r.length ? r : null);
	}
	tryMove(e, t, n) {
		let r = this.config;
		if (!r || !Ve(r, e, t, n).ok) return !1;
		let i = We(r, e, t, n);
		if (i === r) return !1;
		let { parent: a, index: o } = Ue(e, t, n);
		return this.open(a.slice(0, -1)), this.emitChange(i), this.emitSelect([...a, o]), !0;
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(zn, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = {
			key: j(t),
			path: t
		};
	}
	onDragEnd() {
		this.dragging = null, this.target = null;
	}
	whereIn(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || Bn, i = r / 3, a = e.clientY - n.top;
		return a < i ? "before" : a > r - i ? "after" : t.kind === "group" ? "into" : "after";
	}
	destination(e, t, n) {
		if (t === "into") {
			let t = n[n.length - 2] === "stimuli", r = t ? e.group?.stimuli : e.group?.children;
			return {
				toParent: [...e.path, t ? "stimuli" : "children"],
				index: r?.length ?? 0
			};
		}
		let { list: r, index: i } = this.listOf(e.path);
		return {
			toParent: r,
			index: t === "before" ? i : i + 1
		};
	}
	readPath(e) {
		try {
			let t = e.dataTransfer?.getData(zn) ?? "", n = JSON.parse(t);
			return Array.isArray(n) ? n : null;
		} catch {
			return null;
		}
	}
	draggedPath(e) {
		return this.dragging === null ? null : e.dataTransfer?.types.includes(zn) === !0 ? this.dragging.path : null;
	}
	onDragOver(e, t) {
		let n = this.config, r = this.draggedPath(e);
		if (!n || r === null) return;
		e.preventDefault();
		let i = this.whereIn(e, t), { toParent: a, index: o } = this.destination(t, i, r), s = Ve(n, r, a, o);
		e.dataTransfer && (e.dataTransfer.dropEffect = s.ok ? "move" : "none"), this.target = {
			key: j(t.path),
			where: i,
			verdict: s
		};
	}
	onDrop(e, t) {
		let n = this.dragging === null ? null : this.readPath(e) ?? this.dragging.path;
		if (n === null) return;
		e.preventDefault();
		let r = this.whereIn(e, t), { toParent: i, index: a } = this.destination(t, r, n);
		this.tryMove(n, i, a), this.onDragEnd();
	}
	rowElements() {
		return [...this.shadowRoot?.querySelectorAll(".row") ?? []];
	}
	focusAt(e) {
		let t = this.rowElements();
		t.length !== 0 && t[Math.max(0, Math.min(t.length - 1, e))]?.focus();
	}
	focusFrom(e, t) {
		let n = this.rowElements().indexOf(e);
		n >= 0 && this.focusAt(n + t);
	}
	focusPath(e) {
		this.shadowRoot?.querySelector(`.row[data-path="${j(e)}"]`)?.focus();
	}
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
				t.expanded ? this.toggle(t.path) : this.focusPath(gt(t.path));
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
			default: return;
		}
		e.preventDefault();
	}
	onRowKeydown(e, t) {
		if (!e.altKey) {
			this.onNavigate(e, t);
			return;
		}
		let n = this.config;
		if (!n) return;
		let { list: r, index: i } = this.listOf(t.path), a = !1;
		switch (e.key) {
			case "ArrowUp":
				a = this.tryMove(t.path, r, i - 1);
				break;
			case "ArrowDown":
				a = this.tryMove(t.path, r, i + 2);
				break;
			case "ArrowRight": {
				let e = t.kind === "group" ? b(n, [...r, i - 1]) : void 0;
				e !== void 0 && (a = this.tryMove(t.path, [
					...r,
					i - 1,
					"children"
				], e.children.length));
				break;
			}
			case "ArrowLeft": {
				if (t.kind !== "group") break;
				let e = r.slice(0, -2), n = r[r.length - 2];
				typeof n == "number" && (a = this.tryMove(t.path, e, n + 1));
				break;
			}
			default: return;
		}
		e.preventDefault(), a && e.stopPropagation();
	}
	countdown(e) {
		let t = this.live?.now;
		return e === null || t === void 0 ? null : k(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
	}
	voiceTitle(e) {
		let t = this.countdown(e.phase_ends);
		return t === null ? `Phase: ${e.phase}` : `Phase: ${e.phase}, ends in ${t}`;
	}
	meterTitle(e, t, n) {
		let r = [`${e.value} of ${t}`, `raw ${e.raw_value.toFixed(3)}`], i = n ? this.countdown(e.next_wake) : null;
		return i !== null && r.push(`next wake in ${i}`), r.join(" · ");
	}
	labelFor(e) {
		if (e.kind === "stimulus") {
			let t = e.stimulus;
			return (t === void 0 ? void 0 : this.hass?.states[t.entity])?.attributes.friendly_name ?? (t?.entity || "(no entity)");
		}
		return e.group?.name || e.group?.id || "(unnamed group)";
	}
	render() {
		let e = this.config;
		if (!e) return y`<ha-card><span class="muted">Loading…</span></ha-card>`;
		if (e.groups.length === 0) return this.renderEmpty();
		let t = Mn(e, this.expanded), n = this.tabbableKey(t);
		return y`
      <ha-card>
        <div class="tree" role="tree">
          ${t.map((t) => this.renderRow(e, t, n))}
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
		return y`
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
	tabbableKey(e) {
		let t = e.filter((e) => e.kind !== "placeholder"), n = this.selection === null ? null : j(this.selection);
		return n !== null && t.some((e) => j(e.path) === n) ? n : t.length === 0 ? "" : j(t[0].path);
	}
	renderRow(e, t, n) {
		if (t.kind === "placeholder") return y`<div class="tree-row placeholder" role="none" style="--al-indent: ${t.depth}">
        <span class="guides"></span>
        Nothing in here yet — add a stimulus or a group with the buttons on the row above.
      </div>`;
		let r = j(t.path), i = this.target?.key === r ? this.target : null, a = this.isSelected(t.path), o = [
			"row",
			"tree-row",
			a ? "selected" : "",
			this.dragging?.key === r ? "dragging" : "",
			i === null ? "" : i.verdict.ok ? `drop-${i.where}` : "illegal"
		].filter(Boolean).join(" ");
		return y`<div
      class=${o}
      style="--al-indent: ${t.depth}"
      data-path=${r}
      role="treeitem"
      tabindex=${r === n ? "0" : "-1"}
      draggable="true"
      aria-level=${t.depth + 1}
      aria-setsize=${t.setsize}
      aria-posinset=${t.posinset}
      aria-selected=${a ? "true" : "false"}
      aria-expanded=${t.expandable ? t.expanded ? "true" : "false" : s}
      @click=${(e) => this.select(e, t.path)}
      @keydown=${(e) => this.onRowKeydown(e, t)}
      @dragstart=${(e) => this.onDragStart(e, t.path)}
      @dragend=${this.onDragEnd}
      @dragover=${(e) => this.onDragOver(e, t)}
      @drop=${(e) => this.onDrop(e, t)}
    >
      <span class="guides"></span>
      ${t.expandable ? y`<ha-icon-button
            class="caret"
            label=${t.expanded ? "Collapse" : "Expand"}
            title=${t.expanded ? "Collapse" : "Expand"}
            @keydown=${Ln}
            @click=${(e) => {
			e.stopPropagation(), this.toggle(t.path);
		}}
          >
            <ha-icon icon=${t.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </ha-icon-button>` : y`<span class="caret"></span>`}
      ${this.renderIcon(t)}
      <button
        type="button"
        class="label"
        title=${t.kind === "stimulus" ? t.stimulus?.entity ?? "" : "Edit this group"}
        @keydown=${Ln}
        @click=${(e) => this.select(e, t.path)}
      >
        ${this.labelFor(t)}
      </button>
      ${i !== null && !i.verdict.ok ? y`<span class="hint">${i.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === r ? this.renderAddMenu(t) : s}
    </div>`;
	}
	renderIcon(e) {
		if (e.kind === "group" && e.group) return y`<ha-icon icon=${h[e.group.kind].icon}></ha-icon>`;
		let t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
		return t ? y`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : y`<ha-icon icon=${Rn}></ha-icon>`;
	}
	renderRowStatus(e, t) {
		let n = vn(this.errors, t.path), r = n ? y`<span class="badge" title="${n} problem(s) in this group">${n}</span>` : s;
		if (t.kind === "stimulus") {
			let n = t.stimulus, i = n === void 0 ? null : gn(this.hass, n.entity), a = b(e, gt(t.path)), o = a === void 0 ? void 0 : this.live?.voices[a.id]?.find((e) => e.label === (n?.key ?? n?.entity));
			return y`${r}${i === null ? s : y`<span class="muted chip">${i}</span>`}
      ${o ? y`<span class="chip phase ${o.phase}" title=${this.voiceTitle(o)}>${o.phase}</span>
            <span class="muted chip">${o.value.toFixed(2)}</span>` : s}`;
		}
		let i = t.group, a = i === void 0 ? void 0 : this.live?.groups[i.id], o = a?.max_value ?? i?.max_value ?? e.defaults.max_value, c = a ? Math.max(0, Math.min(100, a.value / (o || 1) * 100)) : 0;
		return y`${r}
    ${a ? y`<div class="meter" title=${this.meterTitle(a, o, t.depth === 0)}>
            <div style="width: ${c}%"></div>
          </div>
          <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : s}`;
	}
	renderActions(e) {
		let t = e.path;
		if (e.kind === "stimulus") return y`<div class="actions" @click=${In} @keydown=${Ln}>
        <ha-icon-button
          label="Delete stimulus"
          title="Delete stimulus"
          data-action="delete"
          @click=${() => this.removeNode(t, `stimulus "${this.labelFor(e)}"`)}
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </ha-icon-button>
      </div>`;
		let n = e.group;
		return n === void 0 ? y`<div class="actions"></div>` : y`<div class="actions" @click=${In} @keydown=${Ln}>
      <ha-icon-button
        label="Add stimulus"
        title="Add stimulus"
        data-action="add-stimulus"
        @click=${() => this.addStimulus(t, n.stimuli.length)}
      >
        <ha-icon icon="mdi:flash-outline"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        label="Add group"
        title="Add group"
        data-action="add-group"
        aria-haspopup="menu"
        aria-expanded=${this.menu === j(t) ? "true" : "false"}
        .disabled=${g(n.kind).length === 0}
        @click=${() => {
			this.menu = this.menu === j(t) ? null : j(t);
		}}
      >
        <ha-icon icon="mdi:folder-plus"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        label="Delete group"
        title="Delete group"
        data-action="delete"
        @click=${() => this.removeNode(t, `group "${n.name || n.id}" and everything in it`)}
      >
        <ha-icon icon="mdi:delete"></ha-icon>
      </ha-icon-button>
    </div>`;
	}
	renderAddMenu(e) {
		let t = e.group;
		return t === void 0 ? y`${s}` : y`<div
      class="add-menu"
      role="menu"
      draggable="false"
      @click=${In}
      @keydown=${Ln}
      @dragstart=${In}
    >
      ${g(t.kind).map((n) => y`<button
          type="button"
          role="menuitem"
          data-kind=${n}
          @click=${() => this.addGroup([...e.path, "children"], t.children.length, n)}
        >
          <ha-icon icon=${h[n].icon}></ha-icon>
          <span>
            <strong>${h[n].label}</strong>
            <div class="muted">${h[n].definition}</div>
          </span>
        </button>`)}
    </div>`;
	}
};
_([d({ attribute: !1 })], P.prototype, "hass", void 0), _([d({ attribute: !1 })], P.prototype, "config", void 0), _([d({ attribute: !1 })], P.prototype, "selection", void 0), _([d({ attribute: !1 })], P.prototype, "errors", void 0), _([d({ attribute: !1 })], P.prototype, "live", void 0), _([l()], P.prototype, "expanded", void 0), _([l()], P.prototype, "dragging", void 0), _([l()], P.prototype, "target", void 0), _([l()], P.prototype, "menu", void 0), P = _([a("al-tree")], P);
//#endregion
//#region src/ha-links.ts
function Vn(e, t, n) {
	return t ? y`<a href=${`/config/${e === "device" ? "devices" : "areas"}/${e}/${encodeURIComponent(t)}`}>${n}</a>` : n;
}
function Hn(e, t, n, r = "Open entity", i, a = "Open device", o = !1) {
	let c = n && (t?.states?.[n] || t?.entities?.[n]), l = i ?? (n ? t?.entities?.[n]?.device_id : null), u = () => e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: n },
		bubbles: !0,
		composed: !0
	}));
	return y`${c ? o ? y`<button type="button" @click=${u}>${r}</button>` : y`<ha-button @click=${u}>${r}</ha-button>` : s}
    ${l ? Vn("device", l, a) : s}`;
}
//#endregion
//#region src/convert.ts
var Un = (e) => e == null || e === "" ? null : e;
function Wn(e, t) {
	if (t != null) switch (e) {
		case "duration": return D(t);
		case "boolean": return t ? "true" : "false";
		default: return t;
	}
}
function Gn(e, t) {
	if (t == null || t === "") return null;
	switch (e) {
		case "duration": return O(t);
		case "boolean": return t === !0 || t === "true";
		case "number":
		case "multiplier": {
			let e = typeof t == "number" ? t : Number(t);
			return Number.isNaN(e) ? null : e;
		}
		default: return String(t);
	}
}
function Kn(e, t) {
	if (t == null) return "unset";
	switch (e) {
		case "duration": return k(t);
		case "boolean": return t ? "Yes" : "No";
		case "multiplier": return qn(t);
		default: return String(t);
	}
}
var qn = (e) => `${e.toFixed(1)}×`, Jn = [
	"kind",
	"floor_id",
	"area_id",
	"id",
	"name"
], Yn = [
	"mix",
	"null_handling",
	"gain"
], Xn = {
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
}, Zn = {
	id: "Identifies the group and its entities. Changing it re-creates them.",
	name: "Friendly name; falls back to the area's name, then to the id.",
	kind: "What this is on the property. It decides what can go inside it.",
	floor_id: "Bind this to a Home Assistant floor to reuse its name.",
	area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
	mix: "How stimuli and child groups combine into this group's value.",
	null_handling: "Whether idle contributors count as zero or drop out of the mean.",
	gain: "Scales this group's contribution to its parent."
}, Qn = (e) => Xn[e.name] ?? e.name, $n = (e) => Zn[e.name] ?? "", er = [
	"id",
	"name",
	"kind",
	"floor_id",
	"area_id",
	"mix",
	"null_handling",
	"gain"
], tr = [
	{
		value: "sum",
		label: "Sum (mixer)"
	},
	{
		value: "max",
		label: "Max (loudest)"
	},
	{
		value: "mean",
		label: "Mean"
	}
], nr = [{
	value: "zero",
	label: "Idle counts as 0"
}, {
	value: "ignore",
	label: "Ignore idle"
}], rr = "How this group's stimuli and children combine into one level.", ir = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", ar = "How loudly 'somebody is here' plays in this group's mix.", or = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, sr = { select: {
	mode: "dropdown",
	options: [
		0,
		1,
		2,
		3
	].map((e) => ({
		value: String(e),
		label: String(e)
	}))
} }, cr = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, lr = (e, t, n) => {
	switch (e) {
		case "null_handling": return t.mix === "mean";
		case "gain": return !n;
		case "floor_id": return t.kind === "floor";
		case "area_id": return de.has(t.kind);
		default: return !0;
	}
}, ur = (e, t) => {
	let n = [...g(t)];
	return n.includes(e.kind) || n.push(e.kind), { select: {
		mode: "dropdown",
		options: n.map((e) => ({
			value: e,
			label: h[e].label
		}))
	} };
};
function dr(e, t, n, r, i = null) {
	let a = {
		id: { text: {} },
		name: { text: {} },
		kind: ur(e, i),
		floor_id: { floor: {} },
		area_id: { area: {} },
		mix: { select: {
			mode: "dropdown",
			options: tr
		} },
		null_handling: { select: {
			mode: "dropdown",
			options: nr
		} },
		gain: cr
	};
	return n.filter((n) => lr(n, e, t)).map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function fr(e, t, n, r) {
	let i = {
		id: e.id,
		name: e.name ?? "",
		kind: e.kind,
		floor_id: e.floor_id,
		area_id: e.area_id,
		mix: e.mix,
		null_handling: e.null_handling,
		gain: e.gain
	};
	return Object.fromEntries(n.filter((n) => lr(n, e, t) && (n !== "area_id" || e.area_id !== null) && (n !== "floor_id" || e.floor_id !== null)).map((e) => [e, i[e]]));
}
function pr(e, t) {
	let n = { ...e };
	return "id" in t && (n.id = String(t.id ?? "")), "name" in t && (n.name = Un(t.name)), "kind" in t && typeof t.kind == "string" && (n.kind = t.kind), "floor_id" in t && (n.floor_id = Un(t.floor_id)), "area_id" in t && (n.area_id = Un(t.area_id)), "mix" in t && (n.mix = t.mix ?? e.mix), "null_handling" in t && (n.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), n;
}
var mr = (e, t) => er.find((n) => e[n] !== t[n]), hr = (e) => e.id === "" || RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function gr(e, t, n, r, i) {
	let a = {
		...e,
		[t]: n
	};
	return n === null ? a : (hr(e) && (a.id = i ? dt(i, n) : ct(n)), e.name === null && r !== null && (a.name = r), a);
}
var _r = (e, t, n, r) => gr(e, "area_id", t, n, r), vr = (e, t, n, r) => gr(e, "floor_id", t, n, r), yr = "activity_levels.panels";
function br() {
	try {
		let e = localStorage.getItem(yr), t = e === null ? null : JSON.parse(e);
		return typeof t != "object" || !t || Array.isArray(t) ? {} : t;
	} catch {
		return {};
	}
}
function xr(e, t) {
	let n = br()[e];
	return typeof n == "boolean" ? n : t;
}
function Sr(e, t) {
	try {
		localStorage.setItem(yr, JSON.stringify({
			...br(),
			[e]: t
		}));
	} catch {}
}
//#endregion
//#region src/panels.ts
function F(e, t, n, r, i, a, o = s) {
	let c = `${e}:${t}`;
	return y`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${t}
    ?expanded=${xr(c, i)}
    @expanded-changed=${(e) => {
		Sr(c, e.detail.expanded);
	}}
  >
    <div slot="header" class="panel-header">
      <span>${n} ${o}</span>
      <div class="muted">${r}</div>
    </div>
    <div class="panel-body">${a}</div>
  </ha-expansion-panel>`;
}
//#endregion
//#region src/al-adjacency-table.ts
var Cr = class extends o {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	get group() {
		return this.config && this.path ? T(this.config, this.path) : void 0;
	}
	get edges() {
		return (this.group?.adjacent ?? []).map((e) => ({
			id: Je(e),
			connection: Xe(e),
			one_way: Ye(e)
		}));
	}
	emit(e) {
		let { config: t, path: n } = this;
		!t || !n || this.dispatchEvent(N(x(t, [...n, "adjacent"], e), void 0, !0));
	}
	edit(e, t) {
		this.emit(this.edges.map((n, r) => r === e ? {
			...n,
			...t
		} : n));
	}
	nameOf(e) {
		return (this.config ? C(this.config).find(({ group: t }) => t.id === e) : void 0)?.group.name ?? e;
	}
	candidates() {
		let e = this.group;
		if (!this.config || !e) return [];
		let t = /* @__PURE__ */ new Set([
			e.id,
			...this.edges.map((e) => e.id),
			...Ze(this.config, e.id).map((e) => e.group.id)
		]);
		return C(this.config).map(({ group: e }) => e).filter((e) => de.has(e.kind) && !t.has(e.id));
	}
	errorFor(e) {
		let t = `${(this.path ?? []).join("/")}/adjacent/${e}`;
		return this.errors.find((e) => e.path === t || e.path.startsWith(`${t}/`))?.message;
	}
	render() {
		let e = this.group;
		if (!this.config || !e) return s;
		let t = Ze(this.config, e.id), n = this.candidates();
		return y`
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
          ${this.edges.map((e, t) => this.renderOwn(e, t))}
          ${t.map(({ group: e, edge: t }) => this.renderDeclared(e, t))}
          ${this.edges.length === 0 && t.length === 0 ? y`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>` : s}
        </tbody>
      </table>
      ${n.length === 0 ? s : y`<select
            class="add-edge"
            aria-label="Add an adjacent group"
            .value=${""}
            @change=${(e) => {
			let t = e.target;
			t.value !== "" && (this.emit([...this.edges, {
				id: t.value,
				connection: me,
				one_way: !1
			}]), t.value = "");
		}}
          >
            <option value="">Add an adjacent group…</option>
            ${n.map((e) => y`<option value=${e.id}>${e.name ?? e.id}</option>`)}
          </select>`}
    `;
	}
	renderOwn(e, t) {
		let n = this.errorFor(t), r = this.nameOf(e.id);
		return y`<tr class="own" data-id=${e.id}>
      <td>${r} ${n ? y`<div class="muted error">${n}</div>` : s}</td>
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${r}"
          .value=${e.connection}
          @change=${(e) => this.edit(t, { connection: e.target.value })}
        >
          ${ie.map((t) => y`<option value=${t} ?selected=${t === e.connection}>${ue[t]}</option>`)}
        </select>
      </td>
      <td>
        <input
          class="both-ways"
          type="checkbox"
          aria-label="You can walk both ways between here and ${r}"
          title="Unchecked means you can only go this way"
          .checked=${!e.one_way}
          @change=${(e) => this.edit(t, { one_way: !e.target.checked })}
        />
      </td>
      <td>
        <ha-icon-button
          label="Remove ${r}"
          data-action="remove"
          @click=${() => this.emit(this.edges.filter((e, n) => n !== t))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
      </td>
    </tr>`;
	}
	renderDeclared(e, t) {
		let n = e.name ?? e.id;
		return y`<tr class="declared" data-id=${e.id}>
      <td><span class="muted">declared on</span> ${n}</td>
      <td>${ue[t.connection]}</td>
      <td>${t.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
	}
};
_([d({ attribute: !1 })], Cr.prototype, "config", void 0), _([d({ attribute: !1 })], Cr.prototype, "path", void 0), _([d({ attribute: !1 })], Cr.prototype, "errors", void 0), Cr = _([a("al-adjacency-table")], Cr);
//#endregion
//#region src/al-override-field.ts
var wr = { select: {
	mode: "dropdown",
	options: [{
		value: "true",
		label: "Yes"
	}, {
		value: "false",
		label: "No"
	}]
} };
function Tr(e, t) {
	return e.select?.options?.find((e) => e.value === t)?.label;
}
var I = class extends o {
	constructor(...e) {
		super(...e), this.label = "", this.selector = { text: {} }, this.value = null, this.inherited = null, this.inheritedFrom = "defaults", this.hint = "", this.kind = "number", this.disabled = !1;
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	get overridden() {
		return this.value !== null && this.value !== void 0;
	}
	emit(e) {
		this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: e } }));
	}
	onValueChanged(e) {
		e.stopPropagation(), this.emit(Gn(this.kind, e.detail?.value));
	}
	onReset() {
		this.emit(null);
	}
	describeInherited() {
		let e = this.inherited;
		if (this.kind === "select" && e != null) {
			let t = Tr(this.selector, String(e));
			if (t !== void 0) return t;
		}
		return Kn(this.kind, e);
	}
	render() {
		let e = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`, t = this.hint === "" ? e : `${this.hint} ${e}`;
		return y`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? wr : this.selector}
          .label=${this.label}
          .required=${!1}
          .disabled=${this.disabled}
          .value=${Wn(this.kind, this.value)}
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
      ${this.error ? y`<div class="muted error msg">${this.error}</div>` : s}
    `;
	}
};
_([d({ attribute: !1 })], I.prototype, "hass", void 0), _([d()], I.prototype, "label", void 0), _([d({ attribute: !1 })], I.prototype, "selector", void 0), _([d({ attribute: !1 })], I.prototype, "value", void 0), _([d({ attribute: !1 })], I.prototype, "inherited", void 0), _([d({ attribute: "inherited-from" })], I.prototype, "inheritedFrom", void 0), _([d()], I.prototype, "hint", void 0), _([d()], I.prototype, "kind", void 0), _([d()], I.prototype, "error", void 0), _([d({ type: Boolean })], I.prototype, "disabled", void 0), I = _([a("al-override-field")], I);
//#endregion
//#region src/stimulus-form.ts
var Er = {
	entity: "Entity",
	mode: "Mode",
	to: "Active states",
	edges: "Fire on",
	gain: "Gain",
	key: "Label",
	envelope: "Envelope preset"
}, Dr = {
	entity: "The entity whose state drives this stimulus.",
	mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
	to: "Which states of this entity count as active.",
	edges: "Which crossings fire a trigger. At least one.",
	gain: "How loudly this stimulus contributes to its group.",
	key: "Optional name for this trigger; defaults to the entity id.",
	envelope: "Preset the overrides below start from."
}, Or = (e) => Er[e.name] ?? e.name, kr = (e) => Dr[e.name] ?? "", Ar = [
	"entity",
	"mode",
	"gain",
	"key",
	"envelope"
], L = { duration: { enable_millisecond: !0 } }, jr = { number: {
	min: 0,
	step: .1,
	mode: "box",
	unit_of_measurement: "×"
} }, Mr = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, Nr = "Allow retrigger", Pr = "When a new trigger is honoured while the envelope is still active.", Fr = "Stacks", Ir = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", Lr = { select: {
	mode: "dropdown",
	options: [
		{
			value: "always",
			label: "Always"
		},
		{
			value: "after_attack",
			label: "After the attack"
		},
		{
			value: "after_decay",
			label: "After the decay"
		},
		{
			value: "release",
			label: "Only while releasing"
		},
		{
			value: "idle",
			label: "Only once fully released"
		}
	]
} }, Rr = { select: {
	mode: "list",
	options: [{
		value: "sustained",
		label: "Sustained — hold while it is active"
	}, {
		value: "momentary",
		label: "Momentary — fire on each change"
	}]
} }, zr = [
	"attack",
	"decay",
	"impulse"
], Br = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", Vr = (e, t) => e.mode === "momentary" && zr.includes(t), Hr = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, Ur = "(unknown preset — using built-in defaults)", Wr = [
	{
		name: "attack",
		label: "Attack",
		kind: "duration",
		selector: L
	},
	{
		name: "decay",
		label: "Decay",
		kind: "duration",
		selector: L
	},
	{
		name: "sustain",
		label: "Sustain",
		kind: "multiplier",
		selector: jr
	},
	{
		name: "release",
		label: "Release",
		kind: "duration",
		selector: L
	},
	{
		name: "impulse",
		label: "Impulse",
		kind: "boolean",
		selector: wr
	},
	{
		name: "retrigger",
		label: Nr,
		kind: "select",
		selector: Lr,
		hint: Pr
	},
	{
		name: "stack",
		label: Fr,
		kind: "boolean",
		selector: wr,
		hint: Ir
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: Hr
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: L
	}
], Gr = [
	"entity",
	"mode",
	"to",
	"edges",
	"key"
], Kr = (e) => Gr.filter((t) => t !== "edges" || e.mode === "momentary"), qr = ["envelope", "gain"], Jr = "How a single trigger rises and falls over time.", Yr = "What makes this stimulus fire, and what it is called in the mix.", Xr = "Change part of the preset for this stimulus only.", Zr = (e) => Wr.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, Qr = (e) => [{
	value: "",
	label: "(default preset)"
}, ...e.envelopes.map((e) => ({
	value: e.id,
	label: e.id
}))];
function $r(e, t, n, r) {
	let i = _n(n, t.entity, t.to), a = {
		entity: { entity: {} },
		mode: Rr,
		to: { select: {
			mode: "dropdown",
			multiple: !0,
			custom_value: !0,
			options: hn(n, t.entity, t.to)
		} },
		edges: { select: {
			mode: "list",
			multiple: !0,
			options: [{
				value: "enter",
				label: i.enter
			}, {
				value: "leave",
				label: i.leave
			}]
		} },
		gain: Mr,
		key: { text: {} },
		envelope: { select: {
			mode: "dropdown",
			options: Qr(e)
		} }
	};
	return r.map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function ei(e, t) {
	let n = {
		entity: e.entity,
		mode: e.mode,
		to: e.to,
		edges: e.edges,
		gain: e.gain,
		key: e.key ?? "",
		envelope: e.envelope ?? ""
	};
	return Object.fromEntries(t.map((e) => [e, n[e]]));
}
var ti = (e) => Array.isArray(e) ? e.filter((e) => typeof e == "string" && e !== "") : [];
function ni(e, t) {
	let n = { ...e };
	if ("entity" in t && (n.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (n.mode = t.mode), "to" in t && (n.to = ti(t.to)), "edges" in t) {
		let e = ti(t.edges).filter((e) => e === "enter" || e === "leave");
		e.length > 0 && (n.edges = e);
	}
	return "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (n.key = Un(t.key)), "envelope" in t && (n.envelope = Un(t.envelope)), n;
}
var ri = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]);
function ii(e, t) {
	return ri(e.to, t.to) ? ri(e.edges, t.edges) ? Ar.find((n) => e[n] !== t[n]) : "edges" : "to";
}
function ai(e, t, n) {
	let r = vt(e, t.envelope);
	return r ? r[n] === null || r[n] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : Ur;
}
function oi(e, t) {
	return t == null || e === void 0 ? null : k(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
//#endregion
//#region src/sketch.ts
var si = (e) => e.release * e.sustain, ci = (e) => Math.max(1, e.sustain), li = (e) => e.sustain / ci(e);
function ui(e, t = .25) {
	if (e.impulse) return [
		{
			x: 0,
			y: 0
		},
		{
			x: 0,
			y: 1
		},
		{
			x: 1,
			y: 0
		}
	];
	let n = si(e), r = e.attack + e.decay + n, i = r > 0 ? r * t / (1 - t) : 1, a = r + i, o = 1 / ci(e), s = li(e), c = 0, l = [{
		x: 0,
		y: 0
	}];
	return c += e.attack, l.push({
		x: c / a,
		y: o
	}), c += e.decay, l.push({
		x: c / a,
		y: s
	}), c += i, l.push({
		x: c / a,
		y: s
	}), c += n, l.push({
		x: c / a,
		y: 0
	}), l;
}
function di(e, t = .25) {
	let n = ui(e, t), r = (e) => ((n[e]?.x ?? 0) + (n[e + 1]?.x ?? 0)) / 2;
	if (e.impulse) {
		let t = [{
			text: "impulse",
			x: 0
		}];
		return e.release > 0 && t.push({
			text: `R ${k(e.release)}`,
			x: r(1)
		}), t;
	}
	let i = [];
	return e.attack > 0 && i.push({
		text: `A ${k(e.attack)}`,
		x: r(0)
	}), e.decay > 0 && i.push({
		text: `D ${k(e.decay)}`,
		x: r(1)
	}), i.push({
		text: `S ${qn(e.sustain)}`,
		x: r(2)
	}), si(e) > 0 && i.push({
		text: `R ${k(e.release)}`,
		x: r(3)
	}), i;
}
//#endregion
//#region src/al-envelope-sketch.ts
var fi = 10, pi = 190, mi = 58, hi = 72, gi = (e) => fi + e * 180, _i = (e) => mi - e * 48, vi = (e) => String(Math.round(e * 10) / 10), yi = (e, t) => `${vi(e)},${vi(t)}`, bi = (e) => Math.min(184, Math.max(16, gi(e))), xi = class extends o {
	constructor(...e) {
		super(...e), this.envelope = null;
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	render() {
		let e = this.envelope;
		if (!e) return s;
		let n = ui(e), r = n[0], i = n[n.length - 1], a = n.map((e) => yi(gi(e.x), _i(e.y))).join(" "), o = `${yi(gi(r.x), mi)} ${a} ${yi(gi(i.x), mi)}`, c = di(e), l = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
		return y`
      <svg viewBox="0 0 200 80" role="img" aria-label=${l}>
        <title>${l}</title>
        <line class="grid" x1=${fi} y1=${mi} x2=${pi} y2=${mi}></line>
        ${e.impulse ? s : t`<line
              class="grid"
              x1=${fi}
              y1=${vi(_i(li(e)))}
              x2=${pi}
              y2=${vi(_i(li(e)))}
            ></line>`}
        <polygon class="area" points=${o}></polygon>
        <polyline class="curve" points=${a}></polyline>
        ${c.map((e) => t`<text class="caption" x=${vi(bi(e.x))} y=${hi} text-anchor="middle">${e.text}</text>`)}
      </svg>
    `;
	}
};
_([d({ attribute: !1 })], xi.prototype, "envelope", void 0), xi = _([a("al-envelope-sketch")], xi);
//#endregion
//#region src/al-presence-overrides.ts
var Si = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, Ci = class extends o {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [v];
	}
	setPresence(e, t) {
		let { config: n, path: r } = this;
		if (!n || !r) return;
		let i = T(n, r);
		if (!i) return;
		let a = x(n, [...r, "presence"], {
			...i.presence ?? qe(),
			[e]: t
		});
		this.dispatchEvent(N(a, `${j(r)}:presence:${e}`));
	}
	render() {
		let { config: e, path: t } = this, n = e && t ? T(e, t) : void 0;
		if (!e || !t || !n) return s;
		let r = n.presence ?? qe(), i = r.envelope ?? w(e).envelope, a = yt(e, {
			...r,
			envelope: i
		}), o = M(this.errors, [...t, "presence"]);
		return y`
      <ha-selector
        class="presence-envelope"
        .hass=${this.hass}
        .selector=${{ select: {
			mode: "dropdown",
			options: Qr(e)
		} }}
        .label=${"Envelope preset"}
        .required=${!1}
        .value=${r.envelope ?? ""}
        @value-changed=${(e) => this.setPresence("envelope", e.detail.value === "" ? null : e.detail.value)}
      ></ha-selector>
      <al-override-field
        class="presence-gain"
        .hass=${this.hass}
        label="Gain"
        kind="number"
        .selector=${Mr}
        .value=${r.gain}
        .inherited=${1}
        .inheritedFrom=${"presence"}
        .error=${o.gain}
        @value-changed=${(e) => this.setPresence("gain", e.detail.value ?? 1)}
      ></al-override-field>
      <al-override-field
        class="presence-activity_floor"
        .hass=${this.hass}
        label="Empty-room floor"
        hint="Likelihood of this room at an activity level of 0.0. Set 1 for a room people sleep in: a still sleeper trips no motion, and the estimator must not read that as an empty room."
        kind="number"
        .selector=${Si}
        .value=${r.activity_floor}
        .inherited=${w(e).activity.floor}
        .inheritedFrom=${"presence"}
        .error=${o.activity_floor}
        @value-changed=${(e) => this.setPresence("activity_floor", e.detail.value ?? null)}
      ></al-override-field>
      ${Wr.map((e) => y`<al-override-field
          class="presence-${e.name}"
          .hass=${this.hass}
          .label=${e.label}
          .hint=${e.hint ?? ""}
          .kind=${e.kind}
          .selector=${e.selector}
          .value=${r[e.name]}
          .inherited=${a[e.name]}
          .inheritedFrom=${i ?? "defaults"}
          .error=${o[e.name]}
          @value-changed=${(t) => this.setPresence(e.name, t.detail.value)}
        ></al-override-field>`)}
      <al-envelope-sketch .envelope=${a}></al-envelope-sketch>
    `;
	}
};
_([d({ attribute: !1 })], Ci.prototype, "hass", void 0), _([d({ attribute: !1 })], Ci.prototype, "config", void 0), _([d({ attribute: !1 })], Ci.prototype, "path", void 0), _([d({ attribute: !1 })], Ci.prototype, "errors", void 0), Ci = _([a("al-presence-overrides")], Ci);
//#endregion
//#region src/al-group-editor.ts
var wi = "People can leave the property from here, so presence can move from here to Away.", Ti = class extends o {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	emitChange(e, t) {
		this.dispatchEvent(N(e, t));
	}
	emitSelect(e) {
		this.dispatchEvent(bn(e));
	}
	onIdentityChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = T(t, n);
		if (!r) return;
		let i = e.detail?.value ?? {}, a = pr(r, i);
		"area_id" in i && a.area_id !== r.area_id && (a = _r(a, a.area_id, a.area_id === null ? null : this.areaName(a.area_id), t)), "floor_id" in i && a.floor_id !== r.floor_id && (a = vr(a, a.floor_id, a.floor_id === null ? null : this.floorName(a.floor_id), t));
		let o = mr(a, r);
		o !== void 0 && this.emitChange(x(t, n, a), `${j(n)}:${o}`);
	}
	areaName(e) {
		return this.hass?.areas[e]?.name ?? null;
	}
	floorName(e) {
		return this.hass?.floors?.[e]?.name ?? null;
	}
	onMixChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = T(t, n);
		if (!r) return;
		let i = pr(r, e.detail?.value ?? {}), a = mr(i, r);
		a !== void 0 && this.emitChange(x(t, n, i), `${j(n)}:${a}`);
	}
	setField(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(x(n, [...r, e], t), `${j(r)}:${e}`);
	}
	onDelete() {
		let { config: e, path: t } = this;
		if (!e || !t) return;
		let n = T(e, t);
		if (!n || !window.confirm(`Delete group "${n.name || n.id}" and everything in it?`)) return;
		this.emitChange(Ne(e, t));
		let r = gt(t);
		this.emitSelect(r.length ? r : null);
	}
	render() {
		let { config: e, path: t } = this;
		if (!e || !t || t.length === 0) return y`<ha-card><span class="muted">Select a group.</span></ha-card>`;
		let n = T(e, t);
		if (!n) return y`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		let r = t.length === 2, i = this.errors.filter((e) => e.path === j(t)), a = M(this.errors, t), o = t.length > 2 ? T(e, gt(t)) : void 0;
		return y`
      <ha-card header="Group">
        ${n.area_id ? Vn("area", n.area_id, "Open Home Assistant area") : s}
        ${i.map((e) => y`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${F("group", "identity", "Identity", h[n.kind].definition, !0, y`
            <ha-form
              .hass=${this.hass}
              .data=${fr(n, r, Jn, e)}
              .schema=${dr(n, r, Jn, e, o?.kind ?? null)}
              .error=${a}
              .computeLabel=${Qn}
              .computeHelper=${$n}
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(e, n, a)}
          `)}
        ${F("group", "mix", "Mix", rr, !0, this.renderMix(e, n, r, a))}
        ${this.renderAdjacency(e, n, a)} ${this.renderPresence(e, n, t)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderMix(e, t, n, r) {
		return y`
      <ha-form
        .hass=${this.hass}
        .data=${fr(t, n, Yn, e)}
        .schema=${dr(t, n, Yn, e)}
        .error=${r}
        .computeLabel=${Qn}
        .computeHelper=${$n}
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${Xn.max_value}
        kind="number"
        .selector=${or}
        .value=${t.max_value}
        .inherited=${e.defaults.max_value}
        .inheritedFrom=${"defaults"}
        .error=${r.max_value}
        @value-changed=${(e) => this.setField("max_value", e.detail.value)}
      ></al-override-field>
      <al-override-field
        .hass=${this.hass}
        .label=${Xn.precision}
        kind="select"
        .selector=${sr}
        .value=${t.precision === null ? null : String(t.precision)}
        .inherited=${String(e.defaults.precision)}
        .inheritedFrom=${"defaults"}
        .error=${r.precision}
        @value-changed=${(e) => this.setField("precision", e.detail.value === null ? null : Number(e.detail.value))}
      ></al-override-field>
    `;
	}
	renderAdjacency(e, t, n) {
		return de.has(t.kind) ? F("group", "adjacent", "Adjacent groups", ir, !0, y`
        <al-adjacency-table
          .config=${e}
          .path=${this.path}
          .errors=${this.errors}
        ></al-adjacency-table>
        ${this.renderExit(t, n)}
      `) : s;
	}
	renderExit(e, t) {
		return y`<div class="exit row">
      <ha-switch
        .checked=${e.exit === !0}
        @change=${(e) => this.setField("exit", e.target.checked === !0)}
      ></ha-switch>
      <div>
        <div>Leads off the property</div>
        <div class="muted">${wi}</div>
        ${t.exit ? y`<div class="error">${t.exit}</div>` : s}
      </div>
    </div>`;
	}
	renderPresence(e, t, n) {
		return w(e).enabled ? F("group", "presence", "Presence", ar, !1, y`<al-presence-overrides
        .hass=${this.hass}
        .config=${e}
        .path=${n}
        .errors=${this.errors}
      ></al-presence-overrides>`) : s;
	}
	renderStale(e, t, n) {
		if (de.has(t.kind)) return s;
		let r = [t.adjacent.length > 0 ? "adjacent groups" : null, t.exit === !0 ? "a way off the property" : null].filter((e) => e !== null);
		if (r.length === 0) return s;
		let i = n.adjacent ?? n.exit ?? `${h[t.kind].label} groups have no ${r.join(" and no ")}.`;
		return y`<div class="stale row">
      <div class="grow error">${i}</div>
      <ha-button appearance="plain" @click=${() => this.clearStale(e)}>Remove</ha-button>
    </div>`;
	}
	clearStale(e) {
		let t = this.path;
		if (!t) return;
		let n = x(x(e, [...t, "adjacent"], []), [...t, "exit"], !1);
		this.dispatchEvent(N(n, void 0, !0));
	}
};
_([d({ attribute: !1 })], Ti.prototype, "hass", void 0), _([d({ attribute: !1 })], Ti.prototype, "config", void 0), _([d({ attribute: !1 })], Ti.prototype, "path", void 0), _([d({ attribute: !1 })], Ti.prototype, "errors", void 0), Ti = _([a("al-group-editor")], Ti);
//#endregion
//#region src/al-stimulus-editor.ts
var R = class extends o {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null;
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	emitChange(e, t) {
		this.dispatchEvent(N(e, t));
	}
	onFormChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = ht(t, n);
		if (!r) return;
		let i = ni(r, e.detail?.value ?? {}), a = ii(i, r);
		a !== void 0 && this.emitChange(x(t, n, i), `${j(n)}:${a}`);
	}
	setOverride(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(x(n, [...r, e], t), `${j(r)}:${e}`);
	}
	renderLive(e, t) {
		return e ? y`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${e.phase}">${e.phase}</span>
      <span class="chip">${e.value.toFixed(2)}</span>
      ${t === null ? s : y`<span class="muted chip">ends in ${t}</span>`}
      <span class="dot ${e.gate ? "gated" : ""}" title=${e.gate ? "Gate open" : "Gate closed"}></span>
    </div>` : s;
	}
	renderOverride(e, t, n, r) {
		let { config: i } = this, a = Vr(t, e.name);
		return y`<al-override-field
      .hass=${this.hass}
      .label=${e.label}
      .disabled=${a}
      .hint=${a ? Br : e.hint ?? ""}
      .kind=${e.kind}
      .selector=${e.selector}
      .value=${t[e.name]}
      .inherited=${n[e.name]}
      .inheritedFrom=${i ? ai(i, t, e.name) : "defaults"}
      .error=${r[e.name]}
      @value-changed=${(t) => this.setOverride(e.name, t.detail.value)}
    ></al-override-field>`;
	}
	render() {
		let { config: e, path: t } = this;
		if (!e || !t || t.length < 3) return y`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
		let n = ht(e, t);
		if (!n) return y`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
		let r = T(e, gt(t)), i = M(this.errors, t), a = this.errors.filter((e) => e.path === j(t)), o = yt(e, n), c = this.live?.voices[r?.id ?? ""]?.find((e) => e.label === (n.key ?? n.entity)), l = oi(this.live?.now, c?.phase_ends), u = Zr(n);
		return y`
      <ha-card header="Stimulus">
        ${Hn(this, this.hass, n.entity)}
        ${a.map((e) => y`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${F("stimulus", "source", "Source", Yr, !0, y`
            <ha-form
              .hass=${this.hass}
              .data=${ei(n, Kr(n))}
              .schema=${$r(e, n, this.hass, Kr(n))}
              .error=${i}
              .computeLabel=${Or}
              .computeHelper=${kr}
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `)}
        ${F("stimulus", "envelope", "Envelope", Jr, !0, y`
            <ha-form
              .hass=${this.hass}
              .data=${ei(n, qr)}
              .schema=${$r(e, n, this.hass, qr)}
              .error=${i}
              .computeLabel=${Or}
              .computeHelper=${kr}
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(c, l)}
            <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
          `)}
        ${F("stimulus", "overrides", "Override preset", Xr, !1, Wr.map((e) => this.renderOverride(e, n, o, i)), u === 0 ? s : y`<span class="badge">${u} overridden</span>`)}
      </ha-card>
    `;
	}
};
_([d({ attribute: !1 })], R.prototype, "hass", void 0), _([d({ attribute: !1 })], R.prototype, "config", void 0), _([d({ attribute: !1 })], R.prototype, "path", void 0), _([d({ attribute: !1 })], R.prototype, "errors", void 0), _([d({ attribute: !1 })], R.prototype, "live", void 0), R = _([a("al-stimulus-editor")], R);
//#endregion
//#region src/al-envelopes.ts
var Ei = {
	label: "Name",
	id: "ID",
	attack: "Attack",
	decay: "Decay",
	sustain: "Sustain",
	release: "Release",
	impulse: "Impulse"
}, Di = {
	label: "What this preset is called in the panel. Blank shows the id instead.",
	id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
	attack: "Time to rise from zero to the stimulus gain.",
	decay: "Time to travel from the peak to the sustain level.",
	sustain: "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
	release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
	impulse: "Fire and forget: the trigger ends the moment it starts, leaving only the release."
}, Oi = [
	"label",
	"id",
	"attack",
	"decay",
	"sustain",
	"release",
	"impulse"
], ki = [
	{
		name: "label",
		selector: { text: {} }
	},
	{
		name: "id",
		selector: { text: {} }
	},
	{
		name: "attack",
		selector: L
	},
	{
		name: "decay",
		selector: L
	},
	{
		name: "sustain",
		selector: jr
	},
	{
		name: "release",
		selector: L
	},
	{
		name: "impulse",
		selector: { boolean: {} }
	}
], Ai = [
	{
		name: "retrigger",
		label: Nr,
		kind: "select",
		selector: Lr,
		hint: Pr
	},
	{
		name: "stack",
		label: Fr,
		kind: "boolean",
		selector: wr,
		hint: Ir
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: Hr
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: L
	}
], ji = "text/plain", Mi = 36, Ni = (e) => e.stopPropagation(), z = class extends o {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => Ei[e.name] ?? e.name, this.computeHelper = (e) => Di[e.name] ?? "";
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	willUpdate(e) {
		if (!e.has("config")) return;
		this.blocked = null;
		let t = this.config?.envelopes.length ?? 0;
		this.selected >= t && (this.selected = Math.max(0, t - 1));
	}
	emitChange(e, t) {
		this.dispatchEvent(N(e, t));
	}
	selectPreset(e) {
		this.selected = e, this.blocked = null;
	}
	setDefault(e) {
		let t = this.config, n = t?.envelopes[e];
		!t || !n || t.defaults.envelope === n.id || this.emitChange(x(t, ["defaults", "envelope"], n.id), "defaults:envelope");
	}
	reorder(e, t) {
		let n = this.config;
		if (!n) return;
		let r = Ie(n, ["envelopes"], e, t);
		if (r === n) return;
		let i = n.envelopes[this.selected]?.id, a = r.envelopes.findIndex((e) => e.id === i);
		this.selected = a === -1 ? 0 : a, this.blocked = null, this.emitChange(r);
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(ji, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
	}
	onDragEnd() {
		this.dragging = null, this.dropAt = null;
	}
	slotFor(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || Mi;
		return e.clientY - n.top < r / 2 ? t : t + 1;
	}
	isOurs(e) {
		return this.dragging !== null && e.dataTransfer?.types.includes(ji) === !0;
	}
	onDragOver(e, t) {
		this.isOurs(e) && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move"), this.dropAt = this.slotFor(e, t));
	}
	onDrop(e, t) {
		let n = this.dragging;
		n !== null && (e.preventDefault(), this.reorder(n, this.slotFor(e, t)), this.onDragEnd());
	}
	onRowKeydown(e, t) {
		!e.altKey || e.key !== "ArrowUp" && e.key !== "ArrowDown" || (e.preventDefault(), this.reorder(t, e.key === "ArrowUp" ? t - 1 : t + 2));
	}
	addPreset() {
		let e = this.config;
		if (!e) return;
		this.blocked = null;
		let t = e.envelopes.length;
		this.emitChange(Pe(e, ["envelopes"], t, tt(ft(e, "preset")))), this.selected = t;
	}
	removePreset(e) {
		let t = this.config;
		if (!t) return;
		let n = t.envelopes[e];
		if (!n) return;
		let r = pt(t, n.id);
		if (r.defaults || r.groups.length > 0) {
			this.selected = e, this.blocked = {
				id: n.id,
				...r
			};
			return;
		}
		window.confirm(`Delete envelope preset "${n.id}"?`) && (this.blocked = null, this.emitChange(Ne(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && --this.selected);
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config, n = this.selected, r = t?.envelopes[n];
		if (!t || !r) return;
		let i = e.detail?.value ?? {}, a = typeof i.label == "string" ? i.label : r.label ?? "", o = {
			...r,
			label: a.trim() === "" ? null : a,
			id: String(i.id ?? ""),
			attack: O(i.attack) ?? r.attack,
			decay: O(i.decay) ?? r.decay,
			sustain: typeof i.sustain == "number" ? i.sustain : r.sustain,
			release: O(i.release) ?? r.release,
			impulse: typeof i.impulse == "boolean" ? i.impulse : r.impulse
		}, s = Oi.find((e) => o[e] !== r[e]);
		if (s === void 0) return;
		let c = ["envelopes", n], l = x(mt(t, n, o.id), c, o);
		this.emitChange(l, `${j(c)}:${s}`);
	}
	setOverride(e, t) {
		let n = this.config, r = this.selected;
		if (!n || !n.envelopes[r]) return;
		let i = [
			"envelopes",
			r,
			e
		];
		this.emitChange(x(n, i, t), j(i));
	}
	render() {
		let e = this.config;
		return e ? y`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(e)}</div>
        <div>${this.renderEditor(e)}</div>
      </div>
    ` : y`<ha-card><span class="muted">Loading…</span></ha-card>`;
	}
	renderList(e) {
		let t = this.blocked;
		return y`
      <ha-card>
        <h3>Presets</h3>
        ${e.envelopes.map((t, n) => this.renderPresetRow(e, t, n))}
        ${e.envelopes.length === 0 ? y`<p class="muted">No presets yet.</p>` : s}
        ${t ? y`<ha-alert alert-type="warning">${Fi(t)}</ha-alert>` : s}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderPresetRow(e, t, n) {
		let r = vn(this.errors, ["envelopes", n]), i = e.defaults.envelope === t.id, a = this.dragging === null || this.dropAt === null ? "" : this.dropClass(n), o = [
			"row",
			"preset",
			this.selected === n ? "selected" : "",
			this.dragging === n ? "dragging" : "",
			a
		].filter(Boolean).join(" ");
		return y`<div
      class=${o}
      data-index=${n}
      draggable="true"
      @dragstart=${(e) => this.onDragStart(e, n)}
      @dragend=${this.onDragEnd}
      @dragover=${(e) => this.onDragOver(e, n)}
      @drop=${(e) => this.onDrop(e, n)}
    >
      <ha-icon class="handle" icon="mdi:drag-horizontal-variant"></ha-icon>
      <button
        type="button"
        class="link grow names"
        title="Edit this preset"
        @click=${() => this.selectPreset(n)}
        @keydown=${(e) => this.onRowKeydown(e, n)}
      >
        <span class="name"
          >${t.id === "" && t.label === null ? "(unnamed preset)" : nt(t)}</span
        >
        ${t.label !== null && t.label.trim() !== "" ? y`<span class="muted id">${t.id}</span>` : s}
      </button>
      ${r ? y`<span class="badge" title="${r} problem(s)">${r}</span>` : s}
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
          @dragstart=${Ni}
          @click=${Ni}
          @change=${() => this.setDefault(n)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
        @dragstart=${Ni}
        @click=${() => this.removePreset(n)}
      >
        <ha-icon icon="mdi:delete"></ha-icon>
      </ha-icon-button>
    </div>`;
	}
	dropClass(e) {
		let t = this.dropAt, n = this.config?.envelopes.length ?? 0;
		return t === null ? "" : t === e ? "drop-before" : t === e + 1 && t === n ? "drop-after" : "";
	}
	renderEditor(e) {
		let t = this.selected, n = e.envelopes[t];
		if (!n) return y`<ha-card
        ><span class="muted">Select a preset.</span></ha-card
      >`;
		let r = ["envelopes", t], i = M(this.errors, r), a = this.errors.filter((e) => e.path === j(r)), o = {
			label: n.label ?? "",
			id: n.id,
			attack: D(n.attack),
			decay: D(n.decay),
			sustain: n.sustain,
			release: D(n.release),
			impulse: n.impulse
		}, c = Pi(e, t, n);
		return y`
      <ha-card header="Envelope preset">
        ${a.map((e) => y`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${c ? y`<ha-alert alert-type="warning">${c}</ha-alert>` : s}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${ki}
          .error=${i}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${n}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Ai.map((t) => y`<al-override-field
              .hass=${this.hass}
              .label=${t.label}
              .hint=${t.hint ?? ""}
              .kind=${t.kind}
              .selector=${t.kind === "boolean" ? wr : t.selector}
              .value=${n[t.name]}
              .inherited=${e.defaults[t.name]}
              .inheritedFrom=${"defaults"}
              .error=${i[t.name]}
              @value-changed=${(e) => this.setOverride(t.name, e.detail.value)}
            ></al-override-field>`)}
      </ha-card>
    `;
	}
};
_([d({ attribute: !1 })], z.prototype, "hass", void 0), _([d({ attribute: !1 })], z.prototype, "config", void 0), _([d({ attribute: !1 })], z.prototype, "errors", void 0), _([d({ type: Boolean })], z.prototype, "narrow", void 0), _([l()], z.prototype, "selected", void 0), _([l()], z.prototype, "blocked", void 0), _([l()], z.prototype, "dragging", void 0), _([l()], z.prototype, "dropAt", void 0), z = _([a("al-envelopes")], z);
function Pi(e, t, n) {
	return n.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((e, r) => r !== t && e.id === n.id) ? `Another preset already uses the id "${n.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Fi(e) {
	let t = [];
	return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
//#endregion
//#region src/al-defaults.ts
var Ii = {
	envelope: "Default envelope",
	max_value: "Max value",
	precision: "Precision",
	unavailable: "When unavailable",
	retrigger: Nr,
	stack: Fr,
	debounce: "Debounce",
	safety_refresh: "Safety refresh",
	min_wake_interval: "Minimum wake interval"
}, Li = {
	envelope: "Preset used when a stimulus names none.",
	max_value: "Limiter for groups that don't set their own.",
	precision: "Display decimals.",
	unavailable: "What an entity going unavailable does to its trigger.",
	retrigger: Pr,
	stack: Ir,
	debounce: "Minimum time between triggers per stimulus.",
	safety_refresh: "Periodic recompute as a self-heal.",
	min_wake_interval: "Floor for the scheduler's timer delay."
}, Ri = [
	"envelope",
	"max_value",
	"precision",
	"unavailable",
	"retrigger",
	"stack",
	"debounce",
	"safety_refresh",
	"min_wake_interval"
], zi = { duration: { enable_millisecond: !0 } }, Bi = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, Vi = { select: {
	mode: "dropdown",
	options: [
		0,
		1,
		2,
		3
	].map((e) => ({
		value: String(e),
		label: String(e)
	}))
} }, Hi = { boolean: {} }, Ui = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, Wi = class extends o {
	constructor(...e) {
		super(...e), this.errors = [], this.computeLabel = (e) => Ii[e.name] ?? e.name, this.computeHelper = (e) => Li[e.name] ?? "";
	}
	static {
		this.styles = [v, m`
      .pad {
        padding: 16px;
      }
      .note {
        margin-top: 12px;
      }
    `];
	}
	schemaFor(e) {
		return [
			{
				name: "envelope",
				selector: { select: {
					mode: "dropdown",
					options: e.envelopes.map((e) => ({
						value: e.id,
						label: e.id
					}))
				} }
			},
			{
				name: "max_value",
				selector: Bi
			},
			{
				name: "precision",
				selector: Vi
			},
			{
				name: "unavailable",
				selector: Ui
			},
			{
				name: "retrigger",
				selector: Lr
			},
			{
				name: "stack",
				selector: Hi
			},
			{
				name: "debounce",
				selector: zi
			},
			{
				name: "safety_refresh",
				selector: zi
			},
			{
				name: "min_wake_interval",
				selector: zi
			}
		];
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config;
		if (!t) return;
		let n = t.defaults, r = e.detail?.value ?? {}, i = Number(r.precision), a = {
			envelope: typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : n.envelope,
			max_value: typeof r.max_value == "number" ? r.max_value : n.max_value,
			precision: Number.isFinite(i) ? i : n.precision,
			unavailable: r.unavailable ?? n.unavailable,
			retrigger: r.retrigger ?? n.retrigger,
			stack: typeof r.stack == "boolean" ? r.stack : n.stack,
			debounce: O(r.debounce) ?? n.debounce,
			safety_refresh: O(r.safety_refresh) ?? n.safety_refresh,
			min_wake_interval: O(r.min_wake_interval) ?? n.min_wake_interval
		}, o = Ri.find((e) => a[e] !== n[e]);
		o !== void 0 && this.emitChange(x(t, ["defaults"], a), `defaults:${o}`);
	}
	emitChange(e, t) {
		this.dispatchEvent(N(e, t));
	}
	render() {
		let e = this.config;
		if (!e) return y`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
		let t = e.defaults, n = M(this.errors, ["defaults"]), r = this.errors.filter((e) => e.path === "defaults"), i = {
			envelope: t.envelope,
			max_value: t.max_value,
			precision: String(t.precision),
			unavailable: t.unavailable,
			retrigger: t.retrigger,
			stack: t.stack,
			debounce: D(t.debounce),
			safety_refresh: D(t.safety_refresh),
			min_wake_interval: D(t.min_wake_interval)
		};
		return y`
      <div class="pad">
        <ha-card header="Defaults">
          ${r.map((e) => y`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
          <ha-form
            .hass=${this.hass}
            .data=${i}
            .schema=${this.schemaFor(e)}
            .error=${n}
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
_([d({ attribute: !1 })], Wi.prototype, "hass", void 0), _([d({ attribute: !1 })], Wi.prototype, "config", void 0), _([d({ attribute: !1 })], Wi.prototype, "errors", void 0), Wi = _([a("al-defaults")], Wi);
//#endregion
//#region src/fader.ts
var Gi = .1, Ki = Math.log10(Gi), qi = Math.log10(10) - Ki, Ji = (e) => Math.min(10, Math.max(Gi, e)), Yi = (e) => Math.round(e * 100) / 100, Xi = (e) => Yi(Ji(e));
function Zi(e) {
	return (Math.log10(Ji(e)) - Ki) / qi;
}
function Qi(e) {
	return Yi(Ji(10 ** (Ki + Math.min(1, Math.max(0, e)) * qi)));
}
function $i(e, t, n = !1) {
	let r = n ? 1.05 : 1.25;
	return Yi(Ji(t === 1 ? e * r : e / r));
}
function ea(e) {
	let t = e.toFixed(2).replace(/0+$/, "");
	return t.endsWith(".") && (t += "0"), t;
}
var ta = {
	min: Gi,
	max: 10,
	toPosition: Zi,
	fromPosition: Qi,
	clamp: Xi,
	step: (e, t, n = !1) => $i(e, t, n),
	page: (e, t) => Xi(t === 1 ? e * 2 : e / 2),
	format: ea,
	reset: 1
}, na = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function ra(e, t) {
	let n = e > 0 ? e : 1, r = na(t), i = 10 ** -r, a = (e) => Number(Math.min(n, Math.max(0, e)).toFixed(r)), o = Math.max(i, Number((n / 10).toFixed(r)));
	return {
		min: 0,
		max: n,
		toPosition: (e) => Math.min(1, Math.max(0, e / n)),
		fromPosition: (e) => a(Math.min(1, Math.max(0, e)) * n),
		clamp: a,
		step: (e, t, n = !1) => a(e + t * (n ? i : o)),
		page: (e, t) => a(e + t * n / 4),
		format: (e) => at(a(e), r),
		reset: null
	};
}
//#endregion
//#region src/al-fader.ts
var ia = 12, aa = (e) => `${Math.round(e * 1e3) / 10}%`, B = class extends o {
	constructor(...e) {
		super(...e), this.value = 1, this.disabled = !1, this.focusable = !0, this.readOnly = !1, this.label = "Gain", this.showValue = !0, this.unavailable = !1, this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1;
	}
	static {
		this.styles = m`
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
    :host([readonly]) .fill {
      transition: height 100ms ease-out;
    }
    @media (prefers-reduced-motion: reduce) {
      :host([readonly]) .fill {
        transition: none;
      }
    }
    .knob {
      position: absolute;
      left: -3px;
      right: -3px;
      height: ${ia}px;
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
	}
	get scale() {
		return this.mode === "level" ? ra(this.max, this.precision) : ta;
	}
	get current() {
		return this.dragValue ?? this.value;
	}
	emit(e, t) {
		this.dispatchEvent(new CustomEvent("value-changed", { detail: {
			value: e,
			live: t
		} }));
	}
	commit(e) {
		this.dragging = !1, this.dragValue = null, this.emit(e, !1);
	}
	onKeyDown(e) {
		if (this.disabled || this.readOnly) return;
		let t = this.scale, n = this.current, r;
		switch (e.key) {
			case "ArrowUp":
			case "ArrowRight":
				r = t.step(n, 1, e.shiftKey);
				break;
			case "ArrowDown":
			case "ArrowLeft":
				r = t.step(n, -1, e.shiftKey);
				break;
			case "Home":
				r = t.min;
				break;
			case "End":
				r = t.max;
				break;
			case "PageUp":
				r = t.page(n, 1);
				break;
			case "PageDown":
				r = t.page(n, -1);
				break;
			default: return;
		}
		e.preventDefault(), e.stopPropagation(), this.commit(r);
	}
	onDoubleClick() {
		let e = this.scale.reset;
		this.disabled || this.readOnly || e === null || this.commit(e);
	}
	moveTo(e, t) {
		let n = t.getBoundingClientRect();
		if (n.height <= 0) return;
		let r = this.scale.fromPosition(1 - (e.clientY - n.top) / n.height);
		r !== this.dragValue && (this.dragValue = r, this.emit(r, !0));
	}
	onPointerDown(e) {
		if (this.disabled || this.readOnly) return;
		let t = e.currentTarget;
		e.preventDefault(), this.dragging = !0;
		try {
			t.setPointerCapture(e.pointerId);
		} catch {}
		this.moveTo(e, t);
	}
	onPointerMove(e) {
		this.dragging && this.moveTo(e, e.currentTarget);
	}
	onPointerUp(e) {
		if (this.dragging) {
			try {
				e.currentTarget.releasePointerCapture(e.pointerId);
			} catch {}
			this.commit(this.current);
		}
	}
	render() {
		let e = this.scale, t = e.clamp(this.current), n = e.toPosition(t), r = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), i = y`
      ${this.mode === "gain" ? y`<div class="unity"></div>` : s}
      <div class="fill" style="height: ${aa(n)}"></div>
      ${r === null ? s : y`<div class="tick" style="bottom: ${aa(e.toPosition(r))}" title=${e.format(r)}></div>`}
    `;
		return this.readOnly ? y`
        <div
          class="fader"
          role="meter"
          aria-label=${this.label}
          aria-valuemin=${e.min}
          aria-valuemax=${e.max}
          aria-valuenow=${this.unavailable ? s : t}
          aria-valuetext=${this.unavailable ? "Value unavailable" : e.format(t)}
        >
          <div class="track">${this.unavailable ? s : i}</div>
          ${this.showValue ? y`<div class="value">${e.format(t)}</div>` : s}
        </div>
      ` : y`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled || !this.focusable ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${e.min}
        aria-valuemax=${e.max}
        aria-valuenow=${this.unavailable ? s : t}
        aria-valuetext=${this.unavailable ? "Value unavailable" : e.format(t)}
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
          <div class="knob" style="bottom: calc(${aa(n)} - ${Math.round((n - .5) * ia * 10) / 10}px - ${ia / 2}px)"></div>
        </div>
        ${this.showValue ? y`<div class="value">${e.format(t)}</div>` : s}
      </div>
    `;
	}
};
_([d({ type: Number })], B.prototype, "value", void 0), _([d({
	type: Boolean,
	reflect: !0
})], B.prototype, "disabled", void 0), _([d({ type: Boolean })], B.prototype, "focusable", void 0), _([d({
	type: Boolean,
	reflect: !0,
	attribute: "readonly"
})], B.prototype, "readOnly", void 0), _([d({ type: String })], B.prototype, "label", void 0), _([d({ type: Boolean })], B.prototype, "showValue", void 0), _([d({ type: Boolean })], B.prototype, "unavailable", void 0), _([d({ type: String })], B.prototype, "mode", void 0), _([d({ type: Number })], B.prototype, "max", void 0), _([d({ type: Number })], B.prototype, "precision", void 0), _([d({ type: Number })], B.prototype, "tick", void 0), _([l()], B.prototype, "dragValue", void 0), B = _([a("al-fader")], B);
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive.js
var oa = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, sa = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), ca = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, la = sa(class extends ca {
	constructor(e) {
		if (super(e), e.type !== oa.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
	}
	render(e) {
		return " " + Object.keys(e).filter((t) => e[t]).join(" ") + " ";
	}
	update(e, [t]) {
		if (this.st === void 0) {
			this.st = /* @__PURE__ */ new Set(), e.strings !== void 0 && (this.nt = new Set(e.strings.join(" ").split(/\s/).filter((e) => e !== "")));
			for (let e in t) t[e] && !this.nt?.has(e) && this.st.add(e);
			return this.render(t);
		}
		let n = e.element.classList;
		for (let e of this.st) e in t || (n.remove(e), this.st.delete(e));
		for (let e in t) {
			let r = !!t[e];
			r === this.st.has(e) || this.nt?.has(e) || (r ? (n.add(e), this.st.add(e)) : (n.remove(e), this.st.delete(e)));
		}
		return f;
	}
}), ua = (e) => `${Math.round(e * 1e3) / 10}%`, da = class extends o {
	constructor(...e) {
		super(...e), this.value = 0, this.max = 1, this.gated = !1;
	}
	static {
		this.styles = m`
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
	}
	connectedCallback() {
		super.connectedCallback(), this.setAttribute("aria-hidden", "true");
	}
	get ratio() {
		return this.max > 0 ? Math.min(1, Math.max(0, this.value / this.max)) : 0;
	}
	render() {
		let e = this.ratio;
		return y`
      <div class="meter">
        <div class=${la({
			fill: !0,
			hot: e > .9
		})} style="width: ${ua(e)}"></div>
      </div>
      <div class=${la({
			dot: !0,
			gated: this.gated
		})}></div>
    `;
	}
};
_([d({ type: Number })], da.prototype, "value", void 0), _([d({ type: Number })], da.prototype, "max", void 0), _([d({ type: Boolean })], da.prototype, "gated", void 0), da = _([a("al-meter")], da);
var V = class extends o {
	constructor(...e) {
		super(...e), this.label = "", this.editable = !1, this.value = 0, this.realValue = 0, this.maxValue = 5, this.precision = 1, this.liveNow = 0, this.muted = !1, this.selected = !1, this.errors = 0, this.pending = null, this.dragging = !1;
	}
	static {
		this.styles = m`
    :host {
      display: block;
      box-sizing: border-box;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 10px 8px;
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
      gap: 12px;
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
      min-height: 1.2em;
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
      margin-top: auto;
    }
    .foot:empty {
      display: none;
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
	settle(e) {
		this.dragging || !this.editable || (this.pending = e);
	}
	get stop() {
		return this.selected ? 0 : -1;
	}
	select() {
		this.dispatchEvent(Sn());
	}
	clearStepTimer() {
		this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
	}
	sendOverride(e) {
		this.clearStepTimer(), this.dispatchEvent(Cn(e));
	}
	onFader(e) {
		if (e.stopPropagation(), !this.editable) return;
		let { value: t, live: n } = e.detail;
		if (this.pending = t, n) {
			this.dragging = !0;
			return;
		}
		if (this.dragging) {
			this.dragging = !1, this.sendOverride(t);
			return;
		}
		this.clearStepTimer(), this.stepTimer = window.setTimeout(() => {
			this.stepTimer = void 0, this.dispatchEvent(Cn(t));
		}, 250);
	}
	onMute() {
		this.editable && this.dispatchEvent(wn(!this.muted));
	}
	onReset() {
		this.editable && this.dispatchEvent(Tn());
	}
	render() {
		let e = this.pending ?? this.value;
		return y`
      <div class="strip" @click=${this.select}>
        <div class="head">
          <span class="name" title=${this.label}>${this.label}</span>
        </div>
        <al-fader
          mode="level"
          .showValue=${!1}
          ?readonly=${!this.editable || e === null}
          .unavailable=${e === null}
          .value=${e ?? 0}
          .max=${this.maxValue}
          .precision=${this.precision}
          .tick=${this.realValue}
          .focusable=${this.selected}
          label=${`${this.label} level`}
          @value-changed=${this.onFader}
        ></al-fader>
        <div class="readout" title=${e === null ? "No data at this time" : s}>${e === null ? "" : at(e, this.precision)}</div>
        ${this.editable ? y`<div class="buttons">
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
            </div>` : s}
        <div class="foot">
          ${this.errors > 0 ? y`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : s}
        </div>
      </div>
    `;
	}
};
_([d({ type: String })], V.prototype, "label", void 0), _([d({
	type: Boolean,
	reflect: !0
})], V.prototype, "editable", void 0), _([d({ attribute: !1 })], V.prototype, "value", void 0), _([d({ attribute: !1 })], V.prototype, "realValue", void 0), _([d({ type: Number })], V.prototype, "maxValue", void 0), _([d({ type: Number })], V.prototype, "precision", void 0), _([d({ type: Number })], V.prototype, "liveNow", void 0), _([d({
	type: Boolean,
	reflect: !0
})], V.prototype, "muted", void 0), _([d({
	type: Boolean,
	reflect: !0
})], V.prototype, "selected", void 0), _([d({ type: Number })], V.prototype, "errors", void 0), _([l()], V.prototype, "pending", void 0), V = _([a("al-strip")], V);
//#endregion
//#region src/al-mixer.ts
var fa = 8e3, pa = (e) => e instanceof Error ? e.message : String(e), H = class extends o {
	constructor(...e) {
		super(...e), this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.live = null, this.narrow = !1, this.preview = null, this.editing = Mt(), this.commandError = null, this.pendingFocus = !1;
	}
	static {
		this.styles = [v, m`
      :host {
        display: block;
        background: none;
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 4px;
        flex-wrap: wrap;
      }
      .preview-status {
        color: var(--secondary-text-color);
        font-size: 0.85em;
        font-variant-numeric: tabular-nums;
      }
      .open-group {
        margin-left: auto;
        border: 1px solid var(--divider-color);
        border-radius: 16px;
        padding: 5px 12px;
        background: transparent;
        color: var(--primary-color);
        font: inherit;
        font-size: 0.85em;
        cursor: pointer;
      }
      .open-group:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .edit {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }
      /* The strips share one row below the hierarchy headers. */
      .grid {
        display: grid;
        gap: 8px;
        align-items: stretch;
        justify-content: start;
        overflow-x: auto;
        padding: 4px;
        outline: none;
        --al-strip-w: 96px;
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
      .band .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.8em;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .band-value {
        margin-left: 4px;
        flex-shrink: 0;
        font-size: 0.8em;
        font-variant-numeric: tabular-nums;
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
      .caret:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }
      .empty {
        padding: 8px 4px;
      }
    `];
	}
	disconnectedCallback() {
		this.clearErrorTimer(), super.disconnectedCallback();
	}
	get tracks() {
		return this.config ? wt(this.config, this.nav) : [];
	}
	get selected() {
		let { config: e, nav: t } = this;
		if (!e || t.selection === null) return null;
		let n = _t(t.selection), r = T(e, n);
		return r === void 0 ? null : {
			path: n,
			group: r
		};
	}
	get selectedId() {
		return this.selected?.group.id ?? null;
	}
	isSelected(e) {
		return this.nav.selection !== null && j(this.nav.selection) === j(e);
	}
	navigate(e) {
		this.pendingFocus = !0, this.dispatchEvent(En(e));
	}
	clearErrorTimer() {
		this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
	}
	fail(e) {
		this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
			this.errorTimer = void 0, this.commandError = null;
		}, fa);
	}
	async command(e, t, n) {
		let r = this.hass;
		if (!(!r || this.preview)) try {
			await t(r), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(Dn());
		} catch (t) {
			n?.settle(null), this.fail(`Could not ${e}: ${pa(t)}`);
		}
	}
	trackOf(e) {
		let t = e.target?.dataset?.index;
		return t === void 0 ? null : this.tracks[Number(t)] ?? null;
	}
	onStripSelect(e) {
		let t = this.trackOf(e);
		t && this.dispatchEvent(En({
			type: "select",
			path: t.path
		}));
	}
	onLevelOverride(t) {
		let n = this.trackOf(t);
		if (!n || this.preview) return;
		let r = t.target, { value: i } = t.detail;
		this.command(`set the level of ${n.id}`, async (t) => r.settle(await e(t, n.id, i)), r);
	}
	onMuteToggle(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let { muted: n } = e.detail;
		this.command(`${n ? "mute" : "unmute"} ${t.id}`, (e) => ce(e, t.id, n));
	}
	onReset(e) {
		let t = this.trackOf(e);
		!t || this.preview || this.command(`reset ${t.id}`, (e) => u(e, t.id));
	}
	onEditToggle(e) {
		this.preview || (this.editing = e.target.checked === !0, Nt(this.editing));
	}
	onBandToggle(e) {
		e.stopPropagation();
		let t = e.currentTarget.dataset.band;
		t !== void 0 && this.navigate({
			type: "toggle",
			id: t
		});
	}
	onBandKey(e) {
		(e.key === "Enter" || e.key === " ") && e.stopPropagation();
	}
	onKeyDown(e) {
		let t = this.config;
		if (t) switch (e.key) {
			case "ArrowRight":
			case "ArrowLeft":
				e.preventDefault(), this.navigate({
					type: "arrow",
					delta: e.key === "ArrowRight" ? 1 : -1,
					config: t
				});
				break;
			case "Enter":
			case " ": {
				let t = this.nav.selection, n = t === null ? void 0 : this.tracks.find((e) => j(e.path) === j(t));
				if (!n?.hasChildren) return;
				e.preventDefault(), this.navigate({
					type: "toggle",
					id: n.id
				});
				break;
			}
			case "Home":
			case "End": e.preventDefault(), this.navigate({
				type: e.key === "Home" ? "home" : "end",
				config: t
			});
		}
	}
	updated(e) {
		if (!e.has("nav")) return;
		let t = this.pendingFocus;
		this.pendingFocus = !1, this.revealSelected(t);
	}
	async revealSelected(e) {
		await this.updateComplete;
		let t = this.shadowRoot?.querySelector("al-strip[tabindex=\"0\"]");
		if (t) {
			e && t.focus();
			try {
				t.scrollIntoView?.({
					inline: "nearest",
					block: "nearest"
				});
			} catch {}
		}
	}
	renderTrack(e, t, n, r) {
		let i = T(e, t.path);
		if (!i) return y``;
		let a = this.live?.groups[i.id], o = this.isSelected(t.path);
		return y`
      <al-strip
        data-index=${n}
        style="grid-column: ${r.columns[n]}; grid-row: ${r.rows + 1};"
        tabindex=${o ? 0 : -1}
        ?editable=${this.editing && !this.preview}
        .label=${i.name ?? i.id}
        .value=${this.preview ? this.preview.values[i.id] ?? null : a?.value ?? 0}
        .liveNow=${this.live?.now ?? 0}
        .realValue=${this.preview ? null : a?.real_value ?? 0}
        .maxValue=${a?.max_value ?? i.max_value ?? e.defaults.max_value}
        .precision=${a?.precision ?? it(e, i)}
        .muted=${this.preview ? !1 : a?.muted ?? !1}
        .selected=${o}
        .errors=${vn(this.errors, t.path)}
      ></al-strip>
    `;
	}
	renderBand(e, t) {
		let n = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${e.depth + 1};`, r = e.id === this.selectedId ? 0 : -1, i = this.live?.groups[e.id], a = this.preview ? this.preview.values[e.id] : i?.value, o = i?.precision ?? (t && this.config ? it(this.config, t) : 1), s = e.expanded ? "Collapse" : "Expand";
		return y`
      <div class="band" role="group" aria-label=${e.label} style=${n}>
        <button
          class="caret"
          type="button"
          data-band=${e.id}
          tabindex=${r}
          aria-expanded=${e.expanded ? "true" : "false"}
          aria-label=${`${s} ${e.label}`}
          title=${`${s} ${e.label}`}
          @click=${this.onBandToggle}
          @keydown=${this.onBandKey}
        >${e.expanded ? "▾" : "▸"}</button>
        <span class="label" title=${e.label}>${e.label}</span>
        <span class="band-value">${a == null ? "" : at(a, o)}</span>
      </div>
    `;
	}
	render() {
		let e = this.config;
		if (!e || e.groups.length === 0) return y`<div class="empty muted">Nothing to mix: add a group first.</div>`;
		let t = Tt(e, this.nav), n = this.tracks, r = new Map(n.map((t) => [t.id, T(e, t.path)])), i = t.kinds.map(() => "var(--al-strip-w)").join(" "), a = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
		return y`
      ${this.commandError === null ? s : y`<ha-alert
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
          <ha-switch class="edit-switch" .disabled=${!!this.preview} .checked=${this.editing && !this.preview} @change=${this.onEditToggle}></ha-switch>
          <span>Edit</span>
        </label>
        <span class="preview-status">${this.preview ? `${this.preview.mode === "history" ? "History" : "Forecast"} · ${(/* @__PURE__ */ new Date(this.preview.time * 1e3)).toLocaleString()} · Read-only` : "Live"}</span>
        ${this.selected ? y`<button class="open-group" type="button"
          @click=${() => this.dispatchEvent(new CustomEvent("al-open-group", {
			detail: this.selected.path,
			bubbles: !0,
			composed: !0
		}))}>Group settings</button>` : s}
      </div>
      <div
        class="grid"
        role="group"
        aria-label="Mixer"
        style="grid-template-columns: ${i}; grid-template-rows: ${a};"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-level-override=${this.onLevelOverride}
        @al-mute-toggle=${this.onMuteToggle}
        @al-reset=${this.onReset}
      >
        ${t.bands.map((e) => this.renderBand(e, r.get(e.id)))}
        ${n.map((n, r) => this.renderTrack(e, n, r, t))}
      </div>
    `;
	}
};
_([d({ attribute: !1 })], H.prototype, "hass", void 0), _([d({ attribute: !1 })], H.prototype, "config", void 0), _([d({ attribute: !1 })], H.prototype, "nav", void 0), _([d({ attribute: !1 })], H.prototype, "errors", void 0), _([d({ attribute: !1 })], H.prototype, "live", void 0), _([d({
	type: Boolean,
	reflect: !0
})], H.prototype, "narrow", void 0), _([d({ attribute: !1 })], H.prototype, "preview", void 0), _([l()], H.prototype, "editing", void 0), _([l()], H.prototype, "commandError", void 0), H = _([a("al-mixer")], H);
//#endregion
//#region src/al-timeline.ts
var ma = 32, ha = 28, ga = 4, _a = 8, va = 800, ya = 220, ba = 160, xa = 2e3, Sa = 6e4, Ca = 1e4, wa = 6e4, Ta = 32, Ea = [
	"24h",
	"7d",
	"30d"
], Da = [
	"off",
	"24h",
	"7d"
], Oa = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], ka = (e) => `hsl(${e * 67 % 360} 55% 62%)`, U = /* @__PURE__ */ new Map(), Aa = /* @__PURE__ */ new Map();
function ja(e, t) {
	let n = Date.now();
	for (let [e, t] of U) n - t.at >= wa && U.delete(e);
	U.delete(e), U.set(e, {
		at: n,
		data: t
	});
	for (let e of U.keys()) {
		if (U.size <= Ta) break;
		U.delete(e);
	}
}
var Ma = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", Na = (e, t) => {
	let n = /* @__PURE__ */ new Date(e * 1e3);
	return t < 86400 ? n.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	}) : n.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}, Pa = (e) => String(Math.round(e * 100) / 100), Fa = (e, t, n) => Math.min(n, Math.max(t, e));
function Ia(e, t, n, r) {
	let i = Math.max(1, r.width - ma), a = Math.max(1, r.height - ha), o = n.start, s = Math.max(n.until, n.end), c = Rt(o, s, i), l = zt(r.maxValue, a), u = Object.keys(e.series), d = u.includes(t) ? t : u[0] ?? t, f = (t, n) => {
		let r = Bt(e.series[t] ?? [], xa);
		return {
			id: t,
			points: r,
			d: Vt(r, c, l),
			color: n
		};
	}, p = f(d, "var(--primary-color)"), ee = r.showChannels ? u.filter((e) => e !== d).map((e, t) => f(e, ka(t))) : [], m = e.forecast, te = m ? Ma(Ht(m, c, l, xa)) : "", ne = m ? Vt(Bt(Ut(m, "p50"), xa), c, l) : "", re = [];
	for (let [, , t] of e.day_types) re.includes(t) || re.push(t);
	let ie = (e) => Oa[re.indexOf(e) % Oa.length], ae = Gt(e.day_types.map(([e, t, n]) => [
		e,
		t,
		n
	]), c, s).map((e) => ({
		...e,
		fill: ie(e.tag)
	})), h = Gt(Object.entries(e.lights).flatMap(([e, t]) => t.map(([t, n]) => [
		t,
		n,
		e
	])), c, s), oe = Gt(e.plan, c, s);
	return {
		busId: d,
		bus: p,
		children: ee,
		band: te,
		p50: ne,
		dayTypes: ae,
		legend: re.map((e) => ({
			tag: e,
			fill: ie(e)
		})),
		lights: h,
		plan: oe,
		x: c,
		y: l,
		t0: o,
		t1: s,
		plotW: i,
		plotH: a
	};
}
var W = class extends o {
	constructor(...e) {
		super(...e), this.groupId = null, this.heading = "", this.labels = {}, this.precisions = {}, this.cursorTime = null, this.viewport = null, this.pinnedTime = null, this.dragging = !1, this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = 14, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = va, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
	}
	static {
		this.styles = [v, m`
      :host {
        display: block;
        position: relative;
        background: var(--card-background-color, #222);
        border: 1px solid var(--divider-color, #4444);
        border-radius: 12px;
        padding: 12px;
        overflow: hidden;
      }
      .transport { margin-top: 10px; }
      .transport-status { font-size: 0.85em; margin-left: auto; }
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
        overflow: hidden;
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
      .tt-value {
        margin-left: auto;
        text-align: right;
        font-variant-numeric: tabular-nums;
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
    `];
	}
	get height() {
		return this.narrow ? ba : ya;
	}
	get refetchable() {
		return !this.paused && document.visibilityState === "visible";
	}
	get forecastReady() {
		let e = this.groupId, t = this.profileState;
		return e === null || !t || !t.trained ? !1 : t.profile.groups[e] !== void 0;
	}
	get learningHint() {
		if (this.forecastReady) return null;
		let e = this.groupId;
		return `learning… ${(e === null ? void 0 : this.profileState?.profile.groups[e]?.days) ?? 0}/${this.minDays} days`;
	}
	connectedCallback() {
		super.connectedCallback(), typeof ResizeObserver < "u" && (this.observer = new ResizeObserver((e) => {
			let t = e[0]?.contentRect.width ?? 0;
			t > 0 && (this.width = t);
		}), this.observer.observe(this)), this.timer = setInterval(() => {
			this.refetchable && this.load();
		}, Sa), this.load();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.observer?.disconnect(), this.observer = void 0, this.timer !== void 0 && clearInterval(this.timer), this.timer = void 0, this.resetLiveWatch(), this.clearViewportTimer(), this.seq++, this.dragging = !1;
	}
	resetLiveWatch() {
		this.liveTimer !== void 0 && clearTimeout(this.liveTimer), this.liveTimer = void 0, this.liveValue = null;
	}
	watchLive() {
		let e = this.groupId, t = e === null ? void 0 : this.live?.groups[e];
		if (!t) return;
		let n = this.liveValue;
		if (n === null) {
			this.liveValue = t.value;
			return;
		}
		Math.abs(t.value - n) <= 10 ** -t.precision / 2 || (this.liveValue = t.value, this.liveTimer === void 0 && (this.liveTimer = setTimeout(() => {
			this.liveTimer = void 0, this.refetchable && this.load(!0);
		}, Ca)));
	}
	willUpdate(e) {
		let t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), n = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
		(t || n) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
	}
	query(e) {
		let t = Math.floor(Date.now() / 1e3 / 60) * 60, n = Lt(t, this.range, this.horizon);
		if (this.viewport) {
			let n = Math.min(t, this.viewport.end);
			return {
				group_id: e,
				start: Math.min(this.viewport.start, n - 3600),
				end: n,
				resolution: n - Math.min(this.viewport.start, n - 3600) <= 86400 ? "5m" : "1h",
				include_children: this.showChannels,
				...this.viewport.end > t ? { forecast_until: Math.min(t + 604800, this.viewport.end) } : {}
			};
		}
		return {
			group_id: e,
			start: n.start,
			end: n.end,
			resolution: n.resolution,
			include_children: this.showChannels,
			...n.forecastUntil === void 0 ? {} : { forecast_until: n.forecastUntil }
		};
	}
	async load(e = !1) {
		let t = this.hass, r = this.groupId;
		if (!t || r === null) return;
		let i = this.query(r), a = qt(i), o = e ? void 0 : U.get(a);
		if (o && Date.now() - o.at < wa) {
			this.seq++, this.loaded = {
				q: i,
				data: o.data
			}, this.error = null, ja(a, o.data);
			return;
		}
		let s = e ? void 0 : Aa.get(a);
		if (!s) {
			let e = n(t, i);
			s = e, Aa.set(a, e), e.then((e) => ja(a, e), () => void 0).finally(() => {
				Aa.get(a) === e && Aa.delete(a);
			});
		}
		let c = ++this.seq;
		try {
			let e = await s;
			if (c !== this.seq) return;
			this.loaded = {
				q: i,
				data: e
			}, this.error = null;
		} catch (e) {
			if (c !== this.seq) return;
			this.error = e.message || String(e);
		}
	}
	get paths() {
		let e = this.loaded;
		if (!e) return null;
		let t = [
			e.data,
			this.viewport,
			e.q.group_id,
			e.q.start,
			e.q.end,
			e.q.forecast_until,
			this.width,
			this.height,
			this.maxValue,
			this.showChannels
		], n = this.memo;
		if (n && n.key.length === t.length && n.key.every((e, n) => e === t[n])) return n.value;
		let r = Ia(e.data, e.q.group_id, this.viewport ? {
			...this.viewport,
			until: this.viewport.end
		} : {
			start: e.q.start,
			end: e.q.end,
			until: e.q.forecast_until ?? e.q.end
		}, {
			width: this.width,
			height: this.height,
			maxValue: this.maxValue,
			showChannels: this.showChannels
		});
		return this.memo = {
			key: t,
			value: r
		}, r;
	}
	nowAt() {
		return this.live?.now ?? Math.floor(Date.now() / 1e3);
	}
	tailPath(e) {
		let t = this.groupId, n = this.live;
		if (t === null || n === null) return "";
		let r = n.groups[t];
		return !r || e.bus.id !== t ? "" : Vt(Wt(e.bus.points, n.now, r.value, e.t0, e.t1), e.x, e.y);
	}
	emitSettings() {
		this.dispatchEvent(On({
			range: this.range,
			horizon: this.horizon,
			showChannels: this.showChannels,
			showLights: this.showLights
		}));
	}
	setRange(e) {
		this.range !== e && (this.range = e, this.resetTransport(), this.cursorIndex = null, this.emitSettings());
	}
	setHorizon(e) {
		this.horizon !== e && (this.horizon = e, this.resetTransport(), this.cursorIndex = null, this.emitSettings());
	}
	toggleChannels() {
		this.showChannels = !this.showChannels, this.emitSettings();
	}
	toggleLights() {
		this.showLights = !this.showLights, this.emitSettings();
	}
	timeAt(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.width > 0 ? this.width / n.width : 1, i = Fa(((e.clientX - n.left) * r - ma) / t.plotW, 0, 1);
		return t.t0 + i * (t.t1 - t.t0);
	}
	emitTransport() {
		let e = {
			time: this.cursorTime,
			window: this.viewport
		};
		this.dispatchEvent(new CustomEvent("al-transport", {
			detail: e,
			bubbles: !0,
			composed: !0
		}));
	}
	clearViewportTimer() {
		this.viewportTimer !== void 0 && clearTimeout(this.viewportTimer), this.viewportTimer = void 0;
	}
	resetTransport() {
		this.clearViewportTimer(), this.seq++, this.viewport = null, this.pinnedTime = null, this.cursorTime = null, this.cursorIndex = null, this.emitTransport(), this.load();
	}
	selectTime(e) {
		this.cursorTime = e;
		let t = this.paths?.bus.points ?? [];
		this.cursorIndex = e === null || !t.length ? null : Kt(t, e), this.emitTransport();
	}
	onMove(e) {
		let t = this.paths;
		if (!t) return;
		let n = this.timeAt(e, t);
		this.dragging && (this.pinnedTime = n), this.selectTime(n);
	}
	onPin(e) {
		let t = this.paths;
		t && (this.pinnedTime = this.timeAt(e, t), this.selectTime(this.pinnedTime));
	}
	onPointerDown(e) {
		e.button === 0 && (this.dragging = !0, e.currentTarget.setPointerCapture?.(e.pointerId), this.onPin(e));
	}
	onPointerUp(e) {
		this.dragging &&= (this.onPin(e), !1);
	}
	onLeave() {
		this.dragging || this.selectTime(this.pinnedTime);
	}
	changeWindow(e, t = !1) {
		this.clearViewportTimer(), this.seq++, this.viewport = Jt(e, Date.now() / 1e3), this.emitTransport(), t ? this.load() : this.viewportTimer = setTimeout(() => {
			this.viewportTimer = void 0, this.load();
		}, 100);
	}
	zoom(e, t) {
		let n = this.paths;
		n && this.changeWindow(Yt({
			start: n.t0,
			end: n.t1
		}, t ?? this.cursorTime ?? (n.t0 + n.t1) / 2, e, Date.now() / 1e3));
	}
	onWheel(e) {
		let t = this.paths;
		if (t) {
			if (e.ctrlKey || e.metaKey) e.preventDefault(), this.zoom(Math.exp(Fa(e.deltaY, -100, 100) * .01), this.timeAt(e, t));
			else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
				e.preventDefault();
				let n = e.deltaX * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? t.plotW : 1) / t.plotW * (t.t1 - t.t0);
				this.changeWindow({
					start: t.t0 + n,
					end: t.t1 + n
				});
			}
		}
	}
	jump(e) {
		let t = this.paths;
		if (!t) return;
		let n = Date.now() / 1e3, r = Math.min(n + 604800, (this.cursorTime ?? this.pinnedTime ?? n) + e * 86400);
		this.pinnedTime = r, this.selectTime(r);
		let i = t.t1 - t.t0;
		this.changeWindow({
			start: r - i / 2,
			end: r + i / 2
		}, !0);
	}
	onKeyDown(e) {
		let t = this.paths;
		if (!t) return;
		if (e.key === "Escape") {
			if (this.cursorTime === null && this.pinnedTime === null) return;
			e.preventDefault(), this.pinnedTime = null, this.selectTime(null);
			return;
		}
		let n = t.bus.points.length - 1;
		if (n < 0 || e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
		e.preventDefault();
		let r = (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1);
		this.cursorIndex = this.cursorIndex === null ? r > 0 ? 0 : n : Fa(this.cursorIndex + r, 0, n), this.pinnedTime = t.bus.points[this.cursorIndex][0], this.selectTime(this.pinnedTime);
	}
	renderChips() {
		let e = this.learningHint;
		return y`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${Ea.map((e) => y`
              <button
                class="chip range"
                data-range=${e}
                aria-pressed=${this.range === e ? "true" : "false"}
                @click=${() => this.setRange(e)}
              >
                ${e}
              </button>
            `)}
        </div>
        <div class="chips horizons" role="group" aria-label="Forecast horizon">
          ${Da.map((t) => {
			let n = t !== "off" && !this.forecastReady;
			return y`
              <button
                class="chip horizon"
                data-horizon=${t}
                aria-pressed=${this.horizon === t ? "true" : "false"}
                ?disabled=${n}
                aria-disabled=${n ? "true" : "false"}
                title=${n ? e ?? "" : ""}
                @click=${() => this.setHorizon(t)}
              >
                ${t}
              </button>
            `;
		})}
        </div>
        ${e ? y`<span class="muted hint" title=${e}>${e}</span>` : s}
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
		let n = this.width, r = this.height, i = e.x(this.nowAt()), a = this.tailPath(e), o = e.plotH + ga, c = this.cursorTime === null ? null : e.x(this.cursorTime), l = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
		return y`
      <svg
        class="chart"
        viewBox="0 0 ${n} ${r}"
        role="img"
        tabindex="0"
        aria-label=${l}
        @mousemove=${this.onMove}
        @pointermove=${this.onMove}
        @pointerdown=${this.onPointerDown}
        @pointerup=${this.onPointerUp}
        @pointercancel=${() => {
			this.dragging = !1, this.onLeave();
		}}
        @lostpointercapture=${() => {
			this.dragging = !1;
		}}
        @click=${this.onPin}
        @wheel=${this.onWheel}
        @mouseleave=${this.onLeave}
        @keydown=${this.onKeyDown}
      >
        ${[
			1,
			.5,
			0
		].map((r) => t`
            <line class="grid" x1=${ma} y1=${e.y(this.maxValue * r)} x2=${n} y2=${e.y(this.maxValue * r)}></line>
            <text class="ytick" x=${28} y=${e.y(this.maxValue * r) + 3} text-anchor="end">
              ${Pa(this.maxValue * r)}
            </text>
          `)}
        <g transform="translate(${ma},0)">
          ${e.dayTypes.map((n) => t`<rect
              class="daytype"
              x=${n.x0}
              y="0"
              width=${Math.max(0, n.x1 - n.x0)}
              height=${e.plotH}
              fill=${n.fill}
            ></rect>`)}
          ${this.forecastReady && e.band ? t`<polygon class="band" points=${e.band}></polygon>` : s}
          ${this.forecastReady && e.p50 ? t`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : s}
          ${e.children.map((e) => t`<path class="child" d=${e.d} stroke=${e.color}></path>`)}
          ${e.bus.d ? t`<path class="bus" d=${e.bus.d}></path>` : s}
          ${a ? t`<path class="tail" d=${a}></path>` : s}
          ${this.showLights ? e.lights.map((e) => t`<rect
                  class="light"
                  x=${e.x0}
                  y=${o}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${_a}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`) : s}
          ${this.showLights ? e.plan.map((e) => t`<rect
                  class="plan"
                  x=${e.x0}
                  y=${o}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${_a}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`) : s}
          ${i >= 0 && i <= e.plotW ? t`<line class="now" x1=${i} y1="0" x2=${i} y2=${e.plotH}></line>
          <text class="now-label" x=${i + 3} y="10">now</text>` : s}
          ${c === null ? s : t`<line class="cursor" x1=${c} y1="0" x2=${c} y2=${e.plotH}></line>`}
          ${this.renderXLabels(e)}
        </g>
      </svg>
    `;
	}
	renderXLabels(e) {
		let n = this.height - 6;
		return [
			[0, "start"],
			[.5, "middle"],
			[1, "end"]
		].map(([r, i]) => t`<text class="xlabel" x=${r * e.plotW} y=${n} text-anchor=${i}>
        ${Na(e.t0 + r * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`);
	}
	renderTooltip(e) {
		let t = this.cursorTime;
		if (t === null || t < e.t0 || t > e.t1) return s;
		let n = this.forecastReady ? this.loaded?.data.forecast : null, r = this.loaded?.q.resolution === "5m" ? 600 : 7200, i = t > this.nowAt() ? n ? Xt(Ut(n, "p50"), t) : null : Xt(e.bus.points, t, r), a = (ma + e.x(t)) / this.width * 100, o = this.loaded?.data.day_types.find(([e, n]) => t >= e && t < n)?.[2], c = (e, t) => {
			if (t === null) return null;
			let n = at(t, this.precisions[e] ?? this.live?.groups[e]?.precision ?? 1);
			return Number(n) === 0 ? null : n;
		}, l = c(e.busId, i), u = e.children.flatMap((e) => {
			let n = c(e.id, Xt(e.points, t, r));
			return n === null ? [] : [{
				...e,
				formatted: n
			}];
		});
		return y`
      <div class="tooltip ${a > 60 ? "flip" : ""}" style="left: ${a}%">
        <div class="tt-time">${(/* @__PURE__ */ new Date(t * 1e3)).toLocaleString()}</div>
        ${l === null ? s : y`<div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${l}</span>
        </div>`}
        ${u.slice(0, 5).map((e) => y`
          <div class="tt-row">
            <span class="tt-swatch" style="background: ${e.color}"></span>
            <span class="tt-name">${this.labels[e.id] ?? e.id.replaceAll("_", " ")}</span>
            <span class="tt-value">${e.formatted}</span>
          </div>
        `)}
        ${u.length > 5 ? y`<div class="muted">+${u.length - 5} channels</div>` : s}
        ${o ? y`<div class="tt-daytype muted">${o}</div>` : s}
      </div>
    `;
	}
	render() {
		if (this.groupId === null) return y`<div class="placeholder muted">Select a strip to see its timeline.</div>`;
		let e = this.paths;
		return y`
      ${this.renderChips()}
      ${e ? this.renderChart(e) : y`<div class="placeholder muted">Loading…</div>`}
      <div class="transport toolbar" role="group" aria-label="Timeline transport">
        <button class="chip" aria-label="Zoom out" @click=${() => this.zoom(2)}>−</button>
        <button class="chip" aria-label="Zoom in" @click=${() => this.zoom(.5)}>+</button>
        ${[
			-7,
			-3,
			-1
		].map((e) => y`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>${e}d</button>`)}
        <button class="chip transport-now" @click=${this.resetTransport}>Now</button>
        ${[
			1,
			3,
			7
		].map((e) => y`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>+${e}d</button>`)}
        <span class="muted transport-status">${this.cursorTime === null ? "Live" : `${this.cursorTime > this.nowAt() ? "Forecast" : "History"} · ${(/* @__PURE__ */ new Date(this.cursorTime * 1e3)).toLocaleString()}`}</span>
      </div>
      ${e && e.legend.length > 0 ? y`
            <div class="legend">
              ${e.legend.map((e) => y`
                  <span class="legend-item">
                    <span class="swatch" style="background: ${e.fill}"></span>${e.tag}
                  </span>
                `)}
            </div>
          ` : s}
      ${this.error ? y`<div class="error">Timeline: ${this.error}</div>` : s}
      ${e ? this.renderTooltip(e) : s}
    `;
	}
};
_([d({ attribute: !1 })], W.prototype, "hass", void 0), _([d({ attribute: !1 })], W.prototype, "groupId", void 0), _([d({ attribute: !1 })], W.prototype, "heading", void 0), _([d({ attribute: !1 })], W.prototype, "labels", void 0), _([d({ attribute: !1 })], W.prototype, "precisions", void 0), _([l()], W.prototype, "cursorTime", void 0), _([l()], W.prototype, "viewport", void 0), _([d({ attribute: !1 })], W.prototype, "range", void 0), _([d({ attribute: !1 })], W.prototype, "horizon", void 0), _([d({ type: Boolean })], W.prototype, "showChannels", void 0), _([d({ type: Boolean })], W.prototype, "showLights", void 0), _([d({ attribute: !1 })], W.prototype, "live", void 0), _([d({ type: Number })], W.prototype, "maxValue", void 0), _([d({ attribute: !1 })], W.prototype, "profileState", void 0), _([d({ type: Number })], W.prototype, "minDays", void 0), _([d({
	type: Boolean,
	reflect: !0
})], W.prototype, "narrow", void 0), _([d({ type: Boolean })], W.prototype, "paused", void 0), _([l()], W.prototype, "cursorIndex", void 0), _([l()], W.prototype, "width", void 0), _([l()], W.prototype, "loaded", void 0), _([l()], W.prototype, "error", void 0), W = _([a("al-timeline")], W);
//#endregion
//#region src/al-strip-controls.ts
var La = [
	"name",
	"mix",
	"null_handling",
	"gain"
], Ra = 5, za = (e) => e[e.length - 2] === "stimuli", G = class extends o {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.statusOnly = !1, this.simLog = null;
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	emitChange(e, t) {
		this.dispatchEvent(N(e, t));
	}
	setField(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(x(n, [...r, e], t), `${j(r)}:${e}`);
	}
	onBusForm(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = T(t, n);
		if (!r) return;
		let i = pr(r, e.detail?.value ?? {}), a = mr(i, r);
		a !== void 0 && this.emitChange(x(t, n, i), `${j(n)}:${a}`);
	}
	onSim(e, t) {
		this.dispatchEvent(kn(e, t.target.checked === !0));
	}
	onRebuild() {
		this.dispatchEvent(An());
	}
	renderChannel(e, t) {
		return y`<al-stimulus-editor
      .hass=${this.hass}
      .config=${e}
      .path=${t}
      .errors=${this.errors}
      .live=${this.live}
    ></al-stimulus-editor>`;
	}
	renderBus(e, t) {
		let n = T(e, t);
		if (!n) return y`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		if (this.statusOnly) return y`<ha-card>${this.renderStatus(e, n)}</ha-card>`;
		let r = t.length === 2, i = this.errors.filter((e) => e.path === j(t)), a = M(this.errors, t);
		return y`
      <ha-card header=${n.name ?? n.id}>
        ${i.map((e) => y`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${fr(n, r, La, e)}
              .schema=${dr(n, r, La, e)}
              .error=${a}
              .computeLabel=${Qn}
              .computeHelper=${$n}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${or}
              .value=${n.max_value}
              .inherited=${e.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${a.max_value}
              @value-changed=${(e) => this.setField("max_value", e.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              .label=${Xn.precision}
              kind="select"
              .selector=${sr}
              .value=${n.precision === null ? null : String(n.precision)}
              .inherited=${String(e.defaults.precision)}
              .inheritedFrom=${"defaults"}
              .error=${a.precision}
              @value-changed=${(e) => this.setField("precision", e.detail.value === null ? null : Number(e.detail.value))}
            ></al-override-field>
          </div>
          ${this.renderStatus(e, n)}
        </div>
        ${this.renderStimuli(e, n, t)}
      </ha-card>
    `;
	}
	renderStimuli(e, t, n) {
		let r = w(e).enabled && st(e).has(t.id);
		return y`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${r ? this.renderPresence(e, t, n) : s}
        ${t.stimuli.length === 0 && !r ? y`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((t, r) => this.renderStimulus(e, [
			...n,
			"stimuli",
			r
		], t))}
      </div>
    `;
	}
	renderPresence(e, t, n) {
		let r = this.live?.voices[t.id]?.find((e) => e.label === Ke);
		return y`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${r ? y`<span class="chip phase ${r.phase}">${r.phase}</span>` : s}
        </div>
        <al-presence-overrides
          .hass=${this.hass}
          .config=${e}
          .path=${n}
          .errors=${this.errors}
        ></al-presence-overrides>
      </ha-expansion-panel>
    `;
	}
	renderStimulus(e, t, n) {
		let r = this.hass?.states[n.entity], i = r?.attributes.friendly_name ?? (n.entity || "(no entity)"), a = vn(this.errors, t);
		return y`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          ${r ? y`<ha-state-icon .hass=${this.hass} .stateObj=${r}></ha-state-icon>` : y`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${n.key ?? i}</span>
          ${a ? y`<span class="badge" title="${a} problem(s)">${a}</span>` : s}
          ${r ? y`<span class="muted chip">${gn(this.hass, n.entity)}</span>` : s}
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
		let n = t.id, r = this.live?.groups[n]?.precision ?? it(e, t), i = this.live?.groups[n]?.lights ?? 0, a = this.hass?.states[ye(n)], o = this.simLog?.blocked[n] ?? null, c = (this.simLog?.entries ?? []).filter((e) => e.group_id === n).sort((e, t) => t.t - e.t).slice(0, Ra);
		return y`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${i} light${i === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${i > 0 ? y`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${a?.state === "on"}
                .disabled=${a === void 0}
                title=${a === void 0 ? "No simulation switch for this group" : "Presence simulation"}
                @change=${(e) => this.onSim(n, e)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : s}
        ${o === null ? s : y`<div class="muted blocked">Blocked: ${o}</div>`}
        ${this.renderSensor("expected", "Expected", be(n), r)}
        ${this.renderSensor("anomaly", "Anomaly", xe(n), r)}
        <div class="muted readiness">${this.readiness(e, n)}</div>
        ${c.length > 0 ? y`<ol class="log">
              ${c.map((e) => this.renderLogEntry(e))}
            </ol>` : y`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
	}
	renderSensor(e, t, n, r) {
		let i = this.hass?.states[n], a = i?.attributes.day_type, o = i?.state, c = o === void 0 ? NaN : Number(o), l = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(c) ? at(c, r) : o;
		return y`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${l}</span>
      ${typeof a == "string" ? y`<span class="muted">${a}</span>` : s}
    </div>`;
	}
	renderLogEntry(e) {
		return y`<li>
      <span class="muted">${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
    </li>`;
	}
	readiness(e, t) {
		let n = this.profileState;
		if (!n) return "Profile not loaded.";
		let r = n.profile.groups[t]?.days ?? 0, i = e.defaults.patterns?.min_days ?? 14;
		return n.ready[t] === !0 ? `Profile ready · ${r} days learned` : `Learning… ${r}/${i} days`;
	}
	render() {
		let { config: e, path: t } = this;
		return !e || !t || t.length === 0 ? y`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : za(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
	}
};
_([d({ attribute: !1 })], G.prototype, "hass", void 0), _([d({ attribute: !1 })], G.prototype, "config", void 0), _([d({ attribute: !1 })], G.prototype, "path", void 0), _([d({ attribute: !1 })], G.prototype, "errors", void 0), _([d({ attribute: !1 })], G.prototype, "live", void 0), _([d({ attribute: !1 })], G.prototype, "profileState", void 0), _([d({ type: Boolean })], G.prototype, "statusOnly", void 0), _([d({ attribute: !1 })], G.prototype, "simLog", void 0), G = _([a("al-strip-controls")], G);
//#endregion
//#region src/al-patterns.ts
var Ba = 50;
function Va(e) {
	let t = [], n = (r) => {
		t.push({
			id: r.id,
			label: r.name ?? r.id,
			precision: e ? it(e, r) : 0
		}), r.children.forEach(n);
	};
	return e?.groups.forEach(n), t;
}
function Ha(e, t) {
	if (e === void 0) return "—";
	let n = Number(e);
	return e.trim() !== "" && Number.isFinite(n) ? at(n, t) : e;
}
var Ua = (e) => (/* @__PURE__ */ new Date(e * 1e3)).toLocaleDateString(), K = class extends o {
	constructor(...e) {
		super(...e), this.profileState = null, this.simLog = null, this.force = !1;
	}
	static {
		this.styles = [v, m`
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
    `];
	}
	onRebuild() {
		this.dispatchEvent(An(this.force));
	}
	renderStatus() {
		let e = this.profileState;
		if (!e) return y`<div class="status muted">Profile not loaded yet.</div>`;
		let { producer: t, generated_at: n, training_window: r, day_types: i, slot_minutes: a } = e.profile;
		return y`
      <div class="status">
        <div class="trained ${e.trained ? "yes" : "no"}">
          ${e.trained ? "Trained" : "Not trained yet — learning from history."}
        </div>
        <div><span class="muted">Producer</span> <span class="producer">${t.name} ${t.version}</span></div>
        <div>
          <span class="muted">Generated</span>
          <span class="generated">${(/* @__PURE__ */ new Date(n * 1e3)).toLocaleString()}</span>
        </div>
        <div>
          <span class="muted">Learned from</span>
          <span class="window">${Ua(r[0])} – ${Ua(r[1])}</span>
        </div>
        <div class="muted">${i.join(", ")} · ${a}-minute slots</div>
      </div>
    `;
	}
	renderReadiness() {
		let e = this.profileState, t = Va(this.config);
		if (!e || t.length === 0) return y`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
		let n = this.config?.defaults.patterns?.min_days ?? 14;
		return y`
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
          ${t.map((t) => this.renderRow(t, e, n))}
        </tbody>
      </table>
    `;
	}
	renderRow(e, t, n) {
		let r = t.ready[e.id] === !0, i = t.profile.groups[e.id]?.days ?? 0, a = this.hass?.states[be(e.id)]?.state;
		return y`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${r ? "yes" : "no"}" title=${r ? "Ready" : `Needs ${n} days`}>
        ${r ? "✓" : "✗"}
      </td>
      <td class="days">${i}</td>
      <td class="expected">${Ha(a, e.precision)}</td>
    </tr>`;
	}
	renderBlocked() {
		let e = Object.entries(this.simLog?.blocked ?? {}).filter((e) => typeof e[1] == "string");
		if (e.length === 0) return s;
		let t = Va(this.config), n = (e) => t.find((t) => t.id === e)?.label ?? e;
		return y`<ul class="blocked">
      ${e.map(([e, t]) => y`<li><span class="group">${n(e)}:</span> <span>${t}</span></li>`)}
    </ul>`;
	}
	renderLog() {
		let e = [...this.simLog?.entries ?? []].sort((e, t) => t.t - e.t).slice(0, Ba);
		return e.length === 0 ? y`<div class="muted log-empty">No simulated light changes yet.</div>` : y`<ol class="log">
      ${e.map((e) => this.renderEntry(e))}
    </ol>`;
	}
	renderEntry(e) {
		return y`<li>
      <span class="muted">${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
      ${e.brightness === null ? s : y`<span class="muted">${e.brightness}</span>`}
    </li>`;
	}
	render() {
		return y`
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
_([d({ attribute: !1 })], K.prototype, "hass", void 0), _([d({ attribute: !1 })], K.prototype, "config", void 0), _([d({ attribute: !1 })], K.prototype, "profileState", void 0), _([d({ attribute: !1 })], K.prototype, "simLog", void 0), _([l()], K.prototype, "force", void 0), K = _([a("al-patterns")], K);
//#endregion
//#region src/types.ts
var Wa = [
	"phone",
	"watch",
	"tag",
	"laptop",
	"other"
], Ga = [
	"activity",
	"steps",
	"battery_state"
], Ka = {
	phone: "mdi:cellphone",
	watch: "mdi:watch",
	tag: "mdi:tag",
	laptop: "mdi:laptop",
	other: "mdi:bluetooth"
}, qa = {
	phone: "Phone",
	watch: "Watch",
	tag: "Tag",
	laptop: "Laptop",
	other: "Other"
}, Ja = {
	activity: "Activity",
	steps: "Steps",
	battery_state: "Battery state"
}, Ya = { entity: { filter: {
	domain: "device_tracker",
	integration: "bermuda"
} } }, Xa = { entity: { filter: { domain: "person" } } }, Za = { entity: { filter: {
	domain: "device_tracker",
	integration: "mobile_app"
} } }, Qa = { entity: { filter: { domain: "sensor" } } }, $a = { select: {
	mode: "dropdown",
	options: Wa.map((e) => ({
		value: e,
		label: qa[e]
	}))
} }, eo = class extends o {
	constructor(...e) {
		super(...e), this.errors = [], this.presence = null;
	}
	static {
		this.styles = [
			v,
			ne,
			m`
      :host {
        display: block;
        background: none;
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
        flex-wrap: wrap;
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
      .device summary { overflow-wrap: anywhere; cursor: pointer; padding: 10px 0; color: var(--primary-text-color); font-weight: 600; }
      .device-kind { margin-left: 8px; font-weight: 400; color: var(--secondary-text-color); }
      .device-body { padding: 8px 0 12px; }
      .device .fields { gap: 16px; }
      .device-head { justify-content: space-between; margin-bottom: 16px; }
      .add-device { margin-top: 12px; }
      .fields {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
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
	}
	get people() {
		return this.config ? w(this.config).people : [];
	}
	emit(e, t, n = !1) {
		let r = this.config;
		if (!r) return;
		let i = x(r, ["presence"], {
			...w(r),
			people: e
		});
		this.dispatchEvent(n ? N(i, void 0, !0) : N(i, `presence:people:${t}`));
	}
	editPerson(e, t, n) {
		this.emit(this.people.map((n, r) => r === e ? {
			...n,
			...t
		} : n), `${e}:${n}`);
	}
	editDevice(e, t, n, r) {
		let i = this.people[e];
		if (!i) return;
		let a = i.devices.map((e, r) => r === t ? {
			...e,
			...n
		} : e);
		this.emit(this.people.map((t, n) => n === e ? {
			...t,
			devices: a
		} : t), `${e}:${t}:${r}`);
	}
	addPerson() {
		this.emit([...this.people, et()], "add", !0);
	}
	removePerson(e) {
		this.emit(this.people.filter((t, n) => n !== e), "remove", !0);
	}
	addDevice(e) {
		let t = this.people[e];
		t && this.editPerson(e, { devices: [...t.devices, $e("")] }, "add-device");
	}
	removeDevice(e, t) {
		this.people[e] && this.emit(this.people.map((n, r) => r === e ? {
			...n,
			devices: n.devices.filter((e, n) => n !== t)
		} : n), `${e}:remove-device`, !0);
	}
	found(e, t) {
		let n = (e.name === null ? [] : Object.values(this.presence?.people?.[e.name]?.devices ?? {})).find((e) => e.tracker === t.tracker);
		return n ? n.found : null;
	}
	text(e) {
		return e ?? "";
	}
	renderSignal(e, t, n, r, i, a) {
		let o = Object.values(this.presence?.people ?? {}).flatMap((e) => Object.values(e.devices ?? {})).find((e) => e.tracker === n.tracker)?.signals[r], c = i === null ? s : i[r] ? y`<ha-icon class="found" icon="mdi:check-circle-outline" title="Found"></ha-icon>` : n.signals[r] || o ? y`<ha-icon class="missing" icon="mdi:alert-circle-outline" title="Configured but unavailable"></ha-icon>` : y`<span class="muted" title="Optional: no sensor configured or discovered">Optional</span>`;
		return y`<div class="signal signal-${r}">
      <ha-selector
        .hass=${this.hass}
        .selector=${Qa}
        .label=${Ja[r]}
        .helper=${n.companion ? "Blank: found on the companion device when available." : "Optional. Movement can also be detected from Bluetooth."}
        .required=${!1}
        .value=${this.text(n.signals[r])}
        @value-changed=${(i) => this.editDevice(e, t, { signals: {
			...n.signals,
			[r]: i.detail.value ? i.detail.value : null
		} }, r)}
      ></ha-selector>
      ${c}
      ${a[r] ? y`<div class="error">${a[r]}</div>` : s}
    </div>`;
	}
	renderDevice(e, t, n, r) {
		let i = M(this.errors, [
			"presence",
			"people",
			e,
			"devices",
			t
		]), a = M(this.errors, [
			"presence",
			"people",
			e,
			"devices",
			t,
			"signals"
		]), o = this.found(n, r), c = Object.values(this.presence?.people?.[n.name ?? ""]?.devices ?? {}).find((e) => e.tracker === r.tracker), l = r.name ?? c?.name ?? (r.tracker || "New device");
		return y`<details class="device" ?open=${!r.tracker || Object.keys(i).length > 0 || Object.keys(a).length > 0}>
      <summary>${l}${l === qa[r.kind] ? s : y`<span class="device-kind">${qa[r.kind]}</span>`}</summary>
      <div class="device-body"><div class="device-head">
        <div class="resource-links">${Hn(this, this.hass, r.tracker, "Open tracker", c?.device_id, "Open Bermuda device", !0)}</div>
        <button type="button"
          class="remove-device"
          aria-label="Remove device"
          @click=${() => this.removeDevice(e, t)}
          >Remove device</button>
      </div>
      <div class="fields">
        <ha-selector
          class="tracker"
          .hass=${this.hass}
          .selector=${Ya}
          .label=${"Bermuda tracker"}
          .required=${!0}
          .value=${r.tracker}
          @value-changed=${(n) => this.editDevice(e, t, { tracker: n.detail.value ?? "" }, "tracker")}
        ></ha-selector>
        ${i.tracker ? y`<div class="error">${i.tracker}</div>` : s}
        <ha-selector
          class="device-name"
          .hass=${this.hass}
          .selector=${{ text: {} }}
          .label=${"Name"}
          .helper=${"Blank: the Bermuda device's name."}
          .required=${!1}
          .value=${this.text(r.name)}
          @value-changed=${(n) => this.editDevice(e, t, { name: n.detail.value ? n.detail.value : null }, "name")}
        ></ha-selector>
        <ha-selector
          class="kind"
          .hass=${this.hass}
          .selector=${$a}
          .label=${"Kind"}
          .required=${!0}
          .value=${r.kind}
          @value-changed=${(n) => this.editDevice(e, t, { kind: n.detail.value ?? "other" }, "kind")}
        ></ha-selector>
        <ha-selector
          class="companion"
          .hass=${this.hass}
          .selector=${Za}
          .label=${"Companion app tracker"}
          .helper=${"Optional. The companion tracker for this device supplies carrying evidence."}
          .required=${!1}
          .value=${this.text(r.companion)}
          @value-changed=${(n) => this.editDevice(e, t, { companion: n.detail.value ? n.detail.value : null }, "companion")}
        ></ha-selector>
        ${Ga.map((n) => this.renderSignal(e, t, r, n, o, a))}
      </div></div>
    </details>`;
	}
	renderPerson(e, t) {
		let n = M(this.errors, [
			"presence",
			"people",
			e
		]);
		return y`<div class="person">
      <div class="person-head">
        <ha-icon icon="mdi:account"></ha-icon>
        <h4>${t.name ?? t.devices[0]?.name ?? t.person ?? "New person"}</h4>
        <button type="button" class="remove-person" aria-label="Remove person" @click=${() => this.removePerson(e)}
          >Remove person</button>
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
          @value-changed=${(t) => this.editPerson(e, { name: t.detail.value ? t.detail.value : null }, "name")}
        ></ha-selector>
        ${n.name ? y`<div class="error">${n.name}</div>` : s}
        <ha-selector
          class="person-entity"
          .hass=${this.hass}
          .selector=${Xa}
          .label=${"Person"}
          .helper=${"Its device_trackers seed the devices below: Bermuda ones to follow, a mobile_app one as the companion."}
          .required=${!1}
          .value=${this.text(t.person)}
          @value-changed=${(t) => this.editPerson(e, { person: t.detail.value ? t.detail.value : null }, "person")}
        ></ha-selector>
        ${n.person ? y`<div class="error">${n.person}</div>` : s}
      </div>
      ${t.devices.map((n, r) => this.renderDevice(e, r, t, n))}
      <button type="button" class="add-device" @click=${() => this.addDevice(e)}>Add device</button>
    </div>`;
	}
	render() {
		if (!this.config) return s;
		let e = this.people;
		return y`
      ${e.length === 0 ? y`<div class="empty">Nobody is followed yet. Add a person and pick their person entity.</div>` : s}
      ${e.map((e, t) => this.renderPerson(t, e))}
      <button type="button" class="add-person" @click=${() => this.addPerson()}>Add person</button>
    `;
	}
};
_([d({ attribute: !1 })], eo.prototype, "hass", void 0), _([d({ attribute: !1 })], eo.prototype, "config", void 0), _([d({ attribute: !1 })], eo.prototype, "errors", void 0), _([d({ attribute: !1 })], eo.prototype, "presence", void 0), eo = _([a("al-people-editor")], eo);
function to(e) {
	let t = [], n = (e, r, i) => {
		let a = r <= 1 ? e.id : i;
		t.push({
			id: e.id,
			label: e.name ?? e.id,
			branch: a
		}), e.children.forEach((e) => n(e, r + 1, a));
	};
	return e.groups.forEach((e) => n(e, 0, e.id)), t;
}
function no(e, t) {
	if (e === 0 && t === 0) return 0;
	let n = e === 0 ? Infinity : 60 / Math.abs(e), r = t === 0 ? Infinity : 27 / Math.abs(t);
	return Math.min(n, r, .5);
}
function ro(e, t) {
	let n = new Set(t.nodes), r = new Set(t.exits), i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let t of to(e)) {
		if (o.set(t.id, t.label), !n.has(t.id)) continue;
		let e = a.get(t.branch);
		e === void 0 && (e = i.length, a.set(t.branch, e), i.push([])), i[e].push(t.id);
	}
	let s = [];
	i.forEach((e, t) => e.forEach((e, n) => s.push({
		id: e,
		label: o.get(e) ?? e,
		row: t,
		col: n,
		x: 60 + n * 160,
		y: 60 + t * 110,
		exit: r.has(e)
	})));
	let c = new Map(s.map((e) => [e.id, e])), l = [];
	for (let [e, n, r] of t.edges) {
		let t = c.get(e), i = c.get(n);
		if (!t || !i) continue;
		let a = i.x - t.x, o = i.y - t.y, s = no(a, o);
		l.push({
			a: e,
			b: n,
			oneWay: r,
			x1: t.x + a * s,
			y1: t.y + o * s,
			x2: i.x - a * s,
			y2: i.y - o * s
		});
	}
	return {
		nodes: s,
		edges: l,
		width: 120 + (i.reduce((e, t) => Math.max(e, t.length), 1) - 1) * 160,
		height: 120 + (Math.max(i.length, 1) - 1) * 110
	};
}
var io = (e, t) => ({
	x: e.x1 + (e.x2 - e.x1) * t,
	y: e.y1 + (e.y2 - e.y1) * t
}), ao = (e, t, n) => e.edges.find((e) => e.a === t && e.b === n || e.a === n && e.b === t);
function oo(e, t) {
	let n = [];
	for (let r = 1; r < t.length; r++) {
		let i = ao(e, t[r - 1], t[r]);
		i && n.push(i);
	}
	return n;
}
//#endregion
//#region src/al-presence.ts
var so = 2e3, co = "away", lo = {
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
}, uo = {
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
}, fo = [
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
], po = [
	"charging",
	"moving",
	"still_room_empty",
	"jitter"
], mo = [
	{
		id: "tracking",
		title: "Tracking",
		hint: "Turn room estimation on and choose when a person counts as present.",
		fields: [
			"enabled",
			"envelope",
			"threshold"
		]
	},
	{
		id: "rooms",
		title: "Room estimation",
		hint: "Tune how quickly estimates move between rooms and recover from weak signals.",
		fields: [
			"stay",
			"escape",
			"scale",
			"floor",
			"stuck_after",
			"activity_floor"
		]
	},
	{
		id: "carrying",
		title: "Device carrying",
		hint: "Tune how long carrying estimates persist and how parked devices affect room estimates.",
		fields: [
			"carried_prior",
			"carried_flip",
			"carried_recent",
			"carried_nearby"
		]
	},
	{
		id: "evidence",
		title: "Carrying evidence",
		hint: "Advanced weights. Positive values favor carrying; negative values favor a parked device.",
		fields: [
			"carried_charging",
			"carried_moving",
			"carried_still_room_empty",
			"carried_jitter"
		]
	}
], ho = (e) => {
	if (e === "activity_floor") return "presence/activity/floor";
	if (e.startsWith("carried_")) {
		let t = e.slice(8);
		return `presence/carried/${po.includes(t) ? "weights/" : ""}${t}`;
	}
	return `presence/${e}`;
}, go = { entity: {
	multiple: !0,
	filter: {
		domain: "device_tracker",
		integration: "bermuda"
	}
} }, _o = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, vo = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "slider"
} }, yo = { number: {
	min: 0,
	max: .1,
	step: .001,
	mode: "box"
} }, bo = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, xo = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, So = { duration: {} }, Co = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, wo = { number: {
	min: -10,
	max: 10,
	step: .5,
	mode: "box"
} }, To = " → ", Eo = "Give it an area that matches a room, or map it in Settings below.", Do = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", q = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, J = class extends o {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, this.correctionPending = !1, this.correctionError = null, this.notice = null, this.computeLabel = (e) => lo[e.name] ?? e.name, this.computeHelper = (e) => uo[e.name] ?? "", this.onDevicesChanged = (e) => {
			e.stopPropagation();
			let t = this.config;
			if (!t) return;
			let n = w(t), r = {
				...n,
				people: this.mergePeople(e.detail?.value, n.people)
			};
			this.dispatchEvent(N(x(t, ["presence"], r), "presence:people"));
		};
	}
	static {
		this.styles = [
			v,
			ne,
			m`
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
        padding: 12px 16px;
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
      .device-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        --mdc-icon-size: 18px;
        text-align: left;
      }
      .device-entry + .device-entry { margin-top: 12px; }
      .device-chip .carried-pct { font-variant-numeric: tabular-nums; }
      .correction-panel { display: grid; gap: 16px; padding: 16px; }
      .correction-panel .question { font-weight: 600; }
      .correction-fields { display: flex; flex-wrap: wrap; gap: 16px; }
      .correction-fields label { display: grid; gap: 6px; min-width: 200px; }
      .correct td { background: var(--secondary-background-color); padding: 0; }
      .who { width: 120px; }
      .when { white-space: nowrap; }
      .devices { min-width: 260px; }
      .confidence-label { display: block; margin-bottom: 6px; font-variant-numeric: tabular-nums; }
      .settings-body { display: grid; gap: 20px; padding-top: 16px; }
      .settings-section { border: 1px solid var(--al-control-border); border-radius: 6px; padding: 16px; min-width: 0; }
      .settings-section h3 { margin: 0 0 8px; color: var(--primary-text-color); font-size: 1.05em; }
      .settings-section p { color: var(--secondary-text-color); margin: 0 0 16px; line-height: 1.5; }
      .settings-section summary { color: var(--primary-text-color); }
      .settings-section summary + p { margin-top: 8px; }
      .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px; align-items: start; }
      .settings-section ha-form { display: block; }

      summary { cursor: pointer; font-weight: 600; padding: 8px 0; }
      .moving { display: block; font-size: 0.85em; margin-top: 4px; }
      .notice,
      .hint {
        margin-top: 8px;
        font-size: 0.9em;
        color: var(--secondary-text-color);
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
      .empty {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      @media (max-width: 850px) {
        .people-table, .people-table tbody { display: block; }
        .people-table thead { display: none; }
        .people-table tr.person { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        .people-table tr.person td { width: auto; min-width: 0; padding: 12px 4px; }
        .people-table td[data-label]::before {
          content: attr(data-label);
          display: block;
          color: var(--secondary-text-color);
          font-size: 0.85em;
          margin-bottom: 6px;
        }
        .people-table td.devices { grid-column: 1 / -1; }
        .people-table tr.correct, .people-table tr.correct td { display: block; }
        .device-chip { flex-wrap: wrap; max-width: 100%; }
        .correction-panel { padding: 12px; }
        .correction-fields label { min-width: 0; width: 100%; }
        .correction-fields select { width: 100%; }
        .when { white-space: normal; }
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
	}
	connectedCallback() {
		super.connectedCallback(), this.refreshTopology(), this.refreshPresence(), this.timer = setInterval(() => {
			document.visibilityState !== "hidden" && this.refreshPresence();
		}, so);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.timer !== void 0 && clearInterval(this.timer), this.timer = void 0;
	}
	willUpdate(e) {
		e.has("config") && e.get("config") !== void 0 && this.refreshTopology();
	}
	async refreshTopology() {
		let e = this.hass;
		if (e) try {
			this.topology = await ge(e);
		} catch {}
	}
	async refreshPresence() {
		let e = this.hass;
		if (e) try {
			this.presence = await ve(e);
		} catch {}
	}
	async correct(e, t) {
		let n = this.hass;
		if (!n || this.correctionPending) return;
		let r = typeof t == "string" ? {
			room: t,
			...Object.keys(this.carryingChoices).length ? { carrying: this.carryingChoices } : {}
		} : t;
		this.correctionPending = !0, this.correctionError = null, this.notice = null;
		try {
			await te(n, e, r), this.notice = r.device ? "Device correction saved." : r.room ? `Moved ${e} to ${this.roomName(r.room)}.` : "Automatic estimate restored.", this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, await this.refreshPresence();
		} catch (e) {
			let t = e && typeof e == "object" && "message" in e ? String(e.message) : String(e);
			this.correctionError = `Could not save correction: ${t}`;
		} finally {
			this.correctionPending = !1;
		}
	}
	correctionStatus(e) {
		if (!e) return s;
		let t = typeof e.value == "boolean" ? e.value ? "Carrying" : "Not carrying" : this.roomName(e.value), n = e.reason.replaceAll("_", " ");
		return y`<div class="hint correction-status" role="status">${t} — ${n}
      (${Math.round(e.strength * 100)}%) · <time datetime=${(/* @__PURE__ */ new Date(e.t * 1e3)).toISOString()}>${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</time></div>`;
	}
	get correctionRooms() {
		let e = this.config;
		return [...this.topology?.nodes ?? (e ? [...st(e)] : []), co];
	}
	get labels() {
		let e = this.config;
		return new Map(e ? to(e).map((e) => [e.id, e.label]) : []);
	}
	roomName(e) {
		return e == null || e === "" ? "—" : e === co ? "Away" : this.labels.get(e) ?? e;
	}
	areaName(e) {
		return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
	}
	trail(e) {
		return e.map((e) => this.roomName(e)).join(To);
	}
	schemaFor(e) {
		return [
			{
				name: "enabled",
				selector: { boolean: {} }
			},
			{
				name: "envelope",
				selector: { select: {
					mode: "dropdown",
					options: Qr(e)
				} }
			},
			{
				name: "threshold",
				selector: vo
			},
			{
				name: "stay",
				selector: _o
			},
			{
				name: "escape",
				selector: yo
			},
			{
				name: "scale",
				selector: bo
			},
			{
				name: "floor",
				selector: xo
			},
			{
				name: "stuck_after",
				selector: So
			},
			{
				name: "activity_floor",
				selector: xo
			},
			{
				name: "carried_prior",
				selector: Co
			},
			{
				name: "carried_flip",
				selector: So
			},
			{
				name: "carried_recent",
				selector: So
			},
			{
				name: "carried_nearby",
				selector: Co
			},
			...po.map((e) => ({
				name: `carried_${e}`,
				selector: wo
			}))
		];
	}
	mergePeople(e, t) {
		if (!Array.isArray(e)) return [...t];
		let n = e.filter((e) => typeof e == "string"), r = t.filter((e) => e.devices.some((e) => n.includes(e.tracker))), i = new Set(r.flatMap((e) => e.devices.map((e) => e.tracker))), a = n.filter((e) => !i.has(e)).map((e) => ({
			...et(),
			devices: [$e(e)]
		}));
		return [...r, ...a];
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config;
		if (!t) return;
		let n = w(t), r = e.detail?.value ?? {}, i = {
			charging: q(r.carried_charging) ?? n.carried.weights.charging,
			moving: q(r.carried_moving) ?? n.carried.weights.moving,
			still_room_empty: q(r.carried_still_room_empty) ?? n.carried.weights.still_room_empty,
			jitter: q(r.carried_jitter) ?? n.carried.weights.jitter
		}, a = {
			...n,
			enabled: typeof r.enabled == "boolean" ? r.enabled : n.enabled,
			envelope: r.envelope === void 0 ? n.envelope : typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : null,
			threshold: q(r.threshold) ?? n.threshold,
			stay: q(r.stay) ?? n.stay,
			escape: q(r.escape) ?? n.escape,
			scale: q(r.scale) ?? n.scale,
			floor: q(r.floor) ?? n.floor,
			stuck_after: O(r.stuck_after) ?? n.stuck_after,
			activity: { floor: q(r.activity_floor) ?? n.activity.floor },
			carried: {
				prior: q(r.carried_prior) ?? n.carried.prior,
				flip: O(r.carried_flip) ?? n.carried.flip,
				recent: O(r.carried_recent) ?? n.carried.recent,
				nearby: q(r.carried_nearby) ?? n.carried.nearby,
				weights: i
			}
		}, o = (e) => {
			switch (e) {
				case "activity_floor": return a.activity.floor === n.activity.floor;
				case "carried_prior":
				case "carried_flip":
				case "carried_recent":
				case "carried_nearby": {
					let t = e.slice(8);
					return a.carried[t] === n.carried[t];
				}
				case "carried_charging":
				case "carried_moving":
				case "carried_still_room_empty":
				case "carried_jitter": {
					let t = e.slice(8);
					return a.carried.weights[t] === n.carried.weights[t];
				}
				default: return a[e] === n[e];
			}
		}, s = fo.find((e) => !o(e));
		s !== void 0 && this.dispatchEvent(N(x(t, ["presence"], a), `presence:${s}`));
	}
	setSetting(e, t) {
		let n = this.config;
		if (!n) return;
		let r = {
			...w(n),
			[e]: t
		};
		this.dispatchEvent(N(x(n, ["presence"], r), `presence:${e}`));
	}
	renderSetup(e) {
		let t = this.presence?.bermuda === !0, n = w(e);
		return y`<ha-card class="setup" header="Room presence">
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
        .selector=${go}
        .label=${lo.devices}
        .helper=${uo.devices}
        .required=${!1}
        .value=${n.people.flatMap((e) => e.devices.map((e) => e.tracker))}
        @value-changed=${this.onDevicesChanged}
      ></ha-selector>
      <p class="muted">
        Bermuda ships its per-scanner distance sensors disabled. Enable them under
        <em>Settings → Devices &amp; services → Bermuda</em> before expecting a room out of
        this, and give each scanner device the area of the room it sits in.
      </p>
    </ha-card>`;
	}
	renderPeople() {
		let e = Object.entries(this.presence?.people ?? {}).filter(([, e]) => typeof e.room == "string").sort(([e], [t]) => e.localeCompare(t));
		return e.length === 0 ? y`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >` : y`<ha-card><h2>People</h2>
      <div class="muted hint">Select a person or device to correct its estimate.</div>
      <div class="table-scroll"><table class="people-table">
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
          ${e.flatMap(([e, t]) => [
			this.renderPerson(e, t),
			this.correcting === e ? this.renderCorrection(e, t) : s,
			this.correctingDevice?.person === e ? this.renderDeviceCorrection(e, t) : s
		])}
        </tbody>
      </table></div>
      ${this.notice === null ? s : y`<div class="notice" role="status">${this.notice}</div>`}
    </ha-card>`;
	}
	renderCorrection(e, t) {
		let n = Object.entries(t.candidates).sort(([, e], [, t]) => t - e).map(([e]) => e);
		return y`<tr class="correct">
      <td colspan="6"><div class="correction-panel">
        <span class="question">Where is ${e}?</span>
        <div class="correction-fields">${Object.entries(t.devices ?? {}).map(([e, t]) => y`<label>${t.name}
          <select data-carrying=${e} ?disabled=${this.correctionPending} aria-label=${`Carrying ${t.name}`} .value=${String(this.carryingChoices[e] ?? "")}
            @change=${(t) => {
			let n = t.target.value, r = { ...this.carryingChoices };
			n === "" ? delete r[e] : r[e] = n === "true", this.carryingChoices = r;
		}}>
            <option value="">Keep estimate (${t.carried === null ? "unknown" : `${Math.round(t.carried * 100)}% carrying`})</option>
            <option value="true">Carrying</option><option value="false">Not carrying</option>
          </select></label>`)}</div>
        ${this.correctionError ? y`<div role="alert">${this.correctionError}</div>` : s}
        <div class="actions">${n.map((t) => y`<button type="button" class="candidate" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, t)}
              >${this.roomName(t)}</button
            >`)}
        <select
          class="every-room" aria-label="Person room" ?disabled=${this.correctionPending}
          @change=${(t) => {
			let n = t.target.value;
			n !== "" && this.correct(e, n);
		}}
        >
          <option value="">Somewhere else…</option>
          ${this.correctionRooms.map((e) => y`<option value=${e}>${this.roomName(e)}</option>`)}
        </select>
        <button type="button" class="automatic-person" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, { clear: !0 })}>Use automatic estimate</button>
        <button type="button" class="cancel" @click=${() => this.correcting = null}>Close</button></div>
      </div></td>
    </tr>`;
	}
	renderPerson(e, t) {
		let n = Math.round(t.confidence * 100), r = Object.entries(t.devices ?? {}).sort(([e], [t]) => e.localeCompare(t));
		return y`<tr class="device person">
      <td class="who" data-label="Person">
        <button
          class="link" type="button"
          aria-expanded=${this.correcting === e ? "true" : "false"}
          title="Say where ${e} really is"
          @click=${() => {
			this.correcting = this.correcting === e ? null : e, this.correctingDevice = null, this.carryingChoices = {}, this.correctionError = null;
		}}
        >
          ${e}
        </button>
      </td>
      <td class="room" data-label="Room">
        ${this.roomName(t.room)}
        ${this.correctionStatus(t.correction)}
        ${t.moving ? y`<span class="chip moving">moving</span>` : s}
      </td>
      <td data-label="Confidence">
        <span class="confidence-label">${n}%</span>
        <div class="meter" title=${`${n}%`}>
          <div class="confidence" style=${`width: ${n}%`}></div>
        </div>
      </td>
      <td class="devices" data-label="Devices">${r.map(([t, n]) => this.renderDeviceChip(e, t, n))}</td>
      <td class="breadcrumb" data-label="Came from">${t.path.length === 0 ? "—" : this.trail(t.path)}</td>
      <td class="when" data-label="Updated">${(/* @__PURE__ */ new Date(t.t * 1e3)).toLocaleTimeString()}</td>
    </tr>`;
	}
	renderDeviceChip(e, t, n) {
		let r = n.carried, i = r !== null && r < .5, a = r === null ? "—" : `${Math.round(r * 100)}%`, o = `${n.name} (${qa[n.kind]}): carried ${a}${i && n.room ? `, in ${this.roomName(n.room)}` : ""}`;
		return y`<div class="device-entry"><button type="button" aria-expanded=${this.correctingDevice?.person === e && this.correctingDevice.device === t ? "true" : "false"} aria-label=${`Correct ${n.name}`} @click=${() => {
			this.correctingDevice = {
				person: e,
				device: t
			}, this.correcting = null, this.correctionError = null;
		}} class="chip device-chip ${i ? "parked" : "carried"}" data-device=${t} title=${o}>
      <ha-icon icon=${Ka[n.kind] ?? Ka.other}></ha-icon>
      <span class="device-name">${n.name}</span>
      <span class="carried-pct">${a} carrying</span>
      ${i && n.room ? y`<span class="parked-room">${this.roomName(n.room)}</span>` : s}
    </button>${this.correctionStatus(n.correction)}${this.correctionStatus(n.carrying_correction)}</div>`;
	}
	renderDeviceCorrection(e, t) {
		let n = this.correctingDevice?.device, r = n ? t.devices[n] : void 0;
		return !n || !r ? s : y`<tr class="correct device-correction"><td colspan="6"><div class="correction-panel">
      <div class="question">${r.name}</div>
      <div class="resource-links">${Hn(this, this.hass, r.tracker, "Open tracker", r.device_id, "Open Bermuda device", !0)}</div>
      <div class="correction-fields"><label>Device room <select aria-label="Device room" ?disabled=${this.correctionPending} @change=${(t) => {
			let r = t.target.value;
			r && this.correct(e, {
				device: n,
				room: r
			});
		}}><option value="">Choose a room…</option>${this.correctionRooms.map((e) => y`<option value=${e}>${this.roomName(e)}</option>`)}</select></label></div>
      <div class="actions"><button type="button" class="carrying" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, {
			device: n,
			carried: !0
		})}>Carrying</button>
      <button type="button" class="not-carrying" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, {
			device: n,
			carried: !1
		})}>Not carrying</button>
      <button type="button" class="automatic-device" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, {
			device: n,
			clear: !0
		})}>Use automatic estimate</button>
      <button type="button" @click=${() => {
			this.correctingDevice = null;
		}}>Close</button></div>
      <div class="hint">Movement can return this device to automatic estimation. Missing companion sensors are optional.</div>
      ${this.correctionError ? y`<div role="alert">${this.correctionError}</div>` : s}
    </div></td></tr>`;
	}
	renderScanners() {
		let e = this.presence?.scanners ?? [], t = new Set(this.presence?.unmapped ?? []);
		return y`<ha-card><h2>Scanners</h2>
      ${e.length === 0 ? y`<div class="empty">No Bermuda scanners have been discovered.</div>` : y`<div class="table-scroll"><table>
            <thead>
              <tr>
                <th>Scanner</th>
                <th>Area</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              ${e.map((e) => this.renderScanner(e, t.has(e.key)))}
            </tbody>
          </table></div>`}
      ${this.renderDisabled()}
    </ha-card>`;
	}
	renderScanner(e, t) {
		return y`<tr class="scanner ${t ? "unmapped" : ""}">
      <td class="name">${Vn("device", e.device_id, e.name)}</td>
      <td class="area">${Vn("area", e.area_id, this.areaName(e.area_id))}</td>
      <td class="room">${t ? Eo : this.roomName(e.group_id)}</td>
    </tr>`;
	}
	renderDisabled() {
		let e = this.presence?.disabled ?? [];
		return e.length === 0 ? s : y`<div class="disabled-sensors">
      ${Do}
      <ul>
        ${e.map((e) => y`<li>${e}</li>`)}
      </ul>
    </div>`;
	}
	renderSettings(e) {
		let t = w(e), n = Object.fromEntries(fo.flatMap((e) => {
			let t = this.errors.find((t) => t.path === ho(e));
			return t ? [[e, t.message]] : [];
		})), r = this.errors.filter((e) => e.path === "presence"), i = {
			enabled: t.enabled,
			envelope: t.envelope ?? "",
			threshold: t.threshold,
			stay: t.stay,
			escape: t.escape,
			scale: t.scale,
			floor: t.floor,
			stuck_after: D(t.stuck_after),
			activity_floor: t.activity.floor,
			carried_prior: t.carried.prior,
			carried_flip: D(t.carried.flip),
			carried_recent: D(t.carried.recent),
			carried_nearby: t.carried.nearby,
			...Object.fromEntries(po.map((e) => [`carried_${e}`, t.carried.weights[e]]))
		}, a = (t) => y`<ha-form
      class="presence-settings" data-section=${t.id}
      .hass=${this.hass}
      .data=${Object.fromEntries(t.fields.map((e) => [e, i[e]]))}
      .schema=${this.schemaFor(e).filter((e) => t.fields.includes(e.name))}
      .error=${n}
      .computeLabel=${this.computeLabel}
      .computeHelper=${this.computeHelper}
      @value-changed=${this.onFormChanged}
    ></ha-form>`, o = mo[0];
		return y`<ha-card><details class="settings" ?open=${this.errors.some((e) => e.path.startsWith("presence"))}>
      <summary>Presence settings</summary><div class="settings-body">
      ${r.map((e) => y`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
      <section class="settings-section">
        <h3>People and devices</h3>
        <p>Choose who to follow and the devices they carry. Open a device to edit its trackers and signals.</p>
        <al-people-editor .hass=${this.hass} .config=${e} .errors=${this.errors} .presence=${this.presence}></al-people-editor>
      </section>
      <section class="settings-section">
        <h3>${o.title}</h3><p>${o.hint}</p>${a(o)}
      </section>
      <div class="settings-grid">
        ${mo.slice(1).map((e) => y`<details class="settings-section" data-section=${e.id}
          ?open=${e.fields.some((e) => n[e] !== void 0)}>
          <summary>${e.title}</summary><p>${e.hint}</p>${a(e)}
        </details>`)}
      </div>
    </div></details></ha-card>`;
	}
	render() {
		let e = this.config;
		return e ? w(e).enabled ? y`<div class="page">
      ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : y`<div class="page">${this.renderSetup(e)}</div>` : y`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
	}
};
_([d({ attribute: !1 })], J.prototype, "hass", void 0), _([d({ attribute: !1 })], J.prototype, "config", void 0), _([d({ attribute: !1 })], J.prototype, "errors", void 0), _([d({ type: Boolean })], J.prototype, "narrow", void 0), _([l()], J.prototype, "topology", void 0), _([l()], J.prototype, "presence", void 0), _([l()], J.prototype, "correcting", void 0), _([l()], J.prototype, "correctingDevice", void 0), _([l()], J.prototype, "carryingChoices", void 0), _([l()], J.prototype, "correctionPending", void 0), _([l()], J.prototype, "correctionError", void 0), _([l()], J.prototype, "notice", void 0), J = _([a("al-presence")], J);
//#endregion
//#region src/al-graph-map.ts
var Oo = 60, ko = 27, Ao = 2, jo = 9, Mo = 7, Y = (e) => String(Math.round(e * 10) / 10), X = class extends o {
	constructor(...e) {
		super(...e), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
	}
	static {
		this.styles = [v, m`
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
        stroke: var(--secondary-text-color);
        stroke-width: 2;
      }
      .edge.on-path {
        stroke: var(--primary-color);
        stroke-width: 3;
      }
      .arrow {
        fill: currentColor;
        color: var(--secondary-text-color);
      }
      .node {
        cursor: pointer;
        color: var(--secondary-text-color);
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
    `];
	}
	occupantsOf(e) {
		return this.presence?.occupants[e] ?? [];
	}
	select(e) {
		this.dispatchEvent(jn(e));
	}
	onKeydown(e, t) {
		(e.key === "Enter" || e.key === " ") && (e.preventDefault(), this.select(t));
	}
	movers(e) {
		let t = [], n = Object.entries(this.presence?.devices ?? {}).sort(([e], [t]) => e.localeCompare(t));
		for (let [r, i] of n) {
			if (!i.moving) continue;
			let n = Object.entries(i.candidates).sort((e, t) => t[1] - e[1] || e[0].localeCompare(t[0])), a = n[0]?.[0], o = n[1]?.[0];
			if (a === void 0 || o === void 0) continue;
			let s = ao(e, a, o);
			s && t.push({
				name: r,
				...io(s, .5)
			});
		}
		return t;
	}
	summary(e) {
		let t = `${e.nodes.length} room${e.nodes.length === 1 ? "" : "s"}`, n = `${e.edges.length} door${e.edges.length === 1 ? "" : "s"}`, r = e.nodes.filter((e) => this.occupantsOf(e.id).length > 0).map((e) => `${e.label}: ${this.occupantsOf(e.id).join(", ")}`);
		return `Room map, ${t} and ${n}. ${r.length === 0 ? "Nobody is in a room right now." : `${r.join("; ")}.`}`;
	}
	renderEdge(e, n) {
		let r = n.has(e);
		return t`<line
      class="edge ${r ? "on-path" : ""}"
      data-one-way=${e.oneWay}
      x1=${Y(e.x1)}
      y1=${Y(e.y1)}
      x2=${Y(e.x2)}
      y2=${Y(e.y2)}
      marker-end=${e.oneWay ? "url(#al-arrow)" : s}
    ></line>`;
	}
	renderNode(e) {
		let n = this.occupantsOf(e.id), r = n.slice(0, Ao), i = n.length - r.length, a = this.selected.includes(e.id), o = [...r, ...i > 0 ? [`+${i}`] : []].join(", "), c = [
			e.label,
			e.exit ? "an exit" : "",
			n.length > 0 ? `${n.length} here: ${n.join(", ")}` : "empty"
		].filter((e) => e !== "").join(", ");
		return t`<g
      class="node ${a ? "selected" : ""}"
      data-id=${e.id}
      role="button"
      tabindex="0"
      aria-pressed=${a ? "true" : "false"}
      aria-label=${c}
      @click=${() => this.select(e.id)}
      @keydown=${(t) => this.onKeydown(t, e.id)}
    >
      <rect
        class="box"
        x=${Y(e.x - Oo)}
        y=${Y(e.y - ko)}
        width=${120}
        height=${54}
        rx="8"
      ></rect>
      <text class="label" x=${Y(e.x)} y=${Y(e.y - 4)} text-anchor="middle">${e.label}</text>
      ${o === "" ? s : t`<text class="names" x=${Y(e.x)} y=${Y(e.y + 13)} text-anchor="middle">${o}</text>`}
      ${n.length === 0 ? s : this.renderBadge(e, n.length)}
      ${e.exit ? this.renderDoor(e) : s}
    </g>`;
	}
	renderBadge(e, n) {
		let r = e.x + Oo - jo - 3, i = e.y - ko + jo + 3;
		return t`<circle class="badge" cx=${Y(r)} cy=${Y(i)} r=${jo}></circle>
      <text class="count" x=${Y(r)} y=${Y(i + 3.5)} text-anchor="middle">${n}</text>`;
	}
	renderDoor(e) {
		let n = e.x - Oo + 7, r = e.y + ko - 7;
		return t`<path class="door" d=${`M ${Y(n)} ${Y(r)} v -14 h 10 v 14 z`}></path>`;
	}
	renderPerson(e) {
		return t`<circle class="person" data-name=${e.name} cx=${Y(e.x)} cy=${Y(e.y)} r=${Mo}>
      <title>${e.name} is on the move</title>
    </circle>`;
	}
	render() {
		let e = this.config, t = this.topology;
		if (!e || !t || t.nodes.length === 0) return y`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
		let n = ro(e, t), r = new Set(this.paths.flatMap((e) => oo(n, e))), i = this.summary(n);
		return y`
      <svg
        style="width: ${n.width}px"
        viewBox="0 0 ${n.width} ${n.height}"
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
        ${n.edges.map((e) => this.renderEdge(e, r))}
        ${n.nodes.map((e) => this.renderNode(e))}
        ${this.movers(n).map((e) => this.renderPerson(e))}
      </svg>
    `;
	}
};
_([d({ attribute: !1 })], X.prototype, "hass", void 0), _([d({ attribute: !1 })], X.prototype, "config", void 0), _([d({ attribute: !1 })], X.prototype, "topology", void 0), _([d({ attribute: !1 })], X.prototype, "presence", void 0), _([d({ attribute: !1 })], X.prototype, "selected", void 0), _([d({ attribute: !1 })], X.prototype, "paths", void 0), X = _([a("al-graph-map")], X);
//#endregion
//#region src/al-paths.ts
var Z = class extends o {
	constructor(...e) {
		super(...e), this.narrow = !1, this.topology = null, this.selected = [null, null], this.paths = [], this.pending = !1, this.error = null, this.loading = !1, this.pathSeq = 0, this.topologySeq = 0;
	}
	static {
		this.styles = [
			v,
			ne,
			m`
    .paths-layout { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 16px; }
    .paths-layout > * { min-width: 0; }
    .room-tree { max-height: 70vh; overflow: auto; }
    .branch { margin-left: 14px; border-left: 1px solid var(--al-control-border); padding-left: 8px; }
    summary { cursor: pointer; padding: 10px 0; font-weight: 600; }
    .room { width: 100%; text-align: left; margin: 3px 0; display: flex; justify-content: space-between; gap: 8px; }
    summary .room { display: inline-flex; width: calc(100% - 20px); }
    .endpoint { color: var(--primary-text-color); font-size: 0.85em; font-weight: 600; }
    .instructions { margin: 0 0 16px; }
    .paths { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--al-control-border); }
    .paths li { padding: 6px 0; }
    .narrow .paths-layout { grid-template-columns: 1fr; }
    .narrow .room-tree { max-height: 35vh; }
    @media (max-width: 800px) {
      .paths-layout { grid-template-columns: 1fr; }
      .room-tree { max-height: 35vh; }
    }
  `
		];
	}
	connectedCallback() {
		super.connectedCallback(), this.refreshTopology();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.pathSeq++, this.topologySeq++;
	}
	willUpdate(e) {
		e.has("config") && e.get("config") !== void 0 && (this.selected = [null, null], this.paths = [], this.pathSeq++, this.pending = !1, this.refreshTopology());
	}
	async refreshTopology() {
		if (!this.hass) return;
		let e = ++this.topologySeq;
		this.loading = !0, this.error = null;
		try {
			let t = await ge(this.hass);
			e === this.topologySeq && (this.topology = t);
		} catch {
			e === this.topologySeq && (this.error = "Could not load room connections. Try again.");
		} finally {
			e === this.topologySeq && (this.loading = !1);
		}
	}
	roomName(e) {
		return this.config ? to(this.config).find((t) => t.id === e)?.label ?? e : e;
	}
	async select(e) {
		let t = this.selected.filter((e) => e !== null), n = t.includes(e) ? t.filter((t) => t !== e) : [...t, e].slice(-2);
		this.selected = [n[0] ?? null, n[1] ?? null], this.paths = [], this.error = null;
		let r = ++this.pathSeq, [i, a] = this.selected;
		if (this.pending = !1, !(!this.hass || !i || !a)) {
			this.pending = !0;
			try {
				let e = await ee(this.hass, i, a);
				r === this.pathSeq && (this.paths = e);
			} catch {
				r === this.pathSeq && (this.error = "Could not load routes. Select the rooms again to retry.");
			} finally {
				r === this.pathSeq && (this.pending = !1);
			}
		}
	}
	renderTree(e, t) {
		return e.map((e) => {
			let n = this.selected[0] === e.id ? "From" : this.selected[1] === e.id ? "To" : "", r = e.name ?? e.id, i = y`<button class="room" type="button" data-room=${e.id}
        aria-pressed=${n ? "true" : "false"} @click=${(t) => {
				t.preventDefault(), t.stopPropagation(), this.select(e.id);
			}}>
        <span>${r}</span><span class="endpoint">${n}</span>
      </button>`;
			return e.children.length ? y`<details open>
        <summary>${t.has(e.id) ? i : r}</summary>
        <div class="branch">${this.renderTree(e.children, t)}</div>
      </details>` : t.has(e.id) ? i : y``;
		});
	}
	renderRoutes() {
		let [e, t] = this.selected;
		if (!e || !t) return y`<div class="paths">Select two rooms in the tree or map to see their routes.</div>`;
		let n = `${this.roomName(e)} → ${this.roomName(t)}`;
		return y`<div class="paths" role="status">
      ${this.pending ? `Finding routes from ${n}…` : this.error ? s : y`
        <div>${this.paths.length ? `${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${n}` : `No route from ${n}`}</div>
        <ol>${this.paths.map((e) => y`<li>${e.map((e) => this.roomName(e)).join(" → ")}</li>`)}</ol>
      `}
    </div>`;
	}
	render() {
		return y`<div class="page ${this.narrow ? "narrow" : ""}">
      ${this.error ? y`<ha-alert alert-type="error">${this.error}
        ${this.topology ? s : y`<button type="button" @click=${() => void this.refreshTopology()}>Retry</button>`}
      </ha-alert>` : s}
      <div class="paths-layout">
        <ha-card><h2>Rooms</h2><nav class="room-tree" aria-label="Room hierarchy">
          ${this.loading ? y`<p role="status">Loading rooms…</p>` : this.topology && this.config ? this.renderTree(this.config.groups, new Set(this.topology.nodes)) : s}
        </nav></ha-card>
        <ha-card><h2>Paths</h2>
          <p class="instructions">Select a start room and a destination. Select a room again to clear it.</p>
          <al-graph-map .hass=${this.hass} .config=${this.config} .topology=${this.topology}
            .selected=${this.selected} .paths=${this.paths}
            @al-map-select=${(e) => void this.select(e.detail.id)}
          ></al-graph-map>
          ${this.renderRoutes()}
        </ha-card>
      </div>
    </div>`;
	}
};
_([d({ attribute: !1 })], Z.prototype, "hass", void 0), _([d({ attribute: !1 })], Z.prototype, "config", void 0), _([d({ type: Boolean })], Z.prototype, "narrow", void 0), _([l()], Z.prototype, "topology", void 0), _([l()], Z.prototype, "selected", void 0), _([l()], Z.prototype, "paths", void 0), _([l()], Z.prototype, "pending", void 0), _([l()], Z.prototype, "error", void 0), _([l()], Z.prototype, "loading", void 0), Z = _([a("al-paths")], Z);
//#endregion
//#region src/yaml-locate.ts
var No = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, Po = (e) => e.dash >= 0 ? e.dash : e.indent;
function Fo(e) {
	let t = No.exec(e);
	return t ? t[1] ?? t[2] ?? t[3] ?? null : null;
}
function Io(e) {
	let t = [];
	return e.split("\n").forEach((e, n) => {
		let r = e.replace(/\s+$/, ""), i = r.trimStart();
		if (i === "" || i.startsWith("#")) return;
		let a = r.length - i.length, o = /^-(?:\s+|$)/.exec(i);
		o ? t.push({
			indent: a + o[0].length,
			dash: a,
			text: i.slice(o[0].length),
			line: n + 1
		}) : t.push({
			indent: a,
			dash: -1,
			text: i,
			line: n + 1
		});
	}), t;
}
function Lo(e, t, n, r) {
	for (let i = t + 1; i < n; i++) if (Po(e[i]) <= r) return i;
	return n;
}
function Ro(e, t, n, r) {
	if (t >= n) return -1;
	let i = e[t].indent;
	for (let a = t; a < n; a++) {
		let t = e[a];
		if (t.indent === i && Fo(t.text) === r) return a;
	}
	return -1;
}
function zo(e, t, n, r) {
	if (t >= n || e[t].dash < 0) return -1;
	let i = e[t].dash, a = -1;
	for (let o = t; o < n; o++) if (e[o].dash === i && ++a === r) return o;
	return -1;
}
function Bo(e, t) {
	let n = t.split("/").filter((e) => e !== "");
	if (n.length === 0) return null;
	let r = Io(e), i = 0, a = r.length, o = null;
	for (let e of n) {
		let t = /^\d+$/.test(e) ? zo(r, i, a, Number(e)) : Ro(r, i, a, e);
		if (t < 0) return o;
		let n = r[t];
		o = n.line, a = Lo(r, t, a, Po(n)), i = n.dash >= 0 ? t : t + 1;
	}
	return o;
}
var Vo = class extends o {
	constructor(...e) {
		super(...e), this.errors = [], this.available = !0, this.parseError = null, this.seq = 0, this.onYaml = (e) => {
			e.stopPropagation(), window.clearTimeout(this.timer);
			let t = e.detail;
			this.timer = window.setTimeout(() => void this.settle(t), 400);
		};
	}
	static {
		this.styles = [v, m`
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
    `];
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
	seed() {
		this.mine = this.config, this.editor?.setValue?.(this.config ?? {});
	}
	async settle(e) {
		if (!e.isValid) {
			this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(yn(!1, []));
			return;
		}
		this.parseError = null;
		let t = e.value;
		this.mine = t, this.dispatchEvent(N(t, "code")), await this.validate(t);
	}
	async validate(e) {
		let t = this.hass;
		if (!t || !e) return;
		let n = ++this.seq;
		try {
			let { errors: r } = await c(t, e);
			n === this.seq && this.dispatchEvent(yn(!0, r));
		} catch {}
	}
	jump(e) {
		let t = this.editor, n = t?.codemirror, r = t?.yaml;
		if (!n || typeof r != "string") return;
		let i = Bo(r, e);
		if (i === null || i > n.state.doc.lines) return;
		let a = n.state.doc.line(i).from;
		n.dispatch({
			selection: {
				anchor: a,
				head: a
			},
			scrollIntoView: !0
		}), n.focus();
	}
	renderProblems() {
		return this.parseError === null ? this.errors.length === 0 ? y`<p class="muted no-problems">No problems. Save applies this document.</p>` : y`
      <p class="count muted">
        ${this.errors.length} ${this.errors.length === 1 ? "problem" : "problems"} — Save is
        disabled until they are fixed.
      </p>
      <ul class="errors">
        ${this.errors.map((e) => y`<li>
            <button type="button" class="jump" @click=${() => this.jump(e.path)}>
              <span class="path">${e.path === "" ? "(document)" : e.path}</span> —
              <span class="message">${e.message}</span>
            </button>
          </li>`)}
      </ul>
    ` : y`<ha-alert class="parse-error" alert-type="error">${this.parseError}</ha-alert>`;
	}
	renderUnavailable() {
		return y`<ha-card header="Code">
      <ha-alert class="editor-missing" alert-type="warning">
        Home Assistant's YAML editor did not load, so this tab cannot open. Visit
        <em>Settings → Devices &amp; services</em> once and reload the page; the other tabs edit the
        same configuration in the meantime.
      </ha-alert>
    </ha-card>`;
	}
	render() {
		return this.available ? y`
      <div class="page">
        <ha-card header="Configuration">
          <ha-yaml-editor @value-changed=${this.onYaml}></ha-yaml-editor>
          ${this.config === void 0 ? s : this.renderProblems()}
        </ha-card>
      </div>
    ` : y`<div class="page">${this.renderUnavailable()}</div>`;
	}
};
_([d({ attribute: !1 })], Vo.prototype, "hass", void 0), _([d({ attribute: !1 })], Vo.prototype, "config", void 0), _([d({ attribute: !1 })], Vo.prototype, "errors", void 0), _([d({ type: Boolean })], Vo.prototype, "available", void 0), _([l()], Vo.prototype, "parseError", void 0), Vo = _([a("al-code")], Vo);
//#endregion
//#region src/floorplan-import.ts
var Ho = (e) => e.trim().toLocaleLowerCase();
function Uo(e, t) {
	let n = C(e).map(({ group: e }) => e), r = {}, i = /* @__PURE__ */ new Map();
	for (let e of t.items) {
		let t = e.source_id ? n.filter((t) => t.id === e.source_id) : [], a = t.length ? t : n.filter((t) => Ho(t.name ?? t.id) === Ho(e.name)), o = a.length === 1 ? a[0] : void 0;
		r[e.key] = o ? {
			action: "existing",
			id: o.id
		} : { action: "skip" }, o && i.set(o.id, (i.get(o.id) ?? 0) + 1);
	}
	for (let [e, t] of Object.entries(r)) t.action === "existing" && i.get(t.id) > 1 && (r[e] = { action: "skip" });
	return r;
}
function Wo(e, t, n) {
	let r = new Set(C(e).map(({ group: e }) => e.id));
	Object.values(n).forEach((e) => {
		e.action === "create" && r.add(e.id);
	});
	let i = (t.source_id ?? t.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
	/^[a-z]/.test(i) || (i = `group_${i || "imported"}`);
	let a = i;
	for (let e = 2; r.has(a); e++) a = `${i}_${e}`;
	return {
		action: "create",
		id: a,
		name: t.name,
		kind: t.kind,
		parent: null
	};
}
function Go(e, t, n, r) {
	let i = structuredClone(e), a = new Map(C(i).map(({ group: e }) => [e.id, e])), o = new Map(t.items.map((e) => [e.key, e])), s = [], c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set();
	for (let [e, t] of Object.entries(n)) {
		if (!o.has(e)) throw Error("Source changed. Parse the configuration again.");
		if (t.action === "create") {
			if (!/^[a-z][a-z0-9_]*$/.test(t.id) || a.has(t.id) || d.has(t.id)) throw Error(`${o.get(e).name}: choose an unused ID with lowercase letters, digits and underscores.`);
			if (!t.name.trim()) throw Error("New groups need a name.");
			d.add(t.id);
		}
	}
	let f = (e) => {
		let t = u.get(e);
		if (t) return t;
		if (l.has(e)) throw Error("New group parents form a cycle.");
		let r = n[e];
		if (r?.action !== "create") throw Error("Choose an explicitly created group as the new parent.");
		l.add(e);
		let o;
		if (r.parent) {
			if (o = "id" in r.parent ? a.get(r.parent.id) : f(r.parent.key), !o) throw Error(`${r.name}: the selected parent no longer exists.`);
		} else if (r.kind !== "property") throw Error(`${r.name}: select a parent for this ${r.kind}.`);
		if (!g(o?.kind ?? null).includes(r.kind)) throw Error(`${o?.name ?? o?.id ?? "Root"} cannot contain a ${r.kind}.`);
		let s = {
			...Ge(r.id, r.kind),
			name: r.name.trim()
		};
		return (o?.children ?? i.groups).push(s), u.set(e, s), l.delete(e), s;
	};
	for (let e of t.items) {
		let t = n[e.key];
		if (!t || t.action === "skip") continue;
		let r = t.action === "create" ? f(e.key) : a.get(t.id);
		if (!r) throw Error(`${e.name}: selected group no longer exists.`);
		if (c.has(r.id)) throw Error(`${r.name ?? r.id} is mapped more than once.`);
		c.add(r.id);
		let i = r.name ?? r.id;
		if (e.points && (r.points = structuredClone(e.points), delete r.bounds), e.bounds && (r.bounds = structuredClone(e.bounds)), t.action === "create") {
			let e = t.parent, n = e ? "id" in e ? a.get(e.id)?.name ?? e.id : u.get(e.key)?.name : "root";
			s.push(`Create ${t.kind} “${i}” (${r.id}) under ${n}.`);
		} else if (e.points || e.bounds) {
			let t = e.points && !e.bounds ? "; clear previous vertical bounds" : "";
			s.push(`Update geometry: ${e.context ? `${e.context} / ` : ""}${e.name} → ${i} (${r.id})${t}.`);
		}
	}
	return r && t.gps && (i.gps = structuredClone(t.gps), s.push(`${e.gps ? "Replace" : "Add"} GPS origin.`)), {
		config: s.length ? i : e,
		summary: s,
		created: u.size > 0
	};
}
//#endregion
//#region src/al-floorplan-import.ts
var Ko = 1e6, qo = (e) => typeof e == "object" && e && "message" in e ? String(e.message) : "Import failed. Try again.", Q = class extends o {
	constructor(...e) {
		super(...e), this.disabled = !1, this.text = "", this.source = null, this.choices = {}, this.importGps = !1, this.busy = null, this.error = "", this.notice = "", this.sequence = 0;
	}
	static {
		this.styles = [v, m`
    :host { display: block; padding: 16px; max-width: 1000px; }
    textarea { box-sizing: border-box; width: 100%; min-height: 180px; font-family: monospace; }
    input, select, textarea { color: var(--primary-text-color); background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #aaa); border-radius: 4px; padding: 8px; max-width: 100%; }
    label { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
    .check { flex-direction: row; align-items: center; }
    .mapping { border: 1px solid var(--divider-color, #aaa); border-radius: 6px; padding: 12px; margin: 12px 0; min-width: 0; }
    .creation { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
    .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin: 12px 0; }
    .error { color: var(--error-color, #b00020); }
    .summary { border-top: 1px solid var(--divider-color, #aaa); margin-top: 20px; }
    button { cursor: pointer; padding: 10px 16px; border-radius: 4px; }
    button:disabled { cursor: default; }
  `];
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.sequence++, this.busy = null;
	}
	updated(e) {
		e.has("config") && this.snapshot && this.config !== this.snapshot && (this.resetPreview(), this.error = "The draft changed. Parse again to review matches against the current groups.");
	}
	resetPreview() {
		this.sequence++, this.source = null, this.snapshot = void 0, this.choices = {}, this.importGps = !1, this.busy = null, this.error = "", this.notice = "";
	}
	onSourceInput(e) {
		this.resetPreview(), this.text = e.target.value;
	}
	async onFile(e) {
		let t = e.target, n = t.files?.[0];
		if (!n) return;
		this.resetPreview();
		let r = this.sequence;
		if (n.size > Ko) {
			this.error = "File is too large (maximum 1 MB).", t.value = "";
			return;
		}
		this.busy = "file";
		try {
			let e = await n.text();
			r === this.sequence && this.isConnected && (this.text = e);
		} catch {
			r === this.sequence && (this.error = "Could not read the file. Paste the YAML or try another file.");
		} finally {
			r === this.sequence && (this.busy = null), t.value = "";
		}
	}
	async parse() {
		if (!this.hass || !this.config || this.disabled || this.busy) return;
		if (this.resetPreview(), this.text.length > Ko) {
			this.error = "Paste is too large (maximum 1 MB of text).";
			return;
		}
		let e = this.sequence, t = this.config;
		this.busy = "parse";
		try {
			let n = await i(this.hass, this.text);
			if (e !== this.sequence || !this.isConnected) return;
			if (this.config !== t) {
				this.error = "The draft changed. Parse again to review matches.";
				return;
			}
			this.source = n, this.snapshot = t, this.choices = Uo(t, n);
		} catch (t) {
			e === this.sequence && (this.error = qo(t));
		} finally {
			e === this.sequence && (this.busy = null);
		}
	}
	choose(e, t) {
		this.sequence++, this.choices = {
			...this.choices,
			[e]: t
		}, this.error = "";
	}
	destination(e, t) {
		let n = t.target.value;
		this.choose(e.key, n === "create" ? Wo(this.config, e, this.choices) : n === "skip" ? { action: "skip" } : {
			action: "existing",
			id: n.slice(9)
		});
	}
	preview() {
		if (!this.config || !this.source) return {};
		try {
			return { result: Go(this.config, this.source, this.choices, this.importGps) };
		} catch (e) {
			return { error: qo(e) };
		}
	}
	async apply() {
		if (!this.hass || this.disabled || this.busy || this.config !== this.snapshot) return;
		let { result: e } = this.preview();
		if (!e?.summary.length) return;
		let t = ++this.sequence, n = this.config;
		this.busy = "apply", this.error = "";
		try {
			let r = await c(this.hass, e.config);
			if (t !== this.sequence || this.config !== n || !this.isConnected || this.disabled) return;
			if (!r.ok) {
				this.error = r.errors.map((e) => `${e.path}: ${e.message}`).join("; ") || "Configuration validation failed.";
				return;
			}
			this.resetPreview(), this.notice = "Import applied to the draft. Use Save to persist it, or Undo to revert the import.", this.dispatchEvent(N(e.config, void 0, e.created ? !0 : void 0));
		} catch (e) {
			t === this.sequence && (this.error = qo(e));
		} finally {
			t === this.sequence && (this.busy = null);
		}
	}
	renderCreation(e, t) {
		let n = this.disabled || this.busy === "apply", r = C(this.config).map(({ group: e }) => e), i = t.parent ? "id" in t.parent ? `existing:${t.parent.id}` : `new:${t.parent.key}` : "";
		return y`<div class="creation">
      <label>Name <input .value=${t.name} ?disabled=${n}
        @input=${(n) => this.choose(e.key, {
			...t,
			name: n.target.value
		})}></label>
      <label>ID <input .value=${t.id} ?disabled=${n}
        @input=${(n) => this.choose(e.key, {
			...t,
			id: n.target.value
		})}></label>
      <label>Kind <select .value=${t.kind} ?disabled=${n}
        @change=${(n) => this.choose(e.key, {
			...t,
			kind: n.target.value,
			parent: null
		})}>
        ${ae.map((e) => y`<option value=${e} .selected=${t.kind === e}>${h[e].label}</option>`)}
      </select></label>
      <label>Parent <select class="parent" .value=${i} ?disabled=${n}
        @change=${(n) => {
			let r = n.target.value;
			this.choose(e.key, {
				...t,
				parent: r ? r.startsWith("existing:") ? { id: r.slice(9) } : { key: r.slice(4) } : null
			});
		}}>
        <option value="" .selected=${i === ""}>${t.kind === "property" ? "Root of configuration" : "Choose a parent…"}</option>
        ${r.filter((e) => g(e.kind).includes(t.kind)).map((e) => y`<option value=${`existing:${e.id}`} .selected=${i === `existing:${e.id}`}>${e.name ?? e.id} (${e.id})</option>`)}
        ${Object.entries(this.choices).filter(([n, r]) => n !== e.key && r.action === "create" && g(r.kind).includes(t.kind)).map(([e, t]) => y`<option value=${`new:${e}`} .selected=${i === `new:${e}`}>New: ${t.name} (${t.id})</option>`)}
      </select></label>
    </div>`;
	}
	renderItem(e) {
		let t = this.choices[e.key] ?? { action: "skip" }, n = t.action === "existing" ? `existing:${t.id}` : t.action;
		return y`<fieldset class="mapping" data-key=${e.key}>
      <legend>${e.context ? `${e.context} / ` : ""}${e.name} · ${h[e.kind].label}</legend>
      <p class="muted">${e.points ? `${e.points.length} outline vertices. ` : ""}
        ${e.bounds ? `Elevation ${e.bounds[0][2]}–${e.bounds[1][2]} m.` : "No vertical bounds supplied."}</p>
      <label>Destination <select class="destination" .value=${n} ?disabled=${this.disabled || this.busy === "apply"}
        @change=${(t) => this.destination(e, t)}>
        <option value="skip" .selected=${n === "skip"}>Skip</option>
        <option value="create" .selected=${n === "create"}>Create new group…</option>
        ${C(this.config).map(({ group: e }) => y`<option value=${`existing:${e.id}`} .selected=${n === `existing:${e.id}`}>
          ${e.name ?? e.id} (${e.id}) · ${h[e.kind].label}
        </option>`)}
      </select></label>
      ${t.action === "create" ? this.renderCreation(e, t) : s}
    </fieldset>`;
	}
	render() {
		let e = this.preview(), t = this.disabled || this.busy === "apply";
		return y`
      <h2>Import floorplan</h2>
      <p>Paste an ESPresense configuration or choose a file. Only GPS and floor/room geometry are imported.
        Match each source to your current groups; your existing names, hierarchy and activity settings stay in place.</p>
      <label>ESPresense YAML <textarea .value=${this.text} ?disabled=${t} spellcheck="false"
        @input=${this.onSourceInput}></textarea></label>
      <div class="actions">
        <label>Import file <input type="file" accept=".yaml,.yml,.json,text/yaml,application/json" ?disabled=${t}
          @change=${this.onFile}></label>
        <button id="parse" type="button" ?disabled=${!this.text.trim() || !!this.busy || this.disabled}
          @click=${this.parse}>${this.busy === "parse" ? "Parsing…" : "Parse and match"}</button>
      </div>
      ${this.error ? y`<p class="error" role="alert">${this.error}</p>` : s}
      ${this.notice ? y`<p role="status">${this.notice}</p>` : s}
      ${this.source ? y`
        <h3>Review mappings</h3>
        <p>Matches are suggestions. Unmatched entries are skipped. Creating a group is always an explicit choice.</p>
        ${this.source.gps ? y`<label class="check"><input id="gps" type="checkbox" .checked=${this.importGps}
          ?disabled=${t} @change=${(e) => {
			this.importGps = e.target.checked, this.error = "";
		}}>
          ${this.config?.gps ? "Replace" : "Import"} GPS origin (${this.source.gps.latitude}, ${this.source.gps.longitude})
        </label>` : s}
        ${this.source.items.map((e) => this.renderItem(e))}
        <section class="summary" aria-label="Import changes">
          <h3>Changes to apply</h3>
          ${e.error ? y`<p class="error" role="alert">${e.error}</p>` : y`
            <ul>${e.result?.summary.map((e) => y`<li>${e}</li>`)}</ul>
            ${e.result?.summary.length ? s : y`<p>No changes selected.</p>`}`}
          <button id="apply" type="button" ?disabled=${!e.result?.summary.length || !!this.busy || this.disabled}
            @click=${this.apply}>${this.busy === "apply" ? "Validating…" : "Apply to draft"}</button>
        </section>` : s}
    `;
	}
};
_([d({ attribute: !1 })], Q.prototype, "hass", void 0), _([d({ attribute: !1 })], Q.prototype, "config", void 0), _([d({ type: Boolean })], Q.prototype, "disabled", void 0), _([l()], Q.prototype, "text", void 0), _([l()], Q.prototype, "source", void 0), _([l()], Q.prototype, "choices", void 0), _([l()], Q.prototype, "importGps", void 0), _([l()], Q.prototype, "busy", void 0), _([l()], Q.prototype, "error", void 0), _([l()], Q.prototype, "notice", void 0), Q = _([a("al-floorplan-import")], Q);
//#endregion
//#region src/al-floorplans.ts
var $ = class extends o {
	constructor(...e) {
		super(...e), this.live = null, this.disabled = !1, this.lights = {}, this.settings = {}, this.error = "", this.preferenceError = "", this.entry = "";
	}
	static {
		this.styles = m`
    :host { display: block; }
    details { margin: 0 16px 24px; border-top: 1px solid var(--divider-color, #aaa); }
    summary { cursor: pointer; padding: 16px 0; font-weight: 500; }
  `;
	}
	connectedCallback() {
		super.connectedCallback(), this.connect();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.unsubscribe?.(), this.unsubscribe = void 0;
	}
	updated(e) {
		e.has("hass") && this.connect();
	}
	connect() {
		if (!this.hass || !this.isConnected) return;
		let e = pe(this.hass);
		this.source === e && this.unsubscribe || (this.unsubscribe?.(), this.source = e, this.unsubscribe = e.subscribe(({ data: e, error: t }) => {
			if (this.error = t ?? "", e && (this.lights = e.lights, this.entry !== e.entry_id)) {
				this.entry = e.entry_id;
				try {
					let e = localStorage.getItem(`al-floorplan:${this.entry}`);
					this.settings = e ? JSON.parse(e) : {}, fe(this.settings);
				} catch {
					this.settings = {}, this.preferenceError = "Saved viewer settings could not be loaded. Defaults are shown.";
				}
			}
		}));
	}
	saveSettings(e) {
		this.settings = e.detail, this.preferenceError = "";
		try {
			this.entry && localStorage.setItem(`al-floorplan:${this.entry}`, JSON.stringify(this.settings));
		} catch {
			this.preferenceError = "Viewer settings changed, but this browser could not save them.";
		}
	}
	render() {
		if (!this.config) return s;
		let e = C(this.config).some(({ group: e }) => e.bounds || e.points);
		return y`
      ${this.error || this.preferenceError ? y`<p role="status">${this.error || this.preferenceError}</p>` : s}
      <al-floorplan-viewer .config=${this.config} .live=${this.live} .hass=${this.hass} .lights=${this.lights}
        .settings=${this.settings} @al-viewer-settings=${this.saveSettings}></al-floorplan-viewer>
      <details .open=${!e}><summary>Import or update floorplan</summary>
        <al-floorplan-import .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-floorplan-import>
      </details>`;
	}
};
_([d({ attribute: !1 })], $.prototype, "hass", void 0), _([d({ attribute: !1 })], $.prototype, "config", void 0), _([d({ attribute: !1 })], $.prototype, "live", void 0), _([d({ type: Boolean })], $.prototype, "disabled", void 0), _([l()], $.prototype, "lights", void 0), _([l()], $.prototype, "settings", void 0), _([l()], $.prototype, "error", void 0), _([l()], $.prototype, "preferenceError", void 0), $ = _([a("al-floorplans")], $);
//#endregion
