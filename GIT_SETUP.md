# ⚙️ Configuração do Git e Push para GitHub

## 1. Configurar sua identidade no Git

Primeiro, configure seu nome e email (substitua pelos seus dados reais):

```bash
git config --global user.name "rafaelmacha"
git config --global user.email "sabrinefachini.adm@gmail.com"
```

**Importante:** Use o mesmo email associado à sua conta do GitHub.

## 2. Criar Repositório no GitHub

1. Acesse https://github.com e faça login
2. Clique no botão **"+"** > **"New repository"**
3. Preencha:
   - **Repository name**: `carthub`
   - **Description**: "CartHub - Gerenciador de Lista de Compras"
   - **Visibility**: Público ou Privado
   - ⚠️ **NÃO marque** README, .gitignore ou license
4. Clique em **"Create repository"**
5. **Copie a URL** do repositório (ex: `https://github.com/rafaelmachado/carthub.git`)

## 3. Executar comandos Git

No terminal, dentro do diretório `carthub`, execute:

```bash
# Verificar se já configurou nome e email
git config user.name
git config user.email

# Se não estiver configurado, execute:
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Initial commit: CartHub - Lista de Compras com Google OAuth"

# Renomear branch para main
git branch -M main

# Adicionar remote (SUBSTITUA pela URL do SEU repositório)
git remote add origin https://github.com/SEU-USUARIO/carthub.git

# Verificar remote
git remote -v

# Push para GitHub
git push -u origin main
```

## 4. Autenticação no GitHub

Se pedir autenticação, você pode usar:
- **Personal Access Token (recomendado)**
  - GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
  - Generate new token
  - Marque: `repo` (Full control of private repositories)
  - Copie o token e use como senha quando pedir

Ou configure SSH:
- GitHub > Settings > SSH and GPG keys > New SSH key
- Siga as instruções para gerar e adicionar a chave SSH

## 5. Verificar

Após o push, acesse seu repositório no GitHub e verifique se todos os arquivos foram enviados.

