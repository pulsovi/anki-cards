const isInline = (function IIFE() {
  const inlineList = [
    'inline',
    'inline-block',
    'table',
  ];
  return element => element.nodeType === Node.TEXT_NODE ||
    inlineList.includes(getComputedStyle(element).display) ||
    getComputedStyle(element).float !== 'none';
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

  return element => blockTagList.includes(element.tagName.toLowerCase()) ||
    blockClassList.some(className => element.classList.contains(className));
}());

function getContentType(elem) {
  if (isInline(elem)) return 'inline';
  if (isBlock(elem)) return 'block';
  return 'mixed';
}

function parseContentTypeReducer(parsed, elem) {
  const elemType = getContentType(elem);

  if (parsed === null || parsed === elemType) return elemType;
  return 'mixed';
}

function blockInP() {
  const pList = Array.from(document.getElementsByClassName('p'));

  pList.forEach(pNode => {
    const children = Array.from(pNode.childNodes);
    const contentType = children.reduce(parseContentTypeReducer, null);

    if (contentType === 'inline')
      pNode.appendChild(document.createElement('div')).className = 'clearfix';
    else if (contentType === 'block') {
      children.forEach(childNode => {
        pNode.parentElement.insertBefore(childNode, pNode);
      });
      pNode.parentElement.removeChild(pNode);
    } else {
      // mixed content
      const inlineList = [];
      let divp = null;
      let divError = null;

      children.forEach(child => {
        if (isInline(child)) inlineList.push(child);
        else {
          if (inlineList.length) {
            divp = pNode.parentElement.insertBefore(document.createElement('div'), pNode);
            divp.className = 'p';
            inlineList.forEach(inlineElement => divp.appendChild(inlineElement));
            inlineList.length = 0;
            divp.appendChild(document.createElement('div')).className = 'clearfix';
          }
          if (isBlock(child))
            pNode.parentElement.insertBefore(child, pNode);
          else {
            divError = pNode.parentElement.insertBefore(document.createElement('div'), pNode);
            divError.className = 'error-unknown-block';
            divError.appendChild(child);
          }
        }
      });
      if (inlineList.length) {
        divp = pNode.parentElement.appendChild(document.createElement('div'));
        divp.className = 'p';
        inlineList.forEach(inlineElement => divp.appendChild(inlineElement));
        inlineList.length = 0;
      }
      pNode.parentElement.removeChild(pNode);
    }
  });
}

function colorize() {
  const elems = Array.from(document.getElementsByClassName('syntax-color'));

  elems.forEach(syntaxColorize);
}

function syntaxColorize(element) {
  const content = element.innerText;

  if ((/^(?<keyword>-?[0-9.]+|true|True|TRUE|false|False|FALSE|null|NULL|None|undefined)$/u).test(content))
    element.classList.add('mk-violet');
  else if ((/^(?<openQuote>"|').*\1$/u).test(content))
    element.classList.add('mk-yellow');
}

function docReady(cb) {
  if (document.readyState === 'complete' || document.readyState === 'interactive')
    setTimeout(cb, null);
  else
    document.addEventListener('DOMContentLoaded', cb);
}

docReady(() => {
  blockInP();
  colorize();
});
