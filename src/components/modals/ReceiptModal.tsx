import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, maskIMEI } from '../../lib/luhn';
import { Printer, MessageCircle, X, CheckCircle2, Shield } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { selectedSaleForReceipt, setSelectedSaleForReceipt } = useApp();

  if (!selectedSaleForReceipt) return null;

  const sale = selectedSaleForReceipt;

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = sale.customerPhone.replace(/\D/g, '');
  const messageText = encodeURIComponent(
    `Olá ${sale.customerName}! Aqui está o comprovante da sua compra na iNative:\n\n` +
      `📦 Aparelho: ${sale.deviceModel}\n` +
      `🔑 IMEI: ${sale.deviceImei}\n` +
      `💰 Valor: ${formatBRL(sale.totalPaidCents)}\n` +
      `🛡️ Garantia: 90 dias (válida até ${sale.warrantyEnd})\n\n` +
      `Agradecemos pela preferência!`
  );
  const waUrl = `https://wa.me/55${cleanPhone}?text=${messageText}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-6 my-auto max-h-[90vh] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-black dark:text-white">
              Recibo & Termo de Garantia ({sale.saleNumber})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              title="Imprimir Recibo"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedSaleForReceipt(null)}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div
          id="printable-receipt"
          className="bg-white text-black p-6 rounded-2xl border border-neutral-200 space-y-5 text-xs shadow-inner overflow-y-auto flex-1 font-mono-num"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-neutral-200">
            <h2 className="text-xl font-black tracking-tight text-black">iNative Gestão de iPhones</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Comprovante de Compra & Certificado de Garantia Legal (Art. 26 CDC)
            </p>
            <p className="text-[10px] text-neutral-400 mt-1">
              Data da Venda: {sale.date} • Venda Nº: {sale.saleNumber}
            </p>
          </div>

          {/* Client Details */}
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
              Dados do Comprador
            </h4>
            <p className="text-sm font-bold text-black">{sale.customerName}</p>
            <p className="text-neutral-600">
              Telefone: {sale.customerPhone} {sale.customerCpf ? `• CPF: ${sale.customerCpf}` : ''}
            </p>
          </div>

          {/* Device Details */}
          <div className="space-y-1 pt-2 border-t border-neutral-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
              Aparelho Adquirido
            </h4>
            <p className="text-sm font-bold text-black">{sale.deviceModel}</p>
            <p className="text-neutral-600">
              IMEI Registrado: <span className="font-bold text-black">{maskIMEI(sale.deviceImei)}</span>
            </p>
          </div>

          {/* Payment breakdown */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
              Formas de Pagamento
            </h4>
            {sale.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-neutral-700">
                <span className="capitalize">
                  {p.method === 'tradein' ? 'Trade-in (iPhone na troca)' : p.method}{' '}
                  {p.installments ? `(${p.installments}x)` : ''}
                </span>
                <span className="font-bold text-black">{formatBRL(p.amountCents)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-black">
              <span>Total Pago:</span>
              <span>{formatBRL(sale.totalPaidCents)}</span>
            </div>
          </div>

          {/* Warranty Terms */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] leading-relaxed space-y-1.5 text-neutral-600">
            <p className="font-bold text-black flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Termo de Garantia de 90 Dias
            </p>
            <p>
              Este aparelho possui garantia de 90 (noventa) dias corridos contra defeitos de fabricação e funcionamento de hardware, válida até <strong>{sale.warrantyEnd}</strong>.
            </p>
            <p className="text-[10px] text-neutral-500">
              Não cobre: danos por líquidos, oxidação, quedas ou trincas posteriores, nem intervenção técnica não autorizada.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-6 text-center text-[10px] text-neutral-500">
            <div>
              <div className="border-b border-black mb-1" />
              <span>Assinatura do Vendedor (iNative)</span>
            </div>
            <div>
              <div className="border-b border-black mb-1" />
              <span>Assinatura do Comprador</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Comprovante via WhatsApp</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-5 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-semibold text-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
