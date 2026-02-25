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
export default function DynamicTableModal({ open, onClose, config, accountNumber, documentId }) {
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

    const searchInputRef = useRef(null)
    const searchTimerRef = useRef(null)

    const schemaId = config?.schemaId

    // Load schema + existing lines
    useEffect(() => {
        if (!open || !schemaId || !accountNumber) return

        setLoading(true)
        setSearchQuery('')
        setSearchResults([])
        setSelected(new Set())

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
                : Promise.resolve({ data: [] })
        ]).then(([schemaRes, linesRes]) => {
            if (schemaRes?.data || schemaRes?._id) {
                setSchema(schemaRes.data || schemaRes)
            }
            if (linesRes?.data) {
                // Filter lines that belong to this schema (if schemaId is stored on line)
                // Lines may not have schemaId stored — they are all for the same document
                setLines(linesRes.data)
            }
            setLoading(false)

            // Focus search input
            setTimeout(() => searchInputRef.current?.focus(), 100)
        })
    }, [open, schemaId, accountNumber, documentId])

    // Visible columns
    const visibleCols = useMemo(() => {
        if (!schema?.columns) return []
        return schema.columns
            .filter(c => c.visible !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
    }, [schema])

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
                            if (sourceFieldPath.startsWith('cf.')) {
                                const fieldId = sourceFieldPath.substring(3)
                                if (item.customFields[fieldId] !== undefined) {
                                    values[lineKey] = item.customFields[fieldId]
                                }
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
    }, [selected, searchResults, visibleCols, schema, lines.length])

    // Add manual line (with just a label)
    const addManualLine = useCallback(() => {
        if (!manualInput.trim()) return

        const values = {}
        const firstTextCol = visibleCols.find(c => c.type === 'text')
        if (firstTextCol) {
            values[firstTextCol.key] = manualInput.trim()
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

        setLines(prev => [...prev, {
            lineType: schema?.defaultLineType || 'product',
            values,
            order: prev.length
        }])

        setManualInput('')
        setShowManualSuggestions(false)
    }, [visibleCols, schema])

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
            }
            onClose()
        } catch (err) {
            console.error('[DynamicTable] Save error:', err)
            alert('Erreur lors de la sauvegarde.')
        } finally {
            setSaving(false)
        }
    }, [documentId, accountNumber, lines, schemaId, onClose])

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
                                        borderRadius: '10px',
                                        overflow: 'hidden'
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
                                                            const displayVal = col.type === 'relation'
                                                                ? (line.values?.[col.key + '_label'] || val)
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
