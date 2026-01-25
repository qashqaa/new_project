import React from 'react';
import {
  EditOutlined,
  DeleteOutlined,
  ToolOutlined,
  DollarOutlined,
  CopyOutlined,
} from '@ant-design/icons';

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onManageMaterials,
  onManagePrices,
  onCopy, // ← Добавили новый пропс
}) => {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Заголовок и кнопки действий */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm">{product.size}</p>
          {product.detail && (
            <p className="text-gray-500 text-xs mt-1">{product.detail}</p>
          )}
        </div>
        <div className="flex gap-1">
          {/* Кнопка копирования */}
          <button
            onClick={() => onCopy(product)}
            className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
            title="Копировать продукт"
          >
            <CopyOutlined />
          </button>

          <button
            onClick={() => onEdit(product)}
            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            title="Редактировать"
          >
            <EditOutlined />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Удалить"
          >
            <DeleteOutlined />
          </button>
        </div>
      </div>

      {/* Материалы - ПРОСТОЙ СПИСОК */}
      <div className="mb-3">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Материалы:</h4>
        <div className="space-y-1">
          {product.material_detail?.map((material) => (
            <div key={material.id} className="flex justify-between text-xs">
              <span>
                {material.material_name} {material.material_detail}
              </span>
              <span className="text-gray-500">
                {material.quantity_in_one_mat_unit} шт.
              </span>
            </div>
          ))}
          {(!product.material_detail ||
            product.material_detail.length === 0) && (
            <span className="text-gray-400 text-xs">
              Материалы не добавлены
            </span>
          )}
        </div>
      </div>

      {/* Цены - ПРОСТОЙ СПИСОК */}
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Цены:</h4>
        <div className="space-y-1">
          {product.price_tier?.map((price, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span>
                {price.start}-{price.end} шт.
              </span>
              <span className="text-green-600 font-medium">
                {new Intl.NumberFormat('ru-RU').format(price.price)} UZS
              </span>
            </div>
          ))}
          {(!product.price_tier || product.price_tier.length === 0) && (
            <span className="text-gray-400 text-xs">Цены не установлены</span>
          )}
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-2">
        <button
          onClick={() => onManageMaterials(product)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
        >
          <ToolOutlined />
          Материалы
        </button>
        <button
          onClick={() => onManagePrices(product)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100 transition-colors"
        >
          <DollarOutlined />
          Цены
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
