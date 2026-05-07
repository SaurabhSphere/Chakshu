// Date formatting
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}m ${secs}s`;
};

// Score formatting
export const formatScore = (score) => {
  if (!score) return '0.0';
  return parseFloat(score).toFixed(1);
};

export const formatPercentage = (value) => {
  if (!value) return '0%';
  return `${Math.round(value)}%`;
};

// Text formatting
export const capitalizeFirstLetter = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const truncateText = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Status formatting
export const getStatusColor = (status) => {
  const statusColors = {
    active: 'success',
    closed: 'danger',
    draft: 'warning',
    pending: 'warning',
    'in-progress': 'info',
    completed: 'success',
    applied: 'info',
    rejected: 'danger',
    shortlisted: 'success',
    interview: 'warning',
    offered: 'success',
    hired: 'success',
  };
  return statusColors[status] || 'secondary';
};

export const getStatusLabel = (status) => {
  const statusLabels = {
    'in-progress': 'In Progress',
    strong_yes: 'Strong Yes',
    strong_no: 'Strong No',
  };
  return statusLabels[status] || capitalizeWords(status.replace(/_/g, ' '));
};

// Array formatting
export const formatArray = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;
};

// Currency formatting
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};
