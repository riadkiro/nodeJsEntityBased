/**
 * RecordsKanban — Kanban board for RecordsGrid
 * 
 * CardRenderer-driven cards (template system)
 * @dnd-kit drag & drop (reorder within column + move between columns)
 * Horizontal drag-to-scroll (when not dragging a card)
 * API calls to persist status/classification changes
 */
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import QuickViewModal from './QuickViewModal'
import CardRenderer, { DEFAULT_KANBAN_LAYOUT } from '../../shared/CardRenderer'
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
function KanbanCard({ record, accountNumber, entitySlug, isDragging: isDragProp = false, onQuickView, cardTemplate, entityData }) {
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
        if (!didDrag.current && elapsed < 400 && onQuickView && !e.target.closest('a, button')) {
            setTimeout(() => onQuickView(record), 50)
        }
        pointerStart.current = null
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card cursor-pointer transition-all group ${(isDragProp || dragging) ? 'shadow-lg ring-2 ring-primary/30 cursor-move' : ''}`}
            data-dnd="card"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            {...attributes}
            {...listeners}
        >
            <CardRenderer
                record={record}
                cardTemplate={cardTemplate}
                context="kanban"
                entityData={entityData}
                accountNumber={accountNumber}
                entitySlug={entitySlug}
                className="bg-white hover:shadow-md border border-gray-200/80 dark:border-0 dark:bg-dark/40 dark:hover:bg-dark/60"
                style={{ borderRadius: 8 }}
            />
        </div>
    )
}

// ─── Droppable Kanban Column ─────────────────────────────────────────
function KanbanColumnView({ column, records, recordIds, accountNumber, entitySlug, onQuickView, cardTemplate, entityData }) {
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
                                    cardTemplate={cardTemplate}
                                    entityData={entityData}
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
    entityData,
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

    // Card template state — fetch default kanban card
    const [cardTemplate, setCardTemplate] = useState(null)
    useEffect(() => {
        if (!entityData?._id) return
        const entityId = entityData._id?.$oid || entityData._id
        fetch(`/account/${accountNumber}/api/entity/${entityId}/cards/default/kanban`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.card) setCardTemplate(data.card)
            })
            .catch(() => { })
    }, [entityData?._id, accountNumber])

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

    // ─── Build columns from entity classification options ────────────
    const kanbanColumns = useMemo(() => {
        // 1) Try to build from entity classification data (shows ALL columns, even empty)
        if (entityData) {
            // Prefer statusClassification
            const statusCls = entityData.statusClassification
            if (statusCls && statusCls.options && statusCls.options.length > 0) {
                const cols = statusCls.options.map(opt => ({
                    id: String(opt._id),
                    title: opt.label,
                    color: opt.color || '#6366f1',
                    optionId: String(opt._id),
                }))
                cols.push({ id: '__none__', title: 'Sans Statut', color: '#9ca3af', optionId: 'none' })
                return { classId: String(statusCls._id), columns: cols }
            }

            // Fallback to first classification with options
            const classifications = entityData.classifications || []
            for (const cls of classifications) {
                if (cls.options && cls.options.length > 0) {
                    const cols = cls.options.map(opt => ({
                        id: String(opt._id),
                        title: opt.label,
                        color: opt.color || '#6366f1',
                        optionId: String(opt._id),
                    }))
                    cols.push({ id: '__none__', title: 'Non classé', color: '#9ca3af', optionId: 'none' })
                    return { classId: String(cls._id), columns: cols }
                }
            }
        }

        // 2) Fallback: infer from record data (old behavior)
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
    }, [records, entityData])

    // ─── Group records by column ─────────────────────────────────────
    const recordsByColumn = useMemo(() => {
        const grouped = {}
        kanbanColumns.columns.forEach(col => (grouped[col.id] = []))

        if (!kanbanColumns.classId) {
            grouped['__all__'] = records
        } else {
            // Build a lookup: optionId → column.id (for entity-based columns)
            const optionIdToColId = {}
            kanbanColumns.columns.forEach(col => {
                if (col.optionId && col.optionId !== 'none') {
                    optionIdToColId[String(col.optionId)] = col.id
                }
            })
            // Also build label → column.id lookup (for fallback dynamic columns)
            const labelToColId = {}
            kanbanColumns.columns.forEach(col => {
                labelToColId[col.title] = col.id
            })

            records.forEach(r => {
                const cvs = r.classificationValues || []
                const matchingCv = cvs.find(cv => {
                    const classId = cv.classificationId?.$oid || cv.classificationId || cv.classification_id
                    return classId === kanbanColumns.classId
                })
                if (matchingCv) {
                    // Try matching by optionId first (entity-data columns use optionId as column.id)
                    const optId = String(matchingCv.optionId?.$oid || matchingCv.optionId || '')
                    const colByOptId = optionIdToColId[optId]
                    if (colByOptId && grouped[colByOptId]) {
                        grouped[colByOptId].push(r)
                    } else {
                        // Fallback: try matching by label (dynamic-inferred columns use label as column.id)
                        const label = matchingCv.optionLabel || matchingCv.label || 'Sans label'
                        if (grouped[label]) {
                            grouped[label].push(r)
                        } else if (grouped['__none__']) {
                            grouped['__none__'].push(r)
                        }
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
                autoScroll={{
                    threshold: { x: 0.15, y: 0.15 },
                    interval: 10,
                    acceleration: 5,
                }}
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
                                cardTemplate={cardTemplate}
                                entityData={entityData}
                            />
                        )
                    })}
                </div>

                <DragOverlay>
                    {activeRecord ? <KanbanCard record={activeRecord} accountNumber={accountNumber} entitySlug={entitySlug} isDragging cardTemplate={cardTemplate} entityData={entityData} /> : null}
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
