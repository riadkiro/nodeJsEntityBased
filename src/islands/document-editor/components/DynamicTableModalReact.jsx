import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Toolbar from '../../dynamic-table/components/Toolbar'
import DataTable from '../../dynamic-table/components/DataTable'
import TotalsBar from '../../dynamic-table/components/TotalsBar'
import useCatalog from '../../dynamic-table/hooks/useCatalog'
import { computeFormulaColumns } from '../../dynamic-table/utils/formula'
import { getFilledLines } from '../../dynamic-table/utils/totals'

function hasMeaningfulValue(value, depth = 0) {
    if (value === null || value === undefined) return false
    if (typeof value === 'number') return !Number.isNaN(value)
    if (typeof value === 'boolean') return true
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.some(v => hasMeaningfulValue(v, depth + 1))
    if (typeof value === 'object') {
        if (depth > 5) return false
        const keys = Object.keys(value)
        if (keys.length === 0) return false
        return keys.some(k => hasMeaningfulValue(value[k], depth + 1))
    }
    return false
}

function isMeaningfulLine(line) {
    if (!line || typeof line !== 'object') return false
    return hasMeaningfulValue(line.values) || hasMeaningfulValue(line.computed)
}

function normalizeSchemaId(value) {
    if (!value) return ''
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'object') {
        if (value.$oid) return String(value.$oid).trim()
        if (value._id) return String(value._id).trim()
        if (value.id) return String(value.id).trim()
    }
    return String(value).trim()
}

function pickLinesForSchema(lines, schemaId, schemaDef) {
    const cleaned = (lines || []).filter(isMeaningfulLine)
    if (cleaned.length === 0) return []

    const exact = cleaned
        .filter(l => normalizeSchemaId(l?.schemaId) === normalizeSchemaId(schemaId))
        .sort((a, b) => (a?.order || 0) - (b?.order || 0))
    if (exact.length > 0) return exact

    const targetKeys = new Set((schemaDef?.columns || []).map(c => c?.key).filter(Boolean))
    if (targetKeys.size === 0) return []

    const bySchema = {}
    for (const line of cleaned) {
        const sid = normalizeSchemaId(line?.schemaId)
        if (!sid) continue
        if (!bySchema[sid]) bySchema[sid] = []
        bySchema[sid].push(line)
    }

    let bestId = ''
    let bestScore = 0
    for (const [sid, rows] of Object.entries(bySchema)) {
        const keys = new Set()
        for (const row of rows) {
            Object.keys(row?.values || {}).forEach(k => { if (!k.endsWith('_label')) keys.add(k) })
            Object.keys(row?.computed || {}).forEach(k => keys.add(k))
        }
        let score = 0
        keys.forEach(k => { if (targetKeys.has(k)) score++ })
        if (score > bestScore) {
            bestScore = score
            bestId = sid
        }
    }
    if (!bestId || bestScore <= 0) return []
    return (bySchema[bestId] || []).slice().sort((a, b) => (a?.order || 0) - (b?.order || 0))
}

