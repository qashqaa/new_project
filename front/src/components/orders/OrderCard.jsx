import React, { useState } from 'react';
import {
  EyeOutlined,
  DollarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Tag, Input, Button, message } from 'antd';

const OrderCard = ({
  order,
  statusInfo,
  onViewDetails,
  onStatusChange,
  onAddPayment,
  onEdit,
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [addingPayment, setAddingPayment] = useState(false);

  const handleAddPayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount)) {
      message.error('Введите корректную сумму');
      return;
    }

    setAddingPayment(true);
    try {
      await onAddPayment(order.id, parseFloat(paymentAmount));
      setPaymentAmount('');
    } catch (error) {
      // Ошибка обрабатывается в родителе
    } finally {
      setAddingPayment(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (order.status) {
      case 0: // CREATED
        actions.push({
          label: 'В работу',
          action: 'in_progress',
          color: 'orange',
          icon: <CheckOutlined />,
        });
        break;
      case 2: // IN_PROGRESS
        actions.push({
          label: 'Готов',
          action: 'ready',
          color: 'green',
          icon: <CheckOutlined />,
        });
        break;
      case 3: // READY
        actions.push({
          label: 'Завершить',
          action: 'completed',
          color: 'purple',
          icon: <CheckOutlined />,
        });
        break;
    }

    if (order.status < 5 && order.status !== 6) {
      actions.push({
        label: 'Отменить',
        action: 'canceled',
        color: 'red',
        icon: <CloseOutlined />,
      });
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div
      className={`bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow relative min-h-[260px] border-t-4 ${
        statusInfo.color === 'blue'
          ? 'border-t-white'
          : statusInfo.color === 'orange'
            ? 'border-t-orange-500'
            : statusInfo.color === 'green'
              ? 'border-t-green-500'
              : statusInfo.color === 'purple'
                ? 'border-t-purple-500'
                : statusInfo.color === 'cyan'
                  ? 'border-t-cyan-500'
                  : 'border-t-red-500'
      }`}
    >
      {/* Статус и дата */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {order.created_date?.slice(0, 10)}
        </span>
      </div>

      {/* Заголовок */}
      <div className="mb-4 pr-16">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">Заказ</h3>
        <p className="text-sm text-gray-500">ID: {order.id}</p>
      </div>

      {/* Клиент */}
      {order.customer && (
        <div className="mb-3">
          <p className="text-gray-600 text-sm">Клиент: {order.customer}</p>
        </div>
      )}

      {/* Продукты */}
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Продукты:</h4>
        <div className="space-y-1 max-h-16 overflow-y-auto">
          {order.products_detail?.slice(0, 3).map((item) => (
            <div key={item.id} className="flex justify-between text-xs">
              <span className="truncate flex-1 mr-2">
                {item.product_name} ({item.product_size})
              </span>
              <span className="text-blue-600 font-medium whitespace-nowrap">
                {item.quantity} шт.
              </span>
            </div>
          ))}
          {order.products_detail?.length > 3 && (
            <div className="text-xs text-gray-500">
              +{order.products_detail.length - 3} еще...
            </div>
          )}
        </div>
      </div>

      {/* Финансы - упрощенный блок */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Сумма:</span>
          <span className="font-bold text-green-600">
            {order.total_price?.toLocaleString()} UZS
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Оплачено:</span>
          <span>{order.paid?.toLocaleString()} UZS</span>
        </div>
        {/* Убрал блок материалов_price - он только в деталях */}
      </div>

      {/* Оплата */}
      {order.status > 0 && order.status < 4 && (
        <div className="mb-3">
          <div className="flex gap-1 mb-2">
            <Input
              size="small"
              placeholder="Сумма"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              loading={addingPayment}
              onClick={handleAddPayment}
            >
              Оплата
            </Button>
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(order)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
        >
          <EyeOutlined className="text-xs" />
          Детали
        </button>

        {availableActions.map((action) => (
          <button
            key={action.action}
            onClick={() => onStatusChange(order.id, action.action)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-xs transition-colors ${
              action.color === 'orange'
                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                : action.color === 'green'
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : action.color === 'purple'
                    ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;
