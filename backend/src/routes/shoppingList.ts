import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import ShoppingList from '../models/ShoppingList';
import ShoppingItem from '../models/ShoppingItem';

const router = express.Router();

// Helper para obter lista por tipo
const getListByType = async (userEmail: string, tipo: 'planejamento' | 'ativa') => {
  let list = await ShoppingList.findOne({ 
    usuario_email: userEmail, 
    tipo,
    status: 'ativa' 
  });

  if (!list) {
    list = await ShoppingList.create({
      usuario_email: userEmail,
      tipo,
      status: 'ativa',
    });
  }

  return list;
};

// Helper para formatar resposta da lista
const formatListResponse = async (list: any) => {
  const items = await ShoppingItem.find({ lista_id: list._id });
  return {
    ...list.toObject(),
    items: items.map((item: any) => ({
      id: item._id.toString(),
      nome_produto: item.nome_produto,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      comprado: item.comprado,
      incluido: item.incluido || false,
    })),
  };
};

// ========== ROTAS PARA LISTA DE PLANEJAMENTO ==========

// Obter lista de planejamento
router.get('/planning', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const list = await getListByType(userEmail, 'planejamento');
    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter lista de planejamento:', error);
    res.status(500).json({ error: 'Erro ao obter lista de planejamento' });
  }
});

// Adicionar item à lista de planejamento
router.post('/planning/items', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { nome_produto, quantidade, valor_unitario } = req.body;

    if (!nome_produto || nome_produto.trim() === '') {
      res.status(400).json({ error: 'Nome do produto não pode ser vazio' });
      return;
    }

    if (quantidade !== undefined && quantidade < 1) {
      res.status(400).json({ error: 'Quantidade mínima é 1' });
      return;
    }

    if (valor_unitario !== undefined && valor_unitario < 0) {
      res.status(400).json({ error: 'Valor deve ser positivo' });
      return;
    }

    const list = await getListByType(userEmail, 'planejamento');

    // Verificar duplicatas
    const existingItem = await ShoppingItem.findOne({
      lista_id: list._id,
      nome_produto: { $regex: new RegExp(`^${nome_produto.trim()}$`, 'i') },
    });

    if (existingItem) {
      res.status(400).json({ error: 'Produto já existe na lista' });
      return;
    }

    await ShoppingItem.create({
      lista_id: list._id,
      nome_produto: nome_produto.trim(),
      quantidade: quantidade || 1,
      valor_unitario: valor_unitario !== undefined ? valor_unitario : undefined,
      comprado: false,
    });

    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// Atualizar item na lista de planejamento
router.put('/planning/items/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { itemId } = req.params;
    const { nome_produto, quantidade, valor_unitario } = req.body;

    const list = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'planejamento',
      status: 'ativa' 
    });

    if (!list) {
      res.status(404).json({ error: 'Lista não encontrada' });
      return;
    }

    const item = await ShoppingItem.findOne({ _id: itemId, lista_id: list._id });

    if (!item) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    if (nome_produto !== undefined) {
      if (nome_produto.trim() === '') {
        res.status(400).json({ error: 'Nome do produto não pode ser vazio' });
        return;
      }
      item.nome_produto = nome_produto.trim();
    }

    if (quantidade !== undefined) {
      if (quantidade < 1) {
        res.status(400).json({ error: 'Quantidade mínima é 1' });
        return;
      }
      item.quantidade = quantidade;
    }

    if (valor_unitario !== undefined) {
      // Permite remover o preço passando null ou string vazia
      if (valor_unitario === null || valor_unitario === '' || valor_unitario === undefined) {
        item.valor_unitario = undefined;
      } else {
        const price = typeof valor_unitario === 'string' ? parseFloat(valor_unitario) : valor_unitario;
        if (isNaN(price) || price < 0) {
          res.status(400).json({ error: 'Valor deve ser positivo' });
          return;
        }
        item.valor_unitario = price;
      }
    }

    await item.save();
    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// Marcar item da lista de planejamento como incluído (adiciona na lista ativa)
