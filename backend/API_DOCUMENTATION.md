# 📚 Documentação da API - Sistema de Gestão de Projetos

**Base URL**: `http://localhost:3000`

---

## 🔐 Autenticação

Todas as rotas (exceto login e register) requerem autenticação via JWT.

**Header obrigatório:**
```
Authorization: Bearer {seu_token_aqui}
```

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Projetos](#projetos)
3. [Etapas](#etapas)
4. [Tarefas](#tarefas)
5. [Dashboard](#dashboard)

---

## 1. Autenticação

### POST /api/auth/login
Fazer login e obter token JWT.

**Body:**
```json
{
  "email": "admin@engenharia.com",
  "password": "senha123"
}
```

**Response 200:**
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

**Usuários de teste:**
- `admin@engenharia.com` - Admin
- `supervisor1@engenharia.com` - Supervisor
- `eng1@engenharia.com` - User

Todos com senha: `senha123`

---

### POST /api/auth/register
Criar novo usuário.

**Body:**
```json
{
  "email": "novo@engenharia.com",
  "password": "senha12345",
  "full_name": "João da Silva"
}
```

---

### GET /api/auth/me
Obter dados do usuário logado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@engenharia.com",
      "full_name": "Administrador Sistema",
      "role": "admin",
      "is_active": true
    }
  }
}
```

---

## 2. Projetos

### GET /api/projects
Listar projetos (filtrados por permissão).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params (opcionais):**
- `status` - Filtrar por status (active, completed, on_hold, cancelled)
- `search` - Buscar por nome

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sistema de Gestão Interna",
      "description": "Desenvolvimento de sistema web",
      "status": "active",
      "supervisor_id": 2,
      "supervisor_name": "João Silva",
      "start_date": "2026-01-02",
      "due_date": "2026-03-31",
      "total_stages": 3,
      "total_tasks": 5,
      "completed_tasks": 1
    }
  ]
}
```

**Permissões:**
- **User**: Vê apenas projetos onde tem tarefas
- **Supervisor**: Vê apenas seus projetos
- **Admin**: Vê todos

---

### GET /api/projects/:id
Obter detalhes de um projeto.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sistema de Gestão Interna",
    "description": "...",
    "status": "active",
    "supervisor_id": 2,
    "supervisor_name": "João Silva",
    "supervisor_email": "supervisor1@engenharia.com",
    "start_date": "2026-01-02",
    "due_date": "2026-03-31",
    "created_at": "2026-01-02T10:00:00.000Z",
    "updated_at": "2026-01-02T10:00:00.000Z"
  }
}
```

---

### POST /api/projects
Criar novo projeto (Supervisor/Admin).

**Body:**
```json
{
  "name": "Projeto Novo",
  "description": "Descrição do projeto",
  "start_date": "2026-01-15",
  "due_date": "2026-06-30"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Projeto criado com sucesso",
  "data": {
    "id": 2,
    "name": "Projeto Novo",
    "status": "active",
    "supervisor_id": 2,
    ...
  }
}
```

**Validações:**
- Nome obrigatório
- Data final obrigatória
- Data final > data início

---

### PUT /api/projects/:id
Atualizar projeto (Supervisor/Admin).

**Body (todos opcionais):**
```json
{
  "name": "Nome Atualizado",
  "description": "Nova descrição",
  "status": "active",
  "start_date": "2026-01-20",
  "due_date": "2026-07-30"
}
```

---

### DELETE /api/projects/:id
Deletar projeto (Supervisor/Admin).

**Response 200:**
```json
{
  "success": true,
  "message": "Projeto deletado com sucesso"
}
```

⚠️ **Atenção**: Deleta CASCADE (etapas e tarefas também)

---

### GET /api/projects/:id/risk
Calcular risco de atraso do projeto.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "project_id": 1,
    "project_name": "Sistema de Gestão Interna",
    "defined_due_date": "2026-03-31",
    "estimated_completion_date": "2026-04-15",
    "risk_status": "AT_RISK",
    "sequential_days": 20,
    "parallel_days": 10,
    "total_estimated_days": 30,
    "days_until_due": 88
  }
}
```

