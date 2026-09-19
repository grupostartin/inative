import React, { useState } from 'react';
import { formatBRL, calculatePurchaseCeiling } from '../../lib/luhn';
import { Calculator, Sparkles, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';

export const CalculadorasView: React.FC = () => {
  // Calculator 1: Teto de Compra
  const [pvEsperado, setPvEsperado] = useState(4800);
  const [taxaCanalPct, setTaxaCanalPct] = useState(3.0);
  const [margemAlvoPct, setMargemAlvoPct] = useState(18.0);
  const [reparoEstimado, setReparoEstimado] = useState(150);
  const [freteCompra, setFreteCompra] = useState(40);

  const tetoResult = calculatePurchaseCeiling({
    expectedSalePriceCents: pvEsperado * 100,
    expectedChannelFeePct: taxaCanalPct,
    expectedSaleFreightCents: 0,
    targetMarginPct: margemAlvoPct / 100,
    estimatedRepairCents: reparoEstimado * 100,
    estimatedInboundFreightCents: freteCompra * 100,
    otherDirectCostsCents: 1500, // Película/embalagem R$ 15,00
  });

  // Calculator 2: Simulador de Venda & Taxas de Cartão
  const [precoSimulado, setPrecoSimulado] = useState(4500);
  const [custoAparelhoSimulado, setCustoAparelhoSimulado] = useState(3400);

  const simOptions = [
    { label: 'Pix / Dinheiro', installments: 1, feePct: 0.0, days: 'Na hora' },
    { label: 'Débito', installments: 1, feePct: 1.4, days: 'D+1' },
    { label: 'Crédito à Vista (1x)', installments: 1, feePct: 2.5, days: 'D+30' },
    { label: 'Crédito 2x', installments: 2, feePct: 3.8, days: 'Parcelado' },
    { label: 'Crédito 3x', installments: 3, feePct: 4.2, days: 'Parcelado' },
    { label: 'Crédito 6x', installments: 6, feePct: 5.5, days: 'Parcelado' },
    { label: 'Crédito 10x', installments: 10, feePct: 7.2, days: 'Parcelado' },
    { label: 'Crédito 12x', installments: 12, feePct: 7.8, days: 'Parcelado' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Calculadoras de Margem & Precificação
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Fórmulas oficiais do PRD iNative para compras seguras e simulação de taxas de cartão
        </p>
      </div>

      {/* Grid: 2 Main Calculators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator 1: Teto de Compra */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-black dark:text-white">Teto de Compra</h3>
                <p className="text-xs text-neutral-400">Quanto você pode pagar no máximo</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                  Preço Esperado de Venda (R$)
                </label>
                <input
                  type="number"
                  step="50"
                  value={pvEsperado}
                  onChange={e => setPvEsperado(parseFloat(e.target.value || '0'))}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">
                    Taxa do Canal / Cartão (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={taxaCanalPct}
                    onChange={e => setTaxaCanalPct(parseFloat(e.target.value || '0'))}
                    className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">
                    Margem-Alvo Desejada (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={margemAlvoPct}
                    onChange={e => setMargemAlvoPct(parseFloat(e.target.value || '0'))}
                    className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">
                    Reparo Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={reparoEstimado}
                    onChange={e => setReparoEstimado(parseFloat(e.target.value || '0'))}
                    className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 block mb-1">
                    Frete / Busca (R$)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={freteCompra}
                    onChange={e => setFreteCompra(parseFloat(e.target.value || '0'))}
                    className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div className="p-5 rounded-2xl bg-[#0e0e10] text-white border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                Teto Máximo Recomendado
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-black">
                {margemAlvoPct}% ROI
              </span>
            </div>

            <p className="text-3xl font-black font-mono-num">
              {formatBRL(tetoResult.maxPurchasePriceCents)}
            </p>

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span>Lucro Líquido Projetado:</span>
              <span className="font-bold text-white font-mono-num">
                {formatBRL(tetoResult.projectedProfitCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Calculator 2: Simulador de Venda & Parcelamento */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-black dark:text-white">Simulador de Taxas & Lucro</h3>
              <p className="text-xs text-neutral-400">Comparativo de recebimento no Pix vs Cartão 1x a 12x</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="50"
                value={precoSimulado}
                onChange={e => setPrecoSimulado(parseFloat(e.target.value || '0'))}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">
                Custo Total (CT) (R$)
              </label>
              <input
                type="number"
                step="50"
                value={custoAparelhoSimulado}
                onChange={e => setCustoAparelhoSimulado(parseFloat(e.target.value || '0'))}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
              />
            </div>
          </div>

          {/* Simulation Table */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-400 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="p-2.5">Meio / Parcelas</th>
                  <th className="p-2.5">Taxa</th>
                  <th className="p-2.5 text-right">Líquido</th>
                  <th className="p-2.5 text-right">Lucro Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {simOptions.map(opt => {
                  const grossCents = precoSimulado * 100;
                  const feeCents = Math.round(grossCents * (opt.feePct / 100));
                  const netCents = grossCents - feeCents;
                  const profitCents = netCents - custoAparelhoSimulado * 100;

                  return (
                    <tr key={opt.label} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                      <td className="p-2.5 font-medium text-black dark:text-white">
                        {opt.label}
                        <span className="block text-[10px] text-neutral-400">{opt.days}</span>
                      </td>
                      <td className="p-2.5 font-mono-num text-neutral-500">
                        {opt.feePct.toFixed(1)}% (-{formatBRL(feeCents)})
                      </td>
                      <td className="p-2.5 text-right font-mono-num font-semibold">
                        {formatBRL(netCents)}
                      </td>
                      <td className="p-2.5 text-right font-mono-num font-bold text-black dark:text-white">
                        {formatBRL(profitCents)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
