/**
 * PlanCard - Multi-step plan visualization with validation
 * Shows a workflow plan the AI proposes, with steps that can be validated or modified
 */
import React, { useState } from 'react'

const STEP_ICONS = {
    create: '➕',
    update: '✏️',
    search: '🔍',
    validate: '✅',
    schedule: '📅',
    notify: '🔔',
    email: '📧',
    wait: '⏳',
    default: '▸',
}

export default function PlanCard({ plan, onValidate, disabled }) {
    const [isEditing, setIsEditing] = useState(false)
    const [modifications, setModifications] = useState('')

    const handleValidate = () => {
        onValidate(null) // No modifications
    }

    const handleModify = () => {
        if (modifications.trim()) {
            onValidate(modifications)
            setModifications('')
            setIsEditing(false)
        }
    }

    return (
        <div className="ai-plan-card">
            <div className="ai-plan-card__header">
                <span className="ai-plan-card__icon">📋</span>
                <span className="ai-plan-card__title">{plan.title || 'Plan d\'exécution'}</span>
                <span className="ai-plan-card__count">{plan.steps?.length || 0} étapes</span>
            </div>

            <div className="ai-plan-card__steps">
                {(plan.steps || []).map((step, i) => (
                    <div
                        key={i}
                        className={`ai-plan-card__step ${step.status === 'done' ? 'ai-plan-card__step--done' : ''} ${step.status === 'active' ? 'ai-plan-card__step--active' : ''}`}
                    >
                        <span className="ai-plan-card__step-num">{i + 1}</span>
                        <span className="ai-plan-card__step-icon">
                            {step.status === 'done' ? '✅' : (STEP_ICONS[step.type] || STEP_ICONS.default)}
                        </span>
                        <div className="ai-plan-card__step-content">
                            <span className="ai-plan-card__step-label">{step.label}</span>
                            {step.detail && (
                                <span className="ai-plan-card__step-detail">{step.detail}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action buttons */}
            {!plan.executed && (
                <div className="ai-plan-card__actions">
                    {isEditing ? (
                        <div className="ai-plan-card__edit-area">
                            <textarea
                                className="ai-plan-card__edit-input"
                                value={modifications}
                                onChange={(e) => setModifications(e.target.value)}
                                placeholder="Décrivez vos modifications..."
                                rows={2}
                            />
                            <div className="ai-plan-card__edit-btns">
                                <button
                                    className="ai-plan-card__btn ai-plan-card__btn--secondary"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="ai-plan-card__btn ai-plan-card__btn--primary"
                                    onClick={handleModify}
                                    disabled={!modifications.trim() || disabled}
                                >
                                    Envoyer les modifications
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                className="ai-plan-card__btn ai-plan-card__btn--primary"
                                onClick={handleValidate}
                                disabled={disabled}
                            >
                                ✅ Valider et exécuter
                            </button>
                            <button
                                className="ai-plan-card__btn ai-plan-card__btn--secondary"
                                onClick={() => setIsEditing(true)}
                                disabled={disabled}
                            >
                                ✏️ Modifier le plan
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
