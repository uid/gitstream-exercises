'use strict';

var TIMESADD = 'times_add.py',
    TIMESADD_CONFLICT = 'times_add_other.py';

module.exports = {
    global: {
        timeLimit: Infinity // 180
    },

    machine: {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var conflict = {
                    msg: 'Implemented times_add',
                    files: [ {
                        src: TIMESADD_CONFLICT,
                        dest: TIMESADD
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
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                this.shadowFileContains( TIMESADD, /(<{7}|>{7}|={7})/g, function( err, containsConflict ) {
                    if ( !containsConflict ) {
                        gitDone();
                        stepDone( 'mergeFile', { ok: true } );
                    } else {
                        gitDone( 1, '\x1b[31;1mGitStream: [COMMIT REJECTED] You forgot to remove the conflict markers\x1b[0m' );
                        stepDone( 'mergeFile', { ok: false } );
                    }
                });
            },
            onReceive: function( repo, action, info, done ) {
                var pushingToMaster = info.reduce( function( master, update ) {
                    return master || update.name === 'refs/heads/master';
                }, false );
                return pushingToMaster ? done('done') : done();
            }
        },

        done: null
    },

    viewer: {
        title: 'Merging a collaborator\'s work',

        steps: {
            editFile: 'Implement <code>times_add</code> in <code>times_add.py</code>. Make sure the tests pass and then commit your work.',
            pushCommit: 'Push your commit',
            pullRepo: 'Your collaborator has pushed a new commit, so your repo is out of date! <a href="http://www.git-scm.com/docs/git-pull" target="_blank">Pull</a> the repo to get the latest changes.',
            mergeFile: 'There was a merge conflict! Edit the file and merge the changes, favoring your implementation. When the tests pass, add, commit, and push!'
        },

        feedback: {
            mergeFile: {
                mergeFile: function( stepOutput, cb ) {
                    var FEEDBACK = 'You forgot to remove the conflict markers (&lt;&lt;&lt;&lt;&lt;&lt;&lt;, =======, and &gt;&gt;&gt;&gt;&gt;&gt;&gt;)';
                    cb( stepOutput.prev.ok ? '' : FEEDBACK );
                }
            }
        }
    },

    repo: {
        commits: [
            {
                msg: 'Initial commit',
                author: 'Nick Hynes <nhynes@mit.edu>', // must be in User <email> format
                files: [ TIMESADD ]
            }
        ]
    }
};
