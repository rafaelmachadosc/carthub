# 🗄️ Configuração do MongoDB Atlas (Remoto)

## Passo a Passo para Configurar MongoDB Atlas

### 1. Criar Conta no MongoDB Atlas

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita (ou faça login se já tiver)

### 2. Criar um Cluster Gratuito

1. Após login, clique em **"Build a Database"**
2. Escolha o plano **FREE (M0)** - Shared
3. Escolha um Cloud Provider e Region (recomendado: AWS, região mais próxima do Brasil)
4. Deixe o nome do cluster como padrão (ex: `Cluster0`) ou escolha um nome
5. Clique em **"Create"**
6. Aguarde o cluster ser criado (pode levar alguns minutos)

### 3. Criar Usuário do Banco de Dados

1. Na tela inicial do Atlas, vá em **"Database Access"** (menu lateral)
2. Clique em **"Add New Database User"**
3. Configure:
   - **Authentication Method**: Password
   - **Username**: Escolha um nome (ex: `carthub_user`)
   - **Password**: Clique em "Autogenerate Secure Password" ou crie sua própria senha
   - **⚠️ IMPORTANTE: COPIE A SENHA** (você não verá novamente!)
   - **User Privileges**: "Atlas admin" (ou "Read and write to any database")
4. Clique em **"Add User"**

### 4. Configurar Network Access

1. Vá em **"Network Access"** (menu lateral)
2. Clique em **"Add IP Address"**
3. Para desenvolvimento, você pode:
   - Clique em **"Allow Access from Anywhere"** (usa `0.0.0.0/0`)
   - ⚠️ **Nota**: Em produção, use apenas seu IP específico por segurança
4. Clique em **"Confirm"**

### 5. Obter Connection String

1. Volte para **"Database"** (ou "Deployments")
2. Clique no botão **"Connect"** no seu cluster
3. Escolha **"Connect your application"**
4. Em **"Driver"**, escolha: `Node.js`
5. Em **"Version"**, escolha a versão mais recente (ex: `5.5 or later`)
6. Copie a **Connection String** que aparece
   - Exemplo: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7. **Substitua** `<username>` pelo nome do usuário criado
8. **Substitua** `<password>` pela senha do usuário
9. **Adicione o nome do banco** ao final: `/carthub`
   - Resultado final: `mongodb+srv://carthub_user:sua_senha@cluster0.xxxxx.mongodb.net/carthub?retryWrites=true&w=majority`

### 6. Configurar no Backend

1. No diretório `backend/`, crie um arquivo `.env`
2. Adicione a connection string:

```env
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.xxxxx.mongodb.net/carthub?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-mude-em-producao
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
```

### 7. Testar Conexão

Após configurar o `.env`, reinicie o servidor backend:

```bash
cd backend
npm run dev
```

Você deve ver: `✅ MongoDB connected successfully`

## Troubleshooting

- **Erro de conexão**: Verifique se o IP foi adicionado no Network Access
- **Erro de autenticação**: Verifique username e password na connection string
- **Timeout**: Verifique se o cluster está completamente criado e ativo

## Próximos Passos

Após configurar o MongoDB Atlas:
- ✅ Backend conectará ao banco remoto
- ⏭️ Configure Google OAuth
- ⏭️ Configure variáveis de ambiente restantes
- ⏭️ Teste a aplicação completa

