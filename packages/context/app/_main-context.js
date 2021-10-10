(function mainIIFE(global) {
  if ('undefined' === typeof global.context) {
    log("Le context n'a pas pu être chargé.\nMerci de vérifier la syntaxe du fichier <_get-context.js>\n");
    return;
  }
  var context = new Context(global.context);

  contextQuote();
  contextShow();
  contextHide();
  contextData();

  function contextData() {
    var cible;
    var collection = document.querySelectorAll('[context-data]');
    for (var i = 0; i < collection.length; ++i) {
      cible = collection[i].getAttribute('context-data');
      collection[i].innerText = context.get(cible);
    }
  }

  function contextShow() {
    var collection = document.querySelectorAll('[context-show]');
    for (var i = 0; i < collection.length; ++i) {
      if (!context.get(collection[i].getAttribute('context-show'))) {
        collection[i].parentElement.removeChild(collection[i]);
      } else {
        collection[i].hidden = false;
      }
    }
  }

  function contextHide() {
    var collection = document.querySelectorAll('[context-hide]');
    for (var i = 0; i < collection.length; ++i) {
      if (context.get(collection[i].getAttribute('context-hide'))) {
        collection[i].parentElement.removeChild(collection[i]);
      } else {
        collection[i].hidden = false;
      }
    }
  }

  function contextQuote() {
    var collection = document.querySelectorAll('[context-quote]');
    for (var i = 0; i < collection.length; ++i) {
      collection[i].classList.add('context-quote');
      contextQuoteTitle(collection[i]);
      contextQuoteContent(collection[i]);
    }
  }

  function isValidHTML(text) {
    var tagDeepArr = [];
    var tagExp = /<[^>]*>/g;
    var tagTextExp = /[a-z0-9]+/;
    var allTags = text.match(tagExp) || [];
    var currentTag;
    var currentTagText;
    var ommitCloseTags = ['base', 'br', 'input', 'meta', 'wbr'];

    while ((currentTag = allTags.shift())) {
      if (currentTag.charAt(1) == '/') {
        if (!tagDeepArr.length || currentTag.slice(2, -1) !== tagDeepArr.pop()) {
          return false;
        }
      } else {
        currentTagText = currentTag.match(tagTextExp)[0];
        if (currentTag.slice(-2, -1) === '/' ||
          currentTag.substring(1, 4) === '!--' ||
          ~ommitCloseTags.indexOf(currentTagText)) {
          console.log(currentTag);
          continue;
        }
        tagDeepArr.push(currentTagText);
      }
    }
    return true;
  }

  function wrapByTag(text, tag, stepArr) {
    var outputText = "";
    var tagActive = false;
    var step;
    var char;
    var i = 0;

    stepArr.push(Infinity);
    while (null != (step = stepArr.shift()) && i < text.length) {
      while (step > 0 && i < text.length) {
        char = text[i++];
        if (char == '<') {
          if (tagActive) {
            outputText += "</" + tag + ">";
          }
          while (char == '<') {
            outputText += char;
            while (char != '>' && i < text.length) {
              char = text[i++];
              outputText += char;
            }
            char = text[i++];
          }
          if (i >= text.length) {
            return outputText;
          }
          if (tagActive) {
            outputText += "<" + tag + ">";
          }
        }
        outputText += char;
        --step;
      }
      if (i >= text.length) {
        console.log(outputText);
        return outputText + (tagActive ? '</' + tag + '>' : '');
      }
      outputText += '<' + (tagActive ? '/' : '') + tag + '>';
      tagActive = !tagActive;
    }
  }

  function contextQuoteTitle(element) {
    var titleDeep = element.getAttribute('context-title-deep') || 1;
    var titleElem = document.createElement('code');
    var titleCible = element.getAttribute('context-quote');
    var titleArr = [context.get(titleCible + '.title', { type: 'string' })];
    for (; titleDeep > 0; --titleDeep) {
      titleArr.unshift(context.get(titleCible + '.id', { type: 'string' }));
      titleCible += '.parent';
    }
    titleElem.appendChild(document.createTextNode('\u261a' + titleArr.join(' ') + ':'));
    element.appendChild(titleElem);
  }

  function contextQuoteContent(element) {
    var content = document.createElement('div');
    var cible = element.getAttribute('context-quote');
    var rawText = context.get(cible + '.content');
    if (!isValidHTML(rawText)) {
      log('contenu HTML non valide');
      content.innerText = "Contenu HTML non valide : \n\n" +
        rawText;
      element.appendChild(content);
      return;
    }
    var boldedText = contextQuoteBold(element, rawText);
    content.innerHTML = boldedText;
    element.appendChild(content);
  }

  function contextQuoteBold(element, text) {
    var boldList = element.getAttribute('context-bold');
    if (boldList) {
      boldList = boldList.split(' ');
    } else {
      boldList = [];
    }
    return wrapByTag(text, 'b', boldList);
  }

  log("context chargé");
}(this));
