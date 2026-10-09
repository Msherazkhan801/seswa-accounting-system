'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffLoan } from '../../types';
import { 
  BadgePercent, 
  Plus, 
  Search, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  FileSpreadsheet, 
  FileText, 
  X, 
  Clock, 
  User,
  ArrowDownLeft
} from 'lucide-react';
import { formatDate, formatPKR } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../utils/exportUtils';

export default function StaffLoansView() {
  const { staffLoans, accounts, issueStaffLoan, recordLoanRepayment } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLoan, setSelectedLoan] = useState<StaffLoan | null>(null);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

  // Issue Loan Form
  const [staffName, setStaffName] = useState('');
  const [staffDesignation, setStaffDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [principalAmount, setPrincipalAmount] = useState<number | ''>('');
  const [monthlyDeduction, setMonthlyDeduction] = useState<number | ''>('');
  const [disbursementAccountId, setDisbursementAccountId] = useState('acc-1010');
  const [reason, setReason] = useState('');
  const [issueError, setIssueError] = useState('');

  // Repayment Form
  const [repayDate, setRepayDate] = useState(new Date().toISOString().split('T')[0]);
  const [repayAmount, setRepayAmount] = useState<number | ''>('');
  const [repayMethod, setRepayMethod] = useState<'SALARY_DEDUCTION' | 'CASH' | 'BANK'>('SALARY_DEDUCTION');
  const [repayRef, setRepayRef] = useState('');
  const [repayNotes, setRepayNotes] = useState('');
  const [repayError, setRepayError] = useState('');

  const cashAndBankAccounts = accounts.filter(a => a.category === 'ASSET' && (a.code.startsWith('101') || a.code.startsWith('102')));

  const filteredLoans = staffLoans.filter(l => {
    const matchesSearch = 
      l.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.loanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.staffDesignation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenIssue = () => {
    setStaffName('');
    setStaffDesignation('');
    setPhone('');
    setCnic('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setPrincipalAmount('');
    setMonthlyDeduction('');
    setDisbursementAccountId(cashAndBankAccounts[0]?.id || 'acc-1010');
    setReason('');
    setIssueError('');
    setIsIssueModalOpen(true);
  };

  const handleSaveIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !principalAmount || Number(principalAmount) <= 0) {
      setIssueError('Staff Name and valid principal amount are required.');
      return;
    }

    issueStaffLoan({
      staffName: staffName.trim(),
      staffDesignation: staffDesignation.trim() || 'Staff Member',
      phone: phone.trim() || undefined,
      cnic: cnic.trim() || undefined,
      issueDate,
      principalAmount: Number(principalAmount),
      monthlyDeduction: Number(monthlyDeduction) || Math.round(Number(principalAmount) / 6),
      disbursementAccountId,
      reason: reason.trim() || 'Staff Welfare Loan'
    });

    setIsIssueModalOpen(false);
  };

  const handleOpenRepay = (loan: StaffLoan) => {
    setSelectedLoan(loan);
    setRepayDate(new Date().toISOString().split('T')[0]);
    setRepayAmount(loan.monthlyDeduction || Math.min(5000, loan.outstandingBalance));
    setRepayMethod('SALARY_DEDUCTION');
    setRepayRef(`REP-${loan.loanNo}-${loan.repayments.length + 1}`);
    setRepayNotes('Monthly installment');
    setRepayError('');
    setIsRepayModalOpen(true);
  };

  const handleSaveRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !repayAmount || Number(repayAmount) <= 0) {
      setRepayError('Valid repayment amount is required.');
      return;
    }
    if (Number(repayAmount) > selectedLoan.outstandingBalance) {
      setRepayError(`Repayment amount cannot exceed outstanding balance of ${formatPKR(selectedLoan.outstandingBalance)}.`);
      return;
    }

    recordLoanRepayment(selectedLoan.id, {
      date: repayDate,
      amount: Number(repayAmount),
      paymentMethod: repayMethod,
      receiptRef: repayRef.trim() || undefined,
      notes: repayNotes.trim() || undefined
    });

    setIsRepayModalOpen(false);
    setSelectedLoan(null);
  };

  const handleExportExcel = () => {
    const data = filteredLoans.map(l => ({
      'Loan No': l.loanNo,
      'Staff Name': l.staffName,
      'Designation': l.staffDesignation,
      'Issue Date': l.issueDate,
      'Principal Amount (PKR)': l.principalAmount,
      'Monthly Deduction (PKR)': l.monthlyDeduction,
      'Total Repaid (PKR)': l.repaidAmount,
      'Outstanding Balance (PKR)': l.outstandingBalance,
      'Status': l.status,
      'Reason': l.reason
    }));
    exportToExcel(data, 'SESWA_Staff_Loans_Master_Report', 'StaffLoans');
  };

  const handleExportPDF = () => {
    const headers = ['Loan #', 'Staff Member', 'Issue Date', 'Principal', 'Repaid', 'Outstanding', 'Status'];
    const rows = filteredLoans.map(l => [
      l.loanNo,
      `${l.staffName} (${l.staffDesignation})`,
      formatDate(l.issueDate),
      formatPKR(l.principalAmount),
      formatPKR(l.repaidAmount),
      formatPKR(l.outstandingBalance),
      l.status
    ]);
    generatePDFReport(
      'SESWA Staff Loans & Welfare Register',
      'Authorized Staff Advances & Repayments Status — FY 2026–27',
      headers,
      rows,
      'l',
      [
        { label: 'Total Principal Disbursed', value: formatPKR(filteredLoans.reduce((s, l) => s + l.principalAmount, 0)) },
        { label: 'Total Outstanding Receivables', value: formatPKR(filteredLoans.reduce((s, l) => s + l.outstandingBalance, 0)) }
      ]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BadgePercent className="w-6 h-6 text-amber-500" />
            <span>Staff Loans & Welfare Advances (FR-011)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track interest-free staff loans, monthly salary deductions, repayment installments & outstanding balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>PDF Statement</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleOpenIssue}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Issue Staff Loan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff name, loan #, designation..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Loans</option>
            <option value="ACTIVE">Active (Outstanding)</option>
            <option value="PAID">Fully Repaid</option>
          </select>
        </div>
      </div>

      {/* Staff Loans Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Loan #</th>
                <th className="p-3">Staff Member</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3 text-right">Principal Amount</th>
                <th className="p-3 text-right">Monthly Deduction</th>
                <th className="p-3 text-right">Repaid (PKR)</th>
                <th className="p-3 text-right font-bold text-amber-900 dark:text-amber-200">Outstanding Balance</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                  <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                    {loan.loanNo}
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">
                      {loan.staffName}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {loan.staffDesignation} {loan.phone ? `• ${loan.phone}` : ''}
                    </div>
                  </td>

                  <td className="p-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {formatDate(loan.issueDate)}
                  </td>

                  <td className="p-3 text-right font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatPKR(loan.principalAmount)}
                  </td>

                  <td className="p-3 text-right font-mono text-zinc-500">
                    {formatPKR(loan.monthlyDeduction)}/mo
                  </td>

                  <td className="p-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatPKR(loan.repaidAmount)}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
                    {formatPKR(loan.outstandingBalance)}
                  </td>

                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      loan.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {loan.status}
                    </span>
                  </td>

                  <td className="p-3 text-right space-x-1 whitespace-nowrap">
                    {loan.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleOpenRepay(loan)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition cursor-pointer"
                      >
                        + Repay
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-semibold transition cursor-pointer"
                    >
                      History ({loan.repayments.length})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loan History Drawer / Modal */}
      {selectedLoan && !isRepayModalOpen && (
        <div 
          onClick={() => setSelectedLoan(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-sm bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded">
                  {selectedLoan.loanNo}
                </span>
                <h2 className="text-lg font-bold mt-1">{selectedLoan.staffName} ({selectedLoan.staffDesignation})</h2>
                <p className="text-xs text-emerald-200">Reason: {selectedLoan.reason}</p>
              </div>

              <button onClick={() => setSelectedLoan(null)} className="p-1.5 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <span className="text-zinc-400">Principal Disbursed</span>
                  <div className="font-bold text-base font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                    {formatPKR(selectedLoan.principalAmount)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950">
                  <span className="text-emerald-700 dark:text-emerald-300">Total Repaid</span>
                  <div className="font-bold text-base font-mono text-emerald-800 dark:text-emerald-200 mt-1">
                    {formatPKR(selectedLoan.repaidAmount)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950">
                  <span className="text-amber-700 dark:text-amber-300">Outstanding Balance</span>
                  <div className="font-bold text-base font-mono text-amber-800 dark:text-amber-200 mt-1">
                    {formatPKR(selectedLoan.outstandingBalance)}
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 pt-2">
                Repayment Installments Log
              </h3>

              <table className="w-full text-left text-xs border rounded-lg overflow-hidden">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Receipt / Slip Ref</th>
                    <th className="p-2.5">Remarks</th>
                    <th className="p-2.5 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedLoan.repayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-zinc-400">
                        No repayment installments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    selectedLoan.repayments.map((rep) => (
                      <tr key={rep.id}>
                        <td className="p-2.5 whitespace-nowrap">{formatDate(rep.date)}</td>
                        <td className="p-2.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                            {rep.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-zinc-700 dark:text-zinc-300">{rep.receiptRef || '—'}</td>
                        <td className="p-2.5 text-zinc-500">{rep.notes || '—'}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {formatPKR(rep.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Issue Staff Loan Modal */}
      {isIssueModalOpen && (
        <div 
          onClick={() => setIsIssueModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-amber-400" />
                <span>Issue Staff Welfare Loan</span>
              </h2>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-zinc-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIssue} className="p-6 space-y-4">
              {issueError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {issueError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Staff Member Name *</label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="e.g. Asadullah Shah"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Designation</label>
                    <input
                      type="text"
                      value={staffDesignation}
                      onChange={(e) => setStaffDesignation(e.target.value)}
                      placeholder="e.g. Field Officer"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300..."
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Loan Principal (PKR) *</label>
                    <input
                      type="number"
                      value={principalAmount}
                      onChange={(e) => setPrincipalAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 40000"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Monthly Deduction</label>
                    <input
                      type="number"
                      value={monthlyDeduction}
                      onChange={(e) => setMonthlyDeduction(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 5000"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Disbursement Date</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Disbursed From</label>
                    <select
                      value={disbursementAccountId}
                      onChange={(e) => setDisbursementAccountId(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    >
                      {cashAndBankAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Loan Reason / Terms</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Emergency family hospitalization / home repair..."
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg h-16"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow"
                >
                  Issue & Post Disbursement
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Record Repayment Modal */}
      {isRepayModalOpen && selectedLoan && (
        <div 
          onClick={() => setIsRepayModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-amber-400" />
                <span>Record Loan Repayment ({selectedLoan.loanNo})</span>
              </h2>
              <button onClick={() => setIsRepayModalOpen(false)} className="text-zinc-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRepay} className="p-6 space-y-4">
              {repayError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {repayError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Staff Member:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedLoan.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatPKR(selectedLoan.outstandingBalance)}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Repayment Date *</label>
                    <input
                      type="date"
                      value={repayDate}
                      onChange={(e) => setRepayDate(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Amount (PKR) *</label>
                    <input
                      type="number"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Payment Method</label>
                  <select
                    value={repayMethod}
                    onChange={(e) => setRepayMethod(e.target.value as any)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  >
                    <option value="SALARY_DEDUCTION">Monthly Salary Deduction</option>
                    <option value="CASH">Direct Cash Payment</option>
                    <option value="BANK">Bank Deposit / Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Receipt / Slip Reference</label>
                  <input
                    type="text"
                    value={repayRef}
                    onChange={(e) => setRepayRef(e.target.value)}
                    placeholder="e.g. SAL-DED-0426"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Remarks / Notes</label>
                  <input
                    type="text"
                    value={repayNotes}
                    onChange={(e) => setRepayNotes(e.target.value)}
                    placeholder="Installment #4"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsRepayModalOpen(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow"
                >
                  Record Repayment
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
