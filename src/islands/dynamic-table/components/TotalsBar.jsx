import React, { useMemo } from 'react'
import { computeTotalsRows } from '../utils/totals'

const containerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '12px 14px',
    borderTop: '1px solid #f1f3f5'
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

export default function TotalsBar({ schema, lines }) {
    const computedRows = useMemo(() => computeTotalsRows(schema, lines), [schema, lines])

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
