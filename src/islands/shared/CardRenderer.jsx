/**
 * CardRenderer — Universal card renderer for Kanban, Calendar, etc.
 * 
 * Renders a record card based on a CardTemplate layout definition.
 * Falls back to a default layout if no template is provided.
 */
import React, { useMemo } from 'react'
import { cleanRecordId, recordModuleHref } from './recordLinks'

// ─── Helpers ─────────────────────────────────────────────────────────
function hexToRgba(hex, alpha = 0.1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(128,128,128,${alpha})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

function formatDateShort(val) {
    if (!val) return ''
    const d = new Date(val)
    if (isNaN(d)) return ''
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatDateLong(val) {
    if (!val) return ''
    const d = new Date(val)
    if (isNaN(d)) return ''
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(val) {
    if (!val) return ''
    const d = new Date(val)
    if (isNaN(d)) return ''
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatTimeRange(record, fieldId) {
    // Try to extract start time from record
    const start = record._start ? new Date(record._start) : null
    const end = record._end ? new Date(record._end) : null
    if (start && end) {
        return `${formatTime(start)} — ${formatTime(end)}`
    }
    if (start) return formatTime(start)
    return ''
}

function formatValue(val, format, record) {
    if (val === undefined || val === null) return ''
    switch (format) {
        case 'date': return formatDateShort(val)
        case 'date-long': return formatDateLong(val)
        case 'datetime': return `${formatDateShort(val)} ${formatTime(val)}`
        case 'time': return formatTime(val)
        case 'time-range': return formatTimeRange(record)
        case 'relative': {
            const d = new Date(val)
            if (isNaN(d)) return ''
            const diff = Date.now() - d.getTime()
            const mins = Math.floor(diff / 60000)
            if (mins < 60) return `il y a ${mins}min`
            const hrs = Math.floor(mins / 60)
            if (hrs < 24) return `il y a ${hrs}h`
            const days = Math.floor(hrs / 24)
            return `il y a ${days}j`
        }
        case 'currency': return `${Number(val).toLocaleString('fr-FR')} €`
        case 'number': return Number(val).toLocaleString('fr-FR')
        default: return String(val)
    }
}

function getFieldValue(record, fieldId, entityData) {
    if (!fieldId) return ''
    // Special built-in fields
    switch (fieldId) {
        case '__description__': return record.description || ''
        case '__createdAt__': return record.createdAt || ''
        case '__updatedAt__': return record.updatedAt || ''
        case '__date__': return record._start || record.dueDate || record.createdAt || ''
        case '__time__': return record._start || ''
        case 'title': return record.referenceTitle || record.title || record.computedTitle || ''
        default: break
    }
    // Custom fields: search in customFields array
    if (record.customFields) {
        for (const cf of record.customFields) {
            const cfId = cf.field_id?._id || cf.field_id
            if (String(cfId) === String(fieldId)) {
                return cf.value || ''
            }
        }
    }
    // Also check direct record properties
    if (record[fieldId] !== undefined) return record[fieldId]
    return ''
}

function getStatusInfo(record) {
    const cvs = record.classificationValues || []
    if (cvs.length === 0) return null
    // Return first classification value as status
    const cv = cvs[0]
    return {
        label: cv.optionLabel || cv.label || '',
        color: cv.optionColor || cv.color || '#6366f1'
    }
}

function getAllStatuses(record) {
    return (record.classificationValues || [])
        .filter(cv => cv.optionLabel || cv.label)
        .map(cv => ({
            label: cv.optionLabel || cv.label,
            color: cv.optionColor || cv.color || '#6366f1'
        }))
}

// ─── Font size mapping ───────────────────────────────────────────────
const FONT_SIZES = { xs: '11px', sm: '13px', base: '14px', lg: '16px' }
const FONT_WEIGHTS = { normal: '400', medium: '500', semibold: '600', bold: '700' }
const SHADOW_MAP = { none: 'none', sm: '0 1px 3px rgba(0,0,0,0.08)', md: '0 4px 12px rgba(0,0,0,0.1)', lg: '0 8px 24px rgba(0,0,0,0.12)' }

// ─── Element Renderers ───────────────────────────────────────────────
function renderElement(el, record, entityData, accountNumber, entitySlug, callbacks = {}) {
    if (!el || el.visible === false) return null
    const key = el._id || el.fieldId || el.type + Math.random()
    const baseFontSize = FONT_SIZES[el.fontSize] || FONT_SIZES.sm
    const baseFontWeight = FONT_WEIGHTS[el.fontWeight] || FONT_WEIGHTS.normal

    switch (el.type) {
        case 'title': {
            const title = record.referenceTitle || record.title || record.computedTitle || 'Sans titre'
            return (
                <div key={key} style={{
                    fontSize: baseFontSize, fontWeight: baseFontWeight,
                    lineHeight: '1.3', color: el.color || undefined,
                    ...(el.maxLines > 0 ? {
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: el.maxLines, WebkitBoxOrient: 'vertical'
                    } : {})
                }} className="text-gray-800 dark:text-white-dark">
                    {title}
                </div>
            )
        }

        case 'field': {
            const val = getFieldValue(record, el.fieldId, entityData)
            if (!val && val !== 0) return null
            const formatted = formatValue(val, el.format, record)
            // Resolve label: explicit label > entity field label > none
            let fieldLabel = el.label || ''
            if (!fieldLabel && entityData?.fields && el.fieldId) {
                const fieldDef = entityData.fields.find(f => String(f._id) === String(el.fieldId))
                if (fieldDef) fieldLabel = fieldDef.label || fieldDef.name || ''
            }
            // Resolve icon from entity field definition
            let fieldIcon = el.icon || ''
            if (!fieldIcon && entityData?.fields && el.fieldId) {
                const fieldDef = entityData.fields.find(f => String(f._id) === String(el.fieldId))
                if (fieldDef) fieldIcon = fieldDef.icon || ''
            }
            return (
                <div key={key} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '4px',
                    fontSize: baseFontSize, fontWeight: baseFontWeight,
                    color: el.color || '#6b7280',
                    ...(el.maxLines > 0 ? {
                        overflow: 'hidden', WebkitLineClamp: el.maxLines, WebkitBoxOrient: 'vertical'
                    } : {})
                }}>
                    {fieldIcon && <iconify-icon icon={fieldIcon} width="13" style={{ color: '#9ca3af', flexShrink: 0, marginTop: '2px' }} />}
                    {fieldLabel && (
                        <span style={{
                            fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px',
                            textTransform: 'uppercase', color: 'rgb(75,85,99)',
                            whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                            {fieldLabel}
                        </span>
                    )}
                    {el.prefix && <span>{el.prefix}</span>}
                    <span style={{ fontSize: '12px', fontWeight: '400', letterSpacing: 'normal', textTransform: 'none', color: 'rgb(55,65,81)' }}>
                        {formatted}
                    </span>
                    {el.suffix && <span style={{ marginLeft: 2, opacity: 0.7 }}>{el.suffix}</span>}
                </div>
            )
        }

        case 'status': {
            const statuses = getAllStatuses(record)
            if (statuses.length === 0) return null
            const isPill = el.format === 'pill'
            return (
                <div key={key} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {statuses.slice(0, 3).map((s, i) => (
                        <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: isPill ? '3px 10px' : '2px 6px',
                            borderRadius: isPill ? '20px' : '4px',
                            fontSize: baseFontSize,
                            fontWeight: '600',
                            backgroundColor: hexToRgba(s.color, 0.15),
                            color: s.color,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                            {s.label}
                        </span>
                    ))}
                </div>
            )
        }

        case 'date':
        case 'icon-value': {
            const val = getFieldValue(record, el.fieldId, entityData)
            const formatted = formatValue(val || record._start || record.createdAt, el.format, record)
            if (!formatted) return null
            return (
                <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: baseFontSize, color: el.color || '#6b7280',
                }}>
                    {el.icon && (
                        <iconify-icon icon={el.icon} width="14" height="14" style={{ flexShrink: 0, opacity: 0.7 }} />
                    )}
                    <span>{formatted}</span>
                    {el.suffix && <span style={{ opacity: 0.7 }}>{el.suffix}</span>}
                </div>
            )
        }

        case 'actions': {
            const recordId = cleanRecordId(record)
            const items = el.items || ['edit', 'view']
            return (
                <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
                    {items.includes('open') && (
                        <a
                            href={recordModuleHref(accountNumber, entitySlug, recordId)}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '10px', fontSize: 12, fontWeight: 600, color: '#4361ee',
                                textDecoration: 'none', transition: 'background 0.2s',
                                borderRight: items.includes('close') ? '1px solid #f0f0f0' : 'none',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <iconify-icon icon="solar:pen-new-square-linear" width="14" height="14" />
                            Ouvrir la fiche
                        </a>
                    )}
                    {items.includes('close') && callbacks.onClose && (
                        <button
                            onClick={(e) => { e.stopPropagation(); callbacks.onClose() }}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '10px', fontSize: 12, fontWeight: 600, color: '#888',
                                border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Fermer
                        </button>
                    )}
                    {items.includes('edit') && (
                        <a
                            href={recordModuleHref(accountNumber, entitySlug, recordId)}
                            className="p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{ pointerEvents: 'auto' }}
                        >
                            <iconify-icon icon="solar:pen-new-square-linear" width="14" height="14" />
                        </a>
                    )}
                    {items.includes('view') && (
                        <a
                            href={recordModuleHref(accountNumber, entitySlug, recordId)}
                            className="p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{ pointerEvents: 'auto' }}
                        >
                            <iconify-icon icon="solar:eye-linear" width="14" height="14" />
                        </a>
                    )}
                </div>
            )
        }

        case 'separator':
            return <div key={key} style={{ height: 1, backgroundColor: '#f0f0f0', margin: '4px 0' }} className="dark:bg-gray-700" />

        case 'spacer':
            return <div key={key} style={{ flex: 1 }} />

        case 'text':
            return (
                <span key={key} style={{ fontSize: baseFontSize, fontWeight: baseFontWeight, color: el.color || '#6b7280' }}>
                    {el.label || ''}
                </span>
            )

        case 'badge': {
            const val = getFieldValue(record, el.fieldId, entityData)
            if (!val) return null
            return (
                <span key={key} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 4, fontSize: baseFontSize,
                    fontWeight: '600', backgroundColor: el.color ? hexToRgba(el.color, 0.15) : '#f0f0f0',
                    color: el.color || '#555',
                }}>
                    {formatValue(val, el.format, record)}
                </span>
            )
        }

        case 'html':
            return el.htmlContent ? (
                <div key={key} dangerouslySetInnerHTML={{ __html: el.htmlContent }} style={{ fontSize: baseFontSize }} />
            ) : null

        case 'link':
            return (
                <a key={key} href={el.url || '#'} target={el.linkTarget || '_self'}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: baseFontSize, fontWeight: '500', color: el.color || '#4361ee',
                        textDecoration: 'none',
                    }}
                    onClick={e => e.stopPropagation()}
                    onPointerDown={e => e.stopPropagation()}
                >
                    {el.icon && <iconify-icon icon={el.icon} width="14" />}
                    <span style={{ textDecoration: 'underline' }}>{el.label || 'Lien'}</span>
                </a>
            )

        case 'relations': {
            // In real rendering, show actual entity relations as links
            // Filter by enabledRelations if configured in the card element
            let relations = entityData?.relations || []
            if (el.enabledRelations && el.enabledRelations.length > 0) {
                relations = relations.filter(r => el.enabledRelations.includes(r.key))
            }
            if (relations.length === 0) return null
            return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {relations.map((rel, i) => (
                        <a key={i}
                            href={`/account/${accountNumber}/record/${rel.slug || rel.key}?from=${record._id}`}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                                borderRadius: 6, fontSize: '11px', fontWeight: 600,
                                backgroundColor: (rel.color || '#4361ee') + '12', color: rel.color || '#4361ee',
                                textDecoration: 'none',
                            }}
                            onClick={e => e.stopPropagation()}
                            onPointerDown={e => e.stopPropagation()}
                        >
                            <iconify-icon icon={rel.icon || 'solar:link-bold-duotone'} width="13" />
                            {el.displayMode !== 'icon-only' && (rel.label || rel.name || 'Relation')}
                        </a>
                    ))}
                </div>
            )
        }

        case 'attachments': {
            const attachments = record.attachments || []
            if (attachments.length === 0) return null
            return (
                <div key={key} style={{ fontSize: baseFontSize }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                        <iconify-icon icon="solar:paperclip-bold-duotone" width="12" style={{ color: '#e2a03f' }} />
                        Pièces jointes
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {attachments.slice(0, 5).map((att, i) => (
                            <a key={i} href={att.url || '#'} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '11px', color: '#4361ee', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <iconify-icon icon="solar:file-text-linear" width="12" />
                                {att.name || att.filename || 'Fichier'}
                            </a>
                        ))}
                    </div>
                </div>
            )
        }

        case 'documents': {
            const documents = record.documents || entityData?.documentTemplates || []
            if (documents.length === 0) return null
            return (
                <div key={key} style={{ fontSize: baseFontSize }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                        <iconify-icon icon="solar:file-text-bold-duotone" width="12" style={{ color: '#00ab55' }} />
                        Documents modèles
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {documents.slice(0, 5).map((doc, i) => (
                            <a key={i} href={doc.url || '#'} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: '11px', color: '#00ab55', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <iconify-icon icon="solar:document-text-linear" width="12" />
                                {doc.name || doc.title || 'Document'}
                            </a>
                        ))}
                    </div>
                </div>
            )
        }

        default:
            return null
    }
}

