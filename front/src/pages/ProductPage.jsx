// src/pages/ProductPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { message, Modal, Pagination } from 'antd';
import ProductFilter from '../components/products/ProductFilter';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import MaterialsModal from '../components/products/MaterialsModal';
import PricesModal from '../components/products/PricesModal';
import { productsApi, materialsApi } from '../api/client';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 12,
  });

  const [filters, setFilters] = useState({
    skip: 0,
    limit: 12,
    search: '',
    sort_by: 'name',
    sort_order: 'asc',
  });

  // Модалки
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [materialsModalVisible, setMaterialsModalVisible] = useState(false);
  const [pricesModalVisible, setPricesModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Загрузка продуктов
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts(filters);
      setProducts(response.data.items || []);

      // Обновляем пагинацию с общим количеством продуктов
      setPagination(prev => ({
        ...prev,
        total: response.data.total || response.data.count || 0,
        current: Math.floor(filters.skip / filters.limit) + 1,
      }));
    } catch (error) {
      message.error('Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Загрузка материалов
  const loadMaterials = useCallback(async () => {
    try {
      const response = await materialsApi.getMaterials({ limit: 1000 });
      setMaterials(response.data.items || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Обработчики фильтров
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, skip: 0 }));
  }, []);

  // Обработчик изменения страницы
  const handlePageChange = useCallback((page, pageSize) => {
    const newSkip = (page - 1) * pageSize;
    setFilters(prev => ({ ...prev, skip: newSkip, limit: pageSize }));
  }, []);

  const handleSortOrder = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const getSortIcon = useCallback(
    (field) => {
      if (filters.sort_by !== field) return '';
      return filters.sort_order === 'asc' ? '⬆️' : '⬇️';
    },
    [filters.sort_by, filters.sort_order]
  );

  // CRUD операции
  const handleCreateProduct = async (values) => {
    try {
      await productsApi.createProduct(values);
      message.success('Продукт создан');
      setCreateModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error('Ошибка создания продукта');
    }
  };

  const handleEditProduct = async (values) => {
    try {
      await productsApi.updateProduct(selectedProduct.id, values);
      message.success('Продукт обновлен');
      setEditModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error('Ошибка обновления продукта');
    }
  };

  const handleDeleteProduct = async (productId) => {
    Modal.confirm({
      title: 'Удалить продукт?',
      content: 'Это действие нельзя отменить',
      onOk: async () => {
        try {
          await productsApi.deleteProduct(productId);
          message.success('Продукт удален');
          loadProducts();
        } catch (error) {
          message.error('Ошибка удаления продукта');
        }
      },
    });
  };

  return (
    <div className="p-6">
      <ProductFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReload={loadProducts}
        getSortIcon={getSortIcon}
        handleSortOrder={handleSortOrder}
        openCreateModal={() => setCreateModalVisible(true)}
      />

      {/* Список продуктов */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(product) => {
                  setSelectedProduct(product);
                  setEditModalVisible(true);
                }}
                onDelete={handleDeleteProduct}
                onManageMaterials={(product) => {
                  setSelectedProduct(product);
                  setMaterialsModalVisible(true);
                }}
                onManagePrices={(product) => {
                  setSelectedProduct(product);
                  setPricesModalVisible(true);
                }}
              />
            ))}
          </div>

          {/* Пагинация */}
          {pagination.total > pagination.pageSize && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                showSizeChanger
                pageSizeOptions={['12', '24', '48', '96']}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} из ${total} продуктов`
                }
                locale={{
                  items_per_page: 'продуктов на странице',
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Модалки */}
      <ProductModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSave={handleCreateProduct}
        title="Создать продукт"
      />

      <ProductModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSave={handleEditProduct}
        product={selectedProduct}
        title="Редактировать продукт"
      />

      <MaterialsModal
        visible={materialsModalVisible}
        onCancel={() => setMaterialsModalVisible(false)}
        product={selectedProduct}
        materials={materials}
        onProductUpdate={loadProducts}
      />

      <PricesModal
        visible={pricesModalVisible}
        onCancel={() => setPricesModalVisible(false)}
        product={selectedProduct}
        onProductUpdate={loadProducts}
      />
    </div>
  );
};

export default ProductPage;