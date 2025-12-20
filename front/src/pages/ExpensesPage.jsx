import { expensesApi } from '../api/client';
import React, { useState, useEffect } from 'react';
import { Button, Col, message, Row, Space, Typography } from 'antd';
import ExpensesTable from '../components/exneses/ExpensesTable.jsx';
import ExpensesFilters from '../components/exneses/ExpensesFilters.jsx';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import '../utils/expenses.css'

const { Title } = Typography;

const ExpensesPage = () => {
  const [expenses, setExpenses]= useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 12,
    sort_by: 'actual_date',
    sort_order_by: 'desc',
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expensesApi.getExpenses(filters);
      const expensesWithKey = response.data.items.map(expense => ({
        ...expense,
        key: expense.id,
      }));
      setExpenses(expensesWithKey);
      setTotal(response.data.total);
    } catch (error) {
      message.error('ошибка загрузки расходов');
      console.log(error)
    } finally {
      setLoading(false)
    }
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);


  const handleDeleteOrder = async (expenseId) => {
    try {
      await expensesApi.deleteExpenses(expenseId);
      message.success('Расход удалён');
      fetchExpenses();
    } catch (error) {
      message.error('ошибка при удалении расхода')
    }
  };

  const handleTableChange = (pagination, _, sorter) => {
    setFilters(prev => ({
      ...prev,
      skip: (pagination.current - 1) * (pagination.pageSize || 12),
      limit: pagination.pageSize || 12,
      sort_by: sorter.field || 'actual_date',
      sort_order: sorter.order === 'ascend' ? 'asc' : 'desc',
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      skip: 0,
    }))
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchOrders();
    message.success('Расход успешно добавлен');
  };

  return (
    <div className='expenses-page'>
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2} className="mb-0">
            💸 Расходы
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchExpenses}
              loading={loading}
            >
              Обновить
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Добавить расход
            </Button>
          </Space>
        </Col>
      </Row>
      <ExpensesFilters filters={filters} onFilterChange={handleFilterChange} />

      <ExpensesTable
        expenses={expenses}
        loading={loading}
        total={total}
        pagination={{
          current: Math.floor(filters.skip / filters.limit) + 1,
          pageSize: filters.limit,
          total: total,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} из ${total} расходов`,
        }}
        onTableChange={handleTableChange}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
}

export default ExpensesPage;