/**
 * DocumentEditorIsland - Main Component
 * 1:1 parity with Alpine.js documentEditor()
 * 
 * CRITICAL: contenteditable areas are UNCONTROLLED
 * - Content is accessed via refs, NOT state
 * - Selection/Range stored in refs to survive re-renders
 * - Autosave timeout stored in ref
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { saveDocument, exportPdf, uploadImage } from './services/documentApi'
import { cleanWordHtml } from './utils/cleanWordHtml'
import { parseWordHtml, hasBase64Images } from './utils/parseWordHtml'
import { checkOverflow, checkUnderflow, pullFromNextPageInto, reflowAllPages, doesContentOverflow } from './utils/paginationUtils'
import { formatDoc, detectCurrentStyles, applyFontSize, applyLineSpacing, applyLetterSpacing, FONT_FAMILIES, FONT_SIZES } from './utils/formatUtils'
import { getSelectedImage } from './hooks/useImageResize'

// Native keyboard detection - NO external library, CANNOT fail
const isMod = (e) => e.ctrlKey || e.metaKey

// ========== WORD-LIKE SELECTION HELPERS ==========
function selectAllDocument(editorRootEl, pageRefs) {
    const sel = window.getSelection()
    if (!sel) return

    // Get all page contenteditable elements (sorted by index)
    const pages = pageRefs ? Object.entries(pageRefs)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, el]) => el)
        .filter(Boolean) : []

    if (pages.length === 0 && editorRootEl) {
        // Fallback: select editorRoot contents
        const range = document.createRange()
        range.selectNodeContents(editorRootEl)
        sel.removeAllRanges()
        sel.addRange(range)
        return
    }

    if (pages.length === 1) {
        // Single page: select all within that contenteditable
        const range = document.createRange()
        range.selectNodeContents(pages[0])
        sel.removeAllRanges()
        sel.addRange(range)
        return
    }

    // Multi-page: select from start of first page to end of last page
    // Note: Selection ranges may only span within a single contenteditable,
    // so we select the editorRoot container which wraps all pages
    if (editorRootEl) {
        const range = document.createRange()
        range.selectNodeContents(editorRootEl)
        sel.removeAllRanges()
        sel.addRange(range)
    }
}

function isSelectionCoversAll(editorRootEl) {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !editorRootEl) return false
    const range = sel.getRangeAt(0)
    const docRange = document.createRange()
    docRange.selectNodeContents(editorRootEl)
    return (
        range.compareBoundaryPoints(Range.START_TO_START, docRange) === 0 &&
        range.compareBoundaryPoints(Range.END_TO_END, docRange) === 0
    )
}

// Components
import EditorHeader from './components/EditorHeader'
import LeftSidebar from './components/LeftSidebar'
import CanvasContainer from './components/CanvasContainer'
import AIChatSidebar from './components/AIChatSidebar'
import SettingsPanel from './components/SettingsPanel'
import BindingBar from './components/BindingBar'

// Default document structure
const createDefaultDoc = () => ({
    _id: null,
    name: 'Document sans titre',
    format: 'A4',
    orientation: 'portrait',
    status: 'draft',
    isTemplate: false,
    entityId: null,
    entityIds: [],
    dimensions: { width: 794, height: 1123 },
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    headerHtml: '',  // Global header HTML applied to all pages
    footerHtml: '',  // Global footer HTML applied to all pages
    pages: [{
        content: '',
        elements: [],
        rows: [],
        mode: 'edition',
        background: '#ffffff',
        order: 0
    }],
    collections: [],
    contentBlocks: []
})

// Merge initial document with defaults to ensure all properties exist
const mergeWithDefaults = (initialDoc) => {
    if (!initialDoc) return createDefaultDoc()

    const defaults = createDefaultDoc()
    return {
        ...defaults,
        ...initialDoc,
        // Ensure nested objects have defaults
        dimensions: initialDoc.dimensions || defaults.dimensions,
        margins: initialDoc.margins || defaults.margins,
        headerHtml: initialDoc.headerHtml || '',
        footerHtml: initialDoc.footerHtml || '',
        // Ensure pages array exists and has at least one page
        pages: (initialDoc.pages && initialDoc.pages.length > 0)
            ? initialDoc.pages.map(page => ({
                content: page.content || '',
                elements: page.elements || [],
                rows: page.rows || [],
                mode: page.mode || 'edition',
                background: page.background || '#ffffff',
                order: page.order || 0
            }))
            : defaults.pages
    }
}

export default function DocumentEditorIsland({ accountNumber, initialDocument, isNew, contextFreeBindings, isTemplateMode }) {
    const isContextFree = useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get('contextFree') === '1'
    }, [])

    // ========== STATE (UI only, NOT contenteditable content) ==========
    const [doc, setDoc] = useState(() => mergeWithDefaults(initialDocument))
    const [selectedPageIndex, setSelectedPageIndex] = useState(0)
    const [selectedRow, setSelectedRow] = useState(null)
    const [lastSaved, setLastSaved] = useState(null)
    const [editorMode, setEditorMode] = useState('edition') // edition, layout, designer
    const [activeTab, setActiveTab] = useState(null) // text, gallery, dynamic-nav
    const [openSections, setOpenSections] = useState({ info: true, margins: false, pages: true })
    const [isGlobalSelection, setIsGlobalSelection] = useState(false)
    const [pasteMode, setPasteMode] = useState('match') // keep, match, plain
    const [isSettingsOpen, setIsSettingsOpen] = useState(false) // Settings popup state
    const [showTemplatePanel, setShowTemplatePanel] = useState(false) // Right sidebar template config
    const [zoomLevel, setZoomLevel] = useState(1) // Zoom level for document canvas (0.25 to 3)
    const [availableEntities, setAvailableEntities] = useState([])

    // Formatting state (for toolbar display)
    const [currentFont, setCurrentFont] = useState('Arial')
    const [currentFontSize, setCurrentFontSize] = useState(16)
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)
    const [isStrikethrough, setIsStrikethrough] = useState(false)
    const [currentAlignment, setCurrentAlignment] = useState('left')
    const [currentLineHeight, setCurrentLineHeight] = useState(1.5)
    const [currentLetterSpacing, setCurrentLetterSpacing] = useState(0)

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    // HTML Editor Modal
    const [editingHtml, setEditingHtml] = useState(false)
    const [editingHtmlContent, setEditingHtmlContent] = useState('')
    const [editingElementIndex, setEditingElementIndex] = useState(null)

    // Date Picker Popup
    const [datePickerState, setDatePickerState] = useState(null) // { textNode, offset, length, rect }

    // ========== REFS (Critical for stability) ==========
    const saveTimeoutRef = useRef(null)
    const savedRangeRef = useRef(null)
    const pageRefs = useRef({})
    const editorRootRef = useRef(null)
    const docRef = useRef(doc) // Always current doc for callbacks
    const isMergingRef = useRef(false) // Prevents race conditions during merge
    const isGlobalSelectionRef = useRef(false) // Ref mirror for stale-closure-safe access
    const isPastingRef = useRef(false) // Prevents double-reflow during paste (insertHTML triggers onInput)
    const reflowInProgressRef = useRef(false) // Prevents concurrent reflow execution

    // Keep docRef in sync
    useEffect(() => {
        docRef.current = doc
    })

    // ========== WORD-LIKE: Force <p> tags on Enter ==========
    // Without this, Chrome creates <div> on Enter. With it, Enter always creates <p><br></p>.
    useEffect(() => {
        try {
            document.execCommand('defaultParagraphSeparator', false, 'p')
        } catch (e) {
            // Safari may not support this, that's OK
        }
    }, [])

    // Keep isGlobalSelectionRef in sync
    useEffect(() => {
        isGlobalSelectionRef.current = isGlobalSelection
    }, [isGlobalSelection])

    // ========== LOAD ENTITIES (for Template dropdown) ==========
    useEffect(() => {
        fetch(`/account/${accountNumber}/api/hierarchy/all-entities`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.entities) setAvailableEntities(data.entities)
                else if (Array.isArray(data)) setAvailableEntities(data)
            })
            .catch(e => console.warn('[DocumentEditor] Could not load entities:', e))
    }, [accountNumber])

    // Listen for template panel toggle from header button
    useEffect(() => {
        const handler = () => setShowTemplatePanel(prev => !prev)
        window.addEventListener('toggle-template-panel', handler)
        return () => window.removeEventListener('toggle-template-panel', handler)
    }, [])


    // ========== AUTOSAVE ==========
    const triggerSave = useCallback(() => {
        // Clear existing timeout
        clearTimeout(saveTimeoutRef.current)

        // Set new timeout (1 second debounce)
        saveTimeoutRef.current = setTimeout(async () => {
            // Read current content from page refs
            const currentDoc = { ...docRef.current }

            // Safety check: verify all edition pages have valid refs
            // This prevents saving empty content when DOM refs aren't available
            let hasInvalidRef = false
            currentDoc.pages = currentDoc.pages.map((page, i) => {
                const pageRef = pageRefs.current[i]
                if (page.mode === 'edition') {
                    if (pageRef) {
                        // Clean any temporary markers before saving
                        let content = pageRef.innerHTML
                        content = content.replace(/<span[^>]*data-reflow-caret[^>]*>.*?<\/span>/gi, '')
                        content = content.replace(/<span[^>]*data-caret-marker[^>]*>.*?<\/span>/gi, '')
                        return { ...page, content }
                    } else {
                        // CRITICAL: pageRef is null but page is in edition mode
                        // If state content is also empty, we might lose data
                        console.warn(`[triggerSave] Page ${i} has no ref, using state content:`, page.content?.substring(0, 50))
                        if (!page.content && i === 0) {
                            // For page 0 with no ref and no content, this is likely a timing issue
                            // Skip save to prevent data loss
                            hasInvalidRef = true
                        }
                        return page
                    }
                }
                // Layout mode: sync content backup from rows
                if (page.mode === 'layout' && page.rows && page.rows.length > 0) {
                    let html = ''
                    page.rows.forEach(row => {
                        if (row.columns) {
                            row.columns.forEach(col => {
                                if (col.blocks) {
                                    col.blocks.forEach(block => {
                                        if (block.type === 'text' || block.type === 'html' || !block.type) {
                                            html += (block.content || '')
                                        } else if (block.type === 'image' && block.src) {
                                            html += `<div style="text-align:center; margin: 10px 0;"><img src="${block.src}" style="max-width:100%; height:auto; border-radius: 8px;"></div>`
                                        }
                                    })
                                }
                            })
                        }
                    })
                    return { ...page, content: html }
                }
                // Designer mode: sync content backup from elements
                if (page.mode === 'designer' && page.elements && page.elements.length > 0) {
                    const sorted = [...page.elements].sort((a, b) => (a.y - b.y) || (a.x - b.x))
                    let html = ''
                    sorted.forEach(el => {
                        if (el.type === 'text') {
                            html += (el.content || '')
                        } else if (el.type === 'image' && el.src) {
                            html += `<div style="text-align:center; margin: 10px 0;"><img src="${el.src}" style="max-width:100%; height:auto; border-radius: 8px;"></div>`
                        }
                    })
                    return { ...page, content: html }
                }
                return page
            })

            // Abort save if we detected a potentially dangerous state
            if (hasInvalidRef) {
                console.warn('[triggerSave] Aborting save: detected edition pages without valid refs')
                return
            }

            const result = await saveDocument(currentDoc, accountNumber)
            if (result.success && result.document) {
                // Update URL if this was a new document
                if (!docRef.current._id && result.document._id) {
                    const newUrl = `/account/${accountNumber}/documents/${result.document._id}/edit-react`
                    window.history.replaceState({}, '', newUrl)
                }
                setDoc(prev => ({ ...prev, _id: result.document._id }))
                setLastSaved(new Date())
            }
        }, 1000)
    }, [accountNumber])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => clearTimeout(saveTimeoutRef.current)
    }, [])

    // ========== INTERACTIVE CHECKBOXES (☐ ↔ ☑) ==========
    useEffect(() => {
        const handleCheckboxClick = (e) => {
            const pageEl = e.target.closest('[contenteditable="true"]')
            if (!pageEl) return
            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) return
            const node = sel.anchorNode
            if (!node || node.nodeType !== 3) return
            const text = node.textContent
            const offset = sel.anchorOffset
            const checkboxChars = ['☐', '☑', '☒', '□', '■', '▢', '▣']
            const uncheckedChars = ['☐', '□', '▢']
            for (let i = Math.max(0, offset - 1); i <= Math.min(text.length - 1, offset); i++) {
                const ch = text[i]
                if (checkboxChars.includes(ch)) {
                    e.preventDefault()
                    e.stopPropagation()
                    const newChar = uncheckedChars.includes(ch) ? '☑' : '☐'
                    node.textContent = text.substring(0, i) + newChar + text.substring(i + 1)
                    const range = document.createRange()
                    range.setStart(node, i + 1)
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                    triggerSave()
                    return
                }
            }
        }
        document.addEventListener('click', handleCheckboxClick, true)
        return () => document.removeEventListener('click', handleCheckboxClick, true)
    }, [triggerSave])

    // ========== INTERACTIVE DATE PLACEHOLDERS (____/____/________) ==========
    useEffect(() => {
        const datePattern = /_{2,}\s*\/\s*_{2,}\s*\/\s*_{2,}/
        const handleDateClick = (e) => {
            const pageEl = e.target.closest('[contenteditable="true"]')
            if (!pageEl) return
            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) return
            const node = sel.anchorNode
            if (!node || node.nodeType !== 3) return
            const text = node.textContent
            const match = datePattern.exec(text)
            if (!match) return
            const start = match.index
            const end = start + match[0].length
            const offset = sel.anchorOffset
            if (offset >= start && offset <= end) {
                e.preventDefault()
                e.stopPropagation()
                const range = document.createRange()
                range.setStart(node, start)
                range.setEnd(node, end)
                const rect = range.getBoundingClientRect()
                setDatePickerState({
                    textNode: node,
                    start,
                    end,
                    matchText: match[0],
                    rect: {
                        top: rect.bottom + window.scrollY + 4,
                        left: rect.left + window.scrollX
                    }
                })
            }
        }
        document.addEventListener('click', handleDateClick)
        return () => document.removeEventListener('click', handleDateClick)
    }, [])

    // ========== SELECTION HANDLING ==========
    const saveSelection = useCallback(() => {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange()
        }
    }, [])

    const restoreSelection = useCallback(() => {
        const range = savedRangeRef.current
        if (range) {
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
        }
    }, [])

    // ========== FORMATTING ==========
    const handleFormat = useCallback((command, value = null) => {
        restoreSelection()
        formatDoc(command, value)
        triggerSave()

        // If this was an alignment command on a selected image, update alignment state directly
        const alignMap = { justifyLeft: 'left', justifyCenter: 'center', justifyRight: 'right', justifyFull: 'justify' }
        if (alignMap[command] && getSelectedImage()) {
            setCurrentAlignment(alignMap[command])
        } else {
            updateFormattingState()
        }
    }, [restoreSelection, triggerSave])

    const updateFormattingState = useCallback(() => {
        const styles = detectCurrentStyles()
        setCurrentFont(styles.fontFamily)
        setCurrentFontSize(styles.fontSize)
        setIsBold(styles.isBold)
        setIsItalic(styles.isItalic)
        setIsUnderline(styles.isUnderline)
        setIsStrikethrough(styles.isStrikethrough)
        setCurrentAlignment(styles.alignment)
        setCurrentLineHeight(styles.lineHeight)
        setCurrentLetterSpacing(styles.letterSpacing)
    }, [])

    const handleFontSizeChange = useCallback((size) => {
        restoreSelection()
        applyFontSize(size)
        setCurrentFontSize(size)
        triggerSave()
    }, [restoreSelection, triggerSave])

    const handleLineSpacingChange = useCallback((value) => {
        restoreSelection()
        applyLineSpacing(value)
        setCurrentLineHeight(value)
        triggerSave()
    }, [restoreSelection, triggerSave])

    const handleLetterSpacingChange = useCallback((value) => {
        restoreSelection()
        applyLetterSpacing(value)
        setCurrentLetterSpacing(value)
        triggerSave()
    }, [restoreSelection, triggerSave])

    // ========== REFLOW ORCHESTRATOR (Word-like) ==========
    // After each input, reflow entire document: overflow forward, then underflow backward.
    // For large pastes, overflow may cascade through multiple new pages.
    //
    // CRITICAL: Guard against concurrent execution!
    // insertHTML triggers both onPaste and onInput, which would start two parallel reflows.
    // Two reflows extracting from the same DOM causes content loss.
    //
    // CARET PRESERVATION STRATEGY:
    // 1. Before reflow, inject a zero-width <span data-reflow-caret> marker at cursor position.
    //    This marker is inside the DOM structure, so when extractOverflow moves nodes to the
    //    next page (as outerHTML strings or DOM moves), the marker travels with the content.
    // 2. After reflow completes, search ALL pages for the marker.
    // 3. Place cursor right after the marker, remove it, focus + scroll.
    // This guarantees the cursor follows content even across page boundaries.
    const reflowDocument = useCallback(() => {
        // Prevent concurrent reflows - only one can run at a time
        if (reflowInProgressRef.current) {
            console.log('[reflowDocument] Skipped: reflow already in progress')
            return
        }

        // === CARET MARKER: Clean up any stale markers first ===
        document.querySelectorAll('[data-reflow-caret="1"]').forEach(m => m.remove())

        // === QUICK CHECK: Does any page actually overflow? ===
        // If no overflow, skip the heavy caret marker + reflow machinery.
        // This is the common case for normal typing and Enter presses.
        let hasOverflow = false
        const d = docRef.current
        if (d?.pages?.length) {
            for (let i = 0; i < d.pages.length; i++) {
                const el = pageRefs.current[i]
                if (el && doesContentOverflow(el)) {
                    hasOverflow = true
                    break
                }
            }
        }

        if (!hasOverflow) {
            // No overflow — nothing to reflow. Just let the browser handle the cursor natively.
            // Still do underflow check in case content was deleted
            requestAnimationFrame(() => {
                const d2 = docRef.current
                if (!d2?.pages?.length) return
                for (let i = 0; i < d2.pages.length - 1; i++) {
                    const el = pageRefs.current[i]
                    if (el) {
                        checkUnderflow(el, i, d2, setDoc, pageRefs)
                    }
                }
            })
            return
        }

        // === There IS overflow — engage the full reflow + caret marker system ===
        reflowInProgressRef.current = true

        // Insert caret marker so cursor follows content across page boundaries
        let markerInserted = false
        let focusedPageIndex = -1
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0 && sel.getRangeAt(0).collapsed) {
            try {
                const range = sel.getRangeAt(0)
                const anchor = range.startContainer
                for (const [idx, el] of Object.entries(pageRefs.current)) {
                    if (el && el.contains(anchor)) {
                        focusedPageIndex = parseInt(idx)
                        break
                    }
                }
                if (focusedPageIndex >= 0) {
                    const marker = document.createElement('span')
                    marker.setAttribute('data-reflow-caret', '1')
                    marker.style.cssText = 'font-size:0;line-height:0;width:0;height:0;display:inline;overflow:hidden;'
                    marker.textContent = '\u200B'
                    range.insertNode(marker)
                    range.setStartAfter(marker)
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                    markerInserted = true
                }
            } catch (err) {
                // Silently ignore
            }
        }

        const pageCountBefore = docRef.current?.pages?.length || 0

        // Use reflowAllPages for iterative multi-page overflow handling
        reflowAllPages(docRef, setDoc, pageRefs, 100, () => {
            reflowInProgressRef.current = false

            const pageCountAfter = docRef.current?.pages?.length || 0

            // === CARET RESTORE ===
            requestAnimationFrame(() => {
                let restored = false

                if (markerInserted) {
                    for (const [idx, el] of Object.entries(pageRefs.current)) {
                        if (!el) continue
                        const marker = el.querySelector('[data-reflow-caret="1"]')
                        if (marker) {
                            const s = window.getSelection()
                            const r = document.createRange()
                            r.setStartAfter(marker)
                            r.collapse(true)
                            s.removeAllRanges()
                            s.addRange(r)
                            marker.remove()
                            el.focus()
                            revealCaret(el)
                            restored = true
                            break
                        }
                    }
                    if (!restored) {
                        document.querySelectorAll('[data-reflow-caret="1"]').forEach(m => m.remove())
                    }
                }

                if (!restored) {
                    const currentSel = window.getSelection()
                    let cursorValid = false
                    if (currentSel && currentSel.rangeCount > 0) {
                        const anchor = currentSel.anchorNode
                        for (const [, el] of Object.entries(pageRefs.current)) {
                            if (el && el.contains(anchor)) {
                                cursorValid = true
                                revealCaret(el)
                                break
                            }
                        }
                    }
                    if (!cursorValid) {
                        if (pageCountAfter > pageCountBefore) {
                            const newPageEl = pageRefs.current[pageCountAfter - 1]
                            if (newPageEl) {
                                placeCaretAtStart(newPageEl)
                                revealCaret(newPageEl)
                            }
                        } else if (focusedPageIndex >= 0) {
                            const focusedEl = pageRefs.current[focusedPageIndex]
                            if (focusedEl) {
                                placeCaretAtEnd(focusedEl)
                                revealCaret(focusedEl)
                            }
                        }
                    }
                }
            })

            // Underflow backward pass
            requestAnimationFrame(() => {
                const d2 = docRef.current
                if (!d2?.pages?.length) return
                for (let i = 0; i < d2.pages.length - 1; i++) {
                    const el = pageRefs.current[i]
                    if (el) {
                        checkUnderflow(el, i, d2, setDoc, pageRefs)
                    }
                }
            })
        })
    }, [])

    // ========== PAGE INPUT HANDLING ==========
    const handlePageInput = useCallback((e, pageIndex) => {
        saveSelection()

        // CRITICAL: Skip reflow if we're in the middle of a paste operation
        // insertHTML triggers onInput, but handlePaste already calls reflowDocument
        // Running two concurrent reflows causes content loss!
        if (!isPastingRef.current) {
            reflowDocument()
        }

        triggerSave()
    }, [saveSelection, triggerSave, reflowDocument])

    // ========== PASTE HANDLING ==========
    const handlePaste = useCallback(async (e, pageIndex) => {
        e.preventDefault()

        const clipboardData = e.clipboardData || window.clipboardData
        let content = ''

        // Plain text mode - always use text/plain
        if (pasteMode === 'plain') {
            content = clipboardData.getData('text/plain')
            // Wrap in <p> tags for proper editing behavior
            const lines = content.split(/\n\n/)
            content = lines
                .map(line => {
                    const trimmed = line.trim()
                    if (!trimmed) return ''
                    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
                })
                .filter(Boolean)
                .join('')
        } else {
            // Try HTML first
            content = clipboardData.getData('text/html')
            if (content) {
                // Check if document is saved (needed for image upload)
                const canUploadImages = !!doc._id && hasBase64Images(content)

                if (canUploadImages) {
                    // Use parser with image upload
                    content = await parseWordHtml(content, async (base64) => {
                        const result = await uploadImage(accountNumber, doc._id, base64)
                        return result.success ? result.url : base64
                    })
                } else {
                    // Use standard cleaning (no image upload for new docs)
                    content = cleanWordHtml(content, pasteMode)
                }
            } else {
                // Fallback to plain text — wrap in <p> tags
                content = clipboardData.getData('text/plain')
                const lines = content.split(/\n\n/)
                content = lines
                    .map(line => {
                        const trimmed = line.trim()
                        if (!trimmed) return ''
                        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
                    })
                    .filter(Boolean)
                    .join('')
            }
        }

        // Guard: don't insert empty content
        if (!content || !content.trim()) return

        // Set pasting flag to prevent onInput from triggering a concurrent reflow
        // insertHTML fires an input event, but we handle reflow ourselves below
        isPastingRef.current = true

        // Insert at cursor using execCommand
        document.execCommand('insertHTML', false, content)

        // Clear pasting flag after a microtask (input event fires synchronously)
        // Use setTimeout(0) to clear after the input event has been processed
        setTimeout(() => { isPastingRef.current = false }, 0)

        // Trigger full document reflow (handles multi-page overflow from large pastes)
        reflowDocument()

        triggerSave()
    }, [pasteMode, triggerSave, doc._id, accountNumber, reflowDocument])

    // ========== KEYBOARD HANDLING ==========
    // Word-like: Ctrl+A selects all pages, Delete clears but keeps page 1

    // Clear document but keep first page (Word-like)
    const clearDocumentKeepFirstPage = useCallback(() => {
        // 1) Clear DOM immediately (avoid visual lag)
        Object.values(pageRefs.current || {}).forEach((el, idx) => {
            if (el) el.innerHTML = ''
        })

        // 2) Clear state (keep only page 0)
        setDoc(prev => {
            const first = prev.pages?.[0] ? { ...prev.pages[0] } : null
            const page0 = first || {
                content: '',
                elements: [],
                rows: [],
                mode: 'edition',
                background: '#ffffff',
                order: 0,
            }
            page0.content = ''
            page0.elements = []
            page0.rows = []

            return { ...prev, pages: [page0] }
        })

        // 3) Focus first page
        requestAnimationFrame(() => {
            const el = pageRefs.current?.[0]
            if (el) el.focus()
        })

        triggerSave()
    }, [triggerSave])

    // Global keyboard handler - handles document-wide shortcuts (div-level, bubble phase)
    // NOTE: Ctrl+A and Delete with global selection are handled in the window-level useEffect
    const handleGlobalKeyDown = useCallback((e) => {
        const key = e.key?.toLowerCase()

        // Ctrl+S - Save
        if (isMod(e) && key === 's' && !e.shiftKey && !e.altKey) {
            e.preventDefault()
            triggerSave()
            return
        }

        // Ctrl+P - Print
        if (isMod(e) && key === 'p' && !e.shiftKey && !e.altKey) {
            e.preventDefault()
            return
        }
    }, [triggerSave])

    // ========== CARET HELPERS ==========
    function isCaretAtStart(el) {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return false
        if (!el.contains(sel.anchorNode)) return false

        const range = sel.getRangeAt(0)
        if (!range.collapsed) return false

        const pre = range.cloneRange()
        pre.selectNodeContents(el)
        pre.setEnd(range.startContainer, range.startOffset)

        const text = pre.toString().replace(/\u00A0/g, ' ').trim()
        return text.length === 0
    }

    function isCaretAtEnd(el) {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return false
        if (!el.contains(sel.anchorNode)) return false

        const range = sel.getRangeAt(0)
        if (!range.collapsed) return false

        const post = range.cloneRange()
        post.selectNodeContents(el)
        post.setStart(range.endContainer, range.endOffset)

        const text = post.toString().replace(/\u00A0/g, ' ').trim()
        return text.length === 0
    }

    // ========== CARET MARKER HELPERS ==========
    function insertCaretMarker() {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return null
        const range = sel.getRangeAt(0)
        if (!range.collapsed) return null

        const marker = document.createElement('span')
        marker.setAttribute('data-caret-marker', '1')
        marker.style.display = 'inline-block'
        marker.style.width = '0'
        marker.style.height = '0'
        marker.appendChild(document.createTextNode('\u200B'))

        range.insertNode(marker)
        range.setStartAfter(marker)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        return marker
    }

    function restoreCaretFromMarker(rootEl) {
        if (!rootEl) return false
        const marker = rootEl.querySelector('[data-caret-marker="1"]')
        if (!marker) return false

        // Scroll to marker position BEFORE removing it
        marker.scrollIntoView({ block: 'center', behavior: 'instant' })

        const sel = window.getSelection()
        const range = document.createRange()
        range.setStartAfter(marker)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        marker.remove()
        return true
    }

    function revealCaret(el) {
        requestAnimationFrame(() => {
            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) return
            const rect = sel.getRangeAt(0).getBoundingClientRect()
            if (!rect || (rect.top === 0 && rect.bottom === 0 && rect.left === 0)) return

            // Find the scrollable canvas container (.overflow-auto)
            const canvas = el.closest('.overflow-auto')
            if (!canvas) {
                // Fallback to window scroll
                const margin = 120
                if (rect.bottom > window.innerHeight - margin) {
                    window.scrollBy({ top: rect.bottom - window.innerHeight + margin, behavior: 'instant' })
                } else if (rect.top < margin) {
                    window.scrollBy({ top: rect.top - margin, behavior: 'instant' })
                }
                return
            }

            const canvasRect = canvas.getBoundingClientRect()
            const margin = 80

            // If caret is below the canvas visible area, scroll down
            if (rect.bottom > canvasRect.bottom - margin) {
                canvas.scrollBy({ top: rect.bottom - canvasRect.bottom + margin, behavior: 'instant' })
            }
            // If caret is above the canvas visible area, scroll up
            else if (rect.top < canvasRect.top + margin) {
                canvas.scrollBy({ top: rect.top - canvasRect.top - margin, behavior: 'instant' })
            }
        })
    }

    function placeCaretAtEnd(el) {
        el.focus()
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
    }

    function placeCaretAtStart(el) {
        el.focus()
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(true)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
    }

    // Per-page keyboard handler for formatting shortcuts AND page boundary behavior
    const handleKeyDown = useCallback((e, pageIndex, contentRef) => {
        const el = pageRefs.current[pageIndex]
        if (!el) return

        // ========== BLOCK ESCAPE LOGIC ==========
        // When cursor is inside a block element (blockquote, div[style], pre),
        // handle Enter to escape the block (Word/Google Docs behavior).
        //
        // KEY INSIGHT: Browsers create SIBLING blocks on Enter, not child elements.
        // E.g. <blockquote>text</blockquote> + Enter → 
        //   <blockquote>text</blockquote><blockquote><br></blockquote>
        //
        // So we detect: is the cursor in a BLOCK that is EMPTY?
        // If yes → replace that block with a plain <p> (escape the styling).
        const BLOCK_SELECTORS = 'blockquote, div[style], pre'

        if (e.key === 'Enter' && !e.shiftKey) {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0)
                let node = range.startContainer
                if (node.nodeType === 3) node = node.parentNode
                const block = node.closest?.(BLOCK_SELECTORS)

                if (block && block.parentElement === el) {
                    // CASE 1: Cursor is in an EMPTY block → escape immediately
                    // This happens after the browser splits a block on Enter
                    const blockText = block.textContent.trim()
                    const blockHtml = block.innerHTML.trim()
                    const isEmpty = blockText === '' || blockHtml === '<br>' || blockHtml === ''

                    if (isEmpty) {
                        e.preventDefault()
                        e.stopPropagation()

                        // Replace the empty block with a plain paragraph
                        const p = document.createElement('p')
                        p.innerHTML = '<br>'
                        block.replaceWith(p)

                        // Place cursor in the new paragraph
                        const newRange = document.createRange()
                        newRange.selectNodeContents(p)
                        newRange.collapse(true)
                        sel.removeAllRanges()
                        sel.addRange(newRange)

                        if (handlePageInput) {
                            handlePageInput({ target: el }, pageIndex)
                        }
                        return
                    }

                    // CASE 2: Cursor is at the VERY END of a non-empty block
                    // → let the browser create the new empty sibling block,
                    //   and on the NEXT Enter (Case 1 above) we'll escape it.
                    // No special handling needed here — the browser's default is correct.
                }
            }
        }

        // ArrowDown at end of page content: if last child is a block, create escape paragraph
        if (e.key === 'ArrowDown') {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0)
                let node = range.startContainer
                if (node.nodeType === 3) node = node.parentNode
                const block = node.closest?.(BLOCK_SELECTORS)

                if (block && block.parentElement === el && !block.nextElementSibling) {
                    // Cursor is in the last block element and there's nothing after it
                    const testRange = document.createRange()
                    testRange.selectNodeContents(block)
                    testRange.setStart(range.endContainer, range.endOffset)
                    const frag = testRange.cloneContents()
                    const temp = document.createElement('div')
                    temp.appendChild(frag)
                    if (temp.textContent.trim().length === 0) {
                        e.preventDefault()
                        const p = document.createElement('p')
                        p.innerHTML = '<br>'
                        block.insertAdjacentElement('afterend', p)
                        const newRange = document.createRange()
                        newRange.selectNodeContents(p)
                        newRange.collapse(true)
                        sel.removeAllRanges()
                        sel.addRange(newRange)
                        if (handlePageInput) {
                            handlePageInput({ target: el }, pageIndex)
                        }
                        return
                    }
                }
            }
        }


        // ✅ Backspace at start of page => merge into previous (Word-like)
        if (e.key === 'Backspace' && pageIndex > 0 && isCaretAtStart(el)) {
            e.preventDefault()
            console.log('[Merge] Backspace at start, merging page', pageIndex + 1, 'into', pageIndex)

            const prevEl = pageRefs.current[pageIndex - 1]
            const curEl = el
            if (!prevEl || !curEl) return

            isMergingRef.current = true

            // 1) Place caret at end of prev page + insert marker (junction point)
            placeCaretAtEnd(prevEl)
            insertCaretMarker()

            // 2) Pull content from current page into previous (Word-like)
            const { movedAny, nextIsEmpty } = pullFromNextPageInto(prevEl, curEl)

            // 3) Sync state + delete page only if truly empty
            setDoc(prevDoc => {
                const pages = [...prevDoc.pages]
                pages[pageIndex - 1] = { ...pages[pageIndex - 1], content: prevEl.innerHTML }
                pages[pageIndex] = { ...pages[pageIndex], content: curEl.innerHTML }

                // If current page is now empty => remove it
                if (nextIsEmpty && pages.length > 1) {
                    pages.splice(pageIndex, 1)
                }
                return { ...prevDoc, pages }
            })

            // 4) After render: restore caret EXACT, reveal, reflow
            requestAnimationFrame(() => {
                isMergingRef.current = false
                restoreCaretFromMarker(prevEl)   // ✅ caret at junction (not at top)
                revealCaret(prevEl)              // ✅ show bottom if scrolled
                reflowDocument()                 // ✅ cascade underflow/overflow
            })

            triggerSave()
            return
        }

        // ========== WORD-LIKE ENTER KEY ==========
        // Let the browser handle Enter natively (creates <p><br></p>).
        // The onInput handler will detect overflow and reflow content to the next page.
        // The reflowDocument() caret marker system will move the cursor to follow.
        // This gives us true Word-like behavior: Enter always creates a paragraph,
        // even at the page boundary, and the cursor follows the new paragraph.
        //
        // NOTE: We do NOT prevent default here anymore — the previous code would
        // prevent Enter and just jump to the next page, which skipped creating a line.

        // Only process modifier shortcuts from here
        if (!isMod(e)) return

        const key = e.key?.toLowerCase()
        if (!key) return

        // Ctrl+B - Bold
        if (key === 'b' && !e.shiftKey && !e.altKey) {
            e.preventDefault()
            formatDoc('bold')
            setIsBold(prev => !prev)
            triggerSave()
            return
        }

        // Ctrl+I - Italic
        if (key === 'i' && !e.shiftKey && !e.altKey) {
            e.preventDefault()
            formatDoc('italic')
            setIsItalic(prev => !prev)
            triggerSave()
            return
        }

        // Ctrl+U - Underline
        if (key === 'u' && !e.shiftKey && !e.altKey) {
            e.preventDefault()
            formatDoc('underline')
            setIsUnderline(prev => !prev)
            triggerSave()
            return
        }

        // Ctrl+Shift+S - Strikethrough
        if (key === 's' && e.shiftKey && !e.altKey) {
            e.preventDefault()
            formatDoc('strikeThrough')
            setIsStrikethrough(prev => !prev)
            triggerSave()
            return
        }
    }, [triggerSave, reflowDocument, handlePageInput])

    // ========== TOKEN INSERTION ==========
    const insertVariableToken = useCallback((variablePath, fieldMetadata = {}) => {
        const range = savedRangeRef.current
        if (!range) {
            console.warn('No saved range for token insertion')
            return
        }

        // Restore selection
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)

        // Delete any selected content
        if (!range.collapsed) {
            range.deleteContents()
        }

        // Insert {{variable}} as plain text
        const tokenText = `{{${variablePath}}} `
        document.execCommand('insertText', false, tokenText)

        triggerSave()
    }, [triggerSave])

    // ========== DYNAMIC TABLE INSERTION ==========
    const insertDynamicTable = useCallback((schema, style = 'professional') => {
        const range = savedRangeRef.current
        if (!range) {
            console.warn('No saved range for table insertion')
            return
        }

        // Restore selection
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)

        // Delete any selected content
        if (!range.collapsed) {
            range.deleteContents()
        }

        // Build preview columns list
        const visibleCols = (schema.columns || []).filter(c => c.visible !== false)
        const colHeaders = visibleCols.map(c => c.label).join(' | ')

        // Create the dynamic table placeholder
        const tableDiv = document.createElement('div')
        tableDiv.className = 'dynamic-table'
        tableDiv.contentEditable = 'false'
        tableDiv.dataset.table = JSON.stringify({
            schemaId: schema._id,
            schemaName: schema.name,
            style: style,
            showTotals: true,
            title: ''
        })

        // Style mapping for preview label
        const styleLabels = { minimal: 'Minimal', professional: 'Professionnel', modern: 'Moderne' }
        const styleColors = {
            minimal: { bg: '#f5f5f5', border: '#333', accent: '#333' },
            professional: { bg: '#f3f4f6', border: '#d1d5db', accent: '#1f2937' },
            modern: { bg: '#eef2ff', border: '#c7d2fe', accent: '#4338ca' }
        }
        const sc = styleColors[style] || styleColors.professional

        tableDiv.innerHTML = `
            <div style="border:2px dashed ${sc.border};border-radius:8px;padding:16px;margin:12px 0;background:${sc.bg};">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:16px;">📊</span>
                    <span style="font-weight:700;font-size:12pt;color:${sc.accent};">${schema.name}</span>
                    <span style="font-size:9pt;color:#6b7280;background:#fff;padding:1px 8px;border-radius:10px;border:1px solid #e5e7eb;">${styleLabels[style] || style}</span>
                </div>
            </div>
        `

        // Insert table
        range.insertNode(tableDiv)

        // Add line break after
        const br = document.createElement('br')
        if (tableDiv.nextSibling) {
            tableDiv.parentNode.insertBefore(br, tableDiv.nextSibling)
        } else {
            tableDiv.parentNode.appendChild(br)
        }

        // Move cursor after
        range.setStartAfter(br)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)

        triggerSave()
    }, [triggerSave])

    // ========== GLOBAL SELECTION ==========
    const handleGlobalSelection = useCallback(() => {
        setIsGlobalSelection(true)
    }, [])

    const handleGlobalCopy = useCallback((e) => {
        if (!isGlobalSelection) return

        const fullHtml = docRef.current.pages
            .map(page => page.content || '')
            .join('<div style="page-break-after: always;"></div>')

        const fullText = docRef.current.pages
            .map(page => {
                const div = document.createElement('div')
                div.innerHTML = page.content || ''
                return div.textContent
            })
            .join('\n\n')

        e.clipboardData.setData('text/html', fullHtml)
        e.clipboardData.setData('text/plain', fullText)
        e.preventDefault()
    }, [isGlobalSelection])

    // ========== GLOBAL KEYBOARD HANDLERS ==========
    // Unified window-level handler: Ctrl+A selects all, Delete/Backspace clears (DOM-first)
    useEffect(() => {
        const handleWindowKeyDown = (e) => {
            // Ctrl+A for global selection — select all text across pages
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !e.shiftKey && !e.altKey) {
                if (editorMode === 'edition') {
                    e.preventDefault()
                    e.stopPropagation()
                    // Visual: select the editor content (not the canvas UI)
                    selectAllDocument(editorRootRef.current, pageRefs.current)
                    setIsGlobalSelection(true)
                    isGlobalSelectionRef.current = true // sync ref immediately (no stale closure)
                    return
                }
            }

            // Delete/Backspace with global selection — DOM-first clear
            // CRITICAL: use ref, NOT closure-captured state (avoids stale closure)
            if (isGlobalSelectionRef.current && (e.key === 'Delete' || e.key === 'Backspace')) {
                e.preventDefault()
                e.stopPropagation()
                // 1) Clear DOM immediately (uncontrolled contenteditable)
                Object.values(pageRefs.current || {}).forEach(el => {
                    if (el) el.innerHTML = ''
                })
                // 2) Clear state (keep only first page)
                setDoc(prev => {
                    const first = prev.pages?.[0] ? { ...prev.pages[0] } : null
                    const page0 = first || {
                        content: '', elements: [], rows: [],
                        mode: 'edition', background: '#ffffff', order: 0,
                    }
                    page0.content = ''
                    page0.elements = []
                    page0.rows = []
                    return { ...prev, pages: [page0] }
                })
                setIsGlobalSelection(false)
                isGlobalSelectionRef.current = false
                // 3) Focus first page
                requestAnimationFrame(() => {
                    const el = pageRefs.current?.[0]
                    if (el) el.focus()
                })
                triggerSave()
                return
            }

            // Any other key while global selection is active — cancel selection
            if (isGlobalSelectionRef.current && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                // Typing replaces the selection — clear all then let the key through
                Object.values(pageRefs.current || {}).forEach(el => {
                    if (el) el.innerHTML = ''
                })
                setDoc(prev => {
                    const first = prev.pages?.[0] ? { ...prev.pages[0] } : null
                    const page0 = first || {
                        content: '', elements: [], rows: [],
                        mode: 'edition', background: '#ffffff', order: 0,
                    }
                    page0.content = ''
                    page0.elements = []
                    page0.rows = []
                    return { ...prev, pages: [page0] }
                })
                setIsGlobalSelection(false)
                isGlobalSelectionRef.current = false
                // Focus first page so the typed character goes there
                const el = pageRefs.current?.[0]
                if (el) el.focus()
                triggerSave()
                // Don't prevent default — let the character be typed
            }
        }

        const handleCopy = (e) => {
            if (isGlobalSelectionRef.current) {
                handleGlobalCopy(e)
            }
        }

        const handleClick = () => {
            if (isGlobalSelectionRef.current) {
                setIsGlobalSelection(false)
                isGlobalSelectionRef.current = false
            }
        }

        window.addEventListener('keydown', handleWindowKeyDown, true) // capture phase!
        window.addEventListener('copy', handleCopy)
        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('keydown', handleWindowKeyDown, true)
            window.removeEventListener('copy', handleCopy)
            window.removeEventListener('click', handleClick)
        }
    }, [editorMode, handleGlobalCopy, triggerSave]) // removed isGlobalSelection — using ref instead

    // ========== PAGE MANAGEMENT ==========
    const addPage = useCallback(() => {
        setDoc(prev => ({
            ...prev,
            pages: [...prev.pages, {
                content: '',
                elements: [],
                rows: [],
                mode: 'edition',
                background: '#ffffff',
                order: prev.pages.length
            }]
        }))
        triggerSave()
    }, [triggerSave])

    const duplicatePage = useCallback((index) => {
        setDoc(prev => {
            const pages = [...prev.pages]
            const duplicate = { ...pages[index], order: pages.length }
            pages.splice(index + 1, 0, duplicate)
            return { ...prev, pages }
        })
        triggerSave()
    }, [triggerSave])

    const deletePage = useCallback((index) => {
        if (doc.pages.length <= 1) return
        setDoc(prev => {
            const pages = prev.pages.filter((_, i) => i !== index)
            return { ...prev, pages }
        })
        if (selectedPageIndex >= index && selectedPageIndex > 0) {
            setSelectedPageIndex(prev => prev - 1)
        }
        triggerSave()
    }, [doc.pages.length, selectedPageIndex, triggerSave])

    const setPageMode = useCallback((index, mode) => {
        setDoc(prev => {
            const pages = [...prev.pages]
            const page = { ...pages[index] }
            const oldMode = page.mode

            // If same mode, no-op
            if (oldMode === mode) return prev

            // Helper: generate unique ID
            const uid = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

            // ===== EDITION → LAYOUT: wrap content into GridBuilder rows =====
            if (oldMode === 'edition' && mode === 'layout') {
                const pageRef = pageRefs.current[index]
                const content = pageRef ? pageRef.innerHTML : (page.content || '')

                if (content && content.trim()) {
                    page.rows = [{
                        id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                        equalHeight: true,
                        columns: [{
                            id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                            width: 12,
                            blocks: [{
                                id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                                type: 'html',
                                content: content
                            }]
                        }]
                    }]
                } else if (!page.rows || page.rows.length === 0) {
                    page.rows = []
                }
                page.content = content
            }

            // ===== EDITION → DESIGNER: convert HTML into positioned elements =====
            if (oldMode === 'edition' && mode === 'designer') {
                const pageRef = pageRefs.current[index]
                const content = pageRef ? pageRef.innerHTML : (page.content || '')
                const margins = prev.margins || { top: 40, bottom: 40, left: 40, right: 40 }
                const dims = prev.dimensions || { width: 794, height: 1123 }

                if (content && content.trim()) {
                    page.elements = [{
                        id: uid(),
                        type: 'text',
                        x: margins.left,
                        y: margins.top,
                        width: dims.width - margins.left - margins.right,
                        height: 'auto',
                        rotation: 0,
                        content: content,
                        fill: '#000000',
                        fontSize: 16,
                        fontFamily: 'Arial',
                        opacity: 1,
                        zIndex: 1,
                        locked: false
                    }]
                } else if (!page.elements || page.elements.length === 0) {
                    page.elements = []
                }
                page.content = content
            }

            // ===== LAYOUT → EDITION: extract blocks back into content =====
            if (oldMode === 'layout' && mode === 'edition') {
                if (page.rows && page.rows.length > 0) {
                    let html = ''
                    page.rows.forEach(row => {
                        if (row.columns) {
                            row.columns.forEach(col => {
                                if (col.blocks) {
                                    col.blocks.forEach(block => {
                                        if (block.type === 'text' || block.type === 'html' || !block.type) {
                                            html += (block.content || '')
                                        } else if (block.type === 'image' && block.src) {
                                            html += `<div style="text-align:center; margin: 10px 0;"><img src="${block.src}" style="max-width:100%; height:auto; border-radius: 8px;"></div>`
                                        }
                                    })
                                }
                            })
                        }
                    })
                    page.content = html
                }
            }

            // ===== DESIGNER → EDITION: extract elements back into content =====
            if (oldMode === 'designer' && mode === 'edition') {
                if (page.elements && page.elements.length > 0) {
                    // Sort by y then x for natural reading order
                    const sorted = [...page.elements].sort((a, b) => (a.y - b.y) || (a.x - b.x))
                    let html = ''
                    sorted.forEach(el => {
                        if (el.type === 'text') {
                            html += (el.content || '')
                        } else if (el.type === 'image' && el.src) {
                            html += `<div style="text-align:center; margin: 10px 0;"><img src="${el.src}" style="max-width:100%; height:auto; border-radius: 8px;"></div>`
                        } else if (el.type === 'shape') {
                            // Shapes become decorative divs
                            const bg = el.fill || '#4361ee'
                            const w = el.width || 200
                            const h = el.height || 150
                            const radius = el.shape === 'circle' ? '50%' : `${el.borderRadius || 0}px`
                            html += `<div style="width:${w}px; height:${h}px; background:${bg}; border-radius:${radius}; margin: 10px auto;"></div>`
                        } else if (el.type === 'line') {
                            const color = el.fill || '#000'
                            html += `<hr style="border: none; height: ${el.strokeWidth || 2}px; background: ${color}; margin: 10px 0;">`
                        }
                    })
                    page.content = html
                }
            }

            // ===== LAYOUT → DESIGNER: convert rows/blocks into positioned elements =====
            if (oldMode === 'layout' && mode === 'designer') {
                const margins = prev.margins || { top: 40, bottom: 40, left: 40, right: 40 }
                const dims = prev.dimensions || { width: 794, height: 1123 }
                const elems = []
                let yOffset = margins.top

                if (page.rows && page.rows.length > 0) {
                    page.rows.forEach(row => {
                        if (row.columns) {
                            let xOffset = margins.left
                            const availableWidth = dims.width - margins.left - margins.right
                            row.columns.forEach(col => {
                                const colWidth = Math.round((col.width / 12) * availableWidth)
                                if (col.blocks) {
                                    col.blocks.forEach(block => {
                                        if (block.type === 'text' || block.type === 'html' || !block.type) {
                                            elems.push({
                                                id: uid(),
                                                type: 'text',
                                                x: xOffset,
                                                y: yOffset,
                                                width: colWidth,
                                                height: 'auto',
                                                rotation: 0,
                                                content: block.content || '',
                                                fill: '#000000',
                                                fontSize: 16,
                                                fontFamily: 'Arial',
                                                opacity: 1,
                                                zIndex: elems.length + 1,
                                                locked: false
                                            })
                                        } else if (block.type === 'image') {
                                            elems.push({
                                                id: uid(),
                                                type: 'image',
                                                x: xOffset,
                                                y: yOffset,
                                                width: Math.min(colWidth, block.width || 300),
                                                height: block.height || 200,
                                                rotation: 0,
                                                src: block.src || '',
                                                alt: block.alt || '',
                                                borderRadius: 8,
                                                opacity: 1,
                                                zIndex: elems.length + 1,
                                                locked: false
                                            })
                                        }
                                        yOffset += 80 // estimated block height
                                    })
                                }
                                xOffset += colWidth
                            })
                        }
                        yOffset += 20 // row gap
                    })
                }
                page.elements = elems
            }

            // ===== DESIGNER → LAYOUT: convert elements into a single row/col =====
            if (oldMode === 'designer' && mode === 'layout') {
                const blocks = []
                if (page.elements && page.elements.length > 0) {
                    const sorted = [...page.elements].sort((a, b) => (a.y - b.y) || (a.x - b.x))
                    sorted.forEach(el => {
                        if (el.type === 'text') {
                            blocks.push({
                                id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                                type: 'html',
                                content: el.content || ''
                            })
                        } else if (el.type === 'image') {
                            blocks.push({
                                id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                                type: 'image',
                                src: el.src || '',
                                alt: el.alt || '',
                                width: el.width
                            })
                        }
                    })
                }
                page.rows = [{
                    id: `row_${Date.now()}`,
                    equalHeight: true,
                    columns: [{
                        id: `col_${Date.now()}`,
                        width: 12,
                        blocks: blocks
                    }]
                }]
            }

            // Sync edition content from DOM if switching away from edition
            if (oldMode === 'edition') {
                const pageRef = pageRefs.current[index]
                if (pageRef) {
                    page.content = pageRef.innerHTML
                }
            }

            page.mode = mode
            pages[index] = page
            return { ...prev, pages }
        })
        triggerSave()
    }, [triggerSave])

    // ========== PDF EXPORT ==========
    const handlePdfExport = useCallback(async () => {
        if (!doc._id) {
            console.warn('Document must be saved before PDF export')
            return
        }

        // Build clean HTML matching EXACTLY the SmartDoc format (resolveDocumentTokens output)
        // Instead of sending raw editor DOM, we extract page content and wrap it properly
        const docMargins = doc.margins || { top: 40, right: 40, bottom: 40, left: 40 }
        const docDims = doc.dimensions || { width: 794, height: 1123 }
        const hasHeader = !!(doc.headerHtml && doc.headerHtml.trim())
        const hasFooter = !!(doc.footerHtml && doc.footerHtml.trim())
        const contentPaddingTop = hasHeader ? 8 : docMargins.top
        const contentPaddingBottom = hasFooter ? 8 : docMargins.bottom

        let pagesHtml = ''
        const pages = doc.pages || []

        for (let i = 0; i < pages.length; i++) {
            const pageEl = pageRefs.current[i]
            // Get content from DOM (source of truth for contenteditable)
            const pageContent = pageEl ? pageEl.innerHTML : (pages[i].content || '')
            const isLastPage = i === pages.length - 1

            pagesHtml += `<div class="doc-page" ${!isLastPage ? 'style="page-break-after: always;"' : ''}>`
            if (hasHeader) {
                pagesHtml += `<div class="doc-header" style="padding: ${docMargins.top}px ${docMargins.right}px 0 ${docMargins.left}px;">${doc.headerHtml}</div>`
            }
            pagesHtml += `<div class="doc-content" style="padding: ${contentPaddingTop}px ${docMargins.right}px ${contentPaddingBottom}px ${docMargins.left}px;">${pageContent}</div>`
            if (hasFooter) {
                pagesHtml += `<div class="doc-footer" style="padding: 0 ${docMargins.right}px ${docMargins.bottom}px ${docMargins.left}px;">${doc.footerHtml}</div>`
            }
            pagesHtml += `</div>`
        }

        // Build the full HTML document — exact same structure as SmartDoc's resolveDocumentTokens
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 0; size: A4; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.6;
            color: #000000;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        /* Tailwind Preflight resets — zero out margins only */
        p, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, figure, hr { margin: 0; }
        ul, ol { list-style: none; padding: 0; }
        img, svg { display: block; max-width: 100%; }
        /* Restore heading sizes to match editor preview */
        h1 { font-size: 2em; font-weight: bold; margin-top: 0.67em; margin-bottom: 0.67em; line-height: 1.2; color: #000; }
        h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.83em; margin-bottom: 0.83em; line-height: 1.3; color: #000; }
        h3 { font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 1em; line-height: 1.4; color: #000; }
        h4 { font-size: 1em; font-weight: bold; margin-top: 1.33em; margin-bottom: 1.33em; color: #000; }
        p { margin-top: 0; margin-bottom: 0; line-height: 1.6; }
        ul { list-style-type: disc; padding-left: 40px; }
        ol { list-style-type: decimal; padding-left: 40px; }
        blockquote { border-left: 4px solid #cbd5e1; margin: 1em 0; padding-left: 1em; color: #475569; }
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        .doc-page {
            width: 100%;
            min-height: ${docDims.height}px;
            background: #ffffff;
            position: relative;
        }
        .doc-content {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
    </style>
</head>
<body>
${pagesHtml}
</body>
</html>`

        setIsGeneratingPdf(true)
        try {
            await exportPdf(doc._id, doc.name, fullHtml, accountNumber)
        } finally {
            setIsGeneratingPdf(false)
        }
    }, [doc._id, doc.name, doc.pages, doc.margins, doc.dimensions, doc.headerHtml, doc.footerHtml, accountNumber])

    // ========== DIMENSION UPDATES ==========
    const updateDimensions = useCallback(() => {
        const dimensions = {
            A4: { portrait: { width: 794, height: 1123 }, landscape: { width: 1123, height: 794 } },
            A5: { portrait: { width: 559, height: 794 }, landscape: { width: 794, height: 559 } },
            A3: { portrait: { width: 1123, height: 1587 }, landscape: { width: 1587, height: 1123 } },
            Letter: { portrait: { width: 816, height: 1056 }, landscape: { width: 1056, height: 816 } },
            Legal: { portrait: { width: 816, height: 1344 }, landscape: { width: 1344, height: 816 } }
        }
        const dim = dimensions[doc.format]?.[doc.orientation] || dimensions.A4.portrait
        setDoc(prev => ({ ...prev, dimensions: dim }))
        triggerSave()
    }, [doc.format, doc.orientation, triggerSave])

    // Update selection state on mouse events
    const handleMouseUp = useCallback(() => {
        saveSelection()
        updateFormattingState()
    }, [saveSelection, updateFormattingState])

    // Update toolbar when selection changes (keyboard navigation, click, etc.)
    useEffect(() => {
        const handleSelectionChange = () => {
            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) return
            // Only update if selection is inside our editor
            const node = sel.getRangeAt(0).commonAncestorContainer
            const editorRoot = editorRootRef.current
            if (editorRoot && editorRoot.contains(node)) {
                saveSelection()
                updateFormattingState()
            }
        }
        document.addEventListener('selectionchange', handleSelectionChange)
        return () => document.removeEventListener('selectionchange', handleSelectionChange)
    }, [saveSelection, updateFormattingState])

    // ========== AI AGENT FUNCTIONS ==========
    /**
     * Get a snapshot of the document content for AI analysis
     * @param {Object} options - Configuration options
     * @param {number} options.maxChars - Maximum characters to return (default: 6000)
     * @param {boolean} options.includeActivePage - Include active page content (default: true)
     * @param {number} options.includeFirstPages - Number of first pages to include (default: 2)
     * @param {boolean} options.includeSelection - Include selected text separately (default: true)
     * @returns {Object} { snapshot: string, selection: string, activePageIndex: number }
     */
    const getDocumentSnapshot = useCallback(({
        maxChars = 6000,
        includeActivePage = true,
        includeFirstPages = 2,
        includeSelection = true
    } = {}) => {
        let snapshot = ''
        let selection = ''
        let selectionRefs = []

        // Check if there are locked selection blocks with refs
        const lockedBlocks = document.querySelectorAll('[data-loc^="sel-"]')
        if (lockedBlocks.length > 0) {
            // Collect all refs and text from locked blocks
            selectionRefs = Array.from(lockedBlocks).map(el => el.getAttribute('data-loc'))
            selection = Array.from(lockedBlocks).map(el => el.textContent.trim()).join('\n\n')
        } else if (includeSelection) {
            // Get selected text if no locked selection
            const sel = window.getSelection()
            if (sel && sel.toString().trim()) {
                selection = sel.toString().trim()
            }
        }

        // Assign data-loc refs to block elements in a page
        const assignRefs = (pageEl, pageIndex) => {
            const blocks = pageEl.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote')
            let blockCounter = 0
            blocks.forEach(block => {
                if (!block.textContent.trim()) return
                if (block.getAttribute('data-loc')) return
                const ref = `loc-p${pageIndex}-${blockCounter++}`
                block.setAttribute('data-loc', ref)
            })
        }

        // Build page content with refs
        const pageContents = []
        const pages = []
        const pagesWithRefs = [] // Store page content with refs for page mode
        const totalPages = doc.pages.length

        for (let i = 0; i < totalPages; i++) {
            const pageRef = pageRefs.current[i]
            if (!pageRef) continue

            // Add refs to this page's elements
            assignRefs(pageRef, i)

            const text = pageRef?.innerText?.trim() || ''
            pages.push(text)

            // Build content with refs and HTML for this page
            const refBlocks = Array.from(pageRef.querySelectorAll('[data-loc]'))
                .map(el => {
                    const ref = el.getAttribute('data-loc')
                    const html = el.innerHTML.trim()
                    if (!html) return null
                    return `[${ref}]\n${html}`
                })
                .filter(Boolean)
                .join('\n\n')
            pagesWithRefs.push(refBlocks || text)

            const isFirstPage = i < includeFirstPages
            const isActivePage = i === selectedPageIndex && includeActivePage

            if (isFirstPage || isActivePage) {
                if (text) {
                    pageContents.push(`=== Page ${i + 1}/${totalPages} ===\n${refBlocks || text}`)
                }
            }
        }

        snapshot = pageContents.join('\n\n')

        // Truncate if needed
        if (snapshot.length > maxChars) {
            snapshot = snapshot.substring(0, maxChars) + '\n\n[... truncated ...]'
        }

        return {
            snapshot,
            selection,
            selectionRefs,
            activePageIndex: selectedPageIndex,
            totalPages: doc.pages.length,
            pages,
            pagesWithRefs
        }
    }, [doc.pages.length, selectedPageIndex])

    /**
     * Get currently selected text in the editor
     * @returns {string} Selected text or empty string
     */
    const getSelectionText = useCallback(() => {
        const sel = window.getSelection()
        if (!sel || !sel.toString().trim()) return ''

        // Check if selection is within our editor
        const range = sel.getRangeAt(0)
        const container = range.commonAncestorContainer
        const isInEditor = Object.values(pageRefs.current).some(
            pageEl => pageEl && pageEl.contains(container)
        )

        return isInEditor ? sel.toString().trim() : ''
    }, [])

    /**
     * Apply a patch action from the AI agent
     * @param {Object} action - The action to apply
     * @returns {Object} { success: boolean, message: string }
     */
    const applyPatch = useCallback((action) => {
        const { type, target = {}, patch = {} } = action

        try {
            switch (type) {
                case 'replace_selection': {
                    // Replace currently selected text
                    const sel = window.getSelection()
                    if (!sel || sel.rangeCount === 0) {
                        return { success: false, message: 'Aucune sélection active' }
                    }

                    const range = sel.getRangeAt(0)
                    if (range.collapsed) {
                        return { success: false, message: 'Aucun texte sélectionné' }
                    }

                    range.deleteContents()
                    const textNode = document.createTextNode(patch.replacement || '')
                    range.insertNode(textNode)

                    // Move cursor after inserted text
                    range.setStartAfter(textNode)
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)

                    triggerSave()
                    return { success: true, message: 'Texte remplacé' }
                }

                case 'replace_ref': {
                    // Replace content of element identified by data-loc ref
                    const { ref, pageIndex = selectedPageIndex } = target
                    const { replacement } = patch

                    if (!ref) {
                        return { success: false, message: 'Référence manquante' }
                    }

                    // Find element by data-loc attribute
                    const refEl = document.querySelector(`[data-loc="${ref}"]`)
                    if (!refEl) {
                        return { success: false, message: `Élément avec ref "${ref}" non trouvé` }
                    }

                    // Replace the innerHTML to preserve HTML structure in replacement
                    // The replacement should be the translated/reformulated TEXT, 
                    // but we want to preserve the block structure of the original element
                    refEl.innerHTML = replacement || ''

                    // Remove the data-loc and selection-locked class after applying
                    refEl.removeAttribute('data-loc')
                    refEl.classList.remove('selection-locked')

                    triggerSave()
                    return { success: true, message: 'Contenu remplacé' }
                }

                case 'replace_text': {
                    // Replace specific text within an element identified by ref
                    const { ref, matchText, pageIndex = selectedPageIndex } = target
                    const { replacement } = patch
                    const actionId = action?.id

                    if (!ref || !matchText) {
                        return { success: false, message: 'Référence ou texte à remplacer manquant' }
                    }

                    // First try to find by highlight with action ID (if available)
                    if (actionId) {
                        const exactHighlight = document.querySelector(`.ai-highlight[data-action-id="${actionId}"]`)
                        if (exactHighlight) {
                            const textNode = document.createTextNode(replacement || '')
                            exactHighlight.parentNode.replaceChild(textNode, exactHighlight)
                            exactHighlight.parentNode?.normalize?.()
                            triggerSave()
                            return { success: true, message: 'Texte corrigé' }
                        }
                    }

                    // Find element by data-loc ref
                    const refEl = document.querySelector(`[data-loc="${ref}"]`)
                    if (!refEl) {
                        return { success: false, message: `Élément avec ref "${ref}" non trouvé` }
                    }

                    // Find and replace the text within this element
                    const walker = document.createTreeWalker(
                        refEl,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    )

                    let found = false
                    while (walker.nextNode()) {
                        const node = walker.currentNode
                        // Skip highlight elements
                        if (node.parentElement?.classList?.contains('ai-highlight')) continue

                        let idx = node.textContent.indexOf(matchText)
                        if (idx === -1) {
                            // Try case-insensitive
                            idx = node.textContent.toLowerCase().indexOf(matchText.toLowerCase())
                        }

                        if (idx !== -1) {
                            const before = node.textContent.substring(0, idx)
                            const after = node.textContent.substring(idx + matchText.length)
                            node.textContent = before + replacement + after
                            found = true
                            break
                        }
                    }

                    if (!found) {
                        return { success: false, message: `Texte "${matchText}" non trouvé dans l'élément` }
                    }

                    triggerSave()
                    return { success: true, message: 'Texte corrigé' }
                }

                case 'insert_after_anchor': {
                    // Find anchor text and insert content after it
                    const { pageIndex = selectedPageIndex, anchorBefore } = target
                    const { content } = patch

                    if (!anchorBefore || !content) {
                        return { success: false, message: 'Ancre ou contenu manquant' }
                    }

                    const pageEl = pageRefs.current[pageIndex]
                    if (!pageEl) {
                        return { success: false, message: `Page ${pageIndex + 1} non trouvée` }
                    }

                    // Find the anchor in text nodes
                    const walker = document.createTreeWalker(
                        pageEl,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    )

                    let found = false
                    while (walker.nextNode()) {
                        const node = walker.currentNode
                        const idx = node.textContent.indexOf(anchorBefore)
                        if (idx !== -1) {
                            // Split the text node and insert content
                            const afterIdx = idx + anchorBefore.length
                            const before = node.textContent.substring(0, afterIdx)
                            const after = node.textContent.substring(afterIdx)

                            node.textContent = before + content + after
                            found = true
                            break
                        }
                    }

                    if (!found) {
                        return { success: false, message: `Ancre "${anchorBefore}" non trouvée` }
                    }

                    triggerSave()
                    return { success: true, message: 'Contenu inséré' }
                }

                case 'replace_between_anchors': {
                    // Find text between two anchors and replace it
                    const { pageIndex = selectedPageIndex, anchorStart, anchorEnd, matchText, before: beforeHint, after: afterHint } = target
                    const { replacement } = patch
                    const actionId = action?.id // Get action ID for highlight-based replacement

                    if (!matchText || replacement === undefined) {
                        return { success: false, message: 'Texte à remplacer ou remplacement manquant' }
                    }

                    const pageEl = pageRefs.current[pageIndex]
                    if (!pageEl) {
                        return { success: false, message: `Page ${pageIndex + 1} non trouvée` }
                    }

                    // MOST RELIABLE: Find highlight by action.id (the highlight is already correctly placed)
                    if (actionId) {
                        const exactHighlight = pageEl.querySelector(`.ai-highlight[data-action-id="${actionId}"]`)
                        if (exactHighlight) {
                            // Remove preview span if any
                            const preview = exactHighlight.querySelector('.ai-preview-new')
                            if (preview) preview.remove()

                            // Replace the highlight with the replacement text
                            const textNode = document.createTextNode(replacement)
                            exactHighlight.parentNode.replaceChild(textNode, exactHighlight)
                            // Normalize parent to merge adjacent text nodes
                            exactHighlight.parentNode?.normalize?.()
                            triggerSave()
                            return { success: true, message: 'Texte remplacé' }
                        }
                    }

                    // Helper: Find best occurrence using before/after locators
                    const findBestOccurrence = (text, searchText, beforeHint, afterHint) => {
                        const hits = []
                        let start = 0
                        while (true) {
                            let idx = text.indexOf(searchText, start)
                            if (idx === -1) {
                                idx = text.toLowerCase().indexOf(searchText.toLowerCase(), start)
                                if (idx === -1) break
                            }
                            const actualText = text.substring(idx, idx + searchText.length)
                            const before = text.slice(Math.max(0, idx - 30), idx)
                            const after = text.slice(idx + searchText.length, idx + searchText.length + 30)
                            hits.push({ idx, before, after, actualText })
                            start = idx + searchText.length
                        }
                        if (!hits.length) return null
                        if (!beforeHint && !afterHint) return hits[0]

                        let best = hits[0], bestScore = -1
                        for (const h of hits) {
                            const score =
                                (beforeHint && h.before.includes(beforeHint) ? 2 : 0) +
                                (afterHint && h.after.includes(afterHint) ? 2 : 0) +
                                (beforeHint && h.before.toLowerCase().includes(beforeHint.toLowerCase()) ? 1 : 0) +
                                (afterHint && h.after.toLowerCase().includes(afterHint.toLowerCase()) ? 1 : 0)
                            if (score > bestScore) { best = h; bestScore = score }
                        }
                        return best
                    }

                    // FIRST: Check if text is in an ai-highlight mark and replace the whole mark
                    const highlightMarks = pageEl.querySelectorAll('.ai-highlight')
                    for (const mark of highlightMarks) {
                        // Get original text (excluding the preview span)
                        const previewSpan = mark.querySelector('.ai-preview-new')
                        let markText = mark.textContent
                        if (previewSpan) {
                            markText = markText.replace(previewSpan.textContent, '')
                        }

                        // Check if this mark contains the text we're looking for
                        if (markText === matchText ||
                            markText.toLowerCase() === matchText.toLowerCase() ||
                            markText.trim().toLowerCase() === matchText.trim().toLowerCase()) {
                            // Replace the mark with the replacement text
                            const textNode = document.createTextNode(replacement)
                            mark.parentNode.replaceChild(textNode, mark)
                            triggerSave()
                            return { success: true, message: 'Texte remplacé' }
                        }
                    }

                    // LOCATOR-BASED REPLACEMENT: Use before/after to find the exact occurrence
                    if (beforeHint || afterHint) {
                        const walker = document.createTreeWalker(
                            pageEl,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        )

                        let bestNode = null
                        let bestOcc = null
                        let bestScore = -1

                        while (walker.nextNode()) {
                            const node = walker.currentNode
                            if (node.parentElement?.classList?.contains('ai-highlight')) continue
                            if (node.parentElement?.classList?.contains('ai-preview-new')) continue

                            const content = node.textContent
                            const occ = findBestOccurrence(content, matchText, beforeHint, afterHint)

                            if (occ) {
                                const score =
                                    (beforeHint && occ.before.includes(beforeHint) ? 2 : 0) +
                                    (afterHint && occ.after.includes(afterHint) ? 2 : 0)

                                if (score > bestScore || bestNode === null) {
                                    bestNode = node
                                    bestOcc = occ
                                    bestScore = score
                                }
                                if (score >= 4) break // Perfect match
                            }
                        }

                        if (bestNode && bestOcc) {
                            const content = bestNode.textContent
                            const newContent =
                                content.substring(0, bestOcc.idx) +
                                replacement +
                                content.substring(bestOcc.idx + bestOcc.actualText.length)
                            bestNode.textContent = newContent
                            triggerSave()
                            return { success: true, message: 'Texte remplacé' }
                        }
                    }

                    // FALLBACK: Helper to find and replace in regular text nodes (first match)
                    const findAndReplace = (searchText, caseSensitive = true) => {
                        const walker = document.createTreeWalker(
                            pageEl,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        )

                        while (walker.nextNode()) {
                            const node = walker.currentNode
                            // Skip text nodes inside ai-highlight marks
                            if (node.parentElement?.classList?.contains('ai-highlight')) continue
                            if (node.parentElement?.classList?.contains('ai-preview-new')) continue

                            const content = node.textContent

                            let idx = caseSensitive
                                ? content.indexOf(searchText)
                                : content.toLowerCase().indexOf(searchText.toLowerCase())

                            if (idx !== -1) {
                                // Get the actual text to replace (for case-insensitive)
                                const actualText = caseSensitive
                                    ? searchText
                                    : content.substring(idx, idx + searchText.length)
                                node.textContent = content.replace(actualText, replacement)
                                return true
                            }
                        }
                        return false
                    }

                    // Try exact match first
                    if (findAndReplace(matchText, true)) {
                        triggerSave()
                        return { success: true, message: 'Texte remplacé' }
                    }

                    // Try case-insensitive match
                    if (findAndReplace(matchText, false)) {
                        triggerSave()
                        return { success: true, message: 'Texte remplacé (correspondance approchée)' }
                    }

                    // Try with trimmed spaces
                    if (findAndReplace(matchText.trim(), false)) {
                        triggerSave()
                        return { success: true, message: 'Texte remplacé (correspondance approchée)' }
                    }

                    // Not found - provide helpful error
                    const pageText = pageEl.textContent.substring(0, 200)
                    console.log('[applyPatch] Text not found. Looking for:', matchText)
                    console.log('[applyPatch] Page content preview:', pageText)

                    return { success: false, message: `Texte "${matchText.substring(0, 20)}..." non trouvé sur la page ${pageIndex + 1}` }
                }

                case 'insert_content': {
                    // Insert content at cursor position or at the end of active page
                    const { content } = patch

                    if (!content) {
                        return { success: false, message: 'Contenu à insérer manquant' }
                    }

                    const pageEl = pageRefs.current[selectedPageIndex]
                    if (!pageEl) {
                        return { success: false, message: `Page ${selectedPageIndex + 1} non trouvée` }
                    }

                    // Check if there's a selection/cursor
                    const sel = window.getSelection()
                    if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0)
                        const container = range.commonAncestorContainer

                        // If cursor is in our page, insert there
                        if (pageEl.contains(container)) {
                            // Delete any selected content first
                            if (!range.collapsed) {
                                range.deleteContents()
                            }

                            // Use insertHTML command to properly render HTML content
                            document.execCommand('insertHTML', false, content)

                            // Check for overflow and create new pages if needed
                            requestAnimationFrame(() => {
                                checkOverflow(pageEl, selectedPageIndex, docRef.current, setDoc, pageRefs)
                            })

                            triggerSave()
                            return { success: true, message: 'Contenu inséré à la position du curseur' }
                        }
                    }

                    // Otherwise append to the page
                    const wrapper = document.createElement('div')
                    wrapper.innerHTML = content.replace(/\n/g, '<br>')
                    while (wrapper.firstChild) {
                        pageEl.appendChild(wrapper.firstChild)
                    }

                    // Check for overflow and create new pages if needed
                    requestAnimationFrame(() => {
                        checkOverflow(pageEl, selectedPageIndex, docRef.current, setDoc, pageRefs)
                    })

                    triggerSave()
                    return { success: true, message: 'Contenu inséré dans le document' }
                }

                default:
                    return { success: false, message: `Type d'action inconnu: ${type}` }
            }
        } catch (err) {
            console.error('applyPatch error:', err)
            return { success: false, message: `Erreur: ${err.message}` }
        }
    }, [selectedPageIndex, triggerSave])

    // ========== RENDER ==========
    return (
        <div
            className="flex flex-col bg-gray-100 dark:bg-gray-950"
            onMouseUp={handleMouseUp}
            onKeyDown={handleGlobalKeyDown}
            tabIndex={-1}
            style={{ height: '100%' }}
        >
            {/* Word-like HTML styles for contenteditable - only applies if no inline style */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* Default styles only - won't override inline styles from Word */
                [contenteditable="true"] h1:not([style]) {
                    font-size: 2em;
                    font-weight: bold;
                    margin-top: 0.67em;
                    margin-bottom: 0.67em;
                    line-height: 1.2;
                }
                [contenteditable="true"] h2:not([style]) {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin-top: 0.83em;
                    margin-bottom: 0.83em;
                    line-height: 1.3;
                }
                [contenteditable="true"] h3:not([style]) {
                    font-size: 1.17em;
                    font-weight: bold;
                    margin-top: 1em;
                    margin-bottom: 1em;
                    line-height: 1.4;
                }
                [contenteditable="true"] p:not([style]) {
                    margin-top: 0;
                    margin-bottom: 1em;
                    line-height: 1.6;
                }
                [contenteditable="true"] ul:not([style]),
                [contenteditable="true"] ol:not([style]) {
                    margin-top: 0;
                    margin-bottom: 1em;
                    padding-left: 2em;
                }
                [contenteditable="true"] li:not([style]) {
                    margin-bottom: 0.5em;
                    line-height: 1.5;
                }
                [contenteditable="true"] ul li {
                    list-style-type: disc;
                }
                [contenteditable="true"] ol li {
                    list-style-type: decimal;
                }
                [contenteditable="true"] strong:not([style]),
                [contenteditable="true"] b:not([style]) {
                    font-weight: bold;
                }
                [contenteditable="true"] em:not([style]),
                [contenteditable="true"] i:not([style]) {
                    font-style: italic;
                }
                [contenteditable="true"] u:not([style]) {
                    text-decoration: underline;
                }
                [contenteditable="true"] a:not([style]) {
                    color: #2563eb;
                    text-decoration: underline;
                }
                [contenteditable="true"] blockquote:not([style]) {
                    margin: 1em 0;
                    padding-left: 1em;
                    border-left: 4px solid #d1d5db;
                    color: #6b7280;
                    font-style: italic;
                }

                /* ===== BLOCK INTERACTION SYSTEM ===== */
                /* Block containers: blockquote, table, div with style, pre */
                [contenteditable="true"] > blockquote,
                [contenteditable="true"] > table,
                [contenteditable="true"] > div[style],
                [contenteditable="true"] > pre {
                    position: relative;
                }
                /* Hover outline for blocks */
                [contenteditable="true"] > blockquote:hover,
                [contenteditable="true"] > table:hover,
                [contenteditable="true"] > div[style]:hover,
                [contenteditable="true"] > pre:hover {
                    outline: 2px solid rgba(59, 130, 246, 0.3);
                    outline-offset: 2px;
                    border-radius: 4px;
                }

                /* Delete button for blocks (injected by JS on mouseenter) */
                .doc-block-delete-btn {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: #ef4444;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: bold;
                    line-height: 1;
                    cursor: pointer;
                    z-index: 10;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    transition: transform 0.15s, background 0.15s;
                    pointer-events: auto;
                    opacity: 0;
                    animation: doc-block-fadein 0.15s ease forwards;
                }
                .doc-block-delete-btn:hover {
                    background: #dc2626;
                    transform: scale(1.15);
                }
                @keyframes doc-block-fadein {
                    from { opacity: 0; transform: scale(0.8); }
                    to   { opacity: 1; transform: scale(1); }
                }

                /* Template token styles */
                .template-token {
                    display: inline;
                    background: #dbeafe;
                    color: #1d4ed8;
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-family: inherit;
                    font-size: inherit;
                    border: 1px solid #93c5fd;
                    cursor: default;
                    user-select: none;
                    white-space: nowrap;
                }

                /* Dynamic table placeholder */
                .dynamic-table {
                    user-select: none;
                    cursor: default;
                    margin: 8px 0;
                    transition: box-shadow 0.2s;
                }
                .dynamic-table:hover {
                    box-shadow: 0 0 0 2px rgba(67,97,238,0.3);
                    border-radius: 8px;
                }
            ` }} />
            {/* Header with Toolbar */}
            <EditorHeader
                doc={doc}
                setDoc={setDoc}
                accountNumber={accountNumber}
                lastSaved={lastSaved}
                triggerSave={triggerSave}
                handlePdfExport={handlePdfExport}
                isContextFree={isContextFree}
                isGeneratingPdf={isGeneratingPdf}
                // Template props
                availableEntities={availableEntities}
                isTemplateMode={isTemplateMode}
                // Paste mode props
                pasteMode={pasteMode}
                setPasteMode={setPasteMode}
                // Formatting props
                currentFont={currentFont}
                currentFontSize={currentFontSize}
                isBold={isBold}
                isItalic={isItalic}
                isUnderline={isUnderline}
                isStrikethrough={isStrikethrough}
                currentAlignment={currentAlignment}
                currentLineHeight={currentLineHeight}
                currentLetterSpacing={currentLetterSpacing}
                handleFormat={handleFormat}
                handleFontSizeChange={handleFontSizeChange}
                handleLineSpacingChange={handleLineSpacingChange}
                handleLetterSpacingChange={handleLetterSpacingChange}
                FONT_FAMILIES={FONT_FAMILIES}
                FONT_SIZES={FONT_SIZES}
            />

            {/* Context-free binding resolution bar */}
            {contextFreeBindings && contextFreeBindings.length > 0 && (
                <BindingBar
                    bindings={contextFreeBindings}
                    accountNumber={accountNumber}
                    documentId={doc._id}
                    pageRefs={pageRefs}
                    setDoc={setDoc}
                    onBindingResolved={(binding, record, contextRecord) => {
                        console.log('[DocumentEditor] Binding resolved:', binding.entityName, '->', record.title)
                        if (contextRecord) {
                            console.log('[DocumentEditor] Context record found:', contextRecord.entityName, '->', contextRecord.title)
                        }
                        triggerSave()
                    }}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <LeftSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    insertVariableToken={insertVariableToken}
                    insertDynamicTable={insertDynamicTable}
                    isSettingsOpen={isSettingsOpen}
                    onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
                    doc={doc}
                    setDoc={setDoc}
                    triggerSave={triggerSave}
                    accountNumber={accountNumber}
                    settingsPanelProps={{
                        isOpen: isSettingsOpen,
                        onClose: () => setIsSettingsOpen(false),
                        doc,
                        setDoc,
                        openSections,
                        setOpenSections,
                        selectedPageIndex,
                        setSelectedPageIndex,
                        updateDimensions,
                        addPage,
                        duplicatePage,
                        deletePage
                    }}
                />

                {/* Canvas */}
                <CanvasContainer
                    ref={editorRootRef}
                    doc={doc}
                    setDoc={setDoc}
                    pageRefs={pageRefs}
                    selectedPageIndex={selectedPageIndex}
                    setSelectedPageIndex={setSelectedPageIndex}
                    editorMode={editorMode}
                    isGlobalSelection={isGlobalSelection}
                    handlePageInput={handlePageInput}
                    handlePaste={handlePaste}
                    handleKeyDown={handleKeyDown}
                    setPageMode={setPageMode}
                    addPage={addPage}
                    zoomLevel={zoomLevel}
                    setZoomLevel={setZoomLevel}
                    accountNumber={accountNumber}
                />

                {/* AI Chat Sidebar - now floating, not in layout flow */}
                <AIChatSidebar
                    accountNumber={accountNumber}
                    getDocumentSnapshot={getDocumentSnapshot}
                    getSelectionText={getSelectionText}
                    applyPatch={applyPatch}
                    pageRefs={pageRefs}
                    selectedPageIndex={selectedPageIndex}
                />
            </div>

            {/* Global Selection Overlay */}
            {isGlobalSelection && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    [contenteditable="true"] {
                        background: rgba(59, 130, 246, 0.1) !important;
                    }
                    [contenteditable="true"] * {
                        background: rgba(59, 130, 246, 0.2) !important;
                        color: inherit !important;
                    }
                ` }} />
            )}

            {/* Floating Date Picker */}
            {datePickerState && (
                <div
                    style={{
                        position: 'fixed',
                        top: Math.min(datePickerState.rect.top, window.innerHeight - 80),
                        left: Math.min(datePickerState.rect.left, window.innerWidth - 280),
                        zIndex: 10000,
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontFamily: "'Inter', sans-serif",
                        animation: 'bindingPickerIn 0.15s ease-out'
                    }}
                >
                    <iconify-icon icon="solar:calendar-bold-duotone" width="18" style={{ color: '#6366f1', flexShrink: 0 }}></iconify-icon>
                    <input
                        type="date"
                        autoFocus
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '13px',
                            color: '#1e293b',
                            outline: 'none',
                            fontFamily: "'Inter', sans-serif",
                            minWidth: '140px'
                        }}
                        onFocus={(e) => e.target.showPicker?.()}
                        onChange={(e) => {
                            const val = e.target.value
                            if (!val) return
                            // Format as DD/MM/YYYY
                            const [y, m, d] = val.split('-')
                            const formatted = `${d}/${m}/${y}`

                            const { textNode, start, end } = datePickerState
                            if (textNode && textNode.parentNode) {
                                const text = textNode.textContent
                                textNode.textContent = text.substring(0, start) + formatted + text.substring(end)
                                triggerSave()
                            }
                            setDatePickerState(null)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setDatePickerState(null)
                        }}
                        onBlur={() => {
                            // Delay to allow onChange to fire first
                            setTimeout(() => setDatePickerState(null), 150)
                        }}
                    />
                    <button
                        onClick={() => setDatePickerState(null)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#f1f5f9',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '12px',
                            flexShrink: 0
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}

