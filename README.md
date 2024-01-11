# GitStream Exercises

Exercises for use in the GitStream interactive Git tutor.

## Table of Contents

1. [Creating a New Exercise](#creating-a-new-exercise)
2. [Building the Exercises](#building-the-exercises)
3. [Configuration File Format](#configuration-file-format)
    1. [conf.js template](#confjs-template)
    2. [global](#global)
    3. [machine](#machine)
        1. [Events and Callbacks](#events-and-callbacks)
        2. [Events Types](#event-types)
        3. [Utility Methods](#utility-methods)
    4. [viewer](#viewer)
    5. [repo](#repo)
4. [Exercise Debugging Workflow](#exercise-debugging-workflow)

## Creating a New Exercise

1. Start by creating a new directory for the exercise in `src/exercises`.
   This will be the name of the repository that users clone.  
   The name should have the format "N-exerciseName" where N is a number used to order
   the exercises.
   Omitting the "N-" will cause the exercise to be ignored by GitStream.
2. In the new exercise directory, create a configuration file, "conf.js".
3. If your exercise requires additional files (perhaps for committing to the exercise
   repo or comparing with files in the repo), create the "resources" subdirectory.

Great! Now you're ready to configure the exercise!
Add any necessary resources to the "resources/" folder and then continue on to
populating the conf file.

## Building the Exercises

When you are finished designing an exercise, build them by running

```
$ ./createx.js 
```

Remember to either link your `gitstream-exercises` directory into GitStream's or edit the
GitStream `package.json` to point `gitstream-exercises` to your own repo!

## Configuration File Format

### conf.js template

The following is a minimal template for the "conf.js" file.

```javascript
'use strict'

// place constants and static functions here

module.exports = {
    // conf that applies to exercise, in general
    global: {
        timeLimit: Infinity // time limit in milliseconds
    },

    // description of server-side state machine
    machine: {
        startState: 'aDoneState', // name of the start state
        aDoneState: null          // null means done
    },

    // description of what the user sees in-browser
    viewer: {
        title: 'The title of the exercise',
        steps: {
            // HTML descriptions of the goal of each step
        },
        feedback: {
            // HTML shown beneath the step when
            // transitioning from one state to another
        }
    },

    // optional: conf for custom generation of exercise repo
    repo: {
        // description of the commits to be made
    }
}
```

### `global`

`timeLimit:Number` -
    The time limit of the exercise, in milliseconds.
    A time limit of `Infinity` will hide the timer and allow free-play.

### `machine`

`startState:String` -
    The name of the state (step) on which the exercise starts.
    This state must be present in the `machine` object.

Other than the `startState`, keys are the names of states and their values can be one of the following:

* `String` - Steps into the named state.
             `loopyState: 'loopyState'` is probably a bad idea.
* `null`   - Denotes a halt state. Stepping into a halt state causes the "Done!" step
             to be highlighted and stops the countdown timer
* `Object` - The most common (and useful) option is an object mapping event names to
             callback functions performed when the event is triggered.  
             Ex. `onReceive: function( repo, action, info, done )`

#### Events and Callbacks

For every event ([except `404` and `receive`](#caveats)), there are two options for registering callbacks.
The first and most common mode is as a *listener* and the second is as a *handler*.
The difference is that the handler is called synchronously (i.e. the exercise will not continue until the handler calls the provided callbacks or times out).

The key name in the state object and callback function signature is as follows:

##### For listeners:

`onEventName: function( repo, action, info, done )`

* `repo:String`   - the name of the repo (e.g. nhynes/gitstream)
* `action:String` - the name of the event that triggered this callback
                    (which is usually known in advance)
* `info:Object`   - additional information associated with the action (see below)
* `done:Function` - call with a state name or null to step into that state or with no
                    arguments to remain in the current state without triggering a step

##### For handlers:

`handleEventName: function( repo, action, info, gitDone, stepDone )`

* `repo:String`       - the name of the repo
* `action:String`     - the name of the event that triggered this callback
* `info:Object`       - additional information associated with the action (see below)
* `gitDone:Function`  - call with no arguments to allow the in-progress Git operation to
                        complete or call with `exitCode:Number` and optional feedback
                        to be displayed in the terminal.
                        Depending on the operation, a non-zero exit code will prevent
                        its completion (see [githooks][githooks])
* `stepDone:Function` - accepts the same arguments as `done`, above, with a final
                        positional argument passed to the viewer as `stepOutput`.

#### Event types

<table>
    <thead>
        <th>Event</th>
        <th>Description</th>
        <th><code>info</code></th>
    </thead>
    <tbody>
        <tr>
            <td>Clone</td>
            <td>Happens when a user clones the already-created repository.</td>
            <td></td>
        </tr>
        <tr>
            <td>PostCheckout&#42;</td>
            <td>Happens when a user checks out a ref</td>
            <td>
                <code>prevHead:String</code>  - the ref of the prevous HEAD<br>
                <code>newHead:String</code>   - the ref of the new HEAD<br>
                <code>chBranch:Boolean</code> - whether the branche changed<br>
            </td>
        </tr>
        <tr>
            <td>(Pre|Post)Commit&#42;</td>
            <td>
                Happens after the user enters a commit message but before the commit is
                recorded or after the commit.
                PreCommit works well as a handler since cancelling the event prevents
                the commit from being recorded.
            </td>
            <td>
                <code>msg:String</code> - the full text of the log message (may contain comments inserted by Git)
            </td>
        </tr>
        <tr>
            <td>(Pre)Info</td>
            <td>
                Happens when Git requests information about a remote repo.
                Notably, this occurs before a pull.
            </td>
            <td></td>
        </tr>
        <tr>
            <td>Merge</td>
            <td>Happens after a non-conflicting merge</td>
            <td><code>wasSquash:Boolean</code> - whether the merge was a squash</td>
        </tr>
        <tr>
            <td>(Pre)Pull</td>
            <td>
                Happens before or after a pull (and before Merge).
                This is another good place to use a handler.
                Note that local Git may display unexpected error messages when the remote
                changes between an <code>info</code> and the actual operation.
            </td>
            <td><code>head:String</code> - the requested HEAD</td>
        </tr>
        <tr>
            <td>(Pre)Push</td()>
            <td>
                Happens before or after a push (and before PreReceive).
                A handler here can stop a push from ever reaching the remote.
            </td>
            <td>
                <code>last:String</code>   - The oldest commit in the push<br>
                <code>head:String</code>   - The newest commit in the push<br>
                <code>branch:String</code> - The name of the pushed-to branch
            </td>
        </tr>
        <tr>
            <td>(Pre)Rebase</td>
            <td>Occurs before a rebase</td>
            <td>(TODO: this should forward along Git-provided data)</td>
        </tr>
        <tr>
            <td>(Pre)Receive</td>
            <td>
                Happens before or after the remote repo receives a push
                (and after the PrePush).
                This is another good place to use a handler, except if trying to make a
                commit that changes the location of the requested HEAD, which causes
                an "unable to lock" error.
            </td>
            <td>
                <code>name:String</code> - name of the updated ref<br>
                <code>old:String</code> - old SHA pointed to by the ref<br>
                <code>new:String</code> - new SHA pointed to by the ref
            </td>
        </tr>
    </tbody>
</table>

\* Updates the Shadowbranch, a ref containing the contents of the repository.

Note: tag events can also be detected, but it requires a fix that is in a seperate [PR][tagpr] branch (let me know if you want it merged into master).

#### Utility Methods

The `this` of an event callback contains several helpful methods for interacting with
the repo and automating common tasks (see [the docs][exutils]).

### `viewer`

* `title:String`    - The title of the exercise visible on the main page and at the top
                      of the exercise page.
* `steps:Object`    - An object mapping from step names (the same ones as in the
                      `machine` section).
                      The halt states should not be included here.
* `feedback:Object` - An object with keys that are the names states or `onEnter`.
                      The value is a function with the following signature:  
                      `function( stepOutput, cb )` where  
    - `stepOutput:Object` has keys `prev` and `new` that contain
      the data provided to the callbacks of the previous and new
      (current) states
    - `cb:Function` can optionally be called with a string that is
       displayed under the newly-entered state

### `repo`

* `commits:Array` - an array of [commit specs][cispecs]

Note: templating is done using [Mustache syntax][mustache].

### Caveats

* There can only be one handler for a given event type and GitStream, itself, handles the
  404 and Receive events.
* The monolithic conf files are split before being sent to the client and server.
  The `machine` and `repo` sections are run on the server and can include `require` calls,
  but the `viewer` section can only contain environment-agnostic JS.  
  Additionally, the variables and functions placed at the top of the conf file must also
  be environment-agnostic because they are inlined into the `viewer` file.

## Exercise Debugging Workflow

1. Edit the exercise
2. Build the exercises
3. If you changed a `viewer` section, run `gulp browserify` in the GitStream repo
4. Restart the GitStream server and view your changes


[githooks]: http://git-scm.com/docs/githooks
[tagpr]: https://github.com/substack/git-http-backend/pull/6
[exutils]: https://github.com/uid/gitstream/blob/master/src/server/exerciseUtils.js#L43
[cispecs]: https://github.com/uid/gitstream/blob/master/src/server/utils.js#L127
[mustache]: https://mustache.github.io/mustache.5.html
