/**
 * KanbanColumn - Enhanced ClickUp-style column
 * Features: color bar, count badge, collapse toggle, inline quick-add, 
 * scroll shadow, drop zone indicator
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

function hexToRgba(hex, alpha = 0.1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(128,128,128,${alpha})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

export default function KanbanColumn({
    column,
    records,
    recordIds,
    onAddClick,
    onCardClick,
    entitySlug,
    accountNumber,
    onInlineAdd
}) {
    const [collapsed, setCollapsed] = useState(false)
    const [showInline, setShowInline] = useState(false)
    const [inlineTitle, setInlineTitle] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const inlineRef = useRef(null)
    const listRef = useRef(null)
    const [hasScroll, setHasScroll] = useState(false)

    const { setNodeRef, isOver } = useDroppable({
        id: String(column.id),
    })

    const dark = document.documentElement.classList.contains('dark')

    useEffect(() => {
        if (showInline) {
            setTimeout(() => inlineRef.current?.focus(), 50)
        }
    }, [showInline])

    // Check if list overflows
    useEffect(() => {
        const el = listRef.current
        if (!el) return
        const check = () => setHasScroll(el.scrollHeight > el.clientHeight)
        check()
        const obs = new ResizeObserver(check)
        obs.observe(el)
        return () => obs.disconnect()
    }, [records.length])

    const handleInlineSubmit = async (e) => {
        e?.preventDefault()
        if (!inlineTitle.trim() || submitting) return
        setSubmitting(true)
        try {
            if (onInlineAdd) {
                await onInlineAdd(inlineTitle.trim(), column.id)
            }
            setInlineTitle('')
            setShowInline(false)
        } catch (err) {
            console.error('[KanbanColumn] Inline add error:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleInlineKeyDown = (e) => {
        if (e.key === 'Enter') handleInlineSubmit()
        if (e.key === 'Escape') {
            setShowInline(false)
            setInlineTitle('')
        }
    }

    // Collapsed state
    if (collapsed) {
        return (
            <div
                className="w-10 flex-none rounded-lg overflow-hidden cursor-pointer transition-all hover:w-12 group"
                style={{
                    backgroundColor: hexToRgba(column.color, dark ? 0.08 : 0.04),
                    border: `1px solid ${hexToRgba(column.color, dark ? 0.2 : 0.1)}`
                }}
                onClick={() => setCollapsed(false)}
            >
                <div style={{ height: '4px', backgroundColor: column.color }} />
                <div className="flex flex-col items-center py-3 gap-2">
                    <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: column.color }}
                    >
                        {records.length}
                    </span>
                    <span
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                            color: column.color,
                            writingMode: 'vertical-lr',
                            textOrientation: 'mixed'
                        }}
                    >
                        {column.title}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            className={`w-[280px] flex-none rounded-lg overflow-hidden transition-all flex flex-col ${isOver ? 'ring-2 ring-primary/50 ring-offset-2 dark:ring-offset-[#0e1726]' : ''
                }`}
            style={{
                backgroundColor: isOver
                    ? hexToRgba(column.color, dark ? 0.15 : 0.08)
                    : hexToRgba(column.color, dark ? 0.06 : 0.03),
                border: `1px solid ${hexToRgba(column.color, dark ? 0.2 : 0.1)}`,
                maxHeight: 'calc(100vh - 180px)'
            }}
            data-dnd="column"
        >
            {/* Color bar */}
            <div style={{ height: '3px', backgroundColor: column.color, flexShrink: 0 }} />

            {/* Header */}
            <div className="px-3 py-2.5 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: column.color, color: '#fff' }}
                    >
                        {column.icon && <iconify-icon icon={column.icon} width="11"></iconify-icon>}
                        <span className="truncate max-w-[120px]">{column.title}</span>
                    </span>
                    <span
                        className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold"
                        style={{
                            backgroundColor: hexToRgba(column.color, 0.15),
                            color: column.color
                        }}
                    >
                        {records.length}
                    </span>
                </div>
                <div className="flex items-center gap-0.5">
                    {/* Add button */}
                    <button
                        type="button"
                        onClick={() => onAddClick ? onAddClick(column.id) : setShowInline(true)}
                        className="p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-400 hover:text-primary transition-colors"
                        title="Ajouter"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                    {/* Collapse button */}
                    <button
                        type="button"
                        onClick={() => setCollapsed(true)}
                        className="p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Réduire"
                    >
                        <iconify-icon icon="solar:alt-arrow-left-bold" width="14"></iconify-icon>
                    </button>
                </div>
            </div>

            {/* Cards list - scrollable */}
            <div
                ref={listRef}
                className="px-2 pb-2 flex-1 overflow-y-auto overflow-x-hidden"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${hexToRgba(column.color, 0.3)} transparent`
                }}
            >
                <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
                    <div className={`space-y-2 rounded-lg transition-all ${isOver ? 'bg-primary/5 p-1.5' : ''
                        }`} style={{ minHeight: records.length === 0 ? '200px' : '60px' }}>
                        {records.map(r => (
                            <KanbanCard
                                key={r._id}
                                record={r}
                                onCardClick={onCardClick}
                                entitySlug={entitySlug}
                                accountNumber={accountNumber}
                            />
                        ))}

                        {/* Empty state / drop hint */}
                        {records.length === 0 && (
                            <div className={`flex flex-col items-center justify-center h-full py-10 rounded-lg border-2 border-dashed transition-all ${isOver
                                    ? 'border-primary/40 bg-primary/5 text-primary'
                                    : 'border-transparent text-gray-400 dark:text-gray-600'
                                }`}>
                                <iconify-icon icon={isOver ? 'solar:add-circle-bold-duotone' : 'solar:inbox-bold-duotone'} width="28" style={{ opacity: isOver ? 0.8 : 0.5 }}></iconify-icon>
                                <span className="text-[11px] mt-1">{isOver ? 'Déposer ici' : 'Aucun élément'}</span>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>

            {/* Inline quick-add */}
            {showInline && (
                <div className="px-2 pb-2 flex-shrink-0">
                    <div className="bg-white dark:bg-[#1b2e4b] rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-2">
                        <input
                            ref={inlineRef}
                            type="text"
                            value={inlineTitle}
                            onChange={e => setInlineTitle(e.target.value)}
                            onKeyDown={handleInlineKeyDown}
                            placeholder="Titre..."
                            className="w-full text-sm bg-transparent border-0 p-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-0 outline-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handleInlineSubmit}
                                    disabled={!inlineTitle.trim() || submitting}
                                    className="px-2.5 py-1 rounded text-xs font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-40 transition-colors"
                                >
                                    {submitting ? '...' : 'Ajouter'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowInline(false); setInlineTitle('') }}
                                    className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom add button */}
            {!showInline && (
                <div className="px-2 pb-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowInline(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs text-gray-400 hover:text-primary hover:bg-white/60 dark:hover:bg-gray-700/40 transition-all"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Ajouter
                    </button>
                </div>
            )}
        </div>
    )
}
