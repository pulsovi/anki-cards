## Anki-pug

* [x] Utiliser js-yaml directement dans `src/lib/getConfig.ts` le module `rc-yaml` est inutile
  * [x] Corriger les erreurs de `@types/rc` dans `E:\dev\_Forks\DefinitelyTyped\types\rc` sur la base de mon travail dans `E:\_Forks\rc`.
  * [x] Ajouter des tests pour prouver la qualité de mon travail.
  * [x] En attendant la validation du PR et l'utilisation de la nouvelle version de `@types/rc`, patcher la version actuelle pour continuer à travailler
    * [x] ajouter une entrée "@types/rc" dans `E:\dev\03 - Anki\anki-cards\package.json@resolutions`
    * [x] ajouter la dépendance à `@types/minimist` dans `anki-cards/.yarnrc.yml@packageExtensions`
* [ ] Commit ce qui doit l'être pour que le repo soit propre
  * [ ] Dans TaskSyncer, TaskSyncer et Ticket doivent fusionner: écrire des tests
    * [x] TaskSyncer.getTicket renvoie une sous-instance de TaskSyncer
    * [x] Le premier ticket du syncer est "ready" immédiatement mais pas de façon synchrone
    * [ ] Les sous-instances ne sont "ready" que si leur parent est à la fois "ready" ET non "done"
      * [ ] le premier sous-ticket du premier ticket est ready immédiatement (en même temps que son parent)
      * [x] un sous-ticket n'est pas ready si son parent ne l'est pas
      * [ ] le premier sous-ticket d'un ticket est ready en même temps que son parent
      * [ ] si le parent est done avant que le ticket ne soit ready, le ticket.ready est rejeté
      * [ ] si le parent est done après que le ticket soit ready
        * [ ] le ticket.ready est résolu au moment voulu
        * [ ] une fois le parent done, le ticket.ready est remplacé par un Promise.reject
    * [ ] Ticket.ready est remplacé par un Promise.reject('le ticket est fermé') quand le ticketest  "done"
* [ ] Continuer à avancer sur la conversion typescript jusqu'à faire marcher la commande `anki-pug diff` 
* [ ] Ajouter un README au package
  * [ ] Installation
  * [ ] Usage
  * [ ] Exemples
