
// popup.js
// author: huanghai
// date: 2016-09-27

;(function($) {
    "use strict";
    
    // 组件支持的效果
    var _effectList = {
        push: ['sui-popup-effect-push', 'sui-popup-effect-push-visible'],
        modal: ['sui-popup-effect-modal', 'sui-popup-effect-modal-visible'],
        menu: ['sui-popup-effect-menu', 'sui-popup-effect-menu-visible'],
        plate: ['sui-popup-effect-plate', 'sui-popup-effect-plate-visible'],
    }
    
    var _onCallback = {}, _data = {};
    $.openPopup = function(popup, effect, onOpen, onCallback) {
        var flag = false;
        $.each(_effectList, function(name, value) {
           if(effect == name) {
               flag = true;
               return;
           }
        });
        if(!flag) effect = 'modal';
        
        popup = $(popup);
        var mask = popup.children('.sui-popup-mask');
        var modal = popup.children('.sui-popup-modal');
        var zIndex = $('.sui-popup-on');
        zIndex = zIndex ? zIndex.length + 8000 : 8000;
        
        // 如果是已经展开了，只要改变z-index让其显示即可。
        if(popup.hasClass('sui-popup-on')) {
            modal.css('z-index', zIndex);
            return popup;
        }
        
        // 展开前执行onPen事件
        if($.isFunction(onOpen)) {
            onOpen();
        }
        
        // 记录回调事件
        if(onCallback) {
            var id = $.createDatakey('popup');
            popup.data('key', id);
            _onCallback[id] = onCallback;
        }
        
        modal.addClass(_effectList[effect][0]);
        
        
        popup.css('display', 'block').addClass('sui-popup-on');
        mask.css('display', 'block');
        modal.css('display', 'block').css('z-index', zIndex);
        modal.scrollTop(0);

        // 动画效果
        setTimeout(function() {
            mask.addClass('sui-popup-mask-visible');
            modal.addClass(_effectList[effect][1]);
        }, 2);
        
        if(!$('body').hasClass('forbid-scroll')) {
            $('body').addClass('forbid-scroll').on('touchmove', function(event){
                event.preventDefault();
            });
        }
        
        return popup;
    }
    
    $.closePopup = function(popup, callback) {
        popup = $(popup);
        var mask = popup.children('.sui-popup-mask');
        var modal = popup.children('.sui-popup-modal');
        var key = popup.data('key');
        
        mask.removeClass('sui-popup-mask-visible').transitionEnd(function(){
            $(this).css('display', 'none');
        }, false);
        
        $.each(_effectList, function(name, value) {
            if(modal.hasClass(value[1])) {
                modal.removeClass(value[1]).transitionEnd(function(){
                    $(this).css('display', 'none').removeClass(value[0]);
                    popup.css('display', 'none');
					// 关闭时候执行的回调
                    if($.isFunction(callback)) callback();
                    // 打开时的回调事件，必须保证传递的数据不为空才会触发
                    if($.isFunction(_onCallback[key]) && _data[key]) {
                        _onCallback[key](_data[key]);
                        delete _data[key];
                        delete _onCallback[key];
                    }
                }, false);
                return;
            }
        })

        popup.removeClass('sui-popup-on');
        if($('.sui-popup-on').length <= 0) {
            $('body').removeClass('forbid-scroll').off('touchmove'); // 启用滚动
        }
        
        return popup;
    }
    
    $.setPopupData = function(popup, data) {
        popup = $(popup);
        var key = popup.data('key');
        if(key) {
            _data[key] = data;
        }
        return popup;
    }
    
    // 自动初始化
    $(function() {
        $('.sui-popup-container,.sui-popup-mask,.sui-popup-modal').css('display', 'none');
        $('.open-popup').on('click', function() {
            $('#' + $(this).data("target")).popup();
        });
        $('.close-popup').on('click', function(e) {
            $('#' + $(this).data("target")).closePopup();
        });
        $('.sui-popup-mask').on('click', function() {
            $(this).parent().closePopup();
        });
    });
    
    var stY = 0, etY = 0;
	$('.sui-popup-modal').on('touchstart', function() {
		etY = $(this).scrollTop();
		stY = event.touches[0].pageY;
	});
	$('.sui-popup-modal').on('touchmove', function(event) {
        if (event.targetTouches.length == 1) {
            event.preventDefault();
		    var scrollY = stY - event.touches[0].pageY;
		    $(this).scrollTop(scrollY + etY);
        }
	});
    
    // 打开和关闭必须是单列的
    $.fn.popup = function(effect, onOpen, onCallback) {
        if(typeof effect == 'function') {
            onOpen = arguments[0];
            onCallback = arguments[1];
            effect = 'modal';
        }
        
        if($(this).length > 1) return;
        $.openPopup(this, effect, onOpen, onCallback);
        return $(this);
    }
    
    $.fn.closePopup = function(callback) {
        if($(this).length > 1) return;
        return $.closePopup(this, callback);
        return $(this);
    }
    
    $.fn.setPopupData = function(data) {
        $.setPopupData(this, data);
        return $(this);
    }
})(Zepto);