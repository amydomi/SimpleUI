/*!
 * SimpleUI v0.0.10
 * URL: https://github.com/dusksoft/SimpleUI#readme
 * (c) 2016 by huanghai. All rights reserved.
 * Licensed under the MIT license
 */
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

// doT.js
// 2011-2014, Laura Doktorova, https://github.com/olado/doT
// Licensed under the MIT license.

(function() {
	"use strict";

	var doT = {
		version: "1.0.3",
		templateSettings: {
			evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
			interpolate: /\{\{=([\s\S]+?)\}\}/g,
			encode:      /\{\{!([\s\S]+?)\}\}/g,
			use:         /\{\{#([\s\S]+?)\}\}/g,
			useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
			define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
			defineParams:/^\s*([\w$]+):([\s\S]+)/,
			conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
			iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
			varname:	"it",
			strip:		true,
			append:		true,
			selfcontained: false,
			doNotSkipEncoded: false
		},
		template: undefined, //fn, compile template
		compile:  undefined  //fn, for express
	}, _globals;

	doT.encodeHTMLSource = function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	};

	_globals = (function(){ return this || (0,eval)("this"); }());

	if (typeof module !== "undefined" && module.exports) {
		module.exports = doT;
	} else if (typeof define === "function" && define.amd) {
		define(function(){return doT;});
	} else {
		_globals.doT = doT;
	}

	var startend = {
		append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
		split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
	}, skip = /$^/;

	function resolveDefs(c, block, def) {
		return ((typeof block === "string") ? block : block.toString())
		.replace(c.define || skip, function(m, code, assign, value) {
			if (code.indexOf("def.") === 0) {
				code = code.substring(4);
			}
			if (!(code in def)) {
				if (assign === ":") {
					if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
						def[code] = {arg: param, text: v};
					});
					if (!(code in def)) def[code]= value;
				} else {
					new Function("def", "def['"+code+"']=" + value)(def);
				}
			}
			return "";
		})
		.replace(c.use || skip, function(m, code) {
			if (c.useParams) code = code.replace(c.useParams, function(m, s, d, param) {
				if (def[d] && def[d].arg && param) {
					var rw = (d+":"+param).replace(/'|\\/g, "_");
					def.__exp = def.__exp || {};
					def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
					return s + "def.__exp['"+rw+"']";
				}
			});
			var v = new Function("def", "return " + code)(def);
			return v ? resolveDefs(c, v, def) : v;
		});
	}

	function unescape(code) {
		return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
	}

	doT.template = function(tmpl, c, def) {
		c = c || doT.templateSettings;
		var cse = c.append ? startend.append : startend.split, needhtmlencode, sid = 0, indv,
			str  = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

		str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
					.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""): str)
			.replace(/'|\\/g, "\\$&")
			.replace(c.interpolate || skip, function(m, code) {
				return cse.start + unescape(code) + cse.end;
			})
			.replace(c.encode || skip, function(m, code) {
				needhtmlencode = true;
				return cse.startencode + unescape(code) + cse.end;
			})
			.replace(c.conditional || skip, function(m, elsecase, code) {
				return elsecase ?
					(code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
					(code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
			})
			.replace(c.iterate || skip, function(m, iterate, vname, iname) {
				if (!iterate) return "';} } out+='";
				sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
				return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
					+vname+"=arr"+sid+"["+indv+"+=1];out+='";
			})
			.replace(c.evaluate || skip, function(m, code) {
				return "';" + unescape(code) + "out+='";
			})
			+ "';return out;")
			.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
			.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
			//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

		if (needhtmlencode) {
			if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
			str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
				+ doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
				+ str;
		}
		try {
			return new Function(c.varname, str);
		} catch (e) {
			if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
			throw e;
		}
	};

	doT.compile = function(tmpl, def) {
		return doT.template(tmpl, null, def);
	};
}());

