---
description: Expandable pill button style rules (+ button pattern)
---

# Expandable Pill Button Style Rules

All expandable pill buttons (e.g., the "+" / "Ajouter" button) MUST follow these color rules:

## Default State (repos)
- **Background**: `#1b2e4b` (same dark neutral as sidebar config icons)
- **Text/Icon color**: `rgba(255, 255, 255, 0.5)` (muted white)
- **Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **No box-shadow**

## Hover State
- **Background**: `#22bce9` (primary color)
- **Text/Icon color**: `#fff` (full white)
- **Box-shadow**: `0 4px 12px rgba(34, 188, 233, 0.4)` (primary glow)
- **Border**: `transparent`
- **Transform**: `translateY(-1px)` (subtle lift)

## Animation
- Transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Label expand via `max-width` from 0 to needed width + `opacity` from 0 to 1

## CSS Reference
```css
.btn-add-expandable {
    display: inline-flex;
    align-items: center;
    gap: 0;
    height: 34px;
    padding: 0 10px;
    border-radius: 9999px;
    background-color: #1b2e4b;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
}
.btn-add-expandable:hover {
    gap: 6px;
    padding: 0 16px;
    background-color: #22bce9;
    color: #fff;
    box-shadow: 0 4px 12px rgba(34, 188, 233, 0.4);
    transform: translateY(-1px);
    border-color: transparent;
}
.btn-add-label {
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}
.btn-add-expandable:hover .btn-add-label {
    max-width: 80px;
    opacity: 1;
}
```
