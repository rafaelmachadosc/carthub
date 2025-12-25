export interface User {
  email: string;
  name: string;
  picture?: string;
}

export interface ShoppingItem {
  id: string;
  nome_produto: string;
  quantidade: number;
  valor_unitario?: number;
  comprado: boolean;
  incluido?: boolean; // Para lista de planejamento - marca se foi incluído na lista ativa
}

export interface ShoppingList {
  _id?: string;
  usuario_email: string;
  tipo: 'planejamento' | 'ativa';
  status: 'ativa' | 'finalizada';
  data_criacao?: string;
  data_finalizacao?: string;
  valor_total?: number;
  items: ShoppingItem[];
}

export interface PurchaseHistory {
  _id: string;
  usuario_email: string;
  status: 'finalizada';
  data_criacao: string;
  data_finalizacao: string;
  valor_total?: number;
  items: ShoppingItem[];
}

export interface MonthlyAnalytics {
  month: string;
  year: number;
  monthNum: number;
  totalSpent: number;
  purchaseCount: number;
  averageTicket: number;
}

export interface TopProduct {
  name: string;
  totalQuantity: number;
  timesPurchased: number;
}

export interface GeneralStats {
  totalPurchases: number;
  totalSpent: number;
  averageTicket: number;
  currentMonth: {
    spent: number;
    purchases: number;
  };
  activeItemsCount: number;
}

