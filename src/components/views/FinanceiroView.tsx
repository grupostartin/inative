import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../lib/luhn';
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, Wallet, Building2, CreditCard, X } from 'lucide-react';

export const FinanceiroView: React.FC = () => {
  const { accounts, transactions, sales, addFinancialTransaction, addFinancialAccount } = useApp();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Despesas Operacionais');
  const [amountReais, setAmountReais] = useState(150);
  const [txType, setTxType] = useState<'receita' | 'despesa_operacional' | 'despesa_direta'>('despesa_operacional');
  const [accountId, setAccountId] = useState('');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'caixa' | 'banco' | 'maquininha'>('banco');

  const handleAddTransaction = (event: React.FormEvent) => {
    event.preventDefault();
    const selectedAccountId = accountId || accounts[0]?.id;
    if (!description.trim() || amountReais <= 0 || !selectedAccountId) return;

    const transaction = addFinancialTransaction({
      description: description.trim(),
      category,
      type: txType,
      amountCents: Math.round(amountReais * 100),
      date: new Date().toISOString().slice(0, 10),
      status: 'Realizado',
      accountId: selectedAccountId,
    });
    if (!transaction) return;

    setDescription('');
    setAmountReais(150);
    setAccountId('');
    setIsAddTxOpen(false);
  };

  const handleAddAccount = (event: React.FormEvent) => {
    event.preventDefault();
    if (!accountName.trim()) return;
    addFinancialAccount({ name: accountName.trim(), type: accountType });
    setAccountName('');
    setAccountType('banco');
    setIsAddAccountOpen(false);
  };

  // DRE Gerencial calculations
  const receitaBrutaCents = sales.reduce((acc, s) => acc + s.grossPriceCents, 0);
  const taxasVendaCents = sales.reduce((acc, s) => acc + s.totalFeesCents, 0);
  const descontosCents = sales.reduce((acc, s) => acc + s.discountCents, 0);
  const receitaLiquidaCents = receitaBrutaCents - taxasVendaCents - descontosCents;

  const cmvCents = sales.reduce((acc, s) => acc + s.deviceCostSnapshotCents, 0);
  const lucroBrutoCents = receitaLiquidaCents - cmvCents;

  const despesasOperacionaisCents = transactions
    .filter(t => t.type === 'despesa_operacional')
    .reduce((acc, t) => acc + t.amountCents, 0);

  const lucroLiquidoRealCents = lucroBrutoCents - despesasOperacionaisCents;

  const totalEmContas = accounts.reduce((acc, a) => acc + a.balanceCents, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Financeiro & DRE Gerencial
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Demonstrativo de resultado do exercício, fluxo de caixa e controle de contas
          </p>
        </div>

        <div className="flex gap-2 self-start">
          <button onClick={() => setIsAddAccountOpen(true)} className="px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold flex items-center gap-1.5"><Plus className="w-4 h-4" /><span>Nova Conta</span></button>
          <button onClick={() => setIsAddTxOpen(true)} className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"><Plus className="w-4 h-4" /><span>Novo Lançamento</span></button>
        </div>
      </div>

      {accounts.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200">
          Cadastre uma conta financeira no Supabase antes de registrar lançamentos.
        </div>
      )}

      {/* Account Balances Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div
            key={acc.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-neutral-400 font-medium">{acc.name}</p>
              <p className="text-xl font-bold text-black dark:text-white mt-1 font-mono-num">
                {formatBRL(acc.balanceCents)}
              </p>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold mt-1 block">
                {acc.type === 'banco' && 'Conta Corrente PJ'}
                {acc.type === 'maquininha' && 'Recebíveis Maquininha'}
                {acc.type === 'caixa' && 'Caixa Físico'}
              </span>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white">
              {acc.type === 'banco' && <Building2 className="w-5 h-5" />}
              {acc.type === 'maquininha' && <CreditCard className="w-5 h-5" />}
              {acc.type === 'caixa' && <Wallet className="w-5 h-5" />}
            </div>
          </div>
        ))}
      </div>

      {/* DRE Gerencial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 cols): DRE */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-black dark:text-white">
              DRE Gerencial do Período
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              Regime de Competência
            </span>
          </div>

          <div className="space-y-3 pt-2 text-xs divide-y divide-neutral-100 dark:divide-neutral-800">
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-black dark:text-white">(+) Receita Bruta de Vendas</span>
              <span className="font-bold font-mono-num">{formatBRL(receitaBrutaCents)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-neutral-500">
              <span>(-) Descontos Concedidos</span>
              <span className="font-mono-num">-{formatBRL(descontosCents)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-neutral-500">
              <span>(-) Taxas de Maquininha / Marketplaces</span>
              <span className="font-mono-num">-{formatBRL(taxasVendaCents)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 font-bold text-black dark:text-white">
              <span>(=) Receita Líquida</span>
              <span className="font-mono-num">{formatBRL(receitaLiquidaCents)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-neutral-500">
              <span>(-) CMV (Custo dos iPhones Vendidos)</span>
              <span className="font-mono-num">-{formatBRL(cmvCents)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 font-bold text-black dark:text-white">
              <span>(=) Lucro Bruto da Operação</span>
              <span className="font-mono-num">{formatBRL(lucroBrutoCents)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-neutral-500">
              <span>(-) Despesas Operacionais (Aluguel, Software, etc.)</span>
              <span className="font-mono-num">-{formatBRL(despesasOperacionaisCents)}</span>
            </div>

            <div className="flex justify-between items-center pt-3 text-sm font-extrabold text-black dark:text-white">
              <span>(=) LUCRO LÍQUIDO REAL</span>
              <span className="text-base font-mono-num">{formatBRL(lucroLiquidoRealCents)}</span>
            </div>
          </div>
        </div>

        {/* Right (6 cols): Recent Financial Transactions */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-black dark:text-white">
            Extrato de Lançamentos
          </h3>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {transactions.map(tx => {
              const isIncome = tx.type === 'receita';
              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isIncome
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-black dark:text-white">{tx.description}</p>
                      <p className="text-[11px] text-neutral-400">
                        {tx.category} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-mono-num font-bold ${
                      isIncome ? 'text-black dark:text-white' : 'text-neutral-500'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatBRL(tx.amountCents)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddTransaction} className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-black dark:text-white">Novo lançamento</h3>
              <button type="button" onClick={() => setIsAddTxOpen(false)} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <input required value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs" />
            <div className="grid grid-cols-2 gap-3">
              <select value={txType} onChange={e => setTxType(e.target.value as typeof txType)} className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs">
                <option value="receita">Receita</option>
                <option value="despesa_operacional">Despesa operacional</option>
                <option value="despesa_direta">Despesa direta</option>
              </select>
              <input type="number" min="0.01" step="0.01" required value={amountReais} onChange={e => setAmountReais(Number(e.target.value))} className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-mono-num" />
            </div>
            <input required value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoria" className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs" />
            <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs">
              <option value="">Selecione a conta</option>
              {accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddTxOpen(false)} className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">Cancelar</button>
              <button disabled={accounts.length === 0} className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold disabled:opacity-40">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddAccount} className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-bold text-base text-black dark:text-white">Nova conta financeira</h3><button type="button" onClick={() => setIsAddAccountOpen(false)} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
            <input autoFocus required value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Ex.: Banco Inter PJ" className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs" />
            <select value={accountType} onChange={e => setAccountType(e.target.value as typeof accountType)} className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs"><option value="banco">Conta bancária</option><option value="caixa">Caixa físico</option><option value="maquininha">Maquininha</option></select>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsAddAccountOpen(false)} className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">Cancelar</button><button className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold">Salvar</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
