# Manual - Tela de Kanban

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Supervisor e Administrador

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Colunas do Kanban](#colunas-do-kanban)
3. [Cards dos Projetos](#cards-dos-projetos)
4. [Drag and Drop](#drag-and-drop)
5. [Modos de Visualizacao](#modos-de-visualizacao)

---

## Visao Geral

O Kanban oferece uma visao visual e interativa do andamento de todos os projetos. Os projetos sao organizados em colunas por status, e voce pode arrastá-los entre colunas para atualizar o status.

```
+-------------+------------------+------------------+-------------+-------------+
|   NOVO      | EM DESENVOLVIMENTO| ANALISE TECNICA |  CONCLUIDO  |   REFACA    |
+-------------+------------------+------------------+-------------+-------------+
|             |                  |                  |             |             |
| [Projeto A] | [Projeto C]      | [Projeto E]      | [Projeto G] | [Projeto H] |
|             |                  |                  |             |             |
| [Projeto B] | [Projeto D]      | [Projeto F]      |             |             |
|             |                  |                  |             |             |
+-------------+------------------+------------------+-------------+-------------+
```

---

## Colunas do Kanban

O Kanban possui 5 colunas, cada uma representando um status de projeto:

| Coluna | Cor | Descricao |
|--------|-----|-----------|
| **Novo** | Azul | Projetos recem-criados, ainda nao iniciados |
| **Em Desenvolvimento** | Amarelo | Projetos em andamento |
| **Analise Tecnica** | Roxo | Projetos em revisao/analise |
| **Concluido** | Verde | Projetos finalizados |
| **Refaca** | Vermelho | Projetos que precisam de correcao |

### Contagem
Cada coluna exibe o numero de projetos nela (ex: "Em Desenvolvimento (3)")

---

## Cards dos Projetos

Cada card de projeto no Kanban mostra:

```
+--------------------------------+
|  E-commerce Platform           |
|  Supervisor: Joao Silva        |
|                                |
|  ████████████░░░░  75%         |
|  Tarefas: 15/20               |
|  Refaca: 2                     |
+--------------------------------+
```

### Informacoes do card

| Campo | Descricao |
|-------|-----------|
| Nome | Nome do projeto |
| Supervisor | Responsavel pelo projeto |
| Barra de progresso | Percentual visual de conclusao |
| Tarefas | Concluidas / Total |
| Refaca | Numero de tarefas em refaca (se houver) |

### Indicadores visuais
- Barra de progresso colorida conforme avanço
- Contagem de refaca em destaque quando > 0

---

## Drag and Drop

### Como mover um projeto

1. Clique e segure no card do projeto
2. Arraste ate a coluna desejada
3. Solte o card na nova coluna
4. O status do projeto e atualizado automaticamente

### Fluxo de movimentacao

```
Novo  -->  Em Desenvolvimento  -->  Analise Tecnica  -->  Concluido
                  ^                        |
                  |                        v
                  +------ Refaca <---------+
```

### Regras
- Qualquer projeto pode ser movido para qualquer coluna
- A mudanca de status e salva automaticamente no banco de dados
- O card se posiciona na nova coluna imediatamente

---

## Modos de Visualizacao

### Modo Completo (padrao)
- Cards maiores com todas as informacoes
- Barra de progresso visivel
- Ideal para telas grandes

### Modo Compacto
- Cards menores e mais condensados
- Apenas nome e informacoes essenciais
- Ideal para muitos projetos ou telas menores

### Como alternar
- Use o botao de alternancia **Completo/Compacto** no topo da tela

---

## Dicas de Uso

### Para supervisores
1. Use o Kanban para ter uma **visao geral rapida** de todos os projetos
2. Arraste projetos entre colunas para **atualizar status rapidamente**
3. Fique atento a coluna **Refaca** — indica retrabalho
4. A barra de progresso ajuda a identificar projetos **quase concluidos**

### Interpretacao rapida
- **Muitos cards em "Novo":** Projetos acumulados sem iniciar
- **Muitos cards em "Refaca":** Problema de qualidade nas entregas
- **Coluna "Concluido" crescendo:** Boa produtividade da equipe
