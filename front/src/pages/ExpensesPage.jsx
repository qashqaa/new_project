import { expensesApi } from '../api/client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  message,
  Row,
  Space,
  Statistic,
  Typography,
} from 'antd';
import ExpensesTable from '../components/expenses/ExpensesTable.jsx';
import ExpensesFilters from '../components/expenses/ExpensesFilters.jsx';
import ExpensesCreateModal from '../components/expenses/ExpensesCreateModal.jsx';
import ExpensesEditModal from '../components/expenses/ExpenseEditModal.jsx';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import '../utils/expenses.css';

const { Title } = Typography;

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalSummary, setTotalSummary] = useState(0); // сумма всех расходов
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 12,
    sort_by: 'actual_date',
    sort_order_by: 'desc',
  });

  // Состояния для модалок
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Загрузка расходов
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expensesApi.getExpenses(filters);
      const expensesWithKey = response.data.items.map((expense) => ({
        ...expense,
        key: expense.id,
      }));
      setExpenses(expensesWithKey);
      setTotal(response.data.total);
      setTotalSummary(response.data.total_summary || 0);
    } catch (error) {
      message.error('Ошибка загрузки расходов');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики для создания
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleExpenseCreated = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    setTotal((prev) => prev + 1);
    message.success('Расход успешно создан');
    handleCloseCreateModal();
  };

  // Обработчики для редактирования
  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingExpense(null);
  };

  const handleExpenseUpdated = (updatedExpense) => {
    // Обновляем расход в локальном массиве
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    message.success('Расход успешно обновлен');
    handleCloseEditModal();
  };

  // Обработчик удаления
  const handleDeleteOrder = async (expenseId) => {
    try {
      await expensesApi.deleteExpenses(expenseId);
      // Удаляем из локального массива
      setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
      setTotal((prev) => prev - 1);
      message.success('Расход удалён');
    } catch (error) {
      message.error('Ошибка при удалении расхода');
    }
  };

  // Обработчик изменения таблицы (пагинация, сортировка)
  const handleTableChange = (pagination, _, sorter) => {
    setFilters((prev) => ({
      ...prev,
      skip: (pagination.current - 1) * (pagination.pageSize || 12),
      limit: pagination.pageSize || 12,
      sort_by: sorter.field || 'actual_date',
      sort_order: sorter.order === 'ascend' ? 'asc' : 'desc',
    }));
  };

  // Обработчик фильтров
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      skip: 0,
    }));
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  return (
    <div className="expenses-page">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2} className="mb-0">
            💸 Расходы
          </Title>
        </Col>
        <Col>
          <Space>
            {/* Карточка с общей суммой */}
            <Card size="small" className="summary-card">
              <Statistic
                title="Общая сумма расходов"
                value={totalSummary}
                precision={2}
                prefix="UZS"
                valueStyle={{
                  color: '#595959',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              />
            </Card>

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchExpenses}
              loading={loading}
            >
              Обновить
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
              loading={loading}
            >
              Создать расход
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
        onEdit={handleEditClick} // Передаем функцию редактирования
      />

      {/* Модалка создания */}
      <ExpensesCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onExpendCreated={handleExpenseCreated}
      />

      {/* Модалка редактирования */}
      <ExpensesEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        expense={editingExpense}
        onExpenseUpdated={handleExpenseUpdated}
      />
    </div>
  );
};

export default ExpensesPage;
