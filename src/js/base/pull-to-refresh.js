// pull-to-refresh.js
// author: huanghai
// date: 2017-10-23

;(function($) {
    "use strict";

    $.support = (function() {
        var support = {
            touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
        return support;
    })();

    $.getTouchPosition = function(e) {
        e = e.originalEvent || e;
        if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
            return {
                x: e.targetTouches[0].pageX,
                y: e.targetTouches[0].pageY
            };
        } else {
            return {
                x: e.pageX,
                y: e.pageY
            };
        }
    };

    $.touchEvents = {
        start: $.support.touch ? 'touchstart': 'mousedown',
        move: $.support.touch ? 'touchmove': 'mousemove',
        end: $.support.touch ? 'touchend': 'mouseup'
    };

    var PTR = function(el) {
        this.container = $(el);
        this.distance = 50;
        this.attachEvents();
    }

    PTR.prototype.touchStart = function(e) {
		if($(window).scrollTop() > 0) return;
        if (this.container.hasClass("refreshing")) return;
        var p = $.getTouchPosition(e);
        this.start = p;
        this.diffX = this.diffY = 0;
    };

    PTR.prototype.touchMove = function(e) {
		if($(window).scrollTop() > 0) return;
        if (this.container.hasClass("refreshing")) return;
        if (!this.start) return false;
        if (this.container.scrollTop() > 0) return;
        var p = $.getTouchPosition(e);
        this.diffX = p.x - this.start.x;
        this.diffY = p.y - this.start.y;
        if (this.diffY < 0) return;
        this.container.addClass("touching");
        e.preventDefault();
        e.stopPropagation();
        this.diffY = Math.pow(this.diffY, 0.8);
        this.container.css("transform", "translate3d(0, " + this.diffY + "px, 0)");

        if (this.diffY < this.distance) {
            this.container.removeClass("pull-up").addClass("pull-down");
        } else {
            this.container.removeClass("pull-down").addClass("pull-up");
        }
    };
    PTR.prototype.touchEnd = function() {
		if($(window).scrollTop() > 0) return;
        this.start = false;
        if (this.diffY <= 0 || this.container.hasClass("refreshing")) return;
        this.container.removeClass("touching");
        this.container.removeClass("pull-down pull-up");
        this.container.css("transform", "");
        if (Math.abs(this.diffY) <= this.distance) {} else {
            this.container.addClass("refreshing");
            this.container.trigger("pull-to-refresh");
        }
    };

    PTR.prototype.attachEvents = function() {
        var el = this.container;
        el.addClass("sui-pull-to-refresh");
        el.on($.touchEvents.start, $.proxy(this.touchStart, this));
        el.on($.touchEvents.move, $.proxy(this.touchMove, this));
        el.on($.touchEvents.end, $.proxy(this.touchEnd, this));
    };

    var pullToRefresh = function(el) {
        new PTR(el);
    };

    var pullToRefreshDone = function(el) {
        $(el).removeClass("refreshing");
    }

    $.fn.pullToRefresh = function() {
        return this.each(function() {
            pullToRefresh(this);
        });
    }

    $.fn.pullToRefreshDone = function() {
        return this.each(function() {
            pullToRefreshDone(this);
        });
    }
})(Zepto);