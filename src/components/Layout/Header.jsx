import React from 'react';

const Header = ({
    alanKodu,
    anaSekme,
    setAnaSekme,
    gizliMod,
    setGizliMod,
    user,
    setAktifModal,
    koddanCikis,
    cikisYap
}) => {
    return (
        <div style={{
            marginBottom: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            padding: '10px 20px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>

            {/* SOL: LOGO & KOD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🚀</span>
                    <span style={{ display: window.innerWidth < 600 ? 'none' : 'block' }}>CÜZDANIM</span>
                </h1>
                <span style={{ fontSize: '11px', background: '#edf2f7', padding: '4px 8px', borderRadius: '6px', color: '#718096', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {alanKodu}
                </span>
            </div>

            {/* ORTA: NAVİGASYON BUTONLARI */}
            <div style={{ display: 'flex', background: '#edf2f7', padding: '4px', borderRadius: '12px' }}>
                <button
                    onClick={() => setAnaSekme("butcem")}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        outline: 'none',
                        background: anaSekme === "butcem" ? '#ffffff' : 'transparent',
                        color: anaSekme === "butcem" ? '#2b6cb0' : '#718096',
                        boxShadow: anaSekme === "butcem" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}>
                    📊 Bütçem
                </button>
                <button
                    onClick={() => setAnaSekme("yatirimlar")}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        outline: 'none',
                        background: anaSekme === "yatirimlar" ? '#ffffff' : 'transparent',
                        color: anaSekme === "yatirimlar" ? '#2f855a' : '#718096',
                        boxShadow: anaSekme === "yatirimlar" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}>
                    💎 Yatırımlarım
                </button>
                <button
                    onClick={() => setAnaSekme("hedefler")}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        outline: 'none',
                        background: anaSekme === "hedefler" ? '#ffffff' : 'transparent',
                        color: anaSekme === "hedefler" ? '#ed8936' : '#718096',
                        boxShadow: anaSekme === "hedefler" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}>
                    🎯 Hedef/Envanter
                </button>
            </div>

            {/* SAĞ: KULLANICI KONTROLLERİ */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => setGizliMod(!gizliMod)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '5px', outline: 'none' }}>
                    {gizliMod ? '🙈' : '👁️'}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', marginRight: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#2d3748' }}>{user?.displayName?.split(' ')[0]}</span>
                </div>

                <button onClick={() => setAktifModal('ayarlar_yonetim')} style={{ background: '#edf2f7', color: '#4a5568', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', outline: 'none' }}>⚙️</button>
                <button onClick={koddanCikis} style={{ background: '#edf2f7', color: '#4a5568', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', outline: 'none' }}>🔑</button>
                <button onClick={cikisYap} style={{ background: '#fee2e2', color: '#c53030', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', outline: 'none' }}>🚪</button>
            </div>
        </div>
    );
};

export default Header;
