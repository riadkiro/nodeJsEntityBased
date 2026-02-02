/**
 * Keyboard Utilities for Document Editor
 * 
 * Cross-platform keyboard shortcuts (Ctrl/Cmd)
 * Word-like behavior for selection and formatting
 */
import isHotkey from 'is-hotkey'

// ========== HOTKEY DEFINITIONS ==========
// Using mod+ prefix for cross-platform (Ctrl on Windows, Cmd on Mac)

export const HOTKEYS = {
    // Formatting
    BOLD: 'mod+b',
    ITALIC: 'mod+i',
    UNDERLINE: 'mod+u',
    STRIKETHROUGH: 'mod+shift+s',

    // Edit operations
    UNDO: 'mod+z',
    REDO: ['mod+y', 'mod+shift+z'],
    CUT: 'mod+x',
    COPY: 'mod+c',
    PASTE: 'mod+v',

    // Selection
    SELECT_ALL: 'mod+a',

    // Navigation
    HOME: 'home',
    END: 'end',
    CTRL_HOME: 'mod+home',
    CTRL_END: 'mod+end',

    // Lists
    INDENT: 'tab',
    OUTDENT: 'shift+tab',

    // Save
    SAVE: 'mod+s',

    // Print/Export
    PRINT: 'mod+p'
}

// ========== HOTKEY MATCHERS ==========
// Create matcher functions for each hotkey
// Wrapped with safe handler to prevent crashes on unexpected events

function safeHotkey(hotkeyDef) {
    const matcher = isHotkey(hotkeyDef)
    return (e) => {
        try {
            return matcher(e)
        } catch {
            return false
        }
    }
}

export const isUndo = safeHotkey(HOTKEYS.UNDO)
export const isRedo = (e) => {
    try {
        return isHotkey('mod+y')(e) || isHotkey('mod+shift+z')(e)
    } catch {
        return false
    }
}
export const isBold = safeHotkey(HOTKEYS.BOLD)
export const isItalic = safeHotkey(HOTKEYS.ITALIC)
export const isUnderline = safeHotkey(HOTKEYS.UNDERLINE)
export const isStrikethrough = safeHotkey(HOTKEYS.STRIKETHROUGH)
export const isSelectAll = safeHotkey(HOTKEYS.SELECT_ALL)
export const isSave = safeHotkey(HOTKEYS.SAVE)
export const isPrint = safeHotkey(HOTKEYS.PRINT)
export const isHome = safeHotkey(HOTKEYS.HOME)
export const isEnd = safeHotkey(HOTKEYS.END)
export const isCtrlHome = safeHotkey(HOTKEYS.CTRL_HOME)
export const isCtrlEnd = safeHotkey(HOTKEYS.CTRL_END)
export const isIndent = safeHotkey(HOTKEYS.INDENT)
export const isOutdent = safeHotkey(HOTKEYS.OUTDENT)

// ========== SELECTION UTILS ==========

/**
 * Check if selection is inside a table
 */
export function isSelectionInTable() {
    const selection = window.getSelection()
    if (!selection || !selection.anchorNode) return false

    let node = selection.anchorNode
    while (node && node !== document.body) {
        if (node.nodeName === 'TABLE' || node.nodeName === 'TD' || node.nodeName === 'TH') {
            return true
        }
        node = node.parentNode
    }
    return false
}

/**
 * Get the closest table element from selection
 */
export function getSelectedTable() {
    const selection = window.getSelection()
    if (!selection || !selection.anchorNode) return null

    let node = selection.anchorNode
    while (node && node !== document.body) {
        if (node.nodeName === 'TABLE') {
            return node
        }
        node = node.parentNode
    }
    return null
}

/**
 * Select all content within table if cursor is in table,
 * otherwise select all in contenteditable
 */
export function handleSelectAll(e, contentEditableRef) {
    const inTable = isSelectionInTable()

    if (inTable) {
        // First Ctrl+A in table: select table content
        // Check if we already have table selected
        const table = getSelectedTable()
        if (table) {
            const selection = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(table)
            selection.removeAllRanges()
            selection.addRange(range)
            e.preventDefault()
            return true
        }
    }

    // Select all in contenteditable
    if (contentEditableRef && contentEditableRef.current) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(contentEditableRef.current)
        selection.removeAllRanges()
        selection.addRange(range)
        e.preventDefault()
        return true
    }

    return false
}

/**
 * Handle Home key - move to start of line or block
 */
