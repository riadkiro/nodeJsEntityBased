/**
 * TotalsBar — Flexible summary footer for billing schemas
 * Supports: 
 *   - Legacy format: { subtotalKey, vatKey, totalFormula }
 *   - New format: { rows: [{ label, key, type, isFinal }] }
 * Types: 'sum' (default), 'count', 'avg'
 */
import React, { useMemo } from 'react'
import { computeFormulaColumns } from '../utils/formula'

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

function normalizeToken(v) {
    return String(v || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

function looksLikeNumericColumn(col) {
    return ['number', 'money', 'formula'].includes(col?.type)
}

function resolveDefKeys(def, columns) {
    const initial = []
    if (Array.isArray(def?.keys)) initial.push(...def.keys)
    if (def?.key) initial.push(def.key)
    if (def?.columnKey) initial.push(def.columnKey)
    if (def?.fieldKey) initial.push(def.fieldKey)
    if (def?.colKey) initial.push(def.colKey)

    const colMap = new Map((columns || []).map(c => [String(c.key || ''), c]))
    const resolved = []
    for (const rawKey of initial) {
        const key = String(rawKey || '').trim()
        if (!key) continue
        if (colMap.has(key)) {
            resolved.push(key)
            continue
        }
        const n = normalizeToken(key)
        const fuzzy = (columns || []).find(c =>
            normalizeToken(c.key) === n || normalizeToken(c.label) === n
        )
        if (fuzzy?.key) resolved.push(fuzzy.key)
    }

    if (resolved.length > 0) return Array.from(new Set(resolved))

    // Fallback: map row label to an existing column
    const labelToken = normalizeToken(def?.label)
    if (!labelToken) return []
    const match = (columns || []).find(c =>
        normalizeToken(c.label) === labelToken || normalizeToken(c.key) === labelToken
    ) || (columns || []).find(c =>
        labelToken.includes(normalizeToken(c.label)) ||
        labelToken.includes(normalizeToken(c.key))
    )
    return match?.key ? [match.key] : []
}

function autoDetectRowsWhenConfigBroken(schema, filledLines) {
    const cols = (schema?.columns || []).filter(looksLikeNumericColumn)
    if (cols.length === 0 || filledLines.length === 0) return []

    const scoreCol = (col) => {
        const token = normalizeToken(`${col.key} ${col.label}`)
        let score = 0
        if (token.includes('ttc')) score += 80
        if (token.includes('total')) score += 50
        if (token.includes('montant')) score += 35
        if (token.includes('sum')) score += 25
        if (col.type === 'formula') score += 20
        if (col.type === 'money') score += 15

        // Prefer non-empty/non-zero columns on actual lines
        let nonZero = 0
        for (const line of filledLines) {
            const base = { ...(line?.computed || {}), ...(line?.values || {}) }
            const v = Number(base[col.key] || 0)
            if (isFinite(v) && v !== 0) nonZero++
        }
        score += nonZero * 3
        return score
    }

    const sorted = [...cols].sort((a, b) => scoreCol(b) - scoreCol(a))
    const best = sorted[0]
    if (!best?.key) return []
    return [{ label: (best.label || best.key || 'Total').toUpperCase() + ' SUM', key: best.key, type: 'sum', isFinal: true }]
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
    const filledLines = useMemo(() => getFilledLines(lines), [lines])
    const schemaColumns = schema?.columns || []

    const effectiveRowDefs = useMemo(() => {
        const normalized = (rowDefs || []).map(def => {
            const keys = resolveDefKeys(def, schemaColumns)
            return { ...def, _resolvedKeys: keys }
        })

        const hasValidRows = normalized.some(def =>
            def.type === 'count' || (def._resolvedKeys && def._resolvedKeys.length > 0)
        )
        if (hasValidRows) return normalized

        const fallbackRows = autoDetectRowsWhenConfigBroken(schema, filledLines)
        return fallbackRows.map(def => ({ ...def, _resolvedKeys: resolveDefKeys(def, schemaColumns) }))
    }, [rowDefs, schemaColumns, schema, filledLines])

    if (!effectiveRowDefs.length) return null

    const computedRows = useMemo(() => {
        if (filledLines.length === 0) return []
        const built = []

        for (const def of effectiveRowDefs) {
            const keys = def._resolvedKeys || []
            let value = 0

            const isFormula = keys.some(k => {
                const col = (schema.columns || []).find(c => c.key === k)
                return col?.type === 'formula'
            })

            if (def.type === 'count') {
                value = filledLines.length
            } else if (def.type === 'avg' || !def.type || def.type === 'sum') {
                let sum = 0
                for (const line of filledLines) {
                    const baseLineVals = { ...(line?.computed || {}), ...(line?.values || {}) }
                    const lineVals = isFormula 
                        ? { ...baseLineVals, ...computeFormulaColumns(schema, baseLineVals) }
                        : baseLineVals
                    for (const k of keys) {
                        const v = Number(lineVals?.[k] || 0)
                        sum += isFinite(v) ? v : 0
                    }
                }

                // If final row has no keys, sum previous non-final rows
                if (keys.length === 0 && def.isFinal) {
                    sum = built.filter(r => !r.isFinal).reduce((acc, r) => acc + Number(r.value || 0), 0)
                }

                value = def.type === 'avg' ? (filledLines.length > 0 ? sum / filledLines.length : 0) : sum
            } else if (def.type === 'min' || def.type === 'max') {
                let current = null
                for (const line of filledLines) {
                    const lineVals = { ...(line?.computed || {}), ...(line?.values || {}) }
                    for (const k of keys) {
                        const v = Number(lineVals?.[k] || 0)
                        if (!isFinite(v)) continue
                        if (current === null) {
                            current = v
                        } else {
                            current = def.type === 'min' ? Math.min(current, v) : Math.max(current, v)
                        }
                    }
                }
                value = current || 0
            } else {
                // Default: sum
                for (const line of filledLines) {
                    const lineVals = { ...(line?.computed || {}), ...(line?.values || {}) }
                    for (const k of keys) {
                        const v = Number(lineVals?.[k] || 0)
                        value += isFinite(v) ? v : 0
                    }
                }
            }

            built.push({
                label: def.label,
                value,
                isFinal: def.isFinal || false,
                format: def.format || 'amount'
            })
        }
        return built
    }, [filledLines, effectiveRowDefs, schema])

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
