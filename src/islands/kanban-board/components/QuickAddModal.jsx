/**
 * QuickAddModal - ClickUp-style quick add record modal
 * 
 * Sleek modal with fields for title, description, status (pre-selected from column),
 * and classification badges. Supports dark mode.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function QuickAddModal({
    isOpen,
    onClose,
    onSubmit,
    columns = [],
    classifications = [],
    defaultColumnId = null,
    entityName = 'Record',
    loading = false
}) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedColumnId, setSelectedColumnId] = useState(defaultColumnId || '')
    const [selectedClassifications, setSelectedClassifications] = useState({})
    const [priority, setPriority] = useState('')
    const titleRef = useRef(null)
    const backdropRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setTitle('')
            setDescription('')
            setSelectedColumnId(defaultColumnId || columns[0]?.id || '')
            setSelectedClassifications({})
            setPriority('')
            setTimeout(() => titleRef.current?.focus(), 100)
        }
    }, [isOpen, defaultColumnId, columns])

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    const handleBackdropClick = (e) => {
        if (e.target === backdropRef.current) onClose()
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!title.trim()) return
        onSubmit({
            title: title.trim(),
            description: description.trim(),
            columnId: selectedColumnId,
            classifications: selectedClassifications,
            priority
        })
    }

    const toggleClassification = (classifId, optionId) => {
        setSelectedClassifications(prev => {
            const current = prev[classifId]
            if (current === optionId) {
                const next = { ...prev }
                delete next[classifId]
                return next
            }
            return { ...prev, [classifId]: optionId }
        })
    }

    if (!isOpen) return null

    const selectedCol = columns.find(c => c.id === selectedColumnId)

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[999] flex items-start justify-center pt-[10vh]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0e1726] overflow-hidden"
                style={{ animation: 'slideUp 0.25s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <iconify-icon icon="solar:add-circle-bold-duotone" class="text-primary" width="18"></iconify-icon>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Nouveau {entityName}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                        <input
                            ref={titleRef}
                            type="text"
                            placeholder="Titre du record..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full text-lg font-medium bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-600 px-0 py-2 focus:border-primary dark:focus:border-primary focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <textarea
                            placeholder="Ajouter une description..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
                            className="w-full text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary/20 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none transition-colors"
                        />
                    </div>

                    {/* Status Selector */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                            Statut
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {columns.filter(c => c.id !== 'none').map(col => (
                                <button
                                    key={col.id}
                                    type="button"
                                    onClick={() => setSelectedColumnId(col.id)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${selectedColumnId === col.id
                                            ? 'ring-2 ring-offset-1 dark:ring-offset-gray-800 shadow-sm'
                                            : 'opacity-60 hover:opacity-90'
                                        }`}
                                    style={{
                                        backgroundColor: selectedColumnId === col.id ? col.color : `${col.color}20`,
                                        color: selectedColumnId === col.id ? '#fff' : col.color,
                                        ringColor: col.color
                                    }}
                                >
                                    {col.icon && <iconify-icon icon={col.icon} width="12"></iconify-icon>}
                                    {col.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Classifications */}
                    {classifications.filter(c => c.options?.length > 0).map(cls => (
                        <div key={cls._id}>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                {cls.name}
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {cls.options.map(opt => {
                                    const isSelected = selectedClassifications[cls._id] === opt._id
                                    return (
                                        <button
                                            key={opt._id}
                                            type="button"
                                            onClick={() => toggleClassification(cls._id, opt._id)}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${isSelected
                                                    ? 'ring-2 ring-offset-1 dark:ring-offset-gray-800 shadow-sm'
                                                    : 'opacity-60 hover:opacity-90'
                                                }`}
                                            style={{
                                                backgroundColor: isSelected ? (opt.color || '#6366f1') : `${opt.color || '#6366f1'}20`,
                                                color: isSelected ? '#fff' : (opt.color || '#6366f1'),
                                                ringColor: opt.color || '#6366f1'
                                            }}
                                        >
                                            {isSelected && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                            {opt.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-400">
                            <button type="button" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Pièce jointe">
                                <iconify-icon icon="solar:paperclip-bold" width="16"></iconify-icon>
                            </button>
                            <button type="button" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Date">
                                <iconify-icon icon="solar:calendar-bold" width="16"></iconify-icon>
                            </button>
                            <button type="button" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Assigner">
                                <iconify-icon icon="solar:user-plus-bold" width="16"></iconify-icon>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={!title.trim() || loading}
                                className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5"
                            >
                                {loading ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                )}
                                Créer
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
