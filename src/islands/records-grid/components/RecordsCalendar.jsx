/**
 * RecordsCalendar — FullCalendar-powered calendar view for records
 * 
 * Reuses the existing FullCalendar.js library (loaded globally).
 * Maps entity records to calendar events using date-type custom fields.
 * Features: Month/Week/Day views, event click to edit record, color-coded badges.
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'

// Status-based color mapping
const STATUS_COLORS = {
    'Planifié': 'primary',
    'Confirmé': 'info',
    'Terminé': 'success',
    'Annulé': 'danger',
    'Non présenté': 'warning',
}

// Fallback palette for events without status
const PALETTE = ['primary', 'info', 'success', 'danger', 'warning']

// Extract the best date value from a record
function extractDate(record, dateFieldId) {
    // 1. Explicit date field
    if (dateFieldId) {
        const cf = (record.customFields || []).find(f => {
            const fId = f.field_id?._id?.toString() || f.field_id?.toString()
            return fId === dateFieldId
        })
        if (cf?.value) {
            const d = new Date(cf.value)
            if (!isNaN(d)) return d
        }
    }
    // 2. Try standard date field
    if (record.date) {
        const d = new Date(record.date)
        if (!isNaN(d)) return d
    }
    // 3. Fallback to createdAt
    if (record.createdAt) {
        const d = new Date(record.createdAt)
        if (!isNaN(d)) return d
    }
    return null
}

// Extract duration in minutes from a record
function extractDuration(record, durationFieldId) {
    if (!durationFieldId) return 30
    const cf = (record.customFields || []).find(f => {
        const fId = f.field_id?._id?.toString() || f.field_id?.toString()
        return fId === durationFieldId
    })
    return parseInt(cf?.value) || 30
}

// Get status label from classificationValues
function getStatusLabel(record) {
    const cvs = record.classificationValues || []
    for (const cv of cvs) {
        if (cv.label || cv.optionLabel) return cv.label || cv.optionLabel
    }
    return null
}

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

    // Find date & duration fields from entity
    const { dateFieldId, durationFieldId } = useMemo(() => {
        if (!entityData) return { dateFieldId: null, durationFieldId: null }
        const fields = entityData.customFields || []

        // Date fields
        const dateFields = fields.filter(f =>
            f.type === 'date' || f.inputType === 'date' || f.inputType === 'datetime-local'
        )
        const preferredDate = dateFields.find(f =>
            /^date/i.test(f.name || '') || /date/i.test(f.label || '')
        )
        const dateId = preferredDate?._id?.toString() || dateFields[0]?._id?.toString() || null

        // Duration fields
        const durationFields = fields.filter(f =>
            f.type === 'number' && (/dur/i.test(f.name || '') || /dur/i.test(f.label || ''))
        )
        const durationId = durationFields[0]?._id?.toString() || null

        return { dateFieldId: dateId, durationFieldId: durationId }
    }, [entityData])

    // Convert records to FullCalendar events
    const calendarEvents = useMemo(() => {
        return records.map((record, idx) => {
            const start = extractDate(record, dateFieldId)
            if (!start) return null

            const duration = extractDuration(record, durationFieldId)
            const end = new Date(start.getTime() + duration * 60000)

            const title = record.referenceTitle || record.computedTitle || record.title || 'Sans titre'
            const status = getStatusLabel(record)
            const className = status ? (STATUS_COLORS[status] || PALETTE[idx % PALETTE.length]) : PALETTE[idx % PALETTE.length]

            return {
                id: record._id,
                title,
                start: start.toISOString(),
                end: end.toISOString(),
                className,
                description: status || '',
                extendedProps: {
                    recordId: record._id,
                    status,
                    entitySlug,
                    accountNumber,
                }
            }
        }).filter(Boolean)
    }, [records, dateFieldId, durationFieldId, entitySlug, accountNumber])

    // Check FullCalendar availability
    useEffect(() => {
        if (typeof FullCalendar !== 'undefined') {
            setReady(true)
            return
        }
        // FullCalendar may not be loaded yet — try to load it
        const checkInterval = setInterval(() => {
            if (typeof FullCalendar !== 'undefined') {
                setReady(true)
                clearInterval(checkInterval)
            }
        }, 200)
        // Also try to inject the script if missing
        if (!document.querySelector('script[src*="fullcalendar"]')) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = '/assets/css/fullcalendar.min.css'
            document.head.appendChild(link)

            const script = document.createElement('script')
            script.src = '/assets/js/fullcalendar.min.js'
            script.onload = () => setReady(true)
            document.head.appendChild(script)
        }
        return () => clearInterval(checkInterval)
    }, [])

    // Initialize FullCalendar
    useEffect(() => {
        if (!ready || !calendarRef.current) return
        if (typeof FullCalendar === 'undefined') return

        // Destroy previous instance
        if (calendarInstance.current) {
            calendarInstance.current.destroy()
        }

        const calendar = new FullCalendar.Calendar(calendarRef.current, {
            initialView: 'dayGridMonth',
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
            editable: false,
            dayMaxEvents: 3,
            selectable: false,
            height: 'auto',
            events: calendarEvents,
            eventClick: (info) => {
                const recordId = info.event.extendedProps?.recordId || info.event.id
                if (recordId) {
                    window.location.href = `/account/${accountNumber}/record/${entitySlug}/edit/${recordId}`
                }
            },
            eventDidMount: (info) => {
                // Add tooltip with title
                if (info.event.title) {
                    info.el.title = info.event.title
                    if (info.event.extendedProps?.status) {
                        info.el.title += ` — ${info.event.extendedProps.status}`
                    }
                }
            },
        })

        calendar.render()
        calendarInstance.current = calendar

        return () => {
            if (calendarInstance.current) {
                calendarInstance.current.destroy()
                calendarInstance.current = null
            }
        }
    }, [ready, calendarEvents, accountNumber, entitySlug])

    // Loading state
    if (!ready) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span style={{ marginLeft: 12, color: '#888' }}>Chargement du calendrier...</span>
            </div>
        )
    }

    // No date field warning
    if (!dateFieldId && records.length > 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', flexDirection: 'column' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 48, height: 48, marginBottom: 12, color: '#ccc' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#888' }}>
                    Aucun champ de type date n'a été trouvé
                </p>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                    Ajoutez un champ date à cette entité pour utiliser la vue calendrier
                </p>
            </div>
        )
    }

    return (
        <div className="panel" style={{ padding: '16px' }}>
            {/* Legend */}
            <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {Object.entries(STATUS_COLORS).map(([label, cls]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <div className={`bg-${cls}`} style={{ width: 10, height: 10, borderRadius: 2 }}></div>
                            <span className="text-gray-600 dark:text-gray-400">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* FullCalendar mount point */}
            <div className="calendar-wrapper" ref={calendarRef}></div>
        </div>
    )
}
