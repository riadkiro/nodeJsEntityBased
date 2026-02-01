/**
 * KanbanColumn - Column component for Kanban board
 * Drop zone for cards with header and add button
 */
import React, { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

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

    return (
        <div
            className="panel w-72 flex-none bg-gray-50 dark:bg-black/20 border dark:border-gray-800"
            style={{ borderTop: `4px solid ${column.color}` }}
        >
            {/* Header */}
            <div className="mb-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {column.icon && (
                        <iconify-icon icon={column.icon} style={{ color: column.color }}></iconify-icon>
                    )}
                    <h4 className="text-base font-bold uppercase tracking-wider">{column.title}</h4>
                </div>

                <div className="flex items-center">
                    {/* Add button */}
                    <button
                        type="button"
                        className="hover:text-primary ltr:mr-2 rtl:ml-2"
                        onClick={onAddRecord}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                            <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* Dropdown menu */}
                    <div ref={menuRef} className="dropdown relative">
                        <button
                            type="button"
                            className="hover:text-primary"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-5 w-5 opacity-70 hover:opacity-100">
                                <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                                <circle opacity="0.5" cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="19" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </button>
                        {menuOpen && (
                            <ul className="absolute right-0 z-10 mt-1 min-w-[160px] rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-[#1b2e4b]">
                                <li>
                                    <a
                                        href="#"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white-light dark:hover:bg-white-light/10"
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
                    className={`sortable-list min-h-[150px] space-y-4 transition-colors ${isOver ? 'bg-primary/5 rounded-lg' : ''}`}
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

            {/* Add record button */}
            <div className="pt-4 mt-2">
                <button
                    type="button"
                    className="btn btn-primary flex items-center justify-center w-full gap-2 py-2.5 rounded-lg text-xs font-bold uppercase"
                    onClick={onAddRecord}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Ajouter un record
                </button>
            </div>
        </div>
    )
}
