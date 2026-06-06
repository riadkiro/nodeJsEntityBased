const mongoose = require('mongoose')

const NO_VALUE_OPERATORS = new Set(['is_empty', 'is_not_empty'])

function escapeRegex(value) {
    return String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeOperator(operator) {
    const op = String(operator || 'equals')
    const aliases = {
        greater_than: 'gt',
        less_than: 'lt',
        before: 'lt',
        after: 'gt',
        startsWith: 'starts_with',
        endsWith: 'ends_with',
        empty: 'is_empty',
        not_empty: 'is_not_empty'
    }
    return aliases[op] || op
}

function toObjectId(value) {
    if (!value) return null
    const str = String(value)
    return mongoose.Types.ObjectId.isValid(str) ? new mongoose.Types.ObjectId(str) : null
}

function toValueArray(value) {
    if (Array.isArray(value)) return value.filter(v => v !== undefined && v !== null && v !== '')
    return String(value ?? '')
        .split(',')
        .map(v => v.trim())
        .filter(Boolean)
}

function coerceValue(value, fieldType) {
    if (value === undefined || value === null) return value
    const type = String(fieldType || '').toLowerCase()
    if (['number', 'currency', 'percent'].includes(type)) {
        const n = Number(value)
        return Number.isNaN(n) ? value : n
    }
    if (['date', 'datetime'].includes(type)) {
        const d = new Date(value)
        return Number.isNaN(d.getTime()) ? value : d
    }
    if (['boolean', 'checkbox', 'switch', 'toggle'].includes(type)) {
        if (value === true || value === false) return value
        const s = String(value).toLowerCase()
        if (['true', '1', 'oui', 'yes'].includes(s)) return true
        if (['false', '0', 'non', 'no'].includes(s)) return false
    }
    return value
}

function conditionForOperator(filter) {
    const operator = normalizeOperator(filter.operator)
    const fieldType = filter.fieldType || filter.type
    const rawValue = filter.value
    const value = coerceValue(rawValue, fieldType)
    const value2 = coerceValue(filter.value2, fieldType)

    switch (operator) {
        case 'contains':
            return { $regex: escapeRegex(rawValue), $options: 'i' }
        case 'not_contains':
            return { $not: { $regex: escapeRegex(rawValue), $options: 'i' } }
        case 'starts_with':
            return { $regex: `^${escapeRegex(rawValue)}`, $options: 'i' }
        case 'ends_with':
            return { $regex: `${escapeRegex(rawValue)}$`, $options: 'i' }
        case 'not_equals':
            return { $ne: value }
        case 'gt':
            return { $gt: value }
        case 'gte':
            return { $gte: value }
        case 'lt':
            return { $lt: value }
        case 'lte':
            return { $lte: value }
        case 'between':
            return { $gte: value, $lte: value2 }
        case 'in':
            return { $in: toValueArray(rawValue).map(v => coerceValue(v, fieldType)) }
        case 'equals':
        default:
            return value
    }
}

function emptyCondition(field) {
    return {
        $or: [
            { [field]: { $exists: false } },
            { [field]: null },
            { [field]: '' },
            { [field]: [] }
        ]
    }
}

function notEmptyCondition(field) {
    return { [field]: { $exists: true, $nin: [null, '', []] } }
}

function titleCondition(filter) {
    const operator = normalizeOperator(filter.operator)
    if (operator === 'is_empty') {
        return { $and: [emptyCondition('title'), emptyCondition('computedTitle')] }
    }
    if (operator === 'is_not_empty') {
        return { $or: [notEmptyCondition('title'), notEmptyCondition('computedTitle')] }
    }
    const condition = conditionForOperator(filter)
    return { $or: [{ title: condition }, { computedTitle: condition }] }
}

function standardFieldCondition(filter) {
    const field = filter.field || filter.fieldId
    const operator = normalizeOperator(filter.operator)
    if (field === 'title') return titleCondition(filter)
    if (operator === 'is_empty') return emptyCondition(field)
    if (operator === 'is_not_empty') return notEmptyCondition(field)
    return { [field]: conditionForOperator(filter) }
}

function customFieldCondition(filter) {
    const fieldId = toObjectId(filter.field || filter.fieldId)
    if (!fieldId) return null

    const operator = normalizeOperator(filter.operator)
    if (operator === 'is_empty') {
        return {
            $nor: [{
                customFields: {
                    $elemMatch: {
                        field_id: fieldId,
                        value: { $exists: true, $nin: [null, '', []] }
                    }
                }
            }]
        }
    }
    if (operator === 'is_not_empty') {
        return {
            customFields: {
                $elemMatch: {
                    field_id: fieldId,
                    value: { $exists: true, $nin: [null, '', []] }
                }
            }
        }
    }

    const positive = {
        customFields: {
            $elemMatch: {
                field_id: fieldId,
                value: conditionForOperator(filter)
            }
        }
    }

    if (operator === 'not_equals' || operator === 'not_contains') {
        const positiveFilter = { ...filter, operator: operator === 'not_equals' ? 'equals' : 'contains' }
        return {
            $nor: [{
                customFields: {
                    $elemMatch: {
                        field_id: fieldId,
                        value: conditionForOperator(positiveFilter)
                    }
                }
            }]
        }
    }

    return positive
}

function classificationCondition(filter) {
    const classificationId = toObjectId(String(filter.field || filter.fieldId || '').replace(/^classif:/, ''))
    if (!classificationId) return null

    const operator = normalizeOperator(filter.operator)
    if (operator === 'is_empty') {
        return { $nor: [{ classificationValues: { $elemMatch: { classificationId } } }] }
    }
    if (operator === 'is_not_empty') {
        return { classificationValues: { $elemMatch: { classificationId } } }
    }

    if (operator === 'contains' || operator === 'not_contains') {
        const query = {
            classificationValues: {
                $elemMatch: {
                    classificationId,
                    label: { $regex: escapeRegex(filter.value), $options: 'i' }
                }
            }
        }
        return operator === 'not_contains' ? { $nor: [query] } : query
    }

    const values = operator === 'in' ? toValueArray(filter.value) : [filter.value]
    const optionIds = values.map(toObjectId).filter(Boolean)
    const labels = values.filter(v => !toObjectId(v)).map(v => String(v))
    const optionMatch = []
    if (optionIds.length) optionMatch.push({ optionId: { $in: optionIds } })
    if (labels.length) optionMatch.push({ label: { $in: labels } })

    if (!optionMatch.length) return null
    const query = {
        classificationValues: {
            $elemMatch: {
                classificationId,
                ...(optionMatch.length === 1 ? optionMatch[0] : { $or: optionMatch })
            }
        }
    }
    return operator === 'not_equals' ? { $nor: [query] } : query
}

function relationCondition(filter) {
    const relationKey = String(filter.field || filter.fieldId || '').replace(/^rel:/, '')
    if (!relationKey) return null

    const operator = normalizeOperator(filter.operator)
    if (operator === 'is_empty') {
        return {
            $nor: [{
                relations: {
                    $elemMatch: {
                        relationKey,
                        value: { $exists: true, $nin: [null, '', []] }
                    }
                }
            }]
        }
    }
    if (operator === 'is_not_empty') {
        return {
            relations: {
                $elemMatch: {
                    relationKey,
                    value: { $exists: true, $nin: [null, '', []] }
                }
            }
        }
    }

    const rawValues = operator === 'in' ? toValueArray(filter.value) : [filter.value]
    const values = rawValues.map(v => toObjectId(v) || v)
    const valueCondition = values.length === 1 ? values[0] : { $in: values }

    const query = { relations: { $elemMatch: { relationKey, value: valueCondition } } }
    return operator === 'not_equals' ? { $nor: [query] } : query
}

function filterToQuery(filter) {
    const field = String(filter.field || filter.fieldId || '')
    const operator = normalizeOperator(filter.operator)
    if (!field || !operator) return null
    if (!NO_VALUE_OPERATORS.has(operator) && operator !== 'between' && (filter.value === undefined || filter.value === null || filter.value === '')) {
        return null
    }
    if (operator === 'between' && (filter.value === '' || filter.value2 === '' || filter.value2 === undefined || filter.value2 === null)) {
        return null
    }

    if (field.startsWith('classif:')) return classificationCondition({ ...filter, operator })
    if (field.startsWith('rel:')) return relationCondition({ ...filter, operator })

    const standardFields = new Set([
        'title', 'computedTitle', 'slug', 'status', 'description', 'content',
        'date', 'end_date', 'createdAt', 'updatedAt', 'published', 'isDraft'
    ])
    if (standardFields.has(field)) return standardFieldCondition({ ...filter, operator })
    return customFieldCondition({ ...filter, operator })
}

function buildRecordFilterQuery(filters = []) {
    const cleanFilters = (Array.isArray(filters) ? filters : []).filter(f => f && (f.field || f.fieldId))
    if (!cleanFilters.length) return {}

    const groups = [[]]
    cleanFilters.forEach((filter, index) => {
        if (index > 0 && String(filter.logic || 'AND').toUpperCase() === 'OR') {
            groups.push([])
        }
        groups[groups.length - 1].push(filter)
    })

    const groupQueries = groups
        .map(group => group.map(filterToQuery).filter(Boolean))
        .filter(group => group.length)
        .map(group => group.length === 1 ? group[0] : { $and: group })

    if (!groupQueries.length) return {}
    if (groupQueries.length === 1) return groupQueries[0]
    return { $or: groupQueries }
}

function sanitizeViewFilters(filters = []) {
    return (Array.isArray(filters) ? filters : [])
        .map((filter, index) => {
            const field = String(filter.field || filter.fieldId || '').trim()
            const operator = normalizeOperator(filter.operator)
            if (!field || !operator) return null
            return {
                field,
                fieldName: String(filter.fieldName || filter.name || '').trim(),
                fieldType: String(filter.fieldType || filter.type || 'text').trim(),
                operator,
                value: filter.value,
                value2: filter.value2,
                logic: index === 0 ? 'AND' : String(filter.logic || 'AND').toUpperCase() === 'OR' ? 'OR' : 'AND'
            }
        })
        .filter(Boolean)
}

module.exports = {
    buildRecordFilterQuery,
    sanitizeViewFilters,
    normalizeOperator
}
