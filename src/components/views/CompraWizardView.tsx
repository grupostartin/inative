import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IPHONE_CATALOG } from '../../data/catalogo';
import {
  formatBRL,
  validateIMEI,
  maskPhone,
  maskCPF,
  maskIMEI,
  calculatePurchaseCeiling,
} from '../../lib/luhn';
import { DeviceCondition } from '../../types';
import {
  PackagePlus,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export const CompraWizardView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { createPurchase, setCurrentView } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Supplier
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierCpf, setSupplierCpf] = useState('');
  const [origin, setOrigin] = useState<'PessoaFisica' | 'Lojista' | 'Atacado' | 'TradeIn'>('PessoaFisica');

  // Step 2: Device Specs & IMEI
  const [selectedCatalogId, setSelectedCatalogId] = useState(IPHONE_CATALOG[3].id); // default iPhone 15 Pro
  const catalogItem = IPHONE_CATALOG.find(c => c.id === selectedCatalogId) || IPHONE_CATALOG[0];

  const [capacityGb, setCapacityGb] = useState<number>(catalogItem.capacities[0] || 128);
  const [color, setColor] = useState<string>(catalogItem.colors[0] || 'Preto');
  const [imeiInput, setImeiInput] = useState('');
  const [batteryPct, setBatteryPct] = useState<number>(92);
  const [condition, setCondition] = useState<DeviceCondition>('A');

  // Sync capacity and color when model changes
  const handleModelChange = (id: string) => {
    setSelectedCatalogId(id);
    const m = IPHONE_CATALOG.find(c => c.id === id);
    if (m) {
      setCapacityGb(m.capacities[0]);
      setColor(m.colors[0]);
    }
  };

  const imeiValidation = validateIMEI(imeiInput);

  // Step 3: Checklist de Avaliação (Anexo A)
  const [screenOriginal, setScreenOriginal] = useState(true);
  const [touchWorking, setTouchWorking] = useState(true);
  const [faceIdWorking, setFaceIdWorking] = useState(true);
  const [camerasWorking, setCamerasWorking] = useState(true);
  const [housingCondition, setHousingCondition] = useState<'Perfeito' | 'MarcasLeves' | 'MarcasVisiveis' | 'Amassado'>('Perfeito');

  // Step 4: Procedência & Segurança
  const [icloudStatus, setIcloudStatus] = useState<'Desconectado' | 'Bloqueado'>('Desconectado');
  const [mdmStatus, setMdmStatus] = useState<'SemPerfil' | 'Bloqueado'>('SemPerfil');
  const [carrierStatus, setCarrierStatus] = useState<'Desbloqueado' | 'Operadora'>('Desbloqueado');
  const [imeiConsultStatus, setImeiConsultStatus] = useState<'Regular' | 'Restricao' | 'Pendente'>('Regular');

  // Step 5: Finance & Teto de Compra
  const [acquisitionCostReais, setAcquisitionCostReais] = useState<number>(3800);
  const [inboundFreightReais, setInboundFreightReais] = useState<number>(35);
  const [paymentMethod, setPaymentMethod] = useState('Pix');

  // Purchase Ceiling Calculator
  const ceiling = calculatePurchaseCeiling({
    expectedSalePriceCents: catalogItem.referenceAveragePriceCents,
    expectedChannelFeePct: 3.0,
    expectedSaleFreightCents: 0,
    targetMarginPct: 0.18, // 18% margem alvo
    estimatedRepairCents: screenOriginal ? 0 : 35000,
    estimatedInboundFreightCents: inboundFreightReais * 100,
    otherDirectCostsCents: 1500, // Película/embalagem
  });

  const acquisitionCostCents = acquisitionCostReais * 100;
  const ceilingDiff = ceiling.maxPurchasePriceCents - acquisitionCostCents;

  // Semáforo:
  // Verde: Preço pago <= Teto de compra
  // Amarelo: Preço pago até 5% acima do teto
  // Vermelho: Preço pago > 5% acima do teto (margem comprometida)
  let trafficLight: 'verde' | 'amarelo' | 'vermelho' = 'verde';
  if (ceilingDiff < -Math.round(ceiling.maxPurchasePriceCents * 0.05)) {
    trafficLight = 'vermelho';
  } else if (ceilingDiff < 0) {
    trafficLight = 'amarelo';
  }

  // Submit purchase
  const handleCompletePurchase = () => {
    if (!supplierName.trim()) {
      alert('Informe o nome do vendedor/fornecedor.');
      setStep(1);
      return;
    }
    if (!imeiValidation.isValid) {
      alert('O IMEI informado não é válido segundo o algoritmo de Luhn.');
      setStep(2);
      return;
    }
    if (icloudStatus === 'Bloqueado') {
      alert('ATENÇÃO: Aparelhos com bloqueio de ativação (iCloud ativo) não podem ser cadastrados!');
      setStep(4);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    createPurchase(
      {
        date: today,
        supplierName,
        supplierPhone,
        supplierCpf,
        origin,
        totalCents: acquisitionCostCents + inboundFreightReais * 100,
        paymentMethod,
        provenanceTermSigned: true,
        notes: `Compra de ${origin}. Bateria ${batteryPct}%, Grade ${condition}.`,
      },
      [
        {
          model: catalogItem.name,
          capacityGb,
          color,
          imei1: imeiInput.replace(/\D/g, ''),
          serial: 'SERIAL-' + Date.now().toString().slice(-6),
          condition,
          batteryPct,
          iosVersion: '18.0',
          accessories: ['Cabo USB-C'],
          status: 'ProntoParaVenda',
          location: 'Vitrine Principal',
          acquisitionCostCents,
          directCosts:
            inboundFreightReais > 0
              ? [
                  {
                    id: `cost-frete-${Date.now()}`,
                    type: 'frete_compra',
                    description: 'Frete de envio',
                    amountCents: inboundFreightReais * 100,
                    date: today,
                  },
                ]
              : [],
          suggestedPriceCents: catalogItem.referenceAveragePriceCents,
          advertisedPriceCents: catalogItem.referenceAveragePriceCents,
          floorPriceCents: Math.round(acquisitionCostCents * 1.15),
          entryDate: today,
          supplierName,
          supplierPhone,
          checklist: {
            screenOriginal,
            touchWorking,
            trueToneWorking: true,
            faceIdWorking,
            batteryHealth: batteryPct,
            batteryOriginal: true,
            camerasWorking,
            housingCondition,
            audioMicWorking: true,
            wifiBluetoothWorking: true,
            chargingPortWorking: true,
            buttonsWorking: true,
            allTested: true,
          },
          provenance: {
            imeiValid: true,
            imeiConsultStatus,
            icloudStatus,
            mdmStatus,
            carrierStatus,
            supplierDocChecked: true,
            checkDate: today,
          },
          photos: [],
        },
      ]
    );

    setCurrentView('estoque');
    if (onClose) onClose();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <PackagePlus className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white">Nova Compra de iPhone</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Etapa {step} de 5 • Cadastro com checklist, checagem de procedência e teto de compra
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

      {/* Step Progress Bar */}
      <div className="grid grid-cols-5 gap-2">
        {['Vendedor', 'Aparelho & IMEI', 'Checklist', 'Procedência', 'Pagamento & Teto'].map(
          (title, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={title} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    isDone || isCurrent
                      ? 'bg-black dark:bg-white'
                      : 'bg-neutral-200 dark:bg-neutral-800'
                  }`}
                />
                <span
                  className={`text-[10px] block truncate font-medium ${
                    isCurrent ? 'text-black dark:text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  {stepNum}. {title}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* STEP 1: Fornecedor / Vendedor */}
      {step === 1 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-black dark:text-white">1. Dados do Vendedor / Fornecedor</h3>
          <p className="text-xs text-neutral-400">
            Identificação obrigatória para mitigar risco de receptação e gerar o termo de procedência.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Origem da Compra</label>
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value as any)}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold"
              >
                <option value="PessoaFisica">Pessoa Física (Cliente Final)</option>
                <option value="Lojista">Lojista Parceiro</option>
                <option value="Atacado">Distribuidor / Atacado</option>
                <option value="TradeIn">Troca (Trade-in)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Nome Completo *</label>
              <input
                type="text"
                placeholder="Ex: Lucas Mendes"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">WhatsApp / Telefone *</label>
              <input
                type="text"
                placeholder="(11) 98888-7777"
                value={supplierPhone}
                onChange={e => setSupplierPhone(maskPhone(e.target.value))}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium font-mono-num"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">CPF / CNPJ</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={supplierCpf}
                onChange={e => setSupplierCpf(maskCPF(e.target.value))}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium font-mono-num"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Aparelho & IMEI */}
      {step === 2 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-black dark:text-white">2. Especificações do iPhone & IMEI</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Modelo do Catálogo</label>
              <select
                value={selectedCatalogId}
                onChange={e => handleModelChange(e.target.value)}
                className="w-full p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold"
              >
                {IPHONE_CATALOG.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.year}) — Preço ref. mercado: {formatBRL(item.referenceAveragePriceCents)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Capacidade</label>
              <div className="flex items-center gap-2">
                {catalogItem.capacities.map(cap => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setCapacityGb(cap)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold ${
                      capacityGb === cap
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {cap} GB
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Cor</label>
              <select
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold"
              >
                {catalogItem.colors.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* IMEI Input with Luhn Verification Live */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-500">IMEI 1 (15 dígitos) *</label>
                <span className="text-[11px] text-neutral-400">Verifique digitando *#06# na tela</span>
              </div>
              <input
                type="text"
                placeholder="Ex: 356938035643809"
                value={imeiInput}
                onChange={e => setImeiInput(maskIMEI(e.target.value))}
                className="w-full p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-mono font-bold tracking-wider"
              />
              {imeiInput.length > 0 && (
                <p
                  className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
                    imeiValidation.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                  }`}
                >
                  {imeiValidation.isValid ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span>{imeiValidation.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Saúde da Bateria (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={batteryPct}
                onChange={e => setBatteryPct(parseInt(e.target.value || '85', 10))}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-bold font-mono-num"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 block mb-1">Condição Estética (Grade)</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as DeviceCondition)}
                className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold"
              >
                <option value="A+">Grade A+ (Como novo, sem marcas)</option>
                <option value="A">Grade A (Excelente, micro-marcas quase imperceptíveis)</option>
                <option value="B">Grade B (Bom, marcas leves normais de uso)</option>
                <option value="C">Grade C (Sinais visíveis de queda ou arranhões)</option>
                <option value="D">Grade D (Danificado / Para desmanche ou peças)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Checklist (Anexo A) */}
      {step === 3 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-black dark:text-white">3. Checklist Técnico de Entrada</h3>
          <p className="text-xs text-neutral-400">
            Validação física obrigatória para certificar autenticidade de peças e funcionamento antes do pagamento.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { label: 'Tela Original Apple', state: screenOriginal, setState: setScreenOriginal },
              { label: 'Touchscreen / Sem fantasmas', state: touchWorking, setState: setTouchWorking },
              { label: 'Face ID / Touch ID operacional', state: faceIdWorking, setState: setFaceIdWorking },
              { label: 'Câmeras Traseiras & Frontal', state: camerasWorking, setState: setCamerasWorking },
            ].map(item => (
              <label
                key={item.label}
                className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 cursor-pointer"
              >
                <span className="text-xs font-semibold text-black dark:text-white">{item.label}</span>
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={e => item.setState(e.target.checked)}
                  className="w-4 h-4 rounded text-black accent-black dark:accent-white"
                />
              </label>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-500 block mb-1">Estado da Carcaça & Vidro Traseiro</label>
            <select
              value={housingCondition}
              onChange={e => setHousingCondition(e.target.value as any)}
              className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold"
            >
              <option value="Perfeito">Perfeito (Sem marcas)</option>
              <option value="MarcasLeves">Marcas Leves de capa</option>
              <option value="MarcasVisiveis">Marcas Visíveis no aro</option>
              <option value="Amassado">Amassado / Trinca no vidro</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 4: Procedência & Segurança */}
      {step === 4 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-black dark:text-white">4. Checagens de Procedência & Bloqueios</h3>
          <p className="text-xs text-neutral-400">
            Regra crítica anti-receptação: Nunca adquira aparelhos com iCloud ativo ou MDM corporativo.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-black dark:text-white">Buscar iPhone (Bloqueio de Ativação)</p>
                <p className="text-[11px] text-neutral-400">A conta Apple ID do vendedor deve estar desconectada</p>
              </div>
              <select
                value={icloudStatus}
                onChange={e => setIcloudStatus(e.target.value as any)}
                className="p-1.5 rounded-xl bg-white dark:bg-black text-xs font-bold"
              >
                <option value="Desconectado">Desconectado (Aprovado)</option>
                <option value="Bloqueado">Bloqueado (REPROVADO)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-black dark:text-white">Gerenciamento Remoto (MDM)</p>
                <p className="text-[11px] text-neutral-400">Sem perfil corporativo ou educacional instalado</p>
              </div>
              <select
                value={mdmStatus}
                onChange={e => setMdmStatus(e.target.value as any)}
                className="p-1.5 rounded-xl bg-white dark:bg-black text-xs font-bold"
              >
                <option value="SemPerfil">Sem Perfil (Aprovado)</option>
                <option value="Bloqueado">Bloqueado por Empresa</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-black dark:text-white">Bloqueio de Operadora</p>
                <p className="text-[11px] text-neutral-400">Aceita qualquer chip / eSIM brasileiro</p>
              </div>
              <select
                value={carrierStatus}
                onChange={e => setCarrierStatus(e.target.value as any)}
                className="p-1.5 rounded-xl bg-white dark:bg-black text-xs font-bold"
              >
                <option value="Desbloqueado">Desbloqueado Nacional</option>
                <option value="Operadora">Bloqueado em Operadora</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Pagamento & Teto de Compra Embutido */}
      {step === 5 && (
        <div className="space-y-5">
          {/* Semáforo do Teto de Compra */}
          <div
            className={`p-6 rounded-3xl border shadow-sm ${
              trafficLight === 'verde'
                ? 'bg-white dark:bg-[#121214] border-neutral-200 dark:border-neutral-800'
                : trafficLight === 'amarelo'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black dark:text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                  Calculadora de Teto de Compra (Fórmula Oficial)
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  trafficLight === 'verde'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : trafficLight === 'amarelo'
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {trafficLight === 'verde' && 'Dentro do Teto (Excelente)'}
                {trafficLight === 'amarelo' && 'Atenção: Próximo ao Limite'}
                {trafficLight === 'vermelho' && 'Acima do Teto Recomendado'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div>
                <span className="text-neutral-400 block">Preço Venda Esperado:</span>
                <span className="font-bold text-black dark:text-white text-sm font-mono-num">
                  {formatBRL(catalogItem.referenceAveragePriceCents)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Teto Máximo a Pagar:</span>
                <span className="font-extrabold text-black dark:text-white text-sm font-mono-num">
                  {formatBRL(ceiling.maxPurchasePriceCents)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Lucro Esperado:</span>
                <span className="font-bold text-black dark:text-white text-sm font-mono-num">
                  {formatBRL(ceiling.projectedProfitCents)}
                </span>
              </div>
            </div>
          </div>

          {/* Negotiated Price Inputs */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-black dark:text-white">Valores Finais da Compra</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                  Valor Pago ao Vendedor (R$) *
                </label>
                <input
                  type="number"
                  step="50"
                  value={acquisitionCostReais}
                  onChange={e => setAcquisitionCostReais(parseFloat(e.target.value || '0'))}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-sm font-bold font-mono-num"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                  Frete / Deslocamento de Busca (R$)
                </label>
                <input
                  type="number"
                  step="5"
                  value={inboundFreightReais}
                  onChange={e => setInboundFreightReais(parseFloat(e.target.value || '0'))}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-sm font-bold font-mono-num"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                  Forma de Pagamento ao Vendedor
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold"
                >
                  <option value="Pix">Pix (Transferência Imediata)</option>
                  <option value="Dinheiro">Dinheiro Físico (Caixa)</option>
                  <option value="Transferência Bancária">Transferência TED</option>
                  <option value="Sinal + Saldo">Sinal + Saldo na Retirada</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Custo Total de Entrada inicial:</span>
              <span className="font-extrabold text-black dark:text-white font-mono-num text-sm">
                {formatBRL(acquisitionCostCents + inboundFreightReais * 100)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((step - 1) as any)}
            className="px-5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((step + 1) as any)}
            className="px-6 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5"
          >
            <span>Próxima Etapa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCompletePurchase}
            className="px-7 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-md hover:opacity-90 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Cadastrar iPhone & Concluir Compra</span>
          </button>
        )}
      </div>
    </div>
  );
};
