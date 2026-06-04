---
description: Technical reference for Dexapp rail/sidebar hierarchy, backend mapping, and Alpine + Sortable drag and drop flows.
---

# Sidebar + Rail Hierarchy Drag & Drop

## Objectif

Cette note documente le comportement attendu de la railbarre gauche et de la sidebar Dexapp, leur lien avec le backend, et les regles importantes pour Alpine.js + SortableJS.

Elle complete `.agent/workflows/drag-drop-alpine-sortable.md`.

## Nommage logique vs stockage legacy

Le refactor produit un nommage logique plus clair, mais le stockage Mongo garde encore des noms historiques.

| UI logique | Emplacement UI | Modele legacy | Champ parent legacy |
| --- | --- | --- | --- |
| Space | Railbarre gauche | `Environment` | aucun |
| Section | Top niveau de la sidebar dans un Space | `Space` | `environmentId` |
| Folder | Enfant de section ou de folder | `Folder` | `spaces`, `parentFolders`, `environmentId` |
| View/entity/hub/cockpit | Feuille dans la sidebar | `View` ou legacy `Entity` | `spaces`, `folders`, `environmentId` |

Points importants :

- La railbarre contient des Spaces logiques, serialises par le backend avec `type: 'space'`.
- En mode legacy frontend, les sections de sidebar sont encore rendues avec `type: 'space'`.
- Le backend accepte aussi les nouveaux noms `section` et `space-root`.
- `environment-root` et `space-root` designent le parent racine d'un Space de rail.
- Les anciens folders de type `environment` sont normalises comme folders dans le nouveau naming.

## Fichiers principaux

- UI rail/sidebar : `views/nav/nav-sidebar.ejs`
- Backend hierarchy : `controllers/hierarchy.controller.js`
- Routes API : `routes/api/api-account.router.js`
- Modeles legacy :
  - `models/environment.model.js` : Space de rail
  - `models/space.model.js` : Section de sidebar
  - `models/folder.model.js` : Folder
  - `models/view.model.js` : views, hubs, cockpits

## Endpoints hierarchy principaux

Rail Spaces :

- `GET /account/:account/api/hierarchy/environments`
- `GET /account/:account/api/hierarchy/spaces`
- `POST /account/:account/api/hierarchy/environment`
- `POST /account/:account/api/hierarchy/environment/update`
- `POST /account/:account/api/hierarchy/environment/delete`
- `POST /account/:account/api/hierarchy/environment/reorder`
- Alias nouveaux : `/hierarchy/spaces`, `/hierarchy/spaces/update`, `/hierarchy/spaces/delete`, `/hierarchy/spaces/reorder`

Sidebar hierarchy :

- `GET /account/:account/api/hierarchy/list?environmentId=<railSpaceId>`
- `GET /account/:account/api/hierarchy/list?spaceId=<railSpaceId>&naming=new`
- `POST /account/:account/api/hierarchy/section`
- `POST /account/:account/api/hierarchy/space` avec payload section legacy
- `POST /account/:account/api/hierarchy/folder`
- `POST /account/:account/api/hierarchy/entity`
- `POST /account/:account/api/hierarchy/hub`
- `POST /account/:account/api/hierarchy/link-cockpit`
- `POST /account/:account/api/hierarchy/move`
- `POST /account/:account/api/hierarchy/reorder`

Conversions rail/sidebar :

- Sidebar section -> rail Space :
  - `POST /account/:account/api/hierarchy/promote-section-to-space`
  - alias legacy : `/hierarchy/promote-space-to-environment`
- Sidebar folder -> rail Space :
  - `POST /account/:account/api/hierarchy/promote-folder-to-space`
  - alias legacy : `/hierarchy/promote-folder-to-environment`
- Rail Space -> sidebar :
  - `POST /account/:account/api/hierarchy/demote-space-to-hierarchy`
  - alias legacy : `/hierarchy/demote-environment-to-hierarchy`

## Regle fondamentale Alpine + Sortable

Alpine possede le DOM final. Sortable ne sert qu'a l'aperçu drag/drop.

Donc :

- Ne jamais laisser Sortable devenir la source de verite.
- Ne jamais lire l'ordre final depuis des index seuls si des IDs sont disponibles.
- Apres un drop, le backend et/ou le state Alpine doivent produire le rendu final.
- Les clones Sortable doivent etre retires ou ignores par Alpine.

Dans `nav-sidebar.ejs`, les listes sidebar sont des `x-for`. Le flow stable est :

1. Sortable affiche le ghost/preview.
2. On capture les IDs, types et parent cible.
3. On annule ou supprime les nodes Sortable temporaires.
4. On appelle le backend.
5. On recharge ou met a jour le state Alpine.
6. Alpine re-render.

## Railbarre -> Sidebar

### UX attendu

Quand l'utilisateur drag un Space depuis la railbarre vers la sidebar active :

- Drop a la racine du Space actif : le Space rail devient une Section.
- Drop dans une Section ou un Folder : le Space rail devient un Folder.
- Le Space source disparait de la railbarre.
- Les enfants contenus dans le Space source restent accessibles dans la nouvelle section/folder cible.

### Frontend

Rail item :

- Classe Sortable : `.env-rail-sortable-item`
- Data essentiels :
  - `data-env-id`
  - `data-id`
  - `data-type="rail-space"`
  - `data-source="env-rail"`

La railbarre utilise :

```js
group: { name: 'env-rail', pull: 'clone', put: ['hierarchy'], revertClone: true }
```

La sidebar accepte les clones via `onAdd`.

Le handler important est :

- `handleRailDropIntoHierarchy(evt, group)`

Il doit :

- supprimer le clone tout de suite ;
- resoudre le parent cible ;
- refuser de dropper le Space actif dans lui-meme ;
- appeler `/hierarchy/demote-space-to-hierarchy` ;
- dispatcher `environment-updated` avec `removedSpaceId` ;
- forcer `fetchHierarchy(true)`.

### Backend

Endpoint :

```http
POST /account/:account/api/hierarchy/demote-space-to-hierarchy
```

Payload typique :

```json
{
  "spaceId": "SOURCE_RAIL_SPACE_ID",
  "targetSpaceId": "ACTIVE_RAIL_SPACE_ID",
  "parentId": "TARGET_PARENT_ID",
  "parentType": "environment-root",
  "insertIndex": 4
}
```

Comportement :

- Si `parentType` est root (`environment-root` ou `space-root`) :
  - creer ou reutiliser une Section dans le Space rail cible.
- Si `parentType` est section/folder :
  - creer un Folder dans ce parent.
- Deplacer les folders/views directs du Space source dans la cible.
- Si le Space source contient une seule section du meme nom que le Space source :
  - reutiliser cette section originale au lieu de recreer une section vide.
  - C'est le cas important du round-trip : Section -> rail -> sidebar.
- Supprimer le Space rail source.
- Normaliser l'ordre des Spaces rail.

## Sidebar -> Railbarre

### UX attendu

Quand l'utilisateur drag une Section ou un Folder depuis la sidebar vers la railbarre :

- Section -> nouveau Space rail.
- Folder -> nouveau Space rail.
- Les enfants doivent rester visibles dans le nouveau Space rail.
- Aucun appel `/hierarchy/move` ne doit etre emis par la sidebar apres la promotion.

### Frontend

La railbarre accepte les drops sidebar avec `onAdd`.

Handlers :

- `promoteSpaceToEnvironment(spaceId)` pour une Section legacy `type: 'space'`.
- `promoteFolderToEnvironment(folderId)` pour `folder`, `environment`, `workstation`.

Regle critique :

- Les `onEnd` des Sortables sidebar doivent ignorer un drop dont `evt.to` est la railbarre.
- Sinon la sidebar appelle aussi `handleDrop()`, qui peut tenter un `/hierarchy/move` vers `null`.
- Ce double traitement orphelinait les sections et vidait le nouveau rail Space.

Le garde-fou frontend est :

```js
if (this.isDroppingIntoRail(evt)) return;
```

### Backend

Promotion Section -> Space :

```http
POST /account/:account/api/hierarchy/promote-section-to-space
```

Payload legacy :

```json
{ "spaceId": "SECTION_ID" }
```

Comportement attendu :

- Creer un nouveau rail Space (`Environment`) avec le nom/icon/couleur de la Section.
- Reattacher la Section originale a ce nouveau rail Space via `environmentId`.
- Ne pas modifier les folders/views enfants de la Section.
- Les enfants restent lies a la meme Section par `spaces: [sectionId]`, donc ils reapparaissent dans le nouveau rail Space.

Promotion Folder -> Space :

```http
POST /account/:account/api/hierarchy/promote-folder-to-space
```

Comportement :

- Creer un nouveau rail Space.
- Deplacer les enfants du folder directement dans le nouveau rail Space.
- Supprimer le folder source.

## Garde-fous backend

### Les sections ne doivent jamais devenir orphelines

Dans `/hierarchy/move`, une section (`space` ou `section`) doit toujours avoir :

- `newParentId` present ;
- `newParentType` root (`environment-root` ou `space-root`).

Si ce n'est pas le cas, l'API doit refuser.

Raison :

