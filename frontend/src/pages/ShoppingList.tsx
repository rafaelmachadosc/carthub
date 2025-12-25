import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingList as ShoppingListType, ShoppingItem } from '../types';
import { shoppingListService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'planning' | 'active';

export const ShoppingList: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('planning');
  const [planningList, setPlanningList] = useState<ShoppingListType | null>(null);
  const [activeList, setActiveList] = useState<ShoppingListType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      const [planning, active] = await Promise.all([
        shoppingListService.getPlanningList(),
        shoppingListService.getActiveList(),
      ]);
      setPlanningList(planning);
      setActiveList(active);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'planning' ? planningList : activeList;

  // Função para formatar número brasileiro em tempo real (1.234,56)
  // Trata o campo como apenas dígitos numéricos, sempre os 2 últimos são centavos
  const formatBrazilianNumberRealTime = (value: string): string => {
    if (!value) return '';
    
    // Remover tudo exceto números
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly === '') return '';
    
    // Remover zeros à esquerda, exceto se for apenas "0"
    let cleanDigits = digitsOnly.replace(/^0+/, '') || '0';
    
    // Se após limpar ficou vazio, retorna "0,00"
    if (cleanDigits === '0' || cleanDigits === '') {
      return '0,00';
    }
    
    // Se tem 1 dígito: mostra como "0,0X"
    if (cleanDigits.length === 1) {
      return `0,0${cleanDigits}`;
    }
    
    // Se tem 2 dígitos: mostra como "0,XX"
    if (cleanDigits.length === 2) {
      return `0,${cleanDigits}`;
    }
    
    // Separar parte inteira e decimal (últimos 2 dígitos são centavos)
    let integerPart = cleanDigits.slice(0, -2);
    const decimalPart = cleanDigits.slice(-2);
    
    // Se não tem parte inteira (apenas centavos), usar "0"
    if (!integerPart) {
      integerPart = '0';
    } else {
      // Remover zeros à esquerda da parte inteira
      integerPart = integerPart.replace(/^0+/, '') || '0';
    }
    
    // Formatar parte inteira com pontos para milhares
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedInteger},${decimalPart}`;
  };

  // Função para converter string formatada para número (real)
  // A string vem no formato "1.234,56" e precisa ser convertida para 1234.56
  const parseBrazilianNumber = (value: string): number | null => {
    if (!value) return null;
    // Remover pontos (milhares) e substituir vírgula (decimal) por ponto
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed / 100; // Dividir por 100 porque formatamos como centavos (ex: 140 = 1,40)
  };

  // Handler para formatar em tempo real durante a digitação
  const handlePriceInputChange = (value: string, setter: (val: string) => void) => {
    // Sempre remover tudo que não é número primeiro
    let digitsOnly = value.replace(/\D/g, '');
    
    // Limitar a um número razoável de dígitos (ex: 999.999.999,99 = 11 dígitos)
    if (digitsOnly.length > 11) {
      digitsOnly = digitsOnly.substring(0, 11);
    }
    
    // Formatar em tempo real
    const formatted = formatBrazilianNumberRealTime(digitsOnly);
    setter(formatted);
  };

  // Handler para quando o campo perde o foco (garantir formato final)
  const handlePriceBlur = (value: string, setter: (val: string) => void) => {
    if (value) {
      // Garantir que está formatado corretamente
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly) {
        const formatted = formatBrazilianNumberRealTime(digitsOnly);
        setter(formatted);
      }
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      alert('Nome do produto não pode ser vazio');
      return;
    }

    try {
      setSaving(true);
      const price = newItemPrice ? parseBrazilianNumber(newItemPrice) : undefined;
      if (price !== null && price !== undefined && price < 0) {
        alert('Valor deve ser positivo');
        return;
      }

      if (activeTab === 'planning') {
        const updated = await shoppingListService.addPlanningItem(newItemName.trim(), 1, price || undefined);
        setPlanningList(updated);
      } else {
        const updated = await shoppingListService.addActiveItem(newItemName.trim(), 1, price || undefined);
        setActiveList(updated);
      }
      setNewItemName('');
      setNewItemPrice('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao adicionar item');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    const item = currentList?.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantidade + delta;
    if (newQuantity < 1) return;

    try {
      setSaving(true);
      if (activeTab === 'planning') {
        const updated = await shoppingListService.updatePlanningItem(itemId, { quantidade: newQuantity });
        setPlanningList(updated);
      } else {
        const updated = await shoppingListService.updateActiveItem(itemId, { quantidade: newQuantity });
        setActiveList(updated);
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePurchased = async (itemId: string, comprado: boolean) => {
    try {
      setSaving(true);
      const updated = await shoppingListService.updateActiveItem(itemId, { comprado });
      setActiveList(updated);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Deseja remover este item?')) return;

    try {
      setSaving(true);
      if (activeTab === 'planning') {
        const updated = await shoppingListService.removePlanningItem(itemId);
        setPlanningList(updated);
      } else {
        const updated = await shoppingListService.removeActiveItem(itemId);
        setActiveList(updated);
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePrice = async (itemId: string) => {
    let price: number | null | undefined = undefined;
    
    if (editPrice !== null && editPrice !== '') {
      const parsed = parseBrazilianNumber(editPrice);
      if (parsed === null || parsed < 0) {
        alert('Valor deve ser positivo');
        return;
      }
      price = parsed;
    } else {
      // Remover preço (passar null)
      price = null;
    }

    try {
      setSaving(true);
      if (activeTab === 'planning') {
        const updated = await shoppingListService.updatePlanningItem(itemId, { valor_unitario: price as any });
        setPlanningList(updated);
      } else {
        const updated = await shoppingListService.updateActiveItem(itemId, { valor_unitario: price as any });
        setActiveList(updated);
      }
      setEditingItem(null);
      setEditPrice('');
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePrice = async (itemId: string) => {
    try {
      setSaving(true);
      if (activeTab === 'planning') {
        const updated = await shoppingListService.updatePlanningItem(itemId, { valor_unitario: null as any });
        setPlanningList(updated);
      } else {
        const updated = await shoppingListService.updateActiveItem(itemId, { valor_unitario: null as any });
        setActiveList(updated);
      }
    } catch (error) {
      console.error('Erro ao remover preço:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleIncludeItem = async (itemId: string) => {
    try {
      setSaving(true);
      const updated = await shoppingListService.includePlanningItem(itemId);
      setPlanningList(updated);
      // Recarregar lista ativa também
      const active = await shoppingListService.getActiveList();
      setActiveList(active);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao incluir item');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToActive = async () => {
    if (!planningList || planningList.items.length === 0) {
      alert('Lista de planejamento está vazia');
      return;
    }

    if (!confirm('Deseja copiar todos os itens da lista de planejamento para a lista ativa?')) return;

    try {
      setCopying(true);
      const updated = await shoppingListService.copyPlanningToActive();
      setActiveList(updated);
      alert('Lista copiada com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao copiar lista');
    } finally {
      setCopying(false);
    }
  };

  const handleFinishPurchase = async () => {
    if (!activeList || activeList.items.length === 0) {
      alert('Lista vazia');
      return;
    }

    if (!confirm('Deseja finalizar esta compra?')) return;

    try {
      setFinishing(true);
      const total = totalValue ? parseBrazilianNumber(totalValue) : undefined;
      await shoppingListService.finishPurchase(total);
      await loadLists();
      setTotalValue('');
      alert('Compra finalizada com sucesso!');
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      alert('Erro ao finalizar compra');
    } finally {
      setFinishing(false);
    }
  };

  const calculateTotal = () => {
    if (!currentList) return 0;
    return currentList.items
      .filter((item) => item.valor_unitario !== undefined)
      .reduce((sum, item) => sum + item.quantidade * (item.valor_unitario || 0), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-gray-300 text-sm sm:text-base">Carregando lista...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-3 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <h1 className="text-xl sm:text-2xl text-white">CartHub</h1>
            {user && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-cyan-400 hover:text-cyan-300"
                >
                  Dashboard
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                  )}
                  <span className="text-sm sm:text-base text-gray-300 truncate max-w-[120px] sm:max-w-none">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sair
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('planning')}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base transition-colors ${
                activeTab === 'planning'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              📝 Lista a Comprar
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 sm:px-6 py-2 text-sm sm:text-base transition-colors ${
                activeTab === 'active'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              🛒 No Mercado
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-700">
          {/* Indicador de salvamento automático */}
          <div className="mb-4 flex items-center justify-end">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
              <span>{saving ? 'Salvando...' : 'Salvo automaticamente'}</span>
            </div>
          </div>

          {/* Botão para copiar planejamento para ativa */}
          {activeTab === 'planning' && planningList && planningList.items.length > 0 && (
            <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-cyan-500/30">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-sm sm:text-base text-gray-300">Pronto para comprar?</p>
                  <p className="text-xs sm:text-sm text-gray-400">Copie seus itens planejados para a lista ativa</p>
                </div>
                <button
                  onClick={handleCopyToActive}
                  disabled={copying}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {copying ? 'Copiando...' : '→ Copiar para No Mercado'}
                </button>
              </div>
            </div>
          )}

          {/* Adicionar item */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Nome do produto"
              className="flex-1 text-sm sm:text-base px-3 sm:px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            />
            <input
              type="text"
              value={newItemPrice}
              onChange={(e) => handlePriceInputChange(e.target.value, setNewItemPrice)}
              onBlur={() => handlePriceBlur(newItemPrice, setNewItemPrice)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Preço (opcional)"
              className="w-full sm:w-32 text-sm sm:text-base px-3 sm:px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            />
            <button
              onClick={handleAddItem}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Adicionar
            </button>
          </div>

          {/* Lista de itens */}
          <div className="space-y-2 mb-4 sm:mb-6">
            {currentList && currentList.items.length === 0 ? (
              <p className="text-sm sm:text-base text-gray-400 text-center py-6 sm:py-8">Lista vazia. Adicione itens para começar!</p>
            ) : (
              currentList?.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg ${
                    activeTab === 'active' && item.comprado
                      ? 'bg-gray-700/50 border-green-600/50'
                      : 'bg-gray-700/30 border-gray-600'
                  }`}
                >
                  {activeTab === 'active' && (
                    <input
                      type="checkbox"
                      checked={item.comprado}
                      onChange={(e) => handleTogglePurchased(item.id, e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 rounded focus:ring-cyan-500 flex-shrink-0 mt-1 sm:mt-0"
                    />
                  )}
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto flex-1">
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm sm:text-base ${
                          activeTab === 'active' && item.comprado
                            ? 'line-through text-gray-500'
                            : 'text-white'
                        }`}
                      >
                        {item.nome_produto}
                      </div>
                      {editingItem === item.id ? (
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={editPrice}
                            onChange={(e) => handlePriceInputChange(e.target.value, setEditPrice)}
                            onBlur={() => handlePriceBlur(editPrice, setEditPrice)}
                            placeholder="Preço unitário"
                            className="w-28 sm:w-32 text-xs sm:text-sm px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
                          />
                          <button
                            onClick={() => handleUpdatePrice(item.id)}
                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              setEditPrice('');
                            }}
                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-600 text-white rounded hover:bg-gray-500"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                          {item.valor_unitario !== undefined ? (
                            <>
                              <span>{formatCurrency(item.valor_unitario * item.quantidade)} ({formatCurrency(item.valor_unitario)} × {item.quantidade})</span>
                              <button
                                onClick={() => {
                                  setEditingItem(item.id);
                                  // Converter valor real para centavos e formatar
                                  if (item.valor_unitario) {
                                    const cents = Math.round(item.valor_unitario * 100).toString();
                                    setEditPrice(formatBrazilianNumberRealTime(cents));
                                  } else {
                                    setEditPrice('');
                                  }
                                }}
                                className="text-cyan-400 hover:text-cyan-300 hover:underline"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleRemovePrice(item.id)}
                                className="text-red-400 hover:text-red-300 hover:underline"
                              >
                                Remover
                              </button>
                            </>
                          ) : (
                            <>
                              <span>Preço não informado</span>
                              <button
                                onClick={() => {
                                  setEditingItem(item.id);
                                  setEditPrice('');
                                }}
                                className="text-cyan-400 hover:text-cyan-300 hover:underline"
                              >
                                Adicionar preço
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      {activeTab === 'planning' && item.incluido && (
                        <div className="mt-1">
                          <span className="text-xs px-2 py-0.5 bg-green-600/20 text-green-400 rounded border border-green-600/30">
                            ✓ Incluído
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        disabled={item.quantidade <= 1}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base"
                      >
                        −
                      </button>
                      <span className="w-6 sm:w-8 text-center text-sm sm:text-base text-white">{item.quantidade}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 text-white text-sm sm:text-base"
                      >
                        +
                      </button>
                    </div>
                    {activeTab === 'planning' ? (
                      <button
                        onClick={() => handleIncludeItem(item.id)}
                        disabled={item.incluido}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white rounded transition-colors ${
                          item.incluido
                            ? 'bg-green-600/50 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {item.incluido ? '✓ Incluído' : 'Incluir'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total e finalizar - apenas para lista ativa */}
          {activeTab === 'active' && activeList && activeList.items.length > 0 && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
                <div>
                  <div className="text-base sm:text-lg text-white">
                    Total: {formatCurrency(calculateTotal())}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    (apenas itens com preço informado)
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    step="0.01"
                    value={totalValue}
                    onChange={(e) => handlePriceInputChange(e.target.value, setTotalValue)}
                    onBlur={() => handlePriceBlur(totalValue, setTotalValue)}
                    placeholder="Valor total final (opcional)"
                    className="w-full sm:w-48 text-sm sm:text-base px-3 sm:px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
                  />
                  <button
                    onClick={handleFinishPurchase}
                    disabled={finishing}
                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {finishing ? 'Finalizando...' : 'Finalizar Compra'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
