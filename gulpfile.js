var encoding = 'utf-8';
var newLine = '\n';

var argv = process.argv.slice(2);
// if (argv.length == 0) {
//     console.error("argv is wrong.");
// }


(function() {
    console.log('\n');
    console.log(argv);
}());



var cp = require('child_process');
var fs = require('fs-extra');
var path = require('path');
var crypto = require('crypto');

var glob = require('glob');

var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var inject = require('gulp-inject-string');
var replace = require('gulp-string-replace');
var shell = require('gulp-shell');
var eslint = require('gulp-eslint');
var pump = require('pump');
var runSequence = require('run-sequence');


var pkg = require('./package.json');

var buildTime;

(function() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var H = date.getHours();
    var M = date.getMinutes();
    buildTime = [year, month, day].join('-');
    buildTime += ' ' + [H, M].join(':');
}());


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////


var baseDir = '.'
var srcPath = './src';
var distPath = './dist';

var jsFileList = [
    "Class.js",
    "Utils.js",
    "Core.js",

    "Composite.js",
    "EventDispatcher.js",
    "TouchTarget.js",
    "Font.js",
    "ButtonComponent.js",
    "Slider.js",

    "layout/BaseLayout.js",
    "layout/VBoxLayout.js",
    "layout/HBoxLayout.js",
    "layout/TableLayout.js",
    "layout/Layout.js",

    "Component.js",
    "Root.js",

    "holder/BaseHolder.js",
    "holder/TextHolder.js",
    "holder/ImageHolder.js",
    "holder/BackgroundHolder.js",
    "holder/BorderHolder.js",
    "holder/BorderImageHolder.js",

    "widget/Blank.js",
    "widget/Panel.js",
    "widget/Label.js",
    "widget/Button.js",
    "widget/Picture.js",
    "widget/ScrollView.js",
    "widget/ProgressBar.js",

    "renderer/DisplayObject.js",
    "renderer/CanvasRenderer.js",
    "renderer/PIXIRenderer.js",
];

jsFileList = jsFileList.map(function(value) {
    return srcPath + '/' + value;
});


gulp.task('minify', function(cb) {
    var files = ([]).concat(jsFileList);
    pump([
            gulp.src(files, {
                cwd: baseDir,
                base: baseDir
            }),
            concat('cui-min.js'),
            inject.append('if(typeof module !== "undefined"){module.exports = CUI;}'),
            eslint('.eslintrc.js'),
            eslint.format(),
            uglify(),
            gulp.dest(distPath),
        ],
        function() {
            cb && cb();
        }
    );
});


gulp.task('build', function(cb) {
    runSequence('minify');
});


gulp.task('default', function(cb) {
    runSequence('build');
});


function randomInt(min, max) {
    return ((max - min + 1) * Math.random() + min) >> 0;
}
