# Manual - Tela de Detalhe da Tarefa

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Todos os usuarios autenticados (filtrado por atribuicao)

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Cabecalho da Tarefa](#cabecalho-da-tarefa)
3. [Informacoes da Tarefa](#informacoes-da-tarefa)
4. [Atribuicoes](#atribuicoes)
5. [Time Tracking (Rastreamento de Tempo)](#time-tracking)
6. [Sessoes Finalizadas](#sessoes-finalizadas)
7. [Historico de Status](#historico-de-status)
8. [Grafico de Progresso](#grafico-de-progresso)

---

## Visao Geral

A tela de Detalhe da Tarefa e a mais completa do sistema. Aqui voce:

- Visualiza todas as informacoes da tarefa
- Controla o tempo de trabalho (Play/Pause/Stop)
- Acompanha o historico de alteracoes
- Gerencia atribuicoes de usuarios

```
+------------------------------------------------------------------+
|  [< Voltar]  P5.E2.T1 - Criar API de autenticacao    [EM DEV]   |
|                                                       [ALTA]     |
+------------------------------------------------------------------+
|                          |                                        |
|  INFORMACOES             |  TIME TRACKING                         |
|  - Descricao             |  [Play] [Pause] [Stop]                 |
|  - Horas: 8/20h          |  Tempo atual: 01:23:45                 |
|  - Prazo: 30/03/2026     |  Hoje: 3.5h                            |
|  - Criada: 15/01/2026    |                                        |
|                          |                                        |
+------------------------------------------------------------------+
|  ATRIBUICOES             |  SESSOES FINALIZADAS                   |
|  - Joao (4h/dia)         |  12/02 - 2h30 - "Corrigir bug X"      |
|  - Maria (4h/dia)        |  11/02 - 3h00 - "API endpoints"        |
+------------------------------------------------------------------+
|  HISTORICO DE STATUS                                              |
|  12/02 - Novo -> Em Desenvolvimento (por Joao)                   |
|  10/02 - Criada (por Admin)                                       |
+------------------------------------------------------------------+
```

---

## Cabecalho da Tarefa

### Elementos do cabecalho
- **Botao Voltar:** Retorna a lista de tarefas
- **ID:** Identificador hierarquico (P5.E2.T1)
- **Titulo:** Nome da tarefa
- **Status:** Badge colorido com status atual
- **Prioridade:** Badge com nivel de prioridade

---

## Informacoes da Tarefa

| Campo | Descricao |
|-------|-----------|
| Descricao | Texto descritivo da tarefa |
| Horas estimadas | Previsao total de horas |
| Horas registradas | Total de horas ja trabalhadas |
| Data de prazo | Prazo final |
| Data de criacao | Quando a tarefa foi criada |
| Tipo | Paralela, Nao Paralela ou Fixa |
| Dependencias | Tarefas que bloqueiam esta |

---

## Atribuicoes

### Lista de usuarios atribuidos
Para cada usuario atribuido, exibe:
- Nome completo
- Email
- Horas diarias alocadas
- Botoes de editar/remover (Supervisor/Admin)

### Atribuir novos usuarios

**Acesso:** Supervisor e Admin

1. Clique em **"Atribuir Usuarios"**
2. No modal:
   - Busque o usuario desejado
   - Marque o checkbox ao lado do nome
   - Defina as **horas diarias** para aquele usuario
   - O sistema sugere horas com base na tarefa
3. Clique em **"Salvar"**

### Regras de atribuicao
- O sistema valida dependencias: se a tarefa depende de outra, alerta o usuario
- Mostra dependencias bloqueantes no modal
- O total de horas diarias de um usuario nao deve exceder 8h

---

## Time Tracking

### Como funciona

O time tracking permite registrar o tempo real gasto em cada tarefa.

### Controles

| Botao | Acao | Quando usar |
|-------|------|-------------|
| **Play** | Inicia uma nova sessao | Quando comecar a trabalhar na tarefa |
| **Pause** | Pausa a sessao atual | Quando precisar de uma pausa |
| **Resume** | Retoma sessao pausada | Quando voltar da pausa |
| **Stop** | Finaliza a sessao | Quando terminar o periodo de trabalho |

### Fluxo tipico

```
[Play] --> Trabalhando (cronometro rodando)
  |
  +--> [Pause] --> Pausado
  |       |
  |       +--> [Resume] --> Trabalhando novamente
  |
  +--> [Stop] --> Sessao finalizada e registrada
```

### Informacoes exibidas durante a sessao
- **Hora de inicio:** Quando a sessao comecou
- **Tempo decorrido:** Cronometro em tempo real (HH:MM:SS)
- **Campo de notas:** Descricao do que esta sendo feito

### Limite diario
- O sistema limita a **8 horas por dia** por usuario
- Ao atingir o limite, o botao Play fica desabilitado
- Mensagem: "Limite diario atingido"

### Status do dia
- **Horas completadas hoje:** Total registrado no dia
- **Sessoes ativas:** Quantas sessoes estao rodando
- **Indicador de continuidade:** Se pode continuar trabalhando

---

## Sessoes Finalizadas

Tabela com todas as sessoes de trabalho ja concluidas:

```
+------------+----------+----------+----------------------------+--------+
| Data       | Inicio   | Duracao  | Notas                      | Acoes  |
+------------+----------+----------+----------------------------+--------+
| 12/02/2026 | 09:00    | 2h30min  | Implementacao dos endpoints| [Excl] |
| 11/02/2026 | 14:00    | 3h00min  | Correcao de bugs           | [Excl] |
| 10/02/2026 | 10:30    | 1h45min  | Setup inicial              | [Excl] |
+------------+----------+----------+----------------------------+--------+
```

### Filtros do historico
- **Periodo:** Hoje, Semana, Mes, Personalizado, Todos
- **Usuario:** Filtrar por usuario especifico
- **Data personalizada:** Selecionar intervalo de datas

### Excluir sessao
- Clique no botao de excluir na linha da sessao
- Confirmacao antes de excluir
- As horas serao subtraidas do total

---

## Historico de Status

Registro cronologico de todas as mudancas de status da tarefa:

```
12/02/2026 14:30  Em Desenvolvimento -> Analise Tecnica  (por Joao Silva)
10/02/2026 09:00  Novo -> Em Desenvolvimento              (por Admin)
08/02/2026 15:00  Tarefa criada                            (por Admin)
```

### Transicoes de status permitidas

```
Novo --> Em Desenvolvimento --> Analise Tecnica --> Concluido
  ^          |                       |
  |          v                       v
  +---- Em Desenvolvimento <---- Refaca
```

| De | Para | Observacao |
|----|------|------------|
| Novo | Em Desenvolvimento | Inicio do trabalho |
| Em Desenvolvimento | Analise Tecnica | Enviado para revisao |
| Em Desenvolvimento | Novo | Retorno ao backlog |
| Analise Tecnica | Concluido | Aprovado |
| Analise Tecnica | Refaca | Reprovado (motivo obrigatorio) |
| Refaca | Em Desenvolvimento | Inicio da correcao |

### Motivo de Refaca
- Quando uma tarefa e movida para **Refaca**, o motivo e **obrigatorio**
- O motivo fica registrado no historico
- Aparece destacado em vermelho

---

## Grafico de Progresso

### Como acessar
- Clique no botao de grafico na area de progresso

### O que mostra
- Comparativo visual: **Horas Estimadas vs Horas Registradas**
- Percentual de progresso
- Indicador se esta dentro ou acima do estimado

### Interpretacao

| Situacao | Significado |
|----------|-------------|
| Registrado < Estimado | Tarefa em andamento normal |
| Registrado = Estimado | Tarefa concluida em tempo |
| Registrado > Estimado | Tarefa excedeu a estimativa |

---

## Dicas de Uso

### Para usuarios
1. Sempre inicie o **Play** antes de trabalhar na tarefa
2. Use **Pause** para intervalos curtos (almoco, reuniao)
3. Use **Stop** no final do periodo de trabalho
4. Preencha as **notas** para registrar o que foi feito
5. Confira o **limite diario** antes de iniciar

### Para supervisores
1. Acompanhe o **historico de sessoes** para entender o esforco
2. Use o **grafico de progresso** para avaliar estimativas
3. Verifique o **historico de status** para rastrear o fluxo
4. Ajuste as **horas diarias** dos membros conforme necessidade
