import React from 'react';

/**
 * A reusable, high-quality modal component.
 * 
 * @param {boolean} isOpen - Controls visibility.
 * @param {function} onClose - Function to close the modal.
 * @param {string} title - The title of the modal.
 * @param {string|React.Node} icon - Emoji or Icon component to display next to title.
 * @param {React.Node} children - The form or content of the modal.
 * @param {React.Node} footerButtons - Optional buttons to render at the bottom.
 */
const HighQualityModal = ({ isOpen, onClose, title, icon, children, footerButtons }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}
            onClick={onClose} // Close when clicking overlay
        >
            <div
                style={{
                    background: 'white',
                    width: '450px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()} // Prevent close when clicking content
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
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default HighQualityModal;
