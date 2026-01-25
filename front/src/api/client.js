// src/api/client.js
import axios from 'axios';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Materials API
export const materialsApi = {
  // Получить список материалов с пагинацией
  getMaterials: (params = {}) => apiClient.get('/crm/materials/', { params }),

  // Создать материал
  createMaterial: (data) => apiClient.post('/crm/materials/', data),

  // Получить материал по ID
  getMaterialById: (materialId) =>
    apiClient.get(`/crm/materials/${materialId}`),

  // Частичное обновление материала
  updateMaterial: (materialId, data) =>
    apiClient.patch(`/crm/materials/${materialId}`, data),

  // Удалить материал
  deleteMaterial: (materialId) =>
    apiClient.delete(`/crm/materials/${materialId}`),

  // Изменить количество материала
  changeMaterialCount: (materialId, delta) =>
    apiClient.patch(`/crm/materials/${materialId}/change_count`, { delta }),
};

// Products API
export const productsApi = {
  // Получить список продуктов с пагинацией
  getProducts: (params = {}) => apiClient.get('/crm/products/', { params }),

  // Создать продукт
  createProduct: (data) => apiClient.post('/crm/products/', data),

  // Получить продукт по ID
  getProductById: (productId) => apiClient.get(`/crm/products/${productId}`),

  // Частичное обновление продукта
  updateProduct: (productId, data) =>
    apiClient.patch(`/crm/products/${productId}`, data),

  // Удалить продукт
  deleteProduct: (productId) => apiClient.delete(`/crm/products/${productId}`),

  copyProduct: (productId) => apiClient.post(`/crm/products/${productId}/copy`),
};

// Product Relations API (Материалы и цены продуктов)
export const productRelsAPI = {
  // === МАТЕРИАЛЫ ПРОДУКТА ===

  // Создать связь продукта с материалом
  createProductMaterial: (productId, data) =>
    apiClient.post(`/crm/product_rels/material/${productId}`, data),

  // Обновить количество материала в продукте
  updateProductMaterial: (productMaterialId, quantityInOneMatUnit) =>
    apiClient.patch(`/crm/product_rels/material/${productMaterialId}`, null, {
      params: { quantity_in_one_mat_unit: quantityInOneMatUnit },
    }),

  // Удалить связь продукта с материалом
  deleteProductMaterial: (productMaterialId) =>
    apiClient.delete(`/crm/product_rels/material/${productMaterialId}`),

  // === ЦЕНЫ ПРОДУКТА ===

  // Создать цену для продукта
  createProductPrice: (productId, data) =>
    apiClient.post(`/crm/product_rels/price/${productId}`, data),

  // Обновить цену продукта
  updateProductPrice: (priceId, data) =>
    apiClient.patch(`/crm/product_rels/price/${priceId}`, data),

  // Удалить цену продукта
  deleteProductPrice: (priceId) =>
    apiClient.delete(`/crm/product_rels/price/${priceId}`),
};

// Orders API
export const ordersApi = {
  // Получить список заказов с пагинацией
  getOrders: (params = {}) => apiClient.get('/crm/orders/', { params }),

  // Создать заказ
  createOrder: (data) => apiClient.post('/crm/orders/', data),

  // Получить заказ по ID
  getOrderById: (orderId) => apiClient.get(`/crm/orders/${orderId}`),

  // Обновить заказ по ID
  updateOrder: (orderId, data) => apiClient.patch(`/crm/orders/${orderId}`, data),

  // Удалить заказ
  deleteOrder: (orderId) => apiClient.delete(`/crm/orders/${orderId}`),

  // Добавить оплату к заказу
  appendPayment: (orderId, payment) =>
    apiClient.patch(`/crm/orders/append_payment/${orderId}`, null, {
      params: { payment },
    }),

  // Завершить заказ
  completeOrder: (orderId) =>
    apiClient.patch(`/crm/orders/order_complete/${orderId}`),

  revertOrder: (orderId) =>
    apiClient.patch(`/crm/orders/order_status_revert_to_created/${orderId}`),

  // === УПРАВЛЕНИЕ ТОВАРАМИ В ЗАКАЗЕ ===

  // Добавить продукт в заказ
  addProductToOrder: (orderId, data) =>
    apiClient.post(`/crm/orders/${orderId}/order_products/`, data),

  // Изменить количество продукта в заказе
  updateProductQuantity: (orderId, orderProductId, newCount) =>
    apiClient.patch(
      `/crm/orders/${orderId}/order_products/${orderProductId}`,
      null,
      { params: { new_count: newCount } }
    ),

  // Удалить продукт из заказа
  deleteProductFromOrder: (orderId, orderProductId) =>
    apiClient.delete(`/crm/orders/${orderId}/order_products/${orderProductId}`),

  // === УПРАВЛЕНИЕ ФАКТИЧЕСКИМ ИСПОЛЬЗОВАНИЕМ МАТЕРИАЛОВ ===

  // Изменить фактическое использование материала
  changeActualUsage: (orderId, orderProductId, orderProductMaterialId, actualUsage) =>
    apiClient.patch(
      `/crm/${orderId}/${orderProductId}/${orderProductMaterialId}`,
      null,
      { params: { actual_usage: actualUsage } }
    ),

  // === ДОПОЛНИТЕЛЬНЫЕ РАСХОДЫ ===

  // Добавить дополнительный расход
  addCost: (orderId, data) =>
    apiClient.post(`/crm/${orderId}/costs/`, data),

  // Удалить дополнительный расход
  deleteCost: (orderId, orderCostId) =>
    apiClient.delete(`/crm/${orderId}/costs/${orderCostId}`),
};

