'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, Download, Building2, CheckCircle2 } from 'lucide-react';
import { formatDate, formatPKR } from '../utils/formatters';

export default function VoucherSlipModal() {
  const { viewVoucher, setViewVoucher } = useApp();

  if (!viewVoucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const getVoucherTitle = (type: string) => {
    switch (type) {
      case 'CASH_RECEIPT': return 'OFFICIAL CASH RECEIPT VOUCHER';
      case 'CASH_PAYMENT': return 'OFFICIAL CASH PAYMENT VOUCHER';
      case 'BANK_RECEIPT': return 'OFFICIAL BANK RECEIPT VOUCHER';
      case 'BANK_PAYMENT': return 'OFFICIAL BANK PAYMENT VOUCHER';
      case 'BANK_TRANSFER': return 'BANK / CONTRA TRANSFER VOUCHER';
      case 'JOURNAL_ENTRY': return 'DOUBLE-ENTRY JOURNAL VOUCHER (JV)';
      default: return 'TRANSACTION VOUCHER';
    }
  };

  return (
    <div 
      onClick={() => setViewVoucher(null)} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 cursor-default"
      >
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Voucher Preview & Print
            </span>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
              {viewVoucher.voucherNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={() => setViewVoucher(null)}
              className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="p-8 print:p-0 bg-white text-zinc-900" id="printable-voucher">
          
          {/* Header */}
          <div className="border-b-2 border-emerald-900 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-900 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-black text-emerald-950 tracking-tight">
                SHEWA EDUCATED SOCIAL WORKERS ASSOCIATION (SESWA)
              </h1>
            </div>
            <p className="text-xs text-zinc-600 font-medium">
              Finance Sector — Central Secretariat, Shewa, Khyber Pakhtunkhwa
            </p>
            <div className="mt-2 inline-block bg-emerald-900 text-amber-300 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
              {getVoucherTitle(viewVoucher.type)}
            </div>
          </div>

          {/* Voucher Info Meta Grid */}
          <div className="grid grid-cols-2 gap-4 my-6 text-xs border-b border-zinc-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-600">Voucher No:</span>
                <span className="font-mono font-bold text-emerald-900 text-sm">{viewVoucher.voucherNo}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-zinc-600">Date:</span>
                <span>{formatDate(viewVoucher.date)}</span>
              </div>
              {viewVoucher.referenceNo && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-zinc-600">Reference / Bill #:</span>
                  <span>{viewVoucher.referenceNo}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="font-bold text-zinc-600">Fiscal Period:</span>
                <span className="font-semibold">FY 2026–27</span>
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="font-bold text-zinc-600">Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {viewVoucher.status}
                </span>
              </div>
              {viewVoucher.bankName && (
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="font-bold text-zinc-600">Bank / Cheque #:</span>
                  <span>{viewVoucher.bankName} {viewVoucher.chequeNo ? `(${viewVoucher.chequeNo})` : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-xs space-y-2">
              {viewVoucher.partyName && (
                <div className="grid grid-cols-4 gap-2">
                  <span className="font-bold text-zinc-600">
                    {viewVoucher.type.includes('RECEIPT') ? 'Received From (Payer):' : 'Paid To (Payee):'}
                  </span>
                  <span className="col-span-3 font-semibold text-zinc-900">{viewVoucher.partyName}</span>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                <span className="font-bold text-zinc-600">Account (Debit/Credit):</span>
                <span className="col-span-3 font-medium text-zinc-900">{viewVoucher.accountName}</span>
              </div>

              {viewVoucher.offsetAccountName && (
                <div className="grid grid-cols-4 gap-2">
                  <span className="font-bold text-zinc-600">Offset Account Head:</span>
                  <span className="col-span-3 font-medium text-zinc-900">{viewVoucher.offsetAccountName}</span>
                </div>
              )}

              {viewVoucher.projectName && (
                <div className="grid grid-cols-4 gap-2">
                  <span className="font-bold text-zinc-600">Associated Project:</span>
                  <span className="col-span-3 font-semibold text-emerald-900">
                    {viewVoucher.projectName} {viewVoucher.sectorName ? `(${viewVoucher.sectorName})` : ''}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                <span className="font-bold text-zinc-600">Description / Narration:</span>
                <span className="col-span-3 text-zinc-800">{viewVoucher.description}</span>
              </div>

              {viewVoucher.supportingDocRef && (
                <div className="grid grid-cols-4 gap-2">
                  <span className="font-bold text-zinc-600">Supporting Document:</span>
                  <span className="col-span-3 text-zinc-600 italic">{viewVoucher.supportingDocRef}</span>
                </div>
              )}
            </div>

            {/* Journal Lines if double-entry */}
            {viewVoucher.journalLines && viewVoucher.journalLines.length > 0 && (
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700">
                    <tr>
                      <th className="p-2">Account Head</th>
                      <th className="p-2">Narration</th>
                      <th className="p-2 text-right">Debit (PKR)</th>
                      <th className="p-2 text-right">Credit (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {viewVoucher.journalLines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{line.accountCode} - {line.accountName}</td>
                        <td className="p-2 text-zinc-500">{line.narration || '—'}</td>
                        <td className="p-2 text-right font-mono font-medium">{line.debit > 0 ? formatPKR(line.debit) : '—'}</td>
                        <td className="p-2 text-right font-mono font-medium">{line.credit > 0 ? formatPKR(line.credit) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Amount Box */}
            <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-900 rounded-xl p-4">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Total Transaction Amount:
              </span>
              <span className="text-xl font-extrabold text-emerald-900 font-mono">
                {formatPKR(viewVoucher.amount)}
              </span>
            </div>
          </div>

          {/* Signature Blocks */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs text-zinc-600 mt-6 border-t border-zinc-300">
            <div>
              <div className="border-t border-zinc-400 pt-1 font-bold text-zinc-900">
                {viewVoucher.createdBy || 'Atta Ullah Khan'}
              </div>
              <div className="text-[10px] text-zinc-500">Authorized Finance Secretary</div>
            </div>

            <div>
              <div className="border-t border-zinc-400 pt-1 font-bold text-zinc-900">
                Internal Auditor
              </div>
              <div className="text-[10px] text-zinc-500">Audit & Compliance Committee</div>
            </div>

            <div>
              <div className="border-t border-zinc-400 pt-1 font-bold text-zinc-900">
                President / General Body
              </div>
              <div className="text-[10px] text-zinc-500">SESWA Executive Authority</div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-3 border-t border-zinc-200 text-[9px] text-zinc-400 flex items-center justify-between">
            <span>SESWA Finance Management System v1.0</span>
            <span>Printed on: {new Date().toLocaleString()}</span>
            <span>Confidential Financial Document</span>
          </div>

        </div>

      </div>
    </div>
  );
}
