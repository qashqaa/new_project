// src/components/products/PricesModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, Input, InputNumber, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { productRelsAPI } from '../../api/client';

const PricesModal = ({ visible, onCancel, product, onProductUpdate }) => {
  // ← добавил onProductUpdate
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && product) {
      const pricesWithId = (product.price_tier || []).map((price) => ({
        ...price,
        uniqueId:
          price.id || `price-${price.start}-${price.end}-${price.price}`,
      }));
      setPrices(pricesWithId);
    }
  }, [visible, product]);

  const handleAddPrice = async (values) => {
    try {
      setLoading(true);
      await productRelsAPI.createProductPrice(product.id, values);
      message.success('Цена добавлена');
      form.resetFields();

      // Перезагружаем данные
      if (onProductUpdate) {
        onProductUpdate();
      } else {
        // Если onProductUpdate не передан, обновляем локально
        const newPrice = {
          ...values,
          id: Date.now(), // временный ID
          uniqueId: `price-${values.start}-${values.end}-${values.price}`,
        };
        setPrices((prev) => [...prev, newPrice]);
      }
    } catch (error) {
      message.error('Ошибка добавления цены');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrice = async (priceId) => {
    try {
      await productRelsAPI.deleteProductPrice(priceId);
      message.success('Цена удалена');

      if (onProductUpdate) {
        // Если есть onProductUpdate, перезагружаем данные
        onProductUpdate();
      } else {
        // Иначе удаляем локально
        setPrices((prev) => prev.filter((p) => p.id !== priceId));
      }
    } catch (error) {
      console.error('Delete price error:', error);
      message.error('Ошибка удаления цены');
    }
  };

  const columns = [
    {
      title: 'От (шт)',
      dataIndex: 'start',
      key: 'start',
    },
    {
      title: 'До (шт)',
      dataIndex: 'end',
      key: 'end',
    },
    {
      title: 'Цена (UZS)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString()} UZS`,
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeletePrice(record.id)}
        >
          Удалить
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`Цены продукта: ${product?.name}`}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={null}
    >
      {/* Форма добавления цены */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddPrice}
        className="mb-4"
      >
        <div className="grid grid-cols-4 gap-2">
          <Form.Item
            name="start"
            label="От"
            rules={[{ required: true, message: 'Введите начало диапазона' }]}
          >
            <InputNumber placeholder="0" min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="end"
            label="До"
            rules={[{ required: true, message: 'Введите конец диапазона' }]}
          >
            <InputNumber placeholder="100" min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Введите цену' }]}
          >
            <InputNumber placeholder="1000" min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            className="flex items-end"
          >
            <div className="flex gap-2">
              <Input placeholder="Описание" />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                htmlType="submit"
                loading={loading}
              >
                Добавить
              </Button>
            </div>
          </Form.Item>
        </div>
      </Form>

      {/* Таблица цен */}
      <Table
        columns={columns}
        dataSource={prices}
        rowKey="uniqueId"
        pagination={false}
        size="small"
      />
    </Modal>
  );
};

export default PricesModal;
