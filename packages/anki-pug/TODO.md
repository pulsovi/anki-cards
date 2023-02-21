## Anki-pug

* [ ] Chaque fonctionalité doit être reportée dans le README.md avant le commit, ajouter un hook de pre-commit qui s'assure que le README.md est modifié à chaque commit qui commence par 'feat:'
* [ ] Chaque fonctionalité et correction de bug doit être reportée dans le CHANGELOG.md, ajouter un hook de pre-commit qui s'en assure
* [ ] Faire marcher la commande `yarn diff` dans le package `anki-models`
  Certains chemins mènent à `todo()` mais les dev-tools ne sont pas activés
  - [ ] Ajouter `--inspect` à la commande
  - [ ] Centraliser toutes les fonctions de `util` dans un package npm unique : [`@pulsovi/util`](C:\dev\pulsovi-util\pulsovi-util.sublime-project) pour avoir la dernière version de `todo` qui appelle `stop();`
* [ ] Dans le menu de template diff, proposer d'éditer le modèle pug avec la commande `e` :
  - [ ] Le CLI ouvre le fichier Pug correspondant à la carte dans l'éditeur externe
  - [ ] Puis on affiche la liste des fichiers surveillés : ce sont le fichier Pug et ceux dont il dépend (modèles et inclusions)
  - [ ] Quand une modification est détectée sur un de ces fichiers, relancer le diff sur la carte
* [x] Continuer à avancer sur la conversion typescript jusqu'à faire marcher la commande `anki-pug diff` 
* [x] Ajouter un README au package
* [x] Ajouter une section Installation dans le README.md
* [x] Ajouter une section Usage dans le README.md
* [ ] Ajouter une section Exemples dans le README.md
* [ ] anki-pug diff doit détecter les cartes qui existent dans Anki et qui manquent dans Pug
* [ ] Ajouter un CHANGELOG.md au package
