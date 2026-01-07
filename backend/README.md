# Backend - Sistema de Gestão de Projetos de Engenharia

## 🚀 Instalação e Configuração

### 1. Instalar Dependências

Abra o terminal nesta pasta e execute:

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env` já está criado com as configurações padrão. Se precisar ajustar:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=projeto_engenharia

JWT_SECRET=seu_secret_super_seguro_mude_em_producao_12345
JWT_EXPIRES_IN=24h
```

### 3. Iniciar o Servidor

**Modo Desenvolvimento** (com auto-reload):
```bash
npm run dev
```

**Modo Produção**:
```bash
npm start
```

O servidor iniciará em: **http://localhost:3000**

---

## 📡 Rotas da API

### Health Check
```
GET http://localhost:3000/health
```

### Autenticação

#### Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@engenharia.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "admin@engenharia.com",
      "full_name": "Administrador Sistema",
      "role": "admin"
    }
  }
}
```

#### Registrar Novo Usuário
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "novo@engenharia.com",
  "password": "senha123456",
  "full_name": "João da Silva"
}
```

#### Refresh Token
```http
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Obter Dados do Usuário Logado
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer eyJhbGc...
```

#### Logout
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer eyJhbGc...
```

---

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)** para autenticação.

### Como Usar

1. Faça login para obter o `accessToken`
2. Inclua o token no header de requisições protegidas:
   ```
   Authorization: Bearer seu_token_aqui
   ```

### Tokens

- **Access Token**: Expira em 24 horas
- **Refresh Token**: Expira em 7 dias (use para obter novo access token)

---

## ⚠️ IMPORTANTE: Atualizar Senhas no Banco

As senhas de exemplo no banco de dados precisam ser atualizadas com hashes válidos.

Execute este script no MySQL:

```sql
-- Gerar senhas com bcrypt (senha: senha123)
UPDATE users SET password_hash = '$2b$10$rOmYmV5O5n5K5K5K5K5K5.E5K5K5K5K5K5K5K5K5K5K5K5K5K5'
WHERE email = 'admin@engenharia.com';

-- Ou crie um novo usuário via API usando /api/auth/register
```

**Ou use a rota de registro** para criar usuários com senhas válidas.

---

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração MySQL
│   ├── controllers/
│   │   └── authController.js    # Lógica de autenticação
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticação/autorização
│   │   └── errorHandler.js      # Tratamento de erros
│   ├── routes/
│   │   └── authRoutes.js        # Rotas de autenticação
│   └── server.js                # Arquivo principal
├── .env                         # Variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## 🧪 Testar a API

### Usando cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@engenharia.com\",\"password\":\"senha123\"}"
```

### Usando Postman ou Insomnia

Importe as requisições manualmente ou crie uma collection com as rotas acima.

---

## 🛠️ Próximos Passos

Após o backend estar funcionando:

1. ✅ Criar rotas de **Projetos**
2. ✅ Criar rotas de **Etapas**
3. ✅ Criar rotas de **Tarefas**
4. ✅ Implementar validação de **limite de 8h/dia**
5. ✅ Implementar **cálculo de prazo** de projetos
6. ✅ Criar rotas de **Dashboard**
7. ✅ Criar rotas de **Monitoramento** (Admin)

---

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (auto-reload)

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to MySQL"
- Verifique se o XAMPP está rodando
- Verifique se o MySQL está ativo no XAMPP Control Panel
- Verifique as credenciais no `.env`

### Erro: "Table doesn't exist"
- Execute o script `schema.sql` no banco de dados
- Verifique se o banco `projeto_engenharia` foi criado

### Erro: "Port 3000 already in use"
- Altere a porta no `.env`: `PORT=3001`
- Ou pare o processo que está usando a porta 3000

---

**Versão**: 1.0.0
**Criado em**: 2026-01-02
