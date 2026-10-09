'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldCheck, Lock, Mail, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useApp();
  const [email, setEmail] = useState('finance@seswa.org');
  const [password, setPassword] = useState('seswa2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setError('Invalid credentials.');
    }
  };

  const handleQuickLogin = () => {
    setEmail('finance@seswa.org');
    setPassword('seswa2026');
    login('finance@seswa.org', 'seswa2026');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-emerald-900/40 dark:border-zinc-800 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-amber-400/20 text-emerald-950">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">SESWA</h1>
          <p className="text-xs text-emerald-200 uppercase tracking-widest font-semibold mt-0.5">
            Shewa Educated Social Workers Association
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-xs text-amber-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Finance Management & Accounting System
          </div>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Authorized User Sign In
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Enter your credentials to access the central cash book & ledger.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Official Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="finance@seswa.org"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Access Accounting System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <button
              onClick={handleQuickLogin}
              type="button"
              className="w-full py-2 px-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>One-Click Login as Atta Ullah Khan (Finance User)</span>
            </button>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-3">
              Reference: Atta Ullah Cash Book 2026–27 | SESWA Organization
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
