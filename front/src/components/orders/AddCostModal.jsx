import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space
} from 'antd';
import { ordersApi, schemas } from '../../api/client';

const AddCostModal = ({ open, onClose, orderId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await ordersApi.addCost(orderId, {
        cost: values.cost,
        description: values.description,
      });
      message.success('Расход добавлен');
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error('Ошибка при добавлении расхода');
    } finally {
      setLoading(false);
    }
  };

  // Форматирование числа для отображения
  const formatter = (value) => {
    if (!value) return '';
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Парсинг числа из форматированной строки
  const parser = (value) => {
    if (!value) return '';
    return value.replace(/\s/g, '');
  };

  return (
    <Modal
      title="Добавить дополнительный расход"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={schemas.CreateOrderAdditionalCost}
      >
        <Form.Item
          name="description"
          label="Описание расхода"
          rules={[{ required: true, message: 'Введите описание' }]}
        >
          <Input placeholder="Например: Доставка, упаковка и т.д." />
        </Form.Item>

        <Form.Item
          name="cost"
          label="Сумма"
          rules={[{ required: true, message: 'Введите сумму' }]}
        >
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber
              placeholder="Сумма в UZS"
              min={0}
              step={1000}
              style={{ width: '100%' }}
              formatter={formatter}
              parser={parser}
            />
            <span
              style={{
                padding: '0 11px',
                border: '1px solid #d9d9d9',
                borderLeft: 'none',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '60px'
              }}
            >
              UZS
            </span>
          </Space.Compact>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCostModal;