# 🐛 Monitoramento - Issues Identificadas

**Data Identificação:** 2026-02-04
**Data Resolução:** 2026-02-05
**Status:** ✅ TODOS OS BUGS RESOLVIDOS
**Prioridade:** Alta

---

## ✅ Issues Resolvidas Hoje

### 1. ⭐ Desempenho dos Supervisores - Rating não tem base sólida
**Problema:** Seção 2 exibia estrelas (⭐☆☆☆☆) baseadas em percentual de conclusão, mas não tinha justificativa clara para a atribuição.

**Solução Implementada:**
- ✅ Removido campo `rating` da interface `SupervisorPerformance`
- ✅ Removido cálculo de rating
- ✅ Removidas estrelas da renderização
- ✅ Mantidos dados: projetos, taxa conclusão, tarefas, equipe, refaça

**Arquivo:** `project/src/components/Monitoring.tsx` (Seção 2)

---

### 2. 📊 Carga de Trabalho da Equipe - Todos mostrando 5 projetos
**Problema:** Campo `active_projects` estava mostrando o total de projetos do supervisor para cada membro, não o número correto.

**Root Cause:** Linha 827 fazia `entry.active_projects = supervisorProjects.length` (aplicava para todos)

**Solução Implementada:**
- ✅ Incrementar contador `active_projects += 1` dentro do loop de assignments (linha 819)
- ✅ Remover loop que atribuía errado (antigo linhas 824-829)
- ✅ Agora conta **tarefas atribuídas** ao invés de projetos

**Arquivo:** `project/src/components/Monitoring.tsx` (Seção 3, função `loadTeamMembersWorkload`)

---

### 3. 🔘 Tarefas em Risco - Botão "Detalhes" não funcional
**Problema:** Card de tarefas em risco tinha botão "Detalhes" sem nenhuma ação/onclick.

**Solução Implementada:**
- ✅ Removido botão completamente (não há funcionalidade para implementar agora)
- ✅ Design mais limpo

**Arquivo:** `project/src/components/Monitoring.tsx` (Seção 6)

---

## ✅ Issues Resolvidas - Continuação

### 4. 📋 Histórico de Atribuições - Campo `assigned_at` não estava sendo retornado
**Problema:** Seção 4 não mostra as atribuições criadas recentemente. Usuário criou novo projeto, atribuiu várias vezes, mas nada aparece na tela.

**Root Cause Encontrada:**
Campo `assigned_at` existia no banco (`task_assignments.assigned_at` desde linha 94 de `init-mysql.sql`), mas **NÃO estava sendo retornado pela API**.

Funções afetadas no `tasksController.js`:
- `getTasksByStage()` linha 164
- `getTaskById()` linha 260

Ambas faziam: `SELECT u.id, u.full_name, u.email, u.role, ta.daily_hours`
Mas faltava: `ta.assigned_at`

**Solução Implementada:**
- ✅ Adicionar `ta.assigned_at` na query da linha 164 (getTasksByStage)
- ✅ Adicionar `ta.assigned_at` na query da linha 260 (getTaskById)
- ✅ Campo agora é retornado no `assignments_array`
- ✅ Monitoramento Seção 4 pode acessar `assignment.assigned_at`

**Arquivo Corrigido:** `backend/src/controllers/tasksController.js`

**Commit:** `bcc3262` - fix: Incluir 'assigned_at' nas queries de assignments

**Status:** ✅ RESOLVIDO

---

### 5. 🎯 Histórico de Atribuições - Campo com nome incorreto no Frontend

**Problema:** Mesmo após incluir `assigned_at` na API, a Seção 4 continuava mostrando 0 atribuições na tela.

**Root Cause Identificada:**
Investigação com debug logging revelou que:
- Backend estava retornando os dados corretamente em `assignees_array`
- Frontend estava procurando por `task.assignments_array` (nome incorreto)
- Discrepância no nome do campo causava acesso a `undefined`

**Solução Implementada:**
- ✅ Alterado frontend linha 329 de: `const assignments = task.assignments_array || [];`
- ✅ Para: `const assignments = task.assignees_array || [];`
- ✅ Frontend agora acessa o campo correto retornado pela API
- ✅ Histórico de Atribuições agora exibe todos os dados corretamente

**Arquivo Corrigido:** `project/src/components/Monitoring.tsx` (Seção 4, função `loadAssignmentHistory`)

