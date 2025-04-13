export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions): string => {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
