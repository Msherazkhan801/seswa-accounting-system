# SESWA Finance Management & Accounting System (v1.0)

**Organization**: Shewa Educated Social Workers Association (SESWA)  
**Department**: Finance Sector — Central Secretariat, Shewa, Khyber Pakhtunkhwa  
**Reference**: *Atta Ullah Cash Book FY 2026–27*  

---

## 📌 Overview

The **SESWA Finance Management & Accounting System** is a modern, high-performance financial management and accounting application built for the **Shewa Educated Social Workers Association (SESWA)**. It replaces legacy manual Excel workflows with a centralized, secure system for recording cash/bank transactions, managing elected sector leadership, tracking community projects, maintaining double-entry general ledgers, managing staff welfare loans, and generating official audit-ready reports.

---

## ✨ Key Features & Modules

### 1. 📊 Executive Dashboard & Liquidity Center (FR-002)
- Real-time liquidity tracking across Cash in Hand, Bank Accounts (HBL & NBP), Restricted Project Balances, Outstanding Staff Loans, and EOBI Reserves.
- Constitutional **1-Year Election Term Expiry Warning Banner** with countdown alerts.
- Supervised project progress indicators (Budget vs. Actuals).
- Recent transaction vouchers with quick voucher slip printing.

### 2. 👥 Member Management & Directory (FR-003)
- Member registration with CNIC validation (`XXXXX-XXXXXXX-X`), blood group, contact info, and status.
- Member Profile Drawer displaying current sector assignment and lifetime historical election log.

### 3. 🏛️ Sector & Portfolio Management (FR-004)
- Management of SESWA organizational sectors (Education, Health, Youth Development, Finance, Public Relations, etc.).
- Sector cards detailing elected heads, tenure dates, and supervised projects.

### 4. 🗳️ 1-Year Election Term Engine (FR-005)
- Automatic calculation of exact **1-year constitutional terms** (`termEndDate = startDate + 1 year - 1 day`).
- **Conflict Prevention Engine**: Proactively detects existing sector holders to prevent duplicate active tenures.
- Full lifecycle tracking (`Active`, `Expiring Soon`, `Concluded/Expired`, `Terminated`).

### 5. 💰 Cash & Bank Operations (FR-008 & FR-009)
- **Cash Book**: Cash Receipts (`CRV`) and Cash Payments (`CPV`).
- **Bank Book**: Bank Receipts (`BRV`), Bank Payments (`BPV`), and Contra Transfers (`TRV`).
- Auto-generated sequential voucher numbering.
- Print-ready official SESWA voucher slips with authorized signature lines (Finance Secretary, General Secretary, President).

### 6. 📁 Community Project Portfolio (FR-007)
- Projects supervised by specific sectors with dedicated budget allocations.
- Real-time income and expenditure tracking with budget utilization progress bars.

### 7. 📖 Chart of Accounts & General Ledger (FR-006)
- 5 Account Categories: Assets, Liabilities, Equity, Income, and Expenses.
- Detailed running balance General Ledger statements for every account.

### 8. ⚖️ Double-Entry Journal Vouchers & Trial Balance (FR-010)
- Balanced Journal Voucher (`JV`) entry maker with real-time discrepancy checker.
- Auto-balanced **Trial Balance** verifying $\sum \text{Debits} = \sum \text{Credits}$.

### 9. 🤝 Staff Welfare Loans & Advances (FR-011)
- Loan disbursement, monthly deduction tracking, repayment history, and outstanding balances.

### 10. 📋 EOBI Statutory Contributions (FR-012)
- Staff EOBI registrations, statutory contribution calculations (1% employee share, 5% employer share), and NBP challan payment logging.

### 11. 📑 Reports Suite & Excel Manager (FR-014 & FR-015)
- **12 Comprehensive Financial & Governance Statements** with on-screen preview, print/PDF layout, and Excel (`.xlsx`) export:
  1. Cash Book Report
  2. Bank Book Report
  3. Combined Cash & Bank Summary
  4. Account Ledger Statement
  5. Trial Balance
  6. Project Income & Expenditure
  7. Staff Loan Roster & Recovery Statement
  8. EOBI Monthly Contributions Register
  9. Active 1-Year Sector Holders Roster
  10. Member Directory & Election Archives
  11. Expired / Historical Election Terms
  12. Sector-wise Allocation Report
- Excel Import wizard with pre-import validation and template downloads.

### 12. 🔒 Transaction Control & Security (FR-016 & FR-017)
- Controlled transaction reversal / voiding with mandatory audit notes (no silent deletions).
- Comprehensive immutable activity and audit history log.
- Local Storage persistence, JSON Database Backup & Restore.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or newer)
- `npm`, `pnpm`, or `yarn`

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/Msherazkhan801/seswa-accounting-system.git

# Navigate into project directory
cd seswa-accounting-system

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials

- **Email**: `finance@seswa.org.pk`
- **Password**: `seswa2026`
*(Or click **"One-Click Login as Atta Ullah Khan"** on the sign-in screen)*

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: TailwindCSS & Lucide Icons
- **Data Exporting**: SheetJS (`xlsx`) for Excel spreadsheets & native CSS Print Styles for official PDF vouchers
- **State Management**: React Context API with LocalStorage sync

---

## 📄 License & Organization
© 2026 **Shewa Educated Social Workers Association (SESWA)**. All Rights Reserved.
