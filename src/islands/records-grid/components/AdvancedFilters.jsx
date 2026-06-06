/**
 * AdvancedFilters - Field-based advanced filtering for records
 * Allows filtering on any column with operators: contains, equals, starts_with, ends_with,
 * is_empty, is_not_empty, gt, lt, gte, lte, between, not_equals, not_contains
 * 
 * Supports AND/OR logic toggle between filters.
 * Classification fields show a dropdown of their options instead of free text input.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'

// All available operators with labels
const OPERATORS = {
    // Text operators
    contains: { label: 'Contient', icon: '⊃', types: ['text', 'email', 'phone', 'url', 'textarea', 'title', 'relation'] },
    not_contains: { label: 'Ne contient pas', icon: '⊅', types: ['text', 'email', 'phone', 'url', 'textarea', 'title', 'relation'] },
    equals: { label: 'Est égal à', icon: '=', types: ['text', 'email', 'phone', 'url', 'number', 'date', 'title', 'select', 'boolean', 'checkbox', 'switch', 'relation', 'classification'] },
    not_equals: { label: "N'est pas égal à", icon: '≠', types: ['text', 'email', 'phone', 'url', 'number', 'date', 'title', 'select', 'boolean', 'checkbox', 'switch', 'relation', 'classification'] },
    starts_with: { label: 'Commence par', icon: 'A…', types: ['text', 'email', 'phone', 'url', 'title'] },
    ends_with: { label: 'Se termine par', icon: '…Z', types: ['text', 'email', 'phone', 'url', 'title'] },
    // Number operators
    gt: { label: 'Supérieur à', icon: '>', types: ['number', 'date'] },
    gte: { label: 'Supérieur ou égal', icon: '≥', types: ['number', 'date'] },
    lt: { label: 'Inférieur à', icon: '<', types: ['number', 'date'] },
    lte: { label: 'Inférieur ou égal', icon: '≤', types: ['number', 'date'] },
    between: { label: 'Entre', icon: '↔', types: ['number', 'date'] },
    // Universal operators
    is_empty: { label: 'Est vide', icon: '∅', types: ['text', 'email', 'phone', 'url', 'number', 'date', 'textarea', 'title', 'select', 'boolean', 'checkbox', 'switch', 'relation', 'classification'] },
    is_not_empty: { label: "N'est pas vide", icon: '∃', types: ['text', 'email', 'phone', 'url', 'number', 'date', 'textarea', 'title', 'select', 'boolean', 'checkbox', 'switch', 'relation', 'classification'] },
}

// Get operators available for a field type
function getOperatorsForType(fieldType) {
    const type = String(fieldType || 'text').toLowerCase()
    return Object.entries(OPERATORS)
        .filter(([_, op]) => op.types.includes(type))
        .map(([key, op]) => ({ key, ...op }))
}

// Detect field type category for input rendering
function getInputType(fieldType) {
    if (['number', 'currency', 'percent'].includes(fieldType)) return 'number'
    if (['date', 'datetime'].includes(fieldType)) return 'date'
    return 'text'
}

export default function AdvancedFilters({
    columns = [],
    fieldFilters = [],
    onFieldFiltersChange,
    allRecords = [],
    sidebarFilters = [],
}) {
    const [isExpanded, setIsExpanded] = useState(fieldFilters.length > 0)
    const [editingIndex, setEditingIndex] = useState(null)
    const [showFieldSelector, setShowFieldSelector] = useState(false)
    const fieldSelectorRef = useRef(null)

    // Close field selector on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (showFieldSelector && fieldSelectorRef.current && !fieldSelectorRef.current.contains(e.target)) {
                setShowFieldSelector(false)
            }
        }
        if (showFieldSelector) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [showFieldSelector])

    // Build classification options lookup from sidebarFilters
    const classificationOptionsMap = React.useMemo(() => {
        const map = {}
        sidebarFilters.forEach(fg => {
            // Map classif:id to its options
            map[`classif:${fg.id}`] = fg.options || []
        })
        return map
    }, [sidebarFilters])

    // Get filterable columns — now INCLUDES classification columns
    const filterableColumns = columns.filter(col =>
        col.id !== 'actions'
    )

    // Add a new filter condition
    const addFilter = useCallback((columnId) => {
        const column = filterableColumns.find(c => c.id === columnId)
        if (!column) return

        const isClassif = columnId.startsWith('classif:')
        const availableOps = getOperatorsForType(column.type)
        const defaultOp = isClassif
            ? (availableOps.find(o => o.key === 'equals') || availableOps[0])
            : (availableOps.find(o => o.key === 'contains') || availableOps[0])

        const newFilter = {
            fieldId: columnId,
            fieldName: column.name,
            fieldType: column.type || 'text',
            operator: defaultOp.key,
            value: '',
            value2: '', // For "between" operator
            logic: 'AND', // Default connector logic for this filter
        }

        onFieldFiltersChange([...fieldFilters, newFilter])
        setShowFieldSelector(false)
        setEditingIndex(fieldFilters.length) // Auto-focus on the new filter
    }, [filterableColumns, fieldFilters, onFieldFiltersChange])

    // Update a filter
    const updateFilter = useCallback((index, updates) => {
        const newFilters = fieldFilters.map((f, i) =>
            i === index ? { ...f, ...updates } : f
        )
        onFieldFiltersChange(newFilters)
    }, [fieldFilters, onFieldFiltersChange])

    // Remove a filter
    const removeFilter = useCallback((index) => {
        const newFilters = fieldFilters.filter((_, i) => i !== index)
        onFieldFiltersChange(newFilters)
        if (editingIndex === index) setEditingIndex(null)
    }, [fieldFilters, onFieldFiltersChange, editingIndex])

    // Clear all filters
    const clearAll = useCallback(() => {
        onFieldFiltersChange([])
        setEditingIndex(null)
    }, [onFieldFiltersChange])

    // No-value operators
    const isNoValueOp = (op) => ['is_empty', 'is_not_empty'].includes(op)
    const isBetweenOp = (op) => op === 'between'

    // Check if a field is a classification field
    const isClassificationField = (fieldId) => fieldId && fieldId.startsWith('classif:')
    const isBooleanField = (fieldType) => ['boolean', 'checkbox', 'switch', 'toggle'].includes(String(fieldType || '').toLowerCase())

    // Get classification options for a field
    const getClassificationOptions = (fieldId) => {
        return classificationOptionsMap[fieldId] || []
    }

    // Get display value for classification filter
    const getClassifDisplayValue = (fieldId, value) => {
        const options = getClassificationOptions(fieldId)
        const opt = options.find(o => o.id === value || o.label === value)
        return opt ? opt.label : value
    }

    return (
        <div className="adv-filters-container">
            {/* Section header */}
            <button
                type="button"
                className="adv-filters-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="adv-filters-header-left">
                    <svg viewBox="0 0 24 24" fill="none" className="adv-filters-header-icon">
                        <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Filtres avancés</span>
                    {fieldFilters.length > 0 && (
                        <span className="adv-filters-count">{fieldFilters.length}</span>
                    )}
                </div>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`adv-filters-chevron ${isExpanded ? 'adv-filters-chevron--open' : ''}`}
                >
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {isExpanded && (
                <div className="adv-filters-body">
                    {/* Active filter conditions */}
                    {fieldFilters.map((filter, index) => {
                        const column = filterableColumns.find(c => c.id === filter.fieldId)
                        const availableOps = getOperatorsForType(filter.fieldType)
                        const isEditing = editingIndex === index
                        const isClassif = isClassificationField(filter.fieldId)
                        const classifOptions = isClassif ? getClassificationOptions(filter.fieldId) : []
                        const currentFilterLogic = filter.logic || 'AND'

                        return (
                            <React.Fragment key={index}>
                                {/* AND/OR connector between filters — clickable to toggle */}
                                {index > 0 && (
                                    <div className="adv-filter-connector">
                                        <span className="adv-filter-connector-line"></span>
                                        <button
                                            type="button"
                                            className={`adv-filter-connector-badge ${currentFilterLogic === 'OR' ? 'adv-filter-connector-badge--or' : ''}`}
                                            onClick={() => {
                                                const newLogic = currentFilterLogic === 'AND' ? 'OR' : 'AND'
                                                updateFilter(index, { logic: newLogic })
                                            }}
                                            title={`Cliquez pour basculer entre ET/OU`}
                                        >
                                            {currentFilterLogic === 'OR' ? 'OU' : 'ET'}
                                        </button>
                                        <span className="adv-filter-connector-line"></span>
                                    </div>
                                )}
                                <div
                                    className={`adv-filter-pill ${isEditing ? 'adv-filter-pill--editing' : ''}`}
                                >
                                    {/* Compact view */}
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            className="adv-filter-pill-summary"
                                            onClick={() => setEditingIndex(index)}
                                        >
                                            <span className="adv-filter-pill-field">{filter.fieldName}</span>
                                            <span className="adv-filter-pill-op">{OPERATORS[filter.operator]?.label || filter.operator}</span>
                                            {!isNoValueOp(filter.operator) && (
                                                <span className="adv-filter-pill-value">
                                                    {isBetweenOp(filter.operator)
                                                        ? `${filter.value || '?'} – ${filter.value2 || '?'}`
                                                        : (isClassif ? getClassifDisplayValue(filter.fieldId, filter.value) : (filter.value || '...'))}
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="adv-filter-pill-remove"
                                                onClick={(e) => { e.stopPropagation(); removeFilter(index) }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </button>
                                    ) : (
                                        /* Expanded editing view */
                                        <div className="adv-filter-edit">
                                            {/* Field selector */}
                                            <div className="adv-filter-row">
                                                <label className="adv-filter-label">Champ</label>
                                                <select
                                                    value={filter.fieldId}
                                                    onChange={(e) => {
                                                        const newCol = filterableColumns.find(c => c.id === e.target.value)
                                                        if (newCol) {
                                                            const newOps = getOperatorsForType(newCol.type)
                                                            const newIsClassif = e.target.value.startsWith('classif:')
                                                            const defaultOp = newIsClassif
                                                                ? (newOps.find(o => o.key === 'equals') || newOps[0])
                                                                : (newOps.find(o => o.key === filter.operator) || newOps[0])
                                                            updateFilter(index, {
                                                                fieldId: newCol.id,
                                                                fieldName: newCol.name,
                                                                fieldType: newCol.type || 'text',
                                                                operator: defaultOp.key,
                                                                value: '',
                                                                value2: ''
                                                            })
                                                        }
                                                    }}
                                                    className="adv-filter-select"
                                                >
                                                    {filterableColumns.map(col => (
                                                        <option key={col.id} value={col.id}>{col.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Operator selector */}
                                            <div className="adv-filter-row">
                                                <label className="adv-filter-label">Condition</label>
                                                <select
                                                    value={filter.operator}
                                                    onChange={(e) => updateFilter(index, {
                                                        operator: e.target.value,
                                                        value: isNoValueOp(e.target.value) ? '' : filter.value,
                                                        value2: ''
                                                    })}
                                                    className="adv-filter-select"
                                                >
                                                    {availableOps.map(op => (
                                                        <option key={op.key} value={op.key}>{op.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Value input — classification dropdown OR text input */}
                                            {!isNoValueOp(filter.operator) && (
                                                <div className="adv-filter-row">
                                                    <label className="adv-filter-label">
                                                        {isBetweenOp(filter.operator) ? 'Valeur min' : 'Valeur'}
                                                    </label>
                                                    {isClassif && classifOptions.length > 0 ? (
                                                        /* Classification: show options as a dropdown */
                                                        <select
                                                            value={filter.value}
                                                            onChange={(e) => updateFilter(index, { value: e.target.value })}
                                                            className="adv-filter-select"
                                                        >
                                                            <option value="">Sélectionnez...</option>
                                                            {classifOptions.map(opt => (
                                                                <option key={opt.id} value={opt.label}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : isBooleanField(filter.fieldType) ? (
                                                        <select
                                                            value={String(filter.value ?? '')}
                                                            onChange={(e) => updateFilter(index, { value: e.target.value })}
                                                            className="adv-filter-select"
                                                        >
                                                            <option value="">Sélectionnez...</option>
                                                            <option value="true">Oui</option>
                                                            <option value="false">Non</option>
                                                        </select>
                                                    ) : (
                                                        /* Other fields: text/number/date input */
                                                        <input
                                                            type={getInputType(filter.fieldType)}
                                                            value={filter.value}
                                                            onChange={(e) => updateFilter(index, { value: e.target.value })}
                                                            placeholder="Saisir une valeur..."
                                                            className="adv-filter-input"
                                                            autoFocus
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Second value for "between" */}
                                            {isBetweenOp(filter.operator) && (
                                                <div className="adv-filter-row">
                                                    <label className="adv-filter-label">Valeur max</label>
                                                    <input
                                                        type={getInputType(filter.fieldType)}
                                                        value={filter.value2 || ''}
                                                        onChange={(e) => updateFilter(index, { value2: e.target.value })}
                                                        placeholder="Saisir une valeur max..."
                                                        className="adv-filter-input"
                                                    />
                                                </div>
                                            )}

                                            {/* Done button */}
                                            <div className="adv-filter-row adv-filter-row--actions">
                                                <button
                                                    type="button"
                                                    className="adv-filter-btn-done"
                                                    onClick={() => setEditingIndex(null)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                                                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    OK
                                                </button>
                                                <button
                                                    type="button"
                                                    className="adv-filter-btn-delete"
                                                    onClick={() => removeFilter(index)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                                                        <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                        <path d="M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        )
                    })}

                    {/* Add filter button + field selector */}
                    <div className="adv-filter-add-row" ref={fieldSelectorRef}>
                        <button
                            type="button"
                            className="adv-filter-add-btn"
                            onClick={() => setShowFieldSelector(!showFieldSelector)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Ajouter un filtre
                        </button>

                        {showFieldSelector && (
                            <div className="adv-filter-field-dropdown">
                                <div className="adv-filter-field-dropdown-title">Choisir un champ</div>
                                {filterableColumns.map(col => (
                                    <button
                                        key={col.id}
                                        type="button"
                                        className="adv-filter-field-option"
                                        onClick={() => addFilter(col.id)}
                                    >
                                        <span className="adv-filter-field-type-badge">
                                            {getFieldTypeIcon(col.type)}
                                        </span>
                                        {col.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear all */}
                    {fieldFilters.length > 0 && (
                        <button
                            type="button"
                            className="adv-filter-clear"
                            onClick={clearAll}
                        >
                            Effacer tous les filtres
                        </button>
                    )}
                </div>
            )}

            <style>{`
                /* ── Advanced Filters Container ──────────────────── */
                .adv-filters-container {
                    border-top: 1px solid #e0e6ed;
                    margin-top: 4px;
                }
                .dark .adv-filters-container {
                    border-color: #1b2e4b;
                }

                .adv-filters-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 10px 4px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: #888ea8;
                    transition: color 0.15s;
                }
                .adv-filters-header:hover {
                    color: var(--primary, #4361ee);
                }
                .adv-filters-header-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .adv-filters-header-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }
                .adv-filters-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    border-radius: 9px;
                    font-size: 10px;
                    font-weight: 700;
                    background: var(--primary, #4361ee);
                    color: #fff;
                }
                .adv-filters-chevron {
                    width: 14px;
                    height: 14px;
                    transition: transform 0.2s ease;
                }
                .adv-filters-chevron--open {
                    transform: rotate(90deg);
                }

                .adv-filters-body {
                    padding: 0 2px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }


                /* ── Filter Connector (AND/OR between pills) ──────────────────── */
                .adv-filter-connector {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 4px;
                }
                .adv-filter-connector-line {
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }
                .dark .adv-filter-connector-line {
                    background: rgba(255,255,255,0.08);
                }
                .adv-filter-connector-badge {
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    color: var(--primary, #4361ee);
                    background: rgba(67, 97, 238, 0.08);
                    padding: 1px 10px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    border: 1.5px solid rgba(67, 97, 238, 0.2);
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .adv-filter-connector-badge:hover {
                    background: rgba(67, 97, 238, 0.18);
                    border-color: var(--primary, #4361ee);
                    transform: scale(1.05);
                }
                .adv-filter-connector-badge--or {
                    color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                    border-color: rgba(245, 158, 11, 0.25);
                }
                .adv-filter-connector-badge--or:hover {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: #f59e0b;
                }

                /* ── Filter Pill (compact view) ──────────────────── */
                .adv-filter-pill {
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }
                .adv-filter-pill-summary {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    width: 100%;
                    padding: 6px 8px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                    cursor: pointer;
                    font-size: 11.5px;
                    transition: all 0.15s;
                    text-align: left;
                }
                .dark .adv-filter-pill-summary {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.08);
                }
                .adv-filter-pill-summary:hover {
                    border-color: var(--primary, #4361ee);
                    background: rgba(67, 97, 238, 0.04);
                }
                .adv-filter-pill-field {
                    font-weight: 600;
                    color: #334155;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 80px;
                }
                .dark .adv-filter-pill-field {
                    color: #e2e8f0;
                }
                .adv-filter-pill-op {
                    color: var(--primary, #4361ee);
                    font-weight: 500;
                    white-space: nowrap;
                    font-size: 10.5px;
                }
                .adv-filter-pill-value {
                    color: #64748b;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 80px;
                }
                .dark .adv-filter-pill-value {
                    color: #94a3b8;
                }
                .adv-filter-pill-remove {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: none;
                    background: none;
                    color: #94a3b8;
                    cursor: pointer;
                    margin-left: auto;
                    flex-shrink: 0;
                    transition: all 0.15s;
                }
                .adv-filter-pill-remove:hover {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .dark .adv-filter-pill-remove:hover {
                    background: rgba(220,38,38,0.15);
                    color: #ef4444;
                }

                /* ── Filter Edit (expanded) ──────────────────── */
                .adv-filter-pill--editing {
                    border: 1.5px solid var(--primary, #4361ee);
                    border-radius: 10px;
                    background: #f8fafc;
                    box-shadow: 0 2px 8px rgba(67, 97, 238, 0.08);
                }
                .dark .adv-filter-pill--editing {
                    background: rgba(255,255,255,0.03);
                    border-color: var(--primary, #4361ee);
                }
                .adv-filter-edit {
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .adv-filter-row {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .adv-filter-row--actions {
                    flex-direction: row;
                    justify-content: flex-end;
                    gap: 6px;
                    margin-top: 2px;
                }
                .adv-filter-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .dark .adv-filter-label {
                    color: #64748b;
                }
                .adv-filter-select {
                    width: 100%;
                    padding: 6px 8px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #334155;
                    background: #fff;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.15s;
                }
                .dark .adv-filter-select {
                    background: #1b2e4b;
                    border-color: rgba(255,255,255,0.1);
                    color: #e2e8f0;
                }
                .adv-filter-select:focus {
                    border-color: var(--primary, #4361ee);
                }
                .adv-filter-input {
                    width: 100%;
                    padding: 6px 8px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #334155;
                    background: #fff;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .dark .adv-filter-input {
                    background: #1b2e4b;
                    border-color: rgba(255,255,255,0.1);
                    color: #e2e8f0;
                }
                .adv-filter-input:focus {
                    border-color: var(--primary, #4361ee);
                }
                .adv-filter-input::placeholder {
                    color: #94a3b8;
                }

                .adv-filter-btn-done {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 12px;
                    border-radius: 6px;
                    border: none;
                    background: var(--primary, #4361ee);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .adv-filter-btn-done:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                .adv-filter-btn-delete {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 8px;
                    border-radius: 6px;
                    border: none;
                    background: #fee2e2;
                    color: #dc2626;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .dark .adv-filter-btn-delete {
                    background: rgba(220,38,38,0.12);
                    color: #ef4444;
                }
                .adv-filter-btn-delete:hover {
                    background: #fecaca;
                }

                /* ── Add Filter Button ──────────────────── */
                .adv-filter-add-row {
                    position: relative;
                }
                .adv-filter-add-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border: 1.5px dashed #cbd5e1;
                    border-radius: 8px;
                    background: transparent;
                    color: #94a3b8;
                    font-size: 11.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                    width: 100%;
                    justify-content: center;
                }
                .adv-filter-add-btn:hover {
                    border-color: var(--primary, #4361ee);
                    color: var(--primary, #4361ee);
                    background: rgba(67,97,238,0.04);
                }
                .dark .adv-filter-add-btn {
                    border-color: #475569;
                    color: #64748b;
                }
                .dark .adv-filter-add-btn:hover {
                    border-color: var(--primary, #4361ee);
                    color: var(--primary, #4361ee);
                }

                /* ── Field Selector Dropdown ──────────────── */
                .adv-filter-field-dropdown {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: calc(100% + 4px);
                    z-index: 100;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 4px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    max-height: 240px;
                    overflow-y: auto;
                    animation: advFilterDropIn 0.12s ease-out;
                }
                .dark .adv-filter-field-dropdown {
                    background: #0e1726;
                    border-color: rgba(255,255,255,0.1);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                }
                @keyframes advFilterDropIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .adv-filter-field-dropdown-title {
                    padding: 6px 10px 4px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: #94a3b8;
                }
                .adv-filter-field-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 7px 10px;
                    border: none;
                    background: none;
                    font-size: 12px;
                    color: #475569;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.12s;
                    text-align: left;
                }
                .dark .adv-filter-field-option {
                    color: #cbd5e1;
                }
                .adv-filter-field-option:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .dark .adv-filter-field-option:hover {
                    background: rgba(255,255,255,0.06);
                    color: #f1f5f9;
                }

                .adv-filter-field-type-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    background: #f1f5f9;
                    font-size: 10px;
                    color: #64748b;
                    flex-shrink: 0;
                }
                .dark .adv-filter-field-type-badge {
                    background: rgba(255,255,255,0.06);
                    color: #94a3b8;
                }

                /* ── Clear All ──────────────────── */
                .adv-filter-clear {
                    display: block;
                    width: 100%;
                    padding: 5px 0;
                    border: none;
                    background: none;
                    color: #94a3b8;
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: center;
                    transition: color 0.15s;
                }
                .adv-filter-clear:hover {
                    color: #dc2626;
                }
            `}</style>
        </div>
    )
}

// Helper to show field type icon/emoji
function getFieldTypeIcon(type) {
    const icons = {
        text: 'Aa',
        title: 'T',
        email: '@',
        phone: '☎',
        url: '🔗',
        number: '#',
        currency: '$',
        percent: '%',
        date: '📅',
        datetime: '🕐',
        textarea: '¶',
        select: '☰',
        relation: '↗',
        classification: '●',
    }
    return icons[type] || 'Aa'
}
