/**
 * CellRenderer — Renders a single cell based on column type
 * Supports: text, number, textarea, select, multiselect, duration, date, computed
 */
import React, { useState, useRef, useEffect } from 'react'

// ── Shared styles ──────────────────────────
const inputStyle = {
    width: '100%',
    border: '1px solid transparent',
    borderRadius: '4px',
    padding: '1px 4px',
    fontSize: '13px',
    height: '24px',
    lineHeight: '22px',
    background: 'transparent',
    color: 'inherit',
    outline: 'none',
    boxShadow: 'none',
    transition: 'border-color 0.15s, background 0.15s'
}

const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: '18px',
    whiteSpace: 'nowrap'
}

const placeholderStyle = {
    fontSize: '11px',
    color: '#c0c4cc',
    padding: '1px 4px',
    cursor: 'pointer',
    userSelect: 'none'
}

const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 50,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxHeight: '180px',
    overflowY: 'auto',
    marginTop: '2px'
}

const dropdownItemStyle = {
    padding: '6px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background 0.1s'
}

const TAG_COLORS = [
    { bg: '#dbeafe', text: '#1e40af' },
    { bg: '#dcfce7', text: '#166534' },
    { bg: '#fef3c7', text: '#92400e' },
    { bg: '#fce7f3', text: '#9d174d' },
    { bg: '#e0e7ff', text: '#3730a3' },
    { bg: '#fae8ff', text: '#86198f' },
    { bg: '#ecfdf5', text: '#065f46' }
]

function getTagColor(value) {
    let hash = 0
    const str = String(value)
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % TAG_COLORS.length
    }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

const DURATION_UNITS = { day: 'jour(s)', week: 'sem.', month: 'mois', year: 'an(s)' }

