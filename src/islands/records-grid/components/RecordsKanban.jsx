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
import { cleanRecordId } from '../../shared/recordLinks'
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

function cleanId(value) {
    return String(value?._id?.$oid || value?._id || value || '')
}

function normalizeChoiceOption(option, index = 0) {
    if (typeof option === 'string') {
        return { value: option, label: option, color: '#64748b', order: index }
    }
    const value = String(option?.value ?? option?.id ?? option?._id ?? option?.label ?? option?.name ?? '')
    return {
        value,
        label: option?.label || option?.name || value,
        color: option?.color || option?.couleur || option?.bg || '#64748b',
        order: Number.isFinite(Number(option?.order)) ? Number(option.order) : index,
    }
}

function isCustomPipelineField(field, configuredFieldId) {
    if (!field || typeof field !== 'object') return false
    const fieldId = cleanId(field)
    const typeConfig = field.type_config || field.typeConfig || {}
    const type = String(field.fieldType || field.type || field.render?.input || '').toLowerCase()
    const input = String(field.render?.input || '').toLowerCase()
    const isSelect = type === 'select' || input === 'select'
    return fieldId === String(configuredFieldId) && isSelect && !typeConfig.multiple
}

function normalizeTagValues(value) {
    if (value === undefined || value === null || value === '') return []
    if (Array.isArray(value)) return value.flatMap(item => normalizeTagValues(item))
    if (typeof value === 'object') {
        if (value._v) {
            const values = []
            Object.entries(value).forEach(([key, nested]) => {
                if (key === '_v' || key === 'customText') return
                values.push(...normalizeTagValues(nested))
            })
            if (value.customText) values.push(value.customText)
            return values
        }
        return [String(value.label || value.name || value.value || '').trim()].filter(Boolean)
    }
    return String(value)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
}

function getCustomFieldValue(record, fieldId) {
    const field = (record.customFields || []).find(cf => {
        const currentId = cleanId(cf.field_id)
        return currentId === String(fieldId)
    })
    return field?.value
}

function buildKanbanTags(record, entityData, fieldIds = []) {
    if (!fieldIds.length) return []
    const fieldById = new Map((entityData?.customFields || []).map(field => [cleanId(field), field]))

    return fieldIds.flatMap(fieldId => {
        const field = fieldById.get(String(fieldId))
        if (!field) return []
        const options = (field.type_config?.options || field.typeConfig?.options || field.options || [])
            .map(normalizeChoiceOption)
        const optionByValue = new Map()
        options.forEach(option => {
            optionByValue.set(String(option.value), option)
            optionByValue.set(String(option.label), option)
        })

        return normalizeTagValues(getCustomFieldValue(record, fieldId)).map(rawValue => {
            const option = optionByValue.get(String(rawValue))
            return {
                fieldId,
                label: option?.label || rawValue,
                color: option?.color || field.color || field.ui?.couleur || '#64748b',
            }
        })
    }).filter(tag => tag.label)
}

function KanbanCardTags({ tags }) {
    if (!tags.length) return null
    const visibleTags = tags.slice(0, 4)
    const extraCount = tags.length - visibleTags.length

    return (
        <div className="flex flex-wrap gap-1 border-t border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-white/10 dark:bg-[#0b1220]/70">
            {visibleTags.map((tag, index) => (
                <span
                    key={`${tag.fieldId}-${tag.label}-${index}`}
                    className="inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                        backgroundColor: hexToRgba(tag.color, 0.12),
                        color: tag.color,
                    }}
                >
                    <span className="truncate">{tag.label}</span>
                </span>
            ))}
            {extraCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-white/10 dark:text-white-dark">
                    +{extraCount}
                </span>
            )}
        </div>
    )
}

// ─── Sortable Kanban Card ────────────────────────────────────────────
function KanbanCard({ record, accountNumber, entitySlug, isDragging: isDragProp = false, onQuickView, cardTemplate, entityData, kanbanTagFieldIds }) {
    const pointerStart = useRef(null)
    const didDrag = useRef(false)
    const id = cleanRecordId(record)
    const tags = useMemo(() => buildKanbanTags(record, entityData, kanbanTagFieldIds), [record, entityData, kanbanTagFieldIds])

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
            className={`kanban-card cursor-pointer overflow-hidden rounded-lg border border-gray-200/80 bg-white transition-all group dark:border-white/10 dark:bg-dark/40 ${(isDragProp || dragging) ? 'shadow-lg ring-2 ring-primary/30 cursor-move' : 'hover:shadow-md dark:hover:bg-dark/60'}`}
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
                className="bg-transparent"
                style={{ borderRadius: 0, boxShadow: 'none' }}
            />
            <KanbanCardTags tags={tags} />
        </div>
    )
}

