import React from 'react';

const MaterialCard = ({
  material,
  quantityInputs,
  updatingId,
  onQuantityChange,
  onAddQuantity,
  onRemoveQuantity,
  onEditMaterial, // ← новый пропс
  onDeleteMaterial, // ← новый пропс
  formatPrice,
}) => {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative">
      {' '}
      {/* ← добавил relative */}
      {/* Иконки действий в правом верхнем углу */}
      <div className="absolute top-3 right-3 flex gap-1">
        {/* Иконка редактирования */}
        <button
          onClick={() => onEditMaterial(material)}
          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
          title="Редактировать материал"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

        {/* Иконка удаления */}
        <button
          onClick={() => onDeleteMaterial(material.id)}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          title="Удалить материал"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      {/* Заголовок и статус */}
      <div className="flex justify-between items-start mb-3 pr-5">
        {' '}
        {/* ← добавил pr-8 для отступа под иконки */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">
            {material.name}
          </h3>
          <p className="text-gray-600 text-sm">{material.material_type}</p>
        </div>
      </div>
      {/* Информация о материале */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Цена упаковки:</span>
          <span className="font-medium text-green-600">
            {formatPrice(material.pack_price)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Цена за единицу:</span>
          <span className="font-medium text-green-600">
            {formatPrice(material.one_item_price)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>В упаковке:</span>
          <span className="font-medium">{material.count_in_one_pack} шт.</span>
        </div>
        <div className="flex justify-between">
          <span>Остаток:</span>
          <span
            className={`font-medium ${
              material.count_left < 50 ? 'text-red-600' : 'text-blue-600'
            }`}
          >
            {material.count_left} шт.
          </span>
        </div>
      </div>
      {/* Детали */}
      {material.detail && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-500">{material.detail}</p>
        </div>
      )}
      {/* Управление количеством */}
      <div className="mt-3">
        <div className="bg-gray-50 rounded-lg p-2 border">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Изменить кол-во
          </label>
          <div className="flex gap-1 items-center">
            <input
              type="number"
              min="0"
              max="9999"
              placeholder="Кол-во"
              value={quantityInputs[material.id] || ''}
              onChange={(e) => onQuantityChange(material.id, e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => onAddQuantity(material.id)}
              disabled={updatingId === material.id}
              className="px-2 py-1 bg-white text-green-600 rounded text-xs hover:bg-green-50 transition-colors font-medium disabled:opacity-50 flex items-center justify-center min-w-[28px]"
              title="Добавить"
            >
              {updatingId === material.id ? (
                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-sm">+</span>
              )}
            </button>
            <button
              onClick={() => onRemoveQuantity(material.id)}
              disabled={updatingId === material.id}
              className="px-2 py-1 bg-white text-red-500 rounded text-xs hover:bg-red-50 transition-colors font-medium disabled:opacity-50 flex items-center justify-center min-w-[28px]"
              title="Удалить"
            >
              {updatingId === material.id ? (
                <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-sm">-</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
