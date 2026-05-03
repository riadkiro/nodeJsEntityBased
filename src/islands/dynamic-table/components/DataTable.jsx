/**
 * DataTable - The editable table (thead + tbody)
 * Renders schema columns with inline editing
 * Includes RelationSearch dropdown inline
 * Supports column resize via drag handles
 */
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import CellRenderer from './CellRenderer'

const tableWrapStyle = {
    flex: 1,
    overflow: 'auto',
    padding: '0',
    position: 'relative',
    zIndex: 20
}

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12.5px',
    tableLayout: 'fixed'
}

const thStyle = {
    padding: '10px 12px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#888da8',
    background: 'transparent',
    borderBottom: '1px solid #f1f3f5',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
}

const tdStyle = {
    padding: '8px 12px',
    borderBottom: '1px solid #f1f3f5',
    verticalAlign: 'middle',
    color: '#0e1726',
    position: 'relative',
    overflow: 'visible'
}

const tdRelation = {
    padding: '4px 8px',
    minWidth: '120px',
    borderBottom: '1px solid #f1f3f5',
    verticalAlign: 'middle',
    position: 'relative',
    overflow: 'visible'
}

const dragHandleStyle = {
    cursor: 'grab',
    color: '#d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    transition: 'all 0.15s',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none'
}

const rowNumStyle = {
    padding: '0 4px',
    fontSize: '11px',
    color: '#9ca3af',
    borderBottom: '1px solid #f1f3f5'
}

const removeBtn = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#d1d5db',
    fontSize: '14px',
    padding: '2px',
    borderRadius: '4px',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const addBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 12px',
    margin: '0',
    minHeight: '24px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#888da8',
    background: 'transparent',
    border: 'none',
    borderRadius: '0',
    cursor: 'pointer',
    transition: 'all 0.15s',
    lineHeight: 1
}

const relationInputStyle = {
    width: '100%',
    height: '20px',
    padding: '0 3px',
    background: 'transparent',
    border: 'none',
    fontSize: '12.5px',
    lineHeight: '18px',
    outline: 'none',
    boxShadow: 'none',
    borderRadius: '4px',
    color: 'inherit',
    transition: 'background 0.15s'
}

const dropdownStyle = {
    position: 'fixed',
    left: 0,
    zIndex: 6000,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    overflowY: 'auto',
    minWidth: '220px'
}

const dropdownItemStyle = {
    padding: '6px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f9fafb',
    transition: 'background 0.1s'
}

// ── Resize handle styles ──
const resizeHandleStyle = {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '5px',
    cursor: 'col-resize',
    zIndex: 10,
    background: 'transparent',
    transition: 'background 0.15s'
}

// ── Default column widths by schema size ──
const DEFAULT_WIDTHS = { XS: 60, S: 90, M: 140, L: 200, XL: 280 }

function getDefaultWidth(col) {
    return DEFAULT_WIDTHS[col.width] || 140
}

