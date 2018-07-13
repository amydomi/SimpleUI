## Toast组件
Toast组件完全是封装成JS插件方式调用。

##### Toast 接口原型

默认值：
	
	$.toast.prototype.defaults = {
        duration(自动消失时间,单位：毫秒，默认2000): number
    }

##### Text (文本Toast)
功能描述：<br/>
1.距离屏幕底部一小段文字提示，没其他修饰。<br/>
2.不配置2000毫秒自动消失。

```javascript
   $.toast(text, destroy);
```

	@param
	text(内容): string
	destroy(销毁事件): function | undefined

##### Success (成功Toast)
功能描述：<br/>
1.在屏幕中心位置显示一个正方形的提示框，Icon为一个 ”√“。<br/>
2.不配置2000毫秒自动消失。<br/>
3.默认文本显示：操作成功。

```javascript
   $.toastSuccess(text, destroy);
   $.toastSuccess(destroy);
```

	@param
	text(内容，默认：操作成功): string
	destroy(销毁事件): function | undefined

##### Error (失败Toast)
功能描述：<br/>
1.在屏幕中心位置显示一个正方形的提示框，Icon为一个 ”×“。<br/>
2.不配置2000毫秒自动消失。<br/>
3.默认文本显示：操作失败。

```javascript
   $.toastError(text, destroy);
   $.toastError(destroy);
```

	@param
	text(内容，默认：操作成功): string
	destroy(销毁事件): function | undefined


##### Loading （正在加载中提示）
功能描述：<br/>
1.在屏幕中心位置显示一个正方形的提示框，Icon为一个不停旋转的菊花。<br/>
2.不会自动消失，需要手动调用代码关闭。<br/>
3.默认文本显示：数据加载中。
4.initLoading 和 showLoading 的区别: initLoading主要用在页面初始化时加载数据，会将整个页面遮挡起来，防数据不全显示体验不好。
```javascript
	$.showLoading(text);
	$.initLoading(text);
```
	@param
	text(内容，默认：操作成功): string

手工调用代码关闭。

```javascript
$.hideLoading();
```

----------


##### Common Toast
功能描述：通用Toast显示方式，参数很多，用起来麻烦，所以推荐使用上面的专用接口调用。

```javascript
   $.toast(text, style, duration, destroy);
   $.toast(text, style, destroy);
   $.toast(config);
```

	@param
	text(内容): string
	style(显示样式): string ('success', 'error', 'text', 'loading')
	duration(自动消失时间): number
	destroy(销毁事件): function | undefined

备注：<br/>
1. style 为 loading 时 destroy 无效。<br/>
2. style 为 loading 时不会自动关闭，需要调用$.hideLoading() 进行手工关闭。



[查看DEMO示例](https://seawongcn.github.io/SimpleUI/demo/toast.html) | [返回文档首页](index.md)
