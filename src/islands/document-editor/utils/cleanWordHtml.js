/**
 * Word HTML Cleaner Utility
 * Supports 3 paste modes: keep, match, plain
 * 
 * - keep: Original cleaning with beautification (preserves structure)
 * - match: Smart cleaning — preserves formatting, fixes structure
 * - plain: Strip all HTML, return text only
 */

/**
 * Main entry point - Clean HTML based on mode
 * @param {string} html - Raw HTML from clipboard
 * @param {string} mode - 'keep' | 'match' | 'plain'
 * @returns {string} - Cleaned HTML
 */
export function cleanWordHtml(html, mode = 'match') {
    if (mode === 'plain') {
        return stripToPlainText(html)
    }
    // Both 'keep' and 'match' use the cleaning function
    return cleanWordHtmlFull(html)
}

/**
 * Plain Text Mode - Strip all HTML, keep only text
 */
function stripToPlainText(html) {
    const temp = document.createElement('div')
    temp.innerHTML = html

    // Get text content, preserve some structure
    let text = temp.textContent || ''

    // Clean up whitespace
    text = text.replace(/[\r\n]+/g, '\n')
    text = text.replace(/\n{3,}/g, '\n\n')
    text = text.trim()

    // Wrap lines in paragraphs for proper editing behavior
    const lines = text.split(/\n\n/)
    return lines
        .map(line => {
            const trimmed = line.trim()
            if (!trimmed) return ''
            return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
        })
        .filter(Boolean)
        .join('')
}

/**
 * Full HTML cleaning - preserves formatting, removes Word/Office cruft
 * Robust against heavy HTML with images, nested tables, complex structures
 */
