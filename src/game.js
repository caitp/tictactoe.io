var inherits = require('util').inherits;
var ttt = require('tictactoe.js');
var cleanPlayer = require('./helpers').cleanPlayer;
var Board = ttt.Board;
var Move = ttt.Move;
require('es6-shim');

function Game(player1, player2) {
  Game.super_.call(this);
  this.players = [player1, player2];
  this.current = 0;
  var that = this;
  this.lastTurn = 1;
  this.on("move", function() {
    that.lastTurn = that.current;
    that.current = Number(!that.current);
  });
}
inherits(Game, Board);
Game.prototype.move = function(player, x, y) {
  if (player !== this.currentPlayer()) {
    this._emit("badturn", player);
    return false;
  } else {
    return Board.prototype.move.call(this, player, x, y);
  }
}
Game.prototype.currentPlayer = function() {
  return this.players[Number(!!this.current)];
}
Game.prototype.markerForPlayer = function(player) {
  if (player === this.players[0]) {
    return "X";
  } else if (player === this.players[1]) {
    return "O";
  } else {
    return " ";
  }
}
Game.prototype.opponentOf = function(player) {
  if (player === this.players[0]) return this.players[1];
  else if (player === this.players[1]) return this.players[0];
}
Game.prototype.toString = function() {
  var lines = [];
  var line = [];
  var linesep = "-+-+-\n";
  for (var i=1; i<=9; ++i) {
    var piece = this.state[i-1];
    piece = this.markerForPlayer(piece && piece.player);
    line.push(piece);
    if ((i % 3) === 0) {
      lines.push(line.join("|") + "\n");
      line.length = 0;
    }
  }
  return lines.join(linesep);
}

Game.prototype.isOver = function() {
  return this._moves >= this.state.length ||
    this.detectVictory(this.players[0]) || this.detectVictory(this.players[1]);
}

Game.setup = function setup(p1, p2, injector) {
  if (!injector) injector = require('./injector');
  var game = new Game(p1, p2);
  var logger = game.logger = injector.get('logger');
  p1.game = game;
  p2.game = game;
  [p1, p2].forEach(function(player) {
    player.on('game:move', function(data) {
      if (typeof data !== "object") {
        logger.debug("game:move expected object, but got %s", typeof data);
      } else if (typeof data.x !== "number" || typeof data.y !== "number") {
        logger.debug("game:move expected data.x and data.y to be numbers, but got {x: %s, y: %s}",
          '' + data.x, '' + data.y);
      } else {
        game.move(player, data.x, data.y);
      }
    });
  });
  game
    .on('move', function(event, item) {
      var clean = item.toObject();
      clean.player = {
        marker: game.markerForPlayer(item.player),
        name: clean.player.name,
        profile: clean.player.profile
      };
      p1.socket.emit('game:moved', clean);
      p2.socket.emit('game:moved', clean);

      if (!game.isOver()) {
        (game.current === 0 ? p2 : p1).emit('game:beginturn');
      }

      logger.log("%s moves to %d, %d:", clean.player.marker, item.x, item.y);
      logger.log("%s\n\n", game.toString());
    })
    .on('badturn', function(event, player) {
      player.emit('game:badturn');
    })
    .on('badmove', function(event, player, x, y) {
      player.emit('game:badmove', {
        marker: game.markerForPlayer(player),
        player: cleanPlayer(player),
        x: x,
        y: y
      });
    })
    .on('draw', function(event) {
      logger.log("%s vs. %s: DRAW GAME", p1.name, p2.name);
      p1.emit('game:draw');
      p2.emit('game:draw');
      cleanup(p1, p2, game);
    })
    .on('victory', function(event, player) {
      var isp1 = player === p1;
      logger.log("%s vs. %s: VICTORY %s", p1.name, p2.name, isp1 ? p1.name : p2.name);
      logger.log("%s vs. %s: DEFEAT %s", p1.name, p2.name, isp1 ? p2.name : p1.name);
      p1.emit(isp1 ? 'game:victory' : 'game:defeat');
      p2.emit(isp1 ? 'game:defeat' : 'game:victory');
      cleanup(p1, p2, game);
    })
  p1.emit('game:start', {
    opponent: cleanPlayer(p2), 
    marker: "X"
  });
  p2.emit('game:start', {
    opponent: cleanPlayer(p1), 
    marker: "O"
  });
  p1.emit('game:beginturn');
  // console.log("matchup found: " + p1.name + " vs. " + p2.name);
  return game;
}

function cleanup(p1, p2, game) {
  delete p1.game;
  delete p2.game;
  game.off('draw victory badmove move');
}

module.exports = Game;