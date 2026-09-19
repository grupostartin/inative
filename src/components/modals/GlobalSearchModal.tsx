import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, maskIMEI } from '../../lib/luhn';
import { Search, Smartphone, User, ShoppingBag, X, ArrowRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    devices,
    contacts,
    sales,
    setSelectedDevice,
    setSelectedSaleForReceipt,
    setCurrentView,
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedDevices = q
    ? devices.filter(
        d =>
          d.model.toLowerCase().includes(q) ||
          d.imei1.includes(q) ||
          d.internalCode.toLowerCase().includes(q) ||
          d.color.toLowerCase().includes(q)
      )
    : [];

  const matchedContacts = q
    ? contacts.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      )
    : [];

  const matchedSales = q
    ? sales.filter(
        s =>
          s.saleNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.deviceModel.toLowerCase().includes(q) ||
          s.deviceImei.includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-xl rounded-3xl p-4 shadow-2xl space-y-4">
        {/* Search input */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por IMEI, modelo, cliente, código ou venda..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border-none text-sm font-medium text-black dark:text-white outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="absolute right-3 text-neutral-400 hover:text-black dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto space-y-4 px-1 text-xs">
          {!q && (
            <p className="text-center text-neutral-400 py-8">
              Digite ao menos 2 caracteres para buscar aparelhos, clientes ou vendas...
            </p>
          )}

          {/* Matched Devices */}
          {matchedDevices.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block px-1">
                Aparelhos no Estoque ({matchedDevices.length})
              </span>
              {matchedDevices.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDevice(d);
                    setIsGlobalSearchOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-neutral-400" />
                    <div>
                      <span className="font-bold text-black dark:text-white">
                        {d.model} {d.capacityGb}GB ({d.color})
                      </span>
                      <span className="text-[11px] text-neutral-400 block font-mono">
                        {d.internalCode} • IMEI: {maskIMEI(d.imei1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-black dark:text-white font-mono-num block">
                      {formatBRL(d.advertisedPriceCents)}
                    </span>
                    <span className="text-[10px] text-neutral-400">{d.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Matched Contacts */}
          {matchedContacts.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block px-1">
                Contatos ({matchedContacts.length})
              </span>
              {matchedContacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCurrentView('pessoas');
                    setIsGlobalSearchOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-neutral-400" />
                    <div>
                      <span className="font-bold text-black dark:text-white">{c.name}</span>
                      <span className="text-[11px] text-neutral-400 block font-mono-num">{c.phone}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-500 capitalize">{c.types.join(', ')}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Sales */}
          {matchedSales.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block px-1">
                Vendas ({matchedSales.length})
              </span>
              {matchedSales.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSaleForReceipt(s);
                    setIsGlobalSearchOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-neutral-400" />
                    <div>
                      <span className="font-bold text-black dark:text-white">
                        {s.saleNumber} — {s.customerName}
                      </span>
                      <span className="text-[11px] text-neutral-400 block">
                        {s.deviceModel} • {s.date}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold font-mono-num text-black dark:text-white">
                    {formatBRL(s.totalPaidCents)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {q && matchedDevices.length === 0 && matchedContacts.length === 0 && matchedSales.length === 0 && (
            <p className="text-center text-neutral-400 py-6">
              Nenhum resultado encontrado para &quot;{query}&quot;.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
