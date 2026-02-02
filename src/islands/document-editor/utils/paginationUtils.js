/**
 * Pagination Utilities
 * DOM-first approach: manipulate DOM, then sync state
 * Operates on real DOM measurements after paint
 */

const UNDERFLOW_THRESHOLD_PX = 5
const MAX_PULL_ITERATIONS = 50

/**
 * Check if HTML content is effectively empty
 * (handles nbsp, zwsp, caret markers, empty wrappers)
 */
function isEffectivelyEmpty(html) {
    const cleaned = (html || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/\u200B/g, '') // zero-width space (caret markers etc.)
        .replace(/<span[^>]*data-caret-marker[^>]*>.*?<\/span>/gi, '')
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
        return Math.max(0, pageRect.height - pb)
    }

    // Find the lowest rect (last render position)
    let maxBottom = 0
    for (let i = 0; i < rects.length; i++) {
        if (rects[i].bottom > maxBottom) maxBottom = rects[i].bottom
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

    console.log('[checkOverflow] Page', pageIndex, 'scrollHeight:', element.scrollHeight, 'clientHeight:', element.clientHeight, 'overflow:', element.scrollHeight > element.clientHeight)

    if (element.scrollHeight > element.clientHeight) {
        const overflowContent = extractOverflow(element)
        console.log('[checkOverflow] Extracted content:', overflowContent ? overflowContent.substring(0, 100) + '...' : '(empty)')

        if (overflowContent) {
            // Get or create next page ref for DOM injection
            let nextPageRef = pageRefs.current[pageIndex + 1]

            // If next page exists, inject content directly into DOM (uncontrolled contenteditable)
            if (nextPageRef) {
                console.log('[checkOverflow] Injecting into existing page', pageIndex + 1)
                nextPageRef.innerHTML = overflowContent + nextPageRef.innerHTML
            }

            setDoc(prevDoc => {
                // Guard against stale index/ref mismatches
                if (pageRefs.current[pageIndex] !== element) return prevDoc

                const newDoc = { ...prevDoc, pages: [...prevDoc.pages] }

                // Guard: pageIndex must still exist
                if (!newDoc.pages[pageIndex]) return prevDoc

                // Sync current page from DOM
                const current = { ...newDoc.pages[pageIndex], content: element.innerHTML }
                newDoc.pages[pageIndex] = current

                if (pageIndex === newDoc.pages.length - 1) {
                    // Create new page with overflow content
                    newDoc.pages.push({
                        content: overflowContent,
                        elements: [],
                        rows: [],
                        mode: 'edition',
                        background: '#ffffff',
                        order: newDoc.pages.length
                    })
                } else {
                    // Sync next page from DOM (we already injected content)
                    const nextRef = pageRefs.current[pageIndex + 1]
                    if (nextRef) {
                        newDoc.pages[pageIndex + 1] = { ...newDoc.pages[pageIndex + 1], content: nextRef.innerHTML }
                    }
                }

                return newDoc
            })

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
    const overflowParts = []

    while (element.scrollHeight > element.clientHeight && element.childNodes.length > 0) {
        const lastNode = element.lastChild
        if (!lastNode) break

        // If text node, try to split it
        if (lastNode.nodeType === 3) {
            const words = lastNode.textContent.split(' ')
            const extractedWords = []

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
            if (lastNode.nodeType === 1) overflowParts.unshift(lastNode.outerHTML)
            else if (lastNode.nodeType === 3) overflowParts.unshift(lastNode.textContent)
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

    const textNode = findFirstTextNode(first)
    if (!textNode || !textNode.textContent) return false

    const trimmed = textNode.textContent.trim()
    if (!trimmed) return false

    const words = trimmed.split(/\s+/)
    if (words.length < 2) return false

    // Binary search: how many words can we take?
    let lo = 1, hi = words.length - 1, best = 0

    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const candidateWords = words.slice(0, mid).join(' ')

        const testClone = first.cloneNode(true)
        const cloneTextNode = findFirstTextNode(testClone)
        if (cloneTextNode) cloneTextNode.textContent = candidateWords

        element.appendChild(testClone)
        const fits = element.scrollHeight <= element.clientHeight + 1
        element.removeChild(testClone)

        if (fits) {
            best = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }

    if (best <= 0) return false

    // Commit: add a clone with the chunk that fits
    const commitClone = first.cloneNode(true)
    const commitTextNode = findFirstTextNode(commitClone)
    if (commitTextNode) commitTextNode.textContent = words.slice(0, best).join(' ')
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
 */
export function checkUnderflow(element, pageIndex, doc, setDoc, pageRefs) {
    if (!element || !doc?.pages) return

    const currentPage = doc.pages[pageIndex]
    if (!currentPage || currentPage.mode !== 'edition') return

    if (pageIndex >= doc.pages.length - 1) return

    const nextPage = doc.pages[pageIndex + 1]
    if (nextPage && nextPage.mode !== 'edition') return

    const availableSpace = getAvailableSpacePx(element)
    if (availableSpace <= UNDERFLOW_THRESHOLD_PX) return

    tryPullFromNextPage(element, pageIndex, doc, setDoc, pageRefs)
}

/**
 * Pull as much as possible (node-by-node) from next page to current page.
 * Uses real DOM of both pages, then syncs BOTH page contents in state.
 *
 * IMPORTANT FIXES:
 * - Guard against stale index/ref mismatches before mutating state
 * - Delete next page ONLY if DOM is empty at time of sync
 */
export function tryPullFromNextPage(element, pageIndex, doc, setDoc, pageRefs) {
    const nextPageRef = pageRefs.current[pageIndex + 1]
    if (!nextPageRef) return

    let iterations = 0
    let movedAny = false

    while (iterations < MAX_PULL_ITERATIONS) {
        iterations++

        const availableSpace = getAvailableSpacePx(element)
        if (availableSpace <= UNDERFLOW_THRESHOLD_PX) break

        const firstNode = nextPageRef.firstChild
        if (!firstNode) break

        // Try whole node
        const clone = firstNode.cloneNode(true)
        element.appendChild(clone)

        const fits = element.scrollHeight <= element.clientHeight + 1

        if (fits) {
            // Commit move: remove real node from next page
            nextPageRef.removeChild(firstNode)
            movedAny = true
            continue
        } else {
            // Rollback clone
            element.removeChild(clone)

            // Try partial pull
            const pulled = pullTextChunkFromNextPage(element, nextPageRef)
            if (pulled) movedAny = true
            break
        }
    }

    if (!movedAny) return

    // Snapshot DOM *now* (source of truth)
    const currentHtmlSnapshot = element.innerHTML
    const nextHtmlSnapshot = nextPageRef.innerHTML

    setDoc(prevDoc => {
        // CRITICAL: avoid deleting/writing wrong page if refs shifted
        if (pageRefs.current[pageIndex] !== element) return prevDoc
        if (pageRefs.current[pageIndex + 1] !== nextPageRef) return prevDoc

        const newDoc = { ...prevDoc, pages: [...prevDoc.pages] }
        if (!newDoc.pages[pageIndex]) return prevDoc

        // Sync CURRENT page from snapshot
        newDoc.pages[pageIndex] = { ...newDoc.pages[pageIndex], content: currentHtmlSnapshot }

        // Guard: next index still exists
        if (pageIndex + 1 >= newDoc.pages.length) return newDoc

        // Sync NEXT page from snapshot
        const nextPageState = { ...newDoc.pages[pageIndex + 1], content: nextHtmlSnapshot }

        const nextIsEmpty =
            isEffectivelyEmpty(nextPageState.content) &&
            (!nextPageState.elements || nextPageState.elements.length === 0) &&
            (!nextPageState.rows || nextPageState.rows.length === 0)

        if (nextIsEmpty) {
            // Never delete the only page
            if (newDoc.pages.length > 1) newDoc.pages.splice(pageIndex + 1, 1)
        } else {
            newDoc.pages[pageIndex + 1] = nextPageState
        }

        return newDoc
    })
}

/**
 * Pull content from curEl (next page) into prevEl (previous page).
 * Returns { movedAny: boolean, nextIsEmpty: boolean }
 * This is the DOM-only version used during Backspace merge.
 */
export function pullFromNextPageInto(prevEl, curEl) {
    if (!prevEl || !curEl) return { movedAny: false, nextIsEmpty: false }

    let movedAny = false
    let iterations = 0

    while (iterations < MAX_PULL_ITERATIONS) {
        iterations++

        const availableSpace = getAvailableSpacePx(prevEl)
        if (availableSpace <= UNDERFLOW_THRESHOLD_PX) break

        const firstNode = curEl.firstChild
        if (!firstNode) break

        // Try whole node
        const clone = firstNode.cloneNode(true)
        prevEl.appendChild(clone)

        const fits = prevEl.scrollHeight <= prevEl.clientHeight + 1

        if (fits) {
            curEl.removeChild(firstNode)
            movedAny = true
            continue
        } else {
            prevEl.removeChild(clone)

            // Try partial text pull
            const pulled = pullTextChunkBetweenElements(prevEl, curEl)
            if (pulled) movedAny = true
            break
        }
    }

    const nextIsEmpty = isEffectivelyEmpty(curEl.innerHTML)
    return { movedAny, nextIsEmpty }
}

/**
 * Pull partial text from curEl's first text node into prevEl.
 * Returns true if anything was pulled.
 */
function pullTextChunkBetweenElements(prevEl, curEl) {
    const first = curEl.firstChild
    if (!first || first.nodeType !== 1) return false

    const textNode = findFirstTextNode(first)
    if (!textNode || !textNode.textContent) return false

    const trimmed = textNode.textContent.trim()
    const words = trimmed.split(/\s+/)
    if (words.length < 2) return false

    // Binary search for how many words fit
    let lo = 1, hi = words.length - 1, best = 0

    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const candidateWords = words.slice(0, mid).join(' ')

        const testClone = first.cloneNode(true)
        const cloneTextNode = findFirstTextNode(testClone)
        if (cloneTextNode) cloneTextNode.textContent = candidateWords

        prevEl.appendChild(testClone)
        const fits = prevEl.scrollHeight <= prevEl.clientHeight + 1
        prevEl.removeChild(testClone)

        if (fits) {
            best = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }

    if (best <= 0) return false

    // Commit: add clone with the chunk that fits
    const commitClone = first.cloneNode(true)
    const commitTextNode = findFirstTextNode(commitClone)
    if (commitTextNode) commitTextNode.textContent = words.slice(0, best).join(' ')
    prevEl.appendChild(commitClone)

    // Remove chunk from original text node
    textNode.textContent = words.slice(best).join(' ')

    // If original node is now empty, remove it
    if (isEffectivelyEmpty(first.innerHTML || first.textContent)) {
        curEl.removeChild(first)
    }

    return true
}
