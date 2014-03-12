#!/usr/bin/env node --harmony
var es6 = require('es6-shim');
var inherits = require('util').inherits;
var express = require('express');
var path = require('path');
var app = express();
var index = path.resolve('www', 'index.html');
var ttt = require('tictactoe.js');
var Game = require('./src/game');
var Player = require('./src/player');

app.use(express.static('./www'));

app.all('/api/v1/*', function api(req, res) {
  res.send(401, "access denied");
});

app.get('*', function(req, res) {
  res.sendfile(index);
});

function get_argv(name) {
  for (var i=0, ii=process.argv.length; i<ii; ++i) {
    var arg = process.argv[i];
    if (arg.indexOf(name) === 0) {
      if (arg.length > (name.length+1) && arg.charAt(name.length) === '=') {
        return arg.slice(name.length);
      } else {
        arg = process.argv[i+1];
        if (arg && arg.indexOf('-') !== 0) return arg;
        else return true;
      }
    }
  }
}

function get_port() {
  return process.env.PORT || get_argv('--port') || 3000;
}

var server = app.listen(get_port(), function() {
  console.log('Listening on port %d', server.address().port);
});

var io = require('socket.io').listen(server);
io.set('log level', 1);

io.sockets.on('connection', Player.connected);
// Enable the matchmaker...
Player.matchmaker();

// EVENTS
//   PROFILE
//     profile:updated
//     opponent:profile:updated
//     profile:invalid
//     profile:ready
//
//   GAME
//     game:start
//     game:forfeit
//     game:victory
//     game:defeat
//     game:draw
//     game:move
//     game:badmove