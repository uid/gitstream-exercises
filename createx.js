#!/usr/bin/env node

'use strict';

var utils = require('./utils'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    toSource = require('tosource'),

    SRC_DIR = path.join( __dirname, 'src' ),
    EXERCISES_DIR = path.join( SRC_DIR, 'exercises' ),
    STARTER_REPO_DIR = path.join( SRC_DIR, 'starter_repo' ),
    REPO_TMP = path.join( STARTER_REPO_DIR, 'template' ),
    REPO_CONTENTS = path.join( STARTER_REPO_DIR, 'contents' ),
    RESOURCES_DIR_NAME = 'resources',

    GEN_DIR = path.join( __dirname, 'exercises' ),
    REPO_DIR_NAME = 'starting.git',
    MACHINES_FILE = path.join( __dirname, 'machines.js' ),
    VIEWERS_FILE = path.join( __dirname, 'viewers.js' ),

    ANGLER_URL = 'http://localhost/hooks';

function toModule( obj ) {
    return 'module.exports = ' + toSource( obj );
}

function abortAbort( msg ) {
    throw Error( msg );
}

function createNewRepo( repoDir, done ) {
    var cp = spawn( 'cp', [ '-rTf', REPO_CONTENTS, repoDir ] ),
        cpErr = '';

    cp.stderr.on( 'data', function( data ) {
        cpErr += data.toString();
    });

    cp.on( 'close', function( cpRet ) {
        if ( cpRet !== 0 ) { return done( cpErr ); }

        utils.git( __dirname, 'init', [ '--template=' + REPO_TMP, repoDir ], function( err ) {
            if ( err ) { return done( err ); }

            utils.git( repoDir, 'config', [ 'angler.url', ANGLER_URL ], function( err ) {
                if ( err ) { return done( err ); }

                done();
            });
        });
    });
}

function gitAddCommit( repo, commitParams, done ) {
    var git = utils.git.bind( null, repo );

    git( 'add', ':/', function( err ) {
        if ( err ) { return done( err ); }

        git( 'commit', [ '-m', commitParams.msg ], function( err ) {
            if ( err ) { return done( err ); }
        });
    });
}

utils.getExercises( function( err, exerciseConfs ) {
    if ( err ) { throw Error( err ); }


    function addCommits( repoConf, repoPath, err ) {
        if ( err ) { abortAbort( err ); }

        if ( repoConf && repoConf.length ) {
            return;
        } else {
            gitAddCommit( repoPath, { msg: 'Initial commit' }, abortAbort );
        }
    }

    function copyResources( from, to, cb ) {
        var cp = spawn( 'cp', [ '-rTf', from, to ] ),
            cpErr = '';

        cp.stderr.on( 'data', function( data ) {
            cpErr += data.toString();
        });

        cp.on( 'close', function( cpRet ) {
            if ( cpRet !== 0 ) { cb( cpErr ); }
        } );
    }

    function createExercise( currentExercise, conf, err ) {
        if ( err ) { abortAbort( err ); }

        // copy the exercise resources into the output dir
        var resourcesDir = path.join( EXERCISES_DIR, currentExercise, RESOURCES_DIR_NAME ),
            outputDir = path.join( GEN_DIR, currentExercise ),
            repoPath = path.join( outputDir, REPO_DIR_NAME );

        fs.stat( resourcesDir, function( err ) {
            if ( err ) { return; }
            copyResources( resourcesDir, outputDir, abortAbort );
        });

        // create the starting repo
        createNewRepo( repoPath, addCommits.bind( null, conf.repo, repoPath ) );
    }

    fs.mkdir( GEN_DIR, function( err ) {
        if ( err ) { abortAbort( err ); }

        var machines = {},
            viewers = { _titles: [] },
            exercise,
            exerciseConf,
            machineConf,
            viewerConf,
            repoConf,
            outputDir;

        for ( exercise in exerciseConfs ) {
            // get the config params
            exerciseConf = exerciseConfs[ exercise ];
            machineConf = exerciseConf.machine;
            viewerConf = exerciseConf.viewer;
            repoConf = exerciseConf.repo; // TODO: repo auto-init

            // split the exercise configs
            machines[ exercise ] = machineConf;
            viewers[ exercise ] = viewerConf;
            viewers._titles.push({ exercise: exercise, title: viewerConf.title });

            // make the output directory
            outputDir = path.join( GEN_DIR, exercise );
            fs.mkdir( outputDir, createExercise.bind( null, exercise, exerciseConf ) );

        }

        fs.writeFile( MACHINES_FILE, toModule(machines) );
        fs.writeFile( VIEWERS_FILE, toModule(viewers) );
    });
});
