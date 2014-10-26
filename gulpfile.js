'use strict';

var gulp = require('gulp'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    jscs,
    jshint,
    plumber,
    stylish,

    production = process.env.NODE_ENV === 'production',

    path = {
        js: [ '**/*.js', '!node_modules/**/*', '!viewers.js', '!machines.js' ],
        viewers: 'viewers.js',
        machines: 'machines.js',
        repos: 'starter_repos'
    };

if ( !production ) {
    jscs = require('gulp-jscs');
    jshint = require('gulp-jshint');
    plumber = require('gulp-plumber');
    stylish = require('jshint-stylish');
}

gulp.task( 'default', [ 'checkstyle', 'clean', 'build' ] );

gulp.task( 'checkstyle', function() {
    if ( production ) { return; }

    gulp.src( path.js )
        .pipe( plumber() )
        .pipe( jshint() )
        .pipe( jshint.reporter( stylish ) )
        .pipe( jscs() );
});

gulp.task( 'clean', function( cb ) {
    var empty = function() {};
    fs.unlink( path.viewers, empty );
    fs.unlink( path.machines, empty  );
    rimraf( path.repos, cb );
});

gulp.task( 'build', [ 'clean' ], function() {
    require('./createx');
});
