(function IIFE(){
  var __ = {
    'string': '',
  };

  var list = Array.from(document.getElementsByClassName('js-colorize'));
  list.forEach(colorize);

  function colorize(element){
    var type = getType(element);
    element.classList.add(__[type]);
  }

  function getType(element){
    var classes = element.className.split(' ');
    for(var i = 0; i< classes.length; ++i){
      if(classes[i].indexOf('color-') === 0)
        return classes[i].split('color-')[1].toLowerCase();
    }
  }

})();
