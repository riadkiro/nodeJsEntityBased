/**
 * Word HTML Parser Utility
 * 
 * Parses Word/Office HTML into canonical HTML:
 * - Preserves colspan/rowspan, widths, useful inline styles
 * - Detects and uploads base64 images
 * - Returns clean HTML ready to insert
 */

/**
 * Parse Word HTML with image upload support
 * @param {string} html - Raw HTML from clipboard
 * @param {Function} uploadFn - async function(base64Data) => url
 * @returns {Promise<string>} - Clean HTML with uploaded image URLs
 */
export async function parseWordHtml(html, uploadFn) {
    // Pre-clean VML and conditional comments
    html = removeVmlAndConditionals(html)

    const temp = document.createElement('div')
    temp.innerHTML = html

    // Process all elements
    await processElements(temp, uploadFn)

    // Clean tables while preserving structure
    processTables(temp)

    // Clean lists
    processLists(temp)

    // Final cleanup
    return finalCleanup(temp.innerHTML)
}

/**
 * Remove VML and conditional comments
 */
function removeVmlAndConditionals(html) {
    html = html.replace(/<!--\[if\s+!vml\]-->([\s\S]*?)<!--\[endif\]-->/gi, '$1')
    html = html.replace(/<!\[if\s+!vml\]>([\s\S]*?)<!\[endif\]>/gi, '$1')
    html = html.replace(/<!--\[if\s+vml\]>([\s\S]*?)<!--\[endif\]-->/gi, '')
    html = html.replace(/<!\[if\s+vml\]>([\s\S]*?)<!\[endif\]>/gi, '')
    html = html.replace(/<!--\[if\s+gte\s+vml\s+1\]>([\s\S]*?)<!--\[endif\]-->/gi, '')
    html = html.replace(/<o:p>\s*<\/o:p>/g, '')
    html = html.replace(/<o:p>.*?<\/o:p>/g, match => match.replace(/<o:p>|<\/o:p>/g, ''))
    // Remove Word-specific XML tags
    html = html.replace(/<v:[^>]*>[\s\S]*?<\/v:[^>]*>/gi, '')
    html = html.replace(/<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '')
    return html
}

/**
 * Process all elements - clean attributes and handle images
 */
