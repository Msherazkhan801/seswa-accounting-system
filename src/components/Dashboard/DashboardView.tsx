'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
  Scale,
  Users,
  Grid3X3,
  Award,
  AlertTriangle,
  FolderKanban,
  BadgePercent,
  Receipt,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { formatDate, formatPKR, getDaysRemaining } from '../../utils/formatters';

export default function DashboardView() {
  const { 
    stats, 
    transactions, 
    projects, 
    elections, 
    members, 
    sectors, 
    setActiveTab, 
    setViewVoucher 
  } = useApp();

  const recentTransactions = transactions.slice(0, 6);

  // Expiring terms in next 30 days
  const expiringElections = elections.filter(e => {
    if (e.status !== 'ACTIVE') return false;
    const days = getDaysRemaining(e.termEndDate);
    return days >= 0 && days <= 45;
  });

  return (
    <div className="space-y-6">
      
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-xs font-semibold text-amber-300 mb-2">
            <span>Fiscal Year 2026–27</span>
            <span>•</span>
            <span>SESWA Central Accounting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Finance & Governance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mt-1">
            Welcome, <span className="font-bold text-amber-300">Atta Ullah Khan</span> (Authorized Finance User). Real-time financial liquidity, 1-year sector election terms, and project expenditures.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="relative z-10 flex flex-wrap sm:flex-col gap-2">
          <button
            onClick={() => setActiveTab('cash')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Cash Tx</span>
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-950 text-white rounded-xl font-semibold text-xs border border-emerald-700 transition cursor-pointer"
          >
            <Landmark className="w-4 h-4 text-emerald-300" />
            <span>Record Bank Tx</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Term Expiry Alert Banner (if applicable) */}
      {expiringElections.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                1-Year Election Term Expiry Notice ({expiringElections.length} Position{expiringElections.length > 1 ? 's' : ''})
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                The following sector tenure is nearing completion or requires renewal per SESWA 1-year term constitution:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {expiringElections.map(elec => {
                  const days = getDaysRemaining(elec.termEndDate);
                  return (
                    <span
                      key={elec.id}
                      onClick={() => setActiveTab('elections')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 text-xs font-semibold rounded-lg cursor-pointer hover:bg-amber-200 transition"
                    >
                      <span>{elec.sectorName}:</span>
                      <span className="font-bold text-emerald-900 dark:text-emerald-300">{elec.memberName}</span>
                      <span suppressHydrationWarning className="text-[10px] bg-amber-500 text-emerald-950 font-bold px-1.5 py-0.2 rounded-full">
                        {days <= 0 ? 'Expired' : `${days}d left`}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('elections')}
            className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0 hidden sm:block"
          >
            Manage Elections →
          </button>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cash in Hand */}
        <div 
          onClick={() => setActiveTab('cash')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Cash in Hand
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {formatPKR(stats.cashInHand)}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Physical Safe Balance</span>
            </div>
          </div>
        </div>

        {/* Bank Balances */}
        <div 
          onClick={() => setActiveTab('bank')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Bank Accounts
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {formatPKR(stats.bankBalance)}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Meezan Bank & HBL Accounts
            </div>
          </div>
        </div>

        {/* Total Income FY 26-27 */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Receipts (Income)
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
              {formatPKR(stats.totalIncome)}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Donations, Zakat, Grants & Fees
            </div>
          </div>
        </div>

        {/* Total Expenses / Disbursements */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Disbursements
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
              {formatPKR(stats.totalExpense)}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Net Surplus: <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatPKR(stats.netSurplus)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Metric Bar: Governance & Personnel Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setActiveTab('members')}
          className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stats.activeMembersCount}</div>
            <div className="text-[11px] text-zinc-500">Active Members</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('sectors')}
          className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stats.activeSectorsCount}</div>
            <div className="text-[11px] text-zinc-500">Organizational Sectors</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('loans')}
          className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">{formatPKR(stats.outstandingLoansTotal)}</div>
            <div className="text-[11px] text-zinc-500">Outstanding Staff Loans</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('projects')}
          className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-600/10 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stats.activeProjectsCount}</div>
            <div className="text-[11px] text-zinc-500">Active Sector Projects</div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Active Sector Holders & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Transactions with Slip View Trigger */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Recent Financial Activity (Cash Book & Bank Book)
              </h2>
              <p className="text-xs text-zinc-500">Latest posted vouchers across all accounts</p>
            </div>
            <button
              onClick={() => setActiveTab('cash')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View Cash Book</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Voucher #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Type & Account</th>
                  <th className="p-2.5">Party / Description</th>
                  <th className="p-2.5 text-right">Amount (PKR)</th>
                  <th className="p-2.5 text-center rounded-r-lg">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentTransactions.map((tx) => {
                  const isReceipt = tx.type.includes('RECEIPT');
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                      <td className="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {tx.voucherNo}
                      </td>
                      <td className="p-2.5 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mr-1 ${
                          isReceipt 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[140px]">
                          {tx.accountName}
                        </div>
                      </td>
                      <td className="p-2.5 max-w-[200px]">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                          {tx.partyName || tx.description}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {tx.description}
                        </div>
                      </td>
                      <td className={`p-2.5 text-right font-mono font-bold ${
                        isReceipt ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-200'
                      }`}>
                        {isReceipt ? '+' : '-'}{formatPKR(tx.amount)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => setViewVoucher(tx)}
                          className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] rounded font-medium transition cursor-pointer"
                        >
                          Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Current Sector Holders & 1-Year Election Roster (FR-005) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Active 1-Year Sector Holders</span>
              </h2>
              <p className="text-xs text-zinc-500">Current elected term representatives</p>
            </div>
            <button
              onClick={() => setActiveTab('elections')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              All Terms
            </button>
          </div>

          <div className="space-y-3">
            {elections.filter(e => e.status === 'ACTIVE').slice(0, 5).map((elec) => {
              const days = getDaysRemaining(elec.termEndDate);
              const isUrgent = days <= 30;
              return (
                <div 
                  key={elec.id} 
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {elec.sectorName}
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                      {elec.memberName}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Term: {formatDate(elec.termStartDate)} to {formatDate(elec.termEndDate)}
                    </div>
                  </div>

                  <span suppressHydrationWarning className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isUrgent 
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {days}d left
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setActiveTab('elections')}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition border border-emerald-200 dark:border-emerald-800 cursor-pointer"
          >
            + Assign / Elect Member to Sector (1-Year Term)
          </button>
        </div>

      </div>

      {/* Projects Portfolio Summary (FR-007) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Active Community Projects & Supervised Sectors
            </h2>
            <p className="text-xs text-zinc-500">Budget allocation, income mobilized, and actual field expenses</p>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Manage Projects →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((p) => {
            const utilization = p.budgetAmount > 0 ? Math.round((p.totalExpense / p.budgetAmount) * 100) : 0;
            return (
              <div key={p.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded">
                    {p.code}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {p.status}
                  </span>
                </div>

                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {p.name}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Sector: {p.sectorName}
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                  <div className="flex justify-between text-zinc-500">
                    <span>Budget:</span>
                    <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{formatPKR(p.budgetAmount)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Expense:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatPKR(p.totalExpense)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full ${utilization > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-[10px] text-zinc-400">
                    {utilization}% budget utilized
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