export default function DataTable({
    schemaId,
    schema,
    lines,
    getRelationCol,
    getVisibleColumns,
    getRelationLabel,
    searchState,
    onOpenSearch,
    onSearch,
    onCloseSearch,
    onSelectRelation,
    onCellChange,
    onRemoveLine,
    onReorderLines,
    onReorderByIds,
    onAddLine,
    columnWidths,
    onColumnResize
}) {
    const relCol = getRelationCol()
    const sampleLine = lines[0] || null
    const visibleCols = getVisibleColumns(sampleLine)
    const getLineId = useCallback((line, idx) => String(line?._id || line?._tempId || idx), [])
    const lineOrderSignature = lines.map((line, idx) => getLineId(line, idx)).join('|')

    // ── Resize state ──
    const [resizing, setResizing] = useState(null) // { colKey, startX, startWidth }
    const tableRef = useRef(null)
    const tbodyRef = useRef(null)
    const sortableRef = useRef(null)
    const dropTargetRef = useRef(null)
    const linesRef = useRef(lines)
    const dragUpdatedRef = useRef(false)

    // ── Stable callback refs (avoid useEffect re-fires on every render) ──
    const onReorderLinesRef = useRef(onReorderLines)
    const onReorderByIdsRef = useRef(onReorderByIds)
    const onCloseSearchRef = useRef(onCloseSearch)
    useEffect(() => { onReorderLinesRef.current = onReorderLines }, [onReorderLines])
    useEffect(() => { onReorderByIdsRef.current = onReorderByIds }, [onReorderByIds])
    useEffect(() => { onCloseSearchRef.current = onCloseSearch }, [onCloseSearch])

    useEffect(() => {
        if (!resizing) return

        const handleMouseMove = (e) => {
            const delta = e.clientX - resizing.startX
            const newWidth = Math.max(40, resizing.startWidth + delta)
            // Live update via DOM for performance
            const th = tableRef.current?.querySelector(`[data-col-key="${resizing.colKey}"]`)
            if (th) th.style.width = newWidth + 'px'
        }

        const handleMouseUp = (e) => {
            const delta = e.clientX - resizing.startX
            const newWidth = Math.max(40, resizing.startWidth + delta)
            if (onColumnResize) onColumnResize(resizing.colKey, newWidth)
            setResizing(null)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [resizing, onColumnResize])

    const startResize = useCallback((colKey, e) => {
        e.preventDefault()
        e.stopPropagation()
        const th = e.target.closest('th')
        if (!th) return
        setResizing({ colKey, startX: e.clientX, startWidth: th.offsetWidth })
    }, [])

    const getColWidth = useCallback((colKey, col) => {
        if (columnWidths && columnWidths[colKey]) return columnWidths[colKey]
        if (col) return getDefaultWidth(col)
        return 180
    }, [columnWidths])

    useEffect(() => {
        linesRef.current = lines
    }, [lines])

    useEffect(() => {
        if (!tbodyRef.current) return

        let cancelled = false
        let retryTimer = null

        const clearDropTarget = () => {
            if (!dropTargetRef.current) return
            dropTargetRef.current.classList.remove('dt-drop-target-before', 'dt-drop-target-after')
            dropTargetRef.current = null
        }

        const clearDragClasses = () => {
            if (!tbodyRef.current) return
            tbodyRef.current.querySelectorAll('tr').forEach((tr) => {
                tr.classList.remove('dt-row-ghost', 'dt-row-chosen', 'dt-row-drag', 'dt-drop-target-before', 'dt-drop-target-after')
            })
        }

        const destroySortable = () => {
            if (sortableRef.current) {
                sortableRef.current.destroy()
                sortableRef.current = null
            }
        }

        const initSortable = () => {
            if (cancelled) return
            const SortableLib = typeof window !== 'undefined' ? window.Sortable : null
            if (!SortableLib || typeof SortableLib.create !== 'function') {
                retryTimer = setTimeout(initSortable, 120)
                return
            }

            destroySortable()

            const commitReorder = (evt) => {
                const domIds = tbodyRef.current
                    ? Array.from(tbodyRef.current.querySelectorAll('tr[data-line-id]')).map(el => String(el.dataset.lineId || ''))
                    : []

                if (domIds.length > 0 && typeof onReorderByIdsRef.current === 'function') {
                    onReorderByIdsRef.current(domIds)
                    return
                }

                let oldIndex = evt?.oldIndex
                let newIndex = evt?.newIndex
                const draggedId = String(evt?.item?.dataset?.lineId || '')
                if ((oldIndex === undefined || newIndex === undefined) && draggedId && domIds.length > 0) {
                    const currentIds = (linesRef.current || []).map((line, idx) => getLineId(line, idx))
                    oldIndex = currentIds.indexOf(draggedId)
                    newIndex = domIds.indexOf(draggedId)
                }

                if (oldIndex === undefined || newIndex === undefined) return
                if (oldIndex === newIndex) return
                onReorderLinesRef.current?.(oldIndex, newIndex)
            }

            sortableRef.current = SortableLib.create(tbodyRef.current, {
                animation: 180,
                direction: 'vertical',
                handle: '.dt-drag-handle',
                draggable: 'tr[data-line-id]',
                dataIdAttr: 'data-line-id',
                // Use fallback mode — native HTML5 DnD is blocked by -webkit-user-drag:none
                forceFallback: true,
                fallbackClass: 'dt-row-drag',
                fallbackOnBody: true,
                fallbackTolerance: 3,
                // Keep native click/focus on form controls (typing/searching in cells)
                filter: 'input, textarea, select, button, a, [contenteditable="true"], .dt-inline-input, .dt-inline-select',
                preventOnFilter: false,
                swapThreshold: 0.65,
                invertSwap: true,
                ghostClass: 'dt-row-ghost',
                chosenClass: 'dt-row-chosen',
                onChoose: () => {
                    document.body.classList.add('dt-dragging')
                    document.body.style.userSelect = 'none'
                },
                onStart: () => {
                    dragUpdatedRef.current = false
                    onCloseSearchRef.current?.()
                    clearDropTarget()
                },
                onMove: (evt) => {
                    const related = evt?.related
                    if (!related || related.tagName !== 'TR') {
                        clearDropTarget()
                        return true
                    }

                    if (dropTargetRef.current && dropTargetRef.current !== related) {
                        dropTargetRef.current.classList.remove('dt-drop-target-before', 'dt-drop-target-after')
                    }
                    dropTargetRef.current = related
                    related.classList.remove('dt-drop-target-before', 'dt-drop-target-after')
                    if (evt?.willInsertAfter) related.classList.add('dt-drop-target-after')
                    else related.classList.add('dt-drop-target-before')
                    return true
                },
                onEnd: (evt) => {
                    commitReorder(evt)
                    dragUpdatedRef.current = false
                    clearDropTarget()
                    if (evt?.item?.classList) {
                        evt.item.classList.remove('dt-row-ghost', 'dt-row-chosen', 'dt-row-drag')
                    }
                    clearDragClasses()
                    document.body.classList.remove('dt-dragging')
                    document.body.style.userSelect = ''
                },
                onUnchoose: () => {
                    dragUpdatedRef.current = false
                    clearDragClasses()
                    document.body.classList.remove('dt-dragging')
                    document.body.style.userSelect = ''
                }
            })
        }

        clearDragClasses()
        initSortable()

        return () => {
            cancelled = true
            if (retryTimer) clearTimeout(retryTimer)
            destroySortable()
            clearDropTarget()
            clearDragClasses()
        }
    }, [lineOrderSignature, getLineId])

    return (
        <div style={tableWrapStyle} className="dt-compact-skin">
            <table style={tableStyle} ref={tableRef}>
                <thead>
                    <tr>
                        <th style={{ ...thStyle, width: '28px', minWidth: '28px', maxWidth: '28px' }}></th>
                        {relCol && (
                            <th
                                data-col-key="__relation"
                                style={{ ...thStyle, width: getColWidth('__relation', relCol) + 'px' }}
                            >
                                {relCol.label || 'Article'}
                                <div
                                    style={resizeHandleStyle}
                                    onMouseDown={(e) => startResize('__relation', e)}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#4361ee' }}
                                    onMouseLeave={(e) => { if (!resizing) e.currentTarget.style.background = 'transparent' }}
                                />
                            </th>
                        )}
                        {visibleCols.map(col => (
                            <th
                                key={col.key}
                                data-col-key={col.key}
                                style={{ ...thStyle, width: getColWidth(col.key, col) + 'px' }}
                            >
                                {col.label}
                                <div
                                    style={resizeHandleStyle}
                                    onMouseDown={(e) => startResize(col.key, e)}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#4361ee' }}
                                    onMouseLeave={(e) => { if (!resizing) e.currentTarget.style.background = 'transparent' }}
                                />
                            </th>
                        ))}
                        <th style={{ ...thStyle, width: '36px', minWidth: '36px', maxWidth: '36px' }}></th>
                    </tr>
                </thead>
                <tbody ref={tbodyRef}>
                    {lines.map((line, lineIdx) => (
                        <TableRow
                            key={getLineId(line, lineIdx)}
                            lineId={getLineId(line, lineIdx)}
                            schemaId={schemaId}
                            line={line}
                            lineIdx={lineIdx}
                            relCol={relCol}
                            visibleCols={getVisibleColumns(line)}
                            relationLabel={getRelationLabel(line)}
                            searchState={searchState}
                            onOpenSearch={onOpenSearch}
                            onSearch={onSearch}
                            onCloseSearch={onCloseSearch}
                            onSelectRelation={onSelectRelation}
                            onCellChange={onCellChange}
                            onRemoveLine={onRemoveLine}
                        />
                    ))}
                </tbody>
            </table>

            <button
                type="button"
                style={addBtnStyle}
                onClick={onAddLine}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#4361ee'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888da8'
                }}
            >
                <span style={{ fontSize: '12px' }}>+</span>
                Ajouter
            </button>

            <style>{`
                .dt-compact-skin .dt-row-ghost td {
                    background: #eff4ff !important;
                    opacity: 0.8;
                }

                .dt-compact-skin .dt-row-chosen td {
                    background: #f8fbff !important;
                }

                .dt-compact-skin .dt-row-drag td {
                    opacity: 0.4;
                }

                .dt-compact-skin tr.dt-drop-target-before td {
                    box-shadow: inset 0 2px 0 #4361ee;
                }

                .dt-compact-skin tr.dt-drop-target-after td {
                    box-shadow: inset 0 -2px 0 #4361ee;
                }

                .dt-compact-skin .dt-drag-handle {
                    cursor: grab;
                    color: #b8c2d1;
                }

                .dt-compact-skin .dt-drag-cell {
                    cursor: default;
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: none;
                }

                .dt-compact-skin .dt-drag-cell:active {
                    cursor: grabbing;
                }

                .dt-compact-skin .dt-drag-handle:active {
                    cursor: grabbing;
                }

                .dt-compact-skin .dt-drag-handle:hover {
                    color: #64748b;
                    background: #f1f5f9;
                }

                .dt-compact-skin .dt-drag-handle svg,
                .dt-compact-skin .dt-drag-handle svg * {
                    pointer-events: none;
                }

                body.dt-dragging,
                body.dt-dragging * {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                }

                .dt-compact-skin .dt-inline-input,
                .dt-compact-skin .dt-inline-select {
                    height: 20px !important;
                    min-height: 20px !important;
                    padding: 0 3px !important;
                    border: none !important;
                    border-radius: 4px !important;
                    background: transparent !important;
                    font-size: 12.5px !important;
                    line-height: 18px !important;
                    box-shadow: none !important;
                    outline: none !important;
                }

                .dt-compact-skin .dt-inline-input:focus,
                .dt-compact-skin .dt-inline-select:focus {
                    border: none !important;
                    background: #f8fafc !important;
                    box-shadow: none !important;
                    outline: none !important;
                }
            `}</style>
        </div>
    )
}

