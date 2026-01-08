# 🗺️ Mapa de Dependências - Gráfico de Evolução das Horas

## 📊 Status Atual do Gráfico

### ✅ O que Está Funcionando

| Item | Status | Detalhes |
|------|--------|----------|
| Renderização do gráfico | ✅ | LineChart renderiza corretamente |
| Duas linhas (azul + verde) | ✅ | Mostram horas reais vs sugestão |
| Filtros (período + usuário) | ✅ | Funcionam e atualizam o gráfico |
| Estatísticas (4 cards) | ✅ | Dias, Total, Média, Máximo |
| Responsividade | ✅ | Funciona em desktop, tablet, mobile |
| Tooltips ao passar mouse | ⚠️ | Aparecem, mas incompletos |
| Português | ⚠️ | Parcial - faltam alguns textos |

---

## 🔍 Análise Detalhada

### 1. TOOLTIP - O que mostra atualmente?

**Código atual** (linhas 257-266 de ProgressChartModal.tsx):
```typescript
<Tooltip
  contentStyle={{
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }}
  formatter={(value: any) => `${value.toFixed(2)}h`}
  labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
/>
```

**Problema**:
- ❌ Mostra apenas `labelStyle` (a data) em formato padrão
- ❌ O `formatter` só formata o valor (coloca o "h"), não formata a data
- ❌ Não mostra a data em português amigável
- ❌ Não mostra ambas as linhas (real e sugestão) lado a lado
- ❌ Falta mostrar qual valor é "Horas Reais" e qual é "Sugestão"

**Resultado visual atual**:
```
Ter, jan 7  ← Vem do dataDisplay (português ✅)
4.50h       ← Mostra valor formatado
```

---

### 2. PORTUGUÊS - Status Completo

| Elemento | Texto | Status | Arquivo:Linha |
|----------|-------|--------|---------------|
| Título modal | "Evolução das Horas" | ✅ PT | TaskDetail.tsx |
| Nome linha azul | "Horas Reais" | ✅ PT | ProgressChartModal:296 |
| Nome linha verde | "Sugestão" | ✅ PT | ProgressChartModal:275 |
| Eixo Y | "Horas" | ✅ PT | ProgressChartModal:256 |
| Eixo X (data) | "Ter, jan 7" | ✅ PT | ProgressChartModal:100 |
| Label filtros | "Período:", "Usuário:" | ✅ PT | ProgressChartModal:137, 190 |
| Cards stats | "Dias", "Total", "Média", "Máximo" | ✅ PT | ProgressChartModal:212-225 |
| Legenda cards | "Linha Azul:", "Linha Verde:" | ✅ PT | ProgressChartModal:304-310 |
| **Botão fechar** | "Fechar" | ✅ PT | ProgressChartModal:322 |
| **Tooltip label** | Data do ponto | ⚠️ Genérica | Tooltip (Recharts padrão) |
| **Tooltip valores** | Identificação das linhas | ❌ Não identificado | Tooltip incompleto |

---

## 🔗 Dependências do Componente

```
ProgressChartModal.tsx
├── Imports Internos
│   ├── React (useState, useEffect)
│   ├── lucide-react (X icon, TrendingUp icon)
│   ├── recharts (LineChart, Line, XAxis, YAxis, etc)
│   └── timeEntriesService
│
├── Props Recebidas (de TaskDetail.tsx)
│   ├── isOpen: boolean
│   ├── taskId: number
│   ├── taskTitle: string
│   ├── suggestedHours: number | string
│   ├── assignees: any[]
│   └── onClose: () => void
│
├── API Calls
│   └── timeEntriesService.getTaskProgressChart(taskId, filters)
│       └── Backend: GET /api/tasks/:taskId/progress-chart
│           └── timeEntriesController.getTaskProgressChart()
│
├── Estados Locais
│   ├── chartData: any[]
│   ├── loading: boolean
│   ├── error: string | null
│   ├── period: 'today' | 'week' | 'month' | 'custom' | 'all'
│   ├── selectedUser: number | undefined
│   ├── customStartDate: string
│   └── customEndDate: string
│
└── Formatação de Dados
    └── formatDateForDisplay() → Date (pt-BR locale)
```

---

## 🛠️ Dependências Externas

### Bibliotecas Principais
```json
{
  "react": "^18.x",
  "recharts": "^2.x",
  "lucide-react": "^x.x",
  "tailwindcss": "^3.x"
}
```

### Arquivo de Serviço
```
project/src/services/timeEntriesService.ts
  └── getTaskProgressChart(taskId, filters)
      └── Retorna: { success, data, metadata }
```

### Arquivo de Rota Backend
```
backend/src/routes/tasksRoutes.js
  └── GET /:taskId/progress-chart
```

---

## 📋 Problemas Identificados

### 🔴 Problema 1: Tooltip Incompleto (CRÍTICO)
**Severidade**: MÉDIA

**Descrição**:
- Tooltip não mostra qual valor é qual (horasReais vs horasSugeridas)
- Não mostra a data de forma clara em português
- Não há separação visual entre os dois valores

**Impacto**:
- Usuário vê número mas não sabe se é real ou sugestão
- Data pode vir genérica (sem localização)

**Localização**: `ProgressChartModal.tsx:257-266`

---

### 🟡 Problema 2: Nomes das Linhas Não Aparecem no Tooltip (MENOR)
**Severidade**: BAIXA

**Descrição**:
- Quando passa mouse, mostra valor mas não identifica "Horas Reais" ou "Sugestão"
- Recharts mostra por padrão o nome da line, mas pode não estar claro

**Impacto**:
- Pode gerar confusão qual linha é qual

