import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, CreditCard, Calendar, Settings, TrendingUp, Wallet, Plus, FileText, 
  Trash2, Download, Upload, Filter, Target, Edit2, CheckCircle, 
  ArrowUpCircle, ArrowDownCircle, AlertTriangle, Layers, ChevronLeft, ChevronRight, X,
  Sparkles, Landmark, PiggyBank, Menu, RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AppData, Transaction, CreditCard as ICreditCard, FixedBill } from './types';
import * as Storage from './services/storageService';
import { SummaryCard } from './components/SummaryCard';
import { AddTransactionModal } from './components/AddTransactionModal';

const COLORS = { chart: ['#10b981', '#ef4444', '#eab308', '#3b82f6', '#a855f7', '#ec4899', '#f97316'] };
const CARD_GRADIENTS = ['card-gradient-1', 'card-gradient-2', 'card-gradient-3', 'card-gradient-4'];

// --- SUB-COMPONENTS EXTRACTED TO FIX RE-RENDER/FOCUS BUGS ---

const NavButton = ({ id, icon: Icon, label, activeTab, onClick }: any) => (
    <button onClick={() => onClick(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${activeTab===id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}`}>
        <Icon size={20}/> <span>{label}</span>
    </button>
);

const DashboardView = ({ calculations, financialIntelligence, onNewTx, onInvest, onWithdraw, setActiveTab, setEditingTx, setIsTxModalOpen }: any) => {
    const chartData = useMemo(() => {
        const g: Record<string, number> = {};
        calculations.monthTransactions.filter((t: Transaction) => t.type === 'expense').forEach((t: Transaction) => g[t.category] = (g[t.category] || 0) + t.value);
        return Object.keys(g).map(k => ({ name: k, value: g[k] })).sort((a,b) => b.value - a.value);
    }, [calculations.monthTransactions]);

    return (
      <div className="space-y-6 pb-24 lg:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Saldo em Conta" value={Storage.formatCurrency(calculations.accountBalance)} icon={Landmark} type={calculations.accountBalance >= 0 ? 'default' : 'expense'} subtitle="Líquido Disponível" delay="stagger-1" />
            <SummaryCard title="Investido Total" value={Storage.formatCurrency(calculations.totalInvested)} icon={PiggyBank} type="income" subtitle="Patrimônio Acumulado" delay="stagger-2" />
            <SummaryCard title="Entradas Mês" value={Storage.formatCurrency(calculations.monthIncome)} icon={ArrowUpCircle} type="income" delay="stagger-3" />
            <SummaryCard title="Saídas Mês" value={Storage.formatCurrency(calculations.monthExpense)} icon={ArrowDownCircle} type="expense" delay="stagger-4" />
        </div>

        <div className="glass-panel border-zinc-800 rounded-2xl p-6 relative overflow-hidden animate-slide-up stagger-5 group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0">
                <Sparkles size={120} className="text-blue-500 blur-xl"/>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-blue-400 font-bold mb-1 flex items-center gap-2">
                        <Sparkles size={18} className="animate-pulse-slow text-blue-400"/> 
                        Inteligência Financeira
                    </h3>
                    <p className="text-zinc-500 text-xs">Análise preditiva do mês atual</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full md:w-auto">
                    <div className="space-y-1">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Fixas Pendentes</p>
                        <p className="text-xl text-zinc-100 font-bold">{Storage.formatCurrency(financialIntelligence.unpaidFixedTotal)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Média Diária (Var)</p>
                        <p className="text-xl text-emerald-400 font-bold">{Storage.formatCurrency(financialIntelligence.dailyAvg)}</p>
                    </div>
                    <div className="space-y-1 col-span-2 md:col-span-1">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Previsão de Fechamento</p>
                        <p className="text-2xl text-blue-400 font-bold drop-shadow-lg">{Storage.formatCurrency(financialIntelligence.totalForecast)}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 animate-slide-up stagger-4">
             <button onClick={onNewTx} className="flex-1 btn-primary py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 group">
                <Plus size={20} className="group-hover:rotate-90 transition-transform"/> Novo Lançamento
            </button>
            <div className="flex flex-1 gap-4">
                <button onClick={onInvest} className="flex-1 glass-button py-3 rounded-xl font-bold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 shadow-lg flex items-center justify-center gap-2">
                    <PiggyBank size={20}/> Guardar
                </button>
                <button onClick={onWithdraw} className="flex-1 glass-button py-3 rounded-xl font-bold text-blue-400 border-blue-500/30 hover:bg-blue-500/10 shadow-lg flex items-center justify-center gap-2">
                    <Wallet size={20}/> Resgatar
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-5">
             <div className="glass-panel p-6 rounded-2xl min-h-[380px] flex flex-col hover:border-zinc-600/50">
                <h3 className="font-bold text-zinc-200 mb-6 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Distribuição de Gastos</h3>
                {chartData.length > 0 ? (
                    <div className="grow -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                                    {chartData.map((e: any, i: number) => <Cell key={i} fill={COLORS.chart[i % COLORS.chart.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{background:'#09090b', border:'1px solid #27272a', borderRadius:'8px', color: '#fff'}} formatter={(v: number)=>Storage.formatCurrency(v)} />
                                <Legend wrapperStyle={{paddingTop:'20px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : <div className="flex flex-col items-center justify-center grow text-zinc-600 gap-2"><TrendingUp size={32} className="opacity-20"/><p>Sem dados neste mês.</p></div>}
            </div>

            <div className="glass-panel p-6 rounded-2xl hover:border-zinc-600/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-zinc-200 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Últimas Atividades</h3>
                    <button onClick={() => setActiveTab('transactions')} className="text-xs text-blue-400 hover:text-blue-300">Ver todas</button>
                </div>
                <div className="space-y-2">
                    {calculations.monthTransactions.slice(0, 5).map((tx: Transaction) => (
                        <div key={tx.id} onClick={() => { setEditingTx(tx); setIsTxModalOpen(true); }} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${tx.type==='income'?'bg-emerald-500/10 text-emerald-500':'bg-red-500/10 text-red-500'} group-hover:scale-110 transition-transform`}>
                                    {tx.type==='income'?<ArrowUpCircle size={16}/>:<ArrowDownCircle size={16}/>}
                                </div>
                                <div>
                                    <p className="text-zinc-200 text-sm font-medium group-hover:text-white transition-colors">{tx.description}</p>
                                    <p className="text-zinc-500 text-[11px] font-medium">{Storage.formatDate(tx.date)} • {tx.method}</p>
                                </div>
                            </div>
                            <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tx.type === 'income' ? '+' : '-'}{Storage.formatCurrency(tx.value)}
                            </span>
                        </div>
                    ))}
                    {calculations.monthTransactions.length === 0 && <p className="text-center text-zinc-500 py-10">Nenhuma atividade.</p>}
                </div>
            </div>
        </div>
      </div>
    );
};