async function processElements(container, uploadFn) {
    const elements = container.querySelectorAll('*')

    for (const el of elements) {
        // Remove MS-specific attributes
        el.removeAttribute('class')
        el.removeAttribute('lang')

        const tagName = el.tagName

        // Skip tables/lists - handled separately
        if (['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'UL', 'OL', 'LI'].includes(tagName)) {
            continue
        }

        // Clean style attribute - keep useful styles, remove MSO
        const style = el.getAttribute('style')
        if (style) {
            const cleanedStyle = cleanStyleAttribute(style)
            if (cleanedStyle) {
                el.setAttribute('style', cleanedStyle)
            } else {
                el.removeAttribute('style')
            }
        }

        // Handle images - upload base64 if needed
        if (tagName === 'IMG') {
            await processImage(el, uploadFn)
        }
    }

    // Remove empty spans
    container.querySelectorAll('span').forEach(span => {
        if (!span.textContent.trim() && !span.querySelector('img')) {
            span.remove()
        }
    })
}

/**
 * Clean style attribute - preserve useful styles, remove MSO cruft
 */
function cleanStyleAttribute(style) {
    // Remove MSO-specific styles
    let cleaned = style
        .replace(/mso-[^;]+;?/gi, '')
        .replace(/position:[^;]+;?/gi, '')
        .replace(/margin[^:]*:[^;]+;?/gi, '')
        .replace(/padding[^:]*:[^;]+;?/gi, '')
        .replace(/line-height:\s*normal;?/gi, '')
        .replace(/text-indent:[^;]+;?/gi, '')

    // Keep only useful properties
    const usefulProps = [
        'font-family', 'font-size', 'font-weight', 'font-style',
        'color', 'background-color', 'background',
        'text-align', 'text-decoration',
        'border', 'border-color', 'border-width', 'border-style',
        'width', 'height', 'max-width'
    ]

    // Parse remaining styles
    const styleObj = {}
    cleaned.split(';').forEach(prop => {
        const [key, value] = prop.split(':').map(s => s?.trim())
        if (key && value) {
            const keyLower = key.toLowerCase()
            if (usefulProps.some(p => keyLower.startsWith(p))) {
                styleObj[key] = value
            }
        }
    })

    // Rebuild style string
    return Object.entries(styleObj)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')
}

/**
 * Process image - upload base64 if present
 */
async function processImage(img, uploadFn) {
    const src = img.getAttribute('src') || ''

    // Check if base64 image
    if (src.startsWith('data:image')) {
        if (uploadFn) {
            try {
                // Upload and get URL
                const url = await uploadFn(src)
                if (url) {
                    img.setAttribute('src', url)
                }
            } catch (err) {
                console.error('[parseWordHtml] Image upload failed:', err)
            }
        }
    }

    // Clean image attributes
    img.removeAttribute('v:shapes')
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.removeAttribute('width')
    img.removeAttribute('height')
}

/**
 * Process tables - preserve structure, apply clean styles
 */
function processTables(container) {
    container.querySelectorAll('table').forEach(table => {
        // Remove Word attributes but keep structure
        table.removeAttribute('border')
        table.removeAttribute('cellspacing')
        table.removeAttribute('cellpadding')

        // Apply basic table styles
        table.style.width = '100%'
        table.style.borderCollapse = 'collapse'
        table.style.marginBottom = '1em'
        table.style.marginTop = '0.5em'
        table.style.fontFamily = 'inherit'
        table.style.fontSize = '0.9em'
        table.style.border = '1px solid #e5e7eb'

        // Process cells - preserve colspan/rowspan
        table.querySelectorAll('td, th').forEach(cell => {
            // Keep colspan and rowspan!
            const colspan = cell.getAttribute('colspan')
            const rowspan = cell.getAttribute('rowspan')

            // Clean other attributes
            const style = cell.getAttribute('style')
            let width = null
            if (style) {
                // Extract width if present
                const widthMatch = style.match(/width:\s*([^;]+)/i)
                if (widthMatch) {
                    width = widthMatch[1].trim()
                }
            }

            // Remove all attributes except structure
            const attrs = [...cell.attributes]
            attrs.forEach(attr => {
                if (!['colspan', 'rowspan'].includes(attr.name)) {
                    cell.removeAttribute(attr.name)
                }
            })

            // Apply clean cell styles
            cell.style.padding = '6px 12px'
            cell.style.borderBottom = '1px solid #e5e7eb'
            cell.style.verticalAlign = 'top'

            // Restore width if it was set
            if (width) {
                cell.style.width = width
            }

            // Clean paragraphs inside cells
            cell.querySelectorAll('p').forEach(p => {
                p.style.margin = '0'
                p.style.lineHeight = '1.4'
            })
        })

        // Style headers
        table.querySelectorAll('th').forEach(th => {
            th.style.backgroundColor = '#f9fafb'
            th.style.color = '#111827'
            th.style.fontWeight = '600'
            th.style.textAlign = 'left'
            th.style.padding = '8px 12px'
            th.style.borderBottom = '1px solid #d1d5db'
        })
    })
}

/**
 * Process lists - apply clean styles
 */
function processLists(container) {
    container.querySelectorAll('ul, ol').forEach(list => {
        // Clean all attributes
        const attrs = [...list.attributes]
        attrs.forEach(attr => list.removeAttribute(attr.name))

        // Apply clean list styles
        list.style.paddingLeft = '1.5em'
        list.style.marginBottom = '1em'
        list.style.color = '#374151'

        if (list.tagName === 'UL') list.style.listStyleType = 'disc'
        if (list.tagName === 'OL') list.style.listStyleType = 'decimal'

        // Clean descendants
        list.querySelectorAll('*').forEach(d => {
            d.removeAttribute('class')
        })

        // Style list items
        list.querySelectorAll('li').forEach(li => {
            li.style.marginBottom = '0.25em'
            li.style.lineHeight = '1.5'
        })
    })
}

/**
 * Final string cleanup
 */
function finalCleanup(html) {
    return html
        .replace(/[\r\n]+/g, ' ')
        .replace(/<o:p><\/o:p>/gi, '')
        .replace(/<!--[\s\S]*?-->/gi, '')
        .replace(/<span[^>]*>\s*<\/span>/gi, '')
        .replace(/<br\s*\/?>\s*(?!<br)/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
}

/**
 * Extract base64 images from HTML without uploading
 * Useful for detecting if upload is needed
 */
export function extractBase64Images(html) {
    const regex = /data:image\/[^;]+;base64,[^"']+/g
    return html.match(regex) || []
}

/**
 * Check if HTML contains base64 images
 */
export function hasBase64Images(html) {
    return /data:image\/[^;]+;base64,/i.test(html)
}
