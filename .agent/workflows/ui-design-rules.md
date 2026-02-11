---
description: Strict UI design rules for all UI elements (dark/light mode, colors, consistency)
---

# UI Design Rules (STRICT)

## 1. Dark/Light Mode Support (NON-NEGOTIABLE)

Every UI element MUST support both dark and light modes using Tailwind CSS dark: variants.

### Pattern
```html
<!-- ✅ CORRECT -->
<button class="bg-white-light/40 text-dark hover:bg-white-light/90 dark:bg-dark/40 dark:text-white-light dark:hover:bg-dark/60">

<!-- ❌ WRONG - hardcoded dark colors only -->
<button style="background-color: #1b2e4b; color: rgba(255,255,255,0.5)">
```

### For custom CSS (non-Tailwind), use `.dark` parent selector:
```css
.my-element {
    background: #f4f4f4;
    color: #333;
}
.dark .my-element {
    background: #1b2e4b;
    color: rgba(255, 255, 255, 0.5);
}
```

### Color Reference
| Element          | Light Mode              | Dark Mode                |
|------------------|-------------------------|--------------------------|
| Background       | `#f4f4f4` or `white`    | `#1b2e4b`               |
| Text             | `#333` or `text-dark`   | `rgba(255,255,255,0.5)` |
| Border           | `border-gray-200`       | `border-[#1b2e4b]`      |
| Hover BG         | `hover:bg-gray-100`     | `dark:hover:bg-[#181F32]`|
| Panel BG         | `bg-white`              | `dark:bg-[#0e1726]`     |
| Primary          | `#22bce9`               | `#22bce9` (same)        |
| Primary hover    | `hover:text-primary`    | `dark:hover:text-primary`|

## 2. Expandable Pill Buttons
See `/expandable-button-style` workflow for the specific pill button pattern.
Must also follow dark/light rules above.

## 3. Consistency
- Use existing Tailwind utility classes from the project
- Match existing patterns in the codebase
- Never introduce new color variables without checking existing ones
- Icons: Solar Duotone family preferred
