import { i as e, n as t, r as n } from "./shared-Z4k_40_Y.js";
import { $ as r, B as i, F as a, G as o, Ht as s, N as c, P as l, T as u, Ut as d, V as f, W as p, _ as m, an as h, bn as g, d as _, en as v, et as y, k as b, l as ee, nn as x, nt as S, on as C, r as w, rn as T, tt as E, w as D, x as O, yn as k } from "./shared-D0-7sHnd.js";
import { t as A } from "./shared-DHv2K68C.js";
//#region node_modules/.pnpm/three@0.185.1/node_modules/three/examples/jsm/controls/OrbitControls.js
var j = { type: "change" }, M = { type: "start" }, N = { type: "end" }, P = new s(), F = new y(), I = Math.cos(70 * f.DEG2RAD), L = new g(), R = 2 * Math.PI, z = {
	NONE: -1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
}, B = 1e-6, V = class extends _ {
	constructor(e, t = null) {
		super(e, t), this.state = z.NONE, this.target = new g(), this.cursor = new g(), this.minDistance = 0, this.maxDistance = Infinity, this.minZoom = 0, this.maxZoom = Infinity, this.minTargetRadius = 0, this.maxTargetRadius = Infinity, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -Infinity, this.maxAzimuthAngle = Infinity, this.enableDamping = !1, this.dampingFactor = .05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
			LEFT: "ArrowLeft",
			UP: "ArrowUp",
			RIGHT: "ArrowRight",
			BOTTOM: "ArrowDown"
		}, this.mouseButtons = {
			LEFT: i.ROTATE,
			MIDDLE: i.DOLLY,
			RIGHT: i.PAN
		}, this.touches = {
			ONE: C.ROTATE,
			TWO: C.DOLLY_PAN
		}, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._cursorStyle = "auto", this._domElementKeyEvents = null, this._lastPosition = new g(), this._lastQuaternion = new S(), this._lastTargetPosition = new g(), this._quat = new S().setFromUnitVectors(e.up, new g(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new h(), this._sphericalDelta = new h(), this._scale = 1, this._panOffset = new g(), this._rotateStart = new k(), this._rotateEnd = new k(), this._rotateDelta = new k(), this._panStart = new k(), this._panEnd = new k(), this._panDelta = new k(), this._dollyStart = new k(), this._dollyEnd = new k(), this._dollyDelta = new k(), this._dollyDirection = new g(), this._mouse = new k(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = U.bind(this), this._onPointerDown = H.bind(this), this._onPointerUp = W.bind(this), this._onContextMenu = Z.bind(this), this._onMouseWheel = q.bind(this), this._onKeyDown = J.bind(this), this._onTouchStart = Y.bind(this), this._onTouchMove = X.bind(this), this._onMouseDown = G.bind(this), this._onMouseMove = K.bind(this), this._interceptControlDown = Q.bind(this), this._interceptControlUp = te.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
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
		this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(j), this.update(), this.state = z.NONE;
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
		L.copy(t).sub(this.target), L.applyQuaternion(this._quat), this._spherical.setFromVector3(L), this.autoRotate && this.state === z.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
		let n = this.minAzimuthAngle, r = this.maxAzimuthAngle;
		isFinite(n) && isFinite(r) && (n < -Math.PI ? n += R : n > Math.PI && (n -= R), r < -Math.PI ? r += R : r > Math.PI && (r -= R), n <= r ? this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + r) / 2 ? Math.max(n, this._spherical.theta) : Math.min(r, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
		let i = !1;
		if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
		else {
			let e = this._spherical.radius;
			this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), i = e != this._spherical.radius;
		}
		if (L.setFromSpherical(this._spherical), L.applyQuaternion(this._quatInverse), t.copy(this.target).add(L), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
			let e = null;
			if (this.object.isPerspectiveCamera) {
				let t = L.length();
				e = this._clampDistance(t * this._scale);
				let n = t - e;
				this.object.position.addScaledVector(this._dollyDirection, n), this.object.updateMatrixWorld(), i = !!n;
			} else if (this.object.isOrthographicCamera) {
				let t = new g(this._mouse.x, this._mouse.y, 0);
				t.unproject(this.object);
				let n = this.object.zoom;
				this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), i = n !== this.object.zoom;
				let r = new g(this._mouse.x, this._mouse.y, 0);
				r.unproject(this.object), this.object.position.sub(r).add(t), this.object.updateMatrixWorld(), e = L.length();
			} else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
			e !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position) : (P.origin.copy(this.object.position), P.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(P.direction)) < I ? this.object.lookAt(this.target) : (F.setFromNormalAndCoplanarPoint(this.object.up, this.target), P.intersectPlane(F, this.target))));
		} else if (this.object.isOrthographicCamera) {
			let e = this.object.zoom;
			this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), e !== this.object.zoom && (this.object.updateProjectionMatrix(), i = !0);
		}
		return this._scale = 1, this._performCursorZoom = !1, i || this._lastPosition.distanceToSquared(this.object.position) > B || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > B || this._lastTargetPosition.distanceToSquared(this.target) > B ? (this.dispatchEvent(j), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
	}
	_getAutoRotationAngle(e) {
		return e === null ? R / 60 / 60 * this.autoRotateSpeed : R / 60 * this.autoRotateSpeed * e;
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
		L.setFromMatrixColumn(t, 0), L.multiplyScalar(-e), this._panOffset.add(L);
	}
	_panUp(e, t) {
		this.screenSpacePanning === !0 ? L.setFromMatrixColumn(t, 1) : (L.setFromMatrixColumn(t, 0), L.crossVectors(this.object.up, L)), L.multiplyScalar(e), this._panOffset.add(L);
	}
	_pan(e, t) {
		let n = this.domElement;
		if (this.object.isPerspectiveCamera) {
			let r = this.object.position;
			L.copy(r).sub(this.target);
			let i = L.length();
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
		this._rotateLeft(R * this._rotateDelta.x / t.clientHeight), this._rotateUp(R * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(R * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
				break;
			case this.keys.BOTTOM:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-R * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
				break;
			case this.keys.LEFT:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(R * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
				break;
			case this.keys.RIGHT: e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-R * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
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
		this._rotateLeft(R * this._rotateDelta.x / t.clientHeight), this._rotateUp(R * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
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
		t === void 0 && (t = new k(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
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
function H(e) {
	this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.ownerDocument.addEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e), this._cursorStyle === "grab" && (this.domElement.style.cursor = "grabbing")));
}
function U(e) {
	this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function W(e) {
	switch (this._removePointer(e), this._pointers.length) {
		case 0:
			this.domElement.releasePointerCapture(e.pointerId), this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(N), this.state = z.NONE, this._cursorStyle === "grab" && (this.domElement.style.cursor = "grab");
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
function G(e) {
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
		case i.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseDownDolly(e), this.state = z.DOLLY;
			break;
		case i.ROTATE:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = z.PAN;
			} else {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = z.ROTATE;
			}
			break;
		case i.PAN:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = z.ROTATE;
			} else {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = z.PAN;
			}
			break;
		default: this.state = z.NONE;
	}
	this.state !== z.NONE && this.dispatchEvent(M);
}
function K(e) {
	switch (this.state) {
		case z.ROTATE:
			if (this.enableRotate === !1) return;
			this._handleMouseMoveRotate(e);
			break;
		case z.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseMoveDolly(e);
			break;
		case z.PAN:
			if (this.enablePan === !1) return;
			this._handleMouseMovePan(e);
	}
}
function q(e) {
	this.enabled !== !1 && this.enableZoom !== !1 && this.state === z.NONE && (e.preventDefault(), this.dispatchEvent(M), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(N));
}
function J(e) {
	this.enabled !== !1 && this._handleKeyDown(e);
}
function Y(e) {
	switch (this._trackPointer(e), this._pointers.length) {
		case 1:
			switch (this.touches.ONE) {
				case C.ROTATE:
					if (this.enableRotate === !1) return;
					this._handleTouchStartRotate(e), this.state = z.TOUCH_ROTATE;
					break;
				case C.PAN:
					if (this.enablePan === !1) return;
					this._handleTouchStartPan(e), this.state = z.TOUCH_PAN;
					break;
				default: this.state = z.NONE;
			}
			break;
		case 2:
			switch (this.touches.TWO) {
				case C.DOLLY_PAN:
					if (this.enableZoom === !1 && this.enablePan === !1) return;
					this._handleTouchStartDollyPan(e), this.state = z.TOUCH_DOLLY_PAN;
					break;
				case C.DOLLY_ROTATE:
					if (this.enableZoom === !1 && this.enableRotate === !1) return;
					this._handleTouchStartDollyRotate(e), this.state = z.TOUCH_DOLLY_ROTATE;
					break;
				default: this.state = z.NONE;
			}
			break;
		default: this.state = z.NONE;
	}
	this.state !== z.NONE && this.dispatchEvent(M);
}
function X(e) {
	switch (this._trackPointer(e), this.state) {
		case z.TOUCH_ROTATE:
			if (this.enableRotate === !1) return;
			this._handleTouchMoveRotate(e), this.update();
			break;
		case z.TOUCH_PAN:
			if (this.enablePan === !1) return;
			this._handleTouchMovePan(e), this.update();
			break;
		case z.TOUCH_DOLLY_PAN:
			if (this.enableZoom === !1 && this.enablePan === !1) return;
			this._handleTouchMoveDollyPan(e), this.update();
			break;
		case z.TOUCH_DOLLY_ROTATE:
			if (this.enableZoom === !1 && this.enableRotate === !1) return;
			this._handleTouchMoveDollyRotate(e), this.update();
			break;
		default: this.state = z.NONE;
	}
}
function Z(e) {
	this.enabled !== !1 && e.preventDefault();
}
function Q(e) {
	e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
function te(e) {
	e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
//#endregion
//#region src/floorplan-renderer.ts
function ne(e, t) {
	let n = new x(e.footprint.map(([e, n]) => new k(e - t.x, n + t.z))), r = new D(n, {
		depth: e.high - e.low,
		bevelEnabled: !1,
		steps: 1
	});
	return r.rotateX(-Math.PI / 2), r.translate(0, e.low - t.y, 0), r;
}
function $(e, t) {
	let n = new T(new x(e.footprint.map(([e, n]) => new k(e - t.x, n + t.z))));
	return n.rotateX(-Math.PI / 2), n;
}
function re() {
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
	let t = new m(e, 32, 32);
	return t.magFilter = t.minFilter = a, t.needsUpdate = !0, t;
}
var ie = class {
	constructor(e, t, i) {
		this.host = e, this.select = t, this.fail = i, this.scene = new v(), this.camera = new r(38, 1, .01, 1e3), this.raycaster = new d(), this.volumes = [], this.siteMeshes = [], this.radius = 1, this.options = n(), this.lastTick = 0, this.pauseUntil = 0, this.focusUntil = 0, this.focusDistance = 0, this.focusEvents = /* @__PURE__ */ new Map(), this.alertKey = "", this.lastSelected = "", this.lastFocus = 0, this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)"), this.disposed = !1, this.lost = !1, this.pointer = null, this.resize = () => {
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
					let e = Date.now() > this.focusUntil, n = e ? new g() : this.focusTarget, r = this.camera.position.clone().sub(this.controls.target), i = e ? this.fitDistance() : this.focusDistance;
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
		}, this.onPointerMove = (e) => {
			this.pointer && Math.hypot(e.clientX - this.pointer.x, e.clientY - this.pointer.y) > 5 && (this.pointer.moved = !0);
		}, this.onPointerCancel = () => {
			this.pointer = null;
		}, this.onPointerUp = (e) => {
			let t = this.pointer;
			if (this.pointer = null, !t || t.id !== e.pointerId || t.moved) return;
			let n = this.renderer.domElement.getBoundingClientRect();
			if (!n.width || !n.height) return;
			this.raycaster.setFromCamera(new k((e.clientX - n.left) / n.width * 2 - 1, -(e.clientY - n.top) / n.height * 2 + 1), this.camera);
			let r = this.volumes.filter(({ part: e }) => !e.container), i = this.raycaster.intersectObjects(r.map(({ mesh: e }) => e))[0] ?? this.raycaster.intersectObjects(this.volumes.map(({ mesh: e }) => e))[0], a = this.volumes.find(({ mesh: e }) => e === i?.object);
			a && this.select(a.part.id);
		}, this.onContextLost = (e) => {
			e.preventDefault(), this.lost = !0, this.fail("The WebGL context was lost. You can still use the group list, or retry the 3D view.");
		}, this.renderer = new A({
			antialias: !0,
			alpha: !0
		}), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), this.renderer.setClearColor(0, 0);
		let a = this.renderer.domElement;
		a.style.width = "100%", a.style.height = "100%", a.style.display = "block", a.setAttribute("aria-label", "3D house. Drag to rotate; use the camera controls and group list for keyboard access."), a.setAttribute("role", "img"), this.host.append(a), this.controls = new V(this.camera, a), this.controls.enableDamping = !1, this.controls.maxPolarAngle = Math.PI * .49, this.controls.addEventListener("change", this.draw), this.controls.addEventListener("start", this.pauseMotion), document.addEventListener("visibilitychange", this.scheduleMotion), this.reduced?.addEventListener("change", this.scheduleMotion), a.addEventListener("pointerdown", this.onPointerDown), a.addEventListener("pointermove", this.onPointerMove), a.addEventListener("pointerup", this.onPointerUp), a.addEventListener("pointercancel", this.onPointerCancel), a.addEventListener("webglcontextlost", this.onContextLost), this.observer = new ResizeObserver(this.resize), this.observer.observe(e), this.resize();
	}
	setParts(e, t, n) {
		if (this.clearParts(), this.focusTarget = void 0, this.focusEvents.clear(), !e.length && !n?.features.length) {
			this.draw();
			return;
		}
		let r = new w();
		for (let t of e) for (let [e, n] of t.footprint) r.expandByPoint(new g(e, t.low, -n)), r.expandByPoint(new g(e, t.high, -n));
		t ??= n?.ground_z;
		for (let e of n?.features ?? []) for (let [t, i] of e.points) r.expandByPoint(new g(t, n.ground_z, -i));
		t !== void 0 && (r.expandByPoint(new g(r.min.x, t, r.min.z)), r.expandByPoint(new g(r.max.x, t, r.max.z)));
		let i = r.getCenter(new g());
		this.radius = Math.max(r.getSize(new g()).length() / 2, .1);
		for (let t of e) {
			let e = ne(t, i), n = new p(e, new o({
				color: 6342885,
				transparent: !0,
				opacity: .025,
				side: 2,
				depthWrite: !1
			})), r = new l(new O(e), new c({
				color: 9545396,
				transparent: !0,
				opacity: .4,
				depthWrite: !1
			}));
			t.container && (n.material.opacity = 0), this.scene.add(n, r);
			let a = t.low - i.y, s = {
				part: t,
				mesh: n,
				edges: r,
				targetColor: new ee(),
				targetOpacity: .015
			};
			if (n.material.opacity = 0, !t.container) {
				s.liquid = new p(e.clone(), new o({
					transparent: !0,
					opacity: .015,
					side: 2,
					depthWrite: !1
				})), s.ceiling = new p($(t, i), new o({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1
				})), s.ceiling.position.y = t.high - i.y;
				let n = s.ceiling.geometry;
				n.computeBoundingBox();
				let r = n.boundingBox, c = n.getAttribute("position"), l = n.getAttribute("uv");
				for (let e = 0; e < l.count; e++) l.setXY(e, (c.getX(e) - r.min.x) / (r.max.x - r.min.x), (c.getZ(e) - r.min.z) / (r.max.z - r.min.z));
				s.ceiling.material.map = re();
				let d = e.clone(), f = d.getAttribute("position"), m = [];
				for (let e = 0; e < f.count; e++) {
					let n = Math.max(0, Math.min(1, (f.getY(e) - a) / (t.high - t.low)));
					m.push(1, 1, 1, n * n);
				}
				d.setAttribute("color", new u(m, 4)), s.wash = new p(d, new o({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1,
					vertexColors: !0
				})), s.liquid.name = "activity-volume", s.ceiling.name = "light-ceiling", s.wash.name = "light-wash", s.liquid.visible = !1, this.scene.add(s.liquid, s.ceiling, s.wash);
			}
			this.volumes.push(s);
		}
		let a = {
			property: 4345924,
			lawn: 5270336,
			driveway: 6910329,
			path: 9273449,
			pool: 3570843
		};
		[...n?.features ?? []].sort((e, t) => Number(t.kind === "property") - Number(e.kind === "property")).forEach((e, t) => {
			let r = $({ footprint: e.points }, i), s = new p(r, new o({
				color: a[e.kind],
				side: 2,
				transparent: !0,
				opacity: .5,
				depthWrite: !1
			}));
			s.position.y = n.ground_z - i.y + t * .002, s.name = "site-feature", this.scene.add(s), this.siteMeshes.push(s);
		}), this.grid = new b(this.radius * 2.8, 16, 6914446, 6914446), this.grid.position.y = (t ?? r.min.y - this.radius * .015) - i.y, t !== void 0 && (this.ground = new p(new E(this.radius * 2.8, this.radius * 2.8), new o({
			color: 7700874,
			transparent: !0,
			opacity: .045,
			side: 2,
			depthWrite: !1
		})), this.ground.rotation.x = -Math.PI / 2, this.ground.position.y = this.grid.position.y, this.scene.add(this.ground)), this.grid.material.transparent = !0, this.grid.material.opacity = .14, this.scene.add(this.grid), this.camera.near = Math.max(this.radius / 1e3, .001), this.camera.far = this.radius * 100, this.controls.minDistance = this.radius * .1, this.controls.maxDistance = this.radius * 30, this.cameraAction("reset"), this.pauseUntil = 0;
	}
	setActivity(r, i, a, o = n(), s = {}, c) {
		a !== this.lastSelected && (this.pauseMotion(), this.lastSelected = a), this.options = o, o.focus_activity || (this.focusTarget = void 0);
		for (let n of this.volumes) {
			let { part: l, edges: u, liquid: d, ceiling: f, wash: p } = n, m = e(r, l.id, i), h = l.id === a || l.ancestors.includes(a), g = c && (!c.group || l.id === c.group || l.ancestors.includes(c.group));
			if (u.material.color.set(g && c.color ? c.color : h ? "#d7e8f1" : "#8596a1"), u.material.opacity = h || g ? .9 : l.container ? .07 : .24, !d || !f || !p) continue;
			let _ = d.visible, v = m.status === "stale" ? 0 : m.ratio;
			if (d.visible = v !== null, v !== null) {
				let e = m.status === "stale" ? 0 : m.value;
				n.targetColor.set(t(e, o)), n.targetOpacity = .015 + .225 * Math.min(1, Math.max(0, e / 5)), (!_ || this.reduced?.matches) && (d.material.color.copy(n.targetColor), d.material.opacity = n.targetOpacity), this.updateColor(n, 0);
			}
			let y = s[l.id], b = o.light_fill ? (y?.brightness ?? 0) * o.fill_brightness : 0;
			f.material.color.setRGB(...y?.rgb ?? [
				0,
				0,
				0
			]), p.material.color.copy(f.material.color), f.material.opacity = Math.min(1, b * 3), p.material.opacity = b * .25, f.visible = p.visible = b > 0;
		}
		let l = c ? `${c.entity}:${c.state}:${c.group ?? ""}` : "", u = l && l !== this.alertKey ? this.volumes.find((e) => e.part.id === c?.group) : void 0, d = [];
		for (let t of this.volumes) {
			let n = r?.groups[t.part.id]?.last_activity;
			if (n != null && Number.isFinite(n)) {
				let a = this.focusEvents.get(t.part.id);
				this.focusEvents.set(t.part.id, n), !t.part.container && a !== void 0 && n > a && i - n < 10 && e(r, t.part.id, i).status === "live" && d.push({
					volume: t,
					event: n
				});
			}
		}
		c || (u ??= d.sort((e, t) => t.event - e.event)[0]?.volume);
		let f;
		if (l && l !== this.alertKey) {
			let e = this.volumes.filter((e) => !c?.group || e.part.id === c.group || e.part.ancestors.includes(c.group));
			if (e.length) {
				f = new w();
				for (let { mesh: t } of e) t.geometry.computeBoundingBox(), f.union(t.geometry.boundingBox);
			}
		}
		if (this.alertKey = l, (u || f) && o.focus_activity && !this.reduced?.matches && Date.now() >= this.pauseUntil && (l || i - this.lastFocus >= 12)) {
			u?.mesh.geometry.computeBoundingBox();
			let e = f ?? u.mesh.geometry.boundingBox;
			this.focusTarget = e.getCenter(new g()), this.focusDistance = Math.min(this.fitDistance(), Math.max(e.getSize(new g()).length() * 2, this.radius)), this.focusUntil = Date.now() + 8e3, this.lastFocus = i;
		}
		this.scheduleMotion(), this.draw();
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
			let i = e === "top" ? new g(0, 1, 1e-4) : new g(1, .8, 1);
			this.camera.position.copy(i.normalize().multiplyScalar(r)), this.camera.updateProjectionMatrix();
		} else e === "left" || e === "right" ? this.controls.rotateLeft(e === "left" ? .2 : -.2) : e === "up" || e === "down" ? this.controls.rotateUp(e === "up" ? .15 : -.15) : e === "in" ? this.controls.dollyIn(1 / 1.2) : this.controls.dollyOut(1 / 1.2);
		this.controls.update(), this.draw();
	}
	clearParts() {
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
		e.removeEventListener("pointerdown", this.onPointerDown), e.removeEventListener("pointermove", this.onPointerMove), e.removeEventListener("pointerup", this.onPointerUp), e.removeEventListener("pointercancel", this.onPointerCancel), e.removeEventListener("webglcontextlost", this.onContextLost), this.clearParts(), this.renderer.dispose(), e.remove();
	}
};
//#endregion
export { ie as FloorplanRenderer };
