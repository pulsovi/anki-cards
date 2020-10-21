from aqt import mw
from aqt import qt
from aqt.utils import showInfo
import os
import pathlib
import importlib
from anki.hooks import addHook, remHook


ROOT_FOLDER = "E:\\dev\\03 - Anki\\anki-cards\\model"


def add_button(title, action):
    button = qt.QAction(title, mw)
    button.triggered.connect(action)
    mw.form.menuTools.addAction(button)


def add_template(model, name, folder):
    model_manager = mw.col.models
    template = model_manager.newTemplate(name)
    file = os.path.join(folder, name)
    recto = read_file(file + "_recto.html")  # recto
    verso = read_file(file + "_verso.html")  # verso
    template["qfmt"] = recto
    template["afmt"] = verso
    model_manager.addTemplate(model, template)
    return "\n\tadded " + name


def export_model(model):
    name = model["name"]
    folder = get_model_folder(name)
    print_css(folder, model["css"])
    cards = model["tmpls"]
    for card in cards:
        print_card(folder, card)


def export_models():
    for model in mw.col.models.all():
        export_model(model)


def get_model_folder(name):
    return os.path.join(ROOT_FOLDER, *(name.split("::")), "out")


def import_model(model):
    name = model["name"]
    message = ""
    folder = get_model_folder(name)
    css = read_css(folder)
    if model["css"] != css:
        message += "\n\tupdate css"
    model["css"] = css
    tempMessage = message
    cards = model["tmpls"]
    for card in cards:
        message += read_card(folder, card)
    new_cards = list_new_cards(model)
    if len(new_cards):
        for new_card in new_cards:
            message += add_template(model, new_card, folder)
        mw.col.genCards(mw.col.models.nids(model))
    if message == "":
        return message
    mw.col.models.save(model, tempMessage != message)
    return "\n" + name + " :" + message


def import_models():
    show_card_count()
    message = ""
    for key in mw.col.models.models:
        message += import_model(mw.col.models.models[key])
    mw.col.models.flush()
    show_card_count(message)


def list_new_cards(model):
    files = list(os.walk(get_model_folder(model["name"])))[0][2]
    old_cards = [i["name"] for i in model["tmpls"]]
    new_cards = [i.replace('_recto.html', '') for i in files if
                 i.endswith('_recto.html') and
                 i.replace('recto', 'verso') in files and
                 i.replace('_recto.html', '') not in old_cards]
    return new_cards


def normalize(data):
    return b'\n'.join(
        bytes(i, 'utf8') for i in data.split('\n')
    )


def on_sync(state):
    try:
        if(state == 'findMedia'):
            print('anki:ready', end='', flush=True)
            remHook('sync', on_sync)
    except:
        pass


def print_card(folder, card):
    name = card["name"]
    recto = card["qfmt"]
    verso = card["afmt"]
    write_file(os.path.join(folder, name + "_recto.html"), recto)
    write_file(os.path.join(folder, name + "_verso.html"), verso)


def print_css(folder, data):
    write_file(os.path.join(folder, "style.css"), data)


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


def read_css(folder):
    return read_file(os.path.join(folder, "style.css"))


def read_file(filename):
    if not os.path.exists(filename):
        return None
    fd = open(file=filename, mode='r', encoding='utf-8')
    data = fd.read()
    fd.close()
    return data


def show_card_count(message=""):
    cardCount = mw.col.cardCount()
    showInfo(("Card count: %d" % cardCount) + message)


def write_file(filename, data):
    pathlib.Path(os.path.dirname(filename)).mkdir(parents=True, exist_ok=True)
    f = open(filename, 'wb')
    f.write(normalize(data if data else ""))
    f.close()


add_button("Exporter les models", export_models)
add_button("Importer les models", import_models)
addHook('sync', on_sync)
