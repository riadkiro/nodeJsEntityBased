/**
 * SchemaTabBar — Tab pills for switching between schemas
 * Pixel-perfect match of .lp-schema-pill from record-lines.ejs
 */
import React from 'react'

const tabBarStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderBottom: '1px solid #f3f4f6',
    overflowX: 'auto',
    scrollbarWidth: 'none'
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

const schemaIcons = {
    form: '💊',
    table: '📋',
    catalog: '📄'
}

export default function SchemaTabBar({ schemas, activeSchemaId, onSelectSchema, getSchemaLines }) {
    return (
        <div style={tabBarStyle}>
            {schemas.map(schema => {
                const isActive = activeSchemaId === schema._id
                const lineCount = (getSchemaLines(schema._id) || []).filter(l => {
                    if (!l.values) return false
                    return Object.values(l.values).some(v =>
                        v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
                    )
                }).length
                const mode = schema.inputMode || (schema.columns?.some(c => c.type === 'relation') ? 'catalog' : 'table')
                const icon = schemaIcons[mode] || '📄'

                return (
                    <button
                        key={schema._id}
                        type="button"
                        style={isActive ? pillActive : pillBase}
                        onClick={() => onSelectSchema(schema._id)}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'rgba(107, 114, 128, 0.08)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'transparent'
                            }
                        }}
                    >
                        <span style={isActive ? iconBoxActive : iconBoxInactive}>
                            {icon}
                        </span>
                        <span>{schema.label || schema.name}</span>
                        {lineCount > 0 && (
                            <span style={countBadge}>{lineCount}</span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
