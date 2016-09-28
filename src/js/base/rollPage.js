
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