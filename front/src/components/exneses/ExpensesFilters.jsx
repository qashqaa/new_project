import { DatePicker, Select, Form, Row, Col, Input, Space, Button } from 'antd';
import dayjs from 'dayjs';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import React from 'react';

const { RangePicker} = DatePicker;
const {Option} = Select;

const ExpensesFilters = ({ filters, onFilterChange}) => {
  const [form] = Form.useForm();
  
  const  handleSubmit = (values) => {
    const newFilters ={
      actual_date: values.actual_date,
      periodicity: values.periodicity,
      search: values.search,
    };

    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.actual_date_from = values.dateRange[0].format('YYYY-MM-DD');
      newFilters.actual_date_to = values.dateRange[1].format('YYYY-MM-DD');
    }

    onFilterChange(newFilters);
  };

  const handleReset = () => {
    form.resetFields();
    // Нужно передать undefined, а не пустой объект
    onFilterChange({
      expense_type: undefined,
      periodicity: undefined, // Важно: undefined, а не null/пустая строка
      search: undefined,
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
        customer: filters.customer,
        status: filters.status,
        search: filters.search,
        dateRange:
          filters.created_date_from && filters.created_date_to
            ? [dayjs(filters.created_date_from), dayjs(filters.created_date_to)]
            : null,
      }}
    >
      <Row gutter={16} align="bottom">
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Поиск" name="search">
            <Input
              placeholder="Поиск по расходам..."
              allowClear
              prefix={<SearchOutlined />}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Тип расхода" name="expense_type">
            <Input placeholder="" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Дата создания" name="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder={['С', 'По']}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24}>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<FilterOutlined />}
              >
                Применить фильтры
              </Button>
              <Button onClick={handleReset}>Сбросить</Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ExpensesFilters