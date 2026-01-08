# ✅ RESOLVIDO: Tooltip não aparecia em gráfico de dados agregados

**Data de Resolução:** 08/01/2026
**Componente:** `ProgressChartModal.tsx`
**Gravidade:** 🟠 Média
**Status:** ✅ RESOLVIDO

---

## 📋 O Problema

Quando o usuário passava o mouse em cima dos pontos do gráfico em certos filtros, o **tooltip não aparecia**:

❌ **Não funcionava em:**
- Filtro "Todos" (todas datas + todos usuários)
- Dados agregados por dia/usuário

✅ **Funcionava em:**
- Filtro com usuário específico
- Dados sem agregação

---

## 🔍 Análise

### Sintomas nos Logs
```javascript
// Quando não funcionava:
chartDataLength: 3
processedDataLength: 2
activeTooltipIndex: null  ❌ Recharts não detectava o hover!

// Quando funcionava:
chartDataLength: 3
processedDataLength: 3
activeTooltipIndex: 0  ✅ Recharts conseguia detectar
```

### Root Cause
Quando os dados eram **agregados** (múltiplos usuários por dia), o Recharts tinha dificuldade em mapear a posição do mouse para os dots porque:
1. Os dados eram reduzidos de 3 registros para 2 (um por dia)
2. Os dots ficavam pequenos demais (raio = 6px)
3. Recharts não conseguia detectar reliablement o hover em uma área tão pequena

---

## ✨ Solução Implementada

### Mudança no Código
Aumentar o tamanho dos dots quando há agregação de dados:

```typescript
// Calcular tamanho do dot baseado se tem agregação
const isAggregated = selectedUser === undefined && chartData.length > 0 && chartData[0]?.user_id;
const dotRadius = isAggregated ? 8 : 6;              // 6→8 quando agregado
const activeDotRadius = isAggregated ? 12 : 8;      // 8→12 quando agregado
```

Depois, aplicar no Line do gráfico:
```jsx
<Line
  dot={{ fill: '#3b82f6', r: dotRadius, cursor: 'pointer' }}
  activeDot={{ r: activeDotRadius, cursor: 'pointer' }}
  // ...
/>
```

### Resultado
✅ Dots **maiores** = área clicável **maior**
✅ Recharts consegue detectar o hover com mais precisão
✅ Tooltip aparece em **TODOS** os filtros

---

## 🧪 Teste

### Como Reproduzir (Antes da fix)
1. Abra um card de tarefa
2. Clique no gráfico de progresso
3. Selecione filtro "Todos" (todas datas + todos usuários)
4. Passe o mouse nos pontos azuis crescentes
5. ❌ Tooltip não aparecia

### Como Verificar (Depois da fix)
1. Mesmos passos acima
2. Ao passar o mouse, o tooltip **APARECE** ✅
3. Mostra: Horas Reais, Sugestão, Diferença, % da meta
4. Se múltiplos usuários: mostra detalhamento por usuário

---

## 📊 Dados Técnicos

| Propriedade | Valor Padrão | Valor com Agregação |
|------------|--------------|-------------------|
| Dot Radius | 6px | 8px |
| Active Dot | 8px | 12px |
| Triggered By | `selectedUser !== undefined` | `selectedUser === undefined && chartData[0]?.user_id` |

---

## 🔧 Commits Relacionados

```bash
635cbe2 fix: Melhorias robustas no tooltip do gráfico de evolução de horas
00e71c8 fix: Corrigir tooltip em gráficos com dados agregados
dd32aa1 debug: Melhorar estrutura do ResponsiveContainer e adicionar logs
5a26535 fix: Aumentar tamanho dos dots para dados agregados
```

---

## 💡 Lições Aprendidas

1. **Recharts é sensível a tamanho de dots** - dots muito pequenos podem não ser detectados com precisão em hover
2. **Agregação de dados deve considerar UX** - quando você agrupa dados, precisa aumentar a área clicável
3. **Debug com logs é essencial** - sem os logs de `activeTooltipIndex` não teríamos encontrado o problema
4. **ResponsiveContainer precisa de altura explícita** - usar `height={550}` ao invés de `height="100%"`

---

## ✅ Validação

- [x] Tooltip aparece ao passar mouse em gráfico "Todos"
- [x] Tooltip aparece ao passar mouse em gráfico com usuário específico
- [x] Mostra todas as informações: Horas, Sugestão, Diferença, %
- [x] Mostra detalhamento por usuário quando múltiplos trabalham
- [x] Funciona em todos os filtros de período (Hoje, Semana, Mês, Custom)
- [x] Gestor tem visão macro com dados agregados

---

**Resolvido em:** 08/01/2026 ✅
**Prioridade:** 🟠 Média → ✅ Concluída
**Teste Validado:** Sim
