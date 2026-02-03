/**
 * CanvasContainer Component
 * Scrollable container with page components, page mode switcher, page labels
 * 1:1 parity with editor-canvas.ejs
 */
import React, { forwardRef, useState, useEffect } from 'react'
import EditorPage from './EditorPage'

const CanvasContainer = forwardRef(function CanvasContainer({
    doc,
    setDoc,
    pageRefs,
    selectedPageIndex,
    setSelectedPageIndex,
    editorMode,
    isGlobalSelection,
    handlePageInput,
    handlePaste,
    handleKeyDown,
    setPageMode,
    addPage
}, ref) {
    // Detect dark mode from document
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'))
        }
        checkDarkMode()

        // Watch for dark mode changes
        const observer = new MutationObserver(checkDarkMode)
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])

    return (
        <div className="flex-1 flex flex-col min-w-0 dark:bg-gray-800 overflow-hidden">
            {/* Canvas Area */}
            <div
                ref={ref}
                className="flex-1 overflow-auto p-8"
                style={{
                    scrollbarColor: '#64748b transparent',
                    scrollbarWidth: 'thin',
                }}
            >
                <div className="flex flex-col items-center gap-8" style={{ backgroundColor: isDark ? '#1f2937' : 'transparent', marginTop: '47px' }}>
                    {doc.pages.map((page, pageIndex) => (
                        <div key={pageIndex} className="relative">
                            {/* Page Label */}
                            <div className="absolute -top-6 left-0 right-0 flex items-center justify-center">
                                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded">
                                    Page {pageIndex + 1}
                                </span>
                            </div>

                            {/* Mode Switcher */}
                            <div
                                className="mode-switcher absolute -top-6 right-0 flex items-center gap-1 dark:bg-gray-800 rounded-lg px-1 py-0.5 shadow-sm border-0 dark:border-gray-800"
                                data-print-hide="true"
                                style={{ marginTop: '-38px' }}
                            >
                                <button
                                    onClick={() => setPageMode(pageIndex, 'edition')}
                                    className={`px-2 py-0.5 text-[10px] rounded-lg transition-colors ${page.mode === 'edition'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Édition
                                </button>
                                <button
                                    onClick={() => setPageMode(pageIndex, 'layout')}
                                    className={`px-2 py-0.5 text-[10px] rounded-lg transition-colors ${page.mode === 'layout'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Layout
                                </button>
                                <button
                                    onClick={() => setPageMode(pageIndex, 'designer')}
                                    className={`px-2 py-0.5 text-[10px] rounded-lg transition-colors ${page.mode === 'designer'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Designer
                                </button>
                            </div>

                            {/* Page */}
                            <EditorPage
                                page={page}
                                pageIndex={pageIndex}
                                doc={doc}
                                setDoc={setDoc}
                                pageRefs={pageRefs}
                                isSelected={selectedPageIndex === pageIndex}
                                onSelect={() => setSelectedPageIndex(pageIndex)}
                                handlePageInput={handlePageInput}
                                handlePaste={handlePaste}
                                handleKeyDown={handleKeyDown}
                                isGlobalSelection={isGlobalSelection}
                            />
                        </div>
                    ))}

                    {/* Add Page Button */}
                    <button
                        onClick={addPage}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-primary border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg hover:border-primary transition-colors"
                        data-print-hide="true"
                    >
                        <iconify-icon icon="tabler:plus" width="18"></iconify-icon>
                        <span className="text-sm">Ajouter une page</span>
                    </button>
                </div>
            </div>
        </div>
    )
})

export default CanvasContainer
