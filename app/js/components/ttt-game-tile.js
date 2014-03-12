app.directive("tttTile", ["$component", function($component) {
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
}]);
