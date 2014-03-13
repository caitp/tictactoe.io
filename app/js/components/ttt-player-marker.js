app.directive("tttPlayerMarker", ["$component", function($component) {
  return {
    restrict: "E",
    require: "^tttGame",
    link: function(scope, element, attr, game) {
      $component(scope, element, "view/player-marker.html", false, "tttPlayerMarker");
      var markerObserver = new PathObserver(game, "marker");
      var playingObserver = new PathObserver(game, "playing");
      markerObserver.open(function(newValue, oldValue) {
        update(newValue, game.playing);
      });
      playingObserver.open(function(newValue, oldValue) {
        update(game.marker, newValue);
      });
      function update(marker, playing) {
        if (marker === "X") {
          element.removeClass("o").addClass("x");
        } else if (marker === "O") {
          element.removeClass("x").addClass("o");          
        }
        if (!playing) {
          element.removeAttr("visible");
        } else {
          element.attr("visible", "");
        }
      }
    }
  };
}]);