router.post('/planning/items/:itemId/include', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { itemId } = req.params;

    const planningList = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'planejamento',
      status: 'ativa' 
    });

    if (!planningList) {
      res.status(404).json({ error: 'Lista de planejamento não encontrada' });
      return;
    }

    const planningItem = await ShoppingItem.findOne({ _id: itemId, lista_id: planningList._id });

    if (!planningItem) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    // Buscar ou criar lista ativa
    let activeList = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'ativa',
      status: 'ativa' 
    });

    if (!activeList) {
      activeList = await ShoppingList.create({
        usuario_email: userEmail,
        tipo: 'ativa',
        status: 'ativa',
      });
    }

    // Verificar se já existe na lista ativa
    const existingItem = await ShoppingItem.findOne({
      lista_id: activeList._id,
      nome_produto: { $regex: new RegExp(`^${planningItem.nome_produto.trim()}$`, 'i') },
    });

    if (!existingItem) {
      // Adicionar na lista ativa
      await ShoppingItem.create({
        lista_id: activeList._id,
        nome_produto: planningItem.nome_produto,
        quantidade: planningItem.quantidade,
        valor_unitario: planningItem.valor_unitario,
        comprado: false,
      });
    }

    // Marcar como incluído na lista de planejamento
    planningItem.incluido = true;
    await planningItem.save();

    const response = await formatListResponse(planningList);
    res.json(response);
  } catch (error) {
    console.error('Erro ao incluir item:', error);
    res.status(500).json({ error: 'Erro ao incluir item' });
  }
});

// Remover item da lista de planejamento
router.delete('/planning/items/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { itemId } = req.params;

    const list = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'planejamento',
      status: 'ativa' 
    });

    if (!list) {
      res.status(404).json({ error: 'Lista não encontrada' });
      return;
    }

    const item = await ShoppingItem.findOne({ _id: itemId, lista_id: list._id });

    if (!item) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    await ShoppingItem.deleteOne({ _id: itemId });
    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

// Copiar lista de planejamento para lista ativa
router.post('/planning/copy-to-active', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;

    const planningList = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'planejamento',
      status: 'ativa' 
    });

    if (!planningList) {
      res.status(404).json({ error: 'Lista de planejamento não encontrada' });
      return;
    }

    const planningItems = await ShoppingItem.find({ lista_id: planningList._id });
    
    if (planningItems.length === 0) {
      res.status(400).json({ error: 'Lista de planejamento está vazia' });
      return;
    }

    // Buscar ou criar lista ativa
    let activeList = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'ativa',
      status: 'ativa' 
    });

    if (!activeList) {
      activeList = await ShoppingList.create({
        usuario_email: userEmail,
        tipo: 'ativa',
        status: 'ativa',
      });
    } else {
      // Limpar itens existentes na lista ativa
      await ShoppingItem.deleteMany({ lista_id: activeList._id });
    }

    // Copiar itens
    for (const item of planningItems) {
      await ShoppingItem.create({
        lista_id: activeList._id,
        nome_produto: item.nome_produto,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        comprado: false,
      });
    }

    const response = await formatListResponse(activeList);
    res.json(response);
  } catch (error) {
    console.error('Erro ao copiar lista:', error);
    res.status(500).json({ error: 'Erro ao copiar lista' });
  }
});

// ========== ROTAS PARA LISTA ATIVA (DURANTE COMPRA) ==========

// Obter lista ativa
router.get('/active', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const list = await getListByType(userEmail, 'ativa');
    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter lista ativa:', error);
    res.status(500).json({ error: 'Erro ao obter lista ativa' });
  }
});

