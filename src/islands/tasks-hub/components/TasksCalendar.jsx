/**
 * TasksCalendar — Monthly calendar view for tasks
 * 
 * Displays tasks on a month grid based on their due date.
 * Features: month navigation, today highlight, task dots/count,
 * day click to expand tasks list, responsive layout.
 */
import React, { useState, useMemo, useCallback } from 'react'

// Month names in French
const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function TasksCalendar({
    rows,
    accountNumber,
    entitySlug,
}) {
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [selectedDay, setSelectedDay] = useState(null) // { year, month, day }

    // Navigate months
    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(y => y - 1)
        } else {
            setCurrentMonth(m => m - 1)
        }
        setSelectedDay(null)
    }
    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(y => y + 1)
        } else {
            setCurrentMonth(m => m + 1)
        }
        setSelectedDay(null)
    }
    const goToToday = () => {
        setCurrentMonth(today.getMonth())
        setCurrentYear(today.getFullYear())
        setSelectedDay(null)
    }

    // Index tasks by date string (YYYY-MM-DD)
    const tasksByDate = useMemo(() => {
        const map = {}
        rows.forEach(row => {
            if (!row.dueDate) return
            const d = new Date(row.dueDate)
            if (isNaN(d.getTime())) return
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            if (!map[key]) map[key] = []
            map[key].push(row)
        })
        return map
    }, [rows])

    // Tasks without due date
    const unscheduledTasks = useMemo(() => rows.filter(r => !r.dueDate), [rows])

    // Calendar grid: weeks × 7 days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1)
        const lastDay = new Date(currentYear, currentMonth + 1, 0)

        // Day of week: 0=Mon, 6=Sun (ISO)
        let startDow = firstDay.getDay() - 1
        if (startDow < 0) startDow = 6

        const days = []

        // Previous month padding
        for (let i = startDow - 1; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth, -i)
            days.push({ date: d, isCurrentMonth: false })
        }

        // Current month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push({ date: new Date(currentYear, currentMonth, d), isCurrentMonth: true })
        }

        // Next month padding (fill to 6 weeks)
        const remaining = 42 - days.length
        for (let d = 1; d <= remaining; d++) {
            days.push({ date: new Date(currentYear, currentMonth + 1, d), isCurrentMonth: false })
        }

        return days
    }, [currentMonth, currentYear])

    // Get tasks for selected day
    const selectedDayTasks = useMemo(() => {
        if (!selectedDay) return []
        const key = `${selectedDay.year}-${String(selectedDay.month + 1).padStart(2, '0')}-${String(selectedDay.day).padStart(2, '0')}`
        return tasksByDate[key] || []
    }, [selectedDay, tasksByDate])

    // Priority colors
    const priorityColors = {
        'Haute': '#e7515a',
        'Moyenne': '#e2a03f',
        'Basse': '#00ab55',
        'Critique': '#e7515a',
    }

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            {/* Calendar grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                            {MONTH_NAMES[currentMonth]} {currentYear}
                        </h2>
                        <button
                            type="button"
                            onClick={goToToday}
                            className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                        >
                            Aujourd'hui
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Day names header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }} className="mb-1">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-2">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                    {calendarDays.map((dayInfo, i) => {
                        const d = dayInfo.date
                        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                        const tasks = tasksByDate[dateKey] || []
                        const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
                        const isSelected = selectedDay && d.getDate() === selectedDay.day && d.getMonth() === selectedDay.month && d.getFullYear() === selectedDay.year

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedDay({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })}
                                className={`
                                    relative flex flex-col items-start p-1.5 min-h-[80px]
                                    transition-all duration-150 cursor-pointer
                                    ${dayInfo.isCurrentMonth
                                        ? 'bg-white dark:bg-[#0e1726]'
                                        : 'bg-gray-50 dark:bg-[#0a1120]'
                                    }
                                    ${isSelected
                                        ? 'ring-2 ring-primary ring-inset'
                                        : 'hover:bg-blue-50/50 dark:hover:bg-white/[0.02]'
                                    }
                                `}
                            >
                                {/* Day number */}
                                <span className={`
                                    text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                                    ${isToday
                                        ? 'bg-primary text-white'
                                        : dayInfo.isCurrentMonth
                                            ? 'text-gray-700 dark:text-gray-300'
                                            : 'text-gray-300 dark:text-gray-600'
                                    }
                                `}>
                                    {d.getDate()}
                                </span>

                                {/* Task dots / previews */}
                                {tasks.length > 0 && (
                                    <div className="flex flex-col gap-0.5 mt-1 w-full">
                                        {tasks.slice(0, 3).map(task => (
                                            <div
                                                key={task._id}
                                                className="text-[9px] leading-tight truncate px-1 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: (task.statusColor || '#4361ee') + '15',
                                                    color: task.statusColor || '#4361ee',
                                                }}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                        {tasks.length > 3 && (
                                            <span className="text-[9px] text-gray-400 px-1">+{tasks.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Side panel: selected day details */}
            <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-white/[0.02] rounded-xl p-4">
                {selectedDay ? (
                    <>
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                            {selectedDay.day} {MONTH_NAMES[selectedDay.month]} {selectedDay.year}
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">
                            {selectedDayTasks.length} tâche{selectedDayTasks.length !== 1 ? 's' : ''}
                        </p>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {selectedDayTasks.length === 0 ? (
                                <div className="text-xs text-gray-400 text-center py-8">
                                    Aucune tâche ce jour
                                </div>
                            ) : (
                                selectedDayTasks.map(task => (
                                    <a
                                        key={task._id}
                                        href={`/account/${accountNumber}/record/${entitySlug}/${task._id}`}
                                        className="block p-3 rounded-xl bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/5 hover:border-primary/30 hover:shadow-sm transition-all group"
                                    >
                                        <div className="flex items-start gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                                                style={{ backgroundColor: task.statusColor || '#4361ee' }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-white truncate group-hover:text-primary transition-colors">
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {task.status && (
                                                        <span
                                                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                                            style={{
                                                                backgroundColor: (task.statusColor || '#9ca3af') + '20',
                                                                color: task.statusColor || '#9ca3af',
                                                            }}
                                                        >
                                                            {task.status}
                                                        </span>
                                                    )}
                                                    {task.priority && (
                                                        <span
                                                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                                            style={{
                                                                backgroundColor: (priorityColors[task.priority] || '#9ca3af') + '15',
                                                                color: priorityColors[task.priority] || '#9ca3af',
                                                            }}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <svg className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 2V5M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p className="text-xs text-gray-400">Sélectionnez un jour pour voir les tâches</p>
                    </div>
                )}

                {/* Unscheduled tasks */}
                {unscheduledTasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-800">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Sans échéance ({unscheduledTasks.length})
                        </p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {unscheduledTasks.slice(0, 5).map(task => (
                                <a
                                    key={task._id}
                                    href={`/account/${accountNumber}/record/${entitySlug}/${task._id}`}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-white dark:hover:bg-white/5 hover:text-primary transition-colors"
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: task.statusColor || '#9ca3af' }}
                                    />
                                    <span className="truncate">{task.title}</span>
                                </a>
                            ))}
                            {unscheduledTasks.length > 5 && (
                                <span className="text-[10px] text-gray-400 px-2">+{unscheduledTasks.length - 5} autres...</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
