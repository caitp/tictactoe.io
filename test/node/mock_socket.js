var LEADING_SPACE = /^\s+/;
var TRAILING_SPACE = /\s+$/;
function trim(str) {
  return ('' + str).replace(LEADING_SPACE, '').replace(TRAILING_SPACE, '');
}
function MockSocket(callback) {
  this.callback = callback;
  this.handlers = {};
}

// This is a really poor mockery of the socket.io Socket API, but it should
// suit the needs of this test suite. It can be improved as needed.
MockSocket.prototype = {
  constructor: MockSocket,
  on: function(name, fn) {
    var that = this;
    if (typeof name === "string") name = trim(name).split(/\s+/);
    if (Array.isArray(name)) {
      name.forEach(function(name) {
        var handlers = that.handlers[name] || (that.handlers[name] = []);
        handlers.push(fn);
      });
    }
    return this;
  },

  emit: function(name, data) {
    var handlers = this.handlers[name];
    if (handlers) {
      for (var i=0, ii=handlers.length; i<ii; ++i) {
        var fn = handlers[i];
        fn(data);
      }
    }
  }
};

module.exports = MockSocket;
