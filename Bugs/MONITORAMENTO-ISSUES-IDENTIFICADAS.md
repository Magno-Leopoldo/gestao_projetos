# 🐛 Monitoramento - Issues Identificadas

**Data:** 2026-02-04
**Status:** Em Análise
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

## 🔴 Issues Pendentes - Requer Investigação

### 4. 📋 Histórico de Atribuições - Não está puxando dados
**Problema:** Seção 4 não mostra as atribuições criadas recentemente. Usuário criou novo projeto, atribuiu várias vezes, mas nada aparece na tela.

**Root Cause Identificada:**
Função `loadAssignmentHistory()` usa `assignment.assigned_at` (linha 344) para puxar data da atribuição:
```javascript
assigned_at: assignment.assigned_at || new Date().toISOString(),
```

Suspeita: O campo `assignment.assigned_at` pode não estar sendo preenchido no banco, ou tem outro nome.

**O que precisa ser feito:**
1. ❓ Verificar estrutura real de `assignments_array` no banco
2. ❓ Encontrar qual é o campo correto que guarda a data de atribuição
3. ❓ Confirmar se o campo está sendo preenchido quando nova atribuição é criada
4. ❓ Atualizar a função para usar o campo correto

**Arquivo:** `project/src/components/Monitoring.tsx` (Seção 4, função `loadAssignmentHistory`, linha 344)

**Próximos Passos:**
- [ ] Investigar estrutura de dados no banco (tabela task_assignments)
- [ ] Verificar como/quando o campo de data é preenchido
- [ ] Corrigir referência ao campo correto
- [ ] Testar com novas atribuições

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

- `2ad7a4e` - backup: Estado atual do Monitoramento - 9 seções completas
- Modificações pendentes: Rating, active_projects, botão Detalhes (não commitadas)

---

**Última Atualização:** 2026-02-04
**Próximo Passo:** Amanhã - Investigar Issue #4 (Histórico de Atribuições)
