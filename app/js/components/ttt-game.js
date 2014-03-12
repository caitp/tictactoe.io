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

app.controller("tttGameCtrl", tttGameCtrl);
app.directive("tttGame", ["$component", "$socket", function($component) {
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
}]);
