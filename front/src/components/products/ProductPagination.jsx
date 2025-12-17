import React from 'react'

const ProductPagination = ({ filters, products, total, onFiltersChange }) => {
  if (products.length === 0) return null

  const currentPage = Math.floor(filters.skip / filters.limit) + 1
  const totalPages = Math.ceil(total / filters.limit)
  const startItem = filters.skip + 1
  const endItem = Math.min(filters.skip + filters.limit, total)

  return (
    <div className="mt-6 flex justify-between items-center">
      <button
        onClick={() => onFiltersChange({
          skip: Math.max(0, filters.skip - filters.limit)
        })}
        disabled={filters.skip === 0}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        ← Назад
      </button>

      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-600">
          {startItem}-{endItem} из {total} продуктов
        </span>
        <span className="text-xs text-gray-400 mt-1">
          Страница {currentPage} из {totalPages}
        </span>
      </div>

      <button
        onClick={() => onFiltersChange({
          skip: filters.skip + filters.limit
        })}
        disabled={filters.skip + filters.limit >= total}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        Вперед →
      </button>
    </div>
  )
}

export default ProductPagination