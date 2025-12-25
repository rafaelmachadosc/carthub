# CartHub Backend

Backend API para o aplicativo CartHub - Gerenciador de Lista de Compras.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente criando um arquivo `.env`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/carthub
JWT_SECRET=your-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
```

3. Certifique-se de ter o MongoDB rodando localmente ou configure uma URI remota.

4. Execute o servidor em desenvolvimento:
```bash
npm run dev
```

## Endpoints

### Autenticação
- `POST /api/auth/google` - Autenticação com Google OAuth
- `POST /api/auth/verify` - Verificar token

### Lista de Compras
- `GET /api/shopping-list` - Obter lista atual
- `POST /api/shopping-list/items` - Adicionar item
- `PUT /api/shopping-list/items/:itemId` - Atualizar item
- `DELETE /api/shopping-list/items/:itemId` - Remover item
- `POST /api/shopping-list/finish` - Finalizar compra

### Histórico
- `GET /api/history` - Obter histórico de compras
- `GET /api/history/analytics/monthly` - Análise mensal
- `GET /api/history/analytics/top-products` - Top produtos
- `GET /api/history/analytics/stats` - Estatísticas gerais

