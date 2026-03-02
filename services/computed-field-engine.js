/**
 * 🧠 Computed Field Engine
 * Evaluates dynamic/calculated fields based on formulas and source fields.
 * 
 * Usage:
 *   const { computeField, computeAllFields } = require('../services/computed-field-engine');
 *   const value = computeField(field, record, allFields);
 *   const computed = computeAllFields(computedFields, record, allFields);
 */

// ─── Helper: get a field value from a record ───
function getFieldValue(record, fieldRef, allFields) {
    if (!fieldRef || !record) return null;

    // Standard fields
    if (fieldRef === 'title') return record.title;
    if (fieldRef === 'createdAt') return record.createdAt;
    if (fieldRef === 'updatedAt') return record.updatedAt;

    // Custom fields (stored in record.custom map)
    const custom = record.custom || record.customFields || {};
    const getFromCustom = (key) => {
        if (!key) return null;
        if (custom instanceof Map) {
            return custom.get(key) || custom.get(key.toString()) || null;
        }
        return custom[key] || custom[key.toString()] || null;
    };

    // Try direct lookup by ID first
    let val = getFromCustom(fieldRef);
    if (val !== null && val !== undefined) return val;

    // Handle __fieldName__ pattern (strip underscores) → resolve by name
    let fieldName = fieldRef;
    const namePattern = fieldRef.match(/^__(.+)__$/);
    if (namePattern) fieldName = namePattern[1];

    // Try to resolve field name → ID using allFields
    if (allFields && Array.isArray(allFields)) {
        for (const f of allFields) {
            if (f.name === fieldName || f.name === fieldRef) {
                const resolvedId = f._id ? f._id.toString() : null;
                if (resolvedId) {
                    val = getFromCustom(resolvedId);
                    if (val !== null && val !== undefined) return val;
                }
            }
        }
    }

    return null;
}

// ─── Age Calculator ───
function calculateAge(birthDate) {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// ─── Duration Calculator ───
function calculateDuration(start, end) {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

    const diffMs = Math.abs(endDate - startDate);
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
        return { hours, minutes: mins, totalMinutes: diffMins, formatted: `${hours}h ${mins}min` };
    }
    return { hours: 0, minutes: mins, totalMinutes: diffMins, formatted: `${mins} min` };
}

// ─── Helper: build name→ID map from allFields ───
function buildNameToIdMap(allFields) {
    const map = {};
    if (!allFields) return map;
    const fields = Array.isArray(allFields) ? allFields : [];
    for (const f of fields) {
        if (f.name && f._id) {
            map[f.name] = f._id.toString();
        }
    }
    return map;
}

// ─── Expression Evaluator (safe, no eval) ───
function evalExpression(expression, record, allFields) {
    if (!expression) return null;
    try {
        const nameToId = buildNameToIdMap(allFields);

        // Replace %fieldName% with actual values
        let expr = expression;
        const fieldRefs = expression.match(/%([^%]+)%/g) || [];
        for (const ref of fieldRefs) {
            const fieldRef = ref.replace(/%/g, '');
            // Try by name first (most common in expressions), then by ID
            const resolvedId = nameToId[fieldRef] || fieldRef;
            const val = getFieldValue(record, resolvedId, allFields);
            if (val === null || val === undefined) return null;
            expr = expr.replace(ref, Number(val) || 0);
        }

        // Safe math evaluation (only numbers and operators)
        if (/^[\d+\-*/().\s]+$/.test(expr)) {
            return Function('"use strict"; return (' + expr + ')')();
        }
        return null;
    } catch (e) {
        console.warn('[ComputedField] Expression error:', expression, e.message);
        return null;
    }
}

