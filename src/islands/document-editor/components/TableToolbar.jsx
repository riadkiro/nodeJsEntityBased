/**
 * TableToolbar - Floating toolbar for table management in the document editor
 * 
 * Features:
 * - Add/remove rows and columns  
 * - Cell background color
 * - Table style presets
 * - Appears when user clicks inside a table
 * 
 * Must be rendered inside each page wrapper (position:relative parent)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'

// ── Color palette for cell backgrounds ──
const CELL_COLORS = [
    null, '#f3f4f6', '#fef3c7', '#fee2e2', '#dcfce7', '#dbeafe',
    '#e0e7ff', '#ede9fe', '#fce7f3', '#ecfdf5', '#fff7ed',
    '#f5f3ff', '#fdf2f8', '#f0f9ff', '#f0fdf4', '#fffbeb'
]

// ── Table style presets ──
const TABLE_STYLES = [
    {
        key: 'simple',
        label: 'Simple',
        headerBg: '#f3f4f6',
        headerColor: '#1f2937',
        borderColor: '#d1d5db',
        stripedBg: null,
        headerBorder: '1px solid #d1d5db'
    },
    {
        key: 'professional',
        label: 'Professionnel',
        headerBg: '#1f2937',
        headerColor: '#ffffff',
        borderColor: '#e5e7eb',
        stripedBg: '#f9fafb',
        headerBorder: '1px solid #1f2937'
    },
    {
        key: 'modern',
        label: 'Moderne',
        headerBg: '#4f46e5',
        headerColor: '#ffffff',
        borderColor: '#c7d2fe',
        stripedBg: '#eef2ff',
        headerBorder: '1px solid #4f46e5'
    },
    {
        key: 'minimal',
        label: 'Minimal',
        headerBg: 'transparent',
        headerColor: '#374151',
        borderColor: '#e5e7eb',
        stripedBg: null,
        headerBorder: '2px solid #374151'
    },
    {
        key: 'colorful',
        label: 'Coloré',
        headerBg: '#0ea5e9',
        headerColor: '#ffffff',
        borderColor: '#bae6fd',
        stripedBg: '#f0f9ff',
        headerBorder: '1px solid #0ea5e9'
    }
]

/**
 * useTableToolbar hook — manages table toolbar state for a contenteditable element
 * 
 * @param {React.RefObject} contentRef - ref to the contenteditable div
 * @param {Function} onSave - callback to trigger save after modifications
 * @returns {{ activeTable, activeCell, toolbarPos, clearToolbar, onSave }}
 */
export function useTableToolbar(contentRef, onSave) {
    const [activeTable, setActiveTable] = useState(null)
    const [activeCell, setActiveCell] = useState(null)
    const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
        // Use a small delay to ensure the contenteditable ref is populated after render
        const timerId = setTimeout(() => {
            const el = contentRef?.current
            if (!el) return

            function handleClick(e) {
                const cell = e.target.closest('td, th')
                const table = e.target.closest('table')

                if (cell && table && el.contains(table)) {
                    setActiveTable(table)
                    setActiveCell(cell)

                    // Position toolbar above the table, relative to the page wrapper
                    const pageWrapper = el.parentElement
                    const tableRect = table.getBoundingClientRect()
                    const wrapperRect = pageWrapper.getBoundingClientRect()

                    // Detect zoom
                    let zoom = 1
                    const scaledAncestor = el.closest('[style*="scale"]')
                    if (scaledAncestor) {
                        const match = scaledAncestor.style.transform?.match(/scale\(([\d.]+)\)/)
                        if (match) zoom = parseFloat(match[1])
                    }

                    const rawTop = (tableRect.top - wrapperRect.top) / zoom - 44
                    setToolbarPos({
                        top: Math.max(0, rawTop),
                        left: (tableRect.left - wrapperRect.left) / zoom
                    })
                } else {
                    setActiveTable(null)
                    setActiveCell(null)
                }
            }

            el.addEventListener('click', handleClick)
            // Store cleanup on the ref so we can remove it
            el._tableToolbarCleanup = () => el.removeEventListener('click', handleClick)
        }, 50)

        return () => {
            clearTimeout(timerId)
            const el = contentRef?.current
            if (el?._tableToolbarCleanup) {
                el._tableToolbarCleanup()
                delete el._tableToolbarCleanup
            }
        }
    }, []) // Run once on mount

    const clearToolbar = useCallback(() => {
        setActiveTable(null)
        setActiveCell(null)
    }, [])

    return { activeTable, activeCell, toolbarPos, clearToolbar, onSave }
}

/**
 * TableToolbar component — renders the floating toolbar
 */
