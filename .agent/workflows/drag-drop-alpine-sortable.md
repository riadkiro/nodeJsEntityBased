---
description: Drag & Drop rules for Alpine.js + SortableJS (form builder, cockpit, etc.)
---

# Drag & Drop : Alpine.js + SortableJS — Règles Complètes

## Règle #1 : Qui gère le DOM ?

> **Alpine gère le DOM final. Sortable gère UNIQUEMENT le ghost/preview.**
> Après chaque opération Sortable, on ANNULE son move DOM puis on modifie les données Alpine.
> Alpine re-render ensuite le DOM correctement via `x-for`.

---

## Pattern "Revert-then-Splice" (OBLIGATOIRE pour x-for)

Quand Alpine utilise `x-for` pour rendre les items, Sortable et Alpine se battent pour le DOM.
La seule solution stable :

```javascript
Sortable.create(container, {
  group: { name: 'my-group', pull: true, put: true },
  animation: 150,
  draggable: '.my-item',
  swapThreshold: 0.65,

  onEnd(evt) {
    // 1. Capturer les refs
    const fieldId = evt.item.dataset.fieldId;
    const fromRowId = evt.from.dataset.rowId;
    const toRowId = evt.to.dataset.rowId;

    // 2. Trouver le field PAR ID (jamais par index !)
    const fieldIndex = fromCol.fields.findIndex(f => f.id === fieldId);
    const [moved] = fromCol.fields.splice(fieldIndex, 1);

    // 3. ANNULER le move DOM de Sortable
    if (evt.from !== evt.to) {
      evt.item.remove();
      evt.from.appendChild(evt.item);
    } else {
      const items = Array.from(evt.from.querySelectorAll('.my-item'));
      const ref = items[evt.oldIndex] || null;
      if (ref) evt.from.insertBefore(evt.item, ref);
    }

    // 4. Insérer dans la cible → Alpine re-render
    toCol.fields.splice(evt.newIndex, 0, moved);
  }
});
```

### Pourquoi `findIndex` par ID et pas `evt.oldIndex` ?
Quand Sortable déplace un DOM node cross-container, `evt.oldIndex` peut être faux
car le DOM a déjà été modifié. L'ID est la seule référence fiable.

---

## Pattern Sidebar → Canvas : Sortable Clone (pas HTML5 natif !)

### ❌ INTERDIT : HTML5 natif `draggable="true"` + `@dragstart/@dragover/@drop`
Cause des **vibrations visuelles** (ghost qui alterne drop/interdit en boucle)
car les enfants du drop zone interceptent `dragenter/dragleave`.

### ✅ OBLIGATOIRE : Sortable avec `pull: 'clone'`

**Sidebar :**
```html
<div class="grid grid-cols-2 gap-2"
     x-init="Sortable.create($el, {
       group: { name: 'my-group', pull: 'clone', put: false },
       animation: 150,
       sort: false,
       draggable: '.sidebar-item'
     })">
  <template x-for="item in items">
    <div class="sidebar-item"
         data-field-type="custom"
         :data-field-id="item._id"
         :data-field-label="item.label">
      ...
    </div>
  </template>
</div>
```

**Canvas (onAdd) :**
```javascript
Sortable.create(canvasColumn, {
  group: { name: 'my-group', pull: true, put: true },
  draggable: '.my-item',

  onAdd(evt) {
    // Lire les data-* du clone
    const type = evt.item.dataset.fieldType;
    const fieldId = evt.item.dataset.fieldId;
    const label = evt.item.dataset.fieldLabel;
    const insertIdx = evt.newIndex;

    // TOUJOURS supprimer le clone — Alpine gère le DOM
    evt.item.remove();

    if (!type || !fieldId) return;

    // Créer le field dans les données Alpine
    col.fields.splice(insertIdx, 0, { id: genId(), type, fieldId, label });
  },

  onEnd(evt) { /* revert-then-splice pattern */ }
});
```

