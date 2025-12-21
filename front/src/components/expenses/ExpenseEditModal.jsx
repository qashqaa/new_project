import React, { useState, useEffect } from 'react';
import { expensesApi } from '../../api/client.js';
import { InputNumber, Select } from 'antd';

const { Option } = Select;

const ExpensesEditModal = ({ isOpen, onClose, expense, onExpenseUpdated }) => {
  const [formData, setFormData] = useState({
    expense_type: '',
    periodicity: '',
    description: '',
    amount: '',
    actual_date: '',
  });
  const [loading, setLoading] = useState(false);

  // Заполняем форму данными расхода при открытии
  useEffect(() => {
    if (expense && isOpen) {
      setFormData({
        expense_type: expense.expense_type || '',
        periodicity: expense.periodicity || '',
        description: expense.description || '',
        amount: expense.amount ? expense.amount.toString() : '',
        actual_date: expense.actual_date || '',
      });
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expense || !expense.id) {
      alert('Ошибка: расход не выбран для редактирования');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        expense_type: formData.expense_type,
        periodicity: formData.periodicity,
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        actual_date: formData.actual_date,
      };

      const response = await expensesApi.updateExpense(expense.id, submitData);
      const updatedExpense = response.data;

      onExpenseUpdated(updatedExpense);
    } catch (error) {
      console.error('Ошибка при обновлении расхода:', error);
      alert('Ошибка при обновлении расхода');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик для Select компонентов
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик для InputNumber
  const handleAmountChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      amount: value,
    }));
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Редактировать расход</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип расхода *
            </label>
            <Select
              value={formData.expense_type}
              onChange={(value) => handleSelectChange('expense_type', value)}
              placeholder="Выберите тип расхода"
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="">Выберите тип расхода</Option>
              <Option value="Расходники">Расходники</Option>
              <Option value="Маркетинг">Маркетинг</Option>
              <Option value="Аренда">Аренда</Option>
              <Option value="Телефоны">Телефоны</Option>
              <Option value="Еда/Продукты">Еда/Продукты</Option>
              <Option value="Зарплата">Зарплата</Option>
              <Option value="Прочие расходы">Прочие расходы</Option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Периодичность *
            </label>
            <Select
              value={formData.periodicity}
              onChange={(value) => handleSelectChange('periodicity', value)}
              placeholder="Выберите периодичность"
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="">Выберите периодичность</Option>
              <Option value="ежедневные">ежедневные</Option>
              <Option value="еженедельные">еженедельные</Option>
              <Option value="ежемесячные">ежемесячные</Option>
              <Option value="полугодовые">полугодовые</Option>
              <Option value="ежегодные">ежегодные</Option>
              <Option value="разово">разово</Option>
              <Option value="другое">другое</Option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Наименование
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Наименование расхода"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сумма *
              </label>
              <InputNumber
                name="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="Сумма"
                min={0}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата *
              </label>
              <input
                type="date"
                name="actual_date"
                value={formData.actual_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md mt-4">
            <p className="text-sm text-blue-700">
              <span className="font-medium">ID:</span> {expense.id}
            </p>
            {expense.created_at && (
              <p className="text-sm text-blue-700 mt-1">
                <span className="font-medium">Создан:</span>{' '}
                {new Date(expense.created_at).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpensesEditModal;