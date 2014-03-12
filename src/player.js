require('es6-shim');
var cleanPlayer = require('./helpers').cleanPlayer;
var Game = require('./game');
var players, waiting, matchmaker;

function reset() {
  players = new Map();
  waiting = new Map();
}

function Player(socket, injector) {
  if (!players || !waiting) {
    console.log("setting up...");
    reset();
  }
  this.logger = injector.get('logger');
  this.ready = false;
  this.bind(socket);
}

Player.connected = function(socket, injector) {
  if (!injector) injector = require('./injector');
  var player = new Player(socket, injector);
  return player;
}

Player.reset = reset;

Player.matchmaker = function() {
  if (typeof matchmaker === "undefined" && arguments[0] !== false) {
    matchmaker = setInterval(function() {
      if (!waiting) return;
      var list = Array.from(waiting.keys());
      if (list.length > 1) {
        var p1 = waiting.get(list[0]);
        var p2 = waiting.get(list[1]);
        waiting.delete(list[0]);
        waiting.delete(list[1]);
        Game.setup(p1, p2);
      }
    });
  } else if (matchmaker || matchmaker === 0) {
    clearInterval(matchmaker);
    matchmaker = undefined;
  }
}

Player.nameInUse = function(name) {
  return (isString(name) && players && players.has(name));
}

Player.prototype = {
  constructor: Player,

  bind: function(socket) {
    if (this.socket || typeof socket.on !== "function" || typeof socket.emit !== "function") {
      return;
    }
    this.socket = socket;
    socket.on('disconnect', this.disconnect.bind(this));
    socket.on('game:waitfor', this.wait.bind(this));
    socket.on('profile:update', this.updateProfile.bind(this));
  },

  isWaiting: function() {
    return waiting && waiting.has(this);
  },

  emit: function() {
    if (this.socket) this.socket.emit.apply(this.socket, arguments);
    return this;
  },

  on: function() {
    if (this.socket) this.socket.on.apply(this.socket, arguments);
    return this;
  },

  removeFromPlayers: function() {
    if (players && players.has(this.name)) players.delete(this.name);
    return this;
  },

  removeFromWaiting: function() {
    if (waiting && waiting.has(this)) waiting.delete(this);
    return this;
  },

  forfeit: function() {
    if (this.game) {
      this.game.opponentOf(this).emit('game:forfeit', 'victory');
      this.emit('game:forfeit', 'defeat');
    }
    return this;
  },

  disconnect: function() {
    this
      .removeFromPlayers()
      .removeFromWaiting()
      .forfeit();
  },

  wait: function() {
    if (this.ready) {
      this.logger.log("waiting for game: ", this.name);
      waiting.set(this, this);
      this.emit('game:waiting');
    } else {
      this.emit('game:profile');
    }
  },

  updateProfile: function(data) {
    if (!isObject(data)) {
      this.emit('ttt:error', "expected Player object");
    } else if (!isString(data.name)) {
      this.emit('profile:invalid', ['name:type']);
    } else if (data.name.length < 3) {
      this.emit('profile:invalid', ['name:length']);
    } else if (Player.nameInUse(data.name)) {
      this.emit('profile:invalid', ['name:inuse']);
    } else {
      if (!isString(data.profile)) data.profile = '';
      if (!this.ready) {
        this.ready = true;
        this.name = data.name;
        this.profile = data.profile;
        players.set(data.name, this);
        this.logger.log("signin: " + data.name);
        this.emit('profile:ready', cleanPlayer(data));
      } else {
        var oldname = this.name;
        if (data.name !== this.name) {
          players.set(data.name, this);
          players.delete(this.name);
        }
        this.name = data.name;
        this.profile = data.profile;
        this.logger.log("changename: " + oldname + " -> " + data.name);
        this.emit('profile:updated', cleanPlayer(data));
        if (this.game) {
          // If they're playing with someone, notify their opponent that
          // their data has changed, as well.
          this.game.opponentOf(this)
            .emit('opponent:profile:updated', cleanPlayer(data));
        }
      }
    }
  }
};

module.exports = Player;
