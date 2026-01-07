# Guia de Início Rápido

## 1. Configurar Supabase

### Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Aguarde a configuração do banco de dados (leva alguns minutos)

### Obter Credenciais

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie a **URL** do projeto
3. Copie a chave **anon/public** (não a service_role)

### Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua os valores:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

## 2. Aplicar Migrations

As migrations já foram aplicadas automaticamente ao criar o projeto. Você pode verificar se as tabelas foram criadas:

1. No Supabase, vá em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - profiles
   - projects
   - project_stages
   - tasks
   - task_assignments
   - time_entries

## 3. Criar Usuários de Teste

### Criar Primeiro Usuário (Admin)

1. Execute o projeto: `npm run dev`
2. Acesse a tela de login
3. Clique em "Criar Conta"
4. Preencha os dados:
   - Nome: Admin do Sistema
   - Email: admin@empresa.com
   - Senha: (escolha uma senha)
5. Clique em "Criar Conta"

### Promover Usuário a Admin

1. No Supabase, vá em **SQL Editor**
2. Execute o seguinte comando:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@empresa.com';
```

3. Faça logout e login novamente para as alterações terem efeito

### Criar Usuários Adicionais

Crie mais usuários com diferentes perfis:

**Supervisor:**
```sql
-- Crie a conta pela interface, depois execute:
UPDATE profiles
SET role = 'supervisor'
WHERE email = 'supervisor@empresa.com';
```

**Engenheiro/Técnico:**
```sql
-- Usuários criados pela interface já vêm como 'user' por padrão
-- Não é necessário atualizar
```

## 4. Criar Dados de Exemplo

### Opção 1: Via Interface (Recomendado)

Como Admin ou Supervisor, você pode criar projetos, etapas e tarefas diretamente pela interface do sistema (funcionalidade a ser implementada via modal/formulário).

### Opção 2: Via SQL

1. No Supabase, vá em **SQL Editor**
2. Primeiro, obtenha os IDs dos usuários:

```sql
SELECT id, email, role FROM profiles ORDER BY created_at;
```

3. Crie um projeto (substitua `supervisor-id` pelo ID real do supervisor):

```sql
INSERT INTO projects (name, description, status, supervisor_id, start_date, due_date)
VALUES (
  'Sistema de Monitoramento Industrial',
  'Desenvolvimento de sistema para monitoramento de equipamentos',
  'active',
  'supervisor-id-aqui',
  '2024-01-01',
  '2024-06-30'
)
RETURNING id;
```

4. Anote o ID retornado e crie etapas:

```sql
INSERT INTO project_stages (project_id, name, description, "order")
VALUES
  ('project-id-aqui', 'Planejamento', 'Levantamento de requisitos', 1),
  ('project-id-aqui', 'Desenvolvimento', 'Implementação', 2),
  ('project-id-aqui', 'Testes', 'Validação', 3),
  ('project-id-aqui', 'Implantação', 'Deploy', 4)
RETURNING id;
```

5. Crie tarefas nas etapas:

```sql
INSERT INTO tasks (stage_id, title, description, status, estimated_hours, daily_hours, priority, "order")
VALUES
  ('stage-id-aqui', 'Levantamento de Requisitos', 'Documentar requisitos técnicos', 'concluido', 40, 8, 'high', 1),
  ('stage-id-aqui', 'Arquitetura do Sistema', 'Definir arquitetura técnica', 'em_desenvolvimento', 30, 6, 'high', 2),
  ('stage-id-aqui', 'Revisão de Código', 'Corrigir problemas apontados', 'refaca', 20, 4, 'high', 3)
RETURNING id;
```

6. Atribua tarefas aos usuários:

```sql
INSERT INTO task_assignments (task_id, user_id)
VALUES
  ('task-id-aqui', 'user-id-aqui'),
  ('task-id-aqui-2', 'user-id-aqui');
```

7. Registre horas trabalhadas:

```sql
INSERT INTO time_entries (task_id, user_id, hours, date, notes)
VALUES
  ('task-id-aqui', 'user-id-aqui', 8, CURRENT_DATE - 1, 'Reunião e documentação'),
  ('task-id-aqui', 'user-id-aqui', 7.5, CURRENT_DATE, 'Finalização dos requisitos');
```

## 5. Testar o Sistema

### Como Admin
1. Faça login com o usuário admin
2. Você verá o Dashboard com métricas
3. Navegue pelo Kanban para ver as tarefas
4. Acesse Projetos para ver a estrutura completa
5. Vá em Monitoramento para ver os rankings

### Como Supervisor
1. Faça login com um supervisor
2. Acesse Dashboard e Kanban
3. Veja apenas seus projetos em Projetos

### Como User
1. Faça login como engenheiro/técnico
2. Você verá apenas a tela de Projetos
3. Visualize apenas as tarefas atribuídas a você

## 6. Funcionalidades Principais

### Dashboard
- Visualize métricas gerais
- Identifique projetos em risco
- Veja distribuição de status das tarefas

### Kanban
- Arraste tarefas entre colunas para mudar status
- Visualize todas as tarefas do sistema
- Identifique rapidamente tarefas em "Refaça"

### Projetos
- Expanda projetos para ver etapas
- Expanda etapas para ver tarefas
- Veja informações detalhadas de cada tarefa

### Monitoramento
- Ranking de desempenho dos engenheiros
- Métricas dos supervisores
- Indicadores de gargalos e sobrecarga

## Próximos Passos

Para expandir o sistema, considere adicionar:

- Formulários para criar/editar projetos, etapas e tarefas pela interface
- Sistema de notificações
- Relatórios e exportação de dados
- Timeline e gráficos de Gantt
- Comentários em tarefas
- Upload de arquivos/documentos
- Integração com calendário
- Notificações por email

## Suporte

Se encontrar problemas:

1. Verifique se as migrations foram aplicadas corretamente
2. Confirme que as variáveis de ambiente estão corretas
3. Verifique os logs do navegador (F12 → Console)
4. Verifique as políticas RLS no Supabase
