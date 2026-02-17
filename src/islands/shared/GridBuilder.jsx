/**
 * GridBuilder — Reusable Row/Column Grid Layout System
 * 
 * A unified component for building grid layouts with:
 * - 12-column grid system (same as page builder & cockpit builder)
 * - Interactive column resize handles (drag to resize, shrink last column creates new one)
 * - Row toolbar with layout presets (1,2,3,4 columns), add column, equal height toggle
 * - Row actions: move up/down, duplicate, delete
 * - Column drop zones for drag & drop content
 * 
 * Used by: Document Editor (layout mode), Page Builder, Cockpit Builder
 * 
 * @example
 * <GridBuilder
 *     rows={pageData.rows}
 *     onRowsChange={(newRows) => setPageData({ ...pageData, rows: newRows })}
 *     renderBlock={(block, colIndex, rowIndex) => <MyBlock {...block} />}
 *     onDropInColumn={(rowIndex, colIndex, data) => handleDrop(rowIndex, colIndex, data)}
 *     emptyColumnContent={<div>Drop here</div>}
 * />
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'

// ========== UTILITY: Generate unique IDs ==========
let _gridIdCounter = 0
const uid = (prefix = 'grid') => `${prefix}_${Date.now()}_${++_gridIdCounter}`

// ========== CONSTANTS ==========
const GRID_COLS = 12
const MIN_COL_WIDTH = 1

// ========== MAIN COMPONENT ==========
export default function GridBuilder({
    rows = [],
    onRowsChange,
    renderBlock,
    onDropInColumn,
    emptyColumnContent,
    readOnly = false,
    className = '',
    gap = 6, // gap in tailwind units (gap-6 = 24px)
}) {
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
    const resizeStateRef = useRef({
        active: false, rowId: null, colIndex: null,
        startX: 0, startWidths: [], gridWidth: 0
    })

    const updateColumnWidths = useCallback((rowId, newWidths) => {
        onRowsChange(rows.map(row => {
            if (row.id !== rowId) return row
            return {
                ...row,
                columns: row.columns.map((c, i) => ({
                    ...c,
                    width: newWidths[i] !== undefined ? newWidths[i] : c.width
                }))
            }
        }))
    }, [rows, onRowsChange])

    const startResize = useCallback((rowId, colIndex, event, gridElement) => {
        if (readOnly) return
        event.preventDefault()
        const row = rows.find(r => r.id === rowId)
        if (!row) return

        resizeStateRef.current = {
            active: true,
            rowId,
            colIndex,
            startX: event.clientX,
            startWidths: row.columns.map(c => c.width),
            gridWidth: gridElement?.offsetWidth || 800
        }

        const doResize = (e) => {
            const state = resizeStateRef.current
            if (!state.active) return

            const colUnitWidth = state.gridWidth / GRID_COLS
            const deltaX = e.clientX - state.startX
            const deltaUnits = Math.round(deltaX / colUnitWidth)
            if (deltaUnits === 0) return

            const { colIndex: ci, startWidths, rowId: rid } = state
            const row = rows.find(r => r.id === rid)
            if (!row) return

            const isLast = ci === row.columns.length - 1

            if (isLast) {
                // Shrinking last column creates a new empty column
                let newWidth = startWidths[ci] + deltaUnits
                if (newWidth < MIN_COL_WIDTH) newWidth = MIN_COL_WIDTH
                const totalUsed = startWidths.reduce((s, w, i) =>
                    s + (i === ci ? newWidth : w), 0)
                const remaining = GRID_COLS - totalUsed

                if (remaining > 0) {
                    const newWidths = [...startWidths]
                    newWidths[ci] = newWidth
                    // Add new column width
                    if (newWidths.length === startWidths.length) {
                        newWidths.push(remaining)
                    } else {
                        newWidths[ci + 1] = remaining
                    }
                    // Need to add column to the row
                    onRowsChange(rows.map(r => {
                        if (r.id !== rid) return r
                        const cols = [...r.columns]
                        if (cols.length === startWidths.length && remaining > 0) {
                            cols.push({ id: uid('col'), width: remaining, blocks: [] })
                            state.startWidths.push(0)
                        }
                        return {
                            ...r,
                            columns: cols.map((c, i) => ({
                                ...c,
                                width: i === ci ? newWidth : (i === ci + 1 && i >= startWidths.length - 1 ? remaining : c.width)
                            }))
                        }
                    }))
                }
            } else {
                // Normal resize between two adjacent columns
                const leftW = startWidths[ci]
                const rightW = startWidths[ci + 1]
                let newLeft = leftW + deltaUnits
                let newRight = rightW - deltaUnits

                if (newLeft < MIN_COL_WIDTH) {
                    newLeft = MIN_COL_WIDTH
                    newRight = leftW + rightW - MIN_COL_WIDTH
                }
                if (newRight < MIN_COL_WIDTH) {
                    newRight = MIN_COL_WIDTH
                    newLeft = leftW + rightW - MIN_COL_WIDTH
                }

                const newWidths = startWidths.map((w, i) =>
                    i === ci ? newLeft : (i === ci + 1 ? newRight : w)
                )
                updateColumnWidths(rid, newWidths)
            }
        }

        const endResize = () => {
            resizeStateRef.current.active = false
            document.removeEventListener('mousemove', doResize)
            document.removeEventListener('mouseup', endResize)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        document.addEventListener('mousemove', doResize)
        document.addEventListener('mouseup', endResize)
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }, [rows, onRowsChange, readOnly, updateColumnWidths])

    // ===== RENDER =====
    return (
        <div className={`grid-builder ${className}`}>
            {/* Rows */}
            <div className="space-y-6">
                {rows.map((row, rowIndex) => (
                    <GridRow
                        key={row.id}
                        row={row}
                        rowIndex={rowIndex}
                        readOnly={readOnly}
                        gap={gap}
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
                    />
                ))}
            </div>

            {/* Add Row Button */}
            {!readOnly && (
                <div className="mt-6 flex justify-center">
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
    )
}

