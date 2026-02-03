# 📊 Monitoramento - Layout Visual & Especificações

**Data:** 2026-02-03
**Status:** 📋 Documentado para Implementação Futura
**Autor:** Conversa Design Session

---

## 🎯 Objetivo

Implementar uma tela de **Monitoramento profunda** com análises detalhadas de:
- Desempenho de supervisores
- Carga de trabalho da equipe
- Histórico de atribuições
- Padrões de alocação
- Indicadores de saúde do projeto

---

## 📐 Estrutura de Seções (11 no total)

### 1️⃣ Filtros & Período (Top - 3 colunas)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📅 PERÍODO                 ┃ 👤 FILTRAR USUÁRIO        ┃ 📊 FILTRAR STATUS         ┃
┃ [De: 01/02] [Até: 03/02]  ┃ [Todos ▼]                 ┃ ☑ Novo ☑ Em Desenv        ┃
┃ [7 Últimos Dias] [Mês]     ┃ [Maria Santos]            ┃ ☑ Análise ☑ Concluído     ┃
┃                            ┃ [João Silva]              ┃ ☑ Refaça                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**Funcionalidades:**
- ✅ Seletor de período (7 dias, mês, intervalo customizável)
- ✅ Dropdown de usuários (filtro por responsável)
- ✅ Checkboxes de status (multiselect)

---

### 2️⃣ Desempenho dos Supervisores (3 Cards)

```
┌────────────────────────────────────┐ ┌────────────────────────────────────┐
│ 🥇 MARIA SILVA                     │ │ 🥈 JOÃO SANTOS                     │
│ ⭐⭐⭐⭐⭐                             │ │ ⭐⭐⭐⭐☆                            │
│ Projetos: 5 (4 Ativos) █████░░░░   │ │ Projetos: 4 (3 Ativos) ████░░░░░  │
│ Taxa: 92% ████████░░░░░░░░░░░░     │ │ Taxa: 85% ████████░░░░░░░░░░░░   │
│ Tarefas: 32 (28 ✓, 4 ⚠️)           │ │ Tarefas: 24 (20 ✓, 4 ⚠️)           │
│ Equipe: 5 membros                  │ │ Equipe: 4 membros                  │
│ Atribuições: 12 (hoje)             │ │ Atribuições: 8 (hoje)              │
│ Atribuições/Semana: 42             │ │ Atribuições/Semana: 35             │
│ Taxa Refaça: 0%                    │ │ Taxa Refaça: 8%                    │
│ Horas Médias: 8.2h                 │ │ Horas Médias: 7.8h                 │
│ Status: 🟢 Excelente               │ │ Status: 🟢 Bom                     │
│ Ação: Nenhuma                      │ │ Ação: Monitorar refaça             │
└────────────────────────────────────┘ └────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🥉 ANA COSTA                       │
│ ⭐⭐⭐⭐☆                            │
│ Projetos: 6 (4 Ativos) ████░░░░░░  │
│ Taxa: 75% ███████░░░░░░░░░░░░░░   │
│ Tarefas: 42 (31 ✓, 8 ⚠️)           │
│ Equipe: 6 membros                  │
│ Atribuições: 15 (hoje)             │
│ Atribuições/Semana: 45             │
│ Taxa Refaça: 5%                    │
│ Horas Médias: 7.5h                 │
│ Status: 🟡 Atenção                 │
│ Ação: Revisar distribuição         │
└────────────────────────────────────┘
```

**Dados por Supervisor:**
- Rating/Estrelas (⭐ 1-5)
- Quantidade de projetos (total + ativos)
- Taxa de conclusão (%)
- Quantidade de tarefas (total + concluídas + refaça)
- Tamanho da equipe
- Atribuições (hoje + semana)
- Taxa de refaça (%)
- Horas médias alocadas
- Status visual (🟢 🟡 🔴)
- Ação recomendada

---

### 3️⃣ Carga de Trabalho da Equipe (Tabela)

