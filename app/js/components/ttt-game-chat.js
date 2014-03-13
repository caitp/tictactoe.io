function tttGameChatCtrl(scope, element, socket) {
  this.enable = function() {
    
  }
}

tttGameChatCtrl.$inject = ["$scope", "$element", "$socket"];

app.controller("tttGameChatCtrl", tttGameChatCtrl);
app.directive("tttGameChat", ["$component", function($component) {
  return {
    restrict: "E",
    require: "^tttGame",
    controller: "tttGameChatCtrl",
    controllerAs: "$gameChat",
    link: function(scope, element, attrs, ctrl) {
      $component(scope, element, "view/game-chat.html", false, "tttGameChat");
      element.on("mouseover mouseenter", function(event) {
      });
    }
  };
}]);