export function handleHome(e, contentEditableRef) {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return false

    const range = selection.getRangeAt(0)
    const container = range.startContainer

    // Find the closest block element
    let blockElement = container
    while (blockElement && blockElement.nodeType !== 1) {
        blockElement = blockElement.parentNode
    }
    while (blockElement && !isBlockElement(blockElement) && blockElement !== contentEditableRef?.current) {
        blockElement = blockElement.parentNode
    }

    if (blockElement && blockElement !== document.body) {
        const newRange = document.createRange()
        newRange.setStart(blockElement, 0)
        newRange.collapse(true)

        if (e.shiftKey) {
            // Extend selection
            range.setStart(blockElement, 0)
        } else {
            selection.removeAllRanges()
            selection.addRange(newRange)
        }
        e.preventDefault()
        return true
    }

    return false
}

/**
 * Handle End key - move to end of line or block
 */
export function handleEnd(e, contentEditableRef) {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return false

    const range = selection.getRangeAt(0)
    const container = range.endContainer

    // Find the closest block element
    let blockElement = container
    while (blockElement && blockElement.nodeType !== 1) {
        blockElement = blockElement.parentNode
    }
    while (blockElement && !isBlockElement(blockElement) && blockElement !== contentEditableRef?.current) {
        blockElement = blockElement.parentNode
    }

    if (blockElement && blockElement !== document.body) {
        const newRange = document.createRange()
        newRange.selectNodeContents(blockElement)
        newRange.collapse(false) // Collapse to end

        if (e.shiftKey) {
            // Extend selection
            range.setEnd(newRange.endContainer, newRange.endOffset)
        } else {
            selection.removeAllRanges()
            selection.addRange(newRange)
        }
        e.preventDefault()
        return true
    }

    return false
}

/**
 * Handle Ctrl+Home - move to start of document
 */
export function handleCtrlHome(e, contentEditableRef) {
    if (!contentEditableRef?.current) return false

    const selection = window.getSelection()
    const range = document.createRange()
    range.setStart(contentEditableRef.current, 0)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    e.preventDefault()
    return true
}

/**
 * Handle Ctrl+End - move to end of document
 */
export function handleCtrlEnd(e, contentEditableRef) {
    if (!contentEditableRef?.current) return false

    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(contentEditableRef.current)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
    e.preventDefault()
    return true
}

/**
 * Check if element is a block element
 */
function isBlockElement(element) {
    if (!element || element.nodeType !== 1) return false
    const blockElements = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'TR', 'BLOCKQUOTE', 'PRE']
    return blockElements.includes(element.nodeName)
}

// ========== KEYBOARD HANDLER CREATOR ==========

/**
 * Create a keyboard event handler with all shortcuts
 * @param {Object} handlers - Object with handler functions
 * @returns {Function} - Event handler
 */
export function createKeyboardHandler({
    onBold,
    onItalic,
    onUnderline,
    onStrikethrough,
    onUndo,
    onRedo,
    onSelectAll,
    onSave,
    onPrint,
    onHome,
    onEnd,
    onCtrlHome,
    onCtrlEnd,
    contentEditableRef
}) {
    return function handleKeyDown(e) {
        // Save
        if (isSave(e)) {
            e.preventDefault()
            onSave?.()
            return
        }

        // Print
        if (isPrint(e)) {
            e.preventDefault()
            onPrint?.()
            return
        }

        // Formatting
        if (isBold(e)) {
            e.preventDefault()
            onBold?.()
            return
        }

        if (isItalic(e)) {
            e.preventDefault()
            onItalic?.()
            return
        }

        if (isUnderline(e)) {
            e.preventDefault()
            onUnderline?.()
            return
        }

        if (isStrikethrough(e)) {
            e.preventDefault()
            onStrikethrough?.()
            return
        }

        // Undo/Redo (let browser handle, but can intercept)
        if (isUndo(e)) {
            // Let browser handle by default, intercept if custom
            if (onUndo) {
                e.preventDefault()
                onUndo()
            }
            return
        }

        if (isRedo(e)) {
            if (onRedo) {
                e.preventDefault()
                onRedo()
            }
            return
        }

        // Select All - custom handling for tables
        if (isSelectAll(e)) {
            if (handleSelectAll(e, contentEditableRef)) {
                onSelectAll?.()
            }
            return
        }

        // Navigation
        if (isCtrlHome(e)) {
            handleCtrlHome(e, contentEditableRef)
            onCtrlHome?.()
            return
        }

        if (isCtrlEnd(e)) {
            handleCtrlEnd(e, contentEditableRef)
            onCtrlEnd?.()
            return
        }

        if (isHome(e)) {
            handleHome(e, contentEditableRef)
            onHome?.()
            return
        }

        if (isEnd(e)) {
            handleEnd(e, contentEditableRef)
            onEnd?.()
            return
        }
    }
}
