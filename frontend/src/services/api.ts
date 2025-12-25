import axios from 'axios';
import { User, ShoppingList, ShoppingItem, PurchaseHistory, MonthlyAnalytics, TopProduct, GeneralStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  loginWithGoogle: async (credential: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },

  verifyToken: async (token: string): Promise<{ user: User }> => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  },
};

export const shoppingListService = {
  getList: async (): Promise<ShoppingList> => {
    const response = await api.get('/shopping-list');
    return response.data;
  },

  addItem: async (nome_produto: string, quantidade: number = 1, valor_unitario?: number): Promise<ShoppingList> => {
    const response = await api.post('/shopping-list/items', { nome_produto, quantidade, valor_unitario });
    return response.data;
  },

  updateItem: async (
    itemId: string,
    updates: Partial<Pick<ShoppingItem, 'nome_produto' | 'quantidade' | 'valor_unitario' | 'comprado'>>
  ): Promise<ShoppingList> => {
    const response = await api.put(`/shopping-list/items/${itemId}`, updates);
    return response.data;
  },

  removeItem: async (itemId: string): Promise<ShoppingList> => {
    const response = await api.delete(`/shopping-list/items/${itemId}`);
    return response.data;
  },

  finishPurchase: async (valor_total?: number): Promise<ShoppingList> => {
    const response = await api.post('/shopping-list/finish', { valor_total });
    return response.data;
  },
};

export const historyService = {
  getHistory: async (month?: number, year?: number, limit?: number): Promise<PurchaseHistory[]> => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get(`/history?${params.toString()}`);
    return response.data;
  },

  getMonthlyAnalytics: async (months: number = 6): Promise<MonthlyAnalytics[]> => {
    const response = await api.get(`/history/analytics/monthly?months=${months}`);
    return response.data;
  },

  getTopProducts: async (limit: number = 10): Promise<TopProduct[]> => {
    const response = await api.get(`/history/analytics/top-products?limit=${limit}`);
    return response.data;
  },

  getStats: async (): Promise<GeneralStats> => {
    const response = await api.get('/history/analytics/stats');
    return response.data;
  },
};

