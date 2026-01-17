// --- YARDIMCI FONSİYONLAR ---

export const formatCurrencyPlain = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export const tarihFormatla = (t) => {
    if (!t) return "";
    const d = new Date(t.seconds * 1000);
    return d.toLocaleDateString("tr-TR") + " " + d.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' });
};

export const tarihSadeceGunAyYil = (t) => {
    if (!t) return "";
    const d = new Date(t);
    return d.toLocaleDateString("tr-TR");
};

export const ayIsmiGetir = (firebaseTarih) => {
    if (!firebaseTarih) return "Bilinmiyor";
    const date = new Date(firebaseTarih.seconds * 1000);
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
};

// --- STİL SABİTLERİ ---

export const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    color: '#1e293b',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    appearance: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

export const cardStyle = {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    color: '#333'
};

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#e15fed', '#82ca9d'];
// RENK PALETLERİ
export const COLORS_GENEL = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308']; // Indigo-Rose scale
export const COLORS_PORTFOLIO = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']; // Blue-Green-Amber scale