;(function($) {
    "use strict";
    
    var ua = navigator.userAgent.toLowerCase();
    $.browser = {
        trident: ua.indexOf('trident') > -1,                                //IE内核
        presto: ua.indexOf('presto') > -1,                                  //opera内核
        webKit: ua.indexOf('applewebkit') > -1,                             //苹果、谷歌内核
        gecko: ua.indexOf('gecko') > -1 && ua.indexOf('khtml') == -1,       //火狐内核
        mobile: !!ua.match(/AppleWebKit.*Mobile.*/i),                       //为移动终端
        ios: !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/i),                  //ios终端
        android: ua.indexOf('android') > -1 || ua.indexOf('linux') > -1,    //android终端或者uc浏览器
        iPhone: ua.indexOf('iphone') > -1 ,                                 //为iPhone或者QQHD浏览器
        iPad: ua.indexOf('ipad') > -1,                                      //iPad
        webApp: ua.indexOf('safari') == -1,                                 //web应该程序，没有头部与底部
        wechat: ua.indexOf('micromessenger') > -1,                          //微信
        qq: ua.match(/\sQQ/i) == " qq",                                     //QQ客户端
        qqbrowser: ua.indexOf('qq')>-1,                                     //QQ浏览器
        sinaWeibo: ua.match(/WeiBo/i) == "weibo",                           //新浪微博客户端
        tencentWeibo: ua.match(/TencentMicroBlog/i) == 'tencentmicroblog',  //腾讯微博客户端
        qhbrowser: ua.match(/QhBrowser/i) == 'qhbrowser'                    //360浏览器
    }
    
})(Zepto);

// fastclick start
$(function() {
    FastClick.attach(document.body);
});
;(function($) {
    "use strict";
    
    /*
        isClear 和 duration 主要用于处理iOS弹簧效果下无法触发transitionend回调函数的bug
        通过将isClear设为true后，指定duration时间后自动移除DOM节点以达到清理垃圾的作用
        duration默认为300毫秒，可根据CSS执行动画事件去配置大小
    */
    
    $.fn.transitionEnd = function(callback, isClear, duration) {
        var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
        var element = this;
        
        switch(typeof isClear) {
            case 'number':
                duration = arguments[1];
                isClear = undefined;
                break;
            case 'undefined':
                isClear = true;
                break;
        }
        
        function closureCallBack(e) {
            if (e.target !== this) return;
            callback.call(this, e);
            for (var i = 0; i < events.length; i++) {
                element.off(events[i], closureCallBack);
            }
        }
        
        if (callback) {
            for (var i = 0; i < events.length; i++) {
                element.on(events[i], closureCallBack);
            }
            // 解决iOS弹簧效果下无法触发事件的bug
            if($.browser.ios && isClear) {
                setTimeout(function() {
                    element.remove();
                }, duration || 300);
            }
        }
        return element;
    };

})(Zepto);


// dialog.js
// author: huanghai
// date: 2016-09-19

