

## Plano: Remover cards com foto quebrada/vazia

### O que será feito
Remover do catálogo estático todos os imóveis que possuem imagens vazias (`images: [""]` ou `images: []`), eliminando cards com fotos quebradas do grid.

### Alteração

**`src/data/staticProperties.ts`**:
- Remover a entrada na linha 3564 (`pat-apartamento-apartamento-padr-o-181`, CO510511) que possui `images: [""]`
- Buscar e remover qualquer outra entrada com imagens vazias ou inválidas

**`src/components/AboutSection.tsx`** (linha 382):
- Adicionar validação para filtrar propriedades com imagens vazias/inválidas antes de renderizar, como camada de proteção adicional:
  ```
  const validProperties = filteredProperties.filter(p => p.images?.some(img => img && img.trim() !== ""));
  ```

Isso garante que mesmo dados futuros do banco de dados sem imagem válida não exibam cards quebrados.

