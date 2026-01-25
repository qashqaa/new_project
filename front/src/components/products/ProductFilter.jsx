import React from 'react';
import { Input, Button, Select, Space } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Option } = Select;

// Определяем доступные типы
const PRODUCT_TYPES = [
  'Наклейки',
  'Визитки',
  'Бирки',
  'Ленты',
  'Карточки/открытки',
  'Сертификаты/меню',
  'Биркодержатели',
];

const ProductFilter = ({ filters, onFiltersChange, onReload }) => {
  const handleSearchChange = (e) => {
    onFiltersChange({ search: e.target.value });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      onReload(); // Выполняем поиск при нажатии Enter
    }
  };

  // ИЗМЕНЕНО: Теперь это выбор типа, а не сортировки
  const handleTypeChange = (value) => {
    // value будет undefined если выбрано "Все типы"
    onFiltersChange({
      type: value || null, // null вместо undefined для бэкенда
      skip: 0, // Сбрасываем пагинацию при смене типа
    });

    // Автоматически выполняем поиск при выборе типа
    if (value) {
      setTimeout(() => onReload(), 100);
    }
  };

  // Оставляем сортировку как есть
  const handleSortChange = (value) => {
    onFiltersChange({ sort_by: value });
  };

  const handleSortOrderChange = () => {
    onFiltersChange({
      sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc',
    });
  };

  // Обработчик очистки типа
  const handleClearType = () => {
    onFiltersChange({ type: null, skip: 0 });
    setTimeout(() => onReload(), 100);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex-1 flex flex-col md:flex-row gap-3">
        {/* Поиск по названию */}
        <div className="flex-1">
          <Input
            placeholder="Поиск по названию... (Enter для поиска)"
            prefix={<SearchOutlined />}
            value={filters.search || ''}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
            allowClear
            className="w-full"
            onClear={() => {
              onFiltersChange({ search: '', skip: 0 });
              onReload();
            }}
          />
        </div>

        {/* ФИЛЬТР ПО ТИПУ - ГЛАВНОЕ ИЗМЕНЕНИЕ */}
        <div className="w-56">
          <Select
            placeholder="Выберите тип продукции"
            value={filters.type || undefined} // undefined для отображения placeholder
            onChange={handleTypeChange}
            className="w-full"
            allowClear
            onClear={handleClearType}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value="">Все типы</Option>
            {PRODUCT_TYPES.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </div>

        {/* Сортировка (оставляем как было) */}
        <div className="flex gap-2">
          <Select
            value={filters.sort_by}
            onChange={handleSortChange}
            className="w-32"
          >
            <Option value="name">По названию</Option>
            <Option value="created_date">По дате</Option>
            <Option value="price">По цене</Option>
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
          type={filters.type ? 'primary' : 'default'}
        >
          {filters.type ? `Поиск: ${filters.type}` : 'Обновить'}
        </Button>
      </div>
    </div>
  );
};

export default ProductFilter;
