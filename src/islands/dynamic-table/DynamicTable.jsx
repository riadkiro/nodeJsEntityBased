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
import { computeFormulaColumns } from './utils/formula'
import { computeTotalsRows } from './utils/totals'

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

const INITIAL_SAVE_PRESET_MODAL = {
    open: false,
    schemaId: '',
    schemaName: '',
    name: '',
    scope: 'workspace',
    lineCount: 0,
    saving: false,
    error: '',
    linkedRecordId: '',
    linkedRecordLabel: '',
    linkedRelationLabel: ''
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

function parseLinkedRecordsFromDom() {
    if (typeof document === 'undefined') return []

    const linked = []

    try {
        const jsonEl = document.getElementById('linesPanel-relations')
        if (jsonEl) {
            const data = JSON.parse(jsonEl.textContent || '{}')
            const entityRels = data.entityRelations || []
            const recordRels = data.recordRelations || []

            for (const eRel of entityRels) {
                const relationKey = String(eRel?.key || '')
                if (!relationKey) continue
                const rRel = recordRels.find(r => String(r?.relationKey || '') === relationKey)
                if (!rRel?.records?.length) continue

                for (const rec of rRel.records) {
                    const relationIcon = eRel?.targetEntity?.icon || eRel?.icon || 'solar:link-bold-duotone'
                    const relationColor = eRel?.targetEntity?.color || eRel?.color || '#4361ee'
                    linked.push({
                        relationKey,
                        relationLabel: eRel?.label || 'Relation',
                        recordId: String(rec?._id || rec?.id || ''),
                        recordTitle: rec?.title || rec?.computedTitle || 'Sans titre',
                        entitySlug: rec?.entitySlug || '',
                        relationIcon,
                        relationColor
                    })
                }
            }
        }
    } catch (e) {
        console.warn('[DynamicTable] relation parse from JSON failed:', e)
    }

    try {
        document.querySelectorAll('[data-relation-key]').forEach(relEl => {
            const relationKey = String(relEl?.dataset?.relationKey || '')
            if (!relationKey) return
            const relationLabel = relEl?.dataset?.relationLabel || 'Relation'
            const relationIcon = relEl?.dataset?.relationIcon || 'solar:link-bold-duotone'
            const relationColor = relEl?.dataset?.relationColor || '#4361ee'

            relEl.querySelectorAll('[data-record-id]').forEach(recEl => {
                const recordId = String(recEl?.dataset?.recordId || '')
                if (!recordId) return
                linked.push({
                    relationKey,
                    relationLabel,
                    recordId,
                    recordTitle: recEl?.dataset?.recordTitle || recEl?.textContent?.trim() || 'Sans titre',
                    entitySlug: recEl?.dataset?.entitySlug || '',
                    relationIcon,
                    relationColor
                })
            })
        })
    } catch (e) {
        console.warn('[DynamicTable] relation parse from DOM failed:', e)
    }

    const deduped = []
    const seen = new Set()
    for (const row of linked) {
        const relationKey = String(row?.relationKey || '')
        const recordId = String(row?.recordId || '')
        if (!recordId) continue
        const token = `${relationKey}::${recordId}`
        if (seen.has(token)) continue
        seen.add(token)
        deduped.push({
            relationKey,
            relationLabel: row?.relationLabel || 'Relation',
            recordId,
            recordTitle: row?.recordTitle || 'Sans titre',
            entitySlug: row?.entitySlug || '',
            relationIcon: row?.relationIcon || 'solar:link-bold-duotone',
            relationColor: row?.relationColor || '#4361ee'
        })
    }

    return deduped
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
        addLine, removeLine, reorderLines, moveLine, reorderLinesByIds, debouncedSave,
        saveLinesForSchema, reload
    } = useLines({ accountNumber, recordId, schemas, activeSchemaId })

    const {
        searchState, openSearch, closeSearch, search,
        resolveLineDefaults, resolveApplyDefaults
    } = useCatalog({ accountNumber })

    const [templates, setTemplates] = useState([])
    const [linkedRecords, setLinkedRecords] = useState([])
    const [catalogPicker, setCatalogPicker] = useState({
        open: false,
        schemaId: '',
        query: '',
        loading: false,
        results: [],
        selectedIds: [],
        classificationFilter: '' // optionId or '' for all
    })
    const [catalogClassifications, setCatalogClassifications] = useState([]) // { _id, label, color }
    const [validatingMap, setValidatingMap] = useState({})
    const [snapshotHistoryMap, setSnapshotHistoryMap] = useState({})
    const [snapshotLoadingMap, setSnapshotLoadingMap] = useState({})
    const [snapshotExpanded, setSnapshotExpanded] = useState({})
    const [snapshotDeletingId, setSnapshotDeletingId] = useState('')
    const [snapshotShowAllMap, setSnapshotShowAllMap] = useState({})
    const [snapshotPendingDeleteId, setSnapshotPendingDeleteId] = useState('')
    const [savePresetModal, setSavePresetModal] = useState(INITIAL_SAVE_PRESET_MODAL)
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

    const refreshLinkedRecords = useCallback(() => {
        const next = parseLinkedRecordsFromDom()
        setLinkedRecords(next)
        return next
    }, [])

    useEffect(() => {
        refreshLinkedRecords()
        const timer = setTimeout(refreshLinkedRecords, 550)
        return () => clearTimeout(timer)
    }, [recordId, refreshLinkedRecords])

    const loadTemplates = useCallback(async () => {
        try {
            const schemaIds = schemas.map(s => s._id).join(',')
            if (!schemaIds) return
            let url = `/account/${accountNumber}/api/grid-templates?schemaId=${schemaIds}`
            const allRecordIds = [recordId, ...linkedRecords.map(r => r.recordId)]
                .map(v => String(v || '').trim())
                .filter(Boolean)
            const uniqRecordIds = Array.from(new Set(allRecordIds))
            if (uniqRecordIds.length > 0) {
                url += `&includeRecord=${uniqRecordIds.join(',')}`
            }
            const res = await fetch(url, { credentials: 'include' })
            const data = await res.json()
            setTemplates(data.templates || [])
        } catch (e) {
            console.error('[DynamicTable] Load templates error:', e)
            setTemplates([])
        }
    }, [accountNumber, recordId, schemas, linkedRecords])

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

    const handleReorderLine = useCallback((schemaId, oldIndex, newIndex) => {
        moveLine(schemaId, oldIndex, newIndex)
        closeSearch()
        debouncedSave(schemaId)
    }, [moveLine, closeSearch, debouncedSave])

    const handleReorderByIds = useCallback((schemaId, orderedIds) => {
        reorderLinesByIds(schemaId, orderedIds)
        closeSearch()
        debouncedSave(schemaId)
    }, [reorderLinesByIds, closeSearch, debouncedSave])

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

    const openSavePresetModal = useCallback((schema) => {
        const schemaId = schema?._id
        if (!schemaId) return
        const lineCount = getSchemaLines(schemaId).filter(isFilledLine).length
        if (lineCount <= 0) return

        const latestLinkedRecords = refreshLinkedRecords()
        const firstLinked = latestLinkedRecords[0] || null

        setSavePresetModal({
            ...INITIAL_SAVE_PRESET_MODAL,
            open: true,
            schemaId: String(schemaId),
            schemaName: schema.label || schema.name || '',
            scope: firstLinked ? 'linked' : 'workspace',
            lineCount,
            linkedRecordId: firstLinked ? String(firstLinked.recordId || '') : '',
            linkedRecordLabel: firstLinked?.recordTitle || '',
            linkedRelationLabel: firstLinked?.relationLabel || ''
        })
    }, [getSchemaLines, refreshLinkedRecords])

    const closeSavePresetModal = useCallback(() => {
        setSavePresetModal(INITIAL_SAVE_PRESET_MODAL)
    }, [])

    useEffect(() => {
        if (!savePresetModal.open) return undefined
        const onKeyDown = (e) => {
            if (e.key === 'Escape') closeSavePresetModal()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [savePresetModal.open, closeSavePresetModal])

    const confirmSavePreset = useCallback(async () => {
        const presetName = (savePresetModal.name || '').trim()
        if (!presetName || savePresetModal.saving) return

        const schemaId = savePresetModal.schemaId
        const schema = schemas.find(s => String(s._id) === String(schemaId))
        if (!schema?._id) {
            setSavePresetModal(prev => ({ ...prev, error: 'Schema introuvable.' }))
            return
        }

        try {
            setSavePresetModal(prev => ({ ...prev, saving: true, error: '' }))

            // Save current lines first so backend can persist preset rows from DB
            await saveLinesForSchema(schema._id)

            const modalScope = savePresetModal.scope || 'workspace'
            let backendScope = modalScope === 'linked' ? 'record' : modalScope
            let targetRecordId
            let targetRecordLabel = ''

            if (modalScope === 'linked') {
                const linkedTarget = linkedRecords.find(r => String(r.recordId) === String(savePresetModal.linkedRecordId))
                if (!linkedTarget?.recordId) {
                    throw new Error('Record lie introuvable.')
                }
                targetRecordId = linkedTarget.recordId
                targetRecordLabel = `${linkedTarget.relationLabel || 'Relation'}: ${linkedTarget.recordTitle || 'Sans titre'}`
            } else if (modalScope === 'record') {
                targetRecordId = recordId
                targetRecordLabel = document.title || ''
            }

            const payload = {
                name: presetName,
                schemaId: schema._id,
                documentId: recordId,
                scope: backendScope
            }

            if (targetRecordId) {
                payload.recordId = targetRecordId
            }
            if (targetRecordLabel) {
                payload.recordLabel = targetRecordLabel
            }

            const res = await fetch(`/account/${accountNumber}/api/grid-templates/save-from-record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })

            let data = null
            try {
                data = await res.json()
            } catch (_) {
                // Keep null to trigger generic HTTP error
            }

            if (!res.ok || !data?.success) {
                throw new Error(data?.error || `Erreur HTTP ${res.status}`)
            }

            if (data.template) {
                setTemplates(prev => {
                    const exists = prev.some(t => String(t._id) === String(data.template._id))
                    return exists ? prev : [...prev, data.template]
                })
            }
            await loadTemplates()

            setSavePresetModal(INITIAL_SAVE_PRESET_MODAL)
        } catch (e) {
            console.error('[DynamicTable] Save preset error:', e)
            setSavePresetModal(prev => ({
                ...prev,
                saving: false,
                error: e?.message || 'Impossible de sauvegarder le preset.'
            }))
        }
    }, [savePresetModal, schemas, saveLinesForSchema, recordId, accountNumber, loadTemplates, linkedRecords])

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

    const searchCatalogInPicker = useCallback(async (schema, query, classificationOptionId = '') => {
        const relCol = getRelationCol(schema)
        const targetEntity = schema?.sourceEntityId || relCol?.config?.targetEntity
        const searchFields = (relCol?.config?.searchFields || ['title']).join(',')
        if (!targetEntity) return

        try {
            setCatalogPicker(prev => ({ ...prev, loading: true, query }))
            const trimmed = (query || '').trim()
            const classParam = classificationOptionId ? `&classificationOptionId=${classificationOptionId}` : ''
            const url = trimmed
                ? `/account/${accountNumber}/api/catalog-search?entityId=${targetEntity}&q=${encodeURIComponent(trimmed)}&searchFields=${searchFields}${classParam}`
                : `/account/${accountNumber}/api/catalog-frequent?entityId=${targetEntity}${classParam}`
            const res = await fetch(url, { credentials: 'include' })
            const data = await res.json()
            setCatalogPicker(prev => ({ ...prev, loading: false, results: data.data || [] }))
        } catch (e) {
            console.error('[DynamicTable] Catalog picker search error:', e)
            setCatalogPicker(prev => ({ ...prev, loading: false, results: [] }))
        }
    }, [accountNumber, getRelationCol])

    const openCatalogPicker = useCallback(async (schema) => {
        const relCol = getRelationCol(schema)
        if (!relCol) return

        setCatalogPicker({
            open: true,
            schemaId: schema._id,
            query: '',
            loading: false,
            results: [],
            selectedIds: [],
            classificationFilter: ''
        })

        // Fetch classification options if schema has catalogGroupBy configured
        const classificationId = schema.catalogGroupBy?.classificationId
        if (classificationId) {
            try {
                const res = await fetch(`/account/${accountNumber}/classification/api/list`, { credentials: 'include' })
                const data = await res.json()
                const classifications = Array.isArray(data) ? data : (data.data || [])
                const cls = classifications.find(c => String(c._id) === String(classificationId))
                if (cls && cls.options) {
                    setCatalogClassifications(cls.options.map(o => ({
                        _id: String(o._id),
                        label: o.label || o.value,
                        color: o.color || '#6b7280'
                    })))
                } else {
                    setCatalogClassifications([])
                }
            } catch (e) {
                console.error('[DynamicTable] Failed to load classification options:', e)
                setCatalogClassifications([])
            }
        } else {
            setCatalogClassifications([])
        }

        searchCatalogInPicker(schema, '')
    }, [accountNumber, getRelationCol, searchCatalogInPicker])

    const closeCatalogPicker = useCallback(() => {
        setCatalogPicker({ open: false, schemaId: '', query: '', loading: false, results: [], selectedIds: [], classificationFilter: '' })
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

            {displayedSchemas.filter(schema => String(schema._id) === String(activeSchemaId)).map(schema => (
                <div
                    key={schema._id}
                    style={{ display: activeSchemaId === schema._id ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative' }}
                >
                    <Toolbar
                        schema={schema}
                        saving={saving[schema._id]}
                        savingPreset={savePresetModal.open && savePresetModal.schemaId === String(schema._id) && savePresetModal.saving}
                        validating={!!validatingMap[schema._id]}
                        presets={getTemplatesForSchema(schema._id)}
                        linkedRecords={linkedRecords}
                        currentRecordId={recordId}
                        lines={getSchemaLines(schema._id)}
                        lineCount={getSchemaLines(schema._id).filter(isFilledLine).length}
                        catalogEnabled={!!getRelationCol(schema)}
                        onApplyPreset={handleApplyPreset}
                        onDeletePreset={handleDeletePreset}
                        onSavePreset={() => openSavePresetModal(schema)}
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
                                        onChange={(e) => searchCatalogInPicker(schema, e.target.value, catalogPicker.classificationFilter)}
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

                                {/* Classification filter tabs */}
                                {catalogClassifications.length > 0 && (
                                    <div style={{
                                        padding: '8px 12px',
                                        borderBottom: '1px solid #f3f4f6',
                                        display: 'flex',
                                        gap: 6,
                                        overflowX: 'auto',
                                        flexShrink: 0
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCatalogPicker(prev => ({ ...prev, classificationFilter: '' }))
                                                searchCatalogInPicker(schema, catalogPicker.query, '')
                                            }}
                                            style={{
                                                border: catalogPicker.classificationFilter === '' ? '1px solid #4361ee' : '1px solid #e5e7eb',
                                                borderRadius: 20,
                                                background: catalogPicker.classificationFilter === '' ? '#4361ee' : '#fff',
                                                color: catalogPicker.classificationFilter === '' ? '#fff' : '#374151',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                padding: '5px 14px',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            Tous
                                        </button>
                                        {catalogClassifications.map(opt => {
                                            const isActive = catalogPicker.classificationFilter === opt._id
                                            return (
                                                <button
                                                    key={opt._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCatalogPicker(prev => ({ ...prev, classificationFilter: opt._id }))
                                                        searchCatalogInPicker(schema, catalogPicker.query, opt._id)
                                                    }}
                                                    style={{
                                                        border: isActive ? `1px solid ${opt.color}` : '1px solid #e5e7eb',
                                                        borderRadius: 20,
                                                        background: isActive ? opt.color : '#fff',
                                                        color: isActive ? '#fff' : '#374151',
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        padding: '5px 14px',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    {opt.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                                    {catalogPicker.loading && (
                                        <div style={{ padding: 12, fontSize: 12, color: '#9ca3af' }}>Chargement...</div>
                                    )}
                                    {!catalogPicker.loading && catalogPicker.results.length === 0 && (
                                        <div style={{ padding: 12, fontSize: 12, color: '#9ca3af' }}>Aucun resultat</div>
                                    )}
                                    {(() => {
                                        // Build display columns from showOnCatalog flag on schema columns
                                        const relCol = getRelationCol(schema)
                                        const applyDefaults = relCol?.config?.applyDefaults || {}
                                        const catalogExtraCols = []

                                        // Primary: columns explicitly marked with showOnCatalog
                                        const markedCols = (schema.columns || []).filter(c => c.showOnCatalog && c.type !== 'relation')
                                        if (markedCols.length > 0) {
                                            for (const col of markedCols) {
                                                // Find the corresponding custom field ID from applyDefaults
                                                const src = applyDefaults[col.key]
                                                const fieldId = (typeof src === 'string' && src.startsWith('cf.')) ? src.substring(3) : null
                                                catalogExtraCols.push({ key: col.key, label: col.label, fieldId })
                                            }
                                        } else {
                                            // Fallback: derive from applyDefaults (backward compat)
                                            for (const [colKey, src] of Object.entries(applyDefaults)) {
                                                if (typeof src === 'string' && src.startsWith('cf.')) {
                                                    const fieldId = src.substring(3)
                                                    const schemaCol = (schema.columns || []).find(c => c.key === colKey)
                                                    if (schemaCol && schemaCol.type !== 'relation') {
                                                        catalogExtraCols.push({ key: colKey, label: schemaCol.label, fieldId })
                                                    }
                                                }
                                            }
                                        }
                                        const hasExtraCols = catalogExtraCols.length > 0

                                        return (
                                            <>
                                                {/* Table header — only show if there are extra columns */}
                                                {hasExtraCols && !catalogPicker.loading && catalogPicker.results.length > 0 && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 10,
                                                        padding: '6px 12px',
                                                        borderBottom: '1px solid #e5e7eb',
                                                        background: '#f9fafb',
                                                        position: 'sticky',
                                                        top: 0,
                                                        zIndex: 1
                                                    }}>
                                                        <div style={{ width: 20, flexShrink: 0 }}></div>
                                                        <div style={{ flex: 1, minWidth: 0, fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                                            {relCol?.label || 'Désignation'}
                                                        </div>
                                                        {catalogExtraCols.map(ec => (
                                                            <div key={ec.key} style={{
                                                                width: ec.key === 'code' ? 100 : 80,
                                                                flexShrink: 0,
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                color: '#6b7280',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '.05em',
                                                                textAlign: ec.key === 'code' ? 'left' : 'right'
                                                            }}>
                                                                {ec.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Items */}
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
                                                            <input type="checkbox" readOnly checked={checked} style={{ flexShrink: 0 }} />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label || item.title}</div>
                                                                {item.description && <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.description}</div>}
                                                            </div>
                                                            {catalogExtraCols.map(ec => {
                                                                const val = item.customFields?.[ec.fieldId]
                                                                const isNum = ['unitPrice', 'vatRate', 'puHt', 'prixHt'].includes(ec.key) || (typeof val === 'number')
                                                                return (
                                                                    <div key={ec.key} style={{
                                                                        width: ec.key === 'code' ? 100 : 80,
                                                                        flexShrink: 0,
                                                                        fontSize: 12,
                                                                        color: val ? '#374151' : '#d1d5db',
                                                                        fontWeight: val ? 500 : 400,
                                                                        textAlign: ec.key === 'code' ? 'left' : 'right',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        fontVariantNumeric: isNum ? 'tabular-nums' : 'normal'
                                                                    }}>
                                                                        {val != null && val !== '' ? val : '—'}
                                                                    </div>
                                                                )
                                                            })}
                                                        </button>
                                                    )
                                                })}
                                            </>
                                        )
                                    })()}
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

                    {savePresetModal.open && savePresetModal.schemaId === String(schema._id) && createPortal(
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'radial-gradient(circle at top, rgba(30,41,59,0.25), rgba(15,23,42,0.62))',
                                backdropFilter: 'blur(3px)',
                                zIndex: 100000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 16
                            }}
                            onClick={closeSavePresetModal}
                        >
                            <div
                                style={{
                                    width: 'min(620px, 100%)',
                                    maxHeight: '85vh',
                                    overflowY: 'auto',
                                    background: '#ffffff',
                                    border: '1px solid #dbe3f3',
                                    borderRadius: 18,
                                    boxShadow: '0 28px 90px rgba(15,23,42,0.35)',
                                    position: 'relative'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{
                                    padding: '18px 20px',
                                    borderBottom: '1px solid #eef2ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    background: 'linear-gradient(135deg, #f8fbff 0%, #f6f8ff 45%, #ffffff 100%)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 10,
                                            display: 'grid',
                                            placeItems: 'center',
                                            color: '#4361ee',
                                            background: 'rgba(67,97,238,0.13)',
                                            border: '1px solid rgba(67,97,238,0.25)',
                                            fontSize: 16,
                                            fontWeight: 700
                                        }}>
                                            <iconify-icon icon="solar:diskette-bold-duotone" width="18" />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                                                Sauvegarder comme preset
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>
                                                {savePresetModal.schemaName || 'Tableau'} - {savePresetModal.lineCount} ligne{savePresetModal.lineCount > 1 ? 's' : ''} sauvegardee{savePresetModal.lineCount > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeSavePresetModal}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: 9,
                                            border: '1px solid #e2e8f0',
                                            background: '#fff',
                                            fontSize: 14,
                                            color: '#94a3b8',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <iconify-icon icon="tabler:x" width="14" />
                                    </button>
                                </div>

                                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                                            <iconify-icon icon="solar:pen-new-round-bold-duotone" width="12" />
                                            Nom du preset
                                        </label>
                                        <input
                                            type="text"
                                            value={savePresetModal.name}
                                            onChange={(e) => setSavePresetModal(prev => ({ ...prev, name: e.target.value, error: '' }))}
                                            placeholder="Ex: Suivi patient chronique"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') confirmSavePreset()
                                            }}
                                            style={{
                                                width: '100%',
                                                border: '1.5px solid #dbe3f3',
                                                borderRadius: 12,
                                                fontSize: 13,
                                                padding: '11px 13px',
                                                color: '#0f172a',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                                            <iconify-icon icon="solar:shield-keyhole-bold-duotone" width="12" />
                                            Portee
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <button
                                                type="button"
                                                onClick={() => setSavePresetModal(prev => ({ ...prev, scope: 'workspace', error: '' }))}
                                                style={{
                                                    width: '100%',
                                                    border: savePresetModal.scope === 'workspace' ? '1.5px solid #4361ee' : '1px solid #e2e8f0',
                                                    background: savePresetModal.scope === 'workspace'
                                                        ? 'linear-gradient(135deg, rgba(67,97,238,0.13), rgba(67,97,238,0.04))'
                                                        : '#fff',
                                                    color: '#0f172a',
                                                    borderRadius: 12,
                                                    padding: '11px 12px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 10
                                                }}
                                            >
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: 7,
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        background: savePresetModal.scope === 'workspace' ? 'rgba(67,97,238,0.15)' : 'rgba(148,163,184,0.12)',
                                                        color: savePresetModal.scope === 'workspace' ? '#4361ee' : '#64748b'
                                                    }}>
                                                        <iconify-icon icon="solar:global-bold-duotone" width="13" />
                                                    </span>
                                                    Preset global
                                                </span>
                                                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                                                    Tous les records
                                                </span>
                                            </button>

                                            {linkedRecords.map((linked) => {
                                                const isActive = savePresetModal.scope === 'linked' && String(savePresetModal.linkedRecordId) === String(linked.recordId)
                                                return (
                                                    <button
                                                        key={`${linked.relationKey}-${linked.recordId}`}
                                                        type="button"
                                                        onClick={() => setSavePresetModal(prev => ({
                                                            ...prev,
                                                            scope: 'linked',
                                                            linkedRecordId: String(linked.recordId || ''),
                                                            linkedRecordLabel: linked.recordTitle || '',
                                                            linkedRelationLabel: linked.relationLabel || '',
                                                            error: ''
                                                        }))}
                                                        style={{
                                                            width: '100%',
                                                            border: isActive ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                                                            background: isActive
                                                                ? 'linear-gradient(135deg, rgba(245,158,11,0.14), rgba(245,158,11,0.03))'
                                                                : '#fff',
                                                            color: '#0f172a',
                                                            borderRadius: 12,
                                                            padding: '11px 12px',
                                                            fontSize: 13,
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: 10
                                                        }}
                                                    >
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                                            <span style={{
                                                                width: 22,
                                                                height: 22,
                                                                borderRadius: 7,
                                                                display: 'grid',
                                                                placeItems: 'center',
                                                                background: isActive
                                                                    ? 'rgba(245,158,11,0.17)'
                                                                    : 'rgba(148,163,184,0.12)',
                                                                color: linked.relationColor || (isActive ? '#d97706' : '#64748b'),
                                                                flexShrink: 0
                                                            }}>
                                                                <iconify-icon icon={linked.relationIcon || 'solar:users-group-rounded-bold-duotone'} width="13" />
                                                            </span>
                                                            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {linked.relationLabel || 'Relation'}: <span style={{ color: '#1d4ed8' }}>{linked.recordTitle || 'Sans titre'}</span>
                                                            </span>
                                                        </span>
                                                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                                                            Records lies
                                                        </span>
                                                    </button>
                                                )
                                            })}

                                            <button
                                                type="button"
                                                onClick={() => setSavePresetModal(prev => ({ ...prev, scope: 'record', error: '' }))}
                                                style={{
                                                    width: '100%',
                                                    border: savePresetModal.scope === 'record' ? '1.5px solid #22c55e' : '1px solid #e2e8f0',
                                                    background: savePresetModal.scope === 'record'
                                                        ? 'linear-gradient(135deg, rgba(34,197,94,0.13), rgba(34,197,94,0.03))'
                                                        : '#fff',
                                                    color: '#0f172a',
                                                    borderRadius: 12,
                                                    padding: '11px 12px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 10
                                                }}
                                            >
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: 7,
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        background: savePresetModal.scope === 'record' ? 'rgba(34,197,94,0.16)' : 'rgba(148,163,184,0.12)',
                                                        color: savePresetModal.scope === 'record' ? '#16a34a' : '#64748b'
                                                    }}>
                                                        <iconify-icon icon="solar:document-bold-duotone" width="13" />
                                                    </span>
                                                    Ce record uniquement
                                                </span>
                                                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                                                    Portee locale
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{
                                        border: '1px solid #e7ecf7',
                                        borderRadius: 12,
                                        background: '#f8fafc',
                                        padding: '10px 12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6
                                    }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <iconify-icon icon="solar:eye-bold-duotone" width="12" />
                                            Apercu
                                        </div>
                                        {getSchemaLines(schema._id).filter(isFilledLine).slice(0, 6).map((line, idx) => (
                                            <div key={`preview-${idx}`} style={{ fontSize: 12, color: '#334155', display: 'flex', gap: 8 }}>
                                                <span style={{ color: '#94a3b8', minWidth: 16 }}>{idx + 1}.</span>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {formatSnapshotLine(schema, line, idx)}
                                                </span>
                                            </div>
                                        ))}
                                        {getSchemaLines(schema._id).filter(isFilledLine).length > 6 && (
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                                + {getSchemaLines(schema._id).filter(isFilledLine).length - 6} autres lignes
                                            </div>
                                        )}
                                    </div>

                                    {savePresetModal.error && (
                                        <div style={{
                                            fontSize: 12,
                                            color: '#dc2626',
                                            border: '1px solid rgba(220,38,38,0.2)',
                                            background: 'rgba(254,226,226,0.55)',
                                            borderRadius: 10,
                                            padding: '8px 10px'
                                        }}>
                                            {savePresetModal.error}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    padding: 16,
                                    borderTop: '1px solid #eef2ff',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 8,
                                    background: '#fbfdff'
                                }}>
                                    <button
                                        type="button"
                                        onClick={closeSavePresetModal}
                                        style={{
                                            border: '1px solid #dbe3f3',
                                            background: '#fff',
                                            borderRadius: 10,
                                            padding: '9px 13px',
                                            fontSize: 12,
                                            color: '#64748b',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        <iconify-icon icon="solar:close-circle-bold-duotone" width="13" style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!savePresetModal.name.trim() || savePresetModal.saving}
                                        onClick={confirmSavePreset}
                                        style={{
                                            border: '1px solid #4361ee',
                                            background: (!savePresetModal.name.trim() || savePresetModal.saving)
                                                ? '#dbe3ff'
                                                : 'linear-gradient(135deg, #4361ee 0%, #324dda 100%)',
                                            color: '#fff',
                                            borderRadius: 10,
                                            padding: '9px 14px',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: (!savePresetModal.name.trim() || savePresetModal.saving) ? 'not-allowed' : 'pointer',
                                            boxShadow: (!savePresetModal.name.trim() || savePresetModal.saving)
                                                ? 'none'
                                                : '0 8px 18px rgba(67,97,238,0.3)'
                                        }}
                                    >
                                        <iconify-icon
                                            icon={savePresetModal.saving ? 'svg-spinners:ring-resize' : 'solar:diskette-bold'}
                                            width="13"
                                            style={{ marginRight: 6, verticalAlign: 'middle' }}
                                        />
                                        {savePresetModal.saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </button>
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
                        onReorderLines={(oldIndex, newIndex) => handleReorderLine(schema._id, oldIndex, newIndex)}
                        onReorderByIds={(orderedIds) => handleReorderByIds(schema._id, orderedIds)}
                        onAddLine={() => handleAddLine(schema._id)}
                        columnWidths={columnWidthsMap[schema._id] || {}}
                        onColumnResize={(colKey, width) => handleColumnResize(schema._id, colKey, width)}
                    />

                    <TotalsBar
                        schema={schema}
                        lines={getSchemaLines(schema._id)}
                    />

                    {schema.snapshotConfig?.enabled && (
                        <div style={{ borderTop: '2px solid #e2e8f0', padding: '8px 10px', maxHeight: 240, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
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
                                    <div style={{ position: 'relative', paddingLeft: 18, marginTop: 8 }}>
                                        {/* Vertical Timeline Line */}
                                        <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1.5, background: '#cbd5e1' }} />

                                        {visibleItems.map((snap) => {
                                            const expanded = !!snapshotExpanded[snap._id]
                                            const d = new Date(snap.date || snap.createdAt)
                                            const displayDate = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                            const displayTime = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                            
                                            // Identify columns for preview (visible columns from schema)
                                            // Include relation columns by keeping them in the list (we'll fetch label below)
                                            const previewCols = (schema?.columns || []).filter(c => !c.hidden && c.visible !== false)
                                            
                                            return (
                                                <div key={snap._id} style={{ position: 'relative', marginBottom: 8 }}>
                                                    {/* Timeline Dot */}
                                                    <div style={{ 
                                                        position: 'absolute', left: -14, top: 5, width: 9, height: 9, borderRadius: '50%', 
                                                        background: expanded ? '#4361ee' : '#cbd5e1', 
                                                        boxShadow: expanded ? '0 0 0 3px #eef2ff' : 'none',
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
                                                                gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 8,
                                                                background: expanded ? '#f8fafc' : 'rgba(255,255,255,0.4)' 
                                                            }}
                                                            onClick={() => setSnapshotExpanded(prev => ({ ...prev, [snap._id]: !expanded }))}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                                                                        style={{ border: 'none', background: '#4361ee', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 3px rgba(67, 97, 238, 0.2)' }}
                                                                    >
                                                                        Restaurer
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); deleteSnapshot(schema, snap._id); }}
                                                                    style={{ border: 'none', background: 'none', color: snapshotPendingDeleteId === snap._id ? '#ef4444' : '#94a3b8', padding: '2px', cursor: 'pointer' }}
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
                                                            <div style={{ padding: '6px 6px 10px' }}>
                                                                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                                                                        <thead style={{ background: '#f8fafc' }}>
                                                                            <tr>
                                                                                {previewCols.map(col => (
                                                                                    <th key={col.key} style={{ textAlign: 'left', padding: '5px 6px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>
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
                                                                                            <td key={col.key} style={{ padding: '5px 6px', color: '#1e293b', fontWeight: 500, borderRight: '1px solid #f1f5f9' }}>
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
                                                                    const rows = computeTotalsRows(schema, snap.lines || [])
                                                                    if (rows.length > 0) {
                                                                        return (
                                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                                                                <table style={{ minWidth: 180, fontSize: 12, borderCollapse: 'collapse' }}>
                                                                                    <tbody>
                                                                                        {rows.map((row, ridx) => (
                                                                                            <tr key={ridx}>
                                                                                                <td style={{ padding: '2px 6px', color: '#64748b', textAlign: 'right', fontWeight: 600 }}>{row.label}</td>
                                                                                                <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 700, color: row.isFinal ? '#4361ee' : '#1e293b', fontSize: row.isFinal ? 13 : 12 }}>
                                                                                                    {row.format === 'count'
                                                                                                        ? row.value
                                                                                                        : Number(row.value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
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
                                <div style={{ marginTop: 10, textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => setSnapshotShowAllMap(prev => ({ ...prev, [schema._id]: !prev[schema._id] }))}
                                        style={{ border: 'none', background: '#f8fafc', color: '#64748b', fontSize: 10, fontWeight: 800, cursor: 'pointer', padding: '6px 12px', borderRadius: 18, textTransform: 'uppercase', letterSpacing: '0.6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
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
