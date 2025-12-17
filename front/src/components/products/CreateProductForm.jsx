import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col } from 'antd';
import { productsApi } from '../../api/client';

const CreateProductForm = ({ onSuccess, showTitle = true }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await productsApi.createProduct(values);
      message.success('Продукт создан');
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Ошибка создания продукта:', error);
      message.error('Ошибка создания продукта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Создать новый продукт</h2>
          <p className="text-gray-500">Заполните форму для добавления продукта</p>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="create-product-form"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Название"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input
                placeholder=""
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="size"
              label="Размер"
              rules={[{ required: true, message: 'Введите размер' }]}
            >
              <Input
                placeholder=""
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="detail"
          label="Детали"
        >
          <Input.TextArea
            placeholder="Дополнительные детали о продукте"
            rows={2}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
        >
          <Input.TextArea
            placeholder="Подробное описание продукта"
            rows={3}
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
          >
            Создать продукт
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateProductForm;