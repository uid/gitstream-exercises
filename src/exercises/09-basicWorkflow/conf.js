'use strict'

var EDITFILE = 'ready_for_6031.py',
    IMPL = 'is_code_good',
    MSG_EXPECTED = 'Implemented ' + IMPL

module.exports = {
    global: {
        timeLimit: Infinity
    },

    machine: {
        startState: 'editFile',

        editFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var commitMsg = this.parseCommitMsg( info.logMsg ),
                    userInp = ( commitMsg.length > 1 ? '\n' : '' ) + commitMsg.join('\n')

                this.diffShadow().then( function( diff ) {
                    var madeChange = diff.split('\n').reduce( function( changed, diffLine ) {
                        return diffLine.indexOf('+++ b/ready_for_6031.py') !== -1 ? true : changed
                    }, false )
                    if ( !madeChange ) {
                        gitDone( 1, '\x1b[311mGitStream: [COMMIT REJECTED] "' + IMPL + '" must be implemented.\x1b[0m' )
                        stepDone('editFile')
                        return
                    } else {
                        if ( commitMsg[0] === MSG_EXPECTED ) {
                            gitDone()
                            stepDone('pushCommit')
                        } else {
                            gitDone( 1, '\x1b[311mGitStream: [COMMIT REJECTED] Incorrect log message. Expected commit message "' + MSG_EXPECTED + '" but was: "' + userInp + '"\x1b[0m' )
                            stepDone( 'editFile', userInp )
                        }
                    }
                })
                .catch( function( err ) {
                    gitDone( -1, '\x1b[411m\x1b[371mGitStream Error: ' + err.toString() + '\x1b[0m')
                    return stepDone(null)
                })
                .done()
            }
        },
        // possibly disable all pulls between these states to prevent pulling down the conflict
        pushCommit: {
            onReceive: function( repo, action, info, done ) {
                console.log("info", info);
                var pushingToMain = info.reduce( function( main, update ) {
                    return main || update.name === 'refs/heads/main'
                }, false )
                return pushingToMain ? done('done') : done()
            }
        },

        done: null
    },

    viewer: {
        title: 'Version controlling your changes',

        steps: {
            editFile: 'Implement the <code>' + IMPL + '</code> function in <code>' + EDITFILE + '</code> and then stage the changes using <code>git&nbsp;add&nbsp;' + EDITFILE + '</code>. Run <code>git&nbsp;status</code> and <code>git&nbsp;diff&nbsp;--staged</code> to verify that you&apos;re committing the right changes. Finally <a href="http://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#Committing-Your-Changes" target="_blank">commit</a> with the message "' + MSG_EXPECTED + '".  If you see "Waiting for your editor to close the file", make sure you close the commit message tab in your editor after editing it.',
            pushCommit: '<a href="http://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes#Pushing-to-Your-Remotes" target="_blank">Push</a>  your changes.'
        },

        feedback: {
            editFile: {
                editFile: function( stepOutput, cb ) {
                    var wrongMsg = stepOutput.prev // prev is output from leaving prev state
                    if ( wrongMsg ) {
                        cb('Expected commit message "' + MSG_EXPECTED + '" but was "' + wrongMsg + '"')
                    } else {
                        cb('The "' + IMPL + '" method should have been implemented.')
                    }
                }
            }
        }
    },

    repo: {
        commits: [
            {
                msg: 'Initial commit',
                author: 'Nick Hynes <nhynes@mit.edu>',
                files: [ EDITFILE ]
            }
        ]
    }
}
