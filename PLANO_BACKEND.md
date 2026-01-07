# 🔧 PLANO DE IMPLEMENTAÇÃO - BACKEND

## 📌 Visão Geral

Este documento detalha **passo a passo** como implementar o backend para suportar as 4 telas do Projects com o novo sistema de Play/Pause/Stop, cálculos dinâmicos de prazo e integração com Monitoring.

---

## 🗄️ FASE 1: MUDANÇAS NO BANCO DE DADOS

### 1.1 Alterar Tabela `tasks`

```sql
-- Adicionar 3 novos campos
ALTER TABLE tasks ADD COLUMN (
    company_contract VARCHAR(255) NULL COMMENT 'Empresa/Contrato',
    start_date DATE NULL COMMENT 'Data de início declarada pelo user quando clica PLAY',
    date_begin_real DATE NULL COMMENT 'Data real do primeiro PLAY (auto-preenchida)'
);

-- Criar índices para performance
CREATE INDEX idx_tasks_company ON tasks(company_contract);
CREATE INDEX idx_tasks_dates ON tasks(start_date, due_date);
```

### 1.2 Criar Tabela `time_entries_sessions` (NOVO!)

Esta tabela é **CRÍTICA** para o Play/Pause/Stop funcionar:

```sql
CREATE TABLE time_entries_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,

    -- Timestamps exatos
    start_time DATETIME NOT NULL COMMENT 'Quando clicou PLAY',
    pause_time DATETIME NULL COMMENT 'Quando clicou PAUSE (pode ter múltiplas pausas)',
    resume_time DATETIME NULL COMMENT 'Quando clicou PLAY novamente após PAUSE',
    end_time DATETIME NULL COMMENT 'Quando clicou STOP (finaliza a sessão)',

    -- Duração calculada
    duration_minutes INT NULL COMMENT 'Minutos trabalhos (calculado automaticamente)',
    duration_hours DECIMAL(5, 2) NULL COMMENT 'Horas (duration_minutes ÷ 60)',

    -- Status
    status ENUM('running', 'paused', 'stopped') NOT NULL DEFAULT 'running'
        COMMENT 'running=em andamento, paused=pausado, stopped=finalizado',

    -- Metadados
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign keys
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Índices para performance
    INDEX idx_task_user (task_id, user_id),
    INDEX idx_task_date (task_id, created_at),
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sessões de trabalho rastreadas com Play/Pause/Stop';
```

### 1.3 Criar View `v_task_metrics` (NOVO!)

Esta view calcula TODOS os métricas de uma tarefa:

```sql
CREATE VIEW v_task_metrics AS
SELECT
    t.id as task_id,
    t.title,
    t.description,
    t.company_contract,
    t.estimated_hours,
    t.due_date,
    t.status,

    -- Data de início real (primeira sessão)
    MIN(ts.start_time) as data_inicio_real,

    -- Total de horas reais investidas
    SUM(ts.duration_hours) as total_horas_reais,

    -- Total de colaboradores
    COUNT(DISTINCT ts.user_id) as total_colaboradores,

    -- Sum de daily_hours de todos colaboradores
    COALESCE(SUM(ta.daily_hours), 0) as total_daily_hours,

    -- TAXA MÉDIA: tempo real vs estimado
    CASE
        WHEN t.estimated_hours > 0
        THEN ROUND((SUM(ts.duration_hours) / t.estimated_hours) * 100, 2)
        ELSE 0
    END as taxa_media_percent,

    -- DIAS NECESSÁRIOS: horas estimadas ÷ daily_hours total
    CASE
        WHEN COALESCE(SUM(ta.daily_hours), 0) > 0
        THEN CEIL(t.estimated_hours / SUM(ta.daily_hours))
        ELSE NULL
    END as dias_necessarios,

    -- FIM REAL ESTIMADO: data_inicio_real + dias_necessários
    CASE
        WHEN MIN(ts.start_time) IS NOT NULL AND COALESCE(SUM(ta.daily_hours), 0) > 0
        THEN DATE_ADD(MIN(ts.start_time),
                      INTERVAL CEIL(t.estimated_hours / SUM(ta.daily_hours)) DAY)
        ELSE NULL
    END as fim_real_estimado,

    -- DIAS DE ATRASO/ADIANTAMENTO
    CASE
        WHEN MIN(ts.start_time) IS NOT NULL AND COALESCE(SUM(ta.daily_hours), 0) > 0
        THEN DATEDIFF(
                DATE_ADD(MIN(ts.start_time),
                         INTERVAL CEIL(t.estimated_hours / SUM(ta.daily_hours)) DAY),
                t.due_date
            )
        ELSE NULL
    END as dias_diferenca,

    -- STATUS DE RISCO
    CASE
        WHEN COUNT(DISTINCT ta.user_id) = 0 THEN 'CRITICO'
        WHEN DATEDIFF(
                DATE_ADD(MIN(ts.start_time),
                         INTERVAL CEIL(t.estimated_hours / SUM(ta.daily_hours)) DAY),
                t.due_date
            ) > 5 THEN 'CRITICO'
        WHEN DATEDIFF(
                DATE_ADD(MIN(ts.start_time),
                         INTERVAL CEIL(t.estimated_hours / SUM(ta.daily_hours)) DAY),
                t.due_date
            ) > 0 THEN 'RISCO'
        ELSE 'NO_PRAZO'
    END as status_risco

FROM tasks t
LEFT JOIN time_entries_sessions ts ON t.id = ts.task_id AND ts.status = 'stopped'
LEFT JOIN task_assignments ta ON t.id = ta.task_id
GROUP BY t.id;
```

