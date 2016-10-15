## 对话框组件
对话框组件完全是封装成JS插件方式调用。

##### Dialog 接口原型

默认值：
	
	$.dialog.prototype.defaults = {
        title(标题): string
        text(内容): string
        okVal(确定按钮文本): string
        cancelVal(取消按钮文本): string
        autoClose(是否自动关闭): boolean
        html(附加HTML): string
        maxButton(按钮最大数量): number
    }

##### Alert
功能描述：模拟原生window.alert，有一个确定按钮。

```javascript
   $.alert(text, title, buttons, onOk);
   $.alert(text, title, onOk);
   $.alert(text, onOk);
   $.alert(config);
```

	@param
	text(内容): string
	title(标题): string | undefined
	buttons(按钮提示文本): array | undefined  默认:['确定']
	onOk(确定事件): function | undefined
	config(上述配置综合): object
			按钮文本不使用buttons: okVal: '确定'

##### Confirm
功能描述：模拟原生window.confirm，有取消和确定按钮。

```javascript
   $.confirm(text, title, buttons, onOk, onCancel);
   $.confirm(text, title, onOk, onCancel);
   $.confirm(text, onOk, onCancel);
   $.confirm(config);
```

	@param
	text(内容): string
	title(标题): string | undefined
	buttons(按钮提示文本): array | undefined   默认:['取消', '确定']
	onOk(确定事件): function | undefined
	onCancel(取消事件): function | undefined
	config(上述配置综合): object
			按钮文本不使用buttons：okVal: '确定', canVal: 取消

##### Prompt
功能描述：模拟原生window.prompt，有取消和确定和一个输入框。

```javascript
   $.prompt(title, text, onOk, onCancel, placeholder, input);
   $.prompt(title, onOk, onCancel, placeholder, input);
   $.prompt(config);
```

	@param
	title(内容): string
	text(标题): string
	onOk(确定事件): function(data(输入的内容):string | array)          
	onCancel(取消事件): function | undefined
	placeholder(输入框提示): string | undefined
	input(输入框默认值): string | undefined
	config(上述配置综合): object

##### Dialog
功能描述：自定义Dialog，具体项目运用中可使用此接口扩展更多弹出框功能，可传递html进行自由定制。

```javascript
	$.dialog(config);
```

	@param
	@config(详细配置如下, 下面的配置任一项都可以不传递): object
	title(标题): string
	text(内容): string
	html(附加的HTML，显示在text下面): string
	autoClose(自动关闭): boolean
	buttons(按钮组): array[{text(文本): string, onClick(点击事件): function}, ...]

当 autoClose 设为false，需要手动调用此函数进行关闭。

```javascript
$.closeDialog();
```

----------




##### ActionSheet 接口原型

默认值：

	$.actionSheet.prototype.defaults = {
	    title(标题): string,
	    onClose(关闭事件): function
	    autoClose(自动关闭): boolean
	    cancelClass(取消按钮样式): string
	    cancelText(取消按钮文本): string
	}

##### ActionSheet
功能描述：模拟IOS原生UIActionSheet控件，展示效果参考了微信。

```javascript
	$.actionSheet(buttons, title, onClose, autoClose);
	$.actionSheet(buttons, onClose, autoClose);
```

	@param
	buttons(按钮组): array[{text(文本): string, onClick(点击事件): function}, ...]
	title(标题): string | undefined
	onClose(取消事件): function | undefined
	autoClose(是否自动关闭): boolean | undefined

当autoClose设置为false，需要调用此函数进行关闭，此函数不会触发onClose事件。

```javascript
$.closeActionSheet()
```

[查看DEMO示例](https://dusksoft.github.io/SimpleUI/demo/dialog.html) | [返回文档首页](index.md)
