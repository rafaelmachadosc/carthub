import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingList as ShoppingListType, ShoppingItem } from '../types';
import { shoppingListService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const ShoppingList: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<ShoppingListType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await shoppingListService.getList();
      setList(data);
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      alert('Nome do produto não pode ser vazio');
      return;
    }

    try {
      const price = newItemPrice ? parseFloat(newItemPrice) : undefined;
      if (price !== undefined && price < 0) {
        alert('Valor deve ser positivo');
        return;
      }

      const updated = await shoppingListService.addItem(newItemName.trim(), 1, price);
      setList(updated);
      setNewItemName('');
      setNewItemPrice('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao adicionar item');
    }
  };

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    const item = list?.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantidade + delta;
    if (newQuantity < 1) return;

    try {
      const updated = await shoppingListService.updateItem(itemId, { quantidade: newQuantity });
      setList(updated);
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  const handleTogglePurchased = async (itemId: string, comprado: boolean) => {
    try {
      const updated = await shoppingListService.updateItem(itemId, { comprado });
      setList(updated);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Deseja remover este item?')) return;

    try {
      const updated = await shoppingListService.removeItem(itemId);
      setList(updated);
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const handleUpdatePrice = async (itemId: string) => {
    const price = editPrice ? parseFloat(editPrice) : undefined;
    if (price !== undefined && price < 0) {
      alert('Valor deve ser positivo');
      return;
    }

    try {
      const updated = await shoppingListService.updateItem(itemId, { valor_unitario: price });
      setList(updated);
      setEditingItem(null);
      setEditPrice('');
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
    }
  };

  const handleFinishPurchase = async () => {
    if (!list || list.items.length === 0) {
      alert('Lista vazia');
      return;
    }

    if (!confirm('Deseja finalizar esta compra?')) return;

    try {
      setFinishing(true);
      const total = totalValue ? parseFloat(totalValue) : undefined;
      await shoppingListService.finishPurchase(total);
      await loadList();
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
    if (!list) return 0;
    return list.items
      .filter((item) => item.valor_unitario !== undefined)
      .reduce((sum, item) => sum + item.quantidade * (item.valor_unitario || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando lista...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Lista de Compras</h1>
            {user && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Dashboard
                </button>
                <div className="flex items-center gap-3">
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                  )}
                  <span className="text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sair
                </button>
              </div>
            )}
          </div>

          {/* Adicionar item */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Nome do produto"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              step="0.01"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Preço (opcional)"
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddItem}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Adicionar
            </button>
          </div>

          {/* Lista de itens */}
          <div className="space-y-2 mb-6">
            {list && list.items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Lista vazia. Adicione itens para começar!</p>
            ) : (
              list?.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    item.comprado
                      ? 'bg-gray-100 border-gray-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.comprado}
                    onChange={(e) => handleTogglePurchased(item.id, e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        item.comprado ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}
                    >
                      {item.nome_produto}
                    </div>
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Preço unitário"
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => handleUpdatePrice(item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setEditPrice('');
                          }}
                          className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 mt-1">
                        {item.valor_unitario !== undefined
                          ? `R$ ${(item.valor_unitario * item.quantidade).toFixed(2)} (R$ ${item.valor_unitario.toFixed(2)} × ${item.quantidade})`
                          : 'Preço não informado'}
                        {item.valor_unitario === undefined && (
                          <button
                            onClick={() => setEditingItem(item.id)}
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            Adicionar preço
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      disabled={item.quantidade <= 1}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantidade}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Total e finalizar */}
          {list && list.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-lg font-semibold text-gray-700">
                    Total: R$ {calculateTotal().toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    (apenas itens com preço informado)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    placeholder="Valor total final (opcional)"
                    className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleFinishPurchase}
                    disabled={finishing}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

