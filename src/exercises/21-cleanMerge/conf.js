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
                var pushingToMaster = info.reduce( function( master, update ) {
                    return master || update.name === 'refs/heads/master'
                }, false )
                return pushingToMaster ? done('done') : done()
            }
        },

        done: null
    },

    viewer: {
        title: 'Cleanly merging a collaborator\'s work (Java)',

        steps: {
            editFile: 'Import the project into Eclipse and implement <code>public static void printPermutations()</code> by calling the helper (don\'t implement the helper). Commit your work.',
            pushCommit: 'Push your commit.',
            pullRepo: 'Your collaborator has pushed a new commit, so your repo is out of date! Pull the repo to get the latest changes.',
            mergeFile: 'There were no conflicts! Make the merge commit and then verify that the program works. Remeber to refresh the project in Eclipse to see the current code after using Git.',
            finalPush: 'Push the merged code.'
        },

        feedback: {
        }
    },

    repo: {
        commits: [
            {
                msg: 'Initial commit',
                files: [ PROJECT, CLASSPATH, GITIGNORE, PERMUTATIONS ]
            }
        ]
    }
}
