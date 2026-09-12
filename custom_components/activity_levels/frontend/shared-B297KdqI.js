import { _ as e, a as t, g as n, i as r, m as i, n as a, o, r as s, s as c, v as l } from "./shared-Cwvtlije.js";
import { n as u } from "./shared-IIYdNIav.js";
import { F as d, G as f, H as p, I as m, K as h, N as g, P as _, Sn as v, T as y, Ut as b, V as x, Wt as S, _ as C, cn as w, d as T, et as E, i as D, in as ee, k as O, l as k, nt as A, o as j, on as M, r as N, rn as P, rt as F, sn as I, tn as L, tt as R, w as z, x as B, xn as V } from "./shared-DVWk8t-w.js";
import { t as te } from "./shared-mmljZPXC.js";
//#region node_modules/.pnpm/three@0.185.1/node_modules/three/examples/jsm/controls/OrbitControls.js
var H = { type: "change" }, U = { type: "start" }, W = { type: "end" }, G = new b(), K = new R(), q = Math.cos(70 * p.DEG2RAD), J = new v(), Y = 2 * Math.PI, X = {
	NONE: -1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
}, Z = 1e-6, ne = class extends T {
	constructor(e, t = null) {
		super(e, t), this.state = X.NONE, this.target = new v(), this.cursor = new v(), this.minDistance = 0, this.maxDistance = Infinity, this.minZoom = 0, this.maxZoom = Infinity, this.minTargetRadius = 0, this.maxTargetRadius = Infinity, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -Infinity, this.maxAzimuthAngle = Infinity, this.enableDamping = !1, this.dampingFactor = .05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
			LEFT: "ArrowLeft",
			UP: "ArrowUp",
			RIGHT: "ArrowRight",
			BOTTOM: "ArrowDown"
		}, this.mouseButtons = {
			LEFT: x.ROTATE,
			MIDDLE: x.DOLLY,
			RIGHT: x.PAN
		}, this.touches = {
			ONE: w.ROTATE,
			TWO: w.DOLLY_PAN
		}, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._cursorStyle = "auto", this._domElementKeyEvents = null, this._lastPosition = new v(), this._lastQuaternion = new F(), this._lastTargetPosition = new v(), this._quat = new F().setFromUnitVectors(e.up, new v(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new I(), this._sphericalDelta = new I(), this._scale = 1, this._panOffset = new v(), this._rotateStart = new V(), this._rotateEnd = new V(), this._rotateDelta = new V(), this._panStart = new V(), this._panEnd = new V(), this._panDelta = new V(), this._dollyStart = new V(), this._dollyEnd = new V(), this._dollyDelta = new V(), this._dollyDirection = new v(), this._mouse = new V(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = ie.bind(this), this._onPointerDown = re.bind(this), this._onPointerUp = ae.bind(this), this._onContextMenu = Q.bind(this), this._onMouseWheel = ce.bind(this), this._onKeyDown = le.bind(this), this._onTouchStart = ue.bind(this), this._onTouchMove = de.bind(this), this._onMouseDown = oe.bind(this), this._onMouseMove = se.bind(this), this._interceptControlDown = fe.bind(this), this._interceptControlUp = pe.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
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
		this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(H), this.update(), this.state = X.NONE;
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
		J.copy(t).sub(this.target), J.applyQuaternion(this._quat), this._spherical.setFromVector3(J), this.autoRotate && this.state === X.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
		let n = this.minAzimuthAngle, r = this.maxAzimuthAngle;
		isFinite(n) && isFinite(r) && (n < -Math.PI ? n += Y : n > Math.PI && (n -= Y), r < -Math.PI ? r += Y : r > Math.PI && (r -= Y), n <= r ? this._spherical.theta = Math.max(n, Math.min(r, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + r) / 2 ? Math.max(n, this._spherical.theta) : Math.min(r, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
		let i = !1;
		if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
		else {
			let e = this._spherical.radius;
			this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), i = e != this._spherical.radius;
		}
		if (J.setFromSpherical(this._spherical), J.applyQuaternion(this._quatInverse), t.copy(this.target).add(J), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
			let e = null;
			if (this.object.isPerspectiveCamera) {
				let t = J.length();
				e = this._clampDistance(t * this._scale);
				let n = t - e;
				this.object.position.addScaledVector(this._dollyDirection, n), this.object.updateMatrixWorld(), i = !!n;
			} else if (this.object.isOrthographicCamera) {
				let t = new v(this._mouse.x, this._mouse.y, 0);
				t.unproject(this.object);
				let n = this.object.zoom;
				this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), i = n !== this.object.zoom;
				let r = new v(this._mouse.x, this._mouse.y, 0);
				r.unproject(this.object), this.object.position.sub(r).add(t), this.object.updateMatrixWorld(), e = J.length();
			} else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
			e !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position) : (G.origin.copy(this.object.position), G.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(G.direction)) < q ? this.object.lookAt(this.target) : (K.setFromNormalAndCoplanarPoint(this.object.up, this.target), G.intersectPlane(K, this.target))));
		} else if (this.object.isOrthographicCamera) {
			let e = this.object.zoom;
			this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), e !== this.object.zoom && (this.object.updateProjectionMatrix(), i = !0);
		}
		return this._scale = 1, this._performCursorZoom = !1, i || this._lastPosition.distanceToSquared(this.object.position) > Z || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Z || this._lastTargetPosition.distanceToSquared(this.target) > Z ? (this.dispatchEvent(H), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
	}
	_getAutoRotationAngle(e) {
		return e === null ? Y / 60 / 60 * this.autoRotateSpeed : Y / 60 * this.autoRotateSpeed * e;
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
		J.setFromMatrixColumn(t, 0), J.multiplyScalar(-e), this._panOffset.add(J);
	}
	_panUp(e, t) {
		this.screenSpacePanning === !0 ? J.setFromMatrixColumn(t, 1) : (J.setFromMatrixColumn(t, 0), J.crossVectors(this.object.up, J)), J.multiplyScalar(e), this._panOffset.add(J);
	}
	_pan(e, t) {
		let n = this.domElement;
		if (this.object.isPerspectiveCamera) {
			let r = this.object.position;
			J.copy(r).sub(this.target);
			let i = J.length();
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
		this._rotateLeft(Y * this._rotateDelta.x / t.clientHeight), this._rotateUp(Y * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(Y * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
				break;
			case this.keys.BOTTOM:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-Y * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
				break;
			case this.keys.LEFT:
				e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(Y * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
				break;
			case this.keys.RIGHT: e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-Y * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
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
		this._rotateLeft(Y * this._rotateDelta.x / t.clientHeight), this._rotateUp(Y * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
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
		t === void 0 && (t = new V(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
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
function re(e) {
	this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.ownerDocument.addEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e), this._cursorStyle === "grab" && (this.domElement.style.cursor = "grabbing")));
}
function ie(e) {
	this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function ae(e) {
	switch (this._removePointer(e), this._pointers.length) {
		case 0:
			this.domElement.releasePointerCapture(e.pointerId), this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove), this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(W), this.state = X.NONE, this._cursorStyle === "grab" && (this.domElement.style.cursor = "grab");
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
function oe(e) {
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
		case x.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseDownDolly(e), this.state = X.DOLLY;
			break;
		case x.ROTATE:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = X.PAN;
			} else {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = X.ROTATE;
			}
			break;
		case x.PAN:
			if (e.ctrlKey || e.metaKey || e.shiftKey) {
				if (this.enableRotate === !1) return;
				this._handleMouseDownRotate(e), this.state = X.ROTATE;
			} else {
				if (this.enablePan === !1) return;
				this._handleMouseDownPan(e), this.state = X.PAN;
			}
			break;
		default: this.state = X.NONE;
	}
	this.state !== X.NONE && this.dispatchEvent(U);
}
function se(e) {
	switch (this.state) {
		case X.ROTATE:
			if (this.enableRotate === !1) return;
			this._handleMouseMoveRotate(e);
			break;
		case X.DOLLY:
			if (this.enableZoom === !1) return;
			this._handleMouseMoveDolly(e);
			break;
		case X.PAN:
			if (this.enablePan === !1) return;
			this._handleMouseMovePan(e);
	}
}
function ce(e) {
	this.enabled !== !1 && this.enableZoom !== !1 && this.state === X.NONE && (e.preventDefault(), this.dispatchEvent(U), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(W));
}
function le(e) {
	this.enabled !== !1 && this._handleKeyDown(e);
}
function ue(e) {
	switch (this._trackPointer(e), this._pointers.length) {
		case 1:
			switch (this.touches.ONE) {
				case w.ROTATE:
					if (this.enableRotate === !1) return;
					this._handleTouchStartRotate(e), this.state = X.TOUCH_ROTATE;
					break;
				case w.PAN:
					if (this.enablePan === !1) return;
					this._handleTouchStartPan(e), this.state = X.TOUCH_PAN;
					break;
				default: this.state = X.NONE;
			}
			break;
		case 2:
			switch (this.touches.TWO) {
				case w.DOLLY_PAN:
					if (this.enableZoom === !1 && this.enablePan === !1) return;
					this._handleTouchStartDollyPan(e), this.state = X.TOUCH_DOLLY_PAN;
					break;
				case w.DOLLY_ROTATE:
					if (this.enableZoom === !1 && this.enableRotate === !1) return;
					this._handleTouchStartDollyRotate(e), this.state = X.TOUCH_DOLLY_ROTATE;
					break;
				default: this.state = X.NONE;
			}
			break;
		default: this.state = X.NONE;
	}
	this.state !== X.NONE && this.dispatchEvent(U);
}
function de(e) {
	switch (this._trackPointer(e), this.state) {
		case X.TOUCH_ROTATE:
			if (this.enableRotate === !1) return;
			this._handleTouchMoveRotate(e), this.update();
			break;
		case X.TOUCH_PAN:
			if (this.enablePan === !1) return;
			this._handleTouchMovePan(e), this.update();
			break;
		case X.TOUCH_DOLLY_PAN:
			if (this.enableZoom === !1 && this.enablePan === !1) return;
			this._handleTouchMoveDollyPan(e), this.update();
			break;
		case X.TOUCH_DOLLY_ROTATE:
			if (this.enableZoom === !1 && this.enableRotate === !1) return;
			this._handleTouchMoveDollyRotate(e), this.update();
			break;
		default: this.state = X.NONE;
	}
}
function Q(e) {
	this.enabled !== !1 && e.preventDefault();
}
function fe(e) {
	e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
function pe(e) {
	e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
		passive: !0,
		capture: !0
	}));
}
//#endregion
//#region src/floorplan-renderer.ts
function me(e, t) {
	let n = new P(e.footprint.map(([e, n]) => new V(e - t.x, n + t.z))), r = new z(n, {
		depth: e.high - e.low,
		bevelEnabled: !1,
		steps: 1
	});
	return r.rotateX(-Math.PI / 2), r.translate(0, e.low - t.y, 0), r;
}
function $(e, t) {
	let n = new ee(new P(e.footprint.map(([e, n]) => new V(e - t.x, n + t.z))));
	return n.rotateX(-Math.PI / 2), n;
}
function he() {
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
	let t = new C(e, 32, 32);
	return t.magFilter = t.minFilter = m, t.needsUpdate = !0, t;
}
var ge = class {
	constructor(e, t, n, i, a) {
		this.host = e, this.select = t, this.fail = n, this.hover = i, this.place = a, this.scene = new L(), this.camera = new E(38, 1, .01, 1e3), this.raycaster = new S(), this.volumes = [], this.boundsKey = "", this.origin = new v(), this.markers = [], this.coverageRooms = [], this.doors = [], this.siteMeshes = [], this.radius = 1, this.options = r(), this.lastTick = 0, this.pauseUntil = 0, this.focusUntil = 0, this.focusDistance = 0, this.focusEvents = /* @__PURE__ */ new Map(), this.alertKey = "", this.lastSelected = "", this.lastFocus = 0, this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)"), this.disposed = !1, this.lost = !1, this.pointer = null, this.resize = () => {
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
					let e = Date.now() > this.focusUntil, n = e ? new v() : this.focusTarget, r = this.camera.position.clone().sub(this.controls.target), i = e ? this.fitDistance() : this.focusDistance;
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
					this.raycaster.setFromCamera(new V((e.clientX - t.left) / t.width * 2 - 1, -(e.clientY - t.top) / t.height * 2 + 1), this.camera);
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
			if (this.raycaster.setFromCamera(new V((e.clientX - n.left) / n.width * 2 - 1, -(e.clientY - n.top) / n.height * 2 + 1), this.camera), this.placementHeight !== void 0 && this.place) {
				let e = this.raycaster.ray.intersectPlane(new R(new v(0, 1, 0), this.origin.y - this.placementHeight), new v());
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
		o.style.width = "100%", o.style.height = "100%", o.style.display = "block", o.setAttribute("aria-label", "3D house. Drag to rotate; use the camera controls and group list for keyboard access."), o.setAttribute("role", "img"), this.host.append(o), this.controls = new ne(this.camera, o), this.controls.enableDamping = !1, this.controls.maxPolarAngle = Math.PI * .49, this.controls.addEventListener("change", this.draw), this.controls.addEventListener("start", this.pauseMotion), document.addEventListener("visibilitychange", this.scheduleMotion), this.reduced?.addEventListener("change", this.scheduleMotion), o.addEventListener("pointerdown", this.onPointerDown), o.addEventListener("pointermove", this.onPointerMove), o.addEventListener("pointerup", this.onPointerUp), o.addEventListener("pointercancel", this.onPointerCancel), o.addEventListener("pointerleave", this.onPointerLeave), o.addEventListener("webglcontextlost", this.onContextLost), this.observer = new ResizeObserver(this.resize), this.observer.observe(e), this.resize();
	}
	setParts(e, t, n, r) {
		if (this.clearParts(), this.coverageRooms = e.filter((e) => !e.container), this.focusTarget = void 0, this.focusEvents.clear(), !e.length && !n?.features.length) {
			this.draw();
			return;
		}
		let a = new N();
		for (let t of e) for (let [e, n] of t.footprint) a.expandByPoint(new v(e, t.low, -n)), a.expandByPoint(new v(e, t.high, -n));
		t ??= n?.ground_z;
		for (let e of n?.features ?? []) for (let [t, r] of e.points) a.expandByPoint(new v(t, n.ground_z, -r));
		t !== void 0 && (a.expandByPoint(new v(a.min.x, t, a.min.z)), a.expandByPoint(new v(a.max.x, t, a.max.z)));
		let o = e.find((e) => e.id === r), s = o ? new N().setFromPoints(o.footprint.flatMap(([e, t]) => [new v(e, o.low, -t), new v(e, o.high, -t)])) : a, c = JSON.stringify([
			s.min.toArray(),
			s.max.toArray(),
			r
		]), l = this.boundsKey !== c;
		this.boundsKey = c;
		let u = s.getCenter(new v());
		this.origin.copy(u), this.radius = Math.max(s.getSize(new v()).length() / 2, .1);
		for (let t of e) {
			let e = me(t, u), n = new f(e, new h({
				color: 6342885,
				transparent: !0,
				opacity: .025,
				side: 2,
				depthWrite: !1
			})), r = new d(new B(e), new g({
				color: 9545396,
				transparent: !0,
				opacity: .4,
				depthWrite: !1
			}));
			t.container && (n.material.opacity = 0), this.scene.add(n, r);
			let a = t.low - u.y, o = {
				part: t,
				mesh: n,
				edges: r,
				targetColor: new k(),
				targetOpacity: .015
			};
			if (n.material.opacity = 0, !t.container) {
				o.liquid = new f(e.clone(), new h({
					transparent: !0,
					opacity: .015,
					side: 2,
					depthWrite: !1
				})), o.ceiling = new f($(t, u), new h({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1
				})), o.ceiling.position.y = t.high - u.y;
				let n = o.ceiling.geometry;
				n.computeBoundingBox();
				let r = n.boundingBox, i = n.getAttribute("position"), s = n.getAttribute("uv");
				for (let e = 0; e < s.count; e++) s.setXY(e, (i.getX(e) - r.min.x) / (r.max.x - r.min.x), (i.getZ(e) - r.min.z) / (r.max.z - r.min.z));
				o.ceiling.material.map = he();
				let c = e.clone(), l = c.getAttribute("position"), d = [];
				for (let e = 0; e < l.count; e++) {
					let n = Math.max(0, Math.min(1, (l.getY(e) - a) / (t.high - t.low)));
					d.push(1, 1, 1, n * n);
				}
				c.setAttribute("color", new y(d, 4)), o.wash = new f(c, new h({
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1,
					vertexColors: !0
				})), o.liquid.name = "activity-volume", o.ceiling.name = "light-ceiling", o.wash.name = "light-wash", o.liquid.visible = !1, this.scene.add(o.liquid, o.ceiling, o.wash);
			}
			this.volumes.push(o);
			for (let e of t.fixtures ?? []) {
				let n = new f(e.kind === "window" ? new D(e.width ?? 1, e.height ?? 1.2, .06) : new M(Math.min(.15, Math.max(this.radius * .008, .06)), 12, 8), new h({
					color: 8572379,
					transparent: !0,
					opacity: e.kind === "window" ? .35 : 1
				}));
				e.kind === "window" && (n.rotation.y = e.yaw * Math.PI / 180), n.position.set(e.position[0] - u.x, e.position[2] - u.y, -e.position[1] - u.z), n.name = e.kind === "window" ? "room-window" : "room-fixture", this.scene.add(n);
				let r, a;
				e.range > 0 && (e.kind === "motion" || e.kind === "occupancy") && (r = new f(new j(), new h({
					color: 5486286,
					transparent: !0,
					opacity: 0,
					side: 2,
					depthWrite: !1
				})), a = new d(new j(), new _({
					color: 5486286,
					dashSize: .06,
					gapSize: .08,
					transparent: !0,
					opacity: .65,
					depthWrite: !1
				})), r.name = "sensor-coverage", a.name = "sensor-boundary", this.scene.add(r, a)), e.kind === "window" && (a = new d(new B(n.geometry), new _({
					color: 5486286,
					dashSize: 1,
					gapSize: 0,
					transparent: !0,
					opacity: .65,
					depthWrite: !1
				})), a.computeLineDistances(), a.position.copy(n.position), a.quaternion.copy(n.quaternion), a.name = "window-boundary", this.scene.add(a)), this.markers.push({
					room: t.id,
					fixture: e,
					marker: n,
					coverage: r,
					boundary: a,
					invalid: e.kind === "window" && !i({
						points: t.footprint,
						bounds: [[
							0,
							0,
							t.low
						], [
							0,
							0,
							t.high
						]]
					}, e)
				});
			}
		}
		for (let e of this.coverageRooms) for (let t of e.openings ?? []) {
			let n = new f(new j(), new h({
				color: 7917245,
				transparent: !0,
				opacity: .22,
				side: 2,
				depthWrite: !1
			})), r = new d(new j(), new g({
				color: 8907464,
				transparent: !0,
				opacity: .8,
				depthWrite: !1
			})), i = new d(new j(), new g({
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
		let p = {
			property: 4345924,
			lawn: 5270336,
			driveway: 6910329,
			path: 9273449,
			pool: 3570843
		};
		[...n?.features ?? []].sort((e, t) => Number(t.kind === "property") - Number(e.kind === "property")).forEach((e, t) => {
			let r = $({ footprint: e.points }, u), i = new f(r, new h({
				color: p[e.kind],
				side: 2,
				transparent: !0,
				opacity: .5,
				depthWrite: !1
			}));
			i.position.y = n.ground_z - u.y + t * .002, i.name = "site-feature", this.scene.add(i), this.siteMeshes.push(i);
		}), this.grid = new O(this.radius * 2.8, 16, 6914446, 6914446), this.grid.position.y = (t ?? a.min.y - this.radius * .015) - u.y, t !== void 0 && (this.ground = new f(new A(this.radius * 2.8, this.radius * 2.8), new h({
			color: 7700874,
			transparent: !0,
			opacity: 0,
			side: 2,
			depthWrite: !1
		})), this.ground.rotation.x = -Math.PI / 2, this.ground.position.y = this.grid.position.y, this.scene.add(this.ground)), this.grid.material.transparent = !0, this.grid.material.opacity = .14, this.scene.add(this.grid), this.camera.near = Math.max(this.radius / 1e3, .001), this.camera.far = this.radius * 100, this.controls.minDistance = this.radius * .1, this.controls.maxDistance = this.radius * 30, l ? (this.cameraAction("reset"), this.pauseUntil = 0) : this.draw();
	}
	setActivity(n, i, l, d = r(), f = {}, p, m = {}) {
		l !== this.lastSelected && (this.pauseMotion(), this.lastSelected = l), this.options = d, d.focus_activity || (this.focusTarget = void 0);
		for (let e of this.volumes) {
			let { part: r, edges: a, liquid: o, ceiling: c, wash: u } = e, m = t(n, r.id, i), h = r.id === l || r.ancestors.includes(l), g = p && (!p.group || r.id === p.group || r.ancestors.includes(p.group));
			if (a.material.color.set(g && p.color ? p.color : h ? "#d7e8f1" : "#8596a1"), a.material.opacity = h || g ? .9 : r.container ? .07 : .24, !o || !c || !u) continue;
			let _ = o.visible, v = m.status === "stale" ? 0 : m.ratio;
			if (o.visible = v !== null, v !== null) {
				let t = m.status === "stale" ? 0 : m.value;
				e.targetColor.set(s(t, d)), e.targetOpacity = .015 + .225 * Math.min(1, Math.max(0, t / 5)), (!_ || this.reduced?.matches) && (o.material.color.copy(e.targetColor), o.material.opacity = e.targetOpacity), this.updateColor(e, 0);
			}
			let y = f[r.id], b = d.light_fill ? (y?.brightness ?? 0) * d.fill_brightness : 0;
			c.material.color.setRGB(...y?.rgb ?? [
				0,
				0,
				0
			]), u.material.color.copy(c.material.color), c.material.opacity = Math.min(1, b * 3), u.material.opacity = b * .25, c.visible = u.visible = b > 0;
		}
		let h = this.lastFocus, g = p ? `${p.entity}:${p.state}:${p.group ?? ""}` : "", _ = g && g !== this.alertKey ? this.volumes.find((e) => e.part.id === p?.group) : void 0, b = [];
		for (let e of this.volumes) {
			let r = n?.groups[e.part.id]?.last_activity;
			if (r != null && Number.isFinite(r)) {
				let a = this.focusEvents.get(e.part.id);
				this.focusEvents.set(e.part.id, r), !e.part.container && a !== void 0 && r > a && i - r < 10 && t(n, e.part.id, i).status === "live" && b.push({
					volume: e,
					event: r
				});
			}
		}
		p || (_ ??= b.sort((e, t) => t.event - e.event)[0]?.volume);
		let x;
		if (g && g !== this.alertKey) {
			let e = this.volumes.filter((e) => !p?.group || e.part.id === p.group || e.part.ancestors.includes(p.group));
			if (e.length) {
				x = new N();
				for (let { mesh: t } of e) t.geometry.computeBoundingBox(), x.union(t.geometry.boundingBox);
			}
		}
		if (this.alertKey = g, (_ || x) && d.focus_activity && !this.reduced?.matches && Date.now() >= this.pauseUntil && (g || i - this.lastFocus >= 12)) {
			_?.mesh.geometry.computeBoundingBox();
			let e = x ?? _.mesh.geometry.boundingBox;
			this.focusTarget = e.getCenter(new v()), this.focusDistance = Math.min(this.fitDistance(), Math.max(e.getSize(new v()).length() * 2, this.radius)), this.focusUntil = Date.now() + 8e3, this.lastFocus = i;
		}
		let S = JSON.stringify(this.coverageRooms.flatMap((t) => (t.openings ?? []).map((t) => e(t, m))));
		for (let e of this.doors) this.updateDoor(e, m);
		let C;
		for (let e of this.markers) {
			let t = m[e.fixture.entity], n = t?.state === "on" || t?.state === "off", r = t?.state === "on", i = o(e.fixture.kind, t?.state);
			if (e.invalid && (i.color = "#ff3535"), e.marker.material.color.set(i.color), e.fixture.kind === "light" && r) {
				let t = a([e.fixture.entity], m);
				e.marker.material.color.setRGB(...t.rgb);
			}
			if (e.coverage && e.boundary && e.coverageKey !== S) {
				let t = [], n = [], r = (e) => [
					e[0] - this.origin.x,
					e[2] - this.origin.y,
					-e[1] - this.origin.z
				];
				for (let i of u(e.fixture, this.coverageRooms, m)) for (let e = 0; e < i.rim.length; e++) {
					let a = i.rim[e], o = i.rim[(e + 1) % i.rim.length];
					t.push(...r(i.origin), ...r(a), ...r(o), ...r(i.center), ...r(o), ...r(a)), n.push(...r(a), ...r(o)), e % 8 == 0 && n.push(...r(i.origin), ...r(a));
				}
				e.coverage.geometry.dispose(), e.boundary.geometry.dispose(), e.coverage.geometry = new j().setAttribute("position", new y(t, 3)), e.boundary.geometry = new j().setAttribute("position", new y(n, 3)), e.boundary.computeLineDistances(), e.coverageKey = S;
			}
			e.coverage && (e.coverage.material.color.copy(e.marker.material.color), e.coverage.material.opacity = i.opacity), e.boundary && (e.boundary.material.color.set(i.color), e.boundary.material.opacity = n ? .65 : .25), (e.fixture.kind === "motion" || e.fixture.kind === "occupancy") && e.previous === "off" && r && (C = e), e.previous = t?.state;
		}
		if (C && d.focus_activity && !p && !this.reduced?.matches && Date.now() >= this.pauseUntil && i - h >= 12) {
			let e = new v(...c(C.fixture));
			this.focusTarget = C.marker.position.clone().addScaledVector(e, Math.min(C.fixture.range, 3) * .5), this.focusDistance = Math.max(this.radius * .6, 2), this.focusUntil = Date.now() + 8e3, this.lastFocus = i;
		}
		this.scheduleMotion(), this.draw();
	}
	updateDoor(t, r) {
		let i = e(t.opening, r);
		if (t.key === i) return;
		t.key = i;
		let a = t.part, o = t.opening, s = {
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
		}, c = n(s, o) ? 8907464 : 16725301;
		t.frame.material.color.setHex(c), t.leaf.material.color.setHex(c), t.arc.material.color.setHex(c);
		let u = l(s, o), d = i ? u.open : u.closed, f = (e, t) => [
			e[0] - this.origin.x,
			t - this.origin.y,
			-e[1] - this.origin.z
		], p = o.position[2], m = p + o.height, h = f(u.hinge, p), g = f(u.closed, p), _ = f(u.closed, m), v = f(u.hinge, m), b = f(d, p), x = f(d, m);
		t.frame.geometry.dispose(), t.leaf.geometry.dispose(), t.arc.geometry.dispose(), t.frame.geometry = new j().setAttribute("position", new y([
			...h,
			...g,
			...g,
			..._,
			..._,
			...v,
			...v,
			...h
		], 3)), t.leaf.geometry = new j().setAttribute("position", new y([
			...h,
			...b,
			...x,
			...h,
			...x,
			...v
		], 3)), t.leaf.visible = o.kind !== "open_wall";
		let S = Math.atan2(u.closed[1] - u.hinge[1], u.closed[0] - u.hinge[0]), C = Math.atan2(u.open[1] - u.hinge[1], u.open[0] - u.hinge[0]), w = Math.atan2(Math.sin(C - S), Math.cos(C - S)), T = [];
		for (let e = 0; e < 16; e++) for (let t of [e / 16, (e + 1) / 16]) T.push(...f([u.hinge[0] + o.width * Math.cos(S + w * t), u.hinge[1] + o.width * Math.sin(S + w * t)], p + .01));
		t.arc.geometry = new j().setAttribute("position", new y(T, 3)), t.arc.visible = o.kind !== "open_wall";
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
			let i = e === "top" ? new v(0, 1, 1e-4) : new v(1, .8, 1);
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
export { ge as FloorplanRenderer };
