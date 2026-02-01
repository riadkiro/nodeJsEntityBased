/**
 * KanbanColumn - Column component for Kanban board
 * Drop zone for cards with header and add button
 */
import React, { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

// Helper to convert hex to rgba
function hexToRgba(hex, alpha = 0.1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(0,0,0,${alpha})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

export default function KanbanColumn({
    column,
    records,
    onAddRecord,
    onEditRecord,
    onDeleteRecord
}) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    // Droppable setup
    const { setNodeRef, isOver } = useDroppable({
        id: column.id
    })

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        const handleEsc = (e) => {
            if (e.key === 'Escape') setMenuOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEsc)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEsc)
        }
    }, [])

    const recordIds = records.map(r => r._id)
    const bgColor = hexToRgba(column.color, 0.06)
    const borderColor = hexToRgba(column.color, 0.2)

    return (
        <div
            className="w-72 flex-none rounded-lg overflow-hidden"
            style={{
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`
            }}
        >
            {/* Color bar on top */}
            <div style={{ height: '4px', backgroundColor: column.color }} />

            {/* Header */}
            <div className="px-3 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {/* Badge with count */}
                    <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide"
                        style={{
                            backgroundColor: column.color,
                            color: '#fff'
                        }}
                    >
                        {column.icon && (
                            <iconify-icon icon={column.icon} width="12"></iconify-icon>
                        )}
                        {column.title}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{records.length}</span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Add button */}
                    <button
                        type="button"
                        className="p-1 hover:text-primary rounded hover:bg-white/50"
                        onClick={onAddRecord}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* Dropdown menu */}
                    <div ref={menuRef} className="relative">
                        <button
                            type="button"
                            className="p-1 hover:text-primary rounded hover:bg-white/50"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-60">
                                <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                <circle cx="19" cy="12" r="1.5" fill="currentColor" />
                            </svg>
                        </button>
                        {menuOpen && (
                            <ul className="absolute right-0 z-10 mt-1 min-w-[140px] rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-[#1b2e4b]">
                                <li>
                                    <a
                                        href="#"
                                        className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:text-white-light dark:hover:bg-white-light/10"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setMenuOpen(false)
                                        }}
                                    >
                                        Vider la colonne
                                    </a>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Task list - drop zone */}
            <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`px-2 pb-2 space-y-2 min-h-[100px] transition-colors ${isOver ? 'bg-primary/10 rounded' : ''}`}
                    data-id={column.id}
                >
                    {records.map(record => (
                        <KanbanCard
                            key={record._id}
                            record={record}
                            onEdit={() => onEditRecord(record._id)}
                            onDelete={() => onDeleteRecord(record._id)}
                        />
                    ))}
                </div>
            </SortableContext>

            {/* Add record link */}
            <div className="px-3 pb-3">
                <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary"
                    onClick={onAddRecord}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Ajouter Tâche
                </button>
            </div>
        </div>
    )
}
