'use strict';

module.exports = {
    view: {
        title: 'Silent but deadly merge conflicts',
        steps: {
            editFile: 'Implement <code>printTweetersAt</code> in <code>TwitterPrinter.java</code>. Run your code to verify that it works and then push your work.',
            pullRepo: 'In the meantime, a collaborator has made some changes. Pull and merge the commits.',
            fixFile: 'Git has automatically merged the changes. However, your code no longer works! Run <code>git show HEAD^2</code> to see what changed and then update and push your method.'
        },
        initTime: Infinity
    },
    machine: {
        mergeFile: {
            mergeFile: function( stepOutput, cb ) {
                cb('You should sort the input to the modified findTweetAt.');
            }
        }
    }
};
