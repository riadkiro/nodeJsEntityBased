/**
 * Toolbar - Mini toolbar above the table (catalog with presets, validate)
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'

const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    padding: '3px 10px',
    borderBottom: '1px solid #f3f4f6',
    minHeight: '26px'
}

const savingDot = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    animation: 'pulse-save 1s infinite'
}

const lineCountStyle = {
    fontSize: '10px',
    color: '#9ca3af',
    fontWeight: 500
}

const btn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#6b7280',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '999px',
    padding: '4px 10px',
    cursor: 'pointer'
}

const presetMenu = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    minWidth: '220px',
    maxWidth: '320px',
    maxHeight: '280px',
    overflowY: 'auto',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    zIndex: 120
}

const iconChip = {
    width: 22,
    height: 22,
    borderRadius: 7,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0
}

function isFilledLine(line) {
    if (!line?.values) return false
    return Object.values(line.values).some(v =>
        v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
    )
}

function hexToRgba(color, alpha, fallback) {
    if (typeof color !== 'string') return fallback
    const clean = color.trim()
    const short = /^#([a-fA-F0-9]{3})$/
    const full = /^#([a-fA-F0-9]{6})$/
    let r = 0
    let g = 0
    let b = 0

    if (short.test(clean)) {
        const m = clean.slice(1)
        r = parseInt(m[0] + m[0], 16)
        g = parseInt(m[1] + m[1], 16)
        b = parseInt(m[2] + m[2], 16)
    } else if (full.test(clean)) {
        const m = clean.slice(1)
        r = parseInt(m.slice(0, 2), 16)
        g = parseInt(m.slice(2, 4), 16)
        b = parseInt(m.slice(4, 6), 16)
    } else {
        return fallback
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function Toolbar({
    schema,
    saving,
    lineCount,
    presets = [],
    linkedRecords = [],
    currentRecordId = '',
    lines = [],
    savingPreset = false,
    validating = false,
    catalogEnabled = false,
    showValidateButton = true,
    showSavePresetAction = true,
    onApplyPreset,
    onDeletePreset,
    onSavePreset,
    onValidate,
    onOpenCatalog
}) {
    const [catalogDropdown, setCatalogDropdown] = useState(false)
    const [activeTab, setActiveTab] = useState('catalogue') // 'catalogue' or 'presets'
    const wrapRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (!wrapRef.current) return
            if (!wrapRef.current.contains(e.target)) setCatalogDropdown(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const canSavePreset = lines.some(isFilledLine)
    const recordPresets = presets.filter(p => !!p?.recordId)
    const globalPresets = presets.filter(p => !p?.recordId)
    const linkedByRecordId = useMemo(() => {
        const map = new Map()
        for (const rel of linkedRecords || []) {
            if (!rel?.recordId) continue
            map.set(String(rel.recordId), rel)
        }
        return map
    }, [linkedRecords])

    const renderPresetItem = (p) => {
        const rawRecordId = p?.recordId?._id || p?.recordId
        const presetRecordId = rawRecordId ? String(rawRecordId) : ''
        const isRecordPreset = !!presetRecordId
        const linkedMeta = presetRecordId ? linkedByRecordId.get(presetRecordId) : null
        const isCurrentRecord = isRecordPreset && String(currentRecordId || '') === presetRecordId
        const presetColor = isCurrentRecord
            ? '#22c55e'
            : (linkedMeta?.relationColor || (isRecordPreset ? '#d97706' : '#4361ee'))
        const presetIcon = isCurrentRecord
            ? 'solar:document-bold-duotone'
            : (linkedMeta?.relationIcon || (isRecordPreset ? 'solar:user-id-bold-duotone' : 'solar:global-bold-duotone'))

        const chipStyle = isRecordPreset
            ? {
                ...iconChip,
                background: hexToRgba(presetColor, 0.14, 'rgba(245,158,11,0.14)'),
                color: presetColor,
                border: `1px solid ${hexToRgba(presetColor, 0.25, 'rgba(245,158,11,0.25)')}`
            }
            : {
                ...iconChip,
                background: 'rgba(67,97,238,0.13)',
                color: '#4361ee',
                border: '1px solid rgba(67,97,238,0.24)'
            }

        return (
        <div
            key={p._id}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderBottom: '1px solid #f9fafb',
                background: isRecordPreset ? 'linear-gradient(90deg, rgba(245,158,11,0.05), rgba(255,255,255,0))' : '#fff'
            }}
        >
            <div style={chipStyle}>
                <iconify-icon
                    icon={presetIcon}
                    width="13"
                />
            </div>
            <button
                type="button"
                style={{ background: 'none', border: 'none', padding: 0, margin: 0, textAlign: 'left', flex: 1, cursor: 'pointer', minWidth: 0 }}
                onClick={() => {
                    onApplyPreset?.(p)
                    setCatalogDropdown(false)
                }}
            >
                <div style={{ fontSize: 12, color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name || 'Preset'}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', display: 'flex', gap: 6 }}>
                    <span>{(p.presetRows || []).length} lignes</span>
                    {p.recordLabel && (
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            - {p.recordLabel}
                        </span>
                    )}
                </div>
            </button>
            <button
                type="button"
                title="Supprimer"
                onClick={() => onDeletePreset?.(p)}
                style={{
                    width: 22,
                    height: 22,
                    border: '1px solid #fee2e2',
                    background: '#fff',
                    color: '#ef4444',
                    borderRadius: 7,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                }}
            >
                <iconify-icon icon="solar:trash-bin-trash-bold-duotone" width="12" />
            </button>
        </div>
    )
    }

    return (
        <div style={toolbarStyle}>
            <div />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} ref={wrapRef}>
                {/* Combined Catalogue button (includes presets) */}
                <div style={{ position: 'relative' }}>
                    <button type="button" style={btn} onClick={() => setCatalogDropdown(v => !v)}>
                        Catalogue
                        {presets.length > 0 && (
                            <span style={{
                                display: 'inline-flex',
                                minWidth: 16,
                                height: 16,
                                borderRadius: 999,
                                background: 'rgba(67,97,238,0.12)',
                                color: '#4361ee',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '0 4px'
                            }}>
                                {presets.length}
                            </span>
                        )}
                    </button>

                    {catalogDropdown && (
                        <div style={presetMenu}>
                            {/* Tab switcher inside dropdown */}
                            <div style={{
                                display: 'flex',
                                borderBottom: '1px solid #f3f4f6',
                                background: '#fafbfc'
                            }}>
                                {catalogEnabled && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('catalogue')}
                                        style={{
                                            flex: 1,
                                            border: 'none',
                                            background: 'transparent',
                                            padding: '8px 10px',
                                            fontSize: 11,
                                            fontWeight: activeTab === 'catalogue' ? 700 : 500,
                                            color: activeTab === 'catalogue' ? '#4361ee' : '#9ca3af',
                                            borderBottom: activeTab === 'catalogue' ? '2px solid #4361ee' : '2px solid transparent',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 4,
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <iconify-icon icon="solar:notebook-bookmark-bold-duotone" width="12" />
                                        Catalogue
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('presets')}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '8px 10px',
                                        fontSize: 11,
                                        fontWeight: activeTab === 'presets' ? 700 : 500,
                                        color: activeTab === 'presets' ? '#4361ee' : '#9ca3af',
                                        borderBottom: activeTab === 'presets' ? '2px solid #4361ee' : '2px solid transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 4,
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <iconify-icon icon="solar:clipboard-check-bold-duotone" width="12" />
                                    Presets
                                    {presets.length > 0 && (
                                        <span style={{
                                            fontSize: 9,
                                            fontWeight: 700,
                                            background: 'rgba(67,97,238,0.12)',
                                            color: '#4361ee',
                                            borderRadius: 999,
                                            padding: '0 4px',
                                            minWidth: 14,
                                            height: 14,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {presets.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Catalogue tab content */}
                            {activeTab === 'catalogue' && catalogEnabled && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCatalogDropdown(false)
                                            onOpenCatalog?.()
                                        }}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            border: 'none',
                                            background: '#fff',
                                            padding: '12px 12px',
                                            fontSize: 12,
                                            color: '#4361ee',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                    >
                                        <iconify-icon icon="solar:magnifer-bold-duotone" width="14" />
                                        Rechercher dans le catalogue
                                    </button>
                                </div>
                            )}

                            {/* Presets tab content */}
                            {activeTab === 'presets' && (
                                <>
                                    {presets.length === 0 && (
                                        <div style={{ padding: '10px 12px', fontSize: 12, color: '#9ca3af' }}>
                                            Aucun preset
                                        </div>
                                    )}
                                    {recordPresets.length > 0 && (
                                        <div style={{ padding: '8px 10px 6px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <iconify-icon icon="solar:users-group-rounded-bold-duotone" width="12" />
                                            Records / Relations
                                        </div>
                                    )}
                                    {recordPresets.map(renderPresetItem)}

                                    {globalPresets.length > 0 && (
                                        <div style={{ padding: '8px 10px 6px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <iconify-icon icon="solar:global-bold-duotone" width="12" />
                                            Global
                                        </div>
                                    )}
                                    {globalPresets.map(renderPresetItem)}

                                    {showSavePresetAction && typeof onSavePreset === 'function' && (
                                        <button
                                            type="button"
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                border: 'none',
                                                borderTop: '1px solid #f3f4f6',
                                                background: '#fff',
                                                padding: '9px 10px',
                                                fontSize: 12,
                                                color: '#4361ee',
                                                fontWeight: 600,
                                                cursor: (canSavePreset && !savingPreset) ? 'pointer' : 'not-allowed',
                                                opacity: (canSavePreset && !savingPreset) ? 1 : 0.5
                                            }}
                                            disabled={!canSavePreset || savingPreset}
                                            onClick={() => {
                                                setCatalogDropdown(false)
                                                onSavePreset?.()
                                            }}
                                        >
                                            <iconify-icon icon={savingPreset ? 'svg-spinners:ring-resize' : 'solar:diskette-bold'} width="12" style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                            {savingPreset ? 'Sauvegarde...' : 'Sauvegarder comme preset'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {showValidateButton && (
                    <button
                        type="button"
                        style={{ ...btn, color: validating ? '#9ca3af' : '#111827' }}
                        onClick={onValidate}
                        disabled={validating}
                    >
                        {validating ? 'Validation...' : 'Valider'}
                    </button>
                )}

                {lineCount > 0 && (
                    <span style={lineCountStyle}>
                        {lineCount} ligne{lineCount > 1 ? 's' : ''}
                    </span>
                )}

                {saving && (
                    <>
                        <div style={{ ...savingDot, background: '#4361ee' }} />
                        <span style={{ fontSize: 10, color: '#4361ee', fontWeight: 500 }}>Enregistrement...</span>
                        <style>{`@keyframes pulse-save { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
                    </>
                )}
            </div>
        </div>
    )
}