**Risk Status:**
- `ON_TRACK` - No prazo
- `WARNING` - Menos de 7 dias até prazo
- `AT_RISK` - Prazo estimado > prazo definido
- `DELAYED` - Prazo já passou
- `NO_DEADLINE` - Sem prazo definido

---

## 3. Etapas (Project Stages)

### GET /api/stages/project/:projectId
Listar etapas de um projeto.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "name": "Análise de Requisitos",
      "description": "Levantamento de requisitos",
      "order": 1,
      "is_parallel": false,
      "total_tasks": 2,
      "completed_tasks": 1
    }
  ]
}
```

---

### POST /api/stages/project/:projectId
Criar etapa (Supervisor/Admin).

**Body:**
```json
{
  "name": "Nova Etapa",
  "description": "Descrição da etapa",
  "is_parallel": false
}
```

**Campos:**
- `name` - Obrigatório
- `description` - Opcional
- `is_parallel` - Se TRUE, tarefas podem ser paralelas (default: false)

---

### PUT /api/stages/:id
Atualizar etapa.

### DELETE /api/stages/:id
Deletar etapa (e todas as tarefas CASCADE).

---

## 4. Tarefas (Tasks)

### GET /api/tasks/stage/:stageId
Listar tarefas de uma etapa.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "stage_id": 1,
      "title": "Reunião com stakeholders",
      "description": "Levantar requisitos",
      "status": "concluido",
      "estimated_hours": 16,
      "daily_hours": 4,
      "priority": "high",
      "order": 1,
      "assignee_ids": "4,5",
      "assignees": "Pedro Oliveira, Ana Costa"
    }
  ]
}
```

---

### GET /api/tasks/:id
Obter detalhes de uma tarefa.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Reunião com stakeholders",
    "status": "concluido",
    "estimated_hours": 16,
    "daily_hours": 4,
    "stage_name": "Análise de Requisitos",
    "project_id": 1,
    "project_name": "Sistema de Gestão Interna",
    "assignees": [
      {
        "id": 4,
        "email": "eng1@engenharia.com",
        "full_name": "Pedro Oliveira",
        "role": "user"
      }
    ]
  }
}
```

---

### POST /api/tasks/stage/:stageId
Criar tarefa (Supervisor/Admin).

**Body:**
```json
{
  "title": "Nova Tarefa",
  "description": "Descrição da tarefa",
  "estimated_hours": 20,
  "daily_hours": 3,
  "priority": "medium",
  "due_date": "2026-02-15",
  "assigned_user_ids": [4, 5]
}
```

**Validações CRÍTICAS:**
- ✅ `estimated_hours` > 0 (obrigatório)
- ✅ `daily_hours` entre 0 e 8
- ✅ `daily_hours` <= `estimated_hours`
- ✅ **Limite de 8h/dia por usuário** (soma de todas as tarefas ativas)

**Prioridades:**
- `low`, `medium`, `high`

**Response 400 (se exceder 8h):**
```json
{
  "success": false,
  "error": "DAILY_LIMIT_EXCEEDED",
  "message": "Um ou mais usuários excederam o limite de 8 horas diárias",
  "details": [
    {
      "user_id": 4,
      "user_name": "Pedro Oliveira",
      "current_hours": 6,
      "requested_hours": 3,
      "available_hours": 2
    }
  ]
}
```

---

### PUT /api/tasks/:id
Atualizar tarefa.

**Permissões:**
- **User**: Pode editar se está atribuído
- **Supervisor/Admin**: Pode editar qualquer tarefa de seus projetos

---

### PATCH /api/tasks/:id/status
Alterar status da tarefa (com validação de transição).

**Body:**
```json
{
  "status": "em_desenvolvimento",
  "reason": "Opcional (obrigatório para 'refaca')"
}
```

**Status válidos:**
- `novo`
- `em_desenvolvimento`
- `analise_tecnica`
- `concluido`
- `refaca`

**Matriz de Transição:**

| De → Para | novo | em_desenv | analise | concluido | refaca |
|-----------|------|-----------|---------|-----------|--------|
| **novo** | ✅ | ✅ User | ❌ | ❌ | ❌ |
| **em_desenv** | ✅ User | ✅ | ✅ Sup | ❌ | ❌ |
| **analise** | ❌ | ❌ | ✅ | ✅ Sup | ✅ Sup |
| **concluido** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **refaca** | ❌ | ✅ User | ❌ | ❌ | ✅ |

**Response 403 (transição inválida):**
```json
{
  "success": false,
  "error": "INVALID_TRANSITION",
  "message": "Usuários com role 'user' não podem mover tarefas de 'em_desenvolvimento' para 'analise_tecnica'",
  "details": {
    "is_valid": false,
    "from_status": "em_desenvolvimento",
    "to_status": "analise_tecnica",
    "user_role": "user"
  }
}
```

---

### POST /api/tasks/:id/assign
Atribuir usuários à tarefa (Supervisor/Admin).

**Body:**
```json
{
  "user_ids": [4, 5, 6]
}
```

**Validação:**
- Verifica limite de 8h/dia para cada usuário
- Retorna sucesso/falha individual

---

### DELETE /api/tasks/:taskId/assign/:userId
Remover usuário da tarefa.

---

### DELETE /api/tasks/:id
Deletar tarefa.

---

## 5. Dashboard

### GET /api/dashboard/stats
Estatísticas do dashboard (Supervisor/Admin).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "open_projects": 5,
    "at_risk_projects": 2,
    "active_users": 12,
    "refaca_tasks": 3,
    "status_distribution": [
      {
        "status": "novo",
        "count": 10,
        "percentage": "20.0"
      },
      {
        "status": "em_desenvolvimento",
        "count": 15,
        "percentage": "30.0"
      }
    ],
    "recent_tasks": [...]
  }
}
```

