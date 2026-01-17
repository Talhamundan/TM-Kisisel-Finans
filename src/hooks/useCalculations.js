import { useState, useEffect, useMemo } from 'react';
import { ayIsmiGetir, formatCurrencyPlain } from '../utils/helpers';

export const useCalculations = (
    data, // { hesaplar, islemler, portfoy, abonelikler, taksitler, maaslar, bekleyenFaturalar, tanimliFaturalar }
    gizliMod,
    aylikLimit
) => {
    const { hesaplar, islemler, portfoy, abonelikler, taksitler, maaslar, bekleyenFaturalar, tanimliFaturalar, besVerisi, satislar } = data;

    // --- FILTER STATES ---
    const [aktifAy, setAktifAy] = useState(new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }));
    const [aramaMetni, setAramaMetni] = useState("");
    const [filtreKategori, setFiltreKategori] = useState("Tümü");

    // Yatırım Filtreleri
    const [yatirimArama, setYatirimArama] = useState("");
    const [aktifYatirimAy, setAktifYatirimAy] = useState(new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }));
    const [filtreYatirimTuru, setFiltreYatirimTuru] = useState("Tümü");

    const [bildirimler, setBildirimler] = useState([]);

    // --- CALCULATIONS ---
    const formatPara = (tutar) => gizliMod ? "**** ₺" : (parseFloat(tutar) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";

    // 1. Filtrelenmis Islemler (Bütçe)
    const filtrelenmisIslemler = useMemo(() => {
        return islemler.filter(i => {
            const besDegil = i.kategori !== "BES";
            const yatirimAlisDegil = i.islemTipi !== "yatirim_alis";
            const yatirimDegil = i.kategori !== "Yatırım";
            const ayUyumu = aktifAy === "Tümü" ? true : ayIsmiGetir(i.tarih) === aktifAy;
            const aramaKucuk = aramaMetni.toLowerCase();
            const metinUyumu = !aramaMetni ? true : (
                (i.aciklama && i.aciklama.toLowerCase().includes(aramaKucuk)) ||
                (i.kategori && i.kategori.toLowerCase().includes(aramaKucuk)) ||
                i.tutar.toString().includes(aramaMetni)
            );
            const kategoriUyumu = filtreKategori === "Tümü" ? true : i.kategori === filtreKategori;
            return besDegil && yatirimAlisDegil && yatirimDegil && ayUyumu && metinUyumu && kategoriUyumu;
        });
    }, [islemler, aktifAy, aramaMetni, filtreKategori]);

    // 2. Yatırım Islemleri
    const yatirimIslemleri = useMemo(() => {
        return islemler.filter(i => {
            const yatirimMi = i.kategori === "Yatırım" || i.kategori === "BES" || i.islemTipi === "yatirim_alis" || i.islemTipi === "yatirim_satis";
            const ayUyumu = aktifYatirimAy === "Tümü" ? true : ayIsmiGetir(i.tarih) === aktifYatirimAy;
            const aramaKucuk = yatirimArama.toLowerCase();
            const metinUyumu = !yatirimArama ? true : (
                (i.aciklama && i.aciklama.toLowerCase().includes(aramaKucuk)) ||
                i.tutar.toString().includes(yatirimArama)
            );
            const turUyumu = filtreYatirimTuru === "Tümü" ? true : i.yatirimTuru === filtreYatirimTuru;
            return yatirimMi && ayUyumu && metinUyumu && turUyumu;
        });
    }, [islemler, aktifYatirimAy, yatirimArama, filtreYatirimTuru]);

    const mevcutAylar = ["Tümü", ...new Set(islemler.map(i => ayIsmiGetir(i.tarih)))];

    // Totals
    const bugunGider = filtrelenmisIslemler.filter(i => {
        const d = new Date(i.tarih.seconds * 1000);
        return i.islemTipi === 'gider' &&
            d.getDate() === new Date().getDate() &&
            d.getMonth() === new Date().getMonth() &&
            d.getFullYear() === new Date().getFullYear();
    }).reduce((acc, i) => acc + i.tutar, 0);

    const toplamGelir = filtrelenmisIslemler.filter(i => i.islemTipi === 'gelir').reduce((acc, i) => acc + i.tutar, 0);
    const toplamGider = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider').reduce((acc, i) => acc + i.tutar, 0);
    const harcananLimit = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider' && i.kategori !== 'Transfer' && i.kategori !== 'Kira' && i.kategori !== 'Kira/Aidat' && i.kategori !== 'Yatırım').reduce((acc, i) => acc + i.tutar, 0);
    const limitYuzdesi = Math.min((harcananLimit / aylikLimit) * 100, 100);
    const limitRenk = limitYuzdesi > 90 ? '#e53e3e' : limitYuzdesi > 75 ? '#dd6b20' : '#48bb78';

    // Charts
    const kategoriVerisi = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider' && i.kategori !== 'Transfer').reduce((acc, curr) => { const mevcut = acc.find(item => item.name === curr.kategori); if (mevcut) { mevcut.value += curr.tutar; } else { acc.push({ name: curr.kategori, value: curr.tutar }); } return acc; }, []);
    const gunlukVeri = filtrelenmisIslemler.filter(i => i.islemTipi === 'gider').reduce((acc, curr) => { const gun = new Date(curr.tarih.seconds * 1000).getDate(); const mevcut = acc.find(item => item.name === gun); if (mevcut) mevcut.value += curr.tutar; else acc.push({ name: gun, value: curr.tutar }); return acc; }, []).sort((a, b) => a.name - b.name);

    let gunlukOrtalama = 0;
    if (aktifAy !== "Tümü") {
        const parcalar = aktifAy.split(" ");
        const ayIsmi = parcalar[0];
        const yil = parseInt(parcalar[1]);
        const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        const ayIndex = aylar.indexOf(ayIsmi);
        if (ayIndex > -1 && !isNaN(yil)) {
            const simdi = new Date();
            let gunSayisi = 1;
            if (simdi.getMonth() === ayIndex && simdi.getFullYear() === yil) {
                gunSayisi = Math.max(1, simdi.getDate());
            } else {
                gunSayisi = new Date(yil, ayIndex + 1, 0).getDate();
            }
            gunlukOrtalama = toplamGider / gunSayisi;
        }
    }

    // --- YATIRIM & PORTFÖY ---
    const portfoyGuncelDegeri = portfoy.reduce((acc, p) => acc + (p.adet * (p.guncelFiyat || p.alisFiyati)), 0);
    const toplamKarZarar = portfoyGuncelDegeri - portfoy.reduce((acc, p) => acc + (p.adet * p.alisFiyati), 0);
    const portfoyVerisi = portfoy.reduce((acc, curr) => { const guncelTutar = curr.adet * (curr.guncelFiyat || curr.alisFiyati); const mevcut = acc.find(item => item.name === curr.sembol); if (mevcut) { mevcut.value += guncelTutar; } else { acc.push({ name: curr.sembol, value: guncelTutar }); } return acc; }, []);

    const toplamKalanTaksitBorcu = taksitler.reduce((acc, t) => acc + (t.toplamTutar - (t.aylikTutar * t.odenmisTaksit)), 0);
    const toplamSabitGider = abonelikler.reduce((acc, abo) => acc + abo.tutar, 0);
    const toplamNakitVarlik = hesaplar.reduce((acc, h) => acc + (parseFloat(h.guncelBakiye) || 0), 0);
    const netVarlik = toplamNakitVarlik + portfoyGuncelDegeri + (besVerisi?.guncelTutar || 0);

    // Helper for categorization
    const isAltinOrGumus = (p) => {
        const t = p.varlikTuru?.toLowerCase() || "";
        const s = p.sembol?.toUpperCase() || "";
        return t === 'altin' || t === 'gümüş' || t === 'gumus' || s === 'GAUTRY' || s === 'GMSTR' || s === 'GOLD' || s.includes('GLD') || s === 'ALTIN' || s === 'GUMUS';
    };

    const portfoyYatirimDegeri = portfoy.filter(p => !['doviz', 'bes'].includes(p.varlikTuru?.toLowerCase()) && !isAltinOrGumus(p)).reduce((acc, p) => acc + (p.adet * (p.guncelFiyat || p.alisFiyati)), 0);
    const toplamDovizVarligi = portfoy.filter(p => p.varlikTuru?.toLowerCase() === 'doviz').reduce((acc, p) => acc + (p.adet * (p.guncelFiyat || p.alisFiyati)), 0);
    const toplamBesVarligi = (besVerisi?.guncelTutar || 0) + portfoy.filter(p => p.varlikTuru?.toLowerCase() === 'bes').reduce((acc, p) => acc + (p.adet * (p.guncelFiyat || p.alisFiyati)), 0);
    const toplamAltinVarligi = portfoy.filter(p => isAltinOrGumus(p)).reduce((acc, p) => acc + (p.adet * (p.guncelFiyat || p.alisFiyati)), 0);
    const toplamYatirimHesapNakiti = hesaplar.filter(h => h.hesapTipi === 'yatirim').reduce((acc, h) => acc + (parseFloat(h.guncelBakiye) || 0), 0);
    const toplamBesYatirimi = islemler.filter(i => i.kategori === 'BES' && i.islemTipi === 'gider').reduce((acc, i) => acc + i.tutar, 0);

    // Net nakit (cüzdan)
    const sadeceCuzdanNakiti = toplamNakitVarlik - toplamYatirimHesapNakiti;

    // FIX: Gold/Silver should be grouped with Currency (Döviz), NOT Stocks (Hisse)
    const kartYatirimToplami = portfoyYatirimDegeri; // Sadece Hisse/Fon
    const displayDovizVarligi = toplamDovizVarligi + toplamAltinVarligi; // Döviz + Altın

    const kartNakitToplami = toplamYatirimHesapNakiti;
    const genelToplamYatirimGucu = portfoyGuncelDegeri + toplamYatirimHesapNakiti + (besVerisi?.guncelTutar || 0);

    const genelVarlikVerisi = [
        { name: 'Hisse', value: kartYatirimToplami },
        { name: 'Döviz', value: displayDovizVarligi },
        { name: 'BES', value: toplamBesVarligi },
        { name: 'Nakit', value: kartNakitToplami }
    ].filter(item => item.value > 0);


    // --- BİLDİRİM LOGIC (useEffect) ---
    useEffect(() => {
        // App.jsx:238 logic
        if (islemler.length === 0 && abonelikler.length === 0 && taksitler.length === 0 && maaslar.length === 0 && hesaplar.length === 0 && bekleyenFaturalar.length === 0) return;
        const bugun = new Date();
        const mevcutAy = bugun.getMonth();
        const mevcutYil = bugun.getFullYear();
        const mevcutGun = bugun.getDate();
        let tempBildirimler = [];

        // 1. Kredi Kartı
        hesaplar.forEach(h => {
            if (h.hesapTipi === 'krediKarti' && h.kesimGunu) {
                const kesimGunuInt = parseInt(h.kesimGunu);
                if (mevcutGun >= kesimGunuInt && mevcutGun < kesimGunuInt + 10) {
                    const odemeYapildiMi = islemler.some(islem => {
                        const t = new Date(islem.tarih.seconds * 1000);
                        return t.getMonth() === mevcutAy && t.getFullYear() === mevcutYil && t.getDate() >= kesimGunuInt && (islem.hedefId === h.id || islem.hesapId === h.id) && (islem.islemTipi === 'transfer' || islem.islemTipi === 'gelir');
                    });
                    if (!odemeYapildiMi && h.guncelBakiye < 0) {
                        tempBildirimler.push({ id: h.id + '_kk', tip: 'kk_hatirlatma', mesaj: `💳 ${h.hesapAdi} ekstresi kesildi!`, tutar: Math.abs(h.guncelBakiye), data: h, renk: 'orange' });
                    }
                }
            }
        });

        // 2. BES Kontrolü
        if (besVerisi && besVerisi.durum !== 'durduruldu') {
            const odemeGunu = besVerisi.odemeGunu || 15;
            // Check if payment made this month
            const besOdendi = islemler.some(i =>
                i.kategori === 'BES' &&
                i.islemTipi === 'gider' &&
                new Date(i.tarih.seconds * 1000).getMonth() === mevcutAy &&
                new Date(i.tarih.seconds * 1000).getFullYear() === mevcutYil
            );

            if (!besOdendi && mevcutGun >= odemeGunu) {
                tempBildirimler.push({ id: 'bes-gecikme', tip: 'bes_odeme', mesaj: '⚠️ BES Ödemesi Gecikti!', tutar: parseFloat(besVerisi.aylikTutar) || 0, data: besVerisi, renk: 'red' });
            }
        }

        // 3. Maaş
        maaslar.forEach(maas => {
            if (mevcutGun >= maas.gun) {
                const yattiMi = islemler.some(islem => {
                    const islemTarih = new Date(islem.tarih.seconds * 1000);
                    return islemTarih.getMonth() === mevcutAy && islemTarih.getFullYear() === mevcutYil && islem.aciklama.toLowerCase().includes(maas.ad.toLowerCase()) && islem.islemTipi === 'gelir';
                });
                if (!yattiMi) tempBildirimler.push({ id: maas.id, tip: 'maas', mesaj: `💰 ${maas.ad} günü geldi!`, tutar: maas.tutar, data: maas, renk: 'green' });
            }
        });

        // 3. Abonelik
        abonelikler.forEach(abo => {
            if (mevcutGun >= abo.gun) {
                const odendiMi = islemler.some(islem => {
                    const islemTarih = new Date(islem.tarih.seconds * 1000);
                    return islemTarih.getMonth() === mevcutAy && islemTarih.getFullYear() === mevcutYil && islem.aciklama.toLowerCase().includes(abo.ad.toLowerCase());
                });
                if (!odendiMi) tempBildirimler.push({ id: abo.id, tip: 'abonelik', mesaj: `⚠️ ${abo.ad} ödenmedi! (${abo.gun}. gün)`, tutar: abo.tutar, data: abo, renk: 'red' });
            }
        });

        // 4. Faturalar
        bekleyenFaturalar.forEach(f => {
            if (f.sonOdemeTarihi) {
                const sonOdeme = new Date(f.sonOdemeTarihi);
                const sO = new Date(sonOdeme.setHours(0, 0, 0, 0));
                const bG = new Date(bugun.setHours(0, 0, 0, 0));
                const kalanGun = Math.ceil((sO - bG) / (1000 * 60 * 60 * 24));
                const tanim = tanimliFaturalar.find(t => t.id === f.tanimId);
                const ad = tanim ? tanim.baslik : "Bilinmeyen Fatura";
                if (kalanGun < 0) {
                    tempBildirimler.push({ id: f.id, tip: 'fatura', mesaj: `🔥 ${ad} GECİKTİ! (${Math.abs(kalanGun)} gün)`, tutar: f.tutar, data: f, renk: 'red' });
                } else if (kalanGun <= 5) {
                    tempBildirimler.push({ id: f.id, tip: 'fatura', mesaj: `⚠️ ${ad} için son ${kalanGun} gün!`, tutar: f.tutar, data: f, renk: 'orange' });
                }
            }
        });

        // 5. Alacaklar (Satışlar)
        if (satislar && satislar.length > 0) {
            satislar.forEach(s => {
                const kalan = s.satisFiyati - s.tahsilEdilen;
                if (kalan > 1) { // 1 TL tolerans
                    tempBildirimler.push({
                        id: s.id + '_alacak',
                        tip: 'alacak',
                        mesaj: `🔔 ${s.alici}, ${s.urunAdi} için kalan ${formatCurrencyPlain(kalan)} ödemesini henüz yapmadı.`,
                        tutar: kalan,
                        data: s,
                        renk: 'purple'
                    });
                }
            });
        }

        setBildirimler(tempBildirimler);
    }, [islemler, abonelikler, taksitler, maaslar, hesaplar, bekleyenFaturalar, tanimliFaturalar, satislar]);

    return {
        // Filters
        aktifAy, setAktifAy, aramaMetni, setAramaMetni, filtreKategori, setFiltreKategori,
        yatirimArama, setYatirimArama, aktifYatirimAy, setAktifYatirimAy, filtreYatirimTuru, setFiltreYatirimTuru,
        mevcutAylar,

        // Data
        filtrelenmisIslemler, yatirimIslemleri,
        bugunGider, toplamGelir, toplamGider, harcananLimit, limitYuzdesi, limitRenk,
        kategoriVerisi, gunlukVeri, gunlukOrtalama,

        // Investment Stats
        portfoyGuncelDegeri, toplamKarZarar, portfoyVerisi,
        genelToplamYatirimGucu, genelVarlikVerisi, toplamYatirimHesapNakiti,
        netVarlik, sadeceCuzdanNakiti, toplamKalanTaksitBorcu, toplamSabitGider,
        kartYatirimToplami, toplamDovizVarligi: displayDovizVarligi, toplamBesVarligi, kartNakitToplami, toplamBesYatirimi,

        // Others
        bildirimler,
        formatPara
    };
};
