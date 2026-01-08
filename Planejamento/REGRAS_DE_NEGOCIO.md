# Regras de Negócio - Sistema de Gestão de Projetos de Engenharia

## 1. Gestão de Usuários

### RN-001: Criação de Usuário
- **Descrição**: Todo novo usuário deve ter email único e senha forte
- **Validações**:
  - Email deve ser válido e único no sistema
  - Senha deve ter no mínimo 8 caracteres
  - Senha deve conter letras maiúsculas, minúsculas e números
  - Nome completo é obrigatório
- **Comportamento Padrão**: Novo usuário criado com role 'user'

### RN-002: Perfis de Acesso
- **Descrição**: Existem 3 perfis hierárquicos: User < Supervisor < Admin
- **Hierarquia de Permissões**:
  - User: Acesso limitado apenas aos seus projetos/tarefas
  - Supervisor: Tudo de User + gestão de projetos
  - Admin: Acesso irrestrito + monitoramento global

### RN-003: Desativação de Usuário
- **Descrição**: Usuários podem ser desativados mas não excluídos
- **Validações**:
  - Apenas Admin pode desativar usuários
  - Supervisor não pode desativar a si mesmo
  - Usuários desativados mantêm histórico de tarefas
  - Tarefas do usuário desativado devem ser reatribuídas

---

## 2. Gestão de Projetos

### RN-004: Criação de Projeto
- **Descrição**: Apenas Supervisor e Admin podem criar projetos
- **Validações**:
  - Nome do projeto é obrigatório (máx 255 caracteres)
  - Data final (due_date) é obrigatória
  - Data final deve ser maior que data de início
  - Data de início padrão é a data atual
  - Supervisor_id deve referenciar usuário com role 'supervisor' ou 'admin'

### RN-005: Status de Projeto
- **Descrição**: Projetos podem ter 4 status
- **Status Válidos**:
  - `active`: Projeto em andamento (padrão)
  - `completed`: Projeto concluído
  - `on_hold`: Projeto pausado temporariamente
  - `cancelled`: Projeto cancelado
- **Transições Permitidas**:
  - active → completed, on_hold, cancelled
  - on_hold → active, cancelled
  - completed ❌ (imutável)
  - cancelled ❌ (imutável)

### RN-006: Cálculo de Risco de Projeto
- **Descrição**: Sistema deve calcular automaticamente o risco de atraso
- **Classificações**:
  - **ON_TRACK**: Prazo estimado <= data final E faltam mais de 7 dias
  - **WARNING**: Faltam 7 dias ou menos até data final
  - **AT_RISK**: Prazo estimado > data final definida
  - **DELAYED**: Data final já passou
  - **NO_DEADLINE**: Projeto sem data final definida
- **Cálculo de Prazo Estimado**:
  ```
  Para cada etapa:
    Se is_parallel = FALSE:
      tempo_etapa = SOMA(dias_de_cada_tarefa)
    Se is_parallel = TRUE:
      tempo_etapa = MAX(dias_de_cada_tarefa)

  tempo_total_projeto = SOMA(todas_etapas.tempo_etapa)
  ```

### RN-007: Exclusão de Projeto
- **Descrição**: Ao excluir projeto, todas as etapas e tarefas são excluídas (CASCADE)
- **Validações**:
  - Apenas o supervisor do projeto ou Admin pode excluir
  - Sistema deve solicitar confirmação
  - Sugerir mudar status para 'cancelled' ao invés de excluir

---

## 3. Gestão de Etapas (Stages)

### RN-008: Criação de Etapa
- **Descrição**: Etapas organizam tarefas dentro de um projeto
- **Validações**:
  - Nome é obrigatório
  - Campo 'order' define a sequência de execução
  - is_parallel define se tarefas podem ser feitas simultaneamente
- **Comportamento**:
  - Primeira etapa criada recebe order = 1
  - Próximas etapas recebem order = max(order) + 1

### RN-009: Ordenação de Etapas
- **Descrição**: Etapas seguem uma ordem lógica de execução
- **Regras**:
  - Etapas sequenciais (is_parallel=FALSE): devem ser concluídas na ordem
  - Etapas paralelas (is_parallel=TRUE): podem ter tarefas executadas simultaneamente
  - Reordenação de etapas deve recalcular prazo do projeto