// ─── Droppable Kanban Column ─────────────────────────────────────────
function KanbanColumnView({ column, records, recordIds, accountNumber, entitySlug, onQuickView, cardTemplate, entityData, kanbanTagFieldIds }) {
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
                                    key={cleanRecordId(r)}
                                    record={r}
                                    accountNumber={accountNumber}
                                    entitySlug={entitySlug}
                                    onQuickView={onQuickView}
                                    cardTemplate={cardTemplate}
                                    entityData={entityData}
                                    kanbanTagFieldIds={kanbanTagFieldIds}
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
    kanbanFieldId = 'status',
    kanbanTagFieldIds = [],
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

    // ─── Build columns from configured entity classification options ─
    const kanbanColumns = useMemo(() => {
        if (entityData) {
            const configuredCustomFieldId = String(kanbanFieldId || '').startsWith('field:')
                ? String(kanbanFieldId).slice(6)
                : ''
            const selectedCustomField = configuredCustomFieldId
                ? (entityData.customFields || []).find(field => isCustomPipelineField(field, configuredCustomFieldId))
                : null

            if (selectedCustomField) {
                const typeConfig = selectedCustomField.type_config || selectedCustomField.typeConfig || {}
                const cols = (typeConfig.options || selectedCustomField.options || [])
                    .map(normalizeChoiceOption)
                    .filter(opt => opt.value || opt.label)
                    .map((opt, index) => {
                        const value = String(opt.value || opt.label)
                        return {
                            id: value,
                            title: opt.label || value,
                            color: opt.color || '#6366f1',
                            optionId: value,
                            optionValue: value,
                            order: Number.isFinite(Number(opt.order)) ? Number(opt.order) : index,
                        }
                    })
                    .sort((a, b) => a.order - b.order)

                if (cols.length > 0) {
                    cols.push({
                        id: '__none__',
                        title: 'Non renseigné',
                        color: '#9ca3af',
                        optionId: 'none',
                        optionValue: '',
                    })
                    return {
                        type: 'customField',
                        fieldId: cleanId(selectedCustomField),
                        columns: cols
                    }
                }
            }

            const statusCls = entityData.statusClassification
            const classifications = []
            const seen = new Set()
            ;[statusCls, ...(entityData.classifications || [])].forEach(cls => {
                const id = cleanId(cls)
                if (!id || seen.has(id)) return
                seen.add(id)
                classifications.push(cls)
            })

            let selectedClass = null
            if (kanbanFieldId === 'status' && statusCls) {
                selectedClass = statusCls
            } else {
                selectedClass = classifications.find(cls => {
                    const id = cleanId(cls)
                    return id === String(kanbanFieldId) || `classif:${id}` === String(kanbanFieldId)
                })
            }

            if (!selectedClass) {
                selectedClass = (statusCls && statusCls.options?.length > 0)
                    ? statusCls
                    : classifications.find(cls => cls.options?.length > 0)
            }

            if (selectedClass?.options?.length > 0) {
                const cols = selectedClass.options
                    .map((opt, index) => ({
                        id: cleanId(opt),
                        title: opt.label,
                        color: opt.color || '#6366f1',
                        optionId: cleanId(opt),
                        order: Number.isFinite(Number(opt.order)) ? Number(opt.order) : index,
                    }))
                    .sort((a, b) => a.order - b.order)
                cols.push({
                    id: '__none__',
                    title: selectedClass === statusCls ? 'Sans Statut' : 'Non classé',
                    color: '#9ca3af',
                    optionId: 'none'
                })
                return {
                    type: 'classification',
                    classId: cleanId(selectedClass),
                    columns: cols
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
            return { type: 'classification', classId: bestClassId, columns: cols }
        }

        return {
            type: 'all',
            classId: null,
            columns: [{ id: '__all__', title: 'Tous les enregistrements', color: '#4361ee', optionId: null }]
        }
    }, [records, entityData, kanbanFieldId])

    // ─── Group records by column ─────────────────────────────────────
    const recordsByColumn = useMemo(() => {
        const grouped = {}
        kanbanColumns.columns.forEach(col => (grouped[col.id] = []))

        if (kanbanColumns.type === 'customField' && kanbanColumns.fieldId) {
            const valueToColId = {}
            const labelToColId = {}
            kanbanColumns.columns.forEach(col => {
                if (col.optionId && col.optionId !== 'none') {
                    valueToColId[String(col.optionValue || col.optionId)] = col.id
                    labelToColId[String(col.title)] = col.id
                }
            })

            records.forEach(r => {
                const rawValue = getCustomFieldValue(r, kanbanColumns.fieldId)
                const firstValue = Array.isArray(rawValue) ? rawValue[0] : rawValue
                const key = firstValue === undefined || firstValue === null ? '' : String(firstValue)
                const colId = valueToColId[key] || labelToColId[key]
                if (colId && grouped[colId]) {
                    grouped[colId].push(r)
                } else if (grouped['__none__']) {
                    grouped['__none__'].push(r)
                }
            })
        } else if (!kanbanColumns.classId) {
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
                    return String(classId) === String(kanbanColumns.classId)
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
                const ia = order.indexOf(cleanRecordId(a))
                const ib = order.indexOf(cleanRecordId(b))
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
            out[col.id] = (recordsByColumn[col.id] || []).map(r => cleanRecordId(r)).filter(Boolean)
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
        return records.find(r => cleanRecordId(r) === String(activeId)) || null
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
    const updateRecordPipeline = useCallback(async (recordId, toColumnId) => {
        const toCol = kanbanColumns.columns.find(c => c.id === toColumnId)
        if (!toCol) return

        try {
            if (kanbanColumns.type === 'customField' && kanbanColumns.fieldId) {
                await fetch(`/account/${accountNumber}/record/${entitySlug}/${recordId}/update-field`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        fieldKey: kanbanColumns.fieldId,
                        value: toCol.optionId === 'none' ? '' : (toCol.optionValue || toCol.optionId || '')
                    })
                })
            } else if (kanbanColumns.classId) {
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
            }
        } catch (err) {
            console.error('[RecordsKanban] Update error:', err)
        }
    }, [accountNumber, entitySlug, kanbanColumns])

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

        // Optimistic update: move record's pipeline value to new column
        const toColumn = kanbanColumns.columns.find(c => c.id === toCol)
        if (kanbanColumns.type === 'customField' && kanbanColumns.fieldId) {
            setRecords(prev => prev.map(r => {
                if (cleanRecordId(r) !== activeRecordId) return r
                const nextCustomFields = [...(r.customFields || [])]
                const fieldIndex = nextCustomFields.findIndex(cf => cleanId(cf.field_id) === String(kanbanColumns.fieldId))
                const nextValue = toCol === '__none__' ? '' : (toColumn?.optionValue || toColumn?.optionId || '')
                if (fieldIndex >= 0) {
                    nextCustomFields[fieldIndex] = { ...nextCustomFields[fieldIndex], value: nextValue }
                } else if (nextValue) {
                    nextCustomFields.push({ field_id: kanbanColumns.fieldId, value: nextValue })
                }
                return { ...r, customFields: nextCustomFields }
            }))

            updateRecordPipeline(activeRecordId, toCol)
        } else if (kanbanColumns.classId) {
            setRecords(prev => prev.map(r => {
                if (cleanRecordId(r) !== activeRecordId) return r
                const newCvs = (r.classificationValues || []).filter(cv => {
                    const cId = cv.classificationId?.$oid || cv.classificationId || cv.classification_id
                    return String(cId) !== String(kanbanColumns.classId)
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
            updateRecordPipeline(activeRecordId, toCol)
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
                                kanbanTagFieldIds={kanbanTagFieldIds}
                            />
                        )
                    })}
                </div>

                <DragOverlay>
                    {activeRecord ? <KanbanCard record={activeRecord} accountNumber={accountNumber} entitySlug={entitySlug} isDragging cardTemplate={cardTemplate} entityData={entityData} kanbanTagFieldIds={kanbanTagFieldIds} /> : null}
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
