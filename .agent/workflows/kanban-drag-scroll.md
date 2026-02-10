---
description: Kanban drag-to-scroll horizontal configuration backup
---

# Kanban Drag-to-Scroll Implementation

## Overview
This workflow documents the drag-to-scroll functionality for horizontal scrolling in the Kanban board using left-click drag.

## Key Behavior
- **Left-click + drag** on empty space = horizontal scroll
- **Card drag (DnD)** = scroll is disabled, only auto-scroll at screen edges via DnD kit
- Cards, buttons, links, and other interactive elements are excluded from triggering scroll

## Implementation (KanbanBoard.jsx)

### 1. Refs needed
```jsx
const scrollContainerRef = useRef(null)

// Drag-to-scroll state
const isDraggingToScroll = useRef(false)
const startX = useRef(0)
const scrollLeft = useRef(0)
```

### 2. Handlers
```jsx
// Drag-to-scroll handlers
const handleMouseDown = useCallback((e) => {
    // Don't scroll when dragging a card
    if (activeId) return
    // Only left click and not on interactive elements
    if (e.button !== 0) return
    const target = e.target
    if (target.closest('button, a, input, [data-draggable], [draggable="true"], .kanban-card')) return

    const container = scrollContainerRef.current
    if (!container) return

    isDraggingToScroll.current = true
    startX.current = e.pageX - container.offsetLeft
    scrollLeft.current = container.scrollLeft
    container.style.cursor = 'grabbing'
}, [activeId])

const handleMouseMove = useCallback((e) => {
    // Stop scroll if a card drag started
    if (activeId) {
        isDraggingToScroll.current = false
        return
    }
    if (!isDraggingToScroll.current) return
    e.preventDefault()

    const container = scrollContainerRef.current
    if (!container) return

    const x = e.pageX - container.offsetLeft
    const walk = (x - startX.current) * 1.5 // Multiplier for scroll speed
    container.scrollLeft = scrollLeft.current - walk
}, [activeId])

const handleMouseUp = useCallback(() => {
    isDraggingToScroll.current = false
    const container = scrollContainerRef.current
    if (container) container.style.cursor = 'grab'
}, [])

const handleMouseLeave = useCallback(() => {
    isDraggingToScroll.current = false
    const container = scrollContainerRef.current
    if (container) container.style.cursor = 'grab'
}, [])
```

### 3. Container JSX
```jsx
<div
    ref={scrollContainerRef}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseLeave}
    style={{
        height: '100%',
        width: '100%',
        minWidth: 0,
        overflowX: 'auto',
        overflowY: 'auto',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none'
    }}
>
```

## Critical Points
1. **activeId dependency**: `handleMouseDown` and `handleMouseMove` must have `[activeId]` in their useCallback deps
2. **Stop scroll on card drag**: When `activeId` is set (card being dragged), immediately disable `isDraggingToScroll`
3. **Cursor feedback**: Switch between `grab` and `grabbing` for visual feedback
4. **.kanban-card selector**: Exclude cards from triggering scroll to avoid conflicts with DnD kit

---

## Status Badge Styling Rule

The status/classification badge in column headers must always use:
```jsx
className="inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide"
```

**Critical**: Always use `px-2 py-0` padding for these badges, NOT `px-2.5 py-1`.

---

## Dark Mode Styling Rules

### Container/Card Styling
```jsx
// Light mode: bg-white-light/40 with border
// Dark mode: bg-dark/40 WITHOUT border
className="bg-white-light/40 hover:bg-white-light/90 border border-gray-100 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60"
```

### Text Colors
| Element Type | Light Mode | Dark Mode |
|--------------|------------|-----------|
| Title/Primary | `text-gray-800` | `dark:text-white-dark` |
| Description | `text-gray-500` | `dark:text-white-dark/70` |
| Secondary/Meta | `text-gray-400` | `dark:text-white-dark/50` |
| Placeholder/Italic | `text-gray-400` | `dark:text-white-dark/50` |

### Background for Badges/Tags
```jsx
// Light mode
className="bg-gray-100 text-gray-500"
// Dark mode
className="dark:bg-dark/60 dark:text-white-dark/70"
```

### Borders
- **Light mode**: `border border-gray-100`
- **Dark mode**: `dark:border-0` (no border) OR `dark:border-gray-800/30` (very subtle)

### Key Principles
1. **Never use pure white text** in dark mode → use `text-white-dark` instead
2. **Remove borders** in dark mode with `dark:border-0`
3. **Use opacity variants** for hierarchy: `/70` for secondary, `/50` for tertiary
4. **Use `bg-dark/40`** for card backgrounds (semi-transparent)
