import React from 'react';
import { Input, Button, Select, Space } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const ProductFilter = ({
                         filters,
                         onFiltersChange,
                         onReload,
                       }) => {
  const handleSearchChange = (e) => {
    onFiltersChange({ search: e.target.value });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      onReload();
    }
  };

  const handleSortChange = (value) => {
    onFiltersChange({ sort_by: value });
  };

  const handleSortOrderChange = () => {
    onFiltersChange({
      sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex-1 flex flex-col md:flex-row gap-3">
        {/* Поиск */}
        <div className="flex-1">
          <Input
            placeholder="Поиск продуктов... (Enter для поиска)"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
            allowClear
            className="w-full"
          />
        </div>

        {/* Сортировка */}
        <div className="flex gap-2">
          <Select
            value={filters.sort_by}
            onChange={handleSortChange}
            className="w-32"
          >
            <Option value="name">По названию</Option>
            <Option value="created_date">По дате</Option>
          </Select>

          <Button onClick={handleSortOrderChange}>
            {filters.sort_order === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-2">
        <Button
          icon={<ReloadOutlined />}
          onClick={onReload}
        >
          Поиск
        </Button>
      </div>
    </div>
  );
};

export default ProductFilter;