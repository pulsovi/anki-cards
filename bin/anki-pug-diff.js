//jshint esversion: 6
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const ankiPug = require('./anki-pug');
const readline = require('readline-sync');
const child_process = require('child_process');

const sublime_text = "C:\\Program Files\\Sublime Text 3\\sublime_text.exe";
const CC = { /*console_colors*/
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgLightGray: "\x1b[37m",

  FgGray: "\x1b[90m",
  FgLightRed: "\x1b[91m",
  FgLightGreen: "\x1b[92m",
  FgLightYellow: "\x1b[93m",
  FgLightBlue: "\x1b[94m",
  FgLightMagenta: "\x1b[95m",
  FgLightCyan: "\x1b[96m",
  FgWhite: "\x1b[97m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};

var manageAllNotes = false;

ankiPug
  .tree(__dirname + '/../model')
  .getNotes()
  .then(function(notes) {
    manageNotes(notes);
  })
  .catch(function(err) {
    throw err;
  });

function manageNotes(notes) {
  for (let i = 0; i < notes.length; ++i) {
    var note = notes[i];
    manageNote(note);
  }
}

function manageNote(note) {
  var doManage;
  var templateNames = note.templateNames;
  var listOnly = false;
  for (let i = 0; i < templateNames.length; ++i) {
    let template = note.template[templateNames[i]];
    if (template.actual === template.expected) continue;
    while (!doManage) {
      if (manageAllNotes) {
        doManage = true;
        console.log(`${CC.FgLightCyan}${note.name}${CC.Reset}`);
        break;
      }
      process.stdout.write(`${CC.FgLightCyan}manage ${note.name} [ynaq]? ${CC.Reset}`);
      var response = readline.question();
      switch (response) {
        case 'y':
        case 'Y':
          doManage = true;
          break;
        case 'n':
        case 'N':
          return;
        case 'a':
        case 'A':
          doManage = manageAllNotes = true;
          break;
        case 'q':
        case 'Q':
          process.exit();
          break;
        default:
          console.log(
            CC.FgRed +
            '\ty - [yes]  manage\n' +
            '\tn - [no]   skip this note\n' +
            '\tq - [quit] skip all unmanaged notes and quit the diff' +
            CC.Reset
          );
          break;
      }
    }
    if (listOnly) {
      console.log(CC.FgLightBlue + template.name + CC.Reset);
    } else {
      listOnly = manageTemplate(note, template);
    }
  }
}

function manageTemplate(note, template) {
  while (true) {
    process.stdout.write(CC.FgLightBlue + '  compare ' + template.name + ' [ynolq]? ' + CC.Reset);
    var response = readline.question();
    switch (response) {
      case 'y':
      case 'Y':
        var pugFile = template.pugFile;
        if(!pugFile) pugFile = note.maker.fullname;
        child_process.exec(`"${sublime_text}" "${pugFile}"`);
        mkdirp.sync(path.dirname(template.actualPath));
        fs.writeFileSync(template.actualPath, template.expected, { encoding: 'utf8' });
        child_process.execSync(`meld "${template.actualPath}" "${template.fullname}"`);
        break;
      case 'n':
      case 'N':
        return;
      case 'o':
      case 'O':
        fs.writeFileSync(template.fullname, template.expected, { encoding: 'utf8' });
        return;
      case 'l':
      case 'L':
        return true;
      case 'q':
      case 'Q':
        process.exit();
        break;
      default:
        console.log(
          CC.FgRed +
          '\ty - [yes]       compare versions\n' +
          '\tn - [no]        skip this template\n' +
          '\to - [overwrite] replace the actual note template with the parsed pug template\n' +
          '\tl - [list]      list all template conflict and quit this note\n' +
          '\tq - [quit]      skip all unmanaged notes and templates and quit the diff' +
          CC.Reset
        );
        break;
    }
    note.reload();
    template = note.template[template.name];
    if (template.actual === template.expected) {
      break;
    }
  }
}
