# Configuração do Banco de Dados MySQL

## Pré-requisitos
- ✅ XAMPP instalado e rodando
- ✅ HeidiSQL instalado
- ✅ MySQL Server ativo (porta padrão 3306)

## Passo 1: Criar o Banco de Dados

### Usando HeidiSQL:

1. Abra o HeidiSQL
2. Conecte ao servidor MySQL local:
   - Host: `localhost` ou `127.0.0.1`
   - User: `root`
   - Password: (deixe vazio se for instalação padrão do XAMPP)
   - Port: `3306`

3. Clique com botão direito na lista de bancos de dados
4. Selecione "Create new" → "Database"
5. Nome do banco: `projeto_engenharia`
6. Charset: `utf8mb4`
7. Collation: `utf8mb4_unicode_ci`
8. Clique em OK

### Usando phpMyAdmin (alternativa):

1. Acesse: http://localhost/phpmyadmin
2. Clique em "New" na barra lateral
3. Nome do banco: `projeto_engenharia`
4. Collation: `utf8mb4_unicode_ci`
5. Clique em "Create"

## Passo 2: Executar o Schema SQL

### Usando HeidiSQL:

1. Selecione o banco `projeto_engenharia` na árvore à esquerda
2. Vá em "File" → "Load SQL file..."
3. Selecione o arquivo `schema.sql` desta pasta
4. Clique em "Execute" (botão azul com ▶️ ou F9)
5. Aguarde a execução (deve demorar alguns segundos)

### Usando phpMyAdmin:

1. Selecione o banco `projeto_engenharia`
2. Vá na aba "SQL"
3. Clique em "Choose File" e selecione `schema.sql`
4. Clique em "Go"

## Passo 3: Verificar a Instalação

Execute a seguinte query para verificar se as tabelas foram criadas:

```sql
SHOW TABLES;
```

**Resultado esperado (6 tabelas):**
- `users`
- `projects`
- `project_stages`
- `tasks`
- `task_assignments`
- `time_entries`

### Verificar Views:

```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

**Resultado esperado (3 views):**
- `vw_tasks_with_project`
- `vw_user_statistics`
- `vw_projects_at_risk`

### Verificar Triggers:

```sql
SHOW TRIGGERS;
```

**Resultado esperado:**
- `before_task_update_validate_hours`

### Verificar Stored Procedures:

```sql
SHOW PROCEDURE STATUS WHERE Db = 'projeto_engenharia';
```

**Resultado esperado:**
- `sp_calculate_project_deadline`

## Passo 4: Testar Dados de Exemplo

Execute para ver os usuários de exemplo:

```sql
SELECT id, email, full_name, role FROM users;
```

**Resultado esperado (6 usuários):**
- admin@engenharia.com (admin)
- supervisor1@engenharia.com (supervisor)
- supervisor2@engenharia.com (supervisor)
- eng1@engenharia.com (user)
- eng2@engenharia.com (user)
- eng3@engenharia.com (user)

**NOTA**: As senhas no schema são apenas exemplos. Você precisará gerar hashes reais usando bcrypt no backend.

## Passo 5: Testar a Stored Procedure

```sql
CALL sp_calculate_project_deadline(1);
```

Isso deve retornar informações sobre o prazo estimado do projeto de exemplo.

## Configuração do Backend (.env)

Após criar o banco, configure o arquivo `.env` do backend com:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=projeto_engenharia

# JWT
JWT_SECRET=seu_secret_super_seguro_aqui_mude_em_producao
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

## Troubleshooting

### Erro: "Access denied for user"
- Verifique se o usuário é `root`
- Verifique se a senha está correta (padrão XAMPP é vazia)
- Tente resetar a senha do MySQL

### Erro: "Can't connect to MySQL server"
- Verifique se o XAMPP está rodando
- Verifique se o módulo MySQL está ativo no XAMPP Control Panel
- Verifique se a porta 3306 não está bloqueada

### Erro: "Table already exists"
- O script tem `DROP TABLE IF EXISTS` no início
- Se quiser limpar tudo, execute:
  ```sql
  DROP DATABASE projeto_engenharia;
  CREATE DATABASE projeto_engenharia;
  ```

### Erro ao executar Trigger
- Certifique-se de usar MySQL 8.0+
- Verifique se os delimitadores estão corretos
- Execute os comandos de trigger separadamente se necessário

## Próximos Passos

Depois de configurar o banco:

1. ✅ Criar estrutura do backend (Node.js + Express)
2. ✅ Configurar conexão com MySQL
3. ✅ Implementar autenticação (JWT)
4. ✅ Criar rotas da API
5. ✅ Integrar frontend com backend

---

**Criado em**: 2026-01-02