```
┌─────────────────┬───────────┬──────────┬──────────┬────────┬─────────┬──────────────┐
│ MEMBRO          │ SUPERVISOR│ ALOCADO  │RASTREADO│ DIFERENÇA│PROJETOS│ TAXA / STATUS│
├─────────────────┼───────────┼──────────┼──────────┼────────┼─────────┼──────────────┤
│ 👤 Maria Santos │ Maria S.  │ 7.2/8h   │ 6.8h     │ -0.4h  │    3    │  90% 🟢      │
│    Desde: 5 mês │           │ (90%)    │ (68%)    │ (95%)  │   ✓     │              │
│ ████████░░░░░░  │           │          │          │        │         │              │
│                 │           │          │          │        │         │              │
├─────────────────┼───────────┼──────────┼──────────┼────────┼─────────┼──────────────┤
│ 👤 João Silva   │ João S.   │ 8/8h     │ 8.2h     │ +0.2h  │    2    │ 100% 🔴      │
│    Desde: 3 mês │           │ (100%)   │ (82%)    │(102%)  │   ✓     │ NO LIMITE    │
│ ██████████░░░░░ │           │          │          │        │         │              │
└─────────────────┴───────────┴──────────┴──────────┴────────┴─────────┴──────────────┘
```

**Colunas:**
- Membro (nome + ícone)
- Supervisor responsável
- Horas alocadas (alocado/limite com %)
- Horas rastreadas (valor + %)
- Diferença (alocado - rastreado com %)
- Projetos ativos (quantidade)
- Taxa de conclusão + status visual

**Features:**
- Barra visual de progresso por membro
- Ordenação por workload (descendente)
- Destaque para "NO LIMITE" em vermelho
- Indicador de tempo na equipe

---

### 4️⃣ Histórico de Atribuições (Tabela com Timeline)

```
┌──────────┬──────────────────┬─────────────────────────────┬──────┬──────────────────┐
│ TIMESTAMP│ USUÁRIO          │ TAREFA / PROJETO            │ HORAS│ STATUS           │
├──────────┼──────────────────┼─────────────────────────────┼──────┼──────────────────┤
│ 10 min   │ 👤 Maria Santos  │ Implementar API             │ 6h   │ ✅ Ativo        │
│ atrás    │ (Maria Silva)    │ → Sistema Principal         │      │ Progresso: 45%   │
│          │                  │                             │      │                  │
├──────────┼──────────────────┼─────────────────────────────┼──────┼──────────────────┤
│ 25 min   │ 👤 Ana Costa     │ Testes Unitários            │ 5h   │ ✅ Ativo        │
│ atrás    │ (Ana Costa)      │ → Refatoração Backend       │      │ Progresso: 60%   │
```

**Dados:**
- Timestamp (relativo: "10 min atrás", "Ontem 16:45")
- Usuário atribuído + supervisor
- Tarefa + projeto
- Horas alocadas
- Status + progresso
- Paginação (15 por página com "Mostrar Mais")

**Estatísticas no topo:**
- Total de atribuições
- Atribuições hoje
- Atribuições esta semana
- Atribuições este mês

---

### 5️⃣ Análise de Atribuições (2 Colunas)

**Coluna Esquerda - Gráficos:**
```
Atribuições por Usuário (Esta Semana):
Maria Santos    ██████████████░░  14 atr
Ana Costa       ███████████░░░░░░  11 atr
João Silva      ████████░░░░░░░░░  10 atr

Atribuições por Supervisor (Esta Semana):
Maria Silva     ███████████████░░  15 atr
João Santos     ██████████░░░░░░░  10 atr
Ana Costa       ███████████░░░░░░  10 atr

Média por Dia: 8.3 atribuições
Peak: 18 (Segunda)
Low: 8 (Domingo)
```

