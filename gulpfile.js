var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    bower = require('gulp-bower'),
    gutil = require('gulp-util'),
    jasmine = require('gulp-jasmine');

gulp.task('build:js', function() {
  var src = gulp.src([
    'bower_components/polymer-platform/platform.js',
    'bower_components/angular/angular.js',
    'node_modules/tictactoe.js/tictactoe.js'
  ]);

  src/*.pipe(concat('platform.js'))/*.pipe(uglify({
    outSourceMap: true
  }))*/.pipe(gulp.dest('./www/js/'));
  
  src =  gulp.src([
    'app/js/app.js'
  ]);

  if (process.argv.indexOf('--debug') >= 0) {
    src.pipe(concat('app.js')).pipe(gulp.dest('./www/js/'));
  } else {
    src.pipe(concat('app.js')).pipe(uglify()).pipe(gulp.dest('./www/js/'));    
  }
});

gulp.task('build:html', function() {
  gulp.src(['./app/**/*.html'])
    .pipe(gulp.dest('./www/'));
});

gulp.task('build:css', function() {
  gulp.src(['./bower_components/fontawesome/css/font-awesome.css'])
    .pipe(gulp.dest('./www/css/'));
  gulp.src(['./bower_components/fontawesome/fonts/*'])
    .pipe(gulp.dest('./www/fonts/'));
  gulp.src(['./app/css/*.css'])
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./www/css/'));
});

gulp.task('build', ['bower', 'build:js', 'build:html', 'build:css']);

gulp.task('bower', function() {
  bower('./bower_components').pipe(gulp.dest('./bower_components'));
  // TODO: Once #6637 is merged, get rid of lib/angular.js
  // For now, it needs to be copied into bower_components
  gulp.src('./lib/angular.js')
    .pipe(gulp.dest('./bower_components/angular/'));
});

gulp.task('test:node', function() {
  gulp.src(['test/node/helpers', 'test/node/**/*.spec.js'])
    .pipe(jasmine({
//      reporter: 'dot',
      verbose: false,
      includeStackTrace: true
    }));
});

gulp.task('test', ['test:node']);
