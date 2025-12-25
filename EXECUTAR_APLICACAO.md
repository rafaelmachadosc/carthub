# 🚀 Como Executar a Aplicação CartHub

## ✅ Configuração Completa!

Tudo está configurado:
- ✅ MongoDB Atlas (remoto)
- ✅ Google OAuth 2.0
- ✅ Variáveis de ambiente (backend e frontend)

## 📋 Executar a Aplicação

### 1. Terminal 1 - Backend

Abra um terminal e execute:

```bash
cd "C:\Users\Rafael Machado\Documents\carthub\backend"
npm run dev
```

**Você deve ver:**
```
✅ MongoDB connected successfully
🚀 Servidor rodando na porta 3001
📡 Ambiente: development
```

### 2. Terminal 2 - Frontend

Abra OUTRO terminal e execute:

```bash
cd "C:\Users\Rafael Machado\Documents\carthub\frontend"
npm run dev
```

**Você deve ver:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🌐 Acessar a Aplicação

1. Abra o navegador
2. Acesse: **http://localhost:5173**
3. Você verá a tela de login com botão "Entrar com Google"
4. Clique no botão e faça login com sua conta Google

## 🧪 Testar Funcionalidades

Após fazer login:
- ✅ Adicionar itens à lista de compras
- ✅ Ajustar quantidades (+/-)
- ✅ Adicionar preços aos produtos
- ✅ Marcar itens como comprados
- ✅ Finalizar compra
- ✅ Ver histórico no Dashboard
- ✅ Ver gráficos e estatísticas

## ⚠️ Importante

- Mantenha AMBOS os terminais rodando (backend e frontend)
- O backend deve estar rodando antes do frontend
- Se der erro de conexão, verifique se o backend está na porta 3001

## 🛑 Parar a Aplicação

Para parar os servidores:
- No terminal, pressione: `Ctrl + C`

## 📝 Próximos Passos

Após testar localmente:
- Deploy do backend (ex: Heroku, Railway, Render)
- Deploy do frontend (ex: Vercel, Netlify)
- Atualizar URLs no Google Cloud Console para produção

