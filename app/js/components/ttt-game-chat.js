function tttGameChatCtrl(scope, element, socket) {
  var canSend = true;
  var autoScroll = true;
  scope.$game.$chat = this;

  this.init = function(node) {
    this.init = undefined;
    var messages = element.children().eq(0);
    node = messages[0];
    messages.on("scroll", function(event) {
      autoScroll = !(node.scrollTop < (node.scrollHeight - node.clientHeight));
    });
  }

  this.newMessage = function() {
    var messages = element.children().eq(0)[0];
    if (autoScroll) {
      messages.scrollTop = messages.lastElementChild.offsetTop;
    }
  }
  this.sendMessage = function() {
    var chat = element.find("input");
    if (!chat.length) return;
    var value = chat.val();
    if (typeof value !== "string" || !value.length || !canSend) return;
    chat.val('');
    socket.emit("game:chat:send", value);

    // Calm down! Stop sending messages!
    canSend = false;
    setTimeout(function() {
      canSend = true;
    }, 500);
  }
}

tttGameChatCtrl.$inject = ["$scope", "$element", "$socket"];

app.controller("tttGameChatCtrl", tttGameChatCtrl);
app.directive("tttGameChat", ["$component", function($component) {
  return {
    restrict: "E",
    require: ["^tttGame", "tttGameChat"],
    controller: "tttGameChatCtrl",
    controllerAs: "$chat",
    link: function(scope, element, attrs, ctrl) {
      var game = ctrl[0], chat = ctrl[1];
      $component(scope, element, "view/game-chat.html", false, "tttGameChat", function(node) {
        chat.init(node);
      });
    }
  };
}]);
