/**
 * SchemaTabBar - Tab pills for switching between schemas
 * with inline visibility toggles.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'

const tabBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '0 8px',
    borderBottom: '1px solid #f1f3f5',
    minHeight: '34px'
}

const tabsRailStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    flex: 1,
    minWidth: 0
}

const pillBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px 9px',
    borderRadius: '0',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'transparent',
    color: '#888da8',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative'
}

const pillActive = {
    ...pillBase,
    background: 'transparent',
    color: '#0e1726',
    borderBottomColor: '#4361ee'
}

// Small colored dot instead of icon box
const dotBase = {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
    opacity: 0.4
}

const dotActive = {
    ...dotBase,
    opacity: 1,
    background: '#4361ee'
}

const countBadge = {
    fontSize: '9px',
    background: 'rgba(0, 171, 85, 0.1)',
    color: '#00ab55',
    minWidth: '14px',
    height: '14px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    padding: '0 3px'
}

const menuWrap = {
    position: 'relative',
    flex: 'none'
}

const menuButton = {
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: '#888da8',
    fontSize: 11,
    fontWeight: 500,
    padding: '4px 8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    transition: 'all 0.15s'
}

const createButton = {
    border: '1px solid rgba(67,97,238,0.2)',
    borderRadius: '7px',
    background: 'rgba(67,97,238,0.06)',
    color: '#4361ee',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 9px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap'
}

const menuPanel = {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 6px)',
    minWidth: 220,
    maxWidth: 280,
    maxHeight: 260,
    overflowY: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    background: '#fff',
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
    zIndex: 130
}

const schemaIcons = {
    form: 'solar:heart-pulse-bold-duotone',
    table: 'solar:notebook-bold-duotone',
    catalog: 'solar:document-text-bold-duotone'
}

export default function SchemaTabBar({
    schemas,
    activeSchemaId,
    onSelectSchema,
    getSchemaLines,
    visibleSchemaIds = [],
    onToggleSchemaVisibility,
    onShowAllSchemas,
    showHistory = false,
    onToggleHistory,
    hasSnapshots = false,
    onCreateSchema
}) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const onDocClick = (e) => {
            if (!menuRef.current) return
            if (!menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [])

    const visibleSet = useMemo(() => new Set((visibleSchemaIds || []).map(String)), [visibleSchemaIds])
    const visibleCount = useMemo(() => schemas.filter(s => visibleSet.has(String(s._id))).length, [schemas, visibleSet])

    return (
        <div style={tabBarStyle}>
            <div style={tabsRailStyle}>
                {schemas.map(schema => {
                    const schemaId = String(schema._id)
                    if (!visibleSet.has(schemaId)) return null

                    const isActive = String(activeSchemaId) === schemaId
                    const lineCount = (getSchemaLines(schema._id) || []).filter(l => {
                        if (!l.values) return false
                        return Object.values(l.values).some(v =>
                            v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
                        )
                    }).length
                    const mode = schema.inputMode || (schema.columns?.some(c => c.type === 'relation') ? 'catalog' : 'table')
                    const icon = schemaIcons[mode] || schemaIcons.catalog

                    return (
                        <button
                            key={schema._id}
                            type="button"
                            style={isActive ? pillActive : pillBase}
                            onClick={() => onSelectSchema(schema._id)}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.color = '#0e1726'
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.color = '#888da8'
                            }}
                        >
                            <span style={isActive ? dotActive : { ...dotBase, background: '#888da8' }}></span>
                            <span>{schema.label || schema.name}</span>
                            {lineCount > 0 && <span style={countBadge}>{lineCount}</span>}
                        </button>
                    )
                })}
            </div>

            {/* Right-side controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                {onCreateSchema && (
                    <button
                        type="button"
                        data-dt-create-schema="1"
                        style={createButton}
                        onClick={onCreateSchema}
                        title="Nouveau tableau dynamique"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(67,97,238,0.12)'
                            e.currentTarget.style.borderColor = 'rgba(67,97,238,0.34)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(67,97,238,0.06)'
                            e.currentTarget.style.borderColor = 'rgba(67,97,238,0.2)'
                        }}
                    >
                        <iconify-icon icon="solar:add-square-bold-duotone" width="13"></iconify-icon>
                        Nouveau TD
                    </button>
                )}

                {/* Historique toggle */}
                {hasSnapshots && (
                    <button
                        type="button"
                        onClick={() => onToggleHistory?.()}
                        style={{
                            border: 'none',
                            borderRadius: 6,
                            background: showHistory ? 'rgba(67,97,238,0.08)' : 'transparent',
                            color: showHistory ? '#4361ee' : '#888da8',
                            fontSize: 11,
                            fontWeight: 500,
                            padding: '4px 9px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                            if (!showHistory) {
                                e.currentTarget.style.color = '#4361ee'
                                e.currentTarget.style.background = 'rgba(67,97,238,0.04)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showHistory) {
                                e.currentTarget.style.color = '#888da8'
                                e.currentTarget.style.background = 'transparent'
                            }
                        }}
                    >
                        <iconify-icon icon="solar:clock-circle-bold-duotone" width="13"></iconify-icon>
                        Historique
                    </button>
                )}

                {/* Onglets menu */}
                {schemas.length > 1 && (
                    <div style={menuWrap} ref={menuRef}>
                        <button type="button" style={menuButton} onClick={() => setMenuOpen(v => !v)}>
                            Onglets
                            <span style={{ fontSize: 10, color: '#9ca3af' }}>{visibleCount}/{schemas.length}</span>
                        </button>

                        {menuOpen && (
                            <div style={menuPanel}>
                                <div style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Afficher/Masquer</span>
                                    <button
                                        type="button"
                                        style={{ border: 'none', background: 'none', color: '#4361ee', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                        onClick={() => onShowAllSchemas?.()}
                                    >
                                        Tout afficher
                                    </button>
                                </div>

                                {schemas.map(schema => {
                                    const schemaId = String(schema._id)
                                    const checked = visibleSet.has(schemaId)
                                    return (
                                        <label
                                            key={schemaId}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '8px 10px',
                                                borderBottom: '1px solid #f9fafb',
                                                cursor: 'pointer',
                                                fontSize: 12,
                                                color: '#374151'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => onToggleSchemaVisibility?.(schema._id)}
                                            />
                                            <span>{schema.label || schema.name}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
