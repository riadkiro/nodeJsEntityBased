# React Pagination & DOM Measurement Rules

## CRITICAL: Stale State in requestAnimationFrame Callbacks

### Le Problème
Quand on utilise `doc` capturé dans un RAF callback, le state est **obsolète** car `setDoc` est asynchrone.

```jsx
// ❌ MAUVAIS - doc est stale (obsolète)
requestAnimationFrame(() => {
    checkUnderflow(element, pageIndex, doc, setDoc, pageRefs) // doc = ancien snapshot!
})

const handleChange = () => {
    setDoc(newDoc)
    doSomethingWith(doc)  // ❌ doc = ancienne valeur
}
```

### Solution : Utiliser docRef.current
```jsx
// ✅ BON - docRef.current est toujours à jour
const docRef = useRef(doc)
useEffect(() => { docRef.current = doc }, [doc])

requestAnimationFrame(() => {
    checkUnderflow(element, pageIndex, docRef.current, setDoc, pageRefs)
})
```

---

## CRITICAL: Mesure de l'espace disponible (Underflow)

### Le Problème
`clientHeight - scrollHeight` est **TOUJOURS 0** quand le contenu fit dans le container !

```javascript
// ❌ MAUVAIS - toujours 0 quand pas d'overflow
const availableSpace = element.clientHeight - element.scrollHeight // = 0

// scrollHeight >= clientHeight TOUJOURS
// Quand contenu fit: scrollHeight === clientHeight → availableSpace = 0
```

### Solution : Mesure Range-based (Word-like)
```javascript
// ✅ BON - Mesure réelle via Range.getClientRects()
function getAvailableSpacePx(pageEl) {
    const pageRect = pageEl.getBoundingClientRect()
    const { pb } = getVerticalPaddings(pageEl)
    
    const range = document.createRange()
    range.selectNodeContents(pageEl)
    const rects = range.getClientRects()
    
    // Trouve le bas du dernier rect rendu
    let maxBottom = 0
    for (const r of rects) {
        if (r.bottom > maxBottom) maxBottom = r.bottom
    }
    
    return (pageRect.bottom - pb) - maxBottom
}
```

---

## CRITICAL: onInput vs onKeyDown pour les mesures DOM

### Le Problème
`onKeyDown` se déclenche **AVANT** que le DOM change → mesures incorrectes.

```jsx
// ❌ MAUVAIS - DOM pas encore modifié
onKeyDown={() => {
    // scrollHeight = valeur AVANT suppression du caractère
    checkUnderflow(element) 
}}
```

### Solution : Utiliser onInput
```jsx
// ✅ BON - DOM déjà modifié
onInput={() => {
    reflowDocument() // mesures correctes
}}
```

---

## CRITICAL: Préserver les spans/styles dans le split de texte

### Le Problème
`first.textContent = remaining` détruit toute la structure (spans, styles).

```javascript
// ❌ MAUVAIS - perd les spans
first.textContent = remaining // <p><span style="...">text</span></p> → <p>text</p>
```

### Solution : TreeWalker pour trouver le text node
```javascript
// ✅ BON - préserve la structure
function findFirstTextNode(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
    return walker.nextNode()
}

// Clone le node complet, modifie le text node interne
const commitClone = first.cloneNode(true)
const textNode = findFirstTextNode(commitClone)
textNode.textContent = words.slice(0, best).join(' ')
```

---

## Pattern: Reflow Orchestrator (Word-like)

```javascript
const reflowDocument = useCallback(() => {
    requestAnimationFrame(() => {
        // 1) Overflow pass - push content forward
        for (let i = 0; i < docRef.current.pages.length; i++) {
            checkOverflow(pageRefs.current[i], i, docRef.current, setDoc, pageRefs)
        }

        // 2) Underflow pass - pull content back (après 1 frame)
        requestAnimationFrame(() => {
            for (let i = 0; i < docRef.current.pages.length - 1; i++) {
                checkUnderflow(pageRefs.current[i], i, docRef.current, setDoc, pageRefs)
            }
        })
    })
}, [])
```

---

## Règles Clés à Retenir

| Situation | ❌ Éviter | ✅ Utiliser |
|-----------|----------|------------|
| State dans RAF | `doc` capturé | `docRef.current` |
| Mesure espace | `clientHeight - scrollHeight` | `getAvailableSpacePx()` (Range) |
| Trigger après edit | `onKeyDown` | `onInput` |
| Split texte avec styles | `element.textContent = x` | `TreeWalker` + text node |
| Récursion RAF | Appel direct avec state | Orchestrateur central |
