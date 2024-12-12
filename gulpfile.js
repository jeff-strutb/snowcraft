/// <binding BeforeBuild='completeBuild' />
var gulp = require('gulp');
var terser = require('gulp-terser');
var concat = require('gulp-concat');
var sass = require('gulp-sass')(require('sass'));
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require('tsify');
var buffer = require('vinyl-buffer');
const fs = require('fs/promises');

var styleSrc = [
    "./src/style.scss"
];

var scriptSrc = [
    "./src/logic.ts"
]

var paths = {
    dist: "./dist",
    stylesRoot: "./src/**/*.scss",
    tsRoot: "./src/**/*.ts",
    scriptsDest: "./dist/scripts",
    stylesDest: "./dist/styles",
    html: "./src/index.html",
    assets: "./src/assets/**/*",
    nodeModules: "./node_modules/"
};

function buildStyles() {
    return gulp.src(styleSrc)
    .pipe(sass({
        outputStyle: 'compressed',
        omitSourceMapUrl: true
    }).on('error', sass.logError))
    .pipe(concat("main.css"))
    .pipe(gulp.dest(paths.stylesDest));  
}

function buildScripts() {
    return browserify({
            basedir: '.',
            debug: false,
            entries: scriptSrc,
            cache: {},
            packageCache: {}
        })
        .plugin(tsify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest(paths.scriptsDest));
}

function buildScriptsProd() {
    return browserify({
            basedir: '.',
            debug: false,
            entries: scriptSrc,
            cache: {},
            packageCache: {}
        })
        .plugin(tsify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(terser({
            mangle: true,
            toplevel: true
        }))
        .pipe(gulp.dest(paths.scriptsDest));
}

function buildHtml() {
    return gulp.src(paths.html)
        .pipe(gulp.dest(paths.dist));
}

function buildAssets() {
    return gulp.src(paths.assets, { base: './src', encoding: false })
        .pipe(gulp.dest(paths.dist));
}

function cleanDist() {
    return fs.rm(paths.dist, { recursive: true, force: true });
}

var build = gulp.series(cleanDist, gulp.parallel(buildScripts, buildStyles, buildHtml, buildAssets));
var buildProd = gulp.series(cleanDist, gulp.parallel(buildScriptsProd, buildStyles, buildHtml, buildAssets));

exports.watch = function() {
    gulp.watch(
        [paths.stylesRoot,paths.tsRoot],
        gulp.parallel(
            buildScripts,
            buildStyles
        )
    );
};

exports.build = build;
exports.buildProd = buildProd;
exports.default = build;