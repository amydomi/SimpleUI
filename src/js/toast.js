
// toast.js
// author: huanghai
// date: 2016-09-22

;(function($) {
    "use strict";
    
    var _defaults, _destroy;
    var show = function(params, autoClose) {
        params = $.extend({}, _defaults, params);
        
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
        var mask = $('<div class="sui-mask-transparent"></div>').appendTo(document.body).css('display', 'block');
        var toast = template.appendTo(document.body).css('display', 'block');
        
        // 动画
        setTimeout(function() {
            mask.addClass('sui-mask-visible');
            if(params.style == 'text') {
                toast.addClass('sui-toast-content-visible');
            } else {
                toast.addClass('sui-toast-visible');
            }
        }, 0);
        
        if(autoClose && params.duration) {
            setTimeout(hide, params.duration);
        }
    }
    
    var hide = function() {
        var toast = $('.sui-toast');
        
        $('.sui-mask-transparent').removeClass('sui-mask-visible').transitionEnd(function() {
            $(this).remove();
        });
        
        if(toast.hasClass('sui-toast-visible')) {
            toast.removeClass('sui-toast-visible').transitionEnd(function(){
                $(this).remove();
            });
        } else {
            toast.removeClass('sui-toast-content-visible').transitionEnd(function(){
                $(this).remove();
            });
        }
        if($.isFunction(_destroy)) _destroy();
        _destroy = undefined;
    }
    
    $.toast = function(text, style, duration, destroy) {
        var config;
        if(typeof text == 'object') {
            config = text;
        } else {
            if(typeof style == 'undefined') {
                style = 'text';
                duration = _defaults.duration;
            } else if(typeof style == 'number') {
                duration = arguments[1];
                destroy = arguments[2];
                style = 'text';
            } else if(typeof duration == 'function') {
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
        
        _destroy = config.destroy;
        show(config, true);
    }
    
    $.toastSuccess = function(text, destroy) {
        $.toast(text || '操作成功', 'success', undefined, destroy);
    }
    
    $.toastError = function(text, destroy) {
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