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
    padding: '6px 12px',
    borderBottom: '1px solid #f3f4f6',
    minHeight: '36px'
}

const tabsRailStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    flex: 1,
    minWidth: 0
}

const pillBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: '#6b7280',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
    userSelect: 'none'
}

const pillActive = {
    ...pillBase,
    background: 'rgba(67, 97, 238, 0.1)',
    color: '#4361ee'
}

const iconBoxBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '5px',
    fontSize: '12px'
}

const iconBoxActive = {
    ...iconBoxBase,
    background: 'rgba(67, 97, 238, 0.15)',
    color: '#4361ee'
}

const iconBoxInactive = {
    ...iconBoxBase,
    background: 'rgba(107, 114, 128, 0.1)',
    color: '#9ca3af'
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
    border: '1px solid #e5e7eb',
    borderRadius: '999px',
    background: '#fff',
    color: '#6b7280',
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 9px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer'
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
    onShowAllSchemas
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
                                if (!isActive) e.currentTarget.style.background = 'rgba(107, 114, 128, 0.08)'
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            <span style={isActive ? iconBoxActive : iconBoxInactive}>
                                <iconify-icon icon={icon} width="12"></iconify-icon>
                            </span>
                            <span>{schema.label || schema.name}</span>
                            {lineCount > 0 && <span style={countBadge}>{lineCount}</span>}
                        </button>
                    )
                })}
            </div>

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
    )
}
