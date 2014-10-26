'use strict';

var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    EXERCISES = 'exercises',
    CONF_FILE = 'conf.js';

module.exports = {
    getExercises: function( callback ) {
        fs.readdir( path.join( __dirname, EXERCISES ), function( err, exercises ) {
            var configs = {};

            if ( err ) { callback( err, null ); }

            exercises.map( function( exercise ) {
                var exerciseConf = require( './' + path.join( EXERCISES, exercise, CONF_FILE ) ),
                    globalAttrib;

                for ( globalAttrib in exerciseConf.global ) {
                    exerciseConf.machine[ globalAttrib ] = exerciseConf.global[ globalAttrib ];
                    exerciseConf.viewer[ globalAttrib ] = exerciseConf.global[ globalAttrib ];
                }

                configs[ exercise ] = {
                    machine: exerciseConf.machine,
                    viewer: exerciseConf.viewer,
                    repo: exerciseConf.repo
                };
            });

            callback( null, configs );
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
