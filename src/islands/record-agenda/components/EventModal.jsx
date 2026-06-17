/**
 * EventModal — Create/Edit event modal
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'

const EVENT_TYPES = [
    { value: 'consultation', label: 'Consultation', color: '#4361ee' },
    { value: 'reunion', label: 'Réunion', color: '#8b5cf6' },
    { value: 'rappel', label: 'Rappel', color: '#f59e0b' },
    { value: 'tache', label: 'Tâche', color: '#10b981' },
    { value: 'personnel', label: 'Personnel', color: '#ec4899' },
    { value: 'autre', label: 'Autre', color: '#6b7280' },
]

const EVENT_TAG_FALLBACK_OPTIONS = [
    { label: 'Important', value: 'Important', color: '#ef4444' },
    { label: 'Date limite', value: 'Date limite', color: '#f59e0b' },
    { label: 'Risque amende', value: 'Risque amende', color: '#dc2626' },
]

const DEFAULT_CREATED_OPTION_COLOR = '#64748b'
const CREATED_OPTION_COLORS = ['#4361ee', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#64748b']
const UPCOMING_WIDGET_FIELD = 'widget_prochains_evenements'
const IMPORTANT_DATE_WIDGET_FIELD = 'widget_date_importante'

export default function EventModal({
    isOpen, onClose, event, entityData, prefillDate,
    onCreate, onUpdate, onDelete,
    getCustomFieldValue, getStatusInfo, accountNumber
}) {
    const [form, setForm] = useState({
        title: '',
        date: '',
        endDate: '',
        duration: 30,
        type: 'consultation',
        tags: [],
        lieu: '',
        notes: '',
        statusOptionId: '',
        showInUpcomingWidget: true,
        isImportantDate: false,
    })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')
    const [createdOptions, setCreatedOptions] = useState({ type: [], status: [], tags: [] })
    const [deletedOptionTokens, setDeletedOptionTokens] = useState({ type: [], status: [], tags: [] })

    const isEditing = !!event

    // Populate form when editing
    useEffect(() => {
        if (!isOpen) return
        setFormError('')

        if (event) {
            const status = getStatusInfo(event)
            const statusCv = (event.classificationValues || []).find(
                cv => cv.classificationId?.toString() === entityData?.statusClassification?._id?.toString()
            )

            const eventTags = normalizeTagValues(getCustomFieldValue(event, 'tags_evenement'))

            setForm({
                title: event.title || '',
                date: event.date ? toLocalDateTime(new Date(event.date)) : '',
                endDate: event.end_date ? toLocalDateTime(new Date(event.end_date)) : '',
                duration: getCustomFieldValue(event, 'duree_evenement') || 30,
                type: getCustomFieldValue(event, 'type_evenement') || 'consultation',
                tags: eventTags,
                lieu: getCustomFieldValue(event, 'lieu_evenement') || '',
                notes: getCustomFieldValue(event, 'notes_evenement') || '',
                statusOptionId: statusCv?.optionId?.toString() || '',
                showInUpcomingWidget: normalizeBooleanValue(getCustomFieldValue(event, UPCOMING_WIDGET_FIELD), true),
                isImportantDate: normalizeBooleanValue(
                    getCustomFieldValue(event, IMPORTANT_DATE_WIDGET_FIELD),
                    eventTags.some(tag => tag.toLowerCase() === 'date importante')
                ),
            })
        } else {
            // New event
            let defaultDate = ''
            if (prefillDate) {
                // prefillDate could be "2026-05-15" or "2026-05-15T10:00:00"
                const d = new Date(prefillDate)
                if (isNaN(d.getTime())) {
                    defaultDate = prefillDate + 'T09:00'
                } else {
                    // Round to nearest 5 minutes
                    d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0)
                    defaultDate = toLocalDateTime(d)
                }
            } else {
                const now = new Date()
                now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0)
                defaultDate = toLocalDateTime(now)
            }

            // Default status = first option (Planifié)
            const defaultStatusId = entityData?.statusClassification?.options?.[0]?._id?.toString() || ''

            setForm({
                title: '',
                date: defaultDate,
                endDate: '',
                duration: 30,
                type: 'consultation',
                tags: [],
                lieu: '',
                notes: '',
                statusOptionId: defaultStatusId,
                showInUpcomingWidget: true,
                isImportantDate: false,
            })
        }
    }, [isOpen, event, prefillDate, entityData, getCustomFieldValue, getStatusInfo])

    const handleChange = useCallback((field, value) => {
        setFormError('')
        setForm(prev => ({ ...prev, [field]: value }))
    }, [])

    const handleSave = useCallback(async () => {
        if (!form.title.trim()) return
        setSaving(true)
        setFormError('')

        try {
            const startDate = parseDateTime(form.date, 'Date')
            let endDate = form.endDate ? parseDateTime(form.endDate, 'Date de fin').toISOString() : undefined

            // Compute endDate from date + duration if not explicitly set
            if (!endDate && startDate && form.duration) {
                const end = new Date(startDate.getTime() + (parseInt(form.duration) || 30) * 60000)
                endDate = end.toISOString()
            }

            const payload = {
                title: form.title.trim(),
                date: startDate ? startDate.toISOString() : undefined,
                endDate,
                duration: parseInt(form.duration) || 30,
                type: form.type,
                tags: normalizeTagValues(form.tags),
                lieu: form.lieu,
                notes: form.notes,
                statusOptionId: form.statusOptionId || undefined,
                showInUpcomingWidget: !!form.showInUpcomingWidget,
                isImportantDate: !!form.isImportantDate,
            }

            if (isEditing) {
                await onUpdate(event._id.toString(), payload)
            } else {
                await onCreate(payload)
            }
        } catch (err) {
            console.error('[EventModal] Save error:', err)
            setFormError(err.message || "Impossible d'enregistrer cet evenement.")
        } finally {
            setSaving(false)
        }
    }, [form, isEditing, event, onCreate, onUpdate])

    const typeField = getEventField(entityData, 'type_evenement')
    const tagField = getEventField(entityData, 'tags_evenement')
    const statusClassification = entityData?.statusClassification || null
    const statusClassificationId = statusClassification?._id?.toString?.() || statusClassification?._id || ''

    const typeOptions = mergePickerOptions([
        EVENT_TYPES,
        typeField?.type_config?.options || [],
        createdOptions.type,
        form.type ? [{ label: form.type, value: form.type, color: DEFAULT_CREATED_OPTION_COLOR }] : [],
    ], deletedOptionTokens.type)
    const statusOptions = mergePickerOptions([
        (statusClassification?.options || []).map(normalizeStatusOption),
        createdOptions.status,
        form.statusOptionId ? [{ label: 'Statut', value: form.statusOptionId, color: DEFAULT_CREATED_OPTION_COLOR }] : [],
    ], deletedOptionTokens.status)
    const tagOptions = mergePickerOptions([
        EVENT_TAG_FALLBACK_OPTIONS,
        tagField?.type_config?.options || [],
        createdOptions.tags,
        normalizeTagValues(form.tags).map(tag => ({ label: tag, value: tag })),
    ], deletedOptionTokens.tags)

    const rememberCreatedOption = (key, option) => {
        setCreatedOptions(prev => ({
            ...prev,
            [key]: mergePickerOptions([prev[key] || [], [option]])
        }))
    }

    const rememberDeletedOption = (key, option) => {
        setDeletedOptionTokens(prev => ({
            ...prev,
            [key]: mergeDeletedTokens(prev[key] || [], option)
        }))
    }

    const handleCreateFieldOption = async (key, field, label) => {
        const option = { label, value: label, color: colorForOptionLabel(label) }
        const fieldId = field?._id?.toString?.() || field?._id

        if (!accountNumber || !fieldId) {
            rememberCreatedOption(key, option)
            return option
        }

        const res = await fetch(`/account/${accountNumber}/field-template/api/${fieldId}/add-option`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(option)
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.success) throw new Error(data.error || 'Création impossible')

        const created = normalizePickerOption(data.option || option)
        rememberCreatedOption(key, created)
        return created
    }

    const handleDeleteFieldOption = async (key, field, option) => {
        const normalized = normalizePickerOption(option)
        if (!normalized.value) return false
        if (!confirm(`Supprimer l'option "${normalized.label}" ?`)) return false

        const fieldId = field?._id?.toString?.() || field?._id
        if (accountNumber && fieldId) {
            const res = await fetch(`/account/${accountNumber}/field-template/api/${fieldId}/delete-option`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ value: normalized.value, label: normalized.label })
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data.success) throw new Error(data.error || 'Suppression impossible')
        }

        rememberDeletedOption(key, normalized)
        if (key === 'type' && optionMatchesValue(normalized, form.type)) handleChange('type', '')
        if (key === 'tags') {
            handleChange('tags', normalizeTagValues(form.tags).filter(tag => !optionMatchesValue(normalized, tag)))
        }
        return true
    }

    const handleCreateStatusOption = async (label) => {
        const option = { label, value: label, color: colorForOptionLabel(label) }
        if (!accountNumber || !statusClassificationId) {
            rememberCreatedOption('status', option)
            return option
        }

        const res = await fetch(`/account/${accountNumber}/classification/api/fast-add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ classificationId: statusClassificationId, label, color: option.color })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.success) throw new Error(data.error || 'Création impossible')

        const created = normalizeStatusOption(data.option || option)
        rememberCreatedOption('status', created)
        return created
    }

    const handleDeleteStatusOption = async (option) => {
        const normalized = normalizePickerOption(option)
        if (!normalized.value) return false
        if (!confirm(`Supprimer le statut "${normalized.label}" ?`)) return false

        if (accountNumber && statusClassificationId) {
            const res = await fetch(`/account/${accountNumber}/classification/api/delete-option`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ classificationId: statusClassificationId, optionId: normalized.value })
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data.success) throw new Error(data.error || 'Suppression impossible')
        }

        rememberDeletedOption('status', normalized)
        if (String(form.statusOptionId || '') === String(normalized.value || '')) handleChange('statusOptionId', '')
        return true
    }

    if (!isOpen) return null

    return (
        <div className="ra-modal-overlay" onClick={onClose}>
            <div className="ra-modal" onClick={e => e.stopPropagation()}>
                <div className="ra-modal-header">
                    <div className="ra-modal-header-left">
                        <div className="ra-modal-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <h3>{isEditing ? 'Modifier l\'événement' : 'Nouvel événement'}</h3>
                    </div>
                    <button className="ra-modal-close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="ra-modal-body">
                    {/* Title */}
                    <div className="ra-field">
                        <label className="ra-label">Titre</label>
                        <input
                            type="text"
                            className="ra-input"
                            placeholder="Ex: Consultation de suivi..."
                            value={form.title}
                            onChange={e => handleChange('title', e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Date & Duration row */}
                    <div className="ra-field-row">
                        <div className="ra-field" style={{ flex: 1 }}>
                            <label className="ra-label">Date & heure</label>
                            <input
                                type="datetime-local"
                                className="ra-input"
                                step="300"
                                value={form.date}
                                onChange={e => handleChange('date', e.target.value)}
                            />
                        </div>
                        <div className="ra-field" style={{ width: 100 }}>
                            <label className="ra-label">Durée (min)</label>
                            <input
                                type="number"
                                className="ra-input"
                                value={form.duration}
                                onChange={e => handleChange('duration', e.target.value)}
                                min="5" max="480" step="5"
                            />
                        </div>
                    </div>

                    {/* Type & Status row */}
                    <div className="ra-field">
                        <label className="ra-label">Type</label>
                        <EventOptionSelect
                            value={form.type}
                            options={typeOptions}
                            onChange={next => handleChange('type', next)}
                            onCreateOption={label => handleCreateFieldOption('type', typeField, label)}
                            onDeleteOption={option => handleDeleteFieldOption('type', typeField, option)}
                            placeholder="Rechercher ou créer un type..."
                        />
                    </div>

                    {/* Status */}
                    {statusClassificationId && (
                        <div className="ra-field">
                            <label className="ra-label">Statut</label>
                            <EventOptionSelect
                                value={form.statusOptionId}
                                options={statusOptions}
                                onChange={next => handleChange('statusOptionId', next)}
                                onCreateOption={handleCreateStatusOption}
                                onDeleteOption={handleDeleteStatusOption}
                                placeholder="Rechercher ou créer un statut..."
                            />
                        </div>
                    )}

                    {/* Tags */}
                    <div className="ra-field">
                        <label className="ra-label">Étiquettes</label>
                        <EventOptionSelect
                            multiple
                            value={form.tags}
                            options={tagOptions}
                            onChange={next => handleChange('tags', next)}
                            onCreateOption={label => handleCreateFieldOption('tags', tagField, label)}
                            onDeleteOption={option => handleDeleteFieldOption('tags', tagField, option)}
                            placeholder="Ajouter..."
                        />
                    </div>

                    {/* Widget visibility */}
                    <div className="ra-field">
                        <label className="ra-label">Widget</label>
                        <div className="ra-widget-switches">
                            <label className={`ra-widget-switch ${form.showInUpcomingWidget ? 'active' : ''}`}>
                                <span className="ra-widget-switch-copy">
                                    <strong>Prochains événements</strong>
                                    <small>Afficher dans le widget agenda</small>
                                </span>
                                <span className="ra-switch">
                                    <input
                                        type="checkbox"
                                        checked={!!form.showInUpcomingWidget}
                                        onChange={event => handleChange('showInUpcomingWidget', event.target.checked)}
                                    />
                                    <span />
                                </span>
                            </label>
                            <label className={`ra-widget-switch ${form.isImportantDate ? 'active' : ''}`}>
                                <span className="ra-widget-switch-copy">
                                    <strong>Date importante</strong>
                                    <small>Afficher dans le widget dates importantes</small>
                                </span>
                                <span className="ra-switch">
                                    <input
                                        type="checkbox"
                                        checked={!!form.isImportantDate}
                                        onChange={event => handleChange('isImportantDate', event.target.checked)}
                                    />
                                    <span />
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="ra-field">
                        <label className="ra-label">Lieu</label>
                        <input
                            type="text"
                            className="ra-input"
                            placeholder="Cabinet, Salle A, Domicile..."
                            value={form.lieu}
                            onChange={e => handleChange('lieu', e.target.value)}
                        />
                    </div>

                    {/* Notes */}
                    <div className="ra-field">
                        <label className="ra-label">Notes</label>
                        <textarea
                            className="ra-input ra-textarea"
                            placeholder="Notes additionnelles..."
                            rows={3}
                            value={form.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                        />
                    </div>

                    {formError && (
                        <div className="ra-modal-error" role="alert">
                            {formError}
                        </div>
                    )}
                </div>

                <div className="ra-modal-footer">
                    {isEditing && (
                        <button
                            className="ra-delete-btn"
                            onClick={() => onDelete(event._id.toString())}
                            type="button"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Supprimer
                        </button>
                    )}
                    <div className="ra-modal-footer-right">
                        <button className="ra-cancel-btn" onClick={onClose} type="button">Annuler</button>
                        <button
                            className="ra-save-btn"
                            onClick={handleSave}
                            disabled={saving || !form.title.trim()}
                            type="button"
                        >
                            {saving ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer')}
                        </button>
                    </div>
                </div>
            </div>

            <style>{getModalStyles()}</style>
        </div>
    )
}

function EventOptionSelect({
    value,
    options,
    onChange,
    onCreateOption,
    onDeleteOption,
    multiple = false,
    placeholder = 'Ajouter...'
}) {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [contextMenu, setContextMenu] = useState(null)
    const rootRef = useRef(null)
    const inputRef = useRef(null)

    const selectedValues = useMemo(() => {
        if (multiple) return normalizeOptionValues(value)
        const token = value === undefined || value === null ? '' : String(value).trim()
        return token ? [token] : []
    }, [multiple, value])
    const allOptions = useMemo(() => mergePickerOptions([
        options,
        selectedValues.map(item => ({ label: item, value: item })),
    ]), [options, selectedValues])

    const selectedOptions = useMemo(() => {
        return selectedValues.map(item => {
            return allOptions.find(opt => optionMatchesValue(opt, item)) || { label: item, value: item, color: DEFAULT_CREATED_OPTION_COLOR }
        })
    }, [allOptions, selectedValues])

    const query = search.trim().toLowerCase()
    const filteredOptions = useMemo(() => {
        return allOptions
            .filter(opt => !selectedValues.some(item => optionMatchesValue(opt, item)))
            .filter(opt => {
                if (!query) return true
                return String(opt.label || '').toLowerCase().includes(query) || String(opt.value || '').toLowerCase().includes(query)
            })
            .slice(0, 8)
    }, [allOptions, selectedValues, query])

    const hasExactMatch = useMemo(() => {
        if (!query) return false
        return allOptions.some(opt =>
            String(opt.label || '').trim().toLowerCase() === query ||
            String(opt.value || '').trim().toLowerCase() === query
        )
    }, [allOptions, query])

    useEffect(() => {
        const onDown = (event) => {
            if (!rootRef.current || rootRef.current.contains(event.target)) return
            setOpen(false)
            setContextMenu(null)
            setSearch('')
        }
        const onEscape = (event) => {
            if (event.key === 'Escape') {
                setOpen(false)
                setContextMenu(null)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onEscape)
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onEscape)
        }
    }, [])

    const selectOption = useCallback((option) => {
        const opt = normalizePickerOption(option)
        if (!opt.value) return
        if (multiple) {
            const exists = selectedValues.some(item => item.toLowerCase() === String(opt.value).toLowerCase())
            if (!exists) onChange([...selectedValues, opt.value])
        } else {
            onChange(opt.value)
            setOpen(false)
        }
        setSearch('')
        setContextMenu(null)
        if (multiple) setOpen(true)
        requestAnimationFrame(() => inputRef.current?.focus())
    }, [multiple, onChange, selectedValues])

    const removeValue = useCallback((item) => {
        if (multiple) {
            onChange(selectedValues.filter(value => value.toLowerCase() !== String(item).toLowerCase()))
        } else {
            onChange('')
        }
        setContextMenu(null)
        requestAnimationFrame(() => inputRef.current?.focus())
    }, [multiple, onChange, selectedValues])

    const createOption = useCallback(async () => {
        const label = search.trim()
        if (!label || hasExactMatch || creating) return
        setCreating(true)
        try {
            const created = await onCreateOption(label)
            selectOption(created || { label, value: label })
        } catch (err) {
            console.error('[EventOptionSelect] Create option error:', err)
            window.showMessage ? window.showMessage(err.message || 'Création impossible', 'danger') : alert(err.message || 'Création impossible')
        } finally {
            setCreating(false)
        }
    }, [creating, hasExactMatch, onCreateOption, search, selectOption])

    const openOptionContextMenu = useCallback((event, option) => {
        if (!onDeleteOption) return
        event.preventDefault()
        event.stopPropagation()
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            option: normalizePickerOption(option)
        })
    }, [onDeleteOption])

    const deleteContextOption = useCallback(async () => {
        if (!contextMenu?.option || !onDeleteOption || deleting) return
        setDeleting(true)
        try {
            const deleted = await onDeleteOption(contextMenu.option)
            if (deleted === false) {
                setContextMenu(null)
                return
            }
            removeValue(contextMenu.option.value)
            setContextMenu(null)
            setOpen(false)
        } catch (err) {
            console.error('[EventOptionSelect] Delete option error:', err)
            window.showMessage ? window.showMessage(err.message || 'Suppression impossible', 'danger') : alert(err.message || 'Suppression impossible')
        } finally {
            setDeleting(false)
        }
    }, [contextMenu, deleting, onDeleteOption, removeValue])

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            if (filteredOptions.length > 0) selectOption(filteredOptions[0])
            else createOption()
        } else if (event.key === 'Backspace' && !search && selectedValues.length > 0) {
            removeValue(selectedValues[selectedValues.length - 1])
        } else if (event.key === 'Escape') {
            setOpen(false)
            setContextMenu(null)
            setSearch('')
        }
    }

    return (
        <div className="ra-option-picker" ref={rootRef}>
            <div className={`ra-option-control ${open ? 'open' : ''}`} onClick={() => { setOpen(true); inputRef.current?.focus() }}>
                {selectedOptions.map(option => (
                    <span
                        key={option.value}
                        className="ra-option-pill"
                        onContextMenu={event => openOptionContextMenu(event, option)}
                        title={onDeleteOption ? 'Clic droit pour supprimer cette option' : undefined}
                        style={{
                            '--option-c': option.color || DEFAULT_CREATED_OPTION_COLOR,
                            background: `${option.color || DEFAULT_CREATED_OPTION_COLOR}12`,
                            borderColor: `${option.color || DEFAULT_CREATED_OPTION_COLOR}35`,
                            color: option.color || DEFAULT_CREATED_OPTION_COLOR,
                        }}
                    >
                        <span className="ra-option-dot" style={{ background: option.color || DEFAULT_CREATED_OPTION_COLOR }} />
                        {option.label}
                        <button type="button" onClick={(event) => { event.stopPropagation(); removeValue(option.value) }} aria-label={`Retirer ${option.label}`}>
                            ×
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    className="ra-option-input"
                    value={search}
                    onChange={event => { setSearch(event.target.value); setOpen(true) }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedOptions.length ? 'Ajouter...' : placeholder}
                />
            </div>

            {open && (filteredOptions.length > 0 || (search.trim() && !hasExactMatch)) && (
                <div className="ra-option-menu">
                    {filteredOptions.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            className="ra-option-item"
                            onClick={() => selectOption(option)}
                            onContextMenu={event => openOptionContextMenu(event, option)}
                            title={onDeleteOption ? 'Clic droit pour supprimer cette option' : undefined}
                        >
                            <span className="ra-option-dot" style={{ background: option.color || DEFAULT_CREATED_OPTION_COLOR }} />
                            <span>{option.label}</span>
                        </button>
                    ))}
                    {search.trim() && !hasExactMatch && (
                        <button type="button" className="ra-option-create" onClick={createOption} disabled={creating}>
                            <span>+</span>
                            {creating ? 'Création...' : `Créer "${search.trim()}"`}
                        </button>
                    )}
                </div>
            )}

            {contextMenu && (
                <div className="ra-option-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
                    <button type="button" onClick={deleteContextOption} disabled={deleting}>
                        {deleting ? 'Suppression...' : `Supprimer "${contextMenu.option.label}"`}
                    </button>
                </div>
            )}
        </div>
    )
}

