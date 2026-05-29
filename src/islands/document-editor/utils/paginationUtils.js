/**
 * Pagination Utilities
 * DOM-first approach: manipulate DOM, then sync state
 * Operates on real DOM measurements after paint
 * 
 * CRITICAL: Uses Range.getClientRects() for accurate overflow detection 
 * instead of scrollHeight which is unreliable for contenteditable.
 */

const UNDERFLOW_THRESHOLD_PX = 5
const MAX_PULL_ITERATIONS = 50
const MAX_OVERFLOW_ITERATIONS = 100 // Safety limit for overflow extraction

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
        .replace(/<span[^>]*data-reflow-caret[^>]*>.*?<\/span>/gi, '')
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<\/?p[^>]*>/gi, '')
        .replace(/<\/?div[^>]*>/gi, '')
        .replace(/<span[^>]*>|<\/span>/gi, '')
        .replace(/\s+/g, '')
        .trim()
    return cleaned.length === 0
}

function nodeToHtml(node) {
    if (!node) return ''
    if (node.nodeType === 1) return node.outerHTML || ''
    if (node.nodeType === 3) return node.textContent || ''
    return node.textContent || ''
}

function removeLeadingEmptyNodes(container) {
    if (!container) return false

    let removed = false
    while (container.firstChild && isEffectivelyEmpty(nodeToHtml(container.firstChild))) {
        container.removeChild(container.firstChild)
        removed = true
    }
    return removed
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
 * Check if content overflows the page box using Range-based measurement.
 * More reliable than scrollHeight for contenteditable elements.
 * 
 * @param {HTMLElement} pageEl - The contenteditable page element
 * @returns {boolean} true if content overflows
 */
export function doesContentOverflow(pageEl) {
    // Primary: scrollHeight check (works in most cases since overflow:hidden is set)
    if (pageEl.scrollHeight > pageEl.clientHeight + 1) return true

    // Secondary: Range-based measurement for edge cases
    if (!pageEl.firstChild) return false

    const { pb } = getVerticalPaddings(pageEl)
    const pageRect = pageEl.getBoundingClientRect()
    const maxBottom = pageRect.bottom - pb

    const range = document.createRange()
    range.selectNodeContents(pageEl)
    const rects = range.getClientRects()

    if (!rects || rects.length === 0) return false

    for (let i = 0; i < rects.length; i++) {
        if (rects[i].bottom > maxBottom + 1) return true
    }

    return false
}

/**
 * Returns available vertical space (px) between the bottom of rendered content
 * and the bottom of the page box.
 * Uses Range.getClientRects() for accurate measurement.
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
 * Check if content fits within the page (for underflow pull tests)
 * Uses both scrollHeight and Range measurement for reliability
 */
function doesContentFit(pageEl) {
    if (pageEl.scrollHeight > pageEl.clientHeight + 1) return false
    return !doesContentOverflow(pageEl)
}

/**
 * Check if page content overflows and move excess to next page.
 * Must be called after DOM paint (via requestAnimationFrame).
 * 
 * This function handles a SINGLE page overflow:
 * - Extracts overflow content from the given page
 * - Injects it into the next page's DOM (if exists)
 * - Updates state to create a new page if needed
 * 
 * Returns true if overflow was detected and handled (caller should continue iterating).
 */
export function checkOverflow(element, pageIndex, doc, setDoc, pageRefs) {
    if (!element) return false

    if (!doesContentOverflow(element)) return false

    const overflowContent = extractOverflow(element)

    if (!overflowContent) return false

    // BARRIER: If next page exists but is NOT in 'edition' mode, we must insert a new edition page
    // This prevents overflow content from being pushed into layout/designer pages
    const nextPage = doc?.pages?.[pageIndex + 1]
    const nextIsNonEdition = nextPage && nextPage.mode !== 'edition'

    // Get next page ref for DOM injection (only if it's an edition page)
    let nextPageRef = nextIsNonEdition ? null : pageRefs.current[pageIndex + 1]

    // If next page exists AND is edition mode, inject content directly into DOM
    if (nextPageRef) {
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

        if (nextIsNonEdition) {
            // INSERT a new edition page BEFORE the non-edition page
            newDoc.pages.splice(pageIndex + 1, 0, {
                content: overflowContent,
                elements: [],
                rows: [],
                mode: 'edition',
                background: '#ffffff',
                order: pageIndex + 1
            })
        } else if (pageIndex === newDoc.pages.length - 1) {
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

    return true // overflow was handled
}

/**
 * Iteratively reflow ALL pages until no more overflow exists.
 * This is the solution for large pastes (e.g. 17 pages of content).
 * 
 * The problem: checkOverflow creates new pages via setDoc, but React hasn't rendered
 * them yet, so pageRefs for new pages don't exist. We need to wait for React to render
 * each new page before we can continue cascading.
 * 
 * Solution: Use a loop that:
 * 1. Processes all existing pages for overflow
 * 2. Waits for React to render any new pages (via requestAnimationFrame + setTimeout)
 * 3. Repeats until stable (no more overflows detected)
 * 
 * @param {Object} docRef - React ref containing current doc state
 * @param {Function} setDoc - React state setter for doc
 * @param {Object} pageRefs - React ref containing page DOM elements
 * @param {number} maxPasses - Safety limit for total passes (default 100 = ~100 pages max)
 */
export function reflowAllPages(docRef, setDoc, pageRefs, maxPasses = 100, onComplete = null) {
    let pass = 0

    function doPass() {
        if (pass >= maxPasses) {
            console.warn('[reflowAllPages] Hit max passes limit:', maxPasses)
            if (onComplete) onComplete()
            return
        }
        pass++

        const d = docRef.current
        if (!d?.pages?.length) {
            if (onComplete) onComplete()
            return
        }

        let anyOverflowHandled = false

        // Debug: log current state
        const refsAvailable = Object.keys(pageRefs.current).map(Number).sort((a, b) => a - b)
        console.log(`[reflowAllPages] Pass ${pass}: ${d.pages.length} pages in state, refs available: [${refsAvailable.join(',')}]`)

        // Process all pages that currently have refs
        for (let i = 0; i < d.pages.length; i++) {
            // BARRIER: Only process edition pages for overflow
            if (d.pages[i].mode !== 'edition') continue

            const el = pageRefs.current[i]
            if (!el) {
                console.log(`  Page ${i}: NO REF (skipped)`)
                continue
            }

            const overflows = doesContentOverflow(el)
            if (!overflows) continue

            // BARRIER: If next page is NOT edition mode, insert a new edition page
            const nextPage = d.pages[i + 1]
            const nextIsNonEdition = nextPage && nextPage.mode !== 'edition'

            console.log(`  Page ${i}: OVERFLOWS (scrollH=${el.scrollHeight}, clientH=${el.clientHeight}, children=${el.childNodes.length})`)

            const overflowContent = extractOverflow(el)
            if (!overflowContent) {
                console.log(`  Page ${i}: extractOverflow returned empty!`)
                continue
            }

            anyOverflowHandled = true
            const overflowLen = overflowContent.length
            console.log(`  Page ${i}: extracted ${overflowLen} chars of overflow`)

            // Inject into next page DOM if it exists AND is edition mode
            const nextEl = nextIsNonEdition ? null : pageRefs.current[i + 1]
            if (nextEl) {
                const beforeLen = nextEl.innerHTML.length
                nextEl.innerHTML = overflowContent + nextEl.innerHTML
                console.log(`  Page ${i}: injected into page ${i + 1} DOM (before: ${beforeLen} chars, after: ${nextEl.innerHTML.length} chars)`)
            } else {
                console.log(`  Page ${i}: next page ${i + 1} ${nextIsNonEdition ? 'is non-edition, inserting new page' : 'has no ref, will create via setDoc'}`)
            }

            // Update state
            const capturedIndex = i
            const capturedEl = el
            const capturedOverflow = overflowContent
            const capturedNextIsNonEdition = nextIsNonEdition
            setDoc(prevDoc => {
                if (pageRefs.current[capturedIndex] !== capturedEl) return prevDoc

                const newDoc = { ...prevDoc, pages: [...prevDoc.pages] }
                if (!newDoc.pages[capturedIndex]) return prevDoc

                // Sync current page from DOM
                newDoc.pages[capturedIndex] = {
                    ...newDoc.pages[capturedIndex],
                    content: capturedEl.innerHTML
                }

                if (capturedNextIsNonEdition) {
                    // INSERT a new edition page BEFORE the non-edition page
                    newDoc.pages.splice(capturedIndex + 1, 0, {
                        content: capturedOverflow,
                        elements: [],
                        rows: [],
                        mode: 'edition',
                        background: '#ffffff',
                        order: capturedIndex + 1
                    })
                    console.log(`  [setDoc] Inserted new edition page at ${capturedIndex + 1} (before non-edition page)`)
                } else if (capturedIndex === newDoc.pages.length - 1) {
                    // Create new page
                    newDoc.pages.push({
                        content: capturedOverflow,
                        elements: [],
                        rows: [],
                        mode: 'edition',
                        background: '#ffffff',
                        order: newDoc.pages.length
                    })
                    console.log(`  [setDoc] Created page ${newDoc.pages.length - 1} with ${capturedOverflow.length} chars`)
                } else {
                    // Sync next page from DOM
                    const nextRef = pageRefs.current[capturedIndex + 1]
                    if (nextRef) {
                        newDoc.pages[capturedIndex + 1] = {
                            ...newDoc.pages[capturedIndex + 1],
                            content: nextRef.innerHTML
                        }
                    }
                }

                return newDoc
            })

            // Only process one overflow per pass to avoid batching issues
            // Each new page needs a full React render cycle before we can continue
            break
        }

        if (anyOverflowHandled) {
            // Wait for React to render new pages, then do another pass
            requestAnimationFrame(() => {
                setTimeout(doPass, 50)
            })
        } else {
            console.log(`[reflowAllPages] Stable after ${pass} passes, ${docRef.current?.pages?.length} pages`)
            if (onComplete) onComplete()
        }
    }

    // Start first pass after current frame
    requestAnimationFrame(doPass)
}

/**
 * Extract overflow content from page
 * Removes or splits nodes from end until content fits
 * 
 * IMPROVED: Uses Range-based detection, handles text node splitting better,
 * preserves block-level element integrity
 */
export function extractOverflow(element) {
    const overflowParts = []
    let iterations = 0

    while (doesContentOverflow(element) && element.childNodes.length > 0 && iterations < MAX_OVERFLOW_ITERATIONS) {
        iterations++
        const lastNode = element.lastChild
        if (!lastNode) break

        // If text node, try to split it word by word
        if (lastNode.nodeType === 3) {
            const words = lastNode.textContent.split(' ')
            const extractedWords = []

            while (doesContentOverflow(element) && words.length > 1) {
                extractedWords.unshift(words.pop())
                lastNode.textContent = words.join(' ')
            }

            if (extractedWords.length > 0) {
                overflowParts.unshift(extractedWords.join(' '))
            }

            if (!doesContentOverflow(element)) break
        }

        // If an element-level node, try to split block content
        if (lastNode.nodeType === 1 && doesContentOverflow(element)) {
            // For block elements (p, div, blockquote, etc.), try splitting content inside
            const blockTags = ['P', 'DIV', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE']
            if (blockTags.includes(lastNode.tagName) && lastNode.childNodes.length > 1) {
                const splitResult = splitBlockNode(element, lastNode)
                if (splitResult) {
                    overflowParts.unshift(splitResult)
                    if (!doesContentOverflow(element)) break
                    continue
                }
            }
        }

        // Still overflowing: remove the whole node
        if (doesContentOverflow(element)) {
            if (lastNode.nodeType === 1) overflowParts.unshift(lastNode.outerHTML)
            else if (lastNode.nodeType === 3) overflowParts.unshift(lastNode.textContent)
            element.removeChild(lastNode)
        }
    }

    return overflowParts.join('')
}

/**
 * Try to split a block-level node (e.g. <p>) to extract overflow content.
 * Returns the HTML of the extracted portion, or null if splitting wasn't possible.
 * 
 * This preserves the block tag and any inline formatting (spans, bold, etc.)
 */
function splitBlockNode(pageEl, blockNode) {
    const childNodes = Array.from(blockNode.childNodes)
    if (childNodes.length <= 1) return null

    const extractedNodes = []

    // Remove children from end until the page fits
    while (doesContentOverflow(pageEl) && blockNode.childNodes.length > 1) {
        const lastChild = blockNode.lastChild
        if (!lastChild) break
        extractedNodes.unshift(lastChild)
        blockNode.removeChild(lastChild)
    }

    if (extractedNodes.length === 0) return null

    // Try word-level split on the remaining last child (if it's text)
    const remainingLast = blockNode.lastChild
    if (remainingLast && remainingLast.nodeType === 3 && doesContentOverflow(pageEl)) {
        const words = remainingLast.textContent.split(' ')
        const spillWords = []
        while (doesContentOverflow(pageEl) && words.length > 1) {
            spillWords.unshift(words.pop())
            remainingLast.textContent = words.join(' ')
        }
        if (spillWords.length > 0) {
            // Prepend spilled text to extracted nodes
            extractedNodes.unshift(document.createTextNode(spillWords.join(' ') + ' '))
        }
    }

    // Build the overflow fragment as a clone of the block with extracted content
    const overflowBlock = blockNode.cloneNode(false) // clone tag + attributes, not children
    extractedNodes.forEach(n => overflowBlock.appendChild(n))

    return overflowBlock.outerHTML
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
        const fits = doesContentFit(element)
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
    if (!element || !doc?.pages) return false

    const currentPage = doc.pages[pageIndex]
    if (!currentPage || currentPage.mode !== 'edition') return false

    if (pageIndex >= doc.pages.length - 1) return false

    const nextPage = doc.pages[pageIndex + 1]
    if (nextPage && nextPage.mode !== 'edition') return false

    const availableSpace = getAvailableSpacePx(element)
    if (availableSpace <= UNDERFLOW_THRESHOLD_PX) return false

    return tryPullFromNextPage(element, pageIndex, doc, setDoc, pageRefs)
}

/**
 * Reflow underflow safely across the whole document.
 *
 * Only one adjacent page pair is compacted per pass. This matters because a
 * successful pull can delete the next page, shifting every later page index.
 * Running several pulls against the same stale page map can overwrite or drop
 * trailing pages before React has rendered the new order.
 */
export function reflowUnderflowAllPages(docRef, setDoc, pageRefs, maxPasses = 100, onComplete = null) {
    let pass = 0

    function doPass() {
        if (pass >= maxPasses) {
            console.warn('[reflowUnderflowAllPages] Hit max passes limit:', maxPasses)
            if (onComplete) onComplete()
            return
        }
        pass++

        const d = docRef.current
        if (!d?.pages?.length) {
            if (onComplete) onComplete()
            return
        }

        for (let i = 0; i < d.pages.length - 1; i++) {
            const el = pageRefs.current[i]
            if (!el) continue

            const moved = checkUnderflow(el, i, d, setDoc, pageRefs)
            if (moved) {
                requestAnimationFrame(() => {
                    setTimeout(doPass, 35)
                })
                return
            }
        }

        if (onComplete) onComplete()
    }

    requestAnimationFrame(doPass)
}

/**
 * Compact edition pages in a single DOM-first transaction.
 *
 * This replaces the old setDoc-per-page underflow flow for normal editing. We
 * mutate adjacent page DOMs first, cascade across all refs while indexes are
 * stable, then sync every page once. That avoids the duplicate-tail bug where a
 * page received content from the next page but React state kept the source page
 * unchanged.
 */
export function compactUnderflowPages(docRef, setDoc, pageRefs, maxPasses = 40) {
    const initialDoc = docRef.current
    if (!initialDoc?.pages?.length) return false

    let movedAny = false

    for (let pass = 0; pass < maxPasses; pass += 1) {
        const pages = docRef.current?.pages || initialDoc.pages
        let movedThisPass = false

        for (let i = 0; i < pages.length - 1; i += 1) {
            const currentPage = pages[i]
            const nextPage = pages[i + 1]
            if (!currentPage || !nextPage) continue
            if (currentPage.mode !== 'edition' || nextPage.mode !== 'edition') continue

            const currentEl = pageRefs.current[i]
            const nextEl = pageRefs.current[i + 1]
            if (!currentEl || !nextEl) continue
            if (doesContentOverflow(currentEl)) continue

            const removedLeadingEmpty = removeLeadingEmptyNodes(nextEl)
            if (isEffectivelyEmpty(nextEl.innerHTML)) {
                if (removedLeadingEmpty) {
                    movedAny = true
                    movedThisPass = true
                }
                continue
            }

            const { movedAny: movedFromNext } = pullFromNextPageInto(currentEl, nextEl)
            if (movedFromNext) {
                movedAny = true
                movedThisPass = true
            }
        }

        if (!movedThisPass) break
    }

    if (!movedAny) return false

    setDoc(prevDoc => {
        if (!prevDoc?.pages?.length) return prevDoc

        const syncedPages = prevDoc.pages.map((page, index) => {
            const pageRef = pageRefs.current[index]
            if (page?.mode === 'edition' && pageRef) {
                return { ...page, content: pageRef.innerHTML }
            }
            return { ...page }
        })

        const compactedPages = syncedPages.filter(page => {
            const hasElements = Array.isArray(page.elements) && page.elements.length > 0
            const hasRows = Array.isArray(page.rows) && page.rows.length > 0
            if (syncedPages.length <= 1) return true
            if (page.mode !== 'edition') return true
            return !(isEffectivelyEmpty(page.content) && !hasElements && !hasRows)
        })

        const pages = (compactedPages.length ? compactedPages : [syncedPages[0]]).map((page, index) => ({
            ...page,
            order: index
        }))

        return { ...prevDoc, pages }
    })

    return true
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
    if (!nextPageRef) return false

    let iterations = 0
    let movedAny = false

    while (iterations < MAX_PULL_ITERATIONS) {
        iterations++

        const availableSpace = getAvailableSpacePx(element)
        if (availableSpace <= UNDERFLOW_THRESHOLD_PX) break

        removeLeadingEmptyNodes(nextPageRef)

        const firstNode = nextPageRef.firstChild
        if (!firstNode) break

        // Try whole node
        const clone = firstNode.cloneNode(true)
        element.appendChild(clone)

        const fits = doesContentFit(element)

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

    if (!movedAny) return false

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

    return true
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

        removeLeadingEmptyNodes(curEl)

        const firstNode = curEl.firstChild
        if (!firstNode) break

        // Try whole node
        const clone = firstNode.cloneNode(true)
        prevEl.appendChild(clone)

        const fits = doesContentFit(prevEl)

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
        const fits = doesContentFit(prevEl)
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
