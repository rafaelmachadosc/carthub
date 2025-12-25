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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-gray-300 text-sm sm:text-base">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg text-white truncate">{user?.name}</h1>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-cyan-400 hover:text-cyan-300"
              >
                Lista
              </button>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Total de Compras</div>
              <div className="text-lg sm:text-2xl text-white">{stats.totalPurchases}</div>
            </div>
            <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Total Gasto</div>
              <div className="text-base sm:text-2xl text-cyan-400">{formatCurrency(stats.totalSpent)}</div>
            </div>
            <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Ticket Médio</div>
              <div className="text-base sm:text-2xl text-green-400">
                {formatCurrency(stats.averageTicket)}
              </div>
            </div>
            <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Mês Atual</div>
              <div className="text-base sm:text-2xl text-purple-400">
                {formatCurrency(stats.currentMonth.spent)}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">{stats.currentMonth.purchases} compras</div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg mb-4 sm:mb-8 border border-gray-700">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm text-gray-300">Filtrar por:</label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year} className="bg-gray-700">
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth || ''}
                onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="" className="bg-gray-700">Todos os meses</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month} className="bg-gray-700">
                    {new Date(2000, month - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setSelectedMonth(null);
                  setSelectedYear(new Date().getFullYear());
                }}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 text-gray-300 hover:text-white whitespace-nowrap"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          {/* Gráfico Mensal */}
          <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-base sm:text-lg text-white mb-3 sm:mb-4">Gastos Mensais (6 meses)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', fontSize: '12px', color: '#F3F4F6' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
                <Bar dataKey="totalSpent" fill="#22D3EE" name="Total Gasto" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Compras */}
          <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-base sm:text-lg text-white mb-3 sm:mb-4">Quantidade de Compras</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip 
                  labelStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', fontSize: '12px', color: '#F3F4F6' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
                <Line
                  type="monotone"
                  dataKey="purchaseCount"
                  stroke="#34D399"
                  name="Compras"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Produtos */}
        <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-8 border border-gray-700">
          <h2 className="text-base sm:text-lg text-white mb-3 sm:mb-4">Top 10 Produtos</h2>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-[300px]">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-300">Produto</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-300">Qtd Total</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-300">Vezes</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none text-gray-300">{product.name}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm text-white">{product.totalQuantity}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm text-gray-300">{product.timesPurchased}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Histórico de Compras */}
        <div className="bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-base sm:text-lg text-white mb-3 sm:mb-4">Histórico de Compras</h2>
          {history.length === 0 ? (
            <p className="text-xs sm:text-sm text-gray-400 text-center py-6 sm:py-8">Nenhuma compra encontrada no período selecionado.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {history.map((purchase) => (
                <div key={purchase._id} className="border border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-700/50">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm sm:text-base text-white">
                        {formatDate(purchase.data_finalizacao)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        {purchase.items.length} {purchase.items.length === 1 ? 'item' : 'itens'}
                      </div>
                    </div>
                    {purchase.valor_total !== undefined && (
                      <div className="text-base sm:text-lg text-cyan-400 whitespace-nowrap">
                        {formatCurrency(purchase.valor_total)}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer text-xs sm:text-sm text-cyan-400 hover:text-cyan-300">
                        Ver produtos
                      </summary>
                      <div className="mt-2 pl-3 sm:pl-4">
                        <ul className="list-disc space-y-1">
                          {purchase.items.map((item, index) => (
                            <li key={index} className="text-xs sm:text-sm text-gray-300">
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

