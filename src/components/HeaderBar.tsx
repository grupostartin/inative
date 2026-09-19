import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Sun, Moon, Plus } from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const {
    isDark,
    toggleDarkMode,
    setIsSearchOpen,
    alerts,
    setCurrentView,
    setActiveModal,
  } = useApp();

  const unreadAlerts = alerts.filter(a => !a.read);

  return (
    <>
    <header className="hidden md:flex md:flex-row md:items-center justify-between gap-4 py-2 px-1 mb-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black dark:text-white">
          Olá, Gestor!
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Gestão minimalista de iPhones — compra, reparo, estoque e lucro real
        </p>
      </div>

      {/* Right Controls: Search Pill, Bell, Dark Mode, Quick Sale */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search Pill - Styled like the reference image */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-full pl-4 pr-1.5 py-1.5 shadow-sm cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors w-full sm:w-72"
        >
          <span className="text-sm text-neutral-400 select-none flex-1">
            Buscar IMEI, modelo, cliente...
          </span>
          <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* Notifications */}
        <button
          id="btn-header-alerts"
          onClick={() => setCurrentView('alertas')}
          className="relative w-10 h-10 rounded-full bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Alertas"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts.length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-black dark:bg-white ring-2 ring-white dark:ring-[#121214]" />
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary Action: Nova Venda */}
        <button
          id="btn-quick-sale"
          onClick={() => setActiveModal('pdv')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Venda</span>
        </button>
      </div>
    </header>

    <header className="md:hidden sticky top-0 z-30 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 bg-[#fbfbfb]/90 dark:bg-[#09090b]/90 backdrop-blur-xl">
      <div className="overflow-hidden rounded-[1.6rem] bg-[#171719] text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] dark:bg-white dark:text-black">
        <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex min-w-0 items-center gap-2.5 text-left"
            aria-label="Ir para o início"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem] bg-white text-sm font-black tracking-tighter text-black dark:bg-black dark:text-white">
              iN
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight">iNative</span>
              <span className="block truncate text-[11px] text-white/55 dark:text-black/50">Gestão de iPhones</span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setCurrentView('alertas')}
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition-colors active:bg-white/20 dark:bg-black/8 dark:text-black dark:active:bg-black/15"
              aria-label="Alertas"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadAlerts.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white ring-2 ring-[#171719] dark:bg-black dark:ring-white" />
              )}
            </button>
            <button
              onClick={toggleDarkMode}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition-colors active:bg-white/20 dark:bg-black/8 dark:text-black dark:active:bg-black/15"
              aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-white/10 px-3 text-left transition-colors active:bg-white/20 dark:bg-black/8 dark:active:bg-black/15"
          >
            <Search className="h-4 w-4 shrink-0 text-white/65 dark:text-black/55" />
            <span className="truncate text-xs font-medium text-white/60 dark:text-black/55">Buscar IMEI, cliente ou modelo</span>
          </button>
          <button
            onClick={() => setActiveModal('pdv')}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-extrabold text-black transition-transform active:scale-95 dark:bg-black dark:text-white"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Vender
          </button>
        </div>
      </div>
    </header>
    </>
  );
};
