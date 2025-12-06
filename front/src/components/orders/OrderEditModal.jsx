// src/components/orders/OrderEditModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Table,
  Button,
  InputNumber,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const OrderEditModal = ({ visible, onCancel, order, products, onSave }) => {
  const [form] = Form.useForm();
  const [orderProducts, setOrderProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    if (visible && order) {
      form.setFieldsValue({
        customer: order.customer,
        client_id: order.client_id,
        user_id: order.user_id,
      });
      setOrderProducts(order.products_detail || []);
    } else if (visible) {
      form.resetFields();
      setOrderProducts([]);
    }
  }, [visible, order, form]);

  const handleAddProduct = () => {
    if (!selectedProductId || selectedQuantity < 1) {
      message.error('Выберите продукт и количество');
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingProduct = orderProducts.find(
      (p) => p.product_id === selectedProductId
    );

    if (existingProduct) {
      setOrderProducts((prev) =>
        prev.map((p) =>
          p.product_id === selectedProductId
            ? { ...p, quantity: p.quantity + selectedQuantity }
            : p
        )
      );
    } else {
      setOrderProducts((prev) => [
        ...prev,
        {
          product_id: selectedProductId,
          product_name: product.name,
          quantity: selectedQuantity,
          product_price: product.price_tier?.[0]?.price || 0,
        },
      ]);
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveProduct = (productId) => {
    setOrderProducts((prev) => prev.filter((p) => p.product_id !== productId));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (orderProducts.length === 0) {
        message.error('Добавьте хотя бы один продукт');
        return;
      }

      const orderData = {
        ...values,
        products_detail: orderProducts.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
        })),
      };

      await onSave(order.id, orderData);
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
      render: (quantity, record) => (
        <InputNumber
          size="small"
          value={quantity}
          min={1}
          onChange={(value) => handleQuantityChange(record.product_id, value)}
          className="w-20"
        />
      ),
    },
    {
      title: 'Цена',
      dataIndex: 'product_price',
      key: 'product_price',
      render: (price) => (price ? `${price?.toLocaleString()} UZS` : '-'),
    },
    {
      title: 'Сумма',
      key: 'total',
      render: (_, record) =>
        `${(record.quantity * (record.product_price || 0)).toLocaleString()} UZS`,
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

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setOrderProducts((prev) =>
      prev.map((p) =>
        p.product_id === productId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  const calculateTotal = () => {
    return orderProducts.reduce((total, item) => {
      return total + item.quantity * (item.product_price || 0);
    }, 0);
  };

  return (
    <Modal
      title={`Редактирование заказа #${order?.id?.slice(-8)}`}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Сохранить изменения
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

        {/* Добавление продуктов */}
        <div className="mb-4 p-3 border rounded">
          <h4 className="font-medium mb-3">Продукты в заказе:</h4>
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

          {/* Таблица продуктов */}
          {orderProducts.length > 0 && (
            <>
              <Table
                columns={productColumns}
                dataSource={orderProducts}
                rowKey="product_id"
                pagination={false}
                size="small"
                className="mb-2"
              />
              <div className="text-right font-bold text-lg">
                Итого: {calculateTotal().toLocaleString()} UZS
              </div>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default OrderEditModal;
