/**
 * ActionCard - Clickable action button inline in chat
 * Used for confirmations like "Créer ce patient ?", "Envoyer le mail ?"
 */
import React from 'react'

const ICONS = {
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    search: '🔍',
    navigate: '🔗',
    confirm: '✅',
    cancel: '❌',
    schedule: '📅',
    email: '📧',
    default: '⚡',
}

export default function ActionCard({ action, onExecute, disabled }) {
    const icon = ICONS[action.type] || ICONS.default

    return (
        <button
            className={`ai-action-card ai-action-card--${action.type || 'default'}`}
            onClick={onExecute}
            disabled={disabled}
        >
            <span className="ai-action-card__icon">{icon}</span>
            <div className="ai-action-card__content">
                <span className="ai-action-card__label">{action.label}</span>
                {action.description && (
                    <span className="ai-action-card__desc">{action.description}</span>
                )}
            </div>
            <svg className="ai-action-card__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </button>
    )
}
