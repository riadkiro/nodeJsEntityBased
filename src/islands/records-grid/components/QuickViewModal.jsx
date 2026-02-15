/**
 * QuickViewModal — ClickUp-style quick view/edit panel
 * 
 * Slides in from the right side as a panel overlay.
 * Shows record details, classifications, custom fields.
 * Allows quick inline editing.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

// ─── Helper: hex to rgba ─────────────────────────────────────────────
function hexToRgba(hex, alpha = 0.1) {
    if (!hex) return `rgba(99, 102, 241, ${alpha})`
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ─── Field Value Display ─────────────────────────────────────────────
function FieldValue({ field, record }) {
    const cf = (record.customFields || []).find(f => {
        const fId = f.field_id?._id || f.field_id
        return fId?.toString() === field.id
    })

    if (!cf) return <span className="text-gray-400 dark:text-gray-600 text-sm italic">—</span>

    const value = cf.value
    if (value === null || value === undefined || value === '') {
        return <span className="text-gray-400 dark:text-gray-600 text-sm italic">—</span>
    }

    // Date fields
    if (field.type === 'date' || field.type === 'datetime') {
        try {
            return <span className="text-sm text-gray-700 dark:text-gray-300">{new Date(value).toLocaleDateString('fr-FR')}</span>
        } catch {
            return <span className="text-sm text-gray-700 dark:text-gray-300">{String(value)}</span>
        }
    }

    // Boolean
    if (field.type === 'boolean' || field.type === 'checkbox') {
        return (
            <span className={`inline-flex items-center gap-1 text-sm ${value ? 'text-success' : 'text-gray-400'}`}>
                {value ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /></svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /></svg>
                )}
                {value ? 'Oui' : 'Non'}
            </span>
        )
    }

    // Relation
    if (field.type === 'relation') {
        if (Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map((v, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
                            {v.title || v.label || v.name || String(v)}
                        </span>
                    ))}
                </div>
            )
        }
        return <span className="text-sm text-gray-700 dark:text-gray-300">{value.title || value.label || String(value)}</span>
    }

    // Number
    if (field.type === 'number') {
        return <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{Number(value).toLocaleString('fr-FR')}</span>
    }

    // Default text
    return <span className="text-sm text-gray-700 dark:text-gray-300">{String(value)}</span>
}

// ─── Main QuickViewModal ─────────────────────────────────────────────
export default function QuickViewModal({ record, columns, accountNumber, entitySlug, onClose }) {
    const panelRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    // Animate in
    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true))
    }, [])

    // Close with animation
    const handleClose = useCallback(() => {
        setIsVisible(false)
        setTimeout(() => onClose(), 250)
    }, [onClose])

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [handleClose])

    if (!record) return null

    const recordId = record._id?.$oid || record._id
    const title = record.referenceTitle || record.title || record.computedTitle || 'Sans titre'
    const description = record.description || ''
    const createdDate = record.createdAt ? new Date(record.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : null
    const updatedDate = record.updatedAt ? new Date(record.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : null

    // Classification values
    const classLabels = (record.classificationValues || [])
        .filter(cv => cv.optionLabel || cv.label)
        .map(cv => ({
            label: cv.optionLabel || cv.label,
            color: cv.optionColor || cv.color || '#6366f1',
            classificationName: cv.classificationName || 'Classification'
        }))

    // Group classifications by name
    const classGroups = {}
    classLabels.forEach(cl => {
        if (!classGroups[cl.classificationName]) {
            classGroups[cl.classificationName] = []
        }
        classGroups[cl.classificationName].push(cl)
    })

    // Filter columns to show as fields (exclude built-in)
    const fieldColumns = columns.filter(c => c.id !== 'title' && c.id !== 'actions' && !c.id.startsWith('class:'))

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ zIndex: 10000 }}
                onMouseDown={handleClose}
                onTouchEnd={(e) => { e.preventDefault(); handleClose() }}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={`fixed right-0 top-0 h-full bg-white dark:bg-[#0e1726] shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-250 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ zIndex: 10001, width: 'min(520px, 90vw)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="#4361ee" strokeWidth="1.5" />
                                <path d="M8 12H16M12 8V16" stroke="#4361ee" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Open full page */}
                        <a
                            href={`/account/${accountNumber}/record/${entitySlug}/${recordId}`}
                            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all"
                            title="Ouvrir la page complète"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M10 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M14 4H20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 4L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </a>
                        {/* Edit full page */}
                        <a
                            href={`/account/${accountNumber}/record/${entitySlug}/${recordId}/edit`}
                            className="p-2 rounded-lg text-gray-400 hover:text-info hover:bg-info/10 transition-all"
                            title="Modifier"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </a>
                        {/* Close */}
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Fermer"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Classification badges section */}
                    {Object.keys(classGroups).length > 0 && (
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
                            {Object.entries(classGroups).map(([groupName, items]) => (
                                <div key={groupName} className="mb-3 last:mb-0">
                                    <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1.5">{groupName}</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {items.map((cl, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105"
                                                style={{
                                                    backgroundColor: hexToRgba(cl.color, 0.15),
                                                    color: cl.color,
                                                    border: `1px solid ${hexToRgba(cl.color, 0.3)}`
                                                }}
                                            >
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cl.color }} />
                                                {cl.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {description && (
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
                            <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">Description</div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{description}</p>
                        </div>
                    )}

                    {/* Custom Fields */}
                    <div className="px-6 py-4">
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-3">Détails</div>
                        <div className="space-y-0">
                            {fieldColumns.map(field => (
                                <div key={field.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                    <div className="w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate">{field.name}</div>
                                    <div className="flex-1 min-w-0">
                                        <FieldValue field={field} record={record} />
                                    </div>
                                </div>
                            ))}

                            {/* Relation fields */}
                            {(record.relations || []).map((rel, i) => (
                                <div key={`rel-${i}`} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                    <div className="w-32 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5 truncate">{rel.label || rel.key || 'Relation'}</div>
                                    <div className="flex-1 min-w-0">
                                        {rel.records?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {rel.records.map((r, j) => (
                                                    <a
                                                        key={j}
                                                        href={`/account/${accountNumber}/record/${rel.entitySlug || entitySlug}/${r._id}`}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                                                    >
                                                        {r.referenceTitle || r.title || 'Sans titre'}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-600 text-sm italic">—</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-[#0a0f1e]/50">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                        <div className="flex items-center gap-3">
                            {createdDate && (
                                <span className="flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6V12L16 14" strokeLinecap="round" />
                                    </svg>
                                    Créé le {createdDate}
                                </span>
                            )}
                            {updatedDate && (
                                <span className="flex items-center gap-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M4.06 13C4.02 12.67 4 12.34 4 12C4 7.58 7.58 4 12 4C14.5 4 16.73 5.15 18.2 6.94M19.94 11C19.98 11.33 20 11.66 20 12C20 16.42 16.42 20 12 20C9.5 20 7.27 18.85 5.8 17.06" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Modifié le {updatedDate}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/account/${accountNumber}/record/${entitySlug}/${recordId}`}
                                className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                Voir
                            </a>
                            <a
                                href={`/account/${accountNumber}/record/${entitySlug}/${recordId}/edit`}
                                className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Modifier
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    )
}