- Une section avec `environmentId` unset n'est plus visible dans aucun Space rail.
- Le symptome UI est un rail Space affiche `(0)` apres une promotion.

### Les drops dans le rail ne doivent pas faire reorder sidebar

Quand `evt.to` est `.env-rail-list`, le `onEnd` sidebar doit s'arreter.

Sinon le navigateur peut produire deux operations :

1. rail `onAdd` : promotion correcte ;
2. sidebar `onEnd` : move/reorder parasite.

## Gestion des clones Sortable dans la railbarre

Les clones Sortable des rail items peuvent contenir des directives Alpine issues du `x-for`, ce qui provoque :

```txt
Alpine Expression Error: env is not defined
```

Regles :

- Utiliser `onClone` pour marquer le clone :
  - `x-ignore`
  - `data-rail-clone="true"`
- Retirer les attributs Alpine du clone (`x-*`, `@*`, `:*`).
- Nettoyer les artefacts apres un drop clone :
  - `.sortable-drag`
  - `.sortable-fallback`
  - `[data-rail-clone="true"]`
  - rail items dont l'ID n'existe plus dans `this.environments`

Methodes frontend liees :

- `prepareRailClone(evt)`
- `cleanupRailCloneArtifacts(extraRemovedIds)`
- `handleEnvironmentUpdated(event)`
- `refreshEnvironments({ force: true })`

## Refresh et evenements UI

Apres une mutation rail/sidebar :

- Dispatcher `environment-updated`.
- Inclure si possible :
  - `force: true`
  - `removedSpaceId`
  - `targetSpaceId`
- Le rail doit supprimer localement l'item retire pour un feedback instantane.
- Puis il doit faire un refresh force pour reprendre la source de verite serveur.

Exemple :

```js
window.dispatchEvent(new CustomEvent('environment-updated', {
  detail: {
    force: true,
    removedSpaceId: data.removedSpaceId,
    targetSpaceId: data.targetSpaceId
  }
}));
```

## Verification navigateur recommandee

Toujours verifier ces flows avec Puppeteer ou un vrai navigateur apres une modification :

1. Creer une section temporaire dans `CRM`.
2. Creer un folder enfant dans cette section.
3. Drag section -> railbarre.
4. Verifier :
   - un nouveau rail Space existe ;
   - `GET /hierarchy/list?environmentId=<newRailId>` contient encore le folder enfant ;
   - aucun appel `/hierarchy/move` parasite n'a ete emis ;
   - pas d'erreur Alpine `env is not defined`.
5. Drag rail Space -> sidebar.
6. Verifier :
   - le rail Space source disparait du rail ;
   - la section originale ou equivalente est visible dans la sidebar ;
   - les enfants sont toujours presents ;
   - pas de rail item vide/fantome dans le DOM.
7. Nettoyer les donnees temporaires.

## Symptomes connus et cause probable

### Le rail Space affiche `(0)` apres une section -> rail

Cause probable :

- La sidebar a envoye un `/hierarchy/move` parasite apres la promotion.
- La Section originale a perdu son `environmentId`.

Correctif attendu :

- `isDroppingIntoRail(evt)` doit couper le `onEnd` sidebar.
- Le backend doit refuser une section avec `newParentId` vide.

### Le rail item reste jusqu'au refresh manuel

Cause probable :

- `refreshEnvironments()` a ete bloque par son cooldown.
- Ou un clone Sortable est reste dans le DOM.

Correctif attendu :

- `environment-updated` avec `force: true`.
- Suppression optimiste locale par `removedSpaceId`.
- `cleanupRailCloneArtifacts()`.

### Erreur `env is not defined`

Cause probable :

- Un clone Sortable a conserve des directives Alpine du template `x-for`.

Correctif attendu :

- `onClone` + `x-ignore` + suppression des attributs Alpine du clone.

### Retour rail -> sidebar recree une section vide

Cause probable :

- Le Space rail contient une Section originale, mais le backend recree une nouvelle Section au lieu de reutiliser l'ancienne.

Correctif attendu :

- Si le Space source contient une seule Section du meme nom, la reattacher au Space cible.

## Invariants a ne pas casser

- Un rail Space ne doit jamais etre droppe dans lui-meme.
- Une Section doit toujours avoir un `environmentId` valide.
- Une Section ne peut exister qu'au niveau racine d'un rail Space.
- Un Folder peut etre enfant d'une Section ou d'un Folder, dans la limite de profondeur backend.
- Alpine reste la source de verite DOM cote client.
- Sortable ne doit jamais laisser un clone Alpine vivant dans le DOM final.
- Les operations cross-container doivent utiliser des IDs, pas les index Sortable seuls.
