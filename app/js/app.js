function isObject(obj) {
  return obj && typeof obj === "object";
}

function isFunction(fn) {
  return typeof fn === "function";
}

function isString(str) {
  return str && typeof str === "string";
}

function tttBoardCtrl(scope, element, socket) {
  var that = this;
  this.state = "profile";

  socket.on("profile:ready", function() {
    that.state = "game";
    scope.$apply();
    socket.emit("game:waitfor");
  });
  socket.on("profile:updated", function(data) {
    console.log("Profile updated:", JSON.stringify(data, null, 2));
  });
}

tttBoardCtrl.$inject = ["$scope", "$element", "$socket"];

function tttProfileCtrl(scope, element, socket) {
  scope.$profile = this;
  this.update = function() {
    socket.emit("profile:update", {
      name: this.name,
      profile: this.profile
    });
  }
}
tttProfileCtrl.protocol = {
  constructor: tttProfileCtrl
}

tttProfileCtrl.$inject = ["$scope", "$element", "$socket"];

function tttGameCtrl(scope, element, socket) {
  var that = this;
  var TTT_TILE_REGEXP = /^ttt-tile$/i;
  this.playing = false;
  this.board = new ttt.Board();

  this.enable = function() {
    
  }

  this.ready = function(node) {
    that.ready = undefined;
    angular.element(node[0].shadowRoot).on("click touch", function(event) {
      var target = event.target;
      while (target !== node[0].shadowRoot && !TTT_TILE_REGEXP.test(target.nodeName)) {
        target = target.parentNode;
      }
      target = angular.element(target);
      var attrs = target.data("$attrs");
      if (attrs) {
        var x = Number(attrs.x);
        var y = Number(attrs.y);
        socket.emit("game:move", {
          x: x,
          y: y
        });
      }
    });
  }

  socket.on("game:moved", function(move) {
    // Need to surgically add move data...
    console.log(move);
    that.board.move(move.player.marker, move.x, move.y, {
      player: move.player,
      marker: move.player.marker,
      time: new Date(move.time)
    });
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:start", function() {
    that.board.reset();
    that.playing = true;
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:victory", function() {
    that.playing = false;
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:defeat", function() {
    that.playing = false;
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:forfeit", function(status) {
    that.playing = false;
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:draw", function() {
    that.playing = false;
    Platform.performMicrotaskCheckpoint();
  });
}

tttGameCtrl.$inject = ["$scope", "$element", "$socket"];

function tttGameChatCtrl(scope, element, socket) {
  this.enable = function() {
    
  }
}

tttGameChatCtrl.$inject = ["$scope", "$element", "$socket"];

angular.module("tictactoe", [])
.factory("$socket", function() {
  var socket = io.connect(window.location.host);
  return socket;
})
.controller("tttBoardCtrl", tttBoardCtrl)
.directive("tttBoard", ["$component", function($component) {
  document.createElement("ttt-board");
  return {
    restrict: "E",
    scope: true,
    controller: "tttBoardCtrl",
    controllerAs: "$board",
    link: function(scope, element, attrs) {
      $component(scope, element, "view/board.html");
    }
  };
}])
.directive("tttProfile", ["$component", function($component) {
  return {
    restrict: "E",
    scope: true,
    controller: "tttProfileCtrl",
    link: function(scope, element, attrs) {
      $component(scope, element, "view/profile.html");
    }
  }
}])
.directive("tttGame", ["$component", "$socket", function($component) {
  document.createElement("ttt-game");
  return {
    restrict: "E",
    controller: "tttGameCtrl",
    controllerAs: "$game",
    link: function(scope, element, attrs, ctrl) {
      var node = $component(scope, element, "view/game.html");
      ctrl.ready(node);
    }
  };
}])
.directive("tttTile", ["$component", function($component) {
  document.createElement("ttt-tile");
  return {
    restrict: "E",
    require: "^tttGame",
    link: function(scope, element, attrs, game) {
      element.data("$attrs", attrs);
      $component(scope, element, "view/tile.html", false, 'tttTile');
      var x = Number(attrs.x), y = Number(attrs.y), i = (y * 3) + x;
      var observer = new PathObserver(game, 'board.state.' + i + '.marker');
      observer.open(function(newValue, oldValue) {
        console.log("newValue: " + newValue, "oldValue: " + oldValue);
        if (!newValue) element.removeClass('flipped x o');
        else if (newValue === 'X') element.removeClass('flipped o').addClass('flipped x');
        else if (newValue === 'O') element.removeClass('flipped x').addClass('flipped o');
      });
    }
  };
}])
.controller("tttGameChatCtrl", tttGameChatCtrl)
.directive("tttGameChat", ["$component", function($component) {
  return {
    restrict: "E",
    require: "^tttGame",
    controller: "tttGameChatCtrl",
    controllerAs: "$gameChat",
    link: function(scope, element, attrs, ctrl) {
      var node = $component(scope, element, "view/game-chat.html");
      var shadow = node[0].shadowRoot;
      angular.element(shadow).on("mouseover mouseenter", function(event) {
        if (event.target !== shadow) {
          event.preventDefault();
          if (!ctrl.enabled) {
            scope.$apply(function() {
              ctrl.enable();
            });
          }
        }
      });
    }
  };
}])
.factory("$component", ['$http', '$templateCache', '$compile',
function($http, $templateCache, $compile) {
  return function component(scope, element, template, shadow, ignore) {
    if (arguments.length < 4) shadow = true;
    var isnode = !!(element instanceof Node);
    var node = isnode ? element : element[0];
    var wrapped = node;


    // Upgrade element to support ShadowDOM
    if (isObject(window.ShadowDOMPolyfill) &&
        isFunction(ShadowDOMPolyfill.wrapIfNeeded)) {
      wrapped = ShadowDOMPolyfill.wrapIfNeeded(node);
    }

    if (isString(template)) {
      var root = shadow !== false ? wrapped.createShadowRoot() : wrapped;
      var $root = angular.element(root);
      $root.data('$scope', scope);
      $http.get(template, {cache: $templateCache})
        .success(function(data) {
          var host = shadow !== false ? node.shadowRoot : node;
          host.innerHTML = data;
          if (shadow !== false) {
            $compile(node.shadowRoot)(scope);
          } else {
            $compile(host, undefined, undefined, ignore)(scope);
          }
        });
    }

    return isnode ? angular.element(wrapped) : element;
  }
}]);
