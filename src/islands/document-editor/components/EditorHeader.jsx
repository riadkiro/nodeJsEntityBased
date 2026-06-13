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

const PDF_ELEMENT_ADD_EVENT = 'dexio:pdf-template-add-element'
const PDF_ACTIVE_FIELD_EVENT = 'dexio:pdf-template-active-field'
const PDF_FIELD_SELECT_EVENT = 'dexio:pdf-template-select-field'
const PDF_FIELD_CLEAR_EVENT = 'dexio:pdf-template-clear-selection'
const PDF_MIN_TEXT_FIELD_WIDTH = 70
const PDF_CURSOR_TEXT_HEIGHT = 20

const PDF_DEFAULT_TEXT_FIELD = {
    type: 'text',
    value: '',
    width: PDF_MIN_TEXT_FIELD_WIDTH,
    height: PDF_CURSOR_TEXT_HEIGHT,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    color: '#111827',
    align: 'left',
    lineHeight: 1.15,
    letterSpacing: 0,
    bold: false,
    italic: false,
    underline: false,
    autoSize: true
}

const PDF_FONT_FAMILIES = ['Arial, sans-serif', 'Inter, sans-serif', 'Times New Roman, serif', 'Courier New, monospace']

function pdfClamp(value, min, max) {
    const number = Number(value)
    if (!Number.isFinite(number)) return min
    return Math.min(max, Math.max(min, number))
}

function getPdfFieldType(field) {
    return field?.type || 'text'
}

function isPdfCheckboxChecked(field) {
    return field?.checked === true
        || field?.value === true
        || ['true', 'checked', '1', 'yes', 'on', '✓'].includes(String(field?.value || '').toLowerCase())
}

function measurePdfTextFieldSize(field, pageDims) {
    const value = String(field?.value ?? field?.text ?? '')
    const fontSize = Number(field?.fontSize || PDF_DEFAULT_TEXT_FIELD.fontSize)
    const lineHeight = Number(field?.lineHeight || PDF_DEFAULT_TEXT_FIELD.lineHeight)
    const lineHeightPx = Math.ceil(fontSize * lineHeight)
    const letterSpacing = Number(field?.letterSpacing || 0)
    const lines = value.split(/\r?\n/)
    let maxLineWidth = PDF_MIN_TEXT_FIELD_WIDTH

    if (typeof document !== 'undefined') {
        const canvas = measurePdfTextFieldSize.canvas || document.createElement('canvas')
        measurePdfTextFieldSize.canvas = canvas
        const context = canvas.getContext('2d')
        if (context) {
            const fontStyle = field?.italic ? 'italic ' : ''
            const fontWeight = field?.bold ? '700 ' : '400 '
            context.font = `${fontStyle}${fontWeight}${fontSize}px ${field?.fontFamily || PDF_DEFAULT_TEXT_FIELD.fontFamily}`
            lines.forEach(line => {
                const measured = context.measureText(line || ' ').width
                const spacing = Math.max(0, (line.length - 1) * letterSpacing)
                maxLineWidth = Math.max(maxLineWidth, Math.ceil(measured + spacing + 3))
            })
        }
    } else {
        lines.forEach(line => {
            maxLineWidth = Math.max(maxLineWidth, Math.ceil((line.length || 1) * fontSize * 0.6))
        })
    }

    const contentHeight = Math.max(PDF_CURSOR_TEXT_HEIGHT, lines.length * lineHeightPx)
    return {
        width: Math.round(pdfClamp(maxLineWidth, PDF_MIN_TEXT_FIELD_WIDTH, Math.max(PDF_MIN_TEXT_FIELD_WIDTH, pageDims.width - Number(field?.x || 0)))),
        height: Math.round(pdfClamp(contentHeight, contentHeight, Math.max(contentHeight, pageDims.height - Number(field?.y || 0))))
    }
}

function updatePdfTemplate(setDoc, updater) {
    setDoc(prev => {
        const metadata = { ...(prev.metadata || {}) }
        const pdfTemplate = { ...(metadata.pdfTemplate || {}) }
        const nextTemplate = updater(pdfTemplate, prev) || pdfTemplate
        if (nextTemplate === pdfTemplate) return prev
        return {
            ...prev,
            metadata: {
                ...metadata,
                pdfTemplate: nextTemplate
            }
        }
    })
}

function emitPdfElementAdd(type) {
    window.dispatchEvent(new CustomEvent(PDF_ELEMENT_ADD_EVENT, { detail: { type } }))
}

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

