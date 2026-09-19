import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { validateIMEI, maskIMEI } from '../../lib/luhn';
import { ShieldCheck, AlertTriangle, ExternalLink, X, CheckCircle2, Copy } from 'lucide-react';

export const IMEIValidatorModal: React.FC = () => {
  const { isIMEIModalOpen, setIsIMEIModalOpen } = useApp();
  const [inputImei, setInputImei] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isIMEIModalOpen) return null;

  const validation = validateIMEI(inputImei);
  const cleanImei = inputImei.replace(/\D/g, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cleanImei);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-black dark:text-white">
                Validador Rápido de IMEI
              </h3>
              <p className="text-xs text-neutral-400">Verificação matemática via Algoritmo de Luhn (Mód 10)</p>
            </div>
          </div>

          <button
            onClick={() => setIsIMEIModalOpen(false)}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-500 block">
            Digite ou cole o IMEI (15 dígitos)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: 356938035643809"
              value={inputImei}
              onChange={e => setInputImei(maskIMEI(e.target.value))}
              className="w-full p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-sm font-mono font-bold tracking-wider outline-none text-black dark:text-white"
              autoFocus
            />
            {cleanImei.length > 0 && (
              <button
                type="button"
                onClick={copyToClipboard}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white p-1"
                title="Copiar"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Validation Result Box */}
        {cleanImei.length > 0 && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 ${
              validation.isValid
                ? 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {validation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              <span className={validation.isValid ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}>
                {validation.message}
              </span>
            </div>

            {validation.tac && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500">
                <div>
                  <span className="block font-semibold">TAC (Modelo/Marca):</span>
                  <span className="font-mono text-black dark:text-white">{validation.tac}</span>
                </div>
                <div>
                  <span className="block font-semibold">Dígito Verificador:</span>
                  <span className="font-mono text-black dark:text-white">{validation.checkDigit}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Consultation Links */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Consultas Externas Recomendadas
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="https://checkcoverage.apple.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-black dark:text-white block">Garantia Apple</span>
                <span className="text-[10px] text-neutral-400">checkcoverage.apple.com</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>

            <a
              href="https://www.consultaoarelho.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-black dark:text-white block">Consulta Anatel (SigaMe)</span>
                <span className="text-[10px] text-neutral-400">Bloqueios e impedimentos</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
