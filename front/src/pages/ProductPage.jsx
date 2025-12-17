import React, { useState, useEffect, useCallback } from 'react';
import { message, Modal, Card, Row, Col, Button, Space, Typography, Spin, Empty } from 'antd';
import { ReloadOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import ProductFilter from '../components/products/ProductFilter';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import MaterialsModal from '../components/products/MaterialsModal';
import PricesModal from '../components/products/PricesModal';
import ProductPagination from '../components/products/ProductPagination'; // ← новый импорт
import CreateProductForm from '../components/products/CreateProductForm';
import { productsApi, materialsApi } from '../api/client';

const { Title } = Typography;

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    skip: 0,
    limit: 12,
    search: '',
    sort_by: 'name',
    sort_order: 'asc',
  });

  // Модалки редактирования
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Сворачиваемая форма создания
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Загрузка продуктов
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts(filters);
      setProducts(response.data.items || []);
      setTotal(response.data.total || response.data.count || 0);
    } catch (error) {
      message.error('Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  }, [filters]); // ← зависит от filters

  // Загрузка материалов
  const loadMaterials = useCallback(async () => {
    try {
      const response = await materialsApi.getMaterials({ limit: 1000 });
      setMaterials(response.data.items || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  }, []);

  // Загружаем продукты при изменении фильтров
  useEffect(() => {
    loadProducts();
  }, [filters, loadProducts]);

  // Загружаем материалы один раз
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Обработчик изменения фильтров (для пагинации)
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // loadProducts() вызовется автоматически через useEffect выше
  }, []);

  // Открытие модалок редактирования
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setActiveModal('edit');
  };

  const openMaterialsModal = (product) => {
    setSelectedProduct(product);
    setActiveModal('materials');
  };

  const openPricesModal = (product) => {
    setSelectedProduct(product);
    setActiveModal('prices');
  };

  // Закрытие всех модалок
  const closeModal = () => {
    setActiveModal(null);
    setSelectedProduct(null);
  };

  // Переключение формы создания
  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  // CRUD операции
  const handleEditProduct = async (values) => {
    try {
      await productsApi.updateProduct(selectedProduct.id, values);
      message.success('Продукт обновлен');
      closeModal();
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

  // Обновление после работы с материалами/ценами
  const handleProductUpdate = () => {
    loadProducts();
  };

  // После успешного создания
  const handleCreateSuccess = () => {
    loadProducts();
    setShowCreateForm(false);
  };

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="mb-0">
              Продукты
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={showCreateForm ? <UpOutlined /> : <PlusOutlined />}
                onClick={toggleCreateForm}
              >
                {showCreateForm ? 'Скрыть форму' : 'Создать продукт'}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Форма создания продукта */}
      {showCreateForm && (
        <div className="mb-8">
          <Card>
            <CreateProductForm
              onSuccess={handleCreateSuccess}
              showTitle={false}
            />
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <div className="mb-8">
        <Card className="mb-4">
          <ProductFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReload={loadProducts}
            onOpenCreateForm={toggleCreateForm}
          />
        </Card>
      </div>

      {/* Список продуктов */}
      <Card>
        {loading && products.length === 0 ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">Загрузка продуктов...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Empty
              description="Продукты не найдены"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            {filters.search && (
              <Button
                type="link"
                onClick={() => handleFiltersChange({ search: '' })}
                className="mt-2"
              >
                Очистить поиск
              </Button>
            )}
          </div>
        ) : (
          <>

            {/* Сетка карточек */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={openEditModal}
                  onDelete={handleDeleteProduct}
                  onManageMaterials={openMaterialsModal}
                  onManagePrices={openPricesModal}
                />
              ))}
            </div>

            {/* Пагинация */}
            <ProductPagination
              filters={filters}
              products={products}
              total={total}
              onFiltersChange={handleFiltersChange}
            />
          </>
        )}
      </Card>

      {/* Модалки редактирования */}
      {activeModal === 'edit' && selectedProduct && (
        <ProductModal
          key={`edit-${selectedProduct.id}`}
          open={true}
          onClose={closeModal}
          onSave={handleEditProduct}
          product={selectedProduct}
          title="Редактировать продукт"
        />
      )}

      {activeModal === 'materials' && selectedProduct && (
        <MaterialsModal
          key={`materials-${selectedProduct.id}`}
          visible={true}
          onCancel={closeModal}
          productId={selectedProduct.id}
          materials={materials}
          onProductUpdate={handleProductUpdate}
        />
      )}

      {activeModal === 'prices' && selectedProduct && (
        <PricesModal
          key={`prices-${selectedProduct.id}`}
          visible={true}
          onCancel={closeModal}
          productId={selectedProduct.id}
          onProductUpdate={handleProductUpdate}
        />
      )}
    </div>
  );
};

export default ProductPage;