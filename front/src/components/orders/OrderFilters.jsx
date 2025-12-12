import React from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Space
} from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderFilters = ({ filters, onFilterChange, statusOptions }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    const newFilters = {
      customer: values.customer,
      status: values.status,
      search: values.search,
    };

    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.created_date_from = values.dateRange[0].format('YYYY-MM-DD');
      newFilters.created_date_to = values.dateRange[1].format('YYYY-MM-DD');
    }

    onFilterChange(newFilters); // Убрать console.log
  };

  const handleReset = () => {
    form.resetFields();
    // Нужно передать undefined, а не пустой объект
    onFilterChange({
      customer: undefined,
      status: undefined, // Важно: undefined, а не null/пустая строка
      search: undefined,
      created_date_from: undefined,
      created_date_to: undefined,
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
        dateRange: filters.created_date_from && filters.created_date_to
          ? [dayjs(filters.created_date_from), dayjs(filters.created_date_to)]
          : null,
      }}
    >
      <Row gutter={16} align="bottom">
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Поиск" name="search">
            <Input
              placeholder="Поиск по заказам..."
              allowClear
              prefix={<SearchOutlined />}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Клиент" name="customer">
            <Input placeholder="Имя клиента" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Статус" name="status">
            <Select placeholder="Все статусы" allowClear>
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
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
              <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
                Применить фильтры
              </Button>
              <Button onClick={handleReset}>
                Сбросить
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default OrderFilters;