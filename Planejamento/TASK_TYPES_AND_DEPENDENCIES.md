# Tipos de Tarefas e Sistema de Dependências

## Visão Geral

Implementação de um sistema de tipos de tarefas com suporte a dependências e bloqueios. O objetivo é permitir o controle fino sobre como tarefas se comportam em relação ao tempo de conclusão e à execução paralela.

---

## 1. Os 3 Tipos de Tarefas

### Tipo 1: PARALELA (Padrão)
- **Definição:** Tarefa que pode ser executada independentemente de outras
- **Comportamento de Tempo:** Reduz conforme mais usuários são atribuídos
  - 1 usuário = 8h
  - 2 usuários = 4h cada
  - 4 usuários = 2h cada
- **Dependências:** Nenhuma (ou múltiplas, mas não bloqueia execução)
- **Exemplos:** Análise do solo, Análise da bomba de ar, Pesquisa de mercado

### Tipo 2: NÃO-PARALELA
- **Definição:** Tarefa que depende da conclusão de uma ou mais outras tarefas
- **Comportamento de Tempo:** Reduz conforme mais usuários são atribuídos (IGUAL ao paralelo)
  - 1 usuário = 8h
  - 2 usuários = 4h cada
  - 4 usuários = 2h cada
- **PORÉM:** Só COMEÇA após a(s) tarefa(s) dependente(s) ser(em) concluída(s)
- **Dependências:** Obrigatória - depende de 1 ou mais tarefas
- **Exemplos:** Instalação da bomba (depende de análise), Manutenção (depende de instalação)

### Tipo 3: FIXA
- **Definição:** Tarefa com tempo contratado que não pode ser reduzido
- **Comportamento de Tempo:** Nunca reduz
  - 50h é sempre 50h
  - 1 usuário = 50h
  - 50 usuários = 50h (não muda!)
- **Dependências:** Pode ou não ter
- **Exemplos:** Acompanhamento de retorno (50h contratadas), Consultoria (30h contratadas)

---

## 2. Matriz de Comportamento

| Tipo | Reduz com Usuários? | Depende de Outras? | Bloqueia Execução? | Exemplo |
|------|---------------------|------------------|-------------------|---------|
| **PARALELA** | ✅ SIM | ❌ NÃO | ❌ NÃO | Análise |
| **NÃO-PARALELA** | ✅ SIM | ✅ SIM | ✅ SIM | Instalação |
| **FIXA** | ❌ NÃO | ⚠️ OPCIONAL | ⚠️ OPCIONAL | Consultoria |

---

## 3. Sistema de Dependências

### Fluxo de Execução

```
Projeto
  └─ Etapa: Instalação de Bomba
      │
      ├─ Tarefa A: "Análise do Solo" (PARALELA, sem dependência)
      │   ├─ Status: novo → em_desenvolvimento → concluido ✅
      │   └─ Usuários atribuídos: Sim (desde a criação)
      │
      ├─ Tarefa B: "Análise da Bomba" (PARALELA, sem dependência)
      │   ├─ Status: novo → em_desenvolvimento → concluido ✅
      │   └─ Usuários atribuídos: Sim (desde a criação)
      │
      └─ Tarefa C: "Instalação da Bomba" (NÃO-PARALELA, depende de A e B)
          ├─ Dependências: [A, B]
          ├─ Status: novo (bloqueado enquanto A ou B não estão concluido)
          ├─ Usuários atribuídos: ❌ NÃO PERMITE (bloqueada)
          ├─ Aviso: "⚠️ Esta tarefa depende de [Análise do Solo] e [Análise da Bomba].
          │           Não é possível atribuir usuários até que sejam concluídas."
          │
          └─ Quando A e B marcadas como concluido:
              ├─ Status: desbloqueada
              ├─ Usuários atribuídos: ✅ AGORA PERMITE
              └─ Pode ser executada
```

---

## 4. Validações de Dependência

### Ao Criar Tarefa
- [ ] Selecionar tipo (paralela, não-paralela, fixa)
- [ ] Se não-paralela: OBRIGATÓRIO selecionar dependências
- [ ] Se paralela: Opcional selecionar dependências
- [ ] Se fixa: Opcional selecionar dependências

