'use strict';

var WORDS_LIST = 'words_list.txt',
    CO_LOG_MSG = 'Hey, check me out!',

    theCommit; // will be accessible separately to machine, viewer, and repo

module.exports = {
    global: {
        timeLimit: 180
    },

    machine: {
        startState: 'checkoutCommit',

        checkoutCommit: {
            onCheckout: function( repo, action, info, done ) {
                this.getCommitMsg( info.newHead, function( err, msg ) {
                    if ( err ) { done('error'); }

                    if ( msg === CO_LOG_MSG ) {
                        theCommit = info.newHead;
                        done('ackTheDiff');
                    } else {
                        done('checkoutCommit');
                    }
                });
            }
        },

        ackTheDiff: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                var theWord;

                this.diff( theCommit )
                .then( function( diff ) {
                    theWord = /\+([a-z]+)\n/.exec( diff )[1];
                    return this.diffShadow( theCommit );
                }.bind( this ) )
                .done( function( diff ) {
                    var diffRe = /^[+-][a-z]+$/,
                        changes = diff.split('\n').reduce( function( c, line ) {
                            var match = diffRe.exec( line );
                            return match ? c.concat( match[0] ) : c;
                        }, [] );

                    if ( changes.length === 1 && changes[0] === '-' + theWord ) {
                        gitDone();
                        stepDone('done');
                    } else {
                        gitDone( 1, '\x1b[31;1mGitStream: [COMMIT REJECTED] Too many changes made to ' + WORDS_LIST + '\x1b[0m' );
                        stepDone('ackTheDiff');
                    }
                }, function( err ) {
                    gitDone( -1, '\x1b[41;1m\x1b[37;1mGitStream Error: ' + err.toString() + '\x1b[0m');
                    stepDone(null);
                });
            }
        },

        done: null
    },

    viewer: {
        title: 'Navigating history',

        steps: {
            checkoutCommit: '<a href="http://www.git-scm.com/docs/git-checkout" target="_blank"><code>checkout</code></a> the commit with log message "' + CO_LOG_MSG + '"',
            ackTheDiff: 'Delete from <code>words_list.txt</code> the word that was added in that commit and then commit your change (hint: try using <code>git <a href="http://git-scm.com/docs/git-show" target="_blank">show</a></code>)'
        },

        feedback: {
            checkoutCommit: {
                checkoutCommit: function( stepOutput, done ) {
                    done('Nope, that wasn\'t it');
                }
            },

            ackTheDiff: {
                ackTheDiff: function( _, done ) {
                    done('You should <em>only</em> remove the word that was addded in the commit. Run <code>git checkout ' + WORDS_LIST + '</code> and try again!');
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
                wordbank = require( path.join( resourcesPath, 'wordbank.dat' ) ), // require caches
                numWords = Math.random() * ( MAX_COMMITS - MIN_COMMITS ) + minWords,
                words = [],
                additionalWords = [],
                commitSpecs = [],
                checkout = Math.floor( Math.random() * ( numWords - NUM_BASE_WORDS ) );

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
                var msg = i === checkout ? CO_LOG_MSG : 'Added a word';
                words.splice( Math.floor( Math.random() * words.length ), 0, word );
                addCommitSpec( msg );
            });

            done( commitSpecs );
        }
    }
};
