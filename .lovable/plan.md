

## Plano: Remover botão flutuante do Painel de Atendimento

O primeiro ícone laranja (com balão quadrado) é o botão do `BrokerChatPanel` que redireciona para login quando clicado por visitantes não autenticados. Vamos removê-lo da interface pública.

### Alteração

**Arquivo: `src/components/BrokerChatPanel.tsx`**
- Remover o botão flutuante (linhas 300-314) que aparece para todos os visitantes
- Manter o painel de atendimento funcional — corretores/admins poderão acessá-lo por outra via (ex: menu admin)
- O botão de WhatsApp (verde) e o botão de Chat (laranja do ChatWidget) continuarão visíveis normalmente

