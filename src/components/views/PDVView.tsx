import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, maskPhone, maskCPF, validateIMEI } from '../../lib/luhn';
import { DeviceItem, PaymentSplit } from '../../types';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  ArrowRightLeft,
  FileText,
  X,
  Send,
} from 'lucide-react';

export const PDVView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { devices, sales, completeSale, setSelectedSaleForReceipt, setActiveModal } = useApp();
  const [activeTab, setActiveTab] = useState<'nova' | 'recentes'>('nova');

  // 1. Device Selection
  const availableDevices = useMemo(
    () => devices.filter(d => d.status !== 'Vendido' && d.status !== 'Baixado'),
    [devices]
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    availableDevices[0]?.id || ''
  );
  const selectedDevice = availableDevices.find(d => d.id === selectedDeviceId);

  // 2. Customer Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [channel, setChannel] = useState<'WhatsApp' | 'Instagram' | 'OLX' | 'MercadoLivre' | 'Presencial' | 'Indicacao'>('WhatsApp');

  // 3. Price & Discount
  const [agreedPriceCents, setAgreedPriceCents] = useState<number>(
    selectedDevice ? selectedDevice.advertisedPriceCents : 300000
  );
  const [discountCents, setDiscountCents] = useState<number>(0);

  // Sync agreed price when device changes
  React.useEffect(() => {
    if (selectedDevice) {
      setAgreedPriceCents(selectedDevice.advertisedPriceCents);
    }
  }, [selectedDeviceId]);

  // 4. Payments (Mixed payments: Pix, Dinheiro, Cartão, Trade-in)
  const finalPriceToPayCents = Math.max(0, agreedPriceCents - discountCents);

  const [payments, setPayments] = useState<PaymentSplit[]>([
    {
      id: 'p-initial',
      method: 'pix',
      amountCents: finalPriceToPayCents,
      feePct: 0,
      feeAmountCents: 0,
      netAmountCents: finalPriceToPayCents,
    },
  ]);

  // Auto-update first payment if user changes price and only 1 payment exists
  const handlePriceChange = (newPrice: number) => {
    setAgreedPriceCents(newPrice);
    if (payments.length === 1) {
      const net = Math.max(0, newPrice - discountCents);
      setPayments([{ ...payments[0], amountCents: net, netAmountCents: net }]);
    }
  };

  const handleDiscountChange = (newDiscount: number) => {
    setDiscountCents(newDiscount);
    if (payments.length === 1) {
      const net = Math.max(0, agreedPriceCents - newDiscount);
      setPayments([{ ...payments[0], amountCents: net, netAmountCents: net }]);
    }
  };

  // Trade-in state
  const [tradeInModel, setTradeInModel] = useState('iPhone 12 64GB');
  const [tradeInImei, setTradeInImei] = useState('359182049281047');
  const [tradeInBattery, setTradeInBattery] = useState(82);

  // Card fee calculation
  const getCardFeePct = (installments: number = 1): number => {
    if (installments === 1) return 2.5;
    if (installments <= 3) return 4.0;
    if (installments <= 6) return 5.5;
    return 7.5;
  };

  const addPaymentMethod = (method: 'pix' | 'dinheiro' | 'debito' | 'credito' | 'tradein') => {
    const totalCurrentPaid = payments.reduce((acc, p) => acc + p.amountCents, 0);
    const remainingToPay = Math.max(0, finalPriceToPayCents - totalCurrentPaid);

    let feePct = 0;
    let installments = 1;
    if (method === 'credito') {
      feePct = getCardFeePct(1);
    }

    const feeAmount = Math.round(remainingToPay * (feePct / 100));
    const net = remainingToPay - feeAmount;

    setPayments(prev => [
      ...prev,
      {
        id: `pay-${Date.now()}`,
        method,
        amountCents: remainingToPay,
        installments: method === 'credito' ? 1 : undefined,
        feePct,
        feeAmountCents: feeAmount,
        netAmountCents: net,
        tradeInModel: method === 'tradein' ? tradeInModel : undefined,
      },
    ]);
  };

  const updatePayment = (id: string, updates: Partial<PaymentSplit>) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id === id) {
          const merged = { ...p, ...updates };
          if (merged.method === 'credito') {
            const fee = getCardFeePct(merged.installments || 1);
            merged.feePct = fee;
            merged.feeAmountCents = Math.round(merged.amountCents * (fee / 100));
            merged.netAmountCents = merged.amountCents - merged.feeAmountCents;
          } else {
            merged.feePct = 0;
            merged.feeAmountCents = 0;
            merged.netAmountCents = merged.amountCents;
          }
          return merged;
        }
        return p;
      })
    );
  };

  const removePayment = (id: string) => {
    if (payments.length <= 1) return;
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  // Financial totals
  const totalPaidCents = payments.reduce((acc, p) => acc + p.amountCents, 0);
  const totalFeesCents = payments.reduce((acc, p) => acc + (p.feeAmountCents || 0), 0);
  const netRevenueCents = totalPaidCents - totalFeesCents;

  const deviceCost = selectedDevice ? selectedDevice.totalCostCents : 0;
  const netProfitCents = netRevenueCents - deviceCost;
  const marginPct =
    finalPriceToPayCents > 0
      ? Number(((netProfitCents / finalPriceToPayCents) * 100).toFixed(1))
      : 0;

  const isBelowFloor = selectedDevice ? finalPriceToPayCents < selectedDevice.floorPriceCents : false;
  const isFullyPaid = totalPaidCents === finalPriceToPayCents;

  // Final confirmation
  const handleConfirmSale = () => {
    if (!selectedDevice) return;
    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (!isFullyPaid) {
      alert(
        `A soma dos pagamentos (${formatBRL(totalPaidCents)}) deve ser exatamente igual ao valor final (${formatBRL(
          finalPriceToPayCents
        )}).`
      );
      return;
    }

    // Check trade-in
    const hasTradeIn = payments.some(p => p.method === 'tradein');
    const tradeInPayment = payments.find(p => p.method === 'tradein');

    const tradeInDeviceData =
      hasTradeIn && tradeInPayment
        ? {
            model: tradeInModel,
            capacityGb: 64,
            color: 'Preto',
            imei1: tradeInImei.replace(/\D/g, '') || '359182049281047',
            serial: 'TRADE-IN-' + Date.now().toString().slice(-6),
            condition: 'B' as const,
            batteryPct: tradeInBattery,
            iosVersion: '17.4',
            accessories: [],
            status: 'EmAvaliacao' as const,
            location: 'Gaveta de Entrada',
            acquisitionCostCents: tradeInPayment.amountCents,
            directCosts: [],
            suggestedPriceCents: Math.round(tradeInPayment.amountCents * 1.35),
            advertisedPriceCents: Math.round(tradeInPayment.amountCents * 1.3),
            floorPriceCents: Math.round(tradeInPayment.amountCents * 1.15),
            entryDate: new Date().toISOString().split('T')[0],
            checklist: {
              screenOriginal: true,
              touchWorking: true,
              trueToneWorking: true,
              faceIdWorking: true,
              batteryHealth: tradeInBattery,
              batteryOriginal: true,
              camerasWorking: true,
              housingCondition: 'MarcasLeves' as const,
              audioMicWorking: true,
              wifiBluetoothWorking: true,
              chargingPortWorking: true,
              buttonsWorking: true,
              allTested: true,
            },
            provenance: {
              imeiValid: true,
              imeiConsultStatus: 'Regular' as const,
              icloudStatus: 'Desconectado' as const,
              mdmStatus: 'SemPerfil' as const,
              carrierStatus: 'Desbloqueado' as const,
              supplierDocChecked: true,
              checkDate: new Date().toISOString().split('T')[0],
            },
            photos: [],
          }
        : undefined;

    const today = new Date().toISOString().split('T')[0];
    const warrantyEnd = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const sale = completeSale(
      {
        date: today,
        deviceId: selectedDevice.id,
        deviceModel: `${selectedDevice.model} ${selectedDevice.capacityGb}GB ${selectedDevice.color}`,
        deviceImei: selectedDevice.imei1,
        deviceCapacity: selectedDevice.capacityGb,
        customerName,
        customerPhone,
        customerCpf,
        channel,
        grossPriceCents: agreedPriceCents,
        discountCents,
        totalPaidCents,
        totalFeesCents,
        netRevenueCents,
        deviceCostSnapshotCents: selectedDevice.totalCostCents,
        netProfitCents,
        marginPct,
        payments,
        warrantyDays: 90,
        warrantyStart: today,
        warrantyEnd,
        notes: `Garantia legal e balcão de 90 dias. Bateria ${selectedDevice.batteryPct}%.`,
      },
      tradeInDeviceData
    );

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#ffffff', '#888888'],
      });
    } catch {
      // safe fallback
    }

    setSelectedSaleForReceipt(sale);
    setActiveModal('receipt');
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white">{activeTab === 'nova' ? 'PDV — Nova Venda Rápida' : 'Vendas — Histórico recente'}</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {activeTab === 'nova' ? 'Venda com baixa automática de estoque, cálculo de lucro em tempo real e geração de recibo' : 'Consulte as últimas vendas concluídas e reabra seus recibos'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('nova')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'nova' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-neutral-500'}`}>Nova venda</button>
        <button onClick={() => setActiveTab('recentes')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'recentes' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-neutral-500'}`}>Últimas vendas ({sales.length})</button>
      </div>

      {activeTab === 'recentes' ? (
        <section className="space-y-3">
          {sales.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 text-center"><p className="font-bold text-black dark:text-white">Nenhuma venda registrada</p><p className="text-xs text-neutral-500 mt-1">As vendas concluídas aparecerão aqui.</p><button onClick={() => setActiveTab('nova')} className="mt-4 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold">Registrar venda</button></div>
          ) : sales.slice(0, 20).map(sale => (
            <article key={sale.id} className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div><div className="flex items-center gap-2"><span className="font-mono text-xs text-neutral-400">{sale.saleNumber}</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sale.status === 'Concluida' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>{sale.status}</span></div><h3 className="mt-1 font-bold text-black dark:text-white">{sale.deviceModel}</h3><p className="text-xs text-neutral-500 mt-1">{sale.customerName} · {sale.date} · {sale.channel}</p></div>
              <div className="flex items-center gap-4"><div className="text-right"><span className="text-[10px] uppercase font-bold text-neutral-400 block">Total pago</span><span className="font-bold font-mono-num text-black dark:text-white">{formatBRL(sale.totalPaidCents)}</span></div><button onClick={() => { setSelectedSaleForReceipt(sale); setActiveModal('receipt'); }} className="p-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black" title="Abrir recibo"><FileText className="w-4 h-4" /></button></div>
            </article>
          ))}
        </section>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Device, Client, Payments */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step 1: Device Selection */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              1. Selecionar Aparelho do Estoque
            </label>
            <select
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              className="w-full p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold text-black dark:text-white border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              {availableDevices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.model} {d.capacityGb}GB ({d.color}) — {formatBRL(d.advertisedPriceCents)} [Custo: {formatBRL(d.totalCostCents)}]
                </option>
              ))}
            </select>

            {selectedDevice && (
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-black dark:text-white">{selectedDevice.model}</span>
                  <span className="text-neutral-400 block text-[11px]">
                    IMEI: •••• {selectedDevice.imei1.slice(-4)} • Saúde Bateria: {selectedDevice.batteryPct}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 text-[10px] uppercase block">Custo Total (CT)</span>
                  <span className="font-mono-num font-bold text-black dark:text-white">
                    {formatBRL(selectedDevice.totalCostCents)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Customer & Channel */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              2. Dados do Comprador & Canal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Nome Completo *</span>
                <input
                  type="text"
                  placeholder="Ex: Amanda Silveira"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">WhatsApp / Telefone</span>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(maskPhone(e.target.value))}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-mono-num"
                />
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">CPF (p/ Recibo de Garantia)</span>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={customerCpf}
                  onChange={e => setCustomerCpf(maskCPF(e.target.value))}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-mono-num"
                />
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Canal da Venda</span>
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value as any)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Presencial">Presencial / Balcão</option>
                  <option value="OLX">OLX</option>
                  <option value="MercadoLivre">Mercado Livre</option>
                  <option value="Indicacao">Indicação de Amigo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Mixed Payment Splits */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                3. Formas de Pagamento (Misto & Trade-in)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => addPaymentMethod('pix')}
                  className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-[11px] font-semibold"
                >
                  + Pix
                </button>
                <button
                  type="button"
                  onClick={() => addPaymentMethod('credito')}
                  className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-[11px] font-semibold"
                >
                  + Cartão
                </button>
                <button
                  type="button"
                  onClick={() => addPaymentMethod('tradein')}
                  className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-[11px] font-semibold"
                >
                  + Trade-in (Troca)
                </button>
              </div>
            </div>

            {/* Payments List */}
            <div className="space-y-3">
              {payments.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                      {p.method === 'pix' && 'Pix'}
                      {p.method === 'dinheiro' && 'Dinheiro'}
                      {p.method === 'debito' && 'Débito'}
                      {p.method === 'credito' && 'Cartão de Crédito'}
                      {p.method === 'tradein' && 'Trade-in (iPhone na troca)'}
                    </span>

                    {payments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePayment(p.id)}
                        className="text-neutral-400 hover:text-black dark:hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Valor pago (R$)</span>
                      <input
                        type="number"
                        step="10"
                        value={p.amountCents / 100}
                        onChange={e =>
                          updatePayment(p.id, {
                            amountCents: Math.round(parseFloat(e.target.value || '0') * 100),
                          })
                        }
                        className="w-full p-2 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-700 text-xs font-bold font-mono-num"
                      />
                    </div>

                    {p.method === 'credito' && (
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Parcelas</span>
                        <select
                          value={p.installments || 1}
                          onChange={e =>
                            updatePayment(p.id, { installments: parseInt(e.target.value, 10) })
                          }
                          className="w-full p-2 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-700 text-xs font-semibold"
                        >
                          <option value="1">1x (Taxa 2.5%)</option>
                          <option value="2">2x (Taxa 4.0%)</option>
                          <option value="3">3x (Taxa 4.0%)</option>
                          <option value="6">6x (Taxa 5.5%)</option>
                          <option value="10">10x (Taxa 7.5%)</option>
                          <option value="12">12x (Taxa 7.5%)</option>
                        </select>
                        <span className="text-[10px] text-neutral-400 mt-1 block">
                          Taxa: {formatBRL(p.feeAmountCents || 0)} • Líquido: {formatBRL(p.netAmountCents || 0)}
                        </span>
                      </div>
                    )}

                    {p.method === 'tradein' && (
                      <div className="sm:col-span-2 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 space-y-2">
                        <p className="text-[11px] font-bold text-black dark:text-white">
                          Aparelho do Cliente entregue como parte do pagamento:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Modelo (ex: iPhone 12 64GB)"
                            value={tradeInModel}
                            onChange={e => setTradeInModel(e.target.value)}
                            className="p-1.5 rounded-lg bg-white dark:bg-black text-xs font-medium"
                          />
                          <input
                            type="number"
                            placeholder="Saúde Bateria %"
                            value={tradeInBattery}
                            onChange={e => setTradeInBattery(parseInt(e.target.value || '0', 10))}
                            className="p-1.5 rounded-lg bg-white dark:bg-black text-xs font-medium"
                          />
                        </div>
                        <p className="text-[10px] text-neutral-500">
                          Este iPhone entrará automaticamente no seu estoque com custo de aquisição igual ao valor do abatimento ({formatBRL(p.amountCents)}).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Validation Balance */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Total a Pagar vs Pago:</span>
              <span
                className={`font-bold font-mono-num ${
                  isFullyPaid ? 'text-black dark:text-white' : 'text-red-500'
                }`}
              >
                {formatBRL(totalPaidCents)} de {formatBRL(finalPriceToPayCents)}{' '}
                {isFullyPaid ? '✓ (Fechado)' : `(Falta: ${formatBRL(finalPriceToPayCents - totalPaidCents)})`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Profit Card & Execution */}
        <div className="lg:col-span-5 space-y-5">
          {/* Price Adjustment */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-black dark:text-white">Preço & Desconto</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Preço Negociado:</span>
                <input
                  type="number"
                  step="50"
                  value={agreedPriceCents / 100}
                  onChange={e => handlePriceChange(Math.round(parseFloat(e.target.value || '0') * 100))}
                  className="w-28 p-1.5 text-right font-mono-num font-bold rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Desconto Concedido:</span>
                <input
                  type="number"
                  step="10"
                  value={discountCents / 100}
                  onChange={e => handleDiscountChange(Math.round(parseFloat(e.target.value || '0') * 100))}
                  className="w-28 p-1.5 text-right font-mono-num font-bold rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs"
                />
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-sm font-bold">
                <span>Valor Final Venda:</span>
                <span className="font-mono-num">{formatBRL(finalPriceToPayCents)}</span>
              </div>
            </div>

            {isBelowFloor && (
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center gap-2 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Preço abaixo do piso configurado ({formatBRL(selectedDevice?.floorPriceCents || 0)}).</span>
              </div>
            )}
          </div>

          {/* Live Profit Real Breakdown (Obsidian Card) */}
          <div className="p-6 rounded-3xl bg-[#0e0e10] text-white border border-neutral-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Lucro Líquido Real (Live)
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-black font-mono-num">
                {marginPct}% margem
              </span>
            </div>

            <div>
              <p className="text-3xl font-black tracking-tight font-mono-num">
                {formatBRL(netProfitCents)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Livre de custos de aquisição, fretes, reparos e taxas de cartão
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Valor Bruto da Venda:</span>
                <span className="font-mono-num text-white">{formatBRL(finalPriceToPayCents)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Taxas Maquininha / Canal:</span>
                <span className="font-mono-num text-neutral-300">-{formatBRL(totalFeesCents)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Custo Total do Aparelho (CT):</span>
                <span className="font-mono-num text-neutral-300">-{formatBRL(deviceCost)}</span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            id="btn-confirm-sale"
            type="button"
            onClick={handleConfirmSale}
            className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Concluir Venda & Gerar Recibo</span>
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
