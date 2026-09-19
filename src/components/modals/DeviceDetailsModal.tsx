import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, calculateAgingDays, maskIMEI } from '../../lib/luhn';
import { DeviceItem, DeviceStatus, DirectCost } from '../../types';
import {
  X,
  Battery,
  ShieldCheck,
  Wrench,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Plus,
  Trash2,
} from 'lucide-react';

export const DeviceDetailsModal: React.FC = () => {
  const {
    selectedDevice,
    setSelectedDevice,
    updateDevice,
    addDirectCostToDevice,
    setActiveModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'resumo' | 'custos' | 'checklist' | 'procedencia'>('resumo');

  // New direct cost form
  const [newCostType, setNewCostType] = useState<DirectCost['type']>('pecas');
  const [newCostDesc, setNewCostDesc] = useState('');
  const [newCostReais, setNewCostReais] = useState<number>(50);
  const [advertisedPriceReais, setAdvertisedPriceReais] = useState(0);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    if (selectedDevice) {
      setAdvertisedPriceReais(selectedDevice.advertisedPriceCents / 100);
      setIsEditingPrice(false);
      setPriceError('');
    }
  }, [selectedDevice?.id]);

  if (!selectedDevice) return null;

  const agingDays = calculateAgingDays(selectedDevice.entryDate, selectedDevice.soldDate);
  const isEncalhado = agingDays >= 30 && selectedDevice.status !== 'Vendido';
  const projectedProfit = selectedDevice.advertisedPriceCents - selectedDevice.totalCostCents;
  const projectedMargin =
    selectedDevice.advertisedPriceCents > 0
      ? ((projectedProfit / selectedDevice.advertisedPriceCents) * 100).toFixed(1)
      : '0';

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCostDesc.trim() || newCostReais <= 0) return;

    addDirectCostToDevice(selectedDevice.id, {
      type: newCostType,
      description: newCostDesc,
      amountCents: Math.round(newCostReais * 100),
      date: new Date().toISOString().split('T')[0],
    });

    setNewCostDesc('');
    setNewCostReais(50);
  };

  const handleStatusChange = (newStatus: DeviceStatus) => {
    updateDevice(selectedDevice.id, { status: newStatus });
  };

  const handleSaveAdvertisedPrice = () => {
    const priceCents = Math.round(advertisedPriceReais * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      setPriceError('Informe um preço maior que zero.');
      return;
    }
    updateDevice(selectedDevice.id, { advertisedPriceCents: priceCents });
    setPriceError('');
    setIsEditingPrice(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-400 font-semibold">
                {selectedDevice.internalCode}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
                {selectedDevice.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mt-1">
              {selectedDevice.model} {selectedDevice.capacityGb}GB
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {selectedDevice.color} • Grade {selectedDevice.condition} • IMEI: {maskIMEI(selectedDevice.imei1)}
            </p>
          </div>

          <button
            onClick={() => setSelectedDevice(null)}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl shrink-0">
          {[
            { id: 'resumo', label: 'Resumo' },
            { id: 'custos', label: `Custos (${selectedDevice.directCosts.length + 1})` },
            { id: 'checklist', label: 'Checklist Técnico' },
            { id: 'procedencia', label: 'Procedência' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm'
                  : 'text-neutral-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* TAB 1: Resumo */}
          {activeTab === 'resumo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold block">Bateria</span>
                  <span className="text-base font-bold text-black dark:text-white font-mono-num flex items-center gap-1 mt-0.5">
                    <Battery className="w-4 h-4" />
                    {selectedDevice.batteryPct}%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold block">Aging</span>
                  <span
                    className={`text-base font-bold font-mono-num mt-0.5 block ${
                      isEncalhado ? 'text-amber-600 dark:text-amber-400' : 'text-black dark:text-white'
                    }`}
                  >
                    {agingDays} dias
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold block">Custo Total</span>
                  <span className="text-base font-bold text-black dark:text-white font-mono-num mt-0.5 block">
                    {formatBRL(selectedDevice.totalCostCents)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between gap-1"><span className="text-[10px] uppercase text-neutral-400 font-bold block">Preço Anunciado</span><button onClick={() => { setAdvertisedPriceReais(selectedDevice.advertisedPriceCents / 100); setPriceError(''); setIsEditingPrice(value => !value); }} className="text-[10px] font-bold underline text-black dark:text-white">{isEditingPrice ? 'Cancelar' : 'Editar'}</button></div>
                  {isEditingPrice ? (
                    <div className="mt-1.5 space-y-1"><input aria-label="Preço anunciado em reais" type="number" min="0.01" step="0.01" value={advertisedPriceReais} onChange={event => setAdvertisedPriceReais(Number(event.target.value))} className="w-full p-1.5 rounded-lg bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-xs font-bold font-mono-num text-black dark:text-white" /><button onClick={handleSaveAdvertisedPrice} className="w-full p-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">Salvar</button>{priceError && <p className="text-[10px] text-red-600">{priceError}</p>}</div>
                  ) : <span className="text-base font-extrabold text-black dark:text-white font-mono-num mt-0.5 block">{formatBRL(selectedDevice.advertisedPriceCents)}</span>}
                </div>
              </div>

              {/* Status Manager */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-black dark:text-white block">
                  Alterar Status do Aparelho:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['ProntoParaVenda', 'Anunciado', 'Reservado', 'EmReparo', 'EmAvaliacao'] as DeviceStatus[]).map(
                    st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          selectedDevice.status === st
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Additional specs */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Localização física:</span>
                  <span className="font-semibold text-black dark:text-white">{selectedDevice.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Data de Entrada:</span>
                  <span className="font-semibold text-black dark:text-white">{selectedDevice.entryDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Preço Piso (mínimo aceitável):</span>
                  <span className="font-bold text-black dark:text-white font-mono-num">
                    {formatBRL(selectedDevice.floorPriceCents)}
                  </span>
                </div>
                {selectedDevice.notes && (
                  <div className="pt-2">
                    <span className="text-neutral-400 block mb-0.5">Observações:</span>
                    <p className="text-neutral-600 dark:text-neutral-300 italic">{selectedDevice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Composição de Custo Total */}
          {activeTab === 'custos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0e0e10] text-white border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 font-bold block">
                    Custo Total (CT) Acumulado
                  </span>
                  <p className="text-2xl font-black font-mono-num mt-1">
                    {formatBRL(selectedDevice.totalCostCents)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold block">
                    Lucro Projetado ({projectedMargin}%)
                  </span>
                  <p className="text-lg font-extrabold text-neutral-200 font-mono-num mt-1">
                    {formatBRL(projectedProfit)}
                  </p>
                </div>
              </div>

              {/* Cost Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-black dark:text-white block">
                  Itens de Custo Vinculados:
                </span>
                {/* Base Acquisition Cost */}
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-black dark:text-white">Custo de Aquisição (CA)</span>
                    <span className="text-neutral-400 block text-[11px]">Compra inicial do fornecedor</span>
                  </div>
                  <span className="font-bold font-mono-num text-black dark:text-white">
                    {formatBRL(selectedDevice.acquisitionCostCents)}
                  </span>
                </div>

                {/* Additional Direct Costs */}
                {selectedDevice.directCosts.map(cost => (
                  <div
                    key={cost.id}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-black dark:text-white">{cost.description}</span>
                      <span className="text-neutral-400 block text-[11px] capitalize">
                        {cost.type.replace('_', ' ')} • {cost.date}
                      </span>
                    </div>
                    <span className="font-bold font-mono-num text-black dark:text-white">
                      +{formatBRL(cost.amountCents)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Form to add new cost directly */}
              <form
                onSubmit={handleAddCost}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
              >
                <span className="text-xs font-bold text-black dark:text-white block">
                  ＋ Adicionar Custo Direto (Peça, Mão de Obra, Frete)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newCostType}
                    onChange={e => setNewCostType(e.target.value as any)}
                    className="p-2 rounded-xl bg-white dark:bg-black text-xs font-medium"
                  >
                    <option value="pecas">Peças</option>
                    <option value="mao_de_obra">Mão de Obra</option>
                    <option value="frete_compra">Frete</option>
                    <option value="acessorios">Acessório</option>
                    <option value="outros">Outros</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Descrição do custo..."
                    value={newCostDesc}
                    onChange={e => setNewCostDesc(e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-black text-xs font-medium sm:col-span-1"
                  />

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="5"
                      placeholder="R$"
                      value={newCostReais}
                      onChange={e => setNewCostReais(parseFloat(e.target.value || '0'))}
                      className="w-20 p-2 rounded-xl bg-white dark:bg-black text-xs font-bold font-mono-num"
                    />
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold"
                    >
                      Lançar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Tela Original', ok: selectedDevice.checklist.screenOriginal },
                  { label: 'Touchscreen', ok: selectedDevice.checklist.touchWorking },
                  { label: 'Face ID / Touch ID', ok: selectedDevice.checklist.faceIdWorking },
                  { label: 'True Tone', ok: selectedDevice.checklist.trueToneWorking },
                  { label: 'Câmeras Traseira/Frontal', ok: selectedDevice.checklist.camerasWorking },
                  { label: 'Áudio & Microfones', ok: selectedDevice.checklist.audioMicWorking },
                  { label: 'Wi-Fi & Bluetooth', ok: selectedDevice.checklist.wifiBluetoothWorking },
                  { label: 'Conector de Carga', ok: selectedDevice.checklist.chargingPortWorking },
                ].map(item => (
                  <div
                    key={item.label}
                    className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between"
                  >
                    <span className="font-medium text-black dark:text-white">{item.label}</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        item.ok ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                      }`}
                    >
                      {item.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {item.ok ? 'Aprovado' : 'Defeito'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Procedência */}
          {activeTab === 'procedencia' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                    Bloqueio de Ativação (iCloud)
                  </span>
                  <span className="font-bold text-black dark:text-white">
                    {selectedDevice.provenance.icloudStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                    Gerenciamento MDM
                  </span>
                  <span className="font-bold text-black dark:text-white">
                    {selectedDevice.provenance.mdmStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                    Consulta de Bloqueio IMEI
                  </span>
                  <span className="font-bold text-black dark:text-white">
                    {selectedDevice.provenance.imeiConsultStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                    Documento do Vendedor Concluído
                  </span>
                  <span className="font-bold text-black dark:text-white">
                    {selectedDevice.provenance.supplierDocChecked ? 'Sim (Arquivado)' : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
          <button
            onClick={() => setSelectedDevice(null)}
            className="px-5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold"
          >
            Fechar
          </button>

          {selectedDevice.status !== 'Vendido' && (
            <button
              onClick={() => {
                setSelectedDevice(null);
                setActiveModal('pdv');
              }}
              className="px-6 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Vender Este Aparelho Agora</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
