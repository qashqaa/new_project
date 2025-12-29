import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Spin } from 'antd';

const ProductModal = ({ open, onClose, onSave, product }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && product) {
      form.setFieldsValue({
        name: product.name || '',
        size: product.size || '',
        detail: product.detail || '',
      });
    }
  }, [open, product, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Преобразуем пустые строки в null
      const cleanedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      );

      await onSave(cleanedValues);
      // onSave должен вызывать onClose и loadProducts() в родительском компоненте
    } catch (error) {
      console.error('Ошибка:', error);
      // Не закрываем модалку при ошибке
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Редактировать продукт"
      open={open}
      onCancel={onClose}
      footer={null} // Убираем стандартный footer, создаем свой
      width={500}
      destroyOnClose // Важно: сбрасывает форму при закрытии
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          disabled={loading}
        >
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
            rules={[{ required: true, message: 'Введите размер' }]}
          >
            <Input placeholder="Например: 20x30, A4" />
          </Form.Item>

          <Form.Item
            name="detail"
            label="Описание"
            rules={[{ max: 500, message: 'Максимум 500 символов' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Дополнительное описание (необязательно)"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Сохранить изменения
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ProductModal;