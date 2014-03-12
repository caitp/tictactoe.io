app.factory("$socket", function() {
  var socket = io.connect(window.location.host);
  return socket;
});