function TableRow({
    lineId,
    schemaId,
    line, lineIdx, relCol, visibleCols, relationLabel,
    searchState, onOpenSearch, onSearch, onCloseSearch, onSelectRelation,
    onCellChange, onRemoveLine
}) {
    const isSearchOpen = searchState.open &&
        String(searchState.schemaId || '') === String(schemaId || '') &&
        searchState.lineIdx === lineIdx &&
        relCol && searchState.colKey === relCol.key

    const [relationInputValue, setRelationInputValue] = useState(relationLabel || '')
    const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0, maxHeight: 180 })
    const [inputEl, setInputEl] = useState(null)
    const rowIdentity = line?._id || line?._tempId || lineIdx

    useEffect(() => {
        setRelationInputValue(relationLabel || '')
    }, [relationLabel, rowIdentity])

    useEffect(() => {
        if (!isSearchOpen || !inputEl) return

        const updateLayout = () => {
            const rect = inputEl.getBoundingClientRect()
            const viewportH = window.innerHeight || document.documentElement.clientHeight || 900
            const below = viewportH - rect.bottom - 8
            const above = rect.top - 8
            const openUp = below < 150 && above > below
            const maxHeight = Math.max(100, Math.min(220, openUp ? above - 4 : below - 4))

            setDropdownLayout({
                openUp,
                top: openUp ? undefined : (rect.bottom + 2),
                bottom: openUp ? (viewportH - rect.top + 2) : undefined,
                left: rect.left,
                width: Math.max(220, rect.width),
                maxHeight
            })
        }

        updateLayout()
        window.addEventListener('resize', updateLayout)
        window.addEventListener('scroll', updateLayout, true)
        return () => {
            window.removeEventListener('resize', updateLayout)
            window.removeEventListener('scroll', updateLayout, true)
        }
    }, [isSearchOpen, inputEl])

    const handleRelationFocus = useCallback((e) => {
        if (relCol) {
            e.target.select()
            onOpenSearch(schemaId, lineIdx, relCol.key)
        }
    }, [schemaId, lineIdx, relCol, onOpenSearch])

    const handleRelationInput = useCallback((e) => {
        const q = e.target.value
        setRelationInputValue(q)
        if (relCol) {
            onSearch(schemaId, lineIdx, relCol.key, q)
        }
    }, [schemaId, lineIdx, relCol, onSearch])

    return (
                        <tr
                            data-line-id={lineId}
                            style={{ transition: 'background 0.15s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
            <td
                className="dt-drag-cell"
                style={{ ...tdStyle, padding: '4px 4px', width: '28px' }}
            >
                <span
                    className="dt-drag-handle"
                    style={dragHandleStyle}
                    title="Glisser pour réordonner"
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                    >
                        <circle cx="4" cy="2.25" r="1" fill="currentColor" />
                        <circle cx="8" cy="2.25" r="1" fill="currentColor" />
                        <circle cx="4" cy="6" r="1" fill="currentColor" />
                        <circle cx="8" cy="6" r="1" fill="currentColor" />
                        <circle cx="4" cy="9.75" r="1" fill="currentColor" />
                        <circle cx="8" cy="9.75" r="1" fill="currentColor" />
                    </svg>
                </span>
            </td>

            {relCol && (
                <td style={tdRelation}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="dt-inline-input"
                            style={relationInputStyle}
                            ref={setInputEl}
                            value={relationInputValue}
                            onFocus={handleRelationFocus}
                            onInput={handleRelationInput}
                            onBlur={() => setTimeout(() => onCloseSearch({ schemaId, lineIdx }), 200)}
                            onKeyDown={(e) => { if (e.key === 'Escape') onCloseSearch({ schemaId, lineIdx }) }}
                            placeholder={'🔍 ' + (relCol.label || 'Article')}
                        />

                        {isSearchOpen && (searchState.query || searchState.loading || searchState.results.length > 0) && inputEl && createPortal(
                            <div style={{ ...dropdownStyle, ...(dropdownLayout.openUp ? { bottom: dropdownLayout.bottom } : { top: dropdownLayout.top }), left: dropdownLayout.left, width: dropdownLayout.width, maxHeight: dropdownLayout.maxHeight }}>
                                {searchState.loading && (
                                    <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
                                        <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #e5e7eb', borderTopColor: '#4361ee', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                    </div>
                                )}
                                {!searchState.loading && searchState.results.length === 0 && searchState.query && (
                                    <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
                                        Aucun resultat
                                    </div>
                                )}
                                {!searchState.loading && searchState.results.map(item => (
                                    <div
                                        key={item._id}
                                        style={dropdownItemStyle}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            const label = item.label || item.title || ''
                                            setRelationInputValue(label)
                                            onSelectRelation(lineIdx, relCol, item)
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f4ff' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                    >
                                        <span style={{ fontWeight: 500 }}>{item.label || item.title}</span>
                                    </div>
                                ))}
                            </div>,
                            document.body
                        )}
                    </div>
                </td>
            )}

            {visibleCols.map(col => (
                <td key={col.key} style={{ ...tdStyle, padding: '4px 8px' }}>
                    <CellRenderer
                        col={col}
                        value={line.values?.[col.key]}
                        line={line}
                        onChange={(key, val) => onCellChange(lineIdx, key, val)}
                    />
                </td>
            ))}

            <td style={{ ...tdStyle, padding: '1px 4px', textAlign: 'center', width: '36px' }}>
                <button
                    type="button"
                    style={removeBtn}
                    onClick={() => onRemoveLine(lineIdx)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444'
                        e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#d1d5db'
                        e.currentTarget.style.background = 'none'
                    }}
                    title="Supprimer"
                >
                    x
                </button>
            </td>
        </tr>
    )
}