**Coluna Direita - Padrões:**
```
Distribuição de Horas:
1-3h:   ▓░░░░░░░░░░   20%
3-6h:   ▓▓▓▓▓░░░░░░   45%
6-8h:   ▓▓▓▓░░░░░░░   35%

Média: 5.2h por atribuição
Moda: 5-6h (maior frequência)
Mediana: 5h

Taxa de Erro: 2.1%
(3 ajustes necessários esta semana)

Tendência: Gráfico de linha mostrando variação ao longo da semana
```

---

### 6️⃣ Tarefas em Risco (Tabela Detalhada)

```
┌─────┬────────┬──────────────────────┬───────────────┬──────────────┬───────────┐
│  #  │ STATUS │ TAREFA / PROJETO     │ SUPERVISOR    │ RESPONSÁVEL  │ DIAS ATS  │
├─────┼────────┼──────────────────────┼───────────────┼──────────────┼───────────┤
│  1  │🔴 CRIT │ Implementar API      │ Maria Silva   │ Maria S.     │ -2 dias   │
│     │        │ Sistema Principal    │ [Reavaliar]   │ Desde: -2d   │ ❌ AÇÃO!  │
│     │        │ Progresso: 45%       │ Risco: ALTO   │ Prev: -1d    │           │
│     │        │ ████░░░░░░░░░░░░░░  │               │              │           │
│     │        │ Horas: 6.5h / 10h    │               │ [Detalhes►]  │           │
│
├─────┼────────┼──────────────────────┼───────────────┼──────────────┼───────────┤
│  2  │🟠RISCO │ Análise de Requisitos│ João Santos   │ João S.      │ -5 dias   │
│     │        │ Módulo Pagamento     │ [Verificar]   │ Desde: -5d   │ ⚠️ AVISO  │
```

