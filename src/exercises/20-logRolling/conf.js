'use strict';

var WORDS_LIST = 'words_list.txt',
    UNDO_LOG_MSG = 'Hey, over here!',
    WORDBANK = 'wordbank.dat';

module.exports = {
    global: {
        timeLimit: Infinity // 180
    },

    machine: {
        startState: 'undoChange',

        undoChange: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var theAddedWord,
                    undoCommit;

                this.git( 'log', [ '--pretty="%s--%H"' ] )
                .then( function( commits ) {
                    undoCommit = commits.split('\n').reduce( function( theCommit, commit ) {
                        var trimmedCommitInfo = commit.substring(1, commit.length - 1),
                            subjHash = trimmedCommitInfo.split('--');
                        return subjHash[0] === UNDO_LOG_MSG ? subjHash[1] : theCommit;
                    }, null );
                    return this.diff( undoCommit );
                }.bind( this ) )
                .then( function( diff ) {
                    theAddedWord = /\+([a-z]+)\n/.exec( diff )[1];
                    return this.diffShadow();
                }.bind( this ) )
                .done( function( diff ) {
                    var diffRe = /^[+-][a-z]+$/,
                        changes = diff.split('\n').reduce( function( c, line ) {
                            var match = diffRe.exec( line );
                            return match ? c.concat( match[0] ) : c;
                        }, [] );

                    if ( changes.length === 1 && changes[0] === '-' + theAddedWord ) {
                        gitDone();
                        stepDone();
                    } else {
                        gitDone( 1, '\x1b[31;1mGitStream: [COMMIT REJECTED] Too many changes made to ' + WORDS_LIST + '\x1b[0m' );
                        stepDone('undoChange');
                    }
                }, function( err ) {
                    gitDone( -1, '\x1b[41;1m\x1b[37;1mGitStream Error: ' + err.toString() + '\x1b[0m');
                    stepDone(null);
                });
            },

            onCommit: 'pushUndo'
        },

        pushUndo: {
            onReceive: 'done'
        },

        done: null
    },

    viewer: {
        title: 'Navigating history',

        steps: {
            undoChange: 'Examine the <a href="http://www.git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History" target="_blank">commit log</a> and find the commit with the message "' + UNDO_LOG_MSG + '".&nbsp;  Determine which word was added in that commit and remove it from <code>' + WORDS_LIST + '</code>. (hint:  try using <code>git <a href="http://git-scm.com/docs/git-show" tar  get="_blank">show</a></code>)',
            pushUndo: 'Push your changes.'
        },

        feedback: {
            undoChange: {
                undoChange: function( _, done ) {
                    done('You should <em>only</em> remove the word that was addded in the marked commit. Run <code>git checkout ' + WORDS_LIST + '</code> and try again!');
                }
            }
        }
    },

    repo: {
        commits: function( resourcesPath, done ) {
            var MIN_COMMITS = 10,
                MAX_COMMITS = 16,
                NUM_BASE_WORDS = 10,

                minWords = NUM_BASE_WORDS + MAX_COMMITS,
                path = require('path'), // repo and machine execute on the server, so this works
                wordbank = require( path.join( resourcesPath, WORDBANK ) ), // require caches
                numWords = Math.random() * ( MAX_COMMITS - MIN_COMMITS ) + minWords,
                words = [],
                additionalWords = [],
                commitSpecs = [],
                commitToUndo = Math.floor( Math.random() * ( numWords - NUM_BASE_WORDS ) );

            for (; numWords > 0; numWords--) {
                ( numWords < NUM_BASE_WORDS - 1 ? words : additionalWords )
                    .push( wordbank[ Math.floor( Math.random() * wordbank.length ) ] );
            }

            function addCommitSpec( msg ) {
                commitSpecs.push({
                    msg: msg,
                    files: [ { src: WORDS_LIST, template: { words: words.join('\n') } } ]
                });
            }

            addCommitSpec('Initial commit');

            additionalWords.map( function( word, i ) {
                var msg = i === commitToUndo ? UNDO_LOG_MSG : 'Added a word';
                words.splice( Math.floor( Math.random() * words.length ), 0, word );
                addCommitSpec( msg );
            });

            done( commitSpecs );
        }
    }
};
