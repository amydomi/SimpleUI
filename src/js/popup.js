
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
    
    $.openPopup = function(popup, effect, onHide) {
        var flag = false;
        $.each(_effectList, function(name, value) {
           if(effect == name) {
               flag = true;
               return;
           }
        });
        if(!flag) effect = 'modal';
        
        popup = $(popup);
        var mask = popup.children('.sui-mask');
        var modal = popup.children('.sui-popup-modal');
        //z-index  mask的z-index是1000， modeal默认从1001开始
        var zIndex = $('.sui-popup-on');
        zIndex = zIndex ? zIndex.length + 1001 : 1001;
        
        // 如果是已经展开了，只要改变z-index让其显示即可。
        if(popup.hasClass('sui-popup-on')) {
            modal.css('z-index', zIndex);
            return;
        }
        
        popup.onHide = onHide;
        modal.addClass(_effectList[effect][0]);
        
        
        popup.css('display', 'block').addClass('sui-popup-on');
        mask.css('display', 'block');
        modal.css('display', 'block').css('z-index', zIndex);
        modal.scrollTop(0);

        // 动画效果
        setTimeout(function() {
            mask.addClass('sui-mask-visible');
            modal.addClass(_effectList[effect][1]);
        }, 2);
        
        if(!$('body').hasClass('forbid-scroll')) {
            $('body').addClass('forbid-scroll').on('touchmove', function(event){
                event.preventDefault();
            });
        }
    }
    
    $.closePopup = function(popup) {
        popup = $(popup);
        var mask = popup.children('.sui-mask');
        var modal = popup.children('.sui-popup-modal');
        
        mask.removeClass('sui-mask-visible').transitionEnd(function(){
            $(this).css('display', 'none');
        }, false);
        
        $.each(_effectList, function(name, value) {
            if(modal.hasClass(value[1])) {
                modal.removeClass(value[1]).transitionEnd(function(){
                    $(this).css('display', 'none').removeClass(value[0]);
                    popup.css('display', 'none');
                }, false);
                return;
            }
        })
        
        if(popup.onHide && typeof popup.onHide == 'function') {
            popup.onHide();
            popup.onHide = undefined;
        }
        popup.removeClass('sui-popup-on');
        if($('.sui-popup-on').length <= 0) {
            $('body').removeClass('forbid-scroll').off('touchmove'); // 启用滚动
        }
    }
    
    // 自动初始化
    $('.sui-popup-container,.sui-mask,.sui-popup-modal').css('display', 'none');
    $('.open-popup').on('click', function() {
        $('#' + $(this).data("target")).popup();
    });
    $('.close-popup').on('click', function(e) {
        $('#' + $(this).data("target")).closePopup();
    });
    $('.sui-mask').on('click', function() {
        $(this).parent().closePopup();
    });
    
    var stY = 0, etY = 0;
	$('.sui-popup-modal').on('touchstart', function() {
		etY = $(this).scrollTop();
		stY = event.touches[0].pageY;
	});
	$('.sui-popup-modal').on('touchmove', function(event) {
		var scrollY = stY - event.touches[0].pageY;
		$(this).scrollTop(scrollY + etY);
	});
    
    // 打开和关闭必须是单列的
    $.fn.popup = function(effect, onHide) {
        if(typeof effect == 'function') {
            onHide = arguments[1];
            effect = 'modal';
        }
        
        if($(this).length > 1) return;
        return $.openPopup(this, effect, onHide);
    }
    
    $.fn.closePopup = function() {
        if($(this).length > 1) return;
        return $.closePopup(this);
    }
})(Zepto);