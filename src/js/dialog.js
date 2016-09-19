
// dialog.js
// author: huanghai
// date: 2016-09-19

;(function($) {
    "use strict";
    
    var defaults;
    $.modal = function(params) {
        params = (typeof params == 'object') ? params : {};

        if(typeof params.buttons == 'undefined') {
            params['buttons'] = [{text: defaults.okVal}];
        }
        
        params = $.extend(defaults, params);
        var buttons = params.buttons;
        
        var tplString = '<div class="sui-dialog">' +
               '<div class="sui-dialog-hd"><%=data.title%></div>' +
               '<div class="sui-dialog-bd sui-border-b"><%=data.content%></div>' +
               '<div class="sui-dialog-ft">' +
               '<%for(var i=0;i<data.buttons.length;i++){%>' +
                '<button><%=data.buttons[i].text%></button>' +
               '<%}%>' +
               '</div>' +
           '</div>';
        var template = $(doT.template(tplString)(params));
        var mask = $('<div class="sui-mask"></div>').appendTo(document.body).css('display', 'block');
        var dialog = template.appendTo(document.body).css('display', 'block');
        
        // 动画效果
        setTimeout(function() {
            mask.addClass('sui-mask-visible');
            dialog.addClass('sui-dialog-visible');
        }, 0);
        
        // 按钮事件处理
        dialog.find('button').each(function(i, el) {
            $(el).on('click', function() {
                if(params.autoClose) $.closeModel();
                if($.isFunction(buttons[i].onClick)) buttons[i].onClick();
            });
        });
    }
    
    $.closeModel = function() {
        $('.sui-mask').removeClass('sui-mask-visible').transitionEnd(function() {
            $(this).remove();
        });
        $('.sui-dialog').removeClass('sui-dialog-visible').transitionEnd(function() {
            $(this).remove();
        });
    }
    
    $.alert = function(content, onOk, title) {
        
    }
    
    $.confirm = function(content, onOk, onCancel, title) {
        
    }
    
    // 默认配置
    defaults = $.modal.prototype.defaults = {
        title: '温馨提示',
        content: undefined,
        okVal: '确定',
        cancelVal: '取消',
        autoClose: true
    }
})(Zepto);