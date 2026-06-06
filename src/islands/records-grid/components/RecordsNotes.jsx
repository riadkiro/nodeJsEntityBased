/**
 * RecordsNotes — Grid card view for RecordsGrid (Notes-style)
 * 
 * Displays records as a responsive grid of cards (like the Notes page)
 * NOT a Kanban — no columns, just a flat grid of cards.
 * 
 * Features:
 * - Responsive 4-column grid (like /notes page)
 * - Notes-style colored card backgrounds
 * - Avatar + date header, title + description body
 * - Favorite star + classification tag footer
 * - Dropdown menu with Edit/View actions
 */
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { recordModuleHref } from '../../shared/recordLinks'

// ─── Color palette for card backgrounds ──────────────────────────────
const CARD_COLORS = [
    { bg: 'bg-primary-light shadow-primary', text: 'text-primary', dot: '#4361ee' },
    { bg: 'bg-info-light shadow-info', text: 'text-info', dot: '#2196f3' },
    { bg: 'bg-warning-light shadow-warning', text: 'text-warning', dot: '#e2a03f' },
    { bg: 'bg-danger-light shadow-danger', text: 'text-danger', dot: '#e7515a' },
    { bg: 'bg-success-light shadow-success', text: 'text-success', dot: '#00ab55' },
    { bg: 'bg-secondary-light shadow-secondary', text: 'text-secondary', dot: '#805dca' },
]

function getStyleByIndex(idx) {
    return CARD_COLORS[idx % CARD_COLORS.length]
}

// ─── SVG Icons ───────────────────────────────────────────────────────
function DotsIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-5 w-5 rotate-90 opacity-70 hover:opacity-100">
            <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle opacity="0.5" cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="19" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function EditIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-4 w-4 ltr:mr-3 rtl:ml-3">
            <path d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z"
                stroke="currentColor" strokeWidth="1.5" />
            <path opacity="0.5" d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function ViewIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 ltr:mr-3 rtl:ml-3">
            <path opacity="0.5" d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z"
                stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function StarIcon({ filled }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`h-4.5 w-4.5 group-hover:fill-warning ${filled ? 'fill-warning' : ''}`}>
            <path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function TagDotIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-3 w-3 rotate-45">
            <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function DeleteIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
            <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path opacity="0.5" d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path opacity="0.5" d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path opacity="0.5" d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

// ─── Card Dropdown ───────────────────────────────────────────────────
function CardDropdown({ record, accountNumber, entitySlug }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const recordId = record._id?.$oid || record._id
    return (
        <div ref={ref} className="dropdown relative">
            <button type="button" className="text-primary" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open) }}>
                <DotsIcon />
            </button>
            {open && (
                <ul className="absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1"
                    style={{ animation: 'fadeIn 0.15s ease-out' }}>
                    <li>
                        <a href={recordModuleHref(accountNumber, entitySlug, record)}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                            onClick={(e) => e.stopPropagation()}>
                            <EditIcon /> Edit
                        </a>
                    </li>
                    <li>
                        <a href={recordModuleHref(accountNumber, entitySlug, record)}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                            onClick={(e) => e.stopPropagation()}>
                            <ViewIcon /> View
                        </a>
                    </li>
                </ul>
            )}
        </div>
    )
}

// ─── Single Note Card ────────────────────────────────────────────────
function NoteCard({ record, accountNumber, entitySlug, style, favorites, onToggleFav }) {
    const isFav = favorites[record._id] || false
    const recordId = record._id?.$oid || record._id
    const title = record.referenceTitle || record.title || record.computedTitle || 'Sans titre'

    const dateStr = record.createdAt
        ? new Date(record.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : ''

    // Get description from customFields
    const descField = (record.customFields || []).find(cf =>
        cf.field_id?.label?.toLowerCase().includes('descri') ||
        cf.field_id?.label?.toLowerCase().includes('note') ||
        cf.field_id?.label?.toLowerCase().includes('contenu')
    )
    const description = descField?.value || record.description || ''

    // Get classification labels for footer tag dot color
    const classLabels = (record.classificationValues || [])
        .filter(cv => cv.optionLabel)
        .map(cv => ({
            label: cv.optionLabel,
            color: cv.optionColor || cv.color || style.dot
        }))

    return (
        <div className={`panel pb-12 relative ${style.bg}`}>
            <div className="min-h-[142px]">
                {/* Top: avatar + dropdown */}
                <div className="flex justify-between">
                    <div className="flex w-max items-center">
                        <div className="flex-none">
                            <div className="rounded-full bg-gray-300 p-2 dark:bg-gray-700">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                                    <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                                    <ellipse opacity="0.5" cx="12" cy="17" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </div>
                        <div className="ltr:ml-2 rtl:mr-2">
                            <div className="font-semibold">{record.createdBy?.name || 'Utilisateur'}</div>
                            <div className="text-sx text-white-dark">{dateStr}</div>
                        </div>
                    </div>
                    <CardDropdown record={record} accountNumber={accountNumber} entitySlug={entitySlug} />
                </div>

                {/* Title + description */}
                <div>
                    <h4 className="mt-4 font-semibold">
                        <a href={recordModuleHref(accountNumber, entitySlug, record)}
                            className="hover:text-primary transition-colors">
                            {title}
                        </a>
                    </h4>
                    {description && (
                        <p className="mt-2 text-white-dark line-clamp-3">{description}</p>
                    )}
                </div>
            </div>

            {/* Footer — same as notes page: tag dot + delete + star */}
            <div className="absolute bottom-5 left-0 w-full px-5">
                <div className="mt-2 flex items-center justify-between">
                    <div className={style.text}>
                        <TagDotIcon />
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button"
                            className="group text-warning ltr:ml-2 rtl:mr-2"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(record._id) }}>
                            <StarIcon filled={isFav} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────
export default function RecordsNotes({
    records,
    accountNumber,
    entitySlug,
}) {
    const [favorites, setFavorites] = useState({})

    const toggleFav = useCallback((id) => {
        setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
    }, [])

    return (
        <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {records.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400 dark:text-gray-600 italic">
                        Aucun enregistrement
                    </div>
                ) : (
                    records.map((record, idx) => (
                        <NoteCard
                            key={record._id?.$oid || record._id}
                            record={record}
                            accountNumber={accountNumber}
                            entitySlug={entitySlug}
                            style={getStyleByIndex(idx)}
                            favorites={favorites}
                            onToggleFav={toggleFav}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
