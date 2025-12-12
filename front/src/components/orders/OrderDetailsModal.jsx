import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Tabs,
  Table,
  Tag,
  Space,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Descriptions,
  Row,
  Col,
  Statistic,
  Tooltip,
  Badge,
  Alert,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ordersApi } from '../../api/client';
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../utils/utilsOrder.js';
import AddProductModal from './AddProductModal';
import AddCostModal from './AddCostModal';

const OrderDetailsModal = ({ order, open, onClose, onUpdate }) => {
  const [localOrder, setLocalOrder] = useState(order);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [addProductModal, setAddProductModal] = useState(false);
  const [addCostModal, setAddCostModal] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  // Обновляем локальное состояние при изменении пропса order
  useEffect(() => {
    if (order) {
      setLocalOrder(order);
    }
  }, [order]);

  // Функция для обновления данных заказа
  const fetchOrderDetails = async () => {
    try {
      const response = await ordersApi.getOrderById(localOrder.id);
      setLocalOrder(response.data);
    } catch (error) {
      message.error('Ошибка при обновлении данных заказа');
      console.error(error);
    }
  };

  const handleEdit = () => {
    form.setFieldsValue({
      customer: localOrder.customer,
      descriptions: localOrder.descriptions,
    });
    setEditing(true);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      await ordersApi.updateOrder(localOrder.id, values);
      message.success('Заказ обновлен');
      setEditing(false);
      await fetchOrderDetails();
      onUpdate();
    } catch (error) {
      message.error('Ошибка при обновлении заказа');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (orderProductId) => {
    try {
      await ordersApi.deleteProductFromOrder(localOrder.id, orderProductId);
      message.success('Продукт удален из заказа');
      await fetchOrderDetails();
      onUpdate();
    } catch (error) {
      message.error('Ошибка при удалении продукта');
    }
  };

  const handleDeleteCost = async (orderCostId) => {
    try {
      await ordersApi.deleteCost(localOrder.id, orderCostId);
      message.success('Расход удален');
      await fetchOrderDetails();
      onUpdate();
    } catch (error) {
      message.error('Ошибка при удалении расхода');
    }
  };

  const handleUpdateQuantity = async (orderProductId, newCount) => {
    try {
      await ordersApi.updateProductQuantity(localOrder.id, orderProductId, newCount);
      message.success('Количество обновлено');
      await fetchOrderDetails();
      onUpdate();
    } catch (error) {
      message.error('Ошибка при обновлении количества');
    }
  };

  // Новая функция: изменение фактического расхода материала
  const handleChangeActualUsage = async (orderProductId, orderProductMaterialId, actualUsage) => {
    try {
      await ordersApi.changeActualUsage(
        localOrder.id,
        orderProductId,
        orderProductMaterialId,
        actualUsage
      );
      message.success('Фактический расход обновлен');
      await fetchOrderDetails();
      onUpdate();
    } catch (error) {
      message.error('Ошибка при обновлении расхода');
    }
  };

  // Функция для расчета статистики по материалам
  const calculateMaterialStats = () => {
    if (!localOrder.products_detail) {
      return {
        totalBudgeted: 0,
        totalActual: 0,
        overusedMaterials: 0,
        difference: 0,
        percentage: 0,
      };
    }

    let totalBudgeted = 0;
    let totalActual = 0;
    let overusedMaterials = 0;

    localOrder.products_detail.forEach(product => {
      if (product.materials) {
        product.materials.forEach(material => {
          totalBudgeted += material.budged_usage;
          totalActual += material.actual_usage;
          if (material.actual_usage > material.budged_usage) {
            overusedMaterials++;
          }
        });
      }
    });

    return {
      totalBudgeted,
      totalActual,
      overusedMaterials,
      difference: totalActual - totalBudgeted,
      percentage: totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0,
    };
  };

  const materialStats = calculateMaterialStats();

  const productColumns = [
    {
      title: 'Продукт',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.product_size}</div>
          {record.product_detail && (
            <div className="text-xs text-blue-600 mt-1">{record.product_detail}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleUpdateQuantity(record.id, value)}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: 'Цена',
      dataIndex: 'product_price',
      key: 'product_price',
      width: 120,
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Сумма',
      key: 'total',
      width: 150,
      render: (_, record) => formatCurrency(record.product_price * record.quantity),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteProduct(record.id)}
        />
      ),
    },
  ];

  const materialColumns = [
    {
      title: 'Материал',
      dataIndex: 'material_name',
      key: 'material_name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">ID: {record.material_id?.slice(0, 8) || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'material_type',
      key: 'material_type',
    },
    {
      title: (
        <Tooltip title="Количество материала на один продукт">
          <span>
            Норма на ед. <InfoCircleOutlined className="ml-1" />
          </span>
        </Tooltip>
      ),
      dataIndex: 'qty_prod_in_mat',
      key: 'qty_prod_in_mat',
      render: (qty) => (
        <Tag color="blue">{qty} ед.</Tag>
      ),
    },
    {
      title: 'План',
      dataIndex: 'budged_usage',
      key: 'budged_usage',
      render: (budged, record) => {
        const product = localOrder.products_detail?.find(p =>
          p.id === record.order_product_id
        );
        const totalBudgeted = product ? budged * product.quantity : budged;

        return (
          <Tooltip title={`${budged} × ${product?.quantity || 1} = ${totalBudgeted}`}>
            <div className="font-medium">
              {totalBudgeted}
              <div className="text-xs text-gray-500">
                ({budged} × {product?.quantity || 1})
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Факт',
      dataIndex: 'actual_usage',
      key: 'actual_usage',
      render: (actual, record) => {
        const isOver = actual > record.budged_usage;
        const isUnder = actual < record.budged_usage;

        return (
          <div className="flex items-center space-x-2">
            <InputNumber
              min={0}
              value={actual}
              onChange={(value) => handleChangeActualUsage(
                record.order_product_id,
                record.id,
                value
              )}
              style={{ width: 100 }}
              size="small"
              status={isOver ? 'error' : isUnder ? 'warning' : ''}
            />
            {(isOver || isUnder) && (
              <Tooltip
                title={isOver
                  ? `Превышение на ${actual - record.budged_usage} единиц`
                  : `Недоиспользование на ${record.budged_usage - actual} единиц`
                }
              >
                <WarningOutlined
                  className={isOver ? 'text-red-500' : 'text-yellow-500'}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Разница',
      key: 'difference',
      render: (_, record) => {
        const diff = record.actual_usage - record.budged_usage;
        const isOver = diff > 0;
        const isUnder = diff < 0;

        return (
          <Badge
            count={diff > 0 ? `+${diff}` : diff}
            className="ml-2"
            style={{
              backgroundColor: isOver ? '#ff4d4f' : isUnder ? '#52c41a' : '#d9d9d9',
            }}
          />
        );
      },
    },
    {
      title: 'Цена за ед.',
      dataIndex: 'material_price',
      key: 'material_price',
      render: (price) => (
        <div className="text-right">
          {formatCurrency(price)}
        </div>
      ),
    },
    {
      title: 'Стоимость',
      key: 'total_cost',
      render: (_, record) => {
        const cost = record.material_price * record.actual_usage;
        const budgetedCost = record.material_price * record.budged_usage;
        const diffCost = cost - budgetedCost;

        return (
          <Tooltip title={`Бюджет: ${formatCurrency(budgetedCost)}`}>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(cost)}</div>
              {diffCost !== 0 && (
                <div className={`
                  text-xs 
                  ${diffCost > 0 ? 'text-red-600' : 'text-green-600'}
                `}>
                  {diffCost > 0 ? '+' : ''}{formatCurrency(diffCost)}
                </div>
              )}
            </div>
          </Tooltip>
        );
      },
    },
  ];

  const costColumns = [
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Сумма',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => formatCurrency(cost),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteCost(record.id)}
        />
      ),
    },
  ];

  // Создаем массив items для Tabs (новый синтаксис Ant Design 5)
  const tabItems = useMemo(() => [
    {
      key: 'products',
      label: 'Продукты',
      children: (
        <>
          <div className="mb-4">
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setAddProductModal(true)}
            >
              Добавить продукт
            </Button>
          </div>
          <Table
            columns={productColumns}
            dataSource={localOrder.products_detail || []}
            rowKey="id"
            pagination={false}
          />
        </>
      ),
    },
    {
      key: 'materials',
      label: 'Материалы',
      children: (
        <>
          {activeTab === 'materials' && (
            <Alert
              message={
                <div className="flex items-center justify-between">
                  <span>Статистика материалов:</span>
                  <Space size="large">
                    <span>План: {materialStats.totalBudgeted} ед.</span>
                    <span>Факт: {materialStats.totalActual} ед.</span>
                    <span className={`
                      font-medium 
                      ${materialStats.difference > 0 ? 'text-red-600' : 'text-green-600'}
                    `}>
                      Разница: {materialStats.difference > 0 ? '+' : ''}{materialStats.difference}
                    </span>
                    {materialStats.overusedMaterials > 0 && (
                      <Tag color="red">
                        Перерасход: {materialStats.overusedMaterials} материалов
                      </Tag>
                    )}
                  </Space>
                </div>
              }
              type={
                materialStats.difference > 0
                  ? 'error'
                  : materialStats.difference < 0
                    ? 'success'
                    : 'info'
              }
              showIcon
              className="mb-4"
            />
          )}
          {localOrder.products_detail?.length > 0 ? (
            localOrder.products_detail.map(product => (
              <div key={product.id} className="mb-8">
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {product.product_name} ({product.product_size})
                    </h4>
                    <div className="text-sm text-gray-600">
                      {product.product_detail && (
                        <div className="mb-1 text-blue-600">{product.product_detail}</div>
                      )}
                      <div>
                        Количество: {product.quantity} шт. |
                        Цена: {formatCurrency(product.product_price)} |
                        Итого: {formatCurrency(product.product_price * product.quantity)}
                      </div>
                    </div>
                  </div>
                  <Tag color="blue">
                    {product.materials?.length || 0} материалов
                  </Tag>
                </div>

                {product.materials && product.materials.length > 0 ? (
                  <Table
                    columns={materialColumns}
                    dataSource={product.materials}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    scroll={{ x: 1000 }}
                    summary={() => {
                      const totalBudgeted = product.materials.reduce(
                        (sum, m) => sum + (m.budged_usage * product.quantity), 0
                      );
                      const totalActual = product.materials.reduce(
                        (sum, m) => sum + m.actual_usage, 0
                      );
                      const totalCost = product.materials.reduce(
                        (sum, m) => sum + (m.material_price * m.actual_usage), 0
                      );

                      return (
                        <Table.Summary.Row className="bg-gray-50 font-semibold">
                          <Table.Summary.Cell index={0} colSpan={4}>
                            Итого по продукту:
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            {totalBudgeted}
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2}>
                            {totalActual}
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3}>
                            <span className={`
                              ${totalActual > totalBudgeted ? 'text-red-600' : 'text-green-600'}
                            `}>
                              {totalActual > totalBudgeted ? '+' : ''}{totalActual - totalBudgeted}
                            </span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} colSpan={2}>
                            {formatCurrency(totalCost)}
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      );
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <InfoCircleOutlined className="text-2xl mb-2" />
                    <div>Нет материалов для этого продукта</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <InfoCircleOutlined className="text-2xl mb-2" />
              <div>В заказе нет продуктов</div>
            </div>
          )}
        </>
      ),
    },
    {
      key: 'costs',
      label: 'Дополнительные расходы',
      children: (
        <>
          <div className="mb-4">
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setAddCostModal(true)}
            >
              Добавить расход
            </Button>
          </div>
          <Table
            columns={costColumns}
            dataSource={localOrder.costs || []}
            rowKey="id"
            pagination={false}
          />
        </>
      ),
    },
  ], [localOrder, activeTab, materialStats]);

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between">
            <span>Детали заказа</span>
          </div>
        }
        open={open}
        onCancel={onClose}
        width={1200}
        footer={null}
        className="order-details-modal"
      >
        <div className="mb-6">
          {editing ? (
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="customer"
                    label="Клиент"
                    rules={[{ required: true, message: 'Введите имя клиента' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="descriptions" label="Описание">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setEditing(false)}>
                  Отмена
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Сохранить
                </Button>
              </div>
            </Form>
          ) : (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID">{localOrder.id}</Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Tag color={getStatusColor(localOrder.status)}>
                  {getStatusLabel(localOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Клиент">{localOrder.customer}</Descriptions.Item>
              <Descriptions.Item label="Дата создания">
                {formatDate(localOrder.created_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Описание">
                {localOrder.descriptions || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="ID клиента">
                {localOrder.client_id || '—'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>

        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Statistic
              title="Общая стоимость"
              value={localOrder.total_price}
              formatter={value => formatCurrency(value)}
              className="text-center"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Стоимость материалов"
              value={localOrder.materials_price}
              formatter={value => formatCurrency(value)}
              className="text-center"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Оплачено"
              value={localOrder.paid}
              formatter={value => formatCurrency(value)}
              className="text-center"
            />
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabBarExtraContent={
            activeTab === 'materials' && (
              <div style={{ display: 'none' }}></div> // Статистика теперь внутри контента таба
            )
          }
        />
      </Modal>

      <AddProductModal
        open={addProductModal}
        onClose={() => setAddProductModal(false)}
        orderId={localOrder.id}
        onSuccess={async () => {
          setAddProductModal(false);
          await fetchOrderDetails();
          onUpdate();
        }}
      />

      <AddCostModal
        open={addCostModal}
        onClose={() => setAddCostModal(false)}
        orderId={localOrder.id}
        onSuccess={async () => {
          setAddCostModal(false);
          await fetchOrderDetails();
          onUpdate();
        }}
      />
    </>
  );
};

export default OrderDetailsModal;