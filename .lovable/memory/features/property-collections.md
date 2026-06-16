---
name: Property Collections (Pastas)
description: Pastas customizadas no Admin com drag-and-drop para organizar imóveis e definir ordem dos Destaques na home
type: feature
---
Admin (`/admin/properties`) tem o componente `PropertyCollectionsManager` que gerencia pastas (tabela `property_collections`) e itens (`property_collection_items`, `property_id` é texto para suportar tanto UUIDs do DB quanto IDs de `staticProperties`).

- Drag header da pasta para reordenar pastas.
- Drag de card de imóvel entre/dentro de pastas.
- Botão "Adicionar imóvel" abre picker com busca filtrando "Não atribuídos".
- Posições são persistidas por `UPDATE position` em batch.

`FeaturedProperties` na home consulta as pastas: se existir alguma, monta a lista na ordem (pasta1.itens → pasta2.itens → ... → demais featured). Sem pastas, fallback para ordem `created_at desc` filtrando `featured=true`.

RLS: leitura pública, escrita só admin (`has_role`).
