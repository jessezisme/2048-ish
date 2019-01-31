var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var sourceMaps = require('gulp-sourcemaps');
var cssNano = require('gulp-cssnano');
var sass = require('gulp-sass');
var order = require("gulp-order");


/*=============================================
=            SASS         =
=============================================*/
gulp.task('sass', function (cb) {
	return gulp.src(
			[
				'src/style/normalize.scss',
				'src/style/main.scss'
			])
		.pipe(plumber({
			errorHandler: function (error) {
				console.log(error.message);
				this.emit('end');
			}
		}))
		.pipe(sass())
		.pipe(sourceMaps.init())
		.pipe(concat('main.css'))
		.pipe(cssNano())
		.pipe(sourceMaps.write('./'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./dist/style'));
});
/*===========*/


/*=============================================
=            	JS         =
=============================================*/
gulp.task('js', function () {
	return gulp.src([
			'bower_components/jQuery/dist/jquery.min.js',
			'bower_components/lodash/dist/lodash.min.js',
			'bower_components/hammerjs/hammer.min.js',
			'src/js/main.js'
		])
		.pipe(order([
			'bower_components/jQuery/dist/jquery.min.js',
			'bower_components/lodash/dist/lodash.min.js',
			'bower_components/hammerjs/hammer.min.js',
			'src/js/main.js'
		]))
		.pipe(plumber({
			errorHandler: function (error) {
				console.log(error.message);
				this.emit('end');
			}
		}))
		.pipe(sourceMaps.init())
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(sourceMaps.write('./'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./dist/js'))
});
/*===========*/


/*=============================================
=            WATCH           =
=============================================*/
gulp.task('watch', function (done) {
	gulp.watch('./src/style/**/*.scss', gulp.parallel(['sass']));
	gulp.watch('./src/js/**/*.js', gulp.parallel(['js']));
	done();
});
/*===========*/

/*=============================================
=            ****	DEFAULT    ****          =
=============================================*/
gulp.task('default', gulp.parallel([
	'sass',
	'js',
	'watch'
]));
/*===========*/