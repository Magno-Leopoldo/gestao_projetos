# 📊 Guia de Uso - Gráfico de Evolução das Horas

## O que é?

O **Gráfico de Evolução das Horas** é uma ferramenta visual que mostra como o tempo foi gasto em uma tarefa ao longo dos dias. Compare o que foi planejado com o que realmente foi trabalhado através de um gráfico interativo.

---

## Como Acessar

1. Abra uma **Tarefa** na tela de Detalhes
2. Procure pelo card **"Progresso"** que mostra a porcentagem (ex: 45%)
3. **Clique no card** para abrir o gráfico
4. Um modal grande com o gráfico será exibido

```
┌────────────────────────────────────────────┐
│                  TAREFA                    │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │   Progresso: 45%  ← Clique aqui      │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

---

## Entendendo o Gráfico

### As Duas Linhas

**Linha Azul (sólida)**
- Representa as **horas reais** que você/sua equipe trabalhou
- Varia de dia para dia conforme o tempo dedicado
- Exemplo: Segunda 4h, Terça 6h, Quarta 3h

**Linha Verde (tracejada)**
- Representa as **horas sugeridas** para a tarefa
- É uma reta constante (não varia)
- Mostra quanto de tempo foi estimado por dia
- Exemplo: 8 horas por dia

### Comparação Rápida

```
Se a linha azul está acima da verde:
  → Você trabalhou MAIS que o previsto

Se a linha azul está abaixo da verde:
  → Você trabalhou MENOS que o previsto

Se as linhas se cruzam:
  → Às vezes acima, às vezes abaixo (variável)
```

---

## Filtros - Como Usar

### 1️⃣ Filtro de Período

Escolha qual período quer visualizar:

| Período | O que mostra | Exemplo |
|---------|-------------|---------|
| **Todos** | Histórico completo desde o início | Toda a evolução da tarefa |
| **Hoje** | Apenas o dia de hoje | Trabalho de hoje |
| **Semana** | Últimos 7 dias | Trabalho desta semana |
| **Mês** | Últimos 30 dias | Trabalho deste mês |
| **Customizado** | Data inicial até data final | De 01/01 até 15/01 |

### 2️⃣ Filtro de Usuário

Se a tarefa tem **múltiplos usuários atribuídos**:

**Todos**
- Mostra a **soma total** de todas as horas trabalhadas por todos
- Útil para ver o esforço total do time

**[Nome do Usuário específico]**
- Mostra apenas as horas trabalhadas por aquela pessoa
- Útil para acompanhar contribuição individual

### 3️⃣ Filtro de Data (Customizado)

Quando seleciona "Customizado":

1. Clique no campo **"De:"** e selecione a data inicial
2. Clique no campo **"Até:"** e selecione a data final
3. O gráfico atualiza automaticamente com o período escolhido

---

## Entendo as Estatísticas

Acima do gráfico há 4 cards com números importantes:

### 📅 Dias (azul)
```
Quantidade de dias diferentes em que houve registro de tempo

Exemplo: 10 dias
Significa: Trabalho foi feito em 10 dias diferentes
```

### ⏱️ Total (verde)
```
Soma total de todas as horas trabalhadas no período

Exemplo: 52 horas
Significa: Foram 52 horas de trabalho no total
```

### 📊 Média (roxo)
```
Quantas horas por dia em média

Fórmula: Total ÷ Dias

Exemplo: 52h ÷ 10 dias = 5,2 horas/dia
```

### 📈 Máximo (laranja)
```
O maior número de horas em um único dia

Exemplo: 8 horas
Significa: O dia mais produtivo teve 8 horas de trabalho
```

---

## Exemplo Prático

### Cenário
Uma tarefa estimada em **8 horas por dia** com **2 pessoas** trabalhando nela.

### Passo 1: Visualize o histórico completo
- Filtro: "Todos"
- Usuário: "Todos"
- Resultado: Gráfico mostra toda evolução

```
Horas
  ↑
  16│
  14│      ╱╲
  12│    ╱  │  ╱╲
  10│  ╱    ╲│ ╱  ╲──────
   8├─────────────────── (Sugestão)
   6│
   4│
   2│
   0└────────────────→ Dias
```

### Passo 2: Veja contribuição do João
- Filtro: Período = "Semana"
- Usuário: "João Silva"
- Resultado: Apenas horas do João nos últimos 7 dias

### Passo 3: Analise um período específico
- Filtro: "Customizado"
- De: 01/01/2026
- Até: 15/01/2026
- Resultado: Gráfico mostra apenas o período de 15 dias

---

## Dicas & Truques

### ✨ Dica 1: Passar o Mouse no Gráfico
```
Passe o mouse sobre qualquer ponto azul no gráfico
→ Aparece um tooltip mostrando:
  - Data exata
  - Horas trabalhadas naquele dia
  - Horas sugeridas (comparação)
