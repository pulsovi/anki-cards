from aqt import mw
from aqt import qt
from aqt.utils import askUser, showInfo
import os
import pathlib
import shutil
from anki.hooks import addHook, remHook
from typing import Dict, List, Optional

config = mw.addonManager.getConfig(__name__)
ROOT_FOLDER = config['models root path']


def todo():
    raise Exception("La fonction n'est pas terminée")


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


def export_model(name, id):
    "Update or create fs model from Anki model"
    folder = get_model_folder(name)
    model_manager = mw.col.models
    model = model_manager.get(id)
    export_model_css(model, folder)
    for card in model["tmpls"]:
        export_model_card(folder, card)


def export_model_card(folder, card):
    name = card["name"]
    recto = card["qfmt"]
    verso = card["afmt"]
    write_file(os.path.join(folder, name + "_recto.html"), recto)
    write_file(os.path.join(folder, name + "_verso.html"), verso)


def export_model_css(model, folder):
    write_file(os.path.join(folder, "style.css"), model["css"])


def export_model_delete(name) -> None:
    "Deletes model from folder tree"
    question = "Le modèle " + name + " est absent de la collection," + \
        "supprimer le dossier correspondant dans le modèle pug ?"
    if not askUser(question): return

    folder = get_model_folder(name)
    try:
        # html folder ("out" directory)
        if os.path.isdir(folder):
            shutil.rmtree(folder)

        # pug folder
        pug = os.path.dirname(folder)
        if not os.listdir(pug):
            os.rmdir(pug)

            # model type folder (like "css" dir for "css::property" model)
            model_type = os.path.dirname(pug)
            if not os.listdir(model_type):
                model_type_folder = os.path.join(model_type, "out")
                model_type_name = "::".join(name.split("::")[0:-1])
                export_model_delete(model_type_folder, model_type_name)
    except Exception as error:
        showInfo(str(error))
        showInfo("Directory '%s' can not be removed" % folder)
    return


def export_models():
    for name, id in get_all_models().items():
        if id is None:
            # pug model which does not exists in Anki, delete it from folder tree
            export_model_delete(name)
        else:
            export_model(name, id)
    showInfo("Procédure terminée avec succés.")


def get_all_cards(model, folder) -> List[Dict]:
    ankiCards = model["tmpls"]
    ankiCardsNames = [card["name"] for card in ankiCards]
    files = list(os.walk(folder))[0][2]
    newCards = [{"name": recto.replace('_recto.html', '')}
        for recto in files if
        recto.endswith('_recto.html') and
        recto.replace('recto', 'verso') in files and
        recto.replace('_recto.html', '') not in ankiCardsNames]
    return ankiCards + newCards


def get_all_models() -> List[Dict[str, Optional[int]]]:
    "get all models from both Anki and folder tree as list of {name: id}"
    models = {}
    # Anki models
    for model in mw.col.models.all_names_and_ids():
        models[model.name] = model.id
    # folder tree models
    for model in get_fs_models():
        if model not in models:
            models[model] = None
    return models


def get_fs_models(root=ROOT_FOLDER) -> List[str]:
    "get list of models from folder tree"
    models = []
    for folder in list_folders_in(root):
        if folder == "out":
            models.append("")
            continue

        if not list_folders_in(os.path.join(root, folder)):
            models.append(folder)
            continue

        submodels = get_fs_models(os.path.join(root, folder))
        for submodel in submodels:
            models.append(folder + (("::" + submodel) if submodel else ""))
    return models


def get_model_folder(name):
    return os.path.join(ROOT_FOLDER, *(name.split("::")), "out")


def import_model_card_create(model, card, folder):
    todo()
    message = ""
    message += add_template(model, card, folder)
    mw.col.genCards(mw.col.models.nids(model))


def import_model_card_delete():
    todo()


def import_model_card_update(model, card, folder) -> str:
    "Updates anki card from folder tree"
    message = ""
    name = card["name"]
    file = os.path.join(folder, name)
    recto = read_file(file + "_recto.html")  # recto
    verso = read_file(file + "_verso.html")  # verso
    if card["qfmt"] != recto:
        card["qfmt"] = recto
        message += "\n\tupdate " + name + " recto"
    if card["afmt"] != verso:
        card["afmt"] = verso
        message += "\n\tupdate " + name + " verso"
    return message


def import_model_cards(model, folder) -> (str, bool):
    "Import cards of a model from folder tree"
    message = ""
    cards = get_all_cards(model, folder)
    for card in cards:
        name = card["name"]
        file = os.path.join(folder, name)
        recto = file + "_recto.html"
        if len(card.keys()) == 1:
            # new pug card, import it to anki
            message += import_model_card_create(model, folder, card)
        elif not os.path.isfile(recto):
            # anki card not in pug, delete it from Anki
            message += import_model_card_delete(model, card)
        else:
            # already existent card, update it in Anki
            message += import_model_card_update(model, card, folder)
    return message, bool(message)


def import_model_create(name):
    showInfo("create model : " + name)
    todo()


def import_model_css(model, folder) -> str:
    pugCss = read_file(os.path.join(folder, "style.css"))
    if model["css"] != pugCss:
        model["css"] = pugCss
        return "\n\tupdate css"
    return ""


def import_model_delete(id):
    showInfo("delete model : " + id)
    raise Exception("Fonction non créée")


def import_model_update(name, id, folder) -> str:
    "Update anki model by import its fields from folder tree"
    message = ""
    model = mw.col.models.get(id)
    templateUpdated = False

    message += import_model_css(model, folder)
    cardsMessage, templateUpdated = import_model_cards(model, folder)
    message += cardsMessage

    if not message: return message
    mw.col.models.save(model, templateUpdated)
    return "\n" + name + " :" + message


def import_models() -> str:
    show_card_count()
    message = ""
    for name, id in get_all_models().items():
        folder = get_model_folder(name)
        if id is None:
            # new pug model, create it in Anki
            message += import_model_create(name)
        elif not os.path.isdir(folder):
            # anki model not in pug, delete it from Anki
            message += import_model_delete(id)
        else:
            # already existent model, update it in Anki
            message += import_model_update(name, id, folder)
    mw.col.models.flush()
    show_card_count(message)


def list_folders_in(path) -> List[str]:
    return [folder for folder in os.listdir(path) if os.path.isdir(os.path.join(path, folder))]


def normalize(data):
    return b'\n'.join(
        bytes(i, 'utf8') for i in data.split('\n')
    )


def on_sync(state):
    showInfo("on_sync")
    try:
        if(state == 'findMedia'):
            print('anki:ready', end='', flush=True)
            remHook('sync', on_sync)
    except Exception as error:
        showInfo("on sync error" + str(error))


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
