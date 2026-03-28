import { MapPin, Phone, Mail } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const COMPANY_LINKS: { name: string; url: string }[] = [
  { name: "Patrimóvel", url: "https://www.patrimar.com.br" },
  { name: "Somma Rio", url: "https://www.patrimar.com.br" },
  { name: "Patrimar", url: "https://www.patrimar.com.br" },
];

const WhereWeOperate = () => {
  const { get } = useSiteContent();
  const section = get("where_we_operate");
  const c = section.content;

  return (
    <section className="section-padding bg-cream">
      <div className="container-main">
        <h2 className="text-3xl font-heading font-bold text-primary mb-8 italic">{section.title}</h2>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <p className="text-muted-foreground mb-6 leading-relaxed">{c.description}</p>
            <div className="space-y-4">
              {[
                { icon: MapPin, text: c.locations },
                { icon: Phone, text: c.phone },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <a href="mailto:felipfita@gmail.com" className="text-sm text-foreground hover:text-secondary transition-colors underline">
                  contato@corretoresassociados.com.br
                </a>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {COMPANY_LINKS.map((company) => (
                <a
                  key={company.name}
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-wider hover:bg-navy-light transition-colors"
                >
                  {company.name.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
          <div className="bg-muted rounded-xl h-64 lg:h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Mapa da região</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhereWeOperate;
