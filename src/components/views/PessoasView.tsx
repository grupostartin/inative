import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, maskPhone } from '../../lib/luhn';
import { Users, Phone, MessageCircle, Plus, Search, X } from 'lucide-react';

export const PessoasView: React.FC = () => {
  const { contacts, addContact } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'cliente' | 'fornecedor' | 'tecnico'>('todos');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [types, setTypes] = useState<('cliente' | 'fornecedor' | 'tecnico')[]>(['cliente']);
  const [notes, setNotes] = useState('');

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.phone.includes(q);
    const matchesType = typeFilter === 'todos' || c.types.includes(typeFilter);
    return matchesSearch && matchesType;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addContact({
      name,
      phone: maskPhone(phone),
      email,
      types,
      notes,
    });

    setIsAddOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Pessoas (Clientes, Fornecedores & Técnicos)
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Histórico consolidado de compras, vendas e contato rápido via WhatsApp
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Contato</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border-none text-xs font-medium text-black dark:text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'cliente', label: 'Clientes' },
            { id: 'fornecedor', label: 'Fornecedores' },
            { id: 'tecnico', label: 'Técnicos' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                typeFilter === t.id
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm'
                  : 'text-neutral-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(contact => {
          const cleanPhone = contact.phone.replace(/\D/g, '');
          const waLink = `https://wa.me/55${cleanPhone}`;

          return (
            <div
              key={contact.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {contact.types.map(t => (
                      <span
                        key={t}
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono-num">
                    {contact.totalTransactionsCount} transações
                  </span>
                </div>

                <h3 className="font-bold text-base text-black dark:text-white">{contact.name}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{contact.phone}</p>
                {contact.email && <p className="text-xs text-neutral-400">{contact.email}</p>}

                {contact.notes && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                    {contact.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                    Volume Movimentado
                  </span>
                  <span className="text-sm font-extrabold text-black dark:text-white font-mono-num">
                    {formatBRL(contact.totalSpentOrSoldCents)}
                  </span>
                </div>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Contact Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-black dark:text-white">Cadastrar Contato</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium font-mono-num"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">Observações</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