const TransactionsView = ({ transactions, onNewTx, setEditingTx, setIsTxModalOpen, onDeleteTx }: any) => {
    const [filter, setFilter] = useState('');
    const filtered = transactions.filter((t: Transaction) => t.description.toLowerCase().includes(filter.toLowerCase()));
    
    return (
      <div className="space-y-6 pb-24 lg:pb-0 animate-fade-in">
           <div className="flex gap-3">
              <div className="relative w-full">
                  <input type="text" placeholder="Buscar lançamentos..." value={filter} onChange={e=>setFilter(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 p-3 pl-10 rounded-xl outline-none focus:border-emerald-500/50 transition-all text-sm backdrop-blur-sm focus:ring-1 focus:ring-emerald-500/20" />
                  <Filter size={16} className="absolute left-3 top-3.5 text-zinc-500"/>
              </div>
              <button onClick={onNewTx} className="btn-primary w-12 flex items-center justify-center rounded-xl text-white shrink-0 shadow-lg hover:scale-105 transition-transform"><Plus size={20}/></button>
          </div>
          
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-zinc-800/50">
                      {filtered.map((tx: Transaction, idx: number) => (
                          <tr key={tx.id} onClick={() => { setEditingTx(tx); setIsTxModalOpen(true); }} className="hover:bg-white/5 cursor-pointer transition-colors group animate-fade-in" style={{animationDelay: `${idx * 0.05}s`}}>
                              <td className="p-4 pl-6">
                                  <div className="text-zinc-200 font-semibold text-sm group-hover:text-white transition-colors">{tx.description}</div>
                                  <div className="text-zinc-500 text-[11px] font-medium mt-0.5 flex items-center gap-2">
                                      <span className="bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-800">{Storage.formatDate(tx.date)}</span>
                                      <span>{tx.method}</span>
                                      {tx.category === 'Investimento' && (
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tx.type === 'income' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                                              {tx.type === 'income' ? 'Resgate' : 'Aporte'}
                                          </span>
                                      )}
                                      {tx.installmentNumber && <span className="text-blue-400 text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">{tx.installmentNumber}</span>}
                                  </div>
                              </td>
                              <td className={`p-4 text-right font-bold text-sm ${tx.type==='income'?'text-emerald-400':'text-red-400'}`}>{tx.type==='income'?'+':'-'} {Storage.formatCurrency(tx.value)}</td>
                              <td className="p-4 text-right w-16 pr-6">
                                  <button 
                                      onClick={(e)=>{
                                          e.stopPropagation(); 
                                          onDeleteTx(tx.id);
                                      }} 
                                      className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-100 lg:opacity-0 group-hover:opacity-100 z-10 relative"
                                      title="Excluir"
                                  >
                                      <Trash2 size={16}/>
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
               {filtered.length === 0 && <div className="text-center py-20 opacity-50"><FileText size={48} className="mx-auto mb-4 text-zinc-600"/><p>Nenhum registro encontrado.</p></div>}
          </div>
      </div>
    );
};

const CardsView = ({ cards, getCardStats, getCardInvoices, setEditingCard, setCardForm, setIsCardModalOpen, onDeleteCard, setInvoiceDetailModal, onPayInvoice }: any) => (
    <div className="space-y-6 pb-24 lg:pb-0 animate-fade-in">
        <div className="flex justify-between items-center glass-panel p-5 rounded-2xl">
            <div><h2 className="font-bold text-zinc-100 text-lg flex items-center gap-2"><Wallet size={20} className="text-emerald-500"/> Meus Cartões</h2></div>
            <button onClick={() => { setEditingCard(null); setCardForm({gradient:'card-gradient-1'}); setIsCardModalOpen(true)}} className="btn-primary px-5 py-2.5 rounded-xl font-semibold text-white text-sm flex gap-2 items-center shadow-lg hover:scale-105 transition-transform"><Plus size={18}/> Novo Cartão</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card: ICreditCard, idx: number) => {
                const stats = getCardStats(card.id);
                const invoices = getCardInvoices(card.id);
                const usagePercent = card.limit > 0 ? (stats.spent / card.limit) * 100 : 0;
                return (
                  <div key={card.id} className="glass-panel rounded-2xl overflow-hidden relative group flex flex-col hover:border-zinc-600/50 transition-all duration-300 animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                      <div className={`p-6 ${card.gradient} text-white relative h-48 flex flex-col justify-between shrink-0 shadow-lg`}>
                           <div className="absolute inset-0 bg-black/10 shimmer-bg opacity-30"></div>
                           <div className="flex justify-between items-start z-10">
                              <div><h3 className="font-bold text-xl tracking-wide drop-shadow-md">{card.name}</h3><p className="text-white/70 text-[10px] font-mono tracking-widest uppercase mt-1">LIMIT {Storage.formatCurrency(card.limit)}</p></div>
                              <CreditCard size={24} className="opacity-80"/>
                          </div>
                          <div className="z-10">
                              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-2 opacity-90"><span>Fecha: {card.closingDay}</span><span>Vence: {card.dueDay}</span></div>
                              <div><p className="text-[10px] opacity-80 uppercase font-bold">Fatura Atual</p><p className="text-2xl font-bold drop-shadow-md">{Storage.formatCurrency(stats.spent)}</p></div>
                          </div>
                           <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-x-2 group-hover:translate-x-0">
                              <button onClick={(e) => { e.stopPropagation(); setEditingCard(card); setCardForm(card); setIsCardModalOpen(true)}} className="bg-black/20 hover:bg-black/40 p-2 rounded-lg text-white backdrop-blur-md transition-colors"><Edit2 size={14}/></button>
                              <button onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }} className="bg-black/20 hover:bg-red-500/80 p-2 rounded-lg text-white backdrop-blur-md transition-colors"><Trash2 size={14}/></button>
                          </div>
                      </div>
                       <div className="px-6 pt-5">
                          <div className="flex justify-between text-xs mb-2 text-zinc-400 font-medium"><span>Utilizado</span><span className="text-zinc-200">{usagePercent.toFixed(0)}%</span></div>
                          <div className="w-full bg-zinc-800/50 h-2.5 rounded-full overflow-hidden border border-zinc-800"><div className={`h-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-1000 ease-out`} style={{width: `${Math.min(100, usagePercent)}%`}}></div></div>
                           <div className="flex justify-between text-[11px] text-zinc-500 mt-2 font-medium"><span>Disp: {Storage.formatCurrency(stats.available)}</span></div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                          <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Layers size={12}/> Próximas Faturas</h4>
                          <div className="space-y-2 flex-1 overflow-y-auto max-h-[150px] custom-scrollbar pr-1">
                              {invoices.length === 0 ? <p className="text-emerald-500/80 text-xs text-center py-6 font-medium bg-emerald-500/5 rounded-lg border border-emerald-500/10">Tudo em dia! 🎉</p> : (
                                  invoices.map((inv: any, idx: number) => (
                                      <div key={inv.month} className={`flex justify-between items-center p-3 rounded-xl border transition-all duration-300 ${idx===0 ? 'bg-zinc-800/60 border-emerald-500/20 shadow-lg' : 'bg-transparent border-zinc-800/50 hover:bg-zinc-800/30'}`}>
                                          <div><p className={`text-xs font-bold ${idx===0 ? 'text-emerald-400' : 'text-zinc-300'}`}>{Storage.getMonthName(inv.month)}</p></div>
                                          <div className="text-right">
                                              <p className="text-xs font-bold text-zinc-200">{Storage.formatCurrency(inv.total)}</p>
                                              <div className="flex gap-2 justify-end mt-1.5">
                                                  <button onClick={() => setInvoiceDetailModal({ ...inv, cardId: card.id, cardName: card.name })} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium hover:underline">Ver Detalhes</button>
                                                  {idx === 0 && <button onClick={() => onPayInvoice(card.id, inv.total, inv.month)} className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md shadow-md transition-all font-bold">Pagar</button>}
                                              </div>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
                );
            })}
        </div>
    </div>
);

const FixedView = ({ fixedBills, currentMonth, onNew, onEdit, onDelete, onPay }: any) => (
    <div className="space-y-6 pb-24 lg:pb-0 animate-fade-in">
        <div className="flex justify-between items-center glass-panel p-5 rounded-2xl">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2"><Calendar className="text-emerald-500" size={20}/> Contas Fixas</h2>
            <button onClick={onNew} className="btn-primary w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"><Plus size={20}/></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixedBills.map((b: FixedBill, idx: number) => {
                 const isPaid = b.lastPaidMonth === currentMonth; 
                 const isOverdue = !isPaid && b.dueDay < new Date().getDate() && new Date().toISOString().slice(0,7) === currentMonth; 
                 return (
                    <div key={b.id} className={`glass-panel p-5 rounded-2xl relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isPaid ? 'border-emerald-500/30' : isOverdue ? 'border-red-500/30' : ''} animate-slide-up`} style={{animationDelay: `${idx * 0.1}s`}}>
                         {isPaid && <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1"><CheckCircle size={10}/> Pago</div>}
                         {isOverdue && <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1"><AlertTriangle size={10}/> Atrasado</div>}
                         <div className="flex justify-between mb-3 mt-1">
                            <div className={`p-2 rounded-xl ${isOverdue ? "bg-red-500/10 text-red-500" : "bg-zinc-800 text-zinc-400"}`}><Calendar size={18}/></div>
                            <div className="flex gap-1">
                                <button onClick={()=>onEdit(b)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"><Edit2 size={16}/></button>
                                <button onClick={()=>onDelete(b.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg text-zinc-100 mb-1">{b.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mb-4"><span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Dia {b.dueDay}</span> <span>{b.category}</span></div>
                        <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
                            <span className="text-emerald-400 font-bold text-lg">{Storage.formatCurrency(b.value)}</span>
                            {!isPaid ? <button onClick={()=>onPay(b)} className="bg-zinc-200 hover:bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all transform hover:scale-105">Pagar</button> : <span className="text-zinc-600 text-xs font-medium italic">Pago em {Storage.getMonthName(currentMonth)}</span>}
                        </div>
                    </div>
                 );
            })}
        </div>
    </div>
);

const GoalsView = ({ categories, goals, transactions, onUpdateGoal }: any) => {
    const expensesByCategory: Record<string, number> = {};
    transactions.filter((t: Transaction) => t.type === 'expense').forEach((t: Transaction) => expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.value);
    
    return (
        <div className="space-y-6 pb-24 lg:pb-0 animate-fade-in">
             <div className="glass-panel p-5 rounded-2xl flex justify-between items-center">
                <div><h2 className="font-bold text-zinc-100 mb-1 flex items-center gap-2"><Target className="text-emerald-500" size={20}/> Metas Mensais</h2></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat: string, idx: number) => {
                    const goal = goals[cat] || 0;
                    const spent = expensesByCategory[cat] || 0;
                    const percent = goal > 0 ? (spent / goal) * 100 : 0;
                    let barColor = 'bg-emerald-500';
                    if(percent > 80) barColor = 'bg-yellow-500';
                    if(percent > 100) barColor = 'bg-red-500';

                    return (
                        <div key={cat} className="glass-panel p-5 rounded-2xl animate-slide-up" style={{animationDelay: `${idx * 0.05}s`}}>
                             <div className="flex justify-between mb-3 items-center">
                                <span className="font-bold text-zinc-200 text-sm flex items-center gap-2">{cat} {percent > 100 && <AlertTriangle size={14} className="text-red-500"/>}</span>
                                <input type="number" placeholder="Definir" className="bg-zinc-950/50 border border-zinc-800 w-24 text-right text-xs font-medium rounded-lg p-1.5 text-zinc-300 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" value={goal || ''} onChange={(e) => onUpdateGoal(cat, e.target.value)} />
                            </div>
                             <div className="flex justify-between text-[11px] text-zinc-500 mb-2 font-medium"><span>Gasto: <span className="text-zinc-300">{Storage.formatCurrency(spent)}</span></span><span className={goal - spent < 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{goal - spent < 0 ? `Excedeu ${Storage.formatCurrency(Math.abs(goal-spent))}` : `Resta: ${Storage.formatCurrency(goal - spent)}`}</span></div>
                             <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden shadow-inner"><div className={`h-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, percent)}%` }}></div></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<AppData>(Storage.getAppData());
  const [viewDate, setViewDate] = useState(new Date()); 
  
  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [editingFixed, setEditingFixed] = useState<FixedBill | null>(null);
  const [fixedForm, setFixedForm] = useState<any>({});

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ICreditCard | null>(null);
  const [cardForm, setCardForm] = useState<any>({ gradient: 'card-gradient-1' });
  
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invoiceDetailModal, setInvoiceDetailModal] = useState<any>(null);

  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Preset for Investment
  const [prefillTx, setPrefillTx] = useState<Partial<Transaction> | null>(null);

  // Derived state
  const currentMonth = useMemo(() => viewDate.toISOString().slice(0, 7), [viewDate]);
  const monthName = useMemo(() => Storage.getMonthName(currentMonth), [currentMonth]);

  // Effects
  useEffect(() => {
    Storage.saveAppData(data);
  }, [data]);

  // Calculations
  const calculations = useMemo(() => {
    const transactions = data.transactions;
    const realIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    // Expenses that affect real balance (Debit, Pix, Cash OR Credit Card Invoice Payments)
    const realExpense = transactions.filter(t => 
        t.type === 'expense' && (t.method !== 'Cartão Crédito' || t.isInvoicePayment)
    ).reduce((acc, t) => acc + t.value, 0);
    
    const accountBalance = data.initialBalance + realIncome - realExpense;
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    const monthExpense = monthTransactions.filter(t => t.type === 'expense' && !t.isInvoicePayment).reduce((acc, t) => acc + t.value, 0);
    
    // Investment Calc: (Investimento Expenses) - (Investimento Incomes/Withdrawals)
    const totalInvested = transactions.reduce((acc, t) => {
        if (t.category === 'Investimento') {
            return t.type === 'expense' ? acc + t.value : acc - t.value;
        }
        return acc;
    }, 0);

    return { accountBalance, monthIncome, monthExpense, monthTransactions, totalInvested };
  }, [data, currentMonth]);

  const financialIntelligence = useMemo(() => {
      const today = new Date();
      const [year, month] = currentMonth.split('-').map(Number);
      const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
      
      const daysInMonth = new Date(year, month, 0).getDate();
      const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;
      const daysRemaining = daysInMonth - currentDay;

      // Unpaid fixed bills for this month
      const unpaidFixedTotal = data.fixedBills
          .filter(b => b.lastPaidMonth !== currentMonth)
          .reduce((acc, b) => acc + b.value, 0);

      // Variable spending (expenses excluding fixed bills and credit card payments/invoices)
      const variableTxs = calculations.monthTransactions.filter(t => 
          t.type === 'expense' && 
          t.category !== 'Contas Fixas' && 
          t.category !== 'Fatura Cartão' &&
          !t.isInvoicePayment &&
          t.category !== 'Investimento'
      );
      
      const variableSpent = variableTxs.reduce((acc, t) => acc + t.value, 0);
      const dailyAvg = currentDay > 0 ? variableSpent / currentDay : 0;
      const projectedVariable = isCurrentMonth ? dailyAvg * daysRemaining : 0;
      
      const totalForecast = calculations.monthExpense + unpaidFixedTotal + projectedVariable;
      
      return { unpaidFixedTotal, dailyAvg, totalForecast, isCurrentMonth, daysRemaining };
  }, [data.fixedBills, calculations.monthTransactions, calculations.monthExpense, currentMonth]);

  const getCardStats = (cardId: string) => {
    // Force String comparison for safety
    const cardTxs = data.transactions.filter(t => String(t.cardId) === String(cardId) && t.type === 'expense' && !t.isInvoicePayment && !t.isPaid);
    const spent = cardTxs.reduce((acc, t) => acc + t.value, 0);
    const card = data.cards.find(c => String(c.id) === String(cardId));
    return { spent, available: card ? card.limit - spent : 0 };
  };

  const getCardInvoices = (cardId: string) => {
    // Force String comparison
    const cardTxs = data.transactions.filter(t => String(t.cardId) === String(cardId) && t.type === 'expense' && !t.isInvoicePayment && !t.isPaid);
    const invoices: Record<string, { total: number, items: Transaction[] }> = {};
    cardTxs.forEach(tx => {
        const monthKey = tx.date.slice(0, 7); 
        if (!invoices[monthKey]) invoices[monthKey] = { total: 0, items: [] };
        invoices[monthKey].total += tx.value;
        invoices[monthKey].items.push(tx);
    });
    return Object.entries(invoices).map(([month, d]) => ({ month, total: d.total, items: d.items })).sort((a, b) => a.month.localeCompare(b.month));
  };

  // Actions
  const changeMonth = (offset: number) => { 
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
      setViewDate(newDate); 
  };

  const handleSaveTransactions = (newTransactions: Transaction[]) => {
    if (editingTx) {
        // Edit mode (single transaction usually)
        // Force ID comparison
        const updated = data.transactions.map(t => String(t.id) === String(editingTx.id) ? newTransactions[0] : t);
        setData(prev => ({ ...prev, transactions: updated }));
    } else {
        setData(prev => ({ ...prev, transactions: [...newTransactions, ...prev.transactions] }));
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
        // Force String comparison to avoid number/string mismatch issues
        setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => String(t.id) !== String(id)) }));
    }
  };

  const handleSaveCard = (e: React.FormEvent) => {
      e.preventDefault();
      if (!cardForm.name || !cardForm.limit) return;
      
      const newCard: ICreditCard = {
          id: editingCard ? editingCard.id : Storage.generateId(),
          name: cardForm.name!,
          limit: Number(cardForm.limit),
          closingDay: Number(cardForm.closingDay),
          dueDay: Number(cardForm.dueDay),
          gradient: cardForm.gradient || 'card-gradient-1'
      };

      if (editingCard) {
          setData(prev => ({ ...prev, cards: prev.cards.map(c => String(c.id) === String(editingCard.id) ? newCard : c) }));
      } else {
          setData(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
      }
      setIsCardModalOpen(false);
  };

  const handleDeleteCard = (id: string) => {
      if (confirm("Deletar cartão?")) setData(prev => ({ ...prev, cards: prev.cards.filter(c => String(c.id) !== String(id)) }));
  };

  const handlePayInvoice = (cardId: string, amount: number, monthKey: string) => {
    const card = data.cards.find(c => String(c.id) === String(cardId));
    if(!card) return;
    if(!confirm(`Pagar fatura de ${Storage.getMonthName(monthKey)} no valor de ${Storage.formatCurrency(amount)}?`)) return;
    
    const paymentTx: Transaction = { 
        id: Storage.generateId(), 
        description: `Fatura ${card.name} - ${Storage.getMonthName(monthKey)}`, 
        value: amount, 
        type: 'expense', 
        category: 'Fatura Cartão', 
        date: new Date().toISOString().slice(0, 10), 
        method: 'Pix', 
        isInvoicePayment: true, 
        cardId: cardId 
    };

    // Mark items as paid
    const updatedTxs = data.transactions.map(t => { 
        // Force String comparison for cardId
        if (String(t.cardId) === String(cardId) && t.method === 'Cartão Crédito' && !t.isPaid && t.date.startsWith(monthKey)) { 
            return { ...t, isPaid: true }; 
        } 
        return t; 
    });

    setData(prev => ({ ...prev, transactions: [paymentTx, ...updatedTxs] }));
    setInvoiceDetailModal(null);
  };

  const handleSaveFixed = (e: React.FormEvent) => {
      e.preventDefault();
      if (!fixedForm.name || !fixedForm.value) return;
      const newBill: FixedBill = {
          id: editingFixed ? editingFixed.id : Storage.generateId(),
          name: fixedForm.name!,
          value: Number(fixedForm.value),
          dueDay: Number(fixedForm.dueDay),
          category: fixedForm.category || 'Contas Fixas',
          lastPaidMonth: editingFixed ? editingFixed.lastPaidMonth : undefined
      };
      
      if (editingFixed) {
          setData(prev => ({ ...prev, fixedBills: prev.fixedBills.map(b => String(b.id) === String(editingFixed.id) ? newBill : b) }));
      } else {
          setData(prev => ({ ...prev, fixedBills: [...prev.fixedBills, newBill] }));
      }
      setIsFixedModalOpen(false);
  };

  const handlePayFixed = (bill: FixedBill) => {
      const newTx: Transaction = {
          id: Storage.generateId(),
          description: `Pgto. ${bill.name}`,
          value: bill.value,
          type: 'expense',
          category: bill.category,
          date: new Date().toISOString().slice(0, 10),
          method: 'Boleto',
          isPaid: true
      };
      setData(prev => ({
          ...prev,
          transactions: [newTx, ...prev.transactions],
          fixedBills: prev.fixedBills.map(b => String(b.id) === String(bill.id) ? { ...b, lastPaidMonth: currentMonth } : b)
      }));
  };

  const handleUpdateGoal = (cat: string, value: string) => {
    setData(prev => ({
        ...prev, 
        goals: { ...prev.goals, [cat]: parseFloat(value) || 0 }
    }));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
          try {
              const d = JSON.parse(ev.target?.result as string);
              if (d.transactions && confirm('Substituir todos os dados atuais pelos dados do arquivo?')) {
                  setData(d);
                  setIsConfigModalOpen(false);
              }
          } catch { alert('Erro ao ler arquivo.'); }
      };
      reader.readAsText(file);
  };

  const handleExport = () => {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financas_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
  };

  const openInvestmentModal = () => {
    setEditingTx(null);
    setPrefillTx({
        type: 'expense',
        category: 'Investimento',
        description: 'Aporte Mensal',
        method: 'Pix'
    });
    setIsTxModalOpen(true);
  };

  const openWithdrawModal = () => {
      setEditingTx(null);
      setPrefillTx({
          type: 'income',
          category: 'Investimento',
          description: 'Resgate de Investimento',
          method: 'Pix'
      });
      setIsTxModalOpen(true);
  };

  const handleFactoryReset = () => {
      if (confirm('TEM CERTEZA? Isso apagará TODOS os seus dados e não poderá ser desfeito.')) {
          localStorage.clear();
          // Force a small delay to ensure local storage is cleared before reload
          setTimeout(() => window.location.reload(), 200);
      }
  };

  return (
    <div className="flex min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
        
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col p-6 border-r border-zinc-800 bg-black/40 backdrop-blur-xl sticky top-0 h-screen no-print z-20">
            <h1 className="text-xl font-bold mb-10 flex items-center gap-3 tracking-tight text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 text-black"><Landmark size={20}/></div> 
                FinançasPro
            </h1>
            <nav className="space-y-2 flex-1">
                <NavButton id="dashboard" icon={LayoutDashboard} label="Visão Geral" activeTab={activeTab} onClick={setActiveTab}/>
                <NavButton id="transactions" icon={FileText} label="Movimentações" activeTab={activeTab} onClick={setActiveTab}/>
                <NavButton id="cards" icon={CreditCard} label="Cartões" activeTab={activeTab} onClick={setActiveTab}/>
                <NavButton id="goals" icon={Target} label="Metas" activeTab={activeTab} onClick={setActiveTab}/>
                <NavButton id="fixed" icon={Calendar} label="Fixas" activeTab={activeTab} onClick={setActiveTab}/>
            </nav>
            <div className="space-y-2">
                <button onClick={()=>setIsConfigModalOpen(true)} className="w-full text-left p-3 rounded-xl flex items-center gap-3 text-zinc-400 hover:text-white transition-all hover:bg-zinc-800/50 group"><Settings size={20}/> Configurações</button>
            </div>
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-800 z-50 px-4 py-3 flex justify-between items-center shadow-2xl no-print">
            <div className="font-bold flex gap-2 text-zinc-100 items-center"><Landmark className="text-emerald-500"/> FinançasPro</div>
            <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-300 p-2 active:scale-95 transition-transform">{isMobileMenuOpen?<X/>:<Menu/>}</button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
             <div className="fixed inset-0 bg-black/95 z-40 pt-24 px-6 lg:hidden no-print animate-in slide-in-from-top-10 backdrop-blur-xl">
                <nav className="space-y-4">
                    <NavButton id="dashboard" icon={LayoutDashboard} label="Visão Geral" activeTab={activeTab} onClick={(id: string) => {setActiveTab(id); setIsMobileMenuOpen(false);}}/>
                    <NavButton id="transactions" icon={FileText} label="Movimentações" activeTab={activeTab} onClick={(id: string) => {setActiveTab(id); setIsMobileMenuOpen(false);}}/>
                    <NavButton id="cards" icon={CreditCard} label="Cartões" activeTab={activeTab} onClick={(id: string) => {setActiveTab(id); setIsMobileMenuOpen(false);}}/>
                    <NavButton id="goals" icon={Target} label="Metas" activeTab={activeTab} onClick={(id: string) => {setActiveTab(id); setIsMobileMenuOpen(false);}}/>
                    <NavButton id="fixed" icon={Calendar} label="Fixas" activeTab={activeTab} onClick={(id: string) => {setActiveTab(id); setIsMobileMenuOpen(false);}}/>
                    <button onClick={()=>{setIsConfigModalOpen(true);setIsMobileMenuOpen(false)}} className="flex gap-3 text-zinc-400 p-4 w-full border-t border-zinc-800 mt-4"><Settings/> Configurações</button>
                </nav>
            </div>
        )}

        <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 overflow-x-hidden">
            {/* Date Navigator */}
             <div className="flex items-center justify-between mb-8 glass-panel p-2 rounded-2xl relative z-30 shadow-2xl lg:shadow-none border-zinc-800/80 mx-auto max-w-sm lg:max-w-none">
                <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95"><ChevronLeft size={20}/></button>
                <div className="text-center flex flex-col items-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Período</span>
                    <span className="text-zinc-100 font-bold text-lg capitalize flex items-center gap-2">{monthName}</span>
                </div>
                <button onClick={() => changeMonth(1)} className="p-3 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95"><ChevronRight size={20}/></button>
            </div>

            {activeTab === 'dashboard' && <DashboardView calculations={calculations} financialIntelligence={financialIntelligence} onNewTx={() => { setEditingTx(null); setPrefillTx(null); setIsTxModalOpen(true); }} onInvest={openInvestmentModal} onWithdraw={openWithdrawModal} setActiveTab={setActiveTab} setEditingTx={setEditingTx} setIsTxModalOpen={setIsTxModalOpen} />}
            {activeTab === 'transactions' && <TransactionsView transactions={calculations.monthTransactions} onNewTx={() => { setEditingTx(null); setPrefillTx(null); setIsTxModalOpen(true); }} setEditingTx={setEditingTx} setIsTxModalOpen={setIsTxModalOpen} onDeleteTx={handleDeleteTransaction} />}
            {activeTab === 'cards' && <CardsView cards={data.cards} getCardStats={getCardStats} getCardInvoices={getCardInvoices} setEditingCard={setEditingCard} setCardForm={setCardForm} setIsCardModalOpen={setIsCardModalOpen} onDeleteCard={handleDeleteCard} setInvoiceDetailModal={setInvoiceDetailModal} onPayInvoice={handlePayInvoice} />}
            {activeTab === 'fixed' && <FixedView fixedBills={data.fixedBills} currentMonth={currentMonth} onNew={() => { setEditingFixed(null); setFixedForm({}); setIsFixedModalOpen(true); }} onEdit={(b: any) => {setEditingFixed(b); setFixedForm(b); setIsFixedModalOpen(true)}} onDelete={(id: string) => {if(confirm('Excluir?')) setData(p=>({...p, fixedBills: p.fixedBills.filter(x=>String(x.id)!==String(id))}))}} onPay={handlePayFixed} />}
            {activeTab === 'goals' && <GoalsView categories={data.categories} goals={data.goals} transactions={calculations.monthTransactions} onUpdateGoal={handleUpdateGoal} />}
        </main>

        {/* --- MODALS --- */}
        <AddTransactionModal 
            isOpen={isTxModalOpen} 
            onClose={() => setIsTxModalOpen(false)} 
            onSave={handleSaveTransactions}
            cards={data.cards}
            categories={data.categories}
            editingTx={editingTx || prefillTx}
        />

        {/* Card Modal */}
        {isCardModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-enter">
                 <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl p-6 border-zinc-700/50 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Gerenciar Cartão</h3>
                        <button onClick={() => setIsCardModalOpen(false)}><X className="text-zinc-500 hover:text-white"/></button>
                    </div>
                    <form onSubmit={handleSaveCard} className="space-y-4">
                        <input type="text" required placeholder="Nome do Cartão (Ex: Nubank)" className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all" value={cardForm.name||''} onChange={e=>setCardForm({...cardForm, name:e.target.value})} />
                        <input type="number" required placeholder="Limite Total (R$)" className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all" value={cardForm.limit||''} onChange={e=>setCardForm({...cardForm, limit:e.target.value})} />
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1"><label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Fechamento</label><input type="number" required placeholder="Dia" className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all" value={cardForm.closingDay||''} onChange={e=>setCardForm({...cardForm, closingDay:e.target.value})} /></div>
                            <div className="space-y-1"><label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Vencimento</label><input type="number" required placeholder="Dia" className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all" value={cardForm.dueDay||''} onChange={e=>setCardForm({...cardForm, dueDay:e.target.value})} /></div>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 font-bold mb-3 block ml-1">ESTILO VISUAL</label>
                            <div className="flex gap-3 justify-center">
                                {CARD_GRADIENTS.map(g => (
                                    <button type="button" key={g} onClick={()=>setCardForm({...cardForm, gradient:g})} className={`w-12 h-12 rounded-2xl ${g} ${cardForm.gradient === g ? 'ring-2 ring-white scale-110 shadow-xl' : 'opacity-60 hover:opacity-100 hover:scale-105'} transition-all duration-300`}></button>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-xl tracking-wide mt-2">SALVAR CARTÃO</button>
                    </form>
                 </div>
             </div>
        )}

        {/* Fixed Bill Modal */}
        {isFixedModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-enter">
                 <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl p-6 border-zinc-700/50 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">{editingFixed ? "Editar Conta" : "Nova Conta Fixa"}</h3>
                        <button onClick={() => setIsFixedModalOpen(false)}><X className="text-zinc-500 hover:text-white"/></button>
                    </div>
                     <form onSubmit={handleSaveFixed} className="space-y-4">
                        <input type="text" required placeholder="Nome (Ex: Aluguel)" className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all" value={fixedForm.name||''} onChange={e=>setFixedForm({...fixedForm, name:e.target.value})} />
                        <input type="number" step="0.01" required placeholder="Valor (R$)" className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all" value={fixedForm.value||''} onChange={e=>setFixedForm({...fixedForm, value:e.target.value})} />
                        <div className="grid grid-cols-2 gap-3"><input type="number" required placeholder="Dia Venc." className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all" value={fixedForm.dueDay||''} onChange={e=>setFixedForm({...fixedForm, dueDay:e.target.value})} /><select className="w-full bg-zinc-950/30 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all appearance-none" value={fixedForm.category||'Contas Fixas'} onChange={e=>setFixedForm({...fixedForm, category:e.target.value})}>{data.categories.map(c=><option key={c} value={c} className="bg-zinc-900">{c}</option>)}</select></div>
                        <button type="submit" className="btn-primary w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-xl tracking-wide mt-2">SALVAR CONTA</button>
                    </form>
                 </div>
            </div>
        )}

        {/* Invoice Detail Modal */}
        {invoiceDetailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-enter">
                 <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl p-6 border-zinc-700/50 flex flex-col max-h-[80vh] animate-fade-in">
                     <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className="text-lg font-bold text-white">Fatura {Storage.getMonthName(invoiceDetailModal.month)}</h3>
                        <button onClick={() => setInvoiceDetailModal(null)}><X className="text-zinc-500 hover:text-white"/></button>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-950/50 border border-zinc-800 p-4 rounded-xl shadow-inner mb-4 shrink-0"><span className="text-zinc-400 text-sm font-medium">Total da Fatura</span><span className="text-2xl font-bold text-zinc-100">{Storage.formatCurrency(invoiceDetailModal.total)}</span></div>
                    <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 grow">
                        {invoiceDetailModal.items.map((tx: Transaction) => (
                            <div key={tx.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                                <div><p className="text-sm font-semibold text-zinc-200">{tx.description}</p><p className="text-[10px] text-zinc-500 font-mono mt-0.5">{Storage.formatDate(tx.date)} {tx.installmentNumber ? `• ${tx.installmentNumber}` : ''}</p></div><span className="text-sm text-red-400 font-bold">{Storage.formatCurrency(tx.value)}</span>
                            </div>
                        ))}
                    </div>
                     <button onClick={() => handlePayInvoice(invoiceDetailModal.cardId, invoiceDetailModal.total, invoiceDetailModal.month)} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-1 mt-4 shrink-0">REALIZAR PAGAMENTO</button>
                 </div>
            </div>
        )}

        {/* Config Modal */}
        {isConfigModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-enter">
                 <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl p-6 border-zinc-700/50 animate-fade-in">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Configurações do Sistema</h3>
                        <button onClick={() => setIsConfigModalOpen(false)}><X className="text-zinc-500 hover:text-white"/></button>
                    </div>
                     <div className="space-y-6">
                        <div>
                            <h4 className="text-zinc-400 text-xs font-bold uppercase mb-2 ml-1">Saldo Inicial</h4>
                            <input type="number" value={data.initialBalance} onChange={e=>setData(prev => ({...prev, initialBalance: parseFloat(e.target.value)||0}))} className="w-full bg-zinc-950/50 border border-zinc-700/50 p-3 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all font-mono text-lg"/>
                        </div>
                        <div>
                            <h4 className="text-zinc-400 text-xs font-bold uppercase mb-2 ml-1">Categorias</h4>
                            <div className="flex gap-2 mb-3">
                                <input type="text" placeholder="Nova categoria..." value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="bg-zinc-950/50 border border-zinc-700/50 p-3 rounded-xl text-white w-full outline-none focus:border-emerald-500/50 transition-all"/>
                                <button onClick={()=>{if(newCategory){setData(prev=>({...prev, categories: [...prev.categories, newCategory]})); setNewCategory('');}}} className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white p-3 rounded-xl transition-all border border-emerald-500/20"><Plus/></button>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                                {data.categories.map(c=><span key={c} className="bg-zinc-800/50 border border-zinc-700/50 text-xs p-2 pl-3 rounded-lg flex items-center gap-2 text-zinc-300 shadow-sm">{c} <button onClick={()=>setData(prev=>({...prev, categories: prev.categories.filter(x=>x!==c)}))} className="text-zinc-500 hover:text-red-400 transition-colors bg-black/20 rounded p-0.5"><X size={12}/></button></span>)}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-zinc-800/50">
                            <button onClick={handleExport} className="glass-button p-4 rounded-2xl flex flex-col items-center gap-2 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/30"><Download size={24}/><span className="text-xs font-bold">Backup JSON</span></button>
                            <button onClick={()=>fileInputRef.current?.click()} className="glass-button p-4 rounded-2xl flex flex-col items-center gap-2 text-blue-400 hover:text-blue-300 hover:border-blue-500/30 col-span-1"><Upload size={24}/><span className="text-xs font-bold">Importar Backup</span><input type="file" hidden ref={fileInputRef} onChange={handleImport}/></button>
                            <button onClick={handleFactoryReset} className="col-span-2 text-red-500 text-xs font-bold mt-2 hover:underline flex items-center justify-center gap-2"><RefreshCw size={12}/> Resetar Sistema de Fábrica</button>
                        </div>
                    </div>
                 </div>
            </div>
        )}
    </div>
  );
};

export default App;