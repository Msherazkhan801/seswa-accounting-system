'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus } from '../../types';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  Grid3X3, 
  MapPin, 
  Users, 
  Calendar, 
  X,
  FileText
} from 'lucide-react';
import { formatDate, formatPKR } from '../../utils/formatters';
import { exportToExcel } from '../../utils/exportUtils';

export default function ProjectsView() {
  const { projects, sectors, transactions, addProject, updateProject, setViewVoucher } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sectorId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budgetAmount: 0,
    status: 'ACTIVE' as ProjectStatus,
    location: '',
    beneficiariesCount: 0,
    description: ''
  });
  const [formError, setFormError] = useState('');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSector = sectorFilter === 'ALL' || p.sectorId === sectorFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesSector && matchesStatus;
  });

  const handleOpenAdd = () => {
    const firstSector = sectors.find(s => s.status === 'ACTIVE');
    setFormData({
      code: `PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(2, '0')}`,
      name: '',
      sectorId: firstSector?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      budgetAmount: 100000,
      status: 'ACTIVE',
      location: 'Shewa, Khyber Pakhtunkhwa',
      beneficiariesCount: 100,
      description: ''
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setSelectedProject(p);
    setFormData({
      code: p.code,
      name: p.name,
      sectorId: p.sectorId,
      startDate: p.startDate,
      endDate: p.endDate || '',
      budgetAmount: p.budgetAmount,
      status: p.status,
      location: p.location || '',
      beneficiariesCount: p.beneficiariesCount || 0,
      description: p.description || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sectorId) {
      setFormError('Project name and supervising sector are required.');
      return;
    }
    const sector = sectors.find(s => s.id === formData.sectorId);
    addProject({
      ...formData,
      sectorName: sector?.name || 'Unknown Sector',
      budgetAmount: Number(formData.budgetAmount),
      beneficiariesCount: Number(formData.beneficiariesCount)
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!formData.name.trim()) {
      setFormError('Project name is required.');
      return;
    }
    const sector = sectors.find(s => s.id === formData.sectorId);
    updateProject(selectedProject.id, {
      ...formData,
      sectorName: sector?.name || selectedProject.sectorName,
      budgetAmount: Number(formData.budgetAmount),
      beneficiariesCount: Number(formData.beneficiariesCount)
    });
    setIsEditModalOpen(false);
  };

  const handleExportExcel = () => {
    const data = filteredProjects.map(p => ({
      'Project Code': p.code,
      'Project Name': p.name,
      'Supervising Sector': p.sectorName,
      'Status': p.status,
      'Budget Amount (PKR)': p.budgetAmount,
      'Total Income Mobilized (PKR)': p.totalIncome,
      'Total Actual Expenses (PKR)': p.totalExpense,
      'Remaining Budget (PKR)': p.budgetAmount - p.totalExpense,
      'Start Date': p.startDate,
      'End Date': p.endDate || 'Ongoing',
      'Location': p.location || '',
      'Beneficiaries': p.beneficiariesCount || 0
    }));
    exportToExcel(data, 'SESWA_Project_Portfolio', 'Projects');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-emerald-600" />
            <span>Community Projects Management (FR-007)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track projects under the supervision of organizational sectors with real-time budget, income & expense monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Projects</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, location, sector..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((project) => {
          const utilization = project.budgetAmount > 0 ? Math.round((project.totalExpense / project.budgetAmount) * 100) : 0;
          const projectTx = transactions.filter(t => t.projectId === project.id && t.status === 'POSTED');

          return (
            <div 
              key={project.id} 
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
                    {project.code}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {project.name}
                  </h3>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span>Supervising Sector: {project.sectorName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-bold text-zinc-600 dark:text-zinc-300">
                    {project.status}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-1 text-zinc-400 hover:text-emerald-600 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description & Location */}
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {project.description || 'No description provided.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">{project.location || 'Shewa'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{project.beneficiariesCount || 0} Beneficiaries</span>
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Duration: {formatDate(project.startDate)} → {project.endDate ? formatDate(project.endDate) : 'Ongoing'}</span>
                </div>
              </div>

              {/* Financial Progress & Actuals */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase font-semibold">Allocated Budget</span>
                    <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {formatPKR(project.budgetAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase font-semibold">Income Mobilized</span>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPKR(project.totalIncome)}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase font-semibold">Actual Expense</span>
                    <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatPKR(project.totalExpense)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Budget Utilization</span>
                    <span className="font-bold">{utilization}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${utilization > 90 ? 'bg-rose-500' : 'bg-emerald-600'}`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-zinc-400 text-[11px]">
                  {projectTx.length} Vouchers linked
                </span>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  View Project Transactions →
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Project Detail & Transactions Modal */}
      {selectedProject && (
        <div 
          onClick={() => setSelectedProject(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedProject.code}</span>
                <h2 className="text-lg font-bold">{selectedProject.name}</h2>
                <p className="text-xs text-emerald-200">Supervised by: {selectedProject.sectorName}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-lg bg-emerald-950/40 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Linked Cash & Bank Transactions
              </h3>

              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 border-b">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Voucher #</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Party / Narration</th>
                    <th className="p-2 text-right">Amount (PKR)</th>
                    <th className="p-2 text-center">Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions
                    .filter(t => t.projectId === selectedProject.id && t.status === 'POSTED')
                    .map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-2 whitespace-nowrap">{formatDate(tx.date)}</td>
                        <td className="p-2 font-mono font-bold text-emerald-700">{tx.voucherNo}</td>
                        <td className="p-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-2">{tx.partyName || tx.description}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          {tx.type.includes('RECEIPT') ? '+' : '-'}{formatPKR(tx.amount)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => setViewVoucher(tx)}
                            className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-[10px] rounded"
                          >
                            Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 border-t flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div 
          onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
          >
            
            <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-amber-400" />
                <span>{isAddModalOpen ? 'Create Community Project' : 'Edit Project Details'}</span>
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

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Project Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ON_HOLD">On Hold</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Free Eye Camp 2026"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Supervising Sector (FR-007 Requirement) *</label>
                  <select
                    value={formData.sectorId}
                    onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-medium"
                    required
                  >
                    {sectors.filter(s => s.status === 'ACTIVE').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Total Budget (PKR) *</label>
                    <input
                      type="number"
                      value={formData.budgetAmount}
                      onChange={(e) => setFormData({ ...formData, budgetAmount: Number(e.target.value) })}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Expected Beneficiaries</label>
                    <input
                      type="number"
                      value={formData.beneficiariesCount}
                      onChange={(e) => setFormData({ ...formData, beneficiariesCount: Number(e.target.value) })}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Location / Target Area</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Shewa Civil Hospital Grounds"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Project Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Objectives, scope, target beneficiaries..."
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
                  {isAddModalOpen ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
