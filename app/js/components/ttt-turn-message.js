app.directive("tttTurnMessage", ["$component", function($component) {
  return {
    restrict: "E",
    require: "^tttGame",
    link: function(scope, element, attrs, game) {
      $component(scope, element, "view/turn-message.html", false, "tttTurnMessage");
      var observer = new PathObserver(game, "isturn");
      observer.open(function(newValue, oldValue) {
        if (newValue) {
          element.attr("turn", "");
        } else {
          element.removeAttr("turn");
        }
      });
    }
  }  
}]);
