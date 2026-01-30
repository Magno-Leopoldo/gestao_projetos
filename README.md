# Sistema de Gestão de Projetos de Engenharia

Um sistema completo e moderno para gerenciar projetos de engenharia, com controle de tarefas, usuários, equipes e acompanhamento de progresso.

## 📋 Características

- ✅ **Gerenciamento de Tarefas** - Criar, editar e organizar tarefas com dependências
- 👥 **Gestão de Usuários e Equipes** - Controle de acesso e atribuição de responsáveis
- 📊 **Dashboard com Gráficos** - Visualizar dados em tempo real com recharts
- 🔐 **Autenticação Segura** - JWT para controle de sessão
- 📱 **Interface Responsiva** - Design moderno com Tailwind CSS
- 🗂️ **Filtros e Buscas** - Busca avançada na lista de tarefas
- 📚 **Manual do Usuário** - Documentação completa da aplicação

## 🏗️ Arquitetura

```
dev_engenharia/
├── project/              # Frontend - React + TypeScript + Vite
├── backend/              # API REST - Node.js + Express
├── database/             # Scripts de banco de dados
├── Manual/               # Documentação e manual do usuário
└── Planejamento/         # Arquivos de planejamento do projeto
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js (v16 ou superior)
- MySQL (v8 ou superior)
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm run dev
```

A API estará disponível em `http://localhost:3000`

### Frontend

```bash
cd project
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📦 Tecnologias Utilizadas

### Frontend
- **React** 18.3.1 - Interface de usuário
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool rápido
- **Tailwind CSS** - Estilização utilitária
- **React Router** - Navegação
- **Recharts** - Gráficos e visualizações
- **Axios** - Cliente HTTP
- **Supabase** - Backend como serviço
- **Lucide React** - Ícones

### Backend
- **Express** - Framework web
- **MySQL2** - Driver MySQL
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **CORS** - Controle de origem
- **Express Validator** - Validação de dados

## 🔑 Variáveis de Ambiente

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=gestao_projetos
JWT_SECRET=sua_chave_secreta
PORT=3000
```

### Frontend (.env)
```
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
VITE_API_URL=http://localhost:3000
```

## 📚 Documentação

- `Manual/` - Manual completo do usuário com screenshots
- `Visão-Geral/` - Visão geral do sistema
- `Planejamento/` - Documentação de workflows e planejamento

## 🐛 Bugs Conhecidos

Consulte a pasta `Bugs/` para problemas registrados e em análise.

## 📝 Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run lint` - Executa ESLint
- `npm run preview` - Preview do build de produção
- `npm run typecheck` - Verifica tipos TypeScript

### Backend
- `npm run start` - Inicia o servidor
- `npm run dev` - Inicia com auto-reload

## 🔄 Fluxo de Trabalho

O sistema segue um fluxo completo:
1. Criar projetos e tarefas
2. Atribuir responsáveis
3. Gerenciar dependências entre tarefas
4. Acompanhar progresso em tempo real
5. Gerar relatórios e análises

## 🤝 Contribuindo

As mudanças são sincronizadas automaticamente com o repositório remoto.

## 📄 Licença

ISC

---

**Última atualização**: Janeiro de 2025
