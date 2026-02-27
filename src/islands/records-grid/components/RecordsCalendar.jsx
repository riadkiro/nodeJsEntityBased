/**
 * RecordsCalendar — Premium FullCalendar-powered calendar view
 * 
 * Google Calendar-like experience with:
 * - Month/Week/Day views with 15-minute snap
 * - Click on empty slot → Quick Add modal with pre-filled time
 * - Click on event → Detail popover with edit/open actions
 * - Drag & drop to move events (snaps to 15min intervals)
 * - Resize events to change duration
 * - Color-coded by status classification
 * - Toast notifications for actions
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import CardRenderer, { DEFAULT_CALENDAR_LAYOUT } from '../../shared/CardRenderer'

// ─── Status color mapping ────────────────────────────────────────
const STATUS_COLORS = {
    'Planifié': { className: 'primary', bg: '#4361ee', text: '#fff' },
    'Confirmé': { className: 'info', bg: '#2196f3', text: '#fff' },
    'Terminé': { className: 'success', bg: '#00ab55', text: '#fff' },
    'Annulé': { className: 'danger', bg: '#e7515a', text: '#fff' },
    'Non présenté': { className: 'warning', bg: '#e2a03f', text: '#fff' },
}
const PALETTE = [
    { className: 'primary', bg: '#4361ee', text: '#fff' },
    { className: 'info', bg: '#2196f3', text: '#fff' },
    { className: 'success', bg: '#00ab55', text: '#fff' },
    { className: 'danger', bg: '#e7515a', text: '#fff' },
    { className: 'warning', bg: '#e2a03f', text: '#fff' },
]

// ─── Helpers ─────────────────────────────────────────────────────
function extractDate(record, dateFieldId) {
    if (dateFieldId) {
        const cf = (record.customFields || []).find(f => {
            const fId = f.field_id?._id?.toString() || f.field_id?.toString()
            return fId === dateFieldId
        })
        if (cf?.value) { const d = new Date(cf.value); if (!isNaN(d)) return d }
    }
    if (record.date) { const d = new Date(record.date); if (!isNaN(d)) return d }
    if (record.createdAt) { const d = new Date(record.createdAt); if (!isNaN(d)) return d }
    return null
}

function extractDuration(record, durationFieldId) {
    if (!durationFieldId) return 30
    const cf = (record.customFields || []).find(f => {
        const fId = f.field_id?._id?.toString() || f.field_id?.toString()
        return fId === durationFieldId
    })
    return parseInt(cf?.value) || 30
}

function getStatusLabel(record) {
    const cvs = record.classificationValues || []
    for (const cv of cvs) { if (cv.label || cv.optionLabel) return cv.label || cv.optionLabel }
    return null
}

function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatDate(date) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function toLocalDatetime(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}`
}

// ─── Toast Component ─────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000)
        return () => clearTimeout(t)
    }, [onClose])

    const colors = {
        success: { bg: '#00ab55', icon: '✓' },
        error: { bg: '#e7515a', icon: '✕' },
        info: { bg: '#4361ee', icon: 'ℹ' },
    }
    const c = colors[type] || colors.info

    return (
        <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 20px', borderRadius: 12,
            backgroundColor: c.bg, color: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            animation: 'slideInRight 0.3s ease',
            fontSize: 13, fontWeight: 600,
        }}>
            <span style={{ fontSize: 16 }}>{c.icon}</span>
            {message}
        </div>
    )
}

// ─── Quick Add Modal ─────────────────────────────────────────────
function QuickAddModal({ isOpen, onClose, onSave, initialDate, entityData, accountNumber }) {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [duration, setDuration] = useState('30')
    const [saving, setSaving] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen && initialDate) {
            setDate(toLocalDatetime(initialDate))
            setTitle('')
            setDuration('30')
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, initialDate])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim()) return
        setSaving(true)
        try {
            await onSave({ title: title.trim(), date, duration: parseInt(duration) })
            onClose()
        } catch (err) {
            console.error(err)
        }
        setSaving(false)
    }

    const durations = [15, 30, 45, 60, 90, 120]

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
        }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
            <div style={{
                backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 440,
                boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
                animation: 'slideUp 0.3s ease',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #f0f0f0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #4361ee, #805cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18, color: '#fff' }}>
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Nouveau rendez-vous</h3>
                            <p style={{ margin: 0, fontSize: 11, color: '#888', marginTop: 2 }}>
                                {initialDate ? formatDate(initialDate) : ''}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        border: 'none', background: '#f5f5f5', borderRadius: 8, width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16, color: '#666' }}>
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
                    {/* Title */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                            Titre *
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Consultation Dr. Martin"
                            required
                            style={{
                                width: '100%', padding: '10px 14px', border: '1.5px solid #e0e0e0',
                                borderRadius: 10, fontSize: 14, outline: 'none', transition: 'border 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#4361ee'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </div>

                    {/* Date & Time */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                            Date et heure
                        </label>
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px', border: '1.5px solid #e0e0e0',
                                borderRadius: 10, fontSize: 14, outline: 'none', transition: 'border 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#4361ee'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </div>

                    {/* Duration chips */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>
                            Durée
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {durations.map(d => (
                                <button
                                    key={d} type="button"
                                    onClick={() => setDuration(String(d))}
                                    style={{
                                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                        border: duration === String(d) ? '1.5px solid #4361ee' : '1.5px solid #e0e0e0',
                                        backgroundColor: duration === String(d) ? '#4361ee' : '#fff',
                                        color: duration === String(d) ? '#fff' : '#555',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                >
                                    {d < 60 ? `${d} min` : `${d / 60}h`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            border: '1.5px solid #e0e0e0', backgroundColor: '#fff', color: '#555',
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={saving || !title.trim()} style={{
                            padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            border: 'none',
                            background: title.trim() ? 'linear-gradient(135deg, #4361ee, #805cf6)' : '#ccc',
                            color: '#fff', cursor: title.trim() ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
                        }}>
                            {saving ? 'Création...' : 'Créer le RDV'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Event Detail Popover ────────────────────────────────────────
function EventDetailPopover({ event, position, onClose, onEdit, onDelete, accountNumber, entitySlug, cardTemplate }) {
    const popoverRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [onClose])

    if (!event) return null

    const start = event.start ? new Date(event.start) : null
    const end = event.end ? new Date(event.end) : null
    const status = event.extendedProps?.status
    const statusColor = status ? STATUS_COLORS[status] : null
    const recordId = event.extendedProps?.recordId || event.id

    // Build a virtual record for CardRenderer
    const virtualRecord = {
        _id: recordId,
        referenceTitle: event.title,
        _start: start,
        _end: end,
        classificationValues: status ? [{
            optionLabel: status,
            optionColor: statusColor ? statusColor.bg : '#4361ee',
        }] : [],
        createdAt: start,
        ...event.extendedProps,
    }

    return (
        <div ref={popoverRef} style={{
            position: 'fixed',
            top: Math.min(position.y, window.innerHeight - 280),
            left: Math.min(position.x, window.innerWidth - 340),
            zIndex: 9998,
            width: 320, backgroundColor: '#fff', borderRadius: 14,
            boxShadow: '0 16px 64px rgba(0,0,0,0.18)',
            animation: 'slideUp 0.2s ease', overflow: 'hidden',
        }}>
            <CardRenderer
                record={virtualRecord}
                cardTemplate={cardTemplate}
                context="calendar"
                accountNumber={accountNumber}
                entitySlug={entitySlug}
                callbacks={{ onClose }}
                style={{ borderRadius: 0 }}
            />
        </div>
    )
}

// ─── Main Calendar Component ─────────────────────────────────────
export default function RecordsCalendar({
    records = [],
    columns = [],
    accountNumber,
    entitySlug,
    entityData,
}) {
    const calendarRef = useRef(null)
    const calendarInstance = useRef(null)
    const [ready, setReady] = useState(false)
    const [quickAddOpen, setQuickAddOpen] = useState(false)
    const [quickAddDate, setQuickAddDate] = useState(null)
    const [detailEvent, setDetailEvent] = useState(null)
    const [detailPosition, setDetailPosition] = useState({ x: 0, y: 0 })
    const [toast, setToast] = useState(null)
    const [localRecords, setLocalRecords] = useState(records)

    // Sync records prop
    useEffect(() => { setLocalRecords(records) }, [records])

    // Card template state — fetch default calendar card
    const [cardTemplate, setCardTemplate] = useState(null)
    useEffect(() => {
        if (!entityData?._id) return
        const entityId = entityData._id?.$oid || entityData._id
        fetch(`/account/${accountNumber}/api/entity/${entityId}/cards/default/calendar`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.card) setCardTemplate(data.card)
            })
            .catch(() => { })
    }, [entityData?._id, accountNumber])

    // Find date & duration fields
    const { dateFieldId, durationFieldId } = useMemo(() => {
        if (!entityData) return { dateFieldId: null, durationFieldId: null }
        const fields = entityData.customFields || []
        const dateFields = fields.filter(f =>
            f.type === 'date' || f.inputType === 'date' || f.inputType === 'datetime-local'
        )
        const preferredDate = dateFields.find(f =>
            /^date/i.test(f.name || '') || /date/i.test(f.label || '')
        )
        const dateId = preferredDate?._id?.toString() || dateFields[0]?._id?.toString() || null

        const durationFields = fields.filter(f =>
            f.type === 'number' && (/dur/i.test(f.name || '') || /dur/i.test(f.label || ''))
        )
        const durationId = durationFields[0]?._id?.toString() || null
        return { dateFieldId: dateId, durationFieldId: durationId }
    }, [entityData])

    // Get entity ID and status classification
    const entityId = entityData?._id?.toString()
    const statusClassificationId = entityData?.statusClassification?._id?.toString()
    const statusOptions = entityData?.statusClassification?.options || []
    const defaultStatusOption = statusOptions.find(o => /planif/i.test(o.label)) || statusOptions[0]

    // Convert records to FullCalendar events
    const calendarEvents = useMemo(() => {
        return localRecords.map((record, idx) => {
            const start = extractDate(record, dateFieldId)
            if (!start) return null
            const duration = extractDuration(record, durationFieldId)
            const end = new Date(start.getTime() + duration * 60000)
            const title = record.referenceTitle || record.computedTitle || record.title || 'Sans titre'
            const status = getStatusLabel(record)
            const colorInfo = status ? (STATUS_COLORS[status] || PALETTE[idx % PALETTE.length]) : PALETTE[idx % PALETTE.length]

            return {
                id: record._id,
                title,
                start: start.toISOString(),
                end: end.toISOString(),
                className: colorInfo.className,
                extendedProps: {
                    recordId: record._id,
                    status,
                    entitySlug,
                    accountNumber,
                    dateFieldId,
                    durationFieldId,
                }
            }
        }).filter(Boolean)
    }, [localRecords, dateFieldId, durationFieldId, entitySlug, accountNumber])

    // Handle event click → show detail popover
    const handleEventClick = useCallback((info) => {
        info.jsEvent.preventDefault()
        info.jsEvent.stopPropagation()
        const rect = info.el.getBoundingClientRect()
        setDetailPosition({ x: rect.right + 8, y: rect.top })
        setDetailEvent(info.event)
    }, [])

    // Handle date select → open Quick Add
    const handleDateSelect = useCallback((info) => {
        setDetailEvent(null)
        const date = info.start
        setQuickAddDate(date)
        setQuickAddOpen(true)
        if (calendarInstance.current) {
            calendarInstance.current.unselect()
        }
    }, [])

    // Handle event drop (drag & drop)
    const handleEventDrop = useCallback(async (info) => {
        const recordId = info.event.extendedProps?.recordId || info.event.id
        const newStart = info.event.start.toISOString()
        const newEnd = info.event.end?.toISOString()
        const dfId = info.event.extendedProps?.dateFieldId

        // Calculate new duration in minutes
        let duration = undefined
        if (info.event.start && info.event.end) {
            duration = Math.round((info.event.end - info.event.start) / 60000)
        }

        try {
            const res = await fetch(`/account/${accountNumber}/api/records/${recordId}/date`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ dateFieldId: dfId, newStart, newEnd, duration })
            })
            if (!res.ok) throw new Error('Failed')
            setToast({ message: 'RDV déplacé avec succès', type: 'success' })
        } catch (err) {
            info.revert()
            setToast({ message: 'Erreur lors du déplacement', type: 'error' })
        }
    }, [accountNumber])

    // Handle event resize
    const handleEventResize = useCallback(async (info) => {
        const recordId = info.event.extendedProps?.recordId || info.event.id
        const newStart = info.event.start.toISOString()
        const dfId = info.event.extendedProps?.dateFieldId
        let duration = undefined
        if (info.event.start && info.event.end) {
            duration = Math.round((info.event.end - info.event.start) / 60000)
        }

        try {
            const res = await fetch(`/account/${accountNumber}/api/records/${recordId}/date`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ dateFieldId: dfId, newStart, duration })
            })
            if (!res.ok) throw new Error('Failed')
            setToast({ message: `Durée modifiée (${duration} min)`, type: 'success' })
        } catch (err) {
            info.revert()
            setToast({ message: 'Erreur lors du redimensionnement', type: 'error' })
        }
    }, [accountNumber])

    // Quick Add save handler
    const handleQuickAddSave = useCallback(async ({ title, date, duration }) => {
        if (!entityId || !dateFieldId) return

        const res = await fetch(`/account/${accountNumber}/api/entity/${entityId}/records/quick-add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                title,
                dateFieldId,
                dateValue: new Date(date).toISOString(),
                duration,
                durationFieldId,
                statusOptionId: defaultStatusOption?._id?.toString(),
                statusClassificationId,
            })
        })

        if (!res.ok) throw new Error('Failed to create')
        const data = await res.json()

        // Add new record to local state
        if (data.record) {
            setLocalRecords(prev => [...prev, data.record])
        }
        setToast({ message: `"${title}" créé avec succès !`, type: 'success' })
    }, [accountNumber, entityId, dateFieldId, durationFieldId, defaultStatusOption, statusClassificationId])

    // FullCalendar initialization
    useEffect(() => {
        if (typeof FullCalendar !== 'undefined') { setReady(true); return }
        const checkInterval = setInterval(() => {
            if (typeof FullCalendar !== 'undefined') { setReady(true); clearInterval(checkInterval) }
        }, 200)
        if (!document.querySelector('script[src*="fullcalendar"]')) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'; link.href = '/assets/css/fullcalendar.min.css'
            document.head.appendChild(link)
            const script = document.createElement('script')
            script.src = '/assets/js/fullcalendar.min.js'
            script.onload = () => setReady(true)
            document.head.appendChild(script)
        }
        return () => clearInterval(checkInterval)
    }, [])

    // Initialize FullCalendar with all features
    useEffect(() => {
        if (!ready || !calendarRef.current) return
        if (typeof FullCalendar === 'undefined') return

        if (calendarInstance.current) calendarInstance.current.destroy()

        const calendar = new FullCalendar.Calendar(calendarRef.current, {
            initialView: 'timeGridWeek',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
            },
            locale: 'fr',
            buttonText: {
                today: "Aujourd'hui",
                month: 'Mois',
                week: 'Semaine',
                day: 'Jour',
            },
            // ─── Core features ───
            editable: true,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: 3,
            height: 'auto',
            // ─── Snap to 15 min ───
            slotDuration: '00:15:00',
            snapDuration: '00:15:00',
            slotLabelInterval: '01:00',
            slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
            // ─── Business hours ───
            businessHours: {
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: '08:00',
                endTime: '19:00',
            },
            scrollTime: '08:00:00',
            nowIndicator: true,
            // ─── Events ───
            events: calendarEvents,
            eventClick: handleEventClick,
            select: handleDateSelect,
            eventDrop: handleEventDrop,
            eventResize: handleEventResize,
            // ─── Visual ───
            eventDidMount: (info) => {
                info.el.style.cursor = 'pointer'
                info.el.style.borderRadius = '6px'
                info.el.style.border = 'none'
                info.el.style.fontSize = '12px'
                info.el.style.fontWeight = '600'
                // Tooltip
                const status = info.event.extendedProps?.status
                info.el.title = info.event.title + (status ? ` — ${status}` : '')
            },
            // ─── Day header format ───
            dayHeaderFormat: { weekday: 'short', day: 'numeric', month: 'short' },
            allDaySlot: false,
        })

        calendar.render()
        calendarInstance.current = calendar

        return () => {
            if (calendarInstance.current) {
                calendarInstance.current.destroy()
                calendarInstance.current = null
            }
        }
    }, [ready, calendarEvents, handleEventClick, handleDateSelect, handleEventDrop, handleEventResize])

    // Loading
    if (!ready) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span style={{ marginLeft: 12, color: '#888' }}>Chargement du calendrier...</span>
            </div>
        )
    }

    // No date field
    if (!dateFieldId && records.length > 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', flexDirection: 'column' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 48, height: 48, marginBottom: 12, color: '#ccc' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#888' }}>Aucun champ date trouvé</p>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Ajoutez un champ date à cette entité</p>
            </div>
        )
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* CSS animations */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .fc .fc-timegrid-slot { height: 40px !important; }
                .fc .fc-event { transition: box-shadow 0.2s, transform 0.15s !important; }
                .fc .fc-event:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important; transform: scale(1.02) !important; z-index: 10 !important; }
                .fc .fc-timegrid-now-indicator-line { border-color: #e7515a !important; border-width: 2px !important; }
                .fc .fc-timegrid-now-indicator-arrow { border-color: #e7515a !important; }
                .fc .fc-highlight { background: rgba(67, 97, 238, 0.08) !important; }
                .fc .fc-col-header-cell { font-weight: 600 !important; }
                .fc .fc-button-primary { border-radius: 8px !important; font-weight: 600 !important; font-size: 12px !important; }
                .fc .fc-button-group .fc-button { border-radius: 0 !important; }
                .fc .fc-button-group .fc-button:first-child { border-radius: 8px 0 0 8px !important; }
                .fc .fc-button-group .fc-button:last-child { border-radius: 0 8px 8px 0 !important; }
                .fc .fc-toolbar-title { font-size: 18px !important; font-weight: 700 !important; }
                .fc .fc-timegrid-slot-label { font-size: 11px !important; color: #888 !important; }
                .fc-theme-standard td, .fc-theme-standard th { border-color: #f0f0f0 !important; }
                .fc .fc-non-business { background: #fafbfc !important; }
            `}</style>

            {/* Legend */}
            <div style={{
                marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 12,
                alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0',
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {Object.entries(STATUS_COLORS).map(([label, info]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#666' }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: info.bg }} />
                            {label}
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic' }}>
                    Cliquer pour ajouter • Glisser pour déplacer
                </div>
            </div>

            {/* FullCalendar */}
            <div className="calendar-wrapper" ref={calendarRef} />

            {/* Quick Add Modal */}
            <QuickAddModal
                isOpen={quickAddOpen}
                onClose={() => setQuickAddOpen(false)}
                onSave={handleQuickAddSave}
                initialDate={quickAddDate}
                entityData={entityData}
                accountNumber={accountNumber}
            />

            {/* Event Detail Popover */}
            {detailEvent && (
                <EventDetailPopover
                    event={detailEvent}
                    position={detailPosition}
                    onClose={() => setDetailEvent(null)}
                    accountNumber={accountNumber}
                    entitySlug={entitySlug}
                    cardTemplate={cardTemplate}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}
