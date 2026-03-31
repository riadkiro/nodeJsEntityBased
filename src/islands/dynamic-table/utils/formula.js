/**
 * formula.js - Shared formula calculation utility
 */

export function computeFormulaColumns(schema, lineValues) {
    if (!schema?.columns) return {}
    const formulaCols = schema.columns.filter(c => c.type === 'formula' && c.config?.expression)
    if (formulaCols.length === 0) return {}

    // Build a values map with current line values
    const vals = { ...lineValues }
    const results = {}

    // Resolve formulas with cascading (up to 3 passes for dependency chains)
    for (let pass = 0; pass < 3; pass++) {
        let changed = false
        for (const col of formulaCols) {
            try {
                const expr = col.config.expression
                // Replace variable names with their numeric values
                const resolved = expr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (varName) => {
                    const v = vals[varName]
                    return (v !== null && v !== undefined && v !== '' && !isNaN(Number(v)))
                        ? Number(v)
                        : '0'
                })
                // Safe eval: only allow numbers and basic math operators
                if (/^[\d\s+\-*/().]+$/.test(resolved)) {
                    // eslint-disable-next-line no-new-func
                    const result = Function('"use strict"; return (' + resolved + ')')()
                    if (isFinite(result)) {
                        const rounded = Math.round(result * 100) / 100
                        if (vals[col.key] !== rounded) {
                            vals[col.key] = rounded
                            results[col.key] = rounded
                            changed = true
                        }
                    }
                }
            } catch (e) {
                // Skip invalid expressions
            }
        }
        if (!changed) break
    }

    return results
}