function getEventField(entityData, fieldName) {
    return (entityData?.customFields || []).find(field => field?.name === fieldName) || null
}

function normalizeBooleanValue(value, fallback = false) {
    if (value === undefined || value === null || value === '') return fallback
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0

    const token = String(value).trim().toLowerCase()
    if (['true', '1', 'yes', 'oui', 'on'].includes(token)) return true
    if (['false', '0', 'no', 'non', 'off'].includes(token)) return false

    return fallback
}

function normalizeTagValues(value) {
    return normalizeOptionValues(value)
}

function normalizeOptionValues(value) {
    const raw = Array.isArray(value)
        ? value
        : (typeof value === 'string' ? value.split(',') : [])

    return raw
        .map(item => {
            if (item && typeof item === 'object') return String(item.value || item.label || item.name || '').trim()
            return String(item || '').trim()
        })
        .filter(Boolean)
        .filter((item, idx, arr) => arr.findIndex(other => other.toLowerCase() === item.toLowerCase()) === idx)
}

function normalizePickerOption(option) {
    if (typeof option === 'object' && option) {
        const id = option.id || option._id?.toString?.() || option._id || ''
        const label = String(option.label || option.value || option.name || id || '').trim()
        const value = String(option.value || id || option.label || '').trim()
        return { label, value, color: option.color || DEFAULT_CREATED_OPTION_COLOR, id: String(id || value) }
    }

    const value = String(option || '').trim()
    return { label: value, value, color: DEFAULT_CREATED_OPTION_COLOR, id: value }
}

