# Manual - Tela de Dashboard

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Supervisor e Administrador

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Metricas Principais](#metricas-principais)
3. [Carga da Equipe](#carga-da-equipe)
4. [Tarefas em Risco](#tarefas-em-risco)
5. [Estatisticas de Tempo](#estatisticas-de-tempo)
6. [Distribuicao de Status](#distribuicao-de-status)
7. [Top Tarefas por Horas](#top-tarefas-por-horas)
8. [Tarefas Recentes](#tarefas-recentes)

---

## Visao Geral

O Dashboard e a tela inicial para supervisores e administradores. Apresenta uma visao consolidada de todo o sistema com metricas em tempo real.

```
+-------------------+-------------------+-------------------+-------------------+
|  Projetos Abertos |  Projetos Risco   |  Usuarios Ativos  |  Tarefas Refaca   |
|       12          |        3          |        8          |        5          |
+-------------------+-------------------+-------------------+-------------------+
|                                       |                                       |
|     CARGA DA EQUIPE                   |     TAREFAS EM RISCO                  |
|                                       |                                       |
+---------------------------------------+---------------------------------------+
|                                       |                                       |
|     ESTATISTICAS DE TEMPO             |     DISTRIBUICAO DE STATUS            |
|                                       |                                       |
+---------------------------------------+---------------------------------------+
|                                       |                                       |
|     TOP TAREFAS POR HORAS             |     TAREFAS RECENTES                  |
|                                       |                                       |
+---------------------------------------+---------------------------------------+
```

---

## Metricas Principais

Quatro cards no topo da pagina com numeros em destaque:

### Projetos Abertos
- Total de projetos com status ativo (nao concluidos/cancelados)

### Projetos em Risco
- Projetos que possuem tarefas atrasadas ou com problemas
- Card em **laranja** para chamar atencao

### Usuarios Ativos
- Total de usuarios ativos no sistema

### Tarefas em Refaca
- Tarefas que foram devolvidas para correcao
- Card com **destaque vermelho** por ser metrica critica
- Indica retrabalho na equipe

---

## Carga da Equipe

Mostra a carga de trabalho de cada membro da equipe:

```
Joao Silva      ████████████░░░░  75% (6.0h / 8.0h)
Maria Santos    ████████████████  100% (8.0h / 8.0h)  [NO LIMITE]
Pedro Costa     ██████░░░░░░░░░░  40% (3.2h / 8.0h)
```

### Cores da barra de progresso

| Cor | Condicao | Significado |
|-----|----------|-------------|
| Verde | Abaixo de 60% | Carga normal |
| Amarelo | 60% a 79% | Carga moderada |
| Laranja | 80% a 99% | Carga alta |
| Vermelho | 100% ou mais | No limite / Sobrecarregado |

### Badge "NO LIMITE"
- Aparece quando o usuario atinge ou excede 8h alocadas
- Indicador visual em vermelho

---

## Tarefas em Risco

Lista de tarefas que precisam de atencao:

### Indicadores de risco

| Indicador | Significado |
|-----------|-------------|
| CRITICO | Tarefa muito atrasada, requer acao imediata |
| RISCO | Tarefa com prazo proximo ou levemente atrasada |
| NO PRAZO | Tarefa dentro do cronograma esperado |

### Informacoes exibidas
- Nome da tarefa
- Projeto ao qual pertence
- Nivel de risco
- Dias de atraso ou restantes

---

## Estatisticas de Tempo (Hoje)

Resumo do time tracking do dia atual:

- **Horas totais:** total de horas registradas hoje por toda a equipe
- **Sessoes hoje:** quantas sessoes de trabalho foram realizadas
- **Sessoes ativas/pausadas:** quantas estao em andamento agora
- **Usuarios ativos:** quantos membros estao trabalhando agora

---

## Distribuicao de Status

Grafico horizontal mostrando a distribuicao das tarefas por status:

| Status | Cor |
|--------|-----|
| Novo | Azul |
| Em Desenvolvimento | Amarelo |
| Analise Tecnica | Roxo |
| Concluido | Verde |
| Refaca | Vermelho |

Para cada status: barra proporcional + contagem + percentual.

---

## Top Tarefas por Horas

Ranking das 5 tarefas com mais horas trabalhadas:

```
1. Tarefa X - Projeto Y     12.5h   (85%)
2. Tarefa Z - Projeto W      9.2h   (60%)
3. ...
```

Util para identificar onde a equipe esta concentrando esforco.

---

## Tarefas Recentes

Lista das tarefas mais recentemente criadas ou atualizadas:

- Nome da tarefa
- Projeto vinculado
- Status atual (badge colorido)

Permite acompanhar a atividade recente do sistema.
