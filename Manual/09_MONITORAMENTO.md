# Manual - Tela de Monitoramento

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Apenas Administrador

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Filtros Gerais](#filtros-gerais)
3. [Secao 1: Performance dos Supervisores](#secao-1-performance-dos-supervisores)
4. [Secao 2: Carga dos Membros da Equipe](#secao-2-carga-dos-membros)
5. [Secao 3: Historico e Analise de Atribuicoes](#secao-3-historico-de-atribuicoes)
6. [Secao 4: Analise de Tarefas em Risco](#secao-4-tarefas-em-risco)
7. [Secao 5: Tarefas com Mais Colaboradores](#secao-5-tarefas-com-mais-colaboradores)
8. [Secao 6: Distribuicao de Status](#secao-6-distribuicao-de-status)

---

## Visao Geral

O Monitoramento e a tela mais analitica do sistema. Disponivel apenas para administradores, oferece uma visao profunda sobre:

- Performance de supervisores
- Carga de trabalho da equipe
- Historico de atribuicoes
- Tarefas em risco
- Distribuicao de status
- Graficos e estatisticas

---

## Filtros Gerais

No topo da tela, filtros que afetam todas as secoes:

### Periodo
| Botao | Descricao |
|-------|-----------|
| Hoje | Dados do dia atual |
| Ultimos 7 dias | Ultima semana |
| Ultimos 30 dias | Ultimo mes |
| Personalizado | Selecionar intervalo de datas |

### Filtro por supervisor
- Dropdown para filtrar dados de um supervisor especifico
- Botao "Aplicar" para confirmar

### Filtro por status de tarefa
- Checkboxes para incluir/excluir status especificos na analise

---

## Secao 1: Performance dos Supervisores

Cards individuais para cada supervisor com metricas de desempenho:

```
+------------------------------------------+
|  Joao Silva                   [EXCELENTE] |
|                                           |
|  Projetos: 8 total | 5 ativos | 2 concl. |
|  Em risco: 1                              |
|  Taxa de conclusao: 75%                   |
|  Tamanho da equipe: 6                     |
+------------------------------------------+
```

### Metricas por supervisor

| Metrica | Descricao |
|---------|-----------|
| Projetos totais | Quantidade de projetos supervisionados |
| Projetos ativos | Projetos em andamento |
| Projetos concluidos | Projetos finalizados |
| Projetos em risco | Projetos com tarefas atrasadas |
| Taxa de conclusao | Percentual de projetos concluidos |
| Tamanho da equipe | Numero de membros sob sua supervisao |

### Badge de performance

| Badge | Condicao |
|-------|----------|
| Excelente | Alta taxa de conclusao, poucos riscos |
| Bom | Performance adequada |
| Atencao | Muitos projetos em risco ou baixa conclusao |

---

## Secao 2: Carga dos Membros da Equipe

Tabela detalhada com a carga de trabalho de cada membro:

```
+------------------+--------------+--------+--------+----------+---------+
| Membro           | Supervisor   | Aloc.  | Track. | Projetos | Status  |
+------------------+--------------+--------+--------+----------+---------+
| Maria Santos     | Joao Silva   | 8.0h   | 6.5h   | 3        | LIMITE  |
| Pedro Costa      | Ana Oliveira | 4.0h   | 3.2h   | 2        | OK      |
| Carlos Mendes    | Joao Silva   | 7.5h   | 5.0h   | 4        | ATENCAO |
+------------------+--------------+--------+--------+----------+---------+
```

### Colunas

| Coluna | Descricao |
|--------|-----------|
| Membro | Nome do usuario |
| Supervisor | Quem supervisiona este membro |
| Horas alocadas | Total de horas alocadas no calendario |
| Horas rastreadas | Total de horas registradas via time tracking |
| Projetos ativos | Numero de projetos em que participa |
| Status | Indicador de carga |

### Status de carga

| Status | Cor | Significado |
|--------|-----|-------------|
| OK | Verde | Carga normal, abaixo de 80% |
| Atencao | Amarelo | Carga alta, entre 80% e 99% |
| No Limite | Vermelho | 100% ou mais, sobrecarregado |

---

## Secao 3: Historico e Analise de Atribuicoes

### Estatisticas de atribuicao

Cards com numeros:
- **Total de atribuicoes:** Total geral
- **Hoje:** Atribuicoes feitas hoje
- **Esta semana:** Atribuicoes da semana
- **Este mes:** Atribuicoes do mes

### Tabela de historico

Lista completa de todas as atribuicoes com:

| Coluna | Descricao |
|--------|-----------|
| Usuario | Quem recebeu a tarefa |
| Supervisor | Quem atribuiu |
| Tarefa | Nome da tarefa |
| Projeto | Projeto vinculado |
| Horas diarias | Horas alocadas por dia |
| Data | Quando foi atribuido |
| Status | Status atual da tarefa |
| Progresso | Percentual de conclusao |

### Graficos de analise

#### Por usuario
- Grafico de barras mostrando quem recebe mais atribuicoes

#### Por supervisor
- Grafico de barras mostrando quem mais atribui tarefas

#### Por faixa de horas
- Distribuicao de horas atribuidas (1-2h, 2-4h, 4-6h, 6-8h)

#### Tendencia diaria
- Grafico de linha mostrando atribuicoes ao longo do tempo

#### Estatisticas resumidas
- **Media:** Horas medias por atribuicao
- **Moda:** Valor mais frequente
- **Mediana:** Valor central

---

## Secao 4: Analise de Tarefas em Risco

Tabela detalhada de tarefas com problemas:

```
+------+-------------------+----------+-----------+--------+--------+--------+
| ID   | Tarefa            | Projeto  | Respons.  | Status | Progr. | Risco  |
+------+-------------------+----------+-----------+--------+--------+--------+
| T15  | API de pagamento  | E-comm   | Pedro     | Em Dev | 30%    | CRIT.  |
|      | 12 dias atrasada  |          |           |        |        |        |
+------+-------------------+----------+-----------+--------+--------+--------+
```

### Niveis de risco

| Nivel | Indicador | Descricao |
|-------|-----------|-----------|
| Critico | Vermelho | Muito atrasada, requer acao imediata |
| Alto | Laranja | Atrasada ou prazo muito proximo |
| Medio | Amarelo | Merece atencao |

### Informacoes por tarefa

| Campo | Descricao |
|-------|-----------|
| ID e titulo | Identificacao da tarefa |
| Projeto | A qual projeto pertence |
| Supervisor | Quem supervisiona o projeto |
| Responsavel | Usuario atribuido |
| Status | Status atual |
| Progresso | Barra de percentual |
| Nivel de risco | Badge colorido |
| Dias de atraso | Quantos dias esta atrasada |
| Motivo do risco | Descricao do problema |
| Motivo de refaca | Se aplicavel |

### Filtros e ordenacao
- Filtrar por nivel de risco
- Ordenar por: Nivel de risco, Dias de atraso, Progresso, Titulo
- Paginacao para muitas tarefas

---

## Secao 5: Tarefas com Mais Colaboradores

Tabela mostrando tarefas que envolvem mais pessoas:

| Campo | Descricao |
|-------|-----------|
| Tarefa | Nome da tarefa |
| Projeto | Projeto vinculado |
| Supervisor | Responsavel pelo projeto |
| Colaboradores | Numero de pessoas atribuidas |
| Horas totais | Soma das horas alocadas |
| Status | Status atual |
| Progresso | Percentual de conclusao |

### Utilidade
- Identifica tarefas complexas que exigem muitas pessoas
- Ajuda a detectar gargalos de coordenacao
- Tarefas com muitos colaboradores podem ter problemas de comunicacao

---

## Secao 6: Distribuicao de Status

Grafico visual mostrando a distribuicao de todas as tarefas por status:

| Status | Cor | Descricao |
|--------|-----|-----------|
| Novo | Azul | Tarefas nao iniciadas |
| Em Desenvolvimento | Amarelo | Em andamento |
| Analise Tecnica | Roxo | Em revisao |
| Concluido | Verde | Finalizadas |
| Refaca | Vermelho | Devolvidas para correcao |

Para cada status: contagem + percentual do total.

---

## Dicas de Uso para Administradores

1. **Comece pelo periodo:** Filtre por "Ultimos 7 dias" para uma visao recente
2. **Monitore riscos:** A Secao 4 e a mais critica — tarefas em risco precisam de acao
3. **Avalie supervisores:** Use a Secao 1 para comparar performance
4. **Equilibre cargas:** A Secao 2 mostra quem esta sobrecarregado
5. **Analise tendencias:** Os graficos da Secao 3 revelam padroes de atribuicao
6. **Tarefas complexas:** A Secao 5 indica onde ha risco de coordenacao
