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

---

## Mémo Défi Technique: Resize de Colonnes + Tableaux Paginés

### Contexte
Sur le document `Facture - Fourniture de matériaux de construction - Moulay Rachid.pdf`, réduire la première colonne au minimum (`48px`) faisait exploser la hauteur des lignes. Le tableau se découpait en plusieurs fragments/pages. Quand on essayait ensuite de remettre la colonne à sa taille d'origine, on voyait parfois:

- des pages vides créées après le tableau;
- du contenu qui semblait disparaître visuellement;
- des fragments de tableau qui ne remontaient pas alors qu'il y avait assez d'espace;
- le `tfoot`/totaux isolé sur une page;
- un état correct uniquement après reload, signe que le DOM visible et le state React n'étaient plus alignés.

### Cause Racine
L'éditeur utilise des `contenteditable` non contrôlés. Quand le nombre de pages change pendant un reflow, React peut réutiliser un DOM de page à un nouvel index si les clés sont trop stables (`key={pageIndex}`). Résultat: `pageRefs` et `docRef.current.pages` peuvent temporairement pointer vers des réalités différentes.

Le resize de table est aussi une opération structurelle, pas un simple `onInput`. Il modifie:

- le `colgroup` de tous les fragments;
- la hauteur réelle des lignes;
- le nombre de pages;
- la position des fragments et du footer.

Une passe d'underflow incrémentale ne suffit pas toujours après un resize extrême.

### Fix Appliqué
Commit de référence: `4e85765 Stabilize table resize repagination`.

Principes appliqués:

1. Sur `mouseup` du resize de colonne, envoyer un `inputType: 'tableResize'`.
2. Dans `handlePageInput`, traiter `tableResize` comme une opération structurelle et lancer `repackPagesFrom(0)`.
3. Recomposer le document depuis le début, puis repaginer proprement via `reflowAllPages`.
4. Utiliser une clé de page sensible au nombre de pages:

```jsx
key={`${doc.pages.length}-${pageIndex}-${page.mode || 'edition'}`}
```

Cela force le remount des surfaces `contenteditable` quand le nombre de pages change, donc le DOM visible reprend le state paginé correct.

5. Dans le compactage de tableaux:
   - supprimer les pages vides terminales créées par un split de tableau;
   - permettre au `tfoot` de remonter quand il tient dans le fragment précédent;
   - mettre `docRef.current = newDoc` immédiatement après un `setDoc` de table-underflow pour éviter que la boucle suivante lise un vieux document.

### Règle à Retenir
Un resize de colonne sur un tableau paginé doit être traité comme une repagination complète, pas comme une simple sauvegarde.

```jsx
// ✅ BON
onSave?.({ inputType: 'tableResize' })

// puis
if (inputType === 'tableResize' && repackPagesFrom(0)) {
    return
}
```

### Test Produit Obligatoire
Pour valider ce type de fix, faire le scénario complet dans le navigateur:

1. Ouvrir le snapshot du document généré.
2. Mesurer l'état initial: nombre de pages, nombre de lignes `tbody`, largeurs de colonnes.
3. Réduire la première colonne au minimum.
4. Attendre la stabilisation du reflow.
5. Vérifier:
   - aucune page vide;
   - toutes les lignes conservées;
   - le tableau peut se fragmenter sur plusieurs pages sans perdre de contenu.
6. Remettre la colonne à sa largeur initiale.
7. Vérifier:
   - retour au nombre de pages initial si le contenu tient;
   - largeurs restaurées;
   - toutes les lignes conservées;
   - aucun `tfoot` isolé inutilement;
   - aucun contenu visible perdu.

Résultat attendu du test de référence:

```text
before:   pages=2, rows=8, widths=[391,75,87,95]
shrunk:   pages=9, rows=8, widths=[48,418,87,95], emptyPages=0
restored: pages=2, rows=8, widths=[391,75,87,95], emptyPages=0
```