// ─── Zone Renderer ───────────────────────────────────────────────────
function renderZone(zone, record, entityData, accountNumber, entitySlug, callbacks, context) {
    if (!zone || !zone.elements?.length) return null
    const elements = zone.elements.filter(el => el.visible !== false)
    if (elements.length === 0) return null

    // In sidebar context ('universal'), strip zone padding since the parent panel already has padding
    const zonePadding = context === 'universal' ? '0' : (zone.padding || '12px')

    return (
        <div
            key={zone.id || zone._id}
            style={{
                display: 'flex',
                flexDirection: zone.direction === 'row' ? 'row' : 'column',
                gap: `${zone.gap || 4}px`,
                padding: zonePadding,
                alignItems: zone.direction === 'row' ? (
                    zone.align === 'between' ? 'center' :
                        zone.align === 'center' ? 'center' :
                            zone.align === 'end' ? 'flex-end' : 'flex-start'
                ) : undefined,
                justifyContent: zone.direction === 'row' ? (
                    zone.align === 'between' ? 'space-between' :
                        zone.align === 'end' ? 'flex-end' :
                            zone.align === 'stretch' ? 'stretch' : 'flex-start'
                ) : undefined,
                borderTop: zone.borderTop ? '1px solid #f0f0f0' : undefined,
                borderBottom: zone.borderBottom ? '1px solid #f0f0f0' : undefined,
            }}
            className={zone.borderTop ? 'dark:border-gray-700/50' : ''}
        >
            {elements.map(el => renderElement(el, record, entityData, accountNumber, entitySlug, callbacks))}
        </div>
    )
}

