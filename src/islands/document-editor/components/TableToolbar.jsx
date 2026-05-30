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
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getPaginatedTableFragments, syncPaginatedTableFragmentStyles } from '../utils/paginationUtils'

// ── Column resize logic ──
const MIN_COLUMN_WIDTH = 48
const EDITOR_HISTORY_EVENT = 'dexio:document-editor-before-mutation'

function requestEditorUndoCheckpoint(label) {
    window.dispatchEvent(new CustomEvent(EDITOR_HISTORY_EVENT, { detail: { label } }))
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

function parseTransformScale(transform) {
    if (!transform || transform === 'none') return null

    const scaleMatch = transform.match(/scale\(([\d.]+)\)/)
    if (scaleMatch) return parseFloat(scaleMatch[1])

    const matrixMatch = transform.match(/^matrix\(([^,]+)/)
    if (matrixMatch) return parseFloat(matrixMatch[1])

    return null
}

function readElementScale(el) {
    let zoom = 1
    let current = el

    while (current && current.nodeType === 1) {
        const inlineScale = parseTransformScale(current.style?.transform || '')
        const computedScale = parseTransformScale(window.getComputedStyle?.(current)?.transform || '')
        const scale = inlineScale || computedScale

        if (Number.isFinite(scale) && scale > 0) {
            zoom *= scale
        }

        current = current.parentElement
    }

    return Number.isFinite(zoom) && zoom > 0 ? zoom : 1
}

function getEditorZoom(el) {
    return readElementScale(el)
}

function getEditorContext(table) {
    const editor = table?.closest?.('[contenteditable="true"]')
    const wrapper = editor?.parentElement || table?.parentElement
    if (!table || !editor || !wrapper) return null

    const zoom = getEditorZoom(editor)
    return {
        editor,
        wrapper,
        zoom,
        wrapperRect: wrapper.getBoundingClientRect()
    }
}

function getSizingRow(table) {
    return table?.querySelector?.('tbody tr') ||
        Array.from(table?.querySelectorAll?.('tr') || []).find(row => row.offsetHeight > 0) ||
        table?.querySelector?.('tr') ||
        null
}

function getColumnCells(table, index) {
    return Array.from(table?.querySelectorAll?.('tr') || [])
        .map(row => row.children?.[index])
        .filter(Boolean)
}

function getColumnWidths(table) {
    const row = getSizingRow(table)
    if (!row) return []

    const ctx = getEditorContext(table)
    const zoom = ctx?.zoom || 1
    return Array.from(row.children || []).map(cell => (
        cell.offsetWidth || (cell.getBoundingClientRect().width / zoom) || MIN_COLUMN_WIDTH
    ))
}

function getDirectColGroup(table) {
    return Array.from(table?.children || []).find(child => child.tagName === 'COLGROUP') || null
}

function ensureColGroup(table, count) {
    let colgroup = getDirectColGroup(table)
    if (!colgroup) {
        colgroup = document.createElement('colgroup')
        table.insertBefore(colgroup, table.firstChild)
    }

    while (colgroup.children.length < count) {
        colgroup.appendChild(document.createElement('col'))
    }
    while (colgroup.children.length > count) {
        colgroup.lastElementChild?.remove()
    }

    return colgroup
}

function prepareTableForResize(table, widths = null, tableWidth = null) {
    if (!table) return []

    const nextWidths = widths || getColumnWidths(table)
    const nextTableWidth = tableWidth || table.offsetWidth || nextWidths.reduce((sum, width) => sum + width, 0)
    table.style.tableLayout = 'fixed'
    table.style.width = `${Math.max(1, nextTableWidth)}px`
    table.style.maxWidth = '100%'

    const colgroup = ensureColGroup(table, nextWidths.length)
    nextWidths.forEach((width, index) => {
        const col = colgroup.children[index]
        if (col) col.style.width = `${Math.max(MIN_COLUMN_WIDTH, width)}px`
        getColumnCells(table, index).forEach(cell => {
            cell.style.removeProperty('width')
            cell.style.removeProperty('min-width')
            cell.style.removeProperty('max-width')
        })
    })

    return nextWidths
}

function buildResizeOverlay(table) {
    const ctx = getEditorContext(table)
    const row = getSizingRow(table)
    if (!ctx || !row) return null

    const tableRect = table.getBoundingClientRect()
    const top = (tableRect.top - ctx.wrapperRect.top) / ctx.zoom
    const height = tableRect.height / ctx.zoom
    const left = (tableRect.left - ctx.wrapperRect.left) / ctx.zoom
    const right = (tableRect.right - ctx.wrapperRect.left) / ctx.zoom
    const cells = Array.from(row.children || [])
    const handles = []

    cells.slice(0, -1).forEach((cell, index) => {
        const rect = cell.getBoundingClientRect()
        handles.push({
            type: 'column',
            index,
            left: (rect.right - ctx.wrapperRect.left) / ctx.zoom,
            top,
            height
        })
    })

    handles.push({
        type: 'table',
        index: Math.max(0, cells.length - 1),
        left: right,
        top,
        height
    })

    return {
        top,
        left,
        width: right - left,
        height,
        handles
    }
}

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
    const [contextMenu, setContextMenu] = useState(null)

    const getEditorZoom = useCallback((el) => readElementScale(el), [])

    const positionToolbarForTable = useCallback((table) => {
        const el = contentRef?.current
        if (!el || !table) return

        const pageWrapper = el.parentElement
        const tableRect = table.getBoundingClientRect()
        const wrapperRect = pageWrapper.getBoundingClientRect()
        const zoom = getEditorZoom(el)
        const rawTop = (tableRect.top - wrapperRect.top) / zoom - 44

        setToolbarPos({
            top: Math.max(0, rawTop),
            left: (tableRect.left - wrapperRect.left) / zoom
        })
    }, [contentRef, getEditorZoom])

    const getLocalPoint = useCallback((event) => {
        const el = contentRef?.current
        const pageWrapper = el?.parentElement
        if (!el || !pageWrapper || !event) return null

        const wrapperRect = pageWrapper.getBoundingClientRect()
        const zoom = getEditorZoom(el)
        return {
            x: (event.clientX - wrapperRect.left) / zoom,
            y: (event.clientY - wrapperRect.top) / zoom
        }
    }, [contentRef, getEditorZoom])

    const selectTable = useCallback((table, cell = null, event = null) => {
        const el = contentRef?.current
        if (!el || !table || !el.contains(table)) return

        const selectedCell = cell || table.querySelector('td, th')
        setActiveTable(table)
        setActiveCell(selectedCell)
        positionToolbarForTable(table)

        if (event) {
            const point = getLocalPoint(event) || { x: event.clientX, y: event.clientY }
            setContextMenu({
                x: point.x,
                y: point.y,
                table,
                cell: selectedCell
            })
        }
    }, [contentRef, getLocalPoint, positionToolbarForTable])

    useEffect(() => {
        // Use a small delay to ensure the contenteditable ref is populated after render
        const timerId = setTimeout(() => {
            const el = contentRef?.current
            if (!el) return

            function handleClick(e) {
                const cell = e.target.closest('td, th')
                const table = e.target.closest('table')

                if (cell && table && el.contains(table)) {
                    setContextMenu(null)
                    selectTable(table, cell)
                } else {
                    setActiveTable(null)
                    setActiveCell(null)
                    setContextMenu(null)
                }
            }

            function handleContextMenu(e) {
                const table = e.target.closest('table')
                if (!table || !el.contains(table)) return

                const cell = e.target.closest('td, th')
                e.preventDefault()
                e.stopPropagation()
                selectTable(table, cell && table.contains(cell) ? cell : null, e)
            }

            function handleDocumentMouseDown(e) {
                if (e.target.closest?.('[data-table-context-menu]')) return
                setContextMenu(null)
            }

            function handleDocumentKeyDown(e) {
                if (e.key === 'Escape') setContextMenu(null)
            }

            el.addEventListener('click', handleClick)
            el.addEventListener('contextmenu', handleContextMenu)
            document.addEventListener('mousedown', handleDocumentMouseDown)
            document.addEventListener('keydown', handleDocumentKeyDown)
            // Store cleanup on the ref so we can remove it
            el._tableToolbarCleanup = () => {
                el.removeEventListener('click', handleClick)
                el.removeEventListener('contextmenu', handleContextMenu)
                document.removeEventListener('mousedown', handleDocumentMouseDown)
                document.removeEventListener('keydown', handleDocumentKeyDown)
            }
        }, 50)

        return () => {
            clearTimeout(timerId)
            const el = contentRef?.current
            if (el?._tableToolbarCleanup) {
                el._tableToolbarCleanup()
                delete el._tableToolbarCleanup
            }
        }
    }, [contentRef, selectTable])

    const clearToolbar = useCallback(() => {
        setActiveTable(null)
        setActiveCell(null)
        setContextMenu(null)
    }, [])

    const closeContextMenu = useCallback(() => {
        setContextMenu(null)
    }, [])

    return { activeTable, activeCell, toolbarPos, contextMenu, selectTable, clearToolbar, closeContextMenu, onSave }
}

/**
 * TableToolbar component — renders the floating toolbar
 */
export default function TableToolbar({ activeTable, activeCell, toolbarPos, contextMenu, closeContextMenu, clearToolbar, onSave }) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showStylePicker, setShowStylePicker] = useState(false)
    const [resizeOverlay, setResizeOverlay] = useState(null)
    const [draggingHandle, setDraggingHandle] = useState(null)
    const resizeRafRef = useRef(null)

    const updateResizeOverlay = useCallback(() => {
        if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current)
        resizeRafRef.current = requestAnimationFrame(() => {
            resizeRafRef.current = null
            setResizeOverlay(activeTable ? buildResizeOverlay(activeTable) : null)
        })
    }, [activeTable])

    // Close pickers when table changes and keep resize handles aligned to the table.
    useEffect(() => {
        setShowColorPicker(false)
        setShowStylePicker(false)
        updateResizeOverlay()

        if (!activeTable) {
            setResizeOverlay(null)
            return undefined
        }

        let observer = null
        if (window.ResizeObserver) {
            observer = new ResizeObserver(updateResizeOverlay)
            observer.observe(activeTable)
            const editor = activeTable.closest?.('[contenteditable="true"]')
            if (editor) observer.observe(editor)
        }

        window.addEventListener('resize', updateResizeOverlay)
        window.addEventListener('scroll', updateResizeOverlay, true)

        return () => {
            if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current)
            resizeRafRef.current = null
            observer?.disconnect?.()
            window.removeEventListener('resize', updateResizeOverlay)
            window.removeEventListener('scroll', updateResizeOverlay, true)
        }
    }, [activeTable, activeCell, updateResizeOverlay])

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

    const getLinkedTables = useCallback(() => {
        if (!activeTable) return []
        return getPaginatedTableFragments(activeTable, activeTable.ownerDocument)
    }, [activeTable])

    const cleanTableRuntimeArtifacts = useCallback((table) => {
        table.querySelectorAll('.doc-block-delete-btn, .tt-col-resize-handle, .tt-table-resize-handle, [data-atomic-caret]').forEach(node => node.remove())
        table.removeAttribute('data-table-selected')
        table.removeAttribute('data-paginated-table-key')
        table.removeAttribute('data-paginated-table-fragment')
        table.removeAttribute('data-paginated-table-continuation')
        if (table.tHead?.style.display === 'none') table.tHead.style.removeProperty('display')
        return table
    }, [])

    const beginResize = useCallback((handle, event) => {
        if (!activeTable || !handle) return
        event.preventDefault()
        event.stopPropagation()

        const ctx = getEditorContext(activeTable)
        if (!ctx) return

        const linkedTables = getLinkedTables().filter(Boolean)
        const startWidths = prepareTableForResize(activeTable)
        if (!startWidths.length) return

        const startTableWidth = activeTable.offsetWidth || startWidths.reduce((sum, width) => sum + width, 0)
        linkedTables.forEach(table => prepareTableForResize(table, startWidths, startTableWidth))

        const startX = event.clientX
        const tableMaxWidth = Math.max(startTableWidth, ctx.editor.clientWidth || startTableWidth)
        const lastColumnIndex = startWidths.length - 1
        const otherColumnsWidth = startWidths
            .slice(0, -1)
            .reduce((sum, width) => sum + width, 0)
        const minTableWidth = Math.max(120, otherColumnsWidth + MIN_COLUMN_WIDTH)

        setDraggingHandle(handle)
        document.body.style.cursor = handle.type === 'table' ? 'ew-resize' : 'col-resize'
        document.body.style.userSelect = 'none'

        const applyResize = (moveEvent) => {
            const diff = (moveEvent.clientX - startX) / ctx.zoom
            const nextWidths = [...startWidths]
            let nextTableWidth = startTableWidth

            if (handle.type === 'table') {
                nextTableWidth = clamp(startTableWidth + diff, minTableWidth, tableMaxWidth)
                nextWidths[lastColumnIndex] = Math.max(
                    MIN_COLUMN_WIDTH,
                    startWidths[lastColumnIndex] + (nextTableWidth - startTableWidth)
                )
            } else {
                const leftIndex = handle.index
                const rightIndex = leftIndex + 1
                const pairWidth = startWidths[leftIndex] + startWidths[rightIndex]
                const nextLeft = clamp(startWidths[leftIndex] + diff, MIN_COLUMN_WIDTH, pairWidth - MIN_COLUMN_WIDTH)

                nextWidths[leftIndex] = nextLeft
                nextWidths[rightIndex] = pairWidth - nextLeft
            }

            linkedTables.forEach(table => prepareTableForResize(table, nextWidths, nextTableWidth))
            updateResizeOverlay()
        }

        const finishResize = () => {
            document.removeEventListener('mousemove', applyResize)
            document.removeEventListener('mouseup', finishResize)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            setDraggingHandle(null)
            syncPaginatedTableFragmentStyles(activeTable, activeTable.ownerDocument)
            updateResizeOverlay()
            onSave?.({ inputType: 'tableResize' })
        }

        document.addEventListener('mousemove', applyResize)
        document.addEventListener('mouseup', finishResize)
    }, [activeTable, getLinkedTables, onSave, updateResizeOverlay])

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

        requestEditorUndoCheckpoint('delete-table-row')
        row.remove()
        clearToolbar()
        onSave?.()
    }, [activeTable, activeCell, clearToolbar, onSave])

    // ── Column operations ──
    const insertColumn = useCallback((side) => {
        if (!activeTable || !activeCell) return
        const colIdx = getColIndex()
        const insertAfter = side === 'right'

        getLinkedTables().forEach(table => {
            const rows = table.querySelectorAll('tr')
            rows.forEach(row => {
                const cells = row.children
                const isHeader = row.parentElement.tagName === 'THEAD'
                const newCell = document.createElement(isHeader ? 'th' : 'td')
                const referenceCell = cells[colIdx] || cells[cells.length - 1]
                newCell.style.cssText = referenceCell?.getAttribute('style') || (isHeader ? getHeaderStyle() : getCellStyle())
                newCell.innerHTML = isHeader ? 'Colonne' : '&nbsp;'

                const targetIndex = insertAfter ? colIdx + 1 : colIdx
                if (targetIndex < cells.length) {
                    row.insertBefore(newCell, cells[targetIndex])
                } else {
                    row.appendChild(newCell)
                }
            })
        })
        syncPaginatedTableFragmentStyles(activeTable, activeTable.ownerDocument)
        onSave?.()
    }, [activeTable, activeCell, getColIndex, getCellStyle, getHeaderStyle, getLinkedTables, onSave])

    const addColumnRight = useCallback(() => {
        insertColumn('right')
    }, [insertColumn])

    const addColumnLeft = useCallback(() => {
        insertColumn('left')
    }, [insertColumn])

    const deleteColumn = useCallback(() => {
        if (!activeTable || !activeCell) return
        const colIdx = getColIndex()
        const cols = getColCount()
        if (cols <= 1) return

        requestEditorUndoCheckpoint('delete-table-column')
        getLinkedTables().forEach(table => {
            const rows = table.querySelectorAll('tr')
            rows.forEach(row => {
                if (row.children[colIdx]) {
                    row.children[colIdx].remove()
                }
            })
        })
        syncPaginatedTableFragmentStyles(activeTable, activeTable.ownerDocument)

        clearToolbar()
        onSave?.()
    }, [activeTable, activeCell, getColIndex, getColCount, getLinkedTables, clearToolbar, onSave])

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

    // ── Cell text alignment ──
    const setCellAlign = useCallback((align) => {
        if (!activeCell) return
        activeCell.style.textAlign = align
        onSave?.()
    }, [activeCell, onSave])

    // ── Table style preset ──
    const applyTableStyle = useCallback((style) => {
        if (!activeTable) return

        const tables = getPaginatedTableFragments(activeTable, activeTable.ownerDocument)
        tables.forEach(table => {
            const headers = table.querySelectorAll('thead th, thead td')
            headers.forEach(th => {
                th.style.backgroundColor = style.headerBg
                th.style.color = style.headerColor
                th.style.border = style.headerBorder
                th.style.padding = '8px 12px'
                th.style.fontWeight = '600'
                th.style.fontSize = '14px'
                th.style.textAlign = 'left'
            })

            const cells = table.querySelectorAll('tbody td')
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
        })
        syncPaginatedTableFragmentStyles(activeTable, activeTable.ownerDocument)

        setShowStylePicker(false)
        onSave?.()
    }, [activeTable, onSave])

    const buildLogicalTableClone = useCallback(() => {
        if (!activeTable) return null

        const tables = getLinkedTables()
        const source = tables[0] || activeTable
        const clone = cleanTableRuntimeArtifacts(source.cloneNode(true))

        if (tables.length > 1) {
            let targetBody = clone.tBodies?.[0]
            if (!targetBody) {
                targetBody = document.createElement('tbody')
                clone.appendChild(targetBody)
            }
            targetBody.innerHTML = ''
            tables.forEach(table => {
                Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
                    targetBody.appendChild(row.cloneNode(true))
                })
            })

            const lastFooter = tables.findLast?.(table => table.tFoot) || [...tables].reverse().find(table => table.tFoot)
            if (clone.tFoot) clone.tFoot.remove()
            if (lastFooter?.tFoot) clone.appendChild(lastFooter.tFoot.cloneNode(true))
        }

        return clone
    }, [activeTable, cleanTableRuntimeArtifacts, getLinkedTables])

    const copyTable = useCallback(async () => {
        const clone = buildLogicalTableClone()
        if (!clone) return

        const html = clone.outerHTML
        const text = clone.textContent || ''

        try {
            if (navigator.clipboard?.write && window.ClipboardItem) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': new Blob([html], { type: 'text/html' }),
                        'text/plain': new Blob([text], { type: 'text/plain' })
                    })
                ])
            } else {
                const holder = document.createElement('div')
                holder.contentEditable = 'true'
                holder.style.cssText = 'position:fixed;left:-10000px;top:-10000px;'
                holder.innerHTML = html
                document.body.appendChild(holder)

                const selection = window.getSelection()
                const range = document.createRange()
                range.selectNodeContents(holder)
                selection.removeAllRanges()
                selection.addRange(range)
                document.execCommand('copy')
                selection.removeAllRanges()
                holder.remove()
            }
        } catch (err) {
            console.warn('[TableToolbar] Table copy failed:', err)
        }
    }, [buildLogicalTableClone])

    const duplicateTable = useCallback(() => {
        if (!activeTable) return
        const clone = buildLogicalTableClone()
        if (!clone) return

        const tables = getLinkedTables()
        const anchor = tables[tables.length - 1] || activeTable
        anchor.insertAdjacentElement('afterend', clone)
        closeContextMenu?.()
        onSave?.()
    }, [activeTable, buildLogicalTableClone, closeContextMenu, getLinkedTables, onSave])

    const deleteTable = useCallback(() => {
        if (!activeTable) return
        requestEditorUndoCheckpoint('delete-table')
        getLinkedTables().forEach(table => table.remove())
        clearToolbar?.()
        onSave?.()
    }, [activeTable, clearToolbar, getLinkedTables, onSave])

    const runContextAction = useCallback((action) => {
        closeContextMenu?.()
        action?.()
    }, [closeContextMenu])

    // ── Don't render if no active table ──
    if (!activeTable) return null

    return (
        <>
        {resizeOverlay?.handles?.map((handle) => {
            const isTableHandle = handle.type === 'table'
            const isDragging =
                draggingHandle?.type === handle.type &&
                draggingHandle?.index === handle.index
            const key = `${handle.type}-${handle.index}`

            return (
                <div
                    key={key}
                    className={isTableHandle ? 'tt-table-resize-handle' : 'tt-col-resize-handle'}
                    data-col-index={handle.index}
                    title={isTableHandle ? 'Redimensionner le tableau' : 'Redimensionner la colonne'}
                    style={{
                        position: 'absolute',
                        top: `${handle.top}px`,
                        left: `${handle.left - (isTableHandle ? 5 : 4)}px`,
                        width: isTableHandle ? '10px' : '8px',
                        height: `${handle.height}px`,
                        zIndex: 130,
                        cursor: isTableHandle ? 'ew-resize' : 'col-resize',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'stretch',
                        pointerEvents: 'auto'
                    }}
                    onMouseDown={(event) => beginResize(handle, event)}
                    onMouseEnter={(event) => {
                        const line = event.currentTarget.firstElementChild
                        if (line) line.style.background = '#4f46e5'
                    }}
                    onMouseLeave={(event) => {
                        if (isDragging) return
                        const line = event.currentTarget.firstElementChild
                        if (line) line.style.background = 'transparent'
                    }}
                >
                    <div
                        style={{
                            width: isTableHandle ? '3px' : '2px',
                            height: '100%',
                            borderRadius: '2px',
                            background: isDragging ? '#4f46e5' : 'transparent',
                            boxShadow: isDragging ? '0 0 0 1px rgba(79, 70, 229, 0.18)' : 'none'
                        }}
                    />
                </div>
            )
        })}
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

            {/* Cell Text Alignment */}
            <TtBtn icon="tabler:align-left" title="Aligner à gauche" onClick={() => setCellAlign('left')} />
            <TtBtn icon="tabler:align-center" title="Centrer" onClick={() => setCellAlign('center')} />
            <TtBtn icon="tabler:align-right" title="Aligner à droite" onClick={() => setCellAlign('right')} />

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
        {contextMenu && (
            <div
                data-table-context-menu="1"
                style={{
                    position: 'absolute',
                    top: `${contextMenu.y}px`,
                    left: `${contextMenu.x}px`,
                    zIndex: 10000,
                    minWidth: '210px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                }}
                onMouseDown={(e) => e.preventDefault()}
            >
                <ContextMenuButton icon="tabler:row-insert-top" label="Ligne au-dessus" onClick={() => runContextAction(addRowAbove)} />
                <ContextMenuButton icon="tabler:row-insert-bottom" label="Ligne en-dessous" onClick={() => runContextAction(addRowBelow)} />
                <ContextMenuButton icon="tabler:row-remove" label="Supprimer la ligne" danger onClick={() => runContextAction(deleteRow)} />
                <ContextMenuSeparator />
                <ContextMenuButton icon="tabler:column-insert-left" label="Colonne à gauche" onClick={() => runContextAction(addColumnLeft)} />
                <ContextMenuButton icon="tabler:column-insert-right" label="Colonne à droite" onClick={() => runContextAction(addColumnRight)} />
                <ContextMenuButton icon="tabler:column-remove" label="Supprimer la colonne" danger onClick={() => runContextAction(deleteColumn)} />
                <ContextMenuSeparator />
                <ContextMenuButton icon="tabler:copy" label="Copier le tableau" onClick={() => runContextAction(copyTable)} />
                <ContextMenuButton icon="tabler:copy-plus" label="Dupliquer le tableau" onClick={() => runContextAction(duplicateTable)} />
                <ContextMenuButton icon="tabler:trash" label="Supprimer le tableau" danger onClick={() => runContextAction(deleteTable)} />
            </div>
        )}
        </>
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

function ContextMenuButton({ icon, label, onClick, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                width: '100%',
                height: '30px',
                border: 'none',
                borderRadius: '6px',
                padding: '0 9px',
                background: 'transparent',
                color: danger ? '#dc2626' : '#1f2937',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                textAlign: 'left'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = danger ? '#fef2f2' : '#f3f4f6'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
            }}
        >
            <iconify-icon icon={icon} width="15"></iconify-icon>
            <span>{label}</span>
        </button>
    )
}

function ContextMenuSeparator() {
    return <div style={{ height: '1px', background: '#eef2f7', margin: '3px 4px' }} />
}
