//#region src/sensor-coverage.ts
var e = 1e-6, t = Math.PI / 180;
function n(e, t, n) {
	return [
		e[0] + t[0] * n,
		e[1] + t[1] * n,
		e[2] + t[2] * n
	];
}
function r(e, t) {
	if (t[2] < e.low || t[2] > e.high) return !1;
	let n = !1, r = e.footprint;
	for (let e = 0, i = r.length - 1; e < r.length; i = e++) {
		let a = r[e], o = r[i];
		a[1] > t[1] != o[1] > t[1] && t[0] < (o[0] - a[0]) * (t[1] - a[1]) / (o[1] - a[1]) + a[0] && (n = !n);
	}
	return n;
}
function i(t, n, r) {
	let i = r[0] - n[0], a = r[1] - n[1], o = Math.hypot(i, a);
	return o < e ? !1 : Math.abs((t[0] - n[0]) * a - (t[1] - n[1]) * i) < e * o && (t[0] - n[0]) * i + (t[1] - n[1]) * a >= -1e-6 && (t[0] - r[0]) * i + (t[1] - r[1]) * a <= e;
}
function a(n, r, i) {
	if (!(n.kind === "open_wall" || (n.entity ? i[n.entity]?.state === "on" : n.open))) return !1;
	let a = r[0] - n.position[0], o = r[1] - n.position[1], s = Math.cos(n.yaw * t), c = Math.sin(n.yaw * t);
	return Math.abs(-a * c + o * s) < e && Math.abs(a * s + o * c) <= n.width / 2 + e && r[2] >= n.position[2] - e && r[2] <= n.position[2] + n.height + e;
}
function o(o, s, c, l, u = {}) {
	if (!(c > 0)) return [...o];
	let d = [0, c];
	for (let t of l) {
		if (Math.abs(s[2]) > e) for (let e of [t.low, t.high]) {
			let t = (e - o[2]) / s[2];
			t >= 0 && t <= c && d.push(t);
		}
		for (let n = 0; n < t.footprint.length; n++) {
			let r = t.footprint[n], i = t.footprint[(n + 1) % t.footprint.length], a = i[0] - r[0], l = i[1] - r[1], u = s[0] * l - s[1] * a;
			if (Math.abs(u) < e) continue;
			let f = r[0] - o[0], p = r[1] - o[1], m = (f * l - p * a) / u, h = (f * s[1] - p * s[0]) / u;
			m >= -1e-6 && m <= c && h >= -1e-6 && h <= 1.000001 && d.push(Math.max(0, m));
		}
	}
	d.sort((e, t) => e - t);
	let f = d.filter((t, n) => n === 0 || t - d[n - 1] > e);
	for (let c = 0; c < f.length - 1; c++) {
		let d = f[c], p = n(o, s, (d + f[c + 1]) / 2), m = n(o, s, c ? (f[c - 1] + d) / 2 : -1e-6), h = l.filter((e) => r(e, p)), g = l.filter((e) => r(e, m) || d === 0 && o[2] >= e.low && o[2] <= e.high && e.footprint.some((t, n) => i(o, t, e.footprint[(n + 1) % e.footprint.length])));
		if (d === 0 && h.length) continue;
		let _ = l.filter((e) => h.includes(e) !== g.includes(e));
		if (!_.length) continue;
		let v = n(o, s, d);
		if (_.some((t) => Math.abs(s[2]) > e && (Math.abs(v[2] - t.low) < e || Math.abs(v[2] - t.high) < e))) return v;
		let y = _.flatMap((e) => e.openings ?? []);
		for (let n of _) for (let r = 0; r < n.footprint.length; r++) {
			let o = n.footprint[r], c = n.footprint[(r + 1) % n.footprint.length];
			if (!i(v, o, c)) continue;
			let l = c[0] - o[0], d = c[1] - o[1], f = Math.hypot(l, d);
			if (!(Math.abs(s[0] * d - s[1] * l) < e * f) && !y.some((n) => Math.abs(Math.cos(n.yaw * t) * d - Math.sin(n.yaw * t) * l) < e * f && a(n, v, u))) return v;
		}
	}
	return n(o, s, c);
}
function s(e, t) {
	return [
		Math.cos(t) * Math.cos(e),
		Math.cos(t) * Math.sin(e),
		Math.sin(t)
	];
}
function c(e, n, a = {}) {
	if (e.range <= 0) return [];
	let c = (r, i, c, l) => ({
		origin: [...e.position],
		center: o(e.position, s(e.yaw * t, r * t), l, n, a),
		rim: Array.from({ length: 32 }, (u, d) => {
			let f = d * Math.PI / 16;
			return o(e.position, s((e.yaw + Math.cos(f) * i / 2) * t, (r + Math.sin(f) * c / 2) * t), l, n, a);
		})
	}), l = {
		origin: [...e.position],
		center: o(e.position, s(e.yaw * t, (e.pitch - e.vertical_fov / 2) * t), e.range, n, a),
		rim: Array.from({ length: 64 }, (r, i) => {
			let c = Math.floor(i / 16), l = i % 16 / 16, u = c === 0 ? -.5 + l : c === 1 ? .5 : c === 2 ? .5 - l : -.5, d = c === 0 ? 0 : c === 1 ? l : c === 2 ? 1 : 1 - l;
			return o(e.position, s((e.yaw + u * e.fov) * t, Math.max(-90, Math.min(90, e.pitch - d * e.vertical_fov)) * t), e.range, n, a);
		})
	}, u = [e.coverage_shape === "fan" ? l : c(e.pitch, e.fov, e.vertical_fov, e.range)];
	if (e.look_down) {
		let a = n.find((t) => r(t, e.position) || e.position[2] >= t.low && e.position[2] <= t.high && t.footprint.some((n, r) => i(e.position, n, t.footprint[(r + 1) % t.footprint.length]))), o = Math.max(0, e.position[2] - (a?.low ?? e.position[2]));
		o > 0 && u.push(c(e.pitch - 70, Math.min(e.fov, 70), 30, Math.min(e.range, o / Math.sin(55 * t))));
	}
	return u;
}
function l(e, n, r = {}) {
	return e.range <= 0 ? [] : [[e.position[0], e.position[1]], ...Array.from({ length: 33 }, (i, a) => {
		let c = (e.yaw - e.fov / 2 + e.fov * a / 32) * t, l = o(e.position, s(c, 0), e.range, n, r);
		return [l[0], l[1]];
	})];
}
//#endregion
export { c as n, l as t };