function normalizeStatusOption(option) {
    const normalized = normalizePickerOption(option)
    const id = option?.id || option?._id?.toString?.() || option?._id || normalized.value
    return {
        ...normalized,
        value: String(id || normalized.value || '').trim(),
        id: String(id || normalized.value || '').trim(),
    }
}

function optionMatchesValue(option, value) {
    const token = String(value || '').trim().toLowerCase()
    return [option.value, option.label, option.id]
        .filter(item => item !== undefined && item !== null)
        .some(item => String(item).trim().toLowerCase() === token)
}

function mergePickerOptions(groups, deletedTokens = []) {
    const merged = []
    const seen = new Set()
    const deleted = new Set((deletedTokens || []).map(token => String(token || '').trim().toLowerCase()).filter(Boolean))

    groups.flat().forEach(option => {
        const normalized = normalizePickerOption(option)
        if (!normalized.value) return
        const optionTokens = [normalized.value, normalized.label, normalized.id]
            .map(token => String(token || '').trim().toLowerCase())
            .filter(Boolean)
        if (optionTokens.some(token => deleted.has(token))) return
        const token = String(normalized.value || normalized.label).toLowerCase()
        if (seen.has(token)) return
        seen.add(token)
        merged.push(normalized)
    })

    return merged
}

function mergeDeletedTokens(tokens, option) {
    const normalized = normalizePickerOption(option)
    const next = new Set((tokens || []).map(token => String(token || '').trim().toLowerCase()).filter(Boolean))
    ;[normalized.value, normalized.label, normalized.id]
        .map(token => String(token || '').trim().toLowerCase())
        .filter(Boolean)
        .forEach(token => next.add(token))
    return [...next]
}

