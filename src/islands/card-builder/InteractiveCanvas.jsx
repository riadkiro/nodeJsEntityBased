/**
 * InteractiveCanvas — WYSIWYG card preview with click-to-select and drag-to-reorder
 */
import React, { useCallback, useRef, useState } from 'react'

// ─── Helpers (copied from CardRenderer for inline rendering) ─────────
function hexToRgba(hex, alpha = 0.1) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!r) return `rgba(128,128,128,${alpha})`
    return `rgba(${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)},${alpha})`
}
const FONT_SIZES = { xs: '11px', sm: '13px', base: '14px', lg: '16px' }
const FONT_WEIGHTS = { normal: '400', medium: '500', semibold: '600', bold: '700' }
const SHADOW_MAP = { none: 'none', sm: '0 1px 3px rgba(0,0,0,0.08)', md: '0 4px 12px rgba(0,0,0,0.1)', lg: '0 8px 24px rgba(0,0,0,0.12)' }

function getFieldValue(record, fieldId) {
    if (!fieldId) return ''
    switch (fieldId) {
        case '__description__': return record.description || ''
        case '__createdAt__': return record.createdAt || ''
        case '__updatedAt__': return record.updatedAt || ''
        case '__date__': return record._start || record.createdAt || ''
        case '__time__': return record._start || ''
        case 'title': return record.referenceTitle || record.title || ''
        default: break
    }
    if (record.customFields) {
        for (const cf of record.customFields) {
            if (String(cf.field_id?._id || cf.field_id) === String(fieldId)) return cf.value || ''
        }
    }
    return record[fieldId] !== undefined ? record[fieldId] : ''
}

