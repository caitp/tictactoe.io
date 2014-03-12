app.directive("tttGameEndDialog", ["$component", function($component) {
  return {
    restrict: "E",
    require: "^tttGame",
    scope: true,
    link: function(scope, element, attr, game) {
      $component(scope, element, "view/end-dialog.html", false, 'tttGameEndDialog');
      var observer = new PathObserver(game, "endMessage");
      observer.open(function(newValue, oldValue) {
        if (newValue) {
          scope.$digest();
          element.attr('visible', '');
        } else {
          element.removeAttr('visible');
          scope.$digest();
        }
      });
    }
  };
}]);
