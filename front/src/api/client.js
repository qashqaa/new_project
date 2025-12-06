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
  // Получить список материалов
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
  changeMaterialCount: (materialId, data) =>
    apiClient.patch(`/crm/materials/${materialId}/change_count`, data),
};

// Products API
export const productsApi = {
  // Получить список продуктов
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
};

// Product Relations API (Материалы и цены продуктов)
export const productRelsAPI = {
  // === МАТЕРИАЛЫ ПРОДУКТА ===

  // Создать связь продукта с материалом
  createProductMaterial: (productId, data) =>
    apiClient.post(`/crm/product_rels/material/${productId}`, data),

  // Обновить количество материала в продукте
  updateProductMaterial: (productMaterialId, quantity) =>
    apiClient.patch(`/crm/product_rels/material/${productMaterialId}`, null, {
      params: { quantity_in_one_mat_unit: quantity },
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
  // Получить список заказов
  getOrders: (params = {}) => apiClient.get('/crm/orders/', { params }),

  // Создать заказ
  createOrder: (data) => apiClient.post('/crm/orders/', data),

  // Получить заказ по ID
  getOrderById: (orderId) => apiClient.get(`/crm/orders/${orderId}`),

  // Обновить продукты в заказе
  updateOrderProducts: (orderId, products) =>
    apiClient.patch(`/crm/orders/${orderId}/update_products`, products),

  // Подтвердить заказ
  confirmOrder: (orderId) =>
    apiClient.patch(`/crm/orders/${orderId}/confirm_order`),

  // Добавить оплату
  appendPayment: (orderId, payment) =>
    apiClient.patch(`/crm/orders/${orderId}/append_payment`, null, {
      params: { payment },
    }),

  // Добавить материалы к заказу
  appendMaterials: (orderId, materials) =>
    apiClient.patch(`/crm/orders/${orderId}/append_materials`, materials),

  // Отметить заказ как готовый
  readyOrder: (orderId) =>
    apiClient.patch(`/crm/orders/${orderId}/order_ready`),

  // Завершить заказ
  completeOrder: (orderId) =>
    apiClient.patch(`/crm/orders/${orderId}/order_complete`),

  // Отменить заказ
  cancelOrder: (orderId) =>
    apiClient.patch(`/crm/orders/${orderId}/order_cancel`),
};

// Dev API (для тестирования)
export const devApi = {
  start: () => apiClient.get('/'),
};

// Схемы данных (для справки)
export const schemas = {
  MaterialCreate: {
    name: '', // string, required, название материала
    material_type: '', // string, required, тип материала
    detail: '', // string | null, детали
    description: '', // string | null, описание
    count_in_one_pack: 0, // integer, required, количество в упаковке
    pack_price: 0, // number, required, цена упаковки
    count_left: 0, // integer, required, остаток на складе
  },

  ProductCreate: {
    name: '', // string, required, название продукта
    size: '', // string, required, размеры
    detail: '', // string | null, дополнительная информация
    description: '', // string | null, описание продукта
  },

  OrderCreate: {
    user_id: '', // string | null
    client_id: '', // string | null
    customer: '', // string, required
    products_detail: [
      // array of OrderItemCreate, required
      {
        product_id: '', // string, required
        quantity: 0, // integer, required
      },
    ],
  },

  ProductMaterialCreate: {
    material_id: '', // string, required
    quantity_in_one_mat_unit: 0, // integer, required
  },

  ProductPriceCreate: {
    start: 0, // integer, required
    end: 0, // integer, required
    price: 0, // integer, required
    description: '', // string | null
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
  dev: devApi,
  schemas,
};
