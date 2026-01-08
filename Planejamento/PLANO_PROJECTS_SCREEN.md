# 📋 PLANO DE EXECUÇÃO - TELA PROJECTS

## 📌 Visão Geral

Este plano detalha a refatoração completa da tela **Projects** com um novo fluxo de navegação em **4 telas**, sistema de **Play/Pause/Stop**, cálculo dinâmico de prazos e integração com **Monitoring**.

---

## 🗂️ ESTRUTURA: 4 TELAS EM SEQUÊNCIA

```
┌─────────────────┐
│  TELA 1         │
│  PROJECTS       │  ← Lista de Projetos
│  (Lista)        │
└────────┬────────┘
         │ (clica em projeto)
         ↓
┌─────────────────┐
│  TELA 2         │
│  STAGES         │  ← Atividades/Etapas do Projeto
│  (Expandível)   │
└────────┬────────┘
         │ (clica em etapa)
         ↓
┌─────────────────┐
│  TELA 3         │
│  TASKS          │  ← Tarefas da Etapa
│  (Lista)        │
└────────┬────────┘
         │ (clica em tarefa)
         ↓
┌─────────────────┐
│  TELA 4         │
│  TASK DETAIL    │  ← Detalhe completo + Play/Pause/Stop
│  (Completo)     │
└─────────────────┘
```

---

## 🔄 FLUXO DE NAVEGAÇÃO

### Navegação para Frente
- **Tela 1 → Tela 2:** Clique em um projeto
- **Tela 2 → Tela 3:** Clique em uma etapa
- **Tela 3 → Tela 4:** Clique em uma tarefa

### Navegação para Trás
- **Botão "Voltar"** em cada tela (OU Breadcrumb)
- **Breadcrumb:** Projects > Projeto XYZ > Etapa A > Tarefa 001

---

## 📊 TELA 1: PROJECTS (Lista de Projetos)

### O que Mostra
```
┌─────────────────────────────────────────────┐
│ PROJETOS                                    │
├─────────────────────────────────────────────┤
│                                             │
│ 📁 Projeto: Sistema de Gestão               │
│ 📅 Data Fim: 10/02/2026                     │
│ 👤 Supervisor: João Silva                   │
│ 📊 Progresso: 45% (9/20 tarefas)           │
│ ⚠️ Status: EM RISCO (5 dias para vencer)    │
│                                             │
│ 📁 Projeto: Módulo API                      │
│ 📅 Data Fim: 15/01/2026                     │
│ 👤 Supervisor: Maria Santos                 │
│ 📊 Progresso: 100% (8/8 tarefas)           │
│ ✅ Status: CONCLUÍDO                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Campos
- **Projeto ID & Nome** (clicável)
- **Data Fim** (definida pelo supervisor)
- **Supervisor** (responsável)
- **Progresso** (% concluído + tarefas)
- **Status do Projeto** (em_risco, no_prazo, concluído, atrasado)

### Filtros
- Por status (ativo, concluído, atrasado)
- Por supervisor (se admin/supervisor)
- Busca por nome

### Permissões
- **User:** Vê apenas projetos com tarefas atribuídas
- **Supervisor:** Vê apenas seus projetos
- **Admin:** Vê todos

---

## 📊 TELA 2: STAGES (Atividades/Etapas)

### O que Mostra
```
┌──────────────────────────────────────────────┐
│ PROJETO: Sistema de Gestão                   │
│ Supervisor: João Silva | Data Fim: 10/02/26 │
├──────────────────────────────────────────────┤
│                                              │
│ 1️⃣  ETAPA: Análise e Design                  │
│    📊 Progresso: 80% (4/5 tarefas)           │
│    ⏱️ Fim estimado: 15/01/2026               │
│    ✅ No prazo                               │
│    [Expandir ▼]                              │
│                                              │
│ 2️⃣  ETAPA: Desenvolvimento Backend           │
│    📊 Progresso: 20% (1/5 tarefas)           │
│    ⏱️ Fim estimado: 05/02/2026               │
│    ⚠️ Risco de atraso (2 dias)               │
│    [Expandir ▼]                              │
│                                              │
│ 3️⃣  ETAPA: Testes e QA                       │
│    📊 Progresso: 0% (0/4 tarefas)            │
│    ⏱️ Fim estimado: 08/02/2026               │
│    🔴 CRÍTICO (começa em 5 dias)             │
│    [Expandir ▼]                              │
│                                              │
└──────────────────────────────────────────────┘
```

### Campos
- **ID & Nome da Etapa**
- **Progresso** (% + quantidade de tarefas)
- **Fim Estimado** (calculado dinamicamente)
- **Status** (no_prazo, risco, crítico)
- **Botão Expandir/Recolher**

### Cálculo do Fim Estimado (Tela 2)
```javascript
// Para cada etapa
fimEstimado = dataInicio + SUM(diasNecessarios de cada tarefa)