### RN-010: Exclusão de Etapa
- **Descrição**: Ao excluir etapa, todas as tarefas são excluídas (CASCADE)
- **Validações**:
  - Apenas Supervisor do projeto ou Admin pode excluir
  - Avisar sobre quantidade de tarefas que serão excluídas
  - Recalcular prazo do projeto após exclusão

---

## 4. Gestão de Tarefas

### RN-011: Criação de Tarefa
- **Descrição**: Tarefas são criadas dentro de etapas
- **Validações**:
  - Título é obrigatório
  - estimated_hours deve ser > 0
  - daily_hours deve ser >= 0 e <= 8
  - daily_hours NÃO pode exceder estimated_hours
  - Status inicial padrão: 'novo'
  - Priority padrão: 'medium'

### RN-012: Status de Tarefa (CRÍTICO)
- **Descrição**: Fluxo de status fixo e controlado
- **Status Válidos**: novo, em_desenvolvimento, analise_tecnica, concluido, refaca
- **Matriz de Transição**:

| De / Para | novo | em_desenv | analise | concluido | refaca |
|-----------|------|-----------|---------|-----------|--------|
| novo | ✅ | ✅ User | ❌ | ❌ | ❌ |
| em_desenv | ✅ User | ✅ | ✅ Sup | ❌ | ❌ |
| analise | ❌ | ❌ | ✅ | ✅ Sup | ✅ Sup |
| concluido | ❌ | ❌ | ❌ | ✅ | ❌ |
| refaca | ❌ | ✅ User | ❌ | ❌ | ✅ |

**Legenda**:
- ✅ = Transição permitida para todos
- ✅ User = Apenas Users podem fazer essa transição
- ✅ Sup = Apenas Supervisor/Admin podem fazer
- ❌ = Transição bloqueada

### RN-013: Prioridade de Tarefas "Refaça"
- **Descrição**: Tarefas com status 'refaca' têm prioridade máxima
- **Comportamento**:
  - Aparecem no topo de todas as listas
  - Destaque visual obrigatório (vermelho, borda grossa)
  - Contador especial no dashboard
  - Notificação imediata ao usuário responsável
  - Somente Supervisor/Admin podem mover para 'refaca'

### RN-014: Limite de Horas Diárias (CRÍTICO)
- **Descrição**: Usuário NÃO pode ter mais de 8 horas diárias alocadas
- **Validação**:
  ```
  SOMA(daily_hours de todas as tarefas ativas do usuário) <= 8
  ```
- **Comportamento**:
  - Validação ocorre ao criar/editar tarefa
  - Validação ocorre ao atribuir usuário à tarefa
  - Bloquear operação se exceder 8h
  - Exibir mensagem clara: "Usuário já possui X horas alocadas. Máximo: 8h/dia"
- **Exceções**:
  - Tarefas com status 'concluido' NÃO contam no limite
  - Tarefas com status 'cancelado' NÃO contam no limite

### RN-015: Cálculo de Prazo de Tarefa
- **Descrição**: Sistema calcula dias necessários para conclusão
- **Fórmula**:
  ```
  dias_necessarios = CEIL(estimated_hours / daily_hours)
  ```
- **Exemplo**:
  - Tarefa de 20h com dedicação de 3h/dia = 7 dias
  - Tarefa de 10h com dedicação de 4h/dia = 3 dias
  - Tarefa de 5h com dedicação de 2h/dia = 3 dias (arredonda para cima)

### RN-016: Atribuição de Usuários
- **Descrição**: Tarefa pode ter múltiplos usuários atribuídos
- **Validações**:
  - Apenas Supervisor/Admin podem atribuir usuários
  - Não pode atribuir o mesmo usuário duas vezes
  - Ao atribuir, validar limite de 8h/dia do usuário
  - Recalcular prazo da tarefa ao alterar atribuições

### RN-017: Exclusão de Tarefa
- **Descrição**: Ao excluir tarefa, remover todas as atribuições e time entries
- **Validações**:
  - Apenas Supervisor do projeto ou Admin pode excluir
  - Avisar sobre perda de dados de horas registradas
  - Recalcular prazo da etapa e projeto

