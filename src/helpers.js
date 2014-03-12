global.isString = function(str) {
  return str && typeof str === "string";
}

global.isObject = function(obj) {
  return obj && typeof obj === "object";
}

global.isFunction = function(fn) {
  return fn && typeof fn === "function";
}

exports.cleanPlayer = function(obj) {
  return {
    name: obj.name,
    profile: obj.profile
  };
}