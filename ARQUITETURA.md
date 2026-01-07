# Arquitetura do Sistema de Gestão de Projetos de Engenharia

## Visão Geral

Sistema web de monitoramento e gestão de projetos de engenharia com controle de horas, etapas, tarefas e Kanban integrado.

## Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express (API REST)
- **Database**: MySQL 8.0+ (XAMPP)
- **DB Management**: HeidiSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **UI Icons**: Lucide React

---

## Perfis de Usuário

### 1. User (Engenheiro/Técnico)
**Permissões:**
- ✅ Visualizar apenas projetos em que está atribuído
- ✅ Visualizar etapas e tarefas atribuídas
- ✅ Definir quantas horas por dia dedicará a cada tarefa
- ✅ Mover tarefas entre "Novo" e "Em Desenvolvimento"
- ❌ Não pode criar projetos, etapas ou tarefas
- ❌ Não pode exceder 8 horas por dia (soma de todas as tarefas)

### 2. Supervisor (Gestor)
**Permissões:**
- ✅ Todas as permissões do User
- ✅ Criar, editar e excluir projetos
- ✅ Definir prazo final do projeto
- ✅ Criar, editar e excluir etapas do projeto
- ✅ Criar, editar e excluir tarefas dentro das etapas
- ✅ Atribuir usuários às tarefas
- ✅ Mover tarefas para "Análise Técnica", "Concluído" e "Refaça"
- ✅ Acessar Dashboard com estatísticas
- ✅ Acessar Kanban completo

### 3. Admin (Administrador)
**Permissões:**
- ✅ Acesso total ao sistema
- ✅ Todas as permissões do Supervisor
- ✅ Visualizar desempenho individual de todos os usuários
- ✅ Visualizar desempenho por equipe
- ✅ Visualizar desempenho por supervisor
- ✅ Acessar relatórios e monitoramento avançado
- ✅ Gerenciar usuários e permissões

---

## Estrutura de Dados

### Hierarquia
```
Projeto
├── Etapa 1 (order: 1)
│   ├── Tarefa 1.1 (order: 1)
│   ├── Tarefa 1.2 (order: 2)
│   └── Tarefa 1.3 (order: 3)
├── Etapa 2 (order: 2)
│   ├── Tarefa 2.1 (order: 1)
│   └── Tarefa 2.2 (order: 2)
└── Etapa 3 (order: 3)
    └── Tarefa 3.1 (order: 1)
```

### Relacionamentos
- Um **Projeto** possui múltiplas **Etapas**
- Uma **Etapa** possui múltiplas **Tarefas**
- Uma **Tarefa** pode ter múltiplos **Usuários** atribuídos (N:N)
- Um **Usuário** pode registrar múltiplas **Entradas de Tempo** por tarefa
- Um **Supervisor** pode gerenciar múltiplos **Projetos**

---

## Kanban - Fluxo de Status

### Estados Fixos (não podem ser alterados)
```
1. novo
2. em_desenvolvimento
3. analise_tecnica
4. concluido
5. refaca
```

### Regras de Transição

| Status Atual | Pode Mover Para | Quem Pode Mover |
|--------------|-----------------|-----------------|
| novo | em_desenvolvimento | User, Supervisor, Admin |
| em_desenvolvimento | novo, analise_tecnica | User (novo), Supervisor/Admin (analise_tecnica) |
| analise_tecnica | concluido, refaca | Supervisor, Admin |
| concluido | - | - |
| refaca | em_desenvolvimento | User, Supervisor, Admin |

### Características Especiais

**Status "refaca":**
- Possui **prioridade máxima**
- Tarefas neste status devem ser destacadas visualmente (vermelho, destaque)
- Aparecem no topo do Dashboard como alerta
- Somente Supervisor/Admin podem mover para este status

**Bloqueios:**
- Users **NÃO** podem mover para: "analise_tecnica", "concluido", "refaca"
- Apenas Supervisor/Admin podem finalizar ou rejeitar tarefas

---

## Cálculo de Prazo (Ponto Crítico)

### Regras Fundamentais

1. **Limite diário por usuário**: 8 horas
2. **Dias úteis por mês**: 22 dias
3. **Usuário define**: quantas horas por dia dedicará a cada tarefa

### Algoritmo de Cálculo

```typescript
// Exemplo de cálculo
const calcularPrazoEstimado = (tarefa: Task, usuariosAtribuidos: User[]) => {
  const horasPorUsuario = tarefa.estimated_hours / usuariosAtribuidos.length;
  const horasDiariasPorUsuario = tarefa.daily_hours;

  // Quantos dias cada usuário levará para completar sua parte
  const diasNecessarios = Math.ceil(horasPorUsuario / horasDiariasPorUsuario);

  return diasNecessarios;
};
```

