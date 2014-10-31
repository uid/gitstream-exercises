'use strict';

var MULTIPLY_SRC = 'src/numerics/Multiply.java',
    MULTIPLY_CONFLICT = 'Multiply_recursive.java';

module.exports = {
    global: {
        timeLimit: Infinity
    },

    machine: {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                this.simulateCollaboration( MULTIPLY_CONFLICT, MULTIPLY_SRC, 'Implemented Karatsuba', function() {
                    gitDone();
                    stepDone('pushCommit');
                });
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
            onReceive: function( repo, action, info, done ) {
                this.fileContains( MULTIPLY_SRC, /(<<<<<<<|>>>>>>>|=======)/g, function( err, containsConflict ) {
                    if ( !containsConflict ) {
                        done('done');
                    } else {
                        done('mergeFile');
                    }
                });
            }
        },

        done: null
    },

    view: {
        initTime: Infinity
    },

    viewer: {
        title: 'Merging a collaborator\'s work',

        steps: {
            editFile: 'Implement the base case of <code>Multiply</code> in <code>Multiply.java</code>. Make sure the "small" tests pass and then commit your work.',
            pushCommit: 'Push your commit',
            pullRepo: 'There was a merge conflict! Pull the repo to get the latest changes.',
            mergeFile: 'Merge in your changes. When the tests pass, add, commit, and push!'
        },

        feedback: {
            mergeFile: {
                mergeFile: function( stepOutput, cb ) {
                    cb('You forgot to remove the conflict markers (&lt;&lt;&lt;&lt;&lt;&lt;&lt;, &gt;&gt;&gt;&gt;&gt;&gt;&gt;, and =======)');
                }
            }
        }
    },

    repo: {
        commits: [
            {
                message: 'Initial commit',
                author: 'Nick Hynes',
                files: [ '.gitignore', '.classpath', '.project', 'src' ]
            }
        ]
    }
};
