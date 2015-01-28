'use strict'

var FILE_EXPECTED = 'hello.txt',
    MSG_EXPECTED = 'hello git'

module.exports = {
    // conf that applies to both client and server
    global: {
        timeLimit: 60 // seconds
    },

    // definition for server state machine
    machine: {
        startState: 'createFile',

        createFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                this.shadowFileExists( FILE_EXPECTED, function( err, exists ) {
                    var commitMsg = this.parseCommitMsg( info.logMsg ),
                        userInp = ( commitMsg.length > 1 ? '\n' : '' ) + commitMsg.join('\n')

                    if ( err ) {
                        gitDone( -1, '\x1b[411m\x1b[371mGitStream Error: ' + err.toString() + '\x1b[0m')
                        return stepDone(null)
                    }

                    if ( exists ) {
                        if ( commitMsg[0].toLowerCase() === MSG_EXPECTED )  {
                            gitDone()
                            stepDone('committedFile')
                        } else {
                            gitDone( 1, '\x1b[311mGitStream: [COMMIT REJECTED] Incorrect log message. Expected commit message "' + MSG_EXPECTED + '" but was: "' + userInp + '"\x1b[0m' )
                            stepDone( 'createFile', userInp )
                        }
                    } else {
                        gitDone( 1, '\x1b[311mGitStream: [COMMIT REJECTED] Commit should contain file: "' + FILE_EXPECTED + '"\x1b[0m' )
                        stepDone('createFile')
                    }
                }.bind( this ) )
            }
        },

        committedFile: {
            onReceive: 'done'
        },

        done: null // halt state
    },

    // definition for client state machine and view
    viewer: {
        // the steps shown in the list of steps
        title: 'Adding a new file to remote version control',

        steps: {
            createFile: 'Create a new file named "' + FILE_EXPECTED + '", stage it using<br><code>git add hello.txt</code>, and <a href="http://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#Committing-Your-Changes" target="_blank">commit</a> it with the message "' + MSG_EXPECTED + '"',
            committedFile: '<a href="http://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes#Pushing-to-Your-Remotes" target="_blank">Push</a> your commit'
        },

        // feedback when transitioning between states
        feedback: {
            createFile: { // previous state
                createFile: function( stepOutput, cb ) { // newly stepped state
                    var wrongMsg = stepOutput.prev // prev is output from leaving prev state
                    if ( wrongMsg ) {
                        cb('Expected commit message "' + MSG_EXPECTED + '" but was "' + wrongMsg + '"')
                    } else {
                        cb('The file name should have been "' + FILE_EXPECTED + '"')
                    }
                }
            }
        }
    }
}