**Colunas:**
- Ranking (#)
- Status visual (🔴 🟠 🟡)
- Tarefa + projeto
- Supervisor responsável
- Responsável pela execução
- Dias atrasados
- Ação recomendada

---

### 7️⃣ Horas Rastreadas (Gráfico + Estatísticas)

```
     40h ┤
     35h ┤    ╱╲
     30h ┤   ╱  ╲  ╱╲
     25h ┤  ╱    ╲╱  ╲╱╲
     20h ┤ ╱              ╲╱
     15h ┤╱
      0h ┴────────────────────
        Seg Ter Qua Qui Sex Sab Dom

ESTATÍSTICAS:
Total: 168.5h em 7 dias
Média: 24.1h por dia
Peak: 32h (Quinta-feira)
Low: 18h (Domingo)
Tendência: ↑ +2.3h vs semana ant.
Desvio padrão: ±4.2h
Eficiência: 96% (vs alocado)
```

---

### 8️⃣ Top 5 Tarefas por Horas

```
1. Implementar API              6.5h 🟢
   Sistema Principal
   👤 Maria S. | ✓ 65% | Hoj: 10min

2. Testes Unitários             5.2h 🟢
   Refatoração Backend
   👤 Ana C. | ✓ 52% | Hoj: 45min

3. Análise de Requisitos        4.8h 🟢
   Módulo Pagamento
   👤 João S. | ✓ 48% | Hoj: 20min

4. Prototipagem                 4.5h 🟢
   Sistema Principal
   👤 Maria S. | ✓ 45% | Hoj: 15min

5. Code Review                  3.8h 🟢
   Módulo Pagamento
   👤 João S. | ✓ 38% | Hoj: 5min

Total Top 5: 24.8h (33% do total semana)
```

---

### 9️⃣ Distribuição de Status + Ranking

**Esquerda - Gráfico de Barras:**
```
Novo        ▓░░░░░░░░░░  15%   (8)
Em Desenv.  ▓▓▓▓░░░░░░░  44%  (24)
Análise     ▓░░░░░░░░░░  11%   (6)
Concluído   ▓▓▓▓▓▓░░░░░  58%  (32)
Refaça      ▓░░░░░░░░░░   7%   (4)

Total: 74 tarefas
Taxa Global: 58% concluído
Média de refaça: 1.8 por projeto

POR SUPERVISOR:
Maria Silva:  68% ✓ (excelente)
João Santos:  75% ✓ (bom)
Ana Costa:    62% ✓ (bom)
```

**Direita - Ranking:**
```
1. 🥇 MARIA SANTOS         95% ⭐⭐⭐⭐⭐
   Tarefas: 15 ✓ | 0% ⚠️
   Horas: 42h | Taxa: 96%
   Desde: 5 meses | Trending: ↑ +3%

2. 🥈 ANA COSTA            92% ⭐⭐⭐⭐⭐
   Tarefas: 18 ✓ | 2% ⚠️
   Horas: 45h | Taxa: 95%
   Desde: 2 meses | Trending: ↑ +2%

3. 🥉 JOÃO SILVA           85% ⭐⭐⭐⭐☆
   Tarefas: 12 ✓ | 8% ⚠️
   Horas: 38h | Taxa: 91%
   Desde: 3 meses | Trending: ↓ -1%

4. CARLOS MENDES           81% ⭐⭐⭐⭐☆
5. FERNANDA RIBEIRO        62% ⭐⭐⭐☆☆
```

---

### 🔟 Análise de Projetos

```
┌────────────────────────────────────────────────────────────────────┐
│ PROJETO                │SUPERVISOR│ STATUS │ PROGR │ HORAS   │ RISCO│
├────────────────────────────────────────────────────────────────────┤
│ Sistema Principal      │ M.Silva  │ 🟢     │ 68%  │ 48/72h  │ 🟢   │
│ Atribuições: 12        │          │ Ativo  │█████ │ (67%)   │      │
│ Taxa: 92% | Refaça: 0% │          │        │░░░░░ │         │      │
│                        │          │        │      │         │      │
├────────────────────────────────────────────────────────────────────┤
│ Módulo de Pagamento    │ J.Santos │ 🟡     │ 35%  │ 32/90h  │ 🟠   │
│ Atribuições: 8         │          │ Risco  │██    │ (36%)   │      │
│ Taxa: 75% | Refaça: 5% │          │        │░░░░░░│         │      │
│                        │          │        │      │         │      │
├────────────────────────────────────────────────────────────────────┤
│ Refatoração Backend    │ A.Costa  │ 🟢     │ 80%  │ 24/30h  │ 🟢   │
│ Atribuições: 15        │          │ Ativo  │██████│ (80%)   │      │
│ Taxa: 88% | Refaça: 2% │          │        │░░░░░░│         │      │
└────────────────────────────────────────────────────────────────────┘
```

---

### 1️⃣1️⃣ Indicadores de Saúde & Recomendações

```
🟢 Taxa de Conclusão Global        58% | Alvo: >60% | Status: ✓ OK
🟢 Taxa de Refaça                   3.2% | Alvo: <5% | Status: ✓ EXCELENTE
🟡 Taxa de Atraso                   5.8% | Alvo: <5% | Status: ⚠️ MONITORAR
🔴 Membros em Limite                1/5 | Alvo: 0 | Status: ❌ AÇÃO
🟢 Eficiência de Rastreamento      96% | Alvo: >90% | Status: ✓ ÓTIMO
🟢 Variância de Horas               ±4.2h | Alvo: <5h | Status: ✓ ESTÁVEL

RECOMENDAÇÕES:

🔵 BAIXA PRIORIDADE:
   → Revisar distribuição de projetos para Ana Costa (6 projetos)

🟡 MÉDIA PRIORIDADE:
   → Monitorar taxa de atraso de Módulo Pagamento
   → Analisar padrão de tarefas refaça com João Silva (8%)

🔴 ALTA PRIORIDADE:
   → AÇÃO IMEDIATA: João Silva em limite de 8h
   → Revisar "Implementar API" - 2 dias atrasada
   → Investigar causa de refaça em "Análise de Requisitos"
```

---

## 🔄 Diferenças Dashboard vs Monitoring

| Aspecto | Dashboard | Monitoring |
|---------|-----------|-----------|
| **Foco** | Visão rápida (1 página) | Análise profunda (5+ páginas) |
| **Dados** | Resumido/KPIs | Detalhado/Relatórios |
| **Filtros** | Nenhum | Período, usuário, status |
| **Gráficos** | Simples (barras) | Múltiplos (linha, barras, trends) |
| **Tabelas** | Cards | Tabelas detalhadas |
| **Histórico** | Não tem | Timeline completo |
| **Análises** | Básicas | Trends, padrões, comparações |
| **Recomendações** | Não tem | Sim, com prioridades (baixa/média/alta) |
| **Público** | Executivos/Quick check | Supervisores/Gestores/Analytics |

---

## 📊 Dados Necessários (Backend)

### Endpoints Requeridos

1. **GET `/api/monitoring/supervisors-performance`**
   - Lista de supervisores com dados detalhados
   - Campos: projetos, tarefas, equipe, atribuições, taxa refaça, etc.

2. **GET `/api/monitoring/team-workload-detailed`**
   - Dados completos por membro
   - Campos: supervisor, alocado, rastreado, diferença, projetos, taxa

3. **GET `/api/monitoring/assignments-history`**
   - Histórico completo de atribuições
   - Filtros: período, usuário, status
   - Paginação: 15 por página

4. **GET `/api/monitoring/assignment-patterns`**
   - Análise de padrões de alocação
   - Distribuição de horas, atribuições por usuário/supervisor

5. **GET `/api/monitoring/risk-tasks-detailed`**
   - Tarefas em risco com informações profundas
   - Ordenadas por criticidade

6. **GET `/api/monitoring/health-indicators`**
   - KPIs de saúde do projeto
   - Taxa conclusão, refaça, atraso, etc.

---

## 🎨 Styling & Components

**Padrão de Cards:**
- Fundo: `bg-white`
- Borda: `border border-gray-200`
- Sombra: `shadow-lg hover:shadow-xl`
- Arredondamento: `rounded-lg`

**Cores de Status:**
- 🟢 Bom: `text-green-600`
- 🟡 Aviso: `text-yellow-600`
- 🔴 Crítico: `text-red-600`

**Gráficos:**
- Barras: ASCII ou Chart.js
- Linhas: Trend visualization
- Cores consistentes com status

---

## 📝 Notas para Implementação

- [ ] Backend deve retornar dados já processados (não fazer cálculos no frontend)
- [ ] Filtros devem ser aplicados na API (query params)
- [ ] Paginação em histórico (lazy load ou "Mostrar Mais")
- [ ] Gráficos podem usar Chart.js ou D3.js se necessário
- [ ] Dados devem ser atualizáveis via botão "🔄 Atualizar"
- [ ] Performance: considerar virtualização para tabelas grandes
- [ ] Responsividade: tabelas podem esconder colunas em mobile

---

## 🚀 Ordem de Implementação

1. Estrutura base (header + filtros)
2. Desempenho dos Supervisores (3 cards)
3. Carga de Trabalho (tabela)
4. Histórico de Atribuições (tabela)
5. Análise de Atribuições (gráficos)
6. Tarefas em Risco (tabela)
7. Horas Rastreadas (gráfico)
8. Top Tarefas (lista)
9. Distribuição + Ranking (lado a lado)
10. Análise de Projetos (tabela)
11. Indicadores & Recomendações (cards)

---

## ✅ Checklist de Implementação

- [ ] Componente Monitoring.tsx reescrito
- [ ] 11 seções implementadas
- [ ] Filtros funcionando
- [ ] Gráficos renderizando
- [ ] Tabelas com dados reais
- [ ] Responsividade testada
- [ ] Performance otimizada
- [ ] Cores e styling consistentes
- [ ] Dados em tempo real
- [ ] Documentação atualizada

---

**Data de Criação:** 2026-02-03
**Próximos Passos:** Validação com usuário e implementação iterativa
