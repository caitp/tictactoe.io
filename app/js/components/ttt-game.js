function tttGameCtrl(scope, element, socket) {
  var that = this;
  var TTT_TILE_REGEXP = /^ttt-tile$/i;
  var opponent;
  function opponentName() {
    return opponent ? opponent.name : "...";
  }
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

  socket.on("game:beginturn", function() {
    that.isturn = true;
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:moved", function(move) {
    // Need to surgically add move data...
    console.log(move);
    if (move.player.marker === that.marker) {
      that.isturn = false;
    }
    that.board.move(move.player.marker, move.x, move.y, {
      player: move.player,
      marker: move.player.marker,
      time: new Date(move.time)
    });
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:start", function(data) {
    opponent = data.opponent;
    that.marker = data.marker;
    that.board.reset();
    that.playing = true;
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:victory", function() {
    that.playing = false;
    that.endMessage = "VICTORY";
    that.endSubMessage = "Defeated " + opponentName();
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:defeat", function() {
    that.playing = false;
    that.endMessage = "DEFEAT";
    that.endSubMessage = "Defeated by " + opponentName();
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:forfeit", function(status) {
    that.playing = false;
    that.endMessage = status === "victory" ? "VICTORY" : "DEFEAT";
    that.endSubMessage = (status === "victory" ? "You" : opponentName()) + " forfeit the game";
    Platform.performMicrotaskCheckpoint();
  });
  socket.on("game:draw", function() {
    that.playing = false;
    that.endMessage = "DRAW GAME";
    that.endSubMessage = "They both lose...";
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
