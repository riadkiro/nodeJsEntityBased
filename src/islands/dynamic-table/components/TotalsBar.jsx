/**
 * TotalsBar — Summary footer for billing schemas
 * Shows Total HT, TVA, and Total TTC calculated from filled lines
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

const totalLabelStyle = {
    ...labelStyle,
    color: '#111827',
    fontWeight: 700,
    borderTop: '2px solid #e5e7eb',
    paddingTop: '8px',
    fontSize: '13px'
}

const totalValueStyle = {
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
    const totalsConfig = schema?.totals
    if (!totalsConfig || !totalsConfig.subtotalKey) return null

    const totals = useMemo(() => {
        const filledLines = (lines || []).filter(l => {
            if (!l?.values) return false
            return Object.values(l.values).some(v =>
                v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
            )
        })

        let subtotal = 0
        let vat = 0

        for (const line of filledLines) {
            const vals = line.values || {}
            const st = Number(vals[totalsConfig.subtotalKey] || 0)
            const v = totalsConfig.vatKey ? Number(vals[totalsConfig.vatKey] || 0) : 0
            subtotal += isFinite(st) ? st : 0
            vat += isFinite(v) ? v : 0
        }

        const total = subtotal + vat

        return { subtotal, vat, total, lineCount: filledLines.length }
    }, [lines, totalsConfig])

    if (totals.lineCount === 0) return null

    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <tbody>
                    <tr>
                        <td style={labelStyle}>Total HT</td>
                        <td style={valueStyle}>{formatAmount(totals.subtotal)}</td>
                    </tr>
                    {totalsConfig.vatKey && (
                        <tr>
                            <td style={labelStyle}>TVA</td>
                            <td style={valueStyle}>{formatAmount(totals.vat)}</td>
                        </tr>
                    )}
                    <tr>
                        <td style={totalLabelStyle}>Total TTC</td>
                        <td style={totalValueStyle}>{formatAmount(totals.total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
