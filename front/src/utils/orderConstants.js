export const ORDER_STATUS = {
  CREATED: 0,
  IN_PROGRESS: 2,
  READY: 3,
  SHIPPED: 4,
  COMPLETED: 5,
  CANCELED: 6,
};

export const STATUS_OPTIONS = [
  { value: ORDER_STATUS.CREATED, label: 'Создан', color: 'blue' },
  { value: ORDER_STATUS.IN_PROGRESS, label: 'В работе', color: 'orange' },
  { value: ORDER_STATUS.READY, label: 'Готов', color: 'green' },
  { value: ORDER_STATUS.SHIPPED, label: 'Отгружен', color: 'purple' },
  { value: ORDER_STATUS.COMPLETED, label: 'Завершен', color: 'success' },
  { value: ORDER_STATUS.CANCELED, label: 'Отменен', color: 'error' },
];

export const STATUS_COLORS = {
  [ORDER_STATUS.CREATED]: 'blue',
  [ORDER_STATUS.IN_PROGRESS]: 'orange',
  [ORDER_STATUS.READY]: 'green',
  [ORDER_STATUS.SHIPPED]: 'purple',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELED]: 'error',
};

export const STATUS_LABELS = {
  [ORDER_STATUS.CREATED]: 'Создан',
  [ORDER_STATUS.IN_PROGRESS]: 'В работе',
  [ORDER_STATUS.READY]: 'Готов',
  [ORDER_STATUS.SHIPPED]: 'Отгружен',
  [ORDER_STATUS.COMPLETED]: 'Завершен',
  [ORDER_STATUS.CANCELED]: 'Отменен',
};