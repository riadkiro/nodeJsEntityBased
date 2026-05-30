import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const COLUMN_TYPES = [
    { value: 'text', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'money', label: 'Montant' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Texte long' },
    { value: 'relation', label: 'Relation' },
    { value: 'select', label: 'Liste' },
    { value: 'multiselect', label: 'Liste multiple' },
    { value: 'duration', label: 'Durée' }
]

const WIDTHS = ['XS', 'S', 'M', 'L', 'XL']

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 99999,
    background: 'rgba(15,23,42,0.38)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
}

const panelStyle = {
    width: 'min(1080px, calc(100vw - 32px))',
    maxHeight: '86vh',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    boxShadow: '0 24px 70px rgba(15,23,42,0.28)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
}

const headerStyle = {
    padding: '15px 18px',
    borderBottom: '1px solid #eef2f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    background: '#fbfdff'
}

const iconBoxStyle = {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(67,97,238,0.11)',
    color: '#4361ee',
    flexShrink: 0
}

const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '.05em',
    marginBottom: 6
}

const inputStyle = {
    width: '100%',
    minHeight: 34,
    border: '1px solid #dbe3f0',
    borderRadius: 9,
    background: '#fff',
    color: '#0f172a',
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 10px',
    outline: 'none'
}

const fieldBoxStyle = {
    border: '1px solid #e7ecf7',
    borderRadius: 12,
    background: '#fff',
    padding: 12
}

const softButton = {
    border: '1px solid #dbe3f3',
    background: '#fff',
    borderRadius: 9,
    color: '#64748b',
    fontSize: 12,
    fontWeight: 700,
    padding: '8px 11px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6
}

const primaryButton = {
    border: '1px solid #4361ee',
    background: 'linear-gradient(135deg, #4361ee 0%, #324dda 100%)',
    color: '#fff',
    borderRadius: 10,
    padding: '9px 14px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(67,97,238,0.28)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7
}

const tinyIconButton = {
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    width: 24,
    height: 24,
    borderRadius: 7,
    cursor: 'pointer',
    display: 'inline-grid',
    placeItems: 'center'
}

function uid() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function slugify(value, fallback = 'tableau-dynamique') {
    const clean = String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    return clean || fallback
}

function keyify(value, fallback = 'colonne') {
    const clean = String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
    return clean || fallback
}

function createColumn(index, overrides = {}) {
    const label = overrides.label || `Colonne ${index}`
    return {
        id: uid(),
        label,
        key: overrides.key || keyify(label, `colonne_${index}`),
        type: overrides.type || 'text',
        width: overrides.width || 'M',
        required: !!overrides.required,
        visible: overrides.visible !== false,
        targetEntity: overrides.targetEntity || '',
        optionsText: overrides.optionsText || ''
    }
}

function initialDraft() {
    return {
        name: 'Nouveau tableau',
        description: '',
        dataMode: 'items',
        snapshotEnabled: false,
        columns: [
            createColumn(1),
            createColumn(2)
        ]
    }
}

function normalizeColumnKeys(columns) {
    const used = new Set()
    return columns.map((col, index) => {
        const label = String(col.label || `Colonne ${index + 1}`).trim()
        const base = keyify(col.key || label, `colonne_${index + 1}`)
        let key = base
        let counter = 2
        while (used.has(key)) {
            key = `${base}_${counter}`
            counter += 1
        }
        used.add(key)
        return { ...col, label, key }
    })
}

function buildOptions(optionsText) {
    return String(optionsText || '')
        .split('\n')
        .map(v => v.trim())
        .filter(Boolean)
        .map(value => ({ value: keyify(value, value), label: value }))
}

