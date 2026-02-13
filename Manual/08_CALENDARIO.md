# Manual - Tela de Calendario

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Todos os usuarios autenticados

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Estrutura da Tela](#estrutura-da-tela)
3. [Visualizacoes (Dia, Semana, Mes)](#visualizacoes)
4. [Barra Lateral (Sidebar)](#barra-lateral)
5. [Criar Alocacao](#criar-alocacao)
6. [Criar Alocacao em Lote](#criar-alocacao-em-lote)
7. [Editar Alocacao](#editar-alocacao)
8. [Mover e Redimensionar](#mover-e-redimensionar)
9. [Arrastar da Sidebar](#arrastar-da-sidebar)
10. [Remover Alocacoes](#remover-alocacoes)
11. [Notas e Anotacoes](#notas-e-anotacoes)
12. [Visualizar Calendario de Outros](#visualizar-calendario-de-outros)
13. [Admin Gerenciando Calendarios](#admin-gerenciando-calendarios)
14. [Slider de Horario](#slider-de-horario)

---

## Visao Geral

O Calendario permite organizar o tempo de trabalho de forma visual, estilo Outlook. Cada usuario aloca blocos de tempo para suas tarefas, criando um planejamento diario/semanal.

Funcionalidades principais:
- Alocar blocos de tempo para tarefas
- Visualizar a organizacao do dia/semana/mes
- Arrastar tarefas da sidebar para o calendario
- Mover e redimensionar blocos existentes
- Criar alocacoes em lote (varios dias)
- Admin pode gerenciar calendario de qualquer usuario

---

## Estrutura da Tela

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

## Visualizacoes

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

## Barra Lateral (Sidebar)

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
● Alta  - 20h est.  ● Media  - 8h est.
```

- Cada card mostra: titulo, projeto, prioridade, horas estimadas
- **Ponto colorido:** indica prioridade (vermelho=alta, azul=media, cinza=baixa)
- Cards sao **arrastáveis** para o calendario
- Busca: campo de busca para filtrar tarefas por nome/projeto

### Regra de exibicao
- Uma tarefa **desaparece** da sidebar assim que tiver **qualquer alocacao** no calendario
- Se todas as alocacoes forem removidas, a tarefa volta a aparecer

---

## Criar Alocacao

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

## Criar Alocacao em Lote

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

## Editar Alocacao

1. Clique no bloco de alocacao no calendario
2. O modal de edicao abre com os dados atuais
3. Altere: data, horario, notas
4. Clique em **"Atualizar"**

**Nota:** A tarefa nao pode ser alterada na edicao, apenas data, horario e notas.

---

## Mover e Redimensionar

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

## Remover Alocacoes

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

## Notas e Anotacoes

### Onde adicionar
- No modal de criacao ou edicao, campo **"Notas"**
- Texto livre para observacoes sobre aquela alocacao

### Onde visualizar
As notas aparecem em dois lugares:

1. **No bloco do calendario:** Texto em italico abaixo do horario (quando o bloco tem espaco)
2. **Tooltip:** Passe o mouse sobre o bloco para ver todas as informacoes incluindo notas completas

---

## Visualizar Calendario de Outros

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

## Admin Gerenciando Calendarios

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

## Slider de Horario

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
