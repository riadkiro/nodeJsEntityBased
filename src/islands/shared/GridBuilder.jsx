/**
 * GridBuilder — Reusable Row/Column Grid Layout System
 * 
 * A unified component for building grid layouts with:
 * - 12-column grid system (same as page builder & cockpit builder)
 * - Interactive column resize handles (drag to resize, shrink last column creates new one)
 * - Row toolbar with layout presets (1,2,3,4 columns), add column, equal height toggle
 * - Row actions: move up/down, duplicate, delete
 * - Column drop zones for drag & drop content (sidebar → canvas via HTML5 native)
 * - @dnd-kit block reordering (within column + cross-column) with touch support
 * - Hover-only borders on columns and elements
 * - Hover controls (move, delete) on elements — both in top-right corner
 * 
 * IMPORTANT: Two drag systems coexist here:
 *   1) HTML5 native drag → for sidebar DraggableBlock → column drops (external content)
 *   2) @dnd-kit → for block reordering within/across columns (internal moves)
 * They MUST NOT conflict. HTML5 drop handlers only activate for external drags.
 * 
 * Used by: Document Editor (layout mode), Page Builder, Cockpit Builder
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCenter,
    pointerWithin,
    MouseSensor,
    TouchSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ========== UTILITY: Generate unique IDs ==========
let _gridIdCounter = 0
const uid = (prefix = 'grid') => `${prefix}_${Date.now()}_${++_gridIdCounter}`

// ========== UTILITY: Detect ancestor CSS scale transform ==========
// When the GridBuilder lives inside a container with transform: scale(N),
// @dnd-kit's DragOverlay (position:fixed) gets its position offset.
// This utility walks up the DOM tree to find the cumulative scale factor.
function getAncestorScale(element) {
    let scale = 1
    let el = element?.parentElement
    while (el) {
        const transform = window.getComputedStyle(el).transform
        if (transform && transform !== 'none') {
            // Parse matrix(a, b, c, d, tx, ty) — 'a' is scaleX
            const match = transform.match(/^matrix\(([^,]+)/)
            if (match) {
                const s = parseFloat(match[1])
                if (s && s !== 1) scale *= s
            }
        }
        el = el.parentElement
    }
    return scale
}

// ========== CONSTANTS ==========
const GRID_COLS = 12
const MIN_COL_WIDTH = 1

// ========== SORTABLE BLOCK WRAPPER ==========
// The drag handle is placed in the top-right corner (next to delete button in EditorPage)
// The handle uses @dnd-kit's listeners for internal reordering only.
function SortableBlock({ blockId, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: blockId })

    const style = {
        // Use Translate (not Transform) to avoid injecting scaleX/scaleY from useSortable
        // which conflicts with ancestor CSS scale transforms
        transform: CSS.Translate.toString(transform),
        transition,
        // When dragging, hide the original completely — only the DragOverlay ghost is visible
        opacity: isDragging ? 0 : 1,
        position: 'relative',
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-block-id={blockId}
            className="sortable-block"
        >
            {/* Drag handle — top-right, visible on hover, positioned next to delete */}
            <div
                {...attributes}
                {...listeners}
                style={{
                    position: 'absolute',
                    right: '22px',
                    top: '-10px',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    opacity: 0,
                    transition: 'opacity 0.15s',
                    zIndex: 25,
                    borderRadius: '6px',
                    touchAction: 'none',
                    backgroundColor: '#fff',
                    border: '1px solid rgba(156,163,175,0.3)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                }}
                className="block-drag-handle"
                title="Déplacer"
            >
                <iconify-icon icon="solar:hamburger-menu-bold" width="12" style={{ color: '#9ca3af' }}></iconify-icon>
            </div>
            {children}
        </div>
    )
}

