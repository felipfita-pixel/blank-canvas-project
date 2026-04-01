

## Diagnóstico: Por que os botões flutuantes podem não aparecer

Encontrei **duas causas prováveis** no código atual:

### Problema 1: Animação `scale: 0` do Framer Motion
Os botões de WhatsApp e Chat usam `initial={{ scale: 0 }}` com `delay` de 1-1.2 segundos. Se o Framer Motion não executar a animação corretamente (ex: navegador antigo, dispositivo lento, ou o componente re-montar), os botões ficam **invisíveis** (escala zero) permanentemente.

### Problema 2: z-index insuficiente
Todos os elementos flutuantes (header, botões, painel) usam `z-50` (valor 50). Em alguns dispositivos/navegadores, elementos com mesmo z-index podem se sobrepor de forma imprevisível, escondendo os botões atrás de outras camadas fixas.

### Problema 3: Botão do Painel de Atendimento separado
O botão do `BrokerChatPanel` está posicionado em `right-40` com `z-50`, separado do grupo de botões do `ChatWidget`. Se o container do ChatWidget está com `!open` false, os botões somem, mas o do painel fica sozinho e pode ficar atrás de outros elementos.

---

## Plano de Correção

### 1. Remover `initial={{ scale: 0 }}` dos botões flutuantes
Substituir por `initial={{ opacity: 0 }}` / `animate={{ opacity: 1 }}` — garante que mesmo sem animação, os botões têm tamanho normal e ficam clicáveis.

### 2. Elevar z-index para `z-[9999]`
No container dos botões flutuantes do `ChatWidget` e no botão do `BrokerChatPanel`, usar `z-[9999]` para garantir que fiquem acima de qualquer outro elemento fixo.

### 3. Unificar posicionamento
Mover o botão do `BrokerChatPanel` para dentro do mesmo container dos botões do `ChatWidget`, garantindo que os 3 botões sempre apareçam juntos e com o mesmo z-index.

### Arquivos modificados
- `src/components/ChatWidget.tsx` — corrigir animações e z-index
- `src/components/BrokerChatPanel.tsx` — ajustar z-index do botão trigger