### Ao Atribuir Usuários
```
Se tarefa é NÃO-PARALELA:
  └─ Para cada dependência:
      └─ Verificar: status === 'concluido'
          ├─ SIM: ✅ Permite atribuição
          └─ NÃO: ❌ Bloqueia + mostra aviso
```

### Proteção contra Ciclos
- **Não permitir:** Tarefa A depende de B, e B depende de A
- **Validação:** Detectar dependências circulares antes de salvar

---

## 5. Comportamento de Atribuição de Usuários

### Cenário 1: Tarefa PARALELA (sem dependência)
```
Supervisor clica em "Atribuir Usuários"
  ├─ Modal abre normalmente ✅
  ├─ Lista todos os usuários disponíveis
  ├─ Para cada usuário selecionado:
  │  └─ Valida horas disponíveis (8h/dia limit)
  │     ├─ Se tem horas: ✅ Permite atribuição
  │     └─ Se não tem: ⚠️ Mostra aviso (NOVO)
  └─ Salva atribuições
```

### Cenário 2: Tarefa NÃO-PARALELA (com dependências não concluídas)
```
Supervisor clica em "Atribuir Usuários"
  ├─ Sistema verifica dependências
  ├─ Encontra: Tarefa "Análise do Solo" ainda está em "em_desenvolvimento"
  └─ BLOQUEIA:
      ├─ Modal NÃO abre
      ├─ Mostra aviso: "⚠️ Esta tarefa depende de [Análise do Solo].
      │                 Não é possível atribuir usuários até que seja concluída."
      └─ Botão fica desabilitado
```

### Cenário 3: Tarefa NÃO-PARALELA (com dependências concluídas)
```
Supervisor clica em "Atribuir Usuários"
  ├─ Sistema verifica dependências
  ├─ Encontra: Todas as dependências têm status "concluido" ✅
  └─ PERMITE:
      ├─ Modal abre normalmente
      ├─ Funciona igual ao Cenário 1
      └─ Atribuições são salvas
```

### Cenário 4: Usuário Sem Horas Disponíveis (NOVO)
```
Supervisor tenta atribuir usuário que já tem 8h/dia alocadas
  ├─ Sistema valida disponibilidade
  ├─ Detecta: Emanuel tem 8h/dia já comprometidas
  └─ MOSTRA AVISO:
      ├─ "⚠️ Emanuel já possui 8h/dia alocadas em outras tarefas"
      ├─ Mostra detalhes: "Horas atuais: 8h, Disponível: 0h"
      ├─ Opções:
      │  ├─ [Prosseguir mesmo assim] → Atribui (ele fica sobrecarregado - supervisão)
      │  └─ [Cancelar] → Volta ao modal
      └─ Permite decisão consciente do supervisor
```

---

## 6. O Que É NOVO vs O Que Já Existe

### ✅ JÁ EXISTE (Não muda)
- Cálculo de `dias_necessarios = ceil(estimated_hours / daily_hours)`
- Conclusão estimada usando data real + dias_necessarios
- Validação de 8h/dia por usuário
- Divisão de horas entre usuários
- Sistema de Play/Pause/Stop com time_entries_sessions
- Status transitions (novo → em_desenvolvimento → concluido)

### 🆕 NOVO
1. **Campo `task_type`** na tabela tasks
   - Valores: 'paralela', 'não_paralela', 'fixa'

2. **Tabela `task_dependencies`**
   - Relacionamento entre tarefas
   - Proteção contra ciclos

3. **Validação de Dependências**
   - Verificar se dependências estão concluídas
   - Bloquear atribuição se não estão

4. **Aviso de Usuário Sem Horas**
   - Modal de confirmação quando usuário não tem horas
   - Permite atribuição mesmo sem horas (decisão supervisor)

5. **Tooltips Dinâmicos**
   - Mudam conforme tipo de tarefa selecionada
   - Descrevem como cada tipo se comporta

---

## 7. Fluxo de Implementação

