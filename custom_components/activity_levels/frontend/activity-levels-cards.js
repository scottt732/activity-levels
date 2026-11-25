import { $t as e, Gt as t, Jt as n, Kt as r, N as i, Ot as a, P as o, Wt as s, Xt as c, i as l, qt as u, t as d } from "./shared-C6Iuja60.js";
//#region src/presence-card-model.ts
var f = (e, t) => e === "watch" ? t ? "Wearing" : "Not wearing" : t ? "Carrying" : "Not carrying", p = (e) => ({
	watch: "mdi:watch",
	phone: "mdi:cellphone",
	laptop: "mdi:laptop",
	tag: "mdi:tag"
})[e] ?? "mdi:devices";
function m(e, t, n) {
	return Object.entries(e.people ?? {}).map(([e, n]) => {
		let r = n.probabilities ?? n.candidates ?? {};
		return {
			name: e,
			person: n,
			probability: Math.min(1, t.rooms.reduce((e, t) => e + (r[t] ?? 0), 0))
		};
	}).filter(({ probability: e }) => e > 0 && e >= n);
}
function h(e, t) {
	return Object.entries(e.devices ?? {}).filter(([, e]) => {
		let n = e.carrying_correction;
		return !(n?.value === !1 && n.strength > 0) && e.room !== null && t.rooms.includes(e.room) && (e.confidence ?? 0) > 0;
	});
}
//#endregion
//#region src/presence-card-store.ts
var g = /* @__PURE__ */ new WeakMap(), _ = class {
	constructor(e) {
		this.hass = e, this.listeners = /* @__PURE__ */ new Set(), this.generation = 0, this.pending = !1, this.snapshot = {};
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot), this.listeners.size === 1 && this.refresh(), () => {
			this.listeners.delete(e), this.listeners.size || (clearTimeout(this.timer), this.generation++, this.pending = !1);
		};
	}
	async refresh() {
		if (this.pending || !this.listeners.size) return;
		clearTimeout(this.timer), this.pending = !0;
		let e = this.generation;
		try {
			let t = await this.hass.callWS({ type: "activity_levels/presence/dashboard" });
			if (e !== this.generation) return;
			this.snapshot = { data: t };
		} catch (t) {
			if (e !== this.generation) return;
			this.snapshot = {
				...this.snapshot,
				error: t instanceof Error ? t.message : String(t?.message ?? t)
			};
		} finally {
			if (e === this.generation) {
				this.pending = !1;
				for (let e of this.listeners) e(this.snapshot);
				this.listeners.size && (this.timer = setTimeout(() => void this.refresh(), 2e3));
			}
		}
	}
};
function v(e) {
	let t = e.connection ?? e.callWS, n = g.get(t);
	return n || (n = new _(e), g.set(t, n)), n.hass = e, n;
}
//#endregion
//#region src/al-presence-card.ts
var y = class extends u {
	constructor(...e) {
		super(...e), this.adding = !1, this.destination = "", this.pending = !1, this.correctionError = "", this.notice = "", this.failedImages = /* @__PURE__ */ new Set(), this.manual = /* @__PURE__ */ new Set();
	}
	static {
		this.styles = [i, e`
    :host { display: block; color: var(--primary-text-color); }
    ha-card { display: block; padding: 12px 16px; }
    h2 { font-size: 1.1em; margin-bottom: 12px; }
    .people { display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-start; }
    .person { display: flex; align-items: flex-end; min-height: 62px; max-width: 100%; }
    .avatar, .add { flex: none; width: 52px; height: 52px; min-height: 52px; padding: 3px; border-radius: 50%; border: 2px solid var(--primary-color); overflow: hidden; align-self: flex-start; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
    .avatar.possible { border: 2px dashed var(--secondary-text-color); }
    .possible img { opacity: .5; filter: grayscale(1); }
    .devices { display: flex; flex-wrap: wrap; gap: 3px; margin-left: -16px; position: relative; max-width: calc(100% - 36px); }
    .device { display: grid; place-items: center; border-radius: 50%; width: 30px; min-height: 30px; height: 30px; padding: 4px; box-shadow: 0 0 0 2px var(--card-background-color); background: var(--secondary-background-color); }
    .device ha-icon { --mdc-icon-size: 17px; }
    .add { border: 1px dashed var(--secondary-text-color); font-size: 24px; }
    .hint { color: var(--secondary-text-color); font-size: .9em; }
    .error { color: var(--error-color); margin: 8px 0; }
    dialog { color: var(--primary-text-color); background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 8px; padding: 20px; width: min(680px, calc(100vw - 32px)); max-height: calc(100dvh - 48px); box-sizing: border-box; }
    dialog::backdrop { background: rgb(0 0 0 / .45); }
    dialog header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    dialog h2 { margin: 0; }
    .choices { display: grid; gap: 8px; }
    .choices button { text-align: left; }
    .primary { background: var(--primary-color); color: var(--text-primary-color, white); }
    label { display: grid; gap: 6px; margin: 14px 0; }
    select { width: 100%; }
    .notice { margin-top: 8px; }
    .split { display: grid; grid-template-columns: minmax(160px, 220px) 1fr; gap: 20px; }
    @media (max-width: 560px) { .split { grid-template-columns: 1fr; } }
    .people-list { display: grid; gap: 6px; align-content: start; }
    .row { display: grid; grid-template-columns: 32px 1fr auto; align-items: center; gap: 10px; text-align: left; padding: 6px 10px; }
    .mini { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: var(--secondary-background-color); }
    .mini img { width: 100%; height: 100%; object-fit: cover; }
    .add-row .mini { border: 1px dashed var(--secondary-text-color); background: none; }
    .detail h3 { margin: 0 0 8px; }
    .device-list { display: grid; gap: 6px; margin-top: 14px; }
    .device-row { display: grid; grid-template-columns: 20px 1fr auto; align-items: center; gap: 10px; text-align: left; }
    .device-row ha-icon { --mdc-icon-size: 18px; }
  `];
	}
	setConfig(e) {
		if (!e || typeof e.group != "string" || !e.group.trim()) throw Error("Select a room or floor group.");
		let t = e.min_probability ?? .1;
		if (!Number.isFinite(t) || t < 0 || t > 1) throw Error("min_probability must be between 0 and 1.");
		this.config = { ...e }, this.closeDialog();
	}
	static getConfigElement() {
		return document.createElement("activity-levels-presence-card-editor");
	}
	static getStubConfig() {
		return {
			type: "custom:activity-levels-presence-card",
			group: ""
		};
	}
	getCardSize() {
		return this.config?.title ? 2 : 1;
	}
	getGridOptions() {
		return {
			columns: 12,
			rows: "auto",
			min_columns: 3,
			min_rows: 1
		};
	}
	connectedCallback() {
		super.connectedCallback(), this.connectSource();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.unsubscribe?.(), this.unsubscribe = void 0, this.closeDialog();
	}
	updated(e) {
		e.has("hass") && this.connectSource();
	}
	connectSource() {
		if (!this.hass || !this.isConnected) return;
		let e = v(this.hass);
		e === this.source && this.unsubscribe || (this.unsubscribe?.(), this.source = e, this.unsubscribe = e.subscribe(({ data: e, error: t }) => {
			this.data = e, this.error = t;
		}));
	}
	get group() {
		return this.data?.groups.find((e) => e.id === this.config?.group);
	}
	get canCorrect() {
		return this.hass?.user?.is_admin === !0;
	}
	closeDialog() {
		this.renderRoot?.querySelector("dialog")?.close(), this.selected = void 0, this.adding = !1, this.manual = /* @__PURE__ */ new Set(), this.trigger?.focus();
	}
	async openDialog(e, t, n) {
		this.trigger = e.currentTarget, this.selected = t ? {
			person: t,
			device: n
		} : void 0, this.adding = !t, this.destination = n && t ? this.data?.people[t]?.devices[n]?.room ?? "away" : this.config?.group ?? "", this.correctionError = "", await this.updateComplete, this.renderRoot.querySelector("dialog")?.showModal();
	}
	async correct(e, t) {
		if (!(!this.hass || !this.selected || this.pending || !this.canCorrect)) {
			this.pending = !0, this.correctionError = "";
			try {
				await a(this.hass, this.selected.person, {
					...e,
					...this.selected.device ? { device: this.selected.device } : {}
				}), this.notice = t, this.closeDialog(), await this.source?.refresh();
			} catch (e) {
				this.correctionError = String(e?.message ?? e);
			} finally {
				this.pending = !1;
			}
		}
	}
	locationRequest(e, t = "definite", n = !1) {
		return {
			...this.data?.groups.find((t) => t.id === e)?.kind === "floor" ? { floor: e } : { room: e },
			certainty: t,
			...n ? { exclude: !0 } : {}
		};
	}
	location(e, t = "definite", n = !1) {
		let r = this.data?.groups.find((t) => t.id === e)?.name ?? e;
		this.correct(this.locationRequest(e, t, n), `${this.selected?.person}: ${n ? "not in" : t === "probable" ? "probably in" : "confirmed in"} ${r}.`);
	}
	renderDetail(e) {
		let t = this.data?.people[e.person];
		if (!t) return n;
		let r = e.device ? t.devices[e.device] : void 0, i = this.pending || !this.canCorrect, a = this.data && this.group ? m(this.data, this.group, 0).find((t) => t.name === e.person)?.probability ?? 0 : 0;
		return c`<h3>${r?.name ?? e.person}</h3>
      ${r ? c`
        <p class="hint">${e.person} · ${this.data?.groups.find((e) => e.id === r.room)?.name ?? r.room ?? "Location unknown"}</p>
        <div class="choices">${[!1, !0].map((e) => c`<button ?disabled=${i} @click=${() => void this.correct({ carried: e }, `${r.name}: ${f(r.kind, e).toLowerCase()}.`)}>${f(r.kind, e)}</button>`)}</div>
      ` : c`<p class="hint">${this.group?.name} · ${Math.round(a * 100)}%</p><div class="choices">
        <button class="primary" ?disabled=${i} @click=${() => this.location(this.config.group)}>Definitely here</button>
        <button ?disabled=${i} @click=${() => this.location(this.config.group, "probable")}>Probably here</button>
        <button ?disabled=${i} @click=${() => this.location(this.config.group, "definite", !0)}>Not here</button>
      </div>
      ${Object.keys(t.devices ?? {}).length ? c`<div class="device-list">${Object.entries(t.devices).map(([t, n]) => c`<button class="device-row" @click=${() => {
			this.selected = {
				person: e.person,
				device: t
			}, this.destination = n.room ?? "away";
		}}><ha-icon .icon=${p(n.kind)}></ha-icon><span>${n.name}</span><span class="hint">${this.data?.groups.find((e) => e.id === n.room)?.name ?? n.room ?? "Unknown"}</span></button>`)}</div>` : n}`}
      <label>${r ? "Device location" : "Somewhere else"}<select .value=${this.destination} ?disabled=${i} @change=${(e) => {
			this.destination = e.target.value;
		}}>
        ${(this.data?.groups ?? []).filter((e) => !r || e.kind !== "floor").map((e) => c`<option value=${e.id} ?selected=${e.id === this.destination}>${e.kind === "floor" ? "Floor: " : ""}${e.name}</option>`)}
        <option value="away" ?selected=${this.destination === "away"}>Away</option>
      </select></label><div class="actions"><button ?disabled=${i} @click=${() => this.location(this.destination)}>Definitely</button>${r ? n : c`<button ?disabled=${i} @click=${() => this.location(this.destination, "probable")}>Probably</button>`}
      <button ?disabled=${i} @click=${() => void this.correct({ clear: !0 }, "Using automatic estimate.")}>Use automatic estimate</button></div>`;
	}
	renderDialog() {
		let e = this.selected, t = this.data && this.group ? m(this.data, this.group, this.config?.min_probability ?? .1) : [], r = [...t.map((e) => e.name), ...[...this.manual].filter((e) => !t.some((t) => t.name === e) && this.data?.people[e])], i = Object.keys(this.data?.people ?? {}).filter((e) => !r.includes(e)), a = (e) => {
			let t = this.data?.people[e]?.person, n = t ? this.hass?.states[t]?.attributes.entity_picture : void 0;
			return typeof n == "string" && !this.failedImages.has(n) ? n : void 0;
		};
		return c`<dialog @close=${() => {
			this.selected = void 0, this.adding = !1;
		}} @cancel=${(e) => {
			this.pending && e.preventDefault();
		}} aria-label=${`People in ${this.group?.name ?? "this room"}`}>
      <header><h2>${this.group?.name ?? "People"}</h2><button ?disabled=${this.pending} aria-label="Close" @click=${() => this.closeDialog()}>×</button></header>
      <div class="split">
        <nav class="people-list" aria-label="People">
          ${r.map((n) => {
			let r = t.find((e) => e.name === n), i = a(n);
			return c`<button class="row" aria-pressed=${String(!this.adding && e?.person === n)} @click=${() => this.choose(n)}>
            <span class="mini">${i ? c`<img src=${i} alt="" />` : n.slice(0, 1)}</span><span class="name">${n}</span><span class="hint">${r ? `${Math.round(r.probability * 100)}%` : "Added"}</span></button>`;
		})}
          ${this.canCorrect && i.length ? c`<button class="row add-row" aria-pressed=${String(this.adding)} @click=${() => {
			this.adding = !0, this.selected = void 0;
		}}><span class="mini">+</span><span class="name">Add person</span></button>` : n}
        </nav>
        <section class="detail">
          ${this.adding ? c`<h3>Who else is here?</h3><div class="choices">${i.map((e) => c`<button @click=${() => {
			this.manual = /* @__PURE__ */ new Set([...this.manual, e]), this.choose(e);
		}}>${e}</button>`)}</div>` : e ? this.renderDetail(e) : c`<p class="hint">Select a person.</p>`}
          ${this.canCorrect ? n : c`<p class="hint">An administrator can correct estimates.</p>`}
          ${this.correctionError ? c`<p class="error" role="alert">${this.correctionError}</p>` : n}
        </section>
      </div>
    </dialog>`;
	}
	choose(e) {
		this.adding = !1, this.selected = { person: e }, this.destination = this.config?.group ?? "", this.correctionError = "";
	}
	render() {
		let e = this.group, t = this.data && e ? m(this.data, e, this.config?.min_probability ?? .1) : [];
		return c`<ha-card>${this.config?.title ? c`<h2>${this.config.title}</h2>` : n}
      ${this.data ? this.data.enabled ? e ? c`<div class="people">${t.map(({ name: t, person: n, probability: r }) => {
			let i = n.person ? this.hass?.states[n.person]?.attributes.entity_picture : void 0;
			return c`<div class="person"><button class="avatar ${r >= .6 ? "" : "possible"}" aria-label=${`${t}, ${Math.round(r * 100)}% in ${e.name}`} title=${`${t} · ${Math.round(r * 100)}%`} @click=${(e) => void this.openDialog(e, t)}>
          ${typeof i == "string" && !this.failedImages.has(i) ? c`<img src=${i} alt="" @error=${() => {
				this.failedImages = /* @__PURE__ */ new Set([...this.failedImages, i]);
			}} />` : t.slice(0, 1)}
        </button><div class="devices">${h(n, e).map(([e, n]) => c`<button class="device" aria-label=${`${t}: ${n.name}`} title=${`${n.name} · ${Math.round((n.confidence ?? 0) * 100)}%`} @click=${(n) => void this.openDialog(n, t, e)}><ha-icon .icon=${p(n.kind)}></ha-icon></button>`)}</div></div>`;
		})}${this.canCorrect && t.length < Object.keys(this.data.people ?? {}).length ? c`<button class="add" aria-label="Add person" @click=${(e) => void this.openDialog(e)}>+</button>` : n}</div>` : c`<span class="error">Select a valid room or floor in the card settings.</span>` : c`<span class="hint">Presence is not enabled.</span>` : c`<span class="hint">Loading presence…</span>`}
      ${this.error ? c`<p class="error" role="alert">Could not refresh presence: ${this.error}</p>` : n}
      ${this.notice ? c`<p class="notice" role="status">${this.notice}</p>` : n}${this.renderDialog()}
    </ha-card>`;
	}
};
o([t({ attribute: !1 })], y.prototype, "hass", void 0), o([s()], y.prototype, "config", void 0), o([s()], y.prototype, "data", void 0), o([s()], y.prototype, "error", void 0), o([s()], y.prototype, "selected", void 0), o([s()], y.prototype, "adding", void 0), o([s()], y.prototype, "destination", void 0), o([s()], y.prototype, "pending", void 0), o([s()], y.prototype, "correctionError", void 0), o([s()], y.prototype, "notice", void 0), o([s()], y.prototype, "failedImages", void 0), o([s()], y.prototype, "manual", void 0), y = o([r("activity-levels-presence-card")], y);
//#endregion
//#region src/al-presence-card-editor.ts
var b = class extends u {
	constructor(...e) {
		super(...e), this.config = {
			type: "custom:activity-levels-presence-card",
			group: ""
		};
	}
	static {
		this.styles = i;
	}
	setConfig(e) {
		this.config = { ...e };
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
		!this.hass || !this.isConnected || this.unsubscribe || (this.unsubscribe = v(this.hass).subscribe(({ data: e, error: t }) => {
			this.data = e, this.error = t;
		}));
	}
	change(e) {
		this.config = {
			...this.config,
			group: e
		}, this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: this.config },
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		return c`<label>Room or floor <select aria-label="Room or floor" .value=${this.config.group} @change=${(e) => this.change(e.target.value)}>
      <option value="">Choose a room or floor…</option>${this.data?.groups.map((e) => c`<option value=${e.id}>${e.kind === "floor" ? "Floor: " : ""}${e.name}</option>`)}
    </select></label>${this.error ? c`<p role="alert">${this.error}</p>` : ""}`;
	}
};
o([t({ attribute: !1 })], b.prototype, "hass", void 0), o([s()], b.prototype, "config", void 0), o([s()], b.prototype, "data", void 0), o([s()], b.prototype, "error", void 0), b = o([r("activity-levels-presence-card-editor")], b);
//#endregion
//#region src/al-floorplan-card.ts
var x = class extends u {
	constructor(...e) {
		super(...e), this.settings = {}, this.snapshot = {};
	}
	static {
		this.styles = e`:host { display:block; min-width:0; } .error {padding:12px;color:var(--error-color,#ff7365);} `;
	}
	setConfig(e) {
		l(e), this.settings = { ...e };
	}
	static getStubConfig() {
		return { type: "custom:activity-levels-floorplan-card" };
	}
	getCardSize() {
		return 8;
	}
	getGridOptions() {
		return {
			columns: "full",
			rows: "auto"
		};
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
		let e = d(this.hass);
		e === this.source && this.unsubscribe || (this.unsubscribe?.(), this.source = e, this.unsubscribe = e.subscribe((e) => {
			this.snapshot = e;
		}));
	}
	render() {
		let { data: e, error: t } = this.snapshot;
		return c`${t ? c`<p class="error" role="alert">${t}</p>` : n}
      ${e ? c`<al-floorplan-viewer .dashboard=${!0} .config=${e.config} .live=${e.live}
        .telemetry=${t ? void 0 : e.telemetry} .hass=${this.hass} .lights=${e.lights} .settings=${this.settings}
        @al-viewer-settings=${(e) => {
			this.settings = e.detail;
		}}></al-floorplan-viewer>` : c`<p role="status">Loading floorplan…</p>`}`;
	}
};
o([t({ attribute: !1 })], x.prototype, "hass", void 0), o([s()], x.prototype, "settings", void 0), o([s()], x.prototype, "snapshot", void 0), x = o([r("activity-levels-floorplan-card")], x);
//#endregion
//#region src/cards.ts
var S = window;
S.customCards ??= [], S.customCards.some((e) => e.type === "activity-levels-presence-card") || S.customCards.push({
	type: "activity-levels-presence-card",
	name: "Activity Levels Presence",
	description: "People and device evidence for a room or floor.",
	preview: !0
}), S.customCards.some((e) => e.type === "activity-levels-floorplan-card") || S.customCards.push({
	type: "activity-levels-floorplan-card",
	name: "Activity Levels Floorplan",
	description: "Live 3D room activity and lights, with an optional ambient display.",
	preview: !0
});
//#endregion
