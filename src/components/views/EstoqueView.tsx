import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, calculateAgingDays, maskIMEI } from '../../lib/luhn';
import { DeviceItem, DeviceStatus } from '../../types';
import {
  Smartphone,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  AlertTriangle,
  Battery,
  ShieldCheck,
  ShoppingBag,
  Wrench,
  ChevronRight,
} from 'lucide-react';

export const EstoqueView: React.FC = () => {
  const { devices, setSelectedDevice, setActiveModal } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [onlyEncalhados, setOnlyEncalhados] = useState(false);

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const q = searchFilter.toLowerCase();
      const matchesSearch =
        d.model.toLowerCase().includes(q) ||
        d.internalCode.toLowerCase().includes(q) ||
        d.imei1.includes(q) ||
        d.color.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'todos' || d.status === statusFilter;

      const aging = calculateAgingDays(d.entryDate, d.soldDate);
      const matchesEncalhado = !onlyEncalhados || (aging >= 30 && d.status !== 'Vendido');

      return matchesSearch && matchesStatus && matchesEncalhado;
    });
  }, [devices, searchFilter, statusFilter, onlyEncalhados]);

  const statusLabels: Record<DeviceStatus, { label: string; className: string }> = {
    EmAvaliacao: { label: 'Em Avaliação', className: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200' },
    EmReparo: { label: 'Em Reparo', className: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200' },
    ProntoParaVenda: { label: 'Pronto p/ Venda', className: 'bg-black text-white dark:bg-white dark:text-black font-semibold' },
    Anunciado: { label: 'Anunciado', className: 'border border-black dark:border-white text-black dark:text-white' },
    Reservado: { label: 'Reservado', className: 'bg-neutral-300 text-black dark:bg-neutral-700 dark:text-white' },
    Vendido: { label: 'Vendido', className: 'bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600 line-through' },
    Entregue: { label: 'Entregue', className: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-500' },
    Baixado: { label: 'Baixado / Perda', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Estoque de iPhones
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {filteredDevices.length} aparelhos encontrados • Monitoramento de custo total e aging
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal('validar_imei')}
            className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121214] text-xs font-semibold text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Consultar IMEI</span>
          </button>

          <button
            onClick={() => setActiveModal('compra')}
            className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Entrada / Compra</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por modelo, IMEI, código interno ou cor..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border-none text-xs font-medium text-black dark:text-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* Aging Toggle Button */}
          <button
            onClick={() => setOnlyEncalhados(prev => !prev)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              onlyEncalhados
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Encalhados (&gt;30 dias)</span>
          </button>

          {/* View Switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm'
                  : 'text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm'
                  : 'text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'ProntoParaVenda', label: 'Prontos para Venda' },
            { id: 'Anunciado', label: 'Anunciados' },
            { id: 'Reservado', label: 'Reservados' },
            { id: 'EmReparo', label: 'Em Reparo' },
            { id: 'EmAvaliacao', label: 'Em Avaliação' },
            { id: 'Vendido', label: 'Vendidos' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === chip.id
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDevices.map(device => {
            const agingDays = calculateAgingDays(device.entryDate, device.soldDate);
            const isEncalhado = agingDays >= 30 && device.status !== 'Vendido';
            const projectedProfit = device.advertisedPriceCents - device.totalCostCents;

            return (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className="group p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:border-black dark:hover:border-white transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Status & Code */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-neutral-400">
                      {device.internalCode}
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                        statusLabels[device.status]?.className || 'bg-neutral-100'
                      }`}
                    >
                      {statusLabels[device.status]?.label || device.status}
                    </span>
                  </div>

                  {/* Device Title */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-black dark:text-white group-hover:underline">
                        {device.model} {device.capacityGb}GB
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {device.color} • Grade {device.condition}
                      </p>
                    </div>

                    {/* Battery Indicator */}
                    <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                      <Battery className="w-3.5 h-3.5" />
                      <span>{device.batteryPct}%</span>
                    </div>
                  </div>

                  {/* IMEI & Aging */}
                  <div className="flex items-center justify-between text-xs text-neutral-400 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 font-mono-num">
                    <span>IMEI: •••• {device.imei1.slice(-4)}</span>
                    <span
                      className={`flex items-center gap-1 font-sans ${
                        isEncalhado ? 'text-amber-600 dark:text-amber-400 font-bold' : ''
                      }`}
                    >
                      {isEncalhado && <AlertTriangle className="w-3 h-3" />}
                      {device.status === 'Vendido' ? 'Vendido' : `${agingDays} dias no estoque`}
                    </span>
                  </div>
                </div>

                {/* Financial Bottom Section */}
                <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Custo Total</p>
                    <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 font-mono-num">
                      {formatBRL(device.totalCostCents)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Preço Anunciado</p>
                    <p className="text-base font-extrabold text-black dark:text-white font-mono-num">
                      {formatBRL(device.advertisedPriceCents)}
                    </p>
                    <p className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
                      Lucro est.: {formatBRL(projectedProfit)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px]">
                <th className="py-3.5 px-4">Código / Aparelho</th>
                <th className="py-3.5 px-4">IMEI</th>
                <th className="py-3.5 px-4">Saúde / Grade</th>
                <th className="py-3.5 px-4">Aging</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Custo Total</th>
                <th className="py-3.5 px-4 text-right">Preço Venda</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredDevices.map(device => {
                const agingDays = calculateAgingDays(device.entryDate, device.soldDate);
                const isEncalhado = agingDays >= 30 && device.status !== 'Vendido';
                return (
                  <tr
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] text-neutral-400 block">
                        {device.internalCode}
                      </span>
                      <span className="font-bold text-black dark:text-white">
                        {device.model} {device.capacityGb}GB
                      </span>
                      <span className="text-neutral-400 block text-[11px]">{device.color}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-neutral-600 dark:text-neutral-300">
                      {maskIMEI(device.imei1)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold">{device.batteryPct}%</span> • Grade {device.condition}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={isEncalhado ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                        {agingDays} dias
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          statusLabels[device.status]?.className || ''
                        }`}
                      >
                        {statusLabels[device.status]?.label || device.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-neutral-500 font-semibold">
                      {formatBRL(device.totalCostCents)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-black dark:text-white">
                      {formatBRL(device.advertisedPriceCents)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedDevice(device);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredDevices.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800">
          <Smartphone className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <p className="text-base font-semibold text-black dark:text-white">Nenhum aparelho encontrado</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Tente mudar os filtros de busca ou cadastre uma nova compra para abastecer o estoque.
          </p>
        </div>
      )}
    </div>
  );
};
