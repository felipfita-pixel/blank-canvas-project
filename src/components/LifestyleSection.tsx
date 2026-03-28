import { useSiteContent } from "@/hooks/useSiteContent";
import luxuryInteriorFallback from "@/assets/luxury-interior.jpg";

const LifestyleSection = () => {
  const { get } = useSiteContent();
  const lifestyle = get("lifestyle");
  const image = lifestyle.content.image || luxuryInteriorFallback;

  return (
    <section id="lifestyle" className="section-padding">
      <div className="container-main text-center">
        <h2 className="text-3xl font-heading font-bold text-primary mb-8 italic">{lifestyle.title}</h2>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
          <img src={image} alt="Interior de luxo" className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover" loading="lazy" width={1280} height={720} />
          <div className="absolute bottom-4 left-4 flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i === 1 ? "bg-secondary" : "bg-primary-foreground/50"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
