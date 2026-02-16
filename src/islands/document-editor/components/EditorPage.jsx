/**
 * EditorPage Component
 * Single page component with edition/layout/designer modes
 * 1:1 parity with editor-canvas.ejs page rendering
 * 
 * CRITICAL: contenteditable is UNCONTROLLED
 * - Initial content set via dangerouslySetInnerHTML on first render
 * - Content updates read from ref, NOT from state
 * - No re-render of contenteditable on state changes
 */
import React, { useEffect, useRef, useCallback } from 'react'
import { useImageResize } from '../hooks/useImageResize'

export default function EditorPage({
    page,
    pageIndex,
    doc,
    setDoc,
    pageRefs,
    isSelected,
    onSelect,
    handlePageInput,
    handlePaste,
    handleKeyDown,
    isGlobalSelection
}) {
    const contentRef = useRef(null)
    const initialContentRef = useRef(page.content)

    // Register ref
    useEffect(() => {
        if (contentRef.current) {
            pageRefs.current[pageIndex] = contentRef.current
        }
        return () => {
            delete pageRefs.current[pageIndex]
        }
    }, [pageIndex, pageRefs])

    // Set initial content only once
    useEffect(() => {
        if (contentRef.current && !contentRef.current.innerHTML) {
            contentRef.current.innerHTML = initialContentRef.current || ''
        }
    }, [])

    // ========== CARET VISIBILITY: Scroll cursor into view after typing ==========
    // The page has overflow:hidden + maxHeight, so the cursor can go below the visible area.
    // After each key action, we check if the caret rect is below the page and scroll the
    // outer canvas container to keep it visible.
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const scrollCaretIntoView = () => {
            requestAnimationFrame(() => {
                const sel = window.getSelection()
                if (!sel || sel.rangeCount === 0) return

                const range = sel.getRangeAt(0)
                const rect = range.getBoundingClientRect()
                if (!rect || (rect.top === 0 && rect.bottom === 0)) return

                // Get the page container's visible rect
                const pageRect = el.getBoundingClientRect()
                const margin = 80

                // If cursor is below the page's visible bottom (overflow:hidden clips it)
                if (rect.bottom > pageRect.bottom) {
                    // Scroll the canvas container so cursor is visible
                    window.scrollBy({ top: rect.bottom - pageRect.bottom + margin, behavior: 'instant' })
                }
                // If cursor is above the viewport
                else if (rect.top < margin) {
                    window.scrollBy({ top: rect.top - margin, behavior: 'instant' })
                }
            })
        }

        el.addEventListener('keyup', scrollCaretIntoView)
        return () => el.removeEventListener('keyup', scrollCaretIntoView)
    }, [page.mode])

    // Image resize functionality for edition mode
    const handleContentChange = useCallback(() => {
        if (handlePageInput) {
            handlePageInput({ target: contentRef.current }, pageIndex)
        }
    }, [handlePageInput, pageIndex])

    useImageResize(contentRef, handleContentChange)

    // ========== BLOCK INTERACTION: Hover Delete Button ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const BLOCK_SELECTORS = 'blockquote, table, div[style], pre'

        // Find the top-level block ancestor within the contenteditable
        const findTopBlock = (target) => {
            const block = target.closest(BLOCK_SELECTORS)
            if (!block) return null
            // Walk up to find the outermost block that is still inside the contenteditable
            let topBlock = block
            let parent = block.parentElement
            while (parent && parent !== el) {
                if (parent.matches(BLOCK_SELECTORS)) {
                    topBlock = parent
                }
                parent = parent.parentElement
            }
            // Must be inside the contenteditable
            if (!el.contains(topBlock)) return null
            return topBlock
        }

        const handleMouseOver = (e) => {
            const block = findTopBlock(e.target)
            if (!block) return

            // Don't add duplicate buttons
            if (block.querySelector('.doc-block-delete-btn')) return

            // Ensure the block has position:relative so the absolute delete button works
            const pos = window.getComputedStyle(block).position
            if (pos === 'static') {
                block.style.position = 'relative'
            }

            // Create delete button
            const btn = document.createElement('span')
            btn.className = 'doc-block-delete-btn'
            btn.innerHTML = '×'
            btn.contentEditable = 'false'
            btn.title = 'Supprimer ce bloc'
            btn.setAttribute('data-no-drag', 'true')

            btn.addEventListener('mousedown', (ev) => {
                ev.preventDefault()
                ev.stopPropagation()
                // Insert a <p><br></p> where the block was, so cursor has somewhere to go
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                block.replaceWith(p)
                // Place cursor in the new paragraph
                const sel = window.getSelection()
                const range = document.createRange()
                range.selectNodeContents(p)
                range.collapse(true)
                sel.removeAllRanges()
                sel.addRange(range)
                // Trigger save
                if (handlePageInput) {
                    handlePageInput({ target: el }, pageIndex)
                }
            })

            block.appendChild(btn)
        }

        const handleMouseOut = (e) => {
            const block = findTopBlock(e.target)
            if (!block) return

            // Check if mouse is still inside the block
            const related = e.relatedTarget
            if (related && block.contains(related)) return

            // Remove delete button and reset position
            const btn = block.querySelector('.doc-block-delete-btn')
            if (btn) btn.remove()
        }

        el.addEventListener('mouseover', handleMouseOver)
        el.addEventListener('mouseout', handleMouseOut)

        return () => {
            el.removeEventListener('mouseover', handleMouseOver)
            el.removeEventListener('mouseout', handleMouseOut)
        }
    }, [page.mode, pageIndex, handlePageInput])

    // ========== BLOCK ESCAPE: Enter at end of block exits it ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const ESCAPE_BLOCKS = 'blockquote, pre, div[style], table'

        const handleKeyDown = (e) => {
            if (e.key !== 'Enter' || e.shiftKey) return

            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) return

            let node = sel.getRangeAt(0).commonAncestorContainer
            if (node.nodeType === 3) node = node.parentElement

            // Find the outermost escape block
            const block = node.closest(ESCAPE_BLOCKS)
            if (!block || !el.contains(block)) return

            // Check if cursor is at the end of the block content
            const range = sel.getRangeAt(0)
            const testRange = document.createRange()
            testRange.selectNodeContents(block)
            testRange.setStart(range.endContainer, range.endOffset)
            const remainingContent = testRange.cloneContents()
            const remainingText = remainingContent.textContent || ''

            // If there's no meaningful text after the cursor, exit the block
            if (remainingText.trim() === '') {
                e.preventDefault()
                e.stopPropagation()

                // Create a new paragraph after the block
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                block.after(p)

                // Place cursor in the new paragraph
                const newRange = document.createRange()
                newRange.selectNodeContents(p)
                newRange.collapse(true)
                sel.removeAllRanges()
                sel.addRange(newRange)

                // Trigger save
                if (handlePageInput) {
                    handlePageInput({ target: el }, pageIndex)
                }
            }
        }

        el.addEventListener('keydown', handleKeyDown)
        return () => el.removeEventListener('keydown', handleKeyDown)
    }, [page.mode, pageIndex, handlePageInput])

    // ========== CLICK OUTSIDE BLOCK: Place cursor in free area ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const BLOCK_SELECTORS = 'blockquote, table, div[style], pre'

        const handleClick = (e) => {
            // Only handle direct clicks on the contenteditable itself
            // (clicks on the padding/empty area, not on children)
            const target = e.target

            // If click is directly on the contenteditable container
            // or on a simple <p>/<br> (non-block), no action needed - browser handles it
            if (target !== el) {
                // Check if click is inside a block
                const clickedBlock = target.closest(BLOCK_SELECTORS)
                if (!clickedBlock || !el.contains(clickedBlock)) return // not in a block, browser handles fine
                // User clicked inside a block - that's normal editing, do nothing
                return
            }

            // Click was on the contenteditable container itself (empty area)
            // This happens when clicking in the padding or between/after blocks
            e.preventDefault()

            const clickY = e.clientY
            const elRect = el.getBoundingClientRect()

            // Find all top-level children
            const children = Array.from(el.children)

            if (children.length === 0) {
                // No children at all - create a paragraph
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                el.appendChild(p)
                placeCursorIn(p)
                return
            }

            // Find the right position based on click Y coordinate
            let insertBefore = null
            let insertAfter = null

            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                const rect = child.getBoundingClientRect()

                if (clickY < rect.top) {
                    // Click is above this child — insert before it
                    insertBefore = child
                    break
                }
                insertAfter = child
            }

            // Check if there's already a non-block element at the target position we can use
            if (insertBefore) {
                // If the previous sibling is already a non-block paragraph, place cursor there
                const prev = insertBefore.previousElementSibling
                if (prev && !prev.matches(BLOCK_SELECTORS) && (prev.tagName === 'P' || prev.tagName === 'H1' || prev.tagName === 'H2' || prev.tagName === 'H3')) {
                    placeCursorIn(prev)
                    return
                }
                // Insert a new paragraph before the element
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                el.insertBefore(p, insertBefore)
                placeCursorIn(p)
            } else if (insertAfter) {
                // Click is below the last element
                // If the last element is not a block, reuse it
                const next = insertAfter.nextElementSibling
                if (next && !next.matches(BLOCK_SELECTORS) && (next.tagName === 'P' || next.tagName === 'H1' || next.tagName === 'H2' || next.tagName === 'H3')) {
                    placeCursorIn(next)
                    return
                }
                if (!insertAfter.matches(BLOCK_SELECTORS) && (insertAfter.tagName === 'P' || insertAfter.tagName === 'H1' || insertAfter.tagName === 'H2' || insertAfter.tagName === 'H3')) {
                    placeCursorIn(insertAfter)
                    return
                }
                // Append a new paragraph after the last element
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                insertAfter.after(p)
                placeCursorIn(p)
            }

            // Trigger save
            if (handlePageInput) {
                handlePageInput({ target: el }, pageIndex)
            }
        }

        function placeCursorIn(element) {
            const sel = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(element)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
            element.focus()
        }

        el.addEventListener('click', handleClick)
        return () => el.removeEventListener('click', handleClick)
    }, [page.mode, pageIndex, handlePageInput])


    // Handle edition mode drop from sidebar
    const handleEditionDrop = useCallback((e) => {
        e.preventDefault()
        const html = e.dataTransfer.getData('text/html')
        const text = e.dataTransfer.getData('text/plain')

        if (html || text) {
            // Get drop position
            const range = document.caretRangeFromPoint(e.clientX, e.clientY)
            if (range) {
                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
                document.execCommand('insertHTML', false, html || text)
            }
        }
    }, [])

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
    }, [])

    // Calculate page dimensions
    const { width, height } = doc.dimensions || { width: 794, height: 1123 }
    const { top, bottom, left, right } = doc.margins || { top: 40, bottom: 40, left: 40, right: 40 }

    const hasHeader = !!doc.headerHtml
    const hasFooter = !!doc.footerHtml

    // Reduce contenteditable padding when header/footer is present (they have their own padding)
    const contentPaddingTop = hasHeader ? 8 : top
    const contentPaddingBottom = hasFooter ? 8 : bottom

    return (
        <div
            className={`bg-white shadow-2xl relative transition-shadow ${isSelected ? 'ring-2 ring-primary/20' : ''
                }`}
            style={{
                width: `${width}px`,
                minHeight: `${height}px`,
                backgroundColor: page.background || '#ffffff',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={onSelect}
        >
            {/* Global Header (non-editable, all pages) */}
            {hasHeader && page.mode === 'edition' && (
                <DocHeaderFooter
                    type="header"
                    html={doc.headerHtml}
                    onRemove={() => setDoc(prev => ({ ...prev, headerHtml: '' }))}
                    paddingLeft={left}
                    paddingRight={right}
                    paddingTop={top}
                />
            )}

            {/* Edition Mode */}
            {page.mode === 'edition' && (
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none text-black"
                    style={{
                        padding: `${contentPaddingTop}px ${right}px ${contentPaddingBottom}px ${left}px`,
                        flex: 1,
                        minHeight: 0,
                        maxHeight: `${height - (hasHeader ? 0 : 0) - (hasFooter ? 0 : 0)}px`,
                        overflow: 'hidden',
                        color: '#000000',
                        caretColor: '#000000',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: '1.6'
                    }}
                    onInput={(e) => handlePageInput(e, pageIndex)}
                    onPaste={(e) => handlePaste(e, pageIndex)}
                    onKeyDown={(e) => handleKeyDown?.(e, pageIndex, contentRef)}
                    onDrop={handleEditionDrop}
                    onDragOver={handleDragOver}
                />
            )}

            {/* Global Footer (non-editable, all pages) */}
            {hasFooter && page.mode === 'edition' && (
                <DocHeaderFooter
                    type="footer"
                    html={doc.footerHtml}
                    onRemove={() => setDoc(prev => ({ ...prev, footerHtml: '' }))}
                    paddingLeft={left}
                    paddingRight={right}
                    paddingBottom={bottom}
                />
            )}

            {/* Layout Mode */}
            {page.mode === 'layout' && (
                <div
                    className="min-h-full"
                    style={{
                        padding: `${top}px ${right}px ${bottom}px ${left}px`,
                        minHeight: `${height}px`
                    }}
                >
                    <LayoutModeContent
                        page={page}
                        pageIndex={pageIndex}
                        doc={doc}
                        setDoc={setDoc}
                    />
                </div>
            )}

            {/* Designer Mode */}
            {page.mode === 'designer' && (
                <div
                    className="min-h-full relative"
                    style={{
                        padding: `${top}px ${right}px ${bottom}px ${left}px`,
                        minHeight: `${height}px`
                    }}
                >
                    <DesignerModeContent
                        page={page}
                        pageIndex={pageIndex}
                        doc={doc}
                        setDoc={setDoc}
                    />
                </div>
            )}
        </div>
    )
}

// ========== HEADER/FOOTER COMPONENT ==========
// Non-editable, rendered on every page from doc-level headerHtml/footerHtml
function DocHeaderFooter({ type, html, onRemove, paddingLeft, paddingRight, paddingTop, paddingBottom }) {
    const [hovered, setHovered] = React.useState(false)

    return (
        <div
            contentEditable={false}
            style={{
                position: 'relative',
                padding: `${type === 'header' ? (paddingTop || 20) : 12}px ${paddingRight || 40}px ${type === 'footer' ? (paddingBottom || 20) : 12}px ${paddingLeft || 40}px`,
                color: '#000000',
                userSelect: 'none',
                flexShrink: 0,
                cursor: 'default'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Rendered HTML content */}
            <div
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ pointerEvents: 'none' }}
            />

            {/* Hover overlay with label + remove button */}
            {hovered && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px solid rgba(59,130,246,0.4)',
                        borderRadius: '0',
                        background: 'rgba(59,130,246,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        zIndex: 5,
                        pointerEvents: 'none'
                    }}
                >
                    {/* Label */}
                    <span
                        style={{
                            position: 'absolute',
                            top: type === 'header' ? '4px' : 'auto',
                            bottom: type === 'footer' ? '4px' : 'auto',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#3b82f6',
                            background: 'white',
                            padding: '1px 8px',
                            borderRadius: '4px',
                            border: '1px solid rgba(59,130,246,0.3)',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {type === 'header' ? 'En-tête (toutes les pages)' : 'Pied de page (toutes les pages)'}
                    </span>

                    {/* Remove button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onRemove()
                        }}
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            lineHeight: 1,
                            cursor: 'pointer',
                            zIndex: 10,
                            border: '2px solid white',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            pointerEvents: 'auto'
                        }}
                        title={`Supprimer ${type === 'header' ? "l'en-tête" : 'le pied de page'}`}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    )
}

// Layout Mode Content
function LayoutModeContent({ page, pageIndex, doc, setDoc }) {
    const containerRef = useRef(null)

    // Add row
    const addRow = useCallback(() => {
        setDoc(prev => {
            const pages = [...prev.pages]
            const updatedPage = { ...pages[pageIndex] }
            updatedPage.rows = [...(updatedPage.rows || []), {
                id: Date.now(),
                columns: [{ id: Date.now() + 1, elements: [], width: 100 }]
            }]
            pages[pageIndex] = updatedPage
            return { ...prev, pages }
        })
    }, [pageIndex, setDoc])

    return (
        <div ref={containerRef} className="space-y-4">
            {(page.rows || []).map((row, rowIndex) => (
                <LayoutRow
                    key={row.id || rowIndex}
                    row={row}
                    rowIndex={rowIndex}
                    pageIndex={pageIndex}
                    doc={doc}
                    setDoc={setDoc}
                />
            ))}

            {/* Add Row Button */}
            <button
                onClick={addRow}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
            >
                <iconify-icon icon="tabler:plus" width="18"></iconify-icon>
                <span className="text-sm">Ajouter une ligne</span>
            </button>
        </div>
    )
}

// Layout Row
function LayoutRow({ row, rowIndex, pageIndex, doc, setDoc }) {
    // Delete row
    const deleteRow = useCallback(() => {
        setDoc(prev => {
            const pages = [...prev.pages]
            const updatedPage = { ...pages[pageIndex] }
            updatedPage.rows = updatedPage.rows.filter((_, i) => i !== rowIndex)
            pages[pageIndex] = updatedPage
            return { ...prev, pages }
        })
    }, [pageIndex, rowIndex, setDoc])

    // Add column
    const addColumn = useCallback(() => {
        setDoc(prev => {
            const pages = [...prev.pages]
            const updatedPage = { ...pages[pageIndex] }
            const rows = [...updatedPage.rows]
            const updatedRow = { ...rows[rowIndex] }
            const columnCount = updatedRow.columns.length + 1
            const columnWidth = Math.floor(100 / columnCount)

            updatedRow.columns = [
                ...updatedRow.columns.map(c => ({ ...c, width: columnWidth })),
                { id: Date.now(), elements: [], width: columnWidth }
            ]

            rows[rowIndex] = updatedRow
            updatedPage.rows = rows
            pages[pageIndex] = updatedPage
            return { ...prev, pages }
        })
    }, [pageIndex, rowIndex, setDoc])

    return (
        <div className="group/row relative">
            {/* Row Controls */}
            <div className="absolute -left-8 top-0 bottom-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                <button
                    onClick={addColumn}
                    className="p-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    title="Ajouter colonne"
                >
                    <iconify-icon icon="tabler:columns" width="14"></iconify-icon>
                </button>
                <button
                    onClick={deleteRow}
                    className="p-1 rounded bg-danger/10 text-danger hover:bg-danger hover:text-white"
                    title="Supprimer ligne"
                >
                    <iconify-icon icon="tabler:trash" width="14"></iconify-icon>
                </button>
            </div>

            {/* Columns */}
            <div className="flex gap-4 min-h-[100px] border-2 border-dashed border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-lg p-2">
                {row.columns.map((column, colIndex) => (
                    <LayoutColumn
                        key={column.id || colIndex}
                        column={column}
                        colIndex={colIndex}
                        rowIndex={rowIndex}
                        pageIndex={pageIndex}
                        doc={doc}
                        setDoc={setDoc}
                    />
                ))}
            </div>
        </div>
    )
}

// Layout Column
function LayoutColumn({ column, colIndex, rowIndex, pageIndex, doc, setDoc }) {
    return (
        <div
            className="flex-1 min-h-[80px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-2 hover:border-primary/50 transition-colors"
            style={{ width: `${column.width}%` }}
        >
            {(column.elements || []).length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                    Glissez un élément ici
                </div>
            ) : (
                <div className="space-y-2">
                    {column.elements.map((element, elIndex) => (
                        <LayoutElement
                            key={element.id || elIndex}
                            element={element}
                            elIndex={elIndex}
                            colIndex={colIndex}
                            rowIndex={rowIndex}
                            pageIndex={pageIndex}
                            doc={doc}
                            setDoc={setDoc}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Layout Element
function LayoutElement({ element, elIndex, colIndex, rowIndex, pageIndex, doc, setDoc }) {
    // Delete element
    const deleteElement = useCallback(() => {
        setDoc(prev => {
            const pages = [...prev.pages]
            const updatedPage = { ...pages[pageIndex] }
            const rows = [...updatedPage.rows]
            const updatedRow = { ...rows[rowIndex] }
            const columns = [...updatedRow.columns]
            const updatedColumn = { ...columns[colIndex] }
            updatedColumn.elements = updatedColumn.elements.filter((_, i) => i !== elIndex)
            columns[colIndex] = updatedColumn
            updatedRow.columns = columns
            rows[rowIndex] = updatedRow
            updatedPage.rows = rows
            pages[pageIndex] = updatedPage
            return { ...prev, pages }
        })
    }, [pageIndex, rowIndex, colIndex, elIndex, setDoc])

    return (
        <div className="group/el relative p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-800">
            {/* Element Controls */}
            <div className="absolute -top-2 -right-2 opacity-0 group-hover/el:opacity-100 transition-opacity">
                <button
                    onClick={deleteElement}
                    className="p-0.5 rounded-full bg-danger text-white hover:bg-danger/80"
                >
                    <iconify-icon icon="tabler:x" width="12"></iconify-icon>
                </button>
            </div>

            {/* Element Content */}
            {element.type === 'text' && (
                <div
                    dangerouslySetInnerHTML={{ __html: element.content || 'Texte...' }}
                    className="text-sm"
                />
            )}
            {element.type === 'image' && (
                <img
                    src={element.src}
                    alt={element.alt || ''}
                    className="max-w-full h-auto rounded"
                />
            )}
            {!element.type && (
                <div className="text-xs text-gray-400">Élément</div>
            )}
        </div>
    )
}

// Designer Mode Content
function DesignerModeContent({ page, pageIndex, doc, setDoc }) {
    return (
        <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                Mode Designer - Glissez des éléments ici
            </div>
            {/* Free-positioned elements would go here */}
        </div>
    )
}