### Validações Obrigatórias

1. **Ao atribuir horas diárias:**
   - Somar todas as tarefas do usuário
   - Se soma > 8h: **BLOQUEAR** e exibir erro

2. **Ao calcular prazo do projeto:**
   - Somar tempo estimado de todas as etapas
   - Considerar se etapas são paralelas ou sequenciais
   - Comparar com data final definida pelo supervisor

3. **Marcação de Risco:**
   - Se prazo estimado > data final: marcar projeto como **"Em Risco de Atraso"**
   - Exibir alertas visuais

### Fórmulas de Cálculo

```typescript
// Tempo estimado de uma tarefa
tempoTarefa = estimatedHours / dailyHours // em dias

// Tempo de uma etapa (sequencial)
tempoEtapaSequencial = soma(todasTarefas.tempoTarefa)

// Tempo de uma etapa (paralela)
tempoEtapaParalela = max(todasTarefas.tempoTarefa)

// Tempo total do projeto
tempoTotalProjeto = soma(etapasSequenciais) + max(etapasParalelas)
```

---

## Dashboard (Supervisor/Admin)

### Métricas Principais

1. **Projetos em Andamento**
   - Contagem de projetos com status "active"

2. **Projetos em Risco**
   - Projetos onde prazo estimado > data final
   - Projetos com menos de 7 dias até o prazo

3. **Usuários Ativos no Momento**
   - Usuários com tarefas em "em_desenvolvimento"
   - Últimas atividades registradas

4. **Tarefas em "Refaça"**
   - Contagem total
   - Lista detalhada com destaque visual

### Visualizações

- **Gráfico de Distribuição de Status**
  - Barras horizontais mostrando quantidade por status

- **Lista de Tarefas Recentes**
  - Últimas 10 tarefas atualizadas

- **Alertas de Prazo**
  - Projetos próximos do vencimento

---

## Monitoramento (Admin Only)

### 1. Desempenho Individual

Métricas por usuário:
- Total de tarefas concluídas
- Média de tempo por tarefa
- Taxa de tarefas em "refaca"
- Tarefas em andamento
- Horas registradas vs estimadas

### 2. Desempenho por Equipe

Métricas agregadas:
- Produtividade da equipe
- Projetos concluídos no prazo
- Taxa de sucesso (concluídas vs total)

### 3. Desempenho por Supervisor

Comparativo entre supervisores:
- Quantidade de projetos gerenciados
- Taxa de sucesso dos projetos
- Número de tarefas em "refaca" sob sua supervisão
- Projetos em risco

### 4. Indicadores de Má Gestão

**Sinais de alerta:**
- Alta taxa de tarefas em "refaca"
- Muitos projetos atrasados
- Estimativas consistentemente incorretas
- Usuários com carga horária mal distribuída
- Etapas bloqueadas por muito tempo

---

## Pontos Críticos de Validação

### 1. Validação de Horas Diárias
```typescript
// CRÍTICO: Validar ao salvar daily_hours
const validarCargaHoraria = async (userId: number, taskId: number, novasHoras: number) => {
  const tarefasDoUsuario = await buscarTarefasAtivas(userId);
  const somaAtual = tarefasDoUsuario
    .filter(t => t.id !== taskId)
    .reduce((sum, t) => sum + t.daily_hours, 0);

  if (somaAtual + novasHoras > 8) {
    throw new Error('Limite de 8 horas diárias excedido');
  }
};
```

### 2. Validação de Transição de Status
```typescript
const podeAlterarStatus = (userRole: Role, fromStatus: Status, toStatus: Status): boolean => {
  const statusProibidosUser = ['analise_tecnica', 'concluido', 'refaca'];

  if (userRole === 'user' && statusProibidosUser.includes(toStatus)) {
    return false;
  }

  return true;
};
```

### 3. Cálculo de Risco de Projeto
```typescript
const calcularRiscoProjeto = (projeto: Project): 'normal' | 'risco' | 'atrasado' => {
  const prazoEstimado = calcularPrazoEstimadoProjeto(projeto);
  const prazoDefinido = new Date(projeto.due_date);
  const hoje = new Date();

  if (prazoEstimado > prazoDefinido) {
    return 'risco';
  }

  if (prazoDefinido < hoje) {
    return 'atrasado';
  }

  return 'normal';
};
```

---

## Segurança e Permissões

### Controle de Acesso na API

