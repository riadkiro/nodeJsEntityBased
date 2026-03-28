/**
 * Toolbar — Mini toolbar above the table (presets, save indicator)
 * Matches .lp-toolbar from record-lines.ejs
 */
import React from 'react'

const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    padding: '4px 12px',
    borderBottom: '1px solid #f3f4f6',
    minHeight: '28px'
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

export default function Toolbar({ schema, saving, lineCount }) {
    return (
        <div style={toolbarStyle}>
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
    )
}
