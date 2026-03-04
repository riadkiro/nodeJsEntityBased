/**
 * WidgetPalette — Draggable element palette for the WYSIWYG Card Builder
 */
import React, { useState } from 'react'

const ELEMENT_TYPES = [
    { type: 'title', label: 'Titre', icon: 'solar:text-bold-bold-duotone', desc: 'Titre du record', color: '#4361ee' },
    { type: 'field', label: 'Champ', icon: 'solar:document-text-bold-duotone', desc: 'Valeur d\'un champ', color: '#00ab55' },
    { type: 'status', label: 'Statut', icon: 'solar:tag-bold-duotone', desc: 'Badge de statut', color: '#e7515a' },
    { type: 'date', label: 'Date', icon: 'solar:calendar-bold-duotone', desc: 'Date avec icône', color: '#e2a03f' },
    { type: 'icon-value', label: 'Icône + Valeur', icon: 'solar:info-circle-bold-duotone', desc: 'Icône et texte', color: '#2196f3' },
    { type: 'actions', label: 'Actions', icon: 'solar:menu-dots-bold', desc: 'Boutons d\'action', color: '#805dca' },
    { type: 'separator', label: 'Séparateur', icon: 'solar:minus-circle-bold-duotone', desc: 'Ligne', color: '#888' },
    { type: 'spacer', label: 'Espace', icon: 'solar:maximize-bold-duotone', desc: 'Espace flexible', color: '#888' },
    { type: 'text', label: 'Texte', icon: 'solar:text-italic-bold-duotone', desc: 'Texte libre', color: '#0dcaf0' },
    { type: 'badge', label: 'Badge', icon: 'solar:bookmark-bold-duotone', desc: 'Badge coloré', color: '#e7515a' },
    { type: 'zone', label: 'Zone', icon: 'solar:layers-bold-duotone', desc: 'Groupe d\'éléments', color: '#4361ee' },
    { type: 'html', label: 'HTML', icon: 'solar:code-bold-duotone', desc: 'Contenu HTML', color: '#ff6b6b' },
    { type: 'link', label: 'Lien', icon: 'solar:link-round-bold-duotone', desc: 'Lien personnalisé', color: '#2196f3' },
    { type: 'relations', label: 'Relations', icon: 'solar:share-circle-bold-duotone', desc: 'Liens vers relations', color: '#805dca' },
    { type: 'attachments', label: 'Pièces jointes', icon: 'solar:paperclip-bold-duotone', desc: 'Fichiers attachés', color: '#e2a03f' },
    { type: 'documents', label: 'Documents', icon: 'solar:file-text-bold-duotone', desc: 'Modèles de docs', color: '#00ab55' },
]

export { ELEMENT_TYPES }

export default function WidgetPalette({ onDragStart }) {
    const [search, setSearch] = useState('')
    const filtered = ELEMENT_TYPES.filter(e =>
        !search || e.label.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ padding: '0 0 12px' }}>
            <div style={{ padding: '0 16px 10px', fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                Composants
            </div>
            <div style={{ padding: '0 12px 8px' }}>
                <div style={{ position: 'relative' }}>
                    <iconify-icon icon="solar:magnifer-linear" width="14" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher..."
                        style={{
                            width: '100%', padding: '7px 8px 7px 28px', borderRadius: 8,
                            border: '1px solid #e5e7eb', fontSize: 12, outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#4361ee'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 12px' }}>
                {filtered.map(et => (
                    <div
                        key={et.type}
                        draggable
                        onDragStart={e => {
                            e.dataTransfer.setData('application/card-element', et.type)
                            e.dataTransfer.effectAllowed = 'copy'
                            onDragStart?.(et.type)
                        }}
                        style={{
                            padding: '10px 8px', borderRadius: 10, border: '1px solid #eee',
                            backgroundColor: '#fff', cursor: 'grab', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            textAlign: 'center', userSelect: 'none',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = et.color; e.currentTarget.style.boxShadow = `0 2px 12px ${et.color}20` }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: `${et.color}12`,
                        }}>
                            <iconify-icon icon={et.icon} width="18" style={{ color: et.color }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#333', lineHeight: 1.2 }}>{et.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
