# Manual do Sistema de Gestao de Projetos

**Versao:** 2.0
**Data:** 12/02/2026
**Sistema:** Gestao de Projetos de Engenharia

---

## Sumario

- [Parte I - Visao Geral do Sistema](#parte-i---visao-geral-do-sistema)
  - [Perfis de Acesso](#perfis-de-acesso)
  - [Navegacao Principal](#navegacao-principal)
  - [Fluxo de Navegacao](#fluxo-de-navegacao)
- [Parte II - Telas do Sistema](#parte-ii---telas-do-sistema)
  - [Capitulo 1: Login e Cadastro](#capitulo-1-login-e-cadastro)
  - [Capitulo 2: Dashboard](#capitulo-2-dashboard)
  - [Capitulo 3: Projetos](#capitulo-3-projetos)
  - [Capitulo 4: Etapas do Projeto](#capitulo-4-etapas-do-projeto)
  - [Capitulo 5: Lista de Tarefas](#capitulo-5-lista-de-tarefas)
  - [Capitulo 6: Detalhe da Tarefa](#capitulo-6-detalhe-da-tarefa)
  - [Capitulo 7: Kanban](#capitulo-7-kanban)
  - [Capitulo 8: Calendario](#capitulo-8-calendario)
  - [Capitulo 9: Monitoramento](#capitulo-9-monitoramento)
  - [Capitulo 10: Configuracoes](#capitulo-10-configuracoes)
- [Parte III - Apendices](#parte-iii---apendices)
  - [Apendice A: Regras de Negocio das Tarefas](#apendice-a-regras-de-negocio-das-tarefas)
  - [Apendice B: Guia do Grafico de Evolucao de Horas](#apendice-b-guia-do-grafico-de-evolucao-de-horas)
  - [Apendice C: Guia Completo da Tela de Tarefas](#apendice-c-guia-completo-da-tela-de-tarefas)

---

# Parte I - Visao Geral do Sistema

## Mapa de Telas

| # | Tela | Acesso |
|---|------|--------|
| 1 | Login e Cadastro | Todos |
| 2 | Dashboard | Supervisor, Admin |
| 3 | Projetos | Todos |
| 4 | Etapas do Projeto | Todos |
| 5 | Tarefas | Todos |
| 6 | Detalhe da Tarefa | Todos |
| 7 | Kanban | Supervisor, Admin |
| 8 | Calendario | Todos |
| 9 | Monitoramento | Admin |
| 10 | Configuracoes | Admin |

---

## Perfis de Acesso

O sistema possui 3 perfis de usuario com diferentes niveis de acesso:

### Usuario
- Visualiza projetos em que esta envolvido
- Acessa tarefas atribuidas a ele
- Controla tempo (Play/Pause/Stop)
- Gerencia seu calendario pessoal

### Supervisor
- Tudo do Usuario, mais:
- Acessa Dashboard com metricas da equipe
- Cria e gerencia projetos, etapas e tarefas
- Visualiza Kanban de projetos
- Visualiza calendario de outros usuarios (somente leitura)

### Administrador
- Tudo do Supervisor, mais:
- Acessa tela de Monitoramento com analiticas avancadas
- Gerencia usuarios (roles, senha, ativar/desativar)
- Edita calendario de qualquer usuario
- Acesso total ao sistema

---

## Navegacao Principal

A barra de navegacao superior contem:

```
+------------+----------+-----------+-------------+----------------+-----------------+
| Dashboard  |  Kanban  | Projetos  | Calendario  | Monitoramento  |  Configuracoes  |
+------------+----------+-----------+-------------+----------------+-----------------+
```

No canto direito: nome do usuario, perfil e botao de sair.

---

## Fluxo de Navegacao

```
Projetos (lista)
  |
  +---> Etapas do Projeto
          |
          +---> Lista de Tarefas
                  |
                  +---> Detalhe da Tarefa
                          |
                          +---> Time Tracking
                          +---> Historico de Status
                          +---> Grafico de Progresso
```

O Calendario e o Kanban sao telas independentes acessiveis pelo menu principal.

---

# Parte II - Telas do Sistema

---

# Capitulo 1: Login e Cadastro

**Acesso:** Todos

---

## 1.1 Visao Geral

A tela de Login e a porta de entrada do sistema. Aqui o usuario pode:

- Fazer login com email e senha
- Criar uma nova conta (cadastro)
- Alternar entre os modos Login e Cadastro

---

## 1.2 Login

### Como acessar

1. Abra o sistema no navegador
2. A tela de login sera exibida automaticamente
3. Preencha os campos:
   - **Email:** seu email cadastrado
   - **Senha:** sua senha

4. Clique em **"Entrar"**

### Apos o login

- **Supervisor/Admin:** sera redirecionado para o **Dashboard**
- **Usuario:** sera redirecionado para a lista de **Projetos**

### Estrutura da tela

```
+------------------------------------------+
|                                          |
|        GESTAO DE PROJETOS                |
|                                          |
|   +----------------------------------+   |
|   |  Email                           |   |
|   +----------------------------------+   |
|   |  Senha                           |   |
|   +----------------------------------+   |
|                                          |
|   [ ========= ENTRAR ========= ]        |
|                                          |
|   Nao tem conta? Cadastre-se             |
|                                          |
+------------------------------------------+
```

---

## 1.3 Cadastro de Novo Usuario

### Como se cadastrar

1. Na tela de login, clique em **"Cadastre-se"**
2. Preencha os campos:
   - **Nome completo:** seu nome
   - **Email:** email valido
   - **Senha:** minimo 6 caracteres

3. Clique em **"Cadastrar"**

### Apos o cadastro

- A conta e criada com o perfil **Usuario** (padrao)
- O usuario ja e logado automaticamente
- Um administrador pode alterar o perfil depois (Configuracoes)

---

## 1.4 Regras e Validacoes

| Campo | Regra |
|-------|-------|
| Email | Deve ser um email valido e unico no sistema |
| Senha | Minimo de 6 caracteres |
| Nome | Obrigatorio no cadastro |

### Mensagens de erro comuns

| Mensagem | Causa |
|----------|-------|
| "Credenciais invalidas" | Email ou senha incorretos |
| "Email ja cadastrado" | Ja existe uma conta com esse email |
| "Preencha todos os campos" | Campos obrigatorios vazios |

---

## 1.5 Problemas Comuns

### Esqueci minha senha
- Um administrador pode redefinir sua senha na tela de **Configuracoes**
- Solicite ao admin do sistema

### Minha conta esta inativa
- Um administrador pode ter desativado sua conta
- Entre em contato com o admin para reativar

### Nao consigo me cadastrar
- Verifique se o email ja esta em uso
- Verifique se a senha tem pelo menos 6 caracteres

---

# Capitulo 2: Dashboard

**Acesso:** Supervisor e Administrador

---

## 2.1 Visao Geral

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

## 2.2 Metricas Principais

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

## 2.3 Carga da Equipe

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

## 2.4 Tarefas em Risco

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

## 2.5 Estatisticas de Tempo (Hoje)

Resumo do time tracking do dia atual:

- **Horas totais:** total de horas registradas hoje por toda a equipe
- **Sessoes hoje:** quantas sessoes de trabalho foram realizadas
- **Sessoes ativas/pausadas:** quantas estao em andamento agora
- **Usuarios ativos:** quantos membros estao trabalhando agora

---

## 2.6 Distribuicao de Status

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

## 2.7 Top Tarefas por Horas

Ranking das 5 tarefas com mais horas trabalhadas:

```
1. Tarefa X - Projeto Y     12.5h   (85%)
2. Tarefa Z - Projeto W      9.2h   (60%)
3. ...
```

Util para identificar onde a equipe esta concentrando esforco.

---

## 2.8 Tarefas Recentes

Lista das tarefas mais recentemente criadas ou atualizadas:

- Nome da tarefa
- Projeto vinculado
- Status atual (badge colorido)

Permite acompanhar a atividade recente do sistema.

---

# Capitulo 3: Projetos

**Acesso:** Todos os usuarios autenticados

---

## 3.1 Visao Geral

A tela de Projetos e o ponto central de organizacao do sistema. Aqui voce visualiza todos os projetos, pode filtrar, buscar e navegar para as etapas de cada um.

- **Usuarios comuns** veem apenas projetos em que possuem tarefas atribuidas
- **Supervisores e Admins** veem todos os projetos do sistema

---

## 3.2 Lista de Projetos

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

## 3.3 Filtros e Busca

### Barra de busca
- Busca por **nome** ou **descricao** do projeto
- Busca em tempo real conforme voce digita

### Filtro por status

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

## 3.4 Criar Novo Projeto

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

## 3.5 Card do Projeto

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

## 3.6 Alterar Status do Projeto

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

## 3.7 Navegacao para Etapas

Para acessar as etapas de um projeto:

1. Localize o projeto desejado na lista
2. Clique em **"Ver Etapas"** no card
3. Voce sera redirecionado para a tela de Etapas do projeto

A URL segue o padrao: `/projects/{id}/stages`

---

# Capitulo 4: Etapas do Projeto

**Acesso:** Todos os usuarios autenticados

---

## 4.1 Visao Geral

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

## 4.2 Navegacao e Breadcrumb

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

## 4.3 Lista de Etapas

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

## 4.4 Filtros e Ordenacao

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

## 4.5 Criar Nova Etapa

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

## 4.6 Card da Etapa

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

## 4.7 Navegacao para Tarefas

1. Localize a etapa desejada
2. Clique em **"Ver Tarefas"**
3. Voce sera redirecionado para a lista de tarefas

A URL segue o padrao: `/projects/{projetoId}/stages/{etapaId}/tasks`

### Para usuarios comuns
- Caso nao haja etapas ou tarefas atribuidas, uma mensagem informativa e exibida
- Usuarios comuns nao podem criar etapas

---

# Capitulo 5: Lista de Tarefas

**Acesso:** Todos os usuarios autenticados

---

## 5.1 Visao Geral

A lista de tarefas exibe todas as tarefas de uma etapa especifica do projeto. Aqui o usuario pode ver o status, prioridade, progresso e acessar cada tarefa para mais detalhes.

- **Usuarios comuns** veem apenas tarefas atribuidas a eles
- **Supervisores e Admins** veem todas as tarefas da etapa

---

## 5.2 Navegacao e Breadcrumb

```
Projetos  /  E-commerce Platform  /  Desenvolvimento  /  Tarefas
```

Cada nivel e clicavel para navegar de volta.

---

## 5.3 Lista de Tarefas

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

## 5.4 Filtros e Ordenacao

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

## 5.5 Criar Nova Tarefa

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

## 5.6 Informacoes por Tarefa

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

## 5.7 Acoes Rapidas

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

## 5.8 Paginacao

Quando ha muitas tarefas, a lista e paginada:

```
[< Anterior]  1  2  3  [Proximo >]
Total: 25 tarefas
```

- Navegue entre paginas usando os botoes
- Total de tarefas e exibido abaixo

---

# Capitulo 6: Detalhe da Tarefa

**Acesso:** Todos os usuarios autenticados (filtrado por atribuicao)

---

## 6.1 Visao Geral

A tela de Detalhe da Tarefa e a mais completa do sistema. E o coracao da gestao de tempo. Aqui voce:

- Visualiza todas as informacoes da tarefa
- Controla o tempo de trabalho (Play/Pause/Stop)
- Acompanha o historico de alteracoes e sessoes
- Gerencia atribuicoes de usuarios
- Monitora progresso acumulativo
- Analisa graficos de evolucao de horas

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
|  CARDS DE METRICAS                                               |
|  [Horas Estimadas: 40h] [Horas Dedicadas: 7h] [Progresso: 35%]  |
+------------------------------------------------------------------+
|  ATRIBUICOES             |  SESSOES FINALIZADAS                   |
|  - Joao (4h/dia) [Edit]  |  12/02 - 2h30 - "Corrigir bug X"      |
|  - Maria (3h/dia) [Edit] |  11/02 - 3h00 - "API endpoints"        |
+------------------------------------------------------------------+
|  HISTORICO DE STATUS                                              |
|  12/02 - Novo -> Em Desenvolvimento (por Joao)                   |
|  10/02 - Criada (por Admin)                                       |
+------------------------------------------------------------------+
```

---

## 6.2 Cabecalho da Tarefa

### Elementos do cabecalho
- **Botao Voltar:** Retorna a lista de tarefas
- **ID:** Identificador hierarquico (P5.E2.T1)
- **Titulo:** Nome da tarefa
- **Status:** Badge colorido com status atual
- **Prioridade:** Badge com nivel de prioridade

### Badge de Risco

O cabecalho exibe automaticamente um indicador visual de prazo:

| Badge | Cor | Condicao |
|-------|-----|----------|
| **NO PRAZO** | Verde | Tudo dentro do cronograma |
| **ATENCAO** | Amarelo | Prazo proximo (7 dias ou menos) |
| **CRITICO** | Laranja | Muito proximo do vencimento (3 dias ou menos) |
| **ATRASADO** | Vermelho | Prazo ja passou |

---

## 6.3 Informacoes da Tarefa

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

## 6.4 Cards de Metricas

### Card 1: Horas Estimadas

```
+------------------------------+
| Horas Estimadas              |
| 40h                          |
| Alocado para projeto         |
+------------------------------+
```

- Total de horas planejadas para a tarefa
- Definido durante a criacao da tarefa
- Serve como meta de trabalho

### Card 2: Horas Dedicadas (Interativo — clique para detalhes)

```
+------------------------------+
| Horas Dedicadas              |
| 7.00h                        |
| 3 usuarios comprometidos     |
| (i) Clique para ver detalhes |
+------------------------------+
```

**O que e:** Soma de todas as horas que os usuarios se comprometeram a trabalhar diariamente nesta tarefa. E diferente da sugestao do supervisor.

**Ao clicar, abre modal detalhado:**

```
+---------------------------------------------+
|  HORAS DEDICADAS                             |
|  "Criar API de autenticacao"                 |
+---------------------------------------------+
|                                              |
|  Sugestao do Supervisor: 8.00h (ambar)       |
|  Alocado pelos Usuarios: 7.00h (azul)        |
|                                              |
|  [===========================-] 87%          |
|                                              |
|  Status: 1.00h abaixo da sugestao (verde)    |
|                                              |
+---------------------------------------------+
|  Usuarios:                                   |
|  +-------------------+ +-------------------+ |
|  | Joao Silva        | | Maria Santos      | |
|  | 4.00h/dia         | | 2.00h/dia         | |
|  +-------------------+ +-------------------+ |
|  +-------------------+                       |
|  | Pedro Costa       |                       |
|  | 1.00h/dia         |                       |
|  +-------------------+                       |
+---------------------------------------------+
|  Resumo:                                     |
|  Total Sugerido: 8.00h                       |
|  Total Alocado:  7.00h                       |
+---------------------------------------------+
|                               [Fechar]       |
+---------------------------------------------+
```

**Cores da barra de progresso:**
- Verde (0-75%) — Sub-alocado
- Amarelo (75-90%) — Proximo do sugerido
- Laranja (90-100%) — Quase cheio
- Vermelho (>100%) — Acima do sugerido

**Cores do status badge:**
- Verde (acima) — Usuarios se comprometeram com MAIS que a sugestao
- Laranja (abaixo) — Usuarios se comprometeram com MENOS que a sugestao
- Azul (igual) — Compromisso e igual a sugestao

**Por que isso importa?**
- Se esta ABAIXO, a tarefa pode demorar mais que o planejado
- Se esta ACIMA, a tarefa pode ser concluida antes
- Ajuda o supervisor a reajustar as horas se necessario

**Exemplo pratico:**

```
Supervisor sugeriu: 4h/dia
Usuario A se comprometeu: 3h/dia
Usuario B se comprometeu: 2h/dia
Total: 5h/dia
Diferenca: +1h (acima da sugestao)
```

### Card 3: Progresso (Acumulativo — clique para grafico)

```
+------------------------------+
| Progresso                    |
| 35%                          |
| [===========-----------]     |
| 14h de 40h trabalhadas       |
+------------------------------+
```

- Calcula: (Horas Registradas / Horas Estimadas) x 100
- Baseado em TODAS as sessoes **finalizadas** (status = stopped) desde o inicio
- **IMPORTANTE: Progresso e acumulativo e NUNCA zera ao trocar de dia**
- Atualiza automaticamente ao finalizar sessoes

**Exemplo de acumulo:**

```
Dia 1: 4 horas de trabalho  -> 10% de progresso (4h/40h)
Dia 2: 6 horas de trabalho  -> 25% de progresso (10h acumuladas)
Dia 3: 2 horas de trabalho  -> 30% de progresso (12h acumuladas)

Progresso NUNCA volta para 10% ou zera
Sempre mostra o total desde o inicio da tarefa
```

**Ao clicar, abre o Grafico de Evolucao de Horas** (ver secao 6.11).

---

## 6.5 Datas e Prazos

### Data de Conclusao
- Prazo definido para entrega da tarefa
- Afeta o badge de risco no header
- Mostra a data em formato brasileiro (dd/mm/yyyy)

### Conclusao Estimada (Dinamica)

```
Formula: Hoje + (Horas Estimadas / Total de Horas Dedicadas) dias

Exemplo:
  Tarefa: 40h estimadas
  Joao 4h/dia + Maria 3h/dia = 7h/dia
  Conclusao = Hoje + (40 / 7) = Hoje + ~6 dias
```

- Calculo automatico e dinamico baseado nas horas comprometidas
- **Recalcula automaticamente** quando alguem edita suas horas/dia

**Exemplo de recalculo dinamico:**

```
Dia 1: Maria = 3h/dia, Joao = 2h/dia -> Total = 5h/dia
       Estimado: Hoje + (40h / 5h) = Hoje + 8 dias

Dia 2: Maria reduz para 2h/dia -> Total = 4h/dia
       Recalcula: Hoje + (40h / 4h) = Hoje + 10 dias (aumento!)

Dia 3: Pedro entra com 3h/dia -> Total = 7h/dia
       Recalcula: Hoje + (40h / 7h) = Hoje + 6 dias (volta!)
```

---

## 6.6 Atribuicoes

### Lista de usuarios atribuidos
Para cada usuario atribuido, exibe:
- Nome completo
- Email
- Horas diarias alocadas
- Comparacao com sugestao do supervisor
- Botoes de editar/remover (Supervisor/Admin)

```
Joao Silva
joao@email.com
3h/dia (sugestao: 4h)  [Editar] [Remover]

Maria Santos
maria@email.com
2h/dia (sugestao: 4h)  [Editar] [Remover]
```

### Atribuir novos usuarios

**Acesso:** Supervisor e Admin

1. Clique em **"+ Atribuir Usuario"**
2. No modal:
   - Busque o usuario desejado
   - Marque o checkbox ao lado do nome
   - Defina as **horas diarias** para aquele usuario (campo de input 0-8)
   - O sistema sugere horas com base na tarefa
3. Clique em **"Salvar Atribuicoes"**

**Validacoes rigorosas:**
- Cada usuario tem limite de 8h/dia somando TODAS as suas tarefas
- Se o usuario ja tem 5h/dia em outras tarefas e voce tenta 4h, o sistema rejeita (5+4=9>8)
- Nao pode ter usuarios duplicados

**Exemplo de validacao:**

```
Voce tenta atribuir Joao com 4h/dia
Joao ja tem alocado em outras tarefas: 5.5h/dia

   Horas comprometidas:    5.50h
 + Voce esta tentando:   + 4.00h
   Total seria:            9.50h (EXCEDE LIMITE)

   Limite diario: 8.00h
   Sugestao: Voce pode atribuir ate 2.50h
```

### Editar Compromisso de Horas

Cada usuario pode ter suas horas editadas inline:

1. Clique no botao **"Editar"** ao lado do usuario
2. Campo de input aparece com o valor atual
3. Mude para a nova quantidade de horas
4. Clique **"Salvar"** para confirmar
5. Sistema valida se nao excede 8h/dia total

**Validacoes ao editar:**
- Minimo: 0h/dia
- Maximo: 8h/dia (limite individual)
- Nao pode exceder 8h somando todas as tarefas do usuario

### Remover Usuario
- Clique no botao **"Remover"** ao lado do usuario
- Confirmacao antes de remover
- Remove apenas a atribuicao, nao o usuario do sistema

### Regras de atribuicao
- O sistema valida dependencias: se a tarefa depende de outra, alerta o usuario
- Mostra dependencias bloqueantes no modal
- O total de horas diarias de um usuario nao deve exceder 8h
- Atribuicao = compromisso, nao trabalho real

---

## 6.7 Time Tracking (Rastreamento de Tempo)

### O que e uma Sessao?

Uma **sessao de trabalho** e um periodo continuo ou interrompido onde voce trabalha em uma tarefa. Cada sessao registra:

- Inicio: Quando voce comecou a trabalhar
- Pausas: Quantas vezes pausou e por quanto tempo
- Fim: Quando finalizou o trabalho
- Notas: Observacoes sobre o trabalho realizado

### Estados de uma Sessao

```
Em andamento   -> Trabalho esta acontecendo agora (running)
Pausada        -> Trabalho pausado temporariamente (paused)
Finalizada     -> Sessao concluida e salva (stopped)
```

### Controles Detalhados

#### 1. Iniciar uma Sessao (PLAY)

```
[PLAY] -> Clique para comecar a rastrear tempo
```

**O que acontece:**
- Cronometro inicia contando em tempo real
- Estado muda para "Em andamento"
- Voce pode adicionar notas opcionais
- Validacao automatica verifica o limite de 8h/dia

**Aviso:** Se voce ja trabalhou 8 horas no dia, o botao fica desabilitado.

#### 2. Pausar a Sessao (PAUSE)

```
[PAUSE] -> Clique para pausar temporariamente
```

**O que acontece:**
- Cronometro para de contar
- Contador de pausa comeca automaticamente
- Estado muda para "Pausada"
- Contadores separados: **Trabalhando** e **Pausado**
- Contagem de pausas aumenta

#### 3. Retomar a Sessao (RESUME)

```
[RESUME] -> Clique para continuar de onde parou
```

**O que acontece:**
- Cronometro continua do ponto onde parou (sem pular)
- Contador de pausa para
- Estado volta para "Em andamento"
- Nenhum tempo e perdido

#### 4. Finalizar a Sessao (STOP)

```
[STOP] -> Clique para encerrar e salvar
```

**O que acontece:**
- Cronometro para definitivamente
- Sessao e salva no banco de dados com precisao em segundos
- Estado muda para "Finalizada"
- Aparece no historico de sessoes
- Progresso da tarefa e recalculado

### Fluxo Completo

```
[Play] --> Trabalhando (cronometro rodando)
  |
  +--> [Pause] --> Pausado (contador de pausa rodando)
  |       |
  |       +--> [Resume] --> Trabalhando novamente
  |
  +--> [Stop] --> Sessao finalizada e registrada
```

### Exemplo Pratico

```
09:00 - Clico PLAY
        Sistema: "Sessao iniciada"
        Timer: [0:00]

10:15 - Preciso responder um email
        Clico PAUSE
        Timer trabalho: [1:15] (congelado)
        Timer pausa: [0:00] (comecou)

10:30 - Volto ao trabalho
        Clico RESUME
        Timer trabalho: [1:15] (continua...)
        Tempo pausado: 15 minutos

11:45 - Reuniao de equipe
        Clico PAUSE novamente
        Timer trabalho: [2:30] (congelado)
        Pausas: 2 vezes

12:00 - Voltei da reuniao
        Clico RESUME

13:00 - Terminei o periodo
        Clico STOP
        Total trabalhado: 3h 30m
        Total pausado: 30m
        Pausas: 2 vezes
```

### Precisao em Segundos

O sistema armazena o tempo com precisao em segundos (`duration_total_seconds`), nao apenas minutos. Isso garante registro preciso:

```
Trabalhou: 1h 5m 30s
Registrou: 1h 5m 30s (exato!)

Calculo: 3930 segundos -> 1.0917 horas
```

### Informacoes exibidas durante a sessao
- **Hora de inicio:** Quando a sessao comecou
- **Tempo decorrido:** Cronometro em tempo real (HH:MM:SS)
- **Campo de notas:** Descricao do que esta sendo feito
- **Tempo pausado:** Total de tempo em pausa
- **Numero de pausas:** Quantas vezes pausou

### Limite Diario de 8 Horas

O sistema tem um **limite automatico de 8 horas por dia**:

```
+-------------------------------------------+
|  Limite Diario: 8 horas                   |
+---------+---------------------------------+
|  0-5h   | Trabalhe a vontade (verde)      |
|  5-7h   | Cuidado - aviso (amarelo)       |
|  7-8h   | Proximo do limite (laranja)     |
|  8h+    | PARAR - desabilitado (vermelho) |
+---------+---------------------------------+
```

**Avisos progressivos:**

```
Aviso Amarelo:
  "Voce ja trabalhou 5 horas hoje"
  "Apenas 3 horas disponiveis"

Aviso Laranja:
  "Voce ja trabalhou 7 horas hoje"
  "Apenas 1 hora disponivel"
  "LIMITE PROXIMO!"

Bloqueio Vermelho:
  "Voce atingiu o limite de 8 horas/dia"
  "Nao e possivel iniciar nova sessao"
  Botao PLAY fica desabilitado
```

### Status do dia
- **Horas completadas hoje:** Total registrado no dia
- **Sessoes ativas:** Quantas sessoes estao rodando
- **Indicador de continuidade:** Se pode continuar trabalhando

---

## 6.8 Sessoes Finalizadas

Tabela com todas as sessoes de trabalho ja concluidas:

```
+------------+----------+----------------+----------+----------------------------+--------+
| Data       | Inicio   | Usuario        | Duracao  | Notas                      | Acoes  |
+------------+----------+----------------+----------+----------------------------+--------+
| 12/02/2026 | 09:00    | Joao Silva     | 2h30min  | Implementacao dos endpoints| [Excl] |
| 11/02/2026 | 14:00    | Maria Santos   | 3h00min  | Correcao de bugs           | [Excl] |
| 10/02/2026 | 10:30    | Joao Silva     | 1h45min  | Setup inicial              | [Excl] |
+------------+----------+----------------+----------+----------------------------+--------+
```

### Filtros do historico

Acima da tabela, uma secao de filtros avancados:

#### Filtro por Periodo

Botoes para selecionar o intervalo de sessoes:

```
[Todos] [Hoje] [Semana] [Mes] [Customizado]
```

- **Todos:** Mostra TODAS as sessoes desde o inicio da tarefa
- **Hoje:** Apenas sessoes de hoje
- **Semana:** Ultimos 7 dias
- **Mes:** Ultimos 30 dias
- **Customizado:** Range de datas que voce escolhe

**Se escolher "Customizado":**

```
+-----------------+-----------------+
| De: [01/01/26]  | Ate: [07/01/26] |
+-----------------+-----------------+
```

#### Filtro por Usuario

Dropdown para filtrar por um usuario especifico:

```
Usuario: +---------------------------+
         | Todos os usuarios         | v
         | Joao Silva                |
         | Maria Santos              |
         | Pedro Costa               |
         +---------------------------+
```

#### Combinacao de Filtros

Voce pode usar periodo + usuario simultaneamente:

```
Exemplo: Mostrar apenas sessoes da "Maria Santos" dos "Ultimos 7 dias"

[Semana] + Usuario: Maria Santos
-> Tabela mostra apenas trabalho da Maria nos ultimos 7 dias
```

**Titulo dinamico** muda para refletir os filtros ativos:
- "Historico de Sessoes - Semana (Filtrado por Maria Santos)"
- "Historico de Sessoes - Customizado (Filtrado por Joao Silva)"
- "Historico de Sessoes - Todos"

**IMPORTANTE:** O progresso NAO muda ao filtrar. Progresso usa TODAS as sessions stopped. Historico e apenas uma visao filtrada dos dados.

### Modal de Detalhes da Sessao

Ao clicar em qualquer linha da tabela, um modal abre com informacoes completas:

```
+---------------------------------------------+
|  DETALHES DA SESSAO       [Finalizada]       |
+---------------------------------------------+
|                                              |
|  TEMPO TOTAL                                 |
|  3h 45m 30s                                  |
|  Duracao total da sessao                     |
|                                              |
+---------------------------------------------+
|  +-----------------+ +-----------------+     |
|  | TEMPO DEDICADO  | | TEMPO EM PAUSA  |     |
|  | 3h 15m          | | 30m             |     |
|  | 3.25h           | | 0.50h           |     |
|  +-----------------+ +-----------------+     |
|                                              |
|  PAUSAS: 2 vezes                             |
|                                              |
+---------------------------------------------+
|  HORARIOS                                    |
|  Inicio: 07/01/2026 09:00:00                |
|  Fim:    07/01/2026 13:00:00                |
+---------------------------------------------+
|  NOTAS                                       |
|  "Implementacao concluida com sucesso"       |
+---------------------------------------------+
|                               [Fechar]       |
+---------------------------------------------+
```

### Excluir sessao
- Clique no botao de excluir na linha da sessao
- Confirmacao antes de excluir
- As horas serao subtraidas do total e o progresso recalculado

---

## 6.9 Historico de Status

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

## 6.10 Grafico de Progresso (Evolucao de Horas)

### Como acessar
- Clique no **card de Progresso** (que mostra a porcentagem)
- Um modal grande com o grafico sera exibido

### O que mostra

Um grafico interativo com duas linhas:

```
Horas (Y)
  ^
16|
14|      /\
12|    /  |  /\
10|  /    \| /  \------
 8|---------------------- (Meta/Sugestao - linha verde tracejada)
 6|
 4|
 2|
 0+---------------------> Dias
```

**Linha Azul (solida):** Horas reais trabalhadas por dia (varia dia a dia)
**Linha Verde (tracejada):** Horas sugeridas/estimadas (reta constante)

### Interpretacao rapida

```
Linha azul ACIMA da verde:
  -> Voce trabalhou MAIS que o previsto

Linha azul ABAIXO da verde:
  -> Voce trabalhou MENOS que o previsto

Linhas se cruzam:
  -> Variacao no ritmo de trabalho
```

### Estatisticas acima do grafico

4 cards com numeros importantes:

| Card | Cor | Descricao |
|------|-----|-----------|
| **Dias** | Azul | Quantidade de dias diferentes com registro de tempo |
| **Total** | Verde | Soma total de todas as horas trabalhadas no periodo |
| **Media** | Roxo | Horas por dia em media (Total / Dias) |
| **Maximo** | Laranja | Maior numero de horas em um unico dia |

### Filtros do grafico

#### Filtro de Periodo

| Periodo | O que mostra |
|---------|-------------|
| **Todos** | Historico completo desde o inicio |
| **Hoje** | Apenas o dia de hoje |
| **Semana** | Ultimos 7 dias |
| **Mes** | Ultimos 30 dias |
| **Customizado** | Data inicial ate data final |

#### Filtro de Usuario

- **Todos** — Soma total de horas de todos os usuarios
- **[Nome]** — Apenas horas daquele usuario especifico

### Tooltip (passe o mouse)

Passe o mouse sobre qualquer ponto azul do grafico:

```
+-------------------------------+
| Terca-feira, 14 de janeiro    |
+-------------------------------+
| Horas Reais: 6.50h            |
| Sugestao: 8.00h               |
|                               |
| Diferenca: -1.50h             |
|    73.1% da meta              |
|                               |
| Detalhamento por Usuario:     |
|    Joao Silva: 3.50h          |
|    Maria Santos: 3.00h        |
+-------------------------------+
```

---

## 6.11 Dicas de Uso

### Para usuarios
1. Sempre inicie o **Play** antes de trabalhar na tarefa
2. Use **Pause** para intervalos curtos (almoco, reuniao)
3. Use **Stop** no final do periodo de trabalho
4. Preencha as **notas** para registrar o que foi feito — "Implementei autenticacao" e melhor que "Trabalho"
5. Confira o **limite diario** antes de iniciar
6. Seja honesto com suas horas — defina compromisso realista
7. Clique no card **"Horas Dedicadas"** para ver se esta acima ou abaixo da sugestao
8. Use os **filtros de historico** para analises de periodos especificos

### Para supervisores
1. Acompanhe o **historico de sessoes** para entender o esforco da equipe
2. Use o **grafico de progresso** para avaliar estimativas
3. Verifique o **historico de status** para rastrear o fluxo
4. Ajuste as **horas diarias** dos membros conforme necessidade
5. Monitore a **conclusao estimada** — se esta mudando muito, ha instabilidade na equipe

### Nao faca
1. Deixar sessao em andamento quando sair
2. Notas genericas ("trabalho", "tarefa")
3. Iniciar nova sessao sem fechar a anterior
4. Ignorar avisos de limite de 8h
5. Aceitar compromisso de horas que nao consegue cumprir

### Mensagens de erro comuns

| Erro | Causa | Solucao |
|------|-------|---------|
| "Limite de 8 horas atingido" | Ja trabalhou 8h hoje | Finalize a sessao ou espere o proximo dia |
| "Nao e possivel atribuir usuario" | Ultrapassaria 8h/dia | Reduza horas ou atribua a outro usuario |
| "Sessao nao pode ser iniciada" | Validacao falhou | Verifique se tem horas disponiveis no dia |
| "Voce nao esta atribuido a esta tarefa" | Sem atribuicao | Peca ao supervisor para ser atribuido |
| "Voce tem uma sessao ativa em outra tarefa" | Sessao aberta | Finalize a outra sessao primeiro (STOP) |

---

# Capitulo 7: Kanban

**Acesso:** Supervisor e Administrador

---

## 7.1 Visao Geral

O Kanban oferece uma visao visual e interativa do andamento de todos os projetos. Os projetos sao organizados em colunas por status, e voce pode arrasta-los entre colunas para atualizar o status.

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

## 7.2 Colunas do Kanban

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

## 7.3 Cards dos Projetos

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
- Barra de progresso colorida conforme avanco
- Contagem de refaca em destaque quando > 0

---

## 7.4 Drag and Drop

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

## 7.5 Modos de Visualizacao

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

## 7.6 Dicas de Uso

### Para supervisores
1. Use o Kanban para ter uma **visao geral rapida** de todos os projetos
2. Arraste projetos entre colunas para **atualizar status rapidamente**
3. Fique atento a coluna **Refaca** — indica retrabalho
4. A barra de progresso ajuda a identificar projetos **quase concluidos**

### Interpretacao rapida
- **Muitos cards em "Novo":** Projetos acumulados sem iniciar
- **Muitos cards em "Refaca":** Problema de qualidade nas entregas
- **Coluna "Concluido" crescendo:** Boa produtividade da equipe

---

# Capitulo 8: Calendario

**Acesso:** Todos os usuarios autenticados

---

## 8.1 Visao Geral

O Calendario permite organizar o tempo de trabalho de forma visual, estilo Outlook. Cada usuario aloca blocos de tempo para suas tarefas, criando um planejamento diario/semanal.

Funcionalidades principais:
- Alocar blocos de tempo para tarefas
- Visualizar a organizacao do dia/semana/mes
- Arrastar tarefas da sidebar para o calendario
- Mover e redimensionar blocos existentes
- Criar alocacoes em lote (varios dias)
- Admin pode gerenciar calendario de qualquer usuario

---

## 8.2 Estrutura da Tela

```
+------------------------------------------------------------------+
|  Calendario    [Meu calendario v]  [Gerenciando]       [Atualizar]|
+------------------------------------------------------------------+
|                |                                                   |
|  SIDEBAR       |                CALENDARIO                         |
|                |                                                   |
|  Resumo do dia |   Seg    Ter    Qua    Qui    Sex                |
|  6.0h / 8h     |  07:00                                           |
|  ████████░░    |  08:00                                           |
|                |  09:00                                           |
|  Nao alocadas  |  10:00  [====] [====] [====] [====] [====]      |
|  (3)           |  11:00  [Task] [Task] [Task] [Task] [Task]      |
|                |  12:00  [====] [====] [====] [====] [====]      |
|  [Tarefa X]    |  13:00                                           |
|  [Tarefa Y]    |  14:00                                           |
|  [Tarefa Z]    |  15:00                                           |
|                |  16:00                                           |
|                |  17:00                                           |
|                |  18:00                                           |
|                |  19:00                                           |
+------------------------------------------------------------------+
```

---

## 8.3 Visualizacoes

### Dia
- Mostra um unico dia em detalhe
- Horarios de 07:00 as 19:00
- Blocos de 15 minutos
- Ideal para ver o planejamento detalhado do dia

### Semana (padrao)
- Mostra 7 dias (segunda a domingo)
- Cada dia e uma coluna
- Visao mais usada para planejamento semanal

### Mes
- Mostra o mes completo em formato de grade
- Cada dia mostra os eventos alocados
- Se houver muitos, mostra "+X mais"

### Navegacao
- **< e >** para avancar/retroceder
- **Hoje** para voltar ao dia atual
- Botoes **Dia / Semana / Mes** para trocar visualizacao

---

## 8.4 Barra Lateral (Sidebar)

### Resumo do Dia
Mostra o total de horas alocadas para o dia selecionado:

```
Resumo do dia
6.0h  de 8h
████████████░░░░
3 blocos - 2.0h disponiveis
```

**Cores da barra:**

| Cor | Condicao |
|-----|----------|
| Verde | Menos de 75% preenchido |
| Amarelo | Entre 75% e 99% |
| Vermelho | 100% ou mais (excedeu 8h) |

### Tarefas Nao Alocadas
Lista de tarefas atribuidas ao usuario que **ainda nao foram colocadas no calendario**:

```
Nao alocadas (3)

[Tarefa A]          [Tarefa B]
Projeto X           Projeto Y
Alta  - 20h est.    Media  - 8h est.
```

- Cada card mostra: titulo, projeto, prioridade, horas estimadas
- **Ponto colorido:** indica prioridade (vermelho=alta, azul=media, cinza=baixa)
- Cards sao **arrastaveis** para o calendario
- Busca: campo de busca para filtrar tarefas por nome/projeto

### Regra de exibicao
- Uma tarefa **desaparece** da sidebar assim que tiver **qualquer alocacao** no calendario
- Se todas as alocacoes forem removidas, a tarefa volta a aparecer

---

## 8.5 Criar Alocacao

### Opcao 1: Clicar no calendario
1. Clique em um horario vazio no calendario (ou arraste para selecionar um intervalo)
2. O modal de alocacao abre com data e horario pre-preenchidos
3. Selecione a **tarefa** no dropdown
4. Ajuste o **horario** com o slider
5. Adicione **notas** (opcional)
6. Clique em **"Criar"**

### Opcao 2: Arrastar da sidebar
1. Arraste um card da sidebar para o calendario
2. Solte no horario desejado
3. O modal abre com a tarefa e horario pre-preenchidos
4. Confirme clicando em **"Criar"**

---

## 8.6 Criar Alocacao em Lote

Permite criar a mesma alocacao para varios dias de uma vez (ex: segunda a sexta).

### Como usar

1. Abra o modal de criacao (clique no calendario)
2. No campo **Periodo**, defina:
   - **De:** data de inicio
   - **Ate:** data de fim
3. O sistema calcula automaticamente quantos dias serao criados
4. Marque **"Pular fins de semana"** para ignorar sabado e domingo
5. Ajuste o horario (igual para todos os dias)
6. Clique em **"Criar X alocacoes"**

### Exemplo

```
De: 09/02/2026    Ate: 13/02/2026
[x] Pular fins de semana

5 dias — mesmo horario em cada dia

Horario: 10:00 - 16:00
Tarefa: Criar API de autenticacao

[ Criar 5 alocacoes ]
```

### Conflitos
- Se algum dia ja tiver uma alocacao no mesmo horario, ele sera pulado
- O sistema informa: "4 alocacoes criadas, 1 com conflito"

---

## 8.7 Editar Alocacao

1. Clique no bloco de alocacao no calendario
2. O modal de edicao abre com os dados atuais
3. Altere: data, horario, notas
4. Clique em **"Atualizar"**

**Nota:** A tarefa nao pode ser alterada na edicao, apenas data, horario e notas.

---

## 8.8 Mover e Redimensionar

### Mover um bloco
1. Clique e segure no bloco
2. Arraste para o novo horario/dia
3. Solte — a alocacao e atualizada automaticamente

### Redimensionar um bloco
1. Passe o mouse na borda superior ou inferior do bloco
2. Clique e arraste para alterar o horario de inicio ou fim
3. Solte — o horario e atualizado

### Regras
- Snap de 15 minutos (os horarios sao arredondados para multiplos de 15min)
- Se houver conflito com outra alocacao, a operacao e revertida
- Duracao minima: 15 minutos

---

## 8.9 Arrastar da Sidebar

1. Na sidebar, localize a tarefa desejada
2. Clique e segure no card da tarefa
3. Arraste ate o horario desejado no calendario
4. Solte — o modal de criacao abre com tarefa e horario pre-preenchidos
5. Confirme clicando em **"Criar"**

---

## 8.10 Remover Alocacoes

Ao clicar em um bloco e abrir o modal de edicao, ha 3 opcoes de remocao:

### Somente esta
- Remove apenas a alocacao selecionada
- As demais alocacoes da mesma tarefa permanecem

### Todas do dia (DD/MM)
- Remove todas as alocacoes daquela tarefa naquele dia especifico
- Util quando a tarefa tem multiplos blocos no mesmo dia

### Todas da tarefa
- Remove TODAS as alocacoes daquela tarefa em todos os dias
- Acao mais destrutiva — use com cuidado
- A tarefa volta a aparecer na sidebar de "Nao alocadas"

### Como usar
1. Clique no bloco no calendario
2. No modal, clique em **"Remover"**
3. Um menu dropdown aparece com as 3 opcoes
4. Selecione a opcao desejada

---

## 8.11 Notas e Anotacoes

### Onde adicionar
- No modal de criacao ou edicao, campo **"Notas"**
- Texto livre para observacoes sobre aquela alocacao

### Onde visualizar
As notas aparecem em dois lugares:

1. **No bloco do calendario:** Texto em italico abaixo do horario (quando o bloco tem espaco)
2. **Tooltip:** Passe o mouse sobre o bloco para ver todas as informacoes incluindo notas completas

---

## 8.12 Visualizar Calendario de Outros

**Acesso:** Supervisor e Admin

### Como acessar
1. No topo da tela, use o dropdown ao lado de "Calendario"
2. Selecione o usuario desejado
3. O calendario muda para mostrar as alocacoes daquele usuario

### Para Supervisores
- Modo **somente leitura** (badge amarelo "Visualizacao")
- Pode ver as alocacoes mas **nao pode editar**
- Nao pode arrastar, criar ou remover

### Para voltar ao seu calendario
- Selecione **"Meu calendario"** no dropdown

---

## 8.13 Admin Gerenciando Calendarios

**Acesso:** Apenas Administrador

### O que o admin pode fazer no calendario de outros

Quando um admin seleciona outro usuario, ele tem **controle total**:

- Criar alocacoes para aquele usuario
- Editar alocacoes existentes
- Mover e redimensionar blocos
- Remover alocacoes (todas as opcoes)
- Criar alocacoes em lote
- Arrastar tarefas da sidebar

### Identificacao visual
- Badge azul **"Gerenciando"** aparece ao lado do seletor de usuario
- A sidebar mostra as tarefas nao alocadas do usuario selecionado
- O resumo do dia mostra as horas do usuario selecionado

### Regras
- O admin so pode alocar tarefas que **estao atribuidas** ao usuario
- Verificacao de conflito de horario funciona normalmente
- O limite de 8h/dia e respeitado (com aviso quando excede)

---

## 8.14 Slider de Horario

### Como funciona
Em vez de digitar horarios manualmente, o sistema usa um slider visual:

```
         07:00                   13:00                   19:00
           |                       |                       |
  ---------[=========|==========]---------
           10:00                16:00
           Inicio               Fim

           Duracao: 6h (360min)
```

### Interacoes
- **Arrastar ponto esquerdo:** Ajusta horario de inicio
- **Arrastar ponto direito:** Ajusta horario de fim
- **Arrastar a barra central:** Move todo o intervalo mantendo a duracao

### Regras
- Intervalo: 07:00 as 19:00
- Snap: 15 minutos (os valores pulam de 15 em 15min)
- Duracao minima: 15 minutos

---

# Capitulo 9: Monitoramento

**Acesso:** Apenas Administrador

---

## 9.1 Visao Geral

O Monitoramento e a tela mais analitica do sistema. Disponivel apenas para administradores, oferece uma visao profunda sobre:

- Performance de supervisores
- Carga de trabalho da equipe
- Historico de atribuicoes
- Tarefas em risco
- Distribuicao de status
- Graficos e estatisticas

---

## 9.2 Filtros Gerais

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

## 9.3 Secao 1: Performance dos Supervisores

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

## 9.4 Secao 2: Carga dos Membros da Equipe

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

## 9.5 Secao 3: Historico e Analise de Atribuicoes

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

## 9.6 Secao 4: Analise de Tarefas em Risco

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

## 9.7 Secao 5: Tarefas com Mais Colaboradores

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

## 9.8 Secao 6: Distribuicao de Status

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

## 9.9 Dicas de Uso para Administradores

1. **Comece pelo periodo:** Filtre por "Ultimos 7 dias" para uma visao recente
2. **Monitore riscos:** A Secao 4 e a mais critica — tarefas em risco precisam de acao
3. **Avalie supervisores:** Use a Secao 1 para comparar performance
4. **Equilibre cargas:** A Secao 2 mostra quem esta sobrecarregado
5. **Analise tendencias:** Os graficos da Secao 3 revelam padroes de atribuicao
6. **Tarefas complexas:** A Secao 5 indica onde ha risco de coordenacao

---

# Capitulo 10: Configuracoes (Gerenciamento de Usuarios)

**Acesso:** Apenas Administrador

---

## 10.1 Visao Geral

A tela de Configuracoes permite ao administrador gerenciar todos os usuarios do sistema. Aqui e possivel:

- Visualizar todos os usuarios cadastrados
- Alterar o perfil (role) de um usuario
- Ativar ou desativar contas
- Redefinir senhas

---

## 10.2 Lista de Usuarios

Tabela com todos os usuarios do sistema:

```
+------------------+------------------------+----------------+--------+--------------+
| Nome             | Email                  | Perfil         | Ativo  | Acoes        |
+------------------+------------------------+----------------+--------+--------------+
| Magno            | magno@teste.com        | Administrador  |  Sim   | [Perfil][Ativar][Senha] |
| Emanuel          | emanuel@teste.com      | Administrador  |  Sim   | [Perfil][Ativar][Senha] |
| Joao Silva       | joao@teste.com         | Supervisor     |  Sim   | [Perfil][Ativar][Senha] |
| Maria Santos     | maria@teste.com        | Usuario        |  Sim   | [Perfil][Ativar][Senha] |
| Pedro Costa      | pedro@teste.com        | Usuario        |  Nao   | [Perfil][Ativar][Senha] |
+------------------+------------------------+----------------+--------+--------------+
```

### Colunas

| Coluna | Descricao |
|--------|-----------|
| Nome | Nome completo do usuario |
| Email | Email de login |
| Perfil | Badge colorido com o perfil atual |
| Ativo | Indicador se a conta esta ativa |
| Acoes | Botoes de gerenciamento |

### Cores dos badges de perfil

| Perfil | Cor |
|--------|-----|
| Usuario | Cinza |
| Supervisor | Azul |
| Administrador | Vermelho/Roxo |

---

## 10.3 Alterar Perfil do Usuario

### Como alterar

1. Na linha do usuario, clique no botao de **alterar perfil**
2. Um dropdown aparece com as opcoes:
   - **Usuario** — Acesso basico
   - **Supervisor** — Gerencia projetos e equipe
   - **Administrador** — Acesso total ao sistema
3. Selecione o novo perfil
4. Confirme a alteracao no dialogo de confirmacao

### Perfis disponiveis

| Perfil | Descricao | Acesso |
|--------|-----------|--------|
| **Usuario** | Membro da equipe | Projetos atribuidos, tarefas, time tracking, calendario pessoal |
| **Supervisor** | Lider de equipe | Tudo do usuario + Dashboard, Kanban, criar projetos/etapas/tarefas, ver calendarios |
| **Administrador** | Gestor do sistema | Tudo do supervisor + Monitoramento, Configuracoes, gerenciar calendarios de todos |

### Impacto da mudanca
- A alteracao e imediata
- O menu de navegacao do usuario muda na proxima visita
- Telas restritas ficam acessiveis/inacessiveis conforme o novo perfil

---

## 10.4 Ativar e Desativar Usuario

### Desativar usuario
1. Clique no botao de **ativar/desativar** na linha do usuario
2. Confirme no dialogo: "Deseja desativar este usuario?"
3. O usuario fica com status **Inativo**

### Reativar usuario
1. Mesmo procedimento — clique no botao novamente
2. Confirme: "Deseja reativar este usuario?"
3. O usuario volta ao status **Ativo**

### Impacto
- **Usuario desativado** nao consegue fazer login
- As tarefas e historico do usuario sao mantidos
- Alocacoes no calendario permanecem
- O usuario pode ser reativado a qualquer momento

---

## 10.5 Redefinir Senha

### Quando usar
- Quando um usuario esqueceu a senha
- Quando e necessario forcar uma troca de senha

### Como redefinir

1. Clique no botao **"Senha"** na linha do usuario
2. O modal de redefinicao abre mostrando:
   - Nome do usuario (somente leitura)
   - Email do usuario (somente leitura)
   - Campo **Nova Senha**
3. Digite a nova senha (minimo 6 caracteres)
4. Clique em **"Redefinir Senha"**
5. Mensagem de sucesso aparece

### Regras
- Senha minima: 6 caracteres
- O usuario devera usar a nova senha no proximo login
- Nao e possivel ver a senha atual (por seguranca)

---

## 10.6 Busca de Usuarios

### Como buscar
- No topo da tela, use o campo de busca
- Busca por **nome** ou **email**
- Resultados filtrados em tempo real

### Exemplo
Digitar "maria" filtra:
- Maria Santos (maria@teste.com)
- Mariana Costa (mariana@teste.com)

---

## 10.7 Notificacoes

Apos cada acao (alterar perfil, ativar/desativar, redefinir senha):
- Uma mensagem de **sucesso** (verde) ou **erro** (vermelho) aparece no topo
- A mensagem desaparece automaticamente apos 4 segundos

---

## 10.8 Dicas para Administradores

1. **Novos usuarios** sao criados com perfil "Usuario" por padrao no cadastro
2. **Promova para Supervisor** quem vai liderar projetos
3. **Desative** contas de pessoas que sairam da equipe (nao exclua, para manter historico)
4. **Redefina senhas** quando solicitado — oriente o usuario a trocar depois
5. Use a **busca** para encontrar usuarios rapidamente em equipes grandes

---

# Parte III - Apendices

---

# Apendice A: Regras de Negocio das Tarefas

Este apendice documenta as regras de negocio implementadas no sistema para a gestao de tarefas.

---

## A.1 Conceitos Fundamentais

### O que e uma Tarefa?

Uma tarefa e uma unidade de trabalho que:
- Pertence a uma ETAPA de um PROJETO
- Tem uma **estimativa de horas** (quanto deveria levar)
- Pode ter multiplos **usuarios atribuidos**
- Cada usuario faz **compromisso de horas/dia** (quanto vai trabalhar por dia)
- Registra o trabalho real via **sessoes de tempo** (play/pause/stop)

### Hierarquia

```
PROJETO (Supervisor define)
  +-- ETAPA (Supervisor cria)
      +-- TAREFA (Supervisor cria, usuarios trabalham)
          +-- Estimativa: 40h (total que deveria levar)
          +-- Atribuicoes:
          |   +-- Joao: 4h/dia (compromisso)
          |   +-- Maria: 3h/dia (compromisso)
          +-- Sessoes de Tempo:
              +-- Joao Play 09:00 -> Pause 10:00 = 1h registrada
              +-- Maria Play 10:00 -> Stop 14:00 = 4h registrada
```

---

## A.2 Regra 1: Atribuicao de Usuarios

### Conceito
Atribuir um usuario a uma tarefa = **usuario se compromete com X horas/dia naquela tarefa**

### Fluxo Completo

1. **Supervisor clica "+ Atribuir Usuario"** — Modal abre com lista de usuarios
2. **Supervisor seleciona usuarios e define horas** — Marca checkbox, define horas (0-8)
3. **Backend valida e atribui**:
   - Converte daily_hours para numero
   - Valida se esta entre 0-8
   - Verifica limite 8h/dia TOTAL (soma todas as tarefas do usuario)
   - Se passou: INSERT ou UPDATE no banco

### Resposta da API

**Se Sucesso (todos os usuarios atribuidos):**

```
Resultado:
  - Joao Silva: 3.5h/dia -> Sucesso
  - Maria Santos: 4.0h/dia -> Sucesso
  Mensagem: "2 atribuicao(oes) bem-sucedida(s)"
```

**Se Falha Parcial (um dos usuarios excede limite):**

```
Resultado:
  - Maria Santos: 4.0h/dia -> Sucesso
  - Joao Silva: 3.5h/dia -> ERRO
    "Usuario ja possui 5.5h/dia alocadas em outras tarefas.
     Solicitado: 3.5h. Disponivel: 2.5h/dia."
  Mensagem: "1 atribuicao(oes) bem-sucedida(s), 1 erro(s)"
```

### Pontos-chave
- Atribuicao = Compromisso, nao trabalho real — nao faz o usuario trabalhar, apenas estabelece compromisso
- Cada usuario tem limite de 8h/dia somando TODAS as suas tarefas
- Pode atualizar horas depois (PATCH)
- Se usuario ja estava atribuido: ATUALIZA horas; se era novo: INSERE (ON DUPLICATE KEY UPDATE)
- Tarefas concluidas ou canceladas NAO contam para o limite

---

## A.3 Regra 2: Limite de 8h/dia

### Conceito Fundamental
**8 horas/dia e o LIMITE MAXIMO que um usuario pode se comprometer**

Isso vale para:
- Soma de TODAS as tarefas (atribuicoes)
- Trabalho REAL em um dia (time tracking)

### Exemplo Pratico

```
Joao tem 3 tarefas:
  Tarefa A: 3h/dia
  Tarefa B: 2.5h/dia
  Tarefa C: 2.5h/dia
  TOTAL: 8h/dia (NO LIMITE)

Se tentar adicionar Tarefa D com 1h:
  TOTAL: 9h/dia (REJEITA)
```

### Onde e Validado?

#### 1. Na ATRIBUICAO (Compromisso)
- Soma todas as task_assignments do usuario
- Exclui tarefas concluidas ou canceladas
- Bloqueia se total > 8h

```
Calculo:
  Horas em outras tarefas ativas + Horas solicitadas <= 8h
  Se falhar: rejeita com mensagem detalhada
```

#### 2. Na EDICAO de horas
- Mesma validacao da atribuicao
- Verifica se a NOVA quantidade nao excede o limite
- Desconta as horas anteriores da mesma tarefa

#### 3. Na INICIALIZACAO de uma sessao (Play)
- Soma time_entries_sessions do dia (status running, paused e stopped)
- Se total >= 8h: bloqueia nova sessao
- Retorna: pode iniciar (sim/nao), horas completadas hoje, horas disponiveis

```
Calculo:
  Horas registradas hoje (todas as sessoes) < 8h
  Se falhar: botao PLAY fica desabilitado
  Mensagem: "Limite diario atingido"
```

### Feedback na Interface

```
Erro ao atribuir Joao Silva

   Horas comprometidas:    5.50h
 + Voce esta tentando:   + 3.00h
   Total seria:            8.50h (EXCEDE)

   Limite diario: 8.00h
   Sugestao: Voce pode atribuir ate 2.50h
```

---

## A.4 Regra 3: Horas Dedicadas

### Conceito
"Horas Dedicadas" = **SOMA de todas as horas que os usuarios se comprometeram em uma tarefa**

```
Tarefa: "Desenvolvimento de Login"
Estimativa: 40h

Atribuicoes:
  Joao: 4h/dia
  Maria: 3h/dia
  Pedro: 2h/dia
HORAS DEDICADAS: 9h/dia (SOMA)
```

### Funcao
1. **Supervisor acompanha capacidade** — Se tarefa precisa 40h e tem 9h/dia, leva ~4.4 dias
2. **Identificar falta de recursos** — Se sugestao era 10h/dia mas alocaram 5h, tarefa vai atrasar
3. **Comparacao com sugestao** — Modal mostra diferenca entre sugerido e comprometido

---

## A.5 Regra 4: Progresso Acumulativo

### Conceito Fundamental
**Progresso % e calculado com TODAS as horas trabalhadas desde o inicio da tarefa**

- NUNCA ZERA (nao reinicia ao trocar de dia)
- SEMPRE ACUMULATIVO (soma-se tudo)
- SO CONTA SESSOES FINALIZADAS (status='stopped')

### Formula

```
Progresso (%) = (Horas Reais Trabalhadas / Horas Estimadas) x 100

Exemplo:
  Tarefa: 40h estimadas
  Dia 1: Joao trabalha 5h   -> 5/40   = 12.5%
  Dia 2: Maria trabalha 3h  -> 8/40   = 20%
  Dia 3: Pedro trabalha 2h  -> 10/40  = 25%

  Progresso NUNCA volta para 12.5%
  Sempre mostra 25% (acumulado)
```

### Diferenca: Progresso vs Historico Filtrado

```
PROGRESSO (Card):
  - Usa TODAS as sessoes stopped
  - Nunca filtrado por periodo
  - Acumulativo permanente

HISTORICO (Tabela):
  - Filtravel por periodo (Hoje, Semana, Mes, Custom)
  - Filtravel por usuario
  - Mesmos dados, visao diferente
```

---

## A.6 Regra 5: Time Tracking (Play/Pause/Stop)

### Conceito
Time Tracking = **Registrar trabalho real em SESSOES**

```
[PLAY] 09:00
  +-- Cronometro comeca
  +-- Status: 'running'

[PAUSE] 10:15
  +-- Cronometro pausa
  +-- Contador de pausa inicia
  +-- Status: 'paused'

[RESUME] 10:30
  +-- Cronometro retoma (sem pular)
  +-- Status: 'running'

[STOP] 13:00
  +-- Sessao finalizada
  +-- Status: 'stopped'
  +-- Horas registradas: 3h 15m
  +-- Pausa registrada: 15m
```

### Estados de uma Sessao

```
running  -> Usuario esta trabalhando AGORA
paused   -> Trabalho parado temporariamente
stopped  -> Sessao finalizada e salva
```

### Precisao em Segundos
O sistema armazena `duration_total_seconds` para registro preciso, convertendo para horas quando necessario.

### Rastreamento de Pausa

```
Exemplo:
  Comeca 09:00
  Pausa 10:15 (75 minutos trabalhados)
  Retoma 10:30 (15 minutos de pausa)
  Pausa 11:45 (75 minutos trabalhados)
  Retoma 12:00 (15 minutos de pausa)
  Para 13:00 (60 minutos trabalhados)

  Total trabalhado: 75 + 75 + 60 = 210 minutos = 3.5h
  Total pausa: 15 + 15 = 30 minutos
  Pause count: 2
```

---

## A.7 Regra 6: Conclusao Estimada Dinamica

### Conceito
"Conclusao Estimada" = **Data prevista de conclusao baseada no ritmo atual de trabalho**

```
Formula:
Data Estimada = Hoje + (Horas Estimadas / Total de Horas Dedicadas)

Exemplo:
  Tarefa: 40h estimadas
  Atribuicoes: Joao 4h/dia + Maria 3h/dia = 7h/dia
  Conclusao Estimada = Hoje + (40 / 7) = Hoje + 5.7 dias ~ Dia 6
```

### Recalcula Automaticamente
Quando alguem muda suas horas de compromisso, a data estimada e recalculada na hora.

---

## A.8 Regra 7: Filtros de Historico

### Conceito
Filtros = **Visualizar o mesmo historico de sessoes de diferentes perspectivas**

```
[Todos]      -> Todas as sessoes desde inicio
[Hoje]       -> Apenas de hoje
[Semana]     -> Ultimos 7 dias
[Mes]        -> Ultimos 30 dias
[Custom]     -> Range que voce escolhe

+ Filtro por Usuario:
  Todos / Joao / Maria / Pedro
```

**Importante:** Progresso NAO muda ao filtrar. Progresso usa TODAS as sessions stopped (sem filtro). Historico usa filtered sessions (com filtros aplicados).

---

## A.9 Regra 8: Interface e Modais

### Modal de Horas Dedicadas
Abre ao clicar no card "Horas Dedicadas" na pagina de detalhes da tarefa.

Secoes:
- **Comparacao visual:** Sugestao do supervisor vs total alocado
- **Barra de progresso:** Verde (0-75%), Amarelo (75-90%), Laranja (90-100%), Vermelho (>100%)
- **Status badge:** Acima, abaixo ou igual a sugestao
- **Grid de usuarios:** Cards individuais com horas de cada um
- **Resumo:** Total sugerido vs total alocado

### Modal de Detalhes de Sessao
Abre ao clicar em uma linha da tabela de historico de sessoes.

Secoes:
- **Tempo total:** Card destaque com duracao total
- **Grid de metricas:** Tempo dedicado, tempo em pausa, numero de pausas
- **Horarios:** Inicio e fim da sessao
- **Notas:** Descricao do trabalho realizado

---

## A.10 Fluxos Completos

### Fluxo 1: Criar Tarefa -> Atribuir -> Trabalhar

```
1. SUPERVISOR cria tarefa
   - Titulo: "Implementar Login"
   - Estimativa: 40h
   - Sugestao: 8h/dia
   -> Resultado: Tarefa criada com sucesso

2. SUPERVISOR atribui usuarios
   - Joao: 4h/dia
   - Maria: 3h/dia
   - Validacao: 4 + 3 = 7h <= 8h (OK para cada um)
   -> Resultado: Usuarios atribuidos

3. JOAO inicia sessao (Play)
   - Sistema valida: Joao trabalhou 2h hoje em outras tarefas
   - 2 + 4 (estimado) = 6h <= 8h (OK)
   -> Resultado: Sessao criada, cronometro iniciado

4. JOAO trabalha 2.5h e pausa
   -> duration_total_seconds = 9000 (2.5h)

5. JOAO retoma e trabalha mais 1.25h
   -> Clica Resume, depois Stop
   -> duration_total_seconds = 13500 (3.75h)

6. MARIA trabalha 3h na mesma tarefa
   -> Mesmo fluxo (Play -> Stop)
   -> 3h registrada

7. SUPERVISOR ve o resultado:
   - Horas Estimadas: 40h
   - Horas Dedicadas: 7h/dia (4 + 3)
   - Progresso: 6.75h registradas = 16.9%
   - Conclusao Estimada: ~6 dias (40 / 7)
   - Historico: [Joao 3.75h, Maria 3h]
```

### Fluxo 2: Editar Compromisso e Recalcular

```
1. JOAO ve que 4h/dia e muita carga
   - Pede para reduzir para 2.5h

2. SUPERVISOR atualiza horas do Joao
   - De: 4h/dia -> Para: 2.5h/dia
   - Validacao: 2.5 + 3 (Maria) = 5.5h <= 8h (OK)
   -> Resultado: Horas atualizadas

3. SISTEMA recalcula automaticamente:
   - Horas Dedicadas: 5.5h/dia (era 7h)
   - Conclusao Estimada: ~8 dias (era ~6 dias)

4. SUPERVISOR nota atraso potencial
   - Ve que esta abaixo da sugestao (8h)
   - Decide alocar mais recursos

5. SUPERVISOR atribui Pedro com 2h/dia
   - Validacao: Pedro tem 4h em outras -> 4 + 2 = 6h (OK)
   -> Total dedicado volta para 7.5h/dia
   -> Conclusao: ~6 dias novamente
```

---

## A.11 Validacoes Completas

### Validacoes na Atribuicao

```
1. daily_hours e numero valido?
   -> Converte string para numero

2. daily_hours esta entre 0-8?
   -> Se nao: erro "Valor deve ser entre 0 e 8"

3. Limite 8h/dia nao ultrapassa?
   -> Soma horas em tarefas ativas (exceto concluidas/canceladas)
   -> current_hours + requestedHours <= 8
   -> Se nao: erro detalhado com horas disponiveis

4. Usuario existe?
   -> Verificado via foreign key

5. Tarefa existe?
   -> Se nao: erro 404
```

### Validacoes na Edicao de Horas

```
1. Mesmas validacoes da atribuicao (0-8, soma 8h)

2. Assignment existe?
   -> Se nao: erro 404

3. Permissao?
   -> Usuario pode editar seu proprio compromisso
   -> Supervisor/Admin pode editar qualquer um
```

### Validacoes no Play (Iniciar Sessao)

```
1. Tarefa existe?
   -> Se nao: erro 404

2. Usuario esta atribuido a esta tarefa?
   -> Se nao: erro 403 "Voce nao esta atribuido a esta tarefa"

3. Ja existe sessao ativa (running ou paused)?
   -> Se sim: erro "Voce tem uma sessao ativa"

4. Limite 8h/dia nao ultrapassa?
   -> Soma horas de todas as sessoes do dia
   -> Se >= 8h: botao PLAY desabilitado
   -> Mensagem: "Limite diario atingido"

5. Atribuicao e valida?
   -> user_id deve estar em task_assignments
   -> Se nao: erro 403
```

---

## A.12 Resumo das Regras

1. **Atribuicao** — Supervisores definem quem trabalha quanto/dia em cada tarefa
2. **Limite 8h** — Um usuario nao pode se comprometer com >8h/dia TOTAL
3. **Horas Dedicadas** — Soma de todos os compromissos de uma tarefa
4. **Progresso** — (Horas reais / estimadas) x 100, nunca zera
5. **Time Tracking** — Play/Pause/Stop registra trabalho real em segundos
6. **Conclusao** — Estimada = hoje + (estimadas / horas dedicadas/dia)
7. **Filtros** — Visualizar historico por periodo e/ou usuario
8. **Interface** — Modais atraentes e responsivos com gradients e visualizacoes dinamicas

---

## A.12 Estrutura de Dados

### Tabela: task_assignments

```
task_id       INT          (FK -> tasks)
user_id       INT          (FK -> users)
daily_hours   DECIMAL(3,2) (0.00 a 8.00)
created_at    TIMESTAMP
updated_at    TIMESTAMP
PRIMARY KEY (task_id, user_id)
```

### Tabela: time_entries_sessions

```
id                     INT AUTO_INCREMENT PRIMARY KEY
task_id                INT (FK -> tasks)
user_id                INT (FK -> users)
status                 ENUM('running', 'paused', 'stopped')
start_time             TIMESTAMP
pause_time             TIMESTAMP NULL
resume_time            TIMESTAMP NULL
end_time               TIMESTAMP NULL
duration_total_seconds INT          (preciso)
duration_hours         DECIMAL(6,2) (derivado)
paused_total_seconds   INT          (preciso)
pause_count            INT
notes                  TEXT
created_at             TIMESTAMP
```

### Relacao Hierarquica

```
projects (1)
  +-- project_stages (n)
      +-- tasks (n)
          +-- task_assignments (n) -- users (n)
          |   +-- Cada usuario com daily_hours
          +-- time_entries_sessions (n)
              +-- Historico de trabalho real
```

---

# Apendice B: Guia do Grafico de Evolucao de Horas

---

## B.1 O que e?

O **Grafico de Evolucao das Horas** e uma ferramenta visual que mostra como o tempo foi gasto em uma tarefa ao longo dos dias. Compare o que foi planejado com o que realmente foi trabalhado atraves de um grafico interativo.

---

## B.2 Como Acessar

1. Abra uma **Tarefa** na tela de Detalhes
2. Procure pelo card **"Progresso"** que mostra a porcentagem (ex: 45%)
3. **Clique no card** para abrir o grafico
4. Um modal grande com o grafico sera exibido

---

## B.3 Entendendo o Grafico

### As Duas Linhas

**Linha Azul (solida)**
- Representa as **horas reais** que voce/sua equipe trabalhou
- Varia de dia para dia conforme o tempo dedicado

**Linha Verde (tracejada)**
- Representa as **horas sugeridas** para a tarefa
- E uma reta constante (nao varia)
- Mostra quanto de tempo foi estimado por dia

### Comparacao Rapida

```
Se a linha azul esta acima da verde:
  -> Voce trabalhou MAIS que o previsto

Se a linha azul esta abaixo da verde:
  -> Voce trabalhou MENOS que o previsto

Se as linhas se cruzam:
  -> As vezes acima, as vezes abaixo (variavel)
```

---

## B.4 Filtros

### Filtro de Periodo

| Periodo | O que mostra |
|---------|-------------|
| **Todos** | Historico completo desde o inicio |
| **Hoje** | Apenas o dia de hoje |
| **Semana** | Ultimos 7 dias |
| **Mes** | Ultimos 30 dias |
| **Customizado** | Data inicial ate data final |

### Filtro de Usuario

Se a tarefa tem **multiplos usuarios atribuidos**:

- **Todos** — Mostra a soma total de todas as horas trabalhadas por todos
- **[Nome do Usuario]** — Mostra apenas as horas trabalhadas por aquela pessoa

### Filtro de Data (Customizado)

1. Clique no campo **"De:"** e selecione a data inicial
2. Clique no campo **"Ate:"** e selecione a data final
3. O grafico atualiza automaticamente com o periodo escolhido

---

## B.5 Entendendo as Estatisticas

Acima do grafico ha 4 cards com numeros importantes:

| Card | Cor | Descricao |
|------|-----|-----------|
| Dias | Azul | Quantidade de dias diferentes em que houve registro de tempo |
| Total | Verde | Soma total de todas as horas trabalhadas no periodo |
| Media | Roxo | Horas por dia em media (Total / Dias) |
| Maximo | Laranja | Maior numero de horas em um unico dia |

---

## B.6 Tooltip (Passe o Mouse)

Passe o mouse sobre qualquer ponto azul no grafico:

```
+-------------------------------+
| Terca-feira, 14 de janeiro    |
+-------------------------------+
| Horas Reais: 6.50h            |
| Sugestao: 8.00h               |
|                               |
| Diferenca: -1.50h             |
|    73.1% da meta              |
|                               |
| Detalhamento por Usuario:     |
|    Joao Silva: 3.50h          |
|    Maria Santos: 3.00h        |
+-------------------------------+
```

---

## B.7 Exemplo Pratico Completo

### Cenario
Uma tarefa estimada em **8 horas por dia** com **2 pessoas** trabalhando nela.

### Passo 1: Visualize o historico completo
- Filtro: "Todos"
- Usuario: "Todos"
- Resultado: Grafico mostra toda evolucao

```
Horas
  ^
  16|
  14|      /\
  12|    /  |  /\
  10|  /    \| /  \------
   8|---------------------- (Sugestao)
   6|
   4|
   2|
   0+---------------------> Dias
```

### Passo 2: Veja contribuicao do Joao
- Filtro: Periodo = "Semana"
- Usuario: "Joao Silva"
- Resultado: Apenas horas do Joao nos ultimos 7 dias

### Passo 3: Analise um periodo especifico
- Filtro: "Customizado"
- De: 01/01/2026
- Ate: 15/01/2026
- Resultado: Grafico mostra apenas o periodo de 15 dias

### Analise rapida

```
Analise:
- Seg-Qua: Azul acima de verde (esforco extra!)
- Qui-Sex: Azul abaixo de verde (ritmo reduzido)
- Conclusao: Primeira metade foi intensa, segunda foi mais leve
```

---

## B.8 Entendendo as Cores

| Cor | Significado | Elemento |
|-----|------------|----------|
| Azul | Trabalho real, o que foi feito | Linha solida |
| Verde | Meta, o que foi planejado | Linha tracejada |
| Roxo | Informacao secundaria | Cards de estatisticas |
| Laranja | Destaque importante | Cards de maximo |

Embaixo do grafico ha uma legenda:

```
Linha Azul: Horas reais trabalhadas por dia
Linha Verde: Horas sugeridas (8.00h)
```

---

## B.9 Dicas e Boas Praticas

### Faca
- Abra o grafico regularmente para acompanhar progresso
- Use filtros para analises mais profundas
- Compare suas horas com a sugestao
- Ajuste estimativas baseado em tendencias reais
- Revise o grafico semanalmente

### Evite
- Nao confie 100% em um dia so (pode ser anomalia)
- Nao copie a tendencia do grafico para outros sem contexto
- Nao ignore a linha verde (sugestao)
- Nao presuma que mais horas = mais produtividade

### Dica 1: Analisar Tendencias

```
Observando a linha azul:
- Se sobe gradualmente -> Produtividade aumentando
- Se cai no final -> Possivel desanimo ou mudanca de prioridade
- Se fica oscilante -> Variacao no ritmo de trabalho
```

### Dica 2: Comparar Dois Usuarios

```
1. Abra o grafico com "Todos" os usuarios
2. Veja a curva geral
3. Mude o filtro para "Usuario A" e veja o padrao
4. Depois mude para "Usuario B"
-> Compare os dois comportamentos
```

### Dica 3: Detectar Atrasos

```
Se a linha azul esta consistentemente ABAIXO da verde:
-> A tarefa pode estar atrasada
-> Considere aumentar alocacao ou revisar estimativa
```

---

## B.10 Casos de Uso Comuns

### Caso 1: Acompanhar Progresso Diario

**Objetivo:** Verificar se esta no caminho certo

1. Filtro: "Hoje"
2. Usuario: Seu proprio nome
3. Compare suas horas com a sugestao
4. Veja se precisa trabalhar mais ou menos

### Caso 2: Revisar Semana de Trabalho

**Objetivo:** Fazer retrospectiva semanal

1. Filtro: "Semana"
2. Usuario: "Todos"
3. Veja quem trabalhou quanto
4. Identifique dias de pico e vale

### Caso 3: Preparar Relatorio

**Objetivo:** Gerar dados para apresentacao

1. Filtro: "Customizado" com datas do periodo
2. Usuario: Dependendo do relatorio (um ou todos)
3. Note as estatisticas (Total, Media, Maximo)
4. Use esses numeros no relatorio

### Caso 4: Validar Estimativas

**Objetivo:** Checar se as estimativas estao realistas

1. Filtro: "Todos"
2. Usuario: "Todos"
3. Compare a tendencia da linha azul com a verde
4. Se consistentemente diferente, revisar estimativa

---

## B.11 Atalhos e Navegacao

| Acao | Como fazer |
|------|-----------|
| Abrir grafico | Clique no card "Progresso" |
| Fechar grafico | Clique em "Fechar" ou X no topo |
| Trocar periodo | Clique em outro botao de periodo |
| Trocar usuario | Use o dropdown "Usuario" |
| Mudar data customizada | Clique nos campos de data |
| Ver mais detalhes | Passe mouse sobre pontos no grafico |

---

## B.12 Perguntas Frequentes

**P: Por que nao vejo dados?**
R: Verifique se ha sessoes de tempo finalizadas nesse periodo. Tente "Todos" em vez de um periodo especifico. Se nenhuma sessao foi iniciada, o grafico fica vazio.

**P: Posso exportar o grafico?**
R: Atualmente, voce pode fazer screenshot. Recursos de exportacao (PNG/PDF) podem vir em atualizacoes futuras.

**P: O grafico atualiza em tempo real?**
R: Nao. Os dados sao carregados ao abrir o modal. Feche e abra novamente para atualizar com novos registros.

**P: Posso comparar duas datas ao mesmo tempo?**
R: Nao diretamente, mas voce pode anotar os numeros do primeiro periodo, trocar os filtros para o segundo, e comparar.

**P: A "Sugestao" e obrigatoria?**
R: Nao. Se a tarefa nao tiver horas sugeridas, a linha verde nao aparece. Se aparecer zerada, a tarefa nao tem estimativa.

**P: Consigo ver historico de meses anteriores?**
R: Sim! Use o filtro "Todos" para ver todo o historico, ou "Customizado" para um periodo especifico.

---

## B.13 Suporte

Se o grafico nao funcionar:
1. Atualize a pagina (F5)
2. Verifique sua conexao com internet
3. Tente usar o periodo "Todos"
4. Contate o suporte se persistir

---

# Apendice C: Guia Completo da Tela de Tarefas

Este apendice fornece um guia detalhado e pratico para usuarios que trabalham diariamente com a tela de tarefas.

---

## C.1 Funcionalidades Principais

### Informacoes Basicas da Tarefa

No cabecalho da tela de detalhe, voce encontra:
- **Titulo da Tarefa:** Nome descritivo do trabalho
- **Descricao:** Detalhes sobre o que precisa ser feito
- **ID:** Identificador unico (P5.E2.T1)
- **Status:** Estado atual (novo, em_desenvolvimento, analise_tecnica, concluido, refaca)
- **Prioridade:** Nivel de urgencia (baixa, media, alta)
- **Badge de Risco:**
  - **NO PRAZO** (verde): Tudo dentro do cronograma
  - **ATENCAO** (amarelo): Prazo proximo (7 dias ou menos)
  - **CRITICO** (laranja): Muito proximo do vencimento (3 dias ou menos)
  - **ATRASADO** (vermelho): Prazo ja passou

---

## C.2 Cards de Metricas

### Horas Estimadas
- Total de horas planejadas para a tarefa
- Definido durante a criacao da tarefa

### Horas Dedicadas (Interativo)
- Total de horas que os usuarios se comprometeram a trabalhar diariamente
- **Clique para abrir modal detalhado** com comparacao sugestao vs compromisso real

### Progresso (Acumulativo)
- Calcula: (Horas Registradas / Horas Estimadas) x 100
- Baseado em TODAS as sessoes finalizadas desde o inicio
- **NUNCA zera** ao trocar de dia
- **Clique para abrir o Grafico de Evolucao de Horas**

---

## C.3 Gestao de Usuarios Atribuidos

### Adicionar Usuario
1. Clique em **"+ Atribuir Usuario"**
2. Modal abre com lista de usuarios
3. Marque checkbox e defina horas/dia
4. Sistema valida limite de 8h/dia

### Editar Compromisso de Horas
1. Clique no botao **"Editar"** ao lado do usuario
2. Campo de input aparece com valor atual
3. Mude para nova quantidade
4. Sistema valida se nao excede 8h/dia total

### Remover Usuario
- Botao de remover ao lado de cada usuario
- Remove apenas a atribuicao, nao o usuario do sistema

---

## C.4 Conclusao Estimada Dinamica

```
Formula: Hoje + (Horas Estimadas / Total de Horas Dedicadas) dias

Exemplo:
  Tarefa: 40h estimadas
  Maria 3h/dia + Joao 2h/dia = 5h/dia
  Conclusao = Hoje + (40h / 5h) = Hoje + 8 dias
```

Recalcula automaticamente quando alguem edita suas horas.

---

## C.5 Filtros de Historico

### Filtro por Periodo
- **Todos** — Todas as sessoes desde o inicio da tarefa
- **Hoje** — Apenas sessoes de hoje
- **Semana** — Ultimos 7 dias
- **Mes** — Ultimos 30 dias
- **Customizado** — Range de datas que voce escolhe

### Filtro por Usuario
- **Todos os usuarios** — Mostra sessoes de todos
- **[Nome]** — Mostra apenas sessoes daquele usuario

### Combinacao de Filtros
Voce pode usar periodo + usuario simultaneamente.

O titulo da tabela muda para refletir os filtros ativos:
- "Historico de Sessoes - Semana (Filtrado por Maria Santos)"
- "Historico de Sessoes - Todos"

---

## C.6 Dicas e Boas Praticas

### Faca
1. **Use notas descritivas** — "Desenvolvido autenticacao de usuarios" ao inves de "Trabalho"
2. **Pause quando apropriado** — Cafe, almoco, reunioes
3. **Finalize ao sair** — Clique STOP antes de sair da tela
4. **Monitore o progresso** — Se passar das horas estimadas, avise o supervisor
5. **Seja honesto com suas horas** — Defina compromisso realista
6. **Use os filtros de historico** — Para analises de periodos especificos

### Nao faca
1. Deixar sessao em andamento quando sair
2. Notas genericas ("trabalho", "tarefa")
3. Iniciar nova sessao sem fechar a anterior
4. Ignorar avisos de limite de 8h
5. Aceitar compromisso de horas que nao consegue cumprir
6. Ignorar que esta abaixo da sugestao

---

## C.7 Fluxo Completo de Uso

### Cenario Tipico

```
1. ABRE A TELA
   |
2. VE INFORMACOES DA TAREFA
   |
3. CLICA [PLAY]
   |
4. TRABALHA...
   |
5. PRECISA PAUSA? CLICA [PAUSE]
   |
6. VOLTA DO CAFE? CLICA [RESUME]
   |
7. TERMINOU? CLICA [STOP]
   |
8. SESSAO APARECE NO HISTORICO
   |
9. CLICA NA SESSAO PARA VER DETALHES
   |
10. MODAL MOSTRA TODAS AS METRICAS
```

---

## C.8 Troubleshooting (Resolucao de Problemas)

### Problema: Nao consigo iniciar uma sessao (botao PLAY desabilitado)

**Possiveis causas:**

1. **Limite de 8 horas diarias atingido**
   - Mensagem: "Limite de 8 horas/dia atingido"
   - Solucao: Retorne amanha ou finalize sessoes desnecessarias

2. **Nao esta atribuido a tarefa**
   - Mensagem: "Voce nao esta atribuido a esta tarefa"
   - Solucao: Peca ao supervisor para ser atribuido

3. **Sessao ativa em outra tarefa**
   - Mensagem: "Voce tem uma sessao ativa em outra tarefa"
   - Solucao: Finalize a outra sessao primeiro (STOP)

### Problema: Tooltip nao aparece ao passar mouse no grafico

**Possiveis causas:**

1. **Nenhum dado disponivel**
   - Solucao: Selecione um periodo com dados (ex: "Todos")

2. **Mouse muito rapido**
   - Solucao: Passe o mouse mais lentamente sobre os pontos azuis

3. **Navegador em cache**
   - Solucao: Pressione F5 para recarregar a pagina

### Problema: Horas nao estao sendo registradas

**Possiveis causas:**

1. **Sessao nao foi finalizada**
   - Verifique: A sessao deve estar com status "Finalizada" (STOP)
   - Solucao: Clique STOP para finalizar a sessao

2. **Conexao perdida**
   - Verifique: Sua conexao esta estavel?
   - Solucao: Verifique conexao WiFi/Internet

3. **Servidor indisponivel**
   - Solucao: Tente novamente em alguns minutos

### Problema: Grafico esta vazio ou mostra 0 horas

**Possiveis causas:**

1. **Nenhuma sessao finalizada nesse periodo**
   - Solucao: Selecione um periodo com sessoes finalizadas

2. **Filtro muito restritivo**
   - Solucao: Mude filtro de "Customizado" para "Todos"

3. **Sessoes ainda em progresso**
   - Nota: So conta sessoes FINALIZADAS (STOP)
   - Solucao: Finalize as sessoes para elas aparecerem no grafico

### Problema: Aviso de limite e muito restritivo

```
Voce tem 7h de trabalho e so 1h disponivel
Quer trabalhar so 30 minutos, mas sistema bloqueia?

Solucao:
- O sistema nao bloqueia com 7h, apenas avisa
- Botao PLAY so e desabilitado ao atingir 8h
- Trabalhe normalmente e finalize quando quiser
```

---

## C.9 Responsividade

A tela se adapta a diferentes tamanhos de tela:

```
Mobile (< 768px)
  +-- Cards em coluna unica
  +-- Tabela com scroll horizontal
  +-- Modal em tela cheia
  +-- Filtros empilhados verticalmente
  +-- Grafico redimensiona automaticamente
  +-- Toque para ver tooltips (nao hover)

Tablet (768px - 1024px)
  +-- Alguns cards lado a lado
  +-- Tabela legivel
  +-- Modal com max-width

Desktop (> 1024px)
  +-- 3 cards de metricas em linha
  +-- Tabela completa sem scroll
  +-- Modal centralizado
  +-- Hover para tooltips
```

---

## C.10 Mensagens de Erro Comuns

| Erro | Causa | Solucao |
|------|-------|---------|
| "Limite de 8 horas atingido" | Ja trabalhou 8h hoje | Finalize a sessao ativa ou espere o proximo dia |
| "Nao e possivel atribuir usuario" | Ultrapassaria 8h/dia | Reduza horas da tarefa ou atribua a outro usuario |
| "Sessao nao pode ser iniciada" | Validacao falhou | Verifique se tem horas disponiveis no dia |
| "Voce nao esta atribuido" | Sem atribuicao | Peca ao supervisor para ser atribuido |
| "Sessao ativa em outra tarefa" | Sessao aberta | Finalize (STOP) a outra sessao primeiro |
| "Dados nao atualizam" | Cache do navegador | Recarregue a pagina (F5) |

---

## C.11 Resumo Rapido

| Acao | Botao/Area | Resultado |
|------|-----------|-----------|
| Comecar | [PLAY] | Cronometro inicia |
| Pausar | [PAUSE] | Cronometro pausa, contador de pausa inicia |
| Continuar | [RESUME] | Cronometro continua (sem pular) |
| Finalizar | [STOP] | Sessao salva, aparece no historico |
| Ver detalhes sessao | Clique linha tabela | Modal com metricas completas |
| Ver horas dedicadas | Clique card | Modal com comparacao sugestao vs alocado |
| Ver grafico | Clique card progresso | Grafico de evolucao de horas |
| Atribuir usuario | [+ Atribuir] | Abre modal de selecao com input de horas |
| Editar horas usuario | [Editar] | Permite mudar compromisso de horas/dia |
| Remover usuario | [Remover] | Remove atribuicao da tarefa |
| Filtrar por periodo | [Todos] [Hoje] [Semana] [Mes] [Custom] | Mostra sessoes do periodo escolhido |
| Filtrar por usuario | Dropdown "Usuario" | Mostra apenas sessoes do usuario selecionado |
| Combinacao filtros | Periodo + Usuario | Mostra intersecao (ex: Joao na ultima semana) |

---

## C.12 Suporte

Se encontrar problemas:

1. **Verifique este manual** — a resposta pode estar aqui
2. **Recarregue a pagina** (F5) — soluciona muitos problemas
3. **Limpe o cache** — Ctrl+Shift+Delete
4. **Contate o gestor/desenvolvedor** — com prints e descricao do problema

---

**Manual do Sistema de Gestao de Projetos v2.0**
**Data:** 12/02/2026
**Total de capitulos:** 10
**Total de apendices:** 3
