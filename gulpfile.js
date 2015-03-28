var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    runSequence = require('run-sequence'),
    maps = require('gulp-sourcemaps'),
    fs = require('fs'),
    replace = require('gulp-replace-task'),
    htmlreplace = require('gulp-html-replace');


var vendorScripts = [
	'bower_components/leapjs/leap-0.6.2.js',
	'bower_components/LeapTrainer.js/leaptrainer.js',
	'bower_components/three.js/three.js',
	'bower_components/leapjs-plugins/main/leap-plugins-0.1.6.js',
	'bower_components/leapjs-rigged-hand/build/leap.rigged-hand-0.1.4.js',
	'bower_components/jquery/dist/jquery.js',
	'bower_components/lodash/lodash.js',
    'vendor/hangout.js'
];

var appScripts = [
	'js/HNSOController.js',
	'js/VisualController.js',
	'js/dataAccessor.js',
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
	runSequence('clean', 'app', 'styles', 'img', 'index', 'hang-app');
});

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

// gulp.task('vendor', function () {
// 	return gulp.src(vendorScripts)
// 		// .pipe(maps.init())
// 	      .pipe(concat('vendor.min.js'))
// 	      .pipe(uglify())
// 	    // .pipe(maps.write('.'))
// 	    .pipe(gulp.dest('./build/vendor'));
// });

gulp.task('app', function () {
	return gulp.src(vendorScripts.concat(appScripts))
		// .pipe(maps.init())
	      .pipe(concat('app.min.js'))
	      // .pipe(uglify())
	    // .pipe(maps.write('.'))
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

gulp.task('index', function () {
	return gulp.src('index.html')
		.pipe(htmlreplace({
	        'app': 'build/js/app.min.js'
	    }))
		.pipe(gulp.dest('./build'));
});

gulp.task('hang-app', function () {
	gulp.src('App.xml')
    	.pipe(replace({
	      	patterns: [
		        {
				    match: 'include',
				    replacement: function () {
				    	var fileContent = fs.readFileSync('./build/index.html', 'utf8');
				    	fileContent = fileContent.replace('<!DOCTYPE html>', '');
				    	fileContent = fileContent.replace('css/reset.css', '//hnso.azurewebsites.net/build/css/reset.css');
				    	fileContent = fileContent.replace('css/styles.css', '//hnso.azurewebsites.net/build/css/styles.css');
				    	fileContent = fileContent.replace('build/js/app.min.js', '//hnso.azurewebsites.net/build/js/app.min.js');
				    	return fileContent;
				    }

		        }
	      	]
	    }))
	    .pipe(gulp.dest('build'));
})
