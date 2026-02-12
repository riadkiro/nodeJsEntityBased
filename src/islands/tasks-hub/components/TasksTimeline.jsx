/**
 * TasksTimeline — Horizontal timeline (Gantt-like) view
 * 
 * Displays tasks as horizontal bars on a date axis.
 * Tasks without due date are shown in a separate "No date" section.
 * Features: scrollable timeline, status color coding, hover details,
 * today marker, zoom controls, task grouping by status.
 */
import React, { useState, useMemo, useRef, useCallback } from 'react'

export default function TasksTimeline({
    rows,
    accountNumber,
    entitySlug,
}) {
    const scrollRef = useRef(null)
    const [hoveredTask, setHoveredTask] = useState(null)

    // Determine date range from tasks with due dates
    const { startDate, endDate, dayCount, datedTasks, undatedTasks } = useMemo(() => {
        const dated = rows.filter(r => r.dueDate && !isNaN(new Date(r.dueDate).getTime()))
        const undated = rows.filter(r => !r.dueDate || isNaN(new Date(r.dueDate).getTime()))

        if (dated.length === 0) {
            const now = new Date()
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
                dayCount: 30,
                datedTasks: [],
                undatedTasks: rows,
            }
        }

        const dates = dated.map(r => new Date(r.dueDate).getTime())
        const min = new Date(Math.min(...dates))
        const max = new Date(Math.max(...dates))

        // Add 7 day padding on each side
        const start = new Date(min)
        start.setDate(start.getDate() - 7)
        const end = new Date(max)
        end.setDate(end.getDate() + 7)

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

        return {
            startDate: start,
            endDate: end,
            dayCount: Math.max(days, 30),
            datedTasks: dated,
            undatedTasks: undated,
        }
    }, [rows])

    // Group tasks by status for the timeline
    const groupedByStatus = useMemo(() => {
        const groups = {}
        datedTasks.forEach(task => {
            const status = task.status || 'Sans statut'
            if (!groups[status]) groups[status] = { tasks: [], color: task.statusColor || '#6366f1' }
            groups[status].tasks.push(task)
        })
        return Object.entries(groups)
    }, [datedTasks])

    // Generate date headers (day labels)
    const dateHeaders = useMemo(() => {
        const headers = []
        for (let i = 0; i < dayCount; i++) {
            const d = new Date(startDate)
            d.setDate(d.getDate() + i)
            headers.push(d)
        }
        return headers
    }, [startDate, dayCount])

    // Month groups for header
    const monthGroups = useMemo(() => {
        const groups = []
        let currentMonth = -1
        dateHeaders.forEach((d, i) => {
            const month = d.getMonth()
            if (month !== currentMonth) {
                groups.push({
                    label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                    start: i,
                    count: 1,
                })
                currentMonth = month
            } else {
                groups[groups.length - 1].count++
            }
        })
        return groups
    }, [dateHeaders])

    // Cell width
    const CELL_WIDTH = 36
    const ROW_HEIGHT = 40
    const totalWidth = dayCount * CELL_WIDTH

    // Get X position for a date
    const getDateX = useCallback((dateStr) => {
        const d = new Date(dateStr)
        const diff = (d - startDate) / (1000 * 60 * 60 * 24)
        return diff * CELL_WIDTH
    }, [startDate])

    // Today marker position
    const todayX = useMemo(() => {
        const today = new Date()
        const diff = (today - startDate) / (1000 * 60 * 60 * 24)
        return diff * CELL_WIDTH
    }, [startDate])

    // Priority colors
    const priorityColors = {
        'Haute': '#e7515a',
        'Moyenne': '#e2a03f',
        'Basse': '#00ab55',
        'Critique': '#e7515a',
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Timeline container */}
            <div className="flex-1 overflow-auto" ref={scrollRef}>
                <div style={{ minWidth: totalWidth + 200 }}>
                    {/* Month headers */}
                    <div className="flex sticky top-0 z-10 bg-white dark:bg-[#0e1726] border-b dark:border-gray-800">
                        <div className="w-48 flex-shrink-0 px-3 py-2 border-r dark:border-gray-800">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Statut</span>
                        </div>
                        <div className="flex">
                            {monthGroups.map((group, i) => (
                                <div
                                    key={i}
                                    className="text-center text-xs font-semibold text-gray-600 dark:text-gray-300 py-2 border-r dark:border-gray-800 capitalize"
                                    style={{ width: group.count * CELL_WIDTH }}
                                >
                                    {group.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="flex sticky top-[33px] z-10 bg-gray-50 dark:bg-[#0a1120] border-b dark:border-gray-800">
                        <div className="w-48 flex-shrink-0 border-r dark:border-gray-800" />
                        <div className="flex">
                            {dateHeaders.map((d, i) => {
                                const isToday = d.toDateString() === new Date().toDateString()
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6
                                return (
                                    <div
                                        key={i}
                                        className={`text-center text-[10px] py-1.5 border-r dark:border-gray-800/50
                                            ${isToday ? 'bg-primary/10 text-primary font-bold' : isWeekend ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'}
                                        `}
                                        style={{ width: CELL_WIDTH }}
                                    >
                                        {d.getDate()}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Status groups */}
                    {groupedByStatus.map(([status, group]) => (
                        <div key={status}>
                            {/* Group header */}
                            <div className="flex border-b dark:border-gray-800">
                                <div className="w-48 flex-shrink-0 px-3 py-2 flex items-center gap-2 border-r dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: group.color }}
                                    />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                        {status}
                                    </span>
                                    <span className="text-[10px] text-gray-400 ml-auto">{group.tasks.length}</span>
                                </div>
                                <div className="flex-1" />
                            </div>

                            {/* Task rows */}
                            {group.tasks.map(task => {
                                const x = getDateX(task.dueDate)
                                const barWidth = Math.max(CELL_WIDTH * 2, 100) // Min bar width
                                const isHovered = hoveredTask === task._id

                                return (
                                    <div
                                        key={task._id}
                                        className="flex border-b dark:border-gray-800/50 relative"
                                        style={{ height: ROW_HEIGHT }}
                                    >
                                        {/* Task label */}
                                        <div className="w-48 flex-shrink-0 px-3 flex items-center border-r dark:border-gray-800">
                                            <a
                                                href={`/account/${accountNumber}/record/${entitySlug}/${task._id}`}
                                                className="text-xs text-gray-600 dark:text-gray-400 truncate hover:text-primary transition-colors"
                                            >
                                                {task.title || 'Sans titre'}
                                            </a>
                                        </div>

                                        {/* Timeline area */}
                                        <div className="flex-1 relative">
                                            {/* Today line */}
                                            {todayX >= 0 && todayX <= totalWidth && (
                                                <div
                                                    className="absolute top-0 bottom-0 w-px bg-primary/30 z-[1]"
                                                    style={{ left: todayX }}
                                                />
                                            )}

                                            {/* Task bar */}
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md cursor-pointer transition-all duration-150 flex items-center px-2 group"
                                                style={{
                                                    left: Math.max(0, x - barWidth / 2),
                                                    width: barWidth,
                                                    backgroundColor: (task.statusColor || '#4361ee') + '20',
                                                    borderLeft: `3px solid ${task.statusColor || '#4361ee'}`,
                                                    zIndex: isHovered ? 5 : 2,
                                                }}
                                                onMouseEnter={() => setHoveredTask(task._id)}
                                                onMouseLeave={() => setHoveredTask(null)}
                                                onClick={() => window.location.href = `/account/${accountNumber}/record/${entitySlug}/${task._id}`}
                                            >
                                                <span className="text-[10px] font-medium truncate" style={{ color: task.statusColor || '#4361ee' }}>
                                                    {task.title}
                                                </span>

                                                {/* Hover tooltip */}
                                                {isHovered && (
                                                    <div className="absolute bottom-full left-0 mb-2 p-2 rounded-lg bg-white dark:bg-[#0e1726] shadow-lg border dark:border-gray-700 min-w-[200px] z-50"
                                                        style={{ animation: 'popoverSlide 0.1s ease-out' }}
                                                    >
                                                        <p className="text-xs font-medium text-gray-800 dark:text-white">{task.title}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {task.priority && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                                                                    backgroundColor: (priorityColors[task.priority] || '#9ca3af') + '15',
                                                                    color: priorityColors[task.priority] || '#9ca3af',
                                                                }}>
                                                                    {task.priority}
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] text-gray-400">
                                                                {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Due date marker dot */}
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-[3]"
                                                style={{
                                                    left: x - 4,
                                                    backgroundColor: task.statusColor || '#4361ee',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}

                    {/* Undated tasks section */}
                    {undatedTasks.length > 0 && (
                        <div>
                            <div className="flex border-b dark:border-gray-800 bg-gray-50/80 dark:bg-white/[0.03]">
                                <div className="w-48 flex-shrink-0 px-3 py-2 flex items-center gap-2 border-r dark:border-gray-800">
                                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                                    <span className="text-xs font-medium text-gray-500">Sans échéance</span>
                                    <span className="text-[10px] text-gray-400 ml-auto">{undatedTasks.length}</span>
                                </div>
                                <div className="flex-1" />
                            </div>
                            {undatedTasks.map(task => (
                                <div
                                    key={task._id}
                                    className="flex border-b dark:border-gray-800/50"
                                    style={{ height: ROW_HEIGHT }}
                                >
                                    <div className="w-48 flex-shrink-0 px-3 flex items-center border-r dark:border-gray-800">
                                        <a
                                            href={`/account/${accountNumber}/record/${entitySlug}/${task._id}`}
                                            className="text-xs text-gray-400 truncate hover:text-primary transition-colors"
                                        >
                                            {task.title || 'Sans titre'}
                                        </a>
                                    </div>
                                    <div className="flex-1 flex items-center px-4">
                                        <span className="text-[10px] text-gray-300 dark:text-gray-600 italic">
                                            Pas d'échéance définie
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes popoverSlide {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
