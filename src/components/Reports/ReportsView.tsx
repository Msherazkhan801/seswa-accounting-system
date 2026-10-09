'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileBarChart, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Filter, 
  Download, 
  Printer,
  Scale,
  Award,
  Users,
  Wallet,
  Landmark,
  BadgePercent,
  Receipt,
  FolderKanban
} from 'lucide-react';
import { formatDate, formatPKR, getDaysRemaining, formatNumber } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../utils/exportUtils';

export default function ReportsView() {
  const { 
    transactions, 
    accounts, 
    projects, 
    members, 
    sectors, 
    elections, 
    staffLoans, 
    eobiRecords, 
    stats 
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<string>('CASH_BOOK');
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  // Report Categories & Definitions
  const reportDefinitions = [
    {
      category: 'FINANCIAL REPORTS',
      items: [
        { id: 'CASH_BOOK', name: 'Cash Book (Receipts & Payments)', icon: Wallet },
        { id: 'BANK_BOOK', name: 'Bank Transaction Book / Statements', icon: Landmark },
        { id: 'TRIAL_BALANCE', name: 'Trial Balance Statement', icon: Scale },
        { id: 'INCOME_EXPENSE', name: 'Income & Expenditure Statement', icon: FileBarChart },
        { id: 'PROJECT_FINANCE', name: 'Project Budget vs Actuals Statement', icon: FolderKanban },
        { id: 'STAFF_LOANS', name: 'Staff Welfare Loans Summary', icon: BadgePercent },
        { id: 'EOBI_REPORT', name: 'EOBI Statutory Contribution Report', icon: Receipt }
      ]
    },
    {
      category: 'GOVERNANCE & MEMBER REPORTS',
      items: [
        { id: 'MEMBERS_DIRECTORY', name: 'Members Directory & Status Report', icon: Users },
        { id: 'SECTOR_HOLDERS', name: 'Sector Holders & 1-Year Terms Roster', icon: Award },
        { id: 'EXPIRED_TERMS', name: 'Expired Terms & Renewal Schedule', icon: Calendar },
        { id: 'ELECTION_HISTORY', name: 'Constitutional Election Archives', icon: FileText }
      ]
    }
  ];

  // Filter transactions by date range
  const filteredTx = transactions.filter(t => {
    if (t.status !== 'POSTED') return false;
    return t.date >= dateFrom && t.date <= dateTo;
  });

  // Export handlers based on current report
  const handleExportPDF = () => {
    switch (selectedReport) {
      case 'CASH_BOOK': {
        const headers = ['Voucher #', 'Date', 'Type', 'Party / Description', 'Account', 'Amount (PKR)'];
        const rows = filteredTx
          .filter(t => t.type === 'CASH_RECEIPT' || t.type === 'CASH_PAYMENT')
          .map(t => [
            t.voucherNo,
            formatDate(t.date),
            t.type === 'CASH_RECEIPT' ? 'CRV' : 'CPV',
            t.partyName ? `${t.partyName} - ${t.description}` : t.description,
            t.offsetAccountName || t.accountName,
            formatPKR(t.amount)
          ]);
        generatePDFReport(
          'SESWA Official Cash Book',
          `Period: ${formatDate(dateFrom)} to ${formatDate(dateTo)}`,
          headers,
          rows,
          'l',
          [
            { label: 'Total Cash Receipts', value: formatPKR(filteredTx.filter(t => t.type === 'CASH_RECEIPT').reduce((s, t) => s + t.amount, 0)) },
            { label: 'Total Cash Payments', value: formatPKR(filteredTx.filter(t => t.type === 'CASH_PAYMENT').reduce((s, t) => s + t.amount, 0)) }
          ]
        );
        break;
      }
      case 'BANK_BOOK': {
        const headers = ['Voucher #', 'Date', 'Type', 'Bank & Ref', 'Particulars', 'Amount (PKR)'];
        const rows = filteredTx
          .filter(t => t.type === 'BANK_RECEIPT' || t.type === 'BANK_PAYMENT' || t.type === 'BANK_TRANSFER')
          .map(t => [
            t.voucherNo,
            formatDate(t.date),
            t.type.replace('_', ' '),
            `${t.bankName || t.accountName.split('-')[0]} ${t.chequeNo ? '#' + t.chequeNo : ''}`,
            t.partyName ? `${t.partyName} - ${t.description}` : t.description,
            formatPKR(t.amount)
          ]);
        generatePDFReport(
          'SESWA Bank Transactions Book',
          `Period: ${formatDate(dateFrom)} to ${formatDate(dateTo)}`,
          headers,
          rows,
          'l'
        );
        break;
      }
      case 'TRIAL_BALANCE': {
        const headers = ['Code', 'Account Title', 'Category', 'Closing Debit (PKR)', 'Closing Credit (PKR)'];
        const rows = accounts.map(a => [
          a.code,
          a.name,
          a.category,
          a.category === 'ASSET' || a.category === 'EXPENSE' ? formatPKR(a.currentBalance) : '—',
          a.category === 'LIABILITY' || a.category === 'EQUITY' || a.category === 'INCOME' ? formatPKR(a.currentBalance) : '—'
        ]);
        generatePDFReport(
          'SESWA Trial Balance Statement',
          `As of ${formatDate(new Date().toISOString())}`,
          headers,
          rows,
          'p'
        );
        break;
      }
      case 'SECTOR_HOLDERS': {
        const headers = ['Sector / Position', 'Department', 'Elected Member', 'Term Start', 'Term End', 'Days Left'];
        const rows = sectors.map(s => {
          const elec = elections.find(e => e.sectorId === s.id && e.status === 'ACTIVE');
          return [
            s.name,
            s.department,
            elec ? elec.memberName : 'VACANT',
            elec ? formatDate(elec.termStartDate) : '—',
            elec ? formatDate(elec.termEndDate) : '—',
            elec ? getDaysRemaining(elec.termEndDate).toString() : '—'
          ];
        });
        generatePDFReport(
          'SESWA Active 1-Year Sector Holders Roster',
          `Constitutional Term Roster — Fiscal Year 2026–27`,
          headers,
          rows,
          'l'
        );
        break;
      }
      default: {
        alert('PDF generated for ' + selectedReport);
      }
    }
  };

  const handleExportExcel = () => {
    switch (selectedReport) {
      case 'CASH_BOOK': {
        const data = filteredTx
          .filter(t => t.type === 'CASH_RECEIPT' || t.type === 'CASH_PAYMENT')
          .map(t => ({
            'Voucher #': t.voucherNo,
            'Date': t.date,
            'Type': t.type,
            'Cash Account': t.accountName,
            'Counter Head': t.offsetAccountName || '',
            'Party': t.partyName || '',
            'Amount (PKR)': t.amount,
            'Project': t.projectName || '',
            'Narration': t.description
          }));
        exportToExcel(data, 'SESWA_Cash_Book_Report', 'CashBook');
        break;
      }
      case 'BANK_BOOK': {
        const data = filteredTx
          .filter(t => t.type.startsWith('BANK'))
          .map(t => ({
            'Voucher #': t.voucherNo,
            'Date': t.date,
            'Type': t.type,
            'Bank Account': t.accountName,
            'Cheque / Ref': t.chequeNo || t.referenceNo || '',
            'Party': t.partyName || '',
            'Amount (PKR)': t.amount,
            'Narration': t.description
          }));
        exportToExcel(data, 'SESWA_Bank_Book_Report', 'BankBook');
        break;
      }
      case 'SECTOR_HOLDERS': {
        const data = sectors.map(s => {
          const elec = elections.find(e => e.sectorId === s.id && e.status === 'ACTIVE');
          return {
            'Sector Code': s.code,
            'Sector Name': s.name,
            'Department': s.department,
            'Elected Member': elec ? elec.memberName : 'VACANT',
            'Term Start': elec ? elec.termStartDate : '',
            'Term End': elec ? elec.termEndDate : '',
            'Days Remaining': elec ? getDaysRemaining(elec.termEndDate) : ''
          };
        });
        exportToExcel(data, 'SESWA_Sector_Holders_Report', 'Sectors');
        break;
      }
      default: {
        alert('Exporting Excel for ' + selectedReport);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-emerald-600" />
            <span>Financial & Governance Reports Suite (FR-014)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Generate formal accounting reports, cash & bank statements, trial balance, and 1-year member election rosters in PDF & Excel formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Report Selection and Date Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Col: Report Navigation Selector */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Select Report Template
          </h2>

          <div className="space-y-4">
            {reportDefinitions.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                  {cat.category}
                </h3>
                <div className="space-y-0.5">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedReport === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedReport(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                          isSelected
                            ? 'bg-emerald-700 text-white font-bold shadow-sm'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                        <span className="truncate">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3 Cols: Report Live Preview & Interactive Grid */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-sm">
          
          {/* Report Meta & Date Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-[10px] bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded uppercase">
                SESWA Official Statement
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {reportDefinitions.flatMap(c => c.items).find(i => i.id === selectedReport)?.name}
              </h2>
              <p className="text-xs text-zinc-500">
                Prepared by: Atta Ullah Khan (Authorized Finance Secretary)
              </p>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="p-1.5 bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="p-1.5 bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* REPORT PREVIEW: CASH BOOK */}
          {selectedReport === 'CASH_BOOK' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-800 dark:text-emerald-300">Total Period Receipts</span>
                  <div className="text-lg font-black font-mono text-emerald-900 dark:text-emerald-200 mt-1">
                    {formatPKR(filteredTx.filter(t => t.type === 'CASH_RECEIPT').reduce((s, t) => s + t.amount, 0))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="text-rose-800 dark:text-rose-300">Total Period Payments</span>
                  <div className="text-lg font-black font-mono text-rose-900 dark:text-rose-200 mt-1">
                    {formatPKR(filteredTx.filter(t => t.type === 'CASH_PAYMENT').reduce((s, t) => s + t.amount, 0))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 border-b text-zinc-700 dark:text-zinc-300 font-semibold">
                    <tr>
                      <th className="p-2.5">Voucher #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Payer / Payee & Narration</th>
                      <th className="p-2.5">Account Head</th>
                      <th className="p-2.5 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTx.filter(t => t.type === 'CASH_RECEIPT' || t.type === 'CASH_PAYMENT').map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-2.5 font-mono font-bold text-emerald-700">{tx.voucherNo}</td>
                        <td className="p-2.5 whitespace-nowrap">{formatDate(tx.date)}</td>
                        <td className="p-2.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            tx.type === 'CASH_RECEIPT' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {tx.type === 'CASH_RECEIPT' ? 'RECEIPT' : 'PAYMENT'}
                          </span>
                        </td>
                        <td className="p-2.5">{tx.partyName || tx.description}</td>
                        <td className="p-2.5 text-zinc-500">{tx.offsetAccountName || tx.accountName}</td>
                        <td className={`p-2.5 text-right font-mono font-bold ${
                          tx.type === 'CASH_RECEIPT' ? 'text-emerald-700' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {tx.type === 'CASH_RECEIPT' ? '+' : '-'}{formatPKR(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT PREVIEW: SECTOR HOLDERS */}
          {selectedReport === 'SECTOR_HOLDERS' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 border-b font-semibold">
                    <tr>
                      <th className="p-3">Sector Code</th>
                      <th className="p-3">Sector / Position Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Current Elected Member (1-Year Term)</th>
                      <th className="p-3">Term Period</th>
                      <th className="p-3 text-right">Days Left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sectors.map(s => {
                      const elec = elections.find(e => e.sectorId === s.id && e.status === 'ACTIVE');
                      const days = elec ? getDaysRemaining(elec.termEndDate) : 0;
                      return (
                        <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="p-3 font-mono font-bold text-emerald-700">{s.code}</td>
                          <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">{s.name}</td>
                          <td className="p-3 text-zinc-500">{s.department}</td>
                          <td className="p-3">
                            {elec ? (
                              <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                                {elec.memberName}
                              </div>
                            ) : (
                              <span className="text-rose-600 font-semibold italic">VACANT</span>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap text-zinc-600">
                            {elec ? `${formatDate(elec.termStartDate)} → ${formatDate(elec.termEndDate)}` : '—'}
                          </td>
                          <td className="p-3 text-right">
                            {elec ? (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                days <= 30 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {days} Days Left
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT PREVIEW: INCOME & EXPENDITURE STATEMENT */}
          {selectedReport === 'INCOME_EXPENSE' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Income side */}
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <h3 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm pb-2 border-b border-emerald-200">
                    INCOME & COLLECTIONS
                  </h3>
                  {accounts.filter(a => a.category === 'INCOME').map(acc => (
                    <div key={acc.id} className="flex justify-between">
                      <span className="text-zinc-700 dark:text-zinc-300">{acc.name}</span>
                      <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">{formatPKR(acc.currentBalance)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t flex justify-between font-extrabold text-sm text-emerald-950 dark:text-emerald-200">
                    <span>Total Income:</span>
                    <span className="font-mono">{formatPKR(stats.totalIncome)}</span>
                  </div>
                </div>

                {/* Expenses side */}
                <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-3">
                  <h3 className="font-bold text-rose-950 dark:text-rose-200 text-sm pb-2 border-b border-rose-200">
                    PROGRAM & ADMIN EXPENDITURES
                  </h3>
                  {accounts.filter(a => a.category === 'EXPENSE').map(acc => (
                    <div key={acc.id} className="flex justify-between">
                      <span className="text-zinc-700 dark:text-zinc-300">{acc.name}</span>
                      <span className="font-mono font-bold text-rose-900 dark:text-rose-200">{formatPKR(acc.currentBalance)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t flex justify-between font-extrabold text-sm text-rose-950 dark:text-rose-200">
                    <span>Total Expenditures:</span>
                    <span className="font-mono">{formatPKR(stats.totalExpense)}</span>
                  </div>
                </div>

              </div>

              {/* Net Surplus Box */}
              <div className="p-4 bg-emerald-900 text-white rounded-xl flex items-center justify-between font-bold text-sm">
                <span>NET OPERATIONAL SURPLUS / (DEFICIT) FOR FY 2026–27:</span>
                <span className="font-mono text-lg text-amber-300">{formatPKR(stats.netSurplus)}</span>
              </div>
            </div>
          )}

          {/* Default Table for other reports */}
          {selectedReport !== 'CASH_BOOK' && selectedReport !== 'SECTOR_HOLDERS' && selectedReport !== 'INCOME_EXPENSE' && (
            <div className="p-8 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed">
              <p className="text-xs">
                Click <strong>"Download Official PDF"</strong> or <strong>"Export to Excel"</strong> above to generate the full certified statement for {selectedReport}.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
