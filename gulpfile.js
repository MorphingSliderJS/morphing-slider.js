var gulp = require('gulp'),
    babel = require('gulp-babel'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass');

gulp.task('default', function() {
    return gulp.src(['src/js/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('build/js'));
});

gulp.task('connect', function() {
    connect.server({
        root: './build',
        livereload: true
    });
});

gulp.task('html', function () {
    gulp.src('./src/*.html')
        .pipe(connect.reload());
});

gulp.task('sass', function () {
    gulp.src('./src/sass/*.scss')
        .pipe(sass({includePaths: ['./styles'],
                    errLogToConsole: true}))
        .pipe(gulp.dest('./build/css'))
        .pipe(connect.reload());
});

gulp.task('watch', ['sass', 'html'], function () {
    gulp.watch(['./src/*.html'], ['html']);
    gulp.watch(['./src/sass/*.scss'], ['sass']);
});

gulp.task('default', ['connect', 'watch']);
 