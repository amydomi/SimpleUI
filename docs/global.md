## 全局CSS样式
全局样式是常用样式进行封装，实用于大部分90%的运用场景。

### 常用文本颜色
对一些最常用的文本颜色进行封装

	红色		.sui-red
	橙色		.sui-orange
	蓝色		.sui-blue
	绿色		.sui-green
	灰色		.sui-gray
[查看DEMO示例](https://dusksoft.github.io/SimpleUI/demo/widget/global/global-color.html) | [返回文档首页](index.md)

### 细边框线
在手机上，经常会使用低于1px的细边框线，对这些边框线进行了一些封装。
	
	顶部边线		.sui-border-t
	底部边线		.sui-border-b

	顶部 + 底部		.sui-border-tb
	
	左边线			.sui-border-l
	右框线			.sui-border-r

	四边边线			.sui-border
[查看DEMO示例](https://dusksoft.github.io/SimpleUI/demo/widget/global/global-border.html) | [返回文档首页](index.md)

### 外边距
通用的上下边距为20px， 左右边距为15px，对这些通用的边框线进行封装。<br/>
描述：为方便简写，margin-top简化为mt,  所以取名为mt20，即为距离顶部20px

	距离顶部20px					.sui-mt20
	距离底部20px					.sui-mb20

	顶部20px + 底部20px				.sui-mtb20
	
	左边距15px						.sui-ml15
	右边距15px						.sui-mr15

	左边距15px + 右边距15px		  .sui-mlr15
	上下20px + 左右15px			   .sui-m

[查看DEMO示例](https://dusksoft.github.io/SimpleUI/demo/widget/global/global-margin.html) | [返回文档首页](index.md)