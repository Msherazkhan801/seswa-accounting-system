'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  Award,
  Wallet,
  Landmark,
  FolderKanban,
  BadgePercent,
  Receipt,
  BookOpen,
  Scale,
  FileBarChart,
  FileSpreadsheet,
  History,
  Settings,
  AlertCircle
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const { activeTab, setActiveTab, stats } = useApp();

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'ORGANIZATION & GOVERNANCE',
      items: [
        { id: 'members', label: 'Members Directory', icon: Users, badge: stats.activeMembersCount },
        { id: 'sectors', label: 'Sectors / Positions', icon: Grid3X3, badge: stats.activeSectorsCount },
        { 
          id: 'elections', 
          label: '1-Year Election Terms', 
          icon: Award, 
          badge: stats.expiringTermsCount > 0 ? `${stats.expiringTermsCount} Expiring` : `${stats.activeElectionsCount} Active`,
          badgeColor: stats.expiringTermsCount > 0 ? 'bg-amber-500 text-black animate-pulse font-bold' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
        }
      ]
    },
    {
      title: 'CASH & BANK OPERATIONS',
      items: [
        { id: 'cash', label: 'Cash Transactions', icon: Wallet },
        { id: 'bank', label: 'Bank Transactions', icon: Landmark },
        { id: 'projects', label: 'Project Portfolio', icon: FolderKanban, badge: stats.activeProjectsCount },
        { id: 'loans', label: 'Staff Loans', icon: BadgePercent },
        { id: 'eobi', label: 'EOBI Contributions', icon: Receipt }
      ]
    },
    {
      title: 'ACCOUNTING & LEDGERS',
      items: [
        { id: 'accounts', label: 'Chart of Accounts', icon: BookOpen },
        { id: 'journal', label: 'Journal Entries (JV)', icon: Receipt },
        { id: 'ledger', label: 'General Ledger', icon: BookOpen },
        { id: 'trial-balance', label: 'Trial Balance', icon: Scale }
      ]
    },
    {
      title: 'REPORTS & DATA TOOLS',
      items: [
        { id: 'reports', label: 'Reports Suite (PDF/XLS)', icon: FileBarChart },
        { id: 'excel', label: 'Excel Import / Export', icon: FileSpreadsheet },
        { id: 'audit', label: 'Audit & Activity Log', icon: History },
        { id: 'settings', label: 'Backup & Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-zinc-900 text-zinc-300 flex flex-col border-r border-zinc-800 select-none shrink-0 min-h-[calc(100vh-4rem)]">
      
      {/* Sidebar Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-zinc-400 group-hover:text-emerald-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          item.badgeColor || (isActive ? 'bg-emerald-700 text-white' : 'bg-zinc-800 text-zinc-400')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="p-3 bg-zinc-950/60 border-t border-zinc-800/80 text-xs text-zinc-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SESWA Live DB</span>
          </span>
          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
            v1.0 (FY 26-27)
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 mt-1 truncate">
          Ref: Atta Ullah Cash Book
        </div>
      </div>

    </aside>
  );
}
