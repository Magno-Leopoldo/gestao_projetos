# 🐛 Debug - Tooltip não aparece em certos cenários

## Cenários com Problema

### Cenário 1: Período Específico + Todos Usuários
- **Filtro Período**: Semana / Dia / Mês
- **Filtro Usuário**: Todos
- **Sintoma**: Linha mostra crescente, mas tooltip não aparece ao passar mouse
- **Esperado**: Tooltip com Total + Breakdown por usuário

### Cenário 2: Período Todos + Usuário Específico
- **Filtro Período**: Todos
- **Filtro Usuário**: Magno (ex)
- **Sintoma**: Linha decrescente, tooltip não aparece
- **Esperado**: Tooltip com horas do Magno + diferença

---

## Como Debugar

### Passo 1: Abrir Console (F12)
```
Developer Tools → Console
```

### Passo 2: Ir para cada Cenário
```
1. Abrir gráfico da tarefa
2. Selecionar primeiro Cenário (Semana + Todos)
3. Passar mouse no gráfico
4. Copiar output do console que começa com: 🔍 DEBUG - ProgressChart
```

### Passo 3: Compartilhar o Output
Procure por linhas como:
```javascript
🔍 DEBUG - ProgressChart {
  selectedUser: undefined,
  chartDataLength: 7,
  chartDataFirst: { data: '2026-01-07', user_id: 2, user_name: 'João Silva', ... },
  hasUserIdField: true,
  processedDataLength: 7,
  processedDataFirst: { data: '2026-01-07', horasReais: 12.5, users: [...], ... }
}
```

---

## O que Procurar

| Campo | Cenário 1 | Cenário 2 | Problema se |
|-------|-----------|-----------|------------|
| `selectedUser` | `undefined` | `número` | Diferente do esperado |
| `chartDataLength` | `> 0` | `> 0` | = 0 (sem dados) |
| `chartDataFirst` | Tem `user_id` | Sem `user_id` | Vazio ou undefined |
| `hasUserIdField` | `true` | `false` | Diferente do esperado |
| `processedDataLength` | `> 0` | `> 0` | = 0 (agregação falhou) |

---

## Hipóteses

### Hipótese 1: Dados Vazios
Se `chartDataLength === 0`:
- Backend não retornou dados para esse período
- Verifique filtro de período no backend
- Teste se há dados reais para esse período

### Hipótese 2: Agregação Falhou
Se `chartDataLength > 0` mas `processedDataLength === 0`:
- A lógica de agregação falhou
- Pode ser erro no `reduce()`
- Precisa revisar processamento de dados

### Hipótese 3: Tooltip Não Recebe Payload
Se dados parecem OK no console, mas tooltip não aparece:
- Problema com Recharts
- Pode ser z-index ou evento mouse bloqueado
- Talvez precisa outra sintaxe para `<Tooltip>`

---

## Próximas Ações

**Você:**
1. Abra console (F12)
2. Teste cada cenário
3. Copie os logs `🔍 DEBUG - ProgressChart`
4. Compartilhe comigo

**Eu:**
1. Analisar os logs
2. Identificar qual hipótese é verdadeira
3. Corrigir o problema
4. Testar novamente

---

## Sintomas Esperados por Console

### Tudo OK
```
chartDataLength: 7
processedDataLength: 7 (se agregando)
ou
processedDataLength: 7 (se não agregando)
→ Tooltip deveria funcionar
```

### Dados Vazios
```
chartDataLength: 0
processedDataLength: 0
→ Problema: Sem dados para mostrar
```

### Agregação Falhou
```
chartDataLength: 14 (14 registros = 7 dias × 2 usuários)
processedDataLength: 0 (agregação não funcionou)
→ Problema: Lógica de agregação quebrada
```

