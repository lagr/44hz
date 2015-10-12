var gulp           = require("gulp");
var _              = require("lodash");
var runSequence    = require('run-sequence');
var run            = require('gulp-run');
var rubysass       = require('gulp-ruby-sass');
var coffee         = require('gulp-coffee');
var haml           = require('gulp-ruby-haml');
var mainBowerFiles = require('main-bower-files');
var concat         = require('gulp-concat');
var clean          = require('gulp-clean');
var gulpFilter     = require('gulp-filter');
var concat         = require('gulp-concat');
var exec           = require('child_process').exec;

var Sources = {
  HAML     : 'web/haml/**/*.haml',
  SASS     : 'web/css/**/*.scss',
  LIB      : 'web/lib',
  COFFEE   : 'web/coffee/**/*.coffee',
  IMAGES   : 'web/images/*'
};

var Destinations = {
  HTML     : 'dist/',
  CSS      : 'dist/css',
  LIB      : 'dist/lib/',
  JS       : 'dist/js',
  IMAGES   : 'dist/images'
};

var FinalJSName = 'app.js';


function bowerPath(path){
  return "bower_components/" + path;
}

function runCommand(cmd, optCB){

  exec(cmd, function(err, stdOut, stdErr){
    if(err){
      console.error("Error occurred while executing >" + cmd);
      console.error(err);
    } else
      console.log("Executed successfully >" + cmd);
    if(stdOut) console.log(stdOut);
    if(stdErr) console.log(stdErr);
    if(typeof optCB === 'function') cb();
  });

}


gulp.task('mkdir-setup', function(cb) {
  var dirs = _.values(Destinations);
  return run('mkdir -p ' + dirs.join(' ')).exec(cb);
});

gulp.task('coffee', function(){
  return gulp.src(Sources.COFFEE)
    .pipe(coffee())
    .pipe(concat(FinalJSName))
    .pipe(gulp.dest(Destinations.JS));
});

gulp.task('js', function(){
  runSequence(['coffee']);
});

gulp.task('sass', function(){
  return gulp.src(Sources.SASS)
    .pipe(rubysass())
    .pipe(gulp.dest(Destinations.CSS));
});

gulp.task('haml', function(){
  return gulp.src(Sources.HAML)
    .pipe(haml())
    .pipe(gulp.dest(Destinations.HTML));
});

gulp.task('image-copy', function(){
  return gulp.src(Sources.IMAGES)
    .pipe(gulp.dest(Destinations.IMAGES));
});

gulp.task('clean', function(){
  var dirs = _.values(Destinations, {read:false});
  return gulp.src(dirs)
    .pipe(clean());
});

// Copy other lib resources, like css via this.
gulp.task('js-lib', function(){
  var jsFilter = gulpFilter('*.js');
  return gulp.src([bowerPath('knockout/dist/knockout.js'), bowerPath('lodash/dist/lodash.js')])
    .pipe(jsFilter)
    .pipe(concat('lib.js'))
    .pipe(gulp.dest(Destinations.LIB));
});

// Call all lib tasks here.
gulp.task('lib', function(){
  runSequence(['js-lib']);
});

gulp.task('build', function(){
  runSequence(['mkdir-setup'], ['lib', 'image-copy', 'haml', 'sass', 'js']);
});

gulp.task('default', function(){
  gulp.run('build');
});
