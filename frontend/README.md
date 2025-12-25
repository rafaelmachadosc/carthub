# CartHub Frontend

Frontend do aplicativo CartHub - Gerenciador de Lista de Compras.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente criando um arquivo `.env`:
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

## Tecnologias

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts (gráficos)
- Axios (requisições HTTP)
- Google OAuth 2.0

## Estrutura

- `src/pages/` - Páginas da aplicação (Login, ShoppingList, Dashboard)
- `src/components/` - Componentes reutilizáveis
- `src/contexts/` - Contextos React (AuthContext)
- `src/services/` - Serviços de API
- `src/types/` - Definições de tipos TypeScript

