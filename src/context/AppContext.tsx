import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DeviceItem,
  SaleRecord,
  PurchaseRecord,
  RepairOrder,
  Contact,
  FinancialAccount,
  FinancialTransaction,
  AlertNotification,
  DirectCost,
} from '../types';
import {
  fetchAllData,
  dbAddDevice,
  dbUpdateDevice,
  dbAddSale,
  dbUpdateSale,
  dbAddPurchase,
  dbAddRepairOrder,
  dbUpdateRepairOrder,
  dbAddContact,
  dbUpsertContact,
  dbAddTransaction,
  dbAddAccount,
  dbUpdateAccountBalance,
  dbUpdateAlertRead,
} from '../lib/supabaseApi';

interface AppContextType {
  // Navigation & Modals
  currentView: string;
  setCurrentView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isIMEIModalOpen: boolean;
  setIsIMEIModalOpen: (open: boolean) => void;

  // Modals
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  selectedDevice: DeviceItem | null;
  setSelectedDevice: (device: DeviceItem | null) => void;
  selectedSaleForReceipt: SaleRecord | null;
  setSelectedSaleForReceipt: (sale: SaleRecord | null) => void;

  // Data & Sync State
  devices: DeviceItem[];
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  repairs: RepairOrder[];
  contacts: Contact[];
  accounts: FinancialAccount[];
  transactions: FinancialTransaction[];
  alerts: AlertNotification[];
  isDbLoading: boolean;

