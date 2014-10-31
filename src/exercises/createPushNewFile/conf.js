'use strict';

var FILE_EXPECTED = 'hello.txt',
    MSG_EXPECTED = 'hello world';

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
                var commitMsg = this.parseCommitMsg( info.logMsg ),
                    userInp = ( commitMsg.length > 1 ? '\n' : '' ) + commitMsg.join('\n');
                if ( commitMsg[0].toLowerCase() === MSG_EXPECTED )  {
                    gitDone();
                    stepDone('committedFile');
                } else {
                    gitDone( 1, 'GitStream: [COMMIT REJECTED] Incorrect log message.' +
                                ' Expected "' + MSG_EXPECTED + '" but was: "' + userInp + '"' );
                    stepDone( 'createFile', userInp );
                }
            }
        },

        committedFile: {
            onReceive: function( repo, action, info, done ) {
                this.fileExists( FILE_EXPECTED, function( exists ) {
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
        title: 'Adding a new file to remote version control',

        steps: {
            createFile: 'Create a new file named "' + FILE_EXPECTED + '", add it, and commit it with the message "' + MSG_EXPECTED + '"',
            committedFile: 'Push your commit'
        },

        // feedback when transitioning between states
        feedback: {
            createFile: { // previous state
                createFile: function( stepOutput, cb ) { // newly stepped state
                    var wrongMsg = stepOutput.prev; // prev is output from leaving prev state
                    cb('Expected "' + MSG_EXPECTED + '" but was "' + wrongMsg + '"');
                }
            },
            committedFile: {
                createFile: function( stepOutput, cb ) {
                    cb('The file name should have been "' + FILE_EXPECTED + '"');
                }
            }
        }
    }
};
