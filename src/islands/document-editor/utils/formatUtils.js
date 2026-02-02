/**
 * Format Utilities
 * EXACT COPY of Alpine.js formatting logic
 * Handles font detection, execCommand formatting, and style updates
 */

/**
 * Format document using execCommand
 * @param {string} command - execCommand name (bold, italic, underline, etc)
 * @param {string|null} value - Optional value for the command
 */
export function formatDoc(command, value = null) {
    document.execCommand(command, false, value)
}

/**
 * Detect current formatting at cursor position
 * @returns {Object} - Current formatting state
 */
export function detectCurrentStyles() {
    const styles = {
        fontFamily: 'Arial',
        fontSize: 16,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrikethrough: false,
        alignment: 'left',
        lineHeight: 1.5,
        letterSpacing: 0
    }

    try {
        styles.isBold = document.queryCommandState('bold')
        styles.isItalic = document.queryCommandState('italic')
        styles.isUnderline = document.queryCommandState('underline')
        styles.isStrikethrough = document.queryCommandState('strikeThrough')

        const fontName = document.queryCommandValue('fontName')
        if (fontName) {
            styles.fontFamily = fontName.replace(/['"]/g, '')
        }

        const fontSize = document.queryCommandValue('fontSize')
        if (fontSize) {
            // Map browser fontSize (1-7) to px
            const sizeMap = { '1': 10, '2': 13, '3': 16, '4': 18, '5': 24, '6': 32, '7': 48 }
            styles.fontSize = sizeMap[fontSize] || 16
        }

        // Detect alignment
        if (document.queryCommandState('justifyLeft')) styles.alignment = 'left'
        else if (document.queryCommandState('justifyCenter')) styles.alignment = 'center'
        else if (document.queryCommandState('justifyRight')) styles.alignment = 'right'
        else if (document.queryCommandState('justifyFull')) styles.alignment = 'justify'

        // Get line-height and letter-spacing from selection
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0)
            let node = range.commonAncestorContainer
            if (node.nodeType === 3) node = node.parentElement

            if (node && node.nodeType === 1) {
                const computed = window.getComputedStyle(node)

                const lh = parseFloat(computed.lineHeight)
                const fs = parseFloat(computed.fontSize)
                if (!isNaN(lh) && !isNaN(fs) && fs > 0) {
                    styles.lineHeight = Math.round((lh / fs) * 10) / 10
                }

                const ls = parseFloat(computed.letterSpacing)
                if (!isNaN(ls)) {
                    styles.letterSpacing = Math.round(ls * 10) / 10
                }
            }
        }
    } catch (e) {
        console.warn('Error detecting styles:', e)
    }

    return styles
}

/**
 * Apply font size to selection
 * Uses span wrapping for pixel-perfect control
 * @param {number} size - Font size in pixels
 */
export function applyFontSize(size) {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)

    if (range.collapsed) {
        // No selection - create a span for future typing
        const span = document.createElement('span')
        span.style.fontSize = size + 'px'
        span.innerHTML = '\u200B' // Zero-width space
        range.insertNode(span)
        range.setStartAfter(span)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
    } else {
        // Wrap selection in span
        const span = document.createElement('span')
        span.style.fontSize = size + 'px'
        span.appendChild(range.extractContents())
        range.insertNode(span)
    }
}

/**
 * Apply line spacing to selection or block
 * @param {number} value - Line height value
 */
export function applyLineSpacing(value) {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    let container = range.commonAncestorContainer
    if (container.nodeType === 3) container = container.parentElement

    // Find block-level parent
    while (container && !['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(container.tagName)) {
        container = container.parentElement
    }

    if (container) {
        container.style.lineHeight = value
    }
}

/**
 * Apply letter spacing to selection
 * @param {number} value - Letter spacing in pixels
 */
export function applyLetterSpacing(value) {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)

    if (range.collapsed) {
        let container = range.commonAncestorContainer
        if (container.nodeType === 3) container = container.parentElement
        if (container) {
            container.style.letterSpacing = value + 'px'
        }
    } else {
        const span = document.createElement('span')
        span.style.letterSpacing = value + 'px'
        span.appendChild(range.extractContents())
        range.insertNode(span)
    }
}

/**
 * Available font families
 */
export const FONT_FAMILIES = [
    'Arial',
    'Georgia',
    'Times New Roman',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Courier New',
    'Lucida Console'
]

/**
 * Font size presets
 */
export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]
