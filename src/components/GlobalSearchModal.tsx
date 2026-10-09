'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  X, 
  Wallet, 
  Landmark, 
  Users, 
  Grid3X3, 
  Award, 
  BookOpen, 
  FolderKanban, 
  BadgePercent, 
  Receipt, 
  FileBarChart,
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles,
  CornerDownLeft
} from 'lucide-react';
import { formatPKR, formatDate } from '../utils/formatters';
import { Transaction, Member, Sector, ElectionTerm, Account, Project, StaffLoan, EOBIEmployee } from '../types';

type CategoryFilter = 'ALL' | 'TRANSACTIONS' | 'MEMBERS' | 'SECTORS' | 'ELECTIONS' | 'ACCOUNTS' | 'PROJECTS' | 'LOANS' | 'EOBI' | 'REPORTS';

export default function GlobalSearchModal() {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    members,
    sectors,
    elections,
    accounts,
    projects,
    transactions,
    staffLoans,
    eobiEmployees,
    setActiveTab,
    setViewVoucher
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isGlobalSearchOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  const query = globalSearchQuery.trim().toLowerCase();

  // Search Results
  const results = useMemo(() => {
    if (!query) {
      return {
        transactions: [],
        members: [],
        sectors: [],
        elections: [],
        accounts: [],
        projects: [],
        staffLoans: [],
        eobiEmployees: [],
        reports: [],
        totalCount: 0
      };
    }

    const matchedTxs = transactions.filter(t => 
      t.voucherNo.toLowerCase().includes(query) ||
      (t.partyName && t.partyName.toLowerCase().includes(query)) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.referenceNo && t.referenceNo.toLowerCase().includes(query)) ||
      (t.accountName && t.accountName.toLowerCase().includes(query)) ||
      (t.projectName && t.projectName.toLowerCase().includes(query)) ||
      String(t.amount).includes(query)
    ).slice(0, 8);

    const matchedMembers = members.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.membershipNo.toLowerCase().includes(query) ||
      m.cnic.includes(query) ||
      m.phone.includes(query) ||
      (m.profession && m.profession.toLowerCase().includes(query))
    ).slice(0, 6);

    const matchedSectors = sectors.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query) ||
      s.department.toLowerCase().includes(query)
    ).slice(0, 5);

    const matchedElections = elections.filter(e => 
      e.memberName.toLowerCase().includes(query) ||
      e.sectorName.toLowerCase().includes(query) ||
      (e.resolutionNo && e.resolutionNo.toLowerCase().includes(query))
    ).slice(0, 5);

    const matchedAccounts = accounts.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.code.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      (a.subCategory && a.subCategory.toLowerCase().includes(query))
    ).slice(0, 6);

    const matchedProjects = projects.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      p.sectorName.toLowerCase().includes(query)
    ).slice(0, 5);

    const matchedLoans = staffLoans.filter(l => 
      l.staffName.toLowerCase().includes(query) ||
      l.loanNo.toLowerCase().includes(query) ||
      l.staffDesignation.toLowerCase().includes(query)
    ).slice(0, 5);

    const matchedEOBI = eobiEmployees.filter(emp => 
      emp.employeeName.toLowerCase().includes(query) ||
      emp.eobiNumber.toLowerCase().includes(query) ||
      emp.cnic.includes(query) ||
      emp.designation.toLowerCase().includes(query)
    ).slice(0, 5);

    const reportDefinitions = [
      { id: 'cash-book', title: 'Cash Book Report (CRV & CPV)', desc: 'Official Cash receipts and disbursements' },
      { id: 'bank-book', title: 'Bank Book Report (BRV, BPV, TRV)', desc: 'HBL & NBP Bank ledger statements' },
      { id: 'trial-balance', title: 'Trial Balance Verification', desc: 'Double-entry debit and credit equilibrium' },
      { id: 'account-ledger', title: 'General Ledger Statements', desc: 'Running account balance statements' },
      { id: 'project-report', title: 'Project Income & Expenditure', desc: 'Sector-supervised project financial statements' },
      { id: 'staff-loan-report', title: 'Staff Welfare Loan Statement', desc: 'Disbursements and recovery schedules' },
      { id: 'eobi-report', title: 'EOBI Contributions Register', desc: '1% employee & 5% employer statutory deposits' },
      { id: 'active-elections-report', title: 'Active 1-Year Sector Holders Roster', desc: 'Current elected organizational tenure list' },
      { id: 'member-directory-report', title: 'SESWA Member Directory & Archive', desc: 'Complete membership register' }
    ];

    const matchedReports = reportDefinitions.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.desc.toLowerCase().includes(query)
    ).slice(0, 4);

    const totalCount = 
      matchedTxs.length + 
      matchedMembers.length + 
      matchedSectors.length + 
      matchedElections.length + 
      matchedAccounts.length + 
      matchedProjects.length + 
      matchedLoans.length + 
      matchedEOBI.length + 
      matchedReports.length;

    return {
      transactions: matchedTxs,
      members: matchedMembers,
      sectors: matchedSectors,
      elections: matchedElections,
      accounts: matchedAccounts,
      projects: matchedProjects,
      staffLoans: matchedLoans,
      eobiEmployees: matchedEOBI,
      reports: matchedReports,
      totalCount
    };
  }, [query, transactions, members, sectors, elections, accounts, projects, staffLoans, eobiEmployees]);

  if (!isGlobalSearchOpen) return null;

  const handleNavigate = (tab: string, itemType?: string, item?: any) => {
    setActiveTab(tab);
    setIsGlobalSearchOpen(false);

    // If clicking a transaction, open the official voucher slip directly!
    if (itemType === 'transaction' && item) {
      setViewVoucher(item);
    }
  };

  const categories: { id: CategoryFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All Results', count: results.totalCount },
    { id: 'TRANSACTIONS', label: 'Vouchers & Book', count: results.transactions.length },
    { id: 'MEMBERS', label: 'Members', count: results.members.length },
    { id: 'SECTORS', label: 'Sectors', count: results.sectors.length },
    { id: 'ELECTIONS', label: '1-Yr Terms', count: results.elections.length },
    { id: 'ACCOUNTS', label: 'Accounts', count: results.accounts.length },
    { id: 'PROJECTS', label: 'Projects', count: results.projects.length },
    { id: 'LOANS', label: 'Staff Loans', count: results.staffLoans.length },
    { id: 'EOBI', label: 'EOBI', count: results.eobiEmployees.length },
    { id: 'REPORTS', label: 'Reports', count: results.reports.length }
  ];

  return (
    <div 
      onClick={() => setIsGlobalSearchOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 md:p-12 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-4 sm:my-8 cursor-default flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Search Header Input Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search by Voucher #, Member, CNIC, Sector, Account, Project, Loan, EOBI, Amount..."
              className="w-full bg-transparent text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="text-xs px-2 py-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition cursor-pointer"
            >
              Clear
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>ESC to close</span>
          </div>

          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="px-4 py-2.5 bg-zinc-100/70 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{cat.label}</span>
              {query && cat.count !== undefined && cat.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id ? 'bg-emerald-950 text-emerald-200' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          
          {/* Empty Prompt State */}
          {!query && (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Global Financial & Governance Search
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                Type any keyword to instantly search across Cash/Bank Vouchers, Members, 1-Year Election Terms, Chart of Accounts, Projects, Staff Loans, EOBI & Reports.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-zinc-400">Try searching:</span>
                {['CRV-2026', 'Atta Ullah', 'Medical Camp', 'Education Sector', 'HBL', 'Salary'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setGlobalSearchQuery(tag)}
                    className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
                  >
                    "{tag}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results Found */}
          {query && results.totalCount === 0 && (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                No matching records found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                No entries match "{globalSearchQuery}". Check spelling or try a different term.
              </p>
            </div>
          )}

          {/* 1. Transactions / Vouchers Results */}
          {(activeCategory === 'ALL' || activeCategory === 'TRANSACTIONS') && results.transactions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Vouchers & Cash/Bank Transactions ({results.transactions.length})</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">Click to View Official Slip</span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40">
                {results.transactions.map(tx => (
                  <div
                    key={tx.id}
                    onClick={() => handleNavigate(tx.type.startsWith('CASH') ? 'cash' : tx.type.startsWith('BANK') ? 'bank' : 'journal', 'transaction', tx)}
                    className="p-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        tx.type === 'CASH_RECEIPT' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        tx.type === 'CASH_PAYMENT' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        tx.type === 'BANK_RECEIPT' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        tx.type === 'BANK_TRANSFER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {tx.voucherNo}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                          {tx.partyName || tx.accountName}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {tx.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatPKR(tx.amount)}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {formatDate(tx.date)}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Members Results */}
          {(activeCategory === 'ALL' || activeCategory === 'MEMBERS') && results.members.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>Members Directory ({results.members.length})</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">Click to Open Directory</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.members.map(m => (
                  <div
                    key={m.id}
                    onClick={() => handleNavigate('members')}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        CNIC: <span className="font-mono">{m.cnic}</span> • {m.phone}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded shrink-0">
                      {m.membershipNo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Sectors Results */}
          {(activeCategory === 'ALL' || activeCategory === 'SECTORS') && results.sectors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span>Sectors & Portfolios ({results.sectors.length})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.sectors.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleNavigate('sectors')}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {s.department}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded shrink-0">
                      {s.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 1-Year Election Terms Results */}
          {(activeCategory === 'ALL' || activeCategory === 'ELECTIONS') && results.elections.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>1-Year Election Terms & Sector Heads ({results.elections.length})</span>
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40">
                {results.elections.map(e => (
                  <div
                    key={e.id}
                    onClick={() => handleNavigate('elections')}
                    className="p-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {e.sectorName} — <span className="text-emerald-700 dark:text-emerald-400">{e.memberName}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        Tenure: {formatDate(e.termStartDate)} to {formatDate(e.termEndDate)} • Ref: {e.resolutionNo || 'SESWA/RES'}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Chart of Accounts Results */}
          {(activeCategory === 'ALL' || activeCategory === 'ACCOUNTS') && results.accounts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Chart of Accounts & Ledgers ({results.accounts.length})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.accounts.map(a => (
                  <div
                    key={a.id}
                    onClick={() => handleNavigate('accounts')}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                        {a.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        Code: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{a.code}</span> • {a.category}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {formatPKR(a.currentBalance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Projects Results */}
          {(activeCategory === 'ALL' || activeCategory === 'PROJECTS') && results.projects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Community Projects ({results.projects.length})</span>
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40">
                {results.projects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleNavigate('projects')}
                    className="p-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        Sector: {p.sectorName} • Budget: {formatPKR(p.budgetAmount)}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded shrink-0">
                      {p.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Staff Loans Results */}
          {(activeCategory === 'ALL' || activeCategory === 'LOANS') && results.staffLoans.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                  <BadgePercent className="w-3.5 h-3.5" />
                  <span>Staff Welfare Loans ({results.staffLoans.length})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.staffLoans.map(l => (
                  <div
                    key={l.id}
                    onClick={() => handleNavigate('loans')}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-700 dark:group-hover:text-rose-400">
                        {l.staffName} ({l.staffDesignation})
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        Loan #: <span className="font-mono">{l.loanNo}</span> • Outstanding: <span className="font-bold text-rose-600 font-mono">{formatPKR(l.outstandingBalance)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. EOBI Results */}
          {(activeCategory === 'ALL' || activeCategory === 'EOBI') && results.eobiEmployees.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>EOBI Registered Staff ({results.eobiEmployees.length})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.eobiEmployees.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => handleNavigate('eobi')}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-teal-700 dark:group-hover:text-teal-400">
                        {emp.employeeName} ({emp.designation})
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        EOBI #: <span className="font-mono font-bold">{emp.eobiNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. Reports Results */}
          {(activeCategory === 'ALL' || activeCategory === 'REPORTS') && results.reports.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <FileBarChart className="w-3.5 h-3.5" />
                  <span>Financial & Governance Reports ({results.reports.length})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.reports.map(r => (
                  <div
                    key={r.id}
                    onClick={() => handleNavigate('reports')}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {r.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {r.desc}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">Click</span> to redirect
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">ESC</span> to exit
            </span>
          </div>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {results.totalCount} result{results.totalCount !== 1 ? 's' : ''} available
          </span>
        </div>

      </div>
    </div>
  );
}
