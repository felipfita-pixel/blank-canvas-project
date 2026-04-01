

## Plano: Chat Avançado — Atribuição, Status Online, Notificações e Histórico

### Resumo

Implementar sistema de atribuição de conversas ("Assumir"), status online do corretor, indicador de digitação, notificação sonora e página dedicada de histórico de chat no admin.

---

### 1. Migração SQL — Novos campos e tabela de presença

**Tabela `chat_messages`** — adicionar coluna `claimed_by`:
```sql
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id);
```
Isso permite marcar qual corretor "assumiu" a conversa. A atribuição é por `conversation_id` — quando um corretor assume, todas as mensagens futuras daquele `conversation_id` são associadas a ele.

**Nova tabela `broker_presence`** — rastrear status online:
```sql
CREATE TABLE public.broker_presence (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  is_typing_conversation text DEFAULT ''
);
ALTER TABLE public.broker_presence ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver presença (para mostrar status ao cliente)
CREATE POLICY "Anyone can read presence" ON public.broker_presence FOR SELECT TO public USING (true);
-- Corretor/admin pode atualizar própria presença
CREATE POLICY "Users update own presence" ON public.broker_presence FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own presence" ON public.broker_presence FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

**Publicar `broker_presence` no realtime**:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE broker_presence;
```

---

### 2. `src/hooks/useBrokerPresence.ts` — Hook de presença

- No mount, fazer `upsert` em `broker_presence` com `is_online: true`
- Heartbeat a cada 30s atualizando `last_seen_at`
- No unmount / `beforeunload`, marcar `is_online: false`
- Exportar função `setTyping(conversationId)` que atualiza `is_typing_conversation`

---

### 3. `src/components/BrokerChatPanel.tsx` — Botão "Assumir" e melhorias

**Atribuição de conversa:**
- Conversas sem `claimed_by` aparecem para todos os corretores com badge "Nova"
- Ao clicar em uma conversa não assumida, mostrar botão **"Assumir Conversa"** no topo
- Ao assumir: `UPDATE chat_messages SET claimed_by = user_id WHERE conversation_id = X`
- Conversas já assumidas por outro corretor ficam ocultas (exceto para admin)
- Admin pode ver todas e tem botão "Reatribuir" para mudar o dono

**Indicador de digitação:**
- Usar hook `useBrokerPresence` para atualizar `is_typing_conversation` ao digitar
- Mostrar "Cliente digitando..." usando realtime subscription na `broker_presence` (no futuro, adicionar presença do cliente também)

**Notificação sonora:**
- Tocar um som curto (`/notification.mp3`) quando chega mensagem nova de cliente
- Usar `Audio` API nativa do browser

**Status online dos corretores:**
- Na lista de conversas, mostrar bolinha verde/cinza ao lado do nome do corretor atribuído

---

### 4. `src/components/ChatWidget.tsx` — Status online para cliente

- Ao abrir o chat, consultar `broker_presence` para verificar se há corretores online
- Mostrar indicador "🟢 Corretores online" ou "⚪ Corretores offline" no header do chat
- Mostrar "Corretor está digitando..." quando `is_typing_conversation` bate com o `conversationId`

---

### 5. `src/pages/admin/AdminChatHistory.tsx` — Página de histórico no admin

Nova página com:
- Lista de todas as conversas com filtros: por corretor, data, status (ativa/encerrada)
- Busca por nome/email do cliente
- Visualização completa do histórico de cada conversa
- Indicação de qual corretor atendeu

---

### 6. Rota e navegação

**`src/App.tsx`**: Adicionar rota `/admin/chat` com `AdminChatHistory`

**`src/components/AdminLayout.tsx`**: Adicionar item "Chat ao Vivo" no menu lateral com ícone `MessageSquare`

---

### 7. Arquivo de áudio

Adicionar `public/notification.mp3` — um som curto de notificação (gerar via script ou usar som padrão do sistema)

---

### Arquivos modificados/criados

| Arquivo | Ação |
|---|---|
| Migração SQL | Criar (claimed_by + broker_presence) |
| `src/hooks/useBrokerPresence.ts` | Criar |
| `src/components/BrokerChatPanel.tsx` | Modificar (assumir, som, typing) |
| `src/components/ChatWidget.tsx` | Modificar (status online, typing) |
| `src/pages/admin/AdminChatHistory.tsx` | Criar |
| `src/App.tsx` | Adicionar rota /admin/chat |
| `src/components/AdminLayout.tsx` | Adicionar menu "Chat ao Vivo" |
| `public/notification.mp3` | Criar |

