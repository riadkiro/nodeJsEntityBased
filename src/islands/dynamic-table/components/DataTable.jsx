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
    fontSize: '13px',
    tableLayout: 'fixed'
}

const thStyle = {
    padding: '6px 8px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
}

const tdStyle = {
    padding: '2px 8px',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'middle',
    color: '#1f2937',
    position: 'relative',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
}

const tdRelation = {
    padding: '1px 4px',
    minWidth: '120px',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'middle',
    position: 'relative',
    overflow: 'hidden'
}

const dragHandleStyle = {
    cursor: 'grab',
    color: '#d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
}

const rowNumStyle = {
    padding: '1px 4px',
    fontSize: '11px',
    color: '#9ca3af',
    borderBottom: '1px solid #e5e7eb'
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
    gap: '4px',
    padding: '4px 10px',
    margin: '4px 10px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#4361ee',
    background: 'transparent',
    border: '1px dashed #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s'
}

const relationInputStyle = {
    width: '100%',
    height: '22px',
    padding: '0 4px',
    background: 'transparent',
    border: '1px solid transparent',
    fontSize: '13px',
    lineHeight: '20px',
    outline: 'none',
    boxShadow: 'none',
    borderRadius: '4px',
    color: 'inherit',
    transition: 'border-color 0.15s'
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
    onAddLine,
    columnWidths,
    onColumnResize
}) {
    const relCol = getRelationCol()
    const sampleLine = lines[0] || null
    const visibleCols = getVisibleColumns(sampleLine)

    // ── Resize state ──
    const [resizing, setResizing] = useState(null) // { colKey, startX, startWidth }
    const tableRef = useRef(null)

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

    return (
        <div style={tableWrapStyle}>
            <table style={tableStyle} ref={tableRef}>
                <thead>
                    <tr>
                        <th style={{ ...thStyle, width: '28px', minWidth: '28px', maxWidth: '28px' }}></th>
                        <th style={{ ...thStyle, width: '24px', minWidth: '24px', maxWidth: '24px' }}>#</th>
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
                <tbody>
                    {lines.map((line, lineIdx) => (
                        <TableRow
                            key={line._tempId || line._id || lineIdx}
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
                    e.currentTarget.style.borderColor = '#4361ee'
                    e.currentTarget.style.background = 'rgba(67,97,238,0.03)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.background = 'transparent'
                }}
            >
                <span style={{ fontSize: '14px' }}>+</span>
                Ajouter
            </button>
        </div>
    )
}

function TableRow({
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
            style={{ transition: 'background 0.1s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
            <td style={{ ...tdStyle, padding: '2px 4px', width: '28px' }}>
                <span style={dragHandleStyle}>::</span>
            </td>

            <td style={{ ...rowNumStyle, width: '24px' }}>{lineIdx + 1}</td>

            {relCol && (
                <td style={tdRelation}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
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
                <td key={col.key} style={{ ...tdStyle, padding: '2px 6px' }}>
                    <CellRenderer
                        col={col}
                        value={line.values?.[col.key]}
                        line={line}
                        onChange={(key, val) => onCellChange(lineIdx, key, val)}
                    />
                </td>
            ))}

            <td style={{ ...tdStyle, padding: '2px 4px', textAlign: 'center', width: '36px' }}>
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
