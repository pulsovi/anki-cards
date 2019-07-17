window.setImmediate = window.setImmediate || function(cb) {
  return setTimeout(cb, null);
};

var isInline = function IIFE() {
  var inlineList = [
    'inline',
    'inline-block',
    'table',
  ];
  return function isInline(element) {
    return element.nodeType === Node.TEXT_NODE ||
      !!~inlineList.indexOf(getComputedStyle(element).display) ||
      getComputedStyle(element).float !== 'none';
  };
}();

function parseContentType(a, b) {
  if (isInline(b)) {
    if (a === 'inline' || a === null) return 'inline';
    return 'mixed';
  } else {
    if (a === 'block' || a === null) return 'block';
    return 'mixed';
  }
}

function blockInP() {
  var pList = Array.from(document.getElementsByClassName('p'));
  pList.forEach(function(p) {
    var children = Array.from(p.childNodes);
    var contentType = children.reduce(parseContentType, null);
    if (contentType === 'inline') {
      p.appendChild(document.createElement('div')).className = 'clearfix';
    } else if (contentType === 'block') {
      children.forEach(function externalize(e) {
        p.parentElement.insertBefore(e, p);
      });
      p.parentElement.removeChild(p);
    } else {
      var inlineList = [];
      var divp = null;
      var inlineElement = null;
      children.forEach(function(child) {
        if (isInline(child)) inlineList.push(child);
        else {
          if (inlineList.length) {
            divp = p.parentElement.insertBefore(document.createElement('div'), p);
            divp.className = 'p';
            while ((inlineElement = inlineList.shift())) divp.appendChild(inlineElement);
            divp.appendChild(document.createElement('div')).className = 'clearfix';
          }
          p.parentElement.insertBefore(child, p);
        }
      });
      if (inlineList.length) {
        divp = p.parentElement.appendChild(document.createElement('div'));
        divp.className = 'p';
        while ((inlineElement = inlineList.shift())) divp.appendChild(inlineElement);
      }
      p.parentElement.removeChild(p);
    }
  });
}

function main() {
  setImmediate(blockInP);
}

main();
