/**
 * Pagination Utilities
 * DOM-first approach: manipulate DOM, then sync state
 * Operates on real DOM measurements after paint
 */

const UNDERFLOW_THRESHOLD_PX = 5
const MAX_PULL_ITERATIONS = 50

/**
 * Check if HTML content is effectively empty
 */
function isEffectivelyEmpty(html) {
    const cleaned = (html || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<\/?p[^>]*>/gi, '')
        .replace(/<\/?div[^>]*>/gi, '')
        .replace(/<span[^>]*>|<\/span>/gi, '')
        .replace(/\s+/g, '')
        .trim()
    return cleaned.length === 0
}

/**
 * Get vertical paddings from computed style
 */
function getVerticalPaddings(el) {
    const cs = window.getComputedStyle(el)
    const pt = parseFloat(cs.paddingTop) || 0
    const pb = parseFloat(cs.paddingBottom) || 0
    return { pt, pb }
}

/**
 * Returns available vertical space (px) between the bottom of rendered content
 * and the bottom of the page box.
 * Works even when scrollHeight == clientHeight (Word-like measurement).
 */
function getAvailableSpacePx(pageEl) {
    const pageRect = pageEl.getBoundingClientRect()
    const { pb } = getVerticalPaddings(pageEl)

    // If empty, available = full height minus padding
    if (!pageEl.firstChild) {
        return Math.max(0, pageRect.height - pb)
    }

    const range = document.createRange()
    range.selectNodeContents(pageEl)

    const rects = range.getClientRects()
    if (!rects || rects.length === 0) {
        // no visible rects -> treat as empty
        return Math.max(0, pageRect.height - pb)
    }

    // Find the lowest rect (last render position)
    let maxBottom = 0
    for (let i = 0; i < rects.length; i++) {
        if (rects[i].bottom > maxBottom) {
            maxBottom = rects[i].bottom
        }
    }

    const available = (pageRect.bottom - pb) - maxBottom
    return Math.max(0, available)
}

/**
 * Check if page content overflows and move excess to next page
 * Must be called after DOM paint (via requestAnimationFrame)
 */
