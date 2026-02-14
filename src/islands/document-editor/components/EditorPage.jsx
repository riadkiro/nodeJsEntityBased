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

        const handleMouseOver = (e) => {
            // Find the closest block element that is a direct child of the page
            const block = e.target.closest(BLOCK_SELECTORS)
            if (!block || block.parentElement !== el) return

            // Don't add duplicate buttons
            if (block.querySelector('.doc-block-delete-btn')) return

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
            const block = e.target.closest(BLOCK_SELECTORS)
            if (!block || block.parentElement !== el) return

            // Check if mouse is still inside the block
            const related = e.relatedTarget
            if (related && block.contains(related)) return

            // Remove delete button
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

    return (
        <div
            className={`bg-white shadow-2xl relative transition-shadow ${isSelected ? 'ring-2 ring-primary/20' : ''
                }`}
            style={{
                width: `${width}px`,
                minHeight: `${height}px`,
                backgroundColor: page.background || '#ffffff'
            }}
            onClick={onSelect}
        >
            {/* Edition Mode */}
            {page.mode === 'edition' && (
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none min-h-full text-black"
                    style={{
                        padding: `${top}px ${right}px ${bottom}px ${left}px`,
                        minHeight: `${height}px`,
                        maxHeight: `${height}px`,
                        overflow: 'hidden',
                        color: '#000000' // Force black text regardless of dark mode
                    }}
                    onInput={(e) => handlePageInput(e, pageIndex)}
                    onPaste={(e) => handlePaste(e, pageIndex)}
                    onKeyDown={(e) => handleKeyDown?.(e, pageIndex, contentRef)}
                    onDrop={handleEditionDrop}
                    onDragOver={handleDragOver}
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
