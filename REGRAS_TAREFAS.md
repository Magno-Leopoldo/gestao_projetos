# 📋 REGRAS E LÓGICAS DA TELA DE TAREFAS

**Documento Técnico:** Mapeamento completo das regras de negócio implementadas
**Data:** Janeiro 2026
**Versão:** 2.2 (Progresso Acumulativo + Filtros + Validações)

---

## 📑 ÍNDICE

1. [Conceitos Fundamentais](#conceitos-fundamentais)
2. [REGRA 1: Atribuição de Usuários](#regra-1-atribuição-de-usuários)
3. [REGRA 2: Limite de 8h/dia](#regra-2-limite-de-8hdia)
4. [REGRA 3: Horas Dedicadas](#regra-3-horas-dedicadas)
5. [REGRA 4: Progresso Acumulativo](#regra-4-progresso-acumulativo)
6. [REGRA 5: Time Tracking (Play/Pause/Stop)](#regra-5-time-tracking-playpausestop)
7. [REGRA 6: Conclusão Estimada Dinâmica](#regra-6-conclusão-estimada-dinâmica)
8. [REGRA 7: Filtros de Histórico](#regra-7-filtros-de-histórico)
9. [FLUXOS COMPLETOS](#fluxos-completos)
10. [VALIDAÇÕES](#validações)
11. [ESTRUTURA DE DADOS](#estrutura-de-dados)

---

## 🎯 CONCEITOS FUNDAMENTAIS

### **O que é uma TAREFA?**

Uma tarefa é uma unidade de trabalho que:
- Pertence a uma ETAPA de um PROJETO
- Tem uma **estimativa de horas** (quanto deveria levar)
- Pode ter múltiplos **usuários atribuídos**
- Cada usuário faz **compromisso de horas/dia** (quanto vai trabalhar por dia)
- Registra o trabalho real via **sessões de tempo** (play/pause/stop)

### **Hierarquia:**
```
PROJETO (Supervisor define)
  └─ ETAPA (Supervisor cria)
      └─ TAREFA (Supervisor cria, usuários trabalham)
          ├─ Estimativa: 40h (total que deveria levar)
          ├─ Atribuições:
          │   ├─ João: 4h/dia (compromisso)
          │   └─ Maria: 3h/dia (compromisso)
          └─ Sessões de Tempo:
              ├─ João Play 09:00 → Pause 10:00 = 1h registrada
              ├─ Maria Play 10:00 → Stop 14:00 = 4h registrada
              └─ ... (histórico completo)
```

---

## ⚙️ REGRA 1: ATRIBUIÇÃO DE USUÁRIOS

### **Conceito**
Atribuir um usuário a uma tarefa = **usuário se compromete com X horas/dia naquela tarefa**

### **Fluxo Completo**

#### **PASSO 1: Supervisor clica "+ Atribuir Usuário"**

**O que acontece:**
```
Modal abre → carrega lista de usuários
Modal carrega usuários JÁ ATRIBUÍDOS com suas horas
Cada usuário pode ter entre 0-8h/dia
```

**Código Frontend:**
```typescript
// TaskDetail.tsx
<AssignUsersModal
  taskId={18}
  taskDailyHours={4}  // Sugestão do supervisor
  currentAssignees={[
    { id: 7, full_name: "João", daily_hours: 3 },
    { id: 8, full_name: "Maria", daily_hours: 2 }
  ]}
/>
```

#### **PASSO 2: Supervisor seleciona usuários e define horas**

**Fluxo:**
1. Marca checkbox do usuário
2. Campo "Horas/dia" aparece
3. Define horas (0-8)
4. Clica "Salvar Atribuições"

**Exemplo:**
```
João Silva:
  [✓] Checkbox marcado
  Horas/dia: [3.5] (input)

Maria Santos:
  [✓] Checkbox marcado
  Horas/dia: [4.0] (input)
```

#### **PASSO 3: Backend valida e atribui**

**Validação (RIGOROSA):**
```javascript
// tasksController.js - assignUsersToTask()

Para CADA usuário selecionado:

1️⃣ Converte daily_hours para número (parseFloat)
   "4.5" → 4.5 ✅

2️⃣ Valida se está entre 0-8
   0 ≤ userHours ≤ 8
   Se falhar: erro ❌

3️⃣ VALIDAÇÃO RIGOROSA: Verifica limite 8h/dia TOTAL
   Soma = current_hours + requested_hours

   Exemplo:
   - João já tem: 3h em Tarefa A
   - Tenta atribuir: 4h em Tarefa B
   - Soma: 3 + 4 = 7h ✅ (OK, dentro do limite)

   - João já tem: 5h em Tarefa A
   - Tenta atribuir: 4h em Tarefa B
   - Soma: 5 + 4 = 9h ❌ (REJEITA, ultrapassa 8h)

4️⃣ Se passou validação: INSERT ou UPDATE
   INSERT INTO task_assignments (task_id, user_id, daily_hours)
   ON DUPLICATE KEY UPDATE daily_hours = ?
```

### **Resposta da API**

**Se Sucesso:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 7,
      "user_name": "João Silva",
      "daily_hours": 3.5,
      "success": true
    },
    {
      "user_id": 8,
      "user_name": "Maria Santos",
      "daily_hours": 4.0,
      "success": true
    }
  ],
  "errors": [],
  "message": "2 atribuição(ões) bem-sucedida(s)"
}
```

**Se Falha (um dos usuários):**
```json
{
  "success": false,
  "data": [
    {
      "user_id": 8,
      "user_name": "Maria Santos",
      "daily_hours": 4.0,
      "success": true
    }
  ],
  "errors": [
    {
      "user_id": 7,
      "error": "Usuário já possui 5.5h/dia alocadas em outras tarefas. Solicitado: 3.5h. Disponível: 2.5h/dia."
    }
  ],
  "message": "1 atribuição(ões) bem-sucedida(s), 1 erro(s)"
}
```

### **KEY POINTS**

✅ **Atribuição = Compromisso, não trabalho real**
- Não faz o usuário TRABALHAR
- Apenas estabelece um compromisso

✅ **Cada usuário tem limite de 8h/dia**
- Somando TODAS as suas tarefas
- Sistema bloqueia se ultrapassar

✅ **Pode atualizar horas depois**
- PATCH `/api/tasks/:taskId/assign/:userId`
- Também valida limite 8h/dia

✅ **ON DUPLICATE KEY UPDATE**
- Se usuário já estava atribuído: ATUALIZA horas
- Se era novo: INSERE

---

## 🚨 REGRA 2: LIMITE DE 8H/DIA

### **Conceito Fundamental**

**8 horas/dia é o LIMITE MÁXIMO que um usuário pode se comprometer**

Isso vale para:
- ✅ **Soma de TODAS as tarefas** (atribuições)
- ✅ **Trabalho REAL em um dia** (time tracking)

### **Exemplo Prático**

```
João tem 3 tarefas:
┌─────────────────────────────────┐
│ Tarefa A: 3h/dia                │
│ Tarefa B: 2.5h/dia              │
│ Tarefa C: 2.5h/dia              │
│ ─────────────────────────────   │
│ TOTAL: 8h/dia ✅ (NO LIMITE)   │
└─────────────────────────────────┘

Se tentar adicionar Tarefa D com 1h:
│ Tarefa D: 1h/dia (tentativa)    │
│ ─────────────────────────────   │
│ TOTAL: 9h/dia ❌ (REJEITA)     │
```

### **Onde é Validado?**

#### **1. Na ATRIBUIÇÃO (Compromisso)**
```javascript
// POST /api/tasks/:taskId/assign
validateUserDailyHours(userId, taskId, dailyHours)
├─ Soma todas as task_assignments do usuário
├─ Exclui tasks concluídas ou canceladas
└─ Bloqueia se total > 8h
```

#### **2. Na EDIÇÃO de horas**
```javascript
// PATCH /api/tasks/:taskId/assign/:userId
validateUserDailyHours(userId, taskId, newDailyHours)
└─ Mesma validação
```

#### **3. Na INICIALIZAÇÃO de uma sessão (Play)**
```javascript
// POST /api/tasks/:taskId/time-entries/start
validateTimeEntryStart(userId)
├─ Soma time_entries_sessions do dia (status='running'|'paused'|'stopped')
├─ Verifica se completed_hours_today < 8
└─ Se >= 8: bloqueia nova sessão (botão PLAY fica desabilitado)
```

### **Estrutura de Validação**

```javascript
// helpers/taskValidations.js - validateUserDailyHours()

async function validateUserDailyHours(userId, taskId, requestedHours) {
  // 1. Busca horas já alocadas noutras tarefas
  const result = await query(
    `SELECT SUM(ta.daily_hours) as total_hours
     FROM task_assignments ta
     INNER JOIN tasks t ON ta.task_id = t.id
     WHERE ta.user_id = ?
       AND ta.task_id != ?
       AND t.status NOT IN ('concluido', 'cancelado')`
    [userId, taskId]
  );

  const currentHours = result.total_hours || 0;
  const newTotal = currentHours + requestedHours;

  // 2. Retorna validação
  return {
    success: newTotal <= 8,
    error: "Mensagem detalhada...",
    validation: {
      current_hours: currentHours,
      requested_hours: requestedHours,
      total_hours: newTotal,
      available_hours: 8 - currentHours
    }
  };
}
```

### **UI Feedback**

**Quando atribuição ultrapassa 8h:**
```
❌ ERRO ao atribuir João Silva

   Horas comprometidas:    5.50h
 + Você está tentando:    + 3.00h
 ─────────────────────────────
   Total seria:            8.50h ❌

   ⚠️ Limite diário: 8.00h

   💡 Sugestão: Você pode atribuir até 2.50h
```

---

## 💼 REGRA 3: HORAS DEDICADAS

### **Conceito**

"Horas Dedicadas" = **SOMA de todas as horas que os usuários se comprometeram em uma tarefa**

```
Tarefa: "Desenvolvimento de Login"
Estimativa: 40h

Atribuições:
├─ João: 4h/dia
├─ Maria: 3h/dia
└─ Pedro: 2h/dia
─────────────────
HORAS DEDICADAS: 9h/dia (SOMA)
```

### **Cálculo**

```typescript
// TaskDetail.tsx linha 358
const totalDedicat = assignees.reduce((sum, a) =>
  sum + parseFloat(a.daily_hours?.toString() || '0'), 0
);

// Resultado: 4 + 3 + 2 = 9h
```

### **Função**

**Por quê isso importa?**

1. **Supervisor acompanha capacidade**
   - Se tarefa precisa 40h e tem 9h/dia
   - Leva 40/9 = 4.4 dias

2. **Identificar falta de recursos**
   - Se sugestão era 10h/dia mas alocaram 5h
   - Tarefa vai atrasar

3. **Comparação com sugestão**
   - Supervisor sugere 10h/dia
   - Usuários se comprometeram 8h/dia
   - Diferença: -2h (abaixo) 🔴

### **Card Interativo**

```
┌──────────────────────────────┐
│ Horas Dedicadas              │
│ 9.00h                        │
│ 3 usuários comprometidos     │
│ ⓘ Clique para ver detalhes   │
└──────────────────────────────┘
```

**Ao clicar:**

Modal abre com:
```
Sugestão do Supervisor: 10h/dia (âmbar)

Horas Alocadas pelos Usuários:
  • João Silva      4h/dia
  • Maria Santos    3h/dia
  • Pedro Costa     2h/dia

Total Alocado:      9h/dia

Comparação:
  Sugestão:   10h
  Alocado:     9h
  Diferença: -1h (abaixo)
```

---

## 📈 REGRA 4: PROGRESSO ACUMULATIVO

### **Conceito Fundamental**

**Progresso % é calculado com TODAS as horas trabalhadas desde o início da tarefa**

```
✅ NUNCA ZERA (não reinicia ao trocar de dia)
✅ SEMPRE ACUMULATIVO (soma-se tudo)
✅ SÓ CONTA SESSÕES FINALIZADAS (status='stopped')
```

### **Fórmula**

```
Progresso (%) = (Horas Reais Trabalhadas / Horas Estimadas) × 100

Exemplo:
  Tarefa: 40h estimadas

  Dia 1: João trabalha 5h   → 5/40   = 12.5%
  Dia 2: Maria trabalha 3h  → 8/40   = 20%
  Dia 3: Pedro trabalha 2h  → 10/40  = 25%

  ✅ Progresso NUNCA volta para 12.5%
  ✅ Sempre mostra 25% (acumulado)
```

### **Implementação**

#### **Backend:**
```javascript
// getTaskById() - retorna sesões acumulativas
const [task] = await query(
  `SELECT
    SUM(ts.duration_hours) as total_hours_worked
   FROM time_entries_sessions ts
   WHERE ts.task_id = ? AND ts.status = 'stopped'`
  [taskId]
);

// duration_hours = som total de TODAS as sessões finalizadas
```

#### **Frontend:**
```typescript
// TaskDetail.tsx - loadData()
const sessionsResult = await timeEntriesService.getTaskSessions(tId, {
  status: 'stopped'  // ✅ Apenas finalizadas (acumulativo)
});

const sessions = sessionsResult?.data || [];
setSessions(sessions);  // Usado para calcular progresso

// Cálculo:
const totalHours = sessions.reduce((sum, s) => sum + s.duration_hours, 0);
const progress = (totalHours / task.estimated_hours) * 100;
```

### **Diferença: Progresso vs Histórico Filtrado**

```
PROGRESSO (Card):
  - Usa TODAS as sessões stopped
  - Nunca filtrado por período
  - Acumulativo permanente
  - Exibe: "35% ████░░░░░░"

HISTÓRICO (Tabela):
  - Filtrável por período (Hoje, Semana, Mês, Custom)
  - Filtrável por usuário
  - Mesmos dados, visão diferente
  - Usa same sessions but with filters applied
```

### **Validações**

```javascript
// Apenas sessions com status='stopped' contam
// Sessions 'running' ou 'paused' NÃO contam para progresso
// (porque ainda não foram finalizadas)

const progressSessions = sessions.filter(s => s.status === 'stopped');
const progressHours = progressSessions.reduce((sum, s) =>
  sum + s.duration_hours, 0
);
```

### **UI**

```
┌──────────────────────────────┐
│ Progresso                    │
│ 35%                          │
│ [████░░░░░░] Barra visual   │
│                              │
│ 14h de 40h trabalhadas      │
└──────────────────────────────┘
```

---

## ⏱️ REGRA 5: TIME TRACKING (PLAY/PAUSE/STOP)

### **Conceito**

Time Tracking = **Registrar trabalho real em SESSÕES**

```
Uma SESSÃO = período contínuo ou interrompido de trabalho

[PLAY] 09:00
  └─ Cronômetro começa
  └─ Status: 'running'

[PAUSE] 10:15
  └─ Cronômetro pausa
  └─ Contador de pausa inicia
  └─ Status: 'paused'

[RESUME] 10:30
  └─ Cronômetro retoma (sem pular)
  └─ Contador de pausa pausa
  └─ Status: 'running'

[STOP] 13:00
  └─ Sessão finalizada
  └─ Status: 'stopped'
  └─ Horas registradas: 3h 15m
  └─ Pausa registrada: 15m
```

### **Estados de uma Sessão**

```
running  → Usuário está trabalhando AGORA
paused   → Trabalho parado temporariamente
stopped  → Sessão finalizada e salva
```

### **Fluxo Técnico Detalhado**

#### **1. PLAY (POST /api/tasks/:taskId/time-entries/start)**

```javascript
// Validações:
1️⃣ Verifica se tarefa existe
2️⃣ Verifica se usuário está atribuído a essa tarefa
3️⃣ Valida validateTimeEntryStart(userId)
   └─ Soma time_entries_sessions.duration_hours do DIA
   └─ Se >= 8h: bloqueia (botão fica desabilitado)
   └─ Retorna: can_start, completed_hours_today, available_hours

4️⃣ Verifica se há sessão ativa (running ou paused)
   └─ Se sim: rejeita (uma sessão por vez)

5️⃣ Cria nova sessão:
   INSERT INTO time_entries_sessions (
     task_id, user_id, status='running',
     start_time=NOW(), created_at=NOW()
   )

// Resposta:
{
  success: true,
  data: {
    id: 1234,
    status: 'running',
    start_time: '2026-01-07T09:00:00Z',
    duration_minutes: 0,
    duration_hours: 0,
    duration_total_seconds: 0
  },
  warnings: [
    { type: 'info', message: 'Você já trabalhou 5h hoje' }
  ]
}
```

#### **2. PAUSE (PATCH /api/tasks/:taskId/time-entries/:sessionId/pause)**

```javascript
// Validações:
1️⃣ Verifica se sessão existe e pertence a taskId + userId
2️⃣ Verifica se status é 'running' (não pode pausar pausado)

3️⃣ Calcula tempo trabalhado:
   duration_total_seconds += (NOW() - resume_time || start_time)

4️⃣ Inicia contador de pausa:
   pause_time = NOW()
   paused_total_seconds = 0 (começa a contar)
   pause_count += 1

5️⃣ Atualiza sessão:
   UPDATE time_entries_sessions
   SET status='paused', pause_time=NOW(),
       duration_total_seconds=...
   WHERE id = sessionId
```

#### **3. RESUME (PATCH /api/tasks/:taskId/time-entries/:sessionId/resume)**

```javascript
// Validações:
1️⃣ Verifica se sessão existe
2️⃣ Verifica se status é 'paused'

3️⃣ Rastreia tempo pausado:
   paused_total_seconds += (NOW() - pause_time)

4️⃣ Retoma o cronômetro:
   resume_time = NOW()
   status = 'running'
```

#### **4. STOP (PATCH /api/tasks/:taskId/time-entries/:sessionId/stop)**

```javascript
// Validações:
1️⃣ Verifica se sessão existe
2️⃣ Verifica se status é 'running' ou 'paused'

3️⃣ Calcula tempo FINAL:
   if (status === 'running') {
     duration_total_seconds += (NOW() - resume_time || start_time)
   }
   // Se 'paused': NÃO soma mais nada

4️⃣ Converte para horas:
   duration_hours = duration_total_seconds / 3600

5️⃣ Finaliza sessão:
   UPDATE time_entries_sessions
   SET status='stopped', end_time=NOW(),
       duration_total_seconds=..., duration_hours=...
   WHERE id = sessionId

6️⃣ Atualiza task (se primeira sessão):
   UPDATE tasks SET date_begin_real=NOW()
   WHERE id = taskId AND date_begin_real IS NULL
```

### **Precisão em SEGUNDOS**

✅ **Problema resolvido:** Antes contava apenas minutos
✅ **Solução:** Armazena `duration_total_seconds` (preciso)

```
ANTES (minutos):
  Trabalhou: 1h 5m 30s
  Registrou: 1h 5m (perdeu 30s)

DEPOIS (segundos):
  Trabalhou: 1h 5m 30s
  Registrou: 1h 5m 30s (exato!)

  Cálculo: duration_total_seconds = 3930 segundos
           duration_hours = 3930/3600 = 1.0917h
```

### **Rastreamento de Pausa**

```
time_entries_sessions tem:
├─ pause_time: quando foi pausado
├─ paused_total_seconds: total de tempo pausado
├─ pause_count: quantas vezes pausou
└─ resume_time: quando foi retomado

Exemplo:
  Começa 09:00
  Pausa 10:15 (75 minutos trabalhados)
  Retoma 10:30 (15 minutos de pausa)
  Pausa 11:45 (75 minutos trabalhados)
  Retoma 12:00 (15 minutos de pausa)
  Para 13:00 (60 minutos trabalhados)

  Total trabalhado: 75 + 75 + 60 = 210 minutos = 3.5h
  Total pausa: 15 + 15 = 30 minutos
  Pause count: 2
```

---

## 📅 REGRA 6: CONCLUSÃO ESTIMADA DINÂMICA

### **Conceito**

"Conclusão Estimada" = **Data prevista de conclusão baseada no ritmo atual de trabalho**

```
Fórmula:
Data Estimada = Hoje + (Horas Estimadas ÷ Total de Horas Dedicadas)

Exemplo:
  Tarefa: 40h estimadas
  Atribuições: João 4h/dia + Maria 3h/dia = 7h/dia

  Conclusão Estimada = Hoje + (40 ÷ 7) = Hoje + 5.7 dias ≈ Dia 6
```

### **Recalcula Automaticamente**

```
Dia 1: João 4h, Maria 3h = 7h/dia
       Conclusão = Dia 6

Dia 2: João reduz para 2h, Maria mantém 3h = 5h/dia
       Recalcula = Dia 9 ⬆️ (aumento!)

Dia 3: Pedro entra com 2h = 7h/dia novamente
       Recalcula = Dia 6 ⬇️ (volta!)
```

### **Implementação**

```typescript
// TaskDetail.tsx linha 258
const getEstimatedCompletionDate = () => {
  const totalDailyHours = assignees.reduce((sum, a) =>
    sum + (parseFloat(a.daily_hours?.toString() || '0')), 0
  );

  if (totalDailyHours === 0) {
    return 'Sem atribuições';  // Não é possível estimar
  }

  const estimatedDays = (task?.estimated_hours || 0) / totalDailyHours;
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + Math.ceil(estimatedDays));

  return completionDate.toLocaleDateString('pt-BR');
};
```

### **UI Display**

```
┌──────────────────────────────┐
│ Conclusão Estimada           │
│ 15/01/2026                   │
│ (em 6 dias de trabalho)      │
└──────────────────────────────┘
```

---

## 🔍 REGRA 7: FILTROS DE HISTÓRICO

### **Conceito**

Filtros = **Visualizar o mesmo histórico de sessões de diferentes perspectivas**

```
Mesmo dado (todas as sessões), múltiplas visões:

[Todos]      → Todas as sessões desde início
[Hoje]       → Apenas de hoje
[Semana]     → Últimos 7 dias
[Mês]        → Últimos 30 dias
[Custom]     → Range que você escolhe

+ Filtro por Usuário:
  Todos / João / Maria / Pedro
```

### **Implementação**

#### **Filtro por Período:**

```sql
-- Query Backend (timeEntriesController.js)

if (period === 'today') {
  WHERE DATE(ts.created_at) = CURDATE()
}

if (period === 'week') {
  WHERE ts.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
}

if (period === 'month') {
  WHERE ts.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
}

if (period === 'custom' && start_date && end_date) {
  WHERE DATE(ts.created_at) BETWEEN ? AND ?
  // start_date, end_date
}
```

#### **Filtro por Usuário:**

```sql
if (user_id) {
  WHERE ts.user_id = ?
}
```

#### **Frontend:**

```typescript
// TaskDetail.tsx
const [historyPeriod, setHistoryPeriod] = useState('all');
const [customStartDate, setCustomStartDate] = useState('');
const [customEndDate, setCustomEndDate] = useState('');
const [historyUserFilter, setHistoryUserFilter] = useState(undefined);
const [historySessions, setHistorySessions] = useState([]);

// useEffect observa mudanças e recarrega
useEffect(() => {
  if (taskId) {
    loadHistorySessions();  // Chama com filtros atuais
  }
}, [historyPeriod, customStartDate, customEndDate, historyUserFilter]);

// Monta query params
const filters = {
  period: historyPeriod,
  start_date: customStartDate,
  end_date: customEndDate,
  user_id: historyUserFilter
};

const result = await timeEntriesService.getTaskSessions(taskId, filters);
```

### **UI**

```
┌────────────────────────────────────────────┐
│ FILTROS DE HISTÓRICO                       │
├────────────────────────────────────────────┤
│ Período:                                   │
│ [Todos] [Hoje] [Semana] [Mês] [Custom]   │
│                                            │
│ (Se Custom:)                               │
│ De: [01/01/26]  Até: [07/01/26]           │
│                                            │
│ Usuário: [Todos os usuários ▼]            │
│          ├─ João Silva                     │
│          ├─ Maria Santos                   │
│          └─ Pedro Costa                    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ HISTÓRICO DE SESSÕES - Semana (João)       │
├────────────────────────────────────────────┤
│ Início           │ Usuário      │ Duração  │
│─────────────────────────────────────────── │
│ 05/01 09:15     │ João Silva   │ 3h 45m   │
│ 06/01 14:30     │ João Silva   │ 2h 30m   │
│ 07/01 08:00     │ João Silva   │ 4h 20m   │
└────────────────────────────────────────────┘
```

### **Importante: Progresso NÃO muda ao filtrar**

```
Progresso usa: TODAS as sessions stopped (sem filtro)
Histórico usa: Filtered sessions (com filtros aplicados)

Exemplo:
  Filtro "Hoje":
    ├─ Mostra apenas sessões de hoje
    └─ Mas progresso continua usando TUDO

  Isso é CORRETO porque:
    ✅ Progresso é acumulativo permanente
    ✅ Histórico é apenas view dos dados
```

---

## 🔄 FLUXOS COMPLETOS

### **FLUXO 1: Criar Tarefa → Atribuir → Trabalhar**

```
1. SUPERVISOR cria tarefa
   POST /api/tasks/stage/5
   {
     title: "Implementar Login",
     estimated_hours: 40,
     daily_hours: 8  // Sugestão
   }
   ✅ Resultado: Tarefa criada

2. SUPERVISOR atribui usuários
   POST /api/tasks/18/assign
   {
     assignments: [
       { user_id: 7, daily_hours: 4 },  // João
       { user_id: 8, daily_hours: 3 }   // Maria
     ]
   }
   ✅ Validação: 4 + 3 = 7h <= 8h ✅
   ✅ Resultado: Usuários atribuídos

3. JOÃO inicia sessão
   POST /api/tasks/18/time-entries/start
   ✅ Validação: validateTimeEntryStart(userId)
      └─ Hoje João trabalhou 2h em outras tarefas
      └─ 2 + 4 (novo) = 6h <= 8h ✅
   ✅ Resultado: Sessão criada, cronômetro iniciado

4. JOÃO trabalha 2.5h e pausa
   PATCH /api/tasks/18/time-entries/1234/pause
   ✅ Resultado: duration_total_seconds = 9000 (2.5h)

5. JOÃO retoma e trabalha mais 1h
   PATCH /api/tasks/18/time-entries/1234/resume
   [trabalha]
   PATCH /api/tasks/18/time-entries/1234/stop
   ✅ Resultado: duration_total_seconds = 13500 (3.75h)

6. MARIA trabalha 3h em outra tarefa, depois nessa
   [mesmo fluxo]
   ✅ Resultado: 3h registrada

7. SUPERVISOR vê progresso
   GET /api/tasks/18
   ├─ Horas Estimadas: 40h
   ├─ Horas Dedicadas: 7h/dia (4+3)
   ├─ Progresso: 6.75h registradas = 16.9%
   ├─ Conclusão Estimada: Dia 6 (40÷7)
   └─ Histórico: [João 3.75h, Maria 3h, ...]
```

### **FLUXO 2: Editar Compromisso e Recalcular**

```
1. JOÃO vê que 4h/dia é muita carga
   Pede para reduzir para 2.5h

2. SUPERVISOR atualiza
   PATCH /api/tasks/18/assign/7
   { daily_hours: 2.5 }
   ✅ Validação: 2.5 + 3 (Maria) = 5.5h <= 8h ✅

3. SISTEMA recalcula automaticamente
   Horas Dedicadas: 5.5h/dia (era 7h)
   Conclusão Estimada: Dia 8 (era Dia 6)

4. SUPERVISOR nota atraso potencial
   Vê que está abaixo da sugestão (8h)
   Decide alocar mais recursos
```

---

## ✅ VALIDAÇÕES

### **Validações na ATRIBUIÇÃO (POST /assign)**

```
1. daily_hours é número?
   ✅ parseFloat() converte string → número

2. daily_hours está entre 0-8?
   ✅ if (userHours < 0 || userHours > 8) { erro }

3. Limite 8h/dia não ultrapassa?
   ✅ validateUserDailyHours() valida SOMA total
   └─ current_hours + requestedHours <= 8

4. Usuário existe?
   ✅ Implícito via foreign key (user_id)

5. Tarefa existe?
   ✅ SELECT * FROM tasks WHERE id = taskId
   └─ Se não existe: erro 404
```

### **Validações na EDIÇÃO (PATCH /assign/:userId)**

```
1. Mesmo que atribuição (0-8, soma 8h)

2. Assignment existe?
   ✅ SELECT * FROM task_assignments
   └─ Se não existe: erro 404

3. Permissão?
   ✅ Usuário pode editar seu próprio
   ✅ Supervisor/Admin pode editar qualquer um
```

### **Validações no PLAY**

```
1. Tarefa existe?
   ✅ SELECT * FROM tasks WHERE id = taskId

2. Usuário atribuído?
   ✅ SELECT * FROM task_assignments WHERE task_id=? AND user_id=?
   └─ Se não: erro 403

3. Sessão ativa já existe?
   ✅ SELECT * WHERE status IN ('running', 'paused')
   └─ Se sim: erro (uma sessão por vez)

4. 8h/dia não ultrapassa?
   ✅ validateTimeEntryStart(userId)
   └─ SUM(duration_hours) + nova sessão <= 8h
   └─ Se não: botão PLAY desabilitado no frontend

5. Atribuição é válida?
   ✅ Se user_id não está em task_assignments
   └─ Erro 403 Forbidden
```

---

## 📊 ESTRUTURA DE DADOS

### **Tabela: task_assignments**

```sql
CREATE TABLE task_assignments (
  task_id INT,
  user_id INT,
  daily_hours DECIMAL(3, 2),  -- 0.00 a 8.00
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  PRIMARY KEY (task_id, user_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **Tabela: time_entries_sessions**

```sql
CREATE TABLE time_entries_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT,
  user_id INT,
  status ENUM('running', 'paused', 'stopped'),

  start_time TIMESTAMP,          -- Quando começou
  pause_time TIMESTAMP NULL,     -- Quando pausou
  resume_time TIMESTAMP NULL,    -- Quando retomou
  end_time TIMESTAMP NULL,       -- Quando finalizou

  duration_minutes INT,          -- Legacy
  duration_hours DECIMAL(6, 2),  -- Legacy
  duration_total_seconds INT,    -- ✅ Preciso

  paused_minutes INT,            -- Legacy
  paused_total_seconds INT,      -- ✅ Preciso
  pause_count INT,               -- Quantas vezes pausou

  notes TEXT,
  created_at TIMESTAMP,

  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_task_date (task_id, created_at),
  INDEX idx_user_date (user_id, created_at)
);
```

### **Relação Hierárquica**

```
projects (1)
  └─ project_stages (n)
      └─ tasks (n)
          ├─ task_assignments (n) ── users (n)
          │   └─ Cada usuário com daily_hours
          └─ time_entries_sessions (n)
              └─ Histórico de trabalho real
```

---

## 🎯 RESUMO EXECUTIVO

### **As 7 Regras em Uma Frase**

1. **Atribuição** → Supervisores definem quem trabalha quanto/dia em cada tarefa
2. **Limite 8h** → Um usuário não pode se comprometer com >8h/dia TOTAL
3. **Horas Dedicadas** → Soma de todos os compromissos de uma tarefa
4. **Progresso** → (Horas reais / estimadas) × 100, nunca zera
5. **Time Tracking** → Play/Pause/Stop registra trabalho real em segundos
6. **Conclusão** → Estimada = hoje + (estimadas ÷ horas dedicadas/dia)
7. **Filtros** → Visualizar histórico por período e/ou usuário

### **Fluxo Simplificado**

```
Supervisor cria → Atribui usuários → Usuários trabalham (play/pause/stop)
                    ↓
            Valida 8h/dia TOTAL

            ↓
        Sistema calcula:
        - Progresso (acumulativo)
        - Conclusão (dinâmica)
        - Horas Dedicadas (soma)

            ↓
        Usuário vê histórico filtrado
```

---

**Documento Técnico v2.2 - Janeiro 2026**
**Próximas: Regras de Dashboard, Monitoramento e Admin**
