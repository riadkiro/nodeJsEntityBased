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

## Checklist avant d'implémenter du Drag & Drop

- [ ] Les items sont rendus avec `x-for` ? → Pattern revert-then-splice
- [ ] Drag entre containers différents ? → Lookup par ID, pas par index
- [ ] Drag depuis une sidebar/palette ? → Sortable `pull: 'clone'` + `onAdd`
- [ ] **Jamais** de `draggable="true"` + `@dragstart` HTML5 natif
- [ ] **Jamais** de `fallbackOnBody` ou `forceFallback` avec Alpine
- [ ] **Jamais** de `container.children` pour lire l'ordre DOM
- [ ] Drop indicator a `pointer-events: none` ?
- [ ] Les `data-*` attributs sont sur les items (pas des bindings Alpine dynamiques sur le clone) ?
