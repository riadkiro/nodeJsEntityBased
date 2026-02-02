---
trigger: always_on
---

# React Implementation Rules

## Architecture
- React grid : JSON API + virtualization
- HTMX grid : HTML partials + swaps
- Jamais de mélange HTMX/React sur le même container DOM

## Stale Closure Prevention (CRITICAL)

### Le Problème
Quand on appelle une fonction dans un handler après un `setState`, le state utilisé par la fonction est **l'ancienne valeur** (stale closure).

```jsx
// ❌ MAUVAIS - fetchRecords() utilise l'ancien preferences.sort
const handleChange = (value) => {
    setPreferences({ ...preferences, sort: value })
    fetchRecords()  // ← STALE! preferences.sort n'est pas encore mis à jour
}
```

### Solutions

#### 1. useEffect pour réagir aux changements (PRÉFÉRÉ)
```jsx
// ✅ BON - L'effet se déclenche APRÈS que le state soit mis à jour
useEffect(() => {
    if (data.length > 0) {
        fetchData()
    }
}, [preferences.sort.field, preferences.sort.direction])

const handleChange = (value) => {
    setPreferences({ ...preferences, sort: value })
    // fetchData sera appelé par l'useEffect avec les bonnes valeurs
}
```

#### 2. Passer la nouvelle valeur directement
```jsx
// ✅ BON - Passer la valeur en paramètre
const fetchRecords = useCallback(async (sortOverride) => {
    const sort = sortOverride || preferences.sort
    // ...
}, [preferences.sort])

const handleChange = (value) => {
    setPreferences({ ...preferences, sort: value })
    fetchRecords(value)  // ← Passe directement la nouvelle valeur
}
```

#### 3. Tri/Filtrage côté client avec useMemo
```jsx
// ✅ BON - useMemo recalcule automatiquement quand les deps changent
const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
        // tri basé sur preferences.sort
    })
}, [records, preferences.sort.field, preferences.sort.direction])
```

### Règle d'Or
> Si une action dépend d'un state qui vient juste d'être modifié, utiliser `useEffect` pour déclencher l'action OU passer la nouvelle valeur directement en paramètre.

## Performance Rules
- Préférer le tri/filtrage côté client quand toutes les données sont déjà chargées
- Utiliser `useMemo` pour les calculs dérivés (sorted, filtered records)
- Utiliser `useCallback` pour les handlers passés en props

## Drag & Drop avec React (CRITICAL)

### Le Problème d'Index avec les Listes Filtrées
Quand on implémente du drag & drop sur une **liste filtrée** (ex: `visibleColumns`) mais qu'on modifie la **liste complète** (ex: `columns`), les index ne correspondent pas !

```jsx
// ❌ MAUVAIS - Index de la liste filtrée appliqué à la liste complète
const visibleColumns = columns.filter(c => c.visible)  // [A, C, E] (index 0, 1, 2)
const allColumns = columns  // [A, B, C, D, E] (index 0, 1, 2, 3, 4)

// Si on drag C (index 1 dans visible) vers E (index 2 dans visible)
// On applique splice(1, 2) sur allColumns → déplace B au lieu de C !
onColumnReorder(fromIndex, toIndex)  // ← ERREUR D'INDEX
```

### Solution : Toujours utiliser les IDs, jamais les index

```jsx
// ✅ BON - Dans le composant enfant (RecordsTable)
onDrop={(e) => {
    // Passer les IDs, pas les index
    onColumnReorder(draggedColumnId, targetColumnId)
}}

// ✅ BON - Dans le parent (RecordsGrid)
const handleColumnReorder = useCallback((fromId, toId) => {
    setColumns(prev => {
        // Trouver les index dans la liste COMPLÈTE via les IDs
        const fromIndex = prev.findIndex(c => c.id === fromId)
        const toIndex = prev.findIndex(c => c.id === toId)
        
        if (fromIndex === -1 || toIndex === -1) return prev
        
        const newColumns = [...prev]
        const [moved] = newColumns.splice(fromIndex, 1)
        newColumns.splice(toIndex, 0, moved)
        return newColumns
    })
}, [])
```

