import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Typography,
  Select,
  Divider,
  Empty,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { statsApi } from '../../api/client.js';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

const GraphStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState({
    items: [],
    total_orders_count: 0,
    total_expenses_count: 0,
    total_orders_amount: 0,
    total_expenses_amount: 0,
  });

  const [chartType, setChartType] = useState('bar');
  const [dataType, setDataType] = useState('amount'); // amount или count

  // Загрузка данных
  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await statsApi.yearGraph();
      setGraphData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке графиков');
      console.error('Error fetching year graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Форматирование данных для графиков
  const prepareChartData = () => {
    if (!graphData.items || graphData.items.length === 0) return [];

    return [...graphData.items]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        name: dayjs(item.date).format('MMM YYYY'),
        month: dayjs(item.date).format('MMMM'),
        orders_count: item.orders_count || 0,
        expenses_count: item.expenses_count || 0,
        orders_amount: item.orders_amount || 0,
        expenses_amount: item.expenses_amount || 0,
        difference: item.difference || 0,
        profit: item.orders_amount - item.expenses_amount || 0,
        fullDate: item.date,
      }));
  };

  // Рассчитать изменения по сравнению с предыдущим месяцем
  const calculateChanges = () => {
    const sortedData = [...graphData.items].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    if (sortedData.length < 2) return { ordersChange: 0, expensesChange: 0 };

    const current = sortedData[0];
    const previous = sortedData[1];

    const ordersChange = previous.orders_amount
      ? ((current.orders_amount - previous.orders_amount) /
          previous.orders_amount) *
        100
      : 0;

    const expensesChange = previous.expenses_amount
      ? ((current.expenses_amount - previous.expenses_amount) /
          previous.expenses_amount) *
        100
      : 0;

    return { ordersChange, expensesChange };
  };

  const { ordersChange, expensesChange } = calculateChanges();
  const chartData = prepareChartData();
  const currentYear = dayjs().year();

  // Цвета для графиков
  const COLORS = [
    '#1890ff',
    '#fa8c16',
    '#52c41a',
    '#f5222d',
    '#722ed1',
    '#13c2c2',
  ];

  // Форматирование валюты
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Кастомный тултип для графиков
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="mb-1">
              {entry.name}:{' '}
              {dataType === 'amount'
                ? formatCurrency(entry.value)
                : `${entry.value} шт.`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Рендер выбранного графика
  const renderChart = () => {
    if (chartData.length === 0)
      return <Empty description="Нет данных за год" />;

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const yAxisProps = {
      tickFormatter: (value) =>
        dataType === 'amount'
          ? formatCurrency(value).replace('UZS', '').trim()
          : value,
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis {...yAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey={
                  dataType === 'amount' ? 'orders_amount' : 'orders_count'
                }
                name="Заказы"
                fill="#1890ff"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey={
                  dataType === 'amount' ? 'expenses_amount' : 'expenses_count'
                }
                name="Расходы"
                fill="#fa8c16"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis {...yAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey={
                  dataType === 'amount' ? 'orders_amount' : 'orders_count'
                }
                name="Заказы"
                stroke="#1890ff"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey={
                  dataType === 'amount' ? 'expenses_amount' : 'expenses_count'
                }
                name="Расходы"
                stroke="#fa8c16"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis {...yAxisProps} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey={
                  dataType === 'amount' ? 'orders_amount' : 'orders_count'
                }
                name="Заказы"
                stroke="#1890ff"
                fill="#1890ff"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey={
                  dataType === 'amount' ? 'expenses_amount' : 'expenses_count'
                }
                name="Расходы"
                stroke="#fa8c16"
                fill="#fa8c16"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'profit':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(value).replace('UZS', '').trim()
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Прибыль']}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Bar
                dataKey="profit"
                name="Чистая прибыль"
                fill={({ profit }) => (profit >= 0 ? '#52c41a' : '#f5222d')}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Общая статистика за год
  const totalProfit =
    graphData.total_orders_amount - graphData.total_expenses_amount;

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        <LineChartOutlined className="mr-2" />
        Статистика за год ({currentYear})
      </Title>

      {/* Фильтры и настройки */}
      <Card className="mb-6" size="small">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong className="block mb-2">
                <BarChartOutlined className="mr-2" />
                Тип графика
              </Text>
              <Select
                value={chartType}
                onChange={setChartType}
                style={{ width: '100%' }}
              >
                <Option value="bar">Столбчатая диаграмма</Option>
                <Option value="line">Линейный график</Option>
                <Option value="area">Областной график</Option>
                <Option value="profit">Прибыль по месяцам</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong className="block mb-2">
                Показать данные
              </Text>
              <Select
                value={dataType}
                onChange={setDataType}
                style={{ width: '100%' }}
              >
                <Option value="amount">Суммы (UZS)</Option>
                <Option value="count">Количество</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={24} md={12}>
            <div className="flex justify-end items-center">
              <Text type="secondary">
                <CalendarOutlined className="mr-2" />
                Данные за последние 12 месяцев
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Общая годовая статистика */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Заказов за год"
              value={graphData.total_orders_count}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="шт."
            />
            {ordersChange !== 0 && (
              <div className="mt-2">
                <Text type={ordersChange > 0 ? 'success' : 'danger'}>
                  {ordersChange > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}
                  {Math.abs(ordersChange).toFixed(1)}% к прошлому месяцу
                </Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Сумма заказов"
              value={formatCurrency(graphData.total_orders_amount)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Расходов за год"
              value={graphData.total_expenses_count}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              suffix="шт."
            />
            {expensesChange !== 0 && (
              <div className="mt-2">
                <Text type={expensesChange > 0 ? 'danger' : 'success'}>
                  {expensesChange > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}
                  {Math.abs(expensesChange).toFixed(1)}% к прошлому месяцу
                </Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Сумма расходов"
              value={formatCurrency(graphData.total_expenses_amount)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Чистая прибыль за год */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card size="small">
            <Statistic
              title="Чистая прибыль за год"
              value={formatCurrency(totalProfit)}
              prefix={<DollarOutlined />}
              valueStyle={{
                fontSize: '24px',
                color: totalProfit >= 0 ? '#3f8600' : '#cf1322',
              }}
            />
            <div className="mt-2">
              <Text type={totalProfit >= 0 ? 'success' : 'danger'}>
                {totalProfit >= 0 ? '📈 Прибыль' : '📉 Убыток'} •
                Рентабельность:{' '}
                {graphData.total_orders_amount > 0
                  ? (
                      (totalProfit / graphData.total_orders_amount) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </Text>
            </div>
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

      {/* График */}
      <Card className="mb-6">
        <div className="mb-4">
          <Title level={4}>
            {chartType === 'profit'
              ? 'Чистая прибыль по месяцам'
              : 'Статистика за год'}
            <Text type="secondary" className="ml-2">
              ({dataType === 'amount' ? 'суммы в UZS' : 'количество операций'})
            </Text>
          </Title>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Spin size="large" />
            <p className="mt-4">Загрузка данных...</p>
          </div>
        ) : (
          renderChart()
        )}
      </Card>

      {/* Дополнительная информация */}
      {chartData.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Лучший месяц" size="small" className="h-full">
              {(() => {
                const bestMonth = [...chartData].sort(
                  (a, b) => b.profit - a.profit
                )[0];
                return bestMonth ? (
                  <div>
                    <Text strong>{bestMonth.name}</Text>
                    <div className="mt-2">
                      <Text type={bestMonth.profit >= 0 ? 'success' : 'danger'}>
                        Прибыль: {formatCurrency(bestMonth.profit)}
                      </Text>
                    </div>
                    <div className="mt-1">
                      <Text>
                        Заказы: {formatCurrency(bestMonth.orders_amount)}
                      </Text>
                    </div>
                    <div className="mt-1">
                      <Text>
                        Расходы: {formatCurrency(bestMonth.expenses_amount)}
                      </Text>
                    </div>
                  </div>
                ) : (
                  <Text>Нет данных</Text>
                );
              })()}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Средние показатели" size="small" className="h-full">
              {chartData.length > 0 && (
                <div>
                  <div>
                    <Text>Средняя месячная прибыль: </Text>
                    <Text strong>
                      {formatCurrency(
                        chartData.reduce((sum, item) => sum + item.profit, 0) /
                          chartData.length
                      )}
                    </Text>
                  </div>
                  <div className="mt-1">
                    <Text>Средний чек заказа: </Text>
                    <Text strong>
                      {graphData.total_orders_count > 0
                        ? formatCurrency(
                            graphData.total_orders_amount /
                              graphData.total_orders_count
                          )
                        : formatCurrency(0)}
                    </Text>
                  </div>
                  <div className="mt-1">
                    <Text>Средний расход: </Text>
                    <Text strong>
                      {graphData.total_expenses_count > 0
                        ? formatCurrency(
                            graphData.total_expenses_amount /
                              graphData.total_expenses_count
                          )
                        : formatCurrency(0)}
                    </Text>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default GraphStatistics;