// ─── Accent bar renderer ─────────────────────────────────────────────
function getAccentColor(record, layout) {
    if (!layout || layout.accentSource === 'none' || layout.accentPosition === 'none') return null
    if (layout.accentSource === 'fixed') return layout.accentColor || '#4361ee'
    if (layout.accentSource === 'status') {
        const status = getStatusInfo(record)
        return status?.color || '#4361ee'
    }
    return null
}

// ─── Default Layouts (fallbacks) ─────────────────────────────────────
export const DEFAULT_KANBAN_LAYOUT = {
    accentPosition: 'none',
    accentSource: 'none',
    borderRadius: 8,
    shadow: 'sm',
    zones: [
        {
            id: 'body', direction: 'column', gap: 6, padding: '12px',
            elements: [
                { type: 'title', fontSize: 'sm', fontWeight: 'semibold', maxLines: 2, visible: true },
                { type: 'field', fieldId: '__description__', fontSize: 'xs', maxLines: 2, color: '#6b7280', visible: true },
                { type: 'status', format: 'badge', fontSize: 'xs', visible: true },
            ]
        },
        {
            id: 'footer', direction: 'row', gap: 4, padding: '8px 12px',
            align: 'between', borderTop: true,
            elements: [
                { type: 'date', fieldId: '__createdAt__', icon: 'solar:calendar-linear', format: 'date', fontSize: 'xs', visible: true },
                { type: 'actions', items: ['edit', 'view'], visible: true },
            ]
        }
    ]
}

