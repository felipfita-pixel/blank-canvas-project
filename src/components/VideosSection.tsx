import { useSiteContent } from "@/hooks/useSiteContent";
import { Youtube } from "lucide-react";
import { motion } from "framer-motion";

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?#]+)/);
  return match ? match[1] : null;
};

const VideosSection = () => {
  const { get } = useSiteContent();
  const section = get("videos");
  const videos: { title: string; url: string }[] = section.content.items || [];

  if (!videos.length) return null;

  return (
    <section id="videos" className="py-20 bg-muted/30">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Youtube className="w-7 h-7 text-destructive" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {section.title}
            </h2>
          </div>
          {section.subtitle && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>
          )}
        </motion.div>

        <div className={`grid gap-6 ${videos.length === 1 ? "max-w-3xl mx-auto" : "md:grid-cols-2 lg:grid-cols-3"}`}>
          {videos.map((video, i) => {
            const videoId = getYouTubeId(video.url);
            if (!videoId) return null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-xl overflow-hidden border border-border shadow-sm"
              >
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={video.title || "Vídeo"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
                {video.title && (
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-foreground text-sm">{video.title}</h3>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VideosSection;
