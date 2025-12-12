import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, message } from 'antd';
import { ordersApi, productsApi } from '../../api/client';

const { Option } = Select;

const AddProductModal = ({ open, onClose, orderId, onSuccess }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
      form.resetFields();
    }
  }, [open]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await productsApi.getProducts({ limit: 100 });
      setProducts(response.data.items);
    } catch (error) {
      message.error('Ошибка при загрузке продуктов');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await ordersApi.addProductToOrder(orderId, {
        product_id: values.product_id,
        quantity: values.quantity,
      });
      message.success('Продукт добавлен в заказ');
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error('Ошибка при добавлении продукта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Добавить продукт в заказ"
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
        initialValues={{ quantity: 1 }}
      >
        <Form.Item
          name="product_id"
          label="Продукт"
          rules={[{ required: true, message: 'Выберите продукт' }]}
        >
          <Select
            placeholder="Выберите продукт"
            loading={productsLoading}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) => {
              if (!option?.label) return false;
              return option.label.toLowerCase().includes(input.toLowerCase());
            }}
            optionLabelProp="displayLabel"
            style={{ width: '100%' }}
            // Заменяем deprecated свойства на новые
            popupMatchSelectWidth={false}
            styles={{
              popup: {
                root: {
                  width: '400px', // Заменяем dropdownStyle
                },
              },
            }}
          >
            {products.map(product => (
              <Option
                key={product.id}
                value={product.id}
                label={`${product.name} ${product.size} ${product.detail || ''}`.trim()}
                displayLabel={
                  <span>
                    {product.name} ({product.size})
                    {product.detail && (
                      <span className="text-gray-500 ml-2">• {product.detail}</span>
                    )}
                  </span>
                }
              >
                <div className="py-2">
                  <div className="font-medium flex items-center justify-between">
                    <span>{product.name}</span>
                    <span className="text-sm font-normal text-gray-600">
                      {product.detail && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">
                          {product.detail}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Размер: <span className="font-medium">{product.size}</span>
                  </div>
                  {product.description && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {product.description}
                    </div>
                  )}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Количество"
          rules={[{ required: true, message: 'Введите количество' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProductModal;