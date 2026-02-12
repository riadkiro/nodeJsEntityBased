/**
 * TimelineWidget — Main React Island Component
 * 
 * Renders timeline data in 4 variants:
 * - profile: Social feed style with avatar, name, content, images
 * - modern: Centered vertical line with alternating cards + images
 * - basic: Simple left-aligned dot timeline with time labels
 * - images: Avatar-based timeline with descriptions
 * 
 * All variants are pixel-perfect replicas of the Vristo Timeline template
 * and fully support dark mode.
 * 
 * Props:
 *   variant:       'profile' | 'modern' | 'basic' | 'images'
 *   apiUrl:        URL to fetch timeline data (optional if items prop given)
 *   items:         Array of timeline items (optional, overrides apiUrl)
 *   maxItems:      Max items to display (0 = all)
 *   compact:       Boolean for compact mode
 *   accountNumber: Multi-tenant account number
 */
import React, { useState, useEffect, useCallback } from 'react'
import ProfileTimeline from './components/ProfileTimeline'
import ModernTimeline from './components/ModernTimeline'
import BasicTimeline from './components/BasicTimeline'
import ImagesTimeline from './components/ImagesTimeline'

const VARIANT_COMPONENTS = {
    profile: ProfileTimeline,
    modern: ModernTimeline,
    basic: BasicTimeline,
    images: ImagesTimeline,
}

export default function TimelineWidget({ variant = 'basic', apiUrl, items: propItems, maxItems = 0, compact = false, accountNumber }) {
    const [items, setItems] = useState(propItems || [])
    const [loading, setLoading] = useState(!propItems && !!apiUrl)
    const [error, setError] = useState(null)

    const fetchData = useCallback(async () => {
        if (!apiUrl) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(apiUrl, { credentials: 'include' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setItems(data.items || data)
        } catch (e) {
            console.error('[TimelineWidget] Fetch error:', e)
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [apiUrl])

    useEffect(() => {
        if (!propItems && apiUrl) {
            fetchData()
        }
    }, [propItems, apiUrl, fetchData])

    // Apply maxItems
    const displayItems = maxItems > 0 ? items.slice(0, maxItems) : items

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                </div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Chargement...</span>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-8 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-danger mb-2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-danger">{error}</p>
            </div>
        )
    }

    // Empty state
    if (!displayItems.length) {
        return (
            <div className="text-center py-8 text-gray-400">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <p className="text-sm">Aucun élément dans la timeline</p>
            </div>
        )
    }

    const Component = VARIANT_COMPONENTS[variant] || BasicTimeline

    return (
        <Component
            items={displayItems}
            compact={compact}
            accountNumber={accountNumber}
        />
    )
}
