import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import ShoppingList from '../models/ShoppingList';
import ShoppingItem from '../models/ShoppingItem';

const router = express.Router();

// Obter lista de compras ativa
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;

    let list = await ShoppingList.findOne({ usuario_email: userEmail, status: 'ativa' });

    if (!list) {
      list = await ShoppingList.create({
        usuario_email: userEmail,
        status: 'ativa',
      });
    }

    // Buscar itens da lista
    const items = await ShoppingItem.find({ lista_id: list._id });

    res.json({
      ...list.toObject(),
      items: items.map((item) => ({
        id: item._id.toString(),
        nome_produto: item.nome_produto,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        comprado: item.comprado,
      })),
    });
  } catch (error) {
    console.error('Erro ao obter lista:', error);
    res.status(500).json({ error: 'Erro ao obter lista de compras' });
  }
});

// Adicionar item
router.post('/items', authenticateToken, async (req: AuthRequest, res: Response) => {
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

    // Buscar ou criar lista ativa
    let list = await ShoppingList.findOne({ usuario_email: userEmail, status: 'ativa' });

    if (!list) {
      list = await ShoppingList.create({
        usuario_email: userEmail,
        status: 'ativa',
      });
    }

    // Verificar duplicatas
    const existingItem = await ShoppingItem.findOne({
      lista_id: list._id,
      nome_produto: { $regex: new RegExp(`^${nome_produto.trim()}$`, 'i') },
    });

    if (existingItem) {
      res.status(400).json({ error: 'Produto já existe na lista' });
      return;
    }

    // Criar novo item
    const newItem = await ShoppingItem.create({
      lista_id: list._id,
      nome_produto: nome_produto.trim(),
      quantidade: quantidade || 1,
      valor_unitario: valor_unitario !== undefined ? valor_unitario : undefined,
      comprado: false,
    });

    // Buscar todos os itens da lista
    const items = await ShoppingItem.find({ lista_id: list._id });

    res.json({
      ...list.toObject(),
      items: items.map((item) => ({
        id: item._id.toString(),
        nome_produto: item.nome_produto,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        comprado: item.comprado,
      })),
    });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// Atualizar item
router.put('/items/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { itemId } = req.params;
    const { nome_produto, quantidade, valor_unitario, comprado } = req.body;

    // Verificar se a lista pertence ao usuário
    const list = await ShoppingList.findOne({ usuario_email: userEmail, status: 'ativa' });

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

    // Buscar todos os itens da lista
    const items = await ShoppingItem.find({ lista_id: list._id });

    res.json({
      ...list.toObject(),
      items: items.map((it) => ({
        id: it._id.toString(),
        nome_produto: it.nome_produto,
        quantidade: it.quantidade,
        valor_unitario: it.valor_unitario,
        comprado: it.comprado,
      })),
    });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// Remover item
router.delete('/items/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { itemId } = req.params;

    // Verificar se a lista pertence ao usuário
    const list = await ShoppingList.findOne({ usuario_email: userEmail, status: 'ativa' });

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

    // Buscar todos os itens da lista
    const items = await ShoppingItem.find({ lista_id: list._id });

    res.json({
      ...list.toObject(),
      items: items.map((it) => ({
        id: it._id.toString(),
        nome_produto: it.nome_produto,
        quantidade: it.quantidade,
        valor_unitario: it.valor_unitario,
        comprado: it.comprado,
      })),
    });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

// Finalizar compra
router.post('/finish', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { valor_total } = req.body;

    const list = await ShoppingList.findOne({ usuario_email: userEmail, status: 'ativa' });

    if (!list) {
      res.status(404).json({ error: 'Lista não encontrada' });
      return;
    }

    // Verificar se há itens
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

    // Criar nova lista ativa
    const newList = await ShoppingList.create({
      usuario_email: userEmail,
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

export default router;
