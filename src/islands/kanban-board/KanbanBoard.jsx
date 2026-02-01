import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove
} from '@dnd-kit/sortable'

import KanbanColumn from './components/KanbanColumn'
import KanbanCard from './components/KanbanCard'

export default function KanbanBoard({ accountNumber, entityId, viewId, entitySlug, kanbanFieldId = 'status' }) {
    const [columns, setColumns] = useState([])
    const [records, setRecords] = useState([])
    const [orderByColumn, setOrderByColumn] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [activeId, setActiveId] = useState(null)

    const saveTimeoutRef = useRef(null)
    const scrollContainerRef = useRef(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/views/${viewId}/records?limit=10000`,
                { credentials: 'include' }
            )
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()

            let cols = []
            const entity = data.entity || {}

            if (kanbanFieldId === 'status') {
                if (entity.statusClassification?.options) {
                    cols = entity.statusClassification.options.map(opt => ({
                        id: String(opt._id),
                        title: opt.label,
                        color: opt.color || '#6366f1',
                        icon: opt.icon
                    }))
                }
                cols.push({ id: 'none', title: 'Sans Statut', color: '#9ca3af' })
            } else {
                const cls = entity.classifications?.find(c => c._id === kanbanFieldId)
                if (cls?.options) {
                    cols = cls.options.map(opt => ({
                        id: String(opt._id),
                        title: opt.label,
                        color: opt.color || '#6366f1',
                        icon: opt.icon
                    }))
                }
                cols.push({ id: 'none', title: 'Non classé', color: '#9ca3af' })
            }

            setColumns(cols)
            setRecords(data.records || [])
            if (data.preferences?.kanban?.orderByColumn) setOrderByColumn(data.preferences.kanban.orderByColumn)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [accountNumber, entityId, viewId, kanbanFieldId])

    useEffect(() => { fetchData() }, [fetchData])

    const getRecordColumnId = useCallback((record) => {
        if (kanbanFieldId === 'status') {
            const s = record.status
            if (!s) return 'none'
            if (typeof s === 'string') return String(s)
            if (typeof s === 'object') return String(s._id || s.id || 'none')
            return 'none'
        }
        const cv = record.classificationValues?.find(v => String(v.classificationId) === String(kanbanFieldId))
        const opt = cv?.optionId
        if (!opt) return 'none'
        if (typeof opt === 'string') return String(opt)
        if (typeof opt === 'object') return String(opt._id || opt.id || 'none')
        return 'none'
    }, [kanbanFieldId])

    // Group records by column, then apply saved order
    const recordsByColumn = useMemo(() => {
        const grouped = {}
        columns.forEach(c => (grouped[c.id] = []))

        for (const r of records) {
            const colId = getRecordColumnId(r)
                ; (grouped[colId] || grouped['none'] || []).push(r)
        }

        for (const colId of Object.keys(grouped)) {
            const order = orderByColumn[colId] || []
            if (!order.length) continue
            grouped[colId].sort((a, b) => {
                const ia = order.indexOf(a._id)
                const ib = order.indexOf(b._id)
                if (ia === -1 && ib === -1) return 0
                if (ia === -1) return 1
                if (ib === -1) return -1
                return ia - ib
            })
        }

        return grouped
    }, [columns, records, orderByColumn, getRecordColumnId])

    // Helper: return recordId array per column (for SortableContext items)
    const idsByColumn = useMemo(() => {
        const out = {}
        for (const col of columns) {
            out[col.id] = (recordsByColumn[col.id] || []).map(r => String(r._id))
        }
        return out
    }, [columns, recordsByColumn])

    const savePreferences = useCallback((newOrderByColumn) => {
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

    const updateRecordField = useCallback(async (recordId, newColumnId) => {
        let url, body
        if (kanbanFieldId === 'status') {
            url = `/account/${accountNumber}/api/record/update-status`
            body = { recordId, status: newColumnId }
        } else {
            url = `/account/${accountNumber}/api/record/update-classification`
            body = { recordId, classificationId: kanbanFieldId, optionId: newColumnId }
        }
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        })
    }, [accountNumber, kanbanFieldId])

    const activeRecord = useMemo(() => {
        if (!activeId) return null
        return records.find(r => String(r._id) === String(activeId)) || null
    }, [activeId, records])

    // Find which column contains an item id
    const findColumnOfItem = useCallback((itemId) => {
        const id = String(itemId)
        for (const colId of Object.keys(idsByColumn)) {
            if (idsByColumn[colId]?.includes(id)) return colId
        }
        return null
    }, [idsByColumn])

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
        // over peut être une colonne (droppable) OU une card (sortable)
        const toCol = columns.some(c => String(c.id) === overId)
            ? overId
            : findColumnOfItem(overId)

        if (!fromCol || !toCol) return

        // 1) Reorder dans la même colonne
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

        // 2) Move vers autre colonne (insert avant la card survolée, sinon fin de colonne)
        const fromItems = [...(idsByColumn[fromCol] || [])].filter(id => id !== activeRecordId)
        const toItems = [...(idsByColumn[toCol] || [])]

        const overIsColumn = columns.some(c => String(c.id) === overId)
        const insertIndex = overIsColumn ? toItems.length : Math.max(0, toItems.indexOf(overId))

        toItems.splice(insertIndex, 0, activeRecordId)

        const newOrderByColumn = {
            ...orderByColumn,
            [fromCol]: fromItems,
            [toCol]: toItems
        }

        setOrderByColumn(newOrderByColumn)
        savePreferences(newOrderByColumn)

        // Optimistic record field update (status/classification) + API
        setRecords(prev => prev.map(r => {
            if (String(r._id) !== activeRecordId) return r
            if (kanbanFieldId === 'status') return { ...r, status: toCol === 'none' ? null : toCol }
            const next = (r.classificationValues || []).filter(cv => String(cv.classificationId) !== String(kanbanFieldId))
            if (toCol !== 'none') next.push({ classificationId: kanbanFieldId, optionId: toCol })
            return { ...r, classificationValues: next }
        }))

        updateRecordField(activeRecordId, toCol)
    }

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
    if (error) return <div className="flex items-center justify-center h-64 text-danger">Erreur: {error}</div>

    return (
        <div
            ref={scrollContainerRef}
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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                    padding: '0.5rem',
                    width: 'max-content',
                    minHeight: '100%'
                }}>
                    {columns.map(col => (
                        <KanbanColumn
                            key={col.id}
                            column={col}
                            recordIds={idsByColumn[col.id] || []}
                            records={recordsByColumn[col.id] || []}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeRecord ? <KanbanCard record={activeRecord} isDragging /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
