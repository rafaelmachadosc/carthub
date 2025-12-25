# CartHub - Gerenciador de Lista de Compras

Aplicação completa para gerenciamento de lista de compras com autenticação Google OAuth 2.0, dashboard com análises e histórico de compras.

## 📁 Estrutura do Projeto

```
carthub/
├── backend/          # API REST em Node.js + Express + TypeScript + MongoDB
└── frontend/         # Interface React + TypeScript + Vite + Tailwind CSS
```

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- Login com Google OAuth 2.0
- Isolamento de dados por usuário (baseado em email)
- Sincronização multi-dispositivo
- Tokens JWT seguros
- Validação de sessão automática

### 🛒 Lista de Compras
- Adicionar/remover produtos
- Ajustar quantidades (+/-)
- Preço unitário opcional
- Marcar itens como comprados (checkbox)
- Cálculo automático do total
- Validações de negócio (sem duplicatas, quantidade mínima, etc.)

### 📊 Dashboard e Histórico
- Histórico completo de compras
- Análise mensal (últimos 6 meses)
- Gráficos de gastos e quantidade de compras
- Top 10 produtos mais comprados
- Estatísticas gerais (total gasto, ticket médio, etc.)
- Filtros por mês/ano

## 🚀 Pré-requisitos

- Node.js 18+ instalado
- MongoDB Atlas (remoto) ou local
- Conta Google Cloud Platform (para OAuth)

## 📋 Configuração Inicial

### 1. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e crie um novo repositório
2. Nome sugerido: `carthub` ou `carthub-app`
3. Marque como **Público** ou **Privado** conforme necessário
4. **Não** inicialize com README, .gitignore ou licença (já temos)
5. Anote a URL do repositório (ex: `https://github.com/seu-usuario/carthub.git`)

### 2. Conectar ao Repositório Remoto

```bash
cd carthub
git remote add origin https://github.com/SEU-USUARIO/carthub.git
git branch -M main
git add .
git commit -m "Initial commit: CartHub application"
git push -u origin main
```

### 3. Configurar MongoDB Atlas (Remoto)

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita ou faça login
3. Crie um novo cluster (free tier M0 é suficiente)
4. Crie um usuário do banco de dados:
   - Database Access > Add New Database User
   - Escolha username/password
   - Role: Atlas admin ou Read and write to any database
5. Configure Network Access:
   - Network Access > Add IP Address
   - Adicione `0.0.0.0/0` para desenvolvimento (ou seu IP específico)
6. Obtenha a connection string:
   - Clique em "Connect" no cluster
   - Escolha "Connect your application"
   - Copie a string de conexão
   - Substitua `<password>` pela senha do usuário criado
   - Exemplo: `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/carthub?retryWrites=true&w=majority`

### 4. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google Sign-In API" ou "Google+ API"
4. Vá em "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0"
5. Configure:
   - Tipo: Aplicativo da Web
   - Nome: CartHub
   - Origens JavaScript autorizadas: 
     - `http://localhost:5173` (desenvolvimento)
     - Sua URL de produção quando deployar
   - URIs de redirecionamento autorizados: `http://localhost:5173`
6. Copie o **Client ID** e **Client Secret** gerados

### 5. Configurar Variáveis de Ambiente

#### Backend (`backend/.env`)

Crie o arquivo `backend/.env`:

```env
PORT=3001
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/carthub?retryWrites=true&w=majority
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-mude-em-producao
GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)

Crie o arquivo `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001
```

## 🛠️ Instalação e Execução

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# O servidor estará rodando em http://localhost:3001
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# A aplicação estará rodando em http://localhost:5173
```

## 📊 Estrutura de Dados

### User
- `email` (único, chave primária)
- `nome`
- `foto_perfil`
- `data_cadastro`

### Lista_Compras
- `id` (ObjectId)
- `usuario_email` (FK)
- `status` ('ativa' | 'finalizada')
- `data_criacao`
- `data_finalizacao`
- `valor_total`

### Itens
- `id` (ObjectId)
- `lista_id` (FK para Lista_Compras)
- `nome_produto`
- `quantidade`
- `valor_unitario`
- `comprado` (boolean)

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/google` - Login com Google
- `POST /api/auth/verify` - Verificar token

### Lista de Compras
- `GET /api/shopping-list` - Obter lista atual (ativa)
- `POST /api/shopping-list/items` - Adicionar item
- `PUT /api/shopping-list/items/:itemId` - Atualizar item
- `DELETE /api/shopping-list/items/:itemId` - Remover item
- `POST /api/shopping-list/finish` - Finalizar compra

### Histórico
- `GET /api/history` - Obter histórico (query: month, year, limit)
- `GET /api/history/analytics/monthly` - Análise mensal (query: months)
- `GET /api/history/analytics/top-products` - Top produtos (query: limit)
- `GET /api/history/analytics/stats` - Estatísticas gerais

## 🏗️ Build para Produção

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🛡️ Regras de Negócio

- Nome do produto não pode ser vazio
- Quantidade mínima é 1
- Valor, quando informado, deve ser positivo
- Não permite duplicar produtos na mesma lista
- Usuário deve estar autenticado para acessar qualquer funcionalidade
- Histórico mantém registros por até 12 meses

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Google Auth Library
- JWT
- CORS

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts
- Axios
- Google Identity Services

## 📝 Notas Importantes

- ⚠️ Configure corretamente as variáveis de ambiente em ambos os projetos
- ⚠️ Use um JWT_SECRET forte e único em produção
- ⚠️ O Google Client ID deve ser o mesmo no backend e frontend
- ⚠️ Em produção, atualize as URLs autorizadas no Google Cloud Console
- ⚠️ Configure corretamente o Network Access no MongoDB Atlas
- ⚠️ Não commite arquivos `.env` no repositório

## 🐛 Solução de Problemas

1. **Erro de conexão com MongoDB**: Verifique a connection string e o Network Access
2. **Erro de autenticação Google**: Verifique Client ID/Secret e URLs autorizadas
3. **Erro 401/403**: Verifique se o token JWT está sendo enviado corretamente
4. **Erro de CORS**: Verifique FRONTEND_URL no backend

## 📄 Licença

Este projeto está sob a licença MIT.
