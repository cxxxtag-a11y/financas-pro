import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, Layers } from 'lucide-react';
import { CreditCard as CardType, Transaction } from '../types';
import { generateId, calculateInvoiceDate, formatCurrency } from '../services/storageService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactions: Transaction[]) => void;
  cards: CardType[];
  categories: string[];
  editingTx?: Partial<Transaction> | null;
}

const PAYMENT_METHODS = ['Cartão Crédito', 'Cartão Débito', 'Pix', 'Dinheiro', 'Boleto', 'Transferência'];

export const AddTransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, cards, categories, editingTx }) => {
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    type: 'expense' as 'income' | 'expense',
    category: categories[0] || 'Geral',
    date: new Date().toISOString().split('T')[0],
    method: 'Cartão Débito',
    cardId: '',
    installments: 1,
    interestRate: 0,
    showInstallmentValue: false
  });

  useEffect(() => {
    if (editingTx) {
      setFormData({
        description: editingTx.description || '',
        value: editingTx.value ? editingTx.value.toString() : '',
        type: editingTx.type || 'expense',
        category: editingTx.category || categories[0] || 'Geral',
        date: editingTx.date || new Date().toISOString().split('T')[0],
        method: editingTx.method || 'Cartão Débito',
        cardId: editingTx.cardId?.toString() || '',
        installments: 1, // Default reset on edit to prevent complex re-installment logic
        interestRate: 0,
        showInstallmentValue: false
      } as any);
    } else {
      setFormData({
        description: '',
        value: '',
        type: 'expense',
        category: categories[0] || 'Geral',
        date: new Date().toISOString().split('T')[0],
        method: 'Cartão Débito',
        cardId: '',
        installments: 1,
        interestRate: 0,
        showInstallmentValue: false
      });
    }
  }, [editingTx, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseValue = parseFloat(formData.value);
    if (!formData.description || isNaN(baseValue)) return;

    if (formData.method === 'Cartão Crédito' && formData.cardId) {
        const card = cards.find(c => c.id.toString() === formData.cardId);
        if (!card) { alert("Cartão não encontrado"); return; }
        
        // Installment Logic
        const numInstallments = parseInt(formData.installments as any) || 1; 
        const interest = parseFloat(formData.interestRate as any) || 0;
        const totalValueWithInterest = baseValue + (baseValue * (interest / 100)); 
        const installmentValue = totalValueWithInterest / numInstallments;
        
        const newTxs: Transaction[] = [];
        
        // Create transactions
        for (let i = 0; i < numInstallments; i++) {
            const invoiceDate = calculateInvoiceDate(formData.date, card.closingDay, card.dueDay, i);
            newTxs.push({ 
                id: generateId() + i, 
                description: numInstallments > 1 ? `${formData.description} (${i+1}/${numInstallments})` : formData.description, 
                value: installmentValue, 
                type: 'expense', 
                category: formData.category, 
                method: 'Cartão Crédito', 
                cardId: formData.cardId, 
                date: invoiceDate, 
                installmentNumber: numInstallments > 1 ? `${i+1} de ${numInstallments}` : undefined, 
                isPaid: false, 
                isInvoicePayment: false 
            });
        }
        onSave(newTxs);
    } else {
        // Standard Transaction
        const newTx: Transaction = { 
            id: editingTx?.id ? editingTx.id : generateId(), 
            description: formData.description,
            value: baseValue,
            type: formData.type,
            category: formData.category,
            date: formData.date,
            method: formData.method,
            isPaid: formData.type === 'expense' ? true : false, // Assuming non-credit expenses are paid immediately
            cardId: undefined, 
            installmentNumber: undefined
        };
        onSave([newTx]);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-enter">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-zinc-700/50">
        <div className="flex justify-between items-center p-5 border-b border-zinc-800/50">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                {editingTx?.id ? "Editar Lançamento" : "Novo Lançamento"}
            </h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
            {/* Toggle Type */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-950/50 rounded-xl border border-zinc-800">
                <button type="button" onClick={()=>setFormData({...formData, type:'income'})} className={`p-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${formData.type==='income'?'bg-emerald-500 text-black shadow-lg shadow-emerald-900/20':'text-zinc-400 hover:text-zinc-200'}`}>Entrada</button>
                <button type="button" onClick={()=>setFormData({...formData, type:'expense'})} className={`p-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${formData.type==='expense'?'bg-red-500 text-white shadow-lg shadow-red-900/20':'text-zinc-400 hover:text-zinc-200'}`}>Saída</button>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-bold ml-1">VALOR</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 text-zinc-500" size={16}/>
                    <input type="number" step="0.01" required placeholder="0,00" className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 pl-10 rounded-xl text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-lg font-bold placeholder:text-zinc-700" value={formData.value} onChange={e=>setFormData({...formData, value:e.target.value})} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-bold ml-1">DESCRIÇÃO</label>
                <input type="text" required placeholder="Ex: Mercado Semanal" className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-700" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 font-bold ml-1">CATEGORIA</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3.5 text-zinc-500" size={14}/>
                        <select className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 pl-9 rounded-xl text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none text-sm" value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                            {categories.map(c=><option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500 font-bold ml-1">DATA</label>
                    <div className="relative">
                         <Calendar className="absolute left-3 top-3.5 text-zinc-500" size={14}/>
                        <input type="date" required className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 pl-9 rounded-xl text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-bold ml-1">MÉTODO</label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-3.5 text-zinc-500" size={16}/>
                    <select className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 pl-10 rounded-xl text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none" value={formData.method} onChange={e=>setFormData({...formData, method:e.target.value})}>
                        {PAYMENT_METHODS.map(m => <option key={m} value={m} className="bg-zinc-900">{m}</option>)}
                    </select>
                </div>
            </div>

            {formData.method === 'Cartão Crédito' && (
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="text-[10px] text-zinc-500 font-bold mb-1 block uppercase">Cartão</label>
                        <select className="w-full bg-zinc-900/80 border border-zinc-700 p-2.5 rounded-lg text-white outline-none focus:border-purple-500/50 transition-all" required value={formData.cardId} onChange={e=>setFormData({...formData, cardId:e.target.value})}>
                            <option value="">Selecione...</option>
                            {cards.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
                        </select>
                    </div>
                    
                    {!editingTx?.id && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold mb-1 block uppercase">Parcelas</label>
                                    <input type="number" min="1" max="60" className="w-full bg-zinc-900/80 border border-zinc-700 p-2.5 rounded-lg text-white outline-none focus:border-purple-500/50 transition-all" value={formData.installments} onChange={e => setFormData({...formData, installments: parseInt(e.target.value) || 1})} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold mb-1 block uppercase">Juros (%) Total</label>
                                    <input type="number" step="0.1" className="w-full bg-zinc-900/80 border border-zinc-700 p-2.5 rounded-lg text-white outline-none focus:border-purple-500/50 transition-all" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: parseFloat(e.target.value) || 0})} />
                                </div>
                            </div>
                            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 text-xs text-purple-200 mt-2">
                                {(() => { 
                                    const val = parseFloat(formData.value) || 0; 
                                    const inst = parseInt(formData.installments as any) || 1; 
                                    const interest = parseFloat(formData.interestRate as any) || 0; 
                                    const total = val + (val * interest / 100); 
                                    const parcelVal = total / inst; 
                                    return (
                                        <>
                                            <div className="flex justify-between mb-1"><span>Total Final:</span> <span className="font-bold">{formatCurrency(total)}</span></div>
                                            <div className="flex justify-between"><span>Valor Parcela:</span> <span className="opacity-80">{formatCurrency(parcelVal)} x {inst}</span></div>
                                        </>
                                    ) 
                                })()}
                            </div>
                        </>
                    )}
                </div>
            )}

            <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-xl tracking-wide">
                CONFIRMAR LANÇAMENTO
            </button>
        </form>
      </div>
    </div>
  );
};