/**
 * MultiSelectIsland - Reusable Multi-Select Component
 * 
 * Features:
 * - Selected tags displayed as colored pills
 * - Dropdown with search and filtering
 * - Create new options on the fly
 * - Edit options: rename, change color, delete
 * - Hidden inputs for form submission
 * - Works with or without API (local-only mode)
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

// ── Color Palette ──────────────────────────────────────
const COLOR_PALETTE = [
    '#f3f4f6', '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#a7f3d0',
    '#99f6e4', '#a5f3fc', '#bae6fd', '#c7d2fe', '#ddd6fe', '#e9d5ff',
    '#fbcfe8', '#fda4af', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
    null // "no color" option
]

function getContrastColor(hex) {
    if (!hex || hex === 'transparent') return '#374151'
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155 ? '#374151' : '#ffffff'
}

function getOptionStyle(opt) {
    if (!opt.color) return { background: '#f3f4f6', color: '#374151' }
    return { background: opt.color, color: getContrastColor(opt.color) }
}

// ── Main Component ─────────────────────────────────────
export default function MultiSelectIsland({
    name,
    options: initialOptions,
    selected: initialSelected,
    placeholder,
    createUrl,
    deleteUrl,
    updateUrl,
    accountNumber,
    classificationId,
    multiple,
    creatable,
    editable,
    colors,
    onChange,
    containerEl
}) {
    const [options, setOptions] = useState(initialOptions)
    const [selectedIds, setSelectedIds] = useState(initialSelected)
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [editingOption, setEditingOption] = useState(null) // { _id, label, color }
    const [editLabel, setEditLabel] = useState('')
    const [editColor, setEditColor] = useState(null)

    const containerRef = useRef(null)
    const searchInputRef = useRef(null)
    const editInputRef = useRef(null)

    // ── Derived data ──
    const selectedOptions = useMemo(() => {
        return selectedIds.map(id => options.find(o => o._id === id)).filter(Boolean)
    }, [selectedIds, options])

    const filteredOptions = useMemo(() => {
        const unselected = options.filter(o => !selectedIds.includes(o._id))
        if (!search.trim()) return unselected
        const s = search.toLowerCase()
        return unselected.filter(o => o.label.toLowerCase().includes(s))
    }, [options, selectedIds, search])

    const exactMatch = useMemo(() => {
        if (!search.trim()) return true
        return options.some(o => o.label.toLowerCase() === search.toLowerCase())
    }, [options, search])

    // ── Click outside ──
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
                setEditingOption(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isOpen])

    // Focus edit input when editing
    useEffect(() => {
        if (editingOption && editInputRef.current) {
            editInputRef.current.focus()
            editInputRef.current.select()
        }
    }, [editingOption])

    // ── Notify changes ──
    const emitChange = useCallback((newSelectedIds) => {
        if (onChange) onChange(newSelectedIds)
        // Dispatch custom event for Alpine.js or other listeners
        if (containerEl) {
            containerEl.dispatchEvent(new CustomEvent('multiselect:change', {
                bubbles: true,
                detail: { name, selectedIds: newSelectedIds }
            }))
        }
    }, [onChange, containerEl, name])

    // ── Actions ──
    const toggleOption = useCallback((id) => {
        setSelectedIds(prev => {
            let next
            if (prev.includes(id)) {
                next = prev.filter(i => i !== id)
            } else {
                next = multiple ? [...prev, id] : [id]
                if (!multiple) setIsOpen(false)
            }
            emitChange(next)
            return next
        })
        setSearch('')
    }, [multiple, emitChange])

    const removeOption = useCallback((id) => {
        setSelectedIds(prev => {
            const next = prev.filter(i => i !== id)
            emitChange(next)
            return next
        })
    }, [emitChange])

    const createOption = useCallback(async () => {
        const label = search.trim()
        if (!label || exactMatch) return

        if (createUrl) {
            // API mode
            try {
                const res = await fetch(createUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ classificationId, label })
                })
                const data = await res.json()
                if (data.success && data.option) {
                    setOptions(prev => [...prev, data.option])
                    setSelectedIds(prev => {
                        const next = multiple ? [...prev, data.option._id] : [data.option._id]
                        emitChange(next)
                        return next
                    })
                }
            } catch (e) {
                console.error('[MultiSelect] Create error:', e)
            }
        } else {
            // Local mode — generate temp ID
            const newOpt = {
                _id: 'tmp_' + Date.now(),
                label,
                color: null
            }
            setOptions(prev => [...prev, newOpt])
            setSelectedIds(prev => {
                const next = multiple ? [...prev, newOpt._id] : [newOpt._id]
                emitChange(next)
                return next
            })
        }
        setSearch('')
    }, [search, exactMatch, createUrl, classificationId, multiple, emitChange])

    const startEdit = useCallback((opt, e) => {
        e.stopPropagation()
        setEditingOption(opt)
        setEditLabel(opt.label)
        setEditColor(opt.color || null)
    }, [])

    const saveEdit = useCallback(async () => {
        if (!editingOption) return
        const updatedOpt = { ...editingOption, label: editLabel, color: editColor }

        if (updateUrl) {
            try {
                await fetch(updateUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        classificationId,
                        optionId: editingOption._id,
                        label: editLabel,
                        color: editColor
                    })
                })
            } catch (e) {
                console.error('[MultiSelect] Update error:', e)
            }
        }

        setOptions(prev => prev.map(o => o._id === editingOption._id ? updatedOpt : o))
        setEditingOption(null)
    }, [editingOption, editLabel, editColor, updateUrl, classificationId])

    const deleteOption = useCallback(async (optId) => {
        if (deleteUrl) {
            try {
                await fetch(deleteUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ classificationId, optionId: optId })
                })
            } catch (e) {
                console.error('[MultiSelect] Delete error:', e)
            }
        }

        setOptions(prev => prev.filter(o => o._id !== optId))
        setSelectedIds(prev => {
            const next = prev.filter(i => i !== optId)
            emitChange(next)
            return next
        })
        setEditingOption(null)
    }, [deleteUrl, classificationId, emitChange])

    // ── Render ──
    return (
        <div className="ms-island" ref={containerRef}>
            {/* Hidden inputs for form submission */}
            {selectedIds.map(id => (
                <input key={id} type="hidden" name={name} value={id} />
            ))}

            {/* Selected tags + trigger */}
            <div
                className={`ms-trigger ${isOpen ? 'ms-trigger--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="ms-tags">
                    {selectedOptions.length === 0 && (
                        <span className="ms-placeholder">{placeholder}</span>
                    )}
                    {selectedOptions.map(opt => (
                        <span
                            key={opt._id}
                            className="ms-tag"
                            style={getOptionStyle(opt)}
                        >
                            <span className="ms-tag-label">{opt.label}</span>
                            <button
                                className="ms-tag-remove"
                                onClick={(e) => { e.stopPropagation(); removeOption(opt._id) }}
                                style={{ color: getContrastColor(opt.color || '#f3f4f6') }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                {selectedOptions.length > 3 && (
                    <span className="ms-more">+{selectedOptions.length - 3}</span>
                )}
                <span className="ms-arrow">
                    <svg width="10" height="6" viewBox="0 0 10 6" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                </span>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="ms-dropdown">
                    {/* Selected pills inside dropdown */}
                    {selectedOptions.length > 0 && (
                        <div className="ms-dropdown-selected">
                            {selectedOptions.map(opt => (
                                <span
                                    key={opt._id}
                                    className="ms-tag ms-tag--sm"
                                    style={getOptionStyle(opt)}
                                >
                                    <span className="ms-tag-label">{opt.label}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Search input */}
                    <div className="ms-search">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (filteredOptions.length > 0) {
                                        toggleOption(filteredOptions[0]._id)
                                    } else if (creatable && !exactMatch) {
                                        createOption()
                                    }
                                }
                            }}
                            placeholder={placeholder}
                            className="ms-search-input"
                        />
                    </div>

                    {/* Options list */}
                    <div className="ms-options">
                        {filteredOptions.map(opt => (
                            <div
                                key={opt._id}
                                className="ms-option"
                                onClick={() => toggleOption(opt._id)}
                            >
                                <span className="ms-option-pill" style={getOptionStyle(opt)}>
                                    {opt.label}
                                </span>
                                {editable && (
                                    <button
                                        className="ms-option-edit"
                                        onClick={(e) => startEdit(opt, e)}
                                        title="Paramètres"
                                    >
                                        ···
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Create new option */}
                        {creatable && search.trim() && !exactMatch && (
                            <div className="ms-create" onClick={createOption}>
                                <span className="ms-create-label">Créer</span>
                                <span className="ms-create-pill">{search.trim()}</span>
                                <svg width="12" height="12" viewBox="0 0 12 12" style={{ marginLeft: 'auto', opacity: 0.4 }}>
                                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        )}

                        {/* Empty state */}
                        {filteredOptions.length === 0 && (search.trim() ? exactMatch : true) && !creatable && (
                            <div className="ms-empty">Aucune option</div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Popover */}
            {editingOption && (
                <div className="ms-edit-popover" onClick={(e) => e.stopPropagation()}>
                    <input
                        ref={editInputRef}
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit() }}
                        className="ms-edit-input"
                    />
                    {colors && (
                        <div className="ms-color-grid">
                            {COLOR_PALETTE.map((c, i) => (
                                <button
                                    key={i}
                                    className={`ms-color-dot ${editColor === c ? 'ms-color-dot--active' : ''}`}
                                    style={{
                                        background: c || '#fff',
                                        border: !c ? '2px dashed #d1d5db' : (editColor === c ? '2px solid #4361ee' : '2px solid transparent')
                                    }}
                                    onClick={() => setEditColor(c)}
                                    title={c || 'Sans couleur'}
                                >
                                    {!c && <span style={{ fontSize: 10, color: '#9ca3af' }}>⊘</span>}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="ms-edit-actions">
                        <button className="ms-edit-save" onClick={saveEdit}>
                            Enregistrer
                        </button>
                        <button className="ms-edit-delete" onClick={() => deleteOption(editingOption._id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                            Supprimer
                        </button>
                    </div>
                </div>
            )}

            {/* Inline styles */}
            <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        </div>
    )
}

// ── Scoped Styles ──────────────────────────────────────
const STYLES = `
.ms-island {
    position: relative;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 13px;
}

/* Trigger (main clickable area) */
.ms-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 4px 8px 4px 6px;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    background: #fff;
    transition: all 0.15s;
}
.dark .ms-trigger { background: #1b2e4b; border-color: #253b5c; }
.ms-trigger:hover { border-color: #c7d2fe; }
.ms-trigger--open { border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67,97,238,0.1); }
.dark .ms-trigger--open { border-color: #4361ee; }

.ms-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
    min-height: 24px;
    align-items: center;
}
.ms-placeholder {
    color: #9ca3af;
    font-size: 12px;
    user-select: none;
}
.ms-arrow {
    color: #9ca3af;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}
.ms-more {
    font-size: 11px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 1px 6px;
    border-radius: 4px;
    flex-shrink: 0;
}
.dark .ms-more { background: #253b5c; color: #94a3b8; }

/* Tag pill */
.ms-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    user-select: none;
    transition: opacity 0.1s;
}
.ms-tag:hover { opacity: 0.85; }
.ms-tag--sm {
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 4px;
}
.ms-tag-label { pointer-events: none; }
.ms-tag-remove {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0 1px;
    opacity: 0.6;
    transition: opacity 0.1s;
}
.ms-tag-remove:hover { opacity: 1; }

/* Dropdown */
.ms-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 50;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    overflow: hidden;
    animation: ms-slide-in 0.12s ease-out;
    min-width: 220px;
}
.dark .ms-dropdown { background: #0e1726; border-color: #253b5c; box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
@keyframes ms-slide-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}

.ms-dropdown-selected {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 10px 12px 6px;
}

/* Search */
.ms-search {
    padding: 6px 12px 8px;
}
.ms-search-input {
    width: 100%;
    padding: 6px 10px;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    font-size: 12px;
    background: #f9fafb;
    outline: none;
    transition: all 0.15s;
    color: inherit;
}
.dark .ms-search-input { background: #1b2e4b; border-color: #253b5c; color: #e0e6ed; }
.ms-search-input:focus { border-color: #4361ee; background: #fff; }
.dark .ms-search-input:focus { background: #0e1726; }
.ms-search-input::placeholder { color: #9ca3af; }

/* Options */
.ms-options {
    max-height: 200px;
    overflow-y: auto;
    padding: 4px 0;
}
.ms-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 12px;
    cursor: pointer;
    transition: background 0.1s;
}
.ms-option:hover { background: rgba(67,97,238,0.04); }
.dark .ms-option:hover { background: rgba(67,97,238,0.1); }
.ms-option-pill {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}
.ms-option-edit {
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 16px;
    letter-spacing: -1px;
    padding: 2px 4px;
    border-radius: 4px;
    opacity: 0;
    transition: all 0.1s;
}
.ms-option:hover .ms-option-edit { opacity: 1; }
.ms-option-edit:hover { background: #f3f4f6; color: #4361ee; }
.dark .ms-option-edit:hover { background: #1b2e4b; }

/* Create row */
.ms-create {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.1s;
    border-top: 1px solid #f3f4f6;
}
.dark .ms-create { border-color: #1b2e4b; }
.ms-create:hover { background: rgba(67,97,238,0.04); }
.ms-create-label {
    font-size: 12px;
    color: #6b7280;
}
.ms-create-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    background: #e5e7eb;
    font-size: 12px;
    font-weight: 500;
    color: #374151;
}
.dark .ms-create-pill { background: #253b5c; color: #e0e6ed; }

.ms-empty {
    padding: 16px 12px;
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
}

/* Edit Popover */
.ms-edit-popover {
    position: absolute;
    top: calc(100% + 4px);
    right: -10px;
    z-index: 60;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    padding: 12px;
    width: 240px;
    animation: ms-slide-in 0.12s ease-out;
}
.dark .ms-edit-popover { background: #0e1726; border-color: #253b5c; }

.ms-edit-input {
    width: 100%;
    padding: 6px 10px;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 10px;
    outline: none;
    color: inherit;
    background: #fff;
}
.dark .ms-edit-input { background: #1b2e4b; border-color: #253b5c; color: #e0e6ed; }
.ms-edit-input:focus { border-color: #4361ee; }

/* Color grid */
.ms-color-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    margin-bottom: 10px;
}
.ms-color-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}
.ms-color-dot:hover { transform: scale(1.15); }
.ms-color-dot--active { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #4361ee !important; }

/* Edit actions */
.ms-edit-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid #f3f4f6;
    padding-top: 8px;
}
.dark .ms-edit-actions { border-color: #1b2e4b; }
.ms-edit-save {
    flex: 1;
    padding: 5px 10px;
    border: none;
    border-radius: 6px;
    background: #4361ee;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
}
.ms-edit-save:hover { background: #3651d4; }
.ms-edit-delete {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border: none;
    border-radius: 6px;
    background: #fef2f2;
    color: #dc2626;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
}
.dark .ms-edit-delete { background: #450a0a; color: #fca5a5; }
.ms-edit-delete:hover { background: #fee2e2; }
.dark .ms-edit-delete:hover { background: #7f1d1d; }
`
