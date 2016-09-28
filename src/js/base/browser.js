;(function($) {
    "use strict";
    
    var ua = navigator.userAgent.toLowerCase();
    $.browser = {
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
    
})(Zepto);

// fastclick start
$(function() {
    FastClick.attach(document.body);
});