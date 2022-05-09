def add_button(title: str, action: callable) -> None:
    todo()
    button = qt.QAction(title, mw)
    button.triggered.connect(action)
    mw.form.menuTools.addAction(button)


def todo(message: str = '') -> None:
    """Indique que le code appelant n'est pas encore fini."""
    if message:
        raise Exception(message)
    raise Exception("La fonction n'est pas terminée ou documentée ou typée ou relue pour cette version de Anki")
