# BUG-003: Cronômetro Bloqueado ao Tentar Parar com Limite de 8 Horas

## 📋 Sumário Executivo

**Status**: ✅ RESOLVIDO

**Data**: 02/02/2026

**Severidade**: 🔴 CRÍTICA

**Impacto**: Usuários que iniciaram cronômetros antes da validação de 8h/dia não conseguiam parar/finalizar as sessões, causando deadlock total no rastreamento de tempo.

---

## 🔍 Problema Identificado

### Descrição
Quando um usuário tentava **parar (STOP)** um cronômetro que foi iniciado antes da implementação da validação de 8 horas diárias, recebia erro 400:

```
Limite de 8 horas diárias excedido para este usuário
```

### Cenário de Reprodução
1. Usuário inicia cronômetro na tarefa A (3h)
2. Usuário inicia cronômetro na tarefa B (3h)
3. Usuário inicia cronômetro na tarefa C (2h)
4. **Total: 8h** (ou às vezes > 8h se trabalhou além do previsto)
5. Usuário clica em **STOP** no cronômetro
6. ❌ Erro 400: "Limite de 8 horas diárias excedido"

### Erro nos Logs
```
PATCH /api/tasks/23/time-entries/22/stop

Error: Limite de 8 horas diárias excedido para este usuário
  at PromisePoolConnection.execute
  at file:///Users/magno/Documents/gestao_projetos/backend/src/controllers/timeEntriesController.js:369:20

code: 'ER_SIGNAL_EXCEPTION'
errno: 1644
sql: 'UPDATE tasks SET date_begin_real = DATE(NOW()) WHERE id = ?'
sqlMessage: 'Limite de 8 horas diárias excedido para este usuário'
```

---

## 🔧 Análise Técnica

### Causa Raiz

O problema ocorria em duas camadas:

#### 1. **Backend** (`timeEntriesController.js` - linha 370)
```javascript
// Código original (PROBLEMÁTICO)
await conn.execute(
  'UPDATE tasks SET date_begin_real = DATE(NOW()) WHERE id = ?',
  [taskId]
);
```

Quando a sessão era finalizada, o código tentava **atualizar `date_begin_real`** da tarefa para marcar quando o trabalho real começou. Embora fosse apenas uma atualização de data, isso **acionava o trigger de validação** do MySQL.

#### 2. **Banco de Dados** (MySQL Trigger)
```sql
CREATE TRIGGER before_task_update_validate_hours
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    -- ❌ ERRO: Validava em QUALQUER UPDATE da tabela tasks
    -- Mesmo que fosse apenas atualizar date_begin_real

    DECLARE total_hours DECIMAL(10,2);

    SELECT COALESCE(SUM(t.daily_hours), 0) INTO total_hours
    FROM tasks t
    INNER JOIN task_assignments ta ON t.id = ta.task_id
    WHERE ta.user_id IN (
        SELECT user_id FROM task_assignments WHERE task_id = NEW.id
    )
    AND t.id != NEW.id
    AND t.status NOT IN ('concluido', 'cancelado');

    IF (total_hours + NEW.daily_hours) > 8.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Limite de 8 horas diárias excedido para este usuário';
    END IF;
END
```

**O problema**: O trigger validava a restrição de 8 horas em **QUALQUER UPDATE** da tabela `tasks`, não apenas quando `daily_hours` era modificado.

---

## ✅ Solução Implementada

### 1. Backend Fix: Envolver em Try-Catch

**Arquivo**: `/Users/magno/Documents/gestao_projetos/backend/src/controllers/timeEntriesController.js`

**Linhas**: 362-382

```javascript
// Atualizar data_begin_real da tarefa se for a primeira sessão
// ✅ IMPORTANTE: Não deixar este erro bloquear o STOP da sessão
// O limite de 8 horas só deve impedir START, não STOP
try {
  const [task] = await conn.execute(
    'SELECT date_begin_real FROM tasks WHERE id = ?',
    [taskId]
  );

  if (task && task.length > 0 && !task[0].date_begin_real) {
    await conn.execute(
      'UPDATE tasks SET date_begin_real = DATE(NOW()) WHERE id = ?',
      [taskId]
    );
  }
} catch (updateError) {
  // Se falhar por validação de horas, ignorar e permitir o STOP
  // A sessão já foi atualizada com sucesso, só não conseguimos marcar data_begin_real
  console.warn('Aviso: Não foi possível atualizar data_begin_real:', updateError.message);
  // Continuar mesmo com erro - stopping deve sempre ser permitido
}
```

