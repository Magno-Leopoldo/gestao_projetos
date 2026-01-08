# 📋 Guia Completo - Tela de Tarefas

## 📖 Visão Geral

A **Tela de Tarefas** é o coração do sistema de gestão de tempo. Aqui você visualiza todos os detalhes de uma tarefa específica e realiza o rastreamento do tempo gasto em sua execução através de sessões de trabalho (Play/Pause/Stop).

### ⭐ **NOVIDADES v2.2** (Janeiro 2026 - ATUALIZADO)

**FASE 1 - Progresso Acumulativo ✅**
- **Progresso NUNCA mais zera**: Agora é calculado com TODAS as sessões desde o início da tarefa
- **Auditoria Completa**: Histórico permanente de todo o trabalho realizado
- **Acumulativo por Tarefa**: Independente do dia, progresso é cumulativo

**FASE 2 - Filtros de Histórico Avançados ✅**
- **Filtro por Período**: Todos, Hoje, Últimos 7 dias, Últimos 30 dias, Customizado (range de datas)
- **Filtro por Usuário**: Selecione qual usuário visualizar no histórico
- **Coluna de Usuário na Tabela**: Veja claramente quem realizou cada sessão
- **Combinação de Filtros**: Use período + usuário simultaneamente

**Anteriormente (v2.1):**
- **Card "Horas Dedicadas" Interativo**: Clique para ver comparação entre sugestão do supervisor e compromisso real dos usuários
- **Edição de Horas por Usuário**: Cada usuário pode atualizar seu compromisso de horas/dia diretamente na lista de atribuídos
- **Modal Detalhado**: Acompanhe se os usuários estão acima ou abaixo da sugestão com dicas de impacto
- **Validação Melhorada**: Sistema valida limite de 8h/dia ao editar compromissos
- **Conclusão Estimada Dinâmica**: Cálculo automático baseado nas horas dedicadas dos usuários

---

## 🎯 Funcionalidades Principais

### 1. **Informações Básicas da Tarefa**

Na seção de cabeçalho, você encontra:

- **Título da Tarefa**: Nome descritivo do trabalho a ser realizado
- **Descrição**: Detalhes sobre o que precisa ser feito
- **ID**: Identificador único da tarefa no sistema
- **Status**: Estado atual (novo, em_desenvolvimento, analise_tecnica, concluido, refaca)
- **Prioridade**: Nível de urgência (baixa, média, alta)
- **Badge de Risco**: Indicador visual do prazo
  - 🟢 **NO PRAZO**: Tudo dentro do cronograma
  - 🟡 **ATENÇÃO**: Prazo próximo (7 dias ou menos)
  - 🟠 **CRÍTICO**: Muito próximo do vencimento (3 dias ou menos)
  - 🔴 **ATRASADO**: Prazo já passou

---

## ⏱️ Rastreamento de Tempo

### **O que é uma Sessão?**

Uma **sessão de trabalho** é um período contínuo ou interrompido onde você trabalha em uma tarefa. Cada sessão registra:

- ⏰ **Início**: Quando você começou a trabalhar
- ⏸️ **Pausas**: Quantas vezes pausou e por quanto tempo
- ⏹️ **Fim**: Quando finalizou o trabalho
- 📝 **Notas**: Observações sobre o trabalho realizado

### **Estados de uma Sessão**

```
▶️ Em andamento   → Trabalho está acontecendo agora
⏸️ Pausada        → Trabalho pausado temporariamente
✓ Finalizada     → Sessão concluída e salva
```

---

## 🎮 Controles de Rastreamento

### **Seção: Time Tracking Controls**

Aqui você controla o cronômetro da sessão atual.

#### **1️⃣ Iniciar uma Sessão (PLAY)**

```
[▶️ PLAY] → Clique para começar a rastrear tempo
```

**O que acontece:**
- Cronômetro inicia contando em tempo real
- Estado muda para "▶️ Em andamento"
- Você pode adicionar notas opcionais
- Validação automática verifica o limite de 8h/dia

