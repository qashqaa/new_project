import React, {useState} from 'react';
import { Button, Popconfirm, Table, Tag, Tooltip, Space } from 'antd'
import {formatCurrency, getPeriodicityColor} from '../../utils/utilsExpenses'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const ExpensesTable = ({
  expenses,
  loading,
  total,
  pagination,
  onTableChange,
  onDelete,
}) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
      render: (actual_date) => actual_date || '0000-00-00',
    },

    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space>
            <Tooltip title="Редактировать">
              <Button type="text"
                      icon={<EditOutlined />}
                      onClick={() => onTableChange(record)}
              />
            </Tooltip>
            <Tooltip title="Удалить заказ">
              <Popconfirm
                title="Удалить заказ?"
                description="Вы уверены, что хотите удалить этот заказ?"
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
    <>
      <Table
        columns={columns}
        dataSource={expenses}
        loading={loading}
        pagination={pagination}
        onChange={onTableChange}
        scroll={{ x: 1300 }} // Увеличил ширину для нового столбца
        />
    </>
  );
};

export default ExpensesTable;