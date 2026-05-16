/**
 * DesignerToolbar — Contextual floating toolbar for the selected designer element.
 * 
 * Appears above the selected element with controls for:
 * - Fill color (for shapes/text)
 * - Opacity
 * - Z-index (bring forward / send backward)
 * - Duplicate
 * - Lock / Unlock
 * - Delete
 */
import React, { useState, useRef, useEffect } from 'react'

export default function DesignerToolbar({
    element,
    onUpdate,
    onDelete,
    onDuplicate,
    onBringForward,
    onSendBackward
}) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const colorRef = useRef(null)

    // Close color picker on outside click
    useEffect(() => {
        if (!showColorPicker) return
        const handler = (e) => {
            if (colorRef.current && !colorRef.current.contains(e.target)) {
                setShowColorPicker(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showColorPicker])

    const presetColors = [
        '#000000', '#ffffff', '#4361ee', '#7c3aed', '#ef4444',
        '#f59e0b', '#10b981', '#06b6d4', '#64748b', '#ec4899',
        '#8b5cf6', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
    ]

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '-48px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '12px',
                padding: '4px 8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                zIndex: 500,
                whiteSpace: 'nowrap'
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* ===== COLOR ===== */}
            {(element.type === 'shape' || element.type === 'text' || element.type === 'line') && (
                <div style={{ position: 'relative' }} ref={colorRef}>
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Couleur"
                        style={{
                            ...btnStyle,
                            padding: '4px',
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            background: element.fill || '#000',
                            border: '2px solid rgba(0,0,0,0.1)',
                        }} />
                    </button>

                    {/* Color Picker Dropdown */}
                    {showColorPicker && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginBottom: '8px',
                            background: 'white',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
                            zIndex: 600,
                            width: '200px'
                        }}>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Couleur de remplissage
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '10px' }}>
                                {presetColors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => { onUpdate({ ...element, fill: c }); setShowColorPicker(false) }}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '8px',
                                            background: c,
                                            border: element.fill === c ? '2.5px solid #4361ee' : '2px solid rgba(0,0,0,0.06)',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s',
                                            boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                                    />
                                ))}
                            </div>
                            {/* Custom color input */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                    type="color"
                                    value={element.fill || '#000000'}
                                    onChange={(e) => onUpdate({ ...element, fill: e.target.value })}
                                    style={{ width: '28px', height: '28px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                                />
                                <input
                                    type="text"
                                    value={element.fill || '#000000'}
                                    onChange={(e) => onUpdate({ ...element, fill: e.target.value })}
                                    style={{
                                        flex: 1,
                                        padding: '4px 8px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontFamily: 'monospace',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Divider */}
            <div style={dividerStyle} />

            {/* ===== OPACITY ===== */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px' }}>
                <iconify-icon icon="solar:eye-bold-duotone" width="14" style={{ color: '#94a3b8' }}></iconify-icon>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((element.opacity ?? 1) * 100)}
                    onChange={(e) => onUpdate({ ...element, opacity: parseInt(e.target.value) / 100 })}
                    style={{ width: '50px', height: '3px', accentColor: '#4361ee', cursor: 'pointer' }}
                    title={`Opacité: ${Math.round((element.opacity ?? 1) * 100)}%`}
                />
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, minWidth: '24px' }}>
                    {Math.round((element.opacity ?? 1) * 100)}%
                </span>
            </div>

            {/* Divider */}
            <div style={dividerStyle} />

            {/* ===== Z-INDEX ===== */}
            <button onClick={() => onBringForward(element.id)} title="Mettre au premier plan" style={btnStyle}>
                <iconify-icon icon="solar:arrow-up-bold" width="14" style={{ color: '#64748b' }}></iconify-icon>
            </button>
            <button onClick={() => onSendBackward(element.id)} title="Mettre en arrière-plan" style={btnStyle}>
                <iconify-icon icon="solar:arrow-down-bold" width="14" style={{ color: '#64748b' }}></iconify-icon>
            </button>

            {/* Divider */}
            <div style={dividerStyle} />

            {/* ===== DUPLICATE ===== */}
            <button onClick={() => onDuplicate(element.id)} title="Dupliquer" style={btnStyle}>
                <iconify-icon icon="solar:copy-bold-duotone" width="14" style={{ color: '#64748b' }}></iconify-icon>
            </button>

            {/* ===== LOCK ===== */}
            <button
                onClick={() => onUpdate({ ...element, locked: !element.locked })}
                title={element.locked ? 'Déverrouiller' : 'Verrouiller'}
                style={btnStyle}
            >
                <iconify-icon
                    icon={element.locked ? 'solar:lock-bold-duotone' : 'solar:lock-unlocked-bold-duotone'}
                    width="14"
                    style={{ color: element.locked ? '#f59e0b' : '#64748b' }}
                ></iconify-icon>
            </button>

            {/* Divider */}
            <div style={dividerStyle} />

            {/* ===== DELETE ===== */}
            <button onClick={() => onDelete(element.id)} title="Supprimer" style={btnStyle}>
                <iconify-icon icon="solar:trash-bin-minimalistic-bold-duotone" width="14" style={{ color: '#ef4444' }}></iconify-icon>
            </button>

            {/* ===== INFO: Rotation & Position ===== */}
            <div style={dividerStyle} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
                <span style={{ fontSize: '9px', color: '#cbd5e1', fontFamily: 'monospace' }}>
                    {Math.round(element.x)},{Math.round(element.y)} · {Math.round(element.width)}×{Math.round(element.height)}
                    {element.rotation ? ` · ${element.rotation}°` : ''}
                </span>
            </div>
        </div>
    )
}

const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 6px',
    border: 'none',
    background: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.15s',
}

const dividerStyle = {
    width: '1px',
    height: '20px',
    background: 'rgba(0,0,0,0.06)',
    margin: '0 2px',
}
