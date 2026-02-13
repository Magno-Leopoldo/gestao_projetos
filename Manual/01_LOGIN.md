# Manual - Tela de Login e Cadastro

**Versao:** 2.0
**Data:** 12/02/2026

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Login](#login)
3. [Cadastro de Novo Usuario](#cadastro-de-novo-usuario)
4. [Regras e Validacoes](#regras-e-validacoes)
5. [Problemas Comuns](#problemas-comuns)

---

## Visao Geral

A tela de Login e a porta de entrada do sistema. Aqui o usuario pode:

- Fazer login com email e senha
- Criar uma nova conta (cadastro)
- Alternar entre os modos Login e Cadastro

---

## Login

### Como acessar

1. Abra o sistema no navegador
2. A tela de login sera exibida automaticamente
3. Preencha os campos:
   - **Email:** seu email cadastrado
   - **Senha:** sua senha

4. Clique em **"Entrar"**

### Apos o login

- **Supervisor/Admin:** sera redirecionado para o **Dashboard**
- **Usuario:** sera redirecionado para a lista de **Projetos**

### Estrutura da tela

```
+------------------------------------------+
|                                          |
|        GESTAO DE PROJETOS                |
|                                          |
|   +----------------------------------+   |
|   |  Email                           |   |
|   +----------------------------------+   |
|   |  Senha                           |   |
|   +----------------------------------+   |
|                                          |
|   [ ========= ENTRAR ========= ]        |
|                                          |
|   Nao tem conta? Cadastre-se             |
|                                          |
+------------------------------------------+
```

---

## Cadastro de Novo Usuario

### Como se cadastrar

1. Na tela de login, clique em **"Cadastre-se"**
2. Preencha os campos:
   - **Nome completo:** seu nome
   - **Email:** email valido
   - **Senha:** minimo 6 caracteres

3. Clique em **"Cadastrar"**

### Apos o cadastro

- A conta e criada com o perfil **Usuario** (padrao)
- O usuario ja e logado automaticamente
- Um administrador pode alterar o perfil depois (Configuracoes)

---

## Regras e Validacoes

| Campo | Regra |
|-------|-------|
| Email | Deve ser um email valido e unico no sistema |
| Senha | Minimo de 6 caracteres |
| Nome | Obrigatorio no cadastro |

### Mensagens de erro comuns

| Mensagem | Causa |
|----------|-------|
| "Credenciais invalidas" | Email ou senha incorretos |
| "Email ja cadastrado" | Ja existe uma conta com esse email |
| "Preencha todos os campos" | Campos obrigatorios vazios |

---

## Problemas Comuns

### Esqueci minha senha
- Um administrador pode redefinir sua senha na tela de **Configuracoes**
- Solicite ao admin do sistema

### Minha conta esta inativa
- Um administrador pode ter desativado sua conta
- Entre em contato com o admin para reativar

### Nao consigo me cadastrar
- Verifique se o email ja esta em uso
- Verifique se a senha tem pelo menos 6 caracteres
