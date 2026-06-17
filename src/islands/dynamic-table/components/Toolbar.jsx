/**
 * Toolbar - Mini toolbar above the table (catalogue + validate)
 */
import React from 'react'

const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    padding: '3px 10px',
    borderBottom: '1px solid #f1f3f5',
    minHeight: '24px'
}

const savingDot = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    animation: 'pulse-save 1s infinite'
}

const lineCountStyle = {
    fontSize: '10px',
    color: '#9ca3af',
    fontWeight: 500
}

const btn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#888da8',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    padding: '3px 8px',
    cursor: 'pointer',
    transition: 'all 0.15s'
}

export default function Toolbar({
    saving,
    lineCount,
    presets = [],
    validating = false,
    catalogEnabled = false,
    showValidateButton = true,
    onValidate,
    onOpenCatalog
}) {
    return (
        <div style={toolbarStyle}>
            <div />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {/* Catalogue button — opens the full catalogue modal directly */}
                {catalogEnabled && (
                <button
                    type="button"
                    style={btn}
                    onClick={onOpenCatalog}
                >
                    Catalogue
                    {presets.length > 0 && (
                        <span style={{
                            display: 'inline-flex',
                            minWidth: 16,
                            height: 16,
                            borderRadius: 999,
                            background: 'rgba(67,97,238,0.12)',
                            color: '#4361ee',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '0 4px'
                        }}>
                            {presets.length}
                        </span>
                    )}
                </button>
                )}

                {showValidateButton && (
                    <button
                        type="button"
                        style={{ ...btn, color: validating ? '#9ca3af' : '#111827' }}
                        onClick={onValidate}
                        disabled={validating}
                    >
                        {validating ? 'Validation...' : 'Valider'}
                    </button>
                )}

                {lineCount > 0 && (
                    <span style={lineCountStyle}>
                        {lineCount} ligne{lineCount > 1 ? 's' : ''}
                    </span>
                )}

                {saving && (
                    <>
                        <div style={{ ...savingDot, background: '#4361ee' }} />
                        <span style={{ fontSize: 10, color: '#4361ee', fontWeight: 500 }}>Enregistrement...</span>
                        <style>{`@keyframes pulse-save { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
                    </>
                )}
            </div>
        </div>
    )
}
