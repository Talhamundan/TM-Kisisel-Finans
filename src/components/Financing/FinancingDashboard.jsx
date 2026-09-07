import React, { useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, Ellipsis, Eye, Landmark, Plus, ReceiptText, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { db } from '../../firebase';
import {
    FINANCING_STATUS,
    FINANCING_TYPES,
    buildGeneratedPaymentPlan,
    buildPaymentPlanFromInstallment,
    formatFinancingMoney,
    formatFullDate,
    formatShortDate,
    getFinancingMetrics,
    getFinancingTypeLabel,
    summarizeFinancings,
    toDateInputValue,
} from '../../utils/financing';
import { formatCurrencyPlain, toDateSafe } from '../../utils/helpers';
import { EmptyState, PremiumCard, SectionHeader, StatusBadge } from '../Shared/PremiumUI';

const parseAmount = (value) => parseFloat(value) || 0;
const todayInputValue = () => new Date().toISOString().slice(0, 10);

const createEmptyPlan = (count = 3) => Array.from({ length: count }, (_, index) => ({
    id: `manual-${Date.now()}-${index + 1}`,
    installmentNumber: index + 1,
    dueDate: '',
    plannedAmount: '',
    linkedTransactionId: '',
    manualPaid: false,
    manualPaidDate: null,
    manualPaidAmount: 0,
    note: '',
}));

const serializePlan = (rows = []) => rows.map((row, index) => ({
    id: row.id || `plan-${index + 1}`,
    installmentNumber: parseInt(row.installmentNumber) || index + 1,
    dueDate: row.dueDate ? new Date(row.dueDate) : null,
    plannedAmount: parseAmount(row.plannedAmount),
    linkedTransactionId: row.linkedTransactionId || '',
    manualPaid: row.manualPaid === true,
    manualPaidDate: row.manualPaidDate ? new Date(row.manualPaidDate) : null,
    manualPaidAmount: parseAmount(row.manualPaidAmount),
    note: row.note || '',
}));

const PlanEditor = ({ planRows, setPlanRows, isEditing, onEdit, label = 'Otomatik oluşturuldu' }) => {
    const updateRow = (index, field, value) => {
        setPlanRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
    };

    const addRow = () => {
        setPlanRows((rows) => [
            ...rows,
            {
                id: `manual-${Date.now()}`,
                installmentNumber: rows.length + 1,
                dueDate: '',
                plannedAmount: '',
                linkedTransactionId: '',
                manualPaid: false,
                manualPaidDate: null,
                manualPaidAmount: 0,
                note: '',
            },
        ]);
    };

    const total = planRows.reduce((sum, row) => sum + parseAmount(row.plannedAmount), 0);

    return (
        <div className="financing-plan-editor">
            <div className="financing-plan-editor__toolbar">
                <span>{label}</span>
                {!isEditing && <button type="button" className="financing-button financing-button--secondary" onClick={onEdit}>Düzenle</button>}
            </div>
            <div className="financing-plan-editor__head">
                <span>#</span>
                <span>Vade</span>
                <span>Tutar</span>
            </div>
            {planRows.map((row, index) => (
                <div key={row.id || index} className="financing-plan-editor__row">
                    {isEditing ? (
                        <>
                            <input type="number" value={row.installmentNumber} onChange={(e) => updateRow(index, 'installmentNumber', e.target.value)} />
                            <input type="date" value={toDateInputValue(row.dueDate) || row.dueDate || ''} onChange={(e) => updateRow(index, 'dueDate', e.target.value)} />
                            <input type="number" value={row.plannedAmount} onChange={(e) => updateRow(index, 'plannedAmount', e.target.value)} />
                        </>
                    ) : (
                        <>
                            <span>{row.installmentNumber}</span>
                            <span>{formatFullDate(row.dueDate)}</span>
                            <strong>{formatCurrencyPlain(row.plannedAmount)}</strong>
                        </>
                    )}
                </div>
            ))}
            <div className="financing-plan-editor__footer">
                {isEditing && <button type="button" className="financing-button financing-button--secondary" onClick={addRow}><Plus size={15} /> Taksit Ekle</button>}
                <strong>Toplam {formatCurrencyPlain(total)}</strong>
            </div>
        </div>
    );
};

const FinancingSummaryBar = ({ summary, gizliMod }) => (
    <PremiumCard className="financing-summary-bar">
        <span><em>Toplam Kullanım</em><b>{formatFinancingMoney(summary.totalPrincipal, gizliMod)}</b></span>
        <span><em>Aktif Finansman</em><b>{summary.activeCount}</b></span>
        <span><em>Kalan Ödeme</em><b className="is-danger">{formatFinancingMoney(summary.activeDebt, gizliMod)}</b></span>
        <span><em>Toplam Tasarruf</em><b className="is-success">{formatFinancingMoney(summary.earlySavings, gizliMod)}</b></span>
    </PremiumCard>
);

const FinancingFormModal = ({ mode = 'create', financing, metrics, user, alanKodu, hesaplar, taksitler, islemler, onClose }) => {
    const isEdit = mode === 'edit';
    const initialPlan = isEdit && metrics?.paymentRows?.length
        ? metrics.paymentRows.map((row) => ({ ...row, dueDate: toDateInputValue(row.dueDate), plannedAmount: row.plannedAmount || '' }))
        : createEmptyPlan(3);
    const [step, setStep] = useState(1);
    const [planMode, setPlanMode] = useState(financing?.installmentId ? 'existing' : 'auto');
    const [isPlanEditing, setIsPlanEditing] = useState(isEdit);
    const [planRows, setPlanRows] = useState(initialPlan);
    const [form, setForm] = useState({
        ad: financing?.ad || '',
        type: financing?.type || FINANCING_TYPES[0].value,
        bankName: financing?.bankName || '',
        usageDate: toDateInputValue(financing?.usageDate) || todayInputValue(),
        principalAmount: financing?.principalAmount || '',
        totalRepayment: financing?.plannedTotalRepayment || financing?.principalAmount || '',
        installmentCount: financing?.installmentCount || initialPlan.length || 3,
        firstPaymentDate: toDateInputValue(initialPlan[0]?.dueDate) || '',
        targetAccountId: financing?.targetAccountId || '',
        disbursementTransactionId: financing?.disbursementTransactionId || '',
        commissionTransactionId: financing?.commissionTransactionId || '',
        installmentId: financing?.installmentId || '',
        closureType: financing?.closureType || '',
        closureDate: toDateInputValue(financing?.closureDate),
    });
    const setValue = (field, value) => setForm((current) => ({ ...current, [field]: value }));
    const candidateIncomeTransactions = (islemler || []).filter((item) => item.islemTipi === 'gelir');
    const isInterestFreeCashAdvance = form.type === 'cash_advance_interest_free';
    const shouldShowTotalRepayment = !isInterestFreeCashAdvance;
    const autoRepaymentTotal = isInterestFreeCashAdvance ? form.principalAmount : form.totalRepayment;
    const autoPlanRows = useMemo(() => buildGeneratedPaymentPlan({
        totalAmount: autoRepaymentTotal,
        installmentCount: form.installmentCount,
        firstPaymentDate: form.firstPaymentDate,
    }), [autoRepaymentTotal, form.firstPaymentDate, form.installmentCount]);
    const effectivePlanRows = planMode === 'auto' && !isPlanEditing ? autoPlanRows : planRows;
    const plannedTotal = effectivePlanRows.reduce((sum, row) => sum + parseAmount(row.plannedAmount), 0);
    const plannedCost = plannedTotal - parseAmount(form.principalAmount);

    const selectInstallment = (id) => {
        if (!id) {
            setPlanMode('auto');
            setIsPlanEditing(false);
            setValue('installmentId', '');
            return;
        }
        setPlanMode('existing');
        setIsPlanEditing(false);
        const selected = (taksitler || []).find((item) => item.id === id);
        const rows = buildPaymentPlanFromInstallment(selected).map((row) => ({
            ...row,
            dueDate: toDateInputValue(row.dueDate),
        }));
        setForm((current) => ({
            ...current,
            installmentId: id,
            installmentCount: rows.length || current.installmentCount,
            firstPaymentDate: rows[0]?.dueDate || current.firstPaymentDate,
            totalRepayment: rows.reduce((sum, row) => sum + parseAmount(row.plannedAmount), 0) || current.totalRepayment,
        }));
        setPlanRows(rows);
    };

    const editGeneratedPlan = () => {
        setPlanRows((planMode === 'auto' ? autoPlanRows : planRows).map((row) => ({
            ...row,
            dueDate: toDateInputValue(row.dueDate),
        })));
        setIsPlanEditing(true);
    };
    const planLabel = isPlanEditing
        ? 'Düzenleniyor'
        : planMode === 'existing'
            ? 'Mevcut taksit planından alındı'
            : 'Otomatik oluşturuldu';

    const submit = async (event) => {
        event.preventDefault();
        if (!form.ad || !form.bankName || !form.principalAmount || !form.installmentCount || effectivePlanRows.length === 0 || plannedTotal <= 0) {
            toast.warning('Genel bilgiler ve ödeme planı zorunlu.');
            return;
        }
        if (planMode === 'auto' && !form.firstPaymentDate) {
            toast.warning('İlk ödeme tarihi zorunlu.');
            return;
        }
        if (shouldShowTotalRepayment && !form.totalRepayment) {
            toast.warning('Toplam geri ödeme zorunlu.');
            return;
        }
        const paymentPlan = serializePlan(effectivePlanRows);
        const payload = {
            uid: user?.uid || financing?.uid || '',
            alanKodu,
            ad: form.ad,
            type: form.type,
            bankName: form.bankName,
            usageDate: form.usageDate ? new Date(form.usageDate) : new Date(),
            principalAmount: parseAmount(form.principalAmount),
            targetAccountId: form.targetAccountId || '',
            disbursementTransactionId: form.disbursementTransactionId || '',
            commissionTransactionId: form.commissionTransactionId || '',
            installmentId: planMode === 'existing' ? form.installmentId || '' : '',
            installmentCount: paymentPlan.length,
            paymentPlan,
            plannedTotalRepayment: plannedTotal,
            plannedFinanceCost: Math.max(0, plannedCost),
            closureType: form.closureType || '',
            closureDate: form.closureDate ? new Date(form.closureDate) : null,
            updatedAt: new Date(),
        };

        if (isEdit) {
            await updateDoc(doc(db, 'finansmanlar', financing.id), payload);
            toast.success('Finansman güncellendi.');
        } else {
            await addDoc(collection(db, 'finansmanlar'), {
                ...payload,
                earlyPayoffAmount: 0,
                closureTransactionId: '',
                earlyPayoffQuotes: [],
                createdAt: new Date(),
            });
            toast.success('Finansman eklendi.');
        }
        onClose();
    };

    return (
        <div className="financing-modal-layer">
            <button type="button" className="financing-modal-backdrop" onClick={onClose} aria-label="Kapat" />
            <form className="financing-modal" onSubmit={submit}>
                <div className="financing-modal__header">
                    <strong>{isEdit ? 'Finansmanı Düzenle' : 'Finansman Ekle'}</strong>
                    <button type="button" className="qw-mini-icon-button" onClick={onClose} aria-label="Kapat"><X size={15} /></button>
                </div>
                <div className="financing-step-tabs">
                    <button type="button" className={step === 1 ? 'is-active' : ''} onClick={() => setStep(1)}>Genel Bilgiler</button>
                    <button type="button" className={step === 2 ? 'is-active' : ''} onClick={() => setStep(2)}>Ödeme Planı</button>
                </div>

                {step === 1 && (
                    <div className="financing-form-grid">
                        <input value={form.ad} onChange={(e) => setValue('ad', e.target.value)} placeholder="Finansman adı" />
                        <select value={form.type} onChange={(e) => setValue('type', e.target.value)}>
                            {FINANCING_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                        </select>
                        <input value={form.bankName} onChange={(e) => setValue('bankName', e.target.value)} placeholder="Banka / kurum" />
                        <input type="date" value={form.usageDate} onChange={(e) => setValue('usageDate', e.target.value)} />
                        <input type="number" value={form.principalAmount} onChange={(e) => setValue('principalAmount', e.target.value)} placeholder="Ana para" />
                        {shouldShowTotalRepayment && (
                            <input type="number" value={form.totalRepayment} onChange={(e) => setValue('totalRepayment', e.target.value)} placeholder="Toplam geri ödeme" />
                        )}
                        <input type="number" min="1" value={form.installmentCount} onChange={(e) => setValue('installmentCount', e.target.value)} placeholder="Taksit sayısı" />
                        <input type="date" value={form.firstPaymentDate} onChange={(e) => setValue('firstPaymentDate', e.target.value)} />
                        <select value={form.targetAccountId} onChange={(e) => setValue('targetAccountId', e.target.value)}>
                            <option value="">Bağlı hesap</option>
                            {(hesaplar || []).map((account) => <option key={account.id} value={account.id}>{account.hesapAdi}</option>)}
                        </select>
                        <select value={form.disbursementTransactionId} onChange={(e) => setValue('disbursementTransactionId', e.target.value)}>
                            <option value="">Kullanım transactionı</option>
                            {candidateIncomeTransactions.map((transaction) => <option key={transaction.id} value={transaction.id}>{formatFullDate(transaction.tarih)} · {transaction.aciklama || transaction.kategori} · {formatCurrencyPlain(transaction.tutar)}</option>)}
                        </select>
                    </div>
                )}

                {step === 2 && (
                    <>
                        <div className="financing-existing-plan-box">
                            <span>Geçmiş finansmanı mevcut taksit kaydına bağla</span>
                            <select className="financing-wide-select" value={form.installmentId} onChange={(e) => selectInstallment(e.target.value)}>
                                <option value="">Mevcut taksit planından al</option>
                                {(taksitler || []).map((installment) => <option key={installment.id} value={installment.id}>{installment.baslik} · {installment.taksitSayisi} taksit</option>)}
                            </select>
                        </div>
                        <PlanEditor
                            planRows={effectivePlanRows}
                            setPlanRows={setPlanRows}
                            isEditing={isPlanEditing}
                            onEdit={editGeneratedPlan}
                            label={planLabel}
                        />
                        <div className="financing-form-note">
                            Toplam: {formatCurrencyPlain(plannedTotal)} · Planlanan maliyet: {formatCurrencyPlain(Math.max(0, plannedCost))}
                        </div>
                    </>
                )}

                <div className="financing-modal__footer">
                    {step === 1 && <button type="button" className="financing-button financing-button--secondary" onClick={() => setStep(2)}>Devam</button>}
                    {step === 2 && <button type="button" className="financing-button financing-button--secondary" onClick={() => setStep(1)}>Geri</button>}
                    <button type="submit" className="financing-button financing-button--primary">Kaydet</button>
                </div>
            </form>
        </div>
    );
};

const FinancingCard = ({ financing, metrics, gizliMod, onDetail }) => {
    const isClosed = metrics.effectiveStatus === FINANCING_STATUS.CLOSED;
    return (
        <PremiumCard className="financing-list-card">
            <div className="financing-list-card__top">
                <div>
                    <strong>{financing.ad}</strong>
                    <small>{getFinancingTypeLabel(financing.type)} · {financing.bankName || 'Banka'}</small>
                </div>
                <StatusBadge className="financing-status-badge" tone={isClosed ? 'neutral' : 'success'}>{isClosed ? 'Kapandı' : 'Aktif'}</StatusBadge>
            </div>
            <div className="financing-card-facts">
                <span><em>{formatFinancingMoney(metrics.principalAmount, gizliMod)} ana para</em><b>{metrics.paidInstallments} / {metrics.installmentCount || '-'} ödendi</b></span>
                <span><em>{formatFullDate(financing.usageDate)}{isClosed && financing.closureDate ? ` -> ${formatFullDate(financing.closureDate)}` : ''}</em><b>Planlanan maliyet: {formatFinancingMoney(metrics.plannedFinanceCost, gizliMod)}</b></span>
                {!isClosed && (
                    <span><em>Kalan: {formatFinancingMoney(metrics.remainingPlannedPayment, gizliMod)}</em><b>{metrics.nextPayment ? `Sonraki: ${formatShortDate(metrics.nextPayment.date)} · ${formatFinancingMoney(metrics.nextPayment.amount, gizliMod)}` : 'Sonraki yok'}</b></span>
                )}
            </div>
            <button type="button" className="financing-button financing-button--ghost financing-detail-link" onClick={onDetail}>Detay <ArrowRight size={15} /></button>
        </PremiumCard>
    );
};

const TransactionLinkModal = ({ row, financing, islemler, hesaplar, onClose, onSelect }) => {
    const [filters, setFilters] = useState({ from: '', to: '', accountId: '', category: '' });
    const dueDate = toDateSafe(row.dueDate);
    const categories = [...new Set((islemler || []).map((item) => item.kategori).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr-TR'));
    const candidates = (islemler || [])
        .filter((transaction) => transaction.islemTipi === 'gider' || transaction.islemTipi === 'transfer')
        .filter((transaction) => {
            const date = toDateSafe(transaction.tarih);
            if (filters.from && date && date < new Date(filters.from)) return false;
            if (filters.to && date && date > new Date(filters.to)) return false;
            if (filters.accountId && transaction.hesapId !== filters.accountId && transaction.kaynakId !== filters.accountId && transaction.hedefId !== filters.accountId) return false;
            if (filters.category && transaction.kategori !== filters.category) return false;
            return true;
        })
        .sort((a, b) => {
            const amountDiffA = Math.abs(parseAmount(a.tutar) - parseAmount(row.plannedAmount));
            const amountDiffB = Math.abs(parseAmount(b.tutar) - parseAmount(row.plannedAmount));
            if (amountDiffA !== amountDiffB) return amountDiffA - amountDiffB;
            if (dueDate) {
                return Math.abs((toDateSafe(a.tarih)?.getTime() || 0) - dueDate.getTime()) -
                    Math.abs((toDateSafe(b.tarih)?.getTime() || 0) - dueDate.getTime());
            }
            return (toDateSafe(b.tarih)?.getTime() || 0) - (toDateSafe(a.tarih)?.getTime() || 0);
        })
        .slice(0, 40);

    return (
        <div className="financing-modal-layer">
            <button type="button" className="financing-modal-backdrop" onClick={onClose} aria-label="Kapat" />
            <div className="financing-modal">
                <div className="financing-modal__header">
                    <strong>{financing.ad} · {row.installmentNumber}. taksit hareketi</strong>
                    <button type="button" className="qw-mini-icon-button" onClick={onClose} aria-label="Kapat"><X size={15} /></button>
                </div>
                <div className="financing-form-grid">
                    <input type="date" value={filters.from} onChange={(e) => setFilters((current) => ({ ...current, from: e.target.value }))} />
                    <input type="date" value={filters.to} onChange={(e) => setFilters((current) => ({ ...current, to: e.target.value }))} />
                    <select value={filters.accountId} onChange={(e) => setFilters((current) => ({ ...current, accountId: e.target.value }))}>
                        <option value="">Tüm hesaplar</option>
                        {(hesaplar || []).map((account) => <option key={account.id} value={account.id}>{account.hesapAdi}</option>)}
                    </select>
                    <select value={filters.category} onChange={(e) => setFilters((current) => ({ ...current, category: e.target.value }))}>
                        <option value="">Tüm kategoriler</option>
                        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                </div>
                <div className="financing-link-candidates">
                    {candidates.map((transaction) => (
                        <button type="button" key={transaction.id} onClick={() => onSelect(transaction.id)}>
                            <span>{formatFullDate(transaction.tarih)}</span>
                            <strong>{transaction.aciklama || transaction.kategori}</strong>
                            <b>{formatCurrencyPlain(transaction.tutar)}</b>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ManualPaidModal = ({ row, onClose, onSave }) => {
    const [date, setDate] = useState(todayInputValue());
    const [amount, setAmount] = useState(row.plannedAmount || '');
    const [note, setNote] = useState('');
    return (
        <div className="financing-modal-layer">
            <button type="button" className="financing-modal-backdrop" onClick={onClose} aria-label="Kapat" />
            <form className="financing-modal financing-modal--small" onSubmit={(event) => { event.preventDefault(); onSave({ date, amount, note }); }}>
                <div className="financing-modal__header">
                    <strong>Manuel Ödendi İşaretle</strong>
                    <button type="button" className="qw-mini-icon-button" onClick={onClose} aria-label="Kapat"><X size={15} /></button>
                </div>
                <div className="financing-form-note">Bu işlem gerçek transaction üretmez ve hesap bakiyesini değiştirmez.</div>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Gerçek ödenen tutar" />
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Not" />
                <button type="submit" className="financing-button financing-button--primary">Kaydet</button>
            </form>
        </div>
    );
};

const FinancingDetail = ({ financing, metrics, gizliMod, hesaplar, taksitler, islemler, user, alanKodu, onBack, onDeleted }) => {
    const [quoteAmount, setQuoteAmount] = useState('');
    const [quoteDate, setQuoteDate] = useState(todayInputValue());
    const [linkingRow, setLinkingRow] = useState(null);
    const [manualRow, setManualRow] = useState(null);
    const [editing, setEditing] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const quoteSavings = Math.max(0, metrics.remainingPlannedPayment - parseAmount(quoteAmount));

    const updatePlanRow = async (rowId, patch) => {
        const paymentPlan = metrics.paymentRows.map((row) => ({
            id: row.id,
            installmentNumber: row.installmentNumber,
            dueDate: row.dueDate || null,
            plannedAmount: row.plannedAmount,
            linkedTransactionId: row.linkedTransactionId || '',
            manualPaid: row.manualPaid === true,
            manualPaidDate: row.manualPaidDate || null,
            manualPaidAmount: row.manualPaidAmount || 0,
            note: row.note || '',
            ...(row.id === rowId ? patch : {}),
        }));
        await updateDoc(doc(db, 'finansmanlar', financing.id), { paymentPlan, updatedAt: new Date() });
    };

    const addQuote = async (event) => {
        event.preventDefault();
        if (!quoteAmount) return;
        await updateDoc(doc(db, 'finansmanlar', financing.id), {
            earlyPayoffQuotes: arrayUnion({
                date: quoteDate ? new Date(quoteDate) : new Date(),
                amount: parseAmount(quoteAmount),
                normalRemaining: metrics.remainingPlannedPayment,
                potentialSavings: quoteSavings,
                createdAt: new Date(),
            }),
            updatedAt: new Date(),
        });
        toast.success('Erken kapama teklifi kaydedildi.');
        setQuoteAmount('');
    };

    const deleteFinancing = async () => {
        const result = await Swal.fire({
            title: 'Finansmanı sil?',
            text: 'Bu finansman kaydı silinecek. Bağlı gerçek hareketler ve taksit kayıtları silinmeyecek.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, Sil',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#e25555',
        });
        if (!result.isConfirmed) return;
        await deleteDoc(doc(db, 'finansmanlar', financing.id));
        toast.info('Finansman kaydı silindi.');
        onDeleted();
    };

    if (editing) {
        return (
            <FinancingFormModal
                mode="edit"
                financing={financing}
                metrics={metrics}
                user={user}
                alanKodu={alanKodu}
                hesaplar={hesaplar}
                taksitler={taksitler}
                islemler={islemler}
                onClose={() => setEditing(false)}
            />
        );
    }

    return (
        <div className="financing-page">
            <button type="button" className="financing-back-button" onClick={onBack}><ArrowLeft size={16} /> Finansmanlar</button>
            <div className="financing-page-header">
                <div>
                    <h2>{financing.ad}</h2>
                    <p>{getFinancingTypeLabel(financing.type)} · {financing.bankName || 'Banka'}</p>
                </div>
                <div className="financing-detail-actions">
                    <StatusBadge tone={metrics.effectiveStatus === FINANCING_STATUS.CLOSED ? 'neutral' : 'purple'}>
                        {metrics.effectiveStatus === FINANCING_STATUS.CLOSED ? 'Kapandı' : 'Aktif'}
                    </StatusBadge>
                    <button type="button" className="financing-button financing-button--secondary" onClick={() => setEditing(true)}>Düzenle</button>
                    <div className="financing-menu">
                        <button type="button" className="qw-mini-icon-button" onClick={() => setMenuOpen((current) => !current)} aria-label="Diğer"><Ellipsis size={16} /></button>
                        {menuOpen && (
                            <div>
                                <button type="button" onClick={deleteFinancing}><Trash2 size={14} /> Finansmanı Sil</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PremiumCard className="financing-detail-summary">
                <span><em>Ana Para</em><b>{formatFinancingMoney(metrics.principalAmount, gizliMod)}</b></span>
                <span><em>Planlanan Toplam</em><b>{formatFinancingMoney(metrics.plannedTotalRepayment, gizliMod)}</b></span>
                <span><em>Planlanan Maliyet</em><b>{formatFinancingMoney(metrics.plannedFinanceCost, gizliMod)}</b></span>
                <span><em>Taksit</em><b>{metrics.installmentCount || '-'}</b></span>
                <span><em>Kullanım Tarihi</em><b>{formatFullDate(financing.usageDate)}</b></span>
            </PremiumCard>

            <PremiumCard className="financing-main-plan-card">
                <SectionHeader title="Ödeme Planı" />
                <div className="financing-plan-table">
                    <div className="financing-plan-table__head">
                        <span>#</span>
                        <span>Vade</span>
                        <span>Planlanan</span>
                        <span>Gerçek Ödeme</span>
                        <span>Durum</span>
                        <span>Hareket</span>
                    </div>
                    {metrics.paymentRows.map((row) => (
                        <div key={row.id} className="financing-plan-table__row">
                            <span>{row.installmentNumber}</span>
                            <span>{formatFullDate(row.dueDate)}</span>
                            <strong>{formatFinancingMoney(row.plannedAmount, gizliMod)}</strong>
                            <strong>{row.isPaid ? formatFinancingMoney(row.paidAmount || row.plannedAmount, gizliMod) : '-'}</strong>
                            <StatusBadge tone={row.status === 'paid' ? 'success' : row.status === 'overdue' ? 'danger' : 'purple'}>
                                {row.status === 'paid' ? 'Ödendi' : row.status === 'overdue' ? 'Gecikti' : 'Bekliyor'}
                            </StatusBadge>
                            <span className="financing-plan-actions">
                                {row.transaction ? (
                                    <button type="button" className="qw-mini-icon-button" title={row.transaction.aciklama || 'Hareket'}><Eye size={14} /></button>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => setLinkingRow(row)}>Hareket Bağla</button>
                                        <button type="button" onClick={() => setManualRow(row)}>Manuel Ödendi</button>
                                    </>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </PremiumCard>

            <PremiumCard className="financing-detail-section">
                <SectionHeader title="İşlem Geçmişi" />
                <div className="financing-transaction-list">
                    {metrics.linkedTransactions.map((transaction) => (
                        <div key={transaction.id} className="financing-transaction-row">
                            <span>{formatFullDate(transaction.tarih)}</span>
                            <strong>{transaction.aciklama || transaction.kategori || 'İşlem'}</strong>
                            <b className={transaction.islemTipi === 'gelir' ? 'is-success' : 'is-danger'}>
                                {transaction.islemTipi === 'gelir' ? '+' : '-'}{formatFinancingMoney(transaction.tutar, gizliMod)}
                            </b>
                        </div>
                    ))}
                    {metrics.linkedTransactions.length === 0 && <EmptyState title="Bağlı işlem yok" description="Plan satırından hareket bağlayabilirsin." icon={ReceiptText} />}
                </div>
            </PremiumCard>

            {metrics.effectiveStatus !== FINANCING_STATUS.CLOSED && (
                <PremiumCard className="financing-detail-section financing-payoff-section">
                    <SectionHeader title="Erken Kapama" />
                    <form className="financing-quote-form" onSubmit={addQuote}>
                        <input type="number" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} placeholder="Bugünkü erken kapama tutarı" />
                        <input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
                        <div className="financing-payoff-box">
                            <span><em>Kalan normal ödeme</em><b>{formatFinancingMoney(metrics.remainingPlannedPayment, gizliMod)}</b></span>
                            <span><em>Kapama tutarı</em><b>{formatFinancingMoney(parseAmount(quoteAmount), gizliMod)}</b></span>
                            <span><em>Potansiyel tasarruf</em><b className="is-success">{formatFinancingMoney(quoteSavings, gizliMod)}</b></span>
                        </div>
                        <button type="submit" className="financing-button financing-button--secondary">Teklifi Kaydet</button>
                    </form>
                    <div className="financing-quote-list">
                        {(financing.earlyPayoffQuotes || []).map((quote, index) => (
                            <div key={`${toDateInputValue(quote.date)}-${index}`}>
                                <span>{formatFullDate(quote.date)}</span>
                                <b>{formatFinancingMoney(quote.amount, gizliMod)}</b>
                                <small>Normal kalan {formatFinancingMoney(quote.normalRemaining, gizliMod)} · Tasarruf {formatFinancingMoney(quote.potentialSavings, gizliMod)}</small>
                            </div>
                        ))}
                    </div>
                </PremiumCard>
            )}

            {linkingRow && (
                <TransactionLinkModal
                    row={linkingRow}
                    financing={financing}
                    islemler={islemler}
                    hesaplar={hesaplar}
                    onClose={() => setLinkingRow(null)}
                    onSelect={async (transactionId) => {
                        await updatePlanRow(linkingRow.id, { linkedTransactionId: transactionId, manualPaid: false, manualPaidDate: null, manualPaidAmount: 0 });
                        setLinkingRow(null);
                        toast.success('Hareket bağlandı.');
                    }}
                />
            )}

            {manualRow && (
                <ManualPaidModal
                    row={manualRow}
                    onClose={() => setManualRow(null)}
                    onSave={async ({ date, amount, note }) => {
                        await updatePlanRow(manualRow.id, {
                            manualPaid: true,
                            manualPaidDate: date ? new Date(date) : new Date(),
                            manualPaidAmount: parseAmount(amount),
                            note,
                            linkedTransactionId: '',
                        });
                        setManualRow(null);
                        toast.success('Manuel ödeme bilgisi kaydedildi.');
                    }}
                />
            )}
        </div>
    );
};

const FinancingDashboard = ({
    user,
    alanKodu,
    financings = [],
    hesaplar = [],
    taksitler = [],
    islemler = [],
    gizliMod,
    selectedFinancingId,
    navigateTo,
}) => {
    const [activeTab, setActiveTab] = useState('active');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const context = useMemo(() => ({ transactions: islemler, installments: taksitler }), [islemler, taksitler]);
    const summary = useMemo(() => summarizeFinancings(financings, context), [financings, context]);
    const decorated = useMemo(() => (financings || []).map((financing) => ({
        financing,
        metrics: getFinancingMetrics(financing, context),
    })), [financings, context]);
    const selected = decorated.find((item) => item.financing.id === selectedFinancingId);

    if (selected) {
        return (
            <FinancingDetail
                financing={selected.financing}
                metrics={selected.metrics}
                gizliMod={gizliMod}
                hesaplar={hesaplar}
                taksitler={taksitler}
                islemler={islemler}
                user={user}
                alanKodu={alanKodu}
                onBack={() => navigateTo('/finansmanlar')}
                onDeleted={() => navigateTo('/finansmanlar')}
            />
        );
    }

    const rows = decorated
        .filter(({ metrics }) => activeTab === 'active'
            ? metrics.effectiveStatus !== FINANCING_STATUS.CLOSED
            : metrics.effectiveStatus === FINANCING_STATUS.CLOSED)
        .sort((a, b) => {
            if (a.metrics.effectiveStatus !== b.metrics.effectiveStatus) return a.metrics.effectiveStatus === FINANCING_STATUS.ACTIVE ? -1 : 1;
            return (toDateSafe(b.financing.usageDate)?.getTime() || 0) - (toDateSafe(a.financing.usageDate)?.getTime() || 0);
        });

    return (
        <div className="financing-page">
            <div className="financing-page-actions">
                <button type="button" className="financing-button financing-button--primary financing-page-add-button" onClick={() => setIsFormOpen(true)}><Plus size={16} /> Finansman Ekle</button>
            </div>

            <FinancingSummaryBar summary={summary} gizliMod={gizliMod} />

            <div className="qw-chart-tabs financing-tabs" aria-label="Finansman durumu">
                <button type="button" className={activeTab === 'active' ? 'is-active' : ''} onClick={() => setActiveTab('active')}>Aktif</button>
                <button type="button" className={activeTab === 'closed' ? 'is-active' : ''} onClick={() => setActiveTab('closed')}>Geçmiş</button>
            </div>

            <div className="financing-list-grid">
                {rows.map(({ financing, metrics }) => (
                    <FinancingCard
                        key={financing.id}
                        financing={financing}
                        metrics={metrics}
                        gizliMod={gizliMod}
                        onDetail={() => navigateTo(`/finansmanlar/${financing.id}`)}
                    />
                ))}
                {rows.length === 0 && <EmptyState title="Finansman yok" description="Kredi veya nakit avans takibini buradan ekleyebilirsin." icon={Landmark} />}
            </div>

            {isFormOpen && (
                <FinancingFormModal
                    user={user}
                    alanKodu={alanKodu}
                    hesaplar={hesaplar}
                    taksitler={taksitler}
                    islemler={islemler}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};

export default FinancingDashboard;
