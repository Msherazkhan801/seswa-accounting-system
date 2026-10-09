'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  FileSpreadsheet, 
  User, 
  Clock, 
  Activity,
  Calendar
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { exportToExcel } from '../../utils/exportUtils';

export default function AuditLogView() {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesModule && matchesAction;
  });

  const handleExportExcel = () => {
    const data = filteredLogs.map(l => ({
      'Timestamp': l.timestamp,
      'User': l.user,
      'Action': l.action,
      'Module': l.module,
      'Entity Ref': l.entityId,
      'Activity Details': l.details
    }));
    exportToExcel(data, 'SESWA_Audit_Activity_Log', 'AuditLog');
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'VOID': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'ELECTION_ASSIGN': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'EXCEL_IMPORT': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'BACKUP':
      case 'RESTORE': return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>Audit & Activity History Log (FR-017)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Immutable tracking of financial entries, member updates, 1-year sector elections, backups & system security.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity description, user, ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Action Types</option>
            <option value="CREATE">Record Creation</option>
            <option value="UPDATE">Modifications</option>
            <option value="VOID">Voiding / Reversals</option>
            <option value="ELECTION_ASSIGN">1-Year Elections</option>
            <option value="EXCEL_IMPORT">Excel Imports</option>
            <option value="BACKUP">Backups</option>
            <option value="LOGIN">Logins</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Modules</option>
            <option value="Cash Transactions">Cash Transactions</option>
            <option value="Bank Transactions">Bank Transactions</option>
            <option value="Members">Members Directory</option>
            <option value="Sectors">Sectors</option>
            <option value="Election & 1-Year Terms">Election & Terms</option>
            <option value="Accounts">Chart of Accounts</option>
            <option value="Staff Loans">Staff Loans</option>
            <option value="EOBI">EOBI</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Module</th>
                <th className="p-3">Entity Reference</th>
                <th className="p-3">Activity Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="p-3 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                    {formatDateTime(log.timestamp)}
                  </td>

                  <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {log.user}
                  </td>

                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3 font-medium text-zinc-700 dark:text-zinc-300">
                    {log.module}
                  </td>

                  <td className="p-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {log.entityId}
                  </td>

                  <td className="p-3 text-zinc-800 dark:text-zinc-200">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