**Benefício**: Mesmo que a validação do trigger falhe, a sessão é atualizada com sucesso para status `stopped`. A atualização de `date_begin_real` é secundária e não bloqueia a operação principal.

---

### 2. Database Fix: Trigger Inteligente

**Arquivo**: MySQL Database

**Comando**:
```sql
DROP TRIGGER IF EXISTS before_task_update_validate_hours;

DELIMITER $$

CREATE TRIGGER before_task_update_validate_hours
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    DECLARE total_hours DECIMAL(10,2);

    -- ✅ IMPORTANTE: Só validar se daily_hours está sendo MODIFICADO
    -- Não validar se só está atualizando date_begin_real ou outros campos
    IF NEW.daily_hours != OLD.daily_hours THEN
        -- Calcular total de horas diárias do usuário (excluindo a tarefa atual)
        SELECT COALESCE(SUM(t.daily_hours), 0) INTO total_hours
        FROM tasks t
        INNER JOIN task_assignments ta ON t.id = ta.task_id
        WHERE ta.user_id IN (
            SELECT user_id FROM task_assignments WHERE task_id = NEW.id
        )
        AND t.id != NEW.id
        AND t.status NOT IN ('concluido', 'cancelado');

        -- Validar se ultrapassa 8 horas
        IF (total_hours + NEW.daily_hours) > 8.00 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Limite de 8 horas diárias excedido para este usuário';
        END IF;
    END IF;
END$$

DELIMITER ;
```

**Mudança Chave**:
```sql
IF NEW.daily_hours != OLD.daily_hours THEN
```

Agora o trigger **só valida quando `daily_hours` é efetivamente modificado**. Atualizações de outros campos como `date_begin_real`, `status`, etc., não acionam a validação.

---

## 📊 Testes e Validação

### Antes da Fix (22:34)
```
2026-02-02T22:34:21.071Z - PATCH /api/tasks/23/time-entries/22/stop
❌ Error: Limite de 8 horas diárias excedido para este usuário
   code: 'ER_SIGNAL_EXCEPTION'
   sql: 'UPDATE tasks SET date_begin_real = DATE(NOW()) WHERE id = ?'
```

### Depois da Fix (22:37)
```
2026-02-02T22:37:07.979Z - PATCH /api/tasks/23/time-entries/22/stop
✅ Sucesso! Sessão finalizada
```

### Múltiplas Tentativas (Confirmando Consistência)
- ✅ 22:37:14 - STOP sucesso
- ✅ 22:40:38 - STOP sucesso
- ✅ 22:45:24 - STOP sucesso

---

## 🎯 Comportamento Esperado Após Fix

### ✅ Operações que FUNCIONAM:
1. **Parar cronômetro** - Sempre permitido, independente do total de horas
2. **Pausar/Retomar** - Sempre permitido
3. **Reiniciar trabalho em tarefa existente** - Permitido se parado antes

### 🚫 Operações que BLOQUEIAM:
1. **Iniciar novo cronômetro** - BLOQUEADO se usuário já tem ≥8h no dia
2. **Atribuir novo usuário com daily_hours** - BLOQUEADO se somaria >8h
3. **Aumentar daily_hours de tarefa** - BLOQUEADO se somaria >8h

---

## 📝 Mudanças nos Arquivos

### Arquivo 1: timeEntriesController.js
- **Linhas modificadas**: 362-382
- **Tipo**: Error handling improvement
- **Impacto**: Não bloqueia STOP mesmo com erro de validação
- **Breaking change**: NÃO

### Arquivo 2: Database Trigger
- **Trigger**: `before_task_update_validate_hours`
- **Tipo**: Logic refinement
- **Impacto**: Valida apenas quando daily_hours muda
- **Breaking change**: NÃO (melhora apenas o comportamento)

