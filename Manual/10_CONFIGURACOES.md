# Manual - Tela de Configuracoes (Gerenciamento de Usuarios)

**Versao:** 2.0
**Data:** 12/02/2026
**Acesso:** Apenas Administrador

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Lista de Usuarios](#lista-de-usuarios)
3. [Alterar Perfil do Usuario](#alterar-perfil-do-usuario)
4. [Ativar e Desativar Usuario](#ativar-e-desativar-usuario)
5. [Redefinir Senha](#redefinir-senha)
6. [Busca de Usuarios](#busca-de-usuarios)

---

## Visao Geral

A tela de Configuracoes permite ao administrador gerenciar todos os usuarios do sistema. Aqui e possivel:

- Visualizar todos os usuarios cadastrados
- Alterar o perfil (role) de um usuario
- Ativar ou desativar contas
- Redefinir senhas

---

## Lista de Usuarios

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

## Alterar Perfil do Usuario

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

## Ativar e Desativar Usuario

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

## Redefinir Senha

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

## Busca de Usuarios

### Como buscar
- No topo da tela, use o campo de busca
- Busca por **nome** ou **email**
- Resultados filtrados em tempo real

### Exemplo
Digitar "maria" filtra:
- Maria Santos (maria@teste.com)
- Mariana Costa (mariana@teste.com)

---

## Notificacoes

Apos cada acao (alterar perfil, ativar/desativar, redefinir senha):
- Uma mensagem de **sucesso** (verde) ou **erro** (vermelho) aparece no topo
- A mensagem desaparece automaticamente apos 4 segundos

---

## Dicas para Administradores

1. **Novos usuarios** sao criados com perfil "Usuario" por padrao no cadastro
2. **Promova para Supervisor** quem vai liderar projetos
3. **Desative** contas de pessoas que sairam da equipe (nao exclua, para manter historico)
4. **Redefina senhas** quando solicitado — oriente o usuario a trocar depois
5. Use a **busca** para encontrar usuarios rapidamente em equipes grandes
