export interface StaticProperty {
  id: string;
  title: string;
  description: string;
  property_type: string;
  transaction_type: string;
  neighborhood: string;
  address: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  area: number;
  price: number;
  images: string[];
}

export const staticProperties: StaticProperty[] = [
  {
    id: "static-be-in-rio",
    title: "Be in Rio Praia Copacabana",
    description:
      "Be in Rio Praia Copacabana: Seu Studio ou Double Suíte no Coração da Praia!\n\nDescubra o Be in Rio Praia Copacabana, um lançamento exclusivo no vibrante bairro de Copacabana, Rio de Janeiro. Escolha entre Studios modernos e Double Suítes espaçosas, com metragens que variam de 37m² a 153m², projetados para o seu estilo de vida. Desfrute do conforto de 1 a 2 banheiros e personalize seu espaço.",
    property_type: "apartment",
    transaction_type: "sale",
    neighborhood: "Copacabana",
    address: "Rua Siqueira Campos 37",
    city: "Rio de Janeiro",
    state: "RJ",
    bedrooms: 2,
    bathrooms: 2,
    parking_spots: 0,
    area: 153,
    price: 0,
    images: [
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-19.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-33-768x425.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-34-768x499.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-35-768x499.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-36-768x420.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-37-768x499.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-38-768x499.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-20-768x499.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-21-768x306.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-22-768x499.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-23-768x499.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-24.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-25-768x577.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-26-768x178.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-27-768x383.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-28-768x499.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-29-768x577.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-30-768x218.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-31-768x214.jpg",
      "https://nairaleiteimoveis.com.br/wp-content/uploads/2025/12/foto-32-768x616.jpg",
    ],
  },
];

export const getStaticProperty = (id: string) =>
  staticProperties.find((p) => p.id === id);
