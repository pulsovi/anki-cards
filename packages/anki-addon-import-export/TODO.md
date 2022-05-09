## Anki addon import-export models
[x] [Rendre anki-cards/anki-addon-import-export configurable en local](obsidian://open?vault=Obsidian&file=David%20Gabison%2FArchive%2FRendre%20un%20AddOn%20Anki%20configurable)
[ ] configurer pylint pour qu'il relève toutes les erreurs possibles
  [ ] type de variable / retour fonction / argument de fonction manquant
  [x] fonction sans docstring
[x] déplacer le code du module dans le dossier `src/`
[ ] créer un script `watch.py` qui fasse la même chose que le fichier `../watch.js` mais en `Python`
[ ] couper le module en 4 fichiers :
  * **__init__**: contient le code d'initialisation du module, il ajoute les 2 options au menu `outils`
  * **import**: il fournit la fonction pour importer les modèles (le laisser vide pour un remplacement progressif des todo() par un code propre et relu)
  * **export**: il fournit la fonction pour exporter les modèles (le laisser vide pour un remplacement progressif des todo() par un code propre et relu)
  * **util**: il fournit les fonctions qui ne sont pas spécifiques à `import` ou `export` mais utilisées par ces fichiers
[ ] remplacer le contenu des 2 fonctions principales par un todo(), histoire de s'assurer une relecture complète du code
[ ] insérer un code 'reload' avant l'utilisation des fonctions `import` ou `export` pour éviter un rechargement constant de Anki à chaque mise à jour
[ ] terminer la relecture et la validation de tout le code
[ ] supprimer le code de 'reload'
