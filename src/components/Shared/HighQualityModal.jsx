import React from 'react';
import ReactDOM from 'react-dom';

/**
 * A reusable, high-quality modal component.
 * Uses Portal to render at document.body level to avoid z-index/overflow issues.
 */
const HighQualityModal = ({ isOpen, onClose, title, icon, children, footerButtons, width = '450px', minHeight, maxHeight = '90vh' }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.6)', // Slightly darker for better contrast
                backdropFilter: 'blur(5px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 99999 // Ultra high z-index
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    width: width,
                    minHeight: minHeight,
                    maxHeight: maxHeight,
                    overflowY: 'auto',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeIn 0.25s ease-out',
                    position: 'relative' // Ensure relative content context
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* HEADER */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', padding: '5px' }}
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div style={{ padding: '24px' }}>
                    {children}
                </div>

                {/* FOOTER (Optional) */}
                {footerButtons && (
                    <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', gap: '10px' }}>
                        {footerButtons}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default HighQualityModal;
