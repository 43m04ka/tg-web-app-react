import React, { useState } from 'react';

const CopyButton = ({ url, label = "Ссылка" }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Всплывающее уведомление */}
            {isCopied && (
                <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#3a3a3c',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '400',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    zIndex: 10,
                }}>
                    Скопировано!
                </div>
            )}

            <button
                onClick={handleCopy}
                style={{
                    background: '#2c2c2e',
                    border: 'none',
                    color: '#0a84ff',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    width: '100%',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}
            >
                🔗 {label}
            </button>
        </div>
    );
};

export default CopyButton;