export function checkOverflow(element, pageIndex, doc, setDoc, pageRefs) {
    if (!element) return

    // Check for overflow
    if (element.scrollHeight > element.clientHeight) {
        var overflowContent = extractOverflow(element)

        if (overflowContent) {
            // Sync current page first
            setDoc(prevDoc => {
                const newDoc = { ...prevDoc, pages: [...prevDoc.pages] }

                // Sync current page from DOM
                const current = { ...newDoc.pages[pageIndex] }
                current.content = element.innerHTML
                newDoc.pages[pageIndex] = current

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
 * Find first text node in element tree
 */
function findFirstTextNode(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
    return walker.nextNode()
}

/**
 * Pull partial text chunk from next page (Word-like)
 * Preserves span styles when splitting paragraphs
 * Uses binary search for efficiency
 */
function pullTextChunkFromNextPage(element, nextPageRef) {
    const first = nextPageRef.firstChild
    if (!first || first.nodeType !== 1) return false

    // Find the first text node (deep - inside spans)
    const textNode = findFirstTextNode(first)
    if (!textNode || !textNode.textContent) return false

    const trimmed = textNode.textContent.trim()
    if (!trimmed) return false

    const words = trimmed.split(/\s+/)
    if (words.length < 2) return false

    // Clone the full node (preserves spans/styles)
    const testClone = first.cloneNode(true)

    // Binary search: how many words can we take?
    let lo = 1, hi = words.length - 1, best = 0

    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const candidateWords = words.slice(0, mid).join(' ')

        // Update the cloned text node
        const cloneTextNode = findFirstTextNode(testClone)
        if (cloneTextNode) cloneTextNode.textContent = candidateWords

        element.appendChild(testClone)
        const fits = element.scrollHeight <= element.clientHeight
        element.removeChild(testClone)

        if (fits) {
            best = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }

    if (best <= 0) return false

    console.log('[PullChunk] Pulled', best, 'of', words.length, 'words from next page')

    // Commit: add a clone with the chunk that fits
    const commitClone = first.cloneNode(true)
    const commitTextNode = findFirstTextNode(commitClone)
    if (commitTextNode) {
        commitTextNode.textContent = words.slice(0, best).join(' ')
    }
    element.appendChild(commitClone)

    // Remove chunk from original text node
    textNode.textContent = words.slice(best).join(' ')

    // If original becomes empty => remove node
    if (!first.textContent.trim()) {
        nextPageRef.removeChild(first)
    }

    return true
}

/**
 * Check if page has underflow (can pull content from next page)
 * DOM-first: pull nodes from nextPageRef into element, then sync both pages from DOM.
 */
export function checkUnderflow(element, pageIndex, doc, setDoc, pageRefs) {
    console.log('[Underflow] Check started for page', pageIndex)

    if (!element || !doc?.pages) {
        console.log('[Underflow] Early return: no element or doc.pages')
        return
    }

    // Edition mode only (current page)
    const currentPage = doc.pages[pageIndex]
    if (!currentPage || currentPage.mode !== 'edition') {
        console.log('[Underflow] Early return: not edition mode', currentPage?.mode)
        return
    }

    // last page => nothing to pull
    if (pageIndex >= doc.pages.length - 1) {
        console.log('[Underflow] Early return: last page, nothing to pull')
        return
    }

    // next page must be edition too
    const nextPage = doc.pages[pageIndex + 1]
    if (nextPage && nextPage.mode !== 'edition') {
        console.log('[Underflow] Early return: next page not edition', nextPage?.mode)
        return
    }

    // Use Range-based measurement for true available space (Word-like)
    const availableSpace = getAvailableSpacePx(element)
    console.log('[Underflow] Available space (Range-based):', availableSpace, 'threshold:', UNDERFLOW_THRESHOLD_PX)

    if (availableSpace <= UNDERFLOW_THRESHOLD_PX) {
        console.log('[Underflow] Not enough space, skipping')
        return
    }

    console.log('[Underflow] Calling tryPullFromNextPage')
    tryPullFromNextPage(element, pageIndex, doc, setDoc, pageRefs)
}

/**
 * Pull as much as possible (node-by-node) from next page to current page.
 * Uses real DOM of both pages, then syncs BOTH page contents in state.
 */
export function tryPullFromNextPage(element, pageIndex, doc, setDoc, pageRefs) {
    const nextPageRef = pageRefs.current[pageIndex + 1]
    console.log('[TryPull] nextPageRef exists:', !!nextPageRef)
    if (!nextPageRef) return

    console.log('[TryPull] nextPageRef.innerHTML.length:', nextPageRef.innerHTML.length)
    console.log('[TryPull] nextPageRef.innerHTML preview:', nextPageRef.innerHTML.substring(0, 100))

    let iterations = 0
    let movedAny = false

    while (iterations < MAX_PULL_ITERATIONS) {
        iterations++

        // Use Range-based measurement (Word-like)
        const availableSpace = getAvailableSpacePx(element)
        console.log('[TryPull] Iteration', iterations, 'availableSpace (Range-based):', availableSpace)

        if (availableSpace <= UNDERFLOW_THRESHOLD_PX) break

        const firstNode = nextPageRef.firstChild
        console.log('[TryPull] firstNode exists:', !!firstNode, firstNode?.nodeName)
        if (!firstNode) break

        // Move candidate: clone first, test fit
        const clone = firstNode.cloneNode(true)
        element.appendChild(clone)

        if (element.scrollHeight <= element.clientHeight) {
            // Commit: remove the real node from next page DOM
            console.log('[TryPull] Moved node successfully')
            nextPageRef.removeChild(firstNode)
            movedAny = true
            continue
        } else {
            // Rollback the clone
            console.log('[TryPull] Node too big, trying Word-like partial pull')
            element.removeChild(clone)

            // Word-like fallback: pull partial text from next page
            const pulled = pullTextChunkFromNextPage(element, nextPageRef)
            if (pulled) {
                movedAny = true
            }
            break
        }
    }

    console.log('[TryPull] movedAny:', movedAny)
    if (!movedAny) return

    // Sync BOTH pages from DOM into React state
    setDoc(prevDoc => {
        const newDoc = { ...prevDoc, pages: [...prevDoc.pages] }

        // Guard: pages could have changed
        if (!newDoc.pages[pageIndex]) return prevDoc

        // Sync CURRENT page from DOM
        const current = { ...newDoc.pages[pageIndex] }
        current.content = element.innerHTML
        newDoc.pages[pageIndex] = current

        // If next page removed already, stop
        if (pageIndex + 1 >= newDoc.pages.length) return newDoc

        // Sync NEXT page from DOM
        const next = { ...newDoc.pages[pageIndex + 1] }
        next.content = nextPageRef.innerHTML

        const nextIsEmpty =
            isEffectivelyEmpty(next.content) &&
            (!next.elements || next.elements.length === 0) &&
            (!next.rows || next.rows.length === 0)

        if (nextIsEmpty) {
            newDoc.pages.splice(pageIndex + 1, 1)
        } else {
            newDoc.pages[pageIndex + 1] = next
        }

        return newDoc
    })

    // NOTE: Don't call checkUnderflow recursively here with stale doc!
    // The reflow orchestrator in DocumentEditorIsland handles cascading checks
}
