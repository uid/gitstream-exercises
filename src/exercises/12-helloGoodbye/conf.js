'use strict'

var hellos = [ 'bf', 'c', 'cpp', 'erl', 'hs', 'java', 'js', 'py', 'rb', 'sh' ],
    MORE_HELLOS = 'greeters'

module.exports = {
    global: {
        timeLimit: Infinity
    },

    machine: {
        startState: 'rmFile',

        rmFile: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                this.shadowFilesMatching( '*' )
                .then( function( matches ) {
                    var has = matches.reduce( function( hasFiles, file ) {
                            if ( file === 'README.md' ) {
                                hasFiles.readme = true
                            } else if ( file === MORE_HELLOS ) {
                                hasFiles.more = true
                            } else if ( file.indexOf('hello.') === 0 ) {
                                hasFiles.hello = true
                            }
                            return hasFiles
                        }, { readme: false, more: false, hello: false } ),
                        ok = has.readme && has.more && !has.hello,
                        feedback

                    if ( !ok ) {
                        feedback = '\x1b[311mGitStream: [COMMIT REJECTED] You should remove only the specified file and not ' + ( !has.readme ? '"README.md"' : '' ) + ( !has.readme && !has.more ? ' or ' : '' ) + ( !has.more ? '"' + MORE_HELLOS + '"' : '' ) + '\x1b[0m'
                    }

                    gitDone( ok ? 0 : 1, feedback )
                    stepDone( ok ? 'pushRmFile' : 'rmFile' )
                })
                .catch( function( err ) {
                    gitDone( -1, '\x1b[411m\x1b[371mGitStream Error: ' + err.toString() + '\x1b[0m')
                    stepDone( null )
                })
                .done()
            }
        },

        pushRmFile: {
            onReceive: 'rmDir'
        },

        rmDir: {
            handlePreCommit: function( repo, action, info, gitDone, stepDone ) {
                this.shadowFilesMatching( '*' )
                .then( function( matches ) {
                    var has = matches.reduce( function( hasFiles, file ) {
                            if ( file === 'README.md' ) {
                                hasFiles.readme = true
                            } else if ( file === MORE_HELLOS ) {
                                hasFiles.more = true
                            }
                            return hasFiles
                        }, { readme: false, more: false } ),
                        ok = has.readme && !has.more,
                        feedback

                    if ( !ok ) {
                        feedback = '\x1b[311mGitStream: [COMMIT REJECTED] You should remove only the specified file and not"README.md"\x1b[0m'
                    }

                    gitDone( ok ? 0 : 1, feedback )
                    stepDone( ok ? undefined : 'rmDir' )
                })
                .catch( function( err ) {
                    gitDone( -1, '\x1b[411m\x1b[371mGitStream Error: ' + err.toString() + '\x1b[0m')
                    stepDone( null )
                })
                .done()
            },

            onReceive: function( repo, action, info, done ) {
                var pushingToMaster = info.reduce( function( master, update ) {
                    return master || update.name === 'refs/heads/master'
                }, false )
                return pushingToMaster ? done('done') : done()
            }
        },

        done: null
    },

    viewer: {
        title: 'Removing files from a repository',

        steps: {
            rmFile: 'Remove the file located in the root of the repo whose name starts with <code>hello</code> and commit the change. (hint: try typing <code>git help rm</code>)',
            pushRmFile: 'Push the commit',
            rmDir: 'Remove the <code>' + MORE_HELLOS + '</code> directory, commit, and push.'
        },

        feedback: {
            rmFile: {
                rmFile: function( s, cb ) {
                    console.log( s )
                    cb('You should remove <em>only</em> the specified file. Run <code>git reset --hard</code> and try again.')
                }
            },
            rmDir: {
                rmDir: function( _, cb ) {
                    console.log('????')
                    cb('<code>README.md</code> should not have been removed. <code>git reset --hard</code> and try again!')
                }
            }
        }
    },

    repo: {
        commits: function( done ) {
            var commits = [ { msg: 'Inital commit', files: [ 'README.md' ] } ],
                NUM_EXTRAS = 4,
                extensions = this._.sampleSize( this._.shuffle( hellos ), NUM_EXTRAS + 1 )

            commits.push({
                msg: 'Added some hello worlds',
                files: [ 'hello.' + extensions.pop() ].concat( extensions.map( function( ext ) {
                    var filename = 'hello.' + ext
                    return { src: filename, dest: MORE_HELLOS + '/' + filename }
                }) )
            })

            done( commits )
        }
    }
}
