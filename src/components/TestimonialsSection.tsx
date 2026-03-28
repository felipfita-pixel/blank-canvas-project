import { Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const TestimonialsSection = () => {
  const { get } = useSiteContent();
  const section = get("testimonials");
  const items = section.content.items || [];

  return (
    <section className="section-padding">
      <div className="container-main text-center">
        <h2 className="text-3xl font-heading font-bold text-primary mb-10 italic">{section.title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {items.map((t: any, i: number) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-md border border-border text-left">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {t.name?.[0] || "?"}
                </div>
                <span className="font-semibold text-sm text-foreground">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
