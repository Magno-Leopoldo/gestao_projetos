# 🎯 GESTÃO DE PROJETOS DE ENGENHARIA
## Dashboard de Documentação - Visão Geral Completa

**Última Atualização:** 2026-02-05
**Status:** ✅ Em Desenvolvimento Ativo
**Versão:** 3.0

---

## 📑 ÍNDICE RÁPIDO

### 🚀 Início Rápido
- **Documentação Completa**: [CONSOLIDADO_VISAO_COMPLETA.md](CONSOLIDADO_VISAO_COMPLETA.md)
- **Arquitetura do Sistema**: [ARQUITETURA.md](ARQUITETURA.md)
- **Fluxos Principais**: [FLUXOS_PRINCIPAIS.md](FLUXOS_PRINCIPAIS.md)
- **Auditoria Completa**: [AUDITORIA_COMPLETA_2026.md](AUDITORIA_COMPLETA_2026.md)

### 🐛 Issues & Bugs
- **Issues Resolvidas**: [Bugs/MONITORAMENTO-ISSUES-IDENTIFICADAS.md](../Bugs/MONITORAMENTO-ISSUES-IDENTIFICADAS.md)

### 📋 Status de Features

| Feature | Status | Data | Observação |
|---------|--------|------|-----------|
| **Dashboard Principal** | ✅ Completo | 2026-01-30 | Login, Projects, Tarefas |
| **Monitoramento (9 Seções)** | ✅ Completo | 2026-02-05 | Supervisores, Equipe, Riscos, Histórico |
| **Validação 8h/dia** | 📋 Planejado | - | Atribuição (aviso), Start (bloqueio) |
| **Time Entries** | ✅ Funcional | - | Cronômetro, Pausar, Resumir |
| **Gerenciamento de Equipe** | ✅ Funcional | - | CRUD de usuários, papéis |

---

## 🏗️ ARQUITETURA

### Stack Tecnológico

**Frontend:**
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS 3.4.1
- 📊 Recharts (gráficos)
- 🔄 React Router 7.11
- 📡 Axios para HTTP

**Backend:**
- 🟢 Node.js + Express 4.18
- 🔐 JWT + bcrypt
- 🗄️ MySQL 8.0+
- ✔️ express-validator

**Database:**
- 🗄️ MySQL com utf8mb4
- 📊 ~15 tabelas principais
- 🔑 Relacionamentos estruturados

---

## 📊 ESTADO ATUAL DO PROJETO

### ✅ Funcionalidades Implementadas

#### Frontend (`project/src/components/`)
- ✅ **Login** - Autenticação com JWT
- ✅ **Dashboard** - Visão geral de projetos
- ✅ **ProjectsList** - Filtros e CRUD
- ✅ **ProjectDetails** - Kanban, Timeline
- ✅ **Monitoramento** - 9 seções de análise (NOVO)
  - Seção 1: Resumo executivo
  - Seção 2: Desempenho dos supervisores
  - Seção 3: Carga de trabalho da equipe
  - Seção 4: Histórico de atribuições
  - Seção 5: Evolução de conclusão
  - Seção 6: Tarefas em risco
  - Seção 7: Cronograma de entrega
  - Seção 8: Top tarefas
  - Seção 9: Distribuição de status

#### Backend (`backend/src/`)
- ✅ **Auth** - Login, JWT, validação
- ✅ **Projects** - CRUD completo
- ✅ **Tasks** - Stages, assignments, validação
- ✅ **Time Entries** - Cronômetro, sessões
- ✅ **Users** - Gerenciamento de equipe
- ✅ **Validações** - Daily hours, stage transitions

### 🔍 Bugs Resolvidos (2026-02-05)

#### Monitoramento - Issues Funcionais
| # | Issue | Solução | Commit |
|----|-------|---------|--------|
| 1 | Rating sem base | Removido sistema de estrelas | - |
| 2 | Active projects duplicado | Contador per-member | - |
| 3 | Botão Details | Removido | - |
| 4 | assigned_at não retornado | Adicionado em queries | `bcc3262` |
| 5 | Campo com nome errado | assignees_array | `546188c` |

#### useEffect Dependency Issues (Crítico)
| # | Componente | Problema | Solução | Commit |
|----|-----------|----------|---------|--------|
| 6 | Dashboard | Missing `profile` | Adicionado nas deps | `ce3a8ab` |
| 7 | Monitoring | Missing `supervisors` | Adicionado nas deps | `ce3a8ab` |
| 8 | AssignUsersModal | Missing `taskId` | Adicionado nas deps | `05de0ae` |
| 9 | TaskDetail | Missing múltiplos | Adicionado todos | `05de0ae` |

**Documentação Detalhada:** [Bugs/MONITORAMENTO-ISSUES-IDENTIFICADAS.md](../Bugs/MONITORAMENTO-ISSUES-IDENTIFICADAS.md)

---

## 📋 PRÓXIMAS PRIORIDADES

### 1️⃣ Validação Inteligente de 8h/dia (PLANEJADO)
**Plan:** [`cached-mixing-willow.md`](../../.claude/plans/cached-mixing-willow.md)

