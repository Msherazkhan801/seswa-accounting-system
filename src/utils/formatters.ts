// Formatters and helper functions for SESWA Finance System

export function formatPKR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}

export function formatNumber(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('en-PK');
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  if (typeof window === 'undefined') return '2026-04-01';
  return new Date().toISOString().split('T')[0];
}

export function getOneYearLaterDateString(startDateStr: string): string {
  try {
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return '';
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1); // Exact 1 year minus 1 day (e.g., 2026-04-01 to 2027-03-31)
    return end.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function getDaysRemaining(endDateStr: string, baseDateStr?: string): number {
  try {
    const end = new Date(endDateStr);
    const today = baseDateStr ? new Date(baseDateStr) : (typeof window !== 'undefined' ? new Date() : new Date('2026-04-01'));
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function getTermStatusDetails(startDate: string, endDate: string, status: string) {
  if (status === 'TERMINATED') {
    return { label: 'Terminated', color: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300', isExpired: true };
  }
  if (status === 'TRANSFERRED') {
    return { label: 'Transferred', color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300', isExpired: true };
  }
  
  const days = getDaysRemaining(endDate);
  if (days < 0 || status === 'EXPIRED') {
    return { label: 'Term Expired', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300', isExpired: true, days };
  }
  if (days <= 30) {
    return { 
      label: `Expiring Soon (${days}d)`, 
      color: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse', 
      isExpired: false, 
      isExpiringSoon: true, 
      days 
    };
  }
  return { label: `Active (${days}d remaining)`, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', isExpired: false, days };
}

export function generateVoucherNo(type: string, count: number): string {
  const year = 2026;
  const seq = String(count + 1).padStart(3, '0');
  switch (type) {
    case 'CASH_RECEIPT': return `CRV-${year}-${seq}`;
    case 'CASH_PAYMENT': return `CPV-${year}-${seq}`;
    case 'BANK_RECEIPT': return `BRV-${year}-${seq}`;
    case 'BANK_PAYMENT': return `BPV-${year}-${seq}`;
    case 'BANK_TRANSFER': return `TRV-${year}-${seq}`;
    case 'JOURNAL_ENTRY': return `JV-${year}-${seq}`;
    default: return `TX-${year}-${seq}`;
  }
}

export function validateCNIC(cnic: string): boolean {
  const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
  return cnicRegex.test(cnic.trim());
}
