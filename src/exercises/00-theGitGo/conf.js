'use strict'

module.exports = {
    global: {
        timeLimit: Infinity
    },

    machine: {
        startState: 'done',
        done: null
    },

    viewer: {
        title: 'Getting an existing repository',
        steps: {},
        feedback: {}
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
