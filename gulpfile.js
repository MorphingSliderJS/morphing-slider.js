var gulp = require('gulp'),
    babelify = require('babelify'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    server = require('gulp-webserver'),
    concat = require('gulp-concat');

gulp.task('browserify', function() {
    browserify({
        entries: './src/js/main.js',
        debug: true
    })
        .transform(babelify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./build/js'));
});

gulp.task('server', function() {
    gulp.src('build')
        .pipe(server({
        livereload: true,
        proxies: [{
            source: '/json',
            target: 'http://localhost:3000'
        }],
        open: true
    }));
});

gulp.task('html', function () {
    gulp.src('./src/*.html')
        .pipe(gulp.dest('./build/'));
    gulp.src('./src/demos/*.html')
        .pipe(gulp.dest('./build/demos/'));
});

gulp.task('sass', function () {
    gulp.src('./src/sass/*.scss')
        .pipe(sass({includePaths: ['./styles'],
                    errLogToConsole: true}))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('watch', ['sass', 'html', 'js'], function () {
    gulp.watch(['./src/js/*.js'], ['browserify', 'js']);
    gulp.watch(['./src/*.html'], ['html']);
    gulp.watch(['./src/demos/*.html'], ['html']);
    gulp.watch(['./src/sass/*.scss'], ['sass']);
});

gulp.task('js', function() {
    return gulp.src('./src/js/*.js')
        .pipe(babel())
        .pipe(gulp.dest('./build/js/'));
});

gulp.task('lib', function() {
    return gulp.src(['./src/lib/morphing-slider.js', './src/lib/canvas-slider.js', './src/lib/webgl-slider.js'])
      .pipe(concat({ path: 'morphing-slider.js', stat: { mode: 0666 }}))
      .pipe(gulp.dest('./build/lib/'));
});

gulp.task('default', ['server', 'watch', 'browserify', 'js', 'html', 'sass']);
