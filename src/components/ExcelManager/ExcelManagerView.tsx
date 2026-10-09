'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileText, 
  Database,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { formatDate, formatPKR } from '../../utils/formatters';
import { 
  exportToExcel, 
  downloadCashBookTemplate, 
  downloadMemberTemplate 
} from '../../utils/exportUtils';

export default function ExcelManagerView() {
  const { 
    transactions, 
    members, 
    sectors, 
    accounts, 
    projects, 
    addTransaction, 
    addMember, 
    addAuditLog 
  } = useApp();

  const [activeMode, setActiveMode] = useState<'IMPORT' | 'EXPORT' | 'TEMPLATES'>('IMPORT');
  
  // Import state
  const [importType, setImportType] = useState<'CASH_BOOK' | 'MEMBERS'>('CASH_BOOK');
  const [fileData, setFileData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: any[];
    invalid: { row: any; errors: string[] }[];
    duplicates: any[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload and Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        setFileData(data);
        validateImportData(data, importType);
      } catch (err: any) {
        alert('Failed to parse Excel file: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Validation Engine (FR-015)
  const validateImportData = (data: any[], type: 'CASH_BOOK' | 'MEMBERS') => {
    const valid: any[] = [];
    const invalid: { row: any; errors: string[] }[] = [];
    const duplicates: any[] = [];

    if (type === 'CASH_BOOK') {
      data.forEach((row, idx) => {
        const errors: string[] = [];
        const date = row['Date (YYYY-MM-DD)'] || row['Date'] || row['Transaction Date'];
        const amount = Number(row['Amount (PKR)'] || row['Amount']);
        const desc = row['Description / Narration'] || row['Description'] || row['Narration'];
        const vType = row['Voucher Type'] || row['Type'] || 'CASH_RECEIPT';
        const party = row['Party Name / Payer / Payee'] || row['Party'] || row['Payer'] || row['Payee'];
        const refNo = row['Reference / Bill No'] || row['Ref No'] || row['Reference'];

        if (!date) errors.push('Missing transaction date');
        if (!amount || isNaN(amount) || amount <= 0) errors.push('Invalid amount (must be positive numeric)');
        if (!desc) errors.push('Missing description/narration');

        // Check duplicate
        const isDuplicate = transactions.some(t => 
          t.date === date && 
          t.amount === amount && 
          (t.referenceNo === refNo || t.description === desc)
        );

        if (errors.length > 0) {
          invalid.push({ row, errors });
        } else if (isDuplicate) {
          duplicates.push(row);
        } else {
          valid.push({
            type: vType.includes('PAY') ? 'CASH_PAYMENT' : 'CASH_RECEIPT',
            date,
            amount,
            description: desc,
            partyName: party,
            referenceNo: refNo,
            accountId: 'acc-1010',
            offsetAccountId: vType.includes('PAY') ? 'acc-5070' : 'acc-4010'
          });
        }
      });
    } else {
      // Members Validation
      data.forEach((row) => {
        const errors: string[] = [];
        const name = row['Full Name'] || row['Name'];
        const cnic = row['CNIC (XXXXX-XXXXXXX-X)'] || row['CNIC'];
        const phone = row['Phone'] || row['Phone Number'];

        if (!name) errors.push('Missing member name');
        if (!cnic) errors.push('Missing CNIC');
        if (!phone) errors.push('Missing phone');

        const isDuplicate = members.some(m => m.cnic === cnic || m.name.toLowerCase() === (name || '').toLowerCase());

        if (errors.length > 0) {
          invalid.push({ row, errors });
        } else if (isDuplicate) {
          duplicates.push(row);
        } else {
          valid.push({
            membershipNo: row['Membership No'] || `SESWA-MEM-${String(members.length + valid.length + 1).padStart(3, '0')}`,
            name,
            fatherName: row["Father's Name"] || '',
            cnic,
            phone,
            email: row['Email'] || '',
            address: row['Address'] || '',
            profession: row['Profession'] || 'Member',
            bloodGroup: row['Blood Group'] || 'B+',
            joinDate: row['Join Date (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            notes: row['Notes'] || 'Imported via Excel batch'
          });
        }
      });
    }

    setValidationResults({ valid, invalid, duplicates });
  };

  // Commit valid records to active database
  const handleCommitImport = () => {
    if (!validationResults || validationResults.valid.length === 0) return;

    if (importType === 'CASH_BOOK') {
      validationResults.valid.forEach(tx => {
        addTransaction(tx);
      });
      addAuditLog('EXCEL_IMPORT', 'Excel Hub', 'BATCH', `Imported ${validationResults.valid.length} cash transactions from Excel file.`);
      setImportSuccessMessage(`Successfully imported ${validationResults.valid.length} cash transactions into active Cash Book.`);
    } else {
      validationResults.valid.forEach(m => {
        addMember(m);
      });
      addAuditLog('EXCEL_IMPORT', 'Excel Hub', 'BATCH', `Imported ${validationResults.valid.length} members from Excel file.`);
      setImportSuccessMessage(`Successfully imported ${validationResults.valid.length} new members into Members Directory.`);
    }

    setValidationResults(null);
    setFileData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>Excel Import & Export Center (FR-015)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Seamless integration with reference workbook <span className="font-semibold text-emerald-700 dark:text-emerald-400">"Atta Ullah Cash Book 2026–27(1).xlsx"</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCashBookTemplate()}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Cash Book Template</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveMode('IMPORT')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeMode === 'IMPORT'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Import Excel Data (Validation Engine)</span>
        </button>

        <button
          onClick={() => setActiveMode('EXPORT')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeMode === 'EXPORT'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Center (.xlsx)</span>
        </button>
      </div>

      {/* Success Notification */}
      {importSuccessMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{importSuccessMessage}</span>
        </div>
      )}

      {/* MODE 1: IMPORT WIZARD */}
      {activeMode === 'IMPORT' && (
        <div className="space-y-6">
          
          {/* Upload Box */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Step 1: Select Target Module & Upload Excel File
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setImportType('CASH_BOOK')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  importType === 'CASH_BOOK'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Cash Book / Financial Transactions
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  Import Receipts, Payments & Descriptions from Excel files.
                </div>
              </div>

              <div 
                onClick={() => setImportType('MEMBERS')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  importType === 'MEMBERS'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  SESWA Members Directory
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  Import member contact details, CNIC & membership numbers.
                </div>
              </div>
            </div>

            {/* Drag & Drop File Input */}
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center bg-zinc-50 dark:bg-zinc-800/30 space-y-3">
              <Upload className="w-8 h-8 mx-auto text-emerald-600" />
              <div>
                <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
                  <span>Browse .xlsx or .csv file on your computer</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Supports "Atta Ullah Cash Book 2026–27(1).xlsx" and standard templates.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Validation Results Grid */}
          {validationResults && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Step 2: Validation Engine & Preview Grid (FR-015)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Audited {fileData.length} records from uploaded file.
                  </p>
                </div>

                {validationResults.valid.length > 0 && (
                  <button
                    onClick={handleCommitImport}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
                  >
                    Commit {validationResults.valid.length} Valid Records to Database
                  </button>
                )}
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300">
                  <span className="text-emerald-800 dark:text-emerald-300 font-semibold">Valid & Ready to Post</span>
                  <div className="text-xl font-bold font-mono text-emerald-900 dark:text-emerald-200 mt-0.5">
                    {validationResults.valid.length}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300">
                  <span className="text-amber-800 dark:text-amber-300 font-semibold">Duplicates Detected (Skipped)</span>
                  <div className="text-xl font-bold font-mono text-amber-900 dark:text-amber-200 mt-0.5">
                    {validationResults.duplicates.length}
                  </div>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-300">
                  <span className="text-rose-800 dark:text-rose-300 font-semibold">Invalid / Incomplete</span>
                  <div className="text-xl font-bold font-mono text-rose-900 dark:text-rose-200 mt-0.5">
                    {validationResults.invalid.length}
                  </div>
                </div>
              </div>

              {/* Valid preview preview table */}
              {validationResults.valid.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Valid Records Preview (First 5 records)
                  </h3>
                  <div className="overflow-x-auto border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800 border-b">
                        <tr>
                          <th className="p-2">Date</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Party / Member</th>
                          <th className="p-2">Description</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {validationResults.valid.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="p-2">{row.date || row.joinDate}</td>
                            <td className="p-2">{row.type || 'MEMBER'}</td>
                            <td className="p-2 font-semibold">{row.partyName || row.name}</td>
                            <td className="p-2 text-zinc-500 truncate max-w-xs">{row.description || row.profession}</td>
                            <td className="p-2 text-right font-mono font-bold text-emerald-700">
                              {row.amount ? formatPKR(row.amount) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Invalid Records Report */}
              {validationResults.invalid.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-rose-700">
                    Invalid Records Breakdown
                  </h3>
                  <div className="space-y-1">
                    {validationResults.invalid.map((item, idx) => (
                      <div key={idx} className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex justify-between">
                        <span>Row {idx + 1}: {JSON.stringify(item.row).slice(0, 70)}...</span>
                        <span className="font-bold">{item.errors.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* MODE 2: EXPORT CENTER */}
      {activeMode === 'EXPORT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Cash Book & Bank Book
            </h3>
            <p className="text-xs text-zinc-500">
              Complete receipts and payments ledger with vouchers, parties and accounts.
            </p>
            <button
              onClick={() => exportToExcel(transactions, 'SESWA_Full_Transaction_Book', 'Transactions')}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Export Transactions (.xlsx)
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Members & 1-Year Election Terms
            </h3>
            <p className="text-xs text-zinc-500">
              Members directory with active 1-year sector assignments and past history.
            </p>
            <button
              onClick={() => exportToExcel(members, 'SESWA_Members_Master_Export', 'Members')}
              className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Export Members (.xlsx)
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Chart of Accounts & Trial Balance
            </h3>
            <p className="text-xs text-zinc-500">
              All 5 account heads with opening and live closing debit/credit balances.
            </p>
            <button
              onClick={() => exportToExcel(accounts, 'SESWA_Chart_of_Accounts_Export', 'Accounts')}
              className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Export Accounts (.xlsx)
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