// Adicionar item à lista ativa
router.post('/active/items', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { nome_produto, quantidade, valor_unitario } = req.body;

    if (!nome_produto || nome_produto.trim() === '') {
      res.status(400).json({ error: 'Nome do produto não pode ser vazio' });
      return;
    }

    if (quantidade !== undefined && quantidade < 1) {
      res.status(400).json({ error: 'Quantidade mínima é 1' });
      return;
    }

    if (valor_unitario !== undefined && valor_unitario < 0) {
      res.status(400).json({ error: 'Valor deve ser positivo' });
      return;
    }

    const list = await getListByType(userEmail, 'ativa');

    // Verificar duplicatas
    const existingItem = await ShoppingItem.findOne({
      lista_id: list._id,
      nome_produto: { $regex: new RegExp(`^${nome_produto.trim()}$`, 'i') },
    });

    if (existingItem) {
      res.status(400).json({ error: 'Produto já existe na lista' });
      return;
    }

    await ShoppingItem.create({
      lista_id: list._id,
      nome_produto: nome_produto.trim(),
      quantidade: quantidade || 1,
      valor_unitario: valor_unitario !== undefined ? valor_unitario : undefined,
      comprado: false,
    });

    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// Atualizar item na lista ativa (incluindo marcar como comprado)
router.put('/active/items/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { itemId } = req.params;
    const { nome_produto, quantidade, valor_unitario, comprado } = req.body;

    const list = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'ativa',
      status: 'ativa' 
    });

    if (!list) {
      res.status(404).json({ error: 'Lista não encontrada' });
      return;
    }

    const item = await ShoppingItem.findOne({ _id: itemId, lista_id: list._id });

    if (!item) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    if (nome_produto !== undefined) {
      if (nome_produto.trim() === '') {
        res.status(400).json({ error: 'Nome do produto não pode ser vazio' });
        return;
      }
      item.nome_produto = nome_produto.trim();
    }

    if (quantidade !== undefined) {
      if (quantidade < 1) {
        res.status(400).json({ error: 'Quantidade mínima é 1' });
        return;
      }
      item.quantidade = quantidade;
    }

    if (valor_unitario !== undefined) {
      if (valor_unitario < 0) {
        res.status(400).json({ error: 'Valor deve ser positivo' });
        return;
      }
      item.valor_unitario = valor_unitario;
    }

    if (comprado !== undefined) {
      item.comprado = comprado;
    }

    await item.save();
    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// Remover item da lista ativa
router.delete('/active/items/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { itemId } = req.params;

    const list = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'ativa',
      status: 'ativa' 
    });

    if (!list) {
      res.status(404).json({ error: 'Lista não encontrada' });
      return;
    }

    const item = await ShoppingItem.findOne({ _id: itemId, lista_id: list._id });

    if (!item) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    await ShoppingItem.deleteOne({ _id: itemId });
    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

// Finalizar compra (apenas lista ativa)
router.post('/active/finish', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { valor_total } = req.body;

    const list = await ShoppingList.findOne({ 
      usuario_email: userEmail, 
      tipo: 'ativa',
      status: 'ativa' 
    });

    if (!list) {
      res.status(404).json({ error: 'Lista não encontrada' });
      return;
    }

    const items = await ShoppingItem.find({ lista_id: list._id });
    if (items.length === 0) {
      res.status(400).json({ error: 'Lista vazia' });
      return;
    }

    // Marcar todos os itens como comprados
    await ShoppingItem.updateMany({ lista_id: list._id }, { comprado: true });

    // Atualizar lista: status finalizada, data_finalizacao, valor_total
    list.status = 'finalizada';
    list.data_finalizacao = new Date();
    if (valor_total !== undefined) {
      list.valor_total = valor_total;
    }
    await list.save();

    // Criar nova lista ativa vazia
    const newList = await ShoppingList.create({
      usuario_email: userEmail,
      tipo: 'ativa',
      status: 'ativa',
    });

    res.json({
      message: 'Compra finalizada com sucesso',
      list: {
        ...newList.toObject(),
        items: [],
      },
    });
  } catch (error) {
    console.error('Erro ao finalizar compra:', error);
    res.status(500).json({ error: 'Erro ao finalizar compra' });
  }
});

// Rota de compatibilidade - mantém a rota antiga apontando para lista ativa
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const list = await getListByType(userEmail, 'ativa');
    const response = await formatListResponse(list);
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter lista:', error);
    res.status(500).json({ error: 'Erro ao obter lista de compras' });
  }
});

export default router;
