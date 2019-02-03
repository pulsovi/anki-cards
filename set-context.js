angular.module('customfilter', []).filter('getType', function() {
  return function(obj) {
    return typeof obj;
  };
});

// Define the `set-context` module
var setContext = angular.module('set-context', ['customfilter']);

// Define the `contextController` controller on the `set-context` module
setContext.controller('contextController', function contextController($scope) {
  window.mainScope = $scope;
  $scope.path = [{ id: 'context' }];
  $scope.context = context;
  $scope.setPath = function(index, key) {
    // valeurs par defaut
    index = index || 0;
    if (!key) {
      key = $scope.path[index].id;
      --index;
    }
    // main
    var elem = $scope.currentElement = getPath(index, key);
    $scope.currentElementProperties = getFieldsList(elem);
    var pathItem = { id: key, keys: getChildrenList(elem) };
    $scope.path.splice(index + 1, $scope.path.length, pathItem);
    savePath();
  };
  $scope.setPath();

  function getChild(root, path) {
    var child = root;
    var key;
    while((key = path.shift())){
      child = child[key];
    }
    return child;
  }

  function getPath(index, key) {
    var path = $scope.path.slice(0, index + 1)
      .map(function(i) { return i.id; })
      .concat(key);
    return getChild($scope, path);
  }

  function getChildrenList(elem) {
    var keys = Object.keys(elem);
    return keys.filter(function(k) {
      return k !== '$';
    });
  }

  function getFieldsList(elem) {
    return elem.$ ? Object.keys(elem.$) : [];
  }

  function savePath() {
    var pathList = $scope.path.map(function(e) {
      return e.id;
    });
    localStorage.setItem('path', JSON.stringify(pathList));
  }
});
