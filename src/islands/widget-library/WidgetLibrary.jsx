/**
 * WidgetLibrary — Browsable & Draggable Widget Catalog
 * 
 * Features:
 * - Category tabs (Timeline, KPI, Lists, Charts, Actions, All)
 * - Search filter
 * - Grid/List view toggle
 * - Each widget card shows: Icon, name, description, variant info
 * - Drag support: cards emit custom events for Page/Cockpit Builder consumption
 * - Live mini-preview inside each card
 * - Dark/light mode support
 * 
 * Data-driven: widgets are defined in a static catalog + API augmentation
 */
import React, { useState, useMemo, useCallback } from 'react'
import WidgetCard from './components/WidgetCard'

// ============================================================================
// WIDGET CATALOG — Static definitions for all available widgets
// ============================================================================
const WIDGET_CATALOG = [
    // ── Timeline Widgets ──
    {
        id: 'timeline-profile',
        name: 'Timeline Profil',
        description: 'Timeline avec avatars, noms, contenus et miniatures. Idéal pour les flux d\'activité.',
        category: 'timeline',
        icon: 'solar:user-bold-duotone',
        color: 'primary',
        blockType: 'timeline-widget',
        defaultProps: { variant: 'profile' },
        preview: 'profile',
        tags: ['timeline', 'social', 'feed', 'activity'],
    },
    {
        id: 'timeline-modern',
        name: 'Timeline Moderne',
        description: 'Timeline centrée avec cartes alternées gauche/droite, images et boutons d\'action.',
        category: 'timeline',
        icon: 'solar:layers-bold-duotone',
        color: 'info',
        blockType: 'timeline-widget',
        defaultProps: { variant: 'modern' },
        preview: 'modern',
        tags: ['timeline', 'cards', 'alternating', 'modern'],
    },
    {
        id: 'timeline-basic',
        name: 'Timeline Basique',
        description: 'Timeline compacte avec points colorés et heures. Idéal pour les logs d\'événements.',
        category: 'timeline',
        icon: 'solar:list-bold-duotone',
        color: 'success',
        blockType: 'timeline-widget',
        defaultProps: { variant: 'basic' },
        preview: 'basic',
        tags: ['timeline', 'events', 'log', 'compact'],
    },
    {
        id: 'timeline-images',
        name: 'Timeline avec Images',
        description: 'Timeline horizontale avec photos d\'utilisateurs et descriptions. Style épuré.',
        category: 'timeline',
        icon: 'solar:gallery-bold-duotone',
        color: 'warning',
        blockType: 'timeline-widget',
        defaultProps: { variant: 'images' },
        preview: 'images',
        tags: ['timeline', 'images', 'avatars', 'team'],
    },

    // ── KPI Widgets ──
    {
        id: 'kpi-cards',
        name: 'KPI Cards',
        description: 'Grille de 4 indicateurs KPI avec couleurs et mapping dynamique.',
        category: 'kpi',
        icon: 'solar:chart-square-bold-duotone',
        color: 'primary',
        blockType: 'kpi-cards',
        defaultProps: {},
        tags: ['kpi', 'metrics', 'dashboard', 'numbers'],
    },
    {
        id: 'statistics',
        name: 'Statistiques',
        description: 'Double sparkline charts pour Total Visits / Paid Visits avec tendances.',
        category: 'kpi',
        icon: 'solar:chart-bold-duotone',
        color: 'danger',
        blockType: 'statistics',
        defaultProps: {},
        tags: ['statistics', 'charts', 'sparkline', 'trends'],
    },

    // ── List Widgets ──
    {
        id: 'work-queue',
        name: 'File d\'attente',
        description: 'Liste interactive avec statuts, avatars et actions inline. Pour queues opérationnelles.',
        category: 'lists',
        icon: 'solar:queue-bold-duotone',
        color: 'info',
        blockType: 'work-queue',
        defaultProps: {},
        tags: ['queue', 'list', 'operations', 'waiting'],
    },
    {
        id: 'progress-list',
        name: 'Liste de Progression',
        description: 'Barres de progression avec icônes, labels et pourcentages. Suivi de tâches/métriques.',
        category: 'lists',
        icon: 'solar:checklist-bold-duotone',
        color: 'success',
        blockType: 'progress-list',
        defaultProps: {},
        tags: ['progress', 'bars', 'tasks', 'completion'],
    },
    {
        id: 'activity-feed',
        name: 'Flux d\'Activité',
        description: 'Journal d\'événements chronologique avec icônes colorées et densité compacte.',
        category: 'lists',
        icon: 'solar:history-bold-duotone',
        color: 'warning',
        blockType: 'activity-feed',
        defaultProps: {},
        tags: ['activity', 'log', 'feed', 'events'],
    },

    // ── Special Widgets ──
    {
        id: 'focus-card',
        name: 'Focus Card',
        description: 'Carte hero haute visibilité pour le prochain élément prioritaire.',
        category: 'special',
        icon: 'solar:star-bold-duotone',
        color: 'primary',
        blockType: 'focus-card',
        defaultProps: {},
        tags: ['focus', 'hero', 'priority', 'next'],
    },
    {
        id: 'urgency-radar',
        name: 'Radar Urgences',
        description: 'Traqueur d\'alertes critiques avec bande danger et boutons d\'action.',
        category: 'special',
        icon: 'solar:danger-triangle-bold-duotone',
        color: 'danger',
        blockType: 'urgency-radar',
        defaultProps: {},
        tags: ['urgency', 'alerts', 'critical', 'radar'],
    },
    {
        id: 'comms-dock',
        name: 'Communication Dock',
        description: 'Hub de communication avec actions rapides et zone de messages.',
        category: 'special',
        icon: 'solar:chat-round-dots-bold-duotone',
        color: 'info',
        blockType: 'comms-dock',
        defaultProps: {},
        tags: ['communication', 'chat', 'actions', 'dock'],
    },
    {
        id: 'action-button',
        name: 'Bouton Action',
        description: 'Bouton d\'action configurable avec icône, couleur et taille personnalisables.',
        category: 'special',
        icon: 'solar:play-bold-duotone',
        color: 'success',
        blockType: 'action-button',
        defaultProps: { label: 'Action', color: 'primary', variant: 'solid', size: 'md' },
        tags: ['button', 'action', 'cta', 'trigger'],
    },
]

const CATEGORIES = [
    { id: 'all', label: 'Tous', icon: 'solar:widget-5-bold-duotone' },
    { id: 'timeline', label: 'Timeline', icon: 'solar:sort-by-time-bold-duotone' },
    { id: 'kpi', label: 'KPI', icon: 'solar:chart-square-bold-duotone' },
    { id: 'lists', label: 'Listes', icon: 'solar:list-check-bold-duotone' },
    { id: 'special', label: 'Spéciaux', icon: 'solar:star-bold-duotone' },
]

export default function WidgetLibrary({ accountNumber }) {
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

    const filteredWidgets = useMemo(() => {
        let widgets = WIDGET_CATALOG
        if (activeCategory !== 'all') {
            widgets = widgets.filter(w => w.category === activeCategory)
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            widgets = widgets.filter(w =>
                w.name.toLowerCase().includes(q) ||
                w.description.toLowerCase().includes(q) ||
                w.tags.some(t => t.includes(q))
            )
        }
        return widgets
    }, [search, activeCategory])

    const handleDragStart = useCallback((e, widget) => {
        const payload = {
            type: 'widget-library-item',
            blockType: widget.blockType,
            widgetId: widget.id,
            name: widget.name,
            icon: widget.icon,
            color: widget.color,
            defaultProps: widget.defaultProps,
        }
        e.dataTransfer.setData('application/json', JSON.stringify(payload))
        e.dataTransfer.setData('text/plain', widget.name)
        e.dataTransfer.effectAllowed = 'copy'

        // Also dispatch custom event for Alpine/builder consumption
        document.dispatchEvent(new CustomEvent('widget-drag-start', { detail: payload }))
    }, [])

    const handleDragEnd = useCallback(() => {
        document.dispatchEvent(new CustomEvent('widget-drag-end'))
    }, [])

    return (
        <div>
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Category tabs */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${activeCategory === cat.id
                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                    : 'bg-white dark:bg-[#1b2e4b] text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <iconify-icon icon={cat.icon} width="14"></iconify-icon>
                            {cat.label}
                            {cat.id !== 'all' && (
                                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${activeCategory === cat.id
                                        ? 'bg-white/20'
                                        : 'bg-gray-100 dark:bg-gray-600'
                                    }`}>
                                    {WIDGET_CATALOG.filter(w => w.category === cat.id).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search + View Toggle */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un widget..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="form-input w-56 rounded-lg border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs dark:border-gray-700 dark:bg-[#1b2e4b]"
                        />
                        <iconify-icon
                            icon="solar:magnifer-linear"
                            width="14"
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                        ></iconify-icon>
                    </div>
                    <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-[#1b2e4b] text-gray-500'}`}
                        >
                            <iconify-icon icon="solar:widget-4-bold" width="14"></iconify-icon>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white dark:bg-[#1b2e4b] text-gray-500'}`}
                        >
                            <iconify-icon icon="solar:list-bold" width="14"></iconify-icon>
                        </button>
                    </div>
                </div>
            </div>

            {/* Widget Grid / List */}
            {filteredWidgets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <iconify-icon icon="solar:box-minimalistic-bold-duotone" width="40" className="mb-2"></iconify-icon>
                    <p className="text-sm">Aucun widget trouvé pour "{search}"</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredWidgets.map(widget => (
                        <WidgetCard
                            key={widget.id}
                            widget={widget}
                            viewMode="grid"
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredWidgets.map(widget => (
                        <WidgetCard
                            key={widget.id}
                            widget={widget}
                            viewMode="list"
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </div>
            )}

            {/* Footer info */}
            <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
                <span>{filteredWidgets.length} widget{filteredWidgets.length > 1 ? 's' : ''} disponible{filteredWidgets.length > 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1">
                    <iconify-icon icon="solar:hand-shake-bold-duotone" width="14"></iconify-icon>
                    Glissez un widget vers le Builder pour l'ajouter
                </span>
            </div>
        </div>
    )
}
