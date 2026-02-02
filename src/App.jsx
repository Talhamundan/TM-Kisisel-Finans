import { useState, useEffect } from 'react'
import { db } from './firebase'
import { doc, setDoc } from 'firebase/firestore'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Layout/Header';
import Notifications from './components/Shared/Notifications';
import BudgetDashboard from './components/Budget/BudgetDashboard';
import InvestmentDashboard from './components/Investment/InvestmentDashboard';
import GoalsInventory from './components/Budget/GoalsInventory';
import ModalManager from './components/Modals/ModalManager';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useDataListeners } from './hooks/useDataListeners';
import { useBudgetActions } from './hooks/useBudgetActions';
import { useInvestmentActions } from './hooks/useInvestmentActions';
import { useCalculations } from './hooks/useCalculations';

// Helpers
import { inputStyle } from './utils/helpers';

function App() {
    // 1. AUTH
    const { user, loading, girisYap, cikisYap: authLogout } = useAuth();

    // 2. LOCAL UI STATE
    const [anaSekme, setAnaSekme] = useState("butcem");
    const [gizliMod, setGizliMod] = useState(false);
    const [aktifModal, setAktifModal] = useState(null);
    const [seciliVeri, setSeciliVeri] = useState(null);
    const [formTab, setFormTab] = useState("islem");

    // Login / Code Login
    const [alanKodu, setAlanKodu] = useState(localStorage.getItem("alan_kodu") || "");
    const [girilenKod, setGirilenKod] = useState("");

    // 3. HOOKS initialization
    const data = useDataListeners(user, alanKodu);
    const calculations = useCalculations(data, gizliMod, data.aylikLimit);
    const budgetActions = useBudgetActions(user, alanKodu, data.hesaplar, data.kategoriListesi, data.tanimliFaturalar);
    const investmentActions = useInvestmentActions(user, alanKodu);

    // 3.1 GÜVENLİK VE UX İYİLEŞTİRMELERİ (Global Date Fix)
    useEffect(() => {
        const handleFocus = (e) => {
            if (e.target && (e.target.type === 'date' || e.target.type === 'datetime-local')) {
                // 1. 4 Haneli Yıl Sınırlaması (Max 9999)
                const isDateTime = e.target.type === 'datetime-local';
                const maxVal = isDateTime ? "9999-12-31T23:59" : "9999-12-31";
                if (!e.target.hasAttribute('max')) {
                    e.target.setAttribute('max', maxVal);
                }
            }
        };

        // Capture phase to catch all focus events
        window.addEventListener('focus', handleFocus, true);
        return () => window.removeEventListener('focus', handleFocus, true);
    }, []);

    // 3.2 URL TEMİZLİK (Soru işaretini kaldır)
    useEffect(() => {
        if (window.location.search) {
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, []);

    // 4. HELPER FUNCTIONS (View-Specific Logic)
    const cikisYap = async () => {
        await authLogout();
        setAlanKodu("");
        localStorage.removeItem("alan_kodu");
    }

    const kodIleGiris = (e) => {
        e.preventDefault();
        if (!girilenKod) return;
        localStorage.setItem("alan_kodu", girilenKod);
        setAlanKodu(girilenKod);
        window.location.reload();
    }

    const koddanCikis = () => {
        setAktifModal('cikis_onay');
    }

    const handleConfirmLogout = () => {
        localStorage.removeItem("alan_kodu");
        setAlanKodu("");
        window.location.reload();
    }

    // Modal Control Wrapper
    const modalAc = (tip, veri) => {
        setAktifModal(tip);
        setSeciliVeri(veri);

        // Fill Forms based on Type
        if (tip === 'duzenle_hesap') budgetActions.fillAccountForm(veri);
        if (tip === 'duzenle_islem') budgetActions.fillTransactionForm(veri);
        if (tip === 'duzenle_abonelik') budgetActions.fillSubscriptionForm(veri);
        if (tip === 'duzenle_taksit') budgetActions.fillInstallmentForm(veri);
        if (tip === 'duzenle_maas') budgetActions.fillSalaryForm(veri);
        if (tip === 'duzenle_bekleyen_fatura') budgetActions.fillBillForm(veri);
        if (tip === 'fatura_tanim_duzenle') budgetActions.fillBillDefForm(veri); // If exists
        if (tip === 'kredi_karti_ode') budgetActions.fillCCForm(veri);
        if (tip === 'satis') budgetActions.setIslemTutar(veri.guncelFiyat || veri.alisFiyati);
        if (tip === 'duzenle_portfoy') investmentActions.fillPortfolioForm(veri);
        if (tip === 'tahsilat_ekle') investmentActions.setTahsilatTutar(veri.satisFiyati - veri.tahsilEdilen);
    }

    // Settings Updaters
    const onLimitChange = (e) => {
        data.setAylikLimit(e.target.value);
        setDoc(doc(db, "ayarlar", alanKodu), { limit: e.target.value }, { merge: true });
    }
    const onKategoriUpdate = (y) => {
        data.setKategoriListesi(y);
        setDoc(doc(db, "ayarlar", alanKodu), { kategoriler: y }, { merge: true });
    }
    const onYatirimTuruUpdate = (y) => {
        data.setYatirimTurleri(y);
        setDoc(doc(db, "ayarlar", alanKodu), { yatirimTurleri: y }, { merge: true });
    }

    // --- RENDERING ---

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Yükleniyor...</div>;

    if (!user) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)', color: 'white', fontFamily: 'Segoe UI' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀 CÜZDANIM</h1>
            <p style={{ marginBottom: '40px' }}>Bütçen kontrol altında.</p>
            <button onClick={girisYap} style={{ padding: '15px 40px', fontSize: '1.1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', background: 'white', color: '#1a2980', fontWeight: 'bold' }}>Google ile Giriş Yap</button>
            <ToastContainer />
        </div>
    );

    if (!alanKodu) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7fafc', fontFamily: 'Segoe UI' }}>
            <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>🔑 Kişisel Alan Girişi</h2>
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>Verilerini sakladığın kodu gir.</p>
                <form onSubmit={kodIleGiris}>
                    <input placeholder="Kod Belirle (Örn: TALHA_EV)" value={girilenKod} onChange={e => setGirilenKod(e.target.value.toUpperCase())} style={inputStyle} required />
                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>GİRİŞ YAP</button>
                </form>
                <div style={{ marginTop: '15px', fontSize: '12px', color: '#a0aec0' }}>Kullanıcı: {user.email}</div>
                <button onClick={cikisYap} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>Hesaptan Çık</button>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI', width: '100vw', boxSizing: 'border-box', background: '#f7f9fc', minHeight: '100vh', color: '#333', overflowX: 'hidden' }}>
            <ToastContainer position="top-right" autoClose={2000} theme="light" />

            <ModalManager
                aktifModal={aktifModal} setAktifModal={setAktifModal}
                seciliVeri={seciliVeri}
                hesaplar={data.hesaplar}
                // Budget Actions & State
                hesapAdi={budgetActions.hesapAdi} setHesapAdi={budgetActions.setHesapAdi}
                hesapTipi={budgetActions.hesapTipi} setHesapTipi={budgetActions.setHesapTipi}
                baslangicBakiye={budgetActions.baslangicBakiye} setBaslangicBakiye={budgetActions.setBaslangicBakiye}
                hesapKesimGunu={budgetActions.hesapKesimGunu} setHesapKesimGunu={budgetActions.setHesapKesimGunu}
                hesapDuzenle={budgetActions.hesapDuzenle}
                islemAciklama={budgetActions.islemAciklama} setIslemAciklama={budgetActions.setIslemAciklama}
                islemTutar={budgetActions.islemTutar} setIslemTutar={budgetActions.setIslemTutar}
                islemTarihi={budgetActions.islemTarihi} setIslemTarihi={budgetActions.setIslemTarihi}
                // NEW: Quantity & Unit Price Props
                islemAdet={budgetActions.islemAdet} setIslemAdet={budgetActions.setIslemAdet}
                islemBirimFiyat={budgetActions.islemBirimFiyat} setIslemBirimFiyat={budgetActions.setIslemBirimFiyat}
                kategori={budgetActions.kategori} setKategori={budgetActions.setKategori}
                yatirimTurleri={data.yatirimTurleri}
                kategoriListesi={data.kategoriListesi}
                islemDuzenle={budgetActions.islemDuzenle}
                aboAd={budgetActions.aboAd} setAboAd={budgetActions.setAboAd}
                aboTutar={budgetActions.aboTutar} setAboTutar={budgetActions.setAboTutar}
                aboGun={budgetActions.aboGun} setAboGun={budgetActions.setAboGun}
                aboHesapId={budgetActions.aboHesapId} setAboHesapId={budgetActions.setAboHesapId}
                aboKategori={budgetActions.aboKategori} setAboKategori={budgetActions.setAboKategori}
                abonelikDuzenle={budgetActions.abonelikDuzenle}
                taksitBaslik={budgetActions.taksitBaslik} setTaksitBaslik={budgetActions.setTaksitBaslik}
                taksitToplamTutar={budgetActions.taksitToplamTutar} setTaksitToplamTutar={budgetActions.setTaksitToplamTutar}
                taksitSayisi={budgetActions.taksitSayisi} setTaksitSayisi={budgetActions.setTaksitSayisi}
                taksitHesapId={budgetActions.taksitHesapId} setTaksitHesapId={budgetActions.setTaksitHesapId}
                taksitKategori={budgetActions.taksitKategori} setTaksitKategori={budgetActions.setTaksitKategori}
                taksitAlisTarihi={budgetActions.taksitAlisTarihi} setTaksitAlisTarihi={budgetActions.setTaksitAlisTarihi}
                taksitDuzenle={budgetActions.taksitDuzenle}
                maasAd={budgetActions.maasAd} setMaasAd={budgetActions.setMaasAd}
                maasTutar={budgetActions.maasTutar} setMaasTutar={budgetActions.setMaasTutar}
                maasGun={budgetActions.maasGun} setMaasGun={budgetActions.setMaasGun}
                maasHesapId={budgetActions.maasHesapId} setMaasHesapId={budgetActions.setMaasHesapId}
                maasDuzenle={budgetActions.maasDuzenle}
                kkOdemeKartId={budgetActions.kkOdemeKartId}
                kkOdemeKaynakId={budgetActions.kkOdemeKaynakId} setKkOdemeKaynakId={budgetActions.setKkOdemeKaynakId}
                kkOdemeTutar={budgetActions.kkOdemeTutar} setKkOdemeTutar={budgetActions.setKkOdemeTutar}
                krediKartiBorcOde={budgetActions.krediKartiBorcOde}
                faturaOde={budgetActions.faturaOde}
                tanimliFaturalar={data.tanimliFaturalar}
                faturaGirisTutar={budgetActions.faturaGirisTutar} setFaturaGirisTutar={budgetActions.setFaturaGirisTutar}
                faturaGirisTarih={budgetActions.faturaGirisTarih} setFaturaGirisTarih={budgetActions.setFaturaGirisTarih}
                faturaGirisAciklama={budgetActions.faturaGirisAciklama} setFaturaGirisAciklama={budgetActions.setFaturaGirisAciklama}
                bekleyenFaturaDuzenle={budgetActions.bekleyenFaturaDuzenle}
                tanimBaslik={budgetActions.tanimBaslik} setTanimBaslik={budgetActions.setTanimBaslik}
                tanimKurum={budgetActions.tanimKurum} setTanimKurum={budgetActions.setTanimKurum}
                tanimAboneNo={budgetActions.tanimAboneNo} setTanimAboneNo={budgetActions.setTanimAboneNo}
                faturaTanimDuzenle={budgetActions.faturaTanimDuzenle}
                alanKodu={alanKodu}
                verileriTasi={budgetActions.verileriTasi}
                yeniKodInput={budgetActions.yeniKodInput} setYeniKodInput={budgetActions.setYeniKodInput}
                tasimaIslemiSuruyor={budgetActions.tasimaIslemiSuruyor}
                satisYap={(e) => investmentActions.satisYap(seciliVeri, budgetActions.secilenHesapId, budgetActions.islemTutar)}
                secilenHesapId={budgetActions.secilenHesapId} setSecilenHesapId={budgetActions.setSecilenHesapId}
                onKategoriUpdate={onKategoriUpdate}
                onYatirimTuruUpdate={onYatirimTuruUpdate}
                gizliMod={gizliMod}
                besKesintiEkle={investmentActions.besKesintiEkle}
                besKesintiSil={investmentActions.besKesintiSil}
                // Investment Edit Props
                portfoyDuzenle={investmentActions.portfoyDuzenle}
                sembol={investmentActions.sembol}
                adet={investmentActions.adet} setAdet={investmentActions.setAdet}
                alisFiyati={investmentActions.alisFiyati} setAlisFiyati={investmentActions.setAlisFiyati}
                varlikTuru={investmentActions.varlikTuru} setVarlikTuru={investmentActions.setVarlikTuru}
                tahsilatTutar={investmentActions.tahsilatTutar} setTahsilatTutar={investmentActions.setTahsilatTutar}
                satisTahsilatEkle={investmentActions.satisTahsilatEkle}
                pozisyonGuncelle={investmentActions.pozisyonGuncelle} // NEW PROP assigned
                pozisyonSil={investmentActions.pozisyonSil} // NEW PROP assigned
                onConfirmLogout={handleConfirmLogout}
                // FIXED: Passing missing action props
                maasEkle={budgetActions.maasEkle}
                hesapEkle={budgetActions.hesapEkle}
                faturaTanimEkle={budgetActions.faturaTanimEkle}
                abonelikEkle={budgetActions.abonelikEkle}
                gecmisIslemEkle={investmentActions.gecmisIslemEkle}
            />

            <Header
                alanKodu={alanKodu}
                anaSekme={anaSekme}
                setAnaSekme={setAnaSekme}
                gizliMod={gizliMod}
                setGizliMod={setGizliMod}
                user={user}
                setAktifModal={setAktifModal}
                koddanCikis={koddanCikis}
                cikisYap={cikisYap}
            />

            <Notifications
                bildirimler={calculations.bildirimler.filter(b => {
                    if (anaSekme === 'butcem') return ['fatura', 'abonelik', 'maas', 'kk_hatirlatma'].includes(b.tip);
                    if (anaSekme === 'yatirimlar') return ['bes_odeme'].includes(b.tip);
                    if (anaSekme === 'hedefler') return ['alacak'].includes(b.tip);
                    return false;
                })}
                gizliMod={gizliMod}
                abonelikOde={budgetActions.abonelikOde}
                taksitOde={budgetActions.taksitOde}
                maasYatir={budgetActions.maasYatir}
                modalAc={modalAc}
                besOdemeYap={() => investmentActions.besOdemeYap(null, budgetActions.islemEkle)}
            />

            {/* BÜTÇEM DASHBOARD */}
            {anaSekme === "butcem" && (
                <BudgetDashboard
                    // Data
                    aktifAy={calculations.aktifAy} setAktifAy={calculations.setAktifAy}
                    toplamGelir={calculations.toplamGelir}
                    bugunGider={calculations.bugunGider}
                    toplamGider={calculations.toplamGider}
                    gunlukVeri={calculations.gunlukVeri}
                    gunlukOrtalama={calculations.gunlukOrtalama}
                    kategoriVerisi={calculations.kategoriVerisi}
                    gizliMod={gizliMod}
                    aylikLimit={data.aylikLimit}
                    onLimitChange={onLimitChange}
                    harcananLimit={calculations.harcananLimit}
                    limitYuzdesi={calculations.limitYuzdesi}
                    limitRenk={calculations.limitRenk}
                    maaslar={data.maaslar}
                    hesaplar={data.hesaplar}
                    filtrelenmisIslemler={calculations.filtrelenmisIslemler}
                    sadeceCuzdanNakiti={calculations.sadeceCuzdanNakiti}
                    genelToplamYatirimGucu={calculations.genelToplamYatirimGucu}
                    netVarlik={calculations.netVarlik}
                    tanimliFaturalar={data.tanimliFaturalar}
                    bekleyenFaturalar={data.bekleyenFaturalar}
                    taksitler={data.taksitler}
                    toplamKalanTaksitBorcu={calculations.toplamKalanTaksitBorcu}
                    abonelikler={data.abonelikler}
                    toplamSabitGider={calculations.toplamSabitGider}
                    kategoriListesi={data.kategoriListesi}
                    mevcutAylar={calculations.mevcutAylar}
                    aramaMetni={calculations.aramaMetni} setAramaMetni={calculations.setAramaMetni}
                    filtreKategori={calculations.filtreKategori} setFiltreKategori={calculations.setFiltreKategori}

                    // Actions & States
                    modalAc={modalAc}
                    normalSil={budgetActions.normalSil}
                    maasEkle={budgetActions.maasEkle}
                    maasAd={budgetActions.maasAd} setMaasAd={budgetActions.setMaasAd}
                    maasTutar={budgetActions.maasTutar} setMaasTutar={budgetActions.setMaasTutar}
                    maasGun={budgetActions.maasGun} setMaasGun={budgetActions.setMaasGun}
                    maasHesapId={budgetActions.maasHesapId} setMaasHesapId={budgetActions.setMaasHesapId}

                    hesapEkle={budgetActions.hesapEkle}
                    hesapAdi={budgetActions.hesapAdi} setHesapAdi={budgetActions.setHesapAdi}
                    hesapTipi={budgetActions.hesapTipi} setHesapTipi={budgetActions.setHesapTipi}
                    baslangicBakiye={budgetActions.baslangicBakiye} setBaslangicBakiye={budgetActions.setBaslangicBakiye}

                    pozisyonGuncelle={investmentActions.pozisyonGuncelle} // NEW: Pass to Modal Manager

                    faturaTanimEkle={budgetActions.faturaTanimEkle}
                    tanimBaslik={budgetActions.tanimBaslik} setTanimBaslik={budgetActions.setTanimBaslik}
                    tanimKurum={budgetActions.tanimKurum} setTanimKurum={budgetActions.setTanimKurum}
                    tanimAboneNo={budgetActions.tanimAboneNo} setTanimAboneNo={budgetActions.setTanimAboneNo}

                    taksitOde={budgetActions.taksitOde}
                    abonelikOde={budgetActions.abonelikOde}

                    abonelikEkle={budgetActions.abonelikEkle}
                    aboAd={budgetActions.aboAd} setAboAd={budgetActions.setAboAd}
                    aboTutar={budgetActions.aboTutar} setAboTutar={budgetActions.setAboTutar}
                    aboGun={budgetActions.aboGun} setAboGun={budgetActions.setAboGun}
                    aboKategori={budgetActions.aboKategori} setAboKategori={budgetActions.setAboKategori}
                    aboHesapId={budgetActions.aboHesapId} setAboHesapId={budgetActions.setAboHesapId}

                    formTab={formTab} setFormTab={setFormTab}
                    islemEkle={budgetActions.islemEkle}
                    transferYap={budgetActions.transferYap}
                    taksitEkle={budgetActions.taksitEkle}
                    faturaGir={budgetActions.faturaGir}
                    secilenHesapId={budgetActions.secilenHesapId} setSecilenHesapId={budgetActions.setSecilenHesapId}
                    islemTipi={budgetActions.islemTipi} setIslemTipi={budgetActions.setIslemTipi}
                    kategori={budgetActions.kategori} setKategori={budgetActions.setKategori}
                    islemAciklama={budgetActions.islemAciklama} setIslemAciklama={budgetActions.setIslemAciklama}
                    islemTutar={budgetActions.islemTutar} setIslemTutar={budgetActions.setIslemTutar}
                    islemTarihi={budgetActions.islemTarihi} setIslemTarihi={budgetActions.setIslemTarihi}
                    transferKaynakId={budgetActions.transferKaynakId} setTransferKaynakId={budgetActions.setTransferKaynakId}
                    transferHedefId={budgetActions.transferHedefId} setTransferHedefId={budgetActions.setTransferHedefId}
                    transferTutar={budgetActions.transferTutar} setTransferTutar={budgetActions.setTransferTutar}
                    transferUcreti={budgetActions.transferUcreti} setTransferUcreti={budgetActions.setTransferUcreti}
                    transferTarihi={budgetActions.transferTarihi} setTransferTarihi={budgetActions.setTransferTarihi}
                    taksitBaslik={budgetActions.taksitBaslik} setTaksitBaslik={budgetActions.setTaksitBaslik}
                    taksitHesapId={budgetActions.taksitHesapId} setTaksitHesapId={budgetActions.setTaksitHesapId}
                    taksitToplamTutar={budgetActions.taksitToplamTutar} setTaksitToplamTutar={budgetActions.setTaksitToplamTutar}
                    taksitSayisi={budgetActions.taksitSayisi} setTaksitSayisi={budgetActions.setTaksitSayisi}
                    taksitKategori={budgetActions.taksitKategori} setTaksitKategori={budgetActions.setTaksitKategori}
                    taksitAlisTarihi={budgetActions.taksitAlisTarihi} setTaksitAlisTarihi={budgetActions.setTaksitAlisTarihi}
                    secilenTanimId={budgetActions.secilenTanimId} setSecilenTanimId={budgetActions.setSecilenTanimId}
                    faturaGirisTutar={budgetActions.faturaGirisTutar} setFaturaGirisTutar={budgetActions.setFaturaGirisTutar}
                    faturaGirisTarih={budgetActions.faturaGirisTarih} setFaturaGirisTarih={budgetActions.setFaturaGirisTarih}
                    faturaGirisAciklama={budgetActions.faturaGirisAciklama} setFaturaGirisAciklama={budgetActions.setFaturaGirisAciklama}

                    excelIndir={() => budgetActions.excelIndir(data.islemler)}
                    excelYukle={budgetActions.excelYukle}
                    islemSil={budgetActions.islemSil}
                />
            )}

            {/* YATIRIM DASHBOARD */}
            {anaSekme === "yatirimlar" && (
                <InvestmentDashboard
                    gizliMod={gizliMod}
                    genelToplamYatirimGucu={calculations.genelToplamYatirimGucu}
                    portfoyGuncelDegeri={calculations.portfoyGuncelDegeri}
                    toplamKarZarar={calculations.toplamKarZarar}
                    toplamYatirimHesapNakiti={calculations.toplamYatirimHesapNakiti}
                    kartYatirimToplami={calculations.kartYatirimToplami}
                    toplamDovizVarligi={calculations.toplamDovizVarligi}
                    toplamBesVarligi={calculations.toplamBesVarligi}
                    kartNakitToplami={calculations.kartNakitToplami}
                    genelVarlikVerisi={calculations.genelVarlikVerisi}
                    portfoyVerisi={calculations.portfoyVerisi}
                    portfoy={data.portfoy}
                    modalAc={modalAc}
                    piyasalariGuncelle={() => investmentActions.piyasalariGuncelle(data.portfoy)}
                    guncelleniyor={investmentActions.guncelleniyor}
                    yatirimAl={investmentActions.yatirimAl}
                    sembol={investmentActions.sembol} setSembol={investmentActions.setSembol}
                    adet={investmentActions.adet} setAdet={investmentActions.setAdet}
                    alisFiyati={investmentActions.alisFiyati} setAlisFiyati={investmentActions.setAlisFiyati}
                    varlikTuru={investmentActions.varlikTuru} setVarlikTuru={investmentActions.setVarlikTuru}
                    yatirimHesapId={investmentActions.yatirimHesapId} setYatirimHesapId={investmentActions.setYatirimHesapId}
                    yatirimTurleri={data.yatirimTurleri}
                    hesaplar={data.hesaplar}
                    yatirimIslemleri={calculations.yatirimIslemleri}
                    tumIslemler={data.islemler} // NEW: Pass all transactions for All-Time Analysis
                    yatirimArama={calculations.yatirimArama} setYatirimArama={calculations.setYatirimArama}
                    aktifYatirimAy={calculations.aktifYatirimAy} setAktifYatirimAy={calculations.setAktifYatirimAy}
                    filtreYatirimTuru={calculations.filtreYatirimTuru} setFiltreYatirimTuru={calculations.setFiltreYatirimTuru}
                    mevcutAylar={calculations.mevcutAylar}
                    islemSil={budgetActions.islemSil}
                    portfoySil={investmentActions.portfoySil}
                    fiyatGuncelle={investmentActions.fiyatGuncelle}
                    pozisyonSil={investmentActions.pozisyonSil} // NEW PROP assigned
                    // BES Module Props
                    besVerisi={data.besVerisi}
                    toplamBesYatirimi={calculations.toplamBesYatirimi}
                    besGuncelle={investmentActions.besGuncelle}
                    besOdemeYap={investmentActions.besOdemeYap}
                    islemEkle={budgetActions.islemEkle}
                />
            )}

            {/* HEDEFLER & ENVANTER DASHBOARD */}
            {anaSekme === "hedefler" && (
                <GoalsInventory
                    gizliMod={gizliMod}
                    hedefler={data.hedefler}
                    envanter={data.envanter}
                    satislar={data.satislar}
                    actions={investmentActions}
                    genelToplamYatirimGucu={calculations.genelToplamYatirimGucu}
                />
            )}
        </div>
    );
}

export default App;