import React from 'react';
import { Home, WalletCards, Briefcase, PlusCircle, Settings } from 'lucide-react';

const MobileNav = ({ anaSekme, setAnaSekme, modalAc }) => {
    return (
        <div className="show-on-mobile" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '85px',
            backgroundColor: '#ffffff',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            paddingTop: '10px',
            paddingBottom: '30px', /* Safe area uyumu */
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
        }}>
            <button
                onClick={() => setAnaSekme('butcem')}
                style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: anaSekme === 'butcem' ? '#805ad5' : '#a0aec0', padding: 0 }}
            >
                <Home size={22} strokeWidth={anaSekme === 'butcem' ? 3 : 2} />
                <span style={{ fontSize: '10px', fontWeight: anaSekme === 'butcem' ? 'bold' : 'normal' }}>Ana Sayfa</span>
            </button>

            <button
                onClick={() => {
                    setAnaSekme('butcem');
                    setTimeout(() => {
                        const cuzdanlarSec = document.getElementById('cuzdanlar-section');
                        if (cuzdanlarSec) {
                            const offset = cuzdanlarSec.getBoundingClientRect().top + window.scrollY - 80;
                            window.scrollTo({ top: offset, behavior: 'smooth' });
                        }
                    }, 150);
                }}
                style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#a0aec0', padding: 0 }}
            >
                <WalletCards size={22} />
                <span style={{ fontSize: '10px', fontWeight: 'normal' }}>Cüzdanlar</span>
            </button>

            {/* GİDERLER MODALI BUTONU (ORTADA VE BELİRGİN) */}
            <button
                onClick={() => modalAc('islem_ekle_mobil')}
                style={{ background: '#805ad5', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', padding: 0, width: '48px', height: '48px', borderRadius: '50%', marginTop: '-25px', boxShadow: '0 4px 10px rgba(128,90,213,0.4)' }}
            >
                <PlusCircle size={28} color="#ffffff" strokeWidth={2.5} />
            </button>

            <button
                onClick={() => setAnaSekme('yatirimlar')}
                style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: anaSekme === 'yatirimlar' ? '#805ad5' : '#a0aec0', padding: 0 }}
            >
                <Briefcase size={22} strokeWidth={anaSekme === 'yatirimlar' ? 3 : 2} />
                <span style={{ fontSize: '10px', fontWeight: anaSekme === 'yatirimlar' ? 'bold' : 'normal' }}>Portföy</span>
            </button>

            <button
                onClick={() => modalAc('ayarlar')}
                style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#a0aec0', padding: 0 }}
            >
                <Settings size={22} />
                <span style={{ fontSize: '10px', fontWeight: 'normal' }}>Ayarlar</span>
            </button>
        </div>
    );
};

export default MobileNav;
