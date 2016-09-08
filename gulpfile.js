var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var header = require('gulp-header');
var sourcemaps = require('gulp-sourcemaps');
var nano = require('gulp-cssnano');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var pkg = require('./package.json');

// 编译LESS文件并生成压缩的CSS版本
gulp.task('build-less', function() {
   var remark = [
    '/*!',
    ' * SimpleUI v<%= pkg.version %> (<%= pkg.homepage %>)',
    ' * Copyright [c] <%= new Date().getFullYear() %> by dusksoft. all rights reserved',
    ' * Licensed under the <%= pkg.license %> license',
    ' */',
    ''].join('\n');
    
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
            discardComments: {removeAll: true},
            normalizeCharset: false
        }))
       .pipe(gulp.dest('dist/style/'));
});

// 编译发布
gulp.task('release', ['build-less']);
gulp.task('default', ['release']);