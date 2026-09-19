import { supabase } from './supabase';
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

// Device Mappers
export function mapDeviceFromRow(row: any): DeviceItem {
  return {
    id: row.id,
    internalCode: row.internal_code,
    model: row.model,
    capacityGb: row.capacity_gb,
    color: row.color,
    imei1: row.imei1,
    imei2: row.imei2 || undefined,
    serial: row.serial,
    condition: row.condition,
    batteryPct: row.battery_pct,
    iosVersion: row.ios_version,
    accessories: row.accessories || [],
    status: row.status,
    location: row.location,
    acquisitionCostCents: Number(row.acquisition_cost_cents),
    directCosts: row.direct_costs || [],
    totalCostCents: Number(row.total_cost_cents),
    suggestedPriceCents: Number(row.suggested_price_cents),
    advertisedPriceCents: Number(row.advertised_price_cents),
    floorPriceCents: Number(row.floor_price_cents),
    entryDate: row.entry_date,
    soldDate: row.sold_date || undefined,
    supplierId: row.supplier_id || undefined,
    supplierName: row.supplier_name || undefined,
    supplierPhone: row.supplier_phone || undefined,
    customerId: row.customer_id || undefined,
    checklist: row.checklist || {},
    provenance: row.provenance || {},
    notes: row.notes || undefined,
    photos: row.photos || [],
  };
}

export function mapDeviceToRow(device: DeviceItem): any {
  return {
    id: device.id,
    internal_code: device.internalCode,
    model: device.model,
    capacity_gb: device.capacityGb,
    color: device.color,
    imei1: device.imei1,
    imei2: device.imei2 || null,
    serial: device.serial,
    condition: device.condition,
    battery_pct: device.batteryPct,
    ios_version: device.iosVersion,
    accessories: device.accessories,
    status: device.status,
    location: device.location,
    acquisition_cost_cents: device.acquisitionCostCents,
    direct_costs: device.directCosts,
    total_cost_cents: device.totalCostCents,
    suggested_price_cents: device.suggestedPriceCents,
    advertised_price_cents: device.advertisedPriceCents,
    floor_price_cents: device.floorPriceCents,
    entry_date: device.entryDate,
    sold_date: device.soldDate || null,
    supplier_id: device.supplierId || null,
    supplier_name: device.supplierName || null,
    supplier_phone: device.supplierPhone || null,
    customer_id: device.customerId || null,
    checklist: device.checklist,
    provenance: device.provenance,
    notes: device.notes || null,
    photos: device.photos,
  };
}

// Sale Mappers
export function mapSaleFromRow(row: any): SaleRecord {
  return {
    id: row.id,
    saleNumber: row.sale_number,
    date: row.date,
    deviceId: row.device_id,
    deviceModel: row.device_model,
    deviceImei: row.device_imei,
    deviceCapacity: row.device_capacity,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerCpf: row.customer_cpf,
    channel: row.channel,
    grossPriceCents: Number(row.gross_price_cents),
    discountCents: Number(row.discount_cents),
    totalPaidCents: Number(row.total_paid_cents),
    totalFeesCents: Number(row.total_fees_cents),
    netRevenueCents: Number(row.net_revenue_cents),
    deviceCostSnapshotCents: Number(row.device_cost_snapshot_cents),
    netProfitCents: Number(row.net_profit_cents),
    marginPct: Number(row.margin_pct),
    payments: row.payments || [],
    warrantyDays: row.warranty_days,
    warrantyStart: row.warranty_start,
    warrantyEnd: row.warranty_end,
    status: row.status,
    notes: row.notes || undefined,
  };
}

export function mapSaleToRow(sale: SaleRecord): any {
  return {
    id: sale.id,
    sale_number: sale.saleNumber,
    date: sale.date,
    device_id: sale.deviceId,
    device_model: sale.deviceModel,
    device_imei: sale.deviceImei,
    device_capacity: sale.deviceCapacity,
    customer_name: sale.customerName,
    customer_phone: sale.customerPhone,
    customer_cpf: sale.customerCpf,
    channel: sale.channel,
    gross_price_cents: sale.grossPriceCents,
    discount_cents: sale.discountCents,
    total_paid_cents: sale.totalPaidCents,
    total_fees_cents: sale.totalFeesCents,
    net_revenue_cents: sale.netRevenueCents,
    device_cost_snapshot_cents: sale.deviceCostSnapshotCents,
    net_profit_cents: sale.netProfitCents,
    margin_pct: sale.marginPct,
    payments: sale.payments,
    warranty_days: sale.warrantyDays,
    warranty_start: sale.warrantyStart,
    warranty_end: sale.warrantyEnd,
    status: sale.status,
    notes: sale.notes || null,
  };
}

// Purchase Mappers
export function mapPurchaseFromRow(row: any): PurchaseRecord {
  return {
    id: row.id,
    purchaseNumber: row.purchase_number,
    date: row.date,
    supplierName: row.supplier_name,
    supplierPhone: row.supplier_phone,
    supplierCpf: row.supplier_cpf,
    origin: row.origin,
    items: row.items || [],
    totalCents: Number(row.total_cents),
    paymentMethod: row.payment_method,
    provenanceTermSigned: row.provenance_term_signed,
    notes: row.notes || undefined,
  };
}

