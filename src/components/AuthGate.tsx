import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordIsSecure = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/.test(password);

  useEffect(() => {
    const startedAt = Date.now();
    let loadingTimer: number | undefined;
    const finishInitialLoad = (nextSession: Session | null) => {
      setSession(nextSession);
      const remaining = Math.max(0, 800 - (Date.now() - startedAt));
      loadingTimer = window.setTimeout(() => setLoading(false), remaining);
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      finishInitialLoad(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      subscription.unsubscribe();
      if (loadingTimer) window.clearTimeout(loadingTimer);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (isSignUp && !passwordIsSecure) {
      setMessage('Use uma senha com 8 ou mais caracteres, incluindo letra, número e caractere especial.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setMessage('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (result.error) {
      setMessage(result.error.message);
    } else if (isSignUp && !result.data.session) {
      setMessage('Conta criada. Confirme o e-mail para acessar o sistema.');
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-[#fbfbfb] dark:bg-[#09090b] p-4"><div className="loading-enter flex flex-col items-center gap-4"><div className="loading-mark w-16 h-16 rounded-3xl bg-black dark:bg-white text-white dark:text-black grid place-items-center text-2xl font-extrabold">iN</div><div className="text-center"><p className="font-bold text-black dark:text-white">iNative Gestão</p><p className="text-xs text-neutral-500 mt-1 flex items-center gap-2"><LoaderCircle className="w-3.5 h-3.5 animate-spin" />Carregando dados da operação...</p></div></div></div>;
  }
  if (session) return <>{children}</>;

  return (
    <main className="min-h-screen grid place-items-center bg-[#fbfbfb] dark:bg-[#09090b] p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-7 rounded-3xl bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
        <div className="space-y-1"><div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black grid place-items-center"><LockKeyhole className="w-5 h-5" /></div><h1 className="text-xl font-bold text-black dark:text-white pt-2">iNative Gestão</h1><p className="text-xs text-neutral-500">{isSignUp ? 'Crie o acesso da sua operação.' : 'Entre para acessar seus dados reais.'}</p></div>
        <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="E-mail" className="w-full p-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white text-neutral-950 placeholder:text-neutral-500 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
        <div className="space-y-1.5">
          <div className="relative">
            <input required minLength={isSignUp ? 8 : 1} type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} placeholder={isSignUp ? 'Crie uma senha segura' : 'Senha'} className="w-full p-3 pr-11 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white text-neutral-950 placeholder:text-neutral-500 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
          {isSignUp && <p className={`text-[11px] ${password.length === 0 || passwordIsSecure ? 'text-neutral-500 dark:text-neutral-400' : 'text-red-600 dark:text-red-400'}`}>Mínimo de 8 caracteres, com letra, número e símbolo.</p>}
        </div>
        {isSignUp && (
          <div className="space-y-1.5">
            <div className="relative">
              <input required type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Confirme sua senha" className="w-full p-3 pr-11 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white text-neutral-950 placeholder:text-neutral-500 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
              <button type="button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && <p className="text-[11px] text-red-600 dark:text-red-400">As senhas não coincidem.</p>}
          </div>
        )}
        {message && <p className="text-xs text-amber-700 dark:text-amber-300">{message}</p>}
        <button disabled={submitting} className="w-full p-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-sm font-bold disabled:opacity-50 flex justify-center items-center gap-2"><LogIn className="w-4 h-4" />{submitting ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}</button>
        <button type="button" onClick={() => { setIsSignUp(value => !value); setMessage(''); setConfirmPassword(''); }} className="w-full text-xs text-neutral-500 hover:text-black dark:hover:text-white">{isSignUp ? 'Já tenho uma conta' : 'Ainda não tenho conta'}</button>
      </form>
    </main>
  );
};
