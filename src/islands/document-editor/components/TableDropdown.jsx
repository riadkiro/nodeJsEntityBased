import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'

/**
 * Reusable Table Dropdown for Select / Multiselect in Dynamic Tables
 * Features:
 * - Searchable options
 * - Creatable new options
 * - Single or Multiple selection
 * - Pixel-perfect UI for data-dense tables
 */
export default function TableDropdown({
    options = [],
    value,          // single string or array of strings (for multiselect)
    multiple = false,
    creatable = true,
    onChange,       // (newValue) => void   (string or array of strings)
    placeholder = 'Sélectionner...'
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [openUpwards, setOpenUpwards] = useState(false)
    const [menuStyle, setMenuStyle] = useState({})
    
    // Convert current value(s) to array of strings for uniform handling
    const selectedValues = useMemo(() => {
        if (!value) return []
        if (Array.isArray(value)) return value
        return String(value).split(',').map(s => s.trim()).filter(Boolean)
    }, [value])

    // Convert schema options config + dynamically added options into `{ value, label, color }`
    const [dynamicOptions, setDynamicOptions] = useState([])
    const allOptions = useMemo(() => {
        const base = options.map(o => typeof o === 'string' ? { value: o, label: o } : { value: o.value || o.id, label: o.label || o.value, color: o.color })
        // Add dynamic ones that aren't in base
        const baseVals = new Set(base.map(o => o.value))
        const combined = [...base]
        
        dynamicOptions.forEach(d => {
            if (!baseVals.has(d.value)) combined.push(d)
        })

        // Ensure currently selected values that disappeared are still shown safely as tags
        selectedValues.forEach(v => {
            if (!combined.some(o => o.value === v)) {
                combined.push({ value: v, label: v })
            }
        })
        return combined
    }, [options, dynamicOptions, selectedValues])

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return allOptions
        const s = search.toLowerCase()
        return allOptions.filter(o => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s))
    }, [allOptions, search])

    const exactMatch = useMemo(() => {
        const s = search.trim().toLowerCase()
        if (!s) return true
        return allOptions.some(o => o.label.toLowerCase() === s || o.value.toLowerCase() === s)
    }, [allOptions, search])

    const containerRef = useRef(null)
    const searchRef = useRef(null)
    const dropdownRef = useRef(null)

    // Click outside
    useEffect(() => {
        function handleClickOutside(e) {
            const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(e.target)
            const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(e.target)
            if (clickedOutsideContainer && clickedOutsideDropdown) {
                setIsOpen(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (isOpen && searchRef.current) {
            setTimeout(() => searchRef.current.focus(), 50)
        }
        
        const updatePosition = () => {
            if (isOpen && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                const spaceBelow = window.innerHeight - rect.bottom
                // Only pop upward if no space below and plenty of space above
                const popUp = spaceBelow < 250 && rect.top > 250
                setOpenUpwards(popUp)
                
                setMenuStyle({
                    position: 'fixed',
                    top: popUp ? 'auto' : (rect.bottom + 4) + 'px',
                    bottom: popUp ? (window.innerHeight - rect.top + 4) + 'px' : 'auto',
                    left: (rect.left - 8) + 'px',
                    minWidth: Math.max(200, rect.width + 16) + 'px',
                    width: 'max-content'
                })
            }
        }

        updatePosition()

        if (isOpen) {
            window.addEventListener('resize', updatePosition)
            let raf
            const watchPosition = () => {
                updatePosition()
                raf = requestAnimationFrame(watchPosition)
            }
            raf = requestAnimationFrame(watchPosition)
            return () => {
                window.removeEventListener('resize', updatePosition)
                cancelAnimationFrame(raf)
            }
        }
    }, [isOpen])

    const notifyChange = useCallback((newVals) => {
        if (multiple) {
            onChange(newVals)
        } else {
            onChange(newVals.length > 0 ? newVals[0] : '')
            setIsOpen(false) // auto close on single select
        }
    }, [multiple, onChange])

    const toggleOption = useCallback((optVal) => {
        let next
        if (selectedValues.includes(optVal)) {
            next = selectedValues.filter(v => v !== optVal)
        } else {
            next = multiple ? [...selectedValues, optVal] : [optVal]
        }
        notifyChange(next)
        setSearch('')
    }, [selectedValues, multiple, notifyChange])

    const createOption = useCallback(() => {
        const val = search.trim()
        if (!val || exactMatch) return
        
        setDynamicOptions(prev => [...prev, { value: val, label: val }])
        
        const next = multiple ? [...selectedValues, val] : [val]
        notifyChange(next)
        setSearch('')
    }, [search, exactMatch, multiple, selectedValues, notifyChange])

    const removeValue = useCallback((val, e) => {
        e.stopPropagation()
        const next = selectedValues.filter(v => v !== val)
        notifyChange(next)
    }, [selectedValues, notifyChange])

    // Resolve labels for display
    const selectedDisplay = selectedValues.map(v => {
        const found = allOptions.find(o => o.value === v)
        return found ? found : { value: v, label: v }
    })

    const getContrastColor = (hex) => {
        if (!hex || hex === 'transparent') return '#374151'
        let cleanHex = hex.replace('#', '')
        if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('')
        if (cleanHex.length !== 6) return '#374151'
        const r = parseInt(cleanHex.slice(0, 2), 16)
        const g = parseInt(cleanHex.slice(2, 4), 16)
        const b = parseInt(cleanHex.slice(4, 6), 16)
        return ((r * 299 + g * 587 + b * 114) / 1000) > 155 ? '#374151' : '#ffffff'
    }

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 50 : 1 }}>
            {/* Trigger Area */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    minHeight: '28px',
                    padding: '2px 6px',
                    border: '1px solid transparent',
                    borderRadius: '6px',
                    cursor: 'text',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '4px',
                    position: 'relative',
                    transition: 'all 0.15s',
                    background: isOpen ? '#fff' : 'transparent',
                    boxShadow: isOpen ? '0 0 0 2px #eef2ff' : 'none',
                    borderColor: isOpen ? '#c7d2fe' : 'transparent',
                }}
                onMouseOver={e => { if (!isOpen) e.currentTarget.style.background = '#f9fafb' }}
                onMouseOut={e => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
            >
                {selectedDisplay.length === 0 && (
                    <span style={{ color: '#9ca3af', fontSize: '12px', paddingLeft: '4px' }}>—</span>
                )}
                {selectedDisplay.map(tag => (
                    <span 
                        key={tag.value}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: tag.color || '#f3f4f6',
                            color: getContrastColor(tag.color),
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 500,
                            userSelect: 'none'
                        }}
                    >
                        {tag.label}
                        <span 
                            onClick={(e) => removeValue(tag.value, e)}
                            style={{ 
                                cursor: 'pointer', 
                                opacity: 0.6, 
                                fontSize: '13px', 
                                lineHeight: 1,
                                padding: '0 2px',
                                transition: 'opacity 0.1s'
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = 1}
                            onMouseOut={e => e.currentTarget.style.opacity = 0.6}
                        >
                            ×
                        </span>
                    </span>
                ))}
            </div>

            {/* Dropdown Menu - rendered in a portal to escape all parent boundaries */}
            {isOpen && createPortal(
                <div ref={dropdownRef} style={{
                    ...menuStyle,
                    maxWidth: '300px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: openUpwards ? '0 -10px 25px rgba(0,0,0,0.15)' : '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid #e5e7eb',
                    zIndex: 9999999, // Absolute dominance
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '6px' }}>
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (filteredOptions.length > 0) toggleOption(filteredOptions[0].value)
                                    else if (creatable && !exactMatch) createOption()
                                }
                            }}
                            placeholder="Rechercher ou créer..."
                            style={{
                                width: '100%',
                                padding: '6px 10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '12px',
                                outline: 'none',
                                background: '#f9fafb',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#fff' }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb' }}
                        />
                    </div>

                    <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 4px 4px' }}>
                        {filteredOptions.map(opt => {
                            const isSelected = selectedValues.includes(opt.value)
                            return (
                                <div 
                                    key={opt.value}
                                    onClick={() => toggleOption(opt.value)}
                                    style={{
                                        padding: '6px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        background: isSelected ? '#eef2ff' : 'transparent',
                                        color: isSelected ? '#4f46e5' : '#374151',
                                        fontWeight: isSelected ? 600 : 400,
                                        transition: 'background 0.1s'
                                    }}
                                    onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = '#f3f4f6' }}
                                    onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {opt.color && (
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: opt.color }}></div>
                                        )}
                                        {opt.label}
                                    </div>
                                    {isSelected && <iconify-icon icon="tabler:check" width="14"></iconify-icon>}
                                </div>
                            )
                        })}

                        {creatable && search.trim() && !exactMatch && (
                            <div 
                                onClick={createOption}
                                style={{
                                    padding: '6px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#4f46e5',
                                    fontWeight: 500,
                                    borderTop: filteredOptions.length > 0 ? '1px solid #f3f4f6' : 'none',
                                    marginTop: filteredOptions.length > 0 ? '4px' : '0'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#eef2ff'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <iconify-icon icon="tabler:plus" width="14"></iconify-icon>
                                Créer "{search.trim()}"
                            </div>
                        )}

                        {filteredOptions.length === 0 && !creatable && (
                            <div style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
                                Aucune option trouvée
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
