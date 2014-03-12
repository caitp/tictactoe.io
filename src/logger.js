var fmt = require('util').format;

function Logger() {
  this.silent = false;
}

Logger.prototype = {
  log: function(msg) {
    if (!this.silent) console.log(fmt.apply(null, arguments));    
  },

  info: function(msg) {
    if (!this.silent) console.log('info: ' + fmt.apply(null, arguments));    
  },

  debug: function(msg) {
    if (!this.silent) console.log('debug: ' + fmt.apply(null, arguments));
  },

  error: function(msg) {
    if (!this.silent) console.log('error: ' + fmt.apply(null, arguments));
  },

  warn: function(msg) {
    if (!this.silent) console.log('warn: ' + fmt.apply(null, arguments));
  }
};

function LoggerFactory() {
  return new Logger();
}

module.exports = {
  logger: LoggerFactory
};
