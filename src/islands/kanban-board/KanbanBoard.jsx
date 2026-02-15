/**
 * KanbanBoard - Enhanced ClickUp-style Kanban Board
 * 
 * Features:
 * - Toolbar with search, record count, add button
 * - Drag & drop between columns (dnd-kit)
 * - Drag-to-scroll horizontal panning
 * - Quick-add modal with status + classification selection
 * - Inline column add (title input)
 * - Card detail slide-over panel
 * - Collapsible columns
 * - Dark mode compatible
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
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
import QuickAddModal from './components/QuickAddModal'
import CardDetailPanel from './components/CardDetailPanel'

export default function KanbanBoard({ accountNumber, entityId, viewId, entitySlug, kanbanFieldId = 'status' }) {
    const [columns, setColumns] = useState([])
    const [statusClassificationId, setStatusClassificationId] = useState(null)
    const [records, setRecords] = useState([])
    const [orderByColumn, setOrderByColumn] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [entityData, setEntityData] = useState(null)

    const [activeId, setActiveId] = useState(null)

    // Search
    const [searchQuery, setSearchQuery] = useState('')

    // Quick add modal
    const [showAddModal, setShowAddModal] = useState(false)
    const [addModalDefaultColumn, setAddModalDefaultColumn] = useState(null)
    const [addLoading, setAddLoading] = useState(false)

    // Card detail panel
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [showDetailPanel, setShowDetailPanel] = useState(false)

    const saveTimeoutRef = useRef(null)
    const scrollContainerRef = useRef(null)

    // Drag-to-scroll state
    const isDraggingToScroll = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    // Drag-to-scroll handlers
    const handleMouseDown = useCallback((e) => {
        if (activeId) return
        if (e.button !== 0) return
        const target = e.target
        if (target.closest('button, a, input, textarea, [data-draggable], [draggable="true"], .kanban-card')) return

        const container = scrollContainerRef.current
        if (!container) return

        isDraggingToScroll.current = true
        startX.current = e.pageX - container.offsetLeft
        scrollLeft.current = container.scrollLeft
        container.style.cursor = 'grabbing'
    }, [activeId])

    const handleMouseMove = useCallback((e) => {
        if (activeId) {
            isDraggingToScroll.current = false
            return
        }
        if (!isDraggingToScroll.current) return
        e.preventDefault()

        const container = scrollContainerRef.current
        if (!container) return

        const x = e.pageX - container.offsetLeft
        const walk = (x - startX.current) * 1.5
        container.scrollLeft = scrollLeft.current - walk
    }, [activeId])

    const handleMouseUp = useCallback(() => {
        isDraggingToScroll.current = false
        const container = scrollContainerRef.current
        if (container) container.style.cursor = 'grab'
    }, [])

    const handleMouseLeave = useCallback(() => {
        isDraggingToScroll.current = false
        const container = scrollContainerRef.current
        if (container) container.style.cursor = 'grab'
    }, [])

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 10 } }),
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
            setEntityData(entity)

            if (kanbanFieldId === 'status') {
                if (entity.statusClassification?.options) {
                    cols = entity.statusClassification.options.map(opt => ({
                        id: String(opt._id),
                        title: opt.label,
                        color: opt.color || '#6366f1',
                        icon: opt.icon
                    }))
                }
                setStatusClassificationId(entity.statusClassification?._id || null)
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
            if (statusClassificationId && record.classificationValues) {
                const cv = record.classificationValues.find(v => String(v.classificationId) === String(statusClassificationId))
                if (cv?.optionId) {
                    const opt = cv.optionId
                    return typeof opt === 'object' ? String(opt._id || opt.id || 'none') : String(opt)
                }
            }
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
    }, [kanbanFieldId, statusClassificationId])

    // Filter records by search
    const filteredRecords = useMemo(() => {
        if (!searchQuery.trim()) return records
        const q = searchQuery.toLowerCase()
        return records.filter(r => {
            const title = (r.referenceTitle || r.computedTitle || r.title || '').toLowerCase()
            const desc = (r.description || '').toLowerCase()
            return title.includes(q) || desc.includes(q)
        })
    }, [records, searchQuery])

    // Group filtered records by column
    const recordsByColumn = useMemo(() => {
        const grouped = {}
        columns.forEach(c => (grouped[c.id] = []))

        for (const r of filteredRecords) {
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
    }, [columns, filteredRecords, orderByColumn, getRecordColumnId])

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
        if (kanbanFieldId === 'status' && statusClassificationId) {
            url = `/account/${accountNumber}/api/record/update-classification`
            body = { recordId, classificationId: statusClassificationId, optionId: newColumnId }
        } else if (kanbanFieldId === 'status') {
            url = `/account/${accountNumber}/api/record/update-status`
            body = { recordId, status: newColumnId }
        } else {
            url = `/account/${accountNumber}/api/record/update-classification`
            body = { recordId, classificationId: kanbanFieldId, optionId: newColumnId }
        }
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            })
        } catch (err) {
            console.error('[Kanban] Error:', err)
        }
    }, [accountNumber, kanbanFieldId, statusClassificationId])

    const activeRecord = useMemo(() => {
        if (!activeId) return null
        return records.find(r => String(r._id) === String(activeId)) || null
    }, [activeId, records])

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
        const toCol = columns.some(c => String(c.id) === overId)
            ? overId
            : findColumnOfItem(overId)

        if (!fromCol || !toCol) return

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

        setRecords(prev => prev.map(r => {
            if (String(r._id) !== activeRecordId) return r
            if (kanbanFieldId === 'status') {
                const clsId = statusClassificationId
                if (clsId) {
                    const next = (r.classificationValues || []).filter(cv => String(cv.classificationId) !== String(clsId))
                    if (toCol !== 'none') next.push({ classificationId: clsId, optionId: toCol })
                    return { ...r, classificationValues: next }
                }
                return { ...r, status: toCol === 'none' ? null : toCol }
            }
            const next = (r.classificationValues || []).filter(cv => String(cv.classificationId) !== String(kanbanFieldId))
            if (toCol !== 'none') next.push({ classificationId: kanbanFieldId, optionId: toCol })
            return { ...r, classificationValues: next }
        }))

        updateRecordField(activeRecordId, toCol)
    }

    // Quick Add Modal handler
    const handleAddRecord = useCallback(async ({ title, description, columnId, classifications }) => {
        setAddLoading(true)
        try {
            // Build classification values
            const classificationValues = {}
            if (columnId && columnId !== 'none' && statusClassificationId) {
                classificationValues[statusClassificationId] = columnId
            }
            // Merge other classification selections
            Object.entries(classifications || {}).forEach(([clsId, optId]) => {
                classificationValues[clsId] = optId
            })

            const res = await fetch(`/account/${accountNumber}/record/${entitySlug}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    description,
                    entityId,
                    classificationValues
                })
            })

            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            setShowAddModal(false)
            // Refresh data
            await fetchData()
        } catch (err) {
            console.error('[Kanban] Add record error:', err)
        } finally {
            setAddLoading(false)
        }
    }, [accountNumber, entitySlug, entityId, statusClassificationId, fetchData])

    // Inline add handler (from column)
    const handleInlineAdd = useCallback(async (title, columnId) => {
        try {
            const res = await fetch(`/account/${accountNumber}/record/${entitySlug}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    entityId
                })
            })

            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()

            // Set the status for the new record
            if (columnId && columnId !== 'none' && statusClassificationId) {
                await updateRecordField(data._id, columnId)
            }

            // Refresh data
            await fetchData()
        } catch (err) {
            console.error('[Kanban] Inline add error:', err)
            throw err
        }
    }, [accountNumber, entitySlug, entityId, statusClassificationId, fetchData, updateRecordField])

    // Card click handler
    const handleCardClick = useCallback((record) => {
        setSelectedRecord(record)
        setShowDetailPanel(true)
    }, [])

    // Open modal from column
    const handleColumnAddClick = useCallback((columnId) => {
        setAddModalDefaultColumn(columnId)
        setShowAddModal(true)
    }, [])

    // Total records count
    const totalCount = filteredRecords.length
    const totalAll = records.length

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-xs text-gray-400">Chargement du kanban...</span>
            </div>
        </div>
    )
    if (error) return (
        <div className="flex items-center justify-center h-64 text-danger">
            <div className="flex flex-col items-center gap-2">
                <iconify-icon icon="solar:danger-triangle-bold-duotone" width="32"></iconify-icon>
                <span className="text-sm">Erreur: {error}</span>
                <button onClick={fetchData} className="text-xs text-primary hover:underline mt-1">Réessayer</button>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-1 pb-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {/* Record count */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <iconify-icon icon="solar:layers-bold-duotone" class="text-primary" width="16"></iconify-icon>
                        <span className="font-medium">{totalCount}</span>
                        {searchQuery && totalCount !== totalAll && (
                            <span className="text-xs text-gray-400">/ {totalAll}</span>
                        )}
                        <span className="text-xs">éléments</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <iconify-icon
                            icon="solar:magnifer-bold"
                            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            width="14"
                        ></iconify-icon>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1b2e4b] text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none w-48 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Add button */}
                    <button
                        onClick={() => { setAddModalDefaultColumn(columns[0]?.id || null); setShowAddModal(true) }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary/90 transition-all shadow-sm"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        Ajouter
                    </button>
                </div>
            </div>

            {/* Board */}
            <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{
                    flex: 1,
                    minHeight: 0,
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
                        gap: '0.75rem',
                        padding: '0.25rem',
                        width: 'max-content',
                        minHeight: '100%'
                    }}>
                        {columns.map(col => (
                            <KanbanColumn
                                key={col.id}
                                column={col}
                                recordIds={idsByColumn[col.id] || []}
                                records={recordsByColumn[col.id] || []}
                                onAddClick={handleColumnAddClick}
                                onCardClick={handleCardClick}
                                onInlineAdd={handleInlineAdd}
                                entitySlug={entitySlug}
                                accountNumber={accountNumber}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeRecord ? (
                            <KanbanCard
                                record={activeRecord}
                                isDragging
                                entitySlug={entitySlug}
                                accountNumber={accountNumber}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Quick Add Modal */}
            <QuickAddModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddRecord}
                columns={columns}
                classifications={entityData?.classifications || []}
                defaultColumnId={addModalDefaultColumn}
                entityName={entityData?.name || 'Record'}
                loading={addLoading}
            />

            {/* Card Detail Panel */}
            <CardDetailPanel
                record={selectedRecord}
                isOpen={showDetailPanel}
                onClose={() => { setShowDetailPanel(false); setSelectedRecord(null) }}
                columns={columns}
                entitySlug={entitySlug}
                accountNumber={accountNumber}
            />
        </div>
    )
}
