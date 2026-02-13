# Manual - Tela de Etapas do Projeto

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Todos os usuarios autenticados

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Navegacao e Breadcrumb](#navegacao-e-breadcrumb)
3. [Lista de Etapas](#lista-de-etapas)
4. [Filtros e Ordenacao](#filtros-e-ordenacao)
5. [Criar Nova Etapa](#criar-nova-etapa)
6. [Card da Etapa](#card-da-etapa)
7. [Navegacao para Tarefas](#navegacao-para-tarefas)

---

## Visao Geral

As Etapas sao subdivisoes de um projeto. Cada projeto pode ter multiplas etapas, e cada etapa contem tarefas. As etapas organizam o fluxo de trabalho do projeto.

```
Projeto
  |
  +-- Etapa 1: Analise (Sequencial)
  |     +-- Tarefa 1.1
  |     +-- Tarefa 1.2
  |
  +-- Etapa 2: Desenvolvimento (Paralela)
  |     +-- Tarefa 2.1
  |     +-- Tarefa 2.2
  |
  +-- Etapa 3: Testes (Sequencial)
        +-- Tarefa 3.1
```

### Tipos de etapa

| Tipo | Descricao |
|------|-----------|
| **Paralela** | Pode ser trabalhada simultaneamente com outras etapas |
| **Sequencial** | Depende da conclusao de etapas anteriores |

---

## Navegacao e Breadcrumb

No topo da tela, um breadcrumb mostra o caminho:

```
Projetos  /  E-commerce Platform
```

- Clique em **"Projetos"** para voltar a lista de projetos
- O nome do projeto aparece ao lado

Abaixo do breadcrumb:
- Nome do projeto em destaque
- Descricao do projeto

---

## Lista de Etapas

As etapas sao exibidas em cards no formato grid:

```
+-------------------------------+  +-------------------------------+
|  Analise                      |  |  Desenvolvimento              |
|  P5.E1                        |  |  P5.E2                        |
|                               |  |                               |
|  Levantamento de requisitos   |  |  Implementacao do backend     |
|  e analise tecnica            |  |  e frontend do sistema        |
|                               |  |                               |
|  Horas estimadas: 40h         |  |  Horas estimadas: 120h        |
|                               |  |                               |
|  [Ver Tarefas]                |  |  [Ver Tarefas]                |
+-------------------------------+  +-------------------------------+
```

---

## Filtros e Ordenacao

### Barra de busca
- Busca por nome ou descricao da etapa

### Filtro por tipo
| Opcao | Descricao |
|-------|-----------|
| Todos | Todas as etapas |
| Paralelas | Apenas etapas paralelas |
| Sequenciais | Apenas etapas sequenciais |

### Filtro por tarefas
| Opcao | Descricao |
|-------|-----------|
| Todos | Todas as etapas |
| Com Tarefas | Etapas que ja possuem tarefas |
| Sem Tarefas | Etapas vazias |

### Filtro por horas
| Opcao | Descricao |
|-------|-----------|
| Todos | Todas |
| 0-10h | Etapas com ate 10h estimadas |
| 10-50h | Etapas de 10 a 50h |
| 50h+ | Etapas com mais de 50h |

### Ordenacao
- **Ordem:** Ordem padrao (por ID)
- **Nome:** Alfabetica
- **Horas estimadas:** Por total de horas

---

## Criar Nova Etapa

**Acesso:** Apenas Supervisor e Admin

### Como criar

1. Clique no botao **"Nova Etapa"** (canto superior)
   - Se nao existem etapas, clique em **"Criar Primeira Etapa"**
2. Preencha o formulario:

| Campo | Obrigatorio | Descricao |
|-------|:-----------:|-----------|
| Nome da etapa | Sim | Nome identificador da etapa |
| Descricao | Nao | Detalhes sobre a etapa |
| Tipo | Sim | Paralela ou Sequencial |

3. Clique em **"Criar"**

---

## Card da Etapa

### Identificador visual
- Formato: **P{projetoId}.E{etapaId}** (ex: P5.E2)

### Informacoes exibidas
- Nome da etapa
- Descricao (ate 2 linhas)
- Horas estimadas (soma das tarefas)
- Tipo (paralela/sequencial)

### Botao de acao
- **"Ver Tarefas"** - navega para a lista de tarefas da etapa

---

## Navegacao para Tarefas

1. Localize a etapa desejada
2. Clique em **"Ver Tarefas"**
3. Voce sera redirecionado para a lista de tarefas

A URL segue o padrao: `/projects/{projetoId}/stages/{etapaId}/tasks`

### Para usuarios comuns
- Caso nao haja etapas ou tarefas atribuidas, uma mensagem informativa e exibida
- Usuarios comuns nao podem criar etapas
