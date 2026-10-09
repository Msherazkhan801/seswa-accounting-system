'use client';

import React from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoginScreen from '../components/LoginScreen';
import VoucherSlipModal from '../components/VoucherSlipModal';

import DashboardView from '../components/Dashboard/DashboardView';
import MembersView from '../components/Members/MembersView';
import SectorsView from '../components/Sectors/SectorsView';
import ElectionsView from '../components/Elections/ElectionsView';
import AccountsView from '../components/Accounts/AccountsView';
import ProjectsView from '../components/Projects/ProjectsView';
import CashTransactionsView from '../components/CashTransactions/CashTransactionsView';
import BankTransactionsView from '../components/BankTransactions/BankTransactionsView';
import AccountingView from '../components/Accounting/AccountingView';
import StaffLoansView from '../components/StaffLoans/StaffLoansView';
import EOBIView from '../components/EOBI/EOBIView';
import ReportsView from '../components/Reports/ReportsView';
import ExcelManagerView from '../components/ExcelManager/ExcelManagerView';
import AuditLogView from '../components/AuditLog/AuditLogView';
import SettingsView from '../components/Settings/SettingsView';

function MainApp() {
  const { isAuthenticated, activeTab } = useApp();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'members':
        return <MembersView />;
      case 'sectors':
        return <SectorsView />;
      case 'elections':
        return <ElectionsView />;
      case 'accounts':
      case 'ledger':
        return <AccountsView />;
      case 'projects':
        return <ProjectsView />;
      case 'cash':
        return <CashTransactionsView />;
      case 'bank':
        return <BankTransactionsView />;
      case 'journal':
      case 'trial-balance':
      case 'accounting':
        return <AccountingView />;
      case 'loans':
        return <StaffLoansView />;
      case 'eobi':
        return <EOBIView />;
      case 'reports':
        return <ReportsView />;
      case 'excel':
        return <ExcelManagerView />;
      case 'audit':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      <VoucherSlipModal />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
