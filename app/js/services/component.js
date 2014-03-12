app.factory("$component", ['$http', '$templateCache', '$compile',
function($http, $templateCache, $compile) {
  return function component(scope, element, template, shadow, ignore) {
    if (arguments.length < 4) shadow = true;
    var isnode = !!(element instanceof Node);
    var node = isnode ? element : element[0];
    var wrapped = node;


    // Upgrade element to support ShadowDOM
    if (isObject(window.ShadowDOMPolyfill) &&
        isFunction(ShadowDOMPolyfill.wrapIfNeeded)) {
      wrapped = ShadowDOMPolyfill.wrapIfNeeded(node);
    }

    if (isString(template)) {
      var root = shadow !== false ? wrapped.createShadowRoot() : wrapped;
      var $root = angular.element(root);
      $root.data('$scope', scope);
      $http.get(template, {cache: $templateCache})
        .success(function(data) {
          var host = shadow !== false ? node.shadowRoot : node;
          host.innerHTML = data;
          if (shadow !== false) {
            $compile(node.shadowRoot)(scope);
          } else {
            $compile(host, undefined, undefined, ignore)(scope);
          }
        });
    }

    return isnode ? angular.element(wrapped) : element;
  }
}]);