// diasNecessarios por tarefa
diasNecessarios = horasEstimadas ÷ SUM(daily_hours de todos collaboradores)
```

### Permissões
- **User:** Vê etapas com tarefas atribuídas
- **Supervisor:** Vê todas as etapas de seus projetos
- **Admin:** Vê todas

---

## 📊 TELA 3: TASKS (Tarefas da Etapa)

### O que Mostra
```
┌─────────────────────────────────────────────────────┐
│ PROJETO: Sistema de Gestão > ETAPA: Análise Design  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📋 Tarefa #001                                      │
│    Título: Levantar requisitos de negócio           │
│    Descrição: Entrevistar stakeholders...           │
│    Horas Estimadas: 20h                             │
│    Data Fim: 12/01/2026                             │
│    Assignees: João (2h/dia), Maria (3h/dia)         │
│    Status: em_desenvolvimento                       │
│    Risco: ✅ No prazo                               │
│    [Abrir Detalhe →]                                │
│                                                     │
│ 📋 Tarefa #002                                      │
│    Título: Documentar casos de uso                  │
│    Descrição: Criar diagramas UML...                │
│    Horas Estimadas: 15h                             │
│    Data Fim: 15/01/2026                             │
│    Assignees: Pedro (4h/dia)                        │
│    Status: novo                                     │
│    Risco: ⚠️ Risco leve (2 horas extras)            │
│    [Abrir Detalhe →]                                │
│                                                     │
│ 📋 Tarefa #003                                      │
│    Título: Validar arquitetura proposta             │
│    Descrição: Revisar com Tech Lead...              │
│    Horas Estimadas: 10h                             │
│    Data Fim: 12/01/2026                             │
│    Assignees: Nenhum assignee                       │
│    Status: novo                                     │
│    Risco: 🔴 CRÍTICO (sem assignee)                 │
│    [Abrir Detalhe →]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Campos
- **Task ID** (para localizar rápido)
- **Título & Descrição**
- **Horas Estimadas**
- **Data Fim** (supervisor define)
- **Assignees** (lista de colaboradores com daily_hours)
- **Status** (novo, em_desenvolvimento, etc)
- **Risco** (calculado dinamicamente)

### Cálculo de Risco (Tela 3)
```javascript
if (assignees.length === 0) {
  risco = "CRÍTICO (sem assignee)";
} else {
  diasNecessarios = horasEstimadas ÷ SUM(daily_hours);
  dataFimEstimada = dataInicio + diasNecessarios;

  if (dataFimEstimada > dataFim) {
    diasAtraso = dataFimEstimada - dataFim;
    risco = `⚠️ Risco de ${diasAtraso} dias de atraso`;
  } else if (diasAtraso > 3) {
    risco = `🔴 CRÍTICO (${diasAtraso} dias de atraso)`;
  } else {
    risco = "✅ No prazo";
  }
}
```

### Ordenação
- Default: Por risco (crítico > risco > no_prazo)
- OU: Por ID, por status, por data

### Permissões
- **User:** Vê apenas tarefas atribuídas
- **Supervisor:** Vê todas de seus projetos
- **Admin:** Vê todas

---

## 📊 TELA 4: TASK DETAIL (Detalhe Completo)

