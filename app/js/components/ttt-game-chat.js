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
}]);
