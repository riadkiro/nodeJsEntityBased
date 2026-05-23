# UI Style Guide - Minimaliste & Modern

## Principes Généraux
- **Minimalisme** : Icônes seules sans texte pour les actions secondaires
- **Popovers ancrés** : Toujours ancrer sous le bouton déclencheur (pas de modals centrés)
- **Animations subtiles** : `0.15s ease-out`, slide-down de 4px
- **Fermeture intuitive** : ESC + clic extérieur
- **Dark mode** : Toujours supporter via classes `dark:`
- **Validation Chrome obligatoire** : AprÃ¨s chaque changement visuel, ouvrir la page concernÃ©e dans Chrome/Puppeteer et confirmer le rendu par inspection/screenshot avant de considÃ©rer la tÃ¢che terminÃ©e.

## ⚠️ RÈGLES DARK MODE STRICTES (NE JAMAIS DÉROGER)

### Borders en Dark Mode
**TOUJOURS** utiliser `dark:border-gray-800` — **JAMAIS** `dark:border-gray-800`
```css
/* ✅ CORRECT */
border border-gray-200 dark:border-gray-800

/* ❌ INCORRECT - NE JAMAIS UTILISER */
border border-gray-200 dark:border-gray-800
```

### Textes en Dark Mode
**TOUJOURS** utiliser `dark:text-gray-300` pour le texte principal — **JAMAIS** `dark:text-gray-100` ou `dark:text-gray-200`
```css
/* ✅ CORRECT */
text-gray-700 dark:text-gray-300
text-gray-600 dark:text-gray-300

/* ❌ INCORRECT - NE JAMAIS UTILISER */
text-gray-700 dark:text-gray-100
text-gray-700 dark:text-gray-200
```

### Exceptions autorisées
- `dark:text-white` : Pour les titres principaux (h1, h2)
- `dark:text-gray-400` / `dark:text-gray-500` : Pour les textes secondaires, labels, placeholders

---

## Boutons Icônes
```css
/* Base */
p-2 rounded-lg border border-gray-200 dark:border-gray-800 
text-gray-500 transition-all

/* Hover */
hover:text-primary hover:border-primary/50

/* Actif (quand popover ouvert) */
border-primary bg-primary/10 text-primary
```

## Popovers Flottants
- Rendu via `createPortal(document.body)` pour éviter conflits z-index
- Background : `bg-white dark:bg-[#1b2e4b]`
- Border : `border border-gray-200 dark:border-gray-800`
- Shadow : `shadow-xl`
- Rounded : `rounded-xl`
- Padding : `p-4`
- z-index : `9999` (panel), `9998` (backdrop invisible)
- Fermeture : ESC + clic extérieur

## Boutons de Sélection (Density, PageSize, Tabs)
```css
/* Layout */
flex gap-1 avec flex-1 sur chaque bouton

/* Actif */
bg-primary text-white

/* Inactif */
bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300

/* Size */
text-xs px-2 py-1.5 rounded-lg transition-all
```

## Labels de Section
```css
text-xs font-medium text-gray-500 dark:text-gray-400 mb-2
```

## Checkboxes List
```css
/* Row hover */
hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg cursor-pointer

/* Checkbox */
form-checkbox text-primary w-3.5 h-3.5 rounded

/* Label */
text-xs text-gray-700 dark:text-gray-300
```

## Input de Recherche dans Popover
```css
w-full px-3 py-1.5 text-xs 
border border-gray-200 dark:border-gray-800 
rounded-lg bg-white dark:bg-gray-800 
focus:outline-none focus:ring-1 focus:ring-primary/50
```
- Ne pas confondre bordure de focus et sÃ©parateur : conserver le focus bleu existant sauf demande explicite, et retirer seulement les dividers/bordures de ligne parasites.

## Animation Popover
```css
@keyframes popoverSlide {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}
/* Usage: animation: popoverSlide 0.15s ease-out */
```

## Toolbar Minimaliste
- Alignement à droite : `justify-end`
- Gap entre éléments : `gap-2`
- Recherche largeur fixe : `w-64`

## Couleurs Primaires
- Primary : `#4361ee` (utilisé via classe `primary`)
- Text gray subtle : `text-gray-500`
- Border default : `border-gray-200 dark:border-gray-800`
- Background dark panel : `#1b2e4b`

## Modals Records / Design Premium
- S'aligner sur le style de `views/record/record-module.ejs` : panneaux blancs, bordures `#e8ecf1`, radius 14-18px, ombres douces, espacements denses et titres courts.
- Les modals de creation/configuration doivent utiliser un header compact avec tuile d'icone 44-56px, un body organise en panneaux lisibles, et un footer sobre separe par une bordure fine.
- Eviter les grands blocs plats, les radius excessifs, les cartes imbriquees inutiles et les gradients tres visibles. Le rendu attendu est CRM premium, discret, scannable.
- Pour les controles dynamiques dans Alpine `x-if`, ne pas inserer un React island non remonte. Utiliser un controle Alpine natif ou remonter explicitement l'island.
- Les selecteurs d'icones doivent afficher une preview, une recherche, un choix de librairie, une grille cliquable, et un champ texte fallback pour une icone personnalisable.
- Les propositions IA doivent toujours avoir un fallback deterministe, un etat loading, des lignes modifiables/supprimables, et la possibilite d'ajouter un champ manuel.
- Quand un filtre cible un champ existant, les valeurs proposees doivent venir des vraies options configurees ou des valeurs distinctes deja presentes dans les records.


