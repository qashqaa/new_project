// src/components/orders/OrderModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Table,
  InputNumber,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const OrderModal = ({
  visible,
  onCancel,
  onSave,
  products,
  title = 'Заказ',
}) => {
  const [form] = Form.useForm();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedProducts([]);
      setSelectedProductId('');
      setSelectedQuantity(1);
    }
  }, [visible, form]);

  const handleAddProduct = () => {
    if (!selectedProductId || selectedQuantity < 1) {
      message.error('Выберите продукт и количество');
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingProduct = selectedProducts.find(
      (p) => p.product_id === selectedProductId
    );

    if (existingProduct) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.product_id === selectedProductId
            ? { ...p, quantity: p.quantity + selectedQuantity }
            : p
        )
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          product_id: selectedProductId,
          product_name: product.name,
          quantity: selectedQuantity,
        },
      ]);
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.product_id !== productId)
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedProducts.length === 0) {
        message.error('Добавьте хотя бы один продукт');
        return;
      }

      const orderData = {
        ...values,
        products_detail: selectedProducts.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
        })),
      };

      await onSave(orderData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const productColumns = [
    {
      title: 'Продукт',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => `${quantity} шт.`,
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(record.product_id)}
        >
          Удалить
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Создать заказ
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="customer"
          label="Клиент"
          rules={[{ required: true, message: 'Введите имя клиента' }]}
        >
          <Input placeholder="Имя клиента" />
        </Form.Item>

        <Form.Item name="client_id" label="ID клиента (опционально)">
          <Input placeholder="ID клиента" />
        </Form.Item>

        <Form.Item name="user_id" label="ID пользователя (опционально)">
          <Input placeholder="ID пользователя" />
        </Form.Item>

        {/* Добавление продуктов */}
        <div className="mb-4 p-3 border rounded">
          <h4 className="font-medium mb-3">Добавить продукты:</h4>
          <div className="flex gap-2 mb-3">
            <Select
              placeholder="Выберите продукт"
              value={selectedProductId}
              onChange={setSelectedProductId}
              className="flex-1"
            >
              {products.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name} ({product.size})
                </Select.Option>
              ))}
            </Select>

            <InputNumber
              placeholder="Кол-во"
              value={selectedQuantity}
              onChange={setSelectedQuantity}
              min={1}
              className="w-24"
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProduct}
            >
              Добавить
            </Button>
          </div>

          {/* Таблица выбранных продуктов */}
          {selectedProducts.length > 0 && (
            <Table
              columns={productColumns}
              dataSource={selectedProducts}
              rowKey="product_id"
              pagination={false}
              size="small"
            />
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default OrderModal;