### O que Mostra
```
┌─────────────────────────────────────────────────────────────┐
│ PROJETO: Sistema de Gestão                                  │
│ ETAPA: Análise Design                                        │
│ TAREFA #001 - Levantar requisitos de negócio                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 📌 INFORMAÇÕES BÁSICAS                                       │
│ ├─ ID: 001                                                   │
│ ├─ Descrição: Entrevistar stakeholders e documentar...       │
│ ├─ Empresa/Contrato: ACME Corp - Contrato #2024-001         │
│ └─ Status: em_desenvolvimento                               │
│                                                              │
│ ⏰ CRONOGRAMA                                                 │
│ ├─ Data Fim (Supervisor): 12/01/2026 (5 dias úteis)         │
│ ├─ Data Início (User): 05/01/2026 (hoje)                    │
│ └─ Total disponível: 40h (8h/dia × 5 dias)                  │
│                                                              │
│ 📊 TAXAS E CÁLCULOS                                          │
│ ├─ Horas Estimadas: 20h                                     │
│ ├─ Taxa Média (real vs estimado): 85% ✅                    │
│ │  └─ Tempo investido real: 17h                             │
│ │  └─ Progressão: 85% concluído                             │
│ └─ Previsão de Término: 08/01/2026 ✅ (NO PRAZO)            │
│                                                              │
│ 🎯 AVISOS E ALERTAS                                          │
│ ├─ ✅ Tarefa no prazo                                        │
│ ├─ ✅ Todos colaboradores alocados corretamente              │
│ └─ ℹ️  Será concluída 4 dias antes do prazo                  │
│                                                              │
│ 📅 FIM REAL (Calculado)                                      │
│ ├─ Data Fim Estimada: 08/01/2026                            │
│ ├─ Data Fim Supervisor: 12/01/2026                          │
│ ├─ Diferença: -4 dias (ADIANTADO) ✅                         │
│ └─ Recomendação: Tarefa pode ser priorizada                 │
│                                                              │
│ 👥 ATRIBUIÇÃO                                                │
│ ├─ João Silva (2h/dia)                                       │
│ │  ├─ Horas Estimadas (sua parte): 10h (20h ÷ 2 users)     │
│ │  ├─ Horas Registradas (tempo real): 12h ✅               │
│ │  ├─ Taxa de Progresso: 120% (adiantado!)                 │
│ │  ├─ Dias de Trabalho: 6 dias                             │
│ │  └─ Status: EM PROGRESSO                                  │
│ │                                                            │
│ ├─ Maria Santos (3h/dia)                                     │
│ │  ├─ Horas Estimadas (sua parte): 10h (20h ÷ 2 users)     │
│ │  ├─ Horas Registradas (tempo real): 5h                   │
│ │  ├─ Taxa de Progresso: 50% (faltam 5h)                   │
│ │  ├─ Dias de Trabalho: 1.67 dias                          │
│ │  └─ Status: EM PROGRESSO                                  │
│ │                                                            │
│ └─ [+ Adicionar Colaborador]                                │
│                                                              │
│ ⏱️ CONTROLE DE TEMPO (Play/Pause/Stop)                       │
│ ├─ Status: ⏸️  PAUSADO                                       │
│ │                                                            │
│ ├─ Tempo Hoje:                                               │
│ │  └─ Esperado: 5h (João 2h + Maria 3h)                     │
│ │  └─ Registrado: 3h30m                                      │
│ │  └─ Falta: 1h30m                                          │
│ │                                                            │
│ ├─ Sessões de Hoje:                                          │
│ │  ├─ João Silva: 09:00-11:30 (2h30m) [Concluído]           │
│ │  ├─ Maria Santos: 13:00-14:00 (1h) [Pausado]             │
│ │  └─ Maria Santos: Pode continuar em 14:30                 │
│ │                                                            │
│ ├─ ┌─────────────────────────────────────────┐              │
│ │  │ [▶ PLAY]  [⏸ PAUSE]  [⏹ STOP]          │              │
│ │  │                                         │              │
│ │  │ Tempo desta sessão: 01:45              │              │
│ │  │ Inicioado por: João Silva              │              │
│ │  └─────────────────────────────────────────┘              │
│ │                                                            │
│ └─ Histórico de Sessões:                                     │
│    ├─ 05/01 09:00-11:30: João Silva (2h30m)                 │
│    ├─ 05/01 13:00-14:00: Maria Santos (1h)                  │
│    └─ [Ver mais...]                                          │
│                                                              │
│ 📝 NOTAS                                                      │
│ └─ Última nota: Entrevistas completadas. Aguardando...      │
│                                                              │
│ [← Voltar] [Editar] [Histórico] [Relatório]                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Seções Detalhadas

#### 1️⃣ INFORMAÇÕES BÁSICAS
- **Task ID**
- **Descrição completa**
- **Empresa/Contrato** (novo campo)
- **Status atual**

#### 2️⃣ CRONOGRAMA
- **Data Fim** (definida pelo supervisor)
- **Data Início** (declarada pelo user quando clica em Play)
- **Dias disponíveis** (cálculo automático)
- **Total de horas disponível** (dias × 8h)

#### 3️⃣ TAXAS E CÁLCULOS
```javascript
// Taxa Média = tempo real investido / horas estimadas
taxaMedia = (horasReaisInvestidas / horasEstimadas) × 100

// Previsão de Término
diasJaDecorridos = hoje - dataInicio
horasRestantes = horasEstimadas - horasReaisInvestidas
diasRestantesNecessarios = horasRestantes ÷ SUM(daily_hours)

previsaoTermino = hoje + diasRestantesNecessarios

// Se previsaoTermino <= dataFim: NO PRAZO ✅
// Se previsaoTermino > dataFim: EM ATRASO 🔴
```

#### 4️⃣ AVISOS E ALERTAS
- ✅ "Tarefa no prazo"
- ⚠️ "Risco leve (2 dias de atraso)"
- 🔴 "CRÍTICO (15 dias de atraso)"
- ℹ️ "Será necessário adicionar 1 colaborador"
- ℹ️ "Será concluída X dias antes do prazo"

#### 5️⃣ FIM REAL (Estimado)
```javascript
// Cálculo dinâmico baseado em all collaborators
totalDailyHours = SUM(daily_hours de todos colaboradores)
diasNecessarios = horasEstimadas ÷ totalDailyHours
fimRealEstimado = dataInicio + diasNecessarios

diferenca = fimRealEstimado - dataFim
if (diferenca < 0) {
  status = "ADIANTADO (|diferenca| dias antes)"; // ✅
} else if (diferenca === 0) {
  status = "EXATAMENTE NO PRAZO"; // ✅
} else if (diferenca <= 3) {
  status = "LEVE ATRASO"; // ⚠️
} else {
  status = "ATRASO CRÍTICO"; // 🔴
}
```

#### 6️⃣ ATRIBUIÇÃO
Para cada colaborador:
- Nome
- Daily_hours alocadas
- Horas registradas (real)
- Taxa de progresso
- Status (em_progresso, pausado, concluído)
- Botão para remover (supervisor/admin only)
- Botão [+ Adicionar Colaborador]

#### 7️⃣ CONTROLE DE TEMPO (NOVO!)
**Estado do Sistema:**
- Status atual: ▶️ PLAY / ⏸️ PAUSADO / ⏹️ PARADO
- Tempo esperado hoje (SUM de daily_hours)
- Tempo registrado hoje
- Tempo faltante

**Botões de Controle:**
```
┌─────────────────────────────────┐
│ [▶ PLAY]  [⏸ PAUSE]  [⏹ STOP] │
│ Tempo desta sessão: 01:45       │
│ Iniciado por: João Silva        │
└─────────────────────────────────┘
```

**Como funciona:**
1. User clica **[▶ PLAY]** → Começa contagem de tempo
2. Sistema registra: `start_time = NOW`
3. User clica **[⏸ PAUSE]** → Pausa a sessão (time_entry fica aberta)
4. User clica **[▶ PLAY]** novamente → Retoma a contagem
5. User clica **[⏹ STOP]** → Finaliza a sessão
   - Calcula: `hours = (stop_time - start_time) / 3600`
   - Salva em `time_entries`
   - Atualiza todos os cálculos acima

**Histórico de Sessões:**
- Lista de todas as sessões já concluídas
- Data/Hora início e fim
- Duração
- Quem iniciou

---

## 🗄️ MUDANÇAS NO BANCO DE DADOS

### Tabela: `tasks` (MODIFICAÇÕES)

#### Campos Novos
```sql
ALTER TABLE tasks ADD COLUMN (
  company_contract VARCHAR(255) NULL COMMENT 'Empresa/Contrato',
  start_date DATE NULL COMMENT 'Data de início declarada pelo user',
  date_begin_real DATE NULL COMMENT 'Data real de início (quando clica Play pela 1ª vez)'
);
```

### Tabela: `time_entries` (REESTRUTURAÇÃO)

#### Mudança Completa
```sql
CREATE TABLE time_entries_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    start_time DATETIME NOT NULL COMMENT 'Quando clicou PLAY',
    end_time DATETIME NULL COMMENT 'Quando clicou STOP',
    paused_time DATETIME NULL COMMENT 'Quando clicou PAUSE',
    duration_hours DECIMAL(5, 2) NULL COMMENT 'Horas calculadas (end_time - start_time)',
    status ENUM('running', 'paused', 'completed') NOT NULL DEFAULT 'running',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_user_date (task_id, user_id, created_at)
);