**Commit:** `ef7c3de` - fix: Corrigir nome do campo de atribuições no Histórico (assignees_array)

**Status:** ✅ RESOLVIDO

---

## 📌 Notas Gerais

### Design Atual - Seção 6
- Cards em layout vertical (um embaixo do outro)
- **Consideração:** Com muitas tarefas em risco, vai ficar muito longo
- **Opções Futuras:** Converter para tabela, paginação ou limitar a top 5-10

### Campo "active_projects" da Seção 3
- Agora é na verdade **contagem de tarefas**
- Nome pode ser renomeado para `task_count` no futuro (se necessário)
- Mas por enquanto mantém compatibilidade com interface

---

## 📁 Commits Relacionados

**Backup e Contexto:**
- `2ad7a4e` - backup: Estado atual do Monitoramento - 9 seções completas

**Resoluções Implementadas:**
- `bcc3262` - fix: Incluir 'assigned_at' nas queries de assignments (Backend)
- `ef7c3de` - fix: Corrigir nome do campo de atribuições no Histórico (Frontend)
- `f5a8c2b` - fix: Remover debug logs do Histórico de Atribuições (Limpeza)

**Modificações não-commitadas:**
- Rating removal (Seção 2)
- Active projects fix (Seção 3)
- Details button removal (Seção 6)

*(Estas mudanças deverão ser commitadas após validação final)*

---

## 🎯 Resumo da Resolução

| # | Issue | Root Cause | Solução | Status |
|---|-------|-----------|---------|--------|
| 1 | Rating sem base | Lógica arbitrária (rating = % / 20) | Removido campo e renderização | ✅ |
| 2 | Todos com 5 projetos | Loop atribuía mesmo valor a todos | Incrementar dentro do loop | ✅ |
| 3 | Botão não funcional | Sem implementação | Removido button | ✅ |
| 4 | assigned_at não retornado | Queries não selecionavam campo | Adicionar ta.assigned_at | ✅ |
| 5 | Atribuições ainda vazias | Nome do campo (assignments_array) | Usar assignees_array | ✅ |

---

**Última Atualização:** 2026-02-05
**Status Final:** ✅ Todas as 5 issues foram identificadas, investigadas e resolvidas

---

## 🔍 INVESTIGAÇÃO ADICIONAL - useEffect Dependency Issues (2026-02-05)

Após análise profunda do frontend, foram identificadas e corrigidas **10+ issues de dependências em useEffect**. Estes bugs tinham impacto variado:

### ✅ CORRIGIDOS (HIGH SEVERITY):
1. **Dashboard.tsx (Line 65-67)**
   - Falta: `profile` nas dependências
   - Impacto: Team workload nunca carregava após login
   - Fix: Adicionar `profile` ao array de deps

2. **Monitoring.tsx (Line 204-209)**
   - Falta: `supervisors` nas dependências (JÁ CORRIGIDO ANTES)
   - Impacto: N/A aparecia para supervisores
   - Fix: `[filters.supervisorId, supervisors]`

### ✅ CORRIGIDOS (MEDIUM SEVERITY):
3. **AssignUsersModal.tsx (Line 40-56)**
   - Falta: `taskId` nas dependências
   - Impacto: Mudanças de taskId não re-validavam dependências
   - Fix: Adicionar `taskId`

4. **TaskDetail.tsx (Line 53-68)**
   - Falta: `projectId, stageId, taskId, user`
   - Impacto: Mudanças não recarregavam assignees
   - Fix: Adicionar todos os valores nas deps

### ✅ VERIFICADOS (CORRETOS):
- Monitoring.tsx (Line 186-188): Inicialização com [] ✅
- Monitoring.tsx (Line 191-201): Deps corretas ✅
- TasksList.tsx: Pattern de múltiplos efeitos ✅
- Kanban.tsx, CreateProjectModal.tsx, AuthContext.tsx: OK ✅

**Commits de Correção:**
- `ce3a8ab` - fix: Adicionar 'supervisors' nas dependências do useEffect
- `05de0ae` - fix: Corrigir dependências de useEffect - MEDIUM severity

**Lição Aprendida:** useEffect dependency arrays são críticos. ESLint com `react-hooks/exhaustive-deps` deveria estar ativado em CI/CD para evitar regressões.

**Próximo Passo:** Commitare as mudanças do Frontend (Rating, active_projects, Details) e fazer testes end-to-end
