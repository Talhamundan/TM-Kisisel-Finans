import React, { useState } from 'react';
import { cardStyle, inputStyle, formatCurrencyPlain } from '../../utils/helpers';
import HighQualityModal from '../Shared/HighQualityModal';

const GoalsInventory = ({
    hedefler = [],
    envanter = [],
    satislar = [],
    actions,
    genelToplamYatirimGucu,
    islemEkle,
    gizliMod // New Prop
}) => {

    const formatPara = (tutar) => gizliMod ? "**** ₺" : formatCurrencyPlain(tutar);

    // --- STATE FOR MODALS ---
    const [modalState, setModalState] = useState({ type: null, data: null });

    // Form States (Local)
    const [formUrunAdi, setFormUrunAdi] = useState("");
    const [formDeger, setFormDeger] = useState("");
    const [formOdenenTutar, setFormOdenenTutar] = useState(""); // New: Odenen Tutar
    const [formTarih, setFormTarih] = useState("");

    const [formAlici, setFormAlici] = useState("");
    const [formSatisFiyati, setFormSatisFiyati] = useState("");
    const [formPesinat, setFormPesinat] = useState("");
    const [formTahsilEdilen, setFormTahsilEdilen] = useState("");
    const [formAlisMaliyeti, setFormAlisMaliyeti] = useState("");

    const [formHedefAd, setFormHedefAd] = useState("");
    const [formHedefTutar, setFormHedefTutar] = useState("");
    const [formHedefBiriken, setFormHedefBiriken] = useState("");
    const [formHedefLink, setFormHedefLink] = useState("");
    const [formEklenenPara, setFormEklenenPara] = useState("");
    const [formEklenenBorcOdeme, setFormEklenenBorcOdeme] = useState(""); // New: Borc Odeme

    // Inline Form State (Goals Widget)
    const [inlineHedefAd, setInlineHedefAd] = useState("");
    const [inlineHedefTutar, setInlineHedefTutar] = useState("");
    const [inlineLink, setInlineLink] = useState("");

    // --- CALCULATIONS ---
    const toplamAlacaklar = satislar.reduce((acc, s) => {
        const kalan = (parseFloat(s.satisFiyati) - parseFloat(s.tahsilEdilen));
        return acc + (kalan > 0 ? kalan : 0);
    }, 0);

    const toplamEnvanterDegeri = envanter.reduce((acc, e) => acc + (parseFloat(e.deger) || 0), 0);
    const toplamTicariKar = satislar.reduce((acc, s) => {
        const kar = parseFloat(s.satisFiyati) - (parseFloat(s.alisMaliyeti) || 0);
        return acc + kar;
    }, 0);

    const toplamTahsilat = satislar.reduce((acc, s) => acc + (parseFloat(s.tahsilEdilen) || 0), 0);
    const toplamEnvanterOdeme = envanter.reduce((acc, e) => acc + (e.odenenTutar !== undefined ? parseFloat(e.odenenTutar) : parseFloat(e.deger || 0)), 0);
    const toplamSatisOdeme = satislar.reduce((acc, s) => acc + (s.odenenTutar !== undefined ? parseFloat(s.odenenTutar) : parseFloat(s.alisMaliyeti || 0)), 0);
    const ticariKasa = toplamTahsilat - (toplamEnvanterOdeme + toplamSatisOdeme);

    // --- OPEN MODAL HANDLERS ---
    const openEnvanterEkle = () => {
        setFormUrunAdi("");
        setFormDeger("");
        setFormOdenenTutar(""); // Reset
        setFormTarih(new Date().toISOString().split('T')[0]);
        setModalState({ type: 'envanter_ekle', data: null });
    };

    const openEnvanterDuzenle = (item) => {
        setFormUrunAdi(item.urunAdi);
        setFormDeger(item.deger);
        setFormOdenenTutar(item.odenenTutar !== undefined ? item.odenenTutar : item.deger); // Set existing paid amount
        const date = item.eklendiTarih?.seconds
            ? new Date(item.eklendiTarih.seconds * 1000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
        setFormTarih(date);
        setModalState({ type: 'envanter_duzenle', data: item });
    };

    const openSatisYap = (item) => {
        setFormAlici("");
        setFormSatisFiyati("");
        setFormPesinat("");
        setFormTarih(new Date().toISOString().split('T')[0]);
        setModalState({ type: 'satis_yap', data: item });
    };

    const openSatisDuzenle = (satis) => {
        setFormUrunAdi(satis.urunAdi);
        setFormAlici(satis.alici);
        setFormAlisMaliyeti(satis.alisMaliyeti || 0);
        setFormSatisFiyati(satis.satisFiyati);
        setFormTahsilEdilen(satis.tahsilEdilen);
        const date = satis.tarih?.seconds
            ? new Date(satis.tarih.seconds * 1000).toISOString().split('T')[0]
            : (satis.tarih ? new Date(satis.tarih).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setFormTarih(date);
        setModalState({ type: 'satis_duzenle', data: satis });
    };

    const openTahsilatEkle = (satis) => {
        // default to remaining
        const kalan = satis.satisFiyati - satis.tahsilEdilen;
        setFormEklenenPara(kalan);
        setModalState({ type: 'tahsilat_ekle', data: satis });
    };

    const openEnvanterOdemeYap = (item) => {
        const borc = parseFloat(item.deger) - (parseFloat(item.odenenTutar) || 0);
        setFormEklenenBorcOdeme(borc); // Default to full remaining debt
        setModalState({ type: 'envanter_odeme_yap', data: item });
    };

    const openHedefEkle = () => {
        setFormHedefAd("");
        setFormHedefTutar("");
        setFormHedefBiriken("");
        setFormHedefLink("");
        setModalState({ type: 'hedef_ekle', data: null });
    };

    const openHedefDuzenle = (hedef) => {
        setFormHedefAd(hedef.hedefAdi);
        setFormHedefTutar(hedef.hedefTutar);
        setFormHedefBiriken(hedef.biriken);
        setFormHedefLink(hedef.urunLinki || "");
        setModalState({ type: 'hedef_duzenle', data: hedef });
    };

    const openHedefParaEkle = (hedef) => {
        setFormEklenenPara("");
        setModalState({ type: 'hedef_para_ekle', data: hedef });
    };

    // --- CLOSE MODAL ---
    const close = () => setModalState({ type: null, data: null });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '40fr 60fr', gap: '25px', marginBottom: '30px' }}>

            {/* --- SOL SÜTUN (40%) : VARLIK & HEDEFLER --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {/* VARLIK KARTI */}
                <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', opacity: 0.8, letterSpacing: '1px' }}>VARLIK DURUMU</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.6 }}>Olası Nakit (Alacaklar)</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#48bb78' }}>
                                +{formatPara(toplamAlacaklar)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                            <div>
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>Envanter Değeri</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatPara(toplamEnvanterDegeri)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>Ticari Kasa</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: ticariKasa >= 0 ? '#48bb78' : '#e53e3e' }}>
                                    {ticariKasa >= 0 ? '+' : ''}{formatPara(ticariKasa)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HEDEFLERİM KARTI (Inline Form Style) */}
                <div style={cardStyle}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#2d3748', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>🎯 Hedeflerim</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
                        {hedefler.map(h => {
                            const yuzde = Math.min(100, (h.biriken / h.hedefTutar) * 100);
                            const tamamlandi = h.biriken >= h.hedefTutar;
                            return (
                                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                    <div style={{ flex: 1, marginRight: '15px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{h.hedefAdi}</div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                            <span style={{ color: tamamlandi ? '#48bb78' : '#805ad5', fontWeight: 'bold' }}>{formatPara(h.biriken)}</span> / {formatPara(h.hedefTutar)}
                                        </div>
                                        <div style={{ height: '4px', width: '100%', background: '#edf2f7', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${yuzde}%`, background: tamamlandi ? '#48bb78' : '#805ad5', borderRadius: '2px', transition: 'width 0.5s' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {h.urunLinki && (
                                            <a href={h.urunLinki} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '12px' }} title="Ürüne Git">🔗</a>
                                        )}
                                        {!tamamlandi ? (
                                            <button onClick={() => openHedefParaEkle(h)} style={{ background: '#e6fffa', color: '#38b2ac', fontWeight: 'bold', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '5px', fontSize: '11px' }}>+ Ekle</button>
                                        ) : (
                                            <button onClick={() => actions.hedefSatinAl(h)} style={{ background: '#c6f6d5', color: '#22543d', fontWeight: 'bold', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '5px', fontSize: '11px' }}>AL</button>
                                        )}
                                        <span onClick={() => openHedefDuzenle(h)} style={{ cursor: 'pointer', fontSize: '12px', opacity: 0.6 }}>✏️</span>
                                        <span onClick={() => { if (window.confirm('Silmek istediğine emin misin?')) actions.hedefSil(h.id); }} style={{ cursor: 'pointer', fontSize: '12px', opacity: 0.6 }}>🗑️</span>
                                    </div>
                                </div>
                            )
                        })}
                        {hedefler.length === 0 && <div style={{ textAlign: 'center', color: '#a0aec0', fontSize: '12px', padding: '15px' }}>Henüz hedef yok.</div>}
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!inlineHedefAd || !inlineHedefTutar) return alert("Ad ve Tutar zorunlu");
                        actions.hedefEkle({ hedefAdi: inlineHedefAd, hedefTutar: parseFloat(inlineHedefTutar), biriken: 0, urunLinki: inlineLink });
                        setInlineHedefAd(""); setInlineHedefTutar(""); setInlineLink("");
                    }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '5px' }}>
                        <input placeholder="Hedef Adı" value={inlineHedefAd} onChange={e => setInlineHedefAd(e.target.value)} style={{ gridColumn: 'span 2', ...inputStyle }} required />
                        <input type="number" placeholder="Tutar (₺)" value={inlineHedefTutar} onChange={e => setInlineHedefTutar(e.target.value)} style={{ ...inputStyle }} required />
                        <input placeholder="Link (Opsiyonel)" value={inlineLink} onChange={e => setInlineLink(e.target.value)} style={{ ...inputStyle }} />
                        <button type="submit" style={{ gridColumn: 'span 2', background: '#805ad5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '10px', fontWeight: 'bold', marginTop: '5px' }}>HEDEF EKLE</button>
                    </form>
                </div>
            </div>

            {/* --- SAĞ SÜTUN (60%) : ENVANTER & SATIŞLAR (DİKEY) --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* ENVANTER CARD */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0 }}>📦 Envanterim</h4>
                        <button onClick={openEnvanterEkle} style={{ background: '#38a169', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Ürün Ekle</button>
                    </div>
                    <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: '#a0aec0', borderBottom: '1px solid #edf2f7', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Ürün</th>
                                <th style={{ padding: '8px' }}>Maliyet</th>
                                <th style={{ padding: '8px' }}>Eklenme</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...envanter]
                                .sort((a, b) => {
                                    // 1. Date Sort (Desc)
                                    const getDate = (item) => {
                                        if (item.eklendiTarih?.seconds) return new Date(item.eklendiTarih.seconds * 1000);
                                        if (item.eklendiTarih) return new Date(item.eklendiTarih);
                                        return new Date(0);
                                    };
                                    const dateA = getDate(a);
                                    const dateB = getDate(b);
                                    if (dateA.getTime() !== dateB.getTime()) {
                                        return dateB.getTime() - dateA.getTime();
                                    }
                                    // 2. Value Sort (Desc)
                                    return (parseFloat(b.deger) || 0) - (parseFloat(a.deger) || 0);
                                })
                                .map(item => {
                                    const odenen = item.odenenTutar !== undefined ? parseFloat(item.odenenTutar) : parseFloat(item.deger);
                                    const borc = parseFloat(item.deger) - odenen;
                                    const borcuVar = borc > 0.1;

                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                                            <td style={{ padding: '10px' }}>
                                                <div style={{ fontWeight: '500' }}>{item.urunAdi}</div>
                                                {borcuVar && (
                                                    <div style={{ fontSize: '10px', color: '#e53e3e', fontWeight: 'bold', marginTop: '2px', background: '#fed7d7', padding: '2px 4px', borderRadius: '4px', display: 'inline-block' }}>
                                                        Borç: {formatPara(borc)}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '10px' }}>{formatPara(item.deger)}</td>
                                            <td style={{ padding: '10px', fontSize: '12px', color: '#718096' }}>
                                                {item.eklendiTarih?.seconds ? new Date(item.eklendiTarih.seconds * 1000).toLocaleDateString() : '—'}
                                            </td>
                                            <td style={{ padding: '10px', display: 'flex', gap: '5px', justifyContent: 'flex-end', flexDirection: borcuVar ? 'column' : 'row', alignItems: 'flex-end' }}>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button onClick={() => openSatisYap(item)} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>SAT</button>
                                                    <button onClick={() => openEnvanterDuzenle(item)} style={{ background: '#edf2f7', color: '#4a5568', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', outline: 'none' }}>✏️</button>
                                                    <button onClick={() => actions.envanterSil(item.id)} style={{ background: '#fee2e2', color: '#c53030', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', outline: 'none' }}>🗑️</button>
                                                </div>
                                                {borcuVar && (
                                                    <button onClick={() => openEnvanterOdemeYap(item)} style={{ background: '#fc8181', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', width: '100%' }}>Ödeme Yap</button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            {envanter.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#cbd5e0' }}>Envanter boş.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* SATIŞLAR CARD */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0 }}>💰 Satış & Tahsilat</h4>
                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>{satislar.length} Kayıt</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[...satislar]
                            .sort((a, b) => {
                                const dateA = a.tarih?.seconds ? new Date(a.tarih.seconds * 1000) : new Date(a.tarih || 0);
                                const dateB = b.tarih?.seconds ? new Date(b.tarih.seconds * 1000) : new Date(b.tarih || 0);
                                return dateB - dateA;
                            })
                            .map(satis => {
                                const tahsilOran = Math.min(100, (satis.tahsilEdilen / satis.satisFiyati) * 100);
                                const kalan = satis.satisFiyati - satis.tahsilEdilen;
                                const isTamam = kalan <= 0.1;
                                const kar = parseFloat(satis.satisFiyati) - (parseFloat(satis.alisMaliyeti) || 0);
                                return (
                                    <div key={satis.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2d3748' }}>{satis.urunAdi}</div>
                                                <div style={{ fontSize: '13px', color: '#718096', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span>Alıcı: <b>{satis.alici}</b></span>
                                                    <span style={{ fontSize: '11px', color: '#a0aec0', background: '#f7fafc', padding: '2px 6px', borderRadius: '4px' }}>
                                                        {satis.tarih?.seconds
                                                            ? new Date(satis.tarih.seconds * 1000).toLocaleDateString('tr-TR')
                                                            : (satis.tarih ? new Date(satis.tarih).toLocaleDateString('tr-TR') : '—')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px', background: kar >= 0 ? '#c6f6d5' : '#fed7d7', color: kar >= 0 ? '#22543d' : '#9b2c2c', display: 'inline-block' }}>
                                                        {kar >= 0 ? '+' : ''}{formatPara(kar)} Kar
                                                    </div>
                                                    <div style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px', background: isTamam ? '#c6f6d5' : '#fed7d7', color: isTamam ? '#22543d' : '#9b2c2c', display: 'inline-block' }}>
                                                        {isTamam ? 'TAMAMLANDI' : 'BORCU VAR'}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                                    <button onClick={() => openSatisDuzenle(satis)} style={{ border: 'none', background: '#edf2f7', borderRadius: '4px', cursor: 'pointer', padding: '4px', fontSize: '14px', color: '#4a5568', outline: 'none' }}>✏️</button>
                                                    <button onClick={() => { if (window.confirm('Bu kaydı silmek geri alınamaz!')) actions.satisSil(satis.id); }} style={{ border: 'none', background: '#fee2e2', borderRadius: '4px', cursor: 'pointer', padding: '4px', fontSize: '14px', color: '#c53030', outline: 'none' }}>🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ height: '8px', width: '100%', background: '#edf2f7', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                                            <div style={{ height: '100%', width: `${tahsilOran}% `, background: isTamam ? '#48bb78' : '#ed8936', transition: 'width 0.3s' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: '#f7fafc', padding: '8px', borderRadius: '8px' }}>
                                            <div><span style={{ color: '#a0aec0', marginRight: '5px' }}>Alış:</span>{formatPara(satis.alisMaliyeti || 0)}</div>
                                            <div><span style={{ color: '#a0aec0', marginRight: '5px' }}>Satış:</span>{formatPara(satis.satisFiyati)}</div>
                                            <div><span style={{ color: '#a0aec0', marginRight: '5px' }}>Tahsil:</span><b style={{ color: '#2b6cb0' }}>{formatPara(satis.tahsilEdilen)}</b></div>
                                            <div><span style={{ color: '#a0aec0', marginRight: '5px' }}>Kalan:</span><b style={{ color: isTamam ? '#48bb78' : '#e53e3e' }}>{formatPara(kalan)}</b></div>
                                        </div>
                                        {!isTamam && (
                                            <button onClick={() => openTahsilatEkle(satis)} style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>+ Tahsilat Ekle</button>
                                        )}
                                    </div>
                                )
                            })}
                        {satislar.length === 0 && <div style={{ textAlign: 'center', color: '#a0aec0', fontSize: '13px', padding: '20px' }}>Satış kaydı bulunmuyor.</div>}
                    </div>
                </div>

            </div>

            {/* --- MODALS --- */}

            {/* 1. ENVANTER EKLE */}
            <HighQualityModal
                isOpen={modalState.type === 'envanter_ekle'}
                onClose={close}
                title="Yeni Ürün Ekle"
                icon="📦"
            >
                <form onSubmit={(e) => { e.preventDefault(); actions.envanterEkle({ urunAdi: formUrunAdi, deger: parseFloat(formDeger), odenenTutar: parseFloat(formOdenenTutar), tarih: formTarih }); close(); }}>
                    <input autoFocus value={formUrunAdi} onChange={e => setFormUrunAdi(e.target.value)} placeholder="Ürün Adı" style={{ ...inputStyle, marginBottom: '15px' }} required />
                    <input type="number" value={formDeger} onChange={e => { setFormDeger(e.target.value); setFormOdenenTutar(e.target.value); }} placeholder="Alış Maliyeti (₺)" style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input type="number" value={formOdenenTutar} onChange={e => setFormOdenenTutar(e.target.value)} placeholder="Ödenen Tutar" style={{ ...inputStyle, marginBottom: '15px' }} required />
                    <input type="date" value={formTarih} onChange={e => setFormTarih(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />
                    <button type="submit" style={{ width: '100%', background: '#38a169', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>KAYDET</button>
                </form>
            </HighQualityModal>

            {/* 2. ENVANTER DÜZENLE */}
            <HighQualityModal isOpen={modalState.type === 'envanter_duzenle'} onClose={close} title="Ürün Düzenle" icon="✏️">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    actions.envanterGuncelle(modalState.data.id, { urunAdi: formUrunAdi, deger: parseFloat(formDeger), odenenTutar: parseFloat(formOdenenTutar), eklendiTarih: new Date(formTarih) });
                    close();
                }}>
                    <input value={formUrunAdi} onChange={e => setFormUrunAdi(e.target.value)} placeholder="Ürün Adı" style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input type="number" value={formDeger} onChange={e => setFormDeger(e.target.value)} placeholder="Alış Maliyeti" style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input type="number" value={formOdenenTutar} onChange={e => setFormOdenenTutar(e.target.value)} placeholder="Ödenen Tutar" style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input type="date" value={formTarih} onChange={e => setFormTarih(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />
                    <button type="submit" style={{ width: '100%', background: '#3182ce', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>GÜNCELLE</button>
                </form>
            </HighQualityModal>

            {/* 3. SATIŞ YAP */}
            <HighQualityModal isOpen={modalState.type === 'satis_yap'} onClose={close} title="Satış Yap" icon="💰">
                <div style={{ marginBottom: '20px', padding: '10px', background: '#f7fafc', borderRadius: '8px' }}>
                    <b>{modalState.data?.urunAdi}</b> ürününü satıyorsunuz.
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!formAlici || !formSatisFiyati) return alert("Alıcı ve Fiyat zorunlu.");
                    if (!formAlici || !formSatisFiyati) return alert("Alıcı ve Fiyat zorunlu.");
                    actions.envanterSat(modalState.data, { alici: formAlici, satisFiyati: formSatisFiyati, pesinat: formPesinat, tarih: formTarih });
                    close();
                }}>
                    <input autoFocus value={formAlici} onChange={e => setFormAlici(e.target.value)} placeholder="Alıcı Adı" style={{ ...inputStyle, marginBottom: '15px' }} required />
                    <input type="number" value={formSatisFiyati} onChange={e => setFormSatisFiyati(e.target.value)} placeholder="Satış Fiyatı (₺)" style={{ ...inputStyle, marginBottom: '15px' }} required />
                    <input type="date" value={formTarih} onChange={e => setFormTarih(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input type="number" value={formPesinat} onChange={e => setFormPesinat(e.target.value)} placeholder="Peşinat (Varsa)" style={{ ...inputStyle, marginBottom: '20px' }} />
                    <button type="submit" style={{ width: '100%', background: '#805ad5', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>SATIŞI ONAYLA</button>
                </form>
            </HighQualityModal>

            {/* 4. SATIŞ DÜZENLE */}
            <HighQualityModal isOpen={modalState.type === 'satis_duzenle'} onClose={close} title="Satış Düzenle" icon="📝">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.preventDefault();
                    actions.satisDuzenle(modalState.data.id, { urunAdi: formUrunAdi, alici: formAlici, alisMaliyeti: parseFloat(formAlisMaliyeti), satisFiyati: formSatisFiyati, tahsilEdilen: formTahsilEdilen, tarih: formTarih });
                    close();
                }}>
                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Ürün Adı</label>
                    <input value={formUrunAdi} onChange={e => setFormUrunAdi(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />

                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Alıcı</label>
                    <input value={formAlici} onChange={e => setFormAlici(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />

                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Alış Maliyeti (₺)</label>
                    <input type="number" value={formAlisMaliyeti} onChange={e => setFormAlisMaliyeti(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />

                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Satış Fiyatı (₺)</label>
                    <input type="number" value={formSatisFiyati} onChange={e => setFormSatisFiyati(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />

                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tahsil Edilen (₺)</label>
                    <input type="number" value={formTahsilEdilen} onChange={e => setFormTahsilEdilen(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />

                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Satış Tarihi</label>
                    <input type="date" value={formTarih} onChange={e => setFormTarih(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />

                    <button type="submit" style={{ width: '100%', background: '#3182ce', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>KAYDET</button>
                </form>
            </HighQualityModal>

            {/* 5. TAHSİLAT EKLE */}
            <HighQualityModal isOpen={modalState.type === 'tahsilat_ekle'} onClose={close} title="Tahsilat Ekle" icon="💸">
                <form onSubmit={(e) => { e.preventDefault(); actions.satisTahsilatEkle(modalState.data.id, formEklenenPara); close(); }}>
                    <div style={{ marginBottom: '15px', color: '#4a5568' }}>Kalan Alacak: <b>{modalState.data ? formatPara(modalState.data.satisFiyati - modalState.data.tahsilEdilen) : 0}</b></div>
                    <input type="number" autoFocus value={formEklenenPara} onChange={e => setFormEklenenPara(e.target.value)} placeholder="Tahsil Edilen Tutar" style={{ ...inputStyle, marginBottom: '20px' }} required />
                    <button type="submit" style={{ width: '100%', background: '#38a169', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>EKLE</button>
                </form>
            </HighQualityModal>

            {/* 6. HEDEF EKLE */}
            <HighQualityModal isOpen={modalState.type === 'hedef_ekle'} onClose={close} title="Yeni Hedef" icon="🎯">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    actions.hedefEkle({ hedefAdi: formHedefAd, hedefTutar: parseFloat(formHedefTutar), biriken: parseFloat(formHedefBiriken) || 0, urunLinki: formHedefLink });
                    close();
                }}>
                    <input autoFocus value={formHedefAd} onChange={e => setFormHedefAd(e.target.value)} placeholder="Hedef Adı (Örn: iPhone 15)" style={{ ...inputStyle, marginBottom: '15px' }} required />
                    <input type="number" value={formHedefTutar} onChange={e => setFormHedefTutar(e.target.value)} placeholder="Hedeflenen Tutar (₺)" style={{ ...inputStyle, marginBottom: '15px' }} required />
                    <input type="number" value={formHedefBiriken} onChange={e => setFormHedefBiriken(e.target.value)} placeholder="Başlangıç Birikimi (Opsiyonel)" style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input value={formHedefLink} onChange={e => setFormHedefLink(e.target.value)} placeholder="Ürün Linki (Opsiyonel)" style={{ ...inputStyle, marginBottom: '20px' }} />
                    <button type="submit" style={{ width: '100%', background: '#805ad5', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>OLUŞTUR</button>
                </form>
            </HighQualityModal>

            {/* 7. HEDEF DÜZENLE */}
            <HighQualityModal isOpen={modalState.type === 'hedef_duzenle'} onClose={close} title="Hedef Düzenle" icon="✏️">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    actions.hedefDuzenle(modalState.data.id, { hedefAdi: formHedefAd, hedefTutar: parseFloat(formHedefTutar), biriken: parseFloat(formHedefBiriken) || 0, urunLinki: formHedefLink });
                    close();
                }}>
                    <input value={formHedefAd} onChange={e => setFormHedefAd(e.target.value)} placeholder="Hedef Adı" style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input type="number" value={formHedefTutar} onChange={e => setFormHedefTutar(e.target.value)} placeholder="Hedef Tutar" style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input type="number" value={formHedefBiriken} onChange={e => setFormHedefBiriken(e.target.value)} placeholder="Biriken" style={{ ...inputStyle, marginBottom: '15px' }} />
                    <input value={formHedefLink} onChange={e => setFormHedefLink(e.target.value)} placeholder="Link" style={{ ...inputStyle, marginBottom: '20px' }} />
                    <button type="submit" style={{ width: '100%', background: '#3182ce', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>KAYDET</button>
                </form>
            </HighQualityModal>

            {/* 8. HEDEF PARA EKLE */}
            <HighQualityModal isOpen={modalState.type === 'hedef_para_ekle'} onClose={close} title="Para Ekle" icon="💰">
                <form onSubmit={(e) => { e.preventDefault(); actions.hedefParaEkle(modalState.data.id, formEklenenPara); close(); }}>
                    <div style={{ marginBottom: '15px', padding: '10px', background: '#f0fff4', color: '#276749', borderRadius: '8px' }}>
                        <b>{modalState.data?.hedefAdi}</b> için birikim ekliyorsunuz.
                    </div>
                    <input type="number" autoFocus value={formEklenenPara} onChange={e => setFormEklenenPara(e.target.value)} placeholder="Eklenecek Tutar (₺)" style={{ ...inputStyle, marginBottom: '20px' }} required />
                    <button type="submit" style={{ width: '100%', background: '#38a169', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>EKLE</button>
                </form>
            </HighQualityModal>

            {/* 9. ENVANTER ÖDEME YAP */}
            <HighQualityModal isOpen={modalState.type === 'envanter_odeme_yap'} onClose={close} title="Tedarikçi Ödemesi" icon="💸">
                <form onSubmit={(e) => { e.preventDefault(); actions.envanterOdemeYap(modalState.data.id, formEklenenBorcOdeme); close(); }}>
                    <div style={{ marginBottom: '15px', color: '#4a5568' }}>Kalan Borç: <b>{modalState.data ? formatPara(modalState.data.deger - (modalState.data.odenenTutar || 0)) : 0}</b></div>
                    <input type="number" autoFocus value={formEklenenBorcOdeme} onChange={e => setFormEklenenBorcOdeme(e.target.value)} placeholder="Ödenecek Tutar" style={{ ...inputStyle, marginBottom: '20px' }} required />
                    <button type="submit" style={{ width: '100%', background: '#38a169', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>ÖDE</button>
                </form>
            </HighQualityModal>

        </div >
    );
};

export default GoalsInventory;
