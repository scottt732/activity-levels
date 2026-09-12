import { $ as e, A as t, B as n, C as r, Ct as i, D as a, Dt as o, E as s, Et as c, F as l, G as u, H as d, I as f, J as p, K as m, L as h, M as ee, N as te, O as g, Ot as _, P as ne, Q as re, R as ie, S as ae, St as v, T as oe, Tt as se, U as ce, V as le, W as ue, X as de, Y as y, Z as fe, _ as pe, _t as me, at as he, b as ge, bt as b, c as _e, ct as ve, d as x, dt as ye, et as S, f as be, ft as xe, g as Se, gt as Ce, h as we, ht as Te, i as Ee, it as De, j as Oe, k as C, l as ke, lt as Ae, m as je, mt as Me, nt as Ne, ot as Pe, p as Fe, pt as Ie, q as Le, rt as Re, s as ze, st as Be, t as Ve, tt as He, u as w, ut as Ue, v as We, vt as Ge, w as Ke, wt as T, x as qe, xt as E, y as D, yt as Je, z as Ye } from "./shared-BKp_4Zk3.js";
//#region src/entities.ts
var Xe = (e) => `switch.${e}_presence_simulation`, Ze = (e) => `sensor.${e}_expected_activity`, Qe = (e) => `sensor.${e}_activity_anomaly`, $e = [
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
], et = ["ha-yaml-editor", "ha-state-icon"], tt = 2500, nt = 8e3;
function rt(e) {
	let t;
	return {
		promise: new Promise((n) => {
			t = setTimeout(n, e);
		}),
		cancel: () => clearTimeout(t)
	};
}
async function it(e, t, n) {
	let r = rt(t);
	try {
		return await Promise.race([e, r.promise.then(() => n)]);
	} finally {
		r.cancel();
	}
}
async function at() {
	try {
		await ((await window.loadCardHelpers?.())?.createCardElement({
			type: "entities",
			entities: []
		}))?.constructor?.getConfigElement?.();
	} catch {}
}
async function ot() {
	if (customElements.get("ha-yaml-editor")) return;
	let e;
	try {
		await customElements.whenDefined("ha-selector"), e = document.createElement("ha-selector"), e.selector = { object: {} }, e.style.display = "none", document.body.appendChild(e), await customElements.whenDefined("ha-yaml-editor");
	} catch {} finally {
		e?.remove();
	}
}
async function st(e = nt, t = tt) {
	let n = [...$e, ...et];
	if (n.every((e) => customElements.get(e))) return {
		ok: !0,
		missing: [],
		optionalMissing: []
	};
	await it(Promise.all([at(), ot()]).then(() => void 0), t, void 0);
	let r = await Promise.all(n.map((t) => it(customElements.whenDefined(t).then(() => !0), e, !1))), i = n.filter((e, t) => !r[t]), a = et, o = i.filter((e) => !a.includes(e));
	return {
		ok: o.length === 0,
		missing: o,
		optionalMissing: i.filter((e) => a.includes(e))
	};
}
//#endregion
//#region src/navigation.ts
var ct = "activity_levels.mixer.expanded", lt = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]), ut = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function dt(e) {
	return {
		expanded: new Set(e.groups.map((e) => e.id)),
		selection: ut(e)
	};
}
function ft(e, t) {
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
function pt(e, t) {
	let n = ft(e, t), r = [], i = [], a = [], o = [], s = 0, c = (e) => {
		for (; o.length > 0 && o[o.length - 1].depth >= e;) o.pop().band.colEnd = i.length + 1;
	};
	for (let t of n) {
		if (c(t.depth), i.push("strip"), r.push(i.length), !t.hasChildren) continue;
		let n = D(e, t.path)?.name ?? t.id, l = {
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
function mt(e, t) {
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
			let n = ft(t.config, e);
			if (n.length === 0) return e;
			let r = e.selection, i = r === null ? -1 : n.findIndex((e) => lt(e.path, r)), a = (((i === -1 && t.delta < 0 ? n.length : i) + t.delta) % n.length + n.length) % n.length;
			return {
				...e,
				selection: n[a].path
			};
		}
		case "home":
		case "end": {
			let n = ft(t.config, e);
			return n.length === 0 ? e : {
				...e,
				selection: (t.type === "home" ? n[0] : n[n.length - 1]).path
			};
		}
		case "sync": {
			let { config: n } = t, r = we(n), i = [...e.expanded].filter((e) => r.has(e));
			return {
				expanded: i.length === e.expanded.size ? e.expanded : new Set(i),
				selection: e.selection !== null && d(n, e.selection) !== void 0 ? e.selection : ut(n)
			};
		}
	}
}
function ht(e, t, n) {
	if (n === null) return t;
	let r = n[n.length - 2] === "stimuli" ? n.slice(0, -2) : n, i = new Set(t), a = !1;
	for (let t = 2; t + 2 <= r.length; t += 2) {
		let n = d(e, r.slice(0, t));
		if (n === void 0 || typeof n.id != "string") break;
		i.has(n.id) || (i.add(n.id), a = !0);
	}
	return a ? i : t;
}
function gt(e) {
	let t;
	try {
		t = localStorage.getItem(ct);
	} catch {
		return null;
	}
	if (t === null) return null;
	try {
		let n = JSON.parse(t);
		if (!Array.isArray(n)) return null;
		let r = we(e);
		return new Set(n.filter((e) => typeof e == "string" && r.has(e)));
	} catch {
		return null;
	}
}
function _t(e) {
	try {
		localStorage.setItem(ct, JSON.stringify([...e]));
	} catch {}
}
function vt(e) {
	let t = dt(e), n = gt(e);
	return n === null ? t : {
		...t,
		expanded: n
	};
}
var yt = "activity_levels.mixer.edit";
function bt() {
	try {
		return localStorage.getItem(yt) === "true";
	} catch {
		return !1;
	}
}
function xt(e) {
	try {
		localStorage.setItem(yt, e ? "true" : "false");
	} catch {}
}
//#endregion
//#region src/save-flow.ts
async function St(e, t) {
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
var Ct = {
	"24h": 86400,
	"7d": 604800,
	"30d": 2592e3
}, wt = {
	off: 0,
	"24h": 86400,
	"7d": 604800
};
function Tt(e, t, n) {
	return {
		start: e - Ct[t],
		end: e,
		resolution: t === "24h" ? "5m" : "1h",
		forecastUntil: n === "off" ? void 0 : e + wt[n]
	};
}
function Et(e, t, n) {
	let r = t - e || 1;
	return (t) => (t - e) / r * n;
}
function Dt(e, t, n = 4) {
	let r = e || 1, i = t - 2 * n;
	return (e) => t - n - e / r * i;
}
function Ot(e, t) {
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
function kt(e, t, n) {
	return e.length === 0 ? "" : e.map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ");
}
function At(e, t, n, r = Infinity) {
	if (e.p75.length === 0) return "";
	let i = (t) => t.map((t, n) => [e.t0 + n * e.step, t]), a = Ot(i(e.p75), r), o = Ot(i(e.p25), r).reverse();
	return `${[...a, ...o].map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ")} Z`;
}
function jt(e, t) {
	return e[t].map((t, n) => [e.t0 + n * e.step, t]);
}
function Mt(e, t, n, r, i) {
	let a = e[e.length - 1];
	return !a || t <= a[0] || t < r || t > i ? [] : [a, [t, n]];
}
function Nt(e, t, n) {
	return e.map(([e, r, i]) => ({
		x0: t(e),
		x1: t(r ?? n),
		tag: i
	}));
}
function Pt(e, t) {
	if (e.length === 0) return -1;
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i][0] < t ? n = i + 1 : r = i;
	}
	return n > 0 && Math.abs(e[n - 1][0] - t) <= Math.abs(e[n][0] - t) ? n - 1 : n;
}
function Ft(e) {
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
function It(e, t) {
	let n = Math.min(2592e3, Math.max(3600, e.end - e.start)), r = Math.min(t + 604800, e.start + n);
	return {
		start: r - n,
		end: r
	};
}
function Lt(e, t, n, r) {
	let i = e.end - e.start, a = Math.min(2592e3, Math.max(3600, i * n)), o = t - (t - e.start) / i * a;
	return It({
		start: o,
		end: o + a
	}, r);
}
function Rt(e, t, n = Infinity) {
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
function zt(e, t, n, r, i = 450) {
	if (n > r) {
		let t = e.forecast;
		if (!t || t.step <= 0) return null;
		let r = Rt(jt(t, "p50"), n);
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
var Bt = class {
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
		let { start: i, end: a, until: o } = Vt(t, n, r), s = {}, c = !0;
		for (let l of e) {
			let e = this.cache.get(JSON.stringify([
				l,
				i,
				a,
				o,
				r
			]));
			!e || Date.now() - e.at > 6e4 ? (c = !1, s[l] = null) : s[l] = zt(e.data, l, t, n, r === "5m" ? 450 : 5400);
		}
		return {
			values: s,
			complete: c
		};
	}
	async load(e, t, n, r, i = "5m") {
		let a = ++this.generation, o = {}, s = !1, { start: c, end: l, until: u } = Vt(n, r, i), d = 0;
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
							data: await Ue(e, {
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
				o[f] = zt(m.data, f, n, r, i === "5m" ? 450 : 5400);
			}
		})), {
			values: o,
			failed: s
		};
	}
};
function Vt(e, t, n) {
	let r = e > t, i = Math.floor(e / 3600) * 3600, a = Math.floor(t / 60) * 60, o = n === "5m" ? 300 : 3600, s = r ? a : Math.min(i + 3600 + o, a);
	return {
		start: r ? s - o : i - o,
		end: s,
		...r ? { until: Math.min(i + 3900, s + 604800) } : {}
	};
}
//#endregion
//#region src/activity-levels-panel.ts
var Ht = [
	"mixer",
	"groups",
	"envelopes",
	"defaults",
	"patterns",
	"presence",
	"paths",
	"floorplans",
	"code"
], Ut = 2e3, Wt = 1e4, Gt = 3e5, Kt = 1500, qt = "activity_levels.timeline", Jt = [
	"24h",
	"7d",
	"30d"
], Yt = [
	"off",
	"24h",
	"7d"
], Xt = {
	range: "7d",
	horizon: "24h",
	showChannels: !0,
	showLights: !0
};
function Zt(e) {
	if (e === null) return null;
	let t = JSON.parse(e);
	return !Jt.includes(t.range) || !Yt.includes(t.horizon) ? null : {
		range: t.range,
		horizon: t.horizon,
		showChannels: t.showChannels !== !1,
		showLights: t.showLights !== !1
	};
}
var O = class extends i {
	constructor(...e) {
		super(...e), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = Xt, this.preview = null, this.previewError = !1, this.previewData = new Bt(), this.previewSeq = 0, this.transportWindow = null, this.onTransport = (e) => {
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
			let t = mt(this.nav, e.detail);
			t.expanded !== this.nav.expanded && _t(t.expanded), this.nav = t, this.selection = t.selection, this.preview && this.onTransport(new CustomEvent("al-transport", { detail: {
				time: this.preview.time,
				window: this.transportWindow
			} }));
		}, this.onLiveRefresh = () => {
			this.pollLive();
		}, this.onRebuild = async (e) => {
			try {
				let { rebuilt: t } = await Me(this.hass, e.detail?.force === !0);
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
				await Re(this.hass, "switch", n ? "turn_on" : "turn_off", { entity_id: Xe(t) });
			} catch (e) {
				this.banner = {
					kind: "error",
					text: `Could not ${n ? "start" : "stop"} the simulation for ${t}: ${e.message}`
				};
			}
		}, this.onTimelineRange = (e) => {
			this.timeline = e.detail;
			try {
				localStorage.setItem(qt, JSON.stringify(e.detail));
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
		this.styles = [x];
	}
	get previewResolution() {
		let e = Math.min(this.live?.now ?? Date.now() / 1e3, this.transportWindow?.end ?? Infinity);
		return (this.transportWindow ? e - Math.min(this.transportWindow.start, e - 3600) : this.timeline.range === "24h" ? 86400 : 604800) <= 86400 ? "5m" : "1h";
	}
	previewIds(e, t) {
		let n = this.draft?.config;
		if (!n) return [];
		let r = ft(n, this.nav).map((e) => e.id);
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
			for (let i of r) t[i.id] = this.live?.groups[i.id]?.precision ?? pe(e, i), n(i.children);
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
		return Ht;
	}
	async connectedCallback() {
		super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
		let { ok: e, missing: t, optionalMissing: n } = await st();
		this.missing = e ? [] : t, this.yamlEditor = !n.includes("ha-yaml-editor"), await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer(), clearTimeout(this.previewTimer), this.previewTimer = void 0, this.previewSeq++, this.previewData.cancel();
	}
	async load() {
		try {
			let { config: e, inferred: t, warnings: n } = await he(this.hass);
			this.draft = new le(e), this.inferred = t, this.warnings = n, this.syncTabs(), this.nav = vt(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
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
		let t = this.selection, n = mt({
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
		let n = ht(t, this.nav.expanded, e);
		n !== this.nav.expanded && _t(n), this.nav = {
			expanded: n,
			selection: e
		};
	}
	async save() {
		let e = this.draft;
		if (!(!e || this.busy || this.blocked)) {
			this.busy = !0, this.updatePolling();
			try {
				let t = await St(e.config, {
					validate: (e) => Je(this.hass, e),
					save: (e) => Ce(this.hass, e)
				});
				t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((e) => setTimeout(e, Kt)), await this.load());
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
		this.liveTimer === void 0 && (this.pollLive(), this.liveTimer = window.setInterval(() => void this.pollLive(), Ut));
	}
	updateSimPolling(e) {
		if (!(this.patternsVisible && e)) {
			this.clearSimTimer();
			return;
		}
		this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => void this.pollSim(), Wt));
	}
	async pollLive() {
		let e = ++this.liveSeq;
		try {
			let t = await Ae(this.hass);
			e === this.liveSeq && (this.live = t);
		} catch {}
	}
	async pollSim() {
		try {
			this.simLog = await ve(this.hass);
		} catch {}
	}
	clearLiveTimer() {
		this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
	}
	clearSimTimer() {
		this.simTimer !== void 0 && (clearInterval(this.simTimer), this.simTimer = void 0);
	}
	async refreshProfile(e = !1) {
		if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < Gt)) try {
			this.profileState = await Be(this.hass), this.profileAt = Date.now();
		} catch {}
	}
	restoreTimeline() {
		try {
			this.timeline = Zt(localStorage.getItem(qt)) ?? Xt;
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
          <ha-button .disabled=${!e?.dirty || this.busy || this.blocked} @click=${this.save}
            >${e?.dirty ? "Save" : "Saved"}</ha-button
          >
        </div>
        ${this.renderBanner()} ${this.renderInferred()} ${this.renderWarnings()}
        <div class="tabs" role="tablist" aria-label="Sections" @keydown=${this.onTabsKeydown}>
          ${this.tabs.map((e, t) => c`<button
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
          ${e ? this.renderTab(e) : c`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
	}
	renderLiveToggle() {
		return this.liveRequired ? T : c`
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
		let e = this.banner;
		return e ? c`<ha-alert
      alert-type=${e.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
			this.banner = null;
		}}
      >${e.text}</ha-alert
    >` : T;
	}
	renderInferred() {
		let e = this.inferred.length;
		return e === 0 ? T : c`<ha-alert class="inferred-notice" alert-type="warning">
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
		return this.warnings.length === 0 ? T : c`<ha-alert class="config-warnings" alert-type="warning">
      <ul>
        ${this.warnings.map((e) => c`<li>${e}</li>`)}
      </ul>
    </ha-alert>`;
	}
	renderTab(e) {
		switch (this.tab) {
			case "mixer": return this.renderMixer(e);
			case "groups": return c`<div class="layout ${this.narrow ? "narrow" : ""}">
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
			case "envelopes": return c`<al-envelopes
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
			case "defaults": return c`<al-defaults
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
			case "patterns": return c`<al-patterns
          .hass=${this.hass}
          .config=${e.config}
          .profileState=${this.profileState}
          .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild}
        ></al-patterns>`;
			case "code": return c`<al-code
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .available=${this.yamlEditor}
          @al-change=${this.onChange}
          @al-code-status=${this.onCodeStatus}
        ></al-code>`;
			case "floorplans": return c`<al-floorplans .hass=${this.hass} .config=${e.config} .live=${this.live}
          .disabled=${this.busy} @al-change=${this.onChange} @al-open-group=${this.openMixerGroup}></al-floorplans>`;
			case "paths": return c`<al-paths .hass=${this.hass} .config=${e.config} .narrow=${this.narrow}></al-paths>`;
			case "presence": return c`<al-presence
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
		let n = this.nav.selection, r = n === null ? void 0 : D(t, ge(n));
		return c`<div class="rows">
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
      ${this.previewError ? c`<ha-alert alert-type="warning">Some preview data could not be loaded. Missing values are shown as —.</ha-alert>` : T}
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
		return c`<div class="rows">
      <ha-card class="mixer-empty">
        <p class="muted">Add your first group in Groups.</p>
        <ha-button @click=${() => this.selectTab(this.tabs.indexOf("groups"))}>Go to Groups</ha-button>
      </ha-card>
    </div>`;
	}
	renderEditor(e) {
		let t = this.selection;
		return t ? t[t.length - 2] === "stimuli" ? c`<al-stimulus-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>` : c`<div><al-group-editor
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
        </div>` : c`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
	}
};
w([E({ attribute: !1 })], O.prototype, "hass", void 0), w([E({ type: Boolean })], O.prototype, "narrow", void 0), w([b()], O.prototype, "draft", void 0), w([b()], O.prototype, "inferred", void 0), w([b()], O.prototype, "warnings", void 0), w([b()], O.prototype, "tab", void 0), w([b()], O.prototype, "selection", void 0), w([b()], O.prototype, "nav", void 0), w([b()], O.prototype, "errors", void 0), w([b()], O.prototype, "banner", void 0), w([b()], O.prototype, "live", void 0), w([b()], O.prototype, "liveOn", void 0), w([b()], O.prototype, "busy", void 0), w([b()], O.prototype, "missing", void 0), w([b()], O.prototype, "profileState", void 0), w([b()], O.prototype, "simLog", void 0), w([b()], O.prototype, "timeline", void 0), w([b()], O.prototype, "preview", void 0), w([b()], O.prototype, "previewError", void 0), w([b()], O.prototype, "codeStatus", void 0), w([b()], O.prototype, "yamlEditor", void 0), w([b()], O.prototype, "tabFocus", void 0), O = w([v("activity-levels-panel")], O);
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
function Qt(e) {
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
var j = ["on", "off"], $t = {
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
}, en = (e) => e.split(".")[0] ?? "", tn = (e) => {
	let t = e.replace(/_/g, " ");
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function nn(e, t, n) {
	let r = en(t), i = e?.states[t]?.attributes.device_class, a = [typeof i == "string" ? `component.${r}.entity_component.${i}.state.${n}` : null, `component.${r}.entity_component._.state.${n}`];
	if (typeof e?.localize == "function") for (let t of a) {
		if (t === null) continue;
		let n = e.localize(t);
		if (typeof n == "string" && n !== "") return n;
	}
	return tn(n);
}
function rn(e, t, n) {
	let r = [...$t[en(t)] ?? []];
	for (let i of [e?.states[t]?.state, ...n]) typeof i == "string" && i !== "" && !r.includes(i) && r.push(i);
	return r.map((n) => ({
		value: n,
		label: nn(e, t, n)
	}));
}
function an(e, t) {
	let n = e?.states[t];
	if (!n) return null;
	let r = e?.formatEntityState?.(n);
	return typeof r == "string" && r !== "" ? r : nn(e, t, n.state);
}
function on(e, t, n) {
	let r = n.length === 1 ? n[0] : void 0;
	if (r === void 0) return {
		enter: "When it enters the active states",
		leave: "When it leaves them"
	};
	let i = nn(e, t, r);
	return {
		enter: `When it becomes ${i}`,
		leave: `When it stops being ${i}`
	};
}
//#endregion
//#region src/errors.ts
var M = (e) => e.join("/");
function N(e, t) {
	let n = M(t), r = {};
	for (let t of e) {
		if (!t.path.startsWith(n + "/")) continue;
		let e = t.path.slice(n.length + 1);
		e.includes("/") || (r[e] = t.message);
	}
	return r;
}
function sn(e, t) {
	let n = M(t);
	return e.filter((e) => e.path === n || e.path.startsWith(n + "/")).length;
}
//#endregion
//#region src/events.ts
function P(e, t, n) {
	let r = new CustomEvent("al-change", {
		detail: e,
		bubbles: !0,
		composed: !0
	});
	return t !== void 0 && (r.coalesceKey = t), n && (r.structural = !0), r;
}
var cn = (e, t) => new CustomEvent("al-code-status", {
	detail: {
		valid: e,
		errors: t
	},
	bubbles: !0,
	composed: !0
}), ln = (e) => new CustomEvent("al-select", {
	detail: e,
	bubbles: !0,
	composed: !0
}), un = (e, t) => new CustomEvent(e, {
	detail: t,
	bubbles: !0,
	composed: !0
}), dn = () => un("al-select-strip", null), fn = (e) => un("al-level-override", { value: e }), pn = (e) => un("al-mute-toggle", { muted: e }), mn = () => un("al-reset", null), hn = (e) => new CustomEvent("al-nav", {
	detail: e,
	bubbles: !0,
	composed: !0
}), gn = () => new CustomEvent("al-live-refresh", {
	detail: null,
	bubbles: !0,
	composed: !0
}), _n = (e) => new CustomEvent("al-timeline-range", {
	detail: e,
	bubbles: !0,
	composed: !0
}), vn = (e, t) => new CustomEvent("al-sim-toggle", {
	detail: {
		gid: e,
		on: t
	},
	bubbles: !0,
	composed: !0
}), yn = (e = !1) => new CustomEvent("al-rebuild", {
	detail: { force: e },
	bubbles: !0,
	composed: !0
}), bn = (e) => new CustomEvent("al-map-select", {
	detail: { id: e },
	bubbles: !0,
	composed: !0
});
//#endregion
//#region src/tree-rows.ts
function xn(e, t) {
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
var Sn = "activity_levels.groups_expanded";
function Cn() {
	try {
		let e = localStorage.getItem(Sn), t = e === null ? null : JSON.parse(e);
		return Array.isArray(t) ? new Set(t.filter((e) => typeof e == "string")) : /* @__PURE__ */ new Set();
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function wn(e) {
	try {
		localStorage.setItem(Sn, JSON.stringify([...e]));
	} catch {}
}
//#endregion
//#region src/al-tree.ts
var Tn = (e) => e.stopPropagation(), En = (e) => {
	(e.key === "Enter" || e.key === " ") && e.stopPropagation();
}, Dn = "mdi:flash", On = "text/plain", kn = 36, F = class extends i {
	constructor(...e) {
		super(...e), this.selection = null, this.errors = [], this.live = null, this.expanded = Cn(), this.dragging = null, this.target = null, this.menu = null;
	}
	static {
		this.styles = [x, _`
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
		this.dispatchEvent(P(e, void 0, !0));
	}
	emitSelect(e) {
		this.dispatchEvent(ln(e));
	}
	isSelected(e) {
		return this.selection !== null && M(this.selection) === M(e);
	}
	select(e, t) {
		e.stopPropagation(), this.menu = null, this.emitSelect(t);
	}
	toggle(e) {
		let t = M(e), n = new Set(this.expanded);
		n.delete(t) || n.add(t), this.expanded = n, wn(n);
	}
	open(e) {
		if (e.length === 0) return;
		let t = new Set(this.expanded).add(M(e));
		this.expanded = t, wn(t);
	}
	listOf(e) {
		return {
			list: e.slice(0, -1),
			index: e[e.length - 1]
		};
	}
	addGroup(e, t, n) {
		let r = this.config;
		r && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(ce(r, e, t, ae(ie(r, n), n))), this.emitSelect([...e, t]));
	}
	addStimulus(e, t) {
		let n = this.config;
		if (!n) return;
		this.menu = null, this.open(e);
		let r = [...e, "stimuli"];
		this.emitChange(ce(n, r, t, a(""))), this.emitSelect([...r, t]);
	}
	removeNode(e, t) {
		let n = this.config;
		if (!n || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
		this.emitChange(Le(n, e));
		let r = g(e);
		this.emitSelect(r.length ? r : null);
	}
	tryMove(e, t, n) {
		let r = this.config;
		if (!r || !ue(r, e, t, n).ok) return !1;
		let i = u(r, e, t, n);
		if (i === r) return !1;
		let { parent: a, index: o } = m(e, t, n);
		return this.open(a.slice(0, -1)), this.emitChange(i), this.emitSelect([...a, o]), !0;
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(On, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = {
			key: M(t),
			path: t
		};
	}
	onDragEnd() {
		this.dragging = null, this.target = null;
	}
	whereIn(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || kn, i = r / 3, a = e.clientY - n.top;
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
			let t = e.dataTransfer?.getData(On) ?? "", n = JSON.parse(t);
			return Array.isArray(n) ? n : null;
		} catch {
			return null;
		}
	}
	draggedPath(e) {
		return this.dragging === null ? null : e.dataTransfer?.types.includes(On) === !0 ? this.dragging.path : null;
	}
	onDragOver(e, t) {
		let n = this.config, r = this.draggedPath(e);
		if (!n || r === null) return;
		e.preventDefault();
		let i = this.whereIn(e, t), { toParent: a, index: o } = this.destination(t, i, r), s = ue(n, r, a, o);
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
				t.expanded ? this.toggle(t.path) : this.focusPath(g(t.path));
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
				let e = t.kind === "group" ? d(n, [...r, i - 1]) : void 0;
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
		return e === null || t === void 0 ? null : Qt(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
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
		if (!e) return c`<ha-card><span class="muted">Loading…</span></ha-card>`;
		if (e.groups.length === 0) return this.renderEmpty();
		let t = xn(e, this.expanded), n = this.tabbableKey(t);
		return c`
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
		return c`
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
		if (t.kind === "placeholder") return c`<div class="tree-row placeholder" role="none" style="--al-indent: ${t.depth}">
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
		return c`<div
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
      aria-expanded=${t.expandable ? t.expanded ? "true" : "false" : T}
      @click=${(e) => this.select(e, t.path)}
      @keydown=${(e) => this.onRowKeydown(e, t)}
      @dragstart=${(e) => this.onDragStart(e, t.path)}
      @dragend=${this.onDragEnd}
      @dragover=${(e) => this.onDragOver(e, t)}
      @drop=${(e) => this.onDrop(e, t)}
    >
      <span class="guides"></span>
      ${t.expandable ? c`<ha-icon-button
            class="caret"
            label=${t.expanded ? "Collapse" : "Expand"}
            title=${t.expanded ? "Collapse" : "Expand"}
            @keydown=${En}
            @click=${(e) => {
			e.stopPropagation(), this.toggle(t.path);
		}}
          >
            <ha-icon icon=${t.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </ha-icon-button>` : c`<span class="caret"></span>`}
      ${this.renderIcon(t)}
      <button
        type="button"
        class="label"
        title=${t.kind === "stimulus" ? t.stimulus?.entity ?? "" : "Edit this group"}
        @keydown=${En}
        @click=${(e) => this.select(e, t.path)}
      >
        ${this.labelFor(t)}
      </button>
      ${i !== null && !i.verdict.ok ? c`<span class="hint">${i.verdict.reason}</span>` : this.renderRowStatus(e, t)}
      ${this.renderActions(t)} ${this.menu === r ? this.renderAddMenu(t) : T}
    </div>`;
	}
	renderIcon(e) {
		if (e.kind === "group" && e.group) return c`<ha-icon icon=${S[e.group.kind].icon}></ha-icon>`;
		let t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
		return t ? c`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : c`<ha-icon icon=${Dn}></ha-icon>`;
	}
	renderRowStatus(e, t) {
		let n = sn(this.errors, t.path), r = n ? c`<span class="badge" title="${n} problem(s) in this group">${n}</span>` : T;
		if (t.kind === "stimulus") {
			let n = t.stimulus, i = n === void 0 ? null : an(this.hass, n.entity), a = d(e, g(t.path)), o = a === void 0 ? void 0 : this.live?.voices[a.id]?.find((e) => e.label === (n?.key ?? n?.entity));
			return c`${r}${i === null ? T : c`<span class="muted chip">${i}</span>`}
      ${o ? c`<span class="chip phase ${o.phase}" title=${this.voiceTitle(o)}>${o.phase}</span>
            <span class="muted chip">${o.value.toFixed(2)}</span>` : T}`;
		}
		let i = t.group, a = i === void 0 ? void 0 : this.live?.groups[i.id], o = a?.max_value ?? i?.max_value ?? e.defaults.max_value, s = a ? Math.max(0, Math.min(100, a.value / (o || 1) * 100)) : 0;
		return c`${r}
    ${a ? c`<div class="meter" title=${this.meterTitle(a, o, t.depth === 0)}>
            <div style="width: ${s}%"></div>
          </div>
          <span class="dot ${a.gated ? "gated" : ""}" title=${a.gated ? "Gate open" : "Gate closed"}></span>` : T}`;
	}
	renderActions(e) {
		let t = e.path;
		if (e.kind === "stimulus") return c`<div class="actions" @click=${Tn} @keydown=${En}>
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
		return n === void 0 ? c`<div class="actions"></div>` : c`<div class="actions" @click=${Tn} @keydown=${En}>
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
        .disabled=${Ne(n.kind).length === 0}
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
		return t === void 0 ? c`${T}` : c`<div
      class="add-menu"
      role="menu"
      draggable="false"
      @click=${Tn}
      @keydown=${En}
      @dragstart=${Tn}
    >
      ${Ne(t.kind).map((n) => c`<button
          type="button"
          role="menuitem"
          data-kind=${n}
          @click=${() => this.addGroup([...e.path, "children"], t.children.length, n)}
        >
          <ha-icon icon=${S[n].icon}></ha-icon>
          <span>
            <strong>${S[n].label}</strong>
            <div class="muted">${S[n].definition}</div>
          </span>
        </button>`)}
    </div>`;
	}
};
w([E({ attribute: !1 })], F.prototype, "hass", void 0), w([E({ attribute: !1 })], F.prototype, "config", void 0), w([E({ attribute: !1 })], F.prototype, "selection", void 0), w([E({ attribute: !1 })], F.prototype, "errors", void 0), w([E({ attribute: !1 })], F.prototype, "live", void 0), w([b()], F.prototype, "expanded", void 0), w([b()], F.prototype, "dragging", void 0), w([b()], F.prototype, "target", void 0), w([b()], F.prototype, "menu", void 0), F = w([v("al-tree")], F);
//#endregion
//#region src/ha-links.ts
function An(e, t, n) {
	return t ? c`<a href=${`/config/${e === "device" ? "devices" : "areas"}/${e}/${encodeURIComponent(t)}`}>${n}</a>` : n;
}
function jn(e, t, n, r = "Open entity", i, a = "Open device", o = !1) {
	let s = n && (t?.states?.[n] || t?.entities?.[n]), l = i ?? (n ? t?.entities?.[n]?.device_id : null), u = () => e.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: n },
		bubbles: !0,
		composed: !0
	}));
	return c`${s ? o ? c`<button type="button" @click=${u}>${r}</button>` : c`<ha-button @click=${u}>${r}</ha-button>` : T}
    ${l ? An("device", l, a) : T}`;
}
//#endregion
//#region src/convert.ts
var Mn = (e) => e == null || e === "" ? null : e;
function Nn(e, t) {
	if (t != null) switch (e) {
		case "duration": return k(t);
		case "boolean": return t ? "true" : "false";
		default: return t;
	}
}
function Pn(e, t) {
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
function Fn(e, t) {
	if (t == null) return "unset";
	switch (e) {
		case "duration": return Qt(t);
		case "boolean": return t ? "Yes" : "No";
		case "multiplier": return In(t);
		default: return String(t);
	}
}
var In = (e) => `${e.toFixed(1)}×`, Ln = [
	"kind",
	"floor_id",
	"area_id",
	"id",
	"name"
], Rn = [
	"mix",
	"null_handling",
	"gain"
], zn = {
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
}, Bn = {
	id: "Identifies the group and its entities. Changing it re-creates them.",
	name: "Friendly name; falls back to the area's name, then to the id.",
	kind: "What this is on the property. It decides what can go inside it.",
	floor_id: "Bind this to a Home Assistant floor to reuse its name.",
	area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
	mix: "How stimuli and child groups combine into this group's value.",
	null_handling: "Whether idle contributors count as zero or drop out of the mean.",
	gain: "Scales this group's contribution to its parent."
}, Vn = (e) => zn[e.name] ?? e.name, Hn = (e) => Bn[e.name] ?? "", Un = [
	"id",
	"name",
	"kind",
	"floor_id",
	"area_id",
	"mix",
	"null_handling",
	"gain"
], Wn = [
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
], Gn = [{
	value: "zero",
	label: "Idle counts as 0"
}, {
	value: "ignore",
	label: "Ignore idle"
}], Kn = "How this group's stimuli and children combine into one level.", qn = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", Jn = "How loudly 'somebody is here' plays in this group's mix.", Yn = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, Xn = { select: {
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
} }, Zn = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, Qn = (e, t, n) => {
	switch (e) {
		case "null_handling": return t.mix === "mean";
		case "gain": return !n;
		case "floor_id": return t.kind === "floor";
		case "area_id": return He.has(t.kind);
		default: return !0;
	}
}, $n = (e, t) => {
	let n = [...Ne(t)];
	return n.includes(e.kind) || n.push(e.kind), { select: {
		mode: "dropdown",
		options: n.map((e) => ({
			value: e,
			label: S[e].label
		}))
	} };
};
function er(e, t, n, r, i = null) {
	let a = {
		id: { text: {} },
		name: { text: {} },
		kind: $n(e, i),
		floor_id: { floor: {} },
		area_id: { area: {} },
		mix: { select: {
			mode: "dropdown",
			options: Wn
		} },
		null_handling: { select: {
			mode: "dropdown",
			options: Gn
		} },
		gain: Zn
	};
	return n.filter((n) => Qn(n, e, t)).map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function tr(e, t, n, r) {
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
	return Object.fromEntries(n.filter((n) => Qn(n, e, t) && (n !== "area_id" || e.area_id !== null) && (n !== "floor_id" || e.floor_id !== null)).map((e) => [e, i[e]]));
}
function nr(e, t) {
	let n = { ...e };
	return "id" in t && (n.id = String(t.id ?? "")), "name" in t && (n.name = Mn(t.name)), "kind" in t && typeof t.kind == "string" && (n.kind = t.kind), "floor_id" in t && (n.floor_id = Mn(t.floor_id)), "area_id" in t && (n.area_id = Mn(t.area_id)), "mix" in t && (n.mix = t.mix ?? e.mix), "null_handling" in t && (n.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), n;
}
var rr = (e, t) => Un.find((n) => e[n] !== t[n]), ir = (e) => e.id === "" || RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function ar(e, t, n, r, i) {
	let a = {
		...e,
		[t]: n
	};
	return n === null ? a : (ir(e) && (a.id = i ? ie(i, n) : f(n)), e.name === null && r !== null && (a.name = r), a);
}
var or = (e, t, n, r) => ar(e, "area_id", t, n, r), sr = (e, t, n, r) => ar(e, "floor_id", t, n, r), cr = "activity_levels.panels";
function lr() {
	try {
		let e = localStorage.getItem(cr), t = e === null ? null : JSON.parse(e);
		return typeof t != "object" || !t || Array.isArray(t) ? {} : t;
	} catch {
		return {};
	}
}
function ur(e, t) {
	let n = lr()[e];
	return typeof n == "boolean" ? n : t;
}
function dr(e, t) {
	try {
		localStorage.setItem(cr, JSON.stringify({
			...lr(),
			[e]: t
		}));
	} catch {}
}
//#endregion
//#region src/panels.ts
function fr(e, t, n, r, i, a, o = T) {
	let s = `${e}:${t}`;
	return c`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${t}
    ?expanded=${ur(s, i)}
    @expanded-changed=${(e) => {
		dr(s, e.detail.expanded);
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
var pr = class extends i {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [x, _`
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
		return this.config && this.path ? D(this.config, this.path) : void 0;
	}
	get edges() {
		return (this.group?.adjacent ?? []).map((e) => ({
			id: je(e),
			connection: Fe(e),
			one_way: qe(e)
		}));
	}
	emit(e) {
		let { config: t, path: n } = this;
		!t || !n || this.dispatchEvent(P(y(t, [...n, "adjacent"], e), void 0, !0));
	}
	edit(e, t) {
		this.emit(this.edges.map((n, r) => r === e ? {
			...n,
			...t
		} : n));
	}
	nameOf(e) {
		return (this.config ? n(this.config).find(({ group: t }) => t.id === e) : void 0)?.group.name ?? e;
	}
	candidates() {
		let e = this.group;
		if (!this.config || !e) return [];
		let t = /* @__PURE__ */ new Set([
			e.id,
			...this.edges.map((e) => e.id),
			...Se(this.config, e.id).map((e) => e.group.id)
		]);
		return n(this.config).map(({ group: e }) => e).filter((e) => He.has(e.kind) && !t.has(e.id));
	}
	errorFor(e) {
		let t = `${(this.path ?? []).join("/")}/adjacent/${e}`;
		return this.errors.find((e) => e.path === t || e.path.startsWith(`${t}/`))?.message;
	}
	render() {
		let e = this.group;
		if (!this.config || !e) return T;
		let t = Se(this.config, e.id), n = this.candidates();
		return c`
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
          ${this.edges.length === 0 && t.length === 0 ? c`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>` : T}
        </tbody>
      </table>
      ${n.length === 0 ? T : c`<select
            class="add-edge"
            aria-label="Add an adjacent group"
            .value=${""}
            @change=${(e) => {
			let t = e.target;
			t.value !== "" && (this.emit([...this.edges, {
				id: t.value,
				connection: re,
				one_way: !1
			}]), t.value = "");
		}}
          >
            <option value="">Add an adjacent group…</option>
            ${n.map((e) => c`<option value=${e.id}>${e.name ?? e.id}</option>`)}
          </select>`}
    `;
	}
	renderOwn(e, t) {
		let n = this.errorFor(t), r = this.nameOf(e.id);
		return c`<tr class="own" data-id=${e.id}>
      <td>${r} ${n ? c`<div class="muted error">${n}</div>` : T}</td>
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${r}"
          .value=${e.connection}
          @change=${(e) => this.edit(t, { connection: e.target.value })}
        >
          ${de.map((t) => c`<option value=${t} ?selected=${t === e.connection}>${fe[t]}</option>`)}
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
		return c`<tr class="declared" data-id=${e.id}>
      <td><span class="muted">declared on</span> ${n}</td>
      <td>${fe[t.connection]}</td>
      <td>${t.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
	}
};
w([E({ attribute: !1 })], pr.prototype, "config", void 0), w([E({ attribute: !1 })], pr.prototype, "path", void 0), w([E({ attribute: !1 })], pr.prototype, "errors", void 0), pr = w([v("al-adjacency-table")], pr);
//#endregion
//#region src/al-override-field.ts
var mr = { select: {
	mode: "dropdown",
	options: [{
		value: "true",
		label: "Yes"
	}, {
		value: "false",
		label: "No"
	}]
} };
function hr(e, t) {
	return e.select?.options?.find((e) => e.value === t)?.label;
}
var I = class extends i {
	constructor(...e) {
		super(...e), this.label = "", this.selector = { text: {} }, this.value = null, this.inherited = null, this.inheritedFrom = "defaults", this.hint = "", this.kind = "number", this.disabled = !1;
	}
	static {
		this.styles = [x, _`
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
		e.stopPropagation(), this.emit(Pn(this.kind, e.detail?.value));
	}
	onReset() {
		this.emit(null);
	}
	describeInherited() {
		let e = this.inherited;
		if (this.kind === "select" && e != null) {
			let t = hr(this.selector, String(e));
			if (t !== void 0) return t;
		}
		return Fn(this.kind, e);
	}
	render() {
		let e = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`, t = this.hint === "" ? e : `${this.hint} ${e}`;
		return c`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? mr : this.selector}
          .label=${this.label}
          .required=${!1}
          .disabled=${this.disabled}
          .value=${Nn(this.kind, this.value)}
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
      ${this.error ? c`<div class="muted error msg">${this.error}</div>` : T}
    `;
	}
};
w([E({ attribute: !1 })], I.prototype, "hass", void 0), w([E()], I.prototype, "label", void 0), w([E({ attribute: !1 })], I.prototype, "selector", void 0), w([E({ attribute: !1 })], I.prototype, "value", void 0), w([E({ attribute: !1 })], I.prototype, "inherited", void 0), w([E({ attribute: "inherited-from" })], I.prototype, "inheritedFrom", void 0), w([E()], I.prototype, "hint", void 0), w([E()], I.prototype, "kind", void 0), w([E()], I.prototype, "error", void 0), w([E({ type: Boolean })], I.prototype, "disabled", void 0), I = w([v("al-override-field")], I);
//#endregion
//#region src/stimulus-form.ts
var gr = {
	entity: "Entity",
	mode: "Mode",
	to: "Active states",
	edges: "Fire on",
	gain: "Gain",
	key: "Label",
	envelope: "Envelope preset"
}, _r = {
	entity: "The entity whose state drives this stimulus.",
	mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
	to: "Which states of this entity count as active.",
	edges: "Which crossings fire a trigger. At least one.",
	gain: "How loudly this stimulus contributes to its group.",
	key: "Optional name for this trigger; defaults to the entity id.",
	envelope: "Preset the overrides below start from."
}, vr = (e) => gr[e.name] ?? e.name, yr = (e) => _r[e.name] ?? "", br = [
	"entity",
	"mode",
	"gain",
	"key",
	"envelope"
], xr = { duration: { enable_millisecond: !0 } }, Sr = { number: {
	min: 0,
	step: .1,
	mode: "box",
	unit_of_measurement: "×"
} }, Cr = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, wr = "Allow retrigger", Tr = "When a new trigger is honoured while the envelope is still active.", Er = "Stacks", Dr = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", Or = { select: {
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
} }, kr = { select: {
	mode: "list",
	options: [{
		value: "sustained",
		label: "Sustained — hold while it is active"
	}, {
		value: "momentary",
		label: "Momentary — fire on each change"
	}]
} }, Ar = [
	"attack",
	"decay",
	"impulse"
], jr = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", Mr = (e, t) => e.mode === "momentary" && Ar.includes(t), Nr = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, Pr = "(unknown preset — using built-in defaults)", Fr = [
	{
		name: "attack",
		label: "Attack",
		kind: "duration",
		selector: xr
	},
	{
		name: "decay",
		label: "Decay",
		kind: "duration",
		selector: xr
	},
	{
		name: "sustain",
		label: "Sustain",
		kind: "multiplier",
		selector: Sr
	},
	{
		name: "release",
		label: "Release",
		kind: "duration",
		selector: xr
	},
	{
		name: "impulse",
		label: "Impulse",
		kind: "boolean",
		selector: mr
	},
	{
		name: "retrigger",
		label: wr,
		kind: "select",
		selector: Or,
		hint: Tr
	},
	{
		name: "stack",
		label: Er,
		kind: "boolean",
		selector: mr,
		hint: Dr
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: Nr
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: xr
	}
], Ir = [
	"entity",
	"mode",
	"to",
	"edges",
	"key"
], Lr = (e) => Ir.filter((t) => t !== "edges" || e.mode === "momentary"), Rr = ["envelope", "gain"], zr = "How a single trigger rises and falls over time.", Br = "What makes this stimulus fire, and what it is called in the mix.", Vr = "Change part of the preset for this stimulus only.", Hr = (e) => Fr.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, Ur = (e) => [{
	value: "",
	label: "(default preset)"
}, ...e.envelopes.map((e) => ({
	value: e.id,
	label: e.id
}))];
function Wr(e, t, n, r) {
	let i = on(n, t.entity, t.to), a = {
		entity: { entity: {} },
		mode: kr,
		to: { select: {
			mode: "dropdown",
			multiple: !0,
			custom_value: !0,
			options: rn(n, t.entity, t.to)
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
		gain: Cr,
		key: { text: {} },
		envelope: { select: {
			mode: "dropdown",
			options: Ur(e)
		} }
	};
	return r.map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function Gr(e, t) {
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
var Kr = (e) => Array.isArray(e) ? e.filter((e) => typeof e == "string" && e !== "") : [];
function qr(e, t) {
	let n = { ...e };
	if ("entity" in t && (n.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (n.mode = t.mode), "to" in t && (n.to = Kr(t.to)), "edges" in t) {
		let e = Kr(t.edges).filter((e) => e === "enter" || e === "leave");
		e.length > 0 && (n.edges = e);
	}
	return "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (n.key = Mn(t.key)), "envelope" in t && (n.envelope = Mn(t.envelope)), n;
}
var Jr = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]);
function Yr(e, t) {
	return Jr(e.to, t.to) ? Jr(e.edges, t.edges) ? br.find((n) => e[n] !== t[n]) : "edges" : "to";
}
function Xr(e, n, r) {
	let i = t(e, n.envelope);
	return i ? i[r] === null || i[r] === void 0 ? "defaults" : n.envelope ?? e.defaults.envelope : Pr;
}
function Zr(e, t) {
	return t == null || e === void 0 ? null : Qt(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
//#endregion
//#region src/sketch.ts
var Qr = (e) => e.release * e.sustain, $r = (e) => Math.max(1, e.sustain), ei = (e) => e.sustain / $r(e);
function ti(e, t = .25) {
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
	let n = Qr(e), r = e.attack + e.decay + n, i = r > 0 ? r * t / (1 - t) : 1, a = r + i, o = 1 / $r(e), s = ei(e), c = 0, l = [{
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
function ni(e, t = .25) {
	let n = ti(e, t), r = (e) => ((n[e]?.x ?? 0) + (n[e + 1]?.x ?? 0)) / 2;
	if (e.impulse) {
		let t = [{
			text: "impulse",
			x: 0
		}];
		return e.release > 0 && t.push({
			text: `R ${Qt(e.release)}`,
			x: r(1)
		}), t;
	}
	let i = [];
	return e.attack > 0 && i.push({
		text: `A ${Qt(e.attack)}`,
		x: r(0)
	}), e.decay > 0 && i.push({
		text: `D ${Qt(e.decay)}`,
		x: r(1)
	}), i.push({
		text: `S ${In(e.sustain)}`,
		x: r(2)
	}), Qr(e) > 0 && i.push({
		text: `R ${Qt(e.release)}`,
		x: r(3)
	}), i;
}
//#endregion
//#region src/al-envelope-sketch.ts
var ri = 10, ii = 190, ai = 58, oi = 72, si = (e) => ri + e * 180, ci = (e) => ai - e * 48, li = (e) => String(Math.round(e * 10) / 10), ui = (e, t) => `${li(e)},${li(t)}`, di = (e) => Math.min(184, Math.max(16, si(e))), fi = class extends i {
	constructor(...e) {
		super(...e), this.envelope = null;
	}
	static {
		this.styles = [x, _`
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
		if (!e) return T;
		let t = ti(e), n = t[0], r = t[t.length - 1], i = t.map((e) => ui(si(e.x), ci(e.y))).join(" "), a = `${ui(si(n.x), ai)} ${i} ${ui(si(r.x), ai)}`, s = ni(e), l = e.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
		return c`
      <svg viewBox="0 0 200 80" role="img" aria-label=${l}>
        <title>${l}</title>
        <line class="grid" x1=${ri} y1=${ai} x2=${ii} y2=${ai}></line>
        ${e.impulse ? T : o`<line
              class="grid"
              x1=${ri}
              y1=${li(ci(ei(e)))}
              x2=${ii}
              y2=${li(ci(ei(e)))}
            ></line>`}
        <polygon class="area" points=${a}></polygon>
        <polyline class="curve" points=${i}></polyline>
        ${s.map((e) => o`<text class="caption" x=${li(di(e.x))} y=${oi} text-anchor="middle">${e.text}</text>`)}
      </svg>
    `;
	}
};
w([E({ attribute: !1 })], fi.prototype, "envelope", void 0), fi = w([v("al-envelope-sketch")], fi);
//#endregion
//#region src/al-presence-overrides.ts
var pi = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, mi = class extends i {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [x];
	}
	setPresence(e, t) {
		let { config: n, path: r } = this;
		if (!n || !r) return;
		let i = D(n, r);
		if (!i) return;
		let a = y(n, [...r, "presence"], {
			...i.presence ?? Ke(),
			[e]: t
		});
		this.dispatchEvent(P(a, `${M(r)}:presence:${e}`));
	}
	render() {
		let { config: e, path: t } = this, n = e && t ? D(e, t) : void 0;
		if (!e || !t || !n) return T;
		let r = n.presence ?? Ke(), i = r.envelope ?? C(e).envelope, a = ne(e, {
			...r,
			envelope: i
		}), o = N(this.errors, [...t, "presence"]);
		return c`
      <ha-selector
        class="presence-envelope"
        .hass=${this.hass}
        .selector=${{ select: {
			mode: "dropdown",
			options: Ur(e)
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
        .selector=${Cr}
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
        .selector=${pi}
        .value=${r.activity_floor}
        .inherited=${C(e).activity.floor}
        .inheritedFrom=${"presence"}
        .error=${o.activity_floor}
        @value-changed=${(e) => this.setPresence("activity_floor", e.detail.value ?? null)}
      ></al-override-field>
      ${Fr.map((e) => c`<al-override-field
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
w([E({ attribute: !1 })], mi.prototype, "hass", void 0), w([E({ attribute: !1 })], mi.prototype, "config", void 0), w([E({ attribute: !1 })], mi.prototype, "path", void 0), w([E({ attribute: !1 })], mi.prototype, "errors", void 0), mi = w([v("al-presence-overrides")], mi);
//#endregion
//#region src/al-group-editor.ts
var hi = "People can leave the property from here, so presence can move from here to Away.", gi = class extends i {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [x, _`
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
		this.dispatchEvent(P(e, t));
	}
	emitSelect(e) {
		this.dispatchEvent(ln(e));
	}
	onIdentityChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = D(t, n);
		if (!r) return;
		let i = e.detail?.value ?? {}, a = nr(r, i);
		"area_id" in i && a.area_id !== r.area_id && (a = or(a, a.area_id, a.area_id === null ? null : this.areaName(a.area_id), t)), "floor_id" in i && a.floor_id !== r.floor_id && (a = sr(a, a.floor_id, a.floor_id === null ? null : this.floorName(a.floor_id), t));
		let o = rr(a, r);
		o !== void 0 && this.emitChange(y(t, n, a), `${M(n)}:${o}`);
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
		let r = D(t, n);
		if (!r) return;
		let i = nr(r, e.detail?.value ?? {}), a = rr(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${M(n)}:${a}`);
	}
	setField(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(y(n, [...r, e], t), `${M(r)}:${e}`);
	}
	onDelete() {
		let { config: e, path: t } = this;
		if (!e || !t) return;
		let n = D(e, t);
		if (!n || !window.confirm(`Delete group "${n.name || n.id}" and everything in it?`)) return;
		this.emitChange(Le(e, t));
		let r = g(t);
		this.emitSelect(r.length ? r : null);
	}
	render() {
		let { config: e, path: t } = this;
		if (!e || !t || t.length === 0) return c`<ha-card><span class="muted">Select a group.</span></ha-card>`;
		let n = D(e, t);
		if (!n) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		let r = t.length === 2, i = this.errors.filter((e) => e.path === M(t)), a = N(this.errors, t), o = t.length > 2 ? D(e, g(t)) : void 0;
		return c`
      <ha-card header="Group">
        ${n.area_id ? An("area", n.area_id, "Open Home Assistant area") : T}
        ${i.map((e) => c`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${fr("group", "identity", "Identity", S[n.kind].definition, !0, c`
            <ha-form
              .hass=${this.hass}
              .data=${tr(n, r, Ln, e)}
              .schema=${er(n, r, Ln, e, o?.kind ?? null)}
              .error=${a}
              .computeLabel=${Vn}
              .computeHelper=${Hn}
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(e, n, a)}
          `)}
        ${fr("group", "mix", "Mix", Kn, !0, this.renderMix(e, n, r, a))}
        ${this.renderAdjacency(e, n, a)} ${this.renderPresence(e, n, t)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderMix(e, t, n, r) {
		return c`
      <ha-form
        .hass=${this.hass}
        .data=${tr(t, n, Rn, e)}
        .schema=${er(t, n, Rn, e)}
        .error=${r}
        .computeLabel=${Vn}
        .computeHelper=${Hn}
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${zn.max_value}
        kind="number"
        .selector=${Yn}
        .value=${t.max_value}
        .inherited=${e.defaults.max_value}
        .inheritedFrom=${"defaults"}
        .error=${r.max_value}
        @value-changed=${(e) => this.setField("max_value", e.detail.value)}
      ></al-override-field>
      <al-override-field
        .hass=${this.hass}
        .label=${zn.precision}
        kind="select"
        .selector=${Xn}
        .value=${t.precision === null ? null : String(t.precision)}
        .inherited=${String(e.defaults.precision)}
        .inheritedFrom=${"defaults"}
        .error=${r.precision}
        @value-changed=${(e) => this.setField("precision", e.detail.value === null ? null : Number(e.detail.value))}
      ></al-override-field>
    `;
	}
	renderAdjacency(e, t, n) {
		return He.has(t.kind) ? fr("group", "adjacent", "Adjacent groups", qn, !0, c`
        <al-adjacency-table
          .config=${e}
          .path=${this.path}
          .errors=${this.errors}
        ></al-adjacency-table>
        ${this.renderExit(t, n)}
      `) : T;
	}
	renderExit(e, t) {
		return c`<div class="exit row">
      <ha-switch
        .checked=${e.exit === !0}
        @change=${(e) => this.setField("exit", e.target.checked === !0)}
      ></ha-switch>
      <div>
        <div>Leads off the property</div>
        <div class="muted">${hi}</div>
        ${t.exit ? c`<div class="error">${t.exit}</div>` : T}
      </div>
    </div>`;
	}
	renderPresence(e, t, n) {
		return C(e).enabled ? fr("group", "presence", "Presence", Jn, !1, c`<al-presence-overrides
        .hass=${this.hass}
        .config=${e}
        .path=${n}
        .errors=${this.errors}
      ></al-presence-overrides>`) : T;
	}
	renderStale(e, t, n) {
		if (He.has(t.kind)) return T;
		let r = [t.adjacent.length > 0 ? "adjacent groups" : null, t.exit === !0 ? "a way off the property" : null].filter((e) => e !== null);
		if (r.length === 0) return T;
		let i = n.adjacent ?? n.exit ?? `${S[t.kind].label} groups have no ${r.join(" and no ")}.`;
		return c`<div class="stale row">
      <div class="grow error">${i}</div>
      <ha-button appearance="plain" @click=${() => this.clearStale(e)}>Remove</ha-button>
    </div>`;
	}
	clearStale(e) {
		let t = this.path;
		if (!t) return;
		let n = y(y(e, [...t, "adjacent"], []), [...t, "exit"], !1);
		this.dispatchEvent(P(n, void 0, !0));
	}
};
w([E({ attribute: !1 })], gi.prototype, "hass", void 0), w([E({ attribute: !1 })], gi.prototype, "config", void 0), w([E({ attribute: !1 })], gi.prototype, "path", void 0), w([E({ attribute: !1 })], gi.prototype, "errors", void 0), gi = w([v("al-group-editor")], gi);
//#endregion
//#region src/al-stimulus-editor.ts
var _i = class extends i {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null;
	}
	static {
		this.styles = [x, _`
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
		this.dispatchEvent(P(e, t));
	}
	onFormChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = h(t, n);
		if (!r) return;
		let i = qr(r, e.detail?.value ?? {}), a = Yr(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${M(n)}:${a}`);
	}
	setOverride(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(y(n, [...r, e], t), `${M(r)}:${e}`);
	}
	renderLive(e, t) {
		return e ? c`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${e.phase}">${e.phase}</span>
      <span class="chip">${e.value.toFixed(2)}</span>
      ${t === null ? T : c`<span class="muted chip">ends in ${t}</span>`}
      <span class="dot ${e.gate ? "gated" : ""}" title=${e.gate ? "Gate open" : "Gate closed"}></span>
    </div>` : T;
	}
	renderOverride(e, t, n, r) {
		let { config: i } = this, a = Mr(t, e.name);
		return c`<al-override-field
      .hass=${this.hass}
      .label=${e.label}
      .disabled=${a}
      .hint=${a ? jr : e.hint ?? ""}
      .kind=${e.kind}
      .selector=${e.selector}
      .value=${t[e.name]}
      .inherited=${n[e.name]}
      .inheritedFrom=${i ? Xr(i, t, e.name) : "defaults"}
      .error=${r[e.name]}
      @value-changed=${(t) => this.setOverride(e.name, t.detail.value)}
    ></al-override-field>`;
	}
	render() {
		let { config: e, path: t } = this;
		if (!e || !t || t.length < 3) return c`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
		let n = h(e, t);
		if (!n) return c`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
		let r = D(e, g(t)), i = N(this.errors, t), a = this.errors.filter((e) => e.path === M(t)), o = ne(e, n), s = this.live?.voices[r?.id ?? ""]?.find((e) => e.label === (n.key ?? n.entity)), l = Zr(this.live?.now, s?.phase_ends), u = Hr(n);
		return c`
      <ha-card header="Stimulus">
        ${jn(this, this.hass, n.entity)}
        ${a.map((e) => c`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${fr("stimulus", "source", "Source", Br, !0, c`
            <ha-form
              .hass=${this.hass}
              .data=${Gr(n, Lr(n))}
              .schema=${Wr(e, n, this.hass, Lr(n))}
              .error=${i}
              .computeLabel=${vr}
              .computeHelper=${yr}
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `)}
        ${fr("stimulus", "envelope", "Envelope", zr, !0, c`
            <ha-form
              .hass=${this.hass}
              .data=${Gr(n, Rr)}
              .schema=${Wr(e, n, this.hass, Rr)}
              .error=${i}
              .computeLabel=${vr}
              .computeHelper=${yr}
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(s, l)}
            <al-envelope-sketch .envelope=${o}></al-envelope-sketch>
          `)}
        ${fr("stimulus", "overrides", "Override preset", Vr, !1, Fr.map((e) => this.renderOverride(e, n, o, i)), u === 0 ? T : c`<span class="badge">${u} overridden</span>`)}
      </ha-card>
    `;
	}
};
w([E({ attribute: !1 })], _i.prototype, "hass", void 0), w([E({ attribute: !1 })], _i.prototype, "config", void 0), w([E({ attribute: !1 })], _i.prototype, "path", void 0), w([E({ attribute: !1 })], _i.prototype, "errors", void 0), w([E({ attribute: !1 })], _i.prototype, "live", void 0), _i = w([v("al-stimulus-editor")], _i);
//#endregion
//#region src/al-envelopes.ts
var vi = {
	label: "Name",
	id: "ID",
	attack: "Attack",
	decay: "Decay",
	sustain: "Sustain",
	release: "Release",
	impulse: "Impulse"
}, yi = {
	label: "What this preset is called in the panel. Blank shows the id instead.",
	id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
	attack: "Time to rise from zero to the stimulus gain.",
	decay: "Time to travel from the peak to the sustain level.",
	sustain: "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
	release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
	impulse: "Fire and forget: the trigger ends the moment it starts, leaving only the release."
}, bi = [
	"label",
	"id",
	"attack",
	"decay",
	"sustain",
	"release",
	"impulse"
], xi = [
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
		selector: xr
	},
	{
		name: "decay",
		selector: xr
	},
	{
		name: "sustain",
		selector: Sr
	},
	{
		name: "release",
		selector: xr
	},
	{
		name: "impulse",
		selector: { boolean: {} }
	}
], Si = [
	{
		name: "retrigger",
		label: wr,
		kind: "select",
		selector: Or,
		hint: Tr
	},
	{
		name: "stack",
		label: Er,
		kind: "boolean",
		selector: mr,
		hint: Dr
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: Nr
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: xr
	}
], Ci = "text/plain", wi = 36, Ti = (e) => e.stopPropagation(), L = class extends i {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => vi[e.name] ?? e.name, this.computeHelper = (e) => yi[e.name] ?? "";
	}
	static {
		this.styles = [x, _`
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
		this.dispatchEvent(P(e, t));
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
		let r = p(n, ["envelopes"], e, t);
		if (r === n) return;
		let i = n.envelopes[this.selected]?.id, a = r.envelopes.findIndex((e) => e.id === i);
		this.selected = a === -1 ? 0 : a, this.blocked = null, this.emitChange(r);
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(Ci, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
	}
	onDragEnd() {
		this.dragging = null, this.dropAt = null;
	}
	slotFor(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || wi;
		return e.clientY - n.top < r / 2 ? t : t + 1;
	}
	isOurs(e) {
		return this.dragging !== null && e.dataTransfer?.types.includes(Ci) === !0;
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
		this.emitChange(ce(e, ["envelopes"], t, s(Ye(e, "preset")))), this.selected = t;
	}
	removePreset(e) {
		let t = this.config;
		if (!t) return;
		let n = t.envelopes[e];
		if (!n) return;
		let r = ee(t, n.id);
		if (r.defaults || r.groups.length > 0) {
			this.selected = e, this.blocked = {
				id: n.id,
				...r
			};
			return;
		}
		window.confirm(`Delete envelope preset "${n.id}"?`) && (this.blocked = null, this.emitChange(Le(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && --this.selected);
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
		}, s = bi.find((e) => o[e] !== r[e]);
		if (s === void 0) return;
		let c = ["envelopes", n], l = y(te(t, n, o.id), c, o);
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
		this.emitChange(y(n, i, t), M(i));
	}
	render() {
		let e = this.config;
		return e ? c`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(e)}</div>
        <div>${this.renderEditor(e)}</div>
      </div>
    ` : c`<ha-card><span class="muted">Loading…</span></ha-card>`;
	}
	renderList(e) {
		let t = this.blocked;
		return c`
      <ha-card>
        <h3>Presets</h3>
        ${e.envelopes.map((t, n) => this.renderPresetRow(e, t, n))}
        ${e.envelopes.length === 0 ? c`<p class="muted">No presets yet.</p>` : T}
        ${t ? c`<ha-alert alert-type="warning">${Di(t)}</ha-alert>` : T}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderPresetRow(e, t, n) {
		let r = sn(this.errors, ["envelopes", n]), i = e.defaults.envelope === t.id, a = this.dragging === null || this.dropAt === null ? "" : this.dropClass(n), o = [
			"row",
			"preset",
			this.selected === n ? "selected" : "",
			this.dragging === n ? "dragging" : "",
			a
		].filter(Boolean).join(" ");
		return c`<div
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
          >${t.id === "" && t.label === null ? "(unnamed preset)" : Oe(t)}</span
        >
        ${t.label !== null && t.label.trim() !== "" ? c`<span class="muted id">${t.id}</span>` : T}
      </button>
      ${r ? c`<span class="badge" title="${r} problem(s)">${r}</span>` : T}
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
          @dragstart=${Ti}
          @click=${Ti}
          @change=${() => this.setDefault(n)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
        @dragstart=${Ti}
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
		if (!n) return c`<ha-card
        ><span class="muted">Select a preset.</span></ha-card
      >`;
		let r = ["envelopes", t], i = N(this.errors, r), a = this.errors.filter((e) => e.path === M(r)), o = {
			label: n.label ?? "",
			id: n.id,
			attack: k(n.attack),
			decay: k(n.decay),
			sustain: n.sustain,
			release: k(n.release),
			impulse: n.impulse
		}, s = Ei(e, t, n);
		return c`
      <ha-card header="Envelope preset">
        ${a.map((e) => c`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${s ? c`<ha-alert alert-type="warning">${s}</ha-alert>` : T}
        <ha-form
          .hass=${this.hass}
          .data=${o}
          .schema=${xi}
          .error=${i}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${n}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Si.map((t) => c`<al-override-field
              .hass=${this.hass}
              .label=${t.label}
              .hint=${t.hint ?? ""}
              .kind=${t.kind}
              .selector=${t.kind === "boolean" ? mr : t.selector}
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
w([E({ attribute: !1 })], L.prototype, "hass", void 0), w([E({ attribute: !1 })], L.prototype, "config", void 0), w([E({ attribute: !1 })], L.prototype, "errors", void 0), w([E({ type: Boolean })], L.prototype, "narrow", void 0), w([b()], L.prototype, "selected", void 0), w([b()], L.prototype, "blocked", void 0), w([b()], L.prototype, "dragging", void 0), w([b()], L.prototype, "dropAt", void 0), L = w([v("al-envelopes")], L);
function Ei(e, t, n) {
	return n.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((e, r) => r !== t && e.id === n.id) ? `Another preset already uses the id "${n.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Di(e) {
	let t = [];
	return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
//#endregion
//#region src/al-defaults.ts
var Oi = {
	envelope: "Default envelope",
	max_value: "Max value",
	precision: "Precision",
	unavailable: "When unavailable",
	retrigger: wr,
	stack: Er,
	debounce: "Debounce",
	safety_refresh: "Safety refresh",
	min_wake_interval: "Minimum wake interval"
}, ki = {
	envelope: "Preset used when a stimulus names none.",
	max_value: "Limiter for groups that don't set their own.",
	precision: "Display decimals.",
	unavailable: "What an entity going unavailable does to its trigger.",
	retrigger: Tr,
	stack: Dr,
	debounce: "Minimum time between triggers per stimulus.",
	safety_refresh: "Periodic recompute as a self-heal.",
	min_wake_interval: "Floor for the scheduler's timer delay."
}, Ai = [
	"envelope",
	"max_value",
	"precision",
	"unavailable",
	"retrigger",
	"stack",
	"debounce",
	"safety_refresh",
	"min_wake_interval"
], ji = { duration: { enable_millisecond: !0 } }, Mi = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, Ni = { select: {
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
} }, Pi = { boolean: {} }, Fi = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, Ii = class extends i {
	constructor(...e) {
		super(...e), this.errors = [], this.computeLabel = (e) => Oi[e.name] ?? e.name, this.computeHelper = (e) => ki[e.name] ?? "";
	}
	static {
		this.styles = [x, _`
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
				selector: Mi
			},
			{
				name: "precision",
				selector: Ni
			},
			{
				name: "unavailable",
				selector: Fi
			},
			{
				name: "retrigger",
				selector: Or
			},
			{
				name: "stack",
				selector: Pi
			},
			{
				name: "debounce",
				selector: ji
			},
			{
				name: "safety_refresh",
				selector: ji
			},
			{
				name: "min_wake_interval",
				selector: ji
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
		}, o = Ai.find((e) => a[e] !== n[e]);
		o !== void 0 && this.emitChange(y(t, ["defaults"], a), `defaults:${o}`);
	}
	emitChange(e, t) {
		this.dispatchEvent(P(e, t));
	}
	render() {
		let e = this.config;
		if (!e) return c`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
		let t = e.defaults, n = N(this.errors, ["defaults"]), r = this.errors.filter((e) => e.path === "defaults"), i = {
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
		return c`
      <div class="pad">
        <ha-card header="Defaults">
          ${r.map((e) => c`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
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
w([E({ attribute: !1 })], Ii.prototype, "hass", void 0), w([E({ attribute: !1 })], Ii.prototype, "config", void 0), w([E({ attribute: !1 })], Ii.prototype, "errors", void 0), Ii = w([v("al-defaults")], Ii);
//#endregion
//#region src/fader.ts
var Li = .1, Ri = Math.log10(Li), zi = Math.log10(10) - Ri, Bi = (e) => Math.min(10, Math.max(Li, e)), Vi = (e) => Math.round(e * 100) / 100, Hi = (e) => Vi(Bi(e));
function Ui(e) {
	return (Math.log10(Bi(e)) - Ri) / zi;
}
function Wi(e) {
	return Vi(Bi(10 ** (Ri + Math.min(1, Math.max(0, e)) * zi)));
}
function Gi(e, t, n = !1) {
	let r = n ? 1.05 : 1.25;
	return Vi(Bi(t === 1 ? e * r : e / r));
}
function Ki(e) {
	let t = e.toFixed(2).replace(/0+$/, "");
	return t.endsWith(".") && (t += "0"), t;
}
var qi = {
	min: Li,
	max: 10,
	toPosition: Ui,
	fromPosition: Wi,
	clamp: Hi,
	step: (e, t, n = !1) => Gi(e, t, n),
	page: (e, t) => Hi(t === 1 ? e * 2 : e / 2),
	format: Ki,
	reset: 1
}, Ji = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function Yi(e, t) {
	let n = e > 0 ? e : 1, r = Ji(t), i = 10 ** -r, a = (e) => Number(Math.min(n, Math.max(0, e)).toFixed(r)), o = Math.max(i, Number((n / 10).toFixed(r)));
	return {
		min: 0,
		max: n,
		toPosition: (e) => Math.min(1, Math.max(0, e / n)),
		fromPosition: (e) => a(Math.min(1, Math.max(0, e)) * n),
		clamp: a,
		step: (e, t, n = !1) => a(e + t * (n ? i : o)),
		page: (e, t) => a(e + t * n / 4),
		format: (e) => We(a(e), r),
		reset: null
	};
}
//#endregion
//#region src/al-fader.ts
var Xi = 12, Zi = (e) => `${Math.round(e * 1e3) / 10}%`, R = class extends i {
	constructor(...e) {
		super(...e), this.value = 1, this.disabled = !1, this.focusable = !0, this.readOnly = !1, this.label = "Gain", this.showValue = !0, this.unavailable = !1, this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1;
	}
	static {
		this.styles = _`
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
      height: ${Xi}px;
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
		return this.mode === "level" ? Yi(this.max, this.precision) : qi;
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
		let e = this.scale, t = e.clamp(this.current), n = e.toPosition(t), r = this.tick === null || e.clamp(this.tick) === t ? null : e.clamp(this.tick), i = c`
      ${this.mode === "gain" ? c`<div class="unity"></div>` : T}
      <div class="fill" style="height: ${Zi(n)}"></div>
      ${r === null ? T : c`<div class="tick" style="bottom: ${Zi(e.toPosition(r))}" title=${e.format(r)}></div>`}
    `;
		return this.readOnly ? c`
        <div
          class="fader"
          role="meter"
          aria-label=${this.label}
          aria-valuemin=${e.min}
          aria-valuemax=${e.max}
          aria-valuenow=${this.unavailable ? T : t}
          aria-valuetext=${this.unavailable ? "Value unavailable" : e.format(t)}
        >
          <div class="track">${this.unavailable ? T : i}</div>
          ${this.showValue ? c`<div class="value">${e.format(t)}</div>` : T}
        </div>
      ` : c`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled || !this.focusable ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${e.min}
        aria-valuemax=${e.max}
        aria-valuenow=${this.unavailable ? T : t}
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
          <div class="knob" style="bottom: calc(${Zi(n)} - ${Math.round((n - .5) * Xi * 10) / 10}px - ${Xi / 2}px)"></div>
        </div>
        ${this.showValue ? c`<div class="value">${e.format(t)}</div>` : T}
      </div>
    `;
	}
};
w([E({ type: Number })], R.prototype, "value", void 0), w([E({
	type: Boolean,
	reflect: !0
})], R.prototype, "disabled", void 0), w([E({ type: Boolean })], R.prototype, "focusable", void 0), w([E({
	type: Boolean,
	reflect: !0,
	attribute: "readonly"
})], R.prototype, "readOnly", void 0), w([E({ type: String })], R.prototype, "label", void 0), w([E({ type: Boolean })], R.prototype, "showValue", void 0), w([E({ type: Boolean })], R.prototype, "unavailable", void 0), w([E({ type: String })], R.prototype, "mode", void 0), w([E({ type: Number })], R.prototype, "max", void 0), w([E({ type: Number })], R.prototype, "precision", void 0), w([E({ type: Number })], R.prototype, "tick", void 0), w([b()], R.prototype, "dragValue", void 0), R = w([v("al-fader")], R);
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive.js
var Qi = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, $i = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), ea = class {
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
}, ta = $i(class extends ea {
	constructor(e) {
		if (super(e), e.type !== Qi.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
		return se;
	}
}), na = (e) => `${Math.round(e * 1e3) / 10}%`, ra = class extends i {
	constructor(...e) {
		super(...e), this.value = 0, this.max = 1, this.gated = !1;
	}
	static {
		this.styles = _`
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
		return c`
      <div class="meter">
        <div class=${ta({
			fill: !0,
			hot: e > .9
		})} style="width: ${na(e)}"></div>
      </div>
      <div class=${ta({
			dot: !0,
			gated: this.gated
		})}></div>
    `;
	}
};
w([E({ type: Number })], ra.prototype, "value", void 0), w([E({ type: Number })], ra.prototype, "max", void 0), w([E({ type: Boolean })], ra.prototype, "gated", void 0), ra = w([v("al-meter")], ra);
var z = class extends i {
	constructor(...e) {
		super(...e), this.label = "", this.editable = !1, this.value = 0, this.realValue = 0, this.maxValue = 5, this.precision = 1, this.liveNow = 0, this.muted = !1, this.selected = !1, this.errors = 0, this.pending = null, this.dragging = !1;
	}
	static {
		this.styles = _`
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
		this.dispatchEvent(dn());
	}
	clearStepTimer() {
		this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
	}
	sendOverride(e) {
		this.clearStepTimer(), this.dispatchEvent(fn(e));
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
			this.stepTimer = void 0, this.dispatchEvent(fn(t));
		}, 250);
	}
	onMute() {
		this.editable && this.dispatchEvent(pn(!this.muted));
	}
	onReset() {
		this.editable && this.dispatchEvent(mn());
	}
	render() {
		let e = this.pending ?? this.value;
		return c`
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
        <div class="readout" title=${e === null ? "No data at this time" : T}>${e === null ? "" : We(e, this.precision)}</div>
        ${this.editable ? c`<div class="buttons">
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
            </div>` : T}
        <div class="foot">
          ${this.errors > 0 ? c`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : T}
        </div>
      </div>
    `;
	}
};
w([E({ type: String })], z.prototype, "label", void 0), w([E({
	type: Boolean,
	reflect: !0
})], z.prototype, "editable", void 0), w([E({ attribute: !1 })], z.prototype, "value", void 0), w([E({ attribute: !1 })], z.prototype, "realValue", void 0), w([E({ type: Number })], z.prototype, "maxValue", void 0), w([E({ type: Number })], z.prototype, "precision", void 0), w([E({ type: Number })], z.prototype, "liveNow", void 0), w([E({
	type: Boolean,
	reflect: !0
})], z.prototype, "muted", void 0), w([E({
	type: Boolean,
	reflect: !0
})], z.prototype, "selected", void 0), w([E({ type: Number })], z.prototype, "errors", void 0), w([b()], z.prototype, "pending", void 0), z = w([v("al-strip")], z);
//#endregion
//#region src/al-mixer.ts
var ia = 8e3, aa = (e) => e instanceof Error ? e.message : String(e), B = class extends i {
	constructor(...e) {
		super(...e), this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.live = null, this.narrow = !1, this.preview = null, this.editing = bt(), this.commandError = null, this.pendingFocus = !1;
	}
	static {
		this.styles = [x, _`
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
		return this.config ? ft(this.config, this.nav) : [];
	}
	get selected() {
		let { config: e, nav: t } = this;
		if (!e || t.selection === null) return null;
		let n = ge(t.selection), r = D(e, n);
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
		this.pendingFocus = !0, this.dispatchEvent(hn(e));
	}
	clearErrorTimer() {
		this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
	}
	fail(e) {
		this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
			this.errorTimer = void 0, this.commandError = null;
		}, ia);
	}
	async command(e, t, n) {
		let r = this.hass;
		if (!(!r || this.preview)) try {
			await t(r), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(gn());
		} catch (t) {
			n?.settle(null), this.fail(`Could not ${e}: ${aa(t)}`);
		}
	}
	trackOf(e) {
		let t = e.target?.dataset?.index;
		return t === void 0 ? null : this.tracks[Number(t)] ?? null;
	}
	onStripSelect(e) {
		let t = this.trackOf(e);
		t && this.dispatchEvent(hn({
			type: "select",
			path: t.path
		}));
	}
	onLevelOverride(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let n = e.target, { value: r } = e.detail;
		this.command(`set the level of ${t.id}`, async (e) => n.settle(await me(e, t.id, r)), n);
	}
	onMuteToggle(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let { muted: n } = e.detail;
		this.command(`${n ? "mute" : "unmute"} ${t.id}`, (e) => Ge(e, t.id, n));
	}
	onReset(e) {
		let t = this.trackOf(e);
		!t || this.preview || this.command(`reset ${t.id}`, (e) => Te(e, t.id));
	}
	onEditToggle(e) {
		this.preview || (this.editing = e.target.checked === !0, xt(this.editing));
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
		let i = D(e, t.path);
		if (!i) return c``;
		let a = this.live?.groups[i.id], o = this.isSelected(t.path);
		return c`
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
        .precision=${a?.precision ?? pe(e, i)}
        .muted=${this.preview ? !1 : a?.muted ?? !1}
        .selected=${o}
        .errors=${sn(this.errors, t.path)}
      ></al-strip>
    `;
	}
	renderBand(e, t) {
		let n = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${e.depth + 1};`, r = e.id === this.selectedId ? 0 : -1, i = this.live?.groups[e.id], a = this.preview ? this.preview.values[e.id] : i?.value, o = i?.precision ?? (t && this.config ? pe(this.config, t) : 1), s = e.expanded ? "Collapse" : "Expand";
		return c`
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
        <span class="band-value">${a == null ? "" : We(a, o)}</span>
      </div>
    `;
	}
	render() {
		let e = this.config;
		if (!e || e.groups.length === 0) return c`<div class="empty muted">Nothing to mix: add a group first.</div>`;
		let t = pt(e, this.nav), n = this.tracks, r = new Map(n.map((t) => [t.id, D(e, t.path)])), i = t.kinds.map(() => "var(--al-strip-w)").join(" "), a = t.rows > 0 ? `repeat(${t.rows}, auto) auto` : "auto";
		return c`
      ${this.commandError === null ? T : c`<ha-alert
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
        ${this.selected ? c`<button class="open-group" type="button"
          @click=${() => this.dispatchEvent(new CustomEvent("al-open-group", {
			detail: this.selected.path,
			bubbles: !0,
			composed: !0
		}))}>Group settings</button>` : T}
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
w([E({ attribute: !1 })], B.prototype, "hass", void 0), w([E({ attribute: !1 })], B.prototype, "config", void 0), w([E({ attribute: !1 })], B.prototype, "nav", void 0), w([E({ attribute: !1 })], B.prototype, "errors", void 0), w([E({ attribute: !1 })], B.prototype, "live", void 0), w([E({
	type: Boolean,
	reflect: !0
})], B.prototype, "narrow", void 0), w([E({ attribute: !1 })], B.prototype, "preview", void 0), w([b()], B.prototype, "editing", void 0), w([b()], B.prototype, "commandError", void 0), B = w([v("al-mixer")], B);
//#endregion
//#region src/al-timeline.ts
var oa = 32, sa = 28, ca = 4, la = 8, ua = 800, da = 220, fa = 160, pa = 2e3, ma = 6e4, ha = 1e4, ga = 6e4, _a = 32, va = [
	"24h",
	"7d",
	"30d"
], ya = [
	"off",
	"24h",
	"7d"
], ba = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], xa = (e) => `hsl(${e * 67 % 360} 55% 62%)`, Sa = /* @__PURE__ */ new Map(), Ca = /* @__PURE__ */ new Map();
function wa(e, t) {
	let n = Date.now();
	for (let [e, t] of Sa) n - t.at >= ga && Sa.delete(e);
	Sa.delete(e), Sa.set(e, {
		at: n,
		data: t
	});
	for (let e of Sa.keys()) {
		if (Sa.size <= _a) break;
		Sa.delete(e);
	}
}
var Ta = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", Ea = (e, t) => {
	let n = /* @__PURE__ */ new Date(e * 1e3);
	return t < 86400 ? n.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	}) : n.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}, Da = (e) => String(Math.round(e * 100) / 100), Oa = (e, t, n) => Math.min(n, Math.max(t, e));
function ka(e, t, n, r) {
	let i = Math.max(1, r.width - oa), a = Math.max(1, r.height - sa), o = n.start, s = Math.max(n.until, n.end), c = Et(o, s, i), l = Dt(r.maxValue, a), u = Object.keys(e.series), d = u.includes(t) ? t : u[0] ?? t, f = (t, n) => {
		let r = Ot(e.series[t] ?? [], pa);
		return {
			id: t,
			points: r,
			d: kt(r, c, l),
			color: n
		};
	}, p = f(d, "var(--primary-color)"), m = r.showChannels ? u.filter((e) => e !== d).map((e, t) => f(e, xa(t))) : [], h = e.forecast, ee = h ? Ta(At(h, c, l, pa)) : "", te = h ? kt(Ot(jt(h, "p50"), pa), c, l) : "", g = [];
	for (let [, , t] of e.day_types) g.includes(t) || g.push(t);
	let _ = (e) => ba[g.indexOf(e) % ba.length], ne = Nt(e.day_types.map(([e, t, n]) => [
		e,
		t,
		n
	]), c, s).map((e) => ({
		...e,
		fill: _(e.tag)
	})), re = Nt(Object.entries(e.lights).flatMap(([e, t]) => t.map(([t, n]) => [
		t,
		n,
		e
	])), c, s), ie = Nt(e.plan, c, s);
	return {
		busId: d,
		bus: p,
		children: m,
		band: ee,
		p50: te,
		dayTypes: ne,
		legend: g.map((e) => ({
			tag: e,
			fill: _(e)
		})),
		lights: re,
		plan: ie,
		x: c,
		y: l,
		t0: o,
		t1: s,
		plotW: i,
		plotH: a
	};
}
var V = class extends i {
	constructor(...e) {
		super(...e), this.groupId = null, this.heading = "", this.labels = {}, this.precisions = {}, this.cursorTime = null, this.viewport = null, this.pinnedTime = null, this.dragging = !1, this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = 14, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = ua, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
	}
	static {
		this.styles = [x, _`
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
		return this.narrow ? fa : da;
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
		}, ma), this.load();
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
		}, ha)));
	}
	willUpdate(e) {
		let t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), n = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
		(t || n) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
	}
	query(e) {
		let t = Math.floor(Date.now() / 1e3 / 60) * 60, n = Tt(t, this.range, this.horizon);
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
		let r = this.query(n), i = Ft(r), a = e ? void 0 : Sa.get(i);
		if (a && Date.now() - a.at < ga) {
			this.seq++, this.loaded = {
				q: r,
				data: a.data
			}, this.error = null, wa(i, a.data);
			return;
		}
		let o = e ? void 0 : Ca.get(i);
		if (!o) {
			let e = Ue(t, r);
			o = e, Ca.set(i, e), e.then((e) => wa(i, e), () => void 0).finally(() => {
				Ca.get(i) === e && Ca.delete(i);
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
		let r = ka(e.data, e.q.group_id, this.viewport ? {
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
		return !r || e.bus.id !== t ? "" : kt(Mt(e.bus.points, n.now, r.value, e.t0, e.t1), e.x, e.y);
	}
	emitSettings() {
		this.dispatchEvent(_n({
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
		let n = e.currentTarget.getBoundingClientRect(), r = n.width > 0 ? this.width / n.width : 1, i = Oa(((e.clientX - n.left) * r - oa) / t.plotW, 0, 1);
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
		this.cursorIndex = e === null || !t.length ? null : Pt(t, e), this.emitTransport();
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
		this.clearViewportTimer(), this.seq++, this.viewport = It(e, Date.now() / 1e3), this.emitTransport(), t ? this.load() : this.viewportTimer = setTimeout(() => {
			this.viewportTimer = void 0, this.load();
		}, 100);
	}
	zoom(e, t) {
		let n = this.paths;
		n && this.changeWindow(Lt({
			start: n.t0,
			end: n.t1
		}, t ?? this.cursorTime ?? (n.t0 + n.t1) / 2, e, Date.now() / 1e3));
	}
	onWheel(e) {
		let t = this.paths;
		if (t) {
			if (e.ctrlKey || e.metaKey) e.preventDefault(), this.zoom(Math.exp(Oa(e.deltaY, -100, 100) * .01), this.timeAt(e, t));
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
		this.cursorIndex = this.cursorIndex === null ? r > 0 ? 0 : n : Oa(this.cursorIndex + r, 0, n), this.pinnedTime = t.bus.points[this.cursorIndex][0], this.selectTime(this.pinnedTime);
	}
	renderChips() {
		let e = this.learningHint;
		return c`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${va.map((e) => c`
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
          ${ya.map((t) => {
			let n = t !== "off" && !this.forecastReady;
			return c`
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
        ${e ? c`<span class="muted hint" title=${e}>${e}</span>` : T}
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
		let t = this.width, n = this.height, r = e.x(this.nowAt()), i = this.tailPath(e), a = e.plotH + ca, s = this.cursorTime === null ? null : e.x(this.cursorTime), l = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
		return c`
      <svg
        class="chart"
        viewBox="0 0 ${t} ${n}"
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
		].map((n) => o`
            <line class="grid" x1=${oa} y1=${e.y(this.maxValue * n)} x2=${t} y2=${e.y(this.maxValue * n)}></line>
            <text class="ytick" x=${28} y=${e.y(this.maxValue * n) + 3} text-anchor="end">
              ${Da(this.maxValue * n)}
            </text>
          `)}
        <g transform="translate(${oa},0)">
          ${e.dayTypes.map((t) => o`<rect
              class="daytype"
              x=${t.x0}
              y="0"
              width=${Math.max(0, t.x1 - t.x0)}
              height=${e.plotH}
              fill=${t.fill}
            ></rect>`)}
          ${this.forecastReady && e.band ? o`<polygon class="band" points=${e.band}></polygon>` : T}
          ${this.forecastReady && e.p50 ? o`<path class="p50" d=${e.p50} stroke-dasharray="4 3"></path>` : T}
          ${e.children.map((e) => o`<path class="child" d=${e.d} stroke=${e.color}></path>`)}
          ${e.bus.d ? o`<path class="bus" d=${e.bus.d}></path>` : T}
          ${i ? o`<path class="tail" d=${i}></path>` : T}
          ${this.showLights ? e.lights.map((e) => o`<rect
                  class="light"
                  x=${e.x0}
                  y=${a}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${la}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`) : T}
          ${this.showLights ? e.plan.map((e) => o`<rect
                  class="plan"
                  x=${e.x0}
                  y=${a}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${la}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`) : T}
          ${r >= 0 && r <= e.plotW ? o`<line class="now" x1=${r} y1="0" x2=${r} y2=${e.plotH}></line>
          <text class="now-label" x=${r + 3} y="10">now</text>` : T}
          ${s === null ? T : o`<line class="cursor" x1=${s} y1="0" x2=${s} y2=${e.plotH}></line>`}
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
		].map(([n, r]) => o`<text class="xlabel" x=${n * e.plotW} y=${t} text-anchor=${r}>
        ${Ea(e.t0 + n * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`);
	}
	renderTooltip(e) {
		let t = this.cursorTime;
		if (t === null || t < e.t0 || t > e.t1) return T;
		let n = this.forecastReady ? this.loaded?.data.forecast : null, r = this.loaded?.q.resolution === "5m" ? 600 : 7200, i = t > this.nowAt() ? n ? Rt(jt(n, "p50"), t) : null : Rt(e.bus.points, t, r), a = (oa + e.x(t)) / this.width * 100, o = this.loaded?.data.day_types.find(([e, n]) => t >= e && t < n)?.[2], s = (e, t) => {
			if (t === null) return null;
			let n = We(t, this.precisions[e] ?? this.live?.groups[e]?.precision ?? 1);
			return Number(n) === 0 ? null : n;
		}, l = s(e.busId, i), u = e.children.flatMap((e) => {
			let n = s(e.id, Rt(e.points, t, r));
			return n === null ? [] : [{
				...e,
				formatted: n
			}];
		});
		return c`
      <div class="tooltip ${a > 60 ? "flip" : ""}" style="left: ${a}%">
        <div class="tt-time">${(/* @__PURE__ */ new Date(t * 1e3)).toLocaleString()}</div>
        ${l === null ? T : c`<div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || e.busId}</span>
          <span class="tt-value">${l}</span>
        </div>`}
        ${u.slice(0, 5).map((e) => c`
          <div class="tt-row">
            <span class="tt-swatch" style="background: ${e.color}"></span>
            <span class="tt-name">${this.labels[e.id] ?? e.id.replaceAll("_", " ")}</span>
            <span class="tt-value">${e.formatted}</span>
          </div>
        `)}
        ${u.length > 5 ? c`<div class="muted">+${u.length - 5} channels</div>` : T}
        ${o ? c`<div class="tt-daytype muted">${o}</div>` : T}
      </div>
    `;
	}
	render() {
		if (this.groupId === null) return c`<div class="placeholder muted">Select a strip to see its timeline.</div>`;
		let e = this.paths;
		return c`
      ${this.renderChips()}
      ${e ? this.renderChart(e) : c`<div class="placeholder muted">Loading…</div>`}
      <div class="transport toolbar" role="group" aria-label="Timeline transport">
        <button class="chip" aria-label="Zoom out" @click=${() => this.zoom(2)}>−</button>
        <button class="chip" aria-label="Zoom in" @click=${() => this.zoom(.5)}>+</button>
        ${[
			-7,
			-3,
			-1
		].map((e) => c`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>${e}d</button>`)}
        <button class="chip transport-now" @click=${this.resetTransport}>Now</button>
        ${[
			1,
			3,
			7
		].map((e) => c`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>+${e}d</button>`)}
        <span class="muted transport-status">${this.cursorTime === null ? "Live" : `${this.cursorTime > this.nowAt() ? "Forecast" : "History"} · ${(/* @__PURE__ */ new Date(this.cursorTime * 1e3)).toLocaleString()}`}</span>
      </div>
      ${e && e.legend.length > 0 ? c`
            <div class="legend">
              ${e.legend.map((e) => c`
                  <span class="legend-item">
                    <span class="swatch" style="background: ${e.fill}"></span>${e.tag}
                  </span>
                `)}
            </div>
          ` : T}
      ${this.error ? c`<div class="error">Timeline: ${this.error}</div>` : T}
      ${e ? this.renderTooltip(e) : T}
    `;
	}
};
w([E({ attribute: !1 })], V.prototype, "hass", void 0), w([E({ attribute: !1 })], V.prototype, "groupId", void 0), w([E({ attribute: !1 })], V.prototype, "heading", void 0), w([E({ attribute: !1 })], V.prototype, "labels", void 0), w([E({ attribute: !1 })], V.prototype, "precisions", void 0), w([b()], V.prototype, "cursorTime", void 0), w([b()], V.prototype, "viewport", void 0), w([E({ attribute: !1 })], V.prototype, "range", void 0), w([E({ attribute: !1 })], V.prototype, "horizon", void 0), w([E({ type: Boolean })], V.prototype, "showChannels", void 0), w([E({ type: Boolean })], V.prototype, "showLights", void 0), w([E({ attribute: !1 })], V.prototype, "live", void 0), w([E({ type: Number })], V.prototype, "maxValue", void 0), w([E({ attribute: !1 })], V.prototype, "profileState", void 0), w([E({ type: Number })], V.prototype, "minDays", void 0), w([E({
	type: Boolean,
	reflect: !0
})], V.prototype, "narrow", void 0), w([E({ type: Boolean })], V.prototype, "paused", void 0), w([b()], V.prototype, "cursorIndex", void 0), w([b()], V.prototype, "width", void 0), w([b()], V.prototype, "loaded", void 0), w([b()], V.prototype, "error", void 0), V = w([v("al-timeline")], V);
//#endregion
//#region src/al-strip-controls.ts
var Aa = [
	"name",
	"mix",
	"null_handling",
	"gain"
], ja = 5, Ma = (e) => e[e.length - 2] === "stimuli", H = class extends i {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.statusOnly = !1, this.simLog = null;
	}
	static {
		this.styles = [x, _`
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
		this.dispatchEvent(P(e, t));
	}
	setField(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(y(n, [...r, e], t), `${M(r)}:${e}`);
	}
	onBusForm(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = D(t, n);
		if (!r) return;
		let i = nr(r, e.detail?.value ?? {}), a = rr(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${M(n)}:${a}`);
	}
	onSim(e, t) {
		this.dispatchEvent(vn(e, t.target.checked === !0));
	}
	onRebuild() {
		this.dispatchEvent(yn());
	}
	renderChannel(e, t) {
		return c`<al-stimulus-editor
      .hass=${this.hass}
      .config=${e}
      .path=${t}
      .errors=${this.errors}
      .live=${this.live}
    ></al-stimulus-editor>`;
	}
	renderBus(e, t) {
		let n = D(e, t);
		if (!n) return c`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		if (this.statusOnly) return c`<ha-card>${this.renderStatus(e, n)}</ha-card>`;
		let r = t.length === 2, i = this.errors.filter((e) => e.path === M(t)), a = N(this.errors, t);
		return c`
      <ha-card header=${n.name ?? n.id}>
        ${i.map((e) => c`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${tr(n, r, Aa, e)}
              .schema=${er(n, r, Aa, e)}
              .error=${a}
              .computeLabel=${Vn}
              .computeHelper=${Hn}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${Yn}
              .value=${n.max_value}
              .inherited=${e.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${a.max_value}
              @value-changed=${(e) => this.setField("max_value", e.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              .label=${zn.precision}
              kind="select"
              .selector=${Xn}
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
		let r = C(e).enabled && l(e).has(t.id);
		return c`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${r ? this.renderPresence(e, t, n) : T}
        ${t.stimuli.length === 0 && !r ? c`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : t.stimuli.map((t, r) => this.renderStimulus(e, [
			...n,
			"stimuli",
			r
		], t))}
      </div>
    `;
	}
	renderPresence(e, t, n) {
		let r = this.live?.voices[t.id]?.find((e) => e.label === be);
		return c`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${r ? c`<span class="chip phase ${r.phase}">${r.phase}</span>` : T}
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
		let r = this.hass?.states[n.entity], i = r?.attributes.friendly_name ?? (n.entity || "(no entity)"), a = sn(this.errors, t);
		return c`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          ${r ? c`<ha-state-icon .hass=${this.hass} .stateObj=${r}></ha-state-icon>` : c`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${n.key ?? i}</span>
          ${a ? c`<span class="badge" title="${a} problem(s)">${a}</span>` : T}
          ${r ? c`<span class="muted chip">${an(this.hass, n.entity)}</span>` : T}
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
		let n = t.id, r = this.live?.groups[n]?.precision ?? pe(e, t), i = this.live?.groups[n]?.lights ?? 0, a = this.hass?.states[Xe(n)], o = this.simLog?.blocked[n] ?? null, s = (this.simLog?.entries ?? []).filter((e) => e.group_id === n).sort((e, t) => t.t - e.t).slice(0, ja);
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
                .checked=${a?.state === "on"}
                .disabled=${a === void 0}
                title=${a === void 0 ? "No simulation switch for this group" : "Presence simulation"}
                @change=${(e) => this.onSim(n, e)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : T}
        ${o === null ? T : c`<div class="muted blocked">Blocked: ${o}</div>`}
        ${this.renderSensor("expected", "Expected", Ze(n), r)}
        ${this.renderSensor("anomaly", "Anomaly", Qe(n), r)}
        <div class="muted readiness">${this.readiness(e, n)}</div>
        ${s.length > 0 ? c`<ol class="log">
              ${s.map((e) => this.renderLogEntry(e))}
            </ol>` : c`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
	}
	renderSensor(e, t, n, r) {
		let i = this.hass?.states[n], a = i?.attributes.day_type, o = i?.state, s = o === void 0 ? NaN : Number(o), l = o === void 0 ? "—" : o.trim() !== "" && Number.isFinite(s) ? We(s, r) : o;
		return c`<div class="row ${e}">
      <span class="muted">${t}</span>
      <span class="value">${l}</span>
      ${typeof a == "string" ? c`<span class="muted">${a}</span>` : T}
    </div>`;
	}
	renderLogEntry(e) {
		return c`<li>
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
		return !e || !t || t.length === 0 ? c`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Ma(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
	}
};
w([E({ attribute: !1 })], H.prototype, "hass", void 0), w([E({ attribute: !1 })], H.prototype, "config", void 0), w([E({ attribute: !1 })], H.prototype, "path", void 0), w([E({ attribute: !1 })], H.prototype, "errors", void 0), w([E({ attribute: !1 })], H.prototype, "live", void 0), w([E({ attribute: !1 })], H.prototype, "profileState", void 0), w([E({ type: Boolean })], H.prototype, "statusOnly", void 0), w([E({ attribute: !1 })], H.prototype, "simLog", void 0), H = w([v("al-strip-controls")], H);
//#endregion
//#region src/al-patterns.ts
var Na = 50;
function Pa(e) {
	let t = [], n = (r) => {
		t.push({
			id: r.id,
			label: r.name ?? r.id,
			precision: e ? pe(e, r) : 0
		}), r.children.forEach(n);
	};
	return e?.groups.forEach(n), t;
}
function Fa(e, t) {
	if (e === void 0) return "—";
	let n = Number(e);
	return e.trim() !== "" && Number.isFinite(n) ? We(n, t) : e;
}
var Ia = (e) => (/* @__PURE__ */ new Date(e * 1e3)).toLocaleDateString(), La = class extends i {
	constructor(...e) {
		super(...e), this.profileState = null, this.simLog = null, this.force = !1;
	}
	static {
		this.styles = [x, _`
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
		this.dispatchEvent(yn(this.force));
	}
	renderStatus() {
		let e = this.profileState;
		if (!e) return c`<div class="status muted">Profile not loaded yet.</div>`;
		let { producer: t, generated_at: n, training_window: r, day_types: i, slot_minutes: a } = e.profile;
		return c`
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
          <span class="window">${Ia(r[0])} – ${Ia(r[1])}</span>
        </div>
        <div class="muted">${i.join(", ")} · ${a}-minute slots</div>
      </div>
    `;
	}
	renderReadiness() {
		let e = this.profileState, t = Pa(this.config);
		if (!e || t.length === 0) return c`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
		let n = this.config?.defaults.patterns?.min_days ?? 14;
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
          ${t.map((t) => this.renderRow(t, e, n))}
        </tbody>
      </table>
    `;
	}
	renderRow(e, t, n) {
		let r = t.ready[e.id] === !0, i = t.profile.groups[e.id]?.days ?? 0, a = this.hass?.states[Ze(e.id)]?.state;
		return c`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${r ? "yes" : "no"}" title=${r ? "Ready" : `Needs ${n} days`}>
        ${r ? "✓" : "✗"}
      </td>
      <td class="days">${i}</td>
      <td class="expected">${Fa(a, e.precision)}</td>
    </tr>`;
	}
	renderBlocked() {
		let e = Object.entries(this.simLog?.blocked ?? {}).filter((e) => typeof e[1] == "string");
		if (e.length === 0) return T;
		let t = Pa(this.config), n = (e) => t.find((t) => t.id === e)?.label ?? e;
		return c`<ul class="blocked">
      ${e.map(([e, t]) => c`<li><span class="group">${n(e)}:</span> <span>${t}</span></li>`)}
    </ul>`;
	}
	renderLog() {
		let e = [...this.simLog?.entries ?? []].sort((e, t) => t.t - e.t).slice(0, Na);
		return e.length === 0 ? c`<div class="muted log-empty">No simulated light changes yet.</div>` : c`<ol class="log">
      ${e.map((e) => this.renderEntry(e))}
    </ol>`;
	}
	renderEntry(e) {
		return c`<li>
      <span class="muted">${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</span>
      <span class="entity">${e.entity_id}</span>
      <span class="state">${e.on ? "on" : "off"}</span>
      ${e.brightness === null ? T : c`<span class="muted">${e.brightness}</span>`}
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
w([E({ attribute: !1 })], La.prototype, "hass", void 0), w([E({ attribute: !1 })], La.prototype, "config", void 0), w([E({ attribute: !1 })], La.prototype, "profileState", void 0), w([E({ attribute: !1 })], La.prototype, "simLog", void 0), w([b()], La.prototype, "force", void 0), La = w([v("al-patterns")], La);
//#endregion
//#region src/types.ts
var Ra = [
	"phone",
	"watch",
	"tag",
	"laptop",
	"other"
], za = [
	"activity",
	"steps",
	"battery_state"
], Ba = {
	phone: "mdi:cellphone",
	watch: "mdi:watch",
	tag: "mdi:tag",
	laptop: "mdi:laptop",
	other: "mdi:bluetooth"
}, Va = {
	phone: "Phone",
	watch: "Watch",
	tag: "Tag",
	laptop: "Laptop",
	other: "Other"
}, Ha = {
	activity: "Activity",
	steps: "Steps",
	battery_state: "Battery state"
}, Ua = { entity: { filter: {
	domain: "device_tracker",
	integration: "bermuda"
} } }, Wa = { entity: { filter: { domain: "person" } } }, Ga = { entity: { filter: {
	domain: "device_tracker",
	integration: "mobile_app"
} } }, Ka = { entity: { filter: { domain: "sensor" } } }, qa = { select: {
	mode: "dropdown",
	options: Ra.map((e) => ({
		value: e,
		label: Va[e]
	}))
} }, Ja = class extends i {
	constructor(...e) {
		super(...e), this.errors = [], this.presence = null;
	}
	static {
		this.styles = [
			x,
			ke,
			_`
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
		return this.config ? C(this.config).people : [];
	}
	emit(e, t, n = !1) {
		let r = this.config;
		if (!r) return;
		let i = {
			...C(r),
			people: e
		}, a = y(r, ["presence"], i);
		this.dispatchEvent(n ? P(a, void 0, !0) : P(a, `presence:people:${t}`));
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
		this.emit([...this.people, oe()], "add", !0);
	}
	removePerson(e) {
		this.emit(this.people.filter((t, n) => n !== e), "remove", !0);
	}
	addDevice(e) {
		let t = this.people[e];
		t && this.editPerson(e, { devices: [...t.devices, r("")] }, "add-device");
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
		let o = Object.values(this.presence?.people ?? {}).flatMap((e) => Object.values(e.devices ?? {})).find((e) => e.tracker === n.tracker)?.signals[r], s = i === null ? T : i[r] ? c`<ha-icon class="found" icon="mdi:check-circle-outline" title="Found"></ha-icon>` : n.signals[r] || o ? c`<ha-icon class="missing" icon="mdi:alert-circle-outline" title="Configured but unavailable"></ha-icon>` : c`<span class="muted" title="Optional: no sensor configured or discovered">Optional</span>`;
		return c`<div class="signal signal-${r}">
      <ha-selector
        .hass=${this.hass}
        .selector=${Ka}
        .label=${Ha[r]}
        .helper=${n.companion ? "Blank: found on the companion device when available." : "Optional. Movement can also be detected from Bluetooth."}
        .required=${!1}
        .value=${this.text(n.signals[r])}
        @value-changed=${(i) => this.editDevice(e, t, { signals: {
			...n.signals,
			[r]: i.detail.value ? i.detail.value : null
		} }, r)}
      ></ha-selector>
      ${s}
      ${a[r] ? c`<div class="error">${a[r]}</div>` : T}
    </div>`;
	}
	renderDevice(e, t, n, r) {
		let i = N(this.errors, [
			"presence",
			"people",
			e,
			"devices",
			t
		]), a = N(this.errors, [
			"presence",
			"people",
			e,
			"devices",
			t,
			"signals"
		]), o = this.found(n, r), s = Object.values(this.presence?.people?.[n.name ?? ""]?.devices ?? {}).find((e) => e.tracker === r.tracker), l = r.name ?? s?.name ?? (r.tracker || "New device");
		return c`<details class="device" ?open=${!r.tracker || Object.keys(i).length > 0 || Object.keys(a).length > 0}>
      <summary>${l}${l === Va[r.kind] ? T : c`<span class="device-kind">${Va[r.kind]}</span>`}</summary>
      <div class="device-body"><div class="device-head">
        <div class="resource-links">${jn(this, this.hass, r.tracker, "Open tracker", s?.device_id, "Open Bermuda device", !0)}</div>
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
          .selector=${Ua}
          .label=${"Bermuda tracker"}
          .required=${!0}
          .value=${r.tracker}
          @value-changed=${(n) => this.editDevice(e, t, { tracker: n.detail.value ?? "" }, "tracker")}
        ></ha-selector>
        ${i.tracker ? c`<div class="error">${i.tracker}</div>` : T}
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
          .selector=${qa}
          .label=${"Kind"}
          .required=${!0}
          .value=${r.kind}
          @value-changed=${(n) => this.editDevice(e, t, { kind: n.detail.value ?? "other" }, "kind")}
        ></ha-selector>
        <ha-selector
          class="companion"
          .hass=${this.hass}
          .selector=${Ga}
          .label=${"Companion app tracker"}
          .helper=${"Optional. The companion tracker for this device supplies carrying evidence."}
          .required=${!1}
          .value=${this.text(r.companion)}
          @value-changed=${(n) => this.editDevice(e, t, { companion: n.detail.value ? n.detail.value : null }, "companion")}
        ></ha-selector>
        ${za.map((n) => this.renderSignal(e, t, r, n, o, a))}
      </div></div>
    </details>`;
	}
	renderPerson(e, t) {
		let n = N(this.errors, [
			"presence",
			"people",
			e
		]);
		return c`<div class="person">
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
        ${n.name ? c`<div class="error">${n.name}</div>` : T}
        <ha-selector
          class="person-entity"
          .hass=${this.hass}
          .selector=${Wa}
          .label=${"Person"}
          .helper=${"Its device_trackers seed the devices below: Bermuda ones to follow, a mobile_app one as the companion."}
          .required=${!1}
          .value=${this.text(t.person)}
          @value-changed=${(t) => this.editPerson(e, { person: t.detail.value ? t.detail.value : null }, "person")}
        ></ha-selector>
        ${n.person ? c`<div class="error">${n.person}</div>` : T}
      </div>
      ${t.devices.map((n, r) => this.renderDevice(e, r, t, n))}
      <button type="button" class="add-device" @click=${() => this.addDevice(e)}>Add device</button>
    </div>`;
	}
	render() {
		if (!this.config) return T;
		let e = this.people;
		return c`
      ${e.length === 0 ? c`<div class="empty">Nobody is followed yet. Add a person and pick their person entity.</div>` : T}
      ${e.map((e, t) => this.renderPerson(t, e))}
      <button type="button" class="add-person" @click=${() => this.addPerson()}>Add person</button>
    `;
	}
};
w([E({ attribute: !1 })], Ja.prototype, "hass", void 0), w([E({ attribute: !1 })], Ja.prototype, "config", void 0), w([E({ attribute: !1 })], Ja.prototype, "errors", void 0), w([E({ attribute: !1 })], Ja.prototype, "presence", void 0), Ja = w([v("al-people-editor")], Ja);
function Ya(e) {
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
function Xa(e, t) {
	if (e === 0 && t === 0) return 0;
	let n = e === 0 ? Infinity : 60 / Math.abs(e), r = t === 0 ? Infinity : 27 / Math.abs(t);
	return Math.min(n, r, .5);
}
function Za(e, t) {
	let n = new Set(t.nodes), r = new Set(t.exits), i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let t of Ya(e)) {
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
		let a = i.x - t.x, o = i.y - t.y, s = Xa(a, o);
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
var Qa = (e, t) => ({
	x: e.x1 + (e.x2 - e.x1) * t,
	y: e.y1 + (e.y2 - e.y1) * t
}), $a = (e, t, n) => e.edges.find((e) => e.a === t && e.b === n || e.a === n && e.b === t);
function eo(e, t) {
	let n = [];
	for (let r = 1; r < t.length; r++) {
		let i = $a(e, t[r - 1], t[r]);
		i && n.push(i);
	}
	return n;
}
//#endregion
//#region src/al-presence.ts
var to = 2e3, no = "away", ro = {
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
}, io = {
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
}, ao = [
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
], oo = [
	"charging",
	"moving",
	"still_room_empty",
	"jitter"
], so = [
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
], co = (e) => {
	if (e === "activity_floor") return "presence/activity/floor";
	if (e.startsWith("carried_")) {
		let t = e.slice(8);
		return `presence/carried/${oo.includes(t) ? "weights/" : ""}${t}`;
	}
	return `presence/${e}`;
}, lo = { entity: {
	multiple: !0,
	filter: {
		domain: "device_tracker",
		integration: "bermuda"
	}
} }, uo = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, fo = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "slider"
} }, po = { number: {
	min: 0,
	max: .1,
	step: .001,
	mode: "box"
} }, mo = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, ho = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, go = { duration: {} }, _o = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, vo = { number: {
	min: -10,
	max: 10,
	step: .5,
	mode: "box"
} }, yo = " → ", bo = "Give it an area that matches a room, or map it in Settings below.", xo = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", U = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, W = class extends i {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, this.correctionPending = !1, this.correctionError = null, this.notice = null, this.computeLabel = (e) => ro[e.name] ?? e.name, this.computeHelper = (e) => io[e.name] ?? "", this.onDevicesChanged = (e) => {
			e.stopPropagation();
			let t = this.config;
			if (!t) return;
			let n = C(t), r = {
				...n,
				people: this.mergePeople(e.detail?.value, n.people)
			};
			this.dispatchEvent(P(y(t, ["presence"], r), "presence:people"));
		};
	}
	static {
		this.styles = [
			x,
			ke,
			_`
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
		}, to);
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
			this.topology = await ye(e);
		} catch {}
	}
	async refreshPresence() {
		let e = this.hass;
		if (e) try {
			this.presence = await Pe(e);
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
			await De(n, e, r), this.notice = r.device ? "Device correction saved." : r.room ? `Moved ${e} to ${this.roomName(r.room)}.` : "Automatic estimate restored.", this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, await this.refreshPresence();
		} catch (e) {
			let t = e && typeof e == "object" && "message" in e ? String(e.message) : String(e);
			this.correctionError = `Could not save correction: ${t}`;
		} finally {
			this.correctionPending = !1;
		}
	}
	correctionStatus(e) {
		if (!e) return T;
		let t = typeof e.value == "boolean" ? e.value ? "Carrying" : "Not carrying" : this.roomName(e.value), n = e.reason.replaceAll("_", " ");
		return c`<div class="hint correction-status" role="status">${t} — ${n}
      (${Math.round(e.strength * 100)}%) · <time datetime=${(/* @__PURE__ */ new Date(e.t * 1e3)).toISOString()}>${(/* @__PURE__ */ new Date(e.t * 1e3)).toLocaleTimeString()}</time></div>`;
	}
	get correctionRooms() {
		let e = this.config;
		return [...this.topology?.nodes ?? (e ? [...l(e)] : []), no];
	}
	get labels() {
		let e = this.config;
		return new Map(e ? Ya(e).map((e) => [e.id, e.label]) : []);
	}
	roomName(e) {
		return e == null || e === "" ? "—" : e === no ? "Away" : this.labels.get(e) ?? e;
	}
	areaName(e) {
		return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
	}
	trail(e) {
		return e.map((e) => this.roomName(e)).join(yo);
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
					options: Ur(e)
				} }
			},
			{
				name: "threshold",
				selector: fo
			},
			{
				name: "stay",
				selector: uo
			},
			{
				name: "escape",
				selector: po
			},
			{
				name: "scale",
				selector: mo
			},
			{
				name: "floor",
				selector: ho
			},
			{
				name: "stuck_after",
				selector: go
			},
			{
				name: "activity_floor",
				selector: ho
			},
			{
				name: "carried_prior",
				selector: _o
			},
			{
				name: "carried_flip",
				selector: go
			},
			{
				name: "carried_recent",
				selector: go
			},
			{
				name: "carried_nearby",
				selector: _o
			},
			...oo.map((e) => ({
				name: `carried_${e}`,
				selector: vo
			}))
		];
	}
	mergePeople(e, t) {
		if (!Array.isArray(e)) return [...t];
		let n = e.filter((e) => typeof e == "string"), i = t.filter((e) => e.devices.some((e) => n.includes(e.tracker))), a = new Set(i.flatMap((e) => e.devices.map((e) => e.tracker))), o = n.filter((e) => !a.has(e)).map((e) => ({
			...oe(),
			devices: [r(e)]
		}));
		return [...i, ...o];
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config;
		if (!t) return;
		let n = C(t), r = e.detail?.value ?? {}, i = {
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
			stuck_after: A(r.stuck_after) ?? n.stuck_after,
			activity: { floor: U(r.activity_floor) ?? n.activity.floor },
			carried: {
				prior: U(r.carried_prior) ?? n.carried.prior,
				flip: A(r.carried_flip) ?? n.carried.flip,
				recent: A(r.carried_recent) ?? n.carried.recent,
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
		}, s = ao.find((e) => !o(e));
		s !== void 0 && this.dispatchEvent(P(y(t, ["presence"], a), `presence:${s}`));
	}
	setSetting(e, t) {
		let n = this.config;
		if (!n) return;
		let r = {
			...C(n),
			[e]: t
		};
		this.dispatchEvent(P(y(n, ["presence"], r), `presence:${e}`));
	}
	renderSetup(e) {
		let t = this.presence?.bermuda === !0, n = C(e);
		return c`<ha-card class="setup" header="Room presence">
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
        .selector=${lo}
        .label=${ro.devices}
        .helper=${io.devices}
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
		return e.length === 0 ? c`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >` : c`<ha-card><h2>People</h2>
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
			this.correcting === e ? this.renderCorrection(e, t) : T,
			this.correctingDevice?.person === e ? this.renderDeviceCorrection(e, t) : T
		])}
        </tbody>
      </table></div>
      ${this.notice === null ? T : c`<div class="notice" role="status">${this.notice}</div>`}
    </ha-card>`;
	}
	renderCorrection(e, t) {
		let n = Object.entries(t.candidates).sort(([, e], [, t]) => t - e).map(([e]) => e);
		return c`<tr class="correct">
      <td colspan="6"><div class="correction-panel">
        <span class="question">Where is ${e}?</span>
        <div class="correction-fields">${Object.entries(t.devices ?? {}).map(([e, t]) => c`<label>${t.name}
          <select data-carrying=${e} ?disabled=${this.correctionPending} aria-label=${`Carrying ${t.name}`} .value=${String(this.carryingChoices[e] ?? "")}
            @change=${(t) => {
			let n = t.target.value, r = { ...this.carryingChoices };
			n === "" ? delete r[e] : r[e] = n === "true", this.carryingChoices = r;
		}}>
            <option value="">Keep estimate (${t.carried === null ? "unknown" : `${Math.round(t.carried * 100)}% carrying`})</option>
            <option value="true">Carrying</option><option value="false">Not carrying</option>
          </select></label>`)}</div>
        ${this.correctionError ? c`<div role="alert">${this.correctionError}</div>` : T}
        <div class="actions">${n.map((t) => c`<button type="button" class="candidate" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, t)}
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
          ${this.correctionRooms.map((e) => c`<option value=${e}>${this.roomName(e)}</option>`)}
        </select>
        <button type="button" class="automatic-person" ?disabled=${this.correctionPending} @click=${() => void this.correct(e, { clear: !0 })}>Use automatic estimate</button>
        <button type="button" class="cancel" @click=${() => this.correcting = null}>Close</button></div>
      </div></td>
    </tr>`;
	}
	renderPerson(e, t) {
		let n = Math.round(t.confidence * 100), r = Object.entries(t.devices ?? {}).sort(([e], [t]) => e.localeCompare(t));
		return c`<tr class="device person">
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
        ${t.moving ? c`<span class="chip moving">moving</span>` : T}
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
		let r = n.carried, i = r !== null && r < .5, a = r === null ? "—" : `${Math.round(r * 100)}%`, o = `${n.name} (${Va[n.kind]}): carried ${a}${i && n.room ? `, in ${this.roomName(n.room)}` : ""}`;
		return c`<div class="device-entry"><button type="button" aria-expanded=${this.correctingDevice?.person === e && this.correctingDevice.device === t ? "true" : "false"} aria-label=${`Correct ${n.name}`} @click=${() => {
			this.correctingDevice = {
				person: e,
				device: t
			}, this.correcting = null, this.correctionError = null;
		}} class="chip device-chip ${i ? "parked" : "carried"}" data-device=${t} title=${o}>
      <ha-icon icon=${Ba[n.kind] ?? Ba.other}></ha-icon>
      <span class="device-name">${n.name}</span>
      <span class="carried-pct">${a} carrying</span>
      ${i && n.room ? c`<span class="parked-room">${this.roomName(n.room)}</span>` : T}
    </button>${this.correctionStatus(n.correction)}${this.correctionStatus(n.carrying_correction)}</div>`;
	}
	renderDeviceCorrection(e, t) {
		let n = this.correctingDevice?.device, r = n ? t.devices[n] : void 0;
		return !n || !r ? T : c`<tr class="correct device-correction"><td colspan="6"><div class="correction-panel">
      <div class="question">${r.name}</div>
      <div class="resource-links">${jn(this, this.hass, r.tracker, "Open tracker", r.device_id, "Open Bermuda device", !0)}</div>
      <div class="correction-fields"><label>Device room <select aria-label="Device room" ?disabled=${this.correctionPending} @change=${(t) => {
			let r = t.target.value;
			r && this.correct(e, {
				device: n,
				room: r
			});
		}}><option value="">Choose a room…</option>${this.correctionRooms.map((e) => c`<option value=${e}>${this.roomName(e)}</option>`)}</select></label></div>
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
      ${this.correctionError ? c`<div role="alert">${this.correctionError}</div>` : T}
    </div></td></tr>`;
	}
	renderScanners() {
		let e = this.presence?.scanners ?? [], t = new Set(this.presence?.unmapped ?? []);
		return c`<ha-card><h2>Scanners</h2>
      ${e.length === 0 ? c`<div class="empty">No Bermuda scanners have been discovered.</div>` : c`<div class="table-scroll"><table>
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
		return c`<tr class="scanner ${t ? "unmapped" : ""}">
      <td class="name">${An("device", e.device_id, e.name)}</td>
      <td class="area">${An("area", e.area_id, this.areaName(e.area_id))}</td>
      <td class="room">${t ? bo : this.roomName(e.group_id)}</td>
    </tr>`;
	}
	renderDisabled() {
		let e = this.presence?.disabled ?? [];
		return e.length === 0 ? T : c`<div class="disabled-sensors">
      ${xo}
      <ul>
        ${e.map((e) => c`<li>${e}</li>`)}
      </ul>
    </div>`;
	}
	renderSettings(e) {
		let t = C(e), n = Object.fromEntries(ao.flatMap((e) => {
			let t = this.errors.find((t) => t.path === co(e));
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
			...Object.fromEntries(oo.map((e) => [`carried_${e}`, t.carried.weights[e]]))
		}, a = (t) => c`<ha-form
      class="presence-settings" data-section=${t.id}
      .hass=${this.hass}
      .data=${Object.fromEntries(t.fields.map((e) => [e, i[e]]))}
      .schema=${this.schemaFor(e).filter((e) => t.fields.includes(e.name))}
      .error=${n}
      .computeLabel=${this.computeLabel}
      .computeHelper=${this.computeHelper}
      @value-changed=${this.onFormChanged}
    ></ha-form>`, o = so[0];
		return c`<ha-card><details class="settings" ?open=${this.errors.some((e) => e.path.startsWith("presence"))}>
      <summary>Presence settings</summary><div class="settings-body">
      ${r.map((e) => c`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
      <section class="settings-section">
        <h3>People and devices</h3>
        <p>Choose who to follow and the devices they carry. Open a device to edit its trackers and signals.</p>
        <al-people-editor .hass=${this.hass} .config=${e} .errors=${this.errors} .presence=${this.presence}></al-people-editor>
      </section>
      <section class="settings-section">
        <h3>${o.title}</h3><p>${o.hint}</p>${a(o)}
      </section>
      <div class="settings-grid">
        ${so.slice(1).map((e) => c`<details class="settings-section" data-section=${e.id}
          ?open=${e.fields.some((e) => n[e] !== void 0)}>
          <summary>${e.title}</summary><p>${e.hint}</p>${a(e)}
        </details>`)}
      </div>
    </div></details></ha-card>`;
	}
	render() {
		let e = this.config;
		return e ? C(e).enabled ? c`<div class="page">
      ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : c`<div class="page">${this.renderSetup(e)}</div>` : c`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
	}
};
w([E({ attribute: !1 })], W.prototype, "hass", void 0), w([E({ attribute: !1 })], W.prototype, "config", void 0), w([E({ attribute: !1 })], W.prototype, "errors", void 0), w([E({ type: Boolean })], W.prototype, "narrow", void 0), w([b()], W.prototype, "topology", void 0), w([b()], W.prototype, "presence", void 0), w([b()], W.prototype, "correcting", void 0), w([b()], W.prototype, "correctingDevice", void 0), w([b()], W.prototype, "carryingChoices", void 0), w([b()], W.prototype, "correctionPending", void 0), w([b()], W.prototype, "correctionError", void 0), w([b()], W.prototype, "notice", void 0), W = w([v("al-presence")], W);
//#endregion
//#region src/al-graph-map.ts
var So = 60, Co = 27, wo = 2, To = 9, Eo = 7, G = (e) => String(Math.round(e * 10) / 10), Do = class extends i {
	constructor(...e) {
		super(...e), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
	}
	static {
		this.styles = [x, _`
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
		this.dispatchEvent(bn(e));
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
			let s = $a(e, a, o);
			s && t.push({
				name: r,
				...Qa(s, .5)
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
		return o`<line
      class="edge ${n ? "on-path" : ""}"
      data-one-way=${e.oneWay}
      x1=${G(e.x1)}
      y1=${G(e.y1)}
      x2=${G(e.x2)}
      y2=${G(e.y2)}
      marker-end=${e.oneWay ? "url(#al-arrow)" : T}
    ></line>`;
	}
	renderNode(e) {
		let t = this.occupantsOf(e.id), n = t.slice(0, wo), r = t.length - n.length, i = this.selected.includes(e.id), a = [...n, ...r > 0 ? [`+${r}`] : []].join(", "), s = [
			e.label,
			e.exit ? "an exit" : "",
			t.length > 0 ? `${t.length} here: ${t.join(", ")}` : "empty"
		].filter((e) => e !== "").join(", ");
		return o`<g
      class="node ${i ? "selected" : ""}"
      data-id=${e.id}
      role="button"
      tabindex="0"
      aria-pressed=${i ? "true" : "false"}
      aria-label=${s}
      @click=${() => this.select(e.id)}
      @keydown=${(t) => this.onKeydown(t, e.id)}
    >
      <rect
        class="box"
        x=${G(e.x - So)}
        y=${G(e.y - Co)}
        width=${120}
        height=${54}
        rx="8"
      ></rect>
      <text class="label" x=${G(e.x)} y=${G(e.y - 4)} text-anchor="middle">${e.label}</text>
      ${a === "" ? T : o`<text class="names" x=${G(e.x)} y=${G(e.y + 13)} text-anchor="middle">${a}</text>`}
      ${t.length === 0 ? T : this.renderBadge(e, t.length)}
      ${e.exit ? this.renderDoor(e) : T}
    </g>`;
	}
	renderBadge(e, t) {
		let n = e.x + So - To - 3, r = e.y - Co + To + 3;
		return o`<circle class="badge" cx=${G(n)} cy=${G(r)} r=${To}></circle>
      <text class="count" x=${G(n)} y=${G(r + 3.5)} text-anchor="middle">${t}</text>`;
	}
	renderDoor(e) {
		let t = e.x - So + 7, n = e.y + Co - 7;
		return o`<path class="door" d=${`M ${G(t)} ${G(n)} v -14 h 10 v 14 z`}></path>`;
	}
	renderPerson(e) {
		return o`<circle class="person" data-name=${e.name} cx=${G(e.x)} cy=${G(e.y)} r=${Eo}>
      <title>${e.name} is on the move</title>
    </circle>`;
	}
	render() {
		let e = this.config, t = this.topology;
		if (!e || !t || t.nodes.length === 0) return c`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
		let n = Za(e, t), r = new Set(this.paths.flatMap((e) => eo(n, e))), i = this.summary(n);
		return c`
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
w([E({ attribute: !1 })], Do.prototype, "hass", void 0), w([E({ attribute: !1 })], Do.prototype, "config", void 0), w([E({ attribute: !1 })], Do.prototype, "topology", void 0), w([E({ attribute: !1 })], Do.prototype, "presence", void 0), w([E({ attribute: !1 })], Do.prototype, "selected", void 0), w([E({ attribute: !1 })], Do.prototype, "paths", void 0), Do = w([v("al-graph-map")], Do);
//#endregion
//#region src/al-paths.ts
var K = class extends i {
	constructor(...e) {
		super(...e), this.narrow = !1, this.topology = null, this.selected = [null, null], this.paths = [], this.pending = !1, this.error = null, this.loading = !1, this.pathSeq = 0, this.topologySeq = 0;
	}
	static {
		this.styles = [
			x,
			ke,
			_`
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
			let t = await ye(this.hass);
			e === this.topologySeq && (this.topology = t);
		} catch {
			e === this.topologySeq && (this.error = "Could not load room connections. Try again.");
		} finally {
			e === this.topologySeq && (this.loading = !1);
		}
	}
	roomName(e) {
		return this.config ? Ya(this.config).find((t) => t.id === e)?.label ?? e : e;
	}
	async select(e) {
		let t = this.selected.filter((e) => e !== null), n = t.includes(e) ? t.filter((t) => t !== e) : [...t, e].slice(-2);
		this.selected = [n[0] ?? null, n[1] ?? null], this.paths = [], this.error = null;
		let r = ++this.pathSeq, [i, a] = this.selected;
		if (this.pending = !1, !(!this.hass || !i || !a)) {
			this.pending = !0;
			try {
				let e = await xe(this.hass, i, a);
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
			let n = this.selected[0] === e.id ? "From" : this.selected[1] === e.id ? "To" : "", r = e.name ?? e.id, i = c`<button class="room" type="button" data-room=${e.id}
        aria-pressed=${n ? "true" : "false"} @click=${(t) => {
				t.preventDefault(), t.stopPropagation(), this.select(e.id);
			}}>
        <span>${r}</span><span class="endpoint">${n}</span>
      </button>`;
			return e.children.length ? c`<details open>
        <summary>${t.has(e.id) ? i : r}</summary>
        <div class="branch">${this.renderTree(e.children, t)}</div>
      </details>` : t.has(e.id) ? i : c``;
		});
	}
	renderRoutes() {
		let [e, t] = this.selected;
		if (!e || !t) return c`<div class="paths">Select two rooms in the tree or map to see their routes.</div>`;
		let n = `${this.roomName(e)} → ${this.roomName(t)}`;
		return c`<div class="paths" role="status">
      ${this.pending ? `Finding routes from ${n}…` : this.error ? T : c`
        <div>${this.paths.length ? `${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${n}` : `No route from ${n}`}</div>
        <ol>${this.paths.map((e) => c`<li>${e.map((e) => this.roomName(e)).join(" → ")}</li>`)}</ol>
      `}
    </div>`;
	}
	render() {
		return c`<div class="page ${this.narrow ? "narrow" : ""}">
      ${this.error ? c`<ha-alert alert-type="error">${this.error}
        ${this.topology ? T : c`<button type="button" @click=${() => void this.refreshTopology()}>Retry</button>`}
      </ha-alert>` : T}
      <div class="paths-layout">
        <ha-card><h2>Rooms</h2><nav class="room-tree" aria-label="Room hierarchy">
          ${this.loading ? c`<p role="status">Loading rooms…</p>` : this.topology && this.config ? this.renderTree(this.config.groups, new Set(this.topology.nodes)) : T}
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
w([E({ attribute: !1 })], K.prototype, "hass", void 0), w([E({ attribute: !1 })], K.prototype, "config", void 0), w([E({ type: Boolean })], K.prototype, "narrow", void 0), w([b()], K.prototype, "topology", void 0), w([b()], K.prototype, "selected", void 0), w([b()], K.prototype, "paths", void 0), w([b()], K.prototype, "pending", void 0), w([b()], K.prototype, "error", void 0), w([b()], K.prototype, "loading", void 0), K = w([v("al-paths")], K);
//#endregion
//#region src/yaml-locate.ts
var Oo = /^(?:"([^"]*)"|'([^']*)'|([^\s"'#][^:]*?))\s*:(?:\s|$)/, ko = (e) => e.dash >= 0 ? e.dash : e.indent;
function Ao(e) {
	let t = Oo.exec(e);
	return t ? t[1] ?? t[2] ?? t[3] ?? null : null;
}
function jo(e) {
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
function Mo(e, t, n, r) {
	for (let i = t + 1; i < n; i++) if (ko(e[i]) <= r) return i;
	return n;
}
function No(e, t, n, r) {
	if (t >= n) return -1;
	let i = e[t].indent;
	for (let a = t; a < n; a++) {
		let t = e[a];
		if (t.indent === i && Ao(t.text) === r) return a;
	}
	return -1;
}
function Po(e, t, n, r) {
	if (t >= n || e[t].dash < 0) return -1;
	let i = e[t].dash, a = -1;
	for (let o = t; o < n; o++) if (e[o].dash === i && ++a === r) return o;
	return -1;
}
function Fo(e, t) {
	let n = t.split("/").filter((e) => e !== "");
	if (n.length === 0) return null;
	let r = jo(e), i = 0, a = r.length, o = null;
	for (let e of n) {
		let t = /^\d+$/.test(e) ? Po(r, i, a, Number(e)) : No(r, i, a, e);
		if (t < 0) return o;
		let n = r[t];
		o = n.line, a = Mo(r, t, a, ko(n)), i = n.dash >= 0 ? t : t + 1;
	}
	return o;
}
var q = class extends i {
	constructor(...e) {
		super(...e), this.errors = [], this.available = !0, this.parseError = null, this.seq = 0, this.validating = !1, this.validationFailure = null, this.onYaml = (e) => {
			e.stopPropagation(), window.clearTimeout(this.timer), this.seq++, this.validating = !0, this.validationFailure = null, this.dispatchEvent(cn(!1, []));
			let t = e.detail;
			this.timer = window.setTimeout(() => void this.settle(t), 400);
		};
	}
	static {
		this.styles = [x, _`
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
			this.validating = !1, this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(cn(!1, []));
			return;
		}
		this.parseError = null;
		let t = e.value;
		this.mine = t, this.dispatchEvent(P(t, "code")), await this.validate(t);
	}
	async validate(e) {
		let t = ++this.seq;
		this.validating = !0, this.validationFailure = null, this.dispatchEvent(cn(!1, []));
		try {
			if (!this.hass || !e) throw Error("No configuration or connection available.");
			let n = await Je(this.hass, e);
			if (t !== this.seq) return;
			this.validating = !1, this.dispatchEvent(cn(n.ok, n.errors));
		} catch {
			if (t !== this.seq) return;
			this.validating = !1, this.validationFailure = "Could not validate this document. Edit again to retry; Save remains disabled.", this.dispatchEvent(cn(!1, []));
		}
	}
	jump(e) {
		let t = this.editor, n = t?.codemirror, r = t?.yaml;
		if (!n || typeof r != "string") return;
		let i = Fo(r, e);
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
		return this.parseError === null ? this.validationFailure ? c`<ha-alert alert-type="error">${this.validationFailure}</ha-alert>` : this.validating ? c`<p class="muted">Validating…</p>` : this.errors.length === 0 ? c`<p class="muted no-problems">No problems. Save applies this document.</p>` : c`
      <p class="count muted">
        ${this.errors.length} ${this.errors.length === 1 ? "problem" : "problems"} — Save is
        disabled until they are fixed.
      </p>
      <ul class="errors">
        ${this.errors.map((e) => c`<li>
            <button type="button" class="jump" @click=${() => this.jump(e.path)}>
              <span class="path">${e.path === "" ? "(document)" : e.path}</span> —
              <span class="message">${e.message}</span>
            </button>
          </li>`)}
      </ul>
    ` : c`<ha-alert class="parse-error" alert-type="error">${this.parseError}</ha-alert>`;
	}
	renderUnavailable() {
		return c`<ha-card header="Code">
      <ha-alert class="editor-missing" alert-type="warning">
        Home Assistant's YAML editor did not load, so this tab cannot open. Visit
        <em>Settings → Devices &amp; services</em> once and reload the page; the other tabs edit the
        same configuration in the meantime.
      </ha-alert>
    </ha-card>`;
	}
	render() {
		return this.available ? c`
      <div class="page">
        <ha-card header="Configuration">
          <ha-yaml-editor @value-changed=${this.onYaml}></ha-yaml-editor>
          ${this.config === void 0 ? T : this.renderProblems()}
        </ha-card>
      </div>
    ` : c`<div class="page">${this.renderUnavailable()}</div>`;
	}
};
w([E({ attribute: !1 })], q.prototype, "hass", void 0), w([E({ attribute: !1 })], q.prototype, "config", void 0), w([E({ attribute: !1 })], q.prototype, "errors", void 0), w([E({ type: Boolean })], q.prototype, "available", void 0), w([b()], q.prototype, "parseError", void 0), w([b()], q.prototype, "validating", void 0), w([b()], q.prototype, "validationFailure", void 0), q = w([v("al-code")], q);
//#endregion
//#region src/floorplan-import.ts
var Io = (e) => e.trim().toLocaleLowerCase();
function Lo(e, t) {
	let r = n(e).map(({ group: e }) => e), i = {}, a = /* @__PURE__ */ new Map();
	for (let e of t.items) {
		let t = e.source_id ? r.filter((t) => t.id === e.source_id) : [], n = t.length ? t : r.filter((t) => Io(t.name ?? t.id) === Io(e.name)), o = n.length === 1 ? n[0] : void 0;
		i[e.key] = o ? {
			action: "existing",
			id: o.id
		} : { action: "skip" }, o && a.set(o.id, (a.get(o.id) ?? 0) + 1);
	}
	for (let [e, t] of Object.entries(i)) t.action === "existing" && a.get(t.id) > 1 && (i[e] = { action: "skip" });
	return i;
}
function Ro(e, t, r) {
	let i = new Set(n(e).map(({ group: e }) => e.id));
	Object.values(r).forEach((e) => {
		e.action === "create" && i.add(e.id);
	});
	let a = (t.source_id ?? t.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
	/^[a-z]/.test(a) || (a = `group_${a || "imported"}`);
	let o = a;
	for (let e = 2; i.has(o); e++) o = `${a}_${e}`;
	return {
		action: "create",
		id: o,
		name: t.name,
		kind: t.kind,
		parent: null
	};
}
function zo(e, t, r, i) {
	let a = structuredClone(e), o = new Map(n(a).map(({ group: e }) => [e.id, e])), s = new Map(t.items.map((e) => [e.key, e])), c = [], l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set();
	for (let [e, t] of Object.entries(r)) {
		if (!s.has(e)) throw Error("Source changed. Parse the configuration again.");
		if (t.action === "create") {
			if (!/^[a-z][a-z0-9_]*$/.test(t.id) || o.has(t.id) || f.has(t.id)) throw Error(`${s.get(e).name}: choose an unused ID with lowercase letters, digits and underscores.`);
			if (!t.name.trim()) throw Error("New groups need a name.");
			f.add(t.id);
		}
	}
	let p = (e) => {
		let t = d.get(e);
		if (t) return t;
		if (u.has(e)) throw Error("New group parents form a cycle.");
		let n = r[e];
		if (n?.action !== "create") throw Error("Choose an explicitly created group as the new parent.");
		u.add(e);
		let i;
		if (n.parent) {
			if (i = "id" in n.parent ? o.get(n.parent.id) : p(n.parent.key), !i) throw Error(`${n.name}: the selected parent no longer exists.`);
		} else if (n.kind !== "property") throw Error(`${n.name}: select a parent for this ${n.kind}.`);
		if (!Ne(i?.kind ?? null).includes(n.kind)) throw Error(`${i?.name ?? i?.id ?? "Root"} cannot contain a ${n.kind}.`);
		let s = {
			...ae(n.id, n.kind),
			name: n.name.trim()
		};
		return (i?.children ?? a.groups).push(s), d.set(e, s), u.delete(e), s;
	};
	for (let e of t.items) {
		let t = r[e.key];
		if (!t || t.action === "skip") continue;
		let n = t.action === "create" ? p(e.key) : o.get(t.id);
		if (!n) throw Error(`${e.name}: selected group no longer exists.`);
		if (l.has(n.id)) throw Error(`${n.name ?? n.id} is mapped more than once.`);
		l.add(n.id);
		let i = n.name ?? n.id;
		if (e.points && (n.points = structuredClone(e.points), delete n.bounds), e.bounds && (n.bounds = structuredClone(e.bounds)), t.action === "create") {
			let e = t.parent, r = e ? "id" in e ? o.get(e.id)?.name ?? e.id : d.get(e.key)?.name : "root";
			c.push(`Create ${t.kind} “${i}” (${n.id}) under ${r}.`);
		} else if (e.points || e.bounds) {
			let t = e.points && !e.bounds ? "; clear previous vertical bounds" : "";
			c.push(`Update geometry: ${e.context ? `${e.context} / ` : ""}${e.name} → ${i} (${n.id})${t}.`);
		}
	}
	return i && t.gps && (a.gps = structuredClone(t.gps), c.push(`${e.gps ? "Replace" : "Add"} GPS origin.`)), {
		config: c.length ? a : e,
		summary: c,
		created: d.size > 0
	};
}
//#endregion
//#region src/al-floorplan-import.ts
var Bo = 1e6, Vo = (e) => typeof e == "object" && e && "message" in e ? String(e.message) : "Import failed. Try again.", J = class extends i {
	constructor(...e) {
		super(...e), this.disabled = !1, this.text = "", this.source = null, this.choices = {}, this.importGps = !1, this.busy = null, this.error = "", this.notice = "", this.sequence = 0;
	}
	static {
		this.styles = [x, _`
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
		if (n.size > Bo) {
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
		if (this.resetPreview(), this.text.length > Bo) {
			this.error = "Paste is too large (maximum 1 MB of text).";
			return;
		}
		let e = this.sequence, t = this.config;
		this.busy = "parse";
		try {
			let n = await Ie(this.hass, this.text);
			if (e !== this.sequence || !this.isConnected) return;
			if (this.config !== t) {
				this.error = "The draft changed. Parse again to review matches.";
				return;
			}
			this.source = n, this.snapshot = t, this.choices = Lo(t, n);
		} catch (t) {
			e === this.sequence && (this.error = Vo(t));
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
		this.choose(e.key, n === "create" ? Ro(this.config, e, this.choices) : n === "skip" ? { action: "skip" } : {
			action: "existing",
			id: n.slice(9)
		});
	}
	preview() {
		if (!this.config || !this.source) return {};
		try {
			return { result: zo(this.config, this.source, this.choices, this.importGps) };
		} catch (e) {
			return { error: Vo(e) };
		}
	}
	async apply() {
		if (!this.hass || this.disabled || this.busy || this.config !== this.snapshot) return;
		let { result: e } = this.preview();
		if (!e?.summary.length) return;
		let t = ++this.sequence, n = this.config;
		this.busy = "apply", this.error = "";
		try {
			let r = await Je(this.hass, e.config);
			if (t !== this.sequence || this.config !== n || !this.isConnected || this.disabled) return;
			if (!r.ok) {
				this.error = r.errors.map((e) => `${e.path}: ${e.message}`).join("; ") || "Configuration validation failed.";
				return;
			}
			this.resetPreview(), this.notice = "Import applied to the draft. Use Save to persist it, or Undo to revert the import.", this.dispatchEvent(P(e.config, void 0, e.created ? !0 : void 0));
		} catch (e) {
			t === this.sequence && (this.error = Vo(e));
		} finally {
			t === this.sequence && (this.busy = null);
		}
	}
	renderCreation(t, r) {
		let i = this.disabled || this.busy === "apply", a = n(this.config).map(({ group: e }) => e), o = r.parent ? "id" in r.parent ? `existing:${r.parent.id}` : `new:${r.parent.key}` : "";
		return c`<div class="creation">
      <label>Name <input .value=${r.name} ?disabled=${i}
        @input=${(e) => this.choose(t.key, {
			...r,
			name: e.target.value
		})}></label>
      <label>ID <input .value=${r.id} ?disabled=${i}
        @input=${(e) => this.choose(t.key, {
			...r,
			id: e.target.value
		})}></label>
      <label>Kind <select .value=${r.kind} ?disabled=${i}
        @change=${(e) => this.choose(t.key, {
			...r,
			kind: e.target.value,
			parent: null
		})}>
        ${e.map((e) => c`<option value=${e} .selected=${r.kind === e}>${S[e].label}</option>`)}
      </select></label>
      <label>Parent <select class="parent" .value=${o} ?disabled=${i}
        @change=${(e) => {
			let n = e.target.value;
			this.choose(t.key, {
				...r,
				parent: n ? n.startsWith("existing:") ? { id: n.slice(9) } : { key: n.slice(4) } : null
			});
		}}>
        <option value="" .selected=${o === ""}>${r.kind === "property" ? "Root of configuration" : "Choose a parent…"}</option>
        ${a.filter((e) => Ne(e.kind).includes(r.kind)).map((e) => c`<option value=${`existing:${e.id}`} .selected=${o === `existing:${e.id}`}>${e.name ?? e.id} (${e.id})</option>`)}
        ${Object.entries(this.choices).filter(([e, n]) => e !== t.key && n.action === "create" && Ne(n.kind).includes(r.kind)).map(([e, t]) => c`<option value=${`new:${e}`} .selected=${o === `new:${e}`}>New: ${t.name} (${t.id})</option>`)}
      </select></label>
    </div>`;
	}
	renderItem(e) {
		let t = this.choices[e.key] ?? { action: "skip" }, r = t.action === "existing" ? `existing:${t.id}` : t.action;
		return c`<fieldset class="mapping" data-key=${e.key}>
      <legend>${e.context ? `${e.context} / ` : ""}${e.name} · ${S[e.kind].label}</legend>
      <p class="muted">${e.points ? `${e.points.length} outline vertices. ` : ""}
        ${e.bounds ? `Elevation ${e.bounds[0][2]}–${e.bounds[1][2]} m.` : "No vertical bounds supplied."}</p>
      <label>Destination <select class="destination" .value=${r} ?disabled=${this.disabled || this.busy === "apply"}
        @change=${(t) => this.destination(e, t)}>
        <option value="skip" .selected=${r === "skip"}>Skip</option>
        <option value="create" .selected=${r === "create"}>Create new group…</option>
        ${n(this.config).map(({ group: e }) => c`<option value=${`existing:${e.id}`} .selected=${r === `existing:${e.id}`}>
          ${e.name ?? e.id} (${e.id}) · ${S[e.kind].label}
        </option>`)}
      </select></label>
      ${t.action === "create" ? this.renderCreation(e, t) : T}
    </fieldset>`;
	}
	render() {
		let e = this.preview(), t = this.disabled || this.busy === "apply";
		return c`
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
      ${this.error ? c`<p class="error" role="alert">${this.error}</p>` : T}
      ${this.notice ? c`<p role="status">${this.notice}</p>` : T}
      ${this.source ? c`
        <h3>Review mappings</h3>
        <p>Matches are suggestions. Unmatched entries are skipped. Creating a group is always an explicit choice.</p>
        ${this.source.gps ? c`<label class="check"><input id="gps" type="checkbox" .checked=${this.importGps}
          ?disabled=${t} @change=${(e) => {
			this.importGps = e.target.checked, this.error = "";
		}}>
          ${this.config?.gps ? "Replace" : "Import"} GPS origin (${this.source.gps.latitude}, ${this.source.gps.longitude})
        </label>` : T}
        ${this.source.items.map((e) => this.renderItem(e))}
        <section class="summary" aria-label="Import changes">
          <h3>Changes to apply</h3>
          ${e.error ? c`<p class="error" role="alert">${e.error}</p>` : c`
            <ul>${e.result?.summary.map((e) => c`<li>${e}</li>`)}</ul>
            ${e.result?.summary.length ? T : c`<p>No changes selected.</p>`}`}
          <button id="apply" type="button" ?disabled=${!e.result?.summary.length || !!this.busy || this.disabled}
            @click=${this.apply}>${this.busy === "apply" ? "Validating…" : "Apply to draft"}</button>
        </section>` : T}
    `;
	}
};
w([E({ attribute: !1 })], J.prototype, "hass", void 0), w([E({ attribute: !1 })], J.prototype, "config", void 0), w([E({ type: Boolean })], J.prototype, "disabled", void 0), w([b()], J.prototype, "text", void 0), w([b()], J.prototype, "source", void 0), w([b()], J.prototype, "choices", void 0), w([b()], J.prototype, "importGps", void 0), w([b()], J.prototype, "busy", void 0), w([b()], J.prototype, "error", void 0), w([b()], J.prototype, "notice", void 0), J = w([v("al-floorplan-import")], J);
//#endregion
//#region src/property-layout.ts
var Ho = 6378137, Y = Math.PI / 180;
function Uo(e) {
	return Number.isFinite(e.latitude) && Math.abs(e.latitude) < 85 && Number.isFinite(e.longitude) && Math.abs(e.longitude) <= 180 && Number.isFinite(e.rotation ?? 0) && Number.isFinite(e.elevation ?? 0);
}
function Wo([e, t], n) {
	let r = (n.rotation ?? 0) * Y, i = e * Math.cos(r) - t * Math.sin(r), a = e * Math.sin(r) + t * Math.cos(r);
	return [n.longitude + i / (Ho * Math.cos(n.latitude * Y)) / Y, n.latitude + a / Ho / Y];
}
function Go([e, t], n) {
	let r = (e - n.longitude) * Y * Ho * Math.cos(n.latitude * Y), i = (t - n.latitude) * Y * Ho, a = (n.rotation ?? 0) * Y;
	return [r * Math.cos(a) + i * Math.sin(a), -r * Math.sin(a) + i * Math.cos(a)];
}
function Ko([e, t], n) {
	let r = 256 * 2 ** n, i = Math.sin(Math.max(-85, Math.min(85, t)) * Y);
	return [(e + 180) / 360 * r, (.5 - Math.log((1 + i) / (1 - i)) / (4 * Math.PI)) * r];
}
function qo([e, t], n) {
	let r = 256 * 2 ** n;
	return [e / r * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * t / r))) / Y];
}
function Jo(e) {
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
function Yo(e, t, r, i, a) {
	if (![
		r,
		i,
		a
	].every(Number.isFinite)) throw Error("Placement needs finite numbers.");
	let o = structuredClone(e), s = n(o).find((e) => e.group.id === t)?.group;
	if (!s || s.kind !== "structure" || !s.bounds) throw Error("Choose a structure with dimensions.");
	let [[c, l], [u, d]] = s.bounds, f = (c + u) / 2, p = (l + d) / 2, m = a * Y, h = (e) => {
		let t = Jo(e);
		if (t.length && (e.points = t.map(([e, t]) => [f + r + (e - f) * Math.cos(m) - (t - p) * Math.sin(m), p + i + (e - f) * Math.sin(m) + (t - p) * Math.cos(m)]), e.bounds)) {
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
			let [t, n, o] = e.position;
			return {
				...e,
				position: [
					f + r + (t - f) * Math.cos(m) - (n - p) * Math.sin(m),
					p + i + (t - f) * Math.sin(m) + (n - p) * Math.cos(m),
					o
				],
				yaw: ((e.yaw + a) % 360 + 360) % 360
			};
		}), e.children.forEach(h);
	};
	return h(s), o;
}
function Xo(e) {
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
var Zo = {
	property: "#74836b",
	lawn: "#65964d",
	driveway: "#89919a",
	path: "#b5a58a",
	pool: "#59aac7"
}, X = 512, Z = class extends i {
	constructor(...e) {
		super(...e), this.disabled = !1, this.latitude = "", this.longitude = "", this.elevation = "", this.rotation = "0", this.loadedLocation = !1, this.error = "", this.mapOpen = !1, this.tileError = !1, this.zoom = 19, this.provider = "https://tile.openstreetmap.org/{z}/{x}/{y}.png", this.attribution = "© OpenStreetMap contributors", this.editing = null, this.name = "", this.kind = "property", this.vertices = "", this.structure = "", this.dx = "0", this.dy = "0", this.angle = "0", this.busy = !1;
	}
	static {
		this.styles = _`
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
				if (!Uo(e)) throw Error("Home Assistant location is outside the supported map range. Edit Home information first.");
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
			if (this.elevation.trim() && (e.elevation = Number(this.elevation)), !Uo(e)) throw Error("Enter valid coordinates (latitude between −85 and 85) and finite elevation/rotation.");
			this.dispatchEvent(P({
				...this.config,
				gps: e
			})), this.center = [e.longitude, e.latitude], this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	loadMap() {
		try {
			if (!this.config?.gps || !Uo(this.config.gps)) throw Error("Apply a valid geographic origin first.");
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
		return Ko(this.center, this.zoom);
	}
	screen(e) {
		let t = Ko(Wo(e, this.config.gps), this.zoom), n = this.originPixel();
		return [t[0] - n[0] + X / 2, t[1] - n[1] + X / 2];
	}
	pan(e, t) {
		let n = this.originPixel();
		this.center = qo([n[0] + e * 128, n[1] + t * 128], this.zoom);
	}
	addVertex(e) {
		if (this.disabled || !this.config?.gps) return;
		let t = e.currentTarget.getBoundingClientRect(), n = this.originPixel(), r = Go(qo([n[0] + (e.clientX - t.left) / t.width * X - X / 2, n[1] + (e.clientY - t.top) / t.height * X - X / 2], this.zoom), this.config.gps);
		this.vertices = [this.vertices.trim(), r.map((e) => e.toFixed(3)).join(", ")].filter(Boolean).join("\n");
	}
	addFeature() {
		if (!(!this.config || this.disabled)) try {
			if (!this.name.trim()) throw Error("Give the feature a name.");
			let e = Xo(this.vertices), t = this.config.site ?? {
				ground_z: 0,
				features: []
			};
			if (this.editing === null && t.features.length >= 128) throw Error("Maximum 128 ground features.");
			let n = {
				name: this.name.trim(),
				kind: this.kind,
				points: e
			}, r = this.editing === null ? [...t.features, n] : t.features.map((e, t) => t === this.editing ? n : e);
			this.dispatchEvent(P({
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
		this.disabled || !this.config?.site || this.dispatchEvent(P({
			...this.config,
			site: {
				...this.config.site,
				features: this.config.site.features.filter((t, n) => n !== e)
			}
		}));
	}
	place() {
		if (!(!this.config || this.disabled)) try {
			this.dispatchEvent(P(Yo(this.config, this.structure, Number(this.dx), Number(this.dy), Number(this.angle)))), this.dx = this.dy = this.angle = "0", this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	tiles() {
		let [e, t] = this.originPixel(), n = 2 ** this.zoom, r = e - X / 2, i = t - X / 2, a = [];
		for (let e = Math.floor(i / 256); e <= Math.floor((i + X) / 256); e++) if (!(e < 0 || e >= n)) for (let t = Math.floor(r / 256); t <= Math.floor((r + X) / 256); t++) {
			let s = this.provider.replace("{z}", String(this.zoom)).replace("{x}", String((t % n + n) % n)).replace("{y}", String(e));
			a.push(o`<image href=${s} x=${t * 256 - r} y=${e * 256 - i} width="256" height="256"
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
		if (!this.config) return T;
		let e = this.config.gps, t = n(this.config).map((e) => e.group).filter((e) => e.kind === "structure" && e.bounds), r = this.vertices.trim().split("\n").map((e) => e.trim().split(/[,\s]+/).map(Number)).filter((e) => e.length === 2 && e.every(Number.isFinite));
		return c`
      <p>Use your home location, trace outdoor features, and place existing buildings. Changes join the panel draft; use Save to keep them.</p>
      ${e ? c`<p>Current origin: ${e.latitude}, ${e.longitude}; rotation ${e.rotation ?? 0}°.</p>` : c`<p>No geographic origin configured yet.</p>`}
      <fieldset ?disabled=${this.disabled || this.busy}>
        <legend>Location</legend>
        <button @click=${this.useHome}>Use Home Assistant location</button>
        <a href="/config/general" target="_blank" rel="noopener">Edit Home Assistant home information</a>
        ${this.loadedLocation ? c`<p>Home location loaded below. Apply it to this floorplan when ready.</p>` : T}
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
      ${this.mapOpen && e && this.center ? c`
        <div class="row"><button @click=${() => {
			this.zoom = Math.min(19, this.zoom + 1);
		}}>Zoom in</button><button @click=${() => {
			this.zoom = Math.max(3, this.zoom - 1);
		}}>Zoom out</button>
          <button @click=${() => this.pan(-1, 0)}>West</button><button @click=${() => this.pan(1, 0)}>East</button><button @click=${() => this.pan(0, -1)}>North</button><button @click=${() => this.pan(0, 1)}>South</button></div>
        <p>Click the map to add outline vertices, or enter local coordinates below.</p>
        <div class="map"><svg viewBox=${`0 0 ${X} ${X}`} role="img" aria-label="Property map; use coordinate fields below for keyboard editing" @click=${this.addVertex}>
          ${this.tiles()}
          ${this.config.site?.features.map((e) => o`<polygon points=${this.polygon(e.points)} fill=${Zo[e.kind]} fill-opacity="0.35" stroke=${Zo[e.kind]} stroke-width="2"></polygon>`)}
          ${t.map((e) => o`<polygon points=${this.polygon(Jo(e))} fill="#46b6ff" fill-opacity="0.15" stroke="#159ce9" stroke-width="2"></polygon>`)}
          <polyline points=${this.polygon(r)} fill="#ffcc55" fill-opacity="0.2" stroke="#ffcc55" stroke-width="3"></polyline>
          ${r.map((e) => {
			let [t, n] = this.screen(e);
			return o`<circle cx=${t} cy=${n} r="4" fill="#ffcc55"></circle>`;
		})}
        </svg><div class="credit">${this.attribution} · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></div></div>
        ${this.tileError ? c`<p role="status">Some map tiles could not load. Coordinates and layout editing remain available.</p>` : T}
      ` : T}
      <fieldset ?disabled=${this.disabled}><legend>Ground features</legend>
        <label>Local ground Z (m)<input type="number" step="any" .value=${String(this.config.site?.ground_z ?? 0)} @change=${(e) => {
			let t = Number(e.target.value);
			Number.isFinite(t) && this.dispatchEvent(P({
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
		}}>${Object.keys(Zo).map((e) => c`<option value=${e}>${e}</option>`)}</select></label></div>
        <label>Outline coordinates (X, Y metres; one vertex per line)<textarea .value=${this.vertices} @input=${(e) => {
			this.vertices = e.target.value;
		}}></textarea></label>
        <div class="row"><button @click=${this.addFeature}>${this.editing === null ? "Add ground feature" : "Update ground feature"}</button><button @click=${() => {
			this.vertices = "", this.editing = null;
		}}>Clear drawing</button></div>
        <ul>${this.config.site?.features.map((e, t) => c`<li>${e.name} (${e.kind}) <button @click=${() => this.editFeature(t)}>Edit ${e.name}</button> <button @click=${() => this.removeFeature(t)}>Remove ${e.name}</button></li>`)}</ul>
      </fieldset>
      <fieldset ?disabled=${this.disabled}><legend>Place existing structures</legend>
        <p>Move in local metres and rotate counterclockwise around the building centre. All descendant rooms move together; their dimensions and heights are preserved.</p>
        <div class="row"><label>Structure<select .value=${this.structure} @change=${(e) => {
			this.structure = e.target.value;
		}}><option value="">Choose a building</option>${t.map((e) => c`<option value=${e.id}>${e.name ?? e.id}</option>`)}</select></label>
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
      ${this.error ? c`<p class="error" role="alert">${this.error}</p>` : T}`;
	}
};
w([E({ attribute: !1 })], Z.prototype, "config", void 0), w([E({ attribute: !1 })], Z.prototype, "hass", void 0), w([E({ type: Boolean })], Z.prototype, "disabled", void 0), w([b()], Z.prototype, "latitude", void 0), w([b()], Z.prototype, "longitude", void 0), w([b()], Z.prototype, "elevation", void 0), w([b()], Z.prototype, "rotation", void 0), w([b()], Z.prototype, "loadedLocation", void 0), w([b()], Z.prototype, "error", void 0), w([b()], Z.prototype, "mapOpen", void 0), w([b()], Z.prototype, "tileError", void 0), w([b()], Z.prototype, "zoom", void 0), w([b()], Z.prototype, "center", void 0), w([b()], Z.prototype, "provider", void 0), w([b()], Z.prototype, "attribution", void 0), w([b()], Z.prototype, "editing", void 0), w([b()], Z.prototype, "name", void 0), w([b()], Z.prototype, "kind", void 0), w([b()], Z.prototype, "vertices", void 0), w([b()], Z.prototype, "structure", void 0), w([b()], Z.prototype, "dx", void 0), w([b()], Z.prototype, "dy", void 0), w([b()], Z.prototype, "angle", void 0), w([b()], Z.prototype, "busy", void 0), Z = w([v("al-property-layout")], Z);
//#endregion
//#region src/al-room-device-editor.ts
var Q = class extends i {
	constructor(...e) {
		super(...e), this.disabled = !1, this.room = "", this.fixture = ze(), this.placing = !1, this.error = "";
	}
	static {
		this.styles = _`
    :host { display:block; } fieldset { border:0; padding:0; margin:0; min-width:0; }
    .fields { display:flex; flex-wrap:wrap; gap:12px; } label { display:flex; flex-direction:column; gap:4px; margin:6px 0; }
    input,select,button { font:inherit; padding:8px; color:var(--primary-text-color); background:var(--card-background-color,white); border:1px solid var(--divider-color,#888); border-radius:6px; }
    button { cursor:pointer; margin:6px 8px 6px 0; } button:disabled { opacity:.5; cursor:default; }
    input[type=number] { width:110px; } .check { flex-direction:row; align-items:center; }
    .muted { color:var(--secondary-text-color); font-size:13px; } .error { color:var(--error-color,#f66); }
    ul { padding:0; list-style:none; } li { border-bottom:1px solid var(--divider-color,#888); padding:4px 0; }
  `;
	}
	get group() {
		return this.config && n(this.config).find((e) => e.group.id === this.room)?.group;
	}
	reset() {
		let e = this.group?.bounds;
		this.fixture = {
			...ze(),
			position: e ? [
				(e[0][0] + e[1][0]) / 2,
				(e[0][1] + e[1][1]) / 2,
				e[0][2] + Math.min(1.5, e[1][2] - e[0][2])
			] : [
				0,
				0,
				0
			]
		}, this.original = void 0, this.error = "", this.placing = !1;
	}
	patch(e) {
		this.fixture = {
			...this.fixture,
			...e
		}, this.error = "";
	}
	save() {
		if (!(!this.config || this.disabled)) try {
			this.dispatchEvent(P(_e(this.config, this.room, this.fixture, this.original))), this.original = this.fixture.entity, this.placing = !1, this.error = "";
		} catch (e) {
			this.error = e.message;
		}
	}
	removeFixture(e) {
		if (!this.config || this.disabled) return;
		let t = structuredClone(this.config), r = n(t).find((e) => e.group.id === this.room)?.group;
		r && (r.fixtures = r.fixtures?.filter((t) => t.entity !== e), this.dispatchEvent(P(t)), e === this.original && this.reset());
	}
	numeric(e, t, n, r) {
		return c`<label>${t}<input type="number" data-field=${e} min=${n} max=${r} step="any" .value=${String(this.fixture[e])}
      @input=${(t) => this.patch({ [e]: t.target.valueAsNumber })}></label>`;
	}
	render() {
		if (!this.config) return T;
		let e = n(this.config).filter((e) => e.group.bounds && ![
			"property",
			"structure",
			"floor"
		].includes(e.group.kind)), t = this.group, r = t?.bounds, i = this.config;
		if (t && r) try {
			i = _e(this.config, this.room, {
				...this.fixture,
				entity: this.fixture.entity || "binary_sensor.placement_preview"
			}, this.original);
		} catch {}
		return c`<p>Place motion sensors, occupancy sensors, and lights in a room. Changes join your configuration draft; use the panel's Save to persist them.</p>
      <fieldset ?disabled=${this.disabled}>
        <label>Room<select id="device-room" .value=${this.room} @change=${(e) => {
			this.room = e.target.value, this.reset();
		}}>
          <option value="">Choose a room</option>${e.map((e) => c`<option value=${e.group.id} .selected=${e.group.id === this.room}>${e.group.name || e.group.id}</option>`)}
        </select></label>
        ${r ? c`<ul>${t?.fixtures?.map((e) => c`<li>${e.name || e.entity} · ${e.kind}
          <button type="button" @click=${() => {
			this.fixture = structuredClone(e), this.original = e.entity, this.error = "";
		}}>Edit</button>
          <button type="button" @click=${() => this.removeFixture(e.entity)}>Remove</button></li>`)}</ul>
        <button type="button" @click=${() => this.reset()}>New placement</button>
        <div class="fields">
          <label>Type<select id="fixture-kind" .value=${this.fixture.kind} @change=${(e) => this.patch({ kind: e.target.value })}>
            ${[
			"motion",
			"occupancy",
			"light"
		].map((e) => c`<option .selected=${e === this.fixture.kind} value=${e}>${e}</option>`)}</select></label>
          <label>Home Assistant entity<input id="fixture-entity" list="room-entities" .value=${this.fixture.entity} placeholder=${this.fixture.kind === "light" ? "light.ceiling" : "binary_sensor.motion"}
            @input=${(e) => this.patch({ entity: e.target.value })}></label>
          <datalist id="room-entities">${Object.values(this.hass?.states ?? {}).filter((e) => e.entity_id.startsWith(this.fixture.kind === "light" ? "light." : "binary_sensor.")).map((e) => c`<option value=${e.entity_id}>${e.attributes.friendly_name ?? e.entity_id}</option>`)}</datalist>
          <label>Label<input maxlength="100" .value=${this.fixture.name} @input=${(e) => this.patch({ name: e.target.value })}></label>
          <label>Mount<input maxlength="60" placeholder="Corner, wall, plug-in…" .value=${this.fixture.mount} @input=${(e) => this.patch({ mount: e.target.value })}></label>
          <label>Model / technology<input maxlength="60" placeholder="Z-Wave, ESPHome, Screek 2A…" .value=${this.fixture.technology} @input=${(e) => this.patch({ technology: e.target.value })}></label>
        </div>
        <div class="fields">
          ${[0, 1].map((e) => c`<label>${e === 0 ? "X" : "Y"} (m)<input type="number" step="any" .value=${String(this.fixture.position[e])} @input=${(t) => {
			let n = [...this.fixture.position];
			n[e] = t.target.valueAsNumber, this.patch({ position: n });
		}}></label>`)}
          <label>Height above floor (m)<input id="fixture-height" type="number" min="0" max=${r[1][2] - r[0][2]} step="any" .value=${String(Number((this.fixture.position[2] - r[0][2]).toFixed(3)))}
            @input=${(e) => this.patch({ position: [
			this.fixture.position[0],
			this.fixture.position[1],
			r[0][2] + e.target.valueAsNumber
		] })}></label>
          ${this.numeric("yaw", "Direction (°)", -360, 360)}${this.numeric("pitch", "Tilt (°)", -90, 90)}
          ${this.fixture.kind === "light" ? T : c`${this.numeric("fov", "Horizontal view (°)", 1, 170)}${this.numeric("vertical_fov", "Vertical view (°)", 1, 170)}${this.numeric("range", "Range (m; 0 = hidden)", 0, 100)}`}
        </div>
        <p class="muted">Direction 0° points along +X; 90° along +Y. Negative tilt aims down. Coverage is an approximate cone, not a detection boundary or a person's location; walls do not clip it.</p>
        <label class="check"><input id="place-device" type="checkbox" .checked=${this.placing} @change=${(e) => {
			this.placing = e.target.checked;
		}}>Click in the 3D room to place at the chosen height</label>
        <button id="save-fixture" type="button" @click=${() => this.save()}>${this.original ? "Update" : "Add"} placement to draft</button>
        ${this.error ? c`<p class="error" role="alert">${this.error}</p>` : T}
        <al-floorplan-viewer .config=${{ groups: i.groups }} .room=${this.room} .hass=${this.hass}
          .placementHeight=${this.placing && !this.disabled && Number.isFinite(this.fixture.position[2]) ? this.fixture.position[2] : void 0}
          @al-fixture-position=${(e) => {
			e.stopPropagation(), this.disabled || this.patch({ position: e.detail.map((e) => Number(e.toFixed(3))) });
		}}></al-floorplan-viewer>
        ` : c`<p class="muted">Choose a room with floorplan dimensions first.</p>`}
      </fieldset>`;
	}
};
w([E({ attribute: !1 })], Q.prototype, "config", void 0), w([E({ attribute: !1 })], Q.prototype, "hass", void 0), w([E({ type: Boolean })], Q.prototype, "disabled", void 0), w([b()], Q.prototype, "room", void 0), w([b()], Q.prototype, "fixture", void 0), w([b()], Q.prototype, "original", void 0), w([b()], Q.prototype, "placing", void 0), w([b()], Q.prototype, "error", void 0), Q = w([v("al-room-device-editor")], Q);
//#endregion
//#region src/al-floorplans.ts
var $ = class extends i {
	constructor(...e) {
		super(...e), this.live = null, this.disabled = !1, this.lights = {}, this.settings = {}, this.error = "", this.preferenceError = "", this.entry = "";
	}
	static {
		this.styles = _`
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
		let e = Ve(this.hass);
		this.source === e && this.unsubscribe || (this.unsubscribe?.(), this.source = e, this.unsubscribe = e.subscribe(({ data: e, error: t }) => {
			if (this.error = t ?? "", e && (this.lights = e.lights, this.telemetry = e.telemetry, this.entry !== e.entry_id)) {
				this.entry = e.entry_id;
				try {
					let e = localStorage.getItem(`al-floorplan:${this.entry}`);
					this.settings = e ? JSON.parse(e) : {}, Ee(this.settings);
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
		if (!this.config) return T;
		let e = n(this.config).some(({ group: e }) => e.bounds || e.points);
		return c`
      ${this.error || this.preferenceError ? c`<p role="status">${this.error || this.preferenceError}</p>` : T}
      <al-floorplan-viewer .config=${this.config} .live=${this.live} .hass=${this.hass} .lights=${this.lights}
        .telemetry=${this.error ? void 0 : this.telemetry} .settings=${this.settings} @al-viewer-settings=${this.saveSettings}></al-floorplan-viewer>
      <details><summary>Room devices</summary><al-room-device-editor .config=${this.config} .hass=${this.hass} .disabled=${this.disabled}></al-room-device-editor></details>
      <details><summary>Property layout</summary><al-property-layout .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-property-layout></details>
      <details .open=${!e}><summary>Import or update floorplan</summary>
        <al-floorplan-import .hass=${this.hass} .config=${this.config} .disabled=${this.disabled}></al-floorplan-import>
      </details>`;
	}
};
w([E({ attribute: !1 })], $.prototype, "hass", void 0), w([E({ attribute: !1 })], $.prototype, "config", void 0), w([E({ attribute: !1 })], $.prototype, "live", void 0), w([E({ type: Boolean })], $.prototype, "disabled", void 0), w([b()], $.prototype, "telemetry", void 0), w([b()], $.prototype, "lights", void 0), w([b()], $.prototype, "settings", void 0), w([b()], $.prototype, "error", void 0), w([b()], $.prototype, "preferenceError", void 0), $ = w([v("al-floorplans")], $);
//#endregion