**Aviso:** Se você já trabalhou 8 horas no dia, o botão fica desabilitado.

#### **2️⃣ Pausar a Sessão (PAUSE)**

```
[⏸️ PAUSE] → Clique para pausar temporariamente
```

**O que acontece:**
- Cronômetro para de contar
- Contador de pausa começa automaticamente
- Estado muda para "⏸️ Pausada"
- Contadores separados: **Trabalhando** e **Pausado**
- Contagem de pausas aumenta

#### **3️⃣ Retomar a Sessão (RESUME)**

```
[▶️ RESUME] → Clique para continuar de onde parou
```

**O que acontece:**
- Cronômetro continua do ponto onde parou (sem pular)
- Contador de pausa para
- Estado volta para "▶️ Em andamento"
- Nenhum tempo é perdido

#### **4️⃣ Finalizar a Sessão (STOP)**

```
[⏹️ STOP] → Clique para encerrar e salvar
```

**O que acontece:**
- Cronômetro para definitivamente
- Sessão é salva no banco de dados
- Estado muda para "✓ Finalizada"
- Aparece no histórico de sessões
- Novo estado é atualizado (horas registradas)

---

## 📊 Cards de Métricas

### **1. Horas Estimadas**

```
📌 Horas Estimadas
   40h
   Alocado para projeto
```

- Total de horas planejadas para a tarefa
- Definido durante a criação da tarefa
- Serve como meta de trabalho

### **2. Horas Dedicadas** ⭐ (INTERATIVO)

```
📅 Horas Dedicadas
   5.5h
   2 usuários comprometidos

   ⓘ Clique para ver detalhes
```

**O que é:**
- Total de horas que os usuários se comprometeram a trabalhar diariamente
- Calculado automaticamente a partir dos compromissos individuais
- **Diferente** da sugestão do supervisor

**Importante:** Este card é **interativo**!
- Clique para abrir um modal detalhado
- Veja a sugestão do supervisor vs compromissos reais
- Acompanhe se os usuários estão acima ou abaixo da sugestão

#### **Modal: Horas Dedicadas por Dia**

Ao clicar no card, um modal abre mostrando:

**📌 Sugestão do Supervisor**
```
2h/dia (em destaque âmbar)
```
- O que o supervisor sugeriu ao criar a tarefa
- Serve como referência para os usuários

**👥 Horas Alocadas pelos Usuários**
```
• João Silva        3h/dia
• Maria Santos      2.5h/dia
• Pedro Costa       1h/dia
```
- Compromisso de cada usuário
- Individual, não é soma para os outros usuários
- Cada um pode se comprometer até 8h/dia

**💼 Total Alocado**
```
6.5h/dia
3 usuários comprometidos
```
- Soma de todas as horas alocadas
- Útil para ver o impacto total no projeto
- Não tem limite máximo (diferente do limite individual de 8h)

**🔄 Comparação**
```
Sugestão: 2h
Alocado: 6.5h
Diferença: +4.5h (acima)
```

**Cores da Diferença:**
- 🟢 **Verde (acima)** → Usuários se comprometeram com MAIS que a sugestão
- 🟠 **Laranja (abaixo)** → Usuários se comprometeram com MENOS que a sugestão
- ⚪ **Cinza (igual)** → Compromisso é igual à sugestão

**Exemplos:**
```
Supervisor sugeriu: 4h/dia
Usuário A se comprometeu: 3h/dia
Usuário B se comprometeu: 2h/dia
Total: 5h/dia
Diferença: +1h (acima da sugestão)

---

Supervisor sugeriu: 5h/dia
Usuário A se comprometeu: 2h/dia
Total: 2h/dia
Diferença: -3h (abaixo da sugestão)
```

**Por que isso importa?**
- Se está ABAIXO, a tarefa pode demorar mais que o planejado
- Se está ACIMA, a tarefa pode ser concluída antes
- Ajuda o supervisor a reajustar as horas se necessário

### **3. Progresso** ⭐ (ACUMULATIVO)

