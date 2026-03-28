/**
 * DynamicTable - Main orchestrator component
 * Reusable React island for dynamic line tables (treatments, invoicing, etc.)
 */
import React, { useCallback } from 'react'
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
        overflow: 'hidden',
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
        addLine, removeLine, reorderLines, debouncedSave
    } = useLines({ accountNumber, recordId, schemas, activeSchemaId })

    const {
        searchState, openSearch, closeSearch, search,
        resolveLineDefaults, resolveApplyDefaults
    } = useCatalog({ accountNumber })

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

    const handleSelectRelation = useCallback((schemaId, lineIdx, col, item) => {
        if (!item || !col) return

        console.group('[DynamicTable] handleSelectRelation')
        console.log('schemaId:', schemaId, 'lineIdx:', lineIdx, 'col:', col.key)
        console.log('clicked item:', item)

        const selectedItem = pickBestCatalogItem(item, schemaId)
        const hybridDefaults = resolveApplyDefaults(col, selectedItem)
        const resolved = resolveLineDefaults(selectedItem, schemaId)
        const schema = schemas.find(s => s._id === schemaId || (s._id && s._id.toString() === schemaId.toString()))
        const normalizedDefaults = normalizeDefaultsForSchema(schema, resolved?.defaults || {})

        console.log('selected item used:', selectedItem)
        console.log('hybrid defaults:', hybridDefaults)
        console.log('resolved raw defaults:', resolved?.defaults || null)
        console.log('resolved normalized defaults:', normalizedDefaults)

        setLinesMap(prev => {
            const newMap = { ...prev }
            const lines = [...(newMap[schemaId] || [])]
            if (!lines[lineIdx]) {
                console.warn('No line found at index', lineIdx)
                console.groupEnd()
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
            console.log('line values after apply:', newValues)
            console.groupEnd()
            return newMap
        })

        setTimeout(() => {
            reorderLines(schemaId, schema)
        }, 100)

        closeSearch()
    }, [schemas, setLinesMap, resolveApplyDefaults, resolveLineDefaults, reorderLines, closeSearch, pickBestCatalogItem, linesMapRef])

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
                    <p>Aucun tableau dynamique disponible pour cette entite</p>
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
                />
            )}

            {schemas.map(schema => (
                <div
                    key={schema._id}
                    style={{ display: activeSchemaId === schema._id ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}
                >
                    <Toolbar
                        schema={schema}
                        saving={saving[schema._id]}
                        lineCount={getSchemaLines(schema._id).filter(l =>
                            l.values && Object.values(l.values).some(v =>
                                v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
                            )
                        ).length}
                    />

                    <DataTable
                        schema={schema}
                        lines={getSchemaLines(schema._id)}
                        getRelationCol={() => getRelationCol(schema)}
                        getVisibleColumns={(line) => getVisibleColumns(schema, line)}
                        getRelationLabel={(line) => getRelationLabel(line, schema)}
                        searchState={searchState}
                        onOpenSearch={(lineIdx, colKey) => openSearch(lineIdx, colKey)}
                        onSearch={(lineIdx, colKey, query) => {
                            const relCol = getRelationCol(schema)
                            const targetEntity = schema.sourceEntityId || relCol?.config?.targetEntity
                            const searchFields = relCol?.config?.searchFields || ['title']
                            search(lineIdx, colKey, query, targetEntity, searchFields)
                        }}
                        onCloseSearch={closeSearch}
                        onSelectRelation={(lineIdx, col, item) => handleSelectRelation(schema._id, lineIdx, col, item)}
                        onCellChange={(lineIdx, key, value) => handleCellChange(schema._id, lineIdx, key, value)}
                        onRemoveLine={(lineIdx) => handleRemoveLine(schema._id, lineIdx)}
                        onAddLine={() => handleAddLine(schema._id)}
                    />
                </div>
            ))}
        </div>
    )
}
