'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, MemberStatus } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  X,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { formatDate, getDaysRemaining, validateCNIC } from '../../utils/formatters';
import { exportToExcel } from '../../utils/exportUtils';

export default function MembersView() {
  const { members, elections, sectors, addMember, updateMember, toggleMemberStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    membershipNo: string;
    name: string;
    fatherName: string;
    cnic: string;
    phone: string;
    email: string;
    address: string;
    profession: string;
    bloodGroup: string;
    joinDate: string;
    status: MemberStatus;
    notes: string;
  }>({
    membershipNo: '',
    name: '',
    fatherName: '',
    cnic: '',
    phone: '',
    email: '',
    address: '',
    profession: '',
    bloodGroup: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    notes: ''
  });
  const [formError, setFormError] = useState('');

  // Filtered members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.membershipNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cnic.includes(searchTerm) ||
      m.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      membershipNo: `SESWA-MEM-${String(members.length + 1).padStart(3, '0')}`,
      name: '',
      fatherName: '',
      cnic: '',
      phone: '',
      email: '',
      address: '',
      profession: '',
      bloodGroup: 'B+',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      notes: ''
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setSelectedMember(m);
    setFormData({
      membershipNo: m.membershipNo,
      name: m.name,
      fatherName: m.fatherName || '',
      cnic: m.cnic,
      phone: m.phone,
      email: m.email || '',
      address: m.address || '',
      profession: m.profession || '',
      bloodGroup: m.bloodGroup || '',
      joinDate: m.joinDate,
      status: m.status,
      notes: m.notes || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Member name is required.');
      return;
    }
    if (!formData.cnic.trim()) {
      setFormError('CNIC is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Phone number is required.');
      return;
    }

    addMember(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    if (!formData.name.trim()) {
      setFormError('Member name is required.');
      return;
    }

    updateMember(selectedMember.id, formData);
    setIsEditModalOpen(false);
    setSelectedMember(prev => prev ? { ...prev, ...formData } : null);
  };

  const handleExportExcel = () => {
    const exportData = filteredMembers.map(m => {
      const activeElection = elections.find(e => e.memberId === m.id && e.status === 'ACTIVE');
      return {
        'Membership No': m.membershipNo,
        'Full Name': m.name,
        "Father's Name": m.fatherName || '',
        'CNIC': m.cnic,
        'Phone': m.phone,
        'Email': m.email || '',
        'Address': m.address || '',
        'Profession': m.profession || '',
        'Blood Group': m.bloodGroup || '',
        'Join Date': m.joinDate,
        'Status': m.status,
        'Current Sector (1-Year Term)': activeElection ? activeElection.sectorName : 'General Member',
        'Term Expiry': activeElection ? activeElection.termEndDate : 'N/A'
      };
    });
    exportToExcel(exportData, 'SESWA_Members_Directory', 'Members');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>SESWA Members Management (FR-003)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Maintain authorized organization members, track active 1-year sector elections & historical tenures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Member</span>
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
            placeholder="Search by name, membership #, CNIC, phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">All Statuses ({members.length})</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Grid Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Membership #</th>
                <th className="p-3">Member Name</th>
                <th className="p-3">CNIC & Contact</th>
                <th className="p-3">Current Sector Tenure</th>
                <th className="p-3">Join Date</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredMembers.map((m) => {
                const activeElection = elections.find(e => e.memberId === m.id && e.status === 'ACTIVE');
                const pastElections = elections.filter(e => e.memberId === m.id && e.status !== 'ACTIVE');

                return (
                  <tr key={m.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {m.membershipNo}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {m.profession || 'Social Worker'} {m.fatherName ? `• S/o ${m.fatherName}` : ''}
                      </div>
                    </td>

                    <td className="p-3 space-y-0.5">
                      <div className="font-mono text-zinc-700 dark:text-zinc-300">{m.cnic}</div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{m.phone}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      {activeElection ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">
                            <Award className="w-3 h-3 text-amber-500" />
                            {activeElection.sectorName}
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            Term ends: {formatDate(activeElection.termEndDate)} ({getDaysRemaining(activeElection.termEndDate)}d left)
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">
                          General Member {pastElections.length > 0 ? `(${pastElections.length} past terms)` : ''}
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {formatDate(m.joinDate)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleMemberStatus(m.id)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {m.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{m.status}</span>
                      </button>
                    </td>

                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Profile & History
                      </button>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1 text-zinc-500 hover:text-emerald-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details & History Drawer / Modal (FR-003 & FR-005) */}
      {selectedMember && (
        <div 
          onClick={() => setSelectedMember(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-extrabold text-lg">
                  {selectedMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedMember.name}</h2>
                  <p className="text-xs text-emerald-200">
                    Membership ID: <span className="font-mono font-bold text-amber-300">{selectedMember.membershipNo}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Member Meta Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <span className="text-zinc-400">Father Name:</span>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedMember.fatherName || '—'}</div>
                </div>
                <div>
                  <span className="text-zinc-400">CNIC No:</span>
                  <div className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{selectedMember.cnic}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Phone:</span>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedMember.phone}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Email:</span>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedMember.email || '—'}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Blood Group:</span>
                  <div className="font-bold text-rose-600">{selectedMember.bloodGroup || '—'}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Join Date:</span>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(selectedMember.joinDate)}</div>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-zinc-400">Address:</span>
                  <div className="text-zinc-800 dark:text-zinc-200">{selectedMember.address || 'Shewa Town, KP'}</div>
                </div>
              </div>

              {/* Current Active 1-Year Sector Assignment (FR-003 & FR-005) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Current 1-Year Sector Election Status</span>
                </h3>

                {(() => {
                  const currentElection = elections.find(e => e.memberId === selectedMember.id && e.status === 'ACTIVE');
                  if (!currentElection) {
                    return (
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-500">
                        This member does not currently hold an elected sector position.
                      </div>
                    );
                  }

                  const days = getDaysRemaining(currentElection.termEndDate);

                  return (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                          {currentElection.sectorName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold text-[10px]">
                          ACTIVE 1-YEAR TERM
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400 pt-1">
                        <div>
                          <span>Term Start Date:</span> <strong className="text-zinc-900 dark:text-zinc-100">{formatDate(currentElection.termStartDate)}</strong>
                        </div>
                        <div>
                          <span>Term End Date:</span> <strong className="text-zinc-900 dark:text-zinc-100">{formatDate(currentElection.termEndDate)}</strong>
                        </div>
                        <div>
                          <span>Resolution Reference:</span> <strong className="text-zinc-900 dark:text-zinc-100">{currentElection.resolutionNo || 'SESWA/RES'}</strong>
                        </div>
                        <div>
                          <span>Remaining Time:</span> <strong className="text-amber-600 dark:text-amber-400">{days} Days Remaining</strong>
                        </div>
                      </div>

                      {currentElection.notes && (
                        <p className="text-zinc-500 dark:text-zinc-400 italic pt-1 text-[11px]">
                          Note: {currentElection.notes}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Historical 1-Year Election Terms Archive */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>Historical Sector Elections & Past Tenures</span>
                </h3>

                {(() => {
                  const past = elections.filter(e => e.memberId === selectedMember.id && e.status !== 'ACTIVE');
                  if (past.length === 0) {
                    return (
                      <p className="text-xs text-zinc-400 italic">No previous terms recorded in history.</p>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {past.map(pe => (
                        <div key={pe.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-bold text-zinc-800 dark:text-zinc-200">{pe.sectorName}</div>
                            <div className="text-[11px] text-zinc-500">
                              Tenure: {formatDate(pe.termStartDate)} to {formatDate(pe.termEndDate)}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                            {pe.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(selectedMember)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Edit Member Details
              </button>
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div 
          onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>{isAddModalOpen ? 'Register New Member' : 'Edit Member Profile'}</span>
              </h2>
              <button
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="text-zinc-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Membership No</label>
                  <input
                    type="text"
                    value={formData.membershipNo}
                    onChange={(e) => setFormData({ ...formData, membershipNo: e.target.value })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Atta Ullah Khan"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Father Name"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">CNIC (XXXXX-XXXXXXX-X) *</label>
                  <input
                    type="text"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="12101-1234567-1"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Profession</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="e.g. Accountant / Teacher"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Shewa Town, KP"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Join Date</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  >
                    <option value="ACTIVE">Active Member</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Notes / Remarks</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional details..."
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg h-16"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg"
                >
                  {isAddModalOpen ? 'Save Member' : 'Update Member'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
