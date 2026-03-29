/**
 * TotalsBar — Flexible summary footer for billing schemas
 * Supports: 
 *   - Legacy format: { subtotalKey, vatKey, totalFormula }
 *   - New format: { rows: [{ label, key, type, isFinal }] }
 * Types: 'sum' (default), 'count', 'avg'
 */
import React, { useMemo } from 'react'

const containerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '8px 12px',
    borderTop: '2px solid #e5e7eb'
}

const tableStyle = {
    borderCollapse: 'collapse',
    fontSize: '12px',
    minWidth: '240px'
}

const labelStyle = {
    padding: '5px 16px 5px 8px',
    color: '#6b7280',
    fontWeight: 500,
    textAlign: 'left',
    whiteSpace: 'nowrap'
}

const valueStyle = {
    padding: '5px 8px',
    textAlign: 'right',
    fontWeight: 600,
    color: '#111827',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
}

const finalLabelStyle = {
    ...labelStyle,
    color: '#111827',
    fontWeight: 700,
    borderTop: '2px solid #e5e7eb',
    paddingTop: '8px',
    fontSize: '13px'
}

const finalValueStyle = {
    ...valueStyle,
    color: '#4361ee',
    fontWeight: 700,
    borderTop: '2px solid #e5e7eb',
    paddingTop: '8px',
    fontSize: '14px'
}

function formatAmount(num) {
    if (num === null || num === undefined || isNaN(num)) return '0.00'
    return Number(num).toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

function getFilledLines(lines) {
    return (lines || []).filter(l => {
        if (!l?.values) return false
        return Object.values(l.values).some(v =>
            v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
        )
    })
}

/**
 * Convert legacy totals config to rows array
 */
function normalizeTotalsConfig(totals) {
    if (!totals) return null

    // New format: already has rows
    if (Array.isArray(totals.rows) && totals.rows.length > 0) {
        return totals.rows
    }

    // Legacy format: subtotalKey + vatKey
    if (totals.subtotalKey) {
        const rows = [
            { label: 'Total HT', key: totals.subtotalKey, type: 'sum' }
        ]
        if (totals.vatKey) {
            rows.push({ label: 'TVA', key: totals.vatKey, type: 'sum' })
        }
        // Final row: sum of subtotal + vat
        rows.push({
            label: 'Total TTC',
            keys: [totals.subtotalKey, totals.vatKey].filter(Boolean),
            type: 'sum',
            isFinal: true
        })
        return rows
    }

    return null
}

export default function TotalsBar({ schema, lines }) {
    const rowDefs = normalizeTotalsConfig(schema?.totals)
    if (!rowDefs) return null

    const filledLines = useMemo(() => getFilledLines(lines), [lines])

    const computedRows = useMemo(() => {
        if (filledLines.length === 0) return []

        return rowDefs.map(def => {
            const keys = def.keys || (def.key ? [def.key] : [])
            let value = 0

            if (def.type === 'count') {
                value = filledLines.length
            } else if (def.type === 'avg') {
                let sum = 0
                for (const line of filledLines) {
                    for (const k of keys) {
                        const v = Number(line.values?.[k] || 0)
                        sum += isFinite(v) ? v : 0
                    }
                }
                value = filledLines.length > 0 ? sum / filledLines.length : 0
            } else {
                // Default: sum
                for (const line of filledLines) {
                    for (const k of keys) {
                        const v = Number(line.values?.[k] || 0)
                        value += isFinite(v) ? v : 0
                    }
                }
            }

            return {
                label: def.label,
                value,
                isFinal: def.isFinal || false,
                format: def.format || 'amount'
            }
        })
    }, [filledLines, rowDefs])

    if (computedRows.length === 0) return null

    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <tbody>
                    {computedRows.map((row, i) => (
                        <tr key={i}>
                            <td style={row.isFinal ? finalLabelStyle : labelStyle}>
                                {row.label}
                            </td>
                            <td style={row.isFinal ? finalValueStyle : valueStyle}>
                                {row.format === 'count' ? row.value : formatAmount(row.value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
