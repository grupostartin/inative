export type DeviceCondition = 'A+' | 'A' | 'B' | 'C' | 'D';

export type DeviceStatus = 
  | 'EmAvaliacao'
  | 'EmReparo'
  | 'ProntoParaVenda'
  | 'Anunciado'
  | 'Reservado'
  | 'Vendido'
  | 'Entregue'
  | 'Baixado';

export interface DirectCost {
  id: string;
  type: 'aquisicao' | 'frete_compra' | 'pecas' | 'mao_de_obra' | 'acessorios' | 'outros';
  description: string;
  amountCents: number;
  date: string;
}

export interface EvaluationChecklist {
  screenOriginal: boolean;
  touchWorking: boolean;
  trueToneWorking: boolean;
  faceIdWorking: boolean;
  batteryHealth: number; // percentage
  batteryOriginal: boolean;
  camerasWorking: boolean;
  housingCondition: 'Perfeito' | 'MarcasLeves' | 'MarcasVisiveis' | 'Amassado';
  audioMicWorking: boolean;
  wifiBluetoothWorking: boolean;
  chargingPortWorking: boolean;
  buttonsWorking: boolean;
  allTested: boolean;
}

export interface ProvenanceCheck {
  imeiValid: boolean;
  imeiConsultStatus: 'Regular' | 'Restricao' | 'Pendente';
  icloudStatus: 'Desconectado' | 'Bloqueado';
  mdmStatus: 'SemPerfil' | 'Bloqueado';
  carrierStatus: 'Desbloqueado' | 'Operadora';
  supplierDocChecked: boolean;
  checkDate: string;
}

export interface DeviceItem {
  id: string;
  internalCode: string; // e.g. INA-00142
  model: string; // e.g. "iPhone 15 Pro"
  capacityGb: number; // e.g. 128, 256, 512, 1024
  color: string; // e.g. "Titânio Natural"
  imei1: string;
  imei2?: string;
  serial: string;
  condition: DeviceCondition;
  batteryPct: number;
  iosVersion: string;
  accessories: string[];
  status: DeviceStatus;
  location: string; // e.g. "Vitrine Principal", "Gaveta 2", "Com Técnico"
  acquisitionCostCents: number;
  directCosts: DirectCost[];
  totalCostCents: number; // computed
  suggestedPriceCents: number;
  advertisedPriceCents: number;
  floorPriceCents: number;
  entryDate: string; // ISO format
  soldDate?: string;
  supplierId?: string;
  supplierName?: string;
  supplierPhone?: string;
  customerId?: string;
  checklist: EvaluationChecklist;
  provenance: ProvenanceCheck;
  notes?: string;
  photos: string[];
}

export interface PaymentSplit {
  id: string;
  method: 'pix' | 'dinheiro' | 'debito' | 'credito' | 'tradein';
  amountCents: number;
  installments?: number;
  feePct?: number;
  feeAmountCents?: number;
  netAmountCents?: number;
  tradeInDeviceId?: string;
  tradeInModel?: string;
}

export interface SaleRecord {
  id: string;
  saleNumber: string; // e.g. V-00184
  date: string;
  deviceId: string;
  deviceModel: string;
  deviceImei: string;
  deviceCapacity: number;
  customerName: string;
  customerPhone: string;
  customerCpf: string;
  channel: 'WhatsApp' | 'Instagram' | 'OLX' | 'MercadoLivre' | 'Presencial' | 'Indicacao';
  grossPriceCents: number;
  discountCents: number;
  totalPaidCents: number;
  totalFeesCents: number;
  netRevenueCents: number;
  deviceCostSnapshotCents: number;
  netProfitCents: number;
  marginPct: number;
  payments: PaymentSplit[];
  warrantyDays: number;
  warrantyStart: string;
  warrantyEnd: string;
  status: 'Concluida' | 'Cancelada' | 'EmGarantia';
  notes?: string;
}

export interface PurchaseRecord {
  id: string;
  purchaseNumber: string; // e.g. C-00089
  date: string;
  supplierName: string;
  supplierPhone: string;
  supplierCpf: string;
  origin: 'PessoaFisica' | 'Lojista' | 'Atacado' | 'TradeIn';
  items: {
    deviceId: string;
    model: string;
    imei: string;
    amountCents: number;
  }[];
  totalCents: number;
  paymentMethod: string;
  provenanceTermSigned: boolean;
  notes?: string;
}

export interface RepairOrder {
  id: string;
  orderNumber: string; // e.g. OR-0042
  deviceId: string;
  deviceModel: string;
  deviceImei: string;
  issue: string;
  diagnosis: string;
  technicianName: string;
  partsCostCents: number;
  laborCostCents: number;
  totalCostCents: number;
  status: 'Aberta' | 'EmExecucao' | 'AguardandoPeca' | 'Concluida';
  startDate: string;
  completedDate?: string;
}

export interface Contact {
  id: string;
  name: string;
  types: ('cliente' | 'fornecedor' | 'tecnico')[];
  phone: string;
  email?: string;
  cpfCnpj?: string;
  totalTransactionsCount: number;
  totalSpentOrSoldCents: number;
  notes?: string;
  createdAt: string;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'caixa' | 'banco' | 'maquininha';
  balanceCents: number;
}

export interface FinancialTransaction {
  id: string;
  description: string;
  category: string;
  type: 'receita' | 'despesa_direta' | 'despesa_operacional';
  amountCents: number;
  date: string;
  status: 'Realizado' | 'Previsto';
  accountId: string;
  relatedDeviceId?: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  description: string;
  type: 'aging' | 'garantia' | 'financeiro' | 'procedencia';
  severity: 'alta' | 'media' | 'baixa';
  date: string;
  read: boolean;
  actionUrl?: string;
}
