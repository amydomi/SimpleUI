/*!
 * SimpleUI v0.0.8
 * URL: https://github.com/dusksoft/SimpleUI#readme
 * (c) 2016 by huanghai. All rights reserved.
 * Licensed under the MIT license
 */
// doT.js
// 2011-2014, Laura Doktorova, https://github.com/olado/doT
// Licensed under the MIT license.

(function() {
	"use strict";
    
    // override:
    // 语法修改 {{}} 改为 <%%>
    // varname： 'it' 改为 data
	var doT = {
		version: "1.0.3",
		templateSettings: {
			evaluate:    /\<\%([\s\S]+?(\}?)+)\%\>/g,
			interpolate: /\<\%=([\s\S]+?)\%\>/g,
			encode:      /\<\%!([\s\S]+?)\%\>/g,
			use:         /\<\%#([\s\S]+?)\%\>/g,
			useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
			define:      /\<\%##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\%\>/g,
			defineParams:/^\s*([\w$]+):([\s\S]+)/,
			conditional: /\<\%\?(\?)?\s*([\s\S]*?)\s*\%\>/g,
			iterate:     /\<\%~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\%\>)/g,
			varname:	"data",     // 原来是it，现在改为data方便使用
			strip:		true,
			append:		true,
			selfcontained: false,
			doNotSkipEncoded: false
		},
		template: undefined, //fn, compile template
		compile:  undefined  //fn, for express
	}, _globals;

	doT.encodeHTMLSource = function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	};

	_globals = (function(){ return this || (0,eval)("this"); }());

	if (typeof module !== "undefined" && module.exports) {
		module.exports = doT;
	} else if (typeof define === "function" && define.amd) {
		define(function(){return doT;});
	} else {
		_globals.doT = doT;
	}

	var startend = {
		append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
		split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
	}, skip = /$^/;

	function resolveDefs(c, block, def) {
		return ((typeof block === "string") ? block : block.toString())
		.replace(c.define || skip, function(m, code, assign, value) {
			if (code.indexOf("def.") === 0) {
				code = code.substring(4);
			}
			if (!(code in def)) {
				if (assign === ":") {
					if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
						def[code] = {arg: param, text: v};
					});
					if (!(code in def)) def[code]= value;
				} else {
					new Function("def", "def['"+code+"']=" + value)(def);
				}
			}
			return "";
		})
		.replace(c.use || skip, function(m, code) {
			if (c.useParams) code = code.replace(c.useParams, function(m, s, d, param) {
				if (def[d] && def[d].arg && param) {
					var rw = (d+":"+param).replace(/'|\\/g, "_");
					def.__exp = def.__exp || {};
					def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
					return s + "def.__exp['"+rw+"']";
				}
			});
			var v = new Function("def", "return " + code)(def);
			return v ? resolveDefs(c, v, def) : v;
		});
	}

	function unescape(code) {
		return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
	}

	doT.template = function(tmpl, c, def) {
		c = c || doT.templateSettings;
		var cse = c.append ? startend.append : startend.split, needhtmlencode, sid = 0, indv,
			str  = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

		str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
					.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""): str)
			.replace(/'|\\/g, "\\$&")
			.replace(c.interpolate || skip, function(m, code) {
				return cse.start + unescape(code) + cse.end;
			})
			.replace(c.encode || skip, function(m, code) {
				needhtmlencode = true;
				return cse.startencode + unescape(code) + cse.end;
			})
			.replace(c.conditional || skip, function(m, elsecase, code) {
				return elsecase ?
					(code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
					(code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
			})
			.replace(c.iterate || skip, function(m, iterate, vname, iname) {
				if (!iterate) return "';} } out+='";
				sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
				return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
					+vname+"=arr"+sid+"["+indv+"+=1];out+='";
			})
			.replace(c.evaluate || skip, function(m, code) {
				return "';" + unescape(code) + "out+='";
			})
			+ "';return out;")
			.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
			.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
			//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

		if (needhtmlencode) {
			if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
			str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
				+ doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
				+ str;
		}
		try {
			return new Function(c.varname, str);
		} catch (e) {
			if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
			throw e;
		}
	};

	doT.compile = function(tmpl, def) {
		return doT.template(tmpl, null, def);
	};
}());

