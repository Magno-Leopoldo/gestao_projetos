# ✅ RESOLVIDO: Tooltip piscando no modal de criação de tarefas

**Data de Resolução:** 08/01/2026
**Componente:** `CreateTaskModal.tsx`
**Gravidade:** 🟡 Média
**Status:** ✅ RESOLVIDO

---

## 📋 O Problema

Quando o usuário passava o mouse sobre o ícone de ajuda (HelpCircle) nos campos de "Horas Estimadas" e "Horas/Dia", o tooltip **piscava constantemente** como se estivesse recebendo múltiplos cliques:

❌ **Comportamento Indesejado:**
- Tooltip aparece → desaparece → aparece → desaparece
- Efeito de piscar contínuo e irritante
- Impossível ler a mensagem de ajuda

✅ **Comportamento Desejado:**
- Tooltip permanece visível enquanto o mouse está sobre o ícone
- Desaparece apenas quando o mouse sai

---

## 🔍 Análise

### Root Cause

O problema era causado pela **estrutura de eventos do React**:

```jsx
// ❌ PROBLEMA: Eventos nos elementos filhos
<div className="relative inline-block" ref={triggerRef}>
  <div
    onMouseEnter={handleMouseEnter}  // ← Evento aqui
    onMouseLeave={() => setShowTooltip(false)}  // ← E aqui
    className="cursor-help inline-flex"
  >
    {children}
  </div>
  {showTooltip && (
    <div className="fixed z-50 ...">  // ← Tooltip em position: fixed
      {content}
    </div>
  )}
</div>
```

**O que acontecia:**
1. Mouse entra no `<div>` filho → `mouseEnter` → mostra tooltip
2. Tooltip usa `position: fixed`, então não interfere com o layout
3. Quando o tooltip é renderizado, o React re-renderiza
4. Durante a re-renderização, o mouse pode sair do elemento filho
5. `mouseLeave` é disparado → esconde tooltip
6. Tooltip desaparece → mouse está sobre o elemento filho novamente
7. `mouseEnter` dispara de novo → loop infinito!

### Sintomas
- Piscar contínuo a cada ~100-200ms
- Impossível ler o conteúdo do tooltip
- Event listeners disparando repetidamente

---

## ✨ Solução Implementada

### Mudança no Código

Mover os eventos do elemento **filho** para o elemento **pai** (container):

```jsx
// ✅ SOLUÇÃO: Eventos no container pai
<div
  className="relative inline-block"
  ref={triggerRef}
  onMouseEnter={handleMouseEnter}  // ← Eventos aqui!
  onMouseLeave={() => setShowTooltip(false)}
>
  <div className="cursor-help inline-flex">
    {children}
  </div>
  {showTooltip && (
    <div className="fixed z-50 ...">
      {content}
    </div>
  )}
</div>
```

**Por que funciona:**
- Os eventos agora estão no container pai
- O container permanece estável e não muda quando o tooltip aparece
- Não há interferência entre o posicionamento `fixed` do tooltip e os eventos do trigger
- `mouseLeave` só dispara quando o mouse sai do container inteiro, não do elemento filho

---

## 🧪 Teste

### Como Reproduzir (Antes da fix)
1. Abra um projeto e clique em "+ Criar Nova Tarefa"
2. Passe o mouse sobre o ícone de ajuda em **"Horas Estimadas"**
3. Observe o tooltip **piscando rapidamente**
4. ❌ Impossível ler a mensagem

### Como Verificar (Depois da fix)
1. Mesmos passos acima
2. Passe o mouse sobre o ícone em **"Horas Estimadas"**
3. ✅ Tooltip aparece **estável e fixo**
4. ✅ Mensagem fica visível enquanto o mouse está sobre o ícone
5. Tooltip desaparece apenas ao remover o mouse
6. Repita com **"Horas/Dia"** - mesmo comportamento ✅

---

## 📊 Detalhes Técnicos

| Aspecto | Antes | Depois |
|--------|-------|--------|
| Eventos | No elemento filho | No container pai |
| Comportamento | Pisca constantemente | Estável e fixo |
| Root Cause | Re-renderização causa mouseLeave involuntário | Nenhuma interferência entre eventos e renderização |
| Posicionamento | Já era `fixed` | Mantém `fixed` |

---

## 🔧 Commits Relacionados

```bash
COMMIT AQUI
```

---

## 💡 Lições Aprendidas

1. **Event Bubbling com Position Fixed:** Cuidado ao colocar eventos em elementos filhos quando há elementos `position: fixed` dentro deles
2. **React Re-render Timing:** Re-renderizações podem disparar eventos involuntários se os event listeners estão em elementos que mudaram
3. **Container Pattern:** Sempre coloque eventos no container pai quando há conteúdo dinâmico (como tooltips) dentro
4. **Testing UX:** Piscar/flicker é um sinal de que há loops de eventos - sempre testa ao hover em elementos interativos

---

## ✅ Validação

- [x] Tooltip não pisca ao passar mouse em "Horas Estimadas"
- [x] Tooltip não pisca ao passar mouse em "Horas/Dia"
- [x] Tooltip permanece visível enquanto mouse está sobre ícone
- [x] Tooltip desaparece ao remover o mouse
- [x] Mensagem de ajuda é legível
- [x] Funciona em ambos os campos (esquerda e direita)
- [x] Funciona com tooltip em position fixed

---

**Resolvido em:** 08/01/2026 ✅
**Prioridade:** 🟡 Média → ✅ Concluída
**Teste Validado:** Sim
