from aqt import mw
from aqt import qt
from aqt.utils import showInfo
import os
import pathlib
import importlib
from . import coucou
from anki.hooks import addHook
from anki.hooks import remHook


ROOT_FOLDER = "D:\\MesDonnees\\Dev\\Kodech\\Anki\\cards\\model"


def export():
    for key in mw.col.models.models:
        export_note(mw.col.models.models[key])


def export_note(note):
    name = note["name"]
    folder = get_note_folder(name)
    print_css(folder, note["css"])
    cards = note["tmpls"]
    for card in cards:
        print_card(folder, card)


def print_card(folder, card):
    name = card["name"]
    recto = card["qfmt"]
    verso = card["afmt"]
    write_file(os.path.join(folder, name + "_recto.html"), recto)
    write_file(os.path.join(folder, name + "_verso.html"), verso)


def import_notes():
    ShowCardCount()
    message = ""
    for key in mw.col.models.models:
        message += import_note(mw.col.models.models[key])
    mw.col.models.flush()
    ShowCardCount(message)


def import_note(note):
    name = note["name"]
    message = ""
    folder = get_note_folder(name)
    css = read_css(folder)
    if note["css"] != css:
        message += "\n\tupdate css"
    note["css"] = css
    cards = note["tmpls"]
    for card in cards:
        message += read_card(folder, card)
    new_cards = list_new_cards(note)
    if len(new_cards):
        for new_card in new_cards:
            message += add_template(note, new_card, folder)
        mw.col.genCards(mw.col.models.nids(note))
    if message == "":
        return message
    mw.col.models.save(note, True)
    return "\n" + name + " :" + message


def add_template(note, name, folder):
    model_manager = mw.col.models
    template = model_manager.newTemplate(name)
    file = os.path.join(folder, name)
    recto = read_file(file + "_recto.html")  # recto
    verso = read_file(file + "_verso.html")  # verso
    template["qfmt"] = recto
    template["afmt"] = verso
    model_manager.addTemplate(note, template)
    return "\n\tadded " + name


def get_note_folder(name):
    return os.path.join(ROOT_FOLDER, *(name.split("::")), "out")


def read_card(folder, card):
    message = ""
    name = card["name"]
    file = os.path.join(folder, name)
    recto = read_file(file + "_recto.html")  # recto
    verso = read_file(file + "_verso.html")  # verso
    if card["qfmt"] != recto:
        message += "\n\tupdate " + name + " recto"
    if card["afmt"] != verso:
        message += "\n\tupdate " + name + " verso"
    card["qfmt"] = recto
    card["afmt"] = verso
    return message


def list_new_cards(note):
    files = list(os.walk(get_note_folder(note["name"])))[0][2]
    old_cards = [i["name"] for i in note["tmpls"]]
    new_cards = [i.replace('_recto.html', '') for i in files if
                 i.endswith('_recto.html') and
                 i.replace('recto', 'verso') in files and
                 i.replace('_recto.html', '') not in old_cards]
    return new_cards


def print_css(folder, data):
    write_file(os.path.join(folder, "style.css"), data)


def read_css(folder):
    return read_file(os.path.join(folder, "style.css"))


def write_file(filename, data):
    pathlib.Path(os.path.dirname(filename)).mkdir(parents=True, exist_ok=True)
    f = open(filename, 'wb')
    f.write(normalize(data))
    f.close()


def normalize(data):
    return b'\n'.join(
        bytes(i, 'utf8') for i in data.split('\n')
    )


def read_file(filename):
    if not os.path.exists(filename):
        return None
    fd = open(file=filename, mode='r', encoding='utf-8')
    data = fd.read()
    fd.close()
    return data


def ShowCardCount(message=""):
    cardCount = mw.col.cardCount()
    showInfo(("Card count: %d" % cardCount) + message)


export_action = qt.QAction("Exporter les notes", mw)
export_action.triggered.connect(export)
mw.form.menuTools.addAction(export_action)


import_notes_action = qt.QAction("Importer les notes", mw)
import_notes_action.triggered.connect(import_notes)
mw.form.menuTools.addAction(import_notes_action)


def onSync(state):
    try:
        if(state == 'findMedia'):
            print('anki:ready', end='', flush=True)
            remHook('sync', onSync)
    except:
        pass


addHook('sync', onSync)
