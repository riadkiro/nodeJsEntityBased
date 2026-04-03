/**
 * BindingBar — Context-free document binding resolution bar
 * 
 * Shows a top banner for each unresolved entity binding in the document.
 * Clicking the pill OR clicking directly on a placeholder span opens a picker.
 * Once bound, replaces all matching placeholder spans with real data.
 * 
 * REBINDING: Clicking the "Changer" button restores the original page snapshots
 * and re-opens the picker for a new selection.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react'

export default function BindingBar({ bindings, accountNumber, documentId, pageRefs, onBindingResolved, setDoc }) {
    const [resolvedBindings, setResolvedBindings] = useState({}) // entitySlug -> { record, contextRecord }
    const [activePickerSlug, setActivePickerSlug] = useState(null)
    const [floatingPickerPos, setFloatingPickerPos] = useState(null)
    const [floatingPickerBinding, setFloatingPickerBinding] = useState(null)

    // Full page HTML snapshots taken BEFORE first binding — used for reliable rebind restore
    const pageSnapshotsRef = useRef(null) // { pageKey: innerHTML }

    if (!bindings || bindings.length === 0) return null

    const unresolvedBindings = bindings.filter(b => !resolvedBindings[b.entitySlug])

    // ── Listen for clicks on .binding-placeholder inside the document pages ──
    useEffect(() => {
        const handlePlaceholderClick = (e) => {
            const span = e.target.closest('.binding-placeholder')
            if (!span) return
            e.preventDefault()
            e.stopPropagation()

            const token = span.getAttribute('data-token')
            if (!token) return

            const matchedBinding = bindings.find(b =>
                (b.tokens || []).some(t => t === token)
            )
            if (!matchedBinding || resolvedBindings[matchedBinding.entitySlug]) return

            const rect = span.getBoundingClientRect()
            setFloatingPickerPos({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX
            })
            setFloatingPickerBinding(matchedBinding)
            setActivePickerSlug(null)
        }

        const handler = (e) => {
            if (e.target.closest('.binding-placeholder')) handlePlaceholderClick(e)
        }
        document.addEventListener('click', handler, true)
        return () => document.removeEventListener('click', handler, true)
    }, [bindings, resolvedBindings])

    // ── Handle binding resolution ──
    const handleBound = useCallback((binding, record, replacements, contextRecord) => {
        // Snapshot all page HTML BEFORE first binding (for undo on rebind)
        if (!pageSnapshotsRef.current && pageRefs?.current) {
            const snapshots = {}
            for (const [key, pageEl] of Object.entries(pageRefs.current)) {
                if (pageEl) snapshots[key] = pageEl.innerHTML
            }
            pageSnapshotsRef.current = snapshots
            console.log('[BindingBar] Captured page snapshots for undo')
        }

        // Replace placeholder spans in the DOM with actual values
        if (pageRefs?.current) {
            for (const [, pageEl] of Object.entries(pageRefs.current)) {
                if (!pageEl) continue
                const placeholders = pageEl.querySelectorAll('.binding-placeholder')
                placeholders.forEach(ph => {
                    const token = ph.getAttribute('data-token')
                    if (token && replacements[token] !== undefined) {
                        const textNode = document.createTextNode(replacements[token] || '—')
                        ph.replaceWith(textNode)
                    }
                })
            }
        }

        setResolvedBindings(prev => ({
            ...prev,
            [binding.entitySlug]: { record, contextRecord }
        }))
        setActivePickerSlug(null)
        setFloatingPickerPos(null)
        setFloatingPickerBinding(null)

        // Set draftRecordId + linkedRecords for the dynamic table and metadata
        if (contextRecord && setDoc) {
            setDoc(prev => {
                const newLinkedRecords = [...(prev.linkedRecords || [])];
                // Add the selected record if not already linked
                if (!newLinkedRecords.find(lr => lr.recordId === contextRecord._id)) {
                    newLinkedRecords.push({
                        recordId: contextRecord._id,
                        recordTitle: contextRecord.title || '',
                        entityId: binding.entityId || '',
                        entityName: binding.entityName || '',
                        entityIcon: binding.entityIcon || '',
                        entitySlug: binding.entitySlug || '',
                        alias: binding.entitySlug || ''
                    });
                }
                return {
                    ...prev,
                    draftRecordId: contextRecord._id,
                    linkedRecords: newLinkedRecords
                };
            })
            console.log(`[BindingBar] Set draftRecordId + linkedRecord: ${contextRecord.entityName}: ${contextRecord.title}`)
        }

        if (onBindingResolved) onBindingResolved(binding, record, contextRecord)
    }, [pageRefs, onBindingResolved, setDoc])

    // ── Handle REBINDING (change patient) ──
    const handleRebind = useCallback((binding) => {
        // Restore all pages from snapshot
        if (pageSnapshotsRef.current && pageRefs?.current) {
            for (const [key, pageEl] of Object.entries(pageRefs.current)) {
                if (!pageEl) continue
                const snapshot = pageSnapshotsRef.current[key]
                if (snapshot) {
                    pageEl.innerHTML = snapshot
                    // Trigger input event so the editor syncs the restored content
                    pageEl.dispatchEvent(new Event('input', { bubbles: true }))
                }
            }
            console.log('[BindingBar] Restored page snapshots')
        }
        // Reset snapshots so they get recaptured on next bind
        pageSnapshotsRef.current = null

        // Clear ALL resolved bindings (reset everything)
        setResolvedBindings({})

        // Clear draftRecordId
        if (setDoc) {
            setDoc(prev => ({
                ...prev,
                draftRecordId: null
            }))
        }

        // Open the picker for this binding immediately
        setActivePickerSlug(binding.entitySlug)
    }, [pageRefs, setDoc])

    // ── Close floating picker on Escape ──
    useEffect(() => {
        if (!floatingPickerBinding) return
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setFloatingPickerPos(null)
                setFloatingPickerBinding(null)
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [floatingPickerBinding])

    return (
        <>
            {/* Top Bar */}
            <div style={{
                background: unresolvedBindings.length > 0
                    ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                    : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderBottom: unresolvedBindings.length > 0
                    ? '1px solid #fde68a'
                    : '1px solid #bbf7d0',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0,
                flexWrap: 'wrap',
                transition: 'all 0.3s ease',
                fontFamily: "'Inter', -apple-system, sans-serif",
                position: 'relative',
                zIndex: 50
            }}>
                {/* Status icon */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: unresolvedBindings.length > 0 ? '#92400e' : '#166534',
                    fontSize: '12px', fontWeight: 600, flexShrink: 0,
                    whiteSpace: 'nowrap'
                }}>
                    <iconify-icon
                        icon={unresolvedBindings.length > 0
                            ? 'solar:link-broken-bold-duotone'
                            : 'solar:check-circle-bold-duotone'}
                        width="18"
                    ></iconify-icon>
                    {unresolvedBindings.length > 0
                        ? `${unresolvedBindings.length} donnée(s) à lier`
                        : 'Toutes les données sont liées'}
                </div>

                {/* Binding pills */}
                {bindings.map(binding => {
                    const resolvedData = resolvedBindings[binding.entitySlug]
                    const resolved = resolvedData?.record
                    const isPickerOpen = activePickerSlug === binding.entitySlug

                    return (
                        <div key={binding.entitySlug} style={{ position: 'relative' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0',
                                borderRadius: '20px',
                                border: resolved
                                    ? '1px solid #86efac'
                                    : isPickerOpen ? '2px solid #f59e0b' : '1px dashed #f59e0b',
                                background: resolved ? '#dcfce7' : isPickerOpen ? '#fef3c7' : '#fff',
                                overflow: 'hidden',
                                transition: 'all 0.15s',
                            }}>
                                <button
                                    onClick={() => {
                                        if (resolved) return
                                        setActivePickerSlug(isPickerOpen ? null : binding.entitySlug)
                                        setFloatingPickerPos(null)
                                        setFloatingPickerBinding(null)
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 14px',
                                        border: 'none', background: 'transparent',
                                        cursor: resolved ? 'default' : 'pointer',
                                        fontSize: '12px', fontWeight: 500,
                                        color: resolved ? '#166534' : '#92400e',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <iconify-icon
                                        icon={resolved ? 'solar:check-circle-bold' : (binding.entityIcon || 'solar:user-bold-duotone')}
                                        width="14"
                                        style={{ color: resolved ? '#16a34a' : (binding.entityColor || '#f59e0b') }}
                                    ></iconify-icon>
                                    {resolved
                                        ? `${binding.entityName}: ${resolved.title}`
                                        : `Choisir ${binding.entityName}`
                                    }
                                    {!resolved && (
                                        <iconify-icon icon="solar:alt-arrow-down-linear" width="12" style={{ opacity: 0.6 }}></iconify-icon>
                                    )}
                                </button>

                                {/* Change button (only when resolved) */}
                                {resolved && (
                                    <button
                                        onClick={() => handleRebind(binding)}
                                        title="Changer de patient"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            padding: '6px 10px 6px 6px',
                                            border: 'none',
                                            borderLeft: '1px solid #bbf7d0',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '11px', fontWeight: 500,
                                            color: '#16a34a',
                                            transition: 'all 0.15s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = '#fef2f2'
                                            e.currentTarget.style.color = '#dc2626'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.color = '#16a34a'
                                        }}
                                    >
                                        <iconify-icon icon="solar:refresh-circle-linear" width="13"></iconify-icon>
                                        Changer
                                    </button>
                                )}
                            </div>

                            {/* Bar dropdown picker */}
                            {isPickerOpen && (
                                <BindingPicker
                                    binding={binding}
                                    accountNumber={accountNumber}
                                    documentId={documentId}
                                    onSelect={(record, replacements, contextRecord) => handleBound(binding, record, replacements, contextRecord)}
                                    onClose={() => setActivePickerSlug(null)}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Floating inline picker (near clicked placeholder in document) */}
            {floatingPickerBinding && floatingPickerPos && (
                <div style={{
                    position: 'fixed',
                    top: floatingPickerPos.top,
                    left: Math.min(floatingPickerPos.left, window.innerWidth - 340),
                    zIndex: 10000,
                }}>
                    <BindingPicker
                        binding={floatingPickerBinding}
                        accountNumber={accountNumber}
                        documentId={documentId}
                        onSelect={(record, replacements, contextRecord) =>
                            handleBound(floatingPickerBinding, record, replacements, contextRecord)
                        }
                        onClose={() => {
                            setFloatingPickerPos(null)
                            setFloatingPickerBinding(null)
                        }}
                    />
                </div>
            )}
        </>
    )
}

// ─── Binding Picker Dropdown ──────────────────────────────────────
function BindingPicker({ binding, accountNumber, documentId, onSelect, onClose }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [selecting, setSelecting] = useState(null)
    const inputRef = useRef(null)
    const containerRef = useRef(null)
    const debounceRef = useRef(null)
    const baseUrl = `/account/${accountNumber}/documents`

    useEffect(() => {
        loadRecords('')
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [onClose])

    const loadRecords = useCallback(async (q) => {
        setLoading(true)
        try {
            const url = `${baseUrl}/api/${documentId}/search-records?entityId=${binding.entityId}&q=${encodeURIComponent(q)}&limit=8`
            const resp = await fetch(url, { credentials: 'include' })
            const data = await resp.json()
            if (data.success) setResults(data.records || [])
        } catch (e) {
            console.error('[BindingPicker] Search error:', e)
        }
        setLoading(false)
    }, [baseUrl, documentId, binding.entityId])

    const handleSearchChange = useCallback((e) => {
        const val = e.target.value
        setQuery(val)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => loadRecords(val), 200)
    }, [loadRecords])

    const handleSelect = useCallback(async (record) => {
        setSelecting(record._id)
        try {
            const resp = await fetch(`${baseUrl}/api/${documentId}/resolve-bindings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    bindingEntitySlug: binding.entitySlug,
                    recordId: record._id,
                    primaryEntitySlug: binding.primaryEntitySlug
                })
            })
            const data = await resp.json()
            if (data.success) {
                onSelect(data.record || record, data.replacements || {}, data.contextRecord || null)
            } else {
                console.error('[BindingPicker] Resolve error:', data.error)
            }
        } catch (e) {
            console.error('[BindingPicker] Resolve error:', e)
        }
        setSelecting(null)
    }, [baseUrl, documentId, binding, onSelect])

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                width: '320px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'bindingPickerIn 0.15s ease-out'
            }}
        >
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc'
                }}>
                    <iconify-icon
                        icon={loading ? "svg-spinners:ring-resize" : "solar:magnifer-linear"}
                        width="15"
                        style={{ color: '#94a3b8', flexShrink: 0 }}
                    ></iconify-icon>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleSearchChange}
                        placeholder={`Rechercher ${binding.entityName.toLowerCase()}...`}
                        style={{
                            flex: 1, border: 'none', outline: 'none', background: 'transparent',
                            fontSize: '13px', color: '#1e293b',
                            fontFamily: "'Inter', sans-serif"
                        }}
                    />
                </div>
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '4px' }}>
                {results.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>
                        Aucun résultat
                    </div>
                )}
                {results.map((record) => (
                    <button
                        key={record._id}
                        onClick={() => handleSelect(record)}
                        disabled={selecting === record._id}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px', borderRadius: '8px',
                            border: 'none', background: 'transparent',
                            cursor: selecting === record._id ? 'wait' : 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.1s',
                            fontSize: '13px',
                            opacity: selecting && selecting !== record._id ? 0.5 : 1
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: `${binding.entityColor || '#4f46e5'}12`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: binding.entityColor || '#4f46e5', flexShrink: 0
                        }}>
                            {selecting === record._id
                                ? <iconify-icon icon="svg-spinners:ring-resize" width="14"></iconify-icon>
                                : <iconify-icon icon={binding.entityIcon || 'solar:user-bold-duotone'} width="14"></iconify-icon>
                            }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontWeight: 500, color: '#1e293b',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {record.title}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <style>{`
                @keyframes bindingPickerIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
