import React from 'react'

const QuantityControls = ({
                              material,
                              quantityInputs,
                              updatingId,
                              onQuantityChange,
                              onAddQuantity,
                              onRemoveQuantity
                          }) => {
    return (
        <div className="mt-4">
            <div className="bg-gray-50 rounded-lg p-3 border">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                    Изменение количества
                </label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        min="0"
                        max="1000"
                        placeholder="Кол-во"
                        value={quantityInputs[material.id] || ''}
                        onChange={(e) => onQuantityChange(material.id, e.target.value)}
                        className="flex-1 px-2 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={() => onAddQuantity(material.id)}
                        disabled={updatingId === material.id}
                        className="px-3 py-2 bg-white text-green-600 rounded text-sm hover:bg-green-50 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                        title="Добавить количество"
                    >
                        {updatingId === material.id ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="text-lg">➕</span>
                        )}
                    </button>
                    <button
                        onClick={() => onRemoveQuantity(material.id)}
                        disabled={updatingId === material.id}
                        className="px-3 py-2 bg-white text-red-500 rounded text-sm hover:bg-red-50 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                        title="Удалить количество"
                    >
                        {updatingId === material.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="text-lg">➖</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QuantityControls