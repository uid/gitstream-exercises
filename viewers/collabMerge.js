'use strict';

module.exports = {
    view: {
        title: 'Merging a collaborator&apos;s work',
        steps: {
            editFile: 'Implement the base case of <code>Multiply</code> in <code>Multiply.java</code>. Make sure the &quot;small&quot; tests pass and then commit your work.',
            pushCommit: 'Push your commit',
            pullRepo: 'There was a merge conflict! Pull the repo to get the latest changes.',
            mergeFile: 'Merge in your changes. When the tests pass, add, commit, and push!'
        },
        initTime: Infinity
    },
    machine: {
        mergeFile: {
            mergeFile: function( stepOutput, cb ) {
                cb('You forgot to remove the conflict markers (&lt;&lt;&lt;&lt;&lt;&lt;&lt;, &gt;&gt;&gt;&gt;&gt;&gt;&gt;, and =======)');
            }
        }
    }
};
