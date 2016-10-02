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
	
	$.fn.transform = function(transform) {
		for (var i = 0; i < this.length; i++) {
			var elStyle = this[i].style;
			elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
		}
		return this;
	};
	
	$.fn.transition = function(duration) {
		if (typeof duration !== 'string') {
			duration = duration + 'ms';
		}
		for (var i = 0; i < this.length; i++) {
			var elStyle = this[i].style;
			elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
		}
		return this;
	};
	
	$.getTranslate = function (el, axis) {
		var matrix, curTransform, curStyle, transformMatrix;

		// automatic axis detection
		if (typeof axis === 'undefined') {
			axis = 'x';
		}

		curStyle = window.getComputedStyle(el, null);
		if (window.WebKitCSSMatrix) {
			// Some old versions of Webkit choke when 'none' is passed; pass
			// empty string instead in this case
			transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
		}
		else {
			transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
			matrix = transformMatrix.toString().split(',');
		}

		if (axis === 'x') {
			//Latest Chrome and webkits Fix
			if (window.WebKitCSSMatrix) {
				curTransform = transformMatrix.m41;
				//Crazy IE10 Matrix
			} else if (matrix.length === 16) {
				curTransform = parseFloat(matrix[12]);
				//Normal Browsers
			} else {
				curTransform = parseFloat(matrix[4]);
			}
		}
		
		if (axis === 'y') {
			//Latest Chrome and webkits Fix
			if (window.WebKitCSSMatrix) {
				curTransform = transformMatrix.m42;
				//Crazy IE10 Matrix
			} else if (matrix.length === 16) {
				curTransform = parseFloat(matrix[13]);
				//Normal Browsers
			} else {
				curTransform = parseFloat(matrix[5]);
			}
		}

		return curTransform || 0;
	};
	
	$.requestAnimationFrame = function (callback) {
		if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
		else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
		else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
		else {
			return window.setTimeout(callback, 1000 / 60);
		}
	};

	$.cancelAnimationFrame = function (id) {
		if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
		else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
		else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
		else {
			return window.clearTimeout(id);
		}  
	};

})(Zepto);
