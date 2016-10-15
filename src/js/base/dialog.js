
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
                '<button{{?v.className}} class="{{=v.className}}"{{?}}>{{=v.text}}</button>' +
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
    
    $.alert = function(text, title, buttons, onOk) {
        var config;
        if(typeof text == 'object') {
            config = text;
        } else {
            if(typeof title == 'function') {
                onOk = arguments[1];
                buttons = [_defaults.okVal];
                title = undefined;
            } else if(title instanceof Array) {
                buttons = arguments[1];
                onOk = arguments[2];
                title = undefined;
            } else if(typeof buttons == 'function') {
                onOk = arguments[2];
                buttons = [_defaults.okVal];
            }
            
            config = {
                text: text,
                title: title,
                onOk: onOk,
                okVal: buttons && buttons[0] ? buttons[0] : _defaults.okVal
            }
        }
        
        $.dialog({
            text: config.text,
            title: config.title,
            buttons: [{
                text: config.okVal,
                onClick: config.onOk
            }]
        });
        $('body').addClass('forbid-scroll').on('touchmove', function(event){
            event.preventDefault();
        });
    }
    
    $.confirm = function(text, title, buttons, onOk, onCancel) {
        var config;
        if(typeof text == 'object') {
            config = text;
        } else {
            if (typeof title == 'function') {
                onOk = arguments[1];
                onCancel = arguments[2];
                title = undefined;
                buttons = [_defaults.cancelVal, _defaults.okVal];
            } else if(title instanceof Array) {
                buttons = arguments[1];
                onOk = arguments[2];
                onCancel = arguments[3];
                title = undefined;
            } else if(typeof buttons == 'function') {
                onOk = arguments[2];
                onCancel = arguments[3];
                buttons = [_defaults.cancelVal, _defaults.okVal];
            }
            
            config = {
                text: text,
                title: title,
                onOk: onOk,
                onCancel: onCancel,
                cancelVal: buttons && buttons[0] ? buttons[0] : _defaults.cancelVal,
                okVal: buttons && buttons[1] ? buttons[1] : _defaults.okVal
            }
        }
        
        $.dialog({
            text: config.text,
            title: config.title,
            buttons: [{
                className: 'sui-dialog-cancel',
                text: config.cancelVal,
                onClick: config.onCancel
            }, {
                text: config.okVal,
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