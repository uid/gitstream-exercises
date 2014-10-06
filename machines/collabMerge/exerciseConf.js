'use strict';

var multiplyRecursive = 'Multiply_recursive.java',
    multiplySrc = 'src/numerics/Multiply.java';

module.exports = function() {
    return {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                this.simulateCollaboration( multiplyRecursive, multiplySrc, 'Implemented Karatsuba', function() {
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
                this.fileContains( multiplySrc, /(<<<<<<<|>>>>>>>|=======)/g, function( err, containsConflict ) {
                    if ( !containsConflict ) {
                        done('done');
                    } else {
                        done('mergeFile');
                    }
                });
            }
        },

        done: null
    };
};
