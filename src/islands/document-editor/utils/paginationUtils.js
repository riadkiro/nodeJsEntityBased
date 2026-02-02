/**
 * Pagination Utilities
 * EXACT COPY of Alpine.js pagination logic: checkOverflow, extractOverflow, checkUnderflow, tryPullFromNextPage
 * Operates on real DOM measurements after paint
 */

/**
 * Check if page content overflows and move excess to next page
 * Must be called after DOM paint (via requestAnimationFrame)
 * @param {HTMLElement} element - The contenteditable page element
 * @param {number} pageIndex - Current page index
 * @param {Object} doc - Document object with pages array
 * @param {Function} setDoc - State setter for document
 * @param {Object} pageRefs - Refs object for all pages
 */
export function checkOverflow(element, pageIndex, doc, setDoc, pageRefs) {
    if (!element) return

    // Check for overflow
    if (element.scrollHeight > element.clientHeight) {
        var overflowContent = extractOverflow(element)

        if (overflowContent) {
            // Create next page if needed
            setDoc(prevDoc => {
                const newDoc = { ...prevDoc, pages: [...prevDoc.pages] }

                if (pageIndex === newDoc.pages.length - 1) {
                    // Create new page
                    newDoc.pages.push({
                        content: overflowContent,
                        elements: [],
                        rows: [],
                        mode: 'edition',
                        background: '#ffffff',
                        order: newDoc.pages.length
                    })
                } else {
                    // Prepend to next page
                    const nextPage = { ...newDoc.pages[pageIndex + 1] }
                    nextPage.content = overflowContent + (nextPage.content || '')
                    newDoc.pages[pageIndex + 1] = nextPage
                }

                return newDoc
            })

            // Check next page for overflow after DOM updates
            requestAnimationFrame(() => {
                const nextPageRef = pageRefs.current[pageIndex + 1]
                if (nextPageRef) {
                    checkOverflow(nextPageRef, pageIndex + 1, doc, setDoc, pageRefs)
                }
            })
        }
    }
}

/**
 * Extract overflow content from page
 * Removes or splits nodes from end until content fits
 * @param {HTMLElement} element - The contenteditable element
 * @returns {string} - HTML of extracted overflow content
 */
export function extractOverflow(element) {
    var overflowParts = []

    // Work backwards through child nodes
    while (element.scrollHeight > element.clientHeight && element.childNodes.length > 0) {
        var lastNode = element.lastChild

        if (!lastNode) break

        // If text node, try to split it
        if (lastNode.nodeType === 3) { // TEXT_NODE
            var words = lastNode.textContent.split(' ')
            var extractedWords = []

            while (element.scrollHeight > element.clientHeight && words.length > 1) {
                extractedWords.unshift(words.pop())
                lastNode.textContent = words.join(' ')
            }

            if (extractedWords.length > 0) {
                overflowParts.unshift(extractedWords.join(' '))
            }

            if (element.scrollHeight <= element.clientHeight) break
        }

        // If still overflowing, remove the whole node
        if (element.scrollHeight > element.clientHeight) {
            if (lastNode.nodeType === 1) { // ELEMENT_NODE
                overflowParts.unshift(lastNode.outerHTML)
            } else if (lastNode.nodeType === 3) {
                overflowParts.unshift(lastNode.textContent)
            }
            element.removeChild(lastNode)
        }
    }

    return overflowParts.join('')
}

/**
 * Check if page has underflow (can pull content from next page)
 * Must be called after DOM paint
 * @param {HTMLElement} element - The contenteditable page element
 * @param {number} pageIndex - Current page index
 * @param {Object} doc - Document object with pages array
 * @param {Function} setDoc - State setter for document
 * @param {Object} pageRefs - Refs object for all pages
 */
export function checkUnderflow(element, pageIndex, doc, setDoc, pageRefs) {
    if (!element) return

    // Skip if this is the last page
    if (pageIndex >= doc.pages.length - 1) return

    // Skip if next page is in layout/designer mode
    const nextPage = doc.pages[pageIndex + 1]
    if (nextPage && nextPage.mode !== 'edition') return

    // Check if there's room for more content
    var availableSpace = element.clientHeight - element.scrollHeight

    if (availableSpace > 50) { // At least 50px space
        tryPullFromNextPage(element, pageIndex, doc, setDoc, pageRefs)
    }
}

/**
 * Try to pull content from next page into current page
 * @param {HTMLElement} element - The contenteditable page element
 * @param {number} pageIndex - Current page index
 * @param {Object} doc - Document object with pages array
 * @param {Function} setDoc - State setter for document
 * @param {Object} pageRefs - Refs object for all pages
 */
export function tryPullFromNextPage(element, pageIndex, doc, setDoc, pageRefs) {
    const nextPageRef = pageRefs.current[pageIndex + 1]
    if (!nextPageRef) return

    // Get first node from next page
    var firstNode = nextPageRef.firstChild
    if (!firstNode) return

    // Clone and try to add it
    var clone = firstNode.cloneNode(true)
    element.appendChild(clone)

    // Check if it fits
    if (element.scrollHeight <= element.clientHeight) {
        // It fits, remove from next page
        setDoc(prevDoc => {
            const newDoc = { ...prevDoc, pages: [...prevDoc.pages] }
            const nextPage = { ...newDoc.pages[pageIndex + 1] }

            // Update next page content by removing first node
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = nextPage.content
            if (tempDiv.firstChild) {
                tempDiv.removeChild(tempDiv.firstChild)
            }
            nextPage.content = tempDiv.innerHTML

            // If next page is now empty, remove it
            if (!nextPage.content.trim() && nextPage.elements.length === 0) {
                newDoc.pages.splice(pageIndex + 1, 1)
            } else {
                newDoc.pages[pageIndex + 1] = nextPage
            }

            return newDoc
        })

        // Continue checking
        requestAnimationFrame(() => {
            checkUnderflow(element, pageIndex, doc, setDoc, pageRefs)
        })
    } else {
        // Doesn't fit, remove the clone
        element.removeChild(clone)
    }
}