---

## 🔄 Commit Git

```
commit 65dfe34...
Author: Magno
Date:   2026-02-02

    fix: Permitir STOP de cronômetro mesmo com limite de 8 horas

    O sistema estava bloqueando o STOP de sessões de tempo quando o total
    de horas ultrapassava 8h/dia, causando deadlock para usuários que
    iniciaram cronômetros antes da validação ser implementada.

    Mudanças:
    1. Backend: Envolver update de date_begin_real em try-catch para não
       bloquear o STOP se houver erro de validação
    2. MySQL: Atualizar trigger to_task_update_validate_hours para validar
       APENAS quando daily_hours é modificado, não em outras atualizações

    Comportamento correto:
    - BLOQUEIA: Iniciar novo cronômetro se já tem ≥8h no dia
    - PERMITE: Parar/concluir cronômetro existente em qualquer circunstância
```

---

## 📚 Contexto do Problema

Este bug surgiu como **consequência direta** da implementação da validação de 8 horas/dia (Fase 3), que foi implementada para prevenir que usuários ultrapassem o limite diário de trabalho.

**Timeline**:
1. ✅ 01/02: Implementada validação de 8h/dia no `startTimeEntry()`
2. ✅ 01/02: Criado trigger MySQL para validar em nível de banco
3. ❌ 02/02: Descoberto que trigger também validava em STOP (bug)
4. ✅ 02/02: Implementada solução de dupla camada (backend + database)

---

## 🔐 Segurança e Edge Cases

### Edge Cases Tratados:
1. **Usuário com múltiplas tarefas ativas** - STOP funciona em qualquer uma
2. **Cronômetro pausado há muito tempo** - STOP funciona normalmente
3. **Data_begin_real já estava preenchida** - UPDATE é skipped
4. **Erro de validação no UPDATE** - STOP completa mesmo assim

### Segurança:
- ✅ Validação ainda ocorre no START (ponto principal)
- ✅ Atribuições e daily_hours ainda são validadas
- ✅ Trigger mais específico = menos overhead no banco

---

## 📋 Checklist de Verificação

- [x] Bug identificado corretamente
- [x] Causa raiz analisada
- [x] Solução implementada no backend
- [x] Solução implementada no banco
- [x] Teste manual realizado com sucesso
- [x] Múltiplas tentativas confirmam a fix
- [x] Não há breaking changes
- [x] Documentação completa
- [x] Commit criado

---

## 🚀 Próximos Passos

### Possíveis Melhorias:
1. Adicionar testes automatizados para cenários de cronômetro
2. Implementar logs mais detalhados de falhas de validação
3. Considerar API endpoint específico para "force stop" se necessário
4. Revisar outros triggers para validações similares problemáticas

### Monitoramento:
- Observar logs para avisos de "Não foi possível atualizar date_begin_real"
- Verificar se usuários conseguem completar cronômetros normalmente

---

## 📞 Informações para Reprodução

**Se o bug reaparecer**:
1. Verificar se o trigger foi acidentalmente revertido
2. Confirmar que o try-catch está presente no `stopTimeEntry()`
3. Testar o trigger com: `UPDATE tasks SET date_begin_real = NOW() WHERE id = 23;`
4. Verificar logs do servidor em `/backend/src/controllers/timeEntriesController.js:380`

---

## 📖 Referências Técnicas

- **MySQL SIGNAL**: https://dev.mysql.com/doc/refman/8.0/en/signal.html
- **Trigger BEFORE UPDATE**: https://dev.mysql.com/doc/refman/8.0/en/trigger-syntax.html
- **Express Error Handling**: https://expressjs.com/en/guide/error-handling.html
- **Transaction Rollback**: Não necessário neste caso (try-catch local)

---

## 🧪 TESTES PENDENTES: Validação Inteligente de 8h/dia (Nova Fase)

**Data Início**: 03/02/2026

### Status dos Testes