export default function CreateDynamicTableModal({
    open,
    accountNumber,
    entityId,
    onClose,
    onCreated
}) {
    const [draft, setDraft] = useState(initialDraft)
    const [entities, setEntities] = useState([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const nameRef = useRef(null)

    useEffect(() => {
        if (!open) return
        setDraft(initialDraft())
        setError('')
        setSaving(false)
        setTimeout(() => nameRef.current?.select?.(), 40)
    }, [open])

    useEffect(() => {
        if (!open || !accountNumber) return
        fetch(`/account/${accountNumber}/api/hierarchy/all-entities`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => setEntities(Array.isArray(data?.entities) ? data.entities : []))
            .catch(() => setEntities([]))
    }, [open, accountNumber])

    useEffect(() => {
        if (!open) return undefined
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [open, saving, onClose])

    const normalizedColumns = useMemo(() => normalizeColumnKeys(draft.columns || []), [draft.columns])
    const visibleColumns = normalizedColumns.filter(col => col.visible !== false)
    const relationColumns = normalizedColumns.filter(col => col.type === 'relation')

    const setField = (key, value) => {
        setDraft(prev => ({ ...prev, [key]: value }))
        setError('')
    }

    const updateColumn = (id, patch) => {
        setDraft(prev => ({
            ...prev,
            columns: prev.columns.map(col => {
                if (col.id !== id) return col
                const next = { ...col, ...patch }
                if (patch.type && patch.type !== 'relation') next.targetEntity = ''
                if (patch.type === 'relation' && !next.targetEntity) next.targetEntity = entities[0]?.id || ''
                return next
            })
        }))
        setError('')
    }

    const moveColumn = (id, direction) => {
        setDraft(prev => {
            const columns = [...prev.columns]
            const index = columns.findIndex(col => col.id === id)
            const nextIndex = index + direction
            if (index < 0 || nextIndex < 0 || nextIndex >= columns.length) return prev
            const [col] = columns.splice(index, 1)
            columns.splice(nextIndex, 0, col)
            return { ...prev, columns }
        })
    }

    const addColumn = (type = 'text') => {
        setDraft(prev => {
            const nextIndex = prev.columns.length + 1
            const relationTarget = type === 'relation' ? (entities[0]?.id || '') : ''
            return {
                ...prev,
                columns: [
                    ...prev.columns,
                    createColumn(nextIndex, {
                        label: type === 'relation' ? 'Relation' : `Colonne ${nextIndex}`,
                        type,
                        targetEntity: relationTarget
                    })
                ]
            }
        })
        setError('')
    }

    const removeColumn = (id) => {
        setDraft(prev => {
            if (prev.columns.length <= 1) return prev
            return { ...prev, columns: prev.columns.filter(col => col.id !== id) }
        })
    }

    const chooseMode = (mode) => {
        setDraft(prev => {
            let columns = prev.columns
            if (mode === 'timeseries' && !columns.some(col => col.type === 'date')) {
                columns = [
                    createColumn(1, { label: 'Date', key: 'date', type: 'date', width: 'S' }),
                    ...columns
                ]
            }
            return { ...prev, dataMode: mode, columns }
        })
        setError('')
    }

    const buildPayload = () => {
        const cleanName = String(draft.name || '').trim()
        if (!cleanName) throw new Error('Nom requis.')
        if (!entityId) throw new Error('Entité introuvable.')
        if (normalizedColumns.length === 0) throw new Error('Ajoute au moins une colonne.')

        const invalidRelation = normalizedColumns.find(col => col.type === 'relation' && !col.targetEntity)
        if (invalidRelation) throw new Error('Choisis une entité cible pour chaque relation.')

        const columns = normalizedColumns.map((col, index) => {
            const config = {}
            if (col.type === 'relation') {
                config.targetEntity = col.targetEntity
                config.searchFields = ['title', 'name']
                config.displayFields = ['title']
                config.applyDefaults = {}
            }
            if (col.type === 'select' || col.type === 'multiselect') {
                config.source = 'manual'
                config.options = buildOptions(col.optionsText)
            }
            if (col.type === 'money') {
                config.currency = 'EUR'
                config.decimals = 2
            }
            if (col.type === 'number') {
                config.decimals = 2
            }

            return {
                key: col.key,
                label: col.label,
                type: col.type,
                width: col.width || 'M',
                required: !!col.required,
                visible: col.visible !== false,
                order: index,
                config
            }
        })

        const dateColumn = columns.find(col => col.type === 'date')?.key
        const firstRelationTarget = columns.find(col => col.type === 'relation')?.config?.targetEntity || null

        return {
            name: cleanName,
            slug: slugify(cleanName),
            description: draft.description || '',
            inputMode: 'table',
            dataMode: draft.dataMode || 'items',
            timeseriesConfig: draft.dataMode === 'timeseries'
                ? {
                    dateColumn: dateColumn || '',
                    autoDate: true,
                    sortDirection: 'desc',
                    displayAs: 'table'
                }
                : undefined,
            appliesTo: {
                entityIds: [entityId]
            },
            sourceEntityId: firstRelationTarget,
            lineTypes: ['default'],
            defaultLineType: 'default',
            columns,
            totals: { rows: [] },
            snapshotConfig: {
                enabled: !!draft.snapshotEnabled,
                targetType: 'self'
            },
            catalogGroupBy: {
                classificationId: null
            }
        }
    }

    const submit = async () => {
        if (saving) return
        try {
            setSaving(true)
            setError('')
            const payload = buildPayload()
            const res = await fetch(`/account/${accountNumber}/api/line-schemas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
            const data = await res.json().catch(() => null)
            if (!res.ok || !data?.data?._id) {
                throw new Error(data?.error || `Erreur HTTP ${res.status}`)
            }
            onCreated?.(data.data)
            onClose?.()
        } catch (e) {
            setError(e?.message || 'Création impossible.')
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    return createPortal(
        <div data-dt-create-modal="1" style={overlayStyle} onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose?.() }}>
            <div style={panelStyle} onMouseDown={(e) => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={iconBoxStyle}>
                            <iconify-icon icon="solar:table-2-bold-duotone" width="20"></iconify-icon>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                                Nouveau tableau dynamique
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>
                                Configuration du TD
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => !saving && onClose?.()}
                        style={{ ...tinyIconButton, width: 30, height: 30 }}
                        title="Fermer"
                    >
                        <iconify-icon icon="solar:close-circle-bold-duotone" width="18"></iconify-icon>
                    </button>
                </div>

                <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={fieldBoxStyle}>
                                <label style={labelStyle}>Nom</label>
                                <input
                                    data-dt-schema-name="1"
                                    ref={nameRef}
                                    type="text"
                                    value={draft.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    style={inputStyle}
                                    autoComplete="off"
                                />
                            </div>

                            <div style={fieldBoxStyle}>
                                <label style={labelStyle}>Description</label>
                                <input
                                    type="text"
                                    value={draft.description}
                                    onChange={(e) => setField('description', e.target.value)}
                                    style={inputStyle}
                                    placeholder="Description optionnelle"
                                    autoComplete="off"
                                />
                            </div>

                            <div style={fieldBoxStyle}>
                                <div style={labelStyle}>Mode</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {[
                                        { key: 'items', label: 'Tableau', icon: 'solar:widget-5-bold-duotone' },
                                        { key: 'timeseries', label: 'Chronologique', icon: 'solar:chart-2-bold-duotone' }
                                    ].map(item => {
                                        const active = draft.dataMode === item.key
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => chooseMode(item.key)}
                                                style={{
                                                    border: active ? '1.5px solid #4361ee' : '1px solid #e2e8f0',
                                                    background: active ? 'rgba(67,97,238,0.08)' : '#fff',
                                                    color: active ? '#4361ee' : '#64748b',
                                                    borderRadius: 10,
                                                    padding: '9px 10px',
                                                    cursor: 'pointer',
                                                    fontSize: 12,
                                                    fontWeight: 800,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6
                                                }}
                                            >
                                                <iconify-icon icon={item.icon} width="14"></iconify-icon>
                                                {item.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div style={fieldBoxStyle}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, cursor: 'pointer' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: '#334155' }}>
                                        <iconify-icon icon="solar:clock-circle-bold-duotone" width="15" style={{ color: '#4361ee' }}></iconify-icon>
                                        Historique via Valider
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={draft.snapshotEnabled}
                                        onChange={(e) => setField('snapshotEnabled', e.target.checked)}
                                    />
                                </label>
                            </div>
                        </div>

                        <div style={{ ...fieldBoxStyle, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <iconify-icon icon="solar:eye-bold-duotone" width="14" style={{ color: '#94a3b8' }}></iconify-icon>
                                    <span style={{ ...labelStyle, marginBottom: 0 }}>Aperçu</span>
                                </div>
                                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
                                    {visibleColumns.length} col.
                                </span>
                            </div>

                            <div style={{ border: '1px solid #e7ecf7', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: 12 }}>
                                        <thead style={{ background: '#f5f7fb' }}>
                                            <tr>
                                                <th style={{ width: 28, padding: '10px 6px', borderBottom: '1px solid #e7ecf7' }}></th>
                                                {visibleColumns.map(col => (
                                                    <th
                                                        key={col.id}
                                                        style={{
                                                            textAlign: 'left',
                                                            padding: '10px 12px',
                                                            borderBottom: '1px solid #e7ecf7',
                                                            color: '#888da8',
                                                            fontSize: 10,
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {col.label || col.key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{ padding: '9px 6px', color: '#cbd5e1', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                    <iconify-icon icon="solar:drag-circle-bold" width="13"></iconify-icon>
                                                </td>
                                                {visibleColumns.map(col => (
                                                    <td key={col.id} style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', color: '#cbd5e1' }}>
                                                        {col.type === 'relation' ? 'Rechercher' : col.label}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td colSpan={Math.max(1, visibleColumns.length + 1)} style={{ padding: '9px 12px', color: '#94a3b8', fontSize: 12 }}>
                                                    + Ajouter une ligne
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {relationColumns.length > 0 && (
                                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {relationColumns.map(col => {
                                        const target = entities.find(e => String(e.id) === String(col.targetEntity))
                                        return (
                                            <span key={col.id} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 5,
                                                borderRadius: 999,
                                                background: 'rgba(67,97,238,0.08)',
                                                color: '#4361ee',
                                                padding: '4px 8px',
                                                fontSize: 11,
                                                fontWeight: 800
                                            }}>
                                                <iconify-icon icon="solar:link-round-bold-duotone" width="12"></iconify-icon>
                                                {col.label}: {target?.name || 'Entité'}
                                            </span>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={fieldBoxStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <iconify-icon icon="solar:slider-horizontal-bold-duotone" width="14" style={{ color: '#4361ee' }}></iconify-icon>
                                <span style={{ ...labelStyle, marginBottom: 0 }}>Colonnes</span>
                            </div>
                            <div style={{ display: 'inline-flex', gap: 8 }}>
                                <button type="button" data-dt-add-column="1" style={softButton} onClick={() => addColumn('text')}>
                                    <iconify-icon icon="solar:add-circle-bold-duotone" width="14"></iconify-icon>
                                    Colonne
                                </button>
                                <button type="button" data-dt-add-relation="1" style={softButton} onClick={() => addColumn('relation')}>
                                    <iconify-icon icon="solar:link-round-bold-duotone" width="14"></iconify-icon>
                                    Relation
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                            {normalizedColumns.map((col, index) => (
                                <div
                                    key={col.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '56px minmax(140px, 1fr) minmax(120px, .75fr) 126px 76px 76px 82px',
                                        gap: 8,
                                        alignItems: 'center',
                                        border: '1px solid #edf2f7',
                                        borderRadius: 11,
                                        padding: 8,
                                        background: '#fbfdff',
                                        minWidth: 760
                                    }}
                                >
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                        <button type="button" style={tinyIconButton} onClick={() => moveColumn(col.id, -1)} disabled={index === 0} title="Monter">
                                            <iconify-icon icon="solar:alt-arrow-up-bold" width="14"></iconify-icon>
                                        </button>
                                        <button type="button" style={tinyIconButton} onClick={() => moveColumn(col.id, 1)} disabled={index === normalizedColumns.length - 1} title="Descendre">
                                            <iconify-icon icon="solar:alt-arrow-down-bold" width="14"></iconify-icon>
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={col.label}
                                        onChange={(e) => updateColumn(col.id, { label: e.target.value })}
                                        style={{ ...inputStyle, minHeight: 30, fontSize: 12 }}
                                        placeholder="Label"
                                    />

                                    <input
                                        type="text"
                                        value={col.key}
                                        onChange={(e) => updateColumn(col.id, { key: e.target.value })}
                                        style={{ ...inputStyle, minHeight: 30, fontSize: 12, color: '#64748b' }}
                                        placeholder="clé"
                                    />

                                    <select
                                        value={col.type}
                                        onChange={(e) => updateColumn(col.id, { type: e.target.value })}
                                        style={{ ...inputStyle, minHeight: 30, fontSize: 12, padding: '5px 8px' }}
                                    >
                                        {COLUMN_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={col.width}
                                        onChange={(e) => updateColumn(col.id, { width: e.target.value })}
                                        style={{ ...inputStyle, minHeight: 30, fontSize: 12, padding: '5px 8px' }}
                                    >
                                        {WIDTHS.map(width => <option key={width} value={width}>{width}</option>)}
                                    </select>

                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b', fontWeight: 700 }}>
                                        <input
                                            type="checkbox"
                                            checked={!!col.required}
                                            onChange={(e) => updateColumn(col.id, { required: e.target.checked })}
                                        />
                                        Requis
                                    </label>

                                    <div style={{ display: 'inline-flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5 }}>
                                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b', fontWeight: 700 }}>
                                            <input
                                                type="checkbox"
                                                checked={col.visible !== false}
                                                onChange={(e) => updateColumn(col.id, { visible: e.target.checked })}
                                            />
                                            Visible
                                        </label>
                                        <button
                                            type="button"
                                            style={{ ...tinyIconButton, color: normalizedColumns.length <= 1 ? '#cbd5e1' : '#ef4444' }}
                                            onClick={() => removeColumn(col.id)}
                                            disabled={normalizedColumns.length <= 1}
                                            title="Supprimer"
                                        >
                                            <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="14"></iconify-icon>
                                        </button>
                                    </div>

                                    {col.type === 'relation' && (
                                        <div style={{ gridColumn: '2 / -1', display: 'grid', gridTemplateColumns: '140px minmax(220px, 1fr)', gap: 8, alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>Entité cible</span>
                                            <select
                                                value={col.targetEntity || ''}
                                                onChange={(e) => updateColumn(col.id, { targetEntity: e.target.value })}
                                                style={{ ...inputStyle, minHeight: 30, fontSize: 12, padding: '5px 8px' }}
                                            >
                                                <option value="">Choisir une entité</option>
                                                {entities.map(entity => (
                                                    <option key={entity.id} value={entity.id}>{entity.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {(col.type === 'select' || col.type === 'multiselect') && (
                                        <div style={{ gridColumn: '2 / -1', display: 'grid', gridTemplateColumns: '140px minmax(220px, 1fr)', gap: 8, alignItems: 'start' }}>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', paddingTop: 8 }}>Options</span>
                                            <textarea
                                                value={col.optionsText || ''}
                                                onChange={(e) => updateColumn(col.id, { optionsText: e.target.value })}
                                                style={{ ...inputStyle, minHeight: 64, resize: 'vertical', fontSize: 12 }}
                                                placeholder={'Une option par ligne'}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            border: '1px solid rgba(220,38,38,0.18)',
                            background: 'rgba(254,226,226,0.55)',
                            color: '#dc2626',
                            borderRadius: 10,
                            padding: '8px 10px',
                            fontSize: 12,
                            fontWeight: 700
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                <div style={{ padding: 16, borderTop: '1px solid #eef2f7', display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#fbfdff' }}>
                    <button type="button" style={softButton} onClick={() => !saving && onClose?.()}>
                        <iconify-icon icon="solar:close-circle-bold-duotone" width="14"></iconify-icon>
                        Annuler
                    </button>
                    <button
                        type="button"
                        data-dt-submit-schema="1"
                        style={{
                            ...primaryButton,
                            opacity: saving ? 0.72 : 1,
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                        disabled={saving}
                        onClick={submit}
                    >
                        <iconify-icon icon={saving ? 'svg-spinners:ring-resize' : 'solar:diskette-bold'} width="14"></iconify-icon>
                        {saving ? 'Création...' : 'Créer le TD'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
