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

app.controller("tttBoardCtrl", tttBoardCtrl);
app.directive("tttBoard", ["$component", function($component) {
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
}]);
