import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import BESCard from './BESCard';
import { cardStyle, inputStyle, formatCurrencyPlain, tarihFormatla, COLORS_GENEL, COLORS_PORTFOLIO } from '../../utils/helpers';

const InvestmentDashboard = ({
    gizliMod,
    genelToplamYatirimGucu,
    toplamKarZarar,
    toplamYatirimHesapNakiti,
    // New Props for Bottom Bar
    kartYatirimToplami,
    toplamDovizVarligi,
    toplamBesVarligi,
    kartNakitToplami,

    genelVarlikVerisi,
    portfoyVerisi,
    portfoy,
    modalAc,
    piyasalariGuncelle,
    guncelleniyor,
    yatirimAl,
    sembol, setSembol,
    adet, setAdet,
    alisFiyati, setAlisFiyati,
    varlikTuru, setVarlikTuru,
    yatirimHesapId, setYatirimHesapId,
    yatirimTurleri,
    hesaplar,
    yatirimIslemleri,
    yatirimArama, setYatirimArama,
    aktifYatirimAy, setAktifYatirimAy,
    filtreYatirimTuru, setFiltreYatirimTuru,
    mevcutAylar,
    islemSil,
    fiyatGuncelle,
    // BES
    besVerisi,
    toplamBesYatirimi,
    besGuncelle,
    islemEkle,
    besOdemeYap,
    portfoyGuncelDegeri,
    portfoySil // Added prop
}) => {

    const formatPara = (tutar) => gizliMod ? "**** ₺" : formatCurrencyPlain(tutar);

    const COLORS_MAP = {
        'Hisse': '#3182ce',
        'Döviz': '#38a169',
        'BES': '#805ad5',
        'Nakit': '#dd6b20'
    };

    const aggregatedPortfoy = React.useMemo(() => {
        const groups = {};
        portfoy.forEach(item => {
            const key = (item.sembol || "").trim().toUpperCase();
            if (!groups[key]) {
                groups[key] = {
                    ...item,
                    ids: [item.id],
                    toplamMaliyet: item.adet * item.alisFiyati,
                    guncelFiyat: item.guncelFiyat || item.alisFiyati
                };
            } else {
                groups[key].adet += parseFloat(item.adet);
                groups[key].toplamMaliyet += (parseFloat(item.adet) * parseFloat(item.alisFiyati));
                groups[key].ids.push(item.id);
                if (!groups[key].guncelFiyat && item.guncelFiyat) {
                    groups[key].guncelFiyat = item.guncelFiyat;
                }
            }
        });

        return Object.values(groups).map(g => ({
            ...g,
            alisFiyati: g.toplamMaliyet / g.adet,
            id: g.ids[0] // Use first ID as key
        }));
    }, [portfoy]);

    return (
        <div>
            {/* 1. SATIR: İKİ AYRI KART DÜZENİ */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>
                {/* SOL KART: TOPLAM ÖZET */}
                <div style={{ ...cardStyle, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {/* ... (Existing Summary Content) ... */}
                    <h3 style={{ margin: 0, color: '#2d3748', textTransform: 'uppercase', fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>
                        TOPLAM YATIRIM VARLIĞI
                    </h3>
                    <div style={{ fontSize: '13px', color: '#718096', marginTop: '5px' }}>Portföy + Yatırım Hesabı Bakiyesi</div>

                    <h1 style={{ fontSize: '48px', margin: '20px 0', fontWeight: '800', color: '#1a202c', letterSpacing: '-2px' }}>
                        {formatPara(genelToplamYatirimGucu)}
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', fontSize: '14px', color: '#4a5568', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #edf2f7' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3182ce' }}></div>
                            <span>Hisse: <b>{formatPara(kartYatirimToplami)}</b></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#38a169' }}></div>
                            <span>Döviz: <b>{formatPara(toplamDovizVarligi)}</b></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#805ad5' }}></div>
                            <span>BES: <b>{formatPara(toplamBesVarligi)}</b></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dd6b20' }}></div>
                            <span>Nakit: <b>{formatPara(kartNakitToplami)}</b></span>
                        </div>
                    </div>
                </div>

                {/* SAĞ KART: GENEL DAĞILIM PASTA GRAFİĞİ */}
                <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
                    {genelToplamYatirimGucu > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={genelVarlikVerisi}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name }) => name}
                                >
                                    {genelVarlikVerisi.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_MAP[entry.name] || COLORS_GENEL[index % COLORS_GENEL.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => gizliMod ? "****" : formatPara(value)}
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ color: '#cbd5e0', fontSize: '13px' }}>Veri Yok</div>
                    )}
                </div>
            </div>

            {/* 2. SATIR: PORTFÖY TABLOSU VE VARLIK DAĞILIMI */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>

                {/* SOL: PORTFÖY TABLOSU */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h4 style={{ margin: 0, color: '#2d3748' }}>💎 Portföy Detayları</h4>
                            <span style={{ fontSize: '12px', color: toplamKarZarar >= 0 ? 'green' : 'red', fontWeight: 'bold', background: toplamKarZarar >= 0 ? '#f0fff4' : '#fff5f5', padding: '2px 8px', borderRadius: '10px' }}>(K/Z: {toplamKarZarar > 0 ? '+' : ''}{formatPara(toplamKarZarar)})</span>
                        </div>
                        <button onClick={piyasalariGuncelle} disabled={guncelleniyor} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '15px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {guncelleniyor ? 'Güncelleniyor...' : '🔄 Fiyatları Güncelle'}
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', color: '#333', minWidth: '500px' }}>
                            <thead><tr style={{ textAlign: 'left', color: '#aaa', borderBottom: '1px solid #eee' }}><th style={{ padding: '10px' }}>Varlık</th><th style={{ padding: '10px' }}>Adet</th><th style={{ padding: '10px' }}>Maliyet (Ort.)</th><th style={{ padding: '10px' }}>Güncel F.</th><th style={{ padding: '10px' }}>Değer</th><th style={{ padding: '10px' }}>K/Z</th><th></th><th></th></tr></thead>
                            <tbody>{aggregatedPortfoy.map(p => {
                                const guncel = p.adet * (p.guncelFiyat || p.alisFiyati);
                                const kar = guncel - (p.adet * p.alisFiyati);
                                return (<tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{ padding: '12px 0' }}><b>{p.sembol}</b></td>
                                    <td>{gizliMod ? '****' : p.adet}</td>
                                    <td>{formatPara(p.alisFiyati)}</td>
                                    <td style={{ padding: '5px' }}><input key={p.guncelFiyat} type="number" defaultValue={p.guncelFiyat} onBlur={(e) => p.ids.forEach(id => fiyatGuncelle(id, e.target.value))} style={{ ...inputStyle, width: '80px', padding: '5px', background: '#f7fafc' }} disabled={gizliMod} /></td>
                                    <td style={{ fontWeight: 'bold' }}>{formatPara(guncel)}</td>
                                    <td style={{ color: kar >= 0 ? 'green' : 'red' }}>{gizliMod ? '***' : <>{formatPara(kar)}</>}</td>
                                    <td>
                                        <button onClick={() => modalAc('satis', p)} style={{ background: '#edf2f7', color: '#333', border: 'none', borderRadius: '5px', fontSize: '12px', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold' }}>Sat</button>
                                        <span onClick={() => modalAc('duzenle_portfoy', p)} style={{ cursor: 'pointer', marginLeft: '5px' }}>✏️</span>
                                        <span onClick={() => portfoySil(p.ids)} style={{ cursor: 'pointer', fontSize: '14px', marginLeft: '5px' }}>🗑️</span>
                                    </td>
                                    <td></td> {/* Removed extra column/button to cleanup */}
                                </tr>)
                            })}</tbody>
                        </table>
                    </div>
                </div>

                {/* SAĞ: VARLIK DAĞILIMI */}
                <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {portfoy.length > 0 ?
                        <>
                            <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={portfoyVerisi} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name }) => name}>{portfoyVerisi.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS_PORTFOLIO[index % COLORS_PORTFOLIO.length]} />))}</Pie><Tooltip formatter={(value) => gizliMod ? "****" : `${value.toLocaleString()} ₺`} /></PieChart></ResponsiveContainer>
                            <div style={{ marginTop: '-20px', fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                                {formatPara(portfoyGuncelDegeri)}
                            </div>
                        </>
                        : <p style={{ fontSize: '12px', color: '#aaa' }}>Henüz varlık yok.</p>}
                </div>
            </div>

            {/* BES MODÜLÜ */}
            <BESCard
                besVerisi={besVerisi}
                toplamBesYatirimi={toplamBesYatirimi}
                besGuncelle={besGuncelle}
                islemEkle={islemEkle}
                hesaplar={hesaplar}
                besOdemeYap={besOdemeYap}
                modalAc={modalAc}
                aktifYatirimAy={aktifYatirimAy}
                yatirimIslemleri={yatirimIslemleri}
                gizliMod={gizliMod}
            />

            {/* 3. SATIR: YENİ İŞLEM VE GEÇMİŞ TABLOSU */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', marginBottom: '30px' }}>

                {/* SOL: YENİ YATIRIM FORMU */}
                <div style={{ ...cardStyle, background: '#f0fff4', border: '1px solid #9ae6b4' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '20px', color: '#2f855a' }}>📈 Yeni Yatırım Varlığı Al</h4>
                    <form onSubmit={yatirimAl} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input placeholder="Sembol (THYAO, GRAM...)" value={sembol} onChange={e => setSembol(e.target.value)} style={{ ...inputStyle, border: '1px solid #9ae6b4' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" placeholder="Adet" value={adet} onChange={e => setAdet(e.target.value)} style={{ ...inputStyle, border: '1px solid #9ae6b4' }} />
                            <select value={varlikTuru} onChange={e => setVarlikTuru(e.target.value)} style={{ ...inputStyle, border: '1px solid #9ae6b4' }}>
                                {yatirimTurleri.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <input type="number" placeholder="Birim Alış Fiyatı" value={alisFiyati} onChange={e => setAlisFiyati(e.target.value)} style={{ ...inputStyle, border: '1px solid #9ae6b4' }} />
                        <select value={yatirimHesapId} onChange={e => setYatirimHesapId(e.target.value)} style={{ ...inputStyle, border: '1px solid #9ae6b4' }} required><option value="">Ödeme Hangi Hesaptan?</option>{hesaplar.map(h => <option key={h.id} value={h.id}>{h.hesapAdi} ({formatPara(h.guncelBakiye)})</option>)}</select>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'green' }}>Toplam Tutar: {adet && alisFiyati ? formatPara(adet * alisFiyati) : '0 ₺'}</div>
                        <button type="submit" style={{ width: '100%', background: '#38a169', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>SATIN AL</button>
                    </form>
                </div>

                {/* SAĞ: YATIRIM İŞLEM GEÇMİŞİ */}
                {/* SAĞ: YATIRIM İŞLEM GEÇMİŞİ */}
                <div style={{ ...cardStyle, maxWidth: '100%', overflow: 'hidden' }}>
                    {/* ÜST BÖLÜM: AYLAR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                        <h4 style={{ marginTop: 0, color: '#2c3e50', margin: 0 }}>📜 Yatırım İşlem Geçmişi</h4>
                        <div className="no-scrollbar" style={{ display: 'flex', gap: '5px', alignItems: 'center', overflowX: 'auto', paddingBottom: '5px', maxWidth: '100%', whiteSpace: 'nowrap' }}>
                            {mevcutAylar.map(ay => (
                                <button key={ay} onClick={() => setAktifYatirimAy(ay)} style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '15px', border: 'none', cursor: 'pointer', background: aktifYatirimAy === ay ? '#2c3e50' : '#edf2f7', color: aktifYatirimAy === ay ? 'white' : '#4a5568', fontWeight: 'bold', flexShrink: 0 }}>{ay}</button>
                            ))}
                        </div>
                    </div>

                    {/* GELİŞMİŞ FİLTRELEME ALANI */}
                    <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '10px', marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', border: '1px solid #edf2f7' }}>
                        <div style={{ flex: 2, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px' }}>
                            <span style={{ fontSize: '16px' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Yatırım işlem ara..."
                                value={yatirimArama}
                                onChange={(e) => setYatirimArama(e.target.value)}
                                style={{ border: 'none', outline: 'none', padding: '10px', width: '100%', fontSize: '13px', background: 'transparent', color: '#333' }}
                            />
                            {yatirimArama && <span onClick={() => setYatirimArama("")} style={{ cursor: 'pointer', color: '#aaa', fontWeight: 'bold' }}>X</span>}
                        </div>
                        <select
                            value={filtreYatirimTuru}
                            onChange={e => setFiltreYatirimTuru(e.target.value)}
                            style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '13px', backgroundColor: '#ffffff', color: '#333' }}
                        >
                            <option value="Tümü">Tüm Türler</option>
                            {yatirimTurleri.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#333' }}>
                        <thead><tr style={{ textAlign: 'left', color: '#718096', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '10px' }}>Tarih</th><th style={{ padding: '10px' }}>Hesap</th><th style={{ padding: '10px' }}>Tür</th><th style={{ padding: '10px' }}>İşlem</th><th style={{ padding: '10px' }}>Tutar</th><th></th><th></th></tr></thead>
                        <tbody>
                            {yatirimIslemleri.map(i => {
                                const hesap = hesaplar.find(h => h.id === i.hesapId);
                                const hesapAdi = hesap ? hesap.hesapAdi : "Bilinmeyen Hesap";
                                return (
                                    <tr key={i.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                                        <td style={{ padding: '10px', color: '#718096' }}>{tarihFormatla(i.tarih)}</td>
                                        <td style={{ padding: '10px' }}>{hesapAdi}</td>
                                        <td style={{ padding: '10px' }}>{i.yatirimTuru || i.kategori || "Diğer"}</td>
                                        <td style={{ padding: '10px' }}>{i.aciklama}</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', color: i.islemTipi === 'yatirim_alis' ? 'red' : 'green' }}>{formatPara(i.tutar)}</td>
                                        <td><span onClick={() => modalAc('duzenle_islem', i)} style={{ cursor: 'pointer' }}>✏️</span></td>
                                        <td><span onClick={() => islemSil(i.id)} style={{ cursor: 'pointer' }}>🗑️</span></td>
                                    </tr>
                                )
                            })}
                            {yatirimIslemleri.length === 0 && <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>Henüz işlem yok.</td></tr>}
                        </tbody>
                    </table>
                </div>

            </div>

            <footer style={{ textAlign: 'center', marginTop: '30px', padding: '10px', color: '#a0aec0', fontSize: '12px' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>MUNDAN BİLİŞİM</p>
            </footer>
        </div>
    );
}

export default InvestmentDashboard;
