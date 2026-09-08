import { C as e, E as t, O as n, S as r, b as i, i as a, n as o, t as s, w as c, x as l } from "./shared-CgCEG6Jq.js";
//#region src/presence-card-model.ts
var u = (e, t) => e === "watch" ? t ? "Wearing" : "Not wearing" : t ? "Carrying" : "Not carrying", d = (e) => ({
	watch: "mdi:watch",
	phone: "mdi:cellphone",
	laptop: "mdi:laptop",
	tag: "mdi:tag"
})[e] ?? "mdi:devices";
function f(e, t, n) {
	return Object.entries(e.people ?? {}).map(([e, n]) => {
		let r = n.probabilities ?? n.candidates ?? {};
		return {
			name: e,
			person: n,
			probability: Math.min(1, t.rooms.reduce((e, t) => e + (r[t] ?? 0), 0))
		};
	}).filter(({ probability: e }) => e > 0 && e >= n);
}
function p(e, t) {
	return Object.entries(e.devices ?? {}).filter(([, e]) => {
		let n = e.carrying_correction;
		return !(n?.value === !1 && n.strength > 0) && e.room !== null && t.rooms.includes(e.room) && (e.confidence ?? 0) > 0;
	});
}
//#endregion
//#region src/presence-card-store.ts
var m = /* @__PURE__ */ new WeakMap(), h = class {
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
function g(e) {
	let t = e.connection ?? e.callWS, n = m.get(t);
	return n || (n = new h(e), m.set(t, n)), n.hass = e, n;
}
//#endregion
//#region src/al-presence-card.ts
var _ = class extends e {
	constructor(...e) {
		super(...e), this.adding = !1, this.destination = "", this.pending = !1, this.correctionError = "", this.notice = "", this.failedImages = /* @__PURE__ */ new Set();
	}
	static {
		this.styles = [s, n`
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
		let e = g(this.hass);
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
	renderDialog() {
		let e = this.selected, n = e ? this.data?.people[e.person] : void 0, r = e?.device ? n?.devices[e.device] : void 0, i = new Set(this.data && this.group ? f(this.data, this.group, this.config?.min_probability ?? .1).map((e) => e.name) : []);
		return t`<dialog @close=${() => {
			this.selected = void 0, this.adding = !1;
		}} @cancel=${(e) => {
			this.pending && e.preventDefault();
		}} aria-label=${r?.name ?? e?.person ?? "Add person"}>
      <header><h2>${r?.name ?? e?.person ?? "Who is here?"}</h2><button ?disabled=${this.pending} aria-label="Close" @click=${() => this.closeDialog()}>×</button></header>
      ${this.adding ? t`<div class="choices">${Object.keys(this.data?.people ?? {}).filter((e) => !i.has(e)).map((e) => t`<button @click=${() => {
			this.selected = { person: e }, this.adding = !1;
		}}>${e}</button>`)}</div>` : r ? t`
        <p class="hint">${e?.person} · ${this.data?.groups.find((e) => e.id === r.room)?.name ?? r.room ?? "Location unknown"}</p>
        <div class="choices">${[!1, !0].map((e) => t`<button ?disabled=${this.pending || !this.canCorrect} @click=${() => void this.correct({ carried: e }, `${r.name}: ${u(r.kind, e).toLowerCase()}.`)}>${u(r.kind, e)}</button>`)}</div>
      ` : n ? t`<p class="hint">${this.group?.name} · ${Math.round((this.data && this.group ? f(this.data, this.group, 0).find((t) => t.name === e?.person)?.probability ?? 0 : 0) * 100)}%</p><div class="choices">
        <button class="primary" ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.config.group)}>Definitely here</button>
        <button ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.config.group, "probable")}>Probably here</button>
        <button ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.config.group, "definite", !0)}>Not here</button>
      </div>` : c}
      ${e ? t`<label>${r ? "Device location" : "Somewhere else"}<select .value=${this.destination} ?disabled=${this.pending || !this.canCorrect} @change=${(e) => {
			this.destination = e.target.value;
		}}>
        ${(this.data?.groups ?? []).filter((e) => !r || e.kind !== "floor").map((e) => t`<option value=${e.id}>${e.kind === "floor" ? "Floor: " : ""}${e.name}</option>`)}
        <option value="away">Away</option>
      </select></label><div class="actions"><button ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.destination)}>Definitely</button>${r ? c : t`<button ?disabled=${this.pending || !this.canCorrect} @click=${() => this.location(this.destination, "probable")}>Probably</button>`}
      <button ?disabled=${this.pending || !this.canCorrect} @click=${() => void this.correct({ clear: !0 }, "Using automatic estimate.")}>Use automatic estimate</button></div>` : c}
      ${this.canCorrect ? c : t`<p class="hint">An administrator can correct estimates.</p>`}
      ${this.correctionError ? t`<p class="error" role="alert">${this.correctionError}</p>` : c}
    </dialog>`;
	}
	render() {
		let e = this.group, n = this.data && e ? f(this.data, e, this.config?.min_probability ?? .1) : [];
		return t`<ha-card>${this.config?.title ? t`<h2>${this.config.title}</h2>` : c}
      ${this.data ? this.data.enabled ? e ? t`<div class="people">${n.map(({ name: n, person: r, probability: i }) => {
			let a = r.person ? this.hass?.states[r.person]?.attributes.entity_picture : void 0;
			return t`<div class="person"><button class="avatar ${i >= .6 ? "" : "possible"}" aria-label=${`${n}, ${Math.round(i * 100)}% in ${e.name}`} title=${`${n} · ${Math.round(i * 100)}%`} @click=${(e) => void this.openDialog(e, n)}>
          ${typeof a == "string" && !this.failedImages.has(a) ? t`<img src=${a} alt="" @error=${() => {
				this.failedImages = /* @__PURE__ */ new Set([...this.failedImages, a]);
			}} />` : n.slice(0, 1)}
        </button><div class="devices">${p(r, e).map(([e, r]) => t`<button class="device" aria-label=${`${n}: ${r.name}`} title=${`${r.name} · ${Math.round((r.confidence ?? 0) * 100)}%`} @click=${(t) => void this.openDialog(t, n, e)}><ha-icon .icon=${d(r.kind)}></ha-icon></button>`)}</div></div>`;
		})}${this.canCorrect && n.length < Object.keys(this.data.people ?? {}).length ? t`<button class="add" aria-label="Add person" @click=${(e) => void this.openDialog(e)}>+</button>` : c}</div>` : t`<span class="error">Select a valid room or floor in the card settings.</span>` : t`<span class="hint">Presence is not enabled.</span>` : t`<span class="hint">Loading presence…</span>`}
      ${this.error ? t`<p class="error" role="alert">Could not refresh presence: ${this.error}</p>` : c}
      ${this.notice ? t`<p class="notice" role="status">${this.notice}</p>` : c}${this.renderDialog()}
    </ha-card>`;
	}
};
o([l({ attribute: !1 })], _.prototype, "hass", void 0), o([i()], _.prototype, "config", void 0), o([i()], _.prototype, "data", void 0), o([i()], _.prototype, "error", void 0), o([i()], _.prototype, "selected", void 0), o([i()], _.prototype, "adding", void 0), o([i()], _.prototype, "destination", void 0), o([i()], _.prototype, "pending", void 0), o([i()], _.prototype, "correctionError", void 0), o([i()], _.prototype, "notice", void 0), o([i()], _.prototype, "failedImages", void 0), _ = o([r("activity-levels-presence-card")], _);
//#endregion
//#region src/al-presence-card-editor.ts
var v = class extends e {
	constructor(...e) {
		super(...e), this.config = {
			type: "custom:activity-levels-presence-card",
			group: ""
		};
	}
	static {
		this.styles = s;
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
		!this.hass || !this.isConnected || this.unsubscribe || (this.unsubscribe = g(this.hass).subscribe(({ data: e, error: t }) => {
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
		return t`<label>Room or floor <select aria-label="Room or floor" .value=${this.config.group} @change=${(e) => this.change(e.target.value)}>
      <option value="">Choose a room or floor…</option>${this.data?.groups.map((e) => t`<option value=${e.id}>${e.kind === "floor" ? "Floor: " : ""}${e.name}</option>`)}
    </select></label>${this.error ? t`<p role="alert">${this.error}</p>` : ""}`;
	}
};
o([l({ attribute: !1 })], v.prototype, "hass", void 0), o([i()], v.prototype, "config", void 0), o([i()], v.prototype, "data", void 0), o([i()], v.prototype, "error", void 0), v = o([r("activity-levels-presence-card-editor")], v);
//#endregion
//#region src/cards.ts
var y = window;
y.customCards ??= [], y.customCards.some((e) => e.type === "activity-levels-presence-card") || y.customCards.push({
	type: "activity-levels-presence-card",
	name: "Activity Levels Presence",
	description: "People and device evidence for a room or floor.",
	preview: !0
});
//#endregion