```

### ✨ Dica 2: Analisar Tendências
```
Observando a linha azul:
- Se sobe gradualmente → Produtividade aumentando ✅
- Se cai no final → Possível desânimo ou mudança de prioridade ⚠️
- Se fica oscilante → Variação no ritmo de trabalho
```

### ✨ Dica 3: Comparar Dois Usuários
```
1. Abra o gráfico com "Todos" os usuários
2. Veja a curva geral
3. Mude o filtro para "Usuário A" e veja o padrão
4. Depois mude para "Usuário B"
→ Compare os dois comportamentos mentalmente
```

### ✨ Dica 4: Detectar Atrasos
```
Se a linha azul está consistentemente ABAIXO da verde:
→ A tarefa pode estar atrasada
→ Considere aumentar alocação ou revisar estimativa
```

### ✨ Dica 5: Mobile-Friendly
```
O gráfico funciona em celular:
- Filtros ficam em uma coluna
- Gráfico redimensiona automaticamente
- Toque para ver tooltips (não hover)
```

---

## Casos de Uso Comuns

### 📋 Caso 1: Acompanhar Progresso Diário

**Objetivo**: Verificar se está no caminho certo

**Passos**:
1. Filtro: "Hoje"
2. Usuário: Seu próprio nome
3. Compare suas horas com a sugestão
4. Veja se precisa trabalhar mais ou menos

---

### 📋 Caso 2: Revisar Semana de Trabalho

**Objetivo**: Fazer retrospectiva semanal

**Passos**:
1. Filtro: "Semana"
2. Usuário: "Todos"
3. Veja quem trabalhou quanto
4. Identifique dias de pico e vale

---

### 📋 Caso 3: Preparar Relatório

**Objetivo**: Gerar dados para apresentação

**Passos**:
1. Filtro: "Customizado" com datas do período
2. Usuário: Dependendo do relatório (um ou todos)
3. Note as estatísticas (Total, Média, Máximo)
4. Use esses números no relatório

---

### 📋 Caso 4: Validar Estimativas

**Objetivo**: Checar se as estimativas estão realistas

**Passos**:
1. Filtro: "Todos"
2. Usuário: "Todos"
3. Compare a tendência da linha azul com a verde
4. Se consistentemente diferente, revisar estimativa

---

## Entendendo as Cores

| Cor | Significado | Elemento |
|-----|------------|----------|
| 🔵 Azul | Trabalho real, o que foi feito | Linha sólida |
| 🟢 Verde | Meta, o que foi planejado | Linha tracejada |
| 🟣 Roxo | Informação secundária | Cards de estatísticas |
| 🟠 Laranja | Destaque importante | Cards de máximo |

---

## Legenda Visual

Embaixo do gráfico há uma legenda explicando:

```
🔵 Linha Azul: Horas reais trabalhadas por dia
🟢 Linha Verde: Horas sugeridas (8.00h)
```

Sempre consulte se tiver dúvida sobre o que as linhas significam.

---

## Perguntas Frequentes

### P: Por que não vejo dados?
**R:**
- Verifique se há sessões de tempo finalizadas nesse período
- Tente selecionar o filtro "Todos" em vez de um período específico
- Se nenhuma sessão foi iniciada, o gráfico fica vazio

### P: Posso exportar o gráfico?
**R:** Atualmente, você pode fazer screenshot. Recursos de exportação (PNG/PDF) podem vir em atualizações futuras.

### P: O gráfico atualiza em tempo real?
**R:** Não. Os dados são carregados ao abrir o modal. Feche e abra novamente para atualizar com novos registros.

### P: Posso comparar duas datas ao mesmo tempo?
**R:** Não diretamente, mas você pode:
1. Anotar os números do primeiro período
2. Trocar os filtros para o segundo período
3. Comparar mentalmente ou em um papel

### P: A "Sugestão" é obrigatória?
**R:** Não. Se a tarefa não tiver horas sugeridas, a linha não aparece. Se aparecer zerada, a tarefa não tem estimativa.

### P: Consigo ver histórico de meses anteriores?
**R:** Sim! Use o filtro "Todos" para ver todo o histórico desde o início, ou "Customizado" para um período específico.

---

## Boas Práticas

### ✅ Faça

- Abra o gráfico regularmente para acompanhar progresso
- Use filtros para análises mais profundas
- Compare suas horas com a sugestão
- Ajuste estimativas baseado em tendências reais

### ❌ Evite

- Não confie 100% em um dia só (pode ser anomalia)
- Não copie a tendência do gráfico para outros sem contexto
- Não ignore a linha verde (sugestão)
- Não presuma que mais horas = mais produtividade

---

## Atalhos & Navegação

| Ação | Como fazer |
|------|-----------|
| Abrir gráfico | Clique no card "Progresso" |
| Fechar gráfico | Clique em "Fechar" ou X no topo |
| Trocar período | Clique em outro botão de período |
| Trocar usuário | Use o dropdown "Usuário" |
| Mudar data customizada | Clique nos campos de data |
| Ver mais detalhes | Passe mouse sobre pontos no gráfico |

---

## Suporte

Se o gráfico não funcionar:
1. Atualize a página (F5)
2. Verifique sua conexão com internet
3. Tente usar o período "Todos"
4. Contate o suporte se persistir

