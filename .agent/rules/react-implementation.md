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