;(function($) {
    "use strict";
    
    var _defaults, _timer;
    $.dialog = function(params) {
        params = (typeof params == 'object') ? params : {};

        if(typeof params.buttons == 'undefined') {
            params['buttons'] = [{text: _defaults.okVal}];
        }
        
        params = $.extend({}, _defaults, params);
        var buttons = params.buttons;
        
        var strHtml = '<div class="sui-dialog">' +
               '<div class="sui-dialog-hd">{{=it.title}}</div>' +
               '<div class="sui-dialog-bd sui-border-b">' + 
               '<div class="sui-dialog-text">{{=it.text}}</div>{{=it.html}}' +
               '</div>' +
               '<div class="sui-dialog-ft">' +
               '{{~it.buttons:v}}' +
                '<button>{{=v.text}}</button>' +
               '{{~}}' +
               '</div>' +
           '</div>';
        
        var template = $(doT.template(strHtml)(params));
        var mask = $('<div class="sui-mask"></div>').appendTo(document.body).css('display', 'block');
        var dialog = template.appendTo(document.body).css('display', 'block');
        
        // 动画效果
        setTimeout(function() {
            mask.addClass('sui-mask-visible');
            dialog.addClass('sui-dialog-visible');
        }, 0);
        
        // 按钮事件处理
        dialog.find('button').each(function(i, el) {
            if(i > params.maxButton - 1) return;
            $(el).on('click', function() {
                // 回调输入值
                var inputVal = [];
                dialog.find('.sui-dialog-bd input').each(function(y, elem) {
                    inputVal.push($(elem).val());
                });
                if(inputVal.length == 1) {
                    inputVal = inputVal[0];
                }
                if(params.autoClose) {
                    $.closeDialog();
                }
                if($.isFunction(buttons[i].onClick)) {
                    buttons[i].onClick(inputVal);
                }
            });
        });
    }
    
    $.closeDialog = function() {
        if($('body').hasClass('forbid-scroll')) {
            $('body').removeClass('forbid-scroll').off('touchmove'); // 启用滚动
        }
        
        $('.sui-mask').transitionEnd(function() {
            $(this).remove();
        }).removeClass('sui-mask-visible');
        $('.sui-dialog').transitionEnd(function() {
            $(this).remove();
        }).removeClass('sui-dialog-visible');
        
    }
    
    $.alert = function(text, title, onOk) {
        var config;
        if(typeof text == 'object') {
            config = text;
        } else {
            if(typeof title == 'function') {
                onOk = arguments[1];
                title = undefined;
            }
            config = {
                text: text,
                title: title,
                onOk: onOk
            }
        }
        
        $.dialog({
            text: config.text,
            title: config.title,
            buttons: [{
                text: _defaults.okVal,
                onClick: config.onOk
            }]
        });
        $('body').addClass('forbid-scroll').on('touchmove', function(event){
            event.preventDefault();
        });
    }
    
    $.confirm = function(text, title, onOk, onCancel) {
        var config;
        if(typeof text == 'object') {
            config = text;
        } else {
            if (typeof title == 'function') {
                onOk = arguments[1];
                onCancel = arguments[2];
                title = undefined;
            }
            
            config = {
                text: text,
                title: title,
                onOk: onOk,
                onCancel: onCancel
            }
        }
        
        $.dialog({
            text: config.text,
            title: config.title,
            buttons: [{
                text: _defaults.cancelVal,
                onClick: config.onCancel
            }, {
                text: _defaults.okVal,
                onClick: config.onOk
            }]
        });
        $('body').addClass('forbid-scroll').on('touchmove', function(event){
            event.preventDefault();
        });
    }
    
    $.prompt = function(title, text, onOk, onCancel, placeholder, input) {
        var config;
        if (typeof title === 'object') {
          config = title;
        } else {
            if (typeof text === 'function') {
                input = arguments[4];
                placeholder = arguments[3];
                onCancel = arguments[2];
                onOk = arguments[1];
                title = undefined;
            }
            
            config = {
                text: text,
                title: title,
                placeholder: placeholder,
                input: input,
                onOk: onOk,
                onCancel: onCancel,
                empty: false
            }
        }
        
        $.dialog({
            text: config.text,
            title: config.title,
            html: '<div class="sui-dialog-input"><input type="text" placeholder="'+ (config.placeholder || '') + '" value="' + (config.input || '') + '" /></div>',
            autoClose: false,
            buttons: [{
                text: _defaults.cancelVal,
                onClick: function() {
                    $.closeDialog();
                    if(config.onCancel) config.onCancel();
                }
            }, {
                text: _defaults.okVal,
                onClick: function(data) {
                    if(config.empty && $.trim(data).length <= 0) {
                        $('.sui-dialog-input input').focus();
                        return;   
                    }
                    $.closeDialog();
                    if(config.onOk) config.onOk(data);
                }
            }]
        })
    }
    
    // 默认配置
    _defaults = $.dialog.prototype.defaults = {
        title: '温馨提示',
        text: '',
        okVal: '确定',
        cancelVal: '取消',
        autoClose: true,    // 是否自动关闭
        html: '',           // 自定义html
        maxButton: 3        // 按钮数量，默认最多显示3个按钮
    }
})(Zepto);

// actions.js
// author: huanghai
// date: 2016-09-21