### 1.4 Criar View `v_task_assignees_metrics` (NOVO!)

Métricas detalhadas POR COLABORADOR:

```sql
CREATE VIEW v_task_assignees_metrics AS
SELECT
    ta.task_id,
    ta.user_id,
    u.full_name,
    ta.daily_hours,

    -- Horas estimadas divididas igualmente entre colaboradores
    CASE
        WHEN COUNT(DISTINCT ta2.user_id) OVER (PARTITION BY ta.task_id) > 0
        THEN ROUND(t.estimated_hours / COUNT(DISTINCT ta2.user_id) OVER (PARTITION BY ta.task_id), 2)
        ELSE 0
    END as horas_estimadas_user,

    -- Horas reais investidas por este usuário
    SUM(ts.duration_hours) as horas_registradas,

    -- Taxa de progresso individual
    CASE
        WHEN t.estimated_hours > 0
        THEN ROUND((SUM(ts.duration_hours) / (t.estimated_hours / COUNT(DISTINCT ta2.user_id) OVER (PARTITION BY ta.task_id))) * 100, 2)
        ELSE 0
    END as taxa_progresso_user,

    -- Dias de trabalho
    COUNT(DISTINCT DATE(ts.start_time)) as dias_trabalho,

    -- Status
    CASE
        WHEN SUM(ts.duration_hours) IS NULL THEN 'SEM_INICIAR'
        WHEN SUM(ts.duration_hours) < (t.estimated_hours / COUNT(DISTINCT ta2.user_id) OVER (PARTITION BY ta.task_id)) THEN 'EM_PROGRESSO'
        ELSE 'CONCLUÍDO'
    END as status_user

FROM task_assignments ta
LEFT JOIN users u ON ta.user_id = u.id
LEFT JOIN tasks t ON ta.task_id = t.id
LEFT JOIN time_entries_sessions ts ON ta.task_id = ts.task_id AND ta.user_id = ts.user_id AND ts.status = 'stopped'
LEFT JOIN task_assignments ta2 ON ta.task_id = ta2.task_id
GROUP BY ta.task_id, ta.user_id;
```

---

## 🔌 FASE 2: NOVOS ENDPOINTS

### 2.1 Time Entries - Play/Pause/Stop

#### 1️⃣ **POST** `/api/tasks/:taskId/time-entry/start`
**Quando user clica PLAY**

```javascript
Request Body:
{
  "notes": "Iniciando análise de requisitos" // opcional
}

Response (201):
{
  "success": true,
  "message": "Sessão iniciada",
  "data": {
    "session_id": 1,
    "task_id": 123,
    "user_id": 5,
    "start_time": "2026-01-05T09:00:00Z",
    "status": "running"
  }
}

Validações:
├─ ✅ Task existe?
├─ ✅ User está atribuído à task?
├─ ✅ Task não está 'concluído' ou 'cancelado'?
├─ ✅ SUM(time_entries hoje) + daily_hours <= 8h? (AVISAR, não bloquear)
└─ ✅ Se houver sessão 'running', retorna erro
```

