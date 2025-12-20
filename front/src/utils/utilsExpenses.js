import dayjs from 'dayjs';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return dayjs(dateString).format('DD.MM.YYYY');
};

export const formatDateShort = (dateString) => {
  return dayjs(dateString).format('DD.MM.YYYY');
};

export const getPeriodicityColor = (periodicity) => {
  const colors = {
    "ежедневные": 'blue',
    "ежемесячные": 'orange',
    "ежегодные": 'green',
    "полугодовые": 'purple',
    "еженедельные": 'success',
  };
  return colors[periodicity] || 'default';
};

