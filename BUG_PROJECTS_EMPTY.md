# BUG: Tela de Projetos Vazia

**Data:** 2026-01-05
**Status:** 🔴 ABERTO
**Prioridade:** 🔴 CRÍTICA
**Afetado:** `ProjectsList.tsx`

---

## 📋 Descrição do Problema

A tela de **Projetos** (`http://localhost:5173/projects`) **não exibe nenhum dado** mesmo com:
- ✅ Dados inseridos no banco de dados (`projeto_engenharia.projects`)
- ✅ Backend rodando corretamente (`http://localhost:3000/api`)
- ✅ Dashboard e Kanban funcionando corretamente
- ✅ API respondendo corretamente (logs mostram `GET /api/projects`)

### 🔍 Comportamento Esperado
```
GET http://localhost:5173/projects
↓
Requisição: GET /api/projects
↓
Resposta: { success: true, data: [ { id: 1, name: "E-commerce Platform", ... } ] }
↓
Renderização: Grid com cards dos projetos
```

### 🐛 Comportamento Atual
```
GET http://localhost:5173/projects
↓
Requisição: GET /api/projects ✅ (sucesso)
↓
Resposta: { success: true, data: [ ... ] } ✅
↓
Renderização: ❌ VAZIO - Nenhum projeto aparece
```

---

## 📊 Dados no Banco

```sql
SELECT * FROM projects;
```

| ID | Name | Description | Status | Supervisor |
|---|---|---|---|---|
| 1 | E-commerce Platform | Plataforma de vendas online | active | 1 |

✅ **Dados existem no banco**

---

## 🔗 Fluxo de Dados

```
ProjectsList.tsx
    ↓
projectsService.getAll()
    ↓
apiClient.get('/projects')
    ↓
Axios -> http://localhost:3000/api/projects
    ↓
Backend (projectController.getAll)
    ↓
Response: { success: true, data: [...] }
    ↓
setProjects(result.data)  ❌ AQUI ALGO DÁ ERRADO
    ↓
render() -> projects.map() -> <div>...</div>
```

---

## 🧪 Análise Técnica

### 1️⃣ Serviço vs Componente - INCONSISTÊNCIA ENCONTRADA

#### projectsService.getAll() (funcionando corretamente)
**Arquivo:** `project/src/services/projectsService.ts`

```typescript
async getAll(params?: { status?: string; search?: string; include?: string }) {
  const response = await apiClient.get('/projects', { params });
  return response.data.data;  // ✅ Retorna response.data.data
}
```

#### ProjectsList.tsx (usando incorretamente)
**Arquivo:** `project/src/components/ProjectsList.tsx` (linhas 28-29)

```typescript
const result = await projectsService.getAll();
setProjects(result.data || []);  // ❌ ERRO: result já é os dados, não tem .data
```

**O PROBLEMA:**
- `projectsService.getAll()` retorna `response.data.data` (array de projetos)
- `ProjectsList.tsx` tenta acessar `result.data` (acessando `.data` novamente)
- Resultado: `result.data` é `undefined` → `setProjects([])` → tela vazia

---

### 2️⃣ Comparação com Dashboard (que funciona)

#### Dashboard.tsx (linhas 30-35)
```typescript
async function loadDashboardData() {
  try {
    const data = await dashboardService.getStats();  // Retorna response.data.data

    setStats({
      openProjects: data.open_projects,  // ✅ Acesso direto aos dados
      atRiskProjects: data.at_risk_projects,
      // ...
    });
```

**Dashboard funciona porque:**
- Chama `dashboardService.getStats()`
- Que retorna `response.data.data`
- E usa diretamente sem tentar acessar `.data` novamente

#### ProjectsList.tsx (que não funciona)
```typescript
const result = await projectsService.getAll();
setProjects(result.data || []);  // ❌ Tentando acessar .data que não existe
```

**ProjectsList não funciona porque:**
- Chama `projectsService.getAll()`
- Que retorna `response.data.data`
- E tenta acessar `result.data` (não existe)
- Resultado: `undefined` → array vazio

---

### 3️⃣ Comparação com Kanban (inconsistência similar)

#### tasksService.getAll() (inconsistente)
**Arquivo:** `project/src/services/tasksService.ts` (linhas 5-7)

```typescript
async getAll() {
  const response = await apiClient.get('/tasks');
  return response.data;  // ❌ DIFERENTE: retorna response.data (não response.data.data)
}
```

#### Kanban.tsx (usando incorretamente)
**Arquivo:** `project/src/components/Kanban.tsx` (linhas 35-40)

```typescript
async function loadTasks() {
  try {
    const response = await tasksService.getAll();
    const tasksData = response.data || [];  // ❌ response já é response.data
    setTasks(tasksData);
```

**Status:**
- `tasksService.getAll()` retorna `response.data`
- `Kanban.tsx` tenta acessar `response.data` novamente
- Resultado: `tasksData` é `undefined` ou inválido

---

