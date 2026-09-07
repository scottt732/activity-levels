import { C as e, D as t, E as n, S as r, T as i, _ as a, a as o, b as s, c, d as l, f as u, g as d, h as f, i as ee, l as p, m as te, n as m, o as ne, p as re, r as ie, s as ae, t as oe, u as se, v as ce, w as le, x as h, y as g } from "./shared-D-updW7W.js";
//#region src/entities.ts
var ue = (e) => `switch.${e}_presence_simulation`, de = (e) => `sensor.${e}_expected_activity`, fe = (e) => `sensor.${e}_activity_anomaly`, pe = [
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
], me = ["ha-yaml-editor", "ha-state-icon"], he = 2500, ge = 8e3;
function _e(e) {
	let t;
	return {
		promise: new Promise((n) => {
			t = setTimeout(n, e);
		}),
		cancel: () => clearTimeout(t)
	};
}
async function ve(e, t, n) {
	let r = _e(t);
	try {
		return await Promise.race([e, r.promise.then(() => n)]);
	} finally {
		r.cancel();
	}
}
async function ye() {
	try {
		await ((await window.loadCardHelpers?.())?.createCardElement({
			type: "entities",
			entities: []
		}))?.constructor?.getConfigElement?.();
	} catch {}
}
async function be() {
	if (customElements.get("ha-yaml-editor")) return;
	let e;
	try {
		await customElements.whenDefined("ha-selector"), e = document.createElement("ha-selector"), e.selector = { object: {} }, e.style.display = "none", document.body.appendChild(e), await customElements.whenDefined("ha-yaml-editor");
	} catch {} finally {
		e?.remove();
	}
}
async function xe(e = ge, t = he) {
	let n = [...pe, ...me];
	if (n.every((e) => customElements.get(e))) return {
		ok: !0,
		missing: [],
		optionalMissing: []
	};
	await ve(Promise.all([ye(), be()]).then(() => void 0), t, void 0);
	let r = await Promise.all(n.map((t) => ve(customElements.whenDefined(t).then(() => !0), e, !1))), i = n.filter((e, t) => !r[t]), a = me, o = i.filter((e) => !a.includes(e));
	return {
		ok: o.length === 0,
		missing: o,
		optionalMissing: i.filter((e) => a.includes(e))
	};
}
//#endregion
//#region src/kinds.ts
var Se = [
	"open",
	"door",
	"stairs",
	"exterior_door"
], Ce = "door", _ = {
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
}, we = {
	open: "Open (no door)",
	door: "Door",
	stairs: "Stairs",
	exterior_door: "Exterior door"
}, Te = {
	property: [
		"property",
		"structure",
		"outside"
	],
	structure: ["floor", "area"],
	floor: ["area"],
	area: ["area"],
	outside: ["outside"]
}, Ee = ["property"], De = /* @__PURE__ */ new Set(["area", "outside"]), Oe = (e) => e === null ? Ee : Te[e];
function ke(e, t) {
	return t.length <= e.length ? !1 : e.every((e, n) => t[n] === e);
}
//#endregion
//#region src/store.ts
function v(e, t) {
	let n = e;
	for (let e of t) {
		if (n == null) return;
		n = n[e];
	}
	return n;
}
function Ae(e) {
	return Array.isArray(e) ? [...e] : { ...e };
}
function je(e, t, n) {
	if (t.length === 0) throw Error("empty path");
	let r = Ae(e), i = r;
	for (let e = 0; e < t.length - 1; e++) {
		let n = t[e], r = Ae(i[n]);
		i[n] = r, i = r;
	}
	return n(i, t[t.length - 1]), r;
}
function y(e, t, n) {
	return je(e, t, (e, t) => {
		e[t] = n;
	});
}
function Me(e, t) {
	return je(e, t, (e, t) => {
		Array.isArray(e) ? e.splice(t, 1) : delete e[t];
	});
}
function Ne(e, t, n, r) {
	return je(e, [...t, n], (e) => {
		e.splice(n, 0, r);
	});
}
function Pe(e, t, n, r) {
	return je(e, [...t, n], (e) => {
		let t = e, [i] = t.splice(n, 1);
		t.splice(r, 0, i);
	});
}
function Fe(e, t, n, r) {
	return r === n || r === n + 1 ? e : Pe(e, t, n, r > n ? r - 1 : r);
}
var Ie = 1e3, Le = class {
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
		t !== void 0 && t === this.coalesceKey && n - this.coalesceAt < Ie || this.past.push(this.config), this.future = [], this.config = e, this.coalesceKey = t ?? null, this.coalesceAt = n;
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
}, b = (e) => ({
	ok: !1,
	reason: e
}), Re = (e) => ({
	list: e.slice(0, -1),
	index: e[e.length - 1]
}), ze = (e) => e[e.length - 1] === "stimuli";
function Be(e, t, n, r) {
	let i = v(e, t);
	if (i === void 0) return b("that node is gone");
	let a = v(e, n);
	if (!Array.isArray(a)) return b("there is nothing to drop into there");
	if (r < 0 || r > a.length) return b("that is not a slot in this list");
	let o = ze(Re(t).list);
	if (o !== ze(n)) return b(o ? "a stimulus belongs to a group, not beside one" : "that is not a stimulus");
	if (o) return { ok: !0 };
	let s = i;
	if (ke(t, n) || Ve(t, n.slice(0, -1))) return b("a group cannot go into itself");
	let c = n.slice(0, -1), l;
	if (n.length === 1) l = null;
	else {
		let t = v(e, c);
		if (t === void 0) return b("that group is gone");
		l = t.kind;
	}
	return Oe(l).includes(s.kind) ? { ok: !0 } : b(l === null ? "every root group is a property" : `a ${l} cannot contain a ${s.kind}`);
}
var Ve = (e, t) => e.length === t.length && e.every((e, n) => t[n] === e);
function He(e, t, n) {
	let { list: r, index: i } = Re(e), a = [...t], o = a[r.length];
	return r.length < a.length && Ve(r, a.slice(0, r.length)) && typeof o == "number" && o > i && (a[r.length] = o - 1), {
		parent: a,
		index: Ve(r, t) && n > i ? n - 1 : n
	};
}
function Ue(e, t, n, r) {
	let { index: i } = Re(t);
	if (Ve(Re(t).list, n) && (r === i || r === i + 1)) return e;
	let a = v(e, t), o = Me(e, t), { parent: s, index: c } = He(t, n, r);
	return Ne(o, s, c, a);
}
//#endregion
//#region src/model.ts
var We = (e, t) => ({
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
	presence: Ke(),
	stimuli: [],
	children: []
}), Ge = "presence", Ke = () => ({
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
}), qe = (e) => typeof e == "string" ? e : e.id, Je = (e) => typeof e != "string" && e.one_way, Ye = (e) => typeof e == "string" ? Ce : e.connection;
function Xe(e) {
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
	for (let { group: r } of Xe(e)) if (r.id !== t) for (let e of r.adjacent ?? []) qe(e) === t && n.push({
		group: r,
		edge: {
			id: t,
			connection: Ye(e),
			one_way: Je(e)
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
}), x = (e) => ({
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
	return new Set(Xe(e).filter(({ group: e }) => De.has(e.kind)).map(({ group: e }) => e.id));
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
var S = (e, t) => v(e, t), ht = (e, t) => v(e, t), C = (e) => e.slice(0, -2), gt = (e) => e[e.length - 2] === "stimuli" ? C(e) : e, _t = (e, t) => e.envelopes.find((n) => n.id === (t ?? e.defaults.envelope));
function vt(e, t) {
	let n = _t(e, t.envelope), r = e.defaults, i = (e, t, n) => e ?? t ?? n;
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
var yt = "activity_levels.mixer.expanded", bt = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]), xt = (e) => e.groups.length > 0 ? ["groups", 0] : null;
function St(e) {
	return {
		expanded: new Set(e.groups.map((e) => e.id)),
		selection: xt(e)
	};
}
function Ct(e, t) {
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
function wt(e, t) {
	let n = Ct(e, t), r = [], i = [], a = [], o = [], s = 0, c = (e) => {
		for (; o.length > 0 && o[o.length - 1].depth >= e;) o.pop().band.colEnd = i.length + 1;
	};
	for (let t of n) {
		if (c(t.depth), i.push("strip"), r.push(i.length), !t.hasChildren) continue;
		let n = S(e, t.path)?.name ?? t.id, l = {
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
function Tt(e, t) {
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
			let n = Ct(t.config, e);
			if (n.length === 0) return e;
			let r = e.selection, i = r === null ? -1 : n.findIndex((e) => bt(e.path, r)), a = (((i === -1 && t.delta < 0 ? n.length : i) + t.delta) % n.length + n.length) % n.length;
			return {
				...e,
				selection: n[a].path
			};
		}
		case "home":
		case "end": {
			let n = Ct(t.config, e);
			return n.length === 0 ? e : {
				...e,
				selection: (t.type === "home" ? n[0] : n[n.length - 1]).path
			};
		}
		case "sync": {
			let { config: n } = t, r = ot(n), i = [...e.expanded].filter((e) => r.has(e));
			return {
				expanded: i.length === e.expanded.size ? e.expanded : new Set(i),
				selection: e.selection !== null && v(n, e.selection) !== void 0 ? e.selection : xt(n)
			};
		}
	}
}
function Et(e, t, n) {
	if (n === null) return t;
	let r = n[n.length - 2] === "stimuli" ? n.slice(0, -2) : n, i = new Set(t), a = !1;
	for (let t = 2; t + 2 <= r.length; t += 2) {
		let n = v(e, r.slice(0, t));
		if (n === void 0 || typeof n.id != "string") break;
		i.has(n.id) || (i.add(n.id), a = !0);
	}
	return a ? i : t;
}
function Dt(e) {
	let t;
	try {
		t = localStorage.getItem(yt);
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
function Ot(e) {
	try {
		localStorage.setItem(yt, JSON.stringify([...e]));
	} catch {}
}
function kt(e) {
	let t = St(e), n = Dt(e);
	return n === null ? t : {
		...t,
		expanded: n
	};
}
var At = "activity_levels.mixer.edit";
function jt() {
	try {
		return localStorage.getItem(At) === "true";
	} catch {
		return !1;
	}
}
function Mt(e) {
	try {
		localStorage.setItem(At, e ? "true" : "false");
	} catch {}
}
//#endregion
//#region src/save-flow.ts
async function Nt(e, t) {
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
//#region src/styles.ts
var w = t`
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
`, Pt = {
	"24h": 86400,
	"7d": 604800,
	"30d": 2592e3
}, Ft = {
	off: 0,
	"24h": 86400,
	"7d": 604800
};
function It(e, t, n) {
	return {
		start: e - Pt[t],
		end: e,
		resolution: t === "24h" ? "5m" : "1h",
		forecastUntil: n === "off" ? void 0 : e + Ft[n]
	};
}
function Lt(e, t, n) {
	let r = t - e || 1;
	return (t) => (t - e) / r * n;
}
function Rt(e, t, n = 4) {
	let r = e || 1, i = t - 2 * n;
	return (e) => t - n - e / r * i;
}
function zt(e, t) {
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
function Bt(e, t, n) {
	return e.length === 0 ? "" : e.map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ");
}
function Vt(e, t, n, r = Infinity) {
	if (e.p75.length === 0) return "";
	let i = (t) => t.map((t, n) => [e.t0 + n * e.step, t]), a = zt(i(e.p75), r), o = zt(i(e.p25), r).reverse();
	return `${[...a, ...o].map(([e, r], i) => `${i === 0 ? "M" : "L"}${t(e)},${n(r)}`).join(" ")} Z`;
}
function Ht(e, t) {
	return e[t].map((t, n) => [e.t0 + n * e.step, t]);
}
function Ut(e, t, n, r, i) {
	let a = e[e.length - 1];
	return !a || t <= a[0] || t < r || t > i ? [] : [a, [t, n]];
}
function Wt(e, t, n) {
	return e.map(([e, r, i]) => ({
		x0: t(e),
		x1: t(r ?? n),
		tag: i
	}));
}
function Gt(e, t) {
	if (e.length === 0) return -1;
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i][0] < t ? n = i + 1 : r = i;
	}
	return n > 0 && Math.abs(e[n - 1][0] - t) <= Math.abs(e[n][0] - t) ? n - 1 : n;
}
function Kt(e) {
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
function qt(e, t) {
	let n = Math.min(2592e3, Math.max(3600, e.end - e.start)), r = Math.min(t + 604800, e.start + n);
	return {
		start: r - n,
		end: r
	};
}
function Jt(e, t, n, r) {
	let i = e.end - e.start, a = Math.min(2592e3, Math.max(3600, i * n)), o = t - (t - e.start) / i * a;
	return qt({
		start: o,
		end: o + a
	}, r);
}
function Yt(e, t, n = Infinity) {
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
function Xt(e, t, n, r, i = 450) {
	if (n > r) {
		let t = e.forecast;
		if (!t || t.step <= 0) return null;
		let r = Yt(Ht(t, "p50"), n);
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
var Zt = class {
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
		let { start: i, end: a, until: o } = Qt(t, n, r), s = {}, c = !0;
		for (let l of e) {
			let e = this.cache.get(JSON.stringify([
				l,
				i,
				a,
				o,
				r
			]));
			!e || Date.now() - e.at > 6e4 ? (c = !1, s[l] = null) : s[l] = Xt(e.data, l, t, n, r === "5m" ? 450 : 5400);
		}
		return {
			values: s,
			complete: c
		};
	}
	async load(e, t, n, r, i = "5m") {
		let a = ++this.generation, o = {}, s = !1, { start: c, end: l, until: u } = Qt(n, r, i), d = 0;
		return await Promise.all(Array.from({ length: Math.min(4, t.length) }, async () => {
			for (; d < t.length && a === this.generation;) {
				let f = t[d++], ee = JSON.stringify([
					f,
					c,
					l,
					u,
					i
				]), p = this.cache.get(ee);
				if (!p || Date.now() - p.at > 6e4) {
					await this.slot();
					try {
						if (a !== this.generation) return;
						for (p = {
							at: Date.now(),
							data: await se(e, {
								group_id: f,
								start: c,
								end: l,
								resolution: i,
								include_children: !1,
								...u === void 0 ? {} : { forecast_until: u }
							})
						}, this.cache.set(ee, p); this.cache.size > 128;) this.cache.delete(this.cache.keys().next().value);
					} catch {
						s = !0, o[f] = null;
						continue;
					} finally {
						this.release();
					}
				}
				o[f] = Xt(p.data, f, n, r, i === "5m" ? 450 : 5400);
			}
		})), {
			values: o,
			failed: s
		};
	}
};
function Qt(e, t, n) {
	let r = e > t, i = Math.floor(e / 3600) * 3600, a = Math.floor(t / 60) * 60, o = n === "5m" ? 300 : 3600, s = r ? a : Math.min(i + 3600 + o, a);
	return {
		start: r ? s - o : i - o,
		end: s,
		...r ? { until: Math.min(i + 3900, s + 604800) } : {}
	};
}
//#endregion
//#region src/activity-levels-panel.ts
var $t = [
	"mixer",
	"groups",
	"envelopes",
	"defaults",
	"patterns",
	"presence",
	"paths",
	"code"
], en = 2e3, tn = 1e4, nn = 3e5, rn = 1500, an = "activity_levels.timeline", on = [
	"24h",
	"7d",
	"30d"
], sn = [
	"off",
	"24h",
	"7d"
], cn = {
	range: "7d",
	horizon: "24h",
	showChannels: !0,
	showLights: !0
};
function ln(e) {
	if (e === null) return null;
	let t = JSON.parse(e);
	return !on.includes(t.range) || !sn.includes(t.horizon) ? null : {
		range: t.range,
		horizon: t.horizon,
		showChannels: t.showChannels !== !1,
		showLights: t.showLights !== !1
	};
}
var T = class extends r {
	constructor(...e) {
		super(...e), this.narrow = !1, this.inferred = [], this.warnings = [], this.tab = "mixer", this.selection = null, this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.banner = null, this.live = null, this.liveOn = !1, this.busy = !1, this.missing = [], this.profileState = null, this.simLog = null, this.timeline = cn, this.preview = null, this.previewError = !1, this.previewData = new Zt(), this.previewSeq = 0, this.transportWindow = null, this.onTransport = (e) => {
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
			let t = Tt(this.nav, e.detail);
			t.expanded !== this.nav.expanded && Ot(t.expanded), this.nav = t, this.selection = t.selection, this.preview && this.onTransport(new CustomEvent("al-transport", { detail: {
				time: this.preview.time,
				window: this.transportWindow
			} }));
		}, this.onLiveRefresh = () => {
			this.pollLive();
		}, this.onRebuild = async (e) => {
			try {
				let { rebuilt: t } = await re(this.hass, e.detail?.force === !0);
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
				await ie(this.hass, "switch", n ? "turn_on" : "turn_off", { entity_id: ue(t) });
			} catch (e) {
				this.banner = {
					kind: "error",
					text: `Could not ${n ? "start" : "stop"} the simulation for ${t}: ${e.message}`
				};
			}
		}, this.onTimelineRange = (e) => {
			this.timeline = e.detail;
			try {
				localStorage.setItem(an, JSON.stringify(e.detail));
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
		let r = Ct(n, this.nav).map((e) => e.id);
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
		return $t;
	}
	async connectedCallback() {
		super.connectedCallback(), document.addEventListener("visibilitychange", this.onVisibilityChange), this.restoreTimeline();
		let { ok: e, missing: t, optionalMissing: n } = await xe();
		this.missing = e ? [] : t, this.yamlEditor = !n.includes("ha-yaml-editor"), await this.load(), this.isConnected && (this.updatePolling(), this.refreshProfile());
	}
	disconnectedCallback() {
		super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.clearLiveTimer(), this.clearSimTimer(), clearTimeout(this.previewTimer), this.previewTimer = void 0, this.previewSeq++, this.previewData.cancel();
	}
	async load() {
		try {
			let { config: e, inferred: t, warnings: n } = await o(this.hass);
			this.draft = new Le(e), this.inferred = t, this.warnings = n, this.syncTabs(), this.nav = kt(e), this.selection = this.nav.selection, this.errors = [], this.codeStatus = null, this.banner = null;
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
		let t = this.selection, n = Tt({
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
		let n = Et(t, this.nav.expanded, e);
		n !== this.nav.expanded && Ot(n), this.nav = {
			expanded: n,
			selection: e
		};
	}
	async save() {
		let e = this.draft;
		if (e) {
			this.busy = !0, this.updatePolling();
			try {
				let t = await Nt(e.config, {
					validate: (e) => ce(this.hass, e),
					save: (e) => f(this.hass, e)
				});
				t.errors !== null && (this.errors = t.errors), this.banner = t.banner, t.reload && (await new Promise((e) => setTimeout(e, rn)), await this.load());
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
		this.liveOn = e, !e && this.tab !== "mixer" && (this.live = null), this.updatePolling();
	}
	get patternsVisible() {
		return this.tab === "mixer" || this.tab === "patterns" || this.tab === "groups";
	}
	updatePolling() {
		let e = !this.busy && document.visibilityState === "visible";
		this.updateLivePolling(e), this.updateSimPolling(e);
	}
	updateLivePolling(e) {
		if (!((this.liveOn || this.tab === "mixer") && e)) {
			this.clearLiveTimer();
			return;
		}
		this.liveTimer === void 0 && (this.pollLive(), this.liveTimer = window.setInterval(() => void this.pollLive(), en));
	}
	updateSimPolling(e) {
		if (!(this.patternsVisible && e)) {
			this.clearSimTimer();
			return;
		}
		this.simTimer === void 0 && (this.pollSim(), this.simTimer = window.setInterval(() => void this.pollSim(), tn));
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
			this.simLog = await c(this.hass);
		} catch {}
	}
	clearLiveTimer() {
		this.liveTimer !== void 0 && (clearInterval(this.liveTimer), this.liveTimer = void 0);
	}
	clearSimTimer() {
		this.simTimer !== void 0 && (clearInterval(this.simTimer), this.simTimer = void 0);
	}
	async refreshProfile(e = !1) {
		if (this.patternsVisible && !(!e && this.profileState !== null && Date.now() - this.profileAt < nn)) try {
			this.profileState = await ae(this.hass), this.profileAt = Date.now();
		} catch {}
	}
	restoreTimeline() {
		try {
			this.timeline = ln(localStorage.getItem(an)) ?? cn;
		} catch {}
	}
	selectTab(e) {
		let t = this.tabs[e];
		t !== void 0 && (t !== "mixer" && !this.liveOn && (this.live = null), t !== "mixer" && (clearTimeout(this.previewTimer), this.previewTimer = void 0, this.previewSeq++, this.previewData.cancel(), this.preview = null), this.tab = t, this.tabFocus = e, this.updatePolling(), this.refreshProfile());
	}
	focusTab(e) {
		this.tabFocus = e, this.updateComplete.then(() => {
			this.renderRoot.querySelectorAll("[role=\"tab\"]")[e]?.focus();
		});
	}
	render() {
		if (this.missing.length) return this.renderMissing();
		let e = this.draft;
		return i`
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
          ${this.tabs.map((e, t) => i`<button
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
          ${e ? this.renderTab(e) : i`<p style="padding:16px">Loading…</p>`}
        </div>
      </ha-top-app-bar-fixed>
    `;
	}
	renderLiveToggle() {
		return this.tab === "mixer" ? e : i`
      <span class="muted">Live</span>
      <ha-switch
        .checked=${this.liveOn}
        @change=${(e) => this.toggleLive(e.target.checked)}
      ></ha-switch>
    `;
	}
	renderMissing() {
		return i`
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
		let t = this.banner;
		return t ? i`<ha-alert
      alert-type=${t.kind}
      dismissable
      @alert-dismissed-clicked=${() => {
			this.banner = null;
		}}
      >${t.text}</ha-alert
    >` : e;
	}
	renderInferred() {
		let t = this.inferred.length;
		return t === 0 ? e : i`<ha-alert class="inferred-notice" alert-type="warning">
      ${t} ${t === 1 ? "group has" : "groups have"} an inferred kind — check them and save. Until you
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
		return this.warnings.length === 0 ? e : i`<ha-alert class="config-warnings" alert-type="warning">
      <ul>
        ${this.warnings.map((e) => i`<li>${e}</li>`)}
      </ul>
    </ha-alert>`;
	}
	renderTab(e) {
		switch (this.tab) {
			case "mixer": return this.renderMixer(e);
			case "groups": return i`<div class="layout ${this.narrow ? "narrow" : ""}">
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
			case "envelopes": return i`<al-envelopes
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-envelopes>`;
			case "defaults": return i`<al-defaults
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          @al-change=${this.onChange}
        ></al-defaults>`;
			case "patterns": return i`<al-patterns
          .hass=${this.hass}
          .config=${e.config}
          .profileState=${this.profileState}
          .simLog=${this.simLog}
          @al-rebuild=${this.onRebuild}
        ></al-patterns>`;
			case "code": return i`<al-code
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .available=${this.yamlEditor}
          @al-change=${this.onChange}
          @al-code-status=${this.onCodeStatus}
        ></al-code>`;
			case "paths": return i`<al-paths .hass=${this.hass} .config=${e.config} .narrow=${this.narrow}></al-paths>`;
			case "presence": return i`<al-presence
          .hass=${this.hass}
          .config=${e.config}
          .errors=${this.errors}
          .narrow=${this.narrow}
          @al-change=${this.onChange}
        ></al-presence>`;
		}
	}
	renderMixer(t) {
		let n = t.config;
		if (n.groups.length === 0) return this.renderMixerEmpty();
		let r = this.nav.selection, a = r === null ? void 0 : S(n, gt(r));
		return i`<div class="rows">
      <al-timeline
        .hass=${this.hass}
        .groupId=${a?.id ?? null}
        .heading=${a ? a.name ?? a.id : ""}
        .range=${this.timeline.range}
        .horizon=${this.timeline.horizon}
        .showChannels=${this.timeline.showChannels}
        .showLights=${this.timeline.showLights}
        .live=${this.live}
        .maxValue=${a?.max_value ?? n.defaults.max_value}
        .profileState=${this.profileState}
        .minDays=${n.defaults.patterns?.min_days ?? 14}
        .paused=${this.busy}
        .narrow=${this.narrow}
        .labels=${this.timelineLabels}
        .precisions=${this.timelinePrecisions}
        @al-transport=${this.onTransport}
        @al-timeline-range=${this.onTimelineRange}
      ></al-timeline>
      ${this.previewError ? i`<ha-alert alert-type="warning">Some preview data could not be loaded. Missing values are shown as —.</ha-alert>` : e}
      <al-mixer
        .preview=${this.preview}
        @al-open-group=${this.openMixerGroup}
        .hass=${this.hass}
        .config=${n}
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
		return i`<div class="rows">
      <ha-card class="mixer-empty">
        <p class="muted">Add your first group in Groups.</p>
        <ha-button @click=${() => this.selectTab(this.tabs.indexOf("groups"))}>Go to Groups</ha-button>
      </ha-card>
    </div>`;
	}
	renderEditor(e) {
		let t = this.selection;
		return t ? t[t.length - 2] === "stimuli" ? i`<al-stimulus-editor
          .hass=${this.hass}
          .config=${e.config}
          .path=${t}
          .errors=${this.errors}
          .live=${this.live}
          @al-change=${this.onChange}
        ></al-stimulus-editor>` : i`<div><al-group-editor
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
        </div>` : i`<ha-card><span class="muted">Select a group or stimulus.</span></ha-card>`;
	}
};
m([s({ attribute: !1 })], T.prototype, "hass", void 0), m([s({ type: Boolean })], T.prototype, "narrow", void 0), m([g()], T.prototype, "draft", void 0), m([g()], T.prototype, "inferred", void 0), m([g()], T.prototype, "warnings", void 0), m([g()], T.prototype, "tab", void 0), m([g()], T.prototype, "selection", void 0), m([g()], T.prototype, "nav", void 0), m([g()], T.prototype, "errors", void 0), m([g()], T.prototype, "banner", void 0), m([g()], T.prototype, "live", void 0), m([g()], T.prototype, "liveOn", void 0), m([g()], T.prototype, "busy", void 0), m([g()], T.prototype, "missing", void 0), m([g()], T.prototype, "profileState", void 0), m([g()], T.prototype, "simLog", void 0), m([g()], T.prototype, "timeline", void 0), m([g()], T.prototype, "preview", void 0), m([g()], T.prototype, "previewError", void 0), m([g()], T.prototype, "codeStatus", void 0), m([g()], T.prototype, "yamlEditor", void 0), m([g()], T.prototype, "tabFocus", void 0), T = m([h("activity-levels-panel")], T);
//#endregion
//#region src/duration.ts
function E(e) {
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
function D(e) {
	if (!e) return null;
	let t = (e.days ?? 0) * 86400 + e.hours * 3600 + e.minutes * 60 + e.seconds + (e.milliseconds ?? 0) / 1e3;
	return Math.round(t * 1e3) / 1e3;
}
function O(e) {
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
var k = ["on", "off"], un = {
	automation: k,
	binary_sensor: k,
	fan: k,
	humidifier: k,
	input_boolean: k,
	light: k,
	remote: k,
	siren: k,
	switch: k,
	update: k,
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
}, dn = (e) => e.split(".")[0] ?? "", fn = (e) => {
	let t = e.replace(/_/g, " ");
	return t.charAt(0).toUpperCase() + t.slice(1);
};
function pn(e, t, n) {
	let r = dn(t), i = e?.states[t]?.attributes.device_class, a = [typeof i == "string" ? `component.${r}.entity_component.${i}.state.${n}` : null, `component.${r}.entity_component._.state.${n}`];
	if (typeof e?.localize == "function") for (let t of a) {
		if (t === null) continue;
		let n = e.localize(t);
		if (typeof n == "string" && n !== "") return n;
	}
	return fn(n);
}
function mn(e, t, n) {
	let r = [...un[dn(t)] ?? []];
	for (let i of [e?.states[t]?.state, ...n]) typeof i == "string" && i !== "" && !r.includes(i) && r.push(i);
	return r.map((n) => ({
		value: n,
		label: pn(e, t, n)
	}));
}
function hn(e, t) {
	let n = e?.states[t];
	if (!n) return null;
	let r = e?.formatEntityState?.(n);
	return typeof r == "string" && r !== "" ? r : pn(e, t, n.state);
}
function gn(e, t, n) {
	let r = n.length === 1 ? n[0] : void 0;
	if (r === void 0) return {
		enter: "When it enters the active states",
		leave: "When it leaves them"
	};
	let i = pn(e, t, r);
	return {
		enter: `When it becomes ${i}`,
		leave: `When it stops being ${i}`
	};
}
//#endregion
//#region src/errors.ts
var A = (e) => e.join("/");
function j(e, t) {
	let n = A(t), r = {};
	for (let t of e) {
		if (!t.path.startsWith(n + "/")) continue;
		let e = t.path.slice(n.length + 1);
		e.includes("/") || (r[e] = t.message);
	}
	return r;
}
function _n(e, t) {
	let n = A(t);
	return e.filter((e) => e.path === n || e.path.startsWith(n + "/")).length;
}
//#endregion
//#region src/events.ts
function M(e, t, n) {
	let r = new CustomEvent("al-change", {
		detail: e,
		bubbles: !0,
		composed: !0
	});
	return t !== void 0 && (r.coalesceKey = t), n && (r.structural = !0), r;
}
var vn = (e, t) => new CustomEvent("al-code-status", {
	detail: {
		valid: e,
		errors: t
	},
	bubbles: !0,
	composed: !0
}), yn = (e) => new CustomEvent("al-select", {
	detail: e,
	bubbles: !0,
	composed: !0
}), bn = (e, t) => new CustomEvent(e, {
	detail: t,
	bubbles: !0,
	composed: !0
}), xn = () => bn("al-select-strip", null), Sn = (e) => bn("al-level-override", { value: e }), Cn = (e) => bn("al-mute-toggle", { muted: e }), wn = () => bn("al-reset", null), Tn = (e) => new CustomEvent("al-nav", {
	detail: e,
	bubbles: !0,
	composed: !0
}), En = () => new CustomEvent("al-live-refresh", {
	detail: null,
	bubbles: !0,
	composed: !0
}), Dn = (e) => new CustomEvent("al-timeline-range", {
	detail: e,
	bubbles: !0,
	composed: !0
}), On = (e, t) => new CustomEvent("al-sim-toggle", {
	detail: {
		gid: e,
		on: t
	},
	bubbles: !0,
	composed: !0
}), kn = (e = !1) => new CustomEvent("al-rebuild", {
	detail: { force: e },
	bubbles: !0,
	composed: !0
}), An = (e) => new CustomEvent("al-map-select", {
	detail: { id: e },
	bubbles: !0,
	composed: !0
});
//#endregion
//#region src/tree-rows.ts
function jn(e, t) {
	let n = [], r = (e, i, a, o, s) => {
		let c = A(i), l = e.children.length > 0 || e.stimuli.length > 0, u = l && t.has(c);
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
var Mn = "activity_levels.groups_expanded";
function Nn() {
	try {
		let e = localStorage.getItem(Mn), t = e === null ? null : JSON.parse(e);
		return Array.isArray(t) ? new Set(t.filter((e) => typeof e == "string")) : /* @__PURE__ */ new Set();
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function Pn(e) {
	try {
		localStorage.setItem(Mn, JSON.stringify([...e]));
	} catch {}
}
//#endregion
//#region src/al-tree.ts
var Fn = (e) => e.stopPropagation(), In = (e) => {
	(e.key === "Enter" || e.key === " ") && e.stopPropagation();
}, Ln = "mdi:flash", Rn = "text/plain", zn = 36, N = class extends r {
	constructor(...e) {
		super(...e), this.selection = null, this.errors = [], this.live = null, this.expanded = Nn(), this.dragging = null, this.target = null, this.menu = null;
	}
	static {
		this.styles = [w, t`
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
		this.dispatchEvent(M(e, void 0, !0));
	}
	emitSelect(e) {
		this.dispatchEvent(yn(e));
	}
	isSelected(e) {
		return this.selection !== null && A(this.selection) === A(e);
	}
	select(e, t) {
		e.stopPropagation(), this.menu = null, this.emitSelect(t);
	}
	toggle(e) {
		let t = A(e), n = new Set(this.expanded);
		n.delete(t) || n.add(t), this.expanded = n, Pn(n);
	}
	open(e) {
		if (e.length === 0) return;
		let t = new Set(this.expanded).add(A(e));
		this.expanded = t, Pn(t);
	}
	listOf(e) {
		return {
			list: e.slice(0, -1),
			index: e[e.length - 1]
		};
	}
	addGroup(e, t, n) {
		let r = this.config;
		r && (this.menu = null, this.open(e.slice(0, -1)), this.open([...e, t]), this.emitChange(Ne(r, e, t, We(dt(r, n), n))), this.emitSelect([...e, t]));
	}
	addStimulus(e, t) {
		let n = this.config;
		if (!n) return;
		this.menu = null, this.open(e);
		let r = [...e, "stimuli"];
		this.emitChange(Ne(n, r, t, rt(""))), this.emitSelect([...r, t]);
	}
	removeNode(e, t) {
		let n = this.config;
		if (!n || !window.confirm(`Delete ${t}? This cannot be undone after saving.`)) return;
		this.emitChange(Me(n, e));
		let r = C(e);
		this.emitSelect(r.length ? r : null);
	}
	tryMove(e, t, n) {
		let r = this.config;
		if (!r || !Be(r, e, t, n).ok) return !1;
		let i = Ue(r, e, t, n);
		if (i === r) return !1;
		let { parent: a, index: o } = He(e, t, n);
		return this.open(a.slice(0, -1)), this.emitChange(i), this.emitSelect([...a, o]), !0;
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(Rn, JSON.stringify(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = {
			key: A(t),
			path: t
		};
	}
	onDragEnd() {
		this.dragging = null, this.target = null;
	}
	whereIn(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || zn, i = r / 3, a = e.clientY - n.top;
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
			let t = e.dataTransfer?.getData(Rn) ?? "", n = JSON.parse(t);
			return Array.isArray(n) ? n : null;
		} catch {
			return null;
		}
	}
	draggedPath(e) {
		return this.dragging === null ? null : e.dataTransfer?.types.includes(Rn) === !0 ? this.dragging.path : null;
	}
	onDragOver(e, t) {
		let n = this.config, r = this.draggedPath(e);
		if (!n || r === null) return;
		e.preventDefault();
		let i = this.whereIn(e, t), { toParent: a, index: o } = this.destination(t, i, r), s = Be(n, r, a, o);
		e.dataTransfer && (e.dataTransfer.dropEffect = s.ok ? "move" : "none"), this.target = {
			key: A(t.path),
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
		this.shadowRoot?.querySelector(`.row[data-path="${A(e)}"]`)?.focus();
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
				t.expanded ? this.toggle(t.path) : this.focusPath(C(t.path));
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
				let e = t.kind === "group" ? v(n, [...r, i - 1]) : void 0;
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
		return e === null || t === void 0 ? null : O(Math.max(0, Math.round((e - t) * 1e3) / 1e3));
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
		if (!e) return i`<ha-card><span class="muted">Loading…</span></ha-card>`;
		if (e.groups.length === 0) return this.renderEmpty();
		let t = jn(e, this.expanded), n = this.tabbableKey(t);
		return i`
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
		return i`
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
		let t = e.filter((e) => e.kind !== "placeholder"), n = this.selection === null ? null : A(this.selection);
		return n !== null && t.some((e) => A(e.path) === n) ? n : t.length === 0 ? "" : A(t[0].path);
	}
	renderRow(t, n, r) {
		if (n.kind === "placeholder") return i`<div class="tree-row placeholder" role="none" style="--al-indent: ${n.depth}">
        <span class="guides"></span>
        Nothing in here yet — add a stimulus or a group with the buttons on the row above.
      </div>`;
		let a = A(n.path), o = this.target?.key === a ? this.target : null, s = this.isSelected(n.path), c = [
			"row",
			"tree-row",
			s ? "selected" : "",
			this.dragging?.key === a ? "dragging" : "",
			o === null ? "" : o.verdict.ok ? `drop-${o.where}` : "illegal"
		].filter(Boolean).join(" ");
		return i`<div
      class=${c}
      style="--al-indent: ${n.depth}"
      data-path=${a}
      role="treeitem"
      tabindex=${a === r ? "0" : "-1"}
      draggable="true"
      aria-level=${n.depth + 1}
      aria-setsize=${n.setsize}
      aria-posinset=${n.posinset}
      aria-selected=${s ? "true" : "false"}
      aria-expanded=${n.expandable ? n.expanded ? "true" : "false" : e}
      @click=${(e) => this.select(e, n.path)}
      @keydown=${(e) => this.onRowKeydown(e, n)}
      @dragstart=${(e) => this.onDragStart(e, n.path)}
      @dragend=${this.onDragEnd}
      @dragover=${(e) => this.onDragOver(e, n)}
      @drop=${(e) => this.onDrop(e, n)}
    >
      <span class="guides"></span>
      ${n.expandable ? i`<ha-icon-button
            class="caret"
            label=${n.expanded ? "Collapse" : "Expand"}
            title=${n.expanded ? "Collapse" : "Expand"}
            @keydown=${In}
            @click=${(e) => {
			e.stopPropagation(), this.toggle(n.path);
		}}
          >
            <ha-icon icon=${n.expanded ? "mdi:chevron-down" : "mdi:chevron-right"}></ha-icon>
          </ha-icon-button>` : i`<span class="caret"></span>`}
      ${this.renderIcon(n)}
      <button
        type="button"
        class="label"
        title=${n.kind === "stimulus" ? n.stimulus?.entity ?? "" : "Edit this group"}
        @keydown=${In}
        @click=${(e) => this.select(e, n.path)}
      >
        ${this.labelFor(n)}
      </button>
      ${o !== null && !o.verdict.ok ? i`<span class="hint">${o.verdict.reason}</span>` : this.renderRowStatus(t, n)}
      ${this.renderActions(n)} ${this.menu === a ? this.renderAddMenu(n) : e}
    </div>`;
	}
	renderIcon(e) {
		if (e.kind === "group" && e.group) return i`<ha-icon icon=${_[e.group.kind].icon}></ha-icon>`;
		let t = e.stimulus ? this.hass?.states[e.stimulus.entity] : void 0;
		return t ? i`<ha-state-icon .hass=${this.hass} .stateObj=${t}></ha-state-icon>` : i`<ha-icon icon=${Ln}></ha-icon>`;
	}
	renderRowStatus(t, n) {
		let r = _n(this.errors, n.path), a = r ? i`<span class="badge" title="${r} problem(s) in this group">${r}</span>` : e;
		if (n.kind === "stimulus") {
			let r = n.stimulus, o = r === void 0 ? null : hn(this.hass, r.entity), s = v(t, C(n.path)), c = s === void 0 ? void 0 : this.live?.voices[s.id]?.find((e) => e.label === (r?.key ?? r?.entity));
			return i`${a}${o === null ? e : i`<span class="muted chip">${o}</span>`}
      ${c ? i`<span class="chip phase ${c.phase}" title=${this.voiceTitle(c)}>${c.phase}</span>
            <span class="muted chip">${c.value.toFixed(2)}</span>` : e}`;
		}
		let o = n.group, s = o === void 0 ? void 0 : this.live?.groups[o.id], c = s?.max_value ?? o?.max_value ?? t.defaults.max_value, l = s ? Math.max(0, Math.min(100, s.value / (c || 1) * 100)) : 0;
		return i`${a}
    ${s ? i`<div class="meter" title=${this.meterTitle(s, c, n.depth === 0)}>
            <div style="width: ${l}%"></div>
          </div>
          <span class="dot ${s.gated ? "gated" : ""}" title=${s.gated ? "Gate open" : "Gate closed"}></span>` : e}`;
	}
	renderActions(e) {
		let t = e.path;
		if (e.kind === "stimulus") return i`<div class="actions" @click=${Fn} @keydown=${In}>
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
		return n === void 0 ? i`<div class="actions"></div>` : i`<div class="actions" @click=${Fn} @keydown=${In}>
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
        aria-expanded=${this.menu === A(t) ? "true" : "false"}
        .disabled=${Oe(n.kind).length === 0}
        @click=${() => {
			this.menu = this.menu === A(t) ? null : A(t);
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
	renderAddMenu(t) {
		let n = t.group;
		return n === void 0 ? i`${e}` : i`<div
      class="add-menu"
      role="menu"
      draggable="false"
      @click=${Fn}
      @keydown=${In}
      @dragstart=${Fn}
    >
      ${Oe(n.kind).map((e) => i`<button
          type="button"
          role="menuitem"
          data-kind=${e}
          @click=${() => this.addGroup([...t.path, "children"], n.children.length, e)}
        >
          <ha-icon icon=${_[e].icon}></ha-icon>
          <span>
            <strong>${_[e].label}</strong>
            <div class="muted">${_[e].definition}</div>
          </span>
        </button>`)}
    </div>`;
	}
};
m([s({ attribute: !1 })], N.prototype, "hass", void 0), m([s({ attribute: !1 })], N.prototype, "config", void 0), m([s({ attribute: !1 })], N.prototype, "selection", void 0), m([s({ attribute: !1 })], N.prototype, "errors", void 0), m([s({ attribute: !1 })], N.prototype, "live", void 0), m([g()], N.prototype, "expanded", void 0), m([g()], N.prototype, "dragging", void 0), m([g()], N.prototype, "target", void 0), m([g()], N.prototype, "menu", void 0), N = m([h("al-tree")], N);
//#endregion
//#region src/ha-links.ts
function Bn(e, t, n) {
	return t ? i`<a href=${`/config/${e === "device" ? "devices" : "areas"}/${e}/${encodeURIComponent(t)}`}>${n}</a>` : n;
}
function Vn(t, n, r, a = "Open entity", o, s = "Open device", c = !1) {
	let l = r && (n?.states?.[r] || n?.entities?.[r]), u = o ?? (r ? n?.entities?.[r]?.device_id : null), d = () => t.dispatchEvent(new CustomEvent("hass-more-info", {
		detail: { entityId: r },
		bubbles: !0,
		composed: !0
	}));
	return i`${l ? c ? i`<button type="button" @click=${d}>${a}</button>` : i`<ha-button @click=${d}>${a}</ha-button>` : e}
    ${u ? Bn("device", u, s) : e}`;
}
//#endregion
//#region src/convert.ts
var Hn = (e) => e == null || e === "" ? null : e;
function Un(e, t) {
	if (t != null) switch (e) {
		case "duration": return E(t);
		case "boolean": return t ? "true" : "false";
		default: return t;
	}
}
function Wn(e, t) {
	if (t == null || t === "") return null;
	switch (e) {
		case "duration": return D(t);
		case "boolean": return t === !0 || t === "true";
		case "number":
		case "multiplier": {
			let e = typeof t == "number" ? t : Number(t);
			return Number.isNaN(e) ? null : e;
		}
		default: return String(t);
	}
}
function Gn(e, t) {
	if (t == null) return "unset";
	switch (e) {
		case "duration": return O(t);
		case "boolean": return t ? "Yes" : "No";
		case "multiplier": return Kn(t);
		default: return String(t);
	}
}
var Kn = (e) => `${e.toFixed(1)}×`, qn = [
	"kind",
	"floor_id",
	"area_id",
	"id",
	"name"
], Jn = [
	"mix",
	"null_handling",
	"gain"
], Yn = {
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
}, Xn = {
	id: "Identifies the group and its entities. Changing it re-creates them.",
	name: "Friendly name; falls back to the area's name, then to the id.",
	kind: "What this is on the property. It decides what can go inside it.",
	floor_id: "Bind this to a Home Assistant floor to reuse its name.",
	area_id: "Bind this to a Home Assistant area to reuse its name and put its entities in the right place.",
	mix: "How stimuli and child groups combine into this group's value.",
	null_handling: "Whether idle contributors count as zero or drop out of the mean.",
	gain: "Scales this group's contribution to its parent."
}, Zn = (e) => Yn[e.name] ?? e.name, Qn = (e) => Xn[e.name] ?? "", $n = [
	"id",
	"name",
	"kind",
	"floor_id",
	"area_id",
	"mix",
	"null_handling",
	"gain"
], er = [
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
], tr = [{
	value: "zero",
	label: "Idle counts as 0"
}, {
	value: "ignore",
	label: "Ignore idle"
}], nr = "How this group's stimuli and children combine into one level.", rr = "Adjacent groups are ones you can walk between without passing through another group in this configuration. Sensors don't matter here — an unobserved hallway is still a room.", ir = "How loudly 'somebody is here' plays in this group's mix.", ar = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, or = { select: {
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
} }, sr = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, cr = (e, t, n) => {
	switch (e) {
		case "null_handling": return t.mix === "mean";
		case "gain": return !n;
		case "floor_id": return t.kind === "floor";
		case "area_id": return De.has(t.kind);
		default: return !0;
	}
}, lr = (e, t) => {
	let n = [...Oe(t)];
	return n.includes(e.kind) || n.push(e.kind), { select: {
		mode: "dropdown",
		options: n.map((e) => ({
			value: e,
			label: _[e].label
		}))
	} };
};
function ur(e, t, n, r, i = null) {
	let a = {
		id: { text: {} },
		name: { text: {} },
		kind: lr(e, i),
		floor_id: { floor: {} },
		area_id: { area: {} },
		mix: { select: {
			mode: "dropdown",
			options: er
		} },
		null_handling: { select: {
			mode: "dropdown",
			options: tr
		} },
		gain: sr
	};
	return n.filter((n) => cr(n, e, t)).map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function dr(e, t, n, r) {
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
	return Object.fromEntries(n.filter((n) => cr(n, e, t) && (n !== "area_id" || e.area_id !== null) && (n !== "floor_id" || e.floor_id !== null)).map((e) => [e, i[e]]));
}
function fr(e, t) {
	let n = { ...e };
	return "id" in t && (n.id = String(t.id ?? "")), "name" in t && (n.name = Hn(t.name)), "kind" in t && typeof t.kind == "string" && (n.kind = t.kind), "floor_id" in t && (n.floor_id = Hn(t.floor_id)), "area_id" in t && (n.area_id = Hn(t.area_id)), "mix" in t && (n.mix = t.mix ?? e.mix), "null_handling" in t && (n.null_handling = t.null_handling ?? e.null_handling), "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), n;
}
var pr = (e, t) => $n.find((n) => e[n] !== t[n]), mr = (e) => e.id === "" || RegExp(`^${e.kind}(_\\d+)?$`).test(e.id);
function hr(e, t, n, r, i) {
	let a = {
		...e,
		[t]: n
	};
	return n === null ? a : (mr(e) && (a.id = i ? dt(i, n) : ct(n)), e.name === null && r !== null && (a.name = r), a);
}
var gr = (e, t, n, r) => hr(e, "area_id", t, n, r), _r = (e, t, n, r) => hr(e, "floor_id", t, n, r), vr = "activity_levels.panels";
function yr() {
	try {
		let e = localStorage.getItem(vr), t = e === null ? null : JSON.parse(e);
		return typeof t != "object" || !t || Array.isArray(t) ? {} : t;
	} catch {
		return {};
	}
}
function br(e, t) {
	let n = yr()[e];
	return typeof n == "boolean" ? n : t;
}
function xr(e, t) {
	try {
		localStorage.setItem(vr, JSON.stringify({
			...yr(),
			[e]: t
		}));
	} catch {}
}
//#endregion
//#region src/panels.ts
function P(t, n, r, a, o, s, c = e) {
	let l = `${t}:${n}`;
	return i`<ha-expansion-panel
    outlined
    left-chevron
    data-panel=${n}
    ?expanded=${br(l, o)}
    @expanded-changed=${(e) => {
		xr(l, e.detail.expanded);
	}}
  >
    <div slot="header" class="panel-header">
      <span>${r} ${c}</span>
      <div class="muted">${a}</div>
    </div>
    <div class="panel-body">${s}</div>
  </ha-expansion-panel>`;
}
//#endregion
//#region src/al-adjacency-table.ts
var Sr = class extends r {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [w, t`
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
		return this.config && this.path ? S(this.config, this.path) : void 0;
	}
	get edges() {
		return (this.group?.adjacent ?? []).map((e) => ({
			id: qe(e),
			connection: Ye(e),
			one_way: Je(e)
		}));
	}
	emit(e) {
		let { config: t, path: n } = this;
		!t || !n || this.dispatchEvent(M(y(t, [...n, "adjacent"], e), void 0, !0));
	}
	edit(e, t) {
		this.emit(this.edges.map((n, r) => r === e ? {
			...n,
			...t
		} : n));
	}
	nameOf(e) {
		return (this.config ? Xe(this.config).find(({ group: t }) => t.id === e) : void 0)?.group.name ?? e;
	}
	candidates() {
		let e = this.group;
		if (!this.config || !e) return [];
		let t = /* @__PURE__ */ new Set([
			e.id,
			...this.edges.map((e) => e.id),
			...Ze(this.config, e.id).map((e) => e.group.id)
		]);
		return Xe(this.config).map(({ group: e }) => e).filter((e) => De.has(e.kind) && !t.has(e.id));
	}
	errorFor(e) {
		let t = `${(this.path ?? []).join("/")}/adjacent/${e}`;
		return this.errors.find((e) => e.path === t || e.path.startsWith(`${t}/`))?.message;
	}
	render() {
		let t = this.group;
		if (!this.config || !t) return e;
		let n = Ze(this.config, t.id), r = this.candidates();
		return i`
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
          ${n.map(({ group: e, edge: t }) => this.renderDeclared(e, t))}
          ${this.edges.length === 0 && n.length === 0 ? i`<tr class="empty">
                <td colspan="4" class="muted">Nothing next door yet.</td>
              </tr>` : e}
        </tbody>
      </table>
      ${r.length === 0 ? e : i`<select
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
            ${r.map((e) => i`<option value=${e.id}>${e.name ?? e.id}</option>`)}
          </select>`}
    `;
	}
	renderOwn(t, n) {
		let r = this.errorFor(n), a = this.nameOf(t.id);
		return i`<tr class="own" data-id=${t.id}>
      <td>${a} ${r ? i`<div class="muted error">${r}</div>` : e}</td>
      <td>
        <select
          class="connection"
          aria-label="How this group joins ${a}"
          .value=${t.connection}
          @change=${(e) => this.edit(n, { connection: e.target.value })}
        >
          ${Se.map((e) => i`<option value=${e} ?selected=${e === t.connection}>${we[e]}</option>`)}
        </select>
      </td>
      <td>
        <input
          class="both-ways"
          type="checkbox"
          aria-label="You can walk both ways between here and ${a}"
          title="Unchecked means you can only go this way"
          .checked=${!t.one_way}
          @change=${(e) => this.edit(n, { one_way: !e.target.checked })}
        />
      </td>
      <td>
        <ha-icon-button
          label="Remove ${a}"
          data-action="remove"
          @click=${() => this.emit(this.edges.filter((e, t) => t !== n))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
      </td>
    </tr>`;
	}
	renderDeclared(e, t) {
		let n = e.name ?? e.id;
		return i`<tr class="declared" data-id=${e.id}>
      <td><span class="muted">declared on</span> ${n}</td>
      <td>${we[t.connection]}</td>
      <td>${t.one_way ? "One way" : "Both ways"}</td>
      <td></td>
    </tr>`;
	}
};
m([s({ attribute: !1 })], Sr.prototype, "config", void 0), m([s({ attribute: !1 })], Sr.prototype, "path", void 0), m([s({ attribute: !1 })], Sr.prototype, "errors", void 0), Sr = m([h("al-adjacency-table")], Sr);
//#endregion
//#region src/al-override-field.ts
var Cr = { select: {
	mode: "dropdown",
	options: [{
		value: "true",
		label: "Yes"
	}, {
		value: "false",
		label: "No"
	}]
} };
function wr(e, t) {
	return e.select?.options?.find((e) => e.value === t)?.label;
}
var F = class extends r {
	constructor(...e) {
		super(...e), this.label = "", this.selector = { text: {} }, this.value = null, this.inherited = null, this.inheritedFrom = "defaults", this.hint = "", this.kind = "number", this.disabled = !1;
	}
	static {
		this.styles = [w, t`
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
		e.stopPropagation(), this.emit(Wn(this.kind, e.detail?.value));
	}
	onReset() {
		this.emit(null);
	}
	describeInherited() {
		let e = this.inherited;
		if (this.kind === "select" && e != null) {
			let t = wr(this.selector, String(e));
			if (t !== void 0) return t;
		}
		return Gn(this.kind, e);
	}
	render() {
		let t = this.overridden ? "Overridden" : `Inherited from ${this.inheritedFrom}: ${this.describeInherited()}`, n = this.hint === "" ? t : `${this.hint} ${t}`;
		return i`
      <div class="row">
        <ha-selector
          class="field"
          .hass=${this.hass}
          .selector=${this.kind === "boolean" ? Cr : this.selector}
          .label=${this.label}
          .required=${!1}
          .disabled=${this.disabled}
          .value=${Un(this.kind, this.value)}
          .helper=${n}
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
      ${this.error ? i`<div class="muted error msg">${this.error}</div>` : e}
    `;
	}
};
m([s({ attribute: !1 })], F.prototype, "hass", void 0), m([s()], F.prototype, "label", void 0), m([s({ attribute: !1 })], F.prototype, "selector", void 0), m([s({ attribute: !1 })], F.prototype, "value", void 0), m([s({ attribute: !1 })], F.prototype, "inherited", void 0), m([s({ attribute: "inherited-from" })], F.prototype, "inheritedFrom", void 0), m([s()], F.prototype, "hint", void 0), m([s()], F.prototype, "kind", void 0), m([s()], F.prototype, "error", void 0), m([s({ type: Boolean })], F.prototype, "disabled", void 0), F = m([h("al-override-field")], F);
//#endregion
//#region src/stimulus-form.ts
var Tr = {
	entity: "Entity",
	mode: "Mode",
	to: "Active states",
	edges: "Fire on",
	gain: "Gain",
	key: "Label",
	envelope: "Envelope preset"
}, Er = {
	entity: "The entity whose state drives this stimulus.",
	mode: "Sustained holds a note while the entity is in its active states. Momentary treats each crossing as one event.",
	to: "Which states of this entity count as active.",
	edges: "Which crossings fire a trigger. At least one.",
	gain: "How loudly this stimulus contributes to its group.",
	key: "Optional name for this trigger; defaults to the entity id.",
	envelope: "Preset the overrides below start from."
}, Dr = (e) => Tr[e.name] ?? e.name, Or = (e) => Er[e.name] ?? "", kr = [
	"entity",
	"mode",
	"gain",
	"key",
	"envelope"
], I = { duration: { enable_millisecond: !0 } }, Ar = { number: {
	min: 0,
	step: .1,
	mode: "box",
	unit_of_measurement: "×"
} }, jr = { number: {
	min: .1,
	max: 10,
	step: .1,
	mode: "slider"
} }, Mr = "Allow retrigger", Nr = "When a new trigger is honoured while the envelope is still active.", Pr = "Stacks", Fr = "Each honoured trigger adds its gain on top of the current level instead of restarting the rise.", Ir = { select: {
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
} }, Lr = { select: {
	mode: "list",
	options: [{
		value: "sustained",
		label: "Sustained — hold while it is active"
	}, {
		value: "momentary",
		label: "Momentary — fire on each change"
	}]
} }, Rr = [
	"attack",
	"decay",
	"impulse"
], zr = "A momentary trigger is always an impulse: the state change is the whole event, so there is nothing to hold the envelope open — it jumps to its peak and releases. Attack and decay never run.", Br = (e, t) => e.mode === "momentary" && Rr.includes(t), Vr = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, Hr = "(unknown preset — using built-in defaults)", Ur = [
	{
		name: "attack",
		label: "Attack",
		kind: "duration",
		selector: I
	},
	{
		name: "decay",
		label: "Decay",
		kind: "duration",
		selector: I
	},
	{
		name: "sustain",
		label: "Sustain",
		kind: "multiplier",
		selector: Ar
	},
	{
		name: "release",
		label: "Release",
		kind: "duration",
		selector: I
	},
	{
		name: "impulse",
		label: "Impulse",
		kind: "boolean",
		selector: Cr
	},
	{
		name: "retrigger",
		label: Mr,
		kind: "select",
		selector: Ir,
		hint: Nr
	},
	{
		name: "stack",
		label: Pr,
		kind: "boolean",
		selector: Cr,
		hint: Fr
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: Vr
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: I
	}
], Wr = [
	"entity",
	"mode",
	"to",
	"edges",
	"key"
], Gr = (e) => Wr.filter((t) => t !== "edges" || e.mode === "momentary"), Kr = ["envelope", "gain"], qr = "How a single trigger rises and falls over time.", Jr = "What makes this stimulus fire, and what it is called in the mix.", Yr = "Change part of the preset for this stimulus only.", Xr = (e) => Ur.filter((t) => e[t.name] !== null && e[t.name] !== void 0).length, Zr = (e) => [{
	value: "",
	label: "(default preset)"
}, ...e.envelopes.map((e) => ({
	value: e.id,
	label: e.id
}))];
function Qr(e, t, n, r) {
	let i = gn(n, t.entity, t.to), a = {
		entity: { entity: {} },
		mode: Lr,
		to: { select: {
			mode: "dropdown",
			multiple: !0,
			custom_value: !0,
			options: mn(n, t.entity, t.to)
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
		gain: jr,
		key: { text: {} },
		envelope: { select: {
			mode: "dropdown",
			options: Zr(e)
		} }
	};
	return r.map((e) => ({
		name: e,
		selector: a[e]
	}));
}
function $r(e, t) {
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
var ei = (e) => Array.isArray(e) ? e.filter((e) => typeof e == "string" && e !== "") : [];
function ti(e, t) {
	let n = { ...e };
	if ("entity" in t && (n.entity = String(t.entity ?? "")), "mode" in t && (t.mode === "sustained" || t.mode === "momentary") && (n.mode = t.mode), "to" in t && (n.to = ei(t.to)), "edges" in t) {
		let e = ei(t.edges).filter((e) => e === "enter" || e === "leave");
		e.length > 0 && (n.edges = e);
	}
	return "gain" in t && (n.gain = typeof t.gain == "number" ? t.gain : e.gain), "key" in t && (n.key = Hn(t.key)), "envelope" in t && (n.envelope = Hn(t.envelope)), n;
}
var ni = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]);
function ri(e, t) {
	return ni(e.to, t.to) ? ni(e.edges, t.edges) ? kr.find((n) => e[n] !== t[n]) : "edges" : "to";
}
function ii(e, t, n) {
	let r = _t(e, t.envelope);
	return r ? r[n] === null || r[n] === void 0 ? "defaults" : t.envelope ?? e.defaults.envelope : Hr;
}
function ai(e, t) {
	return t == null || e === void 0 ? null : O(Math.max(0, Math.round((t - e) * 1e3) / 1e3));
}
//#endregion
//#region src/sketch.ts
var oi = (e) => e.release * e.sustain, si = (e) => Math.max(1, e.sustain), ci = (e) => e.sustain / si(e);
function li(e, t = .25) {
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
	let n = oi(e), r = e.attack + e.decay + n, i = r > 0 ? r * t / (1 - t) : 1, a = r + i, o = 1 / si(e), s = ci(e), c = 0, l = [{
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
function ui(e, t = .25) {
	let n = li(e, t), r = (e) => ((n[e]?.x ?? 0) + (n[e + 1]?.x ?? 0)) / 2;
	if (e.impulse) {
		let t = [{
			text: "impulse",
			x: 0
		}];
		return e.release > 0 && t.push({
			text: `R ${O(e.release)}`,
			x: r(1)
		}), t;
	}
	let i = [];
	return e.attack > 0 && i.push({
		text: `A ${O(e.attack)}`,
		x: r(0)
	}), e.decay > 0 && i.push({
		text: `D ${O(e.decay)}`,
		x: r(1)
	}), i.push({
		text: `S ${Kn(e.sustain)}`,
		x: r(2)
	}), oi(e) > 0 && i.push({
		text: `R ${O(e.release)}`,
		x: r(3)
	}), i;
}
//#endregion
//#region src/al-envelope-sketch.ts
var di = 10, fi = 190, pi = 58, mi = 72, hi = (e) => di + e * 180, gi = (e) => pi - e * 48, _i = (e) => String(Math.round(e * 10) / 10), vi = (e, t) => `${_i(e)},${_i(t)}`, yi = (e) => Math.min(184, Math.max(16, hi(e))), bi = class extends r {
	constructor(...e) {
		super(...e), this.envelope = null;
	}
	static {
		this.styles = [w, t`
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
		let t = this.envelope;
		if (!t) return e;
		let r = li(t), a = r[0], o = r[r.length - 1], s = r.map((e) => vi(hi(e.x), gi(e.y))).join(" "), c = `${vi(hi(a.x), pi)} ${s} ${vi(hi(o.x), pi)}`, l = ui(t), u = t.impulse ? "Impulse envelope" : "Attack, decay, sustain, release envelope";
		return i`
      <svg viewBox="0 0 200 80" role="img" aria-label=${u}>
        <title>${u}</title>
        <line class="grid" x1=${di} y1=${pi} x2=${fi} y2=${pi}></line>
        ${t.impulse ? e : n`<line
              class="grid"
              x1=${di}
              y1=${_i(gi(ci(t)))}
              x2=${fi}
              y2=${_i(gi(ci(t)))}
            ></line>`}
        <polygon class="area" points=${c}></polygon>
        <polyline class="curve" points=${s}></polyline>
        ${l.map((e) => n`<text class="caption" x=${_i(yi(e.x))} y=${mi} text-anchor="middle">${e.text}</text>`)}
      </svg>
    `;
	}
};
m([s({ attribute: !1 })], bi.prototype, "envelope", void 0), bi = m([h("al-envelope-sketch")], bi);
//#endregion
//#region src/al-presence-overrides.ts
var xi = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, L = class extends r {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [w];
	}
	setPresence(e, t) {
		let { config: n, path: r } = this;
		if (!n || !r) return;
		let i = S(n, r);
		if (!i) return;
		let a = y(n, [...r, "presence"], {
			...i.presence ?? Ke(),
			[e]: t
		});
		this.dispatchEvent(M(a, `${A(r)}:presence:${e}`));
	}
	render() {
		let { config: t, path: n } = this, r = t && n ? S(t, n) : void 0;
		if (!t || !n || !r) return e;
		let a = r.presence ?? Ke(), o = a.envelope ?? x(t).envelope, s = vt(t, {
			...a,
			envelope: o
		}), c = j(this.errors, [...n, "presence"]);
		return i`
      <ha-selector
        class="presence-envelope"
        .hass=${this.hass}
        .selector=${{ select: {
			mode: "dropdown",
			options: Zr(t)
		} }}
        .label=${"Envelope preset"}
        .required=${!1}
        .value=${a.envelope ?? ""}
        @value-changed=${(e) => this.setPresence("envelope", e.detail.value === "" ? null : e.detail.value)}
      ></ha-selector>
      <al-override-field
        class="presence-gain"
        .hass=${this.hass}
        label="Gain"
        kind="number"
        .selector=${jr}
        .value=${a.gain}
        .inherited=${1}
        .inheritedFrom=${"presence"}
        .error=${c.gain}
        @value-changed=${(e) => this.setPresence("gain", e.detail.value ?? 1)}
      ></al-override-field>
      <al-override-field
        class="presence-activity_floor"
        .hass=${this.hass}
        label="Empty-room floor"
        hint="Likelihood of this room at an activity level of 0.0. Set 1 for a room people sleep in: a still sleeper trips no motion, and the estimator must not read that as an empty room."
        kind="number"
        .selector=${xi}
        .value=${a.activity_floor}
        .inherited=${x(t).activity.floor}
        .inheritedFrom=${"presence"}
        .error=${c.activity_floor}
        @value-changed=${(e) => this.setPresence("activity_floor", e.detail.value ?? null)}
      ></al-override-field>
      ${Ur.map((e) => i`<al-override-field
          class="presence-${e.name}"
          .hass=${this.hass}
          .label=${e.label}
          .hint=${e.hint ?? ""}
          .kind=${e.kind}
          .selector=${e.selector}
          .value=${a[e.name]}
          .inherited=${s[e.name]}
          .inheritedFrom=${o ?? "defaults"}
          .error=${c[e.name]}
          @value-changed=${(t) => this.setPresence(e.name, t.detail.value)}
        ></al-override-field>`)}
      <al-envelope-sketch .envelope=${s}></al-envelope-sketch>
    `;
	}
};
m([s({ attribute: !1 })], L.prototype, "hass", void 0), m([s({ attribute: !1 })], L.prototype, "config", void 0), m([s({ attribute: !1 })], L.prototype, "path", void 0), m([s({ attribute: !1 })], L.prototype, "errors", void 0), L = m([h("al-presence-overrides")], L);
//#endregion
//#region src/al-group-editor.ts
var Si = "People can leave the property from here, so presence can move from here to Away.", R = class extends r {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [];
	}
	static {
		this.styles = [w, t`
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
		this.dispatchEvent(M(e, t));
	}
	emitSelect(e) {
		this.dispatchEvent(yn(e));
	}
	onIdentityChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = S(t, n);
		if (!r) return;
		let i = e.detail?.value ?? {}, a = fr(r, i);
		"area_id" in i && a.area_id !== r.area_id && (a = gr(a, a.area_id, a.area_id === null ? null : this.areaName(a.area_id), t)), "floor_id" in i && a.floor_id !== r.floor_id && (a = _r(a, a.floor_id, a.floor_id === null ? null : this.floorName(a.floor_id), t));
		let o = pr(a, r);
		o !== void 0 && this.emitChange(y(t, n, a), `${A(n)}:${o}`);
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
		let r = S(t, n);
		if (!r) return;
		let i = fr(r, e.detail?.value ?? {}), a = pr(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${A(n)}:${a}`);
	}
	setField(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(y(n, [...r, e], t), `${A(r)}:${e}`);
	}
	onDelete() {
		let { config: e, path: t } = this;
		if (!e || !t) return;
		let n = S(e, t);
		if (!n || !window.confirm(`Delete group "${n.name || n.id}" and everything in it?`)) return;
		this.emitChange(Me(e, t));
		let r = C(t);
		this.emitSelect(r.length ? r : null);
	}
	render() {
		let { config: t, path: n } = this;
		if (!t || !n || n.length === 0) return i`<ha-card><span class="muted">Select a group.</span></ha-card>`;
		let r = S(t, n);
		if (!r) return i`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		let a = n.length === 2, o = this.errors.filter((e) => e.path === A(n)), s = j(this.errors, n), c = n.length > 2 ? S(t, C(n)) : void 0;
		return i`
      <ha-card header="Group">
        ${r.area_id ? Bn("area", r.area_id, "Open Home Assistant area") : e}
        ${o.map((e) => i`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${P("group", "identity", "Identity", _[r.kind].definition, !0, i`
            <ha-form
              .hass=${this.hass}
              .data=${dr(r, a, qn, t)}
              .schema=${ur(r, a, qn, t, c?.kind ?? null)}
              .error=${s}
              .computeLabel=${Zn}
              .computeHelper=${Qn}
              @value-changed=${this.onIdentityChanged}
            ></ha-form>
            <div class="muted note">Changing the id re-creates this group's entities.</div>
            ${this.renderStale(t, r, s)}
          `)}
        ${P("group", "mix", "Mix", nr, !0, this.renderMix(t, r, a, s))}
        ${this.renderAdjacency(t, r, s)} ${this.renderPresence(t, r, n)}
        <div class="danger">
          <ha-button appearance="plain" @click=${this.onDelete}>Delete group</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderMix(e, t, n, r) {
		return i`
      <ha-form
        .hass=${this.hass}
        .data=${dr(t, n, Jn, e)}
        .schema=${ur(t, n, Jn, e)}
        .error=${r}
        .computeLabel=${Zn}
        .computeHelper=${Qn}
        @value-changed=${this.onMixChanged}
      ></ha-form>
      <al-override-field
        .hass=${this.hass}
        .label=${Yn.max_value}
        kind="number"
        .selector=${ar}
        .value=${t.max_value}
        .inherited=${e.defaults.max_value}
        .inheritedFrom=${"defaults"}
        .error=${r.max_value}
        @value-changed=${(e) => this.setField("max_value", e.detail.value)}
      ></al-override-field>
      <al-override-field
        .hass=${this.hass}
        .label=${Yn.precision}
        kind="select"
        .selector=${or}
        .value=${t.precision === null ? null : String(t.precision)}
        .inherited=${String(e.defaults.precision)}
        .inheritedFrom=${"defaults"}
        .error=${r.precision}
        @value-changed=${(e) => this.setField("precision", e.detail.value === null ? null : Number(e.detail.value))}
      ></al-override-field>
    `;
	}
	renderAdjacency(t, n, r) {
		return De.has(n.kind) ? P("group", "adjacent", "Adjacent groups", rr, !0, i`
        <al-adjacency-table
          .config=${t}
          .path=${this.path}
          .errors=${this.errors}
        ></al-adjacency-table>
        ${this.renderExit(n, r)}
      `) : e;
	}
	renderExit(t, n) {
		return i`<div class="exit row">
      <ha-switch
        .checked=${t.exit === !0}
        @change=${(e) => this.setField("exit", e.target.checked === !0)}
      ></ha-switch>
      <div>
        <div>Leads off the property</div>
        <div class="muted">${Si}</div>
        ${n.exit ? i`<div class="error">${n.exit}</div>` : e}
      </div>
    </div>`;
	}
	renderPresence(t, n, r) {
		return x(t).enabled ? P("group", "presence", "Presence", ir, !1, i`<al-presence-overrides
        .hass=${this.hass}
        .config=${t}
        .path=${r}
        .errors=${this.errors}
      ></al-presence-overrides>`) : e;
	}
	renderStale(t, n, r) {
		if (De.has(n.kind)) return e;
		let a = [n.adjacent.length > 0 ? "adjacent groups" : null, n.exit === !0 ? "a way off the property" : null].filter((e) => e !== null);
		if (a.length === 0) return e;
		let o = r.adjacent ?? r.exit ?? `${_[n.kind].label} groups have no ${a.join(" and no ")}.`;
		return i`<div class="stale row">
      <div class="grow error">${o}</div>
      <ha-button appearance="plain" @click=${() => this.clearStale(t)}>Remove</ha-button>
    </div>`;
	}
	clearStale(e) {
		let t = this.path;
		if (!t) return;
		let n = y(y(e, [...t, "adjacent"], []), [...t, "exit"], !1);
		this.dispatchEvent(M(n, void 0, !0));
	}
};
m([s({ attribute: !1 })], R.prototype, "hass", void 0), m([s({ attribute: !1 })], R.prototype, "config", void 0), m([s({ attribute: !1 })], R.prototype, "path", void 0), m([s({ attribute: !1 })], R.prototype, "errors", void 0), R = m([h("al-group-editor")], R);
//#endregion
//#region src/al-stimulus-editor.ts
var z = class extends r {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null;
	}
	static {
		this.styles = [w, t`
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
		this.dispatchEvent(M(e, t));
	}
	onFormChanged(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = ht(t, n);
		if (!r) return;
		let i = ti(r, e.detail?.value ?? {}), a = ri(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${A(n)}:${a}`);
	}
	setOverride(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(y(n, [...r, e], t), `${A(r)}:${e}`);
	}
	renderLive(t, n) {
		return t ? i`<div class="row live">
      <span class="muted">Live</span>
      <span class="chip phase ${t.phase}">${t.phase}</span>
      <span class="chip">${t.value.toFixed(2)}</span>
      ${n === null ? e : i`<span class="muted chip">ends in ${n}</span>`}
      <span class="dot ${t.gate ? "gated" : ""}" title=${t.gate ? "Gate open" : "Gate closed"}></span>
    </div>` : e;
	}
	renderOverride(e, t, n, r) {
		let { config: a } = this, o = Br(t, e.name);
		return i`<al-override-field
      .hass=${this.hass}
      .label=${e.label}
      .disabled=${o}
      .hint=${o ? zr : e.hint ?? ""}
      .kind=${e.kind}
      .selector=${e.selector}
      .value=${t[e.name]}
      .inherited=${n[e.name]}
      .inheritedFrom=${a ? ii(a, t, e.name) : "defaults"}
      .error=${r[e.name]}
      @value-changed=${(t) => this.setOverride(e.name, t.detail.value)}
    ></al-override-field>`;
	}
	render() {
		let { config: t, path: n } = this;
		if (!t || !n || n.length < 3) return i`<ha-card><span class="muted">Select a stimulus.</span></ha-card>`;
		let r = ht(t, n);
		if (!r) return i`<ha-card><span class="muted">This stimulus no longer exists.</span></ha-card>`;
		let a = S(t, C(n)), o = j(this.errors, n), s = this.errors.filter((e) => e.path === A(n)), c = vt(t, r), l = this.live?.voices[a?.id ?? ""]?.find((e) => e.label === (r.key ?? r.entity)), u = ai(this.live?.now, l?.phase_ends), d = Xr(r);
		return i`
      <ha-card header="Stimulus">
        ${Vn(this, this.hass, r.entity)}
        ${s.map((e) => i`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${P("stimulus", "source", "Source", Jr, !0, i`
            <ha-form
              .hass=${this.hass}
              .data=${$r(r, Gr(r))}
              .schema=${Qr(t, r, this.hass, Gr(r))}
              .error=${o}
              .computeLabel=${Dr}
              .computeHelper=${Or}
              @value-changed=${this.onFormChanged}
            ></ha-form>
          `)}
        ${P("stimulus", "envelope", "Envelope", qr, !0, i`
            <ha-form
              .hass=${this.hass}
              .data=${$r(r, Kr)}
              .schema=${Qr(t, r, this.hass, Kr)}
              .error=${o}
              .computeLabel=${Dr}
              .computeHelper=${Or}
              @value-changed=${this.onFormChanged}
            ></ha-form>
            ${this.renderLive(l, u)}
            <al-envelope-sketch .envelope=${c}></al-envelope-sketch>
          `)}
        ${P("stimulus", "overrides", "Override preset", Yr, !1, Ur.map((e) => this.renderOverride(e, r, c, o)), d === 0 ? e : i`<span class="badge">${d} overridden</span>`)}
      </ha-card>
    `;
	}
};
m([s({ attribute: !1 })], z.prototype, "hass", void 0), m([s({ attribute: !1 })], z.prototype, "config", void 0), m([s({ attribute: !1 })], z.prototype, "path", void 0), m([s({ attribute: !1 })], z.prototype, "errors", void 0), m([s({ attribute: !1 })], z.prototype, "live", void 0), z = m([h("al-stimulus-editor")], z);
//#endregion
//#region src/al-envelopes.ts
var Ci = {
	label: "Name",
	id: "ID",
	attack: "Attack",
	decay: "Decay",
	sustain: "Sustain",
	release: "Release",
	impulse: "Impulse"
}, wi = {
	label: "What this preset is called in the panel. Blank shows the id instead.",
	id: "Name stimuli use to pick this preset. Renaming it updates every reference.",
	attack: "Time to rise from zero to the stimulus gain.",
	decay: "Time to travel from the peak to the sustain level.",
	sustain: "Multiplier on the peak, held while the trigger is on. Above 1 the decay climbs.",
	release: "Time to fall from the group's limiter (full scale) back to zero; lower levels fall faster, at the same slope.",
	impulse: "Fire and forget: the trigger ends the moment it starts, leaving only the release."
}, Ti = [
	"label",
	"id",
	"attack",
	"decay",
	"sustain",
	"release",
	"impulse"
], Ei = [
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
		selector: I
	},
	{
		name: "decay",
		selector: I
	},
	{
		name: "sustain",
		selector: Ar
	},
	{
		name: "release",
		selector: I
	},
	{
		name: "impulse",
		selector: { boolean: {} }
	}
], Di = [
	{
		name: "retrigger",
		label: Mr,
		kind: "select",
		selector: Ir,
		hint: Nr
	},
	{
		name: "stack",
		label: Pr,
		kind: "boolean",
		selector: Cr,
		hint: Fr
	},
	{
		name: "unavailable",
		label: "When unavailable",
		kind: "select",
		selector: Vr
	},
	{
		name: "debounce",
		label: "Debounce",
		kind: "duration",
		selector: I
	}
], Oi = "text/plain", ki = 36, Ai = (e) => e.stopPropagation(), B = class extends r {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.selected = 0, this.blocked = null, this.dragging = null, this.dropAt = null, this.computeLabel = (e) => Ci[e.name] ?? e.name, this.computeHelper = (e) => wi[e.name] ?? "";
	}
	static {
		this.styles = [w, t`
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
		this.dispatchEvent(M(e, t));
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
		let r = Fe(n, ["envelopes"], e, t);
		if (r === n) return;
		let i = n.envelopes[this.selected]?.id, a = r.envelopes.findIndex((e) => e.id === i);
		this.selected = a === -1 ? 0 : a, this.blocked = null, this.emitChange(r);
	}
	onDragStart(e, t) {
		e.dataTransfer?.setData(Oi, String(t)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), this.dragging = t;
	}
	onDragEnd() {
		this.dragging = null, this.dropAt = null;
	}
	slotFor(e, t) {
		let n = e.currentTarget.getBoundingClientRect(), r = n.height || ki;
		return e.clientY - n.top < r / 2 ? t : t + 1;
	}
	isOurs(e) {
		return this.dragging !== null && e.dataTransfer?.types.includes(Oi) === !0;
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
		this.emitChange(Ne(e, ["envelopes"], t, tt(ft(e, "preset")))), this.selected = t;
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
		window.confirm(`Delete envelope preset "${n.id}"?`) && (this.blocked = null, this.emitChange(Me(t, ["envelopes", e])), this.selected >= e && this.selected > 0 && --this.selected);
	}
	onFormChanged(e) {
		e.stopPropagation();
		let t = this.config, n = this.selected, r = t?.envelopes[n];
		if (!t || !r) return;
		let i = e.detail?.value ?? {}, a = typeof i.label == "string" ? i.label : r.label ?? "", o = {
			...r,
			label: a.trim() === "" ? null : a,
			id: String(i.id ?? ""),
			attack: D(i.attack) ?? r.attack,
			decay: D(i.decay) ?? r.decay,
			sustain: typeof i.sustain == "number" ? i.sustain : r.sustain,
			release: D(i.release) ?? r.release,
			impulse: typeof i.impulse == "boolean" ? i.impulse : r.impulse
		}, s = Ti.find((e) => o[e] !== r[e]);
		if (s === void 0) return;
		let c = ["envelopes", n], l = y(mt(t, n, o.id), c, o);
		this.emitChange(l, `${A(c)}:${s}`);
	}
	setOverride(e, t) {
		let n = this.config, r = this.selected;
		if (!n || !n.envelopes[r]) return;
		let i = [
			"envelopes",
			r,
			e
		];
		this.emitChange(y(n, i, t), A(i));
	}
	render() {
		let e = this.config;
		return e ? i`
      <div class="layout ${this.narrow ? "narrow" : ""}">
        <div>${this.renderList(e)}</div>
        <div>${this.renderEditor(e)}</div>
      </div>
    ` : i`<ha-card><span class="muted">Loading…</span></ha-card>`;
	}
	renderList(t) {
		let n = this.blocked;
		return i`
      <ha-card>
        <h3>Presets</h3>
        ${t.envelopes.map((e, n) => this.renderPresetRow(t, e, n))}
        ${t.envelopes.length === 0 ? i`<p class="muted">No presets yet.</p>` : e}
        ${n ? i`<ha-alert alert-type="warning">${Mi(n)}</ha-alert>` : e}
        <div class="row">
          <ha-button @click=${this.addPreset}>Add preset</ha-button>
        </div>
      </ha-card>
    `;
	}
	renderPresetRow(t, n, r) {
		let a = _n(this.errors, ["envelopes", r]), o = t.defaults.envelope === n.id, s = this.dragging === null || this.dropAt === null ? "" : this.dropClass(r), c = [
			"row",
			"preset",
			this.selected === r ? "selected" : "",
			this.dragging === r ? "dragging" : "",
			s
		].filter(Boolean).join(" ");
		return i`<div
      class=${c}
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
          >${n.id === "" && n.label === null ? "(unnamed preset)" : nt(n)}</span
        >
        ${n.label !== null && n.label.trim() !== "" ? i`<span class="muted id">${n.id}</span>` : e}
      </button>
      ${a ? i`<span class="badge" title="${a} problem(s)">${a}</span>` : e}
      <label
        class="default"
        title=${o ? "This is the default preset" : "Set as default"}
      >
        <input
          type="checkbox"
          aria-label="Set as default"
          .checked=${o}
          .disabled=${o}
          draggable="false"
          @dragstart=${Ai}
          @click=${Ai}
          @change=${() => this.setDefault(r)}
        />
      </label>
      <ha-icon-button
        label="Delete preset"
        title="Delete preset"
        draggable="false"
        @dragstart=${Ai}
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
	renderEditor(t) {
		let n = this.selected, r = t.envelopes[n];
		if (!r) return i`<ha-card
        ><span class="muted">Select a preset.</span></ha-card
      >`;
		let a = ["envelopes", n], o = j(this.errors, a), s = this.errors.filter((e) => e.path === A(a)), c = {
			label: r.label ?? "",
			id: r.id,
			attack: E(r.attack),
			decay: E(r.decay),
			sustain: r.sustain,
			release: E(r.release),
			impulse: r.impulse
		}, l = ji(t, n, r);
		return i`
      <ha-card header="Envelope preset">
        ${s.map((e) => i`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        ${l ? i`<ha-alert alert-type="warning">${l}</ha-alert>` : e}
        <ha-form
          .hass=${this.hass}
          .data=${c}
          .schema=${Ei}
          .error=${o}
          .computeLabel=${this.computeLabel}
          .computeHelper=${this.computeHelper}
          @value-changed=${this.onFormChanged}
        ></ha-form>
        <div class="sketch">
          <al-envelope-sketch .envelope=${r}></al-envelope-sketch>
        </div>

        <h3>Behaviour</h3>
        ${Di.map((e) => i`<al-override-field
              .hass=${this.hass}
              .label=${e.label}
              .hint=${e.hint ?? ""}
              .kind=${e.kind}
              .selector=${e.kind === "boolean" ? Cr : e.selector}
              .value=${r[e.name]}
              .inherited=${t.defaults[e.name]}
              .inheritedFrom=${"defaults"}
              .error=${o[e.name]}
              @value-changed=${(t) => this.setOverride(e.name, t.detail.value)}
            ></al-override-field>`)}
      </ha-card>
    `;
	}
};
m([s({ attribute: !1 })], B.prototype, "hass", void 0), m([s({ attribute: !1 })], B.prototype, "config", void 0), m([s({ attribute: !1 })], B.prototype, "errors", void 0), m([s({ type: Boolean })], B.prototype, "narrow", void 0), m([g()], B.prototype, "selected", void 0), m([g()], B.prototype, "blocked", void 0), m([g()], B.prototype, "dragging", void 0), m([g()], B.prototype, "dropAt", void 0), B = m([h("al-envelopes")], B);
function ji(e, t, n) {
	return n.id.trim() === "" ? "This preset needs an id before stimuli can name it." : e.envelopes.some((e, r) => r !== t && e.id === n.id) ? `Another preset already uses the id "${n.id}". Ids must be unique, and a reference follows a rename only while the id it names is unambiguous.` : null;
}
function Mi(e) {
	let t = [];
	return e.defaults && t.push("the defaults"), e.groups.length > 0 && t.push(`group${e.groups.length > 1 ? "s" : ""} ${e.groups.join(", ")}`), `"${e.id}" is still used by ${t.join(" and ")}. Point those at another preset first.`;
}
//#endregion
//#region src/al-defaults.ts
var Ni = {
	envelope: "Default envelope",
	max_value: "Max value",
	precision: "Precision",
	unavailable: "When unavailable",
	retrigger: Mr,
	stack: Pr,
	debounce: "Debounce",
	safety_refresh: "Safety refresh",
	min_wake_interval: "Minimum wake interval"
}, Pi = {
	envelope: "Preset used when a stimulus names none.",
	max_value: "Limiter for groups that don't set their own.",
	precision: "Display decimals.",
	unavailable: "What an entity going unavailable does to its trigger.",
	retrigger: Nr,
	stack: Fr,
	debounce: "Minimum time between triggers per stimulus.",
	safety_refresh: "Periodic recompute as a self-heal.",
	min_wake_interval: "Floor for the scheduler's timer delay."
}, Fi = [
	"envelope",
	"max_value",
	"precision",
	"unavailable",
	"retrigger",
	"stack",
	"debounce",
	"safety_refresh",
	"min_wake_interval"
], Ii = { duration: { enable_millisecond: !0 } }, Li = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, Ri = { select: {
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
} }, zi = { boolean: {} }, Bi = { select: {
	mode: "dropdown",
	options: [{
		value: "hold",
		label: "Hold the last value"
	}, {
		value: "note_off",
		label: "End the trigger"
	}]
} }, Vi = class extends r {
	constructor(...e) {
		super(...e), this.errors = [], this.computeLabel = (e) => Ni[e.name] ?? e.name, this.computeHelper = (e) => Pi[e.name] ?? "";
	}
	static {
		this.styles = [w, t`
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
				selector: Li
			},
			{
				name: "precision",
				selector: Ri
			},
			{
				name: "unavailable",
				selector: Bi
			},
			{
				name: "retrigger",
				selector: Ir
			},
			{
				name: "stack",
				selector: zi
			},
			{
				name: "debounce",
				selector: Ii
			},
			{
				name: "safety_refresh",
				selector: Ii
			},
			{
				name: "min_wake_interval",
				selector: Ii
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
			debounce: D(r.debounce) ?? n.debounce,
			safety_refresh: D(r.safety_refresh) ?? n.safety_refresh,
			min_wake_interval: D(r.min_wake_interval) ?? n.min_wake_interval
		}, o = Fi.find((e) => a[e] !== n[e]);
		o !== void 0 && this.emitChange(y(t, ["defaults"], a), `defaults:${o}`);
	}
	emitChange(e, t) {
		this.dispatchEvent(M(e, t));
	}
	render() {
		let e = this.config;
		if (!e) return i`<div class="pad"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
		let t = e.defaults, n = j(this.errors, ["defaults"]), r = this.errors.filter((e) => e.path === "defaults"), a = {
			envelope: t.envelope,
			max_value: t.max_value,
			precision: String(t.precision),
			unavailable: t.unavailable,
			retrigger: t.retrigger,
			stack: t.stack,
			debounce: E(t.debounce),
			safety_refresh: E(t.safety_refresh),
			min_wake_interval: E(t.min_wake_interval)
		};
		return i`
      <div class="pad">
        <ha-card header="Defaults">
          ${r.map((e) => i`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
          <ha-form
            .hass=${this.hass}
            .data=${a}
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
m([s({ attribute: !1 })], Vi.prototype, "hass", void 0), m([s({ attribute: !1 })], Vi.prototype, "config", void 0), m([s({ attribute: !1 })], Vi.prototype, "errors", void 0), Vi = m([h("al-defaults")], Vi);
//#endregion
//#region src/fader.ts
var Hi = .1, Ui = Math.log10(Hi), Wi = Math.log10(10) - Ui, Gi = (e) => Math.min(10, Math.max(Hi, e)), Ki = (e) => Math.round(e * 100) / 100, qi = (e) => Ki(Gi(e));
function Ji(e) {
	return (Math.log10(Gi(e)) - Ui) / Wi;
}
function Yi(e) {
	return Ki(Gi(10 ** (Ui + Math.min(1, Math.max(0, e)) * Wi)));
}
function Xi(e, t, n = !1) {
	let r = n ? 1.05 : 1.25;
	return Ki(Gi(t === 1 ? e * r : e / r));
}
function Zi(e) {
	let t = e.toFixed(2).replace(/0+$/, "");
	return t.endsWith(".") && (t += "0"), t;
}
var Qi = {
	min: Hi,
	max: 10,
	toPosition: Ji,
	fromPosition: Yi,
	clamp: qi,
	step: (e, t, n = !1) => Xi(e, t, n),
	page: (e, t) => qi(t === 1 ? e * 2 : e / 2),
	format: Zi,
	reset: 1
}, $i = (e) => Math.min(6, Math.max(0, Math.trunc(e)));
function ea(e, t) {
	let n = e > 0 ? e : 1, r = $i(t), i = 10 ** -r, a = (e) => Number(Math.min(n, Math.max(0, e)).toFixed(r)), o = Math.max(i, Number((n / 10).toFixed(r)));
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
var ta = 12, na = (e) => `${Math.round(e * 1e3) / 10}%`, V = class extends r {
	constructor(...e) {
		super(...e), this.value = 1, this.disabled = !1, this.focusable = !0, this.readOnly = !1, this.label = "Gain", this.showValue = !0, this.unavailable = !1, this.mode = "gain", this.max = 5, this.precision = 1, this.tick = null, this.dragValue = null, this.dragging = !1;
	}
	static {
		this.styles = t`
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
      height: ${ta}px;
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
		return this.mode === "level" ? ea(this.max, this.precision) : Qi;
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
		let t = this.scale, n = t.clamp(this.current), r = t.toPosition(n), a = this.tick === null || t.clamp(this.tick) === n ? null : t.clamp(this.tick), o = i`
      ${this.mode === "gain" ? i`<div class="unity"></div>` : e}
      <div class="fill" style="height: ${na(r)}"></div>
      ${a === null ? e : i`<div class="tick" style="bottom: ${na(t.toPosition(a))}" title=${t.format(a)}></div>`}
    `;
		return this.readOnly ? i`
        <div
          class="fader"
          role="meter"
          aria-label=${this.label}
          aria-valuemin=${t.min}
          aria-valuemax=${t.max}
          aria-valuenow=${this.unavailable ? e : n}
          aria-valuetext=${this.unavailable ? "Value unavailable" : t.format(n)}
        >
          <div class="track">${this.unavailable ? e : o}</div>
          ${this.showValue ? i`<div class="value">${t.format(n)}</div>` : e}
        </div>
      ` : i`
      <div
        class="fader"
        role="slider"
        tabindex=${this.disabled || !this.focusable ? -1 : 0}
        aria-label=${this.label}
        aria-orientation="vertical"
        aria-valuemin=${t.min}
        aria-valuemax=${t.max}
        aria-valuenow=${this.unavailable ? e : n}
        aria-valuetext=${this.unavailable ? "Value unavailable" : t.format(n)}
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
          ${o}
          <div class="knob" style="bottom: calc(${na(r)} - ${Math.round((r - .5) * ta * 10) / 10}px - ${ta / 2}px)"></div>
        </div>
        ${this.showValue ? i`<div class="value">${t.format(n)}</div>` : e}
      </div>
    `;
	}
};
m([s({ type: Number })], V.prototype, "value", void 0), m([s({
	type: Boolean,
	reflect: !0
})], V.prototype, "disabled", void 0), m([s({ type: Boolean })], V.prototype, "focusable", void 0), m([s({
	type: Boolean,
	reflect: !0,
	attribute: "readonly"
})], V.prototype, "readOnly", void 0), m([s({ type: String })], V.prototype, "label", void 0), m([s({ type: Boolean })], V.prototype, "showValue", void 0), m([s({ type: Boolean })], V.prototype, "unavailable", void 0), m([s({ type: String })], V.prototype, "mode", void 0), m([s({ type: Number })], V.prototype, "max", void 0), m([s({ type: Number })], V.prototype, "precision", void 0), m([s({ type: Number })], V.prototype, "tick", void 0), m([g()], V.prototype, "dragValue", void 0), V = m([h("al-fader")], V);
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive.js
var ra = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, ia = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), aa = class {
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
}, oa = ia(class extends aa {
	constructor(e) {
		if (super(e), e.type !== ra.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
		return le;
	}
}), sa = (e) => `${Math.round(e * 1e3) / 10}%`, ca = class extends r {
	constructor(...e) {
		super(...e), this.value = 0, this.max = 1, this.gated = !1;
	}
	static {
		this.styles = t`
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
		return i`
      <div class="meter">
        <div class=${oa({
			fill: !0,
			hot: e > .9
		})} style="width: ${sa(e)}"></div>
      </div>
      <div class=${oa({
			dot: !0,
			gated: this.gated
		})}></div>
    `;
	}
};
m([s({ type: Number })], ca.prototype, "value", void 0), m([s({ type: Number })], ca.prototype, "max", void 0), m([s({ type: Boolean })], ca.prototype, "gated", void 0), ca = m([h("al-meter")], ca);
var H = class extends r {
	constructor(...e) {
		super(...e), this.label = "", this.editable = !1, this.value = 0, this.realValue = 0, this.maxValue = 5, this.precision = 1, this.liveNow = 0, this.muted = !1, this.selected = !1, this.errors = 0, this.pending = null, this.dragging = !1;
	}
	static {
		this.styles = t`
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
		this.dispatchEvent(xn());
	}
	clearStepTimer() {
		this.stepTimer !== void 0 && (clearTimeout(this.stepTimer), this.stepTimer = void 0);
	}
	sendOverride(e) {
		this.clearStepTimer(), this.dispatchEvent(Sn(e));
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
			this.stepTimer = void 0, this.dispatchEvent(Sn(t));
		}, 250);
	}
	onMute() {
		this.editable && this.dispatchEvent(Cn(!this.muted));
	}
	onReset() {
		this.editable && this.dispatchEvent(wn());
	}
	render() {
		let t = this.pending ?? this.value;
		return i`
      <div class="strip" @click=${this.select}>
        <div class="head">
          <span class="name" title=${this.label}>${this.label}</span>
        </div>
        <al-fader
          mode="level"
          .showValue=${!1}
          ?readonly=${!this.editable || t === null}
          .unavailable=${t === null}
          .value=${t ?? 0}
          .max=${this.maxValue}
          .precision=${this.precision}
          .tick=${this.realValue}
          .focusable=${this.selected}
          label=${`${this.label} level`}
          @value-changed=${this.onFader}
        ></al-fader>
        <div class="readout" title=${t === null ? "No data at this time" : e}>${t === null ? "" : at(t, this.precision)}</div>
        ${this.editable ? i`<div class="buttons">
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
            </div>` : e}
        <div class="foot">
          ${this.errors > 0 ? i`<span class="badge" title=${`${this.errors} problem${this.errors === 1 ? "" : "s"}`}
                >${this.errors}</span
              >` : e}
        </div>
      </div>
    `;
	}
};
m([s({ type: String })], H.prototype, "label", void 0), m([s({
	type: Boolean,
	reflect: !0
})], H.prototype, "editable", void 0), m([s({ attribute: !1 })], H.prototype, "value", void 0), m([s({ attribute: !1 })], H.prototype, "realValue", void 0), m([s({ type: Number })], H.prototype, "maxValue", void 0), m([s({ type: Number })], H.prototype, "precision", void 0), m([s({ type: Number })], H.prototype, "liveNow", void 0), m([s({
	type: Boolean,
	reflect: !0
})], H.prototype, "muted", void 0), m([s({
	type: Boolean,
	reflect: !0
})], H.prototype, "selected", void 0), m([s({ type: Number })], H.prototype, "errors", void 0), m([g()], H.prototype, "pending", void 0), H = m([h("al-strip")], H);
//#endregion
//#region src/al-mixer.ts
var la = 8e3, ua = (e) => e instanceof Error ? e.message : String(e), U = class extends r {
	constructor(...e) {
		super(...e), this.nav = {
			expanded: /* @__PURE__ */ new Set(),
			selection: null
		}, this.errors = [], this.live = null, this.narrow = !1, this.preview = null, this.editing = jt(), this.commandError = null, this.pendingFocus = !1;
	}
	static {
		this.styles = [w, t`
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
		return this.config ? Ct(this.config, this.nav) : [];
	}
	get selected() {
		let { config: e, nav: t } = this;
		if (!e || t.selection === null) return null;
		let n = gt(t.selection), r = S(e, n);
		return r === void 0 ? null : {
			path: n,
			group: r
		};
	}
	get selectedId() {
		return this.selected?.group.id ?? null;
	}
	isSelected(e) {
		return this.nav.selection !== null && A(this.nav.selection) === A(e);
	}
	navigate(e) {
		this.pendingFocus = !0, this.dispatchEvent(Tn(e));
	}
	clearErrorTimer() {
		this.errorTimer !== void 0 && (clearTimeout(this.errorTimer), this.errorTimer = void 0);
	}
	fail(e) {
		this.commandError = e, this.clearErrorTimer(), this.errorTimer = window.setTimeout(() => {
			this.errorTimer = void 0, this.commandError = null;
		}, la);
	}
	async command(e, t, n) {
		let r = this.hass;
		if (!(!r || this.preview)) try {
			await t(r), this.commandError = null, this.clearErrorTimer(), this.dispatchEvent(En());
		} catch (t) {
			n?.settle(null), this.fail(`Could not ${e}: ${ua(t)}`);
		}
	}
	trackOf(e) {
		let t = e.target?.dataset?.index;
		return t === void 0 ? null : this.tracks[Number(t)] ?? null;
	}
	onStripSelect(e) {
		let t = this.trackOf(e);
		t && this.dispatchEvent(Tn({
			type: "select",
			path: t.path
		}));
	}
	onLevelOverride(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let n = e.target, { value: r } = e.detail;
		this.command(`set the level of ${t.id}`, async (e) => n.settle(await d(e, t.id, r)), n);
	}
	onMuteToggle(e) {
		let t = this.trackOf(e);
		if (!t || this.preview) return;
		let { muted: n } = e.detail;
		this.command(`${n ? "mute" : "unmute"} ${t.id}`, (e) => a(e, t.id, n));
	}
	onReset(e) {
		let t = this.trackOf(e);
		!t || this.preview || this.command(`reset ${t.id}`, (e) => te(e, t.id));
	}
	onEditToggle(e) {
		this.preview || (this.editing = e.target.checked === !0, Mt(this.editing));
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
				let t = this.nav.selection, n = t === null ? void 0 : this.tracks.find((e) => A(e.path) === A(t));
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
		let a = S(e, t.path);
		if (!a) return i``;
		let o = this.live?.groups[a.id], s = this.isSelected(t.path);
		return i`
      <al-strip
        data-index=${n}
        style="grid-column: ${r.columns[n]}; grid-row: ${r.rows + 1};"
        tabindex=${s ? 0 : -1}
        ?editable=${this.editing && !this.preview}
        .label=${a.name ?? a.id}
        .value=${this.preview ? this.preview.values[a.id] ?? null : o?.value ?? 0}
        .liveNow=${this.live?.now ?? 0}
        .realValue=${this.preview ? null : o?.real_value ?? 0}
        .maxValue=${o?.max_value ?? a.max_value ?? e.defaults.max_value}
        .precision=${o?.precision ?? it(e, a)}
        .muted=${this.preview ? !1 : o?.muted ?? !1}
        .selected=${s}
        .errors=${_n(this.errors, t.path)}
      ></al-strip>
    `;
	}
	renderBand(e, t) {
		let n = `grid-column: ${e.colStart} / ${e.colEnd}; grid-row: ${e.depth + 1};`, r = e.id === this.selectedId ? 0 : -1, a = this.live?.groups[e.id], o = this.preview ? this.preview.values[e.id] : a?.value, s = a?.precision ?? (t && this.config ? it(this.config, t) : 1), c = e.expanded ? "Collapse" : "Expand";
		return i`
      <div class="band" role="group" aria-label=${e.label} style=${n}>
        <button
          class="caret"
          type="button"
          data-band=${e.id}
          tabindex=${r}
          aria-expanded=${e.expanded ? "true" : "false"}
          aria-label=${`${c} ${e.label}`}
          title=${`${c} ${e.label}`}
          @click=${this.onBandToggle}
          @keydown=${this.onBandKey}
        >${e.expanded ? "▾" : "▸"}</button>
        <span class="label" title=${e.label}>${e.label}</span>
        <span class="band-value">${o == null ? "" : at(o, s)}</span>
      </div>
    `;
	}
	render() {
		let t = this.config;
		if (!t || t.groups.length === 0) return i`<div class="empty muted">Nothing to mix: add a group first.</div>`;
		let n = wt(t, this.nav), r = this.tracks, a = new Map(r.map((e) => [e.id, S(t, e.path)])), o = n.kinds.map(() => "var(--al-strip-w)").join(" "), s = n.rows > 0 ? `repeat(${n.rows}, auto) auto` : "auto";
		return i`
      ${this.commandError === null ? e : i`<ha-alert
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
        ${this.selected ? i`<button class="open-group" type="button"
          @click=${() => this.dispatchEvent(new CustomEvent("al-open-group", {
			detail: this.selected.path,
			bubbles: !0,
			composed: !0
		}))}>Group settings</button>` : e}
      </div>
      <div
        class="grid"
        role="group"
        aria-label="Mixer"
        style="grid-template-columns: ${o}; grid-template-rows: ${s};"
        @keydown=${this.onKeyDown}
        @al-select-strip=${this.onStripSelect}
        @al-level-override=${this.onLevelOverride}
        @al-mute-toggle=${this.onMuteToggle}
        @al-reset=${this.onReset}
      >
        ${n.bands.map((e) => this.renderBand(e, a.get(e.id)))}
        ${r.map((e, r) => this.renderTrack(t, e, r, n))}
      </div>
    `;
	}
};
m([s({ attribute: !1 })], U.prototype, "hass", void 0), m([s({ attribute: !1 })], U.prototype, "config", void 0), m([s({ attribute: !1 })], U.prototype, "nav", void 0), m([s({ attribute: !1 })], U.prototype, "errors", void 0), m([s({ attribute: !1 })], U.prototype, "live", void 0), m([s({
	type: Boolean,
	reflect: !0
})], U.prototype, "narrow", void 0), m([s({ attribute: !1 })], U.prototype, "preview", void 0), m([g()], U.prototype, "editing", void 0), m([g()], U.prototype, "commandError", void 0), U = m([h("al-mixer")], U);
//#endregion
//#region src/al-timeline.ts
var da = 32, fa = 28, pa = 4, ma = 8, ha = 800, ga = 220, _a = 160, va = 2e3, ya = 6e4, ba = 1e4, xa = 6e4, Sa = 32, Ca = [
	"24h",
	"7d",
	"30d"
], wa = [
	"off",
	"24h",
	"7d"
], Ta = ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.10)"], Ea = (e) => `hsl(${e * 67 % 360} 55% 62%)`, W = /* @__PURE__ */ new Map(), Da = /* @__PURE__ */ new Map();
function Oa(e, t) {
	let n = Date.now();
	for (let [e, t] of W) n - t.at >= xa && W.delete(e);
	W.delete(e), W.set(e, {
		at: n,
		data: t
	});
	for (let e of W.keys()) {
		if (W.size <= Sa) break;
		W.delete(e);
	}
}
var ka = (e) => e ? e.replace(/[MLZ]/g, " ").trim().replace(/\s+/g, " ") : "", Aa = (e, t) => {
	let n = /* @__PURE__ */ new Date(e * 1e3);
	return t < 86400 ? n.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	}) : n.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}, ja = (e) => String(Math.round(e * 100) / 100), Ma = (e, t, n) => Math.min(n, Math.max(t, e));
function Na(e, t, n, r) {
	let i = Math.max(1, r.width - da), a = Math.max(1, r.height - fa), o = n.start, s = Math.max(n.until, n.end), c = Lt(o, s, i), l = Rt(r.maxValue, a), u = Object.keys(e.series), d = u.includes(t) ? t : u[0] ?? t, f = (t, n) => {
		let r = zt(e.series[t] ?? [], va);
		return {
			id: t,
			points: r,
			d: Bt(r, c, l),
			color: n
		};
	}, ee = f(d, "var(--primary-color)"), p = r.showChannels ? u.filter((e) => e !== d).map((e, t) => f(e, Ea(t))) : [], te = e.forecast, m = te ? ka(Vt(te, c, l, va)) : "", ne = te ? Bt(zt(Ht(te, "p50"), va), c, l) : "", re = [];
	for (let [, , t] of e.day_types) re.includes(t) || re.push(t);
	let ie = (e) => Ta[re.indexOf(e) % Ta.length], ae = Wt(e.day_types.map(([e, t, n]) => [
		e,
		t,
		n
	]), c, s).map((e) => ({
		...e,
		fill: ie(e.tag)
	})), oe = Wt(Object.entries(e.lights).flatMap(([e, t]) => t.map(([t, n]) => [
		t,
		n,
		e
	])), c, s), se = Wt(e.plan, c, s);
	return {
		busId: d,
		bus: ee,
		children: p,
		band: m,
		p50: ne,
		dayTypes: ae,
		legend: re.map((e) => ({
			tag: e,
			fill: ie(e)
		})),
		lights: oe,
		plan: se,
		x: c,
		y: l,
		t0: o,
		t1: s,
		plotW: i,
		plotH: a
	};
}
var G = class extends r {
	constructor(...e) {
		super(...e), this.groupId = null, this.heading = "", this.labels = {}, this.precisions = {}, this.cursorTime = null, this.viewport = null, this.pinnedTime = null, this.dragging = !1, this.range = "7d", this.horizon = "24h", this.showChannels = !0, this.showLights = !0, this.live = null, this.maxValue = 5, this.profileState = null, this.minDays = 14, this.narrow = !1, this.paused = !1, this.cursorIndex = null, this.width = ha, this.loaded = null, this.error = null, this.liveValue = null, this.seq = 0, this.memo = null;
	}
	static {
		this.styles = [w, t`
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
		return this.narrow ? _a : ga;
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
		}, ya), this.load();
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
		}, ba)));
	}
	willUpdate(e) {
		let t = e.has("groupId") || e.has("range") || e.has("horizon") || e.has("showChannels"), n = e.has("hass") && e.get("hass") === void 0 && this.hass !== void 0;
		(t || n) && (e.has("groupId") && (this.cursorIndex = null, this.loaded = null), this.load()), e.has("groupId") && this.resetLiveWatch(), e.has("live") && this.watchLive();
	}
	query(e) {
		let t = Math.floor(Date.now() / 1e3 / 60) * 60, n = It(t, this.range, this.horizon);
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
		let r = this.query(n), i = Kt(r), a = e ? void 0 : W.get(i);
		if (a && Date.now() - a.at < xa) {
			this.seq++, this.loaded = {
				q: r,
				data: a.data
			}, this.error = null, Oa(i, a.data);
			return;
		}
		let o = e ? void 0 : Da.get(i);
		if (!o) {
			let e = se(t, r);
			o = e, Da.set(i, e), e.then((e) => Oa(i, e), () => void 0).finally(() => {
				Da.get(i) === e && Da.delete(i);
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
		let r = Na(e.data, e.q.group_id, this.viewport ? {
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
		return !r || e.bus.id !== t ? "" : Bt(Ut(e.bus.points, n.now, r.value, e.t0, e.t1), e.x, e.y);
	}
	emitSettings() {
		this.dispatchEvent(Dn({
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
		let n = e.currentTarget.getBoundingClientRect(), r = n.width > 0 ? this.width / n.width : 1, i = Ma(((e.clientX - n.left) * r - da) / t.plotW, 0, 1);
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
		this.cursorIndex = e === null || !t.length ? null : Gt(t, e), this.emitTransport();
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
		this.clearViewportTimer(), this.seq++, this.viewport = qt(e, Date.now() / 1e3), this.emitTransport(), t ? this.load() : this.viewportTimer = setTimeout(() => {
			this.viewportTimer = void 0, this.load();
		}, 100);
	}
	zoom(e, t) {
		let n = this.paths;
		n && this.changeWindow(Jt({
			start: n.t0,
			end: n.t1
		}, t ?? this.cursorTime ?? (n.t0 + n.t1) / 2, e, Date.now() / 1e3));
	}
	onWheel(e) {
		let t = this.paths;
		if (t) {
			if (e.ctrlKey || e.metaKey) e.preventDefault(), this.zoom(Math.exp(Ma(e.deltaY, -100, 100) * .01), this.timeAt(e, t));
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
		this.cursorIndex = this.cursorIndex === null ? r > 0 ? 0 : n : Ma(this.cursorIndex + r, 0, n), this.pinnedTime = t.bus.points[this.cursorIndex][0], this.selectTime(this.pinnedTime);
	}
	renderChips() {
		let t = this.learningHint;
		return i`
      <div class="toolbar">
        <span class="title">${this.heading}</span>
        <div class="chips" role="group" aria-label="History range">
          ${Ca.map((e) => i`
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
          ${wa.map((e) => {
			let n = e !== "off" && !this.forecastReady;
			return i`
              <button
                class="chip horizon"
                data-horizon=${e}
                aria-pressed=${this.horizon === e ? "true" : "false"}
                ?disabled=${n}
                aria-disabled=${n ? "true" : "false"}
                title=${n ? t ?? "" : ""}
                @click=${() => this.setHorizon(e)}
              >
                ${e}
              </button>
            `;
		})}
        </div>
        ${t ? i`<span class="muted hint" title=${t}>${t}</span>` : e}
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
	renderChart(t) {
		let r = this.width, a = this.height, o = t.x(this.nowAt()), s = this.tailPath(t), c = t.plotH + pa, l = this.cursorTime === null ? null : t.x(this.cursorTime), u = `${this.heading} activity, ${this.range} history, ${this.horizon} forecast`;
		return i`
      <svg
        class="chart"
        viewBox="0 0 ${r} ${a}"
        role="img"
        tabindex="0"
        aria-label=${u}
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
		].map((e) => n`
            <line class="grid" x1=${da} y1=${t.y(this.maxValue * e)} x2=${r} y2=${t.y(this.maxValue * e)}></line>
            <text class="ytick" x=${28} y=${t.y(this.maxValue * e) + 3} text-anchor="end">
              ${ja(this.maxValue * e)}
            </text>
          `)}
        <g transform="translate(${da},0)">
          ${t.dayTypes.map((e) => n`<rect
              class="daytype"
              x=${e.x0}
              y="0"
              width=${Math.max(0, e.x1 - e.x0)}
              height=${t.plotH}
              fill=${e.fill}
            ></rect>`)}
          ${this.forecastReady && t.band ? n`<polygon class="band" points=${t.band}></polygon>` : e}
          ${this.forecastReady && t.p50 ? n`<path class="p50" d=${t.p50} stroke-dasharray="4 3"></path>` : e}
          ${t.children.map((e) => n`<path class="child" d=${e.d} stroke=${e.color}></path>`)}
          ${t.bus.d ? n`<path class="bus" d=${t.bus.d}></path>` : e}
          ${s ? n`<path class="tail" d=${s}></path>` : e}
          ${this.showLights ? t.lights.map((e) => n`<rect
                  class="light"
                  x=${e.x0}
                  y=${c}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${ma}
                  fill="rgba(255,220,120,1)"
                  opacity="0.6"
                ></rect>`) : e}
          ${this.showLights ? t.plan.map((e) => n`<rect
                  class="plan"
                  x=${e.x0}
                  y=${c}
                  width=${Math.max(1, e.x1 - e.x0)}
                  height=${ma}
                  fill="rgba(255,220,120,1)"
                  opacity="0.3"
                ></rect>`) : e}
          ${o >= 0 && o <= t.plotW ? n`<line class="now" x1=${o} y1="0" x2=${o} y2=${t.plotH}></line>
          <text class="now-label" x=${o + 3} y="10">now</text>` : e}
          ${l === null ? e : n`<line class="cursor" x1=${l} y1="0" x2=${l} y2=${t.plotH}></line>`}
          ${this.renderXLabels(t)}
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
		].map(([r, i]) => n`<text class="xlabel" x=${r * e.plotW} y=${t} text-anchor=${i}>
        ${Aa(e.t0 + r * (e.t1 - e.t0), e.t1 - e.t0)}
      </text>`);
	}
	renderTooltip(t) {
		let n = this.cursorTime;
		if (n === null || n < t.t0 || n > t.t1) return e;
		let r = this.forecastReady ? this.loaded?.data.forecast : null, a = this.loaded?.q.resolution === "5m" ? 600 : 7200, o = n > this.nowAt() ? r ? Yt(Ht(r, "p50"), n) : null : Yt(t.bus.points, n, a), s = (da + t.x(n)) / this.width * 100, c = this.loaded?.data.day_types.find(([e, t]) => n >= e && n < t)?.[2], l = (e, t) => {
			if (t === null) return null;
			let n = at(t, this.precisions[e] ?? this.live?.groups[e]?.precision ?? 1);
			return Number(n) === 0 ? null : n;
		}, u = l(t.busId, o), d = t.children.flatMap((e) => {
			let t = l(e.id, Yt(e.points, n, a));
			return t === null ? [] : [{
				...e,
				formatted: t
			}];
		});
		return i`
      <div class="tooltip ${s > 60 ? "flip" : ""}" style="left: ${s}%">
        <div class="tt-time">${(/* @__PURE__ */ new Date(n * 1e3)).toLocaleString()}</div>
        ${u === null ? e : i`<div class="tt-row">
          <span class="tt-swatch" style="background: var(--primary-color)"></span>
          <span class="tt-name">${this.heading || t.busId}</span>
          <span class="tt-value">${u}</span>
        </div>`}
        ${d.slice(0, 5).map((e) => i`
          <div class="tt-row">
            <span class="tt-swatch" style="background: ${e.color}"></span>
            <span class="tt-name">${this.labels[e.id] ?? e.id.replaceAll("_", " ")}</span>
            <span class="tt-value">${e.formatted}</span>
          </div>
        `)}
        ${d.length > 5 ? i`<div class="muted">+${d.length - 5} channels</div>` : e}
        ${c ? i`<div class="tt-daytype muted">${c}</div>` : e}
      </div>
    `;
	}
	render() {
		if (this.groupId === null) return i`<div class="placeholder muted">Select a strip to see its timeline.</div>`;
		let t = this.paths;
		return i`
      ${this.renderChips()}
      ${t ? this.renderChart(t) : i`<div class="placeholder muted">Loading…</div>`}
      <div class="transport toolbar" role="group" aria-label="Timeline transport">
        <button class="chip" aria-label="Zoom out" @click=${() => this.zoom(2)}>−</button>
        <button class="chip" aria-label="Zoom in" @click=${() => this.zoom(.5)}>+</button>
        ${[
			-7,
			-3,
			-1
		].map((e) => i`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>${e}d</button>`)}
        <button class="chip transport-now" @click=${this.resetTransport}>Now</button>
        ${[
			1,
			3,
			7
		].map((e) => i`<button class="chip" data-days=${e} @click=${() => this.jump(e)}>+${e}d</button>`)}
        <span class="muted transport-status">${this.cursorTime === null ? "Live" : `${this.cursorTime > this.nowAt() ? "Forecast" : "History"} · ${(/* @__PURE__ */ new Date(this.cursorTime * 1e3)).toLocaleString()}`}</span>
      </div>
      ${t && t.legend.length > 0 ? i`
            <div class="legend">
              ${t.legend.map((e) => i`
                  <span class="legend-item">
                    <span class="swatch" style="background: ${e.fill}"></span>${e.tag}
                  </span>
                `)}
            </div>
          ` : e}
      ${this.error ? i`<div class="error">Timeline: ${this.error}</div>` : e}
      ${t ? this.renderTooltip(t) : e}
    `;
	}
};
m([s({ attribute: !1 })], G.prototype, "hass", void 0), m([s({ attribute: !1 })], G.prototype, "groupId", void 0), m([s({ attribute: !1 })], G.prototype, "heading", void 0), m([s({ attribute: !1 })], G.prototype, "labels", void 0), m([s({ attribute: !1 })], G.prototype, "precisions", void 0), m([g()], G.prototype, "cursorTime", void 0), m([g()], G.prototype, "viewport", void 0), m([s({ attribute: !1 })], G.prototype, "range", void 0), m([s({ attribute: !1 })], G.prototype, "horizon", void 0), m([s({ type: Boolean })], G.prototype, "showChannels", void 0), m([s({ type: Boolean })], G.prototype, "showLights", void 0), m([s({ attribute: !1 })], G.prototype, "live", void 0), m([s({ type: Number })], G.prototype, "maxValue", void 0), m([s({ attribute: !1 })], G.prototype, "profileState", void 0), m([s({ type: Number })], G.prototype, "minDays", void 0), m([s({
	type: Boolean,
	reflect: !0
})], G.prototype, "narrow", void 0), m([s({ type: Boolean })], G.prototype, "paused", void 0), m([g()], G.prototype, "cursorIndex", void 0), m([g()], G.prototype, "width", void 0), m([g()], G.prototype, "loaded", void 0), m([g()], G.prototype, "error", void 0), G = m([h("al-timeline")], G);
//#endregion
//#region src/al-strip-controls.ts
var Pa = [
	"name",
	"mix",
	"null_handling",
	"gain"
], Fa = 5, Ia = (e) => e[e.length - 2] === "stimuli", K = class extends r {
	constructor(...e) {
		super(...e), this.path = null, this.errors = [], this.live = null, this.profileState = null, this.statusOnly = !1, this.simLog = null;
	}
	static {
		this.styles = [w, t`
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
		this.dispatchEvent(M(e, t));
	}
	setField(e, t) {
		let { config: n, path: r } = this;
		!n || !r || this.emitChange(y(n, [...r, e], t), `${A(r)}:${e}`);
	}
	onBusForm(e) {
		e.stopPropagation();
		let { config: t, path: n } = this;
		if (!t || !n) return;
		let r = S(t, n);
		if (!r) return;
		let i = fr(r, e.detail?.value ?? {}), a = pr(i, r);
		a !== void 0 && this.emitChange(y(t, n, i), `${A(n)}:${a}`);
	}
	onSim(e, t) {
		this.dispatchEvent(On(e, t.target.checked === !0));
	}
	onRebuild() {
		this.dispatchEvent(kn());
	}
	renderChannel(e, t) {
		return i`<al-stimulus-editor
      .hass=${this.hass}
      .config=${e}
      .path=${t}
      .errors=${this.errors}
      .live=${this.live}
    ></al-stimulus-editor>`;
	}
	renderBus(e, t) {
		let n = S(e, t);
		if (!n) return i`<ha-card><span class="muted">This group no longer exists.</span></ha-card>`;
		if (this.statusOnly) return i`<ha-card>${this.renderStatus(e, n)}</ha-card>`;
		let r = t.length === 2, a = this.errors.filter((e) => e.path === A(t)), o = j(this.errors, t);
		return i`
      <ha-card header=${n.name ?? n.id}>
        ${a.map((e) => i`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
        <div class="cols">
          <div class="col">
            <ha-form
              .hass=${this.hass}
              .data=${dr(n, r, Pa, e)}
              .schema=${ur(n, r, Pa, e)}
              .error=${o}
              .computeLabel=${Zn}
              .computeHelper=${Qn}
              @value-changed=${this.onBusForm}
            ></ha-form>
            <al-override-field
              .hass=${this.hass}
              label="Limiter"
              kind="number"
              .selector=${ar}
              .value=${n.max_value}
              .inherited=${e.defaults.max_value}
              .inheritedFrom=${"defaults"}
              .error=${o.max_value}
              @value-changed=${(e) => this.setField("max_value", e.detail.value)}
            ></al-override-field>
            <al-override-field
              .hass=${this.hass}
              .label=${Yn.precision}
              kind="select"
              .selector=${or}
              .value=${n.precision === null ? null : String(n.precision)}
              .inherited=${String(e.defaults.precision)}
              .inheritedFrom=${"defaults"}
              .error=${o.precision}
              @value-changed=${(e) => this.setField("precision", e.detail.value === null ? null : Number(e.detail.value))}
            ></al-override-field>
          </div>
          ${this.renderStatus(e, n)}
        </div>
        ${this.renderStimuli(e, n, t)}
      </ha-card>
    `;
	}
	renderStimuli(t, n, r) {
		let a = x(t).enabled && st(t).has(n.id);
		return i`
      <div class="stimuli">
        <h3>Stimuli</h3>
        ${a ? this.renderPresence(t, n, r) : e}
        ${n.stimuli.length === 0 && !a ? i`<div class="muted">No stimuli yet — point this group at an entity in Groups.</div>` : n.stimuli.map((e, n) => this.renderStimulus(t, [
			...r,
			"stimuli",
			n
		], e))}
      </div>
    `;
	}
	renderPresence(t, n, r) {
		let a = this.live?.voices[n.id]?.find((e) => e.label === Ge);
		return i`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          <ha-icon icon="mdi:account-multiple"></ha-icon>
          <span class="name">Presence (anyone here)</span>
          ${a ? i`<span class="chip phase ${a.phase}">${a.phase}</span>` : e}
        </div>
        <al-presence-overrides
          .hass=${this.hass}
          .config=${t}
          .path=${r}
          .errors=${this.errors}
        ></al-presence-overrides>
      </ha-expansion-panel>
    `;
	}
	renderStimulus(t, n, r) {
		let a = this.hass?.states[r.entity], o = a?.attributes.friendly_name ?? (r.entity || "(no entity)"), s = _n(this.errors, n);
		return i`
      <ha-expansion-panel outlined left-chevron>
        <div slot="header" class="stimulus-head">
          ${a ? i`<ha-state-icon .hass=${this.hass} .stateObj=${a}></ha-state-icon>` : i`<ha-icon icon="mdi:flash"></ha-icon>`}
          <span class="name">${r.key ?? o}</span>
          ${s ? i`<span class="badge" title="${s} problem(s)">${s}</span>` : e}
          ${a ? i`<span class="muted chip">${hn(this.hass, r.entity)}</span>` : e}
        </div>
        <al-stimulus-editor
          .hass=${this.hass}
          .config=${t}
          .path=${n}
          .errors=${this.errors}
          .live=${this.live}
        ></al-stimulus-editor>
      </ha-expansion-panel>
    `;
	}
	renderStatus(t, n) {
		let r = n.id, a = this.live?.groups[r]?.precision ?? it(t, n), o = this.live?.groups[r]?.lights ?? 0, s = this.hass?.states[ue(r)], c = this.simLog?.blocked[r] ?? null, l = (this.simLog?.entries ?? []).filter((e) => e.group_id === r).sort((e, t) => t.t - e.t).slice(0, Fa);
		return i`
      <div class="col status">
        <h3>Status</h3>
        <div class="row lights">
          <span>${o} light${o === 1 ? "" : "s"}</span>
          <span class="muted">manage in Groups</span>
        </div>
        ${o > 0 ? i`<div class="row sim">
              <ha-switch
                class="sim-switch"
                .checked=${s?.state === "on"}
                .disabled=${s === void 0}
                title=${s === void 0 ? "No simulation switch for this group" : "Presence simulation"}
                @change=${(e) => this.onSim(r, e)}
              ></ha-switch>
              <span>Presence simulation</span>
            </div>` : e}
        ${c === null ? e : i`<div class="muted blocked">Blocked: ${c}</div>`}
        ${this.renderSensor("expected", "Expected", de(r), a)}
        ${this.renderSensor("anomaly", "Anomaly", fe(r), a)}
        <div class="muted readiness">${this.readiness(t, r)}</div>
        ${l.length > 0 ? i`<ol class="log">
              ${l.map((e) => this.renderLogEntry(e))}
            </ol>` : i`<div class="muted">No simulated light changes yet.</div>`}
        <ha-button class="rebuild" @click=${this.onRebuild}>Rebuild profile</ha-button>
      </div>
    `;
	}
	renderSensor(t, n, r, a) {
		let o = this.hass?.states[r], s = o?.attributes.day_type, c = o?.state, l = c === void 0 ? NaN : Number(c), u = c === void 0 ? "—" : c.trim() !== "" && Number.isFinite(l) ? at(l, a) : c;
		return i`<div class="row ${t}">
      <span class="muted">${n}</span>
      <span class="value">${u}</span>
      ${typeof s == "string" ? i`<span class="muted">${s}</span>` : e}
    </div>`;
	}
	renderLogEntry(e) {
		return i`<li>
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
		return !e || !t || t.length === 0 ? i`<ha-card><span class="muted">Select a strip to tune it.</span></ha-card>` : Ia(t) ? this.renderChannel(e, t) : this.renderBus(e, t);
	}
};
m([s({ attribute: !1 })], K.prototype, "hass", void 0), m([s({ attribute: !1 })], K.prototype, "config", void 0), m([s({ attribute: !1 })], K.prototype, "path", void 0), m([s({ attribute: !1 })], K.prototype, "errors", void 0), m([s({ attribute: !1 })], K.prototype, "live", void 0), m([s({ attribute: !1 })], K.prototype, "profileState", void 0), m([s({ type: Boolean })], K.prototype, "statusOnly", void 0), m([s({ attribute: !1 })], K.prototype, "simLog", void 0), K = m([h("al-strip-controls")], K);
//#endregion
//#region src/al-patterns.ts
var La = 50;
function Ra(e) {
	let t = [], n = (r) => {
		t.push({
			id: r.id,
			label: r.name ?? r.id,
			precision: e ? it(e, r) : 0
		}), r.children.forEach(n);
	};
	return e?.groups.forEach(n), t;
}
function za(e, t) {
	if (e === void 0) return "—";
	let n = Number(e);
	return e.trim() !== "" && Number.isFinite(n) ? at(n, t) : e;
}
var Ba = (e) => (/* @__PURE__ */ new Date(e * 1e3)).toLocaleDateString(), q = class extends r {
	constructor(...e) {
		super(...e), this.profileState = null, this.simLog = null, this.force = !1;
	}
	static {
		this.styles = [w, t`
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
		this.dispatchEvent(kn(this.force));
	}
	renderStatus() {
		let e = this.profileState;
		if (!e) return i`<div class="status muted">Profile not loaded yet.</div>`;
		let { producer: t, generated_at: n, training_window: r, day_types: a, slot_minutes: o } = e.profile;
		return i`
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
          <span class="window">${Ba(r[0])} – ${Ba(r[1])}</span>
        </div>
        <div class="muted">${a.join(", ")} · ${o}-minute slots</div>
      </div>
    `;
	}
	renderReadiness() {
		let e = this.profileState, t = Ra(this.config);
		if (!e || t.length === 0) return i`<div class="muted">${t.length === 0 ? "No groups configured." : "Nothing learned yet."}</div>`;
		let n = this.config?.defaults.patterns?.min_days ?? 14;
		return i`
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
		let r = t.ready[e.id] === !0, a = t.profile.groups[e.id]?.days ?? 0, o = this.hass?.states[de(e.id)]?.state;
		return i`<tr>
      <td class="group">${e.label}</td>
      <td class="ready ${r ? "yes" : "no"}" title=${r ? "Ready" : `Needs ${n} days`}>
        ${r ? "✓" : "✗"}
      </td>
      <td class="days">${a}</td>
      <td class="expected">${za(o, e.precision)}</td>
    </tr>`;
	}
	renderBlocked() {
		let t = Object.entries(this.simLog?.blocked ?? {}).filter((e) => typeof e[1] == "string");
		if (t.length === 0) return e;
		let n = Ra(this.config), r = (e) => n.find((t) => t.id === e)?.label ?? e;
		return i`<ul class="blocked">
      ${t.map(([e, t]) => i`<li><span class="group">${r(e)}:</span> <span>${t}</span></li>`)}
    </ul>`;
	}
	renderLog() {
		let e = [...this.simLog?.entries ?? []].sort((e, t) => t.t - e.t).slice(0, La);
		return e.length === 0 ? i`<div class="muted log-empty">No simulated light changes yet.</div>` : i`<ol class="log">
      ${e.map((e) => this.renderEntry(e))}
    </ol>`;
	}
	renderEntry(t) {
		return i`<li>
      <span class="muted">${(/* @__PURE__ */ new Date(t.t * 1e3)).toLocaleTimeString()}</span>
      <span class="entity">${t.entity_id}</span>
      <span class="state">${t.on ? "on" : "off"}</span>
      ${t.brightness === null ? e : i`<span class="muted">${t.brightness}</span>`}
    </li>`;
	}
	render() {
		return i`
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
m([s({ attribute: !1 })], q.prototype, "hass", void 0), m([s({ attribute: !1 })], q.prototype, "config", void 0), m([s({ attribute: !1 })], q.prototype, "profileState", void 0), m([s({ attribute: !1 })], q.prototype, "simLog", void 0), m([g()], q.prototype, "force", void 0), q = m([h("al-patterns")], q);
//#endregion
//#region src/types.ts
var Va = [
	"phone",
	"watch",
	"tag",
	"laptop",
	"other"
], Ha = [
	"activity",
	"steps",
	"battery_state"
], Ua = {
	phone: "mdi:cellphone",
	watch: "mdi:watch",
	tag: "mdi:tag",
	laptop: "mdi:laptop",
	other: "mdi:bluetooth"
}, Wa = {
	phone: "Phone",
	watch: "Watch",
	tag: "Tag",
	laptop: "Laptop",
	other: "Other"
}, Ga = {
	activity: "Activity",
	steps: "Steps",
	battery_state: "Battery state"
}, Ka = { entity: { filter: {
	domain: "device_tracker",
	integration: "bermuda"
} } }, qa = { entity: { filter: { domain: "person" } } }, Ja = { entity: { filter: {
	domain: "device_tracker",
	integration: "mobile_app"
} } }, Ya = { entity: { filter: { domain: "sensor" } } }, Xa = { select: {
	mode: "dropdown",
	options: Va.map((e) => ({
		value: e,
		label: Wa[e]
	}))
} }, Za = class extends r {
	constructor(...e) {
		super(...e), this.errors = [], this.presence = null;
	}
	static {
		this.styles = [
			w,
			oe,
			t`
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
		let i = y(r, ["presence"], {
			...x(r),
			people: e
		});
		this.dispatchEvent(n ? M(i, void 0, !0) : M(i, `presence:people:${t}`));
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
	renderSignal(t, n, r, a, o, s) {
		let c = Object.values(this.presence?.people ?? {}).flatMap((e) => Object.values(e.devices ?? {})).find((e) => e.tracker === r.tracker)?.signals[a], l = o === null ? e : o[a] ? i`<ha-icon class="found" icon="mdi:check-circle-outline" title="Found"></ha-icon>` : r.signals[a] || c ? i`<ha-icon class="missing" icon="mdi:alert-circle-outline" title="Configured but unavailable"></ha-icon>` : i`<span class="muted" title="Optional: no sensor configured or discovered">Optional</span>`;
		return i`<div class="signal signal-${a}">
      <ha-selector
        .hass=${this.hass}
        .selector=${Ya}
        .label=${Ga[a]}
        .helper=${r.companion ? "Blank: found on the companion device when available." : "Optional. Movement can also be detected from Bluetooth."}
        .required=${!1}
        .value=${this.text(r.signals[a])}
        @value-changed=${(e) => this.editDevice(t, n, { signals: {
			...r.signals,
			[a]: e.detail.value ? e.detail.value : null
		} }, a)}
      ></ha-selector>
      ${l}
      ${s[a] ? i`<div class="error">${s[a]}</div>` : e}
    </div>`;
	}
	renderDevice(t, n, r, a) {
		let o = j(this.errors, [
			"presence",
			"people",
			t,
			"devices",
			n
		]), s = j(this.errors, [
			"presence",
			"people",
			t,
			"devices",
			n,
			"signals"
		]), c = this.found(r, a), l = Object.values(this.presence?.people?.[r.name ?? ""]?.devices ?? {}).find((e) => e.tracker === a.tracker), u = a.name ?? l?.name ?? (a.tracker || "New device");
		return i`<details class="device" ?open=${!a.tracker || Object.keys(o).length > 0 || Object.keys(s).length > 0}>
      <summary>${u}${u === Wa[a.kind] ? e : i`<span class="device-kind">${Wa[a.kind]}</span>`}</summary>
      <div class="device-body"><div class="device-head">
        <div class="resource-links">${Vn(this, this.hass, a.tracker, "Open tracker", l?.device_id, "Open Bermuda device", !0)}</div>
        <button type="button"
          class="remove-device"
          aria-label="Remove device"
          @click=${() => this.removeDevice(t, n)}
          >Remove device</button>
      </div>
      <div class="fields">
        <ha-selector
          class="tracker"
          .hass=${this.hass}
          .selector=${Ka}
          .label=${"Bermuda tracker"}
          .required=${!0}
          .value=${a.tracker}
          @value-changed=${(e) => this.editDevice(t, n, { tracker: e.detail.value ?? "" }, "tracker")}
        ></ha-selector>
        ${o.tracker ? i`<div class="error">${o.tracker}</div>` : e}
        <ha-selector
          class="device-name"
          .hass=${this.hass}
          .selector=${{ text: {} }}
          .label=${"Name"}
          .helper=${"Blank: the Bermuda device's name."}
          .required=${!1}
          .value=${this.text(a.name)}
          @value-changed=${(e) => this.editDevice(t, n, { name: e.detail.value ? e.detail.value : null }, "name")}
        ></ha-selector>
        <ha-selector
          class="kind"
          .hass=${this.hass}
          .selector=${Xa}
          .label=${"Kind"}
          .required=${!0}
          .value=${a.kind}
          @value-changed=${(e) => this.editDevice(t, n, { kind: e.detail.value ?? "other" }, "kind")}
        ></ha-selector>
        <ha-selector
          class="companion"
          .hass=${this.hass}
          .selector=${Ja}
          .label=${"Companion app tracker"}
          .helper=${"Optional. The companion tracker for this device supplies carrying evidence."}
          .required=${!1}
          .value=${this.text(a.companion)}
          @value-changed=${(e) => this.editDevice(t, n, { companion: e.detail.value ? e.detail.value : null }, "companion")}
        ></ha-selector>
        ${Ha.map((e) => this.renderSignal(t, n, a, e, c, s))}
      </div></div>
    </details>`;
	}
	renderPerson(t, n) {
		let r = j(this.errors, [
			"presence",
			"people",
			t
		]);
		return i`<div class="person">
      <div class="person-head">
        <ha-icon icon="mdi:account"></ha-icon>
        <h4>${n.name ?? n.devices[0]?.name ?? n.person ?? "New person"}</h4>
        <button type="button" class="remove-person" aria-label="Remove person" @click=${() => this.removePerson(t)}
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
          .value=${this.text(n.name)}
          @value-changed=${(e) => this.editPerson(t, { name: e.detail.value ? e.detail.value : null }, "name")}
        ></ha-selector>
        ${r.name ? i`<div class="error">${r.name}</div>` : e}
        <ha-selector
          class="person-entity"
          .hass=${this.hass}
          .selector=${qa}
          .label=${"Person"}
          .helper=${"Its device_trackers seed the devices below: Bermuda ones to follow, a mobile_app one as the companion."}
          .required=${!1}
          .value=${this.text(n.person)}
          @value-changed=${(e) => this.editPerson(t, { person: e.detail.value ? e.detail.value : null }, "person")}
        ></ha-selector>
        ${r.person ? i`<div class="error">${r.person}</div>` : e}
      </div>
      ${n.devices.map((e, r) => this.renderDevice(t, r, n, e))}
      <button type="button" class="add-device" @click=${() => this.addDevice(t)}>Add device</button>
    </div>`;
	}
	render() {
		if (!this.config) return e;
		let t = this.people;
		return i`
      ${t.length === 0 ? i`<div class="empty">Nobody is followed yet. Add a person and pick their person entity.</div>` : e}
      ${t.map((e, t) => this.renderPerson(t, e))}
      <button type="button" class="add-person" @click=${() => this.addPerson()}>Add person</button>
    `;
	}
};
m([s({ attribute: !1 })], Za.prototype, "hass", void 0), m([s({ attribute: !1 })], Za.prototype, "config", void 0), m([s({ attribute: !1 })], Za.prototype, "errors", void 0), m([s({ attribute: !1 })], Za.prototype, "presence", void 0), Za = m([h("al-people-editor")], Za);
function Qa(e) {
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
function $a(e, t) {
	if (e === 0 && t === 0) return 0;
	let n = e === 0 ? Infinity : 60 / Math.abs(e), r = t === 0 ? Infinity : 27 / Math.abs(t);
	return Math.min(n, r, .5);
}
function eo(e, t) {
	let n = new Set(t.nodes), r = new Set(t.exits), i = [], a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
	for (let t of Qa(e)) {
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
		let a = i.x - t.x, o = i.y - t.y, s = $a(a, o);
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
var to = (e, t) => ({
	x: e.x1 + (e.x2 - e.x1) * t,
	y: e.y1 + (e.y2 - e.y1) * t
}), no = (e, t, n) => e.edges.find((e) => e.a === t && e.b === n || e.a === n && e.b === t);
function ro(e, t) {
	let n = [];
	for (let r = 1; r < t.length; r++) {
		let i = no(e, t[r - 1], t[r]);
		i && n.push(i);
	}
	return n;
}
//#endregion
//#region src/al-presence.ts
var io = 2e3, ao = "away", oo = {
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
}, so = {
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
}, co = [
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
], lo = [
	"charging",
	"moving",
	"still_room_empty",
	"jitter"
], uo = [
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
], fo = (e) => {
	if (e === "activity_floor") return "presence/activity/floor";
	if (e.startsWith("carried_")) {
		let t = e.slice(8);
		return `presence/carried/${lo.includes(t) ? "weights/" : ""}${t}`;
	}
	return `presence/${e}`;
}, po = { entity: {
	multiple: !0,
	filter: {
		domain: "device_tracker",
		integration: "bermuda"
	}
} }, mo = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, ho = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "slider"
} }, go = { number: {
	min: 0,
	max: .1,
	step: .001,
	mode: "box"
} }, _o = { number: {
	min: .1,
	step: .1,
	mode: "box"
} }, vo = { number: {
	min: .01,
	max: 1,
	step: .01,
	mode: "box"
} }, yo = { duration: {} }, bo = { number: {
	min: .01,
	max: .99,
	step: .01,
	mode: "slider"
} }, xo = { number: {
	min: -10,
	max: 10,
	step: .5,
	mode: "box"
} }, So = " → ", Co = "Give it an area that matches a room, or map it in Settings below.", wo = "Enable these distance sensors in Settings → Devices & services → Bermuda, then reload Activity Levels:", J = (e) => typeof e == "number" && Number.isFinite(e) ? e : null, Y = class extends r {
	constructor(...e) {
		super(...e), this.errors = [], this.narrow = !1, this.topology = null, this.presence = null, this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, this.correctionPending = !1, this.correctionError = null, this.notice = null, this.computeLabel = (e) => oo[e.name] ?? e.name, this.computeHelper = (e) => so[e.name] ?? "", this.onDevicesChanged = (e) => {
			e.stopPropagation();
			let t = this.config;
			if (!t) return;
			let n = x(t), r = {
				...n,
				people: this.mergePeople(e.detail?.value, n.people)
			};
			this.dispatchEvent(M(y(t, ["presence"], r), "presence:people"));
		};
	}
	static {
		this.styles = [
			w,
			oe,
			t`
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
		}, io);
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
			this.topology = await l(e);
		} catch {}
	}
	async refreshPresence() {
		let e = this.hass;
		if (e) try {
			this.presence = await ne(e);
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
			await ee(n, e, r), this.notice = r.device ? "Device correction saved." : r.room ? `Moved ${e} to ${this.roomName(r.room)}.` : "Automatic estimate restored.", this.correcting = null, this.correctingDevice = null, this.carryingChoices = {}, await this.refreshPresence();
		} catch (e) {
			let t = e && typeof e == "object" && "message" in e ? String(e.message) : String(e);
			this.correctionError = `Could not save correction: ${t}`;
		} finally {
			this.correctionPending = !1;
		}
	}
	correctionStatus(t) {
		if (!t) return e;
		let n = typeof t.value == "boolean" ? t.value ? "Carrying" : "Not carrying" : this.roomName(t.value), r = t.reason.replaceAll("_", " ");
		return i`<div class="hint correction-status" role="status">${n} — ${r}
      (${Math.round(t.strength * 100)}%) · <time datetime=${(/* @__PURE__ */ new Date(t.t * 1e3)).toISOString()}>${(/* @__PURE__ */ new Date(t.t * 1e3)).toLocaleTimeString()}</time></div>`;
	}
	get correctionRooms() {
		let e = this.config;
		return [...this.topology?.nodes ?? (e ? [...st(e)] : []), ao];
	}
	get labels() {
		let e = this.config;
		return new Map(e ? Qa(e).map((e) => [e.id, e.label]) : []);
	}
	roomName(e) {
		return e == null || e === "" ? "—" : e === ao ? "Away" : this.labels.get(e) ?? e;
	}
	areaName(e) {
		return e === null ? "—" : this.hass?.areas[e]?.name ?? e;
	}
	trail(e) {
		return e.map((e) => this.roomName(e)).join(So);
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
					options: Zr(e)
				} }
			},
			{
				name: "threshold",
				selector: ho
			},
			{
				name: "stay",
				selector: mo
			},
			{
				name: "escape",
				selector: go
			},
			{
				name: "scale",
				selector: _o
			},
			{
				name: "floor",
				selector: vo
			},
			{
				name: "stuck_after",
				selector: yo
			},
			{
				name: "activity_floor",
				selector: vo
			},
			{
				name: "carried_prior",
				selector: bo
			},
			{
				name: "carried_flip",
				selector: yo
			},
			{
				name: "carried_recent",
				selector: yo
			},
			{
				name: "carried_nearby",
				selector: bo
			},
			...lo.map((e) => ({
				name: `carried_${e}`,
				selector: xo
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
		let n = x(t), r = e.detail?.value ?? {}, i = {
			charging: J(r.carried_charging) ?? n.carried.weights.charging,
			moving: J(r.carried_moving) ?? n.carried.weights.moving,
			still_room_empty: J(r.carried_still_room_empty) ?? n.carried.weights.still_room_empty,
			jitter: J(r.carried_jitter) ?? n.carried.weights.jitter
		}, a = {
			...n,
			enabled: typeof r.enabled == "boolean" ? r.enabled : n.enabled,
			envelope: r.envelope === void 0 ? n.envelope : typeof r.envelope == "string" && r.envelope !== "" ? r.envelope : null,
			threshold: J(r.threshold) ?? n.threshold,
			stay: J(r.stay) ?? n.stay,
			escape: J(r.escape) ?? n.escape,
			scale: J(r.scale) ?? n.scale,
			floor: J(r.floor) ?? n.floor,
			stuck_after: D(r.stuck_after) ?? n.stuck_after,
			activity: { floor: J(r.activity_floor) ?? n.activity.floor },
			carried: {
				prior: J(r.carried_prior) ?? n.carried.prior,
				flip: D(r.carried_flip) ?? n.carried.flip,
				recent: D(r.carried_recent) ?? n.carried.recent,
				nearby: J(r.carried_nearby) ?? n.carried.nearby,
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
		}, s = co.find((e) => !o(e));
		s !== void 0 && this.dispatchEvent(M(y(t, ["presence"], a), `presence:${s}`));
	}
	setSetting(e, t) {
		let n = this.config;
		if (!n) return;
		let r = {
			...x(n),
			[e]: t
		};
		this.dispatchEvent(M(y(n, ["presence"], r), `presence:${e}`));
	}
	renderSetup(e) {
		let t = this.presence?.bermuda === !0, n = x(e);
		return i`<ha-card class="setup" header="Room presence">
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
        .selector=${po}
        .label=${oo.devices}
        .helper=${so.devices}
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
		let t = Object.entries(this.presence?.people ?? {}).filter(([, e]) => typeof e.room == "string").sort(([e], [t]) => e.localeCompare(t));
		return t.length === 0 ? i`<ha-card header="People"
        ><div class="empty">Nobody has reported a room yet.</div></ha-card
      >` : i`<ha-card><h2>People</h2>
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
          ${t.flatMap(([t, n]) => [
			this.renderPerson(t, n),
			this.correcting === t ? this.renderCorrection(t, n) : e,
			this.correctingDevice?.person === t ? this.renderDeviceCorrection(t, n) : e
		])}
        </tbody>
      </table></div>
      ${this.notice === null ? e : i`<div class="notice" role="status">${this.notice}</div>`}
    </ha-card>`;
	}
	renderCorrection(t, n) {
		let r = Object.entries(n.candidates).sort(([, e], [, t]) => t - e).map(([e]) => e);
		return i`<tr class="correct">
      <td colspan="6"><div class="correction-panel">
        <span class="question">Where is ${t}?</span>
        <div class="correction-fields">${Object.entries(n.devices ?? {}).map(([e, t]) => i`<label>${t.name}
          <select data-carrying=${e} ?disabled=${this.correctionPending} aria-label=${`Carrying ${t.name}`} .value=${String(this.carryingChoices[e] ?? "")}
            @change=${(t) => {
			let n = t.target.value, r = { ...this.carryingChoices };
			n === "" ? delete r[e] : r[e] = n === "true", this.carryingChoices = r;
		}}>
            <option value="">Keep estimate (${t.carried === null ? "unknown" : `${Math.round(t.carried * 100)}% carrying`})</option>
            <option value="true">Carrying</option><option value="false">Not carrying</option>
          </select></label>`)}</div>
        ${this.correctionError ? i`<div role="alert">${this.correctionError}</div>` : e}
        <div class="actions">${r.map((e) => i`<button type="button" class="candidate" ?disabled=${this.correctionPending} @click=${() => void this.correct(t, e)}
              >${this.roomName(e)}</button
            >`)}
        <select
          class="every-room" aria-label="Person room" ?disabled=${this.correctionPending}
          @change=${(e) => {
			let n = e.target.value;
			n !== "" && this.correct(t, n);
		}}
        >
          <option value="">Somewhere else…</option>
          ${this.correctionRooms.map((e) => i`<option value=${e}>${this.roomName(e)}</option>`)}
        </select>
        <button type="button" class="automatic-person" ?disabled=${this.correctionPending} @click=${() => void this.correct(t, { clear: !0 })}>Use automatic estimate</button>
        <button type="button" class="cancel" @click=${() => this.correcting = null}>Close</button></div>
      </div></td>
    </tr>`;
	}
	renderPerson(t, n) {
		let r = Math.round(n.confidence * 100), a = Object.entries(n.devices ?? {}).sort(([e], [t]) => e.localeCompare(t));
		return i`<tr class="device person">
      <td class="who" data-label="Person">
        <button
          class="link" type="button"
          aria-expanded=${this.correcting === t ? "true" : "false"}
          title="Say where ${t} really is"
          @click=${() => {
			this.correcting = this.correcting === t ? null : t, this.correctingDevice = null, this.carryingChoices = {}, this.correctionError = null;
		}}
        >
          ${t}
        </button>
      </td>
      <td class="room" data-label="Room">
        ${this.roomName(n.room)}
        ${this.correctionStatus(n.correction)}
        ${n.moving ? i`<span class="chip moving">moving</span>` : e}
      </td>
      <td data-label="Confidence">
        <span class="confidence-label">${r}%</span>
        <div class="meter" title=${`${r}%`}>
          <div class="confidence" style=${`width: ${r}%`}></div>
        </div>
      </td>
      <td class="devices" data-label="Devices">${a.map(([e, n]) => this.renderDeviceChip(t, e, n))}</td>
      <td class="breadcrumb" data-label="Came from">${n.path.length === 0 ? "—" : this.trail(n.path)}</td>
      <td class="when" data-label="Updated">${(/* @__PURE__ */ new Date(n.t * 1e3)).toLocaleTimeString()}</td>
    </tr>`;
	}
	renderDeviceChip(t, n, r) {
		let a = r.carried, o = a !== null && a < .5, s = a === null ? "—" : `${Math.round(a * 100)}%`, c = `${r.name} (${Wa[r.kind]}): carried ${s}${o && r.room ? `, in ${this.roomName(r.room)}` : ""}`;
		return i`<div class="device-entry"><button type="button" aria-expanded=${this.correctingDevice?.person === t && this.correctingDevice.device === n ? "true" : "false"} aria-label=${`Correct ${r.name}`} @click=${() => {
			this.correctingDevice = {
				person: t,
				device: n
			}, this.correcting = null, this.correctionError = null;
		}} class="chip device-chip ${o ? "parked" : "carried"}" data-device=${n} title=${c}>
      <ha-icon icon=${Ua[r.kind] ?? Ua.other}></ha-icon>
      <span class="device-name">${r.name}</span>
      <span class="carried-pct">${s} carrying</span>
      ${o && r.room ? i`<span class="parked-room">${this.roomName(r.room)}</span>` : e}
    </button>${this.correctionStatus(r.correction)}${this.correctionStatus(r.carrying_correction)}</div>`;
	}
	renderDeviceCorrection(t, n) {
		let r = this.correctingDevice?.device, a = r ? n.devices[r] : void 0;
		return !r || !a ? e : i`<tr class="correct device-correction"><td colspan="6"><div class="correction-panel">
      <div class="question">${a.name}</div>
      <div class="resource-links">${Vn(this, this.hass, a.tracker, "Open tracker", a.device_id, "Open Bermuda device", !0)}</div>
      <div class="correction-fields"><label>Device room <select aria-label="Device room" ?disabled=${this.correctionPending} @change=${(e) => {
			let n = e.target.value;
			n && this.correct(t, {
				device: r,
				room: n
			});
		}}><option value="">Choose a room…</option>${this.correctionRooms.map((e) => i`<option value=${e}>${this.roomName(e)}</option>`)}</select></label></div>
      <div class="actions"><button type="button" class="carrying" ?disabled=${this.correctionPending} @click=${() => void this.correct(t, {
			device: r,
			carried: !0
		})}>Carrying</button>
      <button type="button" class="not-carrying" ?disabled=${this.correctionPending} @click=${() => void this.correct(t, {
			device: r,
			carried: !1
		})}>Not carrying</button>
      <button type="button" class="automatic-device" ?disabled=${this.correctionPending} @click=${() => void this.correct(t, {
			device: r,
			clear: !0
		})}>Use automatic estimate</button>
      <button type="button" @click=${() => {
			this.correctingDevice = null;
		}}>Close</button></div>
      <div class="hint">Movement can return this device to automatic estimation. Missing companion sensors are optional.</div>
      ${this.correctionError ? i`<div role="alert">${this.correctionError}</div>` : e}
    </div></td></tr>`;
	}
	renderScanners() {
		let e = this.presence?.scanners ?? [], t = new Set(this.presence?.unmapped ?? []);
		return i`<ha-card><h2>Scanners</h2>
      ${e.length === 0 ? i`<div class="empty">No Bermuda scanners have been discovered.</div>` : i`<div class="table-scroll"><table>
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
		return i`<tr class="scanner ${t ? "unmapped" : ""}">
      <td class="name">${Bn("device", e.device_id, e.name)}</td>
      <td class="area">${Bn("area", e.area_id, this.areaName(e.area_id))}</td>
      <td class="room">${t ? Co : this.roomName(e.group_id)}</td>
    </tr>`;
	}
	renderDisabled() {
		let t = this.presence?.disabled ?? [];
		return t.length === 0 ? e : i`<div class="disabled-sensors">
      ${wo}
      <ul>
        ${t.map((e) => i`<li>${e}</li>`)}
      </ul>
    </div>`;
	}
	renderSettings(e) {
		let t = x(e), n = Object.fromEntries(co.flatMap((e) => {
			let t = this.errors.find((t) => t.path === fo(e));
			return t ? [[e, t.message]] : [];
		})), r = this.errors.filter((e) => e.path === "presence"), a = {
			enabled: t.enabled,
			envelope: t.envelope ?? "",
			threshold: t.threshold,
			stay: t.stay,
			escape: t.escape,
			scale: t.scale,
			floor: t.floor,
			stuck_after: E(t.stuck_after),
			activity_floor: t.activity.floor,
			carried_prior: t.carried.prior,
			carried_flip: E(t.carried.flip),
			carried_recent: E(t.carried.recent),
			carried_nearby: t.carried.nearby,
			...Object.fromEntries(lo.map((e) => [`carried_${e}`, t.carried.weights[e]]))
		}, o = (t) => i`<ha-form
      class="presence-settings" data-section=${t.id}
      .hass=${this.hass}
      .data=${Object.fromEntries(t.fields.map((e) => [e, a[e]]))}
      .schema=${this.schemaFor(e).filter((e) => t.fields.includes(e.name))}
      .error=${n}
      .computeLabel=${this.computeLabel}
      .computeHelper=${this.computeHelper}
      @value-changed=${this.onFormChanged}
    ></ha-form>`, s = uo[0];
		return i`<ha-card><details class="settings" ?open=${this.errors.some((e) => e.path.startsWith("presence"))}>
      <summary>Presence settings</summary><div class="settings-body">
      ${r.map((e) => i`<ha-alert alert-type="error">${e.message}</ha-alert>`)}
      <section class="settings-section">
        <h3>People and devices</h3>
        <p>Choose who to follow and the devices they carry. Open a device to edit its trackers and signals.</p>
        <al-people-editor .hass=${this.hass} .config=${e} .errors=${this.errors} .presence=${this.presence}></al-people-editor>
      </section>
      <section class="settings-section">
        <h3>${s.title}</h3><p>${s.hint}</p>${o(s)}
      </section>
      <div class="settings-grid">
        ${uo.slice(1).map((e) => i`<details class="settings-section" data-section=${e.id}
          ?open=${e.fields.some((e) => n[e] !== void 0)}>
          <summary>${e.title}</summary><p>${e.hint}</p>${o(e)}
        </details>`)}
      </div>
    </div></details></ha-card>`;
	}
	render() {
		let e = this.config;
		return e ? x(e).enabled ? i`<div class="page">
      ${this.renderPeople()} ${this.renderScanners()} ${this.renderSettings(e)}
    </div>` : i`<div class="page">${this.renderSetup(e)}</div>` : i`<div class="page"><ha-card><span class="muted">Loading…</span></ha-card></div>`;
	}
};
m([s({ attribute: !1 })], Y.prototype, "hass", void 0), m([s({ attribute: !1 })], Y.prototype, "config", void 0), m([s({ attribute: !1 })], Y.prototype, "errors", void 0), m([s({ type: Boolean })], Y.prototype, "narrow", void 0), m([g()], Y.prototype, "topology", void 0), m([g()], Y.prototype, "presence", void 0), m([g()], Y.prototype, "correcting", void 0), m([g()], Y.prototype, "correctingDevice", void 0), m([g()], Y.prototype, "carryingChoices", void 0), m([g()], Y.prototype, "correctionPending", void 0), m([g()], Y.prototype, "correctionError", void 0), m([g()], Y.prototype, "notice", void 0), Y = m([h("al-presence")], Y);
//#endregion
//#region src/al-graph-map.ts
var To = 60, Eo = 27, Do = 2, Oo = 9, ko = 7, X = (e) => String(Math.round(e * 10) / 10), Z = class extends r {
	constructor(...e) {
		super(...e), this.topology = null, this.presence = null, this.selected = [null, null], this.paths = [];
	}
	static {
		this.styles = [w, t`
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
		this.dispatchEvent(An(e));
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
			let s = no(e, a, o);
			s && t.push({
				name: r,
				...to(s, .5)
			});
		}
		return t;
	}
	summary(e) {
		let t = `${e.nodes.length} room${e.nodes.length === 1 ? "" : "s"}`, n = `${e.edges.length} door${e.edges.length === 1 ? "" : "s"}`, r = e.nodes.filter((e) => this.occupantsOf(e.id).length > 0).map((e) => `${e.label}: ${this.occupantsOf(e.id).join(", ")}`);
		return `Room map, ${t} and ${n}. ${r.length === 0 ? "Nobody is in a room right now." : `${r.join("; ")}.`}`;
	}
	renderEdge(t, r) {
		let i = r.has(t);
		return n`<line
      class="edge ${i ? "on-path" : ""}"
      data-one-way=${t.oneWay}
      x1=${X(t.x1)}
      y1=${X(t.y1)}
      x2=${X(t.x2)}
      y2=${X(t.y2)}
      marker-end=${t.oneWay ? "url(#al-arrow)" : e}
    ></line>`;
	}
	renderNode(t) {
		let r = this.occupantsOf(t.id), i = r.slice(0, Do), a = r.length - i.length, o = this.selected.includes(t.id), s = [...i, ...a > 0 ? [`+${a}`] : []].join(", "), c = [
			t.label,
			t.exit ? "an exit" : "",
			r.length > 0 ? `${r.length} here: ${r.join(", ")}` : "empty"
		].filter((e) => e !== "").join(", ");
		return n`<g
      class="node ${o ? "selected" : ""}"
      data-id=${t.id}
      role="button"
      tabindex="0"
      aria-pressed=${o ? "true" : "false"}
      aria-label=${c}
      @click=${() => this.select(t.id)}
      @keydown=${(e) => this.onKeydown(e, t.id)}
    >
      <rect
        class="box"
        x=${X(t.x - To)}
        y=${X(t.y - Eo)}
        width=${120}
        height=${54}
        rx="8"
      ></rect>
      <text class="label" x=${X(t.x)} y=${X(t.y - 4)} text-anchor="middle">${t.label}</text>
      ${s === "" ? e : n`<text class="names" x=${X(t.x)} y=${X(t.y + 13)} text-anchor="middle">${s}</text>`}
      ${r.length === 0 ? e : this.renderBadge(t, r.length)}
      ${t.exit ? this.renderDoor(t) : e}
    </g>`;
	}
	renderBadge(e, t) {
		let r = e.x + To - Oo - 3, i = e.y - Eo + Oo + 3;
		return n`<circle class="badge" cx=${X(r)} cy=${X(i)} r=${Oo}></circle>
      <text class="count" x=${X(r)} y=${X(i + 3.5)} text-anchor="middle">${t}</text>`;
	}
	renderDoor(e) {
		let t = e.x - To + 7, r = e.y + Eo - 7;
		return n`<path class="door" d=${`M ${X(t)} ${X(r)} v -14 h 10 v 14 z`}></path>`;
	}
	renderPerson(e) {
		return n`<circle class="person" data-name=${e.name} cx=${X(e.x)} cy=${X(e.y)} r=${ko}>
      <title>${e.name} is on the move</title>
    </circle>`;
	}
	render() {
		let e = this.config, t = this.topology;
		if (!e || !t || t.nodes.length === 0) return i`<div class="empty">
        No rooms are connected yet — set <em>Adjacent rooms</em> on a group in the Groups tab.
      </div>`;
		let n = eo(e, t), r = new Set(this.paths.flatMap((e) => ro(n, e))), a = this.summary(n);
		return i`
      <svg
        style="width: ${n.width}px"
        viewBox="0 0 ${n.width} ${n.height}"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label=${a}
      >
        <title>${a}</title>
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
m([s({ attribute: !1 })], Z.prototype, "hass", void 0), m([s({ attribute: !1 })], Z.prototype, "config", void 0), m([s({ attribute: !1 })], Z.prototype, "topology", void 0), m([s({ attribute: !1 })], Z.prototype, "presence", void 0), m([s({ attribute: !1 })], Z.prototype, "selected", void 0), m([s({ attribute: !1 })], Z.prototype, "paths", void 0), Z = m([h("al-graph-map")], Z);
//#endregion
//#region src/al-paths.ts
var Q = class extends r {
	constructor(...e) {
		super(...e), this.narrow = !1, this.topology = null, this.selected = [null, null], this.paths = [], this.pending = !1, this.error = null, this.loading = !1, this.pathSeq = 0, this.topologySeq = 0;
	}
	static {
		this.styles = [
			w,
			oe,
			t`
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
			let t = await l(this.hass);
			e === this.topologySeq && (this.topology = t);
		} catch {
			e === this.topologySeq && (this.error = "Could not load room connections. Try again.");
		} finally {
			e === this.topologySeq && (this.loading = !1);
		}
	}
	roomName(e) {
		return this.config ? Qa(this.config).find((t) => t.id === e)?.label ?? e : e;
	}
	async select(e) {
		let t = this.selected.filter((e) => e !== null), n = t.includes(e) ? t.filter((t) => t !== e) : [...t, e].slice(-2);
		this.selected = [n[0] ?? null, n[1] ?? null], this.paths = [], this.error = null;
		let r = ++this.pathSeq, [i, a] = this.selected;
		if (this.pending = !1, !(!this.hass || !i || !a)) {
			this.pending = !0;
			try {
				let e = await u(this.hass, i, a);
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
			let n = this.selected[0] === e.id ? "From" : this.selected[1] === e.id ? "To" : "", r = e.name ?? e.id, a = i`<button class="room" type="button" data-room=${e.id}
        aria-pressed=${n ? "true" : "false"} @click=${(t) => {
				t.preventDefault(), t.stopPropagation(), this.select(e.id);
			}}>
        <span>${r}</span><span class="endpoint">${n}</span>
      </button>`;
			return e.children.length ? i`<details open>
        <summary>${t.has(e.id) ? a : r}</summary>
        <div class="branch">${this.renderTree(e.children, t)}</div>
      </details>` : t.has(e.id) ? a : i``;
		});
	}
	renderRoutes() {
		let [t, n] = this.selected;
		if (!t || !n) return i`<div class="paths">Select two rooms in the tree or map to see their routes.</div>`;
		let r = `${this.roomName(t)} → ${this.roomName(n)}`;
		return i`<div class="paths" role="status">
      ${this.pending ? `Finding routes from ${r}…` : this.error ? e : i`
        <div>${this.paths.length ? `${this.paths.length} route${this.paths.length === 1 ? "" : "s"} from ${r}` : `No route from ${r}`}</div>
        <ol>${this.paths.map((e) => i`<li>${e.map((e) => this.roomName(e)).join(" → ")}</li>`)}</ol>
      `}
    </div>`;
	}
	render() {
		return i`<div class="page ${this.narrow ? "narrow" : ""}">
      ${this.error ? i`<ha-alert alert-type="error">${this.error}
        ${this.topology ? e : i`<button type="button" @click=${() => void this.refreshTopology()}>Retry</button>`}
      </ha-alert>` : e}
      <div class="paths-layout">
        <ha-card><h2>Rooms</h2><nav class="room-tree" aria-label="Room hierarchy">
          ${this.loading ? i`<p role="status">Loading rooms…</p>` : this.topology && this.config ? this.renderTree(this.config.groups, new Set(this.topology.nodes)) : e}
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
m([s({ attribute: !1 })], Q.prototype, "hass", void 0), m([s({ attribute: !1 })], Q.prototype, "config", void 0), m([s({ type: Boolean })], Q.prototype, "narrow", void 0), m([g()], Q.prototype, "topology", void 0), m([g()], Q.prototype, "selected", void 0), m([g()], Q.prototype, "paths", void 0), m([g()], Q.prototype, "pending", void 0), m([g()], Q.prototype, "error", void 0), m([g()], Q.prototype, "loading", void 0), Q = m([h("al-paths")], Q);
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
var $ = class extends r {
	constructor(...e) {
		super(...e), this.errors = [], this.available = !0, this.parseError = null, this.seq = 0, this.onYaml = (e) => {
			e.stopPropagation(), window.clearTimeout(this.timer);
			let t = e.detail;
			this.timer = window.setTimeout(() => void this.settle(t), 400);
		};
	}
	static {
		this.styles = [w, t`
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
			this.parseError = e.errorMsg ?? "This is not valid YAML.", this.dispatchEvent(vn(!1, []));
			return;
		}
		this.parseError = null;
		let t = e.value;
		this.mine = t, this.dispatchEvent(M(t, "code")), await this.validate(t);
	}
	async validate(e) {
		let t = this.hass;
		if (!t || !e) return;
		let n = ++this.seq;
		try {
			let { errors: r } = await ce(t, e);
			n === this.seq && this.dispatchEvent(vn(!0, r));
		} catch {}
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
		return this.parseError === null ? this.errors.length === 0 ? i`<p class="muted no-problems">No problems. Save applies this document.</p>` : i`
      <p class="count muted">
        ${this.errors.length} ${this.errors.length === 1 ? "problem" : "problems"} — Save is
        disabled until they are fixed.
      </p>
      <ul class="errors">
        ${this.errors.map((e) => i`<li>
            <button type="button" class="jump" @click=${() => this.jump(e.path)}>
              <span class="path">${e.path === "" ? "(document)" : e.path}</span> —
              <span class="message">${e.message}</span>
            </button>
          </li>`)}
      </ul>
    ` : i`<ha-alert class="parse-error" alert-type="error">${this.parseError}</ha-alert>`;
	}
	renderUnavailable() {
		return i`<ha-card header="Code">
      <ha-alert class="editor-missing" alert-type="warning">
        Home Assistant's YAML editor did not load, so this tab cannot open. Visit
        <em>Settings → Devices &amp; services</em> once and reload the page; the other tabs edit the
        same configuration in the meantime.
      </ha-alert>
    </ha-card>`;
	}
	render() {
		return this.available ? i`
      <div class="page">
        <ha-card header="Configuration">
          <ha-yaml-editor @value-changed=${this.onYaml}></ha-yaml-editor>
          ${this.config === void 0 ? e : this.renderProblems()}
        </ha-card>
      </div>
    ` : i`<div class="page">${this.renderUnavailable()}</div>`;
	}
};
m([s({ attribute: !1 })], $.prototype, "hass", void 0), m([s({ attribute: !1 })], $.prototype, "config", void 0), m([s({ attribute: !1 })], $.prototype, "errors", void 0), m([s({ type: Boolean })], $.prototype, "available", void 0), m([g()], $.prototype, "parseError", void 0), $ = m([h("al-code")], $);
//#endregion