**Middleware de autenticação:**
- Todas as rotas protegidas por JWT
- Token expira em 24 horas
- Refresh token válido por 7 dias

**Middleware de autorização:**

1. **Projetos:**
   - User: vê apenas projetos onde tem tarefas atribuídas
   - Supervisor: vê projetos criados por ele
   - Admin: vê todos

2. **Tarefas:**
   - User: vê apenas tarefas atribuídas a ele
   - Supervisor: vê todas as tarefas de seus projetos
   - Admin: vê todas

3. **Usuários:**
   - User: vê apenas seu próprio perfil
   - Supervisor: vê perfis de sua equipe
   - Admin: vê todos

---

## Performance e Otimização

### Índices do Banco de Dados

1. **Índices obrigatórios:**
   - `users.email` (UNIQUE)
   - `projects.supervisor_id`
   - `project_stages.project_id`
   - `tasks.stage_id`
   - `tasks.status`
   - `task_assignments.user_id`
   - `task_assignments.task_id`
   - `time_entries.user_id`
   - `time_entries.task_id`
   - `time_entries.date`

2. **Índices compostos:**
   - `(task_assignments.user_id, task_assignments.task_id)` - UNIQUE
   - `(tasks.stage_id, tasks.order)`
   - `(project_stages.project_id, project_stages.order)`

### Caching (Frontend)

1. **React Query / SWR:**
   - Dashboard stats: cache de 5 minutos
   - Lista de projetos: revalidar ao criar/atualizar
   - Perfil do usuário: cache de 1 hora

2. **Paginação:**
   - Tarefas: 50 por página
   - Projetos: 20 por página
   - Time entries: 100 por página

---

## API REST - Endpoints Principais

### Autenticação
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

### Usuários
```
GET    /api/users              (Admin only)
GET    /api/users/:id          (Own profile or Admin)
PUT    /api/users/:id          (Own profile or Admin)
DELETE /api/users/:id          (Admin only)
```

### Projetos
```
GET    /api/projects           (Filtra por permissão)
POST   /api/projects           (Supervisor, Admin)
GET    /api/projects/:id
PUT    /api/projects/:id       (Supervisor, Admin)
DELETE /api/projects/:id       (Supervisor, Admin)
GET    /api/projects/:id/risk  (Calcula risco do projeto)
```

### Etapas
```
GET    /api/projects/:projectId/stages
POST   /api/projects/:projectId/stages      (Supervisor, Admin)
PUT    /api/stages/:id                      (Supervisor, Admin)
DELETE /api/stages/:id                      (Supervisor, Admin)
```

### Tarefas
```
GET    /api/stages/:stageId/tasks
POST   /api/stages/:stageId/tasks           (Supervisor, Admin)
GET    /api/tasks/:id
PUT    /api/tasks/:id                       (Validar permissão por status)
DELETE /api/tasks/:id                       (Supervisor, Admin)
PATCH  /api/tasks/:id/status                (Validar transição)
```

### Atribuições
```
POST   /api/tasks/:taskId/assignments       (Supervisor, Admin)
DELETE /api/tasks/:taskId/assignments/:userId (Supervisor, Admin)
```

### Dashboard
```
GET    /api/dashboard/stats                 (Supervisor, Admin)
GET    /api/dashboard/tasks/recent          (Supervisor, Admin)
```

### Monitoramento
```
GET    /api/monitoring/users                (Admin only)
GET    /api/monitoring/teams                (Admin only)
GET    /api/monitoring/supervisors          (Admin only)
GET    /api/monitoring/users/:id/performance (Admin only)
```

---

## Próximos Passos de Implementação

1. ✅ Criar schema do banco de dados MySQL
2. ✅ Configurar servidor Express + MySQL
3. ✅ Implementar autenticação JWT
4. ✅ Criar endpoints da API REST
5. ✅ Implementar validações de negócio
6. ✅ Criar triggers e procedures no MySQL
7. ✅ Integrar frontend com API
8. ✅ Implementar sistema de notificações
9. ✅ Criar relatórios exportáveis (PDF/Excel)
10. ✅ Adicionar sistema de comentários em tarefas

---

## Diferenciais do Sistema

- **Controle automático de horas**: Impede alocação excessiva
- **Cálculo inteligente de prazos**: Considera disponibilidade real
- **Alertas proativos**: Identifica riscos antes de virarem problemas
- **Priorização automática**: Status "refaca" sempre no topo
- **Monitoramento granular**: Métricas por indivíduo, equipe e gestor
- **Indicadores de gestão**: Identifica problemas de planejamento
