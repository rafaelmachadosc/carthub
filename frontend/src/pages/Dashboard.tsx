import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { historyService } from '../services/api';
import { PurchaseHistory, MonthlyAnalytics, TopProduct, GeneralStats } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalytics[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyData, analyticsData, topProductsData, statsData] = await Promise.all([
        historyService.getHistory(selectedMonth || undefined, selectedYear),
        historyService.getMonthlyAnalytics(6),
        historyService.getTopProducts(10),
        historyService.getStats(),
      ]);

      setHistory(historyData);
      setMonthlyAnalytics(analyticsData);
      setTopProducts(topProductsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Lista de Compras
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600 mb-1">Total de Compras</div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalPurchases}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600 mb-1">Total Gasto</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalSpent)}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600 mb-1">Ticket Médio</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.averageTicket)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-600 mb-1">Mês Atual</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.currentMonth.spent)}
              </div>
              <div className="text-xs text-gray-500">{stats.currentMonth.purchases} compras</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os meses</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSelectedMonth(null);
                setSelectedYear(new Date().getFullYear());
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico Mensal */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gastos Mensais (Últimos 6 meses)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#333' }}
                />
                <Legend />
                <Bar dataKey="totalSpent" fill="#3B82F6" name="Total Gasto" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Compras */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quantidade de Compras</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelStyle={{ color: '#333' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="purchaseCount"
                  stroke="#10B981"
                  name="Compras"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Produtos */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top 10 Produtos Mais Comprados</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Produto</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantidade Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Vezes Comprado</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4 text-right font-medium">{product.totalQuantity}</td>
                    <td className="py-3 px-4 text-right">{product.timesPurchased}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Histórico de Compras */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Compras</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma compra encontrada no período selecionado.</p>
          ) : (
            <div className="space-y-4">
              {history.map((purchase) => (
                <div key={purchase._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {formatDate(purchase.data_finalizacao)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {purchase.items.length} {purchase.items.length === 1 ? 'item' : 'itens'}
                      </div>
                    </div>
                    {purchase.valor_total !== undefined && (
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(purchase.valor_total)}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                        Ver produtos
                      </summary>
                      <div className="mt-2 pl-4">
                        <ul className="list-disc space-y-1">
                          {purchase.items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-700">
                              {item.nome_produto} - Qtd: {item.quantidade}
                              {item.valor_unitario !== undefined &&
                                ` - ${formatCurrency(item.valor_unitario * item.quantidade)}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

