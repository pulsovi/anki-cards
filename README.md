# Anki Cards

Allow you to write your Anki models cards with pug.

This project will provide tools for :

- Compile your pug files to Anki HTML (Mustache) templates
- Synchronize your pug templates with existing Anki templates
- ...

## Outils

- **anki-addon-import-export :** un greffon Anki qui permet d'importer ou d'exporter les modèles de notes
- **anki-connect :** Un client node pour l'API du greffon anki-connect (sur le strore officiel de Anki)
- **anki-pug :** Un projet qui permet de maintenir une liste de modèles de notes au format pug. Possibilité d'ajouter des tests de rendu.
- **context :** Un script JS à ajouter à un modèle de note pour partager des grandes portions de texte entre les notes (à l'aide d'un dictionnaire qui associe une clé à chaque portion de texte à inclure)
- **anki-manager :** Un mini projet node qui permet de lancer Anki sur la machine pour s'assurer que l'API anki-connect est disponible
