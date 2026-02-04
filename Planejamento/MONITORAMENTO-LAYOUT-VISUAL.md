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

## 🔐 Acesso & Público-Alvo

### **Quem Acessa?**
- ✅ **Admin da Empresa**
- ✅ **Donos/Proprietários**
- ❌ **Supervisores** (NÃO têm acesso)
- ❌ **Usuários comuns** (NÃO têm acesso)

### **Propósito Principal**
🎯 **Avaliação de Desempenho e Gestão Executiva**
- Visão GERAL da saúde do projeto
- Avaliação de SUPERVISORES (essencial!)
- Análise de desempenho POR PESSOA/SUPERVISOR
- Tomada de decisão estratégica

### **Contexto Crítico**
> Esta é uma tela de **gestão e controle**, não de operação. Admin/Donos usam para:
> 1. Avaliar se supervisores estão fazendo bom trabalho
> 2. Identificar gargalos na equipe
> 3. Analisar padrões de trabalho
> 4. Tomar decisões sobre alocação de recursos

---

## 📐 Estrutura de Seções (11 no total)

### 1️⃣ Filtros & Período (Top - 3 colunas)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📅 PERÍODO                 ┃ 👤 FILTRAR SUPERVISOR     ┃ 📊 FILTRAR STATUS         ┃
┃ [De: 01/02] [Até: 03/02]  ┃ [Todos ▼]                 ┃ ☑ Novo ☑ Em Desenv        ┃
┃ [7 Últimos Dias] [Mês]     ┃ [Maria Silva]             ┃ ☑ Análise ☑ Concluído     ┃
┃                            ┃ [João Santos]             ┃ ☑ Refaça                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**Funcionalidades:**
- ✅ Seletor de período (7 dias, mês, intervalo customizável)
- ✅ Dropdown de SUPERVISORES (filtro por supervisor para avaliação)
  - **IMPORTANTE:** Lista APENAS supervisores, não usuários comuns
  - Objetivo: Admin avalia desempenho de cada supervisor
- ✅ Checkboxes de status (multiselect)

**Comportamento:**
- Quando seleciona "Maria Silva" (supervisor) → mostra dados/tarefas/equipe DESSA supervisora
- Todas as 10 seções abaixo são filtradas por esse supervisor
- Permite comparação de desempenho entre supervisores

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

## ✅ **DECISÃO FINAL - 9 SEÇÕES CONFIRMADAS**

**Seções que SERÃO Implementadas:**
1. ✅ Filtros & Período
2. ✅ Desempenho dos Supervisores
3. ✅ Carga de Trabalho da Equipe
4. ✅ Histórico de Atribuições
5. ✅ Análise de Atribuições
6. ✅ Tarefas em Risco
7. ✅ Horas Rastreadas
8. ✅ Top 5 Tarefas por Horas
9. ✅ Distribuição de Status + Ranking

**Seções Removidas (Decisão do Usuário):**
- ❌ Análise de Projetos - Redundante com outras seções
- ❌ Indicadores de Saúde - Resumo muito extra

**Princípio de Implementação:**
- ✅ Usar dados JÁ EXISTENTES no sistema
- ✅ NÃO criar novos endpoints/dados
- ✅ Implementar etapa por etapa
- ✅ Validar cada seção após implementação

---

## 🎯 **PLANO DE AÇÃO - Ordem de Implementação**

### **FASE 1: Base (Seções 1)**
1. Seção 1: Filtros & Período (base para tudo)
   - Setup da página Monitoring.tsx
   - Sistema de filtros funcional

### **FASE 2: Supervisores (Seção 2)**
2. Seção 2: Desempenho dos Supervisores
   - Cálculos de métricas por supervisor
   - Cards com dados dinâmicos

### **FASE 3: Equipe & Carga (Seção 3)**
3. Seção 3: Carga de Trabalho da Equipe
   - Tabela com filtro por supervisor
   - Ordenação por status

### **FASE 4: Histórico & Análises (Seções 4-5)**
4. Seção 4: Histórico de Atribuições
   - Paginação + timeline
5. Seção 5: Análise de Atribuições (gráficos)

### **FASE 5: Risco & Performance (Seções 6-7)**
6. Seção 6: Tarefas em Risco
   - Ordenação por criticidade
7. Seção 7: Horas Rastreadas (gráfico)

### **FASE 6: Ranking & Finalização (Seções 8-9)**
8. Seção 8: Top 5 Tarefas
9. Seção 9: Distribuição + Ranking
   - Testes e ajustes finais

---

## ✅ Checklist de Implementação

