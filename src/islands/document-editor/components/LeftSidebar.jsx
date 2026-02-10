/**
 * LeftSidebar Component
 * Icon buttons for text, gallery, layout, dynamic content panels
 * 1:1 parity with editor-left-sidebar.ejs
 */
import React from 'react'
import SettingsPanel from './SettingsPanel'

export default function LeftSidebar({
    activeTab,
    setActiveTab,
    insertVariableToken,
    isSettingsOpen,
    onSettingsToggle,
    settingsPanelProps
}) {
    const toggleTab = (tab) => {
        setActiveTab(activeTab === tab ? null : tab)
    }

    return (
        <div className="relative flex">
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

                {/* Spacer to push settings to bottom */}
                <div className="flex-1"></div>

                {/* Settings Button */}
                <button
                    className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${isSettingsOpen
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Paramètres du document"
                    onClick={onSettingsToggle}
                >
                    <iconify-icon icon="solar:settings-bold-duotone" width="24"></iconify-icon>
                </button>
            </div>

            {/* Panel Content */}
            {activeTab && (
                <div className="absolute top-0 bottom-0 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col z-20 shadow-xl" style={{ width: '204px', marginLeft: '65px' }}>
                    {/* Panel Header */}
                    <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-200">
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
            {/* Settings Panel - rendered here to share relative positioning context */}
            {settingsPanelProps && <SettingsPanel {...settingsPanelProps} />}
        </div>
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
                    className="sortable-source px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-move hover:border-primary hover:bg-primary/5 transition-colors"
                    data-element-type="heading"
                    draggable="true"
                    onDragStart={(e) => {
                        e.dataTransfer.setData('text/html', '<h1>Titre</h1><br><br>')
                        e.dataTransfer.setData('text/plain', 'Titre')
                        e.dataTransfer.effectAllowed = 'copy'
                    }}
                >
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <iconify-icon icon="tabler:heading" width="20"></iconify-icon>
                        <span className="text-sm font-medium">Titre</span>
                    </div>
                </div>

                <div
                    className="sortable-source px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-move hover:border-primary hover:bg-primary/5 transition-colors"
                    data-element-type="paragraph"
                    draggable="true"
                    onDragStart={(e) => {
                        e.dataTransfer.setData('text/html', '<p>Paragraphe de texte...</p><br><br>')
                        e.dataTransfer.setData('text/plain', 'Paragraphe de texte...')
                        e.dataTransfer.effectAllowed = 'copy'
                    }}
                >
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <iconify-icon icon="tabler:text-size" width="20"></iconify-icon>
                        <span className="text-sm font-medium">Paragraphe</span>
                    </div>
                </div>

                <div
                    className="sortable-source px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-move hover:border-primary hover:bg-primary/5 transition-colors"
                    data-element-type="divider"
                    draggable="true"
                    onDragStart={(e) => {
                        // Container 100% width qui réagit aux alignements, avec élément resizable à l'intérieur
                        const html = `<div class="doc-separator-container" style="width: 100%; display: block; margin: 16px 0;" tabindex="0">
                            <div class="doc-separator-line" style="border-top: 2px solid #e5e7eb; display: inline-block; position: relative; min-height: 8px; width: 100%; cursor: pointer;">
                                <div class="doc-resize-handle" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 20px; background: #3b82f6; border-radius: 4px; cursor: ew-resize; opacity: 0; transition: opacity 0.2s;" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0'" onmousedown="(function(e){e.preventDefault();e.stopPropagation();const line=e.target.parentElement;const startX=e.clientX;const startW=line.offsetWidth;const onMouseMove=function(ev){const dx=ev.clientX-startX;const newW=Math.max(50,startW+dx);line.style.width=newW+'px';};const onMouseUp=function(){document.removeEventListener('mousemove',onMouseMove);document.removeEventListener('mouseup',onMouseUp);};document.addEventListener('mousemove',onMouseMove);document.addEventListener('mouseup',onMouseUp);})(event)"></div>
                            </div>
                        </div><br><br>`
                        e.dataTransfer.setData('text/html', html)
                        e.dataTransfer.setData('text/plain', '---')
                        e.dataTransfer.effectAllowed = 'copy'
                    }}
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

// Gallery Panel Component with Integration Engine Search
function GalleryPanel() {
    const [searchQuery, setSearchQuery] = React.useState('')
    const [photos, setPhotos] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [hasMore, setHasMore] = React.useState(false)
    const [searched, setSearched] = React.useState(false)
    const [error, setError] = React.useState(null)

    const demoImages = [
        '/images/blog_1st.png',
        '/images/blog_2nd.png',
        '/images/blog_4th.png',
        '/images/blog_5th.png',
        '/images/blog_6th.png',
        '/images/blog_7th.png',
        '/images/test.png',
        '/images/test2.png'
    ]

    // Get account number from URL
    const getAccountNumber = () => {
        const match = window.location.pathname.match(/\/account\/([^/]+)/)
        return match ? match[1] : null
    }

    const searchPhotos = async (query, pageNum = 1, append = false) => {
        if (!query.trim()) return

        setLoading(true)
        setError(null)

        try {
            const accountNumber = getAccountNumber()
            if (!accountNumber) {
                throw new Error('Account number not found')
            }

            // Call Integration Engine action
            const response = await fetch(`/account/${accountNumber}/integrations/unsplash/actions/search-photos/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    input: {
                        query,
                        per_page: 8,
                        page: pageNum
                    }
                })
            })

            const result = await response.json()

            if (result.success && result.data) {
                // Transform Unsplash response (mapped via responseMapping: photos, total, totalPages)
                const rawPhotos = result.data.photos || result.data.results || []
                const newPhotos = rawPhotos.map(photo => ({
                    id: photo.id,
                    url: photo.urls?.regular || photo.urls?.small,
                    thumb: photo.urls?.thumb || photo.urls?.small,
                    alt: photo.alt_description || photo.description || 'Photo',
                    author: photo.user?.name || 'Unknown'
                }))

                if (append) {
                    setPhotos(prev => [...prev, ...newPhotos])
                } else {
                    setPhotos(newPhotos)
                }

                const totalPages = result.data.totalPages || result.data.total_pages || 1
                setHasMore(pageNum < totalPages)
                setPage(pageNum)
                setSearched(true)
            } else {
                setError(result.error || 'Erreur lors de la recherche')
            }
        } catch (err) {
            console.error('Search error:', err)
            setError(err.message || 'Erreur de connexion')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        searchPhotos(searchQuery, 1, false)
    }

    const loadMore = () => {
        searchPhotos(searchQuery, page + 1, true)
    }

    const clearSearch = () => {
        setSearchQuery('')
        setPhotos([])
        setSearched(false)
        setPage(1)
        setHasMore(false)
        setError(null)
    }

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des photos..."
                    className="form-input w-full pr-8 text-sm dark:bg-gray-800 dark:border-gray-800"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <iconify-icon icon="tabler:x" width="14"></iconify-icon>
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                    <iconify-icon icon="tabler:search" width="16"></iconify-icon>
                </button>
            </form>

            {/* Error */}
            {error && (
                <div className="text-xs text-danger bg-danger/10 p-2 rounded">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && !photos.length && (
                <div className="flex items-center justify-center py-8">
                    <iconify-icon icon="tabler:loader-2" width="24" className="animate-spin text-primary"></iconify-icon>
                </div>
            )}

            {/* Unsplash Results */}
            {searched && photos.length > 0 && (
                <>
                    <p className="text-xs text-gray-500">
                        Résultats Unsplash — Glissez une image sur la page.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                draggable="true"
                                onDragStart={(e) => {
                                    const html = `<img src="${photo.url}" alt="${photo.alt}" style="max-width: 100%; height: auto; display: block;" /><br><br>`
                                    e.dataTransfer.setData('text/html', html)
                                    e.dataTransfer.effectAllowed = 'copy'
                                }}
                                className="relative group cursor-move rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors aspect-video"
                                title={`Photo par ${photo.author}`}
                            >
                                <img
                                    src={photo.thumb}
                                    alt={photo.alt}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <iconify-icon
                                        icon="tabler:grip-horizontal"
                                        width="20"
                                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                                    ></iconify-icon>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <iconify-icon icon="tabler:loader-2" width="16" className="animate-spin"></iconify-icon>
                                    Chargement...
                                </>
                            ) : (
                                <>
                                    <iconify-icon icon="tabler:chevron-down" width="16"></iconify-icon>
                                    Charger plus
                                </>
                            )}
                        </button>
                    )}
                </>
            )}

            {/* No Results */}
            {searched && photos.length === 0 && !loading && (
                <div className="text-center py-6 text-gray-500">
                    <iconify-icon icon="tabler:photo-off" width="32" className="mb-2"></iconify-icon>
                    <p className="text-sm">Aucun résultat trouvé</p>
                </div>
            )}

            {/* Demo Images (shown when no search) */}
            {!searched && (
                <>
                    <p className="text-xs text-gray-500">
                        Glissez une image sur la page.
                    </p>

                    <button className="w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                        <div className="flex items-center justify-between gap-2 text-gray-500">
                            <iconify-icon icon="tabler:upload" width="20"></iconify-icon>
                            <span className="text-sm">Importer</span>
                        </div>
                    </button>

                    {/* Demo Images Grid */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        {demoImages.map((imageSrc, index) => (
                            <div
                                key={index}
                                draggable="true"
                                onDragStart={(e) => {
                                    const html = `<img src="${imageSrc}" style="max-width: 100%; height: auto; display: block;" /><br><br>`
                                    e.dataTransfer.setData('text/html', html)
                                    e.dataTransfer.effectAllowed = 'copy'
                                }}
                                className="relative group cursor-move rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors aspect-video"
                            >
                                <img
                                    src={imageSrc}
                                    alt={`Demo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <iconify-icon
                                        icon="tabler:grip-horizontal"
                                        width="20"
                                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    ></iconify-icon>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
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
