'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sector, SectorStatus } from '../../types';
import { 
  Grid3X3, 
  Plus, 
  Search, 
  Award, 
  FolderKanban, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  X,
  UserCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { formatDate, getDaysRemaining } from '../../utils/formatters';
import { exportToExcel } from '../../utils/exportUtils';

export default function SectorsView() {
  const { sectors, elections, projects, addSector, updateSector, toggleSectorStatus, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    department: string;
    description: string;
    status: SectorStatus;
  }>({
    code: '',
    name: '',
    department: 'Central Administration',
    description: '',
    status: 'ACTIVE'
  });
  const [formError, setFormError] = useState('');

  const filteredSectors = sectors.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      code: `SEC-${String(sectors.length + 1).padStart(2, '0')}`,
      name: '',
      department: 'Central Administration',
      description: '',
      status: 'ACTIVE'
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Sector) => {
    setSelectedSector(s);
    setFormData({
      code: s.code,
      name: s.name,
      department: s.department,
      description: s.description || '',
      status: s.status
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Sector name is required.');
      return;
    }
    addSector(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSector) return;
    if (!formData.name.trim()) {
      setFormError('Sector name is required.');
      return;
    }
    updateSector(selectedSector.id, formData);
    setIsEditModalOpen(false);
  };

  const handleExportExcel = () => {
    const exportData = filteredSectors.map(s => {
      const activeHolder = elections.find(e => e.sectorId === s.id && e.status === 'ACTIVE');
      const supervisedProjects = projects.filter(p => p.sectorId === s.id);
      return {
        'Sector Code': s.code,
        'Sector Name': s.name,
        'Department': s.department,
        'Status': s.status,
        'Current Elected Member (1-Year Term)': activeHolder ? activeHolder.memberName : 'VACANT',
        'Term End Date': activeHolder ? activeHolder.termEndDate : 'N/A',
        'Supervised Projects Count': supervisedProjects.length,
        'Description': s.description || ''
      };
    });
    exportToExcel(exportData, 'SESWA_Sectors_Roster', 'Sectors');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-emerald-600" />
            <span>SESWA Organizational Sectors (FR-004)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage organizational portfolios, elected sector heads, and community projects under each sector.
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
            <span>Create New Sector</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sectors by title, code, department..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Showing {filteredSectors.length} of {sectors.length} sectors
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSectors.map((sector) => {
          const activeElection = elections.find(e => e.sectorId === sector.id && e.status === 'ACTIVE');
          const supervisedProjects = projects.filter(p => p.sectorId === sector.id);
          const days = activeElection ? getDaysRemaining(activeElection.termEndDate) : 0;

          return (
            <div 
              key={sector.id} 
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
                    {sector.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSectorStatus(sector.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sector.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                      }`}
                    >
                      {sector.status}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(sector)}
                      className="p-1 text-zinc-400 hover:text-emerald-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sector Title & Dept */}
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                  {sector.name}
                </h3>
                <div className="text-xs text-zinc-500 font-medium">
                  Dept: {sector.department}
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                  {sector.description || 'No description provided.'}
                </p>
              </div>

              {/* Current 1-Year Elected Holder (FR-005) */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
                  <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>1-Year Elected Head</span>
                    {activeElection && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                        {days}d left
                      </span>
                    )}
                  </div>

                  {activeElection ? (
                    <div className="mt-1">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{activeElection.memberName}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Term: {formatDate(activeElection.termStartDate)} to {formatDate(activeElection.termEndDate)}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-rose-600 dark:text-rose-400 font-bold italic">
                        Position Vacant
                      </span>
                      <button
                        onClick={() => setActiveTab('elections')}
                        className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                      >
                        + Elect Member
                      </button>
                    </div>
                  )}
                </div>

                {/* Supervised Projects summary */}
                <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                  <span className="flex items-center gap-1">
                    <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Projects Supervised:</span>
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{supervisedProjects.length}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Sector Modal */}
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
                <Grid3X3 className="w-5 h-5 text-amber-400" />
                <span>{isAddModalOpen ? 'Create Organizational Sector' : 'Edit Sector Details'}</span>
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
                <div>
                  <label className="block font-semibold mb-1">Sector Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Sector Name / Title *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Education & Scholarships Sector"
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Parent Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  >
                    <option value="Central Administration">Central Administration</option>
                    <option value="Human Development">Human Development</option>
                    <option value="Public Welfare">Public Welfare</option>
                    <option value="Operations">Operations</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Description / Sector Responsibilities</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Key objectives and programs under this sector..."
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg h-20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border rounded-lg"
                  >
                    <option value="ACTIVE">Active Sector</option>
                    <option value="INACTIVE">Inactive / Archived</option>
                  </select>
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
                  {isAddModalOpen ? 'Create Sector' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
