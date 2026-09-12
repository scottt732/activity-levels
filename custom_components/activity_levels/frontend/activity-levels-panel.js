import { $ as e, A as t, At as n, B as r, C as i, Ct as a, D as o, Dt as s, E as c, Et as l, F as u, G as d, H as f, I as p, J as m, K as h, L as ee, M as te, N as ne, O as re, Ot as g, P as ie, Q as ae, R as oe, S as se, St as _, T as ce, Tt as v, U as le, V as ue, W as de, X as fe, Y as pe, Z as y, _ as me, _t as he, at as ge, b as _e, bt as ve, c as ye, ct as be, d as xe, dt as Se, et as Ce, f as b, ft as we, g as Te, gt as Ee, h as De, ht as Oe, i as ke, it as Ae, j as x, k as je, kt as S, l as Me, lt as Ne, m as Pe, mt as Fe, nt as C, ot as Ie, p as w, pt as Le, q as Re, rt as ze, s as Be, st as Ve, t as He, tt as Ue, u as We, ut as Ge, v as Ke, vt as qe, w as Je, wt as T, x as E, xt as Ye, y as Xe, yt as Ze, z as Qe } from "./shared-YHPPdInG.js";
//#region src/entities.ts
var $e = (e) => `switch.${e}_presence_simulation`, et = (e) => `sensor.${e}_expected_activity`, tt = (e) => `sensor.${e}_activity_anomaly`, nt = [
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
], rt = ["ha-yaml-editor", "ha-state-icon"], it = 2500, at = 8e3;
function ot(e) {
	let t;
	return {
		promise: new Promise((n) => {
			t = setTimeout(n, e);
		}),
		cancel: () => clearTimeout(t)
	};
}
async function st(e, t, n) {
	let r = ot(t);
	try {
		return await Promise.race([e, r.promise.then(() => n)]);
	} finally {
		r.cancel();
	}
}
async function ct() {
	try {
		await ((await window.loadCardHelpers?.())?.createCardElement({
			type: "entities",
			entities: []
		}))?.constructor?.getConfigElement?.();
	} catch {}
}
async function lt() {
	if (customElements.get("ha-yaml-editor")) return;
	let e;
	try {
		await customElements.whenDefined("ha-selector"), e = document.createElement("ha-selector"), e.selector = { object: {} }, e.style.display = "none", document.body.appendChild(e), await customElements.whenDefined("ha-yaml-editor");
	} catch {} finally {
		e?.remove();
	}
}
async function ut(e = at, t = it) {
	let n = [...nt, ...rt];
	if (n.every((e) => customElements.get(e))) return {
		ok: !0,
		missing: [],
		optionalMissing: []
	};
	await st(Promise.all([ct(), lt()]).then(() => void 0), t, void 0);
	let r = await Promise.all(n.map((t) => st(customElements.whenDefined(t).then(() => !0), e, !1))), i = n.filter((e, t) => !r[t]), a = rt, o = i.filter((e) => !a.includes(e));
	return {
		ok: o.length === 0,
		missing: o,
		optionalMissing: i.filter((e) => a.includes(e))
	};
}
//#endregion
//#region src/navigation.ts
var dt = "activity_levels.mixer.expanded", ft = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]), pt = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function mt(e) {
	return {
		expanded: new Set(e.groups.map((e) => e.id)),
		selection: pt(e)
	};
}
function ht(e, t) {
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
function gt(e, t) {
	let n = ht(e, t), r = [], i = [], a = [], o = [], s = 0, c = (e) => {
		for (; o.length > 0 && o[o.length - 1].depth >= e;) o.pop().band.colEnd = i.length + 1;
	};
	for (let t of n) {
		if (c(t.depth), i.push("strip"), r.push(i.length), !t.hasChildren) continue;
		let n = E(e, t.path)?.name ?? t.id, l = {
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
function _t(e, t) {
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
			let n = ht(t.config, e);
			if (n.length === 0) return e;
			let r = e.selection, i = r === null ? -1 : n.findIndex((e) => ft(e.path, r)), a = (((i === -1 && t.delta < 0 ? n.length : i) + t.delta) % n.length + n.length) % n.length;
			return {
				...e,
				selection: n[a].path
			};
		}
		case "home":
		case "end": {
			let n = ht(t.config, e);
			return n.length === 0 ? e : {
				...e,
				selection: (t.type === "home" ? n[0] : n[n.length - 1]).path
			};
		}
		case "sync": {
			let { config: n } = t, r = me(n), i = [...e.expanded].filter((e) => r.has(e));
			return {
				expanded: i.length === e.expanded.size ? e.expanded : new Set(i),
				selection: e.selection !== null && de(n, e.selection) !== void 0 ? e.selection : pt(n)
			};
		}
	}
}
function vt(e, t, n) {
	if (n === null) return t;
	let r = n[n.length - 2] === "stimuli" ? n.slice(0, -2) : n, i = new Set(t), a = !1;
	for (let t = 2; t + 2 <= r.length; t += 2) {
		let n = de(e, r.slice(0, t));
		if (n === void 0 || typeof n.id != "string") break;
		i.has(n.id) || (i.add(n.id), a = !0);
	}
	return a ? i : t;
}
function yt(e) {
	let t;
	try {
		t = localStorage.getItem(dt);
	} catch {
		return null;
	}
	if (t === null) return null;
	try {
		let n = JSON.parse(t);
		if (!Array.isArray(n)) return null;
		let r = me(e);
		return new Set(n.filter((e) => typeof e == "string" && r.has(e)));
	} catch {
		return null;
	}
}
function bt(e) {
	try {
		localStorage.setItem(dt, JSON.stringify([...e]));
	} catch {}
}
function xt(e) {
	let t = mt(e), n = yt(e);
	return n === null ? t : {
		...t,
		expanded: n
	};
}
var St = "activity_levels.mixer.edit";
function Ct() {
	try {
		return localStorage.getItem(St) === "true";
	} catch {
		return !1;
	}
}
function wt(e) {
	try {
		localStorage.setItem(St, e ? "true" : "false");
	} catch {}
}
//#endregion
//#region src/save-flow.ts
async function Tt(e, t) {
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
var Et = {
	"24h": 86400,
	"7d": 604800,
	"30d": 2592e3
}, Dt = {
	off: 0,
	"24h": 86400,
	"7d": 604800
};
function Ot(e, t, n) {
	return {
		start: e - Et[t],
		end: e,
		resolution: t === "24h" ? "5m" : "1h",
		forecastUntil: n === "off" ? void 0 : e + Dt[n]
	};
}
function kt(e, t, n) {
	let r = t - e || 1;
	return (t) => (t - e) / r * n;
}
function At(e, t, n = 4) {
	let r = e || 1, i = t - 2 * n;
	return (e) => t - n - e / r * i;
}
function jt(e, t) {
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
function Mt(e, t, n) {
	return e.length === 0 ? "" : e.map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ");
}
function Nt(e, t, n, r = Infinity) {
	if (e.p75.length === 0) return "";
	let i = (t) => t.map((t, n) => [e.t0 + n * e.step, t]), a = jt(i(e.p75), r), o = jt(i(e.p25), r).reverse();
	return `${[...a, ...o].map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ")} Z`;
}
function Pt(e, t) {
	return e[t].map((t, n) => [e.t0 + n * e.step, t]);
}
function Ft(e, t, n, r, i) {
	let a = e[e.length - 1];
	return !a || t <= a[0] || t < r || t > i ? [] : [a, [t, n]];
}
function It(e, t, n) {
	return e.map(([e, r, i]) => ({
		x0: t(e),
		x1: t(r ?? n),
		tag: i
	}));
}
function Lt(e, t) {
	if (e.length === 0) return -1;
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i][0] < t ? n = i + 1 : r = i;
	}
	return n > 0 && Math.abs(e[n - 1][0] - t) <= Math.abs(e[n][0] - t) ? n - 1 : n;
}
function Rt(e) {
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
function zt(e, t) {
	let n = Math.min(2592e3, Math.max(3600, e.end - e.start)), r = Math.min(t + 604800, e.start + n);
	return {
		start: r - n,
		end: r
	};
}
function Bt(e, t, n, r) {
	let i = e.end - e.start, a = Math.min(2592e3, Math.max(3600, i * n)), o = t - (t - e.start) / i * a;
	return zt({
		start: o,
		end: o + a
	}, r);
}
function Vt(e, t, n = Infinity) {
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
function Ht(e, t, n, r, i = 450) {
	if (n > r) {
		let t = e.forecast;
		if (!t || t.step <= 0) return null;
		let r = Vt(Pt(t, "p50"), n);
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
var Ut = class {
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
		let { start: i, end: a, until: o } = Wt(t, n, r), s = {}, c = !0;
		for (let l of e) {
			let e = this.cache.get(JSON.stringify([
				l,
				i,
				a,
				o,
				r
			]));
			!e || Date.now() - e.at > 6e4 ? (c = !1, s[l] = null) : s[l] = Ht(e.data, l, t, n, r === "5m" ? 450 : 5400);
		}
		return {
			values: s,
			complete: c
		};
	}
	async load(e, t, n, r, i = "5m") {
		let a = ++this.generation, o = {}, s = !1, { start: c, end: l, until: u } = Wt(n, r, i), d = 0;
		return await Promise.all(Array.from({ length: Math.min(4, t.length) }, async () => {
			for (; d < t.length && a === this.generation;) {
				let f = t[d++], p = JSON.stringify([
					f,
					c,
					l,
					u,
					i
				]), m = this.cache.get(p);
				if (!m || Date.now() - m.at > 6e4) {
					await this.slot();
					try {
						if (a !== this.generation) return;
						for (m = {
							at: Date.now(),
							data: await we(e, {
								group_id: f,
								start: c,
								end: l,
								resolution: i,
								include_children: !1,
								...u === void 0 ? {} : { forecast_until: u }
							})
						}, this.cache.set(p, m); this.cache.size > 128;) this.cache.delete(this.cache.keys().next().value);
					} catch {
						s = !0, o[f] = null;
						continue;
					} finally {
						this.release();
					}
				}
				o[f] = Ht(m.data, f, n, r, i === "5m" ? 450 : 5400);
			}
		})), {
			values: o,
			failed: s
		};
	}
};
function Wt(e, t, n) {
	let r = e > t, i = Math.floor(e / 3600) * 3600, a = Math.floor(t / 60) * 60, o = n === "5m" ? 300 : 3600, s = r ? a : Math.min(i + 3600 + o, a);
	return {
		start: r ? s - o : i - o,
		end: s,
		...r ? { until: Math.min(i + 3900, s + 604800) } : {}
	};
}
//#endregion
//#region src/activity-levels-panel.ts
var Gt = [
	"mixer",
	"groups",
	"envelopes",
	"defaults",
	"patterns",
	"presence",
	"paths",
	"floorplans",
	"code"
], Kt = 2e3, qt = 1e4, Jt = 3e5, Yt = 1500, Xt = "activity_levels.timeline", Zt = [
	"24h",
	"7d",
	"30d"
], Qt = [
	"off",
	"24h",
	"7d"
], $t = {
	range: "7d",
	horizon: "24h",
	showChannels: !0,
	showLights: !0
};
function en(e) {
	if (e === null) return null;
	let t = JSON.parse(e);
	return !Zt.includes(t.range) || !Qt.includes(t.horizon) ? null : {
		range: t.range,
		horizon: t.horizon,
		showChannels: t.showChannels !== !1,
		showLights: t.showLights !== !1
	};
}
var D = class extends v {
	constructor(...e) {
		super(...e), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = $t, this.preview = null, this.previewError = !1, this.previewData = new Ut(), this.previewSeq = 0, this.transportWindow = null, this.onTransport = (e) => {
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
			let t = _t(this.nav, e.detail);
			t.expanded !== this.nav.expanded && bt(t.expanded), this.nav = t, this.selection = t.selection, this.preview && this.onTransport(new CustomEvent("al-transport", { detail: {
				time: this.preview.time,
				window: this.transportWindow
			} }));
		}, this.onLiveRefresh = () => {
			this.pollLive();
		}, this.onRebuild = async (e) => {
			try {
				let { rebuilt: t } = await Ee(this.hass, e.detail?.force === !0);
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
				await ge(this.hass, "switch", n ? "turn_on" : "turn_off", { entity_id: $e(t) });
			} catch (e) {
				this.banner = {
					kind: "error",
					text: `Could not ${n ? "start" : "stop"} the simulation for ${t}: ${e.message}`
				};
			}
		}, this.onTimelineRange = (e) => {
			this.timeline = e.detail;
			try {
				localStorage.setItem(Xt, JSON.stringify(e.detail));
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
		this.styles = [w];
	}
	get previewResolution() {
		let e = Math.min(this.live?.now ?? Date.now() / 1e3, this.transportWindow?.end ?? Infinity);
		return (this.transportWindow ? e - Math.min(this.transportWindow.start, e - 3600) : this.timeline.range === "24h" ? 86400 : 604800) <= 86400 ? "5m" : "1h";
	}
	previewIds(e, t) {
		let n = this.draft?.config;
		if (!n) return [];
		let r = ht(n, this.nav).map((e) => e.id);
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
			for (let i of r) t[i.id] = this.live?.groups[i.id]?.precision ?? Xe(e, i), n(i.children);
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
		return Gt;
	}
	async connectedCallback() {
		super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
		let { ok: e, missing: t, optionalMissing: n } = await ut();
		this.missing = e ? [] : t, this.yamlEditor = !n.includes("ha-yaml-editor"), await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer(), clearTimeout(this.previewTimer), this.previewTimer = void 0, this.previewSeq++, this.previewData.cancel();
	}
	async load() {
		try {
			let { config: e, inferred: t, warnings: n } = await Ve(this.hass);
			this.draft = new le(e), this.inferred = t, this.warnings = n, this.syncTabs(), this.nav = xt(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
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
		let t = this.selection, n = _t({
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
		let n = vt(t, this.nav.expanded, e);
		n !== this.nav.expanded && bt(n), this.nav = {
			expanded: n,
			selection: e
		};
	}
	async save() {
		let e = this.draft;
		if (!(!e || this.busy || this.blocked)) {
			this.busy = !0, this.updatePolling();
			try {
				let t = await Tt(e.config, {
					validate: (e) => Ye(this.hass, e),
					save: (e) => qe(this.hass, e)
				});
				t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((e) => setTimeout(e, Yt)), await this.load());
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
		this.liveTimer === void 0 && (this.pollLive(), this.liveTimer = window.setInterval(() => void this.pollLive(), Kt));
	}
	updateSimPolling(e) {
		if (!(this.patternsVisible && e)) {
			this.clearSimTimer();
			return;
		}
		this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => void this.pollSim(), qt));
	}
	async pollLive() {
		let e = ++this.liveSeq;
		try {
			let t = await Se(this.hass);
			e === this.liveSeq && (this.live = t);
		} catch {}
	}
	async pollSim() {
		try {
			this.simLog = await Ge(this.hass);
		} catch {}
	}
	clearLiveTimer() {
		this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
	}
	clearSimTimer() {
		this.simTimer !== void 0 && (clearInterval(this.simTimer), this.simTimer = void 0);
	}
	async refreshProfile(e = !1) {
		if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < Jt)) try {
			this.profileState = await Ne(this.hass), this.profileAt = Date.now();
		} catch {}
	}
	restoreTimeline() {
		try {
			this.timeline = en(localStorage.getItem(Xt)) ?? $t;
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
		return g`
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
          ${this.tabs.map((e, t) => g`<button
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
          ${e ? this.renderTab(e) : g`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
	}
	renderLiveToggle() {
		return this.liveRequired ? l : g`
      <span class="muted">Live</span>
      <ha-switch
        .checked=${this.liveOn}
        @change=${(e) => this.toggleLive(e.target.checked)}
      ></ha-switch>
    `;
	}
	renderMissing() {
		return g`
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
		return e ? g`<ha-alert
      alert-type=${e.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
			this.banner = null;
		}}
      >${e.text}</ha-alert
    >` : l;
	}
	renderInferred() {
		let e = this.inferred.length;
		return e === 0 ? l : g`<ha-alert class="inferred-notice" alert-type="warning">
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
		return this.warnings.length === 0 ? l : g`<ha-alert class="config-warnings" alert-type="warning">
      <ul>
        ${this.warnings.map((e) => g`<li>${e}</li>`)}
      </ul>
    </ha-alert>`;
	}
	renderTab(e) {
		switch (this.tab) {
			case "mixer": return this.renderMixer(e);
			case "groups": return g`<div class="layout ${this.narrow ? "narrow" : ""}">
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
			case "envelopes": return g`<al-envelopes
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
			case "defaults": return g`<al-defaults
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
			case "patterns": return g`<al-patterns
          .hass=${this.hass}
          .config=${e.config}
          .profileState=${this.profileState}
          .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild}
        ></al-patterns>`;
			case "code": return g`<al-code
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .available=${this.yamlEditor}
          @al-change=${this.onChange}
          @al-code-status=${this.onCodeStatus}
        ></al-code>`;
			case "floorplans": return g`<al-floorplans .hass=${this.hass} .config=${e.config} .live=${this.live}
          .disabled=${this.busy} @al-change=${this.onChange} @al-open-group=${this.openMixerGroup}></al-floorplans>`;
			case "paths": return g`<al-paths .hass=${this.hass} .config=${e.config} .narrow=${this.narrow}></al-paths>`;
			case "presence": return g`<al-presence
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
		let n = this.nav.selection, r = n === null ? void 0 : E(t, se(n));
		return g`<div class="rows">
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
      ${this.previewError ? g`<ha-alert alert-type="warning">Some preview data could not be loaded. Missing values are shown as —.</ha-alert>` : l}
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
		return g`<div class="rows">
      <ha-card class="mixer-empty">
        <p class="muted">Add your first group in Groups.</p>
        <ha-button @click=${() => this.selectTab(this.tabs.indexOf("groups"))}>Go to Groups</ha-button>
      </ha-card>
    </div>`;
	}
	renderEditor(e) {
		let t = this.selection;
		return t ? t[t.length - 2] === "stimuli" ? g`<al-stimulus-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>` : g`<div><al-group-editor
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
        </div>` : g`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
	}
};
b([a({ attribute: !1 })], D.prototype, "hass", void 0), b([a({ type: Boolean })], D.prototype, "narrow", void 0), b([_()], D.prototype, "draft", void 0), b([_()], D.prototype, "inferred", void 0), b([_()], D.prototype, "warnings", void 0), b([_()], D.prototype, "tab", void 0), b([_()], D.prototype, "selection", void 0), b([_()], D.prototype, "nav", void 0), b([_()], D.prototype, "errors", void 0), b([_()], D.prototype, "banner", void 0), b([_()], D.prototype, "live", void 0), b([_()], D.prototype, "liveOn", void 0), b([_()], D.prototype, "busy", void 0), b([_()], D.prototype, "missing", void 0), b([_()], D.prototype, "profileState", void 0), b([_()], D.prototype, "simLog", void 0), b([_()], D.prototype, "timeline", void 0), b([_()], D.prototype, "preview", void 0), b([_()], D.prototype, "previewError", void 0), b([_()], D.prototype, "codeStatus", void 0), b([_()], D.prototype, "yamlEditor", void 0), b([_()], D.prototype, "tabFocus", void 0), D = b([T("activity-levels-panel")], D);
//#endregion
//#region src/duration.ts
function O(e) {
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
function k(e) {
	if (!e) return null;
	let t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
	return Math.round(t * 1e3) / 1e3;
}
function tn(e) {
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
var A = ["on", "off"], nn = {
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
}, rn = (e) => e.split(".")[0] ?? "", an = (e) => {
	let t = e.replace(/_/g, " ");
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function on(e, t, n) {
	let r = rn(t), i = e?.states[t]?.attributes.device_class, a = [typeof i == "string" ? `component.${r}.entity_component.${i}.state.${n}` : null, `component.${r}.entity_component._.state.${n}`];
	if (typeof e?.localize == "function") for (let t of a) {
		if (t === null) continue;
		let n = e.localize(t);
		if (typeof n == "string" && n !== "") return n;
	}
	return an(n);
}
function sn(e, t, n) {
	let r = [...nn[rn(t)] ?? []];
	for (let i of [e?.states[t]?.state, ...n]) typeof i == "string" && i !== "" && !r.includes(i) && r.push(i);
	return r.map((n) => ({
		value: n,
		label: on(e, t, n)
	}));
}
function cn(e, t) {
	let n = e?.states[t];
	if (!n) return null;
	let r = e?.formatEntityState?.(n);
	return typeof r == "string" && r !== "" ? r : on(e, t, n.state);
}
function ln(e, t, n) {
	let r = n.length === 1 ? n[0] : void 0;
	if (r === void 0) return {
		enter: "When it enters the active states",
		leave: "When it leaves them"
	};
	let i = on(e, t, r);
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
function un(e, t) {
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
var dn = (e, t) => new CustomEvent("al-code-status", {
	detail: {
		valid: e,
		errors: t
	},
	bubbles: !0,
	composed: !0
}), fn = (e) => new CustomEvent("al-select", {
	detail: e,
	bubbles: !0,
	composed: !0
}), pn = (e, t) => new CustomEvent(e, {
	detail: t,
	bubbles: !0,
	composed: !0
}), mn = () => pn("al-select-strip", null), hn = (e) => pn("al-level-override", { value: e }), gn = (e) => pn("al-mute-toggle", { muted: e }), _n = () => pn("al-reset", null), vn = (e) => new CustomEvent("al-nav", {
	detail: e,
	bubbles: !0,
	composed: !0
}), yn = () => new CustomEvent("al-live-refresh", {
	detail: null,
	bubbles: !0,
	composed: !0
}), bn = (e) => new CustomEvent("al-timeline-range", {
	detail: e,
	bubbles: !0,
	composed: !0
}), xn = (e, t) => new CustomEvent("al-sim-toggle", {
	detail: {
		gid: e,
		on: t
	},
	bubbles: !0,
	composed: !0
}), Sn = (e = !1) => new CustomEvent("al-rebuild", {
	detail: { force: e },
	bubbles: !0,
	composed: !0
}), Cn = (e) => new CustomEvent("al-map-select", {
	detail: { id: e },
	bubbles: !0,
	composed: !0
});
//#endregion
//#region src/tree-rows.ts
function wn(e, t) {
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
var Tn = "activity_levels.groups_expanded";
function En() {
	try {
		let e = localStorage.getItem(Tn), t = e === null ? null : JSON.parse(e);
		return Array.isArray(t) ? new Set(t.filter((e) => typeof e == "string")) : /* @__PURE__ */ new Set();
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function Dn(e) {
	try {
		localStorage.setItem(Tn, JSON.stringify([...e]));
	} catch {}
}
//#endregion
//#region src/al-tree.ts
var On = (e) => e.stopPropagation(), kn = (e) => {
	(e.key === "Enter" || e.key === " ") && e.stopPropagation();
}, An = "mdi:flash", jn = "text/plain", Mn = 36, P = class extends v {
	constructor(...e) {
		super(...e), this.selection = null, this.errors = [], this.live = null, this.expanded = En(), this.dragging = null, this.target = null, this.menu = null;
	}
	static {
		this.styles = [w, n`
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
		this.dispatchEvent(fn(e));
	}
	isSelected(e) {
		return this.selection !== null && j(this.selection) === j(e);
	}
	select(e, t) {
		e.stopPropagation(), this.menu = null, this.emitSelect(t);
	}
	toggle(e) {
		let t = j(e), n = new Set(this.expanded);
		n.delete(t) || n.add(t), this.expanded = n, Dn(n);
	}
	open(e) {
		if (e.length === 0) return;
		let t = new Set(this.expanded).add(j(e));
		this.expanded = t, Dn(t);
	}
	listOf(e) {
		return {
			list: e.slice(0, -1),
			index: e[e.length - 1]
		};
	}
	addGroup(e, t, n) {
		let i = this.config;
		i && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(d(i, e, t, Je(r(i, n), n))), this.emitSelect([...e, t]));
	}
	addStimulus(e, t) {
		let n = this.config;
		if (!n) return;
		this.menu = null, this.open(e);
		let r = [...e, "stimuli"];
		this.emitChange(d(n, r, t, je(""))), this.emitSelect([...r, t]);
	}
	removeNode(e, n) {
		let r = this.config;
		if (!r || !window.confirm(`Delete ${n}? This cannot be undone after saving.`)) return;
		this.emitChange(pe(r, e));
		let i = t(e);
		this.emitSelect(i.length ? i : null);
	}
	tryMove(e, t, n) {
		let r = this.config;
		if (!r || !h(r, e, t, n).ok) return !1;
		let i = Re(r, e, t, n);
		if (i === r) return !1;
		let { parent: a, index: o } = m(e, t, n);
		return this.open(a.slice(0, -1)), this.emitChange(i), this.emitSelect([...a, o]), !0;
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(jn, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = {
			key: j(t),
			path: t
		};
	}
	onDragEnd() {
		this.dragging = null, this.target = null;
	}
	whereIn(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || Mn, i = r / 3, a = e.clientY - n.top;
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
			let t = e.dataTransfer?.getData(jn) ?? "", n = JSON.parse(t);
			return Array.isArray(n) ? n : null;
		} catch {
			return null;
		}
	}
	draggedPath(e) {
		return this.dragging === null ? null : e.dataTransfer?.types.includes(jn) === !0 ? this.dragging.path : null;
	}
	onDragOver(e, t) {
		let n = this.config, r = this.draggedPath(e);
		if (!n || r === null) return;
		e.preventDefault();
		let i = this.whereIn(e, t), { toParent: a, index: o } = this.destination(t, i, r), s = h(n, r, a, o);
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
	onNavigate(e, n) {
		switch (e.key) {
			case "Enter":
			case " ":
				this.emitSelect(n.path);
				break;
			case "ArrowDown":
				this.focusFrom(e.currentTarget, 1);
				break;
			case "ArrowUp":
				this.focusFrom(e.currentTarget, -1);
				break;
			case "ArrowRight":
				n.expandable && !n.expanded ? this.toggle(n.path) : n.expanded && this.focusFrom(e.currentTarget, 1);
				break;
			case "ArrowLeft":
				n.expanded ? this.toggle(n.path) : this.focusPath(t(n.path));
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
				let e = t.kind === "group" ? de(n, [...r, i - 1]) : void 0;
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
		return e === null || t === void 0 ? null : tn(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
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
		if (!e) return g`<ha-card><span class="muted">Loading…</span></ha-card>`;
		if (e.groups.length === 0) return this.renderEmpty();
		let t = wn(e, this.expanded), n = this.tabbableKey(t);
		return g`
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
		return g`
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
		if (t.kind === "placeholder") return g`<div class="tree-row placeholder" role="none" style="--al-indent: ${t.depth}">
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
		return g`<div
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
      aria-expanded=${t.expandable ? t.expanded ? "true" : "false" : l}
      @click=${(e) => this.select(e, t.path)}
      @keydown=${(e) => this.onRowKeydown(e, t)}
      @dragstart=${(e) => this.onDragStart(e, t.path)}
      @dragend=${this.onDragEnd}
      @dragover=${(e) => this.onDragOver(e, t)}
      @drop=${(e) => this.onDrop(e, t)}
    >
      <span class="guides"></span>
      ${t.expandable ? g`<ha-icon-button
            class="caret"
            label=${t.expanded ? "Collapse" : "Expand"}
            title=${t.expanded ? "Collapse" : "Expand"}
            @keydown=${kn}
            @click=${(e) => {
			e.stopPropagation(), this.toggle(t.path);
		}}
          >
            <ha-icon icon=${t.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </ha-icon-button>` : g`<span class="caret"></span>`}
      ${this.renderIcon(t)}
      <button
        type="button"
        class="label"
        title=${t.kind === "stimulus" ? t.stimulus?.entity ?? "" : "Edit this group"}
        @keydown=${kn}
        @click=${(e) => this.select(e, t.path)}
      >
        ${this.labelFor(t)}
      </button>
      ${i !== null && !i.verdict.ok ? g`<span class="hint">${i.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === r ? this.renderAddMenu(t) : l}
    </div>`;
	}
	renderIcon(e) {
		if (e.kind === "group" && e.group) return g`<ha-icon icon=${C[e.group.kind].icon}></ha-icon>`;
		let t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
		return t ? g`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : g`<ha-icon icon=${An}></ha-icon>`;
	}
	renderRowStatus(e, n) {
		let r = un(this.errors, n.path), i = r ? g`<span class="badge" title="${r} problem(s) in this group">${r}</span>` : l;
		if (n.kind === "stimulus") {
			let r = n.stimulus, a = r === void 0 ? null : cn(this.hass, r.entity), o = de(e, t(n.path)), s = o === void 0 ? void 0 : this.live?.voices[o.id]?.find((e) => e.label === (r?.key ?? r?.entity));
			return g`${i}${a === null ? l : g`<span class="muted chip">${a}</span>`}
      ${s ? g`<span class="chip phase ${s.phase}" title=${this.voiceTitle(s)}>${s.phase}</span>
            <span class="muted chip">${s.value.toFixed(2)}</span>` : l}`;
		}
		let a = n.group, o = a === void 0 ? void 0 : this.live?.groups[a.id], s = o?.max_value ?? a?.max_value ?? e.defaults.max_value, c = o ? Math.max(0, Math.min(100, o.value / (s || 1) * 100)) : 0;
		return g`${i}
    ${o ? g`<div class="meter" title=${this.meterTitle(o, s, n.depth === 0)}>
            <div style="width: ${c}%"></div>
          </div>
          <span class="dot ${o.gated ? "gated" : ""}" title=${o.gated ? "Gate open" : "Gate closed"}></span>` : l}`;
	}
	renderActions(e) {
		let t = e.path;
		if (e.kind === "stimulus") return g`<div class="actions" @click=${On} @keydown=${kn}>
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
		return n === void 0 ? g`<div class="actions"></div>` : g`<div class="actions" @click=${On} @keydown=${kn}>
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
        .disabled=${Ae(n.kind).length === 0}
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
		return t === void 0 ? g`${l}` : g`<div
      class="add-menu"
      role="menu"
      draggable="false"
      @click=${On}
      @keydown=${kn}
      @dragstart=${On}
    >
      ${Ae(t.kind).map((n) => g`<button
          type="button"
          role="menuitem"
          data-kind=${n}
          @click=${() => this.addGroup([...e.path, "children"], t.children.length, n)}
        >
          <ha-icon icon=${C[n].icon}></ha-icon>
          <span>
            <strong>${C[n].label}</strong>
            <div class="muted">${C[n].definition}</div>
          </span>
        </button>`)}
    </div>`;
	}
};
b([a({ attribute: !1 })], P.prototype, "hass", void 0), b([a({ attribute: !1 })], P.prototype, "config", void 0), b([a({ attribute: !1 })], P.prototype, "selection", void 0), b([a({ attribute: !1 })], P.prototype, "errors", void 0), b([a({ attribute: !1 })], P.prototype, "live", void 0), b([_()], P.prototype, "expanded", void 0), b([_()], P.prototype, "dragging", void 0), b([_()], P.prototype, "target", void 0), b([_()], P.prototype, "menu", void 0), P = b([T("al-tree")], P);
//#endregion
//#region src/ha-links.ts
function Nn(e, t, n) {
	return t ? g`<a href=${`/config/${e === "device" ? "devices" : "areas"}/${e}/${encodeURIComponent(t)}`}>${n}</a>` : n;
}
function Pn(e, t, n, r = "Open entity", i, a = "Open device", o = !1) {
	let s = n && (t?.states?.[n] || t?.entities?.[n]), c = i ?? (n ? t?.entities?.[n]?.device_id : null), u = () => e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: n },
		bubbles: !0,
		composed: !0
	}));
	return g`${s ? o ? g`<button type="button" @click=${u}>${r}</button>` : g`<ha-button @click=${u}>${r}</ha-button>` : l}
    ${c ? Nn("device", c, a) : l}`;
}
//#endregion
//#region src/convert.ts
var Fn = (e) => e == null || e === "" ? null : e;
function In(e, t) {
	if (t != null) switch (e) {
		case "duration": return O(t);
		case "boolean": return t ? "true" : "false";
		default: return t;
	}
}
function Ln(e, t) {
	if (t == null || t === "") return null;
	switch (e) {
		case "duration": return k(t);
		case "boolean": return t === !0 || t === "true";
		case "number":
		case "multiplier": {
			let e = typeof t == "number" ? t : Number(t);
			return Number.isNaN(e) ? null : e;
		}
		default: return String(t);
	}
}
function Rn(e, t) {
	if (t == null) return "unset";
	switch (e) {
		case "duration": return tn(t);
		case "boolean": return t ? "Yes" : "No";
		case "multiplier": return zn(t);
		default: return String(t);
	}
}
var zn = (e) => `${e.toFixed(1)}×`, Bn = [
	"kind",
	"floor_id",
	"area_id",
	"id",
	"name"
], Vn = [
	"mix",
	"null_handling",
	"gain"
], Hn = {
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
}, Un = {
	id: "Identifies the group and its entities. Changing it re-creates them.",
	name: "Friendly name; falls back to the area's name, then to the id.",
	kind: "What this is on the property. It decides what can go inside it.",
	floor_id: "Bind this to a Home Assistant floor to reuse its name.",
	area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
	mix: "How stimuli and child groups combine into this group's value.",
	null_handling: "Whether idle contributors count as zero or drop out of the mean.",
	gain: "Scales this group's contribution to its parent."
}, Wn = (e) => Hn[e.name] ?? e.name, Gn = (e) => Un[e.name] ?? "", Kn = [
	"id",
	"name",
	"kind",
	"floor_id",
	"area_id",
	"mix",
	"null_handling",
	"gain"
], qn = [
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
], Jn = [{
	value: "zero",
	label: "Idle counts as 0"
}, {
	value: "ignore",
	label: "Ignore idle"
}], Yn = "How this group's stimuli and children combine into one level.", Xn = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", Zn = "How loudly 'somebody is here' plays in this group's mix.", Qn = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, $n = { select: {
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
} }, er = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, tr = (e, t, n) => {
	switch (e) {
		case "null_handling": return t.mix === "mean";
		case "gain": return !n;
		case "floor_id": return t.kind === "floor";
		case "area_id": return ze.has(t.kind);
		default: return !0;
	}
}, nr = (e, t) => {
	let n = [...Ae(t)];
	return n.includes(e.kind) || n.push(e.kind), { select: {
		mode: "dropdown",
		options: n.map((e) => ({
			value: e,
			label: C[e].label
		}))
	} };
};
function rr(e, t, n, r, i = null) {
	let a = {
		id: { text: {} },
		name: { text: {} },
		kind: nr(e, i),
		floor_id: { floor: {} },
		area_id: { area: {} },
		mix: { select: {
			mode: "dropdown",
			options: qn
		} },
		null_handling: { select: {
			mode: "dropdown",
			options: Jn
		} },
		gain: er
	};
	return n.filter((n) => tr(n, e, t)).map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function ir(e, t, n, r) {
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
	return Object.fromEntries(n.filter((n) => tr(n, e, t) && (n !== "area_id" || e.area_id !== null) && (n !== "floor_id" || e.floor_id !== null)).map((e) => [e, i[e]]));
}
function ar(e, t) {
	let n = { ...e };
	return "id" in t && (n.id = String(t.id ?? "")), "name" in t && (n.name = Fn(t.name)), "kind" in t && typeof t.kind == "string" && (n.kind = t.kind), "floor_id" in t && (n.floor_id = Fn(t.floor_id)), "area_id" in t && (n.area_id = Fn(t.area_id)), "mix" in t && (n.mix = t.mix ?? e.mix), "null_handling" in t && (n.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), n;
}
var or = (e, t) => Kn.find((n) => e[n] !== t[n]), sr = (e) => e.id === "" || RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function cr(e, t, n, i, a) {
	let o = {
		...e,
		[t]: n
	};
	return n === null ? o : (sr(e) && (o.id = a ? r(a, n) : oe(n)), e.name === null && i !== null && (o.name = i), o);
}
var lr = (e, t, n, r) => cr(e, "area_id", t, n, r), ur = (e, t, n, r) => cr(e, "floor_id", t, n, r), dr = "activity_levels.panels";
function fr() {
	try {
		let e = localStorage.getItem(dr), t = e === null ? null : JSON.parse(e);
		return typeof t != "object" || !t || Array.isArray(t) ? {} : t;
	} catch {
		return {};
	}
}
function pr(e, t) {
	let n = fr()[e];
	return typeof n == "boolean" ? n : t;
}
function mr(e, t) {
	try {
		localStorage.setItem(dr, JSON.stringify({
			...fr(),
			[e]: t
		}));
	} catch {}
}
//#endregion
//#region src/panels.ts
function hr(e, t, n, r, i, a, o = l) {
	let s = `${e}:${t}`;
	return g`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${t}
    ?expanded=${pr(s, i)}
    @expanded-changed=${(e) => {
		mr(s, e.detail.expanded);
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
var gr = class extends v {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [w, n`
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
		return this.config && this.path ? E(this.config, this.path) : void 0;
	}
	get edges() {
		return (this.group?.adjacent ?? []).map((e) => ({
			id: Te(e),
			connection: De(e),
			one_way: i(e)
		}));
	}
	emit(e) {
		let { config: t, path: n } = this;
		!t || !n || this.dispatchEvent(N(y(t, [...n, "adjacent"], e), void 0, !0));
	}
	edit(e, t) {
		this.emit(this.edges.map((n, r) => r === e ? {
			...n,
			...t
		} : n));
	}
	nameOf(e) {
		return (this.config ? f(this.config).find(({ group: t }) => t.id === e) : void 0)?.group.name ?? e;
	}
	candidates() {
		let e = this.group;
		if (!this.config || !e) return [];
		let t = /* @__PURE__ */ new Set([
			e.id,
			...this.edges.map((e) => e.id),
			...Ke(this.config, e.id).map((e) => e.group.id)
		]);
		return f(this.config).map(({ group: e }) => e).filter((e) => ze.has(e.kind) && !t.has(e.id));
	}
	errorFor(e) {
		let t = `${(this.path ?? []).join("/")}/adjacent/${e}`;
		return this.errors.find((e) => e.path === t || e.path.startsWith(`${t}/`))?.message;
	}
	render() {
		let e = this.group;
		if (!this.config || !e) return l;
		let t = Ke(this.config, e.id), n = this.candidates();
		return g`
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
          ${this.edges.length === 0 && t.length === 0 ? g`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>` : l}
        </tbody>
      </table>
      ${n.length === 0 ? l : g`<select
            class="add-edge"
            aria-label="Add an adjacent group"
            .value=${""}
            @change=${(e) => {
			let t = e.target;
			t.value !== "" && (this.emit([...this.edges, {
				id: t.value,
				connection: Ce,
				one_way: !1
			}]), t.value = "");
		}}
          >
            <option value="">Add an adjacent group…</option>
            ${n.map((e) => g`<option value=${e.id}>${e.name ?? e.id}</option>`)}
          </select>`}
    `;
	}
	renderOwn(t, n) {
		let r = this.errorFor(n), i = this.nameOf(t.id);
		return g`<tr class="own" data-id=${t.id}>
      <td>${i} ${r ? g`<div class="muted error">${r}</div>` : l}</td>
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${i}"
          .value=${t.connection}
          @change=${(e) => this.edit(n, { connection: e.target.value })}
        >
          ${ae.map((n) => g`<option value=${n} ?selected=${n === t.connection}>${e[n]}</option>`)}
        </select>
      </td>
      <td>
        <input
          class="both-ways"
          type="checkbox"
          aria-label="You can walk both ways between here and ${i}"
          title="Unchecked means you can only go this way"
          .checked=${!t.one_way}
          @change=${(e) => this.edit(n, { one_way: !e.target.checked })}
        />
      </td>
      <td>
        <ha-icon-button
          label="Remove ${i}"
          data-action="remove"
          @click=${() => this.emit(this.edges.filter((e, t) => t !== n))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
      </td>
    </tr>`;
	}
	renderDeclared(t, n) {
		let r = t.name ?? t.id;
		return g`<tr class="declared" data-id=${t.id}>
      <td><span class="muted">declared on</span> ${r}</td>
      <td>${e[n.connection]}</td>
      <td>${n.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
	}
};
b([a({ attribute: !1 })], gr.prototype, "config", void 0), b([a({ attribute: !1 })], gr.prototype, "path", void 0), b([a({ attribute: !1 })], gr.prototype, "errors", void 0), gr = b([T("al-adjacency-table")], gr);
//#endregion
//#region src/al-override-field.ts
var _r = { select: {
	mode: "dropdown",
	options: [{
		value: "true",
		label: "Yes"
	}, {
		value: "false",
		label: "No"
	}]
} };
function vr(e, t) {
	return e.select?.options?.find((e) => e.value === t)?.label;
}
var F = class extends v {
	constructor(...e) {
		super(...e), this.label = "", this.selector = { text: {} }, this.value = null, this.inherited = null, this.inheritedFrom = "defaults", this.hint = "", this.kind = "number", this.disabled = !1;
	}
	static {
		this.styles = [w, n`
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
		e.stopPropagation(), this.emit(Ln(this.kind, e.detail?.value));
	}
	onReset() {
		this.emit(null);
	}
	describeInherited() {
		let e = this.inherited;
		if (this.kind === "select" && e != null) {
			let t = vr(this.selector, String(e));
			if (t !== void 0) return t;
		}
		return Rn(this.kind, e);
	}
	render() {
		let e = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`, t = this.hint === "" ? e : `${this.hint} ${e}`;
		return g`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? _r : this.selector}
          .label=${this.label}
          .required=${!1}
          .disabled=${this.disabled}
          .value=${In(this.kind, this.value)}
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
      ${this.error ? g`<div class="muted error msg">${this.error}</div>` : l}
    `;
	}
};
b([a({ attribute: !1 })], F.prototype, "hass", void 0), b([a()], F.prototype, "label", void 0), b([a({ attribute: !1 })], F.prototype, "selector", void 0), b([a({ attribute: !1 })], F.prototype, "value", void 0), b([a({ attribute: !1 })], F.prototype, "inherited", void 0), b([a({ attribute: "inherited-from" })], F.prototype, "inheritedFrom", void 0), b([a()], F.prototype, "hint", void 0), b([a()], F.prototype, "kind", void 0), b([a()], F.prototype, "error", void 0), b([a({ type: Boolean })], F.prototype, "disabled", void 0), F = b([T("al-override-field")], F);
//#endregion
//#region src/stimulus-form.ts
var yr = {
	entity: "Entity",
	mode: "Mode",
	to: "Active states",
	edges: "Fire on",
	gain: "Gain",
	key: "Label",
	envelope: "Envelope preset"
}, br = {
	entity: "The entity whose state drives this stimulus.",
	mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
	to: "Which states of this entity count as active.",
	edges: "Which crossings fire a trigger. At least one.",
	gain: "How loudly this stimulus contributes to its group.",
	key: "Optional name for this trigger; defaults to the entity id.",
	envelope: "Preset the overrides below start from."
}, xr = (e) => yr[e.name] ?? e.name, Sr = (e) => br[e.name] ?? "", Cr = [
	"entity",
	"mode",
	"gain",
	"key",
	"envelope"
], wr = { duration: { enable_millisecond: !0 } }, Tr = { number: {
	min: 0,
	step: .1,
	mode: "box",
	unit_of_measurement: "×"
} }, Er = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, Dr = "Allow retrigger", Or = "When a new trigger is honoured while the envelope is still active.", kr = "Stacks", Ar = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", jr = { select: {
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
} }, Mr = { select: {
	mode: "list",
	options: [{
		value: "sustained",
		label: "Sustained — hold while it is active"
	}, {
		value: "momentary",
		label: "Momentary — fire on each change"
	}]
} }, Nr = [
	"attack",
	"decay",
	"impulse"
], Pr = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", Fr = (e, t) => e.mode === "momentary" && Nr.includes(t), Ir = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, Lr = "(unknown preset — using built-in defaults)", Rr = [
	{
		name: "attack",
		label: "Attack",
		kind: "duration",
		selector: wr
	},
	{
		name: "decay",
		label: "Decay",
		kind: "duration",
		selector: wr
	},
	{
		name: "sustain",
		label: "Sustain",
		kind: "multiplier",
		selector: Tr
	},
	{
		name: "release",
		label: "Release",
		kind: "duration",
		selector: wr
	},
	{
		name: "impulse",
		label: "Impulse",
		kind: "boolean",
		selector: _r
	},
	{
		name: "retrigger",
		label: Dr,
		kind: "select",
		selector: jr,
		hint: Or
	},
	{
		name: "stack",
		label: kr,
		kind: "boolean",
		selector: _r,
		hint: Ar
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: Ir
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: wr
	}
], zr = [
	"entity",
	"mode",
	"to",
	"edges",
	"key"
], Br = (e) => zr.filter((t) => t !== "edges" || e.mode === "momentary"), Vr = ["envelope", "gain"], Hr = "How a single trigger rises and falls over time.", Ur = "What makes this stimulus fire, and what it is called in the mix.", Wr = "Change part of the preset for this stimulus only.", Gr = (e) => Rr.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, Kr = (e) => [{
	value: "",
	label: "(default preset)"
}, ...e.envelopes.map((e) => ({
	value: e.id,
	label: e.id
}))];
function qr(e, t, n, r) {
	let i = ln(n, t.entity, t.to), a = {
		entity: { entity: {} },
		mode: Mr,
		to: { select: {
			mode: "dropdown",
			multiple: !0,
			custom_value: !0,
			options: sn(n, t.entity, t.to)
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
		gain: Er,
		key: { text: {} },
		envelope: { select: {
			mode: "dropdown",
			options: Kr(e)
		} }
	};
	return r.map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function Jr(e, t) {
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
var Yr = (e) => Array.isArray(e) ? e.filter((e) => typeof e == "string" && e !== "") : [];
function Xr(e, t) {
	let n = { ...e };
	if ("entity" in t && (n.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (n.mode = t.mode), "to" in t && (n.to = Yr(t.to)), "edges" in t) {
		let e = Yr(t.edges).filter((e) => e === "enter" || e === "leave");
		e.length > 0 && (n.edges = e);
	}
	return "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (n.key = Fn(t.key)), "envelope" in t && (n.envelope = Fn(t.envelope)), n;
}
var Zr = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]);
function Qr(e, t) {
	return Zr(e.to, t.to) ? Zr(e.edges, t.edges) ? Cr.find((n) => e[n] !== t[n]) : "edges" : "to";
}
function $r(e, t, n) {
	let r = te(e, t.envelope);
	return r ? r[n] === null || r[n] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : Lr;
}
function ei(e, t) {
	return t == null || e === void 0 ? null : tn(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
//#endregion
//#region src/sketch.ts
var ti = (e) => e.release * e.sustain, ni = (e) => Math.max(1, e.sustain), ri = (e) => e.sustain / ni(e);
function ii(e, t = .25) {
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
	let n = ti(e), r = e.attack + e.decay + n, i = r > 0 ? r * t / (1 - t) : 1, a = r + i, o = 1 / ni(e), s = ri(e), c = 0, l = [{
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
function ai(e, t = .25) {
	let n = ii(e, t), r = (e) => ((n[e]?.x ?? 0) + (n[e + 1]?.x ?? 0)) / 2;
	if (e.impulse) {
		let t = [{
			text: "impulse",
			x: 0
		}];
		return e.release > 0 && t.push({
			text: `R ${tn(e.release)}`,
			x: r(1)
		}), t;
	}
	let i = [];
	return e.attack > 0 && i.push({
		text: `A ${tn(e.attack)}`,
		x: r(0)
	}), e.decay > 0 && i.push({
		text: `D ${tn(e.decay)}`,
		x: r(1)
	}), i.push({
		text: `S ${zn(e.sustain)}`,
		x: r(2)
	}), ti(e) > 0 && i.push({
		text: `R ${tn(e.release)}`,
		x: r(3)
	}), i;
}
//#endregion
//#region src/al-envelope-sketch.ts
var oi = 10, si = 190, ci = 58, li = 72, ui = (e) => oi + e * 180, di = (e) => ci - e * 48, fi = (e) => String(Math.round(e * 10) / 10), pi = (e, t) => `${fi(e)},${fi(t)}`, mi = (e) => Math.min(184, Math.max(16, ui(e))), hi = class extends v {
	constructor(...e) {
		super(...e), this.envelope = null;
	}
	static {
		this.styles = [w, n`
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
		if (!e) return l;
		let t = ii(e), n = t[0], r = t[t.length - 1], i = t.map((e) => pi(ui(e.x), di(e.y))).join(" "), a = `${pi(ui(n.x), ci)} ${i} ${pi(ui(r.x), ci)}`, o = ai(e), s = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
		return g`
      <svg viewBox="0 0 200 80" role="img" aria-label=${s}>
        <title>${s}</title>
        <line class="grid" x1=${oi} y1=${ci} x2=${si} y2=${ci}></line>
        ${e.impulse ? l : S`<line
              class="grid"
              x1=${oi}
              y1=${fi(di(ri(e)))}
              x2=${si}
              y2=${fi(di(ri(e)))}
            ></line>`}
        <polygon class="area" points=${a}></polygon>
        <polyline class="curve" points=${i}></polyline>
        ${o.map((e) => S`<text class="caption" x=${fi(mi(e.x))} y=${li} text-anchor="middle">${e.text}</text>`)}
      </svg>
    `;
	}
};
b([a({ attribute: !1 })], hi.prototype, "envelope", void 0), hi = b([T("al-envelope-sketch")], hi);
//#endregion
//#region src/al-presence-overrides.ts
var gi = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, _i = class extends v {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [w];
	}
	setPresence(e, t) {
		let { config: n, path: r } = this;
		if (!n || !r) return;
		let i = E(n, r);
		if (!i) return;
		let a = y(n, [...r, "presence"], {
			...i.presence ?? c(),
			[e]: t
		});
		this.dispatchEvent(N(a, `${j(r)}:presence:${e}`));
	}
	render() {
		let { config: e, path: t } = this, n = e && t ? E(e, t) : void 0;
		if (!e || !t || !n) return l;
		let r = n.presence ?? c(), i = r.envelope ?? x(e).envelope, a = p(e, {
			...r,
			envelope: i
		}), o = M(this.errors, [...t, "presence"]);
		return g`
      <ha-selector
        class="presence-envelope"
        .hass=${this.hass}
        .selector=${{ select: {
			mode: "dropdown",
			options: Kr(e)
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
        .selector=${Er}
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
        .selector=${gi}
        .value=${r.activity_floor}
        .inherited=${x(e).activity.floor}
        .inheritedFrom=${"presence"}
        .error=${o.activity_floor}
        @value-changed=${(e) => this.setPresence("activity_floor", e.detail.value ?? null)}
      ></al-override-field>
      ${Rr.map((e) => g`<al-override-field
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
b([a({ attribute: !1 })], _i.prototype, "hass", void 0), b([a({ attribute: !1 })], _i.prototype, "config", void 0), b([a({ attribute: !1 })], _i.prototype, "path", void 0), b([a({ attribute: !1 })], _i.prototype, "errors", void 0), _i = b([T("al-presence-overrides")], _i);
//#endregion
//#region src/al-group-editor.ts
var vi = "People can leave the property from here, so presence can move from here to Away.", yi = class extends v {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [w, n`
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
		this.dispatchEvent(fn(e));
	}
	onIdentityChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = E(t, n);
		if (!r) return;
		let i = e.detail?.value ?? {}, a = ar(r, i);
		"area_id" in i && a.area_id !== r.area_id && (a = lr(a, a.area_id, a.area_id === null ? null : this.areaName(a.area_id), t)), "floor_id" in i && a.floor_id !== r.floor_id && (a = ur(a, a.floor_id, a.floor_id === null ? null : this.floorName(a.floor_id), t));
		let o = or(a, r);
		o !== void 0 && this.emitChange(y(t, n, a), `${j(n)}:${o}`);
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
		let r = E(t, n);
		if (!r) return;
		let i = ar(r, e.detail?.value ?? {}), a = or(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${j(n)}:${a}`);
	}
	setField(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(y(n, [...r, e], t), `${j(r)}:${e}`);
	}
	onDelete() {
		let { config: e, path: n } = this;
		if (!e || !n) return;
		let r = E(e, n);
		if (!r || !window.confirm(`Delete group "${r.name || r.id}" and everything in it?`)) return;
		this.emitChange(pe(e, n));
		let i = t(n);
		this.emitSelect(i.length ? i : null);
	}
	render() {
		let { config: e, path: n } = this;
		if (!e || !n || n.length === 0) return g`<ha-card><span class="muted">Select a group.</span></ha-card>`;
		let r = E(e, n);
		if (!r) return g`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		let i = n.length === 2, a = this.errors.filter((e) => e.path === j(n)), o = M(this.errors, n), s = n.length > 2 ? E(e, t(n)) : void 0;
		return g`
      <ha-card header="Group">
        ${r.area_id ? Nn("area", r.area_id, "Open Home Assistant area") : l}
        ${a.map((e) => g`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${hr("group", "identity", "Identity", C[r.kind].definition, !0, g`
            <ha-form
              .hass=${this.hass}
              .data=${ir(r, i, Bn, e)}
              .schema=${rr(r, i, Bn, e, s?.kind ?? null)}
              .error=${o}
              .computeLabel=${Wn}
              .computeHelper=${Gn}
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(e, r, o)}
          `)}
        ${hr("group", "mix", "Mix", Yn, !0, this.renderMix(e, r, i, o))}
        ${this.renderAdjacency(e, r, o)} ${this.renderPresence(e, r, n)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderMix(e, t, n, r) {
		return g`
      <ha-form
        .hass=${this.hass}
        .data=${ir(t, n, Vn, e)}
        .schema=${rr(t, n, Vn, e)}
        .error=${r}
        .computeLabel=${Wn}
        .computeHelper=${Gn}
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${Hn.max_value}
        kind="number"
        .selector=${Qn}
        .value=${t.max_value}
        .inherited=${e.defaults.max_value}
        .inheritedFrom=${"defaults"}
        .error=${r.max_value}
        @value-changed=${(e) => this.setField("max_value", e.detail.value)}
      ></al-override-field>
      <al-override-field
        .hass=${this.hass}
        .label=${Hn.precision}
        kind="select"
        .selector=${$n}
        .value=${t.precision === null ? null : String(t.precision)}
        .inherited=${String(e.defaults.precision)}
        .inheritedFrom=${"defaults"}
        .error=${r.precision}
        @value-changed=${(e) => this.setField("precision", e.detail.value === null ? null : Number(e.detail.value))}
      ></al-override-field>
    `;
	}
	renderAdjacency(e, t, n) {
		return ze.has(t.kind) ? hr("group", "adjacent", "Adjacent groups", Xn, !0, g`
        <al-adjacency-table
          .config=${e}
          .path=${this.path}
          .errors=${this.errors}
        ></al-adjacency-table>
        ${this.renderExit(t, n)}
      `) : l;
	}
	renderExit(e, t) {
		return g`<div class="exit row">
      <ha-switch
        .checked=${e.exit === !0}
        @change=${(e) => this.setField("exit", e.target.checked === !0)}
      ></ha-switch>
      <div>
        <div>Leads off the property</div>
        <div class="muted">${vi}</div>
        ${t.exit ? g`<div class="error">${t.exit}</div>` : l}
      </div>
    </div>`;
	}
	renderPresence(e, t, n) {
		return x(e).enabled ? hr("group", "presence", "Presence", Zn, !1, g`<al-presence-overrides
        .hass=${this.hass}
        .config=${e}
        .path=${n}
        .errors=${this.errors}
      ></al-presence-overrides>`) : l;
	}
	renderStale(e, t, n) {
		if (ze.has(t.kind)) return l;
		let r = [t.adjacent.length > 0 ? "adjacent groups" : null, t.exit === !0 ? "a way off the property" : null].filter((e) => e !== null);
		if (r.length === 0) return l;
		let i = n.adjacent ?? n.exit ?? `${C[t.kind].label} groups have no ${r.join(" and no ")}.`;
		return g`<div class="stale row">
      <div class="grow error">${i}</div>
      <ha-button appearance="plain" @click=${() => this.clearStale(e)}>Remove</ha-button>
    </div>`;
	}
	clearStale(e) {
		let t = this.path;
		if (!t) return;
		let n = y(y(e, [...t, "adjacent"], []), [...t, "exit"], !1);
		this.dispatchEvent(N(n, void 0, !0));
	}
};
b([a({ attribute: !1 })], yi.prototype, "hass", void 0), b([a({ attribute: !1 })], yi.prototype, "config", void 0), b([a({ attribute: !1 })], yi.prototype, "path", void 0), b([a({ attribute: !1 })], yi.prototype, "errors", void 0), yi = b([T("al-group-editor")], yi);
//#endregion
//#region src/al-stimulus-editor.ts
var bi = class extends v {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null;
	}
	static {
		this.styles = [w, n`
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
		let r = Qe(t, n);
		if (!r) return;
		let i = Xr(r, e.detail?.value ?? {}), a = Qr(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${j(n)}:${a}`);
	}
	setOverride(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(y(n, [...r, e], t), `${j(r)}:${e}`);
	}
	renderLive(e, t) {
		return e ? g`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${e.phase}">${e.phase}</span>
      <span class="chip">${e.value.toFixed(2)}</span>
      ${t === null ? l : g`<span class="muted chip">ends in ${t}</span>`}
      <span class="dot ${e.gate ? "gated" : ""}" title=${e.gate ? "Gate open" : "Gate closed"}></span>
    </div>` : l;
	}
	renderOverride(e, t, n, r) {
		let { config: i } = this, a = Fr(t, e.name);
		return g`<al-override-field
      .hass=${this.hass}
      .label=${e.label}
      .disabled=${a}
      .hint=${a ? Pr : e.hint ?? ""}
      .kind=${e.kind}
      .selector=${e.selector}
      .value=${t[e.name]}
      .inherited=${n[e.name]}
      .inheritedFrom=${i ? $r(i, t, e.name) : "defaults"}
      .error=${r[e.name]}
      @value-changed=${(t) => this.setOverride(e.name, t.detail.value)}
    ></al-override-field>`;
	}
	render() {
		let { config: e, path: n } = this;
		if (!e || !n || n.length < 3) return g`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
		let r = Qe(e, n);
		if (!r) return g`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
		let i = E(e, t(n)), a = M(this.errors, n), o = this.errors.filter((e) => e.path === j(n)), s = p(e, r), c = this.live?.voices[i?.id ?? ""]?.find((e) => e.label === (r.key ?? r.entity)), u = ei(this.live?.now, c?.phase_ends), d = Gr(r);
		return g`
      <ha-card header="Stimulus">
        ${Pn(this, this.hass, r.entity)}
        ${o.map((e) => g`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${hr("stimulus", "source", "Source", Ur, !0, g`
            <ha-form
              .hass=${this.hass}
              .data=${Jr(r, Br(r))}
              .schema=${qr(e, r, this.hass, Br(r))}
              .error=${a}
              .computeLabel=${xr}
              .computeHelper=${Sr}
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `)}
        ${hr("stimulus", "envelope", "Envelope", Hr, !0, g`
            <ha-form
              .hass=${this.hass}
              .data=${Jr(r, Vr)}
              .schema=${qr(e, r, this.hass, Vr)}
              .error=${a}
              .computeLabel=${xr}
              .computeHelper=${Sr}
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(c, u)}
            <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
          `)}
        ${hr("stimulus", "overrides", "Override preset", Wr, !1, Rr.map((e) => this.renderOverride(e, r, s, a)), d === 0 ? l : g`<span class="badge">${d} overridden</span>`)}
      </ha-card>
    `;
	}
};
b([a({ attribute: !1 })], bi.prototype, "hass", void 0), b([a({ attribute: !1 })], bi.prototype, "config", void 0), b([a({ attribute: !1 })], bi.prototype, "path", void 0), b([a({ attribute: !1 })], bi.prototype, "errors", void 0), b([a({ attribute: !1 })], bi.prototype, "live", void 0), bi = b([T("al-stimulus-editor")], bi);
//#endregion
//#region src/al-envelopes.ts
var xi = {
	label: "Name",
	id: "ID",
	attack: "Attack",
	decay: "Decay",
	sustain: "Sustain",
	release: "Release",
	impulse: "Impulse"
}, Si = {
	label: "What this preset is called in the panel. Blank shows the id instead.",
	id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
	attack: "Time to rise from zero to the stimulus gain.",
	decay: "Time to travel from the peak to the sustain level.",
	sustain: "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
	release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
	impulse: "Fire and forget: the trigger ends the moment it starts, leaving only the release."
}, Ci = [
	"label",
	"id",
	"attack",
	"decay",
	"sustain",
	"release",
	"impulse"
], wi = [
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
		selector: wr
	},
	{
		name: "decay",
		selector: wr
	},
	{
		name: "sustain",
		selector: Tr
	},
	{
		name: "release",
		selector: wr
	},
	{
		name: "impulse",
		selector: { boolean: {} }
	}
], Ti = [
	{
		name: "retrigger",
		label: Dr,
		kind: "select",
		selector: jr,
		hint: Or
	},
	{
		name: "stack",
		label: kr,
		kind: "boolean",
		selector: _r,
		hint: Ar
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: Ir
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: wr
	}
], Ei = "text/plain", Di = 36, Oi = (e) => e.stopPropagation(), I = class extends v {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => xi[e.name] ?? e.name, this.computeHelper = (e) => Si[e.name] ?? "";
	}
	static {
		this.styles = [w, n`
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
		!t || !n || t.defaults.envelope === n.id || this.emitChange(y(t, ["defaults", "envelope"], n.id), "defaults:envelope");
	}
	reorder(e, t) {
		let n = this.config;
		if (!n) return;
		let r = fe(n, ["envelopes"], e, t);
		if (r === n) return;
		let i = n.envelopes[this.selected]?.id, a = r.envelopes.findIndex((e) => e.id === i);
		this.selected = a === -1 ? 0 : a, this.blocked = null, this.emitChange(r);
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(Ei, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
	}
	onDragEnd() {
		this.dragging = null, this.dropAt = null;
	}
	slotFor(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || Di;
		return e.clientY - n.top < r / 2 ? t : t + 1;
	}
	isOurs(e) {
		return this.dragging !== null && e.dataTransfer?.types.includes(Ei) === !0;
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
		this.emitChange(d(e, ["envelopes"], t, re(ue(e, "preset")))), this.selected = t;
	}
	removePreset(e) {
		let t = this.config;
		if (!t) return;
		let n = t.envelopes[e];
		if (!n) return;
		let r = ie(t, n.id);
		if (r.defaults || r.groups.length > 0) {
			this.selected = e, this.blocked = {
				id: n.id,
				...r
			};
			return;
		}
		window.confirm(`Delete envelope preset "${n.id}"?`) && (this.blocked = null, this.emitChange(pe(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && --this.selected);
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config, n = this.selected, r = t?.envelopes[n];
		if (!t || !r) return;
		let i = e.detail?.value ?? {}, a = typeof i.label == "string" ? i.label : r.label ?? "", o = {
			...r,
			label: a.trim() === "" ? null : a,
			id: String(i.id ?? ""),
			attack: k(i.attack) ?? r.attack,
			decay: k(i.decay) ?? r.decay,
			sustain: typeof i.sustain == "number" ? i.sustain : r.sustain,
			release: k(i.release) ?? r.release,
			impulse: typeof i.impulse == "boolean" ? i.impulse : r.impulse
		}, s = Ci.find((e) => o[e] !== r[e]);
		if (s === void 0) return;
		let c = ["envelopes", n], l = y(u(t, n, o.id), c, o);
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
		this.emitChange(y(n, i, t), j(i));
	}
	render() {
		let e = this.config;
		return e ? g`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(e)}</div>
        <div>${this.renderEditor(e)}</div>
      </div>
    ` : g`<ha-card><span class="muted">Loading…</span></ha-card>`;
	}
	renderList(e) {
		let t = this.blocked;
		return g`
      <ha-card>
        <h3>Presets</h3>
        ${e.envelopes.map((t, n) => this.renderPresetRow(e, t, n))}
        ${e.envelopes.length === 0 ? g`<p class="muted">No presets yet.</p>` : l}
        ${t ? g`<ha-alert alert-type="warning">${Ai(t)}</ha-alert>` : l}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderPresetRow(e, t, n) {
		let r = un(this.errors, ["envelopes", n]), i = e.defaults.envelope === t.id, a = this.dragging === null || this.dropAt === null ? "" : this.dropClass(n), o = [
			"row",
			"preset",
			this.selected === n ? "selected" : "",
			this.dragging === n ? "dragging" : "",
			a
		].filter(Boolean).join(" ");
		return g`<div
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
          >${t.id === "" && t.label === null ? "(unnamed preset)" : ne(t)}</span
        >
        ${t.label !== null && t.label.trim() !== "" ? g`<span class="muted id">${t.id}</span>` : l}
      </button>
      ${r ? g`<span class="badge" title="${r} problem(s)">${r}</span>` : l}
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
          @dragstart=${Oi}
          @click=${Oi}
          @change=${() => this.setDefault(n)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
        @dragstart=${Oi}
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
		if (!n) return g`<ha-card
        ><span class="muted">Select a preset.</span></ha-card
      >`;
		let r = ["envelopes", t], i = M(this.errors, r), a = this.errors.filter((e) => e.path === j(r)), o = {
			label: n.label ?? "",
			id: n.id,
			attack: O(n.attack),
			decay: O(n.decay),
			sustain: n.sustain,
			release: O(n.release),
			impulse: n.impulse
		}, s = ki(e, t, n);
		return g`
      <ha-card header="Envelope preset">
        ${a.map((e) => g`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${s ? g`<ha-alert alert-type="warning">${s}</ha-alert>` : l}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${wi}
          .error=${i}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${n}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Ti.map((t) => g`<al-override-field
              .hass=${this.hass}
              .label=${t.label}
              .hint=${t.hint ?? ""}
              .kind=${t.kind}
              .selector=${t.kind === "boolean" ? _r : t.selector}
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
b([a({ attribute: !1 })], I.prototype, "hass", void 0), b([a({ attribute: !1 })], I.prototype, "config", void 0), b([a({ attribute: !1 })], I.prototype, "errors", void 0), b([a({ type: Boolean })], I.prototype, "narrow", void 0), b([_()], I.prototype, "selected", void 0), b([_()], I.prototype, "blocked", void 0), b([_()], I.prototype, "dragging", void 0), b([_()], I.prototype, "dropAt", void 0), I = b([T("al-envelopes")], I);
function ki(e, t, n) {
	return n.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((e, r) => r !== t && e.id === n.id) ? `Another preset already uses the id "${n.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Ai(e) {
	let t = [];
	return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
//#endregion
//#region src/al-defaults.ts
var ji = {
	envelope: "Default envelope",
	max_value: "Max value",
	precision: "Precision",
	unavailable: "When unavailable",
	retrigger: Dr,
	stack: kr,
	debounce: "Debounce",
	safety_refresh: "Safety refresh",
	min_wake_interval: "Minimum wake interval"
}, Mi = {
	envelope: "Preset used when a stimulus names none.",
	max_value: "Limiter for groups that don't set their own.",
	precision: "Display decimals.",
	unavailable: "What an entity going unavailable does to its trigger.",
	retrigger: Or,
	stack: Ar,
	debounce: "Minimum time between triggers per stimulus.",
	safety_refresh: "Periodic recompute as a self-heal.",
	min_wake_interval: "Floor for the scheduler's timer delay."
}, Ni = [
	"envelope",
	"max_value",
	"precision",
	"unavailable",
	"retrigger",
	"stack",
	"debounce",
	"safety_refresh",
	"min_wake_interval"
], Pi = { duration: { enable_millisecond: !0 } }, Fi = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, Ii = { select: {
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
} }, Li = { boolean: {} }, Ri = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, zi = class extends v {
	constructor(...e) {
		super(...e), this.errors = [], this.computeLabel = (e) => ji[e.name] ?? e.name, this.computeHelper = (e) => Mi[e.name] ?? "";
	}
	static {
		this.styles = [w, n`
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
				selector: Fi
			},
			{
				name: "precision",
				selector: Ii
			},
			{
				name: "unavailable",
				selector: Ri
			},
			{
				name: "retrigger",
				selector: jr
			},
			{
				name: "stack",
				selector: Li
			},
			{
				name: "debounce",
				selector: Pi
			},
			{
				name: "safety_refresh",
				selector: Pi
			},
			{
				name: "min_wake_interval",
				selector: Pi
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
			debounce: k(r.debounce) ?? n.debounce,
			safety_refresh: k(r.safety_refresh) ?? n.safety_refresh,
			min_wake_interval: k(r.min_wake_interval) ?? n.min_wake_interval
		}, o = Ni.find((e) => a[e] !== n[e]);
		o !== void 0 && this.emitChange(y(t, ["defaults"], a), `defaults:${o}`);
	}
	emitChange(e, t) {
		this.dispatchEvent(N(e, t));
	}
	render() {
		let e = this.config;
		if (!e) return g`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
		let t = e.defaults, n = M(this.errors, ["defaults"]), r = this.errors.filter((e) => e.path === "defaults"), i = {
			envelope: t.envelope,
			max_value: t.max_value,
			precision: String(t.precision),
			unavailable: t.unavailable,
			retrigger: t.retrigger,
			stack: t.stack,
			debounce: O(t.debounce),
			safety_refresh: O(t.safety_refresh),
			min_wake_interval: O(t.min_wake_interval)
		};
		return g`
      <div class="pad">
        <ha-card header="Defaults">
          ${r.map((e) => g`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
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
b([a({ attribute: !1 })], zi.prototype, "hass", void 0), b([a({ attribute: !1 })], zi.prototype, "config", void 0), b([a({ attribute: !1 })], zi.prototype, "errors", void 0), zi = b([T("al-defaults")], zi);
//#endregion
//#region src/fader.ts
var Bi = .1, Vi = Math.log10(Bi), Hi = Math.log10(10) - Vi, Ui = (e) => Math.min(10, Math.max(Bi, e)), Wi = (e) => Math.round(e * 100) / 100, Gi = (e) => Wi(Ui(e));
function Ki(e) {
	return (Math.log10(Ui(e)) - Vi) / Hi;
}
function qi(e) {
	return Wi(Ui(10 ** (Vi + Math.min(1, Math.max(0, e)) * Hi)));
}
function Ji(e, t, n = !1) {
	let r = n ? 1.05 : 1.25;
	return Wi(Ui(t === 1 ? e * r : e / r));
}
function Yi(e) {
	let t = e.toFixed(2).replace(/0+$/, "");
	return t.endsWith(".") && (t += "0"), t;
}
var Xi = {
	min: Bi,
	max: 10,
	toPosition: Ki,
	fromPosition: qi,
	clamp: Gi,
	step: (e, t, n = !1) => Ji(e, t, n),
	page: (e, t) => Gi(t === 1 ? e * 2 : e / 2),
	format: Yi,
	reset: 1
}, Zi = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function Qi(e, t) {
	let n = e > 0 ? e : 1, r = Zi(t), i = 10 ** -r, a = (e) => Number(Math.min(n, Math.max(0, e)).toFixed(r)), o = Math.max(i, Number((n / 10).toFixed(r)));
	return {
		min: 0,
		max: n,
		toPosition: (e) => Math.min(1, Math.max(0, e / n)),
		fromPosition: (e) => a(Math.min(1, Math.max(0, e)) * n),
		clamp: a,
		step: (e, t, n = !1) => a(e + t * (n ? i : o)),
		page: (e, t) => a(e + t * n / 4),
		format: (e) => _e(a(e), r),
		reset: null
	};
}
//#endregion
//#region src/al-fader.ts
var $i = 12, ea = (e) => `${Math.round(e * 1e3) / 10}%`, L = class extends v {
	constructor(...e) {
		super(...e), this.value = 1, this.disabled = !1, this.focusable = !0, this.readOnly = !1, this.label = "Gain", this.showValue = !0, this.unavailable = !1, this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1;
	}
	static {
		this.styles = n`
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
      height: ${$i}px;
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
		return this.mode === "level" ? Qi(this.max, this.precision) : Xi;
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
		let e = this.scale, t = e.clamp(this.current), n = e.toPosition(t), r = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), i = g`
      ${this.mode === "gain" ? g`<div class="unity"></div>` : l}
      <div class="fill" style="height: ${ea(n)}"></div>
      ${r === null ? l : g`<div class="tick" style="bottom: ${ea(e.toPosition(r))}" title=${e.format(r)}></div>`}
    `;
		return this.readOnly ? g`
        <div
          class="fader"
          role="meter"
          aria-label=${this.label}
          aria-valuemin=${e.min}
          aria-valuemax=${e.max}
          aria-valuenow=${this.unavailable ? l : t}
          aria-valuetext=${this.unavailable ? "Value unavailable" : e.format(t)}
        >
          <div class="track">${this.unavailable ? l : i}</div>
          ${this.showValue ? g`<div class="value">${e.format(t)}</div>` : l}
        </div>
      ` : g`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled || !this.focusable ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${e.min}
        aria-valuemax=${e.max}
        aria-valuenow=${this.unavailable ? l : t}
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
          <div class="knob" style="bottom: calc(${ea(n)} - ${Math.round((n - .5) * $i * 10) / 10}px - ${$i / 2}px)"></div>
        </div>
        ${this.showValue ? g`<div class="value">${e.format(t)}</div>` : l}
      </div>
    `;
	}
};
b([a({ type: Number })], L.prototype, "value", void 0), b([a({
	type: Boolean,
	reflect: !0
})], L.prototype, "disabled", void 0), b([a({ type: Boolean })], L.prototype, "focusable", void 0), b([a({
	type: Boolean,
	reflect: !0,
	attribute: "readonly"
})], L.prototype, "readOnly", void 0), b([a({ type: String })], L.prototype, "label", void 0), b([a({ type: Boolean })], L.prototype, "showValue", void 0), b([a({ type: Boolean })], L.prototype, "unavailable", void 0), b([a({ type: String })], L.prototype, "mode", void 0), b([a({ type: Number })], L.prototype, "max", void 0), b([a({ type: Number })], L.prototype, "precision", void 0), b([a({ type: Number })], L.prototype, "tick", void 0), b([_()], L.prototype, "dragValue", void 0), L = b([T("al-fader")], L);
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive.js
var ta = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, na = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), ra = class {
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
}, ia = na(class extends ra {
	constructor(e) {
		if (super(e), e.type !== ta.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
		return s;
	}
}), aa = (e) => `${Math.round(e * 1e3) / 10}%`, oa = class extends v {
	constructor(...e) {
		super(...e), this.value = 0, this.max = 1, this.gated = !1;
	}
	static {
		this.styles = n`
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
		return g`
      <div class="meter">
        <div class=${ia({
			fill: !0,
			hot: e > .9
		})} style="width: ${aa(e)}"></div>
      </div>
      <div class=${ia({
			dot: !0,
			gated: this.gated
		})}></div>
    `;
	}
};
b([a({ type: Number })], oa.prototype, "value", void 0), b([a({ type: Number })], oa.prototype, "max", void 0), b([a({ type: Boolean })], oa.prototype, "gated", void 0), oa = b([T("al-meter")], oa);
var R = class extends v {
	constructor(...e) {
		super(...e), this.label = "", this.editable = !1, this.value = 0, this.realValue = 0, this.maxValue = 5, this.precision = 1, this.liveNow = 0, this.muted = !1, this.selected = !1, this.errors = 0, this.pending = null, this.dragging = !1;
	}
	static {
		this.styles = n`
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
		this.dispatchEvent(mn());
	}
	clearStepTimer() {
		this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
	}
	sendOverride(e) {
		this.clearStepTimer(), this.dispatchEvent(hn(e));
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
			this.stepTimer = void 0, this.dispatchEvent(hn(t));
		}, 250);
	}
	onMute() {
		this.editable && this.dispatchEvent(gn(!this.muted));
	}
	onReset() {
		this.editable && this.dispatchEvent(_n());
	}
	render() {
		let e = this.pending ?? this.value;
		return g`
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
        <div class="readout" title=${e === null ? "No data at this time" : l}>${e === null ? "" : _e(e, this.precision)}</div>
        ${this.editable ? g`<div class="buttons">
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
            </div>` : l}
        <div class="foot">
          ${this.errors > 0 ? g`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : l}
        </div>
      </div>
    `;
	}
};
b([a({ type: String })], R.prototype, "label", void 0), b([a({
	type: Boolean,
	reflect: !0
})], R.prototype, "editable", void 0), b([a({ attribute: !1 })], R.prototype, "value", void 0), b([a({ attribute: !1 })], R.prototype, "realValue", void 0), b([a({ type: Number })], R.prototype, "maxValue", void 0), b([a({ type: Number })], R.prototype, "precision", void 0), b([a({ type: Number })], R.prototype, "liveNow", void 0), b([a({
	type: Boolean,
	reflect: !0
})], R.prototype, "muted", void 0), b([a({
	type: Boolean,
	reflect: !0
})], R.prototype, "selected", void 0), b([a({ type: Number })], R.prototype, "errors", void 0), b([_()], R.prototype, "pending", void 0), R = b([T("al-strip")], R);
//#endregion
//#region src/al-mixer.ts
var sa = 8e3, ca = (e) => e instanceof Error ? e.message : String(e), z = class extends v {
	constructor(...e) {
		super(...e), this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.live = null, this.narrow = !1, this.preview = null, this.editing = Ct(), this.commandError = null, this.pendingFocus = !1;
	}
	static {
		this.styles = [w, n`
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
		return this.config ? ht(this.config, this.nav) : [];
	}
	get selected() {
		let { config: e, nav: t } = this;
		if (!e || t.selection === null) return null;
		let n = se(t.selection), r = E(e, n);
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
		this.pendingFocus = !0, this.dispatchEvent(vn(e));
	}
	clearErrorTimer() {
		this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
	}
	fail(e) {
		this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
			this.errorTimer = void 0, this.commandError = null;
		}, sa);
	}
	async command(e, t, n) {
		let r = this.hass;
		if (!(!r || this.preview)) try {
			await t(r), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(yn());
		} catch (t) {
			n?.settle(null), this.fail(`Could not ${e}: ${ca(t)}`);
		}
	}
	trackOf(e) {
		let t = e.target?.dataset?.index;
		return t === void 0 ? null : this.tracks[Number(t)] ?? null;
	}
	onStripSelect(e) {
		let t = this.trackOf(e);
		t && this.dispatchEvent(vn({
			type: "select",
			path: t.path
		}));
	}
	onLevelOverride(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let n = e.target, { value: r } = e.detail;
		this.command(`set the level of ${t.id}`, async (e) => n.settle(await Ze(e, t.id, r)), n);
	}
	onMuteToggle(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let { muted: n } = e.detail;
		this.command(`${n ? "mute" : "unmute"} ${t.id}`, (e) => ve(e, t.id, n));
	}
	onReset(e) {
		let t = this.trackOf(e);
		!t || this.preview || this.command(`reset ${t.id}`, (e) => he(e, t.id));
	}
	onEditToggle(e) {
		this.preview || (this.editing = e.target.checked === !0, wt(this.editing));
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
		let i = E(e, t.path);
		if (!i) return g``;
		let a = this.live?.groups[i.id], o = this.isSelected(t.path);
		return g`
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
        .precision=${a?.precision ?? Xe(e, i)}
        .muted=${this.preview ? !1 : a?.muted ?? !1}
        .selected=${o}
        .errors=${un(this.errors, t.path)}
      ></al-strip>
    `;
	}
	renderBand(e, t) {
		let n = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${e.depth + 1};`, r = e.id === this.selectedId ? 0 : -1, i = this.live?.groups[e.id], a = this.preview ? this.preview.values[e.id] : i?.value, o = i?.precision ?? (t && this.config ? Xe(this.config, t) : 1), s = e.expanded ? "Collapse" : "Expand";
		return g`
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
        <span class="band-value">${a == null ? "" : _e(a, o)}</span>
      </div>
    `;
	}
	render() {
		let e = this.config;
		if (!e || e.groups.length === 0) return g`<div class="empty muted">Nothing to mix: add a group first.</div>`;
		let t = gt(e, this.nav), n = this.tracks, r = new Map(n.map((t) => [t.id, E(e, t.path)])), i = t.kinds.map(() => "var(--al-strip-w)").join(" "), a = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
		return g`
      ${this.commandError === null ? l : g`<ha-alert
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
        ${this.selected ? g`<button class="open-group" type="button"
          @click=${() => this.dispatchEvent(new CustomEvent("al-open-group", {
			detail: this.selected.path,
			bubbles: !0,
			composed: !0
		}))}>Group settings</button>` : l}
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
b([a({ attribute: !1 })], z.prototype, "hass", void 0), b([a({ attribute: !1 })], z.prototype, "config", void 0), b([a({ attribute: !1 })], z.prototype, "nav", void 0), b([a({ attribute: !1 })], z.prototype, "errors", void 0), b([a({ attribute: !1 })], z.prototype, "live", void 0), b([a({
	type: Boolean,
	reflect: !0
})], z.prototype, "narrow", void 0), b([a({ attribute: !1 })], z.prototype, "preview", void 0), b([_()], z.prototype, "editing", void 0), b([_()], z.prototype, "commandError", void 0), z = b([T("al-mixer")], z);
//#endregion
//#region src/al-timeline.ts
var la = 32, ua = 28, da = 4, fa = 8, pa = 800, ma = 220, ha = 160, ga = 2e3, _a = 6e4, va = 1e4, ya = 6e4, ba = 32, xa = [
	"24h",
	"7d",
	"30d"
], Sa = [
	"off",
	"24h",
	"7d"
], Ca = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], wa = (e) => `hsl(${e * 67 % 360} 55% 62%)`, B = /* @__PURE__ */ new Map(), Ta = /* @__PURE__ */ new Map();
function Ea(e, t) {
	let n = Date.now();
	for (let [e, t] of B) n - t.at >= ya && B.delete(e);
	B.delete(e), B.set(e, {
		at: n,
		data: t
	});
	for (let e of B.keys()) {
		if (B.size <= ba) break;
		B.delete(e);
	}
}
var Da = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", Oa = (e, t) => {
	let n = /* @__PURE__ */ new Date(e * 1e3);
	return t < 86400 ? n.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	}) : n.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}, ka = (e) => String(Math.round(e * 100) / 100), Aa = (e, t, n) => Math.min(n, Math.max(t, e));
function ja(e, t, n, r) {
	let i = Math.max(1, r.width - la), a = Math.max(1, r.height - ua), o = n.start, s = Math.max(n.until, n.end), c = kt(o, s, i), l = At(r.maxValue, a), u = Object.keys(e.series), d = u.includes(t) ? t : u[0] ?? t, f = (t, n) => {
		let r = jt(e.series[t] ?? [], ga);
		return {
			id: t,
			points: r,
			d: Mt(r, c, l),
			color: n
		};
	}, p = f(d, "var(--primary-color)"), m = r.showChannels ? u.filter((e) => e !== d).map((e, t) => f(e, wa(t))) : [], h = e.forecast, ee = h ? Da(Nt(h, c, l, ga)) : "", te = h ? Mt(jt(Pt(h, "p50"), ga), c, l) : "", ne = [];
	for (let [, , t] of e.day_types) ne.includes(t) || ne.push(t);
	let re = (e) => Ca[ne.indexOf(e) % Ca.length], g = It(e.day_types.map(([e, t, n]) => [
		e,
		t,
		n
	]), c, s).map((e) => ({
		...e,
		fill: re(e.tag)
	})), ie = It(Object.entries(e.lights).flatMap(([e, t]) => t.map(([t, n]) => [
		t,
		n,
		e
	])), c, s), ae = It(e.plan, c, s);
	return {
		busId: d,
		bus: p,
		children: m,
		band: ee,
		p50: te,
		dayTypes: g,
		legend: ne.map((e) => ({
			tag: e,
			fill: re(e)
		})),
		lights: ie,
		plan: ae,
		x: c,
		y: l,
		t0: o,
		t1: s,
		plotW: i,
		plotH: a
	};
}
var V = class extends v {
	constructor(...e) {
		super(...e), this.groupId = null, this.heading = "", this.labels = {}, this.precisions = {}, this.cursorTime = null, this.viewport = null, this.pinnedTime = null, this.dragging = !1, this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = 14, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = pa, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
	}
	static {
		this.styles = [w, n`
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
		return this.narrow ? ha : ma;
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
		}, _a), this.load();
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
		}, va)));
	}
	willUpdate(e) {
		let t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), n = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
		(t || n) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
	}
	query(e) {
		let t = Math.floor(Date.now() / 1e3 / 60) * 60, n = Ot(t, this.range, this.horizon);
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
		let r = this.query(n), i = Rt(r), a = e ? void 0 : B.get(i);
		if (a && Date.now() - a.at < ya) {
			this.seq++, this.loaded = {
				q: r,
				data: a.data
			}, this.error = null, Ea(i, a.data);
			return;
		}
		let o = e ? void 0 : Ta.get(i);
		if (!o) {
			let e = we(t, r);
			o = e, Ta.set(i, e), e.then((e) => Ea(i, e), () => void 0).finally(() => {
				Ta.get(i) === e && Ta.delete(i);
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
		let r = ja(e.data, e.q.group_id, this.viewport ? {
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
		return !r || e.bus.id !== t ? "" : Mt(Ft(e.bus.points, n.now, r.value, e.t0, e.t1), e.x, e.y);
	}
	emitSettings() {
		this.dispatchEvent(bn({
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
		let n = e.currentTarget.getBoundingClientRect(), r = n.width > 0 ? this.width / n.width : 1, i = Aa(((e.clientX - n.left) * r - la) / t.plotW, 0, 1);
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
		this.cursorIndex = e === null || !t.length ? null : Lt(t, e), this.emitTransport();
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
		this.clearViewportTimer(), this.seq++, this.viewport = zt(e, Date.now() / 1e3), this.emitTransport(), t ? this.load() : this.viewportTimer = setTimeout(() => {
			this.viewportTimer = void 0, this.load();
		}, 100);
	}
	zoom(e, t) {
		let n = this.paths;
		n && this.changeWindow(Bt({
			start: n.t0,
			end: n.t1
		}, t ?? this.cursorTime ?? (n.t0 + n.t1) / 2, e, Date.now() / 1e3));
	}
	onWheel(e) {
		let t = this.paths;
		if (t) {
			if (e.ctrlKey || e.metaKey) e.preventDefault(), this.zoom(Math.exp(Aa(e.deltaY, -100, 100) * .01), this.timeAt(e, t));
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
		this.cursorIndex = this.cursorIndex === null ? r > 0 ? 0 : n : Aa(this.cursorIndex + r, 0, n), this.pinnedTime = t.bus.points[this.cursorIndex][0], this.selectTime(this.pinnedTime);
	}
	renderChips() {
		let e = this.learningHint;
		return g`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${xa.map((e) => g`
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
          ${Sa.map((t) => {
			let n = t !== "off" && !this.forecastReady;
			return g`
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
        ${e ? g`<span class="muted hint" title=${e}>${e}</span>` : l}
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
		let t = this.width, n = this.height, r = e.x(this.nowAt()), i = this.tailPath(e), a = e.plotH + da, o = this.cursorTime === null ? null : e.x(this.cursorTime), s = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
		return g`
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
		].map((n) => S`
            <line class="grid" x1=${la} y1=${e.y(this.maxValue * n)} x2=${t} y2=${e.y(this.maxValue * n)}></line>
            <text class="ytick" x=${28} y=${e.y(this.maxValue * n) + 3} text-anchor="end">
              ${ka(this.maxValue * n)}
            </text>
          `)}
        <g transform="translate(${la},0)">
          ${e.dayTypes.map((t) => S`<rect
              class="daytype"
              x=${t.x0}
              y="0"
              width=${Math.max(0, t.x1 - t.x0)}
              height=${e.plotH}
              fill=${t.fill}
            ></rect>`)}
          ${this.forecastReady && e.band ? S`<polygon class="band" points=${e.band}></polygon>` : l}
          ${this.forecastReady && e.p50 ? S`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : l}
          ${e.children.map((e) => S`<path class="child" d=${e.d} stroke=${e.color}></path>`)}
          ${e.bus.d ? S`<path class="bus" d=${e.bus.d}></path>` : l}
          ${i ? S`<path class="tail" d=${i}></path>` : l}
          ${this.showLights ? e.lights.map((e) => S`<rect
                  class="light"
                  x=${e.x0}
                  y=${a}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${fa}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`) : l}
          ${this.showLights ? e.plan.map((e) => S`<rect
                  class="plan"
                  x=${e.x0}
                  y=${a}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${fa}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`) : l}
          ${r >= 0 && r <= e.plotW ? S`<line class="now" x1=${r} y1="0" x2=${r} y2=${e.plotH}></line>
          <text class="now-label" x=${r + 3} y="10">now</text>` : l}
          ${o === null ? l : S`<line class="cursor" x1=${o} y1="0" x2=${o} y2=${e.plotH}></line>`}
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
		].map(([n, r]) => S`<text class="xlabel" x=${n * e.plotW} y=${t} text-anchor=${r}>
        ${Oa(e.t0 + n * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`);
	}
	renderTooltip(e) {
		let t = this.cursorTime;
		if (t === null || t < e.t0 || t > e.t1) return l;
		let n = this.forecastReady ? this.loaded?.data.forecast : null, r = this.loaded?.q.resolution === "5m" ? 600 : 7200, i = t > this.nowAt() ? n ? Vt(Pt(n, "p50"), t) : null : Vt(e.bus.points, t, r), a = (la + e.x(t)) / this.width * 100, o = this.loaded?.data.day_types.find(([e, n]) => t >= e && t < n)?.[2], s = (e, t) => {
			if (t === null) return null;
			let n = _e(t, this.precisions[e] ?? this.live?.groups[e]?.precision ?? 1);
			return Number(n) === 0 ? null : n;
		}, c = s(e.busId, i), u = e.children.flatMap((e) => {
			let n = s(e.id, Vt(e.points, t, r));
			return n === null ? [] : [{
				...e,
				formatted: n
			}];
		});
		return g`
      <div class="tooltip ${a > 60 ? "flip" : ""}" style="left: ${a}%">
        <div class="tt-time">${(/* @__PURE__ */ new Date(t * 1e3)).toLocaleString()}</div>
        ${c === null ? l : g`<div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${c}</span>
        </div>`}
        ${u.slice(0, 5).map((e) => g`
          <div class="tt-row">
            <span class="tt-swatch" style="background: ${e.color}"></span>
            <span class="tt-name">${this.labels[e.id] ?? e.id.replaceAll("_", " ")}</span>
            <span class="tt-value">${e.formatted}</span>
          </div>
        `)}
        ${u.length > 5 ? g`<div class="muted">+${u.length - 5} channels</div>` : l}
        ${o ? g`<div class="tt-daytype muted">${o}</div>` : l}
      </div>
    `;
	}
	render() {
		if (this.groupId === null) return g`<div class="placeholder muted">Select a strip to see its timeline.</div>`;
		let e = this.paths;
		return g`
      ${this.renderChips()}
      ${e ? this.renderChart(e) : g`<div class="placeholder muted">Loading…</div>`}
      <div class="transport toolbar" role="group" aria-label="Timeline transport">
        <button class="chip" aria-label="Zoom out" @click=${() => this.zoom(2)}>−</button>
        <button class="chip" aria-label="Zoom in" @click=${() => this.zoom(.5)}>+</button>
        ${[
			-7,
			-3,
			-1
		].map((e) => g`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>${e}d</button>`)}
        <button class="chip transport-now" @click=${this.resetTransport}>Now</button>
        ${[
			1,
			3,
			7
		].map((e) => g`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>+${e}d</button>`)}
        <span class="muted transport-status">${this.cursorTime === null ? "Live" : `${this.cursorTime > this.nowAt() ? "Forecast" : "History"} · ${(/* @__PURE__ */ new Date(this.cursorTime * 1e3)).toLocaleString()}`}</span>
      </div>
      ${e && e.legend.length > 0 ? g`
            <div class="legend">
              ${e.legend.map((e) => g`
                  <span class="legend-item">
                    <span class="swatch" style="background: ${e.fill}"></span>${e.tag}
                  </span>
                `)}
            </div>
          ` : l}
      ${this.error ? g`<div class="error">Timeline: ${this.error}</div>` : l}
      ${e ? this.renderTooltip(e) : l}
    `;
	}
};
b([a({ attribute: !1 })], V.prototype, "hass", void 0), b([a({ attribute: !1 })], V.prototype, "groupId", void 0), b([a({ attribute: !1 })], V.prototype, "heading", void 0), b([a({ attribute: !1 })], V.prototype, "labels", void 0), b([a({ attribute: !1 })], V.prototype, "precisions", void 0), b([_()], V.prototype, "cursorTime", void 0), b([_()], V.prototype, "viewport", void 0), b([a({ attribute: !1 })], V.prototype, "range", void 0), b([a({ attribute: !1 })], V.prototype, "horizon", void 0), b([a({ type: Boolean })], V.prototype, "showChannels", void 0), b([a({ type: Boolean })], V.prototype, "showLights", void 0), b([a({ attribute: !1 })], V.prototype, "live", void 0), b([a({ type: Number })], V.prototype, "maxValue", void 0), b([a({ attribute: !1 })], V.prototype, "profileState", void 0), b([a({ type: Number })], V.prototype, "minDays", void 0), b([a({
	type: Boolean,
	reflect: !0
})], V.prototype, "narrow", void 0), b([a({ type: Boolean })], V.prototype, "paused", void 0), b([_()], V.prototype, "cursorIndex", void 0), b([_()], V.prototype, "width", void 0), b([_()], V.prototype, "loaded", void 0), b([_()], V.prototype, "error", void 0), V = b([T("al-timeline")], V);
//#endregion
//#region src/al-strip-controls.ts
var Ma = [
	"name",
	"mix",
	"null_handling",
	"gain"
], Na = 5, Pa = (e) => e[e.length - 2] === "stimuli", H = class extends v {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.statusOnly = !1, this.simLog = null;
	}
	static {
		this.styles = [w, n`
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
		!n || !r || this.emitChange(y(n, [...r, e], t), `${j(r)}:${e}`);
	}
	onBusForm(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = E(t, n);
		if (!r) return;
		let i = ar(r, e.detail?.value ?? {}), a = or(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${j(n)}:${a}`);
	}
	onSim(e, t) {
		this.dispatchEvent(xn(e, t.target.checked === !0));
	}
	onRebuild() {
		this.dispatchEvent(Sn());
	}
	renderChannel(e, t) {
		return g`<al-stimulus-editor
      .hass=${this.hass}
      .config=${e}
      .path=${t}
      .errors=${this.errors}
      .live=${this.live}
    ></al-stimulus-editor>`;
	}
	renderBus(e, t) {
		let n = E(e, t);
		if (!n) return g`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		if (this.statusOnly) return g`<ha-card>${this.renderStatus(e, n)}</ha-card>`;
		let r = t.length === 2, i = this.errors.filter((e) => e.path === j(t)), a = M(this.errors, t);
		return g`
      <ha-card header=${n.name ?? n.id}>
        ${i.map((e) => g`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${ir(n, r, Ma, e)}
              .schema=${rr(n, r, Ma, e)}
              .error=${a}
              .computeLabel=${Wn}
              .computeHelper=${Gn}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${Qn}
              .value=${n.max_value}
              .inherited=${e.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${a.max_value}
              @value-changed=${(e) => this.setField("max_value", e.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              .label=${Hn.precision}
              kind="select"
              .selector=${$n}
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
		let r = x(e).enabled && ee(e).has(t.id);
		return g`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${r ? this.renderPresence(e, t, n) : l}
        ${t.stimuli.length === 0 && !r ? g`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((t, r) => this.renderStimulus(e, [
			...n,
			"stimuli",
			r
		], t))}
      </div>
    `;
	}
	renderPresence(e, t, n) {
		let r = this.live?.voices[t.id]?.find((e) => e.label === Pe);
		return g`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${r ? g`<span class="chip phase ${r.phase}">${r.phase}</span>` : l}
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
		let r = this.hass?.states[n.entity], i = r?.attributes.friendly_name ?? (n.entity || "(no entity)"), a = un(this.errors, t);
		return g`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          ${r ? g`<ha-state-icon .hass=${this.hass} .stateObj=${r}></ha-state-icon>` : g`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${n.key ?? i}</span>
          ${a ? g`<span class="badge" title="${a} problem(s)">${a}</span>` : l}
          ${r ? g`<span class="muted chip">${cn(this.hass, n.entity)}</span>` : l}
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
		let n = t.id, r = this.live?.groups[n]?.precision ?? Xe(e, t), i = this.live?.groups[n]?.lights ?? 0, a = this.hass?.states[$e(n)], o = this.simLog?.blocked[n] ?? null, s = (this.simLog?.entries ?? []).filter((e) => e.group_id === n).sort((e, t) => t.t - e.t).slice(0, Na);
		return g`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${i} light${i === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${i > 0 ? g`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${a?.state === "on"}
                .disabled=${a === void 0}
                title=${a === void 0 ? "No simulation switch for this group" : "Presence simulation"}
                @change=${(e) => this.onSim(n, e)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : l}
        ${o === null ? l : g`<div class="muted blocked">Blocked: ${o}</div>`}
        ${this.renderSensor("expected", "Expected", et(n), r)}
        ${this.renderSensor("anomaly", "Anomaly", tt(n), r)}
        <div class="muted readiness">${this.readiness(e, n)}</div>
        ${s.length > 0 ? g`<ol class="log">
              ${s.map((e) => this.renderLogEntry(e))}
            </ol>` : g`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
	}
	renderSensor(e, t, n, r) {
		let i = this.hass?.states[n], a = i?.attributes.day_type, o = i?.state, s = o === void 0 ? NaN : Number(o), c = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(s) ? _e(s, r) : o;
		return g`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${c}</span>
      ${typeof a == "string" ? g`<span class="muted">${a}</span>` : l}
    </div>`;
	}
	renderLogEntry(e) {
		return g`<li>
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
		return !e || !t || t.length === 0 ? g`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Pa(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
	}
};
b([a({ attribute: !1 })], H.prototype, "hass", void 0), b([a({ attribute: !1 })], H.prototype, "config", void 0), b([a({ attribute: !1 })], H.prototype, "path", void 0), b([a({ attribute: !1 })], H.prototype, "errors", void 0), b([a({ attribute: !1 })], H.prototype, "live", void 0), b([a({ attribute: !1 })], H.prototype, "profileState", void 0), b([a({ type: Boolean })], H.prototype, "statusOnly", void 0), b([a({ attribute: !1 })], H.prototype, "simLog", void 0), H = b([T("al-strip-controls")], H);
//#endregion
//#region src/al-patterns.ts
var Fa = 50;
function Ia(e) {
	let t = [], n = (r) => {
		t.push({
			id: r.id,
			label: r.name ?? r.id,
			precision: e ? Xe(e, r) : 0
		}), r.children.forEach(n);
	};
	return e?.groups.forEach(n), t;
}
function La(e, t) {
	if (e === void 0) return "—";
	let n = Number(e);
	return e.trim() !== "" && Number.isFinite(n) ? _e(n, t) : e;
}
var Ra = (e) => (/* @__PURE__ */ new Date(e * 1e3)).toLocaleDateString(), za = class extends v {
	constructor(...e) {
		super(...e), this.profileState = null, this.simLog = null, this.force = !1;
	}
	static {
		this.styles = [w, n`
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
		this.dispatchEvent(Sn(this.force));
	}
	renderStatus() {
		let e = this.profileState;
		if (!e) return g`<div class="status muted">Profile not loaded yet.</div>`;
		let { producer: t, generated_at: n, training_window: r, day_types: i, slot_minutes: a } = e.profile;
		return g`
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
          <span class="window">${Ra(r[0])} – ${Ra(r[1])}</span>
        </div>
        <div class="muted">${i.join(", ")} · ${a}-minute slots</div>
      </div>
    `;
	}
	renderReadiness() {
		let e = this.profileState, t = Ia(this.config);
		if (!e || t.length === 0) return g`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
		let n = this.config?.defaults.patterns?.min_days ?? 14;
		return g`
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
		let r = t.ready[e.id] === !0, i = t.profile.groups[e.id]?.days ?? 0, a = this.hass?.states[et(e.id)]?.state;
		return g`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${r ? "yes" : "no"}" title=${r ? "Ready" : `Needs ${n} days`}>
        ${r ? "✓" : "✗"}
      </td>
      <td class="days">${i}</td>
      <td class="expected">${La(a, e.precision)}</td>
    </tr>`;
	}
	renderBlocked() {
		let e = Object.entries(this.simLog?.blocked ?? {}).filter((e) => typeof e[1] == "string");
		if (e.length === 0) return l;
		let t = Ia(this.config), n = (e) => t.find((t) => t.id === e)?.label ?? e;
		return g`<ul class="blocked">
      ${e.map(([e, t]) => g`<li><span class="group">${n(e)}:</span> <span>${t}</span></li>`)}
    </ul>`;
	}
	renderLog() {
		let e = [...this.simLog?.entries ?? []].sort((e, t) => t.t - e.t).slice(0, Fa);
		return e.length === 0 ? g`<div class="muted log-empty">No simulated light changes yet.</div>` : g`<ol class="log">
      ${e.map((e) => this.renderEntry(e))}
    </ol>`;
	}
	renderEntry(e) {
		return g`<li>
      <span class="muted">${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
      ${e.brightness === null ? l : g`<span class="muted">${e.brightness}</span>`}
    </li>`;
	}
	render() {
		return g`
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
b([a({ attribute: !1 })], za.prototype, "hass", void 0), b([a({ attribute: !1 })], za.prototype, "config", void 0), b([a({ attribute: !1 })], za.prototype, "profileState", void 0), b([a({ attribute: !1 })], za.prototype, "simLog", void 0), b([_()], za.prototype, "force", void 0), za = b([T("al-patterns")], za);
//#endregion
//#region src/types.ts
var Ba = [
	"phone",
	"watch",
	"tag",
	"laptop",
	"other"
], Va = [
	"activity",
	"steps",
	"battery_state"
], Ha = {
	phone: "mdi:cellphone",
	watch: "mdi:watch",
	tag: "mdi:tag",
	laptop: "mdi:laptop",
	other: "mdi:bluetooth"
}, Ua = {
	phone: "Phone",
	watch: "Watch",
	tag: "Tag",
	laptop: "Laptop",
	other: "Other"
}, Wa = {
	activity: "Activity",
	steps: "Steps",
	battery_state: "Battery state"
}, Ga = { entity: { filter: {
	domain: "device_tracker",
	integration: "bermuda"
} } }, Ka = { entity: { filter: { domain: "person" } } }, qa = { entity: { filter: {
	domain: "device_tracker",
	integration: "mobile_app"
} } }, Ja = { entity: { filter: { domain: "sensor" } } }, Ya = { select: {
	mode: "dropdown",
	options: Ba.map((e) => ({
		value: e,
		label: Ua[e]
	}))
} }, Xa = class extends v {
	constructor(...e) {
		super(...e), this.errors = [], this.presence = null;
	}
	static {
		this.styles = [
			w,
			xe,
			n`
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
		return this.config ? x(this.config).people : [];
	}
	emit(e, t, n = !1) {
		let r = this.config;
		if (!r) return;
		let i = {
			...x(r),
			people: e
		}, a = y(r, ["presence"], i);
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
		this.emit([...this.people, o()], "add", !0);
	}
	removePerson(e) {
		this.emit(this.people.filter((t, n) => n !== e), "remove", !0);
	}
	addDevice(e) {
		let t = this.people[e];
		t && this.editPerson(e, { devices: [...t.devices, ce("")] }, "add-device");
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
		let o = Object.values(this.presence?.people ?? {}).flatMap((e) => Object.values(e.devices ?? {})).find((e) => e.tracker === n.tracker)?.signals[r], s = i === null ? l : i[r] ? g`<ha-icon class="found" icon="mdi:check-circle-outline" title="Found"></ha-icon>` : n.signals[r] || o ? g`<ha-icon class="missing" icon="mdi:alert-circle-outline" title="Configured but unavailable"></ha-icon>` : g`<span class="muted" title="Optional: no sensor configured or discovered">Optional</span>`;
		return g`<div class="signal signal-${r}">
      <ha-selector
        .hass=${this.hass}
        .selector=${Ja}
        .label=${Wa[r]}
        .helper=${n.companion ? "Blank: found on the companion device when available." : "Optional. Movement can also be detected from Bluetooth."}
        .required=${!1}
        .value=${this.text(n.signals[r])}
        @value-changed=${(i) => this.editDevice(e, t, { signals: {
			...n.signals,
			[r]: i.detail.value ? i.detail.value : null
		} }, r)}
      ></ha-selector>
      ${s}
      ${a[r] ? g`<div class="error">${a[r]}</div>` : l}
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
		]), o = this.found(n, r), s = Object.values(this.presence?.people?.[n.name ?? ""]?.devices ?? {}).find((e) => e.tracker === r.tracker), c = r.name ?? s?.name ?? (r.tracker || "New device");
		return g`<details class="device" ?open=${!r.tracker || Object.keys(i).length > 0 || Object.keys(a).length > 0}>
      <summary>${c}${c === Ua[r.kind] ? l : g`<span class="device-kind">${Ua[r.kind]}</span>`}</summary>
      <div class="device-body"><div class="device-head">
        <div class="resource-links">${Pn(this, this.hass, r.tracker, "Open tracker", s?.device_id, "Open Bermuda device", !0)}</div>
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
          .selector=${Ga}
          .label=${"Bermuda tracker"}
          .required=${!0}
          .value=${r.tracker}
          @value-changed=${(n) => this.editDevice(e, t, { tracker: n.detail.value ?? "" }, "tracker")}
        ></ha-selector>
        ${i.tracker ? g`<div class="error">${i.tracker}</div>` : l}
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
          .selector=${Ya}
          .label=${"Kind"}
          .required=${!0}
          .value=${r.kind}
          @value-changed=${(n) => this.editDevice(e, t, { kind: n.detail.value ?? "other" }, "kind")}
        ></ha-selector>
        <ha-selector
          class="companion"
          .hass=${this.hass}
          .selector=${qa}
          .label=${"Companion app tracker"}
          .helper=${"Optional. The companion tracker for this device supplies carrying evidence."}
          .required=${!1}
          .value=${this.text(r.companion)}
          @value-changed=${(n) => this.editDevice(e, t, { companion: n.detail.value ? n.detail.value : null }, "companion")}
        ></ha-selector>
        ${Va.map((n) => this.renderSignal(e, t, r, n, o, a))}
      </div></div>
    </details>`;
	}
	renderPerson(e, t) {
		let n = M(this.errors, [
			"presence",
			"people",
			e
		]);
		return g`<div class="person">
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
        ${n.name ? g`<div class="error">${n.name}</div>` : l}
        <ha-selector
          class="person-entity"
          .hass=${this.hass}
          .selector=${Ka}
          .label=${"Person"}
          .helper=${"Its device_trackers seed the devices below: Bermuda ones to follow, a mobile_app one as the companion."}
          .required=${!1}
          .value=${this.text(t.person)}
          @value-changed=${(t) => this.editPerson(e, { person: t.detail.value ? t.detail.value : null }, "person")}
        ></ha-selector>
        ${n.person ? g`<div class="error">${n.person}</div>` : l}
      </div>
      ${t.devices.map((n, r) => this.renderDevice(e, r, t, n))}
      <button type="button" class="add-device" @click=${() => this.addDevice(e)}>Add device</button>
    </div>`;
	}
	render() {
		if (!this.config) return l;
		let e = this.people;
		return g`
      ${e.length === 0 ? g`<div class="empty">Nobody is followed yet. Add a person and pick their person entity.</div>` : l}
      ${e.map((e, t) => this.renderPerson(t, e))}
      <button type="button" class="add-person" @click=${() => this.addPerson()}>Add person</button>
    `;
	}
};
b([a({ attribute: !1 })], Xa.prototype, "hass", void 0), b([a({ attribute: !1 })], Xa.prototype, "config", void 0), b([a({ attribute: !1 })], Xa.prototype, "errors", void 0), b([a({ attribute: !1 })], Xa.prototype, "presence", void 0), Xa = b([T("al-people-editor")], Xa);
function Za(e) {
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
function Qa(e, t) {
	if (e === 0 && t === 0) return 0;
	let n = e === 0 ? Infinity : 60 / Math.abs(e), r = t === 0 ? Infinity : 27 / Math.abs(t);
	return Math.min(n, r, .5);
}
function $a(e, t) {
	let n = new Set(t.nodes), r = new Set(t.exits), i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let t of Za(e)) {
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
		let a = i.x - t.x, o = i.y - t.y, s = Qa(a, o);
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
var eo = (e, t) => ({
	x: e.x1 + (e.x2 - e.x1) * t,
	y: e.y1 + (e.y2 - e.y1) * t
}), to = (e, t, n) => e.edges.find((e) => e.a === t && e.b === n || e.a === n && e.b === t);
function no(e, t) {
	let n = [];
	for (let r = 1; r < t.length; r++) {
		let i = to(e, t[r - 1], t[r]);
		i && n.push(i);
	}
	return n;
}
//#endregion
//#region src/al-presence.ts
var ro = 2e3, io = "away", ao = {
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
}, oo = {
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
}, so = [
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
], co = [
	"charging",
	"moving",
	"still_room_empty",
	"jitter"
], lo = [
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
], uo = (e) => {
	if (e === "activity_floor") return "presence/activity/floor";
	if (e.startsWith("carried_")) {
		let t = e.slice(8);
		return `presence/carried/${co.includes(t) ? "weights/" : ""}${t}`;
	}
	return `presence/${e}`;
}, fo = { entity: {
	multiple: !0,
	filter: {
		domain: "device_tracker",
		integration: "bermuda"
	}
} }, po = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, mo = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "slider"
} }, ho = { number: {
	min: 0,
	max: .1,
	step: .001,
	mode: "box"
} }, go = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, _o = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, vo = { duration: {} }, yo = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, bo = { number: {
	min: -10,
	max: 10,
	step: .5,
	mode: "box"
} }, xo = " → ", So = "Give it an area that matches a room, or map it in Settings below.", Co = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", U = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, W = class extends v {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, this.correctionPending = !1, this.correctionError = null, this.notice = null, this.computeLabel = (e) => ao[e.name] ?? e.name, this.computeHelper = (e) => oo[e.name] ?? "", this.onDevicesChanged = (e) => {
			e.stopPropagation();
			let t = this.config;
			if (!t) return;
			let n = x(t), r = {
				...n,
				people: this.mergePeople(e.detail?.value, n.people)
			};
			this.dispatchEvent(N(y(t, ["presence"], r), "presence:people"));
		};
	}
	static {
		this.styles = [
			w,
			xe,
			n`
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
		}, ro);
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
			this.topology = await Le(e);
		} catch {}
	}
	async refreshPresence() {
		let e = this.hass;
		if (e) try {
			this.presence = await be(e);
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
			await Ie(n, e, r), this.notice = r.device ? "Device correction saved." : r.room ? `Moved ${e} to ${this.roomName(r.room)}.` : "Automatic estimate restored.", this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, await this.refreshPresence();
		} catch (e) {
			let t = e && typeof e == "object" && "message" in e ? String(e.message) : String(e);
			this.correctionError = `Could not save correction: ${t}`;
		} finally {
			this.correctionPending = !1;
		}
	}
	correctionStatus(e) {
		if (!e) return l;
		let t = typeof e.value == "boolean" ? e.value ? "Carrying" : "Not carrying" : this.roomName(e.value), n = e.reason.replaceAll("_", " ");
		return g`<div class="hint correction-status" role="status">${t} — ${n}
      (${Math.round(e.strength * 100)}%) · <time datetime=${(/* @__PURE__ */ new Date(e.t * 1e3)).toISOString()}>${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</time></div>`;
	}
	get correctionRooms() {
		let e = this.config;
		return [...this.topology?.nodes ?? (e ? [...ee(e)] : []), io];
	}
	get labels() {
		let e = this.config;
		return new Map(e ? Za(e).map((e) => [e.id, e.label]) : []);
	}
	roomName(e) {
		return e == null || e === "" ? "—" : e === io ? "Away" : this.labels.get(e) ?? e;
	}
	areaName(e) {
		return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
	}
	trail(e) {
		return e.map((e) => this.roomName(e)).join(xo);
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
					options: Kr(e)
				} }
			},
			{
				name: "threshold",
				selector: mo
			},
			{
				name: "stay",
				selector: po
			},
			{
				name: "escape",
				selector: ho
			},
			{
				name: "scale",
				selector: go
			},
			{
				name: "floor",
				selector: _o
			},
			{
				name: "stuck_after",
				selector: vo
			},
			{
				name: "activity_floor",
				selector: _o
			},
			{
				name: "carried_prior",
				selector: yo
			},
			{
				name: "carried_flip",
				selector: vo
			},
			{
				name: "carried_recent",
				selector: vo
			},
			{
				name: "carried_nearby",
				selector: yo
			},
			...co.map((e) => ({
				name: `carried_${e}`,
				selector: bo
			}))
		];
	}
	mergePeople(e, t) {
		if (!Array.isArray(e)) return [...t];
		let n = e.filter((e) => typeof e == "string"), r = t.filter((e) => e.devices.some((e) => n.includes(e.tracker))), i = new Set(r.flatMap((e) => e.devices.map((e) => e.tracker))), a = n.filter((e) => !i.has(e)).map((e) => ({
			...o(),
			devices: [ce(e)]
		}));
		return [...r, ...a];
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config;
		if (!t) return;
		let n = x(t), r = e.detail?.value ?? {}, i = {
			charging: U(r.carried_charging) ?? n.carried.weights.charging,
			moving: U(r.carried_moving) ?? n.carried.weights.moving,
			still_room_empty: U(r.carried_still_room_empty) ?? n.carried.weights.still_room_empty,
			jitter: U(r.carried_jitter) ?? n.carried.weights.jitter
		}, a = {
			...n,
			enabled: typeof r.enabled == "boolean" ? r.enabled : n.enabled,
			envelope: r.envelope === void 0 ? n.envelope : typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : null,
			threshold: U(r.threshold) ?? n.threshold,
			stay: U(r.stay) ?? n.stay,
			escape: U(r.escape) ?? n.escape,
			scale: U(r.scale) ?? n.scale,
			floor: U(r.floor) ?? n.floor,
			stuck_after: k(r.stuck_after) ?? n.stuck_after,
			activity: { floor: U(r.activity_floor) ?? n.activity.floor },
			carried: {
				prior: U(r.carried_prior) ?? n.carried.prior,
				flip: k(r.carried_flip) ?? n.carried.flip,
				recent: k(r.carried_recent) ?? n.carried.recent,
				nearby: U(r.carried_nearby) ?? n.carried.nearby,
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
		}, s = so.find((e) => !o(e));
		s !== void 0 && this.dispatchEvent(N(y(t, ["presence"], a), `presence:${s}`));
	}
	setSetting(e, t) {
		let n = this.config;
		if (!n) return;
		let r = {
			...x(n),
			[e]: t
		};
		this.dispatchEvent(N(y(n, ["presence"], r), `presence:${e}`));
	}
	renderSetup(e) {
		let t = this.presence?.bermuda === !0, n = x(e);
		return g`<ha-card class="setup" header="Room presence">
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
        .selector=${fo}
        .label=${ao.devices}
        .helper=${oo.devices}
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
		return e.length === 0 ? g`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >` : g`<ha-card><h2>People</h2>
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
			this.correcting === e ? this.renderCorrection(e, t) : l,
			this.correctingDevice?.person === e ? this.renderDeviceCorrection(e, t) : l
		])}
        </tbody>
      </table></div>
      ${this.notice === null ? l : g`<div class="notice" role="status">${this.notice}</div>`}
    </ha-card>`;
	}
	renderCorrection(e, t) {
		let n = Object.entries(t.candidates).sort(([, e], [, t]) => t - e).map(([e]) => e);
		return g`<tr class="correct">
      <td colspan="6"><div class="correction-panel">
        <span class="question">Where is ${e}?</span>
        <div class="correction-fields">${Object.entries(t.devices ?? {}).map(([e, t]) => g`<label>${t.name}
          <select data-carrying=${e} ?disabled=${this.correctionPending} aria-label=${`Carrying ${t.name}`} .value=${String(this.carryingChoices[e] ?? "")}
            @change=${(t) => {
			let n = t.target.value, r = { ...this.carryingChoices };
			n === "" ? delete r[e] : r[e] = n === "true", this.carryingChoices = r;
		}}>
            <option value="">Keep estimate (${t.carried === null ? "unknown" : `${Math.round(t.carried * 100)}% carrying`})</option>
            <option value="true">Carrying</option><option value="false">Not carrying</option>
          </select></label>`)}</div>
        ${this.correctionError ? g`<div role="alert">${this.correctionError}</div>` : l}
        <div class="actions">${n.map((t) => g`<button type="button" class="candidate" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, t)}
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
          ${this.correctionRooms.map((e) => g`<option value=${e}>${this.roomName(e)}</option>`)}
        </select>
        <button type="button" class="automatic-person" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, { clear: !0 })}>Use automatic estimate</button>
        <button type="button" class="cancel" @click=${() => this.correcting = null}>Close</button></div>
      </div></td>
    </tr>`;
	}
	renderPerson(e, t) {
		let n = Math.round(t.confidence * 100), r = Object.entries(t.devices ?? {}).sort(([e], [t]) => e.localeCompare(t));
		return g`<tr class="device person">
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
        ${t.moving ? g`<span class="chip moving">moving</span>` : l}
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
		let r = n.carried, i = r !== null && r < .5, a = r === null ? "—" : `${Math.round(r * 100)}%`, o = `${n.name} (${Ua[n.kind]}): carried ${a}${i && n.room ? `, in ${this.roomName(n.room)}` : ""}`;
		return g`<div class="device-entry"><button type="button" aria-expanded=${this.correctingDevice?.person === e && this.correctingDevice.device === t ? "true" : "false"} aria-label=${`Correct ${n.name}`} @click=${() => {
			this.correctingDevice = {
				person: e,
				device: t
			}, this.correcting = null, this.correctionError = null;
		}} class="chip device-chip ${i ? "parked" : "carried"}" data-device=${t} title=${o}>
      <ha-icon icon=${Ha[n.kind] ?? Ha.other}></ha-icon>
      <span class="device-name">${n.name}</span>
      <span class="carried-pct">${a} carrying</span>
      ${i && n.room ? g`<span class="parked-room">${this.roomName(n.room)}</span>` : l}
    </button>${this.correctionStatus(n.correction)}${this.correctionStatus(n.carrying_correction)}</div>`;
	}
	renderDeviceCorrection(e, t) {
		let n = this.correctingDevice?.device, r = n ? t.devices[n] : void 0;
		return !n || !r ? l : g`<tr class="correct device-correction"><td colspan="6"><div class="correction-panel">
      <div class="question">${r.name}</div>
      <div class="resource-links">${Pn(this, this.hass, r.tracker, "Open tracker", r.device_id, "Open Bermuda device", !0)}</div>
      <div class="correction-fields"><label>Device room <select aria-label="Device room" ?disabled=${this.correctionPending} @change=${(t) => {
			let r = t.target.value;
			r && this.correct(e, {
				device: n,
				room: r
			});
		}}><option value="">Choose a room…</option>${this.correctionRooms.map((e) => g`<option value=${e}>${this.roomName(e)}</option>`)}</select></label></div>
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
      ${this.correctionError ? g`<div role="alert">${this.correctionError}</div>` : l}
    </div></td></tr>`;
	}
	renderScanners() {
		let e = this.presence?.scanners ?? [], t = new Set(this.presence?.unmapped ?? []);
		return g`<ha-card><h2>Scanners</h2>
      ${e.length === 0 ? g`<div class="empty">No Bermuda scanners have been discovered.</div>` : g`<div class="table-scroll"><table>
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
		return g`<tr class="scanner ${t ? "unmapped" : ""}">
      <td class="name">${Nn("device", e.device_id, e.name)}</td>
      <td class="area">${Nn("area", e.area_id, this.areaName(e.area_id))}</td>
      <td class="room">${t ? So : this.roomName(e.group_id)}</td>
    </tr>`;
	}
	renderDisabled() {
		let e = this.presence?.disabled ?? [];
		return e.length === 0 ? l : g`<div class="disabled-sensors">
      ${Co}
      <ul>
        ${e.map((e) => g`<li>${e}</li>`)}
      </ul>
    </div>`;
	}
	renderSettings(e) {
		let t = x(e), n = Object.fromEntries(so.flatMap((e) => {
			let t = this.errors.find((t) => t.path === uo(e));
			return t ? [[e, t.message]] : [];
		})), r = this.errors.filter((e) => e.path === "presence"), i = {
			enabled: t.enabled,
			envelope: t.envelope ?? "",
			threshold: t.threshold,
			stay: t.stay,
			escape: t.escape,
			scale: t.scale,
			floor: t.floor,
			stuck_after: O(t.stuck_after),
			activity_floor: t.activity.floor,
			carried_prior: t.carried.prior,
			carried_flip: O(t.carried.flip),
			carried_recent: O(t.carried.recent),
			carried_nearby: t.carried.nearby,
			...Object.fromEntries(co.map((e) => [`carried_${e}`, t.carried.weights[e]]))
		}, a = (t) => g`<ha-form
      class="presence-settings" data-section=${t.id}
      .hass=${this.hass}
      .data=${Object.fromEntries(t.fields.map((e) => [e, i[e]]))}
      .schema=${this.schemaFor(e).filter((e) => t.fields.includes(e.name))}
      .error=${n}
      .computeLabel=${this.computeLabel}
      .computeHelper=${this.computeHelper}
      @value-changed=${this.onFormChanged}
    ></ha-form>`, o = lo[0];
		return g`<ha-card><details class="settings" ?open=${this.errors.some((e) => e.path.startsWith("presence"))}>
      <summary>Presence settings</summary><div class="settings-body">
      ${r.map((e) => g`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
      <section class="settings-section">
        <h3>People and devices</h3>
        <p>Choose who to follow and the devices they carry. Open a device to edit its trackers and signals.</p>
        <al-people-editor .hass=${this.hass} .config=${e} .errors=${this.errors} .presence=${this.presence}></al-people-editor>
      </section>
      <section class="settings-section">
        <h3>${o.title}</h3><p>${o.hint}</p>${a(o)}
      </section>
      <div class="settings-grid">
        ${lo.slice(1).map((e) => g`<details class="settings-section" data-section=${e.id}
          ?open=${e.fields.some((e) => n[e] !== void 0)}>
          <summary>${e.title}</summary><p>${e.hint}</p>${a(e)}
        </details>`)}
      </div>
    </div></details></ha-card>`;
	}
	render() {
		let e = this.config;
		return e ? x(e).enabled ? g`<div class="page">
      ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : g`<div class="page">${this.renderSetup(e)}</div>` : g`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
	}
};
b([a({ attribute: !1 })], W.prototype, "hass", void 0), b([a({ attribute: !1 })], W.prototype, "config", void 0), b([a({ attribute: !1 })], W.prototype, "errors", void 0), b([a({ type: Boolean })], W.prototype, "narrow", void 0), b([_()], W.prototype, "topology", void 0), b([_()], W.prototype, "presence", void 0), b([_()], W.prototype, "correcting", void 0), b([_()], W.prototype, "correctingDevice", void 0), b([_()], W.prototype, "carryingChoices", void 0), b([_()], W.prototype, "correctionPending", void 0), b([_()], W.prototype, "correctionError", void 0), b([_()], W.prototype, "notice", void 0), W = b([T("al-presence")], W);
//#endregion
//#region src/al-graph-map.ts
var wo = 60, To = 27, Eo = 2, Do = 9, Oo = 7, G = (e) => String(Math.round(e * 10) / 10), ko = class extends v {
	constructor(...e) {
		super(...e), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
	}
	static {
		this.styles = [w, n`
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
		this.dispatchEvent(Cn(e));
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
			let s = to(e, a, o);
			s && t.push({
				name: r,
				...eo(s, .5)
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
		return S`<line
      class="edge ${n ? "on-path" : ""}"
      data-one-way=${e.oneWay}
      x1=${G(e.x1)}
      y1=${G(e.y1)}
      x2=${G(e.x2)}
      y2=${G(e.y2)}
      marker-end=${e.oneWay ? "url(#al-arrow)" : l}
    ></line>`;
	}
	renderNode(e) {
		let t = this.occupantsOf(e.id), n = t.slice(0, Eo), r = t.length - n.length, i = this.selected.includes(e.id), a = [...n, ...r > 0 ? [`+${r}`] : []].join(", "), o = [
			e.label,
			e.exit ? "an exit" : "",
			t.length > 0 ? `${t.length} here: ${t.join(", ")}` : "empty"
		].filter((e) => e !== "").join(", ");
		return S`<g
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
        x=${G(e.x - wo)}
        y=${G(e.y - To)}
        width=${120}
        height=${54}
        rx="8"
      ></rect>
      <text class="label" x=${G(e.x)} y=${G(e.y - 4)} text-anchor="middle">${e.label}</text>
      ${a === "" ? l : S`<text class="names" x=${G(e.x)} y=${G(e.y + 13)} text-anchor="middle">${a}</text>`}
      ${t.length === 0 ? l : this.renderBadge(e, t.length)}
      ${e.exit ? this.renderDoor(e) : l}
    </g>`;
	}
	renderBadge(e, t) {
		let n = e.x + wo - Do - 3, r = e.y - To + Do + 3;
		return S`<circle class="badge" cx=${G(n)} cy=${G(r)} r=${Do}></circle>
      <text class="count" x=${G(n)} y=${G(r + 3.5)} text-anchor="middle">${t}</text>`;
	}
	renderDoor(e) {
		let t = e.x - wo + 7, n = e.y + To - 7;
		return S`<path class="door" d=${`M ${G(t)} ${G(n)} v -14 h 10 v 14 z`}></path>`;
	}
	renderPerson(e) {
		return S`<circle class="person" data-name=${e.name} cx=${G(e.x)} cy=${G(e.y)} r=${Oo}>
      <title>${e.name} is on the move</title>
    </circle>`;
	}
	render() {
		let e = this.config, t = this.topology;
		if (!e || !t || t.nodes.length === 0) return g`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
		let n = $a(e, t), r = new Set(this.paths.flatMap((e) => no(n, e))), i = this.summary(n);
		return g`
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
b([a({ attribute: !1 })], ko.prototype, "hass", void 0), b([a({ attribute: !1 })], ko.prototype, "config", void 0), b([a({ attribute: !1 })], ko.prototype, "topology", void 0), b([a({ attribute: !1 })], ko.prototype, "presence", void 0), b([a({ attribute: !1 })], ko.prototype, "selected", void 0), b([a({ attribute: !1 })], ko.prototype, "paths", void 0), ko = b([T("al-graph-map")], ko);
//#endregion
//#region src/al-paths.ts
var K = class extends v {
	constructor(...e) {
		super(...e), this.narrow = !1, this.topology = null, this.selected = [null, null], this.paths = [], this.pending = !1, this.error = null, this.loading = !1, this.pathSeq = 0, this.topologySeq = 0;
	}
	static {
		this.styles = [
			w,
			xe,
			n`
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
			let t = await Le(this.hass);
			e === this.topologySeq && (this.topology = t);
		} catch {
			e === this.topologySeq && (this.error = "Could not load room connections. Try again.");
		} finally {
			e === this.topologySeq && (this.loading = !1);
		}
	}
	roomName(e) {
		return this.config ? Za(this.config).find((t) => t.id === e)?.label ?? e : e;
	}
	async select(e) {
		let t = this.selected.filter((e) => e !== null), n = t.includes(e) ? t.filter((t) => t !== e) : [...t, e].slice(-2);
		this.selected = [n[0] ?? null, n[1] ?? null], this.paths = [], this.error = null;
		let r = ++this.pathSeq, [i, a] = this.selected;
		if (this.pending = !1, !(!this.hass || !i || !a)) {
			this.pending = !0;
			try {
				let e = await Fe(this.hass, i, a);
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
			let n = this.selected[0] === e.id ? "From" : this.selected[1] === e.id ? "To" : "", r = e.name ?? e.id, i = g`<button class="room" type="button" data-room=${e.id}
        aria-pressed=${n ? "true" : "false"} @click=${(t) => {
				t.preventDefault(), t.stopPropagation(), this.select(e.id);
			}}>
        <span>${r}</span><span class="endpoint">${n}</span>
      </button>`;
			return e.children.length ? g`<details open>
        <summary>${t.has(e.id) ? i : r}</summary>
        <div class="branch">${this.renderTree(e.children, t)}</div>
      </details>` : t.has(e.id) ? i : g``;
		});
	}
	renderRoutes() {
		let [e, t] = this.selected;
		if (!e || !t) return g`<div class="paths">Select two rooms in the tree or map to see their routes.</div>`;
		let n = `${this.roomName(e)} → ${this.roomName(t)}`;
		return g`<div class="paths" role="status">
      ${this.pending ? `Finding routes from ${n}…` : this.error ? l : g`
        <div>${this.paths.length ? `${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${n}` : `No route from ${n}`}</div>
        <ol>${this.paths.map((e) => g`<li>${e.map((e) => this.roomName(e)).join(" → ")}</li>`)}</ol>
      `}
    </div>`;
	}
	render() {
		return g`<div class="page ${this.narrow ? "narrow" : ""}">
      ${this.error ? g`<ha-alert alert-type="error">${this.error}
        ${this.topology ? l : g`<button type="button" @click=${() => void this.refreshTopology()}>Retry</button>`}
      </ha-alert>` : l}
      <div class="paths-layout">
        <ha-card><h2>Rooms</h2><nav class="room-tree" aria-label="Room hierarchy">
          ${this.loading ? g`<p role="status">Loading rooms…</p>` : this.topology && this.config ? this.renderTree(this.config.groups, new Set(this.topology.nodes)) : l}
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
b([a({ attribute: !1 })], K.prototype, "hass", void 0), b([a({ attribute: !1 })], K.prototype, "config", void 0), b([a({ type: Boolean })], K.prototype, "narrow", void 0), b([_()], K.prototype, "topology", void 0), b([_()], K.prototype, "selected", void 0), b([_()], K.prototype, "paths", void 0), b([_()], K.prototype, "pending", void 0), b([_()], K.prototype, "error", void 0), b([_()], K.prototype, "loading", void 0), K = b([T("al-paths")], K);
//#endregion
//#region src/yaml-locate.ts
var Ao = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, jo = (e) => e.dash >= 0 ? e.dash : e.indent;
function Mo(e) {
	let t = Ao.exec(e);
	return t ? t[1] ?? t[2] ?? t[3] ?? null : null;
}
function No(e) {
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
function Po(e, t, n, r) {
	for (let i = t + 1; i < n; i++) if (jo(e[i]) <= r) return i;
	return n;
}
function Fo(e, t, n, r) {
	if (t >= n) return -1;
	let i = e[t].indent;
	for (let a = t; a < n; a++) {
		let t = e[a];
		if (t.indent === i && Mo(t.text) === r) return a;
	}
	return -1;
}
function Io(e, t, n, r) {
	if (t >= n || e[t].dash < 0) return -1;
	let i = e[t].dash, a = -1;
	for (let o = t; o < n; o++) if (e[o].dash === i && ++a === r) return o;
	return -1;
}
function Lo(e, t) {
	let n = t.split("/").filter((e) => e !== "");
	if (n.length === 0) return null;
	let r = No(e), i = 0, a = r.length, o = null;
	for (let e of n) {
		let t = /^\d+$/.test(e) ? Io(r, i, a, Number(e)) : Fo(r, i, a, e);
		if (t < 0) return o;
		let n = r[t];
		o = n.line, a = Po(r, t, a, jo(n)), i = n.dash >= 0 ? t : t + 1;
	}
	return o;
}
var q = class extends v {
	constructor(...e) {
		super(...e), this.errors = [], this.available = !0, this.parseError = null, this.seq = 0, this.validating = !1, this.validationFailure = null, this.onYaml = (e) => {
			e.stopPropagation(), window.clearTimeout(this.timer), this.seq++, this.validating = !0, this.validationFailure = null, this.dispatchEvent(dn(!1, []));
			let t = e.detail;
			this.timer = window.setTimeout(() => void this.settle(t), 400);
		};
	}
	static {
		this.styles = [w, n`
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
			this.validating = !1, this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(dn(!1, []));
			return;
		}
		this.parseError = null;
		let t = e.value;
		this.mine = t, this.dispatchEvent(N(t, "code")), await this.validate(t);
	}
	async validate(e) {
		let t = ++this.seq;
		this.validating = !0, this.validationFailure = null, this.dispatchEvent(dn(!1, []));
		try {
			if (!this.hass || !e) throw Error("No configuration or connection available.");
			let n = await Ye(this.hass, e);
			if (t !== this.seq) return;
			this.validating = !1, this.dispatchEvent(dn(n.ok, n.errors));
		} catch {
			if (t !== this.seq) return;
			this.validating = !1, this.validationFailure = "Could not validate this document. Edit again to retry; Save remains disabled.", this.dispatchEvent(dn(!1, []));
		}
	}
	jump(e) {
		let t = this.editor, n = t?.codemirror, r = t?.yaml;
		if (!n || typeof r != "string") return;
		let i = Lo(r, e);
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
		return this.parseError === null ? this.validationFailure ? g`<ha-alert alert-type="error">${this.validationFailure}</ha-alert>` : this.validating ? g`<p class="muted">Validating…</p>` : this.errors.length === 0 ? g`<p class="muted no-problems">No problems. Save applies this document.</p>` : g`
      <p class="count muted">
        ${this.errors.length} ${this.errors.length === 1 ? "problem" : "problems"} — Save is
        disabled until they are fixed.
      </p>
      <ul class="errors">
        ${this.errors.map((e) => g`<li>
            <button type="button" class="jump" @click=${() => this.jump(e.path)}>
              <span class="path">${e.path === "" ? "(document)" : e.path}</span> —
              <span class="message">${e.message}</span>
            </button>
          </li>`)}
      </ul>
    ` : g`<ha-alert class="parse-error" alert-type="error">${this.parseError}</ha-alert>`;
	}
	renderUnavailable() {
		return g`<ha-card header="Code">
      <ha-alert class="editor-missing" alert-type="warning">
        Home Assistant's YAML editor did not load, so this tab cannot open. Visit
        <em>Settings → Devices &amp; services</em> once and reload the page; the other tabs edit the
        same configuration in the meantime.
      </ha-alert>
    </ha-card>`;
	}
	render() {
		return this.available ? g`
      <div class="page">
        <ha-card header="Configuration">
          <ha-yaml-editor @value-changed=${this.onYaml}></ha-yaml-editor>
          ${this.config === void 0 ? l : this.renderProblems()}
        </ha-card>
      </div>
    ` : g`<div class="page">${this.renderUnavailable()}</div>`;
	}
};
b([a({ attribute: !1 })], q.prototype, "hass", void 0), b([a({ attribute: !1 })], q.prototype, "config", void 0), b([a({ attribute: !1 })], q.prototype, "errors", void 0), b([a({ type: Boolean })], q.prototype, "available", void 0), b([_()], q.prototype, "parseError", void 0), b([_()], q.prototype, "validating", void 0), b([_()], q.prototype, "validationFailure", void 0), q = b([T("al-code")], q);
//#endregion
//#region src/floorplan-import.ts
var Ro = (e) => e.trim().toLocaleLowerCase();
function zo(e, t) {
	let n = f(e).map(({ group: e }) => e), r = {}, i = /* @__PURE__ */ new Map();
	for (let e of t.items) {
		let t = e.source_id ? n.filter((t) => t.id === e.source_id) : [], a = t.length ? t : n.filter((t) => Ro(t.name ?? t.id) === Ro(e.name)), o = a.length === 1 ? a[0] : void 0;
		r[e.key] = o ? {
			action: "existing",
			id: o.id
		} : { action: "skip" }, o && i.set(o.id, (i.get(o.id) ?? 0) + 1);
	}
	for (let [e, t] of Object.entries(r)) t.action === "existing" && i.get(t.id) > 1 && (r[e] = { action: "skip" });
	return r;
}
function Bo(e, t, n) {
	let r = new Set(f(e).map(({ group: e }) => e.id));
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
function Vo(e, t, n, r) {
	let i = structuredClone(e), a = new Map(f(i).map(({ group: e }) => [e.id, e])), o = new Map(t.items.map((e) => [e.key, e])), s = [], c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set();
	for (let [e, t] of Object.entries(n)) {
		if (!o.has(e)) throw Error("Source changed. Parse the configuration again.");
		if (t.action === "create") {
			if (!/^[a-z][a-z0-9_]*$/.test(t.id) || a.has(t.id) || d.has(t.id)) throw Error(`${o.get(e).name}: choose an unused ID with lowercase letters, digits and underscores.`);
			if (!t.name.trim()) throw Error("New groups need a name.");
			d.add(t.id);
		}
	}
	let p = (e) => {
		let t = u.get(e);
		if (t) return t;
		if (l.has(e)) throw Error("New group parents form a cycle.");
		let r = n[e];
		if (r?.action !== "create") throw Error("Choose an explicitly created group as the new parent.");
		l.add(e);
		let o;
		if (r.parent) {
			if (o = "id" in r.parent ? a.get(r.parent.id) : p(r.parent.key), !o) throw Error(`${r.name}: the selected parent no longer exists.`);
		} else if (r.kind !== "property") throw Error(`${r.name}: select a parent for this ${r.kind}.`);
		if (!Ae(o?.kind ?? null).includes(r.kind)) throw Error(`${o?.name ?? o?.id ?? "Root"} cannot contain a ${r.kind}.`);
		let s = {
			...Je(r.id, r.kind),
			name: r.name.trim()
		};
		return (o?.children ?? i.groups).push(s), u.set(e, s), l.delete(e), s;
	};
	for (let e of t.items) {
		let t = n[e.key];
		if (!t || t.action === "skip") continue;
		let r = t.action === "create" ? p(e.key) : a.get(t.id);
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
var Ho = 1e6, Uo = (e) => typeof e == "object" && e && "message" in e ? String(e.message) : "Import failed. Try again.", J = class extends v {
	constructor(...e) {
		super(...e), this.disabled = !1, this.text = "", this.source = null, this.choices = {}, this.importGps = !1, this.busy = null, this.error = "", this.notice = "", this.sequence = 0;
	}
	static {
		this.styles = [w, n`
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
		if (n.size > Ho) {
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
		if (this.resetPreview(), this.text.length > Ho) {
			this.error = "Paste is too large (maximum 1 MB of text).";
			return;
		}
		let e = this.sequence, t = this.config;
		this.busy = "parse";
		try {
			let n = await Oe(this.hass, this.text);
			if (e !== this.sequence || !this.isConnected) return;
			if (this.config !== t) {
				this.error = "The draft changed. Parse again to review matches.";
				return;
			}
			this.source = n, this.snapshot = t, this.choices = zo(t, n);
		} catch (t) {
			e === this.sequence && (this.error = Uo(t));
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
		this.choose(e.key, n === "create" ? Bo(this.config, e, this.choices) : n === "skip" ? { action: "skip" } : {
			action: "existing",
			id: n.slice(9)
		});
	}
	preview() {
		if (!this.config || !this.source) return {};
		try {
			return { result: Vo(this.config, this.source, this.choices, this.importGps) };
		} catch (e) {
			return { error: Uo(e) };
		}
	}
	async apply() {
		if (!this.hass || this.disabled || this.busy || this.config !== this.snapshot) return;
		let { result: e } = this.preview();
		if (!e?.summary.length) return;
		let t = ++this.sequence, n = this.config;
		this.busy = "apply", this.error = "";
		try {
			let r = await Ye(this.hass, e.config);
			if (t !== this.sequence || this.config !== n || !this.isConnected || this.disabled) return;
			if (!r.ok) {
				this.error = r.errors.map((e) => `${e.path}: ${e.message}`).join("; ") || "Configuration validation failed.";
				return;
			}
			this.resetPreview(), this.notice = "Import applied to the draft. Use Save to persist it, or Undo to revert the import.", this.dispatchEvent(N(e.config, void 0, e.created ? !0 : void 0));
		} catch (e) {
			t === this.sequence && (this.error = Uo(e));
		} finally {
			t === this.sequence && (this.busy = null);
		}
	}
	renderCreation(e, t) {
		let n = this.disabled || this.busy === "apply", r = f(this.config).map(({ group: e }) => e), i = t.parent ? "id" in t.parent ? `existing:${t.parent.id}` : `new:${t.parent.key}` : "";
		return g`<div class="creation">
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
        ${Ue.map((e) => g`<option value=${e} .selected=${t.kind === e}>${C[e].label}</option>`)}
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
        ${r.filter((e) => Ae(e.kind).includes(t.kind)).map((e) => g`<option value=${`existing:${e.id}`} .selected=${i === `existing:${e.id}`}>${e.name ?? e.id} (${e.id})</option>`)}
        ${Object.entries(this.choices).filter(([n, r]) => n !== e.key && r.action === "create" && Ae(r.kind).includes(t.kind)).map(([e, t]) => g`<option value=${`new:${e}`} .selected=${i === `new:${e}`}>New: ${t.name} (${t.id})</option>`)}
      </select></label>
    </div>`;
	}
	renderItem(e) {
		let t = this.choices[e.key] ?? { action: "skip" }, n = t.action === "existing" ? `existing:${t.id}` : t.action;
		return g`<fieldset class="mapping" data-key=${e.key}>
      <legend>${e.context ? `${e.context} / ` : ""}${e.name} · ${C[e.kind].label}</legend>
      <p class="muted">${e.points ? `${e.points.length} outline vertices. ` : ""}
        ${e.bounds ? `Elevation ${e.bounds[0][2]}–${e.bounds[1][2]} m.` : "No vertical bounds supplied."}</p>
      <label>Destination <select class="destination" .value=${n} ?disabled=${this.disabled || this.busy === "apply"}
        @change=${(t) => this.destination(e, t)}>
        <option value="skip" .selected=${n === "skip"}>Skip</option>
        <option value="create" .selected=${n === "create"}>Create new group…</option>
        ${f(this.config).map(({ group: e }) => g`<option value=${`existing:${e.id}`} .selected=${n === `existing:${e.id}`}>
          ${e.name ?? e.id} (${e.id}) · ${C[e.kind].label}
        </option>`)}
      </select></label>
      ${t.action === "create" ? this.renderCreation(e, t) : l}
    </fieldset>`;
	}
	render() {
		let e = this.preview(), t = this.disabled || this.busy === "apply";
		return g`
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
      ${this.error ? g`<p class="error" role="alert">${this.error}</p>` : l}
      ${this.notice ? g`<p role="status">${this.notice}</p>` : l}
      ${this.source ? g`
        <h3>Review mappings</h3>
        <p>Matches are suggestions. Unmatched entries are skipped. Creating a group is always an explicit choice.</p>
        ${this.source.gps ? g`<label class="check"><input id="gps" type="checkbox" .checked=${this.importGps}
          ?disabled=${t} @change=${(e) => {
			this.importGps = e.target.checked, this.error = "";
		}}>
          ${this.config?.gps ? "Replace" : "Import"} GPS origin (${this.source.gps.latitude}, ${this.source.gps.longitude})
        </label>` : l}
        ${this.source.items.map((e) => this.renderItem(e))}
        <section class="summary" aria-label="Import changes">
          <h3>Changes to apply</h3>
          ${e.error ? g`<p class="error" role="alert">${e.error}</p>` : g`
            <ul>${e.result?.summary.map((e) => g`<li>${e}</li>`)}</ul>
            ${e.result?.summary.length ? l : g`<p>No changes selected.</p>`}`}
          <button id="apply" type="button" ?disabled=${!e.result?.summary.length || !!this.busy || this.disabled}
            @click=${this.apply}>${this.busy === "apply" ? "Validating…" : "Apply to draft"}</button>
        </section>` : l}
    `;
	}
};
b([a({ attribute: !1 })], J.prototype, "hass", void 0), b([a({ attribute: !1 })], J.prototype, "config", void 0), b([a({ type: Boolean })], J.prototype, "disabled", void 0), b([_()], J.prototype, "text", void 0), b([_()], J.prototype, "source", void 0), b([_()], J.prototype, "choices", void 0), b([_()], J.prototype, "importGps", void 0), b([_()], J.prototype, "busy", void 0), b([_()], J.prototype, "error", void 0), b([_()], J.prototype, "notice", void 0), J = b([T("al-floorplan-import")], J);
//#endregion
//#region src/property-layout.ts
var Wo = 6378137, Y = Math.PI / 180;
function Go(e) {
	return Number.isFinite(e.latitude) && Math.abs(e.latitude) < 85 && Number.isFinite(e.longitude) && Math.abs(e.longitude) <= 180 && Number.isFinite(e.rotation ?? 0) && Number.isFinite(e.elevation ?? 0);
}
function Ko([e, t], n) {
	let r = (n.rotation ?? 0) * Y, i = e * Math.cos(r) - t * Math.sin(r), a = e * Math.sin(r) + t * Math.cos(r);
	return [n.longitude + i / (Wo * Math.cos(n.latitude * Y)) / Y, n.latitude + a / Wo / Y];
}
function qo([e, t], n) {
	let r = (e - n.longitude) * Y * Wo * Math.cos(n.latitude * Y), i = (t - n.latitude) * Y * Wo, a = (n.rotation ?? 0) * Y;
	return [r * Math.cos(a) + i * Math.sin(a), -r * Math.sin(a) + i * Math.cos(a)];
}
function Jo([e, t], n) {
	let r = 256 * 2 ** n, i = Math.sin(Math.max(-85, Math.min(85, t)) * Y);
	return [(e + 180) / 360 * r, (.5 - Math.log((1 + i) / (1 - i)) / (4 * Math.PI)) * r];
}
function Yo([e, t], n) {
	let r = 256 * 2 ** n;
	return [e / r * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * t / r))) / Y];
}
function Xo(e) {
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
function Zo(e, t, n, r, i) {
	if (![
		n,
		r,
		i
	].every(Number.isFinite)) throw Error("Placement needs finite numbers.");
	let a = structuredClone(e), o = f(a).find((e) => e.group.id === t)?.group;
	if (!o || o.kind !== "structure" || !o.bounds) throw Error("Choose a structure with dimensions.");
	let [[s, c], [l, u]] = o.bounds, d = (s + l) / 2, p = (c + u) / 2, m = i * Y, h = (e) => {
		let t = Xo(e);
		if (t.length && (e.points = t.map(([e, t]) => [d + n + (e - d) * Math.cos(m) - (t - p) * Math.sin(m), p + r + (e - d) * Math.sin(m) + (t - p) * Math.cos(m)]), e.bounds)) {
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
					d + n + (t - d) * Math.cos(m) - (a - p) * Math.sin(m),
					p + r + (t - d) * Math.sin(m) + (a - p) * Math.cos(m),
					o
				],
				yaw: ((e.yaw + i) % 360 + 360) % 360
			};
		}), e.children.forEach(h);
	};
	return h(o), a;
}
function Qo(e) {
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
var $o = {
	property: "#74836b",
	lawn: "#65964d",
	driveway: "#89919a",
	path: "#b5a58a",
	pool: "#59aac7"
}, X = 512, Z = class extends v {
	constructor(...e) {
		super(...e), this.disabled = !1, this.latitude = "", this.longitude = "", this.elevation = "", this.rotation = "0", this.loadedLocation = !1, this.error = "", this.mapOpen = !1, this.tileError = !1, this.zoom = 19, this.provider = "https://tile.openstreetmap.org/{z}/{x}/{y}.png", this.attribution = "© OpenStreetMap contributors", this.editing = null, this.name = "", this.kind = "property", this.vertices = "", this.structure = "", this.dx = "0", this.dy = "0", this.angle = "0", this.busy = !1;
	}
	static {
		this.styles = n`
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
				if (!Go(e)) throw Error("Home Assistant location is outside the supported map range. Edit Home information first.");
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
			if (this.elevation.trim() && (e.elevation = Number(this.elevation)), !Go(e)) throw Error("Enter valid coordinates (latitude between −85 and 85) and finite elevation/rotation.");
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
			if (!this.config?.gps || !Go(this.config.gps)) throw Error("Apply a valid geographic origin first.");
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
		return Jo(this.center, this.zoom);
	}
	screen(e) {
		let t = Jo(Ko(e, this.config.gps), this.zoom), n = this.originPixel();
		return [t[0] - n[0] + X / 2, t[1] - n[1] + X / 2];
	}
	pan(e, t) {
		let n = this.originPixel();
		this.center = Yo([n[0] + e * 128, n[1] + t * 128], this.zoom);
	}
	addVertex(e) {
		if (this.disabled || !this.config?.gps) return;
		let t = e.currentTarget.getBoundingClientRect(), n = this.originPixel(), r = qo(Yo([n[0] + (e.clientX - t.left) / t.width * X - X / 2, n[1] + (e.clientY - t.top) / t.height * X - X / 2], this.zoom), this.config.gps);
		this.vertices = [this.vertices.trim(), r.map((e) => e.toFixed(3)).join(", ")].filter(Boolean).join("\n");
	}
	addFeature() {
		if (!(!this.config || this.disabled)) try {
			if (!this.name.trim()) throw Error("Give the feature a name.");
			let e = Qo(this.vertices), t = this.config.site ?? {
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
			this.dispatchEvent(N(Zo(this.config, this.structure, Number(this.dx), Number(this.dy), Number(this.angle)))), this.dx = this.dy = this.angle = "0", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	tiles() {
		let [e, t] = this.originPixel(), n = 2 ** this.zoom, r = e - X / 2, i = t - X / 2, a = [];
		for (let e = Math.floor(i / 256); e <= Math.floor((i + X) / 256); e++) if (!(e < 0 || e >= n)) for (let t = Math.floor(r / 256); t <= Math.floor((r + X) / 256); t++) {
			let o = this.provider.replace("{z}", String(this.zoom)).replace("{x}", String((t % n + n) % n)).replace("{y}", String(e));
			a.push(S`<image href=${o} x=${t * 256 - r} y=${e * 256 - i} width="256" height="256"
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
		if (!this.config) return l;
		let e = this.config.gps, t = f(this.config).map((e) => e.group).filter((e) => e.kind === "structure" && e.bounds), n = this.vertices.trim().split("\n").map((e) => e.trim().split(/[,\s]+/).map(Number)).filter((e) => e.length === 2 && e.every(Number.isFinite));
		return g`
      <p>Use your home location, trace outdoor features, and place existing buildings. Changes join the panel draft; use Save to keep them.</p>
      ${e ? g`<p>Current origin: ${e.latitude}, ${e.longitude}; rotation ${e.rotation ?? 0}°.</p>` : g`<p>No geographic origin configured yet.</p>`}
      <fieldset ?disabled=${this.disabled || this.busy}>
        <legend>Location</legend>
        <button @click=${this.useHome}>Use Home Assistant location</button>
        <a href="/config/general" target="_blank" rel="noopener">Edit Home Assistant home information</a>
        ${this.loadedLocation ? g`<p>Home location loaded below. Apply it to this floorplan when ready.</p>` : l}
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
      ${this.mapOpen && e && this.center ? g`
        <div class="row"><button @click=${() => {
			this.zoom = Math.min(19, this.zoom + 1);
		}}>Zoom in</button><button @click=${() => {
			this.zoom = Math.max(3, this.zoom - 1);
		}}>Zoom out</button>
          <button @click=${() => this.pan(-1, 0)}>West</button><button @click=${() => this.pan(1, 0)}>East</button><button @click=${() => this.pan(0, -1)}>North</button><button @click=${() => this.pan(0, 1)}>South</button></div>
        <p>Click the map to add outline vertices, or enter local coordinates below.</p>
        <div class="map"><svg viewBox=${`0 0 ${X} ${X}`} role="img" aria-label="Property map; use coordinate fields below for keyboard editing" @click=${this.addVertex}>
          ${this.tiles()}
          ${this.config.site?.features.map((e) => S`<polygon points=${this.polygon(e.points)} fill=${$o[e.kind]} fill-opacity="0.35" stroke=${$o[e.kind]} stroke-width="2"></polygon>`)}
          ${t.map((e) => S`<polygon points=${this.polygon(Xo(e))} fill="#46b6ff" fill-opacity="0.15" stroke="#159ce9" stroke-width="2"></polygon>`)}
          <polyline points=${this.polygon(n)} fill="#ffcc55" fill-opacity="0.2" stroke="#ffcc55" stroke-width="3"></polyline>
          ${n.map((e) => {
			let [t, n] = this.screen(e);
			return S`<circle cx=${t} cy=${n} r="4" fill="#ffcc55"></circle>`;
		})}
        </svg><div class="credit">${this.attribution} · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></div></div>
        ${this.tileError ? g`<p role="status">Some map tiles could not load. Coordinates and layout editing remain available.</p>` : l}
      ` : l}
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
		}}>${Object.keys($o).map((e) => g`<option value=${e}>${e}</option>`)}</select></label></div>
        <label>Outline coordinates (X, Y metres; one vertex per line)<textarea .value=${this.vertices} @input=${(e) => {
			this.vertices = e.target.value;
		}}></textarea></label>
        <div class="row"><button @click=${this.addFeature}>${this.editing === null ? "Add ground feature" : "Update ground feature"}</button><button @click=${() => {
			this.vertices = "", this.editing = null;
		}}>Clear drawing</button></div>
        <ul>${this.config.site?.features.map((e, t) => g`<li>${e.name} (${e.kind}) <button @click=${() => this.editFeature(t)}>Edit ${e.name}</button> <button @click=${() => this.removeFeature(t)}>Remove ${e.name}</button></li>`)}</ul>
      </fieldset>
      <fieldset ?disabled=${this.disabled}><legend>Place existing structures</legend>
        <p>Move in local metres and rotate counterclockwise around the building centre. All descendant rooms move together; their dimensions and heights are preserved.</p>
        <div class="row"><label>Structure<select .value=${this.structure} @change=${(e) => {
			this.structure = e.target.value;
		}}><option value="">Choose a building</option>${t.map((e) => g`<option value=${e.id}>${e.name ?? e.id}</option>`)}</select></label>
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
      ${this.error ? g`<p class="error" role="alert">${this.error}</p>` : l}`;
	}
};
b([a({ attribute: !1 })], Z.prototype, "config", void 0), b([a({ attribute: !1 })], Z.prototype, "hass", void 0), b([a({ type: Boolean })], Z.prototype, "disabled", void 0), b([_()], Z.prototype, "latitude", void 0), b([_()], Z.prototype, "longitude", void 0), b([_()], Z.prototype, "elevation", void 0), b([_()], Z.prototype, "rotation", void 0), b([_()], Z.prototype, "loadedLocation", void 0), b([_()], Z.prototype, "error", void 0), b([_()], Z.prototype, "mapOpen", void 0), b([_()], Z.prototype, "tileError", void 0), b([_()], Z.prototype, "zoom", void 0), b([_()], Z.prototype, "center", void 0), b([_()], Z.prototype, "provider", void 0), b([_()], Z.prototype, "attribution", void 0), b([_()], Z.prototype, "editing", void 0), b([_()], Z.prototype, "name", void 0), b([_()], Z.prototype, "kind", void 0), b([_()], Z.prototype, "vertices", void 0), b([_()], Z.prototype, "structure", void 0), b([_()], Z.prototype, "dx", void 0), b([_()], Z.prototype, "dy", void 0), b([_()], Z.prototype, "angle", void 0), b([_()], Z.prototype, "busy", void 0), Z = b([T("al-property-layout")], Z);
//#endregion
//#region src/sensor-profiles.ts
var es = [
	"manufacturer",
	"model",
	"platform",
	"device_class",
	"entity_name"
], ts = (e) => e.trim().toLowerCase();
function ns(e, t) {
	let n = es.filter((t) => e.match[t]);
	return !!e.match.model && !!(e.match.manufacturer || e.match.platform) && n.every((n) => n === "entity_name" ? ts(t[n] ?? "").includes(ts(e.match[n])) : ts(t[n] ?? "") === ts(e.match[n]));
}
function rs(e, t) {
	return {
		...e,
		profile_id: t.id,
		kind: t.kind,
		fov: t.fov,
		vertical_fov: t.vertical_fov,
		range: t.range,
		technology: t.technology,
		mount: t.mount
	};
}
function is(e) {
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
		if (![
			"motion",
			"occupancy",
			"light"
		].includes(t.kind) || ![
			t.fov,
			t.vertical_fov,
			t.range
		].every((e) => typeof e == "number" && Number.isFinite(e))) throw Error("Profile kind and coverage fields are required.");
		if (!Me({
			...ye(t.kind === "light" ? "light.profile" : "binary_sensor.profile"),
			...t
		}) || n.has(t.id)) throw Error("Invalid coverage or duplicate profile id.");
		if (!t.match || typeof t.match != "object" || Array.isArray(t.match)) throw Error("Invalid identification rules.");
		for (let [e, n] of Object.entries(t.match)) if (!es.includes(e) || typeof n != "string" || !n.trim() || n.length > 200) throw Error("Invalid identification rule.");
		return n.add(t.id), {
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
function as(e, t, n, r, i) {
	let a = f(e), o = a.find((e) => e.group.id === t);
	if (!o) return [];
	let s = o.group.area_id;
	s ||= a.filter((e) => e.path.length < o.path.length && e.path.every((e, t) => o.path[t] === e)).sort((e, t) => t.path.length - e.path.length).find((e) => e.group.area_id)?.group.area_id ?? null;
	let c = a.filter((e) => o.path.every((t, n) => e.path[n] === t)), l = new Set(c.flatMap((e) => e.group.stimuli.map((e) => e.entity))), u = new Set(o.group.fixtures?.map((e) => e.entity)), d = new Map(n.map((e) => [e.entity, e])), p = /* @__PURE__ */ new Set([
		...n.filter((e) => s && e.area_id === s).map((e) => e.entity),
		...l,
		...u
	]), m = new Set(c.flatMap((e) => (i?.voices[e.group.id] ?? []).filter((e) => e.value > 0 && e.entity).map((e) => e.entity)));
	return [...p].filter((e) => /^(binary_sensor|light)\./.test(e)).map((e) => {
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
			contributing: m.has(e),
			placed: u.has(e),
			changed: Number.isFinite(Date.parse(t?.last_changed ?? "")) ? Date.parse(t.last_changed) / 1e3 : 0
		};
	}).sort((e, t) => Number(t.input) - Number(e.input) || Number(t.contributing) - Number(e.contributing) || t.changed - e.changed || e.name.localeCompare(t.name));
}
//#endregion
//#region src/sensor-catalog.ts
var os = "https://www.sourcesecurity.com/datasheets/bosch-isc-bpr2-w12-chi-intruder-detector/co-289-ga/BlueLine_Gen_2_Data_sheet_enUS_2603228171.pdf", ss = [{
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
	kind: "motion",
	fov: 94,
	vertical_fov: 45,
	range: 12,
	technology: "Wired PIR / NC alarm relay",
	mount: "Wall / corner",
	match: {
		manufacturer: "Bosch",
		model: n
	},
	notes: r + " Bosch specifies 12 m × 12 m coverage; the coverage diagram shows a 94° horizontal spread. Mount level on a wall or in a corner, 2.2–2.75 m above the floor; set your actual height and aim separately. The 45° vertical angle is an illustrative editor default, not a Bosch specification. The overlay approximates the footprint, not the segmented PIR beams, lookdown zones, or a pet exclusion volume. Select the alarm/motion binary sensor, not tamper. Wired alarm/ESPHome bridges may expose their own manufacturer and model, so confirm the label and select this profile manually when needed. ",
	source: os
}))], cs = class extends v {
	constructor(...e) {
		super(...e), this.mode = "place", this.disabled = !1, this.error = "", this.dragged = !1, this.suppressClick = !1;
	}
	static {
		this.styles = n`
    :host { display:block; min-width:0; } svg { width:100%; height:clamp(320px,48vh,550px); display:block; background:radial-gradient(#203b4b,#102330); border:1px solid #4c7186; border-radius:12px; touch-action:none; }
    .outline { fill:#2b536177; stroke:#8ed9ea; stroke-width:2; vector-effect:non-scaling-stroke; }
    .marker { fill:#8ed9ea; stroke:#102330; stroke-width:2; vector-effect:non-scaling-stroke; cursor:grab; }
    .selected { fill:#ffcd69; } .marker:focus { stroke:white; outline:none; }
    .coverage { fill:#ffcd6929; stroke:#ffcd6988; vector-effect:non-scaling-stroke; }
    .aim { stroke:#ffcd69; stroke-width:2; vector-effect:non-scaling-stroke; }
    p { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f77); }
  `;
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
		if (this.disabled || !this.fixture?.entity || !this.group) return;
		let t = this.point(e);
		if (!t) return;
		if (this.error = "", this.mode === "aim" && this.drag === void 0) {
			let [e, n] = this.fixture.position;
			Math.hypot(t[0] - e, t[1] - n) > .001 && this.emit("al-fixture-aim", Math.atan2(t[1] - n, t[0] - e) * 180 / Math.PI);
			return;
		}
		let n = [
			Number(t[0].toFixed(3)),
			Number(t[1].toFixed(3)),
			this.fixture.position[2]
		];
		if (!Be(this.group, n)) {
			this.error = "Choose a point inside the room outline.";
			return;
		}
		this.emit("al-fixture-position", n);
	}
	render() {
		let e = this.group, t = e?.bounds;
		if (!e || !t) return l;
		let n = Xo(e), r = t[1][0] - t[0][0], i = t[1][1] - t[0][1], a = Math.max(r, i) * .12, o = Math.max(r, i) * .018, s = [...(e.fixtures ?? []).filter((e) => e.entity !== this.fixture?.entity), ...this.fixture?.entity ? [this.fixture] : []], c = this.fixture, u = l;
		if (c?.entity && c.range > 0 && c.kind !== "light" && Number.isFinite(c.yaw) && Number.isFinite(c.fov)) {
			let e = Array.from({ length: 25 }, (e, t) => {
				let n = (c.yaw - c.fov / 2 + c.fov * t / 24) * Math.PI / 180;
				return `${c.position[0] + c.range * Math.cos(n)},${-c.position[1] - c.range * Math.sin(n)}`;
			});
			u = S`<polygon class="coverage" points=${`${c.position[0]},${-c.position[1]} ${e.join(" ")}`} />`;
		}
		return g`<svg viewBox=${`${t[0][0] - a} ${-t[1][1] - a} ${r + a * 2} ${i + a * 2}`} aria-label="Top-down room placement" role="group"
      @click=${(e) => {
			if (this.suppressClick) {
				this.suppressClick = !1;
				return;
			}
			this.place(e);
		}}
      @pointermove=${(e) => {
			this.drag === e.pointerId && (this.dragged = !0, this.place(e));
		}}
      @pointerup=${() => {
			this.suppressClick = this.dragged, this.drag = void 0, this.dragged = !1;
		}}
      @pointercancel=${() => {
			this.drag = void 0, this.dragged = !1;
		}}>
      <polygon class="outline" points=${n.map(([e, t]) => `${e},${-t}`).join(" ")} />
      ${u}
      ${s.filter((e) => e.position.every(Number.isFinite)).map((e) => S`<g>
        <circle class=${`marker ${e.entity === c?.entity ? "selected" : ""}`} cx=${e.position[0]} cy=${-e.position[1]} r=${o} role="button" tabindex=${this.disabled ? -1 : 0} aria-label=${`Select ${e.name || e.entity}`}
          @pointerdown=${(t) => {
			this.disabled || t.button !== 0 || (t.stopPropagation(), this.emit("al-fixture-select", e.entity), this.drag = t.pointerId, this.dragged = !1, this.renderRoot.querySelector("svg").setPointerCapture(t.pointerId));
		}}
          @click=${(t) => {
			t.stopPropagation(), this.disabled || this.emit("al-fixture-select", e.entity);
		}}
          @keydown=${(t) => {
			!this.disabled && ["Enter", " "].includes(t.key) && (t.preventDefault(), this.emit("al-fixture-select", e.entity));
		}}><title>${e.name || e.entity}</title></circle>
        ${e.entity === c?.entity ? S`<line class="aim" x1=${e.position[0]} y1=${-e.position[1]} x2=${e.position[0] + o * 5 * Math.cos(e.yaw * Math.PI / 180)} y2=${-e.position[1] - o * 5 * Math.sin(e.yaw * Math.PI / 180)}/>` : l}
      </g>`)}
    </svg><p>${this.fixture?.entity ? this.mode === "place" ? "Click to place · drag a marker to move it · select Aim to set direction" : "Click in the direction the sensor faces" : "Select a device to start placing it."} · Top = +Y</p>
    ${this.error ? g`<p class="error" role="alert">${this.error}</p>` : l}`;
	}
};
b([a({ attribute: !1 })], cs.prototype, "group", void 0), b([a({ attribute: !1 })], cs.prototype, "fixture", void 0), b([a({ type: String })], cs.prototype, "mode", void 0), b([a({ type: Boolean })], cs.prototype, "disabled", void 0), b([_()], cs.prototype, "error", void 0), cs = b([T("al-room-plan")], cs);
//#endregion
//#region src/al-room-device-editor.ts
var Q = class extends v {
	constructor(...e) {
		super(...e), this.live = null, this.disabled = !1, this.room = "", this.fixture = ye(), this.mode = "place", this.error = "", this.notice = "", this.registry = [], this.registryError = "", this.loading = !1, this.search = "", this.profile = "", this.profileName = "", this.profileText = "", this.preview3d = !1, this.sequence = 0;
	}
	static {
		this.styles = n`
    :host { display:block; } fieldset { border:0; padding:0; margin:0; min-width:0; }
    .workbench { display:grid; grid-template-columns:minmax(0,2fr) minmax(260px,1fr); gap:20px; margin:16px 0; }
    .fields { display:flex; flex-wrap:wrap; gap:12px; } label { display:flex; flex-direction:column; gap:4px; margin:6px 0; }
    input,select,button,textarea { font:inherit; padding:8px; color:var(--primary-text-color); background:var(--card-background-color,white); border:1px solid var(--divider-color,#888); border-radius:6px; box-sizing:border-box; }
    button { cursor:pointer; margin:6px 8px 6px 0; } button:disabled { opacity:.5; cursor:default; }
    button[aria-pressed=true] { border-color:var(--primary-color,#6edbec); background:var(--secondary-background-color,#304b60); }
    input[type=number] { width:110px; } .muted { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f66); }
    .devices { max-height:300px; overflow:auto; } .device { display:block; width:100%; text-align:left; margin:4px 0; overflow-wrap:anywhere; }
    .device small { display:block; } details { margin:16px 0; } summary { cursor:pointer; padding:8px 0; }
    textarea { width:100%; min-height:100px; } .status { min-height:20px; } h3 { margin:8px 0; }
    @media(max-width:850px) { .workbench { grid-template-columns:1fr; } .devices { max-height:200px; } }
  `;
	}
	get group() {
		return this.config && f(this.config).find((e) => e.group.id === this.room)?.group;
	}
	get candidates() {
		return this.config ? as(this.config, this.room, this.registry, this.hass, this.live) : [];
	}
	get profiles() {
		return [...this.config?.sensor_profiles ?? [], ...ss];
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
		let e = this.group?.bounds;
		this.fixture = {
			...ye(),
			position: e ? [
				(e[0][0] + e[1][0]) / 2,
				(e[0][1] + e[1][1]) / 2,
				e[0][2] + Math.min(1.5, e[1][2] - e[0][2])
			] : [
				0,
				0,
				0
			]
		}, this.original = void 0, this.error = "", this.notice = "", this.mode = "place", this.profile = "", this.profileName = "", this.search = "", this.preview3d = !1;
	}
	select(e) {
		if (this.disabled || e === this.fixture.entity) return;
		let t = this.group?.fixtures?.find((t) => t.entity === e);
		if (t) this.fixture = structuredClone(t), this.original = e, this.profile = t.profile_id ?? "";
		else {
			let t = this.candidates.find((t) => t.entity === e);
			if (!t) return;
			let n = this.fixture.position, r = e.startsWith("light.") ? "light" : t.device_class === "occupancy" || t.device_class === "presence" ? "occupancy" : "motion";
			this.fixture = {
				...ye(e, r),
				position: n,
				name: t.name
			}, this.original = void 0, this.profile = "";
		}
		if (!this.profile) {
			let t = this.candidates.find((t) => t.entity === e), n = t ? this.profiles.filter((e) => e.kind === "light" == (this.fixture.kind === "light") && ns(e, t)) : [];
			this.profile = n.length === 1 ? n[0].id : "";
		}
		this.error = "", this.notice = "", this.profileName = "";
	}
	patch(e) {
		this.disabled || (this.fixture = {
			...this.fixture,
			...e
		}, this.error = "", this.notice = "");
	}
	save() {
		if (!(!this.config || this.disabled)) try {
			this.dispatchEvent(N(We(this.config, this.room, this.fixture, this.original))), this.original = this.fixture.entity, this.notice = "Placement added to draft. Use Save in the panel to persist it.", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	removeFixture() {
		if (!this.config || !this.original || this.disabled) return;
		let e = structuredClone(this.config), t = f(e).find((e) => e.group.id === this.room)?.group;
		t && (t.fixtures = t.fixtures?.filter((e) => e.entity !== this.original), this.dispatchEvent(N(e)), this.reset());
	}
	useProfile() {
		let e = this.profiles.find((e) => e.id === this.profile);
		if (!(!e || this.disabled)) {
			if (e.kind === "light" !== this.fixture.entity.startsWith("light.")) {
				this.error = "Choose a profile matching this entity's domain.";
				return;
			}
			this.patch(rs(this.fixture, e)), this.profileName = e.name;
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
			let r = is(JSON.stringify([{
				id: t?.id ?? `personal:${crypto.randomUUID()}`,
				name: this.profileName,
				kind: this.fixture.kind,
				fov: this.fixture.fov,
				vertical_fov: this.fixture.vertical_fov,
				range: this.fixture.range,
				technology: this.fixture.technology,
				mount: this.fixture.mount,
				notes: t?.notes ?? "",
				source: t?.source ?? "",
				match: t?.match ?? n
			}]))[0], i = [...(this.config.sensor_profiles ?? []).filter((e) => e.id !== r.id), r];
			is(JSON.stringify(i)), this.dispatchEvent(N({
				...this.config,
				sensor_profiles: i
			})), this.profile = r.id, this.notice = "Model profile added to draft. Apply it to any matching device.", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	importProfiles() {
		if (!(!this.config || this.disabled)) try {
			let e = is(this.profileText), t = new Set(e.map((e) => e.id));
			if (e.some((e) => e.id.startsWith("community:"))) throw Error("Use personal profile ids when importing; community ids are reserved.");
			let n = is(JSON.stringify([...(this.config.sensor_profiles ?? []).filter((e) => !t.has(e.id)), ...e]));
			this.dispatchEvent(N({
				...this.config,
				sensor_profiles: n
			})), this.notice = "Profiles added to draft. Matching ids were updated.", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	numeric(e, t, n, r) {
		return g`<label>${t}<input type="number" data-field=${e} min=${n} max=${r} step="any" .value=${String(this.fixture[e])}
      @input=${(t) => this.patch({ [e]: t.target.valueAsNumber })}></label>`;
	}
	render() {
		if (!this.config) return l;
		let e = f(this.config).filter((e) => e.group.bounds && ![
			"property",
			"structure",
			"floor"
		].includes(e.group.kind)), t = this.group, n = t?.bounds, r = this.candidates.filter((e) => `${e.name} ${e.entity}`.toLowerCase().includes(this.search.toLowerCase())), i = this.candidates.find((e) => e.entity === this.fixture.entity), a = i ? this.profiles.filter((e) => ns(e, i)) : [], o = this.profiles.find((e) => e.id === this.profile), s = this.config;
		if (this.preview3d && this.fixture.entity) try {
			s = We(this.config, this.room, this.fixture, this.original);
		} catch {}
		return g`<fieldset ?disabled=${this.disabled}>
      <label>Room<select id="device-room" .value=${this.room} @change=${(e) => {
			this.room = e.target.value, this.reset();
		}}>
        <option value="">Choose a room</option>${e.map((e) => g`<option value=${e.group.id} .selected=${e.group.id === this.room}>${e.group.name || e.group.id}</option>`)}</select></label>
      ${n ? g`<div class="workbench"><div>
        <div><button type="button" aria-pressed=${this.mode === "place"} @click=${() => {
			this.mode = "place";
		}}>Place / move</button>
          <button type="button" aria-pressed=${this.mode === "aim"} ?disabled=${!this.fixture.entity || this.fixture.kind === "light"} @click=${() => {
			this.mode = "aim";
		}}>Aim</button></div>
        <al-room-plan .group=${t} .fixture=${this.fixture} .mode=${this.mode} .disabled=${this.disabled}
          @al-fixture-position=${(e) => {
			e.stopPropagation(), this.patch({ position: e.detail });
		}}
          @al-fixture-aim=${(e) => this.patch({ yaw: Number(e.detail.toFixed(1)) })}
          @al-fixture-select=${(e) => this.select(e.detail)}></al-room-plan>
      </div><div><h3>Devices in this room</h3>
        <input aria-label="Find room device" placeholder="Find a sensor or light…" .value=${this.search} @input=${(e) => {
			this.search = e.target.value;
		}}>
        <p class="muted">Activity inputs first, then contributing now, then most recently changed.</p>
        <div class="devices">${r.map((e) => g`<button type="button" class="device" data-entity=${e.entity} aria-pressed=${this.fixture.entity === e.entity} @click=${() => this.select(e.entity)}>
          ${e.name}<small>${e.entity}</small><small>${e.contributing ? "Contributing now" : e.input ? "Activity input" : "Room device"}${e.placed ? " · placed" : ""} · ${this.hass?.states[e.entity]?.state ?? "unavailable"}</small>
          ${e.changed ? g`<small>Changed ${(/* @__PURE__ */ new Date(e.changed * 1e3)).toLocaleString()}</small>` : l}</button>`)}</div>
        ${r.length ? l : g`<p class="muted">No matching devices. Assign devices to this room's HA area or configure its activity inputs. No whole-home fallback is used.</p>`}
        ${this.registryError ? g`<p class="error" role="alert">${this.registryError}</p>` : l}
        <button type="button" ?disabled=${this.loading} @click=${() => void this.loadDevices()}>${this.loading ? "Loading devices…" : "Refresh room devices"}</button>
        ${i ? g`<p class="muted">${[
			i.manufacturer,
			i.model,
			i.platform
		].filter(Boolean).join(" · ")}</p>` : l}
      </div></div>
      ${this.fixture.entity ? g`<h3>${this.fixture.name || this.fixture.entity}</h3>
        <div class="fields"><label>Height above floor (m)<input id="fixture-height" type="number" min="0" max=${n[1][2] - n[0][2]} step="any" .value=${String(Number((this.fixture.position[2] - n[0][2]).toFixed(3)))}
          @input=${(e) => this.patch({ position: [
			this.fixture.position[0],
			this.fixture.position[1],
			n[0][2] + e.target.valueAsNumber
		] })}></label>
          <label>Sensor model profile<select id="sensor-profile" .value=${this.profile} @change=${(e) => {
			this.profile = e.target.value;
		}}>
            <option value="">Choose a profile</option>${this.profiles.filter((e) => e.kind === "light" === this.fixture.entity.startsWith("light.")).map((e) => g`<option value=${e.id} .selected=${e.id === this.profile}>${a.includes(e) ? "Suggested · " : ""}${e.name}</option>`)}</select></label>
          <button type="button" ?disabled=${!o} @click=${() => this.useProfile()}>Apply profile</button></div>
        ${a.length ? g`<p class="muted">Suggested from device metadata: ${a.map((e) => e.name).join(", ")}. Confirm the model and sensor entity before applying.</p>` : l}
        ${o ? g`<p class="muted">${o.notes}</p>${/^https?:\/\//.test(o.source) ? g`<a href=${o.source} target="_blank" rel="noopener noreferrer">Profile source</a>` : l}` : l}
        <details><summary>Adjust characteristics and precise position</summary><div class="fields">
          <label>Type<select id="fixture-kind" .value=${this.fixture.kind} @change=${(e) => this.patch({ kind: e.target.value })}>${[
			"motion",
			"occupancy",
			"light"
		].map((e) => g`<option value=${e} .selected=${e === this.fixture.kind}>${e}</option>`)}</select></label>
          <label>Label<input maxlength="100" .value=${this.fixture.name} @input=${(e) => this.patch({ name: e.target.value })}></label>
          <label>Mount<input maxlength="60" .value=${this.fixture.mount} @input=${(e) => this.patch({ mount: e.target.value })}></label>
          <label>Model / technology<input maxlength="60" .value=${this.fixture.technology} @input=${(e) => this.patch({ technology: e.target.value })}></label>
          ${[0, 1].map((e) => g`<label>${e === 0 ? "X" : "Y"} (m)<input type="number" step="any" .value=${String(this.fixture.position[e])} @input=${(t) => {
			let n = [...this.fixture.position];
			n[e] = t.target.valueAsNumber, this.patch({ position: n });
		}}></label>`)}
          ${this.numeric("yaw", "Direction (°)", -360, 360)}${this.numeric("pitch", "Tilt (°)", -90, 90)}
          ${this.fixture.kind === "light" ? l : g`${this.numeric("fov", "Horizontal view (°)", 1, 170)}${this.numeric("vertical_fov", "Vertical view (°)", 1, 170)}${this.numeric("range", "Range (m; 0 = hidden)", 0, 100)}`}
        </div><p class="muted">Coverage is approximate; walls do not clip it. The top-down sector illustrates horizontal coverage; use 3D to inspect tilt.</p>
        <label>Personal model name<input id="profile-name" maxlength="100" .value=${this.profileName} @input=${(e) => {
			this.profileName = e.target.value;
		}}></label>
        <button id="save-profile" type="button" @click=${() => this.saveProfile()}>${this.config.sensor_profiles?.some((e) => e.id === this.profile) ? "Update" : "Save"} personal model profile</button></details>
        <button id="save-fixture" type="button" @click=${() => this.save()}>${this.original ? "Update" : "Add"} placement to draft</button>
        ${this.original ? g`<button type="button" @click=${() => this.removeFixture()}>Remove placement</button>` : l}
        <button type="button" @click=${() => {
			this.preview3d = !this.preview3d;
		}}>${this.preview3d ? "Hide" : "Show"} 3D preview</button>
        ${this.preview3d ? g`<al-floorplan-viewer .config=${{ groups: s.groups }} .room=${this.room} .hass=${this.hass}></al-floorplan-viewer>` : l}
      ` : l}` : g`<p class="muted">Choose a room with floorplan dimensions first.</p>`}
      <p class="status" role="status">${this.notice}</p>${this.error ? g`<p class="error" role="alert">${this.error}</p>` : l}
      <details><summary>Personal profiles · import / export</summary><p class="muted">Copy profiles between installations or contribute them to the bundled community catalog. Placement coordinates, linked entity ids and aiming angles are excluded. Import updates matching profile ids in the draft.</p>
        <textarea aria-label="Profile JSON" .value=${this.profileText} @input=${(e) => {
			this.profileText = e.target.value;
		}}></textarea>
        <button type="button" @click=${() => {
			this.profileText = JSON.stringify(is(JSON.stringify(this.config?.sensor_profiles ?? [])), null, 2);
		}}>Export personal profiles</button>
        <button type="button" @click=${() => this.importProfiles()}>Import profiles to draft</button>
      </details>
    </fieldset>`;
	}
};
b([a({ attribute: !1 })], Q.prototype, "config", void 0), b([a({ attribute: !1 })], Q.prototype, "hass", void 0), b([a({ attribute: !1 })], Q.prototype, "live", void 0), b([a({ type: Boolean })], Q.prototype, "disabled", void 0), b([_()], Q.prototype, "room", void 0), b([_()], Q.prototype, "fixture", void 0), b([_()], Q.prototype, "original", void 0), b([_()], Q.prototype, "mode", void 0), b([_()], Q.prototype, "error", void 0), b([_()], Q.prototype, "notice", void 0), b([_()], Q.prototype, "registry", void 0), b([_()], Q.prototype, "registryError", void 0), b([_()], Q.prototype, "loading", void 0), b([_()], Q.prototype, "search", void 0), b([_()], Q.prototype, "profile", void 0), b([_()], Q.prototype, "profileName", void 0), b([_()], Q.prototype, "profileText", void 0), b([_()], Q.prototype, "preview3d", void 0), Q = b([T("al-room-device-editor")], Q);
//#endregion
//#region src/al-floorplans.ts
var $ = class extends v {
	constructor(...e) {
		super(...e), this.live = null, this.disabled = !1, this.lights = {}, this.settings = {}, this.error = "", this.preferenceError = "", this.entry = "";
	}
	static {
		this.styles = n`
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
		let e = He(this.hass);
		this.source === e && this.unsubscribe || (this.unsubscribe?.(), this.source = e, this.unsubscribe = e.subscribe(({ data: e, error: t }) => {
			if (this.error = t ?? "", e && (this.lights = e.lights, this.telemetry = e.telemetry, this.entry !== e.entry_id)) {
				this.entry = e.entry_id;
				try {
					let e = localStorage.getItem(`al-floorplan:${this.entry}`);
					this.settings = e ? JSON.parse(e) : {}, ke(this.settings);
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
		if (!this.config) return l;
		let e = f(this.config).some(({ group: e }) => e.bounds || e.points);
		return g`
      ${this.error || this.preferenceError ? g`<p role="status">${this.error || this.preferenceError}</p>` : l}
      <al-floorplan-viewer .config=${this.config} .live=${this.live} .hass=${this.hass} .lights=${this.lights}
        .telemetry=${this.error ? void 0 : this.telemetry} .settings=${this.settings} @al-viewer-settings=${this.saveSettings}></al-floorplan-viewer>
      <details><summary>Room devices</summary><al-room-device-editor .live=${this.live} .config=${this.config} .hass=${this.hass} .disabled=${this.disabled}></al-room-device-editor></details>
      <details><summary>Property layout</summary><al-property-layout .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-property-layout></details>
      <details .open=${!e}><summary>Import or update floorplan</summary>
        <al-floorplan-import .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-floorplan-import>
      </details>`;
	}
};
b([a({ attribute: !1 })], $.prototype, "hass", void 0), b([a({ attribute: !1 })], $.prototype, "config", void 0), b([a({ attribute: !1 })], $.prototype, "live", void 0), b([a({ type: Boolean })], $.prototype, "disabled", void 0), b([_()], $.prototype, "telemetry", void 0), b([_()], $.prototype, "lights", void 0), b([_()], $.prototype, "settings", void 0), b([_()], $.prototype, "error", void 0), b([_()], $.prototype, "preferenceError", void 0), $ = b([T("al-floorplans")], $);
//#endregion
