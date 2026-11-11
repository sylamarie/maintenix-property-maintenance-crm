// A short, readable job code such as "JOB-17B06486". Job ids are long UUIDs,
// so only the first 8 characters are shown. The full id is still what the
// app uses behind the scenes (links, API calls).
export const formatJobCode = (id) => {
  const text = String(id ?? '').replace(/-/g, '');

  return `JOB-${text.slice(0, 8).toUpperCase()}`;
};

// "1 property", "3 properties". Pass the plural when it is not just "+s".
export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${Number(count) === 1 ? singular : plural}`;

// `fallback` is what to show when there is no date. The default suits every
// labelled field ("Due: Not set", "Completed: Not set").
export const formatDate = (value, fallback = 'Not set') => {
  if (!value) return fallback;

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
