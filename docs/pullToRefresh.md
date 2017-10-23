## 下拉刷新
原生滚动实现的下拉刷新。

##### HTML
在页面body后面增加如下的HTML

```html
<!--下拉刷新所需HTML-->
<div class="sui-pull-to-refresh-layer">
	<div class='sui-pull-to-refresh-arrow'></div>
	<div class='sui-pull-to-refresh-preloader'></div>
	<div class="down">下拉刷新</div>
	<div class="up">释放刷新</div>
	<div class="refresh">正在刷新</div>
</div>

##### javascript
监听pull-to-refresh事件
$(document.body).pullToRefresh().on("pull-to-refresh", function() {
	console.log('开始刷新');
	//使用setTimeout只是为了模拟异步请求
	setTimeout(function() {
		$(document.body).pullToRefreshDone(); // 刷新完毕调用此方法关闭
		$.toastSuccess('刷新成功。');
	}, 2000);
});

[查看DEMO示例](https://dusksoft.github.io/SimpleUI/demo/pullToRefresh.html) | [返回文档首页](index.md)