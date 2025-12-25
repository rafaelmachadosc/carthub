# 🚀 Instruções para Criar Repositório no GitHub

## Passo 1: Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha:
   - **Repository name**: `carthub` (ou outro nome de sua escolha)
   - **Description**: "CartHub - Gerenciador de Lista de Compras com Google OAuth"
   - **Visibility**: Público ou Privado (sua escolha)
   - ⚠️ **NÃO marque** nenhuma opção de inicialização (README, .gitignore, license)
5. Clique em **"Create repository"**
6. **Copie a URL** do repositório criado (ex: `https://github.com/seu-usuario/carthub.git`)

## Passo 2: Conectar Repositório Local ao GitHub

Abra o terminal/PowerShell no diretório `carthub` e execute:

```bash
# Verificar status do git
git status

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit: CartHub - Lista de Compras com Google OAuth"

# Adicionar remote (substitua pela URL do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/carthub.git

# Renomear branch para main (se necessário)
git branch -M main

# Enviar código para o GitHub
git push -u origin main
```

## Passo 3: Verificar

1. Acesse seu repositório no GitHub no navegador
2. Verifique se todos os arquivos foram enviados corretamente
3. Você deve ver as pastas `backend/` e `frontend/`

## Próximos Passos

Após criar o repositório no GitHub, siga com:
- **Etapa 2**: Configurar MongoDB Atlas (remoto)
- **Etapa 3**: Configurar Google OAuth
- **Etapa 4**: Configurar variáveis de ambiente
- **Etapa 5**: Instalar dependências e executar

Veja o arquivo `README.md` para instruções detalhadas de cada etapa.

