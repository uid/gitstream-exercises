'use strict'

var GITIGNORE = '.gitignore',
    CITIES = 'cities.json',
    CITIES_OTHER = 'cities_other.json'

module.exports = {
    global: {
        timeLimit: Infinity
    },

    machine: {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var conflict = {
                    msg: 'changed population units to thousands',
                    files: [ {
                        src: CITIES_OTHER,
                        dest: CITIES
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
                this.shadowFileContains( CITIES, /(<{7}|>{7}|={7})/g, function( err, containsConflict ) {
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
                var pushingToMain = info.reduce( function( main, update ) {
                    return main || update.name === 'refs/heads/main'
                }, false )
                return pushingToMain ? done('done') : done()
            }
        },

        done: null
    },

    viewer: {
        title: 'Handling a merge conflict',

        steps: {
            editFile: 'Edit cities.json in VS Code (or any text editor) and fill in the missing information about Boston. Commit your work.',
            pushCommit: 'Push your commit.',
            pullRepo: 'Your collaborator has pushed a new commit, so your repo is out of date! Pull the repo to get the latest changes.',
            mergeFile: 'There was a merge conflict! Edit the file and merge the changes carefully. When you\'re done, add, commit, and push!'
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
                files: [ GITIGNORE, CITIES ]
            }
        ]
    }
}