-- Manter tabela antiga para compatibilidade
-- time_entries (hours, date, notes) - para registros manuais
```

### View: `task_metrics` (NOVO)

```sql
CREATE VIEW task_metrics AS
SELECT
    t.id as task_id,
    t.title,
    t.estimated_hours,
    t.due_date,
    MIN(ts.start_time) as data_inicio_real,
    SUM(ts.duration_hours) as total_horas_reais,

    -- Taxa Média
    (SUM(ts.duration_hours) / t.estimated_hours * 100) as taxa_media,

    -- Cálculo de fim real
    MIN(ts.start_time) + INTERVAL (t.estimated_hours / COALESCE(SUM(ta.daily_hours), 0)) DAY as fim_real_estimado,

    -- Dias de atraso/adiantamento
    DATEDIFF(
        MIN(ts.start_time) + INTERVAL (t.estimated_hours / COALESCE(SUM(ta.daily_hours), 1)) DAY,
        t.due_date
    ) as dias_diferenca,

    COUNT(DISTINCT ta.user_id) as total_colaboradores,
    GROUP_CONCAT(u.full_name) as colaboradores

FROM tasks t
LEFT JOIN time_entries_sessions ts ON t.id = ts.task_id
LEFT JOIN task_assignments ta ON t.id = ta.task_id
LEFT JOIN users u ON ta.user_id = u.id
GROUP BY t.id;
```

---

## 🔌 ENDPOINTS BACKEND NECESSÁRIOS

### Projetos
```
GET    /api/projects                    (com include=stages,tasks)
GET    /api/projects/:id                (detalhe completo)
POST   /api/projects                    (criar - supervisor/admin)
PUT    /api/projects/:id                (editar - supervisor/admin)
DELETE /api/projects/:id                (deletar - supervisor/admin)
```

### Stages
```
GET    /api/projects/:projectId/stages
POST   /api/projects/:projectId/stages  (criar)
PUT    /api/stages/:id                  (editar)
DELETE /api/stages/:id                  (deletar)
GET    /api/stages/:id/metrics          (fim estimado calculado)
```

### Tasks
```
GET    /api/tasks                       (todas com filtros)
GET    /api/tasks/:id                   (detalhe completo)
POST   /api/stages/:stageId/tasks       (criar)
PUT    /api/tasks/:id                   (editar)
DELETE /api/tasks/:id                  (deletar)
PATCH  /api/tasks/:id/status            (mudar status)
GET    /api/tasks/:id/metrics           (calcular métricas)
```

### Time Entries (NOVO)
```
POST   /api/tasks/:taskId/time-entry/start       (clica PLAY)
POST   /api/tasks/:taskId/time-entry/pause       (clica PAUSE)
POST   /api/tasks/:taskId/time-entry/resume      (clica PLAY novamente)
POST   /api/tasks/:taskId/time-entry/stop        (clica STOP)
GET    /api/tasks/:taskId/time-entries           (histórico)
GET    /api/tasks/:taskId/time-entries/today     (sessões de hoje)
```

### Atribuições
```
POST   /api/tasks/:taskId/assign        (adicionar colaborador)
DELETE /api/tasks/:taskId/assign/:userId (remover colaborador)
GET    /api/tasks/:taskId/assignees     (lista completa)
```

### Métricas (para Tela 4)
```
GET    /api/tasks/:taskId/metrics       (todos cálculos)
GET    /api/tasks/:taskId/risk-assessment (análise de risco)
GET    /api/tasks/:taskId/forecast      (previsão de término)
```

---

## 📐 FÓRMULAS DE CÁLCULO

### 1. Dias Necessários por Tarefa
```javascript
diasNecessarios = horasEstimadas ÷ SUM(daily_hours de todos colaboradores)
// Exemplo: 40h ÷ (2h + 3h) = 8 dias
```

### 2. Fim Real Estimado
```javascript
fimRealEstimado = dataInicio + diasNecessarios
// Exemplo: 05/01 + 8 dias = 13/01
```

### 3. Taxa Média
```javascript
taxaMedia = (horasReaisInvestidas ÷ horasEstimadas) × 100
// Exemplo: 17h ÷ 20h = 85%
```

### 4. Dias de Atraso/Adiantamento
```javascript
diasDiferenca = fimRealEstimado - dataFimSupervisor
// Se negativo: ADIANTADO
// Se positivo: ATRASADO
```

### 5. Previsão de Término (Dinâmica)
```javascript
horasJaInvestidas = SUM(time_entries)
horasRestantes = horasEstimadas - horasJaInvestidas
velocidadeMedia = horasJaInvestidas ÷ (hoje - dataInicio)

