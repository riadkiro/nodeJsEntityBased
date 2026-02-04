/**
 * DocumentEditorIsland - Main Component
 * 1:1 parity with Alpine.js documentEditor()
 * 
 * CRITICAL: contenteditable areas are UNCONTROLLED
 * - Content is accessed via refs, NOT state
 * - Selection/Range stored in refs to survive re-renders
 * - Autosave timeout stored in ref
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { saveDocument, exportPdf, uploadImage } from './services/documentApi'
import { cleanWordHtml } from './utils/cleanWordHtml'
import { parseWordHtml, hasBase64Images } from './utils/parseWordHtml'
import { checkOverflow, checkUnderflow, pullFromNextPageInto } from './utils/paginationUtils'
import { formatDoc, detectCurrentStyles, applyFontSize, applyLineSpacing, applyLetterSpacing, FONT_FAMILIES, FONT_SIZES } from './utils/formatUtils'

// Native keyboard detection - NO external library, CANNOT fail
const isMod = (e) => e.ctrlKey || e.metaKey

// ========== WORD-LIKE SELECTION HELPERS ==========
function selectAllDocument(editorRootEl) {
    const sel = window.getSelection()
    if (!sel || !editorRootEl) return
    const range = document.createRange()
    range.selectNodeContents(editorRootEl)
    sel.removeAllRanges()
    sel.addRange(range)
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

// Default document structure
const createDefaultDoc = () => ({
    _id: null,
    name: 'Document sans titre',
    format: 'A4',
    orientation: 'portrait',
    status: 'draft',
    dimensions: { width: 794, height: 1123 },
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
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

export default function DocumentEditorIsland({ accountNumber, initialDocument, isNew }) {
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

    // HTML Editor Modal
    const [editingHtml, setEditingHtml] = useState(false)
    const [editingHtmlContent, setEditingHtmlContent] = useState('')
    const [editingElementIndex, setEditingElementIndex] = useState(null)

    // ========== REFS (Critical for stability) ==========
    const saveTimeoutRef = useRef(null)
    const savedRangeRef = useRef(null)
    const pageRefs = useRef({})
    const editorRootRef = useRef(null)
    const docRef = useRef(doc) // Always current doc for callbacks
    const isMergingRef = useRef(false) // Prevents race conditions during merge

    // Keep docRef in sync
    useEffect(() => {
        docRef.current = doc
    }, [doc])

    // ========== AUTOSAVE ==========
    const triggerSave = useCallback(() => {
        // Clear existing timeout
        clearTimeout(saveTimeoutRef.current)

        // Set new timeout (1 second debounce)
        saveTimeoutRef.current = setTimeout(async () => {
            // Read current content from page refs
            const currentDoc = { ...docRef.current }
            currentDoc.pages = currentDoc.pages.map((page, i) => {
                const pageRef = pageRefs.current[i]
                if (pageRef && page.mode === 'edition') {
                    return { ...page, content: pageRef.innerHTML }
                }
                return page
            })

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
        updateFormattingState()
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
    // After each input, reflow entire document: overflow forward, then underflow backward
    const reflowDocument = useCallback(() => {
        requestAnimationFrame(() => {
            const d = docRef.current
            if (!d?.pages?.length) return

            console.log('[Reflow] Starting overflow pass for', d.pages.length, 'pages')

            // 1) Overflow forward pass (push content forward)
            for (let i = 0; i < d.pages.length; i++) {
                const el = pageRefs.current[i]
                if (el) {
                    console.log('[Reflow] Checking overflow for page', i, 'scrollHeight:', el.scrollHeight, 'clientHeight:', el.clientHeight)
                    checkOverflow(el, i, docRef.current, setDoc, pageRefs)
                }
            }

            // 2) Underflow backward pass (pull content back) - after a frame to let overflow settle
            requestAnimationFrame(() => {
                const d2 = docRef.current
                if (!d2?.pages?.length) return

                console.log('[Reflow] Starting underflow pass for', d2.pages.length, 'pages')

                for (let i = 0; i < d2.pages.length - 1; i++) {
                    const el = pageRefs.current[i]
                    if (el) {
                        console.log('[Reflow] Checking underflow for page', i)
                        checkUnderflow(el, i, docRef.current, setDoc, pageRefs)
                    }
                }
            })
        })
    }, [])

    // ========== PAGE INPUT HANDLING ==========
    const handlePageInput = useCallback((e, pageIndex) => {
        console.log('📝 INPUT triggered on page', pageIndex)
        saveSelection()

        // Trigger full document reflow (Word-like)
        reflowDocument()

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
            content = content.replace(/\n/g, '<br>')
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
                // Fallback to plain text
                content = clipboardData.getData('text/plain')
                content = content.replace(/\n/g, '<br>')
            }
        }

        // Insert at cursor using execCommand
        document.execCommand('insertHTML', false, content)

        // Trigger save and pagination check
        requestAnimationFrame(() => {
            const pageRef = pageRefs.current[pageIndex]
            if (pageRef) {
                checkOverflow(pageRef, pageIndex, docRef.current, setDoc, pageRefs)
            }
        })

        triggerSave()
    }, [pasteMode, triggerSave, doc._id, accountNumber])

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

    // Global keyboard handler - handles document-wide shortcuts
    const handleGlobalKeyDown = useCallback((e) => {
        const key = e.key?.toLowerCase()

        // Ctrl+A => Select all pages
        if (isMod(e) && key === 'a' && !e.shiftKey && !e.altKey) {
            e.preventDefault()
            selectAllDocument(editorRootRef.current)
            return
        }

        // Delete/Backspace when entire document is selected => Word-like clear
        if ((e.key === 'Backspace' || e.key === 'Delete') && isSelectionCoversAll(editorRootRef.current)) {
            e.preventDefault()
            clearDocumentKeepFirstPage()
            return
        }

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
    }, [triggerSave, clearDocumentKeepFirstPage])

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
            if (!sel || sel.rangeCount === 0) {
                console.log('[revealCaret] No selection found')
                return
            }
            const rect = sel.getRangeAt(0).getBoundingClientRect()
            const margin = 120

            console.log('[revealCaret] rect.top:', rect.top, 'rect.bottom:', rect.bottom, 'viewport:', window.innerHeight, 'margin:', margin)

            // If caret is below viewport, scroll down
            if (rect.bottom > window.innerHeight - margin) {
                console.log('[revealCaret] Scrolling DOWN by', rect.bottom - window.innerHeight + margin)
                window.scrollBy({ top: rect.bottom - window.innerHeight + margin, behavior: 'instant' })
            }
            // If caret is above viewport, scroll up
            else if (rect.top < margin) {
                console.log('[revealCaret] Scrolling UP by', rect.top - margin)
                window.scrollBy({ top: rect.top - margin, behavior: 'instant' })
            } else {
                console.log('[revealCaret] Caret already visible, no scroll needed')
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

        // ✅ Enter at end of page => move to start of next page (if next page exists)
        if (e.key === 'Enter' && !e.shiftKey && pageIndex < docRef.current.pages.length - 1 && isCaretAtEnd(el)) {
            e.preventDefault()
            console.log('[Navigate] Enter at end, moving to page', pageIndex + 2)

            const nextEl = pageRefs.current[pageIndex + 1]
            if (nextEl) {
                placeCaretAtStart(nextEl)
                revealCaret(nextEl)
            }
            return
        }

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
    }, [triggerSave, reflowDocument])

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

        // Create token span
        const token = document.createElement('span')
        token.className = 'template-token'
        token.contentEditable = 'false'
        token.dataset.token = JSON.stringify({
            path: variablePath,
            fieldId: fieldMetadata.fieldId || null,
            type: fieldMetadata.type || 'text',
            label: fieldMetadata.label || variablePath
        })
        token.textContent = fieldMetadata.label || `{{${variablePath}}}`

        // Insert token
        range.insertNode(token)

        // Add space after token
        const space = document.createTextNode('\u00A0')
        if (token.nextSibling) {
            token.parentNode.insertBefore(space, token.nextSibling)
        } else {
            token.parentNode.appendChild(space)
        }

        // Move cursor after space
        range.setStartAfter(space)
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
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+A for global selection
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                if (editorMode === 'edition') {
                    e.preventDefault()
                    handleGlobalSelection()
                }
            }

            // Delete/Backspace with global selection
            if (isGlobalSelection && (e.key === 'Delete' || e.key === 'Backspace')) {
                e.preventDefault()
                setDoc(prev => ({
                    ...prev,
                    pages: prev.pages.map(page => ({ ...page, content: '' }))
                }))
                setIsGlobalSelection(false)
                triggerSave()
            }
        }

        const handleCopy = (e) => {
            if (isGlobalSelection) {
                handleGlobalCopy(e)
            }
        }

        const handleClick = () => {
            if (isGlobalSelection) {
                setIsGlobalSelection(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('copy', handleCopy)
        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('copy', handleCopy)
            window.removeEventListener('click', handleClick)
        }
    }, [editorMode, isGlobalSelection, handleGlobalSelection, handleGlobalCopy, triggerSave])

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
        // Sync content before mode change
        const pageRef = pageRefs.current[index]
        if (pageRef) {
            setDoc(prev => {
                const pages = [...prev.pages]
                pages[index] = { ...pages[index], content: pageRef.innerHTML, mode }
                return { ...prev, pages }
            })
        } else {
            setDoc(prev => {
                const pages = [...prev.pages]
                pages[index] = { ...pages[index], mode }
                return { ...prev, pages }
            })
        }
        triggerSave()
    }, [triggerSave])

    // ========== PDF EXPORT ==========
    const handlePdfExport = useCallback(async () => {
        if (!doc._id) {
            console.warn('Document must be saved before PDF export')
            return
        }

        // Get canvas HTML and clean it
        const canvas = canvasRef.current
        if (!canvas) return

        // Clone and clean for print
        const clone = canvas.cloneNode(true)

        // Remove controls
        clone.querySelectorAll('[data-print-hide]').forEach(el => el.remove())
        clone.querySelectorAll('button').forEach(el => el.remove())
        clone.querySelectorAll('.mode-switcher').forEach(el => el.remove())

        const html = clone.innerHTML

        await exportPdf(doc._id, doc.name, html, accountNumber)
    }, [doc._id, doc.name, accountNumber])

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

        // Get selected text if requested
        if (includeSelection) {
            const sel = window.getSelection()
            if (sel && sel.toString().trim()) {
                selection = sel.toString().trim()
            }
        }

        // Build page content with headers
        const pageContents = []
        const totalPages = doc.pages.length

        for (let i = 0; i < totalPages; i++) {
            const pageRef = pageRefs.current[i]
            if (!pageRef) continue

            const isFirstPage = i < includeFirstPages
            const isActivePage = i === selectedPageIndex && includeActivePage

            if (isFirstPage || isActivePage) {
                const text = pageRef.innerText || ''
                if (text.trim()) {
                    pageContents.push(`=== Page ${i + 1}/${totalPages} ===\n${text.trim()}`)
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
            activePageIndex: selectedPageIndex,
            totalPages: doc.pages.length
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
                    const { pageIndex = selectedPageIndex, anchorStart, anchorEnd, matchText } = target
                    const { replacement } = patch

                    if (!matchText || replacement === undefined) {
                        return { success: false, message: 'Texte à remplacer ou remplacement manquant' }
                    }

                    const pageEl = pageRefs.current[pageIndex]
                    if (!pageEl) {
                        return { success: false, message: `Page ${pageIndex + 1} non trouvée` }
                    }

                    // Helper to find and replace in text nodes
                    const findAndReplace = (searchText, caseSensitive = true) => {
                        const walker = document.createTreeWalker(
                            pageEl,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        )

                        while (walker.nextNode()) {
                            const node = walker.currentNode
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
                            range.deleteContents()
                            const textNode = document.createTextNode(content)
                            range.insertNode(textNode)
                            range.setStartAfter(textNode)
                            range.collapse(true)
                            sel.removeAllRanges()
                            sel.addRange(range)

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
            style={{ height: 'calc(100vh - 58px)' }}
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
            ` }} />
            {/* Header with Toolbar */}
            <EditorHeader
                doc={doc}
                setDoc={setDoc}
                lastSaved={lastSaved}
                triggerSave={triggerSave}
                handlePdfExport={handlePdfExport}
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

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <LeftSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    insertVariableToken={insertVariableToken}
                    isSettingsOpen={isSettingsOpen}
                    onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
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
                />

                {/* AI Chat Sidebar */}
                <AIChatSidebar
                    accountNumber={accountNumber}
                    getDocumentSnapshot={getDocumentSnapshot}
                    getSelectionText={getSelectionText}
                    applyPatch={applyPatch}
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
        </div>
    )
}