// ========== ROW COMPONENT ==========
function GridRow({
    row, rowIndex, readOnly, gap,
    onDelete, onDuplicate, onMoveUp, onMoveDown,
    onSetLayout, onAddColumn, onDeleteColumn, onToggleEqualHeight,
    onStartResize,
    renderBlock, onDropInColumn, emptyColumnContent,
    isFirst, isLast
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
                className={`grid min-h-[100px] ${row.equalHeight ? 'items-stretch' : ''}`}
                style={{
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: `${gap * 4}px`
                }}
            >
                {row.columns.map((column, colIndex) => (
                    <GridColumn
                        key={column.id || colIndex}
                        column={column}
                        colIndex={colIndex}
                        rowIndex={rowIndex}
                        row={row}
                        readOnly={readOnly}
                        hovered={hovered}
                        onStartResize={(ci, e) => onStartResize(ci, e, gridRef.current)}
                        onDeleteColumn={onDeleteColumn}
                        renderBlock={renderBlock}
                        onDropInColumn={onDropInColumn}
                        emptyColumnContent={emptyColumnContent}
                    />
                ))}
            </div>
        </div>
    )
}

// ========== COLUMN COMPONENT ==========
function GridColumn({
    column, colIndex, rowIndex, row, readOnly, hovered,
    onStartResize, onDeleteColumn,
    renderBlock, onDropInColumn, emptyColumnContent
}) {
    const [dragOver, setDragOver] = useState(false)
    const dragCounterRef = useRef(0)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    }, [])

    const handleDragEnter = useCallback((e) => {
        e.preventDefault()
        dragCounterRef.current++
        setDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        dragCounterRef.current--
        if (dragCounterRef.current <= 0) {
            dragCounterRef.current = 0
            setDragOver(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        dragCounterRef.current = 0
        setDragOver(false)
        if (onDropInColumn) {
            const html = e.dataTransfer.getData('text/html')
            const text = e.dataTransfer.getData('text/plain')
            onDropInColumn(rowIndex, colIndex, { html, text })
        }
    }, [rowIndex, colIndex, onDropInColumn])

    const isEmpty = !column.blocks || column.blocks.length === 0

    return (
        <div
            className={`relative transition-all duration-200 group/col ${row.equalHeight ? 'flex flex-col h-full' : ''
                } ${!readOnly && isEmpty ? 'border-2 border-dashed rounded-lg' : ''
                } ${dragOver
                    ? 'border-primary bg-primary/5'
                    : (!readOnly && isEmpty
                        ? 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                        : '')
                }`}
            style={{ gridColumn: `span ${column.width}` }}
            onDragOver={!readOnly ? handleDragOver : undefined}
            onDragEnter={!readOnly ? handleDragEnter : undefined}
            onDragLeave={!readOnly ? handleDragLeave : undefined}
            onDrop={!readOnly ? handleDrop : undefined}
        >
            {/* Resize Handle */}
            {!readOnly && hovered && (
                <div
                    onMouseDown={(e) => onStartResize(colIndex, e)}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translate(50%, -50%)',
                        cursor: 'col-resize',
                        zIndex: 50,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 0',
                    }}
                    className="text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
                >
                    <iconify-icon icon="solar:alt-arrow-left-bold" width="12"></iconify-icon>
                    <iconify-icon icon="solar:alt-arrow-right-bold" width="12" style={{ marginLeft: '-4px' }}></iconify-icon>
                </div>
            )}

            {/* Column Content */}
            <div
                className={`${isEmpty ? 'h-full min-h-[90px]' : 'min-h-[150px]'} ${row.equalHeight ? 'flex-1 flex flex-col' : ''}`}
            >
                {isEmpty ? (
                    /* Empty Column Placeholder */
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
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
                    /* Blocks */
                    <div className="space-y-4">
                        {column.blocks.map((block, blockIndex) => (
                            <div key={block.id || blockIndex} className={row.equalHeight ? 'flex-1' : ''}>
                                {renderBlock ? renderBlock(block, colIndex, rowIndex, blockIndex) : (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        <span className="text-sm text-gray-500">Block {blockIndex + 1}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
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
