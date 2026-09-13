import { $ as e, At as t, B as n, Bt as r, C as i, Ct as a, D as o, Dt as s, E as c, Et as l, F as u, Ft as d, G as f, Gt as p, H as ee, Ht as m, I as te, It as ne, J as re, Jt as h, K as ie, Kt as g, L as ae, Lt as oe, M as _, Mt as se, N as v, Nt as ce, O as le, Ot as ue, P as de, Pt as fe, Q as pe, R as me, Rt as he, S as ge, St as y, T as _e, Tt as ve, U as ye, Ut as b, V as x, Vt as be, W as xe, Wt as S, X as Se, Xt as C, Y as Ce, Yt as we, Z as w, Zt as T, _ as Te, _t as E, at as Ee, b as De, bt as Oe, c as ke, ct as D, d as Ae, dt as je, et as Me, f as Ne, ft as Pe, g as Fe, gt as Ie, h as Le, ht as Re, i as ze, it as Be, j as Ve, jt as He, k as Ue, kt as We, l as Ge, lt as Ke, m as qe, mt as Je, nt as Ye, o as Xe, ot as Ze, p as Qe, pt as $e, q as et, qt as tt, rt as nt, st as rt, t as it, tt as at, u as ot, ut as st, v as ct, vt as lt, w as ut, wt as dt, x as ft, xt as pt, y as mt, yt as ht, z as gt, zt as _t } from "./shared-BOvCjHmN.js";
import { t as vt } from "./shared-BBNy9uad.js";
//#region src/entities.ts
var yt = (e) => `switch.${e}_presence_simulation`, bt = (e) => `sensor.${e}_expected_activity`, xt = (e) => `sensor.${e}_activity_anomaly`, St = [
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
], Ct = ["ha-yaml-editor", "ha-state-icon"], wt = 2500, Tt = 8e3;
function Et(e) {
	let t;
	return {
		promise: new Promise((n) => {
			t = setTimeout(n, e);
		}),
		cancel: () => clearTimeout(t)
	};
}
async function Dt(e, t, n) {
	let r = Et(t);
	try {
		return await Promise.race([e, r.promise.then(() => n)]);
	} finally {
		r.cancel();
	}
}
async function Ot() {
	try {
		await ((await window.loadCardHelpers?.())?.createCardElement({
			type: "entities",
			entities: []
		}))?.constructor?.getConfigElement?.();
	} catch {}
}
async function kt() {
	if (customElements.get("ha-yaml-editor")) return;
	let e;
	try {
		await customElements.whenDefined("ha-selector"), e = document.createElement("ha-selector"), e.selector = { object: {} }, e.style.display = "none", document.body.appendChild(e), await customElements.whenDefined("ha-yaml-editor");
	} catch {} finally {
		e?.remove();
	}
}
async function At(e = Tt, t = wt) {
	let n = [...St, ...Ct];
	if (n.every((e) => customElements.get(e))) return {
		ok: !0,
		missing: [],
		optionalMissing: []
	};
	await Dt(Promise.all([Ot(), kt()]).then(() => void 0), t, void 0);
	let r = await Promise.all(n.map((t) => Dt(customElements.whenDefined(t).then(() => !0), e, !1))), i = n.filter((e, t) => !r[t]), a = Ct, o = i.filter((e) => !a.includes(e));
	return {
		ok: o.length === 0,
		missing: o,
		optionalMissing: i.filter((e) => a.includes(e))
	};
}
//#endregion
//#region src/navigation.ts
var jt = "activity_levels.mixer.expanded", Mt = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]), Nt = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function Pt(e) {
	return {
		expanded: new Set(e.groups.map((e) => e.id)),
		selection: Nt(e)
	};
}
function Ft(e, t) {
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
function It(e, t) {
	let n = Ft(e, t), r = [], i = [], a = [], o = [], s = 0, c = (e) => {
		for (; o.length > 0 && o[o.length - 1].depth >= e;) o.pop().band.colEnd = i.length + 1;
	};
	for (let t of n) {
		if (c(t.depth), i.push("strip"), r.push(i.length), !t.hasChildren) continue;
		let n = x(e, t.path)?.name ?? t.id, l = {
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
function Lt(e, t) {
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
			let n = Ft(t.config, e);
			if (n.length === 0) return e;
			let r = e.selection, i = r === null ? -1 : n.findIndex((e) => Mt(e.path, r)), a = (((i === -1 && t.delta < 0 ? n.length : i) + t.delta) % n.length + n.length) % n.length;
			return {
				...e,
				selection: n[a].path
			};
		}
		case "home":
		case "end": {
			let n = Ft(t.config, e);
			return n.length === 0 ? e : {
				...e,
				selection: (t.type === "home" ? n[0] : n[n.length - 1]).path
			};
		}
		case "sync": {
			let { config: n } = t, r = ae(n), i = [...e.expanded].filter((e) => r.has(e));
			return {
				expanded: i.length === e.expanded.size ? e.expanded : new Set(i),
				selection: e.selection !== null && st(n, e.selection) !== void 0 ? e.selection : Nt(n)
			};
		}
	}
}
function Rt(e, t, n) {
	if (n === null) return t;
	let r = n[n.length - 2] === "stimuli" ? n.slice(0, -2) : n, i = new Set(t), a = !1;
	for (let t = 2; t + 2 <= r.length; t += 2) {
		let n = st(e, r.slice(0, t));
		if (n === void 0 || typeof n.id != "string") break;
		i.has(n.id) || (i.add(n.id), a = !0);
	}
	return a ? i : t;
}
function zt(e) {
	let t;
	try {
		t = localStorage.getItem(jt);
	} catch {
		return null;
	}
	if (t === null) return null;
	try {
		let n = JSON.parse(t);
		if (!Array.isArray(n)) return null;
		let r = ae(e);
		return new Set(n.filter((e) => typeof e == "string" && r.has(e)));
	} catch {
		return null;
	}
}
function Bt(e) {
	try {
		localStorage.setItem(jt, JSON.stringify([...e]));
	} catch {}
}
function Vt(e) {
	let t = Pt(e), n = zt(e);
	return n === null ? t : {
		...t,
		expanded: n
	};
}
var Ht = "activity_levels.mixer.edit";
function Ut() {
	try {
		return localStorage.getItem(Ht) === "true";
	} catch {
		return !1;
	}
}
function Wt(e) {
	try {
		localStorage.setItem(Ht, e ? "true" : "false");
	} catch {}
}
//#endregion
//#region src/save-flow.ts
async function Gt(e, t) {
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
				text: "Saved. Configuration updates automatically."
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
var Kt = {
	"24h": 86400,
	"7d": 604800,
	"30d": 2592e3
}, qt = {
	off: 0,
	"24h": 86400,
	"7d": 604800
};
function Jt(e, t, n) {
	return {
		start: e - Kt[t],
		end: e,
		resolution: t === "24h" ? "5m" : "1h",
		forecastUntil: n === "off" ? void 0 : e + qt[n]
	};
}
function Yt(e, t, n) {
	let r = t - e || 1;
	return (t) => (t - e) / r * n;
}
function Xt(e, t, n = 4) {
	let r = e || 1, i = t - 2 * n;
	return (e) => t - n - e / r * i;
}
function Zt(e, t) {
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
function Qt(e, t, n) {
	return e.length === 0 ? "" : e.map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ");
}
function $t(e, t, n, r = Infinity) {
	if (e.p75.length === 0) return "";
	let i = (t) => t.map((t, n) => [e.t0 + n * e.step, t]), a = Zt(i(e.p75), r), o = Zt(i(e.p25), r).reverse();
	return `${[...a, ...o].map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ")} Z`;
}
function en(e, t) {
	return e[t].map((t, n) => [e.t0 + n * e.step, t]);
}
function tn(e, t, n, r, i) {
	let a = e[e.length - 1];
	return !a || t <= a[0] || t < r || t > i ? [] : [a, [t, n]];
}
function nn(e, t, n) {
	return e.map(([e, r, i]) => ({
		x0: t(e),
		x1: t(r ?? n),
		tag: i
	}));
}
function rn(e, t) {
	if (e.length === 0) return -1;
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i][0] < t ? n = i + 1 : r = i;
	}
	return n > 0 && Math.abs(e[n - 1][0] - t) <= Math.abs(e[n][0] - t) ? n - 1 : n;
}
function an(e) {
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
function on(e, t) {
	let n = Math.min(2592e3, Math.max(3600, e.end - e.start)), r = Math.min(t + 604800, e.start + n);
	return {
		start: r - n,
		end: r
	};
}
function sn(e, t, n, r) {
	let i = e.end - e.start, a = Math.min(2592e3, Math.max(3600, i * n)), o = t - (t - e.start) / i * a;
	return on({
		start: o,
		end: o + a
	}, r);
}
function cn(e, t, n = Infinity) {
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
function ln(e, t, n, r, i = 450) {
	if (n > r) {
		let t = e.forecast;
		if (!t || t.step <= 0) return null;
		let r = cn(en(t, "p50"), n);
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
var un = class {
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
		let { start: i, end: a, until: o } = dn(t, n, r), s = {}, c = !0;
		for (let l of e) {
			let e = this.cache.get(JSON.stringify([
				l,
				i,
				a,
				o,
				r
			]));
			!e || Date.now() - e.at > 6e4 ? (c = !1, s[l] = null) : s[l] = ln(e.data, l, t, n, r === "5m" ? 450 : 5400);
		}
		return {
			values: s,
			complete: c
		};
	}
	async load(e, t, n, r, i = "5m") {
		let a = ++this.generation, o = {}, s = !1, { start: c, end: l, until: u } = dn(n, r, i), d = 0;
		return await Promise.all(Array.from({ length: Math.min(4, t.length) }, async () => {
			for (; d < t.length && a === this.generation;) {
				let f = t[d++], p = JSON.stringify([
					f,
					c,
					l,
					u,
					i
				]), ee = this.cache.get(p);
				if (!ee || Date.now() - ee.at > 6e4) {
					await this.slot();
					try {
						if (a !== this.generation) return;
						for (ee = {
							at: Date.now(),
							data: await se(e, {
								group_id: f,
								start: c,
								end: l,
								resolution: i,
								include_children: !1,
								...u === void 0 ? {} : { forecast_until: u }
							})
						}, this.cache.set(p, ee); this.cache.size > 128;) this.cache.delete(this.cache.keys().next().value);
					} catch {
						s = !0, o[f] = null;
						continue;
					} finally {
						this.release();
					}
				}
				o[f] = ln(ee.data, f, n, r, i === "5m" ? 450 : 5400);
			}
		})), {
			values: o,
			failed: s
		};
	}
};
function dn(e, t, n) {
	let r = e > t, i = Math.floor(e / 3600) * 3600, a = Math.floor(t / 60) * 60, o = n === "5m" ? 300 : 3600, s = r ? a : Math.min(i + 3600 + o, a);
	return {
		start: r ? s - o : i - o,
		end: s,
		...r ? { until: Math.min(i + 3900, s + 604800) } : {}
	};
}
//#endregion
//#region src/activity-levels-panel.ts
var fn = [
	"mixer",
	"groups",
	"envelopes",
	"defaults",
	"patterns",
	"presence",
	"paths",
	"floorplans",
	"code"
], pn = 2e3, mn = 1e4, hn = 3e5, gn = 1500, _n = "activity_levels.timeline", vn = [
	"24h",
	"7d",
	"30d"
], yn = [
	"off",
	"24h",
	"7d"
], bn = {
	range: "7d",
	horizon: "24h",
	showChannels: !0,
	showLights: !0
};
function xn(e) {
	if (e === null) return null;
	let t = JSON.parse(e);
	return !vn.includes(t.range) || !yn.includes(t.horizon) ? null : {
		range: t.range,
		horizon: t.horizon,
		showChannels: t.showChannels !== !1,
		showLights: t.showLights !== !1
	};
}
var O = class extends p {
	constructor(...e) {
		super(...e), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = bn, this.preview = null, this.previewError = !1, this.previewData = new un(), this.previewSeq = 0, this.transportWindow = null, this.onTransport = (e) => {
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
			let t = Lt(this.nav, e.detail);
			t.expanded !== this.nav.expanded && Bt(t.expanded), this.nav = t, this.selection = t.selection, this.preview && this.onTransport(new CustomEvent("al-transport", { detail: {
				time: this.preview.time,
				window: this.transportWindow
			} }));
		}, this.onLiveRefresh = () => {
			this.pollLive();
		}, this.onRebuild = async (e) => {
			try {
				let { rebuilt: t } = await ne(this.hass, e.detail?.force === !0);
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
				await ve(this.hass, "switch", n ? "turn_on" : "turn_off", { entity_id: yt(t) });
			} catch (e) {
				this.banner = {
					kind: "error",
					text: `Could not ${n ? "start" : "stop"} the simulation for ${t}: ${e.message}`
				};
			}
		}, this.onTimelineRange = (e) => {
			this.timeline = e.detail;
			try {
				localStorage.setItem(_n, JSON.stringify(e.detail));
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
		let r = Ft(n, this.nav).map((e) => e.id);
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
			for (let i of r) t[i.id] = this.live?.groups[i.id]?.precision ?? gt(e, i), n(i.children);
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
		return fn;
	}
	async connectedCallback() {
		super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
		let { ok: e, missing: t, optionalMissing: n } = await At();
		this.missing = e ? [] : t, this.yamlEditor = !n.includes("ha-yaml-editor"), await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer(), clearTimeout(this.previewTimer), this.previewTimer = void 0, this.previewSeq++, this.previewData.cancel();
	}
	async load() {
		try {
			let { config: e, inferred: t, warnings: n } = await s(this.hass);
			this.draft = new Ke(e), this.inferred = t, this.warnings = n, this.syncTabs(), this.nav = Vt(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
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
		let t = this.selection, n = Lt({
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
		let n = Rt(t, this.nav.expanded, e);
		n !== this.nav.expanded && Bt(n), this.nav = {
			expanded: n,
			selection: e
		};
	}
	async save() {
		let e = this.draft;
		if (!(!e || this.busy || this.blocked)) {
			this.busy = !0, this.updatePolling();
			try {
				let t = await Gt(e.config, {
					validate: (e) => be(this.hass, e),
					save: (e) => he(this.hass, e)
				});
				t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((e) => setTimeout(e, gn)), await this.load());
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
		this.liveTimer === void 0 && (this.pollLive(), this.liveTimer = window.setInterval(() => void this.pollLive(), pn));
	}
	updateSimPolling(e) {
		if (!(this.patternsVisible && e)) {
			this.clearSimTimer();
			return;
		}
		this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => void this.pollSim(), mn));
	}
	async pollLive() {
		let e = ++this.liveSeq;
		try {
			let t = await He(this.hass);
			e === this.liveSeq && (this.live = t);
		} catch {}
	}
	async pollSim() {
		try {
			this.simLog = await t(this.hass);
		} catch {}
	}
	clearLiveTimer() {
		this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
	}
	clearSimTimer() {
		this.simTimer !== void 0 && (clearInterval(this.simTimer), this.simTimer = void 0);
	}
	async refreshProfile(e = !1) {
		if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < hn)) try {
			this.profileState = await We(this.hass), this.profileAt = Date.now();
		} catch {}
	}
	restoreTimeline() {
		try {
			this.timeline = xn(localStorage.getItem(_n)) ?? bn;
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
		return h`
      <ha-top-app-bar-fixed .narrow=${this.narrow}>
        <ha-menu-button slot="navigationIcon"></ha-menu-button>
        <div slot="title">Activity Levels</div>
        <div slot="actionItems" class="row" style=${this.tab === "floorplans" ? "display:none" : ""}>
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
        ${this.tab === "floorplans" ? g : h`${this.renderBanner()} ${this.renderInferred()} ${this.renderWarnings()}`}
        <div class="tabs" style=${this.tab === "floorplans" ? "display:none" : ""} role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${this.tabs.map((e, t) => h`<button
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
          ${e ? this.renderTab(e) : h`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
	}
	renderLiveToggle() {
		return this.liveRequired ? g : h`
      <span class="muted">Live</span>
      <ha-switch
        .checked=${this.liveOn}
        @change=${(e) => this.toggleLive(e.target.checked)}
      ></ha-switch>
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
		let e = this.banner;
		return e ? h`<ha-alert
      alert-type=${e.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
			this.banner = null;
		}}
      >${e.text}</ha-alert
    >` : g;
	}
	renderInferred() {
		let e = this.inferred.length;
		return e === 0 ? g : h`<ha-alert class="inferred-notice" alert-type="warning">
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
		return this.warnings.length === 0 ? g : h`<ha-alert class="config-warnings" alert-type="warning">
      <ul>
        ${this.warnings.map((e) => h`<li>${e}</li>`)}
      </ul>
    </ha-alert>`;
	}
	renderTab(e) {
		switch (this.tab) {
			case "mixer": return this.renderMixer(e);
			case "groups": return h`<div class="layout ${this.narrow ? "narrow" : ""}">
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
			case "envelopes": return h`<al-envelopes
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
			case "defaults": return h`<al-defaults
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
			case "patterns": return h`<al-patterns
          .hass=${this.hass}
          .config=${e.config}
          .profileState=${this.profileState}
          .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild}
        ></al-patterns>`;
			case "code": return h`<al-code
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .available=${this.yamlEditor}
          @al-change=${this.onChange}
          @al-code-status=${this.onCodeStatus}
        ></al-code>`;
			case "floorplans": return h`<al-floorplans .hass=${this.hass} .config=${e.config} .live=${this.live}
          .disabled=${this.busy} .dirty=${e.dirty} .blocked=${this.blocked} .status=${this.banner?.text ?? ""}
          @al-save-config=${() => void this.save()} @al-discard-config=${() => this.discard()}
          @al-exit-floorplan=${() => this.selectTab(this.tabs.indexOf("mixer"))}
          @al-change=${this.onChange} @al-open-group=${this.openMixerGroup}></al-floorplans>`;
			case "paths": return h`<al-paths .hass=${this.hass} .config=${e.config} .narrow=${this.narrow}></al-paths>`;
			case "presence": return h`<al-presence
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
		let n = this.nav.selection, r = n === null ? void 0 : x(t, ee(n));
		return h`<div class="rows">
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
      ${this.previewError ? h`<ha-alert alert-type="warning">Some preview data could not be loaded. Missing values are shown as —.</ha-alert>` : g}
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
		return h`<div class="rows">
      <ha-card class="mixer-empty">
        <p class="muted">Add your first group in Groups.</p>
        <ha-button @click=${() => this.selectTab(this.tabs.indexOf("groups"))}>Go to Groups</ha-button>
      </ha-card>
    </div>`;
	}
	renderEditor(e) {
		let t = this.selection;
		return t ? t[t.length - 2] === "stimuli" ? h`<al-stimulus-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>` : h`<div><al-group-editor
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
        </div>` : h`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
	}
};
_([b({ attribute: !1 })], O.prototype, "hass", void 0), _([b({ type: Boolean })], O.prototype, "narrow", void 0), _([m()], O.prototype, "draft", void 0), _([m()], O.prototype, "inferred", void 0), _([m()], O.prototype, "warnings", void 0), _([m()], O.prototype, "tab", void 0), _([m()], O.prototype, "selection", void 0), _([m()], O.prototype, "nav", void 0), _([m()], O.prototype, "errors", void 0), _([m()], O.prototype, "banner", void 0), _([m()], O.prototype, "live", void 0), _([m()], O.prototype, "liveOn", void 0), _([m()], O.prototype, "busy", void 0), _([m()], O.prototype, "missing", void 0), _([m()], O.prototype, "profileState", void 0), _([m()], O.prototype, "simLog", void 0), _([m()], O.prototype, "timeline", void 0), _([m()], O.prototype, "preview", void 0), _([m()], O.prototype, "previewError", void 0), _([m()], O.prototype, "codeStatus", void 0), _([m()], O.prototype, "yamlEditor", void 0), _([m()], O.prototype, "tabFocus", void 0), O = _([S("activity-levels-panel")], O);
//#endregion
//#region src/duration.ts
function k(e) {
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
function A(e) {
	if (!e) return null;
	let t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
	return Math.round(t * 1e3) / 1e3;
}
function Sn(e) {
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
var j = ["on", "off"], Cn = {
	automation: j,
	binary_sensor: j,
	fan: j,
	humidifier: j,
	input_boolean: j,
	light: j,
	remote: j,
	siren: j,
	switch: j,
	update: j,
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
}, wn = (e) => e.split(".")[0] ?? "", Tn = (e) => {
	let t = e.replace(/_/g, " ");
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function En(e, t, n) {
	let r = wn(t), i = e?.states[t]?.attributes.device_class, a = [typeof i == "string" ? `component.${r}.entity_component.${i}.state.${n}` : null, `component.${r}.entity_component._.state.${n}`];
	if (typeof e?.localize == "function") for (let t of a) {
		if (t === null) continue;
		let n = e.localize(t);
		if (typeof n == "string" && n !== "") return n;
	}
	return Tn(n);
}
function Dn(e, t, n) {
	let r = [...Cn[wn(t)] ?? []];
	for (let i of [e?.states[t]?.state, ...n]) typeof i == "string" && i !== "" && !r.includes(i) && r.push(i);
	return r.map((n) => ({
		value: n,
		label: En(e, t, n)
	}));
}
function On(e, t) {
	let n = e?.states[t];
	if (!n) return null;
	let r = e?.formatEntityState?.(n);
	return typeof r == "string" && r !== "" ? r : En(e, t, n.state);
}
function kn(e, t, n) {
	let r = n.length === 1 ? n[0] : void 0;
	if (r === void 0) return {
		enter: "When it enters the active states",
		leave: "When it leaves them"
	};
	let i = En(e, t, r);
	return {
		enter: `When it becomes ${i}`,
		leave: `When it stops being ${i}`
	};
}
//#endregion
//#region src/errors.ts
var M = (e) => e.join("/");
function An(e, t) {
	let n = M(t), r = {};
	for (let t of e) {
		if (!t.path.startsWith(n + "/")) continue;
		let e = t.path.slice(n.length + 1);
		e.includes("/") || (r[e] = t.message);
	}
	return r;
}
function jn(e, t) {
	let n = M(t);
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
var Mn = (e, t) => new CustomEvent("al-code-status", {
	detail: {
		valid: e,
		errors: t
	},
	bubbles: !0,
	composed: !0
}), Nn = (e) => new CustomEvent("al-select", {
	detail: e,
	bubbles: !0,
	composed: !0
}), Pn = (e, t) => new CustomEvent(e, {
	detail: t,
	bubbles: !0,
	composed: !0
}), Fn = () => Pn("al-select-strip", null), In = (e) => Pn("al-level-override", { value: e }), Ln = (e) => Pn("al-mute-toggle", { muted: e }), Rn = () => Pn("al-reset", null), zn = (e) => new CustomEvent("al-nav", {
	detail: e,
	bubbles: !0,
	composed: !0
}), Bn = () => new CustomEvent("al-live-refresh", {
	detail: null,
	bubbles: !0,
	composed: !0
}), Vn = (e) => new CustomEvent("al-timeline-range", {
	detail: e,
	bubbles: !0,
	composed: !0
}), Hn = (e, t) => new CustomEvent("al-sim-toggle", {
	detail: {
		gid: e,
		on: t
	},
	bubbles: !0,
	composed: !0
}), Un = (e = !1) => new CustomEvent("al-rebuild", {
	detail: { force: e },
	bubbles: !0,
	composed: !0
}), Wn = (e) => new CustomEvent("al-map-select", {
	detail: { id: e },
	bubbles: !0,
	composed: !0
});
//#endregion
//#region src/tree-rows.ts
function Gn(e, t) {
	let n = [], r = (e, i, a, o, s) => {
		let c = M(i), l = e.children.length > 0 || e.stimuli.length > 0, u = l && t.has(c);
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
var Kn = "activity_levels.groups_expanded";
function qn() {
	try {
		let e = localStorage.getItem(Kn), t = e === null ? null : JSON.parse(e);
		return Array.isArray(t) ? new Set(t.filter((e) => typeof e == "string")) : /* @__PURE__ */ new Set();
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function Jn(e) {
	try {
		localStorage.setItem(Kn, JSON.stringify([...e]));
	} catch {}
}
//#endregion
//#region src/al-tree.ts
var Yn = (e) => e.stopPropagation(), Xn = (e) => {
	(e.key === "Enter" || e.key === " ") && e.stopPropagation();
}, Zn = "mdi:flash", Qn = "text/plain", $n = 36, P = class extends p {
	constructor(...e) {
		super(...e), this.selection = null, this.errors = [], this.live = null, this.expanded = qn(), this.dragging = null, this.target = null, this.menu = null;
	}
	static {
		this.styles = [v, T`
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
		this.dispatchEvent(Nn(e));
	}
	isSelected(e) {
		return this.selection !== null && M(this.selection) === M(e);
	}
	select(e, t) {
		e.stopPropagation(), this.menu = null, this.emitSelect(t);
	}
	toggle(e) {
		let t = M(e), n = new Set(this.expanded);
		n.delete(t) || n.add(t), this.expanded = n, Jn(n);
	}
	open(e) {
		if (e.length === 0) return;
		let t = new Set(this.expanded).add(M(e));
		this.expanded = t, Jn(t);
	}
	listOf(e) {
		return {
			list: e.slice(0, -1),
			index: e[e.length - 1]
		};
	}
	addGroup(e, t, n) {
		let r = this.config;
		r && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(je(r, e, t, xe(Ze(r, n), n))), this.emitSelect([...e, t]));
	}
	addStimulus(e, t) {
		let n = this.config;
		if (!n) return;
		this.menu = null, this.open(e);
		let r = [...e, "stimuli"];
		this.emitChange(je(n, r, t, Ce(""))), this.emitSelect([...r, t]);
	}
	removeNode(e, t) {
		let n = this.config;
		if (!n || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
		this.emitChange(Re(n, e));
		let r = Se(e);
		this.emitSelect(r.length ? r : null);
	}
	tryMove(e, t, n) {
		let r = this.config;
		if (!r || !Pe(r, e, t, n).ok) return !1;
		let i = $e(r, e, t, n);
		if (i === r) return !1;
		let { parent: a, index: o } = Je(e, t, n);
		return this.open(a.slice(0, -1)), this.emitChange(i), this.emitSelect([...a, o]), !0;
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(Qn, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = {
			key: M(t),
			path: t
		};
	}
	onDragEnd() {
		this.dragging = null, this.target = null;
	}
	whereIn(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || $n, i = r / 3, a = e.clientY - n.top;
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
			let t = e.dataTransfer?.getData(Qn) ?? "", n = JSON.parse(t);
			return Array.isArray(n) ? n : null;
		} catch {
			return null;
		}
	}
	draggedPath(e) {
		return this.dragging === null ? null : e.dataTransfer?.types.includes(Qn) === !0 ? this.dragging.path : null;
	}
	onDragOver(e, t) {
		let n = this.config, r = this.draggedPath(e);
		if (!n || r === null) return;
		e.preventDefault();
		let i = this.whereIn(e, t), { toParent: a, index: o } = this.destination(t, i, r), s = Pe(n, r, a, o);
		e.dataTransfer && (e.dataTransfer.dropEffect = s.ok ? "move" : "none"), this.target = {
			key: M(t.path),
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
		this.shadowRoot?.querySelector(`.row[data-path="${M(e)}"]`)?.focus();
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
				t.expanded ? this.toggle(t.path) : this.focusPath(Se(t.path));
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
				let e = t.kind === "group" ? st(n, [...r, i - 1]) : void 0;
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
		return e === null || t === void 0 ? null : Sn(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
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
		if (!e) return h`<ha-card><span class="muted">Loading…</span></ha-card>`;
		if (e.groups.length === 0) return this.renderEmpty();
		let t = Gn(e, this.expanded), n = this.tabbableKey(t);
		return h`
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
		return h`
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
		let t = e.filter((e) => e.kind !== "placeholder"), n = this.selection === null ? null : M(this.selection);
		return n !== null && t.some((e) => M(e.path) === n) ? n : t.length === 0 ? "" : M(t[0].path);
	}
	renderRow(e, t, n) {
		if (t.kind === "placeholder") return h`<div class="tree-row placeholder" role="none" style="--al-indent: ${t.depth}">
        <span class="guides"></span>
        Nothing in here yet — add a stimulus or a group with the buttons on the row above.
      </div>`;
		let r = M(t.path), i = this.target?.key === r ? this.target : null, a = this.isSelected(t.path), o = [
			"row",
			"tree-row",
			a ? "selected" : "",
			this.dragging?.key === r ? "dragging" : "",
			i === null ? "" : i.verdict.ok ? `drop-${i.where}` : "illegal"
		].filter(Boolean).join(" ");
		return h`<div
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
      aria-expanded=${t.expandable ? t.expanded ? "true" : "false" : g}
      @click=${(e) => this.select(e, t.path)}
      @keydown=${(e) => this.onRowKeydown(e, t)}
      @dragstart=${(e) => this.onDragStart(e, t.path)}
      @dragend=${this.onDragEnd}
      @dragover=${(e) => this.onDragOver(e, t)}
      @drop=${(e) => this.onDrop(e, t)}
    >
      <span class="guides"></span>
      ${t.expandable ? h`<ha-icon-button
            class="caret"
            label=${t.expanded ? "Collapse" : "Expand"}
            title=${t.expanded ? "Collapse" : "Expand"}
            @keydown=${Xn}
            @click=${(e) => {
			e.stopPropagation(), this.toggle(t.path);
		}}
          >
            <ha-icon icon=${t.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </ha-icon-button>` : h`<span class="caret"></span>`}
      ${this.renderIcon(t)}
      <button
        type="button"
        class="label"
        title=${t.kind === "stimulus" ? t.stimulus?.entity ?? "" : "Edit this group"}
        @keydown=${Xn}
        @click=${(e) => this.select(e, t.path)}
      >
        ${this.labelFor(t)}
      </button>
      ${i !== null && !i.verdict.ok ? h`<span class="hint">${i.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === r ? this.renderAddMenu(t) : g}
    </div>`;
	}
	renderIcon(e) {
		if (e.kind === "group" && e.group) return h`<ha-icon icon=${y[e.group.kind].icon}></ha-icon>`;
		let t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
		return t ? h`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : h`<ha-icon icon=${Zn}></ha-icon>`;
	}
	renderRowStatus(e, t) {
		let n = jn(this.errors, t.path), r = n ? h`<span class="badge" title="${n} problem(s) in this group">${n}</span>` : g;
		if (t.kind === "stimulus") {
			let n = t.stimulus, i = n === void 0 ? null : On(this.hass, n.entity), a = st(e, Se(t.path)), o = a === void 0 ? void 0 : this.live?.voices[a.id]?.find((e) => e.label === (n?.key ?? n?.entity));
			return h`${r}${i === null ? g : h`<span class="muted chip">${i}</span>`}
      ${o ? h`<span class="chip phase ${o.phase}" title=${this.voiceTitle(o)}>${o.phase}</span>
            <span class="muted chip">${o.value.toFixed(2)}</span>` : g}`;
		}
		let i = t.group, a = i === void 0 ? void 0 : this.live?.groups[i.id], o = a?.max_value ?? i?.max_value ?? e.defaults.max_value, s = a ? Math.max(0, Math.min(100, a.value / (o || 1) * 100)) : 0;
		return h`${r}
    ${a ? h`<div class="meter" title=${this.meterTitle(a, o, t.depth === 0)}>
            <div style="width: ${s}%"></div>
          </div>
          <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : g}`;
	}
	renderActions(e) {
		let t = e.path;
		if (e.kind === "stimulus") return h`<div class="actions" @click=${Yn} @keydown=${Xn}>
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
		return n === void 0 ? h`<div class="actions"></div>` : h`<div class="actions" @click=${Yn} @keydown=${Xn}>
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
        aria-expanded=${this.menu === M(t) ? "true" : "false"}
        .disabled=${dt(n.kind).length === 0}
        @click=${() => {
			this.menu = this.menu === M(t) ? null : M(t);
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
		return t === void 0 ? h`${g}` : h`<div
      class="add-menu"
      role="menu"
      draggable="false"
      @click=${Yn}
      @keydown=${Xn}
      @dragstart=${Yn}
    >
      ${dt(t.kind).map((n) => h`<button
          type="button"
          role="menuitem"
          data-kind=${n}
          @click=${() => this.addGroup([...e.path, "children"], t.children.length, n)}
        >
          <ha-icon icon=${y[n].icon}></ha-icon>
          <span>
            <strong>${y[n].label}</strong>
            <div class="muted">${y[n].definition}</div>
          </span>
        </button>`)}
    </div>`;
	}
};
_([b({ attribute: !1 })], P.prototype, "hass", void 0), _([b({ attribute: !1 })], P.prototype, "config", void 0), _([b({ attribute: !1 })], P.prototype, "selection", void 0), _([b({ attribute: !1 })], P.prototype, "errors", void 0), _([b({ attribute: !1 })], P.prototype, "live", void 0), _([m()], P.prototype, "expanded", void 0), _([m()], P.prototype, "dragging", void 0), _([m()], P.prototype, "target", void 0), _([m()], P.prototype, "menu", void 0), P = _([S("al-tree")], P);
//#endregion
//#region src/ha-links.ts
function er(e, t, n) {
	return t ? h`<a href=${`/config/${e === "device" ? "devices" : "areas"}/${e}/${encodeURIComponent(t)}`}>${n}</a>` : n;
}
function tr(e, t, n, r = "Open entity", i, a = "Open device", o = !1) {
	let s = n && (t?.states?.[n] || t?.entities?.[n]), c = i ?? (n ? t?.entities?.[n]?.device_id : null), l = () => e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: n },
		bubbles: !0,
		composed: !0
	}));
	return h`${s ? o ? h`<button type="button" @click=${l}>${r}</button>` : h`<ha-button @click=${l}>${r}</ha-button>` : g}
    ${c ? er("device", c, a) : g}`;
}
//#endregion
//#region src/convert.ts
var nr = (e) => e == null || e === "" ? null : e;
function rr(e, t) {
	if (t != null) switch (e) {
		case "duration": return k(t);
		case "boolean": return t ? "true" : "false";
		default: return t;
	}
}
function ir(e, t) {
	if (t == null || t === "") return null;
	switch (e) {
		case "duration": return A(t);
		case "boolean": return t === !0 || t === "true";
		case "number":
		case "multiplier": {
			let e = typeof t == "number" ? t : Number(t);
			return Number.isNaN(e) ? null : e;
		}
		default: return String(t);
	}
}
function ar(e, t) {
	if (t == null) return "unset";
	switch (e) {
		case "duration": return Sn(t);
		case "boolean": return t ? "Yes" : "No";
		case "multiplier": return or(t);
		default: return String(t);
	}
}
var or = (e) => `${e.toFixed(1)}×`, sr = [
	"kind",
	"floor_id",
	"area_id",
	"id",
	"name"
], cr = [
	"mix",
	"null_handling",
	"gain"
], lr = {
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
}, ur = {
	id: "Identifies the group and its entities. Changing it re-creates them.",
	name: "Friendly name; falls back to the area's name, then to the id.",
	kind: "What this is on the property. It decides what can go inside it.",
	floor_id: "Bind this to a Home Assistant floor to reuse its name.",
	area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
	mix: "How stimuli and child groups combine into this group's value.",
	null_handling: "Whether idle contributors count as zero or drop out of the mean.",
	gain: "Scales this group's contribution to its parent."
}, dr = (e) => lr[e.name] ?? e.name, fr = (e) => ur[e.name] ?? "", pr = [
	"id",
	"name",
	"kind",
	"floor_id",
	"area_id",
	"mix",
	"null_handling",
	"gain"
], mr = [
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
], hr = [{
	value: "zero",
	label: "Idle counts as 0"
}, {
	value: "ignore",
	label: "Ignore idle"
}], gr = "How this group's stimuli and children combine into one level.", _r = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", vr = "How loudly 'somebody is here' plays in this group's mix.", yr = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, br = { select: {
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
} }, xr = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, Sr = (e, t, n) => {
	switch (e) {
		case "null_handling": return t.mix === "mean";
		case "gain": return !n;
		case "floor_id": return t.kind === "floor";
		case "area_id": return a.has(t.kind);
		default: return !0;
	}
}, Cr = (e, t) => {
	let n = [...dt(t)];
	return n.includes(e.kind) || n.push(e.kind), { select: {
		mode: "dropdown",
		options: n.map((e) => ({
			value: e,
			label: y[e].label
		}))
	} };
};
function wr(e, t, n, r, i = null) {
	let a = {
		id: { text: {} },
		name: { text: {} },
		kind: Cr(e, i),
		floor_id: { floor: {} },
		area_id: { area: {} },
		mix: { select: {
			mode: "dropdown",
			options: mr
		} },
		null_handling: { select: {
			mode: "dropdown",
			options: hr
		} },
		gain: xr
	};
	return n.filter((n) => Sr(n, e, t)).map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function Tr(e, t, n, r) {
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
	return Object.fromEntries(n.filter((n) => Sr(n, e, t) && (n !== "area_id" || e.area_id !== null) && (n !== "floor_id" || e.floor_id !== null)).map((e) => [e, i[e]]));
}
function Er(e, t) {
	let n = { ...e };
	return "id" in t && (n.id = String(t.id ?? "")), "name" in t && (n.name = nr(t.name)), "kind" in t && typeof t.kind == "string" && (n.kind = t.kind), "floor_id" in t && (n.floor_id = nr(t.floor_id)), "area_id" in t && (n.area_id = nr(t.area_id)), "mix" in t && (n.mix = t.mix ?? e.mix), "null_handling" in t && (n.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), n;
}
var Dr = (e, t) => pr.find((n) => e[n] !== t[n]), Or = (e) => e.id === "" || RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function kr(e, t, n, r, i) {
	let a = {
		...e,
		[t]: n
	};
	return n === null ? a : (Or(e) && (a.id = i ? Ze(i, n) : Be(n)), e.name === null && r !== null && (a.name = r), a);
}
var Ar = (e, t, n, r) => kr(e, "area_id", t, n, r), jr = (e, t, n, r) => kr(e, "floor_id", t, n, r), Mr = "activity_levels.panels";
function Nr() {
	try {
		let e = localStorage.getItem(Mr), t = e === null ? null : JSON.parse(e);
		return typeof t != "object" || !t || Array.isArray(t) ? {} : t;
	} catch {
		return {};
	}
}
function Pr(e, t) {
	let n = Nr()[e];
	return typeof n == "boolean" ? n : t;
}
function Fr(e, t) {
	try {
		localStorage.setItem(Mr, JSON.stringify({
			...Nr(),
			[e]: t
		}));
	} catch {}
}
//#endregion
//#region src/panels.ts
function Ir(e, t, n, r, i, a, o = g) {
	let s = `${e}:${t}`;
	return h`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${t}
    ?expanded=${Pr(s, i)}
    @expanded-changed=${(e) => {
		Fr(s, e.detail.expanded);
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
var Lr = class extends p {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [v, T`
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
		return this.config && this.path ? x(this.config, this.path) : void 0;
	}
	get edges() {
		return (this.group?.adjacent ?? []).map((e) => ({
			id: te(e),
			connection: u(e),
			one_way: ye(e)
		}));
	}
	emit(e) {
		let { config: t, path: n } = this;
		!t || !n || this.dispatchEvent(N(E(t, [...n, "adjacent"], e), void 0, !0));
	}
	edit(e, t) {
		this.emit(this.edges.map((n, r) => r === e ? {
			...n,
			...t
		} : n));
	}
	nameOf(e) {
		return (this.config ? D(this.config).find(({ group: t }) => t.id === e) : void 0)?.group.name ?? e;
	}
	candidates() {
		let e = this.group;
		if (!this.config || !e) return [];
		let t = /* @__PURE__ */ new Set([
			e.id,
			...this.edges.map((e) => e.id),
			...me(this.config, e.id).map((e) => e.group.id)
		]);
		return D(this.config).map(({ group: e }) => e).filter((e) => a.has(e.kind) && !t.has(e.id));
	}
	errorFor(e) {
		let t = `${(this.path ?? []).join("/")}/adjacent/${e}`;
		return this.errors.find((e) => e.path === t || e.path.startsWith(`${t}/`))?.message;
	}
	render() {
		let e = this.group;
		if (!this.config || !e) return g;
		let t = me(this.config, e.id), n = this.candidates();
		return h`
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
          ${this.edges.length === 0 && t.length === 0 ? h`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>` : g}
        </tbody>
      </table>
      ${n.length === 0 ? g : h`<select
            class="add-edge"
            aria-label="Add an adjacent group"
            .value=${""}
            @change=${(e) => {
			let t = e.target;
			t.value !== "" && (this.emit([...this.edges, {
				id: t.value,
				connection: Oe,
				one_way: !1
			}]), t.value = "");
		}}
          >
            <option value="">Add an adjacent group…</option>
            ${n.map((e) => h`<option value=${e.id}>${e.name ?? e.id}</option>`)}
          </select>`}
    `;
	}
	renderOwn(e, t) {
		let n = this.errorFor(t), r = this.nameOf(e.id);
		return h`<tr class="own" data-id=${e.id}>
      <td>${r} ${n ? h`<div class="muted error">${n}</div>` : g}</td>
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${r}"
          .value=${e.connection}
          @change=${(e) => this.edit(t, { connection: e.target.value })}
        >
          ${lt.map((t) => h`<option value=${t} ?selected=${t === e.connection}>${ht[t]}</option>`)}
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
		return h`<tr class="declared" data-id=${e.id}>
      <td><span class="muted">declared on</span> ${n}</td>
      <td>${ht[t.connection]}</td>
      <td>${t.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
	}
};
_([b({ attribute: !1 })], Lr.prototype, "config", void 0), _([b({ attribute: !1 })], Lr.prototype, "path", void 0), _([b({ attribute: !1 })], Lr.prototype, "errors", void 0), Lr = _([S("al-adjacency-table")], Lr);
//#endregion
//#region src/al-override-field.ts
var Rr = { select: {
	mode: "dropdown",
	options: [{
		value: "true",
		label: "Yes"
	}, {
		value: "false",
		label: "No"
	}]
} };
function zr(e, t) {
	return e.select?.options?.find((e) => e.value === t)?.label;
}
var F = class extends p {
	constructor(...e) {
		super(...e), this.label = "", this.selector = { text: {} }, this.value = null, this.inherited = null, this.inheritedFrom = "defaults", this.hint = "", this.kind = "number", this.disabled = !1;
	}
	static {
		this.styles = [v, T`
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
		e.stopPropagation(), this.emit(ir(this.kind, e.detail?.value));
	}
	onReset() {
		this.emit(null);
	}
	describeInherited() {
		let e = this.inherited;
		if (this.kind === "select" && e != null) {
			let t = zr(this.selector, String(e));
			if (t !== void 0) return t;
		}
		return ar(this.kind, e);
	}
	render() {
		let e = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`, t = this.hint === "" ? e : `${this.hint} ${e}`;
		return h`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? Rr : this.selector}
          .label=${this.label}
          .required=${!1}
          .disabled=${this.disabled}
          .value=${rr(this.kind, this.value)}
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
      ${this.error ? h`<div class="muted error msg">${this.error}</div>` : g}
    `;
	}
};
_([b({ attribute: !1 })], F.prototype, "hass", void 0), _([b()], F.prototype, "label", void 0), _([b({ attribute: !1 })], F.prototype, "selector", void 0), _([b({ attribute: !1 })], F.prototype, "value", void 0), _([b({ attribute: !1 })], F.prototype, "inherited", void 0), _([b({ attribute: "inherited-from" })], F.prototype, "inheritedFrom", void 0), _([b()], F.prototype, "hint", void 0), _([b()], F.prototype, "kind", void 0), _([b()], F.prototype, "error", void 0), _([b({ type: Boolean })], F.prototype, "disabled", void 0), F = _([S("al-override-field")], F);
//#endregion
//#region src/stimulus-form.ts
var Br = {
	entity: "Entity",
	mode: "Mode",
	to: "Active states",
	edges: "Fire on",
	gain: "Gain",
	key: "Label",
	envelope: "Envelope preset"
}, Vr = {
	entity: "The entity whose state drives this stimulus.",
	mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
	to: "Which states of this entity count as active.",
	edges: "Which crossings fire a trigger. At least one.",
	gain: "How loudly this stimulus contributes to its group.",
	key: "Optional name for this trigger; defaults to the entity id.",
	envelope: "Preset the overrides below start from."
}, Hr = (e) => Br[e.name] ?? e.name, Ur = (e) => Vr[e.name] ?? "", Wr = [
	"entity",
	"mode",
	"gain",
	"key",
	"envelope"
], Gr = { duration: { enable_millisecond: !0 } }, Kr = { number: {
	min: 0,
	step: .1,
	mode: "box",
	unit_of_measurement: "×"
} }, qr = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, Jr = "Allow retrigger", Yr = "When a new trigger is honoured while the envelope is still active.", Xr = "Stacks", Zr = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", Qr = { select: {
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
} }, $r = { select: {
	mode: "list",
	options: [{
		value: "sustained",
		label: "Sustained — hold while it is active"
	}, {
		value: "momentary",
		label: "Momentary — fire on each change"
	}]
} }, ei = [
	"attack",
	"decay",
	"impulse"
], ti = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", ni = (e, t) => e.mode === "momentary" && ei.includes(t), ri = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, ii = "(unknown preset — using built-in defaults)", ai = [
	{
		name: "attack",
		label: "Attack",
		kind: "duration",
		selector: Gr
	},
	{
		name: "decay",
		label: "Decay",
		kind: "duration",
		selector: Gr
	},
	{
		name: "sustain",
		label: "Sustain",
		kind: "multiplier",
		selector: Kr
	},
	{
		name: "release",
		label: "Release",
		kind: "duration",
		selector: Gr
	},
	{
		name: "impulse",
		label: "Impulse",
		kind: "boolean",
		selector: Rr
	},
	{
		name: "retrigger",
		label: Jr,
		kind: "select",
		selector: Qr,
		hint: Yr
	},
	{
		name: "stack",
		label: Xr,
		kind: "boolean",
		selector: Rr,
		hint: Zr
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: ri
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: Gr
	}
], oi = [
	"entity",
	"mode",
	"to",
	"edges",
	"key"
], si = (e) => oi.filter((t) => t !== "edges" || e.mode === "momentary"), ci = ["envelope", "gain"], li = "How a single trigger rises and falls over time.", ui = "What makes this stimulus fire, and what it is called in the mix.", di = "Change part of the preset for this stimulus only.", fi = (e) => ai.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, pi = (e) => [{
	value: "",
	label: "(default preset)"
}, ...e.envelopes.map((e) => ({
	value: e.id,
	label: e.id
}))];
function mi(e, t, n, r) {
	let i = kn(n, t.entity, t.to), a = {
		entity: { entity: {} },
		mode: $r,
		to: { select: {
			mode: "dropdown",
			multiple: !0,
			custom_value: !0,
			options: Dn(n, t.entity, t.to)
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
		gain: qr,
		key: { text: {} },
		envelope: { select: {
			mode: "dropdown",
			options: pi(e)
		} }
	};
	return r.map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function hi(e, t) {
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
var gi = (e) => Array.isArray(e) ? e.filter((e) => typeof e == "string" && e !== "") : [];
function _i(e, t) {
	let n = { ...e };
	if ("entity" in t && (n.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (n.mode = t.mode), "to" in t && (n.to = gi(t.to)), "edges" in t) {
		let e = gi(t.edges).filter((e) => e === "enter" || e === "leave");
		e.length > 0 && (n.edges = e);
	}
	return "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (n.key = nr(t.key)), "envelope" in t && (n.envelope = nr(t.envelope)), n;
}
var vi = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]);
function yi(e, t) {
	return vi(e.to, t.to) ? vi(e.edges, t.edges) ? Wr.find((n) => e[n] !== t[n]) : "edges" : "to";
}
function bi(e, t, n) {
	let r = pe(e, t.envelope);
	return r ? r[n] === null || r[n] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : ii;
}
function xi(e, t) {
	return t == null || e === void 0 ? null : Sn(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
//#endregion
//#region src/sketch.ts
var Si = (e) => e.release * e.sustain, Ci = (e) => Math.max(1, e.sustain), wi = (e) => e.sustain / Ci(e);
function Ti(e, t = .25) {
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
	let n = Si(e), r = e.attack + e.decay + n, i = r > 0 ? r * t / (1 - t) : 1, a = r + i, o = 1 / Ci(e), s = wi(e), c = 0, l = [{
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
function Ei(e, t = .25) {
	let n = Ti(e, t), r = (e) => ((n[e]?.x ?? 0) + (n[e + 1]?.x ?? 0)) / 2;
	if (e.impulse) {
		let t = [{
			text: "impulse",
			x: 0
		}];
		return e.release > 0 && t.push({
			text: `R ${Sn(e.release)}`,
			x: r(1)
		}), t;
	}
	let i = [];
	return e.attack > 0 && i.push({
		text: `A ${Sn(e.attack)}`,
		x: r(0)
	}), e.decay > 0 && i.push({
		text: `D ${Sn(e.decay)}`,
		x: r(1)
	}), i.push({
		text: `S ${or(e.sustain)}`,
		x: r(2)
	}), Si(e) > 0 && i.push({
		text: `R ${Sn(e.release)}`,
		x: r(3)
	}), i;
}
//#endregion
//#region src/al-envelope-sketch.ts
var Di = 10, Oi = 190, ki = 58, Ai = 72, ji = (e) => Di + e * 180, Mi = (e) => ki - e * 48, Ni = (e) => String(Math.round(e * 10) / 10), Pi = (e, t) => `${Ni(e)},${Ni(t)}`, Fi = (e) => Math.min(184, Math.max(16, ji(e))), Ii = class extends p {
	constructor(...e) {
		super(...e), this.envelope = null;
	}
	static {
		this.styles = [v, T`
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
		if (!e) return g;
		let t = Ti(e), n = t[0], r = t[t.length - 1], i = t.map((e) => Pi(ji(e.x), Mi(e.y))).join(" "), a = `${Pi(ji(n.x), ki)} ${i} ${Pi(ji(r.x), ki)}`, o = Ei(e), s = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
		return h`
      <svg viewBox="0 0 200 80" role="img" aria-label=${s}>
        <title>${s}</title>
        <line class="grid" x1=${Di} y1=${ki} x2=${Oi} y2=${ki}></line>
        ${e.impulse ? g : C`<line
              class="grid"
              x1=${Di}
              y1=${Ni(Mi(wi(e)))}
              x2=${Oi}
              y2=${Ni(Mi(wi(e)))}
            ></line>`}
        <polygon class="area" points=${a}></polygon>
        <polyline class="curve" points=${i}></polyline>
        ${o.map((e) => C`<text class="caption" x=${Ni(Fi(e.x))} y=${Ai} text-anchor="middle">${e.text}</text>`)}
      </svg>
    `;
	}
};
_([b({ attribute: !1 })], Ii.prototype, "envelope", void 0), Ii = _([S("al-envelope-sketch")], Ii);
//#endregion
//#region src/al-presence-overrides.ts
var Li = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, Ri = class extends p {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [v];
	}
	setPresence(e, t) {
		let { config: n, path: r } = this;
		if (!n || !r) return;
		let i = x(n, r);
		if (!i) return;
		let a = E(n, [...r, "presence"], {
			...i.presence ?? ie(),
			[e]: t
		});
		this.dispatchEvent(N(a, `${M(r)}:presence:${e}`));
	}
	render() {
		let { config: e, path: t } = this, n = e && t ? x(e, t) : void 0;
		if (!e || !t || !n) return g;
		let r = n.presence ?? ie(), i = r.envelope ?? w(e).envelope, a = Ye(e, {
			...r,
			envelope: i
		}), o = An(this.errors, [...t, "presence"]);
		return h`
      <ha-selector
        class="presence-envelope"
        .hass=${this.hass}
        .selector=${{ select: {
			mode: "dropdown",
			options: pi(e)
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
        .selector=${qr}
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
        .selector=${Li}
        .value=${r.activity_floor}
        .inherited=${w(e).activity.floor}
        .inheritedFrom=${"presence"}
        .error=${o.activity_floor}
        @value-changed=${(e) => this.setPresence("activity_floor", e.detail.value ?? null)}
      ></al-override-field>
      ${ai.map((e) => h`<al-override-field
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
_([b({ attribute: !1 })], Ri.prototype, "hass", void 0), _([b({ attribute: !1 })], Ri.prototype, "config", void 0), _([b({ attribute: !1 })], Ri.prototype, "path", void 0), _([b({ attribute: !1 })], Ri.prototype, "errors", void 0), Ri = _([S("al-presence-overrides")], Ri);
//#endregion
//#region src/al-group-editor.ts
var zi = "People can leave the property from here, so presence can move from here to Away.", Bi = class extends p {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [v, T`
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
		this.dispatchEvent(Nn(e));
	}
	onIdentityChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = x(t, n);
		if (!r) return;
		let i = e.detail?.value ?? {}, a = Er(r, i);
		"area_id" in i && a.area_id !== r.area_id && (a = Ar(a, a.area_id, a.area_id === null ? null : this.areaName(a.area_id), t)), "floor_id" in i && a.floor_id !== r.floor_id && (a = jr(a, a.floor_id, a.floor_id === null ? null : this.floorName(a.floor_id), t));
		let o = Dr(a, r);
		o !== void 0 && this.emitChange(E(t, n, a), `${M(n)}:${o}`);
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
		let r = x(t, n);
		if (!r) return;
		let i = Er(r, e.detail?.value ?? {}), a = Dr(i, r);
		a !== void 0 && this.emitChange(E(t, n, i), `${M(n)}:${a}`);
	}
	setField(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(E(n, [...r, e], t), `${M(r)}:${e}`);
	}
	onDelete() {
		let { config: e, path: t } = this;
		if (!e || !t) return;
		let n = x(e, t);
		if (!n || !window.confirm(`Delete group "${n.name || n.id}" and everything in it?`)) return;
		this.emitChange(Re(e, t));
		let r = Se(t);
		this.emitSelect(r.length ? r : null);
	}
	render() {
		let { config: e, path: t } = this;
		if (!e || !t || t.length === 0) return h`<ha-card><span class="muted">Select a group.</span></ha-card>`;
		let n = x(e, t);
		if (!n) return h`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		let r = t.length === 2, i = this.errors.filter((e) => e.path === M(t)), a = An(this.errors, t), o = t.length > 2 ? x(e, Se(t)) : void 0;
		return h`
      <ha-card header="Group">
        ${n.area_id ? er("area", n.area_id, "Open Home Assistant area") : g}
        ${i.map((e) => h`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${Ir("group", "identity", "Identity", y[n.kind].definition, !0, h`
            <ha-form
              .hass=${this.hass}
              .data=${Tr(n, r, sr, e)}
              .schema=${wr(n, r, sr, e, o?.kind ?? null)}
              .error=${a}
              .computeLabel=${dr}
              .computeHelper=${fr}
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(e, n, a)}
          `)}
        ${Ir("group", "mix", "Mix", gr, !0, this.renderMix(e, n, r, a))}
        ${this.renderAdjacency(e, n, a)} ${this.renderPresence(e, n, t)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderMix(e, t, n, r) {
		return h`
      <ha-form
        .hass=${this.hass}
        .data=${Tr(t, n, cr, e)}
        .schema=${wr(t, n, cr, e)}
        .error=${r}
        .computeLabel=${dr}
        .computeHelper=${fr}
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${lr.max_value}
        kind="number"
        .selector=${yr}
        .value=${t.max_value}
        .inherited=${e.defaults.max_value}
        .inheritedFrom=${"defaults"}
        .error=${r.max_value}
        @value-changed=${(e) => this.setField("max_value", e.detail.value)}
      ></al-override-field>
      <al-override-field
        .hass=${this.hass}
        .label=${lr.precision}
        kind="select"
        .selector=${br}
        .value=${t.precision === null ? null : String(t.precision)}
        .inherited=${String(e.defaults.precision)}
        .inheritedFrom=${"defaults"}
        .error=${r.precision}
        @value-changed=${(e) => this.setField("precision", e.detail.value === null ? null : Number(e.detail.value))}
      ></al-override-field>
    `;
	}
	renderAdjacency(e, t, n) {
		return a.has(t.kind) ? Ir("group", "adjacent", "Adjacent groups", _r, !0, h`
        <al-adjacency-table
          .config=${e}
          .path=${this.path}
          .errors=${this.errors}
        ></al-adjacency-table>
        ${this.renderExit(t, n)}
      `) : g;
	}
	renderExit(e, t) {
		return h`<div class="exit row">
      <ha-switch
        .checked=${e.exit === !0}
        @change=${(e) => this.setField("exit", e.target.checked === !0)}
      ></ha-switch>
      <div>
        <div>Leads off the property</div>
        <div class="muted">${zi}</div>
        ${t.exit ? h`<div class="error">${t.exit}</div>` : g}
      </div>
    </div>`;
	}
	renderPresence(e, t, n) {
		return w(e).enabled ? Ir("group", "presence", "Presence", vr, !1, h`<al-presence-overrides
        .hass=${this.hass}
        .config=${e}
        .path=${n}
        .errors=${this.errors}
      ></al-presence-overrides>`) : g;
	}
	renderStale(e, t, n) {
		if (a.has(t.kind)) return g;
		let r = [t.adjacent.length > 0 ? "adjacent groups" : null, t.exit === !0 ? "a way off the property" : null].filter((e) => e !== null);
		if (r.length === 0) return g;
		let i = n.adjacent ?? n.exit ?? `${y[t.kind].label} groups have no ${r.join(" and no ")}.`;
		return h`<div class="stale row">
      <div class="grow error">${i}</div>
      <ha-button appearance="plain" @click=${() => this.clearStale(e)}>Remove</ha-button>
    </div>`;
	}
	clearStale(e) {
		let t = this.path;
		if (!t) return;
		let n = E(E(e, [...t, "adjacent"], []), [...t, "exit"], !1);
		this.dispatchEvent(N(n, void 0, !0));
	}
};
_([b({ attribute: !1 })], Bi.prototype, "hass", void 0), _([b({ attribute: !1 })], Bi.prototype, "config", void 0), _([b({ attribute: !1 })], Bi.prototype, "path", void 0), _([b({ attribute: !1 })], Bi.prototype, "errors", void 0), Bi = _([S("al-group-editor")], Bi);
//#endregion
//#region src/al-stimulus-editor.ts
var Vi = class extends p {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null;
	}
	static {
		this.styles = [v, T`
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
		let r = Ee(t, n);
		if (!r) return;
		let i = _i(r, e.detail?.value ?? {}), a = yi(i, r);
		a !== void 0 && this.emitChange(E(t, n, i), `${M(n)}:${a}`);
	}
	setOverride(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(E(n, [...r, e], t), `${M(r)}:${e}`);
	}
	renderLive(e, t) {
		return e ? h`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${e.phase}">${e.phase}</span>
      <span class="chip">${e.value.toFixed(2)}</span>
      ${t === null ? g : h`<span class="muted chip">ends in ${t}</span>`}
      <span class="dot ${e.gate ? "gated" : ""}" title=${e.gate ? "Gate open" : "Gate closed"}></span>
    </div>` : g;
	}
	renderOverride(e, t, n, r) {
		let { config: i } = this, a = ni(t, e.name);
		return h`<al-override-field
      .hass=${this.hass}
      .label=${e.label}
      .disabled=${a}
      .hint=${a ? ti : e.hint ?? ""}
      .kind=${e.kind}
      .selector=${e.selector}
      .value=${t[e.name]}
      .inherited=${n[e.name]}
      .inheritedFrom=${i ? bi(i, t, e.name) : "defaults"}
      .error=${r[e.name]}
      @value-changed=${(t) => this.setOverride(e.name, t.detail.value)}
    ></al-override-field>`;
	}
	render() {
		let { config: e, path: t } = this;
		if (!e || !t || t.length < 3) return h`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
		let n = Ee(e, t);
		if (!n) return h`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
		let r = x(e, Se(t)), i = An(this.errors, t), a = this.errors.filter((e) => e.path === M(t)), o = Ye(e, n), s = this.live?.voices[r?.id ?? ""]?.find((e) => e.label === (n.key ?? n.entity)), c = xi(this.live?.now, s?.phase_ends), l = fi(n);
		return h`
      <ha-card header="Stimulus">
        ${tr(this, this.hass, n.entity)}
        ${a.map((e) => h`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${Ir("stimulus", "source", "Source", ui, !0, h`
            <ha-form
              .hass=${this.hass}
              .data=${hi(n, si(n))}
              .schema=${mi(e, n, this.hass, si(n))}
              .error=${i}
              .computeLabel=${Hr}
              .computeHelper=${Ur}
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `)}
        ${Ir("stimulus", "envelope", "Envelope", li, !0, h`
            <ha-form
              .hass=${this.hass}
              .data=${hi(n, ci)}
              .schema=${mi(e, n, this.hass, ci)}
              .error=${i}
              .computeLabel=${Hr}
              .computeHelper=${Ur}
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(s, c)}
            <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
          `)}
        ${Ir("stimulus", "overrides", "Override preset", di, !1, ai.map((e) => this.renderOverride(e, n, o, i)), l === 0 ? g : h`<span class="badge">${l} overridden</span>`)}
      </ha-card>
    `;
	}
};
_([b({ attribute: !1 })], Vi.prototype, "hass", void 0), _([b({ attribute: !1 })], Vi.prototype, "config", void 0), _([b({ attribute: !1 })], Vi.prototype, "path", void 0), _([b({ attribute: !1 })], Vi.prototype, "errors", void 0), _([b({ attribute: !1 })], Vi.prototype, "live", void 0), Vi = _([S("al-stimulus-editor")], Vi);
//#endregion
//#region src/al-envelopes.ts
var Hi = {
	label: "Name",
	id: "ID",
	attack: "Attack",
	decay: "Decay",
	sustain: "Sustain",
	release: "Release",
	impulse: "Impulse"
}, Ui = {
	label: "What this preset is called in the panel. Blank shows the id instead.",
	id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
	attack: "Time to rise from zero to the stimulus gain.",
	decay: "Time to travel from the peak to the sustain level.",
	sustain: "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
	release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
	impulse: "Fire and forget: the trigger ends the moment it starts, leaving only the release."
}, Wi = [
	"label",
	"id",
	"attack",
	"decay",
	"sustain",
	"release",
	"impulse"
], Gi = [
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
		selector: Gr
	},
	{
		name: "decay",
		selector: Gr
	},
	{
		name: "sustain",
		selector: Kr
	},
	{
		name: "release",
		selector: Gr
	},
	{
		name: "impulse",
		selector: { boolean: {} }
	}
], Ki = [
	{
		name: "retrigger",
		label: Jr,
		kind: "select",
		selector: Qr,
		hint: Yr
	},
	{
		name: "stack",
		label: Xr,
		kind: "boolean",
		selector: Rr,
		hint: Zr
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: ri
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: Gr
	}
], qi = "text/plain", Ji = 36, Yi = (e) => e.stopPropagation(), Xi = class extends p {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => Hi[e.name] ?? e.name, this.computeHelper = (e) => Ui[e.name] ?? "";
	}
	static {
		this.styles = [v, T`
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
		!t || !n || t.defaults.envelope === n.id || this.emitChange(E(t, ["defaults", "envelope"], n.id), "defaults:envelope");
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
		e.dataTransfer?.setData(qi, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
	}
	onDragEnd() {
		this.dragging = null, this.dropAt = null;
	}
	slotFor(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || Ji;
		return e.clientY - n.top < r / 2 ? t : t + 1;
	}
	isOurs(e) {
		return this.dragging !== null && e.dataTransfer?.types.includes(qi) === !0;
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
		this.emitChange(je(e, ["envelopes"], t, re(rt(e, "preset")))), this.selected = t;
	}
	removePreset(e) {
		let t = this.config;
		if (!t) return;
		let n = t.envelopes[e];
		if (!n) return;
		let r = Me(t, n.id);
		if (r.defaults || r.groups.length > 0) {
			this.selected = e, this.blocked = {
				id: n.id,
				...r
			};
			return;
		}
		window.confirm(`Delete envelope preset "${n.id}"?`) && (this.blocked = null, this.emitChange(Re(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && --this.selected);
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config, n = this.selected, r = t?.envelopes[n];
		if (!t || !r) return;
		let i = e.detail?.value ?? {}, a = typeof i.label == "string" ? i.label : r.label ?? "", o = {
			...r,
			label: a.trim() === "" ? null : a,
			id: String(i.id ?? ""),
			attack: A(i.attack) ?? r.attack,
			decay: A(i.decay) ?? r.decay,
			sustain: typeof i.sustain == "number" ? i.sustain : r.sustain,
			release: A(i.release) ?? r.release,
			impulse: typeof i.impulse == "boolean" ? i.impulse : r.impulse
		}, s = Wi.find((e) => o[e] !== r[e]);
		if (s === void 0) return;
		let c = ["envelopes", n], l = E(at(t, n, o.id), c, o);
		this.emitChange(l, `${M(c)}:${s}`);
	}
	setOverride(e, t) {
		let n = this.config, r = this.selected;
		if (!n || !n.envelopes[r]) return;
		let i = [
			"envelopes",
			r,
			e
		];
		this.emitChange(E(n, i, t), M(i));
	}
	render() {
		let e = this.config;
		return e ? h`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(e)}</div>
        <div>${this.renderEditor(e)}</div>
      </div>
    ` : h`<ha-card><span class="muted">Loading…</span></ha-card>`;
	}
	renderList(e) {
		let t = this.blocked;
		return h`
      <ha-card>
        <h3>Presets</h3>
        ${e.envelopes.map((t, n) => this.renderPresetRow(e, t, n))}
        ${e.envelopes.length === 0 ? h`<p class="muted">No presets yet.</p>` : g}
        ${t ? h`<ha-alert alert-type="warning">${Qi(t)}</ha-alert>` : g}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderPresetRow(t, n, r) {
		let i = jn(this.errors, ["envelopes", r]), a = t.defaults.envelope === n.id, o = this.dragging === null || this.dropAt === null ? "" : this.dropClass(r), s = [
			"row",
			"preset",
			this.selected === r ? "selected" : "",
			this.dragging === r ? "dragging" : "",
			o
		].filter(Boolean).join(" ");
		return h`<div
      class=${s}
      data-index=${r}
      draggable="true"
      @dragstart=${(e) => this.onDragStart(e, r)}
      @dragend=${this.onDragEnd}
      @dragover=${(e) => this.onDragOver(e, r)}
      @drop=${(e) => this.onDrop(e, r)}
    >
      <ha-icon class="handle" icon="mdi:drag-horizontal-variant"></ha-icon>
      <button
        type="button"
        class="link grow names"
        title="Edit this preset"
        @click=${() => this.selectPreset(r)}
        @keydown=${(e) => this.onRowKeydown(e, r)}
      >
        <span class="name"
          >${n.id === "" && n.label === null ? "(unnamed preset)" : e(n)}</span
        >
        ${n.label !== null && n.label.trim() !== "" ? h`<span class="muted id">${n.id}</span>` : g}
      </button>
      ${i ? h`<span class="badge" title="${i} problem(s)">${i}</span>` : g}
      <label
        class="default"
        title=${a ? "This is the default preset" : "Set as default"}
      >
        <input
          type="checkbox"
          aria-label="Set as default"
          .checked=${a}
          .disabled=${a}
          draggable="false"
          @dragstart=${Yi}
          @click=${Yi}
          @change=${() => this.setDefault(r)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
        @dragstart=${Yi}
        @click=${() => this.removePreset(r)}
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
		if (!n) return h`<ha-card
        ><span class="muted">Select a preset.</span></ha-card
      >`;
		let r = ["envelopes", t], i = An(this.errors, r), a = this.errors.filter((e) => e.path === M(r)), o = {
			label: n.label ?? "",
			id: n.id,
			attack: k(n.attack),
			decay: k(n.decay),
			sustain: n.sustain,
			release: k(n.release),
			impulse: n.impulse
		}, s = Zi(e, t, n);
		return h`
      <ha-card header="Envelope preset">
        ${a.map((e) => h`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${s ? h`<ha-alert alert-type="warning">${s}</ha-alert>` : g}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${Gi}
          .error=${i}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${n}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Ki.map((t) => h`<al-override-field
              .hass=${this.hass}
              .label=${t.label}
              .hint=${t.hint ?? ""}
              .kind=${t.kind}
              .selector=${t.kind === "boolean" ? Rr : t.selector}
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
_([b({ attribute: !1 })], Xi.prototype, "hass", void 0), _([b({ attribute: !1 })], Xi.prototype, "config", void 0), _([b({ attribute: !1 })], Xi.prototype, "errors", void 0), _([b({ type: Boolean })], Xi.prototype, "narrow", void 0), _([m()], Xi.prototype, "selected", void 0), _([m()], Xi.prototype, "blocked", void 0), _([m()], Xi.prototype, "dragging", void 0), _([m()], Xi.prototype, "dropAt", void 0), Xi = _([S("al-envelopes")], Xi);
function Zi(e, t, n) {
	return n.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((e, r) => r !== t && e.id === n.id) ? `Another preset already uses the id "${n.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Qi(e) {
	let t = [];
	return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
//#endregion
//#region src/al-defaults.ts
var $i = {
	envelope: "Default envelope",
	max_value: "Max value",
	precision: "Precision",
	unavailable: "When unavailable",
	retrigger: Jr,
	stack: Xr,
	debounce: "Debounce",
	safety_refresh: "Safety refresh",
	min_wake_interval: "Minimum wake interval"
}, ea = {
	envelope: "Preset used when a stimulus names none.",
	max_value: "Limiter for groups that don't set their own.",
	precision: "Display decimals.",
	unavailable: "What an entity going unavailable does to its trigger.",
	retrigger: Yr,
	stack: Zr,
	debounce: "Minimum time between triggers per stimulus.",
	safety_refresh: "Periodic recompute as a self-heal.",
	min_wake_interval: "Floor for the scheduler's timer delay."
}, ta = [
	"envelope",
	"max_value",
	"precision",
	"unavailable",
	"retrigger",
	"stack",
	"debounce",
	"safety_refresh",
	"min_wake_interval"
], na = { duration: { enable_millisecond: !0 } }, ra = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, ia = { select: {
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
} }, aa = { boolean: {} }, oa = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, sa = class extends p {
	constructor(...e) {
		super(...e), this.errors = [], this.computeLabel = (e) => $i[e.name] ?? e.name, this.computeHelper = (e) => ea[e.name] ?? "";
	}
	static {
		this.styles = [v, T`
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
				selector: ra
			},
			{
				name: "precision",
				selector: ia
			},
			{
				name: "unavailable",
				selector: oa
			},
			{
				name: "retrigger",
				selector: Qr
			},
			{
				name: "stack",
				selector: aa
			},
			{
				name: "debounce",
				selector: na
			},
			{
				name: "safety_refresh",
				selector: na
			},
			{
				name: "min_wake_interval",
				selector: na
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
			debounce: A(r.debounce) ?? n.debounce,
			safety_refresh: A(r.safety_refresh) ?? n.safety_refresh,
			min_wake_interval: A(r.min_wake_interval) ?? n.min_wake_interval
		}, o = ta.find((e) => a[e] !== n[e]);
		o !== void 0 && this.emitChange(E(t, ["defaults"], a), `defaults:${o}`);
	}
	emitChange(e, t) {
		this.dispatchEvent(N(e, t));
	}
	render() {
		let e = this.config;
		if (!e) return h`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
		let t = e.defaults, n = An(this.errors, ["defaults"]), r = this.errors.filter((e) => e.path === "defaults"), i = {
			envelope: t.envelope,
			max_value: t.max_value,
			precision: String(t.precision),
			unavailable: t.unavailable,
			retrigger: t.retrigger,
			stack: t.stack,
			debounce: k(t.debounce),
			safety_refresh: k(t.safety_refresh),
			min_wake_interval: k(t.min_wake_interval)
		};
		return h`
      <div class="pad">
        <ha-card header="Defaults">
          ${r.map((e) => h`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
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
_([b({ attribute: !1 })], sa.prototype, "hass", void 0), _([b({ attribute: !1 })], sa.prototype, "config", void 0), _([b({ attribute: !1 })], sa.prototype, "errors", void 0), sa = _([S("al-defaults")], sa);
//#endregion
//#region src/fader.ts
var ca = .1, la = Math.log10(ca), ua = Math.log10(10) - la, da = (e) => Math.min(10, Math.max(ca, e)), fa = (e) => Math.round(e * 100) / 100, pa = (e) => fa(da(e));
function ma(e) {
	return (Math.log10(da(e)) - la) / ua;
}
function ha(e) {
	return fa(da(10 ** (la + Math.min(1, Math.max(0, e)) * ua)));
}
function ga(e, t, n = !1) {
	let r = n ? 1.05 : 1.25;
	return fa(da(t === 1 ? e * r : e / r));
}
function _a(e) {
	let t = e.toFixed(2).replace(/0+$/, "");
	return t.endsWith(".") && (t += "0"), t;
}
var va = {
	min: ca,
	max: 10,
	toPosition: ma,
	fromPosition: ha,
	clamp: pa,
	step: (e, t, n = !1) => ga(e, t, n),
	page: (e, t) => pa(t === 1 ? e * 2 : e / 2),
	format: _a,
	reset: 1
}, ya = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function ba(e, t) {
	let r = e > 0 ? e : 1, i = ya(t), a = 10 ** -i, o = (e) => Number(Math.min(r, Math.max(0, e)).toFixed(i)), s = Math.max(a, Number((r / 10).toFixed(i)));
	return {
		min: 0,
		max: r,
		toPosition: (e) => Math.min(1, Math.max(0, e / r)),
		fromPosition: (e) => o(Math.min(1, Math.max(0, e)) * r),
		clamp: o,
		step: (e, t, n = !1) => o(e + t * (n ? a : s)),
		page: (e, t) => o(e + t * r / 4),
		format: (e) => n(o(e), i),
		reset: null
	};
}
//#endregion
//#region src/al-fader.ts
var xa = 12, Sa = (e) => `${Math.round(e * 1e3) / 10}%`, I = class extends p {
	constructor(...e) {
		super(...e), this.value = 1, this.disabled = !1, this.focusable = !0, this.readOnly = !1, this.label = "Gain", this.showValue = !0, this.unavailable = !1, this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1;
	}
	static {
		this.styles = T`
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
      height: ${xa}px;
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
		return this.mode === "level" ? ba(this.max, this.precision) : va;
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
		let e = this.scale, t = e.clamp(this.current), n = e.toPosition(t), r = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), i = h`
      ${this.mode === "gain" ? h`<div class="unity"></div>` : g}
      <div class="fill" style="height: ${Sa(n)}"></div>
      ${r === null ? g : h`<div class="tick" style="bottom: ${Sa(e.toPosition(r))}" title=${e.format(r)}></div>`}
    `;
		return this.readOnly ? h`
        <div
          class="fader"
          role="meter"
          aria-label=${this.label}
          aria-valuemin=${e.min}
          aria-valuemax=${e.max}
          aria-valuenow=${this.unavailable ? g : t}
          aria-valuetext=${this.unavailable ? "Value unavailable" : e.format(t)}
        >
          <div class="track">${this.unavailable ? g : i}</div>
          ${this.showValue ? h`<div class="value">${e.format(t)}</div>` : g}
        </div>
      ` : h`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled || !this.focusable ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${e.min}
        aria-valuemax=${e.max}
        aria-valuenow=${this.unavailable ? g : t}
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
          <div class="knob" style="bottom: calc(${Sa(n)} - ${Math.round((n - .5) * xa * 10) / 10}px - ${xa / 2}px)"></div>
        </div>
        ${this.showValue ? h`<div class="value">${e.format(t)}</div>` : g}
      </div>
    `;
	}
};
_([b({ type: Number })], I.prototype, "value", void 0), _([b({
	type: Boolean,
	reflect: !0
})], I.prototype, "disabled", void 0), _([b({ type: Boolean })], I.prototype, "focusable", void 0), _([b({
	type: Boolean,
	reflect: !0,
	attribute: "readonly"
})], I.prototype, "readOnly", void 0), _([b({ type: String })], I.prototype, "label", void 0), _([b({ type: Boolean })], I.prototype, "showValue", void 0), _([b({ type: Boolean })], I.prototype, "unavailable", void 0), _([b({ type: String })], I.prototype, "mode", void 0), _([b({ type: Number })], I.prototype, "max", void 0), _([b({ type: Number })], I.prototype, "precision", void 0), _([b({ type: Number })], I.prototype, "tick", void 0), _([m()], I.prototype, "dragValue", void 0), I = _([S("al-fader")], I);
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive.js
var Ca = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, wa = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Ta = class {
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
}, Ea = wa(class extends Ta {
	constructor(e) {
		if (super(e), e.type !== Ca.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
		return tt;
	}
}), Da = (e) => `${Math.round(e * 1e3) / 10}%`, Oa = class extends p {
	constructor(...e) {
		super(...e), this.value = 0, this.max = 1, this.gated = !1;
	}
	static {
		this.styles = T`
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
		return h`
      <div class="meter">
        <div class=${Ea({
			fill: !0,
			hot: e > .9
		})} style="width: ${Da(e)}"></div>
      </div>
      <div class=${Ea({
			dot: !0,
			gated: this.gated
		})}></div>
    `;
	}
};
_([b({ type: Number })], Oa.prototype, "value", void 0), _([b({ type: Number })], Oa.prototype, "max", void 0), _([b({ type: Boolean })], Oa.prototype, "gated", void 0), Oa = _([S("al-meter")], Oa);
var L = class extends p {
	constructor(...e) {
		super(...e), this.label = "", this.editable = !1, this.value = 0, this.realValue = 0, this.maxValue = 5, this.precision = 1, this.liveNow = 0, this.muted = !1, this.selected = !1, this.errors = 0, this.pending = null, this.dragging = !1;
	}
	static {
		this.styles = T`
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
		this.dispatchEvent(Fn());
	}
	clearStepTimer() {
		this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
	}
	sendOverride(e) {
		this.clearStepTimer(), this.dispatchEvent(In(e));
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
			this.stepTimer = void 0, this.dispatchEvent(In(t));
		}, 250);
	}
	onMute() {
		this.editable && this.dispatchEvent(Ln(!this.muted));
	}
	onReset() {
		this.editable && this.dispatchEvent(Rn());
	}
	render() {
		let e = this.pending ?? this.value;
		return h`
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
        <div class="readout" title=${e === null ? "No data at this time" : g}>${e === null ? "" : n(e, this.precision)}</div>
        ${this.editable ? h`<div class="buttons">
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
            </div>` : g}
        <div class="foot">
          ${this.errors > 0 ? h`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : g}
        </div>
      </div>
    `;
	}
};
_([b({ type: String })], L.prototype, "label", void 0), _([b({
	type: Boolean,
	reflect: !0
})], L.prototype, "editable", void 0), _([b({ attribute: !1 })], L.prototype, "value", void 0), _([b({ attribute: !1 })], L.prototype, "realValue", void 0), _([b({ type: Number })], L.prototype, "maxValue", void 0), _([b({ type: Number })], L.prototype, "precision", void 0), _([b({ type: Number })], L.prototype, "liveNow", void 0), _([b({
	type: Boolean,
	reflect: !0
})], L.prototype, "muted", void 0), _([b({
	type: Boolean,
	reflect: !0
})], L.prototype, "selected", void 0), _([b({ type: Number })], L.prototype, "errors", void 0), _([m()], L.prototype, "pending", void 0), L = _([S("al-strip")], L);
//#endregion
//#region src/al-mixer.ts
var ka = 8e3, Aa = (e) => e instanceof Error ? e.message : String(e), R = class extends p {
	constructor(...e) {
		super(...e), this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.live = null, this.narrow = !1, this.preview = null, this.editing = Ut(), this.commandError = null, this.pendingFocus = !1;
	}
	static {
		this.styles = [v, T`
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
		return this.config ? Ft(this.config, this.nav) : [];
	}
	get selected() {
		let { config: e, nav: t } = this;
		if (!e || t.selection === null) return null;
		let n = ee(t.selection), r = x(e, n);
		return r === void 0 ? null : {
			path: n,
			group: r
		};
	}
	get selectedId() {
		return this.selected?.group.id ?? null;
	}
	isSelected(e) {
		return this.nav.selection !== null && M(this.nav.selection) === M(e);
	}
	navigate(e) {
		this.pendingFocus = !0, this.dispatchEvent(zn(e));
	}
	clearErrorTimer() {
		this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
	}
	fail(e) {
		this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
			this.errorTimer = void 0, this.commandError = null;
		}, ka);
	}
	async command(e, t, n) {
		let r = this.hass;
		if (!(!r || this.preview)) try {
			await t(r), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(Bn());
		} catch (t) {
			n?.settle(null), this.fail(`Could not ${e}: ${Aa(t)}`);
		}
	}
	trackOf(e) {
		let t = e.target?.dataset?.index;
		return t === void 0 ? null : this.tracks[Number(t)] ?? null;
	}
	onStripSelect(e) {
		let t = this.trackOf(e);
		t && this.dispatchEvent(zn({
			type: "select",
			path: t.path
		}));
	}
	onLevelOverride(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let n = e.target, { value: r } = e.detail;
		this.command(`set the level of ${t.id}`, async (e) => n.settle(await _t(e, t.id, r)), n);
	}
	onMuteToggle(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let { muted: n } = e.detail;
		this.command(`${n ? "mute" : "unmute"} ${t.id}`, (e) => r(e, t.id, n));
	}
	onReset(e) {
		let t = this.trackOf(e);
		!t || this.preview || this.command(`reset ${t.id}`, (e) => oe(e, t.id));
	}
	onEditToggle(e) {
		this.preview || (this.editing = e.target.checked === !0, Wt(this.editing));
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
				let t = this.nav.selection, n = t === null ? void 0 : this.tracks.find((e) => M(e.path) === M(t));
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
		let i = x(e, t.path);
		if (!i) return h``;
		let a = this.live?.groups[i.id], o = this.isSelected(t.path);
		return h`
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
        .precision=${a?.precision ?? gt(e, i)}
        .muted=${this.preview ? !1 : a?.muted ?? !1}
        .selected=${o}
        .errors=${jn(this.errors, t.path)}
      ></al-strip>
    `;
	}
	renderBand(e, t) {
		let r = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${e.depth + 1};`, i = e.id === this.selectedId ? 0 : -1, a = this.live?.groups[e.id], o = this.preview ? this.preview.values[e.id] : a?.value, s = a?.precision ?? (t && this.config ? gt(this.config, t) : 1), c = e.expanded ? "Collapse" : "Expand";
		return h`
      <div class="band" role="group" aria-label=${e.label} style=${r}>
        <button
          class="caret"
          type="button"
          data-band=${e.id}
          tabindex=${i}
          aria-expanded=${e.expanded ? "true" : "false"}
          aria-label=${`${c} ${e.label}`}
          title=${`${c} ${e.label}`}
          @click=${this.onBandToggle}
          @keydown=${this.onBandKey}
        >${e.expanded ? "▾" : "▸"}</button>
        <span class="label" title=${e.label}>${e.label}</span>
        <span class="band-value">${o == null ? "" : n(o, s)}</span>
      </div>
    `;
	}
	render() {
		let e = this.config;
		if (!e || e.groups.length === 0) return h`<div class="empty muted">Nothing to mix: add a group first.</div>`;
		let t = It(e, this.nav), n = this.tracks, r = new Map(n.map((t) => [t.id, x(e, t.path)])), i = t.kinds.map(() => "var(--al-strip-w)").join(" "), a = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
		return h`
      ${this.commandError === null ? g : h`<ha-alert
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
        ${this.selected ? h`<button class="open-group" type="button"
          @click=${() => this.dispatchEvent(new CustomEvent("al-open-group", {
			detail: this.selected.path,
			bubbles: !0,
			composed: !0
		}))}>Group settings</button>` : g}
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
_([b({ attribute: !1 })], R.prototype, "hass", void 0), _([b({ attribute: !1 })], R.prototype, "config", void 0), _([b({ attribute: !1 })], R.prototype, "nav", void 0), _([b({ attribute: !1 })], R.prototype, "errors", void 0), _([b({ attribute: !1 })], R.prototype, "live", void 0), _([b({
	type: Boolean,
	reflect: !0
})], R.prototype, "narrow", void 0), _([b({ attribute: !1 })], R.prototype, "preview", void 0), _([m()], R.prototype, "editing", void 0), _([m()], R.prototype, "commandError", void 0), R = _([S("al-mixer")], R);
//#endregion
//#region src/al-timeline.ts
var ja = 32, Ma = 28, Na = 4, Pa = 8, Fa = 800, Ia = 220, La = 160, Ra = 2e3, za = 6e4, Ba = 1e4, Va = 6e4, Ha = 32, Ua = [
	"24h",
	"7d",
	"30d"
], Wa = [
	"off",
	"24h",
	"7d"
], Ga = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], Ka = (e) => `hsl(${e * 67 % 360} 55% 62%)`, qa = /* @__PURE__ */ new Map(), Ja = /* @__PURE__ */ new Map();
function Ya(e, t) {
	let n = Date.now();
	for (let [e, t] of qa) n - t.at >= Va && qa.delete(e);
	qa.delete(e), qa.set(e, {
		at: n,
		data: t
	});
	for (let e of qa.keys()) {
		if (qa.size <= Ha) break;
		qa.delete(e);
	}
}
var Xa = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", Za = (e, t) => {
	let n = /* @__PURE__ */ new Date(e * 1e3);
	return t < 86400 ? n.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	}) : n.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}, Qa = (e) => String(Math.round(e * 100) / 100), $a = (e, t, n) => Math.min(n, Math.max(t, e));
function eo(e, t, n, r) {
	let i = Math.max(1, r.width - ja), a = Math.max(1, r.height - Ma), o = n.start, s = Math.max(n.until, n.end), c = Yt(o, s, i), l = Xt(r.maxValue, a), u = Object.keys(e.series), d = u.includes(t) ? t : u[0] ?? t, f = (t, n) => {
		let r = Zt(e.series[t] ?? [], Ra);
		return {
			id: t,
			points: r,
			d: Qt(r, c, l),
			color: n
		};
	}, p = f(d, "var(--primary-color)"), ee = r.showChannels ? u.filter((e) => e !== d).map((e, t) => f(e, Ka(t))) : [], m = e.forecast, te = m ? Xa($t(m, c, l, Ra)) : "", ne = m ? Qt(Zt(en(m, "p50"), Ra), c, l) : "", re = [];
	for (let [, , t] of e.day_types) re.includes(t) || re.push(t);
	let h = (e) => Ga[re.indexOf(e) % Ga.length], ie = nn(e.day_types.map(([e, t, n]) => [
		e,
		t,
		n
	]), c, s).map((e) => ({
		...e,
		fill: h(e.tag)
	})), g = nn(Object.entries(e.lights).flatMap(([e, t]) => t.map(([t, n]) => [
		t,
		n,
		e
	])), c, s), ae = nn(e.plan, c, s);
	return {
		busId: d,
		bus: p,
		children: ee,
		band: te,
		p50: ne,
		dayTypes: ie,
		legend: re.map((e) => ({
			tag: e,
			fill: h(e)
		})),
		lights: g,
		plan: ae,
		x: c,
		y: l,
		t0: o,
		t1: s,
		plotW: i,
		plotH: a
	};
}
var z = class extends p {
	constructor(...e) {
		super(...e), this.groupId = null, this.heading = "", this.labels = {}, this.precisions = {}, this.cursorTime = null, this.viewport = null, this.pinnedTime = null, this.dragging = !1, this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = 14, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = Fa, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
	}
	static {
		this.styles = [v, T`
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
		return this.narrow ? La : Ia;
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
		}, za), this.load();
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
		}, Ba)));
	}
	willUpdate(e) {
		let t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), n = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
		(t || n) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
	}
	query(e) {
		let t = Math.floor(Date.now() / 1e3 / 60) * 60, n = Jt(t, this.range, this.horizon);
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
		let t = this.hass, n = this.groupId;
		if (!t || n === null) return;
		let r = this.query(n), i = an(r), a = e ? void 0 : qa.get(i);
		if (a && Date.now() - a.at < Va) {
			this.seq++, this.loaded = {
				q: r,
				data: a.data
			}, this.error = null, Ya(i, a.data);
			return;
		}
		let o = e ? void 0 : Ja.get(i);
		if (!o) {
			let e = se(t, r);
			o = e, Ja.set(i, e), e.then((e) => Ya(i, e), () => void 0).finally(() => {
				Ja.get(i) === e && Ja.delete(i);
			});
		}
		let s = ++this.seq;
		try {
			let e = await o;
			if (s !== this.seq) return;
			this.loaded = {
				q: r,
				data: e
			}, this.error = null;
		} catch (e) {
			if (s !== this.seq) return;
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
		let r = eo(e.data, e.q.group_id, this.viewport ? {
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
		return !r || e.bus.id !== t ? "" : Qt(tn(e.bus.points, n.now, r.value, e.t0, e.t1), e.x, e.y);
	}
	emitSettings() {
		this.dispatchEvent(Vn({
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
		let n = e.currentTarget.getBoundingClientRect(), r = n.width > 0 ? this.width / n.width : 1, i = $a(((e.clientX - n.left) * r - ja) / t.plotW, 0, 1);
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
		this.cursorIndex = e === null || !t.length ? null : rn(t, e), this.emitTransport();
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
		this.clearViewportTimer(), this.seq++, this.viewport = on(e, Date.now() / 1e3), this.emitTransport(), t ? this.load() : this.viewportTimer = setTimeout(() => {
			this.viewportTimer = void 0, this.load();
		}, 100);
	}
	zoom(e, t) {
		let n = this.paths;
		n && this.changeWindow(sn({
			start: n.t0,
			end: n.t1
		}, t ?? this.cursorTime ?? (n.t0 + n.t1) / 2, e, Date.now() / 1e3));
	}
	onWheel(e) {
		let t = this.paths;
		if (t) {
			if (e.ctrlKey || e.metaKey) e.preventDefault(), this.zoom(Math.exp($a(e.deltaY, -100, 100) * .01), this.timeAt(e, t));
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
		this.cursorIndex = this.cursorIndex === null ? r > 0 ? 0 : n : $a(this.cursorIndex + r, 0, n), this.pinnedTime = t.bus.points[this.cursorIndex][0], this.selectTime(this.pinnedTime);
	}
	renderChips() {
		let e = this.learningHint;
		return h`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${Ua.map((e) => h`
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
          ${Wa.map((t) => {
			let n = t !== "off" && !this.forecastReady;
			return h`
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
        ${e ? h`<span class="muted hint" title=${e}>${e}</span>` : g}
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
		let t = this.width, n = this.height, r = e.x(this.nowAt()), i = this.tailPath(e), a = e.plotH + Na, o = this.cursorTime === null ? null : e.x(this.cursorTime), s = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
		return h`
      <svg
        class="chart"
        viewBox="0 0 ${t} ${n}"
        role="img"
        tabindex="0"
        aria-label=${s}
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
		].map((n) => C`
            <line class="grid" x1=${ja} y1=${e.y(this.maxValue * n)} x2=${t} y2=${e.y(this.maxValue * n)}></line>
            <text class="ytick" x=${28} y=${e.y(this.maxValue * n) + 3} text-anchor="end">
              ${Qa(this.maxValue * n)}
            </text>
          `)}
        <g transform="translate(${ja},0)">
          ${e.dayTypes.map((t) => C`<rect
              class="daytype"
              x=${t.x0}
              y="0"
              width=${Math.max(0, t.x1 - t.x0)}
              height=${e.plotH}
              fill=${t.fill}
            ></rect>`)}
          ${this.forecastReady && e.band ? C`<polygon class="band" points=${e.band}></polygon>` : g}
          ${this.forecastReady && e.p50 ? C`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : g}
          ${e.children.map((e) => C`<path class="child" d=${e.d} stroke=${e.color}></path>`)}
          ${e.bus.d ? C`<path class="bus" d=${e.bus.d}></path>` : g}
          ${i ? C`<path class="tail" d=${i}></path>` : g}
          ${this.showLights ? e.lights.map((e) => C`<rect
                  class="light"
                  x=${e.x0}
                  y=${a}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${Pa}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`) : g}
          ${this.showLights ? e.plan.map((e) => C`<rect
                  class="plan"
                  x=${e.x0}
                  y=${a}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${Pa}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`) : g}
          ${r >= 0 && r <= e.plotW ? C`<line class="now" x1=${r} y1="0" x2=${r} y2=${e.plotH}></line>
          <text class="now-label" x=${r + 3} y="10">now</text>` : g}
          ${o === null ? g : C`<line class="cursor" x1=${o} y1="0" x2=${o} y2=${e.plotH}></line>`}
          ${this.renderXLabels(e)}
        </g>
      </svg>
    `;
	}
	renderXLabels(e) {
		let t = this.height - 6;
		return [
			[0, "start"],
			[.5, "middle"],
			[1, "end"]
		].map(([n, r]) => C`<text class="xlabel" x=${n * e.plotW} y=${t} text-anchor=${r}>
        ${Za(e.t0 + n * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`);
	}
	renderTooltip(e) {
		let t = this.cursorTime;
		if (t === null || t < e.t0 || t > e.t1) return g;
		let r = this.forecastReady ? this.loaded?.data.forecast : null, i = this.loaded?.q.resolution === "5m" ? 600 : 7200, a = t > this.nowAt() ? r ? cn(en(r, "p50"), t) : null : cn(e.bus.points, t, i), o = (ja + e.x(t)) / this.width * 100, s = this.loaded?.data.day_types.find(([e, n]) => t >= e && t < n)?.[2], c = (e, t) => {
			if (t === null) return null;
			let r = n(t, this.precisions[e] ?? this.live?.groups[e]?.precision ?? 1);
			return Number(r) === 0 ? null : r;
		}, l = c(e.busId, a), u = e.children.flatMap((e) => {
			let n = c(e.id, cn(e.points, t, i));
			return n === null ? [] : [{
				...e,
				formatted: n
			}];
		});
		return h`
      <div class="tooltip ${o > 60 ? "flip" : ""}" style="left: ${o}%">
        <div class="tt-time">${(/* @__PURE__ */ new Date(t * 1e3)).toLocaleString()}</div>
        ${l === null ? g : h`<div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${l}</span>
        </div>`}
        ${u.slice(0, 5).map((e) => h`
          <div class="tt-row">
            <span class="tt-swatch" style="background: ${e.color}"></span>
            <span class="tt-name">${this.labels[e.id] ?? e.id.replaceAll("_", " ")}</span>
            <span class="tt-value">${e.formatted}</span>
          </div>
        `)}
        ${u.length > 5 ? h`<div class="muted">+${u.length - 5} channels</div>` : g}
        ${s ? h`<div class="tt-daytype muted">${s}</div>` : g}
      </div>
    `;
	}
	render() {
		if (this.groupId === null) return h`<div class="placeholder muted">Select a strip to see its timeline.</div>`;
		let e = this.paths;
		return h`
      ${this.renderChips()}
      ${e ? this.renderChart(e) : h`<div class="placeholder muted">Loading…</div>`}
      <div class="transport toolbar" role="group" aria-label="Timeline transport">
        <button class="chip" aria-label="Zoom out" @click=${() => this.zoom(2)}>−</button>
        <button class="chip" aria-label="Zoom in" @click=${() => this.zoom(.5)}>+</button>
        ${[
			-7,
			-3,
			-1
		].map((e) => h`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>${e}d</button>`)}
        <button class="chip transport-now" @click=${this.resetTransport}>Now</button>
        ${[
			1,
			3,
			7
		].map((e) => h`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>+${e}d</button>`)}
        <span class="muted transport-status">${this.cursorTime === null ? "Live" : `${this.cursorTime > this.nowAt() ? "Forecast" : "History"} · ${(/* @__PURE__ */ new Date(this.cursorTime * 1e3)).toLocaleString()}`}</span>
      </div>
      ${e && e.legend.length > 0 ? h`
            <div class="legend">
              ${e.legend.map((e) => h`
                  <span class="legend-item">
                    <span class="swatch" style="background: ${e.fill}"></span>${e.tag}
                  </span>
                `)}
            </div>
          ` : g}
      ${this.error ? h`<div class="error">Timeline: ${this.error}</div>` : g}
      ${e ? this.renderTooltip(e) : g}
    `;
	}
};
_([b({ attribute: !1 })], z.prototype, "hass", void 0), _([b({ attribute: !1 })], z.prototype, "groupId", void 0), _([b({ attribute: !1 })], z.prototype, "heading", void 0), _([b({ attribute: !1 })], z.prototype, "labels", void 0), _([b({ attribute: !1 })], z.prototype, "precisions", void 0), _([m()], z.prototype, "cursorTime", void 0), _([m()], z.prototype, "viewport", void 0), _([b({ attribute: !1 })], z.prototype, "range", void 0), _([b({ attribute: !1 })], z.prototype, "horizon", void 0), _([b({ type: Boolean })], z.prototype, "showChannels", void 0), _([b({ type: Boolean })], z.prototype, "showLights", void 0), _([b({ attribute: !1 })], z.prototype, "live", void 0), _([b({ type: Number })], z.prototype, "maxValue", void 0), _([b({ attribute: !1 })], z.prototype, "profileState", void 0), _([b({ type: Number })], z.prototype, "minDays", void 0), _([b({
	type: Boolean,
	reflect: !0
})], z.prototype, "narrow", void 0), _([b({ type: Boolean })], z.prototype, "paused", void 0), _([m()], z.prototype, "cursorIndex", void 0), _([m()], z.prototype, "width", void 0), _([m()], z.prototype, "loaded", void 0), _([m()], z.prototype, "error", void 0), z = _([S("al-timeline")], z);
//#endregion
//#region src/al-strip-controls.ts
var to = [
	"name",
	"mix",
	"null_handling",
	"gain"
], no = 5, ro = (e) => e[e.length - 2] === "stimuli", B = class extends p {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.statusOnly = !1, this.simLog = null;
	}
	static {
		this.styles = [v, T`
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
		!n || !r || this.emitChange(E(n, [...r, e], t), `${M(r)}:${e}`);
	}
	onBusForm(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = x(t, n);
		if (!r) return;
		let i = Er(r, e.detail?.value ?? {}), a = Dr(i, r);
		a !== void 0 && this.emitChange(E(t, n, i), `${M(n)}:${a}`);
	}
	onSim(e, t) {
		this.dispatchEvent(Hn(e, t.target.checked === !0));
	}
	onRebuild() {
		this.dispatchEvent(Un());
	}
	renderChannel(e, t) {
		return h`<al-stimulus-editor
      .hass=${this.hass}
      .config=${e}
      .path=${t}
      .errors=${this.errors}
      .live=${this.live}
    ></al-stimulus-editor>`;
	}
	renderBus(e, t) {
		let n = x(e, t);
		if (!n) return h`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		if (this.statusOnly) return h`<ha-card>${this.renderStatus(e, n)}</ha-card>`;
		let r = t.length === 2, i = this.errors.filter((e) => e.path === M(t)), a = An(this.errors, t);
		return h`
      <ha-card header=${n.name ?? n.id}>
        ${i.map((e) => h`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${Tr(n, r, to, e)}
              .schema=${wr(n, r, to, e)}
              .error=${a}
              .computeLabel=${dr}
              .computeHelper=${fr}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${yr}
              .value=${n.max_value}
              .inherited=${e.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${a.max_value}
              @value-changed=${(e) => this.setField("max_value", e.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              .label=${lr.precision}
              kind="select"
              .selector=${br}
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
		let r = w(e).enabled && nt(e).has(t.id);
		return h`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${r ? this.renderPresence(e, t, n) : g}
        ${t.stimuli.length === 0 && !r ? h`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((t, r) => this.renderStimulus(e, [
			...n,
			"stimuli",
			r
		], t))}
      </div>
    `;
	}
	renderPresence(e, t, n) {
		let r = this.live?.voices[t.id]?.find((e) => e.label === de);
		return h`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${r ? h`<span class="chip phase ${r.phase}">${r.phase}</span>` : g}
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
		let r = this.hass?.states[n.entity], i = r?.attributes.friendly_name ?? (n.entity || "(no entity)"), a = jn(this.errors, t);
		return h`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          ${r ? h`<ha-state-icon .hass=${this.hass} .stateObj=${r}></ha-state-icon>` : h`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${n.key ?? i}</span>
          ${a ? h`<span class="badge" title="${a} problem(s)">${a}</span>` : g}
          ${r ? h`<span class="muted chip">${On(this.hass, n.entity)}</span>` : g}
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
		let n = t.id, r = this.live?.groups[n]?.precision ?? gt(e, t), i = this.live?.groups[n]?.lights ?? 0, a = this.hass?.states[yt(n)], o = this.simLog?.blocked[n] ?? null, s = (this.simLog?.entries ?? []).filter((e) => e.group_id === n).sort((e, t) => t.t - e.t).slice(0, no);
		return h`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${i} light${i === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${i > 0 ? h`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${a?.state === "on"}
                .disabled=${a === void 0}
                title=${a === void 0 ? "No simulation switch for this group" : "Presence simulation"}
                @change=${(e) => this.onSim(n, e)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : g}
        ${o === null ? g : h`<div class="muted blocked">Blocked: ${o}</div>`}
        ${this.renderSensor("expected", "Expected", bt(n), r)}
        ${this.renderSensor("anomaly", "Anomaly", xt(n), r)}
        <div class="muted readiness">${this.readiness(e, n)}</div>
        ${s.length > 0 ? h`<ol class="log">
              ${s.map((e) => this.renderLogEntry(e))}
            </ol>` : h`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
	}
	renderSensor(e, t, r, i) {
		let a = this.hass?.states[r], o = a?.attributes.day_type, s = a?.state, c = s === void 0 ? NaN : Number(s), l = s === void 0 ? "—" : s.trim() !== "" && Number.isFinite(c) ? n(c, i) : s;
		return h`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${l}</span>
      ${typeof o == "string" ? h`<span class="muted">${o}</span>` : g}
    </div>`;
	}
	renderLogEntry(e) {
		return h`<li>
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
		return !e || !t || t.length === 0 ? h`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : ro(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
	}
};
_([b({ attribute: !1 })], B.prototype, "hass", void 0), _([b({ attribute: !1 })], B.prototype, "config", void 0), _([b({ attribute: !1 })], B.prototype, "path", void 0), _([b({ attribute: !1 })], B.prototype, "errors", void 0), _([b({ attribute: !1 })], B.prototype, "live", void 0), _([b({ attribute: !1 })], B.prototype, "profileState", void 0), _([b({ type: Boolean })], B.prototype, "statusOnly", void 0), _([b({ attribute: !1 })], B.prototype, "simLog", void 0), B = _([S("al-strip-controls")], B);
//#endregion
//#region src/al-patterns.ts
var io = 50;
function ao(e) {
	let t = [], n = (r) => {
		t.push({
			id: r.id,
			label: r.name ?? r.id,
			precision: e ? gt(e, r) : 0
		}), r.children.forEach(n);
	};
	return e?.groups.forEach(n), t;
}
function oo(e, t) {
	if (e === void 0) return "—";
	let r = Number(e);
	return e.trim() !== "" && Number.isFinite(r) ? n(r, t) : e;
}
var so = (e) => (/* @__PURE__ */ new Date(e * 1e3)).toLocaleDateString(), co = class extends p {
	constructor(...e) {
		super(...e), this.profileState = null, this.simLog = null, this.force = !1;
	}
	static {
		this.styles = [v, T`
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
		this.dispatchEvent(Un(this.force));
	}
	renderStatus() {
		let e = this.profileState;
		if (!e) return h`<div class="status muted">Profile not loaded yet.</div>`;
		let { producer: t, generated_at: n, training_window: r, day_types: i, slot_minutes: a } = e.profile;
		return h`
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
          <span class="window">${so(r[0])} – ${so(r[1])}</span>
        </div>
        <div class="muted">${i.join(", ")} · ${a}-minute slots</div>
      </div>
    `;
	}
	renderReadiness() {
		let e = this.profileState, t = ao(this.config);
		if (!e || t.length === 0) return h`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
		let n = this.config?.defaults.patterns?.min_days ?? 14;
		return h`
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
		let r = t.ready[e.id] === !0, i = t.profile.groups[e.id]?.days ?? 0, a = this.hass?.states[bt(e.id)]?.state;
		return h`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${r ? "yes" : "no"}" title=${r ? "Ready" : `Needs ${n} days`}>
        ${r ? "✓" : "✗"}
      </td>
      <td class="days">${i}</td>
      <td class="expected">${oo(a, e.precision)}</td>
    </tr>`;
	}
	renderBlocked() {
		let e = Object.entries(this.simLog?.blocked ?? {}).filter((e) => typeof e[1] == "string");
		if (e.length === 0) return g;
		let t = ao(this.config), n = (e) => t.find((t) => t.id === e)?.label ?? e;
		return h`<ul class="blocked">
      ${e.map(([e, t]) => h`<li><span class="group">${n(e)}:</span> <span>${t}</span></li>`)}
    </ul>`;
	}
	renderLog() {
		let e = [...this.simLog?.entries ?? []].sort((e, t) => t.t - e.t).slice(0, io);
		return e.length === 0 ? h`<div class="muted log-empty">No simulated light changes yet.</div>` : h`<ol class="log">
      ${e.map((e) => this.renderEntry(e))}
    </ol>`;
	}
	renderEntry(e) {
		return h`<li>
      <span class="muted">${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
      ${e.brightness === null ? g : h`<span class="muted">${e.brightness}</span>`}
    </li>`;
	}
	render() {
		return h`
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
_([b({ attribute: !1 })], co.prototype, "hass", void 0), _([b({ attribute: !1 })], co.prototype, "config", void 0), _([b({ attribute: !1 })], co.prototype, "profileState", void 0), _([b({ attribute: !1 })], co.prototype, "simLog", void 0), _([m()], co.prototype, "force", void 0), co = _([S("al-patterns")], co);
//#endregion
//#region src/types.ts
var lo = [
	"phone",
	"watch",
	"tag",
	"laptop",
	"other"
], uo = [
	"activity",
	"steps",
	"battery_state"
], fo = {
	phone: "mdi:cellphone",
	watch: "mdi:watch",
	tag: "mdi:tag",
	laptop: "mdi:laptop",
	other: "mdi:bluetooth"
}, po = {
	phone: "Phone",
	watch: "Watch",
	tag: "Tag",
	laptop: "Laptop",
	other: "Other"
}, mo = {
	activity: "Activity",
	steps: "Steps",
	battery_state: "Battery state"
}, ho = { entity: { filter: {
	domain: "device_tracker",
	integration: "bermuda"
} } }, go = { entity: { filter: { domain: "person" } } }, _o = { entity: { filter: {
	domain: "device_tracker",
	integration: "mobile_app"
} } }, vo = { entity: { filter: { domain: "sensor" } } }, yo = { select: {
	mode: "dropdown",
	options: lo.map((e) => ({
		value: e,
		label: po[e]
	}))
} }, bo = class extends p {
	constructor(...e) {
		super(...e), this.errors = [], this.presence = null;
	}
	static {
		this.styles = [
			v,
			Ve,
			T`
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
		let i = {
			...w(r),
			people: e
		}, a = E(r, ["presence"], i);
		this.dispatchEvent(n ? N(a, void 0, !0) : N(a, `presence:people:${t}`));
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
		t && this.editPerson(e, { devices: [...t.devices, f("")] }, "add-device");
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
		let o = Object.values(this.presence?.people ?? {}).flatMap((e) => Object.values(e.devices ?? {})).find((e) => e.tracker === n.tracker)?.signals[r], s = i === null ? g : i[r] ? h`<ha-icon class="found" icon="mdi:check-circle-outline" title="Found"></ha-icon>` : n.signals[r] || o ? h`<ha-icon class="missing" icon="mdi:alert-circle-outline" title="Configured but unavailable"></ha-icon>` : h`<span class="muted" title="Optional: no sensor configured or discovered">Optional</span>`;
		return h`<div class="signal signal-${r}">
      <ha-selector
        .hass=${this.hass}
        .selector=${vo}
        .label=${mo[r]}
        .helper=${n.companion ? "Blank: found on the companion device when available." : "Optional. Movement can also be detected from Bluetooth."}
        .required=${!1}
        .value=${this.text(n.signals[r])}
        @value-changed=${(i) => this.editDevice(e, t, { signals: {
			...n.signals,
			[r]: i.detail.value ? i.detail.value : null
		} }, r)}
      ></ha-selector>
      ${s}
      ${a[r] ? h`<div class="error">${a[r]}</div>` : g}
    </div>`;
	}
	renderDevice(e, t, n, r) {
		let i = An(this.errors, [
			"presence",
			"people",
			e,
			"devices",
			t
		]), a = An(this.errors, [
			"presence",
			"people",
			e,
			"devices",
			t,
			"signals"
		]), o = this.found(n, r), s = Object.values(this.presence?.people?.[n.name ?? ""]?.devices ?? {}).find((e) => e.tracker === r.tracker), c = r.name ?? s?.name ?? (r.tracker || "New device");
		return h`<details class="device" ?open=${!r.tracker || Object.keys(i).length > 0 || Object.keys(a).length > 0}>
      <summary>${c}${c === po[r.kind] ? g : h`<span class="device-kind">${po[r.kind]}</span>`}</summary>
      <div class="device-body"><div class="device-head">
        <div class="resource-links">${tr(this, this.hass, r.tracker, "Open tracker", s?.device_id, "Open Bermuda device", !0)}</div>
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
          .selector=${ho}
          .label=${"Bermuda tracker"}
          .required=${!0}
          .value=${r.tracker}
          @value-changed=${(n) => this.editDevice(e, t, { tracker: n.detail.value ?? "" }, "tracker")}
        ></ha-selector>
        ${i.tracker ? h`<div class="error">${i.tracker}</div>` : g}
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
          .selector=${yo}
          .label=${"Kind"}
          .required=${!0}
          .value=${r.kind}
          @value-changed=${(n) => this.editDevice(e, t, { kind: n.detail.value ?? "other" }, "kind")}
        ></ha-selector>
        <ha-selector
          class="companion"
          .hass=${this.hass}
          .selector=${_o}
          .label=${"Companion app tracker"}
          .helper=${"Optional. The companion tracker for this device supplies carrying evidence."}
          .required=${!1}
          .value=${this.text(r.companion)}
          @value-changed=${(n) => this.editDevice(e, t, { companion: n.detail.value ? n.detail.value : null }, "companion")}
        ></ha-selector>
        ${uo.map((n) => this.renderSignal(e, t, r, n, o, a))}
      </div></div>
    </details>`;
	}
	renderPerson(e, t) {
		let n = An(this.errors, [
			"presence",
			"people",
			e
		]);
		return h`<div class="person">
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
        ${n.name ? h`<div class="error">${n.name}</div>` : g}
        <ha-selector
          class="person-entity"
          .hass=${this.hass}
          .selector=${go}
          .label=${"Person"}
          .helper=${"Its device_trackers seed the devices below: Bermuda ones to follow, a mobile_app one as the companion."}
          .required=${!1}
          .value=${this.text(t.person)}
          @value-changed=${(t) => this.editPerson(e, { person: t.detail.value ? t.detail.value : null }, "person")}
        ></ha-selector>
        ${n.person ? h`<div class="error">${n.person}</div>` : g}
      </div>
      ${t.devices.map((n, r) => this.renderDevice(e, r, t, n))}
      <button type="button" class="add-device" @click=${() => this.addDevice(e)}>Add device</button>
    </div>`;
	}
	render() {
		if (!this.config) return g;
		let e = this.people;
		return h`
      ${e.length === 0 ? h`<div class="empty">Nobody is followed yet. Add a person and pick their person entity.</div>` : g}
      ${e.map((e, t) => this.renderPerson(t, e))}
      <button type="button" class="add-person" @click=${() => this.addPerson()}>Add person</button>
    `;
	}
};
_([b({ attribute: !1 })], bo.prototype, "hass", void 0), _([b({ attribute: !1 })], bo.prototype, "config", void 0), _([b({ attribute: !1 })], bo.prototype, "errors", void 0), _([b({ attribute: !1 })], bo.prototype, "presence", void 0), bo = _([S("al-people-editor")], bo);
function xo(e) {
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
function So(e, t) {
	if (e === 0 && t === 0) return 0;
	let n = e === 0 ? Infinity : 60 / Math.abs(e), r = t === 0 ? Infinity : 27 / Math.abs(t);
	return Math.min(n, r, .5);
}
function Co(e, t) {
	let n = new Set(t.nodes), r = new Set(t.exits), i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let t of xo(e)) {
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
		let a = i.x - t.x, o = i.y - t.y, s = So(a, o);
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
var wo = (e, t) => ({
	x: e.x1 + (e.x2 - e.x1) * t,
	y: e.y1 + (e.y2 - e.y1) * t
}), To = (e, t, n) => e.edges.find((e) => e.a === t && e.b === n || e.a === n && e.b === t);
function Eo(e, t) {
	let n = [];
	for (let r = 1; r < t.length; r++) {
		let i = To(e, t[r - 1], t[r]);
		i && n.push(i);
	}
	return n;
}
//#endregion
//#region src/al-presence.ts
var Do = 2e3, Oo = "away", ko = {
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
}, Ao = {
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
}, jo = [
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
], Mo = [
	"charging",
	"moving",
	"still_room_empty",
	"jitter"
], No = [
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
], Po = (e) => {
	if (e === "activity_floor") return "presence/activity/floor";
	if (e.startsWith("carried_")) {
		let t = e.slice(8);
		return `presence/carried/${Mo.includes(t) ? "weights/" : ""}${t}`;
	}
	return `presence/${e}`;
}, Fo = { entity: {
	multiple: !0,
	filter: {
		domain: "device_tracker",
		integration: "bermuda"
	}
} }, Io = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, Lo = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "slider"
} }, Ro = { number: {
	min: 0,
	max: .1,
	step: .001,
	mode: "box"
} }, zo = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, Bo = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, Vo = { duration: {} }, Ho = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, Uo = { number: {
	min: -10,
	max: 10,
	step: .5,
	mode: "box"
} }, Wo = " → ", Go = "Give it an area that matches a room, or map it in Settings below.", Ko = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", V = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, H = class extends p {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, this.correctionPending = !1, this.correctionError = null, this.notice = null, this.computeLabel = (e) => ko[e.name] ?? e.name, this.computeHelper = (e) => Ao[e.name] ?? "", this.onDevicesChanged = (e) => {
			e.stopPropagation();
			let t = this.config;
			if (!t) return;
			let n = w(t), r = {
				...n,
				people: this.mergePeople(e.detail?.value, n.people)
			};
			this.dispatchEvent(N(E(t, ["presence"], r), "presence:people"));
		};
	}
	static {
		this.styles = [
			v,
			Ve,
			T`
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
		}, Do);
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
			this.topology = await ce(e);
		} catch {}
	}
	async refreshPresence() {
		let e = this.hass;
		if (e) try {
			this.presence = await ue(e);
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
			await l(n, e, r), this.notice = r.device ? "Device correction saved." : r.room ? `Moved ${e} to ${this.roomName(r.room)}.` : "Automatic estimate restored.", this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, await this.refreshPresence();
		} catch (e) {
			let t = e && typeof e == "object" && "message" in e ? String(e.message) : String(e);
			this.correctionError = `Could not save correction: ${t}`;
		} finally {
			this.correctionPending = !1;
		}
	}
	correctionStatus(e) {
		if (!e) return g;
		let t = typeof e.value == "boolean" ? e.value ? "Carrying" : "Not carrying" : this.roomName(e.value), n = e.reason.replaceAll("_", " ");
		return h`<div class="hint correction-status" role="status">${t} — ${n}
      (${Math.round(e.strength * 100)}%) · <time datetime=${(/* @__PURE__ */ new Date(e.t * 1e3)).toISOString()}>${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</time></div>`;
	}
	get correctionRooms() {
		let e = this.config;
		return [...this.topology?.nodes ?? (e ? [...nt(e)] : []), Oo];
	}
	get labels() {
		let e = this.config;
		return new Map(e ? xo(e).map((e) => [e.id, e.label]) : []);
	}
	roomName(e) {
		return e == null || e === "" ? "—" : e === Oo ? "Away" : this.labels.get(e) ?? e;
	}
	areaName(e) {
		return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
	}
	trail(e) {
		return e.map((e) => this.roomName(e)).join(Wo);
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
					options: pi(e)
				} }
			},
			{
				name: "threshold",
				selector: Lo
			},
			{
				name: "stay",
				selector: Io
			},
			{
				name: "escape",
				selector: Ro
			},
			{
				name: "scale",
				selector: zo
			},
			{
				name: "floor",
				selector: Bo
			},
			{
				name: "stuck_after",
				selector: Vo
			},
			{
				name: "activity_floor",
				selector: Bo
			},
			{
				name: "carried_prior",
				selector: Ho
			},
			{
				name: "carried_flip",
				selector: Vo
			},
			{
				name: "carried_recent",
				selector: Vo
			},
			{
				name: "carried_nearby",
				selector: Ho
			},
			...Mo.map((e) => ({
				name: `carried_${e}`,
				selector: Uo
			}))
		];
	}
	mergePeople(e, t) {
		if (!Array.isArray(e)) return [...t];
		let n = e.filter((e) => typeof e == "string"), r = t.filter((e) => e.devices.some((e) => n.includes(e.tracker))), i = new Set(r.flatMap((e) => e.devices.map((e) => e.tracker))), a = n.filter((e) => !i.has(e)).map((e) => ({
			...et(),
			devices: [f(e)]
		}));
		return [...r, ...a];
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config;
		if (!t) return;
		let n = w(t), r = e.detail?.value ?? {}, i = {
			charging: V(r.carried_charging) ?? n.carried.weights.charging,
			moving: V(r.carried_moving) ?? n.carried.weights.moving,
			still_room_empty: V(r.carried_still_room_empty) ?? n.carried.weights.still_room_empty,
			jitter: V(r.carried_jitter) ?? n.carried.weights.jitter
		}, a = {
			...n,
			enabled: typeof r.enabled == "boolean" ? r.enabled : n.enabled,
			envelope: r.envelope === void 0 ? n.envelope : typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : null,
			threshold: V(r.threshold) ?? n.threshold,
			stay: V(r.stay) ?? n.stay,
			escape: V(r.escape) ?? n.escape,
			scale: V(r.scale) ?? n.scale,
			floor: V(r.floor) ?? n.floor,
			stuck_after: A(r.stuck_after) ?? n.stuck_after,
			activity: { floor: V(r.activity_floor) ?? n.activity.floor },
			carried: {
				prior: V(r.carried_prior) ?? n.carried.prior,
				flip: A(r.carried_flip) ?? n.carried.flip,
				recent: A(r.carried_recent) ?? n.carried.recent,
				nearby: V(r.carried_nearby) ?? n.carried.nearby,
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
		}, s = jo.find((e) => !o(e));
		s !== void 0 && this.dispatchEvent(N(E(t, ["presence"], a), `presence:${s}`));
	}
	setSetting(e, t) {
		let n = this.config;
		if (!n) return;
		let r = {
			...w(n),
			[e]: t
		};
		this.dispatchEvent(N(E(n, ["presence"], r), `presence:${e}`));
	}
	renderSetup(e) {
		let t = this.presence?.bermuda === !0, n = w(e);
		return h`<ha-card class="setup" header="Room presence">
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
        .selector=${Fo}
        .label=${ko.devices}
        .helper=${Ao.devices}
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
		return e.length === 0 ? h`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >` : h`<ha-card><h2>People</h2>
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
			this.correcting === e ? this.renderCorrection(e, t) : g,
			this.correctingDevice?.person === e ? this.renderDeviceCorrection(e, t) : g
		])}
        </tbody>
      </table></div>
      ${this.notice === null ? g : h`<div class="notice" role="status">${this.notice}</div>`}
    </ha-card>`;
	}
	renderCorrection(e, t) {
		let n = Object.entries(t.candidates).sort(([, e], [, t]) => t - e).map(([e]) => e);
		return h`<tr class="correct">
      <td colspan="6"><div class="correction-panel">
        <span class="question">Where is ${e}?</span>
        <div class="correction-fields">${Object.entries(t.devices ?? {}).map(([e, t]) => h`<label>${t.name}
          <select data-carrying=${e} ?disabled=${this.correctionPending} aria-label=${`Carrying ${t.name}`} .value=${String(this.carryingChoices[e] ?? "")}
            @change=${(t) => {
			let n = t.target.value, r = { ...this.carryingChoices };
			n === "" ? delete r[e] : r[e] = n === "true", this.carryingChoices = r;
		}}>
            <option value="">Keep estimate (${t.carried === null ? "unknown" : `${Math.round(t.carried * 100)}% carrying`})</option>
            <option value="true">Carrying</option><option value="false">Not carrying</option>
          </select></label>`)}</div>
        ${this.correctionError ? h`<div role="alert">${this.correctionError}</div>` : g}
        <div class="actions">${n.map((t) => h`<button type="button" class="candidate" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, t)}
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
          ${this.correctionRooms.map((e) => h`<option value=${e}>${this.roomName(e)}</option>`)}
        </select>
        <button type="button" class="automatic-person" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, { clear: !0 })}>Use automatic estimate</button>
        <button type="button" class="cancel" @click=${() => this.correcting = null}>Close</button></div>
      </div></td>
    </tr>`;
	}
	renderPerson(e, t) {
		let n = Math.round(t.confidence * 100), r = Object.entries(t.devices ?? {}).sort(([e], [t]) => e.localeCompare(t));
		return h`<tr class="device person">
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
        ${t.moving ? h`<span class="chip moving">moving</span>` : g}
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
		let r = n.carried, i = r !== null && r < .5, a = r === null ? "—" : `${Math.round(r * 100)}%`, o = `${n.name} (${po[n.kind]}): carried ${a}${i && n.room ? `, in ${this.roomName(n.room)}` : ""}`;
		return h`<div class="device-entry"><button type="button" aria-expanded=${this.correctingDevice?.person === e && this.correctingDevice.device === t ? "true" : "false"} aria-label=${`Correct ${n.name}`} @click=${() => {
			this.correctingDevice = {
				person: e,
				device: t
			}, this.correcting = null, this.correctionError = null;
		}} class="chip device-chip ${i ? "parked" : "carried"}" data-device=${t} title=${o}>
      <ha-icon icon=${fo[n.kind] ?? fo.other}></ha-icon>
      <span class="device-name">${n.name}</span>
      <span class="carried-pct">${a} carrying</span>
      ${i && n.room ? h`<span class="parked-room">${this.roomName(n.room)}</span>` : g}
    </button>${this.correctionStatus(n.correction)}${this.correctionStatus(n.carrying_correction)}</div>`;
	}
	renderDeviceCorrection(e, t) {
		let n = this.correctingDevice?.device, r = n ? t.devices[n] : void 0;
		return !n || !r ? g : h`<tr class="correct device-correction"><td colspan="6"><div class="correction-panel">
      <div class="question">${r.name}</div>
      <div class="resource-links">${tr(this, this.hass, r.tracker, "Open tracker", r.device_id, "Open Bermuda device", !0)}</div>
      <div class="correction-fields"><label>Device room <select aria-label="Device room" ?disabled=${this.correctionPending} @change=${(t) => {
			let r = t.target.value;
			r && this.correct(e, {
				device: n,
				room: r
			});
		}}><option value="">Choose a room…</option>${this.correctionRooms.map((e) => h`<option value=${e}>${this.roomName(e)}</option>`)}</select></label></div>
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
      ${this.correctionError ? h`<div role="alert">${this.correctionError}</div>` : g}
    </div></td></tr>`;
	}
	renderScanners() {
		let e = this.presence?.scanners ?? [], t = new Set(this.presence?.unmapped ?? []);
		return h`<ha-card><h2>Scanners</h2>
      ${e.length === 0 ? h`<div class="empty">No Bermuda scanners have been discovered.</div>` : h`<div class="table-scroll"><table>
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
		return h`<tr class="scanner ${t ? "unmapped" : ""}">
      <td class="name">${er("device", e.device_id, e.name)}</td>
      <td class="area">${er("area", e.area_id, this.areaName(e.area_id))}</td>
      <td class="room">${t ? Go : this.roomName(e.group_id)}</td>
    </tr>`;
	}
	renderDisabled() {
		let e = this.presence?.disabled ?? [];
		return e.length === 0 ? g : h`<div class="disabled-sensors">
      ${Ko}
      <ul>
        ${e.map((e) => h`<li>${e}</li>`)}
      </ul>
    </div>`;
	}
	renderSettings(e) {
		let t = w(e), n = Object.fromEntries(jo.flatMap((e) => {
			let t = this.errors.find((t) => t.path === Po(e));
			return t ? [[e, t.message]] : [];
		})), r = this.errors.filter((e) => e.path === "presence"), i = {
			enabled: t.enabled,
			envelope: t.envelope ?? "",
			threshold: t.threshold,
			stay: t.stay,
			escape: t.escape,
			scale: t.scale,
			floor: t.floor,
			stuck_after: k(t.stuck_after),
			activity_floor: t.activity.floor,
			carried_prior: t.carried.prior,
			carried_flip: k(t.carried.flip),
			carried_recent: k(t.carried.recent),
			carried_nearby: t.carried.nearby,
			...Object.fromEntries(Mo.map((e) => [`carried_${e}`, t.carried.weights[e]]))
		}, a = (t) => h`<ha-form
      class="presence-settings" data-section=${t.id}
      .hass=${this.hass}
      .data=${Object.fromEntries(t.fields.map((e) => [e, i[e]]))}
      .schema=${this.schemaFor(e).filter((e) => t.fields.includes(e.name))}
      .error=${n}
      .computeLabel=${this.computeLabel}
      .computeHelper=${this.computeHelper}
      @value-changed=${this.onFormChanged}
    ></ha-form>`, o = No[0];
		return h`<ha-card><details class="settings" ?open=${this.errors.some((e) => e.path.startsWith("presence"))}>
      <summary>Presence settings</summary><div class="settings-body">
      ${r.map((e) => h`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
      <section class="settings-section">
        <h3>People and devices</h3>
        <p>Choose who to follow and the devices they carry. Open a device to edit its trackers and signals.</p>
        <al-people-editor .hass=${this.hass} .config=${e} .errors=${this.errors} .presence=${this.presence}></al-people-editor>
      </section>
      <section class="settings-section">
        <h3>${o.title}</h3><p>${o.hint}</p>${a(o)}
      </section>
      <div class="settings-grid">
        ${No.slice(1).map((e) => h`<details class="settings-section" data-section=${e.id}
          ?open=${e.fields.some((e) => n[e] !== void 0)}>
          <summary>${e.title}</summary><p>${e.hint}</p>${a(e)}
        </details>`)}
      </div>
    </div></details></ha-card>`;
	}
	render() {
		let e = this.config;
		return e ? w(e).enabled ? h`<div class="page">
      ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : h`<div class="page">${this.renderSetup(e)}</div>` : h`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
	}
};
_([b({ attribute: !1 })], H.prototype, "hass", void 0), _([b({ attribute: !1 })], H.prototype, "config", void 0), _([b({ attribute: !1 })], H.prototype, "errors", void 0), _([b({ type: Boolean })], H.prototype, "narrow", void 0), _([m()], H.prototype, "topology", void 0), _([m()], H.prototype, "presence", void 0), _([m()], H.prototype, "correcting", void 0), _([m()], H.prototype, "correctingDevice", void 0), _([m()], H.prototype, "carryingChoices", void 0), _([m()], H.prototype, "correctionPending", void 0), _([m()], H.prototype, "correctionError", void 0), _([m()], H.prototype, "notice", void 0), H = _([S("al-presence")], H);
//#endregion
//#region src/al-graph-map.ts
var qo = 60, Jo = 27, Yo = 2, Xo = 9, Zo = 7, U = (e) => String(Math.round(e * 10) / 10), Qo = class extends p {
	constructor(...e) {
		super(...e), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
	}
	static {
		this.styles = [v, T`
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
		this.dispatchEvent(Wn(e));
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
			let s = To(e, a, o);
			s && t.push({
				name: r,
				...wo(s, .5)
			});
		}
		return t;
	}
	summary(e) {
		let t = `${e.nodes.length} room${e.nodes.length === 1 ? "" : "s"}`, n = `${e.edges.length} door${e.edges.length === 1 ? "" : "s"}`, r = e.nodes.filter((e) => this.occupantsOf(e.id).length > 0).map((e) => `${e.label}: ${this.occupantsOf(e.id).join(", ")}`);
		return `Room map, ${t} and ${n}. ${r.length === 0 ? "Nobody is in a room right now." : `${r.join("; ")}.`}`;
	}
	renderEdge(e, t) {
		let n = t.has(e);
		return C`<line
      class="edge ${n ? "on-path" : ""}"
      data-one-way=${e.oneWay}
      x1=${U(e.x1)}
      y1=${U(e.y1)}
      x2=${U(e.x2)}
      y2=${U(e.y2)}
      marker-end=${e.oneWay ? "url(#al-arrow)" : g}
    ></line>`;
	}
	renderNode(e) {
		let t = this.occupantsOf(e.id), n = t.slice(0, Yo), r = t.length - n.length, i = this.selected.includes(e.id), a = [...n, ...r > 0 ? [`+${r}`] : []].join(", "), o = [
			e.label,
			e.exit ? "an exit" : "",
			t.length > 0 ? `${t.length} here: ${t.join(", ")}` : "empty"
		].filter((e) => e !== "").join(", ");
		return C`<g
      class="node ${i ? "selected" : ""}"
      data-id=${e.id}
      role="button"
      tabindex="0"
      aria-pressed=${i ? "true" : "false"}
      aria-label=${o}
      @click=${() => this.select(e.id)}
      @keydown=${(t) => this.onKeydown(t, e.id)}
    >
      <rect
        class="box"
        x=${U(e.x - qo)}
        y=${U(e.y - Jo)}
        width=${120}
        height=${54}
        rx="8"
      ></rect>
      <text class="label" x=${U(e.x)} y=${U(e.y - 4)} text-anchor="middle">${e.label}</text>
      ${a === "" ? g : C`<text class="names" x=${U(e.x)} y=${U(e.y + 13)} text-anchor="middle">${a}</text>`}
      ${t.length === 0 ? g : this.renderBadge(e, t.length)}
      ${e.exit ? this.renderDoor(e) : g}
    </g>`;
	}
	renderBadge(e, t) {
		let n = e.x + qo - Xo - 3, r = e.y - Jo + Xo + 3;
		return C`<circle class="badge" cx=${U(n)} cy=${U(r)} r=${Xo}></circle>
      <text class="count" x=${U(n)} y=${U(r + 3.5)} text-anchor="middle">${t}</text>`;
	}
	renderDoor(e) {
		let t = e.x - qo + 7, n = e.y + Jo - 7;
		return C`<path class="door" d=${`M ${U(t)} ${U(n)} v -14 h 10 v 14 z`}></path>`;
	}
	renderPerson(e) {
		return C`<circle class="person" data-name=${e.name} cx=${U(e.x)} cy=${U(e.y)} r=${Zo}>
      <title>${e.name} is on the move</title>
    </circle>`;
	}
	render() {
		let e = this.config, t = this.topology;
		if (!e || !t || t.nodes.length === 0) return h`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
		let n = Co(e, t), r = new Set(this.paths.flatMap((e) => Eo(n, e))), i = this.summary(n);
		return h`
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
_([b({ attribute: !1 })], Qo.prototype, "hass", void 0), _([b({ attribute: !1 })], Qo.prototype, "config", void 0), _([b({ attribute: !1 })], Qo.prototype, "topology", void 0), _([b({ attribute: !1 })], Qo.prototype, "presence", void 0), _([b({ attribute: !1 })], Qo.prototype, "selected", void 0), _([b({ attribute: !1 })], Qo.prototype, "paths", void 0), Qo = _([S("al-graph-map")], Qo);
//#endregion
//#region src/al-paths.ts
var W = class extends p {
	constructor(...e) {
		super(...e), this.narrow = !1, this.topology = null, this.selected = [null, null], this.paths = [], this.pending = !1, this.error = null, this.loading = !1, this.pathSeq = 0, this.topologySeq = 0;
	}
	static {
		this.styles = [
			v,
			Ve,
			T`
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
			let t = await ce(this.hass);
			e === this.topologySeq && (this.topology = t);
		} catch {
			e === this.topologySeq && (this.error = "Could not load room connections. Try again.");
		} finally {
			e === this.topologySeq && (this.loading = !1);
		}
	}
	roomName(e) {
		return this.config ? xo(this.config).find((t) => t.id === e)?.label ?? e : e;
	}
	async select(e) {
		let t = this.selected.filter((e) => e !== null), n = t.includes(e) ? t.filter((t) => t !== e) : [...t, e].slice(-2);
		this.selected = [n[0] ?? null, n[1] ?? null], this.paths = [], this.error = null;
		let r = ++this.pathSeq, [i, a] = this.selected;
		if (this.pending = !1, !(!this.hass || !i || !a)) {
			this.pending = !0;
			try {
				let e = await fe(this.hass, i, a);
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
			let n = this.selected[0] === e.id ? "From" : this.selected[1] === e.id ? "To" : "", r = e.name ?? e.id, i = h`<button class="room" type="button" data-room=${e.id}
        aria-pressed=${n ? "true" : "false"} @click=${(t) => {
				t.preventDefault(), t.stopPropagation(), this.select(e.id);
			}}>
        <span>${r}</span><span class="endpoint">${n}</span>
      </button>`;
			return e.children.length ? h`<details open>
        <summary>${t.has(e.id) ? i : r}</summary>
        <div class="branch">${this.renderTree(e.children, t)}</div>
      </details>` : t.has(e.id) ? i : h``;
		});
	}
	renderRoutes() {
		let [e, t] = this.selected;
		if (!e || !t) return h`<div class="paths">Select two rooms in the tree or map to see their routes.</div>`;
		let n = `${this.roomName(e)} → ${this.roomName(t)}`;
		return h`<div class="paths" role="status">
      ${this.pending ? `Finding routes from ${n}…` : this.error ? g : h`
        <div>${this.paths.length ? `${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${n}` : `No route from ${n}`}</div>
        <ol>${this.paths.map((e) => h`<li>${e.map((e) => this.roomName(e)).join(" → ")}</li>`)}</ol>
      `}
    </div>`;
	}
	render() {
		return h`<div class="page ${this.narrow ? "narrow" : ""}">
      ${this.error ? h`<ha-alert alert-type="error">${this.error}
        ${this.topology ? g : h`<button type="button" @click=${() => void this.refreshTopology()}>Retry</button>`}
      </ha-alert>` : g}
      <div class="paths-layout">
        <ha-card><h2>Rooms</h2><nav class="room-tree" aria-label="Room hierarchy">
          ${this.loading ? h`<p role="status">Loading rooms…</p>` : this.topology && this.config ? this.renderTree(this.config.groups, new Set(this.topology.nodes)) : g}
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
_([b({ attribute: !1 })], W.prototype, "hass", void 0), _([b({ attribute: !1 })], W.prototype, "config", void 0), _([b({ type: Boolean })], W.prototype, "narrow", void 0), _([m()], W.prototype, "topology", void 0), _([m()], W.prototype, "selected", void 0), _([m()], W.prototype, "paths", void 0), _([m()], W.prototype, "pending", void 0), _([m()], W.prototype, "error", void 0), _([m()], W.prototype, "loading", void 0), W = _([S("al-paths")], W);
//#endregion
//#region src/yaml-locate.ts
var $o = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, es = (e) => e.dash >= 0 ? e.dash : e.indent;
function ts(e) {
	let t = $o.exec(e);
	return t ? t[1] ?? t[2] ?? t[3] ?? null : null;
}
function ns(e) {
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
function rs(e, t, n, r) {
	for (let i = t + 1; i < n; i++) if (es(e[i]) <= r) return i;
	return n;
}
function is(e, t, n, r) {
	if (t >= n) return -1;
	let i = e[t].indent;
	for (let a = t; a < n; a++) {
		let t = e[a];
		if (t.indent === i && ts(t.text) === r) return a;
	}
	return -1;
}
function as(e, t, n, r) {
	if (t >= n || e[t].dash < 0) return -1;
	let i = e[t].dash, a = -1;
	for (let o = t; o < n; o++) if (e[o].dash === i && ++a === r) return o;
	return -1;
}
function os(e, t) {
	let n = t.split("/").filter((e) => e !== "");
	if (n.length === 0) return null;
	let r = ns(e), i = 0, a = r.length, o = null;
	for (let e of n) {
		let t = /^\d+$/.test(e) ? as(r, i, a, Number(e)) : is(r, i, a, e);
		if (t < 0) return o;
		let n = r[t];
		o = n.line, a = rs(r, t, a, es(n)), i = n.dash >= 0 ? t : t + 1;
	}
	return o;
}
var ss = class extends p {
	constructor(...e) {
		super(...e), this.errors = [], this.available = !0, this.parseError = null, this.seq = 0, this.validating = !1, this.validationFailure = null, this.onYaml = (e) => {
			e.stopPropagation(), window.clearTimeout(this.timer), this.seq++, this.validating = !0, this.validationFailure = null, this.dispatchEvent(Mn(!1, []));
			let t = e.detail;
			this.timer = window.setTimeout(() => void this.settle(t), 400);
		};
	}
	static {
		this.styles = [v, T`
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
		super.disconnectedCallback(), window.clearTimeout(this.timer), this.seq++;
	}
	firstUpdated() {
		this.seed(), this.validate(this.config);
	}
	updated(e) {
		e.has("config") && this.config !== this.mine && (window.clearTimeout(this.timer), this.parseError = null, this.seed(), this.validate(this.config));
	}
	get editor() {
		return this.renderRoot.querySelector("ha-yaml-editor");
	}
	seed() {
		this.mine = this.config, this.editor?.setValue?.(this.config ?? {});
	}
	async settle(e) {
		if (!e.isValid) {
			this.validating = !1, this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(Mn(!1, []));
			return;
		}
		this.parseError = null;
		let t = e.value;
		this.mine = t, this.dispatchEvent(N(t, "code")), await this.validate(t);
	}
	async validate(e) {
		let t = ++this.seq;
		this.validating = !0, this.validationFailure = null, this.dispatchEvent(Mn(!1, []));
		try {
			if (!this.hass || !e) throw Error("No configuration or connection available.");
			let n = await be(this.hass, e);
			if (t !== this.seq) return;
			this.validating = !1, this.dispatchEvent(Mn(n.ok, n.errors));
		} catch {
			if (t !== this.seq) return;
			this.validating = !1, this.validationFailure = "Could not validate this document. Edit again to retry; Save remains disabled.", this.dispatchEvent(Mn(!1, []));
		}
	}
	jump(e) {
		let t = this.editor, n = t?.codemirror, r = t?.yaml;
		if (!n || typeof r != "string") return;
		let i = os(r, e);
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
		return this.parseError === null ? this.validationFailure ? h`<ha-alert alert-type="error">${this.validationFailure}</ha-alert>` : this.validating ? h`<p class="muted">Validating…</p>` : this.errors.length === 0 ? h`<p class="muted no-problems">No problems. Save applies this document.</p>` : h`
      <p class="count muted">
        ${this.errors.length} ${this.errors.length === 1 ? "problem" : "problems"} — Save is
        disabled until they are fixed.
      </p>
      <ul class="errors">
        ${this.errors.map((e) => h`<li>
            <button type="button" class="jump" @click=${() => this.jump(e.path)}>
              <span class="path">${e.path === "" ? "(document)" : e.path}</span> —
              <span class="message">${e.message}</span>
            </button>
          </li>`)}
      </ul>
    ` : h`<ha-alert class="parse-error" alert-type="error">${this.parseError}</ha-alert>`;
	}
	renderUnavailable() {
		return h`<ha-card header="Code">
      <ha-alert class="editor-missing" alert-type="warning">
        Home Assistant's YAML editor did not load, so this tab cannot open. Visit
        <em>Settings → Devices &amp; services</em> once and reload the page; the other tabs edit the
        same configuration in the meantime.
      </ha-alert>
    </ha-card>`;
	}
	render() {
		return this.available ? h`
      <div class="page">
        <ha-card header="Configuration">
          <ha-yaml-editor @value-changed=${this.onYaml}></ha-yaml-editor>
          ${this.config === void 0 ? g : this.renderProblems()}
        </ha-card>
      </div>
    ` : h`<div class="page">${this.renderUnavailable()}</div>`;
	}
};
_([b({ attribute: !1 })], ss.prototype, "hass", void 0), _([b({ attribute: !1 })], ss.prototype, "config", void 0), _([b({ attribute: !1 })], ss.prototype, "errors", void 0), _([b({ type: Boolean })], ss.prototype, "available", void 0), _([m()], ss.prototype, "parseError", void 0), _([m()], ss.prototype, "validating", void 0), _([m()], ss.prototype, "validationFailure", void 0), ss = _([S("al-code")], ss);
//#endregion
//#region src/floorplan-import.ts
var cs = (e) => e.trim().toLocaleLowerCase();
function ls(e, t) {
	let n = D(e).map(({ group: e }) => e), r = {}, i = /* @__PURE__ */ new Map();
	for (let e of t.items) {
		let t = e.source_id ? n.filter((t) => t.id === e.source_id) : [], a = t.length ? t : n.filter((t) => cs(t.name ?? t.id) === cs(e.name)), o = a.length === 1 ? a[0] : void 0;
		r[e.key] = o ? {
			action: "existing",
			id: o.id
		} : { action: "skip" }, o && i.set(o.id, (i.get(o.id) ?? 0) + 1);
	}
	for (let [e, t] of Object.entries(r)) t.action === "existing" && i.get(t.id) > 1 && (r[e] = { action: "skip" });
	return r;
}
function us(e, t, n) {
	let r = new Set(D(e).map(({ group: e }) => e.id));
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
function ds(e, t, n, r) {
	let i = structuredClone(e), a = new Map(D(i).map(({ group: e }) => [e.id, e])), o = new Map(t.items.map((e) => [e.key, e])), s = [], c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set();
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
		if (!dt(o?.kind ?? null).includes(r.kind)) throw Error(`${o?.name ?? o?.id ?? "Root"} cannot contain a ${r.kind}.`);
		let s = {
			...xe(r.id, r.kind),
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
var fs = 1e6, ps = (e) => typeof e == "object" && e && "message" in e ? String(e.message) : "Import failed. Try again.", G = class extends p {
	constructor(...e) {
		super(...e), this.disabled = !1, this.text = "", this.source = null, this.choices = {}, this.importGps = !1, this.busy = null, this.error = "", this.notice = "", this.sequence = 0;
	}
	static {
		this.styles = [v, T`
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
		if (n.size > fs) {
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
		if (this.resetPreview(), this.text.length > fs) {
			this.error = "Paste is too large (maximum 1 MB of text).";
			return;
		}
		let e = this.sequence, t = this.config;
		this.busy = "parse";
		try {
			let n = await d(this.hass, this.text);
			if (e !== this.sequence || !this.isConnected) return;
			if (this.config !== t) {
				this.error = "The draft changed. Parse again to review matches.";
				return;
			}
			this.source = n, this.snapshot = t, this.choices = ls(t, n);
		} catch (t) {
			e === this.sequence && (this.error = ps(t));
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
		this.choose(e.key, n === "create" ? us(this.config, e, this.choices) : n === "skip" ? { action: "skip" } : {
			action: "existing",
			id: n.slice(9)
		});
	}
	preview() {
		if (!this.config || !this.source) return {};
		try {
			return { result: ds(this.config, this.source, this.choices, this.importGps) };
		} catch (e) {
			return { error: ps(e) };
		}
	}
	async apply() {
		if (!this.hass || this.disabled || this.busy || this.config !== this.snapshot) return;
		let { result: e } = this.preview();
		if (!e?.summary.length) return;
		let t = ++this.sequence, n = this.config;
		this.busy = "apply", this.error = "";
		try {
			let r = await be(this.hass, e.config);
			if (t !== this.sequence || this.config !== n || !this.isConnected || this.disabled) return;
			if (!r.ok) {
				this.error = r.errors.map((e) => `${e.path}: ${e.message}`).join("; ") || "Configuration validation failed.";
				return;
			}
			this.resetPreview(), this.notice = "Import applied to the draft. Use Save to persist it, or Undo to revert the import.", this.dispatchEvent(N(e.config, void 0, e.created ? !0 : void 0));
		} catch (e) {
			t === this.sequence && (this.error = ps(e));
		} finally {
			t === this.sequence && (this.busy = null);
		}
	}
	renderCreation(e, t) {
		let n = this.disabled || this.busy === "apply", r = D(this.config).map(({ group: e }) => e), i = t.parent ? "id" in t.parent ? `existing:${t.parent.id}` : `new:${t.parent.key}` : "";
		return h`<div class="creation">
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
        ${pt.map((e) => h`<option value=${e} .selected=${t.kind === e}>${y[e].label}</option>`)}
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
        ${r.filter((e) => dt(e.kind).includes(t.kind)).map((e) => h`<option value=${`existing:${e.id}`} .selected=${i === `existing:${e.id}`}>${e.name ?? e.id} (${e.id})</option>`)}
        ${Object.entries(this.choices).filter(([n, r]) => n !== e.key && r.action === "create" && dt(r.kind).includes(t.kind)).map(([e, t]) => h`<option value=${`new:${e}`} .selected=${i === `new:${e}`}>New: ${t.name} (${t.id})</option>`)}
      </select></label>
    </div>`;
	}
	renderItem(e) {
		let t = this.choices[e.key] ?? { action: "skip" }, n = t.action === "existing" ? `existing:${t.id}` : t.action;
		return h`<fieldset class="mapping" data-key=${e.key}>
      <legend>${e.context ? `${e.context} / ` : ""}${e.name} · ${y[e.kind].label}</legend>
      <p class="muted">${e.points ? `${e.points.length} outline vertices. ` : ""}
        ${e.bounds ? `Elevation ${e.bounds[0][2]}–${e.bounds[1][2]} m.` : "No vertical bounds supplied."}</p>
      <label>Destination <select class="destination" .value=${n} ?disabled=${this.disabled || this.busy === "apply"}
        @change=${(t) => this.destination(e, t)}>
        <option value="skip" .selected=${n === "skip"}>Skip</option>
        <option value="create" .selected=${n === "create"}>Create new group…</option>
        ${D(this.config).map(({ group: e }) => h`<option value=${`existing:${e.id}`} .selected=${n === `existing:${e.id}`}>
          ${e.name ?? e.id} (${e.id}) · ${y[e.kind].label}
        </option>`)}
      </select></label>
      ${t.action === "create" ? this.renderCreation(e, t) : g}
    </fieldset>`;
	}
	render() {
		let e = this.preview(), t = this.disabled || this.busy === "apply";
		return h`
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
      ${this.error ? h`<p class="error" role="alert">${this.error}</p>` : g}
      ${this.notice ? h`<p role="status">${this.notice}</p>` : g}
      ${this.source ? h`
        <h3>Review mappings</h3>
        <p>Matches are suggestions. Unmatched entries are skipped. Creating a group is always an explicit choice.</p>
        ${this.source.gps ? h`<label class="check"><input id="gps" type="checkbox" .checked=${this.importGps}
          ?disabled=${t} @change=${(e) => {
			this.importGps = e.target.checked, this.error = "";
		}}>
          ${this.config?.gps ? "Replace" : "Import"} GPS origin (${this.source.gps.latitude}, ${this.source.gps.longitude})
        </label>` : g}
        ${this.source.items.map((e) => this.renderItem(e))}
        <section class="summary" aria-label="Import changes">
          <h3>Changes to apply</h3>
          ${e.error ? h`<p class="error" role="alert">${e.error}</p>` : h`
            <ul>${e.result?.summary.map((e) => h`<li>${e}</li>`)}</ul>
            ${e.result?.summary.length ? g : h`<p>No changes selected.</p>`}`}
          <button id="apply" type="button" ?disabled=${!e.result?.summary.length || !!this.busy || this.disabled}
            @click=${this.apply}>${this.busy === "apply" ? "Validating…" : "Apply to draft"}</button>
        </section>` : g}
    `;
	}
};
_([b({ attribute: !1 })], G.prototype, "hass", void 0), _([b({ attribute: !1 })], G.prototype, "config", void 0), _([b({ type: Boolean })], G.prototype, "disabled", void 0), _([m()], G.prototype, "text", void 0), _([m()], G.prototype, "source", void 0), _([m()], G.prototype, "choices", void 0), _([m()], G.prototype, "importGps", void 0), _([m()], G.prototype, "busy", void 0), _([m()], G.prototype, "error", void 0), _([m()], G.prototype, "notice", void 0), G = _([S("al-floorplan-import")], G);
//#endregion
//#region src/property-layout.ts
var ms = 6378137, K = Math.PI / 180;
function hs(e) {
	return Number.isFinite(e.latitude) && Math.abs(e.latitude) < 85 && Number.isFinite(e.longitude) && Math.abs(e.longitude) <= 180 && Number.isFinite(e.rotation ?? 0) && Number.isFinite(e.elevation ?? 0);
}
function gs([e, t], n) {
	let r = (n.rotation ?? 0) * K, i = e * Math.cos(r) - t * Math.sin(r), a = e * Math.sin(r) + t * Math.cos(r);
	return [n.longitude + i / (ms * Math.cos(n.latitude * K)) / K, n.latitude + a / ms / K];
}
function _s([e, t], n) {
	let r = (e - n.longitude) * K * ms * Math.cos(n.latitude * K), i = (t - n.latitude) * K * ms, a = (n.rotation ?? 0) * K;
	return [r * Math.cos(a) + i * Math.sin(a), -r * Math.sin(a) + i * Math.cos(a)];
}
function vs([e, t], n) {
	let r = 256 * 2 ** n, i = Math.sin(Math.max(-85, Math.min(85, t)) * K);
	return [(e + 180) / 360 * r, (.5 - Math.log((1 + i) / (1 - i)) / (4 * Math.PI)) * r];
}
function ys([e, t], n) {
	let r = 256 * 2 ** n;
	return [e / r * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * t / r))) / K];
}
function q(e) {
	if (e.points) return e.points;
	if (!e.bounds) return [];
	let [[t, n], [r, i]] = e.bounds;
	return [
		[t, n],
		[r, n],
		[r, i],
		[t, i]
	];
}
function bs(e, t, n, r, i) {
	if (![
		n,
		r,
		i
	].every(Number.isFinite)) throw Error("Placement needs finite numbers.");
	let a = structuredClone(e), o = D(a).find((e) => e.group.id === t)?.group;
	if (!o || o.kind !== "structure" || !o.bounds) throw Error("Choose a structure with dimensions.");
	let [[s, c], [l, u]] = o.bounds, d = (s + l) / 2, f = (c + u) / 2, p = i * K, ee = (e) => {
		let t = q(e);
		if (t.length && (e.points = t.map(([e, t]) => [d + n + (e - d) * Math.cos(p) - (t - f) * Math.sin(p), f + r + (e - d) * Math.sin(p) + (t - f) * Math.cos(p)]), e.bounds)) {
			let t = e.points.map((e) => e[0]), n = e.points.map((e) => e[1]);
			e.bounds = [[
				Math.min(...t),
				Math.min(...n),
				e.bounds[0][2]
			], [
				Math.max(...t),
				Math.max(...n),
				e.bounds[1][2]
			]];
		}
		e.fixtures = e.fixtures?.map((e) => {
			let [t, a, o] = e.position;
			return {
				...e,
				position: [
					d + n + (t - d) * Math.cos(p) - (a - f) * Math.sin(p),
					f + r + (t - d) * Math.sin(p) + (a - f) * Math.cos(p),
					o
				],
				yaw: ((e.yaw + i) % 360 + 360) % 360
			};
		}), e.openings = e.openings?.map((e) => {
			let [t, a, o] = e.position;
			return {
				...e,
				position: [
					d + n + (t - d) * Math.cos(p) - (a - f) * Math.sin(p),
					f + r + (t - d) * Math.sin(p) + (a - f) * Math.cos(p),
					o
				],
				yaw: ((e.yaw + i) % 360 + 360) % 360
			};
		}), e.children.forEach(ee);
	};
	return ee(o), a;
}
function xs(e) {
	let t = e.trim().split(/\n/).filter(Boolean).map((e) => e.trim().split(/[,\s]+/).map(Number));
	if (t.length < 3 || t.length > 4096 || t.some((e) => e.length !== 2 || !e.every(Number.isFinite))) throw Error("Enter at least three X,Y coordinate pairs, one per line.");
	let n = t.reduce((e, n, r) => {
		let i = t[(r + 1) % t.length];
		return e + n[0] * i[1] - i[0] * n[1];
	}, 0);
	if (!Number.isFinite(n) || Math.abs(n) < 1e-8) throw Error("The outline must enclose an area.");
	return t;
}
//#endregion
//#region src/al-property-layout.ts
var Ss = {
	property: "#74836b",
	lawn: "#65964d",
	driveway: "#89919a",
	path: "#b5a58a",
	pool: "#59aac7"
}, J = 512, Y = class extends p {
	constructor(...e) {
		super(...e), this.disabled = !1, this.latitude = "", this.longitude = "", this.elevation = "", this.rotation = "0", this.loadedLocation = !1, this.error = "", this.mapOpen = !1, this.tileError = !1, this.zoom = 19, this.provider = "https://tile.openstreetmap.org/{z}/{x}/{y}.png", this.attribution = "© OpenStreetMap contributors", this.editing = null, this.name = "", this.kind = "property", this.vertices = "", this.structure = "", this.dx = "0", this.dy = "0", this.angle = "0", this.busy = !1;
	}
	static {
		this.styles = T`
    :host { display:block; } fieldset { border:0; padding:0; margin:16px 0; }
    .row { display:flex; flex-wrap:wrap; gap:12px; align-items:end; margin:12px 0; }
    label { display:flex; flex-direction:column; gap:4px; }
    input, select, textarea, button { font:inherit; color:var(--primary-text-color,#e4edf3);
      background:var(--card-background-color,#263d4c); border:1px solid var(--divider-color,#526674);
      border-radius:6px; padding:8px; } button:disabled { opacity:0.5; cursor:default; }
    input { max-width:150px; } button { padding:8px; cursor:pointer; } a { color:var(--primary-color,#69c8e0); }
    .map { position:relative; max-width:768px; background:#253743; }
    svg { display:block; width:100%; touch-action:manipulation; }
    .credit { background:#fff; color:#222; font-size:12px; padding:4px 8px; } .credit a { color:#145273; }
    textarea { width:min(95%,500px); min-height:100px; } .error { color:var(--error-color,#ef6b6b); }
    .hint { color:var(--secondary-text-color); } li { margin:8px 0; }
  `;
	}
	willUpdate(e) {
		e.has("config") && this.config?.gps && !this.latitude && !this.longitude && (this.latitude = String(this.config.gps.latitude), this.longitude = String(this.config.gps.longitude), this.elevation = this.config.gps.elevation === void 0 ? "" : String(this.config.gps.elevation), this.rotation = String(this.config.gps.rotation ?? 0)), e.has("config") && this.editing !== null && (this.editing = null, this.vertices = "", this.name = "");
	}
	editFeature(e) {
		if (this.disabled) return;
		let t = this.config?.site?.features[e];
		t && (this.editing = e, this.name = t.name, this.kind = t.kind, this.vertices = t.points.map((e) => e.join(", ")).join("\n"));
	}
	async useHome() {
		if (!(!this.hass || this.disabled)) {
			this.busy = !0, this.error = "";
			try {
				let e = await this.hass.callWS({ type: "get_config" });
				if (!hs(e)) throw Error("Home Assistant location is outside the supported map range. Edit Home information first.");
				this.latitude = String(e.latitude), this.longitude = String(e.longitude), this.elevation = String(e.elevation ?? 0), this.loadedLocation = !0;
			} catch (e) {
				this.error = e instanceof Error ? e.message : String(e);
			} finally {
				this.busy = !1;
			}
		}
	}
	applyOrigin() {
		if (!(!this.config || this.disabled)) try {
			if (!this.latitude.trim() || !this.longitude.trim()) throw Error("Enter latitude and longitude.");
			let e = {
				latitude: Number(this.latitude),
				longitude: Number(this.longitude),
				rotation: Number(this.rotation)
			};
			if (this.elevation.trim() && (e.elevation = Number(this.elevation)), !hs(e)) throw Error("Enter valid coordinates (latitude between −85 and 85) and finite elevation/rotation.");
			this.dispatchEvent(N({
				...this.config,
				gps: e
			})), this.center = [e.longitude, e.latitude], this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	loadMap() {
		try {
			if (!this.config?.gps || !hs(this.config.gps)) throw Error("Apply a valid geographic origin first.");
			if (new URL(this.provider).protocol !== "https:" || ![
				"{x}",
				"{y}",
				"{z}"
			].every((e) => this.provider.includes(e)) || !this.attribution.trim()) throw Error("Use an HTTPS tile template with {z}, {x}, {y} and attribution.");
			this.center = [this.config.gps.longitude, this.config.gps.latitude], this.mapOpen = !0, this.tileError = !1, this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	originPixel() {
		return vs(this.center, this.zoom);
	}
	screen(e) {
		let t = vs(gs(e, this.config.gps), this.zoom), n = this.originPixel();
		return [t[0] - n[0] + J / 2, t[1] - n[1] + J / 2];
	}
	pan(e, t) {
		let n = this.originPixel();
		this.center = ys([n[0] + e * 128, n[1] + t * 128], this.zoom);
	}
	addVertex(e) {
		if (this.disabled || !this.config?.gps) return;
		let t = e.currentTarget.getBoundingClientRect(), n = this.originPixel(), r = _s(ys([n[0] + (e.clientX - t.left) / t.width * J - J / 2, n[1] + (e.clientY - t.top) / t.height * J - J / 2], this.zoom), this.config.gps);
		this.vertices = [this.vertices.trim(), r.map((e) => e.toFixed(3)).join(", ")].filter(Boolean).join("\n");
	}
	addFeature() {
		if (!(!this.config || this.disabled)) try {
			if (!this.name.trim()) throw Error("Give the feature a name.");
			let e = xs(this.vertices), t = this.config.site ?? {
				ground_z: 0,
				features: []
			};
			if (this.editing === null && t.features.length >= 128) throw Error("Maximum 128 ground features.");
			let n = {
				name: this.name.trim(),
				kind: this.kind,
				points: e
			}, r = this.editing === null ? [...t.features, n] : t.features.map((e, t) => t === this.editing ? n : e);
			this.dispatchEvent(N({
				...this.config,
				site: {
					...t,
					features: r
				}
			})), this.editing = null, this.vertices = "", this.name = "", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	removeFeature(e) {
		this.disabled || !this.config?.site || this.dispatchEvent(N({
			...this.config,
			site: {
				...this.config.site,
				features: this.config.site.features.filter((t, n) => n !== e)
			}
		}));
	}
	place() {
		if (!(!this.config || this.disabled)) try {
			this.dispatchEvent(N(bs(this.config, this.structure, Number(this.dx), Number(this.dy), Number(this.angle)))), this.dx = this.dy = this.angle = "0", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	tiles() {
		let [e, t] = this.originPixel(), n = 2 ** this.zoom, r = e - J / 2, i = t - J / 2, a = [];
		for (let e = Math.floor(i / 256); e <= Math.floor((i + J) / 256); e++) if (!(e < 0 || e >= n)) for (let t = Math.floor(r / 256); t <= Math.floor((r + J) / 256); t++) {
			let o = this.provider.replace("{z}", String(this.zoom)).replace("{x}", String((t % n + n) % n)).replace("{y}", String(e));
			a.push(C`<image href=${o} x=${t * 256 - r} y=${e * 256 - i} width="256" height="256"
          @error=${() => {
				this.tileError = !0;
			}}></image>`);
		}
		return a;
	}
	polygon(e) {
		return e.map((e) => this.screen(e).join(",")).join(" ");
	}
	render() {
		if (!this.config) return g;
		let e = this.config.gps, t = D(this.config).map((e) => e.group).filter((e) => e.kind === "structure" && e.bounds), n = this.vertices.trim().split("\n").map((e) => e.trim().split(/[,\s]+/).map(Number)).filter((e) => e.length === 2 && e.every(Number.isFinite));
		return h`
      <p>Use your home location, trace outdoor features, and place existing buildings. Changes join the panel draft; use Save to keep them.</p>
      ${e ? h`<p>Current origin: ${e.latitude}, ${e.longitude}; rotation ${e.rotation ?? 0}°.</p>` : h`<p>No geographic origin configured yet.</p>`}
      <fieldset ?disabled=${this.disabled || this.busy}>
        <legend>Location</legend>
        <button @click=${this.useHome}>Use Home Assistant location</button>
        <a href="/config/general" target="_blank" rel="noopener">Edit Home Assistant home information</a>
        ${this.loadedLocation ? h`<p>Home location loaded below. Apply it to this floorplan when ready.</p>` : g}
        <div class="row">
          <label>Latitude<input type="number" step="any" .value=${this.latitude} @input=${(e) => {
			this.latitude = e.target.value;
		}}></label>
          <label>Longitude<input type="number" step="any" .value=${this.longitude} @input=${(e) => {
			this.longitude = e.target.value;
		}}></label>
          <label>Elevation above sea level (m)<input type="number" step="any" .value=${this.elevation} @input=${(e) => {
			this.elevation = e.target.value;
		}}></label>
          <label>Origin rotation (°)<input type="number" step="any" .value=${this.rotation} @input=${(e) => {
			this.rotation = e.target.value;
		}}></label>
          <button @click=${this.applyOrigin}>${e ? "Replace floorplan origin" : "Apply floorplan origin"}</button>
        </div>
        <p class="hint">Local room coordinates stay unchanged. The map origin identifies local X=0, Y=0; it may differ from the home pin.</p>
        <button @click=${this.loadMap}>Load map</button>
        <details><summary>Map provider</summary><p>Street map by default. Supply an HTTPS tile provider and its attribution for other imagery.</p>
          <label>Tile URL<textarea .value=${this.provider} @change=${(e) => {
			this.mapOpen = !1, this.provider = e.target.value;
		}}></textarea></label>
          <label>Attribution<input .value=${this.attribution} @input=${(e) => {
			this.attribution = e.target.value;
		}}></label>
        </details>
      </fieldset>
      ${this.mapOpen && e && this.center ? h`
        <div class="row"><button @click=${() => {
			this.zoom = Math.min(19, this.zoom + 1);
		}}>Zoom in</button><button @click=${() => {
			this.zoom = Math.max(3, this.zoom - 1);
		}}>Zoom out</button>
          <button @click=${() => this.pan(-1, 0)}>West</button><button @click=${() => this.pan(1, 0)}>East</button><button @click=${() => this.pan(0, -1)}>North</button><button @click=${() => this.pan(0, 1)}>South</button></div>
        <p>Click the map to add outline vertices, or enter local coordinates below.</p>
        <div class="map"><svg viewBox=${`0 0 ${J} ${J}`} role="img" aria-label="Property map; use coordinate fields below for keyboard editing" @click=${this.addVertex}>
          ${this.tiles()}
          ${this.config.site?.features.map((e) => C`<polygon points=${this.polygon(e.points)} fill=${Ss[e.kind]} fill-opacity="0.35" stroke=${Ss[e.kind]} stroke-width="2"></polygon>`)}
          ${t.map((e) => C`<polygon points=${this.polygon(q(e))} fill="#46b6ff" fill-opacity="0.15" stroke="#159ce9" stroke-width="2"></polygon>`)}
          <polyline points=${this.polygon(n)} fill="#ffcc55" fill-opacity="0.2" stroke="#ffcc55" stroke-width="3"></polyline>
          ${n.map((e) => {
			let [t, n] = this.screen(e);
			return C`<circle cx=${t} cy=${n} r="4" fill="#ffcc55"></circle>`;
		})}
        </svg><div class="credit">${this.attribution} · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></div></div>
        ${this.tileError ? h`<p role="status">Some map tiles could not load. Coordinates and layout editing remain available.</p>` : g}
      ` : g}
      <fieldset ?disabled=${this.disabled}><legend>Ground features</legend>
        <label>Local ground Z (m)<input type="number" step="any" .value=${String(this.config.site?.ground_z ?? 0)} @change=${(e) => {
			let t = Number(e.target.value);
			Number.isFinite(t) && this.dispatchEvent(N({
				...this.config,
				site: {
					features: this.config.site?.features ?? [],
					ground_z: t
				}
			}));
		}}></label>
        <p class="hint">Local ground height is separate from geographic elevation; use the same Z reference as your rooms.</p>
        <div class="row"><label>Name<input maxlength="100" .value=${this.name} @input=${(e) => {
			this.name = e.target.value;
		}}></label>
          <label>Type<select .value=${this.kind} @change=${(e) => {
			this.kind = e.target.value;
		}}>${Object.keys(Ss).map((e) => h`<option value=${e}>${e}</option>`)}</select></label></div>
        <label>Outline coordinates (X, Y metres; one vertex per line)<textarea .value=${this.vertices} @input=${(e) => {
			this.vertices = e.target.value;
		}}></textarea></label>
        <div class="row"><button @click=${this.addFeature}>${this.editing === null ? "Add ground feature" : "Update ground feature"}</button><button @click=${() => {
			this.vertices = "", this.editing = null;
		}}>Clear drawing</button></div>
        <ul>${this.config.site?.features.map((e, t) => h`<li>${e.name} (${e.kind}) <button @click=${() => this.editFeature(t)}>Edit ${e.name}</button> <button @click=${() => this.removeFeature(t)}>Remove ${e.name}</button></li>`)}</ul>
      </fieldset>
      <fieldset ?disabled=${this.disabled}><legend>Place existing structures</legend>
        <p>Move in local metres and rotate counterclockwise around the building centre. All descendant rooms move together; their dimensions and heights are preserved.</p>
        <div class="row"><label>Structure<select .value=${this.structure} @change=${(e) => {
			this.structure = e.target.value;
		}}><option value="">Choose a building</option>${t.map((e) => h`<option value=${e.id}>${e.name ?? e.id}</option>`)}</select></label>
          <label>Move X (m)<input type="number" step="any" .value=${this.dx} @input=${(e) => {
			this.dx = e.target.value;
		}}></label>
          <label>Move Y (m)<input type="number" step="any" .value=${this.dy} @input=${(e) => {
			this.dy = e.target.value;
		}}></label>
          <label>Rotate (°)<input type="number" step="any" .value=${this.angle} @input=${(e) => {
			this.angle = e.target.value;
		}}></label>
          <button @click=${this.place}>Apply placement</button></div>
      </fieldset>
      ${this.error ? h`<p class="error" role="alert">${this.error}</p>` : g}`;
	}
};
_([b({ attribute: !1 })], Y.prototype, "config", void 0), _([b({ attribute: !1 })], Y.prototype, "hass", void 0), _([b({ type: Boolean })], Y.prototype, "disabled", void 0), _([m()], Y.prototype, "latitude", void 0), _([m()], Y.prototype, "longitude", void 0), _([m()], Y.prototype, "elevation", void 0), _([m()], Y.prototype, "rotation", void 0), _([m()], Y.prototype, "loadedLocation", void 0), _([m()], Y.prototype, "error", void 0), _([m()], Y.prototype, "mapOpen", void 0), _([m()], Y.prototype, "tileError", void 0), _([m()], Y.prototype, "zoom", void 0), _([m()], Y.prototype, "center", void 0), _([m()], Y.prototype, "provider", void 0), _([m()], Y.prototype, "attribution", void 0), _([m()], Y.prototype, "editing", void 0), _([m()], Y.prototype, "name", void 0), _([m()], Y.prototype, "kind", void 0), _([m()], Y.prototype, "vertices", void 0), _([m()], Y.prototype, "structure", void 0), _([m()], Y.prototype, "dx", void 0), _([m()], Y.prototype, "dy", void 0), _([m()], Y.prototype, "angle", void 0), _([m()], Y.prototype, "busy", void 0), Y = _([S("al-property-layout")], Y);
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive-helpers.js
var { I: Cs } = we, ws = {}, Ts = (e, t = ws) => e._$AH = t, Es = wa(class extends Ta {
	constructor() {
		super(...arguments), this.key = g;
	}
	render(e, t) {
		return this.key = e, t;
	}
	update(e, [t, n]) {
		return t !== this.key && (Ts(e), this.key = t), n;
	}
}), Ds = [
	"manufacturer",
	"model",
	"platform",
	"device_class",
	"entity_name"
], Os = (e) => e.trim().toLowerCase();
function ks(e, t) {
	let n = Ds.filter((t) => e.match[t]);
	return !!e.match.model && !!(e.match.manufacturer || e.match.platform) && n.every((n) => n === "entity_name" ? Os(t[n] ?? "").includes(Os(e.match[n])) : Os(t[n] ?? "") === Os(e.match[n]));
}
function As(e, t) {
	return {
		...e,
		coverage_shape: t.coverage_shape ?? "cone",
		look_down: t.look_down ?? !1,
		profile_id: t.id,
		kind: t.kind,
		fov: t.fov,
		vertical_fov: t.vertical_fov,
		range: t.range,
		technology: t.technology,
		mount: t.mount
	};
}
function js(e) {
	if (e.length > 5e5) throw Error("Profile file is too large.");
	let t = JSON.parse(e);
	if (!Array.isArray(t) || t.length > 128) throw Error("Expected an array of at most 128 profiles.");
	let n = /* @__PURE__ */ new Set();
	return t.map((e) => {
		if (!e || typeof e != "object") throw Error("Invalid profile.");
		let t = {
			technology: "",
			mount: "",
			notes: "",
			source: "",
			match: {},
			...e
		};
		for (let [e, n] of Object.entries({
			id: 100,
			name: 100,
			technology: 60,
			mount: 60,
			notes: 2e3,
			source: 500
		})) {
			let r = t[e];
			if (typeof r != "string" || r.length > n || (e === "id" || e === "name") && !r.trim()) throw Error(`Invalid profile ${e}.`);
		}
		if (t.look_down !== void 0 && typeof t.look_down != "boolean") throw Error("Invalid look-down flag.");
		if (![
			"motion",
			"occupancy",
			"light",
			"window"
		].includes(t.kind) || ![
			t.fov,
			t.vertical_fov,
			t.range
		].every((e) => typeof e == "number" && Number.isFinite(e))) throw Error("Profile kind and coverage fields are required.");
		if (!Ae({
			...ot(t.kind === "light" ? "light.profile" : "binary_sensor.profile"),
			...t
		}) || n.has(t.id)) throw Error("Invalid coverage or duplicate profile id.");
		if (!t.match || typeof t.match != "object" || Array.isArray(t.match)) throw Error("Invalid identification rules.");
		for (let [e, n] of Object.entries(t.match)) if (!Ds.includes(e) || typeof n != "string" || !n.trim() || n.length > 200) throw Error("Invalid identification rule.");
		return n.add(t.id), {
			...t.coverage_shape === void 0 ? {} : { coverage_shape: t.coverage_shape },
			...t.look_down === void 0 ? {} : { look_down: t.look_down },
			id: t.id,
			name: t.name,
			kind: t.kind,
			fov: t.fov,
			vertical_fov: t.vertical_fov,
			range: t.range,
			technology: t.technology,
			mount: t.mount,
			notes: t.notes,
			source: t.source,
			match: { ...t.match }
		};
	});
}
function Ms(e, t, n, r, i) {
	let a = D(e), o = a.find((e) => e.group.id === t);
	if (!o) return [];
	let s = o.group.area_id;
	s ||= a.filter((e) => e.path.length < o.path.length && e.path.every((e, t) => o.path[t] === e)).sort((e, t) => t.path.length - e.path.length).find((e) => e.group.area_id)?.group.area_id ?? null;
	let c = a.filter((e) => o.path.every((t, n) => e.path[n] === t)), l = new Set(c.flatMap((e) => e.group.stimuli.map((e) => e.entity))), u = new Set(o.group.fixtures?.map((e) => e.entity)), d = new Map(n.map((e) => [e.entity, e])), f = /* @__PURE__ */ new Set([
		...n.filter((e) => s && e.area_id === s).map((e) => e.entity),
		...l,
		...u
	]), p = new Set(c.flatMap((e) => (i?.voices[e.group.id] ?? []).filter((e) => e.value > 0 && e.entity).map((e) => e.entity)));
	return [...f].filter((e) => /^(binary_sensor|light)\./.test(e)).map((e) => {
		let t = r?.states[e], n = d.get(e);
		return {
			entity: e,
			area_id: null,
			manufacturer: null,
			model: null,
			platform: "",
			device_class: null,
			entity_name: "",
			...n,
			name: String(t?.attributes.friendly_name ?? n?.entity_name ?? e) || e,
			input: l.has(e),
			contributing: p.has(e),
			placed: u.has(e),
			changed: Number.isFinite(Date.parse(t?.last_changed ?? "")) ? Date.parse(t.last_changed) / 1e3 : 0
		};
	}).sort((e, t) => Number(t.input) - Number(e.input) || Number(t.contributing) - Number(e.contributing) || t.changed - e.changed || e.name.localeCompare(t.name));
}
//#endregion
//#region src/measurement-units.ts
function Ns(e) {
	let t = e?.config?.unit_system?.length?.toLowerCase();
	return t === "mi" || t === "ft" || t === "in" ? "ft" : "m";
}
function Ps(e, t) {
	return t === "ft" ? e * .3048 : e;
}
function Fs(e, t) {
	let n = e.trim().toLowerCase().replace(/[′’]/g, "'").replace(/[″“”]/g, "\"");
	if (!n) return null;
	let r = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
	if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(n)) {
		let e = Ps(Number(n), t);
		return Number.isFinite(e) ? e : null;
	}
	let i = /^([+-]?)\s*(?:(\d+(?:\.\d*)?|\.\d+)\s*(?:'|feet|foot|ft)\s*)?(?:(\d+(?:\.\d*)?|\.\d+|\d+\s+\d+\/\d+|\d+\/\d+)\s*(?:"|inches|inch|in))?$/.exec(n);
	if (!i || !i[2] && !i[3]) return null;
	let a = i[3] ?? "0", o;
	if (r.test(a)) o = Number(a);
	else {
		let e = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(a);
		if (Number(e[3]) === 0) return null;
		o = Number(e[1] ?? 0) + Number(e[2]) / Number(e[3]);
	}
	let s = (Number(i[2] ?? 0) * 12 + o) * .0254 * (i[1] === "-" ? -1 : 1);
	return Number.isFinite(s) ? s : null;
}
function Is(e, t) {
	if (t === "m") return String(Number(e.toFixed(4)));
	let n = Number((Math.abs(e) / .0254).toFixed(4)), r = Math.floor(n / 12), i = Number((n - r * 12).toFixed(4));
	return `${e < 0 ? "-" : ""}${r}'${i}"`;
}
//#endregion
//#region src/al-orientation-control.ts
var Ls = class extends p {
	constructor(...e) {
		super(...e), this.yaw = 0, this.pitch = 0, this.disabled = !1, this.snap = 0, this.aiming = !1;
	}
	static {
		this.styles = T`
    :host { display:block; }
    .controls { display:flex; align-items:center; flex-wrap:wrap; gap:12px; }
    svg { width:132px; height:132px; touch-action:none; cursor:crosshair; border-radius:50%; }
    svg:focus { outline:2px solid var(--primary-color,#8ed9ea); outline-offset:3px; }
    circle { fill:#16313f; stroke:#638b9e; stroke-width:2; }
    line { stroke:#ffcd69; stroke-width:3; }
    .tip { fill:#ffcd69; }
    text { fill:#bdd7e0; font-size:10px; text-anchor:middle; }
    .active circle { stroke:#ffcd69; stroke-width:4; }
    .buttons { display:grid; gap:8px; }
    .row { display:flex; align-items:center; gap:8px; }
    output { min-width:92px; font-variant-numeric:tabular-nums; }
    button { min-width:28px; min-height:28px; border:1px solid #638b9e; border-radius:8px; background:var(--secondary-background-color,#243c4b); color:var(--primary-text-color,#fff); cursor:pointer; }
    button:disabled, [aria-disabled="true"] { opacity:.45; cursor:default; }
    select { font:inherit; color:inherit; background:#16313f; border:1px solid #638b9e; margin:6px; }
    @media(pointer:coarse){button{min-width:44px;min-height:44px;}}
    p { margin:8px 0; font-size:12px; color:var(--secondary-text-color,#bdd7e0); }
  `;
	}
	change(e, t) {
		this.disabled || (this.snap && (e !== this.yaw && (e = Math.round(e / this.snap) * this.snap), t !== this.pitch && (t = Math.round(t / this.snap) * this.snap)), this.yaw = (e % 360 + 360) % 360, this.pitch = Math.max(-90, Math.min(90, t)), this.dispatchEvent(new CustomEvent("al-orientation-change", {
			detail: {
				yaw: this.yaw,
				pitch: this.pitch
			},
			bubbles: !0,
			composed: !0
		})));
	}
	aim(e) {
		let t = e.currentTarget.getBoundingClientRect(), n = e.clientX - t.left - t.width / 2, r = t.top + t.height / 2 - e.clientY;
		Math.hypot(n, r) < 4 || this.change(Math.round(Math.atan2(r, n) * 180 / Math.PI), this.pitch);
	}
	start(e) {
		this.disabled || e.button !== 0 || this.pointer !== void 0 || (e.preventDefault(), this.pointer = e.pointerId, this.aiming = !0, e.currentTarget.setPointerCapture(e.pointerId), this.aim(e));
	}
	finish(e) {
		if (this.pointer !== e.pointerId) return;
		let t = e.currentTarget;
		this.pointer = void 0, this.aiming = !1, t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId);
	}
	key(e) {
		if (this.disabled) return;
		let t = this.snap || (e.shiftKey ? 15 : 1);
		e.key === "ArrowLeft" || e.key === "ArrowRight" ? (e.preventDefault(), this.change(this.yaw + (e.key === "ArrowLeft" ? t : -t), this.pitch)) : e.key === "ArrowUp" || e.key === "ArrowDown" ? (e.preventDefault(), this.change(this.yaw, this.pitch + (e.key === "ArrowUp" ? t : -t))) : e.key === "Home" && (e.preventDefault(), this.change(0, 0));
	}
	render() {
		let e = this.yaw * Math.PI / 180, t = 66 + 42 * Math.cos(e), n = 66 - 42 * Math.sin(e);
		return h`<label>Snap <select aria-label="Aim snap" .value=${String(this.snap)} @change=${(e) => {
			this.snap = Number(e.target.value), this.dispatchEvent(new CustomEvent("al-aim-snap", {
				detail: this.snap,
				bubbles: !0,
				composed: !0
			}));
		}}><option value="0">Free</option><option value="15">15°</option><option value="45">45°</option></select></label><div class="controls">
      <svg viewBox="0 0 132 132" role="slider" tabindex=${this.disabled ? -1 : 0}
        aria-label="Sensor direction" aria-valuemin="0" aria-valuemax="359" aria-valuenow=${Math.round(this.yaw)}
        aria-valuetext=${`${Math.round(this.yaw)} degrees; tilt ${Math.round(this.pitch)} degrees`}
        aria-disabled=${this.disabled ? "true" : "false"} class=${this.aiming ? "active" : ""}
        @pointerdown=${this.start} @pointermove=${(e) => {
			e.pointerId === this.pointer && this.aim(e);
		}}
        @pointerup=${this.finish} @pointercancel=${this.finish} @lostpointercapture=${this.finish} @keydown=${this.key}>
        <circle cx="66" cy="66" r="62" />
        <text x="66" y="16">90°</text><text x="117" y="70">0°</text>
        <text x="66" y="124">270°</text><text x="18" y="70">180°</text>
        <line x1="66" y1="66" x2=${t} y2=${n} /><circle class="tip" cx=${t} cy=${n} r="5" />
      </svg>
      <div class="buttons">
        <div class="row"><button aria-label="Decrease direction" ?disabled=${this.disabled} @click=${() => this.change(this.yaw - (this.snap || 5), this.pitch)}>−</button>
          <output>Yaw ${Math.round(this.yaw)}°</output><button aria-label="Increase direction" ?disabled=${this.disabled} @click=${() => this.change(this.yaw + (this.snap || 5), this.pitch)}>+</button></div>
        <div class="row"><button aria-label="Tilt down" ?disabled=${this.disabled} @click=${() => this.change(this.yaw, this.pitch - (this.snap || 5))}>−</button>
          <output>Tilt ${Math.round(this.pitch)}°</output><button aria-label="Tilt up" ?disabled=${this.disabled} @click=${() => this.change(this.yaw, this.pitch + (this.snap || 5))}>+</button></div>
        <button ?disabled=${this.disabled} @click=${() => this.change(0, 0)}>Reset aim</button>
      </div>
    </div><p role="status">${this.aiming ? "Aiming — drag to rotate" : "Drag the dial to aim. Arrow keys adjust direction and tilt; Shift makes larger steps."}</p>`;
	}
};
_([b({ type: Number })], Ls.prototype, "yaw", void 0), _([b({ type: Number })], Ls.prototype, "pitch", void 0), _([b({ type: Boolean })], Ls.prototype, "disabled", void 0), _([b({ type: Number })], Ls.prototype, "snap", void 0), _([m()], Ls.prototype, "aiming", void 0), Ls = _([S("al-orientation-control")], Ls);
//#endregion
//#region src/sensor-catalog.ts
var Rs = "https://www.sourcesecurity.com/datasheets/bosch-isc-bpr2-w12-chi-intruder-detector/co-289-ga/BlueLine_Gen_2_Data_sheet_enUS_2603228171.pdf", zs = [{
	id: "community:screek-2a",
	name: "SCREEK Human Sensor 2A · identification starter",
	kind: "occupancy",
	fov: 60,
	vertical_fov: 45,
	range: 0,
	technology: "ESPHome / LD2450",
	mount: "",
	match: {},
	notes: "Choose the Any Presence binary sensor for whole-device presence. Zone-specific sensors may be appropriate for a configured radar zone. Confirm the 2A model on the enclosure: ESPHome project metadata can be shared across models. Coverage starts hidden; the angles are editor defaults, not verified hardware specifications. Set your coverage once and save a personal profile.",
	source: "https://github.com/screekworkshop/screek-human-sensor/blob/main/2a/yaml/human-sensor-2a-stable-github.yaml"
}, ...[
	{
		id: "community:bosch-isc-bpr2-w12",
		name: "Bosch ISC-BPR2-W12 · non-pet",
		model: "ISC-BPR2-W12",
		mode: "The W12 is the non-pet model; selectable pet immunity requires the WP12."
	},
	{
		id: "community:bosch-isc-bpr2-wp12-pet-off",
		name: "Bosch ISC-BPR2-WP12 · pet immunity OFF",
		model: "ISC-BPR2-WP12",
		mode: "Use with hardware pet immunity OFF. Bosch specifies the same performance as the non-pet model. Choosing this profile does not change the detector's hardware setting."
	},
	{
		id: "community:bosch-isc-bpr2-wp12-pet-on",
		name: "Bosch ISC-BPR2-WP12 · pet immunity ON",
		model: "ISC-BPR2-WP12",
		mode: "Use with hardware pet immunity ON. Bosch rates pet immunity up to 20 kg (45 lb), subject to its installation instructions. Nominal coverage remains the same; this is not a smaller detection cone. Choosing this profile does not change the detector's hardware setting."
	}
].map(({ id: e, name: t, model: n, mode: r }) => ({
	id: e,
	name: t,
	coverage_shape: "fan",
	look_down: !0,
	kind: "motion",
	fov: 94,
	vertical_fov: 75,
	range: 12,
	technology: "Wired PIR / NC alarm relay",
	mount: "Wall / corner",
	match: {
		manufacturer: "Bosch",
		model: n
	},
	notes: r + " Bosch specifies 12 m × 12 m coverage; the coverage diagram shows a 94° horizontal spread. Mount level on a wall or in a corner, 2.2–2.75 m above the floor; set your actual height and aim separately. The fan extends downward 75° from its level top as an illustrative envelope, not a Bosch-specified vertical angle. The overlay approximates the footprint, not the individual segmented PIR beams or a pet exclusion volume. A separate look-down lobe is an illustrative near-floor approximation: confirm the physical look-down lens setting and toggle it to match your installation. Select the alarm/motion binary sensor, not tamper. Wired alarm/ESPHome bridges may expose their own manufacturer and model, so confirm the label and select this profile manually when needed. ",
	source: Rs
}))], X = class extends p {
	constructor(...e) {
		super(...e), this.neighbors = [], this.mode = "place", this.disabled = !1, this.minimal = !1, this.unit = "m", this.aimingHandle = !1, this.error = "", this.movingMarker = !1, this.dragged = !1, this.suppressClick = !1;
	}
	static {
		this.styles = T`
    :host { display:block; min-width:0; } svg { width:100%; height:var(--room-plan-height,clamp(320px,48vh,550px)); display:block; background:radial-gradient(#203b4b,#102330); border:1px solid #4c7186; border-radius:12px; touch-action:none; }
    svg.aiming { cursor:crosshair; border-color:#ffcd69; box-shadow:0 0 0 2px #ffcd69; }
    .outline { fill:#2b536177; stroke:#8ed9ea; stroke-width:2; vector-effect:non-scaling-stroke; }
    .marker { fill:#8ed9ea; stroke:#102330; stroke-width:2; vector-effect:non-scaling-stroke; cursor:grab; }
    .selected { fill:#ffcd69; } .marker:focus, .opening-marker:focus { stroke:white; stroke-width:2; vector-effect:non-scaling-stroke; outline:none; }
    .coverage { fill:#ffcd6929; stroke:#ffcd6988; vector-effect:non-scaling-stroke; }
    .coverage, .aim, text { pointer-events:none; }
    .neighbor:focus { stroke:white;stroke-width:2;vector-effect:non-scaling-stroke; }
    .aim { stroke:#ffcd69; stroke-width:2; vector-effect:non-scaling-stroke; }
    [hidden] { display:none!important; }
    p { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f77); }
  `;
	}
	beginDrag(e) {
		this.drag = e.pointerId, this.dragged = !1, this.dragStart = [e.clientX, e.clientY], this.renderRoot.querySelector("svg").setPointerCapture(e.pointerId);
	}
	selectPlan(e, t) {
		this.disabled || this.emit("al-plan-select", {
			room: e,
			opening: t
		});
	}
	emit(e, t) {
		this.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	}
	point(e) {
		let t = this.renderRoot.querySelector("svg"), n = t?.getScreenCTM();
		if (!t || !n) return;
		let r = new DOMPoint(e.clientX, e.clientY).matrixTransform(n.inverse());
		return [r.x, -r.y];
	}
	place(e) {
		if (this.disabled || !this.fixture?.entity && !this.opening || !this.group) return;
		let t = this.point(e);
		if (!t) return;
		if (this.error = "", this.opening && this.resizeSide) {
			this.emit("al-opening-resize", i(this.opening, this.resizeSide, t));
			return;
		}
		if (this.opening) {
			this.emit("al-opening-position", [
				t[0],
				t[1],
				this.opening.position[2]
			]);
			return;
		}
		if (!this.fixture) return;
		if ((this.aimingHandle || this.mode === "aim") && this.fixture.kind !== "window" && !this.movingMarker) {
			let [e, n] = this.fixture.position;
			Math.hypot(t[0] - e, t[1] - n) > .001 && this.emit("al-fixture-aim", Math.atan2(t[1] - n, t[0] - e) * 180 / Math.PI);
			return;
		}
		let n = [
			Number(t[0].toFixed(3)),
			Number(t[1].toFixed(3)),
			this.fixture.position[2]
		];
		if (this.fixture.kind === "window") {
			this.emit("al-fixture-position", Qe(this.group, n, this.fixture.width).position);
			return;
		}
		if (!Ge(this.group, n)) {
			this.error = "Choose a point inside the room outline.";
			return;
		}
		this.emit("al-fixture-position", n);
	}
	render() {
		let e = this.group, t = e?.bounds;
		if (!e || !t) return g;
		let n = q(e), r = t[1][0] - t[0][0], i = t[1][1] - t[0][1], a = Math.max(r, i) * (this.neighbors.length > 1 ? .65 : .12), o = Math.max(r, i) * .018, s = [...(e.fixtures ?? []).filter((e) => e.entity !== this.fixture?.entity), ...this.fixture?.entity ? [this.fixture] : []], c = this.fixture, l = g;
		if (c?.entity && c.range > 0 && (c.kind === "motion" || c.kind === "occupancy") && Number.isFinite(c.yaw) && Number.isFinite(c.fov)) {
			let t = vt(c, (this.neighbors.length ? this.neighbors : [e]).filter((e) => e.bounds).map((e) => ({
				id: e.id,
				footprint: q(e),
				low: e.bounds[0][2],
				high: e.bounds[1][2],
				openings: e.openings
			})), this.hass?.states), n = Xe(c.kind, this.hass?.states[c.entity]?.state);
			l = C`<polygon class="coverage" style=${`fill:${n.color};fill-opacity:${n.opacity};stroke:${n.color};stroke-dasharray:4 4`} points=${t.map(([e, t]) => `${e},${-t}`).join(" ")} />`;
		}
		return h`<svg viewBox=${`${t[0][0] - a} ${-t[1][1] - a} ${r + a * 2} ${i + a * 2}`} aria-label="Top-down room placement" role="group" class=${this.aimingHandle || this.mode === "aim" ? "aiming" : ""}
      @pointerdown=${(e) => {
			this.disabled || e.button !== 0 || this.opening || this.fixture?.kind === "window" || (this.movingMarker = !1, this.beginDrag(e), this.place(e));
		}}
      @click=${(e) => {
			if (this.suppressClick) {
				this.suppressClick = !1;
				return;
			}
			!this.opening && this.fixture?.kind !== "window" && this.place(e);
		}}
      @pointermove=${(e) => {
			if (this.drag === e.pointerId) {
				if (!this.dragged && this.dragStart && Math.hypot(e.clientX - this.dragStart[0], e.clientY - this.dragStart[1]) < 4) return;
				this.dragged = !0, this.place(e);
			}
		}}
      @pointerup=${() => {
			this.suppressClick = this.dragged || this.aimingHandle || !!this.resizeSide, this.resizeSide = void 0, this.aimingHandle = !1, this.drag = void 0, this.dragged = !1, this.movingMarker = !1;
		}}
      @pointercancel=${() => {
			this.aimingHandle = !1, this.resizeSide = void 0, this.drag = void 0, this.dragged = !1, this.movingMarker = !1;
		}}>
      ${this.neighbors.filter((t) => t.id !== e.id && t.bounds).map((e) => C`<polygon class="neighbor" role="button" tabindex=${this.disabled ? -1 : 0} aria-label=${`Select room ${e.name || e.id}`} style="outline:none;cursor:pointer" @pointerdown=${(e) => e.stopPropagation()} @click=${(t) => {
			t.stopPropagation(), this.selectPlan(e.id);
		}} @keydown=${(t) => {
			["Enter", " "].includes(t.key) && (t.preventDefault(), this.selectPlan(e.id));
		}} fill="#25374444" stroke="#607584" stroke-width="1" vector-effect="non-scaling-stroke" points=${q(e).map(([e, t]) => `${e},${-t}`).join(" ")}/><text style="pointer-events:none" fill="#94acb7" text-anchor="middle" font-size=${o * 1.8} x=${(e.bounds[0][0] + e.bounds[1][0]) / 2} y=${-(e.bounds[0][1] + e.bounds[1][1]) / 2}>${e.name || e.id}</text>`)}
      <polygon class="outline" points=${n.map(([e, t]) => `${e},${-t}`).join(" ")} />
      ${l}
      ${(this.neighbors.length ? this.neighbors : [e]).flatMap((e) => (e.openings ?? []).filter((e) => e.id !== this.opening?.id).map((t) => ({
			g: e,
			o: t
		}))).concat(this.opening ? [{
			g: e,
			o: this.opening
		}] : []).map(({ g: t, o: n }) => {
			let r = Te(t, n), i = mt(n, this.hass?.states ?? {}), a = !r || i === "on" ? "#ff3535" : i === "unknown" ? "#7a8790" : "#53b6ce", s = De(t, n), c = ct(n, this.hass?.states ?? {}) ? s.open : s.closed, l = Math.atan2(s.closed[1] - s.hinge[1], s.closed[0] - s.hinge[0]), u = Math.atan2(s.open[1] - s.hinge[1], s.open[0] - s.hinge[0]), d = Math.atan2(Math.sin(u - l), Math.cos(u - l)), f = Array.from({ length: 17 }, (e, t) => `${s.hinge[0] + n.width * Math.cos(l + d * t / 16)},${-s.hinge[1] - n.width * Math.sin(l + d * t / 16)}`).join(" ");
			return C`<g @pointerdown=${(r) => {
				r.stopPropagation(), !(this.disabled || r.button !== 0) && t.id === e.id && (this.emit("al-opening-select", n.id), this.beginDrag(r));
			}} @click=${(e) => {
				e.stopPropagation(), this.dragged || this.selectPlan(t.id, n.id);
			}}><line x1=${s.hinge[0]} y1=${-s.hinge[1]} x2=${s.closed[0]} y2=${-s.closed[1]} stroke="#102330" stroke-width="8" vector-effect="non-scaling-stroke"/>
          <line x1=${s.hinge[0]} y1=${-s.hinge[1]} x2=${n.kind === "open_wall" ? s.closed[0] : c[0]} y2=${-(n.kind === "open_wall" ? s.closed[1] : c[1])} stroke=${a} stroke-width="3" stroke-dasharray=${n.kind === "open_wall" ? "4 4" : "none"} vector-effect="non-scaling-stroke"/>
          ${n.kind !== "open_wall" && n.kind !== "window" ? C`<polyline points=${f} fill="none" stroke=${a} stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>` : g}
          ${t.id === e.id ? C`<circle class="opening-marker" cx=${n.position[0]} cy=${-n.position[1]} r=${o} fill=${a} role="button" tabindex=${this.disabled ? -1 : 0} aria-label=${`Select ${n.name || n.kind}`} @pointerdown=${(e) => {
				this.disabled || (e.stopPropagation(), this.emit("al-opening-select", n.id), this.beginDrag(e));
			}} @click=${(e) => {
				e.stopPropagation(), this.disabled || this.emit("al-opening-select", n.id);
			}} @keydown=${(e) => {
				!this.disabled && ["Enter", " "].includes(e.key) && (e.preventDefault(), this.emit("al-opening-select", n.id));
			}}/>` : g}</g>`;
		})}
      ${s.filter((e) => e.position.every(Number.isFinite)).map((t) => C`<g>
        ${t.kind === "window" ? C`<line class="window" stroke=${qe(e, t) ? Xe(t.kind, this.hass?.states[t.entity]?.state).color : "#ff3535"} stroke-width="7" vector-effect="non-scaling-stroke"
          x1=${t.position[0] - (t.width ?? 1) / 2 * Math.cos(t.yaw * Math.PI / 180)} y1=${-t.position[1] + (t.width ?? 1) / 2 * Math.sin(t.yaw * Math.PI / 180)}
          x2=${t.position[0] + (t.width ?? 1) / 2 * Math.cos(t.yaw * Math.PI / 180)} y2=${-t.position[1] - (t.width ?? 1) / 2 * Math.sin(t.yaw * Math.PI / 180)}/>` : g}
        <circle class=${`marker ${t.entity === c?.entity ? "selected" : ""}`} cx=${t.position[0]} cy=${-t.position[1]} r=${o} role="button" tabindex=${this.disabled ? -1 : 0} aria-label=${`Select ${t.name || t.entity}`}
          @pointerdown=${(e) => {
			this.disabled || e.button !== 0 || (e.stopPropagation(), this.emit("al-fixture-select", t.entity), this.movingMarker = !0, this.beginDrag(e));
		}}
          @click=${(e) => {
			e.stopPropagation(), this.disabled || this.emit("al-fixture-select", t.entity);
		}}
          @keydown=${(e) => {
			!this.disabled && ["Enter", " "].includes(e.key) && (e.preventDefault(), this.emit("al-fixture-select", t.entity));
		}}><title>${t.name || t.entity}</title></circle>
        ${t.entity === c?.entity && t.kind !== "window" ? C`<line class="aim" x1=${t.position[0]} y1=${-t.position[1]} x2=${t.position[0] + o * 5 * Math.cos(t.yaw * Math.PI / 180)} y2=${-t.position[1] - o * 5 * Math.sin(t.yaw * Math.PI / 180)}/>` : g}
      </g>`)}
      ${this.opening ? C`<g>${[-1, 1].map((e) => C`<circle class="marker selected" cx=${this.opening.position[0] + e * this.opening.width / 2 * Math.cos(this.opening.yaw * Math.PI / 180)} cy=${-this.opening.position[1] - e * this.opening.width / 2 * Math.sin(this.opening.yaw * Math.PI / 180)} r=${o} aria-label=${e < 0 ? "Resize opening start" : "Resize opening end"} @pointerdown=${(t) => {
			this.disabled || t.button !== 0 || (t.stopPropagation(), this.resizeSide = e, this.beginDrag(t));
		}} @click=${(e) => e.stopPropagation()}/>`)}<text x=${this.opening.position[0]} y=${-this.opening.position[1] - o * 3} fill="#d8edf2" font-size=${o * 2} text-anchor="middle">${Is(this.opening.width, this.unit)}</text></g>` : g}
      ${c?.entity && !this.opening && ["motion", "occupancy"].includes(c.kind) ? C`<circle class="marker selected" role="button" tabindex=${this.disabled ? -1 : 0} aria-label="Aim sensor" cx=${c.position[0] + o * 5 * Math.cos(c.yaw * Math.PI / 180)} cy=${-c.position[1] - o * 5 * Math.sin(c.yaw * Math.PI / 180)} r=${o * .75}
        @pointerdown=${(e) => {
			this.disabled || e.button !== 0 || (e.stopPropagation(), this.aimingHandle = !0, this.movingMarker = !1, this.beginDrag(e));
		}}
        @click=${(e) => e.stopPropagation()}
        @keydown=${(e) => {
			!this.disabled && ["ArrowLeft", "ArrowRight"].includes(e.key) && (e.preventDefault(), this.emit("al-fixture-aim", c.yaw + (e.key === "ArrowLeft" ? 1 : -1) * (e.shiftKey ? 15 : 1)));
		}}><title>Drag to aim</title></circle>` : g}
    </svg><p ?hidden=${this.minimal}>${this.opening ? "Drag the opening or its marker to move it; drag either end to resize" : this.fixture?.entity ? this.fixture.kind === "window" ? "Click near a wall to place a window · drag its marker to move it" : this.mode === "place" ? "Click to place · drag a marker to move it · select Aim to set direction" : "AIM MODE — press and drag toward the direction the sensor faces" : "Select a device to start placing it."} · Top = +Y</p>
    ${this.error ? h`<p class="error" role="alert">${this.error}</p>` : g}`;
	}
};
_([b({ attribute: !1 })], X.prototype, "hass", void 0), _([b({ attribute: !1 })], X.prototype, "group", void 0), _([b({ attribute: !1 })], X.prototype, "neighbors", void 0), _([b({ attribute: !1 })], X.prototype, "opening", void 0), _([b({ attribute: !1 })], X.prototype, "fixture", void 0), _([b({ type: String })], X.prototype, "mode", void 0), _([b({ type: Boolean })], X.prototype, "disabled", void 0), _([b({ type: Boolean })], X.prototype, "minimal", void 0), _([b({ type: String })], X.prototype, "unit", void 0), _([m()], X.prototype, "aimingHandle", void 0), _([m()], X.prototype, "error", void 0), X = _([S("al-room-plan")], X);
//#endregion
//#region src/al-wall-elevation.ts
var Bs = class extends p {
	constructor(...e) {
		super(...e), this.unit = "m", this.disabled = !1;
	}
	static {
		this.styles = T`
    :host {
      display: block;
      height: 100%;
    }
    svg {
      width: 100%;
      height: 100%;
      touch-action: none;
      background: #112632;
      border: 1px solid #446779;
    }
    rect {
      fill: #45657433;
      stroke: #8ac9d4;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .grip {
      fill: #ffcd69;
      cursor: grab;
    }
    text {
      fill: #d8edf2;
      font-size: 0.14px;
      text-anchor: middle;
    }
    .opening {
      fill: #7ad1d633;
      stroke: #7ad1d6;
      cursor: move;
    }
  `;
	}
	point(e) {
		let t = this.renderRoot.querySelector("svg")?.getScreenCTM();
		if (!t) return;
		let n = new DOMPoint(e.clientX, e.clientY).matrixTransform(t.inverse());
		return [n.x, -n.y];
	}
	start(e, t) {
		if (this.disabled || !this.opening) return;
		e.preventDefault();
		let n = this.point(e);
		n && (this.drag = {
			pointer: e.pointerId,
			kind: t,
			x: n[0],
			z: n[1],
			opening: structuredClone(this.opening)
		}, this.renderRoot.querySelector("svg").setPointerCapture(e.pointerId));
	}
	move(e) {
		let t = this.drag, n = t?.opening, r = this.group, a = this.point(e);
		if (this.disabled || !t || t.pointer !== e.pointerId || !n || !r || !a) return;
		let o = ft(r, n);
		if (!o) return;
		let s;
		if (t.kind === "move") s = { position: [
			n.position[0] + (a[0] - t.x) * o.dx,
			n.position[1] + (a[0] - t.x) * o.dy,
			n.position[2] + a[1] - t.z
		] };
		else if (t.kind === "left" || t.kind === "right") {
			let e = t.kind === "left" ? -1 : 1, r = Math.cos(n.yaw * Math.PI / 180) * o.dx + Math.sin(n.yaw * Math.PI / 180) * o.dy;
			s = i(n, e * (r >= 0 ? 1 : -1), [o.a[0] + a[0] * o.dx, o.a[1] + a[0] * o.dy]);
		} else if (t.kind === "top") s = { height: Math.max(.1, a[1] - n.position[2]) };
		else {
			let e = Math.min(n.position[2] + n.height - .1, a[1]);
			s = {
				height: n.position[2] + n.height - e,
				position: [
					n.position[0],
					n.position[1],
					e
				]
			};
		}
		this.dispatchEvent(new CustomEvent("al-opening-resize", {
			detail: s,
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		let e = this.opening, t = this.group;
		if (!e || !t?.bounds) return g;
		let n = ft(t, e);
		if (!n) return h`Select an opening aligned with a wall.`;
		let r = (e.position[0] - n.a[0]) * n.dx + (e.position[1] - n.a[1]) * n.dy, i = e.position[2], a = t.bounds[0][2], o = t.bounds[1][2];
		return h`<svg
      aria-label="Wall elevation"
      viewBox=${`-.4 ${-o - .4} ${n.length + .8} ${o - a + .8}`}
      @pointermove=${this.move}
      @pointerup=${() => {
			this.drag = void 0;
		}}
      @pointercancel=${() => {
			this.drag = void 0;
		}}
    >
      <rect x="0" y=${-o} width=${n.length} height=${o - a} />
      <rect
        style=${Te(t, e) ? "" : "stroke:#ff5e52;fill:#ff5e5233"}
        class="opening"
        x=${r - e.width / 2}
        y=${-i - e.height}
        width=${e.width}
        height=${e.height}
        @pointerdown=${(e) => this.start(e, "move")}
      />
      ${[
			[
				"left",
				r - e.width / 2,
				-i - e.height / 2
			],
			[
				"right",
				r + e.width / 2,
				-i - e.height / 2
			],
			[
				"top",
				r,
				-i - e.height
			],
			[
				"bottom",
				r,
				-i
			]
		].map(([e, t, n]) => C`<circle class="grip" cx=${t} cy=${n} r=".06" aria-label=${`Resize ${e}`} @pointerdown=${(t) => this.start(t, e)}/>`)}
      <text x=${r} y=${-i - e.height - .15}>
        ${Is(e.width, this.unit)}
      </text>
      <text x=${(r - e.width / 2) / 2} y=${-a + .2}>
        ${Is(r - e.width / 2, this.unit)}
      </text>
      <text x=${r + e.width / 2 + .3} y=${-i - e.height / 2}>
        ${Is(e.height, this.unit)}
      </text>
    </svg>`;
	}
};
_([b({ attribute: !1 })], Bs.prototype, "group", void 0), _([b({ attribute: !1 })], Bs.prototype, "opening", void 0), _([b({ type: String })], Bs.prototype, "unit", void 0), _([b({ type: Boolean })], Bs.prototype, "disabled", void 0), Bs = _([S("al-wall-elevation")], Bs);
//#endregion
//#region src/al-room-device-editor.ts
var Z = class extends p {
	constructor(...e) {
		super(...e), this.workspace = !1, this.section = "all", this.wallView = !1, this.aimSnap = 0, this.information = !1, this.adding = !1, this.profilesPage = !1, this.lights = {}, this.live = null, this.disabled = !1, this.room = "", this.unitChoice = "auto", this.contactSearch = "", this.allContacts = !1, this.addKind = "", this.fixture = ot(), this.mode = "place", this.error = "", this.notice = "", this.registry = [], this.registryError = "", this.loading = !1, this.search = "", this.profile = "", this.profileName = "", this.profileText = "", this.sequence = 0, this.previewError = "";
	}
	static {
		this.styles = T`
    :host { display:block; } fieldset { border:0; padding:0; margin:0; min-width:0; }
    .workspace { position:relative; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); min-height:760px; border:1px solid #425461; border-radius:12px; overflow:hidden; background:#13232e; }
    .scene-pane { min-width:0; height:760px; } .scene-pane al-floorplan-viewer { height:100%; }
    .plan-pane { align-self:center; padding:20px; min-width:0; }
    .editor-controls { position:absolute; top:16px; left:16px; width:250px; max-width:23%; max-height:calc(100% - 32px); overflow:auto; box-sizing:border-box; padding:14px; background:#112531ed; border:1px solid #4c7186; border-left:3px solid #7edbec; border-radius:12px 12px 0 12px; }
    .editor-controls select,.editor-controls input:not([type=number]) { width:100%; min-width:0; } .editor-controls label { min-width:0; } .editor-controls .fields { display:block; }
    .editor-controls .devices { max-height:150px; }
    .fields { display:flex; flex-wrap:wrap; gap:12px; } label { display:flex; flex-direction:column; gap:4px; margin:6px 0; }
    input,select,button,textarea { font:inherit; padding:8px; color:var(--primary-text-color); background:var(--card-background-color,white); border:1px solid var(--divider-color,#888); border-radius:6px; box-sizing:border-box; }
    button { cursor:pointer; margin:6px 8px 6px 0; } button:disabled { opacity:.5; cursor:default; }
    button[aria-pressed=true] { border-color:var(--primary-color,#6edbec); background:var(--secondary-background-color,#304b60); }
    input[type=number] { width:110px; } .muted { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f66); }
    .devices { max-height:300px; overflow:auto; } .device { display:block; width:100%; text-align:left; margin:4px 0; overflow-wrap:anywhere; }
    .device small { display:block; } details { margin:16px 0; } summary { cursor:pointer; padding:8px 0; }
    textarea { width:100%; min-height:100px; } .status { min-height:20px; } h3 { margin:8px 0; }
    @media(max-width:1100px) { .workspace { display:flex; flex-direction:column; } .editor-controls { position:static; order:-1; width:auto; max-width:none; max-height:420px; margin:12px; } .scene-pane { height:450px; } .plan-pane { width:100%; box-sizing:border-box; } }
    [hidden] { display:none !important; }
    :host([workspace]) { height:100%; font-size:12px; color:#d8edf2; }
    :host([workspace]) fieldset, :host([workspace]) .workspace { height:100%; min-height:0; }
    :host([workspace]) .workspace { display:grid; grid-template-columns:58% 42%; border:0; border-radius:0; }
    :host([workspace]) .scene-pane { height:100%; }
    :host([workspace]) .plan-pane { height:100%; box-sizing:border-box; padding:66px 12px 12px; --room-plan-height:calc(100% - 1px); }
    :host([workspace]) .plan-pane > div, :host([workspace]) al-room-plan, :host([workspace]) al-wall-elevation { height:100%; }
    :host([workspace]) .plan-pane h3 { font-size:12px; text-transform:uppercase; letter-spacing:.15em; margin:0 0 8px; }
    :host([workspace]) .editor-controls { position:absolute; top:60px; left:62px; width:260px; max-width:none; max-height:calc(100% - 78px); margin:0; padding:10px; border-radius:8px; background:#102633f2; }
    :host([workspace]) button, :host([workspace]) select, :host([workspace]) input, :host([workspace]) textarea { padding:4px 6px; font-size:12px; border-radius:3px; background:#163140; border-color:#355365; }
    :host([workspace]) button { margin:3px 3px 3px 0; min-height:28px; }
    :host([workspace]) details { margin:4px 0; } :host([workspace]) summary { padding:5px 0; }
    :host([workspace]) label { margin:5px 0; } :host([workspace]) .muted { font-size:11px; }
    :host([workspace]) .device { background:transparent; border-color:transparent; padding:5px 4px; margin:0; }
    :host([workspace]) .device:hover { background:#244652; } :host([workspace]) .device small { font-size:10px; color:#91adba; }
    :host([workspace]) .editor-controls input[type=checkbox] { width:auto; }
    :host([workspace]) label.check, .check { display:flex; flex-direction:row; align-items:center; gap:6px; }
    .device-information { position:absolute; z-index:6; top:60px; left:340px; width:280px; max-height:calc(100% - 90px); overflow:auto; padding:12px; background:#102633f5; border:1px solid #80ddeb; border-radius:8px; font-size:12px; }
    .device-information header { display:flex; justify-content:space-between; align-items:center; }
    @media(max-width:760px){.device-information{left:76px;right:12px;width:auto;}}
    .view-toggle { display:none; }
    .page-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:8px 0; }
    .page-heading h3 { font-size:14px; margin:0; }
    .room-tools { display:grid; grid-template-columns:minmax(0,1fr) 95px; align-items:center; gap:5px; } .room-tools > label:first-child { flex:1; }
    .room-tools label { min-width:0; } .room-tools select { width:100%; }
    :host([workspace]) .status:empty { display:none; }
    @media(pointer:coarse) { :host([workspace]) button, :host([workspace]) select, :host([workspace]) input:not([type=checkbox]) { min-height:44px; font-size:14px; } :host([workspace]) .editor-controls { left:76px; } }
    @media(max-width:760px) { .view-toggle { display:inline-block; } :host([workspace]) .workspace { grid-template-columns:100%; } :host([workspace]) .scene-pane { height:100%; } :host([workspace]) .plan-pane { display:none; } :host([workspace][plan-view]) .scene-pane { display:none; } :host([workspace][plan-view]) .plan-pane { display:block; } :host([workspace]) .editor-controls { top:60px; width:230px; max-height:42%; } }

  `;
	}
	get unit() {
		return this.unitChoice === "auto" ? Ns(this.hass) : this.unitChoice;
	}
	length(e) {
		return Is(e, this.unit);
	}
	validLengths() {
		let e = this.renderRoot.querySelector("input[data-length]:invalid");
		return !e || (e.reportValidity(), !1);
	}
	lengthInput(e, t, n, r = -Infinity, i = Infinity, a = "", o = "") {
		let s = (e) => {
			let t = Fs(e.value, this.unit);
			return e.setCustomValidity(t === null ? "Enter a length, such as 2.5, 2′6″, or 30″." : t < r || t > i ? "Length is outside the allowed range." : ""), t;
		};
		return Es(JSON.stringify([
			this.room,
			this.fixture.entity,
			this.opening?.id,
			this.unit
		]), h`<input type="text" data-length aria-label=${e} id=${a} data-field=${o} .value=${this.length(t)}
      @input=${(e) => s(e.target)}
      @change=${(e) => {
			let t = e.target, r = s(t);
			t.reportValidity() && r !== null && (n(r), t.value = this.length(r));
		}}>`);
	}
	get group() {
		return this.config && D(this.config).find((e) => e.group.id === this.room)?.group;
	}
	get candidates() {
		return this.config ? Ms(this.config, this.room, this.registry, this.hass, this.live) : [];
	}
	get profiles() {
		return [...this.config?.sensor_profiles ?? [], ...zs];
	}
	willUpdate(e) {
		if ((e.has("room") || e.has("section")) && this.reset(), this.config && [
			"config",
			"fixture",
			"room",
			"original",
			"opening",
			"originalOpening"
		].some((t) => e.has(t))) {
			let e = this.opening ? this.openingConfig() : this.config;
			this.previewError = "";
			try {
				this.opening ? e = ut(this.openingConfig(), this.room, this.opening, this.originalOpening) : this.fixture.entity && (e = Ne(this.config, this.room, this.fixture, this.original));
			} catch (t) {
				this.previewError = t.message;
				let n = this.opening && ge(this.opening), r = Ae(this.fixture);
				if (n || r) {
					e = structuredClone(this.opening ? this.openingConfig() : this.config);
					let t = D(e).find((e) => e.group.id === this.room)?.group;
					t && n ? t.openings = [...(t.openings ?? []).filter((e) => e.id !== (this.originalOpening ?? n.id)), n] : t && r && (t.fixtures = [...(t.fixtures ?? []).filter((e) => e.entity !== (this.original ?? r.entity)), r]);
				}
			}
			this.preview = e;
		}
	}
	updated(e) {
		this.room && (e.has("room") || e.has("hass") || e.has("disabled")) && this.hass?.callWS !== this.loadedFor && !this.disabled && this.loadDevices();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.sequence++, this.loadedFor = void 0, this.loading = !1;
	}
	connectedCallback() {
		super.connectedCallback(), this.room && this.hass && !this.disabled && this.loadDevices();
	}
	async loadDevices() {
		if (!this.hass || this.disabled || this.loading) return;
		let e = ++this.sequence;
		this.loadedFor = this.hass.callWS, this.loading = !0, this.registryError = "", this.registry = [];
		try {
			let t = await this.hass.callWS({ type: "activity_levels/floorplan/devices" });
			if (e !== this.sequence) return;
			if (!Array.isArray(t)) throw Error("Invalid device registry response.");
			this.registry = t;
		} catch (t) {
			e === this.sequence && (this.registryError = `Could not load room devices: ${t.message}. Configured inputs and saved placements remain available.`);
		} finally {
			e === this.sequence && (this.loading = !1);
		}
	}
	reset() {
		this.wallView = !1, this.information = !1, this.adding = !1, this.profilesPage = !1, this.legacyWindow = void 0, this.addKind = "", this.fixture = {
			...ot(),
			position: this.group ? ke(this.group) : [
				0,
				0,
				0
			]
		}, this.opening = void 0, this.originalOpening = void 0, this.original = void 0, this.error = "", this.notice = "", this.mode = "place", this.profile = "", this.profileName = "", this.search = "";
	}
	select(e) {
		if (this.disabled || e === this.fixture.entity && !this.opening) return;
		this.opening = void 0, this.originalOpening = void 0, this.legacyWindow = void 0;
		let t = this.group?.fixtures?.find((t) => t.entity === e);
		if (t?.kind === "window") {
			this.editLegacyWindow(t);
			return;
		}
		if (t) this.fixture = structuredClone(t), this.original = e, this.profile = t.profile_id ?? "";
		else {
			let t = this.candidates.find((t) => t.entity === e);
			if (!t) return;
			let n = this.group ? ke(this.group) : [
				0,
				0,
				0
			], r = this.addKind || (e.startsWith("light.") ? "light" : t.device_class === "window" || t.device_class === "opening" ? "window" : t.device_class === "occupancy" || t.device_class === "presence" ? "occupancy" : "motion");
			if (r === "window") {
				this.editOpening(void 0, "window"), this.patchOpening({
					entities: [e],
					name: t.name
				});
				return;
			}
			this.fixture = {
				...ot(e, r),
				position: n,
				name: t.name
			}, this.original = void 0, this.profile = "";
		}
		if (this.fixture.kind === "window" && this.group && (this.fixture = {
			...this.fixture,
			...Qe(this.group, this.fixture.position, this.fixture.width)
		}), !this.profile) {
			let t = this.candidates.find((t) => t.entity === e), n = t ? this.profiles.filter((e) => e.kind === "light" == (this.fixture.kind === "light") && ks(e, t)) : [];
			this.profile = n.length === 1 ? n[0].id : "";
		}
		this.addKind = "", this.error = "", this.notice = "", this.profileName = "", this.mode = "place", this.workspace && this.flushDraft();
	}
	resetDraft() {
		this.reset();
	}
	flushDraft() {
		if (this.disabled || !this.validLengths()) return !1;
		if (!this.workspace || !this.fixture.entity && !this.opening) return !0;
		try {
			let e = this.opening ? ut(this.openingConfig(), this.room, this.opening, this.originalOpening) : Ne(this.config, this.room, this.fixture, this.original);
			return JSON.stringify(e) !== JSON.stringify(this.config) && (this.config = e, this.dispatchEvent(N(e))), this.opening ? (this.originalOpening = this.opening.id, this.legacyWindow = void 0) : this.original = this.fixture.entity, this.error = "", !0;
		} catch (e) {
			return this.error = e.message, !1;
		}
	}
	patch(e) {
		this.disabled || (this.fixture = {
			...this.fixture,
			...e
		}, this.error = "", this.notice = "", this.workspace && this.flushDraft());
	}
	save() {
		if (!(!this.config || this.disabled || !this.validLengths())) try {
			this.dispatchEvent(N(Ne(this.config, this.room, this.fixture, this.original))), this.original = this.fixture.entity, this.notice = "Placement added to draft. Use Save in the panel to persist it.", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	removeFixture() {
		if (!this.config || !this.original || this.disabled) return;
		let e = structuredClone(this.config), t = D(e).find((e) => e.group.id === this.room)?.group;
		t && (t.fixtures = t.fixtures?.filter((e) => e.entity !== this.original), this.dispatchEvent(N(e)), this.reset());
	}
	useProfile() {
		let e = this.profiles.find((e) => e.id === this.profile);
		if (!(!e || this.disabled)) {
			if (e.kind === "light" !== this.fixture.entity.startsWith("light.") || e.kind === "window" != (this.fixture.kind === "window")) {
				this.error = "Choose a profile matching this entity's domain.";
				return;
			}
			this.patch(As(this.fixture, e)), this.profileName = e.name;
		}
	}
	saveProfile() {
		if (!(!this.config || this.disabled)) try {
			let e = this.candidates.find((e) => e.entity === this.fixture.entity), t = this.config.sensor_profiles?.find((e) => e.id === this.profile), n = {};
			for (let t of [
				"manufacturer",
				"model",
				"platform",
				"device_class",
				"entity_name"
			]) e?.[t] && (n[t] = e[t]);
			let r = js(JSON.stringify([{
				id: t?.id ?? `personal:${crypto.randomUUID()}`,
				name: this.profileName,
				coverage_shape: this.fixture.coverage_shape,
				kind: this.fixture.kind,
				fov: this.fixture.fov,
				vertical_fov: this.fixture.vertical_fov,
				range: this.fixture.range,
				technology: this.fixture.technology,
				mount: this.fixture.mount,
				...this.fixture.look_down === void 0 ? {} : { look_down: this.fixture.look_down },
				notes: t?.notes ?? "",
				source: t?.source ?? "",
				match: t?.match ?? n
			}]))[0], i = [...(this.config.sensor_profiles ?? []).filter((e) => e.id !== r.id), r];
			js(JSON.stringify(i)), this.dispatchEvent(N({
				...this.config,
				sensor_profiles: i
			})), this.profile = r.id, this.notice = "Model profile added to draft. Apply it to any matching device.", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	importProfiles() {
		if (!(!this.config || this.disabled)) try {
			let e = js(this.profileText), t = new Set(e.map((e) => e.id));
			if (e.some((e) => e.id.startsWith("community:"))) throw Error("Use personal profile ids when importing; community ids are reserved.");
			let n = js(JSON.stringify([...(this.config.sensor_profiles ?? []).filter((e) => !t.has(e.id)), ...e]));
			this.dispatchEvent(N({
				...this.config,
				sensor_profiles: n
			})), this.notice = "Profiles added to draft. Matching ids were updated.", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	numeric(e, t, n, r) {
		let i = [
			"range",
			"width",
			"height"
		].includes(e), a = this.fixture[e] ?? (e === "height" ? 1.2 : 1), o = i ? t.replace("(m", `(${this.unit}`) : t;
		return h`<label>${o}${i ? this.lengthInput(o, a, (t) => this.patch({ [e]: t }), n, r, "", e) : h`<input type="number" data-field=${e} min=${n} max=${r} step="any" .value=${String(a)} @input=${(t) => this.patch({ [e]: t.target.valueAsNumber })}>`}</label>`;
	}
	editOpening(e, t = "interior_door") {
		if (this.disabled || !this.group?.bounds) return;
		this.legacyWindow = void 0, this.contactSearch = "", this.allContacts = !1, this.addKind = "", this.fixture = ot(), this.original = void 0, this.mode = "place", this.error = "";
		let n = this.group.bounds, r = e ? structuredClone(e) : Le(t);
		e || Object.assign(r, c(this.group, [
			(n[0][0] + n[1][0]) / 2,
			(n[0][1] + n[1][1]) / 2,
			n[0][2] + (t === "window" ? Math.max(0, (n[1][2] - n[0][2] - r.height) / 2) : 0)
		], r.width)), this.opening = r, this.originalOpening = e?.id, this.workspace && !e && this.flushDraft();
	}
	selectPlan(e, t) {
		if (this.disabled) return;
		let n = this.config && D(this.config).find((t) => t.group.id === e)?.group;
		if (!n?.bounds) return;
		e !== this.room && (this.room = e, this.reset(), this.dispatchEvent(new CustomEvent("al-editor-room", {
			detail: e,
			bubbles: !0,
			composed: !0
		})));
		let r = n.openings?.find((e) => e.id === t);
		r && this.editOpening(r);
	}
	openingConfig() {
		let e = structuredClone(this.config);
		if (this.legacyWindow) {
			let t = D(e).find((e) => e.group.id === this.room)?.group;
			t && (t.fixtures = t.fixtures?.filter((e) => e.entity !== this.legacyWindow));
		}
		return e;
	}
	editLegacyWindow(e) {
		this.editOpening({
			...Le("window"),
			name: e.name,
			entities: [e.entity],
			position: [
				e.position[0],
				e.position[1],
				e.position[2] - (e.height ?? 1.2) / 2
			],
			yaw: e.yaw,
			width: e.width ?? 1,
			height: e.height ?? 1.2
		}), this.legacyWindow = e.entity;
	}
	objectTree() {
		let e = this.group;
		return e ? [
			["Windows", ["window"]],
			["Doors", ["interior_door", "exterior_door"]],
			["Openings", ["open_wall"]],
			["Motion sensors", ["motion"]],
			["Occupancy sensors", ["occupancy"]],
			["Lights", ["light"]]
		].map(([t, n]) => {
			if (this.section === "openings" && ![
				"Windows",
				"Doors",
				"Openings"
			].includes(t) || this.section === "sensors" && !["Motion sensors", "Occupancy sensors"].includes(t) || this.section === "lights" && t !== "Lights") return g;
			let r = (e.openings ?? []).filter((e) => n.includes(e.kind)), i = (e.fixtures ?? []).filter((e) => n.includes(e.kind));
			return h`<details open class="object-category"><summary>${t} (${r.length + i.length})</summary>
        ${r.map((e) => h`<button class="device" type="button" data-object=${e.id} aria-pressed=${this.opening?.id === e.id} @click=${() => this.editOpening(e)}>${e.name || e.kind.replaceAll("_", " ")}<small>${Fe(e).length} linked sensors · ${mt(e, this.hass?.states ?? {})}</small></button>`)}
        ${i.map((e) => h`<button class="device" type="button" data-entity=${e.entity} aria-pressed=${this.fixture.entity === e.entity || this.legacyWindow === e.entity} @click=${() => this.select(e.entity)}>${e.name || e.entity}<small>${e.entity}</small></button>`)}
      </details>`;
		}) : g;
	}
	contactsControl(e) {
		let t = Fe(e), n = new Set(this.candidates.map((e) => e.entity)), r = [.../* @__PURE__ */ new Set([
			...t,
			...this.registry.map((e) => e.entity),
			...Object.keys(this.hass?.states ?? {})
		])].filter((e) => e.startsWith("binary_sensor.") && (this.allContacts || n.has(e) || t.includes(e)) && (!this.contactSearch || `${e} ${this.hass?.states[e]?.attributes.friendly_name ?? ""}`.toLowerCase().includes(this.contactSearch.toLowerCase())));
		return h`<h4>Associated sensors / alarm circuits (${t.length})</h4>
      <p class="muted">Link none, one, or several entities. Shared alarm circuits can be linked to every window or door they cover. Any active entity tints all linked objects red; it cannot tell us which one opened.</p>
      <label><input type="checkbox" .checked=${this.allContacts} @change=${(e) => {
			this.allContacts = e.target.checked;
		}}>Include sensors outside this room</label>
      <input aria-label="Find associated sensor" placeholder="Find a contact or alarm circuit…" .value=${this.contactSearch} @input=${(e) => {
			this.contactSearch = e.target.value;
		}}>
      <div class="devices">${r.map((e) => h`<label><input type="checkbox" data-contact=${e} .checked=${t.includes(e)} @change=${(n) => this.patchOpening({
			entity: void 0,
			entities: n.target.checked ? [...t, e] : t.filter((t) => t !== e)
		})}>${this.hass?.states[e]?.attributes.friendly_name ?? e}<small>${e} · ${this.hass?.states[e]?.state ?? "unavailable"}</small></label>`)}</div>
      ${t.length ? h`<p class="muted">State: ${mt(e, this.hass?.states ?? {})}. All contacts must be off to show closed; unavailable contacts leave the state unknown.</p>` : h`<label><input type="checkbox" .checked=${e.open} @change=${(e) => this.patchOpening({ open: e.target.checked })}>Manually open</label>`}`;
	}
	patchOpening(e) {
		this.opening && !this.disabled && (this.opening = {
			...this.opening,
			...e
		}, this.error = "", this.workspace && this.flushDraft());
	}
	saveDoor() {
		if (!(!this.config || !this.opening || this.disabled || !this.validLengths())) try {
			this.dispatchEvent(N(ut(this.openingConfig(), this.room, this.opening, this.originalOpening))), this.legacyWindow = void 0, this.originalOpening = this.opening.id, this.notice = "Opening added to draft. Use the panel's Save to persist it.", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	openingControl() {
		let e = this.opening;
		if (!e) return g;
		let t = this.group ? ft(this.group, e) : void 0;
		return h`<h3>${e.kind === "open_wall" ? "Open wall" : e.kind === "window" ? "Window" : "Door"}</h3>
      ${t ? h`<label>Jamb from wall start (${this.unit})${this.lengthInput("Opening from wall start", (e.position[0] - t.a[0]) * t.dx + (e.position[1] - t.a[1]) * t.dy - e.width / 2, (t) => this.patchOpening(_e(this.group, e, t)), 0)}</label>${e.kind.includes("door") ? h`<label>Hinge from wall start (${this.unit})${this.lengthInput("Hinge from wall start", (De(this.group, e).hinge[0] - t.a[0]) * t.dx + (De(this.group, e).hinge[1] - t.a[1]) * t.dy, (t) => this.patchOpening(_e(this.group, e, t, !0)), 0)}</label>` : g}${e.kind === "open_wall" ? h`<button type="button" @click=${() => this.patchOpening({
			width: t.length,
			height: this.group.bounds[1][2] - this.group.bounds[0][2],
			position: [
				t.a[0] + t.dx * t.length / 2,
				t.a[1] + t.dy * t.length / 2,
				this.group.bounds[0][2]
			]
		})}>Open entire wall</button>` : g}` : g}
      <button type="button" @click=${() => {
			this.wallView = !this.wallView;
		}}>${this.wallView ? "Floor plan" : "Wall elevation"}</button>
      <label>Name<input aria-label="Opening name" .value=${e.name} @input=${(e) => this.patchOpening({ name: e.target.value })}></label>
      <label>Opening type<select aria-label="Opening type" .value=${e.kind} @change=${(e) => this.patchOpening({ kind: e.target.value })}>${[
			"interior_door",
			"exterior_door",
			"open_wall",
			"window"
		].map((t) => h`<option value=${t} .selected=${e.kind === t}>${t.replaceAll("_", " ")}</option>`)}</select></label>
      ${["width", "height"].map((t) => h`<label>${t} (${this.unit})${this.lengthInput(`Opening ${t}`, e[t], (e) => this.patchOpening({ [t]: e }), .1, 20)}</label>`)}
      <label>Bottom above floor (${this.unit})${this.lengthInput("Opening elevation", e.position[2] - (this.group?.bounds?.[0][2] ?? 0), (t) => this.patchOpening({ position: [
			e.position[0],
			e.position[1],
			(this.group?.bounds?.[0][2] ?? 0) + t
		] }), 0)}</label>
      ${e.kind !== "open_wall" && e.kind !== "window" ? h`<p class="muted">Hinge left/right is viewed from inside this room facing the doorway.</p>
        <label>Hinge<select aria-label="Door hinge" .value=${e.hinge} @change=${(e) => this.patchOpening({ hinge: e.target.value })}>${["left", "right"].map((t) => h`<option .selected=${e.hinge === t} value=${t}>${t}</option>`)}</select></label>
        <label>Swing<select aria-label="Door swing" .value=${e.swing} @change=${(e) => this.patchOpening({ swing: e.target.value })}>${["in", "out"].map((t) => h`<option .selected=${e.swing === t} value=${t}>${t}</option>`)}</select></label>
        ` : g}
      ${e.kind === "open_wall" ? g : this.contactsControl(e)}
      <p class="muted">Click near a wall to place and align the opening. An open wall always lets coverage pass.</p>
      <button ?hidden=${this.workspace} id="save-opening" type="button" @click=${() => this.saveDoor()}>${this.originalOpening ? "Update" : "Add"} opening to draft</button>
      ${this.originalOpening || this.legacyWindow ? h`<button type="button" @click=${() => {
			if (!this.config || this.disabled) return;
			let e = this.openingConfig(), t = D(e).find((e) => e.group.id === this.room)?.group;
			t && (t.openings = t.openings?.filter((e) => e.id !== this.originalOpening)), this.dispatchEvent(N(e)), this.opening = void 0, this.originalOpening = void 0, this.legacyWindow = void 0;
		}}>Remove opening</button>` : g}`;
	}
	render() {
		if (!this.config) return g;
		let e = D(this.config).filter((e) => e.group.bounds && ![
			"property",
			"structure",
			"floor"
		].includes(e.group.kind)), t = this.group, n = t?.bounds, r = this.preview ? D(this.preview).map((e) => e.group).filter((e) => e.bounds && ![
			"property",
			"structure",
			"floor"
		].includes(e.kind) && (!n || e.bounds[0][2] < n[1][2] - .01 && e.bounds[1][2] > n[0][2] + .01)) : [], i = r.find((e) => e.id === this.room) ?? t, a = this.candidates.filter((e) => !e.placed && (!this.addKind || this.addKind === "light" === e.entity.startsWith("light."))).filter((e) => `${e.name} ${e.entity}`.toLowerCase().includes(this.search.toLowerCase())), o = this.candidates.find((e) => e.entity === this.fixture.entity), s = o ? this.profiles.filter((e) => ks(e, o)) : [], l = this.profiles.find((e) => e.id === this.profile);
		return h`<fieldset ?disabled=${this.disabled}>
      ${this.workspace ? g : h`      <label>Measurements<select id="length-unit" .value=${this.unitChoice} @change=${(e) => {
			this.unitChoice = e.target.value;
		}}><option value="auto" .selected=${this.unitChoice === "auto"}>HA (${Ns(this.hass)})</option><option value="m" .selected=${this.unitChoice === "m"}>Meters</option><option value="ft" .selected=${this.unitChoice === "ft"}>Feet & inches</option></select></label>
      ${this.unit === "ft" ? h`<p class="muted">Enter feet and inches (2′6″), inches (30″), or decimal feet (2.5).</p>` : g}
      <label>Room<select id="device-room" .value=${this.room} @change=${(e) => {
			this.room = e.target.value, this.reset(), this.dispatchEvent(new CustomEvent("al-editor-room", {
				detail: this.room,
				bubbles: !0,
				composed: !0
			}));
		}}>
        <option value="" disabled>Choose a room</option>${e.map((e) => h`<option value=${e.group.id} .selected=${e.group.id === this.room}>${e.group.name || e.group.id}</option>`)}</select></label>
`}
      ${n ? h`<div class="workspace">
        <div class="scene-pane"><al-floorplan-viewer .workspace=${this.workspace} editing-preview .context=${!0} .config=${this.preview} .room=${this.room} .live=${this.live} .hass=${this.hass} .lights=${this.lights} .settings=${{
			focus_activity: !1,
			auto_rotate: !1
		}}></al-floorplan-viewer></div>
        <div class="plan-pane"><h3 ?hidden=${this.workspace}>Top-down placement</h3><div>
        <div ?hidden=${this.workspace}><button type="button" aria-pressed=${this.mode === "place"} @click=${() => {
			this.mode = "place";
		}}>Place / move</button>
          <button type="button" aria-pressed=${this.mode === "aim"} ?disabled=${!this.fixture.entity || this.fixture.kind === "light" || this.fixture.kind === "window"} @click=${() => {
			this.mode = "aim";
		}}>Aim</button></div>
        ${this.wallView && this.opening ? h`<al-wall-elevation .group=${i} .opening=${this.opening} .unit=${this.unit} .disabled=${this.disabled} @al-opening-resize=${(e) => this.patchOpening(e.detail)}></al-wall-elevation>` : g}
        <al-room-plan @al-plan-select=${(e) => this.selectPlan(e.detail.room, e.detail.opening)} ?hidden=${this.wallView && !!this.opening} .unit=${this.unit} @al-opening-resize=${(e) => this.patchOpening(e.detail)} .minimal=${this.workspace} .group=${i} .neighbors=${r} .opening=${this.opening} .hass=${this.hass} .fixture=${this.fixture} .mode=${this.mode} .disabled=${this.disabled}
          @al-fixture-position=${(e) => {
			e.stopPropagation(), this.patch(this.fixture.kind === "window" && this.group ? Qe(this.group, e.detail, this.fixture.width) : { position: e.detail });
		}}
          @al-fixture-aim=${(e) => this.patch({ yaw: this.aimSnap ? Math.round(e.detail / this.aimSnap) * this.aimSnap : Number(e.detail.toFixed(1)) })}
          @al-opening-position=${(e) => {
			this.opening && this.group && this.patchOpening(c(this.group, e.detail, this.opening.width));
		}}
          @al-opening-select=${(e) => {
			let n = t?.openings?.find((t) => t.id === e.detail);
			n && this.editOpening(n);
		}}
          @al-fixture-select=${(e) => this.select(e.detail)}></al-room-plan>
      </div></div><div class="editor-controls">
        ${this.workspace && !this.fixture.entity && !this.opening ? h`<div class="room-tools">      <label><select aria-label="Room" id="device-room" .value=${this.room} @change=${(e) => {
			this.room = e.target.value, this.reset(), this.dispatchEvent(new CustomEvent("al-editor-room", {
				detail: this.room,
				bubbles: !0,
				composed: !0
			}));
		}}>
        <option value="" disabled>Choose a room</option>${e.map((e) => h`<option value=${e.group.id} .selected=${e.group.id === this.room}>${e.group.name || e.group.id}</option>`)}</select></label>
      <label><select aria-label="Measurements" id="length-unit" .value=${this.unitChoice} @change=${(e) => {
			this.unitChoice = e.target.value;
		}}><option value="auto" .selected=${this.unitChoice === "auto"}>HA (${Ns(this.hass)})</option><option value="m" .selected=${this.unitChoice === "m"}>Meters</option><option value="ft" .selected=${this.unitChoice === "ft"}>Feet & inches</option></select></label>
</div><button type="button" class="view-toggle" aria-label="Toggle 2D view on narrow screens" @click=${() => this.toggleAttribute("plan-view")}>2D / 3D</button>` : this.workspace ? g : h`<h3>Room editor</h3>`}
        <div class="page-heading">${this.workspace && this.original ? h`<button type="button" aria-label="Delete device" title="Delete device" @click=${() => this.removeFixture()}>⌫</button>` : g}<h3>${this.section === "openings" ? "Doors & windows" : this.section === "sensors" ? "Motion & occupancy" : this.section === "lights" ? "Lights" : "Devices & windows"}</h3>
          ${this.workspace && (this.fixture.entity || this.opening || this.adding || this.profilesPage) ? h`<button type="button" aria-label="Close object editor" @click=${() => this.reset()}>×</button>` : this.workspace ? h`<button type="button" @click=${() => {
			this.adding = !0;
		}}>+ Add</button>` : g}
        </div>
        ${!this.workspace || !this.fixture.entity && !this.opening && !this.profilesPage ? h`
        <details class="add-menu" ?hidden=${this.workspace && !this.adding} .open=${this.workspace && this.adding}><summary>Add…</summary>
          <button ?hidden=${this.section !== "all" && this.section !== "openings"} id="new-door" type="button" @click=${() => this.editOpening()}>Add door</button><button ?hidden=${this.section !== "all" && this.section !== "openings"} id="new-open-wall" type="button" @click=${() => this.editOpening(void 0, "open_wall")}>Add open wall</button>
          <button ?hidden=${this.section !== "all" && this.section !== "openings"} type="button" data-add-window @click=${() => this.editOpening(void 0, "window")}>Add window</button>
          ${[
			"motion",
			"occupancy",
			"light"
		].map((e) => h`<button ?hidden=${this.section !== "all" && (e === "light" ? this.section !== "lights" : this.section !== "sensors")} type="button" data-add-kind=${e} @click=${() => {
			this.reset(), this.adding = !0, this.addKind = e;
		}}>Add ${e === "motion" ? "motion sensor" : e === "occupancy" ? "occupancy sensor" : e}</button>`)}
        </details>
        ${this.addKind ? h`<p>Choose a room entity for the new ${this.addKind} placement.</p><button @click=${() => {
			this.addKind = "";
		}}>Show all devices</button>` : g}
        ${!this.workspace || !this.adding ? this.objectTree() : g}
        <details class="available-entities" ?hidden=${this.workspace && !this.adding} ?open=${!!this.addKind}><summary>Available room entities to add</summary>
        <input aria-label="Find room device" placeholder="Find a sensor or light…" .value=${this.search} @input=${(e) => {
			this.search = e.target.value;
		}}>
        <p class="muted">Activity inputs first, then contributing now, then most recently changed.</p>
        <div class="devices">${a.map((e) => h`<button type="button" class="device" data-entity=${e.entity} aria-pressed=${this.fixture.entity === e.entity} @click=${() => this.select(e.entity)}>
          ${e.name}<small>${t?.fixtures?.find((t) => t.entity === e.entity)?.kind ?? e.device_class ?? "device"} · ${e.entity}</small><small>${e.contributing ? "Contributing now" : e.input ? "Activity input" : "Room device"}${e.placed ? " · placed" : ""} · ${this.hass?.states[e.entity]?.state ?? "unavailable"}</small>
          ${e.changed ? h`<small>Changed ${(/* @__PURE__ */ new Date(e.changed * 1e3)).toLocaleString()}</small>` : g}</button>`)}</div>
        ${a.length ? g : h`<p class="muted">No matching devices. Assign devices to this room's HA area or configure its activity inputs. No whole-home fallback is used.</p>`}
        </details>
        ${this.registryError ? h`<p class="error" role="alert">${this.registryError}</p>` : g}
        <button type="button" ?disabled=${this.loading} @click=${() => void this.loadDevices()}>${this.loading ? "Loading devices…" : "Refresh room devices"}</button>
        ${this.workspace && this.section === "sensors" ? h`<button type="button" @click=${() => {
			this.profilesPage = !0;
		}}>Model profiles</button>` : g}
        ` : g}
        ${this.openingControl()}
        ${o ? h`<p class="muted">${[
			o.manufacturer,
			o.model,
			o.platform
		].filter(Boolean).join(" · ")}</p>` : g}
      ${this.fixture.entity ? h`<h3>${this.fixture.name || this.fixture.entity}</h3>
        ${Ge(t, this.fixture.position) ? g : h`<p class="error">This saved placement is outside the room.</p><button type="button" @click=${() => this.patch(this.fixture.kind === "window" ? Qe(t, ke(t), this.fixture.width) : { position: ke(t) })}>Move into room</button>`}
        ${this.fixture.kind === "window" ? h`<p class="muted">Click near a wall to snap the window onto it. Red = open; blue = closed; gray = unavailable.</p><div class="fields">${this.numeric("width", "Window width (m)", .1, 20)}${this.numeric("height", "Window height (m)", .1, 20)}</div>` : g}
        <div class="fields"><label>${this.fixture.kind === "window" ? `Window center above floor (${this.unit})` : `Height above floor (${this.unit})`}${this.lengthInput("Height above floor", this.fixture.position[2] - n[0][2], (e) => this.patch({ position: [
			this.fixture.position[0],
			this.fixture.position[1],
			n[0][2] + e
		] }), 0, n[1][2] - n[0][2], "fixture-height")}</label>
          <label>Sensor model profile<select id="sensor-profile" .value=${this.profile} @change=${(e) => {
			this.profile = e.target.value;
		}}>
            <option value="">Choose a profile</option>${this.profiles.filter((e) => e.kind === "light" === this.fixture.entity.startsWith("light.") && e.kind === "window" == (this.fixture.kind === "window")).map((e) => h`<option value=${e.id} .selected=${e.id === this.profile}>${s.includes(e) ? "Suggested · " : ""}${e.name}</option>`)}</select></label>
          <button type="button" ?disabled=${!l} @click=${() => this.useProfile()}>Apply profile</button></div>
        ${s.length ? h`<p class="muted">Suggested from device metadata: ${s.map((e) => e.name).join(", ")}. Confirm the model and sensor entity before applying.</p>` : g}
        ${l ? h`<button type="button" @click=${() => {
			this.information = !this.information;
		}}>Device information</button>` : g}
        ${this.fixture.kind === "motion" || this.fixture.kind === "occupancy" ? h`<al-orientation-control .snap=${this.aimSnap} @al-aim-snap=${(e) => {
			this.aimSnap = e.detail;
		}} .yaw=${this.fixture.yaw} .pitch=${this.fixture.pitch} .disabled=${this.disabled} @al-orientation-change=${(e) => this.patch(e.detail)}></al-orientation-control>
        <label class="check"><input type="checkbox" .checked=${this.fixture.look_down ?? !1} @change=${(e) => this.patch({ look_down: e.target.checked })}>Separate look-down coverage</label><p class="muted">Look-down shape is approximate. Match the physical lens setting.</p>` : g}
        <details><summary>Adjust characteristics and precise position</summary><div class="fields">
          <label>Type<select id="fixture-kind" .value=${this.fixture.kind} @change=${(e) => {
			let t = e.target.value;
			this.patch({
				kind: t,
				profile_id: void 0,
				...t === "window" && this.group ? Qe(this.group, this.fixture.position, this.fixture.width) : {}
			}), this.profile = "";
		}}>${[
			"motion",
			"occupancy",
			"light",
			"window"
		].map((e) => h`<option value=${e} .selected=${e === this.fixture.kind}>${e}</option>`)}</select></label>
          <label>Label<input maxlength="100" .value=${this.fixture.name} @input=${(e) => this.patch({ name: e.target.value })}></label>
          <label>Mount<input maxlength="60" .value=${this.fixture.mount} @input=${(e) => this.patch({ mount: e.target.value })}></label>
          <label>Model / technology<input maxlength="60" .value=${this.fixture.technology} @input=${(e) => this.patch({ technology: e.target.value })}></label>
          ${[0, 1].map((e) => h`<label>${e === 0 ? "X" : "Y"} (${this.unit})${this.lengthInput(e === 0 ? "X" : "Y", this.fixture.position[e], (t) => {
			let n = [...this.fixture.position];
			n[e] = t, this.patch({ position: n });
		})}</label>`)}
          ${this.numeric("yaw", "Direction (°)", -360, 360)}${this.numeric("pitch", "Tilt (°)", -90, 90)}
          ${this.fixture.kind === "motion" || this.fixture.kind === "occupancy" ? h`${this.numeric("fov", "Horizontal view (°)", 1, 170)}${this.numeric("vertical_fov", "Vertical view (°)", 1, 170)}${this.numeric("range", "Range (m; 0 = hidden)", 0, 100)}` : g}
        </div><p class="muted">Coverage is approximate and clipped by solid room boundaries. The top-down sector illustrates horizontal coverage; use 3D to inspect tilt.</p>
        <label>Personal model name<input id="profile-name" maxlength="100" .value=${this.profileName} @input=${(e) => {
			this.profileName = e.target.value;
		}}></label>
        <button id="save-profile" type="button" @click=${() => this.saveProfile()}>${this.config.sensor_profiles?.some((e) => e.id === this.profile) ? "Update" : "Save"} personal model profile</button></details>
        <button ?hidden=${this.workspace} id="save-fixture" type="button" @click=${() => this.save()}>${this.original ? "Update" : "Add"} placement to draft</button>
        ${this.original ? h`<button ?hidden=${this.workspace} type="button" @click=${() => this.removeFixture()}>Remove placement</button>` : g}
      ` : g}
      ${this.previewError ? h`<p class="error" role="status">Placement needs adjustment: ${this.previewError}</p>` : g}
      <p class="status" role="status">${this.notice}</p>${this.error ? h`<p class="error" role="alert">${this.error}</p>` : g}
      <details ?hidden=${this.workspace && !this.profilesPage} .open=${this.workspace && this.profilesPage}><summary>Personal profiles · import / export</summary><p class="muted">Copy profiles between installations or contribute them to the bundled community catalog. Placement coordinates, linked entity ids and aiming angles are excluded. Import updates matching profile ids in the draft.</p>
        <textarea aria-label="Profile JSON" .value=${this.profileText} @input=${(e) => {
			this.profileText = e.target.value;
		}}></textarea>
        <button type="button" @click=${() => {
			this.profileText = JSON.stringify(js(JSON.stringify(this.config?.sensor_profiles ?? [])), null, 2);
		}}>Export personal profiles</button>
        <button type="button" @click=${() => this.importProfiles()}>Import profiles to draft</button>
      </details></div>
      ${this.information && l ? h`<aside class="device-information" aria-label="Device information"><header>Device information <button type="button" aria-label="Close device information" @click=${() => {
			this.information = !1;
		}}>×</button></header><h3>${l.name}</h3><p>${l.notes}</p>${/^https?:\/\//.test(l.source) ? h`<a href=${l.source} target="_blank" rel="noopener noreferrer">Profile source</a>` : g}</aside>` : g}
      </div>` : h`<p class="muted">Choose a room with floorplan dimensions first.</p>`}
    </fieldset>`;
	}
};
_([b({
	type: Boolean,
	reflect: !0
})], Z.prototype, "workspace", void 0), _([b({ type: String })], Z.prototype, "section", void 0), _([m()], Z.prototype, "wallView", void 0), _([m()], Z.prototype, "aimSnap", void 0), _([m()], Z.prototype, "information", void 0), _([m()], Z.prototype, "adding", void 0), _([m()], Z.prototype, "profilesPage", void 0), _([b({ attribute: !1 })], Z.prototype, "config", void 0), _([b({ attribute: !1 })], Z.prototype, "lights", void 0), _([b({ attribute: !1 })], Z.prototype, "hass", void 0), _([b({ attribute: !1 })], Z.prototype, "live", void 0), _([b({ type: Boolean })], Z.prototype, "disabled", void 0), _([b({ type: String })], Z.prototype, "room", void 0), _([m()], Z.prototype, "unitChoice", void 0), _([m()], Z.prototype, "contactSearch", void 0), _([m()], Z.prototype, "allContacts", void 0), _([m()], Z.prototype, "legacyWindow", void 0), _([m()], Z.prototype, "addKind", void 0), _([m()], Z.prototype, "opening", void 0), _([m()], Z.prototype, "originalOpening", void 0), _([m()], Z.prototype, "fixture", void 0), _([m()], Z.prototype, "original", void 0), _([m()], Z.prototype, "mode", void 0), _([m()], Z.prototype, "error", void 0), _([m()], Z.prototype, "notice", void 0), _([m()], Z.prototype, "registry", void 0), _([m()], Z.prototype, "registryError", void 0), _([m()], Z.prototype, "loading", void 0), _([m()], Z.prototype, "search", void 0), _([m()], Z.prototype, "profile", void 0), _([m()], Z.prototype, "profileName", void 0), _([m()], Z.prototype, "profileText", void 0), Z = _([S("al-room-device-editor")], Z);
//#endregion
//#region src/al-architecture-editor.ts
var Q = class extends p {
	constructor(...e) {
		super(...e), this.live = null, this.disabled = !1, this.room = "", this.selected = "", this.drawing = !1, this.points = [], this.name = "New room", this.error = "", this.planOnly = !1, this.snap = !0, this.scale = 1;
	}
	static {
		this.styles = T`
    :host {
      display: block;
      height: 100%;
      color: #d8edf2;
      font-size: 12px;
    }
    .layout {
      position: relative;
      height: 100%;
      display: grid;
      grid-template-columns: 55% 45%;
    }
    al-floorplan-viewer {
      height: 100%;
      min-width: 0;
    }
    .plan {
      padding: 60px 12px 12px;
      min-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
      background: #112632;
      touch-action: none;
      border: 1px solid #446779;
      border-radius: 8px;
    }
    .room {
      fill: #41657233;
      stroke: #7897a3;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .selected {
      stroke: #95e8ef;
      stroke-width: 2;
    }
    .grip {
      fill: #ffd16a;
      stroke: #102633;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
      cursor: grab;
    }
    /* Native SVG focus outlines scale with the plan's meter coordinates. */
    .grip:focus {
      outline: none;
      stroke: white;
      stroke-width: 2;
      vector-effect: non-scaling-stroke;
    }
    .object {
      fill: #85939c88;
      stroke: #a8c3ce;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
      cursor: move;
    }
    text {
      fill: #c8e3ec;
      text-anchor: middle;
      font-size: 0.18px;
      pointer-events: none;
    }
    .panel {
      position: absolute;
      left: 62px;
      top: 60px;
      width: 260px;
      max-height: calc(100% - 84px);
      overflow: auto;
      padding: 10px;
      background: #102633f5;
      border: 1px solid #80ddeb;
      border-radius: 8px;
      box-sizing: border-box;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 7px 0;
    }
    input,
    select,
    button {
      font: inherit;
      color: inherit;
      background: #173440;
      border: 1px solid #426477;
      border-radius: 3px;
      padding: 5px;
      min-width: 0;
    }
    button {
      cursor: pointer;
      margin: 3px;
    }
    button:disabled {
      opacity: 0.4;
    }
    button:focus-visible,
    input:focus-visible {
      outline: 2px solid #ffd16a;
    }
    .list button {
      display: block;
      width: 100%;
      text-align: left;
    }
    .error {
      color: #ff8c83;
    }
    .tools {
      display: flex;
      flex-wrap: wrap;
    }
    .note {
      color: #91adba;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .plan-only {
      grid-template-columns: 100%;
    }
    .plan-only al-floorplan-viewer {
      display: none;
    }
    .plan-only .plan {
      padding-left: 340px;
    }
    @media (pointer: coarse) {
      button,
      input,
      select {
        min-height: 44px;
      }
      .panel {
        left: 76px;
      }
    }
    @media (max-width: 760px) {
      .layout {
        grid-template-columns: 100%;
      }
      .layout al-floorplan-viewer {
        display: none;
      }
      .panel {
        max-height: 42%;
        width: 230px;
      }
      .plan,
      .plan-only .plan {
        padding-left: 12px;
      }
    }
  `;
	}
	get groups() {
		return this.config ? D(this.config) : [];
	}
	get group() {
		return this.groups.find((e) => e.group.id === this.room)?.group;
	}
	get object() {
		return this.group?.architecture?.find((e) => e.id === this.selected);
	}
	get unit() {
		return Ns(this.hass);
	}
	length(e) {
		return Is(e, this.unit);
	}
	commit(e) {
		this.disabled || (this.config = e, this.dispatchEvent(N(e)), this.error = "");
	}
	resetDraft() {
		this.selected = "", this.drawing = !1, this.points = [], this.error = "";
	}
	flushDraft() {
		return !this.drawing && !this.error;
	}
	field(e, t, n) {
		return h`<label
      >${e} (${this.unit})<input
        aria-label=${e}
        .value=${this.length(t)}
        @change=${(e) => {
			let t = e.target, r = Fs(t.value, this.unit);
			if (r === null) {
				this.error = "Enter a valid length.";
				return;
			}
			n(r);
		}}
    /></label>`;
	}
	patch(e) {
		if (!this.config || !this.object || this.disabled) return;
		let t = Ue({
			...this.object,
			...e
		});
		if (!t) {
			this.error = "Check dimensions: landings must leave a positive stair run.";
			return;
		}
		let n = structuredClone(this.config), r = D(n).find((e) => e.group.id === this.room).group;
		r.architecture = r.architecture.map((e) => e.id === t.id ? t : e), this.commit(n);
	}
	addObject(e) {
		if (!this.config || !this.group?.bounds) return;
		if ((this.group.architecture?.length ?? 0) >= 128) {
			this.error = "Maximum 128 architectural objects per room.";
			return;
		}
		let t = structuredClone(this.config), n = D(t).find((e) => e.group.id === this.room).group, r = n.bounds, i = {
			id: crypto.randomUUID(),
			name: e === "stairs" ? "Staircase" : e,
			kind: e,
			position: [
				r[0][0],
				r[0][1],
				r[0][2]
			],
			yaw: 0,
			width: e === "stairs" ? .9 : .6,
			run: e === "stairs" ? 3 : .6,
			height: r[1][2] - r[0][2],
			steps: 14,
			landing_bottom: 0,
			landing_top: 0
		};
		n.architecture = [...n.architecture ?? [], i], this.selected = i.id, this.commit(t);
	}
	saveOutline(e) {
		if (!(!this.config || !this.group?.bounds)) try {
			let t = structuredClone(this.config), n = D(t).find((e) => e.group.id === this.room).group;
			n.bounds = le(e, n.bounds[0][2], n.bounds[1][2]), n.points = e, this.commit(t);
		} catch (e) {
			this.error = e.message;
		}
	}
	roomParent(e) {
		let t = D(e).find((e) => e.group.id === this.room);
		if (t && ["floor", "structure"].includes(t.group.kind)) return t.group;
		if (t?.parent && [
			"floor",
			"structure",
			"area"
		].includes(t.parent.kind)) return t.parent;
		let n = e.groups.find((e) => e.kind === "property");
		n || (n = xe(`property_${crypto.randomUUID().slice(0, 8)}`, "property"), n.name = "Property", e.groups.push(n));
		let r = n.children.find((e) => e.kind === "structure");
		return r || (r = xe(`building_${crypto.randomUUID().slice(0, 8)}`, "structure"), r.name = "Building", n.children.push(r)), r;
	}
	finishRoom() {
		if (this.config) try {
			let e = structuredClone(this.config), t = this.roomParent(e), n = this.group?.bounds?.[0][2] ?? 0, r = {
				...xe(`room_${crypto.randomUUID().slice(0, 8)}`, "area"),
				name: this.name,
				points: this.points,
				bounds: le(this.points, n, n + 2.4)
			};
			t.children.push(r), this.room = r.id, this.drawing = !1, this.points = [], this.commit(e);
		} catch (e) {
			this.error = e.message;
		}
	}
	underRoom() {
		if (!this.config || !this.object) return;
		let e = structuredClone(this.config), t = D(e).find((e) => e.group.id === this.room).group.architecture.find((e) => e.id === this.selected), n = o(t), r = {
			...xe(`under_stairs_${crypto.randomUUID().slice(0, 8)}`, "area"),
			name: "Server closet",
			points: n,
			bounds: le(n, t.position[2], t.position[2] + t.height)
		};
		this.roomParent(e).children.push(r), t.under_room = r.id, this.commit(e);
	}
	point(e) {
		let t = this.renderRoot.querySelector("svg")?.getScreenCTM();
		if (!t) return;
		let n = new DOMPoint(e.clientX, e.clientY).matrixTransform(t.inverse());
		return [Math.round(n.x * 100) / 100, Math.round(-n.y * 100) / 100];
	}
	clicked(e) {
		if (this.disabled || !this.drawing) return;
		let t = this.point(e);
		if (!t) return;
		let n = this.points.at(-1);
		if (this.snap && n) {
			let e = Math.hypot(t[0] - n[0], t[1] - n[1]), r = Math.round(Math.atan2(t[1] - n[1], t[0] - n[0]) / (Math.PI / 4)) * Math.PI / 4;
			t = [n[0] + e * Math.cos(r), n[1] + e * Math.sin(r)];
		}
		this.points = [...this.points, t];
	}
	move(e) {
		if (this.disabled || this.drag?.pointer !== e.pointerId) return;
		let t = this.point(e);
		if (t) {
			if (this.drag.corner !== void 0 && this.group) {
				let e = q(this.group).map((e) => [...e]);
				e[this.drag.corner] = t, this.saveOutline(e);
			} else this.drag.object && this.object && this.patch({ position: [
				t[0] - (this.drag.offset?.[0] ?? 0),
				t[1] - (this.drag.offset?.[1] ?? 0),
				this.object.position[2]
			] });
		}
	}
	render() {
		if (!this.config) return g;
		let e = this.group, t = this.object, n = this.groups.filter((e) => e.group.bounds), r = n.flatMap((e) => q(e.group)), i = Math.min(0, ...r.map((e) => e[0])) - 3, a = Math.min(0, ...r.map((e) => e[1])) - 3, s = Math.max(10, ...r.map((e) => e[0])) + 3, c = Math.max(10, ...r.map((e) => e[1])) + 3, l = (s - i) / this.scale, u = (c - a) / this.scale;
		return h`<div class=${`layout${this.planOnly ? " plan-only" : ""}`}>
      <al-floorplan-viewer
        workspace
        editing-preview
        .context=${!0}
        .room=${this.room}
        .config=${this.config}
        .hass=${this.hass}
        .live=${this.live}
      ></al-floorplan-viewer>
      <div class="plan">
        <svg
          viewBox=${`${(i + s - l) / 2} ${-(a + c + u) / 2} ${l} ${u}`}
          aria-label="Architectural plan"
          @click=${this.clicked}
          @pointermove=${this.move}
          @pointerup=${() => {
			this.drag = void 0;
		}}
          @pointercancel=${() => {
			this.drag = void 0;
		}}
        >
          ${n.filter((t) => ![
			"property",
			"structure",
			"floor"
		].includes(t.group.kind) && (!e?.bounds || t.group.bounds[0][2] < e.bounds[1][2] && t.group.bounds[1][2] > e.bounds[0][2])).map(({ group: e }) => C`<polygon class=${`room${e.id === this.room ? " selected" : ""}`} points=${q(e).map(([e, t]) => `${e},${-t}`).join(" ")} @click=${(t) => {
			this.drawing || (t.stopPropagation(), this.room = e.id, this.selected = "");
		}}/>`)}
          ${e?.bounds && !this.drawing && !t ? q(e).map(([e, t], n, r) => C`<circle class="grip" cx=${e} cy=${-t} r=".09" role="button" tabindex="0" aria-label=${`Corner ${n + 1}`} @keydown=${(i) => {
			let a = {
				ArrowLeft: [-.01, 0],
				ArrowRight: [.01, 0],
				ArrowUp: [0, .01],
				ArrowDown: [0, -.01]
			}[i.key];
			if (!a || this.disabled) return;
			i.preventDefault();
			let o = r.map((e) => [...e]);
			o[n] = [e + a[0] * (i.shiftKey ? 10 : 1), t + a[1] * (i.shiftKey ? 10 : 1)], this.saveOutline(o);
		}} @pointerdown=${(e) => {
			e.stopPropagation(), !this.disabled && (this.drag = {
				pointer: e.pointerId,
				corner: n
			}, this.renderRoot.querySelector("svg").setPointerCapture(e.pointerId));
		}}/><text x=${(e + r[(n + 1) % r.length][0]) / 2} y=${-(t + r[(n + 1) % r.length][1]) / 2 - .15}>${this.length(Math.hypot(e - r[(n + 1) % r.length][0], t - r[(n + 1) % r.length][1]))}</text>`) : g}
          ${e?.architecture?.map((e) => {
			let t = o(e);
			return C`<g>${e.kind === "stairs" ? C`<g transform=${`translate(${e.position[0]},${-e.position[1]}) rotate(${-e.yaw})`}><path d=${`M ${e.width / 2} -.2 L ${e.width / 2} ${-e.run + .2} l -.12 .2 m .12 -.2 l .12 .2`} fill="none" stroke="#ffd16a" stroke-width=".025"/>${Array.from({ length: e.steps }, (t, n) => {
				let r = -(e.landing_bottom + (e.run - e.landing_bottom - e.landing_top) * (n + 1) / e.steps);
				return C`<line x1="0" y1=${r} x2=${e.width} y2=${r} stroke="#a8c3ce" stroke-width=".015"/>`;
			})}</g>` : g}<polygon class="object" points=${t.map(([e, t]) => `${e},${-t}`).join(" ")} @click=${(t) => {
				t.stopPropagation(), this.selected = e.id;
			}} @pointerdown=${(t) => {
				if (this.disabled) return;
				t.stopPropagation(), this.selected = e.id;
				let n = this.point(t);
				this.drag = {
					pointer: t.pointerId,
					object: e.id,
					offset: n ? [n[0] - e.position[0], n[1] - e.position[1]] : [0, 0]
				}, this.renderRoot.querySelector("svg").setPointerCapture(t.pointerId);
			}}/><text x=${t.reduce((e, t) => e + t[0], 0) / 4} y=${-t.reduce((e, t) => e + t[1], 0) / 4}>${e.name}</text></g>`;
		})}
          ${this.drawing ? C`<polyline class="selected room" points=${this.points.map(([e, t]) => `${e},${-t}`).join(" ")}/>` : g}
        </svg>
      </div>
      <div class="panel">
        <header>
          <strong>Architecture</strong
          ><button
            @click=${() => {
			this.planOnly = !this.planOnly;
		}}
          >
            2D / 3D
          </button>
        </header>
        <fieldset
          ?disabled=${this.disabled}
          style="border:0;padding:0;margin:0"
        >
          <label
            >Room or floor<select
              aria-label="Architecture room"
              .value=${this.room}
              @change=${(e) => {
			this.room = e.target.value, this.resetDraft();
		}}
            >
              <option value="">Choose…</option>
              ${n.map((e) => h`<option value=${e.group.id} .selected=${e.group.id === this.room}>${e.group.name ?? e.group.id}</option>`)}
            </select></label
          >
          <div class="tools">
            <button
              @click=${() => {
			this.scale = Math.min(4, this.scale * 1.25);
		}}
            >
              Zoom +</button
            ><button
              @click=${() => {
			this.scale = Math.max(.25, this.scale / 1.25);
		}}
            >
              Zoom −
            </button>
          </div>
          ${this.drawing ? h`<label
           >Room name<input
             .value=${this.name}
             @input=${(e) => {
			this.name = e.target.value;
		}} /></label
         ><label
           ><input
             type="checkbox"
             .checked=${this.snap}
             @change=${(e) => {
			this.snap = e.target.checked;
		}}
           />45° angle snap</label
         ><button @click=${() => this.finishRoom()}>Finish room</button
         ><button @click=${() => this.resetDraft()}>Cancel</button
         ><button
           @click=${() => {
			this.points = this.points.slice(0, -1);
		}}
         >
           Undo corner
         </button>` : t ? h`<header>
             <strong>${t.name}</strong
             ><button
               @click=${() => {
			this.selected = "";
		}}
             >
               ×
             </button>
           </header>
           <label
             >Name<input
               .value=${t.name}
               @change=${(e) => this.patch({ name: e.target.value })}
           /></label>
           ${this.field("X", t.position[0], (e) => this.patch({ position: [
			e,
			t.position[1],
			t.position[2]
		] }))}${this.field("Y", t.position[1], (e) => this.patch({ position: [
			t.position[0],
			e,
			t.position[2]
		] }))}${this.field("Width", t.width, (e) => this.patch({ width: e }))}${this.field(t.kind === "stairs" ? "Total run" : "Depth", t.run, (e) => this.patch({ run: e }))}${this.field(t.kind === "stairs" ? "Rise" : "Height", t.height, (e) => this.patch({ height: e }))}${this.field("Base elevation", t.position[2], (e) => this.patch({ position: [
			t.position[0],
			t.position[1],
			e
		] }))}
           <label
             >Direction (°)<input
               type="number"
               .value=${String(t.yaw)}
               @change=${(e) => this.patch({ yaw: e.target.valueAsNumber })}
           /></label>
           ${t.kind === "stairs" ? h`<label
           >Destination floor<select
             aria-label="Destination floor" .value=${t.to_floor ?? ""}
             @change=${(e) => {
			let r = n.find((t) => t.group.id === e.target.value)?.group;
			r || this.patch({ to_floor: void 0 }), r?.bounds && this.patch({
				height: r.bounds[0][2] - t.position[2],
				to_floor: r.id
			});
		}}
           >
             <option value="">Set rise from floor…</option>
             ${n.filter((e) => e.group.kind === "floor" && e.group.bounds[0][2] > t.position[2]).map((e) => h`<option value=${e.group.id} .selected=${e.group.id === t.to_floor}>${e.group.name ?? e.group.id}</option>`)}
           </select></label
         ><label
           >Steps<input
             type="number"
             min="1"
             max="100"
             .value=${String(t.steps)}
             @change=${(e) => this.patch({ steps: e.target.valueAsNumber })} /></label
         >${this.field("Bottom landing", t.landing_bottom, (e) => this.patch({ landing_bottom: e }))}${this.field("Top landing", t.landing_top, (e) => this.patch({ landing_top: e }))}<label
           >Space below<select
             .value=${t.under_room ?? ""}
             @change=${(e) => this.patch({ under_room: e.target.value || void 0 })}
           >
             <option value="">None</option>
             ${n.filter((e) => e.group.kind === "area" && e.group.id !== this.room).map((e) => h`<option value=${e.group.id} .selected=${e.group.id === t.under_room}>${e.group.name ?? e.group.id}</option>`)}
           </select></label
         >${t.under_room ? g : h`<button @click=${() => this.underRoom()}>Create space below</button>`}` : g}
           <button
             @click=${() => {
			let e = structuredClone(this.config), t = D(e).find((e) => e.group.id === this.room).group;
			t.architecture = t.architecture?.filter((e) => e.id !== this.selected), this.selected = "", this.commit(e);
		}}
           >
             Delete object
           </button> ` : h`<button
             @click=${() => {
			this.drawing = !0, this.points = [];
		}}
           >
             Draw room</button
           >${e?.bounds ? h`<div class="tools">
                     ${[
			"stairs",
			"chimney",
			"column",
			"shaft",
			"solid"
		].map((e) => h`<button @click=${() => this.addObject(e)}>Add ${e}</button>`)}
                   </div>
                   <div class="list">
                     ${e.architecture?.map((e) => h`<button
                           @click=${() => {
			this.selected = e.id;
		}}
                         >
                           ${e.name}
                         </button>`)}
                   </div>
                   ${this.field("Floor elevation", e.bounds[0][2], (t) => {
			let n = structuredClone(this.config), r = D(n).find((t) => t.group.id === e.id).group;
			try {
				r.bounds = le(q(r), t, r.bounds[1][2]), this.commit(n);
			} catch (e) {
				this.error = e.message;
			}
		})}${this.field("Ceiling elevation", e.bounds[1][2], (t) => {
			let n = structuredClone(this.config), r = D(n).find((t) => t.group.id === e.id).group;
			try {
				r.bounds = le(q(r), r.bounds[0][2], t), this.commit(n);
			} catch (e) {
				this.error = e.message;
			}
		})}
                   <details>
                     <summary>Wall lengths & corners</summary>
                     ${q(e).map((e, t, n) => h`${this.field(`Wall ${t + 1}`, Math.hypot(e[0] - n[(t + 1) % n.length][0], e[1] - n[(t + 1) % n.length][1]), (r) => {
			let i = n.map((e) => [...e]), a = i[(t + 1) % n.length], o = Math.hypot(a[0] - e[0], a[1] - e[1]);
			if (r <= 0 || !o) {
				this.error = "Wall length must be positive.";
				return;
			}
			i[(t + 1) % n.length] = [e[0] + (a[0] - e[0]) * r / o, e[1] + (a[1] - e[1]) * r / o], this.saveOutline(i);
		})}<button
                             @click=${() => {
			let r = n.map((e) => [...e]), i = n[(t + 1) % n.length];
			r.splice(t + 1, 0, [(e[0] + i[0]) / 2, (e[1] + i[1]) / 2]), this.saveOutline(r);
		}}
                           >
                             Insert corner</button
                           ><button
                             ?disabled=${n.length <= 3}
                             @click=${() => this.saveOutline(n.filter((e, n) => n !== t))}
                           >
                             Remove corner ${t + 1}
                           </button>`)}
                   </details>` : g}`}
        </fieldset>
        ${this.error ? h`<p class="error" role="alert">${this.error}</p>` : g}
      </div>
    </div>`;
	}
};
_([b({ attribute: !1 })], Q.prototype, "config", void 0), _([b({ attribute: !1 })], Q.prototype, "hass", void 0), _([b({ attribute: !1 })], Q.prototype, "live", void 0), _([b({ type: Boolean })], Q.prototype, "disabled", void 0), _([b({ type: String })], Q.prototype, "room", void 0), _([m()], Q.prototype, "selected", void 0), _([m()], Q.prototype, "drawing", void 0), _([m()], Q.prototype, "points", void 0), _([m()], Q.prototype, "name", void 0), _([m()], Q.prototype, "error", void 0), _([m()], Q.prototype, "planOnly", void 0), _([m()], Q.prototype, "snap", void 0), _([m()], Q.prototype, "scale", void 0), Q = _([S("al-architecture-editor")], Q);
//#endregion
//#region src/al-floorplans.ts
var $ = class extends p {
	constructor(...e) {
		super(...e), this.live = null, this.disabled = !1, this.dirty = !1, this.blocked = !1, this.status = "", this.page = "live", this.editRoom = "", this.lights = {}, this.settings = {}, this.error = "", this.preferenceError = "", this.entry = "";
	}
	static {
		this.styles = T`
    :host { display:block; position:relative; height:calc(100dvh - 64px); min-height:400px; overflow:hidden; color:#d8edf2; background:#101d27; --primary-text-color:#d8edf2; --secondary-text-color:#91adba; --card-background-color:#142b38; --secondary-background-color:#1b3a48; --divider-color:#345261; --primary-color:#80ddeb; }
    :host(:fullscreen) { height:100dvh; }
    .fullscreen { position:absolute; right:54px; top:12px; z-index:8; height:32px; }
    .scene { position:absolute; inset:0; } .scene.shifted { left:400px; }
    al-floorplan-viewer, al-room-device-editor, al-architecture-editor { display:block; height:100%; }
    [hidden] { display:none !important; }
    .rail { position:absolute; left:10px; top:12px; z-index:8; display:flex; flex-direction:column; gap:6px; padding:6px; border:1px solid #426477; background:#10232ee8; border-radius:8px; }
    button { font:inherit; color:inherit; background:#152d3bdd; border:1px solid #36576b; border-radius:4px; padding:5px 8px; cursor:pointer; }
    button:focus-visible { outline:2px solid #9be6f3; outline-offset:2px; } button:disabled { opacity:.45; cursor:default; }
    .rail button { width:32px; height:32px; padding:0; font-size:18px; background:transparent; border-color:transparent; }
    button[aria-pressed=true] { color:#aff4ff; border-color:#7cd7e8; background:#244654; }
    .save { position:absolute; top:12px; left:50%; transform:translateX(-50%); z-index:9; display:flex; gap:6px; align-items:center; font-size:12px; }
    .status { position:absolute; bottom:10px; left:70px; max-width:calc(100% - 140px); z-index:10; font-size:12px; background:#142b38ed; padding:6px 10px; }
    .page { position:absolute; top:64px; bottom:16px; left:62px; width:330px; z-index:5; overflow:auto; border:1px solid #426477; border-left:2px solid #80ddeb; background:#102633f5; border-radius:8px; font-size:12px; }
    .page > al-property-layout, .page > al-floorplan-import { display:block; padding:0 12px; }
    .page header { position:sticky; top:0; background:#102633; z-index:1; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; font-size:14px; }
    @media(pointer:coarse) { .rail button { width:44px; height:44px; } button { min-height:44px; } .page { left:76px; } }
    @media(max-width:760px) { .scene.shifted { left:0; } .page { left:62px; right:12px; width:auto; } .save { left:auto; right:64px; transform:none; } }
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
		let e = it(this.hass);
		this.source === e && this.unsubscribe || (this.unsubscribe?.(), this.source = e, this.unsubscribe = e.subscribe(({ data: e, error: t }) => {
			if (this.error = t ?? "", e && (this.lights = e.lights, this.telemetry = e.telemetry, this.entry !== e.entry_id)) {
				this.entry = e.entry_id;
				try {
					let e = localStorage.getItem(`al-floorplan:${this.entry}`);
					this.settings = e ? JSON.parse(e) : {}, ze(this.settings);
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
	navigate(e) {
		if (this.page = e, [
			"openings",
			"sensors",
			"lights",
			"architecture"
		].includes(e) && this.config) {
			let t = D(this.config).filter((e) => e.group.bounds && ![
				"property",
				"structure",
				"floor"
			].includes(e.group.kind));
			t.some((e) => e.group.id === this.editRoom) || (this.editRoom = t[0]?.group.id ?? ""), !this.editRoom && e !== "architecture" && (this.page = "import");
		}
	}
	action(e) {
		let t = this.renderRoot.querySelector("al-room-device-editor,al-architecture-editor");
		e === "al-save-config" && t && !t.flushDraft() || (e === "al-discard-config" && t?.resetDraft(), this.dispatchEvent(new CustomEvent(e, {
			bubbles: !0,
			composed: !0
		})));
	}
	render() {
		if (!this.config) return g;
		let e = [
			"openings",
			"sensors",
			"lights"
		].includes(this.page), t = this.page === "property" || this.page === "import";
		return h`
      <div class=${`scene${t ? " shifted" : ""}`} ?hidden=${e || this.page === "architecture"}>
        <al-floorplan-viewer workspace .settingsOpen=${this.page === "settings"} .hideHud=${t || this.page === "settings"}
          @al-room-selected=${(e) => {
			this.editRoom = e.detail;
		}}
          @al-edit-room=${(e) => {
			this.editRoom = e.detail, this.navigate("openings");
		}}
          .config=${this.config} .live=${this.live} .hass=${this.hass} .lights=${this.lights}
          .telemetry=${this.error ? void 0 : this.telemetry} .settings=${this.settings} @al-viewer-settings=${this.saveSettings}></al-floorplan-viewer>
      </div>
      ${e ? h`<al-room-device-editor @al-editor-room=${(e) => {
			this.editRoom = e.detail;
		}} workspace .section=${this.page} .room=${this.editRoom} .lights=${this.lights} .live=${this.live} .config=${this.config} .hass=${this.hass} .disabled=${this.disabled}></al-room-device-editor>` : g}
      ${this.page === "architecture" ? h`<al-architecture-editor .room=${this.editRoom} .config=${this.config} .hass=${this.hass} .live=${this.live} .disabled=${this.disabled}></al-architecture-editor>` : g}
      <button class="fullscreen" aria-label="Toggle fullscreen" title="Fullscreen" @click=${async () => {
			try {
				this.matches(":fullscreen") ? await document.exitFullscreen() : await this.requestFullscreen();
			} catch {
				this.preferenceError = "Fullscreen is unavailable in this browser.";
			}
		}}>⛶</button>
      <nav class="rail" aria-label="Floorplan tools">
        <button aria-label="Exit floorplan" title="Back to Activity Levels" @click=${() => this.action("al-exit-floorplan")}>←</button>
        ${[
			[
				"live",
				"◈",
				"Live telemetry"
			],
			[
				"openings",
				"▣",
				"Doors & windows"
			],
			[
				"sensors",
				"◎",
				"Motion & occupancy"
			],
			[
				"lights",
				"☼",
				"Lights"
			],
			[
				"architecture",
				"▱",
				"Architecture"
			],
			[
				"property",
				"⌖",
				"Property layout"
			],
			[
				"import",
				"⇧",
				"Import floorplan"
			],
			[
				"settings",
				"⚙",
				"Viewer settings"
			]
		].map(([e, t, n]) => h`<button aria-label=${n} title=${n} aria-pressed=${this.page === e} @click=${() => this.navigate(e)}>${t}</button>`)}
      </nav>
      <div class="save"><button ?disabled=${!this.dirty || this.disabled} @click=${() => this.action("al-discard-config")}>Discard</button><button ?disabled=${!this.dirty || this.disabled || this.blocked} @click=${() => this.action("al-save-config")}>${this.disabled ? "Saving…" : this.dirty ? "Save changes" : "Saved"}</button></div>
      <section class="page" aria-label="Property layout" ?hidden=${this.page !== "property"}><header>Property layout<button aria-label="Close property layout" @click=${() => this.navigate("live")}>×</button></header><al-property-layout .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-property-layout></section>
      <section class="page" aria-label="Import floorplan" ?hidden=${this.page !== "import"}><header>Import floorplan<button aria-label="Close import" @click=${() => this.navigate("live")}>×</button></header><al-floorplan-import .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-floorplan-import></section>
      ${this.error || this.preferenceError || this.status || this.blocked ? h`<div class="status" role="status">${this.error || this.preferenceError || this.status || "Configuration needs attention before saving. Exit to review validation errors."}</div>` : g}`;
	}
};
_([b({ attribute: !1 })], $.prototype, "hass", void 0), _([b({ attribute: !1 })], $.prototype, "config", void 0), _([b({ attribute: !1 })], $.prototype, "live", void 0), _([b({ type: Boolean })], $.prototype, "disabled", void 0), _([b({ type: Boolean })], $.prototype, "dirty", void 0), _([b({ type: Boolean })], $.prototype, "blocked", void 0), _([b({ type: String })], $.prototype, "status", void 0), _([m()], $.prototype, "page", void 0), _([m()], $.prototype, "editRoom", void 0), _([m()], $.prototype, "telemetry", void 0), _([m()], $.prototype, "lights", void 0), _([m()], $.prototype, "settings", void 0), _([m()], $.prototype, "error", void 0), _([m()], $.prototype, "preferenceError", void 0), $ = _([S("al-floorplans")], $);
//#endregion
