import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnunciarHero from "@/components/AnunciarHero";
import AnunciarForm from "@/components/AnunciarForm";
import PageMeta from "@/components/PageMeta";

const AnunciarImovel = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <PageMeta
      title="Anunciar Imóvel Grátis | Corretores Associados & FF"
      description="Anuncie seu imóvel gratuitamente nos principais portais imobiliários. Avaliação por especialistas, divulgação ampla e atendimento 100% digital."
      path="/anunciar-imovel"
    />
    <Header />
    <AnunciarHero />
    <AnunciarForm />
    <Footer />
  </div>
);

export default AnunciarImovel;
