import { motion } from "framer-motion";
import heroImg from "@/assets/anunciar-hero.jpg";

const AnunciarHero = () => (
  <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 bg-background">
    <div className="container-main px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Venda seu imóvel muito mais rápido conosco.
          </h1>
          <p className="mt-5 text-muted-foreground font-body text-base sm:text-lg leading-relaxed max-w-lg">
            Seu imóvel será avaliado por especialistas e gratuitamente divulgado nos principais
            portais imobiliários e todas as redes sociais. Tudo de forma simples, com total
            segurança e 100% digital.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <img
            src={heroImg}
            alt="Casal feliz em apartamento moderno"
            className="rounded-2xl shadow-xl w-full max-w-md lg:max-w-lg object-cover"
            width={800}
            height={600}
            loading="lazy"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

export default AnunciarHero;