export function mapPurchaseToRow(purchase: PurchaseRecord): any {
  return {
    id: purchase.id,
    purchase_number: purchase.purchaseNumber,
    date: purchase.date,
    supplier_name: purchase.supplierName,
    supplier_phone: purchase.supplierPhone,
    supplier_cpf: purchase.supplierCpf,
    origin: purchase.origin,
    items: purchase.items,
    total_cents: purchase.totalCents,
    payment_method: purchase.paymentMethod,
    provenance_term_signed: purchase.provenanceTermSigned,
    notes: purchase.notes || null,
  };
}

// Repair Mappers
export function mapRepairFromRow(row: any): RepairOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    deviceId: row.device_id,
    deviceModel: row.device_model,
    deviceImei: row.device_imei,
    issue: row.issue,
    diagnosis: row.diagnosis,
    technicianName: row.technician_name,
    partsCostCents: Number(row.parts_cost_cents),
    laborCostCents: Number(row.labor_cost_cents),
    totalCostCents: Number(row.total_cost_cents),
    status: row.status,
    startDate: row.start_date,
    completedDate: row.completed_date || undefined,
  };
}

export function mapRepairToRow(repair: RepairOrder): any {
  return {
    id: repair.id,
    order_number: repair.orderNumber,
    device_id: repair.deviceId,
    device_model: repair.deviceModel,
    device_imei: repair.deviceImei,
    issue: repair.issue,
    diagnosis: repair.diagnosis,
    technician_name: repair.technicianName,
    parts_cost_cents: repair.partsCostCents,
    labor_cost_cents: repair.laborCostCents,
    total_cost_cents: repair.totalCostCents,
    status: repair.status,
    start_date: repair.startDate,
    completed_date: repair.completedDate || null,
  };
}

// Contact Mappers
export function mapContactFromRow(row: any): Contact {
  return {
    id: row.id,
    name: row.name,
    types: row.types || [],
    phone: row.phone,
    email: row.email || undefined,
    cpfCnpj: row.cpf_cnpj || undefined,
    totalTransactionsCount: row.total_transactions_count || 0,
    totalSpentOrSoldCents: Number(row.total_spent_or_sold_cents || 0),
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

export function mapContactToRow(contact: Contact): any {
  return {
    id: contact.id,
    name: contact.name,
    types: contact.types,
    phone: contact.phone,
    email: contact.email || null,
    cpf_cnpj: contact.cpfCnpj || null,
    total_transactions_count: contact.totalTransactionsCount,
    total_spent_or_sold_cents: contact.totalSpentOrSoldCents,
    notes: contact.notes || null,
    created_at: contact.createdAt,
  };
}

// Financial Account Mappers
export function mapAccountFromRow(row: any): FinancialAccount {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    balanceCents: Number(row.balance_cents),
  };
}

export function mapAccountToRow(acc: FinancialAccount): any {
  return {
    id: acc.id,
    name: acc.name,
    type: acc.type,
    balance_cents: acc.balanceCents,
  };
}

// Financial Transaction Mappers
export function mapTransactionFromRow(row: any): FinancialTransaction {
  return {
    id: row.id,
    description: row.description,
    category: row.category,
    type: row.type,
    amountCents: Number(row.amount_cents),
    date: row.date,
    status: row.status,
    accountId: row.account_id,
    relatedDeviceId: row.related_device_id || undefined,
  };
}

export function mapTransactionToRow(tx: FinancialTransaction): any {
  return {
    id: tx.id,
    description: tx.description,
    category: tx.category,
    type: tx.type,
    amount_cents: tx.amountCents,
    date: tx.date,
    status: tx.status,
    account_id: tx.accountId,
    related_device_id: tx.relatedDeviceId || null,
  };
}

// Alert Mappers
export function mapAlertFromRow(row: any): AlertNotification {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    severity: row.severity,
    date: row.date,
    read: row.read,
    actionUrl: row.action_url || undefined,
  };
}

export function mapAlertToRow(alert: AlertNotification): any {
  return {
    id: alert.id,
    title: alert.title,
    description: alert.description,
    type: alert.type,
    severity: alert.severity,
    date: alert.date,
    read: alert.read,
    action_url: alert.actionUrl || null,
  };
}

// --- API Service Calls ---

