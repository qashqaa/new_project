import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Typography,
} from 'antd';
import { statsApi } from '../../api/client.js';
import {
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;
const { MonthPicker } = DatePicker;

const ByDayStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    items: [],
    total_orders_count: 0,
    total_expenses_count: 0,
    total_orders_amount: 0,
    total_expenses_amount: 0,
  });

  const [filters, setFilters] = useState({
    date: dayjs().format('YYYY-MM-01'), // Текущий месяц, первое число
    statistics_type: 'all',
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        date: filters.date, // Формат: "2025-12-01"
        statistics_type: filters.statistics_type,
      };

      const response = await statsApi.monthStats(params);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке статистики');
      console.error('Error fetching month stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Обработчики фильтров
  const handleMonthChange = (date) => {
    if (date) {
      // Берем первое число месяца: "2025-12-01"
      const formattedDate = date.startOf('month').format('YYYY-MM-DD');
      setFilters((prev) => ({ ...prev, date: formattedDate }));
    }
  };

  const handleTypeChange = (value) => {
    setFilters((prev) => ({ ...prev, statistics_type: value }));
  };

  // Колонки для таблицы
  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Заказов',
      dataIndex: 'orders_count',
      key: 'orders_count',
      width: 100,
      sorter: (a, b) => a.orders_count - b.orders_count,
    },
    {
      title: 'Сумма заказов',
      dataIndex: 'orders_amount',
      key: 'orders_amount',
      width: 130,
      render: (amount) => `${amount?.toLocaleString() || 0} UZS`,
      sorter: (a, b) => a.orders_amount - b.orders_amount,
    },
    {
      title: 'Расходов',
      dataIndex: 'expenses_count',
      key: 'expenses_count',
      width: 100,
      sorter: (a, b) => a.expenses_count - b.expenses_count,
    },
    {
      title: 'Сумма расходов',
      dataIndex: 'expenses_amount',
      key: 'expenses_amount',
      width: 130,
      render: (amount) => `${amount?.toLocaleString() || 0} UZS`,
      sorter: (a, b) => a.expenses_amount - b.expenses_amount,
    },
    {
      title: 'Разница',
      dataIndex: 'difference',
      key: 'difference',
      width: 120,
      render: (difference) => {
        const color = difference >= 0 ? '#3f8600' : '#cf1322';
        return (
          <Text strong style={{ color }}>
            {difference?.toLocaleString() || 0} UZS
          </Text>
        );
      },
      sorter: (a, b) => a.difference - b.difference,
    },
  ];

  // Если выбраны только заказы или только расходы, скрываем ненужные колонки
  const filteredColumns = columns.filter((col) => {
    if (filters.statistics_type === 'orders') {
      return !col.key.includes('expenses');
    }
    if (filters.statistics_type === 'expenses') {
      return !col.key.includes('orders');
    }
    return true;
  });

  // Подготовка данных для отображения текущего месяца
  const currentMonth = dayjs(filters.date).format('MMMM YYYY');

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        <BarChartOutlined className="mr-2" />
        Статистика по дням
      </Title>

      {/* Фильтры */}
      <Card className="mb-6" size="small">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong className="block mb-2">
                <CalendarOutlined className="mr-2" />
                Месяц
              </Text>
              <MonthPicker
                format="MMMM YYYY"
                value={dayjs(filters.date)}
                onChange={handleMonthChange}
                style={{ width: '100%' }}
                allowClear={false}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong className="block mb-2">
                Тип статистики
              </Text>
              <Select
                value={filters.statistics_type}
                onChange={handleTypeChange}
                style={{ width: '100%' }}
              >
                <Option value="all">Все (заказы + расходы)</Option>
                <Option value="orders">Только заказы</Option>
                <Option value="expenses">Только расходы</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <div className="flex justify-end items-center">
              <Text type="secondary">
                {currentMonth} • Показано дней: {data.items.length}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Общая статистика за месяц */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Всего заказов"
              value={data.total_orders_count}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Сумма заказов"
              value={data.total_orders_amount}
              prefix={<DollarOutlined />}
              suffix="UZS"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Всего расходов"
              value={data.total_expenses_count}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Сумма расходов"
              value={data.total_expenses_amount}
              prefix={<DollarOutlined />}
              suffix="UZS"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Чистая прибыль/убыток */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card size="small">
            <Statistic
              title="Чистая прибыль за месяц"
              value={data.total_orders_amount - data.total_expenses_amount}
              prefix={<DollarOutlined />}
              suffix="UZS"
              valueStyle={{
                color:
                  data.total_orders_amount - data.total_expenses_amount >= 0
                    ? '#3f8600'
                    : '#cf1322',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Ошибки */}
      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {/* Таблица с детализацией по дням */}
      <Card>
        {loading ? (
          <div className="text-center py-10">
            <Spin size="large" />
            <p className="mt-4">Загрузка данных...</p>
          </div>
        ) : data.items.length === 0 ? (
          <Alert
            message="Нет данных"
            description={`За ${currentMonth} нет операций`}
            type="info"
            showIcon
          />
        ) : (
          <>
            <div className="mb-4">
              <Text strong>Детализация по дням:</Text>
            </div>
            <Table
              columns={filteredColumns}
              dataSource={data.items.map((item, index) => ({
                ...item,
                key: index,
                orders_amount: item.orders_amount || 0,
                expenses_amount: item.expenses_amount || 0,
                difference: item.difference || 0,
              }))}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Всего ${total} дней`,
              }}
              scroll={{ x: 'max-content' }}
              size="middle"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <Text strong>Итого за месяц:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{data.total_orders_count}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong>
                      {data.total_orders_amount?.toLocaleString() || 0} UZS
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <Text strong>{data.total_expenses_count}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <Text strong>
                      {data.total_expenses_amount?.toLocaleString() || 0} UZS
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <Text
                      strong
                      style={{
                        color:
                          data.total_orders_amount -
                            data.total_expenses_amount >=
                          0
                            ? '#3f8600'
                            : '#cf1322',
                      }}
                    >
                      {(
                        data.total_orders_amount - data.total_expenses_amount
                      )?.toLocaleString() || 0}{' '}
                      UZS
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default ByDayStatistics;
