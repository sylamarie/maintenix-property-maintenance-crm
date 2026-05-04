export const formatDate = (value) => {
  if (!value) return 'Not scheduled';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) return 'Not recorded';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
};

export const formatOptionalCurrency = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'Not provided';
  }

  return formatCurrency(value);
};
