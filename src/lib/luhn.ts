/**
 * Algoritmo oficial de Luhn para validação de IMEI (15 dígitos).
 * Requisito BR-01 do PRD iNative.
 */
export function validateIMEI(imei: string): {
  isValid: boolean;
  message: string;
  tac?: string;
  checkDigit?: string;
} {
  const cleanImei = imei.replace(/\D/g, '');

  if (cleanImei.length !== 15) {
    return {
      isValid: false,
      message: `IMEI deve conter exatamente 15 dígitos (digitados: ${cleanImei.length})`,
    };
  }

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(cleanImei.charAt(i), 10);
    // Dobra os dígitos em posições ímpares (índices 1, 3, 5, 7, 9, 11, 13)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  const isValid = sum % 10 === 0;
  return {
    isValid,
    message: isValid
      ? 'IMEI válido (Luhn aprovado)'
      : 'IMEI inválido (dígito verificador incorreto segundo algoritmo de Luhn)',
    tac: cleanImei.slice(0, 8),
    checkDigit: cleanImei.charAt(14),
  };
}

/**
 * Formata centavos em Real Brasileiro (R$ 1.250,00)
 */
export function formatBRL(cents: number): string {
  const value = (cents || 0) / 100;
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

/**
 * Formata data ISO para pt-BR (dd/mm/aaaa)
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return isoDate;
  }
}

/**
 * Calcula os dias em estoque (Aging)
 */
export function calculateAgingDays(entryDate: string, soldDate?: string): number {
  if (!entryDate) return 0;
  const start = new Date(entryDate).getTime();
  const end = soldDate ? new Date(soldDate).getTime() : new Date().getTime();
  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Máscara para IMEI: 12 345678 901234 5
 */
export function maskIMEI(raw: string): string {
  const clean = raw.replace(/\D/g, '').slice(0, 15);
  if (clean.length <= 2) return clean;
  if (clean.length <= 8) return `${clean.slice(0, 2)} ${clean.slice(2)}`;
  if (clean.length <= 14) return `${clean.slice(0, 2)} ${clean.slice(2, 8)} ${clean.slice(8)}`;
  return `${clean.slice(0, 2)} ${clean.slice(2, 8)} ${clean.slice(8, 14)} ${clean.slice(14)}`;
}

/**
 * Máscara para CPF: 000.000.000-00
 */
export function maskCPF(raw: string): string {
  const clean = raw.replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Máscara para Telefone: (00) 00000-0000
 */
export function maskPhone(raw: string): string {
  const clean = raw.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return clean.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

/**
 * Fórmula oficial de Teto de Compra do PRD (Seção 6.2):
 * Teto = RL_esperada ÷ (1 + margem_alvo) - frete_compra - reparo_estimado - outros
 * Onde RL_esperada = PV_esperado * (1 - taxa%) - frete_venda
 */
export function calculatePurchaseCeiling(params: {
  expectedSalePriceCents: number;
  expectedChannelFeePct: number;
  expectedSaleFreightCents: number;
  targetMarginPct: number; // e.g. 0.15 para 15%
  estimatedRepairCents: number;
  estimatedInboundFreightCents: number;
  otherDirectCostsCents: number;
}): {
  maxPurchasePriceCents: number;
  netRevenueExpectedCents: number;
  projectedProfitCents: number;
} {
  const channelFeeAmount = Math.round(params.expectedSalePriceCents * (params.expectedChannelFeePct / 100));
  const netRevenueExpected = params.expectedSalePriceCents - channelFeeAmount - params.expectedSaleFreightCents;

  const targetDivisor = 1 + params.targetMarginPct;
  const maxAllowableTotalCost = Math.round(netRevenueExpected / targetDivisor);

  const directCostsToDeduct =
    params.estimatedRepairCents +
    params.estimatedInboundFreightCents +
    params.otherDirectCostsCents;

  const maxPurchasePriceCents = Math.max(0, maxAllowableTotalCost - directCostsToDeduct);
  const projectedProfitCents = Math.round(netRevenueExpected - maxAllowableTotalCost);

  return {
    maxPurchasePriceCents,
    netRevenueExpectedCents: netRevenueExpected,
    projectedProfitCents,
  };
}
