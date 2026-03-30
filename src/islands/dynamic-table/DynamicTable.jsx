/**
 * DynamicTable - Main orchestrator component
 * Reusable React island for dynamic line tables (treatments, invoicing, etc.)
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import useSchemas from './hooks/useSchemas'
import useLines from './hooks/useLines'
import useCatalog from './hooks/useCatalog'
import SchemaTabBar from './components/SchemaTabBar'
import DataTable from './components/DataTable'
import Toolbar from './components/Toolbar'
import TotalsBar from './components/TotalsBar'

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

/**
 * Evaluate formula columns for a given line.
 * Returns an object { key: computedValue } for all formula columns.
 * Formulas reference other column keys (e.g., "qty * unitPrice").
 * Supports cascading: formulas that depend on other formula results.
 */
function computeFormulaColumns(schema, lineValues) {
    if (!schema?.columns) return {}
    const formulaCols = schema.columns.filter(c => c.type === 'formula' && c.config?.expression)
    if (formulaCols.length === 0) return {}

    // Build a values map with current line values
    const vals = { ...lineValues }
    const results = {}

    // Resolve formulas with cascading (up to 3 passes for dependency chains)
    for (let pass = 0; pass < 3; pass++) {
        let changed = false
        for (const col of formulaCols) {
            try {
                const expr = col.config.expression
                // Replace variable names with their numeric values
                const resolved = expr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (varName) => {
                    const v = vals[varName]
                    return (v !== null && v !== undefined && v !== '' && !isNaN(Number(v)))
                        ? Number(v)
                        : '0'
                })
                // Safe eval: only allow numbers and basic math operators
                if (/^[\d\s+\-*/().]+$/.test(resolved)) {
                    const result = Function('"use strict"; return (' + resolved + ')')()
                    if (isFinite(result)) {
                        const rounded = Math.round(result * 100) / 100
                        if (vals[col.key] !== rounded) {
                            vals[col.key] = rounded
                            results[col.key] = rounded
                            changed = true
                        }
                    }
                }
            } catch (e) {
                // Skip invalid expressions
            }
        }
        if (!changed) break
    }

    return results
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
        getSchemaLines, updateLineValue, updateLineValues,
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
    const [columnWidthsMap, setColumnWidthsMap] = useState({}) // { [schemaId]: { [colKey]: width } }
    const colWidthsSaveTimerRef = useRef(null)

    const storageKey = `dt_visible_tabs:${accountNumber || ''}:${entityId || ''}:${recordId || ''}:${schemaFilter || ''}`
    const prefsViewId = `dynamic-table:${recordId || ''}`

    // ── Load column widths from server ──
    useEffect(() => {
        if (!accountNumber || !recordId) return
        fetch(`/account/${accountNumber}/api/user/view-preferences/${encodeURIComponent(prefsViewId)}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                const saved = data?.preferences?.gridColumnWidths
                if (saved && typeof saved === 'object') {
                    setColumnWidthsMap(saved)
                }
            })
            .catch(() => {})
    }, [accountNumber, recordId, prefsViewId])

    // ── Save column widths to server (debounced) ──
    const saveColumnWidths = useCallback((newMap) => {
        if (colWidthsSaveTimerRef.current) clearTimeout(colWidthsSaveTimerRef.current)
        colWidthsSaveTimerRef.current = setTimeout(() => {
            fetch(`/account/${accountNumber}/api/user/view-preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    viewId: prefsViewId,
                    preferences: { gridColumnWidths: newMap }
                })
            }).catch(() => {})
        }, 600)
    }, [accountNumber, prefsViewId])

    const handleColumnResize = useCallback((schemaId, colKey, newWidth) => {
        setColumnWidthsMap(prev => {
            const updated = {
                ...prev,
                [schemaId]: { ...(prev[schemaId] || {}), [colKey]: newWidth }
            }
            saveColumnWidths(updated)
            return updated
        })
    }, [saveColumnWidths])

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
            !c.hidden && c.visible !== false && !excluded.includes(c.key) && c.type !== 'relation'
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

            // Compute formula columns (e.g., lineTotal, lineVat, lineTtc)
            if (schema) {
                const formulaResults = computeFormulaColumns(schema, newValues)
                for (const [k, v] of Object.entries(formulaResults)) {
                    updatedLine.values[k] = v
                }
            }

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

        // Recompute formula columns after value change
        const schema = schemas.find(s => s._id === schemaId || (s._id && s._id.toString() === schemaId.toString()))
        if (schema) {
            // Use a microtask to read the updated values after updateLineValue
            setTimeout(() => {
                const currentLines = linesMapRef.current[schemaId] || []
                const line = currentLines[lineIdx]
                if (!line) return
                const formulaResults = computeFormulaColumns(schema, line.values)
                if (Object.keys(formulaResults).length > 0) {
                    updateLineValues(schemaId, lineIdx, formulaResults)
                }
            }, 0)
        }

        debouncedSave(schemaId)
    }, [updateLineValue, updateLineValues, debouncedSave, schemas, linesMapRef])

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

    const restoreSnapshot = useCallback(async (schema, snap) => {
        if (!snap || !schema) return
        if (!window.confirm('Voulez-vous restaurer cet historique ? Cela écrasera les données actuelles.')) return

        const schemaId = schema._id
        
        // 1. Restore lines
        setLinesMap(prev => ({
            ...prev,
            [schemaId]: (snap.lines || []).map(l => ({
                ...l,
                _tempId: 'snap_' + Date.now() + '_' + Math.random()
            }))
        }))

        // 2. Restore column widths if available
        if (snap.columnWidths) {
            setColumnWidthsMap(prev => {
                const updated = {
                    ...prev,
                    [schemaId]: snap.columnWidths
                }
                saveColumnWidths(updated)
                return updated
            })
        }

        // 3. Save to server
        setTimeout(() => saveLinesForSchema(schemaId), 100)
    }, [setLinesMap, setColumnWidthsMap, saveColumnWidths, saveLinesForSchema])

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
                        date,
                        columnWidths: columnWidthsMap[schemaId] || null
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

                // Compute formula columns (e.g., lineTotal, lineTtc)
                const formulaResults = computeFormulaColumns(schema, newValues)
                for (const [k, v] of Object.entries(formulaResults)) {
                    updatedLine.values[k] = v
                }

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

                    {catalogPicker.open && catalogPicker.schemaId === schema._id && createPortal(
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(17,24,39,0.35)',
                            zIndex: 99999,
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
                        </div>,
                        document.body
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
                        columnWidths={columnWidthsMap[schema._id] || {}}
                        onColumnResize={(colKey, width) => handleColumnResize(schema._id, colKey, width)}
                    />

                    <TotalsBar
                        schema={schema}
                        lines={getSchemaLines(schema._id)}
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
                                const visibleItems = showAll ? all : all.slice(0, 5)
                                if (visibleItems.length === 0) return null

                                return (
                                    <div style={{ position: 'relative', paddingLeft: 22, marginTop: 15 }}>
                                        {/* Vertical Timeline Line */}
                                        <div style={{ position: 'absolute', left: 7, top: 5, bottom: 5, width: 2, background: '#cbd5e1' }} />

                                        {visibleItems.map((snap) => {
                                            const expanded = !!snapshotExpanded[snap._id]
                                            const d = new Date(snap.date || snap.createdAt)
                                            const displayDate = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                            const displayTime = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                            
                                            // Identify columns for preview (visible columns from schema)
                                            // Include relation columns by keeping them in the list (we'll fetch label below)
                                            const previewCols = (schema?.columns || []).filter(c => !c.hidden && c.visible !== false)
                                            
                                            return (
                                                <div key={snap._id} style={{ position: 'relative', marginBottom: 12 }}>
                                                    {/* Timeline Dot */}
                                                    <div style={{ 
                                                        position: 'absolute', left: -20, top: 6, width: 10, height: 10, borderRadius: '50%', 
                                                        background: expanded ? '#4361ee' : '#cbd5e1', 
                                                        boxShadow: expanded ? '0 0 0 4px #eef2ff' : 'none',
                                                        zIndex: 2, transition: 'all 0.2s' 
                                                    }} />

                                                    <div style={{ 
                                                        borderRadius: 10, border: expanded ? '1px solid #eef2ff' : '1px solid transparent', 
                                                        background: expanded ? '#fff' : 'transparent', 
                                                        overflow: 'hidden', transition: 'all 0.2s' 
                                                    }}>
                                                        {/* Header / Summary */}
                                                        <div 
                                                            style={{ 
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                                                gap: 12, padding: '6px 8px', cursor: 'pointer', borderRadius: 8,
                                                                background: expanded ? '#f8fafc' : 'rgba(255,255,255,0.4)' 
                                                            }}
                                                            onClick={() => setSnapshotExpanded(prev => ({ ...prev, [snap._id]: !expanded }))}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{displayDate}</div>
                                                                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{displayTime}</div>
                                                                {!expanded && (
                                                                    <div style={{ 
                                                                        fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', 
                                                                        textOverflow: 'ellipsis', maxWidth: 400 
                                                                    }}>
                                                                        • {snap.lines?.length || 0} lignes - {formatSnapshotLine(schema, snap.lines?.[0], 0)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                {expanded && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); restoreSnapshot(schema, snap); }}
                                                                        style={{ border: 'none', background: '#4361ee', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(67, 97, 238, 0.2)' }}
                                                                    >
                                                                        Restaurer
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); deleteSnapshot(schema, snap._id); }}
                                                                    style={{ border: 'none', background: 'none', color: snapshotPendingDeleteId === snap._id ? '#ef4444' : '#94a3b8', padding: '4px', cursor: 'pointer' }}
                                                                >
                                                                    {snapshotDeletingId === snap._id ? '...' : (
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                                            <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                            <path d="M7 7l1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Table Preview */}
                                                        {expanded && (
                                                            <div style={{ padding: '10px 8px 15px' }}>
                                                                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                                                        <thead style={{ background: '#f8fafc' }}>
                                                                            <tr>
                                                                                {previewCols.map(col => (
                                                                                    <th key={col.key} style={{ textAlign: 'left', padding: '8px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 9 }}>
                                                                                        {col.label}
                                                                                    </th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {(snap.lines || []).filter(l => isFilledLine(l)).map((line, lidx) => (
                                                                                <tr key={lidx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                                                    {previewCols.map(col => {
                                                                                        let val = line.values?.[col.key]
                                                                                        if (col.type === 'relation') {
                                                                                            val = line.values?.[col.key + '_label'] || val
                                                                                        } else if (col.type === 'select') {
                                                                                            const opt = (col.config?.options || []).find(o => String(o.value) === String(val))
                                                                                            val = opt?.label || val
                                                                                        }
                                                                                        const isNumeric = ['number', 'formula', 'currency'].includes(col.type) || typeof val === 'number'
                                                                                        return (
                                                                                            <td key={col.key} style={{ padding: '8px', color: '#1e293b', fontWeight: 500, borderRight: '1px solid #f1f5f9' }}>
                                                                                                {isNumeric && val !== null && val !== undefined && val !== ''
                                                                                                    ? Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) 
                                                                                                    : String(val || '')}
                                                                                            </td>
                                                                                        )
                                                                                    })}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                {/* Totals Summary */}
                                                                {(() => {
                                                                    const rowDefs = (schema?.totals?.rows) || []
                                                                    const filledLines = (snap.lines || []).filter(isFilledLine)
                                                                    if (rowDefs.length > 0 && filledLines.length > 0) {
                                                                        return (
                                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                                                                                <table style={{ minWidth: 200, fontSize: 11, borderCollapse: 'collapse' }}>
                                                                                    <tbody>
                                                                                        {rowDefs.map((def, ridx) => {
                                                                                            const keys = def.keys || (def.key ? [def.key] : [])
                                                                                            let value = 0
                                                                                            if (def.type === 'count') value = filledLines.length
                                                                                            else {
                                                                                                for (const l of filledLines) {
                                                                                                    for (const k of keys) value += Number(l.values?.[k] || 0)
                                                                                                }
                                                                                            }
                                                                                            return (
                                                                                                <tr key={ridx}>
                                                                                                    <td style={{ padding: '3px 8px', color: '#64748b', textAlign: 'right', fontWeight: 600 }}>{def.label}</td>
                                                                                                    <td style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 700, color: def.isFinal ? '#4361ee' : '#1e293b', fontSize: def.isFinal ? 13 : 11 }}>
                                                                                                        {def.format === 'count' ? value : value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            )
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )
                                                                    }
                                                                    return null
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })()}
                            {!snapshotLoadingMap[schema._id] && (snapshotHistoryMap[schema._id] || []).length > 5 && (
                                <div style={{ marginTop: 15, textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => setSnapshotShowAllMap(prev => ({ ...prev, [schema._id]: !prev[schema._id] }))}
                                        style={{ border: 'none', background: '#f8fafc', color: '#64748b', fontSize: 10, fontWeight: 800, cursor: 'pointer', padding: '8px 16px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                                    >
                                        {snapshotShowAllMap[schema._id] ? 'Masquer l\'historique' : `Historique complet (${(snapshotHistoryMap[schema._id] || []).length})`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