```
📈 Progresso
   35%
   [████░░░░░░] Barra visual
```

- Calcula: (Horas Registradas / Horas Estimadas) × 100
- Baseado em TODAS as sessões **finalizadas** (status = stopped) desde o início
- **IMPORTANTE**: Progresso é acumulativo e **NUNCA zera** ao trocar de dia
- Atualiza automaticamente ao finalizar sessões
- Proporciona auditoria permanente do trabalho realizado

**Exemplo:**
```
Dia 1: 4 horas de trabalho → 10% de progresso
Dia 2: 6 horas de trabalho → 25% de progresso (10h acumuladas)
Dia 3: 2 horas de trabalho → 30% de progresso (12h acumuladas)

✅ Progresso NUNCA volta para 10% ou zeraria
✅ Mostra o total desde o início da tarefa
```

---

## 📅 Datas e Prazos

### **Data de Conclusão**

- Prazo definido para entrega da tarefa
- Afeta o badge de risco no header
- Mostra a data em formato brasileiro (dd/mm/yyyy)

### **Conclusão Estimada** ⭐ (DINÂMICA)

```
Fórmula: Hoje + (Horas Estimadas ÷ Total de Horas Dedicadas) dias
```

- **Cálculo automático e dinâmico** baseado nas horas que os usuários se comprometeram
- Recalcula automaticamente quando alguém edita suas horas/dia
- Se tarefa tem 40h estimadas e soma de usuários = 4h/dia: ~10 dias de trabalho
- **Nota:** É diferente de dias corridos no calendário

**Exemplo Dinâmico:**

```
Dia 1: Maria = 3h/dia, João = 2h/dia → Total = 5h/dia
       Estimado: Hoje + (40h ÷ 5h) = Hoje + 8 dias

Dia 2: Maria reduz para 2h/dia, João mantém 2h/dia → Total = 4h/dia
       Recalcula automaticamente:
       Estimado: Hoje + (40h ÷ 4h) = Hoje + 10 dias ⬆️ (aumento!)

Dia 3: Pedro é adicionado com 3h/dia → Total = 5h/dia novamente
       Recalcula: Hoje + (40h ÷ 5h) = Hoje + 8 dias ⬇️ (volta!)
```

✅ Sempre reflete a realidade atual das capacidades da equipe

---

## 👥 Gestão de Usuários Atribuídos

### **Seção: Usuários Atribuídos**

Mostra quem está trabalhando nesta tarefa.

#### **Adicionar Usuário**

```
[+ Atribuir Usuário] → Abre modal de seleção
```

**Validações:**
- ✅ Não pode exceder 8h/dia por usuário
- ✅ Não pode ter usuários duplicados
- ❌ Se falhar, mostra motivo no modal

#### **Remover Usuário**

```
[🗑️] → Botão ao lado de cada usuário
```

- Remove a atribuição da tarefa
- Não deleta o usuário do sistema
- Apenas desvincula da tarefa

#### **Informações Visíveis**

- Nome completo
- Email
- Role (Usuário, Supervisor, Admin)
- **⭐ Horas/dia que se comprometeu** (NOVO!)

#### **Editar Compromisso de Horas** ⭐ (NOVO!)

```
João Silva
joao@email.com

3h/dia (sugestão: 4h) [Editar] [🗑️]
```

**Como editar:**

```
1. Clique no botão [Editar] ao lado do usuário
2. Campo de input aparece com o valor atual
3. Mude para a nova quantidade de horas
4. Clique [Salvar] para confirmar
5. Sistema valida se não excede 8h/dia
```

**Validações ao editar:**
- ✅ Mínimo: 0h/dia
- ✅ Máximo: 8h/dia (limite individual)
- ✅ Não pode exceder 8h somando todas as tarefas do usuário
- ❌ Se falhar, mostra mensagem de erro claro

**Exemplo de Validação:**

```
Você tenta: 6h/dia
Usuário já tem alocado em outras tarefas: 3h/dia
Total seria: 6h + 3h = 9h/dia > 8h ❌

Mensagem: "Usuário já possui 3h/dia alocadas.
Solicitado: 6h. Disponível: 5h."
```