---

#### 2️⃣ **PATCH** `/api/tasks/:taskId/time-entry/:sessionId/pause`
**Quando user clica PAUSE**

```javascript
Request Body:
{} // sem body

Response (200):
{
  "success": true,
  "message": "Sessão pausada",
  "data": {
    "session_id": 1,
    "status": "paused",
    "pause_time": "2026-01-05T10:30:00Z",
    "duration_so_far": "1.5 horas"
  }
}

Validações:
├─ ✅ Sessão existe e status = 'running'?
└─ ✅ User é o dono da sessão?
```

---

#### 3️⃣ **PATCH** `/api/tasks/:taskId/time-entry/:sessionId/resume`
**Quando user clica PLAY novamente após PAUSE**

```javascript
Request Body:
{} // sem body

Response (200):
{
  "success": true,
  "message": "Sessão retomada",
  "data": {
    "session_id": 1,
    "status": "running",
    "resume_time": "2026-01-05T11:00:00Z"
  }
}

Validações:
├─ ✅ Sessão existe e status = 'paused'?
├─ ✅ User é o dono da sessão?
└─ ✅ SUM(time_entries hoje INCLUINDO esta) + daily_hours <= 8h? (AVISAR)
```

---

#### 4️⃣ **POST** `/api/tasks/:taskId/time-entry/:sessionId/stop`
**Quando user clica STOP**

```javascript
Request Body:
{
  "notes": "Completada análise de requisitos" // opcional
}

Response (200):
{
  "success": true,
  "message": "Sessão finalizada",
  "data": {
    "session_id": 1,
    "status": "stopped",
    "end_time": "2026-01-05T12:00:00Z",
    "duration_hours": 3.5,
    "total_hours_today": 5.0
  }
}

Lógica:
├─ Calcular: duration_hours = (end_time - start_time) / 3600
├─ Considerar pausas (subtrair do total)
├─ Atualizar task.date_begin_real se for primeira vez
├─ Salvar duration_hours em time_entries_sessions
└─ Recalcular todas as métricas da task
```

---

#### 5️⃣ **GET** `/api/tasks/:taskId/time-entries`
**Histórico completo de sessões**

```javascript
Query Params:
- userId: (opcional) filtrar por usuário
- date: (opcional) filtrar por data
- limit: 50 (default)
- offset: 0 (default)

Response (200):
{
  "success": true,
  "data": [
    {
      "session_id": 1,
      "user_id": 5,
      "user_name": "João Silva",
      "start_time": "2026-01-05T09:00:00Z",
      "end_time": "2026-01-05T12:00:00Z",
      "duration_hours": 3.0,
      "status": "stopped",
      "notes": "Requisitos levantados"
    },
    {
      "session_id": 2,
      "user_id": 6,
      "user_name": "Maria Santos",
      "start_time": "2026-01-05T13:00:00Z",
      "end_time": "2026-01-05T14:00:00Z",
      "duration_hours": 1.0,
      "status": "stopped",
      "notes": null
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### 6️⃣ **GET** `/api/tasks/:taskId/time-entries/today`
**Sessões de hoje (para show na Tela 4)**

```javascript
Query Params:
- userId: (opcional) filtrar por usuário

