import React from 'react'

const MaterialPagination = ({ filters, materials, onFiltersChange }) => {
    if (materials.length === 0) return null

    return (
        <div className="mt-6 flex justify-between items-center">
            <button
                onClick={() => onFiltersChange({ skip: Math.max(0, filters.skip - filters.limit) })}
                disabled={filters.skip === 0}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                ← Назад
            </button>
            <span className="text-sm text-gray-600">
                Показано {materials.length} материалов
            </span>
            <button
                onClick={() => onFiltersChange({ skip: filters.skip + filters.limit })}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
                Вперед →
            </button>
        </div>
    )
}

export default MaterialPagination