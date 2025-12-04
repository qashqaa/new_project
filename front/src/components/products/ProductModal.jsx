// src/components/products/ProductModal.jsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';

const ProductModal = ({
  visible,
  onCancel,
  onSave,
  product,
  title = 'Продукт',
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && product) {
      form.setFieldsValue(product);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, product, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Преобразуем пустые строки в null
      const cleanedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          value === '' ? null : value,
        ])
      );

      await onSave(cleanedValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Сохранить
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: 'Введите название продукта' }]}
        >
          <Input placeholder="Название продукта" />
        </Form.Item>

        <Form.Item
          name="size"
          label="Размер"
          rules={[{ required: true, message: 'Введите размер продукта' }]}
        >
          <Input placeholder="Размер продукта" />
        </Form.Item>

        <Form.Item name="detail" label="Детали">
          <Input.TextArea placeholder="Дополнительная информация" rows={3} />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea placeholder="Описание продукта" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductModal;
