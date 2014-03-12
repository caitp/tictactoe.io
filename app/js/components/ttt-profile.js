function tttProfileCtrl(scope, element, socket) {
  scope.$profile = this;
  this.update = function() {
    socket.emit("profile:update", {
      name: this.name,
      profile: this.profile
    });
  }
}

tttProfileCtrl.$inject = ["$scope", "$element", "$socket"];

app.controller("tttProfileCtrl", tttProfileCtrl);
app.directive("tttProfile", ["$component", function($component) {
  return {
    restrict: "E",
    scope: true,
    controller: "tttProfileCtrl",
    link: function(scope, element, attrs) {
      $component(scope, element, "view/profile.html");
    }
  }
}]);