function formatValue(val, format, record) {
    if (val === undefined || val === null) return ''
    const d = val ? new Date(val) : null
    switch (format) {
        case 'date': return d && !isNaN(d) ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''
        case 'date-long': return d && !isNaN(d) ? d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
        case 'time': return d && !isNaN(d) ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
        case 'time-range': {
            const s = record._start ? new Date(record._start) : null
            const e = record._end ? new Date(record._end) : null
            if (s && e) return `${s.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — ${e.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
            return s ? s.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
        }
        case 'currency': return `${Number(val).toLocaleString('fr-FR')} €`
        case 'number': return Number(val).toLocaleString('fr-FR')
        default: return String(val)
    }
}

// ─── Interactive Element ─────────────────────────────────────────────
function InteractiveElement({
    el, record, isSelected, onSelect, zoneId, elIndex,
    onDragStartEl, onDragOverEl, onDropEl, dropIndicator,
}) {
    if (!el || el.visible === false) return null
    const fs = FONT_SIZES[el.fontSize] || FONT_SIZES.sm
    const fw = FONT_WEIGHTS[el.fontWeight] || FONT_WEIGHTS.normal

    // Render content by type
    let content = null
    switch (el.type) {
        case 'title':
            content = <div style={{
                fontSize: fs, fontWeight: fw, lineHeight: 1.3, color: el.color || '#1a1a2e',
                ...(el.maxLines > 0 ? { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: el.maxLines, WebkitBoxOrient: 'vertical' } : {})
            }}>{record.referenceTitle || record.title || 'Sans titre'}</div>
            break
        case 'field': {
            const v = getFieldValue(record, el.fieldId)
            content = <div style={{
                fontSize: fs, fontWeight: fw, color: el.color || '#6b7280',
                ...(el.maxLines > 0 ? { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: el.maxLines, WebkitBoxOrient: 'vertical' } : {})
            }}>{el.prefix}{v ? formatValue(v, el.format, record) : 'Valeur du champ'}{el.suffix && <span style={{ marginLeft: 2, opacity: 0.7 }}>{el.suffix}</span>}</div>
            break
        }
        case 'status': {
            const cvs = record.classificationValues || []
            const pill = el.format === 'pill'
            content = cvs.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {cvs.slice(0, 3).map((s, i) => (
                        <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, padding: pill ? '3px 10px' : '2px 6px',
                            borderRadius: pill ? 20 : 4, fontSize: fs, fontWeight: 600,
                            backgroundColor: hexToRgba(s.optionColor || '#6366f1', 0.15), color: s.optionColor || '#6366f1',
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.optionColor || '#6366f1' }} />
                            {s.optionLabel || 'Statut'}
                        </span>
                    ))}
                </div>
            ) : <span style={{ fontSize: fs, color: '#ccc', fontStyle: 'italic' }}>Statut</span>
            break
        }
        case 'date': case 'icon-value': {
            const v = getFieldValue(record, el.fieldId) || record._start || record.createdAt
            content = (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs, color: el.color || '#6b7280' }}>
                    {el.icon && <iconify-icon icon={el.icon} width="14" style={{ flexShrink: 0, opacity: 0.7 }} />}
                    <span>{v ? formatValue(v, el.format, record) : 'Valeur'}</span>
                </div>
            )
            break
        }
        case 'actions':
            content = (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {(el.items || ['edit', 'view']).map(a => (
                        <span key={a} style={{ padding: '4px 6px', borderRadius: 4, fontSize: 11, color: '#4361ee', backgroundColor: '#f0f4ff' }}>
                            <iconify-icon icon={a === 'edit' ? 'solar:pen-new-square-linear' : a === 'view' ? 'solar:eye-linear' : 'solar:link-linear'} width="13" />
                        </span>
                    ))}
                </div>
            )
            break
        case 'separator':
            content = <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '2px 0', width: '100%' }} />
            break
        case 'spacer':
            content = <div style={{ flex: 1, minHeight: 8, background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #f0f0f0 3px, #f0f0f0 4px)', borderRadius: 4, opacity: isSelected ? 1 : 0.3 }} />
            break
        case 'text':
            content = <span style={{ fontSize: fs, fontWeight: fw, color: el.color || '#6b7280' }}>{el.label || 'Texte'}</span>
            break
        case 'badge': {
            const v = getFieldValue(record, el.fieldId)
            content = (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: fs,
                    fontWeight: 600, backgroundColor: el.color ? hexToRgba(el.color, 0.15) : '#f0f0f0', color: el.color || '#555',
                }}>{v ? formatValue(v, el.format, record) : 'Badge'}</span>
            )
            break
        }
        default: content = <span style={{ fontSize: 11, color: '#ccc' }}>{el.type}</span>
    }

    return (
        <div
            data-el-id={el._id}
            draggable
            onDragStart={e => { e.stopPropagation(); onDragStartEl(zoneId, elIndex, el) }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); onDragOverEl(zoneId, elIndex) }}
            onDrop={e => { e.preventDefault(); e.stopPropagation(); onDropEl(zoneId, elIndex) }}
            onClick={e => { e.stopPropagation(); onSelect(el, zoneId) }}
            style={{
                position: 'relative', cursor: 'pointer', borderRadius: 4,
                outline: isSelected ? '2px solid #4361ee' : 'none',
                outlineOffset: 2,
                transition: 'outline 0.15s, box-shadow 0.15s',
                boxShadow: isSelected ? '0 0 0 4px rgba(67,97,238,0.1)' : undefined,
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.outline = '1px dashed #b0bec5'; e.currentTarget.style.outlineOffset = '2px' }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.outline = 'none' }}
        >
            {/* Drop indicator line */}
            {dropIndicator === 'before' && <div style={{ position: 'absolute', top: -3, left: 0, right: 0, height: 2, backgroundColor: '#4361ee', borderRadius: 1, zIndex: 5 }} />}
            {content}
            {dropIndicator === 'after' && <div style={{ position: 'absolute', bottom: -3, left: 0, right: 0, height: 2, backgroundColor: '#4361ee', borderRadius: 1, zIndex: 5 }} />}
        </div>
    )
}

// ─── Interactive Zone ────────────────────────────────────────────────
function InteractiveZone({ zone, zoneIndex, record, selectedId, selectedZoneId, onSelectElement, onSelectZone,
    onDragStartEl, onDragOverEl, onDropEl, dragOverTarget, onDropNewElement }) {
    const isZoneSelected = selectedZoneId === zone.id && !selectedId

    return (
        <div
            onClick={e => { e.stopPropagation(); onSelectZone(zone) }}
            onDragOver={e => {
                e.preventDefault()
                // Allow drop of new elements from palette
                if (e.dataTransfer.types.includes('application/card-element')) {
                    onDragOverEl(zone.id, zone.elements.length)
                }
            }}
            onDrop={e => {
                e.preventDefault()
                const newType = e.dataTransfer.getData('application/card-element')
                if (newType) {
                    onDropNewElement(zone.id, zone.elements.length, newType)
                } else {
                    onDropEl(zone.id, zone.elements.length)
                }
            }}
            style={{
                display: 'flex',
                flexDirection: zone.direction === 'row' ? 'row' : 'column',
                gap: `${zone.gap || 4}px`,
                padding: zone.padding || '12px',
                alignItems: zone.direction === 'row' ? (zone.align === 'center' ? 'center' : zone.align === 'end' ? 'flex-end' : 'flex-start') : undefined,
                justifyContent: zone.direction === 'row' ? (zone.align === 'between' ? 'space-between' : zone.align === 'end' ? 'flex-end' : 'flex-start') : undefined,
                borderTop: zone.borderTop ? '1px solid #e5e7eb' : undefined,
                borderBottom: zone.borderBottom ? '1px solid #e5e7eb' : undefined,
                minHeight: 32,
                outline: isZoneSelected ? '2px solid #10b981' : undefined,
                outlineOffset: -2,
                borderRadius: 2,
                position: 'relative',
                transition: 'outline 0.15s',
            }}
        >
            {zone.elements.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#ccc', fontSize: 12, border: '2px dashed #e0e4ea', borderRadius: 8, width: '100%' }}>
                    <iconify-icon icon="solar:add-circle-linear" width="20" style={{ opacity: 0.4 }} /><br />
                    Glissez un composant ici
                </div>
            )}
            {zone.elements.map((el, elIdx) => {
                const isDropTarget = dragOverTarget?.zoneId === zone.id && dragOverTarget?.elIndex === elIdx
                return (
                    <InteractiveElement
                        key={el._id || elIdx}
                        el={el} record={record}
                        isSelected={selectedId === el._id}
                        onSelect={onSelectElement}
                        zoneId={zone.id} elIndex={elIdx}
                        onDragStartEl={onDragStartEl}
                        onDragOverEl={onDragOverEl}
                        onDropEl={onDropEl}
                        dropIndicator={isDropTarget ? 'before' : (dragOverTarget?.zoneId === zone.id && dragOverTarget?.elIndex === elIdx + 1 && elIdx === zone.elements.length - 1 ? 'after' : null)}
                    />
                )
            })}
        </div>
    )
}

// ─── Main Canvas Component ───────────────────────────────────────────
export default function InteractiveCanvas({
    layout, record, selectedElementId, selectedZoneId,
    onSelectElement, onSelectZone, onClearSelection,
    onMoveElement, onAddElement, onUpdateLayout,
    editContext,
}) {
    const [dragSource, setDragSource] = useState(null) // { zoneId, elIndex, el }
    const [dragOverTarget, setDragOverTarget] = useState(null) // { zoneId, elIndex }

    const handleDragStartEl = useCallback((zoneId, elIndex, el) => {
        setDragSource({ zoneId, elIndex, el })
    }, [])

    const handleDragOverEl = useCallback((zoneId, elIndex) => {
        setDragOverTarget({ zoneId, elIndex })
    }, [])

    const handleDropEl = useCallback((targetZoneId, targetIndex) => {
        if (dragSource) {
            onMoveElement(dragSource.zoneId, dragSource.elIndex, targetZoneId, targetIndex)
        }
        setDragSource(null)
        setDragOverTarget(null)
    }, [dragSource, onMoveElement])

    const handleDropNewElement = useCallback((zoneId, elIndex, type) => {
        onAddElement(zoneId, elIndex, type)
        setDragSource(null)
        setDragOverTarget(null)
    }, [onAddElement])

    const accentColor = layout.accentSource === 'fixed' ? (layout.accentColor || '#4361ee') :
        layout.accentSource === 'status' ? ((record.classificationValues?.[0]?.optionColor) || '#4361ee') : null
    const borderRadius = layout.borderRadius || 8
    const shadow = SHADOW_MAP[layout.shadow] || SHADOW_MAP.sm

    return (
        <div
            style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 40, backgroundColor: '#f0f2f8',
                backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                overflow: 'auto',
            }}
            onClick={onClearSelection}
        >
            {/* Size badge */}
            <div style={{
                marginBottom: 16, fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1,
                display: 'flex', alignItems: 'center', gap: 8
            }}>
                <iconify-icon icon="solar:monitor-linear" width="14" />
                Aperçu WYSIWYG
            </div>

            {/* The card */}
            <div
                style={{
                    width: editContext === 'calendar' ? 320 : 280,
                    backgroundColor: '#fff', borderRadius, boxShadow: shadow,
                    overflow: 'hidden', position: 'relative',
                    transition: 'width 0.3s',
                    border: '1px solid rgba(0,0,0,0.06)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Accent bars */}
                {accentColor && layout.accentPosition === 'top' && (
                    <div style={{ height: 4, backgroundColor: accentColor }} />
                )}
                {accentColor && layout.accentPosition === 'left' && (
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: accentColor, zIndex: 2 }} />
                )}

                <div style={{ paddingLeft: layout.accentPosition === 'left' ? 4 : 0 }}>
                    {(layout.zones || []).map((zone, zIdx) => (
                        <InteractiveZone
                            key={zone.id || zIdx}
                            zone={zone} zoneIndex={zIdx} record={record}
                            selectedId={selectedElementId} selectedZoneId={selectedZoneId}
                            onSelectElement={onSelectElement} onSelectZone={onSelectZone}
                            onDragStartEl={handleDragStartEl} onDragOverEl={handleDragOverEl}
                            onDropEl={handleDropEl} dragOverTarget={dragOverTarget}
                            onDropNewElement={handleDropNewElement}
                        />
                    ))}
                </div>

                {/* Drop zone for adding new zones */}
                {(layout.zones || []).length === 0 && (
                    <div
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                            e.preventDefault()
                            const type = e.dataTransfer.getData('application/card-element')
                            if (type) handleDropNewElement('__new_zone__', 0, type)
                        }}
                        style={{ padding: 40, textAlign: 'center', color: '#ccc', fontSize: 13 }}
                    >
                        <iconify-icon icon="solar:card-2-bold-duotone" width="40" style={{ opacity: 0.2 }} /><br />
                        Glissez des composants ici
                    </div>
                )}
            </div>

            <div style={{ marginTop: 16, fontSize: 11, color: '#aaa', textAlign: 'center' }}>
                Cliquez pour sélectionner · Glissez pour réorganiser
            </div>
        </div>
    )
}