// ── Component ──────────────────────────────
export default function CellRenderer({ col, value, line, onChange }) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [filterText, setFilterText] = useState('')
    const wrapRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        if (!dropdownOpen) return
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setDropdownOpen(false)
                setFilterText('')
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [dropdownOpen])

    // Get options for select/multiselect
    const getOptions = () => {
        const schemaOpts = col.config?.options || []
        const catalogOpts = line?._availableOptions?.[col.key] || []
        const lineOpts = line?._catalogOptions?.[col.key] || []
        // Merge, deduplicate by value
        const all = [...schemaOpts]
        const seen = new Set(schemaOpts.map(o => o.value))
        for (const o of [...catalogOpts, ...lineOpts]) {
            if (!seen.has(o.value)) {
                all.push(o)
                seen.add(o.value)
            }
        }
        return all
    }

    // DEBUG: Inject JSON in the cell if it's the specific columns
    const debugOverlay = (
        <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '9px', background: 'red', color: 'white', zIndex: 100, pointerEvents: 'none' }}>
            {JSON.stringify(value)}
            {col.key === 'moment' && line.values && line.values[col.key] === undefined ? ' [MISSING]' : ''}
        </div>
    )

    // ── Text ──
    if (col.type === 'text' || col.type === 'textarea') {
        return (
            <input
                type="text"
                style={inputStyle}
                value={value || ''}
                onChange={(e) => onChange(col.key, e.target.value)}
                placeholder={col.label}
                onFocus={(e) => {
                    e.target.style.borderColor = '#4361ee'
                    e.target.style.background = '#fff'
                    e.target.style.boxShadow = '0 0 0 2px rgba(67,97,238,0.1)'
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'transparent'
                    e.target.style.background = 'transparent'
                    e.target.style.boxShadow = 'none'
                }}
                onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.background = '#fafbfc'
                    }
                }}
                onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                        e.target.style.borderColor = 'transparent'
                        e.target.style.background = 'transparent'
                    }
                }}
            />
        )
    }

    // ── Number ──
    if (col.type === 'number') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <input
                    type="number"
                    style={{ ...inputStyle, MozAppearance: 'textfield' }}
                    value={value ?? ''}
                    onChange={(e) => onChange(col.key, e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder={col.label}
                    step={col.config?.step || 'any'}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#4361ee'
                        e.target.style.background = '#fff'
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'transparent'
                        e.target.style.background = 'transparent'
                    }}
                />
                {col.config?.unit && (
                    <span style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{col.config.unit}</span>
                )}
            </div>
        )
    }

    // ── Duration ──
    if (col.type === 'duration') {
        const durVal = typeof value === 'object' ? value : { value: value || '', unit: 'day' }
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <input
                    type="number"
                    style={{ ...inputStyle, width: '50px', textAlign: 'center' }}
                    value={durVal.value || ''}
                    onChange={(e) => onChange(col.key, { ...durVal, value: e.target.value ? parseInt(e.target.value) : '' })}
                    min="0"
                    onFocus={(e) => { e.target.style.borderColor = '#4361ee' }}
                    onBlur={(e) => { e.target.style.borderColor = 'transparent' }}
                />
                <select
                    style={{ ...inputStyle, width: 'auto', padding: '0 16px 0 4px', cursor: 'pointer', fontSize: '11px' }}
                    value={durVal.unit || 'day'}
                    onChange={(e) => onChange(col.key, { ...durVal, unit: e.target.value })}
                >
                    {Object.entries(DURATION_UNITS).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                    ))}
                </select>
            </div>
        )
    }

    // ── Date ──
    if (col.type === 'date') {
        return (
            <input
                type="date"
                style={{ ...inputStyle, fontSize: '11px' }}
                value={value || ''}
                onChange={(e) => onChange(col.key, e.target.value)}
            />
        )
    }

    // ── Computed ──
    if (col.type === 'computed') {
        return (
            <span style={{ fontWeight: 600, color: '#4361ee', fontSize: '12px', textAlign: 'right', padding: '1px 4px' }}>
                {value ?? '—'}
            </span>
        )
    }

    // ── Select ──
    if (col.type === 'select') {
        const options = getOptions()
        const selectedOpt = options.find(o => o.value === value)
        const color = selectedOpt ? getTagColor(selectedOpt.value) : null

        return (
            <div ref={wrapRef} style={{ position: 'relative' }}>
                <div
                    style={{ ...placeholderStyle, cursor: 'pointer' }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {selectedOpt ? (
                        <span style={{ ...tagStyle, background: color?.bg, color: color?.text }}>
                            {selectedOpt.label || selectedOpt.value}
                        </span>
                    ) : (
                        <span style={{ color: '#c0c4cc', fontSize: '11px' }}>Sélectionner...</span>
                    )}
                </div>
                {dropdownOpen && (
                    <div style={dropdownStyle}>
                        {value && (
                            <div
                                style={{ ...dropdownItemStyle, color: '#ef4444', borderBottom: '1px solid #f3f4f6' }}
                                onClick={() => { onChange(col.key, ''); setDropdownOpen(false) }}
                                onMouseEnter={(e) => { e.target.style.background = '#fef2f2' }}
                                onMouseLeave={(e) => { e.target.style.background = 'transparent' }}
                            >
                                ✕ Effacer
                            </div>
                        )}
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                style={{
                                    ...dropdownItemStyle,
                                    fontWeight: opt.value === value ? 600 : 400,
                                    background: opt.value === value ? 'rgba(67,97,238,0.05)' : 'transparent'
                                }}
                                onClick={() => { onChange(col.key, opt.value); setDropdownOpen(false) }}
                                onMouseEnter={(e) => { e.target.style.background = '#f9fafb' }}
                                onMouseLeave={(e) => { e.target.style.background = opt.value === value ? 'rgba(67,97,238,0.05)' : 'transparent' }}
                            >
                                {opt.label || opt.value}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // ── Multiselect ──
    if (col.type === 'multiselect') {
        const options = getOptions()
        const selected = Array.isArray(value) ? value : (value ? [value] : [])

        return (
            <div ref={wrapRef} style={{ position: 'relative' }}>
                {debugOverlay}
                <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', minHeight: '22px', alignItems: 'center', cursor: 'pointer', padding: '1px 2px' }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {selected.length > 0 ? selected.map(v => {
                        const c = getTagColor(v)
                        const opt = options.find(o => o.value === v)
                        return (
                            <span key={v} style={{ ...tagStyle, background: c.bg, color: c.text }}>
                                {opt?.label || v}
                                <span
                                    style={{ cursor: 'pointer', marginLeft: '2px', fontSize: '10px', opacity: 0.7 }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onChange(col.key, selected.filter(x => x !== v))
                                    }}
                                >×</span>
                            </span>
                        )
                    }) : (
                        <span style={{ color: '#c0c4cc', fontSize: '11px' }}>Sélectionner...</span>
                    )}
                </div>
                {dropdownOpen && (
                    <div style={dropdownStyle}>
                        {/* Filter input */}
                        <div style={{ padding: '4px 8px', borderBottom: '1px solid #f3f4f6' }}>
                            <input
                                type="text"
                                style={{ ...inputStyle, fontSize: '11px' }}
                                placeholder="Rechercher..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {options
                            .filter(o => !filterText || (o.label || o.value).toLowerCase().includes(filterText.toLowerCase()))
                            .map(opt => {
                                const isSelected = selected.includes(opt.value)
                                return (
                                    <div
                                        key={opt.value}
                                        style={{
                                            ...dropdownItemStyle,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: isSelected ? 'rgba(67,97,238,0.05)' : 'transparent'
                                        }}
                                        onClick={() => {
                                            if (isSelected) {
                                                onChange(col.key, selected.filter(x => x !== opt.value))
                                            } else {
                                                onChange(col.key, [...selected, opt.value])
                                            }
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'rgba(67,97,238,0.05)' : 'transparent' }}
                                    >
                                        <span style={{
                                            width: '14px', height: '14px', borderRadius: '3px',
                                            border: isSelected ? 'none' : '1.5px solid #d1d5db',
                                            background: isSelected ? '#4361ee' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: '10px', flexShrink: 0
                                        }}>
                                            {isSelected && '✓'}
                                        </span>
                                        <span>{opt.label || opt.value}</span>
                                    </div>
                                )
                            })}
                    </div>
                )}
            </div>
        )
    }

    // ── Fallback ──
    return (
        <input
            type="text"
            style={inputStyle}
            value={value || ''}
            onChange={(e) => onChange(col.key, e.target.value)}
            placeholder={col.label}
        />
    )
}
