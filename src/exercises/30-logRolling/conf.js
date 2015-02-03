'use strict'

var WORDS_LIST = 'words_list.txt',
    UNDO_LOG_MSG = 'Hey, over here!',
    REVERT_LOG_MSG = 'Revert me!',
    NORMAL_LOG_MSG = 'Added a word',
    WORDBANK = 'wordbank.dat'

// in-place Fisher-Yates shuffle
function shuffle( list ) {
    var i,
        rand,
        tmp
    for ( i = list.length - 1; i > 0; i-- ) {
        rand = Math.floor( Math.random() * i )
        tmp = list[i]
        list[i] = list[rand]
        list[rand] = tmp
    }
}

module.exports = {
    global: {
        timeLimit: 300
    },

    machine: {
        startState: 'undoChange',

        undoChange: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var theAddedWord,
                    undoCommit

                this.git( 'log', [ '--pretty="%s--%H"' ] )
                .then( function( commits ) {
                    undoCommit = commits.split('\n').reduce( function( theCommit, commit ) {
                        var trimmedCommitInfo = commit.substring(1, commit.length - 1),
                            subjHash = trimmedCommitInfo.split('--')
                        return subjHash[0] === UNDO_LOG_MSG ? subjHash[1] : theCommit
                    }, null )
                    return this.diff( undoCommit )
                }.bind( this ) )
                .then( function( diff ) {
                    theAddedWord = /\+([a-z]+)\n/.exec( diff )[1]
                    return this.diffShadow()
                }.bind( this ) )
                .done( function( diff ) {
                    var diffRe = /^[+-][a-z]+$/,
                        changes = diff.split('\n').reduce( function( c, line ) {
                            var match = diffRe.exec( line )
                            return match ? c.concat( match[0] ) : c
                        }, [] )

                    if ( changes.length === 1 && changes[0] === '-' + theAddedWord ) {
                        gitDone()
                        stepDone()
                    } else {
                        gitDone( 1, '\x1b[311mGitStream: [COMMIT REJECTED] Incorrect changes made to ' + WORDS_LIST + '\x1b[0m' )
                        stepDone('undoChange')
                    }
                }, function( err ) {
                    gitDone( -1, '\x1b[411m\x1b[371mGitStream Error: ' + err.toString() + '\x1b[0m')
                    stepDone(null)
                })
            },

            onCommit: 'pushUndo'
        },

        pushUndo: {
            onReceive: function( repo, action, info, done ) {
                var MIN_COMMITS = 4,
                    MAX_COMMITS = 8,
                    NUM_BASE_WORDS = 10,

                    minWords = NUM_BASE_WORDS + MAX_COMMITS,
                    wordbank = require( this.resourceFilePath( WORDBANK ) ),
                    numWords = Math.floor( Math.random() * ( MAX_COMMITS - MIN_COMMITS ) + minWords ),
                    commitSpecs = [],
                    words = [],
                    wordsList = [],
                    wordSlots = [],
                    commitToRevert = Math.max( 1,
                                      Math.floor( Math.random() * (numWords - NUM_BASE_WORDS) ) )

                for (; numWords > 0; numWords--) {
                    wordsList.push('')
                    words.push( wordbank[ Math.floor( Math.random() * wordbank.length ) ] )
                    wordSlots.push( numWords - 1 )
                }
                wordsList.pop()
                shuffle( wordSlots )

                function addCommitSpec( msg ) {
                    commitSpecs.push({
                        msg: msg,
                        files: [ { src: WORDS_LIST, template: { words: wordsList.join('\n\n') } } ]
                    })
                }

                words.forEach( function( word, i ) {
                    wordsList[ wordSlots[i] ] = word
                    if ( i === NUM_BASE_WORDS ) {
                        addCommitSpec('Added some more words.')
                    } else if ( i > NUM_BASE_WORDS ) {
                        addCommitSpec( i === NUM_BASE_WORDS + commitToRevert ?
                                      REVERT_LOG_MSG : NORMAL_LOG_MSG )
                    }
                }.bind( this ) )

                commitSpecs.reduce( function( chain, spec, i ) {
                    if ( i === 0 ) {
                        return this.addCommit( spec )
                    } else {
                        return chain.then( function() {
                            return this.addCommit( spec )
                        }.bind( this ) )
                    }
                }.bind( this ), null )
                .done( function() {
                    done('pullRevert')
                }, function( err ) {
                    console.error( err )
                    done( null )
                })
            }
        },

        pullRevert: {
            onPull: 'revertChange'
        },

        revertChange: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var theAddedWord,
                    undoCommit

                this.git( 'log', [ '--pretty="%s--%H"' ] )
                .then( function( commits ) {
                    undoCommit = commits.split('\n').reduce( function( theCommit, commit ) {
                        var trimmedCommitInfo = commit.substring(1, commit.length - 1),
                            subjHash = trimmedCommitInfo.split('--')
                        return subjHash[0] === REVERT_LOG_MSG ? subjHash[1] : theCommit
                    }, null )
                    return this.diff( undoCommit )
                }.bind( this ) )
                .then( function( diff ) {
                    theAddedWord = /\+([a-z]+)\n/.exec( diff )[1]
                    return this.diffShadow()
                }.bind( this ) )
                .done( function( diff ) {
                    var diffRe = /^[+-][a-z]+$/,
                        changes = diff.split('\n').reduce( function( c, line ) {
                            var match = diffRe.exec( line )
                            return match ? c.concat( match[0] ) : c
                        }, [] )

                    if ( changes.length === 1 && changes[0] === '-' + theAddedWord ) {
                        gitDone()
                        stepDone()
                    } else {
                        gitDone( 1, '\x1b[311mGitStream: [COMMIT REJECTED] Incorrect changes made to ' + WORDS_LIST + '\x1b[0m' )
                        stepDone('revertChange')
                    }
                }, function( err ) {
                    gitDone( -1, '\x1b[411m\x1b[371mGitStream Error: ' + err.toString() + '\x1b[0m')
                    stepDone(null)
                })
            },

            onCommit: 'finalPush'
        },

        finalPush: {
            onReceive: 'done'
        },

        done: null
    },

    viewer: {
        title: 'Undoing changes',

        steps: {
            undoChange: 'Examine the <a href="http://www.git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History" target="_blank">commit log</a> and find the commit with the message "' + UNDO_LOG_MSG + '".&nbsp  Determine which word was added in that commit and remove it from <code>' + WORDS_LIST + '</code>. Add and commit the change. (hint:  try using <code>git <a href="http://git-scm.com/docs/git-show" target="_blank">show</a></code>)',
            pushUndo: 'Push your changes.',
            pullRevert: 'Let\'s try undoing changes in another way. <a href="http://www.git-scm.com/docs/git-pull" target="_blank">Pull</a> the repo to get some new commits.',
            revertChange: 'Examine the <a href="http://www.git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History" target="_blank">log</a> to find the commit with message "' + REVERT_LOG_MSG + '" This time, use <a href="http://www.git-scm.com/docs/git-revert"><code>git revert</code></a> on the commit.',
            finalPush: 'Push your changes.'
        },

        feedback: {
            undoChange: {
                undoChange: function( _, done ) {
                    done('You should <em>only</em> remove the word that was addded in the marked commit. Run <code>git reset --hard ' + WORDS_LIST + '</code> and try again!')
                }
            },

            revertChange: {
                revertChange: function( _, done ) {
                    done('You should <em>only</em> remove the word that was addded in the marked commit. Run <code>git reset --hard</code> and try again!')
                }
            }
        }
    },

    repo: {
        commits: function( done ) {
            var MIN_COMMITS = 5,
                MAX_COMMITS = 10,
                NUM_BASE_WORDS = 10,

                minWords = NUM_BASE_WORDS + MAX_COMMITS,
                path = require('path'), // repo and machine execute on the server, so this works
                wordbank = require( path.join( this.resourcesPath, WORDBANK ) ), // require caches
                numWords = Math.floor( Math.random() * ( MAX_COMMITS - MIN_COMMITS ) + minWords ),
                words = [],
                wordsList = [],
                wordSlots = [],
                commitSpecs = [],
                commitToUndo = Math.max( 1,
                                Math.floor( Math.random() * ( numWords - NUM_BASE_WORDS - 1 ) ) ),
                addCommitSpec = function( msg ) {
                    commitSpecs.push({
                        msg: msg,
                        files: [ { src: WORDS_LIST, template: { words: wordsList.join('\n\n') } } ]
                    })
                }

            for (; numWords > 0; numWords--) {
                wordsList.push('')
                words.push( wordbank[ Math.floor( Math.random() * wordbank.length ) ] )
                wordSlots.push( numWords - 1 )
            }
            wordsList.pop()
            shuffle( wordSlots )

            words.forEach( function( word, i ) {
                wordsList[ wordSlots[i] ]  = word
                if ( i === NUM_BASE_WORDS ) {
                    addCommitSpec('Initial commit')
                } else if ( i > NUM_BASE_WORDS ) {
                    addCommitSpec( i === NUM_BASE_WORDS + commitToUndo ?
                                  UNDO_LOG_MSG : NORMAL_LOG_MSG )
                }
            })

            done( commitSpecs )
        }
    }
}
