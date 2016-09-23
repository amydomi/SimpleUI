;(function($) {
    "use strict";
    
    // duration 动画效果执行所需事件，不传递默认300毫秒
    $.fn.transitionEnd = function(callback, duration) {
        var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
        var element = this;

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
            if($.browser.ios) {
                setTimeout(function() {
                    element.remove();
                }, duration || 300);
            }
        }
        return element;
    };

})(Zepto);
