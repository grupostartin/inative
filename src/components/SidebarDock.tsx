import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutGrid,
  Smartphone,
  ShoppingBag,
  PackagePlus,
  Wrench,
  Calculator,
  DollarSign,
  Users,
  Bell,
  Settings,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const SidebarDock: React.FC = () => {
  const { currentView, setCurrentView, alerts, setActiveModal, setIsSearchOpen } = useApp();

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutGrid },
    { id: 'estoque', label: 'Estoque', icon: Smartphone },
    { id: 'vendas', label: 'Vendas', icon: ShoppingBag },
    { id: 'compras', label: 'Compras', icon: PackagePlus },
    { id: 'reparos', label: 'Reparos', icon: Wrench },
    { id: 'calculadoras', label: 'Calculadoras', icon: Calculator },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'pessoas', label: 'Pessoas', icon: Users },
  ];

  return (
    <>
      {/* Desktop Vertical Dock - Styled like the reference image */}
      <aside
        id="desktop-dock"
        className="nav-enter hidden md:flex flex-col items-center justify-between py-6 px-3 bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl shadow-sm w-20 shrink-0 my-4 ml-4"
        style={{ height: 'calc(100vh - 2rem)' }}
      >
        {/* Top Logo / App Icon */}
        <div className="flex flex-col items-center gap-6">
          <button
            id="nav-logo-btn"
            onClick={() => setCurrentView('dashboard')}
            className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold tracking-tight shadow-md hover:scale-105 transition-transform"
            title="iNative — Início"
          >
            <span className="text-xl font-extrabold tracking-tighter">iN</span>
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setCurrentView(item.id)}
                  title={item.label}
                  className={`relative group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                  
                  {/* Tooltip */}
                  <span className="absolute left-16 px-2.5 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Alertas, Validar IMEI, Busca */}
        <div className="flex flex-col items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 w-full">
          <button
            id="dock-btn-search"
            onClick={() => setIsSearchOpen(true)}
            title="Busca Rápida (Ctrl+K)"
            className="w-11 h-11 rounded-2xl text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center justify-center transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            id="dock-btn-alerts"
            onClick={() => setCurrentView('alertas')}
            title="Central de Alertas"
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
              currentView === 'alertas'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black dark:bg-white ring-2 ring-white dark:ring-black" />
            )}
          </button>

          <button
            id="dock-btn-verify"
            onClick={() => setActiveModal('validar_imei')}
            title="Verificar IMEI / Procedência"
            className="w-11 h-11 rounded-2xl text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center justify-center transition-colors"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="nav-enter md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around"
      >
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-medium ${
            currentView === 'dashboard'
              ? 'text-black dark:text-white font-semibold'
              : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Início</span>
        </button>

        <button
          onClick={() => setCurrentView('estoque')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-medium ${
            currentView === 'estoque'
              ? 'text-black dark:text-white font-semibold'
              : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span>Estoque</span>
        </button>

        {/* Quick Action Center Button */}
        <button
          onClick={() => setActiveModal('pdv')}
          className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg -mt-5 hover:scale-105 transition-transform"
          title="Nova Venda Rápida"
        >
          <ShoppingBag className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentView('compras')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-medium ${
            currentView === 'compras'
              ? 'text-black dark:text-white font-semibold'
              : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <PackagePlus className="w-5 h-5" />
          <span>Compras</span>
        </button>

        <button
          onClick={() => setCurrentView('financeiro')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-medium ${
            currentView === 'financeiro'
              ? 'text-black dark:text-white font-semibold'
              : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span>Financeiro</span>
        </button>
      </nav>
    </>
  );
};
