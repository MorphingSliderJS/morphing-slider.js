var gulp = require('gulp'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    server = require('gulp-webserver');

gulp.task('js', function() {
    return gulp.src(['src/js/*.es6'])
        .pipe(babel())
        .pipe(gulp.dest('build/js'));
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
        .pipe(gulp.dest('./src/'));
});

gulp.task('sass', function () {
    gulp.src('./src/sass/*.scss')
        .pipe(sass({includePaths: ['./styles'],
                    errLogToConsole: true}))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('watch', ['sass', 'html'], function () {
    gulp.watch(['./src/js/*.es6'], ['js']);
    gulp.watch(['./src/*.html'], ['html']);
    gulp.watch(['./src/sass/*.scss'], ['sass']);
});

gulp.task('default', ['server', 'watch']);
 