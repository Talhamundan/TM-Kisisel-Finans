import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';

export const useInvestmentActions = (user, alanKodu) => {
    // Form States
    const [sembol, setSembol] = useState("");
    const [adet, setAdet] = useState("");
    const [alisFiyati, setAlisFiyati] = useState("");
    const [varlikTuru, setVarlikTuru] = useState("Hisse");
    const [yatirimHesapId, setYatirimHesapId] = useState("");
    const [tahsilatTutar, setTahsilatTutar] = useState("");

    // UI Logic states
    const [guncelleniyor, setGuncelleniyor] = useState(false);

    // Filter states (Moved here or in Calculations? Dashboard uses them. Investment Dashboard has logic for them.)
    // But they are not "ACTIONS". They are View State.
    // I will keep them in App.jsx or useCalculations if they are used for calculating data.
    // InvestmentDashboard receives yatirimArama etc.

    const yatirimAl = async (e) => {
        e.preventDefault();
        if (!sembol || !adet || !alisFiyati || !yatirimHesapId || !varlikTuru) return toast.error("Tüm bilgileri girin");
        const sAdet = parseFloat(adet);
        const sFiyat = parseFloat(alisFiyati);
        const toplam = sAdet * sFiyat;
        const tarih = new Date();
        await addDoc(collection(db, "portfoy"), { uid: user.uid, alanKodu, sembol: sembol.toUpperCase(), varlikTuru, adet: sAdet, alisFiyati: sFiyat, guncelFiyat: sFiyat, tarih: tarih });
        await updateDoc(doc(db, "hesaplar", yatirimHesapId), { guncelBakiye: increment(-toplam) });
        await addDoc(collection(db, "nakit_islemleri"), {
            uid: user.uid,
            alanKodu,
            hesapId: yatirimHesapId,
            islemTipi: "yatirim_alis",
            kategori: "Yatırım",
            yatirimTuru: varlikTuru,
            tutar: toplam,
            aciklama: `${sembol.toUpperCase()} Alış`,
            tarih: tarih
        });
        toast.success(`${sembol.toUpperCase()} alındı!`); setSembol(""); setAdet(""); setAlisFiyati("");
    }

    const satisYap = async (seciliVeri, secilenHesapId, satisFiyati) => {
        // App.jsx logic for simple "satisYap" used form state "islemTutar" and "secilenHesapId".
        // Here I will make it accept args to be cleaner, or use logic similar to useBudgetActions with shared state?
        // App.jsx's satisYap uses `islemTutar` (as price) and `secilenHesapId`.
        // AND `seciliVeri`.
        // Ideally we should pass these as args.
        if (!secilenHesapId || !satisFiyati) return toast.error("Hesap ve Fiyat Girin");
        const toplam = parseFloat(satisFiyati) * seciliVeri.adet;

        // Handle aggregated items (multiple IDs)
        if (seciliVeri.ids && Array.isArray(seciliVeri.ids)) {
            const promises = seciliVeri.ids.map(id => deleteDoc(doc(db, "portfoy", id)));
            await Promise.all(promises);
        } else {
            await deleteDoc(doc(db, "portfoy", seciliVeri.id));
        }

        await updateDoc(doc(db, "hesaplar", secilenHesapId), { guncelBakiye: increment(toplam) });
        await addDoc(collection(db, "nakit_islemleri"), {
            uid: user.uid,
            alanKodu,
            hesapId: secilenHesapId,
            islemTipi: "yatirim_satis",
            kategori: "Yatırım",
            yatirimTuru: seciliVeri.varlikTuru,
            tutar: toplam,
            aciklama: `${seciliVeri.sembol} Satış`,
            tarih: new Date()
        });
        toast.success("Satış gerçekleşti!");
        return true;
    }

    const fiyatGuncelle = async (id, yeniFiyat) => { if (!yeniFiyat) return; await updateDoc(doc(db, "portfoy", id), { guncelFiyat: parseFloat(yeniFiyat) }); }

    const piyasalariGuncelle = async (portfoy) => {
        setGuncelleniyor(true);
        try {
            // Döviz Verileri (Frankfurter API - Ücretsiz & Halka Açık)
            const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR");
            const data = await res.json();
            const usdTry = data.rates.TRY;
            const eurTry = (1 / data.rates.EUR) * usdTry;

            // Altın Tahmini (Global ONS fiyatı sabit alınıp Dolar/TL ile çarpılıyor - yaklaşık değer)
            // Daha hassas veri için GoldAPI gerekir ama bu şimdilik "Rastgele"den iyidir.
            // ONS Altın ~2650$ varsayıldı.
            const gramAltin = (2650 * usdTry) / 31.1035;

            const promises = portfoy.map(async (p) => {
                let y = null;

                // 1. DÖVİZ
                if (p.varlikTuru === 'doviz') {
                    if (p.sembol === 'USD') y = usdTry;
                    else if (p.sembol === 'EUR') y = eurTry;
                }

                // 2. ALTIN
                else if (p.varlikTuru === 'altin') {
                    y = gramAltin;
                }

                // 3. HİSSE / FON (Yahoo Finance)
                else {
                    let sembol = p.sembol.toUpperCase().trim();
                    // BIST hissesi varsayımıyla .IS ekle (Eğer nokta yoksa)
                    if (!sembol.includes('.')) {
                        sembol += ".IS";
                    }

                    try {
                        // Yahoo Finance API via CORS Proxy
                        // Not: corsproxy.io herkese açık bir servistir.
                        const url = `https://corsproxy.io/?https://query1.finance.yahoo.com/v8/finance/chart/${sembol}`;
                        const resHisse = await fetch(url);

                        if (resHisse.ok) {
                            const dataHisse = await resHisse.json();
                            const fiyat = dataHisse?.chart?.result?.[0]?.meta?.regularMarketPrice;
                            if (fiyat) y = parseFloat(fiyat);
                        } else {
                            console.warn(`${sembol} için API yanıt vermedi.`);
                        }
                    } catch (err) {
                        console.warn(`${sembol} fiyatı çekilemedi`, err);
                        // Hata durumunda y null kalır, eski fiyat korunur.
                    }
                }

                if (y) {
                    await updateDoc(doc(db, "portfoy", p.id), { guncelFiyat: parseFloat(y.toFixed(4)) });
                }
            });

            await Promise.all(promises);
            toast.success("Tüm portföy fiyatları (Döviz, Altın ve Hisseler) başarıyla güncellendi");
        } catch (e) {
            console.error(e);
            toast.error("Güncelleme sırasında bir hata oluştu");
        } finally {
            setGuncelleniyor(false);
        }
    }

    // --- PORTFÖY YÖNETİMİ (SİLME & DÜZENLEME) ---
    const portfoySil = async (idOrIds) => {
        const count = Array.isArray(idOrIds) ? idOrIds.length : 1;
        if (!window.confirm(`Bu varlığı (${count} kayıt) portföyden silmek istediğinize emin misiniz?`)) return;
        try {
            if (Array.isArray(idOrIds)) {
                const promises = idOrIds.map(id => deleteDoc(doc(db, "portfoy", id)));
                await Promise.all(promises);
            } else {
                await deleteDoc(doc(db, "portfoy", idOrIds));
            }
            toast.success("Varlık silindi.");
        } catch (error) {
            console.error(error);
            toast.error("Silme hatası");
        }
    }

    const fillPortfolioForm = (item) => {
        setSembol(item.sembol);
        setAdet(item.adet);
        setAlisFiyati(item.alisFiyati);
        setVarlikTuru(item.varlikTuru || "Hisse");
        setYatirimHesapId(""); // Hesap değişimi genelde yapılmaz ama istenirse eklenebilir
    }

    const portfoyDuzenle = async (idOrIds, yeniVeri) => {
        try {
            // Handle consolidation (merge multiple into first)
            let targetId = idOrIds;
            if (Array.isArray(idOrIds)) {
                targetId = idOrIds[0];
                // Delete others
                const others = idOrIds.slice(1);
                if (others.length > 0) {
                    await Promise.all(others.map(id => deleteDoc(doc(db, "portfoy", id))));
                }
            }

            // Update main doc
            await updateDoc(doc(db, "portfoy", targetId), {
                adet: parseFloat(yeniVeri.adet),
                alisFiyati: parseFloat(yeniVeri.alisFiyati),
                varlikTuru: yeniVeri.varlikTuru,
                guncelFiyat: parseFloat(yeniVeri.alisFiyati) // Reset current price to cost briefly, or keep it? 
                // Better to keep logic simple: user accepts this price as cost.
            });

            toast.success("Portföy güncellendi.");
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Güncelleme hatası");
            return false;
        }
    }

    const besGuncelle = async (veri) => {
        console.log("🚀 besGuncelle ÇAĞRILDI", { alanKodu, veri });

        if (!alanKodu) {
            toast.error("Sistem Hatası: Alan Kodu bulunamadı!");
            return;
        }

        try {
            // DATABASE-FIRST: Write directly to the user's setting document
            const docRef = doc(db, "ayarlar", alanKodu);

            // Construct the payload exactly as requested: { bes_data: { ... } }
            // Ensure numbers are numbers
            const cleanVeri = { ...veri };
            if (cleanVeri.varsayilanTutar) cleanVeri.varsayilanTutar = parseFloat(cleanVeri.varsayilanTutar);
            if (cleanVeri.odemeGunu) cleanVeri.odemeGunu = parseInt(cleanVeri.odemeGunu);

            console.log("💾 Ayarlar Kaydediliyor...", cleanVeri);

            await setDoc(docRef, { bes_data: cleanVeri }, { merge: true });

            console.log("✅ Ayarlar Kaydedildi");
            toast.success("BES ayarları başarıyla kaydedildi.");
        } catch (error) {
            console.error("🔥 Kaydetme Hatası:", error);
            toast.error("Kaydetme hatası: " + error.message);
        }
    }

    return {
        sembol, setSembol,
        adet, setAdet,
        alisFiyati, setAlisFiyati,
        varlikTuru, setVarlikTuru,
        yatirimHesapId, setYatirimHesapId,
        tahsilatTutar, setTahsilatTutar,
        guncelleniyor,
        guncelleniyor,
        yatirimAl, satisYap, fiyatGuncelle, piyasalariGuncelle, besGuncelle,
        portfoySil, portfoyDuzenle, fillPortfolioForm,
        besOdemeYap: async (besVerisi_IGNORED, islemEkle, manuelEkleAc) => {
            console.log("💰 besOdemeYap ÇAĞRILDI (Database-First Mode)");

            if (!alanKodu) {
                toast.error("Alan kodu eksik!");
                return;
            }

            try {
                // 1. FETCH FRESH SETTINGS FROM DB
                const docRef = doc(db, "ayarlar", alanKodu);
                const snapshot = await getDoc(docRef);

                if (!snapshot.exists()) {
                    console.warn("⚠️ Ayar dokümanı yok, manuel açılıyor.");
                    toast.info("Ayarlar bulunamadı, lütfen önce ayarları kaydedin.");
                    if (manuelEkleAc) manuelEkleAc();
                    return;
                }

                const data = snapshot.data();
                const settings = data.bes_data;

                console.log("🔍 Bulunan Ayarlar:", settings);

                // 2. CHECK SETTINGS
                if (settings && settings.varsayilanTutar && settings.varsayilanHesapId) {
                    console.log("✅ Otomatik Ödeme Başlıyor...");

                    // 3. EXECUTE PAYMENT via islemEkle (which handles addDoc to 'nakit_islemleri' and updateDoc balance)
                    await islemEkle(null, {
                        hesapId: settings.varsayilanHesapId,
                        tutar: parseFloat(settings.varsayilanTutar),
                        aciklama: 'BES Aylık Ödeme (Otomatik)',
                        kategori: 'BES',
                        islemTipi: 'gider',
                        tarih: new Date()
                    });

                    console.log("✅ Ödeme İşlemi Tamam");
                    toast.success("✅ Otomatik Ödeme Başarılı");
                } else {
                    console.warn("⚠️ Eksik Ayar (Tutar/Hesap yok) - Manuel Mod");
                    toast.info("⚡️ Hızlı ödeme için ayarlardan varsayılan tutar/hesap seçin.");
                    if (manuelEkleAc) manuelEkleAc();
                }

            } catch (error) {
                console.error("🔥 Ödeme Hatası:", error);
                toast.error("İşlem Başarısız: " + error.message);
            }
        },

        besKesintiEkle: async (besData, kesintiTutar, kesintiTarih) => {
            if (!alanKodu) return;

            try {
                const docRef = doc(db, "ayarlar", alanKodu);
                const yeniKesinti = {
                    id: crypto.randomUUID(),
                    tutar: parseFloat(kesintiTutar),
                    tarih: kesintiTarih
                };

                // Mevcut bes_data'yı alıp kesintiler array'ini güncelle
                // Eğer besData null ise yeni oluştur
                const currentData = besData || {};
                const currentKesintiler = currentData.kesintiler || [];

                const updatedBesData = {
                    ...currentData,
                    kesintiler: [...currentKesintiler, yeniKesinti]
                };

                await setDoc(docRef, { bes_data: updatedBesData }, { merge: true });
                toast.success("Kesinti kaydedildi.");
                return true;
            } catch (error) {
                console.error("Kesinti Ekleme Hatası:", error);
                toast.error("Hata: " + error.message);
                return false;
            }
        },

        besKesintiSil: async (besData, kesintiId) => {
            if (!alanKodu) return;

            if (!window.confirm("Bu kesinti kaydını silmek istediğinize emin misiniz?")) return;

            try {
                const docRef = doc(db, "ayarlar", alanKodu);

                const currentData = besData || {};
                const currentKesintiler = currentData.kesintiler || [];

                const updatedKesintiler = currentKesintiler.filter(k => k.id !== kesintiId);

                const updatedBesData = {
                    ...currentData,
                    kesintiler: updatedKesintiler
                };

                await setDoc(docRef, { bes_data: updatedBesData }, { merge: true });
                toast.success("Kesinti silindi.");
                return true;
            } catch (error) {
                console.error("Kesinti Silme Hatası:", error);
                toast.error("Hata: " + error.message);
                return false;
            }
        },

        // --- HEDEFLER ---
        hedefEkle: async (yeniHedef) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.hedefler || [];
                await updateDoc(docRef, { hedefler: [...liste, { id: crypto.randomUUID(), ...yeniHedef }] });
                toast.success("Hedef eklendi.");
            }
        },

        hedefSil: async (id) => {
            if (!alanKodu) return;
            if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.hedefler || [];
                const yeniListe = liste.filter(i => i.id !== id);
                await updateDoc(docRef, { hedefler: yeniListe });
                toast.success("Hedef silindi.");
            }
        },

        hedefParaEkle: async (id, miktar) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.hedefler || [];
                const yeniListe = liste.map(h => {
                    if (h.id === id) {
                        return { ...h, biriken: (parseFloat(h.biriken) || 0) + parseFloat(miktar) };
                    }
                    return h;
                });
                await updateDoc(docRef, { hedefler: yeniListe });
                toast.success("Hedefer para eklendi.");
            }
        },

        hedefDuzenle: async (id, yeniVeri) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.hedefler || [];
                const yeniListe = liste.map(h => h.id === id ? { ...h, ...yeniVeri } : h);
                await updateDoc(docRef, { hedefler: yeniListe });
                toast.success("Hedef güncellendi.");
            }
        },

        hedefSatinAl: async (hedef) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();

                // 1. Hedeflerden Sil
                const hedefler = data.hedefler || [];
                const yeniHedefler = hedefler.filter(h => h.id !== hedef.id);

                // 2. Envantere Ekle
                const envanter = data.envanter || [];
                const yeniUrun = {
                    id: crypto.randomUUID(),
                    urunAdi: hedef.ad || hedef.hedefAdi,
                    deger: parseFloat(hedef.hedefTutar),
                    eklendiTarih: new Date()
                };

                await updateDoc(docRef, {
                    hedefler: yeniHedefler,
                    envanter: [...envanter, yeniUrun]
                });
                toast.success("Hedef tamamlandı ve envantere eklendi! 🎉");
            }
        },

        // --- ENVANTER ---
        envanterEkle: async (yeniUrun) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.envanter || [];
                const eklendiTarih = yeniUrun.tarih ? new Date(yeniUrun.tarih) : new Date();

                await updateDoc(docRef, {
                    envanter: [...liste, {
                        id: crypto.randomUUID(),
                        ...yeniUrun,
                        odenenTutar: yeniUrun.odenenTutar !== undefined ? parseFloat(yeniUrun.odenenTutar) : parseFloat(yeniUrun.deger), // Default to full paid if not specified
                        eklendiTarih: eklendiTarih
                    }]
                });
                toast.success("Envantere eklendi.");
            }
        },

        envanterOdemeYap: async (id, miktar) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.envanter || [];
                const yeniListe = liste.map(item => {
                    if (item.id === id) {
                        return { ...item, odenenTutar: (parseFloat(item.odenenTutar) || 0) + parseFloat(miktar) };
                    }
                    return item;
                });
                await updateDoc(docRef, { envanter: yeniListe });
                toast.success("Tedarikçi ödemesi kaydedildi.");
            }
        },

        envanterGuncelle: async (id, guncelVeri) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.envanter || [];
                const yeniListe = liste.map(item => {
                    if (item.id === id) {
                        return { ...item, ...guncelVeri };
                    }
                    return item;
                });
                await updateDoc(docRef, { envanter: yeniListe });
                toast.success("Envanter güncellendi.");
            }
        },

        envanterSil: async (id) => {
            if (!alanKodu) return;
            if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.envanter || [];
                const yeniListe = liste.filter(i => i.id !== id);
                await updateDoc(docRef, { envanter: yeniListe });
                toast.success("Envanterden silindi.");
            }
        },

        // --- SATIŞ & ALACAKLAR ---
        envanterSat: async (urun, satisBilgileri) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const data = snap.data();

                // 1. Envanterden Çıkar
                const envanterListe = data.envanter || [];
                const yeniEnvanter = envanterListe.filter(e => e.id !== urun.id);

                // 2. Satışlara Ekle
                const satislarListe = data.satislar || [];
                const satisObj = {
                    id: crypto.randomUUID(),
                    urunAdi: urun.ad || urun.urunAdi,
                    alici: satisBilgileri.alici,
                    satisFiyati: parseFloat(satisBilgileri.satisFiyati),
                    alisMaliyeti: parseFloat(urun.deger || 0), // Include Purchase Cost for P/L
                    odenenTutar: urun.odenenTutar !== undefined ? parseFloat(urun.odenenTutar) : parseFloat(urun.deger || 0), // Carry over paid amount for Cash Flow
                    tahsilEdilen: parseFloat(satisBilgileri.pesinat || 0),
                    tarih: satisBilgileri.tarih ? new Date(satisBilgileri.tarih) : new Date(),
                    durum: (parseFloat(satisBilgileri.satisFiyati) - parseFloat(satisBilgileri.pesinat || 0)) <= 0 ? 'Tamamlandı' : 'Borcu Var'
                };

                await updateDoc(docRef, {
                    envanter: yeniEnvanter,
                    satislar: [...satislarListe, satisObj]
                });
                toast.success("Satış kaydı oluşturuldu!");
            }
        },

        satisTahsilatEkle: async (satisId, miktar) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const data = snap.data();
                const satislarListe = data.satislar || [];

                const updatedList = satislarListe.map(s => {
                    if (s.id === satisId) {
                        const yeniTahsilat = (s.tahsilEdilen || 0) + parseFloat(miktar);
                        const kalan = s.satisFiyati - yeniTahsilat;
                        return {
                            ...s,
                            tahsilEdilen: yeniTahsilat,
                            durum: kalan <= 0.1 ? 'Tamamlandı' : 'Borcu Var' // Tolerance for loose change
                        };
                    }
                    return s;
                });

                await updateDoc(docRef, { satislar: updatedList });
                await updateDoc(docRef, { satislar: updatedList });
                toast.success("Tahsilat işlendi.");
                setTahsilatTutar("");
            }
        },

        satisSil: async (id) => {
            if (!alanKodu) return;
            // Confirmation logic moved to UI
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                const liste = data.satislar || [];
                const yeniListe = liste.filter(i => i.id !== id);
                await updateDoc(docRef, { satislar: yeniListe });
                toast.success("Satış kaydı silindi.");
            }
        },

        satisDuzenle: async (id, yeniBilgiler) => {
            if (!alanKodu) return;
            const docRef = doc(db, "ayarlar", alanKodu);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const data = snap.data();
                const satislarListe = data.satislar || [];

                const updatedList = satislarListe.map(s => {
                    if (s.id === id) {
                        const fiyat = parseFloat(yeniBilgiler.satisFiyati);
                        const tahsil = parseFloat(yeniBilgiler.tahsilEdilen);
                        const kalan = fiyat - tahsil;
                        return {
                            ...s,
                            urunAdi: yeniBilgiler.urunAdi,
                            alici: yeniBilgiler.alici,
                            alisMaliyeti: parseFloat(yeniBilgiler.alisMaliyeti || 0), // Fix: Persist Cost
                            satisFiyati: fiyat,
                            tahsilEdilen: tahsil,
                            durum: kalan <= 0.1 ? 'Tamamlandı' : 'Borcu Var',
                            tarih: yeniBilgiler.tarih ? new Date(yeniBilgiler.tarih) : s.tarih
                        };
                    }
                    return s;
                });

                await updateDoc(docRef, { satislar: updatedList });
                toast.success("Kayıt güncellendi.");
                return true;
            }
        }
    };
};
