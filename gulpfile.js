var gulp = require('gulp'),
    babelify = require('babelify'),
    sass = require('gulp-sass'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    server = require('gulp-webserver');

gulp.task('js', function() {
    browserify({
        entries: './src/js/main2.js',
        debug: true
    })
        .transform(babelify)
        .bundle()
        .pipe(source('main2.js'))
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
});

gulp.task('sass', function () {
    gulp.src('./src/sass/*.scss')
        .pipe(sass({includePaths: ['./styles'],
                    errLogToConsole: true}))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('watch', ['sass', 'html', 'js'], function () {
    gulp.watch(['./src/js/*.js'], ['js']);
    gulp.watch(['./src/*.html'], ['html']);
    gulp.watch(['./src/sass/*.scss'], ['sass']);
});

gulp.task('default', ['server', 'watch']);
 