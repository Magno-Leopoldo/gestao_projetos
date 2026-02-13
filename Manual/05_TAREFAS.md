# Manual - Tela de Lista de Tarefas

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Todos os usuarios autenticados

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Navegacao e Breadcrumb](#navegacao-e-breadcrumb)
3. [Lista de Tarefas](#lista-de-tarefas)
4. [Filtros e Ordenacao](#filtros-e-ordenacao)
5. [Criar Nova Tarefa](#criar-nova-tarefa)
6. [Informacoes por Tarefa](#informacoes-por-tarefa)
7. [Acoes Rapidas](#acoes-rapidas)
8. [Paginacao](#paginacao)

---

## Visao Geral

A lista de tarefas exibe todas as tarefas de uma etapa especifica do projeto. Aqui o usuario pode ver o status, prioridade, progresso e acessar cada tarefa para mais detalhes.

- **Usuarios comuns** veem apenas tarefas atribuidas a eles
- **Supervisores e Admins** veem todas as tarefas da etapa

---

## Navegacao e Breadcrumb

```
Projetos  /  E-commerce Platform  /  Desenvolvimento  /  Tarefas
```

Cada nivel e clicavel para navegar de volta.

---

## Lista de Tarefas

As tarefas sao exibidas em formato de tabela:

```
+-------+----------------------------+--------+----------+-------------+--------+--------+
| ID    | Titulo                     | Status | Prior.   | Atribuidos  | Horas  | Progr. |
+-------+----------------------------+--------+----------+-------------+--------+--------+
| P5.E2 | Criar API de autenticacao  | Em Dev | Alta     | Joao, Maria | 8/20h  |  40%   |
| .T1   |                            |        |          |             |        |        |
+-------+----------------------------+--------+----------+-------------+--------+--------+
| P5.E2 | Tela de login              | Novo   | Media    | Pedro       | 0/12h  |   0%   |
| .T2   |                            |        |          |             |        |        |
+-------+----------------------------+--------+----------+-------------+--------+--------+
```

---

## Filtros e Ordenacao

### Barra de busca
- Busca por titulo da tarefa

### Filtro por usuario
- Dropdown para ver tarefas de um usuario especifico

### Filtro por status (checkbox)
| Status | Cor |
|--------|-----|
| Novo | Azul |
| Em Desenvolvimento | Amarelo |
| Analise Tecnica | Roxo |
| Concluido | Verde |
| Refaca | Vermelho |

### Filtro por prioridade (checkbox)
| Prioridade | Cor |
|------------|-----|
| Alta | Vermelho |
| Media | Azul |
| Baixa | Cinza |

### Ordenacao
- **Ordem:** Por ID (padrao)
- **Status:** Agrupa por status
- **Prioridade:** Alta primeiro
- **Horas estimadas:** Maior esforco primeiro

---

## Criar Nova Tarefa

**Acesso:** Apenas Supervisor e Admin

### Como criar

1. Clique no botao **"Criar Tarefa"**
2. Preencha o formulario:

| Campo | Obrigatorio | Descricao |
|-------|:-----------:|-----------|
| Titulo | Sim | Nome da tarefa |
| Descricao | Nao | Detalhes da tarefa |
| Horas estimadas | Nao | Previsao de horas para conclusao |
| Horas diarias | Nao | Horas por dia que deve ser trabalhada |
| Prioridade | Sim | Alta, Media ou Baixa |
| Data de prazo | Nao | Prazo final |
| Tipo | Sim | Paralela, Nao Paralela ou Fixa |
| Dependencias | Nao | Tarefas que devem ser concluidas antes |

3. Clique em **"Criar"**

### Tipos de tarefa

| Tipo | Descricao |
|------|-----------|
| **Paralela** | Pode ser trabalhada simultaneamente com outras |
| **Nao Paralela** | So pode ser trabalhada quando nao houver outra em andamento |
| **Fixa** | Tarefa com horario fixo, prioritaria no agendamento |

### Dependencias
- Selecione tarefas que devem ser concluidas ANTES desta poder comecar
- O sistema valida dependencias ao alterar status

---

## Informacoes por Tarefa

### Identificador visual
- Formato: **P{projeto}.E{etapa}.T{tarefa}** (ex: P5.E2.T1)

### Colunas da tabela

| Coluna | Descricao |
|--------|-----------|
| ID | Identificador hierarquico |
| Titulo | Nome da tarefa |
| Status | Badge colorido com status atual |
| Prioridade | Badge com nivel de prioridade |
| Atribuidos | Nomes dos usuarios atribuidos |
| Horas | Horas registradas / horas estimadas |
| Progresso | Percentual de conclusao |

---

## Acoes Rapidas

Cada tarefa possui botoes de acao:

### Ver detalhes
- Clique no titulo ou no botao de visualizar
- Navega para a tela de **Detalhe da Tarefa**

### Alterar status
- Botao para abrir modal de mudanca de status
- Disponivel para Supervisor e Admin

### Atribuir usuarios
- Botao para abrir modal de atribuicao
- Disponivel para Supervisor e Admin

---

## Paginacao

Quando ha muitas tarefas, a lista e paginada:

```
[< Anterior]  1  2  3  [Proximo >]
Total: 25 tarefas
```

- Navegue entre paginas usando os botoes
- Total de tarefas e exibido abaixo
