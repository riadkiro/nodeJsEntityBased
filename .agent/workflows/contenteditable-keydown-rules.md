---
description: Contenteditable keydown handler rules to avoid Enter key and selection bugs
---

# Contenteditable Keydown & Click Handler Rules

## ⚠️ CRITICAL: `div[style]` Selector Matches the Contenteditable Itself

When using CSS selectors like `blockquote, pre, div[style], table` to detect "block elements" inside a contenteditable, **the contenteditable container itself is a `<div>` with inline `style` attributes** (padding, maxHeight, overflow, etc.).

This means `node.closest('div[style]')` will match the contenteditable **itself**, not just child blocks.

### The Bug This Causes

```jsx
// ❌ DANGEROUS — block can be the contenteditable container itself!
const ESCAPE_BLOCKS = 'blockquote, pre, div[style], table'
const block = node.closest(ESCAPE_BLOCKS)
if (!block || !el.contains(block)) return  // el.contains(el) === TRUE!

// If cursor is at end of text and user presses Enter:
// remainingText.trim() === '' → e.preventDefault() → BLOCKS native Enter!
// block.after(p) → creates <p> OUTSIDE the contenteditable!
// Cursor ends up outside the editor → user can't type anymore
```

### The Fix — Always Exclude the Container

```jsx
// ✅ CORRECT — Exclude the contenteditable container from block matching
const block = node.closest(ESCAPE_BLOCKS)
if (!block || !el.contains(block)) return

// CRITICAL GUARD: The contenteditable div itself has inline styles,
// so div[style] matches it. We must NOT treat it as a block to escape.
if (block === el) return
```

### Alternative Guard (used in DocumentEditorIsland.jsx)

```jsx
// ✅ ALSO CORRECT — Check that the block is a DIRECT child of the container
if (block && block.parentElement === el) {
    // This naturally excludes the case where block === el,
    // because el.parentElement !== el
    // ...
}
```

## Rule: Never `preventDefault()` on Enter Without Verifying the Target

Before calling `e.preventDefault()` on an Enter keypress inside a contenteditable:

1. ✅ Verify the matched "block" is NOT the contenteditable container itself
2. ✅ Verify the block is a DIRECT child or contained within the container
3. ✅ Verify any new elements (paragraphs) are inserted INSIDE the contenteditable, not after it

## Rule: Click Handlers Must Not Interfere with Text Selection

When adding click handlers on contenteditable containers:

1. ✅ Check if selection is collapsed before processing: `if (sel && !sel.isCollapsed) return`
2. ✅ Track mousedown position to distinguish clicks from drag-selections
3. ✅ Never call `e.preventDefault()` when user is selecting text

```jsx
// ✅ CORRECT — Guards for click handler on contenteditable
let mouseDownTarget = null
let mouseDownPos = { x: 0, y: 0 }

const handleMouseDown = (e) => {
    mouseDownTarget = e.target
    mouseDownPos = { x: e.clientX, y: e.clientY }
}

const handleClick = (e) => {
    // GUARD 1: Don't interfere with text selection
    const sel = window.getSelection()
    if (sel && !sel.isCollapsed) return

    // GUARD 2: Skip drag operations (mouse moved > 5px)
    if (mouseDownTarget !== e.target) return
    const dx = Math.abs(e.clientX - mouseDownPos.x)
    const dy = Math.abs(e.clientY - mouseDownPos.y)
    if (dx > 5 || dy > 5) return

    // ... proceed with click handling
}
```

## Rule: reflowDocument Should Not Run on Every Keystroke

The caret marker system (inserting a `<span data-reflow-caret>` into the DOM) is designed for page overflow scenarios. Running it on every `onInput` event corrupts the cursor position after normal Enter presses.

```jsx
// ✅ CORRECT — Check overflow FIRST, skip marker system if no overflow
const hasOverflow = pages.some(el => doesContentOverflow(el))
if (!hasOverflow) {
    // Just do underflow check and return — don't touch the cursor
    return
}
// Only engage caret marker + full reflow if there IS overflow
```

## Summary of Bugs Fixed (Feb 2026)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Enter key → cursor stuck, can't type | `div[style]` matched contenteditable itself → `e.preventDefault()` + `block.after(p)` created `<p>` outside editor | Added `if (block === el) return` guard |
| Text selection creates empty lines | Click handler fired on mouseup after drag-select, creating new `<p>` elements | Added selection + drag guards |
| Cursor corrupted after Enter on 1-page doc | `reflowDocument` injected caret marker on every input, even without overflow | Added `doesContentOverflow` check before marker insertion |
