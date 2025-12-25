# 🚀 Guia de Deploy - CartHub

## Status do Projeto para Deploy

✅ **Backend**: Pronto para deploy
✅ **Frontend**: Pronto para deploy
✅ **Banco de Dados**: MongoDB Atlas configurado e funcionando
✅ **Autenticação**: Google OAuth configurado

---

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de que:

1. ✅ MongoDB Atlas está configurado e funcionando
2. ✅ Google OAuth 2.0 está configurado
3. ✅ Variáveis de ambiente estão definidas
4. ✅ Código está no GitHub

---

## 🌐 Deploy no Cloudflare

### Opção 1: Cloudflare Pages (Frontend) + Cloudflare Workers (Backend)

#### 1.1 Deploy do Frontend (Cloudflare Pages)

1. **Acesse Cloudflare Dashboard**
   - https://dash.cloudflare.com/

2. **Vá para Pages**
   - Clique em "Workers & Pages" → "Create application" → "Pages" → "Connect to Git"

3. **Conecte seu repositório GitHub**
   - Selecione o repositório `carthub`
   - Branch: `main` ou `master`

4. **Configure o Build**
   - **Framework preset**: Vite
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `frontend`

5. **Variáveis de Ambiente (Environment Variables)**
   ```
   VITE_GOOGLE_CLIENT_ID=seu-google-client-id
   VITE_API_URL=https://seu-backend.workers.dev
   ```

6. **Deploy!**
   - Clique em "Save and Deploy"
   - Seu frontend estará disponível em: `https://seu-projeto.pages.dev`

#### 1.2 Deploy do Backend (Cloudflare Workers)

**Nota**: Cloudflare Workers tem limitações. Para Node.js completo, considere outras opções.

**Alternativas para Backend:**
- ✅ **Render.com** (Recomendado - Gratuito)
- ✅ **Railway.app** (Recomendado - Tem plano gratuito)
- ✅ **Vercel** (Tem suporte Node.js)
- ✅ **Heroku** (Pago)
- ✅ **DigitalOcean App Platform**

---

## 🎯 Deploy Recomendado: Render.com (Backend) + Cloudflare Pages (Frontend)

### 2.1 Backend no Render.com

1. **Acesse**: https://render.com/

2. **Crie uma conta** (pode usar GitHub)

3. **Crie um novo Web Service**
   - "New +" → "Web Service"
   - Conecte seu repositório GitHub

4. **Configure o serviço**:
   - **Name**: `carthub-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend`

5. **Variáveis de Ambiente** (Environment Variables):
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=sua-uri-do-mongodb-atlas
   JWT_SECRET=seu-jwt-secret-forte-aqui
   GOOGLE_CLIENT_ID=seu-google-client-id
   GOOGLE_CLIENT_SECRET=seu-google-client-secret
   FRONTEND_URL=https://seu-projeto.pages.dev
   ```

6. **Deploy!**
   - Render fornecerá uma URL: `https://carthub-backend.onrender.com`

7. **⚠️ IMPORTANTE**: Render suspende serviços gratuitos após inatividade
   - Primeira requisição pode demorar ~30s para "acordar"
   - Para produção, considere plano pago ou mantenha o serviço ativo

### 2.2 Atualizar Frontend no Cloudflare Pages

1. **Atualize a variável de ambiente**:
   ```
   VITE_API_URL=https://carthub-backend.onrender.com
   ```

2. **Redeploy** no Cloudflare Pages

---

## 🔧 Outras Opções de Deploy

### Railway.app (Backend)

1. Acesse: https://railway.app/
2. "New Project" → "Deploy from GitHub repo"
3. Selecione o repositório
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Adicione as mesmas variáveis de ambiente do Render
6. Railway fornece URL automática: `https://seu-projeto.up.railway.app`

### Vercel (Backend)

1. Acesse: https://vercel.com/
2. "Add New" → "Project"
3. Importe o repositório
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Adicione variáveis de ambiente
6. Deploy!

---

## 🔐 Atualizar Google OAuth após Deploy

Após fazer o deploy, você precisa atualizar as URLs autorizadas no Google Cloud Console:

1. Acesse: https://console.cloud.google.com/
2. Vá em "APIs & Services" → "Credentials"
3. Edite seu OAuth 2.0 Client ID
4. Adicione nas **Authorized JavaScript origins**:
   ```
   https://seu-projeto.pages.dev
   ```
5. Adicione nas **Authorized redirect URIs**:
   ```
   https://seu-projeto.pages.dev
   ```

---

## ✅ Checklist Final

- [ ] Backend deployado e acessível
- [ ] Frontend deployado no Cloudflare Pages
- [ ] Variáveis de ambiente configuradas em ambos
- [ ] MongoDB Atlas permitindo conexões de qualquer IP (0.0.0.0/0)
- [ ] Google OAuth atualizado com URL de produção
- [ ] Testar login no ambiente de produção
- [ ] Testar criação de listas
- [ ] Testar finalização de compras

---

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique logs no serviço de deploy
- Certifique-se que `npm run build` está gerando a pasta `dist`

### Frontend não conecta ao backend
- Verifique `VITE_API_URL` no Cloudflare Pages
- Verifique CORS no backend (deve aceitar URL do frontend)
- Verifique se o backend está rodando

### Erro de autenticação Google
- Verifique se as URLs autorizadas no Google Cloud incluem a URL de produção
- Verifique `VITE_GOOGLE_CLIENT_ID` no frontend

### MongoDB connection error
- Verifique `MONGODB_URI`
- Verifique Network Access no MongoDB Atlas (deve permitir 0.0.0.0/0 ou IP do servidor)

---

## 📝 Comandos Úteis

### Build local para testar
```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
npm run preview
```

---

## 🌍 URLs de Produção

Após o deploy, você terá:
- **Frontend**: `https://seu-projeto.pages.dev`
- **Backend**: `https://seu-backend.onrender.com` (ou outro)

**Compartilhe a URL do frontend para começar a usar!** 🎉

