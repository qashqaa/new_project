import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, Input, Select, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { productRelsAPI } from '../../api/client';

const MaterialsModal = ({
  visible,
  onCancel,
  product,
  materials,
  onProductUpdate,
}) => {
  // ← добавил onProductUpdate
  const [productMaterials, setProductMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && product) {
      setProductMaterials(product.material_detail || []);
    }
  }, [visible, product]);

  const handleAddMaterial = async (values) => {
    try {
      setLoading(true);
      await productRelsAPI.createProductMaterial(product.id, values);
      message.success('Материал добавлен');
      form.resetFields();

      // Перезагружаем данные
      if (onProductUpdate) {
        onProductUpdate();
      } else {
        // Локальное обновление если onProductUpdate не передан
        const newMaterial = materials.find((m) => m.id === values.material_id);
        if (newMaterial) {
          const materialToAdd = {
            id: Date.now(), // временный ID
            material_id: values.material_id,
            material_name: newMaterial.name,
            material_type: newMaterial.material_type,
            quantity_in_one_mat_unit: values.quantity_in_one_mat_unit,
          };
          setProductMaterials((prev) => [...prev, materialToAdd]);
        }
      }
    } catch (error) {
      message.error('Ошибка добавления материала');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await productRelsAPI.deleteProductMaterial(materialId);
      message.success('Материал удален');

      // Перезагружаем данные
      if (onProductUpdate) {
        onProductUpdate();
      } else {
        // Локальное удаление если onProductUpdate не передан
        setProductMaterials((prev) => prev.filter((m) => m.id !== materialId));
      }
    } catch (error) {
      message.error('Ошибка удаления материала');
    }
  };

  const columns = [
    {
      title: 'Материал',
      dataIndex: 'material_name',
      key: 'material_name',
    },
    {
      title: 'Тип',
      dataIndex: 'material_type',
      key: 'material_type',
    },
    {
      title: 'Количество',
      dataIndex: 'quantity_in_one_mat_unit',
      key: 'quantity',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteMaterial(record.id)}
        >
          Удалить
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`Материалы продукта: ${product?.name}`}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
    >
      {/* Форма добавления материала */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddMaterial}
        className="mb-4"
      >
        <div className="flex gap-2">
          <Form.Item
            name="material_id"
            rules={[{ required: true, message: 'Выберите материал' }]}
            className="flex-1"
          >
            <Select placeholder="Выберите материал">
              {materials.map((material) => (
                <Select.Option key={material.id} value={material.id}>
                  {material.name} ({material.material_type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity_in_one_mat_unit"
            rules={[{ required: true, message: 'Введите количество' }]}
          >
            <Input type="number" placeholder="Кол-во" min={1} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              htmlType="submit"
              loading={loading}
            >
              Добавить
            </Button>
          </Form.Item>
        </div>
      </Form>

      {/* Таблица материалов */}
      <Table
        columns={columns}
        dataSource={productMaterials}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Modal>
  );
};

export default MaterialsModal;
