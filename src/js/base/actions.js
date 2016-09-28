
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