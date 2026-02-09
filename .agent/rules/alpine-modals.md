# Alpine.js Modal & Overlay Rules

## ❌ NEVER use `x-teleport` + `x-show` for modals
Alpine's `x-teleport` breaks reactivity on the teleported element after the first hide/show cycle.
`x-show` stops updating the DOM even though the state changes correctly.

## ❌ NEVER use `<template x-if>` for modals
`x-if` destroys and recreates the DOM every toggle, which:
- Kills all `$refs` references (they become `undefined`)
- Loses internal component state
- Breaks focus management

## ✅ ALWAYS use `x-ref` + direct DOM manipulation for modals

### Pattern
```html
<!-- Modal: hidden by default, controlled via JS -->
<div x-ref="modalOverlay" style="display: none;"
     class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40"
     @click.self="closeModal()">
    <div class="bg-white rounded-xl shadow-2xl" @click.stop>
        <!-- modal content, x-ref works normally here -->
        <input x-ref="modalSearchInput" ... />
    </div>
</div>
```

```javascript
openModal() {
    this.showModal = true; // keep state for logic
    const overlay = this.$refs.modalOverlay;
    if (overlay) overlay.style.display = 'flex';
    setTimeout(() => {
        const input = this.$refs.modalSearchInput;
        if (input) input.focus();
    }, 50);
},

closeModal() {
    this.showModal = false;
    const overlay = this.$refs.modalOverlay;
    if (overlay) overlay.style.display = 'none';
},
```

### Why this works
- DOM is **never destroyed** → `$refs` always valid
- No Alpine reactivity dependency → **no broken bindings**
- `style.display` is pure JS → **100% reliable** across all cycles
- `x-model`, `x-for`, `x-text` etc. inside the modal still work normally (Alpine tracks those independently)

## Summary Table

| Approach | Show/Hide | Refs | Reactivity | Verdict |
|---|---|---|---|---|
| `x-if` | ❌ Destroys DOM | ❌ Lost | ✅ Works | **NEVER** |
| `x-teleport` + `x-show` | ❌ Breaks after 1st cycle | ❌ Disconnected | ❌ Broken | **NEVER** |
| `x-show` (no teleport) | ⚠️ Usually works | ✅ Kept | ⚠️ Can break | **Avoid for modals** |
| `x-ref` + JS `style.display` | ✅ Always works | ✅ Always valid | ✅ N/A | **ALWAYS USE** |
