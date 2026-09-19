/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SidebarDock } from './components/SidebarDock';
import { HeaderBar } from './components/HeaderBar';
import { AuthGate } from './components/AuthGate';

// Views
import { DashboardView } from './components/views/DashboardView';
import { EstoqueView } from './components/views/EstoqueView';
import { PDVView } from './components/views/PDVView';
import { CompraWizardView } from './components/views/CompraWizardView';
import { ReparosView } from './components/views/ReparosView';
import { FinanceiroView } from './components/views/FinanceiroView';
import { CalculadorasView } from './components/views/CalculadorasView';
import { PessoasView } from './components/views/PessoasView';
import { AlertasView } from './components/views/AlertasView';

// Modals
import { DeviceDetailsModal } from './components/modals/DeviceDetailsModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { IMEIValidatorModal } from './components/modals/IMEIValidatorModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';

const MainLayout: React.FC = () => {
  const { currentView, activeModal, setActiveModal } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'estoque':
        return <EstoqueView />;
      case 'vendas':
        return <PDVView />;
      case 'pdv':
        return <PDVView />;
      case 'compras':
        return <CompraWizardView />;
      case 'reparos':
        return <ReparosView />;
      case 'financeiro':
        return <FinanceiroView />;
      case 'calculadoras':
        return <CalculadorasView />;
      case 'pessoas':
        return <PessoasView />;
      case 'alertas':
        return <AlertasView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row transition-colors">
      {/* Fixed Left Navigation Dock */}
      <SidebarDock />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-20">
        {/* Top Header */}
        <HeaderBar />

        {/* Dynamic View Container */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 pb-24 md:py-6 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <DeviceDetailsModal />
      <ReceiptModal />
      <IMEIValidatorModal />
      <GlobalSearchModal />

      {/* Active Modal: Compra Wizard Overlay */}
      {activeModal === 'compra' && currentView !== 'compras' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-3xl rounded-3xl p-6 shadow-2xl my-auto">
            <CompraWizardView onClose={() => setActiveModal(null)} />
          </div>
        </div>
      )}

      {/* Active Modal: PDV Overlay */}
      {activeModal === 'pdv' && currentView !== 'pdv' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-5xl rounded-3xl p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <PDVView onClose={() => setActiveModal(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthGate>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthGate>
  );
}
