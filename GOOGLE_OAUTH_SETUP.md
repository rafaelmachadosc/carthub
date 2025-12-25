# 🔐 Configuração do Google OAuth 2.0

## Passo a Passo Completo

### 1. Acessar Google Cloud Console

**Link direto:** https://console.cloud.google.com/

### 2. Criar um Novo Projeto

1. Clique no seletor de projeto no topo (ao lado do logo do Google Cloud)
2. Clique em **"New Project"**
3. Preencha:
   - **Project name**: `CartHub` (ou outro nome)
   - **Organization**: Deixe como está (ou selecione se tiver)
   - **Location**: Deixe como está
4. Clique em **"Create"**
5. Aguarde alguns segundos e selecione o projeto criado

### 3. Ativar Google Sign-In API

**Link direto para APIs:** https://console.cloud.google.com/apis/library

1. Na barra de busca, digite: `Google Sign-In API`
2. Ou acesse diretamente: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com
3. Clique em **"Enable"** (ou "Ativar")

**Alternativa:** Procure por "Google+ API" ou "Identity Toolkit API" e ative também.

### 4. Criar Credenciais OAuth 2.0

**Link direto para credenciais:** https://console.cloud.google.com/apis/credentials

1. Clique em **"Create Credentials"** (ou "Criar credenciais")
2. Selecione **"OAuth client ID"**
3. Se for a primeira vez, você verá a tela de **"OAuth consent screen"**:
   - **User Type**: Escolha **"External"** (para desenvolvimento)
   - Clique em **"Create"**
   - **App name**: `CartHub`
   - **User support email**: Seu email
   - **Developer contact information**: Seu email
   - Clique em **"Save and Continue"**
   - Em **Scopes**: Clique em **"Save and Continue"** (pode deixar padrão)
   - Em **Test users**: Adicione seu email do Google (o que você vai usar para testar)
   - Clique em **"Save and Continue"**
   - Revise e clique em **"Back to Dashboard"**

4. Agora volte para **Credentials** e clique em **"Create Credentials"** > **"OAuth client ID"**
5. Configure:
   - **Application type**: **"Web application"**
   - **Name**: `CartHub Web Client`
   - **Authorized JavaScript origins**: 
     - Adicione: `http://localhost:5173`
     - (Para produção, adicione sua URL depois)
   - **Authorized redirect URIs**: 
     - Adicione: `http://localhost:5173`
     - (Para produção, adicione sua URL depois)
6. Clique em **"Create"**
7. **COPIE** o **Client ID** e **Client Secret** que aparecerem
   - ⚠️ **IMPORTANTE**: Anote esses valores, você precisará deles!

### 5. Configurar no Backend

Edite o arquivo `backend/.env` e substitua:

```env
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
```

### 6. Configurar no Frontend

Crie o arquivo `frontend/.env` com:

```env
VITE_GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001
```

**⚠️ IMPORTANTE**: O Client ID deve ser o MESMO no backend e frontend!

## Links Rápidos

- **Google Cloud Console**: https://console.cloud.google.com/
- **Criar Projeto**: https://console.cloud.google.com/projectcreate
- **APIs Library**: https://console.cloud.google.com/apis/library
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent

## Próximos Passos

Após configurar o Google OAuth:
1. ✅ Atualizar arquivos `.env` com Client ID e Secret
2. ✅ Instalar dependências do frontend
3. ✅ Testar login com Google
4. ✅ Testar aplicação completa

