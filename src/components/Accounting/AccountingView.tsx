'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JournalLineItem, Transaction } from '../../types';
import { 
  Scale, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileSpreadsheet, 
  FileText, 
  BookOpen, 
  Receipt,
  X
} from 'lucide-react';
import { formatDate, formatPKR } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../utils/exportUtils';

export default function AccountingView() {
  const { 
    accounts, 
    transactions, 
    addTransaction, 
    setViewVoucher 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TRIAL_BALANCE' | 'JOURNAL_ENTRIES'>('TRIAL_BALANCE');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewJVModalOpen, setIsNewJVModalOpen] = useState(false);

  // Journal Entry Form State
  const [jvDate, setJvDate] = useState(new Date().toISOString().split('T')[0]);
  const [jvDescription, setJvDescription] = useState('');
  const [jvReference, setJvReference] = useState('');
  const [lines, setLines] = useState<Omit<JournalLineItem, 'id'>[]>([
    {
      accountId: accounts[0]?.id || '',
      accountCode: accounts[0]?.code || '',
      accountName: accounts[0]?.name || '',
      debit: 0,
      credit: 0,
      narration: ''
    },
    {
      accountId: accounts[1]?.id || '',
      accountCode: accounts[1]?.code || '',
      accountName: accounts[1]?.name || '',
      debit: 0,
      credit: 0,
      narration: ''
    }
  ]);
  const [jvError, setJvError] = useState('');

  // Compute Trial Balance
  const trialBalanceRows = accounts.map(acc => {
    // Total Debits and Total Credits posted in transactions for this account
    let totalDebit = 0;
    let totalCredit = 0;

    transactions.filter(t => t.status === 'POSTED').forEach(tx => {
      if (tx.type === 'CASH_RECEIPT' || tx.type === 'BANK_RECEIPT') {
        if (tx.accountId === acc.id) totalDebit += tx.amount;
        if (tx.offsetAccountId === acc.id) totalCredit += tx.amount;
      } else if (tx.type === 'CASH_PAYMENT' || tx.type === 'BANK_PAYMENT') {
        if (tx.accountId === acc.id) totalCredit += tx.amount;
        if (tx.offsetAccountId === acc.id) totalDebit += tx.amount;
      } else if (tx.type === 'BANK_TRANSFER') {
        if (tx.accountId === acc.id) totalCredit += tx.amount;
        if (tx.offsetAccountId === acc.id) totalDebit += tx.amount;
      } else if (tx.type === 'JOURNAL_ENTRY' && tx.journalLines) {
        const line = tx.journalLines.find(l => l.accountId === acc.id);
        if (line) {
          totalDebit += line.debit;
          totalCredit += line.credit;
        }
      }
    });

    // Closing debit/credit balance
    let closingDebit = 0;
    let closingCredit = 0;

    if (acc.category === 'ASSET' || acc.category === 'EXPENSE') {
      const net = acc.openingBalance + totalDebit - totalCredit;
      if (net >= 0) closingDebit = net;
      else closingCredit = Math.abs(net);
    } else {
      const net = acc.openingBalance + totalCredit - totalDebit;
      if (net >= 0) closingCredit = net;
      else closingDebit = Math.abs(net);
    }

    return {
      account: acc,
      openingBalance: acc.openingBalance,
      totalDebit,
      totalCredit,
      closingDebit,
      closingCredit
    };
  });

  const totalTB_Debit = trialBalanceRows.reduce((sum, r) => sum + r.closingDebit, 0);
  const totalTB_Credit = trialBalanceRows.reduce((sum, r) => sum + r.closingCredit, 0);
  const isTBBalanced = Math.abs(totalTB_Debit - totalTB_Credit) < 1;

  // Journal Vouchers list
  const journalVouchers = transactions.filter(t => t.type === 'JOURNAL_ENTRY');

  // JV Form Handlers
  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    if (field === 'accountId') {
      const acc = accounts.find(a => a.id === value);
      updated[index] = {
        ...updated[index],
        accountId: value,
        accountCode: acc?.code || '',
        accountName: acc?.name || ''
      };
    } else if (field === 'debit') {
      const val = Number(value) || 0;
      updated[index] = {
        ...updated[index],
        debit: val,
        credit: val > 0 ? 0 : updated[index].credit
      };
    } else if (field === 'credit') {
      const val = Number(value) || 0;
      updated[index] = {
        ...updated[index],
        credit: val,
        debit: val > 0 ? 0 : updated[index].debit
      };
    } else if (field === 'narration') {
      updated[index] = { ...updated[index], narration: value };
    }
    setLines(updated);
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        accountId: accounts[0]?.id || '',
        accountCode: accounts[0]?.code || '',
        accountName: accounts[0]?.name || '',
        debit: 0,
        credit: 0,
        narration: ''
      }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      setJvError('A double-entry journal entry must have at least 2 lines.');
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const totalJVDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalJVCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isJVBalanced = totalJVDebit > 0 && totalJVDebit === totalJVCredit;

  const handleSaveJV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJVBalanced) {
      setJvError(`Journal Entry is out of balance. Total Debits (Rs. ${totalJVDebit.toLocaleString()}) must equal Total Credits (Rs. ${totalJVCredit.toLocaleString()}).`);
      return;
    }
    if (!jvDescription.trim()) {
      setJvError('Please enter a description for this Journal Entry.');
      return;
    }

    const journalLines: JournalLineItem[] = lines.map((l, idx) => ({
      id: `jl-${Date.now()}-${idx}`,
      ...l
    }));

    addTransaction({
      type: 'JOURNAL_ENTRY',
      date: jvDate,
      accountId: lines[0].accountId,
      amount: totalJVDebit,
      referenceNo: jvReference.trim() || undefined,
      description: jvDescription.trim(),
      journalLines
    });

    setIsNewJVModalOpen(false);
  };

  const handleExportTrialBalanceExcel = () => {
    const data = trialBalanceRows.map(r => ({
      'Account Code': r.account.code,
      'Account Title': r.account.name,
      'Category': r.account.category,
      'Opening Balance (PKR)': r.openingBalance,
      'Total Period Debits (PKR)': r.totalDebit,
      'Total Period Credits (PKR)': r.totalCredit,
      'Closing Debit Balance (PKR)': r.closingDebit,
      'Closing Credit Balance (PKR)': r.closingCredit
    }));
    exportToExcel(data, 'SESWA_Trial_Balance_FY26-27', 'TrialBalance');
  };

  const handleExportTrialBalancePDF = () => {
    const headers = ['Code', 'Account Title', 'Category', 'Debit (PKR)', 'Credit (PKR)'];
    const rows = trialBalanceRows.map(r => [
      r.account.code,
      r.account.name,
      r.account.category,
      r.closingDebit > 0 ? formatPKR(r.closingDebit) : '—',
      r.closingCredit > 0 ? formatPKR(r.closingCredit) : '—'
    ]);
    generatePDFReport(
      'SESWA Trial Balance Statement',
      `As of ${formatDate(new Date().toISOString())} — Fiscal Year 2026–27`,
      headers,
      rows,
      'p',
      [
        { label: 'Total Debit Balances', value: formatPKR(totalTB_Debit) },
        { label: 'Total Credit Balances', value: formatPKR(totalTB_Credit) },
        { label: 'Mathematical Balance Status', value: isTBBalanced ? 'BALANCED (Verified)' : 'OUT OF BALANCE' }
      ]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-600" />
            <span>Double-Entry Accounting & Trial Balance (FR-010)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            General Ledger engine, double-entry balanced Journal Vouchers (JV), and real-time verified Trial Balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'TRIAL_BALANCE' ? (
            <>
              <button
                onClick={handleExportTrialBalancePDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>PDF Statement</span>
              </button>
              <button
                onClick={handleExportTrialBalanceExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setJvDate(new Date().toISOString().split('T')[0]);
                setJvDescription('');
                setJvReference('');
                setJvError('');
                setIsNewJVModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Journal Entry (JV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('TRIAL_BALANCE')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'TRIAL_BALANCE'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Real-Time Trial Balance</span>
        </button>

        <button
          onClick={() => setActiveTab('JOURNAL_ENTRIES')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'JOURNAL_ENTRIES'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Journal Entries Log ({journalVouchers.length})</span>
        </button>
      </div>

      {/* TAB 1: TRIAL BALANCE */}
      {activeTab === 'TRIAL_BALANCE' && (
        <div className="space-y-4">
          
          {/* Balance Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            isTBBalanced
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              {isTBBalanced ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <div>
                <h3 className="text-sm font-bold">
                  {isTBBalanced ? 'Trial Balance is Mathematically Balanced' : 'Trial Balance Out of Balance'}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Double-entry verification: Total Debits match Total Credits across all account categories.
                </p>
              </div>
            </div>

            <div className="text-right font-mono font-bold text-sm">
              <div>Total Debits: {formatPKR(totalTB_Debit)}</div>
              <div>Total Credits: {formatPKR(totalTB_Credit)}</div>
            </div>
          </div>

          {/* Trial Balance Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Account Code</th>
                    <th className="p-3">Account Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Period Debits (PKR)</th>
                    <th className="p-3 text-right">Period Credits (PKR)</th>
                    <th className="p-3 text-right font-bold text-zinc-900 dark:text-zinc-100">Debit Balance (PKR)</th>
                    <th className="p-3 text-right font-bold text-zinc-900 dark:text-zinc-100">Credit Balance (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {trialBalanceRows.map((r) => (
                    <tr key={r.account.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                      <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {r.account.code}
                      </td>
                      <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {r.account.name}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {r.account.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-zinc-500">
                        {r.totalDebit > 0 ? formatPKR(r.totalDebit) : '—'}
                      </td>
                      <td className="p-3 text-right font-mono text-zinc-500">
                        {r.totalCredit > 0 ? formatPKR(r.totalCredit) : '—'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {r.closingDebit > 0 ? formatPKR(r.closingDebit) : '—'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {r.closingCredit > 0 ? formatPKR(r.closingCredit) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-emerald-50 dark:bg-emerald-950/70 border-t-2 border-emerald-800 text-xs font-black">
                  <tr>
                    <td colSpan={5} className="p-3 text-right uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                      Total Trial Balance:
                    </td>
                    <td className="p-3 text-right font-mono text-sm text-emerald-900 dark:text-emerald-200">
                      {formatPKR(totalTB_Debit)}
                    </td>
                    <td className="p-3 text-right font-mono text-sm text-emerald-900 dark:text-emerald-200">
                      {formatPKR(totalTB_Credit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: JOURNAL ENTRIES */}
      {activeTab === 'JOURNAL_ENTRIES' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setJvDate(new Date().toISOString().split('T')[0]);
                setJvDescription('');
                setJvReference('');
                setJvError('');
                setIsNewJVModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record New Journal Voucher (JV)</span>
            </button>
          </div>

          <div className="space-y-4">
            {journalVouchers.map((jv) => (
              <div key={jv.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                      {jv.voucherNo}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{jv.description}</div>
                      <div className="text-[10px] text-zinc-400">Date: {formatDate(jv.date)} {jv.referenceNo ? `• Ref: ${jv.referenceNo}` : ''}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                      {formatPKR(jv.amount)}
                    </span>
                    <button
                      onClick={() => setViewVoucher(jv)}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-semibold"
                    >
                      Slip
                    </button>
                  </div>
                </div>

                {/* Journal lines breakdown */}
                {jv.journalLines && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500">
                      <tr>
                        <th className="p-2">Account</th>
                        <th className="p-2">Line Narration</th>
                        <th className="p-2 text-right">Debit (PKR)</th>
                        <th className="p-2 text-right">Credit (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {jv.journalLines.map((l, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{l.accountCode} - {l.accountName}</td>
                          <td className="p-2 text-zinc-500">{l.narration || '—'}</td>
                          <td className="p-2 text-right font-mono font-semibold">{l.debit > 0 ? formatPKR(l.debit) : '—'}</td>
                          <td className="p-2 text-right font-mono font-semibold">{l.credit > 0 ? formatPKR(l.credit) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Journal Entry Modal with Double-Entry Balancer */}
      {isNewJVModalOpen && (
        <div 
          onClick={() => setIsNewJVModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <span>Double-Entry Journal Voucher (JV)</span>
              </h2>
              <button onClick={() => setIsNewJVModalOpen(false)} className="text-zinc-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJV} className="p-6 space-y-4">
              {jvError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {jvError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Journal Date *</label>
                  <input
                    type="date"
                    value={jvDate}
                    onChange={(e) => setJvDate(e.target.value)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Reference / Memo #</label>
                  <input
                    type="text"
                    value={jvReference}
                    onChange={(e) => setJvReference(e.target.value)}
                    placeholder="e.g. ADJ-2026-01"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Entry Narration / Description *</label>
                  <input
                    type="text"
                    value={jvDescription}
                    onChange={(e) => setJvDescription(e.target.value)}
                    placeholder="e.g. Monthly EOBI statutory liability provision"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Multi-line Debit / Credit rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Journal Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-bold cursor-pointer"
                  >
                    + Add Another Line
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border items-center text-xs">
                      
                      {/* Account selector */}
                      <div className="col-span-5">
                        <select
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full p-1.5 bg-white dark:bg-zinc-800 border rounded text-[11px]"
                        >
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.code} - {a.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Narration */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={line.narration || ''}
                          onChange={(e) => handleLineChange(idx, 'narration', e.target.value)}
                          placeholder="Narration"
                          className="w-full p-1.5 bg-white dark:bg-zinc-800 border rounded text-[11px]"
                        />
                      </div>

                      {/* Debit */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={line.debit || ''}
                          onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                          placeholder="Debit"
                          className="w-full p-1.5 bg-white dark:bg-zinc-800 border rounded text-[11px] font-mono font-bold text-right"
                        />
                      </div>

                      {/* Credit */}
                      <div className="col-span-2 flex items-center gap-1">
                        <input
                          type="number"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                          placeholder="Credit"
                          className="w-full p-1.5 bg-white dark:bg-zinc-800 border rounded text-[11px] font-mono font-bold text-right"
                        />
                        {lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1 text-zinc-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Balancer Footer Box */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono font-bold ${
                isJVBalanced
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950 border-rose-300 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-center gap-1.5">
                  {isJVBalanced ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{isJVBalanced ? 'Journal Entry is Balanced' : 'Out of Balance (Debits ≠ Credits)'}</span>
                </div>

                <div className="flex gap-4">
                  <span>Debits: {formatPKR(totalJVDebit)}</span>
                  <span>Credits: {formatPKR(totalJVCredit)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewJVModalOpen(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isJVBalanced}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow"
                >
                  Post Journal Voucher
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
