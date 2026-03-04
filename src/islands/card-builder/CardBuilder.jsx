/**
 * CardBuilder — WYSIWYG Visual Card Template Editor
 *
 * Layout: Left (Card list + Widget Palette) | Center (Interactive Canvas) | Right (Property Panel)
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import WidgetPalette from './WidgetPalette'
import InteractiveCanvas from './InteractiveCanvas'
import { ElementProperties, ZoneProperties } from './PropertyPanel'

// ─── Constants ───────────────────────────────────────────────────────
const CONTEXTS = [
    { value: 'kanban', label: 'Kanban', icon: 'solar:widget-2-bold-duotone' },
    { value: 'calendar', label: 'Calendrier', icon: 'solar:calendar-bold-duotone' },
    { value: 'sidebar', label: 'Sidebar (Fiche)', icon: 'solar:card-bold-duotone' },
    { value: 'universal', label: 'Universel', icon: 'solar:layers-bold-duotone' },
]

const SAMPLE_RECORD = {
    _id: 'sample-001', referenceTitle: 'RDV - Marie Dupont', title: 'RDV - Marie Dupont',
    description: 'Consultation de suivi pour le traitement en cours.',
    _start: new Date(Date.now() + 86400000), _end: new Date(Date.now() + 86400000 + 1800000),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    classificationValues: [{ optionLabel: 'Planifié', optionColor: '#4361ee' }],
    tags: ['suivi', 'important'], customFields: [],
}

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
        case 'separator': case 'spacer': return base
        case 'text': return { ...base, label: 'Texte personnalisé' }
        case 'badge': return { ...base, fieldId: '__description__', color: '#4361ee' }
        case 'html': return { ...base, htmlContent: '<p style="color:#888;font-size:12px">Contenu HTML</p>' }
        case 'link': return { ...base, label: 'Lien', url: '#', icon: 'solar:link-linear', linkTarget: '_self' }
        case 'relations': return { ...base, displayMode: 'icon-title', enabledRelations: [] }
        case 'attachments': return { ...base, source: 'self', relationKey: '' }
        case 'documents': return { ...base, source: 'self', relationKey: '' }
        default: return base
    }
}

function createDefaultZone(id) {
    return { id: id || 'zone_' + Date.now(), direction: 'column', gap: 6, padding: '12px', elements: [], borderTop: false, borderBottom: false, align: 'start' }
}

// ─── Styles ──────────────────────────────────────────────────────────
const btnStyle = { padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }

// ─── Card List Item ──────────────────────────────────────────────────
function CardListItem({ card, isActive, onClick, onSetDefault, onDelete }) {
    const ctxColors = { kanban: ['#eef2ff', '#4361ee'], calendar: ['#f0fdf4', '#00ab55'], universal: ['#fef3c7', '#d97706'] }
    const [bg, fg] = ctxColors[card.context] || ctxColors.universal
    return (
        <div onClick={onClick} style={{
            padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
            border: isActive ? '2px solid #4361ee' : '1px solid #e5e7eb',
            backgroundColor: isActive ? '#f0f4ff' : '#fff', transition: 'all 0.15s', marginBottom: 6,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{card.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, backgroundColor: bg, color: fg }}>{card.context}</span>
                        {card.isDefault && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, backgroundColor: '#dbeafe', color: '#2563eb' }}>défaut</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    {!card.isDefault && (
                        <button onClick={() => onSetDefault(card)} title="Définir par défaut" style={{ ...btnStyle, backgroundColor: '#f0f0f0', color: '#555', padding: 4 }}>
                            <iconify-icon icon="solar:star-linear" width="13" />
                        </button>
                    )}
                    <button onClick={() => onDelete(card)} title="Supprimer" style={{ ...btnStyle, backgroundColor: '#fee2e2', color: '#ef4444', padding: 4 }}>
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="13" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ═════════════════════════════════════════════════════════════════════
// ─── Main Component ──────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════
export default function CardBuilder({ accountNumber, entityId, entityName, entitySlug, entityIcon, entityColor, fieldsJson, relationsJson }) {
    const entityFields = useMemo(() => { try { return JSON.parse(fieldsJson) } catch { return [] } }, [fieldsJson])
    const entityRelations = useMemo(() => { try { return JSON.parse(relationsJson) } catch { return [] } }, [relationsJson])

    // Card list state
    const [cards, setCards] = useState([])
    const [activeCard, setActiveCard] = useState(null)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [showPresets, setShowPresets] = useState(false)
    const [presets, setPresets] = useState([])
    const [leftTab, setLeftTab] = useState('cards') // 'cards' | 'widgets'

    // Editor state
    const [editName, setEditName] = useState('')
    const [editContext, setEditContext] = useState('kanban')
    const [editLayout, setEditLayout] = useState(null)

    // Selection state
    const [selectedElementId, setSelectedElementId] = useState(null)
    const [selectedZoneId, setSelectedZoneId] = useState(null)
    const [selectedElement, setSelectedElement] = useState(null)
    const [selectedZone, setSelectedZone] = useState(null)

    const showToast = useCallback((msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500) }, [])

    // ─── Fetch ────────────────────────────────────────────────────────
    useEffect(() => {
        fetch(`/account/${accountNumber}/api/entity/${entityId}/cards`, { credentials: 'include' })
            .then(r => r.json()).then(d => { if (d.success) setCards(d.cards || []) }).catch(() => { })
        fetch(`/account/${accountNumber}/api/card-presets`, { credentials: 'include' })
            .then(r => r.json()).then(d => { if (d.success) setPresets(d.presets || []) }).catch(() => { })
    }, [accountNumber, entityId])

    // ─── Select card ──────────────────────────────────────────────────
    const selectCard = useCallback((card) => {
        setActiveCard(card); setEditName(card.name); setEditContext(card.context || 'kanban')
        const layout = JSON.parse(JSON.stringify(card.layout || {}))
        if (layout.zones) layout.zones.forEach(z => (z.elements || []).forEach(el => { if (!el._id) el._id = genId() }))
        setEditLayout(layout)
        setSelectedElementId(null); setSelectedZoneId(null); setSelectedElement(null); setSelectedZone(null)
        setLeftTab('widgets')
    }, [])

    // ─── CRUD ─────────────────────────────────────────────────────────
    const createCard = useCallback(async (preset = null) => {
        const nc = {
            name: preset ? preset.name : 'Nouvelle carte', context: preset ? preset.context : 'kanban', isDefault: false,
            layout: preset ? JSON.parse(JSON.stringify(preset.layout)) : { accentPosition: 'none', accentSource: 'none', borderRadius: 8, shadow: 'sm', zones: [createDefaultZone('body')] },
        }
        try {
            const res = await fetch(`/account/${accountNumber}/api/entity/${entityId}/cards`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nc) })
            const d = await res.json()
            if (d.success) { setCards(p => [...p, d.card]); selectCard(d.card); showToast('Carte créée !'); setShowPresets(false) }
        } catch { showToast('Erreur', 'error') }
    }, [accountNumber, entityId, selectCard, showToast])

    const saveCard = useCallback(async () => {
        if (!activeCard?._id) return; setSaving(true)
        try {
            const cl = JSON.parse(JSON.stringify(editLayout))
            if (cl.zones) cl.zones = cl.zones.map(z => ({ ...z, elements: (z.elements || []).map(({ _id, ...el }) => el) }))
            const res = await fetch(`/account/${accountNumber}/api/entity/${entityId}/cards/${activeCard._id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName, context: editContext, layout: cl }) })
            const d = await res.json()
            if (d.success) { setCards(p => p.map(c => c._id === activeCard._id ? d.card : c)); setActiveCard(d.card); showToast('Sauvegardée !') }
            else showToast(d.error || 'Erreur', 'error')
        } catch { showToast('Erreur', 'error') }
        setSaving(false)
    }, [activeCard, editName, editContext, editLayout, accountNumber, entityId, showToast])

    const handleSetDefault = useCallback(async (card) => {
        try {
            const res = await fetch(`/account/${accountNumber}/api/entity/${entityId}/cards/${card._id}/set-default`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
            const d = await res.json()
            if (d.success) { setCards(p => p.map(c => ({ ...c, isDefault: c._id === card._id ? true : (c.context === card.context ? false : c.isDefault) }))); showToast('Défaut mis à jour !') }
        } catch { showToast('Erreur', 'error') }
    }, [accountNumber, entityId, showToast])

    const handleDelete = useCallback(async (card) => {
        if (!confirm(`Supprimer "${card.name}" ?`)) return
        try {
            await fetch(`/account/${accountNumber}/api/entity/${entityId}/cards/${card._id}`, { method: 'DELETE', credentials: 'include' })
            setCards(p => p.filter(c => c._id !== card._id))
            if (activeCard?._id === card._id) { setActiveCard(null); setEditLayout(null) }
            showToast('Supprimée')
        } catch { showToast('Erreur', 'error') }
    }, [accountNumber, entityId, activeCard, showToast])

    // ─── Layout mutations ─────────────────────────────────────────────
    const updateLayoutField = (k, v) => setEditLayout(p => ({ ...p, [k]: v }))

    const findZoneAndElement = useCallback((elId) => {
        if (!editLayout?.zones) return null
        for (const z of editLayout.zones) {
            const idx = (z.elements || []).findIndex(e => e._id === elId)
            if (idx !== -1) return { zone: z, elIndex: idx, element: z.elements[idx] }
        }
        return null
    }, [editLayout])

    // ─── Selection handlers ───────────────────────────────────────────
    const handleSelectElement = useCallback((el, zoneId) => {
        setSelectedElementId(el._id); setSelectedZoneId(zoneId); setSelectedElement(el); setSelectedZone(null)
    }, [])

    const handleSelectZone = useCallback((zone) => {
        setSelectedZoneId(zone.id); setSelectedElementId(null); setSelectedElement(null); setSelectedZone(zone)
    }, [])

    const handleClearSelection = useCallback(() => {
        setSelectedElementId(null); setSelectedZoneId(null); setSelectedElement(null); setSelectedZone(null)
    }, [])

    // ─── Move element (drag & drop) ───────────────────────────────────
    const handleMoveElement = useCallback((fromZoneId, fromIdx, toZoneId, toIdx) => {
        setEditLayout(prev => {
            const zones = JSON.parse(JSON.stringify(prev.zones || []))
            const srcZone = zones.find(z => z.id === fromZoneId)
            const tgtZone = zones.find(z => z.id === toZoneId)
            if (!srcZone || !tgtZone) return prev
            const [moved] = srcZone.elements.splice(fromIdx, 1)
            const adjustedIdx = (fromZoneId === toZoneId && fromIdx < toIdx) ? toIdx - 1 : toIdx
            tgtZone.elements.splice(adjustedIdx, 0, moved)
            return { ...prev, zones }
        })
    }, [])

    // ─── Add element from palette drop ────────────────────────────────
    const handleAddElement = useCallback((zoneId, elIndex, type) => {
        // If user drops a "zone" from palette, create a new zone instead of an element
        if (type === 'zone') {
            const z = createDefaultZone()
            setEditLayout(prev => ({ ...prev, zones: [...(prev.zones || []), z] }))
            return
        }
        const newEl = createDefaultElement(type)
        // Auto-resolve first entity field for 'field' type
        if (type === 'field' && entityFields.length > 0) {
            const firstField = entityFields[0]
            newEl.fieldId = firstField._id
            newEl.label = firstField.label || firstField.name || ''
            newEl.icon = firstField.icon || ''
        }
        setEditLayout(prev => {
            const zones = JSON.parse(JSON.stringify(prev.zones || []))
            if (zoneId === '__new_zone__') {
                zones.push({ ...createDefaultZone('body'), elements: [newEl] })
            } else {
                const zone = zones.find(z => z.id === zoneId)
                if (zone) zone.elements.splice(elIndex, 0, newEl)
            }
            return { ...prev, zones }
        })
        setSelectedElementId(newEl._id); setSelectedElement(newEl); setSelectedZoneId(zoneId); setSelectedZone(null)
    }, [entityFields])

    // ─── Reorder zones via drag & drop ────────────────────────────────
    const handleZoneReorder = useCallback((fromIndex, toIndex) => {
        if (fromIndex === toIndex) return
        setEditLayout(prev => {
            const zones = [...(prev.zones || [])]
            const [moved] = zones.splice(fromIndex, 1)
            zones.splice(toIndex, 0, moved)
            return { ...prev, zones }
        })
    }, [])

    // ─── Update element from property panel ───────────────────────────
    const handleUpdateElement = useCallback((updated) => {
        setEditLayout(prev => {
            const zones = JSON.parse(JSON.stringify(prev.zones || []))
            for (const z of zones) {
                const idx = z.elements.findIndex(e => e._id === updated._id)
                if (idx !== -1) { z.elements[idx] = updated; break }
            }
            return { ...prev, zones }
        })
        setSelectedElement(updated)
    }, [])

    // ─── Remove element ───────────────────────────────────────────────
    const handleRemoveElement = useCallback(() => {
        if (!selectedElementId) return
        setEditLayout(prev => {
            const zones = JSON.parse(JSON.stringify(prev.zones || []))
            for (const z of zones) {
                const idx = z.elements.findIndex(e => e._id === selectedElementId)
                if (idx !== -1) { z.elements.splice(idx, 1); break }
            }
            return { ...prev, zones }
        })
        handleClearSelection()
    }, [selectedElementId, handleClearSelection])

    // ─── Update zone from property panel ──────────────────────────────
    const handleUpdateZone = useCallback((updated) => {
        setEditLayout(prev => {
            const zones = (prev.zones || []).map(z => z.id === updated.id ? { ...updated, elements: z.elements } : z)
            return { ...prev, zones }
        })
        setSelectedZone(updated)
    }, [])

    const handleRemoveZone = useCallback(() => {
        if (!selectedZoneId) return
        setEditLayout(prev => ({ ...prev, zones: (prev.zones || []).filter(z => z.id !== selectedZoneId) }))
        handleClearSelection()
    }, [selectedZoneId, handleClearSelection])

    const addZone = useCallback(() => {
        const z = createDefaultZone()
        setEditLayout(prev => ({ ...prev, zones: [...(prev.zones || []), z] }))
    }, [])

    // ═════════════════════════════════════════════════════════════════
    // ─── RENDER ──────────────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════════════
    return (
        <div style={{ display: 'flex', height: '100%', fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: '#f7f8fc', overflow: 'hidden' }}>
            {/* ─── LEFT PANEL ──────────────────────────────────────── */}
            <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
                    {[{ id: 'cards', label: 'Cartes', icon: 'solar:card-2-bold-duotone' }, { id: 'widgets', label: 'Composants', icon: 'solar:widget-add-bold-duotone' }].map(t => (
                        <button key={t.id} onClick={() => setLeftTab(t.id)} style={{
                            flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                            backgroundColor: leftTab === t.id ? '#fff' : '#fafafa', color: leftTab === t.id ? '#4361ee' : '#888',
                            borderBottom: leftTab === t.id ? '2px solid #4361ee' : '2px solid transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.15s',
                        }}>
                            <iconify-icon icon={t.icon} width="14" />
                            {t.label}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {leftTab === 'cards' ? (
                        <div style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                <button onClick={() => setShowPresets(true)} style={{ ...btnStyle, flex: 1, backgroundColor: '#f5f6fa', color: '#555', border: '1px solid #e0e4ea', justifyContent: 'center' }}>
                                    <iconify-icon icon="solar:copy-bold-duotone" width="14" /> Presets
                                </button>
                                <button onClick={() => createCard()} style={{ ...btnStyle, flex: 1, backgroundColor: '#4361ee', color: '#fff', justifyContent: 'center' }}>
                                    <iconify-icon icon="solar:add-circle-bold" width="14" /> Créer
                                </button>
                            </div>
                            {cards.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 16px', color: '#888' }}>
                                    <iconify-icon icon="solar:card-2-bold-duotone" width="40" style={{ opacity: 0.2 }} />
                                    <p style={{ fontSize: 12, marginTop: 8 }}>Aucune carte</p>
                                </div>
                            ) : cards.map(card => (
                                <CardListItem key={card._id} card={card} isActive={activeCard?._id === card._id}
                                    onClick={() => selectCard(card)} onSetDefault={handleSetDefault} onDelete={handleDelete} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ paddingTop: 12 }}>
                            <WidgetPalette />
                        </div>
                    )}
                </div>
            </div>

            {/* ─── CENTER: Canvas or Empty ──────────────────────────── */}
            {activeCard && editLayout ? (
                <>
                    {/* Toolbar */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input value={editName} onChange={e => setEditName(e.target.value)} style={{
                                    padding: '6px 10px', borderRadius: 6, border: '1px solid #e0e4ea', fontSize: 14, fontWeight: 700, width: 200, outline: 'none',
                                }} />
                                <select value={editContext} onChange={e => setEditContext(e.target.value)} style={{
                                    padding: '6px 8px', borderRadius: 6, border: '1px solid #e0e4ea', fontSize: 12,
                                }}>
                                    {CONTEXTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {/* Layout quick settings */}
                                <select value={editLayout.accentPosition || 'none'} onChange={e => updateLayoutField('accentPosition', e.target.value)} title="Accent"
                                    style={{ padding: '5px 6px', borderRadius: 6, border: '1px solid #e0e4ea', fontSize: 11 }}>
                                    <option value="none">Pas d'accent</option>
                                    <option value="top">Accent haut</option>
                                    <option value="left">Accent gauche</option>
                                </select>
                                <select value={editLayout.shadow || 'sm'} onChange={e => updateLayoutField('shadow', e.target.value)} title="Ombre"
                                    style={{ padding: '5px 6px', borderRadius: 6, border: '1px solid #e0e4ea', fontSize: 11 }}>
                                    <option value="none">Pas d'ombre</option>
                                    <option value="sm">Ombre légère</option>
                                    <option value="md">Ombre moyenne</option>
                                    <option value="lg">Ombre forte</option>
                                </select>
                                <input type="number" min="0" max="24" value={editLayout.borderRadius || 8}
                                    onChange={e => updateLayoutField('borderRadius', parseInt(e.target.value) || 0)}
                                    title="Border radius" style={{ width: 48, padding: '5px 6px', borderRadius: 6, border: '1px solid #e0e4ea', fontSize: 11, textAlign: 'center' }} />
                                <button onClick={addZone} style={{ ...btnStyle, backgroundColor: '#f0f4ff', color: '#4361ee', border: '1px solid #d0d8ff' }}>
                                    <iconify-icon icon="solar:add-circle-linear" width="14" /> Zone
                                </button>
                                <button onClick={saveCard} disabled={saving} style={{
                                    ...btnStyle, backgroundColor: '#4361ee', color: '#fff', opacity: saving ? 0.7 : 1,
                                    padding: '8px 16px', fontSize: 12,
                                }}>
                                    <iconify-icon icon="solar:check-circle-bold" width="16" />
                                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>
                            </div>
                        </div>

                        {/* Canvas */}
                        <InteractiveCanvas
                            layout={editLayout} record={SAMPLE_RECORD}
                            selectedElementId={selectedElementId} selectedZoneId={selectedZoneId}
                            onSelectElement={handleSelectElement} onSelectZone={handleSelectZone}
                            onClearSelection={handleClearSelection} onMoveElement={handleMoveElement}
                            onAddElement={handleAddElement} onUpdateLayout={updateLayoutField}
                            onZoneReorder={handleZoneReorder}
                            editContext={editContext} entityFields={entityFields}
                            entityRelations={entityRelations}
                            entityName={entityName} entityIcon={entityIcon} entityColor={entityColor}
                        />
                    </div>

                    {/* ─── RIGHT: Property Panel ────────────────────── */}
                    <div style={{
                        width: selectedElement || selectedZone ? 280 : 0,
                        flexShrink: 0, borderLeft: (selectedElement || selectedZone) ? '1px solid #e5e7eb' : 'none',
                        backgroundColor: '#fff', overflowY: 'auto', overflowX: 'hidden',
                        transition: 'width 0.25s ease',
                    }}>
                        {selectedElement && (
                            <ElementProperties
                                element={selectedElement} entityFields={entityFields}
                                entityRelations={entityRelations}
                                onChange={handleUpdateElement} onRemove={handleRemoveElement}
                            />
                        )}
                        {selectedZone && !selectedElement && (
                            <ZoneProperties
                                zone={selectedZone}
                                onChange={handleUpdateZone} onRemove={handleRemoveZone}
                            />
                        )}
                    </div>
                </>
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#888' }}>
                    <iconify-icon icon="solar:card-2-bold-duotone" width="64" style={{ opacity: 0.15, marginBottom: 16 }} />
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#aaa' }}>Sélectionnez une carte ou créez-en une</p>
                    <p style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>pour commencer à personnaliser l'affichage</p>
                </div>
            )}

            {/* ─── Presets Modal ──────────────────────────────────── */}
            {showPresets && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
                    onClick={() => setShowPresets(false)}>
                    <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 520, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Presets</h2>
                            <button onClick={() => setShowPresets(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', backgroundColor: '#f0f0f0', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {presets.map((p, i) => (
                                <div key={i} onClick={() => createCard(p)} style={{ padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#4361ee'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(67,97,238,0.15)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 4 }}>{p.name}</div>
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, backgroundColor: '#eef2ff', color: '#4361ee' }}>{p.context}</span>
                                    <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>{p.layout?.zones?.length || 0} zones</div>
                                </div>
                            ))}
                        </div>
                        {presets.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Aucun preset</div>}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
                    padding: '12px 20px', borderRadius: 10,
                    backgroundColor: toast.type === 'error' ? '#ef4444' : '#00ab55',
                    color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}>{toast.msg}</div>
            )}
        </div>
    )
}