export default function DynamicTableModalReact({ open, onClose, config, accountNumber, documentId, sourceRecordId, activePlaceholder }) {
    const [schema, setSchema] = useState(null)
    const [lines, setLines] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [presets, setPresets] = useState([])
    const [savingPreset, setSavingPreset] = useState(false)
    const [catalogPicker, setCatalogPicker] = useState({ open: false, query: '', loading: false, results: [], selectedIds: [] })

    const schemaId = config?.schemaId
    const { searchState, openSearch, closeSearch, search, resolveLineDefaults, resolveApplyDefaults } = useCatalog({ accountNumber })

    const relationCol = useMemo(() => (schema?.columns || []).find(c => c?.type === 'relation') || null, [schema])
    const canOpenCatalog = !!(schema?.sourceEntityId || relationCol?.config?.targetEntity)
    const lineCount = getFilledLines(lines).length

    const normalizeRows = useCallback((rawRows, schemaDef) => {
        return pickLinesForSchema(rawRows, schemaId, schemaDef).map((row, idx) => ({
            ...row,
            _tempId: row?._tempId || row?._id || `tmp_${Date.now()}_${idx}`,
            schemaId: row?.schemaId || schemaId,
            lineType: row?.lineType || schemaDef?.defaultLineType || 'default',
            values: { ...(row?.values || {}) },
            computed: { ...(row?.computed || {}) },
            order: Number.isFinite(Number(row?.order)) ? Number(row.order) : idx
        }))
    }, [schemaId])

    useEffect(() => {
        if (!open || !schemaId || !accountNumber) return
        setLoading(true)
        Promise.all([
            fetch(`/account/${accountNumber}/api/line-schemas/${schemaId}`, { credentials: 'include' }).then(r => r.json()).catch(() => null),
            documentId
                ? fetch(`/account/${accountNumber}/api/document-lines/${documentId}`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ data: [] }))
                : Promise.resolve({ data: [] }),
            fetch(`/account/${accountNumber}/api/grid-templates?schemaId=${schemaId}${sourceRecordId ? `&includeRecord=${sourceRecordId}` : ''}`, { credentials: 'include' })
                .then(r => r.json()).catch(() => ({ templates: [] }))
        ]).then(([schemaRes, linesRes, presetsRes]) => {
            const schemaData = schemaRes?.data || schemaRes || null
            setSchema(schemaData)
            setLines(normalizeRows(linesRes?.data || [], schemaData))
            setPresets(presetsRes?.templates || [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [open, schemaId, accountNumber, documentId, sourceRecordId, normalizeRows])

    const normalizeDefaults = useCallback((schemaDef, defaults) => {
        const out = {}
        for (const [key, val] of Object.entries(defaults || {})) {
            const col = (schemaDef?.columns || []).find(c => c?.key === key)
            if (!col) continue
            if (col.type === 'select') out[key] = Array.isArray(val) ? (val[0] ?? '') : val
            else if (col.type === 'multiselect') out[key] = Array.isArray(val) ? val : (val ? [val] : [])
            else if ((col.type === 'text' || col.type === 'textarea') && Array.isArray(val)) out[key] = val.join(', ')
            else out[key] = val
        }
        return out
    }, [])

    const applyCatalogItemToLine = useCallback((line, item, relation) => {
        const normalizedItem = {
            ...item,
            customFields: Array.isArray(item?.customFields)
                ? item.customFields.reduce((acc, cf) => {
                    const id = cf?.field_id || cf?.fieldId || cf?.id
                    if (id) acc[id] = cf?.value
                    return acc
                }, {})
                : (item?.customFields || {})
        }
        const values = { ...(line?.values || {}) }
        if (relation?.key) {
            values[relation.key] = normalizedItem._id
            values[`${relation.key}_label`] = normalizedItem.label || normalizedItem.title
        }

        const hybrid = relation ? resolveApplyDefaults(relation, normalizedItem) : {}
        Object.entries(hybrid || {}).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') values[k] = v
        })

        const defaults = resolveLineDefaults(normalizedItem, schemaId)
        Object.assign(values, normalizeDefaults(schema, defaults?.defaults || {}))
        Object.assign(values, computeFormulaColumns(schema, values))

        return {
            ...line,
            values,
            ...(defaults?.availableOptions ? { _availableOptions: defaults.availableOptions } : {}),
            ...(defaults?.excludedColumns ? { _excludedColumns: defaults.excludedColumns } : {})
        }
    }, [resolveApplyDefaults, resolveLineDefaults, schemaId, normalizeDefaults, schema])

    const onCellChange = useCallback((lineIdx, key, value) => {
        setLines(prev => {
            const next = [...prev]
            if (!next[lineIdx]) return prev
            const values = { ...(next[lineIdx].values || {}), [key]: value }
            Object.assign(values, computeFormulaColumns(schema, values))
            next[lineIdx] = { ...next[lineIdx], values }
            return next
        })
    }, [schema])

    const onSelectRelation = useCallback((lineIdx, col, item) => {
        setLines(prev => {
            const next = [...prev]
            if (!next[lineIdx]) return prev
            next[lineIdx] = applyCatalogItemToLine(next[lineIdx], item, col)
            return next
        })
        closeSearch({ schemaId, lineIdx })
    }, [applyCatalogItemToLine, closeSearch, schemaId])

    const onAddLine = useCallback(() => {
        setLines(prev => [...prev, {
            _tempId: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            schemaId,
            lineType: schema?.defaultLineType || 'default',
            values: {},
            computed: {},
            order: prev.length
        }])
    }, [schemaId, schema])

    const onRemoveLine = useCallback((lineIdx) => {
        setLines(prev => prev.filter((_, idx) => idx !== lineIdx).map((line, idx) => ({ ...line, order: idx })))
    }, [])

    const searchCatalogPicker = useCallback(async (query) => {
        const targetEntity = schema?.sourceEntityId || relationCol?.config?.targetEntity
        if (!accountNumber || !targetEntity) return
        const searchFields = (relationCol?.config?.searchFields || ['title']).join(',')
        const trimmed = (query || '').trim()
        const url = trimmed
            ? `/account/${accountNumber}/api/catalog-search?entityId=${targetEntity}&q=${encodeURIComponent(trimmed)}&searchFields=${searchFields}`
            : `/account/${accountNumber}/api/catalog-frequent?entityId=${targetEntity}`

        setCatalogPicker(prev => ({ ...prev, loading: true }))
        try {
            const data = await fetch(url, { credentials: 'include' }).then(r => r.json())
            setCatalogPicker(prev => ({ ...prev, loading: false, results: data?.data || [] }))
        } catch {
            setCatalogPicker(prev => ({ ...prev, loading: false, results: [] }))
        }
    }, [accountNumber, schema, relationCol])

    useEffect(() => {
        if (!catalogPicker.open) return
        const timer = setTimeout(() => {
            searchCatalogPicker(catalogPicker.query)
        }, 220)
        return () => clearTimeout(timer)
    }, [catalogPicker.open, catalogPicker.query, searchCatalogPicker])

    const applyCatalogSelection = useCallback(() => {
        const selectedItems = (catalogPicker.results || []).filter(item => catalogPicker.selectedIds.includes(item._id))
        if (selectedItems.length === 0) return

        setLines(prev => {
            let next = [...prev]
            for (const item of selectedItems) {
                let targetIdx = next.findIndex(line => !isMeaningfulLine(line))
                if (targetIdx < 0) {
                    next.push({
                        _tempId: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        schemaId,
                        lineType: schema?.defaultLineType || 'default',
                        values: {},
                        computed: {},
                        order: next.length
                    })
                    targetIdx = next.length - 1
                }
                next[targetIdx] = applyCatalogItemToLine(next[targetIdx], item, relationCol)
            }
            return next.map((line, idx) => ({ ...line, order: idx }))
        })
        setCatalogPicker(prev => ({ ...prev, open: false, selectedIds: [] }))
    }, [catalogPicker.results, catalogPicker.selectedIds, schemaId, schema, applyCatalogItemToLine, relationCol])

    const saveLines = useCallback(async (closeAfter = false) => {
        const meaningful = (lines || []).filter(isMeaningfulLine).map((line, idx) => ({
            _id: line?._id || undefined,
            schemaId,
            lineType: line?.lineType || 'default',
            values: line?.values || {},
            order: idx
        }))
        const res = await fetch(`/account/${accountNumber}/api/document-lines/${documentId}/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ schemaId, lines: meaningful })
        })
        const data = await res.json()
        const cleaned = normalizeRows(data?.data || [], schema)
        setLines(cleaned)

        if (activePlaceholder) {
            const renderRes = await fetch(`/account/${accountNumber}/api/smartdoc/render-table`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ schemaId, style: config?.style || 'professional', config, lines: cleaned })
            })
            const renderData = await renderRes.json()
            if (renderData?.success && renderData?.html) {
                activePlaceholder.innerHTML = renderData.html
                activePlaceholder.dispatchEvent(new Event('input', { bubbles: true }))
            }
        }
        if (closeAfter) onClose()
    }, [lines, schemaId, accountNumber, documentId, normalizeRows, schema, activePlaceholder, config, onClose])

    const handleSave = useCallback(async () => {
        try {
            setSaving(true)
            await saveLines(true)
        } finally {
            setSaving(false)
        }
    }, [saveLines])

    if (!open) return null

    return (
        <div className="dt-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.42)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
            <div style={{ width: 'min(1180px,96vw)', maxHeight: '88vh', background: '#fff', border: '1px solid #dbe3f3', borderRadius: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 30, fontWeight: 700, color: '#1f2937' }}>Gerer les lignes</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{config?.schemaName || schema?.label || 'Tableau dynamique'}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                        <iconify-icon icon="tabler:x" width="16" />
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>Chargement...</div>
                ) : (
                    <>
                        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 14 }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
                                <Toolbar
                                    schema={schema}
                                    saving={saving}
                                    lineCount={lineCount}
                                    presets={presets}
                                    linkedRecords={[]}
                                    currentRecordId={sourceRecordId || ''}
                                    lines={lines}
                                    savingPreset={savingPreset}
                                    validating={false}
                                    catalogEnabled={canOpenCatalog}
                                    showValidateButton={false}
                                    showSavePresetAction={true}
                                    onApplyPreset={(preset) => {
                                        if (!preset?.presetRows?.length) return
                                        const newLines = preset.presetRows.map((row, idx) => ({
                                            _tempId: `tmp_${Date.now()}_${idx}`,
                                            schemaId,
                                            lineType: row.lineType || schema?.defaultLineType || 'default',
                                            values: { ...(row.values || {}) },
                                            computed: computeFormulaColumns(schema, row.values || {}),
                                            order: idx
                                        }))
                                        setLines(newLines)
                                    }}
                                    onDeletePreset={async (preset) => {
                                        if (!window.confirm('Supprimer ce preset ?')) return
                                        await fetch(`/account/${accountNumber}/api/grid-templates/${preset._id}`, { method: 'DELETE', credentials: 'include' })
                                        setPresets(prev => prev.filter(p => String(p?._id || '') !== String(preset?._id || '')))
                                    }}
                                    onSavePreset={async () => {
                                        const name = (window.prompt('Nom du preset', `${config?.schemaName || 'Preset'} ${Date.now()}`) || '').trim()
                                        if (!name) return
                                        try {
                                            setSavingPreset(true)
                                            await saveLines(false)
                                            await fetch(`/account/${accountNumber}/api/grid-templates/save-from-record`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                credentials: 'include',
                                                body: JSON.stringify({
                                                    name,
                                                    schemaId,
                                                    documentId,
                                                    scope: sourceRecordId ? 'record' : 'workspace',
                                                    ...(sourceRecordId ? { recordId: sourceRecordId } : {})
                                                })
                                            })
                                            const preRes = await fetch(`/account/${accountNumber}/api/grid-templates?schemaId=${schemaId}${sourceRecordId ? `&includeRecord=${sourceRecordId}` : ''}`, { credentials: 'include' }).then(r => r.json())
                                            setPresets(preRes?.templates || [])
                                        } finally {
                                            setSavingPreset(false)
                                        }
                                    }}
                                    onOpenCatalog={() => setCatalogPicker({ open: true, query: '', loading: false, results: [], selectedIds: [] })}
                                />

                                <DataTable
                                    schemaId={schemaId}
                                    schema={schema}
                                    lines={lines}
                                    getRelationCol={() => relationCol}
                                    getVisibleColumns={(line) => {
                                        const excluded = Array.isArray(line?._excludedColumns) ? line._excludedColumns : []
                                        return (schema?.columns || []).filter(c => !c?.hidden && c?.visible !== false && c?.type !== 'relation' && !excluded.includes(c?.key))
                                    }}
                                    getRelationLabel={(line) => relationCol?.key ? (line?.values?.[`${relationCol.key}_label`] || '') : ''}
                                    searchState={searchState}
                                    onOpenSearch={(sid, lineIdx, colKey) => openSearch(sid, lineIdx, colKey)}
                                    onSearch={(sid, lineIdx, colKey, query) => {
                                        const targetEntity = schema?.sourceEntityId || relationCol?.config?.targetEntity
                                        const searchFields = relationCol?.config?.searchFields || ['title']
                                        search(sid, lineIdx, colKey, query, targetEntity, searchFields)
                                    }}
                                    onCloseSearch={closeSearch}
                                    onSelectRelation={onSelectRelation}
                                    onCellChange={onCellChange}
                                    onRemoveLine={onRemoveLine}
                                    onAddLine={onAddLine}
                                />

                                <TotalsBar schema={schema} lines={lines} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <span style={{ fontSize: 12, color: '#6b7280' }}>{lineCount} ligne{lineCount > 1 ? 's' : ''}</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                                <button onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', border: '1px solid #4f46e5', background: saving ? '#a5b4fc' : '#4f46e5', color: '#fff', borderRadius: 10, cursor: saving ? 'default' : 'pointer', fontWeight: 700 }}>
                                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {catalogPicker.open && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)', zIndex: 10050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setCatalogPicker(prev => ({ ...prev, open: false }))}>
                    <div style={{ width: 'min(820px,100%)', maxHeight: '80vh', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
                            <input type="text" placeholder="Rechercher dans le catalogue" value={catalogPicker.query} onChange={(e) => setCatalogPicker(prev => ({ ...prev, query: e.target.value }))} style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', outline: 'none' }} />
                            <button type="button" onClick={() => setCatalogPicker(prev => ({ ...prev, open: false }))} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', padding: '8px 10px', cursor: 'pointer' }}>Fermer</button>
                        </div>

                        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            {catalogPicker.loading && (
                                <div style={{ padding: 12, fontSize: 12, color: '#9ca3af' }}>Chargement...</div>
                            )}
                            {!catalogPicker.loading && catalogPicker.results.length === 0 && (
                                <div style={{ padding: 12, fontSize: 12, color: '#9ca3af' }}>Aucun resultat</div>
                            )}
                            {!catalogPicker.loading && catalogPicker.results.map(item => {
                                const checked = catalogPicker.selectedIds.includes(item._id)
                                return (
                                    <button
                                        key={item._id}
                                        type="button"
                                        onClick={() => {
                                            setCatalogPicker(prev => {
                                                const exists = prev.selectedIds.includes(item._id)
                                                return {
                                                    ...prev,
                                                    selectedIds: exists
                                                        ? prev.selectedIds.filter(id => id !== item._id)
                                                        : [...prev.selectedIds, item._id]
                                                }
                                            })
                                        }}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            border: 'none',
                                            borderBottom: '1px solid #f9fafb',
                                            background: checked ? 'rgba(67,97,238,0.06)' : '#fff',
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10
                                        }}
                                    >
                                        <input type="checkbox" readOnly checked={checked} />
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.label || item.title}</div>
                                            {item.description && <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.description}</div>}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        <div style={{ borderTop: '1px solid #f3f4f6', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>
                                {catalogPicker.selectedIds.length} selection{catalogPicker.selectedIds.length > 1 ? 's' : ''}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => setCatalogPicker(prev => ({ ...prev, selectedIds: [] }))}
                                    style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 12, padding: '8px 10px', cursor: 'pointer' }}
                                >
                                    Vider
                                </button>
                                <button
                                    type="button"
                                    onClick={applyCatalogSelection}
                                    disabled={catalogPicker.selectedIds.length === 0}
                                    style={{
                                        border: '1px solid #4361ee',
                                        borderRadius: 8,
                                        background: catalogPicker.selectedIds.length === 0 ? '#dbe3ff' : '#4361ee',
                                        color: '#fff',
                                        fontSize: 12,
                                        padding: '8px 12px',
                                        cursor: catalogPicker.selectedIds.length === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Ajouter la selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