- 🔔 **Atribuição (Supervisor)**: Aviso mas permite > 8h
- ❌ **START Cronômetro (Usuário)**: Bloqueia se real + alocado > 8h

**Arquivos a modificar:**
- `backend/src/helpers/taskValidations.js` - Novas funções
- `backend/src/controllers/tasksController.js` - assignUsersToTask()
- `backend/src/controllers/timeEntriesController.js` - startTimeEntry()

### 2️⃣ Melhorias de UX
- [ ] Tratamento de supervisor "N/A"
- [ ] Paginação em listas grandes
- [ ] Filtros avançados

### 3️⃣ Testes & QA
- [ ] Testes unitários das validações
- [ ] Testes de integração API
- [ ] Testes end-to-end

---

## 🗄️ SCHEMA DO BANCO DE DADOS

**Tabelas Principais (15 total):**

```
users                    (id, email, password_hash, full_name, role)
projects                 (id, title, description, supervisor_id, status)
project_stages           (id, project_id, stage_name, task_count)
tasks                    (id, project_id, stage_id, title, status, priority)
task_assignments         (id, task_id, user_id, daily_hours, assigned_at)
time_entries_sessions    (id, task_id, user_id, started_at, ended_at, duration_hours)
project_supervisors      (id, project_id, supervisor_id)
... (+ 8 mais)
```

**Charset:** utf8mb4
**Collation:** utf8mb4_unicode_ci
**Init Script:** `database/init-mysql.sql`

---

## 🚀 QUICK START

### Setup Backend
```bash
cd backend
npm install
npm run dev  # Inicia em http://localhost:3000
```

### Setup Frontend
```bash
cd project
npm install
npm run dev  # Inicia em http://localhost:5173
```

### Database
```bash
# Importar schema
mysql -u root < database/init-mysql.sql
```

---

## 📝 METODOLOGIA DE DESENVOLVIMENTO

### Fluxo de Trabalho
1. 🔍 **Análise crítica** - Debug com console.logs quando necessário
2. 📖 **Leitura primeiro** - Ler código antes de sugerir mudanças
3. 🧪 **Teste local** - Validar antes de committar
4. 📚 **Documentação** - Atualizar MDs após cada mudança
5. 🔐 **Commit seguro** - Mensagens claras, sem force push

### Padrões de Commit
```
feat: Adicionar nova funcionalidade
fix: Corrigir bug específico
docs: Atualizar documentação
refactor: Reorganizar código sem mudança de behavior
```

---

## 📚 DOCUMENTOS RELACIONADOS

### Em `/Visão-Geral/`
- 📘 [CONSOLIDADO_VISAO_COMPLETA.md](CONSOLIDADO_VISAO_COMPLETA.md) - Documentação técnica completa
- 🏗️ [ARQUITETURA.md](ARQUITETURA.md) - Diagrama e decisões de arquitetura
- 🔄 [FLUXOS_PRINCIPAIS.md](FLUXOS_PRINCIPAIS.md) - Fluxos de dados e use cases
- 🔍 [AUDITORIA_COMPLETA_2026.md](AUDITORIA_COMPLETA_2026.md) - Auditoria inicial

### Em `/Bugs/`
- 🐛 [MONITORAMENTO-ISSUES-IDENTIFICADAS.md](../Bugs/MONITORAMENTO-ISSUES-IDENTIFICADAS.md) - Issues resolvidas

### Em `/Planejamento/`
- 📋 [Checklist de features](../Planejamento/)

### Em `/Manual/`
- 📖 [Documentação do usuário](../Manual/)

---

## 🔗 LINKS ÚTEIS

| Recurso | Link |
|---------|------|
| GitHub Issues | [/Bugs/](../Bugs/) |
| Planejamento | [/Planejamento/](../Planejamento/) |
| Manual do Usuário | [/Manual/](../Manual/) |
| Frontend Source | [/project/src/](../project/src/) |
| Backend Source | [/backend/src/](../backend/src/) |
| Database | [/database/](../database/) |

---

## ✍️ COMO USAR ESTE DOCUMENTO

1. **Primeira vez?** → Leia [CONSOLIDADO_VISAO_COMPLETA.md](CONSOLIDADO_VISAO_COMPLETA.md)
2. **Arquitetura?** → Veja [ARQUITETURA.md](ARQUITETURA.md)
3. **Fluxo de dados?** → Consulte [FLUXOS_PRINCIPAIS.md](FLUXOS_PRINCIPAIS.md)
4. **Issue específica?** → Busque em [Bugs/](../Bugs/)
5. **Setup/Deploy?** → Veja seção "Quick Start" acima

---

## 📞 PRÓXIMAS AÇÕES

- [ ] Implementar validação 8h/dia
- [ ] Atualizar componentes com validações novas
- [ ] Adicionar testes
- [ ] Deploy em staging

---

**Documentação atualizada:** 2026-02-05 14:30 UTC
**Mantenedor:** Claude Code
**Status:** Pronto para implementação das próximas features
