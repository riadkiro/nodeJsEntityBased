/**
 * Toolbar - Mini toolbar above the table (presets, catalog, validate)
 */
import React, { useEffect, useRef, useState } from 'react'

const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    padding: '4px 12px',
    borderBottom: '1px solid #f3f4f6',
    minHeight: '28px'
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
    maxHeight: '240px',
    overflowY: 'auto',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    zIndex: 120
}

function isFilledLine(line) {
    if (!line?.values) return false
    return Object.values(line.values).some(v =>
        v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
    )
}

export default function Toolbar({
    schema,
    saving,
    lineCount,
    presets = [],
    lines = [],
    validating = false,
    catalogEnabled = false,
    onApplyPreset,
    onDeletePreset,
    onSavePreset,
    onValidate,
    onOpenCatalog
}) {
    const [presetOpen, setPresetOpen] = useState(false)
    const wrapRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (!wrapRef.current) return
            if (!wrapRef.current.contains(e.target)) setPresetOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const canSavePreset = lines.some(isFilledLine)

    return (
        <div style={toolbarStyle}>
            <div />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} ref={wrapRef}>
                {catalogEnabled && (
                    <button type="button" style={btn} onClick={onOpenCatalog}>
                        Catalogue
                    </button>
                )}

                <div style={{ position: 'relative' }}>
                    <button type="button" style={btn} onClick={() => setPresetOpen(v => !v)}>
                        Presets
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

                    {presetOpen && (
                        <div style={presetMenu}>
                            {presets.length === 0 && (
                                <div style={{ padding: '10px 12px', fontSize: 12, color: '#9ca3af' }}>
                                    Aucun preset
                                </div>
                            )}
                            {presets.map(p => (
                                <div
                                    key={p._id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 10px',
                                        borderBottom: '1px solid #f9fafb'
                                    }}
                                >
                                    <button
                                        type="button"
                                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, textAlign: 'left', flex: 1, cursor: 'pointer' }}
                                        onClick={() => {
                                            onApplyPreset?.(p)
                                            setPresetOpen(false)
                                        }}
                                    >
                                        <div style={{ fontSize: 12, color: '#111827', fontWeight: 600 }}>{p.name || 'Preset'}</div>
                                        <div style={{ fontSize: 10, color: '#9ca3af' }}>
                                            {(p.presetRows || []).length} lignes
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        title="Supprimer"
                                        onClick={() => onDeletePreset?.(p)}
                                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
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
                                    cursor: canSavePreset ? 'pointer' : 'not-allowed',
                                    opacity: canSavePreset ? 1 : 0.5
                                }}
                                disabled={!canSavePreset}
                                onClick={() => onSavePreset?.()}
                            >
                                Sauvegarder comme preset
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    style={{ ...btn, color: validating ? '#9ca3af' : '#111827' }}
                    onClick={onValidate}
                    disabled={validating}
                >
                    {validating ? 'Validation...' : 'Valider'}
                </button>

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
