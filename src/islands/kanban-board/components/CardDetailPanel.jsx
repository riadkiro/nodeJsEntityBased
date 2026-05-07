/**
 * CardDetailPanel - ClickUp-style slide-over detail panel
 * Shows full record info: title, description, status, classifications,
 * relations, custom fields, attachments, dates
 */
import React, { useEffect, useRef } from 'react'

function hexToRgba(hex, alpha = 0.1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(128,128,128,${alpha})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

export default function CardDetailPanel({
    record,
    isOpen,
    onClose,
    columns = [],
    entitySlug,
    accountNumber
}) {
    const panelRef = useRef(null)

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen || !record) return null

    const title = record.referenceTitle || record.computedTitle || record.title || 'Sans titre'
    const description = record.description || ''
    const tags = record.tags || []
    const classificationValues = record.classificationValues || []
    const relations = record._denorm?.relations || record.relations || []
    const attachments = record.attachments || []
    const customFields = record.customFields || []

    const editUrl = entitySlug && accountNumber
        ? `/account/${accountNumber}/record/${entitySlug}/${record._id}/overview`
        : null

    // Find current column/status
    const currentColumn = (() => {
        for (const cv of classificationValues) {
            const optId = typeof cv.optionId === 'object' ? (cv.optionId._id || cv.optionId.id) : cv.optionId
            const col = columns.find(c => String(c.id) === String(optId))
            if (col) return col
        }
        return null
    })()

    const formatDate = (d) => {
        if (!d) return null
        return new Date(d).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[998] bg-black/30"
                style={{ backdropFilter: 'blur(2px)' }}
                onMouseDown={onClose}
                onTouchEnd={(e) => { e.preventDefault(); onClose() }}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed top-0 right-0 z-[999] h-full w-full max-w-md bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
                style={{ animation: 'slideIn 0.2s ease-out' }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-[#0e1726] border-b border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {currentColumn && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase"
                                style={{ backgroundColor: currentColumn.color }}
                            >
                                {currentColumn.icon && <iconify-icon icon={currentColumn.icon} width="10"></iconify-icon>}
                                {currentColumn.title}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {editUrl && (
                            <a
                                href={editUrl}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors"
                                title="Ouvrir dans l'éditeur"
                            >
                                <iconify-icon icon="solar:square-top-up-bold" width="16"></iconify-icon>
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Title */}
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {title}
                    </h2>

                    {/* Description */}
                    {description && (
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Description
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Created */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <iconify-icon icon="solar:calendar-add-bold" width="12"></iconify-icon>
                                Créé le
                            </div>
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {formatDate(record.createdAt) || '—'}
                            </div>
                        </div>

                        {/* Updated */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <iconify-icon icon="solar:pen-new-round-bold" width="12"></iconify-icon>
                                Modifié le
                            </div>
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {formatDate(record.updatedAt) || '—'}
                            </div>
                        </div>

                        {/* Due Date */}
                        {record.dueDate && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <iconify-icon icon="solar:alarm-bold" width="12"></iconify-icon>
                                    Échéance
                                </div>
                                <div className={`text-xs font-medium ${new Date(record.dueDate) < new Date() ? 'text-danger' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {formatDate(record.dueDate)}
                                </div>
                            </div>
                        )}

                        {/* Assigned */}
                        {record.assignedTo && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <iconify-icon icon="solar:user-bold" width="12"></iconify-icon>
                                    Assigné à
                                </div>
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {record.assignedTo}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <iconify-icon icon="solar:tag-bold" width="12"></iconify-icon>
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Classifications */}
                    {classificationValues.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <iconify-icon icon="solar:bookmark-bold" width="12"></iconify-icon>
                                Classifications
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {classificationValues.map((cv, i) => {
                                    const label = cv.optionLabel || cv.label || cv.optionId?.label || '—'
                                    const color = cv.optionColor || cv.color || cv.optionId?.color || '#6366f1'
                                    return (
                                        <span
                                            key={i}
                                            className="inline-flex items-center text-xs px-2 py-0.5 rounded-md font-medium"
                                            style={{
                                                backgroundColor: hexToRgba(color, 0.15),
                                                color: color
                                            }}
                                        >
                                            {label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Relations */}
                    {relations.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <iconify-icon icon="solar:link-bold" width="12"></iconify-icon>
                                Relations
                            </h4>
                            <div className="space-y-1.5">
                                {relations.map((rel, i) => {
                                    const label = typeof rel === 'object'
                                        ? (rel.displayValue || rel.title || rel.label || rel.computedTitle || '')
                                        : String(rel)
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/5 dark:bg-secondary/10 border border-secondary/10"
                                        >
                                            <iconify-icon icon="solar:link-circle-bold-duotone" class="text-secondary" width="16"></iconify-icon>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {label || '(relation)'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {attachments.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <iconify-icon icon="solar:paperclip-bold" width="12"></iconify-icon>
                                Pièces jointes ({attachments.length})
                            </h4>
                            <div className="space-y-1.5">
                                {attachments.map((att, i) => {
                                    const name = typeof att === 'string' ? att.split('/').pop() : (att.name || att.filename || `Fichier ${i + 1}`)
                                    const url = typeof att === 'string' ? att : att.url
                                    return (
                                        <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener"
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors group"
                                        >
                                            <iconify-icon icon="solar:file-bold-duotone" class="text-gray-400 group-hover:text-primary" width="16"></iconify-icon>
                                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">
                                                {name}
                                            </span>
                                            <iconify-icon icon="solar:download-minimalistic-bold" class="text-gray-400 opacity-0 group-hover:opacity-100" width="14"></iconify-icon>
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <iconify-icon icon="solar:document-text-bold" width="12"></iconify-icon>
                                Champs personnalisés
                            </h4>
                            <div className="space-y-2">
                                {customFields.map((cf, i) => {
                                    const label = cf.field_id?.label || cf.field_id?.name || `Champ ${i + 1}`
                                    let value = cf.value
                                    if (value === null || value === undefined || value === '') return null
                                    if (typeof value === 'object') value = JSON.stringify(value)
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-start gap-2 text-xs"
                                        >
                                            <span className="text-gray-400 dark:text-gray-500 min-w-[100px] font-medium">{label}</span>
                                            <span className="text-gray-700 dark:text-gray-300 flex-1">{String(value)}</span>
                                        </div>
                                    )
                                }).filter(Boolean)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white dark:bg-[#0e1726] border-t border-gray-100 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        ID: {record._id}
                    </div>
                    {editUrl && (
                        <a
                            href={editUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <iconify-icon icon="solar:pen-2-bold" width="13"></iconify-icon>
                            Modifier
                        </a>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    )
}
