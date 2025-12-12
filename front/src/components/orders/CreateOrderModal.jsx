import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { ordersApi, schemas } from '../../api/client';

const CreateOrderModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const orderData = {
        customer: values.customer,
        descriptions: values.descriptions || null,
        client_id: values.client_id || null,
        user_id: values.user_id || null,
      };

      await ordersApi.createOrder(orderData);
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error('Ошибка при создании заказа');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Создать новый заказ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={schemas.OrderCreate}
      >
        <Form.Item
          name="customer"
          label="Имя клиента"
          rules={[
            { required: true, message: 'Введите имя клиента' },
            { min: 3, message: 'Минимум 3 символа' },
            { max: 45, message: 'Максимум 45 символов' },
          ]}
        >
          <Input placeholder="Введите имя клиента" />
        </Form.Item>

        <Form.Item
          name="descriptions"
          label="Описание"
        >
          <Input.TextArea
            placeholder="Описание заказа"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="client_id"
          label="ID клиента (опционально)"
        >
          <Input placeholder="ID клиента в системе" />
        </Form.Item>

        <Form.Item
          name="user_id"
          label="ID пользователя (опционально)"
        >
          <Input placeholder="ID ответственного пользователя" />
        </Form.Item>

        <div className="flex justify-end space-x-2 pt-4">
          <Button onClick={onClose}>
            Отмена
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Создать заказ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateOrderModal;