import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../lib/luhn';
import { Wrench, Plus, CheckCircle2, Clock, Smartphone, AlertCircle, X } from 'lucide-react';

export const ReparosView: React.FC = () => {
  const { repairs, devices, createRepairOrder, completeRepairOrder } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || '');
  const [issue, setIssue] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [technicianName, setTechnicianName] = useState('Thiago Assistência Express');
  const [partsCostReais, setPartsCostReais] = useState(120);
  const [laborCostReais, setLaborCostReais] = useState(50);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    if (!issue.trim()) {
      alert('Informe o defeito relatado.');
      return;
    }

    const partsCents = partsCostReais * 100;
    const laborCents = laborCostReais * 100;

    createRepairOrder({
      deviceId: selectedDevice.id,
      deviceModel: `${selectedDevice.model} ${selectedDevice.capacityGb}GB`,
      deviceImei: selectedDevice.imei1,
      issue,
      diagnosis: diagnosis || 'Troca de componente danificado',
      technicianName,
      partsCostCents: partsCents,
      laborCostCents: laborCents,
      totalCostCents: partsCents + laborCents,
      startDate: new Date().toISOString().split('T')[0],
    });

    setIsModalOpen(false);
    setIssue('');
    setDiagnosis('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Ordens de Reparo & Assistência
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Custos de peças e mão de obra somam diretamente ao Custo Total (CT) do iPhone
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Ordem de Reparo</span>
        </button>
      </div>

      {/* Repairs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {repairs.map(rep => {
          const isDone = rep.status === 'Concluida';
          return (
            <div
              key={rep.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-neutral-400 font-semibold">
                    {rep.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isDone
                        ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        : 'bg-black text-white dark:bg-white dark:text-black'
                    }`}
                  >
                    {isDone ? 'Concluída' : 'Em Execução'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-black dark:text-white">
                  {rep.deviceModel}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  <strong>Defeito:</strong> {rep.issue}
                </p>
                {rep.diagnosis && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    <strong>Diagnóstico:</strong> {rep.diagnosis}
                  </p>
                )}

                <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>Técnico: {rep.technicianName}</span>
                  <span>Data: {rep.startDate}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Custo Peças + Mão de Obra
                  </span>
                  <span className="text-base font-extrabold text-black dark:text-white font-mono-num">
                    {formatBRL(rep.totalCostCents)}
                  </span>
                </div>

                {!isDone && (
                  <button
                    onClick={() => completeRepairOrder(rep.id)}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir & Liberar p/ Venda</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Repair Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-lg text-black dark:text-white">Abrir Ordem de Reparo</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                  Selecione o Aparelho
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={e => setSelectedDeviceId(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold"
                >
                  {devices
                    .filter(d => d.status !== 'Vendido')
                    .map(d => (
                      <option key={d.id} value={d.id}>
                        {d.model} {d.capacityGb}GB ({d.internalCode}) — Status atual: {d.status}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                  Defeito / Problema Relatado *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bateria em 79%, tela com listra vertical, microfone baixo..."
                  value={issue}
                  onChange={e => setIssue(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                  Diagnóstico / Solução Prevista
                </label>
                <input
                  type="text"
                  placeholder="Ex: Troca de tela original tirada de desmanche com True Tone"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                  Técnico / Assistência Parceira
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={e => setTechnicianName(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">
                    Custo Peças (R$)
                  </label>
                  <input
                    type="number"
                    value={partsCostReais}
                    onChange={e => setPartsCostReais(parseFloat(e.target.value || '0'))}
                    className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">
                    Mão de Obra (R$)
                  </label>
                  <input
                    type="number"
                    value={laborCostReais}
                    onChange={e => setLaborCostReais(parseFloat(e.target.value || '0'))}
                    className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold"
                >
                  Criar Ordem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