Response (200):
{
  "success": true,
  "data": {
    "task_id": 123,
    "date": "2026-01-05",
    "total_expected": 5.0, // SUM(daily_hours)
    "total_recorded": 3.5, // SUM(duration_hours de hoje)
    "remaining": 1.5,
    "sessions": [
      {
        "session_id": 1,
        "user_id": 5,
        "user_name": "João Silva",
        "start_time": "09:00",
        "end_time": "12:00",
        "duration": "3.0h",
        "status": "stopped"
      },
      {
        "session_id": 2,
        "user_id": 6,
        "user_name": "Maria Santos",
        "start_time": "13:00",
        "pause_time": "14:00",
        "duration_so_far": "1.0h",
        "status": "paused"
      }
    ]
  }
}
```

---

### 2.2 Tasks - Endpoints Melhorados

#### **GET** `/api/tasks/:taskId/metrics`
**TODAS as métricas da tarefa (crucial para Tela 4)**

```javascript
Response (200):
{
  "success": true,
  "data": {
    "task": {
      "id": 123,
      "title": "Levantar requisitos",
      "description": "Entrevistar stakeholders...",
      "company_contract": "ACME Corp - #2024-001",
      "estimated_hours": 40,
      "due_date": "2026-01-10",
      "status": "em_desenvolvimento"
    },

    "cronograma": {
      "data_inicio_real": "2026-01-05",
      "dias_disponiveis": 5,
      "total_horas_disponiveis": 40
    },

    "taxas_calculos": {
      "horas_reais_investidas": 17,
      "taxa_media_percent": 85,
      "previsao_termino": "2026-01-08",
      "status_previsao": "NO_PRAZO"
    },

    "fim_real": {
      "data_fim_estimada": "2026-01-08",
      "data_fim_supervisor": "2026-01-10",
      "dias_diferenca": -2,
      "status": "ADIANTADO"
    },

    "risco": {
      "status_risco": "NO_PRAZO",
      "dias_atraso": 0,
      "aviso": "Tarefa será concluída no prazo"
    },

    "colaboradores": [
      {
        "user_id": 5,
        "full_name": "João Silva",
        "daily_hours": 2,
        "horas_estimadas_user": 20,
        "horas_registradas": 12,
        "taxa_progresso": 60,
        "dias_trabalho": 6,
        "status": "EM_PROGRESSO"
      },
      {
        "user_id": 6,
        "full_name": "Maria Santos",
        "daily_hours": 3,
        "horas_estimadas_user": 20,
        "horas_registradas": 5,
        "taxa_progresso": 25,
        "dias_trabalho": 2,
        "status": "EM_PROGRESSO"
      }
    ]
  }
}
```

---

### 2.3 Stages - Endpoints Novos

#### **GET** `/api/projects/:projectId/stages/:stageId/metrics`
**Métricas agregadas de uma etapa**

```javascript
Response (200):
{
  "success": true,
  "data": {
    "stage_id": 456,
    "stage_name": "Análise e Design",
    "total_tasks": 5,
    "completed_tasks": 3,
    "progress_percent": 60,

    "fim_estimado": {
      "data": "2026-01-15",
      "status": "NO_PRAZO",
      "dias_para_vencer": 10
    },

    "tarefas": [
      {
        "task_id": 123,
        "title": "Requisitos",
        "status_risco": "NO_PRAZO"
      },
      // ... mais tarefas
    ]
  }
}
```

---

### 2.4 Projects - Endpoints Novos

#### **GET** `/api/projects/:projectId/metrics`
**Métricas agregadas de um projeto**

```javascript
Response (200):
{
  "success": true,
  "data": {
    "project_id": 1,
    "project_name": "Sistema de Gestão",
    "due_date": "2026-02-10",

    "progresso": {
      "total_tasks": 20,
      "completed_tasks": 9,
      "progress_percent": 45
    },

    "prazos": {
      "fim_real_estimado": "2026-02-05",
      "dias_diferenca": -5,
      "status": "ADIANTADO"
    },

    "risco_geral": {
      "status": "NO_PRAZO",
      "total_criticos": 0,
      "total_risco": 2
    },

    "colaboradores": [
      {
        "user_id": 5,
        "full_name": "João Silva",
        "total_tasks_atribuidas": 8,
        "total_horas_alocadas": 30,
        "total_horas_reais": 25,
        "eficiencia": 83
      }
    ]
  }
}
```

---

## 📋 FASE 3: VALIDAÇÕES E REGRAS DE NEGÓCIO

### 3.1 Validação de 8h/dia (CRÍTICA!)

**Quando supervisor tenta adicionar colaborador a uma tarefa:**

```javascript
// ENDPOINT: POST /api/tasks/:taskId/assign

