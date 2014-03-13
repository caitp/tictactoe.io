var Player = require('../../src/player');
var Game = require('../../src/game');
var Socket = require('./mock_socket');
var cleanPlayer = require('../../src/helpers').cleanPlayer;
var Injector = require('di').Injector;
require('./helpers');

describe('Matchmaker', function() {
  var injector;
  beforeEach(function() {
    injector = new Injector([
      require('./quiet_logger')
    ]);
  });
  var clear_matchmaker_timeout;
  function waitClearMatchmaker(time) {
    clear_matchmaker_timeout = setTimeout(function() {
      Player.matchmaker(false);
    }, time);
  }
  function clearMatchmaker() {
    Player.matchmaker(false);
    clearTimeout(clear_matchmaker_timeout);
  }
  it ('should setup a match after two connections are waiting', function() {
    var sock1 = new Socket(),
        sock2 = new Socket(),
        p1 = Player.connected(sock1, injector),
        p2 = Player.connected(sock2, injector),
        callback = jasmine.createSpy('game:start');
    p1.on('game:start', callback);
    p2.on('game:start', callback);
    Player.matchmaker();
    waitClearMatchmaker(1000);

    // Ensure that players are it the matchmaker list.
    p1.ready = p2.ready = true;
    p1.wait();
    p2.wait();

    // WARNING: Potentially flaky... Find a better way to do this!
    waitsFor(function() {
      return p1.game && p2.game && p1.game === p2.game;
    }, "waiting for sockets to be paired", 1000);
    runs(function() {
      expect(p1.game).not.toBeUndefined();
      expect(p2.game).not.toBeUndefined();
      expect(p1.game).toBe(p2.game);
      expect(callback.callCount).toBe(2);
      expect(callback).toHaveBeenCalledWith({
        opponent: cleanPlayer(p1),
        marker: "O"
      });
      expect(callback).toHaveBeenCalledWith({
        opponent: cleanPlayer(p2),
        marker: "X"
      });
      clearMatchmaker();
    });
  });  
});
