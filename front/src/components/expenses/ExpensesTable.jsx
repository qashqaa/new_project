import React from 'react';
import { Button, Popconfirm, Table, Tag, Tooltip, Space } from 'antd';
import { formatCurrency, getPeriodicityColor } from '../../utils/utilsExpenses';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const ExpensesTable = ({
  expenses,
  loading,
  total,
  pagination,
  onTableChange,
  onDelete,
  onEdit, // Получаем функцию редактирования
}) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      render: (id) => <span className="font-mono">{id}</span>,
    },

    {
      title: 'Тип расхода',
      dataIndex: 'expense_type',
      key: 'expense_type',
      sorter: true,
      render: (expense_type) => expense_type || '—',
    },

    {
      title: 'Периодичность',
      dataIndex: 'periodicity',
      key: 'periodicity',
      width: 200,
      render: (periodicity) => {
        return (
          <Tag color={getPeriodicityColor(periodicity)}>{periodicity}</Tag>
        );
      },
      sorter: true,
    },

    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount) => formatCurrency(amount || 0),
      sorter: true,
    },

    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (description) => description || '—',
    },

    {
      title: 'Дата',
      dataIndex: 'actual_date',
      key: 'actual_date',
      sorter: true,
      render: (actual_date) => {
        if (!actual_date) return '—';
        try {
          const date = new Date(actual_date);
          return date.toLocaleDateString('ru-RU');
        } catch {
          return actual_date;
        }
      },
    },

    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => {
        if (!created_at) return '—';
        try {
          const date = new Date(created_at);
          return date.toLocaleDateString('ru-RU');
        } catch {
          return created_at;
        }
      },
    },

    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space>
            <Tooltip title="Редактировать">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)} // Вызываем функцию из пропсов
              />
            </Tooltip>
            <Tooltip title="Удалить расход">
              <Popconfirm
                title="Удалить расход?"
                description="Вы уверены, что хотите удалить этот расход?"
                onConfirm={() => onDelete(record.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={expenses}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `Всего ${total} записей`,
      }}
      onChange={onTableChange}
      scroll={{ x: 1300 }}
    />
  );
};

export default ExpensesTable;
