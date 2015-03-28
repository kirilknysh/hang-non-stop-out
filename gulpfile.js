var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    runSequence = require('run-sequence'),
    maps = require('gulp-sourcemaps');


var vendorScripts = [
	'bower_components/leapjs/leap-0.6.2.js',
	'bower_components/LeapTrainer.js/leaptrainer.js',
	'bower_components/LeapTrainer.js/sub-classes/lib/brain.js',
	'vendor/neural-networks.js',
	'bower_components/three.js/three.js',
	'bower_components/leapjs-plugins/main/leap-plugins-0.1.6.js',
	'bower_components/leapjs-rigged-hand/build/leap.rigged-hand-0.1.4.js',
	'bower_components/jquery/dist/jquery.js',
	'bower_components/lodash/lodash.js'
];

var appScripts = [
	'js/HNSOController.js',
	'js/VisualController.js',
	'js/main.js'
];

gulp.task('run-server', function (callback) {
    connect.server({
        port: 9090
    });
});

gulp.task('default', function () {
    //default task is to run the sever
});

gulp.task('build', function () {
	runSequence('clean', 'vendor', 'app', 'styles', 'img');
});

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

gulp.task('vendor', function () {
	return gulp.src(vendorScripts)
		.pipe(maps.init())
	      .pipe(concat('vendor.min.js'))
	      .pipe(uglify())
	    .pipe(maps.write('.'))
	    .pipe(gulp.dest('./build/vendor'));
});

gulp.task('app', function () {
	return gulp.src(appScripts)
		.pipe(maps.init())
	      .pipe(concat('app.min.js'))
	      .pipe(uglify())
	    .pipe(maps.write('.'))
	    .pipe(gulp.dest('./build/js'));
});

gulp.task('styles', function () {
	return gulp.src('css/*.css')
		.pipe(gulp.dest('./build/css'));
});

gulp.task('img', function () {
	return gulp.src('img/*')
		.pipe(gulp.dest('./build/img'));
});