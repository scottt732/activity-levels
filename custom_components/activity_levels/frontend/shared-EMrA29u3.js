import { a as e, g as t, h as n, i as r, n as i, o as a, r as o, s } from "./shared-DmvPhSzT.js";
import { n as c } from "./shared-IIYdNIav.js";
import { F as l, G as u, H as d, I as f, K as p, N as m, P as h, Sn as g, T as _, Ut as v, V as y, Wt as b, _ as x, cn as S, d as C, et as w, i as T, in as E, k as D, l as O, nt as k, o as A, on as j, r as M, rn as N, rt as P, sn as F, tn as ee, tt as I, w as L, x as R, xn as z } from "./shared-DVWk8t-w.js";
import { t as te } from "./shared-mmljZPXC.js";
//#region node_modules/.pnpm/three@0.185.1/node_modules/three/examples/jsm/controls/OrbitControls.js
var B = { type: "change" }, V = { type: "start" }, H = { type: "end" }, U = new v(), W = new I(), G = Math.cos(70 * d.DEG2RAD), K = new g(), q = 2 * Math.PI, J = {
	NONE: -1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
}, Y = 1e-6, X = class extends C {
	constructor(e, t = null) {
		super(e, t), this.state = J.NONE, this.target = new g(), this.cursor = new g(), this.minDistance = 0, this.maxDistance = Infinity, this.minZoom = 0, this.maxZoom = Infinity, this.minTargetRadius = 0, this.maxTargetRadius = Infinity, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -Infinity, this.maxAzimuthAngle = Infinity, this.enableDamping = !1, this.dampingFactor = .05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
			LEFT: "ArrowLeft",
			UP: "ArrowUp",
			RIGHT: "ArrowRight",
			BOTTOM: "ArrowDown"
		}, this.mouseButtons = {
			LEFT: y.ROTATE,
			MIDDLE: y.DOLLY,
			RIGHT: y.PAN
		}, this.touches = {
			ONE: S.ROTATE,
			TWO: S.DOLLY_PAN
		}, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._cursorStyle = "auto", this._domElementKeyEvents = null, this._lastPosition = new g(), this._lastQuaternion = new P(), this._lastTargetPosition = new g(), this._quat = new P().setFromUnitVectors(e.up, new g(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new F(), this._sphericalDelta = new F(), this._scale = 1, this._panOffset = new g(), this._rotateStart = new z(), this._rotateEnd = new z(), this._rotateDelta = new z(), this._panStart = new z(), this._panEnd = new z(), this._panDelta = new z(), this._dollyStart = new z(), this._dollyEnd = new z(), this._dollyDelta = new z(), this._dollyDirection = new g(), this._mouse = new z(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = ne.bind(this), this._onPointerDown = Z.bind(this), this._onPointerUp = re.bind(this), this._onContextMenu = Q.bind(this), this._onMouseWheel = oe.bind(this), this._onKeyDown = se.bind(this), this._onTouchStart = ce.bind(this), this._onTouchMove = le.bind(this), this._onMouseDown = ie.bind(this), this._onMouseMove = ae.bind(this), this._interceptControlDown = ue.bind(this), this._interceptControlUp = de.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
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
		this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(B), this.update(), this.state = J.NONE;
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
		K.copy(t).sub(this.target), K.applyQuaternion(this._quat), this._spherical.setFromVector3(K), this.autoRotate && this.state === J.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
		let n = this.minAzimuthAngle, r = this.maxAzimuthAngle;
		isFinite(n) && isFinite(r) && (n < -Math.PI ? n += q : n > Math.PI && (n -= q), r < -Math.PI ? r += q : r > Math.PI && (r -= q), n <= r ? this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + r) / 2 ? Math.max(n, this._spherical.theta) : Math.min(r, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
		let i = !1;
		if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
		else {
			let e = this._spherical.radius;
			this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), i = e != this._spherical.radius;
		}
		if (K.setFromSpherical(this._spherical), K.applyQuaternion(this._quatInverse), t.copy(this.target).add(K), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
			let e = null;
			if (this.object.isPerspectiveCamera) {
				let t = K.length();
				e = this._clampDistance(t * this._scale);
				let n = t - e;
				this.object.position.addScaledVector(this._dollyDirection, n), this.object.updateMatrixWorld(), i = !!n;
			} else if (this.object.isOrthographicCamera) {
				let t = new g(this._mouse.x, this._mouse.y, 0);
				t.unproject(this.object);
				let n = this.object.zoom;
				this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), i = n !== this.object.zoom;
				let r = new g(this._mouse.x, this._mouse.y, 0);
				r.unproject(this.object), this.object.position.sub(r).add(t), this.object.updateMatrixWorld(), e = K.length();
			} else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
			e !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position) : (U.origin.copy(this.object.position), U.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(U.direction)) < G ? this.object.lookAt(this.target) : (W.setFromNormalAndCoplanarPoint(this.object.up, this.target), U.intersectPlane(W, this.target))));
		} else if (this.object.isOrthographicCamera) {
			let e = this.object.zoom;
			this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), e !== this.object.zoom && (this.object.updateProjectionMatrix(), i = !0);
		}
		return this._scale = 1, this._performCursorZoom = !1, i || this._lastPosition.distanceToSquared(this.object.position) > Y || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Y || this._lastTargetPosition.distanceToSquared(this.target) > Y ? (this.dispatchEvent(B), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
	}
	_getAutoRotationAngle(e) {
		return e === null ? q / 60 / 60 * this.autoRotateSpeed : q / 60 * this.autoRotateSpeed * e;
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
		K.setFromMatrixColumn(t, 0), K.multiplyScalar(-e), this._panOffset.add(K);
	}
	_panUp(e, t) {
		this.screenSpacePanning === !0 ? K.setFromMatrixColumn(t, 1) : (K.setFromMatrixColumn(t, 0), K.crossVectors(this.object.up, K)), K.multiplyScalar(e), this._panOffset.add(K);
	}
	_pan(e, t) {
		let n = this.domElement;
		if (this.object.isPerspectiveCamera) {
			let r = this.object.position;
			K.copy(r).sub(this.target);
			let i = K.length();
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
		this._rotateLeft(q * this._rotateDelta.x / t.clientHeight), this._rotateUp(q * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(q * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
				break;
			case this.keys.BOTTOM:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-q * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
				break;
			case this.keys.LEFT:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(q * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
				break;
			case this.keys.RIGHT: e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-q * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
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
		this._rotateLeft(q * this._rotateDelta.x / t.clientHeight), this._rotateUp(q * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
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
		t === void 0 && (t = new z(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
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
function Z(e) {
	this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.ownerDocument.addEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e), this._cursorStyle === "grab" && (this.domElement.style.cursor = "grabbing")));
}
function ne(e) {
	this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function re(e) {
	switch (this._removePointer(e), this._pointers.length) {
		case 0:
			this.domElement.releasePointerCapture(e.pointerId), this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(H), this.state = J.NONE, this._cursorStyle === "grab" && (this.domElement.style.cursor = "grab");
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
function ie(e) {
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
		case y.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseDownDolly(e), this.state = J.DOLLY;
			break;
		case y.ROTATE:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = J.PAN;
			} else {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = J.ROTATE;
			}
			break;
		case y.PAN:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = J.ROTATE;
			} else {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = J.PAN;
			}
			break;
		default: this.state = J.NONE;
	}
	this.state !== J.NONE && this.dispatchEvent(V);
}
function ae(e) {
	switch (this.state) {
		case J.ROTATE:
			if (this.enableRotate === !1) return;
			this._handleMouseMoveRotate(e);
			break;
		case J.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseMoveDolly(e);
			break;
		case J.PAN:
			if (this.enablePan === !1) return;
			this._handleMouseMovePan(e);
	}
}
function oe(e) {
	this.enabled !== !1 && this.enableZoom !== !1 && this.state === J.NONE && (e.preventDefault(), this.dispatchEvent(V), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(H));
}
function se(e) {
	this.enabled !== !1 && this._handleKeyDown(e);
}
function ce(e) {
	switch (this._trackPointer(e), this._pointers.length) {
		case 1:
			switch (this.touches.ONE) {
				case S.ROTATE:
					if (this.enableRotate === !1) return;
					this._handleTouchStartRotate(e), this.state = J.TOUCH_ROTATE;
					break;
				case S.PAN:
					if (this.enablePan === !1) return;
					this._handleTouchStartPan(e), this.state = J.TOUCH_PAN;
					break;
				default: this.state = J.NONE;
			}
			break;
		case 2:
			switch (this.touches.TWO) {
				case S.DOLLY_PAN:
					if (this.enableZoom === !1 && this.enablePan === !1) return;
					this._handleTouchStartDollyPan(e), this.state = J.TOUCH_DOLLY_PAN;
					break;
				case S.DOLLY_ROTATE:
					if (this.enableZoom === !1 && this.enableRotate === !1) return;
					this._handleTouchStartDollyRotate(e), this.state = J.TOUCH_DOLLY_ROTATE;
					break;
				default: this.state = J.NONE;
			}
			break;
		default: this.state = J.NONE;
	}
	this.state !== J.NONE && this.dispatchEvent(V);
}
function le(e) {
	switch (this._trackPointer(e), this.state) {
		case J.TOUCH_ROTATE:
			if (this.enableRotate === !1) return;
			this._handleTouchMoveRotate(e), this.update();
			break;
		case J.TOUCH_PAN:
			if (this.enablePan === !1) return;
			this._handleTouchMovePan(e), this.update();
			break;
		case J.TOUCH_DOLLY_PAN:
			if (this.enableZoom === !1 && this.enablePan === !1) return;
			this._handleTouchMoveDollyPan(e), this.update();
			break;
		case J.TOUCH_DOLLY_ROTATE:
			if (this.enableZoom === !1 && this.enableRotate === !1) return;
			this._handleTouchMoveDollyRotate(e), this.update();
			break;
		default: this.state = J.NONE;
	}
}
function Q(e) {
	this.enabled !== !1 && e.preventDefault();
}
function ue(e) {
	e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
function de(e) {
	e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
//#endregion
//#region src/floorplan-renderer.ts
function fe(e, t) {
	let n = new N(e.footprint.map(([e, n]) => new z(e - t.x, n + t.z))), r = new L(n, {
		depth: e.high - e.low,
		bevelEnabled: !1,
		steps: 1
	});
	return r.rotateX(-Math.PI / 2), r.translate(0, e.low - t.y, 0), r;
}
function $(e, t) {
	let n = new E(new N(e.footprint.map(([e, n]) => new z(e - t.x, n + t.z))));
	return n.rotateX(-Math.PI / 2), n;
}
function pe() {
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
	let t = new x(e, 32, 32);
	return t.magFilter = t.minFilter = f, t.needsUpdate = !0, t;
}
var me = class {
	constructor(e, t, n, i, a) {
		this.host = e, this.select = t, this.fail = n, this.hover = i, this.place = a, this.scene = new ee(), this.camera = new w(38, 1, .01, 1e3), this.raycaster = new b(), this.volumes = [], this.boundsKey = "", this.origin = new g(), this.markers = [], this.coverageRooms = [], this.doors = [], this.siteMeshes = [], this.radius = 1, this.options = r(), this.lastTick = 0, this.pauseUntil = 0, this.focusUntil = 0, this.focusDistance = 0, this.focusEvents = /* @__PURE__ */ new Map(), this.alertKey = "", this.lastSelected = "", this.lastFocus = 0, this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)"), this.disposed = !1, this.lost = !1, this.pointer = null, this.resize = () => {
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
		}, this.onPointerLeave = () => {
			this.hover?.("");
		}, this.onPointerMove = (e) => {
			if (!this.pointer && this.hover) {
				let t = this.renderer.domElement.getBoundingClientRect();
				if (t.width && t.height) {
					this.raycaster.setFromCamera(new z((e.clientX - t.left) / t.width * 2 - 1, -(e.clientY - t.top) / t.height * 2 + 1), this.camera);
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
			if (this.raycaster.setFromCamera(new z((e.clientX - n.left) / n.width * 2 - 1, -(e.clientY - n.top) / n.height * 2 + 1), this.camera), this.placementHeight !== void 0 && this.place) {
				let e = this.raycaster.ray.intersectPlane(new I(new g(0, 1, 0), this.origin.y - this.placementHeight), new g());
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
		}, this.renderer = new te({
			antialias: !0,
			alpha: !0
		}), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), this.renderer.setClearColor(0, 0);
		let o = this.renderer.domElement;
		o.style.width = "100%", o.style.height = "100%", o.style.display = "block", o.setAttribute("aria-label", "3D house. Drag to rotate; use the camera controls and group list for keyboard access."), o.setAttribute("role", "img"), this.host.append(o), this.controls = new X(this.camera, o), this.controls.enableDamping = !1, this.controls.maxPolarAngle = Math.PI * .49, this.controls.addEventListener("change", this.draw), this.controls.addEventListener("start", this.pauseMotion), document.addEventListener("visibilitychange", this.scheduleMotion), this.reduced?.addEventListener("change", this.scheduleMotion), o.addEventListener("pointerdown", this.onPointerDown), o.addEventListener("pointermove", this.onPointerMove), o.addEventListener("pointerup", this.onPointerUp), o.addEventListener("pointercancel", this.onPointerCancel), o.addEventListener("pointerleave", this.onPointerLeave), o.addEventListener("webglcontextlost", this.onContextLost), this.observer = new ResizeObserver(this.resize), this.observer.observe(e), this.resize();
	}
	setParts(e, t, n, r) {
		if (this.clearParts(), this.coverageRooms = e.filter((e) => !e.container), this.focusTarget = void 0, this.focusEvents.clear(), !e.length && !n?.features.length) {
			this.draw();
			return;
		}
		let i = new M();
		for (let t of e) for (let [e, n] of t.footprint) i.expandByPoint(new g(e, t.low, -n)), i.expandByPoint(new g(e, t.high, -n));
		t ??= n?.ground_z;
		for (let e of n?.features ?? []) for (let [t, r] of e.points) i.expandByPoint(new g(t, n.ground_z, -r));
		t !== void 0 && (i.expandByPoint(new g(i.min.x, t, i.min.z)), i.expandByPoint(new g(i.max.x, t, i.max.z)));
		let a = e.find((e) => e.id === r), o = a ? new M().setFromPoints(a.footprint.flatMap(([e, t]) => [new g(e, a.low, -t), new g(e, a.high, -t)])) : i, s = JSON.stringify([
			o.min.toArray(),
			o.max.toArray(),
			r
		]), c = this.boundsKey !== s;
		this.boundsKey = s;
		let d = o.getCenter(new g());
		this.origin.copy(d), this.radius = Math.max(o.getSize(new g()).length() / 2, .1);
		for (let t of e) {
			let e = fe(t, d), n = new u(e, new p({
				color: 6342885,
				transparent: !0,
				opacity: .025,
				side: 2,
				depthWrite: !1
			})), r = new l(new R(e), new m({
				color: 9545396,
				transparent: !0,
				opacity: .4,
				depthWrite: !1
			}));
			t.container && (n.material.opacity = 0), this.scene.add(n, r);
			let i = t.low - d.y, a = {
				part: t,
				mesh: n,
				edges: r,
				targetColor: new O(),
				targetOpacity: .015
			};
			if (n.material.opacity = 0, !t.container) {
				a.liquid = new u(e.clone(), new p({
					transparent: !0,
					opacity: .015,
					side: 2,
					depthWrite: !1
				})), a.ceiling = new u($(t, d), new p({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1
				})), a.ceiling.position.y = t.high - d.y;
				let n = a.ceiling.geometry;
				n.computeBoundingBox();
				let r = n.boundingBox, o = n.getAttribute("position"), s = n.getAttribute("uv");
				for (let e = 0; e < s.count; e++) s.setXY(e, (o.getX(e) - r.min.x) / (r.max.x - r.min.x), (o.getZ(e) - r.min.z) / (r.max.z - r.min.z));
				a.ceiling.material.map = pe();
				let c = e.clone(), l = c.getAttribute("position"), f = [];
				for (let e = 0; e < l.count; e++) {
					let n = Math.max(0, Math.min(1, (l.getY(e) - i) / (t.high - t.low)));
					f.push(1, 1, 1, n * n);
				}
				c.setAttribute("color", new _(f, 4)), a.wash = new u(c, new p({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1,
					vertexColors: !0
				})), a.liquid.name = "activity-volume", a.ceiling.name = "light-ceiling", a.wash.name = "light-wash", a.liquid.visible = !1, this.scene.add(a.liquid, a.ceiling, a.wash);
			}
			this.volumes.push(a);
			for (let e of t.fixtures ?? []) {
				let n = new u(e.kind === "window" ? new T(e.width ?? 1, e.height ?? 1.2, .06) : new j(Math.min(.15, Math.max(this.radius * .008, .06)), 12, 8), new p({
					color: 8572379,
					transparent: !0,
					opacity: e.kind === "window" ? .35 : 1
				}));
				e.kind === "window" && (n.rotation.y = e.yaw * Math.PI / 180), n.position.set(e.position[0] - d.x, e.position[2] - d.y, -e.position[1] - d.z), n.name = e.kind === "window" ? "room-window" : "room-fixture", this.scene.add(n);
				let r, i;
				e.range > 0 && (e.kind === "motion" || e.kind === "occupancy") && (r = new u(new A(), new p({
					color: 5486286,
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1
				})), i = new l(new A(), new h({
					color: 5486286,
					dashSize: .06,
					gapSize: .08,
					transparent: !0,
					opacity: .65,
					depthWrite: !1
				})), r.name = "sensor-coverage", i.name = "sensor-boundary", this.scene.add(r, i)), e.kind === "window" && (i = new l(new R(n.geometry), new h({
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
		for (let e of this.coverageRooms) for (let t of e.openings ?? []) {
			let n = new u(new A(), new p({
				color: 7917245,
				transparent: !0,
				opacity: .22,
				side: 2,
				depthWrite: !1
			})), r = new l(new A(), new m({
				color: 8907464,
				transparent: !0,
				opacity: .8,
				depthWrite: !1
			})), i = new l(new A(), new m({
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
		let f = {
			property: 4345924,
			lawn: 5270336,
			driveway: 6910329,
			path: 9273449,
			pool: 3570843
		};
		[...n?.features ?? []].sort((e, t) => Number(t.kind === "property") - Number(e.kind === "property")).forEach((e, t) => {
			let r = $({ footprint: e.points }, d), i = new u(r, new p({
				color: f[e.kind],
				side: 2,
				transparent: !0,
				opacity: .5,
				depthWrite: !1
			}));
			i.position.y = n.ground_z - d.y + t * .002, i.name = "site-feature", this.scene.add(i), this.siteMeshes.push(i);
		}), this.grid = new D(this.radius * 2.8, 16, 6914446, 6914446), this.grid.position.y = (t ?? i.min.y - this.radius * .015) - d.y, t !== void 0 && (this.ground = new u(new k(this.radius * 2.8, this.radius * 2.8), new p({
			color: 7700874,
			transparent: !0,
			opacity: 0,
			side: 2,
			depthWrite: !1
		})), this.ground.rotation.x = -Math.PI / 2, this.ground.position.y = this.grid.position.y, this.scene.add(this.ground)), this.grid.material.transparent = !0, this.grid.material.opacity = .14, this.scene.add(this.grid), this.camera.near = Math.max(this.radius / 1e3, .001), this.camera.far = this.radius * 100, this.controls.minDistance = this.radius * .1, this.controls.maxDistance = this.radius * 30, c ? (this.cameraAction("reset"), this.pauseUntil = 0) : this.draw();
	}
	setActivity(t, l, u, d = r(), f = {}, p, m = {}) {
		u !== this.lastSelected && (this.pauseMotion(), this.lastSelected = u), this.options = d, d.focus_activity || (this.focusTarget = void 0);
		for (let n of this.volumes) {
			let { part: r, edges: i, liquid: a, ceiling: s, wash: c } = n, m = e(t, r.id, l), h = r.id === u || r.ancestors.includes(u), g = p && (!p.group || r.id === p.group || r.ancestors.includes(p.group));
			if (i.material.color.set(g && p.color ? p.color : h ? "#d7e8f1" : "#8596a1"), i.material.opacity = h || g ? .9 : r.container ? .07 : .24, !a || !s || !c) continue;
			let _ = a.visible, v = m.status === "stale" ? 0 : m.ratio;
			if (a.visible = v !== null, v !== null) {
				let e = m.status === "stale" ? 0 : m.value;
				n.targetColor.set(o(e, d)), n.targetOpacity = .015 + .225 * Math.min(1, Math.max(0, e / 5)), (!_ || this.reduced?.matches) && (a.material.color.copy(n.targetColor), a.material.opacity = n.targetOpacity), this.updateColor(n, 0);
			}
			let y = f[r.id], b = d.light_fill ? (y?.brightness ?? 0) * d.fill_brightness : 0;
			s.material.color.setRGB(...y?.rgb ?? [
				0,
				0,
				0
			]), c.material.color.copy(s.material.color), s.material.opacity = Math.min(1, b * 3), c.material.opacity = b * .25, s.visible = c.visible = b > 0;
		}
		let h = this.lastFocus, v = p ? `${p.entity}:${p.state}:${p.group ?? ""}` : "", y = v && v !== this.alertKey ? this.volumes.find((e) => e.part.id === p?.group) : void 0, b = [];
		for (let n of this.volumes) {
			let r = t?.groups[n.part.id]?.last_activity;
			if (r != null && Number.isFinite(r)) {
				let i = this.focusEvents.get(n.part.id);
				this.focusEvents.set(n.part.id, r), !n.part.container && i !== void 0 && r > i && l - r < 10 && e(t, n.part.id, l).status === "live" && b.push({
					volume: n,
					event: r
				});
			}
		}
		p || (y ??= b.sort((e, t) => t.event - e.event)[0]?.volume);
		let x;
		if (v && v !== this.alertKey) {
			let e = this.volumes.filter((e) => !p?.group || e.part.id === p.group || e.part.ancestors.includes(p.group));
			if (e.length) {
				x = new M();
				for (let { mesh: t } of e) t.geometry.computeBoundingBox(), x.union(t.geometry.boundingBox);
			}
		}
		if (this.alertKey = v, (y || x) && d.focus_activity && !this.reduced?.matches && Date.now() >= this.pauseUntil && (v || l - this.lastFocus >= 12)) {
			y?.mesh.geometry.computeBoundingBox();
			let e = x ?? y.mesh.geometry.boundingBox;
			this.focusTarget = e.getCenter(new g()), this.focusDistance = Math.min(this.fitDistance(), Math.max(e.getSize(new g()).length() * 2, this.radius)), this.focusUntil = Date.now() + 8e3, this.lastFocus = l;
		}
		let S = JSON.stringify(this.coverageRooms.flatMap((e) => (e.openings ?? []).map((e) => n(e, m))));
		for (let e of this.doors) this.updateDoor(e, m);
		let C;
		for (let e of this.markers) {
			let t = m[e.fixture.entity], n = t?.state === "on" || t?.state === "off", r = t?.state === "on", o = a(e.fixture.kind, t?.state);
			if (e.marker.material.color.set(o.color), e.fixture.kind === "light" && r) {
				let t = i([e.fixture.entity], m);
				e.marker.material.color.setRGB(...t.rgb);
			}
			if (e.coverage && e.boundary && e.coverageKey !== S) {
				let t = [], n = [], r = (e) => [
					e[0] - this.origin.x,
					e[2] - this.origin.y,
					-e[1] - this.origin.z
				];
				for (let i of c(e.fixture, this.coverageRooms, m)) for (let e = 0; e < i.rim.length; e++) {
					let a = i.rim[e], o = i.rim[(e + 1) % i.rim.length];
					t.push(...r(i.origin), ...r(a), ...r(o), ...r(i.center), ...r(o), ...r(a)), n.push(...r(a), ...r(o)), e % 8 == 0 && n.push(...r(i.origin), ...r(a));
				}
				e.coverage.geometry.dispose(), e.boundary.geometry.dispose(), e.coverage.geometry = new A().setAttribute("position", new _(t, 3)), e.boundary.geometry = new A().setAttribute("position", new _(n, 3)), e.boundary.computeLineDistances(), e.coverageKey = S;
			}
			e.coverage && (e.coverage.material.color.copy(e.marker.material.color), e.coverage.material.opacity = o.opacity), e.boundary && (e.boundary.material.color.set(o.color), e.boundary.material.opacity = n ? .65 : .25), (e.fixture.kind === "motion" || e.fixture.kind === "occupancy") && e.previous === "off" && r && (C = e), e.previous = t?.state;
		}
		if (C && d.focus_activity && !p && !this.reduced?.matches && Date.now() >= this.pauseUntil && l - h >= 12) {
			let e = new g(...s(C.fixture));
			this.focusTarget = C.marker.position.clone().addScaledVector(e, Math.min(C.fixture.range, 3) * .5), this.focusDistance = Math.max(this.radius * .6, 2), this.focusUntil = Date.now() + 8e3, this.lastFocus = l;
		}
		this.scheduleMotion(), this.draw();
	}
	updateDoor(e, r) {
		let i = n(e.opening, r);
		if (e.key === i) return;
		e.key = i;
		let a = e.part, o = e.opening, s = {
			points: a.footprint,
			bounds: [[
				Math.min(...a.footprint.map((e) => e[0])),
				Math.min(...a.footprint.map((e) => e[1])),
				a.low
			], [
				Math.max(...a.footprint.map((e) => e[0])),
				Math.max(...a.footprint.map((e) => e[1])),
				a.high
			]]
		}, c = t(s, o), l = i ? c.open : c.closed, u = (e, t) => [
			e[0] - this.origin.x,
			t - this.origin.y,
			-e[1] - this.origin.z
		], d = o.position[2], f = d + o.height, p = u(c.hinge, d), m = u(c.closed, d), h = u(c.closed, f), g = u(c.hinge, f), v = u(l, d), y = u(l, f);
		e.frame.geometry.dispose(), e.leaf.geometry.dispose(), e.arc.geometry.dispose(), e.frame.geometry = new A().setAttribute("position", new _([
			...p,
			...m,
			...m,
			...h,
			...h,
			...g,
			...g,
			...p
		], 3)), e.leaf.geometry = new A().setAttribute("position", new _([
			...p,
			...v,
			...y,
			...p,
			...y,
			...g
		], 3)), e.leaf.visible = o.kind !== "open_wall";
		let b = Math.atan2(c.closed[1] - c.hinge[1], c.closed[0] - c.hinge[0]), x = Math.atan2(c.open[1] - c.hinge[1], c.open[0] - c.hinge[0]), S = Math.atan2(Math.sin(x - b), Math.cos(x - b)), C = [];
		for (let e = 0; e < 16; e++) for (let t of [e / 16, (e + 1) / 16]) C.push(...u([c.hinge[0] + o.width * Math.cos(b + S * t), c.hinge[1] + o.width * Math.sin(b + S * t)], d + .01));
		e.arc.geometry = new A().setAttribute("position", new _(C, 3)), e.arc.visible = o.kind !== "open_wall";
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
			let i = e === "top" ? new g(0, 1, 1e-4) : new g(1, .8, 1);
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
export { me as FloorplanRenderer };
