'use strict';

var sortedFind = 'TweetUtils_sorted.java',
    utilsSrc = 'src/silentBadMerge/TweetUtils.java',
    printerSrc = 'src/silentBadMerge/TwitterPrinter.java';

module.exports = function() {
    return {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                this.simulateCollaboration( sortedFind, utilsSrc, 'Modified findTweetAt to use binary search', function() {
                    gitDone();
                    stepDone('pushCommit');
                });
            }
        },

        pushCommit: {
            onPreInfo: 'pullRepo'
        },

        pullRepo: {
            onMerge: 'fixFile'
        },

        fixFile: {
            onReceive: function( repo, action, info, done ) {
                this.fileContains( printerSrc, /sort/g, function( err, containsSort ) {
                    if ( containsSort ) {
                        done('done');
                    } else {
                        done('fixFile');
                    }
                });
            }
        },

        done: null
    };
};
