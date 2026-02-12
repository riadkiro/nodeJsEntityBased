/**
 * WidgetCard — Individual widget card in the library
 * 
 * Supports grid and list view modes.
 * Draggable — emits drag data for builder consumption.
 * Shows icon, name, description, category badge, and mini-preview indicator.
 */
import React, { useState } from 'react'

const COLOR_MAP = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', shadow: 'shadow-primary/10' },
    info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20', shadow: 'shadow-info/10' },
    success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', shadow: 'shadow-success/10' },
    danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20', shadow: 'shadow-danger/10' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', shadow: 'shadow-warning/10' },
    secondary: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20', shadow: 'shadow-secondary/10' },
}

const CATEGORY_LABELS = {
    timeline: 'Timeline',
    kpi: 'KPI',
    lists: 'Listes',
    special: 'Spéciaux',
}

export default function WidgetCard({ widget, viewMode, onDragStart, onDragEnd }) {
    const [isDragging, setIsDragging] = useState(false)
    const colors = COLOR_MAP[widget.color] || COLOR_MAP.primary

    const handleDragStart = (e) => {
        setIsDragging(true)
        onDragStart(e, widget)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
        onDragEnd()
    }

    if (viewMode === 'list') {
        return (
            <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 rounded-lg border bg-white p-3 transition-all duration-200 cursor-grab active:cursor-grabbing dark:bg-[#1b2e4b] ${isDragging
                        ? `border-primary/40 shadow-lg ${colors.shadow} scale-[1.01]`
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:shadow-md'
                    }`}
            >
                {/* Icon */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
                    <iconify-icon icon={widget.icon} width="20" className={colors.text}></iconify-icon>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm dark:text-white-light truncate">{widget.name}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                            {CATEGORY_LABELS[widget.category]}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{widget.description}</p>
                </div>

                {/* Drag indicator */}
                <div className="shrink-0 text-gray-300 dark:text-gray-600">
                    <iconify-icon icon="solar:hamburger-menu-bold" width="16"></iconify-icon>
                </div>
            </div>
        )
    }

    // Grid mode
    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`group relative rounded-xl border bg-white p-4 transition-all duration-300 cursor-grab active:cursor-grabbing dark:bg-[#1b2e4b] ${isDragging
                    ? `border-primary/40 shadow-xl ${colors.shadow} scale-[1.02] rotate-1`
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5'
                }`}
        >
            {/* Category badge */}
            <span className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                {CATEGORY_LABELS[widget.category]}
            </span>

            {/* Icon */}
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                <iconify-icon icon={widget.icon} width="24" className={colors.text}></iconify-icon>
            </div>

            {/* Name */}
            <h6 className="font-bold text-sm dark:text-white-light mb-1">{widget.name}</h6>

            {/* Description */}
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
                {widget.description}
            </p>

            {/* Mini preview indicator */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {widget.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[9px] text-gray-500 dark:text-gray-400">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <iconify-icon icon="solar:hamburger-menu-bold" width="14"></iconify-icon>
                </div>
            </div>

            {/* Drag overlay indicator */}
            {isDragging && (
                <div className="absolute inset-0 rounded-xl bg-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">Glissez vers le Builder</span>
                </div>
            )}
        </div>
    )
}