**Filtragem:**
- **Supervisor**: Vê apenas dados de seus projetos
- **Admin**: Vê dados de todos os projetos

---

### GET /api/dashboard/my-tasks
Tarefas do usuário logado (todos).

**Query Params:**
- `status` - Filtrar por status (opcional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "Documentar requisitos",
      "status": "em_desenvolvimento",
      "estimated_hours": 24,
      "daily_hours": 3,
      "stage_name": "Análise de Requisitos",
      "project_name": "Sistema de Gestão Interna",
      "project_id": 1
    }
  ]
}
```

⚠️ Tarefas com status `refaca` aparecem primeiro!

---

### GET /api/dashboard/my-hours
Horas alocadas do usuário (todos).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 2,
        "title": "Documentar requisitos",
        "daily_hours": 3,
        "status": "em_desenvolvimento",
        "stage_name": "Análise",
        "project_name": "Sistema X"
      },
      {
        "id": 5,
        "title": "Criar componentes",
        "daily_hours": 4,
        "status": "novo",
        "stage_name": "Frontend",
        "project_name": "Sistema X"
      }
    ],
    "total_hours": 7,
    "available_hours": 1,
    "max_hours": 8,
    "is_at_limit": false
  }
}
```

---

## 🔧 Códigos de Erro

| Código | Erro | Descrição |
|--------|------|-----------|
| 400 | MISSING_FIELDS | Campos obrigatórios faltando |
| 400 | INVALID_HOURS | Horas inválidas |
| 400 | DAILY_LIMIT_EXCEEDED | Limite de 8h/dia excedido |
| 401 | UNAUTHORIZED | Token ausente ou inválido |
| 401 | TOKEN_EXPIRED | Token expirado |
| 403 | FORBIDDEN | Sem permissão |
| 403 | INVALID_TRANSITION | Transição de status inválida |
| 404 | NOT_FOUND | Recurso não encontrado |
| 409 | EMAIL_ALREADY_EXISTS | Email já cadastrado |

---

## 📝 Notas Importantes

1. **Validação de 8h/dia**: Sempre validada ao criar/editar tarefa ou atribuir usuário
2. **Transição de Status**: Matriz de transição é aplicada rigidamente
3. **Permissões**: Users veem apenas seus dados, Supervisors seus projetos, Admin tudo
4. **Cascade Delete**: Deletar projeto remove etapas e tarefas
5. **Status Refaça**: Tem prioridade máxima em todas as listagens

---

**Versão**: 1.0
**Data**: 2026-01-02
