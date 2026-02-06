import React, { useState } from 'react';
import HighQualityModal from '../Shared/HighQualityModal';
import { formatCurrencyPlain, inputStyle, tarihSadeceGunAyYil } from '../../utils/helpers';

// Sub-component to handle Portföy Düzenleme with own state
const PositionEditModal = ({ seciliVeri, pozisyonGuncelle, close, inputStyle }) => {
    // Helper to safe parse date
    const safeDate = (str) => {
        if (!str) return "";
        try {
            // Handle DD.MM.YYYY format
            const parts = str.split('.');
            if (parts.length === 3) {
                const day = parts[0];
                const month = parts[1];
                let year = parts[2];
                // Remove potential time part from year
                if (year.includes(' ')) year = year.split(' ')[0];

                const d = new Date(`${year}-${month}-${day}`);
                if (!isNaN(d.getTime())) return d.toISOString().slice(0, 16);
            }
            return "";
        } catch (e) {
            return "";
        }
    };

    // Local state for form, initialized with selected data
    const [buyPrice, setBuyPrice] = useState(seciliVeri?.buy?.alisFiyati || "");
    const [buyDate, setBuyDate] = useState(safeDate(seciliVeri?.buy?.tarihStr));
    const [buyAdet, setBuyAdet] = useState(seciliVeri?.buy?.adet || "");

    const [sellPrice, setSellPrice] = useState(seciliVeri?.sell?.satisFiyati || "");
    const [sellDate, setSellDate] = useState(safeDate(seciliVeri?.sell?.tarihStr));

    const isClosed = seciliVeri?.isClosed;

    return (
        <form onSubmit={async (e) => {
            e.preventDefault();
            const success = await pozisyonGuncelle(
                { id: seciliVeri.buy?.id, fiyat: buyPrice, adet: buyAdet, tarih: buyDate },
                isClosed ? { id: seciliVeri.sell?.id, fiyat: sellPrice, adet: seciliVeri.sell?.adet, tarih: sellDate } : null
            );
            if (success) close();
        }}>
            <div style={{ background: '#ebf8ff', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2b6cb0', fontSize: '14px' }}>📥 Alış İşlemi ({seciliVeri?.sembol || '?'})</h4>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Alış Fiyatı</label>
                        <input type="number" step="0.01" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} style={inputStyle} required />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Adet</label>
                        <input type="number" step="0.01" value={buyAdet} onChange={e => setBuyAdet(e.target.value)} style={inputStyle} required />
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Tarih</label>
                    <input type="datetime-local" value={buyDate || ""} onChange={e => setBuyDate(e.target.value)} style={inputStyle} />
                </div>
            </div>

            {isClosed ? (
                <div style={{ background: '#fff5f5', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#c53030', fontSize: '14px' }}>📤 Satış İşlemi (Kapanış)</h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Satış Fiyatı</label>
                            <input type="number" step="0.01" value={sellPrice} onChange={e => setSellPrice(e.target.value)} style={inputStyle} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Adet (Kilitli)</label>
                            <input value={seciliVeri.sell?.adet} disabled style={{ ...inputStyle, background: '#edf2f7', color: '#a0aec0' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Tarih</label>
                        <input type="datetime-local" value={sellDate || ""} onChange={e => setSellDate(e.target.value)} style={inputStyle} />
                    </div>
                </div>
            ) : (
                <div style={{ background: '#f0fff4', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#276749', fontSize: '14px' }}>📈 Güncel Piyasa Durumu</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Anlık Fiyat (Güncellenemez)</label>
                            <input value={formatCurrencyPlain(seciliVeri.guncelFiyat || 0)} disabled style={{ ...inputStyle, background: '#edf2f7', color: '#a0aec0', fontWeight: 'bold' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', fontSize: '12px', color: '#718096' }}>
                            * Pozisyon açıktır.
                        </div>
                    </div>
                </div>
            )}

            <button type="submit" style={{ width: '100%', background: '#3182ce', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                DEĞİŞİKLİKLERİ KAYDET
            </button>
        </form>
    );
};

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
    islemAdet, setIslemAdet, // NEW
    islemBirimFiyat, setIslemBirimFiyat, // NEW
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
    pozisyonGuncelle, // NEW PROP
    pozisyonSil, // NEW PROP for delete modal

    // Auth Actions
    onConfirmLogout,

    // ADDED: New props for add actions (Already passed, but ensuring they are destructured if not)
    maasEkle, hesapEkle, faturaTanimEkle, abonelikEkle, gecmisIslemEkle,
    feedbackActions // NEW
}) => {

    // Convert props to object for inner components if needed, or just use directly
    const props = { feedbackActions }; // Quick hack to support the previous edit which used props.feedbackActions

    const [yeniKategoriAdi, setYeniKategoriAdi] = useState("");
    const [yeniYatirimTuruAdi, setYeniYatirimTuruAdi] = useState("");
    const [isProcessing, setIsProcessing] = useState(false); // NEW: Global loading state for modals
    const [silinecekObje, setSilinecekObje] = useState(null); // Local state for delete confirmation

    const formatPara = (tutar) => gizliMod ? "**** ₺" : formatCurrencyPlain(tutar);

    if (!aktifModal) return null;

    // Helper to close
    const close = () => setAktifModal(null);

    // Render content based on activeModal
    let content = null;
    let title = "Modal";
    let icon = "📝";

    // 0. YENİ EKLEME MODALLARI
    if (aktifModal === 'maas_ekle') {
        title = "Yeni Gelir Ekle";
        icon = "💰";
        content = (
            <form onSubmit={async (e) => {
                e.preventDefault(); // Fixed: Prevent default submission
                setIsProcessing(true);
                const success = await maasEkle(e);
                setIsProcessing(false);
                if (success) close();
            }}>
                <input placeholder="Gelir Adı (Maaş vb.)" value={maasAd} onChange={e => setMaasAd(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <input placeholder="Tutar" type="number" value={maasTutar} onChange={e => setMaasTutar(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <input placeholder="Gün (1-31)" type="number" value={maasGun} onChange={e => setMaasGun(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <select value={maasHesapId} onChange={e => setMaasHesapId(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }}><option value="">Hesap Seç</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                <button type="submit" disabled={isProcessing} style={{ width: '100%', background: '#48bb78', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', opacity: isProcessing ? 0.7 : 1 }}>{isProcessing ? 'KAYDEDİLİYOR...' : 'KAYDET'}</button>
            </form>
        );
    }

    else if (aktifModal === 'hesap_ekle') {
        title = "Yeni Hesap Ekle";
        icon = "💳";
        content = (
            <form onSubmit={async (e) => {
                e.preventDefault(); // Fixed
                setIsProcessing(true);
                const success = await hesapEkle(e);
                setIsProcessing(false);
                if (success) close();
            }}>
                <input placeholder="Hesap Adı" value={hesapAdi} onChange={e => setHesapAdi(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <select value={hesapTipi} onChange={e => setHesapTipi(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }}>
                    <option value="nakit">Nakit</option>
                    <option value="krediKarti">Kart</option>
                    <option value="yatirim">Yatırım H.</option>
                </select>
                <input placeholder="Başlangıç Bakiyesi" type="number" value={baslangicBakiye} onChange={e => setBaslangicBakiye(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                {hesapTipi === 'krediKarti' && <input type="number" placeholder="Kesim Günü (1-31)" value={hesapKesimGunu} onChange={e => setHesapKesimGunu(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />}
                <button type="submit" disabled={isProcessing} style={{ width: '100%', background: '#3182ce', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', opacity: isProcessing ? 0.7 : 1 }}>{isProcessing ? 'KAYDEDİLİYOR...' : 'KAYDET'}</button>
            </form>
        );
    }

    else if (aktifModal === 'fatura_tanim_ekle') {
        title = "Yeni Fatura Tanımı";
        icon = "🧾";
        content = (
            <form onSubmit={async (e) => {
                e.preventDefault(); // Fixed
                setIsProcessing(true);
                const success = await faturaTanimEkle(e);
                setIsProcessing(false);
                if (success) close();
            }}>
                <input placeholder="Başlık (Ev İnternet)" value={tanimBaslik} onChange={e => setTanimBaslik(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} required />
                <input placeholder="Kurum" value={tanimKurum} onChange={e => setTanimKurum(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <input placeholder="Abone No" value={tanimAboneNo} onChange={e => setTanimAboneNo(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />
                <button type="submit" disabled={isProcessing} style={{ width: '100%', background: '#4a5568', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', opacity: isProcessing ? 0.7 : 1 }}>{isProcessing ? 'KAYDEDİLİYOR...' : 'KAYDET'}</button>
            </form>
        );
    }

    else if (aktifModal === 'fatura_ode') {
        title = "Fatura Öde";
        icon = "💸";
        const tanim = tanimliFaturalar?.find(t => t.id === seciliVeri?.tanimId);
        const baslik = tanim ? tanim.baslik : "Fatura";

        content = (
            <form onSubmit={async (e) => {
                e.preventDefault();
                if (!secilenHesapId) { alert("Lütfen hesap seçiniz."); return; }
                setIsProcessing(true);
                const success = await faturaOde(seciliVeri, secilenHesapId);
                setIsProcessing(false);
                if (success) close();
            }}>
                <div style={{ marginBottom: '20px', padding: '15px', background: '#fff5f5', borderRadius: '12px', color: '#c53030' }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>{baslik}</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatPara(seciliVeri?.tutar)}</div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>Son Ödeme: {tarihSadeceGunAyYil(seciliVeri?.sonOdemeTarihi)}</div>
                </div>

                <select value={secilenHesapId} onChange={e => setSecilenHesapId(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} required>
                    <option value="">Ödenecek Hesap Seçin</option>
                    {hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({formatPara(h.guncelBakiye)})</option>)}
                </select>

                <button type="submit" disabled={isProcessing} style={{ width: '100%', background: '#c53030', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', opacity: isProcessing ? 0.7 : 1 }}>
                    {isProcessing ? 'ÖDENİYOR...' : 'ÖDE'}
                </button>
            </form>
        );
    }

    else if (aktifModal === 'duzenle_fatura_tanim') {
        title = "Fatura Tanımı Düzenle";
        content = (
            <form onSubmit={(e) => faturaTanimDuzenle(e, seciliVeri.id).then(res => res && close())}>
                <input placeholder="Başlık" value={tanimBaslik} onChange={e => setTanimBaslik(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} required />
                <input placeholder="Kurum" value={tanimKurum} onChange={e => setTanimKurum(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <input placeholder="Abone No" value={tanimAboneNo} onChange={e => setTanimAboneNo(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />
                <button type="submit" style={{ width: '100%', background: '#4a5568', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>GÜNCELLE</button>
            </form>
        );
    }

    else if (aktifModal === 'duzenle_bekleyen_fatura') {
        title = "Bekleyen Fatura Düzenle";
        content = (
            <form onSubmit={(e) => bekleyenFaturaDuzenle(e, seciliVeri.id).then(res => res && close())}>
                <input type="number" placeholder="Tutar" value={faturaGirisTutar} onChange={e => setFaturaGirisTutar(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} required />
                <input type="date" value={faturaGirisTarih} onChange={e => setFaturaGirisTarih(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} required />
                <input placeholder="Açıklama (Opsiyonel)" value={faturaGirisAciklama} onChange={e => setFaturaGirisAciklama(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />
                <button type="submit" style={{ width: '100%', background: '#c53030', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>KAYDET</button>
            </form>
        );
    }

    else if (aktifModal === 'abonelik_ekle') {
        title = "Yeni Sabit Gider Ekle";
        icon = "🔄";
        content = (
            <form onSubmit={async (e) => {
                e.preventDefault(); // Fixed
                setIsProcessing(true);
                const success = await abonelikEkle(e);
                setIsProcessing(false);
                if (success) close();
            }}>
                <input placeholder="Ad" value={aboAd} onChange={e => setAboAd(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <input placeholder="Tutar" type="number" value={aboTutar} onChange={e => setAboTutar(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <input placeholder="Gün (1-31)" type="number" value={aboGun} onChange={e => setAboGun(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />
                <select value={aboKategori} onChange={e => setAboKategori(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }}>{kategoriListesi.map(k => <option key={k} value={k}>{k}</option>)}</select>
                <select value={aboHesapId} onChange={e => setAboHesapId(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }}><option value="">Hangi Hesaptan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                <button type="submit" disabled={isProcessing} style={{ width: '100%', background: '#805ad5', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', opacity: isProcessing ? 0.7 : 1 }}>{isProcessing ? 'KAYDEDİLİYOR...' : 'KAYDET'}</button>
            </form>
        );
    }

    // 1. SATIŞ
    else if (aktifModal === 'satis') {
        title = "Satış Yap";
        icon = "💰";
        content = (
            <form onSubmit={async (e) => {
                e.preventDefault();
                setIsProcessing(true);
                const success = await satisYap(seciliVeri, secilenHesapId, islemTutar);
                setIsProcessing(false);
                if (success) close();
            }}>
                <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}><b>{seciliVeri.sembol}</b> - {seciliVeri.adet} Adet</div>
                <input type="number" value={islemTutar} onChange={e => setIslemTutar(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} placeholder="Birim Satış Fiyatı" />
                <select value={secilenHesapId} onChange={e => setSecilenHesapId(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} required><option value="">Para Hangi Hesaba Gitsin?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                <div style={{ marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Toplam Tutar: {islemTutar ? formatPara(parseFloat(islemTutar) * seciliVeri.adet) : '0 ₺'}</div>
                <button type="submit" disabled={isProcessing} style={{ width: '100%', background: '#10b981', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', opacity: isProcessing ? 0.7 : 1 }}>{isProcessing ? 'İŞLENİYOR...' : 'ONAYLA'}</button>
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
        if (!seciliVeri) return null; // STRICT SAFE ACCESS
        title = "İşlemi Düzenle";
        const isInvestment = (seciliVeri.islemTipi && seciliVeri.islemTipi.includes('yatirim')) || seciliVeri.kategori === 'Yatırım';

        // Auto-Calc Handler
        const handleCalc = (val, type) => {
            const numVal = parseFloat(val);
            const total = parseFloat(islemTutar);

            if (type === 'adet') {
                setIslemAdet(val);
                if (!isNaN(numVal) && numVal !== 0 && !isNaN(total)) {
                    setIslemBirimFiyat((total / numVal).toFixed(2));
                }
            } else if (type === 'fiyat') {
                setIslemBirimFiyat(val);
                if (!isNaN(numVal) && numVal !== 0 && !isNaN(total)) {
                    setIslemAdet((total / numVal).toFixed(2));
                }
            }
        };

        const handleAmountChange = (val) => {
            setIslemTutar(val);
            if (isInvestment) {
                const total = parseFloat(val);
                const q = parseFloat(islemAdet);
                if (!isNaN(total) && !isNaN(q) && q !== 0) {
                    setIslemBirimFiyat((total / q).toFixed(2));
                }
            }
        };

        content = (
            <form onSubmit={(e) => islemDuzenle(e, seciliVeri.id, seciliVeri).then(res => res && close())}>
                <input value={islemAciklama} onChange={e => setIslemAciklama(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} placeholder="Açıklama" />

                {/* CONDITIONAL RENDERING for Investment Fields */}
                {isInvestment && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold' }}>Adet</label>
                            <input
                                type="number"
                                value={islemAdet ?? ''}
                                onChange={e => handleCalc(e.target.value, 'adet')}
                                style={inputStyle}
                                placeholder="0"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold' }}>Birim Fiyat</label>
                            <input
                                type="number"
                                value={islemBirimFiyat ?? ''}
                                onChange={e => handleCalc(e.target.value, 'fiyat')}
                                style={inputStyle}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                )}

                <label style={{ fontSize: '11px', color: '#718096', fontWeight: 'bold' }}>Toplam Tutar</label>
                <input type="number" value={islemTutar} onChange={e => handleAmountChange(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} placeholder="Tutar" />

                <input type="datetime-local" value={islemTarihi} onChange={e => setIslemTarihi(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }} />

                {seciliVeri.kategori === 'BES' ? (
                    <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Kategori</label><input value="BES" disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} /></div>
                ) : (isInvestment) ? (
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
            <div style={{ position: 'relative' }}> {/* Konteyner relative yapıldı */}

                {/* SİLME ONAY OVERLAY */}
                {silinecekObje && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.9)', // Hafif transparan beyaz arka plan
                        backdropFilter: 'blur(4px)', // Modern blur efekti
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        borderRadius: '8px'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '25px', padding: '0 20px' }}>
                            <div style={{ fontSize: '18px', marginBottom: '10px' }}>🗑️</div>
                            <div style={{ fontSize: '16px', color: '#4a5568', marginBottom: '10px' }}>
                                <b>{silinecekObje.name}</b> {silinecekObje.type === 'kategori' ? 'kategorisini' : 'türünü'} silmek istediğinize emin misiniz?
                            </div>
                            <div style={{ fontSize: '13px', color: '#718096' }}>
                                Geçmiş veriler korunacak, sadece listeden kalkacaktır.
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', width: '80%' }}>
                            <button
                                onClick={() => setSilinecekObje(null)}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                İPTAL
                            </button>
                            <button
                                onClick={() => {
                                    if (silinecekObje.type === 'kategori') {
                                        onKategoriUpdate(kategoriListesi.filter(x => x !== silinecekObje.name));
                                    } else {
                                        onYatirimTuruUpdate(yatirimTurleri.filter(x => x !== silinecekObje.name));
                                    }
                                    setSilinecekObje(null);
                                    toast.success("Başarıyla silindi");
                                }}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e53e3e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                SİL
                            </button>
                        </div>
                    </div>
                )}

                {/* NORMAL İÇERİK (Her zaman render edilir) */}
                <h4>📂 Bütçe Kategorileri</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {kategoriListesi.map(k => (
                        <li key={k} style={{ background: '#f0fff4', padding: '5px 10px', borderRadius: '15px', fontSize: '13px' }}>
                            {k}
                            <span
                                onClick={() => setSilinecekObje({ type: 'kategori', name: k })}
                                style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                            >
                                X
                            </span>
                        </li>
                    ))}
                </ul>
                <form onSubmit={(e) => { e.preventDefault(); if (!yeniKategoriAdi) return; onKategoriUpdate([...kategoriListesi, yeniKategoriAdi]); setYeniKategoriAdi(""); toast.success("Kategori eklendi"); }} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}><input value={yeniKategoriAdi} onChange={e => setYeniKategoriAdi(e.target.value)} placeholder="Yeni Kategori" style={{ flex: 1, ...inputStyle }} /><button type="submit" style={{ background: 'green', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }}>Ekle</button></form>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
                <h4>💎 Yatırım Türleri</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {(yatirimTurleri || []).map(k => (
                        <li key={k} style={{ background: '#ebf8ff', padding: '5px 10px', borderRadius: '15px', fontSize: '13px' }}>
                            {k}
                            <span
                                onClick={() => setSilinecekObje({ type: 'yatirim', name: k })}
                                style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                            >
                                X
                            </span>
                        </li>
                    ))}
                </ul>
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
            <form onSubmit={async (e) => { const s = await krediKartiBorcOde(e); if (s) close(); }}>
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

    } else if (aktifModal === 'feedback_form') {
        title = "🚀 Geliştiriciye Not Bırak";
        icon = "";

        // Local state for feedback form
        const [fbType, setFbType] = useState('oneri');
        const [fbMessage, setFbMessage] = useState('');
        const [fbImage, setFbImage] = useState(null);

        // Access sendFeedback from props
        const { sendFeedback, uploading } = props.feedbackActions || {};

        content = (
            <form onSubmit={async (e) => {
                e.preventDefault();
                if (!fbMessage) return alert("Lütfen bir mesaj yazın.");
                if (sendFeedback) {
                    const success = await sendFeedback({ type: fbType, message: fbMessage }, fbImage);
                    if (success) {
                        setFbMessage("");
                        setFbImage(null);
                        close();
                    }
                }
            }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#4a5568' }}>Kategori</label>
                <select value={fbType} onChange={e => setFbType(e.target.value)} style={{ ...inputStyle, marginBottom: '15px' }}>
                    <option value="hata">🚨 Hata Bildir</option>
                    <option value="oneri">💡 Öneri</option>
                    <option value="tesekkur">❤️ Teşekkür</option>
                </select>

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#4a5568' }}>Mesajınız</label>
                <textarea
                    value={fbMessage}
                    onChange={e => setFbMessage(e.target.value)}
                    placeholder="Fikrini buraya yazabilirsin..."
                    style={{ ...inputStyle, height: '100px', marginBottom: '15px', resize: 'vertical' }}
                    required
                />

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#4a5568' }}>Ekran Görüntüsü</label>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFbImage(e.target.files[0])}
                        style={{ ...inputStyle, padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px', fontSize: '12px', color: '#718096', fontStyle: 'italic', textAlign: 'center' }}>
                    Gönderince bana mail olarak düşecek. 📧
                </div>

                <button
                    type="submit"
                    disabled={uploading}
                    style={{
                        width: '100%',
                        background: '#ed8936', // Matches Button
                        color: 'white',
                        padding: '14px',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        opacity: uploading ? 0.7 : 1,
                        cursor: uploading ? 'wait' : 'pointer'
                    }}
                >
                    {uploading ? 'GÖNDERİLİYOR...' : 'GÖNDER'}
                </button>
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
            <form onSubmit={async (e) => {
                e.preventDefault();
                const success = await satisTahsilatEkle(seciliVeri.id, tahsilatTutar);
                if (success) close();
            }}>
                <div style={{ marginBottom: '15px', color: '#4a5568' }}>Kalan Alacak: <b>{seciliVeri ? formatPara(seciliVeri.satisFiyati - seciliVeri.tahsilEdilen) : 0}</b></div>
                <input type="number" autoFocus value={tahsilatTutar} onChange={e => setTahsilatTutar(e.target.value)} placeholder="Tahsil Edilen Tutar" style={{ ...inputStyle, marginBottom: '20px' }} required />
                <button type="submit" style={{ width: '100%', background: '#38a169', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>EKLE</button>
            </form>
        );
    }

    else if (aktifModal === 'duzenle_pozisyon') {
        title = "Pozisyon Düzenle";
        icon = "✏️";
        content = (
            <PositionEditModal
                seciliVeri={seciliVeri}
                pozisyonGuncelle={pozisyonGuncelle}
                close={close}
                inputStyle={inputStyle}
            />
        );
    }

    else if (aktifModal === 'gecmis_islem_ekle') {
        title = "Geçmiş İşlem Ekle";
        icon = "🕰️";
        content = (
            <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());

                // Add validation
                if (!data.sembol || !data.adet || !data.alisFiyati || !data.alisTarihi) {
                    alert("Lütfen zorunlu alanları doldurun (Sembol, Adet, Alış Fiyatı, Alış Tarihi).");
                    return;
                }

                const success = await gecmisIslemEkle(data);
                if (success) close();
            }}>
                <div style={{ marginBottom: '15px', background: '#e2e8f0', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#4a5568' }}>
                    ℹ️ <b>Bilgi:</b> Bu işlem nakit bakiyenizi etkilemez. Sadece analiz tablosuna ve portföye eklenir. <br />
                    • Hem Alış hem Satış girerseniz: <b>Kapanmış Pozisyon</b> olur.<br />
                    • Sadece Alış girerseniz: <b>Açık Pozisyon</b> olur.
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Varlık (Hisse/Döviz)</label>
                        <input name="sembol" placeholder="Örn: THYAO, USD" style={inputStyle} required />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568' }}>Adet</label>
                        <input name="adet" type="number" step="0.001" placeholder="0" style={inputStyle} required />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#2b6cb0' }}>Alış Fiyatı</label>
                        <input name="alisFiyati" type="number" step="0.01" placeholder="0.00" style={{ ...inputStyle, borderColor: '#63b3ed' }} required />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#2b6cb0' }}>Alış Tarihi</label>
                        <input name="alisTarihi" type="date" style={{ ...inputStyle, borderColor: '#63b3ed' }} required />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e0', margin: '20px 0' }} />

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#c53030' }}>Satış Fiyatı (Opsiyonel)</label>
                        <input name="satisFiyati" type="number" step="0.01" placeholder="0.00" style={{ ...inputStyle, borderColor: '#fc8181' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic' }}>
                            * Satış fiyatı girilirse pozisyon <b>Kapanmış</b> sayılır.
                        </span>
                    </div>
                </div>

                <button type="submit" style={{ width: '100%', background: '#4a5568', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                    GEÇMİŞ İŞLEMİ KAYDET
                </button>
            </form>
        );
    }

    // NEW DELETE CONFIRMATION MODAL
    else if (aktifModal === 'pozisyon_sil_onay') {
        title = "Pozisyonu Sil";
        icon = "🗑️";
        const assetName = seciliVeri?.row?.sembol || "Bu varlığı";

        content = (
            <div>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ fontSize: '16px', color: '#4a5568', marginBottom: '10px' }}>
                        <b>{assetName}</b> varlığını portföyden silmek istediğinize emin misiniz?
                    </div>
                    <div style={{ fontSize: '13px', color: '#718096' }}>
                        Bu işlem geri alınamaz. Eğer ilgili bir harcama kaydı bulunursa, tutar bakiyenize iade edilecektir.
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={close}
                        style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#e2e8f0', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                    >
                        İPTAL
                    </button>
                    <button
                        onClick={async () => {
                            if (pozisyonSil && seciliVeri?.row) {
                                setIsProcessing(true);
                                const success = await pozisyonSil(seciliVeri.row);
                                setIsProcessing(false);
                                if (success !== false) close();
                            } else {
                                close();
                            }
                        }}
                        disabled={isProcessing}
                        style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#e53e3e', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', opacity: isProcessing ? 0.7 : 1 }}
                    >
                        {isProcessing ? 'SİLİNİYOR...' : 'SİL'}
                    </button>
                </div>
            </div>
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