### Pourquoi ça marche sans vibrations ?
- Sortable gère tout le drag en interne (pas d'événements HTML5 natifs qui bubblent)
- Le clone a des `data-*` statiques qui survivent au clonage
- `onAdd` est appelé 1 seule fois, pas de cycle enter/leave

---

## Pièges à éviter

### 1. `fallbackOnBody: true` → ❌ INTERDIT avec Alpine x-for
Sortable clone l'élément au `<body>` → sort du scope `x-data` Alpine →
**erreur : `field is not defined`**, `builderState is not defined`, etc.

### 2. `forceFallback: true` → ❌ INTERDIT avec Alpine x-for
Même problème que `fallbackOnBody` — le clone perd le scope Alpine.

### 3. `container.children` → ❌ INTERDIT pour lire l'ordre
`container.children` inclut les `<template>` d'Alpine x-for !
Utiliser `.querySelectorAll('.my-item')` à la place.

### 4. `pointer-events: none` sur tous les enfants → ❌ DANGEREUX
```css
/* ❌ Casse les toolbars, boutons, et interactions */
.drop-zone.drag-over * {
  pointer-events: none;
}
```
Utiliser `pointer-events: none` UNIQUEMENT sur l'indicateur de drop :
```css
/* ✅ Seulement sur l'indicateur */
.drop-indicator {
  pointer-events: none;
}
```

### 5. Index-based splice pour cross-container → ❌ FRAGILE
```javascript
// ❌ evt.oldIndex peut être faux après un move cross-container
fromCol.fields.splice(evt.oldIndex, 1);

// ✅ Toujours chercher par ID
const idx = fromCol.fields.findIndex(f => f.id === fieldId);
fromCol.fields.splice(idx, 1);
```

### 6. Ne pas annuler le move DOM → ❌ Double rendu
Si on ne revert pas le move Sortable, Alpine re-render via x-for ET le DOM
contient déjà l'élément déplacé → doublons ou disparitions.

### 7. HTML5 `@dragover/@dragleave` sur des zones avec enfants → ❌ Vibrations
Les enfants (labels, inputs, icons) interceptent les événements drag →
`dragleave` fire quand le curseur passe d'un enfant à un autre →
le ghost alterne entre "autorisé" et "interdit" en boucle.

---

## Indicateur visuel de drop (optionnel)

Pour montrer où un élément sera inséré, créer un indicateur DOM temporaire :

```css
.drop-indicator {
  height: 20px;
  background: rgba(67, 97, 238, 0.12);
  border: 2px dashed var(--primary, #4361ee);
  border-radius: 6px;
  margin: 4px 0;
  pointer-events: none; /* CRITIQUE — évite les vibrations */
}
```

Avec le pattern Sortable clone, cet indicateur n'est plus nécessaire car
Sortable affiche nativement un ghost avec animation qui indique la position.

---

## Options Sortable safe avec Alpine x-for

| Option | Safe ? | Raison |
|--------|--------|--------|
| `animation: 150` | ✅ | Visuel seulement |
| `ghostClass` | ✅ | Classe CSS sur le ghost |
| `dragClass` | ✅ | Classe CSS pendant le drag |
| `swapThreshold: 0.65` | ✅ | Ajuste la sensibilité |
| `group: { pull: 'clone' }` | ✅ | Clone au lieu de move (sidebar) |
| `sort: false` | ✅ | Empêche le reorder dans la sidebar |
| `fallbackOnBody: true` | ❌ | Casse le scope Alpine |
| `forceFallback: true` | ❌ | Casse le scope Alpine |
| `handle: '.handle'` | ✅ | Zone de grab |

---

## Règle #8 : Sortable ne gère que les ENFANTS DIRECTS (CRITICAL)

> **Sortable.js ne voit que les enfants directs du container.**
> Si les `.panel-sortable-item` sont imbriqués dans un wrapper intermédiaire,
> ils ne seront PAS draggables même si l'option `draggable` matche leur classe.

### ❌ ERREUR TYPIQUE : Enfants trop profonds

```html
<!-- Sortable init sur #sortable-container -->
<div id="sortable-container">
  <div class="wrapper">                    <!-- ← wrapper intermédiaire -->
    <div class="sortable-item">Panel A</div>  <!-- ❌ PAS un enfant direct ! -->
    <div class="sortable-item">Panel B</div>  <!-- ❌ PAS un enfant direct ! -->
  </div>
</div>
```

### ✅ SOLUTION 1 : Sortable sur le container direct

```html
<div id="sortable-container">
  <div class="wrapper" id="inner-sortable">   <!-- ← Sortable init ICI -->
    <div class="sortable-item">Panel A</div>  <!-- ✅ enfant direct -->
    <div class="sortable-item">Panel B</div>  <!-- ✅ enfant direct -->
  </div>
</div>
```

### ✅ SOLUTION 2 : Containers imbriqués = Sortables imbriqués

Quand un container extérieur gère le déplacement de blocs entre zones (main ↔ sidebar)
et un container intérieur gère le réordonnement des panels à l'intérieur d'un bloc :

```javascript
// Sortable extérieur : déplace le bloc "sidebar" entre zones
sidebarSortable = new Sortable(document.getElementById('sidebar-outer'), opts);

// Sortable intérieur : réordonne les panels DANS le sidebar
sidebarInnerSortable = new Sortable(document.getElementById('sidebar-inner'), opts);
```

**⚠️ NE PAS OUBLIER de destroy les deux dans `destroyPanelSortables()` !**

### Vérification obligatoire

Avant d'initialiser un Sortable, TOUJOURS vérifier :
```javascript
const container = document.getElementById('my-sortable');
const directChildren = container.querySelectorAll(':scope > .sortable-item');
console.log('Direct children:', directChildren.length); // Doit être > 0 !
```

---

## Règle #9 : Alpine Expression Errors cassent TOUT (CRITICAL)

> **Une erreur de syntaxe dans UN SEUL attribut Alpine peut casser
> l'initialisation de TOUS les composants Alpine sur la page.**
> Cela inclut les watchers qui initialisent Sortable !

### ❌ INTERDIT : Commentaires JS dans les expressions Alpine

```html
<!-- ❌ CRASH — Alpine parse le commentaire comme expression JS invalide -->
<select @change="/* just a comment */">

<!-- ❌ CRASH — Accolades seules -->
<div x-data="{ }">  <!-- OK, mais attention aux templates EJS qui injectent du contenu -->
```

### ✅ Correct

```html
<!-- ✅ Si on n'a rien à faire, ne pas mettre de handler -->
<select x-model="myValue">

<!-- ✅ Ou utiliser une expression valide -->
<select @change="null">
<select @change="void 0">
```

### Impact cascade

Une erreur Alpine sur un composant enfant (ex: `linesPanel`) peut empêcher
l'initialisation du composant parent (ex: `panelLayout`) et donc casser :
- Les watchers `designMode` qui initialisent Sortable
- Le drag & drop des panels
- La sauvegarde du layout

**→ TOUJOURS vérifier la console pour les "Alpine Expression Error" quand le D&D ne marche pas.**

---

## Règle #10 : `:scope >` pour collecter l'ordre des panels

> Quand on sauvegarde l'ordre des panels après un drag & drop,
> utiliser `:scope > .panel-sortable-item` pour ne sélectionner que les **enfants directs**.

```javascript
// ❌ MAUVAIS — sélectionne aussi les panels imbriqués dans d'autres panels
const panels = container.querySelectorAll('.panel-sortable-item');

// ✅ BON — enfants directs uniquement
const panels = container.querySelectorAll(':scope > .panel-sortable-item');
```

---

## Checklist avant d'implémenter du Drag & Drop

- [ ] Les items sont rendus avec `x-for` ? → Pattern revert-then-splice
- [ ] Drag entre containers différents ? → Lookup par ID, pas par index
- [ ] Drag depuis une sidebar/palette ? → Sortable `pull: 'clone'` + `onAdd`
- [ ] **Les items draggables sont des ENFANTS DIRECTS du container Sortable ?** (Règle #8)
- [ ] **Aucune erreur Alpine dans la console ?** (Règle #9)
- [ ] **Containers imbriqués = Sortables séparés ?** (Règle #8)
- [ ] **`:scope >` utilisé pour lire l'ordre DOM ?** (Règle #10)
- [ ] **Jamais** de `draggable="true"` + `@dragstart` HTML5 natif
- [ ] **Jamais** de `fallbackOnBody` ou `forceFallback` avec Alpine
- [ ] **Jamais** de `container.children` pour lire l'ordre DOM
- [ ] Drop indicator a `pointer-events: none` ?
- [ ] Les `data-*` attributs sont sur les items (pas des bindings Alpine dynamiques sur le clone) ?
- [ ] **Jamais** de commentaires JS (`/* */`, `//`) dans les expressions Alpine (`@change`, `x-data`, etc.)

---

# Rapport Dexapp Sidebar — Alpine + SortableJS

## Contexte

La sidebar Dexapp rend l'arbre de navigation avec Alpine (`x-for`) et utilise
SortableJS uniquement pour l'interaction de drag & drop. Le composant principal
est `views/nav/nav-sidebar.ejs`, avec persistence serveur via
`controllers/hierarchy.controller.js`.

Le mécanisme doit se comporter comme ClickUp : fluide, sans doublons visuels,
sans disparition temporaire, avec des dossiers qui restent fermés sauf action
explicite de l'utilisateur.

## Invariants produit de la sidebar

- **Section racine uniquement** : une section ne peut pas être créée ou déposée
  dans une autre section ou dans un dossier.
- Les types de section sont actuellement :
  - `space` pour les vraies sections racine créées par la modale de section.
  - `environment` pour l'ancien type de section stocké dans `Folder`.
- Les dossiers sont limités à **3 niveaux visuels** :
  - niveau 1 : dossier à la racine de l'espace actif ;
  - niveau 2 : dossier dans un dossier niveau 1 ;
  - niveau 3 : dossier dans un dossier niveau 2.
- Un dossier niveau 3 peut recevoir des éléments non-conteneurs comme
  `entity` / collection, `hub`, cockpit, document, etc.
- Un dossier niveau 3 ne peut pas recevoir de `folder`, `environment`,
  `workstation` ou `space`.
- Déplacer un dossier déjà rempli doit tenir compte de toute la profondeur de
  son sous-arbre. Exemple : un dossier qui contient déjà un sous-dossier ne peut
  pas être déplacé dans un niveau 2 si cela crée un niveau 4.
- Les règles UI doivent être doublées côté API. Ne jamais se contenter de cacher
  une option dans le menu.

## Architecture stable retenue

### 1. Sortable ne possède jamais le DOM final

La sidebar suit strictement le pattern :

1. Sortable affiche le ghost et le preview.
2. Au `onEnd`, on résout le parent cible par ID.
3. On annule le déplacement DOM effectué par Sortable.
4. On modifie `this.hierarchy` côté Alpine.
5. Alpine reconstruit le DOM final.
6. On envoie `move` puis `reorder` au serveur.

Fonctions clés :

- `handleDrop(evt, group)`
- `revertSortableDomMove(evt)`
- `optimisticallyMoveHierarchyItem(...)`
- `applyOptimisticHierarchyMove(moveResult)`
- `syncHierarchyAfterDrop(...)`

### 2. Re-render forcé après déplacement optimiste

Un bug critique observé : après un drop dans un dossier vide, l'état Alpine était
correct, l'API répondait succès, mais le DOM gardait l'ancien placeholder
`Ajouter` jusqu'au refresh.

Correction retenue :

- Maintenir `hierarchyRenderKey`.
- Utiliser `:key="getHierarchyRenderKey(item)"` sur tous les `x-for`.
- Incrémenter `hierarchyRenderKey` après `fetchHierarchy(true)` et après
  `applyOptimisticHierarchyMove`.
- Normaliser les IDs avec `getHierarchyItemId(item)` car certains objets peuvent
  avoir `_id` au lieu de `id`.

Sans cette clé de rendu, Alpine peut réutiliser un scope imbriqué périmé après
un move cross-container.

### 3. Les listes Sortable doivent avoir un parent explicite

Chaque liste imbriquée doit porter :

```html
data-parent-id="..."
data-parent-type="..."
```

Les drops vides passent par `.add-placeholder[data-parent-id][data-parent-type]`.
Cela permet de résoudre proprement le parent cible même si le dossier est vide.

### 4. `onMove` sert à refuser les moves impossibles

`onMove` doit appeler une fonction centrale, par exemple :

```javascript
onMove: (evt) => this.canAcceptSortableMove(evt)
```

Cette fonction doit refuser immédiatement :

- une section déposée ailleurs qu'à la racine ;
- un dossier qui créerait un niveau 4 ;
- un dossier contenant déjà un sous-arbre trop profond pour le parent cible.

Mais le `onEnd` doit refaire la même validation. `onMove` améliore l'UX, mais
ne suffit pas comme garde logique.

### 5. Le serveur garde les mêmes invariants

Les endpoints sensibles doivent refuser les états invalides :

- `POST /api/hierarchy/folder`
- `POST /api/hierarchy/move`

Pour les dossiers, le serveur calcule :

- la profondeur du parent cible ;
- la profondeur maximale du sous-arbre déplacé ;
- la validité du type `environment` uniquement à la racine.

Les collections/hubs restent autorisés au niveau 3 car ils ne sont pas des
conteneurs de dossiers.

## Règles de drop précises

### Drop d'un item dans un dossier ouvert

Le dossier doit être ouvert explicitement par l'utilisateur. Ne pas ouvrir un
dossier fermé au simple survol. Le survol créait trop de cas étranges : plusieurs
dossiers restaient ouverts après un drag abandonné.

### Drop sur un dossier fermé

Un drop sur la ligne d'un dossier fermé doit être interprété comme un reorder
avant/après, pas comme "mettre dedans".

### Drop dans un dossier vide

Le placeholder `Ajouter` doit rester une cible de drop. Après dépôt réussi,
le placeholder disparaît automatiquement si la liste contient un vrai enfant.
S'il redevient vide, le placeholder réapparaît.

### Reorder vers le haut et vers le bas

Ne jamais se fier à `evt.oldIndex` / `evt.newIndex` seuls pour muter les données.
Les index DOM peuvent être faux après preview Sortable. Toujours résoudre par ID,
puis calculer l'index final via les siblings Alpine.

## Signaux de bug déjà rencontrés

- Un élément apparaît deux fois jusqu'au refresh : Sortable a gardé un DOM node
  pendant qu'Alpine rendait le même item.
- Un élément disparaît jusqu'au refresh : Alpine a gardé un scope imbriqué périmé
  ou l'item n'avait pas de `id` normalisé.
- Drop sauvegardé côté serveur mais invisible localement : problème de rendu
  Alpine, pas de persistence.
- Reorder vers le haut aléatoire : index DOM utilisés à la place des IDs.
- Drop dans un dossier vide impossible : placeholder absent de Sortable ou sans
  `data-parent-id`.
- Erreur `lastElementChild` dans Sortable : container détruit par Alpine pendant
  le cleanup dragover. Éviter les refetch immédiats après drop et protéger
  `_onDragOver`.

## Checklist navigateur obligatoire

À refaire après chaque changement de drag/drop sidebar :

- Créer un arbre temporaire `Root > Niv 2 > Niv 3`.
- Vérifier que le menu de `Niv 3` affiche collection/hub/document mais pas
  dossier/section.
- Tenter de créer un dossier niveau 4 via API : doit répondre `400`.
- Tenter de déposer un dossier dans `Niv 3` : il doit rester à sa place.
- Déposer une collection dans `Niv 3` : elle doit apparaître sans refresh.
- Déposer un dossier dans `Niv 2` : doit rester autorisé.
- Reorder un item vers le haut puis vers le bas au même niveau.
- Déplacer un item hors d'un dossier vers la racine et vérifier l'absence de
  doublon immédiat.
- Attendre la synchro puis vérifier que le DOM reste identique.
- Faire un `fetchHierarchy(true)` ou refresh serveur et vérifier la persistence.
- Capturer des screenshots avant/après.
- Vérifier la console : aucune erreur Alpine, aucune erreur Sortable, aucun
  `Sync failed`.

## Règle de commit pour cette zone

Quand une modification touche la sidebar DnD, inclure dans le résumé :

- fichiers modifiés ;
- invariants produit impactés ;
- scénarios navigateur testés ;
- si les endpoints API ont aussi été protégés.
