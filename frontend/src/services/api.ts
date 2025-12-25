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
  // Lista de Planejamento
  getPlanningList: async (): Promise<ShoppingList> => {
    const response = await api.get('/shopping-list/planning');
    return response.data;
  },

  addPlanningItem: async (nome_produto: string, quantidade: number = 1, valor_unitario?: number): Promise<ShoppingList> => {
    const response = await api.post('/shopping-list/planning/items', { nome_produto, quantidade, valor_unitario });
    return response.data;
  },

  updatePlanningItem: async (
    itemId: string,
    updates: Partial<Pick<ShoppingItem, 'nome_produto' | 'quantidade' | 'valor_unitario'>>
  ): Promise<ShoppingList> => {
    const response = await api.put(`/shopping-list/planning/items/${itemId}`, updates);
    return response.data;
  },

  removePlanningItem: async (itemId: string): Promise<ShoppingList> => {
    const response = await api.delete(`/shopping-list/planning/items/${itemId}`);
    return response.data;
  },

  includePlanningItem: async (itemId: string): Promise<ShoppingList> => {
    const response = await api.post(`/shopping-list/planning/items/${itemId}/include`);
    return response.data;
  },

  copyPlanningToActive: async (): Promise<ShoppingList> => {
    const response = await api.post('/shopping-list/planning/copy-to-active');
    return response.data;
  },

  // Lista Ativa (durante compra)
  getActiveList: async (): Promise<ShoppingList> => {
    const response = await api.get('/shopping-list/active');
    return response.data;
  },

  addActiveItem: async (nome_produto: string, quantidade: number = 1, valor_unitario?: number): Promise<ShoppingList> => {
    const response = await api.post('/shopping-list/active/items', { nome_produto, quantidade, valor_unitario });
    return response.data;
  },

  updateActiveItem: async (
    itemId: string,
    updates: Partial<Pick<ShoppingItem, 'nome_produto' | 'quantidade' | 'valor_unitario' | 'comprado'>>
  ): Promise<ShoppingList> => {
    const response = await api.put(`/shopping-list/active/items/${itemId}`, updates);
    return response.data;
  },

  removeActiveItem: async (itemId: string): Promise<ShoppingList> => {
    const response = await api.delete(`/shopping-list/active/items/${itemId}`);
    return response.data;
  },

  finishPurchase: async (valor_total?: number): Promise<{ message: string; list: ShoppingList }> => {
    const response = await api.post('/shopping-list/active/finish', { valor_total });
    return response.data;
  },

  // Métodos de compatibilidade (mantidos para não quebrar código existente)
  getList: async (): Promise<ShoppingList> => {
    return shoppingListService.getActiveList();
  },

  addItem: async (nome_produto: string, quantidade: number = 1, valor_unitario?: number): Promise<ShoppingList> => {
    return shoppingListService.addActiveItem(nome_produto, quantidade, valor_unitario);
  },

  updateItem: async (
    itemId: string,
    updates: Partial<Pick<ShoppingItem, 'nome_produto' | 'quantidade' | 'valor_unitario' | 'comprado'>>
  ): Promise<ShoppingList> => {
    return shoppingListService.updateActiveItem(itemId, updates);
  },

  removeItem: async (itemId: string): Promise<ShoppingList> => {
    return shoppingListService.removeActiveItem(itemId);
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

