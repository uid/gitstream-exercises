'use strict'

module.exports = {
    global: {
    },

    machine: {
        startState: 'done',
        done: null
    },

    viewer: {
        title: 'Getting an existing repository',
        steps: {},
        feedback: {
            null: {
                done: 'Your repository now contains the file <code>hello.txt</code>; typing <code>git log</code> will show its history.'
            }
        }
    },

    repo: {
        commits: [
            { msg: 'Initial commit', files: [] },
            {
                msg: 'Add hello.txt',
                files: [{ src: 'hello.txt', template: { greeting: 'Hello, world!' } }]
            },
            {
                msg: 'Update hello.txt',
                files: [{ src: 'hello.txt', template: { greeting: 'Hello, Git!' } }]
            }
        ]
    }
}
