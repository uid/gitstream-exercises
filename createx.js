#!/usr/bin/env node

'use strict';

var utils = require('./utils'),
    fs = require('fs'),
    path = require('path'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    ast = require('./ast'),

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
    REPOS_FILE = path.join( __dirname, 'repos.js' ),

    ANGLER_URL = 'http://localhost/hooks';

function abortAbort( msg ) {
    throw Error( msg );
}

function createNewRepo( repoDir, done ) {
    utils.cp( REPO_CONTENTS, repoDir, function( err ) {
        if ( err ) { done( err ); }

        utils.git( __dirname, 'init', [ '--template=' + REPO_TMP, repoDir ], function( err ) {
            if ( err ) { return done( err ); }

            utils.git( repoDir, 'config', [ 'angler.url', ANGLER_URL ], function( err ) {
                if ( err ) { return done( err ); }

                done();
            });
        });
    });
}

function createExerciseDir( currentExercise, conf, err ) {
    if ( err ) { abortAbort( err ); }

    // copy the exercise resources into the output dir
    var resourcesDir = path.join( EXERCISES_DIR, currentExercise, RESOURCES_DIR_NAME ),
        outputDir = path.join( GEN_DIR, currentExercise ),
        repoPath = path.join( outputDir, REPO_DIR_NAME );

    fs.stat( resourcesDir, function( err ) {
        if ( err ) { return; } // no resource dir
        utils.cp( resourcesDir, outputDir, function( err ) {
            if ( err ) { abortAbort( err ); }
        });
    });

    // create the starting repo
    createNewRepo( repoPath, function( err ) {
        if ( err ) { abortAbort( err ); }
    });
}

utils.getExercises( function( err, exerciseConfs ) {
    if ( err ) { abortAbort( err ); }

    fs.mkdir( GEN_DIR, function( err ) {
        if ( err ) { abortAbort( err ); }

        var machines = [],
            viewers = [],
            repos = [],
            outputDir;

        // split the configs
        Object.keys( exerciseConfs ).forEach( function( exercise ) {
            var exerciseConf = require( exerciseConfs[ exercise ].path ),
                confAst = esprima.parse( exerciseConfs[ exercise ].data ),
                combinedScopeExprs = ast.getCombinedScopeExprs( confAst ),
                confTrees = ast.getConfSubtrees( confAst );

            // make the output directory
            outputDir = path.join( GEN_DIR, exercise );
            fs.mkdir( outputDir, createExerciseDir.bind( null, exercise, exerciseConf ) );

            function mkConfSubmodule( confAst ) {
                var submodule = ast.createSubmodule( combinedScopeExprs, confAst );
                return ast.createProperty( exercise, submodule );
            }

            machines.push( mkConfSubmodule( confTrees.machine ) );
            viewers.push( mkConfSubmodule( confTrees.viewer ) );
            repos.push( mkConfSubmodule( confTrees.repo || ast.createObject([]) ) );
        });

        function writeMod( file, props ) {
            var mod = ast.createModule( null, ast.createObject( props ) );
            fs.writeFile( file, escodegen.generate( mod ) );
        }

        // write out the split configs
        writeMod( MACHINES_FILE, machines );
        writeMod( VIEWERS_FILE, viewers );
        writeMod( REPOS_FILE, repos );
    });
});
