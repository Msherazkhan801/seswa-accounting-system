'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  Database, 
  HardDrive, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export default function SettingsView() {
  const { 
    user, 
    stats, 
    backupData, 
    restoreData, 
    resetToInitialData, 
    members, 
    sectors, 
    transactions, 
    accounts 
  } = useApp();

  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const res = restoreData(text);
        setRestoreStatus(res);
      } catch (err: any) {
        setRestoreStatus({ success: false, message: 'Invalid JSON backup file: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    if (confirm('Are you sure you want to reset all data to initial FY 2026–27 seed dataset? Any unsaved changes will be overwritten.')) {
      resetToInitialData();
      alert('System successfully reset to default SESWA 2026–27 dataset.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>System Settings & Data Backup/Recovery (NFR-006)</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage full system database backups, offline local storage persistence, restore procedures & organizational profile.
        </p>
      </div>

      {/* Restore Status Notification */}
      {restoreStatus && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
          restoreStatus.success
            ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
            : 'bg-rose-50 text-rose-950 border-rose-300'
        }`}>
          {restoreStatus.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="font-semibold">{restoreStatus.message}</span>
        </div>
      )}

      {/* Backup & Recovery Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Database Backup & Restore Engine
            </h2>
            <p className="text-xs text-zinc-500">
              Export complete system state (all transactions, members, 1-year elections, accounts, loans, EOBI) to secure JSON file.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Backup Button */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Full Database Backup</span>
            </h3>
            <p className="text-[11px] text-zinc-500">
              Generates an instant, complete snapshot of all accounting records and organizational rosters.
            </p>
            <button
              onClick={backupData}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup (.json)</span>
            </button>
          </div>

          {/* Restore Button */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Restore Database from File</span>
            </h3>
            <p className="text-[11px] text-zinc-500">
              Upload a previously exported JSON backup file to restore system records.
            </p>
            <div>
              <label className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload & Restore (.json)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Reset to Seed Dataset */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Reset to Pre-Loaded Sample Data (FY 2026–27)
            </h4>
            <p className="text-[11px] text-zinc-500">
              Restore the initial demonstration dataset based on Atta Ullah Cash Book 2026–27.
            </p>
          </div>

          <button
            onClick={handleResetConfirm}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Initial Dataset</span>
          </button>
        </div>

      </div>

      {/* Organization & System Specification Profile */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <span>Organization & Software Specification Metadata</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-1">
            <span className="text-zinc-400 font-medium">Organization Name:</span>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              Shewa Educated Social Workers Association (SESWA)
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-1">
            <span className="text-zinc-400 font-medium">Department / In-Charge:</span>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              Finance Sector — Atta Ullah Khan
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-1">
            <span className="text-zinc-400 font-medium">Software Specification Version:</span>
            <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              v1.0 (SRS Complete Implementation)
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-1">
            <span className="text-zinc-400 font-medium">Reference Excel Workbook:</span>
            <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
              Atta Ullah Cash Book 2026–27(1).xlsx
            </div>
          </div>
        </div>

        {/* Database Health Summary */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex flex-wrap gap-4">
          <span>Total Transactions: <strong>{transactions.length}</strong></span>
          <span>Registered Members: <strong>{members.length}</strong></span>
          <span>Active Sectors: <strong>{sectors.length}</strong></span>
          <span>Chart of Accounts: <strong>{accounts.length}</strong></span>
          <span>Storage: <strong>LocalStorage + JSON File Sync</strong></span>
        </div>
      </div>

    </div>
  );
}