export const DEFAULT_CALENDAR_LAYOUT = {
    accentPosition: 'top',
    accentSource: 'status',
    borderRadius: 14,
    shadow: 'lg',
    zones: [
        {
            id: 'header', direction: 'column', gap: 4, padding: '16px 20px 8px',
            elements: [
                { type: 'title', fontSize: 'base', fontWeight: 'bold', maxLines: 1, visible: true },
            ]
        },
        {
            id: 'body', direction: 'column', gap: 6, padding: '0 20px 12px',
            elements: [
                { type: 'icon-value', fieldId: '__time__', icon: 'solar:clock-circle-linear', format: 'time-range', fontSize: 'xs', visible: true },
                { type: 'icon-value', fieldId: '__date__', icon: 'solar:calendar-linear', format: 'date-long', fontSize: 'xs', visible: true },
                { type: 'status', format: 'pill', fontSize: 'xs', visible: true },
            ]
        },
        {
            id: 'footer', direction: 'row', gap: 0, padding: '0',
            align: 'stretch', borderTop: true,
            elements: [
                { type: 'actions', items: ['open', 'close'], visible: true },
            ]
        }
    ]
}

// ─── Main Component ──────────────────────────────────────────────────
export default function CardRenderer({
    record,
    cardTemplate,       // CardTemplate document (or null for defaults)
    context = 'kanban', // 'kanban' | 'calendar' | 'list'
    entityData,
    accountNumber,
    entitySlug,
    className = '',
    style: styleOverride = {},
    callbacks = {},       // { onClose, onClick, ... }
}) {
    const layout = useMemo(() => {
        if (cardTemplate?.layout) return cardTemplate.layout
        // Fallback to context default
        if (context === 'calendar') return DEFAULT_CALENDAR_LAYOUT
        return DEFAULT_KANBAN_LAYOUT
    }, [cardTemplate, context])

    const accentColor = getAccentColor(record, layout)
    const borderRadius = layout.borderRadius || 8
    const shadow = SHADOW_MAP[layout.shadow] || SHADOW_MAP.sm

    return (
        <div
            className={className}
            style={{
                borderRadius,
                boxShadow: shadow,
                overflow: 'hidden',
                position: 'relative',
                ...styleOverride,
            }}
        >
            {/* Accent bar */}
            {accentColor && layout.accentPosition === 'top' && (
                <div style={{ height: 4, backgroundColor: accentColor }} />
            )}
            {accentColor && layout.accentPosition === 'left' && (
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: 4, backgroundColor: accentColor
                }} />
            )}

            {/* Zones */}
            <div style={{ paddingLeft: layout.accentPosition === 'left' ? 4 : 0 }}>
                {(layout.zones || []).map(zone =>
                    renderZone(zone, record, entityData, accountNumber, entitySlug, callbacks, context)
                )}
            </div>
        </div>
    )
}
