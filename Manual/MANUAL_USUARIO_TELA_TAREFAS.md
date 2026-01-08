# 📋 Manual do Usuário - Tela de Tarefas

**Versão:** 1.0
**Data:** 08/01/2026
**Objetivo:** Guia completo para usar as funcionalidades da tela de tarefas do sistema de gestão de projetos

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Acessando as Tarefas](#acessando-as-tarefas)
3. [Lista de Tarefas](#lista-de-tarefas)
4. [Detalhes da Tarefa](#detalhes-da-tarefa)
5. [Rastreamento de Tempo (Time Tracking)](#rastreamento-de-tempo)
6. [Gráfico de Evolução de Horas](#gráfico-de-evolução-de-horas)
7. [Dicas e Boas Práticas](#dicas-e-boas-práticas)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A **tela de tarefas** é o coração do sistema. Aqui você pode:

✅ **Visualizar** todas as tarefas de um projeto
✅ **Rastrear tempo** gasto em cada tarefa (Play/Pause/Stop)
✅ **Monitorar progresso** em tempo real
✅ **Analisar dados** com gráficos detalhados
✅ **Gerenciar atribuições** e prazos

---

## 🚀 Acessando as Tarefas

### Opção 1: Pelo Menu Principal
1. Acesse **Projetos** no menu lateral
2. Selecione o projeto desejado
3. Clique em **"Ver Tarefas"** ou **"Tarefas"**

### Opção 2: Pelo Card do Projeto
1. Na tela de Projetos, localize o projeto
2. Clique no card do projeto
3. Você será direcionado automaticamente para a lista de tarefas

### Opção 3: Atalho Rápido
- Se estiver em uma tarefa, use **"Voltar para Lista"** para retornar

---

## 📋 Lista de Tarefas

### Visualização Inicial

Você verá uma lista organizada por **estágios/etapas** do projeto:

```
┌─────────────────────────────────┐
│  PROJETO: Sistema de Gestão     │
├─────────────────────────────────┤
│  📦 BACKLOG                     │
│  ├─ Tarefa 1 (Não iniciada)    │
│  ├─ Tarefa 2 (Não iniciada)    │
│                                 │
│  🚀 EM PROGRESSO                │
│  ├─ Tarefa 3 (Em andamento)    │
│  ├─ Tarefa 4 (45% concluída)   │
│                                 │
│  ✅ CONCLUÍDO                   │
│  ├─ Tarefa 5 (Concluída)       │
│  ├─ Tarefa 6 (Concluída)       │
└─────────────────────────────────┘
```

### Informações por Tarefa

Para cada tarefa você vê:

| Campo | Significado |
|-------|-------------|
| 📌 **Título** | Nome da tarefa |
| 👥 **Usuários** | Quem está trabalhando nela |
| ⏰ **Prazo** | Data limite (em vermelho se vencido) |
| 📊 **Progresso** | Barra de progresso visual |
| ⏱️ **Tempo** | Horas rastreadas / Horas estimadas |

### Ações Rápidas na Lista

**Clique em uma tarefa** para abrir os detalhes:
```
┌──────────────────────────┐
│ Tarefa: Implementar Login │
├──────────────────────────┤
│ Atribuído: João Silva     │
│ Progresso: 45%            │
│ Tempo: 12h / 20h          │
│ Prazo: 15/01/2026         │
│                            │
│ [Abrir Detalhes] →        │
└──────────────────────────┘
```

---

## 🔍 Detalhes da Tarefa

Ao abrir uma tarefa, você acessa a **visão completa**:

### 1️⃣ Informações Gerais

```
┌─────────────────────────────────────┐
│ Tarefa: Implementar Sistema Login    │
├─────────────────────────────────────┤
│ Status: Em Progresso                │
│ Atribuído: João Silva, Maria Santos │
│ Prazo: 15/01/2026                  │
│ Prioridade: Alta 🔴                │
│ Descrição: "Implementar tela..."    │
└─────────────────────────────────────┘
```

### 2️⃣ Controle de Tempo (Play/Pause/Stop)

Este é o **coração do rastreamento de tempo**:

#### 🟢 Iniciar Sessão (PLAY)
1. Clique no botão **PLAY** verde
2. A sessão inicia imediatamente
3. Um timer começa a contar o tempo

```
Estado: ▶️ PLAY (Rodando)
Tempo: 0:00:15 (15 segundos)
[⏸️ PAUSAR] [⏹️ PARAR]
```

#### ⏸️ Pausar Sessão (PAUSE)
1. Clique em **PAUSAR**
2. O timer congela no tempo atual
3. Você pode retomar depois

```
Estado: ⏸️ PAUSADO
Tempo congelado: 0:05:30
[▶️ RETOMAR] [⏹️ PARAR]
```

#### ⏹️ Finalizar Sessão (STOP)
1. Clique em **PARAR**
2. A sessão é registrada permanentemente
3. As horas são somadas ao histórico

```
✅ Sessão finalizada!
Duração total: 0:15:45
Horas registradas: 0.26h

Começar nova sessão?
[▶️ PLAY]
```

### 3️⃣ Avisos de Limite de Horas

O sistema protege você de trabalhar demais:

**Aviso Amarelo (⚠️ Caution)**
```
Você já trabalhou 5 horas hoje
Apenas 3 horas disponíveis
⚠️ Quase atingindo o limite
```

**Aviso Vermelho (🔴 Crítico)**
```
Você já trabalhou 7 horas hoje
Apenas 1 hora disponível
🔴 LIMITE PRÓXIMO!
```

**Bloqueio (❌ Limite Atingido)**
```
❌ Você atingiu o limite de 8 horas/dia
Não é possível iniciar nova sessão
Retorne amanhã
```

### 4️⃣ Histórico de Sessões

Abaixo dos botões de controle, você vê todas as sessões passadas:

```
📅 Hoje - 15/01/2026
├─ 09:00 - 10:30  (1h 30m)  João Silva
├─ 14:00 - 15:45  (1h 45m)  João Silva
├─ 16:00 - 16:15  (15m)     João Silva
│
📅 Ontem - 14/01/2026
├─ 10:00 - 12:00  (2h)      João Silva
```

Clique em uma sessão para ver **detalhes completos**:
```
┌─────────────────────────────┐
│ Sessão #1234                 │
├─────────────────────────────┤
│ Usuário: João Silva          │
│ Data: 15/01/2026            │
│ Início: 09:00:00            │
│ Fim: 10:30:00               │
│ Duração: 1h 30m             │
│ Pausas: 5m (2 vezes)        │
│ Tempo real: 1h 25m          │
│ Notas: "Implementação..."   │
└─────────────────────────────┘
```

### 5️⃣ Card de Progresso 📊

Clique neste card para abrir o **Gráfico de Evolução de Horas**:

```
┌─────────────────┐
│ Progresso: 45%  │ ← Clique aqui!
│ 🟦🟦🟦⬜⬜   │
│ 9h / 20h        │
└─────────────────┘
```

---

## ⏱️ Rastreamento de Tempo

### Como Funciona?

```
1. PLAY (Iniciar)
   ↓
   Timer começa [0:00]
   ↓
2. PAUSE (Pausar) - OPCIONAL
   ↓
   Timer congela [0:05:30]
   ↓
3. RESUME (Retomar) - OPCIONAL
   ↓
   Timer continua [0:05:31, 0:05:32...]
   ↓
4. STOP (Finalizar)
   ↓
   Sessão registrada ✅
   Horas adicionadas ao histórico
```

### Exemplo Prático

**Cenário:** Você está implementando uma feature

```
09:00 - Clico PLAY
        Sistema: "Sessão iniciada"
        Timer: [0:00]

09:05 - Preciso responder um email
        Clico PAUSAR
        Timer: [0:05] (congelado)

09:15 - Volto ao trabalho
        Clico RETOMAR
        Timer: [0:05] (continua...)

10:30 - Terminei a feature
        Clico PARAR
        Sistema: "1h 30m registrados ✅"
```

### Limite Diário de 8 Horas

O sistema tem um **limite automático de 8 horas por dia**:

```
Horas registradas hoje: 7h 45m
Horas disponíveis: 15m

[PLAY] Botão ativo, mas com aviso:
⚠️ "Você pode trabalhar apenas 15 minutos mais"

Após 8 horas:
❌ [PLAY] Desabilitado
"Limite diário atingido. Retorne amanhã."
```

---

## 📈 Gráfico de Evolução de Horas

Este é um dos recursos mais poderosos do sistema!

### Como Acessar

1. Abra uma tarefa
2. Clique no **Card de Progresso** (mostra a porcentagem)
3. Um modal grande com o gráfico abrirá

```
┌────────────────────────────────────────┐
│ ✖️ Evolução das Horas                   │
│                                         │
│ 📊 Gráfico com 2 linhas:               │
│                                         │
│    Horas (Y)                           │
│    ↑                                    │
│  16│                    ╱╲              │
│  14│                  ╱  ╲              │
│  12│                ╱      ╲────        │
│  10│              ╱                     │
│   8│─────────────────── (Meta)         │
│   6│                                    │
│   4│                                    │
│   2│                                    │
│   0└─────────────────────────→ Dias    │
│                                         │
│  Legenda:                              │
│  🔵 Linha Azul: Horas reais (feito)   │
│  🟢 Linha Verde: Meta (sugestão)      │
└────────────────────────────────────────┘
```

### Entendendo as Linhas

**🔵 Linha Azul (Horas Reais)**
- O que realmente foi trabalhado
- Varia de dia para dia
- Exemplo: Seg 4h, Ter 6h, Qua 3h

**🟢 Linha Verde (Meta/Sugestão)**
- O que foi estimado trabalhar por dia
- Reta constante (não varia)
- Exemplo: 8h por dia

### Comparação Rápida

```
Se azul está ACIMA de verde:
→ Você trabalhou MAIS que o previsto 💪

Se azul está ABAIXO de verde:
→ Você trabalhou MENOS que o previsto ⚠️

Se as linhas se CRUZAM:
→ Às vezes acima, às vezes abaixo (variável)
```

### Filtros - Como Usar

#### 1️⃣ Filtro de Período

Escolha qual período visualizar:

| Opção | O que mostra | Exemplo |
|-------|-------------|---------|
| **Todos** | Histórico completo desde o início | Toda evolução |
| **Hoje** | Apenas hoje | Trabalho de hoje |
| **Semana** | Últimos 7 dias | Essa semana |
| **Mês** | Últimos 30 dias | Esse mês |
| **Customizado** | Período específico | De 01/01 até 15/01 |

#### 2️⃣ Filtro de Usuário

Se múltiplos usuários trabalham na tarefa:

**Todos**
- Mostra a soma total de todas as horas
- Visão macro do esforço da equipe

**[Nome do Usuário]**
- Mostra apenas as horas daquele usuário
- Acompanhar contribuição individual

#### 3️⃣ Filtro de Data (Customizado)

Quando seleciona "Customizado":
1. Clique em **"De:"** e escolha a data inicial
2. Clique em **"Até:"** e escolha a data final
3. Gráfico atualiza automaticamente

### Estatísticas Acima do Gráfico

4 cards mostram números importantes:

**📅 Dias** (Azul)
```
Quantidade de dias diferentes com registros
Exemplo: 10 dias
Significa: Trabalho feito em 10 dias distintos
```

**⏱️ Total** (Verde)
```
Soma total de horas no período
Exemplo: 52h
Significa: 52 horas de trabalho no total
```

**📊 Média** (Roxo)
```
Horas por dia em média
Fórmula: Total ÷ Dias
Exemplo: 52h ÷ 10 dias = 5,2h/dia
```

**📈 Máximo** (Laranja)
```
Maior número de horas em um dia
Exemplo: 8h
Significa: Dia mais produtivo teve 8h
```

### Tooltip (Passe o Mouse)

Passe o mouse sobre qualquer ponto azul do gráfico:

```
┌──────────────────────────────┐
│ Terça-feira, 14 de janeiro   │
├──────────────────────────────┤
│ 🔵 Horas Reais: 6.50h        │
│ 🟢 Sugestão: 8.00h           │
│                              │
│ 📊 Diferença: -1.50h         │
│    73.1% da meta ⚠️          │
│                              │
│ 👥 Detalhamento por Usuário: │
│    ├─ João Silva: 3.50h      │
│    └─ Maria Santos: 3.00h    │
└──────────────────────────────┘
```

### Exemplo Prático: Analisando o Gráfico

**Cenário:** Você quer avaliar o progresso da semana

1. Filtro: **"Semana"**
2. Usuário: **"Todos"**
3. Resultado: Gráfico mostra últimos 7 dias

```
📊 Análise:
- Seg-Qua: Azul acima de verde (esforço extra!)
- Qui-Sex: Azul abaixo de verde (ritmo reduzido)
- Conclusão: Primeira metade foi intensa,
              segunda foi mais leve
```

---

## 💡 Dicas e Boas Práticas

### ✨ Dica 1: Iniciar Sempre com PLAY

Quando começar a trabalhar em uma tarefa:
```
1. Abra a tarefa
2. Clique imediatamente em PLAY
3. Trabalhe normalmente
```

**Por que?** Assim o tempo é rastreado automaticamente e você não esquece de registrar.

### ✨ Dica 2: Pausar para Distrações

Se precisa fazer algo fora da tarefa:
```
1. Está trabalhando... PLAY [rodando]
2. Precisa responder email
3. Clique PAUSAR
4. O timer congela (não conta tempo de distração)
5. Quando volta, clique RETOMAR
```

### ✨ Dica 3: Usar Notas em Sessões Longas

Se trabalhar mais de 1 hora:
```
Ao finalizar (STOP), adicione uma nota:
"Implementação do login + testes unitários"

Isso ajuda a lembrar depois o que foi feito
```

### ✨ Dica 4: Revisar o Gráfico Semanalmente

No final de cada semana:
```
1. Abra uma tarefa
2. Clique no card de progresso
3. Selecione filtro "Semana"
4. Analise se está no caminho certo
```

### ✨ Dica 5: Comparar Usuários

Para ver quem contribuiu mais:
```
1. Abra o gráfico
2. Selecione filtro "Todos" (usuários)
3. Veja a soma total
4. Depois selecione cada usuário individualmente
5. Compare os padrões
```

### ✨ Dica 6: Detectar Atrasos Cedo

Se a linha azul está consistentemente ABAIXO da verde:
```
⚠️ A tarefa pode estar atrasando

Ações:
- Aumentar alocação de horas
- Revisar estimativa
- Pedir ajuda
```

### ✨ Dica 7: Mobile-Friendly

O sistema funciona em celular:
```
- Filtros em coluna (não em linha)
- Gráfico redimensiona automaticamente
- Toque para ver tooltips (não hover)
```

### ✅ Boas Práticas

✅ Iniciar PLAY quando começa a trabalhar
✅ Pausar se vai sair da tarefa por mais de 5 minutos
✅ Finalizar (STOP) antes de ir para outra tarefa
✅ Revisar gráfico semanalmente
✅ Adicionar notas em sessões longas
✅ Ser realista na estimativa de horas
✅ Comunicar atrasos logo que perceber

### ❌ Erros Comuns a Evitar

❌ Esquecer de clicar PLAY (não registra tempo)
❌ Deixar PLAY rodando enquanto não trabalha
❌ Não pausar para distrações (conta tempo errado)
❌ Estimar horas muito baixas ou altas
❌ Ignorar avisos de limite de 8 horas
❌ Não revisar o gráfico (não acompanha progresso)

---

## 🚨 Troubleshooting

### Problema: Não consigo iniciar uma sessão (botão PLAY desabilitado)

**Possíveis causas:**

1. **Limite de 8 horas diárias atingido**
   ```
   Mensagem: "❌ Limite de 8 horas/dia atingido"
   Solução: Retorne amanhã ou contact gestor
   ```

2. **Não está atribuído à tarefa**
   ```
   Mensagem: "Você não está atribuído a esta tarefa"
   Solução: Peça ao gestor para ser atribuído
   ```

3. **Sessão ativa em outra tarefa**
   ```
   Mensagem: "Você tem uma sessão ativa em outra tarefa"
   Solução: Finalize a outra sessão primeiro (STOP)
   ```

### Problema: Tooltip não aparece ao passar mouse no gráfico

**Possíveis causas:**

1. **Nenhum dado disponível**
   ```
   Solução: Selecione um período com dados (ex: "Todos")
   ```

2. **Mouse muito rápido**
   ```
   Solução: Passe o mouse mais lentamente sobre os pontos azuis
   ```

3. **Navegador em cache**
   ```
   Solução: Pressione F5 para recarregar a página
   ```

### Problema: Horas não estão sendo registradas

**Possíveis causas:**

1. **Sessão não foi finalizada**
   ```
   Verifique: A sessão deve estar com status "Concluída" (STOP)
   Solução: Clique STOP para finalizar a sessão
   ```

2. **Conexão perdida**
   ```
   Verifique: Sua conexão está estável?
   Solução: Verifique conexão WiFi/Internet
   ```

3. **Servidor indisponível**
   ```
   Solução: Tente novamente em alguns minutos
   ```

### Problema: Gráfico está vazio ou mostra 0 horas

**Possíveis causas:**

1. **Nenhuma sessão finalizada nesse período**
   ```
   Verifique: Você realmente trabalhou nesse período?
   Solução: Selecione um período com sessões finalizadas
   ```

2. **Filtro muito restritivo**
   ```
   Solução: Mude filtro de "Customizado" para "Todos"
   ```

3. **Sessões ainda em progresso**
   ```
   Nota: Só conta sessões FINALIZADAS (STOP)
   Solução: Finalize as sessões para elas aparecerem no gráfico
   ```

### Problema: Aviso de limite é muito restritivo

**Exemplo:**
```
Você tem 7h de trabalho e só 1h disponível
Quer trabalhar só 30 minutos, mas sistema bloqueia?
```

**Solução:**
- Clique PAUSE para congelar o tempo
- Termine rápido (antes do tempo passar)
- Clique STOP para finalizar

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique este manual** - a resposta pode estar aqui
2. **Recarregue a página** (F5) - soluciona muitos problemas
3. **Limpe o cache** - `Ctrl+Shift+Delete`
4. **Contate o gestor/desenvolvedor** - com prints e descrição do problema

---

## 🎓 Próximas Etapas

Depois de dominar estas funcionalidades:

- Explore **Relatórios** para análises gerenciais
- Use **Filtros avançados** para tarefas específicas
- Integre com **Calendário** para melhor planejamento
- Configure **Notificações** para prazos

---

## 📚 Documentação Relacionada

- [Guia Gráfico de Evolução de Horas](GUIA_GRAFICO_EVOLUCAO_HORAS.md)
- [Manual do Projeto](MANUAL_USUARIO_PROJETOS.md) *(em breve)*
- [FAQ e Respostas Comuns](FAQ_TAREFAS.md) *(em breve)*

---

**Versão:** 1.0
**Última atualização:** 08/01/2026
**Mantido por:** Equipe de Desenvolvimento

📧 Dúvidas? Sugestões? Entre em contato!
