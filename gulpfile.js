var gulp = require('gulp'),
    babel = require('gulp'),
    connect = require('gulp-connect');

gulp.task('default', function() {
    return gulp.src(['src/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('connect', function() {
  connect.server({
    root: './public',
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./*.html'], ['html']);
});

gulp.task('default', ['connect', 'watch']);
 