**Cores e Dicas:**

- 🟢 **Verde** → Horas foram atualizadas com sucesso
- 🔵 **Azul** → Comparação com a sugestão do supervisor
- 🟠 **Laranja** → Está abaixo da sugestão (pode impactar prazo)
- 🔴 **Vermelho** → Erro na atualização

---

## 📜 Histórico de Sessões

### **⭐ Filtros de Histórico (NOVO!)**

Acima da tabela, você encontra uma seção de filtros avançados para visualizar o histórico como precisar:

#### **1. Filtro por Período**

Botões para selecionar o intervalo de sessões a visualizar:

```
[Todos] [Hoje] [Semana] [Mês] [Customizado]
```

- **Todos**: Mostra TODAS as sessões desde o início da tarefa
- **Hoje**: Apenas sessões de hoje
- **Semana**: Últimos 7 dias
- **Mês**: Últimos 30 dias
- **Customizado**: Range de datas que você escolhe

**Se escolher "Customizado":**
```
┌─────────────────┬─────────────────┐
│ De: [01/01/26] │ Até: [07/01/26]  │
└─────────────────┴─────────────────┘
```
Aparecerão dois campos para você selecionar o período desejado.

#### **2. Filtro por Usuário**

Dropdown para filtrar por um usuário específico:

```
Usuário: ┌──────────────────────────┐
         │ Todos os usuários        │ ▼
         │ João Silva               │
         │ Maria Santos             │
         │ Pedro Costa              │
         └──────────────────────────┘
```

- **Todos os usuários**: Mostra sessões de todos (padrão)
- Selecione um nome: Mostra apenas sessões daquele usuário

#### **3. Combinação de Filtros**

Você pode usar período + usuário simultaneamente:

```
Exemplo: Mostrar apenas sessões da "Maria Santos" dos "Últimos 7 dias"

[Semana] + Usuário: Maria Santos
↓
Tabela mostra apenas trabalho da Maria nos últimos 7 dias
```

**Título Dinâmico:**
O título da tabela muda para refletir os filtros ativos:

```
"Histórico de Sessões - Semana (Filtrado por Maria Santos)"
"Histórico de Sessões - Customizado (Filtrado por João Silva)"
"Histórico de Sessões - Todos"
```

---

### **Tabela de Sessões**

Mostra as sessões de acordo com os filtros selecionados acima.

| Coluna | Descrição |
|--------|-----------|
| **Início** | Data e hora quando começou |
| **Usuário** ⭐ | Quem realizou a sessão (novo!) |
| **Status** | Estado atual (✓ Finalizada, ▶️ Em andamento, ⏸️ Pausada) |
| **Duração** | Tempo total trabalhado na sessão |
| **Notas** | Observações do usuário (ou "-" se vazio) |

**Exemplo de Tabela:**

```
Histórico de Sessões - Semana

| Início              | Usuário        | Status          | Duração  | Notas
|---------------------|----------------|-----------------|----------|----------
| 05/01/26 09:15     | João Silva     | ✓ Finalizada   | 3h 45m   | API Auth
| 05/01/26 14:30     | Maria Santos   | ✓ Finalizada   | 2h 30m   | DB Schema
| 06/01/26 08:00     | João Silva     | ✓ Finalizada   | 4h 20m   | Testes
| 07/01/26 10:00     | Pedro Costa    | ✓ Finalizada   | 1h 15m   | Docs
```

### **Como Visualizar Detalhes**

```
1. Clique em qualquer linha da tabela
2. Modal abre com informações completas
```

#### **Modal de Detalhes da Sessão**

O modal mostra:

**Tempo Total** (Azul)
- Soma de trabalho + pausa
- Ex: "1h 35m 42s"

**Tempo Dedicado** (Verde)
- Apenas tempo trabalhando
- Exclui pausas
- Ex: "1h 30m 10s"

**Tempo em Pausa** (Âmbar)
- Total de tempo pausado
- Ex: "5m 32s"

