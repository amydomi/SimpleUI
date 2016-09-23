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
        
        if(typeof isClear == 'number') {
            duration = arguments[1];
            isClear = undefined;
        }
        isClear = isClear || true;
        
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
