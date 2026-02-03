/**
 * SettingsPanel Component
 * Popup panel for document settings (previously in RightSidebar)
 * Opens via settings button in LeftSidebar toolbar
 */
import React from 'react'

export default function SettingsPanel({
    isOpen,
    onClose,
    doc,
    setDoc,
    openSections,
    setOpenSections,
    selectedPageIndex,
    setSelectedPageIndex,
    updateDimensions,
    addPage,
    duplicatePage,
    deletePage
}) {
    if (!isOpen) return null

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const handleChange = (field, value) => {
        setDoc(prev => ({ ...prev, [field]: value }))
    }

    const handleMarginChange = (side, value) => {
        const numValue = parseInt(value) || 0
        setDoc(prev => ({
            ...prev,
            margins: { ...prev.margins, [side]: numValue }
        }))
    }

    const handleFormatChange = (e) => {
        handleChange('format', e.target.value)
        updateDimensions(e.target.value, doc.orientation)
    }

    const handleOrientationChange = (e) => {
        handleChange('orientation', e.target.value)
        updateDimensions(doc.format, e.target.value)
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute top-0 bottom-0 z-50 bg-white dark:bg-gray-900 border-r dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col" style={{ width: '204px', marginLeft: '65px' }}>
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-200">Propriétés</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                    >
                        <iconify-icon icon="tabler:x" width="16"></iconify-icon>
                    </button>
                </div>

                <div className="flex-1 overflow-auto" style={{ scrollbarColor: '#64748b transparent', scrollbarWidth: 'thin' }}>
                    {/* Section: Information */}
                    <div className="border-b dark:border-gray-800">
                        <button
                            onClick={() => toggleSection('info')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <iconify-icon icon="tabler:info-circle" width="20" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                <span className="text-sm font-bold text-gray-200">Général</span>
                            </div>
                            <iconify-icon
                                icon={openSections.info ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                                width="16"
                                className="text-gray-400"
                            ></iconify-icon>
                        </button>

                        {openSections.info && (
                            <div className="px-4 pb-4 space-y-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        <iconify-icon icon="tabler:file-text" width="14"></iconify-icon>
                                        Nom du document
                                    </label>
                                    <input
                                        type="text"
                                        value={doc.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="form-input bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-800 text-sm focus:ring-primary/20 w-full"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <iconify-icon icon="tabler:dimensions" width="14"></iconify-icon>
                                            Format
                                        </label>
                                        <select
                                            value={doc.format}
                                            onChange={handleFormatChange}
                                            className="form-select w-full text-xs py-1.5 focus:ring-primary/20 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800"
                                        >
                                            <option value="A4">A4</option>
                                            <option value="A5">A5</option>
                                            <option value="A3">A3</option>
                                            <option value="Letter">Letter</option>
                                            <option value="Legal">Legal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <iconify-icon icon="tabler:rotate" width="14"></iconify-icon>
                                            Orientation
                                        </label>
                                        <select
                                            value={doc.orientation}
                                            onChange={handleOrientationChange}
                                            className="form-select w-full text-xs py-1.5 focus:ring-primary/20 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800"
                                        >
                                            <option value="portrait">Portrait</option>
                                            <option value="landscape">Paysage</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <iconify-icon icon="tabler:flag" width="14"></iconify-icon>
                                        Statut
                                    </label>
                                    <select
                                        value={doc.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="form-select w-full text-xs py-1.5 focus:ring-primary/20 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800"
                                    >
                                        <option value="draft">Brouillon</option>
                                        <option value="published">Publié</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section: Margins */}
                    <div className="border-b dark:border-gray-800">
                        <button
                            onClick={() => toggleSection('margins')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <iconify-icon icon="tabler:layout-padding-left" width="20" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                <span className="text-sm font-bold text-gray-200">Marges de page</span>
                            </div>
                            <iconify-icon
                                icon={openSections.margins ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                                width="16"
                                className="text-gray-400"
                            ></iconify-icon>
                        </button>

                        {openSections.margins && (
                            <div className="px-4 pb-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Haut</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={doc.margins.top}
                                                onChange={(e) => handleMarginChange('top', e.target.value)}
                                                className="form-input pl-2 pr-8 py-1.5 text-sm w-full"
                                                min="0"
                                                max="200"
                                            />
                                            <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">px</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Bas</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={doc.margins.bottom}
                                                onChange={(e) => handleMarginChange('bottom', e.target.value)}
                                                className="form-input pl-2 pr-8 py-1.5 text-sm w-full"
                                                min="0"
                                                max="200"
                                            />
                                            <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">px</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Gauche</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={doc.margins.left}
                                                onChange={(e) => handleMarginChange('left', e.target.value)}
                                                className="form-input pl-2 pr-8 py-1.5 text-sm w-full"
                                                min="0"
                                                max="200"
                                            />
                                            <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">px</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Droite</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={doc.margins.right}
                                                onChange={(e) => handleMarginChange('right', e.target.value)}
                                                className="form-input pl-2 pr-8 py-1.5 text-sm w-full"
                                                min="0"
                                                max="200"
                                            />
                                            <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">px</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section: Pages */}
                    <div className="border-b dark:border-gray-800">
                        <div
                            onClick={() => toggleSection('pages')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <iconify-icon icon="tabler:files" width="20" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-200">Pages</span>
                                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {doc.pages.length}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); addPage(); }}
                                    className="w-6 h-6 rounded-full hover:bg-primary/10 text-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                                >
                                    <iconify-icon icon="tabler:plus" width="18"></iconify-icon>
                                </button>
                                <iconify-icon
                                    icon={openSections.pages ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                                    width="16"
                                    className="text-gray-400"
                                ></iconify-icon>
                            </div>
                        </div>

                        {openSections.pages && (
                            <div className="px-2 pb-4">
                                <div className="space-y-1 max-h-[250px] overflow-auto px-2">
                                    {doc.pages.map((page, index) => (
                                        <div
                                            key={index}
                                            className={`group/page flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer relative ${selectedPageIndex === index
                                                ? 'bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                            onClick={() => setSelectedPageIndex(index)}
                                        >
                                            <div className={`w-8 h-10 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600 flex items-center justify-center shadow-xs group-hover/page:scale-105 transition-transform ${selectedPageIndex === index ? 'border-primary/30 ring-2 ring-primary/10' : ''
                                                }`}>
                                                <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold truncate ${selectedPageIndex === index ? 'text-primary' : 'text-gray-200'
                                                    }`}>
                                                    Page {index + 1}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {(page.elements || []).length} élément(s)
                                                </p>
                                            </div>
                                            <div className="opacity-0 group-hover/page:opacity-100 transition-opacity flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                                                    className="p-1 text-gray-400 hover:text-primary"
                                                >
                                                    <iconify-icon icon="tabler:copy" width="14"></iconify-icon>
                                                </button>
                                                {doc.pages.length > 1 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deletePage(index); }}
                                                        className="p-1 text-gray-400 hover:text-danger"
                                                    >
                                                        <iconify-icon icon="tabler:trash" width="14"></iconify-icon>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
