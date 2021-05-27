window.setImmediate = window.setImmediate || function(cb) {
  return setTimeout(cb, null);
};

const isInline = (function IIFE() {
  const inlineList = [
    'inline',
    'inline-block',
    'table',
  ];
  return function isInline(element) {
    return element.nodeType === Node.TEXT_NODE ||
      !!~inlineList.indexOf(getComputedStyle(element).display) ||
      getComputedStyle(element).float !== 'none';
  };
}());

const isBlock = (function IIFE() {
  const blockTagList = [
    'aside',
    'pre',
    'script',
  ];
  const blockClassList = [
    'p',
    'where',
    'why',
  ];

  return function isBlock(element) {
    return !!~blockTagList.indexOf(element.tagName.toLowerCase()) ||
      blockClassList.some(className => element.classList.contains(className));
  };
}());

function parseContentType(a, b) {
  if (isInline(b)) {
    if (a === 'inline' || a === null) return 'inline';
    return 'mixed';
  } if (isBlock(b)) {
    if (a === 'block' || a === null) return 'block';
    return 'mixed';
  }
  return 'mixed';
}

function blockInP() {
  const pList = Array.from(document.getElementsByClassName('p'));

  pList.forEach(p => {
    const children = Array.from(p.childNodes);
    const contentType = children.reduce(parseContentType, null);

    if (contentType === 'inline')
      p.appendChild(document.createElement('div')).className = 'clearfix';
    else if (contentType === 'block') {
      children.forEach(e => {
        p.parentElement.insertBefore(e, p);
      });
      p.parentElement.removeChild(p);
    } else /* mixed */ {
      const inlineList = [];
      let divp = null;
      let dive = null;
      let inlineElement = null;

      children.forEach(child => {
        if (isInline(child)) inlineList.push(child);
        else {
          if (inlineList.length) {
            divp = p.parentElement.insertBefore(document.createElement('div'), p);
            divp.className = 'p';
            while (inlineElement = inlineList.shift()) divp.appendChild(inlineElement);
            divp.appendChild(document.createElement('div')).className = 'clearfix';
          }
          if (isBlock(child))
            p.parentElement.insertBefore(child, p);
          else {
            dive = p.parentElement.insertBefore(document.createElement('div'), p);
            dive.className = 'error-unknown-block';
            dive.appendChild(child);
          }
        }
      });
      if (inlineList.length) {
        divp = p.parentElement.appendChild(document.createElement('div'));
        divp.className = 'p';
        while (inlineElement = inlineList.shift()) divp.appendChild(inlineElement);
      }
      p.parentElement.removeChild(p);
    }
  });
}

function colorize() {
  const elems = Array.from(document.getElementsByClassName('syntax-color'));

  elems.forEach(syntaxColorize);
}

function syntaxColorize(element) {
  const content = element.innerText;

  if ((/^(-?[0-9.]+|true|True|TRUE|false|False|FALSE|null|NULL|None|undefined)$/).test(content))
    element.classList.add('mk-violet');
  else if ((/^("|').*\1$/).test(content))
    element.classList.add('mk-yellow');
}

function main() {
  setImmediate(blockInP);
  setImmediate(colorize);
}

main();
