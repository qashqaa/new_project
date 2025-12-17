import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, Input, InputNumber, message, Spin } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { productRelsAPI, productsApi } from '../../api/client';

const PricesModal = ({ visible, onCancel, productId, onProductUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [form] = Form.useForm();

  // Загружаем продукт при открытии модалки
  useEffect(() => {
    if (visible && productId) {
      loadProduct();
      form.resetFields();
    } else {
      setProduct(null);
    }
  }, [visible, productId, form]);

  const loadProduct = async () => {
    try {
      setProductLoading(true);
      const response = await productsApi.getProductById(productId);
      setProduct(response.data);
    } catch (error) {
      message.error('Ошибка загрузки данных продукта');
    } finally {
      setProductLoading(false);
    }
  };

  // Получаем цены продукта
  const getPricesWithId = () => {
    if (!product?.price_tier) return [];

    return product.price_tier.map((price) => ({
      ...price,
      uniqueId: price.id || `price-${price.start}-${price.end}-${price.price}`,
    }));
  };

  const prices = getPricesWithId();

  // Добавление цены
  const handleAddPrice = async (values) => {
    try {
      setLoading(true);
      await productRelsAPI.createProductPrice(productId, values);
      message.success('Цена добавлена');
      form.resetFields();

      // Перезагружаем данные продукта
      await loadProduct();

      // Уведомляем родителя
      if (onProductUpdate) {
        onProductUpdate();
      }
    } catch (error) {
      message.error('Ошибка добавления цены');
    } finally {
      setLoading(false);
    }
  };

  // Удаление цены
  const handleDeletePrice = async (priceId) => {
    try {
      await productRelsAPI.deleteProductPrice(priceId);
      message.success('Цена удалена');

      // Перезагружаем данные продукта
      await loadProduct();

      // Уведомляем родителя
      if (onProductUpdate) {
        onProductUpdate();
      }
    } catch (error) {
      message.error('Ошибка удаления цены');
    }
  };

  const columns = [
    {
      title: 'От (шт)',
      dataIndex: 'start',
      key: 'start',
      width: '15%',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      title: 'До (шт)',
      dataIndex: 'end',
      key: 'end',
      width: '15%',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      title: 'Цена (UZS)',
      dataIndex: 'price',
      key: 'price',
      width: '25%',
      render: (price) => (
        <span className="text-green-600 font-bold">
          {new Intl.NumberFormat('ru-RU').format(price)} UZS
        </span>
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
    },
    {
      title: 'Действия',
      key: 'actions',
      width: '15%',
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
      title={`Цены продукта`}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnHidden
    >
      {productLoading ? (
        <div className="text-center py-12">
          <Spin size="large" />
        </div>
      ) : !product ? (
        <div className="text-center py-8 text-gray-500">
          Продукт не найден
        </div>
      ) : (
        <>
          {/* Заголовок с названием продукта */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600 text-sm">
              Размер: {product.size} • ID: {product.id}
            </p>
          </div>

          {/* Форма добавления цены */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddPrice}
            className="mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <Form.Item
                name="start"
                label="От (шт)"
                rules={[{ required: true, message: 'Введите начало' }]}
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                name="end"
                label="До (шт)"
                rules={[{ required: true, message: 'Введите конец' }]}
              >
                <InputNumber
                  placeholder="100"
                  min={0}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                name="price"
                label="Цена (UZS)"
                rules={[{ required: true, message: 'Введите цену' }]}
              >
                <InputNumber
                  placeholder="1000"
                  min={0}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Описание"
              >
                <Input placeholder="Описание цены" />
              </Form.Item>

              <Form.Item label=" ">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  htmlType="submit"
                  loading={loading}
                  className="w-full"
                >
                  Добавить
                </Button>
              </Form.Item>
            </div>
          </Form>

          {/* Таблица цен */}
          <div className="border rounded">
            <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Всего цен: {prices.length}
              </span>
              <span className="text-xs text-gray-500">
                Цены отсортированы по количеству
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={prices.sort((a, b) => a.start - b.start)}
              rowKey="uniqueId"
              pagination={false}
              size="small"
              locale={{ emptyText: 'Цены не установлены' }}
              scroll={{ y: 300 }}
            />
          </div>
        </>
      )}
    </Modal>
  );
};

export default PricesModal;