import { Ft as e, It as t, Lt as n, Rt as r, T as i, Vt as a, Wt as o, i as s, t as c, w as l, yt as u, zt as d } from "./shared-CW-USVUA.js";
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
var y = class extends r {
	constructor(...e) {
		super(...e), this.adding = !1, this.destination = "", this.pending = !1, this.correctionError = "", this.notice = "", this.failedImages = /* @__PURE__ */ new Set();
	}
	static {
		this.styles = [l, o`
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
    dialog { color: var(--primary-text-color); background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 8px; padding: 20px; width: min(420px, calc(100vw - 32px)); max-height: calc(100dvh - 48px); box-sizing: border-box; }
    dialog::backdrop { background: rgb(0 0 0 / .45); }
    dialog header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    dialog h2 { margin: 0; }
    .choices { display: grid; gap: 8px; }
    .choices button { text-align: left; }
    .primary { background: var(--primary-color); color: var(--text-primary-color, white); }
    label { display: grid; gap: 6px; margin: 14px 0; }
    select { width: 100%; }
    .notice { margin-top: 8px; }
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
		this.renderRoot?.querySelector("dialog")?.close(), this.selected = void 0, this.adding = !1, this.trigger?.focus();
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
				await u(this.hass, this.selected.person, {
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
	renderDialog() {
		let e = this.selected, t = e ? this.data?.people[e.person] : void 0, n = e?.device ? t?.devices[e.device] : void 0, r = new Set(this.data && this.group ? m(this.data, this.group, this.config?.min_probability ?? .1).map((e) => e.name) : []);
		return a`<dialog @close=${() => {
			this.selected = void 0, this.adding = !1;
		}} @cancel=${(e) => {
			this.pending && e.preventDefault();
		}} aria-label=${n?.name ?? e?.person ?? "Add person"}>
      <header><h2>${n?.name ?? e?.person ?? "Who is here?"}</h2><button ?disabled=${this.pending} aria-label="Close" @click=${() => this.closeDialog()}>×</button></header>
      ${this.adding ? a`<div class="choices">${Object.keys(this.data?.people ?? {}).filter((e) => !r.has(e)).map((e) => a`<button @click=${() => {
			this.selected = { person: e }, this.adding = !1;
		}}>${e}</button>`)}</div>` : n ? a`
        <p class="hint">${e?.person} · ${this.data?.groups.find((e) => e.id === n.room)?.name ?? n.room ?? "Location unknown"}</p>
        <div class="choices">${[!1, !0].map((e) => a`<button ?disabled=${this.pending || !this.canCorrect} @click=${() => void this.correct({ carried: e }, `${n.name}: ${f(n.kind, e).toLowerCase()}.`)}>${f(n.kind, e)}</button>`)}</div>
      ` : t ? a`<p class="hint">${this.group?.name} · ${Math.round((this.data && this.group ? m(this.data, this.group, 0).find((t) => t.name === e?.person)?.probability ?? 0 : 0) * 100)}%</p><div class="choices">
        <button class="primary" ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.config.group)}>Definitely here</button>
        <button ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.config.group, "probable")}>Probably here</button>
        <button ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.config.group, "definite", !0)}>Not here</button>
      </div>` : d}
      ${e ? a`<label>${n ? "Device location" : "Somewhere else"}<select .value=${this.destination} ?disabled=${this.pending || !this.canCorrect} @change=${(e) => {
			this.destination = e.target.value;
		}}>
        ${(this.data?.groups ?? []).filter((e) => !n || e.kind !== "floor").map((e) => a`<option value=${e.id}>${e.kind === "floor" ? "Floor: " : ""}${e.name}</option>`)}
        <option value="away">Away</option>
      </select></label><div class="actions"><button ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.destination)}>Definitely</button>${n ? d : a`<button ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.destination, "probable")}>Probably</button>`}
      <button ?disabled=${this.pending || !this.canCorrect} @click=${() => void this.correct({ clear: !0 }, "Using automatic estimate.")}>Use automatic estimate</button></div>` : d}
      ${this.canCorrect ? d : a`<p class="hint">An administrator can correct estimates.</p>`}
      ${this.correctionError ? a`<p class="error" role="alert">${this.correctionError}</p>` : d}
    </dialog>`;
	}
	render() {
		let e = this.group, t = this.data && e ? m(this.data, e, this.config?.min_probability ?? .1) : [];
		return a`<ha-card>${this.config?.title ? a`<h2>${this.config.title}</h2>` : d}
      ${this.data ? this.data.enabled ? e ? a`<div class="people">${t.map(({ name: t, person: n, probability: r }) => {
			let i = n.person ? this.hass?.states[n.person]?.attributes.entity_picture : void 0;
			return a`<div class="person"><button class="avatar ${r >= .6 ? "" : "possible"}" aria-label=${`${t}, ${Math.round(r * 100)}% in ${e.name}`} title=${`${t} · ${Math.round(r * 100)}%`} @click=${(e) => void this.openDialog(e, t)}>
          ${typeof i == "string" && !this.failedImages.has(i) ? a`<img src=${i} alt="" @error=${() => {
				this.failedImages = /* @__PURE__ */ new Set([...this.failedImages, i]);
			}} />` : t.slice(0, 1)}
        </button><div class="devices">${h(n, e).map(([e, n]) => a`<button class="device" aria-label=${`${t}: ${n.name}`} title=${`${n.name} · ${Math.round((n.confidence ?? 0) * 100)}%`} @click=${(n) => void this.openDialog(n, t, e)}><ha-icon .icon=${p(n.kind)}></ha-icon></button>`)}</div></div>`;
		})}${this.canCorrect && t.length < Object.keys(this.data.people ?? {}).length ? a`<button class="add" aria-label="Add person" @click=${(e) => void this.openDialog(e)}>+</button>` : d}</div>` : a`<span class="error">Select a valid room or floor in the card settings.</span>` : a`<span class="hint">Presence is not enabled.</span>` : a`<span class="hint">Loading presence…</span>`}
      ${this.error ? a`<p class="error" role="alert">Could not refresh presence: ${this.error}</p>` : d}
      ${this.notice ? a`<p class="notice" role="status">${this.notice}</p>` : d}${this.renderDialog()}
    </ha-card>`;
	}
};
i([t({ attribute: !1 })], y.prototype, "hass", void 0), i([e()], y.prototype, "config", void 0), i([e()], y.prototype, "data", void 0), i([e()], y.prototype, "error", void 0), i([e()], y.prototype, "selected", void 0), i([e()], y.prototype, "adding", void 0), i([e()], y.prototype, "destination", void 0), i([e()], y.prototype, "pending", void 0), i([e()], y.prototype, "correctionError", void 0), i([e()], y.prototype, "notice", void 0), i([e()], y.prototype, "failedImages", void 0), y = i([n("activity-levels-presence-card")], y);
//#endregion
//#region src/al-presence-card-editor.ts
var b = class extends r {
	constructor(...e) {
		super(...e), this.config = {
			type: "custom:activity-levels-presence-card",
			group: ""
		};
	}
	static {
		this.styles = l;
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
		return a`<label>Room or floor <select aria-label="Room or floor" .value=${this.config.group} @change=${(e) => this.change(e.target.value)}>
      <option value="">Choose a room or floor…</option>${this.data?.groups.map((e) => a`<option value=${e.id}>${e.kind === "floor" ? "Floor: " : ""}${e.name}</option>`)}
    </select></label>${this.error ? a`<p role="alert">${this.error}</p>` : ""}`;
	}
};
i([t({ attribute: !1 })], b.prototype, "hass", void 0), i([e()], b.prototype, "config", void 0), i([e()], b.prototype, "data", void 0), i([e()], b.prototype, "error", void 0), b = i([n("activity-levels-presence-card-editor")], b);
//#endregion
//#region src/al-floorplan-card.ts
var x = class extends r {
	constructor(...e) {
		super(...e), this.settings = {}, this.snapshot = {};
	}
	static {
		this.styles = o`:host { display:block; min-width:0; } .error {padding:12px;color:var(--error-color,#ff7365);} `;
	}
	setConfig(e) {
		s(e), this.settings = { ...e };
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
		let e = c(this.hass);
		e === this.source && this.unsubscribe || (this.unsubscribe?.(), this.source = e, this.unsubscribe = e.subscribe((e) => {
			this.snapshot = e;
		}));
	}
	render() {
		let { data: e, error: t } = this.snapshot;
		return a`${t ? a`<p class="error" role="alert">${t}</p>` : d}
      ${e ? a`<al-floorplan-viewer .dashboard=${!0} .config=${e.config} .live=${e.live}
        .telemetry=${t ? void 0 : e.telemetry} .hass=${this.hass} .lights=${e.lights} .settings=${this.settings}
        @al-viewer-settings=${(e) => {
			this.settings = e.detail;
		}}></al-floorplan-viewer>` : a`<p role="status">Loading floorplan…</p>`}`;
	}
};
i([t({ attribute: !1 })], x.prototype, "hass", void 0), i([e()], x.prototype, "settings", void 0), i([e()], x.prototype, "snapshot", void 0), x = i([n("activity-levels-floorplan-card")], x);
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
