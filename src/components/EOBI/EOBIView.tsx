'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EOBIEmployee, EOBIContributionRecord } from '../../types';
import { 
  Receipt, 
  Plus, 
  Search, 
  Users, 
  CheckCircle2, 
  Calendar, 
  FileSpreadsheet, 
  FileText, 
  X, 
  ShieldCheck, 
  Building2,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatPKR } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../utils/exportUtils';

export default function EOBIView() {
  const { 
    eobiEmployees, 
    eobiRecords, 
    accounts, 
    addEOBIEmployee, 
    addEOBIContributionRecord, 
    toggleEOBIEmployeeStatus 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CONTRIBUTIONS' | 'EMPLOYEES'>('CONTRIBUTIONS');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isPayContributionModalOpen, setIsPayContributionModalOpen] = useState(false);

  // Employee Form State
  const [empName, setEmpName] = useState('');
  const [empDesignation, setEmpDesignation] = useState('');
  const [empCnic, setEmpCnic] = useState('');
  const [eobiNo, setEobiNo] = useState('');
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState<number | ''>('');
  const [empError, setEmpError] = useState('');

  // Contribution Form State
  const [month, setMonth] = useState('2026-05');
  const [bankChallanNo, setBankChallanNo] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidFromAccountId, setPaidFromAccountId] = useState('acc-1020'); // Meezan Bank default
  const [contribRemarks, setContribRemarks] = useState('');
  const [contribError, setContribError] = useState('');

  const activeEmployees = eobiEmployees.filter(e => e.isActive);
  const totalMonthlyEmployeeShare = activeEmployees.reduce((sum, e) => sum + (e.basicSalary * e.employeeShareRate), 0);
  const totalMonthlyEmployerShare = activeEmployees.reduce((sum, e) => sum + (e.basicSalary * e.employerShareRate), 0);
  const grandTotalMonthly = totalMonthlyEmployeeShare + totalMonthlyEmployerShare;

  const bankAccounts = accounts.filter(a => a.category === 'ASSET' && (a.code.startsWith('102') || a.code.startsWith('103') || a.code.startsWith('101')));

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empCnic.trim() || !eobiNo.trim() || !basicSalary) {
      setEmpError('Please fill all mandatory employee details and basic salary.');
      return;
    }

    addEOBIEmployee({
      employeeName: empName.trim(),
      designation: empDesignation.trim() || 'Staff',
      cnic: empCnic.trim(),
      eobiNumber: eobiNo.trim(),
      registrationDate: regDate,
      basicSalary: Number(basicSalary),
      employeeShareRate: 0.01, // 1%
      employerShareRate: 0.05, // 5%
      isActive: true
    });

    setIsAddEmployeeModalOpen(false);
  };

  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!month || !bankChallanNo.trim()) {
      setContribError('Month and Bank Challan # are required.');
      return;
    }

    addEOBIContributionRecord({
      month,
      year: Number(month.split('-')[0]),
      totalEmployees: activeEmployees.length,
      employeeShareTotal: totalMonthlyEmployeeShare,
      employerShareTotal: totalMonthlyEmployerShare,
      grandTotal: grandTotalMonthly,
      bankChallanNo: bankChallanNo.trim(),
      paymentDate,
      paidFromAccountId,
      status: 'PAID',
      remarks: contribRemarks.trim() || 'Paid via NBP Online EOBI portal'
    });

    setIsPayContributionModalOpen(false);
  };

  const handleExportExcel = () => {
    const data = eobiRecords.map(r => ({
      'Period (Month)': r.month,
      'Employees Covered': r.totalEmployees,
      'Employee Share 1% (PKR)': r.employeeShareTotal,
      'Employer Share 5% (PKR)': r.employerShareTotal,
      'Total Contribution (PKR)': r.grandTotal,
      'Bank Challan #': r.bankChallanNo || '',
      'Payment Date': r.paymentDate || 'Pending',
      'Status': r.status,
      'Remarks': r.remarks || ''
    }));
    exportToExcel(data, 'SESWA_EOBI_Statutory_Register', 'EOBI');
  };

  const handleExportPDF = () => {
    const headers = ['Month', 'Staff Count', 'Employee 1%', 'Employer 5%', 'Total Dues', 'Challan #', 'Payment Date', 'Status'];
    const rows = eobiRecords.map(r => [
      r.month,
      r.totalEmployees.toString(),
      formatPKR(r.employeeShareTotal),
      formatPKR(r.employerShareTotal),
      formatPKR(r.grandTotal),
      r.bankChallanNo || '—',
      r.paymentDate ? formatDate(r.paymentDate) : 'Pending',
      r.status
    ]);
    generatePDFReport(
      'SESWA EOBI Statutory Contribution Statement',
      'Employees Old-Age Benefits Institution (EOBI) Regional Office Compliance — FY 2026–27',
      headers,
      rows,
      'l',
      [
        { label: 'Registered Staff Count', value: activeEmployees.length.toString() },
        { label: 'Total Statutory Paid (YTD)', value: formatPKR(eobiRecords.filter(r => r.status === 'PAID').reduce((s, r) => s + r.grandTotal, 0)) }
      ]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>EOBI Statutory Contribution Management (FR-012)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Maintain employee EOBI IP registrations, monthly statutory 1% employee & 5% employer contributions, and NBP bank challan payments.
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
          {activeTab === 'CONTRIBUTIONS' ? (
            <button
              onClick={() => {
                setBankChallanNo(`NBP-EOBI-CHL-${Date.now().toString().slice(-6)}`);
                setContribError('');
                setIsPayContributionModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record Monthly EOBI Payment</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEmpName('');
                setEmpDesignation('');
                setEmpCnic('');
                setEobiNo(`EOBI-NW-${Date.now().toString().slice(-6)}`);
                setBasicSalary('');
                setEmpError('');
                setIsAddEmployeeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register Staff for EOBI</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('CONTRIBUTIONS')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'CONTRIBUTIONS'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Monthly Contribution History ({eobiRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'EMPLOYEES'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Staff Roster ({eobiEmployees.length})</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="text-zinc-400 uppercase font-semibold text-[10px]">Active EOBI Employees</span>
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {activeEmployees.length} Enrolled
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Total Wage Base: {formatPKR(activeEmployees.reduce((s, e) => s + e.basicSalary, 0))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="text-zinc-400 uppercase font-semibold text-[10px]">Current Month Rate Breakdown</span>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-1">
            {formatPKR(grandTotalMonthly)}/mo
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Employer (5%): {formatPKR(totalMonthlyEmployerShare)} • Employee (1%): {formatPKR(totalMonthlyEmployeeShare)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="text-zinc-400 uppercase font-semibold text-[10px]">Compliance Institution</span>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            EOBI Regional Directorate KPK
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            National Bank Challan Linked
          </div>
        </div>
      </div>

      {/* TAB 1: MONTHLY CONTRIBUTIONS */}
      {activeTab === 'CONTRIBUTIONS' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b">
                <tr>
                  <th className="p-3">Period (Month)</th>
                  <th className="p-3">Staff Covered</th>
                  <th className="p-3 text-right">Employee 1% Share</th>
                  <th className="p-3 text-right">Employer 5% Share</th>
                  <th className="p-3 text-right font-bold">Total Contribution (PKR)</th>
                  <th className="p-3">Bank Challan #</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {eobiRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="p-3 font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                      {rec.month}
                    </td>

                    <td className="p-3">
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-semibold text-zinc-700 dark:text-zinc-300">
                        {rec.totalEmployees} Staff
                      </span>
                    </td>

                    <td className="p-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                      {formatPKR(rec.employeeShareTotal)}
                    </td>

                    <td className="p-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                      {formatPKR(rec.employerShareTotal)}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-sm text-emerald-800 dark:text-emerald-300">
                      {formatPKR(rec.grandTotal)}
                    </td>

                    <td className="p-3 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {rec.bankChallanNo || '—'}
                    </td>

                    <td className="p-3 whitespace-nowrap text-zinc-500">
                      {rec.paymentDate ? formatDate(rec.paymentDate) : 'Pending Due'}
                    </td>

                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED EMPLOYEES */}
      {activeTab === 'EMPLOYEES' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b">
                <tr>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">CNIC & EOBI Registration #</th>
                  <th className="p-3 text-right">Basic Salary (PKR)</th>
                  <th className="p-3 text-right">Employee 1% Deduction</th>
                  <th className="p-3 text-right">Employer 5% Contribution</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {eobiEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                      {emp.employeeName}
                    </td>

                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      {emp.designation}
                    </td>

                    <td className="p-3">
                      <div className="font-mono text-zinc-800 dark:text-zinc-200">{emp.cnic}</div>
                      <div className="text-[10px] text-emerald-600 font-mono font-bold">{emp.eobiNumber}</div>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatPKR(emp.basicSalary)}
                    </td>

                    <td className="p-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                      {formatPKR(emp.basicSalary * emp.employeeShareRate)}
                    </td>

                    <td className="p-3 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatPKR(emp.basicSalary * emp.employerShareRate)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleEOBIEmployeeStatus(emp.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                          emp.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800'
                        }`}
                      >
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Monthly EOBI Payment Modal */}
      {isPayContributionModalOpen && (
        <div 
          onClick={() => setIsPayContributionModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <span>Record Monthly EOBI Payment</span>
              </h2>
              <button onClick={() => setIsPayContributionModalOpen(false)} className="text-zinc-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContribution} className="p-6 space-y-4">
              {contribError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {contribError}
                </div>
              )}

              {/* Calculated summary box */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Covered Active Employees:</span>
                  <span className="font-bold">{activeEmployees.length} Staff</span>
                </div>
                <div className="flex justify-between">
                  <span>Employer Share (5%):</span>
                  <span className="font-mono font-semibold">{formatPKR(totalMonthlyEmployerShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Employee Share (1%):</span>
                  <span className="font-mono font-semibold">{formatPKR(totalMonthlyEmployeeShare)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200 dark:border-emerald-800 font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  <span>Total Payable:</span>
                  <span className="font-mono">{formatPKR(grandTotalMonthly)}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Contribution Month *</label>
                    <input
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Payment Date *</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Bank Challan / Reference # *</label>
                  <input
                    type="text"
                    value={bankChallanNo}
                    onChange={(e) => setBankChallanNo(e.target.value)}
                    placeholder="e.g. NBP-EOBI-CHL-0526"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Paid From Bank Account (Auto-Post BPV)</label>
                  <select
                    value={paidFromAccountId}
                    onChange={(e) => setPaidFromAccountId(e.target.value)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-medium"
                  >
                    {bankAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Remarks / Reference</label>
                  <textarea
                    value={contribRemarks}
                    onChange={(e) => setContribRemarks(e.target.value)}
                    placeholder="Paid via National Bank of Pakistan branch..."
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg h-16"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsPayContributionModalOpen(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow"
                >
                  Record & Post Payment
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Register Staff for EOBI Modal */}
      {isAddEmployeeModalOpen && (
        <div 
          onClick={() => setIsAddEmployeeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Register Staff for EOBI</span>
              </h2>
              <button onClick={() => setIsAddEmployeeModalOpen(false)} className="text-zinc-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              {empError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {empError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Employee Full Name *</label>
                  <input
                    type="text"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Asadullah Shah"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    placeholder="e.g. Field Coordinator"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">CNIC (XXXXX-XXXXXXX-X) *</label>
                    <input
                      type="text"
                      value={empCnic}
                      onChange={(e) => setEmpCnic(e.target.value)}
                      placeholder="12101-1234567-1"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">EOBI Registration IP # *</label>
                    <input
                      type="text"
                      value={eobiNo}
                      onChange={(e) => setEobiNo(e.target.value)}
                      placeholder="EOBI-NW-12345"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Basic Salary (PKR) *</label>
                    <input
                      type="number"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 40000"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Registration Date</label>
                    <input
                      type="date"
                      value={regDate}
                      onChange={(e) => setRegDate(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow"
                >
                  Save Registration
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
