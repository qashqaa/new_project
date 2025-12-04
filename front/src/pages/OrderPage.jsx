// src/pages/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { message, Modal, Tag } from 'antd';
import OrderFilter from '../components/orders/OrderFilter';
import OrderCard from '../components/orders/OrderCard';
import OrderModal from '../components/orders/OrderModal';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import { ordersApi, productsApi } from '../api/client';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 12,
    search: undefined, // вместо ''
    status: undefined, // вместо ''
    sort_by: 'created_date',
    sort_order: 'desc',
    created_date_from: undefined, // вместо ''
    created_date_to: undefined, // вместо ''
  });

  // Модалки
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // для обновления данных модалки

  // Загрузка заказов
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrders(filters);
      setOrders(response.data.items || []);
    } catch (error) {
      message.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Загрузка продуктов для создания заказа
  const loadProducts = useCallback(async () => {
    try {
      const response = await productsApi.getProducts({ limit: 1000 });
      setProducts(response.data.items || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Обработчики фильтров
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, skip: 0 }));
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
  const handleCreateOrder = async (values) => {
    try {
      await ordersApi.createOrder(values);
      message.success('Заказ создан');
      setCreateModalVisible(false);
      loadOrders();
    } catch (error) {
      message.error('Ошибка создания заказа');
    }
  };

  const handleStatusChange = async (orderId, action) => {
    console.log('🔄 Changing status:', { orderId, action });

    try {
      let response;
      switch (action) {
        case 'in_progress':
          response = await ordersApi.confirmOrder(orderId);
          break;
        case 'ready':
          response = await ordersApi.readyOrder(orderId);
          break;
        case 'completed':
          response = await ordersApi.completeOrder(orderId);
          break;
        case 'canceled':
          response = await ordersApi.cancelOrder(orderId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      console.log('✅ Status change response:', response);
      message.success(`Статус изменен на: ${action}`);
      loadOrders();

      // Обновляем данные в модалке если она открыта
      if (selectedOrderId === orderId) {
        loadOrders(); // перезагружаем заказы, что обновит и модалку
      }
    } catch (error) {
      console.error('❌ Status change failed:', error);
      console.error('Error details:', error.response?.data);
      message.error(`Ошибка: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleAddPayment = async (orderId, payment) => {
    try {
      await ordersApi.appendPayment(orderId, payment);
      message.success('Оплата добавлена');
      loadOrders();

      // Обновляем данные в модалке если она открыта
      if (selectedOrderId === orderId) {
        loadOrders();
      }
    } catch (error) {
      message.error('Ошибка добавления оплаты');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      0: { text: 'Создан', color: 'blue' },
      2: { text: 'В работе', color: 'orange' },
      3: { text: 'Готов', color: 'green' },
      4: { text: 'Отгружен', color: 'purple' },
      5: { text: 'Завершен', color: 'cyan' },
      6: { text: 'Отменен', color: 'red' },
    };
    return statusMap[status] || { text: 'Неизвестно', color: 'default' };
  };

  const handleUpdateMaterialUsage = async (
    orderId,
    materialId,
    actualUsage,
    onSuccess
  ) => {
    try {
      await ordersApi.appendMaterials(orderId, [
        {
          id: materialId,
          actual_usage: actualUsage,
        },
      ]);
      message.success('Фактический расход обновлен');
      loadOrders(); // обновляем список

      // Обновляем данные в модалке если она открыта
      if (selectedOrderId === orderId) {
        loadOrders();
      }

      onSuccess?.(); // вызываем callback если передан
    } catch (error) {
      message.error('Ошибка обновления расхода материала');
      throw error;
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setSelectedOrderId(order.id); // сохраняем ID для обновлений
    setDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedOrderId(null); // сбрасываем ID при закрытии
  };

  // Находим актуальный заказ для модалки (с обновленными данными)
  const currentOrderDetails = selectedOrderId
    ? orders.find((order) => order.id === selectedOrderId) || selectedOrder
    : selectedOrder;

  return (
    <div className="p-6">
      <OrderFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReload={loadOrders}
        getSortIcon={getSortIcon}
        handleSortOrder={handleSortOrder}
        openCreateModal={() => setCreateModalVisible(true)}
      />

      {/* Список заказов */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <OrderCard
                key={order.id}
                order={order}
                statusInfo={statusInfo}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusChange}
                onAddPayment={handleAddPayment}
              />
            );
          })}
        </div>
      )}

      {/* Модалки */}
      <OrderModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSave={handleCreateOrder}
        products={products}
        title="Создать заказ"
      />

      <OrderDetailsModal
        visible={detailsModalVisible}
        onCancel={handleCloseDetailsModal}
        order={currentOrderDetails} // передаем актуальные данные
        onStatusChange={handleStatusChange}
        onAddPayment={handleAddPayment}
        onUpdateMaterialUsage={handleUpdateMaterialUsage}
      />
    </div>
  );
};

export default OrdersPage;
