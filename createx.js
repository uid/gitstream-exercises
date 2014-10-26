#!/usr/bin/env node

'use strict';

var utils = require('./utils'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    rmrf = require('rimraf').sync,
    toSource = require('tosource'),

    REPO_BASE = path.join( __dirname, 'repo_base' ),
    REPOS_DIR = path.join( __dirname, 'starter_repos' ),
    MACHINES_FILE = path.join( __dirname, 'machines.js' ),
    VIEWERS_FILE = path.join( __dirname, 'viewers.js' ),
    ANGLER_URL = 'http://localhost/hooks';

function toModule( obj ) {
    return 'module.exports = ' + toSource( obj );
}

function cleanUp() {
    try {
        rmrf( REPOS_DIR );
        fs.mkdirSync( REPOS_DIR );
        fs.unlinkSync( MACHINES_FILE );
        fs.unlinkSync( VIEWERS_FILE );
    } catch ( e ) {}
}

function abortAbort( msg ) {
    cleanUp();
    throw Error( msg );
}

function createNewRepo( repoPath, done ) {
    var template = path.join( REPO_BASE, 'template' ),
        starter = path.join( REPO_BASE, 'starter' ),
        cp = spawn( 'cp', [ '-rTf', starter, repoPath ] ),
        cpErr = '';

    cp.stderr.on( 'data', function( data ) {
        cpErr += data.toString();
    });

    cp.on( 'close', function( cpRet ) {
        if ( cpRet !== 0 ) { return done( cpErr ); }

        utils.git( __dirname, 'init', [ '--template=' + template, repoPath ], function( err ) {
            if ( err ) { return done( err ); }

            utils.git( repoPath, 'config', [ 'angler.url', ANGLER_URL ], function( err ) {
                if ( err ) { return done( err ); }

                done();
            });
        });
    });
}

function gitAddCommit( repoPath, commitParams, done ) {
    var git = utils.git.bind( null, repoPath );

    git( 'add', ':/', function( err ) {
        if ( err ) { return done( err ); }

        git( 'commit', [ '-m', commitParams.msg ], function( err ) {
            if ( err ) { return done( err ); }
        });
    });
}

utils.getExercises( function( err, exerciseConfs ) {
    if ( err ) { throw Error( err ); }

    function addCommits( err ) {
        if ( err ) { abortAbort( err ); }

        if ( repo && repo.length ) {
            return;
        } else {
            gitAddCommit( repoPath, { msg: 'Initial commit' }, abortAbort );
        }
    }

    var machines = {},
        viewers = { _titles: [] },
        exercise,
        machine,
        viewer,
        repo,
        repoPath;

    try {
        fs.statSync( REPOS_DIR );
        cleanUp();
    } catch ( e ) {
        if ( e.code === 'ENOENT' ) {
            fs.mkdirSync( REPOS_DIR );
        } else {
            throw e;
        }
    }

    for ( exercise in exerciseConfs ) {
        machine = exerciseConfs[ exercise ].machine,
        viewer = exerciseConfs[ exercise ].viewer,
        repo = exerciseConfs[ exercise ].repo,
        repoPath = path.join( REPOS_DIR, exercise + '.git' );

        // split the exercise configs
        machines[ exercise ] = machine;
        viewers[ exercise ] = viewer;
        viewers._titles.push({ exercise: exercise, title: viewer.title });

        createNewRepo( repoPath, addCommits );
    }

    fs.writeFile( MACHINES_FILE, toModule(machines) );
    fs.writeFile( VIEWERS_FILE, toModule(viewers) );
});
