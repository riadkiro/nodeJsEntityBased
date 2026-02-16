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

    // Apply text-align to separator containers when alignment commands are used
    const alignmentCommands = {
        'justifyLeft': 'left',
        'justifyCenter': 'center',
        'justifyRight': 'right',
        'justifyFull': 'justify'
    }

    if (alignmentCommands[command]) {
        const alignment = alignmentCommands[command]
        const sel = window.getSelection()

        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0)
            let node = range.commonAncestorContainer

            // Find closest separator container
            while (node && node !== document.body) {
                if (node.nodeType === Node.ELEMENT_NODE && node.classList && node.classList.contains('doc-separator-container')) {
                    node.style.textAlign = alignment
                    break
                }
                node = node.parentNode
            }
        }
    }
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

        // Detect alignment
        if (document.queryCommandState('justifyLeft')) styles.alignment = 'left'
        else if (document.queryCommandState('justifyCenter')) styles.alignment = 'center'
        else if (document.queryCommandState('justifyRight')) styles.alignment = 'right'
        else if (document.queryCommandState('justifyFull')) styles.alignment = 'justify'

        // Get font-size, line-height, letter-spacing from computed styles at cursor
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0)
            let node = range.startContainer
            if (node.nodeType === 3) node = node.parentElement

            if (node && node.nodeType === 1) {
                const computed = window.getComputedStyle(node)

                // Read actual computed fontSize in px (much more reliable than queryCommandValue)
                const fs = parseFloat(computed.fontSize)
                if (!isNaN(fs) && fs > 0) {
                    styles.fontSize = Math.round(fs)
                }

                const lh = parseFloat(computed.lineHeight)
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
        // No selection — find the nearest parent element and set its font-size
        // If we're inside an inline span, just update it
        let node = range.startContainer
        if (node.nodeType === 3) node = node.parentElement

        // If the current node is an inline <span> or <font>, update it directly
        if (node && node !== node.closest('[contenteditable="true"]') &&
            ['SPAN', 'FONT'].includes(node.tagName)) {
            node.style.fontSize = size + 'px'
            node.removeAttribute('size') // clean up <font size> attr
        } else {
            // Create a new span for future typing
            const span = document.createElement('span')
            span.style.fontSize = size + 'px'
            span.innerHTML = '\u200B' // Zero-width space
            range.insertNode(span)
            // Place cursor inside the span
            const newRange = document.createRange()
            newRange.setStart(span.firstChild, 1)
            newRange.collapse(true)
            sel.removeAllRanges()
            sel.addRange(newRange)
        }
    } else {
        // Has selection — use execCommand fontSize trick then fix up
        // Step 1: Use execCommand to wrap selection (reliable cross-browser)
        document.execCommand('fontSize', false, '7')

        // Step 2: Find all <font size="7"> created by execCommand and replace with proper style
        const container = range.commonAncestorContainer
        const root = container.nodeType === 3 ? container.parentElement : container
        const editableRoot = root.closest('[contenteditable="true"]') || root

        const fontTags = editableRoot.querySelectorAll('font[size="7"]')
        fontTags.forEach(font => {
            font.removeAttribute('size')
            font.style.fontSize = size + 'px'
        })

        // Also handle <span style="font-size: xxx-large"> that some browsers create
        const spans = editableRoot.querySelectorAll('span')
        spans.forEach(span => {
            const fs = span.style.fontSize
            if (fs === '-webkit-xxx-large' || fs === 'xxx-large' || fs === '48px') {
                span.style.fontSize = size + 'px'
            }
        })
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
