# 📤 Instruções para Fazer Push ao GitHub

## Problema: Autenticação Necessária

O repositório existe no GitHub, mas você precisa se autenticar para fazer push.

## Solução: Usar Personal Access Token

### 1. Criar Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** > **"Generate new token (classic)"**
3. Configure:
   - **Note**: `carthub-push` (ou qualquer nome)
   - **Expiration**: Escolha uma data (ex: 90 dias ou No expiration)
   - **Scopes**: Marque `repo` (Full control of private repositories)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você não verá novamente!)

### 2. Fazer Push Usando o Token

Execute no terminal:

```bash
cd "C:\Users\Rafael Machado\Documents\carthub"
git push -u origin main
```

Quando pedir:
- **Username**: `rafaelmachadosc`
- **Password**: Cole o token que você copiou (NÃO sua senha do GitHub!)

### 3. Alternativa: Configurar Credential Helper (Windows)

Para não precisar digitar o token toda vez:

```bash
git config --global credential.helper wincred
```

Depois, ao fazer push, use:
- Username: `rafaelmachadosc`
- Password: Seu token

O Windows salvará suas credenciais.

### 4. Alternativa: Usar SSH (Mais Seguro)

Se preferir usar SSH:

1. Gerar chave SSH:
```bash
ssh-keygen -t ed25519 -C "sabrinefachini.adm@gmail.com"
```

2. Adicionar chave ao GitHub:
   - Copie o conteúdo de `C:\Users\Rafael Machado\.ssh\id_ed25519.pub`
   - Vá em: https://github.com/settings/keys
   - Clique em "New SSH key"
   - Cole a chave

3. Mudar remote para SSH:
```bash
git remote set-url origin git@github.com:rafaelmachadosc/carthub.git
git push -u origin main
```

## Verificar Push Bem-Sucedido

Após o push, acesse: https://github.com/rafaelmachadosc/carthub

Você deve ver todos os arquivos (backend/, frontend/, README.md, etc.)

