import { a as e, i as t, n, o as r, r as i, s as a } from "./shared-hIAhJTA6.js";
import { A as o, Cn as s, E as c, F as l, G as u, Gt as d, H as f, I as p, K as m, L as h, P as g, S as _, Sn as v, T as y, U as b, Wt as x, an as S, cn as C, d as w, f as T, i as E, in as D, it as O, l as k, ln as A, nn as j, nt as M, o as N, q as P, r as F, rt as I, sn as ee, tt as te, v as L } from "./shared-BJOz3KaN.js";
import { t as R } from "./shared-CzT2Wtqz.js";
//#region node_modules/.pnpm/three@0.185.1/node_modules/three/examples/jsm/controls/OrbitControls.js
var z = { type: "change" }, B = { type: "start" }, V = { type: "end" }, H = new x(), U = new M(), W = Math.cos(70 * b.DEG2RAD), G = new s(), K = 2 * Math.PI, q = {
	NONE: -1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
}, J = 1e-6, Y = class extends T {
	constructor(e, t = null) {
		super(e, t), this.state = q.NONE, this.target = new s(), this.cursor = new s(), this.minDistance = 0, this.maxDistance = Infinity, this.minZoom = 0, this.maxZoom = Infinity, this.minTargetRadius = 0, this.maxTargetRadius = Infinity, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -Infinity, this.maxAzimuthAngle = Infinity, this.enableDamping = !1, this.dampingFactor = .05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
			LEFT: "ArrowLeft",
			UP: "ArrowUp",
			RIGHT: "ArrowRight",
			BOTTOM: "ArrowDown"
		}, this.mouseButtons = {
			LEFT: f.ROTATE,
			MIDDLE: f.DOLLY,
			RIGHT: f.PAN
		}, this.touches = {
			ONE: A.ROTATE,
			TWO: A.DOLLY_PAN
		}, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._cursorStyle = "auto", this._domElementKeyEvents = null, this._lastPosition = new s(), this._lastQuaternion = new O(), this._lastTargetPosition = new s(), this._quat = new O().setFromUnitVectors(e.up, new s(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new C(), this._sphericalDelta = new C(), this._scale = 1, this._panOffset = new s(), this._rotateStart = new v(), this._rotateEnd = new v(), this._rotateDelta = new v(), this._panStart = new v(), this._panEnd = new v(), this._panDelta = new v(), this._dollyStart = new v(), this._dollyEnd = new v(), this._dollyDelta = new v(), this._dollyDirection = new s(), this._mouse = new v(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Z.bind(this), this._onPointerDown = X.bind(this), this._onPointerUp = ne.bind(this), this._onContextMenu = ce.bind(this), this._onMouseWheel = ae.bind(this), this._onKeyDown = oe.bind(this), this._onTouchStart = se.bind(this), this._onTouchMove = Q.bind(this), this._onMouseDown = re.bind(this), this._onMouseMove = ie.bind(this), this._interceptControlDown = le.bind(this), this._interceptControlUp = ue.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
	}
	set cursorStyle(e) {
		this._cursorStyle = e, e === "grab" ? this.domElement.style.cursor = "grab" : this.domElement.style.cursor = "auto";
	}
	get cursorStyle() {
		return this._cursorStyle;
	}
	connect(e) {
		super.connect(e), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, {
			passive: !0,
			capture: !0
		}), this.domElement.style.touchAction = "none";
	}
	disconnect() {
		this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, { capture: !0 }), this.domElement.style.touchAction = "";
	}
	dispose() {
		this.disconnect();
	}
	getPolarAngle() {
		return this._spherical.phi;
	}
	getAzimuthalAngle() {
		return this._spherical.theta;
	}
	getDistance() {
		return this.object.position.distanceTo(this.target);
	}
	listenToKeyEvents(e) {
		e.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = e;
	}
	stopListenToKeyEvents() {
		this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null);
	}
	saveState() {
		this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom;
	}
	reset() {
		this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(z), this.update(), this.state = q.NONE;
	}
	pan(e, t) {
		this._pan(e, t), this.update();
	}
	dollyIn(e) {
		this._dollyIn(e), this.update();
	}
	dollyOut(e) {
		this._dollyOut(e), this.update();
	}
	rotateLeft(e) {
		this._rotateLeft(e), this.update();
	}
	rotateUp(e) {
		this._rotateUp(e), this.update();
	}
	update(e = null) {
		let t = this.object.position;
		G.copy(t).sub(this.target), G.applyQuaternion(this._quat), this._spherical.setFromVector3(G), this.autoRotate && this.state === q.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
		let n = this.minAzimuthAngle, r = this.maxAzimuthAngle;
		isFinite(n) && isFinite(r) && (n < -Math.PI ? n += K : n > Math.PI && (n -= K), r < -Math.PI ? r += K : r > Math.PI && (r -= K), n <= r ? this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + r) / 2 ? Math.max(n, this._spherical.theta) : Math.min(r, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
		let i = !1;
		if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
		else {
			let e = this._spherical.radius;
			this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), i = e != this._spherical.radius;
		}
		if (G.setFromSpherical(this._spherical), G.applyQuaternion(this._quatInverse), t.copy(this.target).add(G), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
			let e = null;
			if (this.object.isPerspectiveCamera) {
				let t = G.length();
				e = this._clampDistance(t * this._scale);
				let n = t - e;
				this.object.position.addScaledVector(this._dollyDirection, n), this.object.updateMatrixWorld(), i = !!n;
			} else if (this.object.isOrthographicCamera) {
				let t = new s(this._mouse.x, this._mouse.y, 0);
				t.unproject(this.object);
				let n = this.object.zoom;
				this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), i = n !== this.object.zoom;
				let r = new s(this._mouse.x, this._mouse.y, 0);
				r.unproject(this.object), this.object.position.sub(r).add(t), this.object.updateMatrixWorld(), e = G.length();
			} else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
			e !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position) : (H.origin.copy(this.object.position), H.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(H.direction)) < W ? this.object.lookAt(this.target) : (U.setFromNormalAndCoplanarPoint(this.object.up, this.target), H.intersectPlane(U, this.target))));
		} else if (this.object.isOrthographicCamera) {
			let e = this.object.zoom;
			this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), e !== this.object.zoom && (this.object.updateProjectionMatrix(), i = !0);
		}
		return this._scale = 1, this._performCursorZoom = !1, i || this._lastPosition.distanceToSquared(this.object.position) > J || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > J || this._lastTargetPosition.distanceToSquared(this.target) > J ? (this.dispatchEvent(z), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
	}
	_getAutoRotationAngle(e) {
		return e === null ? K / 60 / 60 * this.autoRotateSpeed : K / 60 * this.autoRotateSpeed * e;
	}
	_getZoomScale(e) {
		let t = Math.abs(e * .01);
		return .95 ** (this.zoomSpeed * t);
	}
	_rotateLeft(e) {
		this._sphericalDelta.theta -= e;
	}
	_rotateUp(e) {
		this._sphericalDelta.phi -= e;
	}
	_panLeft(e, t) {
		G.setFromMatrixColumn(t, 0), G.multiplyScalar(-e), this._panOffset.add(G);
	}
	_panUp(e, t) {
		this.screenSpacePanning === !0 ? G.setFromMatrixColumn(t, 1) : (G.setFromMatrixColumn(t, 0), G.crossVectors(this.object.up, G)), G.multiplyScalar(e), this._panOffset.add(G);
	}
	_pan(e, t) {
		let n = this.domElement;
		if (this.object.isPerspectiveCamera) {
			let r = this.object.position;
			G.copy(r).sub(this.target);
			let i = G.length();
			i *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * e * i / n.clientHeight, this.object.matrix), this._panUp(2 * t * i / n.clientHeight, this.object.matrix);
		} else this.object.isOrthographicCamera ? (this._panLeft(e * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(t * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
	}
	_dollyOut(e) {
		this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
	}
	_dollyIn(e) {
		this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
	}
	_updateZoomParameters(e, t) {
		if (!this.zoomToCursor) return;
		this._performCursorZoom = !0;
		let n = this.domElement.getBoundingClientRect(), r = e - n.left, i = t - n.top, a = n.width, o = n.height;
		this._mouse.x = r / a * 2 - 1, this._mouse.y = -(i / o) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
	}
	_clampDistance(e) {
		return Math.max(this.minDistance, Math.min(this.maxDistance, e));
	}
	_handleMouseDownRotate(e) {
		this._rotateStart.set(e.clientX, e.clientY);
	}
	_handleMouseDownDolly(e) {
		this._updateZoomParameters(e.clientX, e.clientX), this._dollyStart.set(e.clientX, e.clientY);
	}
	_handleMouseDownPan(e) {
		this._panStart.set(e.clientX, e.clientY);
	}
	_handleMouseMoveRotate(e) {
		this._rotateEnd.set(e.clientX, e.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
		let t = this.domElement;
		this._rotateLeft(K * this._rotateDelta.x / t.clientHeight), this._rotateUp(K * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
	}
	_handleMouseMoveDolly(e) {
		this._dollyEnd.set(e.clientX, e.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
	}
	_handleMouseMovePan(e) {
		this._panEnd.set(e.clientX, e.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
	}
	_handleMouseWheel(e) {
		this._updateZoomParameters(e.clientX, e.clientY), e.deltaY < 0 ? this._dollyIn(this._getZoomScale(e.deltaY)) : e.deltaY > 0 && this._dollyOut(this._getZoomScale(e.deltaY)), this.update();
	}
	_handleKeyDown(e) {
		let t = !1;
		switch (e.code) {
			case this.keys.UP:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(K * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
				break;
			case this.keys.BOTTOM:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-K * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
				break;
			case this.keys.LEFT:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(K * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
				break;
			case this.keys.RIGHT: e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-K * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
		}
		t && (e.preventDefault(), this.update());
	}
	_handleTouchStartRotate(e) {
		if (this._pointers.length === 1) this._rotateStart.set(e.pageX, e.pageY);
		else {
			let t = this._getSecondPointerPosition(e), n = .5 * (e.pageX + t.x), r = .5 * (e.pageY + t.y);
			this._rotateStart.set(n, r);
		}
	}
	_handleTouchStartPan(e) {
		if (this._pointers.length === 1) this._panStart.set(e.pageX, e.pageY);
		else {
			let t = this._getSecondPointerPosition(e), n = .5 * (e.pageX + t.x), r = .5 * (e.pageY + t.y);
			this._panStart.set(n, r);
		}
	}
	_handleTouchStartDolly(e) {
		let t = this._getSecondPointerPosition(e), n = e.pageX - t.x, r = e.pageY - t.y, i = Math.sqrt(n * n + r * r);
		this._dollyStart.set(0, i);
	}
	_handleTouchStartDollyPan(e) {
		this.enableZoom && this._handleTouchStartDolly(e), this.enablePan && this._handleTouchStartPan(e);
	}
	_handleTouchStartDollyRotate(e) {
		this.enableZoom && this._handleTouchStartDolly(e), this.enableRotate && this._handleTouchStartRotate(e);
	}
	_handleTouchMoveRotate(e) {
		if (this._pointers.length == 1) this._rotateEnd.set(e.pageX, e.pageY);
		else {
			let t = this._getSecondPointerPosition(e), n = .5 * (e.pageX + t.x), r = .5 * (e.pageY + t.y);
			this._rotateEnd.set(n, r);
		}
		this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
		let t = this.domElement;
		this._rotateLeft(K * this._rotateDelta.x / t.clientHeight), this._rotateUp(K * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
	}
	_handleTouchMovePan(e) {
		if (this._pointers.length === 1) this._panEnd.set(e.pageX, e.pageY);
		else {
			let t = this._getSecondPointerPosition(e), n = .5 * (e.pageX + t.x), r = .5 * (e.pageY + t.y);
			this._panEnd.set(n, r);
		}
		this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
	}
	_handleTouchMoveDolly(e) {
		let t = this._getSecondPointerPosition(e), n = e.pageX - t.x, r = e.pageY - t.y, i = Math.sqrt(n * n + r * r);
		this._dollyEnd.set(0, i), this._dollyDelta.set(0, (this._dollyEnd.y / this._dollyStart.y) ** +this.zoomSpeed), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
		let a = (e.pageX + t.x) * .5, o = (e.pageY + t.y) * .5;
		this._updateZoomParameters(a, o);
	}
	_handleTouchMoveDollyPan(e) {
		this.enableZoom && this._handleTouchMoveDolly(e), this.enablePan && this._handleTouchMovePan(e);
	}
	_handleTouchMoveDollyRotate(e) {
		this.enableZoom && this._handleTouchMoveDolly(e), this.enableRotate && this._handleTouchMoveRotate(e);
	}
	_addPointer(e) {
		this._pointers.push(e.pointerId);
	}
	_removePointer(e) {
		delete this._pointerPositions[e.pointerId];
		for (let t = 0; t < this._pointers.length; t++) if (this._pointers[t] == e.pointerId) {
			this._pointers.splice(t, 1);
			return;
		}
	}
	_isTrackingPointer(e) {
		for (let t = 0; t < this._pointers.length; t++) if (this._pointers[t] == e.pointerId) return !0;
		return !1;
	}
	_trackPointer(e) {
		let t = this._pointerPositions[e.pointerId];
		t === void 0 && (t = new v(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
	}
	_getSecondPointerPosition(e) {
		let t = e.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
		return this._pointerPositions[t];
	}
	_customWheelEvent(e) {
		let t = e.deltaMode, n = {
			clientX: e.clientX,
			clientY: e.clientY,
			deltaY: e.deltaY
		};
		switch (t) {
			case 1:
				n.deltaY *= 16;
				break;
			case 2: n.deltaY *= 100;
		}
		return e.ctrlKey && !this._controlActive && (n.deltaY *= 10), n;
	}
};
function X(e) {
	this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.ownerDocument.addEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e), this._cursorStyle === "grab" && (this.domElement.style.cursor = "grabbing")));
}
function Z(e) {
	this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function ne(e) {
	switch (this._removePointer(e), this._pointers.length) {
		case 0:
			this.domElement.releasePointerCapture(e.pointerId), this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(V), this.state = q.NONE, this._cursorStyle === "grab" && (this.domElement.style.cursor = "grab");
			break;
		case 1:
			let t = this._pointers[0], n = this._pointerPositions[t];
			this._onTouchStart({
				pointerId: t,
				pageX: n.x,
				pageY: n.y
			});
	}
}
function re(e) {
	let t;
	switch (e.button) {
		case 0:
			t = this.mouseButtons.LEFT;
			break;
		case 1:
			t = this.mouseButtons.MIDDLE;
			break;
		case 2:
			t = this.mouseButtons.RIGHT;
			break;
		default: t = -1;
	}
	switch (t) {
		case f.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseDownDolly(e), this.state = q.DOLLY;
			break;
		case f.ROTATE:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = q.PAN;
			} else {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = q.ROTATE;
			}
			break;
		case f.PAN:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = q.ROTATE;
			} else {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = q.PAN;
			}
			break;
		default: this.state = q.NONE;
	}
	this.state !== q.NONE && this.dispatchEvent(B);
}
function ie(e) {
	switch (this.state) {
		case q.ROTATE:
			if (this.enableRotate === !1) return;
			this._handleMouseMoveRotate(e);
			break;
		case q.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseMoveDolly(e);
			break;
		case q.PAN:
			if (this.enablePan === !1) return;
			this._handleMouseMovePan(e);
	}
}
function ae(e) {
	this.enabled !== !1 && this.enableZoom !== !1 && this.state === q.NONE && (e.preventDefault(), this.dispatchEvent(B), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(V));
}
function oe(e) {
	this.enabled !== !1 && this._handleKeyDown(e);
}
function se(e) {
	switch (this._trackPointer(e), this._pointers.length) {
		case 1:
			switch (this.touches.ONE) {
				case A.ROTATE:
					if (this.enableRotate === !1) return;
					this._handleTouchStartRotate(e), this.state = q.TOUCH_ROTATE;
					break;
				case A.PAN:
					if (this.enablePan === !1) return;
					this._handleTouchStartPan(e), this.state = q.TOUCH_PAN;
					break;
				default: this.state = q.NONE;
			}
			break;
		case 2:
			switch (this.touches.TWO) {
				case A.DOLLY_PAN:
					if (this.enableZoom === !1 && this.enablePan === !1) return;
					this._handleTouchStartDollyPan(e), this.state = q.TOUCH_DOLLY_PAN;
					break;
				case A.DOLLY_ROTATE:
					if (this.enableZoom === !1 && this.enableRotate === !1) return;
					this._handleTouchStartDollyRotate(e), this.state = q.TOUCH_DOLLY_ROTATE;
					break;
				default: this.state = q.NONE;
			}
			break;
		default: this.state = q.NONE;
	}
	this.state !== q.NONE && this.dispatchEvent(B);
}
function Q(e) {
	switch (this._trackPointer(e), this.state) {
		case q.TOUCH_ROTATE:
			if (this.enableRotate === !1) return;
			this._handleTouchMoveRotate(e), this.update();
			break;
		case q.TOUCH_PAN:
			if (this.enablePan === !1) return;
			this._handleTouchMovePan(e), this.update();
			break;
		case q.TOUCH_DOLLY_PAN:
			if (this.enableZoom === !1 && this.enablePan === !1) return;
			this._handleTouchMoveDollyPan(e), this.update();
			break;
		case q.TOUCH_DOLLY_ROTATE:
			if (this.enableZoom === !1 && this.enableRotate === !1) return;
			this._handleTouchMoveDollyRotate(e), this.update();
			break;
		default: this.state = q.NONE;
	}
}
function ce(e) {
	this.enabled !== !1 && e.preventDefault();
}
function le(e) {
	e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
function ue(e) {
	e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
//#endregion
//#region src/floorplan-renderer.ts
function de(e, t) {
	let n = new D(e.footprint.map(([e, n]) => new v(e - t.x, n + t.z))), r = new y(n, {
		depth: e.high - e.low,
		bevelEnabled: !1,
		steps: 1
	});
	return r.rotateX(-Math.PI / 2), r.translate(0, e.low - t.y, 0), r;
}
function $(e, t) {
	let n = new S(new D(e.footprint.map(([e, n]) => new v(e - t.x, n + t.z))));
	return n.rotateX(-Math.PI / 2), n;
}
function fe() {
	let e = /* @__PURE__ */ new Uint8Array(4096);
	for (let t = 0; t < 32; t++) for (let n = 0; n < 32; n++) {
		let r = Math.hypot((n + .5) / 32 * 2 - 1, (t + .5) / 32 * 2 - 1), i = (t * 32 + n) * 4;
		e.set([
			255,
			255,
			255,
			Math.round(255 * Math.max(0, 1 - r) ** 2)
		], i);
	}
	let t = new L(e, 32, 32);
	return t.magFilter = t.minFilter = h, t.needsUpdate = !0, t;
}
var pe = class {
	constructor(e, n, r, i, a) {
		this.host = e, this.select = n, this.fail = r, this.hover = i, this.place = a, this.scene = new j(), this.camera = new te(38, 1, .01, 1e3), this.raycaster = new d(), this.volumes = [], this.boundsKey = "", this.origin = new s(), this.markers = [], this.siteMeshes = [], this.radius = 1, this.options = t(), this.lastTick = 0, this.pauseUntil = 0, this.focusUntil = 0, this.focusDistance = 0, this.focusEvents = /* @__PURE__ */ new Map(), this.alertKey = "", this.lastSelected = "", this.lastFocus = 0, this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)"), this.disposed = !1, this.lost = !1, this.pointer = null, this.resize = () => {
			if (this.disposed) return;
			let e = Math.max(1, this.host.clientWidth), t = Math.max(1, this.host.clientHeight);
			this.camera.aspect = e / t, this.camera.updateProjectionMatrix(), this.renderer.setSize(e, t, !1), this.draw();
		}, this.draw = () => {
			!this.disposed && !this.lost && document.visibilityState === "visible" && this.renderer.render(this.scene, this.camera);
		}, this.pauseMotion = () => {
			this.pauseUntil = Date.now() + 3e4, this.focusTarget = void 0;
		}, this.scheduleMotion = () => {
			clearTimeout(this.animation), this.animation = void 0, !(this.disposed || this.lost || this.reduced?.matches || document.visibilityState !== "visible" || !this.options.auto_rotate && !this.focusTarget && !this.colorChanging()) && (this.lastTick = performance.now(), this.animation = setTimeout(this.animate, 1e3 / 30));
		}, this.animate = () => {
			if (this.disposed || this.lost || document.visibilityState !== "visible" || this.reduced?.matches) return;
			let e = performance.now(), t = Math.min((e - this.lastTick) / 1e3, .1);
			this.lastTick = e;
			for (let e of this.volumes) this.updateColor(e, 1 - Math.exp(-t * 8));
			if (this.draw(), Date.now() >= this.pauseUntil) {
				if (this.focusTarget) {
					let e = Date.now() > this.focusUntil, n = e ? new s() : this.focusTarget, r = this.camera.position.clone().sub(this.controls.target), i = e ? this.fitDistance() : this.focusDistance;
					r.setLength(r.length() + (i - r.length()) * Math.min(1, t * 2)), this.controls.target.lerp(n, Math.min(1, t * 2)), this.camera.position.copy(this.controls.target).add(r), e && this.controls.target.length() < .01 && Math.abs(r.length() - i) < .01 && (this.focusTarget = void 0);
				}
				this.options.auto_rotate && this.controls.rotateLeft(t * 2 * Math.PI / this.options.rotation_period), this.controls.update(), this.draw();
			}
			(this.options.auto_rotate || this.focusTarget || this.colorChanging()) && (this.animation = setTimeout(this.animate, 1e3 / 30));
		}, this.onPointerDown = (e) => {
			if (!e.isPrimary || e.button !== 0) {
				this.pointer = null;
				return;
			}
			this.pointer = {
				id: e.pointerId,
				x: e.clientX,
				y: e.clientY,
				moved: !1
			};
		}, this.onPointerLeave = () => {
			this.hover?.("");
		}, this.onPointerMove = (e) => {
			if (!this.pointer && this.hover) {
				let t = this.renderer.domElement.getBoundingClientRect();
				if (t.width && t.height) {
					this.raycaster.setFromCamera(new v((e.clientX - t.left) / t.width * 2 - 1, -(e.clientY - t.top) / t.height * 2 + 1), this.camera);
					let n = this.raycaster.intersectObjects(this.volumes.filter((e) => !e.part.container).map((e) => e.mesh))[0];
					this.hover(this.volumes.find((e) => e.mesh === n?.object)?.part.id ?? "");
				}
			}
			this.pointer && Math.hypot(e.clientX - this.pointer.x, e.clientY - this.pointer.y) > 5 && (this.pointer.moved = !0);
		}, this.onPointerCancel = () => {
			this.pointer = null;
		}, this.onPointerUp = (e) => {
			let t = this.pointer;
			if (this.pointer = null, !t || t.id !== e.pointerId || t.moved) return;
			let n = this.renderer.domElement.getBoundingClientRect();
			if (!n.width || !n.height) return;
			if (this.raycaster.setFromCamera(new v((e.clientX - n.left) / n.width * 2 - 1, -(e.clientY - n.top) / n.height * 2 + 1), this.camera), this.placementHeight !== void 0 && this.place) {
				let e = this.raycaster.ray.intersectPlane(new M(new s(0, 1, 0), this.origin.y - this.placementHeight), new s());
				e && this.place([
					e.x + this.origin.x,
					-e.z - this.origin.z,
					this.placementHeight
				]);
				return;
			}
			let r = this.volumes.filter(({ part: e }) => !e.container), i = this.raycaster.intersectObjects(r.map(({ mesh: e }) => e))[0] ?? this.raycaster.intersectObjects(this.volumes.map(({ mesh: e }) => e))[0], a = this.volumes.find(({ mesh: e }) => e === i?.object);
			a && this.select(a.part.id);
		}, this.onContextLost = (e) => {
			e.preventDefault(), this.lost = !0, this.fail("The WebGL context was lost. You can still use the group list, or retry the 3D view.");
		}, this.renderer = new R({
			antialias: !0,
			alpha: !0
		}), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), this.renderer.setClearColor(0, 0);
		let o = this.renderer.domElement;
		o.style.width = "100%", o.style.height = "100%", o.style.display = "block", o.setAttribute("aria-label", "3D house. Drag to rotate; use the camera controls and group list for keyboard access."), o.setAttribute("role", "img"), this.host.append(o), this.controls = new Y(this.camera, o), this.controls.enableDamping = !1, this.controls.maxPolarAngle = Math.PI * .49, this.controls.addEventListener("change", this.draw), this.controls.addEventListener("start", this.pauseMotion), document.addEventListener("visibilitychange", this.scheduleMotion), this.reduced?.addEventListener("change", this.scheduleMotion), o.addEventListener("pointerdown", this.onPointerDown), o.addEventListener("pointermove", this.onPointerMove), o.addEventListener("pointerup", this.onPointerUp), o.addEventListener("pointercancel", this.onPointerCancel), o.addEventListener("pointerleave", this.onPointerLeave), o.addEventListener("webglcontextlost", this.onContextLost), this.observer = new ResizeObserver(this.resize), this.observer.observe(e), this.resize();
	}
	setParts(e, t, n) {
		if (this.clearParts(), this.focusTarget = void 0, this.focusEvents.clear(), !e.length && !n?.features.length) {
			this.draw();
			return;
		}
		let r = new F();
		for (let t of e) for (let [e, n] of t.footprint) r.expandByPoint(new s(e, t.low, -n)), r.expandByPoint(new s(e, t.high, -n));
		t ??= n?.ground_z;
		for (let e of n?.features ?? []) for (let [t, i] of e.points) r.expandByPoint(new s(t, n.ground_z, -i));
		t !== void 0 && (r.expandByPoint(new s(r.min.x, t, r.min.z)), r.expandByPoint(new s(r.max.x, t, r.max.z)));
		let i = JSON.stringify([r.min.toArray(), r.max.toArray()]), d = this.boundsKey !== i;
		this.boundsKey = i;
		let f = r.getCenter(new s());
		this.origin.copy(f), this.radius = Math.max(r.getSize(new s()).length() / 2, .1);
		for (let t of e) {
			let e = de(t, f), n = new m(e, new P({
				color: 6342885,
				transparent: !0,
				opacity: .025,
				side: 2,
				depthWrite: !1
			})), r = new p(new _(e), new g({
				color: 9545396,
				transparent: !0,
				opacity: .4,
				depthWrite: !1
			}));
			t.container && (n.material.opacity = 0), this.scene.add(n, r);
			let i = t.low - f.y, o = {
				part: t,
				mesh: n,
				edges: r,
				targetColor: new k(),
				targetOpacity: .015
			};
			if (n.material.opacity = 0, !t.container) {
				o.liquid = new m(e.clone(), new P({
					transparent: !0,
					opacity: .015,
					side: 2,
					depthWrite: !1
				})), o.ceiling = new m($(t, f), new P({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1
				})), o.ceiling.position.y = t.high - f.y;
				let n = o.ceiling.geometry;
				n.computeBoundingBox();
				let r = n.boundingBox, a = n.getAttribute("position"), s = n.getAttribute("uv");
				for (let e = 0; e < s.count; e++) s.setXY(e, (a.getX(e) - r.min.x) / (r.max.x - r.min.x), (a.getZ(e) - r.min.z) / (r.max.z - r.min.z));
				o.ceiling.material.map = fe();
				let l = e.clone(), u = l.getAttribute("position"), d = [];
				for (let e = 0; e < u.count; e++) {
					let n = Math.max(0, Math.min(1, (u.getY(e) - i) / (t.high - t.low)));
					d.push(1, 1, 1, n * n);
				}
				l.setAttribute("color", new c(d, 4)), o.wash = new m(l, new P({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1,
					vertexColors: !0
				})), o.liquid.name = "activity-volume", o.ceiling.name = "light-ceiling", o.wash.name = "light-wash", o.liquid.visible = !1, this.scene.add(o.liquid, o.ceiling, o.wash);
			}
			this.volumes.push(o);
			for (let e of t.fixtures ?? []) {
				let n = new m(e.kind === "window" ? new E(e.width ?? 1, e.height ?? 1.2, .06) : new ee(Math.min(.15, Math.max(this.radius * .008, .06)), 12, 8), new P({
					color: 8572379,
					transparent: !0,
					opacity: e.kind === "window" ? .35 : 1
				}));
				e.kind === "window" && (n.rotation.y = e.yaw * Math.PI / 180), n.position.set(e.position[0] - f.x, e.position[2] - f.y, -e.position[1] - f.z), n.name = e.kind === "window" ? "room-window" : "room-fixture", this.scene.add(n);
				let r, i;
				if (e.range > 0 && (e.kind === "motion" || e.kind === "occupancy")) {
					let t = new w(1, 1, 24, 1, !0);
					t.translate(0, -.5, 0), t.scale(Math.tan(e.fov * Math.PI / 360) * e.range, e.range, Math.tan(e.vertical_fov * Math.PI / 360) * e.range), r = new m(t, new P({
						color: 4905197,
						transparent: !0,
						opacity: 0,
						side: 2,
						depthWrite: !1
					}));
					let o = new s(...a(e)), d = e.yaw * Math.PI / 180, f = new s(-Math.sin(d), 0, -Math.cos(d)), h = o.clone().cross(f);
					r.quaternion.setFromRotationMatrix(new u().makeBasis(f, o.clone().negate(), h)), r.position.copy(n.position), r.name = "sensor-coverage";
					let g = [], _ = (t) => new s(Math.sin(t) * Math.tan(e.fov * Math.PI / 360) * e.range, -e.range, Math.cos(t) * Math.tan(e.vertical_fov * Math.PI / 360) * e.range);
					for (let e = 0; e < 32; e++) g.push(..._(e * Math.PI / 16).toArray(), ..._((e + 1) * Math.PI / 16).toArray()), e % 8 == 0 && g.push(0, 0, 0, ..._(e * Math.PI / 16).toArray());
					i = new p(new N().setAttribute("position", new c(g, 3)), new l({
						color: 5486286,
						dashSize: .06,
						gapSize: .08,
						transparent: !0,
						opacity: .65,
						depthWrite: !1
					})), i.computeLineDistances(), i.position.copy(n.position), i.quaternion.copy(r.quaternion), i.name = "sensor-boundary", this.scene.add(r, i);
				}
				e.kind === "window" && (i = new p(new _(n.geometry), new l({
					color: 5486286,
					dashSize: 1,
					gapSize: 0,
					transparent: !0,
					opacity: .65,
					depthWrite: !1
				})), i.computeLineDistances(), i.position.copy(n.position), i.quaternion.copy(n.quaternion), i.name = "window-boundary", this.scene.add(i)), this.markers.push({
					room: t.id,
					fixture: e,
					marker: n,
					coverage: r,
					boundary: i
				});
			}
		}
		let h = {
			property: 4345924,
			lawn: 5270336,
			driveway: 6910329,
			path: 9273449,
			pool: 3570843
		};
		[...n?.features ?? []].sort((e, t) => Number(t.kind === "property") - Number(e.kind === "property")).forEach((e, t) => {
			let r = $({ footprint: e.points }, f), i = new m(r, new P({
				color: h[e.kind],
				side: 2,
				transparent: !0,
				opacity: .5,
				depthWrite: !1
			}));
			i.position.y = n.ground_z - f.y + t * .002, i.name = "site-feature", this.scene.add(i), this.siteMeshes.push(i);
		}), this.grid = new o(this.radius * 2.8, 16, 6914446, 6914446), this.grid.position.y = (t ?? r.min.y - this.radius * .015) - f.y, t !== void 0 && (this.ground = new m(new I(this.radius * 2.8, this.radius * 2.8), new P({
			color: 7700874,
			transparent: !0,
			opacity: 0,
			side: 2,
			depthWrite: !1
		})), this.ground.rotation.x = -Math.PI / 2, this.ground.position.y = this.grid.position.y, this.scene.add(this.ground)), this.grid.material.transparent = !0, this.grid.material.opacity = .14, this.scene.add(this.grid), this.camera.near = Math.max(this.radius / 1e3, .001), this.camera.far = this.radius * 100, this.controls.minDistance = this.radius * .1, this.controls.maxDistance = this.radius * 30, d ? (this.cameraAction("reset"), this.pauseUntil = 0) : this.draw();
	}
	setActivity(o, c, l, u = t(), d = {}, f, p = {}) {
		l !== this.lastSelected && (this.pauseMotion(), this.lastSelected = l), this.options = u, u.focus_activity || (this.focusTarget = void 0);
		for (let t of this.volumes) {
			let { part: n, edges: r, liquid: a, ceiling: s, wash: p } = t, m = e(o, n.id, c), h = n.id === l || n.ancestors.includes(l), g = f && (!f.group || n.id === f.group || n.ancestors.includes(f.group));
			if (r.material.color.set(g && f.color ? f.color : h ? "#d7e8f1" : "#8596a1"), r.material.opacity = h || g ? .9 : n.container ? .07 : .24, !a || !s || !p) continue;
			let _ = a.visible, v = m.status === "stale" ? 0 : m.ratio;
			if (a.visible = v !== null, v !== null) {
				let e = m.status === "stale" ? 0 : m.value;
				t.targetColor.set(i(e, u)), t.targetOpacity = .015 + .225 * Math.min(1, Math.max(0, e / 5)), (!_ || this.reduced?.matches) && (a.material.color.copy(t.targetColor), a.material.opacity = t.targetOpacity), this.updateColor(t, 0);
			}
			let y = d[n.id], b = u.light_fill ? (y?.brightness ?? 0) * u.fill_brightness : 0;
			s.material.color.setRGB(...y?.rgb ?? [
				0,
				0,
				0
			]), p.material.color.copy(s.material.color), s.material.opacity = Math.min(1, b * 3), p.material.opacity = b * .25, s.visible = p.visible = b > 0;
		}
		let m = this.lastFocus, h = f ? `${f.entity}:${f.state}:${f.group ?? ""}` : "", g = h && h !== this.alertKey ? this.volumes.find((e) => e.part.id === f?.group) : void 0, _ = [];
		for (let t of this.volumes) {
			let n = o?.groups[t.part.id]?.last_activity;
			if (n != null && Number.isFinite(n)) {
				let r = this.focusEvents.get(t.part.id);
				this.focusEvents.set(t.part.id, n), !t.part.container && r !== void 0 && n > r && c - n < 10 && e(o, t.part.id, c).status === "live" && _.push({
					volume: t,
					event: n
				});
			}
		}
		f || (g ??= _.sort((e, t) => t.event - e.event)[0]?.volume);
		let v;
		if (h && h !== this.alertKey) {
			let e = this.volumes.filter((e) => !f?.group || e.part.id === f.group || e.part.ancestors.includes(f.group));
			if (e.length) {
				v = new F();
				for (let { mesh: t } of e) t.geometry.computeBoundingBox(), v.union(t.geometry.boundingBox);
			}
		}
		if (this.alertKey = h, (g || v) && u.focus_activity && !this.reduced?.matches && Date.now() >= this.pauseUntil && (h || c - this.lastFocus >= 12)) {
			g?.mesh.geometry.computeBoundingBox();
			let e = v ?? g.mesh.geometry.boundingBox;
			this.focusTarget = e.getCenter(new s()), this.focusDistance = Math.min(this.fitDistance(), Math.max(e.getSize(new s()).length() * 2, this.radius)), this.focusUntil = Date.now() + 8e3, this.lastFocus = c;
		}
		let y;
		for (let e of this.markers) {
			let t = p[e.fixture.entity], i = t?.state === "on" || t?.state === "off", a = t?.state === "on", o = r(e.fixture.kind, t?.state);
			if (e.marker.material.color.set(o.color), e.fixture.kind === "light" && a) {
				let t = n([e.fixture.entity], p);
				e.marker.material.color.setRGB(...t.rgb);
			}
			e.coverage && (e.coverage.material.color.copy(e.marker.material.color), e.coverage.material.opacity = o.opacity), e.boundary && (e.boundary.material.color.set(o.color), e.boundary.material.opacity = i ? .65 : .25), (e.fixture.kind === "motion" || e.fixture.kind === "occupancy") && e.previous === "off" && a && (y = e), e.previous = t?.state;
		}
		if (y && u.focus_activity && !f && !this.reduced?.matches && Date.now() >= this.pauseUntil && c - m >= 12) {
			let e = new s(...a(y.fixture));
			this.focusTarget = y.marker.position.clone().addScaledVector(e, Math.min(y.fixture.range, 3) * .5), this.focusDistance = Math.max(this.radius * .6, 2), this.focusUntil = Date.now() + 8e3, this.lastFocus = c;
		}
		this.scheduleMotion(), this.draw();
	}
	setPlacement(e) {
		this.placementHeight = e;
	}
	updateColor(e, t) {
		if (!e.liquid?.visible) return;
		let n = e.liquid.material.color;
		n.lerp(e.targetColor, t), e.liquid.material.opacity += (e.targetOpacity - e.liquid.material.opacity) * t, this.colorPending(e) || (n.copy(e.targetColor), e.liquid.material.opacity = e.targetOpacity);
	}
	colorPending(e) {
		let t = e.liquid?.material.color;
		return !!e.liquid?.visible && !!t && Math.abs(t.r - e.targetColor.r) + Math.abs(t.g - e.targetColor.g) + Math.abs(t.b - e.targetColor.b) + Math.abs(e.liquid.material.opacity - e.targetOpacity) > .001;
	}
	colorChanging() {
		return this.volumes.some((e) => this.colorPending(e));
	}
	fitDistance() {
		let e = this.camera.fov * Math.PI / 360;
		return this.radius / Math.sin(Math.min(e, Math.atan(Math.tan(e) * this.camera.aspect))) * 1.2;
	}
	cameraAction(e) {
		if (this.pauseMotion(), e === "reset" || e === "top") {
			let t = this.camera.fov * Math.PI / 360, n = Math.min(t, Math.atan(Math.tan(t) * this.camera.aspect)), r = this.radius / Math.sin(n) * 1.2;
			this.controls.target.set(0, 0, 0);
			let i = e === "top" ? new s(0, 1, 1e-4) : new s(1, .8, 1);
			this.camera.position.copy(i.normalize().multiplyScalar(r)), this.camera.updateProjectionMatrix();
		} else e === "left" || e === "right" ? this.controls.rotateLeft(e === "left" ? .2 : -.2) : e === "up" || e === "down" ? this.controls.rotateUp(e === "up" ? .15 : -.15) : e === "in" ? this.controls.dollyIn(1 / 1.2) : this.controls.dollyOut(1 / 1.2);
		this.controls.update(), this.draw();
	}
	clearParts() {
		for (let e of this.markers) for (let t of [
			e.marker,
			e.coverage,
			e.boundary
		]) t && (this.scene.remove(t), t.geometry.dispose(), t.material.dispose());
		this.markers = [];
		for (let e of this.siteMeshes) this.scene.remove(e), e.geometry.dispose(), e.material.dispose();
		this.siteMeshes = [], this.ground &&= (this.scene.remove(this.ground), this.ground.geometry.dispose(), this.ground.material.dispose(), void 0);
		for (let { mesh: e, edges: t, liquid: n, ceiling: r, wash: i } of this.volumes) {
			r?.material.map?.dispose();
			for (let e of [
				n,
				r,
				i
			]) e && (this.scene.remove(e), e.geometry.dispose(), e.material.dispose());
			this.scene.remove(e, t), e.geometry.dispose(), e.material.dispose(), t.geometry.dispose(), t.material.dispose();
		}
		this.volumes = [], this.grid &&= (this.scene.remove(this.grid), this.grid.geometry.dispose(), this.grid.material.dispose(), void 0);
	}
	dispose() {
		if (this.disposed) return;
		this.disposed = !0, clearTimeout(this.animation), document.removeEventListener("visibilitychange", this.scheduleMotion), this.reduced?.removeEventListener("change", this.scheduleMotion), this.controls.removeEventListener("start", this.pauseMotion), this.observer.disconnect(), this.controls.removeEventListener("change", this.draw), this.controls.dispose();
		let e = this.renderer.domElement;
		e.removeEventListener("pointerdown", this.onPointerDown), e.removeEventListener("pointermove", this.onPointerMove), e.removeEventListener("pointerup", this.onPointerUp), e.removeEventListener("pointercancel", this.onPointerCancel), e.removeEventListener("pointerleave", this.onPointerLeave), e.removeEventListener("webglcontextlost", this.onContextLost), this.clearParts(), this.renderer.dispose(), e.remove();
	}
};
//#endregion
export { pe as FloorplanRenderer };
