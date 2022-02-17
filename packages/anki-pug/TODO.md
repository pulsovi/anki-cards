## Anki-pug

* [x] Utiliser js-yaml directement dans `src/lib/getConfig.ts` le module `rc-yaml` est inutile
  * [x] Corriger les erreurs de `@types/rc` dans `E:\dev\_Forks\DefinitelyTyped\types\rc` sur la base de mon travail dans `E:\_Forks\rc`.
  * [x] Ajouter des tests pour prouver la qualité de mon travail.
  * [x] En attendant la validation du PR et l'utilisation de la nouvelle version de `@types/rc`, patcher la version actuelle pour continuer à travailler
    * [x] ajouter une entrée "@types/rc" dans `E:\dev\03 - Anki\anki-cards\package.json@resolutions`
    * [x] ajouter la dépendance à `@types/minimist` dans `anki-cards/.yarnrc.yml@packageExtensions`
* [ ] Commit ce qui doit l'être pour que le repo soit propre
* [ ] Continuer à avancer sur la conversion typescript jusqu'à faire marcher la commande `anki-pug diff` 
* [ ] Ajouter un README au package
  * [ ] Installation
  * [ ] Usage
  * [ ] Exemples
