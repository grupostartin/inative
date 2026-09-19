import React from 'react';
import { AlertTriangle, ChevronRight, FileText, Plus, Smartphone, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateAgingDays, formatBRL } from '../../lib/luhn';

export const DashboardView: React.FC = () => {
  const { devices, sales, transactions, setActiveModal, setCurrentView, setSelectedSaleForReceipt } = useApp();

  const activeDevices = devices.filter(device => device.status !== 'Vendido' && device.status !== 'Baixado');
  const completedSales = sales.filter(sale => sale.status === 'Concluida');
  const revenueCents = completedSales.reduce((total, sale) => total + sale.totalPaidCents, 0);
  const profitCents = completedSales.reduce((total, sale) => total + sale.netProfitCents, 0);
  const expenseCents = transactions.filter(transaction => transaction.type.startsWith('despesa')).reduce((total, transaction) => total + transaction.amountCents, 0);
  const capitalCents = activeDevices.reduce((total, device) => total + device.totalCostCents, 0);
  const margin = revenueCents > 0 ? ((profitCents / revenueCents) * 100).toFixed(1) : '0.0';
  const agingDevices = activeDevices.filter(device => calculateAgingDays(device.entryDate) >= 30);

  const metrics = [
    { label: 'Estoque ativo', value: `${activeDevices.length} un.`, detail: `${activeDevices.filter(device => device.status === 'ProntoParaVenda').length} prontos para venda`, icon: Smartphone },
    { label: 'Vendas concluídas', value: `${completedSales.length}`, detail: formatBRL(revenueCents), icon: TrendingUp },
    { label: 'Lucro líquido', value: formatBRL(profitCents), detail: `${margin}% de margem média`, icon: TrendingUp },
    { label: 'Capital em estoque', value: formatBRL(capitalCents), detail: `${formatBRL(expenseCents)} em despesas`, icon: Smartphone },
  ];

  return (
    <div className="space-y-4 pb-4 lg:h-[calc(100vh-8.5rem)] lg:overflow-hidden">
      {agingDevices.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black">
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /><p className="text-xs font-semibold">{agingDevices.length} aparelho{agingDevices.length > 1 ? 's' : ''} há mais de 30 dias em estoque.</p></div>
          <button onClick={() => setCurrentView('estoque')} className="text-xs font-bold underline whitespace-nowrap">Ver estoque <ChevronRight className="inline w-3 h-3" /></button>
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return <article key={metric.label} className="p-4 rounded-2xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm"><div className="flex items-start justify-between gap-2"><p className="text-[11px] text-neutral-500">{metric.label}</p><Icon className="w-4 h-4 text-neutral-400" /></div><p className="mt-2 text-xl font-extrabold tracking-tight font-mono-num text-black dark:text-white">{metric.value}</p><p className="mt-1 text-[10px] text-neutral-400">{metric.detail}</p></article>;
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-start">
        <article className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-black dark:text-white">Ações rápidas</h2><p className="text-xs text-neutral-500 mt-1">Registre a operação que precisa fazer agora.</p></div><Plus className="w-5 h-5 text-neutral-400" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <button onClick={() => setCurrentView('vendas')} className="min-h-14 px-4 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-left text-xs font-bold">Nova venda</button>
            <button onClick={() => setCurrentView('compras')} className="min-h-14 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-left text-xs font-bold">Nova compra</button>
            <button onClick={() => setCurrentView('estoque')} className="min-h-14 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-left text-xs font-bold">Gerenciar estoque</button>
          </div>
        </article>

        <article className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-black dark:text-white">Últimas vendas</h2><p className="text-xs text-neutral-500 mt-1">Movimentações já registradas.</p></div><button onClick={() => setCurrentView('vendas')} className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white">Ver todas</button></div>
          <div className="mt-4 space-y-2 overflow-y-auto">
            {sales.slice(0, 4).map(sale => <button key={sale.id} onClick={() => { setSelectedSaleForReceipt(sale); setActiveModal('receipt'); }} className="w-full p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 text-left flex items-center justify-between gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"><div><p className="text-xs font-bold text-black dark:text-white">{sale.deviceModel}</p><p className="text-[10px] text-neutral-400">{sale.customerName} · {sale.date}</p></div><div className="flex items-center gap-2"><span className="text-xs font-bold font-mono-num text-black dark:text-white">{formatBRL(sale.totalPaidCents)}</span><FileText className="w-3.5 h-3.5 text-neutral-400" /></div></button>)}
            {sales.length === 0 && <p className="py-8 text-center text-xs text-neutral-400">Nenhuma venda registrada ainda.</p>}
          </div>
        </article>
      </section>
    </div>
  );
};
