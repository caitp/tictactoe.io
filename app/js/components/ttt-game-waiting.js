app.directive("tttGameWaiting", ["$component", function($component) {
  return {
    restrict: "E",
    require: "^tttGame",
    link: function(scope, element, attrs, game) {
      $component(scope, element, "view/game-waiting.html", false, "tttGameWaiting");
      var observer = new PathObserver(game, "waiting");
      observer.open(function(newValue, oldValue) {
        if (newValue) {
          element.attr("visible", "");
        } else {
          element.removeAttr("visible");
        }
      });
    }
  };
}]);
