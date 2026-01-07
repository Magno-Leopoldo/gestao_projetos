# Sistema de Gestão de Projetos de Engenharia

Sistema web moderno inspirado no Microsoft To Do, porém focado em projetos técnicos e controle de capacidade humana.

## Funcionalidades

### Perfis de Usuário
- **User (Engenheiro/Técnico)**: Visualiza e gerencia apenas seus projetos e tarefas atribuídas
- **Supervisor**: Gerencia projetos, visualiza dashboard e kanban
- **Admin**: Acesso completo incluindo monitoramento de desempenho

### Telas Implementadas

#### 1. Dashboard (Supervisor/Admin)
- Cards com métricas principais:
  - Projetos em aberto
  - Projetos em risco de atraso
  - Usuários ativos
  - Tarefas em "Refaça" (com destaque visual)
- Gráficos de distribuição de status
- Lista de tarefas recentes

#### 2. Kanban (Supervisor/Admin)
- Colunas fixas:
  - Novo
  - Em Desenvolvimento
  - Análise Técnica
  - Concluído
  - Refaça (com destaque visual forte)
- Drag and drop funcional para movimentação de tarefas
- Visualização de atribuições e estimativas

#### 3. Projetos (Todos os perfis)
- Estrutura em cascata expansível:
  - Projeto → Etapas → Tarefas
- Informações detalhadas por tarefa:
  - Horas estimadas
  - Horas diárias dedicadas
  - Status com código de cores
  - Responsáveis atribuídos
- Usuários veem apenas projetos atribuídos

#### 4. Monitoramento (Admin)
- Ranking de desempenho por engenheiro
- Métricas de supervisores
- Indicadores visuais de gargalos:
  - Tarefas em refaça
  - Usuários com baixo desempenho
  - Sobrecarga de trabalho

## Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Backend**: Supabase (Database + Auth)
- **Autenticação**: Supabase Auth com email/senha

## Configuração

1. Configure as variáveis de ambiente no arquivo `.env`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

2. O schema do banco de dados já foi aplicado e inclui:
   - Tabelas: profiles, projects, project_stages, tasks, task_assignments, time_entries
   - Row Level Security (RLS) configurado para todos os perfis
   - Índices para otimização de performance

3. Execute o projeto:
```bash
npm install
npm run dev
```

## Estrutura do Banco de Dados

### profiles
- Armazena informações dos usuários com seus perfis (user, supervisor, admin)
- Criado automaticamente após signup

### projects
- Projetos gerenciados pelos supervisores
- Incluem datas, status e descrição

### project_stages
- Etapas dentro de cada projeto
- Ordem configurável

### tasks
- Tarefas dentro de cada etapa
- Status: novo, em_desenvolvimento, analise_tecnica, concluido, refaca
- Horas estimadas e horas diárias
- Prioridade

### task_assignments
- Atribuição de múltiplos usuários a tarefas

### time_entries
- Registro de horas trabalhadas por usuário em cada tarefa

## Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Usuários só acessam dados aos quais têm permissão
- Políticas específicas por perfil
- Autenticação segura via Supabase

## Design

- Interface limpa e profissional
- Destaque visual para atrasos e status "Refaça"
- Visual corporativo e moderno
- Responsivo e otimizado para produtividade
- Código de cores intuitivo para status