;(function() {
    "use strict";
    
    var _defaults;
    var _onClose = undefined;
    var show = function(params) {
        
        params = $.extend({}, _defaults, params);
        _onClose = params.onClose;
        
        var strHtml = '<div class="sui-actionsheet">' +
                '{{?it.title}}<div class="sui-actionsheet-title sui-border-b">{{=it.title}}</div>{{?}}' +
                '<ul class="sui-list sui-actionsheet-button-group">' +
                    '{{~it.buttons:v}}' +
                    '<li{{?v.className}} class="{{=v.className}}"{{?}}>{{=v.text}}</li>' +
                    '{{~}}' +
                '</ul>' +
                '<ul class="sui-list sui-actionsheet-action">' +
                    '<li class="sui-actionsheet-cancel {{=it.cancelClass}}">{{=it.cancelText}}</li>' +
                '</ul>' +
            '</div>';
        
        var template = $(doT.template(strHtml)(params));
        var mask = $('<div class="sui-mask"></div>').appendTo(document.body).css('display', 'block');
        var actionSheet = template.appendTo(document.body).css('display', 'block');
        
        // 动画
        setTimeout(function() {
            mask.addClass('sui-mask-visible');
            actionSheet.addClass('sui-actionsheet-visible');
        }, 0);
        
        // 禁用滚动条
        $('body').addClass('forbid-scroll').on('touchmove', function(event){
            event.preventDefault();
        });
        
        // 事件
        $('.sui-actionsheet-button-group li').on('click', function() {
            var button = params.buttons[$(this).index()];
            if($.isFunction(button.onClick)) {
                button.onClick();
            }
            if(params.autoClose) {
                hide(false);
            }
        });
        
        // 取消
        $('.sui-actionsheet-cancel,.sui-mask').on('click', function() {
            if(params.autoClose) {
                hide(true);
            }
        });
    }
    
    var hide = function(isCancel) {
        $('body').removeClass('forbid-scroll').off('touchmove'); // 启用滚动
        if($.isFunction(_onClose) && isCancel) {
            _onClose();
        }
        $('.sui-mask').transitionEnd(function() {
           $(this).remove(); 
        }).removeClass('sui-mask-visible');
        $('.sui-actionsheet').transitionEnd(function() {
            $(this).remove();
        }).removeClass('sui-actionsheet-visible');
        _onClose = undefined;
    }
    
    $.actionSheet = function(buttons, title, onClose, autoClose) {
        if(typeof title == 'function') {
            onClose = arguments[1];
            autoClose = arguments[2];
            title = undefined;
        }
        
        var config = {
            buttons: buttons,
            title: title,
            autoClose: autoClose,
            onClose: onClose
        }
        
        show(config);
    }
    
    $.closeActionSheet = function() {
        hide(false);
    }
    
    _defaults = $.actionSheet.prototype.defaults = {
        title: undefined,
        onClose: undefined,
        autoClose: true,       // 是否自动关闭
        cancelClass: 'sui-orange',   // 取消按钮的样式
        cancelText: '取消'    // 取消按钮文本
    }
})(Zepto);

// toast.js
// author: huanghai
// date: 2016-09-22

