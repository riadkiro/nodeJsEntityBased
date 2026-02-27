/**
 * CardBuilder — Visual card template editor
 *
 * Features:
 * - List existing card templates for the entity
 * - Create from presets or blank
 * - Visual zone/element editor with live preview
 * - Save to API
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import CardRenderer, { DEFAULT_KANBAN_LAYOUT, DEFAULT_CALENDAR_LAYOUT } from '../shared/CardRenderer'

// ─── Constants ───────────────────────────────────────────────────────
const CONTEXTS = [
    { value: 'kanban', label: 'Kanban', icon: 'solar:widget-2-bold-duotone' },
    { value: 'calendar', label: 'Calendrier', icon: 'solar:calendar-bold-duotone' },
    { value: 'universal', label: 'Universel', icon: 'solar:layers-bold-duotone' },
]

const ELEMENT_TYPES = [
    { type: 'title', label: 'Titre', icon: 'solar:text-bold-bold-duotone', desc: 'Titre du record' },
    { type: 'field', label: 'Champ', icon: 'solar:document-text-bold-duotone', desc: 'Valeur d\'un champ' },
    { type: 'status', label: 'Statut', icon: 'solar:tag-bold-duotone', desc: 'Badge de statut' },
    { type: 'date', label: 'Date', icon: 'solar:calendar-linear', desc: 'Date avec icône' },
    { type: 'icon-value', label: 'Icône + Valeur', icon: 'solar:info-circle-bold-duotone', desc: 'Icône et texte' },
    { type: 'actions', label: 'Actions', icon: 'solar:menu-dots-bold', desc: 'Boutons d\'action' },
    { type: 'separator', label: 'Séparateur', icon: 'solar:minus-circle-bold-duotone', desc: 'Ligne de séparation' },
    { type: 'spacer', label: 'Espace', icon: 'solar:maximize-bold-duotone', desc: 'Espace flexible' },
    { type: 'text', label: 'Texte', icon: 'solar:text-italic-bold-duotone', desc: 'Texte libre' },
    { type: 'badge', label: 'Badge', icon: 'solar:bookmark-bold-duotone', desc: 'Badge coloré' },
]

const FIELD_OPTIONS = [
    { value: '__description__', label: 'Description' },
    { value: '__createdAt__', label: 'Date de création' },
    { value: '__updatedAt__', label: 'Dernière modification' },
    { value: '__date__', label: 'Date (auto)' },
    { value: '__time__', label: 'Heure (auto)' },
    { value: 'title', label: 'Titre' },
]

const FORMAT_OPTIONS = [
    { value: '', label: 'Texte brut' },
    { value: 'date', label: 'Date courte' },
    { value: 'date-long', label: 'Date longue' },
    { value: 'datetime', label: 'Date + Heure' },
    { value: 'time', label: 'Heure' },
    { value: 'time-range', label: 'Plage horaire' },
    { value: 'relative', label: 'Relatif (il y a…)' },
    { value: 'currency', label: 'Monétaire (€)' },
    { value: 'number', label: 'Nombre' },
]

const FONT_SIZE_OPTIONS = [
    { value: 'xs', label: 'XS (11px)' },
    { value: 'sm', label: 'SM (13px)' },
    { value: 'base', label: 'Base (14px)' },
    { value: 'lg', label: 'LG (16px)' },
]

const FONT_WEIGHT_OPTIONS = [
    { value: 'normal', label: 'Normal' },
    { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semibold' },
    { value: 'bold', label: 'Bold' },
]

// ─── Sample record for preview ──────────────────────────────────────
const SAMPLE_RECORD = {
    _id: 'sample-001',
    referenceTitle: 'RDV - Marie Dupont',
    title: 'RDV - Marie Dupont',
    description: 'Consultation de suivi pour le traitement en cours.',
    _start: new Date(Date.now() + 86400000),
    _end: new Date(Date.now() + 86400000 + 1800000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    classificationValues: [
        { optionLabel: 'Planifié', optionColor: '#4361ee' },
    ],
    tags: ['suivi', 'important'],
    customFields: [],
}

// ─── Helpers ────────────────────────────────────────────────────────
const genId = () => 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)

function createDefaultElement(type) {
    const base = { type, visible: true, fontSize: 'sm', fontWeight: 'normal', _id: genId() }
    switch (type) {
        case 'title': return { ...base, fontWeight: 'semibold', maxLines: 2 }
        case 'field': return { ...base, fieldId: '__description__', maxLines: 2, color: '#6b7280' }
        case 'status': return { ...base, format: 'badge' }
        case 'date': return { ...base, fieldId: '__createdAt__', icon: 'solar:calendar-linear', format: 'date' }
        case 'icon-value': return { ...base, fieldId: '__time__', icon: 'solar:clock-circle-linear', format: 'time-range' }
        case 'actions': return { ...base, items: ['edit', 'view'] }
        case 'separator': return { ...base }
        case 'spacer': return { ...base }
        case 'text': return { ...base, label: 'Texte personnalisé' }
        case 'badge': return { ...base, fieldId: '__description__', color: '#4361ee' }
        default: return base
    }
}

function createDefaultZone(id = 'zone_' + Date.now()) {
    return {
        id,
        direction: 'column',
        gap: 6,
        padding: '12px',
        elements: [],
        borderTop: false,
        borderBottom: false,
        align: 'start',
    }
}

// ─── Element Editor Panel ────────────────────────────────────────────
function ElementEditor({ element, entityFields, onChange, onRemove }) {
    const update = (key, val) => onChange({ ...element, [key]: val })

    return (
        <div style={{
            padding: '10px 12px', backgroundColor: '#f8f9ff', borderRadius: 8,
            border: '1px solid #e8eaf0', marginBottom: 6,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <iconify-icon icon={ELEMENT_TYPES.find(e => e.type === element.type)?.icon || 'solar:star-linear'} width="14" height="14" style={{ color: '#4361ee' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                        {ELEMENT_TYPES.find(e => e.type === element.type)?.label || element.type}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888', cursor: 'pointer' }}>
                        <input type="checkbox" checked={element.visible !== false} onChange={e => update('visible', e.target.checked)}
                            style={{ width: 14, height: 14, accentColor: '#4361ee' }} />
                        Visible
                    </label>
                    <button onClick={onRemove} style={{
                        width: 22, height: 22, borderRadius: 4, border: 'none', backgroundColor: '#fee2e2',
                        color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, lineHeight: 1,
                    }}>×</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {/* Field selector */}
                {['field', 'date', 'icon-value', 'badge'].includes(element.type) && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Champ</label>
                        <select value={element.fieldId || ''} onChange={e => update('fieldId', e.target.value)}
                            style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginTop: 2 }}>
                            {FIELD_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            {entityFields.map(f => <option key={f._id} value={f._id}>{f.label || f.name}</option>)}
                        </select>
                    </div>
                )}

                {/* Format */}
                {['field', 'date', 'icon-value', 'badge', 'status'].includes(element.type) && (
                    <div>
                        <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Format</label>
                        {element.type === 'status' ? (
                            <select value={element.format || 'badge'} onChange={e => update('format', e.target.value)}
                                style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginTop: 2 }}>
                                <option value="badge">Badge</option>
                                <option value="pill">Pill</option>
                            </select>
                        ) : (
                            <select value={element.format || ''} onChange={e => update('format', e.target.value)}
                                style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginTop: 2 }}>
                                {FORMAT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                        )}
                    </div>
                )}

                {/* Icon */}
                {['date', 'icon-value'].includes(element.type) && (
                    <div>
                        <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Icône</label>
                        <input value={element.icon || ''} onChange={e => update('icon', e.target.value)} placeholder="solar:calendar-linear"
                            style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginTop: 2 }} />
                    </div>
                )}

                {/* Font Size */}
                <div>
                    <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Taille</label>
                    <select value={element.fontSize || 'sm'} onChange={e => update('fontSize', e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginTop: 2 }}>
                        {FONT_SIZE_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                </div>

                {/* Font Weight */}
                <div>
                    <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Graisse</label>
                    <select value={element.fontWeight || 'normal'} onChange={e => update('fontWeight', e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginTop: 2 }}>
                        {FONT_WEIGHT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                </div>

                {/* Color */}
                <div>
                    <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Couleur</label>
                    <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                        <input type="color" value={element.color || '#6b7280'} onChange={e => update('color', e.target.value)}
                            style={{ width: 30, height: 28, borderRadius: 4, border: '1px solid #ddd', padding: 1, cursor: 'pointer' }} />
                        <input value={element.color || ''} onChange={e => update('color', e.target.value)} placeholder="#6b7280"
                            style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
                    </div>
                </div>

                {/* Max Lines */}
                {['title', 'field'].includes(element.type) && (
                    <div>
                        <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Max lignes</label>
                        <input type="number" min="0" max="10" value={element.maxLines || 0} onChange={e => update('maxLines', parseInt(e.target.value) || 0)}
                            style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginTop: 2 }} />
                    </div>
                )}

                {/* Text label */}
                {element.type === 'text' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Texte</label>
                        <input value={element.label || ''} onChange={e => update('label', e.target.value)}
                            style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginTop: 2 }} />
                    </div>
                )}

                {/* Action items */}
                {element.type === 'actions' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Actions</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {['edit', 'view', 'open', 'close'].map(action => (
                                <label key={action} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={(element.items || []).includes(action)}
                                        onChange={e => {
                                            const items = [...(element.items || [])]
                                            if (e.target.checked) items.push(action)
                                            else items.splice(items.indexOf(action), 1)
                                            update('items', items)
                                        }}
                                        style={{ width: 14, height: 14, accentColor: '#4361ee' }} />
                                    {action}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Zone Editor ─────────────────────────────────────────────────────
function ZoneEditor({ zone, index, entityFields, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
    const [collapsed, setCollapsed] = useState(false)

    const updateZone = (key, val) => onChange({ ...zone, [key]: val })
    const updateElement = (elIndex, updatedEl) => {
        const els = [...zone.elements]
        els[elIndex] = updatedEl
        onChange({ ...zone, elements: els })
    }
    const removeElement = (elIndex) => {
        const els = [...zone.elements]
        els.splice(elIndex, 1)
        onChange({ ...zone, elements: els })
    }
    const addElement = (type) => {
        onChange({ ...zone, elements: [...zone.elements, createDefaultElement(type)] })
    }
    const moveElement = (fromIdx, toIdx) => {
        if (toIdx < 0 || toIdx >= zone.elements.length) return
        const els = [...zone.elements]
        const [moved] = els.splice(fromIdx, 1)
        els.splice(toIdx, 0, moved)
        onChange({ ...zone, elements: els })
    }

    return (
        <div style={{
            border: '1px solid #e0e4ea', borderRadius: 10, backgroundColor: '#fff',
            overflow: 'hidden', marginBottom: 10,
        }}>
            {/* Zone header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', backgroundColor: '#f4f6fa', borderBottom: collapsed ? 'none' : '1px solid #e8eaf0',
                cursor: 'pointer',
            }} onClick={() => setCollapsed(!collapsed)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <iconify-icon icon={collapsed ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-down-linear'} width="14" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{zone.id || `Zone ${index + 1}`}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>({zone.elements.length} éléments)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                    {!isFirst && (
                        <button onClick={onMoveUp} style={zoneActionBtnStyle} title="Monter">
                            <iconify-icon icon="solar:alt-arrow-up-linear" width="12" />
                        </button>
                    )}
                    {!isLast && (
                        <button onClick={onMoveDown} style={zoneActionBtnStyle} title="Descendre">
                            <iconify-icon icon="solar:alt-arrow-down-linear" width="12" />
                        </button>
                    )}
                    <button onClick={onRemove} style={{ ...zoneActionBtnStyle, backgroundColor: '#fee2e2', color: '#ef4444' }} title="Supprimer">
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="12" />
                    </button>
                </div>
            </div>

            {!collapsed && (
                <div style={{ padding: '10px 12px' }}>
                    {/* Zone settings */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }}>
                        <div>
                            <label style={labelStyle}>ID</label>
                            <input value={zone.id || ''} onChange={e => updateZone('id', e.target.value)}
                                style={inputStyle} placeholder="body" />
                        </div>
                        <div>
                            <label style={labelStyle}>Direction</label>
                            <select value={zone.direction || 'column'} onChange={e => updateZone('direction', e.target.value)} style={inputStyle}>
                                <option value="column">Colonne</option>
                                <option value="row">Ligne</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Gap (px)</label>
                            <input type="number" min="0" max="24" value={zone.gap || 0} onChange={e => updateZone('gap', parseInt(e.target.value) || 0)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Align</label>
                            <select value={zone.align || 'start'} onChange={e => updateZone('align', e.target.value)} style={inputStyle}>
                                <option value="start">Début</option>
                                <option value="center">Centre</option>
                                <option value="end">Fin</option>
                                <option value="between">Espacé</option>
                                <option value="stretch">Étiré</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Padding</label>
                            <input value={zone.padding || ''} onChange={e => updateZone('padding', e.target.value)} style={inputStyle} placeholder="12px" />
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!zone.borderTop} onChange={e => updateZone('borderTop', e.target.checked)}
                                    style={{ width: 14, height: 14, accentColor: '#4361ee' }} />
                                Bordure haut
                            </label>
                        </div>
                    </div>

                    {/* Elements list */}
                    {zone.elements.map((el, elIdx) => (
                        <div key={el._id || elIdx} style={{ position: 'relative', marginBottom: 4 }}>
                            {/* Move arrows */}
                            <div style={{
                                position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
                                display: 'flex', flexDirection: 'column', gap: 2,
                            }}>
                                {elIdx > 0 && (
                                    <button onClick={() => moveElement(elIdx, elIdx - 1)} style={miniArrowStyle}>▲</button>
                                )}
                                {elIdx < zone.elements.length - 1 && (
                                    <button onClick={() => moveElement(elIdx, elIdx + 1)} style={miniArrowStyle}>▼</button>
                                )}
                            </div>
                            <ElementEditor
                                element={el}
                                entityFields={entityFields}
                                onChange={(updated) => updateElement(elIdx, updated)}
                                onRemove={() => removeElement(elIdx)}
                            />
                        </div>
                    ))}

                    {/* Add element dropdown */}
                    <AddElementButton onAdd={addElement} />
                </div>
            )}
        </div>
    )
}

// ─── Add Element Button with Dropdown ────────────────────────────────
function AddElementButton({ onAdd }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={{
                width: '100%', padding: '8px', border: '2px dashed #d1d5db', borderRadius: 8,
                backgroundColor: open ? '#f0f4ff' : 'transparent', cursor: 'pointer', fontSize: 12,
                fontWeight: 600, color: '#4361ee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s',
            }}>
                <iconify-icon icon="solar:add-circle-linear" width="16" />
                Ajouter un élément
            </button>
            {open && (
                <div style={{
                    position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 50,
                    backgroundColor: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    padding: 6, marginBottom: 4, maxHeight: 280, overflowY: 'auto',
                }}>
                    {ELEMENT_TYPES.map(et => (
                        <button key={et.type} onClick={() => { onAdd(et.type); setOpen(false) }} style={{
                            width: '100%', padding: '8px 10px', border: 'none', backgroundColor: 'transparent',
                            cursor: 'pointer', borderRadius: 6, textAlign: 'left', fontSize: 12,
                            display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <iconify-icon icon={et.icon} width="16" height="16" style={{ color: '#4361ee', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontWeight: 600, color: '#333' }}>{et.label}</div>
                                <div style={{ fontSize: 10, color: '#888' }}>{et.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Styles ──────────────────────────────────────────────────────────
const labelStyle = { fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 2 }
const inputStyle = { width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }
const zoneActionBtnStyle = {
    width: 24, height: 24, borderRadius: 6, border: 'none', backgroundColor: '#e8eaf0', color: '#555',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const miniArrowStyle = {
    width: 16, height: 14, border: 'none', backgroundColor: '#e8eaf0', borderRadius: 3,
    cursor: 'pointer', fontSize: 8, color: '#555', lineHeight: 1,
}

// ─── Card List Item ──────────────────────────────────────────────────
function CardListItem({ card, isActive, onClick, onSetDefault, onDelete }) {
    return (
        <div onClick={onClick} style={{
            padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
            border: isActive ? '2px solid #4361ee' : '1px solid #e5e7eb',
            backgroundColor: isActive ? '#f0f4ff' : '#fff', transition: 'all 0.2s',
            marginBottom: 6,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{card.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                            backgroundColor: card.context === 'kanban' ? '#eef2ff' : card.context === 'calendar' ? '#f0fdf4' : '#fef3c7',
                            color: card.context === 'kanban' ? '#4361ee' : card.context === 'calendar' ? '#00ab55' : '#d97706',
                        }}>{card.context}</span>
                        {card.isDefault && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, backgroundColor: '#dbeafe', color: '#2563eb' }}>
                                par défaut
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    {!card.isDefault && (
                        <button onClick={() => onSetDefault(card)} title="Définir par défaut"
                            style={{ ...zoneActionBtnStyle, width: 26, height: 26 }}>
                            <iconify-icon icon="solar:star-linear" width="13" />
                        </button>
                    )}
                    <button onClick={() => onDelete(card)} title="Supprimer"
                        style={{ ...zoneActionBtnStyle, width: 26, height: 26, backgroundColor: '#fee2e2', color: '#ef4444' }}>
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="13" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────
export default function CardBuilder({ accountNumber, entityId, entityName, entitySlug, entityIcon, entityColor, fieldsJson }) {
    const entityFields = useMemo(() => { try { return JSON.parse(fieldsJson) } catch { return [] } }, [fieldsJson])

    // State
    const [cards, setCards] = useState([])
    const [activeCard, setActiveCard] = useState(null)
    const [presets, setPresets] = useState([])
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [showPresets, setShowPresets] = useState(false)

    // Editor state (local copy of the active card's layout)
    const [editName, setEditName] = useState('')
    const [editContext, setEditContext] = useState('kanban')
    const [editLayout, setEditLayout] = useState(null)

    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 2500)
    }, [])

    // ─── Fetch cards & presets ────────────────────────────────────────
    useEffect(() => {
        fetch(`/account/${accountNumber}/api/entity/${entityId}/cards`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => { if (data.success) setCards(data.cards || []) })
            .catch(() => { })

        fetch(`/account/${accountNumber}/api/card-presets`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => { if (data.success) setPresets(data.presets || []) })
            .catch(() => { })
    }, [accountNumber, entityId])

    // ─── Select a card for editing ───────────────────────────────────
    const selectCard = useCallback((card) => {
        setActiveCard(card)
        setEditName(card.name)
        setEditContext(card.context || 'kanban')
        setEditLayout(JSON.parse(JSON.stringify(card.layout || {})))
    }, [])

    // ─── Create new card ─────────────────────────────────────────────
    const createCard = useCallback(async (preset = null) => {
        const newCard = {
            name: preset ? preset.name : 'Nouvelle carte',
            context: preset ? preset.context : 'kanban',
            isDefault: false,
            layout: preset ? JSON.parse(JSON.stringify(preset.layout)) : {
                accentPosition: 'none', accentSource: 'none', borderRadius: 8, shadow: 'sm',
                zones: [createDefaultZone('body')],
            },
        }
        try {
            const res = await fetch(`/account/${accountNumber}/api/entity/${entityId}/cards`, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCard),
            })
            const data = await res.json()
            if (data.success) {
                setCards(prev => [...prev, data.card])
                selectCard(data.card)
                showToast('Carte créée !')
                setShowPresets(false)
            }
        } catch (err) { showToast('Erreur création', 'error') }
    }, [accountNumber, entityId, selectCard, showToast])

    // ─── Save current card ───────────────────────────────────────────
    const saveCard = useCallback(async () => {
        if (!activeCard?._id) return
        setSaving(true)
        try {
            const res = await fetch(`/account/${accountNumber}/api/entity/${entityId}/cards/${activeCard._id}`, {
                method: 'PUT', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, context: editContext, layout: editLayout }),
            })
            const data = await res.json()
            if (data.success) {
                setCards(prev => prev.map(c => c._id === activeCard._id ? data.card : c))
                setActiveCard(data.card)
                showToast('Carte sauvegardée !')
            }
        } catch (err) { showToast('Erreur sauvegarde', 'error') }
        setSaving(false)
    }, [activeCard, editName, editContext, editLayout, accountNumber, entityId, showToast])

    // ─── Set default ─────────────────────────────────────────────────
    const handleSetDefault = useCallback(async (card) => {
        try {
            const res = await fetch(`/account/${accountNumber}/api/entity/${entityId}/cards/${card._id}/set-default`, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            if (data.success) {
                setCards(prev => prev.map(c => ({
                    ...c,
                    isDefault: c._id === card._id ? true : (c.context === card.context ? false : c.isDefault)
                })))
                showToast('Défaut mis à jour !')
            }
        } catch { showToast('Erreur', 'error') }
    }, [accountNumber, entityId, showToast])

    // ─── Delete card ─────────────────────────────────────────────────
    const handleDelete = useCallback(async (card) => {
        if (!confirm(`Supprimer la carte "${card.name}" ?`)) return
        try {
            await fetch(`/account/${accountNumber}/api/entity/${entityId}/cards/${card._id}`, {
                method: 'DELETE', credentials: 'include',
            })
            setCards(prev => prev.filter(c => c._id !== card._id))
            if (activeCard?._id === card._id) { setActiveCard(null); setEditLayout(null) }
            showToast('Carte supprimée')
        } catch { showToast('Erreur suppression', 'error') }
    }, [accountNumber, entityId, activeCard, showToast])

    // ─── Layout helpers ──────────────────────────────────────────────
    const updateLayoutField = (key, val) => setEditLayout(prev => ({ ...prev, [key]: val }))
    const updateZone = (idx, updatedZone) => {
        setEditLayout(prev => {
            const zones = [...(prev.zones || [])]
            zones[idx] = updatedZone
            return { ...prev, zones }
        })
    }
    const removeZone = (idx) => {
        setEditLayout(prev => {
            const zones = [...(prev.zones || [])]
            zones.splice(idx, 1)
            return { ...prev, zones }
        })
    }
    const addZone = () => {
        setEditLayout(prev => ({
            ...prev,
            zones: [...(prev.zones || []), createDefaultZone()],
        }))
    }
    const moveZone = (fromIdx, toIdx) => {
        setEditLayout(prev => {
            const zones = [...(prev.zones || [])]
            const [moved] = zones.splice(fromIdx, 1)
            zones.splice(toIdx, 0, moved)
            return { ...prev, zones }
        })
    }

    // Build a live-preview template from the editor state
    const previewTemplate = useMemo(() => {
        if (!editLayout) return null
        return { layout: editLayout }
    }, [editLayout])

    return (
        <div style={{
            display: 'flex', height: '100%', fontFamily: "'Inter', -apple-system, sans-serif",
            backgroundColor: '#f7f8fc', overflow: 'hidden',
        }}>
            {/* ─── Left Panel: Card List ───────────────────────────── */}
            <div style={{
                width: 280, flexShrink: 0, borderRight: '1px solid #e5e7eb',
                backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px', borderBottom: '1px solid #f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {entityIcon && <iconify-icon icon={entityIcon} width="20" style={{ color: entityColor || '#4361ee' }} />}
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Cards</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setShowPresets(true)} style={{
                            padding: '6px 10px', borderRadius: 6, border: '1px solid #e0e4ea',
                            backgroundColor: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                            color: '#555', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4361ee'; e.currentTarget.style.color = '#4361ee' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e4ea'; e.currentTarget.style.color = '#555' }}
                        >
                            <iconify-icon icon="solar:copy-bold-duotone" width="14" />
                            Presets
                        </button>
                        <button onClick={() => createCard()} style={{
                            padding: '6px 10px', borderRadius: 6, border: 'none',
                            backgroundColor: '#4361ee', color: '#fff', cursor: 'pointer',
                            fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <iconify-icon icon="solar:add-circle-bold" width="14" />
                            Créer
                        </button>
                    </div>
                </div>

                {/* Card list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
                    {cards.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                            <iconify-icon icon="solar:card-2-bold-duotone" width="48" style={{ opacity: 0.3 }} />
                            <p style={{ fontSize: 13, marginTop: 12 }}>Aucune carte créée</p>
                            <p style={{ fontSize: 11, color: '#aaa' }}>Créez votre première carte ci-dessus</p>
                        </div>
                    ) : (
                        cards.map(card => (
                            <CardListItem
                                key={card._id}
                                card={card}
                                isActive={activeCard?._id === card._id}
                                onClick={() => selectCard(card)}
                                onSetDefault={handleSetDefault}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ─── Center: Editor ──────────────────────────────────── */}
            {activeCard && editLayout ? (
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Editor panel */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '20px', maxWidth: 520,
                    }}>
                        {/* Card info */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Nom</label>
                                    <input value={editName} onChange={e => setEditName(e.target.value)}
                                        style={{ ...inputStyle, fontWeight: 600, fontSize: 14 }} />
                                </div>
                                <div style={{ width: 140 }}>
                                    <label style={labelStyle}>Contexte</label>
                                    <select value={editContext} onChange={e => setEditContext(e.target.value)} style={inputStyle}>
                                        {CONTEXTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Visual settings */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '12px', backgroundColor: '#f8f9ff', borderRadius: 8, border: '1px solid #e8eaf0' }}>
                                <div>
                                    <label style={labelStyle}>Accent</label>
                                    <select value={editLayout.accentPosition || 'none'} onChange={e => updateLayoutField('accentPosition', e.target.value)} style={inputStyle}>
                                        <option value="none">Aucun</option>
                                        <option value="top">Haut</option>
                                        <option value="left">Gauche</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Source</label>
                                    <select value={editLayout.accentSource || 'none'} onChange={e => updateLayoutField('accentSource', e.target.value)} style={inputStyle}>
                                        <option value="none">Aucune</option>
                                        <option value="status">Statut</option>
                                        <option value="fixed">Fixe</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Radius</label>
                                    <input type="number" min="0" max="24" value={editLayout.borderRadius || 8}
                                        onChange={e => updateLayoutField('borderRadius', parseInt(e.target.value) || 0)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Ombre</label>
                                    <select value={editLayout.shadow || 'sm'} onChange={e => updateLayoutField('shadow', e.target.value)} style={inputStyle}>
                                        <option value="none">Aucune</option>
                                        <option value="sm">Légère</option>
                                        <option value="md">Moyenne</option>
                                        <option value="lg">Forte</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Zones */}
                        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#333', margin: 0 }}>Zones</h3>
                            <button onClick={addZone} style={{
                                padding: '5px 10px', border: '1px solid #4361ee', borderRadius: 6,
                                backgroundColor: 'transparent', color: '#4361ee', cursor: 'pointer',
                                fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                                <iconify-icon icon="solar:add-circle-linear" width="14" />
                                Zone
                            </button>
                        </div>

                        <div style={{ paddingLeft: 22 }}>
                            {(editLayout.zones || []).map((zone, idx) => (
                                <ZoneEditor
                                    key={zone.id || idx}
                                    zone={zone}
                                    index={idx}
                                    entityFields={entityFields}
                                    onChange={(updated) => updateZone(idx, updated)}
                                    onRemove={() => removeZone(idx)}
                                    onMoveUp={() => moveZone(idx, idx - 1)}
                                    onMoveDown={() => moveZone(idx, idx + 1)}
                                    isFirst={idx === 0}
                                    isLast={idx === (editLayout.zones || []).length - 1}
                                />
                            ))}
                        </div>

                        {/* Save button */}
                        <div style={{ padding: '16px 0', borderTop: '1px solid #f0f0f0', marginTop: 16 }}>
                            <button onClick={saveCard} disabled={saving} style={{
                                width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                                backgroundColor: '#4361ee', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: 14, fontWeight: 700, opacity: saving ? 0.7 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.2s',
                            }}>
                                <iconify-icon icon="solar:check-circle-bold" width="18" />
                                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                        </div>
                    </div>

                    {/* ─── Right: Live Preview ─────────────────────────── */}
                    <div style={{
                        flex: 1, backgroundColor: '#f0f2f8', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', padding: '40px',
                        borderLeft: '1px solid #e5e7eb',
                    }}>
                        <div style={{ marginBottom: 16, fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Aperçu en direct
                        </div>
                        <div style={{
                            width: editContext === 'calendar' ? 320 : 280,
                            transition: 'width 0.3s',
                        }}>
                            <CardRenderer
                                record={SAMPLE_RECORD}
                                cardTemplate={previewTemplate}
                                context={editContext}
                                accountNumber={accountNumber}
                                entitySlug={entitySlug}
                                className="bg-white border border-gray-200/80"
                            />
                        </div>
                        <div style={{ marginTop: 16, fontSize: 11, color: '#aaa', textAlign: 'center' }}>
                            Les données affichées sont fictives pour la prévisualisation.
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty state */
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888' }}>
                    <iconify-icon icon="solar:card-2-bold-duotone" width="64" style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#aaa' }}>Sélectionnez une carte ou créez-en une</p>
                    <p style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>pour commencer à personnaliser l'affichage</p>
                </div>
            )}

            {/* ─── Presets Modal ───────────────────────────────────── */}
            {showPresets && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                }} onClick={() => setShowPresets(false)}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 560, maxHeight: '80vh',
                        overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Bibliothèque de presets</h2>
                            <button onClick={() => setShowPresets(false)} style={{
                                width: 32, height: 32, borderRadius: 8, border: 'none', backgroundColor: '#f0f0f0',
                                cursor: 'pointer', fontSize: 18, lineHeight: 1,
                            }}>×</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {presets.map((preset, idx) => (
                                <div key={idx} onClick={() => createCard(preset)} style={{
                                    padding: '16px', borderRadius: 12, border: '1px solid #e5e7eb',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#4361ee'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(67,97,238,0.15)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                                >
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 4 }}>{preset.name}</div>
                                    <span style={{
                                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                                        backgroundColor: preset.context === 'kanban' ? '#eef2ff' : preset.context === 'calendar' ? '#f0fdf4' : '#fef3c7',
                                        color: preset.context === 'kanban' ? '#4361ee' : preset.context === 'calendar' ? '#00ab55' : '#d97706',
                                    }}>{preset.context}</span>
                                    <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                                        {preset.layout?.zones?.length || 0} zones · {preset.layout?.zones?.reduce((acc, z) => acc + (z.elements?.length || 0), 0) || 0} éléments
                                    </div>
                                </div>
                            ))}
                        </div>
                        {presets.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                                Aucun preset disponible
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
                    padding: '12px 20px', borderRadius: 10,
                    backgroundColor: toast.type === 'error' ? '#ef4444' : '#00ab55',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    animation: 'slideUp 0.3s ease',
                }}>
                    {toast.msg}
                </div>
            )}
        </div>
    )
}
