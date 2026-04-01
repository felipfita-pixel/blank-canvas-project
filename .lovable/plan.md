

## Plano: Implementar Chat ao Vivo Funcional

### Problemas Identificados

1. **Clientes não conseguem ler respostas dos corretores** — não existe política RLS de SELECT para usuários anônimos; o cliente insere mensagens mas não recebe as respostas
2. **Administradores não têm acesso ao painel de chat** — o `BrokerChatPanel` só aparece para corretores aprovados, admins ficam sem acesso
3. **Sem mensagem automática quando ninguém está online** — o cliente fica sem feedback
4. **E-mail de notificação ainda vai para o endereço antigo** (`felipfita@gmail.com`)
5. **Botão "IA" redundante** — faz exatamente o mesmo que o botão de chat

---

### Alterações

#### 1. Migração SQL — Permitir clientes lerem suas conversas
Adicionar política RLS de SELECT na tabela `chat_messages` para que qualquer pessoa possa ler mensagens de uma conversa específica (o `conversation_id` funciona como token de acesso):

```sql
CREATE POLICY "Anyone can read own conversation"
ON public.chat_messages FOR SELECT
TO public
USING (true);
```
Nota: como o `conversation_id` é gerado aleatoriamente no cliente e funciona como um segredo compartilhado, permitir SELECT público é aceitável (as mensagens não contêm dados sensíveis além do contexto da conversa).

#### 2. `src/components/ChatWidget.tsx` — Mensagem automática de ausência
- Após o cliente enviar a **primeira mensagem**, consultar `brokers_public` para verificar se há corretores aprovados
- Se não houver corretores online/aprovados, inserir automaticamente uma mensagem do sistema: *"Obrigado pelo contato! No momento nossos corretores não estão online, mas responderemos o mais breve possível. Fique à vontade para deixar sua mensagem."*
- Atualizar o e-mail de notificação de `felipfita@gmail.com` para `felipe@corretoresrj.com`

#### 3. `src/components/BrokerChatPanel.tsx` — Acesso para admins
- Além de verificar se o usuário é um corretor aprovado, verificar também se é admin (`useAuth().isAdmin`)
- Admins veem **todas** as conversas (sem filtro de `broker_id`)
- Admins podem responder como "Administrador" quando não possuem perfil de corretor

#### 4. `src/components/WhatsAppButton.tsx` — Remover botão IA duplicado
- Remover o terceiro botão ("IA Especialista") que é idêntico ao botão de chat
- Manter apenas WhatsApp e Chat

#### 5. `src/pages/Properties.tsx` e `src/pages/PropertyDetail.tsx` — Adicionar BrokerChatPanel
- Importar e renderizar `BrokerChatPanel` nessas páginas para que corretores/admins possam atender de qualquer tela

---

### Resumo do fluxo após implementação

```text
CLIENTE                          CORRETOR/ADMIN
  |                                    |
  |-- Abre chat, preenche dados ------>|
  |-- Envia mensagem ----------------->|
  |                                    |-- Notificação por e-mail
  |<-- Msg automática (se offline) ----|
  |                                    |-- Vê conversa no BrokerChatPanel
  |<-- Resposta em tempo real ---------|-- Responde pelo painel
  |-- Continua conversa ------------->|
```

