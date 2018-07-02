var PROJECT_NAME = 'Flukes';
var PROJECT_DOMAIN = 'cn.fattyboy.flukes';

var encoding = 'utf-8';
var newLine = '\n';

// var nwVer = 'latest';
var nwVer = '0.21.1';

var argv = process.argv.slice(2);
// if (argv.length == 0) {
//     console.error("argv is wrong.");
// }

var demo, debug;
var third;
var noEval;
var noWrap;

(function() {
    console.log('\n');
    console.log(argv);

    demo = argv.indexOf('--demo') !== -1;
    debug = argv.indexOf('--debug') !== -1;
    third = argv.indexOf('--third') !== -1 || argv.indexOf('--3rd') !== -1;
    noWrap = argv.indexOf('--no-wrap') !== -1;
    noEval = argv.indexOf('--no-eval') !== -1;

    if (demo) {
        console.log('\n  ---- build demo ----\n');
    }
    if (debug) {
        console.log('\n  ---- build debug ----\n');
    }

    if (third) {
        console.log('\n  ---- build third ----\n');
    }

    if (noWrap) {
        console.log('\n  ---- NOT wrap all-in-one.js ----\n');
    }

    if (noEval) {
        console.log('\n  ---- NOT obfuscate by eval ----\n');
    }
}());



// debug , release
var modes = {
    'android': debug ? 'debug' : 'release',
    'ios': 'debug',
    'mac': 'release',
    'win': 'release',
    'linux': 'release',
    'win32': 'release',
};

var NwBuilder = require('nw-builder');

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

var ObCode = require('./lib/ob-code/index')();

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
    "Composite.js",
    "EventDispatcher.js",
    "TouchTarget.js",
    "ButtonComponent.js",
    "Slider.js",
    "Font.js",

    "renderer/CanvasRenderer.js",
    "renderer/PIXIRenderer.js",

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
    "holder/BackgroundImageHolder.js",
    "holder/BorderImageHolder.js",

    "widget/Blank.js",
    "widget/Page.js",
    "widget/Panel.js",
    "widget/Label.js",
    "widget/Button.js",
    "widget/Picture.js",
    "widget/ScrollView.js",
];
jsFileList.map(function(value) {
    return srcPath + '/' + value;
})


gulp.task('minify', function(cb) {
    var files = ([]).concat(jsFileList);

    pump([
            gulp.src(files, {
                cwd: baseDir,
                base: baseDir
            }),
            concat('all-in-one.js'),
            eslint('.eslintrc.js'),
            eslint.format(),
            uglify(),
            gulp.dest(baseDir),

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
