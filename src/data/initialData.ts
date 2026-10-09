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
  AuditLog
} from '../types';

export const INITIAL_USER: User = {
  id: 'usr-attaullah',
  name: 'Atta Ullah Khan',
  email: 'finance@seswa.org',
  role: 'FINANCE_USER',
  designation: 'Authorized Finance Secretary',
  department: 'Finance Sector',
  lastLogin: new Date().toISOString()
};

export const INITIAL_SECTORS: Sector[] = [
  {
    id: 'sec-fin',
    code: 'SEC-FIN',
    name: 'Finance & Accounts Sector',
    description: 'Oversees financial budgeting, cash books, banking transactions, audits, and statutory reporting.',
    department: 'Central Administration',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sec-edu',
    code: 'SEC-EDU',
    name: 'Education & Scholarships Sector',
    description: 'Manages school support programs, higher education stipends, and merit scholarship distribution.',
    department: 'Human Development',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sec-hlt',
    code: 'SEC-HLT',
    name: 'Health & Medical Relief Sector',
    description: 'Coordinates free medical camps, emergency patient aid, ambulance services, and medicine supplies.',
    department: 'Public Welfare',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sec-soc',
    code: 'SEC-SOC',
    name: 'Social Welfare & Community Support',
    description: 'Handles widow support, orphan stipends, winter blankets, and community infrastructure projects.',
    department: 'Public Welfare',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sec-yth',
    code: 'SEC-YTH',
    name: 'Youth Affairs & Vocational Training',
    description: 'Empowers local youth through IT training, sports tournaments, and job placement workshops.',
    department: 'Human Development',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sec-emg',
    code: 'SEC-EMG',
    name: 'Emergency Relief & Disaster Response',
    description: 'Swift mobilization during floods, earthquakes, winter emergencies, and crisis relief drives.',
    department: 'Operations',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sec-aud',
    code: 'SEC-AUD',
    name: 'Audit & Compliance Committee',
    description: 'Internal audit, ledger review, physical verification of assets, and compliance checks.',
    department: 'Governance',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sec-wom',
    code: 'SEC-WOM',
    name: 'Women Empowerment Sector',
    description: 'Vocational sewing centers, micro-enterprise training, and female literacy initiatives.',
    department: 'Human Development',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    membershipNo: 'SESWA-MEM-001',
    name: 'Atta Ullah Khan',
    fatherName: 'Habib Ullah Khan',
    cnic: '12101-1234567-1',
    phone: '+92 300 1234567',
    email: 'attaullah@seswa.org',
    address: 'Shewa Town, Main Bazaar, Khyber Pakhtunkhwa',
    profession: 'Finance Professional & Social Worker',
    bloodGroup: 'B+',
    joinDate: '2020-01-15',
    status: 'ACTIVE',
    notes: 'Authorized Finance Officer & Lead Bookkeeper.',
    createdAt: '2020-01-15T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'mem-002',
    membershipNo: 'SESWA-MEM-002',
    name: 'Dr. Muhammad Tariq',
    fatherName: 'Gulzar Ahmad',
    cnic: '12101-7654321-3',
    phone: '+92 333 9876543',
    email: 'dr.tariq@seswa.org',
    address: 'Hospital Road, Sector 3, Shewa',
    profession: 'Medical Doctor / Surgeon',
    bloodGroup: 'O+',
    joinDate: '2021-03-10',
    status: 'ACTIVE',
    notes: 'Lead organizer for annual medical and eye screening camps.',
    createdAt: '2021-03-10T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'mem-003',
    membershipNo: 'SESWA-MEM-003',
    name: 'Prof. Abdul Rehman',
    fatherName: 'Mirza Khan',
    cnic: '12101-5544332-5',
    phone: '+92 345 8877665',
    email: 'abdulrehman@seswa.org',
    address: 'College Colony, Shewa',
    profession: 'College Principal (Retd.)',
    bloodGroup: 'A+',
    joinDate: '2019-06-01',
    status: 'ACTIVE',
    notes: 'Chairman Scholarship Selection Panel.',
    createdAt: '2019-06-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'mem-004',
    membershipNo: 'SESWA-MEM-004',
    name: 'Engr. Farooq Ahmad',
    fatherName: 'Ahmad Din',
    cnic: '12101-9988776-7',
    phone: '+92 312 4455667',
    email: 'farooq.ahmad@seswa.org',
    address: 'Civil Lines, Shewa',
    profession: 'Civil Engineer',
    bloodGroup: 'AB+',
    joinDate: '2022-02-14',
    status: 'ACTIVE',
    notes: 'Supervises water plant installations and community buildings.',
    createdAt: '2022-02-14T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'mem-005',
    membershipNo: 'SESWA-MEM-005',
    name: 'Ms. Sadia Parveen',
    fatherName: 'Muhammad Ismail',
    cnic: '12101-3322114-6',
    phone: '+92 301 2233445',
    email: 'sadia.parveen@seswa.org',
    address: 'Model Town, Shewa',
    profession: 'Educator & Community Activist',
    bloodGroup: 'B-',
    joinDate: '2022-09-01',
    status: 'ACTIVE',
    notes: 'In-charge of Women Skill Centers.',
    createdAt: '2022-09-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'mem-006',
    membershipNo: 'SESWA-MEM-006',
    name: 'Qari Bilal Hussain',
    fatherName: 'Hussain Shah',
    cnic: '12101-6655441-9',
    phone: '+92 306 7788990',
    email: 'bilal.hussain@seswa.org',
    address: 'Jamia Road, Shewa',
    profession: 'Religious Scholar & Social Worker',
    bloodGroup: 'O-',
    joinDate: '2020-11-20',
    status: 'ACTIVE',
    notes: 'Zakat & Sadqa Distribution Oversight.',
    createdAt: '2020-11-20T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'mem-007',
    membershipNo: 'SESWA-MEM-007',
    name: 'Rashid Mahmood',
    fatherName: 'Mahmood Akhtar',
    cnic: '12101-8877112-1',
    phone: '+92 321 6655443',
    email: 'rashid.audit@seswa.org',
    address: 'Officers Colony, Shewa',
    profession: 'Senior Internal Auditor',
    bloodGroup: 'A+',
    joinDate: '2021-08-15',
    status: 'ACTIVE',
    notes: 'Auditor and Compliance Officer.',
    createdAt: '2021-08-15T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'mem-008',
    membershipNo: 'SESWA-MEM-008',
    name: 'Imran Ali',
    fatherName: 'Ali Asghar',
    cnic: '12101-4455663-3',
    phone: '+92 344 1122334',
    email: 'imran.youth@seswa.org',
    address: 'Stadium Link Road, Shewa',
    profession: 'Software Developer & Youth Mentor',
    bloodGroup: 'O+',
    joinDate: '2023-01-10',
    status: 'ACTIVE',
    notes: 'Manages Youth IT Labs.',
    createdAt: '2023-01-10T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  }
];

export const INITIAL_ELECTIONS: ElectionTerm[] = [
  // Current 1-Year Active Terms for FY 2026-27 (2026-04-01 to 2027-03-31)
  {
    id: 'elec-2026-01',
    memberId: 'mem-001',
    memberName: 'Atta Ullah Khan',
    sectorId: 'sec-fin',
    sectorName: 'Finance & Accounts Sector',
    electionDate: '2026-03-25',
    termStartDate: '2026-04-01',
    termEndDate: '2027-03-31',
    status: 'ACTIVE',
    resolutionNo: 'SESWA/AGM-2026/RES-01',
    notificationRef: 'NOTIF-FIN-2026-01',
    notes: 'Elected Finance Secretary for term 2026-27 by General Body vote.',
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'elec-2026-02',
    memberId: 'mem-002',
    memberName: 'Dr. Muhammad Tariq',
    sectorId: 'sec-hlt',
    sectorName: 'Health & Medical Relief Sector',
    electionDate: '2026-03-25',
    termStartDate: '2026-04-01',
    termEndDate: '2027-03-31',
    status: 'ACTIVE',
    resolutionNo: 'SESWA/AGM-2026/RES-02',
    notificationRef: 'NOTIF-HLT-2026-01',
    notes: 'Elected In-Charge Health Sector for 1-year term.',
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'elec-2026-03',
    memberId: 'mem-003',
    memberName: 'Prof. Abdul Rehman',
    sectorId: 'sec-edu',
    sectorName: 'Education & Scholarships Sector',
    electionDate: '2026-03-25',
    termStartDate: '2026-04-01',
    termEndDate: '2027-03-31',
    status: 'ACTIVE',
    resolutionNo: 'SESWA/AGM-2026/RES-03',
    notificationRef: 'NOTIF-EDU-2026-01',
    notes: 'Elected In-Charge Education Sector for 1-year term.',
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'elec-2026-04',
    memberId: 'mem-004',
    memberName: 'Engr. Farooq Ahmad',
    sectorId: 'sec-soc',
    sectorName: 'Social Welfare & Community Support',
    electionDate: '2026-03-25',
    termStartDate: '2026-04-01',
    termEndDate: '2027-03-31',
    status: 'ACTIVE',
    resolutionNo: 'SESWA/AGM-2026/RES-04',
    notificationRef: 'NOTIF-SOC-2026-01',
    notes: 'Elected In-Charge Social Welfare & Infrastructure Sector.',
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'elec-2026-05',
    memberId: 'mem-008',
    memberName: 'Imran Ali',
    sectorId: 'sec-yth',
    sectorName: 'Youth Affairs & Vocational Training',
    electionDate: '2026-03-25',
    termStartDate: '2026-04-01',
    termEndDate: '2027-03-31',
    status: 'ACTIVE',
    resolutionNo: 'SESWA/AGM-2026/RES-05',
    notificationRef: 'NOTIF-YTH-2026-01',
    notes: 'Elected In-Charge Youth Affairs & Training.',
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'elec-2026-06',
    memberId: 'mem-005',
    memberName: 'Ms. Sadia Parveen',
    sectorId: 'sec-wom',
    sectorName: 'Women Empowerment Sector',
    electionDate: '2026-03-25',
    termStartDate: '2026-04-01',
    termEndDate: '2027-03-31',
    status: 'ACTIVE',
    resolutionNo: 'SESWA/AGM-2026/RES-06',
    notificationRef: 'NOTIF-WOM-2026-01',
    notes: 'Elected In-Charge Women Empowerment Sector.',
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'elec-2026-07',
    memberId: 'mem-007',
    memberName: 'Rashid Mahmood',
    sectorId: 'sec-aud',
    sectorName: 'Audit & Compliance Committee',
    electionDate: '2026-03-25',
    termStartDate: '2026-04-01',
    termEndDate: '2027-03-31',
    status: 'ACTIVE',
    resolutionNo: 'SESWA/AGM-2026/RES-07',
    notificationRef: 'NOTIF-AUD-2026-01',
    notes: 'Elected Chairman Audit Committee.',
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },

  // Historical Expired Terms for Audit & Integrity (FY 2025-26)
  {
    id: 'elec-2025-01',
    memberId: 'mem-001',
    memberName: 'Atta Ullah Khan',
    sectorId: 'sec-fin',
    sectorName: 'Finance & Accounts Sector',
    electionDate: '2025-03-20',
    termStartDate: '2025-04-01',
    termEndDate: '2026-03-31',
    status: 'EXPIRED',
    resolutionNo: 'SESWA/AGM-2025/RES-01',
    notificationRef: 'NOTIF-FIN-2025-01',
    notes: 'Completed 1-year term successfully. Re-elected for 2026-27.',
    createdAt: '2025-03-20T10:00:00.000Z',
    updatedAt: '2026-03-31T23:59:59.000Z'
  },
  {
    id: 'elec-2025-02',
    memberId: 'mem-006',
    memberName: 'Qari Bilal Hussain',
    sectorId: 'sec-soc',
    sectorName: 'Social Welfare & Community Support',
    electionDate: '2025-03-20',
    termStartDate: '2025-04-01',
    termEndDate: '2026-03-31',
    status: 'EXPIRED',
    resolutionNo: 'SESWA/AGM-2025/RES-04',
    notificationRef: 'NOTIF-SOC-2025-01',
    notes: 'Completed 1-year term for Social Welfare.',
    createdAt: '2025-03-20T10:00:00.000Z',
    updatedAt: '2026-03-31T23:59:59.000Z'
  }
];

export const INITIAL_ACCOUNTS: Account[] = [
  // ASSETS (1000s)
  {
    id: 'acc-1010',
    code: '1010',
    name: 'Cash in Hand (Main Cash Book)',
    category: 'ASSET',
    subCategory: 'Cash & Cash Equivalents',
    openingBalance: 185450,
    currentBalance: 245950,
    description: 'Physical cash available in the SESWA finance safe for daily operations and disbursements.',
    isActive: true,
    isSystemAccount: true
  },
  {
    id: 'acc-1015',
    code: '1015',
    name: 'Petty Cash Register',
    category: 'ASSET',
    subCategory: 'Cash & Cash Equivalents',
    openingBalance: 15000,
    currentBalance: 12400,
    description: 'Imprest petty cash fund for minor office tea, transport and courier expenses.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-1020',
    code: '1020',
    name: 'Meezan Bank (Islamic A/C #0215-01049281)',
    category: 'ASSET',
    subCategory: 'Bank Balances',
    openingBalance: 850000,
    currentBalance: 1145000,
    description: 'Main operational Islamic bank account for donations, grants and electronic payments.',
    isActive: true,
    isSystemAccount: true
  },
  {
    id: 'acc-1030',
    code: '1030',
    name: 'Habib Bank Limited (HBL A/C #1184-790123)',
    category: 'ASSET',
    subCategory: 'Bank Balances',
    openingBalance: 420000,
    currentBalance: 395000,
    description: 'Secondary bank account for local utility bill settlements and member collection.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-1040',
    code: '1040',
    name: 'Staff Loan Receivables',
    category: 'ASSET',
    subCategory: 'Receivables',
    openingBalance: 65000,
    currentBalance: 45000,
    description: 'Interest-free staff welfare loans recoverable through monthly salary deductions.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-1050',
    code: '1050',
    name: 'Advance to Project Coordinators',
    category: 'ASSET',
    subCategory: 'Advances',
    openingBalance: 30000,
    currentBalance: 20000,
    description: 'Temporary imprest advances provided to field teams for camp logistics.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-1060',
    code: '1060',
    name: 'Office Equipment & Furniture',
    category: 'ASSET',
    subCategory: 'Fixed Assets',
    openingBalance: 350000,
    currentBalance: 350000,
    description: 'Computers, printers, furniture and solar power backup setup at SESWA secretariat.',
    isActive: true,
    isSystemAccount: false
  },

  // LIABILITIES (2000s)
  {
    id: 'acc-2010',
    code: '2010',
    name: 'Accounts Payable / Trade Creditors',
    category: 'LIABILITY',
    subCategory: 'Current Liabilities',
    openingBalance: 25000,
    currentBalance: 15000,
    description: 'Outstanding payments due to medicine suppliers, printing press, and vendors.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-2020',
    code: '2020',
    name: 'EOBI Payable Account',
    category: 'LIABILITY',
    subCategory: 'Statutory Dues',
    openingBalance: 0,
    currentBalance: 7200,
    description: 'Accumulated employee and employer EOBI statutory contributions awaiting bank challan payment.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-2030',
    code: '2030',
    name: 'Accrued Audit & Professional Fees',
    category: 'LIABILITY',
    subCategory: 'Accrued Expenses',
    openingBalance: 20000,
    currentBalance: 20000,
    description: 'Provision for annual external audit and compliance filings.',
    isActive: true,
    isSystemAccount: false
  },

  // EQUITY / FUNDS (3000s)
  {
    id: 'acc-3010',
    code: '3010',
    name: 'General Fund / Accumulated Surplus',
    category: 'EQUITY',
    subCategory: 'Unrestricted Funds',
    openingBalance: 1100450,
    currentBalance: 1100450,
    description: 'Unrestricted accumulated fund of SESWA carried forward.',
    isActive: true,
    isSystemAccount: true
  },
  {
    id: 'acc-3020',
    code: '3020',
    name: 'Zakat & Sadqa Dedicated Fund',
    category: 'EQUITY',
    subCategory: 'Restricted Funds',
    openingBalance: 400000,
    currentBalance: 400000,
    description: 'Strictly restricted fund for sharia-compliant eligible beneficiaries (mustahqeen).',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-3030',
    code: '3030',
    name: 'Education Scholarship Endowment Fund',
    category: 'EQUITY',
    subCategory: 'Designated Funds',
    openingBalance: 300000,
    currentBalance: 300000,
    description: 'Endowment fund for recurring student stipends and merit awards.',
    isActive: true,
    isSystemAccount: false
  },

  // INCOME (4000s)
  {
    id: 'acc-4010',
    code: '4010',
    name: 'General Public Donations',
    category: 'INCOME',
    subCategory: 'Donations & Contributions',
    openingBalance: 0,
    currentBalance: 485000,
    description: 'Voluntary donations received from local and overseas philanthropists.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-4020',
    code: '4020',
    name: 'Member Monthly Subscriptions',
    category: 'INCOME',
    subCategory: 'Membership Fees',
    openingBalance: 0,
    currentBalance: 48000,
    description: 'Monthly dues collected from registered SESWA members (Rs. 500/month).',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-4030',
    code: '4030',
    name: 'Zakat Collections',
    category: 'INCOME',
    subCategory: 'Restricted Income',
    openingBalance: 0,
    currentBalance: 350000,
    description: 'Zakat funds received for direct distribution to verified poor families.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-4040',
    code: '4040',
    name: 'Institutional Grants & Sponsorships',
    category: 'INCOME',
    subCategory: 'Grants',
    openingBalance: 0,
    currentBalance: 600000,
    description: 'Grants received from partner NGOs and government welfare trusts.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-4050',
    code: '4050',
    name: 'Profit on Bank Islamic Term Deposits',
    category: 'INCOME',
    subCategory: 'Other Income',
    openingBalance: 0,
    currentBalance: 38200,
    description: 'Halal profit earned on Islamic bank savings accounts.',
    isActive: true,
    isSystemAccount: false
  },

  // EXPENSES (5000s)
  {
    id: 'acc-5010',
    code: '5010',
    name: 'Project Relief & Field Execution Expenses',
    category: 'EXPENSE',
    subCategory: 'Program Costs',
    openingBalance: 0,
    currentBalance: 320000,
    description: 'Cost of relief packages, emergency supplies, and field distributions.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-5020',
    code: '5020',
    name: 'Scholarship & Educational Disbursements',
    category: 'EXPENSE',
    subCategory: 'Program Costs',
    openingBalance: 0,
    currentBalance: 180000,
    description: 'School fee payments, textbook kits, and university student stipends.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-5030',
    code: '5030',
    name: 'Medical Camp, Diagnostic & Medicine Aid',
    category: 'EXPENSE',
    subCategory: 'Program Costs',
    openingBalance: 0,
    currentBalance: 145000,
    description: 'Purchase of prescription medicines, doctor honorariums, and camp banners.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-5040',
    code: '5040',
    name: 'Staff Salaries & Field Honorariums',
    category: 'EXPENSE',
    subCategory: 'Personnel Costs',
    openingBalance: 0,
    currentBalance: 160000,
    description: 'Salaries for full-time office secretary, field coordinators, and caretakers.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-5050',
    code: '5050',
    name: 'EOBI Employer Contribution Expense',
    category: 'EXPENSE',
    subCategory: 'Statutory Expenses',
    openingBalance: 0,
    currentBalance: 6000,
    description: '5% statutory employer contribution paid to EOBI Pakistan.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-5060',
    code: '5060',
    name: 'Office Rent & Utility Bills',
    category: 'EXPENSE',
    subCategory: 'Administrative Costs',
    openingBalance: 0,
    currentBalance: 65000,
    description: 'Secretariat building rent, electricity, gas, and high-speed internet bills.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-5070',
    code: '5070',
    name: 'Printing, Stationery & Postage',
    category: 'EXPENSE',
    subCategory: 'Administrative Costs',
    openingBalance: 0,
    currentBalance: 18500,
    description: 'Receipt books, voucher pads, membership cards, envelopes and postal charges.',
    isActive: true,
    isSystemAccount: false
  },
  {
    id: 'acc-5080',
    code: '5080',
    name: 'Bank Charges & Government Withholding Taxes',
    category: 'EXPENSE',
    subCategory: 'Financial Charges',
    openingBalance: 0,
    currentBalance: 4200,
    description: 'Cheque book charges, online transfer fees, and statutory withholding deductions.',
    isActive: true,
    isSystemAccount: false
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-001',
    code: 'PRJ-2026-01',
    name: 'Shewa Free Eye & Medical Camp 2026',
    sectorId: 'sec-hlt',
    sectorName: 'Health & Medical Relief Sector',
    startDate: '2026-04-10',
    endDate: '2026-04-15',
    budgetAmount: 250000,
    totalIncome: 280000,
    totalExpense: 145000,
    status: 'ACTIVE',
    location: 'DHQ Hospital Complex, Shewa',
    beneficiariesCount: 1450,
    description: '3-day specialized ophthalmic screening, free cataract surgeries, and distribution of eye glasses.',
    createdAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: 'prj-002',
    code: 'PRJ-2026-02',
    name: 'Higher Secondary Merit Scholarship Drive 2026',
    sectorId: 'sec-edu',
    sectorName: 'Education & Scholarships Sector',
    startDate: '2026-05-01',
    endDate: '2027-02-28',
    budgetAmount: 500000,
    totalIncome: 450000,
    totalExpense: 180000,
    status: 'ACTIVE',
    location: 'Government Degree Colleges in Shewa District',
    beneficiariesCount: 45,
    description: 'Tuition support, uniforms, and monthly stipends for high-achieving underprivileged students.',
    createdAt: '2026-04-05T00:00:00.000Z'
  },
  {
    id: 'prj-003',
    code: 'PRJ-2026-03',
    name: 'Clean Drinking Water Solar Filtration Plant #4',
    sectorId: 'sec-soc',
    sectorName: 'Social Welfare & Community Support',
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    budgetAmount: 650000,
    totalIncome: 600000,
    totalExpense: 320000,
    status: 'ACTIVE',
    location: 'Village Garhi, Shewa',
    beneficiariesCount: 3200,
    description: 'Installation of high-capacity reverse osmosis solar water purification plant.',
    createdAt: '2026-04-10T00:00:00.000Z'
  },
  {
    id: 'prj-004',
    code: 'PRJ-2026-04',
    name: 'Youth IT & Digital Freelancing Lab',
    sectorId: 'sec-yth',
    sectorName: 'Youth Affairs & Vocational Training',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    budgetAmount: 400000,
    totalIncome: 200000,
    totalExpense: 75000,
    status: 'PLANNING',
    location: 'SESWA Community Center, 2nd Floor',
    beneficiariesCount: 120,
    description: 'Setting up 20 workstations with solar backup and fiber broadband for youth skill training.',
    createdAt: '2026-04-12T00:00:00.000Z'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Cash Receipts
  {
    id: 'tx-crv-001',
    voucherNo: 'CRV-2026-001',
    type: 'CASH_RECEIPT',
    date: '2026-04-02',
    accountId: 'acc-1010',
    accountName: 'Cash in Hand (Main Cash Book)',
    offsetAccountId: 'acc-4010',
    offsetAccountName: 'General Public Donations',
    amount: 50000,
    partyName: 'Haji Ghulam Rasool',
    projectId: 'prj-001',
    projectName: 'Shewa Free Eye & Medical Camp 2026',
    sectorId: 'sec-hlt',
    sectorName: 'Health & Medical Relief Sector',
    referenceNo: 'RCPT-1041',
    description: 'Cash donation received towards Free Eye Camp medicines and surgical kits.',
    supportingDocRef: 'Receipt Slip #1041',
    status: 'POSTED',
    createdAt: '2026-04-02T11:30:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },
  {
    id: 'tx-crv-002',
    voucherNo: 'CRV-2026-002',
    type: 'CASH_RECEIPT',
    date: '2026-04-05',
    accountId: 'acc-1010',
    accountName: 'Cash in Hand (Main Cash Book)',
    offsetAccountId: 'acc-4020',
    offsetAccountName: 'Member Monthly Subscriptions',
    amount: 12000,
    partyName: 'General Members Collection (24 Members)',
    referenceNo: 'MEM-SUB-0426',
    description: 'Monthly membership subscription fee collection for April 2026 @ Rs. 500 each.',
    supportingDocRef: 'Member Sheet #04/2026',
    status: 'POSTED',
    createdAt: '2026-04-05T14:15:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },
  {
    id: 'tx-crv-003',
    voucherNo: 'CRV-2026-003',
    type: 'CASH_RECEIPT',
    date: '2026-04-10',
    accountId: 'acc-1010',
    accountName: 'Cash in Hand (Main Cash Book)',
    offsetAccountId: 'acc-4030',
    offsetAccountName: 'Zakat Collections',
    amount: 85000,
    partyName: 'Malik Sher Zaman',
    referenceNo: 'ZAKAT-2026-09',
    description: 'Zakat contribution received in cash for destitute widows and orphan support.',
    supportingDocRef: 'Zakat Voucher #09',
    status: 'POSTED',
    createdAt: '2026-04-10T16:00:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },

  // Cash Payments
  {
    id: 'tx-cpv-001',
    voucherNo: 'CPV-2026-001',
    type: 'CASH_PAYMENT',
    date: '2026-04-03',
    accountId: 'acc-1010',
    accountName: 'Cash in Hand (Main Cash Book)',
    offsetAccountId: 'acc-5070',
    offsetAccountName: 'Printing, Stationery & Postage',
    amount: 8500,
    partyName: 'Al-Madina Printing Press',
    referenceNo: 'INV-4412',
    description: 'Printing of annual cash vouchers, receipt books and medical camp banners.',
    supportingDocRef: 'Original Bill #4412 Attached',
    status: 'POSTED',
    createdAt: '2026-04-03T10:00:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },
  {
    id: 'tx-cpv-002',
    voucherNo: 'CPV-2026-002',
    type: 'CASH_PAYMENT',
    date: '2026-04-11',
    accountId: 'acc-1010',
    accountName: 'Cash in Hand (Main Cash Book)',
    offsetAccountId: 'acc-5030',
    offsetAccountName: 'Medical Camp, Diagnostic & Medicine Aid',
    amount: 45000,
    partyName: 'Khyber Medicos & Surgical',
    projectId: 'prj-001',
    projectName: 'Shewa Free Eye & Medical Camp 2026',
    sectorId: 'sec-hlt',
    sectorName: 'Health & Medical Relief Sector',
    referenceNo: 'BILL-8890',
    description: 'Emergency eye drops, sterile bandages, and surgical disposables for Eye Camp Day 1.',
    supportingDocRef: 'Verified by Dr. Tariq (Sector In-Charge)',
    status: 'POSTED',
    createdAt: '2026-04-11T12:00:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },
  {
    id: 'tx-cpv-003',
    voucherNo: 'CPV-2026-003',
    type: 'CASH_PAYMENT',
    date: '2026-04-15',
    accountId: 'acc-1010',
    accountName: 'Cash in Hand (Main Cash Book)',
    offsetAccountId: 'acc-5060',
    offsetAccountName: 'Office Rent & Utility Bills',
    amount: 32000,
    partyName: 'PESCO Electricity & Secretariat Landlord',
    referenceNo: 'UTIL-04-2026',
    description: 'SESWA Secretariat monthly office rent (Rs. 20,000) and electricity bill (Rs. 12,000).',
    supportingDocRef: 'Paid Bill Receipts Attached',
    status: 'POSTED',
    createdAt: '2026-04-15T15:30:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },

  // Bank Receipts
  {
    id: 'tx-brv-001',
    voucherNo: 'BRV-2026-001',
    type: 'BANK_RECEIPT',
    date: '2026-04-08',
    accountId: 'acc-1020',
    accountName: 'Meezan Bank (Islamic A/C #0215-01049281)',
    offsetAccountId: 'acc-4040',
    offsetAccountName: 'Institutional Grants & Sponsorships',
    amount: 350000,
    partyName: 'Global Friends Welfare Trust (UK Chapter)',
    bankName: 'Meezan Bank Ltd',
    referenceNo: 'FT-ONLINE-881920',
    projectId: 'prj-003',
    projectName: 'Clean Drinking Water Solar Filtration Plant #4',
    sectorId: 'sec-soc',
    sectorName: 'Social Welfare & Community Support',
    description: 'Institutional grant tranche 1 received via online SWIFT for Solar Water Filtration Plant #4.',
    supportingDocRef: 'Bank Credit Advice #MEEZ-881920',
    status: 'POSTED',
    createdAt: '2026-04-08T10:00:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },

  // Bank Payments
  {
    id: 'tx-bpv-001',
    voucherNo: 'BPV-2026-001',
    type: 'BANK_PAYMENT',
    date: '2026-04-14',
    accountId: 'acc-1020',
    accountName: 'Meezan Bank (Islamic A/C #0215-01049281)',
    offsetAccountId: 'acc-5020',
    offsetAccountName: 'Scholarship & Educational Disbursements',
    amount: 90000,
    partyName: 'Principal Govt Post Graduate College Shewa',
    bankName: 'Meezan Bank Ltd',
    chequeNo: 'CHQ-890112',
    projectId: 'prj-002',
    projectName: 'Higher Secondary Merit Scholarship Drive 2026',
    sectorId: 'sec-edu',
    sectorName: 'Education & Scholarships Sector',
    referenceNo: 'CHQ-890112',
    description: 'Cross Cheque issued for semester tuition fees of 18 enrolled deserving students.',
    supportingDocRef: 'Sanction Order #SESWA-EDU-2026-14',
    status: 'POSTED',
    createdAt: '2026-04-14T11:00:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },

  // Bank Transfers / Contra
  {
    id: 'tx-trv-001',
    voucherNo: 'TRV-2026-001',
    type: 'BANK_TRANSFER',
    date: '2026-04-04',
    accountId: 'acc-1020', // From Meezan Bank
    accountName: 'Meezan Bank (Islamic A/C #0215-01049281)',
    offsetAccountId: 'acc-1010', // To Cash in Hand
    offsetAccountName: 'Cash in Hand (Main Cash Book)',
    amount: 60000,
    partyName: 'Self Cash Withdrawal for Operations',
    bankName: 'Meezan Bank Ltd',
    chequeNo: 'CHQ-890101',
    referenceNo: 'WDL-890101',
    description: 'Cash withdrawal from Meezan Bank to replenish physical cash safe for camp expenses.',
    supportingDocRef: 'Cheque Counterfoil #890101',
    status: 'POSTED',
    createdAt: '2026-04-04T09:30:00.000Z',
    createdBy: 'Atta Ullah Khan'
  },

  // Double Entry Journal Voucher
  {
    id: 'tx-jv-001',
    voucherNo: 'JV-2026-001',
    type: 'JOURNAL_ENTRY',
    date: '2026-04-30',
    accountId: 'acc-5050',
    accountName: 'EOBI Employer Contribution Expense',
    amount: 7200,
    referenceNo: 'EOBI-PROV-0426',
    description: 'Monthly provision for staff EOBI contribution for April 2026.',
    status: 'POSTED',
    journalLines: [
      {
        id: 'jl-01',
        accountId: 'acc-5050',
        accountCode: '5050',
        accountName: 'EOBI Employer Contribution Expense',
        debit: 6000,
        credit: 0,
        narration: 'Employer 5% EOBI share for 3 registered employees'
      },
      {
        id: 'jl-02',
        accountId: 'acc-5040',
        accountCode: '5040',
        accountName: 'Staff Salaries & Field Honorariums',
        debit: 1200,
        credit: 0,
        narration: 'Employee 1% salary deduction withheld for EOBI'
      },
      {
        id: 'jl-03',
        accountId: 'acc-2020',
        accountCode: '2020',
        accountName: 'EOBI Payable Account',
        debit: 0,
        credit: 7200,
        narration: 'Total EOBI statutory liability payable via NBP challan'
      }
    ],
    createdAt: '2026-04-30T17:00:00.000Z',
    createdBy: 'Atta Ullah Khan'
  }
];

export const INITIAL_STAFF_LOANS: StaffLoan[] = [
  {
    id: 'loan-001',
    loanNo: 'LN-2026-001',
    staffName: 'Asadullah Shah',
    staffDesignation: 'Senior Field Coordinator',
    phone: '+92 334 5566778',
    cnic: '12101-3344556-7',
    issueDate: '2026-01-15',
    principalAmount: 40000,
    monthlyDeduction: 5000,
    repaidAmount: 15000,
    outstandingBalance: 25000,
    disbursementAccountId: 'acc-1010',
    reason: 'Emergency home roof repair after winter snowfall.',
    status: 'ACTIVE',
    repayments: [
      {
        id: 'rep-01',
        loanId: 'loan-001',
        date: '2026-02-28',
        amount: 5000,
        paymentMethod: 'SALARY_DEDUCTION',
        receiptRef: 'SAL-DED-0226',
        notes: 'Deducted from February salary',
        recordedAt: '2026-02-28T00:00:00.000Z'
      },
      {
        id: 'rep-02',
        loanId: 'loan-001',
        date: '2026-03-31',
        amount: 5000,
        paymentMethod: 'SALARY_DEDUCTION',
        receiptRef: 'SAL-DED-0326',
        notes: 'Deducted from March salary',
        recordedAt: '2026-03-31T00:00:00.000Z'
      },
      {
        id: 'rep-03',
        loanId: 'loan-001',
        date: '2026-04-30',
        amount: 5000,
        paymentMethod: 'SALARY_DEDUCTION',
        receiptRef: 'SAL-DED-0426',
        notes: 'Deducted from April salary',
        recordedAt: '2026-04-30T00:00:00.000Z'
      }
    ],
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'loan-002',
    loanNo: 'LN-2026-002',
    staffName: 'Naeem Akhtar',
    staffDesignation: 'Office Assistant & Caretaker',
    phone: '+92 346 9988771',
    cnic: '12101-7788990-1',
    issueDate: '2026-02-01',
    principalAmount: 25000,
    monthlyDeduction: 5000,
    repaidAmount: 5000,
    outstandingBalance: 20000,
    disbursementAccountId: 'acc-1010',
    reason: 'Child medical hospitalization expenses.',
    status: 'ACTIVE',
    repayments: [
      {
        id: 'rep-04',
        loanId: 'loan-002',
        date: '2026-04-10',
        amount: 5000,
        paymentMethod: 'CASH',
        receiptRef: 'RCPT-LN-002',
        notes: 'Direct cash installment deposit',
        recordedAt: '2026-04-10T00:00:00.000Z'
      }
    ],
    createdAt: '2026-02-01T00:00:00.000Z'
  }
];

export const INITIAL_EOBI_EMPLOYEES: EOBIEmployee[] = [
  {
    id: 'eobi-emp-001',
    employeeName: 'Asadullah Shah',
    designation: 'Senior Field Coordinator',
    cnic: '12101-3344556-7',
    eobiNumber: 'EOBI-NW-992140',
    registrationDate: '2022-04-01',
    basicSalary: 45000,
    employeeShareRate: 0.01,
    employerShareRate: 0.05,
    isActive: true
  },
  {
    id: 'eobi-emp-002',
    employeeName: 'Naeem Akhtar',
    designation: 'Office Assistant & Caretaker',
    cnic: '12101-7788990-1',
    eobiNumber: 'EOBI-NW-992141',
    registrationDate: '2023-01-01',
    basicSalary: 35000,
    employeeShareRate: 0.01,
    employerShareRate: 0.05,
    isActive: true
  },
  {
    id: 'eobi-emp-003',
    employeeName: 'Muhammad Zakir',
    designation: 'IT Lab Technician',
    cnic: '12101-5566778-9',
    eobiNumber: 'EOBI-NW-992142',
    registrationDate: '2024-06-01',
    basicSalary: 40000,
    employeeShareRate: 0.01,
    employerShareRate: 0.05,
    isActive: true
  }
];

export const INITIAL_EOBI_RECORDS: EOBIContributionRecord[] = [
  {
    id: 'eobi-rec-2026-03',
    month: '2026-03',
    year: 2026,
    totalEmployees: 3,
    employeeShareTotal: 1200,
    employerShareTotal: 6000,
    grandTotal: 7200,
    bankChallanNo: 'NBP-EOBI-CHL-0326',
    paymentDate: '2026-04-10',
    paidFromAccountId: 'acc-1020',
    status: 'PAID',
    remarks: 'Paid via National Bank of Pakistan Online Challan.',
    createdAt: '2026-04-10T00:00:00.000Z'
  },
  {
    id: 'eobi-rec-2026-04',
    month: '2026-04',
    year: 2026,
    totalEmployees: 3,
    employeeShareTotal: 1200,
    employerShareTotal: 6000,
    grandTotal: 7200,
    bankChallanNo: 'NBP-EOBI-CHL-0426',
    paymentDate: undefined,
    paidFromAccountId: 'acc-1020',
    status: 'PENDING',
    remarks: 'Challan generated for April 2026; payment due by 15th May.',
    createdAt: '2026-04-30T00:00:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-04-01T09:00:00.000Z',
    user: 'Atta Ullah Khan',
    action: 'LOGIN',
    module: 'Security & Auth',
    entityId: 'usr-attaullah',
    details: 'Authorized Finance User logged in from SESWA Secretariat Station.'
  },
  {
    id: 'log-002',
    timestamp: '2026-04-01T09:15:00.000Z',
    user: 'Atta Ullah Khan',
    action: 'ELECTION_ASSIGN',
    module: 'Election & 1-Year Terms',
    entityId: 'elec-2026-01',
    details: 'Assigned Atta Ullah Khan to Finance Sector for 1-year term (2026-04-01 to 2027-03-31).'
  },
  {
    id: 'log-003',
    timestamp: '2026-04-02T11:30:00.000Z',
    user: 'Atta Ullah Khan',
    action: 'CREATE',
    module: 'Cash Transactions',
    entityId: 'CRV-2026-001',
    details: 'Recorded Cash Receipt of Rs. 50,000 from Haji Ghulam Rasool for Eye Camp.'
  },
  {
    id: 'log-004',
    timestamp: '2026-04-03T10:00:00.000Z',
    user: 'Atta Ullah Khan',
    action: 'CREATE',
    module: 'Cash Transactions',
    entityId: 'CPV-2026-001',
    details: 'Recorded Cash Payment of Rs. 8,500 to Al-Madina Printing Press.'
  },
  {
    id: 'log-005',
    timestamp: '2026-04-08T10:00:00.000Z',
    user: 'Atta Ullah Khan',
    action: 'CREATE',
    module: 'Bank Transactions',
    entityId: 'BRV-2026-001',
    details: 'Recorded Bank Receipt of Rs. 350,000 in Meezan Bank from Global Friends Trust.'
  }
];
