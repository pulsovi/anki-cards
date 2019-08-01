(function IIFE() {
  var logos = {
    'anki': '_anki.svg',
    'anki-addon': '_anki.svg',
    'apache': '_apache.png',
    'autohotkey': '_ahk.png',
    'bash': '_bash.svg',
    'batch': '_batch.svg',
    'bootstrap': '_bootstrap.svg',
    'c': '_c.svg',
    'coffeescript': '_coffeescript.svg',
    'css':'_css3.svg',
    'docker': '_docker.svg',
    'dos': '_cmd.png',
    'es6':'_es6.png',
    'es8':'_es6.png',
    'excel': '_excel.svg',
    'express': '_npm.svg',
    'firefox': '_firefox.svg',
    'git': '_git.svg',
    'google': '_google.svg',
    'html':'_html5.svg',
    'javascript': '_js.png',
    'jquery': '_jquery.svg',
    'linux':'_linux.svg',
    'node.js':'_nodejs.svg',
    'npm': '_npm.svg',
    'php':'_php.svg',
    'pug':'_pug.svg',
    'python':'_python.svg',
    'python2':'_python.svg',
    'react':'_reactjs.svg',
    'unix': '_terminal.svg',
    'vba':'_vb.svg',
  };
  var header = document.getElementsByTagName('header')[0];
  if (!header) return;
  var tag = header.innerText.toLowerCase();
  if (!logos.hasOwnProperty(tag)) return;
  header.classList.add('logo');
  header.appendChild(document.createElement('img')).src = logos[tag];
}());