function InsertDropdown({ onInsertTable, onInsertImage, onInsertCheckbox, onInsertBlockquote, onInsertHR }) {
    const [open, setOpen] = useState(false)
    const [showTableGrid, setShowTableGrid] = useState(false)
    const [hover, setHover] = useState({ rows: 0, cols: 0 })
    const ref = useRef(null)
    const fileInputRef = useRef(null)
    const savedSelectionRef = useRef(null)

    // Save the current selection when opening the dropdown
    const saveCurrentSelection = () => {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
            savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
        }
    }

    // Restore selection before performing an action
    const restoreAndExec = (callback) => {
        const range = savedSelectionRef.current
        if (range) {
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
        }
        callback()
    }

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
                setShowTableGrid(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            restoreAndExec(() => {
                const img = `<img src="${reader.result}" style="max-width:100%;height:auto;border-radius:4px;margin:8px 0;" /><p><br></p>`
                document.execCommand('insertHTML', false, img)
                onInsertImage?.()
            })
        }
        reader.readAsDataURL(file)
        setOpen(false)
        setShowTableGrid(false)
        e.target.value = ''
    }

    const menuItems = [
        {
            icon: 'tabler:table',
            label: 'Tableau',
            description: 'Insérer un tableau',
            hasSubmenu: true,
            action: () => setShowTableGrid(!showTableGrid)
        },
        {
            icon: 'tabler:photo',
            label: 'Image',
            description: 'Insérer une image',
            action: () => fileInputRef.current?.click()
        },
        {
            icon: 'tabler:checkbox',
            label: 'Case à cocher',
            description: 'Insérer une checkbox interactive',
            action: () => {
                restoreAndExec(() => onInsertCheckbox?.())
                setOpen(false)
            }
        },
        { divider: true },
        {
            icon: 'tabler:quote',
            label: 'Citation',
            description: 'Bloc de citation',
            action: () => {
                restoreAndExec(() => onInsertBlockquote?.())
                setOpen(false)
            }
        },
        {
            icon: 'tabler:separator',
            label: 'Séparateur',
            description: 'Ligne horizontale',
            action: () => {
                restoreAndExec(() => onInsertHR?.())
                setOpen(false)
            }
        }
    ]

    return (
        <div className="relative" ref={ref}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
            />
            <button
                onMouseDown={(e) => {
                    e.preventDefault()
                    saveCurrentSelection()
                    setOpen(!open)
                    setShowTableGrid(false)
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${open
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                }`}
                title="Insérer un élément"
            >
                <iconify-icon icon="tabler:plus" width="16"></iconify-icon>
                <span>Insérer</span>
                <iconify-icon icon="tabler:chevron-down" width="10"></iconify-icon>
            </button>
            {open && (
                <div
                    className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-2xl z-50"
                    style={{ minWidth: '220px', overflow: 'visible' }}
                >
                    <div className="p-1.5">
                        {menuItems.map((item, idx) => {
                            if (item.divider) {
                                return <div key={idx} className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                            }
                            return (
                                <button
                                    key={idx}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        item.action()
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors flex-shrink-0">
                                        <iconify-icon icon={item.icon} width="18"></iconify-icon>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</div>
                                        <div className="text-[10px] text-gray-400">{item.description}</div>
                                    </div>
                                    {item.hasSubmenu && (
                                        <iconify-icon icon="tabler:chevron-right" width="14" className="text-gray-400"></iconify-icon>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Table Grid Submenu */}
                    {showTableGrid && (
                        <div className="border-t dark:border-gray-700 p-3">
                            <div className="text-[10px] text-gray-400 font-medium mb-2 uppercase tracking-wider">
                                Taille du tableau
                            </div>
                            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                                {Array.from({ length: 36 }, (_, i) => {
                                    const row = Math.floor(i / 6) + 1
                                    const col = (i % 6) + 1
                                    return (
                                        <div
                                            key={i}
                                            className={`w-5 h-5 border rounded-sm cursor-pointer transition-all ${
                                                row <= hover.rows && col <= hover.cols
                                                    ? 'bg-primary/20 border-primary'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                            }`}
                                            onMouseEnter={() => setHover({ rows: row, cols: col })}
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                restoreAndExec(() => onInsertTable(row, col))
                                                setOpen(false)
                                                setShowTableGrid(false)
                                                setHover({ rows: 0, cols: 0 })
                                            }}
                                        />
                                    )
                                })}
                            </div>
                            {hover.rows > 0 && (
                                <div className="text-center text-[10px] text-gray-400 mt-1.5">
                                    {hover.rows} × {hover.cols}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Linked-To dropdown for template mode header
function LinkedToDropdown({ doc, setDoc, availableEntities, linkedEntities, triggerSave, forceSave, autoSave, accountNumber }) {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('collections') // 'collections' | 'records'
    const ref = useRef(null)

    // Records search state
    const [selectedEntityId, setSelectedEntityId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    useEffect(() => {
        if (!open) {
            // Reset search when closing
            setSearchQuery('')
            setSearchResults([])
        }
    }, [open])

    // Search records when query or entity changes
    useEffect(() => {
        if (activeTab !== 'records' || !selectedEntityId) return
        
        const delayDebounceFn = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setSearchResults([])
                return
            }
            
            setIsSearching(true)
            try {
                const res = await fetch(`/account/${accountNumber}/api/entity/${selectedEntityId}/views/all/records?q=${encodeURIComponent(searchQuery)}&limit=10`)
                const data = await res.json()
                if (data && data.records) {
                    setSearchResults(data.records)
                }
            } catch (err) {
                console.error('Error searching records:', err)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery, selectedEntityId, activeTab, accountNumber])

    const selectEntity = (entityId) => {
        const currentIds = doc.entityIds || (doc.entityId ? [doc.entityId] : [])
        const isAlreadySelected = currentIds.length === 1 && currentIds[0] === entityId
        // If clicking the already-selected entity, unlink it; otherwise select this one only
        const newIds = isAlreadySelected ? [] : [entityId]
        
        const updatedDoc = {
            ...doc,
            entityIds: newIds,
            entityId: newIds[0] || null
        }
        
        setDoc(updatedDoc)
        if (autoSave && forceSave) {
            forceSave(updatedDoc)
        } else {
            triggerSave(updatedDoc)
        }
    }

    const toggleRecord = (record, entity) => {
        const currentRecords = doc.linkedRecords || []
        const isLinked = currentRecords.some(r => r.recordId === record._id)
        
        let newRecords
        if (isLinked) {
            newRecords = currentRecords.filter(r => r.recordId !== record._id)
        } else {
            newRecords = [...currentRecords, {
                recordId: record._id,
                recordTitle: record.computedTitle || record.title || 'Sans titre',
                entityId: entity.id,
                entityName: entity.name,
                entityIcon: entity.icon,
                entityColor: entity.color,
                entitySlug: entity.slug
            }]
        }
        
        const updatedDoc = {
            ...doc,
            linkedRecords: newRecords
        }
        
        setDoc(updatedDoc)
        if (autoSave && forceSave) {
            forceSave(updatedDoc)
        } else {
            triggerSave(updatedDoc)
        }
    }

    const unassignedRecords = (doc.linkedRecords || []).length

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                    linkedEntities.length > 0 || unassignedRecords > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700'
                        : 'text-gray-500 border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                }`}
            >
                <iconify-icon icon="solar:link-round-bold-duotone" width="16"></iconify-icon>
                <span>
                    {linkedEntities.length > 0
                        ? `Lié à ${linkedEntities[0].name}`
                        : (doc.linkedRecords && doc.linkedRecords.length > 0)
                            ? `Lié à ${doc.linkedRecords[0].recordTitle}`
                            : 'Lié à'}
                </span>
                {(linkedEntities.length > 0 || unassignedRecords > 0) && (
                    <span className="ml-0.5 px-1.5 py-0 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                        {linkedEntities.length + unassignedRecords}
                    </span>
                )}
                <iconify-icon icon="tabler:chevron-down" width="12" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}></iconify-icon>
            </button>
            {open && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl z-50 flex flex-col" style={{ width: '320px', animation: 'bindingPickerIn 0.15s ease-out', maxHeight: '400px' }}>
                    {/* Tabs */}
                    <div className="flex px-3 pt-3 pb-0 border-b border-gray-100 dark:border-gray-700 gap-4">
                        <button 
                            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'collections' ? 'border-amber-500 text-amber-600 dark:text-amber-500' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('collections')}
                        >
                            Collections
                        </button>
                        <button 
                            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'records' ? 'border-amber-500 text-amber-600 dark:text-amber-500' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('records')}
                        >
                            Enregistrements
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto py-1 min-h-[200px]">
                        {activeTab === 'collections' ? (
                            <>
                                {(() => {
                                    const entityIds = doc.entityIds || (doc.entityId ? [doc.entityId] : [])
                                    const linkedEnts = (availableEntities || []).filter(e => entityIds.includes(e.id))
                                    const unlinkedEnts = (availableEntities || []).filter(e => !entityIds.includes(e.id))
                                    const linkedRecs = doc.linkedRecords || []
                                    
                                    const hasLinks = linkedEnts.length > 0 || linkedRecs.length > 0
                                    
                                    return (
                                        <>
                                            {hasLinks && (
                                                <div className="mb-2">
                                                    <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-y border-gray-100 dark:border-gray-700">Déjà liés</div>
                                                    {linkedEnts.map(entity => (
                                                        <label
                                                            key={`linked_ent_${entity.id}`}
                                                            className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="linked-entity"
                                                                checked={true}
                                                                onChange={() => selectEntity(entity.id)}
                                                                className="w-3.5 h-3.5 border-gray-300 text-amber-500 focus:ring-amber-200 dark:border-gray-600 dark:bg-gray-700"
                                                            />
                                                            <iconify-icon icon={entity.icon || 'solar:database-bold'} width="14" style={{ color: '#f59e0b' }}></iconify-icon>
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{entity.name}</span>
                                                        </label>
                                                    ))}
                                                    {linkedRecs.map(rec => (
                                                        <div key={`linked_rec_${rec.recordId}`} className="flex items-center gap-2.5 px-3 py-2 bg-amber-50/50 dark:bg-amber-900/10 group">
                                                            <iconify-icon icon="solar:document-text-bold" width="14" style={{ color: '#f59e0b' }}></iconify-icon>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{rec.recordTitle}</div>
                                                                <div className="text-[10px] text-gray-500 truncate">{rec.entityName}</div>
                                                            </div>
                                                            <button 
                                                                onClick={() => toggleRecord({ _id: rec.recordId }, { id: rec.entityId, name: rec.entityName })}
                                                                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                                                title="Détacher"
                                                            >
                                                                <iconify-icon icon="tabler:x" width="14"></iconify-icon>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-y border-gray-100 dark:border-gray-700">
                                                Collections disponibles
                                            </div>
                                            
                                            {unlinkedEnts.length === 0 ? (
                                                <p className="text-xs text-gray-400 py-3 text-center italic">Aucune collection disponible</p>
                                            ) : (
                                                unlinkedEnts.map(entity => (
                                                    <label
                                                        key={`unlinked_ent_${entity.id}`}
                                                        className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="linked-entity"
                                                            checked={false}
                                                            onChange={() => selectEntity(entity.id)}
                                                            className="w-3.5 h-3.5 border-gray-300 text-amber-500 focus:ring-amber-200 dark:border-gray-600 dark:bg-gray-700"
                                                        />
                                                        <iconify-icon icon={entity.icon || 'solar:database-bold'} width="14" style={{ color: '#9ca3af' }}></iconify-icon>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{entity.name}</span>
                                                    </label>
                                                ))
                                            )}
                                        </>
                                    )
                                })()}
                            </>
                        ) : (
                            <div className="px-3 py-2 flex flex-col gap-3">
                                <select 
                                    className="form-select text-xs py-1.5"
                                    value={selectedEntityId}
                                    onChange={(e) => {
                                        setSelectedEntityId(e.target.value)
                                        setSearchQuery('')
                                        setSearchResults([])
                                    }}
                                >
                                    <option value="">-- Choisir une collection --</option>
                                    {(availableEntities || []).map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>

                                {selectedEntityId && (
                                    <div className="relative">
                                        <iconify-icon icon="tabler:search" class="absolute left-2.5 top-2 text-gray-400" width="14"></iconify-icon>
                                        <input 
                                            type="text" 
                                            placeholder="Rechercher un enregistrement..." 
                                            className="form-input text-xs py-1.5 pl-8 w-full"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-1 mt-1">
                                    {isSearching && <div className="text-xs text-gray-400 italic text-center py-2">Recherche en cours...</div>}
                                    
                                    {!isSearching && searchResults.length === 0 && searchQuery && selectedEntityId && (
                                        <div className="text-xs text-gray-400 italic text-center py-2">Aucun résultat</div>
                                    )}

                                    {!isSearching && searchResults.map(record => {
                                        const entity = availableEntities.find(e => e.id === selectedEntityId)
                                        const isLinked = (doc.linkedRecords || []).some(r => r.recordId === record._id)
                                        
                                        return (
                                            <div 
                                                key={record._id}
                                                onClick={() => toggleRecord(record, entity)}
                                                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${isLinked ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isLinked}
                                                    readOnly
                                                    className="w-3 h-3 rounded border-gray-300 text-amber-500 focus:ring-amber-200 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-xs truncate ${isLinked ? 'font-semibold text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {record.computedTitle || record.title || 'Sans titre'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Currently linked records */}
                                {(doc.linkedRecords || []).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Sélectionnés ({doc.linkedRecords.length})</div>
                                        <div className="flex flex-col gap-1">
                                            {doc.linkedRecords.map(lr => (
                                                <div key={lr.recordId} className="flex items-center justify-between gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <iconify-icon icon={lr.entityIcon || 'solar:database-bold'} width="12" className="text-gray-400"></iconify-icon>
                                                        <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate">{lr.recordTitle}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const updatedDoc = {
                                                                ...doc,
                                                                linkedRecords: doc.linkedRecords.filter(r => r.recordId !== lr.recordId)
                                                            }
                                                            setDoc(updatedDoc)
                                                            if (autoSave && forceSave) {
                                                                forceSave(updatedDoc)
                                                            } else {
                                                                triggerSave(updatedDoc)
                                                            }
                                                        }}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <iconify-icon icon="tabler:x" width="12"></iconify-icon>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-[9px] text-gray-400 italic">
                            {activeTab === 'collections' 
                                ? 'Ce template sera lié à une seule collection.' 
                                : 'Ce modèle sera visible uniquement sur les enregistrements sélectionnés.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

function PdfTemplateToolbar({ doc, setDoc, triggerSave, onOpenVariablesPanel }) {
    const [activeField, setActiveField] = useState(null)
    const template = doc?.metadata?.pdfTemplate || {}
    const fields = Array.isArray(template.fields) ? template.fields : []
    const selectedField = fields.find(field => field.id === activeField?.fieldId) || null
    const selectedType = getPdfFieldType(selectedField)
    const isBackgroundHidden = Boolean(template.hideBackground)

    useEffect(() => {
        const handler = (event) => setActiveField(event.detail?.fieldId ? event.detail : null)
        window.addEventListener(PDF_ACTIVE_FIELD_EVENT, handler)
        return () => window.removeEventListener(PDF_ACTIVE_FIELD_EVENT, handler)
    }, [])

    const patchField = useCallback((fieldId, patch) => {
        updatePdfTemplate(setDoc, pdfTemplate => {
            const allFields = Array.isArray(pdfTemplate.fields) ? [...pdfTemplate.fields] : []
            const idx = allFields.findIndex(field => field.id === fieldId)
            if (idx < 0) return pdfTemplate
            allFields[idx] = { ...allFields[idx], ...patch, updatedAt: new Date().toISOString() }
            return { ...pdfTemplate, fields: allFields }
        })
        triggerSave()
    }, [setDoc, triggerSave])

    const duplicateSelected = useCallback(() => {
        if (!selectedField) return
        const pageIndex = Number(selectedField.pageIndex || activeField?.pageIndex || 0)
        const pageDims = template.pageDimensions?.[pageIndex] || template.pageDimensions?.[String(pageIndex)] || doc.dimensions || { width: 794, height: 1123 }
        const width = Number(selectedField.width || PDF_DEFAULT_TEXT_FIELD.width)
        const height = Number(selectedField.height || PDF_DEFAULT_TEXT_FIELD.height)
        const id = `pdf_field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const clone = {
            ...selectedField,
            id,
            x: pdfClamp(Number(selectedField.x || 0) + 16, 0, Math.max(0, pageDims.width - width)),
            y: pdfClamp(Number(selectedField.y || 0) + 16, 0, Math.max(0, pageDims.height - height)),
            zIndex: fields.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        updatePdfTemplate(setDoc, pdfTemplate => ({
            ...pdfTemplate,
            fields: [...(Array.isArray(pdfTemplate.fields) ? pdfTemplate.fields : []), clone]
        }))
        const detail = { fieldId: id, pageIndex, fieldType: getPdfFieldType(clone) }
        setActiveField(detail)
        window.dispatchEvent(new CustomEvent(PDF_FIELD_SELECT_EVENT, { detail }))
        window.dispatchEvent(new CustomEvent(PDF_ACTIVE_FIELD_EVENT, { detail }))
        triggerSave()
    }, [activeField?.pageIndex, doc.dimensions, fields.length, selectedField, setDoc, template.pageDimensions, triggerSave])

    const deleteSelected = useCallback(() => {
        if (!selectedField) return
        const pageIndex = Number(selectedField.pageIndex || activeField?.pageIndex || 0)
        updatePdfTemplate(setDoc, pdfTemplate => ({
            ...pdfTemplate,
            fields: (Array.isArray(pdfTemplate.fields) ? pdfTemplate.fields : []).filter(field => field.id !== selectedField.id)
        }))
        setActiveField(null)
        window.dispatchEvent(new CustomEvent(PDF_FIELD_CLEAR_EVENT, { detail: {} }))
        window.dispatchEvent(new CustomEvent(PDF_ACTIVE_FIELD_EVENT, { detail: { fieldId: null, fieldType: null } }))
        triggerSave()
    }, [activeField?.pageIndex, selectedField, setDoc, triggerSave])

    const openVariables = useCallback(() => {
        if (!selectedField || selectedType !== 'text') {
            window.showMessage?.('Sélectionnez une zone texte PDF avant d’insérer une variable', 'warning')
        }
        onOpenVariablesPanel?.()
    }, [onOpenVariablesPanel, selectedField, selectedType])

    const toggleBackground = useCallback(() => {
        const metadata = { ...(doc?.metadata || {}) }
        const pdfTemplate = { ...(metadata.pdfTemplate || {}) }
        const nextDoc = {
            ...doc,
            metadata: {
                ...metadata,
                pdfTemplate: {
                    ...pdfTemplate,
                    hideBackground: !Boolean(pdfTemplate.hideBackground)
                }
            }
        }
        setDoc(nextDoc)
        triggerSave(nextDoc)
    }, [doc, setDoc, triggerSave])

    const toolButton = 'inline-flex h-7 items-center justify-center gap-1 rounded-md px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-800'
    const iconButton = 'inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-800'
    const inputClass = 'h-7 rounded-md border border-slate-200 bg-white px-1 text-xs font-semibold text-slate-700 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200'

    const getPageDimsForField = useCallback((field) => {
        const pageIndex = Number(field?.pageIndex || activeField?.pageIndex || 0)
        return template.pageDimensions?.[pageIndex]
            || template.pageDimensions?.[String(pageIndex)]
            || doc.dimensions
            || { width: 794, height: 1123 }
    }, [activeField?.pageIndex, doc.dimensions, template.pageDimensions])

    const patchTextField = useCallback((patch) => {
        if (!selectedField) return
        const nextField = { ...selectedField, ...patch }
        const measured = measurePdfTextFieldSize(nextField, getPageDimsForField(selectedField))
        const sizePatch = selectedField.autoSize !== false
            ? measured
            : (Number(selectedField.height || 0) < measured.height ? { height: measured.height } : {})
        patchField(selectedField.id, { ...patch, ...sizePatch })
    }, [getPageDimsForField, patchField, selectedField])

    return (
        <div
            data-pdf-template-toolbar="1"
            className="flex items-center gap-1 overflow-x-auto border-t border-gray-100 px-3 py-1 dark:border-gray-800"
        >
            <button type="button" onClick={() => emitPdfElementAdd('text')} className={toolButton} title="Zone texte PDF">
                <iconify-icon icon="tabler:text-plus" width="15"></iconify-icon>
                Texte
            </button>
            <button type="button" onClick={() => emitPdfElementAdd('checkbox')} className={iconButton} title="Case à cocher">
                <iconify-icon icon="tabler:checkbox" width="15"></iconify-icon>
            </button>
            <button type="button" onClick={() => emitPdfElementAdd('check')} className={iconButton} title="Coche">
                <iconify-icon icon="tabler:check" width="15"></iconify-icon>
            </button>
            <button type="button" onClick={() => emitPdfElementAdd('cross')} className={iconButton} title="Croix">
                <iconify-icon icon="tabler:x" width="15"></iconify-icon>
            </button>
            <button type="button" onClick={() => emitPdfElementAdd('line')} className={iconButton} title="Ligne">
                <iconify-icon icon="tabler:minus" width="15"></iconify-icon>
            </button>
            <button type="button" onClick={() => emitPdfElementAdd('rectangle')} className={iconButton} title="Rectangle">
                <iconify-icon icon="tabler:rectangle" width="15"></iconify-icon>
            </button>

            <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />

            <button type="button" onClick={openVariables} className={toolButton} title="Variables">
                <iconify-icon icon="solar:database-bold-duotone" width="15"></iconify-icon>
                Variables
            </button>
            <button
                type="button"
                onClick={toggleBackground}
                className={`${toolButton} ${isBackgroundHidden ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white' : ''}`}
                title={isBackgroundHidden ? "Afficher l’arrière-plan PDF" : "Masquer l’arrière-plan PDF"}
            >
                <iconify-icon icon={isBackgroundHidden ? 'tabler:eye' : 'tabler:eye-off'} width="15"></iconify-icon>
                {isBackgroundHidden ? 'Afficher fond' : 'Masquer fond'}
            </button>

            {selectedField ? (
                <>
                    <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <button type="button" onClick={duplicateSelected} className={iconButton} title="Dupliquer">
                        <iconify-icon icon="tabler:copy" width="15"></iconify-icon>
                    </button>
                    <button type="button" onClick={deleteSelected} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50" title="Supprimer">
                        <iconify-icon icon="tabler:trash" width="15"></iconify-icon>
                    </button>
                </>
            ) : (
                <span className="ml-1 whitespace-nowrap text-[11px] font-medium text-slate-400">
                    Sélectionnez un élément PDF
                </span>
            )}

            {selectedField && selectedType === 'text' && (
                <>
                    <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <select
                        value={selectedField.fontFamily || PDF_DEFAULT_TEXT_FIELD.fontFamily}
                        onChange={(event) => patchTextField({ fontFamily: event.target.value })}
                        className={inputClass}
                        style={{ width: '132px', flex: '0 0 auto' }}
                        title="Police"
                    >
                        {PDF_FONT_FAMILIES.map(font => <option key={font} value={font}>{font.split(',')[0]}</option>)}
                    </select>
                    <input
                        type="number"
                        min="6"
                        max="96"
                        value={selectedField.fontSize || PDF_DEFAULT_TEXT_FIELD.fontSize}
                        onChange={(event) => patchTextField({ fontSize: pdfClamp(event.target.value, 6, 96) })}
                        className={inputClass}
                        style={{ width: '56px', flex: '0 0 auto' }}
                        title="Taille"
                    />
                    <button
                        type="button"
                        onClick={() => patchTextField({ bold: !selectedField.bold })}
                        className={`${iconButton} ${selectedField.bold ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}`}
                        title="Gras"
                    >
                        <iconify-icon icon="tabler:bold" width="15"></iconify-icon>
                    </button>
                    <button
                        type="button"
                        onClick={() => patchTextField({ italic: !selectedField.italic })}
                        className={`${iconButton} ${selectedField.italic ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}`}
                        title="Italique"
                    >
                        <iconify-icon icon="tabler:italic" width="15"></iconify-icon>
                    </button>
                    <button
                        type="button"
                        onClick={() => patchTextField({ underline: !selectedField.underline })}
                        className={`${iconButton} ${selectedField.underline ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}`}
                        title="Souligné"
                    >
                        <iconify-icon icon="tabler:underline" width="15"></iconify-icon>
                    </button>
                    <input
                        type="color"
                        value={selectedField.color || PDF_DEFAULT_TEXT_FIELD.color}
                        onChange={(event) => patchField(selectedField.id, { color: event.target.value })}
                        className="h-7 w-8 rounded-md border border-slate-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900"
                        title="Couleur"
                    />
                    <select
                        value={selectedField.align || 'left'}
                        onChange={(event) => patchField(selectedField.id, { align: event.target.value })}
                        className={inputClass}
                        style={{ width: '84px', flex: '0 0 auto' }}
                        title="Alignement"
                    >
                        <option value="left">Gauche</option>
                        <option value="center">Centre</option>
                        <option value="right">Droite</option>
                    </select>
                    <input
                        type="number"
                        step="0.05"
                        min="0.7"
                        max="3"
                        value={selectedField.lineHeight || PDF_DEFAULT_TEXT_FIELD.lineHeight}
                        onChange={(event) => patchTextField({ lineHeight: pdfClamp(event.target.value, 0.7, 3) })}
                        className={inputClass}
                        style={{ width: '58px', flex: '0 0 auto' }}
                        title="Interligne"
                    />
                    <input
                        type="number"
                        step="0.5"
                        min="-2"
                        max="20"
                        value={selectedField.letterSpacing || 0}
                        onChange={(event) => patchTextField({ letterSpacing: pdfClamp(event.target.value, -2, 20) })}
                        className={inputClass}
                        style={{ width: '58px', flex: '0 0 auto' }}
                        title="Espacement des lettres"
                    />
                </>
            )}

            {selectedField && ['checkbox', 'rectangle', 'line'].includes(selectedType) && (
                <>
                    <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    {selectedType === 'checkbox' && (
                        <button
                            type="button"
                            onClick={() => {
                                const checked = isPdfCheckboxChecked(selectedField)
                                patchField(selectedField.id, {
                                    checked: !checked,
                                    value: !checked ? 'checked' : ''
                                })
                            }}
                            className={toolButton}
                            title="Cocher ou décocher"
                        >
                            <iconify-icon icon={isPdfCheckboxChecked(selectedField) ? 'tabler:checkbox' : 'tabler:square'} width="15"></iconify-icon>
                            {isPdfCheckboxChecked(selectedField) ? 'Cochée' : 'Décochée'}
                        </button>
                    )}
                    <input
                        type="color"
                        value={selectedField.strokeColor || selectedField.borderColor || '#111827'}
                        onChange={(event) => {
                            const key = selectedType === 'checkbox' ? 'borderColor' : 'strokeColor'
                            patchField(selectedField.id, { [key]: event.target.value })
                        }}
                        className="h-7 w-8 rounded-md border border-slate-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900"
                        title="Couleur du trait"
                    />
                    <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="12"
                        value={selectedField.strokeWidth || selectedField.borderWidth || 1.5}
                        onChange={(event) => {
                            const key = selectedType === 'checkbox' ? 'borderWidth' : 'strokeWidth'
                            patchField(selectedField.id, { [key]: pdfClamp(event.target.value, 0.5, 12) })
                        }}
                        className={inputClass}
                        style={{ width: '58px', flex: '0 0 auto' }}
                        title="Épaisseur"
                    />
                    {selectedType !== 'line' && (
                        <>
                            <input
                                type="color"
                                value={selectedField.fillColor && selectedField.fillColor !== 'transparent' ? selectedField.fillColor : '#ffffff'}
                                onChange={(event) => patchField(selectedField.id, { fillColor: event.target.value })}
                                className="h-7 w-8 rounded-md border border-slate-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900"
                                title="Fond"
                            />
                            <button type="button" onClick={() => patchField(selectedField.id, { fillColor: 'transparent' })} className={toolButton} title="Fond transparent">
                                Transparent
                            </button>
                        </>
                    )}
                </>
            )}

            {selectedField && ['check', 'cross'].includes(selectedType) && (
                <>
                    <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <input
                        type="number"
                        min="8"
                        max="96"
                        value={selectedField.fontSize || (selectedType === 'check' ? 20 : 22)}
                        onChange={(event) => patchField(selectedField.id, { fontSize: pdfClamp(event.target.value, 8, 96) })}
                        className={inputClass}
                        style={{ width: '58px', flex: '0 0 auto' }}
                        title="Taille"
                    />
                    <input
                        type="color"
                        value={selectedField.color || '#111827'}
                        onChange={(event) => patchField(selectedField.id, { color: event.target.value })}
                        className="h-7 w-8 rounded-md border border-slate-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900"
                        title="Couleur"
                    />
                </>
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
    forceSave,
    onUndo,
    onRedo,
    onHistoryCheckpoint,
    autoSave,
    setAutoSave,
    handlePdfExport,
    isContextFree = false,
    isGeneratingPdf = false,
    isPdfTemplateMode = false,
    onOpenVariablesPanel,
    // Template props
    availableEntities,
    isTemplateMode,
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
    FONT_SIZES,
    hasUnsavedChanges
	}) {
	    const [textColor, setTextColor] = useState('#000000')
	    const [highlightColor, setHighlightColor] = useState('transparent')
	    const [modalConfig, setModalConfig] = useState(null)
	    const [isSavingDraft, setIsSavingDraft] = useState(false)
	    const urlParams = new URLSearchParams(window.location.search)
	    const isTemplateDrivenDoc = Boolean(
	        doc?.draftSourceTemplateId
	        || doc?.generatedFrom?.smartDocId
	        || doc?.generatedFrom?.templateId
	        || urlParams.get('templateId')
	    )
	    const isSimpleEditableDoc = !doc?.isTemplate && !isTemplateDrivenDoc
	    const draftLoadingLabel = 'Génération...'
	    const isTemplateDraftFlow = Boolean(
	        doc?.isDraft
	        || doc?.draftSourceTemplateId
	        || urlParams.get('contextFree') === '1'
	        || urlParams.get('templateId')
	    )
	    const canSaveDraft = Boolean(
	        doc?._id
	        && !doc?.isTemplate
	        && !isSimpleEditableDoc
	        && !doc?.isGenerationSnapshot
	        && doc?.status !== 'finalized'
	        && isTemplateDraftFlow
	    )

	    const getCloseUrl = () => {
	        if (window.self !== window.top) return 'smartdoc-cancel'
	        const params = new URLSearchParams(window.location.search)
	        const returnTo = params.get('returnTo')
	        if (returnTo) {
	            try {
	                const target = new URL(returnTo, window.location.origin)
	                if (target.origin === window.location.origin) {
	                    return `${target.pathname}${target.search}${target.hash}`
	                }
	            } catch (_) {}
	        }
	        if (document.referrer) {
	            try {
	                const referrer = new URL(document.referrer)
	                const current = new URL(window.location.href)
	                if (referrer.origin === window.location.origin && referrer.href !== current.href) {
	                    return `${referrer.pathname}${referrer.search}${referrer.hash}`
	                }
	            } catch (_) {}
	        }
	        const linkedRecord = doc?.linkedRecords?.[0]
	        const recordId = doc?.draftRecordId || linkedRecord?.recordId
	        const entitySlug = linkedRecord?.entitySlug
	        if (recordId && entitySlug) {
	            return `/account/${accountNumber}/record/${entitySlug}/${recordId}/docs`
	        }
	        return `/account/${accountNumber}/documents`;
	    }

    const attemptNavigation = (targetUrl, e) => {
        if (e) e.preventDefault();
        
        if (!autoSave && hasUnsavedChanges && hasUnsavedChanges()) {
            setModalConfig({
                type: 'unsaved',
                title: "Modifications non enregistrées",
                message: "Vous avez des modifications en cours qui seront perdues. Voulez-vous vraiment quitter ?",
                targetUrl: targetUrl
            });
        } else {
            if (targetUrl === 'smartdoc-cancel') {
                window.parent.postMessage({ type: 'smartdoc-cancel' }, '*');
            } else {
                window.location.href = targetUrl;
            }
        }
    };

    const handleClose = (e) => attemptNavigation(getCloseUrl(), e);

    const handleSaveDraft = async () => {
        if (!doc?._id || isSavingDraft || isGeneratingPdf) return
        setIsSavingDraft(true)
        try {
            const result = await forceSave()
            if (result?.success === false) {
                throw new Error(result.error || 'Erreur lors de l’enregistrement du brouillon')
            }
            if (window.showMessage) {
                window.showMessage('Brouillon enregistré', 'success')
            }
        } catch (error) {
            console.error('[DocumentEditor] Draft save failed:', error)
            if (window.showMessage) {
                window.showMessage(error?.message || 'Erreur lors de l’enregistrement du brouillon', 'danger')
            } else {
                alert(error?.message || 'Erreur lors de l’enregistrement du brouillon')
            }
        } finally {
            setIsSavingDraft(false)
        }
    }

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
        onHistoryCheckpoint?.('format-text-color')
        setTextColor(color)
        document.execCommand('foreColor', false, color)
        triggerSave()
    }, [onHistoryCheckpoint, triggerSave])

    const handleHighlightColor = useCallback((color) => {
        onHistoryCheckpoint?.('format-highlight')
        setHighlightColor(color)
        if (color === 'transparent') {
            document.execCommand('removeFormat', false, null)
        } else {
            document.execCommand('hiliteColor', false, color)
        }
        triggerSave()
    }, [onHistoryCheckpoint, triggerSave])

    const handleHeadingChange = useCallback((value) => {
        onHistoryCheckpoint?.('format-heading')
        if (!value) {
            document.execCommand('formatBlock', false, 'p')
        } else {
            document.execCommand('formatBlock', false, value)
        }
        triggerSave()
    }, [onHistoryCheckpoint, triggerSave])

    const handleTableInsert = useCallback((rows, cols) => {
        onHistoryCheckpoint?.('insert-table')
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
    }, [onHistoryCheckpoint, triggerSave])

    const handleInsertHR = useCallback(() => {
        onHistoryCheckpoint?.('insert-separator')
        const html = `<div class="doc-separator-container" style="width: 100%; display: block; margin: 16px 0;" tabindex="0">
            <div class="doc-separator-line" style="border-top: 2px solid #e5e7eb; display: inline-block; position: relative; min-height: 8px; width: 100%; cursor: pointer;"></div>
        </div><p><br></p>`
        document.execCommand('insertHTML', false, html)
        triggerSave()
    }, [onHistoryCheckpoint, triggerSave])

    const handleInsertBlockquote = useCallback(() => {
        onHistoryCheckpoint?.('format-blockquote')
        document.execCommand('formatBlock', false, 'blockquote')
        triggerSave()
    }, [onHistoryCheckpoint, triggerSave])

    const handleInsertCheckbox = useCallback(() => {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return
        onHistoryCheckpoint?.('insert-checkbox')

        const range = sel.getRangeAt(0)

        // Delete any selected content first
        if (!range.collapsed) {
            range.deleteContents()
        }

        // Create checkbox span
        const checkbox = document.createElement('span')
        checkbox.className = 'doc-checkbox'
        checkbox.style.cssText = 'display:inline;cursor:pointer;font-size:1.2em;user-select:none;vertical-align:middle;margin-right:4px;'
        checkbox.setAttribute('data-checked', 'false')
        checkbox.contentEditable = 'false'
        checkbox.textContent = '☐'

        // Create the trailing space
        const space = document.createTextNode('\u00A0')

        // Ensure we insert INSIDE the current block element, not as a sibling
        // When the range is at the end of a <p>, the startContainer can be the
        // contenteditable div itself, which makes insertNode place the checkbox
        // as a sibling of <p> instead of inside it.
        const container = range.startContainer
        const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'DIV']

        // Find the closest block element
        let blockParent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container
        while (blockParent && !blockTags.includes(blockParent.tagName) && blockParent.contentEditable !== 'true') {
            blockParent = blockParent.parentElement
        }

        // If the container IS the contenteditable root (not inside a block),
        // find the block at the current offset and append inside it
        if (blockParent && blockParent.contentEditable === 'true') {
            // We're at the contenteditable root level - find which child block we're near
            const offset = range.startOffset
            const childBlock = blockParent.children[offset - 1] || blockParent.lastElementChild
            if (childBlock && blockTags.includes(childBlock.tagName)) {
                // Append inside this block element
                childBlock.appendChild(checkbox)
                childBlock.appendChild(space)
            } else {
                // Fallback: just insert at range
                range.insertNode(checkbox)
                if (checkbox.nextSibling) {
                    checkbox.parentNode.insertBefore(space, checkbox.nextSibling)
                } else {
                    checkbox.parentNode.appendChild(space)
                }
            }
        } else {
            // We're inside a block element - safe to use insertNode
            range.insertNode(checkbox)
            if (checkbox.nextSibling) {
                checkbox.parentNode.insertBefore(space, checkbox.nextSibling)
            } else {
                checkbox.parentNode.appendChild(space)
            }
        }

        // Move cursor after the space
        const newRange = document.createRange()
        newRange.setStartAfter(space)
        newRange.collapse(true)
        sel.removeAllRanges()
        sel.addRange(newRange)

        triggerSave()
    }, [onHistoryCheckpoint, triggerSave])

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

    const isInIframe = window.self !== window.top
    const isPdfBackgroundHidden = Boolean(doc?.metadata?.pdfTemplate?.hideBackground)
    const handleTogglePdfBackground = useCallback(() => {
        const metadata = { ...(doc?.metadata || {}) }
        const pdfTemplate = { ...(metadata.pdfTemplate || {}) }
        const nextDoc = {
            ...doc,
            metadata: {
                ...metadata,
                pdfTemplate: {
                    ...pdfTemplate,
                    hideBackground: !isPdfBackgroundHidden
                }
            }
        }
        setDoc(nextDoc)
        triggerSave(nextDoc)
    }, [doc, isPdfBackgroundHidden, setDoc, triggerSave])
    const pdfBackgroundToggle = isPdfTemplateMode ? (
        <button
            type="button"
            onClick={handleTogglePdfBackground}
            className="flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-all text-sm font-medium whitespace-nowrap"
            title={isPdfBackgroundHidden ? "Afficher l’arrière-plan PDF" : "Masquer l’arrière-plan PDF"}
        >
            <iconify-icon icon={isPdfBackgroundHidden ? 'tabler:eye' : 'tabler:eye-off'} width="18"></iconify-icon>
            <span>{isPdfBackgroundHidden ? "Afficher l’arrière-plan" : "Masquer l’arrière-plan"}</span>
        </button>
    ) : null

    return (
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex flex-col">
            {/* Top Row: Title and Actions — hidden when embedded in iframe (overview provides its own header) */}
            {!isInIframe && (
            <div className="flex items-center px-4 py-2 border-b dark:border-gray-800">
                {/* Back Button */}
                {window.self !== window.top ? (
                    /* Inside iframe (SmartDoc preview) → notify parent to cancel */
                    <button
                        onClick={(e) => attemptNavigation('smartdoc-cancel', e)}
                        className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                        title="Annuler"
                    >
                        <iconify-icon icon="tabler:arrow-left" width="20"></iconify-icon>
                    </button>
                ) : (
	                    <a
	                        href={getCloseUrl()}
	                        onClick={(e) => attemptNavigation(getCloseUrl(), e)}
                        className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    >
                        <iconify-icon icon="tabler:arrow-left" width="20"></iconify-icon>
                    </a>
                )}

                {/* Document Name */}
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={doc.name}
                        onChange={handleNameChange}
                        className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                        placeholder="Document sans titre"
                    />
                    {/* Subtitle line for template mode */}
                    {isTemplateMode && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <iconify-icon icon="solar:magic-stick-3-bold-duotone" width="12" style={{ color: '#f59e0b' }}></iconify-icon>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Template de document</span>
                        </div>
                    )}
                    {/* Entity Tags - shown when NOT in template mode */}
                    {!isTemplateMode && doc.isTemplate && linkedEntities.length > 0 && (
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

                {/* Save Status — hidden in template mode when auto-save pill already shows it */}
                {!(isTemplateMode && autoSave) && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mr-3">
                    {formatSavedTime() && (
                        <>
                            <iconify-icon icon="tabler:cloud-check" width="16" className="text-green-500"></iconify-icon>
                            <span>{formatSavedTime()}</span>
                        </>
                    )}
                </div>
                )}

                {/* === TEMPLATE MODE ACTIONS === */}
                {isTemplateMode ? (
                    <div className="flex items-center gap-2">
                        <LinkedToDropdown
                                                            doc={doc}
                                                            setDoc={setDoc}
                                                            availableEntities={availableEntities}
                                                            linkedEntities={linkedEntities}
                                                            triggerSave={triggerSave}
                                                            forceSave={forceSave}
                                                            autoSave={autoSave}
                                                            accountNumber={accountNumber}
                                                        />

                        {/* Auto-save toggle */}
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all"
                            style={{
                                borderColor: autoSave ? '#bbf7d0' : '#e2e8f0',
                                background: autoSave ? '#f0fdf4' : '#fff',
                            }}
                        >
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap select-none">
                                Auto
                            </span>
                            <button
                                onClick={() => setAutoSave(!autoSave)}
                                className="relative inline-flex items-center cursor-pointer"
                                style={{ width: '32px', height: '18px', flexShrink: 0 }}
                                title={autoSave ? 'Sauvegarde automatique activée' : 'Sauvegarde automatique désactivée'}
                            >
                                <div
                                    style={{
                                        width: '32px',
                                        height: '18px',
                                        borderRadius: '9px',
                                        background: autoSave ? '#22c55e' : '#cbd5e1',
                                        transition: 'background 0.2s ease',
                                        position: 'relative',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                            position: 'absolute',
                                            top: '2px',
                                            left: autoSave ? '16px' : '2px',
                                            transition: 'left 0.2s ease',
                                        }}
                                    />
                                </div>
                            </button>
                            {autoSave && lastSaved && (
                                <span className="text-[10px] text-green-600 dark:text-green-400 whitespace-nowrap flex items-center gap-1">
                                    <iconify-icon icon="tabler:cloud-check" width="12"></iconify-icon>
                                    {formatSavedTime()}
                                </span>
                            )}
                        </div>

                        {/* Enregistrer button — only when auto-save is OFF */}
                        {!autoSave && (
                            <button
                                onClick={() => (forceSave || triggerSave)()}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                                <iconify-icon icon="tabler:device-floppy" width="17"></iconify-icon>
                                <span>Enregistrer</span>
                            </button>
                        )}

                        {/* Générer button */}
                        {pdfBackgroundToggle}
                        <button
                            onClick={() => {
                                if (doc._id) {
                                    if (!autoSave && hasUnsavedChanges && hasUnsavedChanges()) {
                                        setModalConfig({
                                            title: "Attention",
                                            message: "Veuillez d'abord enregistrer vos modifications avant de générer le document.",
                                            confirmText: "Enregistrer maintenant",
                                            confirmStyle: "bg-primary hover:bg-primary-dark text-white border border-transparent",
                                            onConfirm: () => {
                                                forceSave();
                                                setModalConfig(null);
                                            }
                                        });
                                        return;
                                    }
                                    window.location.href = `/account/${accountNumber}/documents/${doc._id}/generate`;
                                } else {
                                    setModalConfig({
                                        title: "Document non enregistré",
                                        message: "Veuillez d'abord enregistrer le document une première fois avant de pouvoir le générer.",
                                        confirmText: "OK",
                                        confirmStyle: "bg-primary hover:bg-primary-dark text-white border border-transparent",
                                        onConfirm: () => setModalConfig(null)
                                    });
                                }
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 text-white rounded-full text-sm font-medium transition-colors"
                            style={{ backgroundColor: '#4361ee' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3b54d4'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4361ee'}
                        >
                            <iconify-icon icon="solar:play-bold-duotone" width="17"></iconify-icon>
                            <span>Générer</span>
                        </button>
                    </div>
                ) : (
                    /* === NORMAL MODE ACTIONS === */
                    <div className="flex items-center gap-2">
                        {isContextFree ? (
                            <>
                                {/* Annuler Button */}
                                <button
                                    onClick={handleClose}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all text-sm font-medium bg-white"
                                >
                                    <iconify-icon icon="tabler:circle-x" width="18"></iconify-icon>
                                    <span>Annuler</span>
                                </button>

                                {pdfBackgroundToggle}

                                {isSimpleEditableDoc ? (
                                    <button
                                        onClick={handlePdfExport}
                                        disabled={!doc._id || isGeneratingPdf}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: '#10b981' }}
                                    >
                                        {isGeneratingPdf ? (
                                            <iconify-icon icon="line-md:loading-twotone-loop" width="18"></iconify-icon>
                                        ) : (
                                            <iconify-icon icon="solar:diskette-bold-duotone" width="18"></iconify-icon>
                                        )}
                                        <span>{isGeneratingPdf ? 'Enregistrement...' : 'Enregistrer'}</span>
                                    </button>
                                ) : (
                                    <>
                                        {canSaveDraft && (
                                            <button
                                                onClick={handleSaveDraft}
                                                disabled={!doc._id || isSavingDraft || isGeneratingPdf}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded border border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSavingDraft ? (
                                                    <iconify-icon icon="line-md:loading-twotone-loop" width="18"></iconify-icon>
                                                ) : (
                                                    <iconify-icon icon="solar:diskette-bold-duotone" width="18"></iconify-icon>
                                                )}
                                                <span>{isSavingDraft ? 'Enregistrement...' : 'Enregistrer comme brouillon'}</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={handlePdfExport}
                                            disabled={!doc._id || isGeneratingPdf}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: '#10b981' }}
                                        >
                                            {isGeneratingPdf ? (
                                                <iconify-icon icon="line-md:loading-twotone-loop" width="18"></iconify-icon>
                                            ) : (
                                                <iconify-icon icon="solar:check-circle-bold" width="18"></iconify-icon>
                                            )}
                                            <span>{isGeneratingPdf ? draftLoadingLabel : 'Finaliser et générer le PDF'}</span>
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Static Lié à badge */}
                                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700 select-none">
                                    <iconify-icon icon="solar:link-round-bold-duotone" width="16"></iconify-icon>
                                    <span>
                                        Lié à {linkedEntities[0]?.name || doc.linkedRecords?.[0]?.entityName || 'Entreprise'}
                                    </span>
                                </div>

                                {pdfBackgroundToggle}

                                {canSaveDraft && (
                                    <button
                                        onClick={handleSaveDraft}
                                        disabled={!doc._id || isSavingDraft || isGeneratingPdf}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingDraft ? (
                                            <iconify-icon icon="line-md:loading-twotone-loop" width="18"></iconify-icon>
                                        ) : (
                                            <iconify-icon icon="solar:diskette-bold-duotone" width="18"></iconify-icon>
                                        )}
                                        <span>{isSavingDraft ? 'Enregistrement...' : 'Enregistrer comme brouillon'}</span>
                                    </button>
                                )}

                                {/* Action Button */}
                                {isSimpleEditableDoc ? (
                                    <button
                                        onClick={handlePdfExport}
                                        disabled={!doc._id || isGeneratingPdf}
                                        className="flex items-center gap-2 px-4 py-2 text-white rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 duration-200"
                                        style={{
                                            backgroundColor: '#10b981',
                                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -2px rgba(16, 185, 129, 0.2)'
                                        }}
                                    >
                                        {isGeneratingPdf ? (
                                            <iconify-icon icon="line-md:loading-twotone-loop" width="18"></iconify-icon>
                                        ) : (
                                            <iconify-icon icon="solar:diskette-bold-duotone" width="18"></iconify-icon>
                                        )}
                                        <span>{isGeneratingPdf ? 'Enregistrement...' : 'Enregistrer'}</span>
                                    </button>
                                ) : doc.isDraft ? (
                                    <button
                                        onClick={handlePdfExport}
                                        disabled={!doc._id || isGeneratingPdf}
                                        className="flex items-center gap-2 px-4 py-2 text-white rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 duration-200"
                                        style={{
                                            backgroundColor: '#10b981',
                                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -2px rgba(16, 185, 129, 0.2)'
                                        }}
                                    >
                                        {isGeneratingPdf ? (
                                            <iconify-icon icon="line-md:loading-twotone-loop" width="18"></iconify-icon>
                                        ) : (
                                            <iconify-icon icon="solar:check-circle-bold-duotone" width="18"></iconify-icon>
                                        )}
                                        <span>{isGeneratingPdf ? draftLoadingLabel : 'Finaliser et générer le PDF'}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePdfExport}
                                        disabled={!doc._id || isGeneratingPdf}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingPdf ? (
                                            <iconify-icon icon="line-md:loading-twotone-loop" width="18"></iconify-icon>
                                        ) : (
                                            <iconify-icon icon="tabler:file-type-pdf" width="18"></iconify-icon>
                                        )}
                                        <span>{isGeneratingPdf ? 'Génération...' : 'PDF'}</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
            )}

            {/* Toolbar Row */}
            {isPdfTemplateMode ? (
                <PdfTemplateToolbar
                    doc={doc}
                    setDoc={setDoc}
                    triggerSave={triggerSave}
                    onOpenVariablesPanel={onOpenVariablesPanel}
                />
            ) : (
            <div
                className="flex items-center px-3 py-1 gap-0.5 flex-nowrap"
                style={{ overflow: 'visible' }}
            >
                {/* Undo / Redo */}
                <button
                    onMouseDown={(e) => {
                        e.preventDefault()
                        onUndo?.()
                    }}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Annuler (Ctrl+Z)"
                >
                    <iconify-icon icon="tabler:arrow-back-up" width="18"></iconify-icon>
                </button>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault()
                        onRedo?.()
                    }}
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
                    <div className="absolute left-0 top-[calc(100%-2px)] hidden min-w-[80px] pt-1 group-hover:block z-50">
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-800 rounded-lg shadow-lg py-1">
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
                </div>

                {/* Letter Spacing */}
                <div className="relative group">
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center gap-0.5">
                        <iconify-icon icon="tabler:letter-spacing" width="18"></iconify-icon>
                        <span className="text-[9px]">{currentLetterSpacing}px</span>
                    </button>
                    <div className="absolute left-0 top-[calc(100%-2px)] hidden min-w-[80px] pt-1 group-hover:block z-50">
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-800 rounded-lg shadow-lg py-1">
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

                {/* Insert Dropdown (Table, Image, Checkbox, Blockquote, HR) */}
                <InsertDropdown
                    onInsertTable={handleTableInsert}
                    onInsertImage={() => triggerSave()}
                    onInsertCheckbox={handleInsertCheckbox}
                    onInsertBlockquote={handleInsertBlockquote}
                    onInsertHR={handleInsertHR}
                />

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
            )}

            {/* Visual Modal for Confirmations */}
            {modalConfig && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-[500px] w-full overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all scale-100 opacity-100">
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <iconify-icon icon="solar:danger-triangle-bold" width="24" className="text-gray-500"></iconify-icon>
                                {modalConfig.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 ml-8">
                                {modalConfig.message}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            {modalConfig.type === 'unsaved' ? (
                                <>
                                    <button
                                        onClick={() => setModalConfig(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await forceSave();
                                            setModalConfig(null);
                                            if (modalConfig.targetUrl === 'smartdoc-cancel') {
                                                window.parent.postMessage({ type: 'smartdoc-cancel' }, '*');
                                            } else {
                                                window.location.href = modalConfig.targetUrl;
                                            }
                                        }}
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Sauvegarder
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (modalConfig.targetUrl === 'smartdoc-cancel') {
                                                window.parent.postMessage({ type: 'smartdoc-cancel' }, '*');
                                            } else {
                                                window.location.href = modalConfig.targetUrl;
                                            }
                                        }}
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm bg-[#ef4444] hover:bg-red-600 text-white"
                                    >
                                        Quitter sans sauvegarder
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setModalConfig(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={modalConfig.onConfirm}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${modalConfig.confirmStyle}`}
                                    >
                                        {modalConfig.confirmText}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
