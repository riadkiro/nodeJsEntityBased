/**
 * EditorHeader Component
 * Header with document name, formatting toolbar, save timestamp, and PDF button
 * Enhanced with: text/highlight colors, heading selector, table insert, 
 * blockquote, horizontal rule, indent/outdent, undo/redo
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'

// Color presets for text and highlight
const TEXT_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
]

const HIGHLIGHT_COLORS = [
    'transparent', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000',
    '#ffd966', '#93c47d', '#6fa8dc', '#8e7cc3', '#d5a6bd', '#f6b26b',
]

const HEADING_OPTIONS = [
    { label: 'Normal', tag: 'p', value: '' },
    { label: 'Titre 1', tag: 'h1', value: 'h1' },
    { label: 'Titre 2', tag: 'h2', value: 'h2' },
    { label: 'Titre 3', tag: 'h3', value: 'h3' },
    { label: 'Titre 4', tag: 'h4', value: 'h4' },
]

function ColorPicker({ colors, currentColor, onSelect, icon, title, cols = 10 }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center gap-0.5"
                title={title}
            >
                <div className="relative">
                    <iconify-icon icon={icon} width="18"></iconify-icon>
                    <div
                        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full"
                        style={{ backgroundColor: currentColor || '#000' }}
                    />
                </div>
                <iconify-icon icon="tabler:chevron-down" width="8"></iconify-icon>
            </button>
            {open && (
                <div
                    className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl p-2 z-50"
                    style={{ width: cols === 10 ? '224px' : '168px' }}
                >
                    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                        {colors.map((color, i) => (
                            <button
                                key={i}
                                onClick={() => { onSelect(color); setOpen(false) }}
                                className="w-5 h-5 rounded border border-gray-200 dark:border-gray-600 hover:scale-125 transition-transform cursor-pointer"
                                style={{
                                    backgroundColor: color === 'transparent' ? 'transparent' : color,
                                    backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)' : 'none',
                                    backgroundSize: color === 'transparent' ? '6px 6px' : 'auto',
                                    backgroundPosition: color === 'transparent' ? '0 0, 3px 3px' : 'auto',
                                }}
                                title={color === 'transparent' ? 'Aucun' : color}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function TableInsertGrid({ onInsert }) {
    const [open, setOpen] = useState(false)
    const [hover, setHover] = useState({ rows: 0, cols: 0 })
    const ref = useRef(null)

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                title="Insérer un tableau"
            >
                <iconify-icon icon="tabler:table" width="18"></iconify-icon>
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl p-3 z-50">
                    <p className="text-xs text-gray-500 mb-2">
                        {hover.rows > 0 ? `${hover.rows} × ${hover.cols}` : 'Sélectionnez la taille'}
                    </p>
                    <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
                        {Array.from({ length: 8 * 6 }).map((_, i) => {
                            const row = Math.floor(i / 8) + 1
                            const col = (i % 8) + 1
                            const isActive = row <= hover.rows && col <= hover.cols
                            return (
                                <div
                                    key={i}
                                    className={`w-4 h-4 border rounded-sm cursor-pointer transition-colors ${isActive
                                        ? 'bg-primary/30 border-primary'
                                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-primary/10'
                                        }`}
                                    onMouseEnter={() => setHover({ rows: row, cols: col })}
                                    onClick={() => { onInsert(row, col); setOpen(false); setHover({ rows: 0, cols: 0 }) }}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function EditorHeader({
    doc,
    setDoc,
    accountNumber,
    lastSaved,
    triggerSave,
    handlePdfExport,
    // Template props
    availableEntities,
    // Paste mode props
    pasteMode,
    setPasteMode,
    // Formatting props
    currentFont,
    currentFontSize,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    currentAlignment,
    currentLineHeight,
    currentLetterSpacing,
    handleFormat,
    handleFontSizeChange,
    handleLineSpacingChange,
    handleLetterSpacingChange,
    FONT_FAMILIES,
    FONT_SIZES
}) {
    const [textColor, setTextColor] = useState('#000000')
    const [highlightColor, setHighlightColor] = useState('transparent')

    const handleNameChange = (e) => {
        setDoc(prev => ({ ...prev, name: e.target.value }))
        triggerSave()
    }

    const formatSavedTime = () => {
        if (!lastSaved) return null
        const now = new Date()
        const diff = Math.floor((now - lastSaved) / 1000)
        if (diff < 60) return `Saved ${diff}s ago`
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
        return lastSaved.toLocaleTimeString()
    }

    const handleTextColor = useCallback((color) => {
        setTextColor(color)
        document.execCommand('foreColor', false, color)
        triggerSave()
    }, [triggerSave])

    const handleHighlightColor = useCallback((color) => {
        setHighlightColor(color)
        if (color === 'transparent') {
            document.execCommand('removeFormat', false, null)
        } else {
            document.execCommand('hiliteColor', false, color)
        }
        triggerSave()
    }, [triggerSave])

    const handleHeadingChange = useCallback((value) => {
        if (!value) {
            document.execCommand('formatBlock', false, 'p')
        } else {
            document.execCommand('formatBlock', false, value)
        }
        triggerSave()
    }, [triggerSave])

    const handleTableInsert = useCallback((rows, cols) => {
        let tableHtml = '<table style="width:100%; border-collapse:collapse; margin:16px 0;">'
        // Header row
        tableHtml += '<thead><tr>'
        for (let c = 0; c < cols; c++) {
            tableHtml += `<th style="border:1px solid #d1d5db; padding:8px 12px; background:#f3f4f6; text-align:left; font-weight:600; font-size:14px;">En-tête ${c + 1}</th>`
        }
        tableHtml += '</tr></thead><tbody>'
        // Data rows
        for (let r = 0; r < rows - 1; r++) {
            tableHtml += '<tr>'
            for (let c = 0; c < cols; c++) {
                tableHtml += '<td style="border:1px solid #d1d5db; padding:8px 12px; font-size:14px;">&nbsp;</td>'
            }
            tableHtml += '</tr>'
        }
        tableHtml += '</tbody></table><p><br></p>'
        document.execCommand('insertHTML', false, tableHtml)
        triggerSave()
    }, [triggerSave])

    const handleInsertHR = useCallback(() => {
        const html = `<div class="doc-separator-container" style="width: 100%; display: block; margin: 16px 0;" tabindex="0">
            <div class="doc-separator-line" style="border-top: 2px solid #e5e7eb; display: inline-block; position: relative; min-height: 8px; width: 100%; cursor: pointer;"></div>
        </div><p><br></p>`
        document.execCommand('insertHTML', false, html)
        triggerSave()
    }, [triggerSave])

    const handleInsertBlockquote = useCallback(() => {
        document.execCommand('formatBlock', false, 'blockquote')
        triggerSave()
    }, [triggerSave])

    // Detect current heading
    const detectCurrentHeading = () => {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return ''
        let node = sel.getRangeAt(0).commonAncestorContainer
        if (node.nodeType === 3) node = node.parentElement
        while (node) {
            const tag = node.tagName?.toLowerCase()
            if (['h1', 'h2', 'h3', 'h4'].includes(tag)) return tag
            if (['p', 'div'].includes(tag)) return ''
            node = node.parentElement
        }
        return ''
    }

    // Get linked entity names for tags
    const linkedEntities = (availableEntities || []).filter(e => {
        const ids = doc.entityIds || (doc.entityId ? [doc.entityId] : [])
        return ids.includes(e.id)
    })

    return (
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex flex-col">
            {/* Top Row: Title and Actions */}
            <div className="flex items-center px-4 py-2 border-b dark:border-gray-800">
                {/* Back Button */}
                <a
                    href={`/account/${accountNumber}/documents`}
                    className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                    <iconify-icon icon="tabler:arrow-left" width="20"></iconify-icon>
                </a>

                {/* Document Name + Entity Tags */}
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={doc.name}
                        onChange={handleNameChange}
                        className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                        placeholder="Document sans titre"
                    />
                    {/* Entity Tags - shown when this template is linked to entities */}
                    {doc.isTemplate && linkedEntities.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {linkedEntities.map(entity => (
                                <span
                                    key={entity.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/50"
                                >
                                    <iconify-icon icon={entity.icon || 'solar:database-bold'} width="11"></iconify-icon>
                                    {entity.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Save Status */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mr-3">
                    {formatSavedTime() && (
                        <>
                            <iconify-icon icon="tabler:cloud-check" width="16" className="text-green-500"></iconify-icon>
                            <span>{formatSavedTime()}</span>
                        </>
                    )}
                </div>

                {/* Template Toggle Button - config shows in right sidebar */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('toggle-template-panel'))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${doc.isTemplate
                        ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700'
                        : 'text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-500 dark:border-gray-700 dark:hover:border-amber-600'
                        }`}
                >
                    <iconify-icon icon={doc.isTemplate ? 'solar:magic-stick-3-bold-duotone' : 'solar:magic-stick-3-line-duotone'} width="16"></iconify-icon>
                    <span>{doc.isTemplate ? 'Template ✓' : 'Template'}</span>
                </button>

                {/* Generate Button - only for templates */}
                {doc.isTemplate && doc._id && (
                    <a
                        href={`/account/${accountNumber}/documents/${doc._id}/generate`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700 ml-1.5"
                    >
                        <iconify-icon icon="solar:play-bold-duotone" width="15"></iconify-icon>
                        <span>Générer</span>
                    </a>
                )}

                {/* PDF Button */}
                <button
                    onClick={handlePdfExport}
                    disabled={!doc._id}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <iconify-icon icon="tabler:file-type-pdf" width="18"></iconify-icon>
                    <span>PDF</span>
                </button>
            </div>

            {/* Toolbar Row */}
            <div className="flex items-center px-3 py-1 gap-0.5 flex-nowrap overflow-x-auto">
                {/* Undo / Redo */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand('undo') }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Annuler (Ctrl+Z)"
                >
                    <iconify-icon icon="tabler:arrow-back-up" width="18"></iconify-icon>
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand('redo') }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Rétablir (Ctrl+Y)"
                >
                    <iconify-icon icon="tabler:arrow-forward-up" width="18"></iconify-icon>
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Heading Selector */}
                <select
                    value={detectCurrentHeading()}
                    onChange={(e) => handleHeadingChange(e.target.value)}
                    className="form-select text-[11px] py-0.5 px-1.5 border-gray-200 dark:border-gray-800 dark:bg-gray-800 rounded"
                    style={{ width: '80px', minWidth: '80px', flex: 'none' }}
                >
                    {HEADING_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Font Family */}
                <select
                    value={currentFont}
                    onChange={(e) => handleFormat('fontName', e.target.value)}
                    className="form-select text-[11px] py-0.5 px-1.5 border-gray-200 dark:border-gray-800 dark:bg-gray-800 rounded"
                    style={{ width: '112px', minWidth: '112px', flex: 'none' }}
                >
                    {FONT_FAMILIES.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                </select>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Font Size */}
                <div className="flex items-center gap-0">
                    <button
                        onMouseDown={(e) => { e.preventDefault(); handleFontSizeChange(Math.max(8, currentFontSize - 1)) }}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                        title="Réduire la taille"
                    >
                        <iconify-icon icon="tabler:minus" width="12"></iconify-icon>
                    </button>
                    <input
                        type="number"
                        value={currentFontSize}
                        onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 16)}
                        onFocus={(e) => e.target.select()}
                        className="w-10 text-center text-xs py-0.5 border border-gray-200 dark:border-gray-800 dark:bg-gray-800 rounded"
                        min={8}
                        max={72}
                    />
                    <button
                        onMouseDown={(e) => { e.preventDefault(); handleFontSizeChange(Math.min(72, currentFontSize + 1)) }}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                        title="Augmenter la taille"
                    >
                        <iconify-icon icon="tabler:plus" width="12"></iconify-icon>
                    </button>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Bold */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('bold') }}
                    className={`p-1.5 rounded transition-colors ${isBold ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Gras (Ctrl+B)"
                >
                    <iconify-icon icon="tabler:bold" width="18"></iconify-icon>
                </button>

                {/* Italic */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('italic') }}
                    className={`p-1.5 rounded transition-colors ${isItalic ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Italique (Ctrl+I)"
                >
                    <iconify-icon icon="tabler:italic" width="18"></iconify-icon>
                </button>

                {/* Underline */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('underline') }}
                    className={`p-1.5 rounded transition-colors ${isUnderline ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Souligné (Ctrl+U)"
                >
                    <iconify-icon icon="tabler:underline" width="18"></iconify-icon>
                </button>

                {/* Strikethrough */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('strikeThrough') }}
                    className={`p-1.5 rounded transition-colors ${isStrikethrough ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Barré"
                >
                    <iconify-icon icon="tabler:strikethrough" width="18"></iconify-icon>
                </button>

                {/* Text Color */}
                <ColorPicker
                    colors={TEXT_COLORS}
                    currentColor={textColor}
                    onSelect={handleTextColor}
                    icon="tabler:letter-a"
                    title="Couleur du texte"
                />

                {/* Highlight Color */}
                <ColorPicker
                    colors={HIGHLIGHT_COLORS}
                    currentColor={highlightColor}
                    onSelect={handleHighlightColor}
                    icon="tabler:highlight"
                    title="Surligner"
                    cols={6}
                />

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Alignment */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyLeft') }}
                    className={`p-1.5 rounded transition-colors ${currentAlignment === 'left' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Aligner à gauche"
                >
                    <iconify-icon icon="tabler:align-left" width="18"></iconify-icon>
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyCenter') }}
                    className={`p-1.5 rounded transition-colors ${currentAlignment === 'center' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Centrer"
                >
                    <iconify-icon icon="tabler:align-center" width="18"></iconify-icon>
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyRight') }}
                    className={`p-1.5 rounded transition-colors ${currentAlignment === 'right' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Aligner à droite"
                >
                    <iconify-icon icon="tabler:align-right" width="18"></iconify-icon>
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyFull') }}
                    className={`p-1.5 rounded transition-colors ${currentAlignment === 'justify' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Justifier"
                >
                    <iconify-icon icon="tabler:align-justified" width="18"></iconify-icon>
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Line Spacing */}
                <div className="relative group">
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center gap-0.5">
                        <iconify-icon icon="tabler:line-height" width="18"></iconify-icon>
                        <span className="text-[9px]">{currentLineHeight}</span>
                    </button>
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-800 rounded-lg shadow-lg py-1 hidden group-hover:block z-50 min-w-[80px]">
                        {[1, 1.15, 1.5, 2, 2.5, 3].map(val => (
                            <button
                                key={val}
                                onClick={() => handleLineSpacingChange(val)}
                                className={`w-full px-3 py-1 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${currentLineHeight === val ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Letter Spacing */}
                <div className="relative group">
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center gap-0.5">
                        <iconify-icon icon="tabler:letter-spacing" width="18"></iconify-icon>
                        <span className="text-[9px]">{currentLetterSpacing}px</span>
                    </button>
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-800 rounded-lg shadow-lg py-1 hidden group-hover:block z-50 min-w-[80px]">
                        {[-2, -1, 0, 1, 2, 3, 4, 5].map(val => (
                            <button
                                key={val}
                                onClick={() => handleLetterSpacingChange(val)}
                                className={`w-full px-3 py-1 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${currentLetterSpacing === val ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                {val}px
                            </button>
                        ))}
                    </div>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Lists */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList') }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Liste à puces"
                >
                    <iconify-icon icon="tabler:list" width="18"></iconify-icon>
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList') }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Liste numérotée"
                >
                    <iconify-icon icon="tabler:list-numbers" width="18"></iconify-icon>
                </button>

                {/* Indent / Outdent */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('outdent') }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Réduire le retrait"
                >
                    <iconify-icon icon="tabler:indent-decrease" width="18"></iconify-icon>
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('indent') }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Augmenter le retrait"
                >
                    <iconify-icon icon="tabler:indent-increase" width="18"></iconify-icon>
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Table Insert */}
                <TableInsertGrid onInsert={handleTableInsert} />

                {/* Blockquote */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleInsertBlockquote() }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Citation"
                >
                    <iconify-icon icon="tabler:blockquote" width="18"></iconify-icon>
                </button>

                {/* Horizontal Rule */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleInsertHR() }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Séparateur horizontal"
                >
                    <iconify-icon icon="tabler:separator" width="18"></iconify-icon>
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Clear Formatting */}
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleFormat('removeFormat') }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Supprimer le formatage"
                >
                    <iconify-icon icon="tabler:clear-formatting" width="18"></iconify-icon>
                </button>

                {/* Paste Mode */}
                <div className="relative group">
                    <button
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center gap-0.5"
                        title="Mode de collage"
                    >
                        <iconify-icon icon="tabler:clipboard-text" width="18"></iconify-icon>
                        <iconify-icon icon="tabler:chevron-down" width="10"></iconify-icon>
                    </button>
                    <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-800 rounded-lg shadow-lg py-1 hidden group-hover:block z-50 min-w-[140px]">
                        <button
                            onClick={() => setPasteMode('keep')}
                            className={`w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${pasteMode === 'keep' ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <iconify-icon icon="tabler:text-wrap-disabled" width="14"></iconify-icon>
                            Coller source
                        </button>
                        <button
                            onClick={() => setPasteMode('match')}
                            className={`w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${pasteMode === 'match' ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <iconify-icon icon="tabler:wand" width="14"></iconify-icon>
                            Adapter style
                        </button>
                        <button
                            onClick={() => setPasteMode('plain')}
                            className={`w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${pasteMode === 'plain' ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <iconify-icon icon="tabler:txt" width="14"></iconify-icon>
                            Texte brut
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