// ========== MAIN COMPONENT ==========
export default function GridBuilder({
    rows = [],
    onRowsChange,
    renderBlock,
    renderDragOverlay,
    onDropInColumn,
    emptyColumnContent,
    readOnly = false,
    className = '',
    gap = 2, // gap in tailwind units (gap-2 = 8px)
    panelMode = false,
}) {
    const [activeBlockId, setActiveBlockId] = useState(null)
    const gridBuilderRef = useRef(null)

    // Track whether @dnd-kit is currently handling a drag
    // This is used to prevent HTML5 native drag handlers from interfering
    const isDndKitDraggingRef = useRef(false)

    // Sensors for dnd-kit (same config as Kanban)
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 10 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Build a flat map of blockId → { rowIndex, colIndex, blockIndex }
    const blockLocationMap = useMemo(() => {
        const map = {}
        rows.forEach((row, ri) => {
            row.columns?.forEach((col, ci) => {
                col.blocks?.forEach((block, bi) => {
                    if (block.id) {
                        map[block.id] = { rowIndex: ri, colIndex: ci, blockIndex: bi }
                    }
                })
            })
        })
        return map
    }, [rows])

    // All column ids (used for collision detection)
    const allColumnIds = useMemo(() => {
        const ids = new Set()
        rows.forEach(row => {
            row.columns?.forEach(col => {
                if (col.id) ids.add(col.id)
            })
        })
        return ids
    }, [rows])

    // Block IDs by column (for SortableContext)
    const blockIdsByColumn = useMemo(() => {
        const map = {}
        rows.forEach(row => {
            row.columns?.forEach(col => {
                map[col.id] = (col.blocks || []).map(b => b.id).filter(Boolean)
            })
        })
        return map
    }, [rows])

    // Find which column contains a block
    const findColumnOfBlock = useCallback((blockId) => {
        for (const row of rows) {
            for (const col of row.columns || []) {
                if (col.blocks?.some(b => b.id === blockId)) {
                    return col.id
                }
            }
        }
        return null
    }, [rows])

    // Custom collision detection (similar to Kanban)
    const collisionDetection = useCallback((args) => {
        const activeId = args.active?.id ? String(args.active.id) : null
        const pointerCollisions = pointerWithin(args)

        if (pointerCollisions.length > 0) {
            const filtered = pointerCollisions.filter(c => String(c.id) !== activeId)
            // Prefer block hits over column hits
            const blockHits = filtered.filter(c => !allColumnIds.has(String(c.id)))
            const columnHits = filtered.filter(c => allColumnIds.has(String(c.id)))
            if (blockHits.length > 0) return blockHits
            if (columnHits.length > 0) return columnHits
            if (filtered.length === 0) return pointerCollisions
            return filtered
        }
        const fallback = closestCenter(args).filter(c => String(c.id) !== activeId)
        return fallback.length > 0 ? fallback : closestCenter(args)
    }, [allColumnIds])

    // Ref to always have fresh rows (avoids stale closures)
    const rowsRef = useRef(rows)
    useEffect(() => { rowsRef.current = rows }, [rows])

    // Track active block's column synchronously
    const activeColRef = useRef(null)

    const handleDragStart = useCallback((event) => {
        const id = String(event.active.id)
        setActiveBlockId(id)
        activeColRef.current = findColumnOfBlock(id)
        isDndKitDraggingRef.current = true
    }, [findColumnOfBlock])

    const handleDragCancel = useCallback(() => {
        setActiveBlockId(null)
        activeColRef.current = null
        isDndKitDraggingRef.current = false
    }, [])

    const handleDragOver = useCallback((event) => {
        const { active, over } = event
        if (!over || !active) return

        const activeId = String(active.id)
        const overId = String(over.id)
        const fromColId = activeColRef.current
        if (!fromColId) return

        // Determine destination column
        let toColId
        if (allColumnIds.has(overId)) {
            toColId = overId
        } else {
            toColId = findColumnOfBlock(overId)
        }
        if (!toColId || fromColId === toColId) return

        // Cross-column move: move block from one column to another
        activeColRef.current = toColId

        const currentRows = rowsRef.current
        const newRows = JSON.parse(JSON.stringify(currentRows))

        // Find and remove block from source
        let movedBlock = null
        for (const row of newRows) {
            for (const col of row.columns || []) {
                if (col.id === fromColId) {
                    const idx = col.blocks.findIndex(b => b.id === activeId)
                    if (idx !== -1) {
                        movedBlock = col.blocks.splice(idx, 1)[0]
                    }
                }
            }
        }
        if (!movedBlock) return

        // Insert into destination
        for (const row of newRows) {
            for (const col of row.columns || []) {
                if (col.id === toColId) {
                    if (allColumnIds.has(overId)) {
                        // Dropped on column → append
                        col.blocks.push(movedBlock)
                    } else {
                        // Dropped on another block → insert before/after
                        const overIdx = col.blocks.findIndex(b => b.id === overId)
                        if (overIdx >= 0) {
                            col.blocks.splice(overIdx, 0, movedBlock)
                        } else {
                            col.blocks.push(movedBlock)
                        }
                    }
                }
            }
        }

        onRowsChange(newRows)
    }, [allColumnIds, findColumnOfBlock, onRowsChange])

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event
        const currentCol = activeColRef.current
        setActiveBlockId(null)
        activeColRef.current = null
        isDndKitDraggingRef.current = false

        if (!over || !active || !currentCol) return

        const activeId = String(active.id)
        const overId = String(over.id)

        // Same-column reorder
        if (!allColumnIds.has(overId)) {
            const overCol = findColumnOfBlock(overId)
            if (overCol === currentCol) {
                const currentRows = rowsRef.current
                // Find the column
                for (const row of currentRows) {
                    for (const col of row.columns || []) {
                        if (col.id === currentCol) {
                            const ids = col.blocks.map(b => b.id)
                            const oldIndex = ids.indexOf(activeId)
                            const newIndex = ids.indexOf(overId)
                            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                                const newRows = JSON.parse(JSON.stringify(currentRows))
                                for (const r of newRows) {
                                    for (const c of r.columns || []) {
                                        if (c.id === currentCol) {
                                            c.blocks = arrayMove(c.blocks, oldIndex, newIndex)
                                        }
                                    }
                                }
                                onRowsChange(newRows)
                            }
                        }
                    }
                }
            }
        }
    }, [allColumnIds, findColumnOfBlock, onRowsChange])

    // Find the active block for DragOverlay
    const activeBlock = useMemo(() => {
        if (!activeBlockId) return null
        for (const row of rows) {
            for (const col of row.columns || []) {
                const found = col.blocks?.find(b => b.id === activeBlockId)
                if (found) return found
            }
        }
        return null
    }, [activeBlockId, rows])

    // ===== ROW OPERATIONS =====
    const addRow = useCallback(() => {
        const newRow = {
            id: uid('row'),
            equalHeight: true,
            columns: [{ id: uid('col'), width: GRID_COLS, blocks: [] }]
        }
        onRowsChange([...rows, newRow])
    }, [rows, onRowsChange])

    const deleteRow = useCallback((rowId) => {
        onRowsChange(rows.filter(r => r.id !== rowId))
    }, [rows, onRowsChange])

    const duplicateRow = useCallback((rowId) => {
        const index = rows.findIndex(r => r.id === rowId)
        if (index === -1) return
        const clone = JSON.parse(JSON.stringify(rows[index]))
        clone.id = uid('row')
        clone.columns.forEach(c => { c.id = uid('col') })
        const next = [...rows]
        next.splice(index + 1, 0, clone)
        onRowsChange(next)
    }, [rows, onRowsChange])

    const moveRow = useCallback((rowId, direction) => {
        const index = rows.findIndex(r => r.id === rowId)
        if (index === -1) return
        const target = direction === 'up' ? index - 1 : index + 1
        if (target < 0 || target >= rows.length) return
        const next = [...rows]
        const [moved] = next.splice(index, 1)
        next.splice(target, 0, moved)
        onRowsChange(next)
    }, [rows, onRowsChange])

    // ===== COLUMN LAYOUT =====
    const setRowLayout = useCallback((rowId, numColumns) => {
        onRowsChange(rows.map(row => {
            if (row.id !== rowId) return row
            const colWidth = Math.floor(GRID_COLS / numColumns)
            const remainder = GRID_COLS % numColumns
            // Preserve existing blocks
            const existingBlocks = row.columns.flatMap(c => c.blocks || [])
            const newColumns = Array.from({ length: numColumns }, (_, i) => ({
                id: uid('col'),
                width: colWidth + (i < remainder ? 1 : 0),
                blocks: existingBlocks[i] ? [existingBlocks[i]] : []
            }))
            return { ...row, columns: newColumns }
        }))
    }, [rows, onRowsChange])

    const addColumnToRow = useCallback((rowId) => {
        onRowsChange(rows.map(row => {
            if (row.id !== rowId) return row
            const totalWidth = row.columns.reduce((s, c) => s + c.width, 0)
            if (totalWidth >= GRID_COLS) return row
            return {
                ...row,
                columns: [...row.columns, { id: uid('col'), width: 1, blocks: [] }]
            }
        }))
    }, [rows, onRowsChange])

    const deleteColumn = useCallback((rowId, colIndex) => {
        onRowsChange(rows.map(row => {
            if (row.id !== rowId) return row
            if (row.columns.length <= 1) return row
            const deletedWidth = row.columns[colIndex].width
            const remaining = row.columns.filter((_, i) => i !== colIndex)
            const extra = Math.floor(deletedWidth / remaining.length)
            let rem = deletedWidth % remaining.length
            return {
                ...row,
                columns: remaining.map((c, i) => ({
                    ...c,
                    width: c.width + extra + (i < rem ? 1 : 0)
                }))
            }
        }))
    }, [rows, onRowsChange])

    const toggleEqualHeight = useCallback((rowId) => {
        onRowsChange(rows.map(row =>
            row.id === rowId ? { ...row, equalHeight: !row.equalHeight } : row
        ))
    }, [rows, onRowsChange])

    // ===== COLUMN RESIZE =====
    const [resizePreview, setResizePreview] = useState(null)

    const startResize = useCallback((rowId, colIndex, event, gridElement) => {
        if (readOnly) return
        event.preventDefault()

        const isTouch = event.type === 'touchstart'
        const currentRows = rowsRef.current
        const row = currentRows.find(r => r.id === rowId)
        if (!row) return

        const isLastCol = colIndex === row.columns.length - 1
        const gridWidth = gridElement?.offsetWidth || 800
        const colUnitWidth = gridWidth / GRID_COLS
        const startX = isTouch ? event.touches[0].clientX : event.clientX
        const originalWidth = row.columns[colIndex].width
        const rightWidth = isLastCol ? 0 : row.columns[colIndex + 1].width
        const totalPair = originalWidth + rightWidth

        let lastDelta = 0

        const doResize = (e) => {
            if (isTouch && e.cancelable) e.preventDefault()
            const clientX = isTouch ? e.touches[0].clientX : e.clientX
            const deltaX = clientX - startX
            const deltaUnits = Math.round(deltaX / colUnitWidth)
            if (deltaUnits === lastDelta) return
            lastDelta = deltaUnits

            if (isLastCol) {
                let newLeft = originalWidth + deltaUnits
                if (newLeft < MIN_COL_WIDTH) newLeft = MIN_COL_WIDTH
                if (newLeft >= originalWidth) {
                    setResizePreview(null)
                    return
                }
                const newRight = originalWidth - newLeft
                setResizePreview({ rowId, colIndex, leftWidth: newLeft, rightWidth: newRight, isNew: true })
            } else {
                let newLeft = originalWidth + deltaUnits
                let newRight = rightWidth - deltaUnits

                if (newLeft < MIN_COL_WIDTH) {
                    newLeft = MIN_COL_WIDTH
                    newRight = totalPair - MIN_COL_WIDTH
                }
                if (newRight < MIN_COL_WIDTH) {
                    newRight = MIN_COL_WIDTH
                    newLeft = totalPair - MIN_COL_WIDTH
                }

                setResizePreview({ rowId, colIndex, leftWidth: newLeft, rightWidth: newRight, isNew: false })
            }
        }

        const endResize = () => {
            document.removeEventListener('mousemove', doResize)
            document.removeEventListener('mouseup', endResize)
            document.removeEventListener('touchmove', doResize)
            document.removeEventListener('touchend', endResize)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''

            setResizePreview(null)

            const latestRows = rowsRef.current
            const latestRow = latestRows.find(r => r.id === rowId)
            if (!latestRow || lastDelta === 0) return

            if (isLastCol) {
                let newLeft = originalWidth + lastDelta
                if (newLeft < MIN_COL_WIDTH) newLeft = MIN_COL_WIDTH
                if (newLeft >= originalWidth) return

                const newRight = originalWidth - newLeft
                if (newRight < MIN_COL_WIDTH) return

                const updated = latestRows.map(r => {
                    if (r.id !== rowId) return r
                    const cols = r.columns.map((c, i) =>
                        i === colIndex ? { ...c, width: newLeft } : c
                    )
                    cols.push({ id: uid('col'), width: newRight, blocks: [] })
                    return { ...r, columns: cols }
                })
                onRowsChange(updated)
            } else {
                let newLeft = originalWidth + lastDelta
                let newRight = rightWidth - lastDelta

                if (newLeft < MIN_COL_WIDTH) {
                    newLeft = MIN_COL_WIDTH
                    newRight = totalPair - MIN_COL_WIDTH
                }
                if (newRight < MIN_COL_WIDTH) {
                    newRight = MIN_COL_WIDTH
                    newLeft = totalPair - MIN_COL_WIDTH
                }

                const updated = latestRows.map(r => {
                    if (r.id !== rowId) return r
                    return {
                        ...r,
                        columns: r.columns.map((c, i) => ({
                            ...c,
                            width: i === colIndex ? newLeft : (i === colIndex + 1 ? newRight : c.width)
                        }))
                    }
                })
                onRowsChange(updated)
            }
        }

        document.addEventListener('mousemove', doResize)
        document.addEventListener('mouseup', endResize)
        document.addEventListener('touchmove', doResize, { passive: false })
        document.addEventListener('touchend', endResize)
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }, [readOnly, onRowsChange])

    // ===== ZOOM-AWARE MODIFIER for DragOverlay =====
    // When GridBuilder is inside a scaled container (e.g. CanvasContainer with zoom),
    // the DragOverlay position is offset. This modifier compensates for the scale.
    const zoomModifier = useCallback(({ transform: t }) => {
        const scale = getAncestorScale(gridBuilderRef.current)
        if (scale === 1) return t
        // The DragOverlay's position is calculated in viewport coords,
        // but the ancestor scale makes the visual position off by (1 - 1/scale).
        // We need to adjust by dividing by the scale factor.
        return {
            ...t,
            x: t.x / scale,
            y: t.y / scale,
        }
    }, [])

    // ===== RENDER =====
    return (
        <DndContext
            sensors={readOnly ? undefined : sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div ref={gridBuilderRef} className={`grid-builder ${className}`}>
                {/* Inject hover styles for drag handle visibility */}
                <style>{`
                    .sortable-block:hover > .block-drag-handle {
                        opacity: 1 !important;
                    }
                    .sortable-block:hover > .block-drag-handle:hover {
                        background: rgba(0,0,0,0.05);
                    }
                    .sortable-block:hover > .block-drag-handle:active {
                        cursor: grabbing;
                    }
                `}</style>

                {/* Rows */}
                <div className="space-y-1">
                    {rows.map((row, rowIndex) => (
                        <GridRow
                            key={row.id}
                            row={row}
                            rowIndex={rowIndex}
                            readOnly={readOnly}
                            gap={gap}
                            panelMode={panelMode}
                            // Row actions
                            onDelete={() => deleteRow(row.id)}
                            onDuplicate={() => duplicateRow(row.id)}
                            onMoveUp={() => moveRow(row.id, 'up')}
                            onMoveDown={() => moveRow(row.id, 'down')}
                            onSetLayout={(n) => setRowLayout(row.id, n)}
                            onAddColumn={() => addColumnToRow(row.id)}
                            onDeleteColumn={(ci) => deleteColumn(row.id, ci)}
                            onToggleEqualHeight={() => toggleEqualHeight(row.id)}
                            onStartResize={(ci, e, gridEl) => startResize(row.id, ci, e, gridEl)}
                            // Content
                            renderBlock={renderBlock}
                            onDropInColumn={onDropInColumn}
                            emptyColumnContent={emptyColumnContent}
                            isFirst={rowIndex === 0}
                            isLast={rowIndex === rows.length - 1}
                            resizePreview={resizePreview?.rowId === row.id ? resizePreview : null}
                            blockIdsByColumn={blockIdsByColumn}
                            isDndKitDragging={!!activeBlockId}
                            isDndKitDraggingRef={isDndKitDraggingRef}
                        />
                    ))}
                </div>

                {/* Add Row Button */}
                {!readOnly && (
                    <div className="mt-2 flex justify-center">
                        <button
                            onClick={addRow}
                            className="flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary rounded-lg transition-all"
                        >
                            <iconify-icon icon="solar:add-circle-linear" width="18"></iconify-icon>
                            <span>Ajouter une ligne</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Drag Overlay — ghost that follows cursor during @dnd-kit drag */}
            <DragOverlay
                modifiers={[zoomModifier]}
                dropAnimation={{
                    duration: 200,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}
            >
                {activeBlock ? (
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.15), 0 0 0 2px rgba(67,97,238,0.3)',
                            padding: '8px',
                            opacity: 0.92,
                            transform: 'rotate(1.5deg) scale(1.02)',
                            maxWidth: '400px',
                            overflow: 'hidden',
                            pointerEvents: 'none',
                        }}
                    >
                        {renderDragOverlay
                            ? renderDragOverlay(activeBlock)
                            : renderBlock
                                ? renderBlock(activeBlock, 0, 0, 0)
                                : <div className="p-2 text-sm text-gray-500">Block</div>
                        }
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

// ========== ROW COMPONENT ==========
function GridRow({
    row, rowIndex, readOnly, gap, panelMode,
    onDelete, onDuplicate, onMoveUp, onMoveDown,
    onSetLayout, onAddColumn, onDeleteColumn, onToggleEqualHeight,
    onStartResize,
    renderBlock, onDropInColumn, emptyColumnContent,
    isFirst, isLast,
    resizePreview,
    blockIdsByColumn,
    isDndKitDragging,
    isDndKitDraggingRef,
}) {
    const [hovered, setHovered] = useState(false)
    const [layoutMode, setLayoutMode] = useState(false)
    const gridRef = useRef(null)

    return (
        <div
            className="group relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setLayoutMode(false) }}
        >
            {/* Row Toolbar (hover) */}
            {!readOnly && hovered && (
                <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 flex gap-1 z-20"
                    style={{ marginTop: '-2px' }}
                >
                    {!layoutMode ? (
                        <div className="flex gap-1 items-center">
                            {/* Layout preset button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setLayoutMode(true) }}
                                title="Column Layout"
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <iconify-icon icon="solar:widget-5-bold" width="16"></iconify-icon>
                            </button>
                            {/* Duplicate */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDuplicate() }}
                                title="Duplicate Row"
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <iconify-icon icon="solar:copy-bold" width="16"></iconify-icon>
                            </button>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                            {/* Move Up */}
                            {!isFirst && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMoveUp() }}
                                    title="Move Up"
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                                >
                                    <iconify-icon icon="solar:arrow-up-outline" width="16"></iconify-icon>
                                </button>
                            )}
                            {/* Move Down */}
                            {!isLast && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMoveDown() }}
                                    title="Move Down"
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                                >
                                    <iconify-icon icon="solar:arrow-down-outline" width="16"></iconify-icon>
                                </button>
                            )}
                            {/* Delete */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete() }}
                                title="Delete Row"
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600"
                            >
                                <iconify-icon icon="solar:trash-bin-minimalistic-outline" width="16"></iconify-icon>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-1 items-center">
                            {/* Layout Presets */}
                            {[1, 2, 3, 4].map(n => (
                                <button
                                    key={n}
                                    onClick={(e) => { e.stopPropagation(); onSetLayout(n); setLayoutMode(false) }}
                                    title={`${n} Column${n > 1 ? 's' : ''}`}
                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-primary/10 hover:text-primary"
                                >
                                    <LayoutPresetIcon count={n} />
                                </button>
                            ))}

                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                            {/* Add Column */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onAddColumn() }}
                                title="Add Column (max 12)"
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-success/10 hover:text-success"
                            >
                                <iconify-icon icon="solar:add-circle-bold" width="16"></iconify-icon>
                            </button>

                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                            {/* Equal Height Toggle */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleEqualHeight() }}
                                title={row.equalHeight ? 'Disable Equal Height' : 'Enable Equal Height'}
                                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${row.equalHeight ? 'bg-primary text-white' : 'hover:bg-primary/10 hover:text-primary'
                                    }`}
                            >
                                <iconify-icon icon="solar:align-vertical-center-bold" width="16"></iconify-icon>
                            </button>

                            {/* Close layout mode */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setLayoutMode(false) }}
                                title="Close"
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <iconify-icon icon="solar:close-circle-bold" width="16"></iconify-icon>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Row Grid (12-column) */}
            <div
                ref={gridRef}
                className={`grid ${row.equalHeight ? 'items-stretch' : ''}`}
                style={{
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: `${gap * 4}px`
                }}
            >
                {row.columns.map((column, colIndex) => {
                    // If resize preview is active for this column, override the width
                    const previewWidth = resizePreview
                        ? (colIndex === resizePreview.colIndex ? resizePreview.leftWidth
                            : (colIndex === resizePreview.colIndex + 1 ? resizePreview.rightWidth
                                : column.width))
                        : column.width

                    return (
                        <GridColumn
                            key={column.id || colIndex}
                            column={{ ...column, width: previewWidth }}
                            colIndex={colIndex}
                            rowIndex={rowIndex}
                            row={row}
                            readOnly={readOnly}
                            hovered={hovered}
                            panelMode={panelMode}
                            onStartResize={(ci, e) => onStartResize(ci, e, gridRef.current)}
                            onDeleteColumn={onDeleteColumn}
                            renderBlock={renderBlock}
                            onDropInColumn={onDropInColumn}
                            emptyColumnContent={emptyColumnContent}
                            blockIds={blockIdsByColumn[column.id] || []}
                            isDndKitDragging={isDndKitDragging}
                            isDndKitDraggingRef={isDndKitDraggingRef}
                        />
                    )
                })}

                {/* Ghost preview column when splitting the last column */}
                {resizePreview?.isNew && (
                    <div
                        className="relative border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg flex items-center justify-center"
                        style={{ gridColumn: `span ${resizePreview.rightWidth}` }}
                    >
                        <span className="text-xs text-primary/60">Nouvelle colonne</span>
                    </div>
                )}
            </div>
        </div>
    )
}

// ========== COLUMN COMPONENT ==========
// HTML5 native drag handlers are ONLY for external drops (sidebar → column).
// They are disabled when @dnd-kit is handling an internal block reorder.
function GridColumn({
    column, colIndex, rowIndex, row, readOnly, hovered, panelMode,
    onStartResize, onDeleteColumn,
    renderBlock, onDropInColumn, emptyColumnContent,
    blockIds,
    isDndKitDragging,
    isDndKitDraggingRef,
}) {
    // Register this column as a droppable target for @dnd-kit cross-column moves
    const { setNodeRef: setDroppableRef, isOver: isDndKitOver } = useDroppable({
        id: column.id,
    })

    const [dragOver, setDragOver] = useState(false)
    const [touchFocused, setTouchFocused] = useState(false)
    const [colHovered, setColHovered] = useState(false)
    const dragCounterRef = useRef(0)

    // HTML5 drag handlers — ONLY for external content drops (sidebar items)
    // Per Rule #7: "HTML5 @dragover/@dragleave on zones with children → Vibrations"
    // We mitigate by using a counter pattern and by DISABLING these handlers
    // entirely when @dnd-kit is managing an internal drag.
    const handleDragOver = useCallback((e) => {
        // Skip if @dnd-kit is handling a drag — prevents conflict
        if (isDndKitDraggingRef.current) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    }, [isDndKitDraggingRef])

    const handleDragEnter = useCallback((e) => {
        if (isDndKitDraggingRef.current) return
        e.preventDefault()
        dragCounterRef.current++
        setDragOver(true)
    }, [isDndKitDraggingRef])

    const handleDragLeave = useCallback((e) => {
        if (isDndKitDraggingRef.current) return
        e.preventDefault()
        dragCounterRef.current--
        if (dragCounterRef.current <= 0) {
            dragCounterRef.current = 0
            setDragOver(false)
        }
    }, [isDndKitDraggingRef])

    const handleDrop = useCallback((e) => {
        if (isDndKitDraggingRef.current) return
        e.preventDefault()
        dragCounterRef.current = 0
        setDragOver(false)
        if (onDropInColumn) {
            const html = e.dataTransfer.getData('text/html')
            const text = e.dataTransfer.getData('text/plain')
            onDropInColumn(rowIndex, colIndex, { html, text })
        }
    }, [rowIndex, colIndex, onDropInColumn, isDndKitDraggingRef])

    // Touch: tap column to focus and show resize handle
    const handleTouchTap = useCallback((e) => {
        if (readOnly) return
        setTouchFocused(prev => !prev)
    }, [readOnly])

    const isEmpty = !column.blocks || column.blocks.length === 0
    const showHandle = hovered || touchFocused

    // Show borders: on hover, drag over (HTML5 or @dnd-kit), or when @dnd-kit is dragging (shows drop targets)
    const showBorders = colHovered || dragOver || isDndKitDragging || isDndKitOver

    return (
        <div
            ref={setDroppableRef}
            className={`relative transition-all duration-200 group/col ${row.equalHeight ? 'flex flex-col' : ''
                } ${touchFocused && !isEmpty ? 'ring-2 ring-primary/30 rounded-lg' : ''
                }`}
            style={{
                gridColumn: `span ${column.width}`,
                minHeight: isEmpty ? '80px' : undefined,
                border: showBorders && !isEmpty
                    ? '1px dashed rgba(67,97,238,0.25)'
                    : ((!readOnly && isEmpty) ? '1px dashed' : '1px dashed transparent'),
                borderColor: (dragOver || isDndKitOver)
                    ? 'rgba(67,97,238,0.6)'
                    : (showBorders && !isEmpty
                        ? 'rgba(67,97,238,0.25)'
                        : ((!readOnly && isEmpty) ? 'rgba(156,163,175,0.4)' : 'transparent')),
                borderRadius: '8px',
                background: (dragOver || isDndKitOver)
                    ? 'rgba(67,97,238,0.04)'
                    : (isEmpty && !readOnly ? 'rgba(156,163,175,0.02)' : 'transparent'),
                transition: 'border-color 0.2s, background 0.2s, opacity 0.2s',
                opacity: !readOnly && isEmpty && !colHovered && !dragOver && !isDndKitOver ? 0.4 : 1,
                padding: showBorders && !isEmpty ? '4px' : '0px',
            }}
            onDragOver={!readOnly ? handleDragOver : undefined}
            onDragEnter={!readOnly ? handleDragEnter : undefined}
            onDragLeave={!readOnly ? handleDragLeave : undefined}
            onDrop={!readOnly ? handleDrop : undefined}
            onClick={handleTouchTap}
            onMouseEnter={() => setColHovered(true)}
            onMouseLeave={() => setColHovered(false)}
            data-column-id={column.id}
        >
            {/* Resize Handle — full-height clickable bar on the right edge */}
            {!readOnly && showHandle && (
                <div
                    onMouseDown={(e) => onStartResize(colIndex, e)}
                    onTouchStart={(e) => { e.stopPropagation(); onStartResize(colIndex, e) }}
                    style={{
                        position: 'absolute',
                        right: '-8px',
                        top: 0,
                        bottom: 0,
                        width: '16px',
                        cursor: 'col-resize',
                        zIndex: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        touchAction: 'none',
                    }}
                    className="group/handle"
                >
                    {/* Visible indicator line */}
                    <div
                        className={`w-[3px] rounded-full transition-colors ${touchFocused
                            ? 'bg-primary'
                            : 'bg-gray-300 dark:bg-gray-600 group-hover/handle:bg-primary'
                            }`}
                        style={{ height: '40px' }}
                    />
                </div>
            )}

            {/* Column Content */}
            <div
                className={`${row.equalHeight ? 'flex-1 flex flex-col' : ''}`}
                style={{ minHeight: isEmpty ? '80px' : (panelMode ? '80px' : undefined) }}
            >
                {isEmpty ? (
                    /* Empty Column Placeholder */
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            minHeight: '80px',
                            width: '100%',
                            flex: row.equalHeight ? '1' : undefined
                        }}
                    >
                        {emptyColumnContent || (
                            <span className="text-gray-400 text-xs">Glissez un élément ici</span>
                        )}
                        {/* Delete column button */}
                        {!readOnly && row.columns.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteColumn(colIndex) }}
                                className="w-8 h-8 rounded-full bg-danger/10 hover:bg-danger/20 transition-all flex items-center justify-center"
                                title="Supprimer cette colonne"
                            >
                                <iconify-icon icon="solar:trash-bin-trash-bold" width="16" className="text-danger"></iconify-icon>
                            </button>
                        )}
                    </div>
                ) : (
                    /* Blocks — sortable via @dnd-kit */
                    <SortableContext
                        items={blockIds}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className={panelMode ? 'space-y-3' : ''}>
                            {column.blocks.map((block, blockIndex) => (
                                <SortableBlock
                                    key={block.id || blockIndex}
                                    blockId={block.id}
                                >
                                    <div
                                        className={`${row.equalHeight ? 'flex-1' : ''
                                            } ${panelMode
                                                ? 'p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700/50 shadow-sm'
                                                : ''
                                            }`}
                                    >
                                        {renderBlock ? renderBlock(block, colIndex, rowIndex, blockIndex) : (
                                            <div className={panelMode ? '' : 'py-1'}>
                                                <span className="text-sm text-gray-500">Block {blockIndex + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                </SortableBlock>
                            ))}
                        </div>
                    </SortableContext>
                )}
            </div>
        </div>
    )
}

// ========== LAYOUT PRESET ICONS ==========
function LayoutPresetIcon({ count }) {
    const rects = {
        1: [{ x: 4, w: 16 }],
        2: [{ x: 4, w: 6 }, { x: 14, w: 6 }],
        3: [{ x: 3, w: 4 }, { x: 10, w: 4 }, { x: 17, w: 4 }],
        4: [{ x: 3, w: 3 }, { x: 8.5, w: 3 }, { x: 14, w: 3 }, { x: 19.5, w: 3 }]
    }

    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {(rects[count] || rects[1]).map((r, i) => (
                <rect key={i} x={r.x} y="4" width={r.w} height="16" rx="1" />
            ))}
        </svg>
    )
}

// ========== EXPORT UTILITIES ==========
export { uid as generateGridId, GRID_COLS, MIN_COL_WIDTH }
