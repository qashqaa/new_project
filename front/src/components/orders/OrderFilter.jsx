// src/components/orders/OrderFilter.jsx
import React from 'react';
import { DatePicker } from 'antd';
import GradientButton from '../../UI/GradientButton/GradientButton';
import SearchButton from '../../UI/SearchBUtton/SearchButton';

const { RangePicker } = DatePicker;

const OrderFilter = ({
  filters,
  onFiltersChange,
  onReload,
  getSortIcon,
  handleSortOrder,
  openCreateModal,
}) => {
  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: '0', label: 'Создан' },
    { value: '2', label: 'В работе' },
    { value: '3', label: 'Готов' },
    { value: '4', label: 'Отгружен' },
    { value: '5', label: 'Завершен' },
    { value: '6', label: 'Отменен' },
  ];

  const handleDateChange = (dates, dateStrings) => {
    if (dates && dates[0] && dates[1]) {
      // Преобразуем даты из DD.MM.YYYY в YYYY-MM-DD для бэка
      const formatDateForBackend = (dateString) => {
        const [day, month, year] = dateString.split('.');
        return `${year}-${month}-${day}`;
      };

      onFiltersChange({
        created_date_from: formatDateForBackend(dateStrings[0]),
        created_date_to: formatDateForBackend(dateStrings[1]),
      });
    } else {
      // Отправляем undefined вместо пустых строк
      onFiltersChange({
        created_date_from: undefined,
        created_date_to: undefined,
      });
    }
  };

  const clearDateFilter = () => {
    // Отправляем undefined вместо пустых строк
    onFiltersChange({
      created_date_from: undefined,
      created_date_to: undefined,
    });
  };

  // Форматируем дату для отображения (из YYYY-MM-DD в DD.MM.YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';

    try {
      // Если дата в формате YYYY-MM-DD, преобразуем в DD.MM.YYYY
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">📦 Заказы</h1>
        <GradientButton onClick={openCreateModal}>Создать заказ</GradientButton>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Поиск по ID..."
          className="px-3 py-2 border rounded-md flex-1 min-w-[200px]"
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({ search: e.target.value || undefined })
          }
        />

        <select
          className="px-3 py-2 border rounded-md min-w-[150px]"
          value={filters.status || ''}
          onChange={(e) =>
            onFiltersChange({ status: e.target.value || undefined })
          }
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Фильтр по датам */}
        <div className="flex gap-2 items-center">
          <RangePicker
            placeholder={['Дата от', 'Дата до']}
            onChange={handleDateChange}
            format="DD.MM.YYYY"
            className="min-w-[250px]"
          />
          {(filters.created_date_from || filters.created_date_to) && (
            <button
              onClick={clearDateFilter}
              className="text-red-500 hover:text-red-700 text-sm whitespace-nowrap px-2 py-1 border border-red-300 rounded"
            >
              ✕ Очистить
            </button>
          )}
        </div>

        <GradientButton onClick={handleSortOrder}>
          Дата {getSortIcon('created_date')}
        </GradientButton>

        <SearchButton onClick={onReload}>Обновить</SearchButton>
      </div>

      {/* Показать активные фильтры дат */}
      {(filters.created_date_from || filters.created_date_to) && (
        <div className="text-sm text-gray-600 mb-2">
          📅 Фильтр по дате:
          {filters.created_date_from &&
            ` с ${formatDateForDisplay(filters.created_date_from)}`}
          {filters.created_date_to &&
            ` по ${formatDateForDisplay(filters.created_date_to)}`}
        </div>
      )}
    </div>
  );
};

export default OrderFilter;
