/**
 * RecordAgenda — Main agenda React Island component
 *
 * App-like layout: full-height, no hero, breadcrumb-only
 * 3 view modes: Calendar, Timeline, List
 * Preferences persisted server-side via view-preferences API
 * Full CRUD via events API
 * Drag & drop on calendar
 * Dark mode compatible
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import AgendaToolbar from './components/AgendaToolbar'
import EventModal from './components/EventModal'
import TimelineView from './components/TimelineView'
import ListView from './components/ListView'

export default function RecordAgenda({ accountNumber, recordId, entitySlug }) {
    const [events, setEvents] = useState([])
    const [entityData, setEntityData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [prefsLoaded, setPrefsLoaded] = useState(false)
    const [viewMode, setViewMode] = useState('calendar') // calendar | timeline | list
    const [calendarViewType, setCalendarViewType] = useState('dayGridMonth')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [prefillDate, setPrefillDate] = useState(null)
    const calendarRef = useRef(null)
    const calendarInstance = useRef(null)
    const prefsViewId = `agenda-${recordId}`

    const baseUrl = `/account/${accountNumber}/api/records/${recordId}/events`
    const prefsUrl = `/account/${accountNumber}/api/user/view-preferences`

    // ── Preferences: Load ──
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${prefsUrl}/${prefsViewId}`, { credentials: 'include' })
                const data = await res.json()
                if (data.success && data.preferences?.agendaPrefs) {
                    const p = data.preferences.agendaPrefs
                    if (p.viewMode) setViewMode(p.viewMode)
                    if (p.calendarView) setCalendarViewType(p.calendarView)
                }
            } catch (e) {
                // No prefs yet, use defaults
            }
            setPrefsLoaded(true)
        })()
    }, [prefsUrl, prefsViewId])

    // ── Preferences: Save ──
    const savePrefs = useCallback(async (patch) => {
        try {
            // Read current state + apply patch
            const newPrefs = { viewMode, calendarView: calendarViewType, ...patch }
            await fetch(prefsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    viewId: prefsViewId,
                    preferences: { agendaPrefs: newPrefs }
                })
            })
        } catch (e) {
            console.warn('[RecordAgenda] Prefs save error:', e)
        }
    }, [prefsUrl, prefsViewId, viewMode, calendarViewType])

    // ── View mode change with persistence ──
    const handleViewModeChange = useCallback((mode) => {
        setViewMode(mode)
        savePrefs({ viewMode: mode })
    }, [savePrefs])

    // ── Helpers ──
    const getCustomFieldValue = useCallback((record, fieldName) => {
        if (!record || !entityData) return null
        const field = (entityData.customFields || []).find(f => f.name === fieldName)
        if (!field) return null
        const cf = (record.customFields || []).find(c => {
            const fid = c.field_id?._id || c.field_id
            return fid?.toString() === field._id?.toString()
        })
        return cf?.value || null
    }, [entityData])

    const getStatusInfo = useCallback((record) => {
        if (!record || !entityData?.statusClassification) return { label: 'Planifié', color: '#3b82f6' }
        const statusCls = entityData.statusClassification
        const cv = (record.classificationValues || []).find(
            c => c.classificationId?.toString() === statusCls._id?.toString()
        )
        if (!cv) return { label: 'Planifié', color: '#3b82f6' }
        const opt = (statusCls.options || []).find(o => o._id?.toString() === cv.optionId?.toString())
        return opt ? { label: opt.label, color: opt.color || '#3b82f6' } : { label: 'Planifié', color: '#3b82f6' }
    }, [entityData])

    // ── Transform raw records to FullCalendar events ──
    const calendarEvents = useMemo(() => {
        return events.map(ev => {
            const status = getStatusInfo(ev)
            const duration = getCustomFieldValue(ev, 'duree_evenement')
            const lieu = getCustomFieldValue(ev, 'lieu_evenement')
            const type = getCustomFieldValue(ev, 'type_evenement')
            const notes = getCustomFieldValue(ev, 'notes_evenement')

            let start = ev.date ? new Date(ev.date) : new Date()
            let end = ev.end_date ? new Date(ev.end_date) : null

            if (!end && duration) {
                end = new Date(start.getTime() + (parseInt(duration) || 30) * 60000)
            } else if (!end) {
                end = new Date(start.getTime() + 30 * 60000)
            }

            return {
                id: ev._id?.toString(),
                title: ev.title || 'Sans titre',
                start: start.toISOString(),
                end: end.toISOString(),
                backgroundColor: status.color,
                borderColor: status.color,
                textColor: '#fff',
                extendedProps: {
                    _raw: ev,
                    status: status.label,
                    statusColor: status.color,
                    duration, lieu, type, notes,
                }
            }
        })
    }, [events, getStatusInfo, getCustomFieldValue])

    // ── Fetch events ──
    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch(baseUrl, { credentials: 'include' })
            const data = await res.json()
            if (data.success) {
                setEvents(data.events || [])
                setEntityData(data.entityData || null)
            }
        } catch (err) {
            console.error('[RecordAgenda] Fetch error:', err)
        }
        setLoading(false)
    }, [baseUrl])

    useEffect(() => { fetchEvents() }, [fetchEvents])

    // Use a ref for calendarViewType to avoid recreating calendar on view switch
    const calendarViewTypeRef = useRef(calendarViewType)
    calendarViewTypeRef.current = calendarViewType

    // Keep a ref to calendarEvents so callbacks always read the latest
    const calendarEventsRef = useRef(calendarEvents)
    calendarEventsRef.current = calendarEvents

    // ── Init FullCalendar (only on view/loading change, NOT on events change) ──
    useEffect(() => {
        if (viewMode !== 'calendar' || loading || !prefsLoaded || !calendarRef.current) return
        if (typeof FullCalendar === 'undefined') {
            console.error('[RecordAgenda] FullCalendar not loaded')
            return
        }

        // Preserve current date if calendar already exists
        const currentDate = calendarInstance.current?.getDate()

        if (calendarInstance.current) {
            calendarInstance.current.destroy()
        }

        // Guard: skip datesSet during init to avoid overwriting persisted prefs
        let calendarReady = false

        const calendar = new FullCalendar.Calendar(calendarRef.current, {
            initialView: calendarViewTypeRef.current,
            initialDate: currentDate || undefined,
            locale: 'fr',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
            },
            buttonText: {
                today: "Aujourd'hui",
                month: 'Mois',
                week: 'Semaine',
                day: 'Jour',
            },
            editable: true,
            dayMaxEvents: 3,
            selectable: true,
            droppable: false,
            nowIndicator: true,
            slotMinTime: '07:00:00',
            slotMaxTime: '21:00:00',
            slotDuration: '00:15:00',
            snapDuration: '00:05:00',
            allDaySlot: false,
            height: '100%',
            expandRows: true,
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false,
            },
            events: calendarEventsRef.current,
            // Save view type on change (fires when user clicks Month/Week/Day)
            datesSet: (info) => {
                // Skip the initial datesSet fired by FullCalendar on render
                if (!calendarReady) return
                const newViewType = info.view.type
                if (newViewType !== calendarViewTypeRef.current) {
                    calendarViewTypeRef.current = newViewType
                    setCalendarViewType(newViewType)
                    // Save pref directly (bypass stale closure)
                    fetch(prefsUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            viewId: prefsViewId,
                            preferences: { agendaPrefs: { viewMode: 'calendar', calendarView: newViewType } }
                        })
                    }).catch(() => {})
                }
            },
            eventClick: (info) => {
                const raw = info.event.extendedProps._raw
                setEditingEvent(raw)
                setIsModalOpen(true)
            },
            dateClick: (info) => {
                // Round to nearest 5 minutes for clean time slots
                const d = new Date(info.dateStr)
                d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0)
                setPrefillDate(d.toISOString())
                setEditingEvent(null)
                setIsModalOpen(true)
            },
            eventDrop: async (info) => {
                const eventId = info.event.id
                const newStart = info.event.start?.toISOString()
                const newEnd = info.event.end?.toISOString()
                try {
                    await fetch(`${baseUrl}/${eventId}/drag`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ newStart, newEnd })
                    })
                    await fetchEvents()
                } catch (err) {
                    console.error('[RecordAgenda] Drag error:', err)
                    info.revert()
                }
            },
            eventResize: async (info) => {
                const eventId = info.event.id
                const newStart = info.event.start?.toISOString()
                const newEnd = info.event.end?.toISOString()
                try {
                    await fetch(`${baseUrl}/${eventId}/drag`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ newStart, newEnd })
                    })
                    await fetchEvents()
                } catch (err) {
                    console.error('[RecordAgenda] Resize error:', err)
                    info.revert()
                }
            },
            eventDidMount: (info) => {
                const props = info.event.extendedProps
                let tip = info.event.title
                if (props.lieu) tip += `\n📍 ${props.lieu}`
                if (props.status) tip += `\n● ${props.status}`
                info.el.title = tip
            }
        })

        calendar.render()
        calendarInstance.current = calendar

        // Mark calendar as ready after initial render so datesSet fires only on user interaction
        requestAnimationFrame(() => { calendarReady = true })

        return () => {
            if (calendarInstance.current) {
                calendarInstance.current.destroy()
                calendarInstance.current = null
            }
        }
    // calendarEvents intentionally NOT in deps — events are updated via the separate effect below
    // calendarViewType intentionally NOT in deps — we use the ref to avoid recreating on view switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, loading, prefsLoaded, baseUrl, fetchEvents, prefsUrl, prefsViewId])

    // ── Update events on existing calendar without destroying it ──
    useEffect(() => {
        if (!calendarInstance.current) return
        const cal = calendarInstance.current
        cal.removeAllEvents()
        cal.addEventSource(calendarEvents)
    }, [calendarEvents])

    // ── CRUD handlers ──
    const handleCreateEvent = useCallback(async (eventData) => {
        try {
            const res = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(eventData)
            })
            const data = await res.json()
            if (data.success) {
                await fetchEvents()
                setIsModalOpen(false)
                setEditingEvent(null)
                setPrefillDate(null)
            }
        } catch (err) {
            console.error('[RecordAgenda] Create error:', err)
        }
    }, [baseUrl, fetchEvents])

    const handleUpdateEvent = useCallback(async (eventId, eventData) => {
        try {
            const res = await fetch(`${baseUrl}/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(eventData)
            })
            const data = await res.json()
            if (data.success) {
                await fetchEvents()
                setIsModalOpen(false)
                setEditingEvent(null)
            }
        } catch (err) {
            console.error('[RecordAgenda] Update error:', err)
        }
    }, [baseUrl, fetchEvents])

    const handleDeleteEvent = useCallback(async (eventId) => {
        if (!confirm('Supprimer cet événement ?')) return
        try {
            const res = await fetch(`${baseUrl}/${eventId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            const data = await res.json()
            if (data.success) {
                await fetchEvents()
                setIsModalOpen(false)
                setEditingEvent(null)
            }
        } catch (err) {
            console.error('[RecordAgenda] Delete error:', err)
        }
    }, [baseUrl, fetchEvents])

    const handleNewEvent = useCallback(() => {
        setEditingEvent(null)
        setPrefillDate(null)
        setIsModalOpen(true)
    }, [])

    const handleEventClick = useCallback((ev) => {
        setEditingEvent(ev)
        setIsModalOpen(true)
    }, [])

    // ── Render ──
    if (loading || !prefsLoaded) {
        return (
            <div className="ra-loading">
                <div className="ra-spinner" />
                <span>Chargement de l'agenda...</span>
            </div>
        )
    }

    return (
        <div className="ra-container">
            <style>{getStyles()}</style>

            <AgendaToolbar
                viewMode={viewMode}
                onViewChange={handleViewModeChange}
                onNewEvent={handleNewEvent}
                eventCount={events.length}
            />

            {viewMode === 'calendar' && (
                <div className="ra-calendar-wrap">
                    <div ref={calendarRef} className="ra-calendar" />
                </div>
            )}

            {viewMode === 'timeline' && (
                <TimelineView
                    events={events}
                    entityData={entityData}
                    onEventClick={handleEventClick}
                    getStatusInfo={getStatusInfo}
                    getCustomFieldValue={getCustomFieldValue}
                />
            )}

            {viewMode === 'list' && (
                <ListView
                    events={events}
                    entityData={entityData}
                    onEventClick={handleEventClick}
                    onDeleteEvent={handleDeleteEvent}
                    getStatusInfo={getStatusInfo}
                    getCustomFieldValue={getCustomFieldValue}
                />
            )}

            {events.length === 0 && !loading && (
                <div className="ra-empty">
                    <div className="ra-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <line x1="10" y1="14" x2="14" y2="18" />
                            <line x1="14" y1="14" x2="10" y2="18" />
                        </svg>
                    </div>
                    <h3>Aucun événement</h3>
                    <p>Ajoutez votre premier événement pour commencer à organiser votre agenda.</p>
                    <button className="ra-empty-btn" onClick={handleNewEvent}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nouvel événement
                    </button>
                </div>
            )}

            <EventModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingEvent(null); setPrefillDate(null) }}
                event={editingEvent}
                entityData={entityData}
                prefillDate={prefillDate}
                onCreate={handleCreateEvent}
                onUpdate={handleUpdateEvent}
                onDelete={handleDeleteEvent}
                getCustomFieldValue={getCustomFieldValue}
                getStatusInfo={getStatusInfo}
            />
        </div>
    )
}

// ── Styles ──
function getStyles() {
    return `
/* ═══ Record Agenda Island — App Layout ═══ */
.ra-container {
    font-family: 'Nunito', sans-serif;
    display: flex; flex-direction: column;
    height: 100%; min-height: 0;
}
.ra-loading { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px 0; color:#888da8; font-size:14px; }
.ra-spinner { width:24px; height:24px; border:3px solid #e2e8f0; border-top-color:#14b8a6; border-radius:50%; animation:raSpin .8s linear infinite; }
@keyframes raSpin { to { transform:rotate(360deg); } }

/* Calendar wrapper — fills available space */
.ra-calendar-wrap {
    background:#fff; border-radius:14px; border:1px solid #e8ecf1;
    padding:16px; overflow:hidden;
    flex: 1; min-height: 500px;
    display: flex; flex-direction: column;
    animation: raFadeIn .4s ease;
}
.dark .ra-calendar-wrap {
    background:#0e1726; border-color:#253b5c;
}
.ra-calendar { flex: 1; min-height: 0; }

/* FullCalendar overrides for premium feel */
.ra-calendar .fc { font-family:'Nunito',sans-serif; height:100% !important; }
.ra-calendar .fc .fc-toolbar-title { font-size:18px; font-weight:700; color:#0e1726; }
.dark .ra-calendar .fc .fc-toolbar-title { color:#e0e6ed; }

.ra-calendar .fc .fc-button {
    background:#f8fafc !important; border:1px solid #e2e8f0 !important;
    color:#4b5563 !important; font-size:12px !important; font-weight:600 !important;
    padding:6px 14px !important; border-radius:8px !important;
    transition:all .2s !important; box-shadow:none !important;
    text-transform:none !important;
}
.ra-calendar .fc .fc-button:hover {
    background:#e2e8f0 !important; color:#0e1726 !important;
}
.ra-calendar .fc .fc-button-active,
.ra-calendar .fc .fc-button.fc-button-active {
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd) !important;
    border-color:#14b8a6 !important; color:#fff !important;
}
.dark .ra-calendar .fc .fc-button {
    background:#1b2e4b !important; border-color:#253b5c !important;
    color:#888da8 !important;
}
.dark .ra-calendar .fc .fc-button:hover {
    background:#253b5c !important; color:#e0e6ed !important;
}
.dark .ra-calendar .fc .fc-button-active,
.dark .ra-calendar .fc .fc-button.fc-button-active {
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd) !important;
    border-color:#14b8a6 !important; color:#fff !important;
}

.ra-calendar .fc .fc-col-header-cell-cushion { font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
.dark .ra-calendar .fc .fc-col-header-cell-cushion { color:#506690; }

.ra-calendar .fc .fc-daygrid-day-number { font-size:13px; font-weight:600; color:#374151; padding:6px 8px; }
.dark .ra-calendar .fc .fc-daygrid-day-number { color:#888da8; }

.ra-calendar .fc .fc-day-today { background:rgba(20,184,166,.04) !important; }
.dark .ra-calendar .fc .fc-day-today { background:rgba(20,184,166,.08) !important; }

.ra-calendar .fc .fc-event {
    border:none !important; border-radius:6px !important; padding:2px 6px !important;
    font-size:12px !important; font-weight:600 !important;
    cursor:pointer !important; transition:transform .15s, box-shadow .15s !important;
}
.ra-calendar .fc .fc-event:hover {
    transform:translateY(-1px) !important;
    box-shadow:0 4px 12px rgba(0,0,0,.15) !important;
}

.ra-calendar .fc td, .ra-calendar .fc th { border-color:#f1f3f5 !important; }
.dark .ra-calendar .fc td, .dark .ra-calendar .fc th { border-color:#1b2e4b !important; }

.ra-calendar .fc .fc-scrollgrid { border-color:#e8ecf1 !important; }
.dark .ra-calendar .fc .fc-scrollgrid { border-color:#253b5c !important; }

.ra-calendar .fc .fc-timegrid-slot { height:40px; }
.ra-calendar .fc .fc-timegrid-slot-label-cushion { font-size:11px; font-weight:600; color:#9ca3af; }
.dark .ra-calendar .fc .fc-timegrid-slot-label-cushion { color:#506690; }

.ra-calendar .fc .fc-now-indicator-line { border-color:#ef4444 !important; }
.ra-calendar .fc .fc-now-indicator-arrow { border-color:#ef4444 !important; }

/* Timeline + List views fill space */
.ra-timeline, .ra-list-wrap { flex:1; min-height:0; overflow-y:auto; }

/* Empty state */
.ra-empty {
    text-align:center; padding:60px 20px;
    animation: raFadeIn .5s ease;
}
.ra-empty-icon { color:#d1d5db; margin-bottom:16px; }
.dark .ra-empty-icon { color:#506690; }
.ra-empty h3 { font-size:16px; font-weight:700; color:#374151; margin:0 0 6px; }
.dark .ra-empty h3 { color:#e0e6ed; }
.ra-empty p { font-size:13px; color:#9ca3af; margin:0 0 20px; }
.dark .ra-empty p { color:#506690; }
.ra-empty-btn {
    display:inline-flex; align-items:center; gap:8px; padding:10px 20px;
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd);
    color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .2s; font-family:inherit;
}
.ra-empty-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(20,184,166,.3); }

@keyframes raFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`
}
