/**
 * KanbanCard - Enhanced ClickUp-style draggable card
 * Shows: title, description, priority badge, tags, relations, 
 * attachments, dates, progress, assignee avatar, quick actions
 */
import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Priority config
const PRIORITY_CONFIG = {
    Urgent: { color: '#e7515a', bg: '#e7515a15', icon: 'solar:danger-triangle-bold', label: 'Urgent' },
    Haute: { color: '#e2a03f', bg: '#e2a03f15', icon: 'solar:arrow-up-bold', label: 'Haute' },
    Normale: { color: '#2196f3', bg: '#2196f315', icon: 'solar:minus-circle-bold', label: 'Normale' },
    Basse: { color: '#00ab55', bg: '#00ab5515', icon: 'solar:arrow-down-bold', label: 'Basse' }
}

export default function KanbanCard({ record, isDragging = false, onCardClick, entitySlug, accountNumber }) {
    const id = String(record._id)
    const [showActions, setShowActions] = useState(false)

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
        opacity: (isDragging || dragging) ? 0.5 : 1
    }

    const title = record.referenceTitle || record.computedTitle || record.title || 'Sans titre'
    const description = record.description || ''
    const tags = record.tags || []
    const classificationValues = record.classificationValues || []
    const relations = record._denorm?.relations || record.relations || []
    const attachments = record.attachments || []
    const customFields = record.customFields || []

    // Extract priority from classification values
    const priorityInfo = (() => {
        for (const cv of classificationValues) {
            const label = cv.optionLabel || cv.label
            if (label && PRIORITY_CONFIG[label]) return PRIORITY_CONFIG[label]
        }
        return null
    })()

    // Format date
    const dueDate = record.dueDate
        ? new Date(record.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        : null

    const createdDate = record.createdAt
        ? new Date(record.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        : null

    const isOverdue = record.dueDate && new Date(record.dueDate) < new Date()

    // Get relation display items
    const relationItems = relations.slice(0, 2).map((rel, i) => {
        if (typeof rel === 'object') {
            return {
                key: i,
                label: rel.displayValue || rel.title || rel.label || rel.computedTitle || '',
                icon: rel.icon || 'solar:link-bold'
            }
        }
        return { key: i, label: String(rel), icon: 'solar:link-bold' }
    }).filter(r => r.label)

    // Extract progress from custom fields
    const progressField = customFields.find(f => {
        const fieldName = f.field_id?.name || f.field_id?.label || ''
        return fieldName.toLowerCase().includes('progress') || fieldName.toLowerCase().includes('progression')
    })
    const progress = progressField ? parseInt(progressField.value) || 0 : null

    // Handle card click to open detail
    const handleClick = (e) => {
        // Don't open if clicking action buttons
        if (e.target.closest('button') || e.target.closest('a')) return
        if (onCardClick) onCardClick(record)
    }

    // Open in edit page
    const editUrl = entitySlug && accountNumber
        ? `/account/${accountNumber}/record/${entitySlug}/edit/${record._id}`
        : null

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card cursor-move rounded-lg transition-all group relative
                bg-white hover:bg-white border border-gray-200/80 hover:border-primary/30
                dark:bg-[#1b2e4b] dark:hover:bg-[#1b2e4b] dark:border-gray-700/50 dark:hover:border-primary/30
                ${(isDragging || dragging)
                    ? 'shadow-xl ring-2 ring-primary/40 scale-[1.02]'
                    : 'shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md'
                }`}
            data-dnd="card"
            onClick={handleClick}
            {...attributes}
            {...listeners}
        >
            {/* Priority indicator strip */}
            {priorityInfo && (
                <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
                    style={{ backgroundColor: priorityInfo.color }}
                />
            )}

            {/* Content */}
            <div className="p-3 pl-3.5">
                {/* Top row: priority badge + quick actions */}
                <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                        {/* Priority badge */}
                        {priorityInfo && (
                            <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: priorityInfo.bg, color: priorityInfo.color }}
                            >
                                <iconify-icon icon={priorityInfo.icon} width="10"></iconify-icon>
                                {priorityInfo.label}
                            </span>
                        )}
                        {/* Tags */}
                        {tags.slice(0, 2).map((tag, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-medium bg-primary/8 text-primary dark:bg-primary/15"
                            >
                                {tag}
                            </span>
                        ))}
                        {tags.length > 2 && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                +{tags.length - 2}
                            </span>
                        )}
                    </div>

                    {/* Hover actions */}
                    <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5 -mr-1 flex-shrink-0">
                        {editUrl && (
                            <a
                                href={editUrl}
                                onClick={e => e.stopPropagation()}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-info transition-colors"
                                title="Modifier"
                            >
                                <iconify-icon icon="solar:pen-2-bold" width="13"></iconify-icon>
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); if (onCardClick) onCardClick(record) }}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-primary transition-colors"
                            title="Détails"
                        >
                            <iconify-icon icon="solar:maximize-square-bold" width="13"></iconify-icon>
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 leading-5 line-clamp-2 mb-1">
                    {title}
                </div>

                {/* Description */}
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Relations */}
                {relationItems.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {relationItems.map(rel => (
                            <span
                                key={rel.key}
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-secondary/8 text-secondary dark:bg-secondary/15 font-medium"
                            >
                                <iconify-icon icon={rel.icon} width="10"></iconify-icon>
                                <span className="truncate max-w-[100px]">{rel.label}</span>
                            </span>
                        ))}
                        {relations.length > 2 && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                +{relations.length - 2}
                            </span>
                        )}
                    </div>
                )}

                {/* Progress bar */}
                {progress !== null && progress > 0 && (
                    <div className="mb-2">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">Progression</span>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{progress}%</span>
                        </div>
                        <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${Math.min(100, progress)}%`,
                                    backgroundColor: progress >= 100 ? '#00ab55' : progress >= 50 ? '#2196f3' : '#e2a03f'
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Footer meta */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-400 dark:text-gray-500">
                        {/* Date */}
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-danger font-medium' : ''}`}>
                            <iconify-icon icon={isOverdue ? 'solar:alarm-bold' : 'solar:calendar-minimalistic-bold'} width="12"></iconify-icon>
                            {dueDate || createdDate || '—'}
                        </span>

                        {/* Attachments */}
                        {attachments.length > 0 && (
                            <span className="flex items-center gap-0.5">
                                <iconify-icon icon="solar:paperclip-bold" width="12"></iconify-icon>
                                {attachments.length}
                            </span>
                        )}

                        {/* Comments placeholder */}
                        {record.commentsCount > 0 && (
                            <span className="flex items-center gap-0.5">
                                <iconify-icon icon="solar:chat-round-dots-bold" width="12"></iconify-icon>
                                {record.commentsCount}
                            </span>
                        )}
                    </div>

                    {/* Assignee avatar */}
                    {record.assignedTo && (
                        <div
                            className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-bold"
                            title={record.assignedTo}
                        >
                            {String(record.assignedTo).charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
