'use strict'

var gulp = require('gulp'),
    rimraf = require('rimraf'),
    q = require('q'),
    jscs,
    jshint,
    plumber,
    stylish,

    production = process.env.NODE_ENV === 'production',

    path = {
        js: [ '**/*.js', '!node_modules/**/*', '!viewers.js', '!machines.js', '!repos.js', '!exercises/**/*' ],
        generated: [ 'viewers.js', 'machines.js', 'repos.js', 'exercises' ]
    }

if ( !production ) {
    jscs = require('gulp-jscs')
    jshint = require('gulp-jshint')
    plumber = require('gulp-plumber')
    stylish = require('jshint-stylish')
}

gulp.task( 'default', [ 'checkstyle', 'clean', 'build' ] )

gulp.task( 'checkstyle', function() {
    if ( production ) { return }

    gulp.src( path.js )
        .pipe( plumber() )
        .pipe( jshint() )
        .pipe( jshint.reporter( stylish ) )
        .pipe( jscs() )
})

gulp.task( 'clean', function( cb ) {
    var rmDeferreds = path.generated.map( function() {
            return q.defer()
        }),
        rmPromises = rmDeferreds.map( function( deferred ) {
            return deferred.promise
        })

    q.all( rmPromises ).done( function() {
        cb()
    })

    path.generated.map( function( file, i ) {
        rimraf( file, rmDeferreds[i].resolve )
    })
})

gulp.task( 'build', [ 'clean' ], function() {
    require('./createx')
})