;(function($) {
    "use strict";
    
    var _defaults, _destroy, _timer;
    var show = function(params, autoClose) {
        params = $.extend({}, _defaults, params);
        
        // 单列
        if($('.sui-toast').length > 0) {
            $('.sui-toast').remove();
            $('.sui-mask-transparent').remove();
        }
        
        var strHtml = '<div class="sui-toast{{?it.style=="text"}} sui-toast-content{{?}}">' +
                    '{{?it.style=="success"||it.style=="error"}}' +
                    '<i class="sui-toast-icon{{?it.style=="success"}} sui-toast-success{{??it.style=="error"}} sui-toast-error{{?}}"></i>' +
                    '{{?}}' +
                    '{{?it.style=="loading"}}' +
                    '<div class="sui-toast-loading">' +
                        '{{for(var i=0; i<12;i++){}}' +
                        '<i class="sui-loading-l sui-loading-l-{{=i}}"></i>' +
                        '{{}}}' +
                    '</div>' +
                    '{{?}}' +
                    '<div class="sui-toast-text {{?it.style=="loading"}}sui-toast-loading-text{{?}}">{{=it.text}}</div>' +
                '</div>';
        
        var template = $(doT.template(strHtml)(params));
        var mask = $('<div class="sui-mask-transparent"></div>').appendTo(document.body);
        var toast = template.appendTo(document.body).css('display', 'block');
        
        if(params.style != 'text') {
            mask.css('display', 'block');
            $('body').addClass('forbid-scroll').on('touchmove', function(event){
                event.preventDefault();
            });
        }
        
        // 动画
        setTimeout(function() {
            if(params.style != 'text') mask.addClass('sui-mask-visible');
            if(params.style == 'text') {
                toast.addClass('sui-toast-content-visible');
            } else {
                toast.addClass('sui-toast-visible');
            }
        }, 0);
        
        if(autoClose && params.duration) {
            clearTimeout(_timer);
            _timer = setTimeout(hide, params.duration);
        }
    }
    
    var hide = function() {
        clearTimeout(_timer);
        var toast = $('.sui-toast');
        var mask = $('.sui-mask-transparent');
        
        if(mask.hasClass('sui-mask-visible')) {
            mask.transitionEnd(function() {
                $(this).remove();
            }).removeClass('sui-mask-visible');
        } else {
            mask.remove();
        }
        
        if(toast.hasClass('sui-toast-visible')) {
            $('body').removeClass('forbid-scroll').off('touchmove'); // 启用滚动
            toast.transitionEnd(function(){
                $(this).remove();
            }).removeClass('sui-toast-visible');
        } else {
            toast.transitionEnd(function(){
                $(this).remove();
            }).removeClass('sui-toast-content-visible');
        }
        if($.isFunction(_destroy)) _destroy();
        _destroy = undefined;
    }
    
    $.toast = function(text, style, duration, destroy) {
        var config;
        if(typeof text == 'object') {
            config = text;
        } else {
            
            switch(typeof(style)) {
                case 'undefined':
                    duration = _defaults.duration;
                    style = 'text';
                    break;
                case 'number':
                    duration = arguments[1];
                    destroy = arguments[2];
                    style = 'text';
                    break;
                case 'function':
                    duration = _defaults.duration;
                    destroy = arguments[1];
                    style = 'text';
                    break;
            }
            
            if(typeof duration == 'function') {
                destroy = arguments[2];
                duration = _defaults.duration;
            }
            
            config = {
                text: text || '',
                style: style,
                duration: duration,
                destroy: destroy
            }
        }
        
        var autoClose = true;
        if(config.style == 'loading') {
            autoClose = false;
        } else {
            _destroy = config.destroy;
        }
        
        show(config, autoClose);
    }
    
    $.toastSuccess = function(text, destroy) {
        if(typeof text == 'function') {
            destroy = arguments[0];
            text = undefined;
        }
        $.toast(text || '操作成功', 'success', undefined, destroy);
    }
    
    $.toastError = function(text, destroy) {
        if(typeof text == 'function') {
            destroy = arguments[0];
            text = undefined;
        }
        $.toast(text || '操作失败', 'error', undefined, destroy);
    }
    
    $.showLoading = function(text) {
        var config = {
            text: text || '数据加载中',
            style: 'loading'
        }
        show(config, false);
    }
    
    $.hideLoading = function() {
        hide();
    }
    
    _defaults = $.toast.prototype.defaults = {
        duration: 2000
    }
})(Zepto);

// popup.js
// author: huanghai
// date: 2016-09-27