**Quantas Vezes Pausou** (Laranja)
- Contagem de interrupções
- Ex: "3 vezes"

**Horários** (Cinza)
- Data/Hora de início
- Data/Hora de fim (se finalizada)
- Status ao vivo (se em andamento)

**Notas** (Azul claro)
- Texto livre do usuário
- Descrição do trabalho realizado

**Status Badge** (Cor dinâmica)
- Mostra o estado final da sessão

---

## ⚠️ Limitações e Validações

### **Limite de 8 Horas/Dia**

```
┌─────────────────────────────────┐
│  Limite Diário: 8 horas         │
├─────────────────────────────────┤
│  🟢 0-5h   → Trabalhe à vontade │
│  🟡 5-7h   → Cuidado (aviso)    │
│  🟠 7-8h   → Próximo do limite  │
│  🔴 8h+    → PARAR (desabilitado)│
└─────────────────────────────────┘
```

**Quando atinge 8h:**
- Botão PLAY fica desabilitado
- Aviso crítico aparece
- Você DEVE finalizar a sessão ativa
- Sistema impede novas sessões

### **Validação ao Atribuir Usuário**

Não é possível atribuir se:
- ❌ Usuário já tem 8h/dia alocadas
- ❌ Horas da tarefa + horas atuais > 8h
- ❌ Usuário já está atribuído

---

## 💡 Dicas e Boas Práticas

### ✅ **Faça**

1. **Use notas descritivas**
   ```
   ✓ "Desenvolvido autenticação de usuários"
   ✓ "Corrigidos bugs no formulário de login"
   ✗ "Trabalho" (muito genérico)
   ```

2. **Pause quando apropriado**
   - Tire pausa para café/almoço
   - Interrupções (reunião, chamada)
   - Troca de contexto para outra tarefa

3. **Finalize ao sair**
   - Clique STOP antes de sair da tela
   - Evita deixar sessão "em andamento"

4. **Monitore o progresso**
   - Acompanhe o percentual
   - Se passar muito das horas estimadas, avise o supervisor

5. **⭐ Seja honesto com suas horas (NOVO!)**
   - Defina o compromisso de horas/dia realista
   - Se supervisor sugeriu 4h mas você consegue 3h, **mude para 3h**
   - Sistema usa isso para calcular prazos mais precisos
   - Melhor avisar cedo que não consegue que atrasar depois

6. **⭐ Verifique a comparação de horas**
   - Clique no card "Horas Dedicadas"
   - Veja se está acima ou abaixo da sugestão
   - Se abaixo, a tarefa pode atrasar
   - Comunique ao supervisor se não conseguir o compromisso

7. **⭐ Use os filtros de histórico (NOVO!)**
   - Filtre por período para ver apenas trabalho recente
   - Filtre por usuário para acompanhar rendimento individual
   - Use "Customizado" para análises de períodos específicos
   - Combine filtros para relatórios mais precisos

8. **⭐ Confie no progresso acumulativo**
   - O % de progresso NUNCA zera
   - Sempre mostra o total de trabalho desde o início
   - Ideal para supervisores acompanharem renderimento real
   - Fornece auditoria completa da tarefa

### ❌ **Não Faça**

1. ❌ Deixar sessão em andamento quando sair
2. ❌ Notas genéricas ("trabalho", "tarefa")
3. ❌ Iniciar nova sessão sem fechar a anterior
4. ❌ Ignorar avisos de limite de 8h
5. ❌ **Aceitar compromisso de horas que não consegue cumprir**
   - Se você não consegue 4h/dia, não coloque 4h
   - Isso afeta o cálculo de prazos para todos
   - Prejudica a estimativa do projeto
6. ❌ **Ignorar que está abaixo da sugestão**
   - Se você alocou 2h e sugestão é 4h, avise logo
   - Atrasos aparecem lá na frente, não antes

---

## 🔄 Fluxo Completo de Uso

### **Cenário Típico:**

