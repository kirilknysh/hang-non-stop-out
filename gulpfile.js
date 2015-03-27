var gulp = require('gulp'),
    connect = require('gulp-connect');

gulp.task('run-server', function (callback) {
    connect.server({
        port: 9090
    });
});

gulp.task('default', function () {
    //default task is to run the sever
});

//TODO: gulp build task has to create a fake auth/authConfig.js file