## 🎯 Raiz do Problema

### Inconsistência no Padrão de Retorno

| Serviço | Retorna | Local |
|---------|---------|-------|
| `dashboardService.getStats()` | `response.data.data` ✅ | dashboardService.ts:7 |
| `projectsService.getAll()` | `response.data.data` ✅ | projectsService.ts:7 |
| **`tasksService.getAll()`** | **`response.data`** ❌ | tasksService.ts:6 |

### E no Componente

| Componente | Acesso | Esperado | Real | Status |
|-----------|--------|----------|------|--------|
| Dashboard | `data.open_projects` | `response.data.data` | `response.data.data` | ✅ OK |
| ProjectsList | `result.data` | `response.data` | `response.data.data` | ❌ ERRO |
| Kanban | `response.data` | `response.data` | `response.data` | ❌ ERRO |

---

## 🔧 Soluções Possíveis

### ❌ OPÇÃO 1: Mudar ProjectsList (Quick Fix - Não Recomendado)

```typescript
// ANTES (linhas 28-29)
const result = await projectsService.getAll();
setProjects(result.data || []);

// DEPOIS
const result = await projectsService.getAll();
setProjects(result || []);  // Remove o .data
```

**Problema:** Apenas máscara o problema real

---

### ✅ OPÇÃO 2: Corrigir tasksService (Recomendado)

**Arquivo:** `project/src/services/tasksService.ts` (linhas 5-7)

```typescript
// ANTES
async getAll() {
  const response = await apiClient.get('/tasks');
  return response.data;  // ❌ INCONSISTENTE
}

// DEPOIS
async getAll() {
  const response = await apiClient.get('/tasks');
  return response.data.data;  // ✅ CONSISTENTE com outros serviços
}
```

**Vantagem:** Padroniza todos os serviços

**Depois disso, corrigir Kanban:**

```typescript
// ANTES (linha 38)
const tasksData = response.data || [];

// DEPOIS
const tasksData = response || [];  // Remove o .data
```

---

### ✅ OPÇÃO 3: Corrigir Ambos (Melhor Solução)

1. **Corrigir tasksService.getAll()** para retornar `response.data.data`
2. **Corrigir ProjectsList** para usar `result` direto
3. **Corrigir Kanban** para usar `response` direto
4. **Documentar padrão:** Todos os serviços devem retornar `response.data.data`

---

## 📝 Checklist de Verificação

- [ ] Verificar resposta da API `/api/projects` no Postman ou DevTools
- [ ] Confirmar que `response.data.data` contém os dados
- [ ] Verificar logs do console no navegador (ProjectsList)
- [ ] Adicionar `console.log(result)` em ProjectsList para ver o valor real
- [ ] Verificar se há filtros/permissões impedindo os dados

---

## 🧬 Teste de Reprodução

### Pré-requisito
```bash
# 1. Backend rodando
curl http://localhost:3000/api/projects

# 2. Resposta esperada
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "E-commerce Platform",
      "description": "...",
      "status": "active",
      ...
    }
  ]
}

# 3. Frontend acessível
http://localhost:5173/projects
```

### Passo a Passo para Reproduzir

1. Abrir DevTools (F12)
2. Ir para **Network**
3. Acessar `http://localhost:5173/projects`
4. Procurar requisição `projects` (GET)
5. Ver se o status é 200
6. Clicar na requisição e ver **Response**
7. Verificar se contém dados
8. Ir para **Console** do DevTools
9. Ver logs ou erros

### O que Esperar
```
✅ Status 200
✅ Response com { success: true, data: [...] }
❌ Tela vazia (BUG)
```

---

## 📌 Próximos Passos

1. **Implementar a correção** (Opção 3 recomendada)
2. **Testar ProjectsList** - deve mostrar projetos
3. **Testar Kanban** - deve mostrar tarefas
4. **Testar Dashboard** - deve continuar funcionando
5. **Padronizar padrão de retorno** em todos os serviços

---

## 📚 Referências

- **tasksService.ts:** `project/src/services/tasksService.ts`
- **projectsService.ts:** `project/src/services/projectsService.ts`
- **dashboardService.ts:** `project/src/services/dashboardService.ts`
- **ProjectsList.tsx:** `project/src/components/ProjectsList.tsx`
- **Kanban.tsx:** `project/src/components/Kanban.tsx`
- **Dashboard.tsx:** `project/src/components/Dashboard.tsx`

---

## 🔗 Discussão

**Por que Dashboard funciona e ProjectsList não?**

Porque Dashboard **acessa os dados corretamente**:
```typescript
const data = await dashboardService.getStats();  // Retorna response.data.data
setStats({
  openProjects: data.open_projects,  // ✅ Acessa a propriedade direto
```

Enquanto ProjectsList **tenta acessar .data novamente**:
```typescript
const result = await projectsService.getAll();  // Retorna response.data.data
setProjects(result.data || []);  // ❌ Tenta acessar result.data que não existe
```