### Règle d'Or Drag & Drop
> Toujours passer des **identifiants uniques** (IDs) entre composants pour le drag & drop, jamais des index. Le parent qui gère le state complet doit résoudre les index lui-même.

### Autres règles drag & drop
- **pointer-events: none** sur les conteneurs internes pour éviter les conflits d'événements
- **pointer-events: auto** sur les éléments cliquables à l'intérieur (liens, boutons)
- **onDragEnter** est plus fiable que onDragOver pour détecter l'entrée
- **stopPropagation()** sur onDrop pour éviter les conflits avec les parents

## Uncontrolled Contenteditable (CRITICAL)

### Le Pattern
Les `contenteditable` dans ce projet sont **UNCONTROLLED** :
- Le contenu initial est défini une seule fois via `dangerouslySetInnerHTML` ou `ref.current.innerHTML`
- React ne re-rend PAS le contenu quand le state change (pour préserver le curseur et la sélection)
- Le DOM est la source de vérité, le state est une synchronisation

### Le Piège de l'Injection
```jsx
// ❌ MAUVAIS - setDoc ne met pas à jour le DOM d'un contenteditable uncontrolled
setDoc(prev => {
    const pages = [...prev.pages]
    pages[1].content = newContent  // ← State mis à jour
    return { ...prev, pages }
})
// Le DOM de la page 1 n'est PAS modifié ! L'utilisateur ne voit rien.
```

### Solution : DOM-First, puis Sync State
```jsx
// ✅ BON - D'abord modifier le DOM, puis synchroniser le state
// 1) Injection directe dans le DOM
const nextPageRef = pageRefs.current[pageIndex + 1]
if (nextPageRef) {
    nextPageRef.innerHTML = overflowContent + nextPageRef.innerHTML
}

// 2) Synchroniser le state depuis le DOM
setDoc(prev => {
    const pages = [...prev.pages]
    pages[pageIndex + 1] = { 
        ...pages[pageIndex + 1], 
        content: nextPageRef.innerHTML  // ← Lire depuis DOM
    }
    return { ...prev, pages }
})
```

### Règle d'Or Contenteditable
> Pour modifier le contenu visible d'un contenteditable uncontrolled:
> 1. **D'abord** modifier le DOM directement (`element.innerHTML`, `insertNode`, etc.)
> 2. **Ensuite** synchroniser le state en LISANT le DOM (`content: element.innerHTML`)
> 
> **JAMAIS** l'inverse (state → DOM), car React ne re-rend pas les contenteditables.

### Cas d'usage
- **Overflow/Underflow pagination** : Déplacer des nodes entre pages
- **Merge de pages** (Backspace) : Fusionner le contenu DOM avant de supprimer la page
- **Paste** : Insérer via `document.execCommand('insertHTML')` puis sync state
- **Formatage** : `document.execCommand('bold')` etc. puis sync state

## DOM Element Timing (CRITICAL)

### Le Problème
Quand on veut utiliser la **position** d'un élément DOM (pour scroll, mesure, etc.), il faut le faire **AVANT** de supprimer l'élément.

```jsx
// ❌ MAUVAIS - L'élément est supprimé avant de lire sa position
marker.remove()
const rect = selection.getRangeAt(0).getBoundingClientRect()
window.scrollTo(rect.top)  // ← rect.top = 0 ! L'élément n'existe plus
```

### Solution : Lire/Agir AVANT de supprimer
```jsx
// ✅ BON - Scroll vers le marker AVANT de le supprimer
marker.scrollIntoView({ block: 'center', behavior: 'instant' })
marker.remove()
```

### Règle d'Or DOM Timing
> Si tu as besoin d'**utiliser** un élément DOM (sa position, sa taille, son contenu), fais-le **AVANT** toute modification destructive (remove, innerHTML = '', etc.).

### Cas d'usage
- **Caret marker** : Scroll vers le marker avant de le supprimer
- **Mesure de hauteur** : Lire `scrollHeight` avant de modifier le contenu
- **Position pour drag & drop** : Capturer `getBoundingClientRect()` avant manipulation
- **Animation de sortie** : Capturer position initiale avant de changer les classes