export async function fetchAllData() {
  const [
    { data: devicesData, error: devErr },
    { data: salesData, error: salesErr },
    { data: purchasesData, error: purErr },
    { data: repairsData, error: repErr },
    { data: contactsData, error: ctErr },
    { data: accountsData, error: accErr },
    { data: transactionsData, error: txErr },
    { data: alertsData, error: altErr },
  ] = await Promise.all([
    supabase.from('devices').select('*').order('created_at', { ascending: false }),
    supabase.from('sales').select('*').order('created_at', { ascending: false }),
    supabase.from('purchases').select('*').order('created_at', { ascending: false }),
    supabase.from('repair_orders').select('*').order('created_at', { ascending: false }),
    supabase.from('contacts').select('*').order('created_at', { ascending: false }),
    supabase.from('financial_accounts').select('*').order('created_at', { ascending: true }),
    supabase.from('financial_transactions').select('*').order('created_at', { ascending: false }),
    supabase.from('alert_notifications').select('*').order('created_at', { ascending: false }),
  ]);

  if (devErr || salesErr || purErr || repErr || ctErr || accErr || txErr || altErr) {
    console.error('Error fetching Supabase data:', { devErr, salesErr, purErr, repErr, ctErr, accErr, txErr, altErr });
  }

  return {
    devices: (devicesData || []).map(mapDeviceFromRow),
    sales: (salesData || []).map(mapSaleFromRow),
    purchases: (purchasesData || []).map(mapPurchaseFromRow),
    repairs: (repairsData || []).map(mapRepairFromRow),
    contacts: (contactsData || []).map(mapContactFromRow),
    accounts: (accountsData || []).map(mapAccountFromRow),
    transactions: (transactionsData || []).map(mapTransactionFromRow),
    alerts: (alertsData || []).map(mapAlertFromRow),
  };
}

export async function dbAddDevice(device: DeviceItem) {
  const row = mapDeviceToRow(device);
  const { error } = await supabase.from('devices').insert(row);
  if (error) console.error('Error adding device to Supabase:', error);
}

export async function dbUpdateDevice(id: string, updates: Partial<DeviceItem>) {
  // If partial update, map keys carefully
  const mapped: any = {};
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.location !== undefined) mapped.location = updates.location;
  if (Object.prototype.hasOwnProperty.call(updates, 'soldDate')) mapped.sold_date = updates.soldDate || null;
  if (updates.directCosts !== undefined) mapped.direct_costs = updates.directCosts;
  if (updates.totalCostCents !== undefined) mapped.total_cost_cents = updates.totalCostCents;
  if (updates.suggestedPriceCents !== undefined) mapped.suggested_price_cents = updates.suggestedPriceCents;
  if (updates.advertisedPriceCents !== undefined) mapped.advertised_price_cents = updates.advertisedPriceCents;
  if (updates.floorPriceCents !== undefined) mapped.floor_price_cents = updates.floorPriceCents;
  if (updates.notes !== undefined) mapped.notes = updates.notes;

  const { error } = await supabase.from('devices').update(mapped).eq('id', id);
  if (error) console.error('Error updating device in Supabase:', error);
}

export async function dbAddSale(sale: SaleRecord) {
  const row = mapSaleToRow(sale);
  const { error } = await supabase.from('sales').insert(row);
  if (error) console.error('Error adding sale to Supabase:', error);
}

export async function dbUpdateSale(id: string, updates: Partial<SaleRecord>) {
  const mapped: any = {};
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.notes !== undefined) mapped.notes = updates.notes;
  const { error } = await supabase.from('sales').update(mapped).eq('id', id);
  if (error) console.error('Error updating sale in Supabase:', error);
}

export async function dbAddPurchase(purchase: PurchaseRecord) {
  const row = mapPurchaseToRow(purchase);
  const { error } = await supabase.from('purchases').insert(row);
  if (error) console.error('Error adding purchase to Supabase:', error);
}

export async function dbAddRepairOrder(repair: RepairOrder) {
  const row = mapRepairToRow(repair);
  const { error } = await supabase.from('repair_orders').insert(row);
  if (error) console.error('Error adding repair order to Supabase:', error);
}

export async function dbUpdateRepairOrder(id: string, updates: Partial<RepairOrder>) {
  const mapped: any = {};
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.completedDate !== undefined) mapped.completed_date = updates.completedDate;
  const { error } = await supabase.from('repair_orders').update(mapped).eq('id', id);
  if (error) console.error('Error updating repair order in Supabase:', error);
}

export async function dbAddContact(contact: Contact) {
  const row = mapContactToRow(contact);
  const { error } = await supabase.from('contacts').insert(row);
  if (error) console.error('Error adding contact to Supabase:', error);
}

export async function dbUpsertContact(contact: Contact) {
  const row = mapContactToRow(contact);
  const { error } = await supabase.from('contacts').upsert(row);
  if (error) console.error('Error upserting contact in Supabase:', error);
}

export async function dbAddTransaction(tx: FinancialTransaction) {
  const row = mapTransactionToRow(tx);
  const { error } = await supabase.from('financial_transactions').insert(row);
  if (error) console.error('Error adding transaction to Supabase:', error);
}

export async function dbAddAccount(account: FinancialAccount) {
  const { error } = await supabase.from('financial_accounts').insert(mapAccountToRow(account));
  if (error) console.error('Error adding account to Supabase:', error);
}

export async function dbUpdateAccountBalance(accountId: string, balanceCents: number) {
  const { error } = await supabase
    .from('financial_accounts')
    .update({ balance_cents: balanceCents })
    .eq('id', accountId);
  if (error) console.error('Error updating account balance in Supabase:', error);
}

export async function dbUpdateAlertRead(alertId: string) {
  const { error } = await supabase.from('alert_notifications').update({ read: true }).eq('id', alertId);
  if (error) console.error('Error updating alert in Supabase:', error);
}
