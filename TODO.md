[ ] Supprimer les fichiers / dossiers inutiles à la racine du monorepo
  * [ ] Déplacer le contenu du dossier `config` en tant que configuration par défaut dans les packages ad-hoc
  * [ ] `/model` 
    * [ ] Une fois que anki-models sera fonctionnel
    * [ ] Faire une comparaison avec meld pour s'assurer qu'on ne va rien perdre
    * [ ] Supprimer le dossier
    * [ ] Commit la suppression
  * [ ] `/src`
    * [ ] Passer les fichiers en TypeScript et les supprimer au fur et à mesure
    * [ ] Commit la suppression de chaque fichier en même temps que la création de son remplaçant
  * [ ] `/test`
    * [ ] Passer le contenu de `/test` en TypeScript dans `/packages/pug-tests` et supprimer les fichiers au fur et à mesure
    * [ ] Le fichier `.eslintrc.old` sert pour le template html utilisé pour les tests, l'envoyer à la place qui correspond
  * [ ] Les fichiers `index.js` et `watch.js` sont utiles uniquement dans `packages/anki-addon-import-export`
    * [ ] Chercher s'il existe un module sur npm qui fait déjà ce travail, sinon en créer un
    * [ ] Idem en Python
    * [ ] Utiliser une version Python du watcher pour travailler sur le addon
      * [ ] transférer tous les fichier de `anki-addon-import-export` dans un sous-dossier `src`
      * [ ] Supprimer le fichier `.eslintrc` désormais inutile
      * [ ] ainsi que `eslint` dans `package.json`
      * [ ] ainsi que `eslint-config-pulsovi-node` dans `package.json`
      * [ ] ainsi que `lodash` dans `package.json`
      * [ ] ainsi que `{ engines: { node: '>=8.5.0' }}` dans `package.json`
[ ] Retrouver l'usage des packages anciennement utilisés ainsi que leurs alternatives, faire des notes sur obsidian pour ne pas oublier ...
  * [ ] config
  * [ ] diff
  * [ ] find-process
  * [ ] image-size
  * [ ] node-netstat
  * [ ] node-resemble-js
  * [ ] postcss
  * [ ] readline-sync
  * [ ] recursive-readdir-async
  * [ ] sharp
  * [ ] sqlite3
  * [ ] stylelint
  * [ ] uniqid
[ ] Rendre fonctionnel le module `packages/anki-addon-import-export` pour importer les changements apportés aux modèles
