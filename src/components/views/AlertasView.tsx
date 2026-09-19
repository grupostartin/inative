import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateAgingDays, formatBRL } from '../../lib/luhn';
import { Bell, AlertTriangle, ShieldCheck, Check, Smartphone, ArrowRight } from 'lucide-react';

export const AlertasView: React.FC = () => {
  const { alerts, markAlertRead, devices, setSelectedDevice, setCurrentView } = useApp();

  const activeDevices = devices.filter(d => d.status !== 'Vendido' && d.status !== 'Baixado');
  const encalhados = activeDevices.filter(d => calculateAgingDays(d.entryDate) >= 30);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Central de Alertas & Notificações
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Monitoramento preventivo de aging de estoque, garantias e rotinas de segurança
        </p>
      </div>

      {/* Encalhados Section */}
      {encalhados.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-black dark:text-white">
                Aparelhos com Aging Crítico (&gt; 30 dias parados)
              </h3>
              <p className="text-xs text-neutral-400">
                Cada dia parado deprecia o aparelho. Recomendamos aplicar desconto ou anunciar em novos canais.
              </p>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {encalhados.map(device => {
              const aging = calculateAgingDays(device.entryDate);
              return (
                <div
                  key={device.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono text-[11px] text-neutral-400 block">
                      {device.internalCode} • IMEI •••• {device.imei1.slice(-4)}
                    </span>
                    <span className="font-bold text-black dark:text-white text-sm">
                      {device.model} {device.capacityGb}GB ({device.color})
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400 block mt-0.5">
                      Custo Total: {formatBRL(device.totalCostCents)} • Anunciado por:{' '}
                      {formatBRL(device.advertisedPriceCents)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold font-mono-num text-xs">
                      {aging} dias em estoque
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDevice(device);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1"
                    >
                      <span>Gerenciar Preço</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* General Notifications Feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-black dark:text-white">
          Histórico de Notificações do Sistema
        </h3>

        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-colors flex items-start justify-between gap-3 ${
                alert.read
                  ? 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60 opacity-70'
                  : 'bg-white dark:bg-[#121214] border-neutral-300 dark:border-neutral-700 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.severity === 'alta'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : alert.severity === 'media'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black dark:text-white">{alert.title}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    {alert.description}
                  </p>
                  <span className="text-[10px] text-neutral-400 mt-2 block">{alert.date}</span>
                </div>
              </div>

              {!alert.read && (
                <button
                  onClick={() => markAlertRead(alert.id)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span>Marcar lido</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
