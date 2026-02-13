# Manual - Tela de Projetos

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Todos os usuarios autenticados

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Lista de Projetos](#lista-de-projetos)
3. [Filtros e Busca](#filtros-e-busca)
4. [Criar Novo Projeto](#criar-novo-projeto)
5. [Card do Projeto](#card-do-projeto)
6. [Alterar Status do Projeto](#alterar-status-do-projeto)
7. [Navegacao para Etapas](#navegacao-para-etapas)

---

## Visao Geral

A tela de Projetos e o ponto central de organizacao do sistema. Aqui voce visualiza todos os projetos, pode filtrar, buscar e navegar para as etapas de cada um.

- **Usuarios comuns** veem apenas projetos em que possuem tarefas atribuidas
- **Supervisores e Admins** veem todos os projetos do sistema

---

## Lista de Projetos

Os projetos sao exibidos em formato de **cards** organizados em grid:

```
+-------------------------------+  +-------------------------------+
|  E-commerce Platform          |  |  App Mobile                   |
|  [ATIVO]                      |  |  [EM ESPERA]                  |
|                               |  |                               |
|  Plataforma de vendas online  |  |  Aplicativo para clientes     |
|  com integracao de pagamento  |  |  mobile com notificacoes      |
|                               |  |                               |
|  Inicio: 01/01/2026           |  |  Inicio: 15/02/2026           |
|  Prazo:  30/06/2026           |  |  Prazo:  31/08/2026           |
|                               |  |                               |
|  [Ver Etapas ->]              |  |  [Ver Etapas ->]              |
+-------------------------------+  +-------------------------------+
```

---

## Filtros e Busca

### Barra de busca
- Busca por **nome** ou **descricao** do projeto
- Busca em tempo real conforme voce digita

### Filtro por status
Botoes de alternancia para filtrar projetos:

| Filtro | Descricao |
|--------|-----------|
| Todos | Exibe todos os projetos |
| Ativos | Apenas projetos em andamento |
| Concluidos | Projetos finalizados |
| Em Espera | Projetos pausados |
| Cancelados | Projetos cancelados |

### Filtro por supervisor
- Dropdown para selecionar um supervisor especifico
- Mostra apenas projetos supervisionados por aquela pessoa

### Filtro por data
- **Data inicio:** filtra projetos que comecaram a partir desta data
- **Data fim:** filtra projetos com prazo ate esta data
- Util para encontrar projetos em determinado periodo

---

## Criar Novo Projeto

**Acesso:** Apenas Supervisor e Admin

### Como criar

1. Clique no botao **"Novo Projeto"** no canto superior direito
2. Preencha o formulario:

| Campo | Obrigatorio | Descricao |
|-------|:-----------:|-----------|
| Nome do projeto | Sim | Nome identificador do projeto |
| Descricao | Nao | Descricao detalhada do projeto |
| Data de inicio | Nao | Quando o projeto comeca |
| Data de prazo | Sim | Prazo final do projeto |
| Supervisor | Sim | Responsavel pelo projeto |

3. Clique em **"Criar"**

### Regras
- O nome deve ser unico
- O prazo e obrigatorio para acompanhamento de risco
- O supervisor sera o responsavel principal do projeto

---

## Card do Projeto

Cada card exibe as seguintes informacoes:

### Identificador visual
- Formato: **P{id}** (ex: P5, P12)
- Permite referencia rapida ao projeto

### Status (badge clicavel)
- Clicando no badge de status, abre o modal de alteracao
- Cores por status:

| Status | Cor |
|--------|-----|
| Ativo | Verde |
| Concluido | Azul |
| Em Espera | Amarelo |
| Cancelado | Vermelho |

### Informacoes do card
- Nome do projeto
- Descricao (ate 2 linhas, truncada)
- Data de inicio
- Data de prazo
- Data de criacao

### Botao de acao
- **"Ver Etapas"** - navega para as etapas do projeto

---

## Alterar Status do Projeto

**Acesso:** Supervisor e Admin

### Como alterar

1. Clique no **badge de status** do projeto (ex: [ATIVO])
2. No modal que abre, selecione o novo status
3. Clique em **"Atualizar"**

### Status disponiveis
- Ativo
- Concluido
- Em Espera
- Cancelado

---

## Navegacao para Etapas

Para acessar as etapas de um projeto:

1. Localize o projeto desejado na lista
2. Clique em **"Ver Etapas"** no card
3. Voce sera redirecionado para a tela de Etapas do projeto

A URL segue o padrao: `/projects/{id}/stages`