// Expenses API
export const expensesApi = {
  // Получить список расходов с пагинацией
  getExpenses: (params = {}) => apiClient.get('/crm/expenses/', { params }),
  // Удалить расход
  deleteExpenses: (expenseId) => apiClient.delete(`/crm/expenses/${expenseId}`),
  // Создать расход
  createExpense: (data) => apiClient.post('/crm/expenses/', data),
  // Изменить расход
  updateExpense: (expenseId, data) => apiClient.patch(`/crm/expenses/${expenseId}`, data),
};

// Backup API
export const backupApi = {
  sendMsg: () => apiClient.get('/backup/'),
};

// stats API
export const statsApi ={
  monthStats: (params = {}) => apiClient.get('/crm/statistics/month', { params }),
  yearGraph: () => apiClient.get('/crm/statistics/graphs'),
}

// Dev API (для тестирования)
export const devApi = {
  start: () => apiClient.get('/'),
};

// Схемы данных (обновлены на основе OpenAPI)
export const schemas = {
  MaterialCreate: {
    name: '', // string, required, maxLength: 100, minLength: 1
    material_type: '', // string, required, maxLength: 50, minLength: 1
    detail: '', // string | null, maxLength: 500
    description: '', // string | null, maxLength: 1000
    count_in_one_pack: 0, // integer, required, minimum: 0
    pack_price: 0, // number, required, minimum: 0
    count_left: 0, // integer, required, minimum: 0
  },

  MaterialAppend: {
    delta: 0, // integer, required, minimum: -1000, maximum: 1000
  },

  ProductCreate: {
    name: '', // string, required, maxLength: 100, minLength: 1
    size: '', // string, required, maxLength: 100, minLength: 1
    detail: '', // string | null, maxLength: 100, minLength: 1
    description: '', // string | null, maxLength: 1000, minLength: 1
  },

  OrderCreate: {
    user_id: '', // string | null
    client_id: '', // string | null
    customer: '', // string, required, maxLength: 45, minLength: 3
    descriptions: '', // string | null, maxLength: 500, minLength: 3
  },

  OrderUpdate: {
    customer: '', // string | null
    description: '', // string | null
  },

  OrderItemCreate: {
    product_id: '', // string, required
    quantity: 0, // integer, required, exclusiveMinimum: 0
  },

  ProductMaterialCreate: {
    material_id: '', // string, required
    quantity_in_one_mat_unit: 0, // integer, required, exclusiveMinimum: 0
  },

  ProductPriceCreate: {
    start: 0, // integer, required
    end: 0, // integer, required
    price: 0, // integer, required, minimum: 0
    description: '', // string | null, minLength: 3
  },

  CreateOrderAdditionalCost: {
    cost: 0, // integer | number, required
    description: '', // string, required
  },

  CreateExpense: {
    expense_type: '',
    periodicity: '',
    description: '',
    amount: 0,
    actual_date: '',
  },

  UpdateExpense: {
    expense_type: '',
    periodicity: '',
    description: '',
    amount: 0,
    actual_date: '',
  },
};

// Интерцепторы для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default {
  materials: materialsApi,
  products: productsApi,
  productRels: productRelsAPI,
  orders: ordersApi,
  expenses: expensesApi,
  backup: backupApi,
  dev: devApi,
  schemas,
  statsApi
};