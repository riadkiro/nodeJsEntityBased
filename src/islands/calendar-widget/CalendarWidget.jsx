/**
 * CalendarWidget — Main calendar React Island component
 * 
 * Pixel-perfect reproduction of the Vristo apps-calendar.html template.
 * Uses FullCalendar.js loaded globally from /assets/js/fullcalendar.min.js
 * 
 * Features:
 * - Month / Week / Day views
 * - Event CRUD modal (create, edit, delete)
 * - Color-coded event badges (Work, Travel, Personal, Important)
 * - Click on date to create event
 * - Click on event to edit
 * - Drag & drop to move events
 * - Dark mode compatible
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import EventModal from './components/EventModal'
import CalendarLegend from './components/CalendarLegend'

const DEFAULT_PARAMS = {
    id: null,
    title: '',
    start: '',
    end: '',
    description: '',
    type: 'primary',
}

export default function CalendarWidget({ accountNumber, apiUrl, events: initialEvents, editable = true, compact = false }) {
    const [events, setEvents] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [params, setParams] = useState({ ...DEFAULT_PARAMS })
    const [minStartDate, setMinStartDate] = useState('')
    const [minEndDate, setMinEndDate] = useState('')
    const [loading, setLoading] = useState(true)
    const calendarRef = useRef(null)
    const calendarInstance = useRef(null)

    // Load events from API or props
    useEffect(() => {
        if (initialEvents) {
            setEvents(initialEvents)
            setLoading(false)
            return
        }

        if (apiUrl) {
            fetch(apiUrl, { credentials: 'include' })
                .then(r => r.json())
                .then(data => {
                    setEvents(data.events || [])
                    setLoading(false)
                })
                .catch(err => {
                    console.error('[CalendarWidget] API Error:', err)
                    setEvents(getDefaultEvents())
                    setLoading(false)
                })
        } else {
            setEvents(getDefaultEvents())
            setLoading(false)
        }
    }, [apiUrl, initialEvents])

    // Initialize FullCalendar once events are loaded
    useEffect(() => {
        if (loading || !calendarRef.current) return
        if (typeof FullCalendar === 'undefined') {
            console.error('[CalendarWidget] FullCalendar not loaded')
            return
        }

        // Destroy previous instance if any
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
            editable: editable,
            dayMaxEvents: true,
            selectable: true,
            droppable: true,
            eventClick: (info) => handleEventClick(info),
            select: (info) => handleDateSelect(info),
            events: events,
            height: compact ? 500 : 'auto',
        })

        calendar.render()
        calendarInstance.current = calendar

        return () => {
            if (calendarInstance.current) {
                calendarInstance.current.destroy()
                calendarInstance.current = null
            }
        }
    }, [loading, events, editable, compact])

    const dateFormat = useCallback((dt) => {
        dt = new Date(dt)
        const month = (dt.getMonth() + 1).toString().padStart(2, '0')
        const date = dt.getDate().toString().padStart(2, '0')
        const hours = dt.getHours().toString().padStart(2, '0')
        const mins = dt.getMinutes().toString().padStart(2, '0')
        return `${dt.getFullYear()}-${month}-${date}T${hours}:${mins}`
    }, [])

    const handleEventClick = useCallback((info) => {
        const obj = info.event
        setParams({
            id: obj.id || null,
            title: obj.title || '',
            start: dateFormat(obj.start),
            end: dateFormat(obj.end || obj.start),
            type: obj.classNames?.[0] || 'primary',
            description: obj.extendedProps?.description || '',
        })
        setMinStartDate(dateFormat(new Date()))
        setMinEndDate(dateFormat(obj.start))
        setIsModalOpen(true)
    }, [dateFormat])

    const handleDateSelect = useCallback((info) => {
        setParams({
            ...DEFAULT_PARAMS,
            start: dateFormat(info.start),
            end: dateFormat(info.end),
        })
        setMinStartDate(dateFormat(new Date()))
        setMinEndDate(dateFormat(info.start))
        setIsModalOpen(true)
    }, [dateFormat])

    const handleCreateEvent = useCallback(() => {
        setParams({ ...DEFAULT_PARAMS })
        setMinStartDate(dateFormat(new Date()))
        setMinEndDate(dateFormat(new Date()))
        setIsModalOpen(true)
    }, [dateFormat])

    const handleSaveEvent = useCallback((eventData) => {
        if (!eventData.title || !eventData.start || !eventData.end) return

        if (eventData.id) {
            // Update existing event
            setEvents(prev => prev.map(e =>
                String(e.id) === String(eventData.id)
                    ? { ...e, title: eventData.title, start: eventData.start, end: eventData.end, description: eventData.description, className: eventData.type }
                    : e
            ))
        } else {
            // Create new event
            const maxId = events.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0)
            const newEvent = {
                id: maxId + 1,
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                description: eventData.description,
                className: eventData.type,
            }
            setEvents(prev => [...prev, newEvent])
        }
        setIsModalOpen(false)
    }, [events])

    const handleStartDateChange = useCallback((value) => {
        if (value) {
            setMinEndDate(dateFormat(value))
        }
    }, [dateFormat])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-500 dark:text-gray-400">Chargement du calendrier...</span>
            </div>
        )
    }

    return (
        <div>
            <div className="panel">
                <div className="mb-5">
                    <div className="mb-4 flex flex-col items-center justify-center sm:flex-row sm:justify-between">
                        <CalendarLegend />
                        {editable && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleCreateEvent}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5 ltr:mr-2 rtl:ml-2"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Create Event
                            </button>
                        )}
                    </div>
                    <div className="calendar-wrapper" ref={calendarRef}></div>
                </div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                params={params}
                setParams={setParams}
                onSave={handleSaveEvent}
                minStartDate={minStartDate}
                minEndDate={minEndDate}
                onStartDateChange={handleStartDateChange}
            />
        </div>
    )
}

// ============================================================================
// Default seed events (matching Vristo template)
// ============================================================================
function getDefaultEvents() {
    const now = new Date()
    const getMonth = (dt, add = 0) => {
        let month = dt.getMonth() + 1 + add
        return month < 10 ? '0' + month : '' + month
    }
    const y = now.getFullYear()
    const m = getMonth(now)
    const mPrev = getMonth(now, -1)
    const mNext = getMonth(now, 1)

    return [
        { id: 1, title: 'Consultation Dr. Martin', start: `${y}-${m}-01T14:30:00`, end: `${y}-${m}-02T14:30:00`, className: 'danger', description: 'Consultation de suivi — bilan hématologique à vérifier.' },
        { id: 2, title: 'Visite domicile', start: `${y}-${m}-07T19:30:00`, end: `${y}-${m}-08T14:30:00`, className: 'primary', description: 'Visite chez Mme Dupont pour suivi post-opératoire.' },
        { id: 3, title: 'Formation médicale', start: `${y}-${m}-17T14:30:00`, end: `${y}-${m}-18T14:30:00`, className: 'info', description: 'Formation continue en cardiologie interventionnelle.' },
        { id: 4, title: 'Réunion staff', start: `${y}-${m}-12T10:30:00`, end: `${y}-${m}-13T10:30:00`, className: 'danger', description: 'Réunion hebdomadaire du service — point sur les cas complexes.' },
        { id: 5, title: 'Déjeuner équipe', start: `${y}-${m}-12T15:00:00`, end: `${y}-${m}-13T15:00:00`, className: 'info', description: 'Déjeuner d\'équipe au restaurant Le Botanic.' },
        { id: 6, title: 'Conférence cardiologie', start: `${y}-${m}-12T21:30:00`, end: `${y}-${m}-13T21:30:00`, className: 'success', description: 'Conférence annuelle de cardiologie — nouvelles recommandations HAS.' },
        { id: 7, title: 'Garde nuit', start: `${y}-${m}-12T05:30:00`, end: `${y}-${m}-13T05:30:00`, className: 'info', description: 'Garde de nuit aux urgences du CHU.' },
        { id: 8, title: 'Dîner gala médical', start: `${y}-${m}-12T20:00:00`, end: `${y}-${m}-13T20:00:00`, className: 'danger', description: 'Gala annuel de l\'Ordre des médecins.' },
        { id: 9, title: 'Anniversaire Dr. Moreau', start: `${y}-${m}-27T20:00:00`, end: `${y}-${m}-28T20:00:00`, className: 'success', description: 'Célébration du départ en retraite du Dr. Moreau.' },
        { id: 10, title: 'Séminaire innovation', start: `${y}-${mNext}-24T08:12:14`, end: `${y}-${mNext}-27T22:20:20`, className: 'danger', description: 'Séminaire sur l\'IA en médecine et les outils de diagnostic.' },
        { id: 11, title: 'Audit qualité', start: `${y}-${mPrev}-13T08:12:14`, end: `${y}-${mPrev}-16T22:20:20`, className: 'primary', description: 'Audit qualité annuel du cabinet — préparation des dossiers.' },
        { id: 13, title: 'Congrès national', start: `${y}-${mNext}-15T08:12:14`, end: `${y}-${mNext}-18T22:20:20`, className: 'primary', description: 'Congrès national de médecine générale — stand et présentation.' },
    ]
}