- [ ] **Teste 1: START BLOQUEADO** - Real + Alocado > 8h
- [ ] **Teste 2: START com WARNING HIGH** - Real + Alocado ≥ 7h
- [ ] **Teste 3: START com WARNING MEDIUM** - Real + Alocado ≥ 5h
- [ ] **Teste 4: START sem Aviso** - Real + Alocado < 5h
- [ ] **Teste 5: STOP nunca bloqueia** - Regressão

### Teste 1: START BLOQUEADO ❌ ou ✅
```
Cenário: real_hours_today + task.daily_hours > 8h

Passos:
1. Atribua Tarefa A com 3h/dia
2. Trabalhe 3h em Tarefa B
3. Tente iniciar Tarefa A

Esperado: ❌ BLOQUEIO
Erro: "ALLOCATION_EXCEEDS_DAILY_LIMIT"
Mensagem: "Você já trabalhou 3h. Tarefa tem 3h. Total: 6h"

Status: [ ]
Resultado:
Observações:
```

### Teste 2: START com WARNING HIGH ✅
```
Cenário: real_hours_today + task.daily_hours ≥ 7h e ≤ 8h

Passos:
1. Atribua Tarefa A com 0.5h/dia
2. Trabalhe 7h em outras tarefas
3. Tente iniciar Tarefa A

Esperado: ✅ PERMITE com aviso HIGH
Aviso deve incluir:
- "⚠️ ATENÇÃO"
- Horas reais: 7h
- Horas alocadas: 0.5h
- Total projetado: 7.5h
- Restam: 0.3h

Status: [ ]
Resultado:
Observações:
```

### Teste 3: START com WARNING MEDIUM ✅
```
Cenário: real_hours_today + task.daily_hours ≥ 5h e < 7h

Passos:
1. Atribua Tarefa A com 1h/dia
2. Trabalhe 4h em outras tarefas
3. Tente iniciar Tarefa A

Esperado: ✅ PERMITE com aviso MEDIUM
Aviso deve incluir:
- "ℹ️" (info)
- Horas reais: 4h
- Horas alocadas: 1h
- Total projetado: 5h

Status: [ ]
Resultado:
Observações:
```

### Teste 4: START sem Aviso ✅
```
Cenário: real_hours_today + task.daily_hours < 5h

Passos:
1. Atribua Tarefa A com 1h/dia
2. Trabalhe 2h em outras tarefas
3. Tente iniciar Tarefa A

Esperado: ✅ PERMITE sem avisos
Total: 3h (seguro)

Status: [ ]
Resultado:
Observações:
```

### Teste 5: STOP nunca bloqueia ✅
```
Cenário: Regressão - STOP deve funcionar sempre

Passos:
1. Em qualquer situação com cronômetro ativo
2. Clique em STOP

Esperado: ✅ SEMPRE funciona
Sucesso: "Sessão finalizada com sucesso"

Status: [ ]
Resultado:
Observações:
```

---

### Resumo de Implementação Feita (03/02/2026)

#### Backend Changes:
✅ Função: `validateUserDailyHoursWithWarning()` em taskValidations.js
- Permite atribuição com aviso quando > 8h

✅ Função: `validateTimeEntryWithAllocation()` em taskValidations.js
- Valida real + alocado ao iniciar cronômetro
- Gera warnings inteligentes

✅ Controller: `assignUsersToTask()` em tasksController.js
- Usa nova validação (permite com aviso)
- Retorna warnings na resposta

✅ Controller: `startTimeEntry()` em timeEntriesController.js
- Usa validação inteligente
- Novo código de erro: ALLOCATION_EXCEEDS_DAILY_LIMIT
- Retorna daily_status detalhado

#### Frontend Changes:
✅ Modal: `AssignUsersModal.tsx`
- Captura warnings da API
- Mostra alerta visual ao supervisor
- Atribui corretamente com warnings

---

**Documento atualizado em**: 03/02/2026

**Autor**: Claude Haiku 4.5 (com Magno)

**Status**:
- ✅ BUG-003 RESOLVIDO (STOP bloqueado)
- 🔄 VALIDAÇÃO INTELIGENTE: Aguardando testes (Teste 1-5)
