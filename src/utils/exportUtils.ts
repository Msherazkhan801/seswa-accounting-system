// Excel and PDF Export & Import Utilities for SESWA Finance Management System
import * as XLSX from 'xlsx';
import { formatDate, formatNumber, formatPKR } from './formatters';

// Export any JSON data to Excel
export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1') {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const dateStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-04-01';
    XLSX.writeFile(wb, `${fileName}_${dateStr}.xlsx`);
  } catch (err: any) {
    console.error('Excel export error:', err);
    alert('Excel export failed: ' + err.message);
  }
}

// Generate Downloadable Excel Templates
export function downloadCashBookTemplate() {
  const templateData = [
    {
      'Voucher Type': 'CASH_RECEIPT',
      'Date (YYYY-MM-DD)': '2026-04-01',
      'Account Code': '1010',
      'Offset Account Code': '4010',
      'Party Name / Payer / Payee': 'Haji Ghulam Rasool',
      'Amount (PKR)': 25000,
      'Project Code': 'PRJ-2026-01',
      'Reference / Bill No': 'RCPT-9901',
      'Description / Narration': 'Donation received for medical camp'
    },
    {
      'Voucher Type': 'CASH_PAYMENT',
      'Date (YYYY-MM-DD)': '2026-04-02',
      'Account Code': '1010',
      'Offset Account Code': '5070',
      'Party Name / Payer / Payee': 'Al-Madina Printers',
      'Amount (PKR)': 4500,
      'Project Code': '',
      'Reference / Bill No': 'BILL-1102',
      'Description / Narration': 'Voucher pad printing'
    }
  ];
  exportToExcel(templateData, 'SESWA_Cash_Book_Import_Template', 'CashBookTemplate');
}

export function downloadMemberTemplate() {
  const templateData = [
    {
      'Membership No': 'SESWA-MEM-011',
      'Full Name': 'Muhammad Irfan',
      "Father's Name": 'Muhammad Sharif',
      'CNIC (XXXXX-XXXXXXX-X)': '12101-1122334-5',
      'Phone': '+92 300 9988776',
      'Email': 'irfan@example.com',
      'Address': 'Main Road, Shewa',
      'Profession': 'Teacher',
      'Blood Group': 'B+',
      'Join Date (YYYY-MM-DD)': '2026-04-01',
      'Status': 'ACTIVE',
      'Notes': 'Registered member'
    }
  ];
  exportToExcel(templateData, 'SESWA_Members_Import_Template', 'MembersTemplate');
}

// Generate Official SESWA Statement / PDF Print Window
export function generatePDFReport(
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number)[][],
  orientation: 'p' | 'l' = 'p',
  summaryRows?: { label: string; value: string }[]
) {
  if (typeof window === 'undefined') return;

  const printWin = window.open('', '_blank', 'width=1000,height=750');
  if (!printWin) {
    alert('Please allow pop-ups to print/export PDF report.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - SESWA</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: ${orientation === 'l' ? 'landscape' : 'portrait'};
            margin: 12mm;
          }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            margin: 0; 
            padding: 10px;
            color: #1a1a1a; 
            font-size: 11px;
          }
          .header { 
            background: #0F4C3A; 
            color: #ffffff; 
            padding: 14px 18px; 
            border-radius: 8px; 
            margin-bottom: 15px; 
          }
          .header h1 { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: -0.3px; }
          .header p { margin: 3px 0 0 0; font-size: 11px; color: #d0edd8; }
          .meta { font-size: 11px; margin-bottom: 14px; font-style: italic; color: #444; }
          table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 18px; }
          th { background: #0F4C3A; color: white; text-align: left; padding: 6px 8px; font-weight: 700; border: 1px solid #0F4C3A; }
          td { border: 1px solid #dcdcdc; padding: 5px 8px; }
          tr:nth-child(even) { background: #f9fbf9; }
          .summary-box { background: #f2f9f4; border: 1.5px solid #a3dcaf; padding: 10px 14px; border-radius: 6px; font-size: 11px; margin-bottom: 25px; }
          .summary-title { color: #0F4C3A; font-weight: 800; margin-bottom: 4px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 10px; font-size: 10px; }
          .sig-box { border-top: 1.5px solid #666; width: 28%; text-align: center; padding-top: 6px; }
          .footer { margin-top: 20px; font-size: 9px; color: #888; display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 6px; }
          @media print {
            button { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SHEWA EDUCATED SOCIAL WORKERS ASSOCIATION (SESWA)</h1>
          <p>Finance Sector — Central Accounting & Financial Management System v1.0</p>
          <p>Report: ${title} | Fiscal Year 2026–27 | Generated: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div class="meta">${subtitle}</div>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        ${summaryRows && summaryRows.length > 0 ? `
          <div class="summary-box">
            <div class="summary-title">SUMMARY TOTALS:</div>
            ${summaryRows.map(s => `<div>${s.label}: <strong>${s.value}</strong></div>`).join('')}
          </div>
        ` : ''}
        <div class="signatures">
          <div class="sig-box">
            <strong>Atta Ullah Khan</strong><br/>
            Authorized Finance Secretary
          </div>
          <div class="sig-box">
            <strong>Internal Auditor</strong><br/>
            Audit & Compliance Committee
          </div>
          <div class="sig-box">
            <strong>President / Executive Body</strong><br/>
            SESWA Governance
          </div>
        </div>
        <div class="footer">
          <span>SESWA Finance Management System v1.0</span>
          <span>Confidential Financial Document</span>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 200);
          }
        </script>
      </body>
    </html>
  `;

  printWin.document.write(html);
  printWin.document.close();
}
