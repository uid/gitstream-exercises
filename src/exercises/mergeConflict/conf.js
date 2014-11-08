'use strict';

var MULTIPLY = 'src/numerics/Multiply.java',
    MULTIPLY_CONFLICT = 'Multiply_recursive.java';

module.exports = {
    global: {
        timeLimit: Infinity
    },

    machine: {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var conflict = {
                    msg: 'Implemented Karatsuba',
                    files: [ {
                        src: MULTIPLY_CONFLICT,
                        dest: MULTIPLY
                    } ]
                };
                this.addCommit( conflict, function( err ) {
                    gitDone( Number(!!err), err );
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
                this.fileContains( MULTIPLY, /(<{7}|>{7}|={7})/g, function( err, containsConflict ) {
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
                author: 'Nick Hynes <nhynes@mit.edu>', // must be in User <email> format
                files: [ '.gitignore', '.classpath', '.project', 'src' ]
            }
        ]
    }
};
