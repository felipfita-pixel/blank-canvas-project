import { Home, FileText, Search } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const iconMap: Record<string, any> = { Home, FileText, Search };

const ServicesSection = () => {
  const { get } = useSiteContent();
  const section = get("services");
  const items = section.content.items || [];

  return (
    <section id="services" className="section-padding bg-cream">
      <div className="container-main text-center">
        <h2 className="text-3xl font-heading font-bold text-primary mb-10 italic">{section.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
          {items.map((s: any, i: number) => {
            const Icon = iconMap[s.icon] || Home;
            return (
              <div key={i} className="bg-card rounded-xl p-8 shadow-md border border-border hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
