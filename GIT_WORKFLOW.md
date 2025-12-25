# 🌿 Git Workflow - CartHub

## Branches Configuradas

✅ **`main`** - Branch de produção (deploy automático no Render)
✅ **`dev`** - Branch de desenvolvimento/testes

## 📋 Status Atual

- ✅ Branch `dev` criada localmente
- ✅ Alterações commitadas na branch `dev`
- ✅ Branch `main` atualizada com as alterações da `dev`
- ⚠️ **Falta fazer push para o GitHub**

---

## 🔐 Fazer Push (Precisa de Autenticação)

### Opção 1: Push com Token (Recomendado)

Quando executar `git push`, o Git vai pedir credenciais:

1. **Username**: `rafaelmachadosc`
2. **Password**: Use seu Personal Access Token do GitHub

Se você não tem um token ou ele expirou:
- Acesse: https://github.com/settings/tokens
- Clique em "Generate new token (classic)"
- Marque as permissões: `repo` (acesso completo aos repositórios)
- Gere e copie o token (ele aparece apenas uma vez!)

### Opção 2: Configurar Token no URL (Temporário)

```bash
git remote set-url origin https://SEU_TOKEN@github.com/rafaelmachadosc/carthub.git
```

Depois volte ao normal:
```bash
git remote set-url origin https://github.com/rafaelmachadosc/carthub.git
```

---

## 📤 Comandos para Fazer Push Agora

Execute estes comandos no terminal:

```bash
cd "C:\Users\Rafael Machado\Documents\carthub"

# Push da branch dev
git checkout dev
git push -u origin dev

# Push da branch main (produção)
git checkout main
git push origin main
```

Quando pedir credenciais, use:
- **Username**: `rafaelmachadosc`
- **Password**: Seu Personal Access Token do GitHub

---

## 🔄 Workflow de Trabalho

### Para Desenvolvimento/Testes

1. **Trabalhar na branch dev**:
   ```bash
   git checkout dev
   # Faça suas alterações
   git add .
   git commit -m "sua mensagem"
   git push origin dev
   ```

2. **Testar localmente** antes de fazer merge

### Para Produção

1. **Quando estiver tudo testado na dev**, faça merge para main:
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

2. **O Render detecta automaticamente** mudanças na `main` e faz deploy

---

## 🔧 Configurar Render para Usar Branch Correta

No Render:
1. Vá em "Settings" do seu serviço
2. Em "Build & Deploy"
3. Configure:
   - **Branch**: `main` (para produção) ou `dev` (para testes)
   - **Auto-Deploy**: Yes (deploy automático quando houver push)

---

## ✅ Checklist de Push

- [ ] Token do GitHub gerado/configurado
- [ ] Branch `dev` faz push com sucesso
- [ ] Branch `main` faz push com sucesso
- [ ] Render configurado para fazer deploy da branch correta

---

## 🆘 Troubleshooting

### Erro: "Repository not found"
- Verifique se o token está correto
- Verifique se o token tem permissão `repo`
- Gere um novo token se necessário

### Erro: "Authentication failed"
- Token pode estar expirado
- Gere um novo token em: https://github.com/settings/tokens

### Esqueceu o token?
- Acesse: https://github.com/settings/tokens
- Gere um novo token com permissão `repo`