---

## 5. Registro de Horas (Time Entries)

### RN-018: Registro de Tempo
- **Descrição**: Usuários podem registrar horas trabalhadas em tarefas
- **Validações**:
  - Usuário só pode registrar horas em tarefas atribuídas a ele
  - Horas devem ser > 0 e <= 24
  - Data não pode ser futura
  - Pode haver múltiplos registros no mesmo dia para a mesma tarefa
- **Comportamento**:
  - Usado para comparar estimativa vs realidade
  - Gera métricas de desempenho
  - Não bloqueia funcionamento do sistema

### RN-019: Comparação Estimado vs Real
- **Descrição**: Sistema compara horas estimadas com horas registradas
- **Métricas**:
  - total_estimated: soma de estimated_hours de todas as tarefas
  - total_logged: soma de hours de todos os time_entries
  - efficiency = (total_estimated / total_logged) * 100
  - variance = total_logged - total_estimated
- **Alertas**:
  - Se variance > 20%: sinal de má estimativa
  - Se efficiency < 80%: usuário está levando mais tempo que previsto

---

## 6. Dashboard e Monitoramento

### RN-020: Dashboard - Supervisor
- **Descrição**: Dashboard mostra visão geral dos projetos do supervisor
- **Métricas Exibidas**:
  - Projetos em andamento (status = active)
  - Projetos em risco (prazo estimado > due_date)
  - Usuários ativos (com tarefas em em_desenvolvimento)
  - Tarefas em "refaca" (destaque especial)
  - Distribuição de status de todas as tarefas
  - Últimas 10 tarefas atualizadas
- **Filtros**:
  - Supervisor vê apenas seus projetos
  - Admin vê todos os projetos

### RN-021: Monitoramento - Admin Only
- **Descrição**: Relatórios avançados de desempenho
- **Relatórios Disponíveis**:

  **1. Desempenho Individual**:
  - Total de tarefas concluídas
  - Tarefas em andamento
  - Taxa de "refaça" (refaca_tasks / total_tasks)
  - Horas estimadas vs horas registradas
  - Média de tempo por tarefa

  **2. Desempenho por Equipe**:
  - Produtividade geral
  - Projetos concluídos no prazo
  - Taxa de sucesso

  **3. Desempenho por Supervisor**:
  - Quantidade de projetos gerenciados
  - Taxa de projetos em risco
  - Taxa de tarefas em "refaca" de seus projetos
  - Comparativo entre supervisores

  **4. Indicadores de Má Gestão**:
  - Taxa de "refaça" > 15%: má qualidade ou requisitos mal definidos
  - Muitos projetos atrasados: planejamento ruim
  - Estimativas consistentemente erradas (variance > 30%): falta de experiência

### RN-022: Alertas Automáticos
- **Descrição**: Sistema deve notificar sobre situações críticas
- **Tipos de Alerta**:
  - Projeto com menos de 7 dias até prazo
  - Projeto com risco de atraso (estimado > due_date)
  - Tarefa movida para "refaca"
  - Usuário atingindo 8h/dia de alocação
  - Etapa bloqueada por muito tempo (>5 dias sem movimentação)

---

## 7. Segurança e Permissões

### RN-023: Autenticação
- **Descrição**: Sistema usa JWT para autenticação
- **Regras**:
  - Token expira em 24 horas
  - Refresh token válido por 7 dias
  - Senha nunca deve ser retornada em APIs
  - Login com email + senha

### RN-024: Autorização por Endpoint
- **Descrição**: Cada endpoint valida permissões

**Projetos**:
- GET /projects: User vê apenas os seus / Supervisor vê os seus / Admin vê todos
- POST /projects: Apenas Supervisor/Admin
- PUT /projects/:id: Apenas supervisor do projeto ou Admin
- DELETE /projects/:id: Apenas supervisor do projeto ou Admin

**Tarefas**:
- GET /tasks: User vê apenas atribuídas a ele / Supervisor vê de seus projetos / Admin vê todas
- POST /tasks: Apenas Supervisor/Admin
- PUT /tasks/:id: User pode editar se atribuído / Supervisor/Admin sempre
- DELETE /tasks/:id: Apenas Supervisor do projeto ou Admin
- PATCH /tasks/:id/status: Validar RN-012 (matriz de transição)

