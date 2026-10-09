'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { 
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Ban, 
  CheckCircle2, 
  X,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatPKR } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../utils/exportUtils';

export default function CashTransactionsView() {
  const { 
    transactions, 
    accounts, 
    projects, 
    sectors, 
    addTransaction, 
    voidTransaction, 
    setViewVoucher 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, CASH_RECEIPT, CASH_PAYMENT
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'CASH_RECEIPT' | 'CASH_PAYMENT'>('CASH_RECEIPT');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('acc-1010'); // Cash in Hand default
  const [offsetAccountId, setOffsetAccountId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [partyName, setPartyName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');
  const [supportingDocRef, setSupportingDocRef] = useState('');
  const [formError, setFormError] = useState('');

  // Cash accounts
  const cashAccounts = accounts.filter(a => a.category === 'ASSET' && a.code.startsWith('101'));
  
  // Potential offset accounts
  const incomeAccounts = accounts.filter(a => a.category === 'INCOME' || a.category === 'EQUITY' || a.category === 'LIABILITY');
  const expenseAccounts = accounts.filter(a => a.category === 'EXPENSE' || a.category === 'ASSET');

  // Filtered transactions
  const cashTransactions = transactions.filter(t => {
    const isCash = t.type === 'CASH_RECEIPT' || t.type === 'CASH_PAYMENT';
    if (!isCash) return false;

    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesProject = projectFilter === 'ALL' || t.projectId === projectFilter;
    const matchesSearch = 
      t.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.partyName && t.partyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.referenceNo && t.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesProject && matchesSearch;
  });

  const handleOpenAdd = (type: 'CASH_RECEIPT' | 'CASH_PAYMENT') => {
    setModalType(type);
    setDate(new Date().toISOString().split('T')[0]);
    setAccountId(cashAccounts[0]?.id || 'acc-1010');
    setOffsetAccountId(type === 'CASH_RECEIPT' ? incomeAccounts[0]?.id || '' : expenseAccounts[0]?.id || '');
    setAmount('');
    setPartyName('');
    setProjectId('');
    setReferenceNo('');
    setDescription('');
    setSupportingDocRef('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }
    if (!description.trim()) {
      setFormError('Description / narration is required.');
      return;
    }

    addTransaction({
      type: modalType,
      date,
      accountId,
      offsetAccountId: offsetAccountId || undefined,
      amount: Number(amount),
      partyName: partyName.trim() || undefined,
      projectId: projectId || undefined,
      referenceNo: referenceNo.trim() || undefined,
      description: description.trim(),
      supportingDocRef: supportingDocRef.trim() || undefined
    });

    setIsModalOpen(false);
  };

  const handleVoid = (id: string, voucherNo: string) => {
    const reason = prompt(`Enter mandatory reason for voiding/reversing ${voucherNo}:`);
    if (reason && reason.trim()) {
      voidTransaction(id, reason.trim());
    }
  };

  const handleExportExcel = () => {
    const data = cashTransactions.map(t => ({
      'Voucher No': t.voucherNo,
      'Type': t.type,
      'Date': t.date,
      'Cash Account': t.accountName,
      'Counter Account Head': t.offsetAccountName || '',
      'Party (Payer / Payee)': t.partyName || '',
      'Amount (PKR)': t.amount,
      'Associated Project': t.projectName || '',
      'Reference / Bill #': t.referenceNo || '',
      'Narration / Description': t.description,
      'Status': t.status,
      'Void Reason': t.voidReason || ''
    }));
    exportToExcel(data, 'SESWA_Cash_Book_Register', 'CashBook');
  };

  const handleExportPDF = () => {
    const headers = ['Voucher #', 'Date', 'Type', 'Party / Description', 'Account Head', 'Amount (PKR)', 'Status'];
    const rows = cashTransactions.map(t => [
      t.voucherNo,
      formatDate(t.date),
      t.type === 'CASH_RECEIPT' ? 'RECEIPT' : 'PAYMENT',
      t.partyName ? `${t.partyName} - ${t.description}` : t.description,
      t.offsetAccountName || t.accountName,
      formatPKR(t.amount),
      t.status
    ]);
    generatePDFReport(
      'SESWA Cash Book (Receipts & Payments)',
      'Official Cash Register — Central Finance Sector',
      headers,
      rows,
      'l',
      [
        { label: 'Total Cash Receipts', value: formatPKR(cashTransactions.filter(t => t.type === 'CASH_RECEIPT' && t.status === 'POSTED').reduce((s, t) => s + t.amount, 0)) },
        { label: 'Total Cash Payments', value: formatPKR(cashTransactions.filter(t => t.type === 'CASH_PAYMENT' && t.status === 'POSTED').reduce((s, t) => s + t.amount, 0)) }
      ]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <span>Cash Transactions & Cash Book (FR-008)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Record Cash Receipts (CRV) and Cash Payments (CPV) with printable slips, project tagging & controlled reversals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>PDF Cash Book</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel Export</span>
          </button>
          <button
            onClick={() => handleOpenAdd('CASH_RECEIPT')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Cash Receipt</span>
          </button>
          <button
            onClick={() => handleOpenAdd('CASH_PAYMENT')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Cash Payment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search voucher #, party name, narration, bill #..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Cash Vouchers</option>
            <option value="CASH_RECEIPT">Cash Receipts (CRV)</option>
            <option value="CASH_PAYMENT">Cash Payments (CPV)</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Voucher #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Payer / Payee & Narration</th>
                <th className="p-3">Account Head</th>
                <th className="p-3">Project Link</th>
                <th className="p-3 text-right">Amount (PKR)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {cashTransactions.map((tx) => {
                const isReceipt = tx.type === 'CASH_RECEIPT';
                const isVoided = tx.status === 'VOIDED';

                return (
                  <tr key={tx.id} className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition ${isVoided ? 'opacity-50 line-through' : ''}`}>
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {tx.voucherNo}
                    </td>

                    <td className="p-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {formatDate(tx.date)}
                    </td>

                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        isReceipt 
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isReceipt ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {isReceipt ? 'CRV' : 'CPV'}
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {tx.partyName || 'General Party'}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        {tx.description}
                      </div>
                      {tx.referenceNo && (
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Ref: {tx.referenceNo}
                        </div>
                      )}
                      {isVoided && tx.voidReason && (
                        <div className="text-[10px] text-rose-600 font-semibold no-underline">
                          Void Reason: {tx.voidReason}
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-zinc-700 dark:text-zinc-300">
                      <div className="font-medium truncate max-w-[140px]">
                        {tx.offsetAccountName || tx.accountName}
                      </div>
                    </td>

                    <td className="p-3">
                      {tx.projectName ? (
                        <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded font-medium">
                          {tx.projectName}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px] italic">General Operations</span>
                      )}
                    </td>

                    <td className={`p-3 text-right font-mono font-bold text-sm ${
                      isReceipt ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {isReceipt ? '+' : '-'}{formatPKR(tx.amount)}
                    </td>

                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isVoided 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setViewVoucher(tx)}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Slip
                      </button>
                      {!isVoided && (
                        <button
                          onClick={() => handleVoid(tx.id, tx.voucherNo)}
                          title="Controlled Void / Reversal (FR-016)"
                          className="p-1 text-zinc-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cash Transaction Modal */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className={`p-5 text-white flex items-center justify-between ${
              modalType === 'CASH_RECEIPT' ? 'bg-emerald-900' : 'bg-rose-950'
            }`}>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>{modalType === 'CASH_RECEIPT' ? 'Record Cash Receipt Voucher (CRV)' : 'Record Cash Payment Voucher (CPV)'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Transaction Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Amount (PKR) *</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 50000"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono font-bold text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {modalType === 'CASH_RECEIPT' ? 'Received From (Donor / Member / Party) *' : 'Paid To (Vendor / Staff / Payee) *'}
                  </label>
                  <input
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder={modalType === 'CASH_RECEIPT' ? 'e.g. Haji Ghulam Rasool' : 'e.g. Al-Madina Printing Press'}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Primary Cash Account</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    >
                      {cashAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      {modalType === 'CASH_RECEIPT' ? 'Income / Credit Account *' : 'Expense / Debit Account *'}
                    </label>
                    <select
                      value={offsetAccountId}
                      onChange={(e) => setOffsetAccountId(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-medium"
                      required
                    >
                      {(modalType === 'CASH_RECEIPT' ? incomeAccounts : expenseAccounts).map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Link to Project (Optional)</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    >
                      <option value="">-- No Project (General Secretariat) --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Receipt / Invoice / Reference #</label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="e.g. RCPT-1090 / BILL-4412"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Narration / Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide clear transaction purpose for the cash book..."
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg h-16"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Supporting Document Note</label>
                  <input
                    type="text"
                    value={supportingDocRef}
                    onChange={(e) => setSupportingDocRef(e.target.value)}
                    placeholder="e.g. Verified by Health In-Charge / Original Bill Attached"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow ${
                    modalType === 'CASH_RECEIPT' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Post to Cash Book
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
