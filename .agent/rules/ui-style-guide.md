# UI Style Guide - Minimaliste & Modern

## Principes Généraux
- **Minimalisme** : Icônes seules sans texte pour les actions secondaires
- **Popovers ancrés** : Toujours ancrer sous le bouton déclencheur (pas de modals centrés)
- **Animations subtiles** : `0.15s ease-out`, slide-down de 4px
- **Fermeture intuitive** : ESC + clic extérieur
- **Dark mode** : Toujours supporter via classes `dark:`

## Boutons Icônes
```css
/* Base */
p-2 rounded-lg border border-gray-200 dark:border-gray-700 
text-gray-500 transition-all

/* Hover */
hover:text-primary hover:border-primary/50

/* Actif (quand popover ouvert) */
border-primary bg-primary/10 text-primary
```

## Popovers Flottants
- Rendu via `createPortal(document.body)` pour éviter conflits z-index
- Background : `bg-white dark:bg-[#1b2e4b]`
- Border : `border border-gray-200 dark:border-gray-700`
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
border border-gray-200 dark:border-gray-700 
rounded-lg bg-white dark:bg-gray-800 
focus:outline-none focus:ring-1 focus:ring-primary/50
```

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
- Border default : `border-gray-200 dark:border-gray-800` ⚠️ **Toujours utiliser `dark:border-gray-800`** au lieu de `dark:border-gray-700` pour la cohérence
- Background dark panel : `#1b2e4b`