- [ ] Componente Monitoring.tsx criado
- [ ] Seção 1 (Filtros) - implementada e validada
- [ ] Seção 2 (Supervisores) - implementada e validada
- [ ] Seção 3 (Carga Trabalho) - implementada e validada
- [ ] Seção 4 (Histórico) - implementada e validada
- [ ] Seção 5 (Análise Atribuições) - implementada e validada
- [ ] Seção 6 (Tarefas Risco) - implementada e validada
- [ ] Seção 7 (Horas Rastreadas) - implementada e validada
- [ ] Seção 8 (Top 5 Tarefas) - implementada e validada
- [ ] Seção 9 (Distribuição + Ranking) - implementada e validada
- [ ] Responsividade testada
- [ ] Performance otimizada
- [ ] Cores e styling consistentes
- [ ] Dados em tempo real
- [ ] Documentação atualizada
- [ ] Acesso restrito (apenas Admin/Donos)

---

**Data de Criação:** 2026-02-03
**Atualizado:** 2026-02-04 - Validação com usuário sobre acesso e público-alvo

---

## 📌 Decisões de Design (Conversa com Usuário - 2026-02-04)

### **Decisão 1: Público-Alvo Exclusivo**
- ✅ **CONFIRMADO:** Apenas Admin/Donos acessam
- ✅ **CONFIRMADO:** Supervisores NÃO têm acesso
- **Motivo:** É uma ferramenta de avaliação de supervisores (não pode ser vista por eles)

### **Decisão 2: Filtro de Usuário → Supervisor**
- ✅ **CONFIRMADO:** Filtro deve linkar a SUPERVISORES
- ❌ **DESCARTADO:** Não lista usuários comuns
- **Motivo:** Admin quer avaliar cada supervisor individualmente
- **Comportamento:** Ao filtrar "Maria Silva", mostra desempenho/equipe/tarefas DELA

### **Decisão 3: Importância da Avaliação**
- ✅ **CRÍTICA:** Avaliação por pessoa/supervisor é "de extrema importância"
- ✅ **CRÍTICA:** Avaliação geral TAMBÉM é importante
- **Implicação:** Filtro "Todos" precisa mostrar visão geral; filtro individual para análise profunda

### **Seção 2: Desempenho dos Supervisores**

**Decisão 1: Comportamento com Filtro**
- ✅ **CONFIRMADO:** Quando filtrar por supervisor específico → mostra APENAS esse supervisor com detalhes profundos
- Se filtrar "Maria Silva" → card grande com dados DELA
- Se deixar "Todos" → mostra 3 cards (🥇🥈🥉)

**Decisão 2: Campos Mantidos**
- ✅ Rating/Estrelas
- ✅ Projetos (total + ativos)
- ✅ Taxa de Conclusão
- ✅ Tarefas (total + concluídas + refaça)
- ✅ Tamanho da Equipe
- ✅ Atribuições/Semana
- ❌ Atribuições/Dia (removido - "trabalhoso")
- ✅ Taxa Refaça ("bom ter")
- ✅ Horas Médias (mantém)
- ✅ Status Visual
- ✅ Ação Recomendada

**Decisão 3: Periodicidade (Opção A)**
- ✅ **CONFIRMADO:** Dados MUDAM com filtro de período
- Exemplo: Filtro "Período = Janeiro" → mostra dados de JANEIRO
- Permite análise histórica: "Como foi a Maria em janeiro vs fevereiro?"
- Taxa, tarefas, atribuições, etc. são recalculadas baseado no período selecionado

### **Seção 3: Carga de Trabalho da Equipe**

**Decisão 1: Filtro de Supervisor**
- ✅ **CONFIRMADO:** Quando filtrar "Maria Silva" → mostra APENAS pessoas atribuídas aos projetos dela
- Tabela dinâmica baseada no filtro do supervisor

**Decisão 2: Colunas Mantidas**
- ✅ MEMBRO (nome + tempo na empresa)
- ✅ SUPERVISOR (quem gerencia)
- ✅ ALOCADO (horas planejadas / limite %)
- ✅ RASTREADO (horas reais trabalhadas %)
- ✅ DIFERENÇA (alocado - rastreado %)
- ✅ PROJETOS (quantidade ativa)
- ✅ TAXA / STATUS (% conclusão + visual)

**Decisão 3: Ordenação**
- ✅ **CONFIRMADO - Opção B:** Por Status (Crítico → Bom)
- Lógica: 🔴 Crítico > 🟡 Atenção > 🟢 Bom
- **Resultado:** Problemas aparecem no topo, Admin vê urgências logo de cara
- **Vantagem:** Intuição visual com cores, não depende de números

### **Seção 4: Histórico de Atribuições**

