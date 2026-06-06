import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const OPERATORS = {
    contains: { label: 'Contient', types: ['text', 'email', 'phone', 'url', 'textarea', 'title', 'relation'] },
    not_contains: { label: 'Ne contient pas', types: ['text', 'email', 'phone', 'url', 'textarea', 'title', 'relation'] },
    equals: { label: 'Est egal a', types: ['text', 'email', 'phone', 'url', 'number', 'date', 'title', 'select', 'boolean', 'checkbox', 'switch', 'relation', 'classification'] },
    not_equals: { label: "N'est pas egal a", types: ['text', 'email', 'phone', 'url', 'number', 'date', 'title', 'select', 'boolean', 'checkbox', 'switch', 'relation', 'classification'] },
    starts_with: { label: 'Commence par', types: ['text', 'email', 'phone', 'url', 'title'] },
    ends_with: { label: 'Se termine par', types: ['text', 'email', 'phone', 'url', 'title'] },
    gt: { label: 'Superieur a', types: ['number', 'date'] },
    gte: { label: 'Superieur ou egal', types: ['number', 'date'] },
    lt: { label: 'Inferieur a', types: ['number', 'date'] },
    lte: { label: 'Inferieur ou egal', types: ['number', 'date'] },
    between: { label: 'Entre', types: ['number', 'date'] },
    is_empty: { label: 'Est vide', types: ['text', 'email', 'phone', 'url', 'number', 'date', 'textarea', 'title', 'select', 'boolean', 'checkbox', 'switch', 'relation', 'classification'] },
    is_not_empty: { label: "N'est pas vide", types: ['text', 'email', 'phone', 'url', 'number', 'date', 'textarea', 'title', 'select', 'boolean', 'checkbox', 'switch', 'relation', 'classification'] },
}

function normalizeType(type) {
    const value = String(type || 'text').toLowerCase()
    if (['bool', 'boolean', 'checkbox', 'switch', 'toggle'].includes(value)) return 'boolean'
    if (['number', 'currency', 'percent', 'decimal'].includes(value)) return 'number'
    if (['date', 'datetime', 'datetime-local'].includes(value)) return 'date'
    if (['classification'].includes(value)) return 'classification'
    if (['relation'].includes(value)) return 'relation'
    if (['select', 'multiselect', 'multi-select', 'multi_select'].includes(value)) return 'select'
    return value || 'text'
}

function getOperatorsForType(type) {
    const normalized = normalizeType(type)
    return Object.entries(OPERATORS)
        .filter(([, operator]) => operator.types.includes(normalized))
        .map(([key, operator]) => ({ key, ...operator }))
}

function getInputType(type) {
    const normalized = normalizeType(type)
    if (normalized === 'number') return 'number'
    if (normalized === 'date') return 'date'
    return 'text'
}

function isNoValueOperator(operator) {
    return ['is_empty', 'is_not_empty'].includes(operator)
}

function isBetweenOperator(operator) {
    return operator === 'between'
}

