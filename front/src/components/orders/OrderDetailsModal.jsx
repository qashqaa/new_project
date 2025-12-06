// src/components/orders/OrderDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Table,
  Input,
  Button,
  Tabs,
  message,
  InputNumber,
} from 'antd';
import {
  DollarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';

const OrderDetailsModal = ({
  visible,
  onCancel,
  order,
  onStatusChange,
  onAddPayment,
  onUpdateMaterialUsage,
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [addingPayment, setAddingPayment] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [actualUsageValues, setActualUsageValues] = useState({});
  const [localMaterials, setLocalMaterials] = useState([]);

  useEffect(() => {
    if (visible && order) {
      const materials = getAllMaterials();
      setLocalMaterials(materials);
      setEditingMaterialId(null);
      setActualUsageValues({});
    }
  }, [visible, order]);

  if (!order) return null;

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

  const getAllMaterials = () => {
    const materials = [];
    order.products_detail?.forEach((item) => {
      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach((material) => {
          materials.push({
            ...material,
            product_id: item.product_id,
            product_name: item.product_name,
          });
        });
      }
    });
    return materials;
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount)) {
      message.error('Введите корректную сумму');
      return;
    }

    setAddingPayment(true);
    try {
      await onAddPayment(order.id, parseFloat(paymentAmount));
      setPaymentAmount('');
      message.success('Оплата добавлена');
    } catch (error) {
      // Ошибка обрабатывается в родителе
    } finally {
      setAddingPayment(false);
    }
  };

  const handleEditUsage = (materialId, currentUsage) => {
    setEditingMaterialId(materialId);
    setActualUsageValues((prev) => ({
      ...prev,
      [materialId]: currentUsage || 0,
    }));
  };

  const handleSaveUsage = async (materialId) => {
    const newUsage = actualUsageValues[materialId];

    if (newUsage === undefined || newUsage < 0) {
      message.error('Введите корректное значение');
      return;
    }

    try {
      await onUpdateMaterialUsage(order.id, materialId, newUsage, () => {
        setEditingMaterialId(null);
        message.success('Данные обновлены');
        setLocalMaterials((prev) =>
          prev.map((material) =>
            material.id === materialId
              ? { ...material, actual_usage: newUsage }
              : material
          )
        );
      });
    } catch (error) {
      // Ошибка обрабатывается в родителе
    }
  };

  const handleUsageChange = (materialId, value) => {
    setActualUsageValues((prev) => ({
      ...prev,
      [materialId]: value,
    }));
  };

  const handleCancelEdit = (materialId) => {
    setEditingMaterialId(null);
    setActualUsageValues((prev) => {
      const newValues = { ...prev };
      delete newValues[materialId];
      return newValues;
    });
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (order.status) {
      case 0: // CREATED
        actions.push({
          label: 'Взять в работу',
          action: 'in_progress',
          color: 'orange',
          icon: <CheckOutlined />,
        });
        break;
      case 2: // IN_PROGRESS
        actions.push({
          label: 'Отметить готовым',
          action: 'ready',
          color: 'green',
          icon: <CheckOutlined />,
        });
        break;
      case 3: // READY
        actions.push({
          label: 'Завершить заказ',
          action: 'completed',
          color: 'purple',
          icon: <CheckOutlined />,
        });
        break;
    }

    if (order.status < 5 && order.status !== 6) {
      actions.push({
        label: 'Отменить заказ',
        action: 'canceled',
        color: 'red',
        icon: <CloseOutlined />,
      });
    }

    return actions;
  };

  const productColumns = [
    {
      title: 'Продукт',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product_name}</div>
          <div className="text-gray-500 text-sm">{record.product_size}</div>
        </div>
      ),
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => `${quantity} шт.`,
    },
    {
      title: 'Цена',
      dataIndex: 'product_price',
      key: 'product_price',
      render: (price) => (price ? `${price?.toLocaleString()} UZS` : '-'),
    },
  ];

  const materialColumns = [
    {
      title: 'Материал',
      key: 'material',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.material_name}</div>
          <div className="text-gray-500 text-sm">{record.material_type}</div>
        </div>
      ),
    },
    {
      title: 'Продукт',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name) => name || '-',
    },
    {
      title: 'Плановый расход',
      dataIndex: 'budged_usage',
      key: 'budged_usage',
      render: (usage) => `${usage} шт.`,
    },
    {
      title: 'Фактический расход',
      key: 'actual_usage',
      render: (_, record) => {
        const isEditing = editingMaterialId === record.id;

        if (isEditing) {
          return (
            <div className="flex gap-1">
              <InputNumber
                size="small"
                value={actualUsageValues[record.id]}
                onChange={(value) => handleUsageChange(record.id, value)}
                min={0}
                className="w-20"
              />
              <Button
                size="small"
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => handleSaveUsage(record.id)}
              >
                Сохранить
              </Button>
              <Button size="small" onClick={() => handleCancelEdit(record.id)}>
                Отмена
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <span>
              {record.actual_usage ? `${record.actual_usage} шт.` : '-'}
            </span>
            {order.status === 2 && (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditUsage(record.id, record.actual_usage)}
                title="Редактировать фактический расход"
              >
                Изменить
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: 'Разница',
      key: 'difference',
      render: (_, record) => {
        const diff = record.actual_usage - record.budged_usage;
        if (!record.actual_usage) return '-';

        return (
          <span
            className={
              diff > 0
                ? 'text-red-600'
                : diff < 0
                  ? 'text-green-600'
                  : 'text-gray-600'
            }
          >
            {diff > 0 ? '+' : ''}
            {diff} шт.
          </span>
        );
      },
    },
    {
      title: 'Цена',
      dataIndex: 'material_price',
      key: 'material_price',
      render: (price) => (price ? `${price?.toLocaleString()} UZS` : '-'),
    },
  ];

  const statusInfo = getStatusInfo(order.status);
  const availableActions = getAvailableActions();

  // Новый формат Tabs с items (вместо устаревшего Tabs.TabPane)
  const tabItems = [
    {
      key: 'products',
      label: 'Продукты',
      children: (
        <Table
          columns={productColumns}
          dataSource={order.products_detail || []}
          rowKey="id"
          pagination={false}
        />
      ),
    },
    {
      key: 'materials',
      label: 'Материалы',
      children:
        localMaterials.length > 0 ? (
          <>
            {order.status === 2 && (
              <div className="mb-3 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                  💡 <strong>Статус "В работе"</strong> - вы можете
                  редактировать фактический расход материалов
                </p>
              </div>
            )}
            <Table
              columns={materialColumns}
              dataSource={localMaterials}
              rowKey="id"
              pagination={false}
            />
          </>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Материалы не добавлены к заказу
          </div>
        ),
    },
  ];

  return (
    <Modal
      title={`Детали заказа`}
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      {/* Заголовок */}
      <div className="mb-4">
        <h2 className="font-bold text-xl text-gray-900">Заказ</h2>
        <p className="text-gray-500">ID: {order.id}</p>
      </div>

      <Descriptions column={2} bordered className="mb-4">
        <Descriptions.Item label="Статус" span={2}>
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Клиент">
          {order.customer || 'Не указан'}
        </Descriptions.Item>

        <Descriptions.Item label="Дата создания">
          {new Date(order.created_date).toLocaleString('ru-RU')}
        </Descriptions.Item>

        <Descriptions.Item label="Общая сумма">
          <span className="font-bold text-green-600">
            {order.total_price?.toLocaleString()} UZS
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Оплачено">
          <span
            className={
              order.paid < order.total_price
                ? 'text-orange-600'
                : 'text-green-600'
            }
          >
            {order.paid?.toLocaleString()} UZS
          </span>
        </Descriptions.Item>

        {order.materials_price > 0 && (
          <Descriptions.Item label="Стоимость материалов">
            {order.materials_price?.toLocaleString()} UZS
          </Descriptions.Item>
        )}

        {order.client_id && (
          <Descriptions.Item label="ID клиента">
            {order.client_id}
          </Descriptions.Item>
        )}

        {order.user_id && (
          <Descriptions.Item label="ID пользователя">
            {order.user_id}
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Табы для продуктов и материалов - обновленный формат */}
      <Tabs defaultActiveKey="products" items={tabItems} className="mb-4" />

      {/* Оплата */}
      {order.status > 0 && order.status < 4 && (
        <div className="mb-4 p-3 border rounded">
          <h4 className="font-medium mb-2">Добавить оплату:</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Сумма оплаты"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              type="primary"
              icon={<DollarOutlined />}
              loading={addingPayment}
              onClick={handleAddPayment}
            >
              Добавить оплату
            </Button>
          </div>
        </div>
      )}

      {/* Действия */}
      {availableActions.length > 0 && (
        <div className="flex gap-2">
          {availableActions.map((action) => (
            <Button
              key={action.action}
              type="primary"
              icon={action.icon}
              onClick={() => onStatusChange(order.id, action.action)}
              className={
                action.color === 'orange'
                  ? 'bg-orange-600'
                  : action.color === 'green'
                    ? 'bg-green-600'
                    : action.color === 'purple'
                      ? 'bg-purple-600'
                      : 'bg-red-600'
              }
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailsModal;
