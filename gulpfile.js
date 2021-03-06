var gulp           = require("gulp");
var run = require('gulp-run');
var gutil          = require('gulp-util');
var _              = require("lodash");
var rubysass       = require('gulp-ruby-sass');
var coffee         = require('gulp-coffee');
var haml           = require('gulp-ruby-haml');
var mainBowerFiles = require('main-bower-files');
var concat         = require('gulp-concat');
var clean          = require('gulp-clean');
var gulpFilter     = require('gulp-filter');
var concat         = require('gulp-concat');
var webserver       = require('gulp-webserver');
var exec           = require('child_process').exec;

var Sources = {
  HAML     : 'web/haml/**/*.haml',
  SASS     : 'web/css/**/*.sass',
  LIB      : 'web/lib',
  COFFEE   : 'web/coffee/**/*.coffee',
  IMAGES   : 'web/images/*',
  FONTS   : 'web/fonts/*'
};

var Destinations = {
  HTML     : 'dist/',
  CSS      : 'dist/css',
  LIB      : 'dist/lib/',
  JS       : 'dist/js',
  IMAGES   : 'dist/images',
  FONTS   : 'dist/fonts'
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

gulp.task('js', ['coffee']);

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

gulp.task('fonts', function(){
  return gulp.src(Sources.FONTS)
    .pipe(gulp.dest(Destinations.FONTS));
});

gulp.task('clean', function(){
  var dirs = _.values(Destinations, {read:false});
  return gulp.src(dirs)
    .pipe(clean());
});

// Copy other lib resources, like css via this.
gulp.task('js-lib', function(){
  var jsFilter = gulpFilter('*.js');
  return gulp.src([bowerPath('lodash/dist/lodash.js')])
    .pipe(jsFilter)
    .pipe(concat('lib.js'))
    .pipe(gulp.dest(Destinations.LIB));
});

// Call all lib tasks here.
gulp.task('lib', ['js-lib']);

gulp.task('build', ['clean', 'mkdir-setup', 'lib', 'fonts', 'image-copy', 'haml', 'sass', 'js']);

gulp.task('default', ['watch']);

gulp.task('watch', function(){ 
gulp.watch(Sources.LIB, ['lib']);
gulp.watch(Sources.FONTS, ['fonts']);
gulp.watch(Sources.IMAGES, ['image-copy']);
gulp.watch(Sources.HAML, ['haml']); 
gulp.watch(Sources.SASS, ['sass']); 
gulp.watch(Sources.COFFEE, ['js']);
});

gulp.task('webserver', function() {
  gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: true,
      directoryListing: {
          enable:true,
          path: 'dist'
      },
      open: true
    }));
});