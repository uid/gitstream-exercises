'use strict';

var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    q = require('q'),

    SRC_DIR = path.join( __dirname, 'src' ),
    EXERCISES_DIR = path.join( SRC_DIR, 'exercises' ),
    CONF_FILE = 'conf.js';

module.exports = {
    getExercises: function( callback ) {
        fs.readdir( EXERCISES_DIR, function( err, exercises ) {
            if ( err ) { return callback( err, null ); }

            var configs = {},
                readFileDeferreds = exercises.map( function() {
                    return q.defer();
                }),
                readFilePromises = readFileDeferreds.map( function( deferred ) {
                    return deferred.promise;
                });

            q.all( readFilePromises ).done( function() {
                callback( null, configs );
            });

            exercises.map( function( exercise, i ) {
                var exerciseConfFile = path.join( EXERCISES_DIR, exercise, CONF_FILE );

                fs.readFile( exerciseConfFile, function( err, data ) {
                    if ( err ) { return callback( err, null ); }

                    configs[ exercise ] = { path: exerciseConfFile, data: data.toString() };
                    readFileDeferreds[ i ].resolve();
                });
            });
        });
    },

    git: function( repo, cmd, args, callback ) {
        var cb = callback || function() {};
        fs.stat( repo, function( err ) {
            if ( err ) { return cb( err ); }
            var cmdArgs = ( args instanceof Array ? args : args.trim().split(' ') ),
            git = spawn( 'git', [ cmd ].concat( cmdArgs ), { cwd: repo } ),
            output = '',
            errOutput = '';

            git.stderr.on( 'data', function( data ) { errOutput += data.toString(); });
            git.stdout.on( 'data', function( data ) { output += data.toString(); });

            git.on( 'close', function( code ) {
                errOutput = errOutput || ( code !== 0 ? code.toString() : '' );
                cb( errOutput, output );
            });
        });
    }
};
