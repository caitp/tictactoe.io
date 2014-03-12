tictactoe.io
============

Real-time multiplayer tic-tac-toe built on AngularJS, Polymer and Socket.io, presented as part of a talk at jQuereyTO 2014!

This is a very experimental application, whose goal is to show some interesting things, and illustrate certain points
mentioned in my presentation. This isn't a production application, however anyone who is interested is absolutely free
to take it and turn it into something marketable, if they so choose. At the very least, it should serve to illustrate
some obvious mistakes which can be made, and how they might be avoided in your own applications. Cheers!

##Installation

The web server and test harness is built on [Node.js](http://nodejs.org/), and tested with version 0.10.26. Ensure
that a relatively recent version of Node.js and its package manager npm are installed on your system before proceeding.

[gulp](https://www.npmjs.org/package/gulp) is required. Refer to [their guide](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)
for details on getting started. It should be installed globally so that the CLI interface can be used.

For the remaining node.js components, install with

```bash
npm install
```

The application depends on some bower dependencies. These should be installed with the gulp `bower` task:

```bash
gulp bower
```

This is because the bower task currently does some work in addition to running the bower task. The `bower` task will run
automatically when building, however gulp is somewhat flaky and this does not always work correctly. It may require
multiple tries.

##Running

The application is not likely to work on legacy browsers, but will certainly work on stable Chrome/Chromium, or
Firefox Nightly. In particular, this is being developed with Chrome 33 and Firefox 30 in mind. Unfortunately it is
slightly glitchy in Chrome 35 at the time of this writing, and this will probably not be fixed.

Launch the web server:

By default this will serve on port 3000, however this can be configured by setting the `PORT` environment variable, or
supplying the argument `--port` on the command line.

```node
./server.js
```

Then browse to http://localhost:3000 (or whichever port in particular) with those two browsers. If everything works
correctly (which it very well may not!), you should be able to sign into the application by entering a nickname and
optional biography in the form. Once there are two players who have signed in, the game should begin.

##Testing

The web server can be tested with a simple command:

```bash
gulp test
```

This is where most of the testing in this project occurs, because integration testing with Socket.io scares me. I will
try to improve that later, as I learn more about Socket.io!

##License

The MIT License (MIT)

Copyright (c) 2013 Caitlin Potter & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

