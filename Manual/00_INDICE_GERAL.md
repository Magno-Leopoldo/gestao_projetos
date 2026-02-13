# Manual do Sistema de Gestao de Projetos

**Versao:** 2.0
**Data:** 12/02/2026
**Sistema:** Gestao de Projetos de Engenharia

---

## Indice de Telas

| # | Tela | Arquivo | Acesso |
|---|------|---------|--------|
| 1 | Login e Cadastro | `01_LOGIN.md` | Todos |
| 2 | Dashboard | `02_DASHBOARD.md` | Supervisor, Admin |
| 3 | Projetos | `03_PROJETOS.md` | Todos |
| 4 | Etapas do Projeto | `04_ETAPAS.md` | Todos |
| 5 | Tarefas | `05_TAREFAS.md` | Todos |
| 6 | Detalhe da Tarefa | `06_DETALHE_TAREFA.md` | Todos |
| 7 | Kanban | `07_KANBAN.md` | Supervisor, Admin |
| 8 | Calendario | `08_CALENDARIO.md` | Todos |
| 9 | Monitoramento | `09_MONITORAMENTO.md` | Admin |
| 10 | Configuracoes | `10_CONFIGURACOES.md` | Admin |

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
