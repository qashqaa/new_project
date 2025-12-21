import React, { useState, useEffect } from 'react'; // Добавил useEffect
import { expensesApi } from '../../api/client.js';
import { InputNumber } from 'antd';

const ExpensesCreateModal = ({ isOpen, onClose, onExpendCreated }) => {
  const [formData, setFormData] = useState({
    expense_type: '',
    periodicity: '',
    description: '',
    amount: '',
    actual_date: '',
  });
  const [loading, setLoading] = useState(false);

  // Функция для получения сегодняшней даты в формате YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Устанавливаем сегодняшнюю дату при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        actual_date: getTodayDate(),
      }));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Подготавливаем данные для отправки
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        // Используем дату из формы или сегодняшнюю
        actual_date: formData.actual_date || getTodayDate(),
      };

      const response = await expensesApi.createExpense(submitData);
      const newExpense = response.data;
      onExpendCreated(newExpense);
      onClose();

      // Сбрасываем форму, но дату оставляем сегодняшней
      setFormData({
        expense_type: '',
        periodicity: '',
        description: '',
        amount: '',
        actual_date: getTodayDate(), // Оставляем сегодняшнюю дату
      });
    } catch (error) {
      console.error('Ошибка при создании расхода:', error);
      alert('Ошибка при создании расхода');
    } finally {
      setLoading(false);
    }
  };

  // Форматирование числа для отображения
  const formatter = (value) => {
    if (!value && value !== 0) return '';
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Парсинг числа из форматированной строки
  const parser = (value) => {
    if (!value) return '';
    return value.replace(/\s/g, '');
  };

  // Обработчик для InputNumber
  const handleAmountChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      amount: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик сброса формы при закрытии
  const handleClose = () => {
    // Сбрасываем форму
    setFormData({
      expense_type: '',
      periodicity: '',
      description: '',
      amount: '',
      actual_date: getTodayDate(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Добавить расход</h2>
          <button
            onClick={handleClose}
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
            <select
              name="expense_type"
              value={formData.expense_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите тип расхода</option>
              <option value="">Выберите тип расхода</option>
              <option value="Расходники">Расходники</option>
              <option value="Маркетинг">Маркетинг</option>
              <option value="Аренда">Аренда</option>
              <option value="Телефоны">Телефоны</option>
              <option value="Еда/Продукты">Еда/Продукты</option>
              <option value="Зарплата">Зарплата</option>
              <option value="Прочие расходы">Прочие расходы</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Периодичность *
            </label>
            <select
              name="periodicity"
              value={formData.periodicity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите периодичность</option>
              <option value="ежедневные">ежедневные</option>
              <option value="еженедельные">еженедельные</option>
              <option value="ежемесячные">ежемесячные</option>
              <option value="полугодовые">полугодовые</option>
              <option value="ежегодные">ежегодные</option>
              <option value="разово">разово</option>
              <option value="другое">другое</option>
            </select>
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

          <div>
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
                step={10000}
                style={{ width: '100%' }}
                formatter={formatter}
                parser={parser}
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
                max={getTodayDate()} // Ограничиваем максимальную дату сегодняшней
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Создание...' : 'Создать расход'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpensesCreateModal;
