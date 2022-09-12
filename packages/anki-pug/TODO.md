## Anki-pug

* [ ] Dans le menu de template diff, proposer d'éditer le modèle pug avec la commande `e` :
  - [ ] Le CLI ouvre le fichier Pug correspondant à la carte dans l'éditeur externe
  - [ ] Puis on affiche la liste des fichiers surveillés : ce sont le fichier Pug et ceux dont il dépend (modèles et inclusions)
  - [ ] Quand une modification est détectée sur un de ces fichiers, relancer le diff sur la carte
* [x] Continuer à avancer sur la conversion typescript jusqu'à faire marcher la commande `anki-pug diff` 
* [ ] Ajouter un README au package
  * [x] Installation
  * [x] Usage
  * [ ] Exemples
* [ ] anki-pug diff doit détecter les cartes qui existent dans Anki et qui manquent dans Pug
