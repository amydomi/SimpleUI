## 滚动到底部分页
前端不对所有功能逻辑做封装，包括Ajax的请求， 只对效果和事件进行封装，实际项目中需要对请求进行编码才能实现分页效果。

##### 滚动事件初始化
```javascript
	$(document.body).rollPage('load', callback);
```
因为滚动到底部会多次触发到事件，所以需要对事件上锁，具体逻辑代码[查看DEMO示例代码](../demo/rollPage.html)。

##### 销毁滚动事件
```javascript
	$(document.body).rollPage('destroy');
```

##### 显示加载器
``` javascript
	$('#datalist').loading();
```

##### 隐藏加载器
``` javascript
	$('#datalist').hideLoading();
```


----------

##### 示例代码：
```html
<div id="list" class="sui-mlr15"></div>
```

```javascript
$(function() {

	// 分页选项
	var _options = {
		number: 1,  // 页码
		flag: false // 事件锁
	};
	
	// 分页获取数据
	var requestServer = function() {

		// 显示分页指示器
		$('#list').loading();

		//模拟延迟, 假定这里是异步ajax的开始
		setTimeout(function() {

			// 渲染数据
			var strHtml ='';
			for(var i = 1; i < 31; i++) {
				strHtml += '<p>第' + _options.number + '页，第' + i + '条数据。</p>';
			}
			$('#list').append(strHtml);
			
			
			// 销毁分页指示器的逻辑：
			// 1.假定最大页码是5页, 已经到第5页，移除
			// 2.假定数据不满一页，没有滚动条时候，移除
			if(_options.number >= 5) {
				$(document.body).rollPage('destroy');   // 销毁事件
				$('#list').hideLoading();               // 隐藏分页指示器
				return;
			}
			
			
			_options.number++;       // 页码自增
			_options.flag = false;   // 数据渲染完成，事件解锁
			
		}, 1500);

	}
	
	// 页面加载完自动请求数据
	requestServer();
	
	$(document.body).rollPage('load', function() {
		
		// 事件锁, 防止频繁触发事件
		if(_options.flag) return;
		_options.flag = true;
		
		// 页面滚动到底部请求下一页
		requestServer();
		
	});
})
```

[查看DEMO示例](https://dusksoft.github.io/SimpleUI/demo/rollPage.html) | [返回文档首页](index.md)