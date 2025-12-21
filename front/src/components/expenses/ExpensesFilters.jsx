import { DatePicker, Select, Form, Row, Col, Input, Space, Button } from 'antd';
import dayjs from 'dayjs';
import {
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import React from 'react';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ExpensesFilters = ({ filters, onFilterChange }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    const newFilters = {
      ...filters,
      search: values.search,
      expense_type: values.expense_type,
      periodicity: values.periodicity,
    };

    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.actual_date_from = values.dateRange[0].format('YYYY-MM-DD');
      newFilters.actual_date_to = values.dateRange[1].format('YYYY-MM-DD');
    } else {
      delete newFilters.actual_date_from;
      delete newFilters.actual_date_to;
    }

    onFilterChange(newFilters);
  };

  const handleReset = () => {
    form.resetFields();
    onFilterChange({
      search: undefined,
      expense_type: undefined,
      periodicity: undefined,
      actual_date_from: undefined,
      actual_date_to: undefined,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        search: filters.search || '',
        expense_type: filters.expense_type || '',
        periodicity: filters.periodicity || '',
        dateRange:
          filters.actual_date_from && filters.actual_date_to
            ? [dayjs(filters.actual_date_from), dayjs(filters.actual_date_to)]
            : null,
      }}
    >
      <Row gutter={[16, 16]} align="bottom">
        {/* Поиск */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Поиск" name="search">
            <Input
              placeholder="Поиск по расходам..."
              allowClear
              prefix={<SearchOutlined />}
              size="middle"
            />
          </Form.Item>
        </Col>

        {/* Тип расхода */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Тип расхода" name="expense_type">
            <Select
              placeholder="Выберите тип расхода"
              allowClear
              size="middle"
              style={{ width: '100%' }}
            >
              <Option value="Расходники">Расходники</Option>
              <Option value="Маркетинг">Маркетинг</Option>
              <Option value="Аренда">Аренда</Option>
              <Option value="Телефоны">Телефоны</Option>
              <Option value="Телефоны">Телефоны</Option>
              <Option value="Зарплата">Зарплата</Option>
              <Option value="Прочие расходы">Прочие расходы</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Периодичность */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Периодичность" name="periodicity">
            <Select
              placeholder="Выберите периодичность"
              allowClear
              size="middle"
              style={{ width: '100%' }}
            >
              <Option value="ежедневные">ежедневные</Option>
              <Option value="еженедельные">еженедельные</Option>
              <Option value="ежемесячные">ежемесячные</Option>
              <Option value="полугодовые">полугодовые</Option>
              <Option value="ежегодные">ежегодные</Option>
              <Option value="разово">разово</Option>
              <Option value="другое">другое</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Диапазон дат */}
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Диапазон дат" name="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder={['Начальная дата', 'Конечная дата']}
              allowClear
              size="middle"
            />
          </Form.Item>
        </Col>

        {/* Кнопки */}
        <Col xs={24}>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<FilterOutlined />}
                size="middle"
              >
                Применить фильтры
              </Button>
              <Button
                onClick={handleReset}
                icon={<ReloadOutlined />}
                size="middle"
              >
                Сбросить
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ExpensesFilters;