**Usuários**:
- GET /users: Admin vê todos / Supervisor vê sua equipe / User vê só ele mesmo
- PUT /users/:id: Admin pode editar todos / Outros só editam perfil próprio
- DELETE /users/:id: Apenas Admin

### RN-025: Validação de Dados Sensíveis
- **Descrição**: Proteger contra ataques comuns
- **Validações**:
  - SQL Injection: usar prepared statements
  - XSS: sanitizar inputs no frontend e backend
  - CSRF: usar tokens CSRF em formulários
  - Brute Force: limitar tentativas de login (5 por 15 minutos)
  - Rate Limiting: 100 requisições por minuto por IP

---

## 8. Validações de Integridade

### RN-026: Integridade Referencial
- **Descrição**: Garantir consistência do banco de dados
- **Regras**:
  - Não pode excluir usuário com tarefas ativas (bloquear ou desativar)
  - Não pode excluir projeto com tarefas em andamento (avisar)
  - Ao desativar usuário, reatribuir tarefas ativas
  - Cascade delete: projeto → etapas → tarefas → atribuições

### RN-027: Recálculo Automático de Prazos
- **Descrição**: Prazos devem ser recalculados automaticamente
- **Gatilhos**:
  - Ao criar/editar/excluir tarefa
  - Ao alterar estimated_hours ou daily_hours
  - Ao alterar is_parallel de uma etapa
  - Ao atribuir/desatribuir usuário de tarefa
- **Comportamento**:
  - Executar stored procedure `sp_calculate_project_deadline`
  - Atualizar campo calculated_deadline (adicionar ao schema)
  - Disparar alerta se mudar status de risco

---

## 9. Performance

### RN-028: Paginação Obrigatória
- **Descrição**: Listas grandes devem ser paginadas
- **Limites**:
  - Projetos: 20 por página
  - Tarefas: 50 por página
  - Time Entries: 100 por página
  - Usuários: 50 por página
- **Parâmetros**:
  - page (default: 1)
  - limit (default: conforme acima, max: 100)

### RN-029: Cache de Dashboard
- **Descrição**: Estatísticas podem ser cacheadas
- **TTL (Time To Live)**:
  - Dashboard stats: 5 minutos
  - User statistics: 10 minutos
  - Project risk: 15 minutos
- **Invalidação**:
  - Ao criar/editar/excluir projeto
  - Ao alterar status de tarefa
  - Ao criar nova atribuição

---

## 10. Regras de Negócio Futuras (Roadmap)

### RN-030: Notificações em Tempo Real
- Usuário recebe notificação ao ser atribuído a tarefa
- Supervisor recebe alerta de projeto em risco
- Notificação de tarefa movida para "refaca"

### RN-031: Comentários em Tarefas
- Permitir discussões dentro de cada tarefa
- Histórico de alterações
- Menções (@usuario)

### RN-032: Anexos
- Upload de arquivos em tarefas e projetos
- Limite de 10MB por arquivo
- Tipos permitidos: PDF, DOC, XLS, PNG, JPG

### RN-033: Relatórios Exportáveis
- Exportar dashboard em PDF
- Exportar lista de tarefas em Excel
- Gerar relatório de desempenho mensal

### RN-034: Feriados e Dias Úteis
- Considerar calendário de feriados no cálculo de prazos
- Configurar dias úteis por semana (padrão: 22/mês)

---

## Resumo de Regras Críticas

🔴 **CRÍTICAS** (Não podem falhar):
- RN-012: Controle de transição de status
- RN-014: Limite de 8 horas diárias
- RN-023: Autenticação e segurança
- RN-024: Autorização por perfil
- RN-025: Validação contra ataques

🟡 **IMPORTANTES** (Impactam usabilidade):
- RN-006: Cálculo de risco de projeto
- RN-013: Prioridade de tarefas "refaca"
- RN-015: Cálculo de prazo de tarefa
- RN-027: Recálculo automático de prazos

🟢 **DESEJÁVEIS** (Melhoram experiência):
- RN-019: Comparação estimado vs real
- RN-022: Alertas automáticos
- RN-029: Cache de dashboard
