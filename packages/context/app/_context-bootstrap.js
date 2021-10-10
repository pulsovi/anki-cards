var global = this;

/*\
 * String
\*/
String.prototype.toCapitalCase = function() {
  return this[0].toUpperCase() + this.substring(1);
};

/*\
 * Log
\*/
function Log(id) {
  var console = document.getElementById(id);
  if (console === null) return function() {};

  console.setAttribute('dir', 'ltr');
  return function(data) {
    console.appendChild(document.createTextNode(data));
  };
}

Log.error = function IIFE() {
  var console = null;

  function getConsole() {
    if (console !== null) return console;
    console = document.createElement('div');
    console.setAttribute('style',
      'background: pink;' +
      'color: red;' +
      'border-radius: 20px;' +
      'border: solid red 1px;' +
      'bottom: 0;' +
      'left: 0;' +
      'position: fixed;' +
      'right: 0;' +
      'top: 0;' +
      'z-index: 9999;'
    );
    document.body.appendChild(console);
    return console;
  }
  return function error(data) {
    getConsole().appendChild(document.createTextNode(data));
  };
}();

/*\
 * Thenable
\*/
function Thenable(id) {
  this.id = id;
  this.thenCb = [];
  this.front = new ThenableFront(this);
}

function ThenableFront(parent) {
  this.parent = parent;
}

ThenableFront.prototype.then = function then(cb, id) {
//  console.error('ajout de listener pour', this.parent.id, id);
  var thenable = this.parent;
  cb.id = id;
  if ('function' !== typeof cb) {
    throw new TypeError(cb + 'is not a function');
  }
  if (this.parent.solved) {
    if (this.parent.next) {
      this.parent.next.then(cb);
    } else {
      setTimeout(function() {
//        console.error('declenchement du listener', cb.id, 'sur event', thenable.id, 'deja resolu');
        cb();
      }, null);
    }
  } else {
    this.parent.thenCb.push(cb);
  }
  return this;
};

Thenable.all = function all(thenableFrontArr, id) {
  var thenable = new Thenable(id);
  var resolved = -1;

  var next = function next() {
    ++resolved;
//    console.error('next', resolved, '/', thenableFrontArr.length, id);
    if (resolved === thenableFrontArr.length) {
      thenable.resolve();
    }
  };

  for (var i = 0; i < thenableFrontArr.length; ++i) {
    thenableFrontArr[i].then(next, 'increment next ' + id);
  }
  setTimeout(next, null);
  return thenable.front;
};

Thenable.prototype.resolve = function(value) {
//  console.error('event', this.id, 'declenché');
  var cb, cbRetVal;
  while ((cb = this.thenCb.shift())) {
//    console.error('declenchement du listener ' + cb.id + ' sur event ' + this.id);
    cbRetVal = cb.call(this, value);
    if (cbRetVal instanceof ThenableFront) {
      while ((cb = this.thenCb.shift())) {
        cbRetVal.then(cb, cb.id);
      }
      this.next = cbRetVal;
    }
  }
  this.solved = true;
};


/*\
 * Project
\*/
function Project(src, type) {
  this.src = src;
  this.type = type || 'script';
  this.dependancy = [];
  this.loaded = false;
}

Project.tags = {
  "script": "src"
};

Project.prototype.require = function require(dependancy) {
  if (!(dependancy instanceof Project)) {
    throw new TypeError('dependancy doit etre un Project');
  }
  this.dependancy.push(dependancy);
  return this;
};

Project.prototype.load = function load() {
  var thenable = new Thenable('load' + this.src);
  if (this.loaded) {
    thenable.resolve();
    return thenable.front;
  }

  var project = this;
  var allThenableFront = [];

  for (var i = 0; i < this.dependancy.length; ++i) {
    allThenableFront.push(this.dependancy[i].load());
  }

  Thenable.all(allThenableFront, 'dependances de ' + this.src + '[' + this.dependancy.map(function(project) { return project.src; }).join(', ') + ']')
    .then(function() {
//      console.error("tous les prerequis de", project.src, '[' + project.dependancy.map(function(project) { return project.src; }).join(', ') + ']', "sont chargés");
      return project['load' + project.type.toCapitalCase()]();
    }, 'chargement de ' + this.src)
    .then(function() {
      thenable.resolve();
    }, 'emit event : ' + this.src + ' loaded');

  this.loaded = true;

  return thenable.front;
};

Project.prototype.reload = function reload() {
  var thenable = new Thenable();
  var allThenableFront = [];
  var project = this;

  for (var i = 0; i < this.dependancy.length; ++i) {
    allThenableFront.push(this.dependancy[i].reload());
  }

  Thenable.all(allThenableFront)
    .then(function() {
      return project['reload' + project.type.toCapitalCase()]();
    })
    .then(function() {
      thenable.resolve();
    });

  return thenable.front;
};

Project.prototype.loadScript = function loadScript() {
//  console.error('chargement', this.src);
  var thenable = new Thenable('loadScript' + this.src);
  var script = document.createElement('script');
  script.onload = function() {
    //console.log(this.src + ' chargé');
    thenable.resolve(this);
  };
  document.head.appendChild(script);
  script.src = this.src;
  return thenable.front;
};

Project.prototype.reloadScript = function reloadScript() {
  console.error('la fonction reloadScript doit etre ecrite');
};

Project.prototype.watch = function watch() {
  console.error('la fonction watch doit etre ecrite');
};

setTimeout(function bootstrapIIFE() {
  global.log = Log('context-log');
  log("starts\n");
  new Project('_main-context.js' + '?prevent-cache=' + Math.floor(Math.random()*10000))
    .require(new Project('_get-context.js' + '?prevent-cache=' + Math.floor(Math.random()*10000)))
    .require(new Project('_context.js' + '?prevent-cache=' + Math.floor(Math.random()*10000))
      .require(new Project('_Promise.js' + '?prevent-cache=' + Math.floor(Math.random()*10000))
        .require(new Project('_promise_polyfill.js' + '?prevent-cache=' + Math.floor(Math.random()*10000)))
      )
    )
    .load()
    .then(function() {
      var answer = document.getElementById('answer');
      if (answer) {
        answer.scrollIntoView();
      }
    });
}, null);