async function validarEAdicionarColaborador(taskId, userId, daily_hours) {
  // 1. Buscar todas as tarefas ativas deste user
  const tarefasAtivasUser = await query(`
    SELECT SUM(ta.daily_hours) as total_hours
    FROM task_assignments ta
    WHERE ta.user_id = ?
      AND ta.task_id != ?
      AND EXISTS (
        SELECT 1 FROM tasks t
        WHERE t.id = ta.task_id
        AND t.status NOT IN ('concluido', 'cancelado')
      )
  `, [userId, taskId]);

  const horasAtuais = tarefasAtivasUser[0].total_hours || 0;
  const novasHoras = parseFloat(daily_hours);
  const total = horasAtuais + novasHoras;

  // 2. Validar
  if (total > 8) {
    return {
      success: false,
      error: "DAILY_LIMIT_EXCEEDED",
      message: `User já tem ${horasAtuais}h alocadas. Máximo disponível: ${8 - horasAtuais}h`,
      details: {
        current_hours: horasAtuais,
        requested_hours: novasHoras,
        total_hours: total,
        available_hours: 8 - horasAtuais,
        max_hours: 8
      }
    };
  }

  // 3. Adicionar
  await query(
    'INSERT INTO task_assignments (task_id, user_id, daily_hours) VALUES (?, ?, ?)',
    [taskId, userId, daily_hours]
  );

  return { success: true, message: "Colaborador adicionado com sucesso" };
}
```

### 3.2 Alerta ao Clicar PLAY

**Quando user clica PLAY e já tem muitas horas hoje:**

```javascript
// ENDPOINT: POST /api/tasks/:taskId/time-entry/start

async function validarPlay(taskId, userId) {
  // Buscar horas já registradas hoje
  const [resultado] = await query(`
    SELECT SUM(ts.duration_hours) as total_hours_today
    FROM time_entries_sessions ts
    WHERE ts.user_id = ?
      AND DATE(ts.start_time) = CURDATE()
      AND ts.status = 'stopped'
  `, [userId]);

  const horasHoje = resultado.total_hours_today || 0;

  // Buscar daily_hours da tarefa para este user
  const [taskAssignment] = await query(`
    SELECT daily_hours
    FROM task_assignments
    WHERE task_id = ? AND user_id = ?
  `, [taskId, userId]);

  const dailyHours = taskAssignment?.daily_hours || 0;
  const total = horasHoje + dailyHours;

  // Se vai ultrapassar 8h, AVISAR (não bloquear)
  if (total > 8) {
    return {
      success: true,
      warning: "USER_EXCEEDED_8H",
      message: `User já trabalhou ${horasHoje}h hoje. Ao começar esta tarefa (${dailyHours}h), chegará a ${total}h`,
      confirmed: false // Frontend pede confirmação
    };
  }

  // Se OK, iniciar sessão
  return { success: true };
}
```

### 3.3 Validação ao Salvar Sessão

**Quando session.stop() for chamado:**

```javascript
// Calcular duração considerando pausas
let duracao = end_time - start_time;
if (pause_time && resume_time) {
  duracao -= (resume_time - pause_time);
}

const duration_hours = duracao / 3600;
const duration_minutes = Math.round(duracao / 60);

// Validar que não ultrapassou daily_hours
const dailyHours = await query(
  'SELECT daily_hours FROM task_assignments WHERE task_id = ? AND user_id = ?',
  [taskId, userId]
);

if (duration_hours > dailyHours[0].daily_hours) {
  // Avisar mas ainda salvar (para rastrear)
  console.warn(`User trabalhou ${duration_hours}h mas daily_hours é ${dailyHours[0].daily_hours}h`);
}

// Salvar sempre (real é mais importante que estimado)
await query(`
  UPDATE time_entries_sessions
  SET
    end_time = ?,
    duration_hours = ?,
    duration_minutes = ?,
    status = 'stopped'
  WHERE id = ?
`, [endTime, duration_hours, duration_minutes, sessionId]);
```

---

## 🔄 FASE 4: MELHORIAS NOS ENDPOINTS EXISTENTES

### 4.1 GET /api/tasks/:id

**Adicionar métricas ao retornar uma task:**

```javascript
// Antes (Atual)
GET /api/tasks/123
Response: { id, title, description, status, ... }

// Depois (Melhorado)
GET /api/tasks/123
Response: {
  id, title, description, status, ...,
  metrics: {
    taxa_media: 85,
    fim_real_estimado: "2026-01-08",
    status_risco: "NO_PRAZO",
    colaboradores: [...]
  }
}
```

### 4.2 GET /api/tasks (com filtros)

**Adicionar filtro por risco:**

```javascript
Query Params:
- risk: "critico" | "risco" | "no_prazo" | "all" (default)
- status: "novo" | "em_desenvolvimento" | ...
- date_range: "this_week" | "this_month" | ...