// ─── Main compute function ───
function computeField(field, record, allFields) {
    const { formula } = field;
    if (!formula) return null;

    const src = formula.sourceFields || {};

    switch (formula.fromFunction) {
        // ── Age from date of birth ──
        case 'age': {
            const birthDate = getFieldValue(record, src.birthDate || src.dateField, allFields);
            const age = calculateAge(birthDate);
            return age !== null ? { value: age, formatted: `${age} ans`, unit: 'ans' } : null;
        }

        // ── Duration between two dates/times ──
        case 'duration': {
            const start = getFieldValue(record, src.start, allFields);
            const end = getFieldValue(record, src.end, allFields);
            return calculateDuration(start, end);
        }

        // ── Sum of numeric fields ──
        case 'sum': {
            const fieldIds = src.fields || [];
            let total = 0;
            for (const fid of fieldIds) {
                const val = Number(getFieldValue(record, fid, allFields)) || 0;
                total += val;
            }
            return { value: total, formatted: total.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) };
        }

        // ── Multiply two fields ──
        case 'multiply': {
            const a = Number(getFieldValue(record, src.a, allFields)) || 0;
            const b = Number(getFieldValue(record, src.b, allFields)) || 0;
            const result = a * b;
            return { value: result, formatted: result.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) };
        }

        // ── TVA calculation (price × rate) ──
        case 'tva': {
            const priceHT = Number(getFieldValue(record, src.priceHT, allFields)) || 0;
            const rate = Number(src.rate) || 0.21;
            const tva = priceHT * rate;
            return {
                value: tva,
                formatted: tva.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
                currency: '€'
            };
        }

        // ── Total TTC (HT + TVA) ──
        case 'total_ttc': {
            const ht = Number(getFieldValue(record, src.priceHT, allFields)) || 0;
            const rate = Number(src.rate) || 0.21;
            const ttc = ht * (1 + rate);
            return {
                value: ttc,
                formatted: ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
                currency: '€'
            };
        }

        // ── Rating (score out of max → stars) ──
        case 'rating': {
            const score = Number(getFieldValue(record, src.score || src.field, allFields)) || 0;
            const max = Number(src.max) || 5;
            const normalized = Math.min(Math.max(score, 0), max);
            return {
                value: normalized,
                max,
                percentage: Math.round((normalized / max) * 100),
                formatted: `${normalized}/${max}`
            };
        }

        // ── Count of related records ──
        case 'count': {
            const relationKey = src.relation || src.key;
            const relations = record.relations || {};
            const relData = relations instanceof Map ? relations.get(relationKey) : relations[relationKey];
            const count = Array.isArray(relData) ? relData.length : 0;
            return { value: count, formatted: `${count}` };
        }

        // ── Concatenation of fields ──
        case 'concat': {
            const fieldIds = src.fields || [];
            const sep = src.sep || ' ';
            const parts = fieldIds
                .map(fid => getFieldValue(record, fid, allFields))
                .filter(v => v !== null && v !== undefined && v !== '');
            return { value: parts.join(sep), formatted: parts.join(sep) };
        }

        // ── Percentage ──
        case 'percentage': {
            const numerator = Number(getFieldValue(record, src.numerator, allFields)) || 0;
            const denominator = Number(getFieldValue(record, src.denominator, allFields)) || 1;
            const pct = denominator !== 0 ? Math.round((numerator / denominator) * 100) : 0;
            return { value: pct, formatted: `${pct}%` };
        }

        // ── Free expression ──
        case 'expression': {
            const result = evalExpression(formula.expression, record, allFields);
            if (result === null) return null;
            return {
                value: result,
                formatted: typeof result === 'number'
                    ? result.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
                    : String(result)
            };
        }

        default:
            // Try evaluating expression if present
            if (formula.expression) {
                const result = evalExpression(formula.expression, record, allFields);
                if (result !== null) {
                    return { value: result, formatted: String(result) };
                }
            }
            return null;
    }
}

// ─── Compute all computed fields for a record ───
function computeAllFields(fields, record, allFields) {
    const results = {};
    const computedFields = (fields || []).filter(f => f.category === 'computed' && f.formula);

    for (const field of computedFields) {
        const fieldId = field._id ? field._id.toString() : field.name;
        results[fieldId] = computeField(field, record, allFields);
    }

    return results;
}

module.exports = {
    computeField,
    computeAllFields,
    getFieldValue,
    calculateAge,
    calculateDuration,
    evalExpression
};
