import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchAutocomplete from "@/components/SearchAutocomplete";

const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  penthouse: "Cobertura",
  commercial: "Comercial",
  land: "Terreno",
};

interface SearchFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterTransaction: string;
  onFilterTransactionChange: (value: string) => void;
  filterNeighborhood: string;
  onFilterNeighborhoodChange: (value: string) => void;
  filterBedrooms: string;
  onFilterBedroomsChange: (value: string) => void;
  filterPrice: string;
  onFilterPriceChange: (value: string) => void;
  filterState?: string;
  onFilterStateChange?: (value: string) => void;
  filterCity?: string;
  onFilterCityChange?: (value: string) => void;
  filterCondo?: string;
  onFilterCondoChange?: (value: string) => void;
  filterDeveloper?: string;
  onFilterDeveloperChange?: (value: string) => void;
  filterStatus?: string;
  onFilterStatusChange?: (value: string) => void;
  neighborhoods: string[];
  cities?: string[];
  states?: string[];
  propertyTitles?: string[];
  typeOptions?: string[];
  developers?: string[];
  hideSearch?: boolean;
  className?: string;
}

const SearchFilters = ({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterTransaction,
  onFilterTransactionChange,
  filterNeighborhood,
  onFilterNeighborhoodChange,
  filterBedrooms,
  onFilterBedroomsChange,
  filterPrice,
  onFilterPriceChange,
  filterState,
  onFilterStateChange,
  filterCity,
  onFilterCityChange,
  filterCondo,
  onFilterCondoChange,
  filterDeveloper,
  onFilterDeveloperChange,
  filterStatus,
  onFilterStatusChange,
  neighborhoods,
  cities = [],
  states = [],
  propertyTitles = [],
  typeOptions,
  developers = [],
  hideSearch = false,
  className = "",
}: SearchFiltersProps) => {
  const types = typeOptions || ["apartment", "house", "penthouse", "commercial", "land"];
  const showLocationFilters = states.length > 0 || cities.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search input row with autocomplete */}
      {!hideSearch && (
        <SearchAutocomplete
          value={search}
          onChange={onSearchChange}
          neighborhoods={neighborhoods}
          cities={cities}
          propertyTitles={propertyTitles}
        />
      )}

      {/* Filter dropdowns row */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3`}>
        {/* State filter */}
        {showLocationFilters && onFilterStateChange && (
          <Select value={filterState || "all"} onValueChange={onFilterStateChange}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              {states.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* City filter */}
        {showLocationFilters && onFilterCityChange && (
          <Select value={filterCity || "all"} onValueChange={onFilterCityChange}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={filterType} onValueChange={onFilterTypeChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {propertyTypeLabels[t] ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTransaction} onValueChange={onFilterTransactionChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Venda e Aluguel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Venda e Aluguel</SelectItem>
            <SelectItem value="sale">Venda</SelectItem>
            <SelectItem value="rent">Aluguel</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterNeighborhood} onValueChange={onFilterNeighborhoodChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Todos os bairros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os bairros</SelectItem>
            {neighborhoods.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterBedrooms} onValueChange={onFilterBedroomsChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Todos os quartos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os quartos</SelectItem>
            <SelectItem value="1">1 quarto</SelectItem>
            <SelectItem value="2">2 quartos</SelectItem>
            <SelectItem value="3">3 quartos</SelectItem>
            <SelectItem value="4">4+ quartos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPrice} onValueChange={onFilterPriceChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Qualquer preço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer preço</SelectItem>
            <SelectItem value="500000">Até R$ 500 mil</SelectItem>
            <SelectItem value="1000000">Até R$ 1 milhão</SelectItem>
            <SelectItem value="2000000">Até R$ 2 milhões</SelectItem>
            <SelectItem value="5000000">Até R$ 5 milhões</SelectItem>
            <SelectItem value="above">Acima de R$ 5 milhões</SelectItem>
          </SelectContent>
        </Select>

        {/* Condo filter */}
        <Select value={filterCondo || "all"} onValueChange={onFilterCondoChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Condomínio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer condomínio</SelectItem>
            <SelectItem value="500">Até R$ 500</SelectItem>
            <SelectItem value="1000">Até R$ 1.000</SelectItem>
            <SelectItem value="2000">Até R$ 2.000</SelectItem>
            <SelectItem value="above">Acima de R$ 2.000</SelectItem>
          </SelectContent>
        </Select>

        {/* Developer filter */}
        <Select value={filterDeveloper || "all"} onValueChange={onFilterDeveloperChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Construtora" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as construtoras</SelectItem>
            {developers.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select value={filterStatus || "all"} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ready">Pronto</SelectItem>
            <SelectItem value="construction">Em Construção</SelectItem>
            <SelectItem value="launch">Lançamento</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export { propertyTypeLabels };
export default SearchFilters;
