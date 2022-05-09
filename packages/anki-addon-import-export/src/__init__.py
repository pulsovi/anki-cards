from aqt import qt, mw
from exports import export_models
from imports import import_models

def add_button(title, action: callable):
    '''Add item with `title` text to tools menu and bind it with `action`'''
    button = qt.QAction(title, mw)
    button.triggered.connect(action)
    mw.form.menuTools.addAction(button)

add_button("Exporter les models", export_models)
add_button("Importer les models", import_models)
