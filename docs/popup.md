## Popup组件
Popup组件需要使用HTML + Js方式才能完整运行起来。

##### HTML
在页面中定义popup面板的html代码。

```html
<!--popup start-->
<div id="popup1" class="sui-popup-container">
	<div class="sui-mask"></div>
	<div class="sui-popup-modal">
		<!--内容开始-->
		具体的内容放在这里...
		<!--内容结束-->
	</div>
</div>
<!--popup end-->

<!--popup start-->
<div id="popup2" class="sui-popup-container">
	<div class="sui-mask"></div>
	<div class="sui-popup-modal">
		<!--内容开始-->
		具体的内容放在这里...
		<!--内容结束-->
	</div>
</div>
<!--popup end-->
```
说明：其中id项是唯一的，也是必须的，一个页面可以允许多个popup面板的存在。

##### 展开popup面板
使用js方式显示。

```javascript
	// 元素插件调用方式
	$('#popup1').popup(effect, onOpen, onCallback);
	$('#popup1').popup(onOpen, onCallback);
	
	// 全局对象方式调用
	$.openPopup(popup, effect, onOpen, onCallback);
```

	@param
	popup(HTML元素对象): object
	effect(显示效果): string | undefined
		显示效果分别为：
		1. push [从右边向左边滑出，盖满整个屏幕]
		2. modal [从下往上滑出，盖满整个屏幕]
		3. menu [从左往右滑出，没有完全盖满屏幕，类似侧边栏菜单效果]
		4. plate [从下往上滑出, 显示大小根据内容而定，内容尽量不要超过整个屏幕，因为此效果无滚动条]
		
	onOpen(面板打开事件): function | undefined
        在面板动画载入前执行。
        
    onCallback(data)(关闭回调事件): function | undefined
        1.此事件在关闭面板后触发。
        2.此事件必须设置 $.setPopupData(data) 传递数据后才会被触发。
	
	注意：请保证传入的popup元素为单例，如果多个popup元素则无法正确调用。

	
html方式显示
```html
	<div class="open-popup" data-target="popup1">显示</div>
```
组件自动为 class="open-popup" 绑定事件，并且显示 popup1 面板

----------



##### 面板共享数据
设置面板共享数据
```javascript
	$.setPopupData(data)
```

为面板设置一个回调数据。

示例:
```javascript
// 打开面板
$(function() {
    $('#popup1').popup(function() {
        console.log('open');
    }, function(data) {
        // 打开面板后，监听数据传递，当关闭面板时有数据传递，则处理回传的数据
        console.log('参数收到了，值是：' + data);
    });
});


// 关闭面板
$(function() {
    // 将数据传递给调用者，此方法必须在关闭面板前设置，否则调用者无法接受到数据
    $.setPopupData('将数据传递给调用者。。。');
    // 关闭面板
    $('#popup1').closePopup();
})
```

----------



##### 关闭popup面板
关闭的popup面板不会销毁，只是把面板隐藏而已。


使用js方式显示显示。
```javascript
	// 元素插件调用方式
	$('#popup1').closePopup(callback);
	
	// 全局对象方式调用
	$.closePopup(popup, callback);
```

使用全局方式关闭，需要传递一个元素节点参数来保证正确的关闭面板。


html方式展开
```html
	<div class="close-popup" data-target="popup1">关闭</div>
```
组件自动为 class="close-popup" 绑定事件，并且隐藏 popup1 面板

[查看DEMO示例](https://dusksoft.github.io/SimpleUI/demo/popup.html) | [返回文档首页](index.md)
