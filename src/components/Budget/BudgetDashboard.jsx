import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from 'recharts';
import { cardStyle, inputStyle, formatCurrencyPlain, tarihFormatla, tarihSadeceGunAyYil, COLORS } from '../../utils/helpers';

const BudgetDashboard = ({
    aktifAy,
    toplamGelir,
    bugunGider,
    toplamGider,
    gunlukVeri,
    gunlukOrtalama,
    kategoriVerisi,
    gizliMod,
    aylikLimit,
    onLimitChange,
    harcananLimit,
    limitYuzdesi,
    limitRenk,
    maaslar,
    hesaplar,
    modalAc,
    normalSil,
    maasEkle,
    maasAd, setMaasAd,
    maasTutar, setMaasTutar,
    maasGun, setMaasGun,
    maasHesapId, setMaasHesapId,
    filtrelenmisIslemler,
    sadeceCuzdanNakiti,
    genelToplamYatirimGucu,
    netVarlik,
    hesapEkle,
    hesapAdi, setHesapAdi,
    hesapTipi, setHesapTipi,
    baslangicBakiye, setBaslangicBakiye,
    tanimliFaturalar,
    bekleyenFaturalar,
    faturaTanimEkle,
    tanimBaslik, setTanimBaslik,
    tanimKurum, setTanimKurum,
    tanimAboneNo, setTanimAboneNo,
    taksitler,
    taksitOde,
    toplamKalanTaksitBorcu,
    abonelikler,
    abonelikOde,
    toplamSabitGider,
    abonelikEkle,
    aboAd, setAboAd,
    aboTutar, setAboTutar,
    aboGun, setAboGun,
    aboKategori, setAboKategori,
    aboHesapId, setAboHesapId,
    kategoriListesi,
    formTab, setFormTab,
    islemEkle,
    transferYap,
    taksitEkle,
    faturaGir,
    secilenHesapId, setSecilenHesapId,
    islemTipi, setIslemTipi,
    kategori, setKategori,
    islemAciklama, setIslemAciklama,
    islemTutar, setIslemTutar,
    islemTarihi, setIslemTarihi,
    transferKaynakId, setTransferKaynakId,
    transferHedefId, setTransferHedefId,
    transferTutar, setTransferTutar,
    transferUcreti, setTransferUcreti,
    transferTarihi, setTransferTarihi,
    taksitBaslik, setTaksitBaslik,
    taksitHesapId, setTaksitHesapId,
    taksitToplamTutar, setTaksitToplamTutar,
    taksitSayisi, setTaksitSayisi,
    taksitKategori, setTaksitKategori,
    taksitAlisTarihi, setTaksitAlisTarihi,
    secilenTanimId, setSecilenTanimId,
    faturaGirisTutar, setFaturaGirisTutar,
    faturaGirisTarih, setFaturaGirisTarih,
    faturaGirisAciklama, setFaturaGirisAciklama,
    mevcutAylar,
    setAktifAy,
    aramaMetni, setAramaMetni,
    filtreKategori, setFiltreKategori,
    excelIndir,
    excelYukle,
    islemSil
}) => {

    const formatPara = (tutar) => gizliMod ? "**** ₺" : formatCurrencyPlain(tutar);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}> {/* Ana Container gap düzeltildi */}

            {/* 1. ve 2. SATIR BİRLEŞİK GRID (Yedek.js ile birebir aynı yapı) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>

                {/* 1. SATIR: KARTLAR */}
                <div style={{ ...cardStyle, borderLeft: '5px solid #48bb78' }}>
                    <h3 style={{ margin: 0, color: '#888', fontSize: '11px', letterSpacing: '1px' }}>TOPLAM GELİR ({aktifAy})</h3>
                    <h1 style={{ fontSize: '26px', margin: '10px 0', color: '#333' }}>{formatPara(toplamGelir)}</h1>
                </div>
                <div style={{ ...cardStyle, borderLeft: '5px solid #F59E0B' }}>
                    <span style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>BUGÜN HARCANAN</span>
                    <h2 style={{ color: '#333', margin: '10px 0', fontSize: '26px' }}>{formatPara(bugunGider)}</h2>
                </div>
                <div style={{ ...cardStyle, borderLeft: '5px solid #f56565' }}>
                    <span style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>GİDER ({aktifAy})</span>
                    <h2 style={{ color: '#333', margin: '10px 0', fontSize: '24px' }}>{formatPara(toplamGider)}</h2>
                </div>

                {/* 2. SATIR: GRAFİK (2 Sütun) ve PASTA (1 Sütun) */}
                <div style={{ ...cardStyle, gridColumn: 'span 2', minHeight: '300px' }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>📅 Günlük Harcama Trendi ({aktifAy})</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={gunlukVeri || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(val) => `${val} ₺`} />
                            <Bar dataKey="value" fill="#8884d8" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    {aktifAy !== "Tümü" && (
                        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#718096', fontStyle: 'italic' }}>
                            ✨ Bu ay günlük ortalama harcamanız: <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{formatPara(gunlukOrtalama)}</span>
                        </div>
                    )}
                </div>

                <div style={{ ...cardStyle, gridColumn: 'span 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                    <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={kategoriVerisi || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name }) => name.substring(0, 10)}>{(kategoriVerisi || []).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value) => formatPara(value)} /></PieChart></ResponsiveContainer>
                </div>
            </div>

            {/* --- ALT BÖLÜM (FORMLAR VE LİSTE) --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>

                {/* SOL SÜTUN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {/* LİMİT */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: 0, color: '#2d3748' }}>🎯 Aylık Bütçe Limiti</h4>
                            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}><input type="number" value={aylikLimit} onChange={(e) => onLimitChange(parseInt(e.target.value))} style={{ width: '70px', border: '1px solid #ddd', borderRadius: '5px', padding: '2px', background: 'white', color: '#333' }} /></div>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}><span style={{ color: limitRenk }}>Harcanan: {formatPara(harcananLimit)}</span><span>{Math.round(limitYuzdesi)}%</span></div>
                            <div style={{ width: '100%', height: '15px', background: '#edf2f7', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}><div style={{ width: `${Math.min(limitYuzdesi, 100)}%`, height: '100%', background: limitRenk, transition: 'width 0.5s', borderRadius: '10px' }}></div></div>
                            {harcananLimit > aylikLimit && (
                                <div style={{ fontSize: '11px', color: '#a0aec0', textAlign: 'left', marginTop: '5px' }}>
                                    Bütçe %{Math.round(((harcananLimit - aylikLimit) / aylikLimit) * 100)} aşıldı
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MAAŞ MODÜLÜ */}
                    <div style={{ ...cardStyle, height: 'fit-content' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: 0, color: '#2d3748' }}>💰 Maaşlar & Gelirler</h4>
                            <button onClick={() => modalAc('maas_ekle')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#48bb78', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                                <span>+</span> Gelir Ekle
                            </button>
                        </div>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {(maaslar || []).map(m => {
                                const hesap = hesaplar.find(h => h.id === m.hesapId);
                                return (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                        <div><div style={{ fontWeight: 'bold' }}>{m.ad}</div><div style={{ fontSize: '11px', color: '#999' }}>Her ayın {m.gun}. günü • {hesap?.hesapAdi}</div></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ color: 'green', fontWeight: 'bold' }}>{formatPara(m.tutar)}</span>
                                            <span onClick={() => modalAc('duzenle_maas', m)} style={{ cursor: 'pointer', fontSize: '12px', marginLeft: '5px' }}>✏️</span>
                                            <span onClick={() => normalSil("maaslar", m.id)} style={{ cursor: 'pointer', color: 'red', fontSize: '12px' }}>🗑️</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {maaslar.length === 0 && <div style={{ fontSize: '12px', color: '#aaa', padding: '10px', textAlign: 'center' }}>Düzenli gelir eklemek için + butonuna basın.</div>}
                    </div>

                    {/* HESAPLAR */}
                    <div style={{ ...cardStyle, height: 'fit-content' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: 0, color: '#2d3748' }}>💳 Cüzdanlar & Kartlar</h4>
                            <button onClick={() => modalAc('hesap_ekle')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#3182ce', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                                <span>+</span> Hesap Ekle
                            </button>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            {(hesaplar || []).map(h => {
                                let toplamBakiye = parseFloat(h.guncelBakiye) || 0;
                                let aylikFark = 0;
                                filtrelenmisIslemler.forEach(i => {
                                    if (i.hesapId === h.id) {
                                        if (i.islemTipi === 'gelir') aylikFark += i.tutar;
                                        if (i.islemTipi === 'gider') aylikFark -= i.tutar;
                                    }
                                    if (i.islemTipi === 'transfer') {
                                        if (i.kaynakId === h.id) aylikFark -= i.tutar;
                                        if (i.hedefId === h.id) aylikFark += i.tutar;
                                    }
                                });

                                return (
                                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                        <div>
                                            <b>{h.hesapAdi}</b> <small style={{ color: '#aaa' }}>({h.hesapTipi})</small>
                                            {h.hesapTipi === 'yatirim' && <span style={{ fontSize: '10px', marginLeft: '5px' }}>📈</span>}
                                            <span onClick={() => modalAc('duzenle_hesap', h)} style={{ fontSize: '10px', cursor: 'pointer', marginLeft: '5px', color: 'blue' }}>✏️</span>
                                            {aktifAy !== "Tümü" && <div style={{ fontSize: '10px', color: '#aaa' }}>Bu ay: {aylikFark > 0 ? '+' : ''}{formatPara(aylikFark)}</div>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <span style={{ color: toplamBakiye < 0 ? 'red' : 'green', fontWeight: '600', fontSize: '15px' }}>{formatPara(toplamBakiye)}</span>
                                            {h.hesapTipi === 'krediKarti' && toplamBakiye < 0 && <button onClick={() => modalAc('kredi_karti_ode', h)} style={{ background: '#805ad5', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', marginLeft: '5px' }}>Borç Öde</button>}
                                            <span onClick={() => normalSil("hesaplar", h.id)} style={{ cursor: 'pointer', color: 'red', fontSize: '12px' }}>🗑️</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', textAlign: 'right', fontSize: '14px' }}>
                            <div style={{ color: '#666' }}>Nakit Varlık: <b>{formatPara(sadeceCuzdanNakiti)}</b></div>
                            <div style={{ color: '#666' }}>+ Portföy/Yatırım/BES: <b>{formatPara(genelToplamYatirimGucu)}</b></div>
                            <div style={{ color: '#2d3748', fontSize: '16px', marginTop: '5px' }}>NET VARLIK: <b style={{ color: netVarlik >= 0 ? 'green' : 'red' }}>{formatPara(netVarlik)}</b></div>
                        </div>
                    </div>

                    {/* TAKSİTLER */}
                    <div style={cardStyle}>
                        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#2d3748' }}>📦 Taksitli Alışverişler</h4>
                        {taksitler.length === 0 ? <p style={{ fontSize: '13px', color: '#aaa' }}>Aktif taksit borcu yok.</p> :
                            <div style={{ marginBottom: '15px' }}>
                                {(taksitler || []).map(t => {
                                    const yuzde = (t.odenmisTaksit / t.taksitSayisi) * 100;
                                    return (
                                        <div key={t.id} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <div><b>{t.baslik}</b><div style={{ fontSize: '10px', color: '#999' }}>{t.kategori}</div></div>
                                                <span style={{ fontWeight: 'bold' }}>{formatPara(t.toplamTutar - (t.aylikTutar * t.odenmisTaksit))} <small style={{ color: '#999' }}>Kaldı</small></span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                                                <span>{t.odenmisTaksit}/{t.taksitSayisi} Ödendi</span>
                                                <span>Aylık: {formatPara(t.aylikTutar)}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', marginBottom: '10px' }}><div style={{ width: `${yuzde}%`, height: '100%', background: '#805ad5', borderRadius: '4px', transition: 'width 0.5s' }}></div></div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button onClick={() => taksitOde(t)} style={{ background: '#805ad5', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>Bu Ayı İşle ({formatPara(t.aylikTutar)})</button>
                                                <span onClick={() => modalAc('duzenle_taksit', t)} style={{ cursor: 'pointer', marginLeft: '10px' }}>✏️</span>
                                                <span onClick={() => normalSil("taksitler", t.id)} style={{ cursor: 'pointer', marginLeft: '10px' }}>🗑️</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#718096' }}>Kalan Toplam Borç: <b style={{ color: '#e53e3e' }}>{formatPara(toplamKalanTaksitBorcu)}</b></span>
                        </div>
                    </div>

                    {/* FATURALAR (YENİ MODÜL) */}
                    <div style={{ ...cardStyle, height: 'fit-content' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: 0, color: '#2d3748' }}>🧾 Faturalar & Abonelikler</h4>
                            <button onClick={() => modalAc('fatura_tanim_ekle')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#4a5568', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                                <span>+</span> Fatura Tanımla
                            </button>
                        </div>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {/* Faturalar */}
                            {(tanimliFaturalar || []).map(tanim => {
                                const bekleyen = bekleyenFaturalar.find(f => f.tanimId === tanim.id);
                                return (
                                    <div key={tanim.id} style={{ marginBottom: '10px', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ padding: '10px', background: '#f7fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#2d3748' }}>{tanim.baslik}</div>
                                                <div style={{ fontSize: '10px', color: '#718096' }}>
                                                    {tanim.kurum} {tanim.aboneNo ? `• ${tanim.aboneNo}` : ''}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <span onClick={() => modalAc('duzenle_fatura_tanim', tanim)} style={{ cursor: 'pointer', fontSize: '12px' }}>✏️</span>
                                                <span onClick={() => normalSil("fatura_tanimlari", tanim.id)} style={{ cursor: 'pointer', fontSize: '12px', color: '#e53e3e' }}>🗑️</span>
                                            </div>
                                        </div>
                                        {bekleyen ? (
                                            <div style={{ padding: '8px', background: '#fff5f5', borderTop: '1px solid #feb2b2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div><div style={{ fontWeight: 'bold', color: '#c53030', fontSize: '13px' }}>{formatPara(bekleyen.tutar)}</div><div style={{ fontSize: '10px', color: '#c53030' }}>Son: {tarihSadeceGunAyYil(bekleyen.sonOdemeTarihi)}</div></div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <span onClick={() => modalAc('duzenle_bekleyen_fatura', bekleyen)} style={{ cursor: 'pointer', fontSize: '12px' }}>✏️</span>
                                                    <button onClick={() => modalAc('fatura_ode', bekleyen)} style={{ background: '#c53030', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '15px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>ÖDE</button>
                                                </div>
                                            </div>
                                        ) : (<div style={{ padding: '5px', fontSize: '10px', color: '#ccc', textAlign: 'center' }}>Bekleyen yok</div>)}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* ABONELİKLER */}
                    <div style={{ ...cardStyle, height: 'fit-content' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: 0, color: '#2d3748' }}>🔄 Sabit Giderler</h4>
                            <button onClick={() => modalAc('abonelik_ekle')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#805ad5', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                                <span>+</span> Gider Ekle
                            </button>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            {(abonelikler || []).map(abo => {
                                const hesap = hesaplar.find(h => h.id === abo.hesapId);
                                return (
                                    <div key={abo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                        <div><div style={{ fontWeight: 'bold' }}>{abo.ad}</div><div style={{ fontSize: '11px', color: '#999' }}>{abo.gun}. gün • {abo.kategori} • {hesap?.hesapAdi}</div></div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#e53e3e' }}>{formatPara(abo.tutar)}</div>
                                            <button onClick={() => abonelikOde(abo)} style={{ background: '#e2e8f0', color: '#333', fontWeight: 'bold', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>Öde</button>
                                            <span onClick={() => modalAc('duzenle_abonelik', abo)} style={{ cursor: 'pointer', fontSize: '12px' }}>✏️</span>
                                            <span onClick={() => normalSil("abonelikler", abo.id)} style={{ cursor: 'pointer', fontSize: '12px' }}>🗑️</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', textAlign: 'right', fontSize: '13px' }}>
                            <span style={{ color: '#718096' }}>Aylık Sabit Gider: <b style={{ color: '#e53e3e' }}>{formatPara(toplamSabitGider)}</b></span>
                        </div>
                    </div>
                </div>

                {/* --- SAĞ SÜTUN (İKİ AYRI KART) --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                    {/* 1. KART: VERİ GİRİŞ FORMLARI */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <button onClick={() => setFormTab("islem")} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "islem" ? '#ed8936' : '#edf2f7', color: formTab === "islem" ? 'white' : '#4a5568', fontWeight: 'bold', fontSize: '12px' }}>İşlem</button>
                                <button onClick={() => setFormTab("transfer")} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "transfer" ? '#3182ce' : '#edf2f7', color: formTab === "transfer" ? 'white' : '#4a5568', fontWeight: 'bold', fontSize: '12px' }}>Transfer</button>
                                <button onClick={() => setFormTab("taksit")} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "taksit" ? '#805ad5' : '#edf2f7', color: formTab === "taksit" ? 'white' : '#4a5568', fontWeight: 'bold', fontSize: '12px' }}>Taksit</button>
                                <button onClick={() => setFormTab("fatura")} style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: formTab === "fatura" ? '#c53030' : '#edf2f7', color: formTab === "fatura" ? 'white' : '#4a5568', fontWeight: 'bold', fontSize: '12px' }}>Fatura</button>
                            </div>
                        </div>

                        {formTab === "islem" && (
                            <form onSubmit={islemEkle} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select value={secilenHesapId} onChange={e => setSecilenHesapId(e.target.value)} style={{ flex: 1, ...inputStyle, backgroundColor: '#f7fafc' }}><option value="">Hangi Hesaptan?</option>{(hesaplar || []).map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({h.guncelBakiye}₺)</option>)}</select>
                                    <select value={islemTipi} onChange={e => setIslemTipi(e.target.value)} style={{ flex: 1, ...inputStyle }}><option value="gider">🔴 Gider</option><option value="gelir">🟢 Gelir</option></select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select value={kategori || (kategoriListesi && kategoriListesi[0])} onChange={e => setKategori(e.target.value)} style={{ flex: 1, ...inputStyle }}>{(kategoriListesi || []).map(k => <option key={k} value={k}>{k}</option>)}</select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input placeholder="Açıklama" value={islemAciklama} onChange={e => setIslemAciklama(e.target.value)} style={{ flex: 1, ...inputStyle }} />
                                    <input type="number" placeholder="Tutar (₺)" value={islemTutar} onChange={e => setIslemTutar(e.target.value)} style={{ flex: 1, ...inputStyle }} />
                                </div>
                                <input type="datetime-local" value={islemTarihi} onChange={e => setIslemTarihi(e.target.value)} style={{ ...inputStyle }} />
                                <button type="submit" style={{ padding: '15px', background: '#ed8936', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
                            </form>
                        )}

                        {formTab === "transfer" && (
                            <form onSubmit={transferYap} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#ebf8ff', padding: '20px', borderRadius: '10px' }}>
                                <div><label style={{ fontSize: '12px', color: '#2b6cb0' }}>Nereden?</label><select value={transferKaynakId} onChange={e => setTransferKaynakId(e.target.value)} style={{ ...inputStyle }}><option value="">Seçiniz...</option>{(hesaplar || []).map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({h.guncelBakiye}₺)</option>)}</select></div>
                                <div><label style={{ fontSize: '12px', color: '#2b6cb0' }}>Nereye?</label><select value={transferHedefId} onChange={e => setTransferHedefId(e.target.value)} style={{ ...inputStyle }}><option value="">Seçiniz...</option>{(hesaplar || []).map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({h.guncelBakiye}₺)</option>)}</select></div>

                                {/* 2. SATIR: İŞLEM TUTARI ve TRANSFER ÜCRETİ (YAN YANA) */}
                                <input type="number" placeholder="İşlem Tutarı (₺)" value={transferTutar} onChange={e => setTransferTutar(e.target.value)} style={{ ...inputStyle }} />
                                <input type="number" placeholder="Ücret (Opsiyonel)" value={transferUcreti} onChange={e => setTransferUcreti(e.target.value)} style={{ ...inputStyle }} />

                                <input type="datetime-local" value={transferTarihi} onChange={e => setTransferTarihi(e.target.value)} style={{ gridColumn: 'span 2', ...inputStyle }} />
                                <button type="submit" style={{ gridColumn: 'span 2', padding: '15px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>TRANSFER YAP / BORÇ ÖDE</button>
                            </form>
                        )}

                        {formTab === "taksit" && (
                            <form onSubmit={taksitEkle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f3e8ff', padding: '20px', borderRadius: '10px' }}>
                                <div style={{ gridColumn: 'span 2' }}><h4 style={{ margin: '0 0 10px 0', color: '#6b46c1' }}>📦 Yeni Taksit Planı Oluştur</h4></div>
                                <input placeholder="Ne aldın?" value={taksitBaslik} onChange={e => setTaksitBaslik(e.target.value)} style={{ ...inputStyle, border: '1px solid #d6bcfa' }} required />
                                <select value={taksitHesapId} onChange={e => setTaksitHesapId(e.target.value)} style={{ ...inputStyle, border: '1px solid #d6bcfa' }} required><option value="">Hangi Karttan?</option>{(hesaplar || []).map(h => <option key={h.id} value={h.id}>{h.hesapAdi}</option>)}</select>
                                <input type="number" placeholder="Toplam Borç (₺)" value={taksitToplamTutar} onChange={e => setTaksitToplamTutar(e.target.value)} style={{ ...inputStyle, border: '1px solid #d6bcfa' }} required />
                                <input type="number" placeholder="Kaç Taksit?" value={taksitSayisi} onChange={e => setTaksitSayisi(e.target.value)} style={{ ...inputStyle, border: '1px solid #d6bcfa' }} required />
                                <select value={taksitKategori || (kategoriListesi && kategoriListesi[0])} onChange={e => setTaksitKategori(e.target.value)} style={{ ...inputStyle, border: '1px solid #d6bcfa', gridColumn: 'span 2' }}>{(kategoriListesi || []).map(k => <option key={k} value={k}>{k}</option>)}</select>
                                <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '12px', color: '#6b46c1' }}>Alış Tarihi</label><input type="date" value={taksitAlisTarihi} onChange={e => setTaksitAlisTarihi(e.target.value)} style={{ ...inputStyle, border: '1px solid #d6bcfa' }} /></div>
                                <div style={{ gridColumn: 'span 2', fontSize: '14px', color: '#553c9a', fontWeight: 'bold', padding: '10px', background: 'white', borderRadius: '8px' }}>ℹ️ Aylık: {taksitToplamTutar && taksitSayisi ? formatPara(taksitToplamTutar / taksitSayisi) : '0,00 ₺'}</div>
                                <button type="submit" style={{ gridColumn: 'span 2', padding: '15px', background: '#805ad5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
                            </form>
                        )}

                        {formTab === "fatura" && (
                            <div style={{ background: '#fff5f5', padding: '20px', borderRadius: '10px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#c53030' }}>🧾 Dönemsel Fatura Tutarı Gir</h4>
                                {tanimliFaturalar.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#c53030', padding: '10px', fontSize: '13px' }}>
                                        ⚠️ Önce sol taraftaki panelden bir fatura/abone tanımı eklemelisiniz.
                                    </div>
                                ) : (
                                    <form onSubmit={faturaGir} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <select value={secilenTanimId} onChange={e => setSecilenTanimId(e.target.value)} style={{ ...inputStyle, border: '1px solid #feb2b2' }} required>
                                                <option value="">Hangi Fatura?</option>
                                                {(tanimliFaturalar || []).map(t => <option key={t.id} value={t.id}>{t.baslik} ({t.kurum})</option>)}
                                            </select>
                                        </div>
                                        <input type="number" placeholder="Tutar (₺)" value={faturaGirisTutar} onChange={e => setFaturaGirisTutar(e.target.value)} style={{ ...inputStyle, border: '1px solid #feb2b2' }} required />
                                        <input type="date" value={faturaGirisTarih} onChange={e => setFaturaGirisTarih(e.target.value)} style={{ ...inputStyle, border: '1px solid #feb2b2' }} required />
                                        <input placeholder="Açıklama (Opsiyonel)" value={faturaGirisAciklama} onChange={e => setFaturaGirisAciklama(e.target.value)} style={{ gridColumn: 'span 2', ...inputStyle, border: '1px solid #feb2b2' }} />
                                        <button type="submit" style={{ gridColumn: 'span 2', padding: '15px', background: '#c53030', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>KAYDET</button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. KART: GEÇMİŞ LİSTESİ VE TABLO */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '5px' }}>
                            <h4 style={{ marginTop: 0, color: '#2c3e50', margin: 0 }}>📜 Harcama Geçmişi</h4>
                            <div className="no-scrollbar" style={{ display: 'flex', gap: '5px', alignItems: 'center', overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                                {(mevcutAylar || []).map(ay => (
                                    <button key={ay} onClick={() => setAktifAy(ay)} style={{ flexShrink: 0, padding: '5px 10px', fontSize: '12px', borderRadius: '15px', border: 'none', cursor: 'pointer', background: aktifAy === ay ? '#2c3e50' : '#edf2f7', color: aktifAy === ay ? 'white' : '#4a5568', fontWeight: 'bold' }}>{ay}</button>
                                ))}
                            </div>
                        </div>

                        {/* YENİ FİLTRE ALANI */}
                        <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '10px', marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', border: '1px solid #edf2f7' }}>
                            <div style={{ flex: 2, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px' }}>
                                <span style={{ fontSize: '16px' }}>🔍</span>
                                <input type="text" placeholder="Harcama, market, tutar ara..." value={aramaMetni} onChange={(e) => setAramaMetni(e.target.value)} style={{ border: 'none', outline: 'none', padding: '10px', width: '100%', fontSize: '13px', background: 'transparent', color: '#333' }} />
                                {aramaMetni && <span onClick={() => setAramaMetni("")} style={{ cursor: 'pointer', color: '#aaa', fontWeight: 'bold' }}>X</span>}
                            </div>
                            <select value={filtreKategori} onChange={e => setFiltreKategori(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '13px', backgroundColor: '#ffffff', color: '#333' }}><option value="Tümü">Tüm Kategoriler</option>{(kategoriListesi || []).map(k => <option key={k} value={k}>{k}</option>)}<option value="Transfer">Transfer</option></select>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={excelIndir} style={{ background: '#276749', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>📥 XLS</button>
                                <label style={{ background: '#2b6cb0', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>📤 Yükle <input type="file" accept=".xlsx,.xls,.csv" onChange={excelYukle} style={{ display: 'none' }} /></label>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', color: '#333', minWidth: '500px' }}>
                                <thead><tr style={{ textAlign: 'left', color: '#718096', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '10px' }}>Tarih</th><th style={{ padding: '10px' }}>Hesap</th><th style={{ padding: '10px' }}>Kategori</th><th style={{ padding: '10px' }}>Açıklama</th><th style={{ padding: '10px' }}>Tutar</th><th></th><th></th></tr></thead>
                                <tbody>
                                    {(filtrelenmisIslemler || []).map(i => {
                                        const hesap = hesaplar.find(h => h.id === i.hesapId);
                                        let hesapAdi = hesap?.hesapAdi || "Bilinmeyen";
                                        let renk = 'black';
                                        if (i.islemTipi === 'transfer') {
                                            const kaynak = hesaplar.find(h => h.id === i.kaynakId)?.hesapAdi;
                                            const hedef = hesaplar.find(h => h.id === i.hedefId)?.hesapAdi;
                                            hesapAdi = `${kaynak} ➝ ${hedef}`;
                                            renk = '#3182ce';
                                        } else if (i.islemTipi === 'gelir' || i.islemTipi === 'yatirim_satis') {
                                            renk = 'green';
                                        } else {
                                            renk = '#e53e3e';
                                        }
                                        return (
                                            <tr key={i.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                                                <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', color: '#718096', cursor: 'pointer' }}>{tarihFormatla(i.tarih)}</td>
                                                <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>{hesapAdi}</td>
                                                <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', cursor: 'pointer' }}>{i.kategori}</td>
                                                <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', cursor: 'pointer' }}>{i.aciklama}</td>
                                                <td onClick={() => modalAc('duzenle_islem', i)} style={{ padding: '10px', fontWeight: 'bold', color: renk, cursor: 'pointer' }}>{formatPara(i.tutar)}</td>
                                                <td><span onClick={() => modalAc('duzenle_islem', i)} style={{ cursor: 'pointer' }}>✏️</span></td>
                                                <td><span onClick={() => islemSil(i.id)} style={{ cursor: 'pointer' }}>🗑️</span></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #f0f0f0', textAlign: 'right', color: '#2d3748', fontSize: '16px', fontWeight: 'bold' }}>
                            Net Nakit Akışı ({aktifAy}): <span style={{ color: (toplamGelir - toplamGider) >= 0 ? 'green' : '#e53e3e' }}>{formatPara(toplamGelir - toplamGider)}</span>
                        </div>

                        <footer style={{ textAlign: 'center', marginTop: '30px', padding: '10px', color: '#a0aec0', fontSize: '12px' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>MUNDAN BİLİŞİM</p>
                        </footer>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BudgetDashboard;
