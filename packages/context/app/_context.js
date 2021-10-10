/*\
 * Class AJAX
\*/

var AJAX = {};

// Method
AJAX.get = function get(url) {
  var pnc = _.Promise.noCallBack();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function() {
    pnc.resolve.call(this, this.response);
  };
  xhr.onerror = xhr.onabort = function(error) {
    pnc.reject.call(this, error);
  };
  xhr.send(null);
  return pnc.promise;
};

AJAX.getJSON = function getJSON(url) {
  var pnc = _.Promise.noCallBack();
  this.get(url)
    .then(function(response) {
      var json = JSON.parse(response);
      pnc.resolve.call(this, json);
    })
    .catch(function(error) {
      pnc.reject.call(this, arguments);
    });
  return pnc.promise;
};

/*\
 * Class Tree
\*/

var Tree = {};
Tree.setRelation = function setRelation(obj) {
  var keys = Object.keys(obj);
  var groups = (obj.$ && obj.$.groups) || [];

  if (~keys.indexOf("$")) {
    keys.splice(keys.indexOf("$"), 1);
  }

  keys.sort(Tree.keysSortFunc);
  groups.sort(Tree.groupsSortFunc);

  var i, key, child, group;

  group = groups.shift();
  for (i = 0; i < keys.length; ++i) {
    key = keys[i];
    child = obj[key];

    if ('object' !== typeof child) {
      continue;
    }

    child.$ = child.$ || {};

    child.$.parent = obj;
    //child.$.title = child.$.title || child.$.id || key;
    child.$.id = child.$.id || child.$.title || key;

    if (key | 0 == key) {
      while (group && group.end < key) {
        group = groups.shift();
      }
      if (group && group.start <= key) {
        child.$.group = group;
      }
    }

    if (0 === i || (child.$.group && keys[i - 1] < child.$.group.start)) {
      child.$.previousSibling = null;
    } else {
      child.$.previousSibling = obj[keys[i - 1]];
    }

    if (keys.length === (i + 1) || (child.$.group && keys[i + 1] > child.$.group.end)) {
      child.$.nextSibling = null;
    } else {
      child.$.nextSibling = obj[keys[i + 1]];
    }

    setRelation(child);
  }
};

Tree.keysSortFunc = function keysSortFunc(a, b) {
  if (a | 0 == a) {
    return b | 0 == b ? a - b : -1;
  } else if (b | 0 == b) {
    return 1;
  } else {
    return a < b ? -1 : a > b ? 1 : 0;
  }
};

Tree.groupsSortFunc = function groupsSortFunc(a, b){
  return a.start - b.start;
};

/*\
 * Class Context
\*/

function Context(contextObj) {
  this.context = contextObj;
  this.init();
}

Context.prototype.init = function init() {
  Tree.setRelation(this.context);
};

Context.prototype.get = function get(path, options) {
  console.log('get', path);
  options = options || {};
  options.type = options.type || null;
  var parts = path.split('.');
  var elem = this.context;
  for (var i = 0; i < parts.length; ++i) {
    if (elem.hasOwnProperty(parts[i])) {
      elem = elem[parts[i]];
    } else if (elem.hasOwnProperty('$') && elem.$.hasOwnProperty(parts[i])) {
      elem = elem.$[parts[i]];
    } else {
      console.error(parts[i] + ' not found in ' + parts.slice(0, i).join('.'));
    }
    if (null === elem) {
      break;
    }
  }
  if ('string' !== typeof elem && 'string' === options.type){
    return '';
  }
  if ('object' === typeof elem && null !== elem) {
    var keys = Object.keys(elem);
    if (~keys.indexOf('$')) {
      keys.splice(keys.indexOf('$'), 1, '$:{' + Object.keys(elem.$).join(',\n\t\t') + '}');
    }
    elem = '{' + keys.join(',\n\t') + '}';
  }
  return elem;
};

/*\
 * Class Vue
\*/

function Vue(template) {
  this.template = template;
}

/*\
 * Class Console
\*/

function Console(element) {
  this.element = element;
}

Console.prototype.log = function(element) {
  if (!Node.prototype.isPrototypeOf(element)) {
    element = document.createTextNode(element);
  }
  this.element.appendChild(element);
};
