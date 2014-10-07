'use strict';

module.exports = function() {
    return {
        timeLimit: 30,

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

        done: null
    };
};