;(function($) {
    "use strict";
    
    // 组件支持的效果
    var _effectList = {
        push: ['sui-popup-effect-push', 'sui-popup-effect-push-visible'],
        modal: ['sui-popup-effect-modal', 'sui-popup-effect-modal-visible'],
        menu: ['sui-popup-effect-menu', 'sui-popup-effect-menu-visible'],
        plate: ['sui-popup-effect-plate', 'sui-popup-effect-plate-visible'],
    }
    
    var _onCallback, _data;
    $.openPopup = function(popup, effect, onOpen, onCallback) {
        var flag = false;
        $.each(_effectList, function(name, value) {
           if(effect == name) {
               flag = true;
               return;
           }
        });
        if(!flag) effect = 'modal';
        
        popup = $(popup);
        var mask = popup.children('.sui-mask');
        var modal = popup.children('.sui-popup-modal');
        var zIndex = $('.sui-popup-on');
        zIndex = zIndex ? zIndex.length + 8000 : 8000;
        
        // 如果是已经展开了，只要改变z-index让其显示即可。
        if(popup.hasClass('sui-popup-on')) {
            modal.css('z-index', zIndex);
            return;
        }
        
        // 展开前执行onPen事件
        if($.isFunction(onOpen)) {
            onOpen();
        }
        _onCallback = onCallback;
        modal.addClass(_effectList[effect][0]);
        
        
        popup.css('display', 'block').addClass('sui-popup-on');
        mask.css('display', 'block');
        modal.css('display', 'block').css('z-index', zIndex);
        modal.scrollTop(0);

        // 动画效果
        setTimeout(function() {
            mask.addClass('sui-mask-visible');
            modal.addClass(_effectList[effect][1]);
        }, 2);
        
        if(!$('body').hasClass('forbid-scroll')) {
            $('body').addClass('forbid-scroll').on('touchmove', function(event){
                event.preventDefault();
            });
        }
    }
    
    $.closePopup = function(popup, callback) {
        popup = $(popup);
        var mask = popup.children('.sui-mask');
        var modal = popup.children('.sui-popup-modal');
        
        mask.removeClass('sui-mask-visible').transitionEnd(function(){
            $(this).css('display', 'none');
        }, false);
        
        $.each(_effectList, function(name, value) {
            if(modal.hasClass(value[1])) {
                modal.removeClass(value[1]).transitionEnd(function(){
                    $(this).css('display', 'none').removeClass(value[0]);
                    popup.css('display', 'none');
					// 关闭时候执行的回调
                    if($.isFunction(callback)) callback();
                    // 打开时的回调事件，必须保证传递的数据不为空才会触发
                    if($.isFunction(_onCallback) && _data) {
                        _onCallback(_data);
                        _data = undefined;
                        _onCallback = undefined;
                    }
                }, false);
                return;
            }
        })

        popup.removeClass('sui-popup-on');
        if($('.sui-popup-on').length <= 0) {
            $('body').removeClass('forbid-scroll').off('touchmove'); // 启用滚动
        }
    }
    
    $.setPopupData = function(data) {
        _data = data;
    }
    
    // 自动初始化
    $('.sui-popup-container,.sui-mask,.sui-popup-modal').css('display', 'none');
    $('.open-popup').on('click', function() {
        $('#' + $(this).data("target")).popup();
    });
    $('.close-popup').on('click', function(e) {
        $('#' + $(this).data("target")).closePopup();
    });
    $('.sui-mask').on('click', function() {
        $(this).parent().closePopup();
    });
    
    var stY = 0, etY = 0;
	$('.sui-popup-modal').on('touchstart', function() {
		etY = $(this).scrollTop();
		stY = event.touches[0].pageY;
	});
	$('.sui-popup-modal').on('touchmove', function(event) {
        if (event.targetTouches.length == 1) {
            event.preventDefault();
		    var scrollY = stY - event.touches[0].pageY;
		    $(this).scrollTop(scrollY + etY);
        }
	});
    
    // 打开和关闭必须是单列的
    $.fn.popup = function(effect, onOpen, onCallback) {
        if(typeof effect == 'function') {
            onOpen = arguments[0];
            onCallback = arguments[1];
            effect = 'modal';
        }
        
        if($(this).length > 1) return;
        return $.openPopup(this, effect, onOpen, onCallback);
    }
    
    $.fn.closePopup = function(callback) {
        if($(this).length > 1) return;
        return $.closePopup(this, callback);
    }
})(Zepto);

// scrollPage.js
// author: huanghai
// date: 2016-09-27

;(function($) {
    "use strict";

    var rollPage = function(el, callback) {
        var element = $(el);
        var scrollContainer = (el[0].tagName.toUpperCase() === "BODY" ? $(document) : $(el));
        scrollContainer.on('scroll', function() {
            var offset = element.outerHeight() - ($(window).height() + element.scrollTop());
            if(offset <= 20) {
                callback();
            }
        });
    }
    
    var destroy = function(el) {
        var scrollContainer = (el[0].tagName.toUpperCase() === "BODY" ? $(document) : $(el));
        scrollContainer.off('scroll');
    }
    
    $.fn.rollPage = function(config, callback) {
        switch(config) {
            case 'load':
                rollPage(this, callback);
                break;
            case 'destroy':
                destroy(this);
                break;
            default:
                return;
        }
    }
    
    $.fn.loading = function(text) {
        var element = $(this);
        if(element.next('.sui-loading-wrap').length > 0) {
            return;
        }
        text = text || '正在加载中...';
        
        var strHtml = '<div class="sui-loading-wrap"><i class="sui-loading"></i><span>' + text + '</span></div>';
        element.after(strHtml);
    }
    
    $.fn.hideLoading = function() {
        $(this).next('.sui-loading-wrap').remove();
    }
    
})(Zepto);