// Exemplo
GET /api/tasks?risk=critico&limit=10
```

---

## 📊 FASE 5: FLUXO DE DADOS PARA MONITORING

### 5.1 Criar Endpoint para Monitoring

#### **GET** `/api/monitoring/tasks-metrics`
**Agregação de todas as tasks para Monitoring**

```javascript
Response (200):
{
  "success": true,
  "data": {
    "total_tasks": 150,
    "tasks_by_risk": {
      "critico": 5,
      "risco": 12,
      "no_prazo": 133
    },

    "tarefas_criticas": [
      {
        "task_id": 123,
        "title": "Requisitos",
        "status_risco": "CRITICO",
        "dias_atraso": 8,
        "colaboradores_necessarios": 2,
        "colaboradores_atuais": 1
      }
    ],

    "user_metrics": [
      {
        "user_id": 5,
        "full_name": "João Silva",
        "tarefas_atribuidas": 8,
        "tarefas_concluidas": 5,
        "taxa_conclusao": 62.5,
        "horas_alocadas": 14,
        "horas_reais": 12,
        "eficiencia": 85.7
      }
    ]
  }
}
```

---

## 🛠️ ORDEM DE IMPLEMENTAÇÃO (Passo a Passo)

### **SEMANA 1**

#### Dia 1-2: Banco de Dados
- [ ] Alterar tabela `tasks` (adicionar 3 campos)
- [ ] Criar tabela `time_entries_sessions`
- [ ] Criar view `v_task_metrics`
- [ ] Criar view `v_task_assignees_metrics`
- [ ] Testar com dados de exemplo

#### Dia 3-4: Time Entries Endpoints
- [ ] POST `/api/tasks/:taskId/time-entry/start`
- [ ] PATCH `/api/tasks/:taskId/time-entry/:sessionId/pause`
- [ ] PATCH `/api/tasks/:taskId/time-entry/:sessionId/resume`
- [ ] POST `/api/tasks/:taskId/time-entry/:sessionId/stop`
- [ ] Testar com Postman

#### Dia 5: Validações
- [ ] Implementar validação de 8h/dia
- [ ] Implementar alerta ao PLAY
- [ ] Testes

### **SEMANA 2**

#### Dia 1-2: Endpoints de Métricas
- [ ] GET `/api/tasks/:taskId/time-entries`
- [ ] GET `/api/tasks/:taskId/time-entries/today`
- [ ] GET `/api/tasks/:taskId/metrics` (CRÍTICO!)
- [ ] GET `/api/stages/:stageId/metrics`
- [ ] Testes

#### Dia 3-4: Endpoints Melhorados
- [ ] Melhorar GET `/api/tasks/:id`
- [ ] Melhorar GET `/api/tasks`
- [ ] GET `/api/projects/:projectId/metrics`
- [ ] Testes

#### Dia 5: Monitoring
- [ ] GET `/api/monitoring/tasks-metrics`
- [ ] Testes finais
- [ ] Documentação

---

## 📝 ARQUIVO DE TESTES (POSTMAN)

Após cada endpoint, testar com:

```javascript
// 1. POST /api/tasks/:taskId/time-entry/start
POST http://localhost:3000/api/tasks/123/time-entry/start
Headers: Authorization: Bearer <token>
Body: { "notes": "Iniciando" }

// 2. PATCH /api/tasks/:taskId/time-entry/:sessionId/pause
PATCH http://localhost:3000/api/tasks/123/time-entry/1/pause
Headers: Authorization: Bearer <token>

// 3. GET /api/tasks/:taskId/metrics
GET http://localhost:3000/api/tasks/123/metrics
Headers: Authorization: Bearer <token>

// Verificar respostas esperadas...
```

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Todos os 4 campos do banco criados
- [ ] 2 views criadas e testadas
- [ ] 6 endpoints de time_entries implementados
- [ ] 4 endpoints de métricas implementados
- [ ] Validação de 8h/dia funcionando
- [ ] Alerta ao PLAY funcionando
- [ ] Todos endpoints testados com Postman
- [ ] Documentação atualizada

---

**Documento criado em:** 05/01/2026
**Versão:** 1.0
**Status:** ✅ Pronto para codificação

