## 列表组件
列表组件完全模拟iOS风格的UITableView的展示效果，cell部分只做了一些基础的封装，具体项目运用中再行覆盖。

##### 基本使用

```html
<div class="sui-list-title">标题</div>
<ul class="sui-list">
	<li>Item-1</li>
	<li>Item-2</li>
	<li>Item-3</li>
	<li>Item-4</li>
	<li>Item-5</li>
</ul>
<div class="sui-list-desc">简介</div>
```

sui-list-title 和 sui-list-desc 不是必须的。

#### 16px字号
默认状态下，列表字号都是14px的，有时候需要调整为16px的时候发现列表cell的高度会有所改变，所以单独出一个样式来保证即能使用16px，又保证了列表cell项目的高度不会改变。

	ul增加：
	.sui-list-big

### 边线通栏
模拟iOS的时候，列表cell左边的边线不是通栏显示, 预留了15px，别问我为什么，因为iOS就这么显示的，如果需要边线完全通栏，加上一个class
	
	ul增加
	.sui-list-cover

### 上下边线
为了方便列表合并，列表默认状态下是没有上下边线的，只有列表cell有间隔线，需要上线边线，使用通用CSS样式中的细边线样式即可。

	ul增加
	.sui-border-tb
	只显示上边线
	.sui-border-t
	只显示下边线
	.sui-border-b

### 左右内容盒子
左边显示标题，右边显示内容，这种展现形式在很多应用中都在使用，所以进行了cell的封装，具体html如下：

```html
<ul class="sui-list">
	<li>
		<dl class="sui-cell-default">
			<dt>标题</dt>
			<dd>内容</dd>
		</dl>
	</li>
	<li>
		<dl class="sui-cell-default">
			<dt>标题</dt>
			<dd>内容</dd>
		</dl>
	</li>
	<li>
		<dl class="sui-cell-default">
			<dt>标题</dt>
			<dd>内容</dd>
		</dl>
	</li>
</ul>
```

### 链接列表
可点击的cell，通常右边会有个向右的小箭头，并且有按下的效果。

	整个列表加上链接效果
	ul 增加
	.sui-list-link

	只单个cell加上链接效果
	li 增加
	.sui-cell-link

### 带Icon的cell
列表项的左边都会有个Icon的图标通用性很强，很多项目都会运用到，所以对cell进行了封装，但图标没有封装，图标在具体项目中运用再行定义。

```html
<ul class="sui-list">
	<li>
		<div class="sui-cell-icons">
			<span class="sui-cell-icon" style="background-image:url(img/1.png)"></span> Item-1
		</div>
	</li>
	<li>
		<div class="sui-cell-icons">
			<span class="sui-cell-icon" style="background-image:url(img/2.png)"></span> Item-2
		</div>
	</li>
	<li>
		<div class="sui-cell-icons">
			<span class="sui-cell-icon" style="background-image:url(img/3.png)"></span> Item-3
		</div>
	</li>
</ul>
```

### 居中链接
cell文本居中显示也非常常用。

	1.ul增加.sui-list-cover将列表线通栏。
	2.li增加.sui-cell-centlink居中并让其可点击

具体HTML如下
```html
<ul class="sui-list sui-list-cover sui-border-tb">
	<li  class="sui-cell-centerlink">退出管理</li>
</ul>
```

文字描述并不能描述的非常清晰，详细请[查看DEMO演示](https://dusksoft.github.io/SimpleUI/demo/list.html)