'use strict'

var CLASSPATH = '.classpath',
    PROJECT = '.project',
    GITIGNORE = '.gitignore',
    PERMUTATIONS = 'src/easyMerge/Permutations.java',
    PERMUTATIONS_OTHER = 'src/easyMerge/Permutations_other.java'

module.exports = {
    global: {
        timeLimit: 420
    },

    machine: {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var conflict = {
                    msg: 'Implemented recursive helper method',
                    files: [ {
                        src: PERMUTATIONS_OTHER,
                        dest: PERMUTATIONS
                    } ]
                }
                this.addCommit( conflict, function( err ) {
                    gitDone( Number(!!err), err )
                    stepDone('pushCommit')
                })
            }
        },
        // possibly disable all pulls between these states to prevent pulling down the conflict
        pushCommit: {
            onPreInfo: 'pullRepo'
        },

        pullRepo: {
            onPull: 'mergeFile'
        },

        mergeFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                this.shadowFileContains( PERMUTATIONS, /(<{7}|>{7}|={7})/g, function( err, containsConflict ) {
                    if ( !containsConflict ) {
                        gitDone()
                        stepDone( 'mergeFile', { ok: true } )
                    } else {
                        gitDone( 1, '\x1b[311mGitStream: [COMMIT REJECTED] You forgot to remove the conflict markers\x1b[0m' )
                        stepDone( 'mergeFile', { ok: false } )
                    }
                })
            },
            onReceive: function( repo, action, info, done ) {
                var pushingToMaster = info.reduce( function( master, update ) {
                    return master || update.name === 'refs/heads/master'
                }, false )
                return pushingToMaster ? done('done') : done()
            }
        },

        done: null
    },

    viewer: {
        title: 'Merging a collaborator\'s work',

        steps: {
            editFile: 'Import the project into eclipse, and implement only the public printPermutations method. Commit your work.',
            pushCommit: 'Push your commit',
            pullRepo: 'Your collaborator has pushed a new commit, so your repo is out of date! <a href="http://www.git-scm.com/docs/git-pull" target="_blank">Pull</a> the repo to get the latest changes.',
            mergeFile: 'It was a conflict-free merge! Make sure the main method works, making a new commit if necessary, then push!'
        },

        feedback: {
            mergeFile: {
                mergeFile: function( stepOutput, cb ) {
                    var FEEDBACK = 'You forgot to remove the conflict markers (&lt&lt&lt&lt&lt&lt&lt, =======, and &gt&gt&gt&gt&gt&gt&gt)'
                    cb( stepOutput.prev.ok ? '' : FEEDBACK )
                }
            }
        }
    },

    repo: {
        commits: [
            {
                msg: 'Initial commit',
                author: 'George Du <gdu@mit.edu>', // must be in User <email> format
                files: [ PROJECT, CLASSPATH, GITIGNORE, PERMUTATIONS ]
            }
        ]
    }
}
