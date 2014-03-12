var Socket = require('./mock_socket');
var Player = require('../../src/player');
var Injector = require('di').Injector;
require('./helpers');

describe('Player', function() {
  var injector;
  beforeEach(function() {
    Player.reset();
    injector = new Injector([
      require('./quiet_logger')
    ]);
  });


  it('should update profile data on profile:update event', function() {
    var s1 = new Socket();
    var p1 = Player.connected(s1, injector);
    s1.emit('profile:update', {
      name: "caitp",
      profile: "all about me"
    });
    expect(p1.name).toBe("caitp");
    expect(p1.profile).toBe("all about me");
  });


  it('should set profile to the empty string if not supplied', function() {
    var s1 = new Socket();
    var p1 = Player.connected(s1, injector);
    s1.emit('profile:update', {
      name: "caitp",
    });
    expect(p1.name).toBe("caitp");
    expect(p1.profile).toBe("");
  });


  it('should emit an error when profile data is not an object', function() {
    var s1 = new Socket();
    var p1 = Player.connected(s1, injector);
    var callback = jasmine.createSpy('error');
    s1.on('ttt:error', callback);
    s1.emit('profile:update', 'name: "caitp"');
    expect(p1.name).toBeUndefined();
    expect(p1.profile).toBeUndefined();
    expect(callback.callCount).toBe(1);
  });


  it('should invalidate if profile.name is not a string', function() {
    var s1 = new Socket();
    var p1 = Player.connected(s1, injector);
    var callback = jasmine.createSpy('error');
    s1.on('profile:invalid', callback);
    s1.emit('profile:update', {name: 123});
    expect(p1.name).toBeUndefined();
    expect(p1.profile).toBeUndefined();
    expect(callback.callCount).toBe(1);
  });


  it('should invalidate if profile.name is less than minlength', function() {
    var s1 = new Socket();
    var p1 = Player.connected(s1, injector);
    var callback = jasmine.createSpy('error');
    s1.on('profile:invalid', callback);
    s1.emit('profile:update', {name: 'k8'});
    expect(p1.name).toBeUndefined();
    expect(p1.profile).toBeUndefined();
    expect(callback.callCount).toBe(1);
  });


  it('should request profile on game:waitfor event when not ready', function() {
    var s1 = new Socket();
    var p1 = Player.connected(s1, injector);
    var callback = jasmine.createSpy('game:profile');
    s1.on('game:profile', callback);
    s1.emit('game:waitfor');
    expect(p1.isWaiting()).toBe(false);
    expect(callback.callCount).toBe(1);
  });


  it('should enter waiting list on game:waitfor event when ready', function() {
    var s1 = new Socket();
    var p1 = Player.connected(s1, injector);
    p1.ready = true;
    s1.emit('game:waitfor');
    expect(p1.isWaiting()).toBe(true);
  });
});
