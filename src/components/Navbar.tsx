'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Search, 
  Sun, 
  Moon, 
  Download, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  User as UserIcon,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export default function Navbar() {
  const { 
    user, 
    logout, 
    stats, 
    theme, 
    toggleTheme, 
    backupData, 
    globalSearchQuery, 
    setGlobalSearchQuery,
    setActiveTab
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white border-b border-emerald-800 shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Organization Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 font-bold shadow-md ring-2 ring-amber-300/40">
              <Building2 className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white">SESWA</span>
                <span className="text-xs bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Finance Sector
                </span>
              </div>
              <p className="text-xs text-emerald-200 hidden sm:block font-medium">
                Shewa Educated Social Workers Association — Accounting System v1.0
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-emerald-300" />
              </div>
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search transactions, members, sectors, accounts..."
                className="w-full pl-9 pr-4 py-1.5 bg-emerald-950/60 border border-emerald-700/80 rounded-lg text-sm text-white placeholder-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-emerald-300 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Term Expiry Alert Notification */}
            {stats.expiringTermsCount > 0 && (
              <button
                onClick={() => setActiveTab('elections')}
                title={`${stats.expiringTermsCount} 1-Year Election Term(s) expiring within 30 days`}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow transition animate-bounce"
              >
                <AlertTriangle className="w-4 h-4 text-emerald-950" />
                <span className="hidden lg:inline">{stats.expiringTermsCount} Term Expiry Alert</span>
              </button>
            )}

            {/* Excel Quick Center */}
            <button
              onClick={() => setActiveTab('excel')}
              title="Excel Import / Export Center (Ref: Atta Ullah Cash Book)"
              className="p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition-colors hidden sm:flex items-center gap-1 text-xs font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span className="hidden xl:inline">Excel Hub</span>
            </button>

            {/* Quick Backup */}
            <button
              onClick={backupData}
              title="Download Instant Database Backup (JSON)"
              className="p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition-colors hidden sm:flex items-center gap-1 text-xs font-medium"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span className="hidden xl:inline">Backup</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-200" />}
            </button>

            {/* User Profile Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-emerald-800">
              <div className="w-8 h-8 rounded-full bg-emerald-700 border border-amber-400/60 flex items-center justify-center text-amber-300 font-bold text-xs">
                AU
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  {user?.name || 'Atta Ullah Khan'}
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 inline" />
                </div>
                <div className="text-[10px] text-emerald-300 leading-tight">
                  Authorized Finance User
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-emerald-300 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
