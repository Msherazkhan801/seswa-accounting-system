'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Member,
  Sector,
  ElectionTerm,
  Account,
  Project,
  Transaction,
  StaffLoan,
  EOBIEmployee,
  EOBIContributionRecord,
  AuditLog,
  SystemStats,
  TransactionType
} from '../types';
import {
  INITIAL_USER,
  INITIAL_MEMBERS,
  INITIAL_SECTORS,
  INITIAL_ELECTIONS,
  INITIAL_ACCOUNTS,
  INITIAL_PROJECTS,
  INITIAL_TRANSACTIONS,
  INITIAL_STAFF_LOANS,
  INITIAL_EOBI_EMPLOYEES,
  INITIAL_EOBI_RECORDS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import { generateVoucherNo, getDaysRemaining, getOneYearLaterDateString } from '../utils/formatters';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Data
  members: Member[];
  sectors: Sector[];
  elections: ElectionTerm[];
  accounts: Account[];
  projects: Project[];
  transactions: Transaction[];
  staffLoans: StaffLoan[];
  eobiEmployees: EOBIEmployee[];
  eobiRecords: EOBIContributionRecord[];
  auditLogs: AuditLog[];
  stats: SystemStats;

  // Actions
  addMember: (m: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => Member;
  updateMember: (id: string, m: Partial<Member>) => void;
  toggleMemberStatus: (id: string) => void;

  addSector: (s: Omit<Sector, 'id' | 'createdAt'>) => Sector;
  updateSector: (id: string, s: Partial<Sector>) => void;
  toggleSectorStatus: (id: string) => void;

  addElection: (e: {
    memberId: string;
    sectorId: string;
    electionDate: string;
    termStartDate: string;
    termEndDate?: string;
    resolutionNo?: string;
    notificationRef?: string;
    notes?: string;
  }) => { success: boolean; message: string; election?: ElectionTerm };
  expireElection: (id: string) => void;
  terminateElection: (id: string, reason: string) => void;

  addAccount: (a: Omit<Account, 'id' | 'currentBalance'>) => Account;
  updateAccount: (id: string, a: Partial<Account>) => void;
  toggleAccountStatus: (id: string) => void;

  addProject: (p: Omit<Project, 'id' | 'totalIncome' | 'totalExpense' | 'createdAt'>) => Project;
  updateProject: (id: string, p: Partial<Project>) => void;

  addTransaction: (tx: {
    type: TransactionType;
    date: string;
    accountId: string;
    offsetAccountId?: string;
    amount: number;
    partyName?: string;
    projectId?: string;
    sectorId?: string;
    bankName?: string;
    chequeNo?: string;
    referenceNo?: string;
    description: string;
    supportingDocRef?: string;
    journalLines?: any[];
  }) => Transaction;
  voidTransaction: (id: string, reason: string) => boolean;

  issueStaffLoan: (loan: {
    staffName: string;
    staffDesignation: string;
    phone?: string;
    cnic?: string;
    issueDate: string;
    principalAmount: number;
    monthlyDeduction: number;
    disbursementAccountId: string;
    reason: string;
  }) => StaffLoan;
  recordLoanRepayment: (loanId: string, payment: {
    date: string;
    amount: number;
    paymentMethod: 'CASH' | 'BANK' | 'SALARY_DEDUCTION';
    receiptRef?: string;
    notes?: string;
  }) => void;

  addEOBIEmployee: (emp: Omit<EOBIEmployee, 'id'>) => EOBIEmployee;
  updateEOBIEmployee: (id: string, emp: Partial<EOBIEmployee>) => void;
  toggleEOBIEmployeeStatus: (id: string) => void;
  addEOBIContributionRecord: (rec: Omit<EOBIContributionRecord, 'id' | 'createdAt'>) => void;

  addAuditLog: (action: any, module: string, entityId: string, details: string) => void;

  backupData: () => void;
  restoreData: (jsonData: string) => { success: boolean; message: string };
  resetToInitialData: () => void;

  // Selected voucher preview modal
  viewVoucher: Transaction | null;
  setViewVoucher: (tx: Transaction | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'SESWA_FINANCE_DB_v1.0';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewVoucher, setViewVoucher] = useState<Transaction | null>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Entities
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [sectors, setSectors] = useState<Sector[]>(INITIAL_SECTORS);
  const [elections, setElections] = useState<ElectionTerm[]>(INITIAL_ELECTIONS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [staffLoans, setStaffLoans] = useState<StaffLoan[]>(INITIAL_STAFF_LOANS);
  const [eobiEmployees, setEobiEmployees] = useState<EOBIEmployee[]>(INITIAL_EOBI_EMPLOYEES);
  const [eobiRecords, setEobiRecords] = useState<EOBIContributionRecord[]>(INITIAL_EOBI_RECORDS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.sectors) setSectors(parsed.sectors);
        if (parsed.elections) setElections(parsed.elections);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.staffLoans) setStaffLoans(parsed.staffLoans);
        if (parsed.eobiEmployees) setEobiEmployees(parsed.eobiEmployees);
        if (parsed.eobiRecords) setEobiRecords(parsed.eobiRecords);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch (e) {
      console.error('Error loading database from storage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dbPayload = {
        version: '1.0',
        savedAt: new Date().toISOString(),
        members,
        sectors,
        elections,
        accounts,
        projects,
        transactions,
        staffLoans,
        eobiEmployees,
        eobiRecords,
        auditLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPayload));
    } catch (e) {
      console.error('Error saving database to storage:', e);
    }
  }, [isLoaded, members, sectors, elections, accounts, projects, transactions, staffLoans, eobiEmployees, eobiRecords, auditLogs]);

  // Handle dark mode class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Auth
  const login = (email: string, pass: string) => {
    if (email.trim() && pass.trim()) {
      setIsAuthenticated(true);
      setUser(INITIAL_USER);
      addAuditLog('LOGIN', 'Security & Auth', 'usr-attaullah', `User ${email} logged in successfully.`);
      return true;
    }
    return false;
  };

  const logout = () => {
    addAuditLog('LOGOUT', 'Security & Auth', user?.id || 'unknown', `User logged out.`);
    setIsAuthenticated(false);
  };

  // Audit Logger Helper
  const addAuditLog = (action: any, module: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      user: user?.name || 'Atta Ullah Khan (Finance)',
      action,
      module,
      entityId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Member Management
  const addMember = (m: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMember: Member = {
      ...m,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMembers(prev => [newMember, ...prev]);
    addAuditLog('CREATE', 'Members', newMember.membershipNo, `Added new member: ${newMember.name} (${newMember.membershipNo})`);
    return newMember;
  };

  const updateMember = (id: string, updated: Partial<Member>) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updated, updatedAt: new Date().toISOString() } : m)));
    addAuditLog('UPDATE', 'Members', id, `Updated member profile.`);
  };

  const toggleMemberStatus = (id: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        addAuditLog('UPDATE', 'Members', m.membershipNo, `Changed status of ${m.name} to ${nextStatus}`);
        return { ...m, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return m;
    }));
  };

  // Sector Management
  const addSector = (s: Omit<Sector, 'id' | 'createdAt'>) => {
    const newSector: Sector = {
      ...s,
      id: `sec-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSectors(prev => [newSector, ...prev]);
    addAuditLog('CREATE', 'Sectors', newSector.code, `Created new sector: ${newSector.name} (${newSector.code})`);
    return newSector;
  };

  const updateSector = (id: string, updated: Partial<Sector>) => {
    setSectors(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
    addAuditLog('UPDATE', 'Sectors', id, `Updated sector information.`);
  };

  const toggleSectorStatus = (id: string) => {
    setSectors(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        addAuditLog('UPDATE', 'Sectors', s.code, `Changed status of sector ${s.name} to ${nextStatus}`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // 1-Year Election & Term Management (FR-005)
  const addElection = ({
    memberId,
    sectorId,
    electionDate,
    termStartDate,
    termEndDate,
    resolutionNo,
    notificationRef,
    notes
  }: {
    memberId: string;
    sectorId: string;
    electionDate: string;
    termStartDate: string;
    termEndDate?: string;
    resolutionNo?: string;
    notificationRef?: string;
    notes?: string;
  }) => {
    const member = members.find(m => m.id === memberId);
    const sector = sectors.find(s => s.id === sectorId);

    if (!member || !sector) {
      return { success: false, message: 'Invalid member or sector selected.' };
    }

    // Business Rule Check: Check for active overlapping assignment for this sector
    const existingActive = elections.find(e => e.sectorId === sectorId && e.status === 'ACTIVE');
    if (existingActive) {
      // Auto-expire/conclude previous active assignment to preserve historical audit trail
      setElections(prev => prev.map(e => e.id === existingActive.id ? { ...e, status: 'EXPIRED', updatedAt: new Date().toISOString() } : e));
      addAuditLog('UPDATE', 'Election & 1-Year Terms', existingActive.id, `Previous term for sector ${sector.name} held by ${existingActive.memberName} concluded for new election.`);
    }

    const finalEndDate = termEndDate || getOneYearLaterDateString(termStartDate);

    const newElection: ElectionTerm = {
      id: `elec-${Date.now()}`,
      memberId,
      memberName: member.name,
      sectorId,
      sectorName: sector.name,
      electionDate,
      termStartDate,
      termEndDate: finalEndDate,
      status: 'ACTIVE',
      resolutionNo: resolutionNo || `SESWA/ELEC/${new Date(electionDate).getFullYear()}/${sector.code}`,
      notificationRef: notificationRef || `NOTIF-${sector.code}-${Date.now().toString().slice(-4)}`,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setElections(prev => [newElection, ...prev]);
    addAuditLog('ELECTION_ASSIGN', 'Election & 1-Year Terms', newElection.id, `Elected ${member.name} to ${sector.name} for 1-year term (${termStartDate} to ${finalEndDate}).`);
    return { success: true, message: `Successfully assigned ${member.name} to ${sector.name} for 1-year term.`, election: newElection };
  };

  const expireElection = (id: string) => {
    setElections(prev => prev.map(e => {
      if (e.id === id) {
        addAuditLog('UPDATE', 'Election & 1-Year Terms', id, `Marked term of ${e.memberName} (${e.sectorName}) as Expired.`);
        return { ...e, status: 'EXPIRED', updatedAt: new Date().toISOString() };
      }
      return e;
    }));
  };

  const terminateElection = (id: string, reason: string) => {
    setElections(prev => prev.map(e => {
      if (e.id === id) {
        addAuditLog('UPDATE', 'Election & 1-Year Terms', id, `Terminated 1-year term of ${e.memberName} (${e.sectorName}). Reason: ${reason}`);
        return { ...e, status: 'TERMINATED', notes: `${e.notes ? e.notes + ' | ' : ''}Terminated: ${reason}`, updatedAt: new Date().toISOString() };
      }
      return e;
    }));
  };

  // Account Management
  const addAccount = (a: Omit<Account, 'id' | 'currentBalance'>) => {
    const newAccount: Account = {
      ...a,
      id: `acc-${Date.now()}`,
      currentBalance: a.openingBalance
    };
    setAccounts(prev => [...prev, newAccount]);
    addAuditLog('CREATE', 'Accounts', newAccount.code, `Created account ${newAccount.code} - ${newAccount.name} (${newAccount.category})`);
    return newAccount;
  };

  const updateAccount = (id: string, updated: Partial<Account>) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...updated } : a)));
    addAuditLog('UPDATE', 'Accounts', id, `Updated account details.`);
  };

  const toggleAccountStatus = (id: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        const next = !a.isActive;
        addAuditLog('UPDATE', 'Accounts', a.code, `Toggled account ${a.name} active state to ${next}`);
        return { ...a, isActive: next };
      }
      return a;
    }));
  };

  // Project Management
  const addProject = (p: Omit<Project, 'id' | 'totalIncome' | 'totalExpense' | 'createdAt'>) => {
    const newProject: Project = {
      ...p,
      id: `prj-${Date.now()}`,
      totalIncome: 0,
      totalExpense: 0,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [newProject, ...prev]);
    addAuditLog('CREATE', 'Projects', newProject.code, `Created project ${newProject.name} under ${newProject.sectorName}`);
    return newProject;
  };

  const updateProject = (id: string, updated: Partial<Project>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
    addAuditLog('UPDATE', 'Projects', id, `Updated project information.`);
  };

  // Transaction Engine (FR-008, FR-009, FR-010, FR-016)
  const addTransaction = (txData: {
    type: TransactionType;
    date: string;
    accountId: string;
    offsetAccountId?: string;
    amount: number;
    partyName?: string;
    projectId?: string;
    sectorId?: string;
    bankName?: string;
    chequeNo?: string;
    referenceNo?: string;
    description: string;
    supportingDocRef?: string;
    journalLines?: any[];
  }) => {
    const primaryAccount = accounts.find(a => a.id === txData.accountId);
    const offsetAccount = accounts.find(a => a.id === txData.offsetAccountId);
    const project = projects.find(p => p.id === txData.projectId);
    const sector = sectors.find(s => s.id === txData.sectorId) || (project ? sectors.find(s => s.id === project.sectorId) : undefined);

    const voucherNo = generateVoucherNo(txData.type, transactions.length);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      voucherNo,
      type: txData.type,
      date: txData.date,
      accountId: txData.accountId,
      accountName: primaryAccount ? `${primaryAccount.code} - ${primaryAccount.name}` : 'Unknown Account',
      offsetAccountId: txData.offsetAccountId,
      offsetAccountName: offsetAccount ? `${offsetAccount.code} - ${offsetAccount.name}` : undefined,
      amount: Number(txData.amount),
      partyName: txData.partyName,
      projectId: txData.projectId,
      projectName: project?.name,
      sectorId: sector?.id,
      sectorName: sector?.name,
      bankName: txData.bankName,
      chequeNo: txData.chequeNo,
      referenceNo: txData.referenceNo,
      description: txData.description,
      supportingDocRef: txData.supportingDocRef,
      status: 'POSTED',
      journalLines: txData.journalLines,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Atta Ullah Khan'
    };

    // Update Account Balances based on double-entry principles
    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        let bal = acc.currentBalance;
        const amt = Number(txData.amount);

        if (txData.type === 'CASH_RECEIPT' || txData.type === 'BANK_RECEIPT') {
          if (acc.id === txData.accountId) bal += amt; // Debit Asset
          if (acc.id === txData.offsetAccountId) {
            if (acc.category === 'INCOME' || acc.category === 'EQUITY' || acc.category === 'LIABILITY') {
              bal += amt; // Credit Income/Equity/Liability
            } else {
              bal -= amt;
            }
          }
        } else if (txData.type === 'CASH_PAYMENT' || txData.type === 'BANK_PAYMENT') {
          if (acc.id === txData.accountId) bal -= amt; // Credit Asset
          if (acc.id === txData.offsetAccountId) {
            if (acc.category === 'EXPENSE' || acc.category === 'ASSET') {
              bal += amt; // Debit Expense/Asset
            } else {
              bal -= amt;
            }
          }
        } else if (txData.type === 'BANK_TRANSFER') {
          if (acc.id === txData.accountId) bal -= amt; // Transfer From
          if (acc.id === txData.offsetAccountId) bal += amt; // Transfer To
        } else if (txData.type === 'JOURNAL_ENTRY' && txData.journalLines) {
          const line = txData.journalLines.find(l => l.accountId === acc.id);
          if (line) {
            const net = line.debit - line.credit;
            if (acc.category === 'ASSET' || acc.category === 'EXPENSE') {
              bal += net;
            } else {
              bal -= net;
            }
          }
        }
        return { ...acc, currentBalance: bal };
      });
    });

    // Update Project financials if linked
    if (txData.projectId) {
      setProjects(prevProjects => {
        return prevProjects.map(prj => {
          if (prj.id === txData.projectId) {
            const amt = Number(txData.amount);
            if (txData.type === 'CASH_RECEIPT' || txData.type === 'BANK_RECEIPT') {
              return { ...prj, totalIncome: prj.totalIncome + amt };
            } else if (txData.type === 'CASH_PAYMENT' || txData.type === 'BANK_PAYMENT') {
              return { ...prj, totalExpense: prj.totalExpense + amt };
            }
          }
          return prj;
        });
      });
    }

    setTransactions(prev => [newTx, ...prev]);
    addAuditLog('CREATE', 'Transactions', voucherNo, `Posted ${txData.type} ${voucherNo} of Rs. ${txData.amount.toLocaleString()} - ${txData.description}`);
    return newTx;
  };

  // Controlled Reversal / Voiding (FR-016 - Never silently delete posted transactions)
  const voidTransaction = (id: string, reason: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status === 'VOIDED') return false;

    // Reverse account balances
    setAccounts(prevAccounts => {
      return prevAccounts.map(acc => {
        let bal = acc.currentBalance;
        const amt = Number(tx.amount);

        if (tx.type === 'CASH_RECEIPT' || tx.type === 'BANK_RECEIPT') {
          if (acc.id === tx.accountId) bal -= amt;
          if (acc.id === tx.offsetAccountId) {
            if (acc.category === 'INCOME' || acc.category === 'EQUITY' || acc.category === 'LIABILITY') {
              bal -= amt;
            } else {
              bal += amt;
            }
          }
        } else if (tx.type === 'CASH_PAYMENT' || tx.type === 'BANK_PAYMENT') {
          if (acc.id === tx.accountId) bal += amt;
          if (acc.id === tx.offsetAccountId) {
            if (acc.category === 'EXPENSE' || acc.category === 'ASSET') {
              bal -= amt;
            } else {
              bal += amt;
            }
          }
        } else if (tx.type === 'BANK_TRANSFER') {
          if (acc.id === tx.accountId) bal += amt;
          if (acc.id === tx.offsetAccountId) bal -= amt;
        }
        return { ...acc, currentBalance: bal };
      });
    });

    // Reverse project impact
    if (tx.projectId) {
      setProjects(prevProjects => {
        return prevProjects.map(prj => {
          if (prj.id === tx.projectId) {
            const amt = Number(tx.amount);
            if (tx.type === 'CASH_RECEIPT' || tx.type === 'BANK_RECEIPT') {
              return { ...prj, totalIncome: Math.max(0, prj.totalIncome - amt) };
            } else if (tx.type === 'CASH_PAYMENT' || tx.type === 'BANK_PAYMENT') {
              return { ...prj, totalExpense: Math.max(0, prj.totalExpense - amt) };
            }
          }
          return prj;
        });
      });
    }

    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'VOIDED',
          voidReason: reason,
          voidedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    addAuditLog('VOID', 'Transactions', tx.voucherNo, `Voided/Reversed transaction ${tx.voucherNo}. Reason: ${reason}`);
    return true;
  };

  // Staff Loans (FR-011)
  const issueStaffLoan = (loanData: {
    staffName: string;
    staffDesignation: string;
    phone?: string;
    cnic?: string;
    issueDate: string;
    principalAmount: number;
    monthlyDeduction: number;
    disbursementAccountId: string;
    reason: string;
  }) => {
    const loanNo = `LN-${new Date().getFullYear()}-${String(staffLoans.length + 1).padStart(3, '0')}`;
    const newLoan: StaffLoan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      loanNo,
      repaidAmount: 0,
      outstandingBalance: Number(loanData.principalAmount),
      status: 'ACTIVE',
      repayments: [],
      createdAt: new Date().toISOString()
    };

    setStaffLoans(prev => [newLoan, ...prev]);

    // Automatically create a disbursement transaction
    addTransaction({
      type: 'CASH_PAYMENT',
      date: loanData.issueDate,
      accountId: loanData.disbursementAccountId,
      offsetAccountId: 'acc-1040', // Staff Loan Receivables
      amount: loanData.principalAmount,
      partyName: loanData.staffName,
      referenceNo: loanNo,
      description: `Staff Welfare Loan disbursement to ${loanData.staffName} (${loanData.staffDesignation}) - ${loanData.reason}`
    });

    addAuditLog('LOAN_ISSUE', 'Staff Loans', loanNo, `Issued staff loan of Rs. ${loanData.principalAmount.toLocaleString()} to ${loanData.staffName}`);
    return newLoan;
  };

  const recordLoanRepayment = (loanId: string, payment: {
    date: string;
    amount: number;
    paymentMethod: 'CASH' | 'BANK' | 'SALARY_DEDUCTION';
    receiptRef?: string;
    notes?: string;
  }) => {
    setStaffLoans(prevLoans => {
      return prevLoans.map(loan => {
        if (loan.id === loanId) {
          const amt = Number(payment.amount);
          const newRepaid = loan.repaidAmount + amt;
          const newBalance = Math.max(0, loan.principalAmount - newRepaid);
          const isPaid = newBalance === 0;

          const repaymentItem = {
            id: `rep-${Date.now()}`,
            loanId,
            date: payment.date,
            amount: amt,
            paymentMethod: payment.paymentMethod,
            receiptRef: payment.receiptRef || `REP-${loan.loanNo}-${loan.repayments.length + 1}`,
            notes: payment.notes,
            recordedAt: new Date().toISOString()
          };

          return {
            ...loan,
            repaidAmount: newRepaid,
            outstandingBalance: newBalance,
            status: isPaid ? 'PAID' : 'ACTIVE',
            repayments: [...loan.repayments, repaymentItem]
          };
        }
        return loan;
      });
    });

    // Create receipt transaction
    addTransaction({
      type: 'CASH_RECEIPT',
      date: payment.date,
      accountId: 'acc-1010',
      offsetAccountId: 'acc-1040',
      amount: payment.amount,
      partyName: 'Staff Loan Repayment',
      referenceNo: payment.receiptRef || 'LN-REPAY',
      description: `Staff loan recovery installment (${payment.paymentMethod}) - ${payment.notes || ''}`
    });

    addAuditLog('LOAN_REPAY', 'Staff Loans', loanId, `Recorded loan repayment of Rs. ${payment.amount.toLocaleString()}`);
  };

  // EOBI (FR-012)
  const addEOBIEmployee = (emp: Omit<EOBIEmployee, 'id'>) => {
    const newEmp: EOBIEmployee = {
      ...emp,
      id: `eobi-emp-${Date.now()}`
    };
    setEobiEmployees(prev => [...prev, newEmp]);
    addAuditLog('CREATE', 'EOBI', newEmp.eobiNumber, `Registered employee ${newEmp.employeeName} for EOBI.`);
    return newEmp;
  };

  const updateEOBIEmployee = (id: string, updated: Partial<EOBIEmployee>) => {
    setEobiEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    addAuditLog('UPDATE', 'EOBI', id, `Updated EOBI employee profile.`);
  };

  const toggleEOBIEmployeeStatus = (id: string) => {
    setEobiEmployees(prev => prev.map(e => {
      if (e.id === id) {
        const next = !e.isActive;
        addAuditLog('UPDATE', 'EOBI', e.eobiNumber, `Toggled EOBI status for ${e.employeeName} to ${next}`);
        return { ...e, isActive: next };
      }
      return e;
    }));
  };

  const addEOBIContributionRecord = (rec: Omit<EOBIContributionRecord, 'id' | 'createdAt'>) => {
    const newRec: EOBIContributionRecord = {
      ...rec,
      id: `eobi-rec-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setEobiRecords(prev => [newRec, ...prev]);

    // If paid from account, auto post bank/cash payment
    if (rec.status === 'PAID' && rec.paidFromAccountId) {
      addTransaction({
        type: 'BANK_PAYMENT',
        date: rec.paymentDate || new Date().toISOString().split('T')[0],
        accountId: rec.paidFromAccountId,
        offsetAccountId: 'acc-2020', // EOBI Payable
        amount: rec.grandTotal,
        partyName: 'EOBI Regional Office / National Bank of Pakistan',
        referenceNo: rec.bankChallanNo || 'EOBI-CHALLAN',
        description: `Statutory EOBI contribution payment for month ${rec.month} (${rec.totalEmployees} employees)`
      });
    }

    addAuditLog('EOBI_PAYMENT', 'EOBI', newRec.month, `Recorded EOBI payment of Rs. ${rec.grandTotal.toLocaleString()} for month ${rec.month}`);
  };

  // Backup & Recovery (NFR-006)
  const backupData = () => {
    const data = {
      system: 'SESWA Finance Management & Accounting System',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: user?.name || 'Atta Ullah Khan',
      members,
      sectors,
      elections,
      accounts,
      projects,
      transactions,
      staffLoans,
      eobiEmployees,
      eobiRecords,
      auditLogs
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SESWA_Finance_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addAuditLog('BACKUP', 'System Backup & Recovery', 'BACKUP', `Full system database backup exported successfully.`);
  };

  const restoreData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.members || !parsed.sectors || !parsed.accounts || !parsed.transactions) {
        return { success: false, message: 'Invalid backup file schema. Critical tables are missing.' };
      }

      setMembers(parsed.members || []);
      setSectors(parsed.sectors || []);
      setElections(parsed.elections || []);
      setAccounts(parsed.accounts || []);
      setProjects(parsed.projects || []);
      setTransactions(parsed.transactions || []);
      setStaffLoans(parsed.staffLoans || []);
      setEobiEmployees(parsed.eobiEmployees || []);
      setEobiRecords(parsed.eobiRecords || []);
      setAuditLogs(parsed.auditLogs || []);

      addAuditLog('RESTORE', 'System Backup & Recovery', 'RESTORE', `System database restored from JSON backup file.`);
      return { success: true, message: 'Database successfully restored from backup.' };
    } catch (err: any) {
      return { success: false, message: `Failed to restore backup: ${err.message}` };
    }
  };

  const resetToInitialData = () => {
    setMembers(INITIAL_MEMBERS);
    setSectors(INITIAL_SECTORS);
    setElections(INITIAL_ELECTIONS);
    setAccounts(INITIAL_ACCOUNTS);
    setProjects(INITIAL_PROJECTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setStaffLoans(INITIAL_STAFF_LOANS);
    setEobiEmployees(INITIAL_EOBI_EMPLOYEES);
    setEobiRecords(INITIAL_EOBI_RECORDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEY);
    addAuditLog('UPDATE', 'System', 'RESET', 'Reset system to initial FY 2026-27 sample dataset.');
  };

  // Computed Real-Time Stats (FR-002 Dashboard)
  const cashInHand = accounts
    .filter(a => a.category === 'ASSET' && a.code.startsWith('101'))
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const bankBalance = accounts
    .filter(a => a.category === 'ASSET' && (a.code.startsWith('102') || a.code.startsWith('103')))
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalLiquidity = cashInHand + bankBalance;

  const totalIncome = accounts
    .filter(a => a.category === 'INCOME')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalExpense = accounts
    .filter(a => a.category === 'EXPENSE')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const netSurplus = totalIncome - totalExpense;

  const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;
  const activeSectorsCount = sectors.filter(s => s.status === 'ACTIVE').length;
  const activeElectionsCount = elections.filter(e => e.status === 'ACTIVE').length;
  
  const expiringTermsCount = elections.filter(e => {
    if (e.status !== 'ACTIVE') return false;
    const days = getDaysRemaining(e.termEndDate, isLoaded ? undefined : '2026-04-01');
    return days >= 0 && days <= 30;
  }).length;

  const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;
  const outstandingLoansTotal = staffLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalTransactionsCount = transactions.filter(t => t.status === 'POSTED').length;

  const stats: SystemStats = {
    cashInHand,
    bankBalance,
    totalLiquidity,
    totalIncome,
    totalExpense,
    netSurplus,
    activeMembersCount,
    activeSectorsCount,
    activeElectionsCount,
    expiringTermsCount,
    activeProjectsCount,
    outstandingLoansTotal,
    totalTransactionsCount
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        activeTab,
        setActiveTab,
        globalSearchQuery,
        setGlobalSearchQuery,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        theme,
        toggleTheme,
        members,
        sectors,
        elections,
        accounts,
        projects,
        transactions,
        staffLoans,
        eobiEmployees,
        eobiRecords,
        auditLogs,
        stats,
        addMember,
        updateMember,
        toggleMemberStatus,
        addSector,
        updateSector,
        toggleSectorStatus,
        addElection,
        expireElection,
        terminateElection,
        addAccount,
        updateAccount,
        toggleAccountStatus,
        addProject,
        updateProject,
        addTransaction,
        voidTransaction,
        issueStaffLoan,
        recordLoanRepayment,
        addEOBIEmployee,
        updateEOBIEmployee,
        toggleEOBIEmployeeStatus,
        addEOBIContributionRecord,
        addAuditLog,
        backupData,
        restoreData,
        resetToInitialData,
        viewVoucher,
        setViewVoucher
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
