import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { ordersApi } from '../api/client';
import OrderTable from '../components/orders/OrderTable';
import OrderFilters from '../components/orders/OrderFilters';
import CreateOrderModal from '../components/orders/CreateOrderModal';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import { STATUS_OPTIONS } from '../utils/orderConstants';
import '../utils/orders.css';

const { Title } = Typography;

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 12,
    sort_by: 'created_date',
    sort_order: 'desc',
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getOrders(filters);
      const ordersWithKey = response.data.items.map(order => ({
        ...order,
        key: order.id,
      }));
      setOrders(ordersWithKey);
      setTotal(response.data.total);
    } catch (error) {
      message.error('Ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      skip: 0,
    }));
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchOrders();
    message.success('Заказ успешно создан');
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await ordersApi.deleteOrder(orderId);
      message.success('Заказ удален');
      fetchOrders();
    } catch (error) {
      message.error('Ошибка при удалении заказа');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await ordersApi.completeOrder(orderId);
      message.success('Заказ завершен');
      fetchOrders();
    } catch (error) {
      message.error('Ошибка при завершении заказа');
    }
  };

  const handleAppendPayment = async (orderId, payment) => {
    try {
      await ordersApi.appendPayment(orderId, payment);
      message.success('Оплата добавлена');
      fetchOrders();
    } catch (error) {
      message.error('Ошибка при добавлении оплаты');
    }
  };

  const handleTableChange = (pagination, _, sorter) => {
    setFilters(prev => ({
      ...prev,
      skip: (pagination.current - 1) * (pagination.pageSize || 12),
      limit: pagination.pageSize || 12,
      sort_by: sorter.field || 'created_date',
      sort_order: sorter.order === 'ascend' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="orders-page">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2} className="mb-0">
            Заказы
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              loading={loading}
            >
              Обновить
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Создать заказ
            </Button>
          </Space>
        </Col>
      </Row>

      <Card className="mb-6">
        <OrderFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          statusOptions={STATUS_OPTIONS}
        />
      </Card>

      <Card>
        {loading && orders.length === 0 ? (
          <div className="text-center py-12">
            <Spin size="large" />
          </div>
        ) : orders.length === 0 ? (
          <Empty
            image={<FileSearchOutlined style={{ fontSize: 48 }} />}
            description="Заказы не найдены"
          />
        ) : (
          <OrderTable
            orders={orders}
            loading={loading}
            total={total}
            pagination={{
              current: Math.floor(filters.skip / filters.limit) + 1,
              pageSize: filters.limit,
              total: total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} из ${total} заказов`,
            }}
            onTableChange={handleTableChange}
            onDelete={handleDeleteOrder}
            onComplete={handleCompleteOrder}
            onAppendPayment={handleAppendPayment}
            onViewDetails={(order) => setSelectedOrder(order)}
          />
        )}
      </Card>

      <CreateOrderModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchOrders}
        />
      )}
    </div>
  );
};

export default OrderPage;