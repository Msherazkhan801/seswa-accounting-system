'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ElectionTerm } from '../../types';
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  X, 
  FileSpreadsheet, 
  ShieldAlert, 
  UserCheck, 
  History,
  FileText
} from 'lucide-react';
import { formatDate, getDaysRemaining, getOneYearLaterDateString, getTermStatusDetails } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../utils/exportUtils';

export default function ElectionsView() {
  const { 
    elections, 
    members, 
    sectors, 
    addElection, 
    expireElection, 
    terminateElection 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isNewElectionModalOpen, setIsNewElectionModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Form State
  const [memberId, setMemberId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [electionDate, setElectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [termStartDate, setTermStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [termEndDate, setTermEndDate] = useState(getOneYearLaterDateString(new Date().toISOString().split('T')[0]));
  const [resolutionNo, setResolutionNo] = useState('');
  const [notificationRef, setNotificationRef] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Handle Start date change -> Auto update +1 year end date
  const handleStartDateChange = (newStart: string) => {
    setTermStartDate(newStart);
    setTermEndDate(getOneYearLaterDateString(newStart));
  };

  // Check sector selection for existing active holder
  const handleSectorChange = (sId: string) => {
    setSectorId(sId);
    const existingActive = elections.find(e => e.sectorId === sId && e.status === 'ACTIVE');
    if (existingActive) {
      setConflictWarning(
        `Notice: ${existingActive.sectorName} is currently actively held by ${existingActive.memberName} (Term ends: ${formatDate(existingActive.termEndDate)}). Submitting this election will conclude/expire the previous term and record it in the audit history.`
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleOpenNewModal = () => {
    const defaultStart = new Date().toISOString().split('T')[0];
    setMemberId(members.find(m => m.status === 'ACTIVE')?.id || '');
    const firstSector = sectors.find(s => s.status === 'ACTIVE');
    setSectorId(firstSector?.id || '');
    setElectionDate(defaultStart);
    setTermStartDate(defaultStart);
    setTermEndDate(getOneYearLaterDateString(defaultStart));
    setResolutionNo(`SESWA/ELEC/${new Date().getFullYear()}/RES-${String(elections.length + 1).padStart(2, '0')}`);
    setNotificationRef(`NOTIF-ELEC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
    setNotes('Elected for 1-year standard constitutional tenure.');
    setFormError('');
    
    if (firstSector) {
      const existing = elections.find(e => e.sectorId === firstSector.id && e.status === 'ACTIVE');
      if (existing) {
        setConflictWarning(
          `Notice: ${existing.sectorName} is currently actively held by ${existing.memberName}. Submitting will archive the previous term into history.`
        );
      } else {
        setConflictWarning(null);
      }
    }

    setIsNewElectionModalOpen(true);
  };

  const handleSaveElection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !sectorId) {
      setFormError('Please select both a valid member and a sector.');
      return;
    }
    if (!termStartDate || !termEndDate) {
      setFormError('Term start and end dates are required.');
      return;
    }

    const res = addElection({
      memberId,
      sectorId,
      electionDate,
      termStartDate,
      termEndDate,
      resolutionNo,
      notificationRef,
      notes
    });

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setIsNewElectionModalOpen(false);
  };

  // Filtered elections
  const filteredElections = elections.filter(elec => {
    const matchesSearch = 
      elec.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      elec.sectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (elec.resolutionNo && elec.resolutionNo.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE') return matchesSearch && elec.status === 'ACTIVE';
    if (statusFilter === 'EXPIRING_SOON') {
      if (elec.status !== 'ACTIVE') return false;
      const days = getDaysRemaining(elec.termEndDate);
      return matchesSearch && days >= 0 && days <= 30;
    }
    if (statusFilter === 'EXPIRED') return matchesSearch && (elec.status === 'EXPIRED' || getDaysRemaining(elec.termEndDate) < 0);
    return matchesSearch;
  });

  const handleExportExcel = () => {
    const data = filteredElections.map(e => ({
      'Resolution No': e.resolutionNo || '',
      'Sector Name': e.sectorName,
      'Elected Member': e.memberName,
      'Election Date': e.electionDate,
      '1-Year Term Start': e.termStartDate,
      '1-Year Term End': e.termEndDate,
      'Days Remaining': getDaysRemaining(e.termEndDate),
      'Status': e.status,
      'Notification Ref': e.notificationRef || '',
      'Remarks': e.notes || ''
    }));
    exportToExcel(data, 'SESWA_1Year_Elections_Register', 'Elections');
  };

  const handleExportPDF = () => {
    const headers = ['Sector', 'Elected Member', 'Term Start', 'Term End', 'Days Left', 'Resolution Ref', 'Status'];
    const rows = filteredElections.map(e => [
      e.sectorName,
      e.memberName,
      formatDate(e.termStartDate),
      formatDate(e.termEndDate),
      getDaysRemaining(e.termEndDate).toString(),
      e.resolutionNo || '—',
      e.status
    ]);
    generatePDFReport(
      'SESWA 1-Year Sector Elections & Term Roster',
      `Authorized 1-Year Elected Representatives Roster — Fiscal Year 2026–27`,
      headers,
      rows,
      'l',
      [
        { label: 'Total Recorded Tenures', value: filteredElections.length.toString() },
        { label: 'Active Sector Positions', value: filteredElections.filter(e => e.status === 'ACTIVE').length.toString() }
      ]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>1-Year Member Election & Term Management (FR-005)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Constitutional 1-year sector assignments, tenure expiry tracking, overlapping assignment checks & permanent audit history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>PDF Roster</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Elect / Assign Member to Sector</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by member, sector, resolution #..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-500 font-medium">Filter Term:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">All Terms ({elections.length})</option>
            <option value="ACTIVE">Active 1-Year Terms</option>
            <option value="EXPIRING_SOON">Expiring Soon (≤ 30 Days)</option>
            <option value="EXPIRED">Expired / Historical Terms</option>
          </select>
        </div>
      </div>

      {/* Elections Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Sector / Position</th>
                <th className="p-3">Elected Member</th>
                <th className="p-3">Resolution & Notification</th>
                <th className="p-3">1-Year Term Period</th>
                <th className="p-3">Tenure Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredElections.map((elec) => {
                const statusDetails = getTermStatusDetails(elec.termStartDate, elec.termEndDate, elec.status);

                return (
                  <tr key={elec.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                    
                    {/* Sector */}
                    <td className="p-3">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {elec.sectorName}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Constitutional Portfolio
                      </div>
                    </td>

                    {/* Member */}
                    <td className="p-3">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{elec.memberName}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Elected on: {formatDate(elec.electionDate)}
                      </div>
                    </td>

                    {/* Resolution / Notification */}
                    <td className="p-3">
                      <div className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                        {elec.resolutionNo || 'SESWA/RES/2026'}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Ref: {elec.notificationRef || 'N/A'}
                      </div>
                    </td>

                    {/* Term Duration */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">
                        {formatDate(elec.termStartDate)} → {formatDate(elec.termEndDate)}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Exact 1-Year Constitutional Term</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusDetails.color}`}>
                        {statusDetails.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {elec.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => expireElection(elec.id)}
                            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-[11px] font-medium transition cursor-pointer"
                            title="Conclude / Expire term when finished"
                          >
                            Mark Concluded
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please enter reason for term termination (e.g., Relocation, Resignation):');
                              if (reason) terminateElection(elec.id, reason);
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded text-[11px] font-medium transition cursor-pointer"
                            title="Early Termination"
                          >
                            Terminate
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Election / Term Assignment Modal (FR-005 Workflow) */}
      {isNewElectionModalOpen && (
        <div 
          onClick={() => setIsNewElectionModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Elect / Assign Member to Sector (1-Year Term)</span>
              </h2>
              <button
                onClick={() => setIsNewElectionModalOpen(false)}
                className="text-zinc-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveElection} className="p-6 space-y-4">
              
              {/* Conflict Warning Banner */}
              {conflictWarning && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Overlapping Term Detection (FR-005):</strong>
                    <span>{conflictWarning}</span>
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                
                {/* Sector Selection */}
                <div>
                  <label className="block font-semibold mb-1">Target Sector / Position *</label>
                  <select
                    value={sectorId}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-medium"
                    required
                  >
                    {sectors.filter(s => s.status === 'ACTIVE').map(s => {
                      const activeHolder = elections.find(e => e.sectorId === s.id && e.status === 'ACTIVE');
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) {activeHolder ? `— Held by ${activeHolder.memberName}` : '— [VACANT]'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Member Selection */}
                <div>
                  <label className="block font-semibold mb-1">Select Active Member to Elect *</label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-medium"
                    required
                  >
                    {members.filter(m => m.status === 'ACTIVE').map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.membershipNo}) • CNIC: {m.cnic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Election / Resolution Date</label>
                    <input
                      type="date"
                      value={electionDate}
                      onChange={(e) => setElectionDate(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">1-Year Term Start Date *</label>
                    <input
                      type="date"
                      value={termStartDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 flex items-center justify-between">
                    <span>1-Year Term End Date (Auto-calculated: 1 Year)</span>
                    <span className="text-[10px] text-emerald-600 font-normal">Constitutional 1-Year Rule</span>
                  </label>
                  <input
                    type="date"
                    value={termEndDate}
                    onChange={(e) => setTermEndDate(e.target.value)}
                    className="w-full p-2 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-lg font-bold text-emerald-900 dark:text-emerald-200"
                    required
                  />
                </div>

                {/* References */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">General Body Resolution #</label>
                    <input
                      type="text"
                      value={resolutionNo}
                      onChange={(e) => setResolutionNo(e.target.value)}
                      placeholder="e.g. SESWA/AGM-2026/RES-01"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Notification Ref</label>
                    <input
                      type="text"
                      value={notificationRef}
                      onChange={(e) => setNotificationRef(e.target.value)}
                      placeholder="NOTIF-REF"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Election Notes / Reference</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Elected unanimously by General Council on..."
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg h-16"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewElectionModalOpen(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow"
                >
                  Confirm & Record 1-Year Election
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
