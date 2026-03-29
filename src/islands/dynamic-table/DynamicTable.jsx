/**
 * DynamicTable - Main orchestrator component
 * Reusable React island for dynamic line tables (treatments, invoicing, etc.)
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import useSchemas from './hooks/useSchemas'
import useLines from './hooks/useLines'
import useCatalog from './hooks/useCatalog'
import SchemaTabBar from './components/SchemaTabBar'
import DataTable from './components/DataTable'
import Toolbar from './components/Toolbar'

const styles = {
    panel: {
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'visible',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '13px'
    },
    loading: {
        padding: '32px',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '12px'
    },
    empty: {
        padding: '24px',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '12px'
    }
}

function normalizeToken(v) {
    return String(v || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

function isFilledLine(line) {
    if (!line?.values) return false
    return Object.values(line.values).some(v =>
        v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
    )
}

function normalizeDefaultsForSchema(schema, rawDefaults) {
    if (!schema || !rawDefaults || typeof rawDefaults !== 'object') return {}

    const columns = schema.columns || []
    const byKey = new Map(columns.map(c => [String(c.key || ''), c]))
    const byId = new Map(columns.map(c => [String(c._id || ''), c]))
    const byLabel = new Map(columns.map(c => [normalizeToken(c.label), c]))

    const out = {}
    for (const [rawKey, rawVal] of Object.entries(rawDefaults)) {
        const keyStr = String(rawKey || '')
        const col =
            byKey.get(keyStr) ||
            byId.get(keyStr) ||
            byLabel.get(normalizeToken(keyStr))

        if (!col?.key) continue

        let finalValue = rawVal

        if (col.type === 'select') {
            const options = col.config?.options || []
            const first = Array.isArray(rawVal) ? rawVal[0] : rawVal
            const match = options.find(o =>
                String(o.value) === String(first) ||
                normalizeToken(o.label) === normalizeToken(first) ||
                normalizeToken(o.value) === normalizeToken(first)
            )
            finalValue = match ? match.value : first
        } else if (col.type === 'multiselect') {
            const options = col.config?.options || []
            const arr = Array.isArray(rawVal) ? rawVal : (rawVal ? [rawVal] : [])
            finalValue = arr
                .map(v => {
                    const m = options.find(o =>
                        String(o.value) === String(v) ||
                        normalizeToken(o.label) === normalizeToken(v) ||
                        normalizeToken(o.value) === normalizeToken(v)
                    )
                    return m ? m.value : v
                })
                .filter(v => v !== null && v !== undefined && v !== '')
        } else if ((col.type === 'text' || col.type === 'textarea') && Array.isArray(rawVal)) {
            finalValue = rawVal.join(', ')
        } else if (col.type === 'duration' && (typeof rawVal === 'number' || /^\d+$/.test(String(rawVal || '')))) {
            finalValue = { value: Number(rawVal), unit: 'day' }
        }

        out[col.key] = finalValue
    }

    return out
}

function formatSnapshotLine(schema, line, rowIdx) {
    const values = line?.values || {}
    const cols = (schema?.columns || []).filter(c => c && c.hidden !== true)
    if (cols.length === 0) return `Ligne ${rowIdx + 1}`

    const chunks = []
    for (const col of cols) {
        if (!col?.key) continue
        let v = values[col.key]

        if (col.type === 'relation') {
            const relLabel = values[col.key + '_label']
            if (relLabel) chunks.push(String(relLabel))
            continue
        }

        if (v === null || v === undefined || v === '') continue

        if (col.type === 'select') {
            const opt = (col.config?.options || []).find(o => String(o.value) === String(v))
            v = opt?.label || v
        } else if (col.type === 'multiselect') {
            const arr = Array.isArray(v) ? v : [v]
            const labels = arr
                .map(one => {
                    const opt = (col.config?.options || []).find(o => String(o.value) === String(one))
                    return opt?.label || one
                })
                .filter(Boolean)
            if (labels.length === 0) continue
            v = labels.join(', ')
        } else if (col.type === 'duration' && typeof v === 'object') {
            const map = { day: 'jour(s)', week: 'sem.', month: 'mois', year: 'an(s)' }
            v = `${v.value || ''} ${map[v.unit] || v.unit || ''}`.trim()
        }

        if (String(v).trim()) chunks.push(String(v))
        if (chunks.length >= 4) break
    }

    return chunks.length > 0 ? chunks.join(' - ') : `Ligne ${rowIdx + 1}`
}

export default function DynamicTable({
    accountNumber,
    recordId,
    entityId,
    schemaFilter = ''
}) {
    const { schemas, activeSchemaId, setActiveSchemaId, loading: schemasLoading } = useSchemas({
        accountNumber, entityId, schemaFilter
    })

    const {
        setLinesMap, linesMapRef, saving,
        getSchemaLines, updateLineValue,
        addLine, removeLine, reorderLines, debouncedSave,
        saveLinesForSchema, reload
    } = useLines({ accountNumber, recordId, schemas, activeSchemaId })

    const {
        searchState, openSearch, closeSearch, search,
        resolveLineDefaults, resolveApplyDefaults
    } = useCatalog({ accountNumber })

    const [templates, setTemplates] = useState([])
    const [catalogPicker, setCatalogPicker] = useState({
        open: false,
        schemaId: '',
        query: '',
        loading: false,
        results: [],
        selectedIds: []
    })
    const [validatingMap, setValidatingMap] = useState({})
    const [snapshotHistoryMap, setSnapshotHistoryMap] = useState({})
    const [snapshotLoadingMap, setSnapshotLoadingMap] = useState({})
    const [snapshotExpanded, setSnapshotExpanded] = useState({})
    const [snapshotDeletingId, setSnapshotDeletingId] = useState('')
    const [snapshotShowAllMap, setSnapshotShowAllMap] = useState({})
    const [snapshotPendingDeleteId, setSnapshotPendingDeleteId] = useState('')
    const deleteTimerRef = useRef(null)
    const [visibleSchemaIds, setVisibleSchemaIds] = useState([])

    const storageKey = `dt_visible_tabs:${accountNumber || ''}:${entityId || ''}:${recordId || ''}:${schemaFilter || ''}`

    const getSnapshotTargetRecordId = useCallback((schema) => {
        const cfg = schema?.snapshotConfig
        if (!cfg) return recordId
        if (cfg.targetType === 'relation' && cfg.targetRelationKey) {
            try {
                const jsonEl = document.getElementById('linesPanel-relations')
                if (jsonEl) {
                    const data = JSON.parse(jsonEl.textContent || '{}')
                    const recRels = data.recordRelations || []
                    const rel = recRels.find(r => r.relationKey === cfg.targetRelationKey)
                    if (rel?.records?.[0]?._id) return rel.records[0]._id
                }
            } catch (e) {
                console.warn('[DynamicTable] relation target parse failed:', e)
            }
        }
        return recordId
    }, [recordId])

    const getRelationCol = useCallback((schema) => {
        if (!schema) return null
        return (schema.columns || []).find(c => c.type === 'relation') || null
    }, [])

    const getVisibleColumns = useCallback((schema, line) => {
        if (!schema) return []
        const excluded = line?._excludedColumns || []
        return (schema.columns || []).filter(c =>
            !c.hidden && !excluded.includes(c.key) && c.type !== 'relation'
        )
    }, [])

    const getRelationLabel = useCallback((line, schema) => {
        const relCol = getRelationCol(schema)
        if (!relCol) return ''
        return line?.values?.[relCol.key + '_label'] || ''
    }, [getRelationCol])

    const loadTemplates = useCallback(async () => {
        try {
            const schemaIds = schemas.map(s => s._id).join(',')
            if (!schemaIds) return
            const url = `/account/${accountNumber}/api/grid-templates?schemaId=${schemaIds}&includeRecord=${recordId}`
            const res = await fetch(url, { credentials: 'include' })
            const data = await res.json()
            setTemplates(data.templates || [])
        } catch (e) {
            console.error('[DynamicTable] Load templates error:', e)
            setTemplates([])
        }
    }, [accountNumber, recordId, schemas])

    useEffect(() => {
        if (schemas.length > 0) loadTemplates()
    }, [schemas, loadTemplates])

    useEffect(() => {
        if (!schemas.length) return
        const allIds = schemas.map(s => String(s._id))

        try {
            const raw = window.localStorage.getItem(storageKey)
            if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) {
                    const filtered = parsed.map(String).filter(id => allIds.includes(id))
                    if (filtered.length > 0) {
                        setVisibleSchemaIds(filtered)
                        return
                    }
                }
            }
        } catch (e) {
            console.warn('[DynamicTable] visible tabs restore failed:', e)
        }

        setVisibleSchemaIds(allIds)
    }, [schemas, storageKey])

    useEffect(() => {
        if (!visibleSchemaIds.length) return
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(visibleSchemaIds))
        } catch (e) {
            console.warn('[DynamicTable] visible tabs persist failed:', e)
        }
    }, [visibleSchemaIds, storageKey])

    const toggleSchemaVisibility = useCallback((schemaIdRaw) => {
        const schemaId = String(schemaIdRaw)
        const allIds = schemas.map(s => String(s._id))
        setVisibleSchemaIds(prev => {
            const current = (prev && prev.length > 0 ? prev : allIds).map(String)
            const exists = current.includes(schemaId)
            if (!exists) return [...current, schemaId]

            const next = current.filter(id => id !== schemaId)
            return next.length > 0 ? next : current
        })
    }, [schemas])

    const showAllSchemas = useCallback(() => {
        setVisibleSchemaIds(schemas.map(s => String(s._id)))
    }, [schemas])

    const effectiveVisibleIds = visibleSchemaIds.length > 0
        ? visibleSchemaIds
        : schemas.map(s => String(s._id))
    const displayedSchemas = schemas.filter(s => effectiveVisibleIds.includes(String(s._id)))

    useEffect(() => {
        if (!displayedSchemas.length) return
        if (!displayedSchemas.some(s => String(s._id) === String(activeSchemaId))) {
            setActiveSchemaId(displayedSchemas[0]._id)
        }
    }, [displayedSchemas, activeSchemaId, setActiveSchemaId])

    const getTemplatesForSchema = useCallback((schemaId) => {
        const sid = schemaId?.toString()
        return templates.filter(t => {
            const tSchemaId = (t.schemaId?._id || t.schemaId)?.toString()
            return tSchemaId === sid
        })
    }, [templates])

    const pickBestCatalogItem = useCallback((rawItem, schemaId) => {
        if (!rawItem) return rawItem
        if (resolveLineDefaults(rawItem, schemaId)) return rawItem

        const rawLabel = (rawItem.label || rawItem.title || '').trim().toLowerCase()
        if (!rawLabel) return rawItem

        const candidate = (searchState.results || []).find(r => {
            if (!r || r._id === rawItem._id) return false
            const sameLabel = (r.label || r.title || '').trim().toLowerCase() === rawLabel
            return sameLabel && !!resolveLineDefaults(r, schemaId)
        })

        return candidate || rawItem
    }, [searchState.results, resolveLineDefaults])

    const applyRelationSelection = useCallback((schemaId, lineIdx, col, item, forcedSchema = null) => {
        if (!item || !col) return

        const selectedItem = pickBestCatalogItem(item, schemaId)
        const hybridDefaults = resolveApplyDefaults(col, selectedItem)
        const resolved = resolveLineDefaults(selectedItem, schemaId)
        const schema = forcedSchema || schemas.find(s => s._id === schemaId || (s._id && s._id.toString() === schemaId.toString()))
        const normalizedDefaults = normalizeDefaultsForSchema(schema, resolved?.defaults || {})

        setLinesMap(prev => {
            const newMap = { ...prev }
            const lines = [...(newMap[schemaId] || [])]
            if (!lines[lineIdx]) {
                return prev
            }

            const newValues = { ...lines[lineIdx].values }
            newValues[col.key] = selectedItem._id
            newValues[col.key + '_label'] = selectedItem.label || selectedItem.title

            if (hybridDefaults) {
                for (const [k, v] of Object.entries(hybridDefaults)) {
                    if (v !== null && v !== undefined && v !== '') newValues[k] = v
                }
            }

            if (Object.keys(normalizedDefaults).length > 0) {
                for (const [k, v] of Object.entries(normalizedDefaults)) {
                    if (v === null || v === undefined || v === '') continue
                    newValues[k] = v
                }
            }

            const updatedLine = { ...lines[lineIdx], values: newValues }
            if (resolved) {
                if (resolved.availableOptions) updatedLine._availableOptions = resolved.availableOptions
                if (resolved.excludedColumns) updatedLine._excludedColumns = resolved.excludedColumns
            }

            lines[lineIdx] = updatedLine
            newMap[schemaId] = lines
            linesMapRef.current = newMap
            return newMap
        })

        setTimeout(() => {
            reorderLines(schemaId, schema)
        }, 60)

        closeSearch()
    }, [schemas, setLinesMap, resolveApplyDefaults, resolveLineDefaults, reorderLines, closeSearch, pickBestCatalogItem, linesMapRef])

    const handleSelectRelation = useCallback((schemaId, lineIdx, col, item) => {
        applyRelationSelection(schemaId, lineIdx, col, item)
        debouncedSave(schemaId)
        setTimeout(() => saveLinesForSchema(schemaId), 220)
    }, [applyRelationSelection, debouncedSave, saveLinesForSchema])

    const handleCellChange = useCallback((schemaId, lineIdx, key, value) => {
        updateLineValue(schemaId, lineIdx, key, value)
        debouncedSave(schemaId)
    }, [updateLineValue, debouncedSave])

    const handleAddLine = useCallback((schemaId) => {
        const schema = schemas.find(s => s._id === schemaId)
        addLine(schemaId, schema)
    }, [schemas, addLine])

    const handleRemoveLine = useCallback((schemaId, lineIdx) => {
        removeLine(schemaId, lineIdx)
        debouncedSave(schemaId)
    }, [removeLine, debouncedSave])

    const loadSnapshotHistory = useCallback(async (schema) => {
        const schemaId = schema?._id
        if (!schemaId || !schema?.snapshotConfig?.enabled) return
        try {
            setSnapshotLoadingMap(prev => ({ ...prev, [schemaId]: true }))
            const targetRecordId = getSnapshotTargetRecordId(schema)
            const res = await fetch(`/account/${accountNumber}/api/grid-snapshots/${schemaId}/${targetRecordId}`, {
                credentials: 'include'
            })
            const data = await res.json()
            const list = data.data || []
            setSnapshotHistoryMap(prev => ({ ...prev, [schemaId]: list }))
            if (list[0]?._id) {
                setSnapshotExpanded(prev => ({ ...prev, [list[0]._id]: true }))
            }
        } catch (e) {
            console.error('[DynamicTable] Load snapshot history error:', e)
            setSnapshotHistoryMap(prev => ({ ...prev, [schemaId]: [] }))
        } finally {
            setSnapshotLoadingMap(prev => ({ ...prev, [schemaId]: false }))
        }
    }, [accountNumber, getSnapshotTargetRecordId])

    const deleteSnapshot = useCallback(async (schema, snapId) => {
        if (!snapId) return
        if (snapshotPendingDeleteId !== snapId) {
            setSnapshotPendingDeleteId(snapId)
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
            deleteTimerRef.current = setTimeout(() => setSnapshotPendingDeleteId(''), 3000)
            return
        }

        try {
            setSnapshotPendingDeleteId('')
            setSnapshotDeletingId(snapId)
            const res = await fetch(`/account/${accountNumber}/api/grid-snapshots/${snapId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (res.ok) {
                const sid = schema?._id
                if (sid) {
                    setSnapshotHistoryMap(prev => ({
                        ...prev,
                        [sid]: (prev[sid] || []).filter(s => s._id !== snapId)
                    }))
                }
            }
        } catch (e) {
            console.error('[DynamicTable] Delete snapshot error:', e)
        } finally {
            setSnapshotDeletingId('')
        }
    }, [accountNumber, snapshotPendingDeleteId])

    useEffect(() => {
        return () => {
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
        }
    }, [])

    const handleApplyPreset = useCallback(async (preset) => {
        try {
            const res = await fetch(`/account/${accountNumber}/api/grid-templates/${preset._id}/apply/${recordId}`, {
                method: 'POST',
                credentials: 'include'
            })
            const data = await res.json()
            if (data.success) {
                const schemaId = (preset.schemaId?._id || preset.schemaId)?.toString()
                if (schemaId) setActiveSchemaId(schemaId)
                await reload()
            }
        } catch (e) {
            console.error('[DynamicTable] Apply preset error:', e)
        }
    }, [accountNumber, recordId, reload, setActiveSchemaId])

    const handleSavePreset = useCallback(async (schema) => {
        const name = window.prompt('Nom du preset')
        if (!name || !name.trim()) return

        try {
            const payload = {
                name: name.trim(),
                schemaId: schema._id,
                documentId: recordId,
                scope: 'workspace'
            }
            const res = await fetch(`/account/${accountNumber}/api/grid-templates/save-from-record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (data.success && data.template) {
                setTemplates(prev => [...prev, data.template])
            }
        } catch (e) {
            console.error('[DynamicTable] Save preset error:', e)
        }
    }, [accountNumber, recordId])

    const handleDeletePreset = useCallback(async (preset) => {
        if (!window.confirm('Supprimer ce preset ?')) return
        try {
            const res = await fetch(`/account/${accountNumber}/api/grid-templates/${preset._id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            const data = await res.json()
            if (data.success) {
                setTemplates(prev => prev.filter(t => t._id !== preset._id))
            }
        } catch (e) {
            console.error('[DynamicTable] Delete preset error:', e)
        }
    }, [accountNumber])

    const handleValidate = useCallback(async (schema) => {
        const schemaId = schema?._id
        if (!schemaId) return

        const lines = getSchemaLines(schemaId)
        const hasFilled = lines.some(isFilledLine)
        if (!hasFilled) return

        try {
            setValidatingMap(prev => ({ ...prev, [schemaId]: true }))
            await saveLinesForSchema(schemaId)

            if (schema.snapshotConfig?.enabled) {
                const targetRecordId = getSnapshotTargetRecordId(schema)
                const date = new Date().toISOString().split('T')[0]
                const res = await fetch(`/account/${accountNumber}/api/grid-snapshots`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        schemaId,
                        recordId,
                        targetRecordId,
                        targetEntityId: schema.snapshotConfig?.targetEntityId || null,
                        date
                    })
                })
                if (!res.ok) {
                    console.error('[DynamicTable] Snapshot validate failed:', res.status)
                } else {
                    await loadSnapshotHistory(schema)
                }
            }
        } catch (e) {
            console.error('[DynamicTable] Snapshot validate error:', e)
        } finally {
            setValidatingMap(prev => ({ ...prev, [schemaId]: false }))
        }
    }, [accountNumber, recordId, getSchemaLines, saveLinesForSchema, loadSnapshotHistory, getSnapshotTargetRecordId])

    const searchCatalogInPicker = useCallback(async (schema, query) => {
        const relCol = getRelationCol(schema)
        const targetEntity = schema?.sourceEntityId || relCol?.config?.targetEntity
        const searchFields = (relCol?.config?.searchFields || ['title']).join(',')
        if (!targetEntity) return

        try {
            setCatalogPicker(prev => ({ ...prev, loading: true, query }))
            const trimmed = (query || '').trim()
            const url = trimmed
                ? `/account/${accountNumber}/api/catalog-search?entityId=${targetEntity}&q=${encodeURIComponent(trimmed)}&searchFields=${searchFields}`
                : `/account/${accountNumber}/api/catalog-frequent?entityId=${targetEntity}`
            const res = await fetch(url, { credentials: 'include' })
            const data = await res.json()
            setCatalogPicker(prev => ({ ...prev, loading: false, results: data.data || [] }))
        } catch (e) {
            console.error('[DynamicTable] Catalog picker search error:', e)
            setCatalogPicker(prev => ({ ...prev, loading: false, results: [] }))
        }
    }, [accountNumber, getRelationCol])

    const openCatalogPicker = useCallback((schema) => {
        const relCol = getRelationCol(schema)
        if (!relCol) return

        setCatalogPicker({
            open: true,
            schemaId: schema._id,
            query: '',
            loading: false,
            results: [],
            selectedIds: []
        })

        searchCatalogInPicker(schema, '')
    }, [getRelationCol, searchCatalogInPicker])

    const closeCatalogPicker = useCallback(() => {
        setCatalogPicker({ open: false, schemaId: '', query: '', loading: false, results: [], selectedIds: [] })
    }, [])

    const toggleCatalogItem = useCallback((itemId) => {
        setCatalogPicker(prev => {
            const exists = prev.selectedIds.includes(itemId)
            return {
                ...prev,
                selectedIds: exists
                    ? prev.selectedIds.filter(id => id !== itemId)
                    : [...prev.selectedIds, itemId]
            }
        })
    }, [])

    const applyCatalogBulkSelection = useCallback((schema) => {
        const relCol = getRelationCol(schema)
        if (!relCol) return

        const selected = catalogPicker.results.filter(r => catalogPicker.selectedIds.includes(r._id))
        if (selected.length === 0) return

        const schemaId = schema._id

        // Process ALL selected items in a single setLinesMap call to avoid
        // React 18 batching issue (linesMapRef not updated between iterations)
        setLinesMap(prev => {
            const newMap = { ...prev }
            let lines = [...(newMap[schemaId] || [])]

            for (const item of selected) {
                // Find first empty line
                let targetIdx = lines.findIndex(l => !isFilledLine(l))

                // If no empty line, create one
                if (targetIdx === -1) {
                    lines.push({
                        _tempId: 'tmp_' + Date.now() + '_' + Math.random(),
                        schemaId,
                        lineType: schema?.defaultLineType || schema?.lineTypes?.[0] || 'default',
                        values: {},
                        computed: {},
                        order: lines.length
                    })
                    targetIdx = lines.length - 1
                }

                // Apply relation + defaults to the target line
                const selectedItem = pickBestCatalogItem(item, schemaId)
                const hybridDefaults = resolveApplyDefaults(relCol, selectedItem)
                const resolved = resolveLineDefaults(selectedItem, schemaId)
                const normalizedDefaults = normalizeDefaultsForSchema(schema, resolved?.defaults || {})

                const newValues = { ...lines[targetIdx].values }
                newValues[relCol.key] = selectedItem._id
                newValues[relCol.key + '_label'] = selectedItem.label || selectedItem.title

                if (hybridDefaults) {
                    for (const [k, v] of Object.entries(hybridDefaults)) {
                        if (v !== null && v !== undefined && v !== '') newValues[k] = v
                    }
                }

                if (Object.keys(normalizedDefaults).length > 0) {
                    for (const [k, v] of Object.entries(normalizedDefaults)) {
                        if (v === null || v === undefined || v === '') continue
                        newValues[k] = v
                    }
                }

                const updatedLine = { ...lines[targetIdx], values: newValues }
                if (resolved) {
                    if (resolved.availableOptions) updatedLine._availableOptions = resolved.availableOptions
                    if (resolved.excludedColumns) updatedLine._excludedColumns = resolved.excludedColumns
                }

                lines[targetIdx] = updatedLine
            }

            // Reorder: filled lines first, then empties, ensure ≥1 empty
            const filledLines = lines.filter(l => isFilledLine(l))
            const emptyLines = lines.filter(l => !isFilledLine(l))
            if (emptyLines.length === 0) {
                emptyLines.push({
                    _tempId: 'tmp_' + Date.now() + '_' + Math.random(),
                    schemaId,
                    lineType: schema?.defaultLineType || schema?.lineTypes?.[0] || 'default',
                    values: {},
                    computed: {},
                    order: filledLines.length
                })
            }

            newMap[schemaId] = [...filledLines, ...emptyLines]
            linesMapRef.current = newMap
            return newMap
        })

        debouncedSave(schemaId)
        setTimeout(() => saveLinesForSchema(schemaId), 260)
        closeCatalogPicker()
    }, [catalogPicker.results, catalogPicker.selectedIds, getRelationCol, linesMapRef, setLinesMap, pickBestCatalogItem, resolveApplyDefaults, resolveLineDefaults, debouncedSave, closeCatalogPicker, saveLinesForSchema])

    useEffect(() => {
        const active = schemas.find(s => s._id === activeSchemaId)
        if (active?.snapshotConfig?.enabled) {
            loadSnapshotHistory(active)
        }
    }, [activeSchemaId, schemas, loadSnapshotHistory])

    if (schemasLoading) {
        return (
            <div style={styles.panel}>
                <div style={styles.loading}>
                    <div style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid #e5e7eb', borderTopColor: '#4361ee', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    <p style={{ marginTop: 8, fontSize: 11 }}>Chargement des tableaux dynamiques...</p>
                    <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
                </div>
            </div>
        )
    }

    if (!schemasLoading && schemas.length === 0) {
        return (
            <div style={styles.panel}>
                <div style={styles.empty}>
                    <p>Aucun tableau dynamique disponible pour cette entité</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.panel}>
            {schemas.length > 1 && (
                <SchemaTabBar
                    schemas={schemas}
                    activeSchemaId={activeSchemaId}
                    onSelectSchema={setActiveSchemaId}
                    getSchemaLines={getSchemaLines}
                    visibleSchemaIds={visibleSchemaIds}
                    onToggleSchemaVisibility={toggleSchemaVisibility}
                    onShowAllSchemas={showAllSchemas}
                />
            )}

            {displayedSchemas.map(schema => (
                <div
                    key={schema._id}
                    style={{ display: activeSchemaId === schema._id ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative' }}
                >
                    <Toolbar
                        schema={schema}
                        saving={saving[schema._id]}
                        validating={!!validatingMap[schema._id]}
                        presets={getTemplatesForSchema(schema._id)}
                        lines={getSchemaLines(schema._id)}
                        lineCount={getSchemaLines(schema._id).filter(isFilledLine).length}
                        catalogEnabled={!!getRelationCol(schema)}
                        onApplyPreset={handleApplyPreset}
                        onDeletePreset={handleDeletePreset}
                        onSavePreset={() => handleSavePreset(schema)}
                        onValidate={() => handleValidate(schema)}
                        onOpenCatalog={() => openCatalogPicker(schema)}
                    />

                    {catalogPicker.open && catalogPicker.schemaId === schema._id && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(17,24,39,0.35)',
                            zIndex: 240,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 16
                        }}>
                            <div style={{
                                width: 'min(820px, 100%)',
                                maxHeight: '80vh',
                                background: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: 12,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.24)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
                                    <input
                                        type="text"
                                        value={catalogPicker.query}
                                        onChange={(e) => searchCatalogInPicker(schema, e.target.value)}
                                        placeholder="Rechercher dans le catalogue"
                                        style={{
                                            flex: 1,
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            padding: '8px 10px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={closeCatalogPicker}
                                        style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 12, padding: '8px 10px', cursor: 'pointer' }}
                                    >
                                        Fermer
                                    </button>
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
                                                onClick={() => toggleCatalogItem(item._id)}
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
                                            onClick={() => {
                                                setCatalogPicker(prev => ({ ...prev, selectedIds: [] }))
                                            }}
                                            style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 12, padding: '8px 10px', cursor: 'pointer' }}
                                        >
                                            Vider
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyCatalogBulkSelection(schema)}
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
                        </div>
                    )}

                    <DataTable
                        schemaId={schema._id}
                        schema={schema}
                        lines={getSchemaLines(schema._id)}
                        getRelationCol={() => getRelationCol(schema)}
                        getVisibleColumns={(line) => getVisibleColumns(schema, line)}
                        getRelationLabel={(line) => getRelationLabel(line, schema)}
                        searchState={searchState}
                        onOpenSearch={(schemaId, lineIdx, colKey) => openSearch(schemaId, lineIdx, colKey)}
                        onSearch={(schemaId, lineIdx, colKey, query) => {
                            const relCol = getRelationCol(schema)
                            const targetEntity = schema.sourceEntityId || relCol?.config?.targetEntity
                            const searchFields = relCol?.config?.searchFields || ['title']
                            search(schemaId, lineIdx, colKey, query, targetEntity, searchFields)
                        }}
                        onCloseSearch={closeSearch}
                        onSelectRelation={(lineIdx, col, item) => handleSelectRelation(schema._id, lineIdx, col, item)}
                        onCellChange={(lineIdx, key, value) => handleCellChange(schema._id, lineIdx, key, value)}
                        onRemoveLine={(lineIdx) => handleRemoveLine(schema._id, lineIdx)}
                        onAddLine={() => handleAddLine(schema._id)}
                    />

                    {schema.snapshotConfig?.enabled && (
                        <div style={{ borderTop: '1px solid #f3f4f6', padding: '10px 12px', maxHeight: 260, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 10 }}>
                                Historique
                            </div>
                            {snapshotLoadingMap[schema._id] && (
                                <div style={{ fontSize: 12, color: '#9ca3af' }}>Chargement...</div>
                            )}
                            {!snapshotLoadingMap[schema._id] && (snapshotHistoryMap[schema._id] || []).length === 0 && (
                                <div style={{ fontSize: 12, color: '#9ca3af' }}>Aucun enregistrement</div>
                            )}
                            {!snapshotLoadingMap[schema._id] && (() => {
                                const all = snapshotHistoryMap[schema._id] || []
                                const showAll = !!snapshotShowAllMap[schema._id]
                                const visible = showAll ? all : all.slice(0, 5)
                                return visible.map((snap) => {
                                const open = !!snapshotExpanded[snap._id]
                                const displayDate = new Date(snap.date || snap.createdAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })
                                const displayTime = new Date(snap.createdAt || snap.date).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                return (
                                    <div key={snap._id} style={{ position: 'relative', paddingLeft: 22, marginBottom: 8 }}>
                                        <div style={{ position: 'absolute', left: 7, top: 0, bottom: -8, width: 2, background: '#e5e7eb' }} />
                                        <div style={{ position: 'absolute', left: 2, top: 12, width: 12, height: 12, borderRadius: '50%', background: '#4361ee', boxShadow: '0 0 0 3px #eef2ff' }} />
                                        <div style={{ border: '1px solid #f3f4f6', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', background: '#fafafa', cursor: 'pointer' }}
                                            onClick={() => setSnapshotExpanded(prev => ({ ...prev, [snap._id]: !open }))}
                                        >
                                            <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>
                                                {(schema.label || schema.name || 'Traitement')} - {displayDate}
                                                <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{displayTime}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteSnapshot(schema, snap._id)
                                                }}
                                                disabled={snapshotDeletingId === snap._id}
                                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                            >
                                                {snapshotDeletingId === snap._id ? (
                                                    '...'
                                                ) : snapshotPendingDeleteId === snap._id ? (
                                                    'Supprimer'
                                                ) : (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-label="Supprimer">
                                                        <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                                        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                                        <path d="M7 7l1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {open && (
                                            <div style={{ padding: '6px 10px' }}>
                                                {(snap.lines || []).slice(0, 8).map((line, idx) => (
                                                    <div key={idx} style={{ fontSize: 12, color: '#6b7280', padding: '3px 0', borderBottom: '1px dashed #f3f4f6' }}>
                                                        {formatSnapshotLine(schema, line, idx)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    </div>
                                )
                                })
                            })()}
                            {!snapshotLoadingMap[schema._id] && (snapshotHistoryMap[schema._id] || []).length > 5 && (
                                <button
                                    type="button"
                                    onClick={() => setSnapshotShowAllMap(prev => ({ ...prev, [schema._id]: !prev[schema._id] }))}
                                    style={{ border: 'none', background: 'none', color: '#4361ee', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '2px 4px' }}
                                >
                                    {snapshotShowAllMap[schema._id] ? 'Afficher moins' : `Afficher plus (${(snapshotHistoryMap[schema._id] || []).length})`}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
