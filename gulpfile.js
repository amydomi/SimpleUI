var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var header = require('gulp-header');
var sourcemaps = require('gulp-sourcemaps');
var nano = require('gulp-cssnano');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var pkg = require('./package.json');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');

var remark = [
    '/*!',
    ' * SimpleUI v<%= pkg.version %>',
    ' * URL: <%= pkg.homepage %>',
    ' * (c) <%= new Date().getFullYear() %> by <%= pkg.author %>. All rights reserved.',
    ' * Licensed under the <%= pkg.license %> license',
    ' */',
    ''].join('\n');

// 编译、压缩LESS文件，生成发布的CSS文件
gulp.task('build-less', function() {
   gulp.src('src/style/simpleui.less')
   .pipe(sourcemaps.init())
   .pipe(less())
   .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
   .pipe(header(remark, { pkg : pkg } ))
   .pipe(gulp.dest('dist/style/'))
   .pipe(rename({suffix: '.min'}))
   .pipe(nano({
        zindex: false,
        autoprefixer: false,
        discardComments: {discardComments: true},
        normalizeCharset: false
    }))
   .pipe(gulp.dest('dist/style/'));
});

// 编译、压缩 Zepto库文件
gulp.task('build-zepto', function() {
	gulp.src([
		'./node_modules/zepto/src/zepto.js',
		'./node_modules/zepto/src/event.js',
		'./node_modules/zepto/src/ajax.js',
		'./node_modules/zepto/src/form.js',
		'./node_modules/zepto/src/fx.js',
		'./node_modules/zepto/src/fx_methods.js',
		'./node_modules/zepto/src/selector.js',
		'./node_modules/zepto/src/touch.js',
		'./node_modules/zepto/src/stack.js'
	])
    .pipe(concat({ path: 'zepto.js'}))
    .pipe(gulp.dest('dist/js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify({
        preserveComments: "license"
    }))
    .pipe(gulp.dest('dist/js/'))
});

// 编译、压缩SimpleUI js基础组件
gulp.task('build-simpleui', function() {
	gulp.src([
		'./src/js/zepto_extends.js',
        './src/js/doT.js',
		'./src/js/iscroll-probe.js',
		'./src/js/base/browser.js',
        './src/js/base/animate.js',
        './src/js/base/dialog.js',
        './src/js/base/actions.js',
        './src/js/base/toast.js',
        './src/js/base/popup.js',
        './src/js/base/rollPage.js',
        './src/js/base/pull-to-refresh.js'
	])
    .pipe(concat({ path: 'simpleui.js'}))
    .pipe(header(remark, { pkg : pkg } ))
    .pipe(gulp.dest('dist/js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(header(remark, { pkg : pkg } ))
    .pipe(gulp.dest('dist/js/'))
});

// 编译、压缩扩展JS插件
gulp.task('build-extends-js', function() {
    gulp.src('./src/js/extends/*.js')
    .pipe(uglify())
    .pipe(header(remark, { pkg : pkg } ))
    .pipe(gulp.dest('dist/js/extends/'));
});

// 编译、压缩CSS插件
gulp.task('build-extends-css', function() {
       gulp.src('src/style/extends/*.less')
       .pipe(sourcemaps.init())
       .pipe(less())
       .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
       .pipe(header(remark, { pkg : pkg } ))
       .pipe(nano({
            zindex: false,
            autoprefixer: false,
            discardComments: {discardComments: true},
            normalizeCharset: false
        }))
       .pipe(gulp.dest('dist/style/extends/'));
});

// 压缩图片
gulp.task('image', function() {
    gulp.src('src/img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img/'));
});

// 编译发布
gulp.task('default', ['build-less', 'build-simpleui', 'build-zepto', 'build-extends-js', 'build-extends-css', 'image']);
gulp.task('core', ['build-less', 'build-simpleui', 'build-zepto']);
gulp.task('extend', ['build-extends-js', 'build-extends-css']);