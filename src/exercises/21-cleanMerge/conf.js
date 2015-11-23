'use strict'

var CLASSPATH = '.classpath',
    PROJECT = '.project',
    GITIGNORE = '.gitignore',
    PERMUTATIONS = 'src/Permutations.java',
    PERMUTATIONS_OTHER = 'src/Permutations_other.java'

module.exports = {
    global: {
        timeLimit: Infinity
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
            mergeFile: 'There were no conflicts! Enter a log message for the automatically-generated merge commit.',
            finalPush: 'Refresh your project in Eclipse to see the changes. Run <code>main</code> to verify that the program works, then push the merged code.'
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
