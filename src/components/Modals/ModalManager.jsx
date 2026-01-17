import React, { useState } from 'react';
import HighQualityModal from '../Shared/HighQualityModal';
import { formatCurrencyPlain, inputStyle, tarihSadeceGunAyYil } from '../../utils/helpers';

const ModalManager = ({
    aktifModal, setAktifModal,
    seciliVeri,
    hesaplar,
    hesapAdi, setHesapAdi,
    hesapTipi, setHesapTipi,
    baslangicBakiye, setBaslangicBakiye,
    hesapKesimGunu, setHesapKesimGunu,
    hesapDuzenle,
    islemAciklama, setIslemAciklama,
    islemTutar, setIslemTutar,
    islemTarihi, setIslemTarihi,
    kategori, setKategori,
    yatirimTurleri,
    kategoriListesi,
    islemDuzenle,
    aboAd, setAboAd,
    aboTutar, setAboTutar,
    aboGun, setAboGun,
    aboHesapId, setAboHesapId,
    aboKategori, setAboKategori,
    abonelikDuzenle,
    taksitBaslik, setTaksitBaslik,
    taksitToplamTutar, setTaksitToplamTutar,
    taksitSayisi, setTaksitSayisi,
    taksitHesapId, setTaksitHesapId,
    taksitKategori, setTaksitKategori,
    taksitAlisTarihi, setTaksitAlisTarihi,
    taksitDuzenle,
    maasAd, setMaasAd,
    maasTutar, setMaasTutar,
    maasGun, setMaasGun,
    maasHesapId, setMaasHesapId,
    maasDuzenle,
    kkOdemeKartId,
    kkOdemeKaynakId, setKkOdemeKaynakId,
    kkOdemeTutar, setKkOdemeTutar,
    krediKartiBorcOde,
    faturaOde,
    tanimliFaturalar,
    faturaGirisTutar, setFaturaGirisTutar,
    faturaGirisTarih, setFaturaGirisTarih,
    faturaGirisAciklama, setFaturaGirisAciklama,
    bekleyenFaturaDuzenle,
    tanimBaslik, setTanimBaslik,
    tanimKurum, setTanimKurum,
    tanimAboneNo, setTanimAboneNo,
    faturaTanimDuzenle,
    alanKodu,
    verileriTasi,
    yeniKodInput, setYeniKodInput,
    tasimaIslemiSuruyor,
    satisYap,
    secilenHesapId, setSecilenHesapId,

    // NEW PROPS FOR SETTINGS
    // NEW PROPS FOR SETTINGS
    // yeniKategoriAdi, setYeniKategoriAdi, -> MOVED TO LOCAL STATE
    // yeniYatirimTuruAdi, setYeniYatirimTuruAdi, -> MOVED TO LOCAL STATE
    onKategoriUpdate, // Replaces inline setDoc
    onYatirimTuruUpdate, // Replaces inline setDoc
    gizliMod,
    besKesintiEkle,
    besKesintiSil,
    // Investment Edit Props
    portfoyDuzenle, sembol, adet, setAdet, alisFiyati, setAlisFiyati, varlikTuru, setVarlikTuru,
    tahsilatTutar, setTahsilatTutar, satisTahsilatEkle,

    // Auth Actions
    onConfirmLogout
}) => {

    const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
    const [yeniYatirimTuruAdi, setYeniYatirimTuruAdi] = useState("");

    const formatPara = (tutar) => gizliMod ? "**** ₺" : formatCurrencyPlain(tutar);

    if (!aktifModal) return null;

    // Helper to close
    const close = () => setAktifModal(null);

    // Render content based on activeModal
    let content = null;
    let title = "Modal";
    let icon = "📝";

    // 1. SATIŞ
    if (aktifModal === 'satis') {
        title = "Satış Yap";
        icon = "💰";
        content = (
            <form onSubmit={async (e) => { e.preventDefault(); await satisYap(seciliVeri, secilenHesapId, islemTutar); close(); }}>
                <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}><b>{seciliVeri.sembol}</b> - {seciliVeri.adet} Adet</div>
                <input type="number" value={islemTutar} onChange={e => setIslemTutar(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} placeholder="Birim Satış Fiyatı" />
                <select value={secilenHesapId} onChange={e => setSecilenHesapId(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} required><option value="">Para Hangi Hesaba Gitsin?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                <div style={{ marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Toplam Tutar: {islemTutar ? formatPara(parseFloat(islemTutar) * seciliVeri.adet) : '0 ₺'}</div>
                <button type="submit" style={{ width: '100%', background: '#10b981', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>ONAYLA</button>
            </form>
        );
    }

    // 2. HESAP DÜZENLE
    else if (aktifModal === 'duzenle_hesap') {
        title = "Hesabı Düzenle";
        content = (
            <form onSubmit={(e) => hesapDuzenle(e, seciliVeri.id).then(res => res && close())}>
                <input value={hesapAdi} onChange={e => setHesapAdi(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} placeholder="Hesap Adı" />
                <select value={hesapTipi} onChange={e => setHesapTipi(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }}>
                    <option value="nakit">Nakit</option>
                    <option value="krediKarti">Kart</option>
                    <option value="yatirim">Yatırım H.</option>
                </select>
                <input type="number" value={baslangicBakiye} onChange={e => setBaslangicBakiye(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} placeholder="Bakiye" />
                {hesapTipi === 'krediKarti' && <input type="number" placeholder="Kesim Günü (1-31)" value={hesapKesimGunu} onChange={e => setHesapKesimGunu(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />}
                <button type="submit" style={{ width: '100%', background: '#6366f1', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>Kaydet</button>
            </form>
        );
    }

    // 3. İŞLEM DÜZENLE
    else if (aktifModal === 'duzenle_islem') {
        title = "İşlemi Düzenle";
        content = (
            <form onSubmit={(e) => islemDuzenle(e, seciliVeri.id, seciliVeri).then(res => res && close())}>
                <input value={islemAciklama} onChange={e => setIslemAciklama(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} placeholder="Açıklama" />
                <input type="number" value={islemTutar} onChange={e => setIslemTutar(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} placeholder="Tutar" />
                <input type="datetime-local" value={islemTarihi} onChange={e => setIslemTarihi(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                {seciliVeri.kategori === 'BES' ? (
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Kategori</label><input value="BES" disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} /></div>
                ) : (seciliVeri.islemTipi.includes('yatirim')) ? (
                    <select value={kategori} onChange={e => setKategori(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }}>{yatirimTurleri.map(t => <option key={t} value={t}>{t}</option>)}</select>
                ) : (
                    <select value={kategori} onChange={e => setKategori(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                )}
                <button type="submit" style={{ width: '100%', background: '#6366f1', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>Kaydet</button>
            </form>
        );
    }

    else if (aktifModal === 'duzenle_abonelik') {
        title = "Sabit Gider Düzenle";
        content = (
            <form onSubmit={(e) => abonelikDuzenle(e, seciliVeri.id).then(res => res && close())}>
                <input value={aboAd} onChange={e => setAboAd(e.target.value)} placeholder="Gider Adı" style={{ ...inputStyle, marginBottom: '15px' }} />
                <input type="number" value={aboTutar} onChange={e => setAboTutar(e.target.value)} placeholder="Tutar" style={{ ...inputStyle, marginBottom: '15px' }} />
                <input type="number" value={aboGun} onChange={e => setAboGun(e.target.value)} placeholder="Gün (1-31)" style={{ ...inputStyle, marginBottom: '15px' }} />
                <select value={aboKategori} onChange={e => setAboKategori(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                <select value={aboHesapId} onChange={e => setAboHesapId(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }}><option value="">Hangi Hesaptan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                <button type="submit" style={{ width: '100%', background: '#6366f1', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>Kaydet</button>
            </form>
        );
    }

    else if (aktifModal === 'ayarlar_yonetim') {
        title = "Ayarlar";
        icon = "⚙️";
        content = (
            <div>
                <h4>📂 Bütçe Kategorileri</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{kategoriListesi.map(k => (<li key={k} style={{ background: '#f0fff4', padding: '5px 10px', borderRadius: '15px', fontSize: '13px' }}>{k} <span onClick={() => { if (window.confirm("Silinsin mi?")) { onKategoriUpdate(kategoriListesi.filter(x => x !== k)); } }} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>X</span></li>))}</ul>
                <form onSubmit={(e) => { e.preventDefault(); if (!yeniKategoriAdi) return; onKategoriUpdate([...kategoriListesi, yeniKategoriAdi]); setYeniKategoriAdi(""); toast.success("Kategori eklendi"); }} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}><input value={yeniKategoriAdi} onChange={e => setYeniKategoriAdi(e.target.value)} placeholder="Yeni Kategori" style={{ flex: 1, ...inputStyle }} /><button type="submit" style={{ background: 'green', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }}>Ekle</button></form>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
                <h4>💎 Yatırım Türleri</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{(yatirimTurleri || []).map(k => (<li key={k} style={{ background: '#ebf8ff', padding: '5px 10px', borderRadius: '15px', fontSize: '13px' }}>{k} <span onClick={() => { if (window.confirm("Silinsin mi?")) { onYatirimTuruUpdate(yatirimTurleri.filter(x => x !== k)); } }} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>X</span></li>))}</ul>
                <form onSubmit={(e) => { e.preventDefault(); if (!yeniYatirimTuruAdi) return; onYatirimTuruUpdate([...yatirimTurleri, yeniYatirimTuruAdi]); setYeniYatirimTuruAdi(""); toast.success("Tür eklendi"); }} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}><input value={yeniYatirimTuruAdi} onChange={e => setYeniYatirimTuruAdi(e.target.value)} placeholder="Yeni Tür (Fon, Coin...)" style={{ flex: 1, ...inputStyle }} /><button type="submit" style={{ background: '#3182ce', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }}>Ekle</button></form>

                <div style={{ marginTop: '30px', padding: '15px', background: '#fffaf0', border: '1px solid #fbd38d', borderRadius: '8px', color: '#7b341e' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#c05621' }}>🚚 Verileri Başka Koda Taşı</h4>
                    <p style={{ fontSize: '12px' }}>Kod: <b>{alanKodu}</b> → Yeni Kod</p>
                    <form onSubmit={verileriTasi} style={{ display: 'flex', gap: '5px' }}>
                        <input value={yeniKodInput} onChange={e => setYeniKodInput(e.target.value.toUpperCase())} placeholder="YENİ KOD" style={{ flex: 1, ...inputStyle, border: '1px solid #fbd38d' }} />
                        <button type="submit" disabled={tasimaIslemiSuruyor} style={{ background: '#c05621', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>{tasimaIslemiSuruyor ? '...' : 'TAŞI'}</button>
                    </form>
                </div>
            </div>
        );
    }

    else if (aktifModal === 'duzenle_taksit') {
        title = "Taksit Düzenle";
        content = (
            <form onSubmit={(e) => taksitDuzenle(e, seciliVeri.id).then(res => res && close())}>
                <input value={taksitBaslik} onChange={e => setTaksitBaslik(e.target.value)} placeholder="Ne aldın?" style={{ ...inputStyle, marginBottom: '15px' }} />
                <input type="number" value={taksitToplamTutar} onChange={e => setTaksitToplamTutar(e.target.value)} placeholder="Toplam Borç" style={{ ...inputStyle, marginBottom: '15px' }} />
                <input type="number" value={taksitSayisi} onChange={e => setTaksitSayisi(e.target.value)} placeholder="Taksit Sayısı" style={{ ...inputStyle, marginBottom: '15px' }} />
                <select value={taksitKategori} onChange={e => setTaksitKategori(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                <select value={taksitHesapId} onChange={e => setTaksitHesapId(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }}><option value="">Hangi Karttan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                <div style={{ marginBottom: '20px', fontSize: '14px', color: '#6366f1', fontWeight: 'bold' }}>Aylık: {taksitToplamTutar && taksitSayisi ? formatPara(taksitToplamTutar / taksitSayisi) : '0 ₺'}</div>
                <button type="submit" style={{ width: '100%', background: '#6366f1', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>Kaydet</button>
            </form>
        );
    }

    else if (aktifModal === 'kredi_karti_ode') {
        title = "Borç Öde";
        icon = "💳";
        const kart = hesaplar.find(h => h.id === kkOdemeKartId);
        const borc = Math.abs(kart?.guncelBakiye || 0);
        const asgariBorc = borc * 0.20;

        content = (
            <form onSubmit={(e) => { krediKartiBorcOde(e); close(); }}>
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f3e8ff', borderRadius: '12px', color: '#333' }}>
                    <p style={{ margin: 0 }}><strong>Kart:</strong> {kart?.hesapAdi}</p>
                    <p style={{ margin: '8px 0', fontSize: '18px' }}><strong>Borç:</strong> {formatPara(borc)}</p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Ödenecek Tutar Seçimi:</label>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                            <input type="radio" name="odemeTipi" onChange={() => setKkOdemeTutar(borc)} checked={Math.abs(kkOdemeTutar - borc) < 1} />
                            Tamamı ({formatPara(borc)})
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                            <input type="radio" name="odemeTipi" onChange={() => setKkOdemeTutar(asgariBorc)} checked={Math.abs(kkOdemeTutar - asgariBorc) < 1} />
                            Asgari (%20 - {formatPara(asgariBorc)})
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer' }}>
                            <input type="radio" name="odemeTipi" onChange={() => setKkOdemeTutar("")} checked={Math.abs(kkOdemeTutar - borc) >= 1 && Math.abs(kkOdemeTutar - asgariBorc) >= 1} />
                            Özel Tutar
                        </label>
                    </div>
                </div>
                <select value={kkOdemeKaynakId} onChange={e => setKkOdemeKaynakId(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} required><option value="">Parayı Hangi Hesaptan Çekelim?</option>{hesaplar.filter(h => h.id !== kkOdemeKartId).map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({formatPara(h.guncelBakiye)})</option>)}</select>
                <input type="number" placeholder="Ödenecek Tutar (₺)" value={kkOdemeTutar} onChange={e => setKkOdemeTutar(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} required />
                <button type="submit" style={{ width: '100%', background: '#805ad5', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>ÖDEMEYİ YAP</button>
            </form>
        );

    } else if (aktifModal === 'duzenle_portfoy') {
        title = "Portföy Düzenle";
        icon = "✏️";
        content = (
            <form onSubmit={async (e) => {
                e.preventDefault();
                const target = seciliVeri.ids || seciliVeri.id;
                const success = await portfoyDuzenle(target, { adet, alisFiyati, varlikTuru });
                if (success) close();
            }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096' }}>Sembol</label>
                    <input value={sembol} disabled style={{ ...inputStyle, background: '#edf2f7', color: '#a0aec0' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096' }}>Adet</label>
                    <input type="number" value={adet} onChange={e => setAdet(e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096' }}>Maliyet (Birim Alış)</label>
                    <input type="number" value={alisFiyati} onChange={e => setAlisFiyati(e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#718096' }}>Varlık Türü</label>
                    <select value={varlikTuru} onChange={e => setVarlikTuru(e.target.value)} style={inputStyle}>
                        {(yatirimTurleri || ["Hisse", "Fon", "Altın", "Döviz"]).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button type="submit" style={{ width: '100%', background: '#3182ce', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>KAYDET</button>
            </form>
        );
    }

    else if (aktifModal === 'bes_kesinti_ekle') {
        title = "Yönetim Gider Kesintisi";
        icon = "⚠️";
        content = (
            <div>
                <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 20px 0' }}>BES hesabınızdan kesilen tutarları buradan takip edin.</p>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!islemTutar || !islemTarihi) return alert("Lütfen tutar ve tarih giriniz.");
                    const success = await besKesintiEkle(seciliVeri, islemTutar, islemTarihi);
                    if (success) { setIslemTutar(""); close(); }
                }}>
                    <input type="number" value={islemTutar} onChange={e => setIslemTutar(e.target.value)} placeholder="Kesinti Tutarı (₺)" style={{ ...inputStyle, marginBottom: '15px', borderColor: '#fc8181' }} required />
                    <input type="date" value={islemTarihi} onChange={e => setIslemTarihi(e.target.value)} style={{ ...inputStyle, marginBottom: '20px', borderColor: '#fc8181' }} required />
                    <button type="submit" style={{ width: '100%', background: '#c53030', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>KAYDET</button>
                </form>
                {/* LIST OF PAST DEDUCTIONS */}
                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2d3748' }}>Geçmiş Kesintiler</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '10px', background: '#fff' }}>
                        {(!seciliVeri?.kesintiler || seciliVeri.kesintiler.length === 0) ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0', fontSize: '12px' }}>Henüz kesinti kaydı yok.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <tbody>
                                    {seciliVeri.kesintiler.sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).map((k) => (
                                        <tr key={k.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px', color: '#334155' }}>{tarihSadeceGunAyYil(k.tarih)}</td>
                                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#c53030' }}>-{formatPara(k.tutar)}</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}><span onClick={async () => { const success = await besKesintiSil(seciliVeri, k.id); if (success) close(); }} style={{ cursor: 'pointer', fontSize: '14px' }}>🗑️</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    else if (aktifModal === 'tahsilat_ekle') {
        title = "Tahsilat Ekle (Ödeme Al)";
        icon = "💸";
        content = (
            <form onSubmit={async (e) => { e.preventDefault(); await satisTahsilatEkle(seciliVeri.id, tahsilatTutar); close(); }}>
                <div style={{ marginBottom: '15px', color: '#4a5568' }}>Kalan Alacak: <b>{seciliVeri ? formatPara(seciliVeri.satisFiyati - seciliVeri.tahsilEdilen) : 0}</b></div>
                <input type="number" autoFocus value={tahsilatTutar} onChange={e => setTahsilatTutar(e.target.value)} placeholder="Tahsil Edilen Tutar" style={{ ...inputStyle, marginBottom: '20px' }} required />
                <button type="submit" style={{ width: '100%', background: '#38a169', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>EKLE</button>
            </form>
        );
    }

    else if (aktifModal === 'cikis_onay') {
        title = "Çıkış Yap";
        icon = "🚪";
        content = (
            <div>
                <div style={{ marginBottom: '25px', padding: '15px', background: '#fee2e2', borderRadius: '12px', color: '#991b1b', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px' }}>⚠️</span>
                    <div>
                        <strong>Emin misin?</strong>
                        <div style={{ fontSize: '13px', marginTop: '5px' }}>Bu kod (<b>{alanKodu}</b>) ile olan oturumun sonlandırılacak. Kodunu unutma!</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={close} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: 'bold', cursor: 'pointer' }}>İPTAL</button>
                    <button onClick={() => { onConfirmLogout && onConfirmLogout(); close(); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>EVET, ÇIK</button>
                </div>
            </div>
        );
    }

    // Fallback
    if (!content) return null;

    return (
        <HighQualityModal
            isOpen={!!aktifModal}
            onClose={close}
            title={title}
            icon={icon}
        >
            {content}
        </HighQualityModal>
    );

};

export default ModalManager;