diasRestantesNecessarios = horasRestantes ÷ SUM(daily_hours)
previsaoTermino = hoje + diasRestantesNecessarios
```

### 6. Status de Risco
```javascript
if (colaboradores.length === 0) {
  status = "CRÍTICO"; // 🔴
} else if (fimRealEstimado > dataFim + 5 dias) {
  status = "CRÍTICO"; // 🔴
} else if (fimRealEstimado > dataFim) {
  status = "RISCO"; // ⚠️
} else {
  status = "NO_PRAZO"; // ✅
}
```

---

## 📊 FLUXO DE DADOS PARA MONITORING

### Dados que Fluem da Tela 4 para Monitoring

#### Por User
```
├─ Tarefas Atribuídas (quantidade)
├─ Tarefas Concluídas (quantidade)
├─ Taxa de Conclusão (%)
├─ Tempo Total Dedicado (hours)
├─ Tempo Médio por Tarefa (hours)
├─ Taxa de Atraso (quantas tarefas atrasaram)
├─ Carga Horária Média (daily_hours)
└─ Eficiência (tempo_real vs tempo_estimado)
```

#### Por Task (Aggregado)
```
├─ Horas Estimadas vs Reais
├─ Taxa de Atraso (%)
├─ Número de Reatribuições (quantas vezes adicionou colaborador)
├─ Número de Colaboradores (atual)
└─ Status Final (no_prazo, atrasado, crítico)
```

#### Por Supervisor
```
├─ Total de Tarefas Gerenciadas
├─ Taxa de Sucesso (% no prazo)
├─ Taxa de Atraso (%)
├─ Média de Reatribuições por Projeto
├─ Colaboradores Mais Sobrecarregados
└─ Projetos em Risco
```

#### Por Equipe
```
├─ Total de Horas Alocadas
├─ Total de Horas Reais Investidas
├─ Taxa de Eficiência Geral (%)
├─ Tarefas Concluídas vs Planejado
└─ Indicadores de Bottleneck
```

---

## 🎯 COMPONENTES REACT NECESSÁRIOS

```
components/
├── Projects/
│   ├── ProjectsList.tsx              # Tela 1
│   ├── StagesList.tsx                # Tela 2
│   ├── TasksList.tsx                 # Tela 3
│   ├── TaskDetail.tsx                # Tela 4
│   │
│   ├── TaskHeader.tsx                # Breadcrumb + Voltar
│   ├── TaskBasicInfo.tsx             # Seção 1
│   ├── TaskSchedule.tsx              # Seção 2
│   ├── TaskMetrics.tsx               # Seção 3
│   ├── TaskAlerts.tsx                # Seção 4
│   ├── TaskRealEnd.tsx               # Seção 5
│   ├── TaskAssignees.tsx             # Seção 6
│   ├── TaskTimeControl.tsx           # Seção 7 (Play/Pause/Stop)
│   ├── TaskSessionHistory.tsx        # Histórico de sessões
│   │
│   └── TaskMetricsCalculator.ts      # Utilitário de cálculos
│
└── Monitoring/
    ├── UserMetrics.tsx               # Métricas por user
    ├── SupervisorMetrics.tsx         # Métricas por supervisor
    ├── TeamMetrics.tsx               # Métricas por equipe
    ├── TimeVsEstimateChart.tsx       # Gráfico tempo real vs estimado
    └── RiskAssessment.tsx            # Análise de risco
