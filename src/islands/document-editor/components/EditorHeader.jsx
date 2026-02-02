/**
 * EditorHeader Component
 * Header with document name, formatting toolbar, save timestamp, and PDF button
 * 1:1 parity with editor-header.ejs
 */
import React from 'react'

export default function EditorHeader({
    doc,
    setDoc,
    lastSaved,
    triggerSave,
    handlePdfExport,
    // Formatting props
    currentFont,
    currentFontSize,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    currentAlignment,
    currentLineHeight,
    currentLetterSpacing,
    handleFormat,
    handleFontSizeChange,
    handleLineSpacingChange,
    handleLetterSpacingChange,
    FONT_FAMILIES,
    FONT_SIZES
}) {
    const handleNameChange = (e) => {
        setDoc(prev => ({ ...prev, name: e.target.value }))
        triggerSave()
    }

    const formatSavedTime = () => {
        if (!lastSaved) return null
        const now = new Date()
        const diff = Math.floor((now - lastSaved) / 1000)
        if (diff < 60) return `Saved ${diff}s ago`
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
        return lastSaved.toLocaleTimeString()
    }

    return (
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex flex-col">
            {/* Top Row: Title and Actions */}
            <div className="flex items-center px-4 py-2 border-b dark:border-gray-800">
                {/* Back Button */}
                <a
                    href={`/account/${doc.accountNumber || ''}/documents`}
                    className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                    <iconify-icon icon="tabler:arrow-left" width="20"></iconify-icon>
                </a>

                {/* Document Name */}
                <input
                    type="text"
                    value={doc.name}
                    onChange={handleNameChange}
                    className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white flex-1 min-w-0"
                    placeholder="Document sans titre"
                />

                {/* Save Status */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mr-4">
                    {formatSavedTime() && (
                        <>
                            <iconify-icon icon="tabler:cloud-check" width="16" className="text-green-500"></iconify-icon>
                            <span>{formatSavedTime()}</span>
                        </>
                    )}
                </div>

                {/* PDF Button */}
                <button
                    onClick={handlePdfExport}
                    disabled={!doc._id}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <iconify-icon icon="tabler:file-type-pdf" width="18"></iconify-icon>
                    <span>PDF</span>
                </button>
            </div>

            {/* Toolbar Row */}
            <div className="flex items-center px-4 py-1.5 gap-1 flex-wrap">
                {/* Font Family */}
                <select
                    value={currentFont}
                    onChange={(e) => handleFormat('fontName', e.target.value)}
                    className="form-select text-xs py-1 px-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg w-32"
                >
                    {FONT_FAMILIES.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                </select>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Font Size */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => handleFontSizeChange(Math.max(8, currentFontSize - 1))}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    >
                        <iconify-icon icon="tabler:minus" width="14"></iconify-icon>
                    </button>
                    <input
                        type="number"
                        value={currentFontSize}
                        onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 16)}
                        className="w-10 text-center text-xs py-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded"
                    />
                    <button
                        onClick={() => handleFontSizeChange(Math.min(72, currentFontSize + 1))}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    >
                        <iconify-icon icon="tabler:plus" width="14"></iconify-icon>
                    </button>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Bold */}
                <button
                    onClick={() => handleFormat('bold')}
                    className={`p-1.5 rounded-lg transition-colors ${isBold ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Gras (Ctrl+B)"
                >
                    <iconify-icon icon="tabler:bold" width="18"></iconify-icon>
                </button>

                {/* Italic */}
                <button
                    onClick={() => handleFormat('italic')}
                    className={`p-1.5 rounded-lg transition-colors ${isItalic ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Italique (Ctrl+I)"
                >
                    <iconify-icon icon="tabler:italic" width="18"></iconify-icon>
                </button>

                {/* Underline */}
                <button
                    onClick={() => handleFormat('underline')}
                    className={`p-1.5 rounded-lg transition-colors ${isUnderline ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Souligné (Ctrl+U)"
                >
                    <iconify-icon icon="tabler:underline" width="18"></iconify-icon>
                </button>

                {/* Strikethrough */}
                <button
                    onClick={() => handleFormat('strikeThrough')}
                    className={`p-1.5 rounded-lg transition-colors ${isStrikethrough ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Barré"
                >
                    <iconify-icon icon="tabler:strikethrough" width="18"></iconify-icon>
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Alignment */}
                <button
                    onClick={() => handleFormat('justifyLeft')}
                    className={`p-1.5 rounded-lg transition-colors ${currentAlignment === 'left' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Aligner à gauche"
                >
                    <iconify-icon icon="tabler:align-left" width="18"></iconify-icon>
                </button>
                <button
                    onClick={() => handleFormat('justifyCenter')}
                    className={`p-1.5 rounded-lg transition-colors ${currentAlignment === 'center' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Centrer"
                >
                    <iconify-icon icon="tabler:align-center" width="18"></iconify-icon>
                </button>
                <button
                    onClick={() => handleFormat('justifyRight')}
                    className={`p-1.5 rounded-lg transition-colors ${currentAlignment === 'right' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Aligner à droite"
                >
                    <iconify-icon icon="tabler:align-right" width="18"></iconify-icon>
                </button>
                <button
                    onClick={() => handleFormat('justifyFull')}
                    className={`p-1.5 rounded-lg transition-colors ${currentAlignment === 'justify' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                    title="Justifier"
                >
                    <iconify-icon icon="tabler:align-justified" width="18"></iconify-icon>
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Line Spacing */}
                <div className="relative group">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center gap-1">
                        <iconify-icon icon="tabler:line-height" width="18"></iconify-icon>
                        <span className="text-[10px]">{currentLineHeight}</span>
                    </button>
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg py-1 hidden group-hover:block z-50 min-w-[80px]">
                        {[1, 1.15, 1.5, 2, 2.5, 3].map(val => (
                            <button
                                key={val}
                                onClick={() => handleLineSpacingChange(val)}
                                className={`w-full px-3 py-1 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${currentLineHeight === val ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Letter Spacing */}
                <div className="relative group">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center gap-1">
                        <iconify-icon icon="tabler:letter-spacing" width="18"></iconify-icon>
                        <span className="text-[10px]">{currentLetterSpacing}px</span>
                    </button>
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg py-1 hidden group-hover:block z-50 min-w-[80px]">
                        {[-2, -1, 0, 1, 2, 3, 4, 5].map(val => (
                            <button
                                key={val}
                                onClick={() => handleLetterSpacingChange(val)}
                                className={`w-full px-3 py-1 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${currentLetterSpacing === val ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                {val}px
                            </button>
                        ))}
                    </div>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Lists */}
                <button
                    onClick={() => handleFormat('insertUnorderedList')}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Liste à puces"
                >
                    <iconify-icon icon="tabler:list" width="18"></iconify-icon>
                </button>
                <button
                    onClick={() => handleFormat('insertOrderedList')}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Liste numérotée"
                >
                    <iconify-icon icon="tabler:list-numbers" width="18"></iconify-icon>
                </button>
            </div>
        </header>
    )
}
