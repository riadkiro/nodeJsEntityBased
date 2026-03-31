import { computeFormulaColumns } from './formula'

export function getFilledLines(lines) {
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

export function normalizeTotalsConfig(totals) {
    if (!totals) return null

    if (Array.isArray(totals.rows) && totals.rows.length > 0) {
        return totals.rows
    }

    if (totals.subtotalKey) {
        const rows = [
            { label: 'Total HT', key: totals.subtotalKey, type: 'sum' }
        ]
        if (totals.vatKey) {
            rows.push({ label: 'TVA', key: totals.vatKey, type: 'sum' })
        }
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

export function computeTotalsRows(schema, lines) {
    const rowDefs = normalizeTotalsConfig(schema?.totals)
    if (!rowDefs) return []

    const filledLines = getFilledLines(lines)
    if (filledLines.length === 0) return []

    const schemaColumns = schema?.columns || []

    const normalized = (rowDefs || []).map(def => {
        const keys = resolveDefKeys(def, schemaColumns)
        return { ...def, _resolvedKeys: keys }
    })

    const hasValidRows = normalized.some(def =>
        def.type === 'count' || (def._resolvedKeys && def._resolvedKeys.length > 0)
    )
    const effectiveRowDefs = hasValidRows
        ? normalized
        : autoDetectRowsWhenConfigBroken(schema, filledLines).map(def => ({
            ...def,
            _resolvedKeys: resolveDefKeys(def, schemaColumns)
        }))

    if (!effectiveRowDefs.length) return []

    const built = []
    for (const def of effectiveRowDefs) {
        const keys = def._resolvedKeys || []
        let value = 0

        const isFormula = keys.some(k => {
            const col = (schemaColumns || []).find(c => c.key === k)
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
                    if (current === null) current = v
                    else current = def.type === 'min' ? Math.min(current, v) : Math.max(current, v)
                }
            }
            value = current || 0
        } else {
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
}
