var gulp = require('gulp'),
    jscs,
    jshint,
    plumber,
    stylish,

    production = process.env.NODE_ENV === 'production',

    path = {
        js: [ 'viewers/**/*.js', 'machines/**/*.js' ]
    };

if ( !production ) {
    jscs = require('gulp-jscs');
    jshint = require('gulp-jshint');
    plumber = require('gulp-plumber');
    stylish = require('jshint-stylish');
}

gulp.task( 'default', [ 'checkstyle' ] );

gulp.task( 'checkstyle', function() {
    if ( production ) { return; }

    gulp.src( path.js )
        .pipe( plumber() )
        .pipe( jshint() )
        .pipe( jshint.reporter( stylish ) )
        .pipe( jscs() )
});