```
1️⃣ ABRE A TELA
   ↓
2️⃣ VÊ INFORMAÇÕES DA TAREFA
   ↓
3️⃣ CLICA [▶️ PLAY]
   ↓
4️⃣ TRABALHA...
   ↓
5️⃣ PRECISA PAUSA? CLICA [⏸️ PAUSE]
   ↓
6️⃣ VOLTA DO CAFÉ? CLICA [▶️ RESUME]
   ↓
7️⃣ TERMINOU? CLICA [⏹️ STOP]
   ↓
8️⃣ SESSÃO APARECE NO HISTÓRICO
   ↓
9️⃣ CLICA NA SESSÃO PARA VER DETALHES
   ↓
🔟 MODAL MOSTRA TODAS AS MÉTRICAS
```

---

## 🚨 Mensagens de Erro Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Limite de 8 horas atingido" | Já trabalhou 8h hoje | Finalize a sessão ativa ou espere o próximo dia |
| "Não é possível atribuir usuário" | Ultrapassaria 8h/dia | Reduza horas da tarefa ou atribua a outro usuário |
| "Sessão não pode ser iniciada" | Validação falhou | Verifique se tem horas disponíveis no dia |

---

## 📱 Responsividade

A tela se adapta a diferentes tamanhos:

```
📱 Mobile (< 768px)
   ├─ Cards em coluna única
   ├─ Tabela com scroll horizontal
   └─ Modal em tela cheia

💻 Tablet (768px - 1024px)
   ├─ Alguns cards lado a lado
   ├─ Tabela legível
   └─ Modal com max-width

🖥️ Desktop (> 1024px)
   ├─ 3 cards de métricas em linha
   ├─ Tabela completa
   └─ Modal centralizado
```

---

## 🎓 Resumo Rápido

| Ação | Botão/Área | Resultado |
|------|-----------|-----------|
| Começar | [▶️ PLAY] | Cronômetro inicia |
| Pausar | [⏸️ PAUSE] | Cronômetro pausa, contador de pausa inicia |
| Continuar | [▶️ RESUME] | Cronômetro continua (sem pular) |
| Finalizar | [⏹️ STOP] | Sessão salva, aparece no histórico |
| Ver detalhes sessão | Clique linha tabela | Modal com métricas completas |
| Ver horas dedicadas | Clique card | Modal com comparação sugestão vs alocado |
| Atribuir usuário | [+ Atribuir] | Abre modal de seleção com input de horas |
| Editar horas usuário | [Editar] | Permite mudar compromisso de horas/dia |
| Remover usuário | [🗑️] | Remove atribuição da tarefa |
| Filtrar por período ⭐ | [Todos] [Hoje] [Semana] [Mês] [Custom] | Mostra sessões do período escolhido |
| Filtrar por usuário ⭐ | Dropdown "Usuário" | Mostra apenas sessões do usuário selecionado |
| Combinação de filtros ⭐ | Período + Usuário | Mostra interseção (ex: João na última semana) |
| Ver coluna de usuário ⭐ | Tabela histórico | Mostra quem realizou cada sessão |

---

## 📞 Precisa de Ajuda?

- **Limite de 8h/dia?** → Verifique "Progresso" na tela
- **Sessão não inicia?** → Você provavelmente atingiu 8h/dia
- **Dados não atualizam?** → Recarregue a página
- **Sessão desapareceu?** → Está no histórico, clique para ver

---

**Última atualização:** Janeiro 2026 (v2.2 - Progresso Acumulativo e Filtros Avançados)
**Versão:** Sistema de Rastreamento de Tempo v2.2
**Novidades v2.2:**
- Progresso acumulativo que NUNCA zera
- Filtros de período (Todos, Hoje, Semana, Mês, Customizado)
- Filtro por usuário
- Coluna de usuário no histórico
- Conclusão estimada dinâmica baseada em horas dedicadas

**Novidades v2.1:**
- Modal interativo de horas dedicadas
- Edição inline de compromissos de horas/dia
- Comparação automática com sugestão do supervisor
- Validação de limite de 8h/dia