export default function ViewFiltersModal({
    open,
    accountNumber,
    viewId,
    viewName,
    columns = [],
    sidebarFilters = [],
    initialFilters = [],
    onClose,
    onSaved,
}) {
    const [name, setName] = useState('')
    const [filters, setFilters] = useState([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [showFieldPicker, setShowFieldPicker] = useState(false)

    useEffect(() => {
        if (!open) return
        setName(viewName || '')
        setFilters(Array.isArray(initialFilters) ? JSON.parse(JSON.stringify(initialFilters)) : [])
        setError('')
        setShowFieldPicker(false)
    }, [open, initialFilters, viewName])

    useEffect(() => {
        if (!showFieldPicker) return
        window.setTimeout(() => {
            document.querySelector('[data-view-filter-picker="1"]')?.scrollIntoView({ block: 'nearest' })
        }, 0)
    }, [showFieldPicker])

    const filterableColumns = useMemo(() => columns.filter(column => column.id !== 'actions'), [columns])

    const classificationOptionsMap = useMemo(() => {
        const map = {}
        sidebarFilters.forEach(group => {
            map[`classif:${group.id}`] = group.options || []
        })
        return map
    }, [sidebarFilters])

    if (!open) return null

    const updateFilter = (index, patch) => {
        setFilters(prev => prev.map((filter, i) => i === index ? { ...filter, ...patch } : filter))
    }

    const addFilter = (columnId) => {
        const column = filterableColumns.find(item => item.id === columnId)
        if (!column) return
        const type = normalizeType(column.type)
        const operators = getOperatorsForType(type)
        const defaultOperator = operators.find(operator => operator.key === 'equals') || operators[0]
        setFilters(prev => [
            ...prev,
            {
                field: column.id,
                fieldName: column.name,
                fieldType: type,
                operator: defaultOperator.key,
                value: '',
                value2: '',
                logic: prev.length === 0 ? 'AND' : 'AND',
            }
        ])
        setShowFieldPicker(false)
    }

    const removeFilter = (index) => {
        setFilters(prev => prev.filter((_, i) => i !== index))
    }

    const clearFilters = () => {
        setFilters([])
    }

    const saveFilters = async () => {
        if (!viewId) return
        setSaving(true)
        setError('')
        try {
            const normalizedFilters = filters.map((filter, index) => ({
                field: filter.field || filter.fieldId,
                fieldName: filter.fieldName || '',
                fieldType: normalizeType(filter.fieldType),
                operator: filter.operator || 'equals',
                value: filter.value,
                value2: filter.value2,
                logic: index === 0 ? 'AND' : (filter.logic === 'OR' ? 'OR' : 'AND'),
            })).filter(filter => filter.field)

            const res = await fetch(`/account/${accountNumber}/api/view/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ viewId, name: name.trim(), filters: normalizedFilters }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || data.error || data.success === false) {
                throw new Error(data.error || `Erreur HTTP ${res.status}`)
            }
            onSaved?.(data.view || { filters: normalizedFilters, name: name.trim() })
        } catch (saveError) {
            setError(saveError.message || 'Sauvegarde impossible')
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 flex items-center justify-center bg-slate-950/45 p-4"
            style={{ zIndex: 10000 }}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) onClose?.()
            }}
        >
            <div
                className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1726]"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                            <iconify-icon icon="solar:filter-bold-duotone" width="19"></iconify-icon>
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-gray-900 dark:text-white">Configurer la vue</div>
                            <div className="truncate text-xs text-gray-400">{viewName || 'Vue'}</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => !saving && onClose?.()}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-dark/50 dark:text-white-dark dark:hover:bg-dark"
                        title="Fermer"
                    >
                        <iconify-icon icon="solar:close-circle-bold" width="17"></iconify-icon>
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="mb-4 grid gap-1.5 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20">
                        <label className="text-[11px] font-bold uppercase text-gray-400">Nom de la vue</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="form-input h-10 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                            placeholder="Clients"
                        />
                    </div>

                    <div className="grid gap-3">
                        {filters.map((filter, index) => {
                            const selectedField = filterableColumns.find(column => column.id === (filter.field || filter.fieldId)) || filterableColumns[0]
                            const fieldType = normalizeType(filter.fieldType || selectedField?.type)
                            const operators = getOperatorsForType(fieldType)
                            const classifOptions = String(filter.field || filter.fieldId || '').startsWith('classif:')
                                ? (classificationOptionsMap[filter.field || filter.fieldId] || [])
                                : []
                            const fieldOptions = Array.isArray(selectedField?.options) ? selectedField.options : []
                            const noValue = isNoValueOperator(filter.operator)
                            const between = isBetweenOperator(filter.operator)
                            const booleanField = fieldType === 'boolean'

                            return (
                                <React.Fragment key={`${filter.field || filter.fieldId}-${index}`}>
                                    {index > 0 && (
                                        <div className="flex items-center gap-2 pl-3">
                                            <span className="h-px flex-1 bg-gray-100 dark:bg-white/10"></span>
                                            <button
                                                type="button"
                                                className={`rounded-full px-3 py-1 text-[11px] font-bold ${filter.logic === 'OR' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-primary/10 text-primary'}`}
                                                onClick={() => updateFilter(index, { logic: filter.logic === 'OR' ? 'AND' : 'OR' })}
                                            >
                                                {filter.logic === 'OR' ? 'OU' : 'ET'}
                                            </button>
                                            <span className="h-px flex-1 bg-gray-100 dark:bg-white/10"></span>
                                        </div>
                                    )}

                                    <div className="grid gap-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20 md:grid-cols-[minmax(0,1.1fr)_minmax(150px,0.7fr)_minmax(0,0.9fr)_auto]">
                                        <select
                                            value={filter.field || filter.fieldId || ''}
                                            onChange={(event) => {
                                                const column = filterableColumns.find(item => item.id === event.target.value)
                                                const nextType = normalizeType(column?.type)
                                                const nextOperators = getOperatorsForType(nextType)
                                                updateFilter(index, {
                                                    field: column?.id || event.target.value,
                                                    fieldName: column?.name || '',
                                                    fieldType: nextType,
                                                    operator: (nextOperators.find(operator => operator.key === 'equals') || nextOperators[0])?.key || 'equals',
                                                    value: '',
                                                    value2: '',
                                                })
                                            }}
                                            className="form-select h-10 min-w-0 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                        >
                                            {filterableColumns.map(column => (
                                                <option key={column.id} value={column.id}>{column.name}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={filter.operator}
                                            onChange={(event) => updateFilter(index, {
                                                operator: event.target.value,
                                                value: isNoValueOperator(event.target.value) ? '' : filter.value,
                                                value2: '',
                                            })}
                                            className="form-select h-10 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                        >
                                            {operators.map(operator => (
                                                <option key={operator.key} value={operator.key}>{operator.label}</option>
                                            ))}
                                        </select>

                                        <div className="flex min-w-0 gap-2">
                                            {!noValue && classifOptions.length > 0 ? (
                                                <select
                                                    value={filter.value || ''}
                                                    onChange={(event) => updateFilter(index, { value: event.target.value })}
                                                    className="form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                                >
                                                    <option value="">Selectionner...</option>
                                                    {classifOptions.map(option => (
                                                        <option key={option.id} value={option.id}>{option.label}</option>
                                                    ))}
                                                </select>
                                            ) : !noValue && fieldOptions.length > 0 ? (
                                                <select
                                                    value={filter.value || ''}
                                                    onChange={(event) => updateFilter(index, { value: event.target.value })}
                                                    className="form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                                >
                                                    <option value="">Selectionner...</option>
                                                    {fieldOptions.map(option => (
                                                        <option key={option.id || option.value || option.label} value={option.value || option.label}>{option.label || option.value}</option>
                                                    ))}
                                                </select>
                                            ) : !noValue && booleanField ? (
                                                <select
                                                    value={String(filter.value ?? '')}
                                                    onChange={(event) => updateFilter(index, { value: event.target.value })}
                                                    className="form-select h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                                >
                                                    <option value="">Selectionner...</option>
                                                    <option value="true">Oui</option>
                                                    <option value="false">Non</option>
                                                </select>
                                            ) : !noValue ? (
                                                <input
                                                    type={getInputType(fieldType)}
                                                    value={filter.value || ''}
                                                    onChange={(event) => updateFilter(index, { value: event.target.value })}
                                                    className="form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                                    placeholder="Valeur"
                                                />
                                            ) : (
                                                <div className="h-10 min-w-0 flex-1 rounded-lg border border-dashed border-gray-200 bg-white/70 dark:border-white/10 dark:bg-[#1b2e4b]/60"></div>
                                            )}

                                            {between && (
                                                <input
                                                    type={getInputType(fieldType)}
                                                    value={filter.value2 || ''}
                                                    onChange={(event) => updateFilter(index, { value2: event.target.value })}
                                                    className="form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                                    placeholder="Max"
                                                />
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFilter(index)}
                                            className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark dark:hover:border-red-500/30 dark:hover:bg-red-950/30"
                                            title="Supprimer"
                                        >
                                            <iconify-icon icon="solar:trash-bin-trash-bold" width="15"></iconify-icon>
                                        </button>
                                    </div>
                                </React.Fragment>
                            )
                        })}

                        {!filters.length && (
                            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-xs text-gray-400 dark:border-white/10">
                                Aucun filtre
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFieldPicker(prev => !prev)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-[#111827] dark:text-white-dark"
                            >
                                <iconify-icon icon="solar:add-circle-bold" width="14"></iconify-icon>
                                Ajouter un filtre
                            </button>
                            {filters.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-500 transition hover:border-red-200 hover:text-red-600 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark"
                                >
                                    Effacer
                                </button>
                            )}

                        </div>

                        {showFieldPicker && (
                            <div data-view-filter-picker="1" className="max-h-64 overflow-y-auto rounded-lg border border-gray-100 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#111827]">
                                <div className="mb-2 px-2 text-[11px] font-bold uppercase text-gray-400">Choisir un champ</div>
                                <div className="grid gap-1 sm:grid-cols-2">
                                    {filterableColumns.map(column => (
                                        <button
                                            key={column.id}
                                            type="button"
                                            onClick={() => addFilter(column.id)}
                                            className="min-w-0 rounded-md border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:text-white-dark dark:hover:bg-white/5"
                                        >
                                            <span className="block truncate">{column.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-dark/30">
                    <button
                        type="button"
                        onClick={() => !saving && onClose?.()}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark"
                        disabled={saving}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={saveFilters}
                        disabled={saving || !name.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
                    >
                        <iconify-icon icon={saving ? 'svg-spinners:ring-resize' : 'solar:diskette-bold'} width="15"></iconify-icon>
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
