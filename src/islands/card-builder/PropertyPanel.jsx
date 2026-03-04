/**
 * PropertyPanel — Right-side editor for the selected element or zone
 */
import React from 'react'
import { ELEMENT_TYPES } from './WidgetPalette'

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
    { value: 'xs', label: 'XS' }, { value: 'sm', label: 'SM' },
    { value: 'base', label: 'Base' }, { value: 'lg', label: 'LG' },
]
const FONT_WEIGHT_OPTIONS = [
    { value: 'normal', label: 'Normal' }, { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semi' }, { value: 'bold', label: 'Bold' },
]

const L = { fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 3 }
const I = { width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e0e4ea', fontSize: 12, outline: 'none' }

function Section({ label, children }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
            {children}
        </div>
    )
}

// ─── Element Property Editor ─────────────────────────────────────────
export function ElementProperties({ element, entityFields, onChange, onRemove }) {
    const u = (k, v) => onChange({ ...element, [k]: v })
    // When fieldId changes, auto-resolve icon and label from entityFields
    const handleFieldChange = (newFieldId) => {
        const fieldDef = (entityFields || []).find(f => String(f._id) === String(newFieldId))
        const updates = { ...element, fieldId: newFieldId }
        if (fieldDef) {
            updates.icon = fieldDef.icon || ''
            updates.label = fieldDef.label || fieldDef.name || ''
        } else {
            // Built-in field selected — clear icon, keep default label from FIELD_OPTIONS
            updates.icon = ''
        }
        onChange(updates)
    }
    const meta = ELEMENT_TYPES.find(e => e.type === element.type)

    return (
        <div style={{ padding: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: `${meta?.color || '#4361ee'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <iconify-icon icon={meta?.icon || 'solar:star-linear'} width="14" style={{ color: meta?.color || '#4361ee' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{meta?.label || element.type}</span>
                </div>
                <button onClick={onRemove} style={{
                    width: 26, height: 26, borderRadius: 6, border: 'none', backgroundColor: '#fee2e2',
                    color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <iconify-icon icon="solar:trash-bin-trash-linear" width="13" />
                </button>
            </div>

            {/* Visibility */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', marginBottom: 14 }}>
                <input type="checkbox" checked={element.visible !== false} onChange={e => u('visible', e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#4361ee' }} />
                <span style={{ fontWeight: 500 }}>Visible</span>
            </label>

            {/* Field selector */}
            {['field', 'date', 'icon-value', 'badge'].includes(element.type) && (
                <Section label="Champ">
                    <select value={element.fieldId || ''} onChange={e => handleFieldChange(e.target.value)} style={I}>
                        {FIELD_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        {entityFields.map(f => <option key={f._id} value={f._id}>{f.label || f.name}</option>)}
                    </select>
                </Section>
            )}

            {/* Format */}
            {['field', 'date', 'icon-value', 'badge', 'status'].includes(element.type) && (
                <Section label="Format">
                    {element.type === 'status' ? (
                        <select value={element.format || 'badge'} onChange={e => u('format', e.target.value)} style={I}>
                            <option value="badge">Badge</option>
                            <option value="pill">Pill</option>
                        </select>
                    ) : (
                        <select value={element.format || ''} onChange={e => u('format', e.target.value)} style={I}>
                            {FORMAT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    )}
                </Section>
            )}

            {/* Icon */}
            {['date', 'icon-value'].includes(element.type) && (
                <Section label="Icône">
                    <input value={element.icon || ''} onChange={e => u('icon', e.target.value)} placeholder="solar:calendar-linear" style={I} />
                </Section>
            )}

            {/* Typography row */}
            <Section label="Typographie">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>
                        <label style={L}>Taille</label>
                        <select value={element.fontSize || 'sm'} onChange={e => u('fontSize', e.target.value)} style={I}>
                            {FONT_SIZE_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={L}>Graisse</label>
                        <select value={element.fontWeight || 'normal'} onChange={e => u('fontWeight', e.target.value)} style={I}>
                            {FONT_WEIGHT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                </div>
            </Section>

            {/* Color */}
            <Section label="Couleur">
                <div style={{ display: 'flex', gap: 6 }}>
                    <input type="color" value={element.color || '#6b7280'} onChange={e => u('color', e.target.value)}
                        style={{ width: 34, height: 30, borderRadius: 6, border: '1px solid #ddd', padding: 2, cursor: 'pointer' }} />
                    <input value={element.color || ''} onChange={e => u('color', e.target.value)} placeholder="#6b7280" style={{ ...I, flex: 1 }} />
                </div>
            </Section>

            {/* Max Lines */}
            {['title', 'field'].includes(element.type) && (
                <Section label="Max lignes">
                    <input type="number" min="0" max="10" value={element.maxLines || 0} onChange={e => u('maxLines', parseInt(e.target.value) || 0)} style={I} />
                </Section>
            )}

            {/* Text label */}
            {element.type === 'text' && (
                <Section label="Texte">
                    <input value={element.label || ''} onChange={e => u('label', e.target.value)} style={I} />
                </Section>
            )}

            {/* Actions */}
            {element.type === 'actions' && (
                <Section label="Actions">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {['edit', 'view', 'open', 'close'].map(action => (
                            <label key={action} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                                <input type="checkbox" checked={(element.items || []).includes(action)}
                                    onChange={e => {
                                        const items = [...(element.items || [])]
                                        if (e.target.checked) items.push(action)
                                        else items.splice(items.indexOf(action), 1)
                                        u('items', items)
                                    }} style={{ width: 14, height: 14, accentColor: '#4361ee' }} />
                                {action}
                            </label>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    )
}

// ─── Zone Property Editor ────────────────────────────────────────────
export function ZoneProperties({ zone, onChange, onRemove }) {
    const u = (k, v) => onChange({ ...zone, [k]: v })

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#4361ee15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <iconify-icon icon="solar:layers-bold-duotone" width="14" style={{ color: '#4361ee' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>Zone: {zone.id}</span>
                </div>
                <button onClick={onRemove} style={{
                    width: 26, height: 26, borderRadius: 6, border: 'none', backgroundColor: '#fee2e2',
                    color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <iconify-icon icon="solar:trash-bin-trash-linear" width="13" />
                </button>
            </div>

            <Section label="Identifiant">
                <input value={zone.id || ''} onChange={e => u('id', e.target.value)} placeholder="body" style={I} />
            </Section>

            <Section label="Direction">
                <div style={{ display: 'flex', gap: 4 }}>
                    {[{ v: 'column', l: 'Colonne', i: 'solar:sort-from-top-to-bottom-linear' }, { v: 'row', l: 'Ligne', i: 'solar:sort-horizontal-linear' }].map(d => (
                        <button key={d.v} onClick={() => u('direction', d.v)} style={{
                            flex: 1, padding: '8px', borderRadius: 8, border: zone.direction === d.v ? '2px solid #4361ee' : '1px solid #e0e4ea',
                            backgroundColor: zone.direction === d.v ? '#f0f4ff' : '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600,
                            color: zone.direction === d.v ? '#4361ee' : '#666',
                        }}>
                            <iconify-icon icon={d.i} width="14" />
                            {d.l}
                        </button>
                    ))}
                </div>
            </Section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Section label="Gap (px)">
                    <input type="number" min="0" max="24" value={zone.gap || 0} onChange={e => u('gap', parseInt(e.target.value) || 0)} style={I} />
                </Section>
                <Section label="Padding">
                    <input value={zone.padding || ''} onChange={e => u('padding', e.target.value)} placeholder="12px" style={I} />
                </Section>
            </div>

            <Section label="Alignement">
                <select value={zone.align || 'start'} onChange={e => u('align', e.target.value)} style={I}>
                    <option value="start">Début</option>
                    <option value="center">Centre</option>
                    <option value="end">Fin</option>
                    <option value="between">Espacé</option>
                    <option value="stretch">Étiré</option>
                </select>
            </Section>

            <Section label="Bordures">
                <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!zone.borderTop} onChange={e => u('borderTop', e.target.checked)} style={{ accentColor: '#4361ee' }} />
                        Haut
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!zone.borderBottom} onChange={e => u('borderBottom', e.target.checked)} style={{ accentColor: '#4361ee' }} />
                        Bas
                    </label>
                </div>
            </Section>
        </div>
    )
}
