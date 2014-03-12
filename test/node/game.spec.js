var Game = require('../../src/game');
var Player = require('../../src/player');
var ttt = require('tictactoe.js');
var Socket = require('./mock_socket');
require('./helpers');
var Injector = require('di').Injector;

describe('Game', function() {
  var injector;
  beforeEach(function() {
    injector = new Injector([
      require('./quiet_logger')
    ]);
  });
  it('should be a subclass of ttt.Board', function() {
    var game = new Game({}, {});
    expect(game instanceof ttt.Board).toBe(true);
    expect(game instanceof Game).toBe(true);
  });


  it('should have own prototype', function() {
    var game = new Game({}, {});
    expect(game.__proto__).toBe(Game.prototype);
    expect(Game.prototype).not.toBe(ttt.Board.prototype);
  });


  it('should chain ttt.Board.prototype', function() {
    var game = new Game({}, {});
    expect(game.__proto__.__proto__).toBe(ttt.Board.prototype);
  });


  it('should override ttt.Board#move()', function() {
    expect(Game.prototype.move).not.toBe(ttt.Board.prototype.move);
  });


  it('should contain tictactoe.io-specific methods', function() {
    var game = new Game({}, {});
    expect(typeof game.currentPlayer).toBe("function");
    expect(typeof game.markerForPlayer).toBe("function");
  });


  describe('match', function() {
    var s1, s2, p1, p2, game;
    function setupGame() {
      game = Game.setup(p1, p2, injector);
    }
    beforeEach(function() {
      Player.reset();
      s1 = new Socket();
      s2 = new Socket();
      p1 = Player.connected(s1, injector);
      p2 = Player.connected(s2, injector);
      p1.name = "X";
      p2.name = "O";
      p1.ready = p2.ready = true;
    });


    it('should forbid same player from moving twice in a row', function() {
      setupGame();
      var callback = jasmine.createSpy('game:badturn');
      p1.on('game:badturn', callback);
      p1.emit('game:move', {
        x: 0,
        y: 1
      });
      p1.emit('game:move', {
        x: 0,
        y: 0
      });
      expect(callback.callCount).toBe(1);
      expect(game.state[0]).toBeUndefined();
    });


    it('should forbid player from moving on other players turn', function() {
      setupGame();
      var callback = jasmine.createSpy('game:badturn');
      p2.on('game:badturn', callback);
      p2.emit('game:move', {
        x: 0,
        y: 0
      });
      expect(callback.callCount).toBe(1);
      expect(game.state[0]).toBeUndefined();
    });


    it('should forbid player from occupying occupied tile', function() {
      setupGame();
      var callback = jasmine.createSpy('game:badmove');
      p1.on('game:badmove', callback);
      p2.on('game:badmove', callback);
      expect(game.state[0]).toBeUndefined();
      p1.emit('game:move', {
        x: 0,
        y: 0
      });
      p2.emit('game:move', {
        x: 0,
        y: 0
      });
      expect(callback.callCount).toBe(1);
      expect(game.state[0].player).toBe(p1);
    });


    it('should notify opponent of victory due to forfeit', function() {
      setupGame();
      var callback = jasmine.createSpy('game:forfeit');
      p2.on('game:forfeit', callback);
      p1.disconnect();
      expect(callback).toHaveBeenCalledWith('victory');
    });


    it('should notify opponent of defeat due to forfeit', function() {
      setupGame();
      var callback = jasmine.createSpy('game:forfeit');
      p1.on('game:forfeit', callback);
      p1.disconnect();
      expect(callback).toHaveBeenCalledWith('defeat');
    });


    it('should notify both players of draw', function() {
      setupGame();
      var callback = jasmine.createSpy('game:draw');
      p1.on('game:draw', callback);
      p2.on('game:draw', callback);
      p1.emit('game:move', {x:0, y:0});
      p2.emit('game:move', {x:1, y:1});
      p1.emit('game:move', {x:0, y:1});
      p2.emit('game:move', {x:0, y:2});
      p1.emit('game:move', {x:2, y:0});
      p2.emit('game:move', {x:1, y:0});
      p1.emit('game:move', {x:1, y:2});
      p2.emit('game:move', {x:2, y:2});
      p1.emit('game:move', {x:2, y:1});
      expect(callback.callCount).toBe(2);
    });


    it('should notify player of victory', function() {
      setupGame();
      var callback = jasmine.createSpy('game:victory');
      var callback2 = jasmine.createSpy('game:victory2');
      p1.on('game:victory', callback);
      p2.on('game:victory', callback2);
      p1.emit('game:move', {x:0, y:0});
      p2.emit('game:move', {x:0, y:1});
      p1.emit('game:move', {x:1, y:0});
      p2.emit('game:move', {x:1, y:1});
      p1.emit('game:move', {x:2, y:0});
      expect(callback.callCount).toBe(1);
      expect(callback2.callCount).toBe(0);
    });


    it('should notify player of victory', function() {
      setupGame();
      var callback = jasmine.createSpy('game:defeat');
      var callback2 = jasmine.createSpy('game:defeat2');
      p1.on('game:defeat', callback);
      p2.on('game:defeat', callback2);
      p1.emit('game:move', {x:0, y:0});
      p2.emit('game:move', {x:0, y:1});
      p1.emit('game:move', {x:1, y:0});
      p2.emit('game:move', {x:1, y:1});
      p1.emit('game:move', {x:2, y:0});
      expect(callback.callCount).toBe(0);
      expect(callback2.callCount).toBe(1);
    });


    it('should emit `game:beginturn` event on first players turn', function() {
      var callback = jasmine.createSpy('game:beginturn');
      p1.on('game:beginturn', callback);
      setupGame();
      expect(callback.callCount).toBe(1);
    });


    it('should emit `game:beginturn` event on a players turn', function() {
      setupGame();
      var callback = jasmine.createSpy('game:beginturn');
      p2.on('game:beginturn', callback);
      p1.emit('game:move', {x:0, y:0});
      expect(callback.callCount).toBe(1);
    });


    describe('isOver() method', function() {
      it('should return false when game ending conditions are not met', function() {
        setupGame();
        expect(game.isOver()).toBe(false);        
      });

      it('should return true if a player has won', function() {
        setupGame();
        p1.emit('game:move', {x:0, y:0});
        p2.emit('game:move', {x:0, y:1});
        p1.emit('game:move', {x:1, y:0});
        p2.emit('game:move', {x:1, y:1});
        p1.emit('game:move', {x:2, y:0});
        expect(game.isOver()).toBe(true);
      });


      it('should return true in case of a draw', function() {
        setupGame();
        p1.emit('game:move', {x:0, y:0});
        p2.emit('game:move', {x:1, y:1});
        p1.emit('game:move', {x:0, y:1});
        p2.emit('game:move', {x:0, y:2});
        p1.emit('game:move', {x:2, y:0});
        p2.emit('game:move', {x:1, y:0});
        p1.emit('game:move', {x:1, y:2});
        p2.emit('game:move', {x:2, y:2});
        p1.emit('game:move', {x:2, y:1});
        expect(game.isOver()).toBe(true);
      });
    });
  });
});