**Decisão 1: Filtros Aplicados**
- ✅ **CONFIRMADO:** Período = "Janeiro" → mostra APENAS atribuições de janeiro
- ✅ **CONFIRMADO:** Supervisor = "Maria Silva" → mostra APENAS atribuições DELA
- ✅ **CONFIRMADO:** Status = "Concluído" → mostra APENAS tarefas concluídas
- **Resultado:** Tabela é totalmente dinâmica baseada em todos os filtros

**Decisão 2: Colunas Mantidas**
- ✅ TIMESTAMP (relativo: "10 min atrás", "Ontem 16:45")
- ✅ USUÁRIO (atribuído + supervisor)
- ✅ TAREFA + PROJETO
- ✅ HORAS (alocadas)
- ✅ STATUS + PROGRESSO
- ❌ Sem colunas adicionais (Prioridade, Risco, Dedicação diária não necessárias)

**Decisão 3: Ordenação**
- ✅ **CONFIRMADO:** Sempre "Mais recente primeiro"
- Ordem: 10 min atrás → Ontem → Semana passada → Mais antigo
- **NÃO configurável** - padrão fixo

**Estatísticas no Topo:**
- Total de atribuições (período inteiro)
- Atribuições hoje
- Atribuições esta semana
- Atribuições este mês

**Paginação:**
- 15 itens por página
- Botão "Mostrar Mais" para lazy load

### **Seção 5: Análise de Atribuições**

**Decisão 1: Filtros Aplicados**
- ✅ **CONFIRMADO:** Supervisor = "Maria Silva" → mostra gráficos DELA (sua equipe, seus projetos)
- ✅ **CONFIRMADO:** Período = "Janeiro" → mostra padrões APENAS de janeiro (não mistura com outros meses)
- ✅ **CONFIRMADO:** Status = "Concluído" → mostra APENAS horas de tarefas concluídas
- **Princípio:** Ao filtrar, TUDO respeita o filtro. Não mistura períodos, supervisores ou status.

**Coluna Esquerda - Gráficos de Distribuição:**
- Atribuições por Usuário (período filtrado)
- Atribuições por Supervisor (período filtrado)
- Média por Dia
- Peak (dia com mais atribuições)
- Low (dia com menos atribuições)

**Coluna Direita - Padrões de Horas:**
- Distribuição de Horas (1-3h, 3-6h, 6-8h)
- Média por atribuição
- Moda (frequência mais comum)
- Mediana
- Taxa de Erro (% de ajustes necessários)
- Tendência (gráfico de linha ao longo da semana)

**Importância:** ✅ Seção mantida - boa análise de padrões

### **Seção 6: Tarefas em Risco**

**Decisão 1: Filtros Aplicados**
- ✅ **CONFIRMADO:** Período = "Janeiro" → mostra APENAS tarefas em risco de janeiro
- ✅ **CONFIRMADO:** Supervisor = "Maria Silva" → mostra APENAS tarefas dela em risco
- ✅ **CONFIRMADO:** Status = "Concluído" → tabela DESAPARECE (tarefas concluídas não estão em risco)
- **Comportamento:** Tabela é dinâmica e desaparece se não há riscos no filtro selecionado

