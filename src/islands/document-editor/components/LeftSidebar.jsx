/**
 * LeftSidebar Component
 * Icon buttons for text, gallery, layout, dynamic content panels
 * 1:1 parity with editor-left-sidebar.ejs
 */
import React from 'react'

export default function LeftSidebar({
    activeTab,
    setActiveTab,
    insertVariableToken
}) {
    const toggleTab = (tab) => {
        setActiveTab(activeTab === tab ? null : tab)
    }

    return (
        <>
            {/* Toolbar (Left) */}
            <div className="w-16 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col items-center py-4 gap-4">
                {/* Text Tool */}
                <button
                    className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${activeTab === 'text'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Texte et Contenu"
                    onClick={() => toggleTab('text')}
                >
                    <iconify-icon icon="solar:text-bold-duotone" width="24"></iconify-icon>
                </button>

                {/* Gallery Tool */}
                <button
                    className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${activeTab === 'gallery'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Médiathèque"
                    onClick={() => toggleTab('gallery')}
                >
                    <iconify-icon icon="solar:gallery-bold-duotone" width="24"></iconify-icon>
                </button>

                <div className="h-px w-8 bg-gray-200 dark:bg-gray-700"></div>

                {/* Layout Tools */}
                <button
                    className="w-10 h-10 rounded-full bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 flex items-center justify-center text-gray-400"
                    title="Layout 2 colonnes"
                >
                    <iconify-icon icon="solar:layers-minimalistic-bold-duotone" width="24"></iconify-icon>
                </button>
                <button
                    className="w-10 h-10 rounded-full bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 flex items-center justify-center text-gray-400"
                    title="Layout 3 colonnes"
                >
                    <iconify-icon icon="solar:widget-4-bold-duotone" width="24"></iconify-icon>
                </button>

                <div className="h-px w-8 bg-gray-200 dark:bg-gray-700"></div>

                {/* Dynamic Content */}
                <button
                    className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${activeTab === 'dynamic-nav'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Contenu Dynamique"
                    onClick={() => toggleTab('dynamic-nav')}
                >
                    <iconify-icon icon="solar:database-bold-duotone" width="24"></iconify-icon>
                </button>
            </div>

            {/* Panel Content */}
            {activeTab && (
                <div className="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col">
                    {/* Panel Header */}
                    <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {activeTab === 'text' && 'Texte et Contenu'}
                            {activeTab === 'gallery' && 'Médiathèque'}
                            {activeTab === 'dynamic-nav' && 'Contenu Dynamique'}
                        </h3>
                        <button
                            onClick={() => setActiveTab(null)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                        >
                            <iconify-icon icon="tabler:x" width="16"></iconify-icon>
                        </button>
                    </div>

                    {/* Panel Body */}
                    <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-900" style={{ scrollbarColor: '#64748b transparent', scrollbarWidth: 'thin' }}>
                        {activeTab === 'text' && (
                            <TextPanel />
                        )}
                        {activeTab === 'gallery' && (
                            <GalleryPanel />
                        )}
                        {activeTab === 'dynamic-nav' && (
                            <DynamicNavPanel insertVariableToken={insertVariableToken} />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

// Text Panel Component
function TextPanel() {
    return (
        <div className="space-y-4">
            <p className="text-xs text-gray-500">
                Glissez un élément sur la page pour l'ajouter.
            </p>

            <div className="space-y-2">
                <div
                    className="sortable-source p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-move hover:border-primary hover:bg-primary/5 transition-colors"
                    data-element-type="heading"
                >
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <iconify-icon icon="tabler:heading" width="20"></iconify-icon>
                        <span className="text-sm font-medium">Titre</span>
                    </div>
                </div>

                <div
                    className="sortable-source p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-move hover:border-primary hover:bg-primary/5 transition-colors"
                    data-element-type="paragraph"
                >
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <iconify-icon icon="tabler:text-size" width="20"></iconify-icon>
                        <span className="text-sm font-medium">Paragraphe</span>
                    </div>
                </div>

                <div
                    className="sortable-source p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-move hover:border-primary hover:bg-primary/5 transition-colors"
                    data-element-type="divider"
                >
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <iconify-icon icon="tabler:separator-horizontal" width="20"></iconify-icon>
                        <span className="text-sm font-medium">Séparateur</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Gallery Panel Component
function GalleryPanel() {
    return (
        <div className="space-y-4">
            <p className="text-xs text-gray-500">
                Glissez une image sur la page.
            </p>

            <button className="w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                    <iconify-icon icon="tabler:upload" width="20"></iconify-icon>
                    <span className="text-sm">Importer une image</span>
                </div>
            </button>
        </div>
    )
}

// Dynamic Nav Panel Component
function DynamicNavPanel({ insertVariableToken }) {
    // Sample variables for demonstration
    const variables = [
        { path: 'record.title', label: 'Titre', fieldId: null },
        { path: 'record.createdAt', label: 'Date création', fieldId: null },
        { path: 'user.name', label: 'Utilisateur', fieldId: null }
    ]

    const handleClick = (variable) => {
        insertVariableToken(variable.path, {
            fieldId: variable.fieldId,
            label: variable.label,
            type: 'text'
        })
    }

    return (
        <div className="space-y-4">
            <p className="text-xs text-gray-500">
                Cliquez sur une variable pour l'insérer à la position du curseur.
            </p>

            <div className="space-y-1">
                {variables.map((variable, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(variable)}
                        className="w-full p-2 text-left rounded-lg hover:bg-primary/10 text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300"
                    >
                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-mono">
                            {`{{${variable.path}}}`}
                        </span>
                        <span className="text-gray-400">{variable.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
