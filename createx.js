#!/usr/bin/env node

'use strict'

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

    ANGLER_URL = 'http://localhost/hooks'

function createNewRepo( repoDir ) {
    var git = utils.git.bind.bind( utils.git, null, repoDir )

    return utils.cp( REPO_CONTENTS, repoDir )
    .then( utils.git.bind( null, __dirname, 'init', [ '--template=' + REPO_TMP, repoDir ] ) )
    .then( git( 'config', [ 'angler.url', ANGLER_URL ] ) )
    .then( git( 'config', [ 'receive.denyCurrentBranch', 'false' ] ) )
    .then( git( 'add', ':/' ) )
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
                // ugly. fix this
                return q.nfcall( fs.readdir, resourcesDir )
                .then( function( files ) {
                    return q.all( files.map( function( file ) {
                        return utils.cp( path.join( resourcesDir, file ), outputDir )
                    }) )
                })
            })
            .catch(function() {}),
            createNewRepo( repoPath )
        ]

    return q.all( pending )
}

// npm replaces all .gitignores with .npmignores on install. fix this.
function replaceNPMIgnores( src ) {
    return q.nfcall( fs.stat, src )
    .then( function( stats ) {
        if ( stats.isDirectory() ) {
            return q.nfcall( fs.readdir, src )
            .then( function( files ) {
                return q.all( files.map( function( file ) {
                    return replaceNPMIgnores( path.join( src, file ) )
                }) )
            })
        } else if ( path.basename( src ) === '.npmignore' ) {
            return q.nfcall( fs.rename, src, path.join( path.dirname( src ), '.gitignore' ) )
        }
    })
}

replaceNPMIgnores( SRC_DIR )
.then( utils.getExercises )
.done( function( exerciseConfs ) {
    return q.nfcall( fs.mkdir, GEN_DIR, { recursive: true })
    .done( function() {
        var exercises = Object.keys( exerciseConfs ),
            orderRe = /^([0-9]+)-/,
            orderedExercises = exercises.filter( function( ex ) {
                    return orderRe.test( ex ) // hide unordered exercises
                }).sort( function( ex1, ex2 ) {
                    var getOrder = function( ex ) { return parseInt( orderRe.exec( ex )[1] ) },
                        ex1Order = getOrder( ex1 ),
                        ex2Order = getOrder( ex2 )
                    return ex1Order < ex2Order ? -1 : 1
                }).map( function( ex ) {
                    return ast.createLiteral( ex.substring( ex.indexOf('-') + 1 ) )
                }),
            machines = [],
            viewers = [ ast.createProperty( '_order', ast.createArray( orderedExercises ) ) ],
            repos = [],
            outputDir,
            writeMod = function( file, props ) {
                // outputs a node module that exports an object of submodules
                var mod = ast.createModule( null, ast.createObject( props ) )
                fs.writeFile( file, escodegen.generate( mod ), (err) => { if (err) console.error(err); })
            }

        // split the configs
        exercises.forEach( function( exercise ) {
            require( exerciseConfs[ exercise ].path ) // check for syntax errors
            var exerciseName = exercise.substring( exercise.indexOf('-') + 1 ),
                confAst = esprima.parse( exerciseConfs[ exercise ].data ), // config's parse tree
                combinedScopeExprs = ast.getCombinedScopeExprs( confAst ), // defs at top of file
                confTrees = ast.getConfSubtrees( confAst ), // machine, viewer, repo
                mkConfSubmodule = function( confAst ) {
                    /* a submodule takes the following form:
                       function() {
                         var privateVars = 'go here'
                         return publicExport // usually an object
                       }
                     */
                    var submodule = ast.createSubmodule( combinedScopeExprs, confAst )
                    return ast.createProperty( exerciseName, submodule )
                }

            // make the output directory
            outputDir = path.join( GEN_DIR, exerciseName )
            q.nfcall( fs.mkdir, outputDir )
            .done( createExerciseDir.bind( null, exercise ) )

            machines.push( mkConfSubmodule( confTrees.machine ) )
            viewers.push( mkConfSubmodule( confTrees.viewer ) )
            repos.push( mkConfSubmodule( confTrees.repo || ast.createObject([]) ) )
        })

        // write out the split configs
        writeMod( MACHINES_FILE, machines )
        writeMod( VIEWERS_FILE, viewers )
        writeMod( REPOS_FILE, repos )
    })
})
