/**
 * DynamicTableModal — Manage dynamic table lines from the document editor
 * 
 * Mission 5: Same system as record edit page for adding lines via modal,
 * but integrated directly in the document editor.
 * 
 * Architecture:
 * - useDynamicTableOverlay hook: detects clicks on .dynamic-table placeholders
 * - DynamicTableOverlay: floating "manage" button on the placeholder
 * - DynamicTableModal: full modal for searching catalog, adding/removing lines
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import TableDropdown from './TableDropdown'

// =========================================================================
// useDynamicTableOverlay hook — detect clicks on dynamic-table placeholders
// =========================================================================
export function useDynamicTableOverlay(contentRef) {
    const [activeConfig, setActiveConfig] = useState(null)   // { schemaId, schemaName, style, ... }
    const [overlayPos, setOverlayPos] = useState({ top: 0, left: 0, width: 0 })
    const [activePlaceholder, setActivePlaceholder] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        const timerId = setTimeout(() => {
            const el = contentRef?.current
            if (!el) return

            function handleClick(e) {
                const placeholder = e.target.closest('.dynamic-table')
                if (placeholder && el.contains(placeholder)) {
                    // Parse config from data-table attribute
                    try {
                        const raw = placeholder.dataset.table || placeholder.getAttribute('data-table') || '{}'
                        const decoded = raw
                            .replace(/&quot;/g, '"')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&#39;/g, "'")
                        const config = JSON.parse(decoded)

                        setActiveConfig(config)
                        setActivePlaceholder(placeholder)

                        // Position overlay
                        const pageWrapper = el.parentElement
                        const placeholderRect = placeholder.getBoundingClientRect()
                        const wrapperRect = pageWrapper.getBoundingClientRect()

                        let zoom = 1
                        const scaledAncestor = el.closest('[style*="scale"]')
                        if (scaledAncestor) {
                            const match = scaledAncestor.style.transform?.match(/scale\(([\d.]+)\)/)
                            if (match) zoom = parseFloat(match[1])
                        }

                        setOverlayPos({
                            top: (placeholderRect.top - wrapperRect.top) / zoom,
                            left: (placeholderRect.left - wrapperRect.left) / zoom,
                            width: placeholderRect.width / zoom,
                            height: placeholderRect.height / zoom
                        })
                    } catch (err) {
                        console.warn('[DynamicTable] Could not parse data-table:', err)
                    }
                } else if (!e.target.closest('.dt-modal-overlay') && !e.target.closest('.dt-overlay-root')) {
                    setActiveConfig(null)
                    setActivePlaceholder(null)
                }
            }

            el.addEventListener('click', handleClick)
            el._dtOverlayCleanup = () => el.removeEventListener('click', handleClick)
        }, 50)

        return () => {
            clearTimeout(timerId)
            const el = contentRef?.current
            if (el?._dtOverlayCleanup) {
                el._dtOverlayCleanup()
                delete el._dtOverlayCleanup
            }
        }
    }, [])

    const openModal = useCallback(() => setModalOpen(true), [])
    const closeModal = useCallback(() => setModalOpen(false), [])

    return {
        activeConfig,
        overlayPos,
        activePlaceholder,
        modalOpen,
        openModal,
        closeModal,
        clearOverlay: useCallback(() => {
            setActiveConfig(null)
            setActivePlaceholder(null)
        }, [])
    }
}


// =========================================================================
// DynamicTableOverlay — floating buttons on the dynamic table placeholder
// =========================================================================
export function DynamicTableOverlay({ activeConfig, overlayPos, openModal }) {
    if (!activeConfig) return null

    return (
        <div
            className="dt-overlay-root"
            style={{
                position: 'absolute',
                top: `${overlayPos.top}px`,
                left: `${overlayPos.left}px`,
                width: `${overlayPos.width}px`,
                height: `${overlayPos.height}px`,
                zIndex: 90,
                pointerEvents: 'none'
            }}
        >
            {/* Action bar at the bottom of the placeholder */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-42px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                    padding: '4px 8px',
                    pointerEvents: 'auto',
                    animation: 'dt-fade-in 0.15s ease-out',
                    whiteSpace: 'nowrap'
                }}
                onMouseDown={e => e.preventDefault()}
            >
                <button
                    onClick={openModal}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        border: 'none',
                        background: '#4f46e5',
                        color: '#fff',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'background 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseOut={e => e.currentTarget.style.background = '#4f46e5'}
                >
                    <iconify-icon icon="tabler:plus" width="14"></iconify-icon>
                    Gérer les lignes
                </button>

                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    📊 {activeConfig.schemaName || 'Tableau'}
                </span>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes dt-fade-in {
                        from { opacity: 0; transform: translateX(-50%) translateY(4px); }
                        to { opacity: 1; transform: translateX(-50%) translateY(0); }
                    }
                `
            }} />
        </div>
    )
}


// =========================================================================
// DynamicTableModal — full modal for managing lines
// =========================================================================
export default function DynamicTableModal({ open, onClose, config, accountNumber, documentId, sourceRecordId, activePlaceholder }) {
    const [schema, setSchema] = useState(null)
    const [lines, setLines] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Search
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [selected, setSelected] = useState(new Set())

    // Manual add
    const [manualInput, setManualInput] = useState('')
    const [manualSuggestions, setManualSuggestions] = useState([])
    const [showManualSuggestions, setShowManualSuggestions] = useState(false)

    // Presets
    const [presets, setPresets] = useState([])
    const [presetsOpen, setPresetsOpen] = useState(false)
    const [applyingPreset, setApplyingPreset] = useState(null)

    // Snapshots
    const [latestSnapshot, setLatestSnapshot] = useState(null)
    const [snapshotsOpen, setSnapshotsOpen] = useState(false)
    const [snapshots, setSnapshots] = useState([])
    const [loadingSnapshot, setLoadingSnapshot] = useState(false)

    const searchInputRef = useRef(null)
    const searchTimerRef = useRef(null)

    const schemaId = config?.schemaId

    // Load schema + existing lines + presets + snapshots
    useEffect(() => {
        if (!open || !schemaId || !accountNumber) return

        setLoading(true)
        setSearchQuery('')
        setSearchResults([])
        setSelected(new Set())
        setPresetsOpen(false)
        setSnapshotsOpen(false)

        Promise.all([
            // Load schema
            fetch(`/account/${accountNumber}/api/line-schemas/${schemaId}`, { credentials: 'include' })
                .then(r => r.json())
                .catch(() => null),
            // Load existing lines
            documentId
                ? fetch(`/account/${accountNumber}/api/document-lines/${documentId}`, { credentials: 'include' })
                    .then(r => r.json())
                    .catch(() => ({ data: [] }))
                : Promise.resolve({ data: [] }),
            // Load presets (grid templates)
            fetch(`/account/${accountNumber}/api/grid-templates?schemaId=${schemaId}${sourceRecordId ? '&includeRecord=' + sourceRecordId : ''}`, { credentials: 'include' })
                .then(r => r.json())
                .catch(() => ({ templates: [] })),
            // Load latest snapshot (if sourceRecordId is available)
            sourceRecordId
                ? fetch(`/account/${accountNumber}/api/grid-snapshots/${schemaId}/${sourceRecordId}`, { credentials: 'include' })
                    .then(r => r.json())
                    .catch(() => ({ data: [] }))
                : Promise.resolve({ data: [] })
        ]).then(([schemaRes, linesRes, presetsRes, snapshotsRes]) => {
            if (schemaRes?.data || schemaRes?._id) {
                setSchema(schemaRes.data || schemaRes)
            }
            if (linesRes?.data) {
                setLines(linesRes.data)
            }
            // Presets
            setPresets(presetsRes?.templates || [])
            // Snapshots
            const snapList = snapshotsRes?.data || []
            setSnapshots(snapList)
            setLatestSnapshot(snapList.length > 0 ? snapList[0] : null)

            setLoading(false)

            // Focus search input
            setTimeout(() => searchInputRef.current?.focus(), 100)
        })
    }, [open, schemaId, accountNumber, documentId, sourceRecordId])

    // Visible columns
    const visibleCols = useMemo(() => {
        if (!schema?.columns) return []
        return schema.columns
            .filter(c => c.visible !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
    }, [schema])

    // Normalize catalog customFields shape (array or object) to { [fieldId]: value }
    const normalizeCustomFieldsMap = useCallback((customFields) => {
        if (!customFields) return {}
        if (Array.isArray(customFields)) {
            return customFields.reduce((acc, cf) => {
                const id = cf?.field_id || cf?.fieldId || cf?.id
                if (id) acc[id] = cf?.value
                return acc
            }, {})
        }
        if (typeof customFields === 'object') return customFields
        return {}
    }, [])

    // Resolve lineDefaults for this schema from a catalog item
    const resolveItemLineDefaults = useCallback((item) => {
        if (!item?.lineDefaults || !schemaId) return null
        const raw = item.lineDefaults

        if (Array.isArray(raw)) {
            const match = raw.find(ld =>
                ld?.schemaId && ld.schemaId.toString() === schemaId.toString()
            )
            if (match) return match
            return raw.length === 1 ? raw[0] : null
        }

        if (typeof raw === 'object' && raw.defaults) {
            if (!raw.schemaId || raw.schemaId.toString() === schemaId.toString()) return raw
        }

        return null
    }, [schemaId])

    // Convert default values to match the expected column type
    const normalizeDefaultForColumn = useCallback((col, rawValue) => {
        if (rawValue === null || rawValue === undefined || rawValue === '') return undefined
        if (!col) return rawValue

        if (col.type === 'select') {
            return Array.isArray(rawValue) ? (rawValue[0] ?? '') : rawValue
        }

        if (col.type === 'multiselect') {
            if (Array.isArray(rawValue)) return rawValue.filter(Boolean)
            if (typeof rawValue === 'string') return rawValue ? [rawValue] : []
            return [rawValue]
        }

        if ((col.type === 'text' || col.type === 'textarea') && Array.isArray(rawValue)) {
            return rawValue.join(', ')
        }

        return rawValue
    }, [])

    // Search catalog
    const searchCatalog = useCallback((query) => {
        setSearchQuery(query)
        clearTimeout(searchTimerRef.current)

        if (!query.trim()) {
            setSearchResults([])
            return
        }

        searchTimerRef.current = setTimeout(async () => {
            if (!schema?.sourceEntityId) return
            setSearchLoading(true)
            try {
                const params = new URLSearchParams({
                    entityId: schema.sourceEntityId,
                    q: query
                })
                const res = await fetch(
                    `/account/${accountNumber}/api/catalog-search?${params}`,
                    { credentials: 'include' }
                )
                const data = await res.json()
                setSearchResults(data.data || [])
            } catch (err) {
                console.error('[DynamicTable] Search error:', err)
            } finally {
                setSearchLoading(false)
            }
        }, 300)
    }, [accountNumber, schema])

    // Toggle catalog item selection
    const toggleSelection = useCallback((item) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(item._id)) next.delete(item._id)
            else next.add(item._id)
            return next
        })
    }, [])

    // Add selected items as new lines
    const addSelectedLines = useCallback(() => {
        if (selected.size === 0) return

        const newLines = []
        for (const itemId of selected) {
            const item = searchResults.find(r => r._id === itemId)
            if (!item) continue

            // Build values using the first text column as default
            const values = {}
            const customFieldsMap = normalizeCustomFieldsMap(item.customFields)
            const firstTextCol = visibleCols.find(c => ['text', 'relation'].includes(c.type))
            if (firstTextCol) {
                if (firstTextCol.type === 'relation') {
                    values[firstTextCol.key] = item._id
                    values[firstTextCol.key + '_label'] = item.label || item.title
                } else {
                    values[firstTextCol.key] = item.label || item.title
                }
            }

            // Map custom field values from the catalog item
            if (item.customFields && schema?.columns) {
                for (const col of schema.columns) {
                    if (col.config?.applyDefaults) {
                        for (const [lineKey, sourceFieldPath] of Object.entries(col.config.applyDefaults)) {
                            if (typeof sourceFieldPath === 'string' && sourceFieldPath.startsWith('cf.')) {
                                const fieldId = sourceFieldPath.substring(3)
                                if (customFieldsMap[fieldId] !== undefined) {
                                    values[lineKey] = customFieldsMap[fieldId]
                                }
                            } else if (typeof sourceFieldPath === 'string' && item[sourceFieldPath] !== undefined) {
                                values[lineKey] = item[sourceFieldPath]
                            }
                        }
                    }
                    // Also try direct relation column mapping
                    if (col.type === 'relation' && col.config?.targetEntity) {
                        const targetEntityId = typeof col.config.targetEntity === 'object'
                            ? col.config.targetEntity._id || col.config.targetEntity
                            : col.config.targetEntity
                        if (targetEntityId?.toString() === schema.sourceEntityId?.toString()) {
                            values[col.key] = item._id
                            values[col.key + '_label'] = item.label || item.title
                        }
                    }
                }
            }

            // Apply schema-specific lineDefaults from selected catalog item
            const lineDefaultsForSchema = resolveItemLineDefaults(item)
            if (lineDefaultsForSchema?.defaults && schema?.columns) {
                for (const [key, rawVal] of Object.entries(lineDefaultsForSchema.defaults)) {
                    const targetCol = schema.columns.find(c => c.key === key)
                    const normalized = normalizeDefaultForColumn(targetCol, rawVal)
                    if (normalized !== undefined) values[key] = normalized
                }
            }

            newLines.push({
                lineType: schema?.defaultLineType || 'product',
                values,
                order: lines.length + newLines.length
            })
        }

        setLines(prev => [...prev, ...newLines])
        setSelected(new Set())
        setSearchQuery('')
        setSearchResults([])
    }, [selected, searchResults, visibleCols, schema, lines.length, normalizeCustomFieldsMap, resolveItemLineDefaults, normalizeDefaultForColumn])

    // Add manual line (with just a label)
    const addManualLine = useCallback(() => {
        if (!manualInput.trim()) return

        const values = {}
        const firstTextCol = visibleCols.find(c => ['text', 'relation'].includes(c.type))
        if (firstTextCol) {
            if (firstTextCol.type === 'relation') {
                values[firstTextCol.key] = manualInput.trim()
                values[firstTextCol.key + '_label'] = manualInput.trim()
            } else {
                values[firstTextCol.key] = manualInput.trim()
            }
        }

        setLines(prev => [...prev, {
            lineType: schema?.defaultLineType || 'product',
            values,
            order: prev.length
        }])

        setManualInput('')
        setShowManualSuggestions(false)
    }, [manualInput, visibleCols, schema])

    // Manual autocomplete
    const searchManualAutocomplete = useCallback((query) => {
        setManualInput(query)
        if (!query.trim() || !schema?.sourceEntityId) {
            setManualSuggestions([])
            setShowManualSuggestions(false)
            return
        }

        clearTimeout(searchTimerRef.current)
        searchTimerRef.current = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    entityId: schema.sourceEntityId,
                    q: query
                })
                const res = await fetch(
                    `/account/${accountNumber}/api/catalog-search?${params}`,
                    { credentials: 'include' }
                )
                const data = await res.json()
                setManualSuggestions(data.data || [])
                setShowManualSuggestions(true)
            } catch {
                setManualSuggestions([])
            }
        }, 300)
    }, [accountNumber, schema])

    // Select manual suggestion
    const selectManualSuggestion = useCallback((sug) => {
        const values = {}
        const firstTextCol = visibleCols.find(c => ['text', 'relation'].includes(c.type))
        if (firstTextCol) {
            if (firstTextCol.type === 'relation') {
                values[firstTextCol.key] = sug._id
                values[firstTextCol.key + '_label'] = sug.label || sug.title
            } else {
                values[firstTextCol.key] = sug.label || sug.title
            }
        }

        // Apply schema-specific lineDefaults when selecting a catalog suggestion manually
        const lineDefaultsForSchema = resolveItemLineDefaults(sug)
        if (lineDefaultsForSchema?.defaults && schema?.columns) {
            for (const [key, rawVal] of Object.entries(lineDefaultsForSchema.defaults)) {
                const targetCol = schema.columns.find(c => c.key === key)
                const normalized = normalizeDefaultForColumn(targetCol, rawVal)
                if (normalized !== undefined) values[key] = normalized
            }
        }

        setLines(prev => [...prev, {
            lineType: schema?.defaultLineType || 'product',
            values,
            order: prev.length
        }])

        setManualInput('')
        setShowManualSuggestions(false)
    }, [visibleCols, schema, resolveItemLineDefaults, normalizeDefaultForColumn])

    // Edit a cell value
    const updateLineValue = useCallback((lineIndex, colKey, value) => {
        setLines(prev => {
            const next = [...prev]
            next[lineIndex] = {
                ...next[lineIndex],
                values: { ...next[lineIndex].values, [colKey]: value }
            }
            return next
        })
    }, [])

    // Apply a preset (grid template)
    const applyPreset = useCallback(async (preset) => {
        if (!documentId || !accountNumber) return
        setApplyingPreset(preset._id)
        try {
            const res = await fetch(
                `/account/${accountNumber}/api/grid-templates/${preset._id}/apply/${documentId}`,
                { method: 'POST', credentials: 'include' }
            )
            const data = await res.json()
            if (data.success && data.lines) {
                // Reload lines after applying
                const linesRes = await fetch(
                    `/account/${accountNumber}/api/document-lines/${documentId}`,
                    { credentials: 'include' }
                ).then(r => r.json())
                if (linesRes?.data) setLines(linesRes.data)
            }
        } catch (err) {
            console.error('[DynamicTable] Apply preset error:', err)
        } finally {
            setApplyingPreset(null)
            setPresetsOpen(false)
        }
    }, [documentId, accountNumber])

    // Load snapshot lines into the table
    const applySnapshot = useCallback((snapshot) => {
        if (!snapshot?.lines?.length) return
        const newLines = snapshot.lines.map((l, i) => ({
            lineType: l.lineType || schema?.defaultLineType || 'treatment',
            values: { ...(l.values || {}) },
            order: i
        }))
        setLines(newLines)
        setSnapshotsOpen(false)
    }, [schema])

    // Format multiselect display values using schema column options
    const formatMultiselect = useCallback((values, col) => {
        if (!Array.isArray(values) || values.length === 0) return '—'
        return values.map(v => {
            const opt = (col.config?.options || []).find(o => o.value === v)
            return opt ? opt.label : v
        }).join(', ')
    }, [])

    // Delete a line
    const deleteLine = useCallback((lineIndex) => {
        setLines(prev => prev.filter((_, i) => i !== lineIndex))
    }, [])

    // Save all lines
    const handleSave = useCallback(async () => {
        if (!documentId || !accountNumber) {
            alert('Veuillez d\'abord sauvegarder le document.')
            return
        }
        setSaving(true)
        try {
            const res = await fetch(
                `/account/${accountNumber}/api/document-lines/${documentId}/bulk`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        lines: lines.map((l, i) => ({ ...l, order: i })),
                        schemaId
                    })
                }
            )
            const data = await res.json()
            if (data.data) {
                setLines(data.data)
                
                // Render new table HTML visually into the editor
                if (activePlaceholder) {
                    try {
                        const renderRes = await fetch(`/account/${accountNumber}/api/smartdoc/render-table`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                schemaId,
                                style: config?.style || 'professional',
                                config: config,
                                lines: data.data
                            })
                        })
                        const renderData = await renderRes.json()
                        if (renderData.success && renderData.html) {
                            activePlaceholder.innerHTML = renderData.html
                            // Trigger an input event so the Document Editor detects the change and autosaves the visual preview!
                            activePlaceholder.dispatchEvent(new Event('input', { bubbles: true }))
                        }
                    } catch(renderErr) {
                        console.error('[DynamicTable] Visual preview render error:', renderErr)
                    }
                }
            }
            onClose()
        } catch (err) {
            console.error('[DynamicTable] Save error:', err)
            alert('Erreur lors de la sauvegarde.')
        } finally {
            setSaving(false)
        }
    }, [documentId, accountNumber, lines, schemaId, onClose, activePlaceholder, config])

    if (!open) return null

    const noSource = schema && !schema.sourceEntityId

    return (
        <div
            className="dt-modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'dt-modal-fade 0.2s ease-out'
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            onKeyDown={e => { if (e.key === 'Escape') onClose() }}
        >
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                    width: '720px',
                    maxWidth: '95vw',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'dt-modal-scale 0.2s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <iconify-icon icon="solar:document-add-bold-duotone" width="20" style={{ color: '#4f46e5' }}></iconify-icon>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>
                                Gérer les lignes
                            </h3>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {config?.schemaName || 'Tableau dynamique'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: 'none', background: '#f3f4f6', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#6b7280', transition: 'all 0.1s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#e5e7eb' }}
                        onMouseOut={e => { e.currentTarget.style.background = '#f3f4f6' }}
                    >
                        <iconify-icon icon="tabler:x" width="16"></iconify-icon>
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <iconify-icon icon="svg-spinners:ring-resize" width="28" style={{ color: '#4f46e5' }}></iconify-icon>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>Chargement du schéma...</p>
                    </div>
                ) : (
                    <>
                        {/* ═══ Quick Actions: Presets + Snapshot ═══ */}
                        {(presets.length > 0 || latestSnapshot) && (
                            <div style={{
                                padding: '8px 20px',
                                borderBottom: '1px solid #f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexWrap: 'wrap'
                            }}>
                                {/* Presets dropdown */}
                                {presets.length > 0 && (
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => { setPresetsOpen(!presetsOpen); setSnapshotsOpen(false) }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                padding: '5px 10px', border: '1px solid #e5e7eb',
                                                borderRadius: '8px', background: presetsOpen ? '#eef2ff' : '#fff',
                                                cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                                                color: '#4f46e5', transition: 'all 0.15s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = '#eef2ff'}
                                            onMouseOut={e => e.currentTarget.style.background = presetsOpen ? '#eef2ff' : '#fff'}
                                        >
                                            <iconify-icon icon="solar:bookmark-bold-duotone" width="13"></iconify-icon>
                                            Presets
                                            <span style={{
                                                background: '#4f46e5', color: '#fff', borderRadius: '6px',
                                                padding: '0 5px', fontSize: '10px', fontWeight: 700,
                                                minWidth: '16px', textAlign: 'center', lineHeight: '16px'
                                            }}>{presets.length}</span>
                                        </button>

                                        {presetsOpen && (
                                            <div style={{
                                                position: 'absolute', top: '100%', left: 0, marginTop: '4px',
                                                background: '#fff', border: '1px solid #e5e7eb',
                                                borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                minWidth: '220px', maxHeight: '240px', overflow: 'auto', zIndex: 30
                                            }}>
                                                <div style={{
                                                    padding: '6px 12px', fontSize: '10px', fontWeight: 700,
                                                    color: '#6b7280', textTransform: 'uppercase',
                                                    letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6'
                                                }}>Appliquer un preset</div>
                                                {presets.map(preset => (
                                                    <div
                                                        key={preset._id}
                                                        onClick={() => applyPreset(preset)}
                                                        style={{
                                                            padding: '8px 12px', display: 'flex',
                                                            alignItems: 'center', gap: '8px',
                                                            cursor: 'pointer', fontSize: '12px',
                                                            borderBottom: '1px solid #f9fafb',
                                                            transition: 'background 0.1s',
                                                            opacity: applyingPreset === preset._id ? 0.5 : 1
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        {applyingPreset === preset._id ? (
                                                            <iconify-icon icon="svg-spinners:ring-resize" width="14" style={{ color: '#4f46e5' }}></iconify-icon>
                                                        ) : (
                                                            <iconify-icon icon="solar:bookmark-linear" width="14" style={{ color: '#9ca3af' }}></iconify-icon>
                                                        )}
                                                        <div>
                                                            <div style={{ fontWeight: 500, color: '#374151' }}>{preset.name}</div>
                                                            {preset.recordLabel && (
                                                                <div style={{ fontSize: '10px', color: '#9ca3af' }}>{preset.recordLabel}</div>
                                                            )}
                                                        </div>
                                                        <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#9ca3af' }}>
                                                            {preset.lines?.length || '?'} lignes
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Snapshot dropdown */}
                                {latestSnapshot && (
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => { setSnapshotsOpen(!snapshotsOpen); setPresetsOpen(false) }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                padding: '5px 10px', border: '1px solid #e5e7eb',
                                                borderRadius: '8px', background: snapshotsOpen ? '#f0fdf4' : '#fff',
                                                cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                                                color: '#059669', transition: 'all 0.15s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                                            onMouseOut={e => e.currentTarget.style.background = snapshotsOpen ? '#f0fdf4' : '#fff'}
                                        >
                                            <iconify-icon icon="solar:history-bold-duotone" width="13"></iconify-icon>
                                            Dernier enregistrement
                                        </button>

                                        {snapshotsOpen && (
                                            <div style={{
                                                position: 'absolute', top: '100%', left: 0, marginTop: '4px',
                                                background: '#fff', border: '1px solid #e5e7eb',
                                                borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                minWidth: '260px', maxHeight: '300px', overflow: 'auto', zIndex: 30
                                            }}>
                                                <div style={{
                                                    padding: '6px 12px', fontSize: '10px', fontWeight: 700,
                                                    color: '#6b7280', textTransform: 'uppercase',
                                                    letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6'
                                                }}>Charger depuis un enregistrement</div>
                                                {snapshots.map(snap => (
                                                    <div
                                                        key={snap._id}
                                                        onClick={() => applySnapshot(snap)}
                                                        style={{
                                                            padding: '8px 12px', display: 'flex',
                                                            alignItems: 'center', gap: '8px',
                                                            cursor: 'pointer', fontSize: '12px',
                                                            borderBottom: '1px solid #f9fafb',
                                                            transition: 'background 0.1s'
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        <iconify-icon icon="solar:calendar-linear" width="14" style={{ color: '#059669' }}></iconify-icon>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 500, color: '#374151' }}>
                                                                {new Date(snap.date || snap.createdAt).toLocaleDateString('fr-FR', {
                                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                                })}
                                                            </div>
                                                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                                                                {snap.lines?.length || 0} lignes
                                                            </div>
                                                        </div>
                                                        <iconify-icon icon="tabler:arrow-right" width="14" style={{ color: '#d1d5db' }}></iconify-icon>
                                                    </div>
                                                ))}
                                                {snapshots.length === 0 && (
                                                    <div style={{ padding: '16px 12px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
                                                        Aucun enregistrement
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Search bar */}
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ position: 'relative' }}>
                                <iconify-icon
                                    icon="tabler:search" width="15"
                                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                                ></iconify-icon>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => searchCatalog(e.target.value)}
                                    placeholder={noSource ? "Pas de source de données configurée" : "Rechercher un article, traitement..."}
                                    disabled={noSource}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px 10px 36px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        outline: 'none',
                                        background: noSource ? '#f9fafb' : '#fff',
                                        color: '#1f2937',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.15s'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#a5b4fc' }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
                                />
                            </div>

                            {/* Manual add row */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                marginTop: '8px', position: 'relative'
                            }}>
                                <iconify-icon icon="tabler:pencil-plus" width="13" style={{ color: '#9ca3af', flexShrink: 0 }}></iconify-icon>
                                <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>Ou ajouter manuellement :</span>
                                <input
                                    type="text"
                                    value={manualInput}
                                    onChange={e => searchManualAutocomplete(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addManualLine() } }}
                                    placeholder="Nom de l'élément..."
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        outline: 'none',
                                        color: '#1f2937',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#a5b4fc' }}
                                    onBlur={e => { setTimeout(() => setShowManualSuggestions(false), 200); e.target.style.borderColor = '#e5e7eb' }}
                                />
                                <button
                                    onClick={addManualLine}
                                    disabled={!manualInput.trim()}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '7px',
                                        border: 'none', background: manualInput.trim() ? '#4f46e5' : '#e5e7eb',
                                        color: manualInput.trim() ? '#fff' : '#9ca3af',
                                        cursor: manualInput.trim() ? 'pointer' : 'default',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, transition: 'all 0.15s'
                                    }}
                                >
                                    <iconify-icon icon="tabler:plus" width="14"></iconify-icon>
                                </button>

                                {/* Manual autocomplete dropdown */}
                                {showManualSuggestions && manualSuggestions.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '90px',
                                        right: '42px',
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        maxHeight: '160px',
                                        overflow: 'auto',
                                        zIndex: 20
                                    }}>
                                        {manualSuggestions.map(sug => (
                                            <div
                                                key={sug._id}
                                                onClick={() => selectManualSuggestion(sug)}
                                                style={{
                                                    padding: '8px 12px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    transition: 'background 0.1s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                                                onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                            >
                                                <iconify-icon icon="tabler:file-text" width="14" style={{ color: '#9ca3af' }}></iconify-icon>
                                                <span style={{ color: '#374151' }}>{sug.label || sug.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Body: Search results OR existing lines */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                            {/* Search results */}
                            {searchQuery.trim() && (
                                <div style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    {searchLoading ? (
                                        <div style={{ padding: '30px', textAlign: 'center' }}>
                                            <iconify-icon icon="svg-spinners:ring-resize" width="20" style={{ color: '#4f46e5' }}></iconify-icon>
                                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>Recherche...</p>
                                        </div>
                                    ) : searchResults.length === 0 ? (
                                        <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                                            <iconify-icon icon="solar:magnifer-broken" width="24"></iconify-icon>
                                            <p style={{ fontSize: '12px', marginTop: '8px' }}>
                                                Aucun résultat pour "{searchQuery}"
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{
                                                padding: '8px 20px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                color: '#6b7280',
                                                background: '#f9fafb',
                                                borderBottom: '1px solid #f3f4f6'
                                            }}>
                                                Résultats du catalogue ({searchResults.length})
                                            </div>
                                            {searchResults.map(item => (
                                                <div
                                                    key={item._id}
                                                    onClick={() => toggleSelection(item)}
                                                    style={{
                                                        padding: '10px 20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #f9fafb',
                                                        background: selected.has(item._id) ? '#eef2ff' : '#fff',
                                                        transition: 'background 0.1s'
                                                    }}
                                                    onMouseOver={e => {
                                                        if (!selected.has(item._id))
                                                            e.currentTarget.style.background = '#f9fafb'
                                                    }}
                                                    onMouseOut={e => {
                                                        e.currentTarget.style.background = selected.has(item._id) ? '#eef2ff' : '#fff'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '18px', height: '18px', borderRadius: '5px',
                                                        border: selected.has(item._id) ? '2px solid #4f46e5' : '2px solid #d1d5db',
                                                        background: selected.has(item._id) ? '#4f46e5' : '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0, transition: 'all 0.15s'
                                                    }}>
                                                        {selected.has(item._id) && (
                                                            <iconify-icon icon="tabler:check" width="12" style={{ color: '#fff' }}></iconify-icon>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: 500 }}>
                                                        {item.label || item.title}
                                                    </span>
                                                </div>
                                            ))}

                                            {/* Add selected button */}
                                            {selected.size > 0 && (
                                                <div style={{ padding: '10px 20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                                                    <button
                                                        onClick={addSelectedLines}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            border: 'none',
                                                            background: '#4f46e5',
                                                            color: '#fff',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            transition: 'background 0.15s'
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = '#4338ca'}
                                                        onMouseOut={e => e.currentTarget.style.background = '#4f46e5'}
                                                    >
                                                        <iconify-icon icon="tabler:plus" width="14"></iconify-icon>
                                                        Ajouter {selected.size} élément(s)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Existing lines table */}
                            <div style={{ padding: '12px 20px 20px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px'
                                }}>
                                    <span style={{
                                        fontSize: '12px', fontWeight: 700, color: '#374151',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        <iconify-icon icon="solar:list-bold-duotone" width="16" style={{ color: '#4f46e5' }}></iconify-icon>
                                        Lignes ({lines.length})
                                    </span>
                                </div>

                                {lines.length === 0 ? (
                                    <div style={{
                                        padding: '30px 20px',
                                        textAlign: 'center',
                                        background: '#f9fafb',
                                        borderRadius: '10px',
                                        border: '1px dashed #d1d5db'
                                    }}>
                                        <iconify-icon icon="solar:bill-list-bold-duotone" width="32" style={{ color: '#d1d5db' }}></iconify-icon>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px', marginBottom: '0' }}>
                                            Aucune ligne. Recherchez dans le catalogue ou ajoutez manuellement.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '10px'
                                    }}>
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            fontSize: '12px'
                                        }}>
                                            <thead>
                                                <tr style={{ background: '#f9fafb' }}>
                                                    <th style={{
                                                        padding: '8px 10px',
                                                        textAlign: 'center',
                                                        fontWeight: 600,
                                                        color: '#6b7280',
                                                        width: '36px',
                                                        borderBottom: '1px solid #e5e7eb'
                                                    }}>#</th>
                                                    {visibleCols.map(col => (
                                                        <th
                                                            key={col.key}
                                                            style={{
                                                                padding: '8px 10px',
                                                                textAlign: ['number', 'money', 'formula'].includes(col.type) ? 'right' : 'left',
                                                                fontWeight: 600,
                                                                color: '#6b7280',
                                                                borderBottom: '1px solid #e5e7eb',
                                                                fontSize: '11px',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em'
                                                            }}
                                                        >
                                                            {col.label}
                                                        </th>
                                                    ))}
                                                    <th style={{
                                                        padding: '8px 10px',
                                                        width: '36px',
                                                        borderBottom: '1px solid #e5e7eb'
                                                    }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lines.map((line, idx) => (
                                                    <tr
                                                        key={line._id || `new-${idx}`}
                                                        style={{
                                                            borderBottom: idx < lines.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                            transition: 'background 0.1s'
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                                                        onMouseOut={e => e.currentTarget.style.background = ''}
                                                    >
                                                        <td style={{
                                                            padding: '6px 10px',
                                                            textAlign: 'center',
                                                            color: '#9ca3af',
                                                            fontSize: '11px'
                                                        }}>
                                                            {idx + 1}
                                                        </td>
                                                        {visibleCols.map(col => {
                                                            const val = line.values?.[col.key] ?? line.computed?.[col.key] ?? ''
                                                            const isComputed = col.type === 'formula'
                                                            const isMultiselect = col.type === 'multiselect'
                                                            const displayVal = col.type === 'relation'
                                                                ? (line.values?.[col.key + '_label'] || val)
                                                                : isMultiselect
                                                                    ? formatMultiselect(val, col)
                                                                    : val

                                                            return (
                                                                <td key={col.key} style={{
                                                                    padding: '4px 10px',
                                                                    textAlign: ['number', 'money', 'formula'].includes(col.type) ? 'right' : 'left'
                                                                }}>
                                                                    {isComputed ? (
                                                                        <span style={{
                                                                            fontSize: '12px',
                                                                            color: '#6b7280',
                                                                            fontStyle: 'italic'
                                                                        }}>
                                                                            {typeof displayVal === 'number' ? displayVal.toLocaleString('fr-FR') : displayVal}
                                                                        </span>
                                                                    ) : col.type === 'relation' ? (
                                                                        <span style={{ fontSize: '12px', color: '#1f2937' }}>
                                                                            {displayVal || '—'}
                                                                        </span>
                                                                    ) : ['select', 'multiselect'].includes(col.type) ? (
                                                                        <TableDropdown
                                                                            options={col.config?.options || []}
                                                                            value={val}
                                                                            multiple={col.type === 'multiselect'}
                                                                            creatable={true}
                                                                            onChange={(newVals) => updateLineValue(idx, col.key, newVals)}
                                                                            placeholder="Sélectionner..."
                                                                        />
                                                                    ) : (
                                                                        <input
                                                                            type={['number', 'money'].includes(col.type) ? 'number' : 'text'}
                                                                            value={displayVal || ''}
                                                                            onChange={e => updateLineValue(idx, col.key, e.target.value)}
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '4px 6px',
                                                                                border: '1px solid transparent',
                                                                                borderRadius: '5px',
                                                                                fontSize: '12px',
                                                                                color: '#1f2937',
                                                                                outline: 'none',
                                                                                background: 'transparent',
                                                                                boxSizing: 'border-box',
                                                                                textAlign: ['number', 'money'].includes(col.type) ? 'right' : 'left',
                                                                                transition: 'border-color 0.15s'
                                                                            }}
                                                                            onFocus={e => { e.target.style.borderColor = '#a5b4fc'; e.target.style.background = '#fff' }}
                                                                            onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent' }}
                                                                        />
                                                                    )}
                                                                </td>
                                                            )
                                                        })}
                                                        <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => deleteLine(idx)}
                                                                style={{
                                                                    width: '24px', height: '24px',
                                                                    borderRadius: '6px',
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                    color: '#d1d5db',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.1s'
                                                                }}
                                                                onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
                                                                onMouseOut={e => { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.background = 'transparent' }}
                                                            >
                                                                <iconify-icon icon="tabler:trash" width="14"></iconify-icon>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '12px 20px',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f9fafb',
                            borderRadius: '0 0 16px 16px'
                        }}>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {lines.length} ligne(s)
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #d1d5db',
                                        background: '#fff',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#374151',
                                        fontWeight: 500,
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                                    onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: '8px 20px',
                                        border: 'none',
                                        background: saving ? '#a5b4fc' : '#4f46e5',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        cursor: saving ? 'default' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseOver={e => { if (!saving) e.currentTarget.style.background = '#4338ca' }}
                                    onMouseOut={e => { if (!saving) e.currentTarget.style.background = '#4f46e5' }}
                                >
                                    {saving ? (
                                        <>
                                            <iconify-icon icon="svg-spinners:ring-resize" width="14"></iconify-icon>
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        <>
                                            <iconify-icon icon="tabler:check" width="14"></iconify-icon>
                                            Sauvegarder
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes dt-modal-fade {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes dt-modal-scale {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `
            }} />
        </div>
    )
}
