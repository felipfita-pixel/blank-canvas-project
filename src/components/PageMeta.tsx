import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageMetaProps {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const BASE_URL = "https://corretoresrj.com";

const PageMeta = ({ 
  title, 
  description, 
  path = "", 
  keywords, 
  ogTitle, 
  ogDescription,
  ogImage,
  noIndex = false
}: PageMetaProps) => {
  const location = useLocation();
  const currentPath = path || location.pathname;

  useEffect(() => {
    // Default values if not provided
    const finalTitle = title || "Corretores Associados & FF | Imóveis RJ";
    const finalDescription = description || "Especialistas em imóveis prontos e lançamentos no Rio de Janeiro.";
    
    document.title = finalTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", finalDescription);
    setMeta("name", "keywords", keywords || "");
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    
    // Open Graph
    setMeta("property", "og:title", ogTitle || finalTitle);
    setMeta("property", "og:description", ogDescription || finalDescription);
    setMeta("property", "og:url", `${BASE_URL}${currentPath}`);
    setMeta("property", "og:type", "website");
    if (ogImage) setMeta("property", "og:image", ogImage);

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", ogTitle || finalTitle);
    setMeta("name", "twitter:description", ogDescription || finalDescription);
    if (ogImage) setMeta("name", "twitter:image", ogImage);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${currentPath}`;
  }, [title, description, currentPath, keywords, ogTitle, ogDescription, ogImage, noIndex]);

  return null;
};

export default PageMeta;