;(function($) {
    "use strict";
    $.browser = function() {
        var ua = navigator.userAgent.toLowerCase();
        return {
            trident: ua.indexOf('trident') > -1,                                //IE内核
            presto: ua.indexOf('presto') > -1,                                  //opera内核
            webKit: ua.indexOf('applewebkit') > -1,                             //苹果、谷歌内核
            gecko: ua.indexOf('gecko') > -1 && ua.indexOf('khtml') == -1,       //火狐内核
            mobile: !!ua.match(/AppleWebKit.*Mobile.*/i),                       //为移动终端
            ios: !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/i),                  //ios终端
            android: ua.indexOf('android') > -1 || ua.indexOf('linux') > -1,    //android终端或者uc浏览器
            iPhone: ua.indexOf('iphone') > -1 ,                                 //为iPhone或者QQHD浏览器
            iPad: ua.indexOf('ipad') > -1,                                      //iPad
            webApp: ua.indexOf('safari') == -1,                                 //web应该程序，没有头部与底部
            wechat: ua.indexOf('micromessenger') > -1,                          //微信
            qq: ua.match(/\sQQ/i) == " qq",                                     //QQ客户端
            qqbrowser: ua.indexOf('qq')>-1,                                     //QQ浏览器
            sinaWeibo: ua.match(/WeiBo/i) == "weibo",                           //新浪微博客户端
            tencentWeibo: ua.match(/TencentMicroBlog/i) == 'tencentmicroblog',  //腾讯微博客户端
            qhbrowser: ua.match(/QhBrowser/i) == 'qhbrowser'                    //360浏览器
        }
    }
})(Zepto);
;(function($) {
  "use strict";

  $.fn.transitionEnd = function(callback) {
    var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
      i, dom = this;

    function fireCallBack(e) {
      /*jshint validthis:true */
      if (e.target !== this) return;
      callback.call(this, e);
      for (i = 0; i < events.length; i++) {
        dom.off(events[i], fireCallBack);
      }
    }
    if (callback) {
      for (i = 0; i < events.length; i++) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  };

  $.support = (function() {
    var support = {
      touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
    };
    return support;
  })();

  $.touchEvents = {
    start: $.support.touch ? 'touchstart' : 'mousedown',
    move: $.support.touch ? 'touchmove' : 'mousemove',
    end: $.support.touch ? 'touchend' : 'mouseup'
  };

  $.getTouchPosition = function(e) {
    e = e.originalEvent || e; //jquery wrap the originevent
    if(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
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

  $.fn.scrollHeight = function() {
    return this[0].scrollHeight;
  };

  $.fn.transform = function(transform) {
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
    }
    return this;
  };
  $.fn.transition = function(duration) {
    if (typeof duration !== 'string') {
      duration = duration + 'ms';
    }
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
    }
    return this;
  };

  $.getTranslate = function (el, axis) {
    var matrix, curTransform, curStyle, transformMatrix;

    // automatic axis detection
    if (typeof axis === 'undefined') {
      axis = 'x';
    }

    curStyle = window.getComputedStyle(el, null);
    if (window.WebKitCSSMatrix) {
      // Some old versions of Webkit choke when 'none' is passed; pass
      // empty string instead in this case
      transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
    }
    else {
      transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
      matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix)
        curTransform = transformMatrix.m41;
      //Crazy IE10 Matrix
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[12]);
      //Normal Browsers
      else
        curTransform = parseFloat(matrix[4]);
    }
    if (axis === 'y') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix)
        curTransform = transformMatrix.m42;
      //Crazy IE10 Matrix
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[13]);
      //Normal Browsers
      else
        curTransform = parseFloat(matrix[5]);
    }

    return curTransform || 0;
  };
  $.requestAnimationFrame = function (callback) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
    else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
    else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
    else {
      return window.setTimeout(callback, 1000 / 60);
    }
  };

  $.cancelAnimationFrame = function (id) {
    if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
    else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
    else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
    else {
      return window.clearTimeout(id);
    }  
  };

  $.fn.join = function(arg) {
    return this.toArray().join(arg);
  }
})($);


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
            html: '<div class="sui-dialog-prompt"><input type="text" placeholder="'+ (config.placeholder || '') + '" /></div>',
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
                    if(config.empty && data.length <= 0) {
                        $('.sui-dialog-prompt input').focus()[0].select();
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