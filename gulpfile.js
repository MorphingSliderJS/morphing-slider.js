var gulp = require('gulp'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    server = require('gulp-webserver'),
    MockServer = require('easymock').MockServer;

gulp.task('default', function() {
    return gulp.src(['src/js/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('build/js'));
});

gulp.task('easymock', function () {
    var ms = new MockServer({
        keepalive: true,
        port: 3000,
        path: './json',
    });
    ms.start();
});

gulp.task('server', ['mock'], function() {
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

gulp.task('default', ['server', 'watch']);
 