/**
 * KanbanColumn - Column component for Kanban board
 * Drop zone for cards with header
 */
import React, { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

// Helper to convert hex to rgba
function hexToRgba(hex, alpha = 0.1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(128,128,128,${alpha})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

export default function KanbanColumn({ column, records, recordIds }) {
    const { setNodeRef, isOver } = useDroppable({
        id: String(column.id),
    })

    const dark = document.documentElement.classList.contains('dark')
    const bgColor = hexToRgba(column.color, dark ? 0.12 : 0.06)
    const borderColor = hexToRgba(column.color, dark ? 0.3 : 0.15)

    return (
        <div
            ref={setNodeRef}
            className={`w-72 flex-none rounded-lg overflow-hidden transition-all ${isOver ? 'ring-2 ring-primary/50 ring-offset-2' : ''}`}
            style={{
                backgroundColor: isOver ? hexToRgba(column.color, 0.15) : bgColor,
                border: `1px solid ${borderColor}`
            }}
            data-dnd="column"
        >
            {/* Color bar */}
            <div style={{ height: '4px', backgroundColor: column.color }} />

            {/* Header */}
            <div className="px-3 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: column.color, color: '#fff' }}
                    >
                        {column.icon && <iconify-icon icon={column.icon} width="12"></iconify-icon>}
                        {column.title}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{records.length}</span>
                </div>
            </div>

            {/* Cards list */}
            <div className="px-2 pb-3">
                <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
                    <div className={`space-y-2 min-h-[80px] rounded-lg transition-all ${isOver ? 'bg-primary/5 p-2' : ''}`}>
                        {records.map(r => (
                            <KanbanCard key={r._id} record={r} />
                        ))}
                    </div>
                </SortableContext>
            </div>

            {/* Add button */}
            <div className="px-3 pb-3">
                <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Ajouter
                </button>
            </div>
        </div>
    )
}