```

---

## 🔐 PERMISSÕES E VALIDAÇÕES

### Quem pode fazer o quê?

| Ação | User | Supervisor | Admin |
|------|------|-----------|-------|
| Ver Projects | Seus | Seus | Todos |
| Ver Stages | Seus | Seus | Todos |
| Ver Tasks | Atribuídas | Seus | Todos |
| Criar Project | ❌ | ✅ | ✅ |
| Editar Project | ❌ | Seus | ✅ |
| Deletar Project | ❌ | Seus | ✅ |
| Adicionar Colaborador | ❌ | Seus | ✅ |
| Remover Colaborador | ❌ | Seus | ✅ |
| Play/Pause/Stop | ✅ Tarefas atribuídas | ✅ Suas | ✅ |
| Editar daily_hours | ⚠️ Com validação 8h | ✅ | ✅ |

### Validações Críticas

1. **Ao adicionar colaborador a uma tarefa:**
   ```
   if (daily_hours + SUM(current_daily_hours) > 8) {
     ❌ BLOQUEAR: "Limite de 8h/dia excedido"
   }
   ```

2. **Ao clicar PLAY:**
   ```
   if (SUM(time_entries_hoje) + daily_hours > 8) {
     ⚠️ AVISAR: "User já atingiu 8h hoje. Continuar? [Sim] [Não]"
   }
   ```

3. **Ao editar Data Fim:**
   ```
   if (novaDataFim < dataInicio) {
     ❌ BLOQUEAR: "Data final deve ser maior que data de início"
   }
   ```

---

## 📅 TIMELINE DE IMPLEMENTAÇÃO

### Fase 1: Backend (Semana 1-2)
- [ ] Criar endpoints de Tasks completos
- [ ] Implementar endpoints de Time Entries (Play/Pause/Stop)
- [ ] Criar views de métricas no banco
- [ ] Implementar validações de 8h/dia
- [ ] Testes de API

### Fase 2: Frontend - Telas 1-3 (Semana 2-3)
- [ ] Componente ProjectsList (Tela 1)
- [ ] Componente StagesList (Tela 2)
- [ ] Componente TasksList (Tela 3)
- [ ] Navegação entre telas (breadcrumb + botão voltar)
- [ ] Integração com API

### Fase 3: Frontend - Tela 4 (Semana 3-4)
- [ ] TaskDetail (estrutura base)
- [ ] Seções 1-6 (info básica até atribuição)
- [ ] Sistema Play/Pause/Stop
- [ ] Histórico de sessões
- [ ] Cálculos de métricas

### Fase 4: Monitoring (Semana 4-5)
- [ ] Adapter para dados da Tela 4
- [ ] Componentes de Monitoring
- [ ] Gráficos de tempo real vs estimado
- [ ] Relatórios por user/supervisor/equipe

### Fase 5: Testes e Deploy (Semana 5)
- [ ] Testes E2E
- [ ] Validação com stakeholders
- [ ] Deploy em produção

---

## ✅ PRÓXIMOS PASSOS

1. **Validação:** Você concorda com essa estrutura?
2. **Ajustes:** Precisa mudar algo?
3. **Começamos:** Por onde começar? Backend primeiro?

---

**Documento criado em:** 05/01/2026
**Versão:** 1.0
**Status:** ✅ Pronto para validação

