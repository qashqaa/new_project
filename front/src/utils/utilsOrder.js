import dayjs from 'dayjs';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return dayjs(dateString).format('DD.MM.YYYY HH:mm');
};

export const formatDateShort = (dateString) => {
  return dayjs(dateString).format('DD.MM.YYYY');
};

export const getStatusColor = (status) => {
  const colors = {
    0: 'blue',
    2: 'orange',
    3: 'green',
    4: 'purple',
    5: 'success',
    6: 'error',
  };
  return colors[status] || 'default';
};

export const getStatusLabel = (status) => {
  const labels = {
    0: 'Создан',
    2: 'В работе',
    3: 'Готов',
    4: 'Отгружен',
    5: 'Завершен',
    6: 'Отменен',
  };
  return labels[status] || 'Неизвестно';
};