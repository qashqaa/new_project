import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Button, Form, Input, Select, message, Spin } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { productRelsAPI, productsApi } from '../../api/client';

const MaterialsModal = ({
                          visible,
                          onCancel,
                          productId,
                          materials,
                          onProductUpdate,
                        }) => {
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [form] = Form.useForm();

  // Загружаем продукт при открытии модалки
  useEffect(() => {
    if (visible && productId) {
      loadProduct();
    } else {
      setProduct(null);
    }
  }, [visible, productId]);

  useEffect(() => {
    if (visible && product) {
      form.resetFields();
    }
  }, [visible, product, form]);

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

  // Получаем материалы продукта
  const productMaterials = product?.material_detail || [];

  // Вычисляем доступные материалы
  const availableMaterials = useMemo(() => {
    if (!productMaterials.length || !materials.length) return materials;

    const addedIds = new Set(productMaterials.map(m => m.material_id));
    return materials.filter(m => !addedIds.has(m.id));
  }, [materials, productMaterials]);

  // Добавление материала
  const handleAddMaterial = async (values) => {
    try {
      setLoading(true);
      await productRelsAPI.createProductMaterial(productId, {
        material_id: values.material_id,
        quantity_in_one_mat_unit: values.quantity,
      });

      message.success('Материал добавлен');
      form.resetFields();

      // Перезагружаем данные продукта
      await loadProduct();

      // Уведомляем родителя
      if (onProductUpdate) {
        onProductUpdate();
      }
    } catch (error) {
      message.error('Ошибка добавления материала');
    } finally {
      setLoading(false);
    }
  };

  // Удаление материала
  const handleDeleteMaterial = async (record) => {
    try {
      await productRelsAPI.deleteProductMaterial(record.id);
      message.success('Материал удален');

      // Перезагружаем данные продукта
      await loadProduct();

      // Уведомляем родителя
      if (onProductUpdate) {
        onProductUpdate();
      }
    } catch (error) {
      message.error('Ошибка удаления материала');
    }
  };

  // Функция поиска для Select
  const filterOption = (input, option) => {
    const material = availableMaterials.find(m => m.id === option.value);
    if (!material) return false;

    const searchText = input.toLowerCase();
    return (
      material.name.toLowerCase().includes(searchText) ||
      (material.detail && material.detail.toLowerCase().includes(searchText)) ||
      material.id.toString().includes(searchText)
    );
  };

  // Функция для отображения выбранного значения
  const getOptionLabel = (materialId) => {
    const material = availableMaterials.find(m => m.id === materialId);
    if (!material) return '';
    return material.name;
  };

  const columns = [
    {
      title: 'Материал',
      dataIndex: 'material_name',
      key: 'material_name',
      width: '30%',
    },
    {
      title: 'Детали',
      dataIndex: 'material_detail',
      key: 'material_detail',
      width: '40%',
    },
    {
      title: 'Количество',
      dataIndex: 'quantity_in_one_mat_unit',
      key: 'quantity',
      width: '15%',
      render: (value) => <span className="font-medium">{value} шт.</span>,
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
          onClick={() => handleDeleteMaterial(record)}
          loading={loading}
        >
          Удалить
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`Материалы продукта`}
      open={visible}
      onCancel={onCancel}
      width={700}
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

          {/* Форма добавления */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddMaterial}
            className="mb-6"
          >
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Form.Item
                  name="material_id"
                  label="Материал"
                  rules={[{ required: true, message: 'Выберите материал' }]}
                >
                  <Select
                    placeholder="Выберите материал..."
                    showSearch
                    filterOption={filterOption}
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    notFoundContent={
                      availableMaterials.length === 0
                        ? "Все материалы уже добавлены"
                        : "Материал не найден"
                    }
                    // Ключевые настройки для правильного отображения
                    labelInValue={false}
                    optionLabelProp="label"
                  >
                    {availableMaterials.map(material => (
                      <Select.Option
                        key={material.id}
                        value={material.id}
                        label={material.name}
                      >
                        <div className="py-1">
                          <div className="font-medium">{material.name}</div>
                          {material.detail && (
                            <div className="text-sm text-gray-600">{material.detail}</div>
                          )}
                          <div className="text-xs text-gray-400">
                            Остаток: {material.count_left} шт.
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="w-32">
                <Form.Item
                  name="quantity"
                  label="Количество"
                  rules={[{ required: true, message: 'Введите количество' }]}
                >
                  <Input
                    type="number"
                    min={1}
                    placeholder="Кол-во"
                    className="w-full"
                  />
                </Form.Item>
              </div>

              <Form.Item label=" ">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  htmlType="submit"
                  loading={loading}
                  disabled={availableMaterials.length === 0}
                >
                  Добавить
                </Button>
              </Form.Item>
            </div>
          </Form>

          {/* Таблица материалов */}
          <div className="border rounded">
            <div className="p-3 bg-gray-50 border-b">
              <span className="text-sm text-gray-600">
                Всего материалов: {productMaterials.length}
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={productMaterials}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'Материалы не добавлены' }}
              scroll={{ y: 300 }}
            />
          </div>
        </>
      )}
    </Modal>
  );
};

export default MaterialsModal;