function cleanWordHtmlFull(html) {
    // Guard: if html is empty or too short, return as-is
    if (!html || html.trim().length < 5) return html || ''

    // ===== PRE-CLEAN: Remove VML, conditional comments, Office XML =====
    html = html.replace(/<!--\[if\s+!vml\]-->([\s\S]*?)<!--\[endif\]-->/gi, '$1')
    html = html.replace(/<!\[if\s+!vml\]>([\s\S]*?)<!\[endif\]>/gi, '$1')
    html = html.replace(/<!--\[if\s+vml\]>([\s\S]*?)<!--\[endif\]-->/gi, '')
    html = html.replace(/<!\[if\s+vml\]>([\s\S]*?)<!\[endif\]>/gi, '')
    html = html.replace(/<!--\[if\s+gte\s+vml\s+1\]>([\s\S]*?)<!--\[endif\]-->/gi, '')
    html = html.replace(/<o:p>\s*<\/o:p>/g, '')
    html = html.replace(/<o:p>.*?<\/o:p>/g, function (match) {
        return match.replace(/<o:p>|<\/o:p>/g, '')
    })
    // Remove Office-specific XML namespaced tags
    html = html.replace(/<v:[^>]*>[\s\S]*?<\/v:[^>]*>/gi, '')
    html = html.replace(/<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '')
    html = html.replace(/<m:[^>]*>[\s\S]*?<\/m:[^>]*>/gi, '')

    // Parse into DOM
    const temp = document.createElement('div')
    temp.innerHTML = html

    // ===== PHASE 1: Unwrap useless wrapper elements =====
    // Remove empty <span> wrappers, <font> tags, etc.
    // NOTE: 'O:P' is a Microsoft Office namespaced tag — cannot use querySelectorAll
    // because ':' is interpreted as a CSS pseudo-class selector
    temp.querySelectorAll('FONT').forEach(el => {
        unwrap(el)
    })
    // Handle O:P (and other namespaced Office tags) by checking nodeName
    Array.from(temp.querySelectorAll('*')).forEach(el => {
        if (el.nodeName === 'O:P' || el.nodeName === 'o:p') {
            unwrap(el)
        }
    })

    // ===== PHASE 2: Clean all elements =====
    const elementsToClean = temp.querySelectorAll('*')
    elementsToClean.forEach(function (el) {
        el.removeAttribute('class')
        el.removeAttribute('lang')
        el.removeAttribute('data-ccp-props')
        el.removeAttribute('data-ccp-parastyle')

        const tagName = el.tagName

        // Skip tables/lists — handled separately below
        if (['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'UL', 'OL', 'LI'].includes(tagName)) return

        // Clean style attribute
        const style = el.getAttribute('style')
        if (style) {
            let cleaned = style
                .replace(/mso-[^;]+;?/gi, '')
                .replace(/position:\s*[^;]+;?/gi, '')
                .replace(/margin[^:]*:\s*[^;]+;?/gi, '')
                .replace(/padding[^:]*:\s*[^;]+;?/gi, '')
                .replace(/line-height:\s*normal;?/gi, '')
                .replace(/text-indent:\s*[^;]+;?/gi, '')
                .replace(/tab-stops:\s*[^;]+;?/gi, '')
                .replace(/text-autospace:\s*[^;]+;?/gi, '')

            // Keep only useful properties
            const resultParts = []
            cleaned.split(';').forEach(prop => {
                const [key, value] = prop.split(':').map(s => s?.trim())
                if (key && value) {
                    const keyLower = key.toLowerCase()
                    const usefulProps = [
                        'font-family', 'font-size', 'font-weight', 'font-style',
                        'color', 'background-color', 'background',
                        'text-align', 'text-decoration',
                        'border', 'width', 'height', 'max-width'
                    ]
                    if (usefulProps.some(p => keyLower.startsWith(p))) {
                        resultParts.push(`${key}: ${value}`)
                    }
                }
            })

            if (resultParts.length > 0) {
                el.setAttribute('style', resultParts.join('; '))
            } else {
                el.removeAttribute('style')
            }
        }

        // Handle images
        if (tagName === 'IMG') {
            el.style.maxWidth = '100%'
            el.style.height = 'auto'
            el.removeAttribute('width')
            el.removeAttribute('height')
            el.removeAttribute('v:shapes')
        }
    })

    // ===== PHASE 3: Beautify Tables =====
    const tables = temp.querySelectorAll('table')
    tables.forEach(function (table) {
        table.removeAttribute('style')
        table.removeAttribute('border')
        table.removeAttribute('cellspacing')
        table.removeAttribute('cellpadding')
        table.removeAttribute('width')

        const descendants = table.querySelectorAll('*')
        descendants.forEach(function (d) {
            d.removeAttribute('style')
            d.removeAttribute('class')
            d.removeAttribute('width')
            d.removeAttribute('height')
            d.removeAttribute('bgcolor')
            d.removeAttribute('align')
            d.removeAttribute('valign')
        })

        table.style.width = '100%'
        table.style.borderCollapse = 'collapse'
        table.style.marginBottom = '1em'
        table.style.marginTop = '0.5em'
        table.style.fontFamily = 'inherit'
        table.style.fontSize = '0.9em'
        table.style.border = '1px solid #e5e7eb'

        const ths = table.querySelectorAll('th')
        ths.forEach(function (th) {
            th.style.backgroundColor = '#f9fafb'
            th.style.color = '#111827'
            th.style.fontWeight = '600'
            th.style.textAlign = 'left'
            th.style.padding = '8px 12px'
            th.style.borderBottom = '1px solid #d1d5db'
        })

        const tds = table.querySelectorAll('td')
        tds.forEach(function (td) {
            td.style.padding = '6px 12px'
            td.style.borderBottom = '1px solid #e5e7eb'
            td.style.color = '#374151'
            td.style.verticalAlign = 'top'

            const paragraphs = td.querySelectorAll('p')
            paragraphs.forEach(function (p) {
                p.style.margin = '0'
                p.style.lineHeight = '1.4'
            })
        })
    })

    // ===== PHASE 4: Beautify Lists =====
    const lists = temp.querySelectorAll('ul, ol')
    lists.forEach(function (list) {
        list.removeAttribute('style')

        const descendants = list.querySelectorAll('*')
        descendants.forEach(function (d) {
            d.removeAttribute('style')
            d.removeAttribute('class')
        })

        list.style.paddingLeft = '1.5em'
        list.style.marginBottom = '1em'
        list.style.color = '#374151'

        if (list.tagName === 'UL') list.style.listStyleType = 'disc'
        if (list.tagName === 'OL') list.style.listStyleType = 'decimal'

        const lis = list.querySelectorAll('li')
        lis.forEach(function (li) {
            li.style.marginBottom = '0.25em'
            li.style.lineHeight = '1.5'
        })
    })

    // ===== PHASE 5: Remove empty inline elements =====
    temp.querySelectorAll('span').forEach(span => {
        if (!span.textContent.trim() && !span.querySelector('img')) {
            // Check if it has meaningful content like zero-width spaces for formatting
            if (!span.innerHTML.trim()) {
                span.remove()
            }
        }
    })

    // ===== PHASE 6: Final string cleanup =====
    let result = temp.innerHTML

    // Clean up Office remnants
    result = result.replace(/<o:p><\/o:p>/gi, '')
    result = result.replace(/<!--[\s\S]*?-->/gi, '')

    // Remove completely empty spans (but NOT spans with children or content)
    result = result.replace(/<span[^>]*>\s*<\/span>/gi, '')

    // Normalize whitespace - but do NOT strip <br> tags!
    // CRITICAL FIX: Previous version was stripping <br> which broke line breaks in pasted content
    result = result.replace(/[\r\n]+/g, ' ')
    result = result.replace(/\s{2,}/g, ' ')

    return result.trim()
}

/**
 * Helper: unwrap an element (replace with its children)
 */
function unwrap(el) {
    const parent = el.parentNode
    if (!parent) return
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
}