function colorForOptionLabel(label) {
    const text = String(label || '')
    const total = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return CREATED_OPTION_COLORS[total % CREATED_OPTION_COLORS.length] || DEFAULT_CREATED_OPTION_COLOR
}

function toLocalDateTime(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}`
}

function parseDateTime(value, label) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        throw new Error(`${label} invalide.`)
    }
    return date
}

function getModalStyles() {
    return `
.ra-modal-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,.25);
    backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
    animation:raFadeIn .2s ease;
}
.ra-modal {
    background:#fff; border-radius:16px;
    box-shadow:0 20px 60px rgba(0,0,0,.15);
    width:520px; max-width:calc(100vw - 40px);
    max-height:calc(100vh - 40px); overflow-y:auto;
    animation:raSlideUp .3s ease;
}
.dark .ra-modal { background:#0e1726; border:1px solid #253b5c; }

@keyframes raSlideUp {
    from { opacity:0; transform:translateY(20px); }
    to { opacity:1; transform:translateY(0); }
}

.ra-modal-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 24px 0;
}
.ra-modal-header-left { display:flex; align-items:center; gap:10px; }
.ra-modal-icon {
    width:36px; height:36px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, #14b8a618, #14b8a608);
    color:#14b8a6;
}
.ra-modal-header h3 { font-size:16px; font-weight:700; color:#0e1726; margin:0; }
.dark .ra-modal-header h3 { color:#e0e6ed; }

.ra-modal-close {
    width:32px; height:32px; border:none; border-radius:8px;
    background:transparent; color:#9ca3af; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s;
}
.ra-modal-close:hover { background:#f1f5f9; color:#374151; }
.dark .ra-modal-close:hover { background:#1b2e4b; color:#e0e6ed; }

.ra-modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:16px; }

.ra-field { display:flex; flex-direction:column; gap:6px; }
.ra-field-row { display:flex; gap:12px; }

.ra-label { font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
.dark .ra-label { color:#506690; }

.ra-input {
    width:100%; padding:9px 12px; border:1.5px solid #e2e8f0;
    border-radius:8px; font-size:13px; color:#0e1726;
    background:#fff; font-family:inherit; outline:none;
    transition:border-color .2s, box-shadow .2s;
    box-sizing:border-box;
}
.ra-input:focus { border-color:#14b8a6; box-shadow:0 0 0 3px rgba(20,184,166,.08); }
.dark .ra-input { background:#1b2e4b; border-color:#253b5c; color:#e0e6ed; }
.dark .ra-input:focus { border-color:#14b8a6; }
.ra-textarea { resize:vertical; min-height:60px; line-height:1.45; }

.ra-option-picker { position:relative; }
.ra-option-control {
    min-height:42px; width:100%; padding:6px 8px;
    border:1.5px solid #e2e8f0; border-radius:8px;
    background:#fff; display:flex; align-items:center; flex-wrap:wrap; gap:6px;
    cursor:text; transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
}
.ra-option-control.open {
    border-color:#14b8a6;
    box-shadow:0 0 0 3px rgba(20,184,166,.08);
}
.dark .ra-option-control { background:#1b2e4b; border-color:#253b5c; }
.dark .ra-option-control.open { border-color:#14b8a6; }
.ra-option-pill {
    display:inline-flex; align-items:center; gap:5px;
    min-height:25px; padding:3px 8px; border:1px solid;
    border-radius:7px; font-size:12px; font-weight:700; line-height:1.2;
}
.ra-option-pill button {
    width:16px; height:16px; border:0; border-radius:50%;
    background:transparent; color:inherit; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; line-height:1; opacity:.65; padding:0;
}
.ra-option-pill button:hover { opacity:1; background:rgba(15,23,42,.08); }
.ra-option-input {
    flex:1; min-width:130px; border:0; outline:0; background:transparent;
    color:#0e1726; font-size:13px; font-family:inherit; padding:4px 3px;
}
.ra-option-input::placeholder { color:#9ca3af; }
.dark .ra-option-input { color:#e0e6ed; }
.ra-option-menu {
    position:absolute; left:0; right:0; top:calc(100% + 5px); z-index:20;
    background:#fff; border:1px solid #e2e8f0; border-radius:10px;
    box-shadow:0 16px 42px rgba(15,23,42,.14);
    padding:5px; max-height:210px; overflow-y:auto;
}
.dark .ra-option-menu { background:#0e1726; border-color:#253b5c; box-shadow:0 16px 42px rgba(0,0,0,.32); }
.ra-option-item,
.ra-option-create {
    width:100%; border:0; background:transparent; border-radius:8px;
    display:flex; align-items:center; gap:8px; padding:8px 9px;
    color:#334155; font-size:12.5px; font-weight:700;
    cursor:pointer; text-align:left; font-family:inherit;
}
.ra-option-item:hover,
.ra-option-create:hover { background:#f8fafc; }
.dark .ra-option-item,
.dark .ra-option-create { color:#e0e6ed; }
.dark .ra-option-item:hover,
.dark .ra-option-create:hover { background:#1b2e4b; }
.ra-option-dot { width:8px; height:8px; border-radius:50%; flex:none; }
.ra-option-create { color:#14b8a6; border-top:1px solid #f1f5f9; margin-top:3px; }
.dark .ra-option-create { border-top-color:#253b5c; }
.ra-option-create span {
    width:18px; height:18px; border-radius:6px; background:rgba(20,184,166,.12);
    display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800;
}
.ra-option-create:disabled { opacity:.6; cursor:wait; }
.ra-option-context-menu {
    position:fixed; z-index:10020; min-width:180px;
    padding:5px; border-radius:9px; border:1px solid #e2e8f0;
    background:#fff; box-shadow:0 16px 42px rgba(15,23,42,.18);
}
.dark .ra-option-context-menu { background:#0e1726; border-color:#253b5c; box-shadow:0 16px 42px rgba(0,0,0,.34); }
.ra-option-context-menu button {
    width:100%; border:0; border-radius:7px; background:transparent;
    color:#ef4444; cursor:pointer; padding:8px 9px; text-align:left;
    font-size:12px; font-weight:800; font-family:inherit;
}
.ra-option-context-menu button:hover { background:#fef2f2; }
.ra-option-context-menu button:disabled { opacity:.6; cursor:wait; }
.dark .ra-option-context-menu button:hover { background:rgba(127,29,29,.2); }

.ra-widget-switches { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.ra-widget-switch {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    min-width:0; padding:11px 12px; border:1.5px solid #e2e8f0;
    border-radius:10px; background:#fff; cursor:pointer; transition:all .18s;
}
.ra-widget-switch:hover { border-color:#cbd5e1; background:#fbfdff; }
.ra-widget-switch.active { border-color:#14b8a655; background:rgba(20,184,166,.05); }
.dark .ra-widget-switch { background:#1b2e4b; border-color:#253b5c; }
.dark .ra-widget-switch:hover { border-color:#3b4f6f; }
.dark .ra-widget-switch.active { border-color:#14b8a6; background:rgba(20,184,166,.12); }
.ra-widget-switch-copy { display:flex; flex-direction:column; gap:2px; min-width:0; }
.ra-widget-switch-copy strong {
    font-size:12.5px; line-height:1.2; color:#0f172a; font-weight:800;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.ra-widget-switch-copy small {
    font-size:10.5px; line-height:1.25; color:#94a3b8; font-weight:600;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.dark .ra-widget-switch-copy strong { color:#e0e6ed; }
.dark .ra-widget-switch-copy small { color:#64748b; }
.ra-switch { position:relative; width:38px; height:22px; flex:none; }
.ra-switch input { position:absolute; inset:0; opacity:0; cursor:pointer; z-index:2; }
.ra-switch span {
    position:absolute; inset:0; border-radius:999px; background:#cbd5e1;
    transition:background .18s;
}
.ra-switch span::before {
    content:''; position:absolute; width:16px; height:16px; left:3px; top:3px;
    border-radius:999px; background:#fff; box-shadow:0 1px 4px rgba(15,23,42,.2);
    transition:transform .18s;
}
.ra-switch input:checked + span { background:#14b8a6; }
.ra-switch input:checked + span::before { transform:translateX(16px); }
.dark .ra-switch span { background:#506690; }

.ra-modal-error {
    padding:10px 12px; border-radius:9px;
    border:1px solid #fecaca; background:#fff7f7; color:#b91c1c;
    font-size:12px; font-weight:700; line-height:1.4;
}
.dark .ra-modal-error { background:rgba(127,29,29,.18); border-color:#7f1d1d; color:#fecaca; }

.ra-modal-footer {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 24px 20px; gap:12px;
}
.ra-modal-footer-right { display:flex; gap:8px; margin-left:auto; }

.ra-cancel-btn {
    padding:9px 18px; border:1.5px solid #e2e8f0; border-radius:8px;
    background:#fff; color:#6b7280; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-cancel-btn:hover { background:#f9fafb; border-color:#d1d5db; }
.dark .ra-cancel-btn { background:#1b2e4b; border-color:#253b5c; color:#888da8; }

.ra-save-btn {
    padding:9px 20px; border:none; border-radius:8px;
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd);
    color:#fff; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-save-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(20,184,166,.3); }
.ra-save-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

.ra-delete-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:9px 16px; border:1.5px solid #fecaca; border-radius:8px;
    background:#fff; color:#ef4444; font-size:12px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-delete-btn:hover { background:#fef2f2; border-color:#ef4444; }
.dark .ra-delete-btn { background:#1b2e4b; border-color:#7f1d1d; }

@media(max-width:560px) {
    .ra-widget-switches { grid-template-columns:1fr; }
}
`
}