**Colunas:**
- Ranking (#) - ordem de criticidade
- Status Visual (🔴 Crítico / 🟠 Risco / 🟡 Aviso)
- Tarefa + Projeto
- Supervisor responsável
- Responsável pela execução
- Dias Atrasados (negativo = atrasado)
- Ação Recomendada (CRÍTICO!)

**Decisão 2: Ordenação**
- ✅ **CONFIRMADO:** Por Risco (Crítico 🔴 → Risco 🟠 → Aviso 🟡)
- **Resultado:** Piores problemas aparecem no topo logo

**Decisão 3: Ação Recomendada**
- ✅ **CONFIRMADO:** Essencial - ajuda Admin com ênfase nos alertas
- Exemplos:
  - 🔴 Crítico: "AÇÃO IMEDIATA: Aumentar equipe / Estender prazo"
  - 🟠 Risco: "Verificar progresso / Revisar escopo"
  - 🟡 Aviso: "Monitorar closely / Preparar contingência"

### **Seção 7: Horas Rastreadas**

**Decisão 1: Filtros Aplicados**
- ✅ **CONFIRMADO:** Período = "Janeiro" → mostra gráfico de JANEIRO (todos os 31 dias)
- ✅ **CONFIRMADO:** Supervisor = "Maria Silva" → mostra horas rastreadas DELA (+ sua equipe atrelada aos projetos)
- ✅ **CONFIRMADO:** Status = "Concluído" → mostra APENAS horas de tarefas concluídas
- **Comportamento:** Gráfico varia conforme período (7 dias, 31 dias, intervalo customizado)

**Gráfico:**
- Linha temporal mostrando horas por dia
- X: Dias da semana/mês
- Y: Horas trabalhadas

**Decisão 2: Estatísticas Simplificadas (Essenciais)**
- ✅ Total: Horas totais no período
- ✅ Média: Horas por dia
- ✅ Peak: Dia com mais horas (com identificação do dia)
- ✅ Low: Dia com menos horas (com identificação do dia)
- ✅ **Eficiência (%):** Horas rastreadas vs horas alocadas - DESTAQUE VISUAL! (Crítico)
- ❌ Removido: Tendência vs semana anterior (extra/simplificado)
- ❌ Removido: Desvio padrão (técnico demais)

### **Seção 8: Top 5 Tarefas por Horas**

**Decisão 1: Filtros Aplicados**
- ✅ **CONFIRMADO:** Supervisor = "Maria Silva" → mostra TOP 5 DELA (tarefas que ela/sua equipe mais trabalhou)
  - Nota: Equipe = quem está atribuído nos projetos/tarefas dela
- ✅ **CONFIRMADO:** Período = "Janeiro" → mostra TOP 5 de janeiro
- ✅ **CONFIRMADO:** Status = "Concluído" → mostra TOP 5 das tarefas concluídas

**Decisão 2: Informações Mantidas (Simplificadas)**
- ✅ Ranking (#) com horas totais
- ✅ Tarefa + Projeto
- ✅ Responsável (👤)
- ✅ Progresso (%)
- ✅ Horas Hoje (atividade recente)
- ❌ Removido: Status Visual (redundante com progresso)
- ❌ Removido: Prioridade (menos relevante)

**Decisão 3: "Total Top 5" - Mantido**
- ✅ **CONFIRMADO - Opção A:** Mostrar "Total Top 5: 24.8h (33% do total semana)"
- **Função:** Ajuda Admin entender se trabalho está concentrado (80%) ou distribuído (30%)
- **Insight:** Permite avaliar balanceamento da equipe

### **Seção 9: Distribuição de Status + Ranking**

**Decisão 1: Filtros Aplicados**
- ✅ **CONFIRMADO:** Supervisor = "Maria Silva" → mostra distribuição DELA + ranking de sua equipe (boa visualização)
- ✅ **CONFIRMADO:** Período = "Janeiro" → mostra dados overall ou por usuário de janeiro
- ❌ **Status NÃO afeta:** Essa seção mostra TODOS os status (distribuição seria inútil com só 1 status)
- **Filtros ativos:** Apenas Período + Supervisor

**Coluna Esquerda - Distribuição de Status:**
- Gráfico de barras: Novo, Em Desenvolvimento, Análise, Concluído, Refaça
- Percentual + quantidade (15%, 44%, 11%, 58%, 7%)
- Total de tarefas
- Taxa Global de Conclusão
- Média de refaça por projeto
- Performance por Supervisor (% de conclusão)

**Coluna Direita - Ranking (Top 5 Usuários)**
- ✅ Opção A + B JUNTAS:
  - % de Conclusão (95%, 92%, 85%) - métrica OBJETIVA
  - ⭐ Estrelas (calculadas automaticamente, não subjetivas)
  - Tarefas: total ✓ | % ⚠️
  - Horas (contexto)
  - Tempo na empresa
- ❌ Removido: Trending (simplificar, já está visual nas estrelas)

**Cálculo de Estrelas (Automático):**
- 95%+ → ⭐⭐⭐⭐⭐
- 80-94% → ⭐⭐⭐⭐☆
- 60-79% → ⭐⭐⭐☆☆
- 40-59% → ⭐⭐☆☆☆
- <40% → ⭐☆☆☆☆

### **Próximos Passos:**
1. ✅ Seção 1 (Filtros) - FINALIZADA
2. ✅ Seção 2 (Desempenho dos Supervisores) - FINALIZADA
3. ✅ Seção 3 (Carga de Trabalho da Equipe) - FINALIZADA
4. ✅ Seção 4 (Histórico de Atribuições) - FINALIZADA
5. ✅ Seção 5 (Análise de Atribuições) - FINALIZADA
6. ✅ Seção 6 (Tarefas em Risco) - FINALIZADA
7. ✅ Seção 7 (Horas Rastreadas) - FINALIZADA
8. ✅ Seção 8 (Top 5 Tarefas por Horas) - FINALIZADA
9. ✅ Seção 9 (Distribuição de Status + Ranking) - FINALIZADA
10. ⏳ Seção 10 (Análise de Projetos) - Próxima análise

---

**Próximos Passos:** Validação com usuário e implementação iterativa
