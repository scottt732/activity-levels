import { C as e, M as t, T as n, a as r, b as i, c as a, d as o, i as s, l as c, n as l, r as u, u as d, v as f, w as p } from "./shared-C0J-jiaM.js";
import { n as m } from "./shared-BBNy9uad.js";
import { C as h, Cn as g, D as _, E as v, F as y, Gt as b, I as x, J as S, Kt as C, L as w, R as T, U as E, W as D, an as O, at as k, cn as A, d as j, f as ee, g as M, i as N, it as te, j as ne, l as re, ln as P, nt as F, o as I, on as ie, q as L, r as R, rn as ae, rt as z, un as B, wn as V, y as oe } from "./shared-D5qQ7apd.js";
import { t as se } from "./shared-AjOodNET.js";
//#region node_modules/.pnpm/three@0.185.1/node_modules/three/examples/jsm/controls/OrbitControls.js
var H = { type: "change" }, U = { type: "start" }, W = { type: "end" }, G = new b(), K = new z(), ce = Math.cos(70 * D.DEG2RAD), q = new V(), J = 2 * Math.PI, Y = {
	NONE: -1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
}, X = 1e-6, le = class extends ee {
	constructor(e, t = null) {
		super(e, t), this.state = Y.NONE, this.target = new V(), this.cursor = new V(), this.minDistance = 0, this.maxDistance = Infinity, this.minZoom = 0, this.maxZoom = Infinity, this.minTargetRadius = 0, this.maxTargetRadius = Infinity, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -Infinity, this.maxAzimuthAngle = Infinity, this.enableDamping = !1, this.dampingFactor = .05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
			LEFT: "ArrowLeft",
			UP: "ArrowUp",
			RIGHT: "ArrowRight",
			BOTTOM: "ArrowDown"
		}, this.mouseButtons = {
			LEFT: E.ROTATE,
			MIDDLE: E.DOLLY,
			RIGHT: E.PAN
		}, this.touches = {
			ONE: B.ROTATE,
			TWO: B.DOLLY_PAN
		}, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._cursorStyle = "auto", this._domElementKeyEvents = null, this._lastPosition = new V(), this._lastQuaternion = new k(), this._lastTargetPosition = new V(), this._quat = new k().setFromUnitVectors(e.up, new V(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new P(), this._sphericalDelta = new P(), this._scale = 1, this._panOffset = new V(), this._rotateStart = new g(), this._rotateEnd = new g(), this._rotateDelta = new g(), this._panStart = new g(), this._panEnd = new g(), this._panDelta = new g(), this._dollyStart = new g(), this._dollyEnd = new g(), this._dollyDelta = new g(), this._dollyDirection = new V(), this._mouse = new g(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = de.bind(this), this._onPointerDown = ue.bind(this), this._onPointerUp = fe.bind(this), this._onContextMenu = ye.bind(this), this._onMouseWheel = he.bind(this), this._onKeyDown = ge.bind(this), this._onTouchStart = _e.bind(this), this._onTouchMove = ve.bind(this), this._onMouseDown = pe.bind(this), this._onMouseMove = me.bind(this), this._interceptControlDown = be.bind(this), this._interceptControlUp = xe.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
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
		this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(H), this.update(), this.state = Y.NONE;
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
		q.copy(t).sub(this.target), q.applyQuaternion(this._quat), this._spherical.setFromVector3(q), this.autoRotate && this.state === Y.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
		let n = this.minAzimuthAngle, r = this.maxAzimuthAngle;
		isFinite(n) && isFinite(r) && (n < -Math.PI ? n += J : n > Math.PI && (n -= J), r < -Math.PI ? r += J : r > Math.PI && (r -= J), n <= r ? this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + r) / 2 ? Math.max(n, this._spherical.theta) : Math.min(r, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
		let i = !1;
		if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
		else {
			let e = this._spherical.radius;
			this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), i = e != this._spherical.radius;
		}
		if (q.setFromSpherical(this._spherical), q.applyQuaternion(this._quatInverse), t.copy(this.target).add(q), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
			let e = null;
			if (this.object.isPerspectiveCamera) {
				let t = q.length();
				e = this._clampDistance(t * this._scale);
				let n = t - e;
				this.object.position.addScaledVector(this._dollyDirection, n), this.object.updateMatrixWorld(), i = !!n;
			} else if (this.object.isOrthographicCamera) {
				let t = new V(this._mouse.x, this._mouse.y, 0);
				t.unproject(this.object);
				let n = this.object.zoom;
				this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), i = n !== this.object.zoom;
				let r = new V(this._mouse.x, this._mouse.y, 0);
				r.unproject(this.object), this.object.position.sub(r).add(t), this.object.updateMatrixWorld(), e = q.length();
			} else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
			e !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position) : (G.origin.copy(this.object.position), G.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(G.direction)) < ce ? this.object.lookAt(this.target) : (K.setFromNormalAndCoplanarPoint(this.object.up, this.target), G.intersectPlane(K, this.target))));
		} else if (this.object.isOrthographicCamera) {
			let e = this.object.zoom;
			this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), e !== this.object.zoom && (this.object.updateProjectionMatrix(), i = !0);
		}
		return this._scale = 1, this._performCursorZoom = !1, i || this._lastPosition.distanceToSquared(this.object.position) > X || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > X || this._lastTargetPosition.distanceToSquared(this.target) > X ? (this.dispatchEvent(H), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
	}
	_getAutoRotationAngle(e) {
		return e === null ? J / 60 / 60 * this.autoRotateSpeed : J / 60 * this.autoRotateSpeed * e;
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
		q.setFromMatrixColumn(t, 0), q.multiplyScalar(-e), this._panOffset.add(q);
	}
	_panUp(e, t) {
		this.screenSpacePanning === !0 ? q.setFromMatrixColumn(t, 1) : (q.setFromMatrixColumn(t, 0), q.crossVectors(this.object.up, q)), q.multiplyScalar(e), this._panOffset.add(q);
	}
	_pan(e, t) {
		let n = this.domElement;
		if (this.object.isPerspectiveCamera) {
			let r = this.object.position;
			q.copy(r).sub(this.target);
			let i = q.length();
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
		this._rotateLeft(J * this._rotateDelta.x / t.clientHeight), this._rotateUp(J * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(J * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
				break;
			case this.keys.BOTTOM:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-J * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
				break;
			case this.keys.LEFT:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(J * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
				break;
			case this.keys.RIGHT: e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-J * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
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
		this._rotateLeft(J * this._rotateDelta.x / t.clientHeight), this._rotateUp(J * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
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
		t === void 0 && (t = new g(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
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
function ue(e) {
	this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.ownerDocument.addEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e), this._cursorStyle === "grab" && (this.domElement.style.cursor = "grabbing")));
}
function de(e) {
	this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function fe(e) {
	switch (this._removePointer(e), this._pointers.length) {
		case 0:
			this.domElement.releasePointerCapture(e.pointerId), this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(W), this.state = Y.NONE, this._cursorStyle === "grab" && (this.domElement.style.cursor = "grab");
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
function pe(e) {
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
		case E.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseDownDolly(e), this.state = Y.DOLLY;
			break;
		case E.ROTATE:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = Y.PAN;
			} else {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = Y.ROTATE;
			}
			break;
		case E.PAN:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = Y.ROTATE;
			} else {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = Y.PAN;
			}
			break;
		default: this.state = Y.NONE;
	}
	this.state !== Y.NONE && this.dispatchEvent(U);
}
function me(e) {
	switch (this.state) {
		case Y.ROTATE:
			if (this.enableRotate === !1) return;
			this._handleMouseMoveRotate(e);
			break;
		case Y.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseMoveDolly(e);
			break;
		case Y.PAN:
			if (this.enablePan === !1) return;
			this._handleMouseMovePan(e);
	}
}
function he(e) {
	this.enabled !== !1 && this.enableZoom !== !1 && this.state === Y.NONE && (e.preventDefault(), this.dispatchEvent(U), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(W));
}
function ge(e) {
	this.enabled !== !1 && this._handleKeyDown(e);
}
function _e(e) {
	switch (this._trackPointer(e), this._pointers.length) {
		case 1:
			switch (this.touches.ONE) {
				case B.ROTATE:
					if (this.enableRotate === !1) return;
					this._handleTouchStartRotate(e), this.state = Y.TOUCH_ROTATE;
					break;
				case B.PAN:
					if (this.enablePan === !1) return;
					this._handleTouchStartPan(e), this.state = Y.TOUCH_PAN;
					break;
				default: this.state = Y.NONE;
			}
			break;
		case 2:
			switch (this.touches.TWO) {
				case B.DOLLY_PAN:
					if (this.enableZoom === !1 && this.enablePan === !1) return;
					this._handleTouchStartDollyPan(e), this.state = Y.TOUCH_DOLLY_PAN;
					break;
				case B.DOLLY_ROTATE:
					if (this.enableZoom === !1 && this.enableRotate === !1) return;
					this._handleTouchStartDollyRotate(e), this.state = Y.TOUCH_DOLLY_ROTATE;
					break;
				default: this.state = Y.NONE;
			}
			break;
		default: this.state = Y.NONE;
	}
	this.state !== Y.NONE && this.dispatchEvent(U);
}
function ve(e) {
	switch (this._trackPointer(e), this.state) {
		case Y.TOUCH_ROTATE:
			if (this.enableRotate === !1) return;
			this._handleTouchMoveRotate(e), this.update();
			break;
		case Y.TOUCH_PAN:
			if (this.enablePan === !1) return;
			this._handleTouchMovePan(e), this.update();
			break;
		case Y.TOUCH_DOLLY_PAN:
			if (this.enableZoom === !1 && this.enablePan === !1) return;
			this._handleTouchMoveDollyPan(e), this.update();
			break;
		case Y.TOUCH_DOLLY_ROTATE:
			if (this.enableZoom === !1 && this.enableRotate === !1) return;
			this._handleTouchMoveDollyRotate(e), this.update();
			break;
		default: this.state = Y.NONE;
	}
}
function ye(e) {
	this.enabled !== !1 && e.preventDefault();
}
function be(e) {
	e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
function xe(e) {
	e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
//#endregion
//#region src/floorplan-renderer.ts
function Z(t, n, r = t.openings ?? [], i, a = []) {
	let o = new O(t.footprint.map(([e, t]) => new g(e - n.x, t + n.z))), s = new v(o, {
		depth: t.high - t.low,
		bevelEnabled: !1,
		steps: 1
	});
	s.rotateX(-Math.PI / 2), s.translate(0, t.low - n.y, 0);
	let c = r.filter((e) => e.kind === "open_wall");
	if (c.length) {
		let e = s.getAttribute("position"), r = s.getAttribute("normal"), i = [];
		for (let t = 0; t < e.count; t += 3) if (Math.abs(r.getY(t)) > .99) for (let n = 0; n < 3; n++) i.push(e.getX(t + n), e.getY(t + n), e.getZ(t + n));
		for (let e = 0; e < t.footprint.length; e++) {
			let r = t.footprint[e], a = t.footprint[(e + 1) % t.footprint.length], o = Math.hypot(a[0] - r[0], a[1] - r[1]), s = (a[0] - r[0]) / o, l = (a[1] - r[1]) / o, u = c.filter((e) => Math.abs((e.position[0] - r[0]) * l - (e.position[1] - r[1]) * s) < 1e-5 && Math.abs(Math.sin(e.yaw * Math.PI / 180) * s - Math.cos(e.yaw * Math.PI / 180) * l) < 1e-5).map((e) => {
				let n = (e.position[0] - r[0]) * s + (e.position[1] - r[1]) * l;
				return {
					left: Math.max(0, n - e.width / 2),
					right: Math.min(o, n + e.width / 2),
					low: Math.max(t.low, e.position[2]),
					high: Math.min(t.high, e.position[2] + e.height)
				};
			}).filter((e) => e.left < e.right && e.low < e.high), d = [.../* @__PURE__ */ new Set([
				0,
				o,
				...u.flatMap((e) => [e.left, e.right])
			])].sort((e, t) => e - t), f = [.../* @__PURE__ */ new Set([
				t.low,
				t.high,
				...u.flatMap((e) => [e.low, e.high])
			])].sort((e, t) => e - t);
			for (let e = 0; e < d.length - 1; e++) for (let t = 0; t < f.length - 1; t++) {
				let a = d[e], o = d[e + 1], c = f[t], p = f[t + 1];
				if (u.some((e) => (a + o) / 2 > e.left && (a + o) / 2 < e.right && (c + p) / 2 > e.low && (c + p) / 2 < e.high)) continue;
				let m = (e, t) => [
					r[0] + s * e - n.x,
					t - n.y,
					-r[1] - l * e - n.z
				];
				i.push(...m(a, c), ...m(o, c), ...m(o, p), ...m(a, c), ...m(o, p), ...m(a, p));
			}
		}
		s.setAttribute("position", new _(i, 3)), s.deleteAttribute("uv"), s.clearGroups(), s.deleteAttribute("normal"), s.computeVertexNormals();
	}
	if (Q(s, n, a), i) {
		let r = s.getAttribute("position");
		for (let a = 0; a < r.count; a++) {
			let o = Math.max(t.low, e(i, r.getX(a) + n.x, -r.getZ(a) - n.z) - .15);
			r.setY(a, Math.min(r.getY(a), o - n.y));
		}
		s.computeVertexNormals();
	}
	return s;
}
function Q(e, t, n) {
	if (!n.length) return;
	let r = e.index ? e.toNonIndexed() : e, a = r.getAttribute("position"), o = [];
	for (let e = 0; e < a.count; e += 3) {
		let r = a.getY(e), s = [1, 2].every((t) => Math.abs(a.getY(e + t) - r) < 1e-5) ? n.filter((e) => (e.kind === "chimney" ? e.position[2] <= r + t.y + 1e-5 : e.position[2] < r + t.y - 1e-5) && e.position[2] + e.height >= r + t.y - 1e-5) : [];
		if (!s.length) {
			for (let t = 0; t < 3; t++) o.push(a.getX(e + t), a.getY(e + t), a.getZ(e + t));
			continue;
		}
		let c = [[
			0,
			1,
			2
		].map((n) => [a.getX(e + n) + t.x, -a.getZ(e + n) - t.z])];
		for (let e of s) {
			let t = i(e), n = [];
			for (let e of c) {
				let r = e;
				for (let e = 0; e < 4 && r.length; e++) {
					let i = t[e], a = t[(e + 1) % 4], o = (e) => (a[0] - i[0]) * (e[1] - i[1]) - (a[1] - i[1]) * (e[0] - i[0]), s = (e) => {
						let t = [];
						for (let n = 0; n < r.length; n++) {
							let i = r[n], a = r[(n + 1) % r.length], s = o(i), c = o(a), l = e ? s >= 0 : s <= 0, u = e ? c >= 0 : c <= 0;
							if (l && t.push(i), l !== u) {
								let e = s / (s - c);
								t.push([i[0] + e * (a[0] - i[0]), i[1] + e * (a[1] - i[1])]);
							}
						}
						return t;
					}, c = s(!1), l = s(!0);
					c.length >= 3 && n.push(c), r = l;
				}
			}
			c = n;
		}
		for (let e of c) for (let n = 1; n < e.length - 1; n++) for (let i of [
			e[0],
			e[n],
			e[n + 1]
		]) o.push(i[0] - t.x, r, -i[1] - t.z);
	}
	e.setIndex(null), e.setAttribute("position", new _(o, 3)), e.deleteAttribute("uv"), e.clearGroups(), e.deleteAttribute("normal"), e.computeVertexNormals(), r !== e && r.dispose();
}
function $(e, t, n = []) {
	let r = new ie(new O(e.footprint.map(([e, n]) => new g(e - t.x, n + t.z))));
	if (r.rotateX(-Math.PI / 2), Q(r, new V(t.x, e.high ?? 0, t.z), n), n.length) {
		let e = r.getAttribute("position"), t = [];
		for (let n = 0; n < e.count; n++) t.push(e.getX(n), -e.getZ(n));
		r.setAttribute("uv", new _(t, 2));
	}
	return r;
}
function Se() {
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
	let t = new oe(e, 32, 32);
	return t.magFilter = t.minFilter = T, t.needsUpdate = !0, t;
}
var Ce = class {
	constructor(e, t, n, r, i, a) {
		this.host = e, this.select = t, this.fail = n, this.hover = r, this.place = i, this.orientation = a, this.scene = new ae(), this.camera = new F(38, 1, .01, 1e3), this.raycaster = new C(), this.volumes = [], this.boundsKey = "", this.origin = new V(), this.structures = [], this.markers = [], this.coverageRooms = [], this.doors = [], this.siteMeshes = [], this.radius = 1, this.options = s(), this.lastTick = 0, this.pauseUntil = 0, this.focusUntil = 0, this.focusDistance = 0, this.focusEvents = /* @__PURE__ */ new Map(), this.alertKey = "", this.lastSelected = "", this.lastFocus = 0, this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)"), this.disposed = !1, this.lost = !1, this.pointer = null, this.resize = () => {
			if (this.disposed) return;
			let e = Math.max(1, this.host.clientWidth), t = Math.max(1, this.host.clientHeight);
			this.camera.aspect = e / t, this.camera.updateProjectionMatrix(), this.renderer.setSize(e, t, !1), this.draw();
		}, this.draw = () => {
			!this.disposed && !this.lost && document.visibilityState === "visible" && (this.renderer.render(this.scene, this.camera), this.orientation?.([...this.camera.matrixWorldInverse.elements]));
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
					let e = Date.now() > this.focusUntil, n = e ? new V() : this.focusTarget, r = this.camera.position.clone().sub(this.controls.target), i = e ? this.fitDistance() : this.focusDistance;
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
					this.raycaster.setFromCamera(new g((e.clientX - t.left) / t.width * 2 - 1, -(e.clientY - t.top) / t.height * 2 + 1), this.camera);
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
			if (this.raycaster.setFromCamera(new g((e.clientX - n.left) / n.width * 2 - 1, -(e.clientY - n.top) / n.height * 2 + 1), this.camera), this.placementHeight !== void 0 && this.place) {
				let e = this.raycaster.ray.intersectPlane(new z(new V(0, 1, 0), this.origin.y - this.placementHeight), new V());
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
		}, this.renderer = new se({
			antialias: !0,
			alpha: !0
		}), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), this.renderer.setClearColor(0, 0);
		let o = this.renderer.domElement;
		o.style.width = "100%", o.style.height = "100%", o.style.display = "block", o.setAttribute("aria-label", "3D house. Drag to rotate; use the camera controls and group list for keyboard access."), o.setAttribute("role", "img"), this.host.append(o), this.controls = new le(this.camera, o), this.controls.enableDamping = !1, this.controls.maxPolarAngle = Math.PI * .49, this.controls.addEventListener("change", this.draw), this.controls.addEventListener("start", this.pauseMotion), document.addEventListener("visibilitychange", this.scheduleMotion), this.reduced?.addEventListener("change", this.scheduleMotion), o.addEventListener("pointerdown", this.onPointerDown), o.addEventListener("pointermove", this.onPointerMove), o.addEventListener("pointerup", this.onPointerUp), o.addEventListener("pointercancel", this.onPointerCancel), o.addEventListener("pointerleave", this.onPointerLeave), o.addEventListener("webglcontextlost", this.onContextLost), this.observer = new ResizeObserver(this.resize), this.observer.observe(e), this.resize();
	}
	setParts(n, r, a, o, s) {
		if (this.clearParts(), this.coverageRooms = n.filter((e) => !e.container), this.focusTarget = void 0, this.focusEvents.clear(), !n.length && !a?.features.length) {
			this.draw();
			return;
		}
		let c = new R();
		for (let e of n) for (let [t, n] of e.footprint) c.expandByPoint(new V(t, e.low, -n)), c.expandByPoint(new V(t, e.high, -n));
		let l = s ?? n.flatMap((e) => e.architecture ?? []), u = n.flatMap((e) => e.openings ?? []);
		for (let e of l) for (let [t, n] of i(e)) c.expandByPoint(new V(t, e.position[2], -n)), c.expandByPoint(new V(t, f(e.kind) ? e.position[2] - (e.drop ?? 0) - e.height : e.position[2] + e.height, -n));
		r ??= a?.ground_z;
		for (let e of a?.features ?? []) for (let [t, n] of e.points) c.expandByPoint(new V(t, a.ground_z, -n));
		r !== void 0 && (c.expandByPoint(new V(c.min.x, r, c.min.z)), c.expandByPoint(new V(c.max.x, r, c.max.z)));
		let d = n.find((e) => e.id === o), p = d ? new R().setFromPoints(d.footprint.flatMap(([e, t]) => [new V(e, d.low, -t), new V(e, d.high, -t)])) : c, m = JSON.stringify([
			p.min.toArray(),
			p.max.toArray(),
			o
		]), g = this.boundsKey !== m;
		this.boundsKey = m;
		let v = p.getCenter(new V());
		this.origin.copy(v), this.radius = Math.max(p.getSize(new V()).length() / 2, .1);
		for (let r of n) {
			let n = l.find((e) => e.kind === "stairs" && e.under_room === r.id), i = Z(r, v, u, n, l.filter((e) => e.kind === "stairs" && e.under_room !== r.id || e.kind === "chimney" && !!e.floors?.some((e) => e === r.id || r.ancestors.includes(e)))), a = new L(i, new S({
				color: 6342885,
				transparent: !0,
				opacity: .025,
				side: 2,
				depthWrite: !1
			})), o = new w(new h(i), new y({
				color: 9545396,
				transparent: !0,
				opacity: .4,
				depthWrite: !1
			}));
			r.container && (a.material.opacity = 0), this.scene.add(a, o);
			let s = r.low - v.y, c = {
				part: r,
				mesh: a,
				edges: o,
				targetColor: new re(),
				targetOpacity: .015
			};
			if (a.material.opacity = 0, !r.container) {
				if (c.liquid = new L(i.clone(), new S({
					transparent: !0,
					opacity: .015,
					side: 2,
					depthWrite: !1
				})), c.ceiling = new L($(r, v, l.filter((e) => e.kind === "stairs" && e.under_room !== r.id || e.kind === "chimney" && !!e.floors?.some((e) => e === r.id || r.ancestors.includes(e)))), new S({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1
				})), c.ceiling.position.y = r.high - v.y, n) {
					let t = c.ceiling.geometry.getAttribute("position");
					for (let i = 0; i < t.count; i++) t.setY(i, Math.max(r.low, e(n, t.getX(i) + v.x, -t.getZ(i) - v.z) - .15) - r.high);
					c.ceiling.geometry.computeVertexNormals();
				}
				let t = c.ceiling.geometry;
				t.computeBoundingBox();
				let a = t.boundingBox, o = t.getAttribute("position"), u = t.getAttribute("uv");
				for (let e = 0; e < u.count; e++) u.setXY(e, (o.getX(e) - a.min.x) / (a.max.x - a.min.x), (o.getZ(e) - a.min.z) / (a.max.z - a.min.z));
				c.ceiling.material.map = Se();
				let d = i.clone(), f = d.getAttribute("position"), p = [];
				for (let e = 0; e < f.count; e++) {
					let t = Math.max(0, Math.min(1, (f.getY(e) - s) / (r.high - r.low)));
					p.push(1, 1, 1, t * t);
				}
				d.setAttribute("color", new _(p, 4)), c.wash = new L(d, new S({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1,
					vertexColors: !0
				})), c.liquid.name = "activity-volume", c.ceiling.name = "light-ceiling", c.wash.name = "light-wash", c.liquid.visible = !1, this.scene.add(c.liquid, c.ceiling, c.wash);
			}
			this.volumes.push(c);
			for (let e of r.fixtures ?? []) {
				let n = new L(e.kind === "window" ? new N(e.width ?? 1, e.height ?? 1.2, .06) : new A(Math.min(.15, Math.max(this.radius * .008, .06)), 12, 8), new S({
					color: 8572379,
					transparent: !0,
					opacity: e.kind === "window" ? .35 : 1
				}));
				e.kind === "window" && (n.rotation.y = e.yaw * Math.PI / 180), n.position.set(e.position[0] - v.x, e.position[2] - v.y, -e.position[1] - v.z), n.name = e.kind === "window" ? "room-window" : "room-fixture", this.scene.add(n);
				let i, a;
				e.range > 0 && (e.kind === "motion" || e.kind === "occupancy") && (i = new L(new I(), new S({
					color: 5486286,
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1
				})), a = new w(new I(), new x({
					color: 5486286,
					dashSize: .06,
					gapSize: .08,
					transparent: !0,
					opacity: .65,
					depthWrite: !1
				})), i.name = "sensor-coverage", a.name = "sensor-boundary", this.scene.add(i, a)), e.kind === "window" && (a = new w(new h(n.geometry), new x({
					color: 5486286,
					dashSize: 1,
					gapSize: 0,
					transparent: !0,
					opacity: .65,
					depthWrite: !1
				})), a.computeLineDistances(), a.position.copy(n.position), a.quaternion.copy(n.quaternion), a.name = "window-boundary", this.scene.add(a)), this.markers.push({
					room: r.id,
					fixture: e,
					marker: n,
					coverage: i,
					boundary: a,
					invalid: e.kind === "window" && !t({
						points: r.footprint,
						bounds: [[
							0,
							0,
							r.low
						], [
							0,
							0,
							r.high
						]]
					}, e)
				});
			}
		}
		for (let e of l) {
			let t = e.yaw * Math.PI / 180, n = Math.cos(t), r = Math.sin(t), i = (i, a, o, s = 0) => {
				if (a <= 0 || o <= 0) return;
				let c = new L(new N(e.width, o, a), new S({
					color: e.kind === "stairs" ? 7837602 : 7041143,
					transparent: !0,
					opacity: .72
				}));
				c.rotation.y = t, c.position.set(e.position[0] + e.width / 2 * n - (i + a / 2) * r - v.x, e.position[2] + s + o / 2 - v.y, -e.position[1] - e.width / 2 * r - (i + a / 2) * n - v.z), c.name = e.kind === "stairs" ? "stair-step" : "architectural-solid", this.structures.push(c), this.scene.add(c);
			};
			if (f(e.kind)) {
				let i = e.position[0] + e.width / 2 * n - e.run / 2 * r - v.x, a = -e.position[1] - e.width / 2 * r - e.run / 2 * n - v.z, o = e.position[2] - v.y, s = e.drop ?? 0, c = (t, n, r, o) => {
					let s = new L(t, new S({
						color: r,
						transparent: !0,
						opacity: .9
					}));
					return s.position.set(i, n, a), s.name = o, s.userData.entity = e.entity, s.userData.baseColor = r, this.structures.push(s), this.scene.add(s), s;
				};
				s > 0 && c(new M(.012, .012, s, 8), o - s / 2, 6648958, "ceiling-stem");
				let l = o - s - e.height / 2, u = Math.min(e.width, e.run) / 2;
				if (e.kind === "ceiling_fan") {
					c(new M(.09, .09, e.height, 16), l, 10137013, "ceiling-fan-hub");
					for (let e = 0; e < 4; e++) {
						let n = t + e * Math.PI / 2, r = c(new N(u * .85, .025, .12), l, 7441304, "ceiling-fan-blade");
						r.position.x += Math.cos(n) * u * .52, r.position.z -= Math.sin(n) * u * .52, r.rotation.y = n;
					}
				} else if (e.kind === "pendant_light") {
					let t = e.shape ?? "globe", n = c(t === "cone" ? new j(u, e.height, 24) : t === "cylinder" ? new M(u, u, e.height, 24) : new A(1, 24, 12), l, 16767121, "pendant-light");
					t === "globe" && n.scale.set(e.width / 2, e.height / 2, e.run / 2);
				} else c(new M(u, u, e.height, 24), l, e.kind === "recessed_light" ? 16770476 : 8031638, e.kind), e.kind === "recessed_speaker" && c(new M(u * .8, u * .8, .005, 24), l - e.height / 2 - .003, 3425612, "speaker-grille");
			} else if (e.kind !== "stairs") i(0, e.run, e.height);
			else {
				let a = (e.run - e.landing_bottom - e.landing_top) / e.steps;
				for (let i = 0; i < e.steps; i++) {
					let o = e.height * (i + 1) / e.steps, s = e.landing_bottom + i * a, c = new L(new N(e.width, .12, a), new S({
						color: 7837602,
						transparent: !0,
						opacity: .8
					}));
					c.rotation.y = t, c.position.set(e.position[0] + e.width / 2 * n - (s + a / 2) * r - v.x, e.position[2] + o - .06 - v.y, -e.position[1] - e.width / 2 * r - (s + a / 2) * n - v.z), c.name = "stair-step", this.structures.push(c), this.scene.add(c);
				}
				i(0, e.landing_bottom, .12), i(e.run - e.landing_top, e.landing_top, .12, e.height - .12);
			}
		}
		for (let e of this.coverageRooms) for (let t of e.openings ?? []) {
			let n = new L(new I(), new S({
				color: 7917245,
				transparent: !0,
				opacity: .22,
				side: 2,
				depthWrite: !1
			})), r = new w(new I(), new y({
				color: 8907464,
				transparent: !0,
				opacity: .8,
				depthWrite: !1
			})), i = new w(new I(), new y({
				color: 8907464,
				transparent: !0,
				opacity: .35,
				depthWrite: !1
			}));
			n.name = "door-leaf", r.name = "opening-frame", i.name = "door-swing", this.doors.push({
				part: e,
				opening: t,
				leaf: n,
				frame: r,
				arc: i
			}), this.scene.add(n, r, i);
		}
		let b = {
			property: 4345924,
			lawn: 5270336,
			driveway: 6910329,
			path: 9273449,
			pool: 3570843
		};
		[...a?.features ?? []].sort((e, t) => Number(t.kind === "property") - Number(e.kind === "property")).forEach((e, t) => {
			let n = $({ footprint: e.points }, v), r = new L(n, new S({
				color: b[e.kind],
				side: 2,
				transparent: !0,
				opacity: .5,
				depthWrite: !1
			}));
			r.position.y = a.ground_z - v.y + t * .002, r.name = "site-feature", this.scene.add(r), this.siteMeshes.push(r);
		}), this.grid = new ne(this.radius * 2.8, 16, 6914446, 6914446), this.grid.position.y = (r ?? c.min.y - this.radius * .015) - v.y, r !== void 0 && (this.ground = new L(new te(this.radius * 2.8, this.radius * 2.8), new S({
			color: 7700874,
			transparent: !0,
			opacity: 0,
			side: 2,
			depthWrite: !1
		})), this.ground.rotation.x = -Math.PI / 2, this.ground.position.y = this.grid.position.y, this.scene.add(this.ground)), this.grid.material.transparent = !0, this.grid.material.opacity = .14, this.scene.add(this.grid), this.camera.near = Math.max(this.radius / 1e3, .001), this.camera.far = this.radius * 100, this.controls.minDistance = this.radius * .1, this.controls.maxDistance = this.radius * 30, g ? (this.cameraAction("reset"), this.pauseUntil = 0) : this.draw();
	}
	setActivity(e, t, i, a = s(), o = {}, d, f = {}) {
		for (let e of this.structures) if (e.userData.entity) {
			let t = f[e.userData.entity]?.state;
			e.material.color.set(t === "on" ? 16764514 : e.userData.baseColor);
		}
		i !== this.lastSelected && (this.pauseMotion(), this.lastSelected = i), this.options = a, a.focus_activity || (this.focusTarget = void 0);
		for (let n of this.volumes) {
			let { part: s, edges: c, liquid: l, ceiling: f, wash: p } = n, m = r(e, s.id, t), h = s.id === i || s.ancestors.includes(i), g = d && (!d.group || s.id === d.group || s.ancestors.includes(d.group));
			if (c.material.color.set(g && d.color ? d.color : h ? "#d7e8f1" : "#8596a1"), c.material.opacity = h || g ? .9 : s.container ? .07 : .24, !l || !f || !p) continue;
			let _ = l.visible, v = m.status === "stale" ? 0 : m.ratio;
			if (l.visible = v !== null, v !== null) {
				let e = m.status === "stale" ? 0 : m.value;
				n.targetColor.set(u(e, a)), n.targetOpacity = .015 + .225 * Math.min(1, Math.max(0, e / 5)), (!_ || this.reduced?.matches) && (l.material.color.copy(n.targetColor), l.material.opacity = n.targetOpacity), this.updateColor(n, 0);
			}
			let y = o[s.id], b = a.light_fill ? (y?.brightness ?? 0) * a.fill_brightness : 0;
			f.material.color.setRGB(...y?.rgb ?? [
				0,
				0,
				0
			]), p.material.color.copy(f.material.color), f.material.opacity = Math.min(1, b * 3), p.material.opacity = b * .25, f.visible = p.visible = b > 0;
		}
		let h = this.lastFocus, g = d ? `${d.entity}:${d.state}:${d.group ?? ""}` : "", v = g && g !== this.alertKey ? this.volumes.find((e) => e.part.id === d?.group) : void 0, y = [];
		for (let n of this.volumes) {
			let i = e?.groups[n.part.id]?.last_activity;
			if (i != null && Number.isFinite(i)) {
				let a = this.focusEvents.get(n.part.id);
				this.focusEvents.set(n.part.id, i), !n.part.container && a !== void 0 && i > a && t - i < 10 && r(e, n.part.id, t).status === "live" && y.push({
					volume: n,
					event: i
				});
			}
		}
		d || (v ??= y.sort((e, t) => t.event - e.event)[0]?.volume);
		let b;
		if (g && g !== this.alertKey) {
			let e = this.volumes.filter((e) => !d?.group || e.part.id === d.group || e.part.ancestors.includes(d.group));
			if (e.length) {
				b = new R();
				for (let { mesh: t } of e) t.geometry.computeBoundingBox(), b.union(t.geometry.boundingBox);
			}
		}
		if (this.alertKey = g, (v || b) && a.focus_activity && !this.reduced?.matches && Date.now() >= this.pauseUntil && (g || t - this.lastFocus >= 12)) {
			v?.mesh.geometry.computeBoundingBox();
			let e = b ?? v.mesh.geometry.boundingBox;
			this.focusTarget = e.getCenter(new V()), this.focusDistance = Math.min(this.fitDistance(), Math.max(e.getSize(new V()).length() * 2, this.radius)), this.focusUntil = Date.now() + 8e3, this.lastFocus = t;
		}
		let x = JSON.stringify(this.coverageRooms.flatMap((e) => (e.openings ?? []).map((e) => c(e, f))));
		for (let e of this.doors) this.updateDoor(e, f);
		let S;
		for (let e of this.markers) {
			let t = f[e.fixture.entity], n = t?.state === "on" || t?.state === "off", r = t?.state === "on", i = p(e.fixture.kind, t?.state);
			if (e.invalid && (i.color = "#ff3535"), e.marker.material.color.set(i.color), e.fixture.kind === "light" && r) {
				let t = l([e.fixture.entity], f);
				e.marker.material.color.setRGB(...t.rgb);
			}
			if (e.coverage && e.boundary && e.coverageKey !== x) {
				let t = [], n = [], r = (e) => [
					e[0] - this.origin.x,
					e[2] - this.origin.y,
					-e[1] - this.origin.z
				];
				for (let i of m(e.fixture, this.coverageRooms, f)) for (let e = 0; e < i.rim.length; e++) {
					let a = i.rim[e], o = i.rim[(e + 1) % i.rim.length];
					t.push(...r(i.origin), ...r(a), ...r(o), ...r(i.center), ...r(o), ...r(a)), n.push(...r(a), ...r(o)), e % 8 == 0 && n.push(...r(i.origin), ...r(a));
				}
				e.coverage.geometry.dispose(), e.boundary.geometry.dispose(), e.coverage.geometry = new I().setAttribute("position", new _(t, 3)), e.boundary.geometry = new I().setAttribute("position", new _(n, 3)), e.boundary.computeLineDistances(), e.coverageKey = x;
			}
			e.coverage && (e.coverage.material.color.copy(e.marker.material.color), e.coverage.material.opacity = i.opacity), e.boundary && (e.boundary.material.color.set(i.color), e.boundary.material.opacity = n ? .65 : .25), (e.fixture.kind === "motion" || e.fixture.kind === "occupancy") && e.previous === "off" && r && (S = e), e.previous = t?.state;
		}
		if (S && a.focus_activity && !d && !this.reduced?.matches && Date.now() >= this.pauseUntil && t - h >= 12) {
			let e = new V(...n(S.fixture));
			this.focusTarget = S.marker.position.clone().addScaledVector(e, Math.min(S.fixture.range, 3) * .5), this.focusDistance = Math.max(this.radius * .6, 2), this.focusUntil = Date.now() + 8e3, this.lastFocus = t;
		}
		this.scheduleMotion(), this.draw();
	}
	updateDoor(e, t) {
		let n = c(e.opening, t), r = d(e.opening, t), i = `${n}:${r}`;
		if (e.key === i) return;
		e.key = i;
		let s = e.part, l = e.opening, u = {
			points: s.footprint,
			bounds: [[
				Math.min(...s.footprint.map((e) => e[0])),
				Math.min(...s.footprint.map((e) => e[1])),
				s.low
			], [
				Math.max(...s.footprint.map((e) => e[0])),
				Math.max(...s.footprint.map((e) => e[1])),
				s.high
			]]
		}, f = !a(u, l) || r === "on" ? 16725301 : r === "unknown" ? 8030096 : 5486286;
		e.frame.material.color.setHex(f), e.leaf.material.color.setHex(f), e.arc.material.color.setHex(f);
		let p = o(u, l), m = n ? p.open : p.closed, h = (e, t) => [
			e[0] - this.origin.x,
			t - this.origin.y,
			-e[1] - this.origin.z
		], g = l.position[2], v = g + l.height, y = h(p.hinge, g), b = h(p.closed, g), x = h(p.closed, v), S = h(p.hinge, v), C = h(m, g), w = h(m, v);
		e.frame.geometry.dispose(), e.leaf.geometry.dispose(), e.arc.geometry.dispose(), e.frame.geometry = new I().setAttribute("position", new _([
			...y,
			...b,
			...b,
			...x,
			...x,
			...S,
			...S,
			...y
		], 3)), e.leaf.geometry = new I().setAttribute("position", new _([
			...y,
			...C,
			...w,
			...y,
			...w,
			...S
		], 3)), e.leaf.visible = l.kind !== "open_wall";
		let T = Math.atan2(p.closed[1] - p.hinge[1], p.closed[0] - p.hinge[0]), E = Math.atan2(p.open[1] - p.hinge[1], p.open[0] - p.hinge[0]), D = Math.atan2(Math.sin(E - T), Math.cos(E - T)), O = [];
		for (let e = 0; e < 16; e++) for (let t of [e / 16, (e + 1) / 16]) O.push(...h([p.hinge[0] + l.width * Math.cos(T + D * t), p.hinge[1] + l.width * Math.sin(T + D * t)], g + .01));
		e.arc.geometry = new I().setAttribute("position", new _(O, 3)), e.arc.visible = l.kind !== "open_wall" && l.kind !== "window";
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
			let i = e === "top" ? new V(0, 1, 1e-4) : new V(1, .8, 1);
			this.camera.position.copy(i.normalize().multiplyScalar(r)), this.camera.updateProjectionMatrix();
		} else e === "left" || e === "right" ? this.controls.rotateLeft(e === "left" ? .2 : -.2) : e === "up" || e === "down" ? this.controls.rotateUp(e === "up" ? .15 : -.15) : e === "in" ? this.controls.dollyIn(1 / 1.2) : this.controls.dollyOut(1 / 1.2);
		this.controls.update(), this.draw();
	}
	clearParts() {
		for (let e of this.structures) this.scene.remove(e), e.geometry.dispose(), e.material.dispose();
		this.structures = [];
		for (let e of this.markers) for (let t of [
			e.marker,
			e.coverage,
			e.boundary
		]) t && (this.scene.remove(t), t.geometry.dispose(), t.material.dispose());
		this.markers = [];
		for (let e of this.doors) for (let t of [
			e.leaf,
			e.frame,
			e.arc
		]) this.scene.remove(t), t.geometry.dispose(), t.material.dispose();
		this.doors = [];
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
export { Ce as FloorplanRenderer };
