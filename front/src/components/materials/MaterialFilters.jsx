import React from 'react';
import GradientButton from '../../UI/GradientButton/GradientButton.jsx';

const MaterialFilters = ({
  filters,
  onFiltersChange,
  onReload,
  getSortIcon,
  onSortByName,
  onSortByCount,
  onOpenCreateModal, // ← новый пропс
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">📋 Материалы</h1>
        <GradientButton
          onClick={onOpenCreateModal} // ✅ Правильно!
        >
          Создать материал
        </GradientButton>
      </div>

      {/* ... остальные фильтры без изменений ... */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Поиск по названию..."
          className="px-3 py-2 border rounded-md flex-1"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
        />
        <select
          className="px-3 py-2 border rounded-md"
          value={filters.material_type}
          onChange={(e) => onFiltersChange({ material_type: e.target.value })}
        >
          <option value="">Все типы</option>
          <option value="бумага">бумага</option>
          <option value="дизайнерская бумага">дизайнерская бумага</option>
          <option value="ленты">ленты</option>
          <option value="биркодержатели">биркодержатели</option>
          <option value="риббон">риббон</option>
          <option value="структурная бумага">структурная бумага</option>
        </select>

        <button
          onClick={onSortByName}
          className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <span>По названию</span>
          <span>{getSortIcon('name')}</span>
        </button>

        <button
          onClick={onSortByCount}
          className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <span>По остатку</span>
          <span>{getSortIcon('count_left')}</span>
        </button>

        <button
          onClick={onReload}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Обновить
        </button>
      </div>

      {/* ... инфа о сортировке ... */}
    </div>
  );
};

export default MaterialFilters;
