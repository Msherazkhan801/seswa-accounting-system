'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { 
  Landmark, 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Ban, 
  X,
  Building2
} from 'lucide-react';
import { formatDate, formatPKR } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../utils/exportUtils';

export default function BankTransactionsView() {
  const { 
    transactions, 
    accounts, 
    projects, 
    addTransaction, 
    voidTransaction, 
    setViewVoucher 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, BANK_RECEIPT, BANK_PAYMENT, BANK_TRANSFER
  const [bankAccountFilter, setBankAccountFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'BANK_RECEIPT' | 'BANK_PAYMENT' | 'BANK_TRANSFER'>('BANK_RECEIPT');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(''); // Selected Bank
  const [offsetAccountId, setOffsetAccountId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [partyName, setPartyName] = useState('');
  const [bankName, setBankName] = useState('Meezan Bank Ltd');
  const [chequeNo, setChequeNo] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [supportingDocRef, setSupportingDocRef] = useState('');
  const [formError, setFormError] = useState('');

  // Bank accounts
  const bankAccounts = accounts.filter(a => a.category === 'ASSET' && (a.code.startsWith('102') || a.code.startsWith('103')));
  const allAssetAccounts = accounts.filter(a => a.category === 'ASSET');
  const incomeAccounts = accounts.filter(a => a.category === 'INCOME' || a.category === 'EQUITY' || a.category === 'LIABILITY');
  const expenseAccounts = accounts.filter(a => a.category === 'EXPENSE' || a.category === 'ASSET');

  // Filtered transactions
  const bankTransactions = transactions.filter(t => {
    const isBank = t.type === 'BANK_RECEIPT' || t.type === 'BANK_PAYMENT' || t.type === 'BANK_TRANSFER';
    if (!isBank) return false;

    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesAccount = bankAccountFilter === 'ALL' || t.accountId === bankAccountFilter || t.offsetAccountId === bankAccountFilter;
    const matchesSearch = 
      t.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.partyName && t.partyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.chequeNo && t.chequeNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.referenceNo && t.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesAccount && matchesSearch;
  });

  const handleOpenAdd = (type: 'BANK_RECEIPT' | 'BANK_PAYMENT' | 'BANK_TRANSFER') => {
    setModalType(type);
    setDate(new Date().toISOString().split('T')[0]);
    const firstBank = bankAccounts[0]?.id || '';
    setAccountId(firstBank);
    
    if (type === 'BANK_RECEIPT') {
      setOffsetAccountId(incomeAccounts[0]?.id || '');
    } else if (type === 'BANK_PAYMENT') {
      setOffsetAccountId(expenseAccounts[0]?.id || '');
    } else {
      // Transfer: default to Cash in Hand
      const cashAcc = accounts.find(a => a.code === '1010');
      setOffsetAccountId(cashAcc?.id || '');
    }

    setAmount('');
    setPartyName('');
    setBankName('Meezan Bank Ltd');
    setChequeNo('');
    setReferenceNo('');
    setProjectId('');
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
    if (modalType === 'BANK_TRANSFER' && accountId === offsetAccountId) {
      setFormError('Source and Destination accounts must be different for transfers.');
      return;
    }

    addTransaction({
      type: modalType,
      date,
      accountId,
      offsetAccountId: offsetAccountId || undefined,
      amount: Number(amount),
      partyName: partyName.trim() || (modalType === 'BANK_TRANSFER' ? 'Contra Transfer' : undefined),
      bankName,
      chequeNo: chequeNo.trim() || undefined,
      referenceNo: referenceNo.trim() || undefined,
      projectId: projectId || undefined,
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
    const data = bankTransactions.map(t => ({
      'Voucher No': t.voucherNo,
      'Type': t.type,
      'Date': t.date,
      'Bank Account': t.accountName,
      'Counter Account Head': t.offsetAccountName || '',
      'Cheque / Online Ref': t.chequeNo || t.referenceNo || '',
      'Party': t.partyName || '',
      'Amount (PKR)': t.amount,
      'Associated Project': t.projectName || '',
      'Description': t.description,
      'Status': t.status
    }));
    exportToExcel(data, 'SESWA_Bank_Transactions_Book', 'BankBook');
  };

  const handleExportPDF = () => {
    const headers = ['Voucher #', 'Date', 'Type', 'Bank & Ref', 'Party / Description', 'Amount (PKR)', 'Status'];
    const rows = bankTransactions.map(t => [
      t.voucherNo,
      formatDate(t.date),
      t.type.replace('_', ' '),
      `${t.accountName.split('-')[0]} ${t.chequeNo ? '#' + t.chequeNo : ''}`,
      t.partyName ? `${t.partyName} - ${t.description}` : t.description,
      formatPKR(t.amount),
      t.status
    ]);
    generatePDFReport(
      'SESWA Bank Book & Statements',
      'Official Bank Transaction Register — Meezan Bank & HBL Accounts',
      headers,
      rows,
      'l'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-600" />
            <span>Bank Transactions & Electronic Payments (FR-009)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Record Bank Receipts (BRV), Bank Payments (BPV) and Cash-to-Bank / Inter-Bank Transfers (TRV).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>PDF Bank Book</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel Export</span>
          </button>
          <button
            onClick={() => handleOpenAdd('BANK_RECEIPT')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Bank Receipt</span>
          </button>
          <button
            onClick={() => handleOpenAdd('BANK_PAYMENT')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Bank Payment</span>
          </button>
          <button
            onClick={() => handleOpenAdd('BANK_TRANSFER')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>+ Contra Transfer</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cheque #, ref, party, narration..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="BANK_RECEIPT">Bank Receipts (BRV)</option>
            <option value="BANK_PAYMENT">Bank Payments (BPV)</option>
            <option value="BANK_TRANSFER">Transfers / Contra (TRV)</option>
          </select>

          <select
            value={bankAccountFilter}
            onChange={(e) => setBankAccountFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Bank Accounts</option>
            {bankAccounts.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
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
                <th className="p-3">Bank & Cheque/Ref</th>
                <th className="p-3">Party / Particulars</th>
                <th className="p-3">Offset Account</th>
                <th className="p-3 text-right">Amount (PKR)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {bankTransactions.map((tx) => {
                const isReceipt = tx.type === 'BANK_RECEIPT';
                const isTransfer = tx.type === 'BANK_TRANSFER';
                const isVoided = tx.status === 'VOIDED';

                return (
                  <tr key={tx.id} className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition ${isVoided ? 'opacity-50 line-through' : ''}`}>
                    <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {tx.voucherNo}
                    </td>

                    <td className="p-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {formatDate(tx.date)}
                    </td>

                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        isReceipt ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300' :
                        isTransfer ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isReceipt ? 'BRV' : isTransfer ? 'TRV' : 'BPV'}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {tx.bankName || tx.accountName.split('-')[1]}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {tx.chequeNo ? `Chq: ${tx.chequeNo}` : tx.referenceNo ? `Ref: ${tx.referenceNo}` : 'Online Transfer'}
                      </div>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {tx.partyName || tx.description}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        {tx.description}
                      </div>
                    </td>

                    <td className="p-3 text-zinc-700 dark:text-zinc-300">
                      <div className="font-medium truncate max-w-[140px]">
                        {tx.offsetAccountName || tx.accountName}
                      </div>
                    </td>

                    <td className={`p-3 text-right font-mono font-bold text-sm ${
                      isReceipt ? 'text-emerald-700 dark:text-emerald-400' : isTransfer ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {isReceipt ? '+' : isTransfer ? '↔' : '-'}{formatPKR(tx.amount)}
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
                          className="p-1 text-zinc-400 hover:text-rose-600 rounded"
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

      {/* Add Bank Transaction Modal */}
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
              modalType === 'BANK_RECEIPT' ? 'bg-emerald-900' : modalType === 'BANK_TRANSFER' ? 'bg-blue-900' : 'bg-rose-950'
            }`}>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                <span>
                  {modalType === 'BANK_RECEIPT' ? 'Record Bank Receipt Voucher (BRV)' :
                   modalType === 'BANK_TRANSFER' ? 'Record Contra / Bank Transfer (TRV)' :
                   'Record Bank Payment Voucher (BPV)'}
                </span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-300 hover:text-white">
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
                      placeholder="e.g. 150000"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono font-bold text-sm"
                      required
                    />
                  </div>
                </div>

                {modalType !== 'BANK_TRANSFER' && (
                  <div>
                    <label className="block font-semibold mb-1">
                      {modalType === 'BANK_RECEIPT' ? 'Received From (Payer / Grantor) *' : 'Paid To (Payee / Vendor) *'}
                    </label>
                    <input
                      type="text"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      placeholder={modalType === 'BANK_RECEIPT' ? 'e.g. Global Welfare Trust' : 'e.g. Solar Equipment Suppliers'}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">
                      {modalType === 'BANK_TRANSFER' ? 'Transfer From Account *' : 'Bank Account *'}
                    </label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    >
                      {(modalType === 'BANK_TRANSFER' ? allAssetAccounts : bankAccounts).map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">
                      {modalType === 'BANK_TRANSFER' ? 'Transfer To Account *' : modalType === 'BANK_RECEIPT' ? 'Credit / Income Account *' : 'Debit / Expense Account *'}
                    </label>
                    <select
                      value={offsetAccountId}
                      onChange={(e) => setOffsetAccountId(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-medium"
                      required
                    >
                      {(modalType === 'BANK_TRANSFER' ? allAssetAccounts : modalType === 'BANK_RECEIPT' ? incomeAccounts : expenseAccounts).map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Cheque # (If applicable)</label>
                    <input
                      type="text"
                      value={chequeNo}
                      onChange={(e) => setChequeNo(e.target.value)}
                      placeholder="CHQ-123456"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Online / Bank Reference #</label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="FT-991823"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                {modalType !== 'BANK_TRANSFER' && (
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
                )}

                <div>
                  <label className="block font-semibold mb-1">Narration / Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide clear transaction purpose for the bank book..."
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg h-16"
                    required
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
                    modalType === 'BANK_RECEIPT' ? 'bg-emerald-700 hover:bg-emerald-800' :
                    modalType === 'BANK_TRANSFER' ? 'bg-blue-700 hover:bg-blue-800' :
                    'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Post to Bank Book
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
