'use strict';

module.exports = {
    view: {
        title: 'Add a new file to remote version control',
        steps: {
            createFile: 'Create a new file named &quot;hg_sux.txt&quot;, add it, and commit it with the message &quot;git is great&quot;',
            committedFile: 'Push your commit'
        },
        initTime: '30000'
    },
    machine: {
        createFile: {
            createFile: function( stepOutput, cb ) {
                var wrongMsg = stepOutput.prev;
                cb('Expected &quot;git is great&quot; but was &quot;' + wrongMsg + '&quot;');
            }
        },
        committedFile: {
            createFile: function( stepOutput, cb ) {
                cb('The file name should have been &quot;hg_sux.txt&quot;');
            }
        }
    }
};