### Phase 1: Database
- [ ] Adicionar coluna `task_type` em tasks
- [ ] Criar tabela `task_dependencies`
- [ ] Criar view para validar dependências ativas

### Phase 2: Backend Validation
- [ ] Função: `validateTaskDependencies(taskId)`
- [ ] Função: `validateTaskTypeRequired(taskType, dependencies)`
- [ ] Função: `detectCircularDependencies(taskId, dependencyList)`
- [ ] Atualizar `createTask()` para aceitar tipo e dependências
- [ ] Atualizar `assignUsersToTask()` para validar dependências

### Phase 3: Frontend - Criação
- [ ] Atualizar `CreateTaskModal.tsx`:
  - [ ] Adicionar selector de tipo (radio ou dropdown)
  - [ ] Adicionar multi-select de dependências (carrega tarefas da etapa)
  - [ ] Validar: se não-paralela, obriga selecionar dependências
  - [ ] Tooltips dinâmicos conforme tipo selecionado

### Phase 4: Frontend - Atribuição
- [ ] Atualizar `AssignUsersModal.tsx`:
  - [ ] Validar dependências antes de abrir modal
  - [ ] Mostrar aviso se bloqueada por dependência
  - [ ] Desabilitar botão se bloqueada

- [ ] Criar `UnavailableHoursWarning.tsx`:
  - [ ] Mostra aviso quando usuário não tem horas
  - [ ] Permite prosseguir ou cancelar

### Phase 5: Display & UX
- [ ] Mostrar tipo de tarefa em TasksList
- [ ] Mostrar dependências em TaskDetail
- [ ] Mostrar status de bloqueio visualmente
- [ ] Atualizar ProgressChartModal se necessário

---

## 8. Casos de Uso

### Caso 1: Projeto de Instalação de Bomba
```
Etapa: Preparação
  - Tarefa 1: Análise do Solo (PARALELA)
    └─ 16h, 2 usuários = 8h cada = ~2 dias

  - Tarefa 2: Análise da Bomba (PARALELA)
    └─ 16h, 2 usuários = 8h cada = ~2 dias

Etapa: Execução
  - Tarefa 3: Instalação (NÃO-PARALELA, depende de 1 e 2)
    └─ 20h, 3 usuários = não reduz tempo (depende de conclusão)
    └─ Só pode atribuir usuários APÓS Análise do Solo + Análise da Bomba concluídas

  - Tarefa 4: Acompanhamento de Retorno (FIXA, depende de 3)
    └─ 50h, não reduz (50h contratadas)
    └─ Só pode atribuir APÓS Instalação concluída
```

### Caso 2: Desenvolvimento de Software
```
Etapa: Backend
  - Tarefa 1: Setup do Projeto (PARALELA)
    └─ 4h, 1 usuário = ~1 dia

  - Tarefa 2: Database Schema (PARALELA)
    └─ 16h, 2 usuários = 8h cada = ~2 dias

Etapa: Feature
  - Tarefa 3: API Endpoints (NÃO-PARALELA, depende de 2)
    └─ 24h, 2 usuários = 12h cada
    └─ Só começa APÓS Database pronto

  - Tarefa 4: Testes (NÃO-PARALELA, depende de 3)
    └─ 16h, 1 usuário = ~2 dias
    └─ Só começa APÓS API pronta
```

---

## 9. Resumo Executivo

**Objetivo:** Permitir controle de paralelismo e sequencialismo de tarefas com 3 tipos distintos.

**Tipos:**
1. **Paralela:** Reduz com usuários, sem dependência
2. **Não-Paralela:** Reduz com usuários, mas bloqueia até dependência terminar
3. **Fixa:** Nunca reduz, tempo contratado

**Novo:**
- Campo `task_type` + tabela `task_dependencies`
- Bloqueio de atribuição se dependências não concluídas
- Aviso ao atribuir usuário sem horas

**Não muda:**
- Lógica de cálculo de dias (já existe)
- Sistema de validação de 8h/dia (já existe)
- Time tracking (já existe)

---

**Data de Criação:** 2026-01-08
**Status:** Planejamento Aprovado ✅
**Próximo Passo:** Iniciar Phase 1 (Database)