  // Actions
  addDevice: (device: Omit<DeviceItem, 'id' | 'internalCode' | 'totalCostCents'>) => DeviceItem;
  updateDevice: (id: string, updates: Partial<DeviceItem>) => void;
  addDirectCostToDevice: (deviceId: string, cost: Omit<DirectCost, 'id'>) => void;
  completeSale: (saleData: Omit<SaleRecord, 'id' | 'saleNumber' | 'status'>, tradeInDeviceData?: Omit<DeviceItem, 'id' | 'internalCode' | 'totalCostCents'>) => SaleRecord;
  cancelSale: (saleId: string, reason: string) => void;
  createPurchase: (purchaseData: Omit<PurchaseRecord, 'id' | 'purchaseNumber' | 'items'>, newDevices: Omit<DeviceItem, 'id' | 'internalCode' | 'totalCostCents'>[]) => PurchaseRecord;
  createRepairOrder: (order: Omit<RepairOrder, 'id' | 'orderNumber' | 'status'>) => void;
  completeRepairOrder: (orderId: string) => void;
  markAlertRead: (alertId: string) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'totalTransactionsCount' | 'totalSpentOrSoldCents'>) => Contact;
  addFinancialTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => FinancialTransaction | null;
  addFinancialAccount: (account: Omit<FinancialAccount, 'id' | 'balanceCents'>) => FinancialAccount;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  DEVICES: 'inative_devices_v1',
  SALES: 'inative_sales_v1',
  PURCHASES: 'inative_purchases_v1',
  REPAIRS: 'inative_repairs_v1',
  CONTACTS: 'inative_contacts_v1',
  ACCOUNTS: 'inative_accounts_v1',
  TRANSACTIONS: 'inative_transactions_v1',
  ALERTS: 'inative_alerts_v1',
  DARK: 'inative_dark_mode',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isIMEIModalOpen, setIsIMEIModalOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<SaleRecord | null>(null);
  const [isDbLoading, setIsDbLoading] = useState<boolean>(true);

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK);
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.DARK, JSON.stringify(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Datasets state
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [repairs, setRepairs] = useState<RepairOrder[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  // Fetch initial data from Supabase backend
  useEffect(() => {
    setIsDbLoading(true);
    fetchAllData()
      .then(data => {
        setDevices(data.devices);
        setSales(data.sales);
        setPurchases(data.purchases);
        setRepairs(data.repairs);
        setContacts(data.contacts);
        setAccounts(data.accounts);
        setTransactions(data.transactions);
        setAlerts(data.alerts);
      })
      .catch(err => {
        console.error('Failed to load from Supabase database:', err);
      })
      .finally(() => {
        setIsDbLoading(false);
      });
  }, []);

  // Sync to local storage for offline fallback
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  }, [devices]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  }, [repairs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }, [contacts]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  // Actions
  const addDevice = (deviceData: Omit<DeviceItem, 'id' | 'internalCode' | 'totalCostCents'>): DeviceItem => {
    const nextNum = devices.length + 101;
    const internalCode = `INA-${String(nextNum).padStart(5, '0')}`;
    const directTotal = (deviceData.directCosts || []).reduce((acc, c) => acc + c.amountCents, 0);
    const totalCostCents = deviceData.acquisitionCostCents + directTotal;

    const newDevice: DeviceItem = {
      ...deviceData,
      id: `dev-${Date.now()}`,
      internalCode,
      totalCostCents,
    };

    setDevices(prev => [newDevice, ...prev]);
    dbAddDevice(newDevice);
    return newDevice;
  };

  const updateDevice = (id: string, updates: Partial<DeviceItem>) => {
    setDevices(prev =>
      prev.map(d => {
        if (d.id === id) {
          const merged = { ...d, ...updates };
          const directTotal = (merged.directCosts || []).reduce((acc, c) => acc + c.amountCents, 0);
          merged.totalCostCents = merged.acquisitionCostCents + directTotal;
          return merged;
        }
        return d;
      })
    );
    setSelectedDevice(prev => prev?.id === id ? { ...prev, ...updates } : prev);
    dbUpdateDevice(id, updates);
  };

  const addDirectCostToDevice = (deviceId: string, costData: Omit<DirectCost, 'id'>) => {
    const newCost: DirectCost = {
      ...costData,
      id: `cost-${Date.now()}`,
    };

    let updatedCosts: DirectCost[] = [];
    let updatedTotalCost = 0;

    setDevices(prev =>
      prev.map(d => {
        if (d.id === deviceId) {
          updatedCosts = [...d.directCosts, newCost];
          const directTotal = updatedCosts.reduce((acc, c) => acc + c.amountCents, 0);
          updatedTotalCost = d.acquisitionCostCents + directTotal;
          return {
            ...d,
            directCosts: updatedCosts,
            totalCostCents: updatedTotalCost,
          };
        }
        return d;
      })
    );

    dbUpdateDevice(deviceId, { directCosts: updatedCosts, totalCostCents: updatedTotalCost });

    if (accounts[0]) {
      addFinancialTransaction({
        description: `Custo direto: ${costData.description}`,
        category: 'Reparos e Custos Diretos',
        type: 'despesa_direta',
        amountCents: costData.amountCents,
        date: costData.date || new Date().toISOString().split('T')[0],
        status: 'Realizado',
        accountId: accounts[0].id,
        relatedDeviceId: deviceId,
      });
    }
  };

  const completeSale = (
    saleData: Omit<SaleRecord, 'id' | 'saleNumber' | 'status'>,
    tradeInDeviceData?: Omit<DeviceItem, 'id' | 'internalCode' | 'totalCostCents'>
  ): SaleRecord => {
    const saleNumber = `V-${String(sales.length + 185).padStart(6, '0')}`;
    const newSale: SaleRecord = {
      ...saleData,
      id: `sale-${Date.now()}`,
      saleNumber,
      status: 'Concluida',
    };

    // If trade-in occurred
    if (tradeInDeviceData) {
      const createdTradeInDevice = addDevice({
        ...tradeInDeviceData,
        status: 'EmAvaliacao',
        notes: `Entrou como Trade-in na venda ${saleNumber} de ${saleData.customerName}`,
      });

      const newPurchase: PurchaseRecord = {
        id: `pur-${Date.now()}`,
        purchaseNumber: `C-${String(purchases.length + 93).padStart(5, '0')}`,
        date: newSale.date,
        supplierName: saleData.customerName,
        supplierPhone: saleData.customerPhone,
        supplierCpf: saleData.customerCpf,
        origin: 'TradeIn',
        items: [
          {
            deviceId: createdTradeInDevice.id,
            model: createdTradeInDevice.model,
            imei: createdTradeInDevice.imei1,
            amountCents: createdTradeInDevice.acquisitionCostCents,
          },
        ],
        totalCents: createdTradeInDevice.acquisitionCostCents,
        paymentMethod: 'TradeIn (Abatimento em Venda)',
        provenanceTermSigned: true,
        notes: `Trade-in referente à venda ${saleNumber}`,
      };

      setPurchases(prev => [newPurchase, ...prev]);
      dbAddPurchase(newPurchase);
    }

    // Mark device as Vendido
    setDevices(prev =>
      prev.map(d => {
        if (d.id === saleData.deviceId) {
          return {
            ...d,
            status: 'Vendido',
            soldDate: saleData.date,
          };
        }
        return d;
      })
    );
    dbUpdateDevice(saleData.deviceId, { status: 'Vendido', soldDate: saleData.date });

    // Register sale record
    setSales(prev => [newSale, ...prev]);
    dbAddSale(newSale);

    // Financial transaction
    if (accounts[0]) {
      addFinancialTransaction({
        description: `Venda ${saleNumber} - ${saleData.deviceModel}`,
        category: 'Venda de Aparelhos',
        type: 'receita',
        amountCents: saleData.netRevenueCents,
        date: saleData.date,
        status: 'Realizado',
        accountId: accounts[0].id,
        relatedDeviceId: saleData.deviceId,
      });
    }

    // Update or create contact
    setContacts(prev => {
      const existing = prev.find(c => c.phone === saleData.customerPhone || (c.cpfCnpj && c.cpfCnpj === saleData.customerCpf));
      if (existing) {
        const updatedContact: Contact = {
          ...existing,
          totalTransactionsCount: existing.totalTransactionsCount + 1,
          totalSpentOrSoldCents: existing.totalSpentOrSoldCents + saleData.totalPaidCents,
        };
        dbUpsertContact(updatedContact);
        return prev.map(c => (c.id === existing.id ? updatedContact : c));
      }
      const newContact: Contact = {
        id: `ct-${Date.now()}`,
        name: saleData.customerName,
        types: ['cliente'],
        phone: saleData.customerPhone,
        cpfCnpj: saleData.customerCpf,
        totalTransactionsCount: 1,
        totalSpentOrSoldCents: saleData.totalPaidCents,
        createdAt: saleData.date,
      };
      dbAddContact(newContact);
      return [newContact, ...prev];
    });

    return newSale;
  };

  const cancelSale = (saleId: string, reason: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const notes = `${sale.notes || ''} [CANCELADA: ${reason}]`;
    setSales(prev =>
      prev.map(s => (s.id === saleId ? { ...s, status: 'Cancelada', notes } : s))
    );
    dbUpdateSale(saleId, { status: 'Cancelada', notes });

    setDevices(prev =>
      prev.map(d => (d.id === sale.deviceId ? { ...d, status: 'ProntoParaVenda', soldDate: undefined } : d))
    );
    dbUpdateDevice(sale.deviceId, { status: 'ProntoParaVenda', soldDate: undefined });
  };

  const createPurchase = (
    purchaseData: Omit<PurchaseRecord, 'id' | 'purchaseNumber' | 'items'>,
    newDevices: Omit<DeviceItem, 'id' | 'internalCode' | 'totalCostCents'>[]
  ): PurchaseRecord => {
    const purchaseNumber = `C-${String(purchases.length + 93).padStart(5, '0')}`;
    const createdDeviceItems = newDevices.map(d => addDevice(d));

    const newPurchase: PurchaseRecord = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      purchaseNumber,
      items: createdDeviceItems.map(d => ({
        deviceId: d.id,
        model: d.model,
        imei: d.imei1,
        amountCents: d.acquisitionCostCents,
      })),
    };

    setPurchases(prev => [newPurchase, ...prev]);
    dbAddPurchase(newPurchase);

    if (accounts[0]) {
      addFinancialTransaction({
        description: `Compra ${purchaseNumber} - ${purchaseData.supplierName}`,
        category: 'Compra de Aparelho',
        type: 'despesa_direta',
        amountCents: purchaseData.totalCents,
        date: purchaseData.date,
        status: 'Realizado',
        accountId: accounts[0].id,
      });
    }

    setContacts(prev => {
      const existing = prev.find(c => c.phone === purchaseData.supplierPhone || (c.cpfCnpj && c.cpfCnpj === purchaseData.supplierCpf));
      if (existing) {
        const updatedContact: Contact = {
          ...existing,
          types: Array.from(new Set([...existing.types, 'fornecedor'])),
          totalTransactionsCount: existing.totalTransactionsCount + 1,
          totalSpentOrSoldCents: existing.totalSpentOrSoldCents + purchaseData.totalCents,
        };
        dbUpsertContact(updatedContact);
        return prev.map(c => (c.id === existing.id ? updatedContact : c));
      }
      const newContact: Contact = {
        id: `ct-${Date.now()}`,
        name: purchaseData.supplierName,
        types: ['fornecedor'],
        phone: purchaseData.supplierPhone,
        cpfCnpj: purchaseData.supplierCpf,
        totalTransactionsCount: 1,
        totalSpentOrSoldCents: purchaseData.totalCents,
        createdAt: purchaseData.date,
      };
      dbAddContact(newContact);
      return [newContact, ...prev];
    });

    return newPurchase;
  };

  const createRepairOrder = (order: Omit<RepairOrder, 'id' | 'orderNumber' | 'status'>) => {
    const orderNumber = `OR-${String(repairs.length + 39).padStart(4, '0')}`;
    const newOrder: RepairOrder = {
      ...order,
      id: `rep-${Date.now()}`,
      orderNumber,
      status: 'EmExecucao',
    };
    setRepairs(prev => [newOrder, ...prev]);
    dbAddRepairOrder(newOrder);

    updateDevice(order.deviceId, { status: 'EmReparo' });
  };

  const completeRepairOrder = (orderId: string) => {
    const rep = repairs.find(r => r.id === orderId);
    if (!rep) return;

    const completedDate = new Date().toISOString().split('T')[0];
    setRepairs(prev =>
      prev.map(r =>
        r.id === orderId
          ? { ...r, status: 'Concluida', completedDate }
          : r
      )
    );
    dbUpdateRepairOrder(orderId, { status: 'Concluida', completedDate });

    addDirectCostToDevice(rep.deviceId, {
      type: 'pecas',
      description: `Reparo ${rep.orderNumber}: ${rep.issue}`,
      amountCents: rep.totalCostCents,
      date: completedDate,
    });

    updateDevice(rep.deviceId, { status: 'ProntoParaVenda' });
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, read: true } : a)));
    dbUpdateAlertRead(alertId);
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'totalTransactionsCount' | 'totalSpentOrSoldCents'>): Contact => {
    const newContact: Contact = {
      ...contactData,
      id: `ct-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalTransactionsCount: 0,
      totalSpentOrSoldCents: 0,
    };
    setContacts(prev => [newContact, ...prev]);
    dbAddContact(newContact);
    return newContact;
  };

  const addFinancialTransaction = (transactionData: Omit<FinancialTransaction, 'id'>): FinancialTransaction | null => {
    const account = accounts.find(a => a.id === transactionData.accountId);
    if (!account) return null;

    const newTransaction: FinancialTransaction = {
      ...transactionData,
      id: `tx-${Date.now()}`,
    };
    const balanceChange = newTransaction.type === 'receita' ? newTransaction.amountCents : -newTransaction.amountCents;
    const updatedBalance = account.balanceCents + balanceChange;

    setTransactions(prev => [newTransaction, ...prev]);
    setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, balanceCents: updatedBalance } : a));
    dbAddTransaction(newTransaction);
    dbUpdateAccountBalance(account.id, updatedBalance);
    return newTransaction;
  };

  const addFinancialAccount = (accountData: Omit<FinancialAccount, 'id' | 'balanceCents'>): FinancialAccount => {
    const account: FinancialAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
      balanceCents: 0,
    };
    setAccounts(prev => [...prev, account]);
    dbAddAccount(account);
    return account;
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        isDark,
        toggleDarkMode,
        isSearchOpen,
        setIsSearchOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isIMEIModalOpen,
        setIsIMEIModalOpen,
        activeModal,
        setActiveModal,
        selectedDevice,
        setSelectedDevice,
        selectedSaleForReceipt,
        setSelectedSaleForReceipt,
        devices,
        sales,
        purchases,
        repairs,
        contacts,
        accounts,
        transactions,
        alerts,
        isDbLoading,
        addDevice,
        updateDevice,
        addDirectCostToDevice,
        completeSale,
        cancelSale,
        createPurchase,
        createRepairOrder,
        completeRepairOrder,
          markAlertRead,
          addContact,
          addFinancialTransaction,
          addFinancialAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
