'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Account, AccountCategory } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  X, 
  FileSpreadsheet, 
  FileText, 
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatDate, formatPKR } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../utils/exportUtils';

export default function AccountsView() {
  const { accounts, transactions, addAccount, updateAccount, toggleAccountStatus, setViewVoucher } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'ASSET' as AccountCategory,
    subCategory: '',
    openingBalance: 0,
    description: '',
    isActive: true
  });
  const [formError, setFormError] = useState('');

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.includes(searchTerm) ||
      (acc.subCategory && acc.subCategory.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || acc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      name: '',
      category: 'EXPENSE',
      subCategory: 'Program Costs',
      openingBalance: 0,
      description: '',
      isActive: true
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setFormData({
      code: acc.code,
      name: acc.name,
      category: acc.category,
      subCategory: acc.subCategory || '',
      openingBalance: acc.openingBalance,
      description: acc.description || '',
      isActive: acc.isActive
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      setFormError('Account Code and Account Name are required.');
      return;
    }
    if (accounts.some(a => a.code === formData.code.trim())) {
      setFormError(`Account Code ${formData.code} already exists.`);
      return;
    }
    addAccount({
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category,
      subCategory: formData.subCategory,
      openingBalance: Number(formData.openingBalance),
      description: formData.description,
      isActive: formData.isActive
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    if (!formData.name.trim()) {
      setFormError('Account Name is required.');
      return;
    }
    updateAccount(selectedAccount.id, {
      name: formData.name.trim(),
      subCategory: formData.subCategory,
      description: formData.description,
      isActive: formData.isActive
    });
    setIsEditModalOpen(false);
  };

  const handleExportExcel = () => {
    const data = filteredAccounts.map(a => ({
      'Account Code': a.code,
      'Account Name': a.name,
      'Category': a.category,
      'Sub-Category': a.subCategory || '',
      'Opening Balance (PKR)': a.openingBalance,
      'Current Balance (PKR)': a.currentBalance,
      'Status': a.isActive ? 'ACTIVE' : 'INACTIVE',
      'Description': a.description || ''
    }));
    exportToExcel(data, 'SESWA_Chart_of_Accounts', 'Accounts');
  };

  // Compute transactions for the selected account in the ledger modal
  const getAccountLedger = (acc: Account) => {
    let runningBalance = acc.openingBalance;
    const accountTxList = transactions.filter(t => 
      t.status === 'POSTED' && 
      (t.accountId === acc.id || t.offsetAccountId === acc.id || t.journalLines?.some(l => l.accountId === acc.id))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const ledgerEntries = accountTxList.map(tx => {
      let debit = 0;
      let credit = 0;

      if (tx.type === 'CASH_RECEIPT' || tx.type === 'BANK_RECEIPT') {
        if (tx.accountId === acc.id) {
          debit = tx.amount;
        } else if (tx.offsetAccountId === acc.id) {
          credit = tx.amount;
        }
      } else if (tx.type === 'CASH_PAYMENT' || tx.type === 'BANK_PAYMENT') {
        if (tx.accountId === acc.id) {
          credit = tx.amount;
        } else if (tx.offsetAccountId === acc.id) {
          debit = tx.amount;
        }
      } else if (tx.type === 'BANK_TRANSFER') {
        if (tx.accountId === acc.id) credit = tx.amount;
        if (tx.offsetAccountId === acc.id) debit = tx.amount;
      } else if (tx.type === 'JOURNAL_ENTRY' && tx.journalLines) {
        const line = tx.journalLines.find(l => l.accountId === acc.id);
        if (line) {
          debit = line.debit;
          credit = line.credit;
        }
      }

      if (acc.category === 'ASSET' || acc.category === 'EXPENSE') {
        runningBalance += (debit - credit);
      } else {
        runningBalance += (credit - debit);
      }

      return {
        ...tx,
        debit,
        credit,
        runningBalance
      };
    });

    return { opening: acc.openingBalance, entries: ledgerEntries, closing: acc.currentBalance };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>Chart of Accounts & Ledgers (FR-006)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Standard Chart of Accounts (Assets, Liabilities, Equity, Income, Expenses) with real-time running ledger statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Accounts</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {cat === 'ALL' ? 'All Heads' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code, title, sub-head..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Account Title</th>
                <th className="p-3">Category & Group</th>
                <th className="p-3 text-right">Opening Balance</th>
                <th className="p-3 text-right">Current Balance (PKR)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Ledger Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                  <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400 text-sm">
                    {acc.code}
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate max-w-xs">
                      {acc.description || 'No notes'}
                    </div>
                  </td>

                  <td className="p-3">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      acc.category === 'ASSET' ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300' :
                      acc.category === 'LIABILITY' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' :
                      acc.category === 'EQUITY' ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300' :
                      acc.category === 'INCOME' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {acc.category}
                    </span>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {acc.subCategory || 'General'}
                    </div>
                  </td>

                  <td className="p-3 text-right font-mono text-zinc-500">
                    {formatPKR(acc.openingBalance)}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {formatPKR(acc.currentBalance)}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleAccountStatus(acc.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        acc.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800'
                      }`}
                    >
                      {acc.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  <td className="p-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedAccount(acc)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      View Ledger
                    </button>
                    {!acc.isSystemAccount && (
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1 text-zinc-400 hover:text-emerald-600 rounded"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Ledger Modal / Statement Drawer */}
      {selectedAccount && (() => {
        const ledger = getAccountLedger(selectedAccount);
        return (
          <div 
            onClick={() => setSelectedAccount(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
            >
              
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-amber-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded">
                      {selectedAccount.code}
                    </span>
                    <h2 className="text-lg font-bold">{selectedAccount.name}</h2>
                  </div>
                  <p className="text-xs text-emerald-200 mt-1">
                    General Ledger Statement • Category: {selectedAccount.category} ({selectedAccount.subCategory})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAccount(null)}
                  className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950 text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ledger Summary Cards */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border">
                    <span className="text-zinc-500">Opening Balance</span>
                    <div className="text-base font-bold font-mono text-zinc-800 dark:text-zinc-200 mt-1">
                      {formatPKR(ledger.opening)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border">
                    <span className="text-zinc-500">Total Entries Posted</span>
                    <div className="text-base font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                      {ledger.entries.length} Transactions
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700">
                    <span className="text-emerald-900 dark:text-emerald-300 font-semibold">Current Balance</span>
                    <div className="text-base font-black font-mono text-emerald-900 dark:text-emerald-200 mt-1">
                      {formatPKR(ledger.closing)}
                    </div>
                  </div>
                </div>

                {/* Ledger Transactions Table */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border-b">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Voucher #</th>
                        <th className="p-2.5">Description / Particulars</th>
                        <th className="p-2.5 text-right">Debit (PKR)</th>
                        <th className="p-2.5 text-right">Credit (PKR)</th>
                        <th className="p-2.5 text-right">Running Balance</th>
                        <th className="p-2.5 text-center">Slip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {ledger.entries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-zinc-400">
                            No posted transactions found for this account.
                          </td>
                        </tr>
                      ) : (
                        ledger.entries.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="p-2.5 whitespace-nowrap">{formatDate(entry.date)}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">{entry.voucherNo}</td>
                            <td className="p-2.5">
                              <div className="font-semibold text-zinc-900 dark:text-zinc-200">{entry.partyName || entry.description}</div>
                              <div className="text-[10px] text-zinc-400">{entry.description}</div>
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold">
                              {entry.debit > 0 ? formatPKR(entry.debit) : '—'}
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold">
                              {entry.credit > 0 ? formatPKR(entry.credit) : '—'}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-800 dark:text-emerald-300">
                              {formatPKR(entry.runningBalance)}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => setViewVoucher(entry)}
                                className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-[10px] rounded"
                              >
                                Slip
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-t flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Close Ledger
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Add / Edit Account Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div 
          onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>{isAddModalOpen ? 'Create Account Head' : 'Edit Account'}</span>
              </h2>
              <button
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="text-zinc-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Account Code (4 Digits) *</label>
                  <input
                    type="text"
                    value={formData.code}
                    disabled={isEditModalOpen}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. 5095"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Account Title / Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Disaster Emergency Food Relief"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Primary Accounting Category</label>
                  <select
                    value={formData.category}
                    disabled={isEditModalOpen}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  >
                    <option value="ASSET">Asset (1000s - Cash, Bank, Receivables)</option>
                    <option value="LIABILITY">Liability (2000s - Payables, EOBI Dues)</option>
                    <option value="EQUITY">Equity / Funds (3000s - General, Zakat, Endowment)</option>
                    <option value="INCOME">Income (4000s - Donations, Fees, Grants)</option>
                    <option value="EXPENSE">Expense (5000s - Relief, Medical, Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Sub-Category / Grouping</label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="e.g. Program Costs / Administrative"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

                {isAddModalOpen && (
                  <div>
                    <label className="block font-semibold mb-1">Opening Balance (PKR)</label>
                    <input
                      type="number"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Account purpose..."
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg h-16"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg"
                >
                  {isAddModalOpen ? 'Create Account' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