export default function TableToolbar({ activeTable, activeCell, toolbarPos, clearToolbar, onSave }) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showStylePicker, setShowStylePicker] = useState(false)

    // Close pickers when table changes
    useEffect(() => {
        setShowColorPicker(false)
        setShowStylePicker(false)
    }, [activeTable, activeCell])

    // ── Helpers ──
    const getColIndex = useCallback(() => {
        if (!activeCell) return -1
        return Array.from(activeCell.parentElement.children).indexOf(activeCell)
    }, [activeCell])

    const getColCount = useCallback(() => {
        if (!activeTable) return 0
        const firstRow = activeTable.querySelector('tr')
        return firstRow ? firstRow.children.length : 0
    }, [activeTable])

    const getCellStyle = useCallback(() => {
        if (!activeTable) return ''
        const firstTd = activeTable.querySelector('tbody td') || activeTable.querySelector('td')
        return firstTd?.getAttribute('style') || ''
    }, [activeTable])

    const getHeaderStyle = useCallback(() => {
        if (!activeTable) return ''
        const firstTh = activeTable.querySelector('thead th') || activeTable.querySelector('th')
        return firstTh?.getAttribute('style') || ''
    }, [activeTable])

    // ── Row operations ──
    const addRowBelow = useCallback(() => {
        if (!activeTable || !activeCell) return
        const cols = getColCount()
        const row = activeCell.parentElement

        const newRow = document.createElement('tr')
        for (let i = 0; i < cols; i++) {
            const td = document.createElement('td')
            td.style.cssText = getCellStyle()
            td.innerHTML = '&nbsp;'
            newRow.appendChild(td)
        }

        if (row.nextSibling) {
            row.parentNode.insertBefore(newRow, row.nextSibling)
        } else {
            let tbody = activeTable.querySelector('tbody')
            if (!tbody) {
                tbody = document.createElement('tbody')
                activeTable.appendChild(tbody)
            }
            tbody.appendChild(newRow)
        }
        onSave?.()
    }, [activeTable, activeCell, getColCount, getCellStyle, onSave])

    const addRowAbove = useCallback(() => {
        if (!activeTable || !activeCell) return
        const cols = getColCount()
        const row = activeCell.parentElement

        const newRow = document.createElement('tr')
        for (let i = 0; i < cols; i++) {
            const td = document.createElement('td')
            td.style.cssText = getCellStyle()
            td.innerHTML = '&nbsp;'
            newRow.appendChild(td)
        }

        row.parentNode.insertBefore(newRow, row)
        onSave?.()
    }, [activeTable, activeCell, getColCount, getCellStyle, onSave])

    const deleteRow = useCallback(() => {
        if (!activeTable || !activeCell) return
        const row = activeCell.parentElement
        const allRows = activeTable.querySelectorAll('tr')
        if (allRows.length <= 1) return

        row.remove()
        clearToolbar()
        onSave?.()
    }, [activeTable, activeCell, clearToolbar, onSave])

    // ── Column operations ──
    const addColumnRight = useCallback(() => {
        if (!activeTable || !activeCell) return
        const colIdx = getColIndex()
        const rows = activeTable.querySelectorAll('tr')

        rows.forEach(row => {
            const cells = row.children
            const isHeader = row.parentElement.tagName === 'THEAD'
            const newCell = document.createElement(isHeader ? 'th' : 'td')
            newCell.style.cssText = isHeader ? getHeaderStyle() : getCellStyle()
            newCell.innerHTML = isHeader ? 'Colonne' : '&nbsp;'

            if (colIdx + 1 < cells.length) {
                row.insertBefore(newCell, cells[colIdx + 1])
            } else {
                row.appendChild(newCell)
            }
        })
        onSave?.()
    }, [activeTable, activeCell, getColIndex, getCellStyle, getHeaderStyle, onSave])

    const addColumnLeft = useCallback(() => {
        if (!activeTable || !activeCell) return
        const colIdx = getColIndex()
        const rows = activeTable.querySelectorAll('tr')

        rows.forEach(row => {
            const cells = row.children
            const isHeader = row.parentElement.tagName === 'THEAD'
            const newCell = document.createElement(isHeader ? 'th' : 'td')
            newCell.style.cssText = isHeader ? getHeaderStyle() : getCellStyle()
            newCell.innerHTML = isHeader ? 'Colonne' : '&nbsp;'

            row.insertBefore(newCell, cells[colIdx])
        })
        onSave?.()
    }, [activeTable, activeCell, getColIndex, getCellStyle, getHeaderStyle, onSave])

    const deleteColumn = useCallback(() => {
        if (!activeTable || !activeCell) return
        const colIdx = getColIndex()
        const cols = getColCount()
        if (cols <= 1) return

        const rows = activeTable.querySelectorAll('tr')
        rows.forEach(row => {
            if (row.children[colIdx]) {
                row.children[colIdx].remove()
            }
        })

        clearToolbar()
        onSave?.()
    }, [activeTable, activeCell, getColIndex, getColCount, clearToolbar, onSave])

    // ── Cell color ──
    const setCellBackground = useCallback((color) => {
        if (!activeCell) return
        if (color) {
            activeCell.style.backgroundColor = color
        } else {
            activeCell.style.removeProperty('background-color')
        }
        setShowColorPicker(false)
        onSave?.()
    }, [activeCell, onSave])

    // ── Table style preset ──
    const applyTableStyle = useCallback((style) => {
        if (!activeTable) return

        const headers = activeTable.querySelectorAll('thead th, thead td')
        headers.forEach(th => {
            th.style.backgroundColor = style.headerBg
            th.style.color = style.headerColor
            th.style.border = style.headerBorder
            th.style.padding = '8px 12px'
            th.style.fontWeight = '600'
            th.style.fontSize = '14px'
            th.style.textAlign = 'left'
        })

        const cells = activeTable.querySelectorAll('tbody td')
        cells.forEach(td => {
            td.style.border = `1px solid ${style.borderColor}`
            td.style.padding = '8px 12px'
            td.style.fontSize = '14px'

            if (style.stripedBg) {
                const row = td.parentElement
                const rowIdx = Array.from(row.parentElement.children).indexOf(row)
                td.style.backgroundColor = rowIdx % 2 === 1 ? style.stripedBg : ''
            } else {
                td.style.removeProperty('background-color')
            }
        })

        setShowStylePicker(false)
        onSave?.()
    }, [activeTable, onSave])

    // ── Don't render if no active table ──
    if (!activeTable) return null

    return (
        <div
            className="table-toolbar-root"
            style={{
                position: 'absolute',
                top: `${toolbarPos.top}px`,
                left: `${toolbarPos.left}px`,
                zIndex: 100,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                animation: 'tt-fade-in 0.15s ease-out',
                pointerEvents: 'auto'
            }}
            onMouseDown={(e) => e.preventDefault()}
        >
            {/* Row operations */}
            <TtBtn icon="tabler:row-insert-top" title="Ajouter ligne au-dessus" onClick={addRowAbove} />
            <TtBtn icon="tabler:row-insert-bottom" title="Ajouter ligne en-dessous" onClick={addRowBelow} />
            <TtBtn icon="tabler:row-remove" title="Supprimer la ligne" onClick={deleteRow} danger />

            <TtSep />

            {/* Column operations */}
            <TtBtn icon="tabler:column-insert-left" title="Ajouter colonne à gauche" onClick={addColumnLeft} />
            <TtBtn icon="tabler:column-insert-right" title="Ajouter colonne à droite" onClick={addColumnRight} />
            <TtBtn icon="tabler:column-remove" title="Supprimer la colonne" onClick={deleteColumn} danger />

            <TtSep />

            {/* Cell Background Color */}
            <div style={{ position: 'relative' }}>
                <TtBtn
                    icon="tabler:paint"
                    title="Couleur de cellule"
                    onClick={() => { setShowColorPicker(!showColorPicker); setShowStylePicker(false) }}
                    active={showColorPicker}
                />
                {showColorPicker && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: '6px',
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                            padding: '8px',
                            zIndex: 110,
                            width: '140px'
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <p style={{ fontSize: '10px', color: '#6b7280', margin: '0 0 6px', fontWeight: 600 }}>Fond de cellule</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px' }}>
                            {CELL_COLORS.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCellBackground(c)}
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '4px',
                                        border: !c ? '2px dashed #d1d5db' : '1px solid #e5e7eb',
                                        background: c || '#fff',
                                        cursor: 'pointer',
                                        transition: 'transform 0.1s'
                                    }}
                                    title={c || 'Aucune couleur'}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.15)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Table Style Presets */}
            <div style={{ position: 'relative' }}>
                <TtBtn
                    icon="tabler:palette"
                    title="Styles de tableau"
                    onClick={() => { setShowStylePicker(!showStylePicker); setShowColorPicker(false) }}
                    active={showStylePicker}
                />
                {showStylePicker && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '6px',
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                            padding: '8px',
                            zIndex: 110,
                            width: '180px'
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <p style={{ fontSize: '10px', color: '#6b7280', margin: '0 0 6px', fontWeight: 600 }}>Style du tableau</p>
                        {TABLE_STYLES.map(style => (
                            <button
                                key={style.key}
                                onClick={() => applyTableStyle(style)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '6px 8px',
                                    border: 'none',
                                    background: 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#374151',
                                    transition: 'background 0.1s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Mini preview */}
                                <div style={{
                                    width: '28px',
                                    height: '20px',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                    border: `1px solid ${style.borderColor}`,
                                    flexShrink: 0
                                }}>
                                    <div style={{
                                        height: '8px',
                                        background: style.headerBg,
                                        borderBottom: `1px solid ${style.borderColor}`
                                    }} />
                                    <div style={{
                                        height: '6px',
                                        background: style.stripedBg || '#fff'
                                    }} />
                                    <div style={{
                                        height: '6px',
                                        background: '#fff'
                                    }} />
                                </div>
                                <span>{style.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Inline animation styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes tt-fade-in {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            ` }} />
        </div>
    )
}

// ── Toolbar Button ──
function TtBtn({ icon, title, onClick, danger = false, active = false }) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                background: active ? '#eef2ff' : 'transparent',
                color: danger ? '#dc2626' : (active ? '#4f46e5' : '#374151'),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = danger ? '#fef2f2' : '#f3f4f6'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = active ? '#eef2ff' : 'transparent'
            }}
        >
            <iconify-icon icon={icon} width="16"></iconify-icon>
        </button>
    )
}

// ── Separator ──
function TtSep() {
    return <div style={{ width: '1px', height: '20px', background: '#e5e7eb', margin: '0 2px' }} />
}