---

### 🟡 Problema 3: Formatação da Data no Tooltip
**Severidade**: BAIXA

**Descrição**:
- Data pode não vir localizada no tooltip (Recharts usa valor padrão)
- Embora o gráfico use `dataDisplay` (pt-BR), o tooltip usa `label` que é a chave

**Impacto**:
- Possível exibição de data em inglês ou formato genérico

---

## 💡 Melhorias Propostas (SEM quebrar nada)

### ✨ Melhoria 1: Tooltip Customizado (RECOMENDADO)

**O que fazer**:
Criar um componente de Tooltip customizado que mostra:
```
┌─────────────────────────────┐
│ Terça, 7 de Janeiro         │
├─────────────────────────────┤
│ 🔵 Horas Reais: 4.50h       │
│ 🟢 Sugestão: 8.00h          │
│ 📊 Diferença: -3.50h ⚠️     │
└─────────────────────────────┘
```

**Implementação**:
```typescript
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <p className="font-bold text-gray-900">
          {data.dataDisplay}
        </p>
        <p className="text-blue-600 text-sm mt-2">
          🔵 Horas Reais: {data.horasReais.toFixed(2)}h
        </p>
        <p className="text-green-600 text-sm">
          🟢 Sugestão: {data.horasSugeridas.toFixed(2)}h
        </p>
      </div>
    );
  }
  return null;
};
```

**Benefícios**:
- ✅ Mostra ambos os valores
- ✅ Identificação clara
- ✅ Data em português
- ✅ Sem quebrar nada existente

**Arquivo**: `ProgressChartModal.tsx` (novo custom tooltip)

**Dificuldade**: ⭐ FÁCIL

---

### ✨ Melhoria 2: Adicionar Diferença (Opcional)

**O que fazer**:
No tooltip ou tooltip, mostrar a diferença entre real e sugestão:
```
Diferença: -3.50h (trabalhou menos que o planejado)
Diferença: +2.00h (trabalhou mais que o planejado)
```

**Impacto**: Ajuda a ver rapidamente se está acima ou abaixo

**Dificuldade**: ⭐ FÁCIL (cálculo simples)

---

### ✨ Melhoria 3: Cores no Tooltip (Nice to Have)

**O que fazer**:
Usar cores no tooltip para indicar status:
- Verde: Quando horasReais >= horasSugeridas
- Amarelo: Quando está próximo (90-100% da sugestão)
- Vermelho: Quando muito abaixo (menos de 70%)

**Dificuldade**: ⭐ FÁCIL (classes Tailwind)

---

### ✨ Melhoria 4: Legenda Interativa (Futuro)

**O que fazer**:
Permitir clicar na legenda para mostrar/esconder linhas

**Status**: Possível, mas Recharts já suporta nativamente
**Dificuldade**: ⭐ MUITO FÁCIL (adicionar uma prop)

---

## 🎯 Recomendações Prioritárias

### 1️⃣ FAZER AGORA (Impacto Alto / Esforço Baixo)

- [x] **Tooltip Customizado** com ambos os valores
- [x] **Data em português** no tooltip
- [x] **Identificar qual linha é qual** (🔵 vs 🟢)

**Tempo estimado**: 15-20 minutos
**Risco**: ZERO (Recharts é isolado)

---

### 2️⃣ CONSIDERAR DEPOIS (Nice to Have)

- [ ] Mostrar diferença (real - sugestão)
- [ ] Cores indicando status
- [ ] Legenda interativa

---

## 📊 Antes vs Depois

### ANTES (Atual)
```
┌──────────────┐
│ Ter, jan 7   │  ← Data genérica
│ 4.50h        │  ← Só valor, sem identificação
└──────────────┘
```

### DEPOIS (Com Melhoria 1)
```
┌─────────────────────────────┐
│ Terça, 7 de Janeiro         │  ← Data clara em PT
├─────────────────────────────┤
│ 🔵 Horas Reais: 4.50h       │  ← Identificado
│ 🟢 Sugestão: 8.00h          │  ← Identificado
│ 📊 Diferença: -3.50h ⚠️     │  ← Bônus
└─────────────────────────────┘
```

---

## 🔧 Arquivos a Modificar

```
project/src/components/ProgressChartModal.tsx
├── Linha 257-266: Tooltip padrão
└── Necessário: Criar CustomTooltip component
    └── Mostrar: data (pt-BR), horasReais, horasSugeridas, diferença
```

---

## ✅ Checklist de Validação

Após implementar as melhorias, verificar:

- [ ] Tooltip mostra data em português
- [ ] Tooltip mostra "Horas Reais: X.XXh"
- [ ] Tooltip mostra "Sugestão: X.XXh"
- [ ] Tooltip identifica com ícones/cores
- [ ] Tooltip aparece ao passar mouse
- [ ] Funciona em mobile (toque)
- [ ] Nenhum error no console
- [ ] Nenhuma quebra visual
- [ ] Grid ainda funciona com múltiplos dados

---

## 📚 Arquivos de Referência

```
Frontend:
  project/src/components/ProgressChartModal.tsx (MODIFICAR)
  project/src/components/TaskDetail.tsx (não tocar)
  project/src/services/timeEntriesService.ts (não tocar)

Backend:
  backend/src/routes/tasksRoutes.js (não tocar)
  backend/src/controllers/timeEntriesController.js (não tocar)
```

---

## 🚀 Próximas Ações

1. Revisar este mapa com o usuário ✅
2. Implementar Tooltip Customizado (Melhoria 1)
3. Testar em diferentes cenários
4. Atualizar manual de uso (se necessário)

