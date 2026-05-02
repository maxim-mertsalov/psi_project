import api from '@/app/lib/axios';
import { AdminProductRes, AdminProductUpsertReq, GetProductsQuery, ProductDetailRes, ProductSummaryRes } from '../types/dto/catalog';
import { AuthRes, LoginReq, RegisterAccountReq } from '../types/dto/customer';
import { CartRes } from '../types/dto/cart';
import { CheckoutReq, CheckoutRes } from '../types/dto/checkout';
import { InitiatePaymentRes, PaymentCallbackReq, PaymentCallbackRes } from '../types/dto/payment';
import { OrderProcessRes, OrderSummaryRes } from '../types/dto/order';

// --- CATALOG ---
export const catalogApi = {
  getProducts: (params?: GetProductsQuery): Promise<ProductSummaryRes[]> => api.get('/api/products', { params }).then(res => res.data),
  getProduct: (id: string): Promise<ProductDetailRes> => api.get(`/api/products/${id}`).then(res => res.data),
  
  // Admin methods
  adminList: (): Promise<AdminProductRes[]> => api.get('/api/admin/products').then(res => res.data),
  adminCreate: (data: AdminProductUpsertReq): Promise<AdminProductRes> => api.post('/api/admin/products', data).then(res => res.data),
  adminUpdate: (id: string, data: AdminProductUpsertReq): Promise<AdminProductRes> => api.put(`/api/admin/products/${id}`, data).then(res => res.data),
  adminDelete: (id: string): Promise<void> => api.delete(`/api/admin/products/${id}`).then(res => res.data),
};

// --- AUTH ---
export const authApi = {
  login: (credentials: LoginReq): Promise<AuthRes> => api.post('/api/auth/login', credentials).then(res => res.data),
  register: (data: RegisterAccountReq): Promise<AuthRes> => api.post('/api/auth/register', data).then(res => res.data),
};

// --- CART ---
export const cartApi = {
  getCart: (): Promise<CartRes> => api.get('/api/cart').then(res => res.data),
  addItem: (productId: number, quantity: number): Promise<CartRes> => 
    api.post('/api/cart/items', { productId, quantity }).then(res => res.data),
  updateItem: (itemId: number, quantity: number): Promise<CartRes> => 
    api.patch(`/api/cart/items/${itemId}`, { quantity }).then(res => res.data),
  removeItem: (itemId: number): Promise<CartRes> => api.delete(`/api/cart/items/${itemId}`).then(res => res.data),
};

// --- CHECKOUT & ORDERS ---
export const checkoutApi = {
  process: (data: CheckoutReq): Promise<CheckoutRes> => api.post('/api/checkout/orders', data).then(res => res.data),
};

export const paymentApi = {
  initiate: (orderId: number): Promise<InitiatePaymentRes> => 
    api.post(`/api/payments/${orderId}/initiate`).then(res => res.data),
  callback: (callback_req: PaymentCallbackReq): Promise<PaymentCallbackRes> => 
    api.post(`/api/payments/callback`, callback_req).then(res => res.data),
};

export const orderApi = {
  getMyOrders: (): Promise<OrderSummaryRes[]> => api.get('/api/me/orders').then(res => res.data),
  cancelOrder: (id: number): Promise<OrderProcessRes> => api.post(`/api/me/orders/${id}/cancel`).then(res => res.data),

  adminProcessPrder: (orderId: number): Promise<OrderProcessRes> => api.post(`/api/admin/orders/${orderId}/process`).then(res => res.data),
  adminShipOrder: (orderId: number): Promise<OrderProcessRes> => api.post(`/api/admin/orders/${orderId}/ship`).then(res => res.data),
  adminGetAllOrders: (): Promise<OrderSummaryRes[]> => api.get('/api/admin/orders/').then(res => res.data),
};