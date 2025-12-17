import React, { useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Popconfirm, InputNumber, Modal } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../utils/utilsOrder.js';
import { ORDER_STATUS } from '../../utils/orderConstants.js';

const OrderTable = ({
                      orders,
                      loading,
                      total,
                      pagination,
                      onTableChange,
                      onDelete,
                      onComplete,
                      onAppendPayment,
                      onViewDetails,
                    }) => {

  const [paymentModal, setPaymentModal] = useState({ visible: false, orderId: null, amount: 0 });

  const handleAppendPaymentClick = (orderId) => {
    setPaymentModal({ visible: true, orderId, amount: 0 });
  };

  const handlePaymentSubmit = () => {
    if (paymentModal.amount > 0) {
      onAppendPayment(paymentModal.orderId, paymentModal.amount);
      setPaymentModal({ visible: false, orderId: null, amount: 0 });
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-mono">{id}</span>,
    },
    {
      title: 'Клиент',
      dataIndex: 'customer',
      key: 'customer',
      sorter: true,
      render: (customer) => customer || '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Tag>
        );
      },
      sorter: true,
      filters: [
        { text: 'Создан', value: ORDER_STATUS.CREATED },
        { text: 'В работе', value: ORDER_STATUS.IN_PROGRESS },
        { text: 'Готов', value: ORDER_STATUS.READY },
        { text: 'Отгружен', value: ORDER_STATUS.SHIPPED },
        { text: 'Завершен', value: ORDER_STATUS.COMPLETED },
        { text: 'Отменен', value: ORDER_STATUS.CANCELED },
      ],
    },
    {
      title: 'Сумма',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 150,
      render: (price) => formatCurrency(price || 0),
      sorter: true,
    },
    {
      title: 'Оплачено',
      dataIndex: 'paid',
      key: 'paid',
      width: 150,
      render: (paid) => formatCurrency(paid || 0),
      sorter: true,
    },
    {
      title: 'Остаток',
      key: 'remainder',
      width: 150,
      render: (_, record) => {
        const totalPrice = record.total_price || 0;
        const paidAmount = record.paid || 0;
        const remainder = totalPrice - paidAmount;

        // Если остаток отрицательный (переплата), показываем 0
        const displayRemainder = remainder > 0 ? remainder : 0;

        return (
          <div>
            <div className={displayRemainder > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
              {formatCurrency(displayRemainder)}
            </div>
            {remainder < 0 && (
              <div className="text-xs text-green-500">
                Переплата: {formatCurrency(Math.abs(remainder))}
              </div>
            )}
          </div>
        );
      },
      sorter: (a, b) => {
        const remainderA = (a.total_price || 0) - (a.paid || 0);
        const remainderB = (b.total_price || 0) - (b.paid || 0);
        return remainderA - remainderB;
      },
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 180,
      render: (date) => date ? formatDate(date) : '—',
      sorter: true,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const totalPrice = record.total_price || 0;
        const paidAmount = record.paid || 0;
        const remainder = totalPrice - paidAmount;
        const isFullyPaid = remainder <= 0;

        return (
          <Space>
            <Tooltip title="Просмотреть детали">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onViewDetails(record)}
              />
            </Tooltip>

            {record.status !== ORDER_STATUS.COMPLETED && record.status !== ORDER_STATUS.CANCELED && (
              <>
                <Tooltip title={isFullyPaid ? "Заказ полностью оплачен" : "Добавить оплату"}>
                  <Button
                    type="text"
                    icon={<DollarOutlined />}
                    onClick={() => handleAppendPaymentClick(record.id)}
                    disabled={isFullyPaid}
                    style={{ opacity: isFullyPaid ? 0.5 : 1 }}
                  />
                </Tooltip>

                <Tooltip title="Завершить заказ">
                  <Popconfirm
                    title="Завершить заказ?"
                    description="Вы уверены, что хотите завершить этот заказ?"
                    onConfirm={() => onComplete(record.id)}
                    okText="Да"
                    cancelText="Нет"
                  >
                    <Button type="text" icon={<CheckCircleOutlined />} />
                  </Popconfirm>
                </Tooltip>
              </>
            )}

            <Tooltip title="Удалить заказ">
              <Popconfirm
                title="Удалить заказ?"
                description="Вы уверены, что хотите удалить этот заказ?"
                onConfirm={() => onDelete(record.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={pagination}
        onChange={onTableChange}
        scroll={{ x: 1300 }} // Увеличил ширину для нового столбца
        rowClassName={(record) => {
          const totalPrice = record.total_price || 0;
          const paidAmount = record.paid || 0;
          const remainder = totalPrice - paidAmount;

          if (record.status === ORDER_STATUS.COMPLETED) return 'bg-green-50';
          if (record.status === ORDER_STATUS.CANCELED) return 'bg-red-50';
          if (remainder <= 0) return 'bg-blue-50'; // Полностью оплаченные заказы
          return '';
        }}
        locale={{
          emptyText: 'Нет данных для отображения'
        }}
      />

      <Modal
        title="Добавить оплату"
        open={paymentModal.visible}
        onOk={handlePaymentSubmit}
        onCancel={() => setPaymentModal({ visible: false, orderId: null, amount: 0 })}
        okText="Добавить"
        cancelText="Отмена"
      >
        <div className="py-4">
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber
              placeholder="Сумма оплаты"
              value={paymentModal.amount}
              onChange={(value) => setPaymentModal(prev => ({ ...prev, amount: value }))}
              min={0}
              step={1000}
              formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''}
              parser={value => value ? value.replace(/\s/g, '') : ''}
              style={{ width: '100%' }}
            />
            <span
              style={{
                padding: '0 11px',
                border: '1px solid #d9d9d9',
                borderLeft: 'none',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '60px'
              }}
            >
              UZS
            </span>
          </Space.Compact>
        </div>
      </Modal>
    </>
  );
};

export default OrderTable;