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

var isBlock = function IIFE() {
  var blockTagList = [
    'aside',
    'pre',
    'script',
  ];
  var blockClassList = [
    'p',
    'where',
    'why',
  ];

  return function isBlock(element){
    return !!~blockTagList.indexOf(element.tagName.toLowerCase()) ||
      blockClassList.some(function(className){return element.classList.contains(className);});
  };
}();

function parseContentType(a, b) {
  if (isInline(b)) {
    if (a === 'inline' || a === null) return 'inline';
    return 'mixed';
  } else if(isBlock(b)) {
    if (a === 'block' || a === null) return 'block';
    return 'mixed';
  } else {
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
    } else /*mixed*/ {
      var inlineList = [];
      var divp = null;
      var dive = null;
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
          if (isBlock(child)){
            p.parentElement.insertBefore(child, p);
          } else {
            dive = p.parentElement.insertBefore(document.createElement('div'), p);
            dive.className = 'error-unknown-block';
            dive.appendChild(child);
          }
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
