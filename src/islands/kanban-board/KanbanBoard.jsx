/**
 * KanbanBoard - React Island
 * Main Kanban view component with drag & drop
 */
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
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import KanbanColumn from './components/KanbanColumn'
import KanbanCard from './components/KanbanCard'

export default function KanbanBoard({
    accountNumber,
    entityId,
    viewId,
    entitySlug,
    kanbanFieldId = 'status'
}) {
    // State
    const [columns, setColumns] = useState([])
    const [records, setRecords] = useState([])
    const [orderByColumn, setOrderByColumn] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeId, setActiveId] = useState(null)

    // Debounce ref for saving preferences
    const saveTimeoutRef = useRef(null)

    // Ref for horizontal scroll container
    const scrollContainerRef = useRef(null)

    // Drag-to-pan refs
    const isPanningRef = useRef(false)
    const panStartRef = useRef({ x: 0, scrollLeft: 0 })

    // Wheel-to-horizontal scroll conversion
    useEffect(() => {
        if (loading) return

        const container = scrollContainerRef.current
        if (!container) {
            console.error('[KanbanBoard] scrollContainerRef still null after loading=false')
            return
        }

        const handleWheel = (e) => {
            if (e.shiftKey) return

            const canScrollY = container.scrollHeight > container.clientHeight
            const canScrollX = container.scrollWidth > container.clientWidth

            // Si on peut scroller verticalement, on laisse le navigateur faire (pas de preventDefault)
            if (canScrollY) return

            // Sinon (pas de scroll vertical possible), on convertit en horizontal
            if (canScrollX && e.deltaY !== 0) {
                e.preventDefault()
                container.scrollLeft += e.deltaY
            }
        }


        container.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            container.removeEventListener('wheel', handleWheel)
        }
    }, [loading])

    // Drag-to-pan on scroll container (left click)
    useEffect(() => {
        if (loading) return

        const container = scrollContainerRef.current
        if (!container) return

        const isIgnored = (target) => {
            if (!target) return true
            return !!target.closest(
                '[data-dnd="card"],[data-dnd="handle"],button,a,input,select,textarea,[data-drag-handle]'
            )
        }

        const onPointerDown = (e) => {
            if (e.button !== 0) return
            if (activeId) return
            if (isIgnored(e.target)) return
            if (container.scrollWidth <= container.clientWidth) return

            isPanningRef.current = true
            panStartRef.current = { x: e.clientX, scrollLeft: container.scrollLeft }
            container.style.cursor = 'grabbing'
            document.body.classList.add('is-panning')

            try { container.setPointerCapture(e.pointerId) } catch { }
            e.preventDefault()
        }

        const onPointerMove = (e) => {
            if (!isPanningRef.current) return
            const dx = e.clientX - panStartRef.current.x
            container.scrollLeft = panStartRef.current.scrollLeft - dx
            e.preventDefault()
        }

        const endPan = (e) => {
            if (!isPanningRef.current) return
            isPanningRef.current = false
            container.style.cursor = 'grab'
            document.body.classList.remove('is-panning')
            try { container.releasePointerCapture(e.pointerId) } catch { }
            e.preventDefault()
        }

        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('pointermove', onPointerMove, true)
        document.addEventListener('pointerup', endPan, true)
        document.addEventListener('pointercancel', endPan, true)

        return () => {
            document.removeEventListener('pointerdown', onPointerDown, true)
            document.removeEventListener('pointermove', onPointerMove, true)
            document.removeEventListener('pointerup', endPan, true)
            document.removeEventListener('pointercancel', endPan, true)
            document.body.classList.remove('is-panning')
        }
    }, [loading, activeId])

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Fetch records and build columns
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

            // Build columns from entity data
            let cols = []
            const entity = data.entity || {}

            if (kanbanFieldId === 'status') {
                // Use status classification
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
                // Use custom classification
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

            console.log('[KanbanBoard] Columns:', cols)
            console.log('[KanbanBoard] Records sample:', data.records?.slice(0, 3).map(r => ({
                _id: r._id,
                title: r.title,
                status: r.status,
                statusType: typeof r.status
            })))

            setColumns(cols)
            setRecords(data.records || [])

            // Load order preferences
            if (data.preferences?.kanban?.orderByColumn) {
                setOrderByColumn(data.preferences.kanban.orderByColumn)
            }

        } catch (err) {
            console.error('[KanbanBoard] Fetch error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [accountNumber, entityId, viewId, kanbanFieldId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Get column ID for a record
    const getRecordColumnId = useCallback((record) => {
        if (kanbanFieldId === 'status') {
            const s = record.status
            if (!s) return 'none'
            if (typeof s === 'string') return s
            if (typeof s === 'object') return String(s._id || s.id || 'none')
            return 'none'
        }

        const cv = record.classificationValues?.find(v => String(v.classificationId) === String(kanbanFieldId))
        if (!cv) return 'none'

        const opt = cv.optionId
        if (!opt) return 'none'
        if (typeof opt === 'string') return opt
        if (typeof opt === 'object') return String(opt._id || opt.id || 'none')
        return 'none'
    }, [kanbanFieldId])


    // Records grouped by column with order applied
    const recordsByColumn = useMemo(() => {
        const grouped = {}
        columns.forEach(col => {
            grouped[col.id] = []
        })

        records.forEach(record => {
            const colId = getRecordColumnId(record)
            if (grouped[colId]) {
                grouped[colId].push(record)
            } else if (grouped['none']) {
                grouped['none'].push(record)
            }
        })

        // Apply saved order
        Object.keys(grouped).forEach(colId => {
            const order = orderByColumn[colId] || []
            if (order.length > 0) {
                grouped[colId].sort((a, b) => {
                    const indexA = order.indexOf(a._id)
                    const indexB = order.indexOf(b._id)
                    if (indexA === -1 && indexB === -1) return 0
                    if (indexA === -1) return 1
                    if (indexB === -1) return -1
                    return indexA - indexB
                })
            }
        })

        return grouped
    }, [columns, records, orderByColumn, getRecordColumnId])

    // Save preferences to server (debounced)
    const savePreferences = useCallback((newOrderByColumn) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await fetch(`/account/${accountNumber}/api/user/view-preferences`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        viewId,
                        preferences: {
                            kanban: { orderByColumn: newOrderByColumn }
                        }
                    })
                })
            } catch (err) {
                console.error('[KanbanBoard] Save preferences error:', err)
            }
        }, 300)
    }, [accountNumber, viewId])

    // Update record field on server
    const updateRecordField = useCallback(async (recordId, newColumnId) => {
        try {
            let url, body

            if (kanbanFieldId === 'status') {
                url = `/account/${accountNumber}/api/record/update-status`
                body = { recordId, status: newColumnId }
            } else {
                url = `/account/${accountNumber}/api/record/update-classification`
                body = {
                    recordId,
                    classificationId: kanbanFieldId,
                    optionId: newColumnId
                }
            }

            console.log('[KanbanBoard] Updating record:', { url, body })

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            })

            const data = await res.json()
            console.log('[KanbanBoard] Update response:', data)

            if (!res.ok) {
                console.error('[KanbanBoard] Update failed:', data)
            }
        } catch (err) {
            console.error('[KanbanBoard] Update error:', err)
        }
    }, [accountNumber, kanbanFieldId])

    // Find active record for overlay
    const activeRecord = useMemo(() => {
        if (!activeId) return null
        return records.find(r => r._id === activeId)
    }, [activeId, records])

    // DnD handlers
    const handleDragStart = (event) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeRecordId = active.id
        const activeRecord = records.find(r => r._id === activeRecordId)
        if (!activeRecord) return

        const fromColumnId = getRecordColumnId(activeRecord)

        // Determine target column
        let toColumnId = over.id
        // If dropped on a record, get its column
        const overRecord = records.find(r => r._id === over.id)
        if (overRecord) {
            toColumnId = getRecordColumnId(overRecord)
        }

        // Check if column exists
        if (!columns.find(c => c.id === toColumnId) && toColumnId !== 'none') {
            // Must be a record drop, not a column
            const targetRecord = records.find(r => r._id === toColumnId)
            if (targetRecord) {
                toColumnId = getRecordColumnId(targetRecord)
            } else {
                return
            }
        }

        // Update record's column if changed
        if (fromColumnId !== toColumnId) {
            // Optimistic update
            setRecords(prev => prev.map(r => {
                if (r._id !== activeRecordId) return r
                if (kanbanFieldId === 'status') {
                    return { ...r, status: toColumnId }
                } else {
                    const newClassificationValues = (r.classificationValues || []).filter(
                        cv => cv.classificationId !== kanbanFieldId
                    )
                    if (toColumnId !== 'none') {
                        newClassificationValues.push({
                            classificationId: kanbanFieldId,
                            optionId: toColumnId
                        })
                    }
                    return { ...r, classificationValues: newClassificationValues }
                }
            }))

            // Update server
            updateRecordField(activeRecordId, toColumnId)
        }

        // Update order in target column
        const currentOrder = recordsByColumn[toColumnId]?.map(r => r._id) || []
        const newOrder = [...currentOrder]

        // Remove from current position
        const oldIndex = newOrder.indexOf(activeRecordId)
        if (oldIndex > -1) {
            newOrder.splice(oldIndex, 1)
        }

        // Find new position
        if (overRecord && overRecord._id !== activeRecordId) {
            const newIndex = newOrder.indexOf(over.id)
            if (newIndex > -1) {
                newOrder.splice(newIndex, 0, activeRecordId)
            } else {
                newOrder.push(activeRecordId)
            }
        } else {
            // Dropped on column itself, add at end
            if (!newOrder.includes(activeRecordId)) {
                newOrder.push(activeRecordId)
            }
        }

        // Update order state
        const newOrderByColumn = {
            ...orderByColumn,
            [toColumnId]: newOrder
        }

        // If moved from another column, update that column's order too
        if (fromColumnId !== toColumnId) {
            newOrderByColumn[fromColumnId] = (orderByColumn[fromColumnId] || [])
                .filter(id => id !== activeRecordId)
        }

        setOrderByColumn(newOrderByColumn)
        savePreferences(newOrderByColumn)
    }

    const handleDragCancel = () => {
        setActiveId(null)
    }

    // Add record handler
    const handleAddRecord = useCallback((columnId) => {
        let url = `/account/${accountNumber}/record/${entitySlug}/add`
        if (kanbanFieldId === 'status' && columnId !== 'none') {
            url += `?status=${columnId}`
        }
        window.location.href = url
    }, [accountNumber, entitySlug, kanbanFieldId])

    // Edit record handler
    const handleEditRecord = useCallback((recordId) => {
        window.location.href = `/account/${accountNumber}/record/${entitySlug}/${recordId}`
    }, [accountNumber, entitySlug])

    // Delete record handler
    const handleDeleteRecord = useCallback(async (recordId) => {
        if (confirm('Confirmer la suppression ?')) {
            window.location.href = `/account/${accountNumber}/record/${entitySlug}/delete/${recordId}`
        }
    }, [accountNumber, entitySlug])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-danger">
                Erreur: {error}
            </div>
        )
    }

    return (
        <div
            ref={scrollContainerRef}
            style={{
                height: '100%',
                width: '100%',
                minWidth: 0,
                overflowX: 'auto',
                overflowY: 'auto',
                overscrollBehaviorX: 'contain',
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
                    {columns.map(column => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            records={recordsByColumn[column.id] || []}
                            onAddRecord={() => handleAddRecord(column.id)}
                            onEditRecord={handleEditRecord}
                            onDeleteRecord={handleDeleteRecord}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeRecord && (
                        <KanbanCard
                            record={activeRecord}
                            isDragging
                        />
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
