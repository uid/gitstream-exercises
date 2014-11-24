#!/usr/bin/env node

'use strict';

var utils = require('./utils'),
    fs = require('fs'),
    path = require('path'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    ast = require('./ast'),
    q = require('q'),

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

function createNewRepo( repoDir ) {
    var git = utils.git.bind( null, repoDir );

    return utils.cp( REPO_CONTENTS, repoDir )
    .then( function() {
        return utils.git( __dirname, 'init', [ '--template=' + REPO_TMP, repoDir ] );
    })
    .then( function() {
        return git( 'config', [ 'angler.url', ANGLER_URL ] );
    })
    .then( function() {
        return git( 'config', [ 'receive.denyCurrentBranch', 'false' ] );
    })
    .then( function() {
        return git( 'add', ':/' );
    });
}

function createExerciseDir( exercise ) {
    // copy the exercise resources into the output dir
    var resourcesDir = path.join( EXERCISES_DIR, exercise, RESOURCES_DIR_NAME ),
        exerciseName = exercise.substring( exercise.indexOf('-') + 1 ),
        outputDir = path.join( GEN_DIR, exerciseName ),
        repoPath = path.join( outputDir, REPO_DIR_NAME ),

        pending = [
            q.nfcall( fs.stat, resourcesDir )
            .then( function() {
                return utils.cp( resourcesDir, outputDir );
            })
            .catch( function() { /* do nothing */  }),
            createNewRepo( repoPath )
        ];

    return q.all( pending );
}

// npm replaces all .gitignores with .npmignores on install. fix this.
function replaceNPMIgnores( src ) {
    return q.nfcall( fs.stat, src )
    .then( function( stats ) {
        if ( stats.isDirectory() ) {
            return q.nfcall( fs.readdir, src )
            .then( function( files ) {
                return q.all( files.map( function( file ) {
                    return replaceNPMIgnores( path.join( src, file ) );
                }) );
            });
        } else if ( path.basename( src ) === '.npmignore' ) {
            return q.nfcall( fs.rename, src, path.join( path.dirname( src ), '.gitignore' ) );
        }
    });
}

replaceNPMIgnores( SRC_DIR )
.then( utils.getExercises )
.done( function( exerciseConfs ) {
    return q.nfcall( fs.mkdir, GEN_DIR )
    .done( function() {
        var machines = [],
            viewers = [],
            repos = [],
            outputDir;

        // split the configs
        Object.keys( exerciseConfs ).forEach( function( exercise ) {
            var exerciseName = exercise.substring( exercise.indexOf('-') + 1 ),
                exerciseConf = require( exerciseConfs[ exercise ].path ),
                confAst = esprima.parse( exerciseConfs[ exercise ].data ),
                combinedScopeExprs = ast.getCombinedScopeExprs( confAst ),
                confTrees = ast.getConfSubtrees( confAst );

            // make the output directory
            outputDir = path.join( GEN_DIR, exerciseName );
            q.nfcall( fs.mkdir, outputDir )
            .done( function() {
                return createExerciseDir( exercise, exerciseConf );
            });

            function mkConfSubmodule( confAst ) {
                var submodule = ast.createSubmodule( combinedScopeExprs, confAst );
                return ast.createProperty( exerciseName, submodule );
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
