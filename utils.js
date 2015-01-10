'use strict'

var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    q = require('q'),

    SRC_DIR = path.join( __dirname, 'src' ),
    EXERCISES_DIR = path.join( SRC_DIR, 'exercises' ),
    CONF_FILE = 'conf.js'

module.exports = {
    getExercises: function() {
        return q.nfcall( fs.readdir, EXERCISES_DIR )
        .then( function( exercises ) {
            var configs = {},
                readFileDeferreds = exercises.map( function() {
                    return q.defer()
                }),
                readFilePromises = readFileDeferreds.map( function( deferred ) {
                    return deferred.promise
                })

            exercises.map( function( exercise, i ) {
                var exerciseConfFile = path.join( EXERCISES_DIR, exercise, CONF_FILE )

                q.nfcall( fs.readFile, exerciseConfFile )
                .done( function( data ) {
                    configs[ exercise ] = { path: exerciseConfFile, data: data.toString() }
                    readFileDeferreds[ i ].resolve()
                })
            })

            return q.all( readFilePromises )
            .then( function() {
                return configs
            })
        })
    },

    /**
     * Executes a git command in a specified repo
     * @param {String} repo the path to the repository in which to execute the command
     * @param {String} cmd the git command to run
     * @param {String|Array} args the arguments to pass to the command
     * @return {Promise} a promise on the completion of the command
     */
    git: function( repo, cmd, args ) {
        var done = q.defer()
        fs.stat( repo, function( err ) {
            if ( err ) { return done.reject( new Error( err ) ) }

            var cmdArgs = ( args instanceof Array ? args : args.trim().split(' ') ),
            git = spawn( 'git', [ cmd ].concat( cmdArgs ), { cwd: repo } ),
            output = '',
            errOutput = ''

            git.stderr.on( 'data', function( data ) { errOutput += data.toString() })
            git.stdout.on( 'data', function( data ) { output += data.toString() })

            git.on( 'close', function( code ) {
                if ( code !== 0 ) {
                    done.reject( new Error( errOutput ) )
                } else {
                    done.resolve( output )
                }
            })
        })
        return done.promise
    },

    cp: function( from, to ) {
        var done = q.defer(),
            cp = spawn( 'cp', [ '-rTf', from, to ] ),
            cpErr = ''

        cp.stderr.on( 'data', function( data ) {
            cpErr += data.toString()
        })

        cp.on( 'close', function( cpRet ) {
            if ( cpRet !== 0 ) {
                done.reject( new Error( cpErr ) )
            } else {
                done.resolve()
            }
        })

        return done.promise
    }
}
