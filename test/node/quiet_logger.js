function Logger() {
}

Logger.prototype = {
  log: function(msg) {},

  info: function(msg) {},

  debug: function(msg) {},

  error: function(msg) {},

  warn: function(msg) {}
};

function LoggerFactory() {
  return new Logger();
}

module.exports = {
  logger: LoggerFactory
};
