import { AppSettings } from '../types';

export const formatCurrency = (amount: number, settings?: AppSettings): string => {
  const symbol = settings?.currency?.symbol || '₹';
  const placement = settings?.currency?.placement || 'before';
  
  const locale = settings?.currency?.code === 'INR' ? 'en-IN' : 'en-US';
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return placement === 'before'
    ? `${symbol}${formattedNumber}`
    : `${formattedNumber} ${symbol}`;
};

export const formatPercentage = (numerator: number, denominator: number): number => {
  if (denominator <= 0) return 0;
  const ratio = (numerator / denominator) * 100;
  return Math.min(Math.round(ratio), 100);
};

export const formatDate = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
