'use strict';

module.exports = {
    // conf that applies to both client and server
    global: {
        timeLimit: 45 // seconds
    },

    // definition for server state machine
    machine: {
        startState: 'createFile',

        createFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var msgRe = /git is great\s*\n?/i;
                if ( msgRe.test( info.logMsg.toLowerCase() ) )  {
                    gitDone();
                    stepDone('committedFile');
                } else {
                    gitDone( 1, 'GitStream [COMMIT REJECTED] Incorrect log message.' +
                                ' Expected "git is great" but was: "' + info.logMsg + '"' );
                    stepDone( 'createFile', info.logMsg );
                }
            }
        },

        committedFile: {
            onReceive: function( repo, action, info, done ) {
                this.fileExists( 'hg_sux.txt', function( exists ) {
                    if ( exists ) {
                        done('done');
                    } else {
                        done('createFile');
                    }
                });
            }
        },

        done: null // halt state
    },

    // definition for client state machine and view
    viewer: {
        // the steps shown in the list of steps
        title: 'Add a new file to remote version control',

        steps: {
            createFile: 'Create a new file named &quot;hg_sux.txt&quot;, add it, and commit it with the message &quot;git is great&quot;',
            committedFile: 'Push your commit'
        },

        // feedback when transitioning between states
        feedback: {
            createFile: { // previous state
                createFile: function( stepOutput, cb ) { // newly stepped state
                    var wrongMsg = stepOutput.prev; // prev is output from leaving prev state
                    cb('Expected &quot;git is great&quot; but was &quot;' + wrongMsg + '&quot;');
                }
            },
            committedFile: {
                createFile: function( stepOutput, cb ) {
                    cb('The file name should have been &quot;hg_sux.txt&quot;');
                }
            }
        }
    }
};
