import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import ShoppingList from '../models/ShoppingList';
import ShoppingItem from '../models/ShoppingItem';

const router = express.Router();

// Obter histórico de compras (listas finalizadas)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { month, year, limit } = req.query;

    let query: any = {
      usuario_email: userEmail,
      tipo: 'ativa',
      status: 'finalizada',
    };

    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);
      query.data_finalizacao = { $gte: startDate, $lte: endDate };
    }

    const limitNum = limit ? parseInt(limit as string) : 100;
    const lists = await ShoppingList.find(query)
      .sort({ data_finalizacao: -1 })
      .limit(limitNum)
      .lean();

    // Buscar itens para cada lista
    const history = await Promise.all(
      lists.map(async (list: any) => {
        const items = await ShoppingItem.find({ lista_id: list._id }).lean();
        return {
          ...list,
          items: items.map((item: any) => ({
            id: item._id.toString(),
            nome_produto: item.nome_produto,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            comprado: item.comprado,
          })),
        };
      })
    );

    res.json(history);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ error: 'Erro ao obter histórico de compras' });
  }
});

// Obter análise mensal
router.get('/analytics/monthly', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { months = 6 } = req.query;
    const monthsNum = parseInt(months as string);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsNum);

    const lists = await ShoppingList.find({
      usuario_email: userEmail,
      tipo: 'ativa',
      status: 'finalizada',
      data_finalizacao: { $gte: startDate, $lte: endDate },
    }).lean();

    // Agrupar por mês/ano
    const monthlyData: {
      [key: string]: {
        month: string;
        year: number;
        monthNum: number;
        totalSpent: number;
        purchaseCount: number;
        averageTicket: number;
      };
    } = {};

    lists.forEach((list: any) => {
      if (!list.data_finalizacao) return;

      const date = new Date(list.data_finalizacao);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleString('pt-BR', { month: 'long' }),
          year: date.getFullYear(),
          monthNum: date.getMonth() + 1,
          totalSpent: 0,
          purchaseCount: 0,
          averageTicket: 0,
        };
      }

      if (list.valor_total) {
        monthlyData[monthKey].totalSpent += list.valor_total;
      }
      monthlyData[monthKey].purchaseCount += 1;
    });

    // Calcular ticket médio
    Object.keys(monthlyData).forEach((key) => {
      const data = monthlyData[key];
      data.averageTicket = data.purchaseCount > 0 ? data.totalSpent / data.purchaseCount : 0;
    });

    const result = Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNum - b.monthNum;
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao obter análise mensal:', error);
    res.status(500).json({ error: 'Erro ao obter análise mensal' });
  }
});

// Top produtos mais comprados
router.get('/analytics/top-products', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);

    // Buscar listas finalizadas dos últimos 12 meses
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const lists = await ShoppingList.find({
      usuario_email: userEmail,
      tipo: 'ativa',
      status: 'finalizada',
      data_finalizacao: { $gte: startDate },
    }).select('_id').lean();

    const listIds = lists.map((list) => list._id);

    // Buscar itens comprados dessas listas
    const items = await ShoppingItem.find({
      lista_id: { $in: listIds },
      comprado: true,
    }).lean();

    // Agrupar produtos
    const productMap: {
      [key: string]: { name: string; totalQuantity: number; timesPurchased: number };
    } = {};

    items.forEach((item: any) => {
      const key = item.nome_produto.toLowerCase().trim();
      if (!productMap[key]) {
        productMap[key] = {
          name: item.nome_produto,
          totalQuantity: 0,
          timesPurchased: 0,
        };
      }
      productMap[key].totalQuantity += item.quantidade;
      productMap[key].timesPurchased += 1;
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limitNum);

    res.json(topProducts);
  } catch (error) {
    console.error('Erro ao obter top produtos:', error);
    res.status(500).json({ error: 'Erro ao obter top produtos' });
  }
});

// Obter estatísticas gerais
router.get('/analytics/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user!.email;

    // Listas finalizadas dos últimos 12 meses
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const lists = await ShoppingList.find({
      usuario_email: userEmail,
      tipo: 'ativa',
      status: 'finalizada',
      data_finalizacao: { $gte: startDate },
    }).lean();

    const totalPurchases = lists.length;
    const totalSpent = lists.reduce((sum: number, list: any) => sum + (list.valor_total || 0), 0);
    const averageTicket = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

    // Estatísticas do mês atual
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthLists = lists.filter(
      (list: any) => list.data_finalizacao && new Date(list.data_finalizacao) >= currentMonthStart
    );

    const currentMonthSpent = currentMonthLists.reduce(
      (sum: number, list: any) => sum + (list.valor_total || 0),
      0
    );
    const currentMonthPurchases = currentMonthLists.length;

    // Lista ativa
    const activeList = await ShoppingList.findOne({
      usuario_email: userEmail,
      tipo: 'ativa',
      status: 'ativa',
    });
    const activeItemsCount = activeList
      ? (await ShoppingItem.countDocuments({ lista_id: activeList._id }))
      : 0;

    res.json({
      totalPurchases,
      totalSpent,
      averageTicket,
      currentMonth: {
        spent: currentMonthSpent,
        purchases: currentMonthPurchases,
      },
      activeItemsCount,
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

export default router;
