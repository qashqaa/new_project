// src/components/products/ProductFilter.jsx
import React from 'react';
import GradientButton from '../../UI/GradientButton/GradientButton';
import SearchButton from '../../UI/SearchButton/SearchButton';

const ProductFilter = ({
  filters,
  onFiltersChange,
  onReload,
  getSortIcon,
  handleSortOrder,
  openCreateModal,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">🛍️ Продукты</h1>
        <GradientButton onClick={openCreateModal}>
          Создать продукт
        </GradientButton>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Поиск по названию..."
          className="px-3 py-2 border rounded-md flex-1 min-w-[200px]"
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
        />

        <select
          className="px-3 py-2 border rounded-md min-w-[150px]"
          value={filters.size || ''}
          onChange={(e) => onFiltersChange({ size: e.target.value })}
        >
          <option value="">Все размеры</option>
          <option value="A4">A4</option>
          <option value="A5">A5</option>
          <option value="A6">A6</option>
        </select>

        <GradientButton onClick={handleSortOrder}>
          Сортировка {getSortIcon('name')}
        </GradientButton>

        <SearchButton onClick={onReload}>Обновить</SearchButton>
      </div>
    </div>
  );
};

export default ProductFilter;
