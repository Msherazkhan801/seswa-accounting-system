// SESWA Finance Management & Accounting System Types

export type UserRole = 'FINANCE_USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
  avatar?: string;
  lastLogin?: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'RESIGNED' | 'HONORARY';

export interface Member {
  id: string;
  membershipNo: string;
  name: string;
  fatherName?: string;
  cnic: string;
  phone: string;
  email?: string;
  address?: string;
  profession?: string;
  bloodGroup?: string;
  joinDate: string;
  status: MemberStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SectorStatus = 'ACTIVE' | 'INACTIVE';

export interface Sector {
  id: string;
  code: string;
  name: string;
  description?: string;
  department: string;
  status: SectorStatus;
  createdAt: string;
}

export type ElectionStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'TRANSFERRED';

export interface ElectionTerm {
  id: string;
  memberId: string;
  memberName: string;
  sectorId: string;
  sectorName: string;
  electionDate: string;
  termStartDate: string;
  termEndDate: string; // Exactly 1 year standard
  status: ElectionStatus;
  resolutionNo?: string;
  notificationRef?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export interface Account {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  subCategory?: string;
  openingBalance: number;
  currentBalance: number;
  description?: string;
  isActive: boolean;
  isSystemAccount?: boolean;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: string;
  code: string;
  name: string;
  sectorId: string; // Project under supervision of which sector (FR-007)
  sectorName: string;
  startDate: string;
  endDate?: string;
  budgetAmount: number;
  totalIncome: number;
  totalExpense: number;
  status: ProjectStatus;
  location?: string;
  beneficiariesCount?: number;
  description?: string;
  createdAt: string;
}

export type TransactionType = 
  | 'CASH_RECEIPT'
  | 'CASH_PAYMENT'
  | 'BANK_RECEIPT'
  | 'BANK_PAYMENT'
  | 'BANK_TRANSFER'
  | 'JOURNAL_ENTRY';

export type TransactionStatus = 'POSTED' | 'VOIDED' | 'DRAFT';

export interface JournalLineItem {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface Transaction {
  id: string;
  voucherNo: string;
  type: TransactionType;
  date: string;
  accountId: string; // Primary Cash/Bank account for simple tx, or ledger account
  accountName: string;
  offsetAccountId?: string; // Counter account (Income, Expense, etc.)
  offsetAccountName?: string;
  amount: number;
  partyName?: string; // Received From / Paid To
  projectId?: string;
  projectName?: string;
  sectorId?: string;
  sectorName?: string;
  bankName?: string;
  chequeNo?: string;
  referenceNo?: string;
  description: string;
  supportingDocRef?: string;
  status: TransactionStatus;
  voidReason?: string;
  voidedAt?: string;
  journalLines?: JournalLineItem[]; // For double-entry journal entries
  createdAt: string;
  createdBy: string;
}

export type LoanStatus = 'ACTIVE' | 'PAID' | 'DEFAULTED';

export interface LoanRepayment {
  id: string;
  loanId: string;
  date: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK' | 'SALARY_DEDUCTION';
  receiptRef?: string;
  notes?: string;
  recordedAt: string;
}

export interface StaffLoan {
  id: string;
  loanNo: string;
  staffName: string;
  staffDesignation: string;
  phone?: string;
  cnic?: string;
  issueDate: string;
  principalAmount: number;
  monthlyDeduction: number;
  repaidAmount: number;
  outstandingBalance: number;
  disbursementAccountId: string; // Cash or Bank
  reason: string;
  status: LoanStatus;
  repayments: LoanRepayment[];
  createdAt: string;
}

export interface EOBIEmployee {
  id: string;
  employeeName: string;
  designation: string;
  cnic: string;
  eobiNumber: string;
  registrationDate: string;
  basicSalary: number;
  employeeShareRate: number; // typically 1%
  employerShareRate: number; // typically 5%
  isActive: boolean;
}

export interface EOBIContributionRecord {
  id: string;
  month: string; // e.g. "2026-07"
  year: number;
  totalEmployees: number;
  employeeShareTotal: number;
  employerShareTotal: number;
  grandTotal: number;
  bankChallanNo?: string;
  paymentDate?: string;
  paidFromAccountId?: string;
  status: 'PAID' | 'PENDING';
  remarks?: string;
  createdAt: string;
}

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'VOID'
  | 'DELETE'
  | 'ELECTION_ASSIGN'
  | 'LOAN_ISSUE'
  | 'LOAN_REPAY'
  | 'EOBI_PAYMENT'
  | 'EXCEL_IMPORT'
  | 'BACKUP'
  | 'RESTORE'
  | 'LOGIN'
  | 'LOGOUT';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  module: string;
  entityId: string;
  details: string;
}

export interface SystemStats {
  cashInHand: number;
  bankBalance: number;
  totalLiquidity: number;
  totalIncome: number;
  totalExpense: number;
  netSurplus: number;
  activeMembersCount: number;
  activeSectorsCount: number;
  activeElectionsCount: number;
  expiringTermsCount: number;
  activeProjectsCount: number;
  outstandingLoansTotal: number;
  totalTransactionsCount: number;
}
