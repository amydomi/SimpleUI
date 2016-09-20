
// dialog.js
// author: huanghai
// date: 2016-09-19

;(function($) {
    "use strict";
    
    var defaults;
    $.dialog = function(params) {
        params = (typeof params == 'object') ? params : {};

        if(typeof params.buttons == 'undefined') {
            params['buttons'] = [{text: defaults.okVal}];
        }
        
        params = $.extend({}, defaults, params);
        var buttons = params.buttons;
        
        var strHtml = '<div class="sui-dialog">' +
               '<div class="sui-dialog-hd"><%=data.title%></div>' +
               '<div class="sui-dialog-bd sui-border-b">' + 
               '<div class="sui-dialog-text"><%=data.text%></div><%=data.html%>' +
               '</div>' +
               '<div class="sui-dialog-ft">' +
               '<%for(var i=0;i<data.buttons.length&&i<data.maxButton;i++){%>' +
                '<button><%=data.buttons[i].text%></button>' +
               '<%}%>' +
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
        $('.sui-mask').removeClass('sui-mask-visible').transitionEnd(function() {
            $(this).remove();
        });
        $('.sui-dialog').removeClass('sui-dialog-visible').transitionEnd(function() {
            $(this).remove();
        });
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
                text: defaults.okVal,
                onClick: config.onOk
            }]
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
                text: defaults.cancelVal,
                onClick: config.onCancel
            }, {
                text: defaults.okVal,
                onClick: config.onOk
            }]
        });
    }
    
    $.prompt = function(title, text, onOk, onCancel, placeholder) {
        var config;
        if (typeof title === 'object') {
          config = title;
        } else {
            if (typeof text === 'function') {
                placeholder = arguments[3];
                onCancel = arguments[2];
                onOk = arguments[1];
                title = undefined;
            }
            
            config = {
                text: text,
                title: title,
                placeholder: placeholder,
                onOk: onOk,
                onCancel: onCancel,
                empty: false
            }
        }
        
        $.dialog({
            text: config.text,
            title: config.title,
            html: '<div class="sui-dialog-input"><input type="text" placeholder="'+ (config.placeholder || '') + '" /></div>',
            autoClose: false,
            buttons: [{
                text: defaults.cancelVal,
                onClick: function() {
                    $.closeDialog();
                    if(config.onCancel) config.onCancel();
                }
            }, {
                text: defaults.okVal,
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
    defaults = $.dialog.prototype.defaults = {
        title: '温馨提示',
        text: '',
        okVal: '确定',
        cancelVal: '取消',
        autoClose: true,    // 是否自动关闭
        html: '',           // 自定义html
        maxButton: 3        // 按钮数量，默认最多显示3个按钮
    }
})(Zepto);