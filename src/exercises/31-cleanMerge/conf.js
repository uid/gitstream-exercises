'use strict'

var GITIGNORE = '.gitignore',
    CITIES = 'cities.json',
    CITIES_OTHER = 'cities_other.json'

module.exports = {
    global: {
    },

    machine: {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var conflict = {
                    msg: 'added Tokyo',
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

        pushCommit: {
            onPreInfo: 'pullRepo'
        },

        pullRepo: {
            onPull: 'mergeFile'
        },

        mergeFile: {
            onMerge: 'finalPush'
        },

        finalPush: {
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
        title: 'Cleanly merging a collaborator\'s work',

        steps: {
            editFile: 'Edit cities.json in VS Code (or any text editor) and fill in the missing information about Boston. Commit your work.',
            pushCommit: 'Push your commit.',
            pullRepo: 'Your collaborator has pushed a new commit, so your repo is out of date! Pull the repo to get the latest changes.',
            mergeFile: 'There were no conflicts! If prompted, enter a log message for the automatically-generated merge commit.',
            finalPush: 'View the git history to see what your collaborator changed, and look at the merged changes in your editor to verify that the merge succeeded, then push the merged commit.'
        },

        feedback: {
        }
    },

    repo: {
        commits: [
            {
                msg: 'Initial commit',
                files: [ GITIGNORE, CITIES ]
            }
        ]
    }
}
