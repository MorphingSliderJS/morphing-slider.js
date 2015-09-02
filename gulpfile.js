var gulp = require('gulp'),
    babelify = require('babelify'),
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

gulp.task('sass', function () {
    gulp.src('./src/sass/*.scss')
        .pipe(sass({includePaths: ['./styles'],
                    errLogToConsole: true}))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('lib', function() {
    return gulp.src(['./src/lib/morphing-slider.js', './src/lib/easings.js', './src/lib/canvas-slider.js', './src/lib/webgl-slider.js'])
      .pipe(concat({ path: 'morphing-slider.js', stat: { mode: 0666 }}))
      .pipe(gulp.dest('./build/lib/'));
});

gulp.task('watch', ['browserify', 'sass', 'lib'], function () {
    gulp.watch(['./src/js/*.js'], ['browserify', 'js']);
    gulp.watch(['./src/sass/*.scss'], ['sass']);
    gulp.watch(['./src/lib/*.js'], ['lib']);
});


gulp.task('default', ['server', 'watch']);
