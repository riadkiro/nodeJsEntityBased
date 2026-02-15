/**
 * RecordsKanban — Kanban board for RecordsGrid
 * 
 * RESTORED original KanbanBoard design WITH drag & drop:
 * - Color bar (4px) on top of each column
 * - Tinted background using hexToRgba
 * - Badge-style colored column headers
 * - Minimalist cards with tags, dates, and hover actions
 * - @dnd-kit drag & drop (reorder within column + move between columns)
 * - Horizontal drag-to-scroll (when not dragging a card)
 * - API calls to persist status/classification changes
 */
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import QuickViewModal from './QuickViewModal'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    MouseSensor,
    TouchSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
    useSortable,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// ─── Helpers ─────────────────────────────────────────────────────────
function hexToRgba(hex, alpha = 0.1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(128,128,128,${alpha})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

// ─── Sortable Kanban Card ────────────────────────────────────────────
function KanbanCard({ record, accountNumber, entitySlug, isDragging: isDragProp = false, onQuickView }) {
    const pointerStart = useRef(null)
    const didDrag = useRef(false)
    const id = String(record._id?.$oid || record._id)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: dragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: (isDragProp || dragging) ? 0.7 : 1,
        touchAction: 'manipulation',
    }

    const recordId = record._id?.$oid || record._id
    const title = record.referenceTitle || record.title || record.computedTitle || 'Sans titre'
    const description = record.description || ''

    const dueDate = record.dueDate
        ? new Date(record.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : null
    const createdDate = record.createdAt
        ? new Date(record.createdAt).toLocaleDateString('fr-FR')
        : null

    // Classification badges
    const classLabels = (record.classificationValues || [])
        .filter(cv => cv.optionLabel || cv.label)
        .map(cv => ({
            label: cv.optionLabel || cv.label,
            color: cv.optionColor || cv.color || '#6366f1'
        }))

    const tags = record.tags || []

    const handlePointerDown = (e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY, time: Date.now() }
        didDrag.current = false
    }
    const handlePointerMove = (e) => {
        if (pointerStart.current) {
            const dx = Math.abs(e.clientX - pointerStart.current.x)
            const dy = Math.abs(e.clientY - pointerStart.current.y)
            if (dx > 5 || dy > 5) didDrag.current = true
        }
    }
    const handlePointerUp = (e) => {
        if (!pointerStart.current) return
        const elapsed = Date.now() - pointerStart.current.time
        // Only open on a short, stationary tap (< 400ms) — not after a long press / drag
        if (!didDrag.current && elapsed < 400 && onQuickView && !e.target.closest('a, button')) {
            // Delay opening to avoid the mobile "ghost click" on the backdrop
            setTimeout(() => onQuickView(record), 50)
        }
        pointerStart.current = null
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card cursor-pointer rounded-lg transition-all group bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60 ${(isDragProp || dragging) ? 'shadow-lg ring-2 ring-primary/30 cursor-move' : 'shadow-sm'}`}
            data-dnd="card"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            {...attributes}
            {...listeners}
        >
            {/* Content */}
            <div className="p-3">
                {/* Title */}
                <div className="text-sm font-semibold text-gray-800 dark:text-white-dark leading-5 line-clamp-2 mb-2">
                    {title}
                </div>

                {/* Description */}
                {description && (
                    <p className="text-xs text-gray-500 dark:text-white-dark/70 line-clamp-2 mb-2">
                        {description}
                    </p>
                )}

                {/* Tags / Classification badges */}
                <div className="flex flex-wrap items-center gap-1 mb-2">
                    {classLabels.length > 0 ? (
                        classLabels.slice(0, 3).map((cl, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
                                style={{
                                    backgroundColor: hexToRgba(cl.color, 0.15),
                                    color: cl.color
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cl.color }} />
                                {cl.label}
                            </span>
                        ))
                    ) : tags.length > 0 ? (
                        tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] text-gray-400 dark:text-white-dark/50 italic flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654" />
                            </svg>
                            Sans tag
                        </span>
                    )}
                </div>

                {/* Meta icons row */}
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-white-dark/50">
                    {record.attachments?.length > 0 && (
                        <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            {record.attachments.length}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        0
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-0 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white-dark/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M3 10H21" />
                        <path d="M8 2V6" />
                        <path d="M16 2V6" />
                    </svg>
                    <span>{dueDate || createdDate || '—'}</span>
                </div>

                {/* Action buttons - visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ pointerEvents: 'auto' }}>
                    <a
                        href={`/account/${accountNumber}/record/${entitySlug}/${recordId}/edit`}
                        className="p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </a>
                    <a
                        href={`/account/${accountNumber}/record/${entitySlug}/${recordId}`}
                        className="p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path opacity="0.5" d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    )
}

// ─── Droppable Kanban Column ─────────────────────────────────────────
function KanbanColumnView({ column, records, recordIds, accountNumber, entitySlug, onQuickView }) {
    const { setNodeRef, isOver } = useDroppable({
        id: String(column.id),
    })

    const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    const bgColor = hexToRgba(column.color, dark ? 0.12 : 0.06)
    const borderColor = hexToRgba(column.color, dark ? 0.3 : 0.15)

    return (
        <div
            ref={setNodeRef}
            className={`flex-none rounded-lg overflow-hidden transition-all ${isOver ? 'ring-2 ring-primary/50 ring-offset-2' : ''}`}
            style={{
                width: '300px',
                maxWidth: '320px',
                backgroundColor: isOver ? hexToRgba(column.color, 0.15) : bgColor,
                border: `1px solid ${borderColor}`
            }}
            data-dnd="column"
        >
            {/* Color bar */}
            <div style={{ height: '4px', backgroundColor: column.color }} />

            {/* Header */}
            <div className="px-3 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1.5 px-2 py-0 rounded text-xs font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: column.color, color: '#fff' }}
                    >
                        {column.title}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{records.length}</span>
                </div>
            </div>

            {/* Cards list */}
            <div className="px-2 pb-3">
                <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
                    <div className={`space-y-2 min-h-[80px] rounded-lg transition-all ${isOver ? 'bg-primary/5 p-2' : ''}`}>
                        {records.length === 0 ? (
                            <div className="text-xs text-gray-300 dark:text-gray-600 text-center py-8 italic">
                                Aucun enregistrement
                            </div>
                        ) : (
                            records.map(r => (
                                <KanbanCard
                                    key={r._id?.$oid || r._id}
                                    record={r}
                                    accountNumber={accountNumber}
                                    entitySlug={entitySlug}
                                    onQuickView={onQuickView}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>

            {/* Add button */}
            <div className="px-3 pb-3">
                <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Ajouter
                </button>
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────
export default function RecordsKanban({
    records: initialRecords,
    columns: dataColumns,
    accountNumber,
    entitySlug,
    viewId,
}) {
    const scrollRef = useRef(null)
    const saveTimeoutRef = useRef(null)

    // Local records state for optimistic updates
    const [records, setRecords] = useState(initialRecords)
    const [orderByColumn, setOrderByColumn] = useState({})
    const [activeId, setActiveId] = useState(null)

    // Quick view modal state
    const [quickViewRecord, setQuickViewRecord] = useState(null)

    const handleQuickView = useCallback((record) => {
        setQuickViewRecord(record)
    }, [])

    // Sync with parent when initialRecords change
    useEffect(() => {
        setRecords(initialRecords)
    }, [initialRecords])

    // Drag-to-scroll
    const isDraggingScroll = useRef(false)
    const startX = useRef(0)
    const scrollLeftVal = useRef(0)

    const handleMouseDown = useCallback((e) => {
        if (activeId) return // Don't scroll when dnd-dragging a card
        if (e.button !== 0) return
        if (e.target.closest('a, button, .dropdown, [data-dnd="card"]')) return
        const container = scrollRef.current
        if (!container) return
        isDraggingScroll.current = true
        startX.current = e.pageX - container.offsetLeft
        scrollLeftVal.current = container.scrollLeft
        container.style.cursor = 'grabbing'
    }, [activeId])

    const handleMouseMove = useCallback((e) => {
        if (activeId) { isDraggingScroll.current = false; return }
        if (!isDraggingScroll.current) return
        e.preventDefault()
        const container = scrollRef.current
        if (!container) return
        const x = e.pageX - container.offsetLeft
        const walk = (x - startX.current) * 1.5
        container.scrollLeft = scrollLeftVal.current - walk
    }, [activeId])

    const handleMouseUp = useCallback(() => {
        isDraggingScroll.current = false
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
    }, [])

    // DnD sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 10 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // ─── Build columns from classification values ────────────────────
    const kanbanColumns = useMemo(() => {
        const classStats = {}
        records.forEach(r => {
            (r.classificationValues || []).forEach(cv => {
                const classId = cv.classificationId?.$oid || cv.classificationId || cv.classification_id
                if (!classId) return
                if (!classStats[classId]) classStats[classId] = { count: 0, options: {} }
                classStats[classId].count++
                const optLabel = cv.optionLabel || cv.label || 'Sans label'
                const optColor = cv.optionColor || cv.color || '#9ca3af'
                const optId = cv.optionId?.$oid || cv.optionId || optLabel
                if (!classStats[classId].options[optLabel]) {
                    classStats[classId].options[optLabel] = { label: optLabel, color: optColor, optionId: String(optId), count: 0 }
                }
                classStats[classId].options[optLabel].count++
            })
        })

        let bestClassId = null
        let bestCount = 0
        Object.entries(classStats).forEach(([classId, stats]) => {
            if (stats.count > bestCount) {
                bestCount = stats.count
                bestClassId = classId
            }
        })

        if (bestClassId && classStats[bestClassId]) {
            const opts = Object.values(classStats[bestClassId].options)
            const cols = opts.map((opt) => ({
                id: opt.label,
                title: opt.label,
                color: opt.color,
                optionId: opt.optionId,
            }))
            cols.push({ id: '__none__', title: 'Sans classification', color: '#9ca3af', optionId: 'none' })
            return { classId: bestClassId, columns: cols }
        }

        return {
            classId: null,
            columns: [{ id: '__all__', title: 'Tous les enregistrements', color: '#4361ee', optionId: null }]
        }
    }, [records])

    // ─── Group records by column ─────────────────────────────────────
    const recordsByColumn = useMemo(() => {
        const grouped = {}
        kanbanColumns.columns.forEach(col => (grouped[col.id] = []))

        if (!kanbanColumns.classId) {
            grouped['__all__'] = records
        } else {
            records.forEach(r => {
                const cvs = r.classificationValues || []
                const matchingCv = cvs.find(cv => {
                    const classId = cv.classificationId?.$oid || cv.classificationId || cv.classification_id
                    return classId === kanbanColumns.classId
                })
                if (matchingCv) {
                    const label = matchingCv.optionLabel || matchingCv.label || 'Sans label'
                    if (grouped[label]) {
                        grouped[label].push(r)
                    } else if (grouped['__none__']) {
                        grouped['__none__'].push(r)
                    }
                } else if (grouped['__none__']) {
                    grouped['__none__'].push(r)
                }
            })
        }

        // Apply saved order
        for (const colId of Object.keys(grouped)) {
            const order = orderByColumn[colId] || []
            if (!order.length) continue
            grouped[colId].sort((a, b) => {
                const ia = order.indexOf(String(a._id?.$oid || a._id))
                const ib = order.indexOf(String(b._id?.$oid || b._id))
                if (ia === -1 && ib === -1) return 0
                if (ia === -1) return 1
                if (ib === -1) return -1
                return ia - ib
            })
        }

        return grouped
    }, [kanbanColumns, records, orderByColumn])

    // IDs per column for SortableContext
    const idsByColumn = useMemo(() => {
        const out = {}
        for (const col of kanbanColumns.columns) {
            out[col.id] = (recordsByColumn[col.id] || []).map(r => String(r._id?.$oid || r._id))
        }
        return out
    }, [kanbanColumns.columns, recordsByColumn])

    // Find which column contains an item id
    const findColumnOfItem = useCallback((itemId) => {
        const id = String(itemId)
        for (const colId of Object.keys(idsByColumn)) {
            if (idsByColumn[colId]?.includes(id)) return colId
        }
        return null
    }, [idsByColumn])

    // Active record for DragOverlay
    const activeRecord = useMemo(() => {
        if (!activeId) return null
        return records.find(r => String(r._id?.$oid || r._id) === String(activeId)) || null
    }, [activeId, records])

    // ─── Save preferences (debounced) ────────────────────────────────
    const savePreferences = useCallback((newOrderByColumn) => {
        if (!viewId) return
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await fetch(`/account/${accountNumber}/api/user/view-preferences`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ viewId, preferences: { kanban: { orderByColumn: newOrderByColumn } } })
                })
            } catch { }
        }, 250)
    }, [accountNumber, viewId])

    // ─── Update record classification via API ────────────────────────
    const updateRecordClassification = useCallback(async (recordId, toColumnId) => {
        if (!kanbanColumns.classId) return
        const toCol = kanbanColumns.columns.find(c => c.id === toColumnId)
        if (!toCol) return

        try {
            await fetch(`/account/${accountNumber}/api/record/update-classification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    recordId,
                    classificationId: kanbanColumns.classId,
                    optionId: toCol.optionId === 'none' ? null : toCol.optionId
                })
            })
        } catch (err) {
            console.error('[RecordsKanban] Update error:', err)
        }
    }, [accountNumber, kanbanColumns])

    // ─── DnD Handlers ────────────────────────────────────────────────
    const handleDragStart = (event) => {
        setActiveId(String(event.active.id))
    }

    const handleDragCancel = () => {
        setActiveId(null)
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        setActiveId(null)
        if (!over) return

        const activeRecordId = String(active.id)
        const overId = String(over.id)

        const fromCol = findColumnOfItem(activeRecordId)
        // over can be a column (droppable) OR a card (sortable)
        const toCol = kanbanColumns.columns.some(c => String(c.id) === overId)
            ? overId
            : findColumnOfItem(overId)

        if (!fromCol || !toCol) return

        // 1) Reorder within same column
        if (fromCol === toCol) {
            const items = idsByColumn[fromCol] || []
            const oldIndex = items.indexOf(activeRecordId)
            const newIndex = items.indexOf(overId)
            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

            const newItems = arrayMove(items, oldIndex, newIndex)
            const newOrderByColumn = { ...orderByColumn, [fromCol]: newItems }
            setOrderByColumn(newOrderByColumn)
            savePreferences(newOrderByColumn)
            return
        }

        // 2) Move to another column
        const fromItems = [...(idsByColumn[fromCol] || [])].filter(id => id !== activeRecordId)
        const toItems = [...(idsByColumn[toCol] || [])]

        const overIsColumn = kanbanColumns.columns.some(c => String(c.id) === overId)
        const insertIndex = overIsColumn ? toItems.length : Math.max(0, toItems.indexOf(overId))

        toItems.splice(insertIndex, 0, activeRecordId)

        const newOrderByColumn = {
            ...orderByColumn,
            [fromCol]: fromItems,
            [toCol]: toItems
        }
        setOrderByColumn(newOrderByColumn)
        savePreferences(newOrderByColumn)

        // Optimistic update: move record's classificationValues to new column
        if (kanbanColumns.classId) {
            const toColumn = kanbanColumns.columns.find(c => c.id === toCol)
            setRecords(prev => prev.map(r => {
                if (String(r._id?.$oid || r._id) !== activeRecordId) return r
                const newCvs = (r.classificationValues || []).filter(cv => {
                    const cId = cv.classificationId?.$oid || cv.classificationId || cv.classification_id
                    return cId !== kanbanColumns.classId
                })
                if (toCol !== '__none__' && toColumn) {
                    newCvs.push({
                        classificationId: kanbanColumns.classId,
                        optionId: toColumn.optionId,
                        optionLabel: toColumn.title,
                        optionColor: toColumn.color,
                    })
                }
                return { ...r, classificationValues: newCvs }
            }))

            // Persist via API
            updateRecordClassification(activeRecordId, toCol)
        }
    }

    return (
        <div
            ref={scrollRef}
            className="h-full overflow-x-auto overflow-y-auto"
            style={{ cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        alignItems: 'flex-start',
                        gap: '1.25rem',
                        padding: '0.5rem',
                        width: 'max-content',
                        minHeight: '100%'
                    }}
                >
                    {kanbanColumns.columns.map((col) => {
                        const items = recordsByColumn[col.id] || []
                        if (col.id === '__none__' && items.length === 0) return null

                        return (
                            <KanbanColumnView
                                key={col.id}
                                column={col}
                                records={items}
                                recordIds={idsByColumn[col.id] || []}
                                accountNumber={accountNumber}
                                entitySlug={entitySlug}
                                onQuickView={handleQuickView}
                            />
                        )
                    })}
                </div>

                <DragOverlay>
                    {activeRecord ? <KanbanCard record={activeRecord} accountNumber={accountNumber} entitySlug={entitySlug} isDragging /> : null}
                </DragOverlay>
            </DndContext>

            {/* Quick View Modal */}
            {quickViewRecord && (
                <QuickViewModal
                    record={quickViewRecord}
                    columns={dataColumns}
                    accountNumber={accountNumber}
                    entitySlug={entitySlug}
                    onClose={() => setQuickViewRecord(null)}
                />
            )}
        </div